/**
 * Renderer « mini-carto des objets » — GrapheWSF → SVG (chaîne pure).
 *
 * Grammaire de marque (mémoire `feedback_ruban_symboles_carte_points`, spec §6) :
 *   - CARTE = POINTS colorés par état, jamais de symboles de type.
 *   - La couleur d'état est le canal porteur (seul endroit du triptyque).
 *   - Liaisons = traits fins argent (épaisseur ∝ force, canal secondaire).
 *   - Matérialité : inféré = atténué (opacité).
 *   - Regroupement souple par composante (pas de grille rigide, pas de matrice).
 *
 * Pur : aucune dépendance DOM, renvoie une chaîne SVG.
 */

import type { GrapheWSF } from "./types";
import { PALETTE, couleurEtat, opaciteMaturite, escapeXml, ETAT_AFFICHAGE } from "./palette";

/* Ancrage souple d'un cluster par composante (sur un canvas ~1180×560). */
const ANCHOR: Record<string, [number, number]> = {
  PARTICIPANT: [250, 175],
  TECHNOLOGIE: [520, 150],
  STRATEGIE: [235, 380],
  INFORMATION: [830, 200],
  PROCESSUS: [560, 375],
  PRODUIT: [820, 480],
  ENVIRONNEMENT: [1015, 300],
  CLIENT: [1015, 470],
  INFRASTRUCTURE: [250, 505],
};

export interface CartoOptions {
  width?: number;
  height?: number;
}

/** Convertit un GrapheWSF en mini-carto d'objets (SVG). */
export function renderCartoSVG(g: GrapheWSF, opts: CartoOptions = {}): string {
  const W = opts.width ?? 1180;
  const H = opts.height ?? 620;

  // position de chaque nœud : autour de l'ancre de sa composante.
  const pos = new Map<string, [number, number]>();
  const byComp = new Map<string, string[]>();
  for (const n of g.nodes) {
    const arr = byComp.get(n.composante) ?? [];
    arr.push(n.id);
    byComp.set(n.composante, arr);
  }
  for (const [comp, ids] of byComp) {
    const [ax, ay] = ANCHOR[comp] ?? [W / 2, H / 2];
    const k = ids.length;
    ids.forEach((id, i) => {
      if (k === 1) {
        pos.set(id, [ax, ay]);
      } else {
        const r = 34 + k * 7;
        const a = (i / k) * Math.PI * 2 - Math.PI / 2;
        pos.set(id, [ax + r * Math.cos(a), ay + r * Math.sin(a)]);
      }
    });
  }

  const out: string[] = [];
  out.push(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, -apple-system, sans-serif">`
  );
  out.push(`<rect width="${W}" height="${H}" fill="${PALETTE.ivory}"/>`);
  out.push(
    `<text x="40" y="46" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${PALETTE.ink400}">PARCOURS · MINI-CARTO DES OBJETS</text>`
  );
  out.push(
    `<text x="40" y="78" font-family="Lora, Georgia, serif" font-size="24" fill="${PALETTE.navy}">${escapeXml(g.titre ?? "Parcours")}</text>`
  );
  out.push(`<line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${PALETTE.line}" stroke-width="1"/>`);

  // liaisons (traits fins argent, épaisseur ∝ force)
  const nodeById = new Map(g.nodes.map((n) => [n.id, n]));
  for (const e of g.edges) {
    const a = pos.get(e.source);
    const b = pos.get(e.cible);
    if (!a || !b) continue;
    const so = nodeById.get(e.source);
    const ci = nodeById.get(e.cible);
    const op =
      Math.min(so ? opaciteMaturite(so) : 1, ci ? opaciteMaturite(ci) : 1) * 0.55;
    const sw = (0.8 + (e.force ?? 0.5) * 1.6).toFixed(2);
    out.push(
      `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${PALETTE.argent}" stroke-width="${sw}" opacity="${op.toFixed(2)}"/>`
    );
  }

  // points (couleur = état)
  for (const n of g.nodes) {
    const p = pos.get(n.id);
    if (!p) continue;
    const c = couleurEtat(n.etat);
    const op = opaciteMaturite(n);
    out.push(
      `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="10" fill="${c.trait}" stroke="${PALETTE.ivory}" stroke-width="2" opacity="${op}"/>`
    );
    out.push(
      `<text x="${(p[0] + 15).toFixed(1)}" y="${(p[1] + 4).toFixed(1)}" font-size="11.5" fill="${PALETTE.ink600}" opacity="${op}">${escapeXml(n.label)}</text>`
    );
  }

  // légende des 6 états
  const ly = H - 44;
  out.push(
    `<text x="40" y="${ly - 12}" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${PALETTE.ink400}">ÉTAT DE SANTÉ DES OBJETS · point atténué = inféré</text>`
  );
  const keys = Object.keys(ETAT_AFFICHAGE) as (keyof typeof ETAT_AFFICHAGE)[];
  keys.forEach((k, i) => {
    const cx = 70 + i * 180;
    const cy = ly + 10;
    out.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="${ETAT_AFFICHAGE[k].trait}"/>`);
    out.push(`<text x="${cx + 16}" y="${cy + 4}" font-size="11" fill="${PALETTE.ink600}">${k}</text>`);
  });

  out.push("</svg>");
  return out.join("");
}

export default renderCartoSVG;
