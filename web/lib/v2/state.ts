/**
 * Machine à états du parcours V2.0.
 *
 * Étapes (cf spec V2 §11.5) :
 *   intro → profil_step1 → profil_step2 → energy → bloc_A → transition_A → bloc_B → transition_B → bloc_C → resultats
 *
 * Cette machine est purement déclarative — la transition entre états dépend de
 * 3 inputs : la complétude du profil, la complétude des blocs, et la confirmation
 * utilisateur (clic sur CTA, fin de bloc). Pas de logique async ici, juste le
 * graphe des transitions.
 *
 * V2.0-T4b — Sébastien.
 */

import type { UserProfile, V2Scores } from "../api";

export type V2Step =
  | "intro"
  | "profil_step1"
  | "profil_step2"
  | "energy"
  | "bloc_A"
  | "transition_A"
  | "bloc_B"
  | "transition_B"
  | "bloc_C"
  | "resultats";

/** Ordre canonique des étapes — utilisé par la barre de progression. */
export const V2_STEP_ORDER: V2Step[] = [
  "intro",
  "profil_step1",
  "profil_step2",
  "energy",
  "bloc_A",
  "transition_A",
  "bloc_B",
  "transition_B",
  "bloc_C",
  "resultats",
];

/** Champs requis pour l'étape 1 du profil (chips factuels). */
const STEP1_REQUIRED: Array<keyof UserProfile> = [
  "cabinet_type",
  "volume",
  "paramedical_team",
  "logiciel_metier",
  "rdv_canal",
];

/** Champs requis pour l'étape 2 du profil (chips réflexifs). */
const STEP2_REQUIRED: Array<keyof UserProfile> = [
  "status",
  "territoire",
  "horizon",
  "motivation",
];

export function isProfileStep1Complete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return STEP1_REQUIRED.every((f) => !!profile[f]);
}

export function isProfileStep2Complete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return STEP2_REQUIRED.every((f) => !!profile[f]);
}

/** Énergie est saisie quand on a une réponse à la question `energy`. */
export function isEnergyAnswered(
  answeredQuestionIds: ReadonlySet<string>
): boolean {
  return answeredQuestionIds.has("energy");
}

/** Un bloc est complet quand toutes ses questions visibles sont répondues. */
export function isBlockComplete(
  scores: V2Scores | null,
  blockId: "A" | "B" | "C"
): boolean {
  if (!scores) return false;
  return (scores.completeness?.[blockId] ?? 0) >= 1;
}

/**
 * Étape suivante naturelle (avancée linéaire — pas de retour en arrière).
 *
 * Ne fait pas de side-effect (network, scroll, etc.). Le composant qui
 * consomme cette fonction est responsable de :
 *  - vérifier que les prérequis sont satisfaits (sinon stay)
 *  - persister la transition côté backend si pertinent
 *  - mettre à jour son state local
 */
export function nextStep(current: V2Step): V2Step {
  const idx = V2_STEP_ORDER.indexOf(current);
  if (idx < 0 || idx === V2_STEP_ORDER.length - 1) return current;
  return V2_STEP_ORDER[idx + 1];
}

export function prevStep(current: V2Step): V2Step {
  const idx = V2_STEP_ORDER.indexOf(current);
  if (idx <= 0) return current;
  return V2_STEP_ORDER[idx - 1];
}

/**
 * Détermine l'étape initiale à servir à un médecin qui ouvre le parcours.
 *
 * Logique : on saute les étapes déjà complétées. Permet à un médecin qui
 * a saisi le profil dans une session précédente de reprendre directement
 * à l'écran énergie ou au bloc A en cours.
 */
export function resumeStep(
  profile: UserProfile | null,
  scores: V2Scores | null,
  answeredQuestionIds: ReadonlySet<string>
): V2Step {
  if (!isProfileStep1Complete(profile)) return "intro";
  if (!isProfileStep2Complete(profile)) return "profil_step2";
  if (!isEnergyAnswered(answeredQuestionIds)) return "energy";
  if (!isBlockComplete(scores, "A")) return "bloc_A";
  if (!isBlockComplete(scores, "B")) return "bloc_B";
  if (!isBlockComplete(scores, "C")) return "bloc_C";
  return "resultats";
}

/** Label humain pour la barre de progression. */
export function stepLabel(step: V2Step): string {
  switch (step) {
    case "intro":
      return "Présentation";
    case "profil_step1":
    case "profil_step2":
      return "Profil";
    case "energy":
      return "Ancrage";
    case "bloc_A":
    case "transition_A":
      return "Parcours patient";
    case "bloc_B":
    case "transition_B":
      return "Équipe & secrétariat";
    case "bloc_C":
      return "Outils & dossiers";
    case "resultats":
      return "Résultats";
  }
}

/**
 * Numéro affiché à l'utilisateur (1/4) — regroupe les étapes contiguës
 * qui partagent un même chapitre logique.
 */
export function stepChapter(step: V2Step): {
  number: number;
  total: number;
  label: string;
} {
  // 5 chapitres : Profil / Ancrage / Parcours / Équipe / Outils
  // (intro et resultats ne sont pas comptabilisés)
  const chapters: Record<V2Step, number> = {
    intro: 0,
    profil_step1: 1,
    profil_step2: 1,
    energy: 2,
    bloc_A: 3,
    transition_A: 3,
    bloc_B: 4,
    transition_B: 4,
    bloc_C: 5,
    resultats: 6,
  };
  const number = chapters[step];
  const labels: Record<number, string> = {
    1: "Profil",
    2: "Ancrage",
    3: "Parcours patient",
    4: "Équipe & secrétariat",
    5: "Outils & dossiers",
  };
  return {
    number,
    total: 5,
    label: labels[number] ?? "",
  };
}
