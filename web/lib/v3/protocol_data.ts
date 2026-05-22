/**
 * V3-brand — données du protocole (extraites de resources/interview_protocol_v2.json).
 *
 * Pour les wireframes V3 et la phase intégration. Quand le backend V3 sera
 * branché, on remplacera cet import par un fetch côté state.
 *
 * V3-brand-T-V3-6 (régénéré T-V3-10-fix : options correctement extraites).
 */

export type V3Option = {
  id: string;
  label: string;
  reformulation: string;
  benchmark: string | null;
  score: number;
  /**
   * Label alternatif affiché si le profil a `secretariat === "seul"`.
   * Permet d'adapter les options qui mentionnent un secrétariat pour les
   * médecins qui gèrent l'accueil seul.
   */
  labelSeul?: string;
};

export type V3BlocQuestion = {
  id: string;
  label: string;
  context: string | null;
  options: V3Option[];
  /**
   * Routing optionnel : "cabinet_type==solo" / "cabinet_type!=solo".
   * Si présent, la question n'est rendue que si la condition s'évalue à true
   * sur le profil utilisateur. Sinon (= absent), la question est toujours rendue.
   */
  routing?: string;
};

export type V3Bloc = {
  id: "A" | "B" | "C";
  label: string;
  subtitle: string;
  questions: V3BlocQuestion[];
};

export const V3_BLOCS: V3Bloc[] = [
  {
    id: "A",
    label: "Parcours patient",
    subtitle: "De la prise de rendez-vous à la transmission vers les spécialistes",
    questions: [
      {
        id: "a1",
        label: "Quand un patient appelle pour un motif urgent, que se passe-t-il ?",
        context: "Pensez à la semaine dernière.",
        options: [
          {
            id: "a1_a",
            label: "Il est renvoyé aux urgences ou rappelle de lui-même.",
            reformulation: "La demande urgente sans filet interne est le premier point de tension d'un cabinet saturé. C'est souvent ce qui finit par déborder en premier.",
            benchmark: "Environ 60 % des passages aux urgences non programmés sont absorbables par un cabinet de proximité avec un protocole de tri simple.",
            score: 1,
          },
          {
            id: "a1_b",
            label: "Le secrétariat évalue et propose un créneau si possible.",
            labelSeul: "J'évalue moi-même au rappel et propose un créneau si possible.",
            reformulation: "Un premier tri existe — il dépend de la personne qui décroche, pas d'une règle partagée. Ça tient jusqu'au jour où elle est absente.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a1_c",
            label: "Je bloque des créneaux dédiés chaque matin, avec des critères clairs pour l'équipe.",
            reformulation: "Un protocole formalisé. Ce que ça libère ne se voit pas tout de suite — c'est la charge mentale qui baisse en arrière-plan.",
            benchmark: null,
            score: 3,
          },
          {
            id: "a1_d",
            label: "Il est redirigé via un dispositif partagé avec d'autres praticiens du territoire.",
            reformulation: "Une coordination qui dépasse le cabinet. Rare en médecine générale, et c'est ce qui rend l'organisation soutenable à long terme.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "a2",
        label: "Comment gérez-vous les demandes non programmées hors urgences — ordonnance à renouveler, résultat à commenter, question simple ?",
        context: null,
        options: [
          {
            id: "a2_a",
            label: "Tout passe par une consultation, je n'ai pas d'autre canal.",
            reformulation: "Toute demande devient une consultation. Pour le médecin, c'est du flux qui se compresse ; pour le patient, c'est de l'attente pour des choses parfois mineures.",
            benchmark: "30 à 40 % des consultations courtes sont traitables par un autre canal sans perte de qualité de soin.",
            score: 1,
          },
          {
            id: "a2_b",
            label: "Je traite ces demandes au fil de l'eau, sans cadre formalisé.",
            reformulation: "Le « fil de l'eau » est efficace tant qu'il reste léger. Au-delà, il devient un mode d'usure invisible — quelques minutes par-ci, par-là, qui n'apparaissent dans aucun planning.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a2_c",
            label: "Le secrétariat absorbe les demandes simples avec des critères connus.",
            labelSeul: "Je traite ces demandes selon des règles personnelles claires.",
            reformulation: "La délégation des demandes simples avec un cadre clair. Le secrétariat retrouve de la marge, le médecin garde le temps cognitif pour les vraies décisions.",
            benchmark: null,
            score: 3,
          },
          {
            id: "a2_d",
            label: "Le patient écrit via messagerie ou espace patient, le secrétariat trie.",
            labelSeul: "Le patient écrit via messagerie ou espace patient, je traite par batch.",
            reformulation: "Un canal asynchrone bien rodé change la temporalité du cabinet. Les demandes simples ne consomment plus de créneaux et le patient reste informé.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "a3",
        label: "Comment le patient sait-il ce qu'il doit faire entre deux consultations ?",
        context: "Résultats d'analyses, ordonnances, surveillance de symptômes.",
        options: [
          {
            id: "a3_a",
            label: "Il rappelle ou revient, on gère à ce moment-là.",
            reformulation: "La boucle ouverte. Chaque rappel est légitime côté patient et coûte du temps côté cabinet — sans qu'on puisse anticiper le moment.",
            benchmark: "40 % des rappels entrants sont évitables avec une consigne de sortie systématique.",
            score: 1,
          },
          {
            id: "a3_b",
            label: "J'explique à l'oral en fin de consultation.",
            reformulation: "L'oral est précieux pendant la consultation. 48 h après, le patient retient rarement les 3 points clés — c'est le moment où la consigne devient utile.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a3_c",
            label: "Je lui remets systématiquement une consigne écrite (impression ou SMS).",
            reformulation: "La trace écrite multiplie la compliance. Et accessoirement, elle réduit les rappels « pour confirmer ».",
            benchmark: null,
            score: 3,
          },
          {
            id: "a3_d",
            label: "Le patient accède à son suivi en ligne (messagerie sécurisée, espace patient).",
            reformulation: "L'autonomisation numérique du suivi. Le patient devient acteur entre les consultations, votre charge de coordination diminue de façon significative.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "a4",
        label: "Comment gérez-vous le suivi de vos patients chroniques connus ?",
        context: "Diabète, HTA, insuffisance cardiaque, BPCO…",
        options: [
          {
            id: "a4_a",
            label: "Ils rappellent quand ils ont besoin, je les vois alors.",
            reformulation: "Un suivi qui dépend de l'initiative du patient. Les plus organisés reviennent, les plus fragiles disparaissent — souvent sans signal.",
            benchmark: "15 à 20 % des patients chroniques n'ont pas eu de consultation dédiée dans l'année.",
            score: 1,
          },
          {
            id: "a4_b",
            label: "J'essaie de programmer des renouvellements, sans système formalisé.",
            reformulation: "Une intention de suivi qui se diffuse dans le flux quotidien. Sans outil de relance, les files actives se perdent dans le rythme des consultations.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a4_c",
            label: "Je tiens une liste à jour des chroniques avec rappels de suivi.",
            reformulation: "La file active tracée. C'est l'un des leviers de qualité les plus impactants en médecine de famille — et celui qui se voit le moins de l'extérieur.",
            benchmark: null,
            score: 3,
          },
          {
            id: "a4_d",
            label: "J'ai intégré le suivi dans le logiciel avec alertes et indicateurs.",
            reformulation: "Le suivi industrialisé. Vous avez préparé l'organisation à pouvoir tenir sur la durée, indépendamment de votre charge mémoire.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "a5",
        label: "Comment identifiez-vous les patients chroniques qui devraient revenir mais ne viennent plus ?",
        context: null,
        options: [
          {
            id: "a5_a",
            label: "Je n'ai pas mis de système en place pour ces patients.",
            reformulation: "L'angle mort de la médecine de famille. Les patients silencieux sont souvent les plus à risque — et les plus difficiles à repérer sans outil dédié.",
            benchmark: "Un programme de relance simple récupère 70 % des patients chroniques perdus de vue dans les 3 mois.",
            score: 1,
          },
          {
            id: "a5_b",
            label: "Je m'en aperçois quand un patient revient après une longue absence.",
            reformulation: "La détection au coup par coup. Vous repérez certains patients, mais sans pouvoir agir sur ceux que vous n'avez pas vus depuis 18 mois.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a5_c",
            label: "Je relance ponctuellement les patients que j'identifie à risque.",
            reformulation: "Une démarche active sur les profils que vous avez en tête. La marge de progression : étendre à des critères systématiques pour ne plus dépendre de votre seule mémoire.",
            benchmark: null,
            score: 3,
          },
          {
            id: "a5_d",
            label: "Le logiciel identifie et relance les patients non revus.",
            reformulation: "Un dispositif qui chasse les silences. C'est un changement de posture — vous ne réagissez plus à la demande, vous prévenez l'absence.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "a6",
        label: "Comment êtes-vous alerté quand un résultat d'examen important arrive pour un patient ?",
        context: null,
        options: [
          {
            id: "a6_a",
            label: "Je consulte les résultats quand j'y pense.",
            reformulation: "Le tri dépend entièrement de votre présence d'esprit. Une journée chargée et un résultat critique peut attendre — c'est rarement un défaut de vigilance, c'est un défaut de système.",
            benchmark: null,
            score: 1,
          },
          {
            id: "a6_b",
            label: "Le secrétariat vérifie et m'alerte sur ce qui me semble critique.",
            labelSeul: "Mes correspondants (labos, hôpitaux) m'alertent directement sur les valeurs critiques.",
            reformulation: "Un premier filet en relais. Sa fiabilité dépend du temps disponible du secrétariat et de la clarté des critères d'alerte que vous avez partagés.",
            benchmark: null,
            score: 2,
          },
          {
            id: "a6_c",
            label: "Je consulte les résultats à heures fixes plusieurs fois par jour.",
            reformulation: "Une discipline personnelle solide. Reste un point d'attention : c'est une vigilance qui repose sur vous seul — et qui s'use les jours de fatigue.",
            benchmark: null,
            score: 3,
          },
          {
            id: "a6_d",
            label: "Le logiciel ou la plateforme m'alerte sur les valeurs hors normes.",
            reformulation: "L'alerte structurelle. Vous gagnez du temps cognitif et vous réduisez le risque qu'un résultat critique passe entre les mailles.",
            benchmark: null,
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "B",
    label: "Équipe & secrétariat",
    subtitle: "Organisation humaine, rôles et charge de travail partagée",
    questions: [
      {
        id: "b1",
        label: "Comment sont répartis les rôles dans votre cabinet ?",
        context: null,
        routing: "has_team==true",
        options: [
          {
            id: "b1_a",
            label: "Je gère tout moi-même, ou avec une aide ponctuelle non formalisée.",
            reformulation: "Le médecin qui fait tout. C'est le modèle le plus courant en libéral solo — et celui qui s'use le plus vite, parce que tout repose sur la même personne.",
            benchmark: "62 % des généralistes déclarent gérer plus de 30 % de tâches non médicales faute d'organisation.",
            score: 1,
          },
          {
            id: "b1_b",
            label: "Une répartition s'est faite au fil du temps, mais elle n'est pas vraiment définie.",
            reformulation: "Les rôles existent mais ne sont pas nommés. Tant que tout le monde est là, ça tient ; à la première absence ou nouvelle recrue, les angles morts apparaissent.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b1_c",
            label: "Chacun a un périmètre clair, on déborde parfois pour s'entraider.",
            reformulation: "Des rôles clairs avec une porosité contrôlée. C'est l'équilibre qui rend l'équipe à la fois lisible et solidaire — il faut le maintenir consciemment.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b1_d",
            label: "Rôles formalisés qui évoluent avec les compétences (délégation, protocoles).",
            reformulation: "Une délégation formalisée qui évolue avec l'équipe. C'est l'organisation qui tient quand quelqu'un change de poste, part en formation ou s'absente.",
            benchmark: "Les cabinets avec assistant médical récupèrent 45 minutes de temps médical par jour.",
            score: 4,
          },
        ],
      },
      {
        id: "b3",
        label: "Comment décririez-vous la charge de travail du secrétariat ?",
        context: null,
        routing: "secretariat!=seul",
        options: [
          {
            id: "b3_a",
            label: "Secrétariat chroniquement débordé, gestion en mode urgences permanent.",
            reformulation: "Un secrétariat en surrégime continu. Les tâches à valeur ajoutée disparaissent au profit du flux — et avec elles, ce qui peut alléger le cabinet à moyen terme.",
            benchmark: "Un secrétariat débordé traite jusqu'à 2,3× plus d'appels que nécessaire faute de protocoles de tri.",
            score: 1,
          },
          {
            id: "b3_b",
            label: "La charge varie, gérable certains jours, tendue d'autres.",
            reformulation: "La variabilité non maîtrisée. Elle use autant que la surcharge constante, parce que l'équipe ne peut pas anticiper et alterne entre surchauffe et décompression.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b3_c",
            label: "Le secrétariat est globalement maîtrisé grâce à une organisation rodée.",
            reformulation: "Une charge maîtrisée. C'est le signe d'un système, pas d'une chance — il faut continuer à l'entretenir pour qu'il tienne dans la durée.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b3_d",
            label: "Secrétariat optimisé, concentré sur ce qui a vraiment de la valeur.",
            reformulation: "Le réglage du front-office. Souvent le levier le plus rapide pour améliorer simultanément l'expérience patient et la sérénité de l'équipe.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b4",
        label: "Comment les informations circulent-elles entre les membres de l'équipe ?",
        context: "Messages patients, urgences du jour, tâches en attente.",
        routing: "has_team==true",
        options: [
          {
            id: "b4_a",
            label: "À l'oral, quand on se croise, ce n'est pas toujours idéal.",
            reformulation: "La transmission orale au vol. Elle dépend entièrement de la présence simultanée — ce qui devient fragile dès qu'un membre s'absente ou change de rythme.",
            benchmark: null,
            score: 1,
          },
          {
            id: "b4_b",
            label: "Par notes papier ou messages informels, avec quelques ratés.",
            reformulation: "Le papier fonctionne jusqu'à un certain seuil de volume. Au-delà, les erreurs s'accumulent silencieusement — un message oublié sur un bureau, une note qui se perd.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b4_c",
            label: "Il y a un outil ou un rituel de transmission (carnet, tableau, point quotidien).",
            reformulation: "Un rituel de transmission, même simple, change la dynamique. Les oublis baissent et la cohésion d'équipe se renforce — c'est ce qui se voit le moins dans le quotidien et qui fait le plus de différence.",
            benchmark: "78 % des cabinets bien organisés citent le point d'équipe de 10 min en début de journée comme la pratique la plus impactante.",
            score: 3,
          },
          {
            id: "b4_d",
            label: "Communication structurée : outil partagé, points réguliers, traçabilité.",
            reformulation: "Une communication structurée libère la charge mentale collective. Chacun sait où l'information se trouve et qui en est responsable.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b5",
        label: "Imaginez que vous deviez vous absenter plusieurs jours. Comment le cabinet se débrouille-t-il ?",
        context: null,
        options: [
          {
            id: "b5_a",
            label: "C'est compliqué, patients sans solution et retour chaotique, je l'évite.",
            reformulation: "L'absence révèle que tout repose sur des personnes, rien sur des processus. C'est la signature d'un cabinet construit autour d'une personne clé.",
            benchmark: null,
            score: 1,
          },
          {
            id: "b5_b",
            label: "On bricole une solution à chaque fois, ça dépend des disponibilités.",
            reformulation: "Le bricolage récurrent est un chantier déguisé en anecdote. Chaque absence demande une énergie de coordination disproportionnée pour ce qui devrait être routinier.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b5_c",
            label: "Préparé pour les congés, mais je ne saurais pas gérer une absence soudaine.",
            reformulation: "Le profil le plus fréquent en libéral — préparé pour ce qui se programme, vulnérable face à l'imprévu. La marge de progression est précisément là : une fiche de relais courte couvre l'essentiel.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b5_d",
            label: "J'ai organisé la continuité : remplaçants rodés, protocoles, patients informés.",
            reformulation: "La résilience organisationnelle — un critère peu visible et très précieux. Vous pouvez vous absenter sans que le cabinet vacille.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b6",
        label: "La dernière fois que vous avez changé quelque chose dans l'organisation, comment ça s'est passé ?",
        context: "Un protocole, une habitude, une règle de tri.",
        options: [
          {
            id: "b6_a",
            label: "Ça n'a pas vraiment abouti, je l'évoque encore comme un projet.",
            reformulation: "L'intention sans exécution se transforme en frustration. Souvent ce n'est pas un défaut de décision, c'est l'absence d'un canal qui fait passer la décision à l'action quotidienne.",
            benchmark: null,
            score: 1,
          },
          {
            id: "b6_b",
            label: "Ça a pris plusieurs semaines, avec des allers-retours et quelques oublis.",
            reformulation: "Le changement diffuse lentement et de manière incomplète. Quelques rappels suffisent souvent à faire passer le palier — mais sans canal dédié, l'effort à fournir est démesuré.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b6_c",
            label: "Ça s'est fait en quelques semaines, avec quelques rappels au début.",
            reformulation: "Un rythme d'ajustement raisonnable. Vous avez un canal qui fonctionne — la marge porte sur la rapidité avec laquelle un nouveau protocole devient un automatisme.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b6_d",
            label: "Ça s'est fait en quelques jours, mise en œuvre rapide.",
            reformulation: "Une organisation qui sait absorber et ancrer le changement vite. C'est rare et c'est précieux — ça multiplie la fréquence à laquelle vous pouvez ajuster.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b7",
        label: "À quelle fréquence prenez-vous du recul sur l'organisation du cabinet ?",
        context: "Bilan court, point d'équipe, revue informelle.",
        options: [
          {
            id: "b7_a",
            label: "Jamais, j'avance. On en reparle quand un problème surgit.",
            reformulation: "Sans canal régulier pour traiter l'organisation, les décisions ne se prennent qu'en mode urgence. L'inertie qui s'accumule entre deux crises pèse, même quand elle ne se voit pas.",
            benchmark: null,
            score: 1,
          },
          {
            id: "b7_b",
            label: "Rarement. Je prends quelques moments informels, sans rythme défini.",
            reformulation: "Des échanges existent, mais sans cadence ils dépendent du hasard des disponibilités. Les sujets de fond passent souvent après l'opérationnel du jour.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b7_c",
            label: "Je prends quelques moments structurés par trimestre (équipe ou réflexion solo).",
            reformulation: "Un rythme de réflexion qui permet de faire bouger les choses. La régularité compte davantage que le formalisme — un trimestriel court vaut mieux qu'un annuel exhaustif.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b7_d",
            label: "J'ai un rituel installé, moments réguliers (mensuels), décisions tracées.",
            reformulation: "Un rituel d'amélioration continue. C'est ce qui permet à un cabinet de se transformer dans la durée sans tout réinventer à chaque cycle.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b8",
        label: "Quand vous devez discuter d'un cas clinique difficile, comment faites-vous ?",
        context: null,
        routing: "has_team==false",
        options: [
          {
            id: "b8_a",
            label: "Je gère seul, pas vraiment d'écho.",
            reformulation: "L'isolement clinique. C'est l'un des points les plus difficiles à objectiver en solo — quand on prend une décision sans contradiction, on ne sait pas ce qu'on a manqué.",
            benchmark: "60 % des généralistes solos déclarent ressentir un isolement professionnel marqué.",
            score: 1,
          },
          {
            id: "b8_b",
            label: "Je contacte un confrère par téléphone quand le besoin se fait sentir.",
            reformulation: "Un appel-pompier quand ça déborde. Utile dans l'urgence, mais ne remplace pas un cadre régulier — la discussion devient transactionnelle.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b8_c",
            label: "J'ai un ou deux confrères avec qui je peux échanger régulièrement.",
            reformulation: "Un binôme informel. C'est déjà un point d'appui clinique — la fiabilité dépend de la disponibilité de ces personnes-là.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b8_d",
            label: "Je participe à un groupe de pairs structuré (GAP, GBE) avec rythme régulier.",
            reformulation: "Un cadre formalisé pour réfléchir avec d'autres. C'est l'un des leviers les plus rentables sur la décision clinique à long terme.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b9",
        label: "Comment gérez-vous les tâches administratives non médicales ?",
        context: "Comptabilité, courriers, archivage, démarches CPAM.",
        routing: "has_team==false",
        options: [
          {
            id: "b9_a",
            label: "Je fais tout moi-même, ça s'empile.",
            reformulation: "L'auto-portage administratif. C'est souvent invisible dans le quotidien, mais ce sont 4 à 6 heures par semaine qui s'accumulent.",
            benchmark: "Les généralistes consacrent en moyenne 2 h 30 par jour aux tâches administratives, dont environ 40 % sont délégables.",
            score: 1,
          },
          {
            id: "b9_b",
            label: "J'ai sous-traité ponctuellement (comptable, courrier), sans système.",
            reformulation: "Une délégation à la carte. Utile pour les pics, mais demande de réorganiser à chaque fois — pas de routine stable.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b9_c",
            label: "J'ai structuré ma compta avec un expert-comptable, le reste je fais.",
            reformulation: "Une délégation comptable solide, le reste reste sur vos épaules. Bon socle mais marge sur l'admin courante.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b9_d",
            label: "J'ai sous-traité complètement : compta, secrétariat externe, outils numériques.",
            reformulation: "Une organisation administrative externalisée. Vous récupérez du temps cognitif pour le clinique.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "b10",
        label: "Comment gérez-vous les appels téléphoniques et les urgences pendant vos consultations ?",
        context: null,
        routing: "has_team==false",
        options: [
          {
            id: "b10_a",
            label: "Je décroche quand ça sonne, ça interrompt la consultation.",
            reformulation: "Le téléphone dicte le rythme. Chaque sonnerie casse l'attention clinique en cours — coût cognitif important, qualité d'écoute amoindrie pour le patient en face.",
            benchmark: "Une consultation interrompue par téléphone perd en moyenne 23 minutes de productivité à cause du coût de retour d'attention.",
            score: 1,
          },
          {
            id: "b10_b",
            label: "Je laisse sonner et rappelle quand je peux, parfois avec du retard.",
            reformulation: "Une discipline minimale. Le risque : laisser filer un appel important, et reporter mentalement chaque sonnerie qu'on entend.",
            benchmark: null,
            score: 2,
          },
          {
            id: "b10_c",
            label: "J'ai un répondeur clair avec plages de rappel dédiées.",
            reformulation: "Un cadre annoncé au patient. Vous récupérez le contrôle du rythme, et le patient sait quand vous le rappellerez.",
            benchmark: null,
            score: 3,
          },
          {
            id: "b10_d",
            label: "J'ai un système qui filtre (télésecrétariat), je ne décroche pas en consultation.",
            reformulation: "Une protection structurelle. Vos consultations sont préservées, le télésecrétariat trie ce qui mérite votre rappel immédiat.",
            benchmark: null,
            score: 4,
          },
        ],
      },
    ],
  },
  {
    id: "C",
    label: "Outils & dossiers",
    subtitle: "Logiciel médical, données patients, administration numérique",
    questions: [
      {
        id: "c1",
        label: "Comment qualifieriez-vous votre maîtrise de votre logiciel médical ?",
        context: null,
        options: [
          {
            id: "c1_a",
            label: "J'utilise les fonctions de base, le reste, je ne sais pas ce que ça fait.",
            reformulation: "Les fonctions de base couvrent l'essentiel mais laissent beaucoup de potentiel inexploité. La plupart des médecins découvrent ce que leur logiciel sait faire en quelques heures de formation ciblée.",
            benchmark: "Une demi-journée de formation ciblée sur le logiciel métier permet de gagner 25 à 40 minutes par jour de consultation.",
            score: 1,
          },
          {
            id: "c1_b",
            label: "Je me débrouille, avec quelques fonctions apprises au fil du temps.",
            reformulation: "L'apprentissage autodidacte couvre l'usage quotidien mais laisse des angles morts coûteux — souvent les fonctions de gain de temps les plus rentables.",
            benchmark: null,
            score: 2,
          },
          {
            id: "c1_c",
            label: "Je connais bien mon logiciel et j'utilise la plupart des fonctions utiles.",
            reformulation: "Une bonne maîtrise outil. C'est un multiplicateur de temps qui se voit peu, parce qu'il est intégré dans chaque consultation.",
            benchmark: null,
            score: 3,
          },
          {
            id: "c1_d",
            label: "J'ai rodé mon organisation : modèles, raccourcis, automatisations.",
            reformulation: "Le réglage de l'organisation est l'un des leviers à plus fort retour sur temps investi en cabinet. Vous récoltez le bénéfice à chaque consultation, chaque journée.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "c2",
        label: "Comment sont tenus les dossiers patients dans votre cabinet ?",
        context: null,
        options: [
          {
            id: "c2_a",
            label: "Les dossiers sont là, mais leur contenu varie beaucoup selon les patients.",
            reformulation: "Des dossiers hétérogènes posent deux problèmes : un risque qualité quand on retrouve un patient après plusieurs mois, et un frein à toute délégation possible.",
            benchmark: null,
            score: 1,
          },
          {
            id: "c2_b",
            label: "Il y a une structure de base, mais elle n'est pas toujours respectée.",
            reformulation: "La structure non appliquée donne l'illusion du système sans les bénéfices. Il manque souvent peu de chose pour franchir le palier — un rappel partagé, un modèle par défaut.",
            benchmark: null,
            score: 2,
          },
          {
            id: "c2_c",
            label: "Je tiens une trame cohérente, les infos importantes sont rapidement accessibles.",
            reformulation: "Une trame cohérente respectée — c'est ce qui rend la consultation plus rapide à l'ouverture du dossier, et qui sécurise les prises en charge complexes.",
            benchmark: "Un dossier structuré réduit le temps de consultation de 2 à 4 minutes en moyenne.",
            score: 3,
          },
          {
            id: "c2_d",
            label: "Je tiens des dossiers structurés, transmissibles à n'importe quel praticien.",
            reformulation: "La qualité dossier est la fondation de la continuité des soins. À ce niveau, votre cabinet peut absorber sereinement un remplaçant, un associé, une délégation.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "c3",
        label: "Comment gérez-vous le flux administratif quotidien ?",
        context: "Courriers, résultats, ordonnances, feuilles de soins.",
        options: [
          {
            id: "c3_a",
            label: "C'est une source de stress, j'ai toujours du retard.",
            reformulation: "Le flux administratif non maîtrisé est l'un des premiers facteurs cités dans le mal-être professionnel des généralistes. Ce qui pèse n'est pas le volume — c'est l'absence d'espace dédié dans la semaine.",
            benchmark: "Les généralistes consacrent en moyenne 2 h 30 par jour aux tâches administratives, dont environ 40 % sont délégables.",
            score: 1,
          },
          {
            id: "c3_b",
            label: "Je gère, mais ça prend beaucoup de temps hors des heures de consultation.",
            reformulation: "Le débordement sur les plages hors-consultation est un signal d'alerte sur la soutenabilité — pas un défaut d'organisation individuelle, mais un système qui n'a pas encore intégré ses tâches admin dans son rythme.",
            benchmark: null,
            score: 2,
          },
          {
            id: "c3_c",
            label: "J'ai des plages dédiées et des méthodes pour traiter ce flux efficacement.",
            reformulation: "Traiter l'administratif en temps masqué est souvent le premier pas vers une semaine vraiment organisée. Le travail est fait, mais sans grignoter les marges personnelles.",
            benchmark: null,
            score: 3,
          },
          {
            id: "c3_d",
            label: "J'ai largement délégué ou automatisé le flux administratif.",
            reformulation: "La délégation administrative est souvent la transformation la plus rapide et la plus impactante quand un cabinet l'engage. Vous récupérez ce que ces tâches ne devraient jamais avoir consommé.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "c4",
        label: "Quels outils numériques de santé utilisez-vous au quotidien ?",
        context: "Mon Espace Santé, MSSanté, téléconsultation, dossier régional.",
        options: [
          {
            id: "c4_a",
            label: "Je m'en tiens aux outils obligatoires (carte Vitale, télétransmission).",
            reformulation: "Le socle réglementaire est en place. Au-delà, plusieurs outils peuvent apporter un gain rapide (messagerie sécurisée, alimentation DMP, téléexpertise) — un petit investissement de prise en main pour un confort durable.",
            benchmark: "Mon Espace Santé est activé pour plus de 12 millions de Français — le numérique s'installe comme standard d'échange.",
            score: 1,
          },
          {
            id: "c4_b",
            label: "J'ai testé quelques outils en plus (MSSanté, téléconsultation), sans régularité.",
            reformulation: "Vous avez ouvert la porte. Reste à transformer l'essai : un outil utilisé ponctuellement ne crée pas de bénéfice durable, mais l'avoir mis en main montre que la marche est franchissable.",
            benchmark: "Plus de 70 % des médecins généralistes utilisent au moins un outil e-santé au-delà du strict obligatoire — la dynamique est large.",
            score: 2,
          },
          {
            id: "c4_c",
            label: "J'utilise activement plusieurs (MSSanté, Mon Espace Santé, téléconsultation), avec retour positif.",
            reformulation: "Une posture sélective et active. Vous adoptez ce qui apporte un bénéfice tangible, sans céder à l'effet de mode — la posture la plus saine vis-à-vis du numérique en santé.",
            benchmark: null,
            score: 3,
          },
          {
            id: "c4_d",
            label: "Je les ai intégrés à mon organisation, ils fluidifient le parcours patient.",
            reformulation: "L'intégration dans l'organisation change la nature de ces outils — ils deviennent des leviers du quotidien, pas des cases à cocher. Vous êtes en position de tester les évolutions à venir avant la grande majorité.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "c5",
        label: "Comment positionnez-vous l'IA générative dans votre activité ?",
        context: "Rédaction de courriers, synthèses, recherches cliniques, aide à la décision.",
        options: [
          {
            id: "c5_a",
            label: "Je ne l'utilise pas, je n'en vois pas l'intérêt ou je préfère attendre.",
            reformulation: "Attendre est une posture légitime tant que les dispositifs conformes ne sont pas matures. Le risque d'attente trop longue : que les confrères équipés prennent une avance organisationnelle difficile à rattraper ensuite.",
            benchmark: null,
            score: 1,
          },
          {
            id: "c5_b",
            label: "Je l'utilise ponctuellement sur des sujets génériques, avec questions sur le cadre.",
            reformulation: "Un usage prudent sur des sujets non patient. C'est probablement la posture la plus répandue actuellement — et celle où les questions de cadre vont devenir de plus en plus présentes.",
            benchmark: null,
            score: 2,
          },
          {
            id: "c5_c",
            label: "Je l'utilise régulièrement avec vigilance, sans dispositif dédié au médical.",
            reformulation: "L'usage régulier d'une IA grand public sur des éléments métier, même avec vigilance, sort du cadre RGPD et du secret médical. C'est précisément ce que Lugia vient sécuriser — sans changer vos habitudes au quotidien, dans un environnement conforme.",
            benchmark: "Une majorité de médecins ayant testé l'IA générative l'utilisent désormais régulièrement sur des tâches admin ou cliniques, le plus souvent en dehors du cadre légal.",
            score: 3,
          },
          {
            id: "c5_d",
            label: "J'ai intégré un dispositif IA conforme au secret médical (hébergeur HDS, IA locale, prestataire certifié santé) dans mon organisation.",
            reformulation: "L'usage conforme du secret médical structuré au cœur de l'organisation. Vous êtes en avance sur la transition que beaucoup de cabinets vont devoir engager dans les 24 prochains mois.",
            benchmark: null,
            score: 4,
          },
        ],
      },
      {
        id: "c6",
        label: "À quel point les enjeux de conformité de votre cabinet sont-ils suivis activement ?",
        context: "RGPD, HDS, DMP, CCAM, MSSanté…",
        options: [
          {
            id: "c6_a",
            label: "Je sais qu'il y a des enjeux, je n'ai pas le temps de m'y pencher au quotidien.",
            reformulation: "Les enjeux de conformité avancent en arrière-plan, parfois sans signal — jusqu'au jour où un contrôle CPAM, une plainte ou un incident les ramène au premier plan. C'est rarement gérable à chaud sans un minimum de veille en amont.",
            benchmark: null,
            score: 1,
          },
          {
            id: "c6_b",
            label: "Je suis ce qu'on m'envoie (CPAM, DPC, instances), sans démarche proactive.",
            reformulation: "La conformité subie. Vous traitez ce qui arrive, mais sans hiérarchiser ce qui est applicable à votre cabinet en particulier — ce qui peut laisser passer des évolutions importantes.",
            benchmark: null,
            score: 2,
          },
          {
            id: "c6_c",
            label: "Je suis 2 ou 3 sujets majeurs et m'informe régulièrement (HAS, RGPD, MSSanté).",
            reformulation: "Une veille ciblée sur les sujets prioritaires. C'est une posture mature qui évite la surcharge informationnelle tout en gardant un cadre clair.",
            benchmark: null,
            score: 3,
          },
          {
            id: "c6_d",
            label: "J'ai cartographié les enjeux, je les suis avec revues, mises à jour, traçabilité.",
            reformulation: "Une démarche structurée de gouvernance de la conformité. Rare en médecine libérale — vous transformez ces enjeux en levier de qualité plutôt qu'en source d'inquiétude.",
            benchmark: null,
            score: 4,
          },
        ],
      },
    ],
  },
];

/** Lookup par id de bloc. */
export function getBloc(blocId: "A" | "B" | "C"): V3Bloc {
  const b = V3_BLOCS.find((x) => x.id === blocId);
  if (!b) throw new Error(`Bloc inconnu : ${blocId}`);
  return b;
}
/**
 * Filtre les questions d'un bloc selon le profil utilisateur (routing).
 *
 * Routing supporté :
 *   - "cabinet_type==solo" / "cabinet_type!=solo"
 *   - "secretariat==seul" / "secretariat!=seul"
 *   - "has_team==true"   / "has_team==false"
 *
 * has_team = au moins un signal d'équipe : cabinet non-solo
 * OU paramédical présent OU secrétariat non géré seul.
 *
 * Utilisé à la fois pour le rendu (`BlocV3`) et pour le calcul de
 * `completeness` côté `buildLocalScores` — c'est le même dénominateur
 * partout (compteur footer, barre Topbar, radar live, transitions).
 */
export function filterQuestionsByRouting(
  questions: V3BlocQuestion[],
  cabinetType: string | undefined,
  secretariat: string | undefined,
  paramedicalTeam: string | undefined,
): V3BlocQuestion[] {
  const isSolo = (cabinetType ?? "").toLowerCase() === "solo";
  const isSecSeul = (secretariat ?? "").toLowerCase() === "seul";
  const isParaNone = (paramedicalTeam ?? "").toLowerCase() === "non";
  // has_team = au moins un signal d'équipe (groupe / paramédical / secrétariat)
  const hasTeam = !isSolo || !isParaNone || !isSecSeul;
  return questions.filter((q) => {
    if (!q.routing) return true;
    if (q.routing === "cabinet_type==solo") return isSolo;
    if (q.routing === "cabinet_type!=solo") return !isSolo;
    if (q.routing === "secretariat==seul") return isSecSeul;
    if (q.routing === "secretariat!=seul") return !isSecSeul;
    if (q.routing === "has_team==true") return hasTeam;
    if (q.routing === "has_team==false") return !hasTeam;
    return true;
  });
}

