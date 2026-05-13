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

## Phase V1-0 — Validée le 13 mai 2026

Tag git `v0-final` posé. `MASTER_PROMPT.md` v3.0, D-017 inscrite, ROADMAP restructuré.

## Phase V1-1 — Validée le 13 mai 2026

Infra déployée. `diagnostic.lugia.fr` accessible avec page placeholder. Comptes Vercel, Render, Resend opérationnels. CNAME OVH pointe vers `aed4c8d94f10e709.vercel-dns-017.com`.

## Phase V1-2a — Validée le 13 mai 2026

Backend FastAPI minimal. /docs OK, /protocol OK, /report OK avec seed_persona.

## Phase V1-2b — Validée le 13 mai 2026

Déploiement Render OK. API publique sur l'URL Render `https://lugia-checkup-api.onrender.com`.

## En attente de validation utilisateur — Phase V1-3a

Refactor SQLite → abstraction SQLAlchemy. `src/db.py`, `scripts/seed_persona.py` et `scripts/dump_report.py` mis à jour. Dépendances `sqlalchemy` (et `psycopg2-binary` côté backend) ajoutées.

À tester localement (dans cet ordre) :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate

# Installer les nouvelles dépendances
pip install -r requirements.txt
pip install -r backend/requirements.txt

# Test 1 : les scripts CLI fonctionnent
python scripts/dump_report.py --list
python scripts/seed_persona.py --reset
python scripts/dump_report.py

# Test 2 : V0 Streamlit fonctionne toujours
streamlit run app.py
# (faire un parcours rapide, vérifier que la page de résultats s'affiche)

# Test 3 : backend FastAPI fonctionne toujours
uvicorn backend.main:app --reload --port 8000
# (ouvrir http://localhost:8000/docs et tester /interviews/{id}/report)
```

Points à valider :

- Les trois tests ci-dessus passent sans erreur.
- Les données stockées en SQLite local restent accessibles (l'existant n'est pas écrasé).
- Le rapport produit pour Chateau est identique à avant V1-3a.

Si tout est OK, pousser sur GitHub. Render redéploiera l'API automatiquement, qui continuera à utiliser SQLite (éphémère) tant que DATABASE_URL n'est pas définie.

## Prochaine phase — V1-3b : provisionnement Postgres sur Render

- Créer une base Postgres sur Render (Free tier).
- Récupérer l'INTERNAL DATABASE_URL.
- Ajouter la variable d'environnement DATABASE_URL au service Web `lugia-checkup-api`.
- Redéployer.
- Vérifier que les interviews persistent entre deux cold starts.

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
