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
