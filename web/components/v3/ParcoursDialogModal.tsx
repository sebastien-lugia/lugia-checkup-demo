"use client";

/**
 * ParcoursDialogModal — dialogue IA de MODELISATION d'un parcours (pivot D-056,
 * chantier C.E).
 *
 * Réutilise le moteur de chat existant (mode « parcours » côté backend,
 * cf src/chat_assistant.py) ET les deux providers de ChatChantierModal :
 *  - Cloud (Claude) via POST /chat
 *  - Navigateur (web-llm / qwen) : system prompt par tour + inférence locale
 *    + persistance via /chat/persist.
 *
 * Déroulé : dialogue (4 moments) → à la fin (ended + graphe), écran SYNTHÈSE +
 * VALIDATION → si le médecin valide, on affiche les 3 vues (ParcoursViews) sur
 * le graphe qu'il a reconnu comme le sien.
 *
 * Spec : resources/methode/lugia_modelisations_graphiques_spec.md §11-12.
 */

import { useEffect, useRef, useState } from "react";

import { fonts, paletteFor } from "@/lib/v3/tokens";
import {
  getChatHistory,
  postChatMessage,
  resetChatConversation,
  downloadParcoursPdf,
  getChatSystemPrompt,
  persistChatExchange,
  type ChatMessageItem,
  type ChatProvider,
} from "@/lib/api";
import {
  getWebLLMEngine,
  generateWithWebLLM,
  parseAssistantReply,
  isWebLLMSupported,
  getLoadedModelLabel,
  isGpuLostError,
  reloadWithFallback,
  type WebLLMEngineLike,
  type WebLLMProgress,
} from "@/lib/webllm";
import type { GrapheWSF } from "@/lib/wsf/types";
import { ParcoursViews } from "@/components/v3/ParcoursViews";

type Phase = "dialogue" | "validation" | "vues";

const PROVIDER_LS_KEY = "lugia-chat-provider";
const CHAT_LOCAL_DISABLED = process.env.NEXT_PUBLIC_CHAT_LOCAL_ENABLED === "0";

type InferResult = {
  text: string;
  suggestions?: string[] | null;
  ended: boolean;
  mermaid_graph?: Record<string, unknown> | null;
  user_message_count: number;
  remaining: number;
};

export function ParcoursDialogModal({
  interviewId,
  moduleId,
  parcoursLabel,
  onClose,
  onValidated,
}: {
  interviewId: number;
  moduleId: string;
  parcoursLabel: string;
  onClose: () => void;
  onValidated?: (graph: GrapheWSF) => void;
}) {
  const palette = paletteFor("day");
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("dialogue");
  const [graph, setGraph] = useState<GrapheWSF | null>(null);
  const initRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Provider cloud / navigateur ──
  const [provider, setProvider] = useState<ChatProvider>(() => {
    if (typeof window === "undefined") return "anthropic";
    try {
      const saved = window.localStorage.getItem(PROVIDER_LS_KEY);
      if (saved === "webllm" || saved === "ollama") {
        return isWebLLMSupported() && !CHAT_LOCAL_DISABLED ? "webllm" : "anthropic";
      }
    } catch {
      /* ignore */
    }
    return "anthropic";
  });
  const providerRef = useRef(provider);
  useEffect(() => {
    providerRef.current = provider;
    try {
      window.localStorage.setItem(PROVIDER_LS_KEY, provider);
    } catch {
      /* ignore */
    }
  }, [provider]);

  const [webllmStatus, setWebllmStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [webllmProgress, setWebllmProgress] = useState<WebLLMProgress | null>(null);
  const [webllmModelLabel, setWebllmModelLabel] = useState<string | null>(null);
  const webllmEngineRef = useRef<WebLLMEngineLike | null>(null);
  const localSupported = isWebLLMSupported() && !CHAT_LOCAL_DISABLED;

  // Chargement du runtime web-llm quand on bascule en mode navigateur.
  useEffect(() => {
    if (provider !== "webllm") return;
    if (webllmStatus === "ready" || webllmStatus === "loading") return;
    let cancelled = false;
    (async () => {
      setWebllmStatus("loading");
      setError(null);
      try {
        const engine = await getWebLLMEngine((p) => {
          if (!cancelled) setWebllmProgress(p);
        });
        if (cancelled) return;
        webllmEngineRef.current = engine;
        setWebllmModelLabel(getLoadedModelLabel());
        setWebllmStatus("ready");
      } catch {
        if (!cancelled) {
          setWebllmStatus("error");
          setError("Impossible de charger le modèle dans le navigateur. Basculez sur le mode Cloud.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [provider, webllmStatus]);

  // Chargement initial de l'historique.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await getChatHistory(interviewId, moduleId);
        if (cancelled) return;
        setMessages(h.messages);
        setRemaining(h.remaining);
        setUserMessageCount(h.user_message_count);
        const last = h.messages[h.messages.length - 1];
        if (last?.ended && last.mermaid_graph) {
          setGraph(last.mermaid_graph as unknown as GrapheWSF);
          setPhase("validation");
        }
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setError("Impossible de charger le dialogue. Vérifiez que vous êtes connecté.");
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, moduleId]);

  // Amorce du tour 1 (couvre cloud + attente du runtime navigateur).
  useEffect(() => {
    if (isLoading || initRef.current || isSending) return;
    if (messages.length > 0) return;
    if (provider === "webllm" && webllmStatus !== "ready") return;
    initRef.current = true;
    void sendTurn(`Je veux modéliser : ${parcoursLabel}`, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, webllmStatus, isLoading, isSending, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  /** Exécute un tour selon le provider courant (miroir de ChatChantierModal). */
  async function doInference(
    userMessage: string,
    historyOverride: ChatMessageItem[] | null = null,
    turnOverride: number | null = null,
  ): Promise<InferResult> {
    const p = providerRef.current;
    const effectiveMessages = historyOverride ?? messages;
    const effectiveCount = historyOverride
      ? effectiveMessages.filter((m) => m.role === "user").length
      : userMessageCount;

    if (p === "webllm") {
      if (!webllmEngineRef.current) {
        throw new Error("Le modèle local n'est pas encore prêt. Patientez quelques secondes.");
      }
      const currentTurn = turnOverride ?? effectiveCount + 1;
      const fresh = await getChatSystemPrompt(interviewId, moduleId, currentTurn);
      const histForLlm = effectiveMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));
      let raw: string;
      try {
        raw = await generateWithWebLLM(webllmEngineRef.current, fresh.system_prompt, histForLlm, userMessage);
      } catch (genErr) {
        if (!isGpuLostError(genErr)) throw genErr;
        setWebllmProgress({ progress: 0, text: "Bascule sur le modèle léger (3B)…" });
        const fallbackEngine = await reloadWithFallback((p2) => setWebllmProgress(p2));
        webllmEngineRef.current = fallbackEngine;
        setWebllmModelLabel(getLoadedModelLabel());
        raw = await generateWithWebLLM(fallbackEngine, fresh.system_prompt, histForLlm, userMessage);
      }
      const parsed = parseAssistantReply(raw);
      const persistRes = await persistChatExchange(interviewId, moduleId, {
        user_message: userMessage,
        assistant_text: parsed.text,
        suggestions: parsed.suggestions,
        ended: parsed.ended,
        mermaid_graph: parsed.mermaid_graph,
        provider: "webllm",
      });
      return {
        text: parsed.text,
        suggestions: parsed.suggestions,
        ended: parsed.ended,
        mermaid_graph: parsed.mermaid_graph,
        user_message_count: persistRes.user_message_count,
        remaining: persistRes.remaining,
      };
    }

    const res = await postChatMessage(interviewId, moduleId, userMessage, "anthropic");
    return {
      text: res.text,
      suggestions: res.suggestions,
      ended: res.ended,
      mermaid_graph: res.mermaid_graph,
      user_message_count: res.user_message_count,
      remaining: res.remaining,
    };
  }

  async function sendTurn(text: string, isInitial = false, historyOverride: ChatMessageItem[] | null = null) {
    const message = text.trim();
    if (!message || isSending) return;
    setIsSending(true);
    setError(null);
    if (!isInitial) setMessages((prev) => [...prev, { role: "user", text: message }]);
    setDraft("");
    try {
      const r = await doInference(message, isInitial ? historyOverride ?? [] : null, isInitial ? 1 : null);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: r.text, suggestions: r.suggestions, ended: r.ended, mermaid_graph: r.mermaid_graph },
      ]);
      setUserMessageCount(r.user_message_count);
      setRemaining(r.remaining);
      if (r.ended && r.mermaid_graph) {
        setGraph(r.mermaid_graph as unknown as GrapheWSF);
        setPhase("validation");
      }
    } catch (e) {
      if (!isInitial) setMessages((prev) => prev.slice(0, -1));
      const msg = e instanceof Error ? e.message : "Erreur inconnue";
      if (msg.includes("503")) {
        const other = providerRef.current === "webllm" ? "Cloud" : "Navigateur";
        setError(`Ce moteur n'est pas joignable. Basculez sur « ${other} » en haut, puis réessayez.`);
      } else {
        setError(`L'assistant n'a pas pu répondre. (${msg})`);
      }
    } finally {
      setIsSending(false);
    }
  }

  async function handleRestart() {
    if (!window.confirm("Reprendre le dialogue depuis le début ? La modélisation en cours sera effacée.")) return;
    try {
      await resetChatConversation(interviewId, moduleId);
    } catch {
      /* best effort */
    }
    setMessages([]);
    setUserMessageCount(0);
    setGraph(null);
    setPhase("dialogue");
    initRef.current = true;
    void sendTurn(`Je veux modéliser : ${parcoursLabel}`, true, []);
  }

  function handleProviderChange(next: ChatProvider) {
    setProvider(next);
    if (messages.length === 0) initRef.current = false;
  }

  const eyebrow: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: palette.navy400,
    fontStyle: "normal",
  };
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, background: "rgba(26,35,51,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(860px, 100%)", maxHeight: "90vh", display: "flex", flexDirection: "column", background: palette.ivoryLight, border: `1px solid ${palette.lineStrong}` }}
      >
        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 20px", borderBottom: `1px solid ${palette.line}`, gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={eyebrow}>{phase === "vues" ? "Parcours modélisé" : "Modéliser un parcours avec Lugia"}</div>
            <div style={{ fontFamily: fonts.serif, fontSize: 19, color: palette.navy, fontStyle: "normal", marginTop: 2 }}>{parcoursLabel}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {phase === "dialogue" && localSupported && (
              <div role="tablist" aria-label="Moteur IA" style={{ display: "flex", border: `1px solid ${palette.line}` }}>
                {(["anthropic", "webllm"] as ChatProvider[]).map((pv) => {
                  const actif = provider === pv;
                  return (
                    <button
                      key={pv}
                      type="button"
                      onClick={() => handleProviderChange(pv)}
                      title={pv === "webllm" ? "L'IA tourne dans votre navigateur (privé)" : "IA cloud (qualité maximale)"}
                      style={{ fontFamily: fonts.sans, fontSize: 11, fontStyle: "normal", padding: "5px 10px", border: "none", cursor: "pointer", background: actif ? palette.navy : "transparent", color: actif ? palette.ivory : palette.navy600 }}
                    >
                      {pv === "webllm" ? "Navigateur" : "Cloud"}
                    </button>
                  );
                })}
              </div>
            )}
            <button type="button" onClick={onClose} aria-label="Fermer" style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: palette.navy400, lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Corps */}
        <div ref={scrollRef} style={{ overflowY: "auto", padding: "18px 20px", flex: 1 }}>
          {error && <div style={{ ...eyebrow, color: palette.signalWarn.default, marginBottom: 12 }}>{error}</div>}

          {provider === "webllm" && webllmStatus === "loading" && (
            <div style={{ ...eyebrow, marginBottom: 12, opacity: 0.8 }}>
              Chargement du modèle dans le navigateur… {webllmProgress ? `${Math.round((webllmProgress.progress || 0) * 100)}%` : ""}
            </div>
          )}

          {phase === "dialogue" && (
            <Dialogue messages={messages} isLoading={isLoading} isSending={isSending} palette={palette} onSuggestion={(s) => sendTurn(s)} />
          )}

          {phase === "validation" && (
            <Validation
              synthese={lastAssistant?.text ?? ""}
              palette={palette}
              onValidate={() => {
                if (graph) onValidated?.(graph);
                setPhase("vues");
              }}
              onRestart={handleRestart}
            />
          )}

          {phase === "vues" && graph && (
            <div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await downloadParcoursPdf(interviewId, moduleId);
                    } catch {
                      setError("Téléchargement du PDF indisponible pour le moment.");
                    }
                  }}
                  style={{ fontFamily: fonts.sans, fontSize: 12.5, fontStyle: "normal", padding: "7px 14px", border: `1px solid ${palette.argent}`, background: "transparent", color: palette.navy600, cursor: "pointer" }}
                >
                  Télécharger en PDF
                </button>
              </div>
              <ParcoursViews graph={graph} />
            </div>
          )}
        </div>

        {/* Saisie (dialogue seulement) */}
        {phase === "dialogue" && (
          <div style={{ borderTop: `1px solid ${palette.line}`, padding: "12px 20px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendTurn(draft);
                  }
                }}
                placeholder="Racontez ce qui se passe concrètement…"
                rows={2}
                disabled={isSending}
                style={{ flex: 1, resize: "none", fontFamily: fonts.sans, fontSize: 14, fontStyle: "normal", padding: "9px 11px", border: `1px solid ${palette.line}`, background: "white", color: palette.navy }}
              />
              <button
                type="button"
                onClick={() => void sendTurn(draft)}
                disabled={isSending || !draft.trim()}
                style={{ fontFamily: fonts.sans, fontSize: 13, fontStyle: "normal", padding: "0 18px", border: "none", cursor: isSending || !draft.trim() ? "not-allowed" : "pointer", background: isSending || !draft.trim() ? palette.argent : palette.navy, color: "white" }}
              >
                Envoyer
              </button>
            </div>
            {remaining !== null && <div style={{ ...eyebrow, marginTop: 8 }}>{remaining} échanges restants</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sous-vues ─────────────────────────────────────────────────────────── */

function Dialogue({
  messages,
  isLoading,
  isSending,
  palette,
  onSuggestion,
}: {
  messages: ChatMessageItem[];
  isLoading: boolean;
  isSending: boolean;
  palette: ReturnType<typeof paletteFor>;
  onSuggestion: (s: string) => void;
}) {
  if (isLoading) {
    return <div style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.navy400 }}>Chargement…</div>;
  }
  const last = messages[messages.length - 1];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {messages.map((m, i) => (
        <div
          key={i}
          style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%",
            padding: "10px 13px",
            fontFamily: fonts.sans,
            fontSize: 14,
            fontStyle: "normal",
            lineHeight: 1.5,
            background: m.role === "user" ? palette.navy : "white",
            color: m.role === "user" ? "white" : palette.navy,
            border: m.role === "user" ? "none" : `1px solid ${palette.line}`,
            whiteSpace: "pre-wrap",
          }}
        >
          {m.text}
        </div>
      ))}
      {isSending && (
        <div style={{ alignSelf: "flex-start", fontFamily: fonts.mono, fontSize: 11, color: palette.navy400, opacity: 0.7 }}>Lugia réfléchit…</div>
      )}
      {!isSending && last?.role === "assistant" && last.suggestions && last.suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {last.suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggestion(s)}
              style={{ fontFamily: fonts.sans, fontSize: 12.5, fontStyle: "normal", padding: "6px 12px", border: `1px solid ${palette.argent}`, background: "transparent", color: palette.navy600, cursor: "pointer", textAlign: "left" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Validation({
  synthese,
  palette,
  onValidate,
  onRestart,
}: {
  synthese: string;
  palette: ReturnType<typeof paletteFor>;
  onValidate: () => void;
  onRestart: () => void;
}) {
  return (
    <div>
      <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: palette.navy400, fontStyle: "normal", marginBottom: 10 }}>
        Synthèse — à valider ou corriger
      </div>
      <div style={{ fontFamily: fonts.sans, fontSize: 14.5, lineHeight: 1.6, color: palette.navy, fontStyle: "normal", whiteSpace: "pre-wrap", background: "white", border: `1px solid ${palette.line}`, padding: "14px 16px", marginBottom: 16 }}>
        {synthese || "Synthèse indisponible."}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={onValidate} style={{ fontFamily: fonts.sans, fontSize: 13.5, fontStyle: "normal", padding: "10px 18px", border: "none", background: palette.navy, color: "white", cursor: "pointer" }}>
          C&apos;est bien mon cabinet — voir les 3 vues
        </button>
        <button type="button" onClick={onRestart} style={{ fontFamily: fonts.sans, fontSize: 13.5, fontStyle: "normal", padding: "10px 18px", border: `1px solid ${palette.argent}`, background: "transparent", color: palette.navy600, cursor: "pointer" }}>
          Reprendre le dialogue
        </button>
      </div>
    </div>
  );
}

export default ParcoursDialogModal;
