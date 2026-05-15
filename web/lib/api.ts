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
    throw new Error(
      `${options.method || "GET"} ${path} failed: ${res.status} ${res.statusText}`
    );
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
};

export async function createInterview(): Promise<number> {
  const data = await request<{ interview_id: number }>("/interviews", {
    method: "POST",
  });
  return data.interview_id;
}

export async function getActiveInterview(): Promise<Interview | null> {
  return request<Interview | null>("/interviews/active");
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
  facets: Record<string, FacetScore>;
  workstreams: Workstream[];
  recommended_next_step: "autonomie" | "lugia" | "terrain";
};

export async function getReport(id: number): Promise<Report> {
  return request<Report>(`/interviews/${id}/report`);
}
