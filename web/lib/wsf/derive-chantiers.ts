/**
 * Dérivation des chantiers à partir d'un parcours modélisé (pivot D-056, §12).
 *
 * Les zones de fragilité du graphe (objets en état dégradé / à risque / bloqué
 * / non documenté) deviennent les chantiers ANCRÉS dans le parcours — par
 * opposition aux chantiers génériques issus directement du questionnaire.
 *
 * Démo : on expose l'intitulé + l'observation (teaser). Le plan d'action
 * détaillé et le lancement sont réservés à l'abonnement (verrou côté UI).
 *
 * Dérivation déterministe (pas d'appel LLM) : honnête et reproductible.
 */

import type { GrapheWSF, EtatObjet } from "./types";

const FRAGILE_SEVERITE: Partial<Record<EtatObjet, number>> = {
  BLOQUE: 5,
  A_RISQUE: 4,
  DEGRADE: 3,
  NON_DOCUMENTE: 2,
};

const CRIT_POIDS: Record<string, number> = {
  CRITIQUE: 4,
  IMPORTANT: 3,
  STANDARD: 2,
  PERIPHERIQUE: 1,
};

const VERBE: Partial<Record<EtatObjet, string>> = {
  BLOQUE: "Débloquer",
  A_RISQUE: "Fiabiliser",
  DEGRADE: "Fluidifier",
  NON_DOCUMENTE: "Formaliser",
};

const ETAT_LISIBLE: Partial<Record<EtatObjet, string>> = {
  BLOQUE: "bloque le déroulé du parcours",
  A_RISQUE: "présente un risque identifié",
  DEGRADE: "fonctionne en mode dégradé",
  NON_DOCUMENTE: "n'est pas formalisé",
};

export interface ChantierDerive {
  id: string;
  titre: string;
  observation: string;
  etat: EtatObjet;
}

/** Dérive 2-3 chantiers prioritaires des fragilités du parcours. */
export function deriveChantiers(graph: GrapheWSF, max = 3): ChantierDerive[] {
  const fragiles = (graph.nodes ?? []).filter(
    (n) => FRAGILE_SEVERITE[n.etat as EtatObjet] != null,
  );
  fragiles.sort(
    (a, b) =>
      (FRAGILE_SEVERITE[b.etat as EtatObjet] ?? 0) - (FRAGILE_SEVERITE[a.etat as EtatObjet] ?? 0) ||
      (CRIT_POIDS[b.criticite] ?? 0) - (CRIT_POIDS[a.criticite] ?? 0),
  );
  return fragiles.slice(0, max).map((n) => ({
    id: n.id,
    titre: `${VERBE[n.etat as EtatObjet] ?? "Renforcer"} : ${n.label}`,
    observation: `« ${n.label} » ${ETAT_LISIBLE[n.etat as EtatObjet] ?? "demande de l'attention"} dans ce parcours.`,
    etat: n.etat,
  }));
}

export default deriveChantiers;
