# Modélisations graphiques d'un parcours métier — spec

> Spec · 2026-06-15 · matérialise **D-056** (pivot du Demo) · chantier **ROADMAP C.E**
> À lire avec `lugia_systeme_modelisations_graphiques.md` (algèbre de dérivation, D-047), `lugia_schema_spec_v0.6.md` (schéma N0–N8, D-049), `web/lib/wsf/types.ts` (moteur), `lugia_charte_produit_v2.html` (palette/fonts/états).
> Pilote de référence retenu pour cette spec : **« Charge administrative d'une consultation »**.

Cette note spécifie le système de **trois représentations graphiques** par lequel le Demo gratuit rend visible un parcours métier modélisé par dialogue IA, ainsi que le **catalogue de micro-parcours** et la **mécanique du chat** qui l'alimente. Elle ne contient pas de code : c'est de la spec et des maquettes statiques.

Périmètre des réponses de cadrage (2026-06-15) : centre de gravité = **les 3 représentations sur un pilote unique**, modélisé à fond ; le catalogue v1 et les specs aval (chat, boucle) sont produits mais tenus **légers** ; suggestion IA et persistance traitées en **notes de cadrage** avec défaut proposé.

---

## 1. Place dans le flux et principe

Flux cible (D-056) :

> questionnaire → cartographie + premières hypothèses → **choix d'un micro-parcours précis** par le médecin → **dialogue IA** → **synthèse écrite + validation** → **trois représentations** → identification des **chantiers dérivés** + teaser → plan d'action détaillé *(payant)*

Principe hérité de l'algèbre de dérivation (`lugia_systeme_modelisations_graphiques.md`) : on ne stocke pas trois schémas désynchronisés. On stocke **une fois** le parcours sous forme de **graphe d'objets typés** (le substrat WSF), et chacune des trois représentations est une **vue dérivée** de ce même substrat. Corriger un objet dans la synthèse → les trois vues se recalculent.

Les trois vues répondent à trois questions différentes sur **le même** parcours :

| Représentation | Question | Force propre |
|---|---|---|
| **Logigramme de process** | « Comment ça s'enchaîne, avec quels choix ? » | décisions, bifurcations, boucles, exceptions |
| **Ruban de chaîne de valeur** | « Quelles grandes étapes, d'un coup d'œil ? » | vision d'ensemble, lecture gauche→droite |
| **Mini-carto des objets** | « Qu'est-ce qui est en jeu, et dans quel état ? » | inventaire, santé, zones de fragilité |

Pas de *sequence diagram* (D-056) : sa valeur — l'ordre temporel des échanges — est déjà portée par le logigramme, et il n'a aucune familiarité en cabinet.

---

## 2. Le substrat et le mapping des états

Le substrat est défini par `web/lib/wsf/types.ts` (ne **rien** y inventer) : 9 `ComposanteWSF`, 8 `TypeObjet`, 8 `EtatObjet`, 4 `Criticite`, 5 `Sensibilite`, 11 `TypeLiaison`. Un parcours modélisé est un `GrapheWSF` (`nodes` + `edges`).

**Point d'alignement important.** Le moteur porte **8 états** (granularité de calcul) ; la charte produit affiche **6 états** (granularité de lecture). La règle de collapse est déjà câblée dans `render-mermaid.ts` (`ETAT_CLASS`) et `src/wsf_render.py` — on la fige ici comme contrat des trois vues :

| `EtatObjet` (moteur, 8) | État d'affichage (charte, 6) | Variable charte | Couleur trait |
|---|---|---|---|
| `OPTIMAL` | optimal | `--etat-optimal` | navy `#1A2333` |
| `FONCTIONNEL` | fonctionnel | `--etat-fonct` | argent `#8E8E91` |
| `DEGRADE`, `EN_TRANSFORMATION` | vigilance | `--etat-vigilance` | olive `#6B6630` |
| `A_RISQUE` | risque | `--etat-risque` | brun `#7A6030` |
| `BLOQUE` | critique | `--etat-critique` | terracotta `#7A3320` |
| `NON_DOCUMENTE`, `INACTIF` | nondoc | `--etat-nondoc` | argent clair `#B5B5B8` |

Chaque état d'affichage a un trio charte `fill / bd (bordure) / bg (fond teinté)` — jamais d'aplat plein, jamais de vert/ambre/rouge SaaS. Fonts : Lora (chiffres et 1 statement), Onest (titres et libellés), IBM Plex Mono (codes/eyebrows). **Lugia n'utilise jamais d'italique.**

**Maturité → opacité.** Chaque objet/liaison porte une maturité (`CONFIRMÉ / INFÉRÉ / SUPPOSÉ`). Dans les trois vues, l'incertitude est rendue par l'**opacité** (confirmé = plein ; inféré = atténué), jamais par une couleur d'état dédiée. Une carte à moitié inférée doit se voir à moitié inférée.

---

## 3. Grammaire commune — chaque vue est une composition d'opérateurs

On ne réinvente pas de moteur de rendu par vue : chaque représentation est une **recette** d'opérateurs (`σ` filtrer, `τ` traverser, `π` mapper sur un canal, `Γ` regrouper, `κ` vérifier) sur le substrat.

| Vue | Recette (opérateurs) | Canal visuel porteur | Palier |
|---|---|---|---|
| **Logigramme** | `τ` traverser le parcours dans l'ordre (ancres = étapes d'entrée, types `ALIMENTE/PRODUIT/TRANSFORME/INTERFACE`) → forme par `TypeObjet` | **forme** (type) + flèche (liaison) ; **couleur** = état | Démo |
| **Ruban** | `τ` traverser + `Γ` regrouper par **zone** (composante) → ordonner gauche→droite | **forme** = type (8 symboles au trait) ; **position en zone** = relation ; **opacité** = maturité | Démo |
| **Mini-carto** | `σ` filtrer les objets du parcours → `π` mapper l'**état** sur la **couleur** d'un point | **couleur** = état ; **point** = objet ; trait fin = liaison | Démo |

Les trois canaux structurants — **forme**, **position**, **couleur** — sont répartis sans collision : le logigramme parle par la **forme et l'enchaînement**, le ruban par la **forme et la zone**, la carto par la **couleur d'état**. C'est ce qui rend les trois vues complémentaires et non redondantes.

---

## 4. Représentation 1 — Logigramme de process

**But.** Montrer l'enchaînement réel du travail, y compris les points de **décision**, les **bifurcations** et les **boucles** (rejet → correction → reprise). C'est la vue la plus familière d'un cabinet.

**Règles.**
- Une étape de travail = `TypeObjet` `ACTION` (forme arrondie). Un point de choix = `DECISION` (losange) ; il porte au moins deux sorties étiquetées (ex. « accepté » / « rejeté »).
- Les acteurs (`ACTEUR`) et outils (`ENTITE`/`TECHNOLOGIE`) n'encombrent pas le fil principal : ils apparaissent en *responsabilité* (couloir ou annotation), pas comme étapes.
- La **couleur d'état** s'applique aux nœuds (mapping §2). Les **boucles** matérialisent les reprises (ex. rejet de télétransmission).
- Direction par défaut `LR` pour un parcours court (lecture proche du ruban), `TD` si > 8 étapes.

**Réalisation.** Côté web : **Mermaid `flowchart`** via `graphToMermaid()` existant (formes par type, `classDef` par état déjà alignées charte). Côté PDF : **reportlab natif** via `src/wsf_render.py` (mêmes couleurs). Aucune dépendance nouvelle. La source Mermaid du pilote est dans la maquette §9.

---

## 5. Représentation 2 — Ruban de chaîne de valeur

**But.** Donner la vision d'ensemble du parcours en un coup d'œil, lecture **gauche → droite**.

**Règle de marque absolue — ruban = SYMBOLES, jamais de points colorés** (mémoire `feedback_ruban_symboles_carte_points`). La grammaire est celle de la charte éditoriale (Livre IV, §25 « La bibliothèque de symboles ») :

- **Huit symboles dessinés au trait — la forme dit le type.** Ils correspondent exactement aux 8 `TypeObjet` : Acteur, Entité, Stock, Action, Décision, Flux, Contrainte, Frontière.
- **La position dans les zones porte la relation.** Zones horizontales (bandes) reprenant les composantes : environnement · participant · technologie · information · processus · produit · client.
- **Matérialité par l'opacité** : confirmé = plein ; inféré = atténué.
- **Seul un désalignement est tracé** : le ruban ne surligne pas tout ; il laisse affleurer les fragilités (sortie de `κ` vérifier) sans transformer la vue en tableau de bord.

Le ruban n'est donc **pas** une frise de « grandes étapes » génériques : c'est la projection des objets-clés du parcours sous leur symbole de type, posés dans leur zone, lus de gauche à droite. La couleur d'état n'est **pas** le canal porteur ici (c'est le rôle de la mini-carto) — le ruban reste sobre, au trait.

**Réalisation.** SVG natif (pas Mermaid : Mermaid ne sait pas faire ce ruban à zones). Maquette §9. Côté PDF : reportlab (tracé au trait, identique).

---

## 6. Représentation 3 — Mini-carto des objets identifiés

**But.** Vue d'**inventaire** : tous les objets, acteurs, stocks, flux du parcours, avec leur **état de santé**. C'est ici que les zones de fragilité se lisent par la couleur.

**Règle de marque absolue — carte = POINTS colorés par état, jamais de symboles** (mémoire `feedback_ruban_symboles_carte_points`, complément du §5).

- Chaque objet = un **point** ; sa **couleur** = son état d'affichage (§2, palette charte 6 états). C'est le seul endroit du triptyque où la couleur d'état est le canal principal.
- Les liaisons = **traits fins** (argent `#B5B5B8`) ; l'épaisseur peut mapper la `force` (canal secondaire, optionnel).
- **Maturité → opacité** des points (inféré = atténué).
- Layout : regroupement souple par composante (pas de grille rigide, pas de matrice 2×2). Pas de feux tricolores.

**Réalisation.** SVG natif. Maquette §9. Côté PDF : reportlab (points + traits).

---

## 7. La règle qui ne s'inverse jamais

| | Canal porteur | Ce qu'on lit |
|---|---|---|
| **Ruban** | **SYMBOLES** au trait (forme = type) + zones | la structure et l'ordre |
| **Mini-carto** | **POINTS** colorés (couleur = état) | la santé et les fragilités |

Ne **jamais** mettre de points colorés dans le ruban, ni de symboles de type dans la carto. Cette séparation est ce qui évite que les deux vues fassent doublon.

---

## 8. Le pilote — « Charge administrative d'une consultation » en substrat WSF

Périmètre du parcours : tout le travail administratif rattaché à **une** consultation, de la fin de l'acte clinique à la clôture du dossier. Le produit analyse le **système de travail**, pas l'acte de soin ; **aucune donnée patient identifiable** n'entre dans le schéma.

### 8.1 Objets (nœuds typés)

| id | label | composante | type | état (moteur) | criticité |
|---|---|---|---|---|---|
| `med` | Médecin | PARTICIPANT | ACTEUR | FONCTIONNEL | CRITIQUE |
| `secr` | Secrétariat (présent ou absent) | PARTICIPANT | ACTEUR | NON_DOCUMENTE | IMPORTANT |
| `dpi` | Logiciel métier / dossier | TECHNOLOGIE | ENTITE | FONCTIONNEL | CRITIQUE |
| `tla` | Lecteur Vitale + télétrans. | TECHNOLOGIE | ENTITE | FONCTIONNEL | IMPORTANT |
| `cotation` | Cotation de l'acte | PROCESSUS | ACTION | A_RISQUE | CRITIQUE |
| `regle_cot` | Règles de cotation (nomenclature) | STRATEGIE | CONTRAINTE | NON_DOCUMENTE | IMPORTANT |
| `fse` | Feuille de soins électronique | INFORMATION | ENTITE | FONCTIONNEL | CRITIQUE |
| `teletrans` | Télétransmission | PROCESSUS | ACTION | FONCTIONNEL | CRITIQUE |
| `payeur` | Assurance maladie (externe) | ENVIRONNEMENT | FRONTIERE | FONCTIONNEL | IMPORTANT |
| `rejet` | Rejet / retour de paiement | PROCESSUS | DECISION | A_RISQUE | IMPORTANT |
| `suivi_rejet` | Reprise des rejets | PROCESSUS | ACTION | DEGRADE | IMPORTANT |
| `encaiss` | Encaissement / part patient | PROCESSUS | ACTION | FONCTIONNEL | STANDARD |
| `docs` | Documents associés (ordo, courrier, certificat) | PRODUIT | FLUX | DEGRADE | IMPORTANT |
| `maj_dossier` | Mise à jour du dossier | PROCESSUS | ACTION | NON_DOCUMENTE | IMPORTANT |
| `dossier` | Dossier patient (stock) | INFORMATION | STOCK | FONCTIONNEL | CRITIQUE |

### 8.2 Liaisons (arcs typés)

`med` UTILISE `dpi` · `med` UTILISE `tla` · `regle_cot` CONTRAINT `cotation` · `cotation` PRODUIT `fse` · `fse` ALIMENTE `teletrans` · `tla` SUPPORTE `teletrans` · `teletrans` INTERFACE `payeur` · `payeur` INTERFACE `rejet` · `rejet` ALIMENTE `suivi_rejet` (sortie « rejeté ») · `rejet` ALIMENTE `encaiss` (sortie « accepté ») · `med` PRODUIT `docs` · `docs` DELIVRE `dossier` (et patient, hors schéma) · `med` PRODUIT `maj_dossier` · `maj_dossier` TRANSFORME `dossier`.

### 8.3 Les 2-3 zones de fragilité (sortie `κ` vérifier — teaser des chantiers)

1. **Cotation « de mémoire »** (`cotation` A_RISQUE, `regle_cot` NON_DOCUMENTE) — la règle de cotation n'est pas formalisée ; risque de sous-cotation et d'écart répété, invisible faute de trace.
2. **Rejets traités en différé** (`rejet` A_RISQUE, `suivi_rejet` DEGRADE) — pas de reprise systématique des retours ; perte financière silencieuse.
3. **Documents et mise à jour fragmentés** (`docs` DEGRADE, `maj_dossier` NON_DOCUMENTE) — production éclatée entre fin de consultation et inter-consultation ; charge cognitive et risque d'oubli.

Ces fragilités sont le **teaser gratuit** ; leur transformation en chantiers détaillés + plan d'action reste **payante** (Work System).

---

## 9. Les trois maquettes du pilote

Maquettes statiques alignées charte (palette §2, fonts, états sobres), dans `maquettes_parcours/` :

- `maquette_1_logigramme.svg` — logigramme du pilote (rendu charte). Source Mermaid de référence : `maquette_1_logigramme.mmd`.
- `maquette_2_ruban.svg` — ruban de chaîne de valeur (8 symboles au trait, zones, confirmé/inféré).
- `maquette_3_minicarto.svg` — mini-carto des objets (points colorés par état, traits fins).

---

## 10. Catalogue v1 des micro-parcours

**Principe de libellé.** La précision du libellé conditionne la qualité de la modélisation (D-056) : un libellé large (« parcours patient ») produit des questions abstraites et le médecin répond en généralités. Chaque entrée nomme **un moment de travail précis, borné dans le temps et l'espace du cabinet**.

### 10.1 Médecin généraliste (10 micro-parcours)

| # | Micro-parcours | Cœur WSF dominant | Palier |
|---|---|---|---|
| M1 | Accueil des patients au cabinet avant un rendez-vous programmé | PARTICIPANT · PROCESSUS | Démo |
| M2 | **Charge administrative d'une consultation** *(pilote)* | PROCESSUS · TECHNOLOGIE · INFORMATION | Démo |
| M3 | Suivi d'un patient chronique entre deux consultations | INFORMATION · PROCESSUS (temporel) | Démo |
| M4 | Gestion des demandes d'urgence non programmées du jour | PROCESSUS · DECISION | Démo |
| M5 | Traitement des résultats d'examens reçus (labo, imagerie) | INFORMATION · FLUX | Démo |
| M6 | Renouvellement d'ordonnance hors consultation | PROCESSUS · CONTRAINTE | Démo |
| M7 | Coordination avec un correspondant (adressage, retour) | INTERFACE · INFORMATION | Work System |
| M8 | Gestion des appels téléphoniques entrants en journée | PARTICIPANT · FLUX | Démo |
| M9 | Clôture financière de fin de journée (caisse, télétrans., rejets) | PROCESSUS · INFORMATION | Work System |
| M10 | Intégration d'un remplaçant ou d'un nouvel associé | PARTICIPANT · STRATEGIE | Work System |

### 10.2 Structure prête pour les autres secteurs (amorce)

La grammaire des 3 représentations est **identique** ; seul le catalogue est sectoriel. Amorces à compléter dans une conv dédiée :

- **Avocat** : ouverture d'un dossier client · préparation d'une audience · facturation au temps passé · gestion des échéances de procédure · archivage et conflits d'intérêts.
- **Kiné** : bilan initial et plan de soin · enchaînement des séances d'une journée · télétransmission et part mutuelle · réévaluation et fin de prise en charge.

---

## 11. Mécanique du chat de modélisation (spec légère)

Chat **distinct** du chat chantier existant (qui reste en V1 pour le Work System payant). Nouvelle mécanique, mais **réutilise l'infra** : qwen 7B + fallback 3B en Navigateur, Claude en Cloud, même format de synthèse JSON. Différence d'intention : le chat chantier **cadre** un problème ; ce chat **creuse** un parcours pour en extraire les objets fins.

**Lancement.** Depuis la page résultats, **après** le questionnaire — seconde phase, non comprise dans les 20-30 min du check-up. Le médecin peut le faire plus tard. Le parcours est pré-sélectionné (suggestion §13.1) mais le médecin tranche.

**Déroulé indicatif (4 moments, ~8-12 tours, pas de cadence rigide).**

1. **Ancrage** (1-2 tours) — « Racontez-moi concrètement ce qui se passe quand [parcours]. Par quoi ça commence ? » On capte les **étapes** dans l'ordre.
2. **Objets** (3-5 tours) — pour chaque étape, qui agit, avec quel outil, quelle information entre/sort. On capte `ACTEUR / ENTITE / INFORMATION / STOCK`. Questions concrètes, jamais de jargon WSF.
3. **Frictions** (2-3 tours) — « Où ça coince, attend, se répète, s'oublie ? » On capte les `EtatObjet` dégradés et les boucles (`DECISION`).
4. **Bornes** (1-2 tours) — entrées/sorties du parcours, interfaces avec l'extérieur (`FRONTIERE / INTERFACE`).

**Critère de suffisance (l'IA décide qu'elle a assez).** Heuristique simple, pas de seuil magique : on s'arrête quand (a) le parcours a un **début et une fin** explicites, (b) chaque étape a **au moins un objet** rattaché, (c) **au moins une friction** est qualifiée, et (d) le dernier tour n'a **rien ajouté de neuf** au graphe. À défaut, relance ciblée sur le trou (étape sans objet, sortie de décision manquante).

**Restitution.** À la bascule, l'IA produit une **synthèse écrite** en langage métier (pas de codes WSF visibles) + le **graphe WSF** sous-jacent (objets/liaisons typés) en coulisse.

---

## 12. Boucle synthèse → validation → graphes → chantiers

1. **Synthèse écrite** — récit court du parcours tel que compris, en langage du cabinet, listant étapes, objets et 2-3 fragilités pressenties. Ton non culpabilisant : on raconte un fonctionnement, on ne note pas.
2. **Validation / correction** — le médecin valide ou corrige **avant** génération des graphes. La correction est une **mutation du substrat** (ajout/retrait/requalification d'un objet) — côté écriture, distinct de l'algèbre en lecture seule. Point de confiance critique (D-056) : un parcours « plausible mais pas le sien » casse tout.
3. **Génération des 3 représentations** — dérivées du substrat validé (logigramme, ruban, mini-carto). Recalcul automatique si le médecin re-corrige.
4. **Chantiers dérivés** — `κ` vérifier (R1–R5) sur le substrat du parcours → désalignements ordonnés par criticité → 2-3 chantiers **ancrés dans le parcours** (≠ grille générique du questionnaire). **Démo** : intitulé + zone de fragilité teasée. **Work System (payant)** : observation → analyse → ce qui échappe → proposition → bénéfice + plan d'action.

**Frontière démo / payant.** Gratuit : le parcours modélisé (3 vues) + l'identification (teaser) des chantiers. Payant : plans d'action détaillés, multi-parcours, persistance et réutilisation.

---

## 13. Notes de cadrage (défaut proposé, à confirmer)

### 13.1 Suggestion IA du parcours à creuser
Défaut V1 : **heuristique simple sur le footprint du questionnaire**, pas de dérivation WSF fine. On classe les micro-parcours par adéquation avec les axes les plus faibles du diagnostic (ex. axe Process/Admin bas → suggérer M2/M9 ; axe Continuité bas → M3). L'IA **suggère**, le médecin **tranche** (D-056, alternative « IA choisit » écartée). Dérivation fine via le moteur = Work System / plus tard.

### 13.2 Persistance du parcours modélisé
Défaut proposé : **oui, stocké comme `GrapheWSF`** (nœuds objets typés + liaisons typées + maturité), pour réutilisation par les chantiers en aval et alimentation du substrat (doctrine « diagnostic gratuit = canal de saisie, pas score jetable »). **Schéma de persistance figé plus tard** (pas dans cette conv) — on note seulement que le format de sérialisation = `GrapheWSF` de `types.ts`, sans nouveau type.

---

## 14. Découpage spec / proto / code et paliers

- **Spec (cette note, écrite)** : grammaire des 3 vues, mapping états, pilote en substrat, catalogue v1, mécanique chat, boucle de validation.
- **Proto (dessiné)** : les 3 maquettes `maquettes_parcours/`.
- **Code (à implémenter ensuite, hors conv)** : écran de dialogue de modélisation ; écran synthèse + validation ; rendu des 3 vues (logigramme = `graphToMermaid` réemployé ; ruban + carto = nouveaux renderers SVG/reportlab au-dessus de `types.ts`) ; génération des chantiers déplacée en aval.

**Paliers.** Démo : modélisation d'**un** parcours, 3 vues, teaser chantiers. Work System (payant) : multi-parcours, persistance, chantiers détaillés + plan d'action, vues expertes (RACI, matrice, simulation).

---

## 15. Questions ouvertes

1. **Logigramme — couloirs de responsabilité** : afficher les acteurs en *swimlanes* (plus riche, moins lisible sur mobile) ou en simple annotation ? À trancher au proto interactif.
2. **Ruban — nombre de zones affichées** : les 7 zones systématiquement, ou seulement celles peuplées par le parcours (évite les bandes vides) ?
3. **Suffisance du chat** : la règle §11 est heuristique ; à calibrer sur les premiers parcours réels (sur/sous-questionnement).
4. **Cardinalité du catalogue** : 10 micro-parcours médecin retenus ; valider lesquels sont **démo** vs **Work System** avec un usage réel.
5. **Désalignement tracé dans le ruban** : convention visuelle exacte du « seul un désalignement est tracé » (surlignage du lien ? halo ?) à figer avec la charte éditoriale.

---

*Spec modélisations graphiques — Lugia & Co — 2026-06-15 — matérialise D-056, chantier C.E.*
