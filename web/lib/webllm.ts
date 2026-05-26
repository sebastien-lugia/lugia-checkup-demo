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

const MODEL_ID = "Qwen2.5-3B-Instruct-q4f32_1-MLC";

// Singleton — un seul engine par session, partagé entre composants.
let cachedEnginePromise: Promise<WebLLMEngineLike> | null = null;
let cachedSystemPromptHash: string | null = null;

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
    const engine = await webllm.CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report: { progress?: number; text?: string }) => {
        if (onProgress) {
          onProgress({
            progress: typeof report.progress === "number" ? report.progress : 0,
            text: report.text || "Initialisation…",
          });
        }
      },
    });
    return engine as unknown as WebLLMEngineLike;
  })();

  try {
    return await cachedEnginePromise;
  } catch (err) {
    // En cas d'échec, on reset le cache pour permettre un retry.
    cachedEnginePromise = null;
    throw err;
  }
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
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: userMessage },
  ];
  const res = await engine.chat.completions.create({
    messages,
    temperature: 0.4,
    max_tokens: 1000,
  });
  return res.choices[0]?.message?.content ?? "";
}

/* ───────────────────────────────────────────────────────────────────────
 * Parser — réplique TS de src/chat_assistant.py::parse_assistant_reply
 * ─────────────────────────────────────────────────────────────────────── */

const RE_END = /END_CONVERSATION\s*:\s*true/i;
const RE_PLAN = /PLAN_JSON:\s*(\{[\s\S]*?\}\s*\]\s*\}|\{[\s\S]*?\})/;
const RE_SUGG = /SUGG_JSON:\s*(\{[^}]+\})/;
// Suffixe interne de persistance — qwen peut le mimer, on le strippe.
const RE_META = /\n*__LUGIA_META__:\s*\{[\s\S]*?\}/;

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
};

export function parseAssistantReply(raw: string): ParsedReply {
  let text = raw;
  let suggestions: string[] | null = null;
  let plan: ParsedReply["plan"] = null;
  let ended = false;

  // END_CONVERSATION
  if (RE_END.test(text)) {
    ended = true;
    text = text.replace(RE_END, "");
  }

  // PLAN_JSON
  const mPlan = text.match(RE_PLAN);
  if (mPlan) {
    try {
      const obj = JSON.parse(mPlan[1].replace(/\n/g, " "));
      if (Array.isArray(obj.steps)) {
        plan = obj.steps;
      }
      text = text.replace(mPlan[0], "");
    } catch {
      /* parsing KO — on laisse */
    }
  }

  // SUGG_JSON
  const mSugg = text.match(RE_SUGG);
  if (mSugg) {
    try {
      const obj = JSON.parse(mSugg[1]);
      if (Array.isArray(obj.items)) {
        suggestions = (obj.items as unknown[]).slice(0, 3).map(String);
      }
      text = text.replace(mSugg[0], "");
    } catch {
      /* parsing KO */
    }
  }

  // Strip défensif __LUGIA_META__
  text = text.replace(RE_META, "");

  return { text: text.trim(), suggestions, plan, ended };
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
