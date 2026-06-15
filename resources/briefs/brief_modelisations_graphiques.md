# Brief de démarrage — Conversation « Lugia · Modélisations graphiques »

> À coller comme **premier message** d'une nouvelle conversation, dans le même dossier projet `lugia-checkup-demo` (pour partager mémoire, fichiers et instructions).

> **Mise à jour 2026-06-15 — pivot D-056.** Le brief a été resserré autour du nouveau cap : le Demo sort désormais sur la modélisation gratuite d'un parcours métier précis (et non plus directement sur un chantier). La conv doit produire la grammaire des trois représentations + le catalogue de micro-parcours + la mécanique du chat de modélisation et de validation. Référence : `DECISIONS.md` D-056 et `ROADMAP.md` chantier C.E.

---

Tu vas m'aider à spécifier le **système de modélisations graphiques** qui rend visible un **parcours métier** modélisé par dialogue IA dans Lugia. Lis le contexte ci-dessous, puis pose-moi les questions de cadrage à la fin — ne commence pas à modéliser ou à dessiner tout de suite.

## Le pivot produit qui motive cette conversation (D-056)

Le Demo gratuit ne sort plus sur « voici un chantier prioritaire ». Il sort sur **la modélisation gratuite d'un parcours métier précis** choisi par le médecin (ou par l'avocat, le kiné, etc., dans une logique multi-secteurs), conduite via un **dialogue IA distinct du questionnaire**, **validée** par le médecin avant génération des graphes. À partir du parcours modélisé, l'IA dérive ensuite les chantiers — ancrés dans le quotidien spécifique du cabinet, pas dans la grille générique du questionnaire.

Flux cible :

> *questionnaire → cartographie + premières hypothèses → choix d'un **micro-parcours précis** par le médecin → dialogue IA → synthèse écrite + validation par le médecin → trois représentations graphiques → identification des chantiers dérivés + teaser → plan d'action détaillé (payant)*

**Pourquoi.** La pertinence d'un chantier dérivé direct du questionnaire est structurellement faible : le médecin reçoit une recommandation qu'il pouvait formuler lui-même (« mieux suivre mes chroniques »). Passer par un parcours qu'il **reconnaît comme le sien** donne aux chantiers proposés une crédibilité d'un autre ordre.

## Ce que cette conversation doit produire

1. **La grammaire des trois représentations graphiques** d'un parcours, alignée sur la charte produit :
   - **Logigramme de process** — comment le parcours s'enchaîne, avec décisions et bifurcations. Familier des cabinets, gère bien les exceptions et les boucles. Pas de sequence diagram (sa valeur unique est déjà couverte par le logigramme, et zéro familiarité côté médecin).
   - **Chaîne de valeur en ruban** — les grandes étapes du parcours en **symboles** (ruban = SYMBOLES, JAMAIS de points colorés — voir mémoire `feedback_ruban_symboles_carte_points`). Lecture gauche → droite, vision d'ensemble en un coup d'œil.
   - **Mini-carto des objets identifiés** — vue d'inventaire des objets, acteurs, stocks, flux en jeu dans le parcours, **points colorés par état** (palette charte : optimal/fonctionnel/vigilance/risque/critique/nondoc — pas de vert/ambre/rouge SaaS).

2. **Le catalogue de micro-parcours par métier**, **finement libellés**. Pas « parcours patient » mais « accueil des patients au cabinet avant rendez-vous programmé ». La précision du libellé détermine la qualité de la modélisation : un libellé large produit des questions abstraites, le médecin répond en généralités, on n'attrape pas les objets fins. Cible : 8 à 12 micro-parcours pour le médecin généraliste, structure prête pour avocat et kiné.

3. **La mécanique du chat IA de modélisation.** Distinct du chat chantier existant (qui reste en V1 pour le Work System payant). Combien de tours, quelles questions types, comment l'IA décide qu'elle a assez de matière, comment elle restitue la synthèse écrite, comment le médecin la valide ou la corrige.

4. **La boucle synthèse → validation → graphes → chantiers**. Spec de chaque étape, du point de bascule du chat à la génération des chantiers en aval.

5. **L'algorithme de suggestion** : à partir des réponses du questionnaire, l'IA suggère quel micro-parcours le médecin devrait creuser en premier. Le médecin tranche.

## Contexte produit (rappel)

**Lugia** analyse le *système de travail* d'un cabinet (et plus largement d'une organisation libérale ou d'entreprise), pas la pratique métier ni les individus. Le moteur de modèle est **Steven Alter — Work System Framework** (9 composantes ; types d'objets/liaisons définis dans `web/lib/wsf/types.ts`). Posture **anti-consulting** : ton clair, humain, non culpabilisant. **Multi-secteurs** dès la conception, médecine de ville en premier.

Le rendu actuel est minimal : un `flowchart TD` Mermaid côté web et un dessin reportlab côté PDF, alignés sur la charte produit (palette navy/ivoire/argent, états sobres). Lora serif, Onest sans, IBM Plex Mono.

## Fichiers à lire AVANT de démarrer

Décisions et méthode :
- `DECISIONS.md` **D-056** (pivot du Demo, décision cadre de cette conv).
- `DECISIONS.md` **D-049** (méthode canonique N0–N8) — réf. actuelle.
- `ROADMAP.md` chantier **C.E** — formalisation du pivot côté produit.

Vision et grammaire :
- `resources/methode/lugia_schema_spec.md` et `lugia_schema_exemple.md` — schéma N0–N8, cas Dr Martin.
- `resources/methode/lugia_coaching_dialog_spec.md` — spec de l'interview IA actuelle (utile comme base mais le chat de modélisation est distinct).
- `resources/vision/lugia_bibliotheque_lentilles.md` — 22 angles de lecture.
- `resources/vision/lugia_regles_representation.md` — règles de la grammaire positionnelle.
- `resources/vision/lugia_circulation_savoir.md` — lentille type, illustre la précision d'un angle d'analyse.

Charte et état visuel :
- `resources/vision/lugia_charte_produit.html` (+ `_v2.html`) — palette, fonts, états visuels, composants.
- `resources/methode/interface/` — design interface Carte Vivante (axiomes, niveaux Z-2→Z4, 3 représentations).

Code à connaître :
- `web/lib/wsf/types.ts` — types génériques (9 composantes, 8 TypeObjet, 8 EtatObjet, 11 TypeLiaison, Criticité, Sensibilité).
- `web/lib/wsf/render-mermaid.ts` — rendu Mermaid actuel (flowchart TD, palette charte alignée).
- `web/lib/wsf/chantier-graphes.ts` — graphes statiques actuels par chantier (référence d'objets typés).
- `src/wsf_render.py` — rendu reportlab natif (PDF chantier).

## Contraintes à respecter

- **Charte de marque non négociable** : palette sobre (navy/ivoire/argent + olive/brun/terracotta pour les états vigilance/risque/critique). Pas de vert/ambre/rouge SaaS. Lora/Onest/IBM Plex Mono.
- **Posture produit** : analyse du système de travail, jamais des individus. Aucune donnée patient/client identifiable dans les schémas.
- **Anti-consulting** : pas de buzzwords, pas de matrices 2×2 à 4 cases. Ton clair.
- **Cohérence avec le moteur existant** : les 8 ÉtatObjet et 11 TypeLiaison sont déjà définis, ne pas en inventer sans raison.
- **Ruban = symboles, carte = points** : règle absolue, ne JAMAIS inverser (mémoire `feedback_ruban_symboles_carte_points`).
- **Lugia, jamais d'italique** : Lora regular uniquement (mémoire `feedback_brand_lugia_pas_d_italique`).
- **Réalisme technique** : Mermaid côté web (avec sa palette), reportlab côté PDF. Pas de dépendance lourde (mermaid-cli, chromium serveur).
- **Multi-secteurs** : la grammaire des trois représentations doit fonctionner identiquement pour médecin / avocat / kiné. Le catalogue de micro-parcours est, lui, sectoriel.

## Méthode attendue

- **Lis les fichiers vision listés ci-dessus AVANT de proposer** — il y a déjà beaucoup de pensée disponible.
- Distingue clairement ce qui relève de la **spec** (à écrire), du **prototype** (à dessiner), et du **code** (à implémenter ensuite, hors de cette conv).
- Marque ce qui est **démo gratuit** (le parcours modélisé + teaser chantiers) vs **Work System payant** (plans d'action détaillés, multi-parcours, persistance).
- **Pas de prototype HTML non demandé** (mémoire `feedback_specs_pas_de_proto_html`). La sortie est de la spec, pas du code.

## Avant de commencer — pose-moi ces questions

1. **Profondeur attendue de la conv** : on cadre la spec globale du système (3 représentations × catalogue × chat × boucle de validation × suggestion), ou on attaque par phases (commencer par les 3 représentations sur un parcours pilote, puis étendre) ?
2. **Parcours pilote** : un micro-parcours du médecin généraliste à modéliser dans cette conv comme cas d'usage de référence — lequel ? (accueil avant RDV, suivi chronique, gestion urgence du jour, charge admin d'une consult…)
3. **Mécanique du chat IA** : on s'inspire du chat chantier existant (4 phases, 20 messages, qwen 7B/3B + fallback Claude) ou on conçoit une mécanique différente parce que la modélisation d'un parcours demande plus de creuser, moins de cadrer ?
4. **Suggestion IA du parcours** : algorithme prévu ? heuristique simple à partir du footprint du questionnaire, ou dérivation plus fine via le moteur WSF ?
5. **Format de livrable final de la conv** : note de spec markdown + maquettes des 3 représentations en SVG/Mermaid statique, ou aussi un premier catalogue de micro-parcours rédigés (les 8-12 libellés du médecin) ?
6. **Persistance du parcours modélisé** : est-il stocké en base comme graphe WSF (nœuds objets typés + liaisons typées) pour réutilisation par les chantiers en aval ? Si oui, schema à définir maintenant ou plus tard ?

Une fois tes réponses obtenues, propose-moi un **plan de spec** avant de rentrer dans le détail visuel.
