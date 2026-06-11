"use client";

/**
 * CarteVivanteV3 — remplace MermaidDiagram (D-2026-06-09).
 *
 * Rend un graphe WSF à la charte Lugia V3 (ciel sombre) selon la grammaire :
 *   - CHAÎNE DE VALEUR = ruban de SYMBOLES (nœuds ACTION/FLUX, forme = type),
 *     ordonné par tri topologique sur les liaisons de flux ;
 *   - CARTE = des POINTS (les autres objets), couleur = état, liaisons en argent,
 *     le désalignement (un objet relié à un objet dégradé/à risque) en trait chaud.
 * Aucune dépendance à mermaid. Drop-in : prop `graph` (= mermaid_graph).
 */

type AnyNode = { id: string; composante?: string; type?: string; label?: string; etat?: string; criticite?: string };
type AnyEdge = { id?: string; source: string; cible: string; type?: string };
type AnyGraph = { titre?: string; nodes?: AnyNode[]; edges?: AnyEdge[]; objets?: AnyNode[]; liaisons?: AnyEdge[] };

const ETAT_COULEUR: Record<string, string> = {
  OPTIMAL: "#F4EFE5", FONCTIONNEL: "#C9C9CC", EN_TRANSFORMATION: "#9FB4C9",
  INACTIF: "rgba(244,239,229,0.46)", DEGRADE: "#C4B870", NON_DOCUMENTE: "rgba(244,239,229,0.32)",
  A_RISQUE: "#C4A055", BLOQUE: "#C46850",
};
const ALERTE = new Set(["A_RISQUE", "DEGRADE", "BLOQUE"]);
const FLUX_LIAISONS = new Set(["PRODUIT", "ALIMENTE", "DELIVRE", "CONSOMME", "TRANSFORME"]);
const SYM: Record<string, string> = {
  ACTEUR: '<circle cx="16" cy="12" r="5"/><path d="M7 26 a9 9 0 0 1 18 0"/>',
  ENTITE: '<rect x="6" y="8" width="20" height="16" rx="3"/>',
  STOCK: '<path d="M6 10 v12 a10 4 0 0 0 20 0 v-12"/><ellipse cx="16" cy="10" rx="10" ry="4"/>',
  ACTION: '<path d="M12 8 l8 8 l-8 8"/>',
  DECISION: '<path d="M16 5 L27 16 L16 27 L5 16 Z"/>',
  FLUX: '<path d="M11 9 L28 9 L21 23 L4 23 Z"/>',
  CONTRAINTE: '<path d="M11 9 L21 9 L26 23 L6 23 Z"/>',
  FRONTIERE: '<circle cx="16" cy="16" r="10" stroke-dasharray="3 3"/>',
};

function topo(steps: AnyNode[], edges: AnyEdge[]): AnyNode[] {
  const ids = new Set(steps.map((s) => s.id));
  const succ: Record<string, Set<string>> = {}; const indeg: Record<string, number> = {};
  steps.forEach((s) => { succ[s.id] = new Set(); indeg[s.id] = 0; });
  edges.forEach((e) => {
    if (FLUX_LIAISONS.has(e.type || "") && ids.has(e.source) && ids.has(e.cible) && !succ[e.source].has(e.cible)) {
      succ[e.source].add(e.cible); indeg[e.cible] += 1;
    }
  });
  const q = steps.filter((s) => indeg[s.id] === 0).map((s) => s.id);
  const seen = new Set<string>(); const order: string[] = [];
  while (q.length) {
    const n = q.shift()!; if (seen.has(n)) continue; seen.add(n); order.push(n);
    [...succ[n]].sort().forEach((m) => { indeg[m] -= 1; if (indeg[m] <= 0) q.push(m); });
  }
  steps.forEach((s) => { if (!seen.has(s.id)) order.push(s.id); });
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]));
  return order.map((id) => byId[id]);
}

export function CarteVivanteV3({ graph, theme = "night" }: { graph: AnyGraph; theme?: "night" | "day" }) {
  const nodes: AnyNode[] = graph?.nodes || graph?.objets || [];
  const edges: AnyEdge[] = graph?.edges || graph?.liaisons || [];
  if (!nodes.length) return null;

  const etatById = Object.fromEntries(nodes.map((n) => [n.id, n.etat || "NON_DOCUMENTE"]));
  const steps = topo(nodes.filter((n) => n.type === "ACTION" || n.type === "FLUX"), edges);
  const points = nodes.filter((n) => n.type !== "ACTION" && n.type !== "FLUX");

  const W = 760;
  const cx = W / 2;
  // Ruban : pas fixe centré (évite l'étirement sur toute la largeur quand peu d'étapes).
  const RH = steps.length ? 130 : 52;
  const RGAP = steps.length > 1 ? Math.min(160, (W - 160) / (steps.length - 1)) : 0;
  const startX = cx - ((steps.length - 1) * RGAP) / 2;
  const xs = steps.map((_, i) => (steps.length === 1 ? cx : startX + i * RGAP));
  // Carte : anneau resserré selon le nombre de points (1 point = centré, pas isolé).
  const R = points.length <= 2 ? 88 : points.length <= 4 ? 120 : 150;
  const cyc = RH + R + 30;
  const pos: Record<string, [number, number]> = {};
  points.forEach((p, i) => {
    if (points.length === 1) { pos[p.id] = [cx, cyc]; return; }
    if (points.length === 2) { pos[p.id] = [cx + (i === 0 ? -R : R), cyc]; return; }
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / points.length;
    pos[p.id] = [cx + R * Math.cos(a), cyc + R * Math.sin(a)];
  });
  // Étapes du ruban : on mémorise aussi leur position (haut), pour pouvoir dessiner
  // les liaisons objet↔étape (sinon elles seraient perdues). Les liaisons étape↔étape
  // ne sont PAS redessinées : le ruban (ordre gauche→droite) les porte déjà.
  const stepIds = new Set(steps.map((s) => s.id));
  steps.forEach((s, i) => { pos[s.id] = [xs[i], 78]; });

  const sym = (kind: string, x: number, y: number, color: string) =>
    `<g transform="translate(${x},${y}) scale(0.9) translate(-16,-16)" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SYM[kind] || SYM.ENTITE}</g>`;

  const ruban = [
    steps.length > 1 ? `<line x1="${xs[0]}" y1="64" x2="${xs[steps.length - 1]}" y2="64" stroke="#8E8E91" stroke-width="1.5" opacity="0.55"/>` : "",
    ...steps.map((s, i) => {
      const c = ETAT_COULEUR[s.etat || ""] || "#C9C9CC";
      return `<circle cx="${xs[i]}" cy="64" r="17" fill="#141B29"/>${sym(s.type || "ACTION", xs[i], 64, c)}`
        + `<text x="${xs[i]}" y="36" text-anchor="middle" fill="#F4EFE5" font-family="Onest,sans-serif" font-weight="500" font-size="12">${esc(s.label)}</text>`;
    }),
  ].join("");

  const liens = edges.map((e) => {
    if (stepIds.has(e.source) && stepIds.has(e.cible)) return ""; // flux = porté par le ruban
    const a = pos[e.source], b = pos[e.cible]; if (!a || !b) return "";
    const prob = ALERTE.has(etatById[e.source]) || ALERTE.has(etatById[e.cible]);
    return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${prob ? "#C4A055" : "#8E8E91"}" stroke-width="${prob ? 2 : 1.1}" ${prob ? 'stroke-dasharray="6 4"' : ""} opacity="${prob ? 1 : 0.45}"/>`;
  }).join("");

  const ptsSvg = points.map((p) => {
    const [x, y] = pos[p.id]; const c = ETAT_COULEUR[p.etat || ""] || "#C9C9CC";
    const pivot = p.criticite === "CRITIQUE" && ALERTE.has(p.etat || "");
    const r = pivot ? 7 : 5;
    return `<circle cx="${x}" cy="${y}" r="${r + 5}" fill="#141B29"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`
      + `<text x="${x}" y="${y + 19}" text-anchor="middle" fill="#F4EFE5" font-family="Onest,sans-serif" font-weight="500" font-size="12">${esc(p.label)}</text>`;
  }).join("");

  const H = cyc + R + 44;
  const svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto">`
    + `<text x="0" y="14" fill="rgba(244,239,229,0.46)" font-family="IBM Plex Mono,monospace" font-size="9" letter-spacing="0.18em">CHAÎNE DE VALEUR · RUBAN</text>`
    + ruban
    + `<line x1="0" y1="${RH}" x2="${W}" y2="${RH}" stroke="rgba(244,239,229,0.10)"/>`
    + `<text x="0" y="${RH + 26}" fill="rgba(244,239,229,0.46)" font-family="IBM Plex Mono,monospace" font-size="9" letter-spacing="0.18em">LA CARTE · OBJETS &amp; LIAISONS</text>`
    + liens + ptsSvg + `</svg>`;

  return (
    <div
      style={{
        background: "radial-gradient(85% 130% at 50% -14%,rgba(38,52,90,0.42),transparent 62%),#141B29",
        border: "1px solid rgba(244,239,229,0.10)", borderRadius: 14, padding: "20px 22px",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function esc(s?: string) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
