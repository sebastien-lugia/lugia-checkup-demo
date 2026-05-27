/**
 * Graphes WSF prédéfinis par chantier — version statique du Checkup Demo.
 *
 * Chaque chantier du catalogue (web/lib/v3/opps_catalog.ts) a un graphe WSF
 * simplifié écrit en dur. Affiché directement sur la page module, sous le
 * plan d'action, sans appel LLM (zéro latence, qualité garantie, uniformité).
 *
 * Convention : chaque graphe contient 5-6 nœuds dont 1-2 en état problématique
 * (DEGRADE / NON_DOCUMENTE / A_RISQUE / INACTIF) — c'est « l'irritant » que le
 * chantier vient résoudre. Le chat assistant (tour 4) produit ensuite une
 * version enrichie et personnalisée selon les réponses du médecin (D-041,
 * jumeau vivant à venir).
 *
 * Cf `resources/vision/lugia_moteur_wsf_specification.md`.
 */

import type { GrapheWSF } from "./types";

const GRAPHES: Record<string, GrapheWSF> = {
  // ─── Axe B — Rituel de communication d'équipe ───
  comm: {
    titre: "Communication d'équipe",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
      { id: "sec", composante: "PARTICIPANT", type: "ACTEUR", label: "Secrétaire", etat: "FONCTIONNEL", criticite: "IMPORTANT" },
      { id: "coord", composante: "PROCESSUS", type: "ACTION", label: "Coordination quotidienne", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
      { id: "infos", composante: "INFORMATION", type: "STOCK", label: "Infos du jour", etat: "DEGRADE", criticite: "STANDARD" },
      { id: "continuite", composante: "PRODUIT", type: "FLUX", label: "Continuité de service", etat: "DEGRADE", criticite: "IMPORTANT" },
    ],
    edges: [
      { id: "e1", source: "med", cible: "coord", type: "UTILISE", force: 0.7, delai: "IMMEDIAT" },
      { id: "e2", source: "sec", cible: "coord", type: "UTILISE", force: 0.7, delai: "IMMEDIAT" },
      { id: "e3", source: "infos", cible: "coord", type: "ALIMENTE", force: 0.6, delai: "IMMEDIAT" },
      { id: "e4", source: "coord", cible: "continuite", type: "PRODUIT", force: 0.8, delai: "COURT_TERME" },
    ],
  },

  // ─── Axe B — Déléguer les tâches non médicales ───
  delegation: {
    titre: "Délégation des tâches",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "A_RISQUE", criticite: "CRITIQUE" },
      { id: "equipe", composante: "PARTICIPANT", type: "ACTEUR", label: "Équipe", etat: "INACTIF", criticite: "IMPORTANT" },
      { id: "perimetre", composante: "INFORMATION", type: "ENTITE", label: "Périmètre de délégation", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
      { id: "taches", composante: "PROCESSUS", type: "ACTION", label: "Tâches non médicales", etat: "DEGRADE", criticite: "STANDARD" },
      { id: "temps", composante: "PRODUIT", type: "FLUX", label: "Temps médical", etat: "DEGRADE", criticite: "CRITIQUE" },
    ],
    edges: [
      { id: "e1", source: "med", cible: "taches", type: "UTILISE", force: 0.8, delai: "IMMEDIAT" },
      { id: "e2", source: "perimetre", cible: "equipe", type: "ORIENTE", force: 0.6, delai: "MOYEN_TERME" },
      { id: "e3", source: "equipe", cible: "taches", type: "UTILISE", force: 0.3, delai: "IMMEDIAT" },
      { id: "e4", source: "taches", cible: "temps", type: "PRODUIT", force: 0.7, delai: "COURT_TERME" },
    ],
  },

  // ─── Axe C — Optimiser le logiciel médical ───
  logiciel: {
    titre: "Optimisation du logiciel",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
      { id: "logiciel", composante: "TECHNOLOGIE", type: "ENTITE", label: "Logiciel médical", etat: "INACTIF", criticite: "IMPORTANT" },
      { id: "modeles", composante: "INFORMATION", type: "STOCK", label: "Modèles de documents", etat: "NON_DOCUMENTE", criticite: "STANDARD" },
      { id: "redac", composante: "PROCESSUS", type: "ACTION", label: "Rédaction", etat: "DEGRADE", criticite: "IMPORTANT" },
      { id: "docs", composante: "PRODUIT", type: "FLUX", label: "Documents produits", etat: "FONCTIONNEL", criticite: "IMPORTANT" },
    ],
    edges: [
      { id: "e1", source: "med", cible: "logiciel", type: "UTILISE", force: 0.5, delai: "IMMEDIAT" },
      { id: "e2", source: "logiciel", cible: "modeles", type: "TRANSFORME", force: 0.4, delai: "IMMEDIAT" },
      { id: "e3", source: "modeles", cible: "redac", type: "ALIMENTE", force: 0.6, delai: "IMMEDIAT" },
      { id: "e4", source: "redac", cible: "docs", type: "PRODUIT", force: 0.7, delai: "COURT_TERME" },
    ],
  },

  // ─── Axe A — Structurer le suivi des chroniques ───
  chroniques: {
    titre: "Suivi des chroniques",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
      { id: "patients", composante: "CLIENT", type: "ACTEUR", label: "Patients chroniques", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
      { id: "fileactive", composante: "INFORMATION", type: "STOCK", label: "File active", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
      { id: "suivi", composante: "PROCESSUS", type: "ACTION", label: "Suivi programmé", etat: "DEGRADE", criticite: "IMPORTANT" },
      { id: "rappels", composante: "PRODUIT", type: "FLUX", label: "Rappels de suivi", etat: "INACTIF", criticite: "STANDARD" },
    ],
    edges: [
      { id: "e1", source: "fileactive", cible: "suivi", type: "ALIMENTE", force: 0.7, delai: "IMMEDIAT" },
      { id: "e2", source: "med", cible: "suivi", type: "UTILISE", force: 0.8, delai: "IMMEDIAT" },
      { id: "e3", source: "suivi", cible: "rappels", type: "PRODUIT", force: 0.5, delai: "COURT_TERME" },
      { id: "e4", source: "rappels", cible: "patients", type: "DELIVRE", force: 0.6, delai: "MOYEN_TERME" },
    ],
  },

  // ─── Axe A — Organiser les urgences du jour ───
  urgences: {
    titre: "Urgences du jour",
    nodes: [
      { id: "sec", composante: "PARTICIPANT", type: "ACTEUR", label: "Secrétaire", etat: "FONCTIONNEL", criticite: "IMPORTANT" },
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "A_RISQUE", criticite: "CRITIQUE" },
      { id: "tri", composante: "PROCESSUS", type: "DECISION", label: "Tri des urgences", etat: "NON_DOCUMENTE", criticite: "CRITIQUE" },
      { id: "creneaux", composante: "INFORMATION", type: "ENTITE", label: "Créneaux dédiés", etat: "A_RISQUE", criticite: "IMPORTANT" },
      { id: "prise", composante: "PRODUIT", type: "FLUX", label: "Prise en charge", etat: "DEGRADE", criticite: "CRITIQUE" },
    ],
    edges: [
      { id: "e1", source: "sec", cible: "tri", type: "UTILISE", force: 0.6, delai: "IMMEDIAT" },
      { id: "e2", source: "creneaux", cible: "tri", type: "ALIMENTE", force: 0.5, delai: "IMMEDIAT" },
      { id: "e3", source: "med", cible: "tri", type: "UTILISE", force: 0.7, delai: "IMMEDIAT" },
      { id: "e4", source: "tri", cible: "prise", type: "PRODUIT", force: 0.8, delai: "IMMEDIAT" },
    ],
  },

  // ─── Axe C — Réduire la charge administrative ───
  admin: {
    titre: "Charge administrative",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "A_RISQUE", criticite: "CRITIQUE" },
      { id: "logiciel", composante: "TECHNOLOGIE", type: "ENTITE", label: "Outils numériques", etat: "INACTIF", criticite: "STANDARD" },
      { id: "admin", composante: "PROCESSUS", type: "ACTION", label: "Tâches administratives", etat: "DEGRADE", criticite: "IMPORTANT" },
      { id: "docs", composante: "INFORMATION", type: "STOCK", label: "Documents administratifs", etat: "DEGRADE", criticite: "STANDARD" },
      { id: "clinique", composante: "PRODUIT", type: "FLUX", label: "Temps clinique", etat: "DEGRADE", criticite: "CRITIQUE" },
    ],
    edges: [
      { id: "e1", source: "med", cible: "admin", type: "UTILISE", force: 0.8, delai: "IMMEDIAT" },
      { id: "e2", source: "docs", cible: "admin", type: "ALIMENTE", force: 0.6, delai: "IMMEDIAT" },
      { id: "e3", source: "logiciel", cible: "admin", type: "SUPPORTE", force: 0.3, delai: "IMMEDIAT" },
      { id: "e4", source: "admin", cible: "clinique", type: "PRODUIT", force: 0.7, delai: "COURT_TERME" },
    ],
  },

  // ─── Axe C — Pilotage simple de l'activité ───
  pilotage: {
    titre: "Pilotage de l'activité",
    nodes: [
      { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
      { id: "stats", composante: "TECHNOLOGIE", type: "ENTITE", label: "Module statistiques", etat: "INACTIF", criticite: "STANDARD" },
      { id: "indic", composante: "INFORMATION", type: "STOCK", label: "Indicateurs clés", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
      { id: "revue", composante: "PROCESSUS", type: "ACTION", label: "Revue régulière", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
      { id: "decisions", composante: "PRODUIT", type: "FLUX", label: "Décisions éclairées", etat: "DEGRADE", criticite: "IMPORTANT" },
    ],
    edges: [
      { id: "e1", source: "stats", cible: "indic", type: "TRANSFORME", force: 0.4, delai: "IMMEDIAT" },
      { id: "e2", source: "indic", cible: "revue", type: "ALIMENTE", force: 0.6, delai: "IMMEDIAT" },
      { id: "e3", source: "med", cible: "revue", type: "UTILISE", force: 0.7, delai: "IMMEDIAT" },
      { id: "e4", source: "revue", cible: "decisions", type: "PRODUIT", force: 0.8, delai: "MOYEN_TERME" },
    ],
  },
};

/**
 * Récupère le graphe WSF statique d'un chantier par son id.
 * Renvoie null si le chantier n'a pas de graphe prédéfini.
 */
export function getChantierGraphe(id: string): GrapheWSF | null {
  return GRAPHES[id] ?? null;
}
