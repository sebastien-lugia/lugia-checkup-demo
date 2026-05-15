# CHANGELOG

Historique des modifications structurantes du projet, ordonnées par date décroissante.

---

## 2026-05-15 — V1.1 Vague 3.1 : second passage sur questionnaire et ton du rapport

Itération sur les 8 retours utilisateur post-Vague 3 (Q03 hors axe, Q05 trop direct, format hétérogène, Q10 inadapté solo, Q11 peu pro, synthèse pas analytique, ton des analyses trop direct, mention facturation électronique oubliée). Aucune nouvelle dépendance, aucun changement de schéma BDD.

### Questionnaire (interview_protocol v1.4)

- **Format "mot-clé — détail" homogène** appliqué à Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q13. Q01 conserve son format court (typologie close). Inscrit dans `global_rules_v1_1` comme 6ᵉ règle.
- **Q03 axe réaligné** sur le seul niveau de cadrage explicite : cadre écrit et appliqué (9), cadre oral (6), cadre écrit peu suivi (4), pas de cadre formel (3). L'option Vague 3 "découvertes surprenantes" (hors axe) disparaît du QCM.
- **Q05 reformulée** : free_text orienté tâches récurrentes hors temps de travail (au lieu de "hier soir" direct) ; frontière q05_c (bloc fin de journée au cabinet) vs q05_d (à la maison) désormais nette.
- **Q06_c reformatée** : "Un événement récent — j'ai eu besoin de prendre du recul sur mon organisation".
- **Q08 libellés homogénéisés** : "Tout continue — un dispositif…", "Un confrère assure — …", "Continuité partielle — …", "Fermeture — …".
- **Q10_b neutralisé** pour rester valide pour un médecin solo : "Liste de relance — je la tiens à jour (seul ou avec mon équipe)".
- **Q11 libellés professionnels** : "Alerte automatique — …", "Tri délégué — …", "Vérification régulière — …", "Vérification opportuniste — …".

### Synthèse "Votre situation aujourd'hui" — refonte

`src/templates.py::build_synthesis` est précédée d'une nouvelle phrase analytique `build_phrase_choc(answers)` qui sélectionne parmi quatre patterns selon le profil du répondant : effort personnel concentré, organisation informelle avec outils multiples, IA grand public au cœur du fonctionnement, ou équilibre tenu sur plusieurs points sensibles. La synthèse ne commence plus par une description ("Votre cabinet tourne. Vous en êtes seul aux commandes.") mais par une lecture du système ("Votre cabinet tient — mais il tient surtout par votre effort personnel, plus que par les dispositifs qui l'entourent.").

La mention de la facturation électronique de septembre est supprimée (`derive_enjeu_temporel` retirée). La recommandation italique est reformulée plus directe : "Le geste qui pèse le plus aujourd'hui est de…" au lieu de "La première chose qui vous aiderait est de prendre une vue d'ensemble…".

### Ton des analyses — adouci

`src/workstreams.py::chantier_ia` analyse : "L'IA arrivera dans votre cabinet d'une manière ou d'une autre" → reformulé en "L'IA générative est en train de devenir un outil courant pour beaucoup de professionnels de santé. Aborder le sujet maintenant, dans un cadre maîtrisé, permet de choisir vos usages plutôt que de les subir…".

`src/workstreams.py::chantier_absence` analyse : "Votre cabinet repose aujourd'hui sur votre seule mémoire. Aussi solide soit-elle, elle n'est pas transmissible. Un imprévu de plus de quelques jours expose vos patients à une rupture de service…" → reformulé en "Le fonctionnement actuel tient tant que vous êtes présent. Quelques règles écrites sur les cas courants (renouvellements, urgences, contacts critiques) permettent d'absorber une absence courte sans rupture."

### Vague 3.1b — compactage des analyses

Retour utilisateur immédiat sur Vague 3.1 : "trop de storytelling, reste concis et concret". Quatre analyses raccourcies à 2 phrases maximum, sans introduction générale type "Beaucoup de cabinets fonctionnent ainsi" :

- `chantier_flux` Q04+Q05 : 3 sub-phrases → 1 phrase factuelle.
- `chantier_ia` triggered : 3 phrases → 2 phrases ("Le besoin est légitime, le canal ne l'est pas.").
- `chantier_ia` non-triggered : 2 phrases longues → 2 phrases courtes.
- `chantier_absence` triggered : 3 phrases avec énumération → 2 phrases concrètes.

Mention "facturation électronique de septembre" dans le chantier IA supprimée et remplacée par "préparation des comptes-rendus structurés".

### Adaptation des templates aux nouveaux IDs

- Phrase Q03 dans `build_participants_summary` (templates.py) : trois branches selon q03_b (cadre oral), q03_c (cadre écrit peu suivi), q03_d (pas de cadre formel) — sémantique nouvelle de l'axe homogène.
- Phrase Q11_d : "le tri des résultats se fait sans rythme défini, ce qui peut laisser passer un signal" (au lieu de "au fil de l'eau, sans rythme garanti").

### Oracle Chateau v2.1

`resources/sample_answers_pchateau.md` v2.1 : Chateau passe Q03 de q03_c (santé 4) à q03_d "Pas de cadre formel — chaque cas est tranché au moment où il se présente" (santé 3). Scores facettes : Processus 3,33 (idem), **Participants 3,00** (vs 3,33 en Vague 3), Information 2,75 (idem). `scripts/seed_persona.py` aligné automatiquement avec les nouveaux libellés via reconstruction du bloc `ANSWERS`.

### ROADMAP V1.2+ — deux notes ajoutées

1. **Génération dynamique des options de QCM** selon Q01/Q02/Q07 (notamment Q10/Q11 adaptés au médecin solo) en V1.2. Pendant le temps de calcul LLM, un écran d'attente affichera un paragraphe explicatif Lugia (méthode, substitution-extension, garde-fous secret médical) — l'attente devient pédagogique. Fallback systématique sur les libellés statiques V1.1.

2. **Enjeux temporels sectoriels datés** (généralisation de `derive_enjeu_temporel` supprimée Vague 3.1) : `temporal_concerns.json` à V1.2+ qui injecte dans la recommandation ou dans une carte dédiée les échéances réglementaires actives (facturation électronique B2B/B2C, MSSanté, HDS, ROSP, etc.). Montre au répondant que le questionnaire connaît son calendrier métier.

### Modifié

- `resources/interview_protocol.json` v1.4 — 12 questions reformatées, Q03 axe homogénéisé, 6ᵉ règle globale ajoutée.
- `resources/interview_protocol.md` v1.4 — notes Vague 3.1, tableau Chateau mis à jour, calculs indicatifs revus.
- `resources/sample_answers_pchateau.md` v2.1 — Q03 q03_d, scores recalculés.
- `scripts/seed_persona.py` — labels et compléments alignés sur v1.4 du JSON.
- `src/templates.py` — `build_phrase_choc` ajoutée, `build_synthesis` refondue, `derive_enjeu_temporel` supprimée, phrases Q03 et Q11_d adaptées.
- `src/workstreams.py` — analyses IA et absence adoucies, mention facturation supprimée.
- `ROADMAP.md` — section "Génération dynamique des options de QCM" ajoutée en V1.2.

### Vérifications passées

- `python -m src.questions` : JSON et MD cohérents, 14 questions.
- Harness stdlib : scores Chateau conformes (Processus 3,33 / Participants 3,00 / Information 2,75), tous IDs choisis existants.
- IDs hardcodés `src/templates.py` et `src/workstreams.py` : tous valides.
- Audit ton hors docstrings/TOOL_CATEGORIES : aucune fuite (facturation, "L'IA arrivera", "pas transmissible", marques nominales).
- Syntaxe Python OK sur templates, workstreams, scoring, seed_persona, dump_report.

### À tester localement avant push

1. `python scripts/seed_persona.py --email sebastien+test@gmail.com --reset` (en venv local).
2. `python scripts/dump_report.py --list` puis `--id <N>` → relire `resources/sample_report.md` régénéré. Vérifier : pas de mention "facturation électronique", pas de "L'IA arrivera", pas de "votre seule mémoire pas transmissible", première phrase de synthèse analytique et non descriptive.
3. `npm run dev` côté web/ → parcourir le questionnaire : Q06 en QCM, Q08 et Q11 avec libellés "mot-clé — détail", Q10_b compatible solo, scores 3,33 / 3,00 / 2,75.
4. Push GitHub → Render/Vercel redéploient.

---

## 2026-05-15 — V1.1 Vague 3 : refonte du questionnaire (Q2 à Q11 + règles globales)

Refonte des 8 questions ciblées par le backlog utilisateur (Q02 à Q11 hors Q07/Q10/Q12 jugées OK) et inscription des règles globales V1.1 dans `resources/interview_protocol.md`. Aucune nouvelle dépendance, aucun changement de schéma BDD.

### Règles globales V1.1 ajoutées

1. 4 options principales + 1 option Autre (saisie inline, déjà livrée Vague 1).
2. Options factuelles, ancrées dans des situations observables.
3. Options mutuellement exclusives.
4. Mise en scène d'une situation réelle quand c'est possible.
5. Mode B et C parcimonieux — réservés aux questions où la réponse libre apporte un matériau verbatim irremplaçable.

Exception assumée : Q01 conserve 3 options principales + Autre (typologie close solo/groupe/MSP).

### Changements par question

- **Q02** — libellés normalisés, ajout du cas **"Moi-même (pas de secrétariat dédié)"** pour le libéral solo qui gère ses RDV.
- **Q03** — axe unique "niveau de cadrage explicite des règles". 4 options exclusives (cadre écrit / cadre oral figé / pas de cadre formel / écart régulier entre cadre et pratique). Pas de multi-sélection (D-021).
- **Q04** — passage **Mode B → Mode A**. La réponse libre faisait doublon avec le QCM.
- **Q05** — reste Mode B mais open_prompt refondu : récit concret de "hier soir / ce week-end". Le QCM met en scène 19h en fin de journée, options factuelles graduées.
- **Q06** — passage **Mode C → Mode A**. 4 typologies de motivation : curiosité IA, fatigue accumulée, événement déclencheur, anticipation.
- **Q08** — reformulation factuelle non anxiogène : "Quand vous prenez une semaine de congé…" au lieu de "Si vous deviez vous arrêter une semaine…". Option q08_d "Le cabinet ferme — c'est ce que je fais en pratique" (santé 3 au lieu de 2).
- **Q09** — axe factuel "nombre d'outils + double saisie" au lieu de "niveau d'intégration". 4 paliers chiffrés (un / deux sans double saisie / trois à cinq / plus de cinq). Suppression de toutes les marques nominales.
- **Q11** — passage **Mode B → Mode A**. Options centrées sur l'organisation actuelle, exclusives ; l'incident passé n'est plus dans le QCM mais peut figurer en complément libre.

Q13 jugée OK ; mineure : généralisation "ChatGPT ou similaire" → "IA grand public" dans les libellés (cohérence Vague 2 lite).

### Distribution de modes V1.1

Avant : 8 A / 4 B / 2 C. Après : **11 A / 2 B / 1 C**. L'alternance se dégrade volontairement au profit de la cohérence factuelle. Mode B conservé sur Q05 et Q13 (matériau verbatim utile), Mode C conservé sur Q14 uniquement.

### Adaptation du moteur de rapport

- `src/templates.py` : phrases sur Q08_d et Q11_d réécrites pour matcher la nouvelle sémantique. Q08_d ne dit plus "personne ne saurait" mais "Pendant vos congés, le cabinet ferme — c'est la solution que vous avez retenue". Q11_d ne dit plus "comme cela s'est produit il y a quelques mois" (incident inventé) mais "le tri des résultats se fait au fil de l'eau, sans rythme garanti".

### Oracle Chateau V1.1

- `resources/sample_answers_pchateau.md` réécrit en v2.0 : 4 réponses ajustées (Q06 q06_c, Q08 q08_d nouveau sens, Q09 q09_d nouveau palier, Q11 q11_c au lieu de q11_d).
- Scores attendus : **Processus 3,33 ; Participants 3,33 ; Information 2,75**. Information et Processus stables vs V1.0 par recalibrage (Q09 baisse de 4 à 2, Q11 monte de 3 à 5, équilibre). Participants remonte légèrement (Q08 passe de 2 à 3).
- `scripts/seed_persona.py` aligné : labels, free_text, complément réécrits, suppression de toute mention nominale ChatGPT/Maiia/Doctolib/Lifen/Mailiz dans la base seedée.

### Modifié

- `resources/interview_protocol.json` v1.3 — refonte 8 questions + section `global_rules_v1_1`.
- `resources/interview_protocol.md` v1.3 — règles globales, nouvelle distribution, nouveau tableau Chateau.
- `resources/sample_answers_pchateau.md` v2.0.
- `scripts/seed_persona.py` — labels et compléments alignés.
- `scripts/dump_report.py` — structure de chantier alignée sur Vague 2 lite (4 sections : compris / révèle / échappe / proposons). Régression Vague 2 lite rattrapée pendant Vague 3 (le script lisait encore le champ `obtient` supprimé).
- `src/templates.py` — phrases Q08_d et Q11_d corrigées.
- `DECISIONS.md` — D-021 ajoutée (refonte questionnaire V1.1 Vague 3 + dérogation au principe d'alternance).

### Vérifications passées

- `python -m src.questions` (cohérence JSON ↔ MD) : OK, 14 questions.
- Harness stdlib : tous les IDs choisis par Chateau existent, scores facettes conformes (3,33 / 3,33 / 2,75), aucune marque nominale dans les labels.
- Audit IDs hardcodés dans `src/templates.py` et `src/workstreams.py` : tous valides, aucune référence morte.
- Syntaxe Python OK sur templates, workstreams, scoring, seed_persona, dump_report.

### En attente de validation utilisateur

À tester localement par Sébastien (le sandbox Linux n'a pas accès au venv macOS) :

1. `python scripts/seed_persona.py --email sebastien+test@gmail.com --reset` → réseed Chateau V1.1 dans SQLite local.
2. `python scripts/dump_report.py --list` puis `--id <N>` → relire le sample_report généré et vérifier qu'aucune phrase ne mentionne d'incident inventé sur Q11, ni de scénario anxiogène sur Q08.
3. `npm run dev` côté web/, parcourir le questionnaire : vérifier que Q06 affiche bien un QCM (et non un textarea) et que l'option Autre se saisit inline partout.
4. Vérifier que les scores affichés sur la page de résultats correspondent à 3,33 / 3,33 / 2,75 (ou aux arrondis qu'utilise le scoring).
5. Si tout est conforme, push GitHub → Render et Vercel redéploient.

---

## 2026-05-15 — V1.1 Vague 2 lite : nettoyage structurel du moteur de rapport

Refonte de `src/templates.py` et `src/workstreams.py` pour produire un rapport plus directement utilisable par un médecin, sans modifier le questionnaire (Vague 3 reste à venir).

### Vulgarisation du langage

Approche : réécriture contextuelle de chaque passage jargonneux, pas substitution mot-à-mot. Le sens prime sur le terme.

Exemples : "flux parallèle critique" → "demandes en direct qui s'empilent" (ou "surcharge particulière" selon contexte), "cartographier" → "recenser" / "lister", "leviers d'optimisation" → "pistes d'allègement", "conformité HDS" → "conforme au secret médical", "anonymisation manuelle" → "anonymiser à la main", "dispositif de continuité" disparaît au profit de "ce qui est prévu pour vos absences".

Ton ajusté : factuel non-dramatique, jamais accusateur. Suite à retour utilisateur sur premières réécritures trop sèches.

### Suppression des citations nominatives d'outils

Nouvelle constante `TOOL_CATEGORIES` qui mappe les marques détectées (Maiia, Doctolib, Lifen, etc.) vers des catégories génériques (logiciel métier, plateforme de rendez-vous, outil d'envoi de courriers, etc.). `derive_outils_principaux` retourne désormais "votre logiciel métier et votre plateforme de rendez-vous" au lieu de "Maiia et Doctolib". Idem pour ChatGPT → "outil d'IA grand public".

Les marques restent détectées en interne pour adapter les phrases, mais ne sont jamais imprimées dans le rapport.

### Refonte de la structure des chantiers

4 sections au lieu de 4, mais réaffectées : la section "Ce que vous obtenez" est fusionnée dans "Ce que nous vous proposons" (la proposition se termine par le bénéfice attendu), libérant un slot pour la nouvelle section "Ce que ça révèle".

| Position | Avant V1.1 | Après V1.1 lite |
|---|---|---|
| 1 | Ce que le check-up a vu | Ce que nous avons compris |
| 2 | Ce qu'il ne peut pas confirmer seul | **Ce que ça révèle** (nouveau) |
| 3 | Ce que Lugia propose | Ce qui nous échappe encore |
| 4 | Ce que vous obtenez | Ce que nous vous proposons (avec bénéfice intégré) |

Côté backend, chaque chantier expose maintenant les champs `vu`, `analyse`, `pas_confirmer`, `propose` (l'ancien `obtient` est fusionné dans `propose`).

### Refonte de la synthèse

- "Vous avez bâti une organisation efficace : ..." (formulation incohérente pour un médecin solo) supprimée. Remplacée par "Au quotidien, vous vous appuyez sur ..." (factuel, sans jugement).
- Ouverture adaptée au type de cabinet : solo libéral porte tout → "Vous en êtes seul aux commandes" (factuel, pas accusateur). Cabinet de groupe avec tout passe par le médecin → "tout finit par passer par vous".
- Recommandation italique conservée, vocabulaire vulgarisé ("environnement conforme au secret médical" au lieu de "conforme HDS").

### Q14 reportée en V1.2

Tentative d'intégration de la Q14 ("ce que vous aimeriez approfondir") via heuristique textuelle pure rejetée — trop fragile, risque de produire un non-sens. Q14 attend le SLM en V1.2 (note ajoutée à D-020).

### Modifié

- `src/templates.py` — refonte complète.
- `src/workstreams.py` — refonte complète, structure 4 sections avec analyse.
- `web/lib/api.ts` — type `Workstream` mis à jour (champ `analyse` ajouté, `obtient` supprimé, `propose` enrichi).
- `web/app/resultats/page.tsx` — `ChantierCard` affiche les 4 nouvelles sections.
- `DECISIONS.md` D-020 — note explicite du report de Q14.

### En attente de validation utilisateur

Tester sur diagnostic.lugia.fr ou en local (via seed_persona). Vérifier que :

1. La synthèse ne mentionne plus "Maiia", "Doctolib", "ChatGPT", "organisation efficace".
2. Les 3 cartes facettes "Parcours patient" / "Équipe et secrétariat" / "Outils et dossiers" affichent des descriptions non-jargonneuses.
3. Chaque carte chantier affiche 4 sections dans l'ordre : "Ce que nous avons compris" → "Ce que ça révèle" → "Ce qui nous échappe encore" → "Ce que nous vous proposons" (avec bénéfice à la fin).
4. Le ton est factuel et respectueux, jamais accusateur.

---

## 2026-05-14 — Backend : détection de l'Origin pour les liens magiques

Le backend FastAPI détecte désormais le header `Origin` de la requête `/auth/request-link` et l'utilise (s'il est dans l'allowlist) pour construire le lien magique. Plus besoin de modifier manuellement la variable `FRONTEND_URL` sur Render à chaque bascule entre tests local et prod.

### Allowlist en V1.1

- `http://localhost:3000` (dev local)
- `https://diagnostic.lugia.fr` (prod)
- `https://*.vercel.app` (previews Vercel)

### Sécurité

Allowlist explicite pour empêcher qu'un attaquant force le backend à envoyer un lien magique pointant vers un domaine arbitraire. Fallback systématique sur `FRONTEND_URL` env var si l'Origin n'est pas reconnu (cas curl, hors navigateur, etc.).

### Modifié

- `backend/main.py` — ajout import `Request`, ajout helper `_resolve_frontend_url`, constante `ALLOWED_FRONTEND_ORIGINS`, signature de `_send_magic_link_email` qui prend désormais `frontend_url` en paramètre, endpoint `/auth/request-link` qui passe `request` puis l'URL résolue.

---

## 2026-05-14 — Backlog V1.1 reçu, cadre acté

Première vague de retours utilisateurs reçue de Sébastien sous forme de PDF structuré (40+ retours répartis sur en-tête, page de login, accueil, questionnaire, résultats, prochaine étape). Lecture critique en session, 7 challenges proposés, 7 réponses utilisateur intégrées.

### Décidé

- **D-020** acté : méthodologique enrichi (50+ variantes) en V1.1 comme socle, SLM hybride (Ollama dev + cloud API prod) en surcouche V1.2 avec fallback systématique sur templating. Méthodologique reste backup permanent même après SLM.
- V1.1 structurée en 3 vagues : quick wins éditoriaux (1-2j), méthodologique enrichi (3-5j), refonte questionnaire (4-7j). Total estimé 8-14 jours de travail concentré.
- Pré-questionnaire psychologique (3 profils répondant) déplacé en V1.5.
- Second questionnaire d'approfondissement avec effet wow (PDF, dessin organisationnel, pyramide, analyse cohérences) déplacé en V1.5, à développer en environnement de test.
- Modèle commercial 1-chantier-gratuit / 3-chantiers-payants déplacé en V2 (dépend Stripe).
- v1-final reste à poser pour figer la version pré-retours.

### Mis à jour

- `DECISIONS.md` D-020 (nouvelle décision).
- `ROADMAP.md` insertion V1.1, V1.2, compléments V1.5 (pré-questionnaire psychologique, second questionnaire wow).
- `TODO.md` plan V1.1 détaillé en 3 vagues.

---

## 2026-05-13 — V1 close. Cap sur les 4 tracks parallèles.

V1 est figée sur le tag `v1-final`. Le démonstrateur technique cesse d'être le seul chantier ; à partir de maintenant, le projet Lugia se déploie sur quatre tracks parallèles (D-019) :

- **Démonstrateur technique** — V1.5 puis V2, dans ce repo.
- **Communication** — identité visuelle, page `/qui-est-lugia`, site `lugia.fr`, slides.
- **Marché et clients** — V1-7 et tests prospects, étude de marché, fiches prospects.
- **Opérationnel** — méthode, scoring avancé, templates de livrables clients.

Chaque track est traité dans sa propre conversation Claude, avec un prompt d'ouverture standardisé dans `meta/`. La mémoire transversale reste portée par les fichiers `.md` du repo (MASTER_PROMPT, DECISIONS, ROADMAP, CHANGELOG, TODO).

Cette conversation Claude dédiée au démonstrateur, ouverte le 12 mai 2026 pour produire V0, peut maintenant être close. La suite du développement technique se fera dans une nouvelle conversation, amorcée avec `meta/PROMPT_OUVERTURE_DEMONSTRATEUR.md`.

### Ajouté

- `meta/PROMPT_OUVERTURE_DEMONSTRATEUR.md`, `meta/PROMPT_OUVERTURE_COMMUNICATION.md`, `meta/PROMPT_OUVERTURE_MARCHE.md`, `meta/PROMPT_OUVERTURE_OPERATIONS.md` — prompts d'ouverture pour les nouvelles conversations Claude par track.
- `meta/README.md` — mode d'emploi de ces prompts.
- `DECISIONS.md` D-019 — formalisation de l'organisation multi-tracks et multi-conversations.

---

## 2026-05-13 — Phase V1-8 : RGPD minimale intégrée à V1

### Décision

D-018 actée : on intègre un socle RGPD minimum dans V1 plutôt que de le différer en V2. Sans mentions légales, sans politique de confidentialité, sans droit à l'effacement, V1-7 (test client réel face à un médecin) ne serait pas défendable.

### Ajouté

- `src/db.py` — helper `delete_user_data(email)` qui purge interview + answers + facet_scores + workstreams + auth_tokens + sessions associés à un email, en une seule transaction. Suppressions explicites (pas de dépendance au CASCADE qui est inopérant par défaut en SQLite).
- `backend/main.py` — endpoint `DELETE /me` (protégé par auth) qui appelle `delete_user_data(email)` et retourne `{ok, deleted: { interviews, answers, ... }}`.
- `web/lib/api.ts` — fonction `deleteAccount()` exposant l'endpoint.
- `web/components/Footer.tsx` — pied de page commun (server component, sans état) avec liens vers `/legal`, `/confidentialite` et mailto contact.
- `web/app/legal/page.tsx` — Mentions légales. Éditeur = Sébastien Boncoeur, particulier. Contact email uniquement (France, pas d'adresse postale précise). Hébergeurs détaillés (Vercel, Render, Resend, OVH). Note sur la propriété intellectuelle et la loi française.
- `web/app/confidentialite/page.tsx` — Politique de confidentialité en 11 sections : responsable, données collectées (email + réponses + métadonnées), finalités, base légale (consentement art. 6.1.a RGPD), destinataires (sous-traitants), transferts hors UE, durées de conservation, droits utilisateur (accès, rectification, effacement, opposition, portabilité, CNIL), cookies/localStorage (mention "pas de cookies tiers"), sécurité, modifications.
- `web/app/compte/page.tsx` — Page authentifiée : affiche l'email courant, rappelle les données stockées, propose la suppression définitive avec confirmation par saisie du mot `SUPPRIMER`. Après succès, écran "Compte supprimé" + retour login.

### Modifié

- `web/app/layout.tsx` — intégration du `<Footer />` au RootLayout pour qu'il apparaisse automatiquement sur toutes les pages.
- `web/components/AppHeader.tsx` — l'email affiché en haut à droite est désormais cliquable et mène vers `/compte`. Conserve le bouton "Se déconnecter".

### Hors périmètre V1-8 (différé)

- DPA signés avec Vercel/Render/Resend — à régulariser avant tout contrat commercial.
- Bandeau cookies — non requis tant qu'on n'utilise que localStorage technique.
- Endpoint d'export de données (portabilité) — droit annoncé dans la politique de confidentialité, traité par email sur demande pour V1.
- Relecture avocat RGPD — recommandée avant V1-7 commercial mais non bloquante pour test prospect informel.

### En attente de validation utilisateur

Tester localement après `npm install` (rien de nouveau côté deps) :

1. Backend : `uvicorn backend.main:app --reload` → `/docs` doit afficher `DELETE /me` dans la section auth.
2. Frontend : `npm run dev` → vérifier `/legal`, `/confidentialite` accessibles **sans** être connecté. Footer visible sur toutes les pages.
3. Une fois connecté : cliquer l'email en haut à droite → arrive sur `/compte`. Tester la confirmation `SUPPRIMER` puis la suppression effective (utiliser un email de test).
4. Vérifier en base via `/docs` GET `/auth/me` après suppression : doit retourner 401 (session purgée).

---

## 2026-05-13 — V1 complète : check-up préventif en ligne sur diagnostic.lugia.fr

L'ensemble du parcours est désormais accessible en production via `https://diagnostic.lugia.fr`. Frontend Next.js sur Vercel, backend FastAPI sur Render, Postgres provisionné, auth par lien magique avec emails Resend depuis le domaine `lugia.fr` vérifié. Le check-up reproduit à l'identique le périmètre fonctionnel V0 (14 questions, 3 modes A/B/C, 3 facettes scorées, 3 chantiers paramétrés, recommandation prochaine étape), mais accessible à distance, sans installation locale.

Note : V1 sera figée par le tag `v1-final` **après V1-8** (RGPD minimal), pas après V1-6 comme initialement prévu. Reste à valider V1-7 : premier test client en condition réelle. Les extensions méthodologiques (9 facettes, pyramide animée, section "Vos mots", PDF export) restent inscrites en V1.5 et V2 dans la ROADMAP.

---

## 2026-05-13 — Phase V1-6 : déploiement frontend Vercel — VALIDÉE

Frontend Next.js publié sur Vercel avec Root Directory `web/`, Framework Preset Next.js, env var `NEXT_PUBLIC_API_URL` pointant sur l'API Render. Un bug de peer dependency corrigé en passant : `eslint` bumpé de `^8.57.0` à `^9.0.0` pour respecter le peer requirement de Next.js 16 (le `npm install` Vercel est strict là où le `npm install` local tolérait grâce au lockfile pré-résolu).

La page placeholder de V1-1 est remplacée par le vrai frontend. `https://diagnostic.lugia.fr` redirige correctement sur `/login` si pas de session. Test bout en bout réussi : email saisi → lien magique reçu depuis `[email protected]` → clic vers `diagnostic.lugia.fr/auth?token=…` → redirection sur l'accueil connecté → check-up démarré, quitté, repris → tout est ok.

V1 (portage technique de V0 sur le web) est désormais close. Tag git `v1-final` à poser.

---

## 2026-05-13 — Phase V1-5c : frontend auth — VALIDÉE

### Ajouté

- `web/lib/auth.ts` — helpers de session côté client : `getSessionToken`, `setSession`, `clearSession`, `hasSession`, `getSessionEmail`. Tous SSR-safe (gardes `typeof window !== "undefined"`). Hook `useRequireAuth` qui redirige vers `/login` si pas de session et retourne un booléen `ready` pour gater le rendu des pages protégées.
- `web/app/login/page.tsx` — formulaire email simple (Lugia, max-w-md), bouton "Recevoir mon lien d'accès" qui appelle `POST /auth/request-link`. États idle / sending / sent / error. Message de confirmation après envoi avec rappel "valable 30 minutes" et possibilité de réessayer.
- `web/app/auth/page.tsx` — page d'atterrissage du lien magique. Lit `?token=...`, purge toute session existante, appelle `POST /auth/verify-token`, stocke `session_token` et `email` en localStorage, redirige sur `/`. Gère token absent et token invalide/expiré avec lien vers `/login` pour redemander.
- `web/components/AppHeader.tsx` — bandeau discret en haut à droite des pages protégées : email courant + lien "Se déconnecter". Best-effort sur `POST /auth/logout` (déconnexion locale même si backend injoignable).

### Modifié

- `web/lib/api.ts` — la fonction `request<T>` ajoute désormais automatiquement le header `Authorization: Bearer ${session_token}` quand un token est présent. Sur 401 avec token, purge la session et redirige vers `/login` (token expiré ou révoqué). Ajout des endpoints `requestMagicLink`, `verifyMagicToken`, `authMe`, `logout`.
- `web/app/page.tsx`, `web/app/checkup/page.tsx`, `web/app/resultats/page.tsx` — chaque page protégée appelle `useRequireAuth()` en tête, gate son `useEffect` de fetch sur `isAuthReady`, et affiche `<AppHeader />` une fois le rendu autorisé.

### Validation

Parcours complet vérifié en local contre le backend Render distant. Redirection sur `/login` à l'ouverture, lien magique reçu, échange token → session, parcours check-up → résultats, déconnexion. Le frontend est désormais prêt pour le déploiement Vercel (V1-6).

---

## 2026-05-13 — Phase V1-5b : envoi réel d'email via Resend — VALIDÉE

Domaine `lugia.fr` vérifié sur Resend (région Ireland eu-west-1). Trois enregistrements DNS ajoutés chez OVH : DKIM (`resend._domainkey`), MX `send` (priorité 10 vers `feedback-smtp.eu-west-1.amazonses.com`), SPF TXT sur `send`. Vérification Resend : 10 minutes après ajout des entrées.

Variables d'environnement ajoutées sur Render Web Service `lugia-checkup-api` : `RESEND_API_KEY`, `RESEND_FROM_EMAIL=Lugia <[email protected]>`, `FRONTEND_URL=https://diagnostic.lugia.fr`.

Code V1-5a (branche `main`) poussé sur GitHub en deux commits propres : `V1-4: frontend Next.js` et `V1-5a: backend auth lien magique`. Render a redéployé automatiquement avec installation de `resend>=2.0`.

Test bout en bout validé : `POST /auth/request-link` sur l'API distante avec une vraie adresse email → email Lugia reçu en boîte de réception Gmail en quelques secondes (DKIM OK, signature visible). Sujet, design noir, mention "valable 30 minutes" et bouton "Accéder à mon check-up" rendus correctement. Le clic sur le bouton renvoie un 404 attendu (le `/auth` côté Next.js sera implémenté en V1-5c et déployé en V1-6).

### Inscrit pour suite

- V1-5c — frontend auth (pages `/login` et `/auth`, propagation Bearer token).
- V1-6 — déploiement frontend Next.js sur Vercel (remplacement de la page placeholder V1-1).

---

## 2026-05-13 — Conscience explicite des limites du scoring V0 et trajectoire V1+

### Ajouté

- `DECISIONS.md` D-016 — Limites assumées du scoring V0 et trajectoire V1+. Acte la conscience collective des 5 biais (effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle).
- `ROADMAP.md` section "Scoring V1+ — vers une moyenne pondérée avec conditions et Flags". Détaille pondération avec conditions, scores planchers (K.O. critère), système de Flags critiques (FLUX_ANARCHIQUE, SURCHARGE_ADMIN, DEPENDANCE_UNITAIRE, DELEGATION_OPAQUE, NON_CONFORMITE_HDS, DEFAUT_TRACABILITE), catégories Expert (Efficience & Temps Médical, Résilience & Coordination, Sécurité & Gouvernance Numérique), Cartouche de Diagnostic comme format de présentation, architecture multi-secteur.

### Modifié

- `resources/modeling_scoring.md` section 7 — refonte pour expliciter les 5 limites structurelles avec leur impact concret en V0, et la compensation partielle par la narration des templates.

### Motif

Retour utilisateur posant explicitement les 5 limites de la moyenne brute (effet masquage, absence de hiérarchie, dilution, signaux faibles, injustice solo) et proposant une trajectoire V1 détaillée. La position V0 (moyenne brute simple) reste valide comme point de départ démonstratif, mais doit s'accompagner d'une conscience explicite des limites pour ne pas devenir un standard pérenne.

---

## 2026-05-13 — Phase V1-3b : Postgres provisionné et lié à l'API — VALIDÉE

Base Postgres `lugia-checkup-db` créée sur Render Free tier, variable d'environnement `DATABASE_URL` ajoutée au Web Service `lugia-checkup-api`. Test de persistance validé : une interview créée avant un cold start est retrouvée après le réveil du service. Le disque éphémère SQLite est résolu.

Note pour mémoire : Render Free Postgres expire après 90 jours. Bascule en plan Starter (~7$/mois) ou rotation manuelle à prévoir avant le 11 août 2026.

---

## 2026-05-13 — Phase V1-5a : backend auth lien magique

### Ajouté

- `src/db.py` — tables `auth_token` et `session`, column `email` ajoutée à `interview` via migration `_ensure_email_column_on_interview` (idempotente, SQLite et Postgres). Helpers `create_auth_token`, `verify_auth_token` (one-time use avec marquage), `create_session`, `get_session_email`, `revoke_session`. Constantes `MAGIC_LINK_TTL_MINUTES=30`, `SESSION_TTL_DAYS=30`.
- `backend/main.py` — endpoints auth : `POST /auth/request-link` (génère token + envoie email ou print console), `POST /auth/verify-token` (consomme token et crée session), `GET /auth/me`, `POST /auth/logout`. Middleware `get_current_user_email` via `HTTPBearer`. Tous les endpoints `/interviews/*` sont désormais protégés et filtrent par propriétaire (`_assert_user_owns_interview`). Helper `_send_magic_link_email` avec fallback console si `RESEND_API_KEY` n'est pas configuré.
- `backend/requirements.txt` — ajout de `resend>=2.0` (SDK Python officiel pour Resend).

### Endpoint public (pas d'auth)

`GET /protocol` reste public car il sert juste les questions du questionnaire — pas de donnée utilisateur.

### Backward compat

- La colonne `email` sur `interview` est nullable. Les interviews créées avant V1-5a (et celles créées par V0 Streamlit local ou par les scripts `seed_persona.py` qui appellent `create_interview()` sans email) restent accessibles à n'importe quel user authentifié (le helper `_assert_user_owns_interview` traite `email=None` comme legacy).
- V0 Streamlit local fonctionne toujours (utilise `src/db.py` directement, pas l'API authentifiée).

### Mode dev console

Si `RESEND_API_KEY` n'est pas défini, le lien magique est imprimé dans la console uvicorn au lieu d'être envoyé par email. Permet de tester V1-5a en local sans avoir configuré Resend.

### Validée le 13 mai 2026

Les 8 vérifications sur `/docs` sont passées : request-link, lien magique en console, verify-token, Authorize, /auth/me, POST /interviews, GET /interviews/active, test négatif après logout. Le non-envoi d'email à une adresse réelle est attendu en mode console (RESEND_API_KEY non défini). V1-5b prendra le relai pour activer l'envoi réel.

---

## 2026-05-13 — Phase V1-4c : page résultats Next.js

### Ajouté

- `web/app/resultats/page.tsx` — page résultats Next.js. Appelle `GET /interviews/{id}/report` pour récupérer toutes les données (synthèse, facettes scorées, chantiers paramétrés, prochaine étape recommandée), puis les affiche selon la structure du wireframe V0-1 iter 2 : en-tête, synthèse en serif sur fond beige clair avec barre bleue à gauche et italiques colorées sur les `<em>`, trois cartes facettes avec score + barre + résumé, trois cartes chantiers en grille 2×2 avec les 4 parties, trois cartes prochaine étape avec mise en avant de la recommandation. Suspense boundary pour le `useSearchParams`.
- `web/app/globals.css` — règle `.lugia-synthesis em { font-style: italic; color: #185fa5; }` pour styliser les `<em>` du HTML retourné par le backend.

### Composants extraits

`FacetCard`, `ChantierCard`, `ChantierBlock`, `NextStepCard` sont définis localement dans le fichier de la page. Si V1.5 nécessite de les réutiliser ailleurs, ils seront extraits dans `web/components/`.

### Parcours bout en bout fonctionnel

Accueil → Commencer → 14 questions → Merci → Voir les résultats → page résultats complète avec les données réelles. Tout le flux V0 est désormais reproduit en Next.js + FastAPI + Postgres.

### En attente de validation utilisateur avant Phase V1-5 (auth lien magique).

---

## 2026-05-13 — Phase V1-4b iter 2 : reprise depuis l'accueil

### Modifié

- `web/app/page.tsx` — au chargement de l'accueil, appel à `getActiveInterview()` pour détecter une éventuelle session in_progress en base. Si présente, deux boutons s'affichent : "Reprendre votre check-up" (primary, route vers `/checkup?interview=N`) et "Commencer un nouveau check-up" (secondary, crée une nouvelle session). Une mention discrète indique la date de création et la position dans le questionnaire (par exemple "question 7 sur 14"). Si aucune session active, seul le bouton "Commencer le check-up" est affiché, comme avant.

### Motif

Le bouton "Quitter et reprendre plus tard" de la page interview ramenait l'utilisateur à l'accueil mais aucun moyen visuel de reprendre la session sauvegardée n'était proposé. La V0 Streamlit avait cette logique, elle n'avait pas été portée en V1-4a. C'est désormais corrigé.

### Note

Si le frontend pointe vers une API distante (production), l'accueil détecte les sessions in_progress de cette API. Si le frontend tourne en local et pointe vers `localhost:8000`, l'accueil détecte les sessions in_progress du backend local. Les deux bases sont distinctes — c'est attendu.

---

## 2026-05-13 — Phase V1-4b : page interview avec modes A/B/C

### Ajouté

- `web/components/CheckupWidgets.tsx` — trois composants React typés (`ModeAWidget`, `ModeBWidget`, `ModeCWidget`) qui couvrent les trois modes d'interaction du questionnaire, plus une fonction `isAnswerComplete` qui valide selon le mode.
- `web/app/checkup/page.tsx` — page interview complète : chargement du protocole et de l'état de l'interview, préremplissage des widgets depuis la base via `listAnswers`, navigation Précédent / Suivant / Quitter, sauvegarde de chaque réponse à chaque clic Suivant, complétion automatique de l'interview au dernier Suivant et redirection vers `/resultats`, écran "Merci" si l'utilisateur revient sur l'interview après l'avoir terminée. Barre de progression, pill de facette, gestion d'erreur réseau.
- Suspense boundary autour du contenu de la page pour gérer le `useSearchParams` Next.js App Router.

### En attente de validation utilisateur avant Phase V1-4c (page résultats).

---

## 2026-05-13 — Phase V1-4a : setup Next.js frontend

### Ajouté

- `web/package.json` — déclaration de l'app Next.js 14, React 18, TypeScript 5, Tailwind 3.4. Scripts dev, build, start, lint.
- `web/tsconfig.json` — config TypeScript en mode strict avec alias `@/*`.
- `web/next.config.js`, `web/postcss.config.js`, `web/tailwind.config.ts` — configurations standards Next.js + Tailwind.
- `web/.gitignore` — exclusion node_modules, .next, .env.local.
- `web/.env.local.example` — template pour la variable `NEXT_PUBLIC_API_URL`.
- `web/app/layout.tsx`, `web/app/page.tsx`, `web/app/globals.css` — root layout, page d'accueil reproduisant le wireframe V0-1 iter 2 (promesse, deux cartes "attendre / garde-fous", bouton "Commencer"), styles Tailwind avec palette Lugia.
- `web/lib/api.ts` — client API typé avec fonctions pour appeler tous les endpoints du backend FastAPI (createInterview, getActiveInterview, getProtocol, saveAnswer, getReport, etc.).

### Palette Tailwind Lugia

Couleurs nommées dans `tailwind.config.ts` (lugia-bg, lugia-text, lugia-accent, etc.) pour réutiliser le système chromatique du wireframe V0-1.

### Note

L'ancien `web/index.html` (placeholder V1-1) sera écrasé par le build Next.js. Il peut être supprimé manuellement après confirmation que Next.js fonctionne.

### En attente de validation utilisateur avant Phase V1-4b.

---

## 2026-05-13 — Phase V1-3a : abstraction SQLAlchemy SQLite/Postgres

### Modifié

- `src/db.py` — refactor complet vers SQLAlchemy 2.0 Core. Déclaration du schéma via `MetaData` + `Table`, helpers (`create_interview`, `get_interview`, `get_answers`, `save_answer`, etc.) retournent désormais des `dict[str, Any]` (compatible avec les consommateurs qui font `row["key"]`). Détection du backend via la variable d'environnement `DATABASE_URL` : si présente et de la forme `postgres://` ou `postgresql://`, utilise Postgres ; sinon fallback sur SQLite local. La conversion `postgres://` → `postgresql://` (héritage Render) est gérée automatiquement.
- `scripts/seed_persona.py::reset_database` — utilise `db.get_engine()` et `text()` au lieu de `db.get_connection()`.
- `scripts/dump_report.py::_latest_interview_id` et `_list_interviews` — idem, adaptés à SQLAlchemy.
- `requirements.txt` (racine) — ajout de `sqlalchemy>=2.0` (utilisé par V0 Streamlit local et les scripts).
- `backend/requirements.txt` — ajout de `sqlalchemy>=2.0` et `psycopg2-binary>=2.9` (driver Postgres pour la production).

### Compatibilité descendante

Le schéma SQLAlchemy correspond exactement au schéma SQLite existant après V0-3b. `metadata.create_all()` est idempotent et ne touche pas aux tables existantes. Les bases SQLite locales antérieures restent utilisables sans migration.

### En attente de validation utilisateur avant Phase V1-3b (provisionnement Postgres sur Render).

---

## 2026-05-13 — Phase V1-2a : backend FastAPI minimal

### Ajouté

- `backend/__init__.py`, `backend/main.py`, `backend/requirements.txt` — application FastAPI qui expose les modules `src/*` de V0 via une API REST. Endpoints : health, protocol, gestion d'interviews, sauvegarde de réponses, calcul de scores, génération de rapport. CORS permissif en V1-2 (sera restreint en V2). Documentation Swagger UI auto-générée à `/docs`.

### Architecture

- `backend/main.py` ajoute la racine du projet à `sys.path` pour importer `src/*`. Aucune réécriture de code métier — réutilisation intégrale de `db`, `scoring`, `templates`, `workstreams`, `questions`.
- V0 Streamlit reste fonctionnel en parallèle (les deux applications partagent la même base SQLite locale).

### En attente de validation utilisateur avant Phase V1-2b (déploiement Render).

---

## 2026-05-13 — Phase V1-1 : infrastructure déployée

### Validé par l'utilisateur

- Dépôt `lugia-checkup-demo` poussé sur GitHub (privé), incluant le tag `v0-final`.
- Vercel connecté au repo, déploiement automatique du contenu de `web/` à chaque push sur main.
- DNS OVH configuré : CNAME `diagnostic` → `aed4c8d94f10e709.vercel-dns-017.com` (cible Vercel spécifique au projet). HTTPS actif via Let's Encrypt automatique de Vercel.
- `https://diagnostic.lugia.fr` accessible et affiche la page placeholder.
- Compte Resend créé, API key stockée en sécurité (utilisation en V1-5 pour les liens magiques).
- Compte Render créé et lié à GitHub (utilisation en V1-2b pour le backend).

### Ajouté

- `web/index.html` — page placeholder "Bienvenue sur la zone de test Lugia". Servie par Vercel sur `diagnostic.lugia.fr`. Inclut `<meta name="robots" content="noindex, nofollow">` pour ne pas être indexée par les moteurs de recherche.

### Note technique pour le futur

Si le DNS doit être reconfiguré : la cible CNAME exacte fournie par Vercel pour ce projet est `aed4c8d94f10e709.vercel-dns-017.com.`. La cible générique `cname.vercel-dns.com.` ne fonctionne plus pour les nouveaux projets Vercel — chaque projet a sa cible spécifique communiquée lors de l'ajout du domaine.

---

## 2026-05-13 — Phase V1-0 : cadrage V1 portage technique pur

### Décision majeure

D-017 inscrite dans `DECISIONS.md` : V1 est strictement un portage technique de V0 vers une architecture web distante (Next.js + FastAPI + Postgres, hébergée sur Vercel + Render, accessible via `diagnostic.lugia.fr` avec auth par lien magique). Aucune nouvelle fonctionnalité produit en V1. Les extensions méthodologiques (9 facettes, animations pyramide, "Vos mots", export PDF) glissent en V1.5. La conformité commerciale et l'auth moderne attendent V2.

### Modifié

- `MASTER_PROMPT.md` — version 3.0. Section 5 (périmètre) restructurée en V0 / V1 / V1.5 / V2 / Au-delà. Section 6 (architecture) divisée entre stack V0 (Streamlit + SQLite, fonctionnel en local) et stack V1 (Next.js + FastAPI + Postgres + Vercel + Render). Section 11 enrichie avec les huit phases V1 (V1-0 à V1-7) et leurs critères d'acceptation.
- `ROADMAP.md` — restructuration majeure. Quatre jalons distincts : V0 livrée, V1 portage en cours, V1.5 extension méthodologique, V2 montée commerciale. Section "Conformité réglementaire pré-commercialisation" ajoutée en V2.
- `DECISIONS.md` — D-017 ajoutée (cadrage V1 complet).

### À faire côté utilisateur

- Poser le tag git `v0-final` sur l'état actuel du dépôt (commande fournie en réponse).

### En attente de validation utilisateur avant Phase V1-1.

---

## 2026-05-13 — V0 complète : test manuel validé, limites éditoriales inscrites en V1

### Validé par l'utilisateur

- Test bout en bout réalisé avec des réponses manuelles (pas seulement le persona). Parcours fonctionnel, base SQLite cohérente, rapport régénérable à la volée via `scripts/dump_report.py`.
- Limite éditoriale V0 reconnue : les réponses textuelles (Mode B initial, Mode C, compléments) sont stockées en base mais peu intégrées au rendu final. Le rapport reflète principalement les options QCM, pas le texte écrit par le médecin. Limite assumée pour V0 — pas de correction immédiate.

### Ajouté

- `scripts/dump_report.py` enrichi avec les options `--list` (liste des interviews disponibles) et `--out` (chemin alternatif d'écriture du rapport).
- `ROADMAP.md` — entrée "Section 'Vos mots'" en V1 Restitution : encart qui cite verbatim les réponses libres du médecin sous la synthèse, pour compenser la limite éditoriale V0.

### Phase V0 globalement complète

Toutes les phases V0-1 à V0-5 sont validées. Démonstrateur fonctionnel de bout en bout, traçable, recalculable à la volée, démontrable à un médecin réel. Les limites V0 sont documentées (D-013, D-016, modeling_scoring.md section 7) et les améliorations V1+ inscrites dans la roadmap.

---

## 2026-05-13 — Phase V0-5 : test bout en bout et premier sample_report

### Ajouté

- `scripts/dump_report.py` — utilitaire qui charge une interview, applique les trois moteurs V0-4 (`src/scoring`, `src/templates`, `src/workstreams`), et écrit le rapport en Markdown dans `resources/sample_report.md`. Options `--id <N>` (interview précise, défaut : la plus récente), `--stdout` (écriture stdout au lieu du fichier). Cohérent avec `DECISIONS.md` D-010 (le rapport est produit par le démonstrateur, pas rédigé en amont).
- `resources/sample_report.md` — premier rapport réel produit pour le persona Dr Chateau. Synthèse, trois facettes scorées à 3/3/3, trois chantiers paramétrés, prochaine étape recommandée. Sert d'oracle de non-régression pour les évolutions futures du scoring, des templates et des chantiers.

### Critères d'acceptation V0-5

- Session complète jouée : oui, via `scripts/seed_persona.py` puis génération du rapport par `scripts/dump_report.py`.
- `resources/sample_report.md` produit : oui.
- Démonstrateur jugé "démontrable" : en attente de validation finale par l'utilisateur après un dernier passage manuel dans l'app.

### Phase V0-4c validée par l'utilisateur (validation implicite : "Super, allons y pour un test de bout en bout").

### En attente de validation finale de la V0 par l'utilisateur.

---

## 2026-05-13 — Phase V0-4c : instanciation paramétrée des trois chantiers

### Ajouté

- `src/workstreams.py` — moteur de génération des trois chantiers V0. Une fonction par chantier (`chantier_demandes_directes`, `chantier_ia`, `chantier_absence`) avec logique de trigger (version standard si déclenchée, version préventive sinon) et composition par placeholders. Helpers spécifiques (`_canaux_paralleles_phrase`, `_flux_principal`, `_usage_ia_decrit`, `_has_classical_dictation`). Dispatcher `build_workstreams(interview_id)` retournant la liste des trois chantiers dans l'ordre de priorité.

### Modifié

- `src/templates.py` — ajout de `derive_secretariat_with_du` (variante du libellé secrétariat après préposition "de") pour préserver la grammaire française naturelle dans les phrases des chantiers.
- `pages/02_Resultats.py` — remplacement de la liste mockée `MOCKED_CHANTIERS` par un appel à `workstreams.build_workstreams(interview_id)`. Retrait du bandeau jaune V0-4c.

### Calibration sur Dr Chateau

L'exécution du script `seed_persona.py` puis l'accès à la page de résultats doit afficher trois chantiers tous en version standard (correctrice), avec :

- **Chantier 1** "Reprendre la main sur les demandes directes" — vu mentionnant Doctolib et le télésecrétariat.
- **Chantier 2** "Sécuriser votre usage actuel de l'IA" — vu mentionnant ChatGPT et l'anonymisation manuelle, obtient incluant la mention "La dictée vocale classique que vous utilisez déjà reste" (déclenchée par Mediadict dans Q09 complement).
- **Chantier 3** "Anticiper une absence prolongée" — vu citant "Depuis le départ de Catherine, rien n'est documenté".

### Phase V0-4 complète. Plus de section mockée sur la page de résultats — toute la page est dynamique.

### En attente de validation utilisateur avant Phase V0-5 (test bout en bout et production de `sample_report.md`).

---

## 2026-05-13 — Phase V0-4b : implémentation du scoring et de la synthèse dynamiques

### Ajouté

- `src/scoring.py` — moteur de calcul des scores par facette. `compute_facet_score(interview_id, facet)` et `compute_all_facet_scores(interview_id)` implémentent l'algorithme de moyenne brute documenté dans `modeling_scoring.md`. Retournent le score arrondi, la moyenne brute et la liste des contributions traçables.
- `src/templates.py` — moteur de génération des textes du rapport. Helpers de lecture des réponses (`_get_answer`, `_selected_option`, `_complement`), dérivation des placeholders (`derive_outils_principaux`, `derive_duree_secretariat`, `derive_predecessor_name`, `derive_externalisations`, `derive_enjeu_temporel`), composition des phrases de fragilité (`fragilite_flux_entrant`, `fragilite_ia`), synthèse complète (`build_synthesis`), résumés par facette (`build_processes_summary`, `build_participants_summary`, `build_information_summary`, dispatcher `build_facet_summary`), et recommandation de prochaine étape (`build_next_step_recommendation`).

### Modifié

- `pages/02_Resultats.py` — réécriture pour charger l'interview courante depuis la base, calculer les scores via `src.scoring`, composer la synthèse et les résumés de facette via `src.templates`, et rendre la page avec les données réelles. La section "chantiers" reste en données mockées en attendant la Phase V0-4c. Date de session affichée à partir de `interview.created_at`. Recommandation de prochaine étape mise en surbrillance selon la règle (par défaut "Échanger avec Lugia" en V0).

### Calibration sur Dr Chateau

L'exécution du script `seed_persona.py` puis l'accès à la page de résultats doit afficher :
- Trois scores 3 / 3 / 3 (cohérents avec l'oracle `sample_answers_pchateau.md`).
- Une synthèse qui mentionne `Maiia et Doctolib`, `votre télésecrétariat depuis 18 mois`, les canaux directs comme première fragilité, l'usage ChatGPT comme seconde fragilité, et la facturation électronique de septembre.
- Un résumé Participants qui cite "Depuis le départ de Catherine il y a 18 mois".
- Un résumé Information qui mentionne "comme cela s'est produit il y a quelques mois".

### En attente de validation utilisateur avant Phase V0-4c.

---

## 2026-05-13 — Phase V0-4a : ressources scoring, templates et chantiers — VALIDÉE

### Ajouté

- `resources/modeling_scoring.md` — algorithme de scoring V0 (moyenne brute pure, sans bonus). Cas limites (Sans objet, Autre, questions non répondues). Validation tracée pour Dr Chateau : scores 3/3/3. Ontologie minimale V0 (7 types de nœuds). Détail recalculable depuis `answer`. Limites assumées et pistes V1.
- `resources/output_templates.md` — squelette du rapport, template de synthèse avec placeholders, templates de résumés de facette, recommandation de prochaine étape. Système de placeholders et règles de composition. Calibration sur Dr Chateau.
- `resources/workstream_templates.md` — trois chantiers prédéfinis V0 avec leur structure en 4 parties, conditions de déclenchement (triggers), placeholders paramétrables, versions standard et préventive. Algorithme de sélection V0 (systématique). Calibration sur Dr Chateau.

### Décision méthodologique majeure

Scoring V0 = **moyenne brute pure** des scores santé, sans bonus contextuel. Cohérent avec D-013 (justifiabilité mathématique). Conséquence assumée : les scores attendus du Dr Chateau seront 3/3/3 (au lieu de 6/4/5 du wireframe aspirationnel V0-1). La nuance entre facettes est portée par la formulation qualitative (résumés et synthèse), pas par les chiffres.

### En attente de validation utilisateur avant Phase V0-4b.

---

## 2026-05-13 — Outils de dev et inscriptions ROADMAP

### Ajouté

- `scripts/seed_persona.py` — script de seed du parcours Dr Chateau dans la base SQLite locale. Crée une interview, insère les 14 réponses du persona (encodées en clair dans le script), positionne le pointeur en fin de session. La session reste en `in_progress` pour être accessible via "Reprendre votre check-up" sur l'accueil. Option `--reset` pour repartir d'une base vierge. Utilitaire de dev pour itérer sur V0-4 sans rejouer le questionnaire.
- `ROADMAP.md` — entrée "Pré-remplissage automatique du questionnaire à partir d'un contexte client externe (document, transcription vocale)". Le script de seed est l'ancêtre minimal de ce mécanisme.
- `ROADMAP.md` — entrée "Rapprochement Streamlit / wireframe" et "Migration vers React ou Next.js" pour le rendu visuel à terme.

### Phase V0-3c validée par l'utilisateur.

---

## 2026-05-13 — Phase V0-3c : oracle persona Dr Chateau

### Ajouté

- `resources/sample_answers_pchateau.md` — session de référence (oracle) du persona Dr Philippe Chateau pour les 14 questions V0. Choix QCM, réponses libres en Mode B, réponses ouvertes en Mode C, compléments optionnels, le tout aligné sur le persona (outils nommés, incident du résultat vu en retard, usage ChatGPT culpabilisé, contexte familial allusif).
- Section "Synthèse rapide" avec scores bruts attendus par facette (Processus 3,33 / Participants 3,00 / Information 2,75) et écarts avec les cibles V0-1 (6 / 4 / 5).
- Notes méthodologiques pour Phase V0-4 : pistes d'ajustement (bonus stack intégré, bonus externalisation, bonus reconnaissance des fragilités).

### Méthode

Session générée à partir du contexte persona sans passage réel par l'application Streamlit, conformément au choix de l'utilisateur. Le test bout en bout en Phase V0-5 devra reproduire ces réponses à l'identique pour vérifier la cohérence du parcours et du scoring.

### En attente de validation utilisateur avant Phase V0-4.

---

## 2026-05-13 — Phase V0-3b iteration 3 : Q05 supprimée et promesse revue

### Supprimé

- Q05 (Canal principal de rendez-vous, Mode A) — redondante avec Q04 (Flux entrant). Les options du Q04 indiquaient déjà le canal dominant.

### Modifié

- `resources/interview_protocol.json` — total ramené à 14 questions, renumérotation propre des IDs et option IDs.
- `resources/interview_protocol.md` — réécrit avec nouvelle distribution et nouvelle alternance.
- `MASTER_PROMPT.md` — promesse mise à jour à "moins de 30 minutes", références à 15 questions remplacées par 14.
- `README.md`, `resources/product_brief.md`, `resources/brand_guidelines.md` — promesse mise à jour partout.
- `app.py`, `wireframes/accueil.html` — texte de la promesse et de la note CTA mis à jour.
- `DECISIONS.md` — D-015 ajoutée (promesse revue), D-005 conservée en archive.
- `ROADMAP.md` — entrée "Différenciation Q04/Q05" remplacée par "Approfondissement du canal principal" en V1.

### Nouvelle distribution V0

14 questions, séquence A A A B B C A A A A B A B C (8 mode A, 4 mode B, 2 mode C).

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-13 — Phase V0-3b iteration 2 : refonte interview suite retours utilisateur

### Bug et UX

- `src/db.py` — ajout de la colonne `selected_option_label` à `answer` (migration idempotente `_migrate_answer_columns`). Le libellé de l'option choisie est désormais stocké en clair, la base est lisible sans cross-référence avec le JSON.
- `pages/01_Checkup.py` — bouton "Précédent" ajouté (navigation libre arrière) avec sauvegarde partielle non destructive de la réponse en cours. "Quitter et reprendre plus tard" sauvegarde aussi partiellement.
- `pages/01_Checkup.py` — préremplissage des widgets depuis la base si la question a déjà été répondue (cas du retour sur une question après quit, ou via le bouton Précédent dans une nouvelle session).

### Calibration des questions

- `resources/interview_protocol.json` — Q06 (charge admin) recalibré : "moins d'une heure" passe de 9 à 7, "une à deux heures" passe de 7 à 9. Le 9 sur la fourchette basse était suspect chez un libéral.
- `resources/interview_protocol.json` — Q14 (IA) prompt clarifié : la dictée vocale classique de type Dragon n'est pas comptée comme IA générative. L'option `q14_a` mentionne explicitement la dictée vocale classique pour lever l'ambiguïté.

### Refonte du format

- Mode A étendu pour porter un complément optionnel (toujours affiché, devient obligatoire si "Autre" est choisi). Conséquence : moins de Mode B chronophage, plus de QCM rapides avec respiration optionnelle.
- Trois Mode B convertis en Mode A+complément : Q08 (dépendance), Q10 (suivi chroniques), Q13 (cadre du secrétariat).
- Q07 (équipe étendue, devenu Q08) ramené à 4 + Autre (suppression de l'option "plusieurs combinées").
- Q10 (outils, devenu Q10) ramené à 4 + Autre (suppression de l'option "papier" peu plausible pour la cible).

### Réorganisation et renumérotation

- Cadre du secrétariat (Q13 en v1.0) remonté en Q03, juste après les qualifications Q01 et Q02. Continuité narrative immédiate.
- Renumérotation propre des IDs et option IDs pour qu'ils suivent les nouvelles positions. Conséquence : les éventuelles données SQLite générées avec la v1.0 contiennent des IDs orphelins ; recommandation de supprimer `data/lugia_demo.sqlite` avant de retester.
- Distribution nouvelle : **A A A B A B C A A A A B A B C** (9 mode A, 4 mode B, 2 mode C).

### Documentation

- `resources/interview_protocol.md` — réécrit pour refléter la nouvelle distribution et la nouvelle définition du Mode A. Le détail des options reste exclusivement dans le JSON pour éviter la dette de duplication.

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-12 — Phase V0-3b : Implémentation interview Modes A/B/C

### Ajouté

- `pages/01_Checkup.py` — réécriture complète. Flow linéaire question par question, trois composants distincts par mode :
  - **Mode A** : `st.radio` avec `index=None`, plus champ texte conditionnel pour "Autre".
  - **Mode B** : `st.text_area` (réponse ouverte) puis `st.radio` (relance), plus complément optionnel.
  - **Mode C** : `st.text_area` seul, prompt narratif.
- Barre de progression `st.progress` plus caption "Question X sur 15".
- Pill de facette en tête de chaque question (Processus, Participants, Information, Contexte, Motivation, Clôture).
- Validation minimale par mode (réponse ouverte requise en B et C ; "Autre" doit être précisé en A).
- Bouton "Quitter et reprendre plus tard" disponible à tout moment.
- Écran de fin "Merci" affiché quand `current_question_index >= 15`, avec redirection vers la page de résultats (mockée en V0-3b, calculée en V0-4).

### Modifié

- `src/db.py` — ajout de la colonne `complement_text` à la table `answer` (migration non destructive `_migrate_answer_add_complement`). Ajout des helpers `save_answer`, `get_answer`, `get_answers`, `set_current_question_index`.

### Modèle de stockage des réponses

- Mode A : `selected_option` + `free_text` si "Autre".
- Mode B : `selected_option` + `free_text` (ouvert) + `complement_text` (optionnel).
- Mode C : `free_text` seul.
- Une seule ligne `answer` par (interview, question). Réécriture en cas de re-réponse.

### Critères d'acceptation V0-3

- Les 15 questions affichent dans l'ordre avec alternance visible des modes — OK.
- Les réponses sont sauvegardées dans SQLite à chaque "Suivant" — OK.
- Le médecin peut interrompre (bouton "Quitter") et reprendre (depuis l'accueil) — OK.

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-12 — D-014 et migration JSON : format canonique des questions

### Ajouté

- `resources/interview_protocol.json` — source de vérité technique pour les 15 questions V0, avec métadonnées de facette, scored, modes, options.
- `src/questions.py` — loader minimal (`load_protocol`, `load_questions`, `get_facet_labels`, `get_scored_facets`, `get_question_by_id`) et retro-test (`check_md_json_consistency`) exécutable directement par `python -m src.questions`.
- `DECISIONS.md` D-014 — Format canonique JSON. Pourquoi, alternatives écartées (Python dict, parseur Markdown, YAML).

### Modifié

- `resources/interview_protocol.md` — note de tête ajoutée précisant que le JSON est la source de vérité technique et que le `.md` est la documentation humaine, tenue à jour manuellement.

### Motif

Anticipation d'une dette de transition ultérieure. JSON sera de toute façon nécessaire en V1 (9 facettes, plus de questions, possiblement édition par tiers), autant l'adopter dès maintenant que la base de questions est petite.

---

## 2026-05-12 — D-013 et entrées roadmap : scoring justifiable

### Ajouté

- `DECISIONS.md` D-013 — Scoring : justifiabilité mathématique non négociable. V0 = moyenne brute recalculable à la volée depuis `answer`. Pondération différée en V1+.
- `ROADMAP.md` — entrée V1 "Approfondissement des questions par facette" (fréquence, satisfaction, durée, ancienneté).
- `ROADMAP.md` — entrée V1 "Encart détail de votre score" sur la page de résultats.
- `ROADMAP.md` — entrée V1+ "Pondération calibrée du scoring par benchmarking entre pairs".

---

## 2026-05-12 — Phase V0-3a : Interview Protocol — rédaction — VALIDÉE

### Ajouté

- `resources/interview_protocol.md` — 15 questions V0 réparties en quatre groupes : 2 questions de qualification (contextuelles), 4 sur Processus & Activités, 3 sur Participants, 4 sur Information, plus 1 motivation et 1 clôture en mode C. Alternance des modes documentée : A A B A B C A B A B B A B B C (5 mode A, 8 mode B, 2 mode C).
- Métadonnées d'option : score santé sur 10, type de nœud (ontologie minimale V0), tags.
- Tableau des réponses attendues du persona Dr Chateau pour calibration de l'oracle V0-3c. Premier calcul vérifié et écarts identifiés (Processus 4 attendu vs 6 cible, Information 2,75 attendu vs 5 cible) — ajustements à faire en V0-4 sur le scoring détaillé.

### En attente de validation utilisateur avant Phase V0-3b.

---

## 2026-05-12 — Phase V0-2 : Squelette Streamlit et SQLite — VALIDÉE

### Ajouté

- `app.py` — page d'accueil Streamlit (promesse, garde-fous, démarrage et reprise de session).
- `pages/01_Checkup.py` — squelette de la page interview (le questionnaire sera implémenté en V0-3).
- `pages/02_Resultats.py` — page de résultats avec données mockées issues du persona Dr Chateau.
- `src/__init__.py`, `src/db.py` — module Python avec helpers SQLite (init, création, lecture, mise à jour de session).
- `requirements.txt` — dépendance unique `streamlit>=1.36`.
- `.gitignore` — exclusion des fichiers Python compilés, environnements virtuels et base SQLite locale.
- `.streamlit/config.toml` — palette Lugia (fond beige, accent bleu sourd).
- `data/.gitkeep` — préservation du dossier de la base.

### Modifié

- `README.md` — section "Installation et lancement" renseignée (création d'un venv, installation des dépendances, commande `streamlit run app.py`).

### Schéma SQLite minimal

Quatre tables créées au premier lancement : `interview` (sessions de check-up), `answer` (réponses aux questions), `facet_score` (scores par facette WSF), `workstream` (chantiers instanciés). Foreign keys actives, contraintes `ON DELETE CASCADE`.

### Critères d'acceptation

- L'application se lance avec `streamlit run app.py` (instructions dans `README.md`) — OK.
- Trois pages navigables (Accueil, Interview, Résultats) — OK, navigation par boutons et `st.switch_page`.
- Base SQLite initialisée avec schéma minimal (interview, answer, facet_score, workstream) — OK.
- Sauvegarde et reprise d'une session interrompue — OK, via `st.session_state` (intra-session) et `db.get_latest_in_progress_interview()` (cross-session).

### Note

Smoke test automatisé non exécuté (sandbox bash indisponible lors de l'écriture). Code relu manuellement. Premier lancement local par l'utilisateur attendu pour validation finale.

### En attente de validation utilisateur avant Phase V0-3.

---

## 2026-05-12 — Phase V0-1 : Wireframes artefacts (itération 2) — VALIDÉE

### Modifié

- `wireframes/resultats.html` — version 2 :
  - Formulations reprises en langage métier médical (suppression de "filet de continuité", "réguler le flux entrant").
  - Personnalisation accrue de la synthèse et des chantiers avec des éléments concrets issus du persona : outils nommés (Maiia, Doctolib, ChatGPT), durée du télésecrétariat (18 mois), nom de l'ancienne secrétaire (Catherine), incident du résultat vu en retard, échéance facturation électronique de septembre 2026.
  - Titres de chantiers reformulés : "Réguler le flux entrant" → "Reprendre la main sur les demandes directes" ; "Préparer un filet de continuité" → "Anticiper une absence prolongée".
  - Sections renommées : "Lecture de synthèse" → "Votre situation aujourd'hui" ; "Trois facettes de votre système de travail" → "Trois angles de votre cabinet".

### Motif

Retour utilisateur sur l'itération 1 : trop de vocabulaire consulting (jugé "filet de continuité", "absorber" peu naturels pour un médecin), et manque de personnalisation perçue dans la conclusion et les chantiers.

---

## 2026-05-12 — Phase V0-1 : Wireframes artefacts (itération 1)

### Ajouté

- `wireframes/accueil.html` — maquette HTML autonome de la page d'accueil (promesse, description, garde-fous, CTA).
- `wireframes/resultats.html` — maquette HTML autonome de la page de résultats avec données mockées issues du persona Dr Chateau (lecture de synthèse, trois facettes scorées, trois chantiers en structure 4 parties, trois prochaines étapes dont une recommandée).

### Critères d'acceptation cochés

- Page d'accueil : promesse, garde-fous, bouton "Commencer" — OK.
- Page de résultats : trois facettes avec score, résumé qualitatif, liste de chantiers — OK.
- Données mockées issues du persona Dr Chateau — OK.
- Tonalité conforme aux garde-fous (sobriété, non-culpabilisation, vocabulaire validé) — OK.

### En attente de validation utilisateur avant Phase V0-2.

---

## 2026-05-12 — Initialisation du projet

### Ajouté

- `MASTER_PROMPT.md` à la racine — cadre méta du projet, version 2.0.
- `resources/persona_medecin_pchateau.md` — persona médecin de référence (Dr Philippe Chateau, 55 ans, médecin libéral solo à Saint-Mandé).
- `README.md` — présentation du projet.
- `CHANGELOG.md`, `TODO.md`, `DECISIONS.md`, `ROADMAP.md` — fichiers de suivi initialisés.
- `resources/product_brief.md` — brief produit (objectif, public, promesse, périmètre, bénéfices, limites).
- `resources/brand_guidelines.md` — voix, ton, vocabulaire, garde-fous, principes de design.
- `resources/wsf_reference.md` — note de référence sur le Work System Framework adaptée au cabinet médical.

### Décidé

Douze décisions structurantes formalisées dans `DECISIONS.md`. Principales :

- Positionnement Lugia comme **substitution-extension** (et non outil supplémentaire).
- Périmètre V0 réduit à **trois facettes WSF** : Processus & Activités, Participants, Information.
- Trois **modes d'interaction du questionnaire** (A QCM pur, B Hybride par défaut, C Ouvert) avec principe d'alternance.
- **Workflow design** : wireframe artefact d'abord, Streamlit ensuite.
- **Stratégie LLM** : règles déterministes prioritaires, LLM encadré par schémas JSON et température basse.
- **Durée cible** du check-up : 45 minutes (et non 20).
- **Découpage V0** en cinq phases (et non douze).

### Reporté en roadmap

Voir `ROADMAP.md`. Principaux reports : extension aux 9 facettes WSF, 6 constantes transversales, extraction de nœuds via LLM, visualisations Mermaid, pyramide WSF interactive, export PDF, alignement aux axiomes Alter, MSP de grande taille, version vendable Next.js.

---

*Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Mettre à jour à chaque fin de phase.*
