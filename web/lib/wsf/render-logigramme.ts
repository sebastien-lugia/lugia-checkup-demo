/**
 * Logigramme de process — charte Carte Vivante (SVG, remplace Mermaid),
 * thémable jour/nuit. La seule vue où les flèches portent l'info (ordre,
 * bifurcations). Glyphes charte, couleur = état, flèches fines + étiquettes.
 */

import type { GrapheWSF } from "./types";
import { renderPalette, type RenderTheme } from "./palette";
import { glyphe, opaciteObjet, labelDeuxLignes } from "./glyphs";
import { layeringAcyclic } from "./layout";

function layering(g: GrapheWSF): Map<string, number> {
  return layeringAcyclic(g.nodes.map((n) => n.id), g.edges);
}

export function renderLogigrammeSVG(g: GrapheWSF, theme: RenderTheme = "night"): string {
  const P = renderPalette(theme);
  const layer = layering(g);
  const byLayer = new Map<number, typeof g.nodes>();
  for (const n of g.nodes) {
    const l = layer.get(n.id) ?? 0;
    (byLayer.get(l) ?? byLayer.set(l, []).get(l)!).push(n);
  }
  const nLayers = Math.max(0, ...[...byLayer.keys()]) + 1;
  const maxRows = Math.max(1, ...[...byLayer.values()].map((a) => a.length));

  const colW = 196, rowH = 104, mL = 70, top = 116, r = 18;
  const W = Math.max(720, mL * 2 + nLayers * colW);
  const H = top + maxRows * rowH + 40;

  const pos = new Map<string, [number, number]>();
  for (const [l, nodes] of byLayer) {
    const x = mL + l * colW + colW / 2 - 30;
    const colH = nodes.length * rowH;
    const y0 = top + (maxRows * rowH - colH) / 2 + rowH / 2;
    nodes.forEach((n, i) => pos.set(n.id, [x, y0 + i * rowH]));
  }

  const out: string[] = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, -apple-system, sans-serif">`);
  out.push(`<defs><marker id="lah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="${P.argent}"/></marker></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="${P.bg}"/>`);
  out.push(`<text x="40" y="46" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${P.ink3}">PARCOURS · LOGIGRAMME DE PROCESS</text>`);
  out.push(`<text x="40" y="78" font-family="Lora, Georgia, serif" font-size="24" fill="${P.ink}">${(g.titre ?? "Parcours").replace(/&/g, "&amp;")}</text>`);
  out.push(`<line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${P.line}" stroke-width="1"/>`);

  for (const e of g.edges) {
    const a = pos.get(e.source), b = pos.get(e.cible);
    if (!a || !b) continue;
    const [x1, y1] = a, [x2, y2] = b;
    const sx = x1 + (x2 > x1 ? r + 4 : x2 < x1 ? -(r + 4) : 0);
    const ex = x2 + (x2 > x1 ? -(r + 6) : x2 < x1 ? r + 6 : 0);
    out.push(`<path d="M${sx},${y1} C${(sx + ex) / 2},${y1} ${(sx + ex) / 2},${y2} ${ex},${y2}" fill="none" stroke="${P.argent}" stroke-width="1.2" marker-end="url(#lah)"/>`);
    const label = e.caractere === "CONDITIONNEL" && e.condition ? e.condition : e.type.toLowerCase().replace(/_/g, " ");
    const mx = (sx + ex) / 2, my = (y1 + y2) / 2 - 4, tw = label.length * 4.6 + 6;
    out.push(`<rect x="${mx - tw / 2}" y="${my - 8}" width="${tw}" height="11" fill="${P.bg}"/>`);
    out.push(`<text x="${mx}" y="${my}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="${P.ink3}">${label}</text>`);
  }

  for (const n of g.nodes) {
    const p = pos.get(n.id);
    if (!p) continue;
    const op = opaciteObjet(n);
    out.push(glyphe(n.type, p[0], p[1], r, P.trait(n.etat), op));
    labelDeuxLignes(n.label, 17).forEach((ln, k) => {
      out.push(`<text x="${p[0]}" y="${p[1] + 30 + k * 12}" text-anchor="middle" font-size="10" fill="${P.ink2}" opacity="${op}">${ln}</text>`);
    });
  }

  out.push("</svg>");
  return out.join("");
}

export default renderLogigrammeSVG;
