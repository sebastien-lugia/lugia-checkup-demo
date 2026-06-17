/**
 * Mise en couches (longest-path) robuste aux cycles.
 *
 * Les parcours réels contiennent des boucles (ex. reprise d'un rejet qui
 * repart en télétransmission). Un longest-path naïf diverge sur un cycle.
 * On retire d'abord les arêtes « retour » (back edges, via DFS), puis on
 * calcule les couches sur le DAG résultant. Déterministe.
 */

type Edge = { source: string; cible: string };

export function layeringAcyclic(nodeIds: string[], edges: Edge[]): Map<string, number> {
  const ids = new Set(nodeIds);
  const E = edges.filter((e) => ids.has(e.source) && ids.has(e.cible));

  const adj = new Map<string, Edge[]>();
  nodeIds.forEach((id) => adj.set(id, []));
  E.forEach((e) => adj.get(e.source)!.push(e));

  // DFS : marque les arêtes retour (cible sur la pile courante).
  const color = new Map<string, number>(); // 0 inconnu, 1 en cours, 2 fini
  const back = new Set<Edge>();
  const visit = (u: string) => {
    color.set(u, 1);
    for (const e of adj.get(u)!) {
      const c = color.get(e.cible) ?? 0;
      if (c === 1) back.add(e);
      else if (c === 0) visit(e.cible);
    }
    color.set(u, 2);
  };
  nodeIds.forEach((id) => {
    if (!color.get(id)) visit(id);
  });

  const dag = E.filter((e) => !back.has(e));
  const layer = new Map<string, number>(nodeIds.map((id) => [id, 0]));
  for (let i = 0; i < nodeIds.length; i++) {
    let changed = false;
    for (const e of dag) {
      const cand = (layer.get(e.source) ?? 0) + 1;
      if (cand > (layer.get(e.cible) ?? 0)) {
        layer.set(e.cible, cand);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return layer;
}
