# DECISIONS

Décisions structurantes du projet, journalisées avec leur motivation et les alternatives écartées.

Toute évolution de l'une de ces décisions doit être discutée et journalisée comme une nouvelle entrée datée, sans effacer l'historique.

---

## D-043 — Path A approfondissement remplacé par la discussion LLM (2026-05-26)

L'idée V1.1.10 d'un « questionnaire d'approfondissement Path A » (5-7 questions par chantier après le diagnostic) est **abandonnée**. À la place, la discussion LLM (chat assistant 4 phases — D-036, étendue par D-040 toggle Cloud/Local) joue le rôle d'approfondissement.

**Découpage par offre** :
- **Lugia Checkup Demo (gratuit)** : discussion LLM limitée — 1 chantier prioritaire, 20 messages max, mécanique 4 phases structurée se clôt automatiquement. C'est ce qui est en prod aujourd'hui.
- **Lugia Work System (payant)** : discussion LLM étendue — multi-chantiers, persistance entre sessions, pas de limite stricte sur les messages, assistant personnel d'aide à la décision.

**Pourquoi** : un questionnaire d'approfondissement écrit en dur aurait demandé un travail méthodologique de cadrage par chantier (5-7 questions × N chantiers) sans apporter plus de valeur que le chat actuel, qui s'adapte au contexte du médecin. La discussion structurée par tours (D-036) garantit déjà la qualité du creusement sans rigidité de questionnaire.

**Conséquence sur la roadmap** : l'item V1.1.10 « Construction du questionnaire d'approfondissement Path A » est retiré du TODO. Le câblage CTA Path A pointe directement sur l'ouverture de la modale chat.

---

## D-042 — Questionnaire diagnostic : options fixes, pas de génération dynamique LLM (2026-05-26)

La piste V1.2 de « génération dynamique des options de QCM » (un LLM réécrit les options de Q07-Q11 à la volée selon Q01/Q02 pour qu'un solo se reconnaisse mieux) est **abandonnée**.

**Le questionnaire diagnostic reste à options fixes**, écrites en dur dans les fichiers protocole (`resources/interview_protocol*.json` et `web/lib/v3/protocol_data.ts`). Aucune option n'est produite par LLM.

**Pourquoi** :
- **Uniformité** : la base d'analyse (réponses) doit être strictement comparable entre tous les médecins. Des options générées dynamiquement introduiraient une variabilité dans la base qui rendrait toute analyse longitudinale impossible (cohortes, benchmarks, évolution dans le temps).
- **Qualité** : le LLM peut produire des options légèrement off-topic ou maladroites — sur un questionnaire où chaque option pèse dans le scoring, c'est inacceptable. Les options actuelles ont été ciselées par Sébastien et validées en revue éditoriale.
- **Conformité** : un médecin doit pouvoir relire son questionnaire et ses options sans surprise. Cela renforce la confiance dans le diagnostic.
- **Justifiabilité mathématique** : D-013 impose que le scoring soit défendable. Des options variables casseraient cette défense.

**Le LLM apporte de la valeur AILLEURS** :
- Approfondissement des chantiers (chat — D-036, D-043)
- Modélisation organisationnelle détaillée (schémas Mermaid à venir en Work System)
- Génération de livrables enrichis (registre RGPD, notice patient, courriers — Work System)
- Restitution éditoriale du diagnostic (phrase choc personnalisée — D-038 déjà en place)

**Conséquence** : l'item V1.2 « Génération dynamique des options de QCM » est retiré de la roadmap. Les efforts V1.2 se concentrent sur l'orchestration LLM en aval du diagnostic.

---

## D-041 — Architecture produit en 2 niveaux : Checkup Demo (gratuit) / Work System (payant) (2026-05-26)

Le projet Lugia s'articule désormais en **deux produits distincts** dans le même portefeuille, avec une articulation explicite entre les deux.

### Lugia Checkup Demo — gratuit, acquisition zéro friction

C'est ce qui est en prod sur `diagnostic.lugia.fr` aujourd'hui. Le périmètre est volontairement borné :
- Diagnostic organisationnel sur **3 axes vulgarisés** de la pyramide d'Alter / WSF (Parcours patient = Clients + Produits/Services, Équipe = Participants, Outils = Technologies + Information)
- **1 chantier prioritaire** identifié + 3-4 autres chantiers proposés (gratuits à l'exécution autonome)
- Discussion LLM rapide sur le chantier prioritaire (D-043, limitée à 20 messages, mécanique 4 phases — D-036)
- Schéma Mermaid simplifié du process du chantier (généré au tour 4 du chat, à construire — cf C.A en ROADMAP)
- Plan d'action 4 étapes + PDF export
- Cross-sell : Calendly direct (tarif standard) ET formulaire « Répondre à une offre de conseil » (cf C.D en ROADMAP, court terme)

**Promesse au médecin** : un diagnostic actionnable en 30 minutes, sans s'engager, sans donner ses données patient.

### Lugia Work System — payant, plateforme d'extension

Produit cible, à construire post-validation du Demo. Ne sera pas dans le même routing que `/checkup/v3-charte` mais accessible via `/app` ou domaine séparé.

- Diagnostic étendu aux **9 éléments WSF** (les 6 éléments non couverts par les 3 axes vulgarisés deviennent des chantiers méthodologiques additionnels — cf Reference_Note_WSF.md)
- **Tous les chantiers** débloqués, hiérarchisés, accompagnés
- Discussion LLM **étendue** : multi-chantiers, persistance entre sessions, assistant personnel
- **Schémas Mermaid détaillés** du fonctionnement complet du cabinet (le « schéma vivant » de la doc Lugia Work System)
- **Livrables téléchargeables enrichis** : registre RGPD complet, notice patient AI Act, matrice d'accès, modèles de courriers contextualisés
- **Usage sécurisé SLM** : extension du mode « Navigateur » actuel (D-040, WebLLM) vers un vault de tokenisation côté browser
- **Cross-sell offres conseil Lugia & Co** : tarif réduit pour les abonnés (~15-25% par exemple)

**Plusieurs offres d'abonnement** seront créées (Starter / Pro / Institution probablement, paliers à figer).

### Articulation explicite

Le Checkup Demo n'est pas un « teaser de bas niveau », c'est un produit fini en soi qui aide à un cadrage. Le Work System n'est pas une « version payante du Checkup », c'est une plateforme distincte qui consomme le diagnostic comme point d'entrée.

**Pourquoi cette séparation nette** : éviter le pattern freemium classique (« débloquez X en payant ») qui réduit la valeur perçue du gratuit. Le Demo a une valeur autonome ; le Work System a une valeur supérieure et complémentaire.

**Conséquence sur le repo** : le `lugia-checkup-demo` continue d'héberger les deux produits jusqu'à la livraison du premier chantier P0 du Work System. La décision de spin-off (nouveau repo) sera prise à ce moment, en fonction de l'effort d'intrication observé.

---

---

## D-040 — Toggle Cloud / Local pour l'assistant chat chantiers (2026-05-23)

L'assistant Lugia sur les chantiers (mécanique 4 phases SUGG_JSON / PLAN_JSON / END_CONVERSATION introduite en D-036) tourne désormais au choix du médecin sur Claude Haiku (cloud, API Anthropic) ou sur un SLM local via Ollama (`qwen2.5:3b` par défaut, surchargeable).

**Pourquoi** :
- Souveraineté : pour un médecin libéral qui veut garder ses échanges 100 % locaux, le mode SLM offre une garantie technique nulle dépendance cloud.
- Coût : zéro API call pour le mode local.
- Démonstration : permet à Sébastien de montrer en prospect que le produit n'est pas verrouillé sur un provider unique.
- Expérimentation : préfigure la V1.2 (architecture hybride MODEL_PROVIDER, cf ROADMAP).

**Choix techniques** :
- Modèle local par défaut : `qwen2.5:3b` (3B params, ~2 GB, excellent FR, suit bien les contraintes JSON structurées, rapide sur Mac M-series).
- Default Cloud (Claude Haiku) pour ne pas casser l'expérience des testeurs sans Ollama installé.
- Préférence du médecin persistée en `localStorage` (`lugia-chat-provider`).
- System prompt 4 phases inchangé et partagé entre providers (à valider en test bout en bout que qwen tient bien les markers).

**Limites assumées** :
- Le mode local nécessite Ollama installé + modèle tiré + lib python `ollama`. Si l'un manque, le backend renvoie une 503 lisible et l'UI propose de basculer sur Cloud.
- Pas de persistance du provider en BDD (chaque message stocké sans trace du moteur utilisé). Décision : surajouterait du bruit pour un bénéfice marginal en V1.

---


## D-039 — V3-charte : trois pages éditoriales distinctes (check-up / accompagnement / à propos)

**Date :** 2026-05-22

**Décision :**

Trois pages auxiliaires distinctes en charte V3, chacune adressant un public et un propos différents :

- **`/le-checkup`** — Méthodologie du diagnostic préventif. Eyebrow « Méthode ». Pour un visiteur qui veut comprendre comment fonctionne le questionnaire (3 axes, 18 questions, 4 niveaux, rythme 12-15 min).
- **`/notre-accompagnement`** — Offre médecin-centric. Eyebrow « Une offre sur mesure ». Pour un médecin libéral qui veut comprendre ce que Lugia fait pour son cabinet (mission cabinet médecin / positionnement vs autres acteurs / méthode / engagements).
- **`/lugia`** — À propos de Lugia & Co, ton vision élargie. Eyebrow « À propos ». Pour un visiteur qui veut comprendre l'entreprise Lugia au-delà du médical (mission entreprises toute taille, ruptures organisationnelles, différenciation vs consulting + SaaS, à qui s'adresse Lugia avec 4 profils-cibles, engagement final).

Liens dans **AppHeader** (Tailwind, home) et **IntroHeaderShortcuts** (parcours V3) en monospace caps.

**Pourquoi :** Une page « à propos » unique mêlait trois propos qui parlent à trois moments différents du parcours :
1. Le médecin qui clique « Présentation » depuis le parcours veut comprendre la **méthode du check-up** (avant ou pendant de répondre).
2. Le médecin qui clique « Mon accompagnement » veut comprendre ce que Lugia **livre en pratique** sur son cabinet.
3. Le visiteur professionnel qui clique « À propos » veut comprendre la **vision de l'entreprise** — au-delà du médical.

Distinguer les 3 permet de tenir un ton ciblé sur chaque page sans la noyer dans des objectifs contradictoires.

**Alternatives écartées :**

1. **Une seule page « À propos »** — risque de mélanger les niveaux (technique méthode + commercial médecin + vision entreprise) et de perdre chaque lectorat.
2. **Deux pages (méthode + à propos)** — manque l'angle commercial médecin, le visiteur dirigeant tombe directement sur la vision sans détail métier.

**Conséquences :**

- Les contenus restent maintenables indépendamment — modifier la vision entreprise ne touche pas la méthode du check-up.
- Les 3 liens dans le header rendent la nav un peu plus large ; raccourcis utilisés dans IntroHeaderShortcuts (« À propos » au lieu de « À propos de Lugia & Co ») pour rester compact.
- Le visiteur qui veut comprendre l'offre médecin spécifiquement doit cliquer « Notre accompagnement », pas « Le check-up » ni « À propos ». Le label éclaire cette intention.

---

## D-038 — V3-charte : estimations gain € personnalisées par formule explicite

**Date :** 2026-05-22

**Décision :**

Les estimations « +X k€/an » par chantier sont calculées dynamiquement à partir du profil cabinet, plus en dur. Formule :

```
gainEuros_an = (gainTime_min/jour) × 220 × (70/60) × 0.7 × volumeFactor
```

avec :
- `220` jours travaillés par an
- `70 € TTC/h` taux horaire médian d'un généraliste libéral
- `0.7` proportion du temps libéré effectivement réinvestie en activité productive (le reste sert de marge cognitive)
- `volumeFactor` : `lt_80=0.8`, `80_120=1.0`, `gt_120=1.25` (le cabinet à plus fort volume captera plus de gain en valeur absolue)

Les unités hétérogènes du catalogue (`min/j`, `h/j`, `min/sem`, `h/sem`, `min/consult`) sont normalisées en minutes/jour équivalent via `parseGainTimeToMinutesPerDay`.

**Pourquoi :** Les anciennes valeurs gainEuros codées en dur (« +10 k€/an », « +22 k€/an ») étaient optimistes (souvent ×3 supérieures aux valeurs calculées avec la formule), et le footnote « *Estimations calculées sur la base de votre profil cabinet* » était techniquement faux puisque le profil n'entrait pas dans le calcul. Faille de crédibilité.

La formule explicite avec hypothèses chiffrées (70 €/h, 70 % réinvesti, 220 j/an) est à la fois défendable en cohérence interne, et auditable par un médecin testeur qui voudrait vérifier.

**Conséquences :**

- Les gains affichés sont nettement plus bas (3-10 k€/an au lieu de 10-22 k€/an pour les chantiers majeurs). Plus crédibles mais moins « vendeurs ».
- Compensé par le comparatif Auto vs Lugia (D-036) qui montre l'écart entre les deux scénarios — le « avec Lugia » reste attractif relativement à l'autonomie.
- Le footnote du chantier est honnête : « *Estimation à partir de votre volume hebdomadaire — taux horaire 70 € TTC, 220 jours/an, 70 % du temps libéré réinvesti.* »

**Alternative écartée :** Garder les valeurs catalog optimistes avec un wording moins explicite. Risque de réputation si un médecin testeur fait la vérification arithmétique.

---

## D-037 — V3-charte : comparatif Autonomie vs Avec Lugia sur chaque chantier

**Date :** 2026-05-22

**Décision :**

Sur chaque page chantier, remplacer le bloc EFFORT / DÉLAI / GAIN unique par un **comparatif à deux colonnes** :

| | EN AUTONOMIE | AVEC LUGIA |
|---|---|---|
| **Gain attendu** | ~auto_taux × gain_théorique | ~lugia_taux × gain_théorique (gras) |
| **Délai** | catalog × 1.5 | catalog |
| **Votre temps** | EFFORT_HOURS.AUTO[effort] (~6/15/30 h) | EFFORT_HOURS.LUGIA[effort] (~2/4/7 h) |
| **Taux d'aboutissement** | « 1 cabinet sur N » | « X cabinets sur Y » |

Probabilités par chantier (issues de la littérature change management organisationnel) :
- comm : auto 30 % / lugia 80 %
- delegation : auto 15 % / lugia 85 %
- chroniques : auto 18 % / lugia 80 %
- logiciel : auto 20 % / lugia 80 %
- urgences : auto 20 % / lugia 75 %
- admin : auto 20 % / lugia 75 %
- pilotage : auto 35 % / lugia 75 %

Footnote : « *Gain attendu = gain théorique × probabilité d'aboutir. Probabilités issues de la littérature change management organisationnel. Hypothèses : 70 € TTC/h, 220 jours/an, 70 % du temps libéré réinvesti.* »

**Pourquoi :** L'ancien affichage EFFORT / DÉLAI / GAIN d'un seul scénario laissait l'utilisateur démarrer une logique « OK je peux faire seul, pas besoin de Lugia ». Le mini-encart « Avec Lugia » en bas (D-035) n'était pas assez fort pour faire le lien entre **présence de Lugia** et **atteinte effective du gain**.

La littérature change management montre qu'un changement organisationnel mené en autonomie a un taux d'aboutissement de 20-30 %, contre 60-90 % accompagné. C'est cette réalité statistique qui rend le comparatif honnête et utile :

- Un médecin lit « 1 cabinet sur 7 mène la délégation au bout en autonomie, contre 6 sur 7 avec Lugia » et peut faire son arbitrage en connaissance de cause.
- Le gain attendu (probabilité × théorique) montre que l'autonomie « rapporte » moins en espérance même si le gain théorique est le même — argument logique sans surpromesse.

**Conséquences :**

- Lugia se positionne comme **partenaire d'aboutissement**, pas comme prestataire de services. La proposition de valeur devient « on transforme une intention en réalité », pas « on fait à votre place ».
- Le médecin garde l'option autonomie complète — les 4 étapes du plan d'action sont toujours actionnables seul.
- Le pivot demande une honnêteté sur les taux d'aboutissement publiés : si les chiffres ne sont pas étayés par notre propre cohorte, on s'appuie sur la littérature (à sourcer dans la doc commerciale).

**Alternatives écartées :**

1. **Statu quo (autonomie pure)** — cohérent avec le positionnement « système, pas individu » mais commercialement faible (rien ne pousse vers Lugia).
2. **Position partenariat explicite** — sans comparatif chiffré, paraît auto-promo non démontrable.

---

## D-036 — V3-charte : mécanique chat assistant 4 phases structurées

**Date :** 2026-05-22

**Décision :**

L'assistant Lugia (chat sur chantier offert, A.2) suit un **system prompt structuré en 5 tours** :

1. **Tour 1 — Ouverture** : Claude pose une question ouverte sur le quotidien du médecin face au chantier + 3 suggestions courtes de réponse rapide.
2. **Tours 2-3 — Creusement** : reformulation en une phrase + question de creusement (cause racine / contrainte / ressource) + 3 suggestions.
3. **Tour 4 — Plan d'action** : récap en une phrase + plan d'action 3-4 étapes structuré (PLAN_JSON) + question finale « Par quoi commenceriez-vous concrètement cette semaine ? » + 3 suggestions correspondant aux étapes.
4. **Tour 5 — Clôture** : message d'encouragement personnalisé + balise `END_CONVERSATION:true`. Pas de suggestions.

Format de retour structuré (Claude écrit ces blocs dans sa réponse) :
- `SUGG_JSON:{"items":["...","...","..."]}` aux tours 1-4
- `PLAN_JSON:{"steps":[{"num":"01","title":"...","body":"...","tag":"quick|medium|invest"}]}` au tour 4
- `END_CONVERSATION:true` au tour 5

Parsé côté backend (`parse_assistant_reply`) puis envoyé au frontend comme dict typé. Le frontend rend les suggestions comme boutons cliquables, le plan comme carte structurée, et bascule en mode « Conversation clôturée » sur END.

**Modèle :** Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), max_tokens 1000.

**Limites produit :**
- 1 conversation par (interview × module × email).
- 20 messages user max par conversation (HTTP 429 si dépassé).
- Message ≤ 2000 caractères.

Init auto : à la 1ère ouverture du modal, le frontend envoie automatiquement « Je veux creuser le chantier : X » comme premier message user, ce qui déclenche le tour 1 de Claude.

**Pourquoi :** Sans structure, un chat libre avec Claude produit :
- Des réponses trop longues / verbeuses (médecin qui décroche)
- Pas de progression vers un plan d'action concret (le médecin finit la conversation sans rien d'actionnable)
- Pas de point de sortie clair (la conversation peut tourner indéfiniment)

La structure 4 phases force :
- Une progression dirigée (ouverture → creusement → plan → clôture)
- Un livrable concret (le plan d'action en tour 4)
- Une clôture explicite (END_CONVERSATION en tour 5)
- Une UX cliquable (les suggestions évitent au médecin de taper, mais le texte libre reste possible)

Les suggestions sont essentielles : elles transforment la conversation d'un Q/R passif vers un dialogue conduit où le médecin clique 80 % du temps. Très utile pour démarrer (« je ne sais pas quoi demander »).

**Alternatives écartées :**

1. **Chat libre sans structure** — risque de produire un assistant générique, sans valeur ajoutée par rapport à ChatGPT.
2. **Conversation à tour fixe stricte (« quizz »)** — perd la richesse du langage naturel et la possibilité de questions hors script.
3. **Streaming sans suggestions** — UX moins guidée. Les suggestions sont la valeur ajoutée principale par rapport à un chat brut.

**Conséquences :**

- Le system prompt est rigide (Claude doit produire les bonnes balises JSON). Tests : si Claude oublie SUGG_JSON, le frontend dégrade gracieusement (pas de suggestions affichées mais le texte reste lisible).
- Le format de persistance (table `chat_message`, content text avec suffixe `__LUGIA_META__`) permet de re-parser les métadonnées (suggestions / plan / ended) à chaque chargement de l'historique, sans dépendre de Claude.
- Le tour 5 cloture la conversation — pour aller plus loin, le médecin doit prendre RDV via Calendly (footer « Conversation clôturée »). C'est la limite par chantier offert.

---

## D-035 — V3-charte : mini-encart « Avec Lugia » par chantier (autonomie + visibilité de la valeur ajoutée)

**Date :** 2026-05-22

**Décision :**

Chaque page de détail de chantier (`/checkup/v3-charte` → ModuleV3) affiche désormais, en bas de la feuille de route en 4 étapes, un mini-encart « AVEC LUGIA » qui décrit en 2-3 lignes ce que Lugia peut sécuriser ou accélérer sur **ce chantier précis**.

7 textes spécifiques ont été rédigés (un par chantier : urgences, chroniques, délégation, communication, logiciel, admin, pilotage). Le ton reste explicitement respectueux de l'autonomie : « Lugia **peut** vous aider à… » jamais « vous devez ». Le filet argent à gauche (vs le filet ambre du benchmark « Données terrain » juste au-dessous) signale visuellement qu'il s'agit d'une option, pas d'un avertissement.

Le champ `avecLugia?: string` est ajouté au type `V3Module` (`lib/v3/modules_data.ts`), optionnel pour préserver la souplesse — on peut désactiver l'encart par chantier sans casser le contrat de type.

**Pourquoi :** Tension entre deux exigences du positionnement.

D'un côté, le projet pose explicitement que **le produit analyse le système de travail, pas les individus** (cf instructions générales du dossier `lugia-checkup-demo`) et que l'autonomie est le mode par défaut — d'où l'absence initiale de mention Lugia dans la roadmap des chantiers et le simple CTA générique « En parler avec Lugia → » en bas de page.

De l'autre, ce silence faisait rater une opportunité éditoriale : le médecin qui parcourt la feuille de route ne comprend pas concrètement **ce que Lugia apporterait en plus** s'il choisit cette option. Le CTA générique en pied de page n'a pas de contexte spécifique au chantier, donc valeur ajoutée invisible.

Le mini-encart résout la tension : autonomie 100 % préservée (4 étapes que le médecin peut suivre seul, sans Lugia), mais on lie la valeur ajoutée Lugia au chantier en question. Le ton « peut » + le filet argent + la position **après** la feuille de route (et non au milieu) signale clairement que Lugia est une accélérateur facultatif, pas une condition.

**Alternatives écartées :**

1. **Statu quo (autonomie pure, CTA générique seul)** — préserve le mieux le positionnement « système, pas individu » mais ne montre pas la valeur ajoutée Lugia spécifiquement. Risque : le médecin perçoit Lugia comme un coach générique, pas comme un partenaire opérationnel.

2. **Mention par étape (icône argent sur les étapes où Lugia peut aider)** — plus granulaire mais alourdit visuellement la feuille de route et brouille la ligne entre « ce que vous faites » et « ce que Lugia fait ». Risque de paraître intrusif.

3. **Section CTA forte en bas (« Faire ça avec Lugia » bouton primary)** — trop commercial pour le ton du produit, transformerait la feuille de route en pitch commercial.

L'option retenue (encart discret en fin de roadmap, ton « peut », filet argent neutre) est l'équilibre qui maximise l'information utile sans dénaturer le positionnement autonomie.

**Conséquences :**

- Les 7 textes `avecLugia` doivent rester **spécifiques** au chantier (pas génériques) — sinon ils perdent leur valeur informative. Lors d'évolutions des modules, vérifier la cohérence du texte `avecLugia` avec les 4 étapes.
- Le pattern reste optionnel par chantier (`avecLugia?:`) — si un chantier futur n'a pas de valeur ajoutée Lugia spécifique, on peut omettre le champ et l'encart ne s'affichera pas.
- Si on déploie commercialement et que les retours montrent que le CTA générique en pied de page suffit, on pourra retirer l'encart sans casser d'autre logique (champ optionnel).

---

## D-034 — V3-charte : conservation des box-shadows hover (écart documenté à la règle I2)

**Date :** 2026-05-21

**Décision :**

La charte d'application questionnaire v1.0 (règle I2) interdit toute box-shadow : « Aucun. Bordure 1 px + change de fond suffit. »

Néanmoins, V3-charte conserve des hover box-shadows discrètes (15 occurrences) sur les éléments cliquables :
- Cartes chantier (`ListChantiersV3`, section « Par où commencer » de `ResultatsV3`, `OppCard`) : `0 2px 12px -4px rgba(0,0,0,0.12)` au hover
- Cartes d'axe (`AxisCard`) : `0 4px 16px -6px rgba(0,0,0,0.15)` au hover
- Cartes module / next-step (`ModuleV3`) : `0 0 0 1px argent, 0 8px 24px -8px argent` au hover (lift argent signature)
- 1 indicateur permanent : `boxShadow 0 0 6px argent` sur dot 8 px du légendaire radar

**Pourquoi :** Deux raisons.

D'abord, **le feedback d'affordance interactif**. Sur les cartes chantier qui sont des CTA cliquables vers le module détail, l'ombre hover indique de manière forte « cet élément est cliquable et va vous emmener ailleurs ». Le simple changement de bordure (en navy400) + `translateY(-1px)` reste perceptible mais moins explicite — risque que les médecins testeurs ne réalisent pas que les cartes sont cliquables.

Ensuite, **la sobriété de l'application est déjà très forte** : pas de couleur d'axe, pas de pill, pas de gradient sur boutons, alternance Nuit/Jour franche, etc. Une ombre hover discrète (≤16 px de spread, ≤0.15 d'opacité) ne casse pas la discipline brand — c'est de la matière interactive, pas de la décoration.

**Alternatives écartées :**

- *Option a (strict charte)* : retirer toutes les box-shadows. Risque de perte d'affordance sur les cartes cliquables ; le feedback hover devient subtile au point que certains utilisateurs pourraient ne pas comprendre l'interactivité.
- *Option b (mixte)* : retirer seulement les ombres fortes, garder les discrètes. Ambigu à appliquer (où mettre la limite ?) ; complique la maintenance.

À surveiller : si le pilote terrain (T7) révèle que les utilisateurs trouvent les ombres « trop produit / pas brand Lugia », on revisite cette décision en option a.

---

## D-033 — Cohabitation v3-snapshot / v3-charte : gel avant refonte selon la charte questionnaire v1.0

**Date :** 2026-05-21

**Décision :**

Avant d'attaquer la refonte du parcours V3-brand selon la charte d'application questionnaire v1.0 (45 règles regroupées en 10 axes A-J), on gèle l'état actuel pour permettre une comparaison côte à côte pendant la refonte.

**Routes Next.js après gel :**
- `/checkup/v3-charte` — route active, où la charte sera appliquée règle par règle.
- `/checkup/v3-snapshot` — route gelée (lecture seule, ne reçoit plus de modifications) qui préserve l'état V3-brand pré-charte.
- `/checkup/v3-brand` — alias rétro-compatible, redirige vers `/checkup/v3-charte` en préservant la query string (signets et URL partagées avant la bascule restent fonctionnels).

**Périmètre du gel :**
- `components/v3-snapshot/` (11 fichiers) et `lib/v3-snapshot/` (9 fichiers) — copies figées avec imports internes réécrits.
- `app/checkup/v3-snapshot/` — copie de la route.
- Aucun import croisé entre `v3/` et `v3-snapshot/` (vérifié par grep).

**Backend inchangé :** `protocol_version="v3-brand-0"` reste l'identifiant en BDD pour les deux routes. Pas de duplication backend.

**Pourquoi :** Trois raisons.

D'abord, **la charte va significativement transformer le rendu** : palette resserrée, italique banni partout, échelle typo compressée à ~5 tailles, border-radius à 0, suppression des emoji, refonte de l'encodage des blocs. Sans gel, impossible de comparer une décision charte vs son équivalent pré-charte pendant la refonte.

Ensuite, **le pattern est déjà éprouvé dans le projet**. V1.1.9, V2.0 et V3-brand cohabitent déjà sur trois routes distinctes. Ajouter `v3-snapshot` à côté de `v3-charte` ne fait que prolonger ce schéma — pas d'invention d'architecture.

Enfin, **garantie de retour arrière**. Si la refonte charte introduit une régression UX qu'on découvre tard (par exemple un titre Lora < 22 px qui devient illisible une fois compressé en 14 px Onest), la version pré-charte reste accessible et fonctionnelle pour comparaison ou rollback ciblé.

**Alternatives écartées :**

- *Snapshot HTML autonome (style wireframe V2.0-snapshot)* : pure référence visuelle figée, pas interactif. Comparaison limitée car pas de scoring réel ni de bout-en-bout. Bien pour la conservation long terme, pas pour la phase de refonte active.
- *Branche git pure (`feat/v3-charte`)* : un seul environnement déployable à la fois. Pour le pilote terrain prévu (V2.0-T7), incapable de montrer les deux versions en parallèle à un médecin testeur.
- *Garder `/checkup/v3-brand` comme route active et ajouter seulement `/checkup/v3-snapshot` en frozen* : variante valable. Renommer en `/checkup/v3-charte` rend la lineage plus lisible (v3-brand devient un alias historique, la nouvelle identité éditoriale s'appelle « charte »).

---

## D-032 — V3-brand : exception « Lora < 22 px » pour le contenu éditorial du parcours

**Date :** 2026-05-20

**Décision :** Le brand-master Lugia pose la règle « Lora regular jamais < 22 px ». Cette règle est respectée par défaut sur V3-brand pour les titres, les hero, les leads et tout texte de marque. Une **exception explicite** est inscrite pour le contenu éditorial du parcours diagnostic :

- **Texte des questions scorées** (`q-text`) — Lora 16 px, conformément au modèle cible.
- **Options de la question d'énergie** (`energy-card`) — Lora 17 px, phrases-réponses entières.
- **Niveau qualitatif dans les score cards de transition** (`tsc-level`) — Lora 17 px.
- **Label du bloc suivant sur transition** (`trans-next-label`) — Lora 17 px.

Pour tous ces usages, Lora reste **regular** (pas d'italique, pas de caps), seule la taille déroge à la règle ≥ 22 px.

**Pourquoi :**

La règle brand « Lora ≥ 22 px » vise à préserver le caractère typographique de Lora (légèrement contrasté, élégant) qui se dilue dans les petites tailles. Mais le parcours diagnostic V3 a une posture éditoriale spécifique inscrite dans la charte questionnaire : « voix d'un confrère expérimenté qui pose les bonnes questions ». Cette posture appelle un serif même à 16 px — basculer en Onest sur les questions transformerait la voix en celle d'un formulaire administratif, ce qui contredirait la posture revendiquée.

Trois arguments cumulés :
1. **Cohérence éditoriale.** Les questions sont la voix du confrère. Lora porte cette voix mieux qu'Onest, à n'importe quelle taille.
2. **Cohérence avec le modèle cible.** Le HTML cible utilise déjà Lora 16 px sur `q-text` — l'aligner sur ce point évite un écart visible avec la référence design validée.
3. **Périmètre limité.** L'exception ne couvre que 4 usages précis du parcours diagnostic, tous documentés ici. Le reste de V3 et de la marque restent sous la règle ≥ 22 px.

**Alternatives écartées :**

- *Respecter strictement la règle (bascule en Onest 16-17 px)* : perdrait le caractère éditorial du parcours, glisserait vers un ton plus technique / SaaS.
- *Augmenter les tailles à 22 px minimum* : impact visuel important (questions à 22 px = volumineuses, scoreboard à 22 px = écrasant), rupture forte avec le modèle cible.
- *Étendre l'exception à toute la marque* : dilue la règle brand-master et ouvre la porte à des dérives. La règle reste, l'exception est bornée.

---

## D-031 — V3-brand : arbitrages de cadrage pour la 3ème carte beta

**Date :** 2026-05-20

**Décision :** Une troisième carte « beta » est ouverte sur la page d'accueil pour héberger un parcours V3 entièrement aligné sur le brand kit Lugia (specs `lugia-survey-specs.md`, modèle `lugia-survey-model.html`, brand-master/brand-kit/charte questionnaire). Avant tout code, les 9 arbitrages suivants sont figés :

1. **Familles typographiques.** Deux familles éditoriales (Onest sans + Lora serif) et un rôle utilitaire distinct (IBM Plex Mono pour eyebrows, codes, méta). Le titre du brand-kit « Deux familles. Pas une de plus. » est conservé tel quel, le mono est traité comme outil de mise en page, pas comme famille.

2. **Proportions de surface : différenciées mode jour / mode nuit.** Le ratio 65/25/5 (brand-master) reste la cible pour les surfaces *mode jour* (corporate, synthèse, plan d'action). Le ratio sera adapté pour le mode nuit du parcours questionnaire — proposition à valider quand on codera la première carte : navy ~75 % / ivoire ~20 % / argent ~5 %. Les deux ratios coexistent légitimement parce qu'ils décrivent des contextes d'usage distincts.

3. **Ambre = couleur fonctionnelle officielle (token `--signal-warn`).** Promue au statut de token officiel à côté de navy / ivoire / argent, mais **classée séparément** comme couleur fonctionnelle (sémantique, pas décorative). Trois règles intangibles : (a) un seul ambre par écran maximum ; (b) trois usages canoniques autorisés — benchmark critique avec dépassement de seuil, signal croisé d'alerte, modules à fort enjeu ; (c) jamais en aplat de marque (toujours bordure fine + surface très diluée — paramètres charte questionnaire : bordure 32 %, surface 10 %). Tout autre usage doit faire l'objet d'une décision. Valeur hex précise à fixer en T-V3-1 (proposition de départ : `#b5780a` ou `#c8851a` à tester en lisibilité jour + nuit).

4. **Niveaux qualitatifs : on garde la nomenclature V2.0.** « Fragile / En transition / Solide / Mature » est préservé. Le renommage du modèle cible (« En construction / En transition / Stabilisé / Optimisé ») est écarté pour deux raisons : (a) cohérence avec V2.0 en prod, les exports PDF et les transitions de bloc ; (b) « Mature » est plus aligné « hauteur de confrère » du brand-master que « Optimisé » qui glisse vers le vocabulaire process.

5. **Scoring final : pourcentage 0-100 conservé en backend, conversion en 4 niveaux (0-3) au rendu V3.** Le scoring V2.0 (% par axe) reste la donnée canonique stockée. Au rendu V3, on convertit via une fonction de seuils (équivalent du `lvl(s) = s<35?0:s<55?1:s<78?2:3` du modèle cible) pour piloter l'apparition des signaux, des modules et l'affichage radar. Le V2.0 actuel n'est pas modifié.

6. **Topbar progression : barre continue 28 micro-étapes (9 profil + 1 énergie + 18 questions).** Adoptée pour V3, mais avec étiquette de chapitre conservée au-dessus pour garder le repère structurel.

7. **Analyse croisée toujours affichée.** Affichage systématique avec fallback éditorial. Pas d'apparition conditionnelle qui donnerait l'impression d'un produit fragile.

8. **Angles radar : -90° / 30° / 150°.** Adoption du modèle cible — axe A pointant vers le haut, rotation horaire — plus naturel à lire. Remplace le 0° / 120° / 240° de V2.0.

9. **Route et cohabitation.** Route séparée `/checkup/v3-brand` accessible uniquement depuis la 3ème carte beta. `protocol_version = "v3-brand-0"`. Scoring partagé avec V2.0 (mêmes axes A/B/C, mêmes 18 questions au départ), layout/copy/state machine indépendants. V2.0 reste stable pour les pilotes ; dépréciation planifiée *après* validation V3.

**Pourquoi :**

L'arbitrage repose sur trois principes. **Cohérence éditoriale d'abord** : le brand-master (« hauteur d'équipe », vocabulaire à privilégier / à éviter, posture « confrère expérimenté » de la charte questionnaire) fixe le ton ; les choix typographiques et de couleur découlent de cette posture, pas l'inverse. **Conservation de l'acquis V2.0** : niveaux qualitatifs et scoring backend sont stables et compris des testeurs ; les changer aurait un coût en cohérence cross-version sans gain produit. **Hiérarchie des couleurs** : navy + ivoire + argent forment la palette de marque ; ambre est un token fonctionnel séparé. Ne pas confondre les deux niveaux évite la dérive observée dans la plupart des design systems où les couleurs sémantiques finissent décoratives.

**Alternatives écartées :**

- *Renommer les niveaux selon le modèle cible* (« En construction / Optimisé ») : rompt l'acquis V2.0, glisse vers un vocabulaire process moins aligné avec la posture « hauteur de confrère ».
- *Promouvoir ambre comme 3ème couleur de marque au même rang que navy/ivoire/argent* : risque de dérive décorative (cf. fréquent dans les design systems), perte de pouvoir sémantique. Le statut « token fonctionnel séparé » protège son signal.
- *Réécrire V2.0 plutôt qu'ouvrir une route V3 dédiée* : risque de régression sur le parcours servi aux pilotes actuels. La cohabitation est moins risquée et permet une dépréciation maîtrisée.
- *Topbar par chapitres (comme V2.0) sans micro-étapes* : moins engageant, moins de signal de progression à chaque clic — point d'UX où le modèle cible est démontrablement meilleur.

---

## D-030 — Inversion de la séquence V2.0 : intégration technique avant pilote rédactionnel

**Date :** 2026-05-19

**Contexte :** D-029 acte la refonte V2.0 et inscrit en `TODO.md` une séquence **pilote rédactionnel → intégration technique → sourcing benchmarks**. Le pilote rédactionnel suppose un retour des médecins testeurs sur le seul brouillon texte (`resources/v2_editorial_draft.md`) accompagné de `resources/v2_editorial_review_guide.md`.

**Décision :** Inversion de la séquence. On démarre l'intégration technique V2.0 immédiatement, on déploie en prod en cohabitation V1.1.9 / V2.0, et le pilote se fait sur le parcours réel — pas sur le texte seul. Les médecins testeurs vivront le parcours V2.0 plutôt que de relire un markdown. Le guide de relecture textuelle (`resources/v2_editorial_review_guide.md`) reste envoyé en parallèle pour ne pas perdre la boucle critique sur le wording — il sera consolidé avant publication finale.

**Pourquoi cette inversion**

*Effet vécu vs effet lu.* Le check-up Lugia est un parcours sensible, pas un document. Le ressenti d'une transition inter-blocs avec radar dynamique, le rythme imposé par les blocs successifs, l'effet d'ancrage de l'écran énergie — rien de tout cela ne se valide à la lecture d'un texte. Inverser permet aux testeurs de juger ce qui compte vraiment.

*Le brouillon est figé, le code est itérable.* Les retours sur le wording resteront utilisables même si le code est déjà écrit — il suffit de mettre à jour les fichiers JSON. Le coût marginal d'une rééd JSON est très faible comparé au gain de tester un parcours vivant.

*La cohabitation V1.1.9 / V2.0 est déjà prévue par D-029.* Le champ `protocol_version` et la page d'accueil à 2 cartes étaient inscrits dès D-029 pour permettre la comparaison terrain. Cette décision ne change que le moment où la mise en prod intervient — pas l'architecture.

**Conséquences pour l'exécution**

*Phasage en 7 sous-vagues techniques :*
- **V2.0-T1** — Préparation des données (`interview_protocol_v2.json`, `diagnostics_v2.json`, `modules_v2.json`)
- **V2.0-T2** — Scoring et personnalisation backend (`src/v2/scoring.py`, `src/v2/personalize.py`)
- **V2.0-T3** — Migration BDD cohabitation (`protocol_version` sur `interview`)
- **V2.0-T4** — Frontend Next.js V2 (intro V2 + profil 2 étapes + énergie + blocs + transition + résultats)
- **V2.0-T5** — Page accueil 2 cartes pour basculer V1.1.9 / V2.0
- **V2.0-T6** — Mise en prod + smoke test cohabitation
- **V2.0-T7** — Pilote terrain : envoi de l'URL + guide adapté aux 3-5 médecins

*Le guide `v2_editorial_review_guide.md` reste envoyé* en parallèle de l'intégration technique. Les retours rédactionnels viennent alimenter une révision JSON avant publication. Le guide sera complété par un mode d'emploi du parcours en prod pour le pilote.

*Le brand kit Lugia reste en passe finale*, après V2.0-T6 et avant le tag V2.0.

**Alternatives écartées**

*Maintenir la séquence pilote rédactionnel → code (D-029).* Plus prudent rédactionnellement mais retarde de 2 à 3 semaines la mise à disposition d'un produit vivant pour les médecins. Le ressenti du parcours est ce qui valide ou invalide la refonte — il pèse plus que le wording.

*Déployer le `checkup_v2_wireframe.html` en statique sur un sous-domaine.* Permet aux médecins de voir l'UI sans coder le backend, mais ne donne pas un vrai parcours scoré (mocké, switcher manuel). Insuffisant pour un retour terrain crédible.

**Articulation avec D-029**

D-029 reste valide sur tout son contenu structurel (rupture avec D-021, suspension de D-020, mode A pur, 13 règles déterministes, cohabitation BDD). D-030 ne modifie que l'**ordre d'exécution** des étapes finales.

---

## D-029 — Refonte V2.0 du check-up + cohabitation BDD V1.1.9 / V2.0

**Date :** 2026-05-19

**Décision :** Refonte structurelle du check-up en V2.0, qui rompt avec D-021 (alternance des modes B/C) et suspend D-020 (SLM hybride en V1.2). V2.0 intègre les leviers V3/V4/V6 analysés en série dans une conversation dédiée — reformulations terrain inline, benchmarks chiffrés, calibrage profil préliminaire en chips, ordre par blocs stricts (3 axes successifs), Mode A pur sur tout le parcours scoré, pages intermédiaires inter-blocs avec score-reveal animé, radar SVG dynamique permanent, modules d'approfondissement statiques. V1.1.9 reste accessible en cohabitation via un champ `protocol_version` sur `interview`. Page d'accueil à 2 cartes pour permettre la comparaison terrain.

Specs complètes dans `wireframes/checkup_v2_specs.md` v1.1 (15 sections, 654 lignes, post-revue 8 amendements).

**Pourquoi :**

*Trois pistes V3/V4/V6 analysées.* La V3 propose un parcours HTML autonome avec reformulations inline, benchmarks chiffrés et 7 modules d'approfondissement statiques. La V4 ajoute un radar permanent dynamique pendant le questionnaire. La V6 (architecture React) ajoute une conversation IA chantier en Claude Sonnet 4 — délibérément exclue du périmètre V2.0 (différée V2.1+). La sélection des apports a été itérative sur 13 échanges, avec arbitrage question par question et 8 amendements de revue finale.

*Rupture avec D-021 — alternance des modes B/C.* V1.1 (D-021) avait préservé une alternance A/B/C avec l'argument que la variation des modes maintenait l'engagement par variété cognitive. V2.0 inverse l'argument : sur un parcours de 25 min, la **cohérence de focus mental par axe** est plus précieuse que la variation des modes. Le médecin traite un sujet (parcours patient), le finit, passe au suivant. Trois blocs stricts × 6 questions Mode A pur. Disparition des modes B (Q05, Q13 V1.1.9) et C (Q14 V1.1.9). Perte de la richesse verbatim — assumée vu le bénéfice de focus mental, l'IA conversationnelle V2.1 captera le verbatim quand elle arrivera.

*Suspension de D-020 — SLM hybride en V1.2 différé sine die.* D-020 prévoyait l'introduction d'un SLM pour personnaliser le rapport (cascade phrase choc dynamique, génération options QCM contextuelle, etc.). Sébastien a tranché : on maximise le méthodologique avant tout. V2.0 = ~13 règles déterministes nommées (motivation, status, énergie, profil × scores, territoire, remplaçant) qui personnalisent à 90% sans inférence. Le SLM viendra en V2.1+ sous une forme différente : **conversation IA de creusement de chantier** (pas IA de génération de diagnostic). Distinction stratégique qui sera tracée dans D-030 à son ouverture.

*Cohabitation V1.1.9 / V2.0 pour tests terrain.* Plutôt que de remplacer V1.1.9 par V2.0, on les fait cohabiter via `interview.protocol_version`. Les médecins testeurs peuvent faire les 2 et comparer. V1.1.9 reste figée — plus de modifications sauf bug critique. Les deux versions partagent le même profil utilisateur (`user_profile` étendu). Cette stratégie permet de valider en terrain réel si la rupture V1.1.9 → V2.0 est productive avant de retirer V1.1.9.

*Brand kit Lugia appliqué en passe finale.* La refonte fonctionnelle V2.0 conserve la palette/typo V1.1.9 actuelle (crème + serif Iowan/Georgia + sans système). Le brand kit Lugia, en cours de préparation côté track Communication, sera intégré avant le tag V2.0. Découplage volontaire entre cycles fonctionnel et identitaire.

**Conséquences pour V2.0 :**

*Backend.* Migration BDD légère et idempotente : `interview.protocol_version` (default `v1.1.9`), `interview.global_score`, extension `user_profile` avec 10 champs profil V2 (cabinet_type, volume, paramedical_team, logiciel_metier, rdv_canal, status, territoire, horizon, motivation, et logiciel_metier_other), `answer.scored` (flag pour l'ancrage énergie non scoré). Nouveau package `src/v2/` avec 7 modules dédiés (questions, scoring, signals, opportunities, modules, personalize, templates). Dispatcher dans `backend/main.py` route selon `interview.protocol_version`. Nouveau protocole `resources/interview_protocol_v2.json`, nouveau corpus `resources/modules_v2.json` (7 modules d'approfondissement statiques) et `resources/diagnostics_v2.json` (12 titres de diagnostic par couple axe × niveau). Mécanisme `entity_name` V1.1.5-i préservé sur 4 options du bloc B.

*Frontend.* 4 pages nouvelles (`/profil`, `/checkup-v2`, `/resultats-v2`, `/modules/[id]`), 1 page modifiée (`/` à 2 cartes). 9 composants nouveaux (ProfilStep1, ProfilStep2, CheckupV2Block, OptionCardV2, BlockTransition, RadarLive, RadarResult, FacetCardV2, ChantierCardV2, ModuleV2). Tous les composants V1.1.9 restent en place pour servir le parcours V1.1.9 actuel.

*Scoring.* Échelle `s` 1-4 par option (au lieu de health_score 0-10 V1.1.9), score % par bloc, mapping vers les niveaux qualitatifs Lugia (Maîtrisé / Opérationnel / À surveiller / À risque) avec seuils 35/55/78. Les seuils V3 sont adoptés tels quels, la sémantique Lugia est conservée. Plancher mathématique à 25%. Score global agrégé stocké en base, **non affiché** au médecin. Pour le routing solo, N_visible (questions effectivement servies) sert au calcul, pas l'ensemble des IDs déclarés.

*Signaux croisés.* 6 patterns au lieu des 4 de V3 (post-revue) : `S-burnout` inhibé si C ≥ 55 pour éviter les faux positifs sur profils contrastés, `S-tech-vs-organisation` nouveau pour le cas A bas + B bas + C maîtrisé, `S-paradox` avec seuil assoupli (A ≥ 55 vs 78), `S-structured` positif pour les profils forts sur les 3 axes.

*Personnalisation déterministe.* 13 règles nommées dans `src/v2/personalize.py` (post-revue avec ajout de `R-replacement` pour les médecins remplaçants). Toutes formulées **en levier d'action, jamais en culpabilité** — posture éditoriale documentée dans la spec. Les benchmarks chiffrés sont reformulés en positif (ex. *« un cabinet bien organisé se valorise 30-40% mieux à la transmission »* au lieu de la version anxiogène).

*Volumétrie du parcours.* Profil 9 chips (5 + 4 en 2 étapes) + ancrage énergie (1 question non scorée) + 3 blocs × 6 questions scorées = **18 questions scorées + 1 ancrage + 9 chips profil**. Durée cible ~25 min.

**Conséquences pour la trajectoire :**

*V1.1.10 obsolète.* La V1.1.10 prévue dans la roadmap (câblage des CTAs Prochaine étape + construction du questionnaire d'approfondissement Path A) est absorbée par V2.0. Les 7 modules d'approfondissement V3 réécrits en ton Lugia constituent le Path A. Les CTAs branchent directement sur les modules.

*V2.1 IA conversationnelle.* Une fois V2.0 validée en pilote (3-5 médecins testeurs), ouverture du chantier IA. Architecture prévue : endpoint backend `POST /chat/chantier/{interview_id}/{chantier_id}` qui proxie Claude (Anthropic Haiku ou Sonnet à arbitrer en V2.1), system prompt structuré 4 phases avec balises JSON intégrées, streaming SSE, persistance optionnelle des transcripts. À tracer dans D-030.

*V2.2 et au-delà.* Historique des diagnostics, radar comparatif T0/T+3/T+6, plan d'action persistant cochable, export PDF, benchmarks positionnels chiffrés (si volumétrie de cohorte suffisante), mode équipe, 4e axe territorial.

**Alternatives écartées :**

- *Reprendre V6 en l'état (architecture React + conversation IA directe `api.anthropic.com`).* Architecture non portable en prod chez Lugia (clé API exposée côté client). Et conversation IA hors scope V2.0 (priorité au méthodologique enrichi déterministe).
- *Refondre la V1.1.9 en place sans cohabitation BDD.* Aurait écrasé V1.1.9 et empêché les médecins testeurs de comparer les deux versions. La cohabitation a un coût de maintenance (deux ensembles de modules métier) mais le bénéfice de test terrain est élevé.
- *Garder V1.1.9 5-questions + alternance A/B/C en V2.0.* La rupture méthodologique n'est pas un appauvrissement — c'est un changement de modèle (focus mental par axe au lieu de variation des modes), qui s'aligne mieux avec un parcours de 25 min cadré.
- *Garder Q14 clôture Mode C + Q05 Mode B + Q13 Mode B.* La perte de verbatim libre est compensée par : (a) la conversation IA V2.1 captera le verbatim quand le médecin creuse un chantier ; (b) les nouvelles questions V2 ont des reformulations terrain qui parlent au médecin en retour, ce que les modes B/C ne faisaient pas.
- *Sacrifier C4 pilotage par les données en passe de revue.* Décidé en revue — le pilotage par les données est très peu répandu en médecine générale, la question ne discrimine pas, et la dimension économique bascule dans les benchmarks personnalisés (`R-bench-volume-admin`, `R-bench-transmission`, etc.). Bloc C final à 6 questions : logiciel, dossiers, flux admin, outils numériques santé, IA, conformité.
- *Conserver `c5` IA dans la formulation factuelle directe.* Reformulé en revue post-V1.0 specs car biais de désirabilité inverse trop fort. La nouvelle formulation mesure la maturité de positionnement, pas la pratique exposée — sans piège, sans perte d'information utile.

---

## D-028 — Vague visuelle V1.1.9 : refonte UI questionnaire + page résultats + enrichissement contexte de départ (substrat V1.2)

**Date :** 2026-05-19

**Décision :** V1.1.9 livre trois changements structurants en une vague :

1. **Refonte UI du questionnaire** (`web/app/checkup/page.tsx` + nouveaux composants `CheckupHeader/CheckupProgress/CheckupIntro/CheckupWidgets`). Direction « moderne immersive métier » : bandeau Lugia minimal, indicateur de progression segmenté par facette, écran d'intro pédagogique avant Q01, sauvegarde silencieuse + pastille `✓ Enregistré`, raccourci clavier Entrée, cartes options retravaillées (check-mark à la place du radio natif, split automatique des labels `mot-clé — détail`).

2. **Refonte UI de la page résultats** (`web/app/resultats/page.tsx`). Hero serif 44px aéré, sections numérotées I-IV en marge gauche, synthèse refondue en lead serif 22px + corps 16px aéré (plus de border-left), reco italique en pause narrative pleine largeur (encadré beige + guillemet décoratif), opportunités en cards pleine largeur avec numéro grand serif (1/2/3 en 56px) en marge gauche, prochaine étape avec carte recommandée bordure bleue 2px + gradient subtil.

3. **Enrichissement du bloc Contexte de départ** (`resources/interview_protocol.json` v1.10). Q01 reformulée pour distinguer cabinet de groupe 2-3 vs 4-5 médecins (ajout `q01_d`, IDs existants strictement préservés pour zéro migration BDD). Q02 légèrement reformulée (IDs préservés). Trois nouvelles questions ajoutées en positions 3, 4, 5 : `q15` statut d'installation, `q16` territoire et patientèle, `q17` horizon 3 ans. Toutes mode A, facette `context`, non scorées. Décalage des positions Q03–Q14 de +3 (IDs `q03..q14` strictement inchangés). Total parcours : 14 → 17 questions.

**Important — les nouvelles questions Q15/Q16/Q17 ne sont PAS câblées dans le rapport en V1.1.9.** Elles sont collectées en base mais aucun fragment narratif ne les exploite. Substrat posé pour V1.2 SLM (cascade phrase choc modulée selon horizon, orientation chantiers selon territoire, voix de la recommandation selon ancienneté). Discipline D-020 respectée : *« méthodologique d'abord, intelligence ensuite »*.

**Pourquoi :** Trois constats motivent cette vague.

*UI du questionnaire vieillissante.* Depuis V1, `checkup/page.tsx` était resté sur un design brut hérité du portage V0 : pill facette uppercase, progress bar fine, options en cartes basiques. Aucune respiration entre les facettes, aucun écran d'intro pédagogique, aucune sauvegarde visible. Un test prospect crédible exige une UI à la hauteur du contenu narratif refondu en V1.1.5-V1.1.8. La direction « moderne immersive métier » est cohérente avec la sobriété médicale acquise sur la page résultats V1.1.6.

*Page résultats déjà sobre mais non scénographiée.* La V1.1.6 (cf D-025) avait stabilisé une palette sobre et une structure claire. V1.1.9 va plus loin en rythme de lecture : sections numérotées en marge pour scander les 4 temps du rapport, synthèse mise en valeur typographique, reco italique transformée en vraie pause narrative entre l'analytique (synthèse + facettes) et l'actionnable (opportunités + prochaine étape). Le but n'est pas de tout réécrire mais de mieux séparer ce qui est conservé.

*Manque de contexte de départ pour V1.2 SLM.* Q01 et Q02 capturent le format du cabinet et la prise des RDV mais aucune donnée sur le statut d'installation (récent / senior / approche transmission), le territoire (urbain dense / rural sous-doté), ni l'horizon court-moyen terme. Sans ces 3 dimensions, le SLM V1.2 devrait fabriquer ses propres heuristiques pour personnaliser la cascade phrase choc selon le profil. Avec elles, le SLM dispose d'un substrat factuel qui permet une modulation explicite et auditable. Le coût d'intégration est minime (3 questions mode A, ~90s ajoutées au parcours) et le bénéfice V1.2 est élevé. C'est l'opportunité D-020 typique — *enrichir le méthodologique tant qu'on peut, avant d'ajouter de l'intelligence*.

**Conséquences pour V1.1.9 :**

*Backend / ressources :* `interview_protocol.json` v1.9 → v1.10 (17 questions), `interview_protocol.md` v1.6 → v1.10, `sample_answers_pchateau.md` v2.4 → v2.5 (avec alignement au passage de `q06_c` → `q06_a` qui traînait depuis V1.1.8), `scripts/seed_persona.py` étendu à 17 réponses. Aucun changement de schéma BDD. Aucune migration des données prod nécessaire (les IDs Q01/Q02/Q03-Q14 sont strictement préservés). Les médecins qui ont répondu Q01_b en V1.1.8 (« Cabinet de groupe 2-5 médecins ») verront leur réponse interprétée en V1.1.9 comme « Cabinet de groupe 2-3 médecins » — un médecin en cabinet 4-5 serait alors mal classé. Impact faible vu la base prod minimale.

*Frontend :* 4 nouveaux composants atomiques (`CheckupHeader`, `CheckupProgress`, `CheckupIntro`, `CheckupTransition`), refonte de `CheckupWidgets`, refonte de `checkup/page.tsx` et `resultats/page.tsx`, enrichissement de `globals.css` (animations + classes utilitaires). Pas de nouvelle dépendance. Build Next.js / Tailwind / TS inchangé.

*Non-régression validée :* hash sha256 du rapport généré strictement identique entre V1.1.9 (17 réponses Chateau) et V1.1.8 équivalent (14 réponses Chateau sans q15/q16/q17). Aucune référence brute aux IDs q15/q16/q17 dans le rapport généré. Cohérence MD/JSON OK.

**Retrait sur retour utilisateur — cartons de transition entre facettes :** la phase intermédiaire `"transition"` qui affichait un carton (titre serif 32px + phrase pédagogique + auto-skip 1.5s) entre 2 facettes a été désactivée après le premier test. Jugée perturbante dans le déroulé — casse le rythme d'enchaînement Q par Q. Le composant `CheckupTransition.tsx` reste sur disque, non importé, prêt à être rebranché si un futur retour le justifie. Décision micro mais structurante pour la grammaire du parcours.

**Conséquence pour V1.2 :**

V1.2 SLM disposera de 3 dimensions contextuelles supplémentaires utilisables pour moduler le rapport :

- *Q15 statut d'installation* — un médecin senior (>15 ans) ne reçoit pas la même phrase choc qu'un installé récent. Un médecin qui prépare la transmission (<5 ans) doit recevoir une lecture orientée transmissibilité, sans que le rapport sonne moralisateur pour les autres profils.
- *Q16 territoire et patientèle* — un médecin en zone sous-dotée fait face à des contraintes d'orientation différentes d'un urbain dense. Les chantiers continuité et IA peuvent se reformuler selon ces contraintes.
- *Q17 horizon 3 ans* — croise très bien avec Q06 motivation. Un médecin qui anticipe un déménagement n'a pas le même chantier prioritaire qu'un médecin qui veut alléger sa charge actuelle. Le SLM pourra orchestrer cette nuance.

Le câblage sera arbitré en V1.2 sur la base de retours tests prospects V1.1.10 (cf TODO/ROADMAP). En attendant, ces données sont *dormantes* en base, exactement comme Q14 dort depuis V1 — disponibles pour exploitation future.

**Alternatives écartées :**

- *Refondre le contenu narratif en même temps.* Aurait dilué la cohérence de la vague. V1.1.9 s'est strictement limité au visuel + substrat. Le contenu narratif (fragments swot, phrases choc, chaînes causales, chantiers) reste celui de V1.1.8-a, validé par hash identique.
- *Ne pas ajouter Q15/Q16/Q17 et faire seulement la refonte UI.* Aurait raté une fenêtre opportune. Les 3 nouvelles questions s'intègrent naturellement dans la refonte UI du questionnaire — les ajouter plus tard aurait demandé une 2e refonte du parcours. Mieux les poser maintenant comme substrat dormant.
- *Renommer les IDs existants pour réordonner sémantiquement Q01 (q01_a Solo / q01_b Groupe 2-3 / q01_c Groupe 4-5 / q01_d MSP).* Aurait nécessité une migration BDD silencieuse (les médecins qui ont répondu q01_c MSP en V1.1.8 auraient vu leur réponse interprétée comme « Groupe 4-5 » en V1.1.9). Trop risqué pour un bénéfice cosmétique. Solution retenue : ajouter q01_d (Groupe 4-5) en fin de liste, réordonner uniquement l'affichage (pas les IDs).
- *Décaler ou renommer Q03–Q14.* Aurait cassé toutes les dépendances Python dans `src/swot.py`, `src/templates.py`, `src/workstreams.py`. Solution retenue : décaler uniquement les `position`, conserver les IDs.
- *Garder les cartons de transition entre facettes.* Testés au premier essai puis désactivés sur retour utilisateur (perturbants dans le rythme).

---

## D-027 — Arbitrage simplification produit : richesse analytique du master prompt non livrée en V1, à récupérer en V1.2+

**Date :** 2026-05-18

**Décision :** Reconnaître explicitement l'écart entre la vision initiale du master prompt (40 sections, livré début mai 2026) et le démonstrateur réellement construit. Plusieurs ambitions structurelles ont été simplifiées ou non implémentées en V1, au profit d'une lisibilité utilisateur immédiate. La dette est tracée pour récupération progressive en V1.2 (SLM) et au-delà.

**Écarts assumés par rapport au master prompt :**

| Vision originale | Réalité V1.1.7 | Statut |
|---|---|---|
| 9 facettes WSF (Clients / Produits & Services / Processus & Activités / Participants / Information / Technologies / Environnement / Infrastructure / Stratégies) | 3 facettes (Parcours patient / Équipe / Outils) | Simplification radicale 9→3 |
| 6 constantes concrètes transversales (Service rendu / Information utile / Décisions claires / Charge soutenable / Règles et apprentissages / Capacité à changer) | Aucune structure équivalente | Non livré |
| Ontologie de 13 types de nœuds (Acteur / Besoin / Service / Activité / Information / Outil / Contrainte / Ressource / Objectif / Symptôme / Cause / Risque / Chantier) | Aucun graphe de nœuds | Non livré |
| 13 types de relations entre nœuds | Aucune | Non livré |
| Formule de diagnostic structurée *"Le cabinet présente une fragilité de [famille], située principalement dans [facettes], visible à travers [symptômes], probablement causée ou aggravée par [causes], avec un risque de [risques] si rien ne change"* | Narratif libre (phrase choc + chaîne causale) | Remplacé par templates narratifs |
| 4 vues Mermaid (ensemble / fonctionnement / diagnostic / transformation) | Aucune visualisation | Non livré |
| Pyramide WSF cliquable | Aucune | Non livré |
| Niveau de confiance par facette (fort/moyen/faible) | Non tracé | Non livré |
| Chantiers en 4 parties (Ce que le check-up a vu / Ce qu'il ne peut confirmer / Ce que Lugia propose / Ce que le client obtient) | Refondu en 2 parties (LA SITUATION + CE QU'ON METTRAIT RAPIDEMENT EN PLACE) en V1.1.7-l | Simplification volontaire |
| Stack Streamlit en local | Next.js + FastAPI en prod (Vercel + Render) | Saut au-delà du démonstrateur |

**Ce qui est strictement aligné avec le master prompt :**

- Positionnement Lugia (organisation du travail, pas qualité médicale).
- Ton (sobre, clair, non culpabilisant) — V1.1.7-t a fait un audit complet anti-consulting.
- Garde-fous (pas de données patient identifiables, pas de diagnostic médical, pas de notation individuelle, score déclaratif).
- Promesse temporelle (~30 min check-up).
- Bénéfices visés (lisibilité, clarté, premières actions).
- Feuille de route concrète avec chantiers priorisés.
- Spécialisation médecine générale (vocabulaire métier, contraintes spécifiques).
- Différenciation anti-consulting (carte "Avancer avec Lugia, en réel" V1.1.7-m, anti-blabla des cabinets IA).

**Pourquoi :** L'ambition originale du master prompt (9 facettes × ontologie × 4 vues Mermaid × pyramide WSF cliquable) supposait soit une équipe de développement plus large, soit un planning beaucoup plus long que ce que la fenêtre concurrentielle Lugia permet aujourd'hui. Le choix a été fait, dans la pratique, de privilégier *un démonstrateur lisible et vendable* sur *une plateforme analytique complète*. Un médecin surchargé ne va pas naviguer une pyramide à 9 facettes ni 4 graphes Mermaid — il a besoin d'une page qu'il scanne en 5 minutes et qui lui dit *"voici ce que je vois, voici 3 chantiers, voici comment on bosse ensemble"*. La V1.1.7 délivre exactement ça.

**Alternatives écartées :**

- *Tenir intégralement la vision V1 du master prompt* — aurait nécessité 3-4 mois supplémentaires avant de pouvoir tester en prod. Tué pour permettre des tests utilisateurs précoces.
- *Faire un produit minimal sans structure méthodologique* — aurait tué la différenciation par rapport aux cabinets IA classiques. La méthodologique est restée présente sous une forme narrative (chaînes causales, phrases choc, opportunités) plutôt que graphique.

**Trajectoire de récupération prévue :**

- **V1.1.8 (en cours)** : câblage Q06 pour personnaliser le ton selon la motivation du médecin. Permet de tester si la simplification 9→3 facettes gêne les médecins, ou pas.
- **V1.2 (SLM hybride)** : c'est l'opportunité de **réintroduire l'ontologie comme substrat invisible** pour le LLM. Les nœuds et relations ne s'affichent pas, mais permettent au SLM de raisonner et de générer une finesse narrative qu'on ne peut pas produire en templates purs. Les 9 facettes WSF peuvent revenir comme grille d'analyse en arrière-plan même si on n'en affiche toujours que 3.
- **V1.5+** : envisager une *vue détaillée optionnelle* (lien "Voir l'analyse complète" qui ouvre une page avec 9 facettes + un Mermaid simple). Pour les médecins qui veulent creuser, pas comme défaut.

**Conséquence pour la suite :** chaque vague V1.2+ doit être évaluée à l'aune de ce qui de la vision originale est récupérable et à quel endroit (substrat invisible vs vue dédiée). Ne pas perdre de vue que le master prompt n'était pas une checklist mais un programme de produit — dont une partie reste à livrer.

---

## D-026 — Voix "vous" sur le callout + responsive mobile/print + prénom médecin persistant (V1.1.7)

**Date :** 2026-05-16

**Décision :** Trois changements structurants à V1.1.6, livrés dans la foulée le même jour à partir des specs V3 produites dans une conversation Claude parallèle. (1) Le callout entre les facettes et les opportunités est reformulé à la 2ème personne du pluriel — plus de "Lugia commence par..." en 3ème personne. Le médecin reste sujet de l'action ("Ce check-up vous donne une vue d'ensemble..."). Style visuel allégé : fond gris #f7f7f7 + border-left #e5e5e5, plus d'italique global. (2) Responsive complet : @media print pour rapport imprimable/export PDF (grilles empilées, nav/footer cachés, page-break-inside avoid), @media (max-width: 640px) pour mobile (grids 3 cols → stacks verticaux, padding et tailles de typographie ajustés). (3) Persistance d'un prénom médecin via une nouvelle table `user_profile` indexée sur l'email — affiché en sous-titre du H1 ("Dr {prénom} — résultats du {date}").

**Pourquoi :** La V1.1.6 livrée plus tôt a corrigé la palette et la structure mais laissait trois points à traiter avant un test prospect réel.

- *Voix du callout* : la phrase "Lugia commence par une vue d'ensemble..." en 3ème personne lit comme un argument commercial entre les sections analytique et actionnable. La V3 propose de garder le médecin sujet ("Ce check-up vous donne...") pour préserver le ton accompagnant Lugia (cf MASTER_PROMPT §8). Le mot "Lugia" n'est plus répété — le médecin sait qu'il est sur Lugia (logo nav + footer), redondance évitée.
- *Responsive* : V1-7 implique un médecin qui consulte ou imprime son rapport. Sans @media mobile, le rendu sous 768px est cassé (grid 3 cols qui se réduit mal, contenu coupé). Sans @media print, l'impression copie l'écran avec nav et footer inutiles, mauvaise lecture papier. Les deux étaient prérequis pour tout test prospect crédible.
- *Prénom médecin* : un check-up qui s'adresse au "Dr Chateau" lit comme un rapport personnel. Sans prénom, il lit comme un rapport générique. La friction est minime (champ optionnel dans /compte, à saisir une fois) pour un gain de personnalisation réel. La voie pseudonymisation à l'export reste possible en V2 si besoin (D-024 a déjà tranché contre l'anonymisation BDD pour préserver la personnalisation à l'écran).

**Conséquence pour V1.1.7 :** Refonte de `build_recommandation` côté backend (3 contextes adaptés à la voix "vous"). Nouvelle table `user_profile(email, firstname, updated_at)` avec migration automatique au démarrage. Endpoints `GET/PATCH /me/profile`. Nouvelle section sur `/compte` (input + save). Champ `doctor_firstname` dans le payload `/report`. Page résultats : H1 reformulé "Votre cabinet, vu de l'extérieur", sous-titre conditionnel selon présence du prénom. CSS print et mobile dans `globals.css` avec classes sémantiques utilitaires (`lugia-page-wrapper`, `lugia-facets-grid`, etc.). Aucun changement de scoring, aucune dépendance ajoutée, aucune refonte du questionnaire.

**Conséquence pour V1.2 :** Le callout en voix "vous" devient plus facile à enrichir par SLM ultérieurement — la cohérence sujet ne dépend plus d'un fragment Lugia en marque commerciale, mais d'une formulation accompagnante reproductible. Le prénom médecin pourra alimenter d'autres surfaces (emails de relance, page d'accueil) sans refonte additionnelle.

**Décisions micro associées :**

- *AM vs assistant·e médical·e* : choix de garder le mot en plein. L'abréviation "AM" proposée par la V3 est connue côté hospitalier mais pas universellement en libéral. Gain de concision marginal, risque de perte de lecteurs réel.
- *Robin "connaît vos patients" → "aligné sur votre pratique"* : compromis entre la chair de l'original ("connaît vos patients et s'aligne avec votre façon de travailler" — perçu redondant) et la sécheresse de la V3 ("stable et intégré à votre façon de travailler" — perd l'idée d'alignement). "Stable et aligné sur votre pratique" garde l'idée d'intégration sans la répétition.

**Alternatives écartées :**

- *Anonymisation hash du prénom en base* — déjà rejetée en D-024, casse la personnalisation.
- *Question Q0 "Quel est votre prénom ?" dans le parcours* — alourdirait le questionnaire stabilisé en Vague 3.
- *Extraction du prénom depuis l'email* — fragile (emails type cabinet.medical@orange.fr), pas systématique.
- *Garder le callout en italique avec encadré crème* — testé en V1.1.6, jugé trop "encart commercial" séparant artificiellement la phrase Lugia du reste.
- *Adopter "AM" pour rester strictement conforme V3* — pas mon vote, validé par utilisateur.

---

## D-025 — Refonte UI page de résultats vers palette V2 sobre + séparation reco italique (V1.1.6)

**Date :** 2026-05-16

**Décision :** Refonte visuelle complète de la page de résultats selon les specs V2 (cf `wireframes/resultats_v2_specs.md`) — palette resserrée, suppression de la barre de progression, badges asymétriques selon le niveau, refonte des opportunités d'action avec numéro grand et 2 colonnes, mise en avant de la carte recommandée sur "Prochaine étape", extraction de la recommandation italique de la synthèse pour la positionner en transition entre les facettes et les opportunités. Aucun changement de scoring ni de logique métier.

**Pourquoi :** La V1.1.5 livrée le matin du 16 mai avait corrigé le fond (niveaux qualitatifs, forces/risques, opportunités) mais le rendu visuel restait chargé : bordures partout, encadré crème de la synthèse trop voyant, barre 4 segments redondante avec le badge texte, badge "Priorité X" ambigu sur les opportunités. La V2 conçue en parallèle dans une autre conversation Claude propose un design plus médical-professionnel : palette de 8 couleurs strictement sémantiques, suppression de tout élément décoratif, mise en valeur asymétrique des badges selon que la facette appelle ou non de la vigilance. Migration validée avant V1.2 SLM pour stabiliser le rendu prospect.

**Badges asymétriques — la décision la plus structurante :** Les niveaux 1 (Maîtrisé) et 2 (Opérationnel) n'affichent **pas de badge**. L'absence de badge devient un signal positif implicite. Les niveaux 3 (À surveiller, gris #f0f0f0/#555) et 4 (À risque, rouille #fbeae0/#8a4a1a) affichent un badge qui attire l'œil sur la facette qui appelle attention. Cette asymétrie respecte le principe Lugia "les couleurs servent la sémantique, pas la décoration" et évite l'effet "ma facette Maîtrisée n'est pas verte donc je dois m'en méfier" qu'aurait produit un système symétrique. La distinction Maîtrisé/Opérationnel se fait par la présence ou non d'une section "Points de vigilance" (Maîtrisé : 0 risque ; Opérationnel : 1 ou 2 risques avec plancher générique si rien ne déclenche).

**Séparation de la recommandation italique :** La phrase italique de Lugia (*"Avant tout chantier, Lugia commence par une vue d'ensemble..."*) était précédemment en fin de synthèse, ce qui mélangeait analyse et invitation commerciale dans un même bloc. Extraite dans une section dédiée entre les facettes et les opportunités d'action, elle joue désormais un rôle clair de **transition narrative** : "voici votre situation (synthèse + facettes) → voici la lecture Lugia (reco italique) → voici les leviers d'action (opportunités)". Plus de bordure colorée (premier essai retiré sur retour utilisateur : *"je ne veux pas qu'on rajoute un trait de couleur verticale pour cette phrase"*), pas d'encadré crème (jugé trop chargé) — italique simple aéré qui fait le pont.

**Recommandation côté API :** Nouvelle fonction `build_recommandation(answers, interview_id)` dans `src/templates.py`. Le payload `/report` expose désormais `synthesis` (le bloc analytique) ET `recommendation` (la phrase Lugia) **séparément**. Type `Report` côté frontend enrichi (`recommendation?: string` — optionnel pour rétrocompat avec un backend qui ne l'expose pas encore). `dump_report.py` adapté.

**Phrase choc enrichie de `<strong>` :** Les 22 variantes de `build_phrase_choc` portent maintenant 1 ou 2 mots-clés en gras pour faire ressortir le pivot révélateur. Calibrage manuel par variante.

**Conséquence pour V1.1.6 :** Refonte complète de `web/app/resultats/page.tsx` (~127 lignes modifiées), refonte de `web/components/AppHeader.tsx` (nav full-width), simplification de `globals.css` (suppression encart crème), enrichissement de `src/templates.py` (build_recommandation + strong + saut de ligne), enrichissement de `backend/main.py` (clé `recommendation`), refonte de `scripts/dump_report.py` pour le markdown. Aucune migration BDD, aucun changement de scoring, aucun ajout de dépendance.

**Conséquence pour V1.2 :** La séparation propre entre `synthesis` (analyse) et `recommendation` (invitation Lugia) facilite l'usage SLM ultérieur : le SLM pourra reformuler chacun indépendamment, avec des prompts dédiés et des contraintes de ton distinctes (analyse factuelle vs invitation commerciale).

**Alternatives écartées :**

- *Garder l'encadré crème sur la synthèse* — visuellement trop chargé sur fond crème de page, peu lisible.
- *Conserver la barre 4 segments* — redondant avec le badge texte, surcharge visuelle.
- *Badge sur tous les niveaux* — fait perdre le signal positif "absence de badge = tout va bien".
- *Reco italique avec border-left bleu* — testé, jugé trop "encadré" pour une phrase qui doit faire transition.
- *5 niveaux distincts (rétablir À risque + En tension)* — déjà tranché en V1.1.5-k (cf D-023), pas modifié en V1.1.6.

---

## D-024 — Champ prénom optionnel pour personnaliser le rapport (V1.1.5-i)

**Date :** 2026-05-16

**Décision :** Ajouter un champ texte optionnel `entity_name` à la table `answer`, déclenché côté frontend par 8 options du questionnaire (Q02_a/b/c/other secrétariat, Q07_b/c/d/other équipe étendue). Quand le médecin saisit le prénom de sa secrétaire / son assistant·e / son associé·e / son remplaçant·e, le moteur de rapport l'utilise pour personnaliser certaines forces ("Hervé, votre assistant·e médical·e, en soutien direct" au lieu de "Assistant médical en soutien direct au cabinet"). Si le prénom n'est pas saisi (ou vide ou composé d'espaces), fallback silencieux vers une formulation générique — aucune invention de prénom, jamais.

**Pourquoi :** Le démonstrateur V1.1.5 avait identifié une faiblesse : le rapport mentionne "Catherine" (prédécesseur du télésecrétariat de Chateau) parce qu'une regex extrait ce prénom du `complement_text` libre de Q02 — mécanisme fragile, opportuniste, non systématique. Pour la personne actuelle (la collaboratrice présente au moment du check-up), aucun mécanisme n'existait. Conséquence : un médecin peut mentionner Catherine dans son texte libre par hasard et avoir ce prénom dans son rapport, alors qu'un autre médecin avec une assistante quotidienne ne verra jamais son prénom apparaître. Inéquitable et fragile.

Trois voies envisagées :

- *Améliorer la regex d'extraction sur `complement_text`* — rejeté : reste fragile, dépend du texte libre saisi, pas systématique.
- *Ajouter une question dédiée Q02bis "Quel est le prénom de votre secrétaire ?"* — rejeté : alourdit le questionnaire (déjà calibré en Vague 3), introduit du friction inutile, et complique le scoring/parcours.
- *Champ `entity_name` optionnel conditionnel sur l'option choisie* — retenu : zéro friction (input n'apparaît que si l'option éligible est cochée), explicite côté UX (le médecin voit qu'on lui demande un prénom optionnel), structurellement propre côté BDD, et permet une personnalisation systématique du rapport. Aucun impact sur le scoring ni sur le parcours.

**Conséquence pour V1.1.5 :** Migration BDD légère (`ALTER TABLE answer ADD COLUMN entity_name TEXT`, idempotente via `_ensure_entity_name_column_on_answer()` au démarrage). Ajout des flags `has_entity_field` + `entity_field_label` aux 8 options éligibles dans `resources/interview_protocol.json` (version 1.7 → 1.8). Adaptation API `POST /interviews/{id}/answers/{qid}` et `GET /interviews/{id}/answers` (le payload remonte automatiquement `entity_name` via `select(answer_table)`). Frontend : `AnswerState` enrichi, `OptionRadioList` rend un input texte conditionnel sous l'option choisie avec label contextuel et note de confidentialité factuelle ("Donnée privée, stockée dans votre espace, jamais partagée ni utilisée à d'autres fins."). Moteur de rapport : `derive_entity_name(answers, qid)` dans `src/templates.py`, 6 fragments forces enrichis en lambdas qui résolvent la version personnalisée si `entity_name` présent, sinon fallback générique. `src/swot.py` adapte `Fragment.text` pour accepter `str | Callable` et expose `_resolve_text(fragment_text, answers)`. Seed Chateau enrichi : `entity_name="Marie"` pour Q02 (la télésecrétaire actuelle, post-Catherine).

**Confidentialité :** Le prénom est stocké en clair en base (pas de hash, pas de chiffrement spécifique au-delà du chiffrement disque Postgres prod). La note affichée sous l'input est factuelle : la donnée reste privée à l'espace du médecin connecté, n'est jamais partagée ni utilisée à d'autres fins. Aucune anonymisation au moment de l'export (pas d'export en V1.1.5 — à reconsidérer en V2 si export PDF). Conformité RGPD : le prénom d'un collaborateur n'est pas une donnée patient identifiable au sens médical ; il reste une donnée personnelle au sens RGPD, justifiée par la finalité de personnalisation du rapport, et le médecin peut la modifier ou la supprimer en revenant sur sa réponse.

**Alternatives écartées :**

- *Hash en base + jamais en clair* — casserait la finalité de personnalisation du rapport.
- *Pseudonymisation à l'export uniquement* — pas pertinent pour V1.1.5 (pas d'export). À reconsidérer en V2.
- *Ajout systématique d'une question Q02bis dédiée* — voir ci-dessus.

---

## D-023 — Niveaux qualitatifs + extraction Forces/Risques par option + opportunités d'action (V1.1.5)

**Date :** 2026-05-16

**Décision :** Refonte de l'affichage de la page de résultats sur trois axes structurants. (1) Remplacement du score chiffré /10 par 4 niveaux qualitatifs (Maîtrisé / Opérationnel / À surveiller / À risque) avec seuils stricts publics. (2) Affichage explicite de **Forces** et **Points de vigilance** par facette, extraits des options du questionnaire avec mécanique de priorité, troncature selon le niveau, et planchers de garantie pour éviter les cards vides. (3) Reframing des "chantiers prioritaires" en "**opportunités d'action**" explicitement liées aux risques relevés, avec 4 labels internes renommés et 7 phrases `pas_confirmer` réécrites en hypothèses à confirmer ensemble.

**Pourquoi :** Trois constats post-V1.1 motivent cette refonte. (a) **Faux verdict de précision** : un score "5,8/10" sonne comme une mesure précise alors que le calcul est une moyenne brute déclarative documentée pour ses limites en D-016. Un médecin qui voit "5,8" se demande légitimement "pourquoi pas 6,2 ?" — question à laquelle le scoring ne peut pas répondre. Un niveau qualitatif assume le caractère déclaratif et coupe ce procès en faux. (b) **Pauvreté de la lecture par facette** : la phrase de résumé unique par facette ("Votre prise de rendez-vous est bien outillée. Mais une part des demandes vous arrive en direct...") condense forces et risques en une narration linéaire, sans permettre au médecin de "tagger" rapidement ce qui marche vs ce qui appelle de la vigilance. (c) **Framing inadapté des chantiers** : "trois chantiers prioritaires" sonnait comme un programme imposé. "Trois opportunités d'action" reformule en proposition de levier, en s'appuyant sur ce qui marche déjà (les forces) pour adresser ce qui pose problème (les risques).

**Conséquence pour V1.1.5 :** Nouveau module `src/swot.py` (40 fragments + planchers + `_pick_variant` partagé avec V1.1 Vague 2.2). Mapping `score_to_level()` ajouté à `src/scoring.py` (4 niveaux après fusion V1.1.5-k). Refonte des composants `FacetCard`, `LevelBar`, `LevelBadge` dans `web/app/resultats/page.tsx`. Couleurs sémantiques sobres (#2d7a4f vert forêt, #b8862e jaune-brun, #c25c1f orange-cuivre, #a23a3a rouge brique) pour le point de badge — pas de fond coloré, signal contenu. Barre 4 segments inversée (niveau 1 = 4 segments remplis, niveau 4 = 1 segment). Section "Trois opportunités d'action" remplace "Trois chantiers prioritaires" avec intro reformulée. Les 4 labels internes des cartes opportunités sont renommés ("Ce que nous avons observé", "Ce que ça révèle", "À confirmer ensemble", "L'opportunité d'action"). Les 7 phrases `pas_confirmer` (correspondant à des "hypothèses à valider") sont réécrites au format "Probablement... À mesurer/vérifier/simuler ensemble." Les phrases forces/risques sont en format nominal court (~5-10 mots) ; la matière analytique migre vers le bloc "Ce que ça révèle" des opportunités (V1.1.5-h).

**Calibrage des seuils et fusion 4-5 :** Quatre niveaux, seuils stricts publics — 9-10 Maîtrisé / 7-8 Opérationnel / 5-6 À surveiller / 0-4 À risque. La fusion des ex-niveaux 4 (En tension, score 3-4) et 5 (À risque, score 0-2) en un seul niveau 4 (À risque, score 0-4) a été décidée empiriquement en V1.1.5-k : la calibration des `health_scores` du questionnaire (cf `resources/interview_protocol.json`) rend mathématiquement impossible certaines facettes d'atteindre l'ex-niveau 5. Au pire absolu : Parcours patient plafonne à 3,3 (à cause de Q12_b=5), Équipe et secrétariat à 2,7. Plutôt que d'ajuster les health_scores (changerait l'équilibre méthodologique) ou de relâcher les seuils (régresserait sur D-013), on simplifie l'échelle pour qu'elle reste cohérente avec ce que le scoring peut produire. Une révision de la calibration des health_scores reste possible en V1.5+ si besoin.

**Volumes par niveau :**

| Niveau | Forces affichées | Risques affichés |
|---|---|---|
| 1 Maîtrisé | jusqu'à 3 | jusqu'à 1 |
| 2 Opérationnel | jusqu'à 3 | jusqu'à 2 |
| 3 À surveiller | jusqu'à 2 | jusqu'à 2 |
| 4 À risque | 1 | jusqu'à 3 |

**Planchers :** garantie min 1 force par facette (toujours), garantie min 1 risque dès niveau 2 (Opérationnel ou pire). Le niveau 1 (Maîtrisé) reste sans risque affiché — on ne fabrique pas de vigilance quand tout va bien.

**Conséquence pour V1.2 :** Le SLM hybride dispose maintenant d'un substrat plus riche : 40 fragments swot + 4 niveaux qualitatifs + 7 hypothèses "à confirmer ensemble". Les prompts du SLM pourront s'appuyer sur cette grille pour générer des reformulations contextuelles tout en gardant le fallback templated. La discipline D-020 ("méthodologique d'abord, intelligence ensuite") reste respectée : le SLM enrichit, il ne reconstruit pas.

**Alternatives écartées :**

- *Garder le score chiffré /10 en parallèle du niveau* — rejeté : double affichage redondant, ramène la pseudo-précision qu'on voulait éviter.
- *Confier les forces/risques au SLM* — rejeté pour V1.1.5 : aurait contourné le principe templated-first et fragilisé la garantie de plancher. Le SLM viendra en V1.2 sur un substrat stable.
- *4 niveaux d'emblée* — l'historique de la décision est 5 niveaux (D-023 initial), puis 4 niveaux (fusion V1.1.5-k empirique). Inscrire 4 niveaux d'emblée aurait masqué la motivation empirique de la fusion.

---

## D-022 — Sélection déterministe des variantes par sel de section + reco italique sans variantes

**Date :** 2026-05-15

**Décision :** Le moteur de génération du rapport (`src/templates.py`, `src/workstreams.py`) sélectionne désormais entre plusieurs variantes par section narrative via un hash déterministe combinant `interview_id` et une `section_key` propre à chaque section. Quatre sections analytiques exposent 3 à 4 variantes (phrase choc, chaîne causale, analyse chantier) — la recommandation italique en bas de synthèse garde une seule variante par contexte parce que c'est une fermeture commerciale standardisée, pas une phrase d'analyse.

**Mécanique :** `_pick_variant(interview_id, variants, section_key)` calcule `md5(f"{interview_id}:{section_key}") % len(variants)`. `md5` est utilisé pour la stabilité cross-runs (contrairement à `hash()` Python qui randomise les strings via PYTHONHASHSEED). Le sel par section (`section_key`) garantit que deux sections du même rapport piochent indépendamment : deux médecins du même profil ne voient pas leurs sections shifter en bloc, mais reçoivent un mélange varié de wordings. Si `interview_id=None` (chemin V0 Streamlit figé sur `v0-final`, ou contexte de test sans interview), retour à `variants[0]` — comportement strictement V1.1 single-variant préservé.

**Pourquoi :** D-020 prévoyait initialement "50+ variantes par section" comme cible Vague 2 méthodologique. Cette cible arbitraire a été remplacée par un critère opérationnel mesurable : *deux médecins du même profil ne doivent jamais recevoir exactement la même phrase analytique*. La discipline est :

- *Variantes pour ce qui est analytique* — phrase choc (24 variantes sur 6 patterns), chaîne causale (15 sur 5 patterns), analyse chantier (21 sur 7 contextes). Trois angles d'attaque par pattern proposent trois lectures cohérentes de la même situation, ce qui enrichit le rapport sans le rendre redondant.
- *Pas de variantes pour ce qui est commercial* — la recommandation italique en bas de synthèse est une fermeture standardisée qui rappelle la thèse Lugia ("vue d'ensemble avant chantier") et invite à la suite. Pour deux médecins du même profil, le contenu est intrinsèquement identique. Varier le wording de cette phrase serait cosmétique et affaiblirait la signature Lugia reconnaissable. Décision : 1 variante par contexte (3 contextes : `ia_visible`, `descriptions`, `default`), réécrites concises (~25-35 mots) et ancrées métier (cabinet, secret médical, semaine, demandes patients, courriers, coordination, suivi chroniques, organisation interne).

**Justification du sel par section :** trois options envisagées pour le hash.

- *Sel global unique* (`hash(interview_id) % N` partout) — rejeté : avec une même cardinalité (par exemple 4 variantes partout), deux interviews voisines voient toutes leurs sections shifter en bloc. Visuellement les rapports restent trop corrélés.
- *Sel par section* (`hash((interview_id, section_key)) % N`) — retenu : chaque section pioche indépendamment. Pas de migration BDD, pas de stockage supplémentaire, calcul stable côté code.
- *Sel par section + jitter sur seed stocké en base* — rejeté : surcoût d'une migration BDD légère pour un bénéfice marginal. Reporté en V1.2 si le besoin se manifeste.

**Conséquence pour V1.1 :** `src/templates.py` voit un helper `_pick_variant` ajouté + 3 signatures étendues (`build_phrase_choc`, `build_chaine_causale`, `build_synthesis`) avec un paramètre `interview_id: Optional[int] = None`. `src/workstreams.py` voit les 3 chantiers étendus avec `interview_id: Optional[int] = None` également. `backend/main.py` et `scripts/dump_report.py` passent `interview_id` au caller `build_synthesis`. `pages/02_Resultats.py` (V0 Streamlit figé) reste compatible sans modification grâce au fallback `None`. Au total 63 fragments narratifs gérés par `_pick_variant` (24 phrase choc + 15 chaînes causales + 21 analyses chantier + 3 reco italiques), dont 51 nouveaux écrits en Vague 2.2a-d.

**Conséquence pour V1.2 :** Le SLM hybride disposera désormais d'un socle de **51 few-shot examples** issus de V1.1 + V1.1 Vague 2.2 (au lieu des ~37 d'avant 2.2), répartis en 4 catégories sémantiques claires (phrase choc, chaîne causale, analyse chantier, reco italique). Permet de calibrer les prompts par section sans surajustement à un seul style. Le critère "fallback systématique sur templates en cas d'échec LLM" reste valide : si le LLM échoue ou si `LLM_ENABLED=0`, retour automatique à `_pick_variant` qui couvre 100% des cas.

**Alternatives écartées :**

- *Variantes uniformes (4 par section partout)* — rejeté pour la reco italique. Aurait dilué la signature commerciale et produit de la cosmétique sans plus-value analytique.
- *Pas de variantes du tout, mais SLM dès V1.1* — rejeté par D-020 : on ne calibre pas un SLM sur un socle narratif pauvre. Mieux vaut un socle templated solide avant d'ajouter la couche LLM.
- *Variantes par profil complet plutôt que par section* — rejeté : explosion combinatoire (4^4 = 256 rapports possibles à écrire et maintenir manuellement), pour un bénéfice marginal vs sélection par section.

---

## D-021 — Refonte questionnaire V1.1 (Vague 3) : règles globales + dérogation à l'alternance

**Date :** 2026-05-15

**Décision :** Le questionnaire V1.1 est refondu (Q02 à Q11 hors Q07/Q10/Q12) selon cinq règles globales nouvelles, inscrites dans `resources/interview_protocol.md` section 1. Quatre options principales plus une option Autre (saisie inline), options factuelles ancrées dans des situations observables, options mutuellement exclusives, mise en scène d'une situation réelle quand c'est possible, et restriction des modes B et C aux questions où la réponse libre apporte un matériau verbatim irremplaçable. Trois questions changent de mode : Q04 et Q11 passent de Mode B à Mode A (doublon constaté entre réponse libre et QCM), Q06 passe de Mode C à Mode A (motivation traitable par QCM). Q01 conserve trois options principales en exception assumée (typologie close solo/groupe/MSP). La distribution de modes passe de 8 A / 4 B / 2 C en V1.0 à 11 A / 2 B / 1 C en V1.1.

**Pourquoi :** Premiers retours utilisateurs (mai 2026, backlog V1.1 Sébastien) sur trois questions : (a) les options de Q03 n'étaient pas exclusives, (b) la réponse libre de Q04 et Q11 faisait doublon avec le QCM, (c) plusieurs options reposaient sur des termes émotion-dépendants ("beaucoup", "souvent") qui dégradaient la reproductibilité de la lecture. Trois voies envisagées :

- Refonte mineure préservant tous les modes — rejetée : ne résolvait pas le doublon de Q04/Q11 ni la non-exclusivité de Q03.
- Passage en multi-sélection sur Q03 — rejeté : décision structurelle imposant migration BDD (`answer.option_id` actuellement scalaire), surcharge frontend (checkboxes), complication du scoring moyenne brute (pondération par nombre d'options ?), pour un bénéfice marginal puisqu'une réécriture exclusive des options résout le même besoin sans casser le schéma.
- Refonte structurelle avec règles globales — retenue : résout le doublon, l'exclusivité et la factualité en une passe, sans toucher au schéma BDD ni au moteur de scoring. Permet une trajectoire stable vers V1.2 (le questionnaire fiabilisé devient un meilleur substrat pour le SLM, voir D-020).

Le coût payé en compensation est la dégradation de l'alternance des modes (8 A / 4 B / 2 C → 11 A / 2 B / 1 C). Cette perte d'engagement par alternance est jugée acceptable parce que la cohérence factuelle des options apporte un gain perçu plus grand : le médecin se reconnaît mieux dans un libellé observable que dans un mode varié. Les retours V1.1 confirmeront ou infirmeront ce trade-off.

**Conséquence pour V1.1 :** `resources/interview_protocol.json` v1.3 réécrit pour les 8 questions concernées + ajout de la clé `global_rules_v1_1` (lisible mais non exploitée par le code, sert de documentation contractuelle). `resources/interview_protocol.md` v1.3 mis à jour avec la section "Règles globales V1.1", la nouvelle distribution et le nouveau tableau Chateau. `resources/sample_answers_pchateau.md` v2.0 réécrit avec quatre changements de réponse (Q06 q06_c, Q08 q08_d nouvelle sémantique, Q09 q09_d nouveau palier factuel, Q11 q11_c au lieu de q11_d). `scripts/seed_persona.py` aligné. `src/templates.py` corrigé sur Q08_d (suppression de la phrase "personne ne saurait", remplacée par "le cabinet ferme — solution retenue") et Q11_d (suppression de l'incident inventé "il y a quelques mois", remplacée par "tri au fil de l'eau, sans rythme garanti"). Aucun changement de schéma BDD, aucun ajout de dépendance, déploiement Render/Vercel inchangé.

**Conséquence pour V1.2 :** Le matériau verbatim de Q05 (récit concret du soir/weekend), Q13 (contexte d'usage IA) et Q14 (aspiration finale) reste le substrat principal de la couche SLM. La refonte V1.1 a précisément concentré le mode B/C sur ces trois questions, ce qui simplifie l'écriture des prompts SLM ultérieurs.

**Alternatives écartées :**

- *Passage en multi-sélection sur Q03* : décision structurelle disproportionnée pour un gain marginal — voir ci-dessus.
- *Conservation stricte de l'alternance A/B/C en V1.0* : impossible sans réintroduire les doublons libre/QCM que le backlog identifie comme un défaut structurel. La règle d'alternance reste un objectif souhaitable mais elle n'est pas un invariant non négociable.
- *Refonte complète du questionnaire (réécriture from scratch)* : trop coûteuse et peu justifiée — la structure V1.0 est saine sur 6 questions sur 14, seules 8 questions méritaient une refonte.
- *Multi-sélection ailleurs (Q07, Q12, Q13)* : non demandée par le backlog, prématurée.

---

## D-020 — Stratégie de génération du rapport : méthodologique enrichi puis SLM hybride

**Date :** 2026-05-14

**Décision :** Le moteur de génération du rapport (`src/templates.py`, `src/workstreams.py`) évolue en deux temps. En V1.1, refonte méthodologique pure : passer d'une dizaine à plus de 50 variantes par section, structure narrative renforcée (phrase choc révélatrice en synthèse, étape d'analyse explicite entre observation et proposition dans les chantiers), vulgarisation du jargon WSF en langage métier-médecin. En V1.2, ajout d'une couche SLM/LLM en surcouche, avec **fallback systématique** sur le templating en cas d'erreur, d'indisponibilité, ou de contrainte RGPD/confidentialité. Le méthodologique enrichi reste le socle, le SLM ajoute de la personnalisation contextuelle.

**Pourquoi :** Les retours utilisateurs de la première vague de tests (mai 2026, backlog V1.1) pointent un défaut structurel : le rapport décrit ses propres entrées (redite de l'entretien) au lieu de produire une analyse à valeur ajoutée. Trois voies envisagées (méthodologique pure, SLM pur, hybride) ; la voie hybride avec méthodologique enrichi comme socle a été retenue pour plusieurs raisons : (a) prépare la matière first-shot que le SLM utilisera ensuite, (b) garantit une disponibilité 100% même si SLM tombe, (c) reste auditeur et explicable (utile face à un médecin qui demande pourquoi telle conclusion), (d) découple la qualité produit de la dépendance API tierce, (e) évite que le défaut "rapport peu personnalisé" soit confondu avec un défaut SLM. La discipline « méthodologie d'abord, intelligence ensuite » respecte aussi l'ordre d'apprentissage : on ne peut pas calibrer un SLM sur un questionnaire mal ficelé.

**Conséquence pour V1.1 :** Refonte des templates pour atteindre 50+ variantes, refonte du questionnaire (Vague 3) pour fiabiliser les entrées avant SLM, structure narrative à 5 sections par chantier au lieu de 4 (observation → analyse → ce qui échappe → proposition → bénéfice), suppression des citations nominatives d'outils tiers (ChatGPT, Maiia, etc.), traduction du jargon WSF en langage métier. Aucun appel API tiers, aucune dépendance ajoutée, déploiement Render/Vercel inchangé.

**Conséquence pour V1.2 :** Architecture d'orchestration LLM à concevoir, avec sélecteur de provider (Ollama local en dev, API cloud type Anthropic Haiku en prod). Section de chaque rapport (synthèse, analyse facette, analyse chantier) générée via prompt structuré avec quelques few-shot examples issus de V1.1. Si l'appel LLM échoue ou si une variable d'environnement `LLM_ENABLED=0` est posée, fallback automatique sur les templates V1.1 sans dégradation perceptible. Coût opérationnel estimé : ~0.005-0.015€ par rapport en prod cloud, zéro en dev local.

**Conséquence architecturale plus large :** Le MacBook Pro de Sébastien équipé pour faire tourner Ollama est destiné au développement et à l'expérimentation des prompts. Pour la prod accessible à des prospects à distance via diagnostic.lugia.fr, l'inférence SLM tournera côté cloud API (option A privilégiée en V1.2). Une éventuelle bascule vers une architecture "Mac dédié serveur" ou "GPU cloud autohébergé" n'est pas exclue plus tard, mais n'est pas prioritaire.

**Note V1.1 — Q14 reportée à V1.2 :** En audit de Vague 2 lite (mai 2026), tentative d'intégrer la Q14 ("ce que vous aimeriez approfondir") dans la synthèse via heuristique textuelle pure (citation de la première phrase tronquée, blacklist de génériques). Approche rejetée : trop fragile, risque de produire un non-sens en conclusion du rapport. Décision : Q14 dort en base le temps de V1.1, sera traitée par le SLM en V1.2 (qui saura reformuler ou ignorer selon la qualité de la réponse). Les free_text Q14 deviendront un matériau-test idéal pour calibrer les prompts du SLM.

**Alternatives écartées :**

- **SLM/LLM dès V1.1** — risquerait de masquer la faiblesse du questionnaire actuel par de la fluence générative. Discipline : fiabiliser le socle avant d'ajouter de l'intelligence.
- **Templating pur sans SLM** — fonctionne mais limite la personnalisation à des combinatoires statiques, contrarie les ambitions V1.5 (pré-questionnaire psychologique, second questionnaire wow, multi-métier).
- **SLM en remplacement total du templating** — supprime le socle reproductible et auditable, expose à 100% aux pannes externes, complique le débogage.

---

## D-019 — Organisation multi-tracks et multi-conversations Claude

**Date :** 2026-05-13

**Décision :** Le projet Lugia n'est plus traité dans une conversation Claude unique mais découpé en 4 tracks parallèles, chacun avec sa propre conversation Claude au gré des chantiers. Tracks identifiés : Démonstrateur technique (le présent repo), Communication (identité visuelle, site marketing, slides), Marché et clients (étude marché, prospects, tests V1-7+), Opérationnel (méthode, livrables clients, scoring avancé). La mémoire transversale est portée par les fichiers `.md` à la racine du repo (MASTER_PROMPT, DECISIONS, ROADMAP, CHANGELOG, TODO). Les prompts d'ouverture sont versionnés dans `meta/PROMPT_OUVERTURE_<TRACK>.md`.

**Pourquoi :** Une conversation Claude saturée perd en qualité de réponse et mélange des modes mentaux incompatibles (debug technique vs rédaction marketing vs analyse prospect). La discipline documentaire déjà en place rend la séparation en plusieurs conversations soutenable sans perdre la cohérence du projet : chaque conversation lit le même socle de fichiers .md au démarrage. Cette organisation scale aussi naturellement vers V2 et au-delà, et permet à un chantier court (par exemple "rédaction page /qui-est-lugia") d'être traité dans une conversation focalisée puis close, sans polluer la conversation principale.

**Conséquence :** Le repo gagne un dossier `meta/` qui rassemble les 4 prompts d'ouverture standardisés. Avant chaque nouvelle conversation Claude, le prompt correspondant est collé en premier message. Les livrables produits dans chaque conversation sont consolidés dans les fichiers .md du repo avant clôture. Quand un track grandit, un sous-dossier dédié (communication/, marche/, operations/) peut être créé avec son propre INSTRUCTIONS.md.

**Alternatives écartées :**

- Une seule conversation Claude pour tout — perte de finesse rapide, pollution croisée, difficile à reprendre après pause.
- Une conversation par track sans rotation — la durée de vie d'une conversation reste limitée même au sein d'un track ; mieux vaut une conversation par chantier qu'une conversation longue par track.
- Repos GitHub séparés (lugia-tech, lugia-business, lugia-content) — prématuré tant que le projet est en phase démonstrateur. À envisager en V2.

---

## D-018 — RGPD minimale intégrée à V1, pas à V2

**Date :** 2026-05-13

**Décision :** Intégrer un socle RGPD minimal dès la V1 (avant le tag `v1-final` initialement prévu après V1-6), plutôt que de différer l'intégralité du sujet à V2. Périmètre retenu : mentions légales `/legal`, politique de confidentialité `/confidentialite`, footer commun, droit à l'effacement (`DELETE /me` côté API + page `/compte` côté frontend). Hors périmètre V1 : DPA signés avec sous-traitants, bandeau cookies (non requis tant qu'on n'utilise que localStorage technique), export de données (à voir si demandé). Auth permanente avec mot de passe reste différée à V2.

**Pourquoi :** Un test V1-7 face à un médecin prospect impose un minimum de défendabilité. Sans mentions légales, sans politique de confidentialité, sans droit à l'effacement opérationnel, le produit n'est pas présentable en l'état à un professionnel qui regardera le footer et les CGU avant tout. Reporter à V2 reviendrait à présenter une démo "indéfendable" — risque de braquage du prospect ou de signalement CNIL si l'usage devient même informel. Le coût en temps de développement est faible (4 fichiers nouveaux + 2 modifiés côté frontend, 1 endpoint côté backend) ; le coût d'opportunité est élevé.

**Conséquence :** Responsable du traitement déclaré comme **personne physique** (Sébastien Boncoeur, particulier) tant que la société n'est pas constituée. Contact RGPD : sebastien@lugia.fr. Sous-traitants mentionnés sans DPA signés (Vercel, Render, Resend) — à régulariser dans la foulée, possible avant V2. Avant tout test client en condition réelle, une relecture rapide par un avocat RGPD est conseillée (200-500€) — non bloquant pour V1-7 informel mais à prévoir avant un premier contrat commercial.

**Alternatives écartées :**

- Reporter intégralement à V2 — risque de braquage des prospects.
- Niveau "avancé" (DPA, bandeau cookies, export portabilité) — coût trop élevé pour V1, plus-value marginale en pré-commercial.
- Sous-traiter la rédaction des mentions à un avocat — différerait V1-7 de plusieurs semaines, non justifié au stade démonstrateur.

---

## D-001 — Positionnement Lugia : substitution-extension

**Date :** 2026-05-12

**Décision :** Lugia ne se positionne pas comme un outil supplémentaire à apprendre, mais comme la substitution d'un usage existant (IA générative grand public non sécurisée) par une interface conforme au secret médical. Cette interface se prolonge progressivement en hub de suivi de l'organisation.

**Pourquoi :** Le travail sur le persona Dr Chateau a révélé une réalité forte chez les médecins-cibles : ils n'ont pas besoin d'un énième outil, ils ont besoin de temps et de sécurité sur ce qu'ils font déjà. Le positionnement "outil de plus" serait perçu comme une charge supplémentaire et rejeté.

**Alternatives écartées :** positionnement "outil de check-up générique" (déjà saturé sur le marché), positionnement "outil d'audit" (anxiogène, technocratique).

---

## D-002 — Périmètre V0 : trois facettes WSF prioritaires

**Date :** 2026-05-12

**Décision :** La V0 du démonstrateur traite uniquement trois facettes WSF — **Processus & Activités**, **Participants**, **Information**. Les six autres facettes sont reportées en V1.

**Pourquoi :** Les trois facettes retenues correspondent au noyau interne du WSF (entièrement sous la responsabilité du cabinet) et sont les plus parlantes pour un médecin. Cela permet une V0 réellement démontrable sans diluer la qualité.

**Alternatives écartées :** V0 sur les 9 facettes (trop lourde, dilution garantie), V0 sur une seule facette (insuffisamment démonstrative).

---

## D-003 — Patient = Client en V0

**Date :** 2026-05-12

**Décision :** Dans la modélisation V0, les patients sont toujours traités comme "Clients" au sens WSF, et non comme "Participants" même quand ils participent ponctuellement aux activités (examen, recueil d'information).

**Pourquoi :** Simplification de l'ontologie pour la V0. La nuance "patient = participant ponctuel" est défendue par Steven Alter mais alourdit le modèle sans gain immédiat pour le démonstrateur.

**Alternatives écartées :** double catégorisation Client + Participant ponctuel — reportée en V1+.

---

## D-004 — Périmètre cible : cabinets de 1 à 5 médecins +/- secrétariat

**Date :** 2026-05-12

**Décision :** Le démonstrateur cible les cabinets de 1 à 5 médecins, avec ou sans secrétariat (interne ou externalisé). Les MSP de grande taille sont reportées en V1+.

**Pourquoi :** Le WSF est conçu pour des systèmes opérationnels de taille modérée. Au-delà de 5 médecins, le cabinet devient une organisation à plusieurs systèmes imbriqués, ce qui dépasse le scope du démonstrateur et nécessite une analyse multi-systèmes.

**Alternatives écartées :** périmètre étendu aux MSP de grande taille dès la V0 (complexité non maîtrisable), périmètre restreint au cabinet solo uniquement (insuffisamment représentatif).

---

## D-005 — Durée cible du check-up : 45 minutes

**Date :** 2026-05-12

**Décision :** La promesse du démonstrateur est de produire une première lecture en 45 minutes, et non 20 comme initialement envisagé.

**Pourquoi :** La richesse du questionnaire (qualification, signaux faibles, antécédents, trois facettes V0 puis neuf en V1, exemples concrets demandés) rendait la promesse de 20 minutes irréaliste. Le passage à 45 minutes permet un check-up substantiel sans bâclage. Le mécanisme de réponses pré-rédigées à partir de la mi-questionnaire compense partiellement l'effort de saisie.

**Alternatives écartées :** maintenir 20 minutes au prix d'un questionnaire bâclé, ou monter à 60 minutes au risque de perdre le médecin.

---

## D-006 — Persona unique pour les tests : Dr Philippe Chateau

**Date :** 2026-05-12

**Décision :** Un unique persona médecin est utilisé pour les tests locaux de la V0 — le Dr Philippe Chateau, 55 ans, médecin libéral solo à Saint-Mandé, ancien marathonien, en charge familiale lourde suite à la maladie de sa femme.

**Pourquoi :** Un persona contrasté (forces apparentes massives, fragilités cachées profondes, événement personnel récent) sert mieux le démonstrateur qu'un persona moyen. Il permet de tester la capacité du produit à révéler ce qu'on ne voit pas, et offre un meilleur cas commercial pour Lugia. Voir `resources/persona_medecin_pchateau.md`.

**Alternatives écartées :** plusieurs personas (trop lourd pour la V0), persona générique (insuffisamment instructif), persona "fatigué qui se plaint" (cas trop facile, peu différenciant).

---

## D-007 — Trois modes d'interaction du questionnaire

**Date :** 2026-05-12

**Décision :** Le questionnaire alterne trois modes d'interaction. **Mode A** (QCM pur) pour les questions à spectre fini connu. **Mode B** (Hybride, par défaut) avec réponse libre courte puis relance QCM puis complément optionnel. **Mode C** (Ouvert pur) pour les questions à forte valeur narrative ou sensibles, limité à trois ou quatre questions dans tout le parcours.

**Pourquoi :** Réduit l'hallucination du LLM (les options QCM sont pré-taggées avec leur facette, type de nœud, sévérité), améliore la reproductibilité (deux passages produisent le même modèle structurel), réduit le coût cognitif du médecin (clics au lieu de paragraphes). Le principe d'alternance maintient l'engagement et donne au médecin l'impression d'être écouté sur son vécu unique.

**Alternatives écartées :** QCM pur (perte de texture pour le rapport, biais d'ancrage), réponse libre pure (hallucination LLM, coût cognitif), mode hybride sans alternance (sensation de formulaire générique).

---

## D-008 — Workflow design : artefact d'abord, Streamlit ensuite

**Date :** 2026-05-12

**Décision :** Avant de coder une page Streamlit, un wireframe React ou HTML est produit en artefact Claude et validé visuellement. Streamlit n'intervient qu'après validation visuelle.

**Pourquoi :** Évite le piège du "je code en Streamlit, je n'aime pas le résultat, je recommence". Réduit le coût d'itération sur l'UX. Le wireframe artefact est rapide à produire et à modifier.

**Alternatives écartées :** coder directement en Streamlit (coûteux à itérer), recourir à Figma ou autre outil de design (rupture dans le flow de travail avec Claude).

---

## D-009 — Stratégie LLM : règles déterministes prioritaires, LLM encadré

**Date :** 2026-05-12

**Décision :** Le démonstrateur s'appuie en priorité sur des règles déterministes inscrites dans les fichiers `.md`. Le LLM intervient uniquement là où aucune règle ne peut décider. Tout appel LLM a un schéma JSON de sortie strict, des exemples few-shot dans le `.md` correspondant, une validation post-LLM côté code, et une température comprise entre 0 et 0,2.

**Pourquoi :** Maximise la reproductibilité, réduit drastiquement le risque d'hallucination, rend le démonstrateur démontrable en démo (résultats stables d'une exécution à l'autre).

**Alternatives écartées :** LLM-first (risque d'hallucination, incohérence d'une exécution à l'autre, démonstrabilité dégradée), règles déterministes uniquement (rigidité, pas d'adaptabilité au texte libre).

---

## D-010 — Sample report généré par session réelle, pas pré-écrit

**Date :** 2026-05-12

**Décision :** Le fichier `resources/sample_report.md` n'est pas rédigé en amont. Il sera généré par le démonstrateur lui-même à l'issue de la première session complète jouée avec le persona Dr Chateau (Phase V0-5).

**Pourquoi :** Évite le piège du "rapport rêvé qui ne correspond à rien d'atteignable techniquement". Le rapport réel produit par le démonstrateur sert ensuite d'oracle pour les itérations.

**Alternatives écartées :** rédiger le rapport idéal en amont (risque de viser une cible inatteignable et de diverger silencieusement).

---

## D-011 — Cinq phases V0 (et non douze)

**Date :** 2026-05-12

**Décision :** La V0 est découpée en cinq phases : V0-1 wireframes, V0-2 squelette Streamlit + SQLite, V0-3 interview Modes A/B/C, V0-4 scoring et restitution, V0-5 test bout en bout avec le persona. Les phases 1 à 12 du document d'origine sont soit fusionnées, soit reportées en V1.

**Pourquoi :** Le découpage en 12 phases incluait des phases V1+ qui auraient dilué la V0. Cinq phases V0 plus extension progressive en V1 est plus tenable et lisible.

---

## D-012 — `MASTER_PROMPT.md` à la racine du projet

**Date :** 2026-05-12

**Décision :** Le fichier `MASTER_PROMPT.md` est placé à la racine du projet, et non dans `resources/`.

**Pourquoi :** C'est un fichier méta du projet, à lire en premier par tout assistant IA qui ouvre le dépôt. Sa place à la racine signale ce statut.

**Alternatives écartées :** placer dans `resources/` (perdrait son statut de fichier de cadrage prioritaire), placer dans un dossier `meta/` (sur-ingénierie pour un projet de cette taille).

---

## D-013 — Scoring : justifiabilité mathématique non négociable

**Date :** 2026-05-12

**Décision :** Le score produit par le démonstrateur doit être mathématiquement justifiable à tout moment. Si un utilisateur demande "pourquoi 6 sur 10 ?", on doit pouvoir lui montrer le détail du calcul — quelles questions, quelles options choisies, et la contribution de chacune à la facette concernée.

En V0, le calcul est volontairement simple : moyenne brute des scores santé des options sélectionnées dans chaque facette. Le détail est **recalculable à la volée** à partir de la table `answer` (pas de stockage redondant en V0). Un encart "détail de votre score" sur la page de résultats est différé en V1.

Une pondération calibrée par benchmarking entre pairs (cohortes anonymisées de professionnels du même secteur) est différée en V1+, quand la maturité du produit le permettra.

**Pourquoi :** Le scoring est au cœur de la valeur du démonstrateur. Sans transparence et justifiabilité, le médecin ne peut pas faire confiance à la lecture proposée. La simplicité du calcul V0 est un trade-off assumé : il vaut mieux un score simple et défendable qu'un score sophistiqué et opaque. La pondération viendra progressivement, calibrée par échanges avec plusieurs professionnels du même secteur, lorsque la base de données de répondants atteindra une taille suffisante.

**Alternatives écartées :** scoring boîte noire calculé par LLM (impossible à expliquer mathématiquement), pondération a priori sans validation empirique (risque d'arbitraire), stockage de scores agrégés sans détail (perte de la justifiabilité).

---

## D-014 — Format canonique des questions du questionnaire : JSON

**Date :** 2026-05-12

**Décision :** Les données structurées du questionnaire V0 vivent dans `resources/interview_protocol.json` (source de vérité technique). Le fichier `resources/interview_protocol.md` reste la documentation humaine et est tenu à jour manuellement. Le module `src/questions.py` est un loader minimal qui lit le JSON, et expose une fonction `check_md_json_consistency()` qui vérifie au démarrage que les IDs des questions et le compte sont alignés entre les deux fichiers.

**Pourquoi :** Le format JSON est strictement typé, stdlib-parseable, et accessible à un éditeur non développeur. Il scale mieux que Python dict-as-data quand le nombre de questions augmente (V1 visera plusieurs dizaines de questions). Le retro-test au démarrage évite la dette de divergence silencieuse entre les deux représentations.

**Alternatives écartées :** Python dict (`src/questions.py` comme source) — plus simple à l'écriture mais mélange code et données, scale moins bien, et accessible seulement aux développeurs. Parseur Markdown du `.md` — overkill pour la V0, fragile au format. YAML — ajouterait une dépendance (PyYAML) sans bénéfice net face au JSON pour la V0.

---

## D-015 — Promesse revue : "moins de 30 minutes" en V0

**Date :** 2026-05-13

**Décision :** La promesse du démonstrateur est révisée à **"En moins de 30 minutes, Lugia aide un médecin à répondre à la question : où en est réellement mon cabinet aujourd'hui ?"**. La valeur précédente de 45 minutes (voir D-005) est obsolète pour la V0 mais conservée en archive historique.

**Pourquoi :** Trois évolutions cumulées ont réduit la durée effective du questionnaire :
- Extension du Mode A pour porter un complément optionnel (la majorité des questions sont désormais en Mode A).
- Conversion de plusieurs Mode B en Mode A+complément (Q08, Q10, Q13 en v1.1).
- Suppression de Q05 (Canal principal de rendez-vous), redondante avec Q04.

Le test utilisateur en mode parcours rapide donne 8 minutes pour les 14 questions, ce qui place la durée pour un répondant qui réfléchit à environ 15-25 minutes. La promesse "moins de 30 minutes" est tenable, plus crédible, et constitue un argument commercial plus fort qu'un check-up de 45 minutes.

**Alternatives écartées :** maintenir 45 minutes (n'est plus réaliste depuis la simplification du parcours), passer à 20 minutes (potentiellement trop court pour un médecin qui prend vraiment le temps de répondre — risque d'attente déçue).

---

## D-016 — Limites assumées du scoring V0 et trajectoire V1+

**Date :** 2026-05-13

**Décision :** Le scoring V0 (moyenne brute pure, voir D-013) est conscient de ses cinq limites structurelles : effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle pour les petites structures. Ces limites sont documentées explicitement dans `modeling_scoring.md` section 7.

Pour le démonstrateur V0, ces limites sont **assumées et partiellement compensées** par la narration : les templates de synthèse et de chantiers foregroundent les Red Flags critiques (usage IA non conforme, dépendance personnelle, flux parallèles). La compensation est éditoriale, pas structurelle.

La trajectoire V1+ est documentée dans `ROADMAP.md` section dédiée "Scoring V1+". Elle comporte cinq mécanismes : pondération avec conditions, scores planchers (K.O. critère), système de Flags critiques, Cartouche de Diagnostic, architecture multi-secteur.

**Pourquoi :** D-013 a établi le principe de justifiabilité mathématique non négociable. L'erreur initiale aurait été d'identifier "justifiable mathématiquement" avec "moyenne brute". Une moyenne pondérée avec conditions est tout aussi justifiable — la justification consiste à expliciter chaque poids et chaque règle plancher. La simplicité de la moyenne brute reste acceptable comme point de départ V0, mais la conscience explicite de ses limites est nécessaire pour ne pas en faire un standard pérenne.

**Alternatives écartées :** introduire dès la V0 un système de Flags critiques ou de scores planchers (complexifie significativement V0, mieux vaut un V0 simple mais conscient qu'un V0 partiellement sophistiqué). Renoncer à la moyenne brute pour V0 et passer directement à la pondération (prématuré, pondérations non calibrées sans données de pairs).

---

## D-017 — Cadrage V1 : portage technique pur, découpage V1 / V1.5 / V2, choix architecturaux

**Date :** 2026-05-13

**Décision :**

**Périmètre V1.** V1 = portage technique pur de V0 vers une architecture web distante, à isofonctionnel. Aucune nouvelle fonctionnalité méthodologique en V1. Mêmes 3 facettes, mêmes 14 questions, mêmes 3 chantiers, même rapport. La seule valeur ajoutée de V1 est l'accès distant via `diagnostic.lugia.fr` avec auth par lien magique.

**Découpage V1 / V1.5 / V2.**
- V1 = portage technique pur (15-18 sessions estimées).
- V1.5 = extensions méthodologiques après V1 stable (extension 9 facettes, animations pyramide, section "Vos mots", export PDF). 12-15 sessions.
- V2 = montée commerciale (auth moderne, conformité RGPD complète, pricing actif, multi-session).

**Choix architecturaux V1 :**
- Frontend Next.js (TypeScript, Tailwind, Framer Motion à venir en V1.5).
- Backend Python FastAPI réutilisant intégralement les modules `src/*` de V0.
- Base Postgres (migration depuis SQLite).
- Hosting : Vercel (frontend) + Render (backend + Postgres).
- DNS OVH avec CNAME `diagnostic.lugia.fr` vers Vercel.
- Auth lien magique par email via Resend.
- Conformité V1 : minimale (test, prospects volontaires, pas de données patient). Conformité complète en V2.
- Pricing : décision différée à V1-4 ou V1-5.

**Pourquoi :** Trois raisons interdépendantes.

D'abord, **éviter le "fourre-tout V1"**. Un V1 qui mélange portage technique et extension méthodologique multiplie les risques et allonge le délai avant le premier test client réel. Découpler les deux laisse le portage tech se stabiliser avant d'ajouter de la complexité produit.

Ensuite, **Next.js plutôt que Streamlit étendu** parce que les animations sur la pyramide WSF (prévues V1.5) et la qualité de rendu visuel attendue par un client payant excèdent ce que Streamlit produit naturellement. Migrer maintenant évite une réécriture forcée plus tard. Le code métier (`src/scoring`, `src/templates`, `src/workstreams`) est réutilisé tel quel — l'effort se concentre sur la couche présentation.

Enfin, **Vercel + Render plutôt que VPS OVH dédié** parce que l'hébergement OVH actuel est mutualisé (Free Hosting, sans Node ni Python). Vercel + Render offrent des free tiers suffisants pour la phase test et un chemin de paiement raisonnable (~15-20€/mois) pour la phase commerciale. Migration vers OVH possible en V2 si l'usage le justifie.

**Alternatives écartées :**

- *Streamlit étendu pour V1* : faisable mais limité visuellement, et oblige à une réécriture en V2. Mauvais investissement temporel.
- *V1 = portage + extensions méthodologiques en même temps* : V1 fourre-tout, risque de délai et de qualité dégradée. Le découpage V1/V1.5 évite ce piège.
- *VPS OVH dédié dès V1* : hébergement actuel est mutualisé Free Hosting, ne supporte pas Node/Python/Postgres. Migrer vers un VPS est possible mais ajoute du setup infra qui n'apporte pas de valeur produit en phase test.
- *Auth complète V1 (compte permanent, mot de passe, OAuth)* : disproportionné pour un test commercial initial. Le lien magique est suffisant et plus simple à implémenter.

---

*Modèle d'entrée à respecter pour les futures décisions : identifiant D-NNN, titre court, date, décision, pourquoi, alternatives écartées.*
