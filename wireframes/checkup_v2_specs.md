# Specs design — Refonte check-up V2.0

**Version** : 1.9 — 19 mai 2026 (ajout écran intro V2 — page de présentation du parcours)
**Auteur** : conversation V2.0 (track Démonstrateur technique)
**État** : validée — prête pour journalisation D-029 et phase de production
**Référence des arbitrages** : voir conversation V2.0 — décisions actées sur 13 messages itératifs + revue finale

---

## 1. Contexte

V1.1.9 livrée le 19 mai 2026 (CHANGELOG, D-028). Elle stabilise la sobriété médicale, la palette V1.1.6, le câblage Q06, l'enrichissement contexte (Q15/Q16/Q17 dormantes). Une fois en prod sur `diagnostic.lugia.fr`, l'analyse comparative avec trois versions extérieures (V3, V4, V6) a mis en lumière des leviers structurants absents de notre parcours :

- Reformulation terrain inline après chaque réponse → transforme l'interview en dialogue.
- Benchmarks chiffrés sur les réponses critiques → effet « il connaît le terrain ».
- Calibrage profil préliminaire en chips → réduit la friction d'entrée et alimente la personnalisation.
- Ordre par blocs stricts (3 axes successifs) → focus mental préservé.
- Mode A pur sur tout le parcours scoré → uniformité, simplification du frontend.
- Pages intermédiaires inter-blocs avec score-reveal → diagnostic qui se construit en direct.
- Radar SVG dynamique permanent → silhouette du cabinet visible pendant le parcours.
- Modules d'approfondissement statiques (7 modules en 4 étapes) → Path A V1.1.10 capté.

V2.0 intègre ces leviers en règles déterministes (pas de SLM dans le scope), avec la conversation IA chantier différée à V2.1+. Travaille en cohabitation BDD avec V1.1.9 figée — deux parcours sélectionnables sur `/`, pour permettre la comparaison terrain par les médecins testeurs.

---

## 2. Direction stratégique

**Méthodologique d'abord (D-020 réaffirmée).** Le scoring, les signaux croisés, l'ordre des opportunités, la priorisation des chantiers, la sélection des reformulations et des benchmarks restent **entièrement déterministes**. ~12 règles nommées explicites, auditables, testables, documentées.

**SLM repoussé sine die.** D-020 prévoyait le SLM en V1.2 pour personnaliser le rapport. La trajectoire est suspendue : V2.0 = méthodologique enrichi à son maximum, V2.1+ introduira l'IA conversationnelle de creusement de chantier (pas l'IA de génération de diagnostic). Ce sera tracé dans D-030 quand on y arrivera.

**Cohabitation V1.1.9 / V2.0.** V1.1.9 reste accessible en prod, **figée**, plus de modif sauf bug critique. V2.0 cohabite via le champ `protocol_version` sur `interview`. Page d'accueil à 2 cartes. Les utilisateurs peuvent faire les 2 et comparer.

**Brand kit Lugia appliqué en passe finale.** Pour la refonte fonctionnelle V2.0, on conserve la palette/typo V1.1.9 actuelle (crème + serif Iowan/Georgia + sans système). Le brand kit Lugia sera intégré avant tag, en passe de finition.

---

## 2.5 Écran d'intro du parcours V2

Entre la page d'accueil (`/`, à 2 cartes V1.1.9 / V2.0) et le mini-onboarding profil, un **écran d'intro dédié** présente le parcours V2 et ses promesses. Inspiré directement de V3/V4/V6 (qui ont toutes cet écran avant tout engagement) — il manquait dans la première version des wireframes V2.

Composantes :
- **Eyebrow** : `DIAGNOSTIC ORGANISATIONNEL` (en uppercase, lettrespacée, couleur accent).
- **Titre serif large** : *« Comment fonctionne **vraiment** votre cabinet ? »*, le mot « vraiment » en italique couleur accent (`--lugia-accent`). Taille `clamp(40px, 6vw, 64px)` pour un impact visuel fort.
- **Sous-titre** : *« 25 minutes. 18 questions adaptées à votre profil. Une analyse qui se construit en temps réel — pas un formulaire muet qui promet un résultat à la fin. »*
- **3 chips axes** colorés : Parcours patient · Équipe & secrétariat · Outils & dossiers. Pills border + bg soft selon la couleur de l'axe.
- **4 cartes promesse** en grid 2×2 :
  - *Adaptatif* — Questions calibrées selon votre type de cabinet, votre logiciel et votre territoire.
  - *Terrain* — Reformulations en langage praticien, pas consultant. Reflets immédiats à chaque réponse.
  - *Croisé* — Détection de signaux entre les 3 axes organisationnels — ce que les scores isolés ne montrent pas.
  - *Actionnable* — Plan d'action en 4 étapes pour le chantier que vous choisirez d'engager en priorité.
- **CTA « Commencer → »** en pilule sombre qui mène au profil étape 1.

Rôle stratégique : **mettre en confiance** avant l'engagement de 25 min. Le médecin voit où il va, sait combien de temps il en a pour, comprend la nature du diagnostic. C'est aussi l'occasion d'**affirmer la différenciation** Lugia (méthode terrain, pas consulting) avant la première question.

Palette/typo : Lugia V1.1.9 actuelle (crème, serif Iowan, accent bleu). Pas de dark néon — le brand kit Lugia sera appliqué en passe finale.

---

## 3. Mini-onboarding profil utilisateur

Le profil utilisateur est **préliminaire** au questionnaire et **obligatoire** pour démarrer un check-up V2.0. Il sert à : (a) calibrer les questions et le rendu du diagnostic ; (b) personnaliser les benchmarks et l'ordre des opportunités ; (c) constituer le substrat de la future conversation IA V2.1.

Le profil est **commun aux deux versions** du check-up — si un médecin a saisi son profil avant de faire la V1.1.9, il n'aura pas à le re-saisir en V2.0.

### 3.1 Étape 1 — calibrage factuel (5 chips rapides)

Page `/profil`. Présentation : *« Cinq questions factuelles, deux minutes. Ces informations adaptent les questions et calibrent le diagnostic. »*

| Champ BDD | Question | Options |
|---|---|---|
| `cabinet_type` | Type de cabinet | Solo · Groupe 2-3 médecins · Groupe 4-5 médecins · MSP |
| `volume` | Volume hebdomadaire | < 80 actes · 80-120 · > 120 |
| `paramedical_team` | Équipe paramédicale sur place | Non · Infirmière(s) · Plusieurs paramédicaux · MSP complète |
| `logiciel_metier` | Logiciel médical principal | Médidoc · Crossway · Cegedim · Doctolib Pro · Maiia · MédiStory · HelloDoc · Autre (saisie libre) |
| `rdv_canal` | Comment vos patients prennent-ils RDV ? | Doctolib · Maiia · Plateforme dédiée du cabinet · Téléphone via secrétariat · Téléphone direct · Mixte |

### 3.2 Étape 2 — calibrage réflexif (4 chips)

Transition pédagogique entre étapes : *« Quatre questions pour personnaliser le diagnostic. »*

| Champ BDD | Question | Options |
|---|---|---|
| `status` | Depuis combien de temps exercez-vous ici ? | Récent (<3 ans) · Installé (3-15) · Senior (>15) · Approche transmission (<5 ans) · Remplaçant |
| `territoire` | Comment décririez-vous votre territoire ? | Urbain dense · Périurbain · Rural / semi-rural · Zone sous-dotée |
| `horizon` | Horizon 3 ans | Reconduire à l'identique · Renforcer l'équipe · Déménager / agrandir · Préparer la transmission · Encore incertain |
| `motivation` | Pourquoi ce check-up ? | Réduire ma charge actuelle · Anticiper un événement à venir · Sécuriser un risque identifié · Curiosité |

### 3.3 Règle interne sur `territoire`

Le territoire **n'autorise jamais à présumer du niveau d'organisation** d'un cabinet. Il sert à enrichir les recommandations (un cabinet rural sous-doté reçoit des conseils tenant compte des contraintes d'accès aux confrères), pas à abaisser ou rehausser les scores ni à inférer la maturité. À documenter dans le code de `personalize.py` comme contrainte explicite.

### 3.4 Migration BDD profil

```sql
ALTER TABLE user_profile ADD COLUMN cabinet_type TEXT;
ALTER TABLE user_profile ADD COLUMN volume TEXT;
ALTER TABLE user_profile ADD COLUMN paramedical_team TEXT;
ALTER TABLE user_profile ADD COLUMN logiciel_metier TEXT;
ALTER TABLE user_profile ADD COLUMN logiciel_metier_other TEXT;
ALTER TABLE user_profile ADD COLUMN rdv_canal TEXT;
ALTER TABLE user_profile ADD COLUMN status TEXT;
ALTER TABLE user_profile ADD COLUMN territoire TEXT;
ALTER TABLE user_profile ADD COLUMN horizon TEXT;
ALTER TABLE user_profile ADD COLUMN motivation TEXT;
```

Toutes nullables. Idempotent au démarrage via `_ensure_profile_v2_columns()`. Les médecins existants gardent leur prénom V1.1.7, ils remplissent le profil V2.0 quand ils ouvrent un premier check-up V2.

---

## 4. Ancrage énergie — question préliminaire non scorée

Posée juste après la complétion du profil, avant le bloc A. **Non scorée** mais stockée dans `answer` avec flag `scored: false`. Utilisée pour la priorisation des chantiers en synthèse et comme contexte de la future conversation IA V2.1.

| ID | Question |
|---|---|
| `energy` | En fin de semaine ordinaire, à quel niveau d'énergie repartez-vous ? |

Options :
- `energy_a` : Bien — je tiens le rythme, c'est soutenable.
- `energy_b` : Tendu, mais ça passe — quelques semaines sont plus dures.
- `energy_c` : Souvent vidé — je récupère sur le week-end.
- `energy_d` : Au bord — je ne sais pas combien de temps je peux tenir.

Cette donnée pilote la règle `R-energy-prio` (cf §8.4).

---

## 5. Bloc 1 — Parcours patient (6 questions)

### 5.1 a1 — Urgences du jour

> *Quand un patient appelle pour un motif urgent, que se passe-t-il ?*
>
> *Contexte : pensez à la semaine dernière.*

| ID | Texte | s | Reformulation terrain | Benchmark |
|---|---|---|---|---|
| `a1_a` | Il est renvoyé aux urgences ou rappelle de lui-même. | 1 | La demande urgente sans filet interne est le premier point de tension dans un cabinet saturé. | 60% des passages aux urgences non programmés pourraient être absorbés avec un protocole de tri simple. |
| `a1_b` | Le secrétariat évalue et propose un créneau si possible. | 2 | Un premier tri existe — mais fragile si la personne qui trie est absente. | — |
| `a1_c` | Des créneaux dédiés sont bloqués chaque matin, avec des critères connus de tous. | 3 | Un protocole formalisé libère de la charge mentale et réduit les tensions. | — |
| `a1_d` | La régulation est partagée avec d'autres praticiens du territoire. | 4 | Une coordination territoriale — rare et précieux, vous avez construit quelque chose de durable. | — |

### 5.2 a2 — Demandes non programmées hors urgences

> *Comment gérez-vous les demandes non programmées hors urgences — ordonnance à renouveler, résultat à commenter, question simple ?*

| ID | Texte | s |
|---|---|---|
| `a2_a` | Tout passe par une consultation, je n'ai pas d'autre canal. | 1 |
| `a2_b` | Je traite ces demandes au fil de l'eau, sans cadre formalisé. | 2 |
| `a2_c` | Le secrétariat absorbe les demandes simples avec des critères connus. | 3 |
| `a2_d` | Un canal asynchrone structuré (messagerie sécurisée, espace patient) traite ces demandes. | 4 |

Reformulations et benchmarks à rédiger en passe éditoriale.

### 5.3 a3 — Sortie de consultation (consigne entre deux consults)

> *Comment le patient sait-il ce qu'il doit faire entre deux consultations ?*
>
> *Contexte : résultats d'analyses, ordonnances, surveillance de symptômes.*

| ID | Texte | s |
|---|---|---|
| `a3_a` | Il rappelle ou revient — on gère à ce moment-là. | 1 |
| `a3_b` | J'explique à l'oral en fin de consultation. | 2 |
| `a3_c` | Une consigne écrite (impression ou SMS) part systématiquement avec lui. | 3 |
| `a3_d` | Le patient accède à son suivi en ligne (messagerie sécurisée, espace patient). | 4 |

### 5.4 a4 — Suivi des chroniques connus

> *Comment gérez-vous le suivi de vos patients chroniques connus ?*
>
> *Contexte : diabète, HTA, insuffisance cardiaque, BPCO…*

| ID | Texte | s |
|---|---|---|
| `a4_a` | Ils rappellent quand ils ont besoin — je les vois alors. | 1 |
| `a4_b` | J'essaie de programmer des renouvellements, sans système formalisé. | 2 |
| `a4_c` | Une liste de patients chroniques est tenue à jour avec des rappels de suivi. | 3 |
| `a4_d` | Le suivi est intégré dans le logiciel avec alertes et indicateurs. | 4 |

### 5.5 a5 — Chroniques perdus de vue (dépistage proactif)

> *Comment identifiez-vous les patients chroniques qui devraient revenir mais ne viennent plus ?*

| ID | Texte | s |
|---|---|---|
| `a5_a` | Je ne le fais pas — je ne vois pas comment m'y prendre. | 1 |
| `a5_b` | Je m'en rends compte par hasard, quand un patient revient après un long délai. | 2 |
| `a5_c` | Je relance ponctuellement les patients que j'identifie à risque. | 3 |
| `a5_d` | Une extraction logiciel régulière identifie les patients sans consultation depuis X mois et déclenche une relance. | 4 |

### 5.6 a6 — Tri des résultats d'examens (ex-Q11 V1.1.9)

> *Comment êtes-vous alerté quand un résultat d'examen important arrive pour un patient ?*

| ID | Texte | s |
|---|---|---|
| `a6_a` | Vérification opportuniste — je consulte les résultats quand j'y pense. | 1 |
| `a6_b` | Tri délégué — le secrétariat vérifie et m'alerte sur ce qui me semble critique. | 2 |
| `a6_c` | Vérification régulière — je consulte les résultats à heures fixes plusieurs fois par jour. | 3 |
| `a6_d` | Signalement automatique — le logiciel ou la plateforme m'alerte sur les valeurs hors normes. | 4 |

---

## 6. Bloc 2 — Équipe & secrétariat (6 questions, routing solo)

### 6.0 Préservation de `entity_name` (V1.1.5-i)

Le mécanisme V1.1.5-i qui permettait de saisir un prénom optionnel sous certaines options (Marie, votre télésecrétaire) est **conservé en V2.0** sur les options qui le justifient :

| Question | Option éligible | Champ |
|---|---|---|
| b1 | `b1_d` (rôles formalisés avec équipe) | Prénom de l'associé / collaborateur principal |
| b1b *(solo)* | `b1b_d` (assistant médical en place) | Prénom de l'assistant médical |
| b3 *(non-solo)* | `b3_c` et `b3_d` (secrétariat maîtrisé ou optimisé) | Prénom de la secrétaire référente |

Activé via `has_entity_field: true` + `entity_field_label: "..."` dans le JSON protocol V2. Mécanisme BDD inchangé (colonne `answer.entity_name` déjà présente). Gain de personnalisation dans les forces du rapport (*« Marie, votre télésecrétaire, en soutien direct »* au lieu de *« télésecrétariat en soutien direct »*). Saisie facultative — fallback générique silencieux si vide.

### 6.1 b1 — Répartition des rôles

> *Comment sont répartis les rôles dans votre cabinet ?*

| ID | Texte | s |
|---|---|---|
| `b1_a` | Je gère tout moi-même, ou avec une aide ponctuelle non formalisée. | 1 |
| `b1_b` | Il y a une répartition, mais elle s'est faite au fil du temps sans être vraiment définie. | 2 |
| `b1_c` | Chacun a un périmètre clair — on déborde parfois pour s'entraider. | 3 |
| `b1_d` | Les rôles sont formalisés et évoluent avec les compétences (délégation, protocoles de coopération). | 4 |

### 6.2 Routing conditionnel `b2` selon `cabinet_type`

Si `cabinet_type=solo` → afficher `b1b` (assistant médical envisagé).
Sinon → afficher `b3` (charge du secrétariat).

#### 6.2.1 b1b — Assistant médical envisagé (solo)

> *Vous gérez seul votre cabinet — avez-vous envisagé un assistant médical ?*
>
> *Contexte : ce dispositif est soutenu financièrement par les accords conventionnels.*

| ID | Texte | s |
|---|---|---|
| `b1b_a` | Non, je ne connais pas bien ce dispositif. | 1 |
| `b1b_b` | J'y ai pensé, mais les contraintes m'ont découragé. | 2 |
| `b1b_c` | C'est un projet que j'explore activement. | 3 |
| `b1b_d` | J'ai déjà un assistant médical ou une secrétaire à temps plein. | 4 |

#### 6.2.2 b3 — Charge du secrétariat (non-solo)

> *Comment décririez-vous la charge de travail du secrétariat ?*

| ID | Texte | s |
|---|---|---|
| `b3_a` | Chroniquement débordé — on gère les urgences en permanence. | 1 |
| `b3_b` | Variable — gérable certains jours, tendu d'autres. | 2 |
| `b3_c` | Globalement maîtrisé grâce à une organisation rodée. | 3 |
| `b3_d` | Optimisé — le secrétariat se concentre sur ce qui a vraiment de la valeur. | 4 |

### 6.3 b4 — Circulation des informations dans l'équipe (ex-b2 V3)

> *Comment les informations circulent-elles entre les membres de l'équipe ?*
>
> *Contexte : messages patients, urgences du jour, tâches en attente.*

| ID | Texte | s |
|---|---|---|
| `b4_a` | À l'oral, quand on se croise — ce n'est pas toujours idéal. | 1 |
| `b4_b` | Par notes papier ou messages informels, avec quelques ratés. | 2 |
| `b4_c` | Il y a un outil ou un rituel de transmission (carnet, tableau, point quotidien). | 3 |
| `b4_d` | La communication est structurée : outil partagé, points réguliers, traçabilité. | 4 |

### 6.4 b5 — Continuité en cas d'absence (Q08 V1.1.9 enrichie)

> *Imaginez que vous deviez vous absenter — pour des congés prévus ou un imprévu de plusieurs jours.*

Conserve la formulation Lugia V1.1.9 plus fine que la V3 sur le plan « planifié + imprévu en une même question ».

| ID | Texte | s |
|---|---|---|
| `b5_a` | C'est compliqué — les patients sans solution et le retour chaotique, je l'évite. | 1 |
| `b5_b` | On bricole une solution à chaque fois — ça dépend des disponibilités. | 2 |
| `b5_c` | Préparé pour les congés, fragile pour l'imprévu — je sais fermer pour mes congés, je ne sais pas comment je gérerais une absence soudaine. | 3 |
| `b5_d` | La continuité est organisée : remplaçants rodés, protocoles, patients informés. | 4 |

### 6.5 b6 — Décisions et changement organisationnel concret

Reformulation concrète au lieu de l'abstraction « comment se prennent les décisions » :

> *La dernière fois que vous avez changé quelque chose dans l'organisation du cabinet — un protocole, une habitude, une règle de tri —, comment ça s'est passé ?*

| ID | Texte | s |
|---|---|---|
| `b6_a` | Le changement reste souvent à l'état d'intention — j'ai du mal à le rendre effectif. | 1 |
| `b6_b` | Plusieurs semaines d'allers-retours et des oublis avant que ça tienne. | 2 |
| `b6_c` | Quelques semaines, avec un peu de vérification et de rappels au début. | 3 |
| `b6_d` | Quelques jours — l'équipe (ou moi en solo) sait mettre en œuvre rapidement. | 4 |

### 6.6 b7 — Temps de coordination (inertie des chaînes d'action)

> *À quelle fréquence prenez-vous du recul sur l'organisation du cabinet — bilan court, point d'équipe, revue informelle —, en dehors de la gestion clinique quotidienne ?*

| ID | Texte | s |
|---|---|---|
| `b7_a` | Jamais — j'avance, je ne prends pas le temps. On en parle quand un problème surgit. | 1 |
| `b7_b` | Rarement — quelques échanges informels, sans rythme défini. | 2 |
| `b7_c` | Quelques moments structurés par trimestre — point d'équipe ou réflexion personnelle. | 3 |
| `b7_d` | Rituel installé — moments réguliers (mensuels au minimum), avec décisions tracées et suivies. | 4 |

**Note sur la numérotation** : `b6` et `b7` sont les 5e et 6e questions du bloc (le routing entre `b1b` et `b3` consomme une seule position visible, position 2). Le total reste de 6 questions affichées.

---

## 7. Bloc 3 — Outils & dossiers (6 questions)

### 7.1 c1 — Maîtrise du logiciel médical

> *Comment qualifieriez-vous votre maîtrise de votre logiciel médical ?*

Le logiciel précis est connu via le profil (`logiciel_metier`). Les reformulations terrain peuvent donc le nommer dynamiquement (« dans Médidoc, vous avez le module file active dans le menu Patients > Suivi »).

| ID | Texte | s |
|---|---|---|
| `c1_a` | J'utilise les fonctions de base — le reste, je ne sais pas ce que ça fait. | 1 |
| `c1_b` | Je me débrouille, avec quelques fonctions apprises au fil du temps. | 2 |
| `c1_c` | Je connais bien mon logiciel et j'utilise la plupart des fonctions utiles. | 3 |
| `c1_d` | Workflow optimisé : modèles, raccourcis, automatisations. | 4 |

### 7.2 c2 — Tenue des dossiers patients

> *Comment sont tenus les dossiers patients dans votre cabinet ?*

| ID | Texte | s |
|---|---|---|
| `c2_a` | Les dossiers sont là, mais leur contenu varie beaucoup selon les patients. | 1 |
| `c2_b` | Il y a une structure de base, mais elle n'est pas toujours respectée. | 2 |
| `c2_c` | Les dossiers suivent une trame cohérente, les informations importantes sont accessibles rapidement. | 3 |
| `c2_d` | Dossiers structurés permettant une prise en charge par n'importe quel praticien. | 4 |

### 7.3 c3 — Flux administratif quotidien

> *Comment gérez-vous le flux administratif quotidien ?*
>
> *Contexte : courriers, résultats, ordonnances, feuilles de soins.*

| ID | Texte | s |
|---|---|---|
| `c3_a` | C'est une source de stress — j'ai toujours du retard. | 1 |
| `c3_b` | Je gère, mais ça prend beaucoup de temps hors des heures de consultation. | 2 |
| `c3_c` | J'ai des plages dédiées et des méthodes pour traiter ce flux efficacement. | 3 |
| `c3_d` | Le flux est largement délégué ou automatisé. | 4 |

### 7.4 c4 — Adoption des outils numériques de santé

> *Quels outils numériques de santé utilisez-vous au quotidien ?*
>
> *Contexte : Mon Espace Santé, MSSanté, téléconsultation, dossier régional.*

| ID | Texte | s |
|---|---|---|
| `c4_a` | Aucun ou presque — je n'en ressens pas le besoin. | 1 |
| `c4_b` | Quelques-uns par obligation (carte Vitale, télétransmission), sans en exploiter le potentiel. | 2 |
| `c4_c` | J'utilise activement plusieurs (MSSanté, Mon Espace Santé, téléconsultation), avec retour positif. | 3 |
| `c4_d` | Ces outils sont intégrés dans mon workflow et je les utilise pour optimiser le parcours patient. | 4 |

### 7.5 c5 — Positionnement vis-à-vis de l'IA

> *Comment positionnez-vous l'IA générative dans votre activité ?*
>
> *Contexte : rédaction de courriers, synthèses, recherches cliniques, aide à la décision.*

**Reformulation V2 (post-revue)** : la version factuelle initiale exposait le médecin à un biais de désirabilité inverse fort — personne ne cochait s=1 ou s=2 même si c'était sa pratique réelle. Les options sont reformulées pour mesurer la **maturité de positionnement** sans présupposer de comportements illicites. Les reformulations terrain (cf §10) peuvent ensuite nommer les enjeux légaux quand pertinent.

| ID | Texte | s |
|---|---|---|
| `c5_a` | Je ne l'utilise pas — je ne vois pas encore l'intérêt pour mon exercice, ou je préfère attendre. | 1 |
| `c5_b` | Je l'utilise ponctuellement, sur des sujets génériques (recherche, rédaction), avec des questions sur le cadre. | 2 |
| `c5_c` | Je l'utilise régulièrement avec une vigilance active sur la conformité — sans m'être encore équipé d'un dispositif dédié au médical. | 3 |
| `c5_d` | J'ai intégré un dispositif IA conforme au secret médical (hébergeur HDS, IA locale, prestataire certifié santé) dans mon workflow. | 4 |

Note interne : `c5_c` capte précisément le profil cible Lugia — usage IA grand public mais avec conscience des enjeux. La reformulation terrain pour cette option peut nommer le sujet de fond : *« L'usage régulier d'IA grand public, même avec vigilance, sort du cadre RGPD. C'est exactement ce que Lugia vient sécuriser. »* — sans culpabiliser, en posant le levier.

### 7.6 c6 — Suivi des enjeux de conformité

Liste utilisée comme ancrage de la question (à afficher dans le `ctx`) :
- Protection des données (RGPD, HDS, MSSanté, violations CNIL)
- Dossier médical & traçabilité (DMP, conservation 20 ans, ordonnances sécurisées)
- Prescription & pharmacovigilance (HAS, AMM, antibiotiques)
- Secret médical & déontologie (signalements MDO, conflits d'intérêts, Sunshine)
- DPC (formation continue, recertification)
- Cabinet & exercice professionnel (PMR, contrats salariés, prévention)
- Facturation & conventionnement (CCAM, NGAP, télétransmission, contrôles CPAM)
- Numérique en santé (Mon Espace Santé, télémédecine, dispositifs médicaux numériques)

> *À quel point les enjeux de conformité de votre cabinet (RGPD, HDS, secret médical, DMP, pharmacovigilance, DPC, accessibilité, facturation CCAM, numérique en santé…) sont-ils suivis activement ?*

| ID | Texte | s |
|---|---|---|
| `c6_a` | Je sais qu'il y a des enjeux mais je n'ai pas le temps de m'y pencher au quotidien. | 1 |
| `c6_b` | Je suis ce qu'on m'envoie (CPAM, DPC, instances), sans démarche proactive. | 2 |
| `c6_c` | Je suis activement 2 ou 3 sujets majeurs et je m'informe régulièrement (HAS, RGPD, MSSanté). | 3 |
| `c6_d` | J'ai cartographié les enjeux applicables à mon cabinet et je les suis systématiquement — revue régulière, mise à jour, traçabilité. | 4 |

---

## 8. Logique de scoring V2

### 8.1 Calcul du score par bloc

Pour chaque bloc (`a`, `b`, `c`) :
```
score_bloc = (Σ s_option_choisie) / (N_visible × 4) × 100
```
**N_visible = nombre de questions visibles pour le profil courant** (avec routing solo : b1b est visible pour solo, b3 pour non-solo, jamais les deux). Toujours 6 par bloc. Le calcul de score doit s'aligner sur la liste de questions effectivement servies au médecin via `protocol.get_visible_questions(profile)`, **pas** sur l'ensemble des IDs déclarés dans le protocole — sinon les non-solo seraient pénalisés pour `b1b` absent et inversement.

Score entier de 0 à 100, plancher mathématique à 25% (toutes les questions à s=1).

### 8.2 Mapping score → niveau qualitatif Lugia

| Plage | Niveau | Sémantique |
|---|---|---|
| ≥ 78% | **Maîtrisé** | Le bloc est solide, peu de marges immédiates |
| 55-77% | **Opérationnel** | Fonctionne, marges d'amélioration ciblées |
| 35-54% | **À surveiller** | Plusieurs fragilités à structurer |
| 0-34% | **À risque** | Point critique, à traiter en priorité |

À tester en pilote : l'ambiguïté potentielle de « Opérationnel » (lu comme « ça tourne, pas d'urgence ») justifie une alternative en réserve : *« En progression »*.

### 8.3 Affichage et badges asymétriques

Reprend D-025 V1.1.6 : niveaux 1-2 (Maîtrisé/Opérationnel) sans badge visuel, niveaux 3-4 avec badge coloré sobre (gris neutre `#f0f0f0` / rouille `#fbeae0`). L'absence de badge sur les niveaux positifs force la lecture du texte plutôt que l'arrêt au signal visuel.

### 8.4 Score global non affiché

Pour analyses cohortes ultérieures, on stocke dans `interview.global_score = round((score_a + score_b + score_c) / 3)`. Non affiché au médecin (cohérent avec D-013 : la moyenne d'axe est déjà une simplification ; faire une moyenne de moyennes serait trompeur). Visible en backend admin uniquement.

---

## 9. Signaux croisés (5 patterns)

Calculés sur les scores % des 3 blocs en règles déterministes pures.

| ID | Condition | Titre du signal | Tonalité |
|---|---|---|---|
| `S-burnout` | A ≤ 34 ET B ≤ 34 ET C ≤ 54 *(inhibé si au moins un axe tient)* | Signal fort : risque d'épuisement professionnel | Alerte forte |
| `S-tech-vs-organisation` | C ≥ 55 ET A ≤ 34 ET B ≤ 34 | Vous avez investi sur les outils — l'organisation humaine est le prochain palier | Recadrage |
| `S-admin` | B ≤ 34 ET C ≤ 34 | Surcharge administrative chronique | Alerte |
| `S-paradox` | A ≥ 55 ET B ≤ 34 *(seuil assoupli vs 78)* | Paradoxe : bon parcours patient, équipe fragile | Paradoxe |
| `S-tools-opp` | C ≤ 34 ET A ≥ 55 | Opportunité : vos pratiques méritent de meilleurs outils | Opportunité |
| `S-structured` | A ≥ 55 ET B ≥ 55 ET C ≥ 55 | Cabinet structuré — voici où concentrer votre énergie pour passer au niveau suivant | Positif |

Seul **un signal** est affiché à la fois. Priorité d'évaluation dans l'ordre du tableau ; le 1er match gagne. `S-structured` ferme le tableau (s'évalue en dernier, ne masque jamais une alerte).

**Cas limite traité (post-revue)** : un médecin A=33, B=34, C=90 ne déclenche plus `S-burnout` (inhibé par C ≥ 55) mais tombe sur `S-tech-vs-organisation` — recadrage plus juste que l'alerte burnout générique.

---

## 10. Personnalisation déterministe — 13 règles nommées

Chaque règle est une fonction Python explicite dans `src/v2/personalize.py`, testable unitairement, documentée.

**Posture éditoriale (post-revue)** : toutes les règles de benchmarks personnalisés et de reformulations sont formulées **en levier d'action, jamais en culpabilité**. Une donnée chiffrée présentée comme « ce que vous perdez » est anxiogène ; la même présentée comme « ce que vous gagnez en structurant » est mobilisatrice. Cette consigne s'applique à toutes les variantes de message dans `src/v2/personalize.py` et `src/v2/templates.py`, et conditionne toute reformulation future.

### 10.1 Règles de tonalité

**R-status-junior** — si `status=récent` (<3 ans), reformulations qui normalisent par temporalité : *« c'est courant à ce stade d'installation »*, *« la plupart des cabinets prennent 2-3 ans à construire leurs routines »*. Évite tout encouragement paternaliste.

**R-status-senior** — si `status=senior` ou `status=approche_transmission`, reformulations qui légitiment le recul : *« vous avez le recul nécessaire pour distinguer ce qui tient de ce qui dépend de vous »*, *« à votre stade, les chantiers utiles sont souvent ceux qui rendent le cabinet transmissible »*.

**R-motivation-tone** — adapte la phrase d'accueil du diagnostic selon `motivation` (réutilise et étend le câblage Q06 de V1.1.8) :
- `motivation=charge` → *« Vous avez démarré ce check-up pour identifier ce qui pèse le plus dans votre semaine. »*
- `motivation=événement` → *« Vous avez démarré ce check-up pour préparer un événement à venir dans votre cabinet. »*
- `motivation=risque` → *« Vous avez démarré ce check-up pour sécuriser un risque identifié. »*
- `motivation=curiosité` → ouverture neutre (pas d'introduction de cadrage).

### 10.2 Règles de priorisation

**R-energy-prio** — selon l'ancrage énergie :
- `energy=au_bord` → priorité absolue aux chantiers effort 1 + impact immédiat. Tonalité de synthèse adoucie : *« On commence par dégager du temps, le reste viendra. »*
- `energy=souvent_vidé` → idem mais on autorise effort 2 si l'impact est court terme.
- `energy=tendu_mais_ça_passe` → ordre standard par sévérité décroissante.
- `energy=bien` → autorise les chantiers d'investissement à moyen terme (formation, restructuration).

**R-motivation-prio** — pondération différentielle selon motivation :
- `motivation=sécuriser_risque` → **le score le plus bas remonte en priorité absolue** dans l'ordre des opportunités, indépendamment du seuil.
- `motivation=réduire_charge` → priorité aux chantiers effort 1-2.
- `motivation=anticiper_événement` → priorité aux chantiers liés à la transmissibilité (cadre, protocoles, formation, continuité).
- `motivation=curiosité` → ordre standard.

**R-horizon-prio** — selon `horizon` :
- `horizon=préparer_transmission` → les opportunités du bloc B (équipe, continuité, formalisation) remontent avant celles du bloc C (outils).
- `horizon=renforcer_équipe` → les opportunités B remontent également, avec accent sur la délégation et l'assistant médical.
- `horizon=déménager_agrandir` → les opportunités C (logiciel, dossiers structurés) remontent (la transition est l'occasion de revoir l'outillage).
- `horizon=reconduire_à_l_identique` ou `horizon=incertain` → ordre standard.

### 10.3 Règles de personnalisation des benchmarks

**R-bench-solo-charge** — si `cabinet_type=solo` ET `score_B ≤ 34` → benchmark spécifique : *« À votre profil, sans équipe formalisée, vous portez seul l'équivalent de 1,5 ETP d'organisation. »*

**R-bench-volume-admin** — si `volume>120` ET `score_C ≤ 54` → *« À votre volume, la moyenne admin est 2h45/jour — vous êtes probablement au-dessus. »*

**R-bench-transmission** — si `status=approche_transmission` ET `score_B ≤ 54` → *« Un cabinet bien organisé se valorise 30-40 % mieux à la transmission. »* (Reformulé en positif post-revue : même information, levier motivationnel inversé.)

**R-bench-soloHero** — si `paramedical_team=non` ET `cabinet_type=solo` ET `score_A ≥ 55` ET `score_B ≤ 34` → *« Vous tenez votre cabinet à bout de bras — c'est rare, et ça interroge sur la durée. »*

### 10.4 Règles de routing protocole

**R-routing-solo** — si `cabinet_type=solo` → afficher `b1b` (assistant médical) en position 2 du bloc B. Sinon → afficher `b3` (charge secrétariat).

**R-routing-rdv** — si `rdv_canal=doctolib` ou `rdv_canal=maiia`, dans la reformulation de `c4` (adoption outils numériques), nommer explicitement la plateforme dans le contexte (*« vous utilisez déjà Doctolib pour la prise de RDV, voici les outils suivants à explorer… »*).

### 10.5 Règles de niveau territoire

**R-territoire-context** — si `territoire=zone_sous_dotée` → les chantiers de coordination avec confrères et les opportunités liées à l'orientation reçoivent une mention contextuelle (*« sachant les délais d'accès aux spécialistes dans votre zone, ce chantier prend une dimension supplémentaire »*). N'altère pas le score, enrichit la formulation.

### 10.6 Règle de profil remplaçant (post-revue)

**R-replacement** — si `status=remplaçant` :
- **Ton** : reformulations qui assument la posture de découverte (*« vous découvrez l'organisation de cabinets différents, votre lecture est probablement comparative »*) plutôt que la posture de pilotage. Pas de *« vous devriez »*, beaucoup de *« vous observez »*.
- **Chantiers exclus** : ceux qui supposent une autorité d'installation — recruter un assistant médical, formaliser des rôles avec l'équipe, restructurer les protocoles internes.
- **Chantiers favorisés** : observation comparative, posture de transférabilité, identification des bonnes pratiques rencontrées qui pourront servir lors d'une installation future.
- **Bandeau d'avertissement** discret en tête des résultats : *« Vous êtes remplaçant — les recommandations qui suivent sont à lire comme une grille de lecture des cabinets que vous traversez, pas comme un plan d'action immédiat. »*

Ne ferme pas la porte aux remplaçants (beaucoup sont en transition vers une installation), adapte le rendu pour qu'il leur soit utile à leur stade.

---

## 11. Architecture technique V2

### 11.1 Migration BDD

```sql
-- interview : champ version
ALTER TABLE interview ADD COLUMN protocol_version TEXT NOT NULL DEFAULT 'v1.1.9';
ALTER TABLE interview ADD COLUMN global_score INTEGER;

-- user_profile : extension calibrage V2 (cf §3.4)
-- + colonnes cabinet_type, volume, paramedical_team, logiciel_metier, etc.

-- answer : champ scored (false pour ancrage énergie)
ALTER TABLE answer ADD COLUMN scored BOOLEAN NOT NULL DEFAULT TRUE;
```

Toutes idempotentes au démarrage Render via `init_db()`.

### 11.2 Fichiers de protocole

- `resources/interview_protocol.json` v1.10 → **figée**, sert V1.1.9.
- `resources/interview_protocol_v2.json` → V2.0, IDs `a1..a6, b1, b1b, b3, b4..b7, c1..c6`, structure étendue : option = `{id, label, s, reformulation, benchmark|null, node_type, tags}`.
- `resources/modules_v2.json` (à créer) → 7 modules d'approfondissement V3 réécrits en ton Lugia (anti-jargon, non culpabilisant). Plan en 4 étapes, tags temporalité `quick/medium/invest`, benchmark de conclusion.
- `resources/diagnostics_v2.json` (à créer) → titres de diagnostic par couple (axe, niveau) : 4 niveaux × 3 axes = 12 titres serif courts (style *« Le patient navigue à vue »*, *« Une équipe qui fonctionne, mais sous tension »*).

### 11.3 Modules Python V2

Nouveau package `src/v2/` :
- `src/v2/questions.py` — chargement du protocole v2.0 et routing solo.
- `src/v2/scoring.py` — calcul score % par bloc, mapping niveau qualitatif, global_score.
- `src/v2/signals.py` — détection des 5 signaux croisés, priorité d'évaluation.
- `src/v2/opportunities.py` — sélection des chantiers (mêmes 7 chantiers V3 reformulés Lugia), conditions sur scores.
- `src/v2/modules.py` — chargement et exposition des 7 modules d'approfondissement statiques.
- `src/v2/personalize.py` — les 12 règles déterministes nommées.
- `src/v2/templates.py` — assemblage final du rapport (phrase d'accueil selon motivation, ordre des opportunités selon règles, benchmarks personnalisés, titres de diagnostic).

### 11.4 Backend FastAPI

- Dispatcher dans `backend/main.py` : lit `interview.protocol_version` et route vers les modules V1.1.x ou V2 selon.
- Endpoints exposés ou modifiés :
  - `POST /interviews?protocol_version=v2.0` — crée interview avec version.
  - `GET /protocol?version=v2.0` — sert le protocole v2.
  - `GET /report/{interview_id}` — auto-route selon version.
  - `GET /modules` (V2 only) — liste des 7 modules.
  - `GET /modules/{id}` (V2 only) — détail d'un module.
  - `PATCH /me/profile` — étendu aux nouveaux champs profil.

### 11.5 Frontend Next.js

**Pages nouvelles** :
- `/profil` — mini-onboarding 2 étapes avec chips. Si profil non rempli au lancement d'un check-up V2, redirige ici.
- `/checkup-v2` — parcours V2 (intro, ancrage énergie, 3 blocs successifs avec format bloc-entier, pages intermédiaires, radar dynamique).
- `/resultats-v2` — page résultats V2 (radar SVG, signaux croisés, cartes axe dépliables avec pistes d'action + benchmark, opportunités, carte « Creuser un chantier » statique en V2.0).
- `/modules/[id]` — module d'approfondissement V2 (statique, ouvrable depuis carte opportunité ou cliquable depuis CTA).

**Pages modifiées** :
- `/` — accueil à 2 cartes (Check-up classique V1.1.9 / Nouvelle version V2.0).
- `/compte` — élargi au profil V2 (lien vers `/profil` si éditer).

**Composants nouveaux** :
- `ProfilStep1.tsx`, `ProfilStep2.tsx` — chips en 2 étapes.
- `CheckupV2Block.tsx` — bloc 6 questions format bloc-entier (Mode A pur).
- `OptionCardV2.tsx` — option avec check-mark + reformulation inline + benchmark conditionnel.
- `BlockTransition.tsx` — page intermédiaire avec score-reveal animé.
- `RadarLive.tsx` — radar SVG dynamique permanent (responsive : caché ≤ 1080px).
- `RadarResult.tsx` — radar SVG complet de la page résultats (avec drop-shadow et glow doux dans la palette Lugia).
- `FacetCardV2.tsx` — carte axe dépliable avec titre de diagnostic, pistes, benchmark.
- `ChantierCardV2.tsx` — carte opportunité avec effort pips + tag impact.
- `ModuleV2.tsx` — page module avec plan 4 étapes + benchmark de conclusion.
- **`RadarTopbar.tsx`** (post-wireframe) — mini radar dynamique persistant intégré dans la topbar de progression. Visible toujours, y compris en mobile (où le radar aside disparaît sous 1080px). Format compact : SVG 40×40 + 3 mini-rows (axe, dot coloré, label tronqué, niveau qualitatif). Sur mobile <720px : seuls les 3 niveaux qualitatifs subsistent, le SVG est masqué.

**Composants V1.1.9 préservés** : tous les composants V1.1.9 (`CheckupHeader`, `CheckupProgress`, `CheckupIntro`, `CheckupWidgets`, etc.) restent en place pour servir le parcours V1.1.9 actuel. Aucun n'est modifié.

### 11.6 Comportements UX V2 (ajouts post-wireframe)

**Auto-scroll après réponse à une question.** Quand le médecin clique sur une option dans `CheckupV2Block`, on déclenche après 250 ms un `window.scrollBy({ top: delta, behavior: 'smooth' })` calculé pour positionner le bas de la card répondue à ~70% du viewport. Effet attendu : la reformulation terrain inline + le benchmark (s'il existe) restent visibles, et le début de la question suivante apparaît juste en-dessous. Donne un **sentiment d'avancement dans le déroulé** sans demander au médecin de scroller manuellement entre chaque question. Implémenté en JS pur côté `OptionCardV2`, sans dépendance, sans librairie d'animation. Désactivé si `prefers-reduced-motion: reduce` est détecté.

**Différenciation des deux affichages radar (post-revues itératives).** Pour éviter la redondance entre le mini-radar topbar et le radar aside, les deux affichages sont rendus **complémentaires** plutôt que dupliqués : la topbar n'apparaît que quand l'aside est masqué (mobile / tablette portrait), l'aside concentre l'information riche sur desktop.

**Radar aside grand format (≥ 1080px) — affichage principal.** Composant `RadarLive.tsx`, sticky à droite du bloc questions. Format **flottant style V4** (post-revue itérative) :

- **Pas de carte conteneur** autour du radar — pas de fond blanc, pas de bordure, pas de border-radius. Le radar flotte directement sur la couleur de fond générale (`--lugia-bg`). Cela donne un effet d'**intégration dans la page** plutôt que de panneau ajouté.
- **Pas de header** « Votre cabinet ». Le radar parle de lui-même.
- **SVG triangle tourné** : sommet A (parcours patient) à 0° (à droite), sommet C (outils) à 120° (haut-gauche), sommet B (équipe) à 240° (bas-gauche). Triangle équilatéral pivoté de -90° vs la version précédente. Le triangle n'a donc pas de base horizontale en bas, il a une **pointe à droite** qui donne du dynamisme.
- **Dimension compacte** : SVG `max-width: 150px` dans le wrapper aside, centré horizontalement. Le radar reste lisible sans monopoliser la colonne latérale — la liste des 3 axes en dessous occupe la largeur naturelle de l'aside.
- **Grille interne bien visible** : 4 polygones concentriques (25 / 50 / 75 / 100 % du rayon) avec un stroke discret mais perceptible. Permet au médecin de **comprendre qu'il y a une échelle** et de situer son polygone visuellement. Couleur entre `#d4cfbf` (niveau 4 le plus visible) et `#e8e3d3` (niveau 1 plus discret) pour donner une profondeur visuelle.
- 3 axes (lignes du centre vers les sommets) en stroke discret.
- Polygone de scores qui se construit en direct (vertex sur le % calculé pour chaque axe).
- **Pas de labels axes** (PARCOURS / ÉQUIPE / OUTILS) directement sur le SVG — la légende est portée par les 3 lignes texte en dessous.
- **3 points couleur affichés dès le départ à la même dimension** (r=4) et même rendu visuel (pas de glow différencié, pas d'opacité réduite sur les axes pas encore amorcés). Quand un axe n'a pas encore été commencé, son point est positionné à ~4% du rayon (un poil hors centre) pour rester visible mais sans tromper sur l'amplitude réelle. Quand des réponses arrivent, le point glisse le long de son axe.
- **3 lignes axe sous le SVG** (séparées du SVG par un trait fin `--lugia-border`) : dot coloré + nom complet + niveau qualitatif Lugia.
- **Mini-barre de progression** de 2px sous chaque ligne axe (style V3 `ls-track`), remplie à la proportion du score %. La barre est un **affichage visuel** du score, pas une exposition numérique — cohérent avec D-013/D-023.
- **Pas de bloc « Repère terrain » dans l'aside.** Les benchmarks combinatoires personnalisés (issus des règles `R-bench-*`) sont basculés dans la **page résultats finale** uniquement.

**Radar de la page résultats finale.** Le composant `RadarResult.tsx` reprend **exactement la même orientation** que l'aside `RadarLive` — sommet A (parcours patient) à 0° (à droite), sommet C (outils) à 120° (haut-gauche), sommet B (équipe) à 240° (bas-gauche). Dimension plus grande (~340×340 dans le viewBox) pour donner du poids à la silhouette finale du cabinet. Mêmes 4 polygones concentriques visibles, mêmes 3 points couleur à même dimension. **Labels axes affichés sur le SVG** (contrairement à l'aside du questionnaire qui s'en passe) — ils prennent leur place autour du triangle, alignés dans la direction de chaque axe. Cohérence visuelle bout en bout du parcours : le médecin reconnaît la silhouette qu'il a vu se construire dans l'aside.

**Mini-radar topbar — fallback responsive uniquement.** Format **strictement textuel** (3 lignes axe + niveau qualitatif). Sans SVG, sans barre. **Masqué sur ≥ 1081px** (l'aside suffit, pas de redondance). Affiché en topbar uniquement quand l'aside disparaît (≤ 1080px). Permet de garder une présence persistante de la maturité par axe sur tous les écrans, sans doublonner l'aside.

### Deux types de benchmarks distincts

Un piège conceptuel à acter clairement dans la spec et dans le code, parce que les deux types portent le même nom commun (« benchmark ») mais ont une sémantique différente :

| Type | Source | Affichage | Exemple |
|---|---|---|---|
| **Benchmark inline d'option** | Champ `benchmark` d'une option dans `interview_protocol_v2.json` | Encadré ambré sous la question répondue, animation fadeIn | *« 60 % des passages aux urgences non programmés pourraient être absorbés avec un protocole de tri simple »* |
| **Repère terrain personnalisé combinatoire** | Règles `R-bench-*` (§10.3) qui croisent profil × scores | **Page résultats finale uniquement** — section dédiée sous le radar grand format | *« À votre profil senior solo, sans équipe formalisée, vous portez seul l'équivalent de 1,5 ETP d'organisation »* (R-bench-soloHero) |

Le **benchmark inline** est attaché à **une réponse spécifique** ; il apparaît juste après le clic, dans le contexte direct de la question. Le **repère terrain** est attaché à **une combinaison profil × scores** ; il apparaît dans l'aside et change quand une nouvelle règle `R-bench-*` se déclenche au fil des réponses.

Les deux types sont **complémentaires**, pas en compétition : le médecin peut voir un benchmark inline qui réagit à sa dernière réponse, et un repère terrain dans l'aside qui réagit à son profil global. Pas de doublon possible — les règles `R-bench-*` produisent des messages qui ne reprennent jamais le contenu des `benchmark` d'option.

### Logique de calcul (commune aux deux affichages radar)

À chaque clic sur une option :
1. Recalcul du score % côté front sur les questions répondues du bloc concerné (`Σ s / (N_répondues × 4) × 100`).
2. Mapping vers le niveau qualitatif via `score_to_level()` (§8.2).
3. Mise à jour du **texte** du niveau dans le mini-radar topbar (si visible) **et** dans la liste de l'aside (synchronisés).
4. Mise à jour du **polygone SVG** de l'aside (vertex sur le % calculé, animation `transition: cx/cy 300ms ease`).
5. Mise à jour des **mini-barres** sous chaque axe de l'aside (`transition: width 400ms ease-out`).
6. **(Plus pendant le questionnaire)** L'évaluation des règles `R-bench-*` est désormais déclenchée uniquement à l'arrivée sur la page résultats finale — pas pendant la complétion des blocs (post-revue : on garde l'aside épuré, on évite la surcharge cognitive pendant la saisie).

**Cohérence avec la sémantique Lugia.** Aucun affichage de score numérique chiffré côté médecin (cf D-013, D-023). Seuls les niveaux qualitatifs apparaissent en texte ; les barres et le polygone restent des représentations visuelles proportionnelles. Le score % reste un objet interne au calcul, jamais exposé.

---

## 12. Critères d'acceptation V2.0

- [ ] Migration BDD passante (idempotente) : champs `protocol_version` sur `interview`, profil V2 sur `user_profile`, `scored` sur `answer`.
- [ ] Page d'accueil à 2 cartes (Check-up V1.1.9 / V2.0) opérationnelle.
- [ ] Profil V2 (9 chips/champs) saisissable en 2 étapes, sauvegardé silencieusement, ré-éditable depuis `/compte`.
- [ ] Démarrage V2.0 impossible sans profil complet (redirection automatique vers `/profil`).
- [ ] Ancrage énergie en ouverture du questionnaire, stocké non-scoré.
- [ ] Parcours V2 : 3 blocs successifs × 6 questions (avec routing solo), Mode A pur, reformulations inline après chaque clic, benchmarks sur réponses critiques.
- [ ] Radar SVG dynamique permanent visible pendant le parcours (≥ 1080px), masqué en mobile.
- [ ] Pages intermédiaires inter-blocs avec score-reveal animé.
- [ ] Page résultats V2 : hero, radar complet, signal croisé conditionnel, 3 cartes axe dépliables, 4 opportunités max, 7 modules accessibles via cartes ou CTA.
- [ ] 12 règles de personnalisation déterministe implémentées et testées unitairement.
- [ ] V1.1.9 strictement préservée (aucun changement sur les modules `src/templates.py`, `src/swot.py`, `src/workstreams.py` etc. ; aucune régression `dump_report` sur Chateau V1.1.9).
- [ ] Tests bout en bout : parcours complet V2.0 avec persona Chateau adapté V2 (nouveaux seeds), génération rapport, vérification des règles de personnalisation actives selon profil.
- [ ] **Test sensibilité des seuils** : générer 5-10 profils synthétiques (junior installé récent, Chateau senior, médecin MSP, etc.) et vérifier que la distribution des niveaux qualitatifs (Maîtrisé / Opérationnel / À surveiller / À risque) reste cohérente sur 6 questions par bloc (vs 5 en V3). Documenter les seuils retenus.
- [ ] **Test unitaire scoring avec routing** : vérifier qu'un médecin solo répondant `b1b` et un non-solo répondant `b3` obtiennent le même score quand leurs réponses sont équivalentes en `s`. Le calcul doit se baser sur `N_visible` (questions effectivement servies via routing), pas sur l'ensemble des IDs du protocole.
- [ ] **Mini-radar topbar fallback responsive** : 3 lignes textuelles (axe + niveau qualitatif Lugia) affichées dans la topbar **uniquement** quand l'aside est masqué (≤ 1080px). **Masqué ≥ 1081px** pour éviter la redondance avec l'aside. Affichage des niveaux qualitatifs Lugia uniquement, jamais le score numérique.
- [ ] **Radar aside grand format** (≥ 1080px) — style V4 flottant : pas de carte conteneur (fond transparent), triangle tourné (pointe à droite), **grille 4 niveaux concentriques bien visibles**, **3 points couleur même dimension dès le départ** (pas de glow différencié), pas de labels axes sur le SVG, polygone qui se construit en direct. Sous le SVG : 3 lignes nom + niveau qualitatif Lugia + **mini-barres horizontales de progression** (style V3). Pas de bloc Repère terrain (basculé en page résultats finale). Polygone, points et barres se mettent à jour à chaque clic sur une option.
- [ ] **Auto-scroll après réponse** : au clic sur une option, la fenêtre se déplace en `behavior: smooth` après 250 ms pour positionner le bas de la card répondue à ~70% du viewport. Désactivé proprement si `prefers-reduced-motion: reduce` est actif côté utilisateur.

---

## 13. Hors périmètre V2.0 (différé)

| Sujet | Différé à | Source |
|---|---|---|
| Conversation IA chantier (modèle Claude, prompt structuré, parseur PLAN_JSON/SUGG_JSON/END_CONVERSATION) | V2.1 | V6 |
| Historique des diagnostics + radar comparatif T0/T+3/T+6 | V2.2 | piste #2 V6 |
| Plan d'action persistant avec cases à cocher | V2.2 | piste #3 V6 |
| Mode équipe + radars superposés 360° | V3+ | piste #4 V6 + piste #10 V3 |
| Benchmarks positionnels chiffrés (« vous êtes au quartile X ») | V2.2 si suffisamment de données collectées | piste #5 V6 |
| Export PDF | V2.2 | piste #6 V6 |
| Mini-vérifications de réalité (« sur vos 20 derniers diabétiques… ») | V2.1+ | piste #7 V6 |
| Connexion logicielle (Doctolib/Crossway/Cegedim API) | V3+ | piste #7 V6 |
| Mémoire IA entre sessions | V2.2+ | piste #8 V6 |
| 4e axe Ancrage territorial | V3+ | piste #9 V3 |

---

## 14. Trajectoire vers V2.1 et au-delà

**V2.1 — Conversation IA chantier.** Une fois V2.0 livrée et testée par 3-5 médecins, ouvrir le chantier IA conversationnelle. Architecture :
- Endpoint backend `POST /chat/chantier/{interview_id}/{chantier_id}` qui proxie Claude (Anthropic Haiku ou Sonnet à arbitrer).
- System prompt structuré en 4 phases (ouverture → creusement × 2 → plan d'action → clôture) avec balises JSON intégrées (`PLAN_JSON`, `SUGG_JSON`, `END_CONVERSATION`).
- Context injecté : profil, scores, signal croisé, **toutes les réponses du questionnaire**, ancrage énergie, chantier choisi.
- Streaming SSE côté front, parsing des balises côté client.
- Persistance optionnelle des transcripts (RGPD à reconsidérer cf D-018).
- Coût opérationnel ~0.01-0.05€ par conversation.

V2.1 transforme les 7 modules statiques en **points de départ** pour une conversation personnalisée. Le module statique reste accessible en fallback si IA indisponible.

**V2.2 — Persistance et historique.** Une fois la conversation IA livrée :
- Historique des interviews avec radar comparatif (piste #2 V6).
- Plan d'action persistant cochable (piste #3 V6).
- Export PDF du diagnostic (piste #6 V6).
- Benchmarks positionnels si volumétrie suffisante (~200 interviews).

**V3+ — Compagnon de transformation.** Mode équipe, mémoire IA entre sessions, 4e axe territorial, connexion logicielle. Sortie strictement post-tests prospects V2.1.

---

## 15. Décision associée — D-029 (à journaliser après validation specs)

**D-029 — Refonte V2.0 du check-up + cohabitation BDD V1.1.9 / V2.0.**

Synthèse à inscrire dans `DECISIONS.md` après validation :
- Adoption des leviers V3/V4/V6 (reformulations inline, benchmarks, calibrage profil, ordre par blocs stricts, Mode A pur, pages intermédiaires, radar dynamique, modules d'approfondissement).
- Rupture avec D-021 (alternance des modes B/C) — assumée vu la cohérence du focus mental par axe.
- D-027 (simplification 9→3 facettes) reste valide ; V2.0 garde les 3 axes.
- D-020 (SLM hybride en V1.2) suspendue sine die — méthodologique enrichi maximisé en V2.0, IA conversationnelle de creusement en V2.1+ (pas IA de génération de diagnostic).
- D-028 (V1.1.9) reste figée — V1.1.9 maintenue accessible en cohabitation, plus de modifications sauf bug critique.

---

*Fin des specs V2.0. Toute modification doit être validée et journalisée en CHANGELOG + DECISIONS (D-029 à acter quand specs validées).*
