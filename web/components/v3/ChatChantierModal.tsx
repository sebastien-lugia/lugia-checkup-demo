"use client";

/**
 * V3-charte A.2 v2 (2026-05-22) — Chat assistant 4 phases structurées.
 *
 * Mécanique inspirée du wireframe questionnaire-cabinet-v6 :
 *  - Tour 1 : question ouverte + 3 suggestions cliquables
 *  - Tours 2-3 : reformulation + creusement + 3 suggestions
 *  - Tour 4 : récap + carte plan d'action + 3 suggestions
 *  - Tour 5 : clôture + bascule UI "Conversation clôturée" (END_CONVERSATION)
 *
 * Init auto : à l'ouverture, envoi automatique du premier message user
 * ("Je veux creuser : <chantier>") si l'historique est vide.
 */

import { useEffect, useRef, useState } from "react";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import {
  getChatHistory,
  postChatMessage,
  type ChatMessageItem,
  type ChatPlanStep,
} from "@/lib/api";

const TAG_LABELS: Record<ChatPlanStep["tag"], string> = {
  quick: "Action rapide",
  medium: "Projet court",
  invest: "Investissement",
};

export function ChatChantierModal({
  theme = "night",
  interviewId,
  moduleId,
  moduleLabel,
  onClose,
}: {
  theme?: V3Theme;
  interviewId: number;
  moduleId: string;
  moduleLabel: string;
  onClose: () => void;
}) {
  const palette = paletteFor(theme);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [maxUserMessages, setMaxUserMessages] = useState(20);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initRef = useRef(false);

  // Bootstrap : charger l'historique puis auto-envoyer le 1er message si vide
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const h = await getChatHistory(interviewId, moduleId);
        if (cancelled) return;
        setMessages(h.messages);
        setUserMessageCount(h.user_message_count);
        setMaxUserMessages(h.max_user_messages);
        // Si conversation vide, on déclenche le tour 1 par envoi auto
        if (h.messages.length === 0 && !initRef.current) {
          initRef.current = true;
          void sendInitial();
        }
      } catch {
        if (!cancelled) setErrorMsg("Impossible de charger l'historique. Vous pouvez tout de même envoyer un message.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, moduleId]);

  // Auto-scroll en bas à chaque changement
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length, isSending]);

  // Focus input quand pas en cours d'init
  useEffect(() => {
    if (textareaRef.current && !isLoading && !isSending) textareaRef.current.focus();
  }, [isLoading, isSending]);

  // Escape pour fermer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function sendInitial() {
    const initialUserMessage = `Je veux creuser le chantier : ${moduleLabel}`;
    setIsSending(true);
    setErrorMsg(null);
    setMessages((m) => [...m, { role: "user", text: initialUserMessage }]);
    try {
      const res = await postChatMessage(interviewId, moduleId, initialUserMessage);
      setMessages((m) => [...m, {
        role: "assistant",
        text: res.text,
        suggestions: res.suggestions,
        plan: res.plan,
        ended: res.ended,
      }]);
      setUserMessageCount(res.user_message_count);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErrorMsg(`Impossible de démarrer la conversation. ${message}`);
    } finally {
      setIsSending(false);
    }
  }

  async function handleSend(messageText?: string) {
    const msg = (messageText ?? draft).trim();
    if (!msg || isSending || userMessageCount >= maxUserMessages || conversationEnded) return;

    setIsSending(true);
    setErrorMsg(null);
    if (!messageText) setDraft("");

    // Optimistic UI
    setMessages((m) => [...m, { role: "user", text: msg }]);

    try {
      const res = await postChatMessage(interviewId, moduleId, msg);
      setMessages((m) => [...m, {
        role: "assistant",
        text: res.text,
        suggestions: res.suggestions,
        plan: res.plan,
        ended: res.ended,
      }]);
      setUserMessageCount(res.user_message_count);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      if (!messageText) setDraft(msg);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      if (message.includes("429")) {
        setErrorMsg("Vous avez atteint la limite de 20 questions. Pour aller plus loin, contactez Sébastien via Calendly.");
      } else {
        setErrorMsg("L'assistant n'a pas pu répondre. Réessayez dans un instant.");
      }
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const lastMessage = messages[messages.length - 1];
  const lastIsAssistant = lastMessage?.role === "assistant";
  const conversationEnded = !!lastMessage && lastMessage.role === "assistant" && lastMessage.ended;
  const remaining = Math.max(0, maxUserMessages - userMessageCount);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500,
        background: palette.paper,
        color: palette.navy,
        display: "flex",
        flexDirection: "column",
        animation: "v3FadeSlide 250ms ease-out both",
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`Discussion avec l'assistant Lugia — ${moduleLabel}`}
    >
      {/* Header */}
      <div
        className="v3-chat-modal-header"
        style={{
          padding: "18px 28px",
          borderBottom: `1px solid ${palette.line}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: palette.navy400,
              margin: "0 0 4px",
              fontStyle: "normal",
            }}
          >
            Discussion avec l&apos;assistant Lugia · {userMessageCount} / {maxUserMessages}
          </p>
          <h2
            style={{
              fontFamily: fonts.serif,
              fontSize: 20,
              fontWeight: 400,
              color: palette.navy,
              margin: 0,
              fontStyle: "normal",
            }}
          >
            {moduleLabel}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la discussion"
          style={{
            background: "transparent",
            border: `1px solid ${palette.line}`,
            padding: "8px 14px",
            cursor: "pointer",
            fontFamily: fonts.mono,
            fontSize: 11,
            color: palette.navy400,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "border-color 180ms ease-out, color 180ms ease-out",
            fontStyle: "normal",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = palette.navy; e.currentTarget.style.color = palette.navy; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.line; e.currentTarget.style.color = palette.navy400; }}
        >
          Fermer  esc
        </button>
      </div>

      {/* Liste messages */}
      <div ref={listRef} className="v3-chat-modal-list" style={{ flex: 1, overflowY: "auto", padding: "28px 28px 18px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {isLoading && (
            <p style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.08em", color: palette.navy400, opacity: 0.6, margin: 0, fontStyle: "normal" }}>
              Chargement…
            </p>
          )}
          {!isLoading && messages.length === 0 && !isSending && (
            <p style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.08em", color: palette.navy400, opacity: 0.6, margin: 0, fontStyle: "normal" }}>
              Préparation de la conversation…
            </p>
          )}
          {messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            const showSuggestions = isLast && m.role === "assistant" && !conversationEnded && !isSending && (m.suggestions?.length ?? 0) > 0;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <MessageBubble message={m} theme={theme} />
                {m.plan && m.plan.length > 0 && <PlanCard plan={m.plan} theme={theme} />}
                {showSuggestions && m.suggestions && (
                  <SuggestionList
                    suggestions={m.suggestions}
                    theme={theme}
                    onPick={(s) => handleSend(s)}
                    disabled={isSending}
                  />
                )}
              </div>
            );
          })}
          {isSending && lastIsAssistant === false && (
            <MessageBubble message={{ role: "assistant", text: "…" }} theme={theme} pulsing />
          )}
          {isSending && (lastIsAssistant === true || messages.length === 0) && (
            // Cas du tout premier tour ou suite à un envoi : bulle assistant pulsante
            <MessageBubble message={{ role: "assistant", text: "…" }} theme={theme} pulsing />
          )}
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: "10px 28px",
            background: palette.signalWarn.surface,
            borderTop: `2px solid ${palette.signalWarn.default}`,
            color: palette.signalWarn.default,
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.5,
            fontStyle: "normal",
            flexShrink: 0,
          }}
        >
          {errorMsg}
        </div>
      )}

      {conversationEnded ? (
        <div
          style={{
            padding: "16px 28px",
            borderTop: `1px solid ${palette.line}`,
            background: theme === "day" ? palette.ivoryLight : palette.ivory,
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: palette.argent }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.navy, letterSpacing: "0.08em", textTransform: "uppercase", fontStyle: "normal" }}>
                Conversation clôturée
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a
                href="https://calendly.com/sebastien-lugia/30min"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: "transparent",
                  color: palette.navy,
                  border: `1px solid ${palette.lineStrong}`,
                  padding: "10px 18px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                  transition: "border-color 180ms ease-out",
                  fontStyle: "normal",
                }}
              >
                Prendre RDV avec Sébastien
              </a>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: palette.navy,
                  color: palette.paper,
                  border: "none",
                  padding: "10px 18px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "opacity 200ms ease-out",
                  fontStyle: "normal",
                }}
              >
                Retour au chantier →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="v3-chat-modal-footer" style={{ borderTop: `1px solid ${palette.line}`, padding: "16px 28px 18px", flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                background: theme === "day" ? palette.ivoryLight : palette.ivory,
                borderTop: `1px solid ${palette.line}`,
                borderRight: `1px solid ${palette.line}`,
                borderBottom: `1px solid ${palette.line}`,
                borderLeft: `1px solid ${palette.line}`,
                padding: "10px 12px",
              }}
            >
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={remaining === 0 ? "Limite de 20 questions atteinte" : "Répondez librement, ou choisissez une suggestion ci-dessus…"}
                disabled={isSending || isLoading || remaining === 0}
                rows={2}
                maxLength={2000}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontFamily: fonts.sans,
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: palette.navy,
                  fontStyle: "normal",
                  minHeight: 44,
                  maxHeight: 200,
                }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!draft.trim() || isSending || isLoading || remaining === 0}
                style={{
                  background: palette.navy,
                  color: palette.paper,
                  border: "none",
                  padding: "10px 18px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: (!draft.trim() || isSending || isLoading || remaining === 0) ? "not-allowed" : "pointer",
                  opacity: (!draft.trim() || isSending || isLoading || remaining === 0) ? 0.4 : 1,
                  transition: "opacity 200ms ease-out",
                  fontStyle: "normal",
                  flexShrink: 0,
                  alignSelf: "stretch",
                }}
              >
                Envoyer
              </button>
            </div>
            <p style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.06em", color: palette.navy400, opacity: 0.7, margin: "8px 0 0", fontStyle: "normal" }}>
              {remaining > 0
                ? `${remaining} question${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}`
                : "Pour aller plus loin, prenez RDV avec Sébastien"}.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes v3FadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function MessageBubble({
  message,
  theme,
  pulsing = false,
}: {
  message: { role: "user" | "assistant"; text: string };
  theme: V3Theme;
  pulsing?: boolean;
}) {
  const palette = paletteFor(theme);
  const isUser = message.role === "user";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: 4 }}>
      <span style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: palette.navy400, opacity: 0.7, fontStyle: "normal" }}>
        {isUser ? "Vous" : "Assistant Lugia"}
      </span>
      <div
        style={{
          maxWidth: "85%",
          padding: "12px 16px",
          background: isUser
            ? `color-mix(in srgb, ${palette.navy} 8%, transparent)`
            : (theme === "day" ? palette.ivoryLight : palette.ivory),
          borderTop: `1px solid ${palette.line}`,
          borderRight: `1px solid ${palette.line}`,
          borderBottom: `1px solid ${palette.line}`,
          borderLeft: isUser ? `1px solid ${palette.line}` : `2px solid ${palette.argent}`,
          fontFamily: fonts.serif,
          fontSize: 15,
          lineHeight: 1.6,
          color: palette.navy,
          fontStyle: "normal",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          animation: pulsing ? "v3Pulse 1.4s ease-in-out infinite" : undefined,
          opacity: pulsing ? 0.5 : 1,
        }}
      >
        {message.text}
      </div>
      <style jsx>{`
        @keyframes v3Pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

function SuggestionList({
  suggestions,
  theme,
  onPick,
  disabled,
}: {
  suggestions: string[];
  theme: V3Theme;
  onPick: (s: string) => void;
  disabled: boolean;
}) {
  const palette = paletteFor(theme);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: "85%" }}>
      {suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick(s)}
          disabled={disabled}
          style={{
            padding: "10px 14px",
            background: "transparent",
            borderTop: `1px solid ${palette.line}`,
            borderRight: `1px solid ${palette.line}`,
            borderBottom: `1px solid ${palette.line}`,
            borderLeft: `1px solid ${palette.line}`,
            color: palette.navy600,
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 1.5,
            textAlign: "left",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "border-color 180ms ease-out, color 180ms ease-out",
            opacity: disabled ? 0.4 : 1,
            fontStyle: "normal",
          }}
          onMouseEnter={(e) => {
            if (disabled) return;
            e.currentTarget.style.borderTopColor = palette.navy400;
            e.currentTarget.style.borderRightColor = palette.navy400;
            e.currentTarget.style.borderBottomColor = palette.navy400;
            e.currentTarget.style.borderLeftColor = palette.navy400;
            e.currentTarget.style.color = palette.navy;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderTopColor = palette.line;
            e.currentTarget.style.borderRightColor = palette.line;
            e.currentTarget.style.borderBottomColor = palette.line;
            e.currentTarget.style.borderLeftColor = palette.line;
            e.currentTarget.style.color = palette.navy600;
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

function PlanCard({ plan, theme }: { plan: ChatPlanStep[]; theme: V3Theme }) {
  const palette = paletteFor(theme);
  return (
    <div
      style={{
        maxWidth: "92%",
        background: theme === "day" ? palette.ivoryLight : palette.ivory,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
        borderBottom: `1px solid ${palette.line}`,
        borderLeft: `2px solid ${palette.argent}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: `1px solid ${palette.line}`,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.argentDeep,
          fontStyle: "normal",
        }}
      >
        Plan d&apos;action personnalisé
      </div>
      {plan.map((step, i) => (
        <div
          key={i}
          style={{
            padding: "14px 16px",
            display: "flex",
            gap: 14,
            borderBottom: i < plan.length - 1 ? `1px solid ${palette.line}` : "none",
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              fontWeight: 600,
              color: palette.navy400,
              flexShrink: 0,
              minWidth: 22,
              paddingTop: 2,
            }}
          >
            {step.num}
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: 15,
                fontWeight: 500,
                color: palette.navy,
                margin: "0 0 4px",
                fontStyle: "normal",
              }}
            >
              {step.title}
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 1.55,
                color: palette.navy600,
                margin: 0,
                fontStyle: "normal",
              }}
            >
              {step.body}
            </p>
            <span
              style={{
                display: "inline-block",
                marginTop: 8,
                padding: "2px 10px",
                fontFamily: fonts.mono,
                fontSize: 9,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: palette.signalWarn.surface,
                color: palette.signalWarn.default,
                border: `1px solid ${palette.signalWarn.border}`,
                fontStyle: "normal",
              }}
            >
              {TAG_LABELS[step.tag] || step.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
