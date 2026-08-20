import { useState } from 'react';
import { Word, Settings } from '../types';
import { VOCAB, ICONS, LEVELS } from '../data/vocab';
import { speak } from '../utils/audio';

interface FlashcardViewProps {
  topicName: string;
  settings: Settings;
  onBack: () => void;
  onToggleBookmark: (word: Word) => void;
  isBookmarked: (wordStr: string) => boolean;
  onStartQuiz: (mode: string) => void;
  level?: number;
  onFinishFlashcards?: (pct: number, correct: number, total: number) => void;
}

export default function FlashcardView({
  topicName,
  settings,
  onBack,
  onToggleBookmark,
  isBookmarked,
  onStartQuiz,
  level,
  onFinishFlashcards,
}: FlashcardViewProps) {
  const t = (en: string, de: string) => (settings.lang === 'de' ? de : en);

  // Load the flashcards dynamically
  const [words, setWords] = useState<Word[]>(() => {
    let vocabSrc: Word[] = [];
    if (topicName.startsWith('Level ')) {
      const levelNum = parseInt(topicName.replace('Level ', ''));
      const lvlConfig = LEVELS[levelNum - 1];
      if (lvlConfig) {
        lvlConfig.topics.forEach((t) => {
          vocabSrc = [...vocabSrc, ...(VOCAB[t] || [])];
        });
      }
    } else {
      vocabSrc = VOCAB[topicName] || [];
    }
    if (level) {
      const wordsCount = vocabSrc.length;
      const wordsPerLevel = Math.max(1, Math.ceil(wordsCount / 10));
      const startIndex = (level - 1) * wordsPerLevel;
      const endIndex = Math.min(wordsCount, level * wordsPerLevel);
      vocabSrc = vocabSrc.slice(startIndex, endIndex);
    }
    return [...vocabSrc].sort(() => Math.random() - 0.5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Trailing logs for custom progress
  const [known, setKnown] = useState<Word[]>([]);
  const [learning, setLearning] = useState<Word[]>([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const total = words.length;
  const currentWord = words[currentIndex] || null;

  const handleCardClick = () => {
    const flipState = !isFlipped;
    setIsFlipped(flipState);
    if (flipState && currentWord) {
      speak(currentWord.g, settings.ttsOn);
    }
  };

  const handleProgress = (isKnown: boolean) => {
    if (!currentWord) return;

    if (isKnown) {
      setKnown((prev) => [...prev, currentWord]);
    } else {
      setLearning((prev) => [...prev, currentWord]);
    }

    if (currentIndex + 1 >= total) {
      const nextKnownCount = known.length + (isKnown ? 1 : 0);
      const pct = Math.round((nextKnownCount / total) * 100);
      onFinishFlashcards?.(pct, nextKnownCount, total);
      setSessionCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const restartSession = (onlyUnknowns: boolean = false) => {
    const nextArr = onlyUnknowns ? [...learning] : [...words];
    if (nextArr.length === 0) return;

    setWords(nextArr.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown([]);
    setLearning([]);
    setSessionCompleted(false);
  };

  // Component render fallback if session finishes
  if (sessionCompleted) {
    const doneCount = known.length;
    const learnCount = learning.length;
    const progressPct = Math.round((doneCount / (doneCount + learnCount || 1)) * 100);

    return (
      <div className="pb-24">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold transition hover:bg-slate-700 active:scale-95"
            type="button"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-extrabold">{t('Flashcards Complete', 'Lernsitzung beendet')}</h2>
          </div>
        </div>

        <div className="mx-auto max-w-md p-6 text-center">
          <div className="text-sm font-extrabold tracking-widest text-slate-400 uppercase mb-2">
            {topicName}
          </div>
          <div className="text-6xl font-black text-slate-800 dark:text-white tracking-tight">
            {progressPct}%
          </div>
          <div className="text-base font-semibold text-slate-500 dark:text-slate-400 mt-2">
            {progressPct >= 85 ? t('Legendary progress! 🌟', 'Exzellente Arbeit! 🌟') : progressPct >= 65 ? t('Nice job! keeping practicing 👍', 'Sehr gut! Weiterüben 👍') : t('Keep reviewing to build confidence! 💪', 'Bleib dran und wiederhole die Wörter! 💪')}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-900/30">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{doneCount}</div>
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wide mt-1 uppercase">{t('Known', 'Bekannt')}</div>
            </div>
            <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-100 dark:border-rose-900/30">
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{learnCount}</div>
              <div className="text-[11px] font-bold text-rose-700 dark:text-rose-400 tracking-wide mt-1 uppercase">{t('Still Learning', 'Lernend')}</div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            {learnCount > 0 && (
              <button
                onClick={() => restartSession(true)}
                className="w-full rounded-xl bg-indigo-650 py-3.5 text-center text-sm font-bold text-white transition hover:bg-indigo-700 active:scale-98"
                type="button"
              >
                🔁 {t(`Review Learning Words (${learnCount})`, `Lernende Wörter wiederholen (${learnCount})`)}
              </button>
            )}
            <button
              onClick={() => restartSession(false)}
              className="w-full rounded-xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-98"
              type="button"
            >
              🔄 {t('Restart Full Deck', 'Gesamte Karten wiederholen')}
            </button>
            <button
              onClick={() => {
                onBack();
                setTimeout(() => onStartQuiz('meaning'), 150);
              }}
              className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-center text-sm font-bold text-gray-700 hover:bg-gray-50 transition active:scale-98 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:hover:bg-slate-850"
              type="button"
            >
              📝 {t('Take Meanings Quiz', 'Bedeutungstest machen')}
            </button>
            <button
              onClick={onBack}
              className="w-full rounded-xl bg-gray-100 py-3.5 text-center text-xs font-semibold text-gray-500 hover:bg-gray-200 transition dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-750"
              type="button"
            >
              🏠All Modes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Title Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold transition hover:bg-slate-700 active:scale-95"
            type="button"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-extrabold flex items-center gap-1.5 leading-none">
              <span>🃏</span> {t('Flashcards', 'Karteikarten')}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold text-emerald-400">
              {topicName}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-300">
          {currentIndex + 1}/{total}
        </div>
      </div>

      <div className="p-5 select-none">
        {/* Progress summary label */}
        <div className="text-center text-xs text-gray-400 dark:text-slate-450 font-bold mb-3 uppercase tracking-wider">
          {Math.round((currentIndex / total) * 100)}% {t('reviewed • ', 'gelernt • ')}
          <span className="text-emerald-500">{known.length} {t('known', 'gewußt')}</span> •{' '}
          <span className="text-rose-500">{learning.length} {t('to-study', 'unbekannt')}</span>
        </div>

        {/* Beautiful rotative flashcard container holds back/front layout details */}
        {currentWord && (
          <div>
            <div className="fc-scene h-[230px] w-full" onClick={handleCardClick}>
              <div className={`fc-card w-full h-full relative cursor-pointer ${isFlipped ? 'flipped' : ''}`}>
                {/* CARD FRONT face */}
                <div className="fc-front rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-850 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">German</span>
                  <h3 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white mt-4 word-break break-words">
                    {currentWord.g}
                  </h3>

                  {/* Gender color indicators */}
                  <div className="mt-4 flex gap-1 text-[11px] font-extrabold uppercase">
                    {currentWord.g.startsWith('der ') && <span className="rounded-full bg-blue-105/70 text-blue-700 px-3 py-0.5 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200/20">der</span>}
                    {currentWord.g.startsWith('die ') && <span className="rounded-full bg-pink-105/75 text-pink-700 px-3 py-0.5 dark:bg-pink-950/30 dark:text-pink-300 border border-pink-200/20">die</span>}
                    {currentWord.g.startsWith('das ') && <span className="rounded-full bg-emerald-105/70 text-emerald-700 px-3 py-0.5 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-950/20">das</span>}
                    <span className="text-gray-400 px-3 py-0.5 lowercase italic font-medium">{currentWord.t === 'n' ? 'noun' : currentWord.t === 'v' ? 'verb' : 'adjective'}</span>
                  </div>

                  <div className="mt-auto text-[10px] font-extrabold text-blue-500/80 dark:text-slate-450 uppercase animate-pulse">
                    {t('Tap Card to Reveal →', 'Tippen zum Aufdecken →')}
                  </div>
                </div>

                {/* CARD BACK face */}
                <div className="fc-back rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl dark:bg-slate-950 dark:border-slate-850 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Meaning (English)</span>
                  <h3 className="text-2xl font-black text-white mt-1 capitalize leading-snug">
                    {currentWord.e}
                  </h3>
                  <div className="text-xs text-slate-400 font-bold tracking-tight lowercase min-h-5 mt-1 select-all font-mono">
                    {currentWord.g}
                  </div>

                  <div className="mt-auto text-[9.5px] font-bold text-slate-450 uppercase">
                    {t('Spoken Audio Synthesized', 'Audio vorgelesen')}
                  </div>
                </div>
              </div>
            </div>

            {/* Micro buttons panel */}
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => speak(currentWord.g, true)}
                className="flex items-center gap-1 text-xs font-black bg-white rounded-xl border border-gray-150 px-4 py-2 hover:bg-gray-50 active:scale-95 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                type="button"
              >
                🔊 {t('Hear Again', 'Hören')}
              </button>
              <button
                onClick={() => onToggleBookmark(currentWord)}
                className="flex items-center gap-1 text-xs font-black bg-white rounded-xl border border-gray-150 px-4 py-2 hover:bg-gray-50 active:scale-95 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
                type="button"
              >
                {isBookmarked(currentWord.g) ? '🔖 ' + t('Saved', 'Gemerkt') : '🏷️ ' + t('Save', 'Merken')}
              </button>
            </div>

            {/* Flashcard Action controllers */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => handleProgress(false)}
                disabled={!isFlipped}
                className={`flex-1 rounded-2xl border py-4 text-center text-sm font-extrabold transition duration-150 ${
                  isFlipped
                    ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-950/40 dark:bg-rose-950/25 dark:text-rose-300 active:scale-97 cursor-pointer'
                    : 'opacity-40 border-gray-100 bg-gray-50 text-gray-300 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-650 cursor-default'
                }`}
                type="button"
              >
                👎 {t('Still Learning', 'Noch lernen')}
              </button>
              <button
                onClick={() => handleProgress(true)}
                disabled={!isFlipped}
                className={`flex-1 rounded-2xl border py-4 text-center text-sm font-extrabold transition duration-150 ${
                  isFlipped
                    ? 'border-emerald-250 bg-emerald-50 text-emerald-700 dark:border-emerald-950/40 dark:bg-emerald-950/25 dark:text-emerald-350 active:scale-97 cursor-pointer'
                    : 'opacity-40 border-gray-100 bg-gray-50 text-gray-300 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-650 cursor-default'
                }`}
                type="button"
              >
                👍 {t('Got It!', 'Kenne ich!')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
