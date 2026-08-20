import React, { useState, useEffect, useRef } from "react";
import { Settings, Word } from "../types";
import { speak } from "../utils/audio";
import { getApiUrl } from "../utils/api";

interface AiLabViewProps {
  settings: Settings;
  onAddPoints: (pts: number) => void;
  lang: "en" | "de";
}

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  correction?: string | null;
}

interface RewriteCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

interface VocabUpgrade {
  original: string;
  upgrade: string;
  details: string;
}

interface AnalysisResult {
  cefrEstimate: string;
  grammarScore: number;
  overallFeedback: string;
  corrections: RewriteCorrection[];
  vocabularyUpgrades: VocabUpgrade[];
}

const SCENARIOS = [
  {
    id: "bakery",
    titleEn: "At the Bakery",
    titleDe: "Beim Bäcker",
    icon: "🥖",
    descEn: "Order rolls, bread, pastries and pay in Euros.",
    descDe: "Bestelle Brötchen, Brot oder Kuchen und zahle.",
    initialMsgDe: "Hallo! Herzlich willkommen beim Bäcker. Was darf ich Ihnen heute frisches einpacken?",
    initialMsgEn: "Hello! Welcome to the bakery. What can I pack fresh for you today?",
    level: "A1/A2",
  },
  {
    id: "taxi",
    titleEn: "In the Taxi",
    titleDe: "Im Taxi",
    icon: "🚕",
    descEn: "Describe your destination, discuss the route and ask for a receipt.",
    descDe: "Nenne dein Ziel, bespreek den Weg und frage nach einer Quittung.",
    initialMsgDe: "Guten Tag! Wohin soll die Fahrt heute gehen?",
    initialMsgEn: "Good day! Where should the journey go today?",
    level: "A2/B1",
  },
  {
    id: "doctor",
    titleEn: "At the Doctor",
    titleDe: "Beim Arzt",
    icon: "🩺",
    descEn: "Explain your pain, describe symptoms and receive medical advice.",
    descDe: "Erkläre deine Schmerzen, beschreibe Symptome und erhalte Rat.",
    initialMsgDe: "Guten Tag. Nehmen Sie bitte Platz. Was fehlt Ihnen denn, wo tut es weh?",
    initialMsgEn: "Good day. Please take a seat. What is bothering you, where does it hurt?",
    level: "B1/B2",
  },
];

const PROMPTS = [
  {
    id: "apology",
    titleEn: "Apology Email to Landlord",
    titleDe: "Entschuldigungsmail an Vermieter",
    level: "B1",
    descEn: "Apologize for noise or a delayed rental payment polite and formal.",
    descDe: "Entschuldige dich höflich für Lärm oder verspätete Miete.",
    placeholder: "Sehr geehrter Herr Müller, ich schreibe Ihnen, weil...",
  },
  {
    id: "vacation",
    titleEn: "Diary Entry: Last Summer",
    titleDe: "Tagebucheintrag: Letzter Sommer",
    level: "A2",
    descEn: "Describe what you did on your vacation, the weather and where you stayed.",
    descDe: "Beschreibe deinen letzten Urlaub, das Wetter und deine Unterkunft.",
    placeholder: "Letzten Sommer bin ich nach Italien geflogen. Das Wetter war...",
  },
  {
    id: "job",
    titleEn: "Job Application Cover Letter",
    titleDe: "Bewerbungsanschreiben",
    level: "B2",
    descEn: "Explain why you are qualified for a new office job in Germany.",
    descDe: "Erkläre in formellem Deutsch, warum du für die Stelle geeignet bist.",
    placeholder: "Sehr geehrte Damen und Herren, mit großem Interesse...",
  },
];

export default function AiLabView({ settings, onAddPoints, lang }: AiLabViewProps) {
  const currentLang = settings.lang;
  const t = (en: string, de: string) => (currentLang === "de" ? de : en);

  const [activeSubTab, setActiveSubTab] = useState<"chat" | "grammar">("chat");

  // ── STATE FOR ROLEPLAY ──────────────────────────────────────
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingReply, setIsLoadingReply] = useState(false);
  const [showTransl, setShowTransl] = useState<Record<number, boolean>>({});
  const [isListening, setIsListening] = useState(false);
  const [chatCompleted, setChatCompleted] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Speech Recognition hook setup
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = "de-DE";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setUserInput((prev) => (prev ? prev + " " + transcript : transcript));
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition error:", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startScenario = (sc: typeof SCENARIOS[0]) => {
    setSelectedScenario(sc);
    setChatMessages([
      {
        role: "assistant",
        content: sc.initialMsgDe,
        translation: sc.initialMsgEn,
        correction: null,
      },
    ]);
    setChatCompleted(false);
    setUserInput("");
    setShowTransl({ 0: false });
    // Auto speak initial reply
    if (settings.ttsOn) {
      speak(sc.initialMsgDe, true);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenario || !userInput.trim() || isLoadingReply || chatCompleted) return;

    const userText = userInput.trim();
    setUserInput("");

    // 1. Append user's message immediately
    const updatedMessages = [...chatMessages, { role: "user", content: userText } as Message];
    setChatMessages(updatedMessages);
    setIsLoadingReply(true);

    // Auto-scroll inside chat panel
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 55);

    try {
      const response = await fetch(getApiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          scenario: selectedScenario.titleEn,
          cefrLevel: settings.cefrLevel || "B1",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with full-stack chatbot");
      }

      const resData = await response.json();

      // 2. Add assistant response with dynamic translation & correction
      const botResponse: Message = {
        role: "assistant",
        content: resData.replyDe || "Keine Antwort erhalten.",
        translation: resData.replyEn || "No reply translated.",
        correction: resData.correction || null,
      };

      setChatMessages((prev) => {
        const next = [...prev];
        // Apply correction check back retroactively to user's prompt in the records!
        if (next.length > 0 && next[next.length - 1].role === "user") {
          next[next.length - 1].correction = resData.correction;
        }
        return [...next, botResponse];
      });

      // Play sound synthesis of reply
      if (settings.ttsOn && resData.replyDe) {
        speak(resData.replyDe, true);
      }

      // If user reaches 3 dialog exchanges, award points and finish
      const userTurnCount = updatedMessages.filter((m) => m.role === "user").length;
      if (userTurnCount >= 3) {
        setChatCompleted(true);
        onAddPoints(25); // Award points
      }
    } catch (err) {
      console.error(err);
      // Fallback response inside matching system
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ach, mein Deutsch-Knoten klemmt gerade. Bitte versuche es noch einmal!",
          translation: "Oh, my German-knot is stuck right now. Please try again!",
          correction: null,
        },
      ]);
    } finally {
      setIsLoadingReply(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 55);
    }
  };

  // ── STATE FOR WRITING / GRAMMAR LAB ─────────────────────────
  const [customText, setCustomText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const selectPrompt = (pr: typeof PROMPTS[0]) => {
    setCustomText(pr.placeholder);
  };

  const handleAnalyzeText = async () => {
    if (!customText.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch(getApiUrl("/api/analyze"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: customText,
          cefrLevel: settings.cefrLevel || "B1",
        }),
      });

      if (!response.ok) {
        throw new Error("Linguistic analysis service offline.");
      }

      const reportData: AnalysisResult = await response.json();
      setAnalysisResult(reportData);

      // Reward points for studying essay writing
      const wordCount = customText.trim().split(/\s+/).length;
      if (wordCount >= 10) {
        onAddPoints(30); // Rich B1 grammar study points
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg bg-gray-50 min-h-screen dark:bg-slate-950 pb-28">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white p-6 shadow-sm dark:bg-slate-950 border-b border-gray-100 dark:border-slate-900 rounded-b-3xl">
        <div className="text-[10px] uppercase font-black text-amber-400 tracking-widest">
          ★ LINKSWELLE INSTITUT • {t("KI EXPERIMENT", "KI-LABOR")} ★
        </div>
        <h1 className="text-2xl font-black mt-1 tracking-tight flex items-center gap-2">
          🧪 {t("AI Conversation Lab", "KI-Gesprächslabor")}
        </h1>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {t(
            "Practice German speech roleplay in real scenarios and test grammar on custom compositions. Backed by real-time correction.",
            "Übe Konversationen in echten Situationen und teste deine Texte mit KI-gestützter Fehlerkorrektur."
          )}
        </p>

        {/* Sub Navigation Tabs */}
        <div className="mt-5 flex bg-slate-800 rounded-xl p-1 gap-1 text-xs font-bold dark:bg-slate-900">
          <button
            onClick={() => setActiveSubTab("chat")}
            className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition ${
              activeSubTab === "chat"
                ? "bg-indigo-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
            type="button"
          >
            💬 {t("Dialogue Roleplay", "Konversations-Simulator")}
          </button>
          <button
            onClick={() => setActiveSubTab("grammar")}
            className={`flex-1 text-center py-2 rounded-lg cursor-pointer transition ${
              activeSubTab === "grammar"
                ? "bg-indigo-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "text-slate-400 hover:text-white"
            }`}
            type="button"
          >
            ✍️ {t("Composition Inspector", "Text-Schreibstube")}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* ── SUBTAB 1: DIALOGUE ROLEPLAY ── */}
        {activeSubTab === "chat" && (
          <div>
            {!selectedScenario ? (
              <div className="space-y-4">
                <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase select-none mt-2">
                  {t("SELECT A GERMAN SCENARIO", "WÄHLE EIN SITUATIONS-SZENARIO")}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => startScenario(sc)}
                      className="group flex items-start gap-4 p-4 bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-gray-150/70 dark:border-slate-850 rounded-2xl shadow-xs text-left cursor-pointer transition"
                      type="button"
                    >
                      <div className="p-3 bg-indigo-50 dark:bg-slate-800 text-2xl rounded-xl">
                        {sc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-sm text-gray-800 dark:text-slate-100">
                            {t(sc.titleEn, sc.titleDe)}
                          </h4>
                          <span className="px-2 py-0.5 rounded-sm bg-indigo-50 text-[9px] font-bold text-indigo-600 dark:bg-slate-800 dark:text-emerald-400">
                            {sc.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-snug dark:text-slate-400">
                          {t(sc.descEn, sc.descDe)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Scenario tip notice */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300 mt-4 leading-relaxed">
                  💡 <strong>{t("Practice Speaking", "Sprechübung")}:</strong>{" "}
                  {t(
                    "You will receive 25 XP points as a graduation reward. Turn on your audio volume. The dialogue assistant reads replies with standard High-German vocalization.",
                    "Nach 3 Beitragsrunden erhältst du 25 XP Belohnungspunkte für den Abschluss. Der Partner liest die Antworten laut vor."
                  )}
                </div>
              </div>
            ) : (
              // Active Conversation sandbox
              <div className="bg-white rounded-2xl border border-gray-150/70 overflow-hidden dark:bg-slate-900 dark:border-slate-850 flex flex-col shadow-xs" style={{ minHeight: "380px" }}>
                {/* Back layout bar */}
                <div className="p-3 bg-gray-55 border-b border-gray-150/60 dark:bg-slate-850 dark:border-slate-800 flex justify-between items-center text-xs">
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="flex items-center gap-1 font-bold text-indigo-600 dark:text-emerald-400 cursor-pointer"
                  >
                    ← {t("Back to Scenarios", "Zurück zur Übersicht")}
                  </button>
                  <span className="font-extrabold text-gray-600 dark:text-slate-300">
                    {selectedScenario.icon} {t(selectedScenario.titleEn, selectedScenario.titleDe)}
                  </span>
                </div>

                {/* Messages pane */}
                <div className="flex-1 p-4 space-y-4 max-h-[360px] overflow-y-auto">
                  {chatMessages.map((msg, index) => {
                    const isAssistant = msg.role === "assistant";
                    const isTranslShowing = showTransl[index] || false;

                    return (
                      <div
                        key={index}
                        className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                      >
                        <div className="flex items-end gap-1.5 max-w-[85%]">
                          {isAssistant && (
                            <button
                              onClick={() => speak(msg.content, true)}
                              className="mb-1 p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs rounded-full cursor-pointer opacity-80"
                              title={t("Speak Loudly", "Laut vorlesen")}
                              type="button"
                            >
                              🔊
                            </button>
                          )}
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isAssistant
                                ? "bg-slate-100 text-gray-800 rounded-bl-none dark:bg-slate-800 dark:text-slate-100"
                                : "bg-indigo-600 text-white rounded-br-none dark:bg-emerald-600 dark:text-slate-950 font-medium"
                            }`}
                          >
                            <p>{msg.content}</p>

                            {/* Assistant message toggles */}
                            {isAssistant && msg.translation && (
                              <div className="mt-1.5 pt-1 border-t border-gray-200/50 dark:border-slate-700/50">
                                {isTranslShowing ? (
                                  <p className="text-[10px] text-gray-500 italic dark:text-slate-400">
                                    {msg.translation}
                                  </p>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setShowTransl((prev) => ({ ...prev, [index]: true }))
                                    }
                                    className="text-[9px] font-black text-indigo-600 hover:underline dark:text-emerald-400 cursor-pointer"
                                  >
                                    Translate (Übersetzen)
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive UI error analysis label (attached to User's speech input) */}
                        {!isAssistant && msg.correction && (
                          <div className="mt-1 mr-1 p-2 border-l-2 border-amber-400 bg-amber-50/50 text-[10px] text-amber-900 rounded-r-md max-w-[80%] dark:bg-amber-950/20 dark:text-amber-300">
                            <strong>⚠️ Correction:</strong> {msg.correction}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoadingReply && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 italic">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                      </div>
                      <span>{t("Partner typing...", "Partner schreibt...")}</span>
                    </div>
                  )}

                  {/* Completing Card congratulations panel */}
                  {chatCompleted && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex flex-col items-center text-center space-y-2 dark:bg-emerald-950/25 dark:border-emerald-850/50 dark:text-emerald-300 animate-fade-in">
                      <span className="text-3xl">🏆</span>
                      <h4 className="font-extrabold text-sm">{t("Dialogue Completed!", "Gespräch erfolgreich beendet!")}</h4>
                      <p className="text-xs">
                        {t(
                          "Fantastic! You have finished this conversational sandbox encounter and unlocked 25 XP points reward.",
                          "Hervorragend! Du hast die 3 Dialog-Beiträge absolviert und 25 XP erhalten."
                        )}
                      </p>
                      <button
                        onClick={() => setSelectedScenario(null)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        {t("Finish Scenario", "Übung abschließen")}
                      </button>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Fixed input text submission bar */}
                {!chatCompleted && (
                  <form
                    onSubmit={handleSendChatMessage}
                    className="p-3 border-t border-gray-150 bg-gray-50/50 flex gap-2 items-center dark:bg-slate-900 dark:border-slate-800"
                  >
                    {/* Speak Recording button */}
                    <button
                      onClick={handleToggleSpeak}
                      className={`p-2.5 rounded-full flex items-center justify-center cursor-pointer transition ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-slate-700"
                      }`}
                      title={
                        speechSupported
                          ? t("Speak German (Speech to Text)", "Deutsch sprechen")
                          : t("Speech input not supported", "Mikrofon nicht unterstützt")
                      }
                      disabled={!speechSupported || isLoadingReply}
                      type="button"
                    >
                      {isListening ? "⏹️" : "🎙️"}
                    </button>

                    <input
                      type="text"
                      className="flex-1 px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-emerald-500"
                      placeholder={
                        isListening
                          ? t("Listening... Speak German", "Höre zu... Sprich Deutsch...")
                          : t("Type your German reply...", "Antworte auf Deutsch...")
                      }
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isLoadingReply}
                    />

                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center cursor-pointer transition disabled:opacity-50 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                      disabled={!userInput.trim() || isLoadingReply}
                    >
                      ✈️
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SUBTAB 2: COMPOSITION INSPECTOR / GRAMMAR LAB ── */}
        {activeSubTab === "grammar" && (
          <div className="space-y-4">
            <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase select-none mt-2">
              {t("CHOOSE AN ESSAY PROMPT STUDY OR WRITE", "WÄHLE EINE SCHREIBAUFGABE")}
            </h3>

            {/* Essay prompts shortcuts */}
            <div className="grid grid-cols-1 select-none gap-2">
              {PROMPTS.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => selectPrompt(pr)}
                  className="flex items-center justify-between p-3 bg-white hover:bg-gray-50 border border-gray-150/70 rounded-xl text-left cursor-pointer transition dark:bg-slate-900 dark:border-slate-850 dark:hover:bg-slate-850"
                  type="button"
                >
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-gray-800 dark:text-slate-100">
                        {t(pr.titleEn, pr.titleDe)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-sm bg-violet-100 text-[8px] font-bold text-violet-700 dark:bg-slate-800 dark:text-violet-400">
                        {pr.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 dark:text-slate-400">
                      {t(pr.descEn, pr.descDe)}
                    </p>
                  </div>
                  <span className="text-xs text-indigo-600 font-extrabold dark:text-emerald-400">✏️</span>
                </button>
              ))}
            </div>

            {/* Main Texteditor */}
            <div className="bg-white rounded-2xl border border-gray-150/70 p-4 dark:bg-slate-900 dark:border-slate-850 shadow-xs relative">
              <label className="block text-[10px] font-black tracking-wider text-gray-400 uppercase">
                {t("SUBMIT YOUR GERMAN COMPOSITION", "DEIN DEUTSCHER TEXT")}
              </label>
              <textarea
                className="w-full h-36 p-3 mt-2 border border-gray-200 outline-none focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:focus:ring-emerald-500 resize-none leading-relaxed"
                placeholder={t(
                  "Write or paste German sentences here to assess case endings, syntax alignments, and vocabulary style levels...",
                  "Schreibe oder kopiere deinen deutschen Text hier rein, um Fälle, Satzbau und Grammatik prüfen zu lassen..."
                )}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={500}
                disabled={isAnalyzing}
              />
              <div className="text-[10px] text-gray-400 dark:text-slate-500 text-right mt-1 font-mono">
                {customText.length} / 500 {t("characters", "Zeichen")}
              </div>

              {/* Action trigger button */}
              <button
                onClick={handleAnalyzeText}
                className="w-full mt-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1 disabled:opacity-50 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-600"
                disabled={!customText.trim() || isAnalyzing}
                type="button"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-1.5 animate-pulse">
                    🟢 {t("Inspecting grammar case mappings...", "Linguistische Analyse läuft...")}
                  </span>
                ) : (
                  <>🧪 {t("Analyze Writing (Text prüfen)", "Sprachliche Korrektur prüfen")}</>
                )}
              </button>
            </div>

            {/* Analysis results presentation */}
            {analysisResult && (
              <div className="bg-white rounded-2xl border border-gray-150/70 p-4 space-y-4 dark:bg-slate-900 dark:border-slate-850 shadow-xs animate-fade-in">
                {/* Visual scorecard / gauges */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100 dark:border-slate-800">
                  <div className="p-3 bg-indigo-50/50 rounded-xl text-center dark:bg-slate-850">
                    <span className="text-[9px] font-extrabold uppercase text-indigo-600 tracking-wider dark:text-emerald-400">
                      {t("FLUENCY LEVEL", "SPRACHSTUFE")}
                    </span>
                    <div className="text-2xl font-black text-indigo-900 dark:text-white mt-1">
                      {analysisResult.cefrEstimate}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 rounded-xl text-center dark:bg-slate-850">
                    <span className="text-[9px] font-extrabold uppercase text-emerald-600 tracking-wider dark:text-emerald-400">
                      {t("GRAMMAR SCORE", "GRAMMATIK-NOTE")}
                    </span>
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {analysisResult.grammarScore}%
                    </div>
                  </div>
                </div>

                {/* Overall Feedback */}
                <div>
                  <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                    {t("OVERALL PROFESSOR FEEDBACK", "PROFESSOR_STANZ GUTACHAR")}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed mt-1 dark:text-slate-350 bg-gray-50 dark:bg-slate-950 p-3 rounded-xl border border-gray-100 dark:border-slate-850 italic">
                    "{analysisResult.overallFeedback}"
                  </p>
                </div>

                {/* Spell / Case corrections cards */}
                {analysisResult.corrections && analysisResult.corrections.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                      🛠️ {t("DETAILED REWRITE CORRECTIONS", "DEINE GRAMMATIK-KORREKTUREN")}
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.corrections.map((corr, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-gray-55/70 p-3 rounded-xl border border-gray-150/50 dark:bg-slate-850/60 dark:border-slate-800 flex flex-col gap-1.5"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 font-bold dark:bg-red-950/30 dark:text-red-400">
                              ❌ {corr.original}
                            </span>
                            <span className="text-gray-400">➔</span>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-950/30 dark:text-emerald-400">
                              ✅ {corr.corrected}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400">
                            <strong>{t("Rule", "Regel")}:</strong> {corr.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary upgrade recommendations */}
                {analysisResult.vocabularyUpgrades &&
                  analysisResult.vocabularyUpgrades.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                        🌟 {t("VOCABULARY AND STYLE UPGRADES", "AUSDRUCKS-VERBESSERUNGEN")}
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.vocabularyUpgrades.map((voc, vIdx) => (
                          <div
                            key={vIdx}
                            className="bg-violet-50/40 p-3 rounded-xl border border-violet-100/30 dark:bg-slate-850/40 dark:border-slate-800/55 flex flex-col gap-1"
                          >
                            <div className="text-xs font-extrabold flex items-center gap-1.5">
                              <span className="text-gray-400 italic line-through">
                                "{voc.original}"
                              </span>
                              <span className="text-gray-400">➔</span>
                              <span className="text-violet-600 dark:text-violet-400 font-black">
                                "{voc.upgrade}"
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed">
                              {voc.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Congratulations notice */}
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] rounded-xl dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-300">
                  🎉 {t("Writing evaluation complete! +30 XP awarded to today's goals progress.", "Text-Analyse erfolgreich! +30 XP wurden deinem Tagesziel gutgeschrieben.")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
