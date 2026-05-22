/**
 * V3-brand — opportunités (modules) priorisées sur la page résultats.
 *
 * 7 modules pré-définis. Chacun a une condition d'activation sur les
 * niveaux 0-3 des 3 axes. La page résultats affiche les 4 premiers qui
 * matchent (filter().slice(0, 4)).
 *
 * V3-brand-T-V3-7.
 */

import { type V3LevelId } from "./tokens";
import type { AxisLevels } from "./signals_data";

export type V3OpportunityEffort = "low" | "med" | "high";
export type V3OpportunityGain = "fast" | "mid" | "slow";

export type V3Opportunity = {
  id: string;
  /** Pictogramme — emoji pour V3 brand-0, à remplacer par SVG en passe ultérieure. */
  icon: string;
  /** Titre court — serif 17 px. */
  label: string;
  /** Description courte — Onest 13 px navy600. */
  desc: string;
  effort: V3OpportunityEffort;
  gain: V3OpportunityGain;
  /** Condition d'activation sur les niveaux 0-3. */
  cond: (s: AxisLevels) => boolean;
  /** Bloc primaire (pour le tri visuel / la couleur d'eyebrow). */
  axis: "A" | "B" | "C";
};

export const V3_OPPORTUNITIES: V3Opportunity[] = [
  {
    id: "urgences",
    icon: "🔴",
    label: "Organiser les urgences du jour",
    desc: "Créneaux dédiés + protocole de tri partagé.",
    effort: "med",
    gain: "fast",
    cond: (s) => s.A <= 1,
    axis: "A",
  },
  {
    id: "chroniques",
    icon: "📋",
    label: "Structurer le suivi des chroniques",
    desc: "File active tracée et rappels de suivi automatiques.",
    effort: "med",
    gain: "fast",
    cond: (s) => s.A <= 2,
    axis: "A",
  },
  {
    id: "delegation",
    icon: "🤝",
    label: "Déléguer les tâches non médicales",
    desc: "Périmètre clair de l'équipe — gain typique 45 min/jour.",
    effort: "high",
    gain: "mid",
    cond: (s) => s.B <= 2,
    axis: "B",
  },
  {
    id: "comm",
    icon: "💬",
    label: "Rituel de communication d'équipe",
    desc: "15 min/jour pour fluidifier l'info entre l'équipe.",
    effort: "low",
    gain: "fast",
    cond: (s) => s.B <= 2,
    axis: "B",
  },
  {
    id: "logiciel",
    icon: "💻",
    label: "Optimiser le logiciel médical",
    desc: "3 fonctions sous-exploitées qui changent le quotidien.",
    effort: "med",
    gain: "fast",
    cond: (s) => s.C <= 2,
    axis: "C",
  },
  {
    id: "admin",
    icon: "📁",
    label: "Réduire la charge administrative",
    desc: "Automatiser ce qui peut l'être, structurer le reste.",
    effort: "med",
    gain: "fast",
    cond: (s) => s.C <= 2,
    axis: "C",
  },
  {
    id: "pilotage",
    icon: "📊",
    label: "Pilotage simple de l'activité",
    desc: "3 indicateurs ciblés plutôt qu'un tableau de bord oublié.",
    effort: "low",
    gain: "mid",
    cond: (s) => s.C <= 3,
    axis: "C",
  },
];

/** Sélectionne les N premières opportunités qui matchent les niveaux donnés. */
export function pickOpportunities(
  levels: AxisLevels,
  max: number = 4
): V3Opportunity[] {
  return V3_OPPORTUNITIES.filter((o) => o.cond(levels)).slice(0, max);
}
