/**
 * V3-brand — machine à états du parcours.
 *
 * Architecture (cf `DECISIONS.md` D-031 #9) :
 *  - 11 étapes nommées (identiques en granularité à V2.0) pour piloter
 *    le rendu des écrans.
 *  - 29 micro-étapes pour la barre de progression continue (#6) — 10 chips
 *    profil + 1 énergie + 18 questions = 29.
 *
 * Indépendant de la state machine V2 (`web/lib/v2/state.ts`). Les deux
 * cohabitent pour que V3 puisse évoluer librement sans risquer V2.0 en
 * production.
 *
 * V3-brand-T-V3-3 — Sébastien.
 */

import type { UserProfile, V2Scores } from "../api";

/* ───────────────────────────────────────────────────────────
 * Étapes nommées (11)
 * ─────────────────────────────────────────────────────────── */

export type V3Step =
  | "intro"
  | "profil_step1"
  | "profil_step2"
  | "energy"
  | "bloc_A"
  | "transition_A"
  | "bloc_B"
  | "transition_B"
  | "bloc_C"
  | "transition_C"
  | "resultats";

/** Ordre canonique. La barre de progression dérive d'un autre compteur (cf `progressIndex`). */
export const V3_STEP_ORDER: V3Step[] = [
  "intro",
  "profil_step1",
  "profil_step2",
  "energy",
  "bloc_A",
  "transition_A",
  "bloc_B",
  "transition_B",
  "bloc_C",
  "transition_C",
  "resultats",
];

/* ───────────────────────────────────────────────────────────
 * Constantes de progression (barre 28 étapes — D-031 #6)
 * ─────────────────────────────────────────────────────────── */

/** Champs requis pour l'étape 1 du profil (6 chips factuels — secretariat
 *  ajouté avec la refonte charte questionnaire v1.0). */
const STEP1_REQUIRED: Array<keyof UserProfile> = [
  "cabinet_type",
  "volume",
  "paramedical_team",
  "secretariat",
  "logiciel_metier",
  "rdv_canal",
];

/** Champs requis pour l'étape 2 du profil (4 chips réflexifs). */
const STEP2_REQUIRED: Array<keyof UserProfile> = [
  "status",
  "territoire",
  "horizon",
  "motivation",
];

/** Nombre total de questions visibles dans les blocs A+B+C (D-031 #9 : 18 questions). */
export const QUESTIONS_PER_BLOCK = 6;
export const BLOCKS = ["A", "B", "C"] as const;
export type V3Block = (typeof BLOCKS)[number];

/** Nombre de micro-étapes de la barre de progression continue : 10 + 1 + 18 = 29.
 *  (10 chips profil = 6 step1 + 4 step2, 1 énergie, 18 questions blocs.) */
export const V3_TOTAL_PROGRESS_STEPS =
  STEP1_REQUIRED.length +
  STEP2_REQUIRED.length +
  1 + // énergie
  BLOCKS.length * QUESTIONS_PER_BLOCK; // 3 × 6 = 18

/* ───────────────────────────────────────────────────────────
 * Tests de complétude
 * ─────────────────────────────────────────────────────────── */

export function isProfileStep1Complete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return STEP1_REQUIRED.every((f) => !!profile[f]);
}

export function isProfileStep2Complete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return STEP2_REQUIRED.every((f) => !!profile[f]);
}

/** Compteurs partiels pour la barre — combien de chips déjà renseignés. */
function countStep1Answered(profile: UserProfile | null): number {
  if (!profile) return 0;
  return STEP1_REQUIRED.filter((f) => !!profile[f]).length;
}

function countStep2Answered(profile: UserProfile | null): number {
  if (!profile) return 0;
  return STEP2_REQUIRED.filter((f) => !!profile[f]).length;
}

/** Énergie est saisie quand on a une réponse à la question `energy`. */
export function isEnergyAnswered(
  answeredQuestionIds: ReadonlySet<string>
): boolean {
  return answeredQuestionIds.has("energy");
}

/**
 * Un bloc est complet quand son score de complétude (renseigné par le
 * backend dans `V2Scores.completeness`) atteint 1.
 *
 * On consomme V2Scores directement — D-031 #9 : scoring partagé.
 */
export function isBlockComplete(
  scores: V2Scores | null,
  blockId: V3Block
): boolean {
  if (!scores) return false;
  return (scores.completeness?.[blockId] ?? 0) >= 1;
}

/**
 * Un bloc est « commencé » dès qu'au moins une question visible a été
 * répondue. Sert à la logique de reprise (voir `resumeStep`).
 */
export function isBlockStarted(
  scores: V2Scores | null,
  blockId: V3Block
): boolean {
  if (!scores) return false;
  return (scores.completeness?.[blockId] ?? 0) > 0;
}

/**
 * Combien de questions visibles déjà répondues sur le bloc. Estimé via
 * `completeness` (ratio 0-1) × `QUESTIONS_PER_BLOCK`. Pas exact si le bloc
 * a moins de questions visibles que prévu (routing solo b1b), mais
 * suffisant pour la barre de progression — l'utilisateur voit avancer la
 * barre proportionnellement à son ratio de complétude réel.
 */
function countBlockAnswered(
  scores: V2Scores | null,
  blockId: V3Block
): number {
  if (!scores) return 0;
  const ratio = scores.completeness?.[blockId] ?? 0;
  return Math.round(ratio * QUESTIONS_PER_BLOCK);
}

/* ───────────────────────────────────────────────────────────
 * Progression continue (barre 28 étapes — D-031 #6)
 * ─────────────────────────────────────────────────────────── */

/**
 * Position absolue dans la barre de progression continue, entre 0 et
 * `V3_TOTAL_PROGRESS_STEPS` (= 29).
 *
 * La fonction est indépendante de l'étape courante : elle n'observe que
 * ce qui est *réellement saisi*. Du coup, si l'utilisateur revient en
 * arrière pour modifier une chip, la barre reste à sa position max
 * (logique cumulative).
 */
export function progressIndex(
  profile: UserProfile | null,
  scores: V2Scores | null,
  answeredQuestionIds: ReadonlySet<string>
): number {
  const profil = countStep1Answered(profile) + countStep2Answered(profile);
  const energy = isEnergyAnswered(answeredQuestionIds) ? 1 : 0;
  const blocs = BLOCKS.reduce(
    (sum, b) => sum + countBlockAnswered(scores, b),
    0
  );
  return Math.min(profil + energy + blocs, V3_TOTAL_PROGRESS_STEPS);
}

/** Ratio 0-1 utile pour styler la barre (largeur, opacité, etc.). */
export function progressRatio(
  profile: UserProfile | null,
  scores: V2Scores | null,
  answeredQuestionIds: ReadonlySet<string>
): number {
  return (
    progressIndex(profile, scores, answeredQuestionIds) /
    V3_TOTAL_PROGRESS_STEPS
  );
}

/* ───────────────────────────────────────────────────────────
 * Transitions
 * ─────────────────────────────────────────────────────────── */

/**
 * Étape suivante naturelle (avancée linéaire — pas de retour en arrière).
 * Le composant qui appelle reste responsable de vérifier les prérequis
 * (complétude) et de persister la transition.
 */
export function nextStep(current: V3Step): V3Step {
  const idx = V3_STEP_ORDER.indexOf(current);
  if (idx < 0 || idx === V3_STEP_ORDER.length - 1) return current;
  return V3_STEP_ORDER[idx + 1];
}

export function prevStep(current: V3Step): V3Step {
  const idx = V3_STEP_ORDER.indexOf(current);
  if (idx <= 0) return current;
  return V3_STEP_ORDER[idx - 1];
}

/**
 * Étape initiale à servir à un médecin qui ouvre le parcours.
 *
 * Principe : on ne va JAMAIS plus loin que ce que l'utilisateur a explicitement
 * navigué. Si toutes les questions d'un bloc sont répondues mais que le bloc
 * suivant n'a aucune réponse, c'est que l'utilisateur n'a pas cliqué « Bloc
 * suivant » — on le ramène donc sur le bloc qu'il vient de finir (avec ses
 * réponses pré-cochées), pas sur la page de transition qu'il n'a pas encore
 * vue.
 *
 * La page de transition n'est servie que si on a la preuve que l'utilisateur
 * l'a vue : au moins une réponse dans le bloc suivant.
 *
 * Modifié 2026-05-22 (E.3 fix : "on ne peut pas aller plus vite que la
 * navigation de l'utilisateur").
 */
export function resumeStep(
  profile: UserProfile | null,
  scores: V2Scores | null,
  answeredQuestionIds: ReadonlySet<string>
): V3Step {
  if (!isProfileStep1Complete(profile)) return "intro";
  if (!isProfileStep2Complete(profile)) return "profil_step2";
  if (!isEnergyAnswered(answeredQuestionIds)) return "energy";

  // Bloc A
  if (!isBlockComplete(scores, "A")) return "bloc_A";
  // A complet : passer à transition_A SEULEMENT si l'utilisateur a démarré B
  if (!isBlockStarted(scores, "B")) return "bloc_A";
  if (!isBlockComplete(scores, "B")) return "bloc_B";

  // B complet : passer à transition_B SEULEMENT si l'utilisateur a démarré C
  if (!isBlockStarted(scores, "C")) return "bloc_B";
  if (!isBlockComplete(scores, "C")) return "bloc_C";

  // Bloc C complet — utilisateur soit déjà sur transition_C, soit sur résultats.
  // La page d'accueil aura routé directement vers /resultats/v3 si l'interview
  // est marqué `completed`. Sinon on reste sur bloc_C — l'utilisateur cliquera
  // « Voir mon diagnostic → » pour avancer.
  return "bloc_C";
}

/* ───────────────────────────────────────────────────────────
 * Labels & chapitres
 * ─────────────────────────────────────────────────────────── */

/** Label humain (pour la barre de progression, etc.). */
export function stepLabel(step: V3Step): string {
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
    case "transition_C":
      return "Outils & dossiers";
    case "resultats":
      return "Résultats";
  }
}

/**
 * Chapitre courant (intitulé pour l'étiquette au-dessus de la barre).
 * Cinq chapitres (Profil / Ancrage / Parcours / Équipe / Outils) — intro
 * et resultats sont en dehors.
 */
export function stepChapter(step: V3Step): {
  number: number;
  total: number;
  label: string;
} {
  const chapters: Record<V3Step, number> = {
    intro: 0,
    profil_step1: 1,
    profil_step2: 1,
    energy: 2,
    bloc_A: 3,
    transition_A: 3,
    bloc_B: 4,
    transition_B: 4,
    bloc_C: 5,
    transition_C: 5,
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

/* ───────────────────────────────────────────────────────────
 * Helpers de bornes (utiles pour la topbar T-V3-4)
 * ─────────────────────────────────────────────────────────── */

/**
 * Borne basse de la barre pour une étape donnée — où devrait commencer
 * la barre quand on entre sur l'écran.
 *
 * Utile pour styler les segments « passés » / « à venir » sans avoir à
 * recalculer dans le composant.
 */
export function stepProgressLowerBound(step: V3Step): number {
  switch (step) {
    case "intro":
      return 0;
    case "profil_step1":
      return 0; // chips étape 1 : barre 0 → 6
    case "profil_step2":
      return STEP1_REQUIRED.length; // 6
    case "energy":
      return STEP1_REQUIRED.length + STEP2_REQUIRED.length; // 10
    case "bloc_A":
    case "transition_A":
      return STEP1_REQUIRED.length + STEP2_REQUIRED.length + 1; // 11
    case "bloc_B":
    case "transition_B":
      return (
        STEP1_REQUIRED.length +
        STEP2_REQUIRED.length +
        1 +
        QUESTIONS_PER_BLOCK
      ); // 17
    case "bloc_C":
    case "transition_C":
      return (
        STEP1_REQUIRED.length +
        STEP2_REQUIRED.length +
        1 +
        QUESTIONS_PER_BLOCK * 2
      ); // 23
    case "resultats":
      return V3_TOTAL_PROGRESS_STEPS; // 29
  }
}

/** Borne haute (combien la barre vaudra une fois l'écran 100 % rempli). */
export function stepProgressUpperBound(step: V3Step): number {
  switch (step) {
    case "intro":
      return 0;
    case "profil_step1":
      return STEP1_REQUIRED.length; // 6
    case "profil_step2":
      return STEP1_REQUIRED.length + STEP2_REQUIRED.length; // 10
    case "energy":
      return STEP1_REQUIRED.length + STEP2_REQUIRED.length + 1; // 11
    case "bloc_A":
    case "transition_A":
      return (
        STEP1_REQUIRED.length +
        STEP2_REQUIRED.length +
        1 +
        QUESTIONS_PER_BLOCK
      ); // 17
    case "bloc_B":
    case "transition_B":
      return (
        STEP1_REQUIRED.length +
        STEP2_REQUIRED.length +
        1 +
        QUESTIONS_PER_BLOCK * 2
      ); // 23
    case "bloc_C":
    case "transition_C":
      return V3_TOTAL_PROGRESS_STEPS; // 29
    case "resultats":
      return V3_TOTAL_PROGRESS_STEPS;
  }
}
