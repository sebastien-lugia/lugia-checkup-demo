# Lugia — Référence maître des AXES FONCTIONNELS (10 axes)
**Document MAÎTRE — à lire en premier.** Source de vérité du vocabulaire et des 10 axes ; tient à jour l'état d'alignement des autres specs.  
**Date** Juin 2026 · **aligné sur** Capability Map Générique **v8** (`capability_map_generique_v8.pdf`).  
**Statut** ✅ APPLIQUÉ aux sources le 2026-06-08 → `lugia_schema_spec_v0.6.md` (nouvelle source de vérité du schéma), `schema_exemple`, `coaching_dialog_spec`, `calibration_v1`, + jeu générique (`schema_spec_generique`, `coaching_dialog_generique`, `interview_protocol_generique`). Specs `v0.2`/`v0.4` laissées en historique (superseded par v0.6). HTML v7 / wsf_matrix non régénérés (backlog).  
**Rôle** (a) référence canonique des 10 axes, du vocabulaire (Axes/Domaines/Thèmes) et du rôle du WSF ; (b) patch document par document pour aligner toutes les specs sur 10 axes.

---

## 1. Référence canonique

**Vocabulaire (source = `schema_spec`)** : N1 **Axes** (10) · N2 **Domaines** · N3 **Thèmes** · N4 **Objets**. « Domaine » désigne **uniquement le N2**. Les 10 de tête sont des **Axes** (= la carte de capacité). Le **WSF (9 facettes) est une grille de lecture analytique posée PAR-DESSUS les axes** — il ne les définit pas, il les analyse sous 9 angles.

**Tagging v8** (par item de domaine/thème) : **maturité** ∈ {Essentiel, Courant, Optionnel, Émergent} · **nature** ∈ {Usage, Outil} · **facette** WSF.

**Les 10 axes :**

| # | code | label générique | label médecine (instanciation) | question |
|---|---|---|---|---|
| 1 | `coeur_metier` | Cœur de métier | Activité clinique | Quelle est l'activité centrale ? Que produit-on ? |
| 2 | `parcours_client` | Parcours client / bénéficiaire | Parcours patient | Comment le bénéficiaire vit-il la relation ? |
| 3 | `processus_admin` | Processus & Admin | Gestion administrative | Quels flux font tourner l'organisation au quotidien ? |
| 4 | `equipe_rh` | Équipe & RH | Équipe & RH | Comment les RH sont-elles organisées et protégées ? |
| 5 | `outils_data_infra` | Outils, Données & Infrastructure | Outils, Données & Infra | Avec quoi et sur quoi fonctionne-t-on ? |
| 6 | `finance` | Finance | Finance | L'activité est-elle viable et bien pilotée ? |
| 7 | `conformite` | Conformité, Sécurité & Éthique | Conformité, Sécurité & Éthique | Le cadre est-il couvert, conforme, éthique ? |
| 8 | `strategie` | Stratégie & Environnement | Stratégie & Environnement | Quels choix délibérés, quelles contraintes externes ? |
| 9 | `developpement_commercial` | Développement commercial | Développement & patientèle | Comment trouve-t-on et convainc-t-on de nouveaux bénéficiaires ? |
| 10 | `rd_innovation` | R&D & Innovation | Innovation de pratique | Comment invente-t-on le futur de l'organisation ? |

> **Axes 9 et 10 = optionnels par secteur** (comme déjà prévu pour l'axe 9 dans la version générique) : certaines professions réglementées ne « prospectent » pas, certaines petites structures n'ont pas de R&D formelle. Chaque instanciation sectorielle déclare si les axes 9 et 10 sont actifs. Variantes sectorielles à axes supplémentaires possibles (industrie, distribution).

---

## 2. Impacts structurels transverses

- **Grille** : `8 × 9 = 72 cellules` → **`10 × 9 = 90 cellules`**. Remplacer toute mention « 8×9 » / « 72 ».
- **« 8 axes » → « 10 axes »** partout (et « 9 axes » des versions intermédiaires).
- **Radar de complétude** : passe de **8 à 10 branches**. La formule (moyenne des thèmes par axe) est inchangée.
- **Coaching gratuit** : « 6 autres axes non couverts » → **« 7 autres »** (3 couverts sur 10).
- **Aucun seuil de calibration ne change** : les seuils sont par règle/objet/thème, jamais indexés sur le nombre d'axes.

---

## 3. Patch par document

**`schema_spec.md` (→ v0.6)**
- En-tête + §1.3 + §2.1 : « 8 axes × 9 facettes » → « 10 axes × 9 facettes » ; grille 8×9 → 10×9 (90 cellules).
- §4 (table des axes) : ajouter **axe 9** (`developpement_commercial`) et **axe 10** (`rd_innovation`), ordre 1→10 (cf §4 de ce document pour les textes).
- §13 (définitions détaillées) : ajouter les définitions des axes 9 et 10.
- Remplacer tous les « 8 axes » résiduels.

**`schema_exemple.md`**
- Inchangé sur le fond (l'exemple instancie un sous-ensemble d'axes). Remplacer « 8 axes » → « 10 axes » si mentionné. Optionnel : ajouter un objet d'exemple sur l'axe 9 ou 10.

**`calibration_spec.md` / `calibration_v1.md` / `calibration_roadmap.md`** (+ génériques)
- « 8×9 » / « 72 » → « 10×9 » / « 90 ». Radar 8 → 10 branches. Segmentation par axe inchangée. Aucun seuil numérique modifié.

**`coaching_dialog_spec.md`** (+ générique)
- Échange 18/20 : « 6 autres axes » → « 7 autres axes ». Listes d'axes grisés : 10 au total.

**`interview_protocol_generique.md`**
- Toute énumération d'axes → 10. Ajouter des relances pour les axes 9 (développement) et 10 (R&D).

**`capability_map_generique_v7.html`** + **`wsf_matrix_v7.html`**
- HTML v7 **périmé** (9 axes ; nomme à tort les axes « domaines ») → la **v8 PDF fait foi**. Régénérer le HTML à **10 axes** avec le vocabulaire « Axes » + le tagging maturité/nature/facette.
- `wsf_matrix` : 8 axes × 9 facettes → **10 × 9**.

**Versions génériques** : mêmes patchs ; la note « axe 9 optionnel » devient « **axes 9 et 10 optionnels** par secteur ».

---

## 4. Textes prêts à coller — axes 9 et 10

**Axe 9 — Développement commercial** (`developpement_commercial`)
> *Comment l'activité se développe — comment on trouve et convainc de nouveaux bénéficiaires.*
> Domaines (v8) : Réputation & présence · Fidélisation & récurrence · Partenariats commerciaux · Communication institutionnelle & marque. **Optionnel par secteur.**

**Axe 10 — R&D & Innovation** (`rd_innovation`)
> *Comment l'organisation invente son futur — crée-t-elle de nouvelles connaissances, méthodes ou offres ? Investit-elle dans son propre renouvellement ?*
> Domaines (v8) : Veille & intelligence prospective (veille scientifique & technologique · veille réglementaire prospective · détection des signaux faibles) · Innovation de pratique & de processus (expérimentation de nouvelles techniques · innovation organisationnelle). **Optionnel par secteur.**

---

## 5. Règles de détection (N8) — impact

Aucune règle R01–R15 ne référence un **nombre fixe** d'axes → **aucune règle à modifier**. Les règles « par axe » (R01 axe sans acteur, R06 axe Finance vide…) s'appliquent automatiquement aux 10. À envisager au backlog : des règles sectorielles propres aux axes 9 et 10 (ex. « développement commercial sans canal d'acquisition », « aucune veille sur un marché en évolution rapide »).

---

*Patch de réconciliation — à appliquer aux sources, puis régénérer les versions médecine et génériques.*
