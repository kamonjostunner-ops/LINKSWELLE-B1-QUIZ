import { useState } from 'react';
import { Word } from '../types';
import { VOCAB, ICONS, CLS } from '../data/vocab';
import { speak } from '../utils/audio';

interface SearchViewProps {
  onToggleBookmark: (word: Word) => void;
  isBookmarked: (wordStr: string) => boolean;
  lang: 'en' | 'de';
}

interface SearchEntry extends Word {
  topicName: string;
  topicIdx: number;
}

export default function SearchView({ onToggleBookmark, isBookmarked, lang }: SearchViewProps) {
  const t = (en: string, de: string) => (lang === 'de' ? de : en);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchEntry[]>([]);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }

    const lower = val.trim().toLowerCase();
    const list: SearchEntry[] = [];

    Object.entries(VOCAB).forEach(([topic, words], topicIdx) => {
      words.forEach((w) => {
        if (w.g.toLowerCase().includes(lower) || w.e.toLowerCase().includes(lower)) {
          list.push({ ...w, topicName: topic, topicIdx });
        }
      });
    });

    setResults(list.slice(0, 50)); // cap at 50 results for extreme responsiveness
  };

  return (
    <div className="pb-24">
      {/* Title Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <h2 className="text-base font-extrabold flex items-center gap-1.5">
          <span>🔍</span> {t('Dictionary Lookup', 'Wortschatz-Suche')}
        </h2>
      </div>

      <div className="p-4">
        {/* Search Bar Input */}
        <div className="relative flex items-center rounded-2xl border border-gray-150 bg-white px-4 py-3 shadow-xs dark:bg-slate-900 dark:border-slate-800 focus-within:border-slate-800 focus-within:ring-1 focus-within:ring-slate-800 focus-within:bg-white transition duration-150">
          <span className="text-gray-400 mr-2 text-lg">🔍</span>
          <input
            id="lookup-dictionary-prompt"
            type="text"
            className="w-full bg-transparent text-sm outline-none text-slate-800 dark:text-white"
            placeholder={t('Search German words or English meanings...', 'Deutsches Wort oder Bedeutung suchen...')}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {query.trim() && (
            <button
              onClick={() => handleSearch('')}
              className="text-gray-400 hover:text-gray-600 font-extrabold text-sm ml-2"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results Container list */}
        <div className="mt-5 space-y-2 select-none">
          {results.length > 0 ? (
            results.map((w) => {
              const icon = ICONS[w.topicName] || '📂';
              const colors = CLS[w.topicIdx % CLS.length] || 'bg-gray-100 text-gray-800';

              return (
                <div
                  key={w.g}
                  className="flex items-center gap-3.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs dark:bg-slate-900 dark:border-slate-850/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-gray-800 dark:text-gray-100 capitalize truncate">
                        {w.g}
                      </h4>
                      <span className={`rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase ${colors}`}>
                        {icon} {w.topicName.split(' ')[0]}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 dark:text-slate-400 font-medium capitalize">
                      {w.e}
                    </div>
                  </div>

                  {/* Immediate actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => speak(w.g, true)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      type="button"
                    >
                      🔊
                    </button>
                    <button
                      onClick={() => onToggleBookmark(w)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-lg dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      type="button"
                    >
                      {isBookmarked(w.g) ? '🔖' : '🏷️'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : query.trim() ? (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500 font-bold">
              {t('No matches found. Try another spelling.', 'Keine Ergebnisse gefunden. Versuche eine andere Schreibweise.')}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400 dark:text-slate-500 font-semibold select-none flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📚</span>
              <span>{t('Type in the search bar to query the comprehensive dictionary database.', 'Suche im umfassenden B1-Wortschatz nach Begriffen und Übersetzungen.')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
