# Interview Protocol — V1.1

Protocole du questionnaire du démonstrateur Lugia Check-up. Quatorze questions structurées qui couvrent les trois facettes WSF retenues en V0 (Processus & Activités, Participants, Information), avec deux questions de qualification en ouverture, une question de motivation au milieu, et une question de clôture.

> Version 1.3 — 15 mai 2026 — Refonte V1.1 Vague 3.

> **Source de vérité technique :** `resources/interview_protocol.json`. Ce `.md` est la documentation humaine — toute évolution structurelle doit être faite dans le JSON et répercutée ici manuellement. Un test de cohérence (`src/questions.py::check_md_json_consistency`) vérifie au démarrage que les IDs de question et le compte sont alignés.

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

### Distribution V1.1

| Position | ID | Mode | Facette | Sujet |
|---|---|---|---|---|
| 1 | Q01 | A | Contexte | Type de cabinet |
| 2 | Q02 | A | Contexte | Prise des RDV et des appels |
| 3 | Q03 | A | Participants | Cadre du secrétariat |
| 4 | Q04 | A | Processus | Canaux d'entrée des demandes |
| 5 | Q05 | B | Processus | Charge administrative en fin de journée |
| 6 | Q06 | A | Motivation | Pourquoi ce check-up maintenant |
| 7 | Q07 | A | Participants | Équipe étendue du cabinet |
| 8 | Q08 | A | Participants | Continuité en cas d'absence |
| 9 | Q09 | A | Information | Nombre d'outils numériques |
| 10 | Q10 | A | Information | Suivi des patients chroniques |
| 11 | Q11 | A | Information | Tri des résultats d'examens |
| 12 | Q12 | A | Processus | Téléconsultation |
| 13 | Q13 | B | Information | Usage de l'IA générative |
| 14 | Q14 | C | Clôture | Ce qui vous aiderait le plus |

Alternance : **A A A A B A A A A A A A B C** (11 A, 2 B, 1 C). Plus monotone que V1.0 mais assumé.

### Métadonnées des options

Chaque option en mode A ou B porte :

- **Score santé** : entier 0 à 10. Une valeur élevée signifie un état de système favorable, une valeur basse signale une fragilité. La valeur `null` indique une option non scorée (contextuelle, "Sans objet" ou "Autre").
- **Type de nœud** : ontologie minimale V0 (Acteur, Outil, Processus, Information, Symptôme, Cause, Risque). Détaillée dans `modeling_scoring.md`.
- **Tags** : mots-clés courts pour l'agrégation et le filtrage.

Le score de facette en V0/V1.1 reste la moyenne des scores santé des options sélectionnées dans cette facette. Le détail du calcul est recalculable à la volée depuis la table `answer` (voir `DECISIONS.md` D-013).

---

## 3. Les 14 questions

Description courte par question. Les options et leurs métadonnées sont dans le JSON canonique.

### Q01 — Type de votre cabinet

Mode A · Contexte · non scoré. Qualification de la structure du cabinet (solo, groupe, MSP). Inchangée depuis V1.0.

### Q02 — Prise des rendez-vous et des appels

Mode A · Contexte · non scoré. Qui prend les RDV et les appels patients. Refonte V1.1 : l'option d'origine "Non, pas de secrétariat" est remplacée par **"Moi-même (pas de secrétariat dédié)"**, qui rend explicite le cas du libéral solo qui gère lui-même. Les libellés sont retravaillés pour être tous au même niveau de précision.

### Q03 — Cadre du secrétariat

Mode A · Participants · scoré. Refonte V1.1 : les options portent désormais un axe unique — **le niveau de cadrage explicite des règles de tri**. Quatre niveaux factuels et mutuellement exclusifs : cadre écrit tenu à jour (9), cadre oral figé (6), pas de cadre formel (4), écart régulier entre cadre et pratique (2). L'option "Sans objet" est conservée pour les cabinets sans secrétariat.

### Q04 — Canaux d'entrée des demandes

Mode A · Processus · scoré. Refonte V1.1 : **passage de Mode B à Mode A**. La réponse libre faisait doublon avec le QCM. Le QCM seul, complété par le champ optionnel, suffit à capter l'organisation des canaux. Options inchangées sur le fond, libellés normalisés.

### Q05 — Charge administrative en fin de journée

Mode B · Processus · scoré. Refonte V1.1 : la question reste en Mode B mais l'open_prompt explore désormais un angle complémentaire au QCM — **un récit concret de ce qui a occupé hier soir ou ce week-end**. Le QCM met en scène une situation précise (19h, fin de journée), avec quatre options factuelles graduées entre "terminé avant de partir" et "se prolonge à la maison".

### Q06 — Pourquoi ce check-up maintenant

Mode A · Motivation · non scoré. Refonte V1.1 : **passage de Mode C à Mode A**. Quatre typologies de motivation observées dans les premiers tests utilisateur : curiosité IA, fatigue accumulée, événement déclencheur récent, anticipation. Complément libre optionnel pour les nuances. Cf D-021.

### Q07 — Équipe étendue du cabinet

Mode A · Participants · scoré. Inchangée depuis V1.0.

### Q08 — Continuité en cas d'absence

Mode A · Participants · scoré. Refonte V1.1 : reformulation factuelle non anxiogène. La question hypothétique "Si vous deviez vous arrêter une semaine, qu'est-ce qui se passerait ?" devient la question vécue **"Quand vous prenez une semaine de congé, comment cela se passe pour votre cabinet ?"**. Les options sont calibrées en conséquence : option d'origine "le cabinet serait à l'arrêt" devient "le cabinet ferme — c'est ce que je fais en pratique" (santé 3 au lieu de 2, plus juste pour un solo qui ferme proprement pendant ses congés sans pour autant être en pathologie).

### Q09 — Nombre d'outils numériques

Mode A · Information · scoré. Refonte V1.1 : l'axe d'origine ("niveau d'intégration") jugé trop subjectif est remplacé par un axe factuel — **le nombre d'outils et la présence ou non de double saisie**. Quatre paliers chiffrés (un seul outil, deux outils, trois à cinq, plus de cinq). Les libellés ne citent plus aucune marque (Maiia, Weda, etc.) pour rester cohérents avec le ton du rapport (V1.1 Vague 2 lite).

### Q10 — Suivi des patients chroniques

Mode A · Information · scoré. Inchangée depuis V1.0. Jugée OK par l'utilisateur en backlog Vague 3.

### Q11 — Tri des résultats d'examens

Mode A · Information · scoré. Refonte V1.1 : **passage de Mode B à Mode A**. La réponse libre faisait doublon avec le QCM et les options n'étaient pas exclusives (l'option "incident passé" pouvait coexister avec "je vérifie au fil de l'eau"). Les options sont désormais centrées sur **l'organisation actuelle du tri**, exclusives et factuelles. Un éventuel incident passé peut figurer en complément libre.

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
| 3 | Q03 | `q03_c` (pas de cadre formel) | A | Participants |
| 4 | Q04 | `q04_d` (canaux parallèles directs) | A | Processus |
| 5 | Q05 | `q05_d` (débordement domicile) | B | Processus |
| 6 | Q06 | `q06_c` (événement déclencheur) | A | Motivation |
| 7 | Q07 | `q07_a` (porte seul) | A | Participants |
| 8 | Q08 | `q08_d` (cabinet ferme pendant les congés) | A | Participants |
| 9 | Q09 | `q09_d` (plus de cinq outils, double saisie) | A | Information |
| 10 | Q10 | `q10_d` (perte de vue des chroniques) | A | Information |
| 11 | Q11 | `q11_c` (consulte plusieurs fois par jour) | A | Information |
| 12 | Q12 | `q12_b` (téléconsultation non cadrée) | A | Processus |
| 13 | Q13 | `q13_d` (IA grand public non conforme assumée) | B | Information |
| 14 | Q14 | Texte libre — désir de temps pour la famille | C | Clôture |

Calcul indicatif V1.1 (à confronter au scoring effectif) :

- Processus : Q04 (3) + Q05 (2) + Q12 (5) = **moyenne 3,33** (inchangé vs V1.0).
- Participants : Q03 (4) + Q07 (3) + Q08 (3) = **moyenne 3,33** (vs 3,00 en V1.0 — Q08 reformulée passe de santé 2 à santé 3).
- Information : Q09 (2) + Q10 (2) + Q11 (5) + Q13 (2) = **moyenne 2,75** (inchangé vs V1.0 — Q09 baisse de 4 à 2, Q11 monte de 3 à 5, équilibre).

---

## 5. Notes d'implémentation

Implémentation V1.1 dans `web/app/checkup/page.tsx` et `web/components/CheckupWidgets.tsx` :

- Chargement des questions via l'API `/questions` (backend `src/questions.py::load_questions()`).
- Affichage d'une seule question par écran avec barre de progression (X sur 14).
- Pour **Mode A** : radio buttons (obligatoire) + champ de complément optionnel. Option "Autre" : saisie inline directe dans l'option (UX type Claude, livrée Vague 1).
- Pour **Mode B** : zone de texte ouverte (obligatoire) puis radio + complément optionnel.
- Pour **Mode C** : zone de texte ouverte (obligatoire).
- Persistance immédiate dans `answer` (avec libellé de l'option choisie pour lisibilité directe en base).
- Boutons "Précédent" (sauf à la première question), "Suivant"/"Terminer" (validé selon le mode), "Quitter et reprendre plus tard".
- Préremplissage des widgets à partir de la base au retour sur une question déjà répondue.

---

*Version 1.3. Toute évolution structurante de ce protocole doit être journalisée dans `DECISIONS.md`.*
