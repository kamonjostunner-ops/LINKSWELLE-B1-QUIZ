import { useState, useEffect, useRef } from 'react';
import { Word, Question, QuizMode } from '../types';
import { ICONS } from '../data/vocab';
import { speak } from '../utils/audio';

interface QuizViewProps {
  topicName: string;
  mode: QuizMode;
  questions: Question[];
  currentIdx: number;
  answers: (number | string | null)[];
  onChooseAnswer: (idx: number) => void;
  onCheckWrittenAnswer: (text: string) => void;
  onGoToIdx: (idx: number) => void;
  onFinishQuiz: () => void;
  onToggleBookmark: (word: Word) => void;
  isBookmarked: (wordStr: string) => boolean;
  onBack: () => void;
  ttsEnabled: boolean;
  lang: 'en' | 'de';
}

export default function QuizView({
  topicName,
  mode,
  questions,
  currentIdx,
  answers,
  onChooseAnswer,
  onCheckWrittenAnswer,
  onGoToIdx,
  onFinishQuiz,
  onToggleBookmark,
  isBookmarked,
  onBack,
  ttsEnabled,
  lang,
}: QuizViewProps) {
  const t = (en: string, de: string) => (lang === 'de' ? de : en);

  // Local state for free text answers
  const [writeVal, setWriteVal] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [listenPlCount, setListenPlCount] = useState<Record<number, number>>({});

  // Speed Mode countdown timer state
  const [speedSecs, setSpeedSecs] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const q = questions[currentIdx];
  const chosenOption = answers[currentIdx];
  const totalQs = questions.length;
  const doneQs = answers.filter((ans) => ans !== null).length;
  const pctFinished = Math.round((doneQs / totalQs) * 100);

  const isWrite = q.type === 'write';
  const isListen = q.type === 'listen';
  const hasAnswered = isWrite ? chosenOption !== null : chosenOption !== null;

  // Track if current answer choice is correct
  const isCorrectChoice = () => {
    if (chosenOption === null) return false;
    if (isWrite) {
      return !String(chosenOption).startsWith('__wrong__');
    }
    return chosenOption === q.ans;
  };

  // Sound triggering speech synthesis
  const triggerAudioPlay = (termStr: string) => {
    setIsPlayingAudio(true);
    speak(termStr, ttsEnabled);

    // Increment listen play counter for Listening mode
    if (isListen) {
      setListenPlCount((prev) => ({
        ...prev,
        [currentIdx]: (prev[currentIdx] || 0) + 1,
      }));
    }

    // Reset visual play state after a short delay
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 1200);
  };

  // Play audio automatically on mounting of each new question
  useEffect(() => {
    setWriteVal('');
    if (isListen) {
      setTimeout(() => {
        triggerAudioPlay(q.german || q.word.replace('🔊 ', ''));
      }, 350.0);
    } else if (ttsEnabled && q.word && !isWrite) {
      if (q.type === 'sentence') {
        const isGermanSentence = q.label.includes('German') || q.label.includes('deutschen');
        if (isGermanSentence) {
          speak(q.word, true);
        }
      } else {
        const cleanWord = q.word.replace('___ ', '').trim();
        speak(cleanWord, true);
      }
    }
  }, [currentIdx, isListen, q.word, ttsEnabled]);

  // Handle countdown logic strictly for Speed Rounds
  useEffect(() => {
    if (mode !== 'speed') return;
    if (hasAnswered) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set initial timer
    setSpeedSecs(15);

    timerRef.current = setInterval(() => {
      setSpeedSecs((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Timeout triggers a forced skip/wrong response
          onChooseAnswer(-1); // -1 marks skipped/timed-out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIdx, mode, hasAnswered]);

  const handleWritingCheck = () => {
    if (!writeVal.trim()) return;
    onCheckWrittenAnswer(writeVal);
  };

  return (
    <div className="pb-28">
      {/* Quiz Top Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-xl font-bold transition hover:bg-slate-750 active:scale-95"
            type="button"
          >
            ‹
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-base font-extrabold flex items-center gap-1.5 leading-none">
              <span>{ICONS[topicName] || '🧠'}</span> {topicName}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-extrabold text-emerald-400">
              {(() => {
                if (mode === 'speed') return '⚡ ' + t('Speed round', 'Schnellrunde');
                if (mode === 'write') return '✍️ ' + t('Writing practice', 'Schreibübung');
                if (mode === 'listen') return '👂 ' + t('Listening practice', 'Hörverständnis');
                if (mode === 'meaning') return '🔤 ' + t('Meanings test', 'Bedeutungstest');
                if (mode === 'article') return '📌 ' + t('Articles practice', 'Artikelübung');
                if (mode === 'verb') return '⚡ ' + t('Verbs practice', 'Verbenübung');
                if (mode === 'adjective') return '🎨 ' + t('Adjectives practice', 'Adjektivübung');
                if (mode === 'sentence') return '🧩 ' + t('Sentence Translation', 'Satzübersetzung');
                if (mode.includes('_level_')) {
                  const parts = mode.split('_level_');
                  const m = parts[0];
                  const levelNum = parts[1];
                  const mLabel = (() => {
                    if (m === 'all') return t('Full Quiz', 'Kombitest');
                    if (m === 'meaning') return t('Meanings test', 'Bedeutungstest');
                    if (m === 'article') return t('Articles practice', 'Artikelübung');
                    if (m === 'verb') return t('Verbs practice', 'Verbenübung');
                    if (m === 'adjective') return t('Adjectives practice', 'Adjektivübung');
                    if (m === 'sentence') return t('Sentence Translation', 'Satzübersetzung');
                    return m;
                  })();
                  return `🎯 ${mLabel} • ${t('Level', 'Stufe')} ${levelNum}`;
                }
                return '🎯 ' + t('Full Quiz', 'Kombitest');
              })()}
            </p>
          </div>
        </div>
        <div className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-black text-slate-300">
          {doneQs}/{totalQs}
        </div>
      </div>

      <div className="p-4">
        {/* Speed Round Progress Bar */}
        {mode === 'speed' && !hasAnswered && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs font-black tracking-wider mb-1">
              <span className="text-orange-600 dark:text-orange-400">⚡ SPEED COUNTER</span>
              <span className={speedSecs <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-400'}>
                {speedSecs}s
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-850 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  speedSecs <= 5 ? 'bg-red-500' : speedSecs <= 9 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${(speedSecs / 15) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Global Progress Bar */}
        <div className="flex justify-between items-center text-xs text-gray-400 mb-1 font-bold">
          <span>{pctFinished}% Completed</span>
          <span>Question {currentIdx + 1} of {totalQs}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-slate-800 dark:bg-emerald-600 transition-all duration-300"
            style={{ width: `${pctFinished}%` }}
          />
        </div>

        {/* Steps/Dots indicator list */}
        <div className="flex flex-wrap gap-1.5 mb-5 select-none justify-center">
          {questions.map((_, i) => {
            const usersAnswer = answers[i];
            let cellStyle = 'border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800 text-gray-400';

            if (i === currentIdx) {
              cellStyle = 'border-slate-900 bg-slate-900 text-white dark:border-emerald-500 dark:bg-emerald-600';
            } else if (usersAnswer !== null) {
              if (usersAnswer === -1 || String(usersAnswer).startsWith('__wrong__')) {
                cellStyle = 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900';
              } else {
                const questionEntry = questions[i];
                const isItemCorrect = usersAnswer === questionEntry.ans;
                cellStyle = isItemCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/50'
                  : 'border-red-300 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900';
              }
            }

            return (
              <button
                key={i}
                onClick={() => onGoToIdx(i)}
                className={`flex h-8 w-8 min-w-[32px] items-center justify-center rounded-lg border text-xs font-black transition cursor-pointer active:scale-95 ${cellStyle}`}
                type="button"
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Primary Interactive Cards */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xs dark:bg-slate-900 dark:border-slate-850/50">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-slate-850">
            <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-[9.5px] font-black uppercase text-orange-700 dark:bg-orange-950/20 dark:text-orange-400">
              {q.type} Mode
            </span>
            <div className="flex gap-2">
              {!isListen && (
                <button
                  type="button"
                  onClick={() => {
                    if (q.type === 'sentence') {
                      const isGermanSentence = q.label.includes('German') || q.label.includes('deutschen');
                      if (isGermanSentence) {
                        triggerAudioPlay(q.word);
                      } else {
                        const correctGermanSentence = q.opts[q.ans as number];
                        triggerAudioPlay(correctGermanSentence);
                      }
                    } else {
                      triggerAudioPlay(q.word.replace('___ ', '').trim());
                    }
                  }}
                  className="rounded-xl border border-gray-100 dark:border-slate-850 bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-600 hover:bg-gray-100 active:scale-95 dark:bg-slate-800 dark:text-slate-300"
                >
                  🔊 Hear
                </button>
              )}
              {q.raw && (
                <button
                  onClick={() => onToggleBookmark(q.raw!)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 active:rotate-12 transition"
                  type="button"
                >
                  {isBookmarked(q.raw.g) ? '🔖' : '🏷️'}
                </button>
              )}
            </div>
          </div>

          {/* Listening Prominent Audio Pulse Block */}
          {isListen && (
            <div className="my-6 flex flex-col items-center justify-center gap-3">
              <span className="text-xs text-gray-400 font-extrabold uppercase">
                {t('Acoustic Sound Playback', 'Aussprache anhören')}
              </span>
              <button
                type="button"
                onClick={() => triggerAudioPlay(q.german || q.word.replace('🔊 ', ''))}
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-3xl border-2 border-indigo-400 hover:bg-indigo-100 text-indigo-700 transition active:scale-90 dark:bg-slate-850 dark:border-slate-700 dark:text-emerald-400 ${
                  isPlayingAudio ? 'animate-pulse-ring' : ''
                }`}
              >
                🔊
              </button>
              <div className="text-[10px] text-gray-400 dark:text-slate-500 text-center">
                {listenPlCount[currentIdx] ? `Played ${listenPlCount[currentIdx]} times` : 'Click speaker box to listen'}
              </div>
            </div>
          )}

          {/* Question Text block */}
          <div className="mt-4">
            <label className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase">{q.label}</label>
            <h3 className="text-2xl font-black mt-1 text-gray-800 dark:text-gray-100 break-words leading-tight">
              {isListen ? '👂 Listening Practice' : q.word}
            </h3>
            {q.raw && q.raw.g && (
              <div className="flex gap-1.5 mt-2 flex-wrap text-xs">
                {q.raw.g.startsWith('der') && <span className="rounded-md bg-blue-100 px-2 py-0.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/20">der</span>}
                {q.raw.g.startsWith('die') && <span className="rounded-md bg-pink-100 px-2 py-0.5 font-bold text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200/20">die</span>}
                {q.raw.g.startsWith('das') && <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-950/20">das</span>}
                <span className="text-gray-400 font-medium italic mt-0.5">{q.sub}</span>
              </div>
            )}
          </div>

          {/* Input Panel UI Controls */}
          <div className="mt-6 border-t border-gray-50 pt-4 dark:border-slate-850">
            {isWrite ? (
              <div className="space-y-3">
                <input
                  id="quiz-answer-spelling"
                  type="text"
                  disabled={hasAnswered}
                  className={`w-full rounded-xl border-2 p-3 text-lg font-black text-center outline-none bg-gray-50 dark:bg-slate-800 dark:text-white ${
                    hasAnswered
                      ? isCorrectChoice()
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-800'
                        : 'border-red-400 bg-red-50 dark:bg-red-950/10 text-red-800'
                      : 'border-gray-200 focus:border-slate-900 focus:bg-white dark:border-slate-750 dark:focus:border-emerald-500'
                  }`}
                  placeholder={t('Type English translation...', 'Bedeutung eingeben...')}
                  value={writeVal}
                  onChange={(e) => setWriteVal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleWritingCheck();
                  }}
                />
                {!hasAnswered ? (
                  <button
                    onClick={handleWritingCheck}
                    className="w-full rounded-xl bg-slate-900 py-3.5 text-center text-sm font-bold text-white transition hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-98"
                    type="button"
                  >
                    {t('Check Answer', 'Antwort überprüfen')}
                  </button>
                ) : (
                  <div className={`rounded-xl p-3 text-xs font-bold leading-relaxed ${
                    isCorrectChoice()
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/10 dark:text-emerald-400'
                      : 'bg-red-50 text-red-700 dark:bg-red-950/10 dark:text-red-400'
                  }`}>
                    {isCorrectChoice() ? (
                      <div>✓ Correct! spelling is perfect.</div>
                    ) : (
                      <div>
                        ✗ Mistake — correct output was: <strong>{q.ans}</strong>
                        {writeVal && <span> (you spelled: &quot;{writeVal}&quot;)</span>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {q.opts.map((opt, oIdx) => {
                  let optStyle = 'border-gray-100 bg-gray-50/50 hover:bg-gray-100 dark:bg-slate-850 hover:dark:bg-slate-800 text-gray-700 dark:text-slate-200';

                  if (hasAnswered || chosenOption === -1) {
                    if (oIdx === q.ans) {
                      optStyle = 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300';
                    } else if (oIdx === chosenOption) {
                      optStyle = 'border-red-400 bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300';
                    } else {
                      optStyle = 'opacity-30 border-gray-50 text-gray-300 dark:bg-slate-900 dark:text-slate-600';
                    }
                  }

                  const alphabetPrefix = String.fromCharCode(65 + oIdx);

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={hasAnswered || chosenOption === -1}
                      onClick={() => onChooseAnswer(oIdx)}
                      className={`w-full flex items-center gap-3 rounded-xl border-1.5 p-3.5 text-left text-sm font-semibold transition duration-150 cursor-pointer ${optStyle}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-300/60 dark:bg-slate-700 text-[10px] font-black text-gray-700 dark:text-slate-200 uppercase">
                        {hasAnswered && oIdx === q.ans ? '✓' : hasAnswered && oIdx === chosenOption ? '✗' : alphabetPrefix}
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}

                {chosenOption === -1 && (
                  <div className="rounded-xl bg-red-50 p-3.5 text-xs font-bold text-red-700 dark:bg-red-950/10 dark:text-red-400">
                    ⏱️ Time is up! Correct meaning: <strong>{q.opts[q.ans as number]}</strong>
                  </div>
                )}
                {hasAnswered && chosenOption !== -1 && (
                  <div className={`rounded-xl p-3.5 text-xs font-bold ${
                    isCorrectChoice() ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/10 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-950/10 dark:text-red-400'
                  }`}>
                    {isCorrectChoice() ? '✓ Accurate!' : `✗ Incorrect — correct answer: ${q.opts[q.ans as number]}`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Bottom Controls Nav bar */}
      <div className="fixed bottom-0 left-1/2 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white px-4 py-3 pb-8 shadow-lg dark:bg-slate-900 dark:border-slate-850 flex gap-3 z-30">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => onGoToIdx(currentIdx - 1)}
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 py-3 text-center text-xs font-bold text-gray-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750 hover:bg-gray-100 disabled:opacity-30 active:scale-95 transition"
        >
          ← Prev
        </button>

        {currentIdx + 1 === totalQs ? (
          <button
            type="button"
            onClick={onFinishQuiz}
            className="flex-1 rounded-xl bg-slate-900 py-3 text-center text-xs font-bold text-white transition hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 shadow-sm"
          >
            {t('Finish Test 🎉', 'Beenden 🎉')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onGoToIdx(currentIdx + 1)}
            className="flex-1 rounded-xl bg-slate-900 py-3 text-center text-xs font-bold text-white transition hover:bg-slate-850 dark:bg-emerald-600 dark:hover:bg-emerald-700 active:scale-95 shadow-sm"
          >
            {t('Next →', 'Weiter →')}
          </button>
        )}
      </div>
    </div>
  );
}
