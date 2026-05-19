# Specs design — Refonte UI questionnaire V1.1.9

**Version** : 1.0 — 19 mai 2026
**Auteur** : conversation V1.1.9 (track Démonstrateur technique)
**État** : à valider avant production du wireframe et code Next.js

---

## 1. Contexte

Le questionnaire `web/app/checkup/page.tsx` reste sur l'UI V1 d'origine : progress bar fine en haut, pill facette uppercase, titre serif 22px, options radio en cartes, deux boutons. Visuellement brut, sans respiration entre les facettes, sans écran d'intro, sans transition. Q01 (format cabinet) et Q02 (qui prend les RDV) captent du contexte mais restent pauvres : aucune question sur le statut d'installation, le territoire, la patientèle dominante, ou l'horizon de projection — autant de données qui permettraient au rapport (et au SLM V1.2) de moduler la lecture.

V1.1.9 est la vague de remise à niveau visuelle + enrichissement du contexte de départ. Pas de changement de scoring. Pas de câblage des nouvelles questions dans le rapport (différé V1.1.10/V1.2).

---

## 2. Direction UI cible — moderne, immersive, métier

### Principe directeur

**Une question = un écran calme.** Le médecin ne doit pas avoir l'impression de remplir un formulaire administratif mais de répondre à un entretien guidé. Air, typographie posée, transitions douces, vocabulaire métier conservé tel qu'il est.

### Layout

- Fond crème inchangé (`#faf9f5`).
- Page centrée verticalement et horizontalement, contenu `max-w-[680px]` (un peu plus serré que `max-w-2xl` actuel pour densifier le regard).
- Hauteur min-screen avec contenu en haut de la fold (pas centré vertical : laisse de la place pour le clavier mobile).
- Marges latérales généreuses (`px-8` mobile, `px-12` desktop).

### Bandeau supérieur (remplace AppHeader)

Mode **questionnaire** dédié : pas de nav complète, juste un mini-bandeau pour ne pas distraire.

- Logo Lugia à gauche (texte simple, lien vers `/`).
- À droite : lien discret « Quitter et reprendre plus tard » (text-sm, gris).
- Bordure basse 1px `lugia-border`.

### Indicateur de progression — segmenté par section

Sous le bandeau, une rangée de **6 segments** correspondant aux 6 facettes (`context`, `processes`, `participants`, `information`, `motivation`, `closing`). Chaque segment :

- Largeur proportionnelle au nombre de questions de la facette.
- État : à venir (`bg-lugia-bg-soft`), en cours (`bg-lugia-accent`), passé (`bg-lugia-text-secondary`).
- Hauteur 4px, gap 2px entre segments, border-radius 1px.
- En dessous : label de la section en cours (`text-xs uppercase tracking-wider text-lugia-text-tertiary`) + compteur `Q5 / 17` à droite.

L'avantage sur la barre simple actuelle : le médecin voit où il en est dans le parcours global ET dans quelle section il est. La pill facette uppercase actuelle disparaît (redondante avec ce label).

### Écran question

Hiérarchie verticale stricte :

1. **Label section** (uppercase, gris) — `Contexte` / `Parcours patient` / etc.
2. **Question principale** — police serif (continuité éditoriale Lugia), 26px desktop / 22px mobile, `font-medium`, line-height serrée. Marge basse 16px.
3. **Note pédagogique** (si présente) — `Par exemple : …` ou `Note : …` en italique grisée 13px, marge basse 32px.
4. **Champ libre** (Mode B/C uniquement) — `textarea` plus présente (rows 4 desktop / 3 mobile), bordure douce, focus ring discret.
5. **Sous-question QCM** (Mode A/B) — phrase d'introduction de la liste (15px medium) + options.
6. **Options radio en cartes** — design retravaillé (voir §3).
7. **Complément libre optionnel** (Mode A/B) — uniquement après sélection si applicable.

### Boutons de navigation

- **Suivant** — bouton plein, plus large, ancrage en bas de l'écran question (sticky sur mobile pour rester accessible au-dessus du clavier).
- **Précédent** — texte simple à gauche du Suivant, gris discret.
- Raccourci clavier : `Entrée` valide et passe à la suivante quand le champ est complet.

### Transitions

- Entre questions : fade-out 120ms + fade-in + léger slide vertical (8px) — animation rapide pour ne pas ralentir le rythme.
- Entre facettes : **carton de transition** non bloquant (visible 1.2s + skip possible au clic ou à `Entrée`). Carton minimal :
  - Label section uppercase
  - Une phrase pédagogique courte (ex. *« On regarde maintenant comment les demandes patients circulent jusqu'à vous. »*)
  - Mini-indicateur de progression facette à droite
  - Pas de bouton — touche un point d'air entre deux pavés de questions, sans casser le rythme.

### Sauvegarde visible

Pastille discrète en bas à droite de l'écran question : `✓ Enregistré` visible 1.5s après chaque clic Suivant, puis fade-out. Confirme silencieusement que la session est sauvée — gain de confiance sans bruit.

---

## 3. Options radio retravaillées

Les cartes actuelles sont fonctionnelles mais visuellement plates (border 1px gris uniforme, fond bg-card crème, pas de hover marqué). Refonte :

- Espacement vertical entre options : `gap-2.5` (au lieu de `space-y-2`).
- Padding intérieur plus généreux : `px-5 py-4`.
- Border par défaut : `border-lugia-border`. Hover : `border-lugia-text-tertiary` + très léger soulèvement (`shadow-sm`). Sélectionnée : `border-lugia-accent` + `bg-lugia-accent-soft` + check-mark gauche au lieu du radio natif.
- Label en 15px, descriptions secondaires (texte après tiret) en 13px gris à la ligne d'en dessous (au lieu d'être en flux continu).
- Option « Autre » : visuellement identifiée par un fond légèrement teinté (`bg-lugia-bg-soft`) avant sélection.
- Input texte conditionnel (cas « Autre » + `has_entity_field`) : transition `max-height` douce à l'apparition au lieu d'apparaître brut.

---

## 4. Écran d'intro — avant Q01

Aujourd'hui le médecin clique « Commencer » depuis l'accueil et tombe directement sur Q01. On rajoute un **écran d'intro dédié** au questionnaire :

```
[Bandeau Lugia minimal]

CHECK-UP PRÉVENTIF

Première lecture de votre cabinet
en ~30 minutes

Vous allez répondre à ~17 questions sur le fonctionnement de votre
cabinet. Pas de bonne ou de mauvaise réponse — on cherche à voir
ensemble ce qui tient bien, ce qui pèse, et ce qui mérite un coup d'œil.

[3 garde-fous en colonnes ou liste tirée]
  – Aucune donnée patient identifiable n'est saisie.
  – Le check-up porte sur votre organisation, pas sur votre clinique.
  – Vous pouvez interrompre et reprendre plus tard à tout moment.

[Bouton plein] Commencer le check-up
```

H1 en serif 32px, sous-titre 16px gris. Garde-fous en 14px avec petits chevrons gris. Apparu une seule fois au début, jamais ré-affiché si l'utilisateur reprend.

---

## 5. Écran de fin

Aujourd'hui : *« Merci. Vos 14 réponses sont enregistrées. »* + 2 boutons.

Amélioration légère :

- H1 serif 32px : *« Merci pour vos réponses. »*
- Paragraphe (16px) : *« Vos {N} réponses sont enregistrées. Le rapport reprend votre situation, met en regard trois angles d'analyse, et propose trois opportunités d'action concrètes. Bonne lecture. »*
- Bouton principal *« Voir mon check-up »* (plein) + lien discret *« Retour à l'accueil »*.
- Pas de carton de célébration ou d'effet visuel — sobriété médicale.

---

## 6. Bloc Contexte de départ enrichi

### Reformulation Q01 (format cabinet) — mode A

Le libellé est correct, mais les options pourraient distinguer petits et moyens cabinets de groupe (la dynamique d'un cabinet de 2 médecins n'est pas celle d'un cabinet de 5).

| ID | Libellé proposé V1.1.9 |
|---|---|
| q01_a | **Solo** — un seul médecin au cabinet |
| q01_b | **Cabinet de groupe — 2 à 3 médecins** |
| q01_c | **Cabinet de groupe — 4 à 5 médecins** |
| q01_d | **MSP** — Maison de santé pluriprofessionnelle |
| q01_other | Autre |

Impact scoring : nul (Q01 n'est pas dans `scored_facets`). Impact templates : à terme V1.2 SLM, la cascade `porteur_solo` peut être affinée selon q01_a vs q01_b/c. En V1.1.9, on conserve le mapping actuel (Q01 alimente déjà le repère solo via la cascade phrase_choc et la sélection des fragments swot — à valider qu'aucun template ne dépend littéralement de l'ID `q01_c` actuel).

### Q02 (qui prend les RDV) — mode A — retouche mineure

Libellé conservé. Petites précisions sur les options pour aligner avec le nouveau ton métier :

| ID | Libellé V1.1.9 |
|---|---|
| q02_a | **Secrétariat interne** — au cabinet, temps plein ou partiel |
| q02_b | **Télésecrétariat externalisé** — prestataire à distance |
| q02_c | **Mixte interne + externalisé** |
| q02_d | **Vous-même** — sans secrétariat |
| q02_other | Autre |

Pas de changement de sémantique. Les fragments swot et templates qui exploitent q02_a/b/c/d restent valides.

### Nouvelles questions de contexte — 3 ajouts

Toutes en facette `context` (donc **hors scored_facets** — pas d'impact direct sur le scoring V1.1.9). Mode A pour rester rapide en début de parcours. **Non câblées dans le rapport en V1.1.9** — collectées en base pour exploitation V1.2 SLM (substrat). Inscrites en ROADMAP V1.2 pour modulation cascade phrase_choc et orientation chantiers.

**Q01bis — Statut d'installation** (avant Q03, après Q02)
> Depuis combien de temps exercez-vous dans ce cabinet ?

| ID | Libellé |
|---|---|
| q01bis_a | **Installation récente** — moins de 3 ans |
| q01bis_b | **Installé** — entre 3 et 15 ans |
| q01bis_c | **Senior** — plus de 15 ans |
| q01bis_d | **Approche transmission** — moins de 5 ans avant cession ou retraite |
| q01bis_e | **Remplaçant** — pas titulaire du cabinet |
| q01bis_other | Autre |

**Q01ter — Territoire et patientèle dominante** (après Q01bis)
> Comment décririez-vous votre territoire et votre patientèle ?

| ID | Libellé |
|---|---|
| q01ter_a | **Urbain dense** — patientèle variée, demande forte, peu de visites à domicile |
| q01ter_b | **Périurbain ou ville moyenne** — patientèle mixte, accès correct aux confrères |
| q01ter_c | **Rural ou semi-rural** — patientèle vieillissante, visites fréquentes |
| q01ter_d | **Zone sous-dotée** — délais longs, peu de spécialistes accessibles |
| q01ter_other | Autre |

**Q01quater — Horizon des 3 prochaines années** (après Q01ter — ou après Q06 selon test UX)
> Quel est votre horizon pour les 3 prochaines années ?

| ID | Libellé |
|---|---|
| q01quater_a | **Reconduire à l'identique** — pas de changement majeur prévu |
| q01quater_b | **Renforcer l'équipe** — recruter un associé, un assistant, une secrétaire |
| q01quater_c | **Déménager ou agrandir** — nouveau local, extension du cabinet |
| q01quater_d | **Préparer la transmission** — cession, départ, succession |
| q01quater_e | **Encore incertain** — pas de cap arrêté |
| q01quater_other | Autre |

**Note placement** : les 3 nouvelles questions sont positionnées **avant Q03**, sauf Q01quater qui peut migrer en fin si jugé trop redondant avec Q06. À trancher en V1.1.9-a sur wireframe.

### Total questions

V1.1.8 : 14 questions. V1.1.9 : 14 + 3 = **17 questions**, dont 5 dans le bloc Contexte (Q01, Q02, Q01bis, Q01ter, Q01quater).

Temps cible : ~30 min reste tenable (les 3 nouvelles questions sont mode A pur, ~30s chacune).

---

## 7. Impacts sur le code et les ressources

### Frontend
- `web/app/checkup/page.tsx` : refonte structure (intro screen, carton de transition, indicateur segmenté, sauvegarde visible, transitions). Réutilise `CheckupWidgets`.
- `web/components/CheckupWidgets.tsx` : retouche `OptionRadioList` (cartes plus généreuses, check-mark, descriptions secondaires) + `ModeAWidget/ModeBWidget/ModeCWidget` héritent.
- `web/app/globals.css` : nouvelles classes pour animations (fade-slide), responsive ajusté pour 17 questions.
- Pas de changement sur `web/app/resultats/page.tsx`.

### Backend
- Aucun changement structurel. `interview_protocol.json` v1.10 ingère les 3 nouvelles questions ; l'API `/protocol` et `/answers` les sert sans modification.

### Ressources
- `resources/interview_protocol.json` v1.10 : 17 questions, Q01/Q02 retouchées, Q01bis/Q01ter/Q01quater ajoutées (mode A, facet context).
- `resources/interview_protocol.md` v1.10 : section règles globales conservée, tableau des questions mis à jour.
- `resources/sample_answers_pchateau.md` v2.1 : 3 nouvelles réponses ajoutées (Chateau = senior, périurbain, transmission anticipée).
- `scripts/seed_persona.py` : 3 nouvelles entrées seed Chateau.

### Scoring / templates
- **Aucun changement** en V1.1.9. Les fragments `src/swot.py` et `src/templates.py` qui ciblent Q01/Q02 sont vérifiés non régressifs (ils ciblent les IDs `q01_a/b/c` et `q02_a/b/c/d` — qu'on **conserve à l'identique** en V1.1.9, on ajoute seulement `q01_c` (4-5 médecins, équivalent ex-q01_b 2-5)). À auditer en passe-systématique V1.1.9-c.
- Câblage Q01bis/Q01ter/Q01quater : **différé V1.2** (substrat SLM).

### Migration BDD
- Aucune. Les nouvelles réponses sont stockées comme les autres dans la table `answer`.

---

## 8. Critères d'acceptation V1.1.9

- [ ] Refonte UI conforme au wireframe HTML validé (V1.1.9-a) : intro screen, indicateur segmenté, transitions facette, sauvegarde visible, cartes options retravaillées.
- [ ] 17 questions intégrées au protocole (Q01/Q02 retouchées + Q01bis/Q01ter/Q01quater ajoutées en mode A facet context).
- [ ] Persona Chateau mis à jour (5 réponses dans le bloc Contexte de départ — q01_a solo, q02_b télésecrétariat, q01bis_c senior, q01ter_b périurbain, q01quater_d transmission anticipée).
- [ ] Aucune régression scoring : le rapport généré pour Chateau reste **identique** sur les 3 facettes scored (processes/participants/information) à V1.1.8-a (mêmes niveaux, mêmes fragments swot, mêmes opportunités).
- [ ] Aucune régression sur les fragments narratifs : la cascade phrase_choc, les chaînes causales et les analyses chantier produisent un résultat identique à V1.1.8-a.
- [ ] Parcours bout en bout passant en local (intro → 17 questions → écran fin → résultats), reprise session opérationnelle, responsive mobile validé (≤640px), impression propre.

---

## 9. Hors périmètre V1.1.9 (différé V1.1.10 ou V1.2)

- **Câblage Q01bis/Q01ter/Q01quater dans le rapport** — modulation cascade phrase_choc, orientation chantiers selon statut/territoire/horizon. Différé V1.2 SLM (le substrat est posé en V1.1.9, l'intelligence vient ensuite — discipline D-020).
- **Câblage des CTAs Prochaine étape** (toujours bloquant tests prospects). → V1.1.10 dédiée.
- **Construction du questionnaire d'approfondissement Path A** (toujours bloquant). → V1.1.10 dédiée.
- **Sauvegarde automatique en cours de saisie** (au-delà du clic Suivant) — possible mais non prioritaire ; reportée si retours tests prospects l'exigent.

---

## 10. Trajectoire vers V1.2

V1.1.9 enrichit le **substrat** contextuel sans changer la mécanique narrative. C'est exactement le pattern D-020 (« méthodologique d'abord, intelligence ensuite ») et D-027 (« simplification radicale 9→3 facettes assumée, récupération progressive en V1.2 »). Le SLM V1.2 pourra exploiter Q01bis/Q01ter/Q01quater pour :

- Moduler la cascade phrase_choc selon l'horizon (transmission → priorité transmissibilité ; renforcer équipe → priorité cadrage organisationnel).
- Adapter la voix de la recommandation italique selon le territoire (rural sous-doté → registre différent qu'urbain dense).
- Calibrer les fragments swot selon l'ancienneté (un senior établi reçoit une lecture différente d'un installé récent).

Le câblage exact sera arbitré en V1.2 sur la base de retours tests prospects V1.1.10.

---

*Fin des specs V1.1.9. Toute modification doit être validée et journalisée en CHANGELOG + DECISIONS (D-028 à créer).*
