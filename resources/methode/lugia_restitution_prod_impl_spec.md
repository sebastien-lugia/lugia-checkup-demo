# Lugia — Spec d'implémentation : restitution capability map + carte vivante en prod

**Statut** v1.0 · 2026-06-09 · **cible** brancher, en sortie de la discussion LLM, la capability map +
la carte vivante (ruban = symboles / carte = points), à la charte V3. **Cadrage avant code.**

## 1. Constat — le substrat existe déjà

La conversation chantier émet **déjà** un graphe WSF typé en fin de synthèse (`MERMAID_JSON`,
`src/chat_assistant.py:184`), au format `web/lib/wsf/types.ts` :
`ObjetWSF{ id, composante(9), type(8), label, etat(8), criticite, sensibilite, metadata }` +
`LiaisonWSF{ source, cible, type(11), sens, force, delai, caractere }`.

Les **8 `TYPES_OBJET`** = la bibliothèque de symboles (ACTEUR/ENTITE/STOCK/ACTION/DECISION/FLUX/
CONTRAINTE/FRONTIERE). Les **8 `ETATS_OBJET`** = la patine. **Rien à réinventer.**

Il est stocké de façon lâche dans `chat_message.content` (suffixe `__LUGIA_META__`, `backend/main.py:991`)
et rendu inline par `web/components/v3/MermaidDiagram.tsx`. Variante prod active = **v3-charte**.

## 2. Le seul vrai manque : l'AXE

Un objet porte sa `composante` (facette WSF = nature) mais **pas son axe** (carte de capacité, niveau 1).
La capability map exige l'axe → il faut **projeter chaque objet sur un axe via le socle de placement**
(`lugia_placement_objets_axes.md`, D-055).

**Décision (à acter) :** l'**agent émet l'`axe` par objet** dans `MERMAID_JSON` (il connaît la fonction),
avec les 10 axes + le socle en référence dans le prompt ; le backend **valide** contre la liste des 10
axes et applique un **fallback déterministe** (table composante→axe par défaut) si l'axe est absent/invalide.
On ne devine jamais côté front.

## 3. Étapes d'implémentation (backend d'abord, testable ; front ensuite)

**A. Backend — émission de l'axe (`src/chat_assistant.py`)**
- Étendre la consigne `MERMAID_JSON` (≈ligne 184) : chaque nœud ajoute `"axe": <un des 10 codes>` +
  rappel du socle (prise de RDV→processus_admin, continuité→equipe_rh, etc.).
- Le parseur (`parse_assistant_reply`, ~236) accepte le champ `axe` (rétro-compatible : optionnel).

**B. Backend — placement & dérivation (`src/placement.py`, NOUVEAU)**
- `AXES` (10 codes) + table de fallback `COMPOSANTE_AXE` + surcharges socle par mot-clé (`label`).
- `placer(objet) -> axe` : prend l'axe émis s'il est valide, sinon fallback.
- `footprint(graphe) -> {axe: {objets, etat_agrégé, references}}` (empreinte = capability map).
- `chaine_de_valeur(graphe) -> [étapes]` : séquence des objets ACTION/FLUX ordonnée par les liaisons
  PRODUIT/ALIMENTE/DELIVRE (gauche→droite). *(Point de vigilance, cf §5.)*
- `signaux(graphe) -> [...]` : R02 (objet CRITIQUE à fort degré entrant = point unique) ; R03
  (liaison en désalignement — réutiliser le lexique existant). Aligné `lugia_calibration_v1.md`.

**C. Backend — persistance (`src/db.py`)**
- Table `substrat(id, interview_id, module_id, email, graphe_json, derive_json, source, generated_at)`,
  clé logique `(interview_id, module_id)`. Helpers `upsert_substrat` / `get_substrat` /
  `list_substrats(interview_id)`. Créée par `init_db` (pattern `_ensure_*`).
- **Hook** dans `backend/main.py:post_chat_message`, après parsing (~966), `if parsed["ended"]` :
  `placement.derive(graphe)` → `db.upsert_substrat(...)`. Non bloquant (try/except, log).

**D. API (`backend/main.py` + `web/lib/api.ts`)**
- `GET /interviews/{id}/substrat` (auth + ownership) → agrège `list_substrats` : `{ chantiers:[{module_id,
  graphe, derive}], footprint_global }`. Type `Substrat` + `getSubstrat()` dans `api.ts`.

**E. Front — composants (`web/components/v3/`, NOUVEAUX)**
- `CapabilityMapV3.tsx` : 10 axes, empreinte (objets par axe, état patine, référencés), charte V3.
- `CarteVivanteV3.tsx` : **ruban = symboles** (les 8 glyphes, depuis `TYPES_OBJET`) pour la chaîne de
  valeur ; **carte = points** (objets colorés par `etat`, liaisons, désalignement en trait chaud).
  Réutilise les tokens charte V3 + `wsf/types.ts`. (Peut coexister avec `MermaidDiagram.tsx` ou le remplacer.)

**F. Intégration + tests**
- Insérer un bloc « Votre carte de capacité » + « Carte vivante du chantier » dans
  `web/components/v3/ResultatsV3.tsx`, alimenté par `getSubstrat`.
- Tests backend (aucune couverture chat/report aujourd'hui) : `tests/test_placement.py` (placement,
  footprint, chaîne de valeur, signaux) sur un graphe WSF de fixture.

## 4. Contrats (résumé)

- Entrée : `GrapheWSF` (objets+liaisons) émis par l'agent, **+ `axe` par objet**.
- Stockage : table `substrat` (graphe brut + dérivé).
- Sortie API : `{ chantiers[], footprint_global }`.
- Vues : capability map (empreinte) + carte vivante (ruban symboles / carte points).

## 5. Points de vigilance / décisions à acter

1. **Ordre du ruban** : la chaîne de valeur (gauche→droite) a besoin d'un ordre. Le tirer des liaisons
   (tri topologique sur PRODUIT/ALIMENTE/DELIVRE) **ou** faire émettre une `sequence` par l'agent. → trancher.
2. **Multi-axe** : un objet peut être référencé dans plusieurs axes (socle `référencé_dans`). L'agent
   émet-il un axe primaire + références, ou seulement l'axe primaire (références dérivées des liaisons) ? → trancher.
3. **Général vs chantier** : la capability map « cabinet » agrège les graphes de tous les modules ; chaque
   carte vivante est par chantier. Confirmer l'agrégation côté `footprint_global`.
4. **Remplacer ou compléter** `MermaidDiagram.tsx` : décider si la carte vivante remplace le rendu mermaid
   actuel dans la modale chat, ou s'ajoute seulement en restitution.

---
*Réutilise `web/lib/wsf/types.ts` (moteur WSF prod). Fondé sur `lugia_placement_objets_axes.md` (D-055),
`lugia_calibration_v1.md` (règles R02/R03). Démo de référence : `resources/methode/demo/`.*
