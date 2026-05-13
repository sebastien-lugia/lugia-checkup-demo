# Interview Protocol — V0

Protocole du questionnaire V0 du démonstrateur Lugia Check-up. Quatorze questions structurées qui couvrent les trois facettes WSF retenues en V0 (Processus & Activités, Participants, Information), avec deux questions de qualification en ouverture, une question narrative au milieu, et une question de clôture.

> Version 1.2 — 13 mai 2026.

> **Source de vérité technique :** `resources/interview_protocol.json`. Ce `.md` est la documentation humaine — toute évolution structurelle doit être faite dans le JSON et répercutée ici manuellement. Un test de cohérence (`src/questions.py::check_md_json_consistency`) vérifie au démarrage que les IDs de question et le compte sont alignés.

> **Note v1.2 :** suppression de Q05 (Canal principal de rendez-vous), redondante avec Q04. Le total passe de 15 à 14 questions. Tous les IDs et positions ont été ré-aligned. Pour le détail des évolutions antérieures, voir `CHANGELOG.md`.

---

## 1. Cadre du questionnaire

### Modes d'interaction

Trois modes alternés à dessein pour préserver l'engagement du répondant. Le détail est dans `MASTER_PROMPT.md` section 7.

- **Mode A — QCM avec complément optionnel.** Choix unique parmi 3 à 5 options pré-écrites plus "Autre". Un champ de complément libre est toujours affiché, optionnel sauf si "Autre" est choisi (alors il devient une précision obligatoire). Rapide, déterministe.
- **Mode B — Hybride.** Une question ouverte courte d'abord, puis une relance QCM, puis un complément optionnel. Pour les questions exploratoires où l'on veut entendre le médecin avant de structurer.
- **Mode C — Ouvert pur.** Réponse libre, sans relance structurée. Limité à deux questions sur l'ensemble du parcours : motivation (Q06) et clôture (Q14).

### Principe d'alternance

L'ordre des questions alterne les trois modes pour donner au répondant l'impression d'être écouté sur son vécu unique, et non qu'il remplit un formulaire générique.

### Distribution V0

| Position | ID | Mode | Facette | Sujet |
|---|---|---|---|---|
| 1 | Q01 | A | Contexte | Type de cabinet |
| 2 | Q02 | A | Contexte | Secrétariat (existence) |
| 3 | Q03 | A | Participants | Cadre du secrétariat |
| 4 | Q04 | B | Processus | Flux entrant des demandes |
| 5 | Q05 | B | Processus | Charge administrative quotidienne |
| 6 | Q06 | C | Motivation | Pourquoi ce check-up maintenant |
| 7 | Q07 | A | Participants | Équipe étendue du cabinet |
| 8 | Q08 | A | Participants | Dépendance à votre présence |
| 9 | Q09 | A | Information | Outils numériques utilisés |
| 10 | Q10 | A | Information | Suivi des patients chroniques |
| 11 | Q11 | B | Information | Circulation des résultats d'examens |
| 12 | Q12 | A | Processus | Téléconsultation |
| 13 | Q13 | B | Information | Usage de l'IA générative |
| 14 | Q14 | C | Clôture | Ce qui vous aiderait le plus |

Alternance : **A A A B B C A A A A B A B C** (8 mode A, 4 mode B, 2 mode C).

### Métadonnées des options

Chaque option en mode A ou B porte :

- **Score santé** : entier 0 à 10. Une valeur élevée signifie un état de système favorable, une valeur basse signale une fragilité. La valeur `null` indique une option non scorée (contextuelle, "Sans objet" ou "Autre").
- **Type de nœud** : ontologie minimale V0 (Acteur, Outil, Processus, Information, Symptôme, Cause, Risque). Détaillée dans `modeling_scoring.md` à écrire en V0-4.
- **Tags** : mots-clés courts pour l'agrégation et le filtrage.

Le score de facette en V0 est la moyenne des scores santé des options sélectionnées dans cette facette. Le détail du calcul est recalculable à la volée depuis la table `answer` (voir `DECISIONS.md` D-013).

---

## 2. Les 14 questions

Description courte par question. Les options et leurs métadonnées sont dans le JSON canonique.

### Q01 — Type de votre cabinet

Mode A · Contexte · non scoré. Qualification de la structure du cabinet (solo, groupe, MSP).

### Q02 — Secrétariat

Mode A · Contexte · non scoré. Existence et type de secrétariat (interne, externalisé, mixte, aucun).

### Q03 — Cadre du secrétariat

Mode A · Participants · scoré. Connaissance des règles de tri appliquées par le secrétariat. Option "Sans objet" pour les cabinets sans secrétariat.

### Q04 — Flux entrant des demandes

Mode B · Processus · scoré. Question ouverte sur la prise de rendez-vous, puis relance QCM sur les canaux empruntés par les demandes.

### Q05 — Charge administrative quotidienne

Mode B · Processus · scoré. Question ouverte sur les tâches administratives, puis relance QCM sur le volume. Scores calibrés : "moins d'une heure" 7 (suspect chez un libéral), "une à deux heures" 9 (norme saine).

### Q06 — Pourquoi ce check-up maintenant

Mode C · Motivation · non scoré. Réponse libre. Nourrit la synthèse finale et la sélection des chantiers prioritaires.

### Q07 — Équipe étendue du cabinet

Mode A · Participants · scoré. Ressources humaines au-delà du médecin et du secrétariat.

### Q08 — Dépendance à votre présence

Mode A · Participants · scoré. Que se passerait-il en cas d'arrêt d'une semaine.

### Q09 — Outils numériques utilisés

Mode A · Information · scoré. Niveau d'intégration de la stack numérique du cabinet.

### Q10 — Suivi des patients chroniques

Mode A · Information · scoré. Mécanisme de détection des patients chroniques qui ne reviennent pas.

### Q11 — Circulation des résultats d'examens

Mode B · Information · scoré. Question ouverte sur le tri des résultats, puis relance QCM sur le système en place.

### Q12 — Téléconsultation

Mode A · Processus · scoré. Pratique et cadrage de la téléconsultation.

### Q13 — Usage de l'IA générative

Mode B · Information · scoré. Question ouverte précisant explicitement que la dictée vocale classique (Dragon ou équivalent) n'est pas comptée comme IA générative. Relance QCM avec une option dédiée pour la dictée vocale classique non IA.

### Q14 — Ce qui vous aiderait le plus

Mode C · Clôture · non scoré. Réponse libre. Nourrit la formulation finale et la recommandation de la prochaine étape.

---

## 3. Réponses attendues du persona Dr Chateau

Pour calibration. La session jouée par le persona en Phase V0-3c devra retomber sur des scores proches de 6 / 4 / 5 (Processus / Participants / Information) — calibration affinée en V0-4.

| Position | ID | Choix attendu | Mode | Facette |
|---|---|---|---|---|
| 1 | Q01 | `q01_a` (solo) | A | Contexte |
| 2 | Q02 | `q02_b` (télésecrétariat externalisé) | A | Contexte |
| 3 | Q03 | `q03_c` (boîte noire de confiance) | A | Participants |
| 4 | Q04 | `q04_d` (canaux parallèles directs) | B | Processus |
| 5 | Q05 | `q05_d` (débordement soir/weekend) | B | Processus |
| 6 | Q06 | Texte libre — posture intellectuelle plus tension fatigue | C | Motivation |
| 7 | Q07 | `q07_a` (porte seul) | A | Participants |
| 8 | Q08 | `q08_d` (cabinet à l'arrêt) | A | Participants |
| 9 | Q09 | `q09_d` (empilement, double saisie) | A | Information |
| 10 | Q10 | `q10_d` (perte de vue des chroniques) | A | Information |
| 11 | Q11 | `q11_d` (incident passé) | B | Information |
| 12 | Q12 | `q12_b` (téléconsultation non cadrée) | A | Processus |
| 13 | Q13 | `q13_d` (ChatGPT non conforme assumé) | B | Information |
| 14 | Q14 | Texte libre — désir de temps pour la famille | C | Clôture |

Calcul indicatif avec ces choix (à raffiner en V0-4) :

- Processus : Q04 (3) + Q05 (2) + Q12 (5) = **moyenne 3,33** — bas par rapport à 6/10 visé.
- Participants : Q03 (4) + Q07 (3) + Q08 (2) = **moyenne 3** — proche de 4/10 visé.
- Information : Q09 (4) + Q10 (2) + Q11 (3) + Q13 (2) = **moyenne 2,75** — bas par rapport à 5/10 visé.

L'écart entre scores attendus et cibles V0-1 sera traité en Phase V0-4 par introduction d'un mécanisme de bonus/malus au niveau du calcul de facette. Voir `DECISIONS.md` D-013.

---

## 4. Notes d'implémentation

Implémentation V0-3b dans `pages/01_Checkup.py` :

- Chargement des questions via `src/questions.py::load_questions()`.
- Affichage d'une seule question par écran avec barre de progression (X sur 14).
- Pour **Mode A** : `st.radio` (obligatoire) plus champ texte de complément optionnel (devient obligatoire si "Autre" est choisi).
- Pour **Mode B** : `st.text_area` ouvert (obligatoire) puis `st.radio` (obligatoire) puis complément optionnel.
- Pour **Mode C** : `st.text_area` ouvert (obligatoire).
- Persistance immédiate dans `answer` (avec libellé de l'option choisie pour lisibilité directe en base).
- Boutons "Précédent" (sauf à la première question), "Suivant"/"Terminer" (validé selon le mode), "Quitter et reprendre plus tard".
- Préremplissage des widgets à partir de la base au retour sur une question déjà répondue.

---

*Version 1.2. Toute évolution structurante de ce protocole doit être journalisée dans `DECISIONS.md`.*
