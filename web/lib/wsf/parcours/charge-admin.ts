/**
 * Substrat WSF du parcours pilote « Charge administrative d'une consultation ».
 *
 * Matérialise la section §8 de `resources/methode/lugia_modelisations_graphiques_spec.md`
 * (pivot D-056). Sert de fixture de référence aux trois renderers de parcours
 * (logigramme = render-mermaid, ruban = render-ruban, mini-carto = render-carto).
 *
 * Le produit analyse le SYSTÈME DE TRAVAIL, pas l'acte de soin. Aucune donnée
 * patient identifiable n'apparaît dans ce graphe.
 *
 * Convention de maturité (jumeau) : un objet/liaison inféré porte
 * `metadata.maturite = "INFERE"` → rendu atténué (opacité) dans les vues.
 */

import type { GrapheWSF } from "../types";

export const PARCOURS_CHARGE_ADMIN: GrapheWSF = {
  id: "parcours_charge_admin",
  titre: "Charge administrative d'une consultation",
  description:
    "Travail administratif rattaché à une consultation, de la fin de l'acte clinique à la clôture du dossier.",
  metadata: { secteur: "medecin_generaliste", palier: "demo", pilote: true },
  nodes: [
    { id: "med", composante: "PARTICIPANT", type: "ACTEUR", label: "Médecin", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
    { id: "secr", composante: "PARTICIPANT", type: "ACTEUR", label: "Secrétariat", etat: "NON_DOCUMENTE", criticite: "IMPORTANT", metadata: { maturite: "INFERE" } },
    { id: "dpi", composante: "TECHNOLOGIE", type: "ENTITE", label: "Logiciel métier", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
    { id: "tla", composante: "TECHNOLOGIE", type: "ENTITE", label: "Lecteur Vitale", etat: "FONCTIONNEL", criticite: "IMPORTANT" },
    { id: "regle_cot", composante: "STRATEGIE", type: "CONTRAINTE", label: "Règles de cotation", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
    { id: "cotation", composante: "PROCESSUS", type: "ACTION", label: "Cotation de l'acte", etat: "A_RISQUE", criticite: "CRITIQUE" },
    { id: "fse", composante: "INFORMATION", type: "ENTITE", label: "Feuille de soins", etat: "FONCTIONNEL", criticite: "CRITIQUE", sensibilite: "MODEREE" },
    { id: "teletrans", composante: "PROCESSUS", type: "ACTION", label: "Télétransmission", etat: "FONCTIONNEL", criticite: "CRITIQUE" },
    { id: "payeur", composante: "ENVIRONNEMENT", type: "FRONTIERE", label: "Assurance maladie", etat: "FONCTIONNEL", criticite: "IMPORTANT" },
    { id: "rejet", composante: "PROCESSUS", type: "DECISION", label: "Retour payeur ?", etat: "A_RISQUE", criticite: "IMPORTANT" },
    { id: "suivi_rejet", composante: "PROCESSUS", type: "ACTION", label: "Reprise du rejet", etat: "DEGRADE", criticite: "IMPORTANT" },
    { id: "encaiss", composante: "PROCESSUS", type: "ACTION", label: "Encaissement", etat: "FONCTIONNEL", criticite: "STANDARD" },
    { id: "docs", composante: "PRODUIT", type: "FLUX", label: "Documents associés", etat: "DEGRADE", criticite: "IMPORTANT" },
    { id: "maj_dossier", composante: "PROCESSUS", type: "ACTION", label: "Mise à jour du dossier", etat: "NON_DOCUMENTE", criticite: "IMPORTANT" },
    { id: "dossier", composante: "INFORMATION", type: "STOCK", label: "Dossier patient", etat: "FONCTIONNEL", criticite: "CRITIQUE", sensibilite: "ELEVEE" },
  ],
  edges: [
    { id: "e1", source: "med", cible: "dpi", type: "UTILISE", force: 0.8, delai: "IMMEDIAT" },
    { id: "e2", source: "med", cible: "tla", type: "UTILISE", force: 0.6, delai: "IMMEDIAT" },
    { id: "e3", source: "regle_cot", cible: "cotation", type: "CONTRAINT", force: 0.7, delai: "IMMEDIAT" },
    { id: "e4", source: "cotation", cible: "fse", type: "PRODUIT", force: 0.8, delai: "IMMEDIAT" },
    { id: "e5", source: "fse", cible: "teletrans", type: "ALIMENTE", force: 0.9, delai: "IMMEDIAT" },
    { id: "e6", source: "tla", cible: "teletrans", type: "SUPPORTE", force: 0.6, delai: "IMMEDIAT" },
    { id: "e7", source: "teletrans", cible: "payeur", type: "INTERFACE", force: 0.8, delai: "COURT_TERME" },
    { id: "e8", source: "payeur", cible: "rejet", type: "INTERFACE", force: 0.6, delai: "COURT_TERME" },
    { id: "e9", source: "rejet", cible: "suivi_rejet", type: "ALIMENTE", force: 0.5, delai: "COURT_TERME", caractere: "CONDITIONNEL", condition: "rejeté" },
    { id: "e10", source: "rejet", cible: "encaiss", type: "ALIMENTE", force: 0.7, delai: "IMMEDIAT", caractere: "CONDITIONNEL", condition: "accepté" },
    { id: "e11", source: "suivi_rejet", cible: "teletrans", type: "ALIMENTE", force: 0.3, delai: "COURT_TERME" },
    { id: "e12", source: "med", cible: "docs", type: "PRODUIT", force: 0.7, delai: "IMMEDIAT" },
    { id: "e13", source: "med", cible: "maj_dossier", type: "PRODUIT", force: 0.6, delai: "IMMEDIAT" },
    { id: "e14", source: "maj_dossier", cible: "dossier", type: "TRANSFORME", force: 0.7, delai: "IMMEDIAT" },
    { id: "e15", source: "docs", cible: "dossier", type: "DELIVRE", force: 0.5, delai: "IMMEDIAT" },
  ],
};

export default PARCOURS_CHARGE_ADMIN;
