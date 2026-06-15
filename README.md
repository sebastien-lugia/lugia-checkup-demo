# Lugia Check-up Demo

Démonstrateur local d'un check-up préventif B2B pour cabinet de médecine générale.

> En moins de 30 minutes, Lugia aide un médecin à répondre à la question : où en est réellement mon cabinet aujourd'hui ?

## Statut

V0 en construction. Voir `MASTER_PROMPT.md` pour le cadre du projet et `CHANGELOG.md` pour l'historique des phases.

Prochaine phase : **V0-1 — Wireframes artefacts** (maquettes React de la page d'accueil et de la page de résultats).

## Installation et lancement

Prérequis : Python 3.11 ou plus récent.

```bash
# Se placer dans le dossier du projet
cd lugia-checkup-demo

# (Recommandé) Créer et activer un environnement virtuel
python3 -m venv .venv
source .venv/bin/activate           # macOS / Linux
# .venv\Scripts\activate            # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le démonstrateur
streamlit run app.py
```

L'application s'ouvre automatiquement dans le navigateur à l'adresse `http://localhost:8501`.

La base SQLite est créée automatiquement au premier lancement dans `data/lugia_demo.sqlite`. Pour réinitialiser le démonstrateur, supprimer ce fichier.

Le thème (palette, sidebar) est défini dans `.streamlit/config.toml`. La navigation entre les pages se fait par les boutons d'action — la barre latérale de navigation Streamlit est volontairement masquée pour préserver un parcours linéaire.

## Structure du projet

```
lugia-checkup-demo/
  MASTER_PROMPT.md          Cadre méta du projet, à lire en premier
  README.md                 Ce fichier
  CHANGELOG.md              Historique des phases
  TODO.md                   Tâches restantes
  DECISIONS.md              Décisions structurantes
  ROADMAP.md                Améliorations différées
  resources/                Mémoire produit et configuration
    persona_medecin_pchateau.md
    (à venir : product_brief.md, brand_guidelines.md, wsf_reference.md,
     interview_protocol.md, modeling_scoring.md, output_templates.md,
     workstream_templates.md, sample_answers_pchateau.md, sample_report.md)
  (à venir : app.py, src/, pages/, data/, exports/)
```

## Documentation de référence

- `MASTER_PROMPT.md` — cadre méta et règles de travail
- `resources/persona_medecin_pchateau.md` — persona médecin de référence (Dr Philippe Chateau)
- Voir le tableau complet des ressources dans `MASTER_PROMPT.md` section 10

## Assistant chat chantiers — Cloud vs Local (SLM)

L'assistant Lugia sur les chantiers de la page résultats V3-charte peut tourner sur deux moteurs au choix du médecin, via un toggle dans l'en-tête du chat :

- **Cloud · Claude Haiku** (défaut) — API Anthropic. Nécessite la variable d'environnement `ANTHROPIC_API_KEY` côté backend.
- **Local · qwen2.5:3b** — SLM tournant sur la machine du médecin via [Ollama](https://ollama.com). Aucun coût API, données 100 % locales, latence ~1-3 s sur Mac M-series.

### Activer le mode SLM local

```bash
# 1. Installer Ollama (app Mac native ou brew)
brew install ollama          # ou télécharger sur https://ollama.com

# 2. Démarrer le service (lancé en background par l'app Mac, sinon manuel)
ollama serve                 # tourne sur http://localhost:11434

# 3. Tirer le modèle qwen2.5:3b (~2 GB, une seule fois)
ollama pull qwen2.5:3b

# 4. Installer la lib python côté backend
pip install ollama --break-system-packages
```

Le toggle « Local » du chat devient alors actif. Si Ollama n'est pas joignable, le backend renvoie une 503 et l'UI propose de basculer sur Cloud sans interrompre la conversation.

### Variables d'environnement optionnelles

- `OLLAMA_MODEL` — surcharge le modèle local (défaut `qwen2.5:3b`). Exemples : `qwen2.5:7b`, `llama3.2:3b`, `mistral:7b`.
- `OLLAMA_BASE_URL` — surcharge l'URL du serveur Ollama (défaut `http://localhost:11434`).

## Périmètre

Démonstrateur local, single-user, exécuté sur la machine du développeur ou d'un utilisateur de test. Cabinets de 1 à 5 médecins avec ou sans secrétariat. Pas de version publique en V0.

## Garde-fous

- Aucune donnée patient identifiable saisie ni stockée.
- Aucun diagnostic médical produit.
- Aucune notation des personnes — les scores portent sur le système de travail.
- Le scoring est déclaratif et présenté comme une première lecture, pas comme une vérité.
test
# lugia-app-demo
