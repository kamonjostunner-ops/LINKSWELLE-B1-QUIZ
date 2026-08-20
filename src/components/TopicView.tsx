import { useState } from 'react';
import { Word, Settings, QuizProgress } from '../types';
import { VOCAB, ICONS, CLS, LEVELS } from '../data/vocab';
import { SENTENCE_EXERCISES } from '../data/sentenceExercises';

interface TopicViewProps {
  settings: Settings;
  topicName: string;
  progress: QuizProgress;
  onBack: () => void;
  onStartQuiz: (mode: string) => void;
  onStartFlashcards: (level?: number) => void;
}

const MODEDESCS: Record<string, string> = {
  all: 'Mixed questions, double length',
  meaning: 'See German, pick English translation',
  article: 'See noun, choose der / die / das',
  verb: 'Focus purely on B1 verb definitions',
  adjective: 'Learn and quiz adjectives',
  speed: 'Rapid-fire test with 15s speed timer',
  write: 'Type the meaning (hard mode)',
  listen: 'Listen to spoken word, pick meaning',
  flashcard: 'Card flipping revision system',
  sentence: 'Translate contextual German sentences',
};

export default function TopicView({
  settings,
  topicName,
  progress,
  onBack,
  onStartQuiz,
  onStartFlashcards,
}: TopicViewProps) {
  const currentLang = settings.lang;
  const t = (en: string, de: string) => (currentLang === 'de' ? de : en);

  let vocabList: Word[] = [];
  let nameDisp = topicName;
  let icon = '📝';
  let colorsText = 'bg-slate-50 text-slate-705';

  if (topicName.startsWith('Level ')) {
    const levelNum = parseInt(topicName.replace('Level ', ''));
    const lvlConfig = LEVELS[levelNum - 1];
    if (lvlConfig) {
      nameDisp = currentLang === 'de' ? lvlConfig.nameDe : lvlConfig.nameEn;
      icon = lvlConfig.id === 'l1' ? '🟢' : lvlConfig.id === 'l2' ? '💡' : '🏆';
      colorsText = lvlConfig.id === 'l1' ? 'bg-emerald-50 text-emerald-700' : lvlConfig.id === 'l2' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700';
      lvlConfig.topics.forEach((t) => {
        vocabList = [...vocabList, ...(VOCAB[t] || [])];
      });
    }
  } else {
    const idx = Object.keys(VOCAB).indexOf(topicName);
    colorsText = CLS[idx % CLS.length] || 'bg-slate-50 text-slate-705';
    icon = ICONS[topicName] || '📝';
    vocabList = VOCAB[topicName] || [];
  }

  let topicSentencesList: any[] = [];
  if (topicName.startsWith('Level ')) {
    const levelNum = parseInt(topicName.replace('Level ', ''));
    const lvlConfig = LEVELS[levelNum - 1];
    if (lvlConfig) {
      lvlConfig.topics.forEach((t) => {
        topicSentencesList = [...topicSentencesList, ...(SENTENCE_EXERCISES[t] || [])];
      });
    }
  } else {
    topicSentencesList = SENTENCE_EXERCISES[topicName] || [];
  }

  const nounCount = vocabList.filter((w) => w.t === 'n' && /^(der|die|das) /i.test(w.g)).length;
  const verbCount = vocabList.filter((w) => w.t === 'v').length;
  const adjCount = vocabList.filter((w) => w.t === 'a').length;

  const [selectedModeForLevels, setSelectedModeForLevels] = useState<string | null>(null);

  // Word partitioning for the 10 levels within each topic
  const wordsCount = vocabList.length;
  const wordsPerLevel = Math.max(1, Math.ceil(wordsCount / 10));
  const numLevels = Math.min(10, Math.ceil(wordsCount / wordsPerLevel));

  // Helper to count compatible words in a list based on mode
  const getModeCountForList = (mode: string, list: Word[]) => {
    if (mode === 'article') {
      return list.filter((w) => w.t === 'n' && /^(der|die|das) /i.test(w.g)).length;
    }
    if (mode === 'verb') {
      return list.filter((w) => w.t === 'v').length;
    }
    if (mode === 'adjective') {
      return list.filter((w) => w.t === 'a').length;
    }
    if (mode === 'sentence') {
      const levelDeTerms = new Set(list.map(w => w.g.toLowerCase()));
      const filtered = topicSentencesList.filter(s =>
        s.wordsUsed.some(word => levelDeTerms.has(word.toLowerCase()) || list.some(w => w.g.toLowerCase().includes(word.toLowerCase())))
      );
      return filtered.length > 0 ? filtered.length * 2 : topicSentencesList.length * 2;
    }
    return list.length;
  };

  const isLevelUnlocked = (lvl: number, mode: string): boolean => {
    if (lvl === 1) return true;
    
    // Check all previous levels up to lvl - 1. If any has > 0 words and has not been completed, it's locked.
    for (let prev = 1; prev < lvl; prev++) {
      const prevStartIndex = (prev - 1) * wordsPerLevel;
      const prevEndIndex = Math.min(wordsCount, prev * wordsPerLevel);
      const prevLevelWords = vocabList.slice(prevStartIndex, prevEndIndex);
      const prevCount = getModeCountForList(mode, prevLevelWords);

      if (prevCount > 0) {
        const prevLevelProgress = progress[topicName]?.[`${mode}_level_${prev}`];
        if (!prevLevelProgress || prevLevelProgress.pct < 70) {
          return false;
        } 
      }
    }
    return true;
  };

  const getModeLabel = (mKey: string) => {
    const labels: Record<string, { en: string; de: string }> = {
      all: { en: 'Full Quiz', de: 'Kombitest' },
      meaning: { en: 'Meanings', de: 'Bedeutungen' },
      article: { en: 'Articles', de: 'Artikel' },
      verb: { en: 'Verbs', de: 'Verben' },
      adjective: { en: 'Adjectives', de: 'Adjektive' },
      speed: { en: 'Speed Round', de: 'Schnellrunde' },
      write: { en: 'Writing Practice', de: 'Schreibübung' },
      listen: { en: 'Listening Practice', de: 'Hörverständnis' },
      flashcard: { en: 'Flashcards', de: 'Karteikarten' },
      sentence: { en: 'Sentence Translation', de: 'Satzübersetzung' },
    };
    const obj = labels[mKey];
    if (!obj) return mKey;
    return settings.lang === 'de' ? obj.de : obj.en;
  };

  const topicProgress = progress[topicName] || {};

  const modes = [
    { key: 'all', icon: '🎯', name: t('Full Quiz', 'Kombitest'), desc: t(MODEDESCS.all, 'Alle Fragen gemischt'), count: vocabList.length * 2, disabled: vocabList.length === 0 },
    { key: 'meaning', icon: '🔤', name: t('Meanings', 'Bedeutungen'), desc: t(MODEDESCS.meaning, 'Deutsch → Englisch wählen'), count: vocabList.length, disabled: vocabList.length === 0 },
    { key: 'article', icon: '📌', name: t('Articles', 'Artikel'), desc: t(MODEDESCS.article, 'der / die / das bestimmen'), count: nounCount, disabled: nounCount === 0 },
    { key: 'verb', icon: '⚡', name: t('Verbs', 'Verben'), desc: t(MODEDESCS.verb, 'Verbbeteutungen üben'), count: verbCount, disabled: verbCount === 0 },
    { key: 'adjective', icon: '🎨', name: t('Adjectives', 'Adjektive'), desc: t(MODEDESCS.adjective, 'Adjektivbedeutungen quizzen'), count: adjCount, disabled: adjCount === 0 },
    { key: 'speed', icon: '⏱️', name: t('Speed Round', 'Schnellrunde'), desc: t(MODEDESCS.speed, '15 Sek. Hektik pro Frage'), count: 20, disabled: vocabList.length === 0 },
    { key: 'write', icon: '✍️', name: t('Writing', 'Schreibübung'), desc: t(MODEDESCS.write, 'Bedeutung selbst tippen'), count: 15, disabled: vocabList.length === 0 },
    { key: 'listen', icon: '👂', name: t('Listening', 'Hörverständnis'), desc: t(MODEDESCS.listen, 'Hören & Bedeutung wählen'), count: vocabList.length, disabled: vocabList.length === 0 },
    { key: 'sentence', icon: '🧩', name: t('Sentences', 'Satzübersetzung'), desc: t(MODEDESCS.sentence, 'Sätze interaktiv übersetzen'), count: topicSentencesList.length * 2, disabled: topicSentencesList.length === 0 },
    { key: 'flashcard', icon: '🃏', name: t('Flashcards', 'Karteikarten'), desc: t(MODEDESCS.flashcard, 'Karten flippen zum Lernen'), count: vocabList.length, isFC: true, disabled: vocabList.length === 0 },
  ];

  if (selectedModeForLevels) {
    const activeModeObj = modes.find((m) => m.key === selectedModeForLevels);
    const activeModeIcon = activeModeObj?.icon || '🎯';
    const activeModeName = activeModeObj?.name || 'Full Quiz';

    return (
      <div className="pb-24">
        {/* Level Selector Title Navbar */}
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => setSelectedModeForLevels(null)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold transition hover:bg-slate-700 active:scale-95"
            type="button"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-extrabold flex items-center gap-1.5 leading-none">
              <span>{activeModeIcon}</span> {activeModeName} • {t('Levels', 'Stufen')}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
              {topicName} • {numLevels} {t('Levels', 'Lernstufen')}
            </p>
          </div>
        </div>

        {/* Dashboard explanation text */}
        <div className="bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-850 p-5">
          <h3 className="text-sm font-black text-slate-800 dark:text-gray-100 uppercase tracking-wider mb-1.5">
            🏆 {t('UNROLL THE LEVEL LADDER', 'ABENTEUERSTUFEN MEISTERN')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            {t(
              'Complete each level with at least 70% accuracy to unlock the next level. Let the learning continue!',
              'Erreiche mindestens 70% in jeder Stufe, um die nächste freizuschalten. Viel Erfolg beim Lernen!'
            )}
          </p>
        </div>

        {/* Levels List */}
        <div className="p-4 space-y-3">
          {Array.from({ length: numLevels }, (_, i) => {
            const levelNum = i + 1;
            const unlocked = isLevelUnlocked(levelNum, selectedModeForLevels);
            
            const progressKey = `${selectedModeForLevels}_level_${levelNum}`;
            const levelProgress = progress[topicName]?.[progressKey];
            const pct = levelProgress?.pct || 0;

            const startIndex = (levelNum - 1) * wordsPerLevel;
            const endIndex = Math.min(wordsCount, levelNum * wordsPerLevel);
            const levelWordsSection = vocabList.slice(startIndex, endIndex);
            const modeWordsCount = getModeCountForList(selectedModeForLevels, levelWordsSection);

            // Generate some beautiful visual helper stars
            let stars = '';
            if (levelProgress) {
              if (pct === 100) stars = '⭐⭐⭐';
              else if (pct >= 85) stars = '⭐⭐';
              else if (pct >= 70) stars = '⭐';
            }

            const isDeckEmpty = modeWordsCount === 0;

            return (
              <div
                key={levelNum}
                className={`rounded-2xl border p-4.5 transition duration-150 relative ${
                  unlocked
                    ? 'bg-white border-gray-100 dark:bg-slate-900 dark:border-slate-850 shadow-xs'
                    : 'bg-gray-105/60 dark:bg-slate-950 border-gray-200/30 dark:border-slate-900/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-gray-105 flex items-center gap-1.5">
                      <span>{unlocked ? (isDeckEmpty ? '🏁' : '🔓') : '🔒'}</span> {t('Level', 'Stufe')} {levelNum}
                      {stars && <span className="ml-1 text-xs">{stars}</span>}
                    </h4>
                    <p className="text-[10px] text-gray-400 dark:text-slate-450 mt-1 font-semibold">
                      {isDeckEmpty ? (
                        <span className="text-gray-400 dark:text-slate-500">{t('No matching words', 'Keine passenden Wörter')}</span>
                      ) : (
                        `${modeWordsCount} ${
                          selectedModeForLevels === 'article'
                            ? t('Nouns', 'Nomen')
                            : selectedModeForLevels === 'verb'
                            ? t('Verbs', 'Verben')
                            : selectedModeForLevels === 'adjective'
                            ? t('Adjectives', 'Adjektive')
                            : selectedModeForLevels === 'flashcard'
                            ? t('Cards', 'Karten')
                            : selectedModeForLevels === 'sentence'
                            ? t('Sentences', 'Sätze')
                            : t('Vocabs', 'Vokabeln')
                        } • (${t('Words', 'Wörter')} ${startIndex + 1} - ${endIndex})`
                      )}
                    </p>
                  </div>

                  {unlocked ? (
                    isDeckEmpty ? (
                      <span className="text-xs font-black text-emerald-500 dark:text-emerald-400">
                        ✓ {t('Completed', 'Übersprungen')}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (selectedModeForLevels === 'flashcard') {
                            onStartFlashcards(levelNum);
                          } else {
                            onStartQuiz(`${selectedModeForLevels}_level_${levelNum}`);
                          }
                        }}
                        className={`px-4 py-2 text-xs font-black rounded-xl transition active:scale-95 cursor-pointer ${
                          pct >= 70
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40'
                            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-955'
                        }`}
                        type="button"
                      >
                        {pct > 0 ? `${pct}% ${t('Retry', 'Erneut')}` : t('Start', 'Lernen')}
                      </button>
                    )
                  ) : (
                    <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                      🔒 {t('Locked', 'Gesperrt')}
                    </span>
                  )}
                </div>

                {/* Micro progress line inside card */}
                {levelProgress && !isDeckEmpty && (
                  <div className="mt-3.5 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Title Navbar with Back Trigger */}
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold transition hover:bg-slate-700 active:scale-95"
          type="button"
        >
          ‹
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="truncate text-base font-extrabold flex items-center gap-1.5 leading-none">
            <span>{icon}</span> {nameDisp}
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">
            {vocabList.length} {t('B1 Vocabulary records', 'B1 Wortschatz')}
          </p>
        </div>
      </div>

      {/* Info Dashboard Cards */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-850 p-5">
        <h3 className="text-base font-extrabold text-gray-800 dark:text-gray-100">{nameDisp}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          {t('Select a dynamic study mode below of varying difficulty to master words in this category.', 'Wähle einen Lernmodus, um die Vokabeln dieses Themas spielerisch zu lernen.')}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/30">
            🔵 {nounCount} {t('Nouns', 'Nomen')}
          </span>
          <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/30">
            ⚡ {verbCount} {t('Verbs', 'Verben')}
          </span>
          <span className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/30">
            🎨 {adjCount} {t('Adjectives', 'Adjektive')}
          </span>
        </div>
      </div>

      <h4 className="px-5 mt-5 mb-2.5 text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
        🚀 {t('CHOOSE TRAINING METHOD', 'MODUS AUSWÄHLEN')}
      </h4>

      {/* Modern Modes Grid layout */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {modes.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              if (m.disabled) return;
              setSelectedModeForLevels(m.key);
            }}
            disabled={m.disabled}
            className={`flex flex-col items-start gap-1 rounded-2xl border text-left p-4.5 transition duration-150 ${
              m.disabled
                ? 'opacity-40 cursor-default bg-gray-50 dark:bg-slate-900 border-gray-200/40 dark:border-slate-850'
                : 'bg-white hover:bg-gray-50 border-gray-100 shadow-xs hover:border-gray-200 dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-850 active:scale-[0.97]'
            }`}
            type="button"
          >
            {/* Mode header icons */}
            <div className="text-2xl mb-1.5">{m.icon}</div>
            <div className="text-sm font-extrabold text-gray-800 dark:text-gray-100 leading-tight">{m.name}</div>
            <div className="text-[10px] text-gray-400 dark:text-slate-400 font-medium leading-relaxed my-1 line-clamp-2">{m.desc}</div>

            {/* Questions/card count status badge */}
            <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300`}>
              {m.count} {m.isFC ? t('Cards', 'Karten') : t('Questions', 'Fragen')}
            </span>
          </button>
        ))}
      </div>

      {/* Historical training progression box */}
      {Object.keys(topicProgress).length > 0 && (
        <div className="mx-4 mt-6 rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50">
          <div className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
            📊 {t('YOUR THEME HISTORY', 'DEIN LERNVERLAUF')}
          </div>
          <div className="mt-3 divide-y divide-gray-50 dark:divide-slate-850">
            {Object.entries(topicProgress).map(([mode, result]) => (
              <div key={mode} className="flex items-center justify-between py-2.5 text-xs first:pt-0 last:pb-0">
                <span className="font-semibold text-gray-600 dark:text-slate-300">
                  {(() => {
                    if (mode.includes('_level_')) {
                      const parts = mode.split('_level_');
                      const baseMode = parts[0];
                      const lvl = parts[1];
                      return `${getModeLabel(baseMode)} • ${t('Level', 'Stufe')} ${lvl}`;
                    }
                    return getModeLabel(mode);
                  })()}
                </span>
                <span className={`font-bold px-2 py-0.5 rounded-full ${
                  result.pct >= 70
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                }`}>
                  {result.correct}/{result.total} • {result.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
