# Interview Protocol — V1.1

Protocole du questionnaire du démonstrateur Lugia Check-up. Dix-sept questions structurées qui couvrent les trois facettes WSF retenues en V0 (Processus & Activités, Participants, Information), avec un bloc Contexte de départ enrichi en V1.1.9 (5 questions de qualification : type de cabinet, prise des RDV, statut d'installation, territoire et patientèle, horizon 3 ans), une question de motivation au milieu, et une question de clôture.

> Version 1.10 — 19 mai 2026 — V1.1.9 (refonte apparence questionnaire + enrichissement contexte de départ).

> **Source de vérité technique :** `resources/interview_protocol.json`. Ce `.md` est la documentation humaine — toute évolution structurelle doit être faite dans le JSON et répercutée ici manuellement. Un test de cohérence (`src/questions.py::check_md_json_consistency`) vérifie au démarrage que les IDs de question et le compte sont alignés.

> **Note v1.10 :** V1.1.9 — enrichissement du bloc Contexte de départ. (1) Q01 reformulé : `q01_b` devient "Cabinet de groupe — 2 à 3 médecins" (au lieu de 2-5), nouveau `q01_d` "Cabinet de groupe — 4 à 5 médecins" ajouté en fin de liste avant `q01_other`. `q01_c` (MSP) inchangé pour rétro-compat 100% des données prod. (2) Libellés Q02 légèrement reformulés sans toucher aux IDs. (3) Trois nouvelles questions ajoutées en positions 3, 4, 5 : `q15` statut d'installation, `q16` territoire et patientèle, `q17` horizon 3 ans. Toutes mode A, facette `context`, non scorées. Décalage des positions Q03-Q14 de +3. **IDs `q03..q14` strictement inchangés.** Les nouvelles questions sont collectées en BDD mais non câblées dans le rapport en V1.1.9 — substrat pour V1.2 SLM (cf D-020 et D-028).

> **Note v1.5 :** Vague 3.1d — six retours utilisateur sur le rendu : Q02_d "Aucun" → "Personne". Q05 open_prompt raccourci avec note séparée "courriers, ordonnances, certificats, suivi de dossiers" + reformulation "plus de temps" et "heures de travail prévues". Q09 qcm_prompt raccourci avec note séparée. Q11 libellés affinés : "Signalement automatique" au lieu de "Alerte automatique", "résultats" au lieu de "boîte de résultats". Q13_d : "IA grand public, en connaissance de cause" (plus pro que "sans illusion"). Le frontend `ModeAWidget` split désormais sur " Note :" comme `ModeBWidget` pour afficher la note en typographie atténuée sous le qcm_prompt.

> **Note v1.4 :** Vague 3.1 — six retours utilisateur intégrés. Q03 réalignée sur un axe unique homogène "niveau de cadrage" (écrit appliqué / oral / écrit peu suivi / pas de cadre). Q05 reformulée (free_text sur les tâches récurrentes hors temps de travail, frontière q05_c cabinet vs q05_d domicile clarifiée). Q06_c, Q08_a reformatés au format "mot-clé — détail". Q10_b neutralisé pour le solo. Q11 reformulé en libellés professionnels avec format "mot-clé — détail". Format "mot-clé — détail" appliqué de manière homogène partout où c'est naturel. Voir `CHANGELOG.md` 2026-05-15 V1.1 Vague 3.1.

> **Note v1.3 :** refonte Vague 3 — Q2 à Q11 réécrites pour répondre aux règles globales V1.1 (factualité, exclusivité, mise en scène, 4 options + Autre). Q4, Q6 et Q11 changent de mode (B/C → A) pour supprimer le doublon entre la réponse libre et le QCM, ou parce que la motivation se traite mieux en QCM. Voir `DECISIONS.md` D-021.

> **Note v1.2 (historique) :** suppression de Q05 d'origine (canal principal de RDV), redondante avec Q04. Total passé de 15 à 14 questions.

---

## 1. Règles globales V1.1

Toute question scorée du questionnaire respecte les cinq règles suivantes. Toute évolution future doit en passer par elles avant d'être validée.

1. **4 options principales + une option Autre.** Chaque option Autre permet une saisie inline directe (UX type Claude, livrée Vague 1). Pas de 3 options, pas de 5 options.
2. **Options factuelles.** Pas de "beaucoup", "souvent", "rarement" : on ancre l'option dans une situation observable (un moment, un volume, une fréquence chiffrée, un acte vécu). Le répondant doit pouvoir reconnaître objectivement sa situation.
3. **Options mutuellement exclusives.** Une réponse possible doit pointer sur une et une seule option. Pas de combinaison silencieuse "cadre clair + surprises régulières".
4. **Mise en scène d'une situation réelle quand c'est possible.** Préférer "À 19h en fin de journée, vos courriers du jour…" à "À combien estimez-vous votre charge administrative ?". Plus stimulant cognitivement, plus juste à l'auto-évaluation.
5. **Mode B et C parcimonieux.** Le mode B (ouvert puis QCM) et le mode C (ouvert pur) ne sont conservés que là où la réponse libre apporte un matériau verbatim irremplaçable : Q5 (récit du soir/weekend), Q13 (contexte d'usage IA), Q14 (aspiration finale).

Conséquence sur l'alternance : la distribution V1.1 est **10 Mode A, 3 Mode B, 1 Mode C** au lieu de 8 A / 4 B / 2 C en V1.0. L'alternance se dégrade volontairement au profit de la cohérence factuelle. Cf D-021.

---

## 2. Cadre du questionnaire

### Modes d'interaction

Trois modes alternés à dessein pour préserver l'engagement du répondant. Le détail est dans `MASTER_PROMPT.md` section 7.

- **Mode A — QCM avec complément optionnel.** Choix unique parmi 4 options pré-écrites plus "Autre". Un champ de complément libre est toujours affiché, optionnel sauf si "Autre" est choisi (alors il devient une précision obligatoire saisie inline dans l'option Autre).
- **Mode B — Hybride.** Une question ouverte courte d'abord, puis une relance QCM, puis un complément optionnel. Réservé aux questions où la réponse libre apporte un matériau verbatim irremplaçable.
- **Mode C — Ouvert pur.** Réponse libre, sans relance structurée. En V1.1 : une seule question (Q14, clôture). Q06 (motivation) est passée en Mode A.

### Distribution V1.1.9

| Position | ID | Mode | Facette | Sujet |
|---|---|---|---|---|
| 1 | Q01 | A | Contexte | Type de cabinet |
| 2 | Q02 | A | Contexte | Prise des RDV et des appels |
| 3 | Q15 | A | Contexte | Statut d'installation |
| 4 | Q16 | A | Contexte | Territoire et patientèle |
| 5 | Q17 | A | Contexte | Horizon 3 prochaines années |
| 6 | Q03 | A | Participants | Cadre du secrétariat |
| 7 | Q04 | A | Processus | Canaux d'entrée des demandes |
| 8 | Q05 | B | Processus | Charge administrative en fin de journée |
| 9 | Q06 | A | Motivation | Pourquoi ce check-up maintenant |
| 10 | Q07 | A | Participants | Équipe étendue du cabinet |
| 11 | Q08 | A | Participants | Continuité en cas d'absence |
| 12 | Q09 | A | Information | Nombre d'outils numériques |
| 13 | Q10 | A | Information | Suivi des patients chroniques |
| 14 | Q11 | A | Information | Tri des résultats d'examens |
| 15 | Q12 | A | Processus | Téléconsultation |
| 16 | Q13 | B | Information | Usage de l'IA générative |
| 17 | Q14 | C | Clôture | Ce qui vous aiderait le plus |

Alternance : **A A A A A A A B A A A A A A A B C** (15 A, 2 B, 1 C). Le bloc Contexte de départ enrichi (5 mode A consécutifs) ouvre le parcours sur des questions rapides à répondre. L'alternance reprend ensuite avec Q05 (Mode B) puis se stabilise.

### Métadonnées des options

Chaque option en mode A ou B porte :

- **Score santé** : entier 0 à 10. Une valeur élevée signifie un état de système favorable, une valeur basse signale une fragilité. La valeur `null` indique une option non scorée (contextuelle, "Sans objet" ou "Autre").
- **Type de nœud** : ontologie minimale V0 (Acteur, Outil, Processus, Information, Symptôme, Cause, Risque). Détaillée dans `modeling_scoring.md`.
- **Tags** : mots-clés courts pour l'agrégation et le filtrage.

Le score de facette en V0/V1.1 reste la moyenne des scores santé des options sélectionnées dans cette facette. Le détail du calcul est recalculable à la volée depuis la table `answer` (voir `DECISIONS.md` D-013).

---

## 3. Les 17 questions

Description courte par question. Les options et leurs métadonnées sont dans le JSON canonique.

### Q01 — Type de votre cabinet

Mode A · Contexte · non scoré. Qualification de la structure du cabinet. **Refonte V1.1.9** : ajout d'une distinction cabinet de groupe 2-3 vs 4-5 médecins. `q01_a` (Solo) et `q01_c` (MSP) inchangés. `q01_b` reformulé en "Cabinet de groupe — 2 à 3 médecins". Nouveau `q01_d` "Cabinet de groupe — 4 à 5 médecins" ajouté avant `q01_other`.

### Q02 — Prise des rendez-vous et des appels

Mode A · Contexte · non scoré. Qui prend les RDV et les appels patients. Refonte V1.1 : l'option d'origine "Non, pas de secrétariat" est remplacée par **"Moi-même (pas de secrétariat dédié)"**, qui rend explicite le cas du libéral solo qui gère lui-même. V1.1.9 : libellés légèrement reformulés sans changement des IDs.

### Q15 — Statut d'installation

Mode A · Contexte · non scoré. **Ajoutée en V1.1.9** (position 3). Capture le moment de carrière du médecin : installation récente (<3 ans), installé (3-15 ans), senior (>15 ans), approche transmission (<5 ans), remplaçant. Non câblée dans le rapport en V1.1.9 — substrat pour V1.2 SLM (modulation cascade phrase choc selon horizon temporel).

### Q16 — Territoire et patientèle

Mode A · Contexte · non scoré. **Ajoutée en V1.1.9** (position 4). Capture le contexte d'exercice : urbain dense, périurbain, rural, zone sous-dotée. Non câblée dans le rapport en V1.1.9 — substrat pour V1.2 SLM (orientation chantiers selon contraintes territoriales).

### Q17 — Horizon des 3 prochaines années

Mode A · Contexte · non scoré. **Ajoutée en V1.1.9** (position 5). Capture la projection à court-moyen terme : reconduire à l'identique, renforcer l'équipe, déménager ou agrandir, préparer la transmission, encore incertain. Non câblée dans le rapport en V1.1.9 — substrat pour V1.2 SLM (croisement avec Q06 motivation pour adapter la voix de la recommandation).

### Q03 — Cadre du secrétariat

Mode A · Participants · scoré. Refonte Vague 3.1 sur un axe unique homogène — **le niveau de cadrage explicite des règles de tri**. Quatre paliers exclusifs : cadre écrit ET appliqué (9), cadre oral défini au démarrage (6), cadre écrit mais peu suivi dans les faits (4), pas de cadre formel (3). L'option "Sans objet" est conservée pour les cabinets sans secrétariat. L'option Vague 3 "découvertes surprenantes" (q03_d) disparaît du QCM : hors axe, elle pouvait coexister avec un cadre formel. Le complément libre récupère ce cas si besoin.

### Q04 — Canaux d'entrée des demandes

Mode A · Processus · scoré. Refonte V1.1 : **passage de Mode B à Mode A**. La réponse libre faisait doublon avec le QCM. Le QCM seul, complété par le champ optionnel, suffit à capter l'organisation des canaux. Options inchangées sur le fond, libellés normalisés.

### Q05 — Charge administrative en fin de journée

Mode B · Processus · scoré. Vague 3.1 : free_text reformulé sur les tâches récurrentes que le médecin n'arrive pas toujours à finir pendant son temps de travail (moins direct que "hier soir"). QCM clarifié sur l'axe "où aboutissent ces tâches" — au fil de l'eau, lendemain matin, bloc fin de journée au cabinet, ou domicile/week-end. La frontière q05_c (au cabinet) vs q05_d (à la maison) est désormais nette.

### Q06 — Pourquoi ce check-up maintenant

Mode A · Motivation · non scoré. Refonte Vague 3 : **passage de Mode C à Mode A** (4 typologies). Vague 3.1 : q06_c reformatée au format "mot-clé — détail" pour homogénéité avec les autres options.

### Q07 — Équipe étendue du cabinet

Mode A · Participants · scoré. Inchangée depuis V1.0.

### Q08 — Continuité en cas d'absence

Mode A · Participants · scoré. Refonte Vague 3.1j : la question capte désormais les deux dimensions (congés planifiés ET absence imprévue de plusieurs jours) en 4 options graduées. Le palier intermédiaire 'préparé pour le planifié, fragile pour l'imprévu' (q08_c) capte le profil le plus courant chez les médecins solo. Comble le gap axe 2 Lugia (imprévus et surcharges ponctuelles) identifié en audit V1.1.

### Q09 — Nombre d'outils numériques

Mode A · Information · scoré. Refonte Vague 3 : axe factuel "nombre d'outils + double saisie" en 4 paliers chiffrés. Vague 3.1 : libellés reformatés au format "mot-clé — détail". Aucune marque nominale.

### Q10 — Suivi des patients chroniques

Mode A · Information · scoré. Vague 3.1 : libellés reformatés "mot-clé — détail". Q10_b neutralisé pour rester valide quand le médecin est solo ("Liste de relance — je la tiens à jour (seul ou avec mon équipe)"). Une génération dynamique selon Q02/Q07 est inscrite en V1.2.

### Q11 — Tri des résultats d'examens

Mode A · Information · scoré. Vague 3.1 reformule les quatre options en libellés professionnels au format "mot-clé — détail" : alerte automatique, tri délégué, vérification régulière, vérification opportuniste. Toujours exclusives, toujours centrées sur l'organisation actuelle du tri.

### Q12 — Téléconsultation

Mode A · Processus · scoré. Inchangée depuis V1.0. Jugée OK par l'utilisateur en backlog Vague 3.

### Q13 — Usage de l'IA générative

Mode B · Information · scoré. Jugée OK par l'utilisateur en backlog Vague 3. Refonte V1.1 mineure : les libellés des options d'origine c et d ne citent plus nommément "ChatGPT" — généralisation en "IA grand public". Cohérent avec le ton du rapport Vague 2 lite et avec le retour utilisateur "ne pas citer nommément le moteur d'IA".

### Q14 — Ce qui vous aiderait le plus

Mode C · Clôture · non scoré. Inchangée. Le traitement de la réponse libre dans la synthèse est différé à V1.2 (SLM) — cf D-020.

---

## 4. Réponses attendues du persona Dr Chateau — V1.1

Pour calibration. La session V1.1 du persona doit produire les scores documentés dans `sample_answers_pchateau.md`.

| Position | ID | Choix attendu | Mode | Facette |
|---|---|---|---|---|
| 1 | Q01 | `q01_a` (solo) | A | Contexte |
| 2 | Q02 | `q02_b` (télésecrétariat externalisé) | A | Contexte |
| 3 | Q15 | `q15_c` (senior — plus de 15 ans) | A | Contexte |
| 4 | Q16 | `q16_b` (périurbain ou ville moyenne) | A | Contexte |
| 5 | Q17 | `q17_d` (préparer la transmission) | A | Contexte |
| 6 | Q03 | `q03_d` (pas de cadre formel) | A | Participants |
| 7 | Q04 | `q04_d` (canaux parallèles directs) | A | Processus |
| 8 | Q05 | `q05_d` (débordement domicile) | B | Processus |
| 9 | Q06 | `q06_c` (événement déclencheur) | A | Motivation |
| 10 | Q07 | `q07_a` (porte seul) | A | Participants |
| 11 | Q08 | `q08_c` (préparé planifié, fragile imprévu) | A | Participants |
| 12 | Q09 | `q09_d` (plus de cinq outils, double saisie) | A | Information |
| 13 | Q10 | `q10_d` (perte de vue des chroniques) | A | Information |
| 14 | Q11 | `q11_c` (consulte plusieurs fois par jour) | A | Information |
| 15 | Q12 | `q12_b` (téléconsultation non cadrée) | A | Processus |
| 16 | Q13 | `q13_d` (IA grand public non conforme assumée) | B | Information |
| 17 | Q14 | Texte libre — désir de temps pour la famille | C | Clôture |

Calcul indicatif V1.1 (à confronter au scoring effectif) :

- Processus : Q04 (3) + Q05 (2) + Q12 (5) → **score 3 / 10**.
- Participants : Q03 (3) + Q07 (3) + Q08 (4) → **score 3 / 10**.
- Information : Q09 (2) + Q10 (2) + Q11 (5) + Q13 (2) → **score 3 / 10**.

(Les scores affichés au médecin sont des entiers sur 10. Le détail des contributions reste exposé en transparence — cf D-013 justifiabilité mathématique.)

---

## 5. Notes d'implémentation

Implémentation V1.1 dans `web/app/checkup/page.tsx` et `web/components/CheckupWidgets.tsx` :

- Chargement des questions via l'API `/questions` (backend `src/questions.py::load_questions()`).
- Affichage d'une seule question par écran avec indicateur de progression segmenté par facette (X sur 17, refonte V1.1.9).
- Pour **Mode A** : radio buttons (obligatoire) + champ de complément optionnel. Option "Autre" : saisie inline directe dans l'option (UX type Claude, livrée Vague 1).
- Pour **Mode B** : zone de texte ouverte (obligatoire) puis radio + complément optionnel.
- Pour **Mode C** : zone de texte ouverte (obligatoire).
- Persistance immédiate dans `answer` (avec libellé de l'option choisie pour lisibilité directe en base).
- Boutons "Précédent" (sauf à la première question), "Suivant"/"Terminer" (validé selon le mode), "Quitter et reprendre plus tard".
- Préremplissage des widgets à partir de la base au retour sur une question déjà répondue.

---

*Version 1.10. Toute évolution structurante de ce protocole doit être journalisée dans `DECISIONS.md`.*
