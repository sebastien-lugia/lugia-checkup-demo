/**
 * Client API pour le backend FastAPI.
 *
 * URL configurable via NEXT_PUBLIC_API_URL (cf .env.local).
 * Fallback : http://localhost:8000.
 *
 * V1-5c : propagation automatique du Bearer token. Sur 401 alors qu'un
 * token était fourni, la session est purgée et l'utilisateur est redirigé
 * vers /login (token expiré ou révoqué).
 */

import { clearSession, getSessionToken } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Token présent mais rejeté → session morte, on déconnecte et on redirige.
  if (res.status === 401 && token) {
    clearSession();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Session expirée");
  }

  if (!res.ok) {
    // FastAPI renvoie typiquement {"detail": "..."} sur les erreurs. On
    // l'extrait pour produire un message d'erreur lisible côté UI (utile
    // notamment pour les 503 du chat où le backend explique pourquoi
    // Ollama est indisponible : lib python manquante, modèle pas tiré,
    // serveur down...).
    let detail = "";
    try {
      const body = await res.clone().json();
      if (body && typeof body.detail === "string") detail = body.detail;
    } catch {
      /* body non-JSON — on tombe sur le message générique */
    }
    const base = `${options.method || "GET"} ${path} failed: ${res.status} ${res.statusText}`;
    throw new Error(detail ? `${base} — ${detail}` : base);
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ---- Auth ----

export async function requestMagicLink(email: string): Promise<void> {
  await request<{ ok: boolean }>("/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export type VerifyMagicTokenResponse = {
  session_token: string;
  email: string;
};

export async function verifyMagicToken(
  token: string
): Promise<VerifyMagicTokenResponse> {
  return request<VerifyMagicTokenResponse>("/auth/verify-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export async function authMe(): Promise<{ email: string }> {
  return request<{ email: string }>("/auth/me");
}

// V1.1.7-a + V2.0-T4b : profil utilisateur enrichi.
// firstname → personnalise l'en-tête du rapport (les deux versions).
// Les 10 champs V2.0 (cabinet_type, status, ...) ne sont saisis que dans le
// parcours V2.0 via le mini-onboarding profil 2 étapes (chips). En V1.1.9
// ces champs restent à null et sont silencieusement ignorés par le rapport
// V1.x.
export type UserProfile = {
  email: string;
  firstname: string | null;
  // V2.0 — étape 1 (chips factuels)
  cabinet_type?: string | null;
  volume?: string | null;
  paramedical_team?: string | null;
  // Ajouté avec la refonte charte questionnaire v1.0 — V3-charte routing
  // (secretariat==seul ↔ has_team). Backend aligné le 2026-05-22 :
  // colonne user_profile.secretariat + Pydantic UserProfileUpdate.
  secretariat?: string | null;
  logiciel_metier?: string | null;
  logiciel_metier_other?: string | null;
  rdv_canal?: string | null;
  // V2.0 — étape 2 (chips réflexifs)
  status?: string | null;
  territoire?: string | null;
  horizon?: string | null;
  motivation?: string | null;
};

// Patch partiel — seuls les champs explicitement fournis sont mis à jour
// côté backend. Permet la saisie en 2 étapes sans réenvoyer l'ensemble.
export type UserProfilePatch = Partial<Omit<UserProfile, "email">>;

export async function getMyProfile(): Promise<UserProfile> {
  return request<UserProfile>("/me/profile");
}

export async function updateMyProfile(firstname: string | null): Promise<UserProfile> {
  return request<UserProfile>("/me/profile", {
    method: "PATCH",
    body: JSON.stringify({ firstname }),
  });
}

// V2.0-T4b — patch partiel multi-champs pour le mini-onboarding profil V2.
export async function patchMyProfileV2(
  patch: UserProfilePatch
): Promise<UserProfile> {
  return request<UserProfile>("/me/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}


export async function logout(): Promise<void> {
  await request<{ ok: boolean }>("/auth/logout", { method: "POST" });
}

export type DeletedCounts = {
  interviews: number;
  answers: number;
  facet_scores: number;
  workstreams: number;
  auth_tokens: number;
  sessions: number;
};

export async function deleteAccount(): Promise<DeletedCounts> {
  const res = await request<{ ok: boolean; deleted: DeletedCounts }>("/me", {
    method: "DELETE",
  });
  return res.deleted;
}

// ---- Protocole ----

export type Option = {
  id: string;
  label: string;
  health_score: number | null;
  node_type: string | null;
  tags: string[];
  // V1.1.5-i : si vrai, un input texte optionnel s'affiche sous l'option
  // sélectionnée pour saisir le prénom de l'entité associée (secrétaire,
  // assistant, associé...). Voir entity_field_label pour le libellé.
  has_entity_field?: boolean;
  entity_field_label?: string;
};

export type Question = {
  id: string;
  position: number;
  mode: "A" | "B" | "C";
  facet: string;
  scored: boolean;
  topic: string;
  open_prompt: string | null;
  qcm_prompt: string | null;
  options: Option[];
};

export type Protocol = {
  version: string;
  last_updated: string;
  total_questions: number;
  scored_facets: string[];
  facet_labels: Record<string, string>;
  modes: Record<string, string>;
  questions: Question[];
};

export async function getProtocol(): Promise<Protocol> {
  return request<Protocol>("/protocol");
}

// ---- Interview ----

export type Interview = {
  id: number;
  created_at: string;
  updated_at: string;
  status: "in_progress" | "completed";
  current_question_index: number;
  // V1.1.7-a : prénom du médecin (du profil user) pour personnaliser l'en-tête.
  doctor_firstname?: string | null;
  // V2.0-T5 : version du protocole rattachée à l'interview.
  // 'v1.1.9' par défaut sur les interviews historiques (cf D-029),
  // 'v2.0' pour les interviews créées via createInterviewV2.
  protocol_version?: string;
};

export async function createInterview(): Promise<number> {
  const data = await request<{ interview_id: number; protocol_version: string }>("/interviews", {
    method: "POST",
  });
  return data.interview_id;
}

// V2.0-T4b — crée une interview attachée au protocole V2.0.
// Retourne l'id et la version (le backend valide la version supportée).
export async function createInterviewV2(): Promise<{
  interview_id: number;
  protocol_version: string;
}> {
  return request<{ interview_id: number; protocol_version: string }>(
    "/interviews",
    {
      method: "POST",
      body: JSON.stringify({ protocol_version: "v2.0" }),
    }
  );
}

// V3-brand-T-V3-14 — crée une interview V3-brand-0.
// Scoring partagé avec V2.0 (D-031 #9), mais le rapport est minimal côté
// backend — le contenu éditorial (phrase choc, bilan, axis_details) est
// assemblé côté frontend via lib/v3/*.
export async function createInterviewV3(): Promise<{
  interview_id: number;
  protocol_version: string;
}> {
  return request<{ interview_id: number; protocol_version: string }>(
    "/interviews",
    {
      method: "POST",
      body: JSON.stringify({ protocol_version: "v3-brand-0" }),
    }
  );
}

/**
 * V3-brand — payload retourné par GET /interviews/{id}/report quand
 * protocol_version === "v3-brand-0". Volontairement minimal : juste les
 * scores + answers + meta. Le rapport éditorial est monté côté client.
 */
export type V3BrandReport = {
  interview: {
    id: number;
    protocol_version: "v3-brand-0";
    created_at: string;
    completed_at: string | null;
    doctor_firstname: string | null;
  };
  profile: UserProfile;
  scores: V2Scores;
  answers: Record<string, string>;
};

export async function getReportV3(interviewId: number): Promise<V3BrandReport> {
  return request<V3BrandReport>(`/interviews/${interviewId}/report`);
}

// ── Substrat : capability map + carte vivante dérivés des chantiers explorés ──
export type FootprintAxe = {
  objets: Array<{ id: string; label: string; type: string; etat: string; composante: string; "référencé_dans": string[] }>;
  references_in: Array<{ label: string; depuis: string }>;
  etat: string;
  sante: number | null;
};
export type SubstratChantier = {
  module_id: string;
  graphe: { titre?: string; nodes?: unknown[]; edges?: unknown[]; objets?: unknown[]; liaisons?: unknown[] } | null;
  derive: { footprint: Record<string, FootprintAxe>; chaine_de_valeur: Array<{ id: string; label: string; type: string; etat: string }>; signaux: Array<{ regle: string; type: string; "sévérité": string; label: string; objets: string[] }> } | null;
  generated_at: string;
};
export type Substrat = {
  interview_id: number;
  chantiers: SubstratChantier[];
  footprint_global: Record<string, FootprintAxe>;
};

export async function getSubstrat(interviewId: number): Promise<Substrat> {
  return request<Substrat>(`/interviews/${interviewId}/substrat`);
}

export async function getActiveInterview(): Promise<Interview | null> {
  return request<Interview | null>("/interviews/active");
}

// V2.0-T5-fix : retourne les interviews in_progress du user indexées par
// protocol_version (max une par version). Permet à la page d'accueil
// d'afficher séparément la session V1.1.9 et la session V2.0 en cours.
export type ActiveInterviewsByVersion = Partial<Record<string, Interview>>;

export async function getActiveInterviewsByVersion(): Promise<ActiveInterviewsByVersion> {
  return request<ActiveInterviewsByVersion>("/interviews/actives");
}

export async function getInterview(id: number): Promise<Interview> {
  return request<Interview>(`/interviews/${id}`);
}

export async function updateCursor(
  id: number,
  index: number
): Promise<void> {
  await request<{ ok: boolean }>(`/interviews/${id}/cursor`, {
    method: "PATCH",
    body: JSON.stringify({ current_question_index: index }),
  });
}

export async function completeInterview(id: number): Promise<void> {
  await request<{ ok: boolean }>(`/interviews/${id}/complete`, {
    method: "POST",
  });
}

// ---- Answers ----

export type Answer = {
  mode: string;
  selected_option: string | null;
  selected_option_label: string | null;
  free_text: string | null;
  complement_text: string | null;
  // V1.1.5-i : prénom de l'entité associée à l'option choisie. Optionnel.
  entity_name?: string | null;
  // V2.0-T4b : false pour les questions non scorées (ancrage énergie V2).
  // Défaut conservatoire true côté backend si omis.
  scored?: boolean;
};

export async function saveAnswer(
  interviewId: number,
  questionId: string,
  answer: Answer
): Promise<void> {
  await request<{ ok: boolean }>(
    `/interviews/${interviewId}/answers/${questionId}`,
    {
      method: "PUT",
      body: JSON.stringify(answer),
    }
  );
}

export async function listAnswers(
  interviewId: number
): Promise<(Answer & { question_id: string; id: number })[]> {
  return request<(Answer & { question_id: string; id: number })[]>(
    `/interviews/${interviewId}/answers`
  );
}

// ---- Report ----

export type FacetScore = {
  label: string;
  score: number | null;
  raw_mean: number | null;
  // V1.1.5-b : niveau qualitatif (1-5, plus le niveau monte, plus la situation
  // appelle de la vigilance). Null si la facette n'a pas de score.
  level: 1 | 2 | 3 | 4 | null;
  level_label: "Maîtrisé" | "Opérationnel" | "À surveiller" | "À risque" | null;
  level_color: "green" | "yellow" | "orange" | "red" | null;
  // V1.1.5-d : forces et risques analytiques extraits par option, triés par priorité,
  // tronqués selon le niveau (1-3 forces, 0-3 risques). Voir src/swot.py côté backend.
  // Optionnels pour rétrocompatibilité avec un backend pré-V1.1.5-d.
  forces?: string[];
  risques?: string[];
  summary: string;
  contributions: Array<{
    question_id: string;
    question_topic: string;
    option_id: string;
    option_label: string;
    health_score: number;
  }>;
};

export type Workstream = {
  key: string;
  title: string;
  priority: number;
  vu: string;          // Ce que nous avons compris de vos réponses
  analyse: string;     // Ce que ça révèle (V1.1 lite)
  pas_confirmer: string; // Ce qui nous échappe encore
  propose: string;     // Ce que nous vous proposons (proposition + bénéfice fusionnés)
};

export type Report = {
  interview: Interview;
  synthesis: string;
  // V1.1.6-f : recommandation italique extraite de la synthèse, affichée
  // entre les facettes et les opportunités d'action.
  recommendation?: string;
  facets: Record<string, FacetScore>;
  workstreams: Workstream[];
  recommended_next_step: "autonomie" | "lugia";
};

export async function getReport(id: number): Promise<Report> {
  return request<Report>(`/interviews/${id}/report`);
}


// =====================================================================
// V2.0 — Protocole, scores et rapport (cf D-029, D-030, T4a/T4b)
// =====================================================================

// ---- Profil mini-onboarding V2 ----

export type ProfileFieldOption = {
  id: string;
  label: string;
  free_text_field?: string;
};

export type ProfileField = {
  id: string;
  label: string;
  options: ProfileFieldOption[];
  context_doc?: string;
};

export type ProfileStep = {
  doc: string;
  intro: string;
  fields: ProfileField[];
};

// ---- Questions et options V2 ----

export type V2OptionBenchmark = {
  texte: string;
  source_status: "to_confirm" | "confirmed" | "qualitative";
  source_hint?: string | null;
};

export type V2Option = {
  id: string;
  label: string;
  s: 1 | 2 | 3 | 4;
  reformulation: string;
  benchmark: V2OptionBenchmark | null;
  has_entity_field?: boolean;
  entity_field_label?: string;
};

export type V2Question = {
  id: string;
  label: string;
  context: string | null;
  options: V2Option[];
  // Présent uniquement sur b1b / b3 (routing solo)
  routing?: string;
  position?: number;
  // C4 : nommage dynamique de la plateforme via profile.rdv_canal
  routing_doc?: string;
  doc_anti_desirabilite?: string;
  logiciel_dynamique?: boolean;
};

export type V2Block = {
  id: "A" | "B" | "C";
  label: string;
  color_token: string;
  questions: V2Question[];
  routing_doc?: string;
};

export type V2EnergyQuestion = {
  id: "energy";
  scored: false;
  doc: string;
  label: string;
  options: Array<{ id: string; label: string }>;
};

export type V2ScoringSpec = {
  doc: string;
  n_visible_per_block: number;
  score_min_pct: number;
  score_max_pct: number;
  global_score_doc: string;
};

export type V2RoutingRule = {
  id: string;
  block: string;
  position: number;
  rule: string;
  doc?: string;
};

export type V2RenderingHints = {
  format: string;
  auto_scroll_after_answer_ms: number;
  respects_prefers_reduced_motion: boolean;
  radar_aside_min_width_px: number;
  radar_topbar_max_width_px: number;
};

export type ProtocolV2 = {
  version: "2.0";
  last_updated: string;
  schema_doc?: string;
  rendering_hints: V2RenderingHints;
  profile: {
    step1: ProfileStep;
    step2: ProfileStep;
  };
  energy: V2EnergyQuestion;
  blocks: V2Block[];
  scoring: V2ScoringSpec;
  routing_rules: V2RoutingRule[];
};

export async function getProtocolV2(): Promise<ProtocolV2> {
  return request<ProtocolV2>("/protocol?version=v2.0");
}

// ---- Routing solo côté client (utilitaire pur) ----

/**
 * Filtre les questions visibles d'un bloc pour un profil donné, en
 * appliquant R-routing-solo sur le bloc B (b1b XOR b3). Réplique la
 * logique de `src/v2/questions.py` côté frontend pour pouvoir afficher
 * les bonnes questions sans rappel backend.
 */
export function getVisibleQuestions(
  block: V2Block,
  profile: UserProfile | null
): V2Question[] {
  if (block.id !== "B") return block.questions;
  const isSolo = (profile?.cabinet_type ?? "").toLowerCase() === "solo";
  return block.questions.filter((q) => {
    if (!q.routing) return true;
    if (q.routing === "cabinet_type==solo") return isSolo;
    if (q.routing === "cabinet_type!=solo") return !isSolo;
    return true;
  });
}

// ---- Scores V2 (radar live) ----

export type V2Level = "a_risque" | "a_surveiller" | "operationnel" | "maitrise";

export type V2AxisScore = {
  pct: number;
  level: V2Level;
  label: "À risque" | "À surveiller" | "Opérationnel" | "Maîtrisé";
  title: string;
  axe_label: string;
};

export type V2Scores = {
  A: V2AxisScore | null;
  B: V2AxisScore | null;
  C: V2AxisScore | null;
  global_score: number | null;
  completeness: { A: number; B: number; C: number };
};

export async function getScoresV2(interviewId: number): Promise<V2Scores> {
  return request<V2Scores>(`/interviews/${interviewId}/scores`);
}

// ---- Rapport V2 complet (page résultats) ----

export type V2Signal = {
  id: string;
  ordre_priorite: number;
  titre: string;
  tonalite: string;
  message: string;
};

export type V2Tonality = {
  status_junior: string | null;
  status_senior: string | null;
  motivation_intro: string;
};

export type V2EnergyPrio = {
  energy: string | null;
  max_effort: number;
  tonalite: string | null;
};

export type V2MotivationPrio = {
  motivation: string | null;
  strategy: "lowest_first" | "low_effort_first" | "transmissibility_first" | "standard";
  axes_order: string[] | null;
  favor_efforts?: number[] | null;
  favor_modules?: string[] | null;
};

export type V2HorizonPrio = {
  horizon: string | null;
  blocks_order: string[] | null;
  favor_modules: string[] | null;
};

export type V2Prioritization = {
  energy: V2EnergyPrio;
  motivation: V2MotivationPrio;
  horizon: V2HorizonPrio;
};

export type V2BenchmarkCombi = {
  id: string;
  message: string;
  source_status: "to_confirm" | "qualitative" | "confirmed";
  source_hint?: string | null;
};

export type V2RoutingMessages = {
  rdv_message: string | null;
};

export type V2ReplacementPayload = {
  active: true;
  banner: string;
  tonality_examples: string[];
  excluded_modules: string[];
  fallback_if_too_short: string;
};

export type V2ModuleStep = {
  num: string;
  titre: string;
  body: string;
  tag: "quick" | "medium" | "invest";
};

export type V2Module = {
  id: string;
  icone: string;
  label: string;
  effort: number;
  impact: string;
  etapes: V2ModuleStep[];
  benchmark_conclusion: V2OptionBenchmark;
  logiciel_dynamique?: boolean;
};

export type V2Report = {
  protocol_version: "v2.0";
  interview: {
    id: number;
    status: "in_progress" | "completed";
    created_at: string;
    updated_at: string;
    global_score: number | null;
    doctor_firstname: string | null;
  };
  profile: UserProfile;
  scores: V2Scores;
  signal: V2Signal | null;
  tonality: V2Tonality;
  prioritization: V2Prioritization;
  benchmarks_combinatoire: V2BenchmarkCombi[];
  routing_messages: V2RoutingMessages;
  territoire_context: string | null;
  replacement: V2ReplacementPayload | null;
  modules: V2Module[];
  opportunities_order: string[];
  is_complete: boolean;
};

export async function getReportV2(interviewId: number): Promise<V2Report> {
  return request<V2Report>(`/interviews/${interviewId}/report`);
}

// ---- Modules d'approfondissement (V2.0-T4g) ----

export type V2ModulesPayload = {
  version: string;
  last_updated: string;
  schema_doc?: string;
  tag_temporalite_labels: Record<string, string>;
  effort_levels: Record<string, string>;
  impact_horizons: Record<string, string>;
  modules: V2Module[];
};

export async function listModulesV2(): Promise<V2ModulesPayload> {
  return request<V2ModulesPayload>("/modules");
}

export async function getModuleV2(moduleId: string): Promise<V2Module> {
  return request<V2Module>(`/modules/${moduleId}`);
}

/**
 * Télécharge le PDF d'un chantier généré côté backend (H.4).
 * Déclenche un download du fichier via un <a> temporaire.
 */
export async function downloadChantierPdf(
  interviewId: number,
  moduleId: string,
): Promise<void> {
  const url = `${API_URL}/interviews/${interviewId}/modules/${moduleId}/pdf`;
  // Bug fix 2026-05-23 : on lisait localStorage.getItem("lugia-session-token")
  // (avec tirets) alors que auth.ts stocke la cle sous "lugia_session_token"
  // (underscores). Token retourne NULL -> pas d'Authorization header ->
  // backend renvoie 401 -> alert "PDF a echoue". Solution : reutiliser
  // getSessionToken() exporte par auth.ts (source de verite unique).
  const token = getSessionToken();
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`PDF non disponible (${res.status})`);
  }
  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `chantier-${moduleId}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

// ─── A.2 — Chat assistant chantier (v2 — 4 phases structurées) ────────────

export type ChatPlanStep = {
  num: string;
  title: string;
  body: string;
  tag: "quick" | "medium" | "invest";
};

export type ChatMessageItem = {
  role: "user" | "assistant";
  text: string;
  suggestions?: string[] | null;
  plan?: ChatPlanStep[] | null;
  ended?: boolean;
  created_at?: string;
  /** D-040 — moteur LLM qui a généré ce message (assistant only). NULL pour
   *  les messages user ou pour les anciens assistants avant migration. */
  provider?: "anthropic" | "ollama" | "webllm" | null;
  /** C.A 2026-05-26 — graphe WSF du chantier produit par le LLM au tour 4.
   *  Sera rendu en SVG côté UI via MermaidDiagram. Format minimal pour
   *  rester compatible avec evolutions du moteur WSF. */
  mermaid_graph?: Record<string, unknown> | null;
};

export type ChatHistory = {
  messages: ChatMessageItem[];
  user_message_count: number;
  max_user_messages: number;
  remaining: number;
};

export type ChatMessageResponse = {
  text: string;
  suggestions?: string[] | null;
  plan?: ChatPlanStep[] | null;
  ended: boolean;
  user_message_count: number;
  max_user_messages: number;
  remaining: number;
  provider?: "anthropic" | "ollama" | "webllm" | null;
  mermaid_graph?: Record<string, unknown> | null;
};

export async function getChatHistory(
  interviewId: number,
  moduleId: string,
): Promise<ChatHistory> {
  return request<ChatHistory>(
    `/interviews/${interviewId}/modules/${moduleId}/chat`
  );
}

/** Provider LLM côté backend chat — toggle UI Cloud/Local.
 *  - "anthropic" : Claude Haiku via API Anthropic (backend, prod par défaut)
 *  - "ollama"    : SLM via Ollama local (backend, dev uniquement)
 *  - "webllm"    : qwen2.5:3b via WebLLM dans le navigateur (frontend) */
export type ChatProvider = "anthropic" | "ollama" | "webllm";

/** System prompt complet pour alimenter un runtime WebLLM côté navigateur.
 *  `turn` (1-5) indique le numéro du tour assistant courant — sert à scoper
 *  les instructions du prompt à ce tour précis (refonte 2026-05-23 pour
 *  éviter que qwen2.5:3b enumere les 5 tours d'un coup). */
export async function getChatSystemPrompt(
  interviewId: number,
  moduleId: string,
  turn: number = 1,
): Promise<{ system_prompt: string }> {
  return request<{ system_prompt: string }>(
    `/interviews/${interviewId}/modules/${moduleId}/chat/system-prompt?turn=${turn}`
  );
}

/** Persiste un échange (user + assistant) déjà généré côté navigateur (WebLLM). */
export async function persistChatExchange(
  interviewId: number,
  moduleId: string,
  payload: {
    user_message: string;
    assistant_text: string;
    suggestions?: string[] | null;
    plan?: ChatPlanStep[] | null;
    ended?: boolean;
    provider?: ChatProvider;
    mermaid_graph?: Record<string, unknown> | null;
  },
): Promise<{
  user_message_count: number;
  max_user_messages: number;
  remaining: number;
  provider: string;
}> {
  return request(
    `/interviews/${interviewId}/modules/${moduleId}/chat/persist`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

/**
 * Reset complet de la conversation chantier : supprime tous les messages
 * en BDD (user + assistant). Le frontend doit ensuite vider son state
 * local et déclencher un nouveau sendInitial pour repartir au tour 1.
 */
export async function resetChatConversation(
  interviewId: number,
  moduleId: string,
): Promise<{ deleted: number }> {
  return request<{ deleted: number }>(
    `/interviews/${interviewId}/modules/${moduleId}/chat`,
    { method: "DELETE" }
  );
}

export async function postChatMessage(
  interviewId: number,
  moduleId: string,
  message: string,
  provider?: ChatProvider,
): Promise<ChatMessageResponse> {
  return request<ChatMessageResponse>(
    `/interviews/${interviewId}/modules/${moduleId}/chat`,
    {
      method: "POST",
      body: JSON.stringify({ message, provider }),
    }
  );
}

/**
 * C.D — répondre à une offre de conseil depuis la démo.
 * Stocke un lead en base + notifie Sébastien par email (côté backend).
 */
export async function submitConseilLead(
  interviewId: number,
  message: string,
  moduleId?: string | null,
): Promise<{ ok: boolean; lead_id: number }> {
  return request<{ ok: boolean; lead_id: number }>(
    `/interviews/${interviewId}/conseil-lead`,
    {
      method: "POST",
      body: JSON.stringify({ message, module_id: moduleId ?? null }),
    }
  );
}

