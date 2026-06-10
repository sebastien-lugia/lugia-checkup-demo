# Lugia — Spécification du Dialogue IA Gratuit
**Version** 0.1  
**Projet** Lugia Checkup — Tier gratuit  
**Date** Juin 2026

---

> ⚠️ **Prod = 10 échanges** (acté 2026-06-09). Ce document décrit la cible à 20 échanges ; le prompt prod (`src/chat_assistant.py`) tourne en 10 tours, synthèse au 10e. Écarts détaillés dans `lugia_coherence_prompt_vs_spec_interview.md`.

## Contexte & objectif

Après le questionnaire (3 axes, 18 questions, profil rempli), l'utilisateur choisit **un chantier prioritaire** parmi ceux proposés sur la page résultats. Il accède alors à un **dialogue IA gratuit de 20 échanges maximum** centré sur ce chantier.

Ce dialogue n'est pas un chatbot d'information générale. C'est une **session de coaching organisationnel structurée**, dont chaque échange a un objectif précis dans la construction de la carte de capacité personnelle du médecin.

### Ce que le médecin doit vivre

À l'issue des 20 échanges, le médecin doit :
1. Avoir compris concrètement ce que Lugia peut lui apporter
2. Voir sa propre organisation se dessiner sur la carte de capacité
3. Avoir envie de continuer — parce que la carte est incomplète et qu'il commence à percevoir ce qu'il perd ou pourrait créer
4. Vouloir s'abonner pour aller plus loin

---

## 1. Architecture du dialogue — 4 phases

```
Phase 1 — Ancrage      (échanges 1-4)    Comprendre la situation réelle
Phase 2 — Exploration  (échanges 5-12)   Creuser le chantier, extraire les objets
Phase 3 — Révélation   (échanges 13-17)  Montrer ce qui se dessine, nommer les manques
Phase 4 — Projection   (échanges 18-20)  Valeur concrète, invitation à aller plus loin
```

La progression entre phases est **pilotée par le remplissage de la carte**, pas par un script rigide. L'IA passe à la phase suivante quand elle a suffisamment d'objets sur le chantier en cours.

---

## 2. Ce que l'IA reçoit au démarrage

Au lancement du dialogue, l'IA reçoit dans son contexte :

```json
{
  "profil": {
    "cabinet_type": "solo",
    "volume": "80_120",
    "territoire": "urbain",
    "secretariat": "interne",
    "logiciel_metier": ["Crossway"],
    "rdv_canal": ["Doctolib", "téléphone"],
    "status": "installe",
    "horizon": "renforcer_equipe",
    "motivation": ["charge"],
    "energy": "energy_b"
  },
  "scores": { "A": 42, "B": 28, "C": 55 },
  "niveaux": { "A": 1, "B": 0, "C": 2 },
  "signal_id": "parcours_ok_equipe_fragile",
  "chantier_choisi": "delegation",
  "objets_existants": [
    { "label": "Crossway", "facette": "outils", "axe": "outils_data_infra" },
    { "label": "Doctolib", "facette": "outils", "axe": "parcours_client" },
    { "label": "Secrétaire interne", "facette": "acteurs", "axe": "equipe_rh" }
  ],
  "echanges_restants": 20
}
```

---

## 3. Prompt système de l'IA

```
Tu es un conseiller organisationnel spécialisé en médecine libérale. Tu accompagnes 
un médecin généraliste dans une session de diagnostic et de coaching sur son 
organisation de cabinet.

CONTEXTE
- Cabinet : {cabinet_type}, {volume} actes/semaine, territoire {territoire}
- Scores questionnaire : Parcours patient {A}/100, Équipe {B}/100, Outils {C}/100
- Signal détecté : {signal_title}
- Chantier choisi : {chantier_label}
- Échanges restants : {echanges_restants}/20

MISSION
Tu as {echanges_restants} échanges pour :
1. Comprendre précisément la situation réelle du médecin sur ce chantier
2. L'aider à voir concrètement ce qu'il perd et ce qu'il pourrait créer
3. Construire avec lui les premiers éléments de sa cartographie organisationnelle
4. Le laisser avec l'envie d'aller plus loin

RÈGLES DE CONVERSATION
- Une seule question par échange, jamais deux
- Questions ouvertes qui invitent à décrire, pas à cocher
- Reformule ce que tu as compris toutes les 4-5 questions (validation active)
- Si le médecin mentionne un outil, une personne, un processus : note-le (ce sont des objets de sa cartographie)
- Adapte le ton selon l'énergie déclarée : {energy_tone}
- Ne mentionne jamais les termes "WSF", "axe", "facette", "objet" — ce sont des concepts internes

PILOTAGE DES PHASES
Phase 1 (échanges 1-4) : Comprendre la situation concrète aujourd'hui
  → Objectif : identifier les acteurs, outils et processus du chantier
  → Question type : "Décrivez-moi comment ça se passe aujourd'hui..."

Phase 2 (échanges 5-12) : Explorer en profondeur
  → Objectif : identifier les tensions, manques, dépendances
  → Question type : "Qu'est-ce qui vous pèse le plus dans..."
  → Montrer au fil des réponses ce qui s'accumule sur la carte

Phase 3 (échanges 13-17) : Révéler ce qui se dessine
  → Objectif : nommer les patterns, montrer la valeur manquante
  → Style : synthèse + une question qui ouvre une zone non encore explorée

Phase 4 (échanges 18-20) : Projeter et inviter
  → Objectif : ancrer la valeur concrète, ouvrir sur ce que la plateforme complète apporte
  → Style : "Voilà ce que vous avez commencé à construire... voici ce qu'on ne peut 
             pas encore voir avec les informations dont on dispose..."

EXTRACTION EN ARRIÈRE-PLAN
À chaque échange, extrais silencieusement les objets mentionnés et produis un JSON :
{
  "objets_detectes": [
    { "label": "...", "label_norme": "...", "facette": "...", "axe": "...", 
      "situations": [...], "extrait": "phrase source", "confiance": 0.0-1.0 }
  ],
  "relations_detectees": [
    { "source": "...", "cible": "...", "type": "...", "confiance": 0.0-1.0 }
  ],
  "zones_non_couvertes": ["axe ou domaine qui manque encore"],
  "question_suivante_priorite": "actes|acteurs|outils|contexte|strategie"
}

LIGNE ÉDITORIALE
- Bienveillant, jamais accusatoire
- Chiffrer quand possible (benchmarks du catalogue)
- Nommer ce qu'on voit sans dramatiser
- Valoriser ce qui fonctionne avant de pointer ce qui manque
- La session gratuite s'arrête à 20 échanges — rester honnête là-dessus
```

---

## 4. Phase 1 — Ancrage (échanges 1-4)

**Objectif** : comprendre la situation réelle aujourd'hui, au-delà des scores.

**Logique de démarrage** : l'IA ne repart pas de zéro. Elle part de ce qu'elle sait déjà (profil + questionnaire) et le dit explicitement — ça crée de la confiance et évite les répétitions frustrantes.

### Échange 1 — Ancrage sur le chantier

**Template d'ouverture** (adapté au chantier choisi) :

*Pour le chantier "delegation" :*
> D'après ce que vous m'avez dit, vous gérez un cabinet solo avec une secrétaire, environ 80 à 120 actes par semaine — et parmi ce que vous avez identifié comme priorité, c'est la délégation des tâches non médicales qui ressort. Pour qu'on parte du bon endroit : si vous deviez me décrire une journée type, à quoi ressemble votre temps entre la première et la dernière consultation ?

*Pour le chantier "urgences" :*
> Vous m'avez indiqué que les urgences du jour sont gérées au fil de l'eau, sans créneau dédié. Avant d'aller plus loin : quand un patient appelle pour quelque chose d'urgent, concrètement, qui décroche et que se passe-t-il dans les 10 premières minutes ?

*Pour le chantier "logiciel" :*
> Vous utilisez {logiciel} et vous avez dit maîtriser les fonctions de base. Pour que je comprenne ce que ça recouvre : est-ce que vous pouvez me décrire les 3 premières choses que vous faites dans votre logiciel en arrivant le matin ?

**→ Objets produits** : premiers acteurs (Médecin, Secrétaire) et processus quotidien.

### Échanges 2-4 — Cadrage précis

L'IA creuse trois dimensions selon le chantier :

```
Chantier "delegation"
  Échange 2 : Qui fait quoi aujourd'hui ? (acteurs + tâches)
  Échange 3 : Combien de temps ça prend ? (quantification)
  Échange 4 : Qu'est-ce qui vous échappe ou vous pèse le plus ? (tension)

Chantier "urgences"
  Échange 2 : Combien de fois par semaine une urgence arrive ? (volume)
  Échange 3 : Qu'est-ce qui se passe quand vous êtes en consultation ? (interruption)
  Échange 4 : Qu'est-ce que ça coûte aujourd'hui de ne pas avoir de système ? (prise de conscience)

Chantier "chroniques"
  Échange 2 : Combien de patients chroniques suivez-vous ? (périmètre)
  Échange 3 : Comment savez-vous qu'un patient n'est pas revenu ? (détection)
  Échange 4 : Qu'est-ce qui se passe quand vous en identifiez un ? (processus actuel)

Chantier "comm"
  Échange 2 : Comment l'information circule entre vous et votre secrétaire ? (canal actuel)
  Échange 3 : Donnez-moi un exemple récent d'information qui n'a pas bien circulé (incident)
  Échange 4 : Qu'est-ce que ça vous coûte quand ça ne passe pas bien ? (impact)

Chantier "logiciel"
  Échange 2 : Combien de temps passez-vous à rédiger des courriers ou ordonnances ? (volume)
  Échange 3 : Avez-vous des modèles ou des raccourcis ? (niveau actuel)
  Échange 4 : Qu'est-ce qui vous prendrait le plus de temps à automatiser si vous saviez comment ? (priorité)

Chantier "admin"
  Échange 2 : À quelle heure finissez-vous généralement l'administratif le soir ? (charge)
  Échange 3 : Quelles tâches admin restent après 18h ? (contenu)
  Échange 4 : Qu'est-ce qui est délégué et qu'est-ce qui reste sur vous ? (répartition actuelle)

Chantier "pilotage"
  Échange 2 : Est-ce que vous regardez des chiffres sur votre activité ? (niveau actuel)
  Échange 3 : Si vous deviez citer une décision que vous avez prise sans avoir les données pour l'appuyer... (tension)
  Échange 4 : Qu'est-ce que vous aimeriez pouvoir mesurer que vous ne mesurez pas ? (désir)
```

---

## 5. Phase 2 — Exploration (échanges 5-12)

**Objectif** : creuser les dépendances, tensions, acteurs impliqués. Accumuler les objets de la carte.

**Logique** : l'IA alterne entre deux modes —
- **Creuser** un fil ouvert (si la réponse précédente contient un élément intéressant)
- **Ouvrir** une zone non encore couverte (si l'extracteur signale un manque)

### Reformulation intermédiaire (échange 6 ou 7)

L'IA fait un point sur ce qu'elle a compris — ça valide l'extraction et crée de la confiance :

> Laissez-moi vous dire ce que j'ai compris jusqu'ici pour vérifier que je ne me trompe pas. Vous avez {acteur1} qui gère {tâche1} et {acteur2} qui fait {tâche2}. Ce qui vous pèse le plus c'est {tension principale}. Est-ce que c'est ça, ou j'ai raté quelque chose ?

### Questions types par chantier (échanges 5-12)

```
Délégation
  5  : Votre secrétaire — sur quoi est-elle vraiment autonome aujourd'hui ?
  6  : [reformulation] Est-ce que c'est ça ?
  7  : Est-ce qu'il y a des tâches qu'elle pourrait faire mais que vous gardez par habitude ou par sécurité ?
  8  : Quand vous avez délégué quelque chose par le passé, comment ça s'est passé ?
  9  : Y a-t-il des tâches que personne ne fait vraiment — qui tombent entre les mailles ?
  10 : Si vous gagniez 45 minutes par jour, qu'est-ce que vous en feriez en premier ?
  11 : Avez-vous entendu parler du dispositif assistant médical ? (contextuel selon profil)
  12 : Qu'est-ce qui vous a empêché jusqu'ici de déléguer davantage ?

Urgences du jour
  5  : Ces urgences — qui décide si c'est vraiment urgent ou pas ?
  6  : [reformulation]
  7  : Est-ce qu'il y a des motifs qui reviennent régulièrement comme "urgents" et qui pourraient être triés avant ?
  8  : Quand vous êtes interrompu en consultation pour une urgence, que se passe-t-il pour le patient que vous étiez en train de voir ?
  9  : Avez-vous déjà essayé de bloquer des créneaux dédiés ?
  10 : Qu'est-ce qui vous a arrêté ?
  11 : Si votre secrétaire avait 3 critères pour trier seule, quels seraient-ils selon vous ?
  12 : À votre rythme actuel, combien de consultations par semaine sont des urgences qui ont été gérées à l'arrache ?

Patients chroniques
  5  : Ces patients silencieux — avez-vous une idée de leur nombre ?
  6  : [reformulation]
  7  : Quand vous retrouvez un chronique après 18 mois d'absence, que se passe-t-il en consultation ?
  8  : Est-ce que votre logiciel peut extraire la liste des patients avec un code ALD ?
  9  : Avez-vous déjà fait une relance groupée ? Par SMS, courrier ?
  10 : Qu'est-ce qui vous a empêché de mettre ça en place ?
  11 : Si vous saviez exactement combien de patients chroniques n'ont pas eu de consultation dans l'année, vous feriez quoi en premier ?
  12 : Y a-t-il une pathologie pour laquelle le suivi vous préoccupe particulièrement ?
```

### Ce que l'extracteur doit produire en Phase 2

Après chaque échange, l'extracteur enrichit la carte avec :

```
Acteurs identifiés :
  Médecin (principal sur ce chantier)
  Secrétaire (rôle, périmètre, charge)
  Éventuels : patient, CPAM, laboratoire, spécialiste

Actes identifiés :
  Tâches non médicales citées (cotation, courriers, résultats…)
  Processus actuels (comment ça se passe maintenant)
  Processus manquants (ce qu'il n'y a pas)

Outils identifiés :
  Outils utilisés (déjà en profil ou nouveaux)
  Outils manquants ou sous-utilisés

Relations identifiées :
  Médecin → délègue → Secrétaire (si mentionné)
  Secrétaire → utilise → Doctolib
  Tâche X → bloque → Tâche Y (si dépendance détectée)

Signaux potentiels :
  "je garde ça par habitude" → signal: dépendance_unique (médecin)
  "ça tombe entre les mailles" → signal: absence (processus manquant)
  "j'ai essayé mais..." → signal: fragilité (tentative échouée)
```

---

## 6. Phase 3 — Révélation (échanges 13-17)

**Objectif** : montrer ce qui s'est construit, nommer les patterns, révéler la valeur manquante.

C'est la phase la plus importante pour la conversion. Le médecin commence à **voir sa propre organisation** se dessiner — et il voit ce qui manque.

### Échange 13 — Synthèse révélatrice

L'IA fait une synthèse structurée de ce qu'elle a construit, **sans jargon**, mais en montrant la profondeur de l'analyse :

> Voilà ce que je vois de votre organisation sur ce chantier, d'après ce que vous m'avez dit.
>
> **Ce qui existe** : [acteurs identifiés avec leurs rôles] [outils utilisés] [processus en place]
>
> **Ce qui repose sur vous seul** : [liste des tâches sans délégation ou sans outil]
>
> **Ce qui n'a pas de système** : [liste des processus informels ou absents]
>
> Est-ce que ça correspond à ce que vous vivez ?

### Échanges 14-15 — Quantification

L'IA introduit les benchmarks du catalogue pour contextualiser :

> Les cabinets qui ont formalisé la délégation sur deux ou trois tâches récupèrent en moyenne 45 minutes par jour. À votre volume, ça représente environ 3 à 4 consultations supplémentaires par semaine — ou autant de temps personnel si c'est ce que vous cherchez.
>
> Dans votre cas, si on regarde ce que vous avez décrit sur [tâche X] et [tâche Y], la marge est probablement plus proche de [estimation personnalisée]. Est-ce que ce chiffre vous parle ?

### Échanges 16-17 — Les zones d'ombre

L'IA montre ce qu'elle ne peut **pas encore voir** — et pourquoi c'est important :

> Il y a une chose que je ne vois pas encore bien. Vous m'avez parlé de [acteur ou processus] — mais je n'ai pas de vision claire sur [zone manquante : Finance, Conformité, Stratégie…]. Par exemple : est-ce que vous savez ce que vous coûte, en euros, le temps que vous passez sur ces tâches administratives chaque mois ?

> Et côté outils — vous utilisez Crossway et Doctolib, mais je ne sais pas encore comment vos données sont hébergées, qui gère votre infrastructure numérique, si votre conformité RGPD est à jour. Ce sont des zones qui influencent directement la solidité de ce qu'on construit sur le chantier {chantier}.

---

## 7. Phase 4 — Projection (échanges 18-20)

**Objectif** : ancrer la valeur, révéler ce qui reste à construire, inviter à continuer.

### Échange 18 — Ce que vous avez commencé à construire

L'IA présente la carte partielle de façon visuelle (texte formaté) :

> Voilà ce qu'on a commencé à construire ensemble sur votre chantier [chantier].
>
> 🗺 Votre carte partielle :
>
> PARCOURS PATIENT
>   ✓ Prise de RDV → Doctolib (patients + secrétaire)
>   ⚠ Urgences du jour → pas de créneau dédié, tri informel
>   ○ Suivi inter-consultation → non exploré
>
> ÉQUIPE & RH
>   ✓ Secrétaire → accueil, facturation, agenda
>   ⚠ Délégation → tâches identifiées mais pas formalisées
>   ○ Continuité en cas d'absence → non exploré
>
> OUTILS & DONNÉES
>   ✓ Crossway → dossier, ordonnances, facturation
>   ⚠ Dossiers patients → structure non systématique
>   ○ Conformité HDS / RGPD → non exploré
>
> (✓ = identifié et évalué  ⚠ = identifié, zone de risque  ○ = pas encore exploré)
>
> Ce qu'on voit déjà est utile. Mais la carte a encore 6 zones vides — et certaines d'entre elles influencent directement le chantier que vous avez choisi.

### Échange 19 — La valeur concrète calculée

L'IA personnalise le gain avec les données du profil :

> Sur ce chantier spécifiquement — délégation — voilà ce que ça pourrait représenter pour vous.
>
> En formalisant la délégation de [tâche X] et [tâche Y] que vous m'avez décrites :
> → Temps libéré estimé : 30 à 45 min/jour
> → À votre volume et vos honoraires, ça représente environ 8 000 à 12 000 € de valeur par an — soit en consultations supplémentaires, soit en temps personnel récupéré.
>
> Ce calcul repose sur des hypothèses que je ne peux pas affiner sans en savoir plus sur votre finance et votre stratégie. C'est exactement ce que la carte complète permet de faire.

### Échange 20 — L'invitation

> On a atteint la limite de cette session gratuite — 20 échanges, c'est ce qu'on peut faire ensemble dans ce format.
>
> Voilà ce qu'on a construit :
> - [N] objets de votre organisation identifiés
> - [M] zones de risque détectées
> - 1 chantier avec une estimation de valeur personnalisée
>
> Ce qui reste à explorer pour avoir une image complète :
> - Vos 7 autres axes organisationnels (Finance, Conformité, Stratégie, Cœur de métier…)
> - Les relations entre vos outils, acteurs et processus — certaines dépendances que vous n'avez peut-être pas encore identifiées
> - Un suivi dans le temps — la carte évolue avec votre cabinet
>
> La plateforme Lugia continue là où cette session s'arrête : interview complète, carte vivante, actions suivies, alertes personnalisées.
>
> [Bouton : Continuer avec Lugia →]

---

## 8. Ce que la session produit techniquement

### Données versées dans la grille

```
Niveau 0 — Organisation
  Déjà rempli par le profil (inchangé)

Niveau 4 — Objets ajoutés
  Chaque acteur, outil, processus mentionné → objet WSF typé
  Source: "dialogue_ia" | confiance: variable (0.6-0.95)
  Extrait_source: phrase exacte du médecin

Niveau 5 — Relations ajoutées
  Relations détectées entre objets du dialogue
  Ex: Secrétaire → utilise → Doctolib | Médecin → dépend_de → LGC

Niveau 6 — Signaux enrichis
  Les signaux du questionnaire sont enrichis avec les détails du dialogue
  Ex: signal "dépendance_unique" sur Médecin — maintenant avec 3 tâches nommées

Niveau 7 — Actions générées
  Les actions du catalogue sont personnalisées avec les éléments du dialogue
  Ex: "Déléguer les appels de résultats simples" (mentionné au tour 7)
      "Former la secrétaire au tri avec 3 critères" (définis au tour 11)
```

### Ce qui s'affiche pendant le dialogue

L'interface montre en parallèle de la conversation :

**La carte de capacité partielle** — en temps réel, les domaines s'allument au fur et à mesure :
- Grisé = domaine non encore exploré
- Coloré pâle = domaine mentionné, peu de détails
- Coloré plein = domaine bien couvert

**Le compteur d'objets** — "X éléments identifiés dans votre organisation"

**Les zones de risque** — icônes qui apparaissent sur la carte quand un signal est détecté

**Le compteur d'échanges restants** — discret mais visible, pour créer une légère pression de temps qui pousse à aller à l'essentiel

---

## 9. Règles de conversion

**Ce qui doit être visible mais pas obtenu gratuitement :**

- La carte complète (les 10 axes) — on en voit 3, les autres sont grisés
- Le schéma relationnel complet (les relations sont esquissées, pas toutes tracées)
- Le suivi dans le temps (la session est ponctuelle, pas persistante)
- Les chantiers supplémentaires (1 seul en gratuit)
- Le calcul de gain financier précis (estimation dans le gratuit, personnalisation dans le payant)

**Ce qu'on ne doit jamais faire :**

- Couper brutalement à l'échange 20 sans transition
- Promettre ce qu'on ne peut pas tenir
- Être vague sur ce que la version payante apporte de plus
- Promettre une carte complète dans la session gratuite (elle reste partielle par construction)

**La proposition de valeur à l'échange 20 doit être :**

```
Spécifique    → "X objets identifiés, Y zones de risque"
Honnête       → "voilà ce qu'on ne peut pas voir sans aller plus loin"
Non pressante → l'envie doit venir de lui, pas d'une urgence créée artificiellement
Mémorable     → une phrase sur ce que sa carte incomplète lui coûte aujourd'hui
```

---

## 10. Variantes par chantier — ton et focus

| Chantier | Tension principale | Question d'ancrage | Benchmark clé |
|---|---|---|---|
| `delegation` | Temps médical perdu sur non-médical | "À quoi ressemble votre temps hors consultation ?" | 45 min/j libérées |
| `urgences` | Interruptions + flux chaotique | "Qui décide si c'est vraiment urgent ?" | −60-70% interruptions |
| `chroniques` | Patients silencieux = risque qualité | "Combien de chroniques n'ont pas consulté depuis 12 mois ?" | 70% récupérés en 3 mois |
| `comm` | Information qui ne circule pas | "Donnez-moi un exemple récent d'information ratée" | −40% malentendus |
| `logiciel` | Potentiel inexploité | "3 choses que vous faites en arrivant dans votre logiciel ?" | 25-40 min/j gagnées |
| `admin` | Débordement hors heures | "À quelle heure finissez-vous l'administratif le soir ?" | 1h/j libérable |
| `pilotage` | Décisions sans données | "Une décision prise récemment sans pouvoir l'appuyer ?" | 3 indicateurs suffisent |

---

## 11. Décisions d'architecture — arbitrées le 03/06/2026

---

**Q1 — Affichage de la carte**
✅ **Deux objets distincts, affichés différemment :**

- **Carte de capacité** (capability map — les domaines et thèmes) → s'allume **au fur et à mesure**, en temps réel à chaque échange. Les domaines passent de grisé à coloré progressivement. C'est la construction visible, l'effet "la carte se dessine en parlant".
- **Carte de fonctionnement** (schéma relationnel — objets, relations, signaux) → révélation **à la toute fin**, échange 20. Un seul moment de révélation fort, après que tout a été accumulé. Le médecin voit d'un coup le graphe de son organisation.

```
Échanges 1-19  : Capability map s'allume progressivement (sidebar ou overlay)
Échange 20     : Révélation du schéma relationnel complet (vue dédiée)
Après l'échange 20 : Les deux vues restent accessibles, partiellement grisées
                     pour ce qui n'a pas été exploré → invitation à continuer
```

---

**Q2 — Compteur d'échanges restants**
✅ **Discret au début, proéminent à partir de l'échange 15**

```
Échanges 1-14  : Compteur visible mais petit, couleur neutre
                 "— / 20 échanges"
Échanges 15-19 : Compteur plus visible, couleur ambre
                 "5 échanges restants"
Échange 20     : Compteur en évidence, formulation différente
                 "Dernier échange — construisons la conclusion"
```

L'objectif n'est pas de stresser mais de signaler que la fin approche, pour que le médecin donne les informations les plus importantes s'il ne l'a pas encore fait.

---

**Q3 — Périmètre de la session gratuite**
✅ **Un seul chantier, rejouable à l'infini, avec accumulation progressive**

- Le médecin choisit un chantier — il ne peut pas en changer (le choix est ancré dans son profil)
- Il peut relancer une session sur ce même chantier autant de fois qu'il veut
- **Chaque session accumule** : les objets de la session précédente sont chargés en contexte, l'IA repart de ce qu'elle sait déjà et va plus loin
- Résultat : la carte s'enrichit à chaque passage, sans jamais repartir de zéro
- Les autres chantiers restent visibles sur la page résultats mais **grisés** avec un label "Disponible avec Lugia complet"

```
Session 1 (20 échanges)  : objets de base du chantier
Session 2 (20 échanges)  : repart des objets session 1, creuse plus loin
Session 3+               : idem — diminishing returns naturel qui pousse vers l'abonnement
```

L'accumulation est le moteur de conversion le plus puissant : à chaque session, la carte est un peu plus riche, les zones vides sont un peu plus frustrantes, la valeur de l'abonnement est un peu plus évidente.

---

**Q4 — Persistance à l'abonnement**
✅ **Persistance totale — la carte gratuite devient le socle de la carte payante**

- Tous les objets extraits (quelle que soit leur confiance) sont conservés et transférés
- Les relations sont conservées
- Les signaux détectés sont conservés
- La session gratuite n'est pas un échantillon jetable — c'est la **fondation**

```
À l'abonnement, le médecin arrive sur sa carte avec :
  ✓ Son profil (questionnaire)
  ✓ Ses objets du chantier gratuit (1 à 3 sessions)
  ✓ Ses signaux et zones de risque identifiés
  ✗ Les 6 axes non couverts → à explorer avec l'interview complet
  ✗ Les relations profondes → à compléter
  ✗ Les actions suivies → à activer
```

Message à l'abonnement : *"Votre carte est déjà là. On continue là où on s'est arrêtés."*

---

## Synthèse des décisions

| # | Question | Décision | Date |
|---|---|---|---|
| Q1 | Affichage carte | Capability map temps réel + schéma relationnel révélation finale | 03/06/2026 |
| Q2 | Compteur échanges | Discret → proéminent à partir de l'échange 15 | 03/06/2026 |
| Q3 | Périmètre gratuit | 1 chantier, rejouable à l'infini, accumulation progressive | 03/06/2026 |
| Q4 | Persistance abonnement | Persistance totale — la carte gratuite devient le socle | 03/06/2026 |

---

*Fin du document — Version 0.2 — Toutes les décisions arbitrées*  
*À lire en complément de `lugia_interview_protocol.md` et `lugia_schema_spec.md`*
