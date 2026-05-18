# DECISIONS

Décisions structurantes du projet, journalisées avec leur motivation et les alternatives écartées.

Toute évolution de l'une de ces décisions doit être discutée et journalisée comme une nouvelle entrée datée, sans effacer l'historique.

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
