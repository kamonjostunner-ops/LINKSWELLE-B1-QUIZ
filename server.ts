import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Gemini API Client initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize Gemini Client:", err);
      }
    }
  }
  return aiClient;
}

// Global API Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!process.env.GEMINI_API_KEY });
});

// ────────────────────────────────────────────────────────────────
// API Endpoint: Spoken Chat Roleplay Partner
// ────────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, scenario, cefrLevel } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return beautiful fallback simulation responses
      return res.json(getLocalScenarioResponse(messages, scenario, cefrLevel));
    }

    // Format the messages for Gemini
    // Prepare a concise custom prompt containing conversation history and roleplay goals
    const conversationStr = messages
      .map((m: any) => `${m.role === "user" ? "Student" : "Partner"}: ${m.content}`)
      .join("\n");

    const sysInstruction = `You are a friendly German speaking native conversational partner for a student learning German.
The current roleplay scenario is "${scenario}".
The student's fluency level is "${cefrLevel || "B1"}".
You MUST adjust the complexity of your German (vocabulary, sentence structures, idioms) to match the CEFR level "${cefrLevel || "B1"}" perfectly.
- If A1: Use extremely simple, clear sentences. Keep questions short.
- If A2/B1: Use intermediate structures, standard everyday conversational vocabulary.
- If B2/C1: Use sophisticated vocabulary, occasional professional/colloquial German phrases, and complex sentences.

Your task:
1. Formulate a natural, welcoming next reply in German. Keep it brief (1 to 3 sentences maximum) so the conversation is snappy and conversational.
2. Translate your German reply into fluent, natural English.
3. Review the student's last input text. If they made any mistakes in spelling, verb conjugation, adjectives, cases (Nominativ/Akkusativ/Dativ/Genitiv), or word order (such as placing verbs incorrectly in main or subordinate clauses), provide a friendly, precise, one-sentence explanation in English showing the correction. If their German was flawless, output null.

Format your response strictly as a JSON object matching this schema:
{
  "replyDe": "German text reply",
  "replyEn": "English translation of the German reply",
  "correction": "Correction explanation in English, or null if student made no mistake."
}`;

    const prompt = `Here is the current conversation history so far. Respond to the Student's last message:
\n${conversationStr}\n
Respond now and output exactly the JSON structure specified inside the system instructions.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Roleplay API error:", error);
    res.status(500).json({
      error: "AI Generation failed",
      message: error.message,
      // Provide clean fallback so the user experience doesn't break
      replyDe: "Entschuldigung, meine Gedanken haben sich kurz verknotet. Was wolltest du sagen?",
      replyEn: "Apologies, my thoughts got a bit tangled. What did you want to say?",
      correction: null,
    });
  }
});

// ────────────────────────────────────────────────────────────────
// API Endpoint: Creative Essay / Composition Grammar Lab
// ────────────────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, cefrLevel } = req.body;
    const ai = getGeminiClient();

    if (!text || text.trim() === "") {
      return res.status(450).json({ error: "Text is empty" });
    }

    if (!ai) {
      // Local smart grammar fallback
      return res.json(getLocalAnalysisResponse(text, cefrLevel));
    }

    const sysInstruction = `You are a high-caliber professional German linguistic professor and CEFR examiner.
The student has submitted a custom German text for spelling, syntax, style, and grammatical assessment.
Your target target level to evaluate against is "${cefrLevel || "B1"}".

You must perform a detailed analysis and return exactly a JSON object matching this schema:
{
  "cefrEstimate": "Estimated CEFR compatibility of their writing (e.g. A1, A2, B1, B2, C1)",
  "grammarScore": 85, // A score from 0 to 100 assessing grammatical precision
  "overallFeedback": "A short encouraging analysis in English summarizing their styling, voice, verb tenses, and case structures",
  "corrections": [
    {
      "original": "exact sub-segment of student's original text that had an error",
      "corrected": "the corrected equivalent of that sub-segment",
      "explanation": "Linguistic explanation of the mistake (e.g. subject-verb agreement, Dativ prepositions, verb placement at end of subordinate clause)"
    }
  ],
  "vocabularyUpgrades": [
    {
      "original": "a simple/reused word choice",
      "upgrade": "a more colorful, B1/B2 level synonym or professional term",
      "details": "Explanation with correct German article, gender, or conjugation details (e.g., 'der Vorschlag' instead of just saying 'die Idee')"
    }
  ]
}

Ensure the JSON is perfectly valid and properly formatted.`;

    const prompt = `Analyze this student text and return the assessed JSON structure:
\n"""\n${text}\n"""\n`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: sysInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsedText = response.text || "{}";
    const data = JSON.parse(parsedText.trim());
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini Analysis API error:", error);
    res.status(500).json({
      error: "AI Analysis failed",
      message: error.message,
      cefrEstimate: req.body.cefrLevel || "B1",
      grammarScore: 70,
      overallFeedback: "The server encountered a temporary issue, but your writing shows great effort! Keep practicing your German grammar structures.",
      corrections: [],
      vocabularyUpgrades: [],
    });
  }
});


// ────────────────────────────────────────────────────────────────
// Smart Preset Fallback Responses (Offline/No-API-Key Compatibility)
// ────────────────────────────────────────────────────────────────

function getLocalScenarioResponse(messages: any[], scenario: string, cefrLevel: string) {
  const userMessages = messages.filter((m) => m.role === "user");
  const turnCount = userMessages.length;
  const lastInput = turnCount > 0 ? userMessages[userMessages.length - 1].content.toLowerCase() : "";

  // Set up mock responses based on scenarios
  if (scenario === "Beim Bäcker" || scenario === "At the Bakery") {
    if (turnCount === 1) {
      // User just greeted
      let correctTip = null;
      if (lastInput.includes("brot") && !lastInput.includes("ein ") && !lastInput.includes("einen ")) {
        correctTip = "Tip: When ordering 'Brot' (neuter), write 'ein Brot' (Akkusativ neuter).";
      }
      return {
        replyDe: "Guten Tag! Willkommen bei der Bäckerei Linkswelle. Was darf es heute für Sie sein? Wir haben frische Brötchen, süße Croissants und leckeres Sauerteigbrot.",
        replyEn: "Good day! Welcome to Bäckerei Linkswelle. What would you like today? We have fresh rolls, sweet croissants, and delicious sourdough bread.",
        correction: correctTip,
      };
    } else if (turnCount === 2) {
      let correctTip = null;
      if (lastInput.includes("wieviel costet") || lastInput.includes("wieviel kostet")) {
        // user asks for price
      } else if (!lastInput.includes("bitte")) {
        correctTip = "Culture Tip: In Germany, adding 'bitte' (please) is standard polite practice when ordering.";
      }
      return {
        replyDe: "Sehr gerne! Das macht dann insgesamt 4,50 Euro. Möchten Sie bar oder mit Karte zahlen?",
        replyEn: "With pleasure! That makes 4.50 Euros in total. Would you like to pay with cash or card?",
        correction: correctTip,
      };
    } else {
      return {
        replyDe: "Vielen Dank für Ihren Einkauf! Ich wünsche Ihnen noch einen wunderschönen Tag und guten Appetit mit den leckeren Sachen!",
        replyEn: "Thank you for your purchase! I wish you a wonderful day and bon appétit with the delicious treats!",
        correction: null,
      };
    }
  }

  if (scenario === "Im Taxi" || scenario === "In the Taxi") {
    if (turnCount === 1) {
      return {
        replyDe: "Hallo! Wo soll es denn hingehen? Ich fahre Sie gerne überall hin in Berlin.",
        replyEn: "Hello! Where should we go? I'll gladly drive you anywhere in Berlin.",
        correction: lastInput.includes("hauptgarten") ? "Correction: The central station is called 'Hauptbahnhof', not 'Hauptgarten'." : null,
      };
    } else if (turnCount === 2) {
      return {
        replyDe: "Verstanden, wir fahren zum Hauptbahnhof. Möchten Sie die Autobahn nehmen oder den direkten Weg durch die Stadt?",
        replyEn: "Understood, we are going to the Central Station. Would you like to take the highway or the direct route through the city?",
        correction: null,
      };
    } else {
      return {
        replyDe: "Wir sind da! Das macht 18,70 Euro. Brauchen Sie eine Quittung für Ihre Reise?",
        replyEn: "We have arrived! That makes 18.70 Euros. Do you need a receipt for your trip?",
        correction: null,
      };
    }
  }

  if (scenario === "Beim Arzt" || scenario === "At the Doctor") {
    if (turnCount === 1) {
      return {
        replyDe: "Guten Tag. Was führt Sie heute zu mir? Wo haben Sie Schmerzen oder Beschwerden?",
        replyEn: "Good day. What brings you to me today? Where do you have pain or symptoms?",
        correction: lastInput.includes("ich habe kopfschmerz") && !lastInput.includes("kopfschmerzen")
          ? "Grammar Tip: Plural headache is 'Kopfschmerzen'. Say 'Ich habe Kopfschmerzen'."
          : null,
      };
    } else if (turnCount === 2) {
      return {
        replyDe: "Verstehe. Husten Sie auch oder haben Sie Fieber? Ich werde jetzt kurz Ihren Puls und Ihren Hals untersuchen.",
        replyEn: "I see. Do you also cough or have a fever? I am going to examine your pulse and throat now.",
        correction: null,
      };
    } else {
      return {
        replyDe: "Ich schreibe Ihnen ein Rezept für Tabletten gegen die Schmerzen auf. Ruhen Sie sich drei Tage gut aus und trinken Sie viel Tee.",
        replyEn: "I will write you a prescription for tablets against the pain. Rest well for three days and drink plenty of tea.",
        correction: null,
      };
    }
  }

  // Fallback for custom or general scenarios
  return {
    replyDe: "Das klingt sehr interessant! Erzähl mir bitte mehr darüber auf Deutsch, damit wir üben können.",
    replyEn: "That sounds very interesting! Please tell me more about it in German so we can practice.",
    correction: lastInput.length < 5 ? "Tip: Try writing full sentences (Subject + Verb + Object) to maximize learning!" : null,
  };
}

function getLocalAnalysisResponse(text: string, cefrLevel: string) {
  // Perform neat rule checks of German writing
  const corrections = [];
  const words = text.split(/\s+/);
  const capitalErrors = [];

  // German rule: Nouns should be capitalized.
  // We can check if typical nouns in lower case are present
  const commonNounsLower = ["brot", "wasser", "kaffee", "arzt", "taxi", "bäcker", "bahnhof", "freund", "schule", "haus", "arbeit"];
  for (const w of words) {
    const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
    if (commonNounsLower.includes(cleanWord.toLowerCase()) && cleanWord[0] !== cleanWord[0].toUpperCase() && cleanWord.length > 0) {
      capitalErrors.push(cleanWord);
    }
  }

  if (capitalErrors.length > 0) {
    corrections.push({
      original: capitalErrors[0],
      corrected: capitalErrors[0].charAt(0).toUpperCase() + capitalErrors[0].slice(1),
      explanation: `German Spelling: In German, all nouns MUST be capitalized (e.g. '${capitalErrors[0].toUpperCase()}' is a noun and should start with an upper-case letter).`,
    });
  }

  // Search for "ich habe" case errors
  if (text.toLowerCase().includes("ich habe ein hunger")) {
    corrections.push({
      original: "ich habe ein hunger",
      corrected: "ich habe Hunger",
      explanation: "Idomatic error: In German, you don't say 'I have a hunger', rather simply 'Ich habe Hunger' or 'Ich bin hungrig'.",
    });
  }

  // Let's check for standard word placement
  if (text.toLowerCase().includes("weil ich bin")) {
    corrections.push({
      original: "weil ich bin",
      corrected: "weil ich ... bin",
      explanation: "German Word Order: Subordinating conjunctions like 'weil' (because) push the conjugated verb (here 'bin') to the absolute end of the clause.",
    });
  }

  // If no grammar error found, insert a default one to make it interactive and demonstrative
  if (corrections.length === 0) {
    corrections.push({
      original: "dem Mann helfen",
      corrected: "dem Mann helfen",
      explanation: "Flawless grammar! Keep in mind 'helfen' always triggers the Dativ case for its object (helfen + Dativ).",
    });
  }

  return {
    cefrEstimate: cefrLevel || "A2",
    grammarScore: corrections.length > 2 ? 80 : 92,
    overallFeedback: "Excellent attempt! You display a secure grasp of regular verb conjugations and conversational syntax. Keep focused on capitalization rules for all German nouns which is key for pristine writing.",
    corrections,
    vocabularyUpgrades: [
      {
        original: text.toLowerCase().includes("gut") ? "gut" : "machen",
        upgrade: text.toLowerCase().includes("gut") ? "hervorragend" : "erledigen",
        details: text.toLowerCase().includes("gut")
          ? "Use 'hervorragend' (excellent/superb) to elevate your adjectives and express high quality in B1/B2 tasks."
          : "Use 'erledigen' (to settle/complete/discharge duties) as a far more elegant verb instead of the general helper 'machen'.",
      },
    ],
  };
}

// ────────────────────────────────────────────────────────────────
// Vite setup and launch
// ────────────────────────────────────────────────────────────────
async function startServer() {
  // Vite developer mode middleware configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite's dev server middleware
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static serving configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
