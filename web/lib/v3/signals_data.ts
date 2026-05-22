/**
 * V3-brand — signaux croisés étendus.
 *
 * Chaque signal porte désormais :
 *  - id, cond (sur niveaux 0-3)
 *  - title + body (texte du bloc analyse croisée)
 *  - phraseChocBefore + phraseChocAfter (la phrase choc avec emphase --warn)
 *  - bilanForcesTitles : titres à utiliser pour le bilan global « Ce qui tient »
 *  - bilanRisquesTitles : titres à utiliser pour « Ce qui fragilise » (avec risk)
 *  - radarAnnotations : 3 callouts maximum à dessiner sur le radar
 *
 * V3-brand-T-V3-11b — premier jet éditorial, à repasser au filtre brand.
 */

import { type V3LevelId, levelOf } from "./tokens";
import type { AxisRiskLevel } from "./axis_details_data";

export type AxisLevels = {
  A: V3LevelId;
  B: V3LevelId;
  C: V3LevelId;
};

export type BilanItem = {
  title: string;
  desc: string;
  risk?: AxisRiskLevel;
};

export type RadarAnnotationData = {
  axis: "A" | "B" | "C" | "BC";
  side: "left" | "right";
  title: string;
  sub: string;
  badge: AxisRiskLevel;
};

export type V3Signal = {
  id: string;
  cond: (s: AxisLevels) => boolean;
  /** Titre court du bloc « Analyse croisée ». */
  title: string;
  /** Corps éditorial — 4-5 phrases. */
  body: string;
  /** Phrase choc — début neutre. */
  phraseChocBefore: string;
  /** Phrase choc — fin en `<strong>` couleur warn. */
  phraseChocAfter: string;
  /** Forces du bilan global (3 items typiquement). */
  bilanForces: BilanItem[];
  /** Risques du bilan global (3 items avec risk). */
  bilanRisques: BilanItem[];
  /** Annotations radar — max 3, choisies parmi A/B/C/BC selon le signal. */
  radarAnnotations: RadarAnnotationData[];
};

/* ───────────────────────────────────────────────────────────
 * Les 7 signaux (6 conditionnels + fallback)
 * ─────────────────────────────────────────────────────────── */

export const V3_SIGNALS: V3Signal[] = [
  {
    id: "triple_faiblesse",
    cond: (s) => s.A <= 1 && s.B <= 1 && s.C <= 2,
    title: "Les trois axes sont sous tension.",
    body: "Les trois dimensions de votre cabinet sont simultanément en difficulté. Ce n'est pas un défaut d'organisation individuelle — c'est le signe que vous avancez seul sur un terrain qui demande des systèmes. Le risque d'épuisement est réel. Le point de départ n'est pas forcément le plus urgent, c'est celui qui libère le plus d'énergie pour la suite.",
    phraseChocBefore:
      "Trois axes sous tension. Vous portez seul ce que l'équipe et les outils devraient porter —",
    phraseChocAfter:
      "le levier le plus rapide n'est pas celui qui semble le plus urgent, c'est celui qui libère de l'énergie pour les suivants.",
    bilanForces: [
      { title: "Vous tenez le cabinet", desc: "Votre engagement personnel maintient l'ensemble — c'est la base à reconnaître avant de structurer." },
    ],
    bilanRisques: [
      { title: "Dépendance à votre présence", desc: "Toute absence déstabilise. L'organisation n'existe pas sans vous.", risk: "crit" },
      { title: "Charge mentale soutenue", desc: "Trop de décisions remontent à vous — l'arbitrage permanent use sur la durée.", risk: "crit" },
      { title: "Outils sous-mobilisés", desc: "Vos outils ont la capacité de porter une partie du flux qui passe aujourd'hui par votre mémoire.", risk: "warn" },
    ],
    radarAnnotations: [
      { axis: "A", side: "left", title: "Parcours fragile.", sub: "Tout passe par vous.", badge: "crit" },
      { axis: "B", side: "right", title: "Équipe sans cadre.", sub: "Absences déstabilisantes.", badge: "crit" },
      { axis: "C", side: "right", title: "Outils en sommeil.", sub: "Potentiel non exploité.", badge: "warn" },
    ],
  },
  {
    id: "outils_ok_humain_fragile",
    cond: (s) => s.C >= 3 && s.A <= 1 && s.B <= 1,
    title: "Vous avez investi sur les outils — l'organisation humaine est le prochain palier.",
    body: "Vos outils sont à un bon niveau de maîtrise. Ce qui pèse aujourd'hui ne se résoudra pas par plus de technologie — c'est l'organisation humaine et le parcours patient qui demandent de l'attention. Un cabinet bien outillé sans équipe structurée crée une dissonance que les patients finissent par ressentir.",
    phraseChocBefore:
      "Outils maîtrisés, mais l'organisation humaine déséquilibre l'ensemble —",
    phraseChocAfter:
      "ce n'est pas la technologie qui résoudra cette tension, c'est le cadre humain.",
    bilanForces: [
      { title: "Outils bien maîtrisés", desc: "Vos logiciels portent une part importante de la charge — c'est un acquis." },
    ],
    bilanRisques: [
      { title: "Parcours patient fragile", desc: "L'urgence et le suivi reposent sur vous seul — sans relais formalisé.", risk: "crit" },
      { title: "Équipe sans cadre", desc: "Les rôles existent mais ne sont pas tenus — angles morts en cas d'absence.", risk: "crit" },
    ],
    radarAnnotations: [
      { axis: "A", side: "left", title: "Parcours fragile.", sub: "Tout passe par vous.", badge: "crit" },
      { axis: "B", side: "right", title: "Équipe sans cadre.", sub: "Levier d'action prioritaire.", badge: "crit" },
    ],
  },
  {
    id: "equipe_outils_faibles",
    cond: (s) => s.B <= 1 && s.C <= 1,
    title: "Surcharge administrative chronique.",
    body: "L'équipe et les outils sont simultanément en difficulté — ce qui produit cette sensation que l'administratif envahit tout. Délégation et automatisation ensemble peuvent libérer plus d'une heure par jour. Mais l'ordre compte : commencer par l'organisation humaine rend l'outillage beaucoup plus efficace.",
    phraseChocBefore:
      "L'administratif déborde des deux côtés — équipe et outils. C'est le bras qui sature en premier —",
    phraseChocAfter:
      "structurer l'humain avant d'outiller multiplie l'effet de l'automatisation par deux.",
    bilanForces: [
      { title: "Parcours patient structuré", desc: "La prise en charge clinique tient debout — c'est l'ossature à protéger." },
    ],
    bilanRisques: [
      { title: "Équipe sans cadre formel", desc: "Délégation et continuité de service dépendent du contexte du jour.", risk: "crit" },
      { title: "Outils sous-exploités", desc: "Une part du quotidien passe par la mémoire alors qu'elle est traçable.", risk: "crit" },
      { title: "Pilotage absent", desc: "Pas de visibilité sur les flux — décisions au feeling.", risk: "warn" },
    ],
    radarAnnotations: [
      { axis: "B", side: "right", title: "Équipe sans cadre.", sub: "Levier de délégation à activer.", badge: "crit" },
      { axis: "C", side: "right", title: "Outils sous-exploités.", sub: "Automatisations simples à mettre.", badge: "crit" },
      { axis: "BC", side: "left", title: "Charge administrative", sub: "Effet combiné équipe + outils.", badge: "crit" },
    ],
  },
  {
    id: "parcours_ok_equipe_fragile",
    cond: (s) => s.A >= 3 && s.B <= 1,
    title: "Paradoxe : bon parcours patient, équipe fragile.",
    body: "Vous parvenez à délivrer un bon parcours patient en compensant côté équipe. C'est tenable à court terme — mais ce profil est souvent celui d'un médecin qui porte seul ce que l'organisation devrait porter. La question n'est pas de faire moins bien, c'est de trouver comment tenir sur la durée.",
    phraseChocBefore:
      "Paradoxe : bon parcours patient, organisation fragile. Vous portez seul ce que l'équipe et les outils devraient porter —",
    phraseChocAfter:
      "c'est ce déséquilibre qui explique la charge que vous ressentez en fin de semaine.",
    bilanForces: [
      { title: "Parcours patient structuré", desc: "Tri des urgences en place, suivi des chroniques actif. Le patient est pris en charge." },
      { title: "Logiciel connu", desc: "Quelques fonctions maîtrisées — la base est là pour aller plus loin." },
    ],
    bilanRisques: [
      { title: "Dépendance à votre présence", desc: "Toute absence déstabilise. L'organisation n'existe pas sans vous.", risk: "crit" },
      { title: "Équipe sans cadre", desc: "Les personnes sont là — ce qui manque, c'est le cadre pour les rendre autonomes.", risk: "crit" },
      { title: "Patients silencieux", desc: "Pas de système pour repérer les chroniques qui n'appellent plus.", risk: "warn" },
    ],
    radarAnnotations: [
      { axis: "B", side: "right", title: "Rôles sans cadre formel.", sub: "Absences déstabilisantes.", badge: "crit" },
      { axis: "C", side: "right", title: "Logiciel sous-exploité.", sub: "Pilotage absent.", badge: "warn" },
      { axis: "BC", side: "left", title: "Manque de cadre.", sub: "Charge ressentie amplifiée.", badge: "crit" },
    ],
  },
  {
    id: "pratique_ok_outils_faibles",
    cond: (s) => s.C <= 1 && s.A >= 2,
    title: "Vos pratiques méritent de meilleurs outils.",
    body: "Votre pratique de soin tient debout sans appui technologique fort — c'est une compétence rare. Les outils actuellement sous-exploités amplifient ce que vous faites déjà bien, sans changer votre façon d'exercer. Le levier est là.",
    phraseChocBefore:
      "Votre pratique tient sans appui technologique fort — compétence rare, mais —",
    phraseChocAfter:
      "des outils mieux exploités amplifient ce que vous faites déjà bien, sans changer votre exercice.",
    bilanForces: [
      { title: "Parcours patient solide", desc: "Vous délivrez une prise en charge structurée — c'est l'acquis principal." },
      { title: "Équipe en place", desc: "Le contexte humain est posé, base saine pour structurer." },
    ],
    bilanRisques: [
      { title: "Outils sous-exploités", desc: "Le logiciel porte moins de 30 % de son potentiel actuel.", risk: "crit" },
      { title: "Pilotage absent", desc: "Aucune visibilité chiffrée sur l'activité du cabinet.", risk: "warn" },
    ],
    radarAnnotations: [
      { axis: "C", side: "right", title: "Logiciel sous-exploité.", sub: "Levier d'amplification disponible.", badge: "crit" },
      { axis: "A", side: "left", title: "Parcours solide.", sub: "Acquis à protéger.", badge: "opt" },
    ],
  },
  {
    id: "tout_bon",
    cond: (s) => s.A >= 3 && s.B >= 3 && s.C >= 3,
    title: "Cabinet structuré — voici où concentrer votre énergie pour passer au niveau suivant.",
    body: "Les trois axes sont au moins opérationnels. Le check-up sert ici à identifier la marche suivante — pas les urgences, mais les leviers de progression. Un cabinet à ce niveau peut souvent gagner davantage en approfondissant un axe fort qu'en colmatant les faiblesses résiduelles.",
    phraseChocBefore:
      "Trois axes opérationnels. Pas d'urgence à colmater — la marche suivante —",
    phraseChocAfter:
      "se trouve dans l'approfondissement d'un axe fort plutôt que dans la chasse aux faiblesses résiduelles.",
    bilanForces: [
      { title: "Parcours patient mature", desc: "Coordination du parcours et suivi des chroniques bien intégrés." },
      { title: "Équipe structurée", desc: "Rôles formalisés, communication fluide, résilience aux absences." },
      { title: "Outils bien exploités", desc: "Logiciel maîtrisé et données patients structurées." },
    ],
    bilanRisques: [
      { title: "Optimisation continue", desc: "À ce niveau, le risque principal est l'inertie — continuer à challenger les acquis.", risk: "opt" },
    ],
    radarAnnotations: [
      { axis: "A", side: "left", title: "Parcours mature.", sub: "Coordination territoriale à explorer.", badge: "opt" },
      { axis: "B", side: "right", title: "Équipe structurée.", sub: "Délégation médicale à envisager.", badge: "opt" },
      { axis: "C", side: "right", title: "Outils intégrés.", sub: "Pilotage par les données.", badge: "opt" },
    ],
  },
];

/** Fallback toujours affiché si aucun signal ne matche. */
export const V3_SIGNAL_FALLBACK: V3Signal = {
  id: "fallback",
  cond: () => true,
  title: "Lecture croisée de votre cabinet.",
  body: "Votre profil révèle des déséquilibres entre les trois axes. Les chantiers prioritaires ci-dessous ont été sélectionnés pour leur effet de levier croisé — agir sur l'un améliore souvent la situation sur les autres.",
  phraseChocBefore:
    "Votre profil dessine un cabinet en équilibre partiel — quelques axes solides, d'autres en construction —",
  phraseChocAfter:
    "les chantiers proposés ci-dessous sont ceux qui auront l'effet de levier le plus rapide sur l'ensemble.",
  bilanForces: [],
  bilanRisques: [],
  radarAnnotations: [],
};

/**
 * Sélectionne le signal applicable depuis les scores 0-100. Retourne le premier
 * qui matche, ou le fallback si aucun.
 */
export function pickSignal(scores: { A: number; B: number; C: number }): V3Signal {
  const levels: AxisLevels = {
    A: levelOf(scores.A),
    B: levelOf(scores.B),
    C: levelOf(scores.C),
  };
  return V3_SIGNALS.find((sig) => sig.cond(levels)) ?? V3_SIGNAL_FALLBACK;
}
