/**
 * V3-brand — catalogue complet des chantiers / opportunités.
 *
 * 7 chantiers avec icon, axe, titre, description courte, effort 1-3,
 * délai, gains chiffrés (temps + €), et condition d'activation sur les
 * niveaux 0-3 des 3 axes.
 *
 * Utilisé :
 *  - dans la page résultats (filtrage via `pickOpps`)
 *  - dans la page « Tous les chantiers » (liste complète sans filtrage)
 *
 * V3-brand-T-V3-12.
 */

import { type V3LevelId, levelOf } from "./tokens";
import type { AxisLevels } from "./signals_data";

export type V3OppEntry = {
  id: string;
  axis: "A" | "B" | "C";
  title: string;
  desc: string;
  effort: 1 | 2 | 3;
  delai: string;
  gainTime: string;
  gainEuros: string;
  /** Condition d'activation sur les niveaux 0-3. */
  cond: (lv: AxisLevels) => boolean;
};

export const V3_OPPS_CATALOG: V3OppEntry[] = [
  {
    id: "comm",
    axis: "B",
    title: "Rituel de communication d'équipe",
    desc: "Un point de 10 min chaque matin. 3 questions, pas plus.",
    effort: 1,
    delai: "< 1 semaine",
    gainTime: "−20 min/j",
    gainEuros: "+10 k€/an",
    cond: (lv) => lv.B <= 2,
  },
  {
    id: "delegation",
    axis: "B",
    title: "Déléguer les tâches non médicales",
    desc: "Périmètre clair de l'équipe — gain typique 45 min/jour.",
    effort: 3,
    delai: "2–4 semaines",
    gainTime: "−45 min/j",
    gainEuros: "+22 k€/an",
    cond: (lv) => lv.B <= 2,
  },
  {
    id: "logiciel",
    axis: "C",
    title: "Optimiser le logiciel médical",
    desc: "3 modèles de documents et une demi-journée de formation ciblée.",
    effort: 2,
    delai: "< 1 semaine",
    gainTime: "−15 min/consult",
    gainEuros: "+12 k€/an",
    cond: (lv) => lv.C <= 2,
  },
  {
    id: "chroniques",
    axis: "A",
    title: "Structurer le suivi des chroniques",
    desc: "File active tracée et rappels de suivi dans le logiciel.",
    effort: 2,
    delai: "< 1 semaine",
    gainTime: "−2h/sem",
    gainEuros: "+8 k€/an",
    cond: (lv) => lv.A <= 2,
  },
  {
    id: "urgences",
    axis: "A",
    title: "Organiser les urgences du jour",
    desc: "Créneaux dédiés + protocole de tri partagé avec le secrétariat.",
    effort: 2,
    delai: "< 1 semaine",
    gainTime: "−30 min/j",
    gainEuros: "+10 k€/an",
    cond: (lv) => lv.A <= 1,
  },
  {
    id: "admin",
    axis: "C",
    title: "Réduire la charge administrative",
    desc: "Automatiser ce qui peut l'être, structurer le reste.",
    effort: 2,
    delai: "< 1 semaine",
    gainTime: "−1h/j",
    gainEuros: "+15 k€/an",
    cond: (lv) => lv.C <= 2,
  },
  {
    id: "pilotage",
    axis: "C",
    title: "Pilotage simple de l'activité",
    desc: "3 indicateurs ciblés plutôt qu'un tableau de bord oublié.",
    effort: 1,
    delai: "2–4 semaines",
    gainTime: "−30 min/sem",
    gainEuros: "+4 k€/an",
    cond: (lv) => lv.C <= 3,
  },
];

/** Sélection filtrée par scores, pour la page résultats (max N=4). */
export function pickOppsFromScores(
  scores: { A: number; B: number; C: number },
  max: number = 4
): V3OppEntry[] {
  const lv: AxisLevels = {
    A: levelOf(scores.A),
    B: levelOf(scores.B),
    C: levelOf(scores.C),
  };
  return V3_OPPS_CATALOG.filter((o) => o.cond(lv)).slice(0, max);
}

/** Récupère un chantier par id (pour la page module + la liste complète). */
export function getOpp(id: string): V3OppEntry | null {
  return V3_OPPS_CATALOG.find((o) => o.id === id) ?? null;
}

/** Tri par axe puis par effort croissant — pour l'affichage en liste. */
export function listAllOpps(): V3OppEntry[] {
  return [...V3_OPPS_CATALOG].sort((a, b) => {
    if (a.axis !== b.axis) return a.axis.localeCompare(b.axis);
    return a.effort - b.effort;
  });
}

// Re-export pour confort (utilisé par la state machine V3 pour V3LevelId)
export type { V3LevelId };
