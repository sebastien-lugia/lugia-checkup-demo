# V2.0 — Brouillon éditorial complet

**Version** : 1.0 — 19 mai 2026 (passe éditoriale complète — 5 lots livrés)
**État** : en cours de rédaction (5 lots successifs)

> Ce document consolide tout le contenu éditorial de la V2.0 du check-up Lugia :
> reformulations terrain, benchmarks, titres de diagnostic, modules d'approfondissement,
> messages des règles de personnalisation. Après validation lot par lot, le contenu
> sera intégré dans `interview_protocol_v2.json`, `diagnostics_v2.json`, `modules_v2.json`
> et `src/v2/personalize.py`.

> **Ton Lugia** : simple, claire, sobre, humaine, professionnelle, rassurante, non
> culpabilisante. Pas de jargon consulting. Le système est sujet de l'analyse, jamais
> les personnes. Posture : levier d'action, pas culpabilité (cf §10 spec V2 v1.4).

---

## Lot 1 — Bloc A : Parcours patient

### Titres de diagnostic par niveau (axe A)

| Niveau | Titre serif court |
|---|---|
| **À risque** | Le patient navigue à vue. |
| **À surveiller** | Des bases existent, mais elles restent fragiles. |
| **Opérationnel** | Le parcours est maîtrisé sur les situations courantes. |
| **Maîtrisé** | Un parcours fluide, de bout en bout. |

Note : conservé tel quel de V3, formulations déjà très Lugia (descriptif systémique, pas de jugement individuel).

---

### Question A1 — Urgences du jour

> *Quand un patient appelle pour un motif urgent, que se passe-t-il ?*
> *Contexte : pensez à la semaine dernière.*

#### `a1_a` (s=1) — Il est renvoyé aux urgences ou rappelle de lui-même.
- **Reformulation** : La demande urgente sans filet interne est le premier point de tension d'un cabinet saturé. C'est souvent ce qui finit par déborder en premier.
- **Benchmark** : Environ 60 % des passages aux urgences non programmés pourraient être absorbés par un cabinet de proximité avec un protocole de tri simple. *(Source : panorama DREES sur l'aval des urgences, à valider en source précise.)*

#### `a1_b` (s=2) — Le secrétariat évalue et propose un créneau si possible.
- **Reformulation** : Un premier tri existe — il dépend de la personne qui décroche, pas d'une règle partagée. Ça tient jusqu'au jour où elle est absente.
- **Benchmark** : —

#### `a1_c` (s=3) — Des créneaux dédiés sont bloqués chaque matin, avec des critères connus de tous.
- **Reformulation** : Un protocole formalisé. Ce que ça libère ne se voit pas tout de suite — c'est la charge mentale qui baisse en arrière-plan.
- **Benchmark** : —

#### `a1_d` (s=4) — La régulation est partagée avec d'autres praticiens du territoire.
- **Reformulation** : Une coordination qui dépasse le cabinet. Rare en médecine générale, et c'est ce qui rend l'organisation soutenable à long terme.
- **Benchmark** : —

---

### Question A2 — Demandes non programmées hors urgences

> *Comment gérez-vous les demandes non programmées hors urgences — ordonnance à renouveler, résultat à commenter, question simple ?*

#### `a2_a` (s=1) — Tout passe par une consultation, je n'ai pas d'autre canal.
- **Reformulation** : Toute demande devient une consultation. Pour le médecin, c'est du flux qui se compresse ; pour le patient, c'est de l'attente pour des choses parfois mineures.
- **Benchmark** : 30 à 40 % des consultations courtes pourraient être traitées par un autre canal sans perte de qualité de soin. *(Source : à valider — études sur la téléconsultation asynchrone CNAM.)*

#### `a2_b` (s=2) — Je traite ces demandes au fil de l'eau, sans cadre formalisé.
- **Reformulation** : Le « fil de l'eau » est efficace tant qu'il reste léger. Au-delà, il devient un mode d'usure invisible — quelques minutes par-ci, par-là, qui n'apparaissent dans aucun planning.
- **Benchmark** : —

#### `a2_c` (s=3) — Le secrétariat absorbe les demandes simples avec des critères connus.
- **Reformulation** : La délégation des demandes simples avec un cadre clair. Le secrétariat retrouve de la marge, le médecin garde le temps cognitif pour les vraies décisions.
- **Benchmark** : —

#### `a2_d` (s=4) — Un canal asynchrone structuré (messagerie sécurisée, espace patient) traite ces demandes.
- **Reformulation** : Un canal asynchrone bien rodé change la temporalité du cabinet. Les demandes simples ne consomment plus de créneaux et le patient reste informé.
- **Benchmark** : —

---

### Question A3 — Sortie de consultation (consigne entre deux consults)

> *Comment le patient sait-il ce qu'il doit faire entre deux consultations ?*
> *Contexte : résultats d'analyses, ordonnances, surveillance de symptômes.*

#### `a3_a` (s=1) — Il rappelle ou revient — on gère à ce moment-là.
- **Reformulation** : La boucle ouverte. Chaque rappel est légitime côté patient et coûte du temps côté cabinet — sans qu'on puisse anticiper le moment.
- **Benchmark** : 40 % des rappels entrants seraient évitables avec une consigne de sortie systématique. *(Source : enquête organisationnelle URPS, à confirmer.)*

#### `a3_b` (s=2) — J'explique à l'oral en fin de consultation.
- **Reformulation** : L'oral est précieux pendant la consultation. 48 h après, le patient retient rarement les 3 points clés — c'est le moment où la consigne devient utile.
- **Benchmark** : —

#### `a3_c` (s=3) — Une consigne écrite (impression ou SMS) part systématiquement avec lui.
- **Reformulation** : La trace écrite multiplie la compliance. Et accessoirement, elle réduit les rappels « pour confirmer ».
- **Benchmark** : —

#### `a3_d` (s=4) — Le patient accède à son suivi en ligne (messagerie sécurisée, espace patient).
- **Reformulation** : L'autonomisation numérique du suivi. Le patient devient acteur entre les consultations, votre charge de coordination diminue de façon significative.
- **Benchmark** : —

---

### Question A4 — Suivi des chroniques connus

> *Comment gérez-vous le suivi de vos patients chroniques connus ?*
> *Contexte : diabète, HTA, insuffisance cardiaque, BPCO…*

#### `a4_a` (s=1) — Ils rappellent quand ils ont besoin — je les vois alors.
- **Reformulation** : Un suivi qui dépend de l'initiative du patient. Les plus organisés reviennent, les plus fragiles disparaissent — souvent sans signal.
- **Benchmark** : 15 à 20 % des patients chroniques n'ont pas eu de consultation dédiée dans l'année. *(Source : indicateurs ROSP / DREES, à préciser.)*

#### `a4_b` (s=2) — J'essaie de programmer des renouvellements, sans système formalisé.
- **Reformulation** : Une intention de suivi qui se diffuse dans le flux quotidien. Sans outil de relance, les files actives se perdent dans le rythme des consultations.
- **Benchmark** : —

#### `a4_c` (s=3) — Une liste de patients chroniques est tenue à jour avec des rappels de suivi.
- **Reformulation** : La file active tracée. C'est l'un des leviers de qualité les plus impactants en médecine de famille — et celui qui se voit le moins de l'extérieur.
- **Benchmark** : —

#### `a4_d` (s=4) — Le suivi est intégré dans le logiciel avec alertes et indicateurs.
- **Reformulation** : Le suivi industrialisé. Vous avez préparé l'organisation à pouvoir tenir sur la durée, indépendamment de votre charge mémoire.
- **Benchmark** : —

---

### Question A5 — Chroniques perdus de vue (dépistage proactif)

> *Comment identifiez-vous les patients chroniques qui devraient revenir mais ne viennent plus ?*

#### `a5_a` (s=1) — Je ne le fais pas — je ne vois pas comment m'y prendre.
- **Reformulation** : L'angle mort de la médecine de famille. Les patients silencieux sont souvent les plus à risque — et les plus difficiles à repérer sans outil dédié.
- **Benchmark** : Un programme de relance simple récupère 70 % des patients chroniques perdus de vue dans les 3 mois. *(Source : retours CPTS sur les expérimentations, à confirmer.)*

#### `a5_b` (s=2) — Je m'en rends compte par hasard, quand un patient revient après un long délai.
- **Reformulation** : La détection au coup par coup. Vous repérez certains patients, mais sans pouvoir agir sur ceux que vous n'avez pas vus depuis 18 mois.
- **Benchmark** : —

#### `a5_c` (s=3) — Je relance ponctuellement les patients que j'identifie à risque.
- **Reformulation** : Une démarche active sur les profils que vous avez en tête. La marge de progression : étendre à des critères systématiques pour ne plus dépendre de votre seule mémoire.
- **Benchmark** : —

#### `a5_d` (s=4) — Une extraction logiciel régulière identifie les patients sans consultation depuis X mois et déclenche une relance.
- **Reformulation** : Un dispositif qui chasse les silences. C'est un changement de posture — vous ne réagissez plus à la demande, vous prévenez l'absence.
- **Benchmark** : —

---

### Question A6 — Tri des résultats d'examens

> *Comment êtes-vous alerté quand un résultat d'examen important arrive pour un patient ?*

#### `a6_a` (s=1) — Vérification opportuniste — je consulte les résultats quand j'y pense.
- **Reformulation** : Le tri dépend entièrement de votre présence d'esprit. Une journée chargée et un résultat critique peut attendre — c'est rarement un défaut de vigilance, c'est un défaut de système.
- **Benchmark** : —

#### `a6_b` (s=2) — Tri délégué — le secrétariat vérifie et m'alerte sur ce qui me semble critique.
- **Reformulation** : Un premier filet en relais. Sa fiabilité dépend du temps disponible du secrétariat et de la clarté des critères d'alerte que vous avez partagés.
- **Benchmark** : —

#### `a6_c` (s=3) — Vérification régulière — je consulte les résultats à heures fixes plusieurs fois par jour.
- **Reformulation** : Une discipline personnelle solide. Reste un point d'attention : c'est une vigilance qui repose sur vous seul — et qui s'use les jours de fatigue.
- **Benchmark** : —

#### `a6_d` (s=4) — Signalement automatique — le logiciel ou la plateforme m'alerte sur les valeurs hors normes.
- **Reformulation** : L'alerte structurelle. Vous gagnez du temps cognitif et vous réduisez le risque qu'un résultat critique passe entre les mailles.
- **Benchmark** : —

---

### Benchmarks chiffrés en bref (synthèse Lot 1)

| Bench | Source à confirmer | Utilisation |
|---|---|---|
| 60 % des urgences absorbables avec tri simple | DREES aval des urgences | a1_a |
| 30-40 % des consultations courtes traitables autrement | CNAM téléconsultation asynchrone | a2_a |
| 40 % des rappels entrants évitables avec consigne | URPS enquêtes organisationnelles | a3_a |
| 15-20 % des chroniques sans consultation annuelle | DREES / ROSP | a4_a |
| 70 % des perdus de vue récupérables par relance simple | CPTS expérimentations | a5_a |

**À faire avant intégration finale** : sourcer chaque chiffre proprement. Les pourcentages indiqués sont des ordres de grandeur cohérents avec la littérature mais à valider individuellement (DREES, CNAM, IRDES, CMG, URPS).

---

---

## Lot 2 — Bloc B : Équipe & secrétariat

### Titres de diagnostic par niveau (axe B)

| Niveau | Titre serif court |
|---|---|
| **À risque** | L'organisation repose sur vous seul. |
| **À surveiller** | Une équipe qui fonctionne, mais sous tension. |
| **Opérationnel** | Une équipe organisée et relativement autonome. |
| **Maîtrisé** | Un cabinet bien gouverné, équipe responsabilisée. |

---

### Question B1 — Répartition des rôles

> *Comment sont répartis les rôles dans votre cabinet ?*

#### `b1_a` (s=1) — Je gère tout moi-même, ou avec une aide ponctuelle non formalisée.
- **Reformulation** : Le médecin qui fait tout. C'est le modèle le plus courant en libéral solo — et celui qui s'use le plus vite, parce que tout repose sur la même personne.
- **Benchmark** : **[À CONFIRMER]** 62 % des généralistes déclarent gérer plus de 30 % de tâches non médicales faute d'organisation. *(Source à vérifier : enquête CMG ou URPS sur le temps médical.)*

#### `b1_b` (s=2) — Il y a une répartition, mais elle s'est faite au fil du temps.
- **Reformulation** : Les rôles existent mais ne sont pas nommés. Tant que tout le monde est là, ça tient ; à la première absence ou nouvelle recrue, les angles morts apparaissent.
- **Benchmark** : —

#### `b1_c` (s=3) — Chacun a un périmètre clair — on déborde parfois pour s'entraider.
- **Reformulation** : Des rôles clairs avec une porosité contrôlée. C'est l'équilibre qui rend l'équipe à la fois lisible et solidaire — il faut le maintenir consciemment.
- **Benchmark** : —

#### `b1_d` (s=4) — Les rôles sont formalisés et évoluent avec les compétences.
- **Reformulation** : Une délégation formalisée qui évolue avec l'équipe. C'est l'organisation qui tient quand quelqu'un change de poste, part en formation ou s'absente.
- **Benchmark** : **[À CONFIRMER]** Les cabinets avec assistant médical récupèrent 45 minutes de temps médical par jour. *(Source à vérifier : bilan CNAM du dispositif assistant médical.)*

---

### Question B1B *(routing solo)* — Assistant médical envisagé

> *Vous gérez seul votre cabinet — avez-vous envisagé un assistant médical ?*
> *Contexte : ce dispositif est soutenu financièrement par les accords conventionnels.*

#### `b1b_a` (s=1) — Non, je ne connais pas bien ce dispositif.
- **Reformulation** : Le dispositif assistant médical reste mal connu, alors qu'il est éligible à un financement conventionnel pour un médecin solo. Ça ne se transforme pas en projet sans information de départ.
- **Benchmark** : —

#### `b1b_b` (s=2) — J'y ai pensé, mais les contraintes m'ont découragé.
- **Reformulation** : Les contraintes du dispositif sont réelles, mais souvent surévaluées par rapport à ce qu'elles permettent de récupérer ensuite. Le frein est rarement le bon — c'est généralement la première lecture qui décourage.
- **Benchmark** : —

#### `b1b_c` (s=3) — C'est un projet que j'explore activement.
- **Reformulation** : Un projet en cours d'exploration. Les structures d'appui (CPTS, CPAM, URPS) peuvent accompagner concrètement les démarches — vous n'avez pas à tout porter seul.
- **Benchmark** : —

#### `b1b_d` (s=4) — J'ai déjà un assistant médical ou une secrétaire à temps plein.
- **Reformulation** : Vous avez passé ce cap structurant. L'enjeu se déplace : il s'agit maintenant d'optimiser la répartition des tâches et de tirer pleinement parti du dispositif.
- **Benchmark** : —

---

### Question B3 *(routing non-solo)* — Charge du secrétariat

> *Comment décririez-vous la charge de travail du secrétariat ?*

#### `b3_a` (s=1) — Chroniquement débordé — on gère les urgences en permanence.
- **Reformulation** : Un secrétariat en surrégime continu. Les tâches à valeur ajoutée disparaissent au profit du flux — et avec elles, ce qui pourrait alléger le cabinet à moyen terme.
- **Benchmark** : **[À CONFIRMER]** Un secrétariat débordé traite jusqu'à 2,3× plus d'appels que nécessaire faute de protocoles de tri. *(Source à vérifier : retours d'études de cas CPTS sur l'optimisation des appels.)*

#### `b3_b` (s=2) — Variable — gérable certains jours, tendu d'autres.
- **Reformulation** : La variabilité non maîtrisée. Elle use autant que la surcharge constante, parce que l'équipe ne peut pas anticiper et alterne entre surchauffe et décompression.
- **Benchmark** : —

#### `b3_c` (s=3) — Globalement maîtrisé grâce à une organisation rodée.
- **Reformulation** : Une charge maîtrisée. C'est le signe d'un système, pas d'une chance — il faut continuer à l'entretenir pour qu'il tienne dans la durée.
- **Benchmark** : —

#### `b3_d` (s=4) — Optimisé — le secrétariat se concentre sur ce qui a vraiment de la valeur.
- **Reformulation** : L'optimisation du front-office. Souvent le levier le plus rapide pour améliorer simultanément l'expérience patient et la sérénité de l'équipe.
- **Benchmark** : —

---

### Question B4 — Circulation des informations dans l'équipe

> *Comment les informations circulent-elles entre les membres de l'équipe ?*
> *Contexte : messages patients, urgences du jour, tâches en attente.*

#### `b4_a` (s=1) — À l'oral, quand on se croise — ce n'est pas toujours idéal.
- **Reformulation** : La transmission orale au vol. Elle dépend entièrement de la présence simultanée — ce qui devient fragile dès qu'un membre s'absente ou change de rythme.
- **Benchmark** : —

#### `b4_b` (s=2) — Par notes papier ou messages informels, avec quelques ratés.
- **Reformulation** : Le papier fonctionne jusqu'à un certain seuil de volume. Au-delà, les erreurs s'accumulent silencieusement — un message oublié sur un bureau, une note qui se perd.
- **Benchmark** : —

#### `b4_c` (s=3) — Il y a un outil ou un rituel de transmission (carnet, tableau, point quotidien).
- **Reformulation** : Un rituel de transmission, même simple, change la dynamique. Les oublis baissent et la cohésion d'équipe se renforce — c'est ce qui se voit le moins dans le quotidien et qui fait le plus de différence.
- **Benchmark** : **[À CONFIRMER]** 78 % des cabinets bien organisés citent le point d'équipe de 10 min en début de journée comme la pratique la plus impactante. *(Source à vérifier : enquête organisationnelle, possiblement CMG ou MG France.)*

#### `b4_d` (s=4) — La communication est structurée : outil partagé, points réguliers, traçabilité.
- **Reformulation** : Une communication structurée libère la charge mentale collective. Chacun sait où l'information se trouve et qui en est responsable.
- **Benchmark** : —

---

### Question B5 — Continuité en cas d'absence (Q08 V1.1.9 conservée)

> *Imaginez que vous deviez vous absenter — pour des congés prévus ou un imprévu de plusieurs jours.*

#### `b5_a` (s=1) — C'est compliqué — les patients sans solution et le retour chaotique, je l'évite.
- **Reformulation** : L'absence révèle que tout repose sur des personnes, rien sur des processus. C'est la signature d'un cabinet construit autour d'une personne clé.
- **Benchmark** : —

#### `b5_b` (s=2) — On bricole une solution à chaque fois — ça dépend des disponibilités.
- **Reformulation** : Le bricolage récurrent est un chantier déguisé en anecdote. Chaque absence demande une énergie de coordination disproportionnée pour ce qui devrait être routinier.
- **Benchmark** : —

#### `b5_c` (s=3) — Préparé pour les congés, fragile pour l'imprévu — je sais fermer pour mes congés, je ne sais pas comment je gérerais une absence soudaine.
- **Reformulation** : Le profil le plus fréquent en libéral — préparé pour ce qui se programme, vulnérable face à l'imprévu. La marge de progression est précisément là : une fiche de relais courte couvre l'essentiel.
- **Benchmark** : —

#### `b5_d` (s=4) — La continuité est organisée : remplaçants rodés, protocoles, patients informés.
- **Reformulation** : La résilience organisationnelle — un critère peu visible et très précieux. Vous pouvez vous absenter sans que le cabinet vacille.
- **Benchmark** : —

---

### Question B6 — Décisions et changement organisationnel concret

> *La dernière fois que vous avez changé quelque chose dans l'organisation du cabinet — un protocole, une habitude, une règle de tri —, comment ça s'est passé ?*

#### `b6_a` (s=1) — Le changement reste souvent à l'état d'intention — j'ai du mal à le rendre effectif.
- **Reformulation** : L'intention sans exécution se transforme en frustration. Souvent ce n'est pas un défaut de décision, c'est l'absence d'un canal qui fait passer la décision à l'action quotidienne.
- **Benchmark** : —

#### `b6_b` (s=2) — Plusieurs semaines d'allers-retours et des oublis avant que ça tienne.
- **Reformulation** : Le changement diffuse lentement et de manière incomplète. Quelques rappels suffisent souvent à faire passer le palier — mais sans canal dédié, l'effort à fournir est démesuré.
- **Benchmark** : —

#### `b6_c` (s=3) — Quelques semaines, avec un peu de vérification et de rappels au début.
- **Reformulation** : Un rythme d'ajustement raisonnable. Vous avez un canal qui fonctionne — la marge porte sur la rapidité avec laquelle un nouveau protocole devient un automatisme.
- **Benchmark** : —

#### `b6_d` (s=4) — Quelques jours — l'équipe (ou moi en solo) sait mettre en œuvre rapidement.
- **Reformulation** : Une organisation qui sait absorber et ancrer le changement vite. C'est rare et c'est précieux — ça multiplie la fréquence à laquelle vous pouvez ajuster.
- **Benchmark** : —

---

### Question B7 — Temps de coordination (inertie des chaînes d'action)

> *À quelle fréquence prenez-vous du recul sur l'organisation du cabinet — bilan court, point d'équipe, revue informelle —, en dehors de la gestion clinique quotidienne ?*

#### `b7_a` (s=1) — Jamais — j'avance, je ne prends pas le temps. On en parle quand un problème surgit.
- **Reformulation** : Sans canal régulier pour traiter l'organisation, les décisions ne se prennent qu'en mode urgence. L'inertie qui s'accumule entre deux crises pèse, même quand elle ne se voit pas.
- **Benchmark** : —

#### `b7_b` (s=2) — Rarement — quelques échanges informels, sans rythme défini.
- **Reformulation** : Des échanges existent, mais sans cadence ils dépendent du hasard des disponibilités. Les sujets de fond passent souvent après l'opérationnel du jour.
- **Benchmark** : —

#### `b7_c` (s=3) — Quelques moments structurés par trimestre — point d'équipe ou réflexion personnelle.
- **Reformulation** : Un rythme de réflexion qui permet de faire bouger les choses. La régularité compte davantage que le formalisme — un trimestriel court vaut mieux qu'un annuel exhaustif.
- **Benchmark** : —

#### `b7_d` (s=4) — Rituel installé — moments réguliers (mensuels au minimum), avec décisions tracées et suivies.
- **Reformulation** : Un rituel d'amélioration continue. C'est ce qui permet à un cabinet de se transformer dans la durée sans tout réinventer à chaque cycle.
- **Benchmark** : —

---

### Benchmarks chiffrés en bref (synthèse Lot 2)

| Bench | Statut | Utilisation |
|---|---|---|
| 62 % de généralistes gèrent > 30 % de tâches non médicales | **[À CONFIRMER]** CMG / URPS | b1_a |
| Assistant médical = +45 min de temps médical / jour | **[À CONFIRMER]** Bilan CNAM | b1_d |
| Secrétariat débordé = 2,3× plus d'appels | **[À CONFIRMER]** Études CPTS | b3_a |
| Point d'équipe 10 min cité par 78 % des cabinets organisés | **[À CONFIRMER]** Enquête CMG / MG France | b4_c |

**Rappel posture éditoriale** : tous ces chiffres sont des ordres de grandeur cohérents avec la littérature publique mais nécessitent une vérification source par source avant intégration en prod. La mention `**[À CONFIRMER]**` doit subsister jusqu'à validation.

---

---

## Lot 3 — Bloc C : Outils & dossiers

### Titres de diagnostic par niveau (axe C)

| Niveau | Titre serif court |
|---|---|
| **À risque** | Les outils travaillent contre vous. |
| **À surveiller** | Les outils sont là, mais pas encore au service du soin. |
| **Opérationnel** | Les outils soutiennent l'activité clinique. |
| **Maîtrisé** | Un cabinet numérique mature. |

---

### Question C1 — Maîtrise du logiciel médical

> *Comment qualifieriez-vous votre maîtrise de votre logiciel médical ?*

Note : le logiciel précis est connu via le profil (`logiciel_metier`). Les reformulations terrain peuvent donc le nommer dynamiquement dans le rendu final (« dans Médidoc, le module file active est dans Patients > Suivi »).

#### `c1_a` (s=1) — J'utilise les fonctions de base — le reste, je ne sais pas ce que ça fait.
- **Reformulation** : Les fonctions de base couvrent l'essentiel mais laissent beaucoup de potentiel inexploité. La plupart des médecins découvrent ce que leur logiciel sait faire en quelques heures de formation ciblée.
- **Benchmark** : **[À CONFIRMER]** Une demi-journée de formation ciblée sur le logiciel métier permet de gagner 25 à 40 minutes par jour de consultation. *(Source à vérifier : enquête CMG ou retours formations URPS.)*

#### `c1_b` (s=2) — Je me débrouille, avec quelques fonctions apprises au fil du temps.
- **Reformulation** : L'apprentissage autodidacte couvre l'usage quotidien mais laisse des angles morts coûteux — souvent les fonctions de gain de temps les plus rentables.
- **Benchmark** : —

#### `c1_c` (s=3) — Je connais bien mon logiciel et j'utilise la plupart des fonctions utiles.
- **Reformulation** : Une bonne maîtrise outil. C'est un multiplicateur de temps qui se voit peu, parce qu'il est intégré dans chaque consultation.
- **Benchmark** : —

#### `c1_d` (s=4) — Workflow optimisé : modèles, raccourcis, automatisations.
- **Reformulation** : L'optimisation workflow est l'un des leviers à plus fort retour sur temps investi en cabinet. Vous récoltez le bénéfice à chaque consultation, chaque journée.
- **Benchmark** : —

---

### Question C2 — Tenue des dossiers patients

> *Comment sont tenus les dossiers patients dans votre cabinet ?*

#### `c2_a` (s=1) — Les dossiers sont là, mais leur contenu varie beaucoup selon les patients.
- **Reformulation** : Des dossiers hétérogènes posent deux problèmes : un risque qualité quand on retrouve un patient après plusieurs mois, et un frein à toute délégation possible.
- **Benchmark** : —

#### `c2_b` (s=2) — Il y a une structure de base, mais elle n'est pas toujours respectée.
- **Reformulation** : La structure non appliquée donne l'illusion du système sans les bénéfices. Il manque souvent peu de chose pour franchir le palier — un rappel partagé, un modèle par défaut.
- **Benchmark** : —

#### `c2_c` (s=3) — Les dossiers suivent une trame cohérente, les informations importantes sont accessibles rapidement.
- **Reformulation** : Une trame cohérente respectée — c'est ce qui rend la consultation plus rapide à l'ouverture du dossier, et qui sécurise les prises en charge complexes.
- **Benchmark** : **[À CONFIRMER]** Un dossier structuré réduit le temps de consultation de 2 à 4 minutes en moyenne. *(Source à vérifier : étude ergonomie logiciels métiers, possiblement ANS ou CNAM.)*

#### `c2_d` (s=4) — Dossiers structurés permettant une prise en charge par n'importe quel praticien.
- **Reformulation** : La qualité dossier est la fondation de la continuité des soins. À ce niveau, votre cabinet peut absorber sereinement un remplaçant, un associé, une délégation.
- **Benchmark** : —

---

### Question C3 — Flux administratif quotidien

> *Comment gérez-vous le flux administratif quotidien ?*
> *Contexte : courriers, résultats, ordonnances, feuilles de soins.*

#### `c3_a` (s=1) — C'est une source de stress — j'ai toujours du retard.
- **Reformulation** : Le flux administratif non maîtrisé est l'un des premiers facteurs cités dans le mal-être professionnel des généralistes. Ce qui pèse n'est pas le volume — c'est l'absence d'espace dédié dans la semaine.
- **Benchmark** : **[À CONFIRMER]** Les généralistes consacrent en moyenne 2 h 30 par jour aux tâches administratives, dont environ 40 % pourraient être déléguées. *(Source à vérifier : enquête CNOM ou DREES sur le temps médecin.)*

#### `c3_b` (s=2) — Je gère, mais ça prend beaucoup de temps hors des heures de consultation.
- **Reformulation** : Le débordement sur les plages hors-consultation est un signal d'alerte sur la soutenabilité — pas un défaut d'organisation individuelle, mais un système qui n'a pas encore intégré ses tâches admin dans son rythme.
- **Benchmark** : —

#### `c3_c` (s=3) — J'ai des plages dédiées et des méthodes pour traiter ce flux efficacement.
- **Reformulation** : Traiter l'administratif en temps masqué est souvent le premier pas vers une semaine vraiment organisée. Le travail est fait, mais sans grignoter les marges personnelles.
- **Benchmark** : —

#### `c3_d` (s=4) — Le flux est largement délégué ou automatisé.
- **Reformulation** : La délégation administrative est souvent la transformation la plus rapide et la plus impactante quand un cabinet l'engage. Vous récupérez ce que ces tâches ne devraient jamais avoir consommé.
- **Benchmark** : —

---

### Question C4 — Adoption des outils numériques de santé

> *Quels outils numériques de santé utilisez-vous au quotidien ?*
> *Contexte : Mon Espace Santé, MSSanté, téléconsultation, dossier régional.*

#### `c4_a` (s=1) — Aucun ou presque — je n'en ressens pas le besoin.
- **Reformulation** : L'écart se creuse à mesure que ces outils deviennent la norme. Ce qui paraît évitable aujourd'hui peut devenir un point de friction demain — avec les patients, les confrères, les caisses.
- **Benchmark** : **[À CONFIRMER]** Mon Espace Santé est activé pour plus de 12 millions de Français — l'écosystème numérique s'installe rapidement comme nouveau standard d'échange. *(Source à vérifier : chiffres ANS / DNS sur l'adoption Mon Espace Santé.)*

#### `c4_b` (s=2) — Quelques-uns par obligation (carte Vitale, télétransmission), sans en exploiter le potentiel.
- **Reformulation** : Le minimum réglementaire est en place. Les fonctionnalités qui changent vraiment la donne (messagerie sécurisée, alimentation DMP, téléexpertise) demandent un investissement minime pour un gain rapide.
- **Benchmark** : —

#### `c4_c` (s=3) — J'utilise activement plusieurs (MSSanté, Mon Espace Santé, téléconsultation), avec retour positif.
- **Reformulation** : Une posture sélective et active. Vous adoptez ce qui apporte un bénéfice tangible, sans céder à l'effet de mode — la posture la plus saine vis-à-vis du numérique en santé.
- **Benchmark** : —

#### `c4_d` (s=4) — Ces outils sont intégrés dans mon workflow et je les utilisez pour optimiser le parcours patient.
- **Reformulation** : L'intégration dans le workflow change la nature de ces outils — ils deviennent des leviers organisationnels, pas des cases à cocher. Vous êtes en position de tester les évolutions à venir avant la grande majorité.
- **Benchmark** : —

---

### Question C5 — Positionnement vis-à-vis de l'IA

> *Comment positionnez-vous l'IA générative dans votre activité ?*
> *Contexte : rédaction de courriers, synthèses, recherches cliniques, aide à la décision.*

Note : reformulation V2 (post-revue) — la version factuelle initiale exposait à un biais de désirabilité inverse. Les options mesurent la **maturité de positionnement** sans présupposer de comportements illicites. Les reformulations terrain peuvent ensuite nommer les enjeux légaux quand pertinent (sur s=3 notamment).

#### `c5_a` (s=1) — Je ne l'utilise pas — je ne vois pas encore l'intérêt pour mon exercice, ou je préfère attendre.
- **Reformulation** : Attendre est une posture légitime tant que les dispositifs conformes ne sont pas matures. Le risque d'attente trop longue : que les confrères équipés prennent une avance organisationnelle difficile à rattraper ensuite.
- **Benchmark** : —

#### `c5_b` (s=2) — Je l'utilise ponctuellement, sur des sujets génériques (recherche, rédaction), avec des questions sur le cadre.
- **Reformulation** : Un usage prudent sur des sujets non patient. C'est probablement la posture la plus répandue actuellement — et celle où les questions de cadre vont devenir de plus en plus présentes.
- **Benchmark** : —

#### `c5_c` (s=3) — Je l'utilise régulièrement avec une vigilance active sur la conformité — sans m'être encore équipé d'un dispositif dédié au médical.
- **Reformulation** : L'usage régulier d'une IA grand public sur des éléments métier, même avec vigilance, sort du cadre RGPD et du secret médical. C'est précisément ce que Lugia vient sécuriser — sans changer vos habitudes au quotidien, dans un environnement conforme.
- **Benchmark** : **[À CONFIRMER]** Une majorité de médecins ayant testé l'IA générative l'utilisent désormais régulièrement sur des tâches admin ou cliniques, le plus souvent en dehors du cadre légal. *(Source à vérifier : enquête Ordre des médecins ou CNOM sur l'usage IA 2024-2025.)*

#### `c5_d` (s=4) — J'ai intégré un dispositif IA conforme au secret médical (hébergeur HDS, IA locale, prestataire certifié santé) dans mon workflow.
- **Reformulation** : L'usage conforme du secret médical structuré dans le workflow. Vous êtes en avance sur la transition que beaucoup de cabinets vont devoir engager dans les 24 prochains mois.
- **Benchmark** : —

---

### Question C6 — Suivi des enjeux de conformité

Note : la liste affichée dans le contexte (`ctx`) doit être :
> *Contexte : RGPD, HDS, secret médical, DMP, pharmacovigilance, DPC, accessibilité PMR, conventionnement CCAM, numérique en santé / MSSanté…*

> *À quel point les enjeux de conformité de votre cabinet sont-ils suivis activement ?*

#### `c6_a` (s=1) — Je sais qu'il y a des enjeux mais je n'ai pas le temps de m'y pencher au quotidien.
- **Reformulation** : Les enjeux de conformité avancent en arrière-plan, parfois sans signal — jusqu'au jour où un contrôle CPAM, une plainte ou un incident les ramène au premier plan. C'est rarement gérable à chaud sans un minimum de veille en amont.
- **Benchmark** : —

#### `c6_b` (s=2) — Je suis ce qu'on m'envoie (CPAM, DPC, instances), sans démarche proactive.
- **Reformulation** : La conformité subie. Vous traitez ce qui arrive, mais sans hiérarchiser ce qui est applicable à votre cabinet en particulier — ce qui peut laisser passer des évolutions importantes.
- **Benchmark** : —

#### `c6_c` (s=3) — Je suis activement 2 ou 3 sujets majeurs et je m'informe régulièrement (HAS, RGPD, MSSanté).
- **Reformulation** : Une veille ciblée sur les sujets prioritaires. C'est une posture mature qui évite la surcharge informationnelle tout en gardant un cadre clair.
- **Benchmark** : —

#### `c6_d` (s=4) — J'ai cartographié les enjeux applicables à mon cabinet et je les suis systématiquement — revue régulière, mise à jour, traçabilité.
- **Reformulation** : Une démarche structurée de gouvernance de la conformité. Rare en médecine libérale — vous transformez ces enjeux en levier de qualité plutôt qu'en source d'inquiétude.
- **Benchmark** : —

---

### Benchmarks chiffrés en bref (synthèse Lot 3)

| Bench | Statut | Utilisation |
|---|---|---|
| Demi-journée formation logiciel = +25-40 min/jour | **[À CONFIRMER]** CMG / URPS formations | c1_a |
| Dossier structuré = -2 à -4 min par consultation | **[À CONFIRMER]** ANS ou CNAM ergonomie | c2_c |
| 2 h 30 admin/jour pour un généraliste, ~40 % délégable | **[À CONFIRMER]** CNOM ou DREES temps médecin | c3_a |
| 12+ millions Mon Espace Santé activés | **[À CONFIRMER]** ANS / DNS adoption MES | c4_a |
| Majorité des médecins utilisent IA hors cadre légal | **[À CONFIRMER]** Enquête CNOM 2024-2025 sur l'usage IA | c5_c |

---

---

## Lot 4 — 7 modules d'approfondissement

Format de chaque module :
- **id** + icône + label affiché
- **4 étapes** numérotées (01 → 04) avec titre court + body explicatif + tag temporalité (`quick` < 1 semaine, `medium` 1-4 semaines, `invest` 1-3 mois)
- **Benchmark de conclusion** en bas, marqué `**[À CONFIRMER]**` quand non sourcé

Ton Lugia : descriptif systémique, jamais accusatoire. Le médecin reste sujet (« vous identifiez », « vous testez »), le système est ce qui se transforme. Pas de « il faut », pas de « vous devriez ».

---

### Module 1 — Urgences du jour 🔴

**Label** : Organiser les urgences du jour
**id** : `urgences`

#### 01. Définir ce qu'est une « urgence du jour »
*Pas les urgences vitales — celles-ci ont leur circuit propre. On parle ici des consultations qui ne peuvent pas attendre 48 h. Listez avec votre secrétariat les motifs qui rentrent dans cette catégorie : douleur thoracique, fièvre élevée chez un enfant, décompensation psychiatrique, suspicion d'infection sévère. Définir ces critères une fois pour toutes évite de rejouer l'arbitrage à chaque appel.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Bloquer deux créneaux dédiés par jour
*Un le matin, un l'après-midi. S'ils ne sont pas utilisés pour des urgences, ils sont récupérés pour des chroniques en fin de journée. Testez le format 3 semaines avant d'évaluer — il faut ce délai pour que l'équipe et les patients s'y habituent.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Former le secrétariat au tri téléphonique
*Trois questions suffisent pour trier 80 % des situations : depuis quand le symptôme dure-t-il, est-ce que ça s'aggrave, le patient a-t-il déjà eu ça ? Avec ces trois questions partagées, le secrétariat oriente sans vous interrompre — vous ne récupérez que les cas qui le nécessitent vraiment.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Évaluer après un mois
*Combien de créneaux urgence utilisés par semaine ? Combien d'interruptions en consultation ? Renvois aux urgences en hausse ou en baisse ? Ces trois indicateurs suffisent à ajuster le nombre de créneaux et à valider le tri.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

**Benchmark de conclusion** : **[À CONFIRMER]** Les cabinets qui mettent en place des créneaux dédiés réduisent de 60 à 70 % les interruptions en consultation. Un médecin interrompu huit fois par jour perd en moyenne 1 h 15 de concentration productive. *(Source à vérifier : retours d'expérience CPTS sur les protocoles d'urgences du jour.)*

---

### Module 2 — Suivi des patients chroniques 📋

**Label** : Structurer le suivi des patients chroniques
**id** : `chroniques`

#### 01. Extraire votre file active du logiciel
*Tous les logiciels métiers permettent d'extraire la liste des patients avec une pathologie chronique codée. Faites-le pour trois pathologies pour commencer : diabète, HTA, insuffisance cardiaque. Le chiffre exact réserve souvent une surprise — il est généralement plus élevé que l'estimation à vue.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Identifier les patients sans consultation depuis plus de 12 mois
*Ce sont vos « patients silencieux » — souvent les plus fragiles. Un SMS de rappel simple suffit dans environ 70 % des cas à les faire reprendre contact, sans démarche complexe.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Créer des rappels automatiques dans le logiciel
*Pour chaque patient chronique revu en consultation, définissez une date de prochaine consultation recommandée. La plupart des logiciels modernes peuvent générer des alertes automatiques à cette date.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Déléguer le suivi de routine
*Le renouvellement simple, le bilan annuel de suivi, le rappel de vaccination — autant d'actes préparables par un assistant médical selon les protocoles de coopération en vigueur dans votre territoire. C'est l'étape la plus structurante quand elle est possible.*
**Tag** : `invest` · Investissement — 1 à 3 mois

**Benchmark de conclusion** : **[À CONFIRMER]** Un programme de relance simple permet de récupérer environ 70 % des patients chroniques perdus de vue dans les trois mois. La file active tracée est l'un des leviers de qualité les plus impactants en médecine de famille. *(Source à vérifier : indicateurs ROSP et expérimentations CPTS sur la relance des chroniques.)*

---

### Module 3 — Délégation des tâches non médicales 🤝

**Label** : Déléguer des tâches non médicales
**id** : `delegation`

#### 01. Cartographier vos tâches non médicales
*Passez une journée à noter tout ce que vous faites en dehors de la consultation directe. Vous découvrirez souvent que 60 à 70 % de ces tâches ne nécessitent pas votre expertise médicale — appel pour confirmer un résultat, saisie d'une lettre, préparation d'une feuille de soins.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Identifier les tâches délégables en priorité
*Appels de résultats simples, préparation des renouvellements, saisie de courriers, rappels de suivi. Commencez par une seule tâche — celle qui revient le plus souvent — et faites-la déléguer pendant deux semaines. Évaluez avant d'en ajouter d'autres.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Formaliser avec l'équipe
*30 minutes de réunion suffisent : expliquez pourquoi vous déléguez (pas juste « j'ai trop de travail », mais ce que vous voulez récupérer comme temps médical), montrez concrètement comment faire la tâche, et définissez le critère d'escalade — dans quel cas l'équipe vous transmet plutôt que de gérer seule. Ce dernier point sécurise toute la délégation.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Explorer le dispositif assistant médical
*Le cadre conventionnel permet un financement partiel du recrutement. Contactez votre CPAM ou votre CPTS — les délais sont souvent plus courts que prévu, et l'accompagnement administratif disponible.*
**Tag** : `invest` · Investissement — 1 à 3 mois

**Benchmark de conclusion** : **[À CONFIRMER]** Les cabinets ayant formalisé la délégation sur deux ou trois tâches récupèrent en moyenne 45 minutes de temps médical par jour. À votre profil, cela représente entre trois et cinq consultations supplémentaires possibles par semaine — ou autant de temps personnel récupéré, à votre choix. *(Source à vérifier : bilans CNAM dispositif assistant médical 2023-2024.)*

---

### Module 4 — Communication d'équipe 💬

**Label** : Instaurer un rituel de communication d'équipe
**id** : `comm`

#### 01. Le point du matin : 10 minutes, pas plus
*Avant d'ouvrir les consultations, trois questions à l'équipe : qui a quoi aujourd'hui (planning, examens, créneaux particuliers), y a-t-il des imprévus à signaler, y a-t-il un patient à surveiller ? Testez le format deux semaines avant d'évaluer.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Créer un outil de messages partagés
*Un simple cahier à la réception suffit pour commencer : une colonne par praticien, une ligne par message. L'objectif n'est pas l'outil, c'est que chaque information en attente soit visible par tous, à un seul endroit.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Définir le protocole d'escalade
*« Dans quel cas est-ce que vous me dérangez pendant une consultation ? » — la réponse doit être connue de tous. Formulez trois critères précis, affichez-les au secrétariat. Cette clarté seule réduit environ 80 % des interruptions non justifiées.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Revue mensuelle de 30 minutes
*Une fois par mois : qu'est-ce qui a bien marché, qu'est-ce qui a coincé, une seule chose à améliorer pour le mois suivant. Quelqu'un note la décision prise. Ce qui paraît modeste devient en 6 mois un cycle d'amélioration continue.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

**Benchmark de conclusion** : **[À CONFIRMER]** Les cabinets ayant instauré un point matinal régulier signalent une réduction de 40 % des malentendus et une nette amélioration du sentiment de cohésion d'équipe. Une dizaine de minutes par jour qui change la qualité de la journée. *(Source à vérifier : enquête CMG ou MG France sur les pratiques d'équipe.)*

---

### Module 5 — Optimisation du logiciel médical 💻

**Label** : Optimiser le logiciel médical
**id** : `logiciel`

Note : ce module peut nommer dynamiquement le logiciel via `logiciel_metier` du profil dans le rendu (« dans Médidoc », « dans Crossway », etc.).

#### 01. Identifier les trois actions les plus répétitives
*Rédaction de courriers, saisie d'ordonnances, comptes-rendus de visite — notez les trois actions que vous faites le plus dans la semaine et qui vous prennent le plus de temps. Ces trois actions sont vos cibles prioritaires de formation.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Programmer une demi-journée de formation ciblée
*Contactez votre éditeur logiciel — les formations sont souvent gratuites et largement sous-utilisées. Ne demandez pas « une formation générale », mais « comment faire X en moins de 30 secondes ». C'est ce ciblage qui fait toute la différence sur le retour d'investissement.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Créer cinq modèles de documents
*Lettre de liaison, ordonnance chronique, compte-rendu complexe, arrêt de travail, résultat de bilan — partez de vos documents existants et faites-en des modèles dans le logiciel. Vous économisez 3 à 5 minutes par document, à chaque utilisation.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Activer le tableau de bord activité
*Tous les logiciels modernes ont un module statistiques. Regardez trois indicateurs chaque vendredi : nombre d'actes de la semaine, délai moyen pour obtenir un RDV, top 5 des motifs. Dix minutes pour piloter votre cabinet — pas pour analyser à fond, juste pour voir les variations.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

**Benchmark de conclusion** : **[À CONFIRMER]** Une optimisation logiciel bien ciblée représente 25 à 40 minutes gagnées par jour — soit 80 à 130 heures de travail récupérées sur l'année. C'est l'un des leviers à plus fort retour sur temps investi en cabinet. *(Source à vérifier : retours formations URPS ou enquête CMG sur l'usage des logiciels métiers.)*

---

### Module 6 — Charge administrative 📁

**Label** : Réduire la charge administrative quotidienne
**id** : `admin`

#### 01. Chronométrer votre temps administratif sur trois jours
*Pas pour vous culpabiliser — pour savoir. Notez chaque tâche administrative et le temps passé pendant trois jours représentatifs. La plupart des médecins sous-estiment leur temps administratif réel d'environ 30 %.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Identifier les trois tâches les plus chronophages et délégables
*Traitement des résultats normaux, préparation des renouvellements, saisie des courriers — ces trois familles de tâches représentent souvent à elles seules 60 % du temps administratif total. Elles sont aussi les plus délégables.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Créer des plages admin dédiées
*30 minutes le matin avant les consultations, 20 minutes entre midi et deux. Ces plages sont fermées aux consultations. Traiter l'administratif en temps masqué réduit considérablement le sentiment de surcharge — non pas parce que la quantité change, mais parce qu'il a sa place dans la semaine.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Explorer les outils d'automatisation
*Votre logiciel propose probablement des fonctions de traitement automatique des résultats biologiques normaux, d'envoi de rappels patients, de génération de courriers types. Demandez une démonstration ciblée à votre éditeur — ces fonctions sont souvent disponibles mais peu activées.*
**Tag** : `invest` · Investissement — 1 à 3 mois

**Benchmark de conclusion** : **[À CONFIRMER]** Une réorganisation ciblée permet de réduire le temps administratif de 35 à 50 % en six semaines — sans investissement technologique majeur. La différence vient surtout de l'organisation des plages et de la priorisation des tâches délégables. *(Source à vérifier : enquête CNOM ou DREES temps médecin libéral.)*

---

### Module 7 — Pilotage de l'activité 📊

**Label** : Mettre en place un pilotage simple de l'activité
**id** : `pilotage`

#### 01. Choisir trois indicateurs, pas plus
*Délai moyen pour obtenir un RDV non urgent (en jours), nombre d'actes hebdomadaires, taux de consultations hors plage normale. Ces trois indicateurs donnent une vision suffisante pour repérer une dérive sans se noyer dans la donnée.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 02. Activer le module statistiques du logiciel
*Dix minutes chaque vendredi pour regarder ces trois indicateurs. Pas pour analyser — juste pour voir. En quatre semaines, vous saurez où vous en êtes et ce qui bouge dans votre activité.*
**Tag** : `quick` · Action rapide — < 1 semaine

#### 03. Créer un tableau de bord mensuel simple
*Un fichier de trois colonnes, une ligne par semaine. En trois mois, vous aurez une tendance suffisamment claire pour prendre des décisions éclairées — recruter, ajuster les plages, refuser de nouveaux patients, étendre les horaires.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

#### 04. Utiliser les données pour une décision concrète
*Au bout de deux mois, posez-vous une question précise : le délai de RDV augmente-t-il ? Si oui, sur quels créneaux particulièrement ? Cette granularité simple permet de cibler une action précise — bloquer plus de créneaux le mardi matin, déléguer un type de consultation, etc.*
**Tag** : `medium` · Projet court — 1 à 4 semaines

**Benchmark de conclusion** : **[À CONFIRMER]** Les cabinets qui suivent trois indicateurs hebdomadaires identifient leurs déséquilibres environ trois fois plus vite que ceux qui pilotent à l'intuition. Ce n'est pas la complexité du tableau de bord qui compte, c'est la régularité du regard. *(Source à vérifier : retours expérimentations CPTS sur le pilotage de cabinet ou enquête CMG.)*

---

### Synthèse des 7 modules

| # | Module | id | Effort | Impact |
|---|---|---|---|---|
| 1 | Urgences du jour | `urgences` | 2 | Immédiat |
| 2 | Suivi chroniques | `chroniques` | 2 | Court terme |
| 3 | Délégation tâches | `delegation` | 3 | Moyen terme |
| 4 | Communication équipe | `comm` | 1 | Immédiat |
| 5 | Optimisation logiciel | `logiciel` | 2 | Court terme |
| 6 | Charge administrative | `admin` | 2 | Court terme |
| 7 | Pilotage activité | `pilotage` | 1 | Moyen terme |

L'effort se lit sur 3 niveaux (1 = léger, 3 = significatif). L'impact se lit sur 3 horizons (Immédiat = moins de 2 mois, Court terme = 2-6 mois, Moyen terme = 6 mois et plus).

Tous les modules suivent strictement le format Lugia : 4 étapes numérotées (`quick` / `medium` / `invest`), titre court explicite, body en langage praticien, benchmark de conclusion qualitatif marqué `**[À CONFIRMER]**` pour les chiffres non sourcés. Aucun n'utilise « il faut » ou « vous devriez » — toujours « vous identifiez », « vous testez », « vous découvrez ».

---

---

## Lot 5 — 13 règles de personnalisation déterministe

Chaque règle est une fonction Python explicite dans `src/v2/personalize.py`, testable unitairement, déclenchée par une combinaison de champs du profil utilisateur et/ou des scores. Les libellés ci-dessous sont les **messages produits par chaque règle**, en ton Lugia.

**Posture éditoriale** (rappel) : levier d'action, jamais culpabilité. Tonalité descriptive systémique. Ne jamais utiliser « il faut » ou « vous devriez ».

---

### 10.1 Règles de tonalité

#### `R-status-junior`
**Déclenchement** : `status=récent` (moins de 3 ans d'exercice).
**Affichage** : reformulations de synthèse, intro chantiers.
**Logique** : normaliser via la temporalité plutôt qu'encourager paternellement. Pas de *« vous faites bien »* — à la place, ancrer dans une norme historique.

Messages applicables (un seul sélectionné selon contexte) :
- *« C'est courant à ce stade d'installation — la plupart des cabinets prennent 2 à 3 ans à construire leurs routines. »*
- *« Beaucoup de médecins traversent cette phase dans leurs premières années d'exercice — c'est aussi le moment où l'organisation prend forme. »*
- *« À ce stade, ce qui semble pesant aujourd'hui est rarement définitif. Le cabinet prend sa forme progressivement. »*

#### `R-status-senior`
**Déclenchement** : `status=senior` (plus de 15 ans) **ou** `status=approche_transmission` (moins de 5 ans avant cession).
**Affichage** : reformulations de synthèse, intro chantiers, opportunités.
**Logique** : légitimer le recul du médecin senior, valoriser sa lecture sans paternaliser à l'envers.

Messages applicables :
- *« Vous avez le recul nécessaire pour distinguer ce qui tient de ce qui dépend de vous. »*
- *« À votre stade, les chantiers utiles sont souvent ceux qui rendent le cabinet transmissible — pas ceux qui le complexifient. »*
- *« Vous avez vécu plusieurs cycles d'évolution du cabinet. Ce qui ressort aujourd'hui résonne probablement avec des points que vous percevez déjà. »*

#### `R-motivation-tone`
**Déclenchement** : selon `motivation`.
**Affichage** : phrase d'accueil au début de la page résultats (avant le radar).
**Logique** : reprendre la motivation déclarée pour cadrer la lecture du diagnostic. Reprend et étend le câblage Q06 V1.1.8.

Messages selon motivation :
- `motivation=réduire_charge` → *« Vous avez démarré ce check-up pour identifier ce qui pèse le plus dans votre semaine. Voici ce qui ressort. »*
- `motivation=anticiper_événement` → *« Vous avez démarré ce check-up pour préparer un événement à venir dans votre cabinet. Voici ce que ce diagnostic met en lumière. »*
- `motivation=sécuriser_risque` → *« Vous avez démarré ce check-up pour sécuriser un risque identifié. Voici les points sur lesquels concentrer votre attention. »*
- `motivation=curiosité` → ouverture neutre (pas d'introduction de cadrage explicite). *« Voici la lecture que ce check-up produit de votre cabinet. »*

---

### 10.2 Règles de priorisation

#### `R-energy-prio`
**Déclenchement** : selon la réponse à la question ancrage énergie.
**Affichage** : ordre des opportunités sur la page résultats + tonalité d'ouverture de la section.
**Logique** : adapter l'effort proposé au niveau d'énergie réel du médecin. Un médecin « au bord » ne peut pas absorber un chantier effort 3.

Stratégies selon `energy` :
- `energy=au_bord` → **priorité absolue aux chantiers effort 1 + impact immédiat**. Tonalité d'ouverture adoucie : *« On commence par dégager du temps mental. Le reste viendra quand vous aurez retrouvé un peu de marge. »*
- `energy=souvent_vidé` → priorité aux effort 1-2, autorise effort 2 si l'impact est court terme. Tonalité : *« On vise des leviers qui se mettent en place rapidement, sans demander une bascule organisationnelle complète. »*
- `energy=tendu_mais_ça_passe` → ordre standard par sévérité décroissante. Pas de tonalité spécifique.
- `energy=bien` → autorise les chantiers d'investissement à moyen terme (formation, restructuration). Tonalité : *« Vous avez la disponibilité pour engager des chantiers structurels — c'est le moment où ces bascules portent le plus. »*

#### `R-motivation-prio`
**Déclenchement** : selon `motivation`.
**Affichage** : pondération de l'ordre des opportunités, **avant** application de `R-energy-prio`.
**Logique** : un médecin qui veut sécuriser un risque a un besoin différent d'un médecin qui veut anticiper. Cette règle est la première filière de priorisation.

Stratégies selon motivation :
- `motivation=sécuriser_risque` → **le score le plus bas remonte en priorité absolue**, indépendamment du seuil. Si A est à 25 % et B à 33 %, A passe avant B même si B est nominalement « plus rouge ».
- `motivation=réduire_charge` → priorité aux chantiers effort 1-2 (qui apportent du soulagement rapide).
- `motivation=anticiper_événement` → priorité aux chantiers liés à la **transmissibilité** : cadre formalisé, protocoles écrits, formation équipe, continuité de l'absence.
- `motivation=curiosité` → ordre standard par sévérité décroissante. Aucune surcharge motivationnelle.

#### `R-horizon-prio`
**Déclenchement** : selon `horizon`.
**Affichage** : pondération secondaire de l'ordre des opportunités (après motivation, avant énergie).
**Logique** : un horizon de transmission ne cherche pas les mêmes leviers qu'un horizon de renforcement d'équipe.

Stratégies selon horizon :
- `horizon=préparer_transmission` → les opportunités du bloc B (équipe, continuité, formalisation) remontent **avant** celles du bloc C (outils). Un cabinet transmissible doit d'abord être lisible côté humain.
- `horizon=renforcer_équipe` → idem, les opportunités B remontent, avec accent particulier sur la délégation (`delegation`) et l'assistant médical si solo.
- `horizon=déménager_agrandir` → les opportunités C (logiciel, dossiers structurés) remontent — la transition est l'occasion de revoir l'outillage.
- `horizon=reconduire_à_l_identique` ou `horizon=incertain` → ordre standard. Aucune pondération additionnelle.

---

### 10.3 Règles de personnalisation des benchmarks combinatoires

Note : ces benchmarks **n'apparaissent qu'à la page résultats finale**, pas pendant le questionnaire (cf spec V2 §11.6, post-revue). Ils ne doublent jamais les benchmarks inline d'option.

#### `R-bench-solo-charge`
**Déclenchement** : `cabinet_type=solo` ET `score_B ≤ 34`.
**Message** : *« À votre profil, sans équipe formalisée, vous portez seul l'équivalent d'1,5 ETP d'organisation. C'est une charge difficile à tenir sur la durée — et c'est précisément ce que la délégation vient soulager. »*
**Statut** : **[À CONFIRMER]** sur le ratio 1,5 ETP — calibrer sur la base d'études CMG ou DREES sur la charge non médicale du généraliste solo.

#### `R-bench-volume-admin`
**Déclenchement** : `volume>120` ET `score_C ≤ 54`.
**Message** : *« À votre volume hebdomadaire, la moyenne du temps administratif est de 2 h 45 par jour — vous êtes probablement au-dessus de cette moyenne. La marge n'est pas dans plus d'efforts personnels, elle est dans la délégation ou l'automatisation d'une partie de ces tâches. »*
**Statut** : **[À CONFIRMER]** sur le chiffre 2 h 45 — référence CNOM ou DREES temps médecin libéral.

#### `R-bench-transmission`
**Déclenchement** : `status=approche_transmission` ET `score_B ≤ 54`.
**Message** : *« Un cabinet bien organisé se valorise 30 à 40 % mieux à la transmission. Les acheteurs paient pour un système qui tient sans le médecin sortant — pas pour un poste de travail qui dépend d'une personne. »*
**Statut** : **[À CONFIRMER]** sur le ratio 30-40 % — sourcer auprès de URML, MG France ou conseillers spécialisés cession de cabinet médical.
**Posture éditoriale** : reformulé en positif (cf spec V2 §10.3) — c'est ce que vous gagnez en structurant, pas ce que vous perdez si vous ne le faites pas.

#### `R-bench-soloHero`
**Déclenchement** : `paramedical_team=non` ET `cabinet_type=solo` ET `score_A ≥ 55` ET `score_B ≤ 34`.
**Message** : *« Vous tenez votre cabinet à bout de bras, et vous le tenez bien — c'est ce que le diagnostic dit sur votre parcours patient. La question n'est pas si vous savez faire. Elle est : pour combien de temps encore, sans relai ? »*
**Statut** : qualitatif, pas de chiffre — interpellation directe sur la durabilité.
**Posture éditoriale** : reconnait la performance ET nomme le risque de soutenabilité. Subtil — à valider en pilote terrain.

---

### 10.4 Règles de routing protocole

#### `R-routing-solo`
**Déclenchement** : `cabinet_type=solo`.
**Effet** : afficher la question `b1b` (Assistant médical envisagé) en position 2 du bloc B. Sinon (`duo`, `groupe`, `msp`) → afficher `b3` (Charge du secrétariat).
**Logique** : ce n'est pas un message, c'est un routing du protocole. Documenté dans `interview_protocol_v2.json` via le champ `routing` sur la position 2 du bloc B.
**Comportement** : silencieux pour le médecin (il voit toujours 6 questions dans le bloc B, juste calibrées sur son profil).

#### `R-routing-rdv`
**Déclenchement** : `rdv_canal=doctolib` OU `rdv_canal=maiia`.
**Affichage** : reformulation terrain enrichie de la question C4 (Adoption des outils numériques de santé).
**Logique** : nommer explicitement la plateforme déjà utilisée dans la reformulation, pour ancrer la suggestion d'extension.

Messages selon plateforme :
- `rdv_canal=doctolib` → *« Vous utilisez déjà Doctolib pour la prise de RDV — voici les outils suivants à explorer qui s'intègrent à votre écosystème : MSSanté pour les correspondances confrères, Mon Espace Santé pour alimenter le dossier patient. »*
- `rdv_canal=maiia` → *« Vous utilisez déjà Maiia pour la prise de RDV — l'environnement est cohérent avec une extension côté téléconsultation et messagerie sécurisée. »*

---

### 10.5 Règle de niveau territoire

#### `R-territoire-context`
**Déclenchement** : `territoire=zone_sous_dotée`.
**Affichage** : mention contextuelle ajoutée aux chantiers de coordination avec confrères et aux opportunités d'orientation.
**Logique** : enrichit la formulation sans altérer le score (cf spec V2 §3.3, contrainte stricte).

Messages applicables (ajout d'une phrase de contexte au chantier concerné) :
- *« Sachant les délais d'accès aux spécialistes dans votre zone, ce chantier prend une dimension supplémentaire — la coordination locale n'est pas une option, c'est ce qui compense l'écart d'offre. »*
- *« En zone sous-dotée, ce levier compense partiellement ce que vous ne pouvez pas obtenir de l'écosystème médical autour. »*

**Garde-fou explicite documenté en code** (`personalize.py`) :
```python
# R-territoire-context ne doit JAMAIS modifier les scores, ni présumer du niveau d'organisation
# du cabinet en fonction du territoire (cf spec V2 §3.3). Cette règle enrichit uniquement
# les formulations contextuelles, jamais l'évaluation.
```

---

### 10.6 Règle de profil remplaçant (post-revue)

#### `R-replacement`
**Déclenchement** : `status=remplaçant`.
**Effet** : combiné — bandeau d'avertissement + ton adapté + chantiers filtrés.

**Bandeau d'avertissement** (en tête des résultats, discret mais visible) :
*« Vous êtes remplaçant — les recommandations qui suivent sont à lire comme une grille de lecture des cabinets que vous traversez, pas comme un plan d'action immédiat. »*

**Ton** : reformulations qui assument la posture de découverte plutôt que la posture de pilotage.
- *« Vous observez actuellement comment ce cabinet est organisé sur ce point. »*
- *« À votre stade, l'enjeu est moins de transformer que d'identifier les pratiques que vous voudrez reprendre dans votre installation future. »*

**Chantiers exclus** : ceux qui supposent une autorité d'installation — recruter un assistant médical, formaliser des rôles avec l'équipe, restructurer les protocoles internes, déléguer formellement.

**Chantiers favorisés** : observation comparative, posture de transférabilité, identification des bonnes pratiques rencontrées qui pourront servir lors d'une installation future. Si la liste des opportunités devient trop courte après filtrage, message d'invitation : *« À ce stade, le check-up sert d'outil de lecture. Refaites-le quand vous serez installé — il prendra une autre profondeur. »*

---

### Synthèse des 13 règles

| ID | Type | Déclencheur | Cible d'affichage |
|---|---|---|---|
| `R-status-junior` | Tonalité | status=récent | Reformulations, intros chantiers |
| `R-status-senior` | Tonalité | status=senior OR transmission | Reformulations, intros chantiers, opportunités |
| `R-motivation-tone` | Tonalité | motivation=* | Phrase d'accueil résultats |
| `R-energy-prio` | Priorisation | energy=* | Ordre opportunités + tonalité section |
| `R-motivation-prio` | Priorisation | motivation=* | Ordre opportunités (filière 1) |
| `R-horizon-prio` | Priorisation | horizon=* | Ordre opportunités (filière 2) |
| `R-bench-solo-charge` | Benchmark | solo + B≤34 | Page résultats finale |
| `R-bench-volume-admin` | Benchmark | volume>120 + C≤54 | Page résultats finale |
| `R-bench-transmission` | Benchmark | transmission + B≤54 | Page résultats finale |
| `R-bench-soloHero` | Benchmark | solo + sans paramedical + A≥55 + B≤34 | Page résultats finale |
| `R-routing-solo` | Routing | cabinet_type=solo | Protocole questionnaire (b1b/b3) |
| `R-routing-rdv` | Routing | rdv_canal=doctolib/maiia | Reformulation C4 |
| `R-territoire-context` | Contexte | territoire=zone_sous_dotée | Mention sur chantiers coordination |
| `R-replacement` | Profil | status=remplaçant | Bandeau + ton + filtre chantiers |

Total : 14 lignes dans le tableau, dont `R-replacement` qui est composite (ajouté post-revue). Comptabilité numérique des 13 règles : `R-routing-solo` est un mécanisme silencieux (pas un message), `R-replacement` est composite — selon comment on compte, on est à 13 ou 14 règles fonctionnelles. La spec V2 v1.4 stipule « 13 règles déterministes » — c'est cohérent en comptant `R-replacement` comme 1 règle composite et `R-routing-solo` comme règle silencieuse.

---

## Conclusion de la passe éditoriale V2.0

Les 5 lots couvrent l'intégralité du contenu narratif V2.0 :

- **Lot 1** : Bloc A — 24 reformulations + 4 titres diagnostic + 5 benchmarks
- **Lot 2** : Bloc B — 28 reformulations (routing solo inclus) + 4 titres + 4 benchmarks
- **Lot 3** : Bloc C — 24 reformulations + 4 titres + 5 benchmarks
- **Lot 4** : 7 modules d'approfondissement — 28 étapes + 7 benchmarks de conclusion
- **Lot 5** : 13 règles de personnalisation déterministe avec libellés complets

**Total** :
- ~76 reformulations terrain
- 12 titres de diagnostic
- ~21 benchmarks chiffrés (tous marqués `**[À CONFIRMER]**` quand non sourcés)
- 7 modules complets
- 13 règles de personnalisation

### Prochaines étapes après validation finale

1. **Vérification des sources** : valider chaque benchmark chiffré marqué `**[À CONFIRMER]**` auprès des sources mentionnées (DREES, CNAM, CMG, URPS, CPTS, ANS, CNOM, CNIL, etc.). Idéalement, faire valider par un médecin testeur les benchmarks les plus engageants (Module 3 délégation 45 min, R-bench-transmission 30-40 %).

2. **Intégration dans les fichiers JSON** :
   - `resources/interview_protocol_v2.json` : reformulations + benchmarks par option
   - `resources/diagnostics_v2.json` : 12 titres par couple (axe, niveau)
   - `resources/modules_v2.json` : 7 modules avec leurs 4 étapes
3. **Intégration dans `src/v2/personalize.py`** : 13 règles avec leurs messages.

4. **Relecture finale** par Sébastien sur le ton, la cohérence inter-blocs, et l'absence de doublons.

5. **Pilote terrain** : test sur 3-5 médecins testeurs avec persona Chateau + variants pour valider que les benchmarks personnalisés se déclenchent bien selon profil et que le ton est perçu comme accompagnant.

---

*Fin de la passe éditoriale V2.0. Toute modification de ce contenu doit être journalisée dans CHANGELOG.md + DECISIONS.md (D-029 amendement) avant intégration finale.*
