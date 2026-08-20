import React, { useState } from "react";
import { Settings } from "../types";
import { speak } from "../utils/audio";

interface CultureHubViewProps {
  settings: Settings;
  onAddPoints: (pts: number) => void;
  lang: "en" | "de";
}

interface Idiom {
  german: string;
  literalEn: string;
  literalDe: string;
  actualEn: string;
  actualDe: string;
  emoji: string;
  exampleDe: string;
  exampleEn: string;
}

const FAMOUS_IDIOMS: Idiom[] = [
  {
    german: "Tomaten auf den Augen haben",
    literalEn: "To have tomatoes on one's eyes",
    literalDe: "Tomaten auf den Augen haben",
    actualEn: "To be completely oblivious to what is happening right in front of you.",
    actualDe: "Etwas offensichtliches nicht sehen oder nicht bemerken.",
    emoji: "🍅",
    exampleDe: "Siehst du das rote Schild nicht? Du hast wohl Tomaten auf den Augen!",
    exampleEn: "Don't you see the red sign? You must have tomatoes on your eyes!"
  },
  {
    german: "nur Bahnhof verstehen",
    literalEn: "To only understand 'train station'",
    literalDe: "nur Bahnhof verstehen",
    actualEn: "To not understand a single word; it's all Greek to me.",
    actualDe: "Überhaupt nichts von dem verstehen, was jemand sagt.",
    emoji: "🚉",
    exampleDe: "Kanzleideutsch? Da verstehe ich leider nur Bahnhof.",
    exampleEn: "Legal German jargon? Unfortunately, I understand absolutely nothing."
  },
  {
    german: "die Kirche im Dorf lassen",
    literalEn: "To leave the church in the village",
    literalDe: "die Kirche im Dorf lassen",
    actualEn: "To not overreact; keep things in perspective instead of exaggerating.",
    actualDe: "Nicht übertreiben, auf dem Teppich bleiben und sachlich bleiben.",
    emoji: "⛪",
    exampleDe: "Wir haben nur ein Tor verloren, lass mal die Kirche im Dorf!",
    exampleEn: "We only lost by one goal, let's keep things in perspective!"
  },
  {
    german: "um den heißen Brei herumreden",
    literalEn: "To talk around the hot porridge",
    literalDe: "um den heißen Brei herumreden",
    actualEn: "To beat around the bush; avoid speaking directly about a sensitive topic.",
    actualDe: "Sich nicht trauen, eine Sache direkt anzusprechen.",
    emoji: "🥣",
    exampleDe: "Sag mir direkt was los ist, rede nicht um den heißen Brei herum!",
    exampleEn: "Tell me directly what's wrong, don't beat around the bush!"
  },
  {
    german: "eine Extrawurst verlangen",
    literalEn: "To demand an extra sausage",
    literalDe: "eine Extrawurst verlangen",
    actualEn: "To ask for special, preferential treatment that others don't get.",
    actualDe: "Eine Sonderbehandlung einfordern oder beanspruchen.",
    emoji: "🌭",
    exampleDe: "Alle müssen Schlange stehen. Warum verlangst du immer eine Extrawurst?",
    exampleEn: "Everyone has to stand in line. Why do you always demand special treatment?"
  },
  {
    german: "die Daumen drücken",
    literalEn: "To press the thumbs",
    literalDe: "die Daumen drücken",
    actualEn: "To hold your thumbs; wish someone good luck on an exam or task.",
    actualDe: "Jemandem viel Glück wünschen (z.B. bei einer Prüfung).",
    emoji: "👍",
    exampleDe: "Morgen hast du die Führerscheinprüfung? Ich drücke dir fest die Daumen!",
    exampleEn: "Tomorrow is your driving exam? I'm crossing my fingers tightly for you!"
  },
  {
    german: "das Haar in der Suppe suchen",
    literalEn: "To search for the hair in the soup",
    literalDe: "das Haar in der Suppe suchen",
    actualEn: "To look for flaws where there are none; to be overly critical or nitpicky.",
    actualDe: "Sehr kleinlich sein und an allem etwas auszusetzen haben.",
    emoji: "🥣",
    exampleDe: "Das Hotel war wunderbar, aber er muss immer das Haar in der Suppe suchen.",
    exampleEn: "The hotel was wonderful, but he always has to find something to complain about."
  },
  {
    german: "den Teufel an die Wand malen",
    literalEn: "To paint the devil on the wall",
    literalDe: "den Teufel an die Wand malen",
    actualEn: "To catastrophize; to anticipate the worst possible outcome needlessly.",
    actualDe: "Das Schlimmste befürchten oder unnötig pessimistisch sein.",
    emoji: "😈",
    exampleDe: "Mach dir keine Sorgen, wir werden den Flug nicht verpassen. Mal nicht den Teufel an die Wand!",
    exampleEn: "Don't worry, we won't miss the flight. Don't expect the absolute worst!"
  },
  {
    german: "jemandem Honig um den Mund schmieren",
    literalEn: "To smear honey around someone's mouth",
    literalDe: "jemandem Honig um den Mund schmieren",
    actualEn: "To flatter someone or butter them up to get what you want.",
    actualDe: "Jemandem schmeicheln, um sich selbst einen Vorteil zu verschaffen.",
    emoji: "🍯",
    exampleDe: "Er schmiert dem Chef Honig um den Mund, weil er eine Gehaltserhöhung will.",
    exampleEn: "He is buttering up the boss because he wants a salary raise."
  },
  {
    german: "etwas auf die lange Bank schieben",
    literalEn: "To push something onto the long bench",
    literalDe: "etwas auf die lange Bank schieben",
    actualEn: "To procrastinate; to delay or postpone a task indefinitely.",
    actualDe: "Eine unliebsame Aufgabe oder Entscheidung lange Zeit hinauszögern.",
    emoji: "🛋️",
    exampleDe: "Du solltest die Steuererklärung nicht immer auf die lange Bank schieben!",
    exampleEn: "You shouldn't always put off doing your tax declaration!"
  }
];

interface CaseQuestion {
  sentence: string;
  translation: string;
  options: string[];
  answer: string;
  hintEn: string;
  hintDe: string;
}

const CASE_QUESTIONS: CaseQuestion[] = [
  {
    sentence: "Ich helfe ___ Mann bei der Arbeit.",
    translation: "I help the man with work.",
    options: ["dem", "den", "der", "des"],
    answer: "dem",
    hintEn: "The verb 'helfen' always triggers the Dative case. 'Mann' is masculine (der), so Dative masculine is 'dem'.",
    hintDe: "Das Verb 'helfen' verlangt immer den Dativ. 'Mann' ist maskulin, daher wird 'der' im Dativ zu 'dem'."
  },
  {
    sentence: "Er sieht ___ Hund im Garten.",
    translation: "He sees the dog in the garden.",
    options: ["dem", "den", "der", "das"],
    answer: "den",
    hintEn: "The verb 'sehen' triggers the Accusative case for the direct object. Masculine Accusative is 'den'.",
    hintDe: "Das Verb 'sehen' verlangt den Akkusativ für das direkte Objekt. Maskulin im Akkusativ ist 'den'."
  },
  {
    sentence: "Das ist das Auto ___ Vaters.",
    translation: "This is the father's car.",
    options: ["dem", "den", "der", "des"],
    answer: "des",
    hintEn: "Posession triggers Genitive case. Masculine singular genitive article is 'des' with an '-s' on the noun.",
    hintDe: "Besitz oder Zugehörigkeit verlangt den Genitiv. Maskulin im Genitiv ist 'des' (zuzüglich '-s' am Nomen)."
  },
  {
    sentence: "Wir gehen ohne ___ Freund zum Kino.",
    translation: "We go to the cinema without the friend.",
    options: ["dem", "den", "der", "des"],
    answer: "den",
    hintEn: "The preposition 'ohne' is strictly Accusative. Masculine singular accusative of 'der' is 'den'.",
    hintDe: "Die Präposition 'ohne' verlangt immer den Akkusativ. Maskulin im Akkusativ ist 'den'."
  },
  {
    sentence: "Ich wohne bei ___ Eltern.",
    translation: "I live with my parents.",
    options: ["den", "dem", "die", "der"],
    answer: "den",
    hintEn: "The preposition 'bei' is strictly Dative. 'Eltern' is plural, and plural Dative article is 'den' (with optional -n addition to noun).",
    hintDe: "Die Präposition 'bei' fordert immer den Dativ. 'Eltern' ist Plural, daher 'den' im Dativ."
  },
  {
    sentence: "Sie dankt ___ Professorin für das Buch.",
    translation: "She thanks the female professor for the book.",
    options: ["dem", "der", "die", "den"],
    answer: "der",
    hintEn: "The verb 'danken' triggers the Dative case. 'Professorin' is feminine (die), so Dative feminine is 'der'.",
    hintDe: "Das Verb 'danken' verlangt den Dativ. 'Professorin' ist feminin, daher wird 'die' im Dativ zu 'der'."
  },
  {
    sentence: "Wir helfen ___ Kindern beim Lernen.",
    translation: "We help the children with learning.",
    options: ["den", "dem", "die", "der"],
    answer: "den",
    hintEn: "The verb 'helfen' triggers the Dative case. 'Kindern' is plural, and plural Dative article is 'den'. Also note the -n added to 'Kindern'.",
    hintDe: "Das Verb 'helfen' verlangt immer den Dativ. 'Kindern' ist Plural, daher lautet der dative Pluralartikel 'den' (und das Nomen erhält ein Plural-n)."
  },
  {
    sentence: "Sie kauft ein Geschenk für ___ Vater.",
    translation: "She buys a gift for the father.",
    options: ["dem", "den", "der", "des"],
    answer: "den",
    hintEn: "The preposition 'für' strictly triggers the Accusative case. Masculine Accusative is 'den'.",
    hintDe: "Die Präposition 'für' verlangt immer den Akkusativ. Maskulin im Akkusativ ist 'den'."
  },
  {
    sentence: "Das Spielzeug gehört ___ Kind.",
    translation: "The toy belongs to the child.",
    options: ["dem", "den", "der", "des"],
    answer: "dem",
    hintEn: "The verb 'gehören' triggers the Dative case. Neuter singular Dative is 'dem'.",
    hintDe: "Das Verb 'gehören' verlangt den Dativ. Neuter im Dativ ist 'dem'."
  },
  {
    sentence: "Ich trinke Tee mit ___ Zitrone.",
    translation: "I drink tea with lemon.",
    options: ["den", "dem", "die", "der"],
    answer: "der",
    hintEn: "The preposition 'mit' always triggers the Dative case. 'Zitrone' is feminine (die), so feminine Dative is 'der'.",
    hintDe: "Die Präposition 'mit' verlangt immer den Dativ. 'Zitrone' ist feminin, daher wird 'die' im Dativ zu 'der'."
  },
  {
    sentence: "Trotz ___ Regens gehen wir spazieren.",
    translation: "In spite of the rain, we go walking.",
    options: ["dem", "den", "des", "der"],
    answer: "des",
    hintEn: "The preposition 'trotz' triggers the Genitive case. Masculine singular genitive is 'des' (and the noun 'Regen' gets an '-s').",
    hintDe: "Die Präposition 'trotz' regiert den Genitiv. Maskulin im Genitiv ist 'des' (zuzüglich '-s' am Nomen)."
  },
  {
    sentence: "Er stellt das Buch auf ___ Tisch.",
    translation: "He puts the book on the table.",
    options: ["dem", "den", "der", "des"],
    answer: "den",
    hintEn: "The preposition 'auf' is a two-way preposition. Because there is movement/placement (putting the book onto the table), it triggers the Accusative. Masculine Accusative is 'den'.",
    hintDe: "Die Wechselpräposition 'auf' verlangt bei einer Ortsveränderung (Wohin? - Buch auf den Tisch legen) den Akkusativ. Maskulin im Akkusativ ist 'den'."
  }
];

interface CultureQuiz {
  titleEn: string;
  titleDe: string;
  descEn: string;
  descDe: string;
  optionsEn: string[];
  optionsDe: string[];
  answerIndex: number;
  explanationEn: string;
  explanationDe: string;
  icon: string;
}

const CULTURE_CHECKS: CultureQuiz[] = [
  {
    titleEn: "The Art of Stoßlüften",
    titleDe: "Die Kunst des Stoßlüftens",
    descEn: "What is the correct way to air out a German home according to local custom?",
    descDe: "Wie lüftet man eine deutsche Wohnung traditionell richtig?",
    optionsEn: [
      "Keep windows tilted (Kippen) all day long in winter.",
      "Open windows fully (Stoßlüften) for 5-10 minutes twice a day.",
      "Never open windows, use active AC only.",
      "Just open the kitchen window whilst cooking."
    ],
    optionsDe: [
      "Fenster den ganzen Winter über auf Kipp gelehnt lassen.",
      "Fenster zweimal täglich für 5-10 Minuten komplett aufreißen (Stoßlüften).",
      "Fenster niemals öffnen, nur Klimaanlage nutzen.",
      "Nur beim Kochen kurz das Küchenfenster öffnen."
    ],
    answerIndex: 1,
    explanationEn: "In Germany, 'Stoßlüften' (impact airing) is deeply integrated into society. You open all windows fully to exchange air quickly without cooling down the walls, saving heating energy.",
    explanationDe: "Stoßlüften spart im Vergleich zu Dauerkippen Energie und beugt Schimmelbildung effizient vor. Nahezu jeder Haushalt schwört darauf.",
    icon: "🪟"
  },
  {
    titleEn: "Glass Clinking Climax",
    titleDe: "Das Anstoßen beim Trinken",
    descEn: "When clinking glasses with mates in Germany, what is a crucial non-verbal rule?",
    descDe: "Welche wichtige Regel gilt beim Anstoßen (Prost!) mit Freunden?",
    optionsEn: [
      "Look down at your glass to avoid spilling.",
      "Close your eyes during active touch.",
      "Make intense eye contact with the person you clink with.",
      "Immediately drink the whole glass without stopping."
    ],
    optionsDe: [
      "Auf das eigene Glas schauen, um nichts zu verschütten.",
      "Beim berühren der Gläser die Augen schließen.",
      "Der Person beim Anstoßen tief und direkt in die Augen sehen.",
      "Sofort das ganze Glas in einem Zug leeren."
    ],
    answerIndex: 2,
    explanationEn: "Failing to make eye contact when clinking glasses is considered impolite, and according to German folklore, brings seven years of bad luck in romance!",
    explanationDe: "Wer beim Anstoßen nicht Blickkontakt hält, gilt als unhöflich. Zudem besagt der Aberglaube, dass dies 7 Jahre schlechten Sex nach sich zieht.",
    icon: "🍻"
  },
  {
    titleEn: "The Sunday Quiet Law (Ruhezeit)",
    titleDe: "Sonntagsruhe in Deutschland",
    descEn: "Which of the following activities is generally forbidden or frowned upon on Sundays in German residential areas?",
    descDe: "Welche Aktivität ist sonntags in Wohngebieten gesetzlich untersagt?",
    optionsEn: [
      "Cooking a hot meal in your home.",
      "Drilling walls, mowing lawns, or vacuuming loudly.",
      "Going on a walk with your family.",
      "Washing your dishes in the kitchen."
    ],
    optionsDe: [
      "Zu Hause eine warme Mahlzeit kochen.",
      "Löcher bohren, Rasen mähen oder laut staubsaugen.",
      "Spaziergänge mit der Familie machen.",
      "Geschirr in der Küche spülen."
    ],
    answerIndex: 1,
    explanationEn: "Sunday is a state-sheltered day of rest ('Ruhezeit'). Major noise activities like vacuuming, drilling, or using heavy lawnmowers are forbidden by house rules and regional noise ordinances.",
    explanationDe: "Der Sonntag schützt die Ruhezeit. Laute handwerkliche Arbeiten, Rasenmähen oder laute Maschinen sind sonntags gesetzlich untersagt, um Nachbarn Erholung zu sichern.",
    icon: "🤫"
  },
  {
    titleEn: "The German Pfand System",
    titleDe: "Das Pfandsystem",
    descEn: "What is the custom when disposing of plastic bottles or aluminum cans in Germany?",
    descDe: "Wie entsorgt man Plastikflaschen und Aludosen in Deutschland richtig?",
    optionsEn: [
      "Throw them in the general black bin.",
      "Return them to supermarket reverse vending machines (Pfandautomat) for a deposit refund.",
      "Melt them at home for scrap value.",
      "Leave them on the street for trash trucks."
    ],
    optionsDe: [
      "In den normalen Hausmüll (Restmüll) werfen.",
      "Am Pfandautomaten im Supermarkt abgeben, um das Flaschenpfand zurückzuerhalten.",
      "Zu Hause einschmelzen, um den Rohstoffwert zu sichern.",
      "Einfach auf der Straße stehen lassen, damit die Müllabfuhr sie mitnimmt."
    ],
    answerIndex: 1,
    explanationEn: "Most bottles and cans in Germany carry a 'Pfand' (deposit) of 8 to 25 cents. Returning them to automated collection machines gets your money back and feeds a highly efficient recycling loop.",
    explanationDe: "Flaschen und Dosen haben in Deutschland meist Pfand (8 bis 25 Cent). Man gibt sie im Supermarkt zurück, was Geld spart und das Recycling fördert.",
    icon: "🍾"
  },
  {
    titleEn: "Punctuality (Pünktlichkeit)",
    titleDe: "Pünktlichkeit in Deutschland",
    descEn: "How is a delay of 10-15 minutes without warning viewed in professional or social contexts in Germany?",
    descDe: "Wie wird eine unangekündigte Verspätung von 10-15 Minuten in Deutschland wahrgenommen?",
    optionsEn: [
      "It is fully acceptable and considered normal.",
      "It is seen as a sign of being relaxed and easy-going.",
      "It is considered impolite, and you should call/text in advance.",
      "It is rewarded with extra attention."
    ],
    optionsDe: [
      "Das ist völlig okay und wird als normal angesehen.",
      "Es gilt als Zeichen von Gelassenheit und Lockerheit.",
      "Es gilt als sehr unhöflich; man sollte sich vorab telefonisch oder per Nachricht melden.",
      "Man wird dafür mit besonderer Aufmerksamkeit belohnt."
    ],
    answerIndex: 2,
    explanationEn: "Punctuality is a valued sign of respect in Germany. If you are going to be more than 5 minutes late, it is highly expected to notify your partner or host in advance.",
    explanationDe: "Pünktlichkeit gilt als Zeichen des Respekts und der Verlässlichkeit. Bei Verspätungen ab 5 Minuten gehört es zum guten Ton, Bescheid zu geben.",
    icon: "⏰"
  },
  {
    titleEn: "Sunday Shopping Restrictions",
    titleDe: "Ladenschluss am Sonntag",
    descEn: "What should you keep in mind regarding grocery shopping on a typical Sunday in Germany?",
    descDe: "Was muss man beim Lebensmitteleinkauf an Sonntagen beachten?",
    optionsEn: [
      "All supermarkets are open 24/7.",
      "Malls are open, but only in the morning.",
      "Almost all supermarkets and stores are closed, except for shops in main train stations or airports.",
      "Stores are open, but they charge a double Sunday fee."
    ],
    optionsDe: [
      "Alle Supermärkte haben rund um die Uhr geöffnet.",
      "Einkaufszentren haben geöffnet, aber nur vormittags.",
      "Fast alle Supermärkte und Geschäfte sind geschlossen, außer in Hauptbahnhöfen oder Flughäfen.",
      "Geschäfte haben geöffnet, verlangen sonntags aber doppelte Preise."
    ],
    answerIndex: 2,
    explanationEn: "By law (Ladenschlussgesetz), retail stores and supermarkets in Germany are strictly closed on Sundays to protect rest days for workers. Plan your grocery shopping accordingly on Saturdays!",
    explanationDe: "Das Ladenschlussgesetz schreibt vor, dass Geschäfte an Sonn- und Feiertagen geschlossen bleiben. Ausnahmen gibt es nur an Bahnhöfen, Tankstellen oder Flughäfen.",
    icon: "🛒"
  }
];

export default function CultureHubView({ settings, onAddPoints, lang }: CultureHubViewProps) {
  const currentLang = settings.lang;
  const t = (en: string, de: string) => (currentLang === "de" ? de : en);

  // Sub tab tracking index
  const [activeTab, setActiveTab] = useState<"idioms" | "case" | "etiquette">("idioms");

  // ── IDIOMS TRAINER STATE ────────────────────────────────────
  const [currentIdiomIndex, setCurrentIdiomIndex] = useState(0);
  const [idiomAnswerReveal, setIdiomAnswerReveal] = useState(false);
  const [idiomsXPClaimed, setIdiomsXPClaimed] = useState(false);

  const handleNextIdiom = () => {
    setIdiomAnswerReveal(false);
    setCurrentIdiomIndex((prev) => (prev + 1) % FAMOUS_IDIOMS.length);
  };

  const handlePlayIdiomSound = (text: string) => {
    speak(text, settings.ttsOn);
  };

  // ── CASE TRAINER STATE ──────────────────────────────────────
  const [currentCaseIdx, setCurrentCaseIdx] = useState(0);
  const [selectedCaseOption, setSelectedCaseOption] = useState<string | null>(null);
  const [caseIsChecked, setCaseIsChecked] = useState(false);
  const [caseCorrectAnswers, setCaseCorrectAnswers] = useState(0);
  const [caseXpEarned, setCaseXpEarned] = useState(false);

  const handleCheckCaseAnswer = (option: string) => {
    if (caseIsChecked) return;
    setSelectedCaseOption(option);
    setCaseIsChecked(true);

    const match = CASE_QUESTIONS[currentCaseIdx];
    if (option === match.answer) {
      setCaseCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextCaseQuestion = () => {
    setSelectedCaseOption(null);
    setCaseIsChecked(false);

    if (currentCaseIdx < CASE_QUESTIONS.length - 1) {
      setCurrentCaseIdx((prev) => prev + 1);
    } else {
      // Finished all case questions! Reward study XP once
      if (!caseXpEarned) {
        onAddPoints(20);
        setCaseXpEarned(true);
      }
      // Loop or reset back
      setCurrentCaseIdx(0);
      setCaseCorrectAnswers(0);
    }
  };

  // ── CULTURE CHECKS STATE ────────────────────────────────────
  const [currentCultIdx, setCurrentCultIdx] = useState(0);
  const [selectedCultOpt, setSelectedCultOpt] = useState<number | null>(null);
  const [cultIsChecked, setCultIsChecked] = useState(false);
  const [cultXPEarned, setCultXPEarned] = useState(false);

  const handleCheckCultureAnswer = (idx: number) => {
    if (cultIsChecked) return;
    setSelectedCultOpt(idx);
    setCultIsChecked(true);
  };

  const handleNextCultureCheck = () => {
    setSelectedCultOpt(null);
    setCultIsChecked(false);

    if (currentCultIdx < CULTURE_CHECKS.length - 1) {
      setCurrentCultIdx((prev) => prev + 1);
    } else {
      if (!cultXPEarned) {
        onAddPoints(20);
        setCultXPEarned(true);
      }
      setCurrentCultIdx(0);
    }
  };

  return (
    <div className="mx-auto max-w-lg bg-gray-50 min-h-screen dark:bg-slate-950 pb-28">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white p-6 shadow-sm dark:bg-slate-950 border-b border-gray-100 dark:border-slate-900 rounded-b-3xl">
        <div className="text-[10px] uppercase font-black text-amber-400 tracking-widest flex items-center gap-2 flex-wrap">
          <span>★ LINKSWELLE INSTITUT • {t("CEFR B1 HIGH-LEVEL GRAMMAR & CULTURE", "CEFR B1 KULTUR & GRAMMATIK")} ★</span>
          <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black whitespace-nowrap">B1 GERMAN</span>
        </div>
        <h1 className="text-2xl font-black mt-1 tracking-tight flex items-center gap-2">
          🏰 {t("German B1 Culture & Case Arena", "Goethe B1 Kultur & Kasus-Trainer")}
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {t(
            "Acquire B1 idiomatic expressions, master Nominative, Accusative, Dative & Genitive case triggers, and discover cultural customs crucial for intermediate social integration.",
            "Lerne B1 Redewendungen, trainiere Nominativ, Akkusativ, Dativ und Genitiv, und entdecke wichtige Kulturregeln für die B1 Integrationsstufe."
          )}
        </p>

        {/* Level Selector tabs bar */}
        <div className="mt-5 flex bg-slate-850 rounded-xl p-1.5 gap-1.5 text-xs font-bold dark:bg-slate-900 border border-slate-700/50">
          <button
            onClick={() => setActiveTab("idioms")}
            className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all duration-150 ${
              activeTab === "idioms"
                ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            🎭 {t("B1 Idioms", "B1-Idiome")}
          </button>
          <button
            onClick={() => setActiveTab("case")}
            className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all duration-150 ${
              activeTab === "case"
                ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            🎡 {t("B1 Cases", "B1-Kasus")}
          </button>
          <button
            onClick={() => setActiveTab("etiquette")}
            className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition-all duration-150 ${
              activeTab === "etiquette"
                ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            🏰 {t("B1 Culture", "B1-Kultur")}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* ── SUBTAB 1: IDIOMS MATCHING TRAINER ── */}
        {activeTab === "idioms" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                {t("EXPLORE IDIOMS", "REDEWENDUNGEN DURCHSTÖBERN")}
              </span>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-200/50 dark:bg-slate-900 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                {currentIdiomIndex + 1} / {FAMOUS_IDIOMS.length}
              </span>
            </div>

            {/* Flashcard style container */}
            <div className="bg-white rounded-2xl border border-gray-150/70 p-6 dark:bg-slate-900 dark:border-slate-850 shadow-xs flex flex-col items-center text-center space-y-4 relative overflow-hidden min-h-[300px] justify-between">
              {/* Giant backdrop Emoji */}
              <div className="absolute -top-6 -right-6 text-8xl opacity-10 pointer-events-none">
                {FAMOUS_IDIOMS[currentIdiomIndex].emoji}
              </div>

              {/* Speaker action */}
              <div className="w-full flex justify-end">
                <button
                  onClick={() => handlePlayIdiomSound(FAMOUS_IDIOMS[currentIdiomIndex].german)}
                  className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-slate-800 dark:text-emerald-400 rounded-full cursor-pointer transition"
                  title={t("Listen to Idiom", "Vorlesen lassen")}
                  type="button"
                >
                  🔊
                </button>
              </div>

              {/* Title & Emoji */}
              <div className="space-y-1.5 z-10">
                <span className="text-4xl">{FAMOUS_IDIOMS[currentIdiomIndex].emoji}</span>
                <h3 className="text-xl font-black text-gray-800 dark:text-slate-100 block">
                  "{FAMOUS_IDIOMS[currentIdiomIndex].german}"
                </h3>
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="px-2 py-0.5 text-[9px] uppercase font-bold text-gray-400 bg-gray-100 rounded dark:bg-slate-850 dark:text-slate-500">
                    {t("Literal: ", "Wörtlich: ")}"{t(FAMOUS_IDIOMS[currentIdiomIndex].literalEn, FAMOUS_IDIOMS[currentIdiomIndex].literalDe)}"
                  </span>
                  <span className="px-2 py-0.5 text-[9px] uppercase font-black text-amber-600 bg-amber-50 rounded border border-amber-200/50 dark:bg-amber-950/25 dark:text-amber-400 dark:border-amber-900/30">
                    B1 STANDARD
                  </span>
                </div>
              </div>

              {/* Secret actual translation reveal button */}
              <div className="w-full z-10 px-4">
                {!idiomAnswerReveal ? (
                  <button
                    onClick={() => {
                      setIdiomAnswerReveal(true);
                      if (!idiomsXPClaimed) {
                        onAddPoints(10);
                        setIdiomsXPClaimed(true);
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer select-none dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                    type="button"
                  >
                    💡 {t("Reveal Real Meaning", "Echte Bedeutung enthüllen")}
                  </button>
                ) : (
                  <div className="p-4 bg-teal-50/50 text-teal-950 border border-teal-150/50 rounded-xl dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-350 text-xs font-semibold leading-relaxed animate-fade-in space-y-3 text-left">
                    <div>
                      <strong className="text-[10px] block font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                        💡 {t("REAL MEANING", "BEDEUTUNG")}
                      </strong>
                      <p className="mt-0.5">{t(FAMOUS_IDIOMS[currentIdiomIndex].actualEn, FAMOUS_IDIOMS[currentIdiomIndex].actualDe)}</p>
                    </div>

                    <div className="border-t border-teal-200/40 pt-2 dark:border-slate-800">
                      <strong className="text-[10px] block font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider">
                        💬 {t("EXAMPLE USE", "BEISPIEL")}
                      </strong>
                      <p className="mt-0.5 italic text-[11px] font-medium font-sans text-teal-900 dark:text-slate-300">
                        "{FAMOUS_IDIOMS[currentIdiomIndex].exampleDe}"
                      </p>
                      <p className="text-[10px] text-teal-600/80 dark:text-slate-400 italic">
                        {FAMOUS_IDIOMS[currentIdiomIndex].exampleEn}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progression buttons */}
              <div className="w-full pt-4 flex gap-2">
                <button
                  onClick={handleNextIdiom}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold rounded-lg transition border border-gray-200/50 cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700"
                  type="button"
                >
                  🚀 {t("Next Idiom", "Nächstes Idiom")}
                </button>
              </div>
            </div>

            {/* Achievement card */}
            {idiomsXPClaimed && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
                🌟 <span>{t("You unlocked +10 XP for studying German idiomatic expressions!", "Du hast +10 XP für das Studieren deutscher Redewendungen erhalten!")}</span>
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB 2: CASE TRIGGER ARENA ── */}
        {activeTab === "case" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
                <span className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded text-[8px] font-black">B1</span>
                <span>{t("KASUS ARENA (CASE DRILLS)", "DIE VIER FÄLLE TRAINIEREN")}</span>
              </span>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-200/50 dark:bg-slate-900 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                {currentCaseIdx + 1} / {CASE_QUESTIONS.length}
              </span>
            </div>

            {/* Main Interactive card */}
            <div className="bg-white rounded-2xl border border-gray-150/70 p-5 dark:bg-slate-900 dark:border-slate-850 shadow-xs space-y-4">
              <div className="p-4 bg-indigo-50/45 dark:bg-slate-950 rounded-xl border border-indigo-100/30 dark:border-slate-850">
                <h3 className="text-base font-extrabold text-indigo-900 dark:text-emerald-400 font-sans tracking-tight">
                  {CASE_QUESTIONS[currentCaseIdx].sentence}
                </h3>
                <p className="text-[11px] text-gray-500 italic mt-1 dark:text-slate-400">
                  {CASE_QUESTIONS[currentCaseIdx].translation}
                </p>
              </div>

              {/* Options selectors */}
              <div className="grid grid-cols-2 gap-2">
                {CASE_QUESTIONS[currentCaseIdx].options.map((opt) => {
                  const isCorrectAnswer = opt === CASE_QUESTIONS[currentCaseIdx].answer;
                  const isSelected = opt === selectedCaseOption;

                  let optStyle = "bg-gray-55 hover:bg-gray-100 border-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 dark:border-slate-700";
                  if (caseIsChecked) {
                    if (isCorrectAnswer) {
                      optStyle = "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 font-extrabold";
                    } else if (isSelected) {
                      optStyle = "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
                    } else {
                      optStyle = "opacity-40 border-gray-150 text-gray-400 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleCheckCaseAnswer(opt)}
                      className={`py-3.5 px-4 border rounded-xl text-xs font-bold text-center cursor-pointer transition select-none ${optStyle}`}
                      disabled={caseIsChecked}
                      type="button"
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Explanation and tip reveal banner */}
              {caseIsChecked && (
                <div className="p-4 bg-amber-50/60 text-amber-950 border border-amber-100/50 rounded-xl dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300 text-xs leading-relaxed animate-fade-in">
                  <h4 className="font-extrabold uppercase text-[10px] text-amber-700 tracking-wider dark:text-amber-400">
                    💡 {t("GRAMMAR EXPLANATION", "GRAMM-REGEL")}
                  </h4>
                  <p className="mt-1">
                    {t(CASE_QUESTIONS[currentCaseIdx].hintEn, CASE_QUESTIONS[currentCaseIdx].hintDe)}
                  </p>
                </div>
              )}

              {/* Navigation CTA button */}
              {caseIsChecked && (
                <button
                  onClick={handleNextCaseQuestion}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                  type="button"
                >
                  {currentCaseIdx === CASE_QUESTIONS.length - 1
                    ? t("Finish Case Drills (+20 XP)", "Kasus-Trainer beenden (+20 XP)")
                    : t("Next Question ➜", "Nächste Frage ➜")}
                </button>
              )}
            </div>

            {/* Scoreboard stats details */}
            <div className="p-4 bg-white border border-gray-150 rounded-2xl dark:bg-slate-900 dark:border-slate-850 flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-600 dark:text-slate-400">
                {t("Total Correct: ", "Richtig gelöst: ")}
              </span>
              <span className="font-black text-gray-800 dark:text-white font-mono text-sm">
                {caseCorrectAnswers} / {CASE_QUESTIONS.length}
              </span>
            </div>
          </div>
        )}

        {/* ── SUBTAB 3: CULTURE & ETICKET CHECKS ── */}
        {activeTab === "etiquette" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
                <span className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded text-[8px] font-black">B1</span>
                <span>{t("KNIGGE GUIDE (CULTURE)", "KNIGGE & KULTUR-CHECK")}</span>
              </span>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-200/50 dark:bg-slate-900 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                {currentCultIdx + 1} / {CULTURE_CHECKS.length}
              </span>
            </div>

            {/* Culture trivia card */}
            <div className="bg-white rounded-2xl border border-gray-150/70 p-5 dark:bg-slate-900 dark:border-slate-850 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-amber-50 dark:bg-slate-800 rounded-xl">
                  {CULTURE_CHECKS[currentCultIdx].icon}
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-850 dark:text-white leading-snug">
                    {t(CULTURE_CHECKS[currentCultIdx].titleEn, CULTURE_CHECKS[currentCultIdx].titleDe)}
                  </h3>
                  <span className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wide">
                    {t("Social Etiquette", "Benehmen & Alltag")}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed dark:text-slate-300">
                {t(CULTURE_CHECKS[currentCultIdx].descEn, CULTURE_CHECKS[currentCultIdx].descDe)}
              </p>

              {/* Answers choices container */}
              <div className="space-y-2 pt-1">
                {(currentLang === "de" ? CULTURE_CHECKS[currentCultIdx].optionsDe : CULTURE_CHECKS[currentCultIdx].optionsEn).map((opt, oIdx) => {
                  const isCorrect = oIdx === CULTURE_CHECKS[currentCultIdx].answerIndex;
                  const isSelected = oIdx === selectedCultOpt;

                  let optCls = "bg-gray-55 hover:bg-gray-100 border-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 dark:border-slate-700";
                  if (cultIsChecked) {
                    if (isCorrect) {
                      optCls = "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 font-extrabold";
                    } else if (isSelected) {
                      optCls = "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
                    } else {
                      optCls = "opacity-45 border-gray-150 text-gray-400 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleCheckCultureAnswer(oIdx)}
                      className={`w-full text-left p-3 border rounded-xl text-xs font-semibold cursor-pointer transition flex items-start gap-2.5 leading-normal ${optCls}`}
                      disabled={cultIsChecked}
                      type="button"
                    >
                      <span className="font-mono">{String.fromCharCode(65 + oIdx)}.</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Culture explanation card */}
              {cultIsChecked && (
                <div className="p-4 bg-teal-50/50 text-teal-900 border border-teal-100/55 rounded-xl dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-300 text-xs leading-relaxed animate-fade-in">
                  <h4 className="font-black uppercase text-[10px] text-teal-700 tracking-wider dark:text-teal-400 mb-0.5">
                    💡 {t("WHY THIS INDEED MATTERS", "WARUM DAS SO IST")}
                  </h4>
                  <p>
                    {t(CULTURE_CHECKS[currentCultIdx].explanationEn, CULTURE_CHECKS[currentCultIdx].explanationDe)}
                  </p>
                </div>
              )}

              {/* Progress CTA */}
              {cultIsChecked && (
                <button
                  onClick={handleNextCultureCheck}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                  type="button"
                >
                  {currentCultIdx === CULTURE_CHECKS.length - 1
                    ? t("Finish Etiquette Class (+20 XP)", "Kulturklasse beenden (+20 XP)")
                    : t("Next Culture Check ➜", "Nächste Frage ➜")}
                </button>
              )}
            </div>

            {/* Achievement card for culture */}
            {cultXPEarned && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
                🏆 <span>{t("German Culture Etiquette Class completed! +20 XP awarded.", "Etikette-Klasse erfolgreich absolviert! +20 XP gutgeschrieben.")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
