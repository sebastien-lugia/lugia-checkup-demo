/**
 * Carte des objets — charte Carte Vivante (anatomie fixe), thémable jour/nuit.
 * 9 zones aux mêmes places ; traits réservés aux exceptions (INTERFACE) et au
 * désalignement « chaud ». Forme = type, couleur = état, opacité = maturité.
 */

import type { GrapheWSF, EtatObjet } from "./types";
import { ETAT_AFFICHAGE, ETAT_TRAIT_NIGHT, ETAT_SEVERITE, renderPalette, type RenderTheme, type EtatAffichage } from "./palette";
import { glyphe, opaciteObjet, labelDeuxLignes } from "./glyphs";

type Rect = { x: number; y: number; w: number; h: number; label: string };
const ZL: Record<string, string> = {
  ENVIRONNEMENT: "Environnement", STRATEGIE: "Stratégie", PARTICIPANT: "Participant",
  TECHNOLOGIE: "Technologie", INFORMATION: "Information", PROCESSUS: "Processus",
  PRODUIT: "Produit", CLIENT: "Client", INFRASTRUCTURE: "Infrastructure",
};

export function renderCartoSVG(g: GrapheWSF, theme: RenderTheme = "night"): string {
  const P = renderPalette(theme);
  const legendCol = (k: EtatAffichage) => (theme === "night" ? ETAT_TRAIT_NIGHT[k] : ETAT_AFFICHAGE[k].trait);

  const W = 1100, H = 660, L = 40, R = W - 40, top = 116;
  const cw = R - L, col = cw / 4;
  const midTop = top + 92, midBot = H - 96, midH = midBot - midTop, halfH = (midH - 8) / 2;

  const zones: Record<string, Rect> = {
    ENVIRONNEMENT: { x: L, y: top, w: cw / 2 - 6, h: 76, label: ZL.ENVIRONNEMENT },
    STRATEGIE: { x: L + cw / 2 + 6, y: top, w: cw / 2 - 6, h: 76, label: ZL.STRATEGIE },
    PARTICIPANT: { x: L, y: midTop, w: col - 6, h: midH, label: ZL.PARTICIPANT },
    TECHNOLOGIE: { x: L + col, y: midTop, w: col - 6, h: halfH, label: ZL.TECHNOLOGIE },
    INFORMATION: { x: L + col, y: midTop + halfH + 8, w: col - 6, h: halfH, label: ZL.INFORMATION },
    PROCESSUS: { x: L + col * 2, y: midTop, w: col - 6, h: midH, label: ZL.PROCESSUS },
    PRODUIT: { x: L + col * 3, y: midTop, w: col, h: halfH, label: ZL.PRODUIT },
    CLIENT: { x: L + col * 3, y: midTop + halfH + 8, w: col, h: halfH, label: ZL.CLIENT },
    INFRASTRUCTURE: { x: L, y: midBot + 8, w: cw, h: 56, label: ZL.INFRASTRUCTURE },
  };

  const byZone = new Map<string, typeof g.nodes>();
  for (const n of g.nodes) {
    const z = zones[n.composante] ? n.composante : "PROCESSUS";
    (byZone.get(z) ?? byZone.set(z, []).get(z)!).push(n);
  }

  const pos = new Map<string, [number, number]>();
  const body: string[] = [];

  for (const [key, rect] of Object.entries(zones)) {
    body.push(`<rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}" fill="none" stroke="${P.line}" stroke-width="1"/>`);
    body.push(`<text x="${rect.x + 8}" y="${rect.y + 15}" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1" fill="${P.ink3}">${rect.label.toUpperCase()}</text>`);
    const objs = byZone.get(key) ?? [];
    if (!objs.length) continue;
    const pad = 12, cellW = 116, cellH = 60, r = 15;
    const cols = Math.max(1, Math.floor((rect.w - 2 * pad) / cellW));
    const usedCols = Math.min(cols, objs.length);
    const startX = rect.x + (rect.w - usedCols * cellW) / 2 + cellW / 2;
    objs.forEach((n, i) => {
      const c = i % cols, rr = Math.floor(i / cols);
      const cx = startX + c * cellW, cy = rect.y + 40 + rr * cellH;
      pos.set(n.id, [cx, cy]);
      const op = opaciteObjet(n);
      body.push(glyphe(n.type, cx, cy, r, P.trait(n.etat), op));
      labelDeuxLignes(n.label, 15).forEach((ln, k) => {
        body.push(`<text x="${cx}" y="${cy + 24 + k * 11}" text-anchor="middle" font-size="9.5" fill="${P.ink2}" opacity="${op}">${ln}</text>`);
      });
    });
  }

  const lines: string[] = [];
  for (const e of g.edges) {
    if (e.type !== "INTERFACE") continue;
    const a = pos.get(e.source), b = pos.get(e.cible);
    if (!a || !b) continue;
    lines.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${P.argent}" stroke-width="1.2" marker-end="url(#ah)"/>`);
    lines.push(`<text x="${(a[0] + b[0]) / 2}" y="${(a[1] + b[1]) / 2 - 4}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" fill="${P.ink3}">interface</text>`);
  }

  const worst = [...g.nodes].sort((a, b) => (ETAT_SEVERITE[b.etat as EtatObjet] ?? 0) - (ETAT_SEVERITE[a.etat as EtatObjet] ?? 0))[0];
  let hot = "";
  if (worst && (ETAT_SEVERITE[worst.etat as EtatObjet] ?? 0) >= 3) {
    const p = pos.get(worst.id);
    if (p) {
      hot += `<circle cx="${p[0]}" cy="${p[1]}" r="26" fill="none" stroke="${P.hot}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
      hot += `<text x="${p[0]}" y="${p[1] - 30}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="${P.hot}">désalignement</text>`;
    }
  }

  const out: string[] = [];
  out.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, -apple-system, sans-serif">`);
  out.push(`<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="${P.argent}"/></marker></defs>`);
  out.push(`<rect width="${W}" height="${H}" fill="${P.bg}"/>`);
  out.push(`<text x="40" y="46" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${P.ink3}">PARCOURS · CARTE DES OBJETS</text>`);
  out.push(`<text x="40" y="78" font-family="Lora, Georgia, serif" font-size="24" fill="${P.ink}">${(g.titre ?? "Parcours").replace(/&/g, "&amp;")}</text>`);
  out.push(`<line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${P.line}" stroke-width="1"/>`);
  out.push(lines.join(""));
  out.push(body.join(""));
  out.push(hot);
  const ly = H - 14;
  (Object.keys(ETAT_AFFICHAGE) as EtatAffichage[]).forEach((k, i) => {
    const cx = 44 + i * 170;
    out.push(`<circle cx="${cx}" cy="${ly}" r="5" fill="none" stroke="${legendCol(k)}" stroke-width="1.6"/>`);
    out.push(`<text x="${cx + 12}" y="${ly + 4}" font-size="10" fill="${P.ink2}">${k}</text>`);
  });
  out.push("</svg>");
  return out.join("");
}

export default renderCartoSVG;
