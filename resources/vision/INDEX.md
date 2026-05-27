# Vision Lugia Work System — Index des documents

> Mémoire produit et stratégique de la vision long terme **Lugia & Co Doctor / Work System**.
> Archivés depuis les sessions de conception de mai 2026. Ces documents décrivent
> le produit cible (au-delà du Checkup Demo actuel) : moteur WSF générique,
> jumeau numérique vivant, dimension documentaire, modèle économique.
>
> Cf `DECISIONS.md` D-041 (architecture 2 niveaux), D-042, D-043 et la section
> « CAP LONG TERME — Lugia Work System » de `ROADMAP.md`.

---

## Vision produit et stratégie

| Fichier | Rôle |
|---|---|
| `lugia_co_doctor_specification.md` | Spécification produit de référence — vision, enjeux réglementaires (AI Act, RGPD, MDR, HDS), chantiers P0-P3, approche produit, stratégie commerciale, feuille de route 3 phases. |
| `vault_medical_projet.md` | Descriptif du projet vault médical — genèse, schéma vivant, vault local de tokenisation, dialogue guidé, architecture technique cible. |
| `medvault_benefices_strategie_commerciale.md` | Bénéfices détaillés + stratégie commerciale (paliers 49/149€, canaux B2C/MSP/assureurs RCP/URPS/OEM, métriques). |
| `lugia_nouveaux_benefices_ameliorations.md` | Nouveaux bénéfices (charge mentale, assistant proactif, preuve sociale inter-cabinet…) + lecture critique des fausses bonnes idées. |

## Moteur WSF générique (le socle technique)

| Fichier | Rôle |
|---|---|
| `lugia_moteur_wsf_specification.md` | **Spécification technique du moteur WSF générique** — 9 composantes, types/états/liaisons, règles R1-R5, patterns P1-P7, simulation causale, score santé, rendu Mermaid, contrat d'instanciation sectorielle. Base de `web/lib/wsf/`. |
| `lugia_moteur_wsf_demo.html` | Prototype interactif du moteur — 3 secteurs (doctor/lawyer/finance) qui prouvent la séparation générique/sectoriel. |
| `lugia_moteur_wsf_ameliorations.md` | Volet 1 des améliorations (puissance) — 10 axes : couche économique, mémoire/apprentissage, dynamique, incertitude, etc. Priorisés en vagues. |
| `lugia_moteur_wsf_fidelite_reel.md` | Volet 2 des améliorations (fidélité au réel) — axes 11-20 : travail réel vs prescrit, variabilité, charge cognitive, interruptions, dépendances cachées… Principe « fidélité par déduction ». |
| `lugia_mermaid_wsf_modelisation.md` | Référence Mermaid ↔ WSF — 6 types de diagrammes mappés aux composantes, règles de rendu, niveaux de zoom, lentilles. |

## Jumeau numérique vivant (la couche produit)

| Fichier | Rôle |
|---|---|
| `lugia_jumeau_numerique_specification.md` | **Spécification du jumeau numérique** — modèle vivant, maturité (CONFIRMÉ/INFÉRÉ/SUPPOSÉ), complétude progressive, 5 niveaux de zoom, 7 lentilles, mode focus, simulation économique. |
| `lugia_jumeau_numerique.html` | Prototype du jumeau (complétude par composante). |
| `lugia_pyramide_wsf.html` | Prototype pyramide WSF (niveau 1) avec lentilles. |
| `lugia_navigation_v2.html` | Prototype navigation avec curseur de zoom + lentilles. |
| `lugia_navigation_multiniveaux.html` | Prototype navigation multi-niveaux (vignette → carte → fiche objet) avec fil d'Ariane. |
| `lugia_dimension_documentaire.md` | Dimension documentaire — 8ème lentille « Documentation », objet documentaire (maturité 0-6), chantiers de structuration, synergie IA. |
| `lugia_bibliotheque_lentilles.md` | **Bibliothèque complète des lentilles** — 22 angles de lecture par famille (fondamentales, stratégiques, métier, temporelles, humaines, protection), règles de conception R1-R5, ciblage par public, 3 vagues de développement. |
| `lugia_circulation_savoir.md` | Lentille **Circulation du savoir** (famille humaine/organisationnelle de la bibliothèque) — diffusion des bonnes pratiques entre participants : lien `TRANSMET`, échelle de diffusion 0-5, distinction interne/externe, chantiers (briser un silo…). |
| `lugia_mecanismes.html` | Prototype récapitulatif des mécanismes — 5 niveaux de zoom, 22 lentilles, 6 types de diagrammes, jumeau vivant, boucle vertueuse. Vue d'ensemble pédagogique. |

## Dialogue / onboarding (prototypes de construction du schéma)

| Fichier | Rôle |
|---|---|
| `medvault_onboarding.html` | Prototype onboarding dialogue guidé. |
| `vault_dialogue.html` | Prototype dialogue → canvas qui se dessine en temps réel (nœuds + arêtes + sensibilité). |

---

## Statut d'implémentation (au 2026-05-26)

- ✅ **Première brique du moteur posée** : `web/lib/wsf/types.ts` (types génériques) + `web/lib/wsf/render-mermaid.ts` (rendu Mermaid depuis graphe WSF). Aligné sur `lugia_moteur_wsf_specification.md` sections 1-2 et 9.
- ✅ **Première consommation** : C.A — schéma Mermaid simplifié du chantier généré au tour 4 du chat (Checkup Demo gratuit).
- ⏳ **Reste à construire** (Work System payant) : maturité des objets, couche économique, patterns, règles R1-R5, simulation causale, score santé, 5 niveaux de zoom, la bibliothèque de lentilles (22, incl. Documentation et Circulation du savoir + le lien `TRANSMET`), mode focus. Voir backlog moteur (WS.3) dans ROADMAP.

> Les prototypes HTML sont des **références de vision**, pas du code à porter tel quel. La reconstruction se fait avec les composants V3-charte (palette Lugia, Onest/Lora/IBM Plex Mono).
