import { Settings } from '../types';
import { motion } from 'motion/react';

const AVATARS = ['🧑', '👩', '👨', '🧑‍🎓', '👩‍🎓', '👨‍🎓', '🧑‍💻', '👩‍💼', '👨‍🏫', '🦁', '🐻', '🦊', '🌟', '🔥', '🎯'];

interface SettingsModalProps {
  settings: Settings;
  onUpdateSettings: (s: Partial<Settings>) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, onUpdateSettings, onClose }: SettingsModalProps) {
  const currentLang = settings.lang;

  // Language translation helpers
  const translate = (en: string, de: string) => (currentLang === 'de' ? de : en);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative w-full max-w-lg rounded-t-2xl bg-white p-6 pb-10 shadow-2xl dark:bg-slate-900 dark:text-gray-100 max-h-[85vh] overflow-y-auto border-t border-gray-100 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull handle */}
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-slate-700 cursor-pointer" onClick={onClose} />

        <div className="flex h-10 items-center justify-between border-b border-gray-100 pb-3 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <span>⚙️</span> {translate('Settings', 'Einstellungen')}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 py-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">{translate('Dark Theme', 'Dunkelmodus')}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{translate('Saves battery on OLED screens', 'Schont den Akku auf OLED-Displays')}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ dark: !settings.dark })}
              className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${
                settings.dark ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.dark ? 'translate-x-[22px]' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* TTS Speech Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-700 dark:text-gray-200">Text-to-Speech (Audio)</div>
              <p className="text-xs text-gray-500 dark:text-slate-400">{translate('Read German words aloud automatically', 'Deutsche Wörter automatisch vorlesen')}</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ttsOn: !settings.ttsOn })}
              className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none ${
                settings.ttsOn ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-slate-800'
              }`}
            >
              <div
                className={`h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.ttsOn ? 'translate-x-[22px]' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* App Translation Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              🌍 {translate('Interface Language', 'Oberflächensprache')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  settings.lang === 'en'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => onUpdateSettings({ lang: 'en' })}
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  settings.lang === 'de'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
                onClick={() => onUpdateSettings({ lang: 'de' })}
              >
                🇩🇪 Deutsch
              </button>
            </div>
          </div>

          {/* Text Font Size Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              🔡 {translate('Font Size', 'Schriftgröße')}
            </label>
            <div className="flex gap-2">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase transition ${
                    settings.fontSize === sz
                      ? 'bg-slate-900 text-white dark:bg-emerald-600'
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => onUpdateSettings({ fontSize: sz })}
                >
                  {sz === 'sm' ? translate('Small', 'Klein') : sz === 'md' ? translate('Normal', 'Normal') : translate('Large', 'Groß')} ({sz})
                </button>
              ))}
            </div>
          </div>

          {/* Customize Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300" htmlFor="username-input">
              ✏️ {translate('Your Name', 'Dein Name')}
            </label>
            <input
              id="username-input"
              type="text"
              maxLength={20}
              className="w-full rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 p-2.5 text-sm outline-none transition focus:border-slate-900 focus:bg-white dark:bg-slate-800 dark:text-white dark:focus:border-emerald-500 font-bold"
              placeholder={translate('Enter your name', 'Namen eingeben')}
              value={settings.userName}
              onChange={(e) => onUpdateSettings({ userName: e.target.value })}
            />
          </div>

          {/* Daily Goals Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                🎯 {translate('Daily Practice Goal', 'Tägliches Lernziel')}
              </label>
              <span className="text-xs font-black text-indigo-600 dark:text-emerald-400">
                {settings.dailyGoal || 10} {translate('rounds', 'Runden')}
              </span>
            </div>
            <div className="flex gap-2">
              {[5, 10, 20, 50].map((gl) => (
                <button
                  key={gl}
                  type="button"
                  onClick={() => onUpdateSettings({ dailyGoal: gl })}
                  className={`flex-1 rounded-xl py-2 text-xs font-extrabold transition border ${
                    (settings.dailyGoal || 10) === gl
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-emerald-600 dark:border-emerald-600'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-transparent dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {gl}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo Uploader */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              📸 {translate('Profile Picture Option', 'Profilbild hochladen')}
            </label>
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-850 flex items-center justify-center select-none shrink-0">
                {settings.photoUrl ? (
                  <img src={settings.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xl">📷</span>
                )}
              </div>
              <div className="flex-1 space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  id="settings-photo-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 120;
                        canvas.height = 120;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          const size = Math.min(img.width, img.height);
                          const sx = (img.width - size) / 2;
                          const sy = (img.height - size) / 2;
                          ctx.drawImage(img, sx, sy, size, size, 0, 0, 120, 120);
                          const compressed = canvas.toDataURL('image/jpeg', 0.85);
                          onUpdateSettings({ photoUrl: compressed });
                        }
                      };
                      img.src = event.target?.result as string;
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                <div className="flex gap-2">
                  <label
                    htmlFor="settings-photo-upload"
                    className="cursor-pointer rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-xs font-extrabold text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition active:scale-95 border border-transparent"
                  >
                    {translate('Choose Photo', 'Foto wählen')}
                  </label>
                  {settings.photoUrl && (
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ photoUrl: undefined })}
                      className="rounded-lg bg-rose-50 hover:bg-rose-100 px-3 py-1.5 text-xs font-extrabold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 transition"
                    >
                      {translate('Reset', 'Entfernen')}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 leading-snug">
                  {translate('Upload custom JPG/PNG image, resized dynamically for premium offline loading.', 'Lade dein eigenes Foto hoch, automatisch für schnelle Ladezeiten optimiert.')}
                </p>
              </div>
            </div>
          </div>

          {/* Customize Avatar Selection Grid (used if no photo) */}
          {!settings.photoUrl && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                🧑 {translate('Select Backup Avatar Emoji', 'Ersatz-Avatar wählen')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => onUpdateSettings({ avatar: av })}
                    className={`aspect-square flex items-center justify-center rounded-xl bg-gray-50 text-xl border-2 transition dark:bg-slate-800 ${
                      settings.avatar === av
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-emerald-500 dark:bg-emerald-900/20'
                        : 'border-transparent hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {translate('Save & Apply', 'Einstellungen speichern')}
        </button>
      </motion.div>
    </div>
  );
}
