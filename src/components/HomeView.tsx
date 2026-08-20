import { Word, Settings, QuizProgress } from '../types';
import { VOCAB, ICONS, CLS } from '../data/vocab';
import { speak } from '../utils/audio';

interface HomeViewProps {
  settings: Settings;
  progress: QuizProgress;
  bookmarks: Word[];
  streak: { count: number; lastDate: string };
  activity: Record<string, number>;
  onSelectTopic: (topicName: string) => void;
  onSetTab: (tab: string) => void;
  onToggleBookmark: (word: Word) => void;
  isBookmarked: (wordStr: string) => boolean;
}

export default function HomeView({
  settings,
  progress,
  bookmarks,
  streak,
  activity,
  onSelectTopic,
  onSetTab,
  onToggleBookmark,
  isBookmarked,
}: HomeViewProps) {
  const currentLang = settings.lang;
  const t = (en: string, de: string) => (currentLang === 'de' ? de : en);

  // Calculate WOD (Word of the Day) statically based on date so it resets daily
  const allWords = Object.values(VOCAB).flat();
  const getWordOfTheDay = (): Word => {
    if (allWords.length === 0) return { g: 'der Alltag', e: 'everyday life', t: 'n' };
    const dateNum = new Date().setHours(0, 0, 0, 0);
    const index = Math.floor(dateNum / 86400000) % allWords.length;
    return allWords[index];
  };

  const wod = getWordOfTheDay();

  // Statistics summaries
  const totalWordsCount = allWords.length;
  const activeTopicsCount = Object.keys(VOCAB).length;

  const getOverallProgressPct = () => {
    let sum = 0;
    let count = 0;
    Object.values(progress).forEach((topicProgress) => {
      Object.values(topicProgress).forEach((modeProgress) => {
        if (modeProgress) {
          sum += modeProgress.pct;
          count++;
        }
      });
    });
    return count > 0 ? Math.round(sum / count) : 0;
  };

  const overallPct = getOverallProgressPct();

  // Pick up custom color layouts depending on the index
  const topicsList = Object.keys(VOCAB);

  return (
    <div className="pb-24">
      {/* Home Hero Content */}
      <div className="bg-slate-900 px-6 py-6 text-white dark:bg-slate-950">
        <div className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
          ★ {t('LINKSWELLE INSTITUT', 'LINKSWELLE INSTITUT')} ★
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight">{t('B1 Wortschatz Quiz', 'B1 Wortschatz Quiz')}</h1>
        <p className="text-xs text-slate-400 mt-0.5">{t('Premium Vocabulary • 100% Offline Compatible', 'B1 Wortschatz • Komplett offline')}</p>

        {/* Home dynamic tags row */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1 rounded-full bg-slate-850 px-3 py-1 text-slate-300">
            📚 {totalWordsCount} {t('words', 'Wörter')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-850 px-3 py-1 text-slate-300">
            🗂️ {activeTopicsCount} {t('topics', 'Themen')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-850 px-3 py-1 text-emerald-400">
            🎯 {overallPct}% {t('avg', 'Ø')}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-slate-850 px-3 py-1 text-amber-400">
            🔥 {streak.count} {t('days', 'Tage')}
          </span>
        </div>
      </div>

      {/* Profile summary banner */}
      <div
        className="flex items-center justify-between border-y border-gray-200 dark:border-slate-850 bg-white dark:bg-slate-900 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-850/50 cursor-pointer"
        onClick={() => onSetTab('profile')}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-2xl border border-violet-200 dark:bg-violet-950/30 dark:border-violet-850 overflow-hidden">
            {settings.photoUrl ? (
              <img src={settings.photoUrl} alt="Avatar" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              settings.avatar
            )}
          </div>
          <div>
            <div className="font-extrabold text-sm text-gray-800 dark:text-gray-100 flex items-center gap-1.5 animate-fade-in">
              <span>{settings.userName}</span>
              <span className="px-1.5 py-0.5 rounded-sm bg-violet-50 dark:bg-violet-950/30 text-[9px] font-black text-violet-600 dark:text-violet-400 border border-violet-100/30">
                {settings.cefrLevel || 'B1'}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">
              {streak.count > 0 ? t('Keep maintaining your streak!', 'Behalte deinen Streak bei!') : t('Study today to start a streak!', 'Heute lernen und Streak beginnen!')}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
          <span>🔥</span> {streak.count}
        </div>
      </div>

      {/* Daily learning goal block */}
      <div className="m-4">
        {/* Daily Goal Card */}
        <div className="rounded-2xl border border-gray-150/70 bg-white p-4 shadow-xs dark:bg-slate-900 dark:border-slate-850">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">
              🎯 {t('DAILY PRACTICE GOAL', 'TÄGLICHES ZIEL')}
            </span>
            <span className="text-xs font-black text-gray-700 dark:text-slate-205">
              {Math.min(settings.dailyGoal || 10, (() => {
                const todayKey = new Date().toISOString().split('T')[0];
                return activity[todayKey] || 0;
              })())} / {settings.dailyGoal || 10}
            </span>
          </div>
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.round(((() => {
                    const todayKey = new Date().toISOString().split('T')[0];
                    return activity[todayKey] || 0;
                  })() / (settings.dailyGoal || 10)) * 100))}%` 
                }}
              />
            </div>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-2 font-semibold">
            {(() => {
              const todayKey = new Date().toISOString().split('T')[0];
              const score = activity[todayKey] || 0;
              const g = settings.dailyGoal || 10;
              if (score >= g) return t("🎉 Daily target accomplished! Excellent work.", "🎉 Tagesziel erreicht! Hervorragende Arbeit.");
              return t(`Complete ${g - score} more rounds today!`, `Absolviere heute noch ${g - score} Runden!`);
            })()}
          </p>
        </div>
      </div>

      {/* Module 3 AI Conversation Lab Promo Banner */}
      <div className="mx-4 mb-2 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 p-5 text-white shadow-lg border border-pink-500/30 relative overflow-hidden select-none animate-fade-in">
        <div className="absolute right-3 -bottom-4 text-6xl opacity-15">🧪</div>
        <div className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">
          ★ {t("NEW MODULE 3 IS NOW ONLINE", "NEUES MODUL 3 IST JETZT ONLINE")} ★
        </div>
        <h3 className="text-base font-black mt-1 tracking-tight flex items-center gap-1.5 text-yellow-200">
          🧪 {t("Interactive KI-Labor Sandbox", "Interaktives KI-Labor")}
        </h3>
        <p className="text-[11px] text-white mt-1 leading-relaxed max-w-[90%] font-semibold">
          {t(
            "Engage in full-stack speech roleplay dialogues (At the Bakery, Im Taxi, Bei Arzt) or use the custom grammar composer with detailed CEFR professor feedback.",
            "Übe interaktive Rollenspiele (Bäcker, Taxi, Arzt) oder reiche eigene deutsche Aufsätze für eine detaillierte CEFR-Prüferbewertung ein."
          )}
        </p>
        <button
          onClick={() => onSetTab("lab")}
          className="mt-3.5 px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-lg transition active:scale-95 shadow-md cursor-pointer"
          type="button"
        >
          {t("Open AI Lab 🧪", "Labor betreten 🧪")}
        </button>
      </div>

      {/* Module 4 Culture Hub Promo Banner */}
      <div className="mx-4 mb-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 p-5 text-white shadow-lg border border-emerald-400/30 relative overflow-hidden select-none animate-fade-in">
        <div className="absolute right-3 -bottom-4 text-6xl opacity-15">🏰</div>
        <div className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">
          ★ {t("NEW MODULE 4 IS NOW ONLINE", "NEUES MODUL 4 IST JETZT ONLINE")} ★
        </div>
        <h3 className="text-base font-black mt-1 tracking-tight flex items-center gap-1.5 text-yellow-250">
          🏰 {t("German Culture & Case Arena", "Kultur & Redewendungen")}
        </h3>
        <p className="text-[11px] text-white mt-1 leading-relaxed max-w-[90%] font-semibold">
          {t(
            "Master authentic native idioms (e.g. Tomato Eyes, Train Station), train grammar dative & accusative cases, and check etiquette rules.",
            "Lerne echte Alltags-Idiome (Tomaten auf den Augen, Bahnhof verstehen), trainiere Dativ- und Akkusativ-Kasus und meistere den deutschen Knigge-Guide."
          )}
        </p>
        <button
          onClick={() => onSetTab("culture")}
          className="mt-3.5 px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-lg transition active:scale-95 shadow-md cursor-pointer"
          type="button"
        >
          {t("Enter Culture Arena 🏰", "Kultur-Arena betreten 🏰")}
        </button>
      </div>

      {/* Module 5 & 2 Business Correspondence & Tests suite Promo Banner */}
      <div className="mx-4 mb-2 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-650 p-5 text-white shadow-lg border border-orange-400/30 relative overflow-hidden select-none animate-fade-in">
        <div className="absolute right-3 -bottom-4 text-6xl opacity-15">🏆</div>
        <div className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">
          ★ {t("EXAM PREPARATION CENTER ONLINE", "PRÜFUNGSZENTRUM JETZT ONLINE")} ★
        </div>
        <h3 className="text-base font-black mt-1 tracking-tight flex items-center gap-1.5 text-yellow-250">
          🏆 {t("B1 Goethe-Zertifikat Exam Suite", "B1 Goethe-Prüfungszentrum")}
        </h3>
        <p className="text-[11px] text-white mt-1 leading-relaxed max-w-[90%] font-semibold">
          {t(
            "Complete comprehensive simulated exams: test oral pronunciation, listening comprehension, sentence syntax, formal letter assembly (RSVP, blog critique, landlord complaints) with active AI grading.",
            "Meistere alle B1-Prüfungsteile unter echten Bedingungen: Hören, Lesen, Aussprache, Satzbau sowie formelle Briefe und E-Mails mit präziser KI-Benotung."
          )}
        </p>
        <button
          onClick={() => onSetTab("exams")}
          className="mt-3.5 px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-black rounded-lg transition active:scale-95 shadow-md cursor-pointer"
          type="button"
        >
          {t("Enter Goethe Exam Center 🏆", "Prüfungszentrum betreten 🏆")}
        </button>
      </div>

      {/* Word of the Day widget */}
      <div className="m-4 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-5 text-white shadow-lg dark:from-slate-950 dark:to-slate-900 border border-indigo-950 dark:border-slate-850">
        <div className="text-[10px] font-extrabold tracking-widest text-indigo-300 uppercase">
          ⚡ {t('WORD OF THE DAY', 'WORT DES TAGES')}
        </div>
        <div className="mt-3 text-2xl font-black">{wod.g}</div>
        <div className="text-sm text-slate-300 mt-1 capitalize">
          {wod.t === 'n' ? `${t('noun', 'Nomen')}` : wod.t === 'v' ? `${t('verb', 'Verb')}` : `${t('adjective', 'Adjektiv')}`} • {wod.e}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => speak(wod.g, settings.ttsOn)}
            className="flex-1 rounded-xl bg-white/10 dark:bg-white/5 py-2 text-center text-xs font-extrabold text-white transition hover:bg-white/20 active:scale-95"
            type="button"
          >
            🔊 {t('Hear Speech', 'Aussprache hören')}
          </button>
          <button
            onClick={() => onToggleBookmark(wod)}
            className="flex-1 rounded-xl bg-white/10 dark:bg-white/5 py-2 text-center text-xs font-extrabold text-white transition hover:bg-white/20 active:scale-95"
            type="button"
          >
            {isBookmarked(wod.g) ? '🔖 ' + t('Saved', 'Gespeichert') : '🏷️ ' + t('Save Word', 'Wort merken')}
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="px-4">
        <h3 className="mb-3 px-2 text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
          📂 {t('VOCABULARY TOPICS', 'THEMENGEBIETE')}
        </h3>

        <div className="space-y-2">
          {topicsList.map((topic, index) => {
            const list = VOCAB[topic] || [];
            const count = list.length;
            const icon = ICONS[topic] || '📝';
            const colors = CLS[index % CLS.length] || 'bg-gray-50 text-gray-700';

            // Find best topic score
            const topicProgress = progress[topic] || {};
            const bestScore = Object.values(topicProgress).reduce(
              (best, current) => Math.max(best, current?.pct || 0),
              0
            );

            return (
              <div
                key={topic}
                onClick={() => onSelectTopic(topic)}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs hover:border-gray-200 dark:bg-slate-900 dark:border-slate-850/50 hover:bg-gray-50 dark:hover:bg-slate-850/50 cursor-pointer transition active:scale-[0.99]"
              >
                {/* Topic circular icon */}
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${colors}`}>
                  {icon}
                </div>

                {/* Topic details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-sm font-bold text-gray-800 dark:text-gray-100">{topic}</h4>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500">
                      {bestScore > 0 ? `${bestScore}%` : ''}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 dark:text-slate-400 mt-0.5">
                    {count} {t('B1 word entries', 'B1 Wortschatz-Einträge')}
                  </div>

                  {/* Visual progress bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 dark:bg-emerald-600 transition-all duration-500"
                      style={{ width: `${bestScore}%` }}
                    />
                  </div>
                </div>

                <div className="text-gray-300 dark:text-slate-600 font-extrabold text-lg">›</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
