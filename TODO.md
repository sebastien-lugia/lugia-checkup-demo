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
- **V1-5a** — Backend auth lien magique opérationnel en local. Les 8 vérifications passées. Mode console suffisant tant que Resend n'est pas configuré.
- **V1-5b** — Envoi réel d'email via Resend. Domaine `lugia.fr` vérifié, DNS OVH posés, env vars Render configurées, code V1-5a poussé sur GitHub, test bout en bout réussi (email reçu et bien rendu).
- **V1-5c** — Frontend auth livré et validé. Pages `/login` et `/auth`, `web/lib/auth.ts`, propagation Bearer, guard `useRequireAuth` sur les 3 pages protégées, header avec email + déconnexion. Parcours complet vérifié.

## Prochaine phase — V1-6 : déploiement frontend Next.js sur Vercel

Une fois V1-5c validée :

1. Sur Vercel, projet `diagnostic-lugia-fr` (ou créer un nouveau projet) → connecter le repo GitHub.
2. **Root Directory** : `web/`.
3. **Framework Preset** : Next.js (auto-détecté).
4. Variable d'env Vercel : `NEXT_PUBLIC_API_URL=https://lugia-checkup-api.onrender.com`.
5. Déployer.
6. Une fois prod en ligne, vérifier que `https://diagnostic.lugia.fr` ne renvoie plus la page placeholder mais bien le frontend Next.js (redirection automatique vers `/login`).
7. Tester un parcours bout en bout en production.
8. Remettre `FRONTEND_URL=https://diagnostic.lugia.fr` sur Render si déplacé pendant V1-5c.

## Phase suivante — V1-7

Premier test client en condition réelle, bout en bout.

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
