import React, { useState, useEffect } from 'react';
import { Word, Settings, HighScore } from '../types';

interface ProfileViewProps {
  settings: Settings;
  streak: { count: number; lastDate: string };
  bookmarks: Word[];
  highscores: Record<string, HighScore>;
  weakWords: Word[];
  onStartWeakWordsTraining: () => void;
  onOpenSettings: () => void;
  onUpdateSettings?: (s: Partial<Settings>) => void;
  onExportSaved: () => void;
  lang: 'en' | 'de';
}

export default function ProfileView({
  settings,
  streak,
  bookmarks,
  highscores,
  weakWords,
  onStartWeakWordsTraining,
  onOpenSettings,
  onExportSaved,
  onUpdateSettings,
  lang,
}: ProfileViewProps) {
  const t = (en: string, de: string) => (lang === 'de' ? de : en);

  const medals = ['🥇', '🥈', '🥉'];

  // SEEDED FRIENDS FOR SCOREBOARD COMPETITION
  const [friends, setFriends] = useState<{ name: string; level: string; score: number; avatar: string; isUser?: boolean }[]>(() => {
    try {
      const stored = localStorage.getItem('lw_friends');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { name: 'Lucas Meyer', level: 'B2', score: 940, avatar: '🦊' },
      { name: 'Sarah Connor', level: 'B1', score: 820, avatar: '🦄' },
      { name: 'Emilia Schmidt', level: 'A2', score: 450, avatar: '🐨' }
    ];
  });

  // LOCAL ACCOUNTS DATABASE SWITCHER
  const [profiles, setProfiles] = useState<{ id: string; userName: string; avatar: string; photoUrl?: string; cefrLevel: string }[]>(() => {
    try {
      const stored = localStorage.getItem('lw_profiles');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: '1', userName: settings.userName, avatar: settings.avatar, photoUrl: settings.photoUrl, cefrLevel: settings.cefrLevel || 'B1' },
      { id: '2', userName: 'Leonie (Guest)', avatar: '🐼', cefrLevel: 'A1' },
      { id: '3', userName: 'Max (Partner)', avatar: '🤖', cefrLevel: 'B2' }
    ];
  });

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendLevelInput, setFriendLevelInput] = useState('B1');
  const [friendScoreInput, setFriendScoreInput] = useState('500');
  
  const [showAddProfile, setShowAddProfile] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');
  const [profileLevelInput, setProfileLevelInput] = useState('B1');

  // Handle saving lists to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lw_friends', JSON.stringify(friends));
    } catch {}
  }, [friends]);

  useEffect(() => {
    try {
      localStorage.setItem('lw_profiles', JSON.stringify(profiles));
    } catch {}
  }, [profiles]);

  // Keep profiles updated with any changes to the current logged-in profile
  useEffect(() => {
    setProfiles(prev => prev.map(p => {
      if (p.id === '1') {
        return {
          ...p,
          userName: settings.userName,
          avatar: settings.avatar,
          photoUrl: settings.photoUrl,
          cefrLevel: settings.cefrLevel || 'B1'
        };
      }
      return p;
    }));
  }, [settings]);

  // Sort and pick top 3 high scores
  const scoreList = Object.values(highscores)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  // Dynamic user points calculated from highscore results and streaks
  const userScore = Object.values(highscores).reduce((sum, h) => sum + h.pct * 8, 0) + (streak.count * 50);

  // Combine user with friends for a dynamic scoreboard
  const combinedCompetitors = [
    ...friends.map(f => ({ ...f, isUser: false })),
    { name: `${settings.userName} (${t('You', 'Du')})`, level: settings.cefrLevel || 'B1', score: userScore, avatar: settings.avatar, photoUrl: settings.photoUrl, isUser: true }
  ].sort((a, b) => b.score - a.score);

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim()) return;
    const scoreVal = parseInt(friendScoreInput, 10) || 300;
    setFriends([...friends, {
      name: friendNameInput.trim(),
      level: friendLevelInput,
      score: scoreVal,
      avatar: ['🦁', '🐯', '🐼', '🐰', '🦊', '🦉'][Math.floor(Math.random() * 6)]
    }]);
    setFriendNameInput('');
    setShowAddFriend(false);
  };

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileNameInput.trim()) return;
    setProfiles([...profiles, {
      id: String(Date.now()),
      userName: profileNameInput.trim(),
      avatar: ['🧑‍🎨', '👩‍🚀', '👨‍🚒', '👩‍💻', '👨‍💻', '🕵️'][Math.floor(Math.random() * 6)],
      cefrLevel: profileLevelInput
    }]);
    setProfileNameInput('');
    setShowAddProfile(false);
  };

  const handleSwitchProfile = (p: typeof profiles[number]) => {
    if (!onUpdateSettings) return;
    // Update settings in memory which will automatically rewrite localStorage values
    onUpdateSettings({
      userName: p.userName,
      avatar: p.avatar,
      photoUrl: p.photoUrl,
      cefrLevel: p.cefrLevel as any
    });
  };

  return (
    <div className="pb-24">
      {/* Title Navbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-900 px-4 py-4.5 text-white dark:bg-slate-950 border-b border-slate-800">
        <h2 className="text-base font-extrabold flex items-center gap-1.5 font-sans">
          <span>👤</span> {t('My Profile', 'Dein Profil')}
        </h2>
        <button
          onClick={onOpenSettings}
          className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-350 hover:bg-slate-700 active:scale-95 transition"
          type="button"
        >
          ⚙️ {t('Edit', 'Bearbeiten')}
        </button>
      </div>

      {/* Linkswelle Student Card Profile Hero */}
      <div className="bg-slate-900 py-8 text-center text-white dark:bg-slate-950/95 border-b border-slate-850 relative overflow-hidden">
        {/* Subtle watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <span className="text-4xl font-black tracking-widest uppercase">LINKSWELLE</span>
        </div>
        
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100/10 text-[42px] border-2 border-violet-400 dark:bg-violet-950/20 overflow-hidden relative z-10 shadow-lg">
          {settings.photoUrl ? (
            <img src={settings.photoUrl} alt="Avatar" className="h-full w-full object-cover animate-fade-in" />
          ) : (
            settings.avatar
          )}
        </div>
        <h3 className="mt-4 text-xl font-black relative z-10">{settings.userName}</h3>
        
        <div className="mt-2.5 inline-flex flex-col items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 relative z-10 shadow-xs">
          <span className="text-[9px] font-black tracking-widest text-yellow-300 uppercase">
            ★ LINKSWELLE INSTITUT STUDENT CARD ★
          </span>
          <span className="text-xs text-emerald-400 font-extrabold">
            {t(`Level ${settings.cefrLevel || 'B1'} Student ID: LW-${userScore}-2026`, `Niveau ${settings.cefrLevel || 'B1'} Deutsch-ID: LW-${userScore}-2026`)}
          </span>
        </div>
      </div>

      {/* Streak grid metric numbers */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-150 bg-white py-4 dark:bg-slate-900 dark:border-slate-850 dark:divide-slate-850 text-center select-none">
        <div>
          <div className="text-xl font-black text-slate-800 dark:text-white">{streak.count}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-450 mt-0.5 uppercase tracking-wide">
            🔥 {t('Streak', 'Streak')}
          </div>
        </div>
        <div>
          <div className="text-xl font-black text-slate-800 dark:text-white">{scoreList.length > 0 ? `${scoreList[0].pct}%` : '0%'}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-450 mt-0.5 uppercase tracking-wide">
            🏆 {t('Best', 'Beste')}
          </div>
        </div>
        <div>
          <div className="text-xl font-black text-slate-800 dark:text-white">{Object.keys(highscores).length}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-450 mt-0.5 uppercase tracking-wide">
            📝 {t('Tests', 'Tests')}
          </div>
        </div>
        <div>
          <div className="text-xl font-black text-slate-800 dark:text-white">{bookmarks.length}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-slate-450 mt-0.5 uppercase tracking-wide">
            🔖 {t('Saved', 'Gemerkt')}
          </div>
        </div>
      </div>

      {/* Scoring records list */}
      <div className="p-4 space-y-5 select-none">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50">
          <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase mb-4">
            🏆 {t('TOP HIGH SCORES', 'DEINE BESTLEISTUNGEN')}
          </h3>

          <div className="space-y-3.5">
            {scoreList.length > 0 ? (
              scoreList.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">{medals[i] || '🎖️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
                      {h.topic}
                    </div>
                    <div className="text-[10.5px] text-gray-400 dark:text-slate-450 mt-0.5 capitalize font-medium">
                      {h.mode} round • {h.correct}/{h.total} correct
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{h.pct}%</span>
                </div>
              ))
            ) : (
              <div className="py-2 text-center text-xs text-gray-400 dark:text-slate-550 font-bold">
                {t('No scores logged. Take vocabulary quizzes to set records!', 'Noch keine Einträge. Absolviere Quizzes, um Rekorde aufzustellen!')}
              </div>
            )}
          </div>
        </div>

        {/* Friends Competition Scoreboard Card */}
        <div id="friends-scoreboard" className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
              👥 {t('FRIENDS LEAGUE & RANK', 'FREUNDSCHAFTS-LIGA')}
            </h3>
            <button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="text-[11px] font-black text-violet-600 dark:text-emerald-400 hover:opacity-80 transition"
              type="button"
            >
              ➕ {t('Add Friend', 'Freund hinzufügen')}
            </button>
          </div>

          {showAddFriend && (
            <form onSubmit={handleAddFriend} className="mb-4 p-3 bg-gray-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-gray-100 dark:border-slate-800">
              <input
                type="text"
                maxLength={18}
                placeholder={t('Friend name', 'Name des Freundes')}
                value={friendNameInput}
                onChange={(e) => setFriendNameInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white p-2 text-xs outline-none dark:bg-slate-900 dark:text-white"
              />
              <div className="flex gap-2">
                <select
                  value={friendLevelInput}
                  onChange={(e) => setFriendLevelInput(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-slate-800 bg-white p-2 text-xs dark:bg-slate-900 dark:text-white font-extrabold"
                >
                  {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                    <option key={lvl} value={lvl}>Level {lvl}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  placeholder={t('XP Points', 'XP Punkte')}
                  value={friendScoreInput}
                  onChange={(e) => setFriendScoreInput(e.target.value)}
                  className="w-1/3 rounded-lg border border-gray-200 dark:border-slate-800 bg-white p-2 text-xs outline-none dark:bg-slate-900 dark:text-white text-center font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 dark:bg-emerald-600 text-xs text-white p-2 font-black transition hover:opacity-90"
              >
                {t('Confirm Connect', 'Hinzufügen')}
              </button>
            </form>
          )}

          <div className="space-y-3">
            {combinedCompetitors.map((competitor, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 p-2 rounded-xl transition ${
                  competitor.isUser ? 'bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/40 dark:border-violet-900/10 font-bold text-violet-700 dark:text-emerald-400 font-bold' : ''
                }`}
              >
                <span className="text-xs font-black text-gray-400 dark:text-slate-500 w-5 text-center">
                  #{idx + 1}
                </span>
                <span className="text-base select-none">{competitor.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-extrabold text-slate-800 dark:text-gray-105 truncate flex items-center gap-1.5">
                    <span>{competitor.name}</span>
                    <span className="text-[9px] px-1 rounded bg-gray-100 dark:bg-slate-850 text-gray-500 dark:text-slate-400 font-bold">
                      {competitor.level}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold">
                    {competitor.score} XP
                  </div>
                </div>
                {idx === 0 && <span className="text-sm">👑</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Local Multiple Accounts switching panel */}
        <div id="local-switcher" className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase">
              👥 {t('LEARNER PORTAL (LOCAL LOGINS)', 'LERNPORTAL (PROFILE)')}
            </h3>
            <button
              onClick={() => setShowAddProfile(!showAddProfile)}
              className="text-[11px] font-black text-violet-600 dark:text-emerald-400 hover:opacity-80 transition"
              type="button"
            >
              ➕ {t('New profile', 'Profil erstellen')}
            </button>
          </div>

          {showAddProfile && (
            <form onSubmit={handleAddProfile} className="mb-4 p-3 bg-gray-50 dark:bg-slate-950/40 rounded-xl space-y-2 border border-gray-150 dark:border-slate-800">
              <input
                type="text"
                maxLength={18}
                placeholder={t('Profile Name', 'Profilname')}
                value={profileNameInput}
                onChange={(e) => setProfileNameInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white p-2 text-xs outline-none dark:bg-slate-900 dark:text-white"
              />
              <select
                value={profileLevelInput}
                onChange={(e) => setProfileLevelInput(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-white p-2 text-xs dark:bg-slate-900 dark:text-white font-extrabold"
              >
                {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 dark:bg-emerald-600 text-xs text-white p-2 font-black transition hover:opacity-90"
              >
                {t('Register & Log In', 'Registrieren & Einloggen')}
              </button>
            </form>
          )}

          <p className="text-[10px] text-gray-400 dark:text-slate-500 mb-3 font-semibold leading-relaxed">
            {t('Instantly switch profiles below to practice. Perfect for friends on the same device.', 'Wechsle unten direkt dein Profil zum Lernen – ideal für mehrere Personen auf einem Gerät.')}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {profiles.map((p) => {
              const active = p.userName === settings.userName;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSwitchProfile(p)}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-95 ${
                    active 
                      ? 'border-violet-500 bg-violet-50/10 dark:border-emerald-500 dark:bg-emerald-950/10' 
                      : 'border-gray-150 hover:bg-gray-50 dark:border-slate-850 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt="Avatar" className="h-full w-full object-cover animate-fade-in" />
                    ) : (
                      p.avatar
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-800 dark:text-gray-150 truncate flex items-center gap-1">
                      {p.userName}
                    </div>
                    <div className="text-[9.5px] text-gray-400 dark:text-slate-450 mt-0.5 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <span>lvl {p.cefrLevel}</span>
                      {active && <span className="text-emerald-500">● {t('Active', 'Aktiv')}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Train Mistakes module card */}
        {weakWords.length > 0 && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 dark:bg-slate-950/20 dark:border-rose-950/30">
            <h3 className="text-sm font-black text-rose-800 dark:text-rose-400">
              ⚠️ {t('Weak Words Detected', 'Schwache Wörter erfasst')}
            </h3>
            <p className="text-xs text-rose-700/80 mt-1 dark:text-rose-450/80 leading-relaxed font-medium">
              {t(
                `You have ${weakWords.length} words that you frequently miss in quizzes. Practice now to commit them to memory!`,
                `Du hast ${weakWords.length} Vokabeln erfasst, die du oft falsch beantwortest. Trainiere sie gezielt, um sie dir zu merken.`
              )}
            </p>
            <button
              onClick={onStartWeakWordsTraining}
              className="mt-4 w-full rounded-xl bg-rose-600 py-3 text-center text-xs font-black text-white hover:bg-rose-700 transition active:scale-97"
              type="button"
            >
              🎯 {t('Train Missed Words', 'Fehlerhafte Wörter lernen')}
            </button>
          </div>
        )}

        {/* Global utility links panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 dark:bg-slate-900 dark:border-slate-850/50 space-y-2.5">
          <h3 className="text-xs font-black tracking-wider text-gray-400 dark:text-slate-500 uppercase mb-3">
            ⚙️ {t('PREFERENCES', 'EINSTELLUNGEN')}
          </h3>
          <button
            onClick={onOpenSettings}
            className="w-full text-left rounded-xl border border-gray-150 p-4 text-sm font-bold text-slate-700 hover:bg-gray-50 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-205 dark:hover:bg-slate-800 hover:border-gray-250 transition"
            type="button"
          >
            ⚙️ {t('Open Configuration dashboard', 'Einstellungen öffnen')}
          </button>

          {bookmarks.length > 0 && (
            <button
              onClick={onExportSaved}
              className="w-full text-left rounded-xl border border-gray-150 p-4 text-sm font-bold text-slate-700 hover:bg-gray-50 dark:bg-slate-850 dark:border-slate-800 dark:text-slate-205 dark:hover:bg-slate-800 hover:border-gray-250 transition"
              type="button"
            >
              📄 {t('Download Bookmarked Revision Sheet', 'Als HTML-Liste herunterladen')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
