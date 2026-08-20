# Project Customization & System Context

This file serves as the permanent source of truth for the workspace. It captures project-specific rules, architecture patterns, and the recent structural extensions implemented globally across the app.

---

## 🚀 Recent Core Upgrades & Feature Architecture

### 1. Unified Multi-Level Progress Tracking
* **The Concept**: Previously, level segmentation was restricted to the general "Full Quiz" mode. We have rebuilt the system to support level-based learning across **all** quiz and flashcard modes.
* **Mechanism**: 
  - Vocabulary within each topic is partitioned into up to 10 progressive levels (blocks calculated via `Math.ceil(vocabList.length / wordsPerLevel)`).
  - Unlocking level $N$ requires achieving **$\ge 70\%$** on any compatible active material in level $N-1$.
  - Progress keys are format-standardized as `${mode}_level_${levelNum}` (e.g., `article_level_2`, `flashcard_level_1`, `verb_level_3`).
  - Empty levels (e.g., intermediate blocks that have zero nouns, verbs, or adjectives) are gracefully evaluated and automatically marked as **✓ Completed** to prevent progression blockers.

### 2. High-Performance Level Selector Dashboard
* **UI Structure**: Built dynamic, responsive mode layouts in `TopicView.tsx`.
* **Adaptive Labeling**: 
  - Sub-mode level cards dynamically re-calculate specific subset counts and display exact metrics (e.g., Nouns for Article mode, Verbs for Verb mode, etc.).
  - The highscores and progress reports parse custom mode key headers (e.g., `"Meanings • Level 1"` or `"Articles • Level 3"`) in both English and German depending on system localization settings.

### 3. Progressive Offline Service Worker (`sw.js`)
* **Precision Service Worker**: Installed a high-performance offline pre-caching engine in `/public/sw.js` and registered it safely via `/src/main.tsx`.
* **Features**:
  - Automatically caches default assets and app shells.
  - Safe-to-ignore warnings in development mode.
  - Clean client-side cache busting is enforced for legacy layouts using structured version variables (`const CACHE_NAME`).

### 4. Module 1: Profile Portal & Gamification Scorecard
* **Compact Canvas Profile Photo Uploader**: Enabled custom JPEG uploads inside `SettingsModal.tsx` with high-speed offscreen HTML5 canvas square-cropping and resizing to exactly 120x120px at 0.85 quality. This preserves storage memory and prevents local quotes overflows.
* **Daily Practice Goals Tracking**: Created a customized settings target selector (5, 10, 20, 50 rounds) matched with dynamic progress bars on the home screen tracking today's completions.
* **Offline Learner Portal (Local Logins)**: Engineered a complete local multi-profile registration and switching system on the Profile tab.
* **Friends Scoreboard League**: Implemented a stateful competitor scorecard list with direct friend registrations to visually compare points and ranks.

### 5. Module 2: Advanced Interactive Exam & Tests Suite
* **Acoustic Pronunciation Coach (Speech Coach)**: Implemented standard Speech Recognition checks pairing users' phonetic inputs with German targets, supported by reactive visual waveform sound wave simulation bars.
* **Goethe Reading Comprehension**: Embedded adaptive Goethe-style articles and comprehension assignments spanning levels A1 to C1, featuring hoverable/clickable English translation vocabulary mini cheat-sheets.
* **Spoken Dialogue Hearing (Zwiegespräch)**: Designed sequence-triggered multi-speaker audios with progressive speaking focus bars, toggleable transcripts, and interpretive check questions.
* **Sentence Syntax Builder (Satzbau)**: Configured a gamified drag-and-drop/tap-to-assemble English-to-German sentence constructor with correct word sequence and verb placement testing.

### 6. Module 3: AI Conversation Lab & Grammar Sandbox Suite
* **AI conversational Partner Roleplay**: Built immersive verbal dialogue modules (*Beim Bäcker*, *Im Taxi*, *Beim Arzt*) with real-time grammar tracking, phonetic speech analysis, and translations.
* **Speech to Text Input**: Integrated native Web Speech Recognition allowing users to speak German utterances to the conversational simulator.
* **Creative Composition Inspector**: Created a spacious essay sandbox with custom CEFR templates providing sentence-by-sentence professor feedback, corrected case declensions, and vocabulary upgrades.
* **Server-Side @google/genai Integration**: Structured Express proxy endpoints calling the official modern Google GenAI SDK with lazy key validation and robust local simulated sandbox replacements.

### 7. Module 4: German Culture, Idioms & Case Arena Room
* **Authentic German Idioms & Slang**: Integrated multi-sensory matching activities with native acoustic pronunciations for famous German colloquialisms (e.g., *Tomaten auf den Augen haben*, *nur Bahnhof verstehen*).
* **Der Kasus-Trainer Grammar Arena**: Built interactive grammar diagnostic engines matching standard Nominative, Accusative, Dative, and Genitive core case triggers with corrective syntax guides.
* **Knigge Society and Etiquette Check**: Configured dual-language culture evaluations highlighting essential German customs like *Stoßlüften*, *Ruhezeit*, and proper glass-clinking etiquette.

### 8. Module 5: Professional Correspondence & Letter Master (Brief- & E-Mail-Meister)
* **Official Letter Assembler (Brief-Baukasten)**: Developed an interactive, drag-and-drop letter sequencing puzzle testing students on the standard administrative parts of formal/business German communications.
* **Interactive Brief Template Creator**: Features dynamic custom stencils for sick leaves (*Krankmeldung*), job applications (*Bewerbungsschreiben*), and rental complaints (*Mietminderung*), tracking case changes after pronoun selections.
* **Rules & Regulatory MCQ Test (Schreib-Prüfung)**: Integrated expert correspondence tests assessing comma rules, formal pronouns capitalization, and administrative preposition triggers.
* **AI custom Composition & Essay Assessor**: Added a direct writing interface leveraging backend evaluations for real-time spelling correction, phrasing feedback, stylistic suggestions, and CEFR estimates with robust simulated fallbacks.

---

## 🛠️ Developer Guidance Policies

* **Component Separation**: Maintain strict separation of concern. Do not overload `App.tsx` with visualization routines. Custom sub-views reside inside `/src/components/*`.
* **State Persistence**: Sync all progress markers, highscores, bookmarks, and streaks into `localStorage` safely (`lw_prog`, `lw_hs`, `lw_bookmarks`, `lw_streak_streak`).
* **Multi-Language Adaptability**: Use the responsive translation wrapper utility `const t = (en, de) => ...` inside rendering segments to keep German and English options beautifully in sync.
