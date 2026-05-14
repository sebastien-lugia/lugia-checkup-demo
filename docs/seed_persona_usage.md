# Utiliser `seed_persona.py`

Script utilitaire pour pré-remplir une interview avec les 14 réponses du persona Dr Chateau (`resources/sample_answers_pchateau.md`), positionnée en fin de questionnaire (`current_question_index=14`, statut `in_progress`). Permet de sauter directement à la page de résultats sans rejouer le check-up, dans un parcours d'auth conforme à V1.

Mis à jour le 2026-05-14 pour V1.1.

---

## Logique de fonctionnement

À chaque exécution, le script :

1. Garantit que les tables de base existent (`db.init_db()`).
2. Optionnellement, supprime des données existantes (`--reset`).
3. Crée une nouvelle interview, éventuellement rattachée à un email (`--email`).
4. Insère les 14 réponses Chateau.
5. Positionne le pointeur de session à la fin (cursor = 14 sur 14).
6. Laisse le statut à `in_progress` pour que l'interview soit retrouvée comme active sur l'accueil (« Reprendre votre check-up »).

L'interview seedée saute l'écran questionnaire et atterrit sur l'écran « Merci », puis sur la page de résultats au clic suivant.

---

## Options CLI

| Option | Type | Effet |
|---|---|---|
| `--email <email>` | string | Rattache l'interview à cet email. L'utilisateur authentifié avec cet email retrouvera l'interview comme active sur l'accueil. Sans cet argument, l'interview est créée en mode anonyme legacy (compatible V0 Streamlit, peu utile pour V1). |
| `--reset` | flag | Supprime des données seeded avant de re-seed. Avec `--email`, ne supprime que les données de cet email (sûr en prod). Sans `--email`, supprime **toutes** les sessions de la base (à n'utiliser qu'en SQLite local). |

---

## Choix de la base : SQLite local ou Postgres prod

Le script lit la variable d'environnement `DATABASE_URL` au moment où `src/db.py` est importé :

- **Non définie** → fallback SQLite local dans `data/lugia_demo.sqlite`.
- **Définie** → connexion Postgres (typiquement la base Render).

Pour cibler Postgres prod, il suffit donc de préfixer la commande par l'export de la variable :

```bash
DATABASE_URL='postgresql://USER:PASS@HOST/DB' python scripts/seed_persona.py [...]
```

L'export inline n'affecte que la commande courante. Le terminal ne reste pas connecté à Postgres pour les commandes suivantes.

L'URL externe Postgres se trouve dans **Render Dashboard → base `lugia-checkup-db` → onglet Info → section Connections → External Database URL**.

---

## Workflow type — TEST en local

Setup recommandé pour itérer sur le moteur de rapport sans toucher la prod.

`web/.env.local` :

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Trois terminaux :

```bash
# Terminal 1 — Backend local (lit SQLite local)
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```

```bash
# Terminal 2 — Frontend local
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo/web
npm run dev
```

```bash
# Terminal 3 — Seed Chateau pour ton email
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate
python scripts/seed_persona.py --email [email protected] --reset
```

Le script imprime l'interview_id et un raccourci direct. Exemple :

```
Interview créée — id=1 pour [email protected]
...
Raccourci direct (Next.js) : /resultats?interview=1
```

Dans le navigateur :

1. Va sur `http://localhost:3000` → redirection sur `/login`.
2. Saisis `[email protected]`, clique « Recevoir mon lien d'accès ».
3. Le lien magique est imprimé dans la **console uvicorn** (mode dev, pas d'envoi réel d'email). Copie l'URL complète, colle dans la barre du navigateur.
4. Tu atterris connecté sur `/`. L'accueil propose « Reprendre votre check-up ».
5. Clic → écran « Merci » → « Voir les résultats » → rapport Chateau.

Raccourci direct disponible une fois connecté : `http://localhost:3000/resultats?interview=1`.

---

## Workflow type — PROD (Postgres Render)

À utiliser uniquement avec des emails de test (convention `+test`) pour ne pas polluer les vraies données prospects.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate

DATABASE_URL='postgresql://<external_url_render>' python scripts/seed_persona.py --email [email protected] --reset
```

Dans le navigateur :

1. Va sur `https://diagnostic.lugia.fr` → redirection sur `/login`.
2. Saisis `[email protected]`, clique « Recevoir mon lien d'accès ».
3. Tu reçois un **vrai email Resend** sur ta boîte Gmail (Gmail délivre `[email protected]` dans `[email protected]`).
4. Clic sur le bouton « Accéder à mon check-up » → tu atterris connecté sur `https://diagnostic.lugia.fr`.
5. L'accueil propose « Reprendre votre check-up ».
6. Clic → écran « Merci » → « Voir les résultats ».

Raccourci direct disponible : `https://diagnostic.lugia.fr/resultats?interview=N`.

---

## Mode legacy V0 (sans email)

Conservé pour rétrocompatibilité avec V0 Streamlit local :

```bash
python scripts/seed_persona.py             # crée une interview sans email
python scripts/seed_persona.py --reset     # supprime TOUTES les sessions (à éviter en prod)
```

L'interview anonyme est accessible à n'importe quel utilisateur authentifié (le helper `_assert_user_owns_interview` accepte les interviews legacy email=None). Ce mode reste utile pour les tests V0 Streamlit qui ne passent pas par l'auth.

---

## Convention `+test` pour distinguer tests et vraies données

Gmail (et la plupart des providers) acceptent les **alias plus** : `[email protected]` est délivré dans la boîte `sebastien@lugia.fr` mais comptabilisé comme un destinataire distinct côté Resend et en base.

Bénéfices :

- Les vraies données prospects et tes tests ne se mélangent pas en base.
- `--reset --email [email protected]` ne touche que tes propres tests, jamais les données prospects.
- Tu peux générer plusieurs scénarios distincts avec `+test1`, `+test2`, etc.
- Filtrer en SQL : `SELECT * FROM interview WHERE email LIKE '%+test@%'`.

---

## Liens utiles

- `scripts/seed_persona.py` — le script lui-même.
- `scripts/dump_report.py` — exporte un rapport au format Markdown depuis une interview en base. Utile pour comparer rapidement deux versions du rendu sans aller dans le navigateur.
- `resources/sample_answers_pchateau.md` — documentation des 14 réponses Chateau, source de vérité conceptuelle.
- `DECISIONS.md` D-018 (RGPD), D-019 (multi-tracks), D-020 (méthodologique + SLM).
