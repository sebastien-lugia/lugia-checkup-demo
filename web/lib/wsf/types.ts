/**
 * Moteur WSF générique — types de base.
 *
 * Fondation réutilisable du moteur Work System Framework (Alter 2013-2025).
 * AUCUNE sémantique métier ici — les secteurs (Doctor, Lawyer, Finance…)
 * sont des instances de ce moteur, jamais des exceptions à ce moteur.
 *
 * Le test de validation : un développeur qui lit ce fichier doit pouvoir
 * construire Lugia Doctor, Lugia Lawyer ou Lugia Finance sans modifier une
 * seule règle — uniquement en fournissant des données d'instanciation.
 *
 * Cf `lugia_moteur_wsf_specification.md` pour la spec complète (D-041).
 */

/* ─────────────────────────────────────────────────────────────────────
 * 1. LES 9 COMPOSANTES WSF (enum fermé — immuable)
 * ───────────────────────────────────────────────────────────────────── */

export const COMPOSANTES_WSF = [
  "PARTICIPANT",     // qui fait le travail
  "INFORMATION",     // ce qui est traité/produit
  "TECHNOLOGIE",     // les outils
  "PROCESSUS",       // comment le travail est fait
  "INFRASTRUCTURE",  // ressources partagées
  "STRATEGIE",       // orientations, objectifs
  "ENVIRONNEMENT",   // contexte externe (frontière du système)
  "PRODUIT",         // outputs (produits/services)
  "CLIENT",          // bénéficiaires de la valeur
] as const;

export type ComposanteWSF = (typeof COMPOSANTES_WSF)[number];

/* ─────────────────────────────────────────────────────────────────────
 * 2. TYPES D'OBJETS (forme structurelle, indépendante du secteur)
 *    Détermine la forme Mermaid au rendu.
 * ───────────────────────────────────────────────────────────────────── */

export const TYPES_OBJET = [
  "ACTEUR",      // un humain ou un rôle — rectangle (en flowchart)
  "ENTITE",      // un objet de données — rectangle
  "STOCK",       // une base, un réservoir — cylindre
  "ACTION",      // une étape de processus — arrondi
  "DECISION",    // un point de choix — losange
  "FLUX",        // une entrée/sortie — parallélogramme
  "CONTRAINTE",  // une règle, une limite — trapèze
  "FRONTIERE",   // limite du système — cercle
] as const;

export type TypeObjet = (typeof TYPES_OBJET)[number];

/* ─────────────────────────────────────────────────────────────────────
 * 3. ÉTATS D'UN OBJET (santé)
 *    Cœur de la lecture de "santé du système de travail".
 * ───────────────────────────────────────────────────────────────────── */

export const ETATS_OBJET = [
  "OPTIMAL",            // fonctionne au mieux
  "FONCTIONNEL",        // fonctionne correctement
  "DEGRADE",            // fonctionne mais sous-optimal
  "A_RISQUE",           // exposition identifiée
  "BLOQUE",             // empêche le flux
  "NON_DOCUMENTE",      // existe mais non formalisé
  "EN_TRANSFORMATION",  // en cours de chantier
  "INACTIF",            // présent mais non utilisé
] as const;

export type EtatObjet = (typeof ETATS_OBJET)[number];

/** Score numérique d'un état (utilisé pour le score de santé global). */
export const ETAT_SCORE: Record<EtatObjet, number> = {
  OPTIMAL: 1.0,
  FONCTIONNEL: 0.8,
  EN_TRANSFORMATION: 0.6,
  DEGRADE: 0.5,
  INACTIF: 0.5,
  NON_DOCUMENTE: 0.4,
  A_RISQUE: 0.3,
  BLOQUE: 0.0,
};

/* ─────────────────────────────────────────────────────────────────────
 * 4. CRITICITÉ (importance dans le système)
 * ───────────────────────────────────────────────────────────────────── */

export const CRITICITES = [
  "CRITIQUE",       // sa défaillance arrête le système
  "IMPORTANT",      // sa défaillance dégrade fortement
  "STANDARD",       // sa défaillance a un impact modéré
  "PERIPHERIQUE",   // sa défaillance a peu d'impact
] as const;

export type Criticite = (typeof CRITICITES)[number];

/** Poids de la criticité dans le score de santé global. */
export const CRITICITE_POIDS: Record<Criticite, number> = {
  CRITIQUE: 4,
  IMPORTANT: 3,
  STANDARD: 2,
  PERIPHERIQUE: 1,
};

/* ─────────────────────────────────────────────────────────────────────
 * 5. SENSIBILITÉ (objets INFORMATION uniquement)
 * ───────────────────────────────────────────────────────────────────── */

export const SENSIBILITES = [
  "CRITIQUE",   // identifiant direct, donnée ultra-sensible
  "ELEVEE",     // identifiant indirect
  "MODEREE",    // donnée métier sensible
  "STANDARD",   // donnée métier courante
  "PUBLIQUE",   // aucune protection requise
] as const;

export type Sensibilite = (typeof SENSIBILITES)[number];

/* ─────────────────────────────────────────────────────────────────────
 * 6. OBJET (nœud du graphe)
 *
 * Tout élément d'un système de travail est un objet typé. Un objet n'a
 * jamais de sémantique métier dans le moteur — seulement un type WSF.
 * Le contenu métier est porté par `label` (instancié par secteur).
 * ───────────────────────────────────────────────────────────────────── */

export type ObjetMetadata = Record<string, unknown>;

export interface ObjetWSF {
  /** Identifiant unique (ex: "obj_a3f5c8"). */
  id: string;
  /** Composante WSF (l'une des 9). */
  composante: ComposanteWSF;
  /** Type structurel (l'un des 8). Détermine la forme Mermaid. */
  type: TypeObjet;
  /** Contenu métier instancié (ex: "Médecin", "Logiciel DPI"). */
  label: string;
  /** Santé actuelle de l'objet. */
  etat: EtatObjet;
  /** Importance dans le système. */
  criticite: Criticite;
  /** Sensibilité (uniquement si composante === "INFORMATION"). */
  sensibilite?: Sensibilite | null;
  /** Extension sectorielle libre (ex: { logiciel_metier: "Doctolib" }). */
  metadata?: ObjetMetadata;
}

/* ─────────────────────────────────────────────────────────────────────
 * 7. LIAISON (arc du graphe)
 * ───────────────────────────────────────────────────────────────────── */

export const TYPES_LIAISON = [
  "UTILISE",      // PARTICIPANT → TECHNOLOGIE
  "PRODUIT",      // PROCESSUS → INFORMATION/PRODUIT
  "CONSOMME",     // PROCESSUS → INFORMATION
  "TRANSFORME",   // PROCESSUS/TECHNOLOGIE → INFORMATION
  "CONTRAINT",   // STRATEGIE/ENVIRONNEMENT → PROCESSUS/TECHNOLOGIE
  "SUPPORTE",     // INFRASTRUCTURE → PARTICIPANT/TECHNOLOGIE/PROCESSUS
  "ALIMENTE",     // INFORMATION → PROCESSUS
  "DELIVRE",      // PRODUIT → CLIENT
  "ORIENTE",      // STRATEGIE → PROCESSUS/PARTICIPANT
  "INTERFACE",    // Output d'un WSF → Input d'un autre WSF
  "REMPLACE",    // un objet remplace un autre (transformation)
] as const;

export type TypeLiaison = (typeof TYPES_LIAISON)[number];

export const DELAIS = [
  "IMMEDIAT",      // facteur 1.0
  "COURT_TERME",   // jours/semaines — facteur 0.7
  "MOYEN_TERME",   // mois — facteur 0.4
  "LONG_TERME",    // trimestres/années — facteur 0.2
] as const;

export type Delai = (typeof DELAIS)[number];

export const DELAI_FACTEUR: Record<Delai, number> = {
  IMMEDIAT: 1.0,
  COURT_TERME: 0.7,
  MOYEN_TERME: 0.4,
  LONG_TERME: 0.2,
};

export const CARACTERES_LIAISON = [
  "OBLIGATOIRE",
  "OPTIONNEL",
  "CONDITIONNEL",
] as const;

export type CaractereLiaison = (typeof CARACTERES_LIAISON)[number];

export type SensLiaison = "UNIDIRECTIONNEL" | "BIDIRECTIONNEL";

export interface LiaisonWSF {
  /** Identifiant unique. */
  id: string;
  /** ID de l'objet source. */
  source: string;
  /** ID de l'objet cible. */
  cible: string;
  /** Type de liaison (l'un des 11). */
  type: TypeLiaison;
  /** Sens de propagation (par défaut unidirectionnel). */
  sens?: SensLiaison;
  /** Intensité causale [0.0 — 1.0]. */
  force: number;
  /** Délai de propagation d'un changement. */
  delai: Delai;
  /** Caractère de la liaison. */
  caractere?: CaractereLiaison;
  /** Condition explicite si caractere === "CONDITIONNEL". */
  condition?: string | null;
}

/* ─────────────────────────────────────────────────────────────────────
 * 8. GRAPHE WSF (collection d'objets et liaisons)
 *
 * Représente un système de travail complet OU un sous-système
 * (ex : un chantier dans le contexte du checkup demo).
 * ───────────────────────────────────────────────────────────────────── */

export interface GrapheWSF {
  /** Identifiant du graphe (optionnel — utile pour persister). */
  id?: string;
  /** Titre humain du graphe (ex : "Chantier rituel communication d'équipe"). */
  titre?: string;
  /** Description courte du contexte. */
  description?: string;
  /** Objets du graphe. */
  nodes: ObjetWSF[];
  /** Liaisons entre objets. */
  edges: LiaisonWSF[];
  /** Métadonnées libres (secteur d'instanciation, version, etc.). */
  metadata?: ObjetMetadata;
}

/* ─────────────────────────────────────────────────────────────────────
 * 9. UTILS — fabriques minimales pour les usages courants
 * ───────────────────────────────────────────────────────────────────── */

/** Crée un objet WSF avec valeurs par défaut sensées. */
export function makeObjet(
  partial: Partial<ObjetWSF> & Pick<ObjetWSF, "id" | "composante" | "type" | "label">
): ObjetWSF {
  return {
    etat: "FONCTIONNEL",
    criticite: "STANDARD",
    sensibilite: null,
    metadata: undefined,
    ...partial,
  };
}

/** Crée une liaison WSF avec valeurs par défaut sensées. */
export function makeLiaison(
  partial: Partial<LiaisonWSF> & Pick<LiaisonWSF, "id" | "source" | "cible" | "type">
): LiaisonWSF {
  return {
    sens: "UNIDIRECTIONNEL",
    force: 0.5,
    delai: "IMMEDIAT",
    caractere: "OBLIGATOIRE",
    condition: null,
    ...partial,
  };
}

/** Crée un graphe WSF vide (juste un conteneur). */
export function makeGraphe(partial: Partial<GrapheWSF> = {}): GrapheWSF {
  return {
    nodes: [],
    edges: [],
    ...partial,
  };
}

/* ─────────────────────────────────────────────────────────────────────
 * 10. VALIDATION MINIMALE — sera étendue plus tard avec les règles R1-R5
 *
 * Pour l'instant on se contente de vérifier que :
 * - chaque liaison référence des nœuds existants
 * - chaque ID est unique
 * - les valeurs sont bien dans leurs enums
 *
 * Les règles R1 à R5 de la spec (typage des couples, frontière système,
 * chaîne de valeur, anti-cycle, sensibilité/protection) viendront avec
 * le moteur WSF complet (WS.x dans ROADMAP).
 * ───────────────────────────────────────────────────────────────────── */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateGraphe(g: GrapheWSF): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. IDs uniques
  const ids = new Set<string>();
  for (const n of g.nodes) {
    if (ids.has(n.id)) errors.push(`ID nœud dupliqué : ${n.id}`);
    ids.add(n.id);
  }
  const edgeIds = new Set<string>();
  for (const e of g.edges) {
    if (edgeIds.has(e.id)) errors.push(`ID liaison dupliqué : ${e.id}`);
    edgeIds.add(e.id);
  }

  // 2. Références liaison → nœuds existants
  for (const e of g.edges) {
    if (!ids.has(e.source)) errors.push(`Liaison ${e.id} : source inconnue ${e.source}`);
    if (!ids.has(e.cible)) errors.push(`Liaison ${e.id} : cible inconnue ${e.cible}`);
  }

  // 3. Composantes valides
  for (const n of g.nodes) {
    if (!COMPOSANTES_WSF.includes(n.composante)) {
      errors.push(`Nœud ${n.id} : composante invalide ${n.composante}`);
    }
    if (!TYPES_OBJET.includes(n.type)) {
      errors.push(`Nœud ${n.id} : type invalide ${n.type}`);
    }
    if (!ETATS_OBJET.includes(n.etat)) {
      errors.push(`Nœud ${n.id} : état invalide ${n.etat}`);
    }
  }

  // 4. Forces de liaison dans [0, 1]
  for (const e of g.edges) {
    if (e.force < 0 || e.force > 1) {
      warnings.push(`Liaison ${e.id} : force hors [0, 1] (${e.force})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
