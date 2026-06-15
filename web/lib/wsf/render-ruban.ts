/**
 * Renderer « ruban de chaîne de valeur » — GrapheWSF → SVG (chaîne pure).
 *
 * Grammaire de marque (charte éditoriale Livre IV §25, mémoire
 * `feedback_ruban_symboles_carte_points`, spec §5) :
 *   - RUBAN = SYMBOLES au trait, jamais de points colorés.
 *   - La forme dit le type : 8 symboles = les 8 TypeObjet.
 *   - La position dans les zones (composantes) porte la relation.
 *   - Matérialité : confirmé = plein, inféré = atténué (opacité).
 *   - Seul un désalignement est tracé (l'objet le plus fragile).
 *
 * Trait sobre navy ; la couleur d'état N'EST PAS le canal porteur ici
 * (c'est le rôle de la mini-carto). Lecture gauche → droite.
 *
 * Pur : aucune dépendance DOM, renvoie une chaîne SVG (comme graphToMermaid).
 */

import type { GrapheWSF, ObjetWSF, TypeLiaison } from "./types";
import { PALETTE, ETAT_SEVERITE, opaciteMaturite, escapeXml } from "./palette";

/* Ordre canonique des zones (composantes) de haut en bas. */
const ZONE_ORDER = [
  "ENVIRONNEMENT",
  "STRATEGIE",
  "PARTICIPANT",
  "TECHNOLOGIE",
  "INFORMATION",
  "PROCESSUS",
  "PRODUIT",
  "CLIENT",
  "INFRASTRUCTURE",
] as const;

const ZONE_LABEL: Record<string, string> = {
  ENVIRONNEMENT: "Environnement",
  STRATEGIE: "Stratégie",
  PARTICIPANT: "Participant",
  TECHNOLOGIE: "Technologie",
  INFORMATION: "Information",
  PROCESSUS: "Processus",
  PRODUIT: "Produit",
  CLIENT: "Client",
  INFRASTRUCTURE: "Infrastructure",
};

/* Liaisons qui portent l'avancée du parcours (ordre de lecture g→d). */
const FLOW: ReadonlySet<TypeLiaison> = new Set<TypeLiaison>([
  "PRODUIT",
  "ALIMENTE",
  "TRANSFORME",
  "INTERFACE",
  "DELIVRE",
  "CONSOMME",
  "CONTRAINT",
]);

const TRAIT = PALETTE.navy;
const TW = 1.5;
const TERRA = "#7A3320"; // désalignement tracé

/** Symbole au trait par TypeObjet (centré sur cx,cy). La forme dit le type. */
function symbole(type: string, cx: number, cy: number, op: number): string {
  const st = `fill="none" stroke="${TRAIT}" stroke-width="${TW}" opacity="${op}"`;
  switch (type) {
    case "ACTEUR":
      return `<g ${st}><circle cx="${cx}" cy="${cy - 7}" r="6"/><path d="M${cx - 11},${cy + 11} q11,-16 22,0"/></g>`;
    case "ENTITE":
      return `<rect x="${cx - 16}" y="${cy - 12}" width="32" height="24" ${st}/>`;
    case "STOCK":
      return `<g ${st}><ellipse cx="${cx}" cy="${cy - 9}" rx="15" ry="5"/><path d="M${cx - 15},${cy - 9} v18 a15,5 0 0 0 30,0 v-18"/></g>`;
    case "ACTION":
      return `<rect x="${cx - 18}" y="${cy - 11}" width="36" height="22" rx="11" ${st}/>`;
    case "DECISION":
      return `<polygon points="${cx},${cy - 13} ${cx + 17},${cy} ${cx},${cy + 13} ${cx - 17},${cy}" ${st}/>`;
    case "FLUX":
      return `<polygon points="${cx - 12},${cy - 11} ${cx + 18},${cy - 11} ${cx + 12},${cy + 11} ${cx - 18},${cy + 11}" ${st}/>`;
    case "CONTRAINTE":
      return `<polygon points="${cx - 10},${cy - 11} ${cx + 10},${cy - 11} ${cx + 16},${cy + 11} ${cx - 16},${cy + 11}" ${st}/>`;
    case "FRONTIERE":
      return `<circle cx="${cx}" cy="${cy}" r="14" ${st}/>`;
    default:
      return `<rect x="${cx - 16}" y="${cy - 12}" width="32" height="24" ${st}/>`;
  }
}

/** Ordre de lecture g→d : layering longest-path sur les liaisons de flux. */
function colonnes(g: GrapheWSF): Map<string, number> {
  const layer = new Map<string, number>();
  for (const n of g.nodes) layer.set(n.id, 0);
  const flow = g.edges.filter((e) => FLOW.has(e.type));
  // Relaxation bornée (tolère les cycles : ex. reprise du rejet).
  for (let i = 0; i < g.nodes.length; i++) {
    for (const e of flow) {
      const ls = layer.get(e.source) ?? 0;
      const lc = layer.get(e.cible) ?? 0;
      if (lc <= ls) layer.set(e.cible, ls + 1);
    }
  }
  return layer;
}

export interface RubanOptions {
  width?: number;
  /** Afficher uniquement les zones peuplées (défaut) ou les 9. */
  zonesPeupleesSeules?: boolean;
}

/** Convertit un GrapheWSF en ruban de chaîne de valeur (SVG). */
export function renderRubanSVG(g: GrapheWSF, opts: RubanOptions = {}): string {
  const peopledOnly = opts.zonesPeupleesSeules ?? true;
  const present = new Set(g.nodes.map((n) => n.composante));
  const zones: string[] = ZONE_ORDER.filter((z) => !peopledOnly || present.has(z));

  const layer = colonnes(g);
  const maxLayer = Math.max(0, ...Array.from(layer.values()));

  const lblX = 150;
  const x0 = 200;
  const colW = 138;
  const W = opts.width ?? Math.max(900, x0 + (maxLayer + 1) * colW + 40);
  const bandH = 72;
  const y0 = 130;
  const H = y0 + zones.length * bandH + 110;

  const zoneY = (z: string) => y0 + zones.indexOf(z) * bandH + bandH / 2 - 4;
  const colX = (l: number) => x0 + l * colW;

  // désalignement à tracer : objet le plus sévère (puis le plus critique).
  const worst = [...g.nodes].sort(
    (a, b) =>
      (ETAT_SEVERITE[b.etat] ?? 0) - (ETAT_SEVERITE[a.etat] ?? 0) ||
      (b.criticite === "CRITIQUE" ? 1 : 0) - (a.criticite === "CRITIQUE" ? 1 : 0)
  )[0];

  const out: string[] = [];
  out.push(
    `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, -apple-system, sans-serif">`
  );
  out.push(`<rect width="${W}" height="${H}" fill="${PALETTE.ivory}"/>`);
  out.push(
    `<text x="40" y="46" font-family="IBM Plex Mono, monospace" font-size="12" letter-spacing="2" fill="${PALETTE.ink400}">PARCOURS · RUBAN DE CHAÎNE DE VALEUR</text>`
  );
  out.push(
    `<text x="40" y="78" font-family="Lora, Georgia, serif" font-size="24" fill="${PALETTE.navy}">${escapeXml(g.titre ?? "Parcours")}</text>`
  );
  out.push(`<line x1="40" y1="96" x2="${W - 40}" y2="96" stroke="${PALETTE.line}" stroke-width="1"/>`);

  // bandes de zones
  zones.forEach((z, i) => {
    const yy = y0 + i * bandH;
    out.push(
      `<rect x="40" y="${yy}" width="${W - 80}" height="${bandH}" fill="${i % 2 ? PALETTE.paper : PALETTE.ivory}" stroke="${PALETTE.line}" stroke-width="1"/>`
    );
    out.push(
      `<text x="44" y="${yy + bandH / 2 + 4}" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1" fill="${PALETTE.ink400}">${ZONE_LABEL[z].toUpperCase()}</text>`
    );
  });

  // symboles : pour chaque (zone,colonne), décalage horizontal si collision
  const offset = new Map<string, number>();
  for (const n of g.nodes) {
    if (!zones.includes(n.composante)) continue;
    const l = layer.get(n.id) ?? 0;
    const key = `${n.composante}:${l}`;
    const o = offset.get(key) ?? 0;
    offset.set(key, o + 1);
    const cx = colX(l) + o * 34;
    const cy = zoneY(n.composante);
    const op = opaciteMaturite(n);
    out.push(symbole(n.type, cx, cy, op));
    out.push(
      `<text x="${cx}" y="${cy + 27}" text-anchor="middle" font-size="10" fill="${PALETTE.ink600}" opacity="${op}">${escapeXml(n.label)}</text>`
    );
    // seul désalignement tracé
    if (worst && n.id === worst.id) {
      out.push(`<circle cx="${cx}" cy="${cy}" r="22" fill="none" stroke="${TERRA}" stroke-width="1.4" stroke-dasharray="4 3"/>`);
      out.push(`<text x="${cx}" y="${cy - 28}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" fill="${TERRA}">désalignement</text>`);
    }
  }

  // légende des 8 symboles
  const ly = H - 46;
  out.push(
    `<text x="40" y="${ly - 12}" font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="1.5" fill="${PALETTE.ink400}">8 SYMBOLES — LA FORME DIT LE TYPE · plein = confirmé, atténué = inféré</text>`
  );
  const leg: [string, string][] = [
    ["ACTEUR", "Acteur"],
    ["ENTITE", "Entité"],
    ["STOCK", "Stock"],
    ["ACTION", "Action"],
    ["DECISION", "Décision"],
    ["FLUX", "Flux"],
    ["CONTRAINTE", "Contrainte"],
    ["FRONTIERE", "Frontière"],
  ];
  leg.forEach(([t, lab], i) => {
    const cx = 70 + i * 140;
    const cy = ly + 12;
    out.push(symbole(t, cx, cy, 1));
    out.push(`<text x="${cx + 26}" y="${cy + 4}" font-size="11" fill="${PALETTE.ink600}">${lab}</text>`);
  });

  out.push("</svg>");
  return out.join("");
}

export default renderRubanSVG;
