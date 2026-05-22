/**
 * V3-brand — référentiel des forces / marges par axe × niveau.
 *
 * 12 combinaisons (3 axes A/B/C × 4 niveaux 0-3 = Fragile / En transition / Solide / Mature).
 *
 * Utilisé À LA FOIS :
 *  - pour les `AxisCard` dépliantes de la page résultats (summary + forces + marges)
 *  - pour le bilan global « Ce qui tient » / « Ce qui fragilise » (agrégation
 *    des forces des axes >= Solide et des marges des axes <= En transition).
 *
 * V3-brand-T-V3-11a — premier jet éditorial, à repasser au filtre brand.
 */
import type { V3LevelId } from "./tokens";

export type AxisRiskLevel = "crit" | "warn" | "opt";

export type AxisMarge = {
  text: string;
  risk: AxisRiskLevel;
};

export type AxisDetailContent = {
  /** Phrase de synthèse — Onest 13 px sur la card collapsed. */
  summary: string;
  /** Listes de forces (puces couleur axe). */
  forces: string[];
  /** Liste de marges de progression (puces argent + badge risque inline). */
  marges: AxisMarge[];
};

type AxisDetailsTable = Record<"A" | "B" | "C", Record<V3LevelId, AxisDetailContent>>;

export const AXIS_DETAILS: AxisDetailsTable = {
  /* ───────────────────────────────────────────────────────────
   * A — Parcours patient
   * ─────────────────────────────────────────────────────────── */
  A: {
    0: {
      // Fragile
      summary:
        "L'urgence et le suivi reposent sur votre présence d'esprit — un système formalisé libérerait du temps cognitif.",
      forces: [
        "Vous tenez le cabinet à flux tendu — c'est une compétence à reconnaître.",
      ],
      marges: [
        { text: "Mettre en place un protocole d'urgence partagé avec l'équipe.", risk: "crit" },
        { text: "Tracer une file active des chroniques sans dépendre de la mémoire.", risk: "crit" },
        { text: "Sortir chaque patient avec une consigne écrite courte.", risk: "warn" },
      ],
    },
    1: {
      // En transition
      summary:
        "Quelques pratiques tiennent debout, d'autres dépendent du jour. La constance est le levier principal.",
      forces: [
        "Tri des urgences amorcé.",
        "Quelques chroniques sont suivis activement.",
      ],
      marges: [
        { text: "Formaliser ce qui marche pour que ça tienne sans vous.", risk: "warn" },
        { text: "Élargir le tri des urgences au-delà du secrétariat unique.", risk: "warn" },
        { text: "Repérer les patients chroniques silencieux (extraction logiciel).", risk: "opt" },
      ],
    },
    2: {
      // Solide
      summary:
        "Un parcours patient solide, qui demande encore à être étendu aux silences (patients perdus de vue, alertes résultats).",
      forces: [
        "Tri des urgences du jour formalisé.",
        "Suivi des chroniques actif avec rappels.",
      ],
      marges: [
        { text: "Extraction logiciel pour repérer les chroniques silencieux.", risk: "warn" },
        { text: "Alerte automatique sur résultats hors normes.", risk: "warn" },
      ],
    },
    3: {
      // Mature
      summary:
        "Un parcours patient mature. Le levier de progression se trouve désormais dans la coordination territoriale.",
      forces: [
        "Protocoles d'urgence et de suivi partagés.",
        "Patients chroniques suivis proactivement.",
        "Coordination de l'information patient bien rodée.",
      ],
      marges: [
        { text: "Étendre la régulation au territoire (CPTS, MSP).", risk: "opt" },
      ],
    },
  },

  /* ───────────────────────────────────────────────────────────
   * B — Équipe & secrétariat
   * ─────────────────────────────────────────────────────────── */
  B: {
    0: {
      // Fragile
      summary:
        "L'organisation humaine repose entièrement sur vous. C'est le point d'usure le plus fréquent en libéral solo.",
      forces: [
        "Vous portez le cabinet — votre engagement personnel est le moteur actuel.",
      ],
      marges: [
        { text: "Cadrer les rôles minimum pour libérer du temps.", risk: "crit" },
        { text: "Tester un assistant médical (dispositif conventionnel).", risk: "crit" },
        { text: "Mettre en place un rituel de communication d'équipe (15 min/jour).", risk: "warn" },
      ],
    },
    1: {
      // En transition
      summary:
        "Les rôles existent mais sans cadre formel. Les angles morts apparaissent dès qu'une absence se présente.",
      forces: [
        "L'équipe est présente et engagée — le levier existe.",
      ],
      marges: [
        { text: "Formaliser les rôles pour préparer les absences.", risk: "crit" },
        { text: "Instaurer un rituel de transmission quotidien (10 min).", risk: "warn" },
        { text: "Outiller la circulation d'information.", risk: "warn" },
      ],
    },
    2: {
      // Solide
      summary:
        "Une équipe qui fonctionne, avec une marge à prendre sur la formalisation des relais et de la communication.",
      forces: [
        "Équipe avec un cadre déjà clair.",
        "Marges présentes pour entraide en cas d'imprévu.",
      ],
      marges: [
        { text: "Aller vers la délégation des tâches médicales déléguables.", risk: "warn" },
        { text: "Préparer un plan de continuité (absences, congés, imprévus).", risk: "opt" },
      ],
    },
    3: {
      // Mature
      summary:
        "Une organisation humaine mature. Le levier suivant se trouve dans la délégation des tâches médicales déléguables.",
      forces: [
        "Délégation formalisée et évolutive.",
        "Équipe résiliente aux absences.",
        "Communication fluide.",
      ],
      marges: [
        { text: "Optimiser la répartition (assistant médical / IPA / paramédicaux).", risk: "opt" },
      ],
    },
  },

  /* ───────────────────────────────────────────────────────────
   * C — Outils & dossiers
   * ─────────────────────────────────────────────────────────── */
  C: {
    0: {
      // Fragile
      summary:
        "Les outils sont sous-exploités. Le quotidien repose sur la mémoire et le bon vouloir — fragile à long terme.",
      forces: [
        "Vous tenez votre pratique sans appui technologique fort — compétence rare.",
      ],
      marges: [
        { text: "Identifier 3 fonctions du logiciel actuel actuellement sous-utilisées.", risk: "crit" },
        { text: "Structurer les dossiers patients (un modèle commun).", risk: "warn" },
        { text: "Réduire la pile administrative via automatisations simples.", risk: "warn" },
      ],
    },
    1: {
      // En transition
      summary:
        "Quelques fonctions utilisées, le reste en sommeil. Le logiciel a la capacité de porter bien plus qu'aujourd'hui.",
      forces: [
        "Base logiciel présente — formation courte suffit.",
      ],
      marges: [
        { text: "Étendre l'usage du logiciel (modèles, raccourcis).", risk: "warn" },
        { text: "Mettre en place un pilotage simple (3 indicateurs).", risk: "warn" },
      ],
    },
    2: {
      // Solide
      summary:
        "Vous tirez parti de votre logiciel. Reste à arbitrer entre nouvelles fonctions et stabilisation de l'usage.",
      forces: [
        "Logiciel maîtrisé sur l'essentiel.",
        "Dossiers patients lisibles.",
      ],
      marges: [
        { text: "Arbitrer entre nouvelles fonctions et stabilisation.", risk: "opt" },
        { text: "Évaluer l'apport d'outils complémentaires (IA, téléconsult, MSSanté).", risk: "opt" },
      ],
    },
    3: {
      // Mature
      summary:
        "Outillage mature et bien intégré. Le levier de progression se trouve dans le pilotage par les données.",
      forces: [
        "Outillage mature et bien intégré.",
        "Données patients structurées.",
        "Charge administrative maîtrisée.",
      ],
      marges: [
        { text: "Passer au pilotage par les données (indicateurs cabinet).", risk: "opt" },
      ],
    },
  },
};

/**
 * Récupère le contenu détaillé pour un axe donné à un niveau donné.
 */
export function getAxisDetail(
  axis: "A" | "B" | "C",
  level: V3LevelId
): AxisDetailContent {
  return AXIS_DETAILS[axis][level];
}
