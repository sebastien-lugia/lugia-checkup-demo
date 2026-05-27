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
  resetChatConversation,
  getChatSystemPrompt,
  persistChatExchange,
  type ChatMessageItem,
  type ChatPlanStep,
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
import { MermaidDiagram } from "@/components/v3/MermaidDiagram";
import type { GrapheWSF } from "@/lib/wsf/types";

const CHAT_PROVIDER_LS_KEY = "lugia-chat-provider";
const PROVIDER_LABELS: Record<ChatProvider, string> = {
  anthropic: "Cloud (LLM)",
  ollama: "Local (SLM)",
  webllm: "Local (SLM)",
};

/**
 * D-040 — Toggle Cloud / WebLLM. Le toggle « Dans votre navigateur »
 * (provider="webllm") s'appuie sur @mlc-ai/web-llm qui charge qwen2.5:3b
 * via WebGPU dans le browser du médecin. Disponibilité = WebGPU dispo
 * (Chrome / Edge récent). La variable NEXT_PUBLIC_CHAT_LOCAL_ENABLED est
 * conservée comme override de debug si jamais on veut désactiver le mode
 * local côté prod sans toucher au code.
 */
const CHAT_LOCAL_DISABLED =
  process.env.NEXT_PUBLIC_CHAT_LOCAL_ENABLED === "0";

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
  const [maxUserMessages, setMaxUserMessages] = useState(10);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Toggle Cloud / Local — préférence persistée en localStorage. Défaut
  // "anthropic" pour ne pas casser l'expérience des testeurs qui n'ont
  // pas Ollama installé.
  const [provider, setProvider] = useState<ChatProvider>(() => {
    if (typeof window === "undefined") return "anthropic";
    try {
      const saved = window.localStorage.getItem(CHAT_PROVIDER_LS_KEY);
      // Migration silencieuse : l'ancien "ollama" pointait sur Ollama backend
      // (mort en prod). On bascule sur "webllm" qui est l'équivalent
      // navigateur — même intention « SLM local » côté médecin.
      if (saved === "ollama" || saved === "webllm") {
        return isWebLLMSupported() && !CHAT_LOCAL_DISABLED ? "webllm" : "anthropic";
      }
      if (saved === "anthropic") return "anthropic";
    } catch {
      /* localStorage indisponible — défaut anthropic */
    }
    return "anthropic";
  });

  // État WebLLM — chargement progressif du runtime quand le user passe en
  // mode "Dans votre navigateur" pour la première fois.
  const [webllmStatus, setWebllmStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [webllmProgress, setWebllmProgress] = useState<WebLLMProgress | null>(null);
  const [webllmSystemPrompt, setWebllmSystemPrompt] = useState<string | null>(null);
  const [webllmModelLabel, setWebllmModelLabel] = useState<string | null>(null);
  const webllmEngineRef = useRef<WebLLMEngineLike | null>(null);

  // Chargement automatique du runtime quand le user bascule sur webllm
  useEffect(() => {
    if (provider !== "webllm") return;
    if (webllmStatus === "ready" || webllmStatus === "loading") return;
    let cancelled = false;
    (async () => {
      setWebllmStatus("loading");
      setErrorMsg(null);
      try {
        // Récupère le system prompt côté backend en parallèle du chargement
        const [engine, sp] = await Promise.all([
          getWebLLMEngine((p) => {
            if (!cancelled) setWebllmProgress(p);
          }),
          getChatSystemPrompt(interviewId, moduleId, 1).then((r) => r.system_prompt),
        ]);
        if (cancelled) return;
        webllmEngineRef.current = engine;
        setWebllmSystemPrompt(sp);
        setWebllmModelLabel(getLoadedModelLabel());
        setWebllmStatus("ready");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setErrorMsg(`Impossible de charger le modèle local : ${message}`);
        setWebllmStatus("error");
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, interviewId, moduleId]);
  // Garde une ref synchrone du provider pour les callbacks (sendInitial,
  // handleSend) — évite que le user puisse "geler" l'ancien provider
  // en cliquant le toggle entre l'optimistic setMessages et l'appel API.
  const providerRef = useRef<ChatProvider>(provider);
  useEffect(() => {
    providerRef.current = provider;
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CHAT_PROVIDER_LS_KEY, provider);
    } catch {
      /* fail silent */
    }
  }, [provider]);
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
        // Le demarrage du tour 1 (pour les deux providers) est gere par le
        // useEffect dedie plus bas, une fois isLoading repasse a false.
      } catch {
        if (!cancelled) setErrorMsg("Impossible de charger l'historique. Vous pouvez tout de même envoyer un message.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, moduleId]);

  // Démarrage (ou redémarrage) du tour 1. Couvre les deux providers :
  //  - anthropic : des que le bootstrap est fini et la conversation vide
  //  - webllm    : en plus, on attend que le runtime soit charge (ready)
  // Se redeclenche aussi apres un changement de provider sur conversation vide
  // (handleProviderChange remet initRef a false) — permet de relancer le tour 1
  // si le premier essai a echoue (ex : Cloud sans cle API en local).
  useEffect(() => {
    if (isLoading) return;            // bootstrap pas encore fini
    if (initRef.current) return;      // tour 1 deja lance
    if (isSending) return;            // un envoi est en cours
    if (messages.length > 0) return;  // conversation non vide
    if (provider === "webllm" && webllmStatus !== "ready") return; // modele pas pret
    initRef.current = true;
    void sendInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, webllmStatus, isLoading, isSending, messages.length]);

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

  /** Helper : exécute un tour de chat selon le provider courant.
   *  `historyOverride` (optionnel) — si fourni, sert d'historique LLM à la
   *  place du state `messages`. Utile après un reset où le state n'a pas
   *  encore re-rendered et contient l'ancien historique pollué. */
  async function doInference(
    userMessage: string,
    historyOverride: ChatMessageItem[] | null = null,
    turnOverride: number | null = null,
  ): Promise<{
    text: string;
    suggestions?: string[] | null;
    plan?: ChatPlanStep[] | null;
    ended: boolean;
    mermaid_graph?: Record<string, unknown> | null;
    user_message_count: number;
    provider?: string | null;
  }> {
    const p = providerRef.current;
    const effectiveMessages = historyOverride ?? messages;
    const effectiveCount = historyOverride
      ? effectiveMessages.filter((m) => m.role === "user").length
      : userMessageCount;
    if (p === "webllm") {
      // Inférence dans le navigateur via WebLLM, puis persistance en BDD.
      if (!webllmEngineRef.current) {
        throw new Error("Le modèle local n'est pas encore prêt. Patientez quelques secondes.");
      }
      // Refonte 2026-05-23 : on recharge le system prompt avant CHAQUE
      // generation, scope sur le tour courant. Le tour courant =
      // effectiveCount + 1 (le user message qu'on s'apprete a envoyer
      // n'est pas encore compte cote BDD). Ainsi qwen2.5:3b voit des
      // instructions specifiques au tour 1 / 2 / 3 / 4 / 5, et ne se met
      // pas a enumerer les 5 tours d'un coup.
      const currentTurn = turnOverride ?? (effectiveCount + 1);
      const fresh = await getChatSystemPrompt(interviewId, moduleId, currentTurn);
      const promptForThisTurn = fresh.system_prompt;
      setWebllmSystemPrompt(promptForThisTurn);
      // Construire l'historique pour le LLM (sans le user message qu'on vient d'ajouter)
      const histForLlm: { role: "user" | "assistant"; content: string }[] = effectiveMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));
      let raw: string;
      try {
        raw = await generateWithWebLLM(
          webllmEngineRef.current,
          promptForThisTurn,
          histForLlm,
          userMessage,
        );
      } catch (genErr) {
        // Perte de device GPU (typiquement le 7B sur une machine juste en
        // VRAM) : on recharge automatiquement le modele leger (3B) et on
        // reessaye une fois, pour ne jamais laisser l'utilisateur bloque.
        if (!isGpuLostError(genErr)) throw genErr;
        setWebllmProgress({ progress: 0, text: "Bascule sur le modele leger (3B)…" });
        const fallbackEngine = await reloadWithFallback((p) => setWebllmProgress(p));
        webllmEngineRef.current = fallbackEngine;
        setWebllmModelLabel(getLoadedModelLabel());
        raw = await generateWithWebLLM(
          fallbackEngine,
          promptForThisTurn,
          histForLlm,
          userMessage,
        );
      }
      const parsed = parseAssistantReply(raw);
      // Persistance backend (ne génère plus, enregistre)
      const persistRes = await persistChatExchange(interviewId, moduleId, {
        user_message: userMessage,
        assistant_text: parsed.text,
        suggestions: parsed.suggestions,
        plan: parsed.plan as ChatPlanStep[] | null,
        ended: parsed.ended,
        mermaid_graph: parsed.mermaid_graph,
        provider: "webllm",
      });
      return {
        text: parsed.text,
        suggestions: parsed.suggestions,
        plan: parsed.plan as ChatPlanStep[] | null,
        ended: parsed.ended,
        mermaid_graph: parsed.mermaid_graph,
        user_message_count: persistRes.user_message_count,
        provider: "webllm",
      };
    }
    // Provider backend (anthropic / ollama) : appel HTTP classique
    const res = await postChatMessage(interviewId, moduleId, userMessage, p);
    return {
      text: res.text,
      suggestions: res.suggestions,
      plan: res.plan,
      ended: res.ended,
      mermaid_graph: res.mermaid_graph,
      user_message_count: res.user_message_count,
      provider: res.provider,
    };
  }

  async function sendInitial() {
    const initialUserMessage = `Je veux creuser le chantier : ${moduleLabel}`;
    setIsSending(true);
    setErrorMsg(null);
    setMessages((m) => [...m, { role: "user", text: initialUserMessage }]);
    try {
      const res = await doInference(initialUserMessage);
      setMessages((m) => [...m, {
        role: "assistant",
        text: res.text,
        suggestions: res.suggestions,
        plan: res.plan,
        ended: res.ended,
        provider: res.provider as ChatProvider | null | undefined,
          mermaid_graph: res.mermaid_graph,
      }]);
      setUserMessageCount(res.user_message_count);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      // Bug fix 2026-05-23 : sendInitial gère désormais 503 comme handleSend,
      // pour que le médecin voie un message clair au tout premier message
      // (et pas juste "POST .../chat failed: 503").
      if (message.includes("503")) {
        const otherProvider: ChatProvider = providerRef.current === "ollama" ? "anthropic" : "ollama";
        const otherLabel = PROVIDER_LABELS[otherProvider];
        // Le detail du backend (transmis par api.ts) explique pourquoi
        // (lib manquante, Ollama down, modèle pas tiré). On l'affiche brut
        // pour aider le diag.
        const detailMatch = /— (.+)$/.exec(message);
        const detail = detailMatch ? detailMatch[1] : "raison inconnue";
        setErrorMsg(
          `${PROVIDER_LABELS[providerRef.current]} n'est pas joignable. ` +
          `Basculez sur « ${otherLabel} » via le toggle en haut, puis rouvrez la modale. ` +
          `(Détail : ${detail})`
        );
      } else {
        setErrorMsg(`Impossible de démarrer la conversation. ${message}`);
      }
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
      const res = await doInference(msg);
      setMessages((m) => [...m, {
        role: "assistant",
        text: res.text,
        suggestions: res.suggestions,
        plan: res.plan,
        ended: res.ended,
        provider: res.provider as ChatProvider | null | undefined,
          mermaid_graph: res.mermaid_graph,
      }]);
      setUserMessageCount(res.user_message_count);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      if (!messageText) setDraft(msg);
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      if (message.includes("429")) {
        setErrorMsg(`Limite de ${maxUserMessages} questions atteinte. Pour aller plus loin, contactez Sébastien via Calendly.`);
      } else if (message.includes("503")) {
        const otherProvider: ChatProvider = providerRef.current === "ollama" || providerRef.current === "webllm" ? "anthropic" : "webllm";
        const otherLabel = PROVIDER_LABELS[otherProvider];
        setErrorMsg(
          `${PROVIDER_LABELS[providerRef.current]} n'est pas joignable. ` +
          `Basculez sur « ${otherLabel} » via le toggle en haut, puis renvoyez votre message.`
        );
      } else {
        // Affiche le detail reel de l'erreur pour faciliter le diagnostic
        // (modele local pas pret, erreur de generation, backend down...).
        setErrorMsg(`L'assistant n'a pas pu répondre. (Détail : ${message})`);
      }
    } finally {
      setIsSending(false);
    }
  }

  // Changement de provider via le toggle. Si la conversation est encore vide
  // (tour 1 pas encore abouti, ex : echec Cloud sans cle), on remet initRef a
  // false pour que le useEffect de demarrage relance le tour 1 dans le nouveau
  // provider.
  function handleProviderChange(next: ChatProvider) {
    setProvider(next);
    if (messages.length === 0) {
      initRef.current = false;
    }
  }

  async function handleReset() {
    if (isSending) return;
    // Confirmation explicite — perdre une conversation est destructif.
    const ok = window.confirm(
      "Recommencer la discussion ?\n\nTous les messages de cette conversation seront supprimés et l'assistant repartira au tour 1."
    );
    if (!ok) return;
    setIsSending(true);
    setErrorMsg(null);
    try {
      await resetChatConversation(interviewId, moduleId);
      // Reset complet du state local
      setMessages([]);
      setUserMessageCount(0);
      initRef.current = true;
      // Bug fix 2026-05-23 : sendInitial lisait le state `messages` qui n'a
      // pas encore re-render apres setMessages([]) — l'ancien historique
      // pollue etait repasse a qwen et qwen reproduisait les 5 tours. On
      // appelle directement doInference avec historyOverride=[] et
      // turnOverride=1 pour forcer un tour 1 propre.
      const initialUserMessage = `Je veux creuser le chantier : ${moduleLabel}`;
      setMessages([{ role: "user", text: initialUserMessage }]);
      try {
        const res = await doInference(initialUserMessage, [], 1);
        setMessages((m) => [...m, {
          role: "assistant",
          text: res.text,
          suggestions: res.suggestions,
          plan: res.plan,
          ended: res.ended,
          provider: res.provider as ChatProvider | null | undefined,
          mermaid_graph: res.mermaid_graph,
        }]);
        setUserMessageCount(res.user_message_count);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        setMessages([]);
        setErrorMsg(`Impossible de relancer le tour 1. ${message}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setErrorMsg(`Impossible de réinitialiser la conversation. ${message}`);
    } finally {
      setIsSending(false);
    }
  }

  // Force la synthese a tout moment : envoie un message declencheur que le LLM
  // interprete (grace a la note synthese_anticipee du system prompt) pour
  // produire recap + plan d'action + schema + cloture, sans dependre du tour
  // courant. Garantit que l'utilisateur obtient toujours son plan.
  async function handleConclude() {
    if (isSending || isLoading || conversationEnded || remaining === 0 || webllmNotReady) return;
    await handleSend(
      "Peux-tu conclure maintenant : recapitule ce qu'on a vu ensemble, " +
      "propose-moi le plan d'action priorise et le schema du chantier."
    );
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
  // Quand on est en mode WebLLM, on bloque l'envoi tant que le runtime
  // n'est pas chargé — sinon doInference plante avec "modèle pas prêt".
  const webllmNotReady = provider === "webllm" && webllmStatus !== "ready";

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
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: provider === "ollama" ? palette.signalWarn.default : palette.navy400,
              margin: "6px 0 0",
              opacity: 0.85,
              fontStyle: "normal",
            }}
          >
            via {PROVIDER_LABELS[provider]}
            {provider === "webllm" && webllmStatus === "ready" && webllmModelLabel
              ? ` · ${webllmModelLabel}`
              : ""}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button
          type="button"
          onClick={handleReset}
          disabled={isSending || messages.length === 0}
          aria-label="Recommencer la discussion"
          title="Recommencer la discussion (supprime l'historique de ce chantier)"
          style={{
            background: "transparent",
            border: `1px solid ${palette.line}`,
            padding: "6px 12px",
            cursor: (isSending || messages.length === 0) ? "not-allowed" : "pointer",
            fontFamily: fonts.mono,
            fontSize: 10,
            color: palette.navy400,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            transition: "border-color 180ms ease-out, color 180ms ease-out",
            fontStyle: "normal",
            opacity: (isSending || messages.length === 0) ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (isSending || messages.length === 0) return;
            e.currentTarget.style.borderColor = palette.navy;
            e.currentTarget.style.color = palette.navy;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = palette.line;
            e.currentTarget.style.color = palette.navy400;
          }}
        >
          Recommencer
        </button>
        <ProviderToggle
          provider={provider}
          onChange={handleProviderChange}
          theme={theme}
          disabled={false}
          localEnabled={isWebLLMSupported() && !CHAT_LOCAL_DISABLED}
        />
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
      </div>

      {/* Liste messages */}
      <div ref={listRef} className="v3-chat-modal-list" style={{ flex: 1, overflowY: "auto", padding: "28px 28px 18px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Bandeau de chargement du modèle WebLLM (premier passage) */}
          {provider === "webllm" && webllmStatus === "loading" && (
            <WebLLMLoadingPanel theme={theme} progress={webllmProgress} />
          )}
          {provider === "webllm" && webllmStatus === "error" && (
            <div
              style={{
                padding: "14px 16px",
                border: `1px solid ${palette.signalWarn.default}`,
                background: `${palette.signalWarn.default}11`,
                color: palette.signalWarn.default,
                fontFamily: fonts.mono,
                fontSize: 12,
                letterSpacing: "0.04em",
                fontStyle: "normal",
              }}
            >
              Le modèle local n'a pas pu se charger. Bascule sur « Cloud » via le toggle en haut pour continuer.
            </div>
          )}
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
                {m.mermaid_graph && (
                  <MermaidDiagram
                    graph={m.mermaid_graph as unknown as GrapheWSF}
                    theme={theme}
                  />
                )}
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
                placeholder={remaining === 0 ? `Limite de ${maxUserMessages} questions atteinte` : "Répondez librement, ou choisissez une suggestion ci-dessus…"}
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
                disabled={ !draft.trim() || isSending || isLoading || remaining === 0 || webllmNotReady }
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

            {/* Bouton de synthese forcee — visible des qu'on a un peu echange,
                permet d'obtenir le plan + schema sans aller au bout des tours. */}
            {userMessageCount >= 3 && remaining > 0 && (
              <button
                type="button"
                onClick={handleConclude}
                disabled={isSending || isLoading || webllmNotReady}
                style={{
                  marginTop: 10,
                  background: "transparent",
                  color: palette.navy,
                  border: `1px solid ${palette.lineStrong}`,
                  padding: "8px 16px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: (isSending || isLoading || webllmNotReady) ? "not-allowed" : "pointer",
                  opacity: (isSending || isLoading || webllmNotReady) ? 0.5 : 1,
                  transition: "border-color 180ms ease-out",
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => { if (!(isSending || isLoading || webllmNotReady)) e.currentTarget.style.borderColor = palette.navy; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = palette.lineStrong; }}
              >
                Terminer et voir mon plan →
              </button>
            )}
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

/**
 * ProviderToggle — petit segmented-control 2 positions Cloud / Local.
 *
 * - État Cloud (Claude Haiku) = défaut, navy uniform.
 * - État Local (qwen2.5:3b) = teinté signal ambre quand actif.
 * - Si `localEnabled` est false (= version gratuite / prod publique),
 *   le bouton Local reste visible mais non-cliquable avec badge cadenas
 *   et tooltip « Mode local · disponible avec l'abonnement Lugia ».
 *   Cliquer dessus déclenche un nudge léger (no-op + tooltip visible).
 */
function ProviderToggle({
  provider,
  onChange,
  theme,
  disabled,
  localEnabled,
}: {
  provider: ChatProvider;
  onChange: (p: ChatProvider) => void;
  theme: V3Theme;
  disabled?: boolean;
  /** False = mode local en teaser premium (toggle visible mais grisé). */
  localEnabled: boolean;
}) {
  const palette = paletteFor(theme);
  const options: Array<{ id: ChatProvider; label: string; title: string }> = [
    {
      id: "anthropic",
      label: "Cloud (LLM)",
      title: "Claude Haiku (API Anthropic) — moteur cloud par défaut",
    },
    {
      id: "webllm",
      label: "Local (SLM)",
      title: localEnabled
        ? "qwen2.5 via WebLLM, tourne dans votre navigateur (données 100 % locales)"
        : "Mode local indisponible (WebGPU requis — Chrome ou Edge récent)",
    },
  ];
  return (
    <div
      role="group"
      aria-label="Choix du moteur LLM"
      style={{
        display: "inline-flex",
        border: `1px solid ${palette.line}`,
        background: "transparent",
      }}
    >
      {options.map((opt) => {
        const active = provider === opt.id;
        const isLocal = opt.id === "webllm";
        const isLockedLocal = isLocal && !localEnabled;
        const buttonDisabled = !!disabled || isLockedLocal;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => {
              if (disabled || active) return;
              if (isLockedLocal) return; // No-op : tooltip explique pourquoi
              onChange(opt.id);
            }}
            disabled={!!disabled}
            aria-disabled={buttonDisabled}
            title={opt.title}
            style={{
              padding: "6px 12px",
              border: "none",
              background: active
                ? (isLocal ? `${palette.signalWarn.default}22` : palette.navy)
                : "transparent",
              color: active
                ? (isLocal ? palette.signalWarn.default : palette.paper)
                : (isLockedLocal ? palette.navy400 : palette.navy400),
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: buttonDisabled ? "not-allowed" : (active ? "default" : "pointer"),
              opacity: disabled ? 0.5 : (isLockedLocal ? 0.55 : 1),
              transition: "background 160ms ease-out, color 160ms ease-out, opacity 160ms ease-out",
              fontStyle: "normal",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {opt.label}
            {isLockedLocal && (
              <span
                aria-hidden="true"
                style={{
                  fontSize: 9,
                  padding: "1px 5px",
                  border: `1px solid ${palette.navy400}`,
                  color: palette.navy400,
                  letterSpacing: "0.10em",
                  fontWeight: 700,
                }}
              >
                Premium
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Panneau d'information affiché pendant le téléchargement / l'initialisation
 * du runtime WebLLM (premier passage sur "Navigateur"). Inclut une barre de
 * progression et le texte d'étape (download shard X, compile, etc.).
 */
function WebLLMLoadingPanel({
  theme,
  progress,
}: {
  theme: V3Theme;
  progress: WebLLMProgress | null;
}) {
  const palette = paletteFor(theme);
  const pct = Math.round((progress?.progress ?? 0) * 100);
  return (
    <div
      style={{
        padding: "18px 20px",
        border: `1px solid ${palette.lineStrong}`,
        background: palette.ivory,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.navy400,
          fontStyle: "normal",
        }}
      >
        Préparation du modèle local · première utilisation
      </div>
      <div style={{ height: 4, background: palette.line, overflow: "hidden" }}>
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: palette.navy,
            transition: "width 200ms ease-out",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: palette.navy600,
          fontStyle: "normal",
        }}
      >
        {progress?.text || "Initialisation…"} {pct > 0 && `· ${pct} %`}
      </div>
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 12,
          lineHeight: 1.6,
          color: palette.navy600,
          fontStyle: "normal",
        }}
      >
        Le modèle est téléchargé une seule fois (2 à 5 Go selon votre machine)
        et stocké dans votre navigateur. Les prochaines discussions seront
        instantanées. Le premier chargement peut prendre quelques minutes.
      </div>
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
