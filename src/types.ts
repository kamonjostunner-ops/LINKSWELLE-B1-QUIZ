export interface Word {
  g: string; // German string
  e: string; // English meaning
  t: 'n' | 'v' | 'a'; // Type: noun, verb, adjective/adverb
}

export type QuizMode =
  | 'all'
  | 'meaning'
  | 'article'
  | 'verb'
  | 'adjective'
  | 'speed'
  | 'write'
  | 'listen'
  | 'flashcard'
  | 'sentence';

export interface Question {
  type: QuizMode;
  label: string;
  word: string;
  sub: string;
  opts: string[];
  ans: number | string; // index of correct option or the exact string for writing tests
  raw?: Word;
  german?: string; // used for listening practice
}

export interface QuizProgress {
  [topic: string]: {
    [mode in QuizMode]?: {
      correct: number;
      total: number;
      pct: number;
      ts: number;
    };
  };
}

export interface HighScore {
  topic: string;
  mode: QuizMode;
  pct: number;
  correct: number;
  total: number;
  ts: number;
}

export interface Streak {
  count: number;
  lastDate: string;
}

export interface Settings {
  dark: boolean;
  ttsOn: boolean;
  lang: 'en' | 'de';
  fontSize: 'sm' | 'md' | 'lg';
  avatar: string;
  userName: string;
  photoUrl?: string; // Custom Base64 profile picture string
  dailyGoal?: number; // Daily words/questions goal (e.g. 10, 20, 50)
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'; // Guided level path
  lastBuildConfig?: any; // Auto-generated build config matching CLI requirements
}
