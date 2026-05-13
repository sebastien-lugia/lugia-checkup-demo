# TODO

Tâches restantes, bugs et points à valider, ordonnés par priorité de prise en charge.

---

## Phase V0-1 — Validée le 12 mai 2026

Wireframes `wireframes/accueil.html` et `wireframes/resultats.html` validés par l'utilisateur après deux itérations. Logique de personnalisation des chantiers à porter ensuite dans `workstream_templates.md` (Phase V0-4) sous forme de squelettes paramétrables alimentés par les réponses au questionnaire.

## Phase V0-2 — Validée le 12 mai 2026

Squelette Streamlit et SQLite testé et fonctionnel. Parcours Accueil → Interview → Résultats opérationnel, persistance et reprise OK.

## Phase V0-3a — Validée le 12 mai 2026

Protocole d'interview rédigé et validé. 15 questions, alternance A A B A B C A B A B B A B B C. Décisions actées : D-013 (scoring justifiable), D-014 (JSON canonique). Retro-test loader OK.

## Phase V0-3b iter 2 — Validée le 13 mai 2026

Interface testée et fonctionnelle. Retours utilisateurs intégrés dans iter 3 (suppression Q05 redondante, promesse à moins de 30 minutes).

## Phase V0-3b iter 3 — Validée le 13 mai 2026

Suppression de Q05, renumérotation à 14 questions, promesse revue à moins de 30 minutes.

## Phase V0-3c — Validée le 13 mai 2026

Oracle persona produit dans `resources/sample_answers_pchateau.md`. Script de seed dispo (`scripts/seed_persona.py`) pour pré-remplir la base sans rejouer le questionnaire.

## Phase V0-4a — Validée le 13 mai 2026

Trois ressources `.md` produites. Limites scoring V0 documentées (D-016), trajectoire V1+ dans la roadmap.

## Phase V0-4b — Validée le 13 mai 2026

Scoring et synthèse dynamiques. Rendu de la page résultats conforme.

## Phase V0-4c — Validée le 13 mai 2026

Instanciation paramétrée des trois chantiers (`src/workstreams.py`). La page de résultats est entièrement dynamique.

## Phase V0-5 — Validée le 13 mai 2026

Test bout en bout réalisé avec réponses manuelles. Rapport régénérable à la volée via `scripts/dump_report.py --id <N>` ou `--list` pour lister les interviews disponibles.

Limite éditoriale acceptée pour V0 : les réponses textuelles libres sont stockées mais peu intégrées au rendu. "Vos mots" inscrit en V1 (ROADMAP).

## V0 complète et figée sur tag `v0-final`

Toutes les phases V0 sont closes. V0 reste opérationnelle en local (`streamlit run app.py`). La V1 démarre maintenant en portage technique pur.

## En attente de validation utilisateur — Phase V1-0

Documents méta mis à jour pour le démarrage V1 :

- `MASTER_PROMPT.md` version 3.0 (section 5 périmètre, section 6 architecture, section 11 phases V1).
- `DECISIONS.md` D-017 inscrite (cadrage V1 portage pur).
- `ROADMAP.md` restructuré (V0 / V1 / V1.5 / V2 / Au-delà).
- `CHANGELOG.md` à jour.

**Action requise côté utilisateur** : poser le tag git `v0-final` sur l'état actuel du dépôt (commande fournie en réponse).

## Prochaine phase — V1-1 : Setup infrastructure

- Comptes Vercel, Render, Resend.
- DNS OVH avec CNAME `diagnostic.lugia.fr` vers Vercel.
- Pipeline de déploiement automatique (push git → déploiement).

## Outil de dev disponible

```bash
python scripts/seed_persona.py            # ajoute une session pré-remplie
python scripts/seed_persona.py --reset    # supprime toutes les sessions puis seed
```

Après exécution, lancer Streamlit et cliquer "Reprendre votre check-up" sur l'accueil puis "Voir les résultats" sur l'écran "Merci".

## Prochaine phase — V0-4 : Scoring et restitution

- Écrire `resources/modeling_scoring.md` : ontologie minimale V0, algorithme de scoring (moyenne brute + éventuels bonus), schémas JSON pour LLM si nécessaire, exemples few-shot.
- Écrire `resources/output_templates.md` : format du rapport, templates de phrases qualitatives par facette, formulation de synthèse.
- Écrire `resources/workstream_templates.md` : trois chantiers prédéfinis V0 avec leur structure en 4 parties, paramétrables selon les réponses.
- Implémenter le calcul effectif des scores à partir des réponses dans `pages/02_Resultats.py` (remplacer les données mockées par le vrai calcul).
- Implémenter l'instanciation des trois chantiers selon les réponses.
- Le sample_report.md sera produit à l'issue de la Phase V0-5 (test bout en bout).

## Prochaine sous-phase — V0-3c

- **V0-3c — Persona** : produire `resources/sample_answers_pchateau.md` en jouant le persona Dr Chateau de bout en bout via l'interview implémentée. C'est cette session qui produira ensuite le premier `sample_report.md` en Phase V0-5.

## Ressources `.md` à créer avant ou pendant les phases V0

À traiter en parallèle ou en amorce des phases qui les exploitent.

- `resources/interview_protocol.md` — questions V0 avec modes A/B/C et métadonnées. À écrire en amorce de Phase V0-3.
- `resources/modeling_scoring.md` — ontologie minimale, scoring V0, schémas JSON LLM. À écrire en Phase V0-3 ou V0-4.
- `resources/output_templates.md` — format du rapport, templates de phrases qualitatives. À écrire en Phase V0-4.
- `resources/workstream_templates.md` — trois chantiers prédéfinis V0, structure en 4 parties. À écrire en Phase V0-4.
- `resources/sample_answers_pchateau.md` — à produire à l'issue de la Phase V0-3.
- `resources/sample_report.md` — à produire à l'issue de la Phase V0-5.

## Points à valider plus tard

- Format final du rapport PDF (à clarifier après le premier `sample_report.md`).
- Choix de l'outil d'export PDF (WeasyPrint, ReportLab, ou autre).
- Stratégie de gestion d'un éventuel mode multi-session ou multi-cabinet (probablement V1+).

## Questions ouvertes

- Comment gérer techniquement les appels LLM en V1 (API Anthropic, Ollama local, autre approche). Décision différée à la Phase V0-3 ou V0-4 selon les besoins réels.
- Quelle bibliothèque de composants utiliser pour le wireframe artefact (Tailwind seul, ou avec shadcn/ui). Probablement Tailwind seul pour rester proche du rendu Streamlit final.

---

*À nettoyer à chaque fin de phase. Les tâches accomplies sont remontées dans `CHANGELOG.md`.*
