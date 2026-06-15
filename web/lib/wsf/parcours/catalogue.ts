/**
 * Catalogue v1 des micro-parcours par métier (pivot D-056, spec §10).
 *
 * La précision du libellé conditionne la qualité de la modélisation : chaque
 * entrée nomme UN moment de travail précis, borné dans le temps et l'espace
 * du cabinet (pas « parcours patient » mais « charge admin d'une consultation »).
 *
 * En V1 démo, seul le pilote est modélisable directement (fixture en dur). Les
 * autres passeront par le dialogue IA de modélisation (à venir) ; ils sont
 * listés mais marqués `disponible: false`.
 */

import type { GrapheWSF } from "../types";
import { PARCOURS_CHARGE_ADMIN } from "./charge-admin";

export type Palier = "demo" | "work_system";

export interface MicroParcours {
  id: string;
  label: string;
  /** Cœur WSF dominant — repère éditorial, pas une contrainte moteur. */
  coeur: string;
  palier: Palier;
  /** Modélisable maintenant (fixture dispo) ou via dialogue à venir. */
  disponible: boolean;
  /** id du « module » côté backend chat (mode parcours), si modélisable. */
  moduleId?: string;
  /** Facette du check-up à laquelle ce parcours se rattache (pour la suggestion). */
  facet?: "processes" | "participants" | "information";
}

/** Catalogue médecin généraliste — 10 micro-parcours (spec §10.1). */
export const CATALOGUE_MEDECIN: MicroParcours[] = [
  { id: "accueil_avant_rdv", label: "Accueil des patients avant un rendez-vous programmé", coeur: "Participant · Processus", facet: "participants", palier: "demo", disponible: true, moduleId: "parcours_accueil_avant_rdv" },
  { id: "charge_admin", label: "Charge administrative d'une consultation", coeur: "Processus · Technologie · Information", facet: "processes", palier: "demo", disponible: true, moduleId: "parcours_charge_admin" },
  { id: "suivi_chronique", label: "Suivi d'un patient chronique entre deux consultations", coeur: "Information · Processus", facet: "information", palier: "demo", disponible: true, moduleId: "parcours_suivi_chronique" },
  { id: "urgence_jour", label: "Gestion des demandes d'urgence non programmées du jour", coeur: "Processus · Décision", facet: "processes", palier: "demo", disponible: true, moduleId: "parcours_urgence_jour" },
  { id: "resultats_examens", label: "Traitement des résultats d'examens reçus", coeur: "Information · Flux", facet: "information", palier: "demo", disponible: true, moduleId: "parcours_resultats_examens" },
  { id: "renouvellement_ordo", label: "Renouvellement d'ordonnance hors consultation", coeur: "Processus · Contrainte", facet: "processes", palier: "demo", disponible: true, moduleId: "parcours_renouvellement_ordo" },
  { id: "coordination_correspondant", label: "Coordination avec un correspondant (adressage, retour)", coeur: "Interface · Information", facet: "information", palier: "work_system", disponible: true, moduleId: "parcours_coordination_correspondant" },
  { id: "appels_entrants", label: "Gestion des appels téléphoniques entrants en journée", coeur: "Participant · Flux", facet: "participants", palier: "demo", disponible: true, moduleId: "parcours_appels_entrants" },
  { id: "cloture_jour", label: "Clôture financière de fin de journée", coeur: "Processus · Information", facet: "processes", palier: "work_system", disponible: true, moduleId: "parcours_cloture_jour" },
  { id: "integration_remplacant", label: "Intégration d'un remplaçant ou d'un nouvel associé", coeur: "Participant · Stratégie", facet: "participants", palier: "work_system", disponible: true, moduleId: "parcours_integration_remplacant" },
];

/** Substrats disponibles (fixtures) indexés par id de micro-parcours. */
export const PARCOURS_FIXTURES: Record<string, GrapheWSF> = {
  charge_admin: PARCOURS_CHARGE_ADMIN,
};

/** Catalogue avocat — amorce (spec §10.2). Modélisation par dialogue à venir. */
export const CATALOGUE_AVOCAT: MicroParcours[] = [
  { id: "ouverture_dossier", label: "Ouverture d'un dossier client (conflits d'intérêts, mandat)", coeur: "Processus · Conformité", palier: "demo", disponible: false },
  { id: "prep_audience", label: "Préparation d'une audience", coeur: "Cœur métier · Information", palier: "demo", disponible: false },
  { id: "facturation_temps", label: "Facturation au temps passé et suivi des règlements", coeur: "Finance · Processus", palier: "demo", disponible: false },
  { id: "echeances_procedure", label: "Gestion des échéances de procédure", coeur: "Processus · Décision", palier: "demo", disponible: false },
  { id: "archivage_dossier", label: "Archivage et clôture d'un dossier", coeur: "Information · Conformité", palier: "work_system", disponible: false },
];

/** Catalogue kiné — amorce (spec §10.2). Modélisation par dialogue à venir. */
export const CATALOGUE_KINE: MicroParcours[] = [
  { id: "bilan_initial", label: "Bilan initial et plan de soin d'un nouveau patient", coeur: "Cœur métier · Information", palier: "demo", disponible: false },
  { id: "enchainement_seances", label: "Enchaînement des séances d'une journée", coeur: "Processus · Participant", palier: "demo", disponible: false },
  { id: "teletrans_mutuelle", label: "Télétransmission et suivi de la part mutuelle", coeur: "Finance · Processus", palier: "demo", disponible: false },
  { id: "reevaluation_fin", label: "Réévaluation et fin de prise en charge", coeur: "Cœur métier · Décision", palier: "work_system", disponible: false },
];

/** Catalogues par secteur. La grammaire des 3 vues est identique ; seul le
 *  catalogue est sectoriel (médecin opérationnel ; avocat/kiné en amorce). */
export const CATALOGUES: Record<string, MicroParcours[]> = {
  medecin_generaliste: CATALOGUE_MEDECIN,
  avocat: CATALOGUE_AVOCAT,
  kine: CATALOGUE_KINE,
};


/** Suggère le micro-parcours à creuser en premier, à partir du footprint du
 *  questionnaire : on prend le parcours disponible rattaché à la facette la
 *  plus faible (niveau le plus élevé = le plus à risque). Heuristique simple
 *  (spec §13.1) ; l'IA suggère, le médecin tranche. */
export function suggestParcours(
  facetLevels: Partial<Record<"processes" | "participants" | "information", number | null | undefined>>,
): string {
  const avail = CATALOGUE_MEDECIN.filter((p) => p.disponible);
  let best = avail[0]?.id ?? CATALOGUE_MEDECIN[0].id;
  let bestLevel = -1;
  for (const p of avail) {
    const lvl = p.facet ? facetLevels[p.facet] : null;
    if (typeof lvl === "number" && lvl > bestLevel) {
      bestLevel = lvl;
      best = p.id;
    }
  }
  return best;
}
