# TODO

Tâches restantes, bugs et points à valider. Tient lieu de carnet de bord court-terme. Les tâches accomplies sont remontées dans `CHANGELOG.md`.

---

## V0 et V1 figées

- **V0** Streamlit local — figée 12-13 mai 2026, tag `v0-final`. On n'y touche plus.
- **V1** portage technique web — figée 13 mai 2026, tag `v1-final`. Accessible en prod sur `https://diagnostic.lugia.fr`.

---

## V1.1 LIVRÉE — méthodologique enrichi (15 mai 2026)

Itération sur le backlog des premiers retours utilisateurs (mai 2026). Cadre stratégique acté en D-020 (méthodologique enrichi en V1.1, SLM en V1.2). Sept vagues livrées en cascade dans la journée du 15 mai :

- **Vague 1** — quick wins éditoriaux et UX (Sébastien en autonomie, 14 mai).
- **Vague 2 lite** — nettoyage structurel du moteur de rapport (15 mai matin).
- **Vague 3** — refonte du questionnaire (Q2-Q11 + règles globales 4 options + Autre).
- **Vague 3.1a→f** — homogénéisation format mot-clé — détail, ton resserré, synthèse analytique, philosophie Lugia ancrée dans MASTER_PROMPT (4 axes + vision intégration).
- **Vague 3.1g→h** — corrections wording (Q06_b, Q07, Q05/Q09 "Par exemple :", phrase choc punchifiée, pattern 4 neutre solo, intro chantiers moins de gras).
- **Vague 3.1i** — pattern défaut adouci, fix espace JSX, allégement chantier IA, fix bug session Chateau.
- **Vague 3.1j** — gap axe 2 comblé (Q08 planifié + imprévu) et chaîne causale en synthèse (5 patterns).
- **Vague 3.1k** — scores en entiers visibles (plus de moyenne brute décimale).

Le check-up V1.1 est accessible en prod, méthodologique enrichi sans appel API tiers. ~32 fragments narratifs distincts (à comparer aux 50+ visés par D-020).

### Tag `v1.1` posable

Après les tests utilisateurs en cours et la validation finale en prod, poser :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git pull
git tag -a v1.1 -m "V1.1 — questionnaire et rapport méthodologique enrichi, après retours premiers prospects"
git push origin v1.1
```

---

## V1.1.7 LIVRÉE — voix "vous" + responsive + prénom médecin (16 mai 2026)

Itération sur V1.1.6 livrée le même jour, à partir des specs V3 (`wireframes/resultats_v2_specs.md`). 7 sous-vagues. Voir `CHANGELOG.md` 2026-05-16 V1.1.7 et `DECISIONS.md` D-026.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.7-a | Backend prénom médecin : table user_profile + endpoints /me/profile |
| V1.1.7-b | Frontend : page /compte avec champ Prénom |
| V1.1.7-c | Hero V3 : H1 "Votre cabinet, vu de l'extérieur" + sous-titre "Dr X — résultats du Y" |
| V1.1.7-d | Callout voix "vous" (suppression "Lugia commence par...") + style discret |
| V1.1.7-e | 4 reformulations swot + phrase de transition avant Prochaine étape |
| V1.1.7-f | @media print + @media mobile (640px) |
| V1.1.7-g | Tests & journalisation (cette section) |

### Procédure de déploiement V1.1.7

1. Commit + push depuis machine locale. Render + Vercel rebuild automatiquement (~3 min).
2. Au démarrage Render, `init_db()` applique la nouvelle table user_profile (idempotent).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Aller sur `/compte`, saisir un prénom, enregistrer.
   - Vérifier `/resultats?interview=<id>` : H1 "Votre cabinet, vu de l'extérieur" + sous-titre "Dr {prénom} — résultats du {date}".
   - Callout entre angles et opportunités en voix "vous" (plus de "Lugia commence par...").
   - Phrase de transition "Vous avez vu les chantiers..." avant Prochaine étape.
   - Test impression : Cmd+P / Ctrl+P, vérifier que nav et footer disparaissent, grilles empilées.
   - Test mobile : réduire la fenêtre <640px, vérifier que les grids 3 cols deviennent des stacks verticaux.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/db.py src/templates.py src/swot.py \
        backend/main.py scripts/dump_report.py \
        web/lib/api.ts web/components/AppHeader.tsx \
        web/app/compte/page.tsx web/app/resultats/page.tsx web/app/globals.css
git commit -m "V1.1.7 : voix 'vous' sur le callout + responsive print/mobile + prénom médecin"
git push origin main
```

### Tag `v1.1.7` posable

```bash
git tag -a v1.1.7 -m "V1.1.7 — voix 'vous' sur le callout + responsive + prénom médecin"
git push origin v1.1.7
```

---

## V1.1.6 LIVRÉE — refonte UI page de résultats vers palette V2 (16 mai 2026)

Refonte visuelle complète selon les specs V2 (cf `wireframes/resultats_v2_specs.md` et `wireframes/resultats_v2_cible.pdf`). 6 sous-vagues livrées le 16 mai. Voir `CHANGELOG.md` 2026-05-16 V1.1.6 et `DECISIONS.md` D-025.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.6-a | Structure & palette (nav, Hero, max-w-[840px], palette V2 sobre) |
| V1.1.6-b | Refonte facettes (badge asymétrique 1-2 muets / 3-4 colorés, tirets, séparateur fin) |
| V1.1.6-c | Refonte opportunités (numéro grand + 2 colonnes Situation/Action + À confirmer en pied) |
| V1.1.6-d | Refonte Prochaine étape (carte recommandée bleue mise en avant + boutons CTA) |
| V1.1.6-e | Tests & journalisation (cette section) |
| V1.1.6-f | Séparation recommandation italique en transition entre facettes et opportunités |

### Procédure de déploiement V1.1.6

1. Commit + push depuis machine locale. Render + Vercel rebuild automatiquement (~3 min).
2. Pas de migration BDD à appliquer (UI uniquement).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Nav avec logo Lugia gauche + email droite + bordure basse.
   - 3 cards facette côte à côte avec séparateurs naturels (gap 1px sur fond gris).
   - Badge "À surveiller" / "À risque" uniquement sur les facettes concernées.
   - Reco italique entre les facettes et les opportunités (pas dans la synthèse).
   - Cartes opportunités avec numéro grand + 2 colonnes.
   - Carte "Échanger avec Lugia" mise en avant en bleu sur Prochaine étape.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/templates.py backend/main.py scripts/dump_report.py \
        web/lib/api.ts web/components/AppHeader.tsx web/app/resultats/page.tsx web/app/globals.css \
        wireframes/resultats_v1_actuel.pdf wireframes/resultats_v2_cible.pdf wireframes/resultats_v2_specs.md
git commit -m "V1.1.6 : refonte UI page de résultats vers palette V2 sobre + reco italique en transition"
git push origin main
```

### Tag `v1.1.6` posable

Après vérification post-déploiement, poser :

```bash
git tag -a v1.1.6 -m "V1.1.6 — refonte UI page de résultats vers palette V2"
git push origin v1.1.6
```

---

## V1.1.5 LIVRÉE — niveaux qualitatifs + forces/risques + opportunités + prénom optionnel (16 mai 2026)

Refonte UI/méthodologique de la page de résultats. 10 sous-vagues livrées dans la journée du 16 mai (a, b, c, d, e, f, h, i, j, k — la lettre `g` est la journalisation finale). Voir `CHANGELOG.md` et `DECISIONS.md` D-023 + D-024.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.5-a | Bug visuel alignement + intro chantiers raccourcie |
| V1.1.5-b | Mapping score → niveau qualitatif backend |
| V1.1.5-c | Module `src/swot.py` : 40 fragments Forces/Risques par option |
| V1.1.5-d | API `/report` expose niveau + forces/risques |
| V1.1.5-e | Refonte affichage facettes (badge niveau + barre + listes) |
| V1.1.5-f | Reframing chantiers en "opportunités d'action" |
| V1.1.5-g | Journalisation finale (cette entrée + CHANGELOG + DECISIONS + ROADMAP) |
| V1.1.5-h | 3 analyses chantiers enrichies métier |
| V1.1.5-i | Champ prénom optionnel (BDD + protocol + API + frontend + moteur + seed) |
| V1.1.5-j | Risque plancher dès niveau 2 + note confidentialité prénom + layout 3 colonnes |
| V1.1.5-k | Fusion 5 niveaux → 4 niveaux + forces personnalisées raccourcies |

### Procédure de déploiement V1.1.5

1. Commit + push depuis machine locale (Vercel + Render rebuildent automatiquement, ~3 min).
2. Au démarrage Render, `init_db()` applique automatiquement la migration `entity_name` (idempotente).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Page résultats avec un compte test → 3 cards facette en grid 3 colonnes, badge niveau + barre 4 segments + listes Points forts / Points de vigilance.
   - Questionnaire avec un compte test → input prénom optionnel apparaît sous Q02_a/b/c/other et Q07_b/c/d/other quand sélectionné.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/scoring.py src/swot.py src/templates.py src/workstreams.py src/db.py \
        backend/main.py scripts/dump_report.py scripts/seed_persona.py \
        resources/interview_protocol.json \
        web/lib/api.ts web/components/CheckupWidgets.tsx web/app/resultats/page.tsx
git commit -m "V1.1.5 : niveaux qualitatifs + forces/risques par facette + opportunités d'action + prénom optionnel"
git push origin main
```

### Tag `v1.1.5` posable

Après vérification post-déploiement, poser :

```bash
git tag -a v1.1.5 -m "V1.1.5 — niveaux qualitatifs + forces/risques + opportunités d'action + prénom optionnel"
git push origin v1.1.5
```

---

## Vague 2.2 LIVRÉE — multiplication des variantes méthodologiques (15 mai 2026)

Livrée en 5 sous-vagues dans la même journée que V1.1 Vague 3.1. Critère opérationnel atteint : *deux médecins du même profil ne reçoivent plus exactement la même phrase analytique*. Voir `DECISIONS.md` D-022 et `CHANGELOG.md` entrées 2.2.0 / 2.2a / 2.2b / 2.2c / 2.2d.

### Bilan final

| Section | Variantes finales | Nouvelles |
|---|---|---|
| Phrase choc (6 patterns × 4 variantes) | 24 | 18 |
| Recommandation italique (3 contextes × 1 variante) | 3 | 3 (réécrites concises métier, pas multipliées par choix : voir D-022) |
| Chaînes causales (5 patterns × 3 variantes) | 15 | 10 |
| Analyses chantier (7 contextes × 3 variantes) | 21 | 14 |
| **Total** | **63** | **45 nouvelles + 3 réécrites** |

Sortie strictement identique à V1.1 sur le chemin `interview_id=None` (V0 Streamlit figé sur `v0-final` non impacté). Sortie diversifiée à partir de l'appel API et `dump_report.py` qui passent maintenant `interview_id`.

### Reste à valider en local

Test bout en bout sur 5-10 profils distincts à passer côté machine de Sébastien :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate

# Seed Chateau standard
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset
python scripts/dump_report.py --list
python scripts/dump_report.py --id <id>   # rapport généré dans resources/sample_report.md

# Re-seed avec un autre email = autre interview_id = autre tirage
python scripts/seed_persona.py --email sebastien+test2@gmail.com
python scripts/dump_report.py --list
python scripts/dump_report.py --id <new_id> --out resources/sample_report_v2.md

# Diff visuel à l'œil : la phrase choc, la chaîne causale et l'analyse chantier doivent
# être différentes entre les deux rapports. La reco italique doit être identique.
diff resources/sample_report.md resources/sample_report_v2.md
```

Critères d'acceptation visuels :

- Sur 3 rapports d'un même profil (Chateau × 3 ids), la phrase choc, la chaîne causale et au moins 2 analyses chantier sur 3 sont différentes entre les rapports.
- La reco italique est identique aux 3 rapports d'un même contexte (`reco:ia_visible` ou `reco:descriptions` ou `reco:default`).
- Aucun rapport ne contient de phrase qui sonne plaquée, condescendante ou en doublon avec la phrase suivante.

### V1.2 SLM débloquée

Le socle de 63 fragments narratifs (dont 51 nouveaux) est posé. Voir `ROADMAP.md` V1.2 pour la suite : choix provider API cloud, conception `src/llm.py`, prompts par section avec few-shot V1.1 Vague 2.2.

---

## V1.2 PROCHAIN CHANTIER — SLM hybride

Cadré en D-020 (méthodologique enrichi comme socle, SLM en surcouche avec fallback systématique). À ouvrir dans une nouvelle conversation Claude dédiée (cf D-019).

À couvrir :

- Choix du provider API cloud pour prod (Anthropic Haiku par défaut, alternative Mistral Small).
- Test exploratoire Ollama local sur le MacBook Pro pour calibrer les prompts gratuitement.
- Conception du module `src/llm.py` ou intégration directe dans templates.py avec branchement conditionnel.
- Sélecteur de provider via variables d'environnement `MODEL_PROVIDER` et `LLM_ENABLED`.
- Génération dynamique des options de QCM selon Q01/Q02/Q07 (notamment Q10/Q11 adaptées au médecin solo), avec écran d'attente Lugia pédagogique pendant le calcul.
- Pondération de saillance des chaînes causales par SLM (voir Vague 3.1j + ROADMAP V1.2).
- Enjeux temporels sectoriels datés (`temporal_concerns.json`).
- Fallback systématique sur les templates V1.1 si SLM indisponible ou `LLM_ENABLED=0`.

Voir `ROADMAP.md` section V1.2 + V1.2+ pour le détail.

---

### Critère de fin V1.1

### Critère de fin V1.1

Une session de test avec Sébastien jouant le persona Chateau refondu produit un rapport perçu comme "analyse" et non "redite". Tag `v1.1` posable après cette validation. v1-final reste à poser en amont pour figer l'état pré-retours.

### Session dédiée à venir — combler le gap axe 2 (imprévus) et l'axe 1 (interdépendances)

Audit du parcours V1.1 Vague 3.1f vs les 4 axes Lugia (cf `MASTER_PROMPT.md` section 2) : le questionnaire est fidèle aux axes 1, 3, 4 mais a un gap clair sur l'axe 2 (imprévus et surcharges ponctuelles) et l'axe 1 (interdépendances rarement explicitées). À traiter dans une conversation Claude dédiée :

- **Q08 enrichie** : capter les deux dimensions (congés planifiés ET absence imprévue) dans le même QCM, ou la dédoubler en Q08a/Q08b. Le complément libre de Chateau le révèle déjà ("Une semaine d'arrêt non planifié, je ne sais pas comment je gérerais") — le QCM doit le sonder.
- **Chaîne causale nommée en synthèse** : `build_phrase_choc` ou `build_synthesis` doit pouvoir produire une formulation type "Votre débordement administratif (Q05) trouve sa source dans des canaux non régulés (Q04) et un cadre non formalisé (Q03)" au lieu de juxtaposer deux symptômes. Plus disruptif, plus fidèle à l'axe 1.

---

## V1.2 PRÉVUE après V1.1 — intégration SLM hybride

Cadrée en D-020. Architecture orchestration LLM avec fallback méthodologique systématique.

À préparer avant d'attaquer :

- Choix du provider API cloud pour prod (Anthropic Haiku par défaut).
- Test exploratoire Ollama en local sur MacBook Pro pour valider la qualité des prompts.
- Conception du module `src/llm.py` ou intégration directe dans `templates.py` avec branchement conditionnel.

---

## Tracks parallèles (cf. D-019)

Chaque track est traité dans sa propre conversation Claude, avec le prompt d'ouverture `meta/PROMPT_OUVERTURE.md`.

- **Démonstrateur technique** — cette conversation (V1.1, V1.2, V1.5, V2).
- **Communication** — identité visuelle, page `/qui-est-lugia` (rédactionnel), site marketing `lugia.fr`, slides.
- **Marché et clients** — V1-7 préparation (prospect Chateau identifié côté Sébastien), fiches prospects, étude de marché.
- **Opérationnel** — méthode, scoring avancé, templates de livrables clients.

---

## Vigilance opérationnelle continue

- **Postgres Render free tier** — expiration le **11 août 2026**. Bascule à prévoir avant cette date : plan Starter (~7$/mois) ou recréation + migration.
- **DPA à signer** côté Vercel, Render, Resend — gratuit, ~15 min par fournisseur, à régulariser avant tout contrat commercial.
- **Relecture juridique RGPD** — recommandée (200-500€) avant signature premier client payant.

---

## Outils de dev disponibles

```bash
# Seed persona Chateau pour ton email, idéal pour itérer sur le rapport
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Idem mais contre Postgres prod
DATABASE_URL='postgresql://...' python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Dump du rapport généré pour comparer deux versions sans navigateur
python scripts/dump_report.py --list
python scripts/dump_report.py --id <N>
```

Documentation complète d'usage : `docs/seed_persona_usage.md`.

Convention `+test` pour distinguer tests prospects de vraies données en prod.
