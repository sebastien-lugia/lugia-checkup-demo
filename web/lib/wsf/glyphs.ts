/**
 * Bibliothèque de glyphes monoline — charte Carte Vivante.
 *
 * Règle (resources/vision/lugia_regles_representation.md §3, §5) :
 *  - la FORME (silhouette) dit le TYPE — jamais la couleur ;
 *  - la COULEUR dit l'ÉTAT ;
 *  - l'OPACITÉ dit la MATURITÉ.
 * Glyphes au trait (monoline), pas d'aplat. Partagés par les 3 vues.
 */

import { couleurEtat, opaciteMaturite, escapeXml } from "./palette";
import type { ObjetWSF } from "./types";

/** Glyphe SVG d'un type d'objet, centré (cx,cy), demi-taille r. Trait = couleur. */
export function glyphe(type: string, cx: number, cy: number, r: number, stroke: string, opacity = 1): string {
  const a = `fill="none" stroke="${stroke}" stroke-width="1.6" opacity="${opacity}" stroke-linejoin="round"`;
  const round = (n: number) => Math.round(n * 10) / 10;
  const S = (n: number) => round(cx + n);
  const T = (n: number) => round(cy + n);
  switch (type) {
    case "ACTEUR": // tête + épaules
      return `<g ${a}><circle cx="${cx}" cy="${T(-r * 0.42)}" r="${round(r * 0.34)}"/><path d="M${S(-r * 0.72)},${T(r * 0.6)} a${round(r * 0.72)},${round(r * 0.62)} 0 0 1 ${round(r * 1.44)},0"/></g>`;
    case "ENTITE": // carré arrondi
      return `<rect x="${S(-r * 0.85)}" y="${T(-r * 0.65)}" width="${round(r * 1.7)}" height="${round(r * 1.3)}" rx="3" ${a}/>`;
    case "STOCK": // cylindre
      return `<g ${a}><ellipse cx="${cx}" cy="${T(-r * 0.5)}" rx="${round(r * 0.8)}" ry="${round(r * 0.28)}"/><path d="M${S(-r * 0.8)},${T(-r * 0.5)} v${round(r)} a${round(r * 0.8)},${round(r * 0.28)} 0 0 0 ${round(r * 1.6)},0 v${round(-r)}"/></g>`;
    case "ACTION": // chevron (bannière de process)
      return `<polygon points="${S(-r)},${T(-r * 0.62)} ${S(r * 0.55)},${T(-r * 0.62)} ${S(r)},${cy} ${S(r * 0.55)},${T(r * 0.62)} ${S(-r)},${T(r * 0.62)} ${S(-r * 0.6)},${cy}" ${a}/>`;
    case "DECISION": // losange
      return `<polygon points="${cx},${T(-r * 0.8)} ${S(r * 0.92)},${cy} ${cx},${T(r * 0.8)} ${S(-r * 0.92)},${cy}" ${a}/>`;
    case "FLUX": // parallélogramme
      return `<polygon points="${S(-r * 0.6)},${T(-r * 0.62)} ${S(r)},${T(-r * 0.62)} ${S(r * 0.6)},${T(r * 0.62)} ${S(-r)},${T(r * 0.62)}" ${a}/>`;
    case "CONTRAINTE": // trapèze
      return `<polygon points="${S(-r * 0.55)},${T(-r * 0.62)} ${S(r * 0.55)},${T(-r * 0.62)} ${S(r * 0.9)},${T(r * 0.62)} ${S(-r * 0.9)},${T(r * 0.62)}" ${a}/>`;
    case "FRONTIERE": // cercle pointillé (externe)
      return `<circle cx="${cx}" cy="${cy}" r="${round(r * 0.85)}" ${a} stroke-dasharray="3 3"/>`;
    default:
      return `<rect x="${S(-r * 0.85)}" y="${T(-r * 0.65)}" width="${round(r * 1.7)}" height="${round(r * 1.3)}" rx="3" ${a}/>`;
  }
}

/** Couleur de trait d'un objet selon son état (canal couleur = état). */
export function strokeEtat(o: { etat: string }): string {
  return couleurEtat(o.etat).trait;
}

export function opaciteObjet(o: { metadata?: Record<string, unknown> }): number {
  return opaciteMaturite(o);
}

/** Tronque un label à maxChars avec ellipse (anti-débordement). */
export function labelCourt(label: string, maxChars = 18): string {
  const s = label.trim();
  return escapeXml(s.length > maxChars ? s.slice(0, maxChars - 1).trimEnd() + "…" : s);
}

/** Coupe un label en ≤2 lignes pour tenir sous un glyphe. */
export function labelDeuxLignes(label: string, maxPerLine = 16): string[] {
  const s = label.trim();
  if (s.length <= maxPerLine) return [escapeXml(s)];
  const mots = s.split(" ");
  let l1 = "";
  let l2 = "";
  for (const m of mots) {
    if (!l1 || (l1.length + 1 + m.length <= maxPerLine && !l2)) l1 = (l1 + " " + m).trim();
    else l2 = (l2 + " " + m).trim();
  }
  if (l2.length > maxPerLine) l2 = l2.slice(0, maxPerLine - 1).trimEnd() + "…";
  return l2 ? [escapeXml(l1), escapeXml(l2)] : [escapeXml(l1)];
}

export type { ObjetWSF };
