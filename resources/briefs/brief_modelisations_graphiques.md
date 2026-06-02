# Brief de démarrage — Conversation « Lugia · Modélisations graphiques »

> À coller comme **premier message** d'une nouvelle conversation, dans le même dossier projet `lugia-checkup-demo` (pour partager mémoire, fichiers et instructions).

---

Tu vas m'aider à concevoir le **système de modélisations graphiques** qui représente une organisation dans Lugia. Lis le contexte ci-dessous, puis pose-moi les questions de cadrage à la fin — ne commence pas à modéliser tout de suite.

## Contexte produit (rappel)

**Lugia** analyse le *système de travail* d'un cabinet (et plus largement de toute organisation libérale ou d'entreprise), pas la pratique métier ni les individus. La représentation visuelle est centrale : c'est par les **schémas** que le professionnel reconnaît son cabinet, voit où ça coince, et perçoit la profondeur du produit. Aujourd'hui on a une seule représentation (un schéma WSF flowchart par chantier). C'est très insuffisant pour porter la promesse complète du produit (jumeau vivant, multi-niveaux de zoom, bibliothèque de lentilles, multi-secteurs).

Le moteur de modèle est **Steven Alter — Work System Framework** : 9 composantes (Clients, Stratégies, Environnement, Processus, Participants, Produits/Services, Information, Technologies, Infrastructure). Les types d'objets et de liaisons sont déjà définis dans le code (`web/lib/wsf/types.ts` : 8 TypeObjet, 8 ÉtatObjet, 11 TypeLiaison incl. `TRANSMET` pour la Circulation du savoir, 4 Criticité, 5 Sensibilité).

Le rendu actuel est minimal : un `flowchart TD` Mermaid côté web et un dessin reportlab côté PDF, alignés sur la **charte produit** (palette navy/ivoire/argent, états sobres optimal/fonctionnel/vigilance/risque/critique/nondoc — pas de vert/ambre/rouge générique). Lora serif, Onest sans, IBM Plex Mono.

## Fichiers à lire AVANT de démarrer

- `resources/vision/lugia_moteur_wsf_specification.md` — spec moteur (composantes, objets, liaisons, règles).
- `resources/vision/lugia_jumeau_numerique_specification.md` — vision du jumeau : 5 niveaux de zoom, lentilles, maturité (CONFIRMÉ/INFÉRÉ/SUPPOSÉ).
- `resources/vision/lugia_mermaid_wsf_modelisation.md` — **document central pour cette conversation** : 6 types de diagrammes Mermaid mappés aux composantes WSF (Sequence pour Processus, ER pour Information, Class pour Participants, State pour Environnement, Quadrant pour Stratégies, Flowchart pour Produits).
- `resources/vision/lugia_bibliotheque_lentilles.md` — 22 lentilles (recolorages du même modèle selon une question : santé, conformité, alignement, automatisation, etc.).
- `resources/vision/lugia_circulation_savoir.md` — lentille « Circulation du savoir » et lien `TRANSMET`.
- `resources/vision/lugia_mecanismes.html` — récap pédagogique zoom × lentilles × diagrammes × jumeau vivant.
- `resources/vision/lugia_navigation_v2.html` — prototype d'interface multi-niveaux (vignette → carte WSF → domaine → flux → fiche objet) avec barre de lentilles.
- `resources/vision/lugia_charte_produit.html` (+ `_v2.html`) — charte de marque : palette, fonts, états visuels, composants.

Code à connaître :
- `web/lib/wsf/types.ts` — types génériques (9 composantes, 8 TypeObjet, 8 EtatObjet, 11 TypeLiaison, Criticité, Sensibilité).
- `web/lib/wsf/render-mermaid.ts` — rendu Mermaid actuel (flowchart TD uniquement).
- `web/lib/wsf/chantier-graphes.ts` — 7 graphes statiques par chantier (5 nœuds chacun).
- `src/wsf_render.py` — rendu reportlab natif pour le PDF.
- ROADMAP.md WS.3 — chantier « schémas détaillés » qui couvre une partie du sujet.

## Objectif de cette conversation

Définir un **système de modélisations graphiques cohérent** qui réponde aux besoins du produit Lugia. Périmètre à valider avec moi :

1. **Quels types de diagrammes faut-il vraiment ?** Le doc `mermaid_wsf_modelisation` propose 6 types. Sont-ils tous utiles ? D'autres manquent ? Lequel est prioritaire pour la démo, lesquels pour le Work System payant ?
2. **Comment ils s'articulent avec les 5 niveaux de zoom** (vignette / carte WSF / domaine / flux / fiche objet) — quel diagramme à quel niveau, et comment on navigue entre eux.
3. **Comment ils s'articulent avec les 22 lentilles** — recolorage uniforme du même schéma ? Ou certaines lentilles imposent un type de diagramme spécifique ?
4. **Maturité visuelle** — comment on distingue à l'œil un objet CONFIRMÉ, INFÉRÉ, SUPPOSÉ (les 3 niveaux de fiabilité du jumeau).
5. **Schéma vivant vs figé** — comment matérialiser visuellement qu'un schéma évolue dans le temps (états comparés avant/après, animations, séries temporelles).
6. **Multi-secteurs** — le système doit fonctionner identiquement pour médecin / avocat / kiné (cf charte v2 et page profession). Comment garantir la généricité.
7. **Adoption progressive** — le médecin doit pouvoir lire le premier schéma en 5 secondes. Comment graduer la complexité visuelle.

## Contraintes à respecter

- **Charte de marque non négociable** : palette sobre (navy/ivoire/argent + états vigilance/risque/critique en olive/brun/terracotta). Pas de vert/ambre/rouge SaaS. Lora/Onest/IBM Plex Mono.
- **Posture produit** : analyse du système de travail, jamais des individus. Aucune donnée patient/client identifiable dans les schémas.
- **Anti-consulting** : pas de buzzwords, pas de matrices 2×2 à 4 cases « optimisation/excellence ». Ton clair, humain.
- **Cohérence avec le moteur existant** : les 8 ÉtatObjet et 11 TypeLiaison sont déjà définis, ne pas en inventer sans raison.
- **Réalisme technique** : Mermaid côté web (avec sa palette), reportlab côté PDF. Pas de dépendance lourde (mermaid-cli, chromium serveur).

## Méthode attendue

- Avant de proposer, **lis les fichiers vision listés ci-dessus** — il y a déjà beaucoup de pensée disponible.
- Distingue clairement ce qui relève de la **spec** (à écrire), du **prototype** (à dessiner), et du **code** (à implémenter).
- Marque ce qui est **démo gratuit** vs **Work System payant** vs **plus tard**.

## Avant de commencer — pose-moi ces questions

1. Niveau de profondeur attendu : on cadre la **spec globale** du système (tous types, tous niveaux), ou on attaque **un type de diagramme à la fois** par itérations ?
2. Cible immédiate : démo (qui doit déjà mieux raconter la profondeur) ou Work System (qui sera vendu) ?
3. As-tu déjà des retours prospects qui pointent un manque visuel précis ? Si oui, par où on commence.
4. Format de livrable final : note de spec, prototype HTML interactif, ou directement implémentation TS/Python dans le moteur ?
5. Y a-t-il un type de diagramme que tu sens **urgent** (ex : la séquence d'un processus avec timing, la carte ER des données, l'évolution dans le temps) ?

Une fois tes réponses obtenues, propose-moi un plan de spec avant de rentrer dans le détail visuel.
