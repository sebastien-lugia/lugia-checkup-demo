/**
 * Ruban de chaîne de valeur — charte Carte Vivante, thémable (jour/nuit).
 * Les étapes (ACTION/DECISION) sur un ruban horizontal à rythme régulier.
 * Forme = type, couleur = état, opacité = maturité. Pur (chaîne SVG).
 */

import type { GrapheWSF, TypeLiaison } from "./types";
import { ETAT_AFFICHAGE, ETAT_TRAIT_NIGHT, renderPalette, type RenderTheme, type EtatAffichage } from "./palette";
import { glyphe, opaciteObjet, labelDeuxLignes } from "./glyphs";
import { layeringAcyclic } from "./layout";

const FLOW: ReadonlySet<TypeLiaison> = new Set<TypeLiaison>([
  "PRODUIT", "ALIMENTE", "TRANSFORME", "INTERFACE", "DELIVRE", "CONSOMME",
]);
const STEP_TYPES = new Set(["ACTION", "DECISION"]);

function layering(g: GrapheWSF): Map<string, number> {
  return layeringAcyclic(g.nodes.map((n) => n.id), g.edges.filter((e) => FLOW.has(e.type)));
}

export function renderRubanSVG(g: GrapheWSF, theme: RenderTheme = "night"): string {
  const P = renderPalette(theme);
  const legendCol = (k: EtatAffichage) => (theme === "night" ? ETAT_TRAIT_NIGHT[k] : ETAT_AFFICHAGE[k].trait);

  const layer = layering(g);
  let steps = g.nodes.filter((n) => STEP_TYPES.has(n.type));
  if (steps.length === 0) steps = [...g.nodes];
  steps = steps.map((n, i) => ({ n, l: layer.get(n.id) ?? 0, i })).sort((a, b) => a.l - b.l || a.i - b.i).map((x) => x.n);

  const slot = 158, mL = 56;
  const W = Math.max(720, mL * 2 + steps.length * slot);
  const H = 360, midY = 196, r = 17;
  const xOf = (i: number) => mL + slot / 2 + i * slot;

  const out: string[] = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, -apple-system, sans-serif">`);
  out.push(`<rect width="${W}" height="${H}" fill="${P.bg}"/>`);
  out.push(`<text x="40" y="46" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${P.ink3}">PARCOURS · CHAÎNE DE VALEUR</text>`);
  out.push(`<text x="40" y="78" font-family="Lora, Georgia, serif" font-size="24" fill="${P.ink}">${(g.titre ?? "Parcours").replace(/&/g, "&amp;")}</text>`);
  out.push(`<line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${P.line}" stroke-width="1"/>`);

  if (steps.length > 1) out.push(`<line x1="${xOf(0)}" y1="${midY}" x2="${xOf(steps.length - 1)}" y2="${midY}" stroke="${P.argent}" stroke-width="1.2"/>`);

  steps.forEach((n, i) => {
    const x = xOf(i), col = P.trait(n.etat), op = opaciteObjet(n);
    out.push(`<text x="${x}" y="${midY - 34}" text-anchor="middle" font-family="Lora, Georgia, serif" font-size="15" fill="${P.ink3}" opacity="${op}">${i + 1}</text>`);
    out.push(glyphe(n.type, x, midY, r, col, op));
    out.push(`<circle cx="${x}" cy="${midY + 30}" r="3.2" fill="${col}" opacity="${op}"/>`);
    labelDeuxLignes(n.label, 18).forEach((ln, k) => {
      out.push(`<text x="${x}" y="${midY + 50 + k * 13}" text-anchor="middle" font-size="11" fill="${P.ink2}" opacity="${op}">${ln}</text>`);
    });
  });

  const ly = H - 30;
  const keys = Object.keys(ETAT_AFFICHAGE) as EtatAffichage[];
  out.push(`<text x="40" y="${ly - 12}" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="${P.ink3}">LA FORME DIT LE TYPE · LA COULEUR DIT L'ÉTAT · atténué = inféré</text>`);
  keys.forEach((k, i) => {
    const cx = 44 + i * 175;
    out.push(`<circle cx="${cx}" cy="${ly}" r="5" fill="none" stroke="${legendCol(k)}" stroke-width="1.6"/>`);
    out.push(`<text x="${cx + 12}" y="${ly + 4}" font-size="10.5" fill="${P.ink2}">${k}</text>`);
  });

  out.push("</svg>");
  return out.join("");
}

export default renderRubanSVG;
