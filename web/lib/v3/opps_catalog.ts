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
  /** Probabilité d'aboutir au chantier en autonomie (0-1). */
  autoTaux: number;
  /** Probabilité d'aboutir au chantier accompagné par Lugia (0-1). */
  lugiaTaux: number;
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
    autoTaux: 0.3,
    lugiaTaux: 0.8,
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
    autoTaux: 0.15,
    lugiaTaux: 0.85,
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
    autoTaux: 0.2,
    lugiaTaux: 0.8,
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
    autoTaux: 0.18,
    lugiaTaux: 0.8,
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
    autoTaux: 0.2,
    lugiaTaux: 0.75,
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
    autoTaux: 0.2,
    lugiaTaux: 0.75,
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
    autoTaux: 0.35,
    lugiaTaux: 0.75,
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

/* ───────────────────────────────────────────────────────────
 * A.1ter — calcul des gains € à partir du profil cabinet.
 *
 * Formule :
 *   gainEurosPerYear =
 *     gainTimeMinPerDay × 220 × (TAUX_HORAIRE / 60) × EFFICIENCY × volumeFactor
 *
 * Hypothèses :
 *   - TAUX_HORAIRE = 70 € TTC/h (médian généraliste libéral, validé 2026-05-22).
 *   - EFFICIENCY = 0.7 (proportion du temps libéré effectivement réinvestie
 *     en activité productive ; le reste est récupération / marge cognitive).
 *   - 220 jours travaillés par an.
 *   - volumeFactor : lt_80 = 0.8, 80_120 = 1.0, gt_120 = 1.25
 *     (le cabinet à plus fort volume capte plus de gain en valeur absolue).
 *
 * Les unités hétérogènes du catalogue (`min/j`, `h/j`, `min/sem`, `h/sem`,
 * `min/consult`) sont normalisées en minutes/jour équivalent — voir
 * `parseGainTimeToMinutesPerDay`.
 * ─────────────────────────────────────────────────────────── */

export const ESTIMATION = {
  TAUX_HORAIRE_TTC: 70,
  EFFICIENCY: 0.7,
  JOURS_PAR_AN: 220,
} as const;

export type VolumeId = "lt_80" | "80_120" | "gt_120";

const VOLUME_FACTOR: Record<VolumeId, number> = {
  lt_80: 0.8,
  "80_120": 1.0,
  gt_120: 1.25,
};

/** Normalise une chaîne gainTime hétérogène en minutes/jour équivalent.
 *  Renvoie null si non parseable. */
export function parseGainTimeToMinutesPerDay(s: string): number | null {
  // Tolère espace insécable, signe moins typographique
  const norm = s.replace(/ /g, " ").trim();
  let m: RegExpMatchArray | null;
  m = norm.match(/^[−-]\s*(\d+)\s*min\s*\/\s*j$/);
  if (m) return parseInt(m[1], 10);
  m = norm.match(/^[−-]\s*(\d+)\s*h\s*\/\s*j$/);
  if (m) return parseInt(m[1], 10) * 60;
  m = norm.match(/^[−-]\s*(\d+)\s*min\s*\/\s*consult$/);
  if (m) return parseInt(m[1], 10); // traité comme min/j équivalent (voir doc)
  m = norm.match(/^[−-]\s*(\d+)\s*h\s*\/\s*sem$/);
  if (m) return Math.round((parseInt(m[1], 10) * 60) / 5);
  m = norm.match(/^[−-]\s*(\d+)\s*min\s*\/\s*sem$/);
  if (m) return Math.round(parseInt(m[1], 10) / 5);
  return null;
}

/**
 * Calcule les gains € annuels personnalisés selon le profil cabinet.
 * Renvoie une valeur en € arrondie à la centaine la plus proche.
 *
 * Si `volume` est inconnu (pas encore renseigné), utilise le volume médian
 * `80_120` comme fallback raisonnable.
 */
export function computeGainEurosPerYear(
  gainTime: string,
  volume: VolumeId | null | undefined,
): number | null {
  const minPerDay = parseGainTimeToMinutesPerDay(gainTime);
  if (minPerDay === null) return null;
  const vol: VolumeId = (volume ?? "80_120") as VolumeId;
  const factor = VOLUME_FACTOR[vol] ?? 1.0;
  const euros =
    (minPerDay / 60) *
    ESTIMATION.TAUX_HORAIRE_TTC *
    ESTIMATION.JOURS_PAR_AN *
    ESTIMATION.EFFICIENCY *
    factor;
  // Arrondi à la centaine pour ne pas survendre la précision.
  return Math.round(euros / 100) * 100;
}

/** Format affichage français : 3 100 → "3 100 €", 12 400 → "12,4 k€" */
export function formatGainEuros(value: number): string {
  if (value < 10000) {
    // Espaces insécables comme séparateur de milliers (norme typo FR)
    const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f");
    return `${formatted} €`;
  }
  // Au-delà de 10 000, on passe en k€ avec une décimale
  return `${(value / 1000).toFixed(1).replace(".", ",")} k€`;
}

/* ───────────────────────────────────────────────────────────
 * A.1ter+B — comparatif Autonomie vs Avec Lugia.
 *
 * Pour chaque chantier, on calcule deux scénarios :
 *  - Autonomie : taux d'aboutissement faible (15-35 % selon chantier),
 *    délai ×1.5 du catalog, effort cumulé important.
 *  - Avec Lugia : taux d'aboutissement élevé (75-85 %),
 *    délai = catalog, effort minimal (Lugia porte l'essentiel du cadrage).
 *
 * Les valeurs servent à afficher un comparatif honnête dans ChantierHeader :
 * le médecin peut comparer ce qu'il "rapporte" en autonomie vs accompagné.
 *
 * Source des taux : littérature change management organisationnel
 * (auto-conduit 20-30 %, accompagné 60-90 %).
 * ─────────────────────────────────────────────────────────── */

/** Heures cumulées que le médecin investit selon l'effort du chantier. */
export const EFFORT_HOURS = {
  AUTO: { 1: 6, 2: 15, 3: 30 } as Record<1 | 2 | 3, number>,
  LUGIA: { 1: 2, 2: 4, 3: 7 } as Record<1 | 2 | 3, number>,
};

/** Convertit un délai catalog en délai autonomie (×1.5 arrondi). */
export function delaiAutonomie(delaiCatalog: string): string {
  // "< 1 semaine" → "1 à 2 semaines"
  if (/^<\s*1\s*semaine/.test(delaiCatalog)) return "1 à 2 semaines";
  // "N–M semaines" / "N-M semaines"
  const m = delaiCatalog.match(/^(\d+)\s*[–-]\s*(\d+)\s*semaines?/);
  if (m) {
    const lo = Math.round(parseInt(m[1], 10) * 1.5);
    const hi = Math.round(parseInt(m[2], 10) * 1.5);
    return `${lo} à ${hi} semaines`;
  }
  // Fallback : retourne tel quel
  return delaiCatalog;
}

/**
 * Convertit un taux 0-1 en formule humaine "X cabinet(s) sur Y".
 *
 *  - p ≤ 0.5 : "1 cabinet sur N" (cabinet rare qui aboutit seul).
 *  - p > 0.5 : "X cabinets sur Y" (X et Y choisis pour matcher p au plus juste).
 *  - p ≥ 0.95 : "quasi-systématique".
 *  - p ≤ 0   : "très rare".
 */
export function tauxToRatio(p: number): string {
  if (p <= 0) return "très rare";
  if (p >= 0.95) return "quasi-systématique";
  if (p <= 0.5) {
    const denom = Math.max(2, Math.round(1 / p));
    return `1 cabinet sur ${denom}`;
  }
  // p > 0.5 : on dérive le dénominateur de 1/(1-p), puis on cale le numérateur.
  const Y = Math.max(2, Math.round(1 / (1 - p)));
  const X = Math.max(1, Math.round(p * Y));
  return `${X} ${X === 1 ? "cabinet" : "cabinets"} sur ${Y}`;
}

/** Stats prêtes à afficher en comparatif Auto vs Lugia. */
export type ChantierStats = {
  gainAttenduAuto: number | null;
  gainAttenduLugia: number | null;
  delaiAuto: string;
  delaiLugia: string;
  effortAutoHours: number;
  effortLugiaHours: number;
  tauxAuto: number;
  tauxLugia: number;
};

export function computeChantierStats(
  opp: V3OppEntry,
  volume: VolumeId | null | undefined,
): ChantierStats {
  const gainTheorique = computeGainEurosPerYear(opp.gainTime, volume);
  return {
    gainAttenduAuto:
      gainTheorique !== null
        ? Math.round((gainTheorique * opp.autoTaux) / 100) * 100
        : null,
    gainAttenduLugia:
      gainTheorique !== null
        ? Math.round((gainTheorique * opp.lugiaTaux) / 100) * 100
        : null,
    delaiAuto: delaiAutonomie(opp.delai),
    delaiLugia: opp.delai,
    effortAutoHours: EFFORT_HOURS.AUTO[opp.effort],
    effortLugiaHours: EFFORT_HOURS.LUGIA[opp.effort],
    tauxAuto: opp.autoTaux,
    tauxLugia: opp.lugiaTaux,
  };
}

