# SQL queries — suivi pilote V2.0

**Usage** : copier-coller dans psql, Postico, TablePlus, DBeaver, ou le shell Render. Toutes ces requêtes sont **lecture seule** — pas de risque d'altération.

**Connexion** : `psql "$DATABASE_URL"` (sur Render shell) ou via l'URL externe dans le dashboard Render → Database → Connect → External Database URL.

Sections :
1. Volumétrie & adoption
2. Drop-off & taux de complétion
3. Scores et niveaux V2
4. Profils des médecins V2
5. Choix éditoriaux des médecins (biais et popularité)
6. Signaux croisés et benchmarks combinatoires
7. Anomalies & hygiène

---

## 1. Volumétrie & adoption

### 1.1 Interviews par version × status

Vision macro à regarder en premier — combien de gens utilisent chaque version, combien ont fini.

```sql
SELECT
  protocol_version,
  status,
  COUNT(*) AS n
FROM interview
GROUP BY protocol_version, status
ORDER BY protocol_version, status;
```

### 1.2 Adoption V2.0 par jour

Pour voir la cinétique d'adoption du pilote.

```sql
SELECT
  DATE(created_at) AS day,
  protocol_version,
  COUNT(*) AS n_started,
  COUNT(*) FILTER (WHERE status = 'completed') AS n_completed
FROM interview
GROUP BY day, protocol_version
ORDER BY day DESC, protocol_version;
```

### 1.3 Médecins uniques par version

Combien de médecins distincts ont essayé chaque version (un même email peut avoir plusieurs interviews).

```sql
SELECT
  protocol_version,
  COUNT(DISTINCT email) AS n_unique_doctors,
  COUNT(*) AS n_interviews_total
FROM interview
WHERE email IS NOT NULL
GROUP BY protocol_version;
```

### 1.4 Médecins qui ont essayé les deux versions

Croiser le ressenti V1 vs V2 chez les mêmes utilisateurs.

```sql
SELECT email
FROM interview
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(DISTINCT protocol_version) = 2;
```

---

## 2. Drop-off & taux de complétion

### 2.1 Taux de complétion V2.0

Quel pourcentage de ceux qui démarrent V2 finissent ?

```sql
SELECT
  COUNT(*) AS n_total,
  COUNT(*) FILTER (WHERE status = 'completed') AS n_completed,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0),
    1
  ) AS pct_completion
FROM interview
WHERE protocol_version = 'v2.0';
```

### 2.2 Drop-off par étape (V2.0)

Très utile pour identifier où le parcours perd les utilisateurs. Combien d'interviews ont atteint au moins une question de chaque bloc ?

```sql
WITH v2 AS (
  SELECT id FROM interview WHERE protocol_version = 'v2.0'
)
SELECT
  'profile_started'      AS step,
  COUNT(*) FILTER (WHERE up.cabinet_type IS NOT NULL) AS n
FROM v2
LEFT JOIN interview i ON i.id = v2.id
LEFT JOIN user_profile up ON up.email = i.email
UNION ALL
SELECT 'energy_answered', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'energy'
UNION ALL
SELECT 'block_A_started', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'a1'
UNION ALL
SELECT 'block_A_completed', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'a6'
UNION ALL
SELECT 'block_B_started', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'b1'
UNION ALL
SELECT 'block_C_started', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'c1'
UNION ALL
SELECT 'block_C_completed', COUNT(DISTINCT a.interview_id)
FROM v2 JOIN answer a ON a.interview_id = v2.id AND a.question_id = 'c6'
UNION ALL
SELECT 'interview_completed', COUNT(*) FROM interview
WHERE protocol_version = 'v2.0' AND status = 'completed';
```

Lire l'écart entre `block_A_started` et `block_A_completed` pour mesurer l'abandon intra-bloc, et entre les blocs A/B/C pour mesurer l'abandon inter-blocs.

### 2.3 Temps moyen entre `created_at` et `updated_at` (V2 complétées)

Durée perçue du parcours V2 sur les interviews completed.

```sql
SELECT
  ROUND(
    EXTRACT(EPOCH FROM AVG(updated_at::timestamp - created_at::timestamp)) / 60,
    1
  ) AS avg_minutes,
  ROUND(
    EXTRACT(EPOCH FROM MIN(updated_at::timestamp - created_at::timestamp)) / 60,
    1
  ) AS min_minutes,
  ROUND(
    EXTRACT(EPOCH FROM MAX(updated_at::timestamp - created_at::timestamp)) / 60,
    1
  ) AS max_minutes
FROM interview
WHERE protocol_version = 'v2.0' AND status = 'completed';
```

À comparer aux 25 min annoncées sur l'intro.

---

## 3. Scores et niveaux V2

### 3.1 Distribution du global_score V2

Pour vérifier que les seuils 35/55/78 produisent une distribution raisonnable.

```sql
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

### 3.2 Distribution agrégée par niveau

Version condensée si tu veux juste les 4 buckets.

```sql
SELECT
  CASE
    WHEN global_score >= 78 THEN 'maitrise'
    WHEN global_score >= 55 THEN 'operationnel'
    WHEN global_score >= 35 THEN 'a_surveiller'
    ELSE 'a_risque'
  END AS niveau,
  COUNT(*) AS n,
  ROUND(AVG(global_score), 1) AS avg_score
FROM interview
WHERE protocol_version = 'v2.0' AND status = 'completed'
GROUP BY niveau
ORDER BY avg_score DESC;
```

---

## 4. Profils des médecins V2

### 4.1 Snapshot complet des profils ayant démarré V2

```sql
SELECT
  up.email,
  up.firstname,
  up.cabinet_type,
  up.volume,
  up.paramedical_team,
  up.logiciel_metier,
  up.rdv_canal,
  up.status,
  up.territoire,
  up.horizon,
  up.motivation,
  (SELECT COUNT(*) FROM interview i WHERE i.email = up.email AND i.protocol_version = 'v2.0') AS n_v2_interviews
FROM user_profile up
WHERE up.cabinet_type IS NOT NULL
ORDER BY up.updated_at DESC;
```

### 4.2 Distribution par cabinet_type, status, motivation

Trois requêtes complémentaires pour caractériser la cohorte pilote.

```sql
SELECT cabinet_type, COUNT(*) FROM user_profile WHERE cabinet_type IS NOT NULL GROUP BY cabinet_type;
SELECT status, COUNT(*) FROM user_profile WHERE status IS NOT NULL GROUP BY status;
SELECT motivation, COUNT(*) FROM user_profile WHERE motivation IS NOT NULL GROUP BY motivation;
SELECT territoire, COUNT(*) FROM user_profile WHERE territoire IS NOT NULL GROUP BY territoire;
SELECT horizon, COUNT(*) FROM user_profile WHERE horizon IS NOT NULL GROUP BY horizon;
```

### 4.3 Logiciel métier déclaré + free text

Pour calibrer la couverture de la liste prédéfinie (si beaucoup de `autre` avec saisie libre, ajouter ces logiciels à la liste).

```sql
SELECT
  logiciel_metier,
  logiciel_metier_other,
  COUNT(*) AS n
FROM user_profile
WHERE logiciel_metier IS NOT NULL
GROUP BY logiciel_metier, logiciel_metier_other
ORDER BY n DESC;
```

---

## 5. Choix éditoriaux des médecins (biais et popularité)

### 5.1 Top des options choisies par question (V2.0, toutes interviews completed)

À regarder pour repérer un biais de désirabilité (ex : 100% des médecins cochent l'option positive — soit l'option a un problème de wording, soit le pilote est trop homogène).

```sql
SELECT
  a.question_id,
  a.selected_option,
  LEFT(a.selected_option_label, 80) AS label,
  COUNT(*) AS n,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY a.question_id), 1) AS pct
FROM answer a
JOIN interview i ON i.id = a.interview_id
WHERE i.protocol_version = 'v2.0' AND i.status = 'completed'
GROUP BY a.question_id, a.selected_option, a.selected_option_label
ORDER BY a.question_id, n DESC;
```

### 5.2 C5 — répartition sur la question IA (anti-désirabilité critique)

La question C5 a été reformulée post-revue pour éviter le biais inverse. Si **>90% cochent c5_d** (le plus mature), c'est suspect — soit le pilote est très avancé numériquement, soit les options s=1/s=2 ne sont pas assumables.

```sql
SELECT
  selected_option,
  LEFT(selected_option_label, 80) AS label,
  COUNT(*) AS n
FROM answer a
JOIN interview i ON i.id = a.interview_id
WHERE i.protocol_version = 'v2.0' AND a.question_id = 'c5'
GROUP BY selected_option, selected_option_label
ORDER BY selected_option;
```

### 5.3 Routing solo b1b vs b3 — répartition réelle

Pour confirmer que la cohorte pilote a bien un mix solo/non-solo.

```sql
SELECT
  question_id,
  COUNT(DISTINCT interview_id) AS n_interviews
FROM answer a
JOIN interview i ON i.id = a.interview_id
WHERE i.protocol_version = 'v2.0'
  AND question_id IN ('b1b', 'b3')
GROUP BY question_id;
```

### 5.4 Énergie ressentie

Distribution de l'ancrage énergie — pour voir si le pilote contient des médecins "au bord" (qui pèsera sur les retours).

```sql
SELECT
  selected_option,
  selected_option_label,
  COUNT(*) AS n
FROM answer
WHERE question_id = 'energy'
GROUP BY selected_option, selected_option_label
ORDER BY selected_option;
```

---

## 6. Signaux croisés et benchmarks combinatoires

Le `signal` et les `benchmarks_combinatoire` ne sont **pas stockés en BDD** — ils sont recalculés à chaque appel `/report`. Les requêtes ci-dessous **simulent** la condition en SQL à partir des scores reconstitués.

Note : ces requêtes calculent les scores en SQL pour pouvoir filtrer. Si tu veux le détail, va voir `src/v2/signals.py` (les conditions sont déclaratives dans `diagnostics_v2.json`).

### 6.1 Signal croisé estimé sur les interviews V2 completed

```sql
WITH scores_v2 AS (
  -- Calcule % par axe par interview pour V2.0
  SELECT
    i.id AS interview_id,
    SUM(CASE WHEN a.question_id LIKE 'a%' AND a.question_id != 'a_dummy' THEN
      CASE a.selected_option
        WHEN 'a1_a' THEN 1 WHEN 'a1_b' THEN 2 WHEN 'a1_c' THEN 3 WHEN 'a1_d' THEN 4
        WHEN 'a2_a' THEN 1 WHEN 'a2_b' THEN 2 WHEN 'a2_c' THEN 3 WHEN 'a2_d' THEN 4
        WHEN 'a3_a' THEN 1 WHEN 'a3_b' THEN 2 WHEN 'a3_c' THEN 3 WHEN 'a3_d' THEN 4
        WHEN 'a4_a' THEN 1 WHEN 'a4_b' THEN 2 WHEN 'a4_c' THEN 3 WHEN 'a4_d' THEN 4
        WHEN 'a5_a' THEN 1 WHEN 'a5_b' THEN 2 WHEN 'a5_c' THEN 3 WHEN 'a5_d' THEN 4
        WHEN 'a6_a' THEN 1 WHEN 'a6_b' THEN 2 WHEN 'a6_c' THEN 3 WHEN 'a6_d' THEN 4
      END ELSE 0 END) * 100.0 / 24 AS score_A,
    i.global_score
  FROM interview i
  LEFT JOIN answer a ON a.interview_id = i.id
  WHERE i.protocol_version = 'v2.0' AND i.status = 'completed'
  GROUP BY i.id, i.global_score
)
SELECT * FROM scores_v2 ORDER BY interview_id;
```

*Note : version simplifiée, ne couvre que l'axe A. Pour le full triplet A/B/C, mieux vaut interroger le backend via curl `/interviews/{id}/scores` que reconstruire en SQL.*

### 6.2 Approche alternative — exporter les scores via l'API

Plus simple et plus fiable :

```bash
# Pour chaque interview V2 completed, fetch les scores
for ID in $(psql -t -c "SELECT id FROM interview WHERE protocol_version='v2.0' AND status='completed'"); do
  curl -s "$API/interviews/$ID/scores" | python3 -c "
import json,sys; d=json.load(sys.stdin)
print(f'$ID, A={d[\"A\"][\"pct\"]}, B={d[\"B\"][\"pct\"]}, C={d[\"C\"][\"pct\"]}, global={d[\"global_score\"]}')
"
done
```

(Nécessite que tu sois authentifié — adapte avec le token de ta session.)

---

## 7. Anomalies & hygiène

### 7.1 Interviews V2 sans profil complet (étape 1 ou 2)

Théoriquement impossible — le frontend force le profil avant la création. Si présent → bug.

```sql
SELECT
  i.id,
  i.email,
  i.created_at,
  up.cabinet_type IS NOT NULL AS has_step1,
  up.status IS NOT NULL AS has_step2
FROM interview i
LEFT JOIN user_profile up ON up.email = i.email
WHERE i.protocol_version = 'v2.0'
  AND (up.cabinet_type IS NULL OR up.status IS NULL)
ORDER BY i.created_at DESC;
```

### 7.2 Interviews V2 avec **les deux** routages solo (b1b ET b3)

Le cas que tu as observé sur ta dernière interview (19 réponses au lieu de 18). Probablement un médecin qui a changé son `cabinet_type` en cours de route.

```sql
SELECT
  i.id,
  i.email,
  up.cabinet_type,
  COUNT(DISTINCT CASE WHEN a.question_id = 'b1b' THEN 1 END) AS has_b1b,
  COUNT(DISTINCT CASE WHEN a.question_id = 'b3' THEN 1 END) AS has_b3,
  COUNT(*) AS total_answers
FROM interview i
JOIN answer a ON a.interview_id = i.id
LEFT JOIN user_profile up ON up.email = i.email
WHERE i.protocol_version = 'v2.0'
GROUP BY i.id, i.email, up.cabinet_type
HAVING COUNT(DISTINCT CASE WHEN a.question_id = 'b1b' THEN 1 END) > 0
   AND COUNT(DISTINCT CASE WHEN a.question_id = 'b3' THEN 1 END) > 0
ORDER BY i.id DESC;
```

Inoffensif côté scoring (`get_visible_questions` filtre selon le profil actuel), mais à surveiller. Si récurrent, il faudrait que le backend supprime les réponses orphelines quand le profil change.

### 7.3 Mélanges de protocoles (V1 sur interview V2 ou inversement)

Doit être 0 ligne. Si pas zéro → bug applicatif.

```sql
-- V1.1.9 avec une question_id V2.0
SELECT i.id, i.protocol_version, a.question_id
FROM interview i JOIN answer a ON a.interview_id = i.id
WHERE i.protocol_version = 'v1.1.9'
  AND a.question_id NOT LIKE 'q%'
  AND a.question_id <> 'energy'
LIMIT 10;

-- V2.0 avec une question_id V1.1.9
SELECT i.id, i.protocol_version, a.question_id
FROM interview i JOIN answer a ON a.interview_id = i.id
WHERE i.protocol_version = 'v2.0'
  AND a.question_id ~ '^q[0-9]'
LIMIT 10;
```

### 7.4 Question_id orphelins (n'appartiennent à aucun protocole connu)

Reste de la migration v1.10 → v1.11 (q15/q16/q17 sur des interviews historiques) — légitime. Tout autre id orphelin = bug.

```sql
SELECT DISTINCT question_id
FROM answer
WHERE question_id NOT IN (
  -- V1.1.9 stricte (v1.11)
  'q01','q02','q03','q04','q05','q06','q07','q08','q09','q10','q11','q12','q13','q14',
  -- V1.1.9 historique (v1.10, à drop progressivement)
  'q15','q16','q17',
  -- V2.0
  'energy',
  'a1','a2','a3','a4','a5','a6',
  'b1','b1b','b3','b4','b5','b6','b7',
  'c1','c2','c3','c4','c5','c6'
);
```

### 7.5 Interviews completed sans `global_score`

Le `global_score` est rempli au premier `GET /report` d'une interview V2 completed. Si une interview est completed mais global_score=NULL, c'est que personne n'a ouvert le rapport (ou bug).

```sql
SELECT id, email, created_at, updated_at
FROM interview
WHERE protocol_version = 'v2.0'
  AND status = 'completed'
  AND global_score IS NULL
ORDER BY updated_at DESC;
```

### 7.6 Réponses dupliquées (devrait être impossible — UNIQUE implicite)

```sql
SELECT interview_id, question_id, COUNT(*) AS n
FROM answer
GROUP BY interview_id, question_id
HAVING COUNT(*) > 1;
```

`save_answer` fait un DELETE+INSERT, donc cette requête doit retourner 0 lignes.

---

## 8. Bonus — exports pour analyse externe

### 8.1 Export CSV des profils V2 + scores

Utile pour partager avec un médecin ou analyser dans un tableur.

```sql
COPY (
  SELECT
    i.id AS interview_id,
    i.protocol_version,
    i.status,
    i.global_score,
    up.cabinet_type, up.volume, up.paramedical_team,
    up.logiciel_metier, up.rdv_canal,
    up.status AS doctor_status,
    up.territoire, up.horizon, up.motivation,
    i.created_at, i.updated_at
  FROM interview i
  LEFT JOIN user_profile up ON up.email = i.email
  WHERE i.protocol_version = 'v2.0'
  ORDER BY i.created_at DESC
) TO STDOUT WITH CSV HEADER;
```

Sur Render shell : `psql "$DATABASE_URL" -c "..." > export_v2.csv`.

---

## Notes de pilotage

- Sur un pilote à **3-5 médecins**, ne pas tirer de conclusions statistiques. Ces requêtes servent à **détecter des anomalies évidentes** (drop-off massif, biais de désirabilité, mélange de protocoles), pas à valider l'outil.
- Pour valider l'outil méthodologiquement, il faudra **30+ interviews V2.0 completed** — c'est l'horizon V2.2 où la collecte agrégée prend du sens (cf piste V3 §11 dans `ROADMAP.md`).
- À chaque modification structurante (nouvelle règle, nouveau benchmark), reprendre §5 pour vérifier que la distribution des choix n'a pas dérivé.

---

*Fichier versionné dans `resources/`. Mettre à jour au fil des observations pilote.*
