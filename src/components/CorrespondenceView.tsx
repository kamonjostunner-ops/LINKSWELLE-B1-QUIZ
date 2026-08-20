import React, { useState } from "react";
import { Settings } from "../types";
import { speak } from "../utils/audio";
import { getApiUrl } from "../utils/api";

interface CorrespondenceViewProps {
  settings: Settings;
  onAddPoints: (pts: number) => void;
  lang: "en" | "de";
  hideHeader?: boolean;
}

interface LetterPart {
  id: string;
  category: string;
  labelEn: string;
  labelDe: string;
  text: string;
  correctIndex: number;
}

const LANDLORD_PUZZLE: LetterPart[] = [
  {
    id: "abs",
    category: "Absender (Sender)",
    labelEn: "Sender Address",
    labelDe: "Absenderadresse",
    text: "Lena Schmidt, Waldweg 12, 10115 Berlin",
    correctIndex: 0
  },
  {
    id: "emp",
    category: "Empfänger (Recipient)",
    labelEn: "Recipient Address",
    labelDe: "Empfängeradresse",
    text: "Hausverwaltung Meyer GmbH, Hauptstraße 89, 10450 Berlin",
    correctIndex: 1
  },
  {
    id: "dat",
    category: "Datum (Date)",
    labelEn: "Place & Date",
    labelDe: "Ort & Datum",
    text: "Berlin, den 24. Juni 2026",
    correctIndex: 2
  },
  {
    id: "bet",
    category: "Betreff (Subject)",
    labelEn: "Subject Line",
    labelDe: "Betreffzeile",
    text: "Betreff: Dringende Reparatur der defekten Heizung im Wohnzimmer",
    correctIndex: 3
  },
  {
    id: "anr",
    category: "Anrede (Salutation)",
    labelEn: "Formal Salutation",
    labelDe: "Formelle Anrede",
    text: "Sehr geehrte Damen und Herren,",
    correctIndex: 4
  },
  {
    id: "ein",
    category: "Einleitung (Opening)",
    labelEn: "Opening Sentence",
    labelDe: "Einleitungssatz",
    text: "ich schreibe Ihnen, um einen dringenden Mangel in meiner Wohnung zu melden. Seit drei Tagen bleibt die Heizung im Wohnzimmer komplett kalt.",
    correctIndex: 5
  },
  {
    id: "hau",
    category: "Hauptteil (Body)",
    labelEn: "Body Paragraph",
    labelDe: "Hauptteil",
    text: "Bei den aktuellen Außentemperaturen liegt die Zimmertemperatur unter 15 Grad Celsius. Ein normales Wohnen ist unter diesen eisigen Bedingungen bedauerlicherweise unmöglich.",
    correctIndex: 6
  },
  {
    id: "sch",
    category: "Schluss (Conclusion)",
    labelEn: "Concluding Action",
    labelDe: "Schlusssatz & Frist",
    text: "Ich fordere Sie höflich auf, die Zentralheizung bis spätestens Freitag durch einen Fachbetrieb reparieren zu lassen, um weitere Mietminderungen zu vermeiden.",
    correctIndex: 7
  },
  {
    id: "gru",
    category: "Grußformel (Sign-off)",
    labelEn: "Complimentary Close",
    labelDe: "Grußformel (Kein Komma!)",
    text: "Mit freundlichen Grüßen",
    correctIndex: 8
  },
  {
    id: "unt",
    category: "Unterschrift (Signature)",
    labelEn: "Signature Name",
    labelDe: "Name des Absenders",
    text: "Lena Schmidt",
    correctIndex: 9
  }
];

const JOB_PUZZLE: LetterPart[] = [
  {
    id: "abs_j",
    category: "Absender (Sender)",
    labelEn: "Sender Address",
    labelDe: "Absenderadresse",
    text: "Maximilian Wagner, Goethestraße 5, 80331 München",
    correctIndex: 0
  },
  {
    id: "emp_j",
    category: "Empfänger (Recipient)",
    labelEn: "Recipient Address",
    labelDe: "Empfängeradresse",
    text: "AutoTech Bayern AG, Personalabteilung, Leopoldstraße 102, 80802 München",
    correctIndex: 1
  },
  {
    id: "dat_j",
    category: "Datum (Date)",
    labelEn: "Place & Date",
    labelDe: "Ort & Datum",
    text: "München, den 15. Juli 2026",
    correctIndex: 2
  },
  {
    id: "bet_j",
    category: "Betreff (Subject)",
    labelEn: "Subject Line",
    labelDe: "Betreffzeile",
    text: "Bewerbung als technischer Projektleiter (Ref.-ID: 9942)",
    correctIndex: 3
  },
  {
    id: "anr_j",
    category: "Anrede (Salutation)",
    labelEn: "Feminine Formal Salutation",
    labelDe: "Weibliche formelle Anrede",
    text: "Sehr geehrte Frau Dr. Hofmann,",
    correctIndex: 4
  },
  {
    id: "ein_j",
    category: "Einleitung (Opening)",
    labelEn: "Opening Sentence",
    labelDe: "Einleitungssatz",
    text: "mit großem Interesse habe ich Ihre Stellenausschreibung auf Ihrem Bewerberportal gelesen und bewerbe mich hiermit um diese anspruchsvolle Position.",
    correctIndex: 5
  },
  {
    id: "hau_j",
    category: "Hauptteil (Body)",
    labelEn: "Body Paragraph",
    labelDe: "Hauptteil (Erfahrung)",
    text: "In meiner vorherigen Beschäftigung als Systemadministrator konnte ich wertvolle Erfahrungen im Projektmanagement sammeln und komplexe Softwarelösungen implementieren.",
    correctIndex: 6
  },
  {
    id: "sch_j",
    category: "Schluss (Conclusion)",
    labelEn: "Concluding Call to Action",
    labelDe: "Schlusssatz & Ausblick",
    text: "Über die Gelegenheit, mich Ihnen in einem persönlichen Gespräch vorzustellen, freue ich mich sehr.",
    correctIndex: 7
  },
  {
    id: "gru_j",
    category: "Grußformel (Sign-off)",
    labelEn: "Complimentary Close",
    labelDe: "Grußformel",
    text: "Mit freundlichen Grüßen",
    correctIndex: 8
  },
  {
    id: "unt_j",
    category: "Unterschrift (Signature)",
    labelEn: "Signature Name",
    labelDe: "Name des Absenders",
    text: "Maximilian Wagner",
    correctIndex: 9
  }
];

interface MCQ {
  qEn: string;
  qDe: string;
  opts: string[];
  ansIdx: number;
  explanationEn: string;
  explanationDe: string;
}

const MCQ_CORRESPONDENCE: MCQ[] = [
  {
    qEn: "Which of the following formal complimentary closes is grammatically correct in German and does NOT take a trailing comma?",
    qDe: "Welche formelle Grußformel ist im Deutschen grammatikalisch korrekt und wird OHNE folgendes Komma geschrieben?",
    opts: [
      "Mit freundlichen Grüßen,",
      "Mit freundlichen Grüßen",
      "Viele Grüße,",
      "Mit herzlischen Grüßen"
    ],
    ansIdx: 1,
    explanationEn: "In German commercial or formal correspondence, there is strictly NO comma written after the complimentary close (e.g., 'Mit freundlichen Grüßen' is correct, whereas English uses 'Sincerely,').",
    explanationDe: "Nach der deutschen Grußformel 'Mit freundlichen Grüßen' steht im Gegensatz zum Englischen absolut kein Komma! Der Name des Absenders folgt in der nächsten Zeile."
  },
  {
    qEn: "When addressing someone whose name you do NOT know in a formal letter, which salutation is correct?",
    qDe: "Wenn du den Namen des Empfängers in einem formellen Brief NICHT kennst, wie lautet die korrekte Anrede?",
    opts: [
      "Sehr geehrter Damen und Herren,",
      "Liebe Kollegen,",
      "Sehr geehrte Damen und Herren,",
      "Hallo Herr oder Frau,"
    ],
    ansIdx: 2,
    explanationEn: "'Sehr geehrte Damen und Herren,' (Dear Sir or Madam) is the standard plural formal salutation in German when the specific recipient name is unknown. Note the ending '-e' on 'geehrte'.",
    explanationDe: "'Sehr geehrte Damen und Herren,' ist die klassische, formelle Anrede, wenn der genaue Name des Adressaten unbekannt ist. Gefolgt von einem Komma, beginnt der Einleitungssatz kleingeschrieben.",
  },
  {
    qEn: "What is a crucial rule for capitalization of formal pronouns in German letters (Briefe)?",
    qDe: "Welche wichtige Regel gilt für die Großschreibung von Höflichkeitspronomen in deutschen Briefen?",
    opts: [
      "Pronouns like 'sie' (they) are always capitalized everywhere.",
      "All formal terms of address (Sie, Ihr, Ihnen, Ihre) MUST be capitalized in correspondence.",
      "Uppercase letters are only used for the word 'Herr'.",
      "Formal pronouns should be written in all-lowercase."
    ],
    ansIdx: 1,
    explanationEn: "In German letters and emails, formal address pronouns ('Sie', 'Ihnen', 'Ihr', 'Ihre') must be capitalized to distinguish them from standard third-person plural 'sie' (they) and 'ihr' (you all).",
    explanationDe: "Höflichkeitspronomen (Sie, Ihnen, Ihr, Ihre) müssen brieflich immer großgeschrieben werden, um sich deutlich von 'sie' (they) oder 'ihr' (her/you all) abzugrenzen und Respekt auszudrücken."
  },
  {
    qEn: "Fill in the blank: 'Ich bewerbe mich ___ die Stelle als Buchhalter.'",
    qDe: "Ergänze die Lücke: 'Ich bewerbe mich ___ die Stelle als Buchhalter.'",
    opts: ["um", "für", "bei", "an"],
    ansIdx: 0,
    explanationEn: "The reflexive verb expression is 'sich bewerben um' + Accusative ('to apply for a job position'). While 'für' is often spoken colloquially, 'um' is the correct formal administrative German standard.",
    explanationDe: "In der formalen Schriftsprache heißt das feste Gefüge 'sich bewerben um' (+ Akkusativ). 'Sich bewerben für' hört man umgangssprachlich oft, gilt formell aber als weniger elegant."
  },
  {
    qEn: "How do you start the first text sentence of a German letter after the salutation comma (e.g., 'Sehr geehrte Frau Müller,')?",
    qDe: "Wie beginnt man den ersten Satz des Brieftextes nach dem Komma der Anrede (z.B. 'Sehr geehrte Frau Müller,')?",
    opts: [
      "With an upper-case letter (e.g., 'Ich schreibe...')",
      "With a lower-case letter (e.g., 'ich schreibe...'), unless the first word is a noun or 'Ich'",
      "You must leave two empty rows and start with a bullet point",
      "You must capitalize all letters of the first word"
    ],
    ansIdx: 1,
    explanationEn: "After the salutation comma, the sentence continues on a new line starting with a lower-case letter, unless the first word is a noun (e.g. 'Dienstleistungen...') or the subject pronoun 'Ich' which is always capitalized.",
    explanationDe: "Nach dem Anrede-Komma setzt man den Text mit einem Kleinbuchstaben am Zeilenanfang fort, es sei denn, das erste Wort ist ein Nomen oder das Personalpronomen 'Ich'."
  },
  {
    qEn: "Which of the following is the correct formal closing sentence for requesting a quick reply?",
    qDe: "Welcher Satz drückt eine formelle Bitte um ein schnelles Feedback am besten aus?",
    opts: [
      "Antworten Sie mir bitte so schnell es geht.",
      "Ich hoffe, du schreibst mir heute Abend zurück.",
      "Über eine baldige Antwort würde ich mich sehr freuen.",
      "Lass mich wissen, was Sache ist."
    ],
    ansIdx: 2,
    explanationEn: "'Über eine baldige Antwort würde ich mich sehr freuen' is a highly polite, classic and professional closing sentence in business correspondences.",
    explanationDe: "'Über eine baldige Antwort würde ich mich sehr freuen' ist die klassische, hochprofessionelle Formulierung, um höflich um eine Rückmeldung zu bitten (Konjunktiv II drückt Höflichkeit aus)."
  },
  {
    qEn: "Which salutation is appropriate when sending a formal email/letter to your direct manager, Mr. Weber?",
    qDe: "Welche Anrede ist angemessen, wenn du eine formelle E-Mail oder einen Brief an deinen direkten Vorgesetzten, Herrn Weber, schreibst?",
    opts: [
      "Hallo Herr Weber,",
      "Sehr geehrter Herr Weber,",
      "Lieber Weber,",
      "Guten Tag Weber?"
    ],
    ansIdx: 1,
    explanationEn: "'Sehr geehrter Herr Weber,' is the correct formal masculine singular salutation. Since he is your manager, maintaining standard professional distance with 'Sehr geehrter...' is safest unless you have mutually agreed on 'Du'.",
    explanationDe: "'Sehr geehrter Herr Weber,' ist die klassische formelle Anrede für einen Mann. Im beruflichen Kontext wahrt man diese höfliche Distanz, solange kein 'Du' vereinbart wurde."
  },
  {
    qEn: "How do you formally state in a letter that a document is attached (e.g., your CV)?",
    qDe: "Wie drückt man in einem Brief formell aus, dass ein Dokument (z.B. der Lebenslauf) beigefügt ist?",
    opts: [
      "Ich habe meinen Lebenslauf hier reingesteckt.",
      "Anbei erhalten Sie meinen Lebenslauf als Anlage.",
      "Guck dir mal meinen Lebenslauf an.",
      "Mein Lebenslauf fliegt mit dieser Post."
    ],
    ansIdx: 1,
    explanationEn: "'Anbei erhalten Sie meinen Lebenslauf als Anlage.' (Enclosed you receive my CV as an attachment) is the standard professional phrasing for enclosing documents.",
    explanationDe: "'Anbei erhalten Sie meinen Lebenslauf als Anlage.' ist eine feste, hochprofessionelle Formulierung in Bewerbungen, um auf beigefügte Dokumente hinzuweisen."
  },
  {
    qEn: "Which email greeting is formal yet slightly less rigid than 'Sehr geehrte...', often used in modern German office communications?",
    qDe: "Welche E-Mail-Anrede ist formell, aber etwas moderner und weniger steif als 'Sehr geehrte...', und wird oft im Büroalltag genutzt?",
    opts: [
      "Guten Tag Herr Schmidt,",
      "Hallo Schmidt,",
      "Was geht Herr Schmidt,",
      "Sehr geehrter Schmidt,"
    ],
    ansIdx: 0,
    explanationEn: "'Guten Tag Herr Schmidt,' is widely accepted as a polite, semi-formal greeting in modern German workplaces. It bridges the gap between ultra-formal letters and casual greetings.",
    explanationDe: "'Guten Tag Herr Schmidt,' ist eine freundliche, zeitgemäße Alternative zu 'Sehr geehrter...'. Sie wird im täglichen geschäftlichen E-Mail-Verkehr sehr häufig verwendet."
  },
  {
    qEn: "When writing an informal letter to a close friend, is it mandatory to capitalize 'du' or 'ihr'?",
    qDe: "Ist die Großschreibung von 'du' oder 'ihr' zwingend erforderlich, wenn du einen informellen Brief an einen engen Freund schreibst?",
    opts: [
      "Yes, all pronouns must be capitalized in writing.",
      "No, capitalization of informal pronouns is optional (though traditional), whereas formal 'Sie' is strictly mandatory.",
      "Yes, but only the word 'ihr'.",
      "No, informal pronouns must be written in ALL CAPS."
    ],
    ansIdx: 1,
    explanationEn: "Capitalizing informal pronouns ('du', 'dir', 'dein', 'ihr') in letters is optional and a matter of personal style (often used to show special warmth/respect), whereas formal address ('Sie', 'Ihnen', 'Ihr') is strictly mandatory by spelling rules.",
    explanationDe: "Seit der Rechtschreibreform ist die Großschreibung von 'du' und 'ihr' in Briefen optional (als Geste der Wertschätzung aber immer noch beliebt). Die Höflichkeitsform 'Sie' muss hingegen immer großgeschrieben werden."
  }
];

export default function CorrespondenceView({ settings, onAddPoints, lang, hideHeader }: CorrespondenceViewProps) {
  const currentLang = settings.lang;
  const t = (en: string, de: string) => (currentLang === "de" ? de : en);

  // Tab: 'assemble' | 'templates' | 'grammar' | 'aigrader'
  const [subTab, setSubTab] = useState<"assemble" | "templates" | "grammar" | "aigrader">("assemble");

  // ── SUBTAB 1: ASSEMBLER STATE ─────────────────────────────────
  const [puzzleSelection, setPuzzleSelection] = useState<"landlord" | "job">("landlord");
  const activePuzzle = puzzleSelection === "landlord" ? LANDLORD_PUZZLE : JOB_PUZZLE;

  // Track scrambled list and user's placed list
  const [shuffledPool, setShuffledPool] = useState<LetterPart[]>(() => {
    // Scaffold scrambled options
    return [...LANDLORD_PUZZLE].sort(() => Math.random() - 0.5);
  });
  const [userSelectionList, setUserSelectionList] = useState<LetterPart[]>([]);
  const [assemblerCompleted, setAssemblerCompleted] = useState(false);
  const [assemblySuccessMessage, setAssemblySuccessMessage] = useState("");
  const [assemblyXpClaimed, setAssemblyXpClaimed] = useState(false);

  const handleSelectPuzzle = (puz: "landlord" | "job") => {
    setPuzzleSelection(puz);
    const selectedSource = puz === "landlord" ? LANDLORD_PUZZLE : JOB_PUZZLE;
    setShuffledPool([...selectedSource].sort(() => Math.random() - 0.5));
    setUserSelectionList([]);
    setAssemblerCompleted(false);
    setAssemblySuccessMessage("");
  };

  const handleAddPartToSequence = (part: LetterPart) => {
    if (assemblerCompleted) return;
    setUserSelectionList((prev) => [...prev, part]);
    setShuffledPool((prev) => prev.filter((p) => p.id !== part.id));
  };

  const handleRemovePartFromSequence = (part: LetterPart) => {
    if (assemblerCompleted) return;
    setUserSelectionList((prev) => prev.filter((p) => p.id !== part.id));
    setShuffledPool((prev) => [...prev, part]);
  };

  const handleCheckAssemblySequence = () => {
    // Must place all 10 components
    if (userSelectionList.length < activePuzzle.length) {
      setAssemblySuccessMessage(t("Error: Please place all parts of the letter first!", "Fehler: Bitte platziere zuerst alle 10 Bestandteile des Briefes!"));
      return;
    }

    // Check numerical order
    let allCorrect = true;
    for (let i = 0; i < userSelectionList.length; i++) {
      if (userSelectionList[i].correctIndex !== i) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setAssemblerCompleted(true);
      setAssemblySuccessMessage(t("Perfect Assembly! You sequenced the official letter flawlessly.", "Hervorragende Leistung! Du hast den formellen Brief fehlerfrei geordnet."));
      if (!assemblyXpClaimed) {
        onAddPoints(25);
        setAssemblyXpClaimed(true);
      }
    } else {
      setAssemblySuccessMessage(t("Incorrect sequence detected! Try checking the flow. formal letters start with Absender, Empfänger, Ort/Datum, Betreff, Anrede, body segments, and end with Grußformel and Unterschrift.", "Ungültige Reihenfolge! Denke an den Standardaufbau eines formellen deutschen Briefes: Absenderadresse, Empfängeradresse, Ort & Datum, Betreffzeile, formelle Anrede, Einleitung, Inhalt, Schluss, Gruß und Name."));
    }
  };

  const handleResetPuzzle = () => {
    const selectedSource = puzzleSelection === "landlord" ? LANDLORD_PUZZLE : JOB_PUZZLE;
    setShuffledPool([...selectedSource].sort(() => Math.random() - 0.5));
    setUserSelectionList([]);
    setAssemblerCompleted(false);
    setAssemblySuccessMessage("");
  };

  const handlePlayLetterAudio = (text: string) => {
    speak(text, settings.ttsOn);
  };

  // ── SUBTAB 2: TEMPLATE GENERATOR STATE ───────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState<"sick" | "job_app" | "rent_issue" | "party">("sick");
  const [formSalutation, setFormSalutation] = useState<string>("Sehr geehrte Frau Müller");
  const [formDetailName, setFormDetailName] = useState<string>("Thomas Schmidt");
  const [formInputDetails, setFormInputDetails] = useState<string>("");
  const [formAuszeit, setFormAuszeit] = useState<string>("bis Freitag");
  const [pronounType, setPronounType] = useState<"formal" | "informal">("formal");

  // Assemble dynamic letter content depending on choices
  const getDynamicLetterLayout = () => {
    if (selectedTemplate === "sick") {
      const salutation = pronounType === "formal" ? `${formSalutation},` : `Hallo Karin,`;
      const closing = pronounType === "formal" ? "Mit freundlichen Grüßen" : "Herzliche Grüße";
      const subject = pronounType === "formal" ? "Betreff: Krankmeldung wegen Arbeitsunfähigkeit" : "Lieber Krankmeldung Gruß";
      const pronounIhr = pronounType === "formal" ? "Ihnen" : "dir";
      const pronounIhre = pronounType === "formal" ? "Ihre" : "deine";
      const detailText = formInputDetails.trim() || t("severe toothache / sudden flu", "starken Zahnschmerzen / plötzlicher Grippe");

      return {
        subject,
        salutation,
        lines: [
          pronounType === "formal" 
            ? `hiermit möchte ich mich aufgrund von ${detailText} krankmelden. Ich bin voraussichtlich für ${formAuszeit} arbeitsunfähig.`
            : `ich kann heute leider nicht ankommen, weil ich flachliege wegen ${detailText}. Ich werde wahrscheinlich ${formAuszeit} krankfeiern müssen.`,
          pronounType === "formal"
            ? `Eine ärztliche Arbeitsunfähigkeitsbescheinigung liegt dieser Mitteilung bei oder wird ${pronounIhr}en umgehend per Einschreiben zugesandt.`
            : `Mein Attest vom Arzt schicke ich ${pronounIhr} per Foto rüber.`,
          `Ich bitte Sie / dich um kurze Bestätigung der Urlaubsunterbrechung bzw. Krankentage. Für Rückfragen stehe ich telefonisch zur Verfügung.`,
          `Vielen Dank für das Verständnis und ${pronounIhre} Rücksichtnahme.`
        ],
        closing,
        signature: formDetailName
      };
    }

    if (selectedTemplate === "job_app") {
      const position = formInputDetails.trim() || t("Software Developer (React/TS)", "Softwareentwickler (React/TS)");
      const salutation = pronounType === "formal" ? `${formSalutation},` : "Hallo Frank,";
      const closing = pronounType === "formal" ? "Mit freundlichen Grüßen" : "Beste Grüße";
      const pronounIhre = pronounType === "formal" ? "Ihre" : "deine";

      return {
        subject: `Betreff: Bewerbung um die Stelle als ${position}`,
        salutation,
        lines: [
          `mit großem Interesse habe ich ${pronounIhre} Stellenausschreibung im Online-Portal gelesen und bewerbe mich hiermit um die ausgeschriebene Position als ${position}.`,
          `In meiner langjährigen Berufspraxis konnte ich tiefgehende Programmierkenntnisse in modernen Frameworks festigen und erfolgreich anspruchsvolle Systemarchitekturen entwerfen.`,
          `Ich bin davon überzeugt, dass meine engagierte Arbeitsweise und technologische Kompetenz eine hervorragende Bereicherung für Ihr zukunftsorientiertes Unternehmen darstellen.`,
          `Über ein persönliches Kennenlernen freue ich mich sehr.`
        ],
        closing,
        signature: formDetailName
      };
    }

    if (selectedTemplate === "rent_issue") {
      const issueText = formInputDetails.trim() || t("broken central heater / mold inside bath", "defekte Heizung / Schimmelbildung im Bad");
      const salutation = pronounType === "formal" ? `${formSalutation},` : "Hallo Vermieter,";
      const closing = pronounType === "formal" ? "Mit freundlichen Grüßen" : "Liebe Grüße";

      return {
        subject: `Betreff: Mängelanzeige bezüglich der Mietwohnung`,
        salutation,
        lines: [
          `hiermit melde ich mich schriftlich bei Ihnen bezüglich eines erheblichen Mangels in meiner Mietwohnung. Konkret geht es um Folgendes: ${issueText}.`,
          `Dies schränkt meine Wohnqualität signifikant ein, weswegen ich Sie bitten muss, den Mangel zügig überprüfen und reparieren zu lassen.`,
          `Als Frist zur Mängelbeseitigung setze ich hiermit den nächstmöglichen Werktag bzw. zwei Wochen an.`,
          `Sollte kein Handwerker geschickt werden, behalte ich mir eine anteilige Mietminderung gemäß BGB gesetzlich vor.`
        ],
        closing,
        signature: formDetailName
      };
    }

    // Party Invitation (informal)
    const place = formInputDetails.trim() || t("in my garden / at Pizzeria Milano", "in meinem Garten / in der Pizzeria Milano");
    const salutation = pronounType === "formal" ? "Sehr geehrter Herr Meyer," : `Liebe Freunde / Hallo,`;
    const closing = pronounType === "formal" ? "Mit freundlichen Grüßen" : "Herzliche Grüße / Bis bald";

    return {
      subject: `Betreff: Einladung zu meiner Geburtstagsfeier am Samstag! 🥳`,
      salutation,
      lines: [
        `ich lade euch alle ganz herzlich zu meiner großen Geburtstagsfeier am kommenden Samstag ein!`,
        `Wir feiern gemeinsam ab 18:00 Uhr. Die Location ist: ${place}. Für ausreichend kühle Getränke, Grillwürstchen und vegetarische Speisen ist natürlich bestens gesorgt.`,
        `Bringt am besten gute Laune und vielleicht einen leckeren Nudelsalat mit.`,
        `Bitte gebt mir bis Donnerstag Bescheid, ob ihr kommen könnt, damit ich die Einkäufe planen kann.`
      ],
      closing,
      signature: formDetailName
    };
  };

  const compiledLetter = getDynamicLetterLayout();

  // ── SUBTAB 3: GRAMMAR MCQS STATE ─────────────────────────────
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedMcqOpt, setSelectedMcqOpt] = useState<number | null>(null);
  const [mcqIsChecked, setMcqIsChecked] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqXpEarned, setMcqXpEarned] = useState(false);

  const handleSelectMcqOpt = (optIdx: number) => {
    if (mcqIsChecked) return;
    setSelectedMcqOpt(optIdx);
    setMcqIsChecked(true);

    if (optIdx === MCQ_CORRESPONDENCE[currentMcqIdx].ansIdx) {
      setMcqScore((prev) => prev + 1);
    }
  };

  const handleNextMcq = () => {
    setSelectedMcqOpt(null);
    setMcqIsChecked(false);

    if (currentMcqIdx < MCQ_CORRESPONDENCE.length - 1) {
      setCurrentMcqIdx((prev) => prev + 1);
    } else {
      if (!mcqXpEarned && mcqScore >= 4) {
        onAddPoints(25);
        setMcqXpEarned(true);
      }
      setCurrentMcqIdx(0);
      setMcqScore(0);
    }
  };

  // ── SUBTAB 4: AI CUSTOM WRITING GRADER STATE ─────────────────
  const [customUserText, setCustomUserText] = useState("");
  const [aiIsAnalyzing, setAiIsAnalyzing] = useState(false);
  const [aiAnalyzeError, setAiAnalyzeError] = useState("");
  const [aiReport, setAiReport] = useState<{
    cefrEstimate: string;
    grammarScore: number;
    overallFeedback: string;
    corrections: { original: string; corrected: string; explanation: string }[];
    vocabularyUpgrades: { original: string; upgrade: string; details: string }[];
  } | null>(null);

  const handleAnalyzeCustomLetter = async () => {
    if (!customUserText.trim()) return;

    setAiIsAnalyzing(true);
    setAiReport(null);
    setAiAnalyzeError("");

    try {
      const response = await fetch(getApiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: customUserText,
          cefrLevel: settings.cefrLevel || "B1"
        })
      });

      if (!response.ok) {
        throw new Error(t("Server experienced an error analyzing the text.", "Linguistik-Server meldet Fehler beim Verarbeiten."));
      }

      const data = await response.json();
      setAiReport(data);
      onAddPoints(20); // Reward active text writing composition effort
    } catch (err: any) {
      setAiAnalyzeError(err.message || t("Analysis failed. Try checking your internet connection.", "Analyse fehlgeschlagen. Versuche es gleich noch einmal."));
    } finally {
      setAiIsAnalyzing(false);
    }
  };

  return (
    <div className={`mx-auto max-w-lg bg-gray-50 dark:bg-slate-950 pb-28 ${hideHeader ? "" : "min-h-screen"}`}>
      {/* Premium Header */}
      {!hideHeader ? (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 shadow-sm dark:from-slate-950 dark:to-slate-900 border-b border-gray-100 dark:border-slate-900 rounded-b-3xl">
          <div className="text-[10px] uppercase font-black text-amber-300 tracking-widest flex items-center gap-2 flex-wrap">
            <span>★ LINKSWELLE INSTITUT • {t("B1 WRITING PRACTICE", "B1 SCHREIBTRAINER")} ★</span>
            <span className="bg-amber-400 text-slate-950 text-[9px] px-1.5 py-0.5 rounded font-black whitespace-nowrap">B1 LEVEL</span>
          </div>
          <h1 className="text-2xl font-black mt-1 tracking-tight flex items-center gap-2">
            ✉️ {t("B1 Correspondence & Letter Master", "B1 Brief- & E-Mail-Meister")}
          </h1>
          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
            {t(
              "Learn the exact structure, essential vocabulary, and grammar rules to ace all 3 writing tasks of the Goethe-Zertifikat B1 exam (E-Mails, Opinion Blog-Posts & formal letters).",
              "Meistere Struktur und Grammatik der 3 Goethe-Zertifikat B1 Schreibaufgaben (informelle E-Mails, Meinungsäußerung/Blog und formelle Briefe)."
            )}
          </p>

          {/* 4-way subtab bar */}
          <div className="mt-5 grid grid-cols-4 bg-slate-800/85 dark:bg-slate-900 rounded-xl p-1.5 gap-1.5 text-[10.5px] sm:text-xs font-bold text-center border border-slate-700/50">
            <button
              onClick={() => setSubTab("assemble")}
              className={`py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                subTab === "assemble"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                  : "text-slate-355 hover:text-white"
              }`}
              type="button"
            >
              🧩 {t("Assembler", "Baukasten")}
            </button>
            <button
              onClick={() => setSubTab("templates")}
              className={`py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                subTab === "templates"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                  : "text-slate-355 hover:text-white"
              }`}
              type="button"
            >
              📋 {t("Templates", "Vorlagen")}
            </button>
            <button
              onClick={() => setSubTab("grammar")}
              className={`py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                subTab === "grammar"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                  : "text-slate-355 hover:text-white"
              }`}
              type="button"
            >
              📝 {t("Rules MCQs", "Test")}
            </button>
            <button
              onClick={() => setSubTab("aigrader")}
              className={`py-2 rounded-lg cursor-pointer transition-all duration-150 select-none ${
                subTab === "aigrader"
                  ? "bg-amber-400 text-slate-950 font-black shadow-md border-b-2 border-amber-500 scale-105"
                  : "text-slate-355 hover:text-white"
              }`}
              type="button"
            >
              🧪 {t("AI Grader", "Prüfer")}
            </button>
          </div>
        </div>
      ) : (
        /* Render a premium embedded sub-tab selector when embedded to preserve 4-way utility */
        <div className="mx-4 mt-2 px-1.5 py-1.5 bg-slate-900 rounded-2xl grid grid-cols-4 gap-1 border border-slate-800/80 shadow-md animate-fade-in">
          <button
            onClick={() => setSubTab("assemble")}
            className={`py-2 rounded-xl text-center text-[11px] font-black tracking-tight select-none transition-all duration-155 cursor-pointer ${
              subTab === "assemble"
                ? "bg-amber-400 border-b-2 border-amber-500 text-slate-950 font-black scale-105 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            🧩 {t("Puzzle", "Baukasten")}
          </button>
          <button
            onClick={() => setSubTab("templates")}
            className={`py-2 rounded-xl text-center text-[11px] font-black tracking-tight select-none transition-all duration-155 cursor-pointer ${
              subTab === "templates"
                ? "bg-amber-400 border-b-2 border-amber-500 text-slate-950 font-black scale-105 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            📋 {t("Templates", "Vorlagen")}
          </button>
          <button
            onClick={() => setSubTab("grammar")}
            className={`py-2 rounded-xl text-center text-[11px] font-black tracking-tight select-none transition-all duration-155 cursor-pointer ${
              subTab === "grammar"
                ? "bg-amber-400 border-b-2 border-amber-500 text-slate-950 font-black scale-105 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            📝 {t("Rules MCQ", "Regeln")}
          </button>
          <button
            onClick={() => setSubTab("aigrader")}
            className={`py-2 rounded-xl text-center text-[11px] font-black tracking-tight select-none transition-all duration-155 cursor-pointer ${
              subTab === "aigrader"
                ? "bg-amber-400 border-b-2 border-amber-500 text-slate-950 font-black scale-105 shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
            type="button"
          >
            🧪 {t("AI Judge", "Prüfer")}
          </button>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* ── SUBTAB 1: ASSEMBLER TRAINER ── */}
        {subTab === "assemble" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-150 p-4 dark:bg-slate-900 dark:border-slate-850">
              <h2 className="text-sm font-black text-gray-850 dark:text-white mb-2 flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/45 dark:text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded">GOETHE B1 AUFGABE 3</span>
                <span>⚙️ {t("B1 Letter Structure Puzzle", "B1-Schreiben Baukasten")}</span>
              </h2>
              <p className="text-xs text-gray-400 leading-normal mb-4">
                {t(
                  "Rearrange the mixed components of a B1 formal letter/email in the absolute correct standard sequence (Absender ➜ Empfänger ➜ Ort/Datum ➜ Betreff ➜ Anrede ➜ Einleitung ➜ Hauptteil ➜ Schluss ➜ Grußformel ➜ Unterschrift) as required in Goethe B1 Aufgabe 3.",
                  "Ordne die durcheinandergewürfelten Abschnitte einer offiziellen B1-Heizungsreklamation oder Bewerbung in die richtige DIN 5008-Reihenfolge."
                )}
              </p>

              {/* Puzzle Selection switch */}
              <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold gap-1 mb-4">
                <button
                  onClick={() => handleSelectPuzzle("landlord")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    puzzleSelection === "landlord"
                      ? "bg-white text-gray-800 shadow-xs dark:bg-slate-750 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                >
                  🏢 {t("Landlord Issue", "Mietmängelbrief")}
                </button>
                <button
                  onClick={() => handleSelectPuzzle("job")}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    puzzleSelection === "job"
                      ? "bg-white text-gray-800 shadow-xs dark:bg-slate-750 dark:text-white"
                      : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                >
                  💼 {t("Job Application", "Bewerbungsschreiben")}
                </button>
              </div>

              {/* Placed Sequenced List */}
              <div className="space-y-2 border border-slate-200 bg-slate-50/50 p-3 rounded-2xl min-h-[160px] dark:border-slate-850 dark:bg-slate-950/20">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                  📥 {t("YOUR LETTER SEQUENCE IN ASSEMBLY:", "DEINE ENTWURFSREIHENFOLGE:")} (
                  {userSelectionList.length}/10 {t("placed", "platziert")})
                </span>

                {userSelectionList.length === 0 && (
                  <p className="text-[11px] text-gray-400 italic py-6 text-center">
                    {t("Selected blocks will lock sequentially here...", "Gewählte Fragmente erscheinen sortiert an dieser Stelle...")}
                  </p>
                )}

                {userSelectionList.map((item, idx) => {
                  let badgeColor = "bg-indigo-50 border-indigo-100 text-indigo-800 dark:bg-indigo-950/30 dark:border-indigo-900/40 dark:text-indigo-400";
                  if (assemblerCompleted) {
                    badgeColor = "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300";
                  }

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleRemovePartFromSequence(item)}
                      className={`p-2.5 border rounded-xl flex items-start gap-2.5 text-[11px] cursor-pointer hover:bg-red-50/45 dark:hover:bg-red-950/20 hover:border-red-200 transition ${badgeColor}`}
                    >
                      <div className="font-mono font-bold bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-150">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <strong className="block text-[9px] uppercase font-bold text-gray-500">
                          {t(item.labelEn, item.labelDe)}
                        </strong>
                        <span className="mt-0.5 font-sans leading-relaxed block text-gray-800 dark:text-slate-205">
                          {item.text}
                        </span>
                      </div>
                      <span className="text-gray-400 hover:text-red-600 transition">✕</span>
                    </div>
                  );
                })}
              </div>

              {/* Scrambled Pool of Blocks */}
              {shuffledPool.length > 0 && (
                <div className="mt-5 space-y-2">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                    🥞 {t("SCRAMBLED PIECES (TAP TO ORDER)", "FRAGMENTE-POOL (ANKLICKEN ZUSTAPELN):")}
                  </span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {shuffledPool.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleAddPartToSequence(item)}
                        className="p-2 border border-dashed border-gray-200 bg-white hover:bg-indigo-50/30 text-[11px] text-left rounded-xl transition cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-850 dark:text-slate-300"
                        type="button"
                      >
                        <span className="inline-block px-1.5 py-0.5 text-[8px] bg-gray-100 text-gray-500 rounded uppercase font-black tracking-wider border mr-2 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          {t(item.labelEn, item.labelDe)}
                        </span>
                        <span className="leading-tight">{item.text.replace("\n", " ")}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action and feedback messaging */}
              {assemblySuccessMessage && (
                <div className={`p-3 rounded-xl border mt-4 text-xs font-semibold leading-relaxed animate-fade-in ${
                  assemblerCompleted
                    ? "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300"
                    : "bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300"
                }`}>
                  {assemblySuccessMessage}
                </div>
              )}

              {/* Bottom Actions Row */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleResetPuzzle}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-extrabold rounded-lg transition border border-gray-200/50 cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700"
                  type="button"
                >
                  🔄 {t("Reset", "Neustart")}
                </button>

                {!assemblerCompleted && (
                  <button
                    onClick={handleCheckAssemblySequence}
                    className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                    type="button"
                  >
                    🔑 {t("Check Correspondence Sequence", "Abfolge überprüfen")}
                  </button>
                )}

                {assemblerCompleted && (
                  <button
                    onClick={() => handlePlayLetterAudio(userSelectionList.map(u => u.text).join(". "))}
                    className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-lg transition cursor-pointer"
                    type="button"
                  >
                    🔊 {t("Listen to Completed Letter", "Brief vorlesen")}
                  </button>
                )}
              </div>
            </div>

            {assemblyXpClaimed && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
                🌟 <span>{t("You unlocked +25 XP inside Module 5 for professional administrative sequencing!", "Du hast +25 XP im Modul 5 für korrektes deutsches Briefsequenzieren erhalten!")}</span>
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB 2: ADAPTIVE TEMPLATE GENERATOR ── */}
        {subTab === "templates" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-150 p-4 dark:bg-slate-900 dark:border-slate-850 space-y-4">
              <h2 className="text-sm font-black text-gray-850 dark:text-white flex items-center gap-1.5 flex-wrap">
                <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-950/45 dark:text-indigo-400 text-[9px] font-black px-1.5 py-0.5 rounded">GOETHE B1 CERTIFICATE</span>
                <span>📋 {t("Interactive Brief Template Creator", "Mails und Briefe generieren")}</span>
              </h2>

              {/* Template selector tabs */}
              <div className="grid grid-cols-4 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl gap-0.5 text-[8.5px] font-black text-center">
                <button
                  onClick={() => setSelectedTemplate("sick")}
                  className={`py-1.5 rounded-md transition ${
                    selectedTemplate === "sick" ? "bg-white text-gray-800 shadow-xs dark:bg-slate-700 dark:text-white font-extrabold" : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                  title={t("Goethe B1 Schreiben Aufgabe 3 (Formal Email)", "Goethe B1 Schreiben Aufgabe 3 (Formell)")}
                >
                  🤒 {t("B1 Task 3: Sick", "B1 Aufg 3")}
                </button>
                <button
                  onClick={() => setSelectedTemplate("job_app")}
                  className={`py-1.5 rounded-md transition ${
                    selectedTemplate === "job_app" ? "bg-white text-gray-800 shadow-xs dark:bg-slate-700 dark:text-white font-extrabold" : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                  title={t("B1 Business Letter", "B1-Schreiben Bewerbung")}
                >
                  💼 {t("B1 Job", "B1 Job")}
                </button>
                <button
                  onClick={() => setSelectedTemplate("rent_issue")}
                  className={`py-1.5 rounded-md transition ${
                    selectedTemplate === "rent_issue" ? "bg-white text-gray-850 shadow-xs dark:bg-slate-700 dark:text-white font-extrabold" : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                  title={t("Goethe B1 Schreiben Aufgabe 3 (Formal Complaint)", "Goethe B1 Schreiben Aufgabe 3 (Heizung)")}
                >
                  🏚️ {t("B1 Task 3: Rent", "B1 Aufg 3")}
                </button>
                <button
                  onClick={() => setSelectedTemplate("party")}
                  className={`py-1.5 rounded-md transition ${
                    selectedTemplate === "party" ? "bg-white text-gray-850 shadow-xs dark:bg-slate-700 dark:text-white font-extrabold" : "text-gray-500 hover:text-gray-700 dark:text-slate-450"
                  }`}
                  type="button"
                  title={t("Goethe B1 Schreiben Aufgabe 1 (Informal Invitation)", "Goethe B1 Schreiben Aufgabe 1 (Einladung)")}
                >
                  🥳 {t("B1 Task 1: Invite", "B1 Aufg 1")}
                </button>
              </div>

              {/* Interactive Form Filters Row */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-gray-100 dark:bg-slate-950 dark:border-slate-850/60">
                <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">
                  🛠️ {t("ADJUST CORRESPONDENCE ATTRIBUTES:", "PARAMETER ANPASSEN:")}
                </span>

                {/* Pronouns Form Toggle */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                    {t("Pronouns Tone", "Anrede-Stil")}
                  </label>
                  <div className="flex bg-gray-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold gap-1 w-fit">
                    <button
                      onClick={() => setPronounType("formal")}
                      className={`px-3 py-1 rounded transition select-none ${
                        pronounType === "formal" ? "bg-white text-gray-800 dark:bg-slate-700 dark:text-white" : "text-gray-500"
                      }`}
                      type="button"
                    >
                      {t("Sie / Ihr (Formal)", "Sie (formell)")}
                    </button>
                    <button
                      onClick={() => setPronounType("informal")}
                      className={`px-3 py-1 rounded transition select-none ${
                        pronounType === "informal" ? "bg-white text-gray-800 dark:bg-slate-700 dark:text-white" : "text-gray-500"
                      }`}
                      type="button"
                    >
                      {t("du / dein (Informal)", "Du (informell)")}
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                      {t("Sender Name", "Absendername")}
                    </label>
                    <input
                      value={formDetailName}
                      onChange={(e) => setFormDetailName(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 rounded-lg dark:border-slate-800 text-gray-800 dark:text-white font-medium"
                      type="text"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                      {t("Recipient Salutation", "Empfängersalutierung")}
                    </label>
                    <input
                      value={formSalutation}
                      onChange={(e) => setFormSalutation(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 rounded-lg dark:border-slate-800 text-gray-800 dark:text-white font-medium shadow-2xs"
                      type="text"
                      disabled={pronounType === "informal"}
                    />
                  </div>
                </div>

                {/* Specific custom detail text input */}
                <div>
                  <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                    {selectedTemplate === "sick" ? t("Illness / Reason (e.g. Toothache)", "Konkrete Beschwerde (z.B. Grippe)") 
                     : selectedTemplate === "job_app" ? t("Target Job Position", "Gewünschter Job-Posten")
                     : selectedTemplate === "rent_issue" ? t("Apartment Issue Details", "Wohnungsmängel-Details")
                     : t("Party Location (where?)", "Partyort (wo?)")}
                  </label>
                  <input
                    value={formInputDetails}
                    onChange={(e) => setFormInputDetails(e.target.value)}
                    placeholder={selectedTemplate === "sick" ? "Zahnschmerzen" : selectedTemplate === "job_app" ? "Softwareentwickler" : "defekte Heizung"}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 rounded-lg dark:border-slate-800 text-gray-800 dark:text-white font-medium text-xs"
                    type="text"
                  />
                </div>

                {selectedTemplate === "sick" && (
                  <div>
                    <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                      {t("Estimated Duration (Auszeit)", "Voraussichtliche Krankheitsdauer")}
                    </label>
                    <input
                      value={formAuszeit}
                      onChange={(e) => setFormAuszeit(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-250 rounded-lg dark:border-slate-800 text-gray-800 dark:text-white font-medium text-xs"
                      type="text"
                    />
                  </div>
                )}
              </div>

              {/* Rendered compiled letter body */}
              <div className="border border-slate-200 shadow-2xs rounded-2xl bg-white p-5 space-y-4 font-serif text-[11.5px] text-gray-800 leading-relaxed dark:bg-slate-900 dark:border-slate-850 dark:text-slate-350 select-text overflow-hidden relative">
                {/* Stamp style watermark */}
                <div className="absolute right-5 top-5 border-2 border-dashed border-indigo-200 text-indigo-200 dark:border-slate-800 dark:text-slate-800 px-3 py-1 font-mono uppercase font-black tracking-widest text-[9px] rounded transform rotate-12 select-none">
                  DEUTSCHLAND
                </div>

                <div className="font-sans font-extrabold text-[11px] text-indigo-900 dark:text-emerald-400">
                  {compiledLetter.subject}
                </div>

                <div className="pt-2 font-bold">{compiledLetter.salutation}</div>

                <div className="space-y-2.5">
                  {compiledLetter.lines.map((l, lIdx) => (
                    <p key={lIdx}>{l}</p>
                  ))}
                </div>

                <div className="pt-3">
                  <p>{compiledLetter.closing}</p>
                  <p className="font-extrabold mt-3.5 font-sans text-xs text-gray-900 dark:text-white">{compiledLetter.signature}</p>
                </div>
              </div>

              {/* Copy & speak helper action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const fullText = `${compiledLetter.subject}\n\n${compiledLetter.salutation}\n\n${compiledLetter.lines.join("\n\n")}\n\n${compiledLetter.closing}\n${compiledLetter.signature}`;
                    navigator.clipboard.writeText(fullText);
                    alert(t("Letter layout successfully copied to clipboards!", "Brief-Layout erfolgreich in Zwischenablage kopiert!"));
                  }}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                  type="button"
                >
                  📋 {t("Copy Text to Clipboard", "Brief kopieren")}
                </button>
                <button
                  onClick={() => {
                    const fullText = `${compiledLetter.salutation}. ${compiledLetter.lines.join(" ")} ${compiledLetter.closing}, ${compiledLetter.signature}`;
                    handlePlayLetterAudio(fullText);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-extrabold rounded-xl transition border cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-white dark:border-slate-700"
                  type="button"
                >
                  🔊 {t("Listen Voice", "Zuhören")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SUBTAB 3: GRAMMAR ADM QUESTIONS MCQS ── */}
        {subTab === "grammar" && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase flex items-center gap-1.5">
                <span className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded text-[8px] font-black">B1 SCHREIBEN</span>
                <span>{t("B1 CORRESPONDENCE EXAM", "B1-REGELN PRÜFUNG")}</span>
              </span>
              <span className="text-[11px] font-mono text-gray-500 bg-gray-200/50 dark:bg-slate-900 dark:text-slate-400 px-2.5 py-0.5 rounded-full">
                {currentMcqIdx + 1} / {MCQ_CORRESPONDENCE.length}
              </span>
            </div>

            {/* MCQ Quiz Panel */}
            <div className="bg-white rounded-2xl border border-gray-150/70 p-5 dark:bg-slate-900 dark:border-slate-850 shadow-xs space-y-4">
              <div className="p-4 bg-indigo-50/45 dark:bg-slate-950 rounded-xl border border-indigo-100/30">
                <h3 className="text-xs font-semibold uppercase text-indigo-700 tracking-wider dark:text-emerald-400">
                  {t("QUESTION DETAILS", "PRÜFUNGSFRAGE")}
                </h3>
                <h4 className="text-sm font-extrabold text-gray-800 dark:text-white font-sans tracking-tight mt-1">
                  {t(MCQ_CORRESPONDENCE[currentMcqIdx].qEn, MCQ_CORRESPONDENCE[currentMcqIdx].qDe)}
                </h4>
              </div>

              {/* Choice Options */}
              <div className="space-y-2">
                {MCQ_CORRESPONDENCE[currentMcqIdx].opts.map((opt, oIdx) => {
                  const isCorrect = oIdx === MCQ_CORRESPONDENCE[currentMcqIdx].ansIdx;
                  const isSelected = oIdx === selectedMcqOpt;

                  let optCls = "bg-gray-55 hover:bg-gray-100 border-gray-200 text-gray-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 dark:border-slate-700";
                  if (mcqIsChecked) {
                    if (isCorrect) {
                      optCls = "bg-emerald-50 text-emerald-850 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 font-extrabold";
                    } else if (isSelected) {
                      optCls = "bg-red-50 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800";
                    } else {
                      optCls = "opacity-45 border-gray-150 text-gray-400 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectMcqOpt(oIdx)}
                      className={`w-full text-left p-3.5 border rounded-xl text-xs font-semibold cursor-pointer transition flex items-start gap-2 leading-normal ${optCls}`}
                      disabled={mcqIsChecked}
                      type="button"
                    >
                      <span className="font-black bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono mr-1">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Rule Explanation Reveal */}
              {mcqIsChecked && (
                <div className="p-4 bg-teal-50/50 text-teal-900 border border-teal-150/40 rounded-xl dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-300 text-xs leading-relaxed animate-fade-in">
                  <h4 className="font-extrabold uppercase text-[10px] text-teal-700 tracking-wider dark:text-teal-400">
                    💡 {t("OFFICIAL REGULATORY EXPLANATION", "KORRESPONDENZREGEL")}
                  </h4>
                  <p className="mt-1">
                    {t(MCQ_CORRESPONDENCE[currentMcqIdx].explanationEn, MCQ_CORRESPONDENCE[currentMcqIdx].explanationDe)}
                  </p>
                </div>
              )}

              {/* Progress CTA */}
              {mcqIsChecked && (
                <button
                  onClick={handleNextMcq}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                  type="button"
                >
                  {currentMcqIdx === MCQ_CORRESPONDENCE.length - 1
                    ? `${t("Finish Correspondence Exam", "Briefkunde abschließen")} (+25 XP)`
                    : t("Next Challenge ➜", "Nächste Prüfungsfrage ➜")}
                </button>
              )}
            </div>

            {/* Quiz Progress metrics summary */}
            <div className="p-3 bg-white border border-gray-150 rounded-2xl dark:bg-slate-900 dark:border-slate-850 flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500 dark:text-slate-400">
                {t("Total Correct: ", "Gesamt richtig: ")}
              </span>
              <span className="font-black text-gray-800 dark:text-white font-mono text-sm bg-gray-50 dark:bg-slate-950 px-2 py-0.5 rounded-md">
                {mcqScore} / {MCQ_CORRESPONDENCE.length}
              </span>
            </div>

            {mcqXpEarned && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl dark:bg-emerald-950/25 dark:border-emerald-900/30 dark:text-emerald-300 flex items-center gap-2">
                🏆 <span>{t("German Letters and Correspondence Exam Passed! +25 XP awarded.", "Briefkunde-Zertifikat erfolgreich abgeschlossen! +25 XP gutgeschrieben.")}</span>
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB 4: AI CUSTOM WRITING GRADER ── */}
        {subTab === "aigrader" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-150 p-4 dark:bg-slate-900 dark:border-slate-850 space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-150/50 rounded-xl dark:bg-teal-950/40 dark:border-teal-900/30 dark:text-teal-300">
                <span className="text-[9px] uppercase font-bold text-teal-800 tracking-wider dark:text-teal-400">
                  ★ {t("MODULE 5: PRACTICAL COMPOSITION CHALLENGE", "KREATIVE SCHREIBENTWÜRFE")} ★
                </span>
                <p className="text-xs mt-1 leading-normal text-teal-950 dark:text-slate-205">
                  <strong>{t("Your Task:", "Deine Aufgabe:")}</strong>{" "}
                  {t(
                    "Write an apology letter to your German professor explaining you can't attend class tomorrow due to urgent reasons, or submit a custom administrative complaint. Write at least 2-3 sentences.",
                    "Schreibe einen formellen Entschuldigungsbrief an deinen Deutschlehrer, warum du am morgigen Unterricht nicht teilnehmen kannst, oder formuliere einen eigenen Briefentwurf zur vollautomatischen AI-Grammatikprüfung."
                  )}
                </p>
              </div>

              {/* B1 Quick Prompts selection */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-150 dark:border-slate-850">
                <span className="text-[10px] font-black text-gray-500 block uppercase tracking-wider">
                  💡 {t("LOAD A GOETHE B1 WRITING EXAM PROMPT FORMAT:", "GOETHE B1 PRÜFUNGSAUFGABE LADEN:")}
                </span>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <button
                    onClick={() => {
                      setCustomUserText(
                        "Liebe Sarah,\n\nich danke dir herzlich für die Einladung zu deiner Geburtstagsparty! Ich komme sehr gerne. Kann ich vielleicht einen leckeren Salat oder etwas zum Trinken mitbringen?\n\nWie komme ich am besten mit den öffentlichen Verkehrsmitteln zu deiner neuen Wohnung?\n\nBis Samstag, liebe Grüße!"
                      );
                    }}
                    className="p-2 border rounded-lg text-left bg-white hover:bg-indigo-50/40 border-gray-200 dark:bg-slate-900 dark:border-slate-805 transition flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <span className="bg-indigo-600 text-white font-mono text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">TASK 1 (EMAIL)</span>
                    <span className="text-[10px] text-gray-600 dark:text-slate-350 leading-tight">
                      {t("Informal RSVP: Answer invitation (~80 words)", "Informelle Einladung beantworten (~80 Wörter)")}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setCustomUserText(
                        "Hallo zusammen,\n\nich bin der Meinung, dass Smartphones im Schulunterricht nützlich sein können, um schnell Vokabeln im Internet nachzuschlagen. Allerdings stören sie oft die Konzentration der Schüler. Man sollte Handys nur für kurze Recherche-Aufgaben erlauben."
                      );
                    }}
                    className="p-2 border rounded-lg text-left bg-white hover:bg-amber-50/30 border-gray-200 dark:bg-slate-900 dark:border-slate-805 transition flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <span className="bg-amber-500 text-slate-950 font-mono text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">TASK 2 (BLOG)</span>
                    <span className="text-[10px] text-gray-600 dark:text-slate-350 leading-tight">
                      {t("Opinion Blog: 'Handynutzung im Unterricht' (~80 words)", "Meining im Blog: Handynutzung im Unterricht (~80 Wörter)")}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setCustomUserText(
                        "Sehr geehrte Frau Dr. Weber,\n\nich kann morgen am Mittwoch leider nicht zum Unterricht erscheinen, da ich unter starken Kopfschmerzen leide und einen dringenden Arzttermin habe. Ich bitte Sie höflich, meine Abwehr zu entschuldigen."
                      );
                    }}
                    className="p-2 border rounded-lg text-left bg-white hover:bg-emerald-50/30 border-gray-200 dark:bg-slate-900 dark:border-slate-805 transition flex items-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <span className="bg-emerald-500 text-slate-950 font-mono text-[8px] font-black px-1.5 py-0.5 rounded whitespace-nowrap">TASK 3 (FORMAL)</span>
                    <span className="text-[10px] text-gray-600 dark:text-slate-350 leading-tight">
                      {t("Formal Excuse: Illness notice to professor (~40 words)", "Formelle Entschuldigung an Lehrkraft senden (~40 Wörter)")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Text Writing Area */}
              <div>
                <label className="text-[10px] font-black text-gray-500 block uppercase mb-1">
                  {t("WRITE YOUR GERMAN B1 COMPOSITION HERE (MIN. 20 CHARACTERS):", "DEINEN DEUTSCH-SCHREIBENTWURF HIER EINGEBEN:")}
                </label>
                <textarea
                  value={customUserText}
                  onChange={(e) => setCustomUserText(e.target.value)}
                  placeholder="Sehr geehrte Frau Dr. Weber, ich kann morgen leider nicht am Deutschunterricht teilnehmen, da ich einen dringenden Arzttermin habe..."
                  rows={6}
                  className="w-full p-3 font-serif rounded-xl border border-gray-250 bg-white dark:bg-slate-900 text-gray-800 dark:text-white dark:border-slate-800 text-[11.5px] leading-relaxed focus:ring-1 focus:ring-indigo-500 outline-none shadow-xs shadow-inner"
                />
                <span className="text-[9px] text-gray-400 flex justify-end font-mono">
                  {customUserText.length} {t("characters", "Zeichen")}
                </span>
              </div>

              {/* Submit trigger button */}
              <button
                onClick={handleAnalyzeCustomLetter}
                disabled={aiIsAnalyzing || customUserText.trim().length < 20}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600 disabled:opacity-45 disabled:cursor-not-allowed uppercase tracking-widest font-black"
                type="button"
              >
                {aiIsAnalyzing ? (
                  <span className="flex items-center justify-center gap-1.5">
                    ⚙️ {t("AI PROFESSOR ASSESSING...", "KI-PRÜFER ANALYSIERT...")}
                  </span>
                ) : (
                  <span>🧪 {t("Evaluate Composition Grade", "Aufsatz benoten lassen")}</span>
                )}
              </button>

              {aiAnalyzeError && (
                <div className="p-3.5 bg-red-50 border border-red-100 text-red-900 text-xs rounded-xl dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300">
                  {aiAnalyzeError}
                </div>
              )}

              {/* Comprehensive Linguistic Report */}
              {aiReport && (
                <div className="p-4 bg-gray-50/50 border border-gray-150 rounded-2xl dark:bg-slate-950/30 dark:border-slate-850/80 space-y-4 animate-fade-in text-xs">
                  <div className="flex justify-between items-center border-b border-gray-200/50 pb-2.5 dark:border-slate-850">
                    <span className="font-extrabold text-xs uppercase text-indigo-700 dark:text-emerald-400">
                      📝 {t("Linguistic Professor Report", "Verfasserbewertung")}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-mono font-black text-[10.5px]">
                      {t("CEFR ", "CEFR ")} {aiReport.cefrEstimate}
                    </span>
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl dark:border-slate-800">
                      <span className="block text-[9px] uppercase text-gray-400 font-extrabold">
                        {t("GRAMMAR PRECISION", "Aufsatz-Präzision")}
                      </span>
                      <span className="text-base font-black text-emerald-500 font-mono">
                        {aiReport.grammarScore}%
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-2 border rounded-xl dark:border-slate-800">
                      <span className="block text-[9px] uppercase text-gray-400 font-extrabold">
                        {t("STENCIL REWARD", "Fortbildungspunkt")}
                      </span>
                      <span className="text-base font-black text-amber-500 font-mono">
                        +20 XP
                      </span>
                    </div>
                  </div>

                  {/* Executive feedback review */}
                  <div>
                    <h4 className="font-black text-[9px] uppercase text-gray-400 tracking-wider">
                      💬 {t("PROFESSOR FEEDBACK", "PROFESSOR-REZENSION")}
                    </h4>
                    <p className="mt-1 leading-normal text-gray-700 dark:text-slate-350">
                      {aiReport.overallFeedback}
                    </p>
                  </div>

                  {/* Sentence-by-sentence Margin corrections red pens */}
                  {aiReport.corrections && aiReport.corrections.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-black text-[9px] uppercase text-gray-400 tracking-wider block">
                        🖍️ {t("GRAMMATICAL RECTIFICATIONS (RED PEN)", "KORREKTUREN & DEKLENSIONEN (ROTER STIFT)")}
                      </h4>
                      <div className="space-y-1.5">
                        {aiReport.corrections.map((corr, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-3 bg-red-50/45 border border-red-150/45 rounded-xl dark:bg-red-950/15 dark:border-red-900/20 text-[11px] leading-relaxed"
                          >
                            <div className="line-through text-red-600 font-serif mb-0.5">
                              "{corr.original}"
                            </div>
                            <div className="text-emerald-600 font-serif font-black mb-1">
                              ➜ "{corr.corrected}"
                            </div>
                            <p className="text-[10px] text-gray-500 italic mt-0.5 leading-normal dark:text-slate-400">
                              {corr.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vocabulary stylistic upgrades recommendation */}
                  {aiReport.vocabularyUpgrades && aiReport.vocabularyUpgrades.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-black text-[9px] uppercase text-gray-400 tracking-wider block">
                        🚀 {t("VOCABULARY STYLING UPGRADES", "STILISTISCHE VOKABEL-AUFWERTUNGEN")}
                      </h4>
                      <div className="space-y-1.5">
                        {aiReport.vocabularyUpgrades.map((upg, uIdx) => (
                          <div
                            key={uIdx}
                            className="p-3 bg-teal-50/50 border border-teal-150/45 rounded-xl dark:bg-teal-950/10 dark:border-teal-900/15 text-[11px] leading-relaxed"
                          >
                            <span className="text-gray-400 line-through">"{upg.original}"</span>{" "}
                            <span className="text-teal-600 font-extrabold">➜ "{upg.upgrade}"</span>
                            <p className="text-[10px] text-gray-500 italic mt-0.5 leading-normal dark:text-slate-400">
                              {upg.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
