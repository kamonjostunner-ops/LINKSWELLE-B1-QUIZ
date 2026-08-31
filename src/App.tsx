import { useState, useEffect } from 'react';
import { Word, Settings, QuizProgress, HighScore, Streak, Question, QuizMode } from './types';
import { VOCAB, ICONS, LEVELS } from './data/vocab';
import { SENTENCE_EXERCISES } from './data/sentenceExercises';
import { speak, unlockTTS } from './utils/audio';

// Import sub-components
import HomeView from './components/HomeView';
import TopicView from './components/TopicView';
import QuizView from './components/QuizView';
import FlashcardView from './components/FlashcardView';
import StatsView from './components/StatsView';
import SearchView from './components/SearchView';
import SavedView from './components/SavedView';
import ProfileView from './components/ProfileView';
import SettingsModal from './components/SettingsModal';
import ExamsView from './components/ExamsView';
import AiLabView from './components/AiLabView';
import CultureHubView from './components/CultureHubView';

// Shuffler utility
const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Distractors compiler
const getDistractors = (correctValue: string, allPossible: string[], count = 3): string[] => {
  const filtered = allPossible.filter((val) => val !== correctValue);
  const shuffled = shuffle(filtered);
  return shuffled.slice(0, count);
};

export default function App() {
  // ── PERSISTENT STATES LOADING ──────────────────────────────
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const darkVal = localStorage.getItem('lw_dark');
      const ttsVal = localStorage.getItem('lw_tts');
      const langVal = localStorage.getItem('lw_lang');
      const fsVal = localStorage.getItem('lw_fs');
      const avVal = localStorage.getItem('lw_av');
      const nameVal = localStorage.getItem('lw_name');
      const photoVal = localStorage.getItem('lw_photo');
      const goalVal = localStorage.getItem('lw_goal');
      const cefrVal = localStorage.getItem('lw_cefr');
      const buildConfigVal = localStorage.getItem('lw_build_config');

      return {
        dark: darkVal ? JSON.parse(darkVal) : false,
        ttsOn: ttsVal ? JSON.parse(ttsVal) : true,
        lang: langVal ? JSON.parse(langVal) : 'en',
        fontSize: fsVal ? JSON.parse(fsVal) : 'md',
        avatar: avVal ? JSON.parse(avVal) : '🧑',
        userName: nameVal ? JSON.parse(nameVal) : 'Learner',
        photoUrl: photoVal ? JSON.parse(photoVal) : undefined,
        dailyGoal: goalVal ? JSON.parse(goalVal) : 10,
        cefrLevel: cefrVal ? (JSON.parse(cefrVal) as any) : 'B1',
        lastBuildConfig: buildConfigVal ? JSON.parse(buildConfigVal) : undefined,
      };
    } catch {
      return { dark: false, ttsOn: true, lang: 'en', fontSize: 'md', avatar: '🧑', userName: 'Learner', dailyGoal: 10, cefrLevel: 'B1' };
    }
  });

  const [progress, setProgress] = useState<QuizProgress>(() => {
    try {
      const val = localStorage.getItem('lw_prog');
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState<Word[]>(() => {
    try {
      const val = localStorage.getItem('lw_bm');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  const [streak, setStreak] = useState<Streak>(() => {
    try {
      const val = localStorage.getItem('lw_streak');
      return val ? JSON.parse(val) : { count: 0, lastDate: '' };
    } catch {
      return { count: 0, lastDate: '' };
    }
  });

  const [activity, setActivity] = useState<Record<string, number>>(() => {
    try {
      const val = localStorage.getItem('lw_act');
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  });

  const [highscores, setHighscores] = useState<Record<string, HighScore>>(() => {
    try {
      const val = localStorage.getItem('lw_hs');
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  });

  const [missedWords, setMissedWords] = useState<Record<string, Word & { count: number }>>(() => {
    try {
      const val = localStorage.getItem('lw_missed');
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  });

  // ── VIEWPORT AND NAVIGATION STATES ──────────────────────────
  const [tab, setTab] = useState<'home' | 'stats' | 'exams' | 'lab' | 'culture' | 'search' | 'saved' | 'profile'>('home');
  const [screen, setScreen] = useState<'home' | 'topic' | 'quiz' | 'flashcard'>('home');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);

  // Active quiz compilation
  const [activeQuizMode, setActiveQuizMode] = useState<QuizMode>('meaning');
  const [activeFlashcardLevel, setActiveFlashcardLevel] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);

  // ── ONCE-OFF INITIALIZATIONS ───────────────────────────────
  useEffect(() => {
    // Body layout dark theme class toggle updates
    document.body.classList.toggle('dark', settings.dark);
    // Custom font size updates
    const rootFontSize = settings.fontSize === 'sm' ? '13px' : settings.fontSize === 'lg' ? '17px' : '15px';
    document.documentElement.style.setProperty('--font-size', rootFontSize);
  }, [settings.dark, settings.fontSize]);

  // Setup click triggers on first user gesture to unlock speech synthesis
  useEffect(() => {
    const handleUnlock = () => {
      unlockTTS();
      window.removeEventListener('click', handleUnlock);
    };
    window.addEventListener('click', handleUnlock);
    return () => window.removeEventListener('click', handleUnlock);
  }, []);

  // Sync settings updates back to localstorage
  const handleUpdateSettings = (updated: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updated };
      
      // Auto-compile updated build configuration on settings change
      try {
        const safePackageName = `com.learnwort.german.${next.userName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'learner'}`;
        const friendsCount = (() => {
          try {
            const stored = localStorage.getItem('lw_friends');
            return stored ? JSON.parse(stored).length : 0;
          } catch { return 0; }
        })();
        const bookmarksCount = (() => {
          try {
            const stored = localStorage.getItem('lw_bm');
            return stored ? JSON.parse(stored).length : 0;
          } catch { return 0; }
        })();
        const xpScore = (() => {
          try {
            let score = 0;
            const hsVal = localStorage.getItem('lw_hs');
            if (hsVal) {
              const parsed = JSON.parse(hsVal);
              Object.values(parsed).forEach((h: any) => {
                score += (h.correct || 0) * 10;
              });
            }
            return score;
          } catch { return 0; }
        })();
        const streakDays = (() => {
          try {
            const val = localStorage.getItem('lw_streak');
            return val ? JSON.parse(val).count : 0;
          } catch { return 0; }
        })();
        const hsCount = (() => {
          try {
            const val = localStorage.getItem('lw_hs');
            return val ? Object.keys(JSON.parse(val)).length : 0;
          } catch { return 0; }
        })();

        const generatedConfig = {
          app_metadata: {
            appName: "Wortschatz Meister Mobile",
            appVersion: "1.2.0",
            packageName: safePackageName,
            exportTimestamp: Date.now(),
            exportedBy: next.userName
          },
          target_environments: {
            cefrLevel: next.cefrLevel || 'B1',
            systemLanguage: next.lang || 'en',
            themeAccent: next.dark ? "dark-slate" : "light-violet",
            fontSizeScale: next.fontSize || 'md'
          },
          build_cli_directives: {
            minify: true,
            enableSpeechProcessing: true,
            enableNativeTTS: next.ttsOn,
            dailyPracticeTarget: next.dailyGoal || 10,
            offlineCapabilityEnabled: true,
            targetSdkVersion: 34,
            preferredPlatform: "android"
          },
          profile_sync_data: {
            userName: next.userName,
            registeredFriendsCount: friendsCount,
            savedBookmarksCount: bookmarksCount,
            currentXPScore: xpScore,
            streakDaysCount: streakDays,
            highScoresCount: hsCount
          }
        };

        next.lastBuildConfig = generatedConfig;
        localStorage.setItem('lw_build_config', JSON.stringify(generatedConfig));
      } catch (err) {
        console.error('Build config pre-compilation error:', err);
      }

      try {
        localStorage.setItem('lw_dark', JSON.stringify(next.dark));
        localStorage.setItem('lw_tts', JSON.stringify(next.ttsOn));
        localStorage.setItem('lw_lang', JSON.stringify(next.lang));
        localStorage.setItem('lw_fs', JSON.stringify(next.fontSize));
        localStorage.setItem('lw_av', JSON.stringify(next.avatar));
        localStorage.setItem('lw_name', JSON.stringify(next.userName));
        if (next.photoUrl !== undefined) {
          localStorage.setItem('lw_photo', JSON.stringify(next.photoUrl));
        }
        if (next.dailyGoal !== undefined) {
          localStorage.setItem('lw_goal', JSON.stringify(next.dailyGoal));
        }
        if (next.cefrLevel !== undefined) {
          localStorage.setItem('lw_cefr', JSON.stringify(next.cefrLevel));
        }
      } catch (err) {
        console.error('LocalStorage persistence error:', err);
      }
      return next;
    });
  };

  const handleAddTestPoints = (pts: number) => {
    const key = 'tests|general';
    setHighscores((prev) => {
      const copy = { ...prev };
      const current = copy[key] || {
        topic: 'CEFR Tests',
        mode: 'general' as any,
        pct: 0,
        correct: 0,
        total: 100,
        ts: Date.now(),
      };
      const nextPct = Math.min(100, current.pct + Math.round(pts / 10));
      copy[key] = {
        ...current,
        pct: nextPct,
        correct: Math.min(100, current.correct + Math.round(pts / 8)),
        ts: Date.now(),
      };
      try {
        localStorage.setItem('lw_hs', JSON.stringify(copy));
      } catch {}
      return copy;
    });

    const today = new Date().toISOString().split('T')[0];
    setActivity((prev) => {
      const copy = { ...prev };
      copy[today] = (copy[today] || 0) + Math.ceil(pts / 15);
      try {
        localStorage.setItem('lw_act', JSON.stringify(copy));
      } catch {}
      return copy;
    });
  };

  // ── CORE QUIZ QUESTIONS BUILDERS ────────────────────────────
  const buildQuestions = (topicName: string, mode: QuizMode, level?: number): Question[] => {
    let list = VOCAB[topicName] || [];
    if (level) {
      const wordsCount = list.length;
      const wordsPerLevel = Math.max(1, Math.ceil(wordsCount / 10));
      const startIndex = (level - 1) * wordsPerLevel;
      const endIndex = Math.min(wordsCount, level * wordsPerLevel);
      list = list.slice(startIndex, endIndex);
    }
    if (list.length === 0) return [];

    const allMeanings = list.map((w) => w.e);

    // 1) German -> English translations
    const generateMeaningsQs = (entries: Word[]): Question[] => {
      return entries.map((w) => {
        const correctOpt = w.e;
        const otherOptions = getDistractors(correctOpt, allMeanings, 3);
        const optionsList = shuffle([correctOpt, ...otherOptions]);
        return {
          type: 'meaning',
          label: settings.lang === 'de' ? 'Was bedeutet diese Vokabel?' : 'What does this vocabulary mean?',
          word: w.g,
          sub: w.t === 'n' ? 'noun' : w.t === 'v' ? 'verb' : 'adjective',
          opts: optionsList,
          ans: optionsList.indexOf(correctOpt),
          raw: w,
        };
      });
    };

    // 2) Noun articles questions (der/die/das)
    const generateArticlesQs = (): Question[] => {
      const nouns = list.filter((w) => w.t === 'n' && /^(der|die|das) /i.test(w.g));
      return nouns.map((w) => {
        const article = w.g.split(' ')[0].toLowerCase();
        const nounTerm = w.g.slice(article.length + 1).trim();
        const optionsList = ['der', 'die', 'das'];
        return {
          type: 'article',
          label: settings.lang === 'de' ? 'Welcher Artikel gehört dazu?' : 'Which article belongs to this noun?',
          word: `___ ${nounTerm}`,
          sub: w.e,
          opts: optionsList,
          ans: optionsList.indexOf(article),
          raw: w,
        };
      });
    };

    // 3) Listening practice
    const generateListeningQs = (entries: Word[]): Question[] => {
      return entries.map((w) => {
        const correctOpt = w.e;
        const otherOptions = getDistractors(correctOpt, allMeanings, 3);
        const optionsList = shuffle([correctOpt, ...otherOptions]);
        return {
          type: 'listen',
          label: settings.lang === 'de' ? 'Höre zu und wähle die richtige Übersetzung:' : 'Listen and choose correct translation:',
          word: '🔊 Listen',
          sub: settings.lang === 'de' ? 'Zuhören' : 'press speaker to voice',
          opts: optionsList,
          ans: optionsList.indexOf(correctOpt),
          raw: w,
          german: w.g,
        };
      });
    };

    // 4) Writing text spelling practice
    const generateWritingQs = (entries: Word[]): Question[] => {
      return entries.map((w) => {
        return {
          type: 'write',
          label: settings.lang === 'de' ? 'Tippe die englische Bedeutung:' : 'Type local English translation:',
          word: w.g,
          sub: w.t === 'n' ? 'noun' : w.t === 'v' ? 'verb' : 'adjective',
          opts: [],
          ans: w.e,
          raw: w,
        };
      });
    };

    // 5) Sentence translation practice
    const generateSentenceQs = (): Question[] => {
      const topicSentences = SENTENCE_EXERCISES[topicName] || [];
      const levelDeTerms = new Set(list.map(w => w.g.toLowerCase()));
      let filteredSentences = topicSentences.filter(s =>
        s.wordsUsed.some(word => levelDeTerms.has(word.toLowerCase()) || list.some(w => w.g.toLowerCase().includes(word.toLowerCase())))
      );
      if (filteredSentences.length === 0) {
        filteredSentences = topicSentences;
      }
      
      const allDeSentences = Object.values(SENTENCE_EXERCISES).flatMap(arr => arr.map(s => s.de));
      const allEnSentences = Object.values(SENTENCE_EXERCISES).flatMap(arr => arr.map(s => s.en));

      const qs: Question[] = [];
      filteredSentences.forEach((s) => {
        const correctEn = s.en;
        const otherEn = getDistractors(correctEn, allEnSentences, 3);
        const enOptions = shuffle([correctEn, ...otherEn]);
        
        qs.push({
          type: 'sentence',
          label: settings.lang === 'de' ? 'Übersetze diesen deutschen Satz ins Englische:' : 'Translate this German sentence to English:',
          word: s.de,
          sub: `Vocabulary: ${s.wordsUsed.join(', ')}`,
          opts: enOptions,
          ans: enOptions.indexOf(correctEn),
          raw: list.find(w => s.wordsUsed.some(wu => w.g.toLowerCase().includes(wu.toLowerCase()))) || list[0]
        });

        const correctDe = s.de;
        const otherDe = getDistractors(correctDe, allDeSentences, 3);
        const deOptions = shuffle([correctDe, ...otherDe]);

        qs.push({
          type: 'sentence',
          label: settings.lang === 'de' ? 'Übersetze diesen englischen Satz ins Deutsche:' : 'Translate this English sentence to German:',
          word: s.en,
          sub: `Satzübung`,
          opts: deOptions,
          ans: deOptions.indexOf(correctDe),
          raw: list.find(w => s.wordsUsed.some(wu => w.g.toLowerCase().includes(wu.toLowerCase()))) || list[0]
        });
      });

      return qs;
    };

    switch (mode) {
      case 'meaning':
        return shuffle(generateMeaningsQs(list));
      case 'article':
        return shuffle(generateArticlesQs());
      case 'verb':
        return shuffle(generateMeaningsQs(list.filter((w) => w.t === 'v')));
      case 'adjective':
        return shuffle(generateMeaningsQs(list.filter((w) => w.t === 'a')));
      case 'speed':
        return shuffle(generateMeaningsQs(list)).slice(0, 20); // capped speed rounds
      case 'write':
        return shuffle(generateWritingQs(list)).slice(0, 15); // capped writing exercise
      case 'listen':
        return shuffle(generateListeningQs(list));
      case 'sentence':
        return shuffle(generateSentenceQs());
      case 'all':
      default: {
        const combined = [
          ...generateMeaningsQs(list),
          ...generateArticlesQs(),
          ...generateListeningQs(list),
          ...generateSentenceQs().slice(0, 6)
        ];
        return shuffle(combined).slice(0, 30); // robust mixture round
      }
    }
  };

  const handleStartQuizRound = (modeKey: string) => {
    let mode = modeKey as QuizMode;
    let levelNum: number | undefined = undefined;
    if (modeKey.includes('_level_')) {
      const parts = modeKey.split('_level_');
      mode = parts[0] as QuizMode;
      levelNum = parseInt(parts[1]);
    }
    const list = buildQuestions(selectedTopic, mode, levelNum);
    if (list.length === 0) {
      alert(settings.lang === 'de' ? 'Keine Fragen verfügbar!' : 'No questions matching this category!');
      return;
    }
    setQuestions(list);
    setAnswers(new Array(list.length).fill(null));
    setCurrentQuestionIdx(0);
    setActiveQuizMode(modeKey as QuizMode);
    setScreen('quiz');
  };

  // Launch training focusing solely on weak/missed vocabulary entries
  const handleStartWeakWordsTraining = () => {
    const list = Object.values(missedWords) as (Word & { count: number })[];
    const weakList = [...list]
      .sort((a, b) => b.count - a.count)
      .map((item) => {
        const { count, ...word } = item;
        return word; // strip count, return pure Word
      })
      .slice(0, 20);

    if (weakList.length === 0) return;

    const allPossible = weakList.map((w) => w.e);
    const compiledQs: Question[] = weakList.map((w) => {
      const correctOpt = w.e;
      const otherOptions = getDistractors(correctOpt, allPossible, 3);
      const optionsList = shuffle([correctOpt, ...otherOptions]);
      return {
        type: 'meaning',
        label: settings.lang === 'de' ? 'Was bedeutet diese fehlerhafte Vokabel?' : 'What does this weak vocabulary word mean?',
        word: w.g,
        sub: w.t === 'n' ? 'noun' : w.t === 'v' ? 'verb' : 'adjective',
        opts: optionsList,
        ans: optionsList.indexOf(correctOpt),
        raw: w,
      };
    });

    setQuestions(compiledQs);
    setAnswers(new Array(compiledQs.length).fill(null));
    setCurrentQuestionIdx(0);
    setActiveQuizMode('meaning');
    setSelectedTopic('Weak Words');
    setScreen('quiz');
  };

  // Track answers
  const handleAnswerChoice = (optIdx: number) => {
    if (answers[currentQuestionIdx] !== null) return;

    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestionIdx] = optIdx;
      return copy;
    });

    // Error logging if chosen choice is wrong
    const activeQ = questions[currentQuestionIdx];
    if (optIdx !== activeQ.ans && activeQ.raw) {
      logWordMistake(activeQ.raw);
    }
  };

  const handleAnswerSpelling = (typedText: string) => {
    if (answers[currentQuestionIdx] !== null) return;

    const activeQ = questions[currentQuestionIdx];
    const userSpelled = typedText.trim().toLowerCase();
    const correctSpelling = String(activeQ.ans).trim().toLowerCase();

    // Flexible writing checks to ignore slight spelling variations (or accept string contains)
    const isCorrectSpelling =
      userSpelled === correctSpelling ||
      userSpelled === correctSpelling.replace(/^the /i, '') ||
      (correctSpelling.includes(userSpelled) && userSpelled.length > 3);

    setAnswers((prev) => {
      const copy = [...prev];
      copy[currentQuestionIdx] = isCorrectSpelling ? activeQ.ans : `__wrong__${typedText}`;
      return copy;
    });

    if (!isCorrectSpelling && activeQ.raw) {
      logWordMistake(activeQ.raw);
    }
  };

  // Error frequencies incremental logger
  const logWordMistake = (word: Word) => {
    setMissedWords((prev) => {
      const copy = { ...prev };
      const ex = copy[word.g] || { ...word, count: 0 };
      copy[word.g] = { ...ex, count: ex.count + 1 };
      try {
        localStorage.setItem('lw_missed', JSON.stringify(copy));
      } catch (err) {}
      return copy;
    });
  };

  // Streak counter tracking incremental progress daily
  const updateStreakCount = () => {
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    setStreak((prev) => {
      let count = prev.count;
      if (prev.lastDate === today) return prev; // already updated today

      if (prev.lastDate === yest) {
        count = count + 1;
      } else {
        count = 1;
      }

      const nextStreak = { count, lastDate: today };
      try {
        localStorage.setItem('lw_streak', JSON.stringify(nextStreak));
      } catch {}
      return nextStreak;
    });

    // Daily completions increment for heatmap points
    setActivity((prev) => {
      const copy = { ...prev };
      copy[today] = (copy[today] || 0) + 1;
      try {
        localStorage.setItem('lw_act', JSON.stringify(copy));
      } catch {}
      return copy;
    });
  };

  // Commit completion data and redirect to results tab
  const handleFinishQuiz = () => {
    const total = questions.length;
    const correctCount = answers.filter((ans, idx) => {
      if (ans === null || ans === -1) return false;
      if (typeof ans === 'string' && ans.startsWith('__wrong__')) return false;
      return ans === questions[idx].ans;
    }).length;

    const pct = Math.round((correctCount / total) * 100);

    if (selectedTopic !== 'Weak Words') {
      // Save progress metrics
      setProgress((prev) => {
        const copy = { ...prev };
        if (!copy[selectedTopic]) copy[selectedTopic] = {};
        copy[selectedTopic][activeQuizMode] = {
          correct: correctCount,
          total,
          pct,
          ts: Date.now(),
        };
        try {
          localStorage.setItem('lw_prog', JSON.stringify(copy));
        } catch {}
        return copy;
      });

      // Save highscore records
      const hsKey = `${selectedTopic}|${activeQuizMode}`;
      setHighscores((prev) => {
        const copy = { ...prev };
        const storedHs = copy[hsKey];
        if (!storedHs || pct > storedHs.pct) {
          copy[hsKey] = {
            topic: selectedTopic,
            mode: activeQuizMode,
            pct,
            correct: correctCount,
            total,
            ts: Date.now(),
          };
          try {
            localStorage.setItem('lw_hs', JSON.stringify(copy));
          } catch {}
        }
        return copy;
      });
    }

    // Tick the streak
    updateStreakCount();
  };

  const handleFinishFlashcards = (pct: number, correct: number, total: number) => {
    if (selectedTopic !== 'Weak Words') {
      const modeKey = activeFlashcardLevel ? `flashcard_level_${activeFlashcardLevel}` : 'flashcard';
      setProgress((prev) => {
        const copy = { ...prev };
        if (!copy[selectedTopic]) copy[selectedTopic] = {};
        
        const existing = copy[selectedTopic][modeKey];
        if (!existing || pct > existing.pct) {
          copy[selectedTopic][modeKey] = {
            correct,
            total,
            pct,
            ts: Date.now(),
          };
        }
        try {
          localStorage.setItem('lw_prog', JSON.stringify(copy));
        } catch {}
        return copy;
      });

      // Save highscore record for flashcard level
      const hsKey = `${selectedTopic}|${modeKey}`;
      setHighscores((prev) => {
        const copy = { ...prev };
        const storedHs = copy[hsKey];
        if (!storedHs || pct > storedHs.pct) {
          copy[hsKey] = {
            topic: selectedTopic,
            mode: modeKey,
            pct,
            correct,
            total,
            ts: Date.now(),
          };
          try {
            localStorage.setItem('lw_hs', JSON.stringify(copy));
          } catch {}
        }
        return copy;
      });
    }

    // Tick the streak
    updateStreakCount();
  };

  // ── BOOKMARKS SAVE AND PURGE LOGIC ─────────────────────────
  const handleToggleBookmark = (word: Word) => {
    setBookmarks((prev) => {
      const index = prev.findIndex((b) => b.g === word.g);
      let nextArr = [...prev];
      if (index >= 0) {
        nextArr.splice(index, 1);
      } else {
        nextArr.push(word);
      }
      try {
        localStorage.setItem('lw_bm', JSON.stringify(nextArr));
      } catch {}
      return nextArr;
    });
  };

  const isBookmarked = (wordStr: string) => {
    return bookmarks.some((b) => b.g === wordStr);
  };

  const getWeakWordsSortedList = (): Word[] => {
    const list = Object.values(missedWords) as (Word & { count: number })[];
    return [...list].sort((a, b) => b.count - a.count);
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-gray-50 dark:bg-slate-950 font-sans shadow-md flex flex-col relative select-none">
      {/* Global LINKSWELLE INSTITUT School Advertising Top Bar */}
      <div className="bg-indigo-600 dark:bg-slate-900 text-white px-4 py-2.5 text-xs font-bold tracking-wider uppercase shadow-xs flex justify-between items-center z-50 border-b border-indigo-700/50 dark:border-slate-800 select-none">
        <div className="flex items-center gap-1.5 font-black">
          <span className="animate-pulse text-sm">🎓</span>
          <span className="tracking-widest">LINKSWELLE INSTITUT</span>
        </div>
      </div>

      <main className="flex-1 w-full overflow-x-hidden">
        {screen === 'quiz' ? (
          <QuizView
            topicName={selectedTopic}
            mode={activeQuizMode}
            questions={questions}
            currentIdx={currentQuestionIdx}
            answers={answers}
            onChooseAnswer={handleAnswerChoice}
            onCheckWrittenAnswer={handleAnswerSpelling}
            onGoToIdx={setCurrentQuestionIdx}
            onFinishQuiz={handleFinishQuiz}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onBack={() => setScreen('topic')}
            ttsEnabled={settings.ttsOn}
            lang={settings.lang}
          />
        ) : screen === 'flashcard' ? (
          <FlashcardView
            topicName={selectedTopic}
            settings={settings}
            onBack={() => setScreen('topic')}
            onToggleBookmark={handleToggleBookmark}
            isBookmarked={isBookmarked}
            onStartQuiz={handleStartQuizRound}
            level={activeFlashcardLevel}
            onFinishFlashcards={handleFinishFlashcards}
          />
        ) : screen === 'topic' ? (
          <TopicView
            settings={settings}
            topicName={selectedTopic}
            progress={progress}
            onBack={() => setScreen('home')}
            onStartQuiz={handleStartQuizRound}
            onStartFlashcards={(lvl) => {
              setActiveFlashcardLevel(lvl);
              setScreen('flashcard');
            }}
          />
        ) : (
          <div>
            {tab === 'home' && (
              <HomeView
                settings={settings}
                progress={progress}
                bookmarks={bookmarks}
                streak={streak}
                activity={activity}
                onSelectTopic={(name) => {
                  setSelectedTopic(name);
                  setActiveFlashcardLevel(undefined);
                  setScreen('topic');
                }}
                onSetTab={setTab}
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={isBookmarked}
              />
            )}
            {tab === 'stats' && (
              <StatsView
                progress={progress}
                activity={activity}
                weakWords={getWeakWordsSortedList()}
                onStartWeakWordsTraining={handleStartWeakWordsTraining}
                lang={settings.lang}
              />
            )}
            {tab === 'search' && (
              <SearchView
                onToggleBookmark={handleToggleBookmark}
                isBookmarked={isBookmarked}
                lang={settings.lang}
              />
            )}
            {tab === 'saved' && (
              <SavedView
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                lang={settings.lang}
              />
            )}
            {tab === 'exams' && (
              <ExamsView
                settings={settings}
                onAddPoints={handleAddTestPoints}
                lang={settings.lang}
              />
            )}
            {tab === 'lab' && (
              <AiLabView
                settings={settings}
                onAddPoints={handleAddTestPoints}
                lang={settings.lang}
              />
            )}
            {tab === 'culture' && (
              <CultureHubView
                settings={settings}
                onAddPoints={handleAddTestPoints}
                lang={settings.lang}
              />
            )}
            {tab === 'profile' && (
              <ProfileView
                settings={settings}
                streak={streak}
                bookmarks={bookmarks}
                highscores={highscores}
                weakWords={getWeakWordsSortedList()}
                onStartWeakWordsTraining={handleStartWeakWordsTraining}
                onOpenSettings={() => setShowSettings(true)}
                onUpdateSettings={handleUpdateSettings}
                onExportSaved={() => {
                  setTab('saved');
                }}
                lang={settings.lang}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Bottom Tab bar indicator */}
      {screen === 'home' && (
        <nav className="fixed bottom-0 left-1/2 w-full max-w-lg -translate-x-1/2 border-t border-gray-100 bg-white px-2 py-2.5 pb-7 shadow-xs dark:bg-slate-900 dark:border-slate-850 flex justify-around text-center z-40 select-none">
          {[
            { id: 'home', icon: '🏠', label: settings.lang === 'de' ? 'Start' : 'Home' },
            { id: 'stats', icon: '📊', label: settings.lang === 'de' ? 'Statistik' : 'Stats' },
            { id: 'exams', icon: '🏆', label: settings.lang === 'de' ? 'Prüfung' : 'Exams' },
            { id: 'lab', icon: '🧪', label: settings.lang === 'de' ? 'KI-Labor' : 'KI Lab' },
            { id: 'culture', icon: '🏰', label: settings.lang === 'de' ? 'Kultur' : 'Culture' },
            { id: 'search', icon: '🔍', label: settings.lang === 'de' ? 'Suche' : 'Suche' },
            { id: 'saved', icon: '🔖', label: settings.lang === 'de' ? 'Gemerkt' : 'Saved' },
            { id: 'profile', icon: '👤', label: settings.lang === 'de' ? 'Profil' : 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id as any);
                setScreen('home');
              }}
              className={`flex flex-col items-center gap-0.5 transition-all duration-150 cursor-pointer active:scale-95 px-1.5 py-1 rounded-xl ${
                tab === item.id
                  ? 'text-indigo-600 dark:text-cyan-400 font-black scale-110 bg-indigo-100/60 dark:bg-slate-800 shadow-sm border border-indigo-200/40'
                  : 'text-gray-400 font-normal hover:text-gray-650'
              }`}
              type="button"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[8px] tracking-wider capitalize">{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Slide up settings sheets container */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
