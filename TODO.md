# TODO

Tâches restantes, bugs et points à valider, ordonnés par priorité de prise en charge.

---

## Phases validées

- **V0-1 à V0-5** — 12-13 mai 2026. V0 figée sur tag `v0-final`.
- **V1-0** — Tag git `v0-final`, MASTER_PROMPT v3.0, D-017, ROADMAP restructuré.
- **V1-1** — Infra déployée. `diagnostic.lugia.fr` accessible avec page placeholder. Comptes Vercel, Render, Resend opérationnels.
- **V1-2a / V1-2b** — Backend FastAPI minimal, déployé sur Render `https://lugia-checkup-api.onrender.com`.
- **V1-3a / V1-3b** — Refactor SQLAlchemy, Postgres provisionné, persistance prouvée entre deux cold starts.
- **V1-4a / V1-4b / V1-4b iter 2 / V1-4c** — Frontend Next.js complet (accueil → check-up → résultats), reprise depuis l'accueil.
- **V1-5a** — Backend auth lien magique opérationnel en local. Les 8 vérifications passées (request-link → console → verify-token → Authorize → /auth/me → POST /interviews → GET /interviews/active → test négatif). Mode console suffisant tant que Resend n'est pas configuré.

---

## Prochaine phase — V1-5b : configuration Resend (DNS lugia.fr + env Render)

Objectif : passer du mode console au véritable envoi d'email pour le lien magique.

Étapes :

1. Sur l'app Resend (`https://resend.com/domains`), ajouter le domaine `lugia.fr` et récupérer les enregistrements DNS proposés (typiquement : 1 enregistrement MX optionnel, 1 SPF TXT, 1 DKIM TXT, 1 DMARC TXT).
2. Sur OVH (zone DNS de `lugia.fr`), ajouter ces enregistrements sans toucher au CNAME `diagnostic` déjà en place.
3. Attendre la vérification Resend (5 min à quelques heures selon propagation DNS).
4. Créer une clé API Resend (Production), la copier — elle ne sera plus jamais montrée.
5. Sur Render, dans le Web Service `lugia-checkup-api`, ajouter trois variables d'environnement :
   - `RESEND_API_KEY` = la clé créée ci-dessus.
   - `RESEND_FROM_EMAIL` = `Lugia <[email protected]>` (ou autre adresse de ton domaine).
   - `FRONTEND_URL` = `https://diagnostic.lugia.fr`.
6. Render redéploie automatiquement à l'ajout des env vars.
7. Tester sur `https://lugia-checkup-api.onrender.com/docs` : `POST /auth/request-link` avec ton vrai email, confirmer la réception, vérifier que le lien pointe bien vers `https://diagnostic.lugia.fr/auth?token=...`.

---

## Phases à venir après V1-5b

- **V1-5c** — Frontend auth. Pages `/login` (saisie email) et `/auth?token=...` (échange contre `session_token`, stockage en `localStorage`), propagation `Authorization: Bearer ...` dans `web/lib/api.ts`, redirection vers `/login` si pas de session. Débloque le 401 actuel du frontend.
- **V1-6** — Déploiement frontend Next.js sur Vercel avec `NEXT_PUBLIC_API_URL=https://lugia-checkup-api.onrender.com`. Vérifier preset Next.js, accès via `diagnostic.lugia.fr`.
- **V1-7** — Premier test client en condition réelle, bout en bout.

---

## Outils de dev disponibles

```bash
python scripts/seed_persona.py            # ajoute une session pré-remplie
python scripts/seed_persona.py --reset    # supprime toutes les sessions puis seed
python scripts/dump_report.py --list      # liste les interviews
python scripts/dump_report.py --id <N>    # dump le rapport d'une interview
```

---

## Points à valider plus tard (V1.5 / V2)

- Format final du rapport PDF, choix outil d'export (WeasyPrint, ReportLab).
- Pyramide animée (V1.5).
- Section "Vos mots" enrichie (V1.5).
- Auth permanente avec compte + mot de passe (V2).
- Conformité RGPD complète (V2).
- Pricing et facturation (V2).

---

*À nettoyer à chaque fin de phase. Les tâches accomplies sont remontées dans `CHANGELOG.md`.*
