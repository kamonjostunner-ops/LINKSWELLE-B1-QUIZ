let voices: SpeechSynthesisVoice[] = [];
let ttsUnlocked = false;

// Preload voices
const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    voices = window.speechSynthesis.getVoices() || [];
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

// Bulletproof gesture TTS unlock (especially for iOS and Android WebViews)
export const unlockTTS = () => {
  if (ttsUnlocked || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    u.lang = 'de-DE';
    window.speechSynthesis.speak(u);
    ttsUnlocked = true;
    console.log('TTS Speech Engine Unlocked Successfully');
  } catch (e) {
    console.error('TTS unlock failed:', e);
  }
};

const pickDeVoice = (): SpeechSynthesisVoice | null => {
  if (voices.length === 0) {
    loadVoices();
  }
  return (
    voices.find((v) => v.lang === 'de-DE' && v.localService) ||
    voices.find((v) => v.lang === 'de-DE') ||
    voices.find((v) => v.lang && v.lang.startsWith('de')) ||
    null
  );
};

export const speak = (text: string, isTtsEnabled: boolean = true) => {
  if (!isTtsEnabled || !text || typeof window === 'undefined') return;
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  unlockTTS();

  try {
    // Cancel any current utterance
    window.speechSynthesis.cancel();

    // Prepare text to speak (strip article decorations if necessary or speak as-is)
    // E.g. "die Abteilung" should speak perfectly
    const cleanText = text.trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.85; // Slightly slower for clear B1 learning pronunciation
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = pickDeVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Keepalive loop (fixes a chrome/webview bug where long utterances get cut off after 15s)
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);

    const keepAlive = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(keepAlive);
        return;
      }
      try {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } catch (err) {}
    }, 5000);

    utterance.onend = () => {
      clearInterval(keepAlive);
    };

    utterance.onerror = (e) => {
      clearInterval(keepAlive);
      console.error('SpeechSynthesis Utterance error:', e);
    };
  } catch (err) {
    console.error('TTS execution error:', err);
  }
};
