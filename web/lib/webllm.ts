/**
 * Wrapper WebLLM — qwen2.5:3b dans le navigateur (Livraison 2).
 *
 * Le runtime tourne via WebGPU sur la machine du médecin. Le modèle se
 * télécharge à la première utilisation (~2 GB, cache navigateur ensuite).
 *
 * Source de vérité du parsing (markers SUGG_JSON / PLAN_JSON / END_CONVERSATION
 * / __LUGIA_META__) = équivalent TS de `src/chat_assistant.py::parse_assistant_reply`.
 * Si on modifie l'un, mettre à jour l'autre.
 */

// Modele principal : qwen2.5 7B (meilleure tenue des instructions longues
// et de la mecanique 20 tours). ~5 GB VRAM en q4f16.
const MODEL_PRIMARY = "Qwen2.5-7B-Instruct-q4f16_1-MLC";
// Fallback : qwen2.5 3B (~2 GB) si la machine n'a pas assez de RAM/VRAM
// pour charger le 7B. Garantit que personne n'est exclu (« utilisable par
// tous ») — qualite degradee plutot qu'echec.
// q4f32 = exactement le modele 3B valide en prod (ne pas changer sans tester).
const MODEL_FALLBACK = "Qwen2.5-3B-Instruct-q4f32_1-MLC";

// Singleton — un seul engine par session, partagé entre composants.
let cachedEnginePromise: Promise<WebLLMEngineLike> | null = null;
let cachedSystemPromptHash: string | null = null;
// Modele effectivement charge (7B ou fallback 3B) — pour l'afficher dans l'UI.
let loadedModelId: string | null = null;
// Si une perte de device GPU est survenue sur le 7B, on epingle le 3B
// pour tous les chargements suivants (cf reloadWithFallback).
let preferFallbackModel = false;

export type WebLLMProgress = {
  /** 0..1 */
  progress: number;
  /** Message lisible affiché à l'utilisateur. */
  text: string;
};

export type WebLLMEngineLike = {
  chat: {
    completions: {
      create: (params: {
        messages: { role: string; content: string }[];
        temperature?: number;
        max_tokens?: number;
      }) => Promise<{ choices: { message: { content?: string } }[] }>;
    };
  };
};

/**
 * Vérifie si le navigateur est capable de faire tourner WebLLM.
 * Renvoie `true` si WebGPU est disponible.
 */
export function isWebLLMSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  return "gpu" in navigator;
}

/**
 * Charge (ou récupère depuis le cache) le runtime WebLLM avec qwen2.5:3b.
 * Le `initProgressCallback` reçoit les updates de progression du téléchargement.
 *
 * Pattern singleton : si déjà chargé, on retourne l'engine existant sans
 * recharger le modèle.
 */
export async function getWebLLMEngine(
  onProgress?: (p: WebLLMProgress) => void
): Promise<WebLLMEngineLike> {
  if (cachedEnginePromise) {
    return cachedEnginePromise;
  }
  if (!isWebLLMSupported()) {
    throw new Error(
      "Votre navigateur ne supporte pas WebGPU. Essayez Chrome ou Edge récent."
    );
  }

  cachedEnginePromise = (async () => {
    // Import dynamique côté client uniquement (webllm n'est pas SSR-friendly).
    const webllm = await import("@mlc-ai/web-llm");

    const tryCreate = async (modelId: string) => {
      const engine = await webllm.CreateMLCEngine(
        modelId,
        {
          initProgressCallback: (report: { progress?: number; text?: string }) => {
            if (onProgress) {
              onProgress({
                progress: typeof report.progress === "number" ? report.progress : 0,
                text: report.text || "Initialisation…",
              });
            }
          },
        },
        // 3e argument = ChatOptions : fenetre de contexte a 5120.
        // Le defaut WebLLM (4096) etait juste trop court au moment de la
        // synthese (~4141 tokens observes). On etend modestement a 5120 :
        // - assez pour une conversation de 10 tours + system prompt de synthese
        //   (besoin reel estime ~2900 tokens, worst case verbeux ~3600) ;
        // - PAS 8192 : cette valeur doublait le KV-cache du 7B et provoquait un
        //   "Device was lost" (OOM GPU) sur les machines justes en VRAM.
        //   5120 = +25% seulement vs le 4096 qui tournait deja.
        { context_window_size: 5120 }
      );
      loadedModelId = modelId;
      return engine as unknown as WebLLMEngineLike;
    };

    // Si une perte GPU a deja force le repli, on charge directement le 3B.
    if (preferFallbackModel) {
      return await tryCreate(MODEL_FALLBACK);
    }

    // Tente le 7B d'abord ; si echec (RAM/VRAM insuffisante), bascule sur 3B.
    try {
      return await tryCreate(MODEL_PRIMARY);
    } catch (errPrimary) {
      // eslint-disable-next-line no-console
      console.warn(
        "[webllm] chargement 7B impossible, fallback sur 3B :",
        errPrimary
      );
      if (onProgress) {
        onProgress({
          progress: 0,
          text: "Modele leger (3B) — votre machine ne supporte pas le modele complet…",
        });
      }
      return await tryCreate(MODEL_FALLBACK);
    }
  })();

  try {
    return await cachedEnginePromise;
  } catch (err) {
    // En cas d'échec total (meme le 3B), on reset le cache pour permettre un retry.
    cachedEnginePromise = null;
    loadedModelId = null;
    throw err;
  }
}

/**
 * Detecte une erreur de perte de device GPU (OOM VRAM, contexte WebGPU perdu).
 * Survient surtout sur le 7B sur des machines justes en VRAM, soit au
 * chargement, soit en cours de generation.
 */
export function isGpuLostError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /device was lost|gpudevicelostinfo|unable to find a compatible gpu|gpu[^.]*lost|out of memory|\boom\b/i.test(
    msg
  );
}

/**
 * Recharge l'engine en forcant le modele leger (3B). A appeler quand une
 * generation a perdu le device GPU sur le 7B : on epingle le 3B
 * (preferFallbackModel) puis on relance le chargement. Garantit que la demo
 * reste utilisable meme sur une machine qui ne tient pas le 7B en pratique.
 *
 * Note : si le contexte WebGPU est totalement perdu, meme le 3B peut echouer
 * a se charger sans rechargement de page — dans ce cas l'erreur est propagee
 * et l'UI affiche un message clair.
 */
export async function reloadWithFallback(
  onProgress?: (p: WebLLMProgress) => void
): Promise<WebLLMEngineLike> {
  preferFallbackModel = true;
  cachedEnginePromise = null;
  loadedModelId = null;
  return getWebLLMEngine(onProgress);
}

/**
 * Génère une réponse à partir d'un system prompt + historique + nouveau message
 * user. Retourne le texte brut (à parser ensuite via `parseAssistantReply`).
 */
export async function generateWithWebLLM(
  engine: WebLLMEngineLike,
  systemPrompt: string,
  history: { role: "user" | "assistant"; content: string }[],
  userMessage: string
): Promise<string> {
  // Garde-fou contexte : on ne garde que les MAX_HISTORY derniers messages
  // de l'historique. Le system prompt porte deja le contexte du chantier
  // (profil, scores, consignes du tour), donc tronquer le debut de
  // l'exploration reste acceptable. Evite "Prompt tokens exceed context
  // window size" (la fenetre est a 5120, cf getWebLLMEngine).
  const MAX_HISTORY = 24;
  const trimmedHistory =
    history.length > MAX_HISTORY ? history.slice(-MAX_HISTORY) : history;
  const messages = [
    { role: "system", content: systemPrompt },
    ...trimmedHistory,
    { role: "user", content: userMessage },
  ];
  const res = await engine.chat.completions.create({
    messages,
    temperature: 0.4,
    // 2048 : une synthese (recap + PLAN_JSON + MERMAID_JSON) depasse 1000 tokens
    // et etait tronquee en plein milieu du schema. 2048 laisse de la marge.
    max_tokens: 2048,
  });
  return res.choices[0]?.message?.content ?? "";
}

/* ───────────────────────────────────────────────────────────────────────
 * Parser — réplique TS de src/chat_assistant.py::parse_assistant_reply
 * ─────────────────────────────────────────────────────────────────────── */

const RE_END = /END_CONVERSATION\s*:\s*(true|false)/i;
// Suffixe interne de persistance — qwen peut le mimer, on le strippe.
const RE_META = /\n*__LUGIA_META__:\s*\{[\s\S]*?\}/;

/**
 * Extrait un objet JSON équilibré juste après un marker (ex "PLAN_JSON:").
 *
 * Les petits modèles (qwen 3B/7B) tronquent fréquemment le JSON : l'accolade
 * fermante `}` de l'objet englobant manque (`{"steps":[...]` au lieu de
 * `{"steps":[...]}`). Une regex figée ne peut donc pas suffire. On scanne les
 * accolades/crochets en ignorant ceux situés dans des chaînes, on coupe au
 * dernier closer rencontré, puis on rajoute les fermetures manquantes avant
 * de parser.
 *
 * Retourne l'objet parsé + l'intervalle [matchStart, matchEnd) à retirer du
 * texte affiché, ou null si rien d'exploitable.
 */
function extractBalancedJson(
  text: string,
  marker: string
): { value: Record<string, unknown>; matchStart: number; matchEnd: number } | null {
  const markerIdx = text.indexOf(marker);
  if (markerIdx === -1) return null;
  const start = text.indexOf("{", markerIdx);
  if (start === -1) return null;

  // Borne le scan au prochain marker connu : si le JSON courant est tronqué
  // (accolade finale manquante), il ne faut pas que le scanner déborde sur le
  // bloc suivant (ex : PLAN_JSON tronqué qui avalerait MERMAID_JSON).
  const BOUNDARY_MARKERS = [
    "PLAN_JSON:",
    "SUGG_JSON:",
    "MERMAID_JSON:",
    "END_CONVERSATION",
    "__LUGIA_META__",
  ];
  let limit = text.length;
  for (const mk of BOUNDARY_MARKERS) {
    if (mk === marker) continue;
    const j = text.indexOf(mk, start);
    if (j !== -1 && j < limit) limit = j;
  }

  const stack: string[] = [];
  let inStr = false;
  let esc = false;
  let balancedEnd = -1; // index inclus où la pile revient vide
  let lastPop = -1; // index inclus du dernier closer ayant dépilé

  for (let i = start; i < limit; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "{" || ch === "[") {
      stack.push(ch);
    } else if (ch === "}" || ch === "]") {
      if (stack.length > 0) {
        stack.pop();
        lastPop = i;
        if (stack.length === 0) {
          balancedEnd = i;
          break;
        }
      }
    }
  }

  let candidate: string;
  let matchEnd: number;
  if (balancedEnd !== -1) {
    candidate = text.slice(start, balancedEnd + 1);
    matchEnd = balancedEnd + 1;
  } else if (lastPop !== -1) {
    // JSON tronqué : on coupe au dernier closer et on rééquilibre la pile.
    candidate = text.slice(start, lastPop + 1);
    matchEnd = lastPop + 1;
    const s2: string[] = [];
    let inStr2 = false;
    let esc2 = false;
    for (let i = 0; i < candidate.length; i++) {
      const ch = candidate[i];
      if (inStr2) {
        if (esc2) esc2 = false;
        else if (ch === "\\") esc2 = true;
        else if (ch === '"') inStr2 = false;
        continue;
      }
      if (ch === '"') {
        inStr2 = true;
        continue;
      }
      if (ch === "{" || ch === "[") s2.push(ch);
      else if (ch === "}" || ch === "]") s2.pop();
    }
    let closers = "";
    for (let i = s2.length - 1; i >= 0; i--) {
      closers += s2[i] === "{" ? "}" : "]";
    }
    candidate = candidate + closers;
  } else {
    return null;
  }

  try {
    const obj = JSON.parse(candidate.replace(/\n/g, " "));
    if (obj && typeof obj === "object") {
      return {
        value: obj as Record<string, unknown>,
        matchStart: markerIdx,
        matchEnd,
      };
    }
  } catch {
    /* parsing KO */
  }
  return null;
}

export type ParsedReply = {
  text: string;
  suggestions: string[] | null;
  plan:
    | {
        num: string;
        title: string;
        body: string;
        tag: "quick" | "medium" | "invest";
      }[]
    | null;
  ended: boolean;
  /** C.A 2026-05-26 — graphe WSF brut produit par le LLM au tour 4. */
  mermaid_graph: Record<string, unknown> | null;
};

export function parseAssistantReply(raw: string): ParsedReply {
  let text = raw;
  let suggestions: string[] | null = null;
  let plan: ParsedReply["plan"] = null;
  let ended = false;
  let mermaid_graph: Record<string, unknown> | null = null;

  // Retire l'intervalle [matchStart, matchEnd) (marker + JSON) du texte.
  const stripSpan = (s: string, a: number, b: number) =>
    s.slice(0, a) + s.slice(b);

  // END_CONVERSATION (true OU false — on strippe le marker dans les deux cas,
  // ended=true uniquement si la valeur est 'true'). Les petits modeles ecrivent
  // souvent END_CONVERSATION:false par mimetisme — il ne doit jamais s'afficher.
  const mEnd = text.match(RE_END);
  if (mEnd) {
    ended = mEnd[1].toLowerCase() === "true";
    text = text.replace(RE_END, "");
  }

  // PLAN_JSON — extraction tolérante au JSON tronqué.
  const exPlan = extractBalancedJson(text, "PLAN_JSON:");
  if (exPlan) {
    if (Array.isArray(exPlan.value.steps)) {
      plan = exPlan.value.steps as ParsedReply["plan"];
    }
    text = stripSpan(text, exPlan.matchStart, exPlan.matchEnd);
  }

  // SUGG_JSON
  const exSugg = extractBalancedJson(text, "SUGG_JSON:");
  if (exSugg) {
    if (Array.isArray(exSugg.value.items)) {
      suggestions = (exSugg.value.items as unknown[]).slice(0, 3).map(String);
    }
    text = stripSpan(text, exSugg.matchStart, exSugg.matchEnd);
  }

  // MERMAID_JSON (synthèse) — deux arrays imbriqués (nodes + edges).
  const exMermaid = extractBalancedJson(text, "MERMAID_JSON:");
  if (exMermaid) {
    if (
      Array.isArray(exMermaid.value.nodes) &&
      Array.isArray(exMermaid.value.edges)
    ) {
      mermaid_graph = exMermaid.value;
    }
    text = stripSpan(text, exMermaid.matchStart, exMermaid.matchEnd);
  }

  // Strip défensif __LUGIA_META__
  text = text.replace(RE_META, "");

  return { text: text.trim(), suggestions, plan, ended, mermaid_graph };
}

/**
 * Reset du singleton — utile pour reset complet si on a un autre system prompt
 * d'un autre chantier. Pour l'instant on ne reset pas le modèle (il sert pour
 * tous les chantiers), mais on tracke le dernier system prompt pour invalider
 * un cache éventuel plus tard.
 */
export function trackSystemPrompt(systemPrompt: string): void {
  const hash = `${systemPrompt.length}_${systemPrompt.slice(0, 50)}`;
  cachedSystemPromptHash = hash;
}

export function getTrackedSystemPromptHash(): string | null {
  return cachedSystemPromptHash;
}

/** Retourne l'identifiant du modele effectivement charge (7B ou fallback 3B),
 *  ou null si aucun engine n'est encore charge. Utile pour l'afficher en UI. */
export function getLoadedModelId(): string | null {
  return loadedModelId;
}

/** Label court et lisible du modele charge (ex : "qwen2.5 7B"). */
export function getLoadedModelLabel(): string | null {
  if (!loadedModelId) return null;
  if (loadedModelId.includes("7B")) return "qwen2.5 7B";
  if (loadedModelId.includes("3B")) return "qwen2.5 3B";
  return loadedModelId;
}
