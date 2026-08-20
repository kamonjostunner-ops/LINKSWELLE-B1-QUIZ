import { Word } from '../types';
import { speak } from '../utils/audio';

interface SavedViewProps {
  bookmarks: Word[];
  onToggleBookmark: (word: Word) => void;
  lang: 'en' | 'de';
}

export default function SavedView({ bookmarks, onToggleBookmark, lang }: SavedViewProps) {
  const t = (en: string, de: string) => (lang === 'de' ? de : en);

  const handleExportHtml = () => {
    if (bookmarks.length === 0) return;

    const rows = bookmarks
      .map(
        (w) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 16px; font-weight: 800; color: #1e293b;">${w.g}</td>
        <td style="padding: 12px 16px; color: #475569; capitalize">${w.e}</td>
        <td style="padding: 12px 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase;">
          ${w.t === 'n' ? 'Noun' : w.t === 'v' ? 'Verb' : 'Adjective'}
        </td>
      </tr>`
      )
      .join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Linkswelle B1 Bookmarked Words Sheet</title>
  <style>
    body { font-family: -apple-system, sans-serif; background-color: #f8fafc; color: #334155; padding: 40px; margin: 0; }
    .card { background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); max-width: 800px; margin: 0 auto; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 32px; color: white; }
    h1 { margin: 0; font-size: 24px; font-weight: 950; }
    p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 14px 16px; background-color: #f1f5f9; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #64748b; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🔖 Linkswelle B1 Wortschatz</h1>
      <p>Your Bookmarked Vocabulary List • Compiled on ${new Date().toLocaleDateString()} (${bookmarks.length} words)</p>
    </div>
    <table>
      <thead>
        <tr>
          <th>German (Deutsch)</th>
          <th>English Translation</th>
          <th>Grammar Type</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    // Download compiled html file directly
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Linkswelle_B1_Bookmarks.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-24">
      {/* Title Navbar with Export to HTML sheet */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <h2 className="text-base font-extrabold flex items-center gap-1.5">
          <span>🔖</span> {t('Saved Words', 'Gespeicherte Wörter')}
        </h2>
        {bookmarks.length > 0 && (
          <button
            onClick={handleExportHtml}
            className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95"
            type="button"
            title={t('Export HTML word list', 'Als Liste downloaden')}
          >
            📄 {t('Export Sheet', 'Exportieren')}
          </button>
        )}
      </div>

      <div className="p-4">
        {bookmarks.length > 0 ? (
          <div className="space-y-2 select-none">
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold px-1 uppercase tracking-wider">
              {bookmarks.length} {t('bookmarked vocabulary entries', 'gespeicherte Vokabeln')}
            </p>

            <div className="space-y-2">
              {bookmarks.map((w) => (
                <div
                  key={w.g}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-gray-150 bg-white p-4 shadow-3xs dark:bg-slate-900 dark:border-slate-850/50"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-black text-slate-800 dark:text-slate-100 capitalize truncate">
                      {w.g}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{w.e}</p>
                  </div>

                  {/* Play audio / Delete saved */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speak(w.g, true)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-55 hover:bg-gray-100 dark:bg-slate-800 text-lg active:scale-95 transition"
                      type="button"
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => onToggleBookmark(w)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-55 hover:bg-gray-100 text-slate-400 dark:text-slate-500 hover:text-red-500 active:scale-95 dark:bg-slate-800 text-lg transition"
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center select-none">
            <div className="text-5xl mb-4">🔖</div>
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
              {t('No saved words yet', 'Keine gemerkten Wörter')}
            </h3>
            <p className="text-xs text-gray-400 mt-1 dark:text-slate-450 leading-relaxed max-w-xs mx-auto">
              {t(
                'Click the bookmark icon (🏷️) during quizzes or search queries to store words here for offline revision.',
                'Tippe während der Tests oder bei der Suche auf das Bookmark-Symbol (🏷️), um Wörter zur Wiederholung zu speichern.'
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
