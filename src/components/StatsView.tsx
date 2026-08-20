import { Word, QuizProgress } from '../types';
import { VOCAB, ICONS } from '../data/vocab';

interface StatsViewProps {
  progress: QuizProgress;
  activity: Record<string, number>;
  weakWords: Word[];
  onStartWeakWordsTraining: () => void;
  lang: 'en' | 'de';
}

export default function StatsView({
  progress,
  activity,
  weakWords,
  onStartWeakWordsTraining,
  lang,
}: StatsViewProps) {
  const t = (en: string, de: string) => (lang === 'de' ? de : en);

  const topicsList = Object.keys(VOCAB);

  // Overall Statistics computation
  const getOverallProgressDetails = () => {
    let sum = 0;
    let count = 0;
    Object.values(progress).forEach((topicObj) => {
      Object.values(topicObj).forEach((modeObj) => {
        if (modeObj) {
          sum += modeObj.pct;
          count++;
        }
      });
    });
    return {
      pct: count > 0 ? Math.round(sum / count) : 0,
      quizzesDone: count,
    };
  };

  const stat = getOverallProgressDetails();

  // Compute last 28 days list for studies heatmap
  const getHeatmapCells = () => {
    const list = [];
    const nowTime = new Date().setHours(0, 0, 0, 0);

    for (let i = 27; i >= 0; i--) {
      const targetDate = new Date(nowTime - i * 86400000);
      const str = targetDate.toISOString().slice(0, 10);
      const studyPoints = activity[str] || 0;
      list.push({ date: str, count: studyPoints });
    }
    return list;
  };

  const heatmapList = getHeatmapCells();

  return (
    <div className="pb-24">
      {/* Title Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <h2 className="text-base font-extrabold flex items-center gap-1.5">
          <span>📊</span> {t('Study Progress', 'Lernstatistik')}
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Overall circular card code */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center dark:bg-slate-900 dark:border-slate-850/50">
          <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
            {t('OVERALL PROGRESS RATE', 'GESAMTFORTSCHRITT')}
          </h3>
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-emerald-500">
              <span className="text-4xl font-black text-gray-800 dark:text-white">
                {stat.pct}
                <span className="text-sm font-semibold text-gray-400">%</span>
              </span>
            </div>
            <div className="text-xs font-bold text-gray-500 mt-3 dark:text-slate-400">
              {stat.quizzesDone} {t('quizzes completed', 'Tests absolviert')}
            </div>
          </div>
        </div>

        {/* Charts and bars score card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50">
          <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase mb-4">
            {t('BEST SCORE PER TOPIC', 'BESTER TEST JE KATEGORIE')}
          </h3>
          <div className="space-y-3.5">
            {topicsList.map((tp, idx) => {
              const bestScore = Object.values(progress[tp] || {}).reduce((acc, curr) => Math.max(best, curr?.pct || 0), 0);
              const best = bestScore; // shorthand helper

              let barColor = 'bg-rose-500';
              if (best >= 80) {
                barColor = 'bg-emerald-500';
              } else if (best >= 50) {
                barColor = 'bg-amber-500';
              }

              return (
                <div key={tp} className="flex items-center gap-3">
                  <span className="w-24 truncate text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
                    {ICONS[tp] || '📝'} {tp}
                  </span>
                  <div className="h-4 flex-1 rounded-full bg-gray-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${best}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-left text-xs font-extrabold text-gray-700 dark:text-slate-300">
                    {best}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GitHub Heatmap activity card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50">
          <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase mb-2">
            🔥 {t('ACTIVITY LOG (Last 28 days)', 'AKTIVITÄTSMETER (Letzte 28 Tage)')}
          </h3>
          <p className="text-[10px] text-gray-400 mt-1 dark:text-slate-450 leading-relaxed mb-4">
            {t('Visualizing your commitment. Greener cells mark sessions cleared.', 'Farbige Zellen stehen für absolvierte Übungssitzungen am jeweiligen Tag.')}
          </p>

          <div className="grid grid-cols-7 gap-2">
            {heatmapList.map((cell) => {
              let colorCls = 'bg-gray-100 dark:bg-slate-850';
              if (cell.count > 0) {
                if (cell.count >= 8) colorCls = 'bg-emerald-600 dark:bg-emerald-500';
                else if (cell.count >= 4) colorCls = 'bg-emerald-450 dark:bg-emerald-650';
                else if (cell.count >= 2) colorCls = 'bg-emerald-300 dark:bg-emerald-800';
                else colorCls = 'bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300/10';
              }

              return (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} points`}
                  className={`aspect-square rounded-md transition duration-150 ${colorCls}`}
                />
              );
            })}
          </div>
        </div>

        {/* Weak Words checklist helper */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3 dark:border-slate-850">
            <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
              ⚠️ {t('WEAK WORDS TRACKER', 'SCHWACHE WÖRTER')}
            </h3>
            {weakWords.length > 0 && (
              <button
                type="button"
                onClick={onStartWeakWordsTraining}
                className="rounded-lg bg-orange-600 px-3 py-1 font-black text-[10px] tracking-wide text-white uppercase active:scale-95 transition"
              >
                {t('Train Weak', 'Lernen')}
              </button>
            )}
          </div>

          <div className="mt-4 space-y-2">
            {weakWords.length > 0 ? (
              weakWords.slice(0, 5).map((w, index) => (
                <div
                  key={w.g}
                  className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-slate-850/50 p-3 border border-gray-100/50 dark:border-slate-800/50"
                >
                  <div>
                    <div className="text-sm font-black text-slate-800 dark:text-white capitalize">{w.g}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-400 capitalize">{w.e}</div>
                  </div>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-250/25">
                    {t('Missed', 'Fehler')}: {index + 1}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 dark:text-slate-500 font-semibold font-medium">
                {t('No weak words captured! Clear quizzes to detect mistakes.', 'Keine fehlerhaften Wörter erfasst! Vokabeltests abschließen für Detektion.')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
