# Lugia — Complément d'intégration du corpus Steven Alter
**Document de transmission** — pour une fenêtre disposant déjà du contexte Lugia  
**Date** Juin 2026  
**Statut** Décisions arbitrées (« justesse sans complexité ») + roadmap

---

## Objet de ce document

Ce document explique **uniquement le complément** apporté à la méthode Lugia après lecture du corpus académique complet de Steven Alter (13 papiers : 24 axiomes WST, 24 principes WST, 8 espaces de design, 18 facettes de travail, théorie des workarounds, ISKG/DKG/SSKG, RAVC).

Il se lit en deux parties :
- **Partie 1 — Actuel** : ce qui a été décidé et intégré dans la v0.5 de la spec
- **Partie 2 — Roadmap** : ce qui reste un socle théorique, et pourquoi, avec les conditions d'une éventuelle intégration future

Le principe directeur de l'arbitrage : *rendre la méthode la plus juste, précise et englobante possible sans la complexifier inutilement.* Le test appliqué à chaque élément : **« est-ce qu'un médecin verrait la différence ? »**

---

## Rappel — les 4 familles de calibration de Lugia

```
Famille A — Confiance extraction
  Pilotent la création et la visibilité des objets extraits par l'IA.
  Impact : qualité du substrat de données.

Famille B — Détection de signaux
  Pilotent le déclenchement des règles N8.
  Impact : pertinence des alertes générées.

Famille C — Cycle de vie
  Pilotent la progression des objets entre états (emergent → actif…)
  et la vélocité des signaux.
  Impact : fidélité de la modélisation du changement.

Famille D — Complétude
  Pilotent le score de couverture des thèmes et axes.
  Impact : représentation du radar et des zones vides.
```

---

# PARTIE 1 — ACTUEL (intégré en v0.5)

Trois ajouts seulement ont passé le test « justesse sans complexité ». Les voici, avec leur famille d'appartenance.

## Ajout 1 — R14 Workaround détecté → Famille B (+ effet Famille C)

**Ce que c'est.** Une nouvelle règle de détection N8 déclenchée quand l'extrait de conversation contient un lexique de contournement (« le DMP je le fais quand j'ai le temps », « le logiciel bugue donc je note sur papier »).

**Pourquoi c'est le seul ajout vraiment important.** Un workaround est le signal le plus honnête qu'une organisation puisse émettre — il dit littéralement « le système réel diffère du système officiel, et voilà où ». Aucune règle structurelle existante (R01-R13) ne capture cela, parce que ces règles vérifient la *présence* des éléments, pas la *correspondance* entre système conçu et travail réel.

**Source théorique.** Theory of Workarounds (Alter, 2014) + axiomes A18 (agency) et A19 (compliance/noncompliance). Un workaround peut être bénéfique (révèle une meilleure pratique à officialiser) ou nuisible (à corriger). La règle le détecte ; l'IA en interview en qualifie la nature.

**Spécification.**
```
Code:       R14
Condition:  extrait_source contient le lexique de workaround
            ET relation vers un objet facette="outils" ou "actes"
Lexique:    "je contourne", "je ne fais pas vraiment", "quand j'ai le temps",
            "je bricole", "j'ai trouvé un moyen de", "ça ne marche pas donc je",
            "en théorie oui mais en pratique", "je note sur papier à la place"…
Sévérité:   moyen
Type signal: workaround
Effet N4:   stabilité de l'objet contourné -= 0.20
```

**Pourquoi ça ne complexifie pas.** C'est une règle de plus, déclenchée par un lexique. Aucune nouvelle structure de données, aucun nouveau calcul. Un médecin verrait la différence : il se sentirait *compris* plutôt que jugé.

---

## Ajout 2 — Complétude fonctionnelle (3 facettes) → Famille D

**Ce que c'est.** Une nouvelle sous-dimension de complétude, distincte de la complétude structurelle existante.

```
completude_structurelle (existante)
  = COUNT(facettes WSF couvertes) / 4   [actes, acteurs, données, outils]
  → répond à : « sait-on CE QUI se passe ici ? »

completude_fonctionnelle (nouvelle)
  = COUNT(facettes de travail couvertes) / 3   [décider, communiquer, coordonner]
  → répond à : « sait-on COMMENT le travail se fait ici ? »
```

**Le point critique de l'arbitrage.** Alter propose **18 facettes de travail**. Les intégrer toutes aurait créé un deuxième radar à 18 axes que personne ne lit. La décision : **n'en garder que 3** — décider, communiquer, coordonner. Ce sont les trois qui, absentes d'un thème actif, signalent un vrai trou. Les 15 autres sont du raffinement académique écarté pour Lugia V1.

**Règle associée (Famille B).**
```
Code:       R15 — Trou fonctionnel sur un thème actif
Condition:  thème actif (≥1 objet structurel) ET completude_fonctionnelle = 0
Sévérité:   vigilance
Type signal: trou_fonctionnel
```

**Détection des 3 facettes.**
```
"décider"      ← objet acteurs avec situation de type décision
                 OU objet actes avec lexique "choisir/arbitrer/valider"
"communiquer"  ← relation transmet_à OU objet données avec destinataire
"coordonner"   ← relation coordonne entre 2+ acteurs du thème
```

**Source théorique.** Facets of Work (Alter, 2021), Table 1. Un médecin verrait la différence : on lui poserait *de meilleures questions* sur les zones où le travail se fait sans mécanisme identifié.

---

## Ajout 3 — Workaround → −0.20 de stabilité → Famille C

**Ce que c'est.** Un effet de l'ajout 1 sur le cycle de vie des objets (N4). Quand R14 se déclenche sur un objet, sa stabilité chute de 0.20 — malus plus fort que la tension simple (−0.15).

**Pourquoi un malus plus fort.** Un contournement n'est pas une difficulté ponctuelle : c'est un désalignement *actif et répété* entre le système conçu et le travail réel. Il mérite donc un impact plus fort sur la trajectoire de l'objet.

```
À chaque session, mise à jour de la stabilité :
  mention positive        : +0.10
  mention avec tension     : -0.15
  workaround détecté (R14) : -0.20   ← v0.5

Transition automatique :
  actif → fragilisé si stabilité < 0.35 (SEUIL_FRAGILITE)
```

**Effet concret.** Un objet contourné à répétition bascule en `fragilisé`, ce qui le rend visible dans le suivi temporel comme un point qui se dégrade — alors qu'une simple présence structurelle l'aurait laissé en `actif`.

---

## Synthèse Partie 1

```
Ajout                              Famille    Nature
──────────────────────────────────────────────────────────────────
R14 Workaround détecté               B        Nouvelle règle N8
3 facettes de travail (R15)          B        Nouvelle règle N8
Complétude fonctionnelle             D        Nouvelle sous-dimension
Workaround → -0.20 stabilité         C        Nouvel effet cycle de vie

Famille A                            —        Inchangée
Pas de 5e famille                    —        Décision explicite
```

Trois ajouts réels, tous justifiables par « ça rend le diagnostic plus vrai ». Tout le reste reste socle théorique (Partie 2).

---

# PARTIE 2 — ROADMAP (socle théorique, non intégré au moteur)

Cette partie liste ce qui a été **délibérément écarté du moteur de règles**, avec la justification et les conditions d'une réintégration future. Ces éléments ne sont pas perdus : ils nourrissent le **prompt système de l'IA** (extracteur + coaching) et le **protocole d'interview**, sans alourdir le scoring.

## 2.1 — Les principes WST comme questions d'interview, pas comme règles

Sur les 24 principes WST, certains sont déjà couverts par nos règles structurelles (P01→R05, P12→R01, P14→R10, P22→R02…). Trois autres sont **trop générateurs de faux positifs** pour devenir des règles automatiques, mais excellents comme **questions de Phase 3 du protocole d'interview** :

```
P05 Encourage judgment      → "Qui décide quand il y a une exception ?"
P06 Control at source       → "Quand un problème arrive, on le corrige où —
                               à la source ou après coup ?"
P11 Align incentives        → "Est-ce que les intérêts de chacun sont alignés
                               avec ceux du cabinet ?"
```

**Condition de réintégration future comme règles** : disposer de données (Phase γ du cold start, 30+ organisations) montrant que ces questions produisent des réponses suffisamment structurées pour être détectées automatiquement avec un taux de faux positifs < 30%.

## 2.2 — Les 8 espaces de design : NON intégrés au catalogue d'actions N7

Tentant mais écarté. Les espaces de design DS2 (possibilités de changement), DS3 (caractéristiques de conception) et DS8 (dimensions produit/service) auraient transformé notre catalogue d'actions clair (7 chantiers concrets et lisibles) en taxonomie exhaustive.

**Justification.** Le médecin n'a pas besoin de « repositionner son produit/service sur l'axe production-vs-coproduction ». Il a besoin de « déléguer la cotation à sa secrétaire ». On garde des actions concrètes.

```
Espace de design       Statut          Raison
─────────────────────────────────────────────────────────────
DS1 (24 principes)     Partiel (B)     Voir 2.1 — 3 en questions interview
DS2 (changements)      Écarté          Alourdirait le catalogue N7
DS3 (caractéristiques) Nuance (C)      Voir 2.3 — informe SEUIL_ADOPTION
DS4 (sous-systèmes)    Écarté          Taxonomie académique
DS5 (risques)          Diffus (B)      Enrichit le contenu de R01-R13, pas de
                                       nouvelle règle
DS6 (interactions)     Diffus (B)      Enrichit R12-R13, pas de nouvelle règle
DS7 (encapsulation)    Écarté          Hors périmètre diagnostic
DS8 (produit/service)  Écarté          Trop abstrait pour le terrain
```

**Condition de réintégration future** : une version « experte » de Lugia destinée à des consultants en organisation (pas des médecins) pourrait exposer DS2/DS3/DS8 comme grille d'actions avancée. Hors périmètre V1.

## 2.3 — DS3 (caractéristiques de conception) : nuance sur la Famille C

DS3 apporte des variables de tendance utiles, mais **non intégrées comme mécanisme** — gardées comme principe d'interprétation pour calibrer les seuils en Phase γ :

```
"degré d'automatisation"  → un système qui s'automatise fait passer
                            les objets manuels en_transition
"résilience / agilité"    → un système peu résilient justifie un
                            SEUIL_ADOPTION plus bas pour ce contexte
```

**Condition de réintégration** : données de calibration Phase γ montrant une corrélation entre ces caractéristiques et la vitesse réelle d'adoption des objets.

## 2.4 — Les 15 facettes de travail restantes

Sur les 18 facettes de travail, 3 sont intégrées (Partie 1, ajout 2). Les 15 autres restent théoriques :

```
making decisions ✓   communicating ✓   coordinating ✓   ← intégrées
representing reality  applying knowledge  thinking         ← écartées
learning              planning            controlling exec ← écartées
improvising           processing info     performing phys  ← écartées
performing support    interacting socially providing svc   ← écartées
creating value        maintaining security                 ← écartées
```

**Note sur « maintaining security »** : tentante à intégrer (sécurité des données = enjeu médecine). Mais elle est déjà couverte structurellement par R10 (conformité RGPD/HDS sans couverture). L'ajouter en facette ferait doublon.

**Condition de réintégration** : aucune prévue. Ces facettes restent dans le prompt de l'IA comme grille d'analyse fine, jamais comme règles.

## 2.5 — Les axiomes WST non couverts

Sur les 24 axiomes, 8 sont couverts par nos règles, 8 partiellement, 8 absents. Les 8 absents restent **délibérément hors du moteur** :

```
A10 Maintenance          → qui maintient le système ? — capté en interview
A11 System of systems    → décomposition récursive — hors périmètre
A15 Trade-offs           → arbitrages implicites — trop abstrait à détecter
A17 Adaptability         → capacité de réponse — partiellement via workarounds
A20 Performance uncert.  → incertitude de performance — philosophique
A24 Absorptive capacity  → capacité d'absorption du changement — capté en
                           interview via le rythme de changement déclaré
```

A18 (agency) et A19 (compliance) sont eux **partiellement intégrés** via R14 workarounds — c'est leur manifestation concrète et détectable.

**Condition de réintégration** : aucune prévue pour A10/A11/A15/A20/A24. Ils valident l'architecture conceptuelle de Lugia mais ne deviennent pas des règles.

---

## 2.6 — Ce que le corpus Alter valide sans rien ajouter

Au-delà des éléments écartés, le corpus confirme que l'architecture Lugia est **structurellement saine**. À conserver comme caution théorique (utile pour pitch investisseurs, doc technique, recrutement) :

```
Notre extracteur IA       ≡ ISKG inversé (on construit la base depuis le cas)
Notre grille instanciée   ≡ SSKG (situation-specific knowledge graph)
Notre confiance/pruning   ≡ pruning DKG→SSKG d'Alter
Nos questions de relance  ≡ pertinence résiduelle d'Alter
Notre dynamique inter-sys ≡ niveau 2 du RAVC (systèmes intersectants)
Nos flux sortants R12/R13 ≡ niveau 6 du RAVC (services déclenchés)
Notre grille 10 axes       ≡ niveaux 3-5 du RAVC (système → processus → activités)
```

Lugia opère naturellement entre les niveaux 3 et 5 du framework RAVC d'Alter, avec des extensions vers le niveau 2 (inter-systèmes, v0.4) et le niveau 6 (flux sortants, v0.4).

---

## Distinction conceptuelle clé à retenir

```
SANTÉ STRUCTURELLE                    SANTÉ FONCTIONNELLE
(règles R01-R13, v0.1-v0.4)           (R14-R15, v0.5)
─────────────────────────────────────────────────────────────────
« Les éléments sont-ils là            « Le travail réel correspond-il
  et bien connectés ? »                 au système conçu ? »

Détectée par règles automatiques      Mieux captée par l'interview IA
sur la présence/absence d'objets      conversationnelle (lexique de
et de relations.                      tensions, workarounds, questions
                                      de Phase 3 ciblées).

Bien couverte par le questionnaire    Le questionnaire ne suffit pas —
structuré.                            nécessite la conversation.
```

C'est la réponse à la question initiale (« nos signaux constituent-ils une vérification complète de l'état de santé d'un système vu par WSF ? ») : **non, le questionnaire et les règles structurelles couvrent la santé structurelle ; la santé fonctionnelle nécessite l'interview IA**, dont la v0.5 enrichit la détection avec les workarounds et les trous fonctionnels.

---

## Récapitulatif pour transmission

**Ce qui change dans le produit (v0.5)** :
- 2 nouvelles règles N8 : R14 (workaround), R15 (trou fonctionnel)
- 2 nouveaux types de signaux : `workaround`, `trou_fonctionnel`
- 1 nouveau champ N3 : `completude_fonctionnelle`
- 1 nouvel effet N4 : workaround → stabilité −0.20 + transition vers fragilisé
- 3 nouvelles questions Phase 3 dans le protocole d'interview (P05, P06, P11)

**Ce qui ne change pas (volontairement)** :
- Famille A inchangée
- Pas de 5e famille
- Catalogue d'actions N7 inchangé (pas d'espaces de design)
- Radar inchangé (pas de 18 facettes)
- 7 chantiers concrets préservés

**Documents impactés** :
- `lugia_schema_spec.md` → v0.5 (fait)
- `lugia_interview_protocol.md` → à mettre à jour (questions Phase 3)
- `lugia_calibration_v1.md` → à mettre à jour (seuils R14/R15)
- versions génériques correspondantes → à répercuter
