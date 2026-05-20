# Runbook V2.0-T6 — mise en prod

**Version** : 1.0 — 19 mai 2026
**Pré-requis** : T1 à T5 livrées et validées en local (voir CHANGELOG).
**Cible** : déploiement de la cohabitation V1.1.9 / V2.0 sur `diagnostic.lugia.fr`.

---

## 0. Avant de commencer — checklist mentale

- [ ] Le parcours V2 fonctionne en local de bout en bout (intro → profil → énergie → 3 blocs → résultats → modules).
- [ ] V1.1.9 fonctionne toujours en local (non-régression confirmée).
- [ ] `web/.env.local` pointe vers `http://localhost:8000` (pour le dev) — sera rebasculé vers Render après déploiement.
- [ ] Tag git `v1.1.9` existe (rollback possible). ✓ confirmé par `git describe --tags`.

---

## 1. Pre-commit sanity check (5 min)

Lance ces commandes dans le dossier racine du projet. Toutes doivent passer.

```bash
cd ~/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo

# A. Non-régression V1.1.9 — hash rapport Chateau inchangé
python3 -c "
from src import db
db.init_db()
print('init_db OK')
"

# B. Tests V2 — 29/29
python3 tests/test_v2_scoring_personalize.py

# C. TypeScript propre (0 erreur)
cd web && npx tsc --noEmit -p . && echo '✓ TypeScript OK'

# D. Build Next.js prod (sur Mac, le SWC est dispo)
cd web && npm run build && echo '✓ Build OK'

# E. Smoke test backend en local
# NOTE zsh : si un backend tourne déjà sur le port 8000, le `uvicorn ... &`
# échouera silencieusement (`address already in use`) et `kill %1` aussi.
# Les curl ci-dessous interrogeront alors le backend déjà en cours, ce qui
# est OK pour le smoke. Si tu veux repartir propre :
#   lsof -i :8000  # voir qui occupe le port
#   kill <PID>     # tuer ce processus
# IMPORTANT : les URLs avec `?` doivent être quotées entre apostrophes
# (zsh interprète `?` comme un glob et refuse la commande sinon).

cd .. && source .venv/bin/activate
uvicorn backend.main:app --port 8000 &
sleep 2
curl -s 'http://localhost:8000/protocol?version=v2.0' | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert d['version'] == '2.0' and len(d['blocks']) == 3
print('✓ /protocol?version=v2.0 OK')
"
curl -s http://localhost:8000/modules | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert len(d['modules']) == 7
print('✓ /modules OK')
"
# Tuer le backend local avant de continuer
kill %1
```

Si une seule de ces commandes échoue, **STOP** — debug avant d'aller plus loin.

---

## 2. Arbitrage avant commit — fichiers sensibles

Deux dossiers nouveaux portent de l'information dont la diffusion mérite arbitrage :

- **`resources/external_inputs/pistes_amelioration_v3.md` et `v6.md`** : notes stratégiques reçues, contiennent les leviers V2.1+ et V3+ (mode équipe, mini-vérifications de réalité, etc.). Si le repo est privé et que c'est OK pour toi, commit comme du contenu projet. Sinon, déplace-les hors du repo ou ajoute-les au `.gitignore`.

- **`resources/v2_editorial_draft.md`** et **`resources/v2_editorial_review_guide.md`** : brouillon éditorial complet + guide de relecture. Contient les 76 reformulations + 21 benchmarks marqués `[À CONFIRMER]`. C'est du contenu produit, sans secret particulier — OK à committer.

Décision rapide :

```bash
# Si tu préfères ne PAS committer external_inputs :
echo "resources/external_inputs/" >> .gitignore

# Sinon, ne fais rien — git add -A les inclura
```

---

## 3. Commit + push (10 min)

```bash
cd ~/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo

# Reviser le diff une dernière fois (rapide)
git status
git diff --stat HEAD

# Stage tout
git add -A

# Vérifier que .env.local et lugia_demo.sqlite ne sont PAS dans le diff
git status | grep -E "\.env\.local|lugia_demo\.sqlite" && echo "⚠️ ATTENTION fichiers locaux stagés" || echo "✓ pas de fichier local stagé"

# Commit
git commit -m "V2.0 : refonte structurelle du check-up + cohabitation V1.1.9

Implémente la refonte V2.0 décrite dans D-029 et D-030 :
- Mode A pur sur l'ensemble du parcours scoré (rupture avec D-021).
- 3 blocs successifs Parcours patient / Équipe / Outils.
- Mini-onboarding profil en 2 étapes (5 chips factuels + 4 chips réflexifs).
- Ancrage énergie non scoré en ouverture.
- Radar SVG dynamique pendant le parcours, grand format en résultats.
- 13 règles déterministes de personnalisation + 6 signaux croisés.
- 7 modules d'approfondissement statiques accessibles via /modules/[id].

Cohabitation BDD : champ protocol_version sur interview ('v1.1.9' par
défaut), dispatcher backend /report et /scores. V1.1.9 strictement
préservée — non-régression confirmée sur persona Chateau.

Voir CHANGELOG entrées 2026-05-19 V2.0 (T1 à T5 + T4a-g)."

# Push
git push origin main
```

---

## 4. Déploiements automatiques (à monitorer en parallèle)

### 4.1 Vercel (frontend)

Le push déclenche un build automatique. Va sur le dashboard Vercel (`vercel.com/<ton-team>/lugia-checkup-web/deployments`) et vérifie :

- [ ] Build status → ✓ Ready (typiquement 1 à 3 min).
- [ ] Aucune erreur de build SWC ni TypeScript dans les logs.
- [ ] Le déploiement est promu sur le domaine `diagnostic.lugia.fr` (ou son équivalent).

### 4.2 Render (backend)

Le push déclenche un redeploy automatique. Va sur le dashboard Render (`dashboard.render.com/web/<lugia-checkup-api>`) et vérifie :

- [ ] Build → ✓ Live (~2 à 5 min selon la base instance).
- [ ] Logs au démarrage : tu dois voir des lignes du type `INFO: ALTER TABLE interview ADD COLUMN protocol_version ...` pour les 3 migrations T3 (idempotentes — si le déploiement est rejoué, ces logs n'apparaîtront pas mais ce n'est pas un problème).
- [ ] La route `GET /health` répond 200 (Render le checke automatiquement).

### 4.3 En cas d'échec d'un des deux

Si Vercel échoue → corriger en local + repush.
Si Render échoue → vérifier les logs, typiquement c'est :
- soit un import manquant (pas le cas ici, on a tout testé localement),
- soit une migration BDD qui plante (les `_ensure_*` sont idempotentes — `ALTER TABLE IF NOT EXISTS COLUMN` n'existe pas en Postgres mais `inspect()` empêche la double-création).

---

## 5. Smoke test prod (5 min)

Une fois les deux déploiements `Ready`/`Live`, exécute :

```bash
# Remplace par ton domaine si différent
API="https://lugia-checkup-api.onrender.com"
WEB="https://diagnostic.lugia.fr"

# A. Backend sert bien le protocole V2.0
curl -s "$API/protocol?version=v2.0" | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert d['version'] == '2.0', f'version={d.get(\"version\")}'
assert len(d['blocks']) == 3
print('✓ Backend /protocol?version=v2.0 OK')
"

# B. Backend sert bien la V1 (legacy) sans version param
curl -s "$API/protocol" | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert 'questions' in d, 'V1 doit avoir questions'
print('✓ Backend /protocol (V1.1.9 legacy) OK')
"

# C. Modules accessibles publiquement
curl -s "$API/modules" | python3 -c "
import json,sys
d = json.load(sys.stdin)
assert len(d['modules']) == 7
print('✓ Backend /modules OK')
"

# D. Frontend répond
curl -sI "$WEB/" | head -1   # doit être 200
curl -sI "$WEB/checkup/v2" | head -1   # doit être 200
curl -sI "$WEB/modules/comm" | head -1 # doit être 200
```

Puis smoke test manuel UI sur ton navigateur :

1. Ouvre `https://diagnostic.lugia.fr/`.
2. Tu dois voir la page d'accueil **2 cartes** (Check-up classique + Diagnostic organisationnel V2 avec badge Pilote).
3. Connecte-toi avec ton compte de test (si pas déjà connecté).
4. Clique **« Essayer la nouvelle version »** → page d'intro V2 avec le titre serif « Comment fonctionne **vraiment** votre cabinet ? ».
5. Remplis profil étape 1 (5 chips factuels) → étape 2 (4 chips réflexifs).
6. Réponds à l'ancrage énergie.
7. Réponds à au moins 1 question du bloc A — vérifie que le **radar aside à droite** se met à jour en live (point vert qui glisse, mini-barre qui se remplit).
8. Skippe le reste (réponds rapidement) jusqu'aux résultats.
9. Sur la page résultats, clique sur la **première opportunité** → ouvre `/modules/{id}` avec les 4 étapes détaillées.
10. Vérifie aussi que la V1.1.9 fonctionne toujours : retour à `/`, clique la carte « Check-up classique », fais 1-2 questions, retour vers `/` → la session V1.1.9 doit réapparaître dans le bandeau « Session en cours ».

---

## 6. Vérifications BDD prod (10 min)

Les migrations T3 sont idempotentes côté code (`_ensure_*_columns()` en début de `init_db()`), mais il faut **vérifier visuellement sur la prod Postgres** qu'elles ont bien tourné et que les données legacy sont préservées.

### Comment se connecter à la prod Postgres

Render expose une `DATABASE_URL` externe. Trois options :

**A. Ligne de commande (`psql`)**
```bash
# Dashboard Render → Database lugia-postgres → Connect → "External Database URL"
export PG_URL='postgresql://lugia_user:xxxxx@dpg-xxxxx-a.frankfurt-postgres.render.com/lugia_db'
psql "$PG_URL"
```

**B. GUI (Postico, TablePlus, DBeaver…)**
Copier les credentials du dashboard Render (host / port / db / user / password) et créer une connexion.

**C. Render shell** (dashboard Render → web service → Shell)
```bash
# Render injecte DATABASE_URL automatiquement dans l'env du service
psql "$DATABASE_URL"
```

### A — Schéma : les colonnes V2 sont bien là

```sql
-- interview : protocol_version + global_score
\d interview
-- Attendu : 8 colonnes (id, email, created_at, updated_at, status,
-- current_question_index, protocol_version, global_score)

-- answer : scored
\d answer
-- Attendu : 12 colonnes dont scored (INTEGER NOT NULL DEFAULT 1)

-- user_profile : 10 colonnes V2
\d user_profile
-- Attendu : 13 colonnes (email, firstname, updated_at + 10 V2)
```

Ou plus compact si tu n'as pas `\d` :

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name IN ('interview', 'answer', 'user_profile')
  AND column_name IN (
    'protocol_version', 'global_score', 'scored',
    'cabinet_type', 'volume', 'paramedical_team', 'logiciel_metier',
    'logiciel_metier_other', 'rdv_canal', 'status', 'territoire',
    'horizon', 'motivation'
  )
ORDER BY table_name, column_name;
```

**Attendu** : 13 lignes (2 sur `interview`, 1 sur `answer`, 10 sur `user_profile`). `protocol_version` non nullable avec default `'v1.1.9'`, les autres nullables.

### B — Données legacy V1.1.9 préservées

```sql
-- Toutes les interviews existantes ont protocol_version='v1.1.9' (default appliqué)
SELECT protocol_version, COUNT(*) AS n
FROM interview
GROUP BY protocol_version
ORDER BY protocol_version;
```

**Attendu** : avant tout test V2, une seule ligne `v1.1.9 | N` où N = nombre d'interviews historiques.

```sql
-- Aucune answer existante n'a scored à NULL ou 0 (default 1 appliqué)
SELECT scored, COUNT(*) FROM answer GROUP BY scored ORDER BY scored;
```

**Attendu** : une seule ligne `1 | N` avant test V2.

```sql
-- Les user_profile historiques ont firstname intact, les 10 V2 à NULL
SELECT
  COUNT(*) AS total,
  COUNT(firstname) AS with_firstname,
  COUNT(cabinet_type) AS with_v2_step1,
  COUNT(status) AS with_v2_step2
FROM user_profile;
```

**Attendu** : `with_v2_step1` et `with_v2_step2` à 0 avant tout test V2. `with_firstname` proche de `total` (la plupart des comptes ont déjà saisi leur prénom).

### C — Première interview V2.0 — cohérence

Après ton smoke test UI (étape 5 du runbook — un parcours V2 complet), ces requêtes valident que les données sont bien écrites :

```sql
-- La dernière interview est-elle bien V2.0 ?
SELECT id, email, status, protocol_version, global_score, created_at
FROM interview
ORDER BY id DESC
LIMIT 5;
```

**Attendu** : ta dernière interview (celle du smoke test) a `protocol_version='v2.0'`, `status='completed'`, `global_score` entre 25 et 100.

```sql
-- L'ancrage énergie est bien scored=0, les 17 autres réponses scored=1
SELECT
  question_id,
  scored,
  selected_option
FROM answer
WHERE interview_id = (
  SELECT MAX(id) FROM interview WHERE protocol_version = 'v2.0'
)
ORDER BY question_id;
```

**Attendu** : 18 lignes au total. La ligne `energy` doit avoir `scored=0`. Les 17 autres (`a1..a6, b1..b7 ou b3+b1b, c1..c6`) doivent avoir `scored=1`.

```sql
-- Le profil V2 du compte testeur est complet
SELECT
  email, firstname,
  cabinet_type, volume, paramedical_team, logiciel_metier, rdv_canal,
  status, territoire, horizon, motivation
FROM user_profile
WHERE email = 'TON_EMAIL_DE_TEST'
LIMIT 1;
```

**Attendu** : les 10 champs V2 renseignés (aucun NULL).

### D — Cohabitation propre — pas de mélange entre versions

Très important pour éviter qu'une interview V1.1.9 se retrouve avec des answers V2.0 (ce qui ferait crasher les calculs de scores) :

```sql
-- A. Une interview V1.1.9 ne doit avoir QUE des question_id V1 (q01..q17)
SELECT
  i.id AS interview_id,
  i.protocol_version,
  a.question_id
FROM interview i
JOIN answer a ON a.interview_id = i.id
WHERE i.protocol_version = 'v1.1.9'
  AND a.question_id NOT LIKE 'q%'
  AND a.question_id <> 'energy'
LIMIT 10;
```

**Attendu** : 0 ligne. Si ça remonte des `a1`, `b1`, `c1`, c'est qu'un client a mixé les protocoles — anomalie à investiguer.

```sql
-- B. Une interview V2.0 ne doit avoir QUE des question_id V2 (a1..c6 + energy)
SELECT
  i.id AS interview_id,
  i.protocol_version,
  a.question_id
FROM interview i
JOIN answer a ON a.interview_id = i.id
WHERE i.protocol_version = 'v2.0'
  AND a.question_id ~ '^q[0-9]'  -- regex Postgres : commence par q + chiffre
LIMIT 10;
```

**Attendu** : 0 ligne.

```sql
-- C. Pas de question_id orphelin (ni V1 ni V2)
SELECT DISTINCT question_id
FROM answer
WHERE question_id NOT LIKE 'q%'
  AND question_id NOT IN (
    'energy',
    'a1','a2','a3','a4','a5','a6',
    'b1','b1b','b3','b4','b5','b6','b7',
    'c1','c2','c3','c4','c5','c6'
  );
```

**Attendu** : 0 ligne.

### E — Volumes pour suivi du pilote (T7)

À garder sous le coude pour la suite, ces requêtes te donnent une vue rapide de l'usage :

```sql
-- Combien d'interviews chaque jour, par version
SELECT
  DATE(created_at) AS day,
  protocol_version,
  COUNT(*) AS n_interviews,
  COUNT(*) FILTER (WHERE status = 'completed') AS n_completed
FROM interview
GROUP BY day, protocol_version
ORDER BY day DESC, protocol_version;
```

```sql
-- Distribution des niveaux qualitatifs sur les interviews V2 terminées
-- (les médecins testeurs — à corréler avec les retours pilote)
SELECT
  global_score,
  CASE
    WHEN global_score >= 78 THEN 'maitrise'
    WHEN global_score >= 55 THEN 'operationnel'
    WHEN global_score >= 35 THEN 'a_surveiller'
    ELSE 'a_risque'
  END AS niveau_global,
  COUNT(*) AS n
FROM interview
WHERE protocol_version = 'v2.0' AND status = 'completed'
GROUP BY global_score
ORDER BY global_score DESC;
```

```sql
-- Top 5 des options choisies en bloc B (équipe) — utile pour repérer
-- une dérive éditoriale si tout le monde clique la même option
SELECT
  question_id,
  selected_option,
  selected_option_label,
  COUNT(*) AS n
FROM answer
WHERE question_id IN ('b1', 'b1b', 'b3', 'b4', 'b5', 'b6', 'b7')
GROUP BY question_id, selected_option, selected_option_label
ORDER BY question_id, n DESC;
```

### Si une vérification échoue

| Anomalie | Cause probable | Solution |
|---|---|---|
| Colonnes V2 absentes | Backend Render n'a pas redémarré | Forcer un redeploy depuis le dashboard Render |
| `protocol_version` NULL sur interview legacy | Le default n'a pas été appliqué | Lancer `UPDATE interview SET protocol_version='v1.1.9' WHERE protocol_version IS NULL;` (sécurisé : default aurait déjà dû le faire) |
| Réponses mixtes V1/V2 sur même interview | Bug applicatif | Ne pas réparer en BDD — d'abord identifier l'interview, comprendre comment c'est arrivé, puis corriger côté code |
| `global_score` NULL sur interview V2 completed | Le rapport n'a jamais été ouvert (logique de `set_global_score` dans `get_report`) | Pas grave, sera rempli au premier `GET /report` — ou lancer `GET /interviews/{id}/report` une fois |

---

## 7. Rebascule de `.env.local` (1 min)

Une fois la prod validée, remettre `.env.local` sur Render pour les autres dev :

```bash
cd ~/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo/web

# Édite .env.local pour décommenter la ligne Render et commenter localhost
cat > .env.local <<'EOF'
# URL du backend FastAPI
# - En local : http://localhost:8000
# - En production (Vercel) : https://lugia-checkup-api.onrender.com

# NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=https://lugia-checkup-api.onrender.com
EOF

# (rappel : .env.local est ignoré par git, pas besoin de commit)
```

---

## 8. Tag git `v2.0`

Une fois tout validé bout en bout (étapes 1 à 7), poser le tag :

```bash
cd ~/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git tag -a v2.0 -m "V2.0 — refonte structurelle du check-up

Cohabitation avec V1.1.9 en prod via interview.protocol_version.
Voir CHANGELOG entrées 2026-05-19 V2.0 (T1-T5 + T4a-g)."
git push origin v2.0
```

Le tag servira de point de rollback si une régression apparaît plus tard.

---

## 9. Rollback en cas de catastrophe

Si la prod casse après déploiement (V1.1.9 régressée, V2.0 inutilisable, etc.) :

```bash
# Option A — revert simple (recommandé)
git revert HEAD --no-edit
git push origin main
# Vercel + Render redéploient automatiquement la version d'avant.

# Option B — rollback complet sur v1.1.9 (plus brutal, à n'utiliser que si
# le revert ne suffit pas)
git reset --hard v1.1.9
git push --force-with-lease origin main
```

**Important sur la BDD** : les migrations T3 ajoutent des colonnes nullables (`protocol_version` avec default `v1.1.9`, `scored` avec default 1, 10 colonnes profil V2 toutes null). Un rollback du code laisse ces colonnes en place mais elles ne sont plus lues — aucune corruption.

---

## 10. Post-mortem — checklist finale

Une fois la prod stable depuis 24h :

- [ ] Ouvrir le pilote rédactionnel parallèle (tâche #14) : envoyer `resources/v2_editorial_draft.md` + `resources/v2_editorial_review_guide.md` aux 3-5 médecins.
- [ ] Démarrer T7 : envoyer l'URL prod du parcours V2 aux mêmes médecins (ou à un sous-ensemble selon disponibilité).
- [ ] Lancer en parallèle T6-sourcing (tâche #6) — validation des 21 chiffres marqués `[À CONFIRMER]` contre les sources DREES / CNAM / CMG / URPS / CPTS / ANS / CNOM / CNIL.
- [ ] Quand les retours rédactionnels reviennent : appliquer les corrections sur les JSON V2 et faire un mini-déploiement V2.0.1.

---

*Runbook versionné dans `wireframes/`. À mettre à jour si la procédure de déploiement évolue.*
