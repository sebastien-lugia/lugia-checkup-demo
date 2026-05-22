/**
 * V3-brand — données des modules (plans d'action).
 *
 * Extraites de `resources/modules_v2.json`. 7 modules × 4 étapes = 28 étapes.
 * Chaque étape porte un `tag` temporel (quick / medium / invest) +
 * un benchmark de conclusion en bas du module.
 *
 * V3-brand-T-V3-8 — page module.
 */

export type V3ModuleTag = "quick" | "medium" | "invest";

export const V3_TAG_LABELS: Record<V3ModuleTag, string> = {
  quick: "Action rapide — < 1 semaine",
  medium: "Projet court — 1 à 4 semaines",
  invest: "Investissement — 1 à 3 mois",
};

export type V3ModuleStep = {
  num: string;
  titre: string;
  body: string;
  tag: V3ModuleTag;
};

export type V3ModuleBenchmark = {
  texte: string;
  source_hint?: string;
  source_status?: "confirmed" | "to_confirm" | null;
};

export type V3Module = {
  id: string;
  label: string;
  effort: 1 | 2 | 3;
  etapes: V3ModuleStep[];
  benchmark: V3ModuleBenchmark;
  /**
   * Mini-encart « Avec Lugia » rendu en bas de la roadmap (avant les
   * données terrain). Respecte l'autonomie : ce que Lugia peut sécuriser
   * ou accélérer sur ce chantier précisément, sans rendre Lugia
   * obligatoire. 2-3 lignes maximum, ton concret et professionnel.
   */
  avecLugia?: string;
};

export const V3_MODULES: V3Module[] = [
  {
    id: "urgences",
    label: "Organiser les urgences du jour",
    effort: 2,
    etapes: [
      {
        num: "01",
        titre: "Définir ce qu'est une « urgence du jour »",
        body: "Pas les urgences vitales — celles-ci ont leur circuit propre. On parle ici des consultations qui ne peuvent pas attendre 48 h. Listez avec votre secrétariat les motifs qui rentrent dans cette catégorie : douleur thoracique, fièvre élevée chez un enfant, décompensation psychiatrique, suspicion d'infection sévère. Définir ces critères une fois pour toutes évite de rejouer l'arbitrage à chaque appel.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Bloquer deux créneaux dédiés par jour",
        body: "Un le matin, un l'après-midi. S'ils ne sont pas utilisés pour des urgences, ils sont récupérés pour des chroniques en fin de journée. Testez le format 3 semaines avant d'évaluer — il faut ce délai pour que l'équipe et les patients s'y habituent.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Former le secrétariat au tri téléphonique",
        body: "Trois questions suffisent pour trier 80 % des situations : depuis quand le symptôme dure-t-il, est-ce que ça s'aggrave, le patient a-t-il déjà eu ça ? Avec ces trois questions partagées, le secrétariat oriente sans vous interrompre — vous ne récupérez que les cas qui le nécessitent vraiment.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Évaluer après un mois",
        body: "Combien de créneaux urgence utilisés par semaine ? Combien d'interruptions en consultation ? Renvois aux urgences en hausse ou en baisse ? Ces trois indicateurs suffisent à ajuster le nombre de créneaux et à valider le tri.",
        tag: "medium" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Les cabinets qui mettent en place des créneaux dédiés réduisent de 60 à 70 % les interruptions en consultation. Un médecin interrompu huit fois par jour perd en moyenne 1 h 15 de concentration productive.",
      source_hint: "Retours d'expérience CPTS sur les protocoles d'urgences du jour",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut animer le cadrage des critères de tri avec votre secrétariat, suivre les indicateurs du logiciel sur 4 semaines, et ajuster avec vous le format si les créneaux ne sont pas absorbés.",
  },
  {
    id: "chroniques",
    label: "Structurer le suivi des patients chroniques",
    effort: 2,
    etapes: [
      {
        num: "01",
        titre: "Extraire votre file active du logiciel",
        body: "Tous les logiciels métiers permettent d'extraire la liste des patients avec une pathologie chronique codée. Faites-le pour trois pathologies pour commencer : diabète, HTA, insuffisance cardiaque. Le chiffre exact réserve souvent une surprise — il est généralement plus élevé que l'estimation à vue.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Identifier les patients sans consultation depuis plus de 12 mois",
        body: "Ce sont vos « patients silencieux » — souvent les plus fragiles. Un SMS de rappel simple suffit dans environ 70 % des cas à les faire reprendre contact, sans démarche complexe.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Créer des rappels automatiques dans le logiciel",
        body: "Pour chaque patient chronique revu en consultation, définissez une date de prochaine consultation recommandée. La plupart des logiciels modernes peuvent générer des alertes automatiques à cette date.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Déléguer le suivi de routine",
        body: "Le renouvellement simple, le bilan annuel de suivi, le rappel de vaccination — autant d'actes préparables par un assistant médical selon les protocoles de coopération en vigueur dans votre territoire. C'est l'étape la plus structurante quand elle est possible.",
        tag: "invest" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Un programme de relance simple permet de récupérer environ 70 % des patients chroniques perdus de vue dans les trois mois. La file active tracée est l'un des leviers de qualité les plus impactants en médecine de famille.",
      source_hint: "Indicateurs ROSP et expérimentations CPTS sur la relance des chroniques",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut configurer les extractions logiciel pour repérer les chroniques silencieux, poser un rythme de revue d'équipe, et préparer un protocole qui tient quand vous êtes absent.",
  },
  {
    id: "delegation",
    label: "Déléguer des tâches non médicales",
    effort: 3,
    etapes: [
      {
        num: "01",
        titre: "Cartographier vos tâches non médicales",
        body: "Passez une journée à noter tout ce que vous faites en dehors de la consultation directe. Vous découvrirez souvent que 60 à 70 % de ces tâches ne nécessitent pas votre expertise médicale — appel pour confirmer un résultat, saisie d'une lettre, préparation d'une feuille de soins.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Identifier les tâches délégables en priorité",
        body: "Appels de résultats simples, préparation des renouvellements, saisie de courriers, rappels de suivi. Commencez par une seule tâche — celle qui revient le plus souvent — et faites-la déléguer pendant deux semaines. Évaluez avant d'en ajouter d'autres.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Formaliser avec l'équipe",
        body: "30 minutes de réunion suffisent : expliquez pourquoi vous déléguez (pas juste « j'ai trop de travail », mais ce que vous voulez récupérer comme temps médical), montrez concrètement comment faire la tâche, et définissez le critère d'escalade — dans quel cas l'équipe vous transmet plutôt que de gérer seule. Ce dernier point sécurise toute la délégation.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Explorer le dispositif assistant médical",
        body: "Le cadre conventionnel permet un financement partiel du recrutement. Contactez votre CPAM ou votre CPTS — les délais sont souvent plus courts que prévu, et l'accompagnement administratif disponible.",
        tag: "invest" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Les cabinets ayant formalisé la délégation sur deux ou trois tâches récupèrent en moyenne 45 minutes de temps médical par jour. À votre profil, cela représente entre trois et cinq consultations supplémentaires possibles par semaine — ou autant de temps personnel récupéré, à votre choix.",
      source_hint: "Bilans CNAM dispositif assistant médical 2023-2024",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut cartographier avec vous ce qui peut être délégué (paramédical, secrétariat, prestataires), évaluer le temps regagné, et formaliser les protocoles de coopération qui sécurisent juridiquement la délégation.",
  },
  {
    id: "comm",
    label: "Instaurer un rituel de communication d'équipe",
    effort: 1,
    etapes: [
      {
        num: "01",
        titre: "Le point du matin : 10 minutes, pas plus",
        body: "Avant d'ouvrir les consultations, trois questions à l'équipe : qui a quoi aujourd'hui (planning, examens, créneaux particuliers), y a-t-il des imprévus à signaler, y a-t-il un patient à surveiller ? Testez le format deux semaines avant d'évaluer.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Créer un outil de messages partagés",
        body: "Un simple cahier à la réception suffit pour commencer : une colonne par praticien, une ligne par message. L'objectif n'est pas l'outil, c'est que chaque information en attente soit visible par tous, à un seul endroit.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Définir le protocole d'escalade",
        body: "« Dans quel cas est-ce que vous me dérangez pendant une consultation ? » — la réponse doit être connue de tous. Formulez trois critères précis, affichez-les au secrétariat. Cette clarté seule réduit environ 80 % des interruptions non justifiées.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Revue mensuelle de 30 minutes",
        body: "Une fois par mois : qu'est-ce qui a bien marché, qu'est-ce qui a coincé, une seule chose à améliorer pour le mois suivant. Quelqu'un note la décision prise. Ce qui paraît modeste devient en 6 mois un cycle d'amélioration continue.",
        tag: "medium" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Les cabinets ayant instauré un point matinal régulier signalent une réduction de 40 % des malentendus et une nette amélioration du sentiment de cohésion d'équipe. Une dizaine de minutes par jour qui change la qualité de la journée.",
      source_hint: "Enquête CMG ou MG France sur les pratiques d'équipe",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut dimensionner le rituel (durée, fréquence, format), accompagner les premières séances, et outiller la traçabilité des décisions prises en équipe.",
  },
  {
    id: "logiciel",
    label: "Optimiser le logiciel médical",
    effort: 2,
    etapes: [
      {
        num: "01",
        titre: "Identifier les trois actions les plus répétitives",
        body: "Rédaction de courriers, saisie d'ordonnances, comptes-rendus de visite — notez les trois actions que vous faites le plus dans la semaine et qui vous prennent le plus de temps. Ces trois actions sont vos cibles prioritaires de formation.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Programmer une demi-journée de formation ciblée",
        body: "Contactez votre éditeur logiciel — les formations sont souvent gratuites et largement sous-utilisées. Ne demandez pas « une formation générale », mais « comment faire X en moins de 30 secondes ». C'est ce ciblage qui fait toute la différence sur le retour d'investissement.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Créer cinq modèles de documents",
        body: "Lettre de liaison, ordonnance chronique, compte-rendu complexe, arrêt de travail, résultat de bilan — partez de vos documents existants et faites-en des modèles dans le logiciel. Vous économisez 3 à 5 minutes par document, à chaque utilisation.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Activer le tableau de bord activité",
        body: "Tous les logiciels modernes ont un module statistiques. Regardez trois indicateurs chaque vendredi : nombre d'actes de la semaine, délai moyen pour obtenir un RDV, top 5 des motifs. Dix minutes pour piloter votre cabinet — pas pour analyser à fond, juste pour voir les variations.",
        tag: "medium" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Un réglage logiciel bien ciblé représente 25 à 40 minutes gagnées par jour — soit 80 à 130 heures de travail récupérées sur l'année. C'est l'un des leviers à plus fort retour sur temps investi en cabinet.",
      source_hint: "Retours formations URPS ou enquête CMG sur l'usage des logiciels métiers",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut faire un audit ciblé de votre logiciel actuel, identifier les 3-4 fonctions sous-utilisées au meilleur retour, et former l'équipe sur les modèles et raccourcis qui font gagner le plus de temps.",
  },
  {
    id: "admin",
    label: "Réduire la charge administrative quotidienne",
    effort: 2,
    etapes: [
      {
        num: "01",
        titre: "Chronométrer votre temps administratif sur trois jours",
        body: "Pas pour vous culpabiliser — pour savoir. Notez chaque tâche administrative et le temps passé pendant trois jours représentatifs. La plupart des médecins sous-estiment leur temps administratif réel d'environ 30 %.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Identifier les trois tâches les plus chronophages et délégables",
        body: "Traitement des résultats normaux, préparation des renouvellements, saisie des courriers — ces trois familles de tâches représentent souvent à elles seules 60 % du temps administratif total. Elles sont aussi les plus délégables.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Créer des plages admin dédiées",
        body: "30 minutes le matin avant les consultations, 20 minutes entre midi et deux. Ces plages sont fermées aux consultations. Traiter l'administratif en temps masqué réduit considérablement le sentiment de surcharge — non pas parce que la quantité change, mais parce qu'il a sa place dans la semaine.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Explorer les outils d'automatisation",
        body: "Votre logiciel propose probablement des fonctions de traitement automatique des résultats biologiques normaux, d'envoi de rappels patients, de génération de courriers types. Demandez une démonstration ciblée à votre éditeur — ces fonctions sont souvent disponibles mais peu activées.",
        tag: "invest" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Une réorganisation ciblée permet de réduire le temps administratif de 35 à 50 % en six semaines — sans investissement technologique majeur. La différence vient surtout de l'organisation des plages et de la priorisation des tâches délégables.",
      source_hint: "Enquête CNOM ou DREES temps médecin libéral",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut vous aider à choisir et paramétrer les outils d'automatisation adaptés à votre profil (FSE, scan documents, signature), et à organiser la sous-traitance des tâches qui peuvent l'être.",
  },
  {
    id: "pilotage",
    label: "Mettre en place un pilotage simple de l'activité",
    effort: 1,
    etapes: [
      {
        num: "01",
        titre: "Choisir trois indicateurs, pas plus",
        body: "Délai moyen pour obtenir un RDV non urgent (en jours), nombre d'actes hebdomadaires, taux de consultations hors plage normale. Ces trois indicateurs donnent une vision suffisante pour repérer une dérive sans se noyer dans la donnée.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "02",
        titre: "Activer le module statistiques du logiciel",
        body: "Dix minutes chaque vendredi pour regarder ces trois indicateurs. Pas pour analyser — juste pour voir. En quatre semaines, vous saurez où vous en êtes et ce qui bouge dans votre activité.",
        tag: "quick" as V3ModuleTag,
      },
      {
        num: "03",
        titre: "Créer un tableau de bord mensuel simple",
        body: "Un fichier de trois colonnes, une ligne par semaine. En trois mois, vous aurez une tendance suffisamment claire pour prendre des décisions éclairées — recruter, ajuster les plages, refuser de nouveaux patients, étendre les horaires.",
        tag: "medium" as V3ModuleTag,
      },
      {
        num: "04",
        titre: "Utiliser les données pour une décision concrète",
        body: "Au bout de deux mois, posez-vous une question précise : le délai de RDV augmente-t-il ? Si oui, sur quels créneaux particulièrement ? Cette granularité simple permet de cibler une action précise — bloquer plus de créneaux le mardi matin, déléguer un type de consultation, etc.",
        tag: "medium" as V3ModuleTag,
      },
    ],
    benchmark: {
      texte: "Les cabinets qui suivent trois indicateurs hebdomadaires identifient leurs déséquilibres environ trois fois plus vite que ceux qui pilotent à l'intuition. Ce n'est pas la complexité du tableau de bord qui compte, c'est la régularité du regard.",
      source_hint: "Retours expérimentations CPTS sur le pilotage de cabinet ou enquête CMG",
      source_status: "to_confirm" as "confirmed" | "to_confirm",
    },
    avecLugia:
      "Lugia peut définir avec vous les 3 indicateurs les plus utiles, automatiser leur extraction depuis votre logiciel, et poser un rythme de revue trimestrielle qui transforme les chiffres en décisions.",
  },
];

export function getModule(id: string): V3Module | null {
  return V3_MODULES.find((m) => m.id === id) ?? null;
}