/**
 * Render Mermaid depuis un graphe WSF.
 *
 * Convertit un GrapheWSF (structure de données) en code Mermaid affichable
 * (`flowchart TD` pour l'instant — d'autres types de diagrammes pourront
 * être ajoutés selon la question posée, cf section 9 de la spec WSF).
 *
 * Le moteur de rendu est volontairement minimal pour cette première
 * itération (C.A — schéma Mermaid simplifié au tour 4 du chat) :
 *  - Mapping `TypeObjet` → forme Mermaid
 *  - Mapping `EtatObjet` → classDef couleur
 *  - Mapping `force` liaison → épaisseur de flèche
 *  - Label de liaison = type de liaison (en minuscule)
 *
 * Sera étendu avec les patterns détectés, les chemins critiques, et la
 * sectorisation au fur et à mesure du moteur WSF (WS.x dans ROADMAP).
 */

import type {
  EtatObjet,
  GrapheWSF,
  LiaisonWSF,
  ObjetWSF,
  TypeObjet,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────
 * Mapping TypeObjet → forme Mermaid (flowchart syntax)
 *
 * On encode la forme directement dans la déclaration du nœud :
 *   ACTEUR     → A[label]      rectangle
 *   ENTITE     → B[label]      rectangle (identique acteur en flowchart)
 *   STOCK      → C[(label)]    cylindre
 *   ACTION     → D(label)      arrondi
 *   DECISION   → E{label}      losange
 *   FLUX       → F[/label/]    parallélogramme
 *   CONTRAINTE → G[/label\]    trapèze (forme à 4 côtés inclinés)
 *   FRONTIERE  → H((label))    cercle
 * ───────────────────────────────────────────────────────────────────── */

function shapeFor(type: string, label: string): string {
  // Escape les caractères Mermaid problématiques dans les labels
  const safe = label.replace(/"/g, "&quot;").replace(/\n/g, " ");
  switch (type) {
    case "ACTEUR":
    case "ENTITE":
      return `["${safe}"]`;
    case "STOCK":
      return `[("${safe}")]`;
    case "ACTION":
      return `("${safe}")`;
    case "DECISION":
      return `{"${safe}"}`;
    case "FLUX":
      return `[/"${safe}"/]`;
    case "CONTRAINTE":
      // Mermaid trapèze : [/text\]
      return `[/"${safe}"\\]`;
    case "FRONTIERE":
      return `(("${safe}"))`;
    default:
      // Type inconnu (ex : un LLM invente "SOFTWARE") -> rectangle par defaut.
      // On ne casse jamais le rendu a cause d'une valeur hors enum.
      return `["${safe}"]`;
  }
}

/* ─────────────────────────────────────────────────────────────────────
 * Mapping EtatObjet → classDef Mermaid
 *
 * classDef = style CSS embed dans le code Mermaid. Couleurs alignées avec
 * la légende du proto `lugia_moteur_wsf_demo.html` :
 *   OPTIMAL          → vert
 *   FONCTIONNEL      → vert clair (neutre + bordure verte)
 *   DEGRADE          → ambre clair
 *   A_RISQUE         → rouge clair
 *   BLOQUE           → rouge foncé
 *   NON_DOCUMENTE    → gris (bordure pointillée)
 *   EN_TRANSFORMATION→ bleu clair
 *   INACTIF          → gris
 * ───────────────────────────────────────────────────────────────────── */

const ETAT_CLASS: Record<EtatObjet, { fill: string; stroke: string; color?: string }> = {
  // Palette de marque Lugia (charte produit) — états sobres, pas de
  // vert/ambre/rouge. Doit rester aligné avec src/wsf_render.py ETAT_COLORS.
  // Mapping moteur->charte : DEGRADE/EN_TRANSFORMATION->vigilance (olive),
  // A_RISQUE->risque (brun), BLOQUE->critique (terracotta),
  // NON_DOCUMENTE/INACTIF->nondoc (argent clair).
  OPTIMAL: { fill: "#EEEDEA", stroke: "#1A2333", color: "#1A2333" },
  FONCTIONNEL: { fill: "#EEEEEA", stroke: "#8E8E91", color: "#3A4360" },
  DEGRADE: { fill: "#EAE8DE", stroke: "#6B6630", color: "#6B6630" },
  A_RISQUE: { fill: "#E9E4DA", stroke: "#7A6030", color: "#7A6030" },
  BLOQUE: { fill: "#E9DED8", stroke: "#7A3320", color: "#7A3320" },
  NON_DOCUMENTE: { fill: "#F3F3EF", stroke: "#B5B5B8", color: "#6E7795" },
  EN_TRANSFORMATION: { fill: "#EAE8DE", stroke: "#6B6630", color: "#6B6630" },
  INACTIF: { fill: "#F3F3EF", stroke: "#B5B5B8", color: "#6E7795" },
};

function classDefLine(etat: string): string {
  // Etat inconnu (hors enum) -> on retombe sur FONCTIONNEL pour ne pas casser.
  const c = ETAT_CLASS[etat as EtatObjet] ?? ETAT_CLASS.FONCTIONNEL;
  const colorPart = c.color ? `,color:${c.color}` : "";
  // classDef etat_XXX fill:#fff,stroke:#000,stroke-width:1.5px
  const safeEtat = (ETAT_CLASS as Record<string, unknown>)[etat] ? etat : "FONCTIONNEL";
  return `classDef etat_${safeEtat} fill:${c.fill},stroke:${c.stroke},stroke-width:1.5px${colorPart}`;
}

/* ─────────────────────────────────────────────────────────────────────
 * Mapping force liaison → style de flèche Mermaid
 *
 *   force >= 0.7   → ==>   (épaisse, critique)
 *   force 0.3-0.7  → -->   (normale)
 *   force < 0.3    → -.->  (pointillée, faible)
 *
 * Label de la flèche = type de liaison en minuscule.
 * ───────────────────────────────────────────────────────────────────── */

function arrowFor(liaison: LiaisonWSF): string {
  const label = liaison.type.toLowerCase().replace(/_/g, " ");
  if (liaison.force >= 0.7) {
    return `==>|${label}|`;
  }
  if (liaison.force >= 0.3) {
    return `-->|${label}|`;
  }
  return `-.->|${label}|`;
}

/* ─────────────────────────────────────────────────────────────────────
 * Rendu principal
 * ───────────────────────────────────────────────────────────────────── */

export interface RenderOptions {
  /** Direction du flowchart : TD (top-down, défaut), LR, BT, RL. */
  direction?: "TD" | "LR" | "BT" | "RL";
  /** Si true, inclut un titre dans le diagramme via `title:` Mermaid. */
  includeTitle?: boolean;
}

/**
 * Convertit un GrapheWSF en code Mermaid prêt à passer à mermaid.render().
 *
 * Exemple de sortie :
 * ```
 * flowchart TD
 *   med["Médecin"]:::etat_FONCTIONNEL
 *   ia["Outil IA"]:::etat_A_RISQUE
 *   med ==>|utilise| ia
 *   classDef etat_FONCTIONNEL fill:#f0fdf4,stroke:#16a34a,...
 *   classDef etat_A_RISQUE fill:#fee2e2,stroke:#dc2626,...
 * ```
 */
export function graphToMermaid(
  graphe: GrapheWSF,
  options: RenderOptions = {}
): string {
  const direction = options.direction || "TD";
  const lines: string[] = [];

  if (options.includeTitle && graphe.titre) {
    // Mermaid supporte un titre via `---\ntitle: ...\n---` au début, mais
    // ça impose un parse strict. On l'omet pour l'instant (le titre est
    // affiché en HTML autour du SVG côté frontend).
  }

  lines.push(`flowchart ${direction}`);

  // 1. Déclaration des nœuds avec leur classe d'état
  for (const node of graphe.nodes) {
    const shape = shapeFor(node.type, node.label);
    // Etat inconnu -> FONCTIONNEL (coherent avec classDefLine ci-dessous)
    const etatClass = (ETAT_CLASS as Record<string, unknown>)[node.etat]
      ? node.etat
      : "FONCTIONNEL";
    lines.push(`  ${node.id}${shape}:::etat_${etatClass}`);
  }

  if (graphe.nodes.length > 0 && graphe.edges.length > 0) {
    lines.push("");
  }

  // 2. Liaisons
  for (const edge of graphe.edges) {
    const arrow = arrowFor(edge);
    lines.push(`  ${edge.source} ${arrow} ${edge.cible}`);
  }

  if (graphe.nodes.length > 0) {
    lines.push("");
  }

  // 3. classDef pour les états réellement présents (on évite les doublons).
  //    Les états inconnus sont normalises en FONCTIONNEL.
  const etatsUtilises = new Set<string>(
    graphe.nodes.map((n) =>
      (ETAT_CLASS as Record<string, unknown>)[n.etat] ? n.etat : "FONCTIONNEL"
    )
  );
  for (const etat of etatsUtilises) {
    lines.push(`  ${classDefLine(etat)}`);
  }

  return lines.join("\n");
}

/**
 * Helper : renvoie la liste unique des composantes WSF présentes dans le
 * graphe. Utile pour afficher un mini-récap "Ce schéma couvre : Participants,
 * Information, Processus, Produit" sous le diagramme.
 */
export function composantesPresentes(graphe: GrapheWSF): string[] {
  const set = new Set<string>();
  for (const n of graphe.nodes) set.add(n.composante);
  return Array.from(set);
}

/**
 * Helper : trouve les nœuds avec un état problématique (DEGRADE, A_RISQUE,
 * BLOQUE, NON_DOCUMENTE). Utile pour mettre en avant les points d'attention
 * dans la légende ou les annotations.
 */
export function nodesEnAlerte(graphe: GrapheWSF): ObjetWSF[] {
  return graphe.nodes.filter((n) =>
    ["DEGRADE", "A_RISQUE", "BLOQUE", "NON_DOCUMENTE"].includes(n.etat)
  );
}
