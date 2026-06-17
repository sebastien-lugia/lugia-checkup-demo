/**
 * Palette de marque Lugia et mapping des états — partagé par les renderers de
 * parcours (ruban, mini-carto) et destiné à converger avec render-mermaid.ts.
 *
 * Source : `resources/methode/lugia_modelisations_graphiques_spec.md` §2 et
 * `resources/vision/lugia_charte_produit_v2.html` (variables --etat-*).
 *
 * Règle : 8 EtatObjet (moteur) → 6 états d'affichage (charte). Jamais de
 * vert/ambre/rouge SaaS ; états sobres navy/argent/olive/brun/terracotta.
 */

import type { EtatObjet, ObjetWSF, LiaisonWSF } from "./types";

export const PALETTE = {
  ivory: "#F4EFE5",
  paper: "#FBFAF6",
  navy: "#1A2333",
  ink600: "#3A4360",
  ink400: "#6E7795",
  argent: "#B5B5B8",
  argentD: "#8E8E91",
  argentL: "#D4D4D6",
  line: "rgba(26,35,51,0.12)",
} as const;

/** Les 6 états d'affichage de la charte (granularité de lecture). */
export type EtatAffichage =
  | "optimal"
  | "fonct"
  | "vigilance"
  | "risque"
  | "critique"
  | "nondoc";

export interface CouleurEtat {
  /** Trait / couleur principale. */
  trait: string;
  /** Fond teinté (jamais d'aplat plein). */
  fill: string;
  /** Couleur de texte lisible. */
  text: string;
}

/** Trio charte par état d'affichage. */
export const ETAT_AFFICHAGE: Record<EtatAffichage, CouleurEtat> = {
  optimal: { trait: "#1A2333", fill: "#F4F3F0", text: "#1A2333" },
  fonct: { trait: "#8E8E91", fill: "#EFEFEC", text: "#3A4360" },
  vigilance: { trait: "#6B6630", fill: "#EAE8DE", text: "#6B6630" },
  risque: { trait: "#7A6030", fill: "#E9E4DA", text: "#7A6030" },
  critique: { trait: "#7A3320", fill: "#E9DED8", text: "#7A3320" },
  nondoc: { trait: "#B5B5B8", fill: "#F3F3EF", text: "#6E7795" },
};

/** Collapse moteur (8) → affichage (6). Aligné sur render-mermaid ETAT_CLASS. */
export const ETAT_TO_AFFICHAGE: Record<EtatObjet, EtatAffichage> = {
  OPTIMAL: "optimal",
  FONCTIONNEL: "fonct",
  DEGRADE: "vigilance",
  EN_TRANSFORMATION: "vigilance",
  A_RISQUE: "risque",
  BLOQUE: "critique",
  NON_DOCUMENTE: "nondoc",
  INACTIF: "nondoc",
};

/** Couleur d'affichage d'un objet — tolérant aux valeurs hors enum (→ fonct). */
export function couleurEtat(etat: string): CouleurEtat {
  const aff = ETAT_TO_AFFICHAGE[etat as EtatObjet] ?? "fonct";
  return ETAT_AFFICHAGE[aff];
}

/** Sévérité d'un état (pour choisir le désalignement à tracer). */
export const ETAT_SEVERITE: Record<EtatObjet, number> = {
  BLOQUE: 5,
  A_RISQUE: 4,
  DEGRADE: 3,
  NON_DOCUMENTE: 2,
  INACTIF: 2,
  EN_TRANSFORMATION: 1,
  FONCTIONNEL: 0,
  OPTIMAL: 0,
};

/** Opacité de maturité : un objet/liaison inféré ou supposé est atténué. */
export function opaciteMaturite(o: { metadata?: Record<string, unknown> }): number {
  const m = (o.metadata?.maturite as string | undefined)?.toUpperCase();
  if (m === "INFERE" || m === "INFÉRÉ") return 0.42;
  if (m === "SUPPOSE" || m === "SUPPOSÉ") return 0.28;
  return 1;
}

/** Échappement minimal pour insertion dans du texte SVG. */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


/* ─────────────────────────────────────────────────────────────────────
 * Palette de RENDU des vues parcours — jour (ivoire) / nuit (navy).
 * Les couleurs d'état nuit viennent de la charte (--etat-*-night).
 * ───────────────────────────────────────────────────────────────────── */

export type RenderTheme = "day" | "night";

/** Couleur de trait d'état en mode nuit (fond navy). */
export const ETAT_TRAIT_NIGHT: Record<EtatAffichage, string> = {
  optimal: "#F4EFE5",
  fonct: "#C9C9CC",
  vigilance: "#C4B870",
  risque: "#C4A055",
  critique: "#C46850",
  nondoc: "rgba(244,239,229,0.42)",
};

export interface RenderPalette {
  bg: string;       // fond de la vue
  ink: string;      // titre / encre forte
  ink2: string;     // texte secondaire (labels)
  ink3: string;     // eyebrow / discret
  line: string;     // filets fins
  argent: string;   // liens / ruban
  hot: string;      // désalignement « chaud »
  trait: (etat: string) => string; // couleur d'état (canal couleur)
}

export function renderPalette(theme: RenderTheme): RenderPalette {
  if (theme === "night") {
    return {
      bg: "#1A2333",
      ink: "#F4EFE5",
      ink2: "#A8B2C8",
      ink3: "#6E7A95",
      line: "rgba(244,239,229,0.12)",
      argent: "#8E8E91",
      hot: "#C46850",
      trait: (etat) => ETAT_TRAIT_NIGHT[ETAT_TO_AFFICHAGE[etat as EtatObjet] ?? "fonct"],
    };
  }
  return {
    bg: PALETTE.ivory,
    ink: PALETTE.navy,
    ink2: PALETTE.ink600,
    ink3: PALETTE.ink400,
    line: PALETTE.line,
    argent: PALETTE.argent,
    hot: "#7A3320",
    trait: (etat) => couleurEtat(etat).trait,
  };
}
