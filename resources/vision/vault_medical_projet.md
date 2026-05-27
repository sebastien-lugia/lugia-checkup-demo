# Vault Médical — Descriptif de projet
> Document de contexte — Mai 2026

---

## Genèse et vision

Ce projet naît d'une problématique concrète : **comment aider les médecins à utiliser l'IA de façon conforme**, sans imposer de charge technique ou administrative supplémentaire ?

La réponse n'est pas un formulaire de conformité. C'est un outil qui **parle le langage du médecin**, modélise son cabinet comme il le vit, et construit en coulisses toute l'infrastructure de protection des données.

L'idée centrale : **un vault local et dynamique**, dont la structure est générée automatiquement à partir d'un schéma vivant du cabinet, lui-même construit par un dialogue guidé avec une IA — sans aucune action technique de la part du médecin.

---

## Le problème que ce projet résout

### Contexte réglementaire
- L'**AI Act européen (2024)** classe les outils d'IA médicale à haut risque : obligations de transparence, traçabilité, supervision humaine
- Le **RGPD** impose des règles strictes sur les données de santé (catégorie spéciale)
- Le **MDR** (Règlement dispositifs médicaux) exige un marquage CE pour certains logiciels d'IA diagnostique
- L'hébergement des données de santé doit être **certifié HDS** en France

### Le problème terrain
Les médecins utilisent déjà l'IA — souvent de façon informelle (ChatGPT, dictée automatique, outils de rédaction). Ils envoient des données patients sans le savoir, sans protection, sans traçabilité.

Les solutions existantes sont soit :
- **Trop complexes** (solutions enterprise SaaS hors de portée d'un cabinet)
- **Trop génériques** (non adaptées au contexte médical français)
- **Trop techniques** (requièrent une DSI ou un développeur)

### Ce que ce projet apporte
Un outil accessible à **tout médecin**, qui :
1. Modélise son cabinet en langage naturel
2. Génère automatiquement la protection des données adaptée
3. Permet l'usage de l'IA en toute conformité
4. Évolue avec lui sans jamais nécessiter d'action technique

---

## Concept clé : le Schéma Vivant

Le cœur du projet est un **schéma vivant du cabinet** — une représentation visuelle et dynamique des objets de données (Patient, Consultation, Ordonnance…) et de leurs relations.

Ce schéma est :
- **Descriptif au départ** : il modélise ce qui existe déjà dans d'autres systèmes
- **Progressivement opérationnel** : il devient lui-même la source de vérité du cabinet
- **Modifiable sans code** : le médecin ajuste, ajoute, retire des objets via l'interface
- **Vivant** : il se met à jour au fil des évolutions du cabinet

À partir de ce schéma, le vault se génère automatiquement.

---

## Le Vault Local

### Principe
Un **vault local** est une base de correspondance chiffrée qui fait le lien entre les vraies données et des tokens opaques. L'IA ne reçoit que des tokens — jamais les vraies données.

```
Vraie donnée          Vault local            IA
────────────         ─────────────          ────
"Jean Dupont"   →→   stocke + chiffre  →→   "PATIENT_a3f5"
"12/03/1965"    →→   génère token      →→   "DATE_b7e1"
"0612345678"    →→   table de corresp. →→   "TEL_c9d2"
                          ↕
                  Seul le vault connaît
                  la correspondance
```

### Pourquoi local ?
- Zéro donnée ne sort du cabinet
- Conformité HDS native si le serveur est certifié
- Aucune dépendance externe
- Coût maîtrisé (infrastructure existante)
- Auditabilité totale

### Structure des données du vault

Le vault contient plusieurs tables :

**`tokens`** — Table principale de correspondance
- `token_id` : identifiant opaque généré (ex: `PATIENT_a3f5c8d2`)
- `valeur_chiffree` : vraie valeur chiffrée en AES-256
- `valeur_hash` : hash de la valeur réelle (pour éviter les doublons sans déchiffrer)
- `type_entite` : catégorie (PATIENT, MEDECIN, DATE…)
- `sous_type` : précision (NOM, DATE_NAISSANCE, NUM_SECU…)
- `sensibilite` : niveau (CRITICAL, HIGH, MEDIUM, LOW)
- `version_cle` : pour la rotation des clés
- `date_creation`, `date_expiration`, `actif`

**`entites`** — Référentiel des types de données
- Définition des patterns de détection (regex, labels NLP)
- Règles de tokenisation par type
- Durées de rétention RGPD
- Rôle minimum requis pour détokeniser

**`contextes`** — Regroupement par dossier/consultation
- Permet de retrouver tous les tokens liés à un même patient
- Sans jamais déchiffrer les vraies données

**`access_log`** — Traçabilité complète (obligatoire CNIL)
- Qui, quand, quelle opération, quel token, quel motif
- Chaque tokenisation et détokenisation est enregistrée

**`roles_permissions`** — Gestion des droits
- Matrice : médecin traitant / secrétaire / proxy IA / auditeur
- Droits granulaires par type d'entité

**`cles_rotation`** — Cycle de vie des clés
- Les clés de chiffrement ne sont jamais stockées dans le vault
- Gestion de la rotation sans interruption de service

### Classification des champs

Chaque champ de chaque objet est automatiquement classifié :

| Niveau | Exemples | Comportement |
|---|---|---|
| Identifiant direct | Nom, NIR, email, téléphone | Tokenisation obligatoire |
| Identifiant indirect | Code postal, profession, date précise | Tokenisation recommandée |
| Donnée médicale sensible | Pathologie psy, VIH, addiction | Protection renforcée |
| Donnée médicale standard | Glycémie, tension, CIM-10 | Passe tel quel vers l'IA |
| Administratif | Nom du cabinet, FINESS | Selon contexte |
| Calculé | Âge (dérivé de la date de naissance) | Dérivé du vault |

---

## Le Dialogue Guidé — Onboarding sans action technique

### Philosophie
Le médecin ne crée rien from scratch. Il **reconnaît** son cabinet dans un schéma qui se dessine à mesure qu'il répond à des questions simples en langage naturel.

### Flux du dialogue
```
IA pose une question simple en langage naturel
              ↓
Médecin répond (options prédéfinies ou texte libre)
              ↓
Le schéma se dessine en temps réel sur la canvas
              ↓
L'IA confirme ce qu'elle a compris
              ↓
Médecin corrige si besoin
              ↓
Question suivante
```

### Structure du dialogue (thèmes)
1. **Structure du cabinet** — seul/groupe, type de structure, personnel
2. **Les patients** — réguliers/occasionnels, pathologies chroniques, ALD
3. **Les actes** — consultation physique, téléconsultation, actes techniques
4. **Les documents produits** — ordonnances, courriers, comptes-rendus
5. **Les flux externes** — laboratoires, spécialistes, hôpitaux
6. **Le numérique existant** — logiciel métier, outils IA déjà utilisés

### Ce qui se passe en coulisses à chaque réponse
- **Dessin** : un objet ou une relation apparaît sur la canvas
- **Classification** : les champs sont automatiquement typés par niveau de sensibilité
- **Construction du vault** : les tables de correspondance se génèrent en arrière-plan
- **Registre RGPD** : une ébauche se constitue automatiquement

### Bibliothèque de schémas types
Pour que le médecin arrive sur un schéma déjà reconnaissable, le système dispose de schémas pré-configurés par spécialité :

| Spécialité | Objets pré-configurés |
|---|---|
| Généraliste | Patient, Consultation, Ordonnance, Courrier, Spécialiste |
| Cardiologue | + ECG, Holter, Bilan lipidique, Écho compte-rendu |
| Pédiatre | + Courbe de croissance, Carnet vaccinal, Représentant légal |
| Psychiatre | + Séance, Note clinique (protection renforcée), Traitement |
| Cabinet de groupe | + Praticien, Planning, Transfert de dossier |

---

## Architecture technique cible

```
┌─────────────────────────────────────────────────────┐
│              INTERFACE MÉDECIN                       │
│   Dialogue IA    +    Canvas schéma vivant           │
│   (langage naturel)   (sans code)                    │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              MOTEUR DE SCHÉMA                        │
│   Objets  /  Champs  /  Relations  /  Règles métier  │
│   Génération automatique depuis le dialogue          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              VAULT LOCAL                             │
│   Généré dynamiquement depuis le schéma              │
│   PostgreSQL chiffré / SQLite (petites structures)   │
│   Clés dans HSM ou fichier séparé sécurisé           │
└────────────┬─────────────────────┬──────────────────┘
             │                     │
┌────────────▼──────┐   ┌──────────▼──────────────────┐
│  PROXY IA         │   │  MODULES COMPLÉMENTAIRES     │
│  Anonymise avant  │   │  - Registre RGPD auto        │
│  Détokenise après │   │  - Audit et traçabilité      │
│                   │   │  - Alertes de conformité     │
└────────────┬──────┘   │  - Export FHIR/HL7           │
             │          └─────────────────────────────┘
┌────────────▼──────┐
│  LLM              │
│  Local (Ollama)   │
│  ou Cloud         │
│  (selon niveau    │
│   de sensibilité) │
└───────────────────┘
```

---

## Roadmap en 3 phases

### Phase 1 — Décrire (0 à 3 mois)
**Objectif** : le médecin modélise son cabinet, le schéma se dessine

- Dialogue guidé de onboarding
- Canvas visuelle du schéma
- Classification automatique des champs
- Génération du vault statique
- Ébauche automatique du registre RGPD

**Risque** : faible — aucune donnée réelle traitée encore
**Valeur** : immédiate — le médecin comprend et valide son schéma de données

---

### Phase 2 — Connecter (3 à 9 mois)
**Objectif** : le schéma se branche sur les vrais systèmes

- Connecteurs vers logiciels métiers (DPI, Doctolib, Maiia…)
- Ingestion de vraies données tokenisées dans le vault
- Proxy IA opérationnel (tokenisation/détokenisation à la volée)
- Tableau de bord de conformité en temps réel
- Alertes si un flux dévie du schéma défini

**Risque** : moyen — intégration avec des systèmes existants
**Valeur** : forte — l'IA devient utilisable en conformité

---

### Phase 3 — Opérer (9 à 24 mois)
**Objectif** : le schéma devient la source de vérité du cabinet

- Le vault local remplace ou complète le DPI pour certains usages
- Requêtes analytiques sur données anonymisées
- Génération automatique de consentements patients
- Export interopérable (FHIR R4, HL7 v2)
- Multi-cabinet, cabinet de groupe
- Certification HDS de la solution

**Risque** : élevé — changement profond des habitudes de travail
**Valeur** : maximale — gouvernance complète des données du cabinet

---

## Ce que l'outil n'est pas

- Ce n'est **pas un DPI** (dossier patient informatisé) — il ne remplace pas Doctolib, Maiia ou les logiciels métiers existants, du moins pas en phase 1 et 2
- Ce n'est **pas une solution de cybersécurité** — il ne protège pas contre les intrusions sur le réseau
- Ce n'est **pas un outil de diagnostic IA** — il est l'infrastructure qui permet d'utiliser des outils de diagnostic IA en conformité
- Ce n'est **pas un formulaire de conformité RGPD** — c'est une couche opérationnelle qui produit la conformité comme sous-produit

---

## Différenciation clé

| Approche classique | Ce projet |
|---|---|
| Conformité = paperasse | Conformité = infrastructure automatique |
| Médecin doit comprendre le RGPD | Médecin décrit son cabinet en langage naturel |
| Solution imposée par la DSI | Solution adoptée par le médecin lui-même |
| Vault externe (SaaS, coûteux) | Vault local (données qui ne sortent jamais) |
| Structure figée | Schéma vivant, modifiable sans code |
| Anonymisation ponctuelle | Protection continue et traçable |

---

## Prototype existant (V0)

Un premier prototype HTML/JS a été développé illustrant :
- Le dialogue guidé question par question
- La canvas qui se dessine en temps réel à chaque réponse
- La classification visuelle des champs par niveau de sensibilité
- Les relations entre objets (génère, produit, adressé à, alimente…)
- La barre de progression du onboarding

**Limites identifiées du prototype :**
- Positionnement des nœuds à améliorer (chevauchements)
- Pas encore de clic sur les objets pour les modifier
- Pas encore d'ajout d'objets personnalisés
- Pas encore d'export vers la structure du vault

---

## Prochaines étapes prioritaires

1. **Revoir le layout de la canvas** — algorithme de positionnement automatique des nœuds sans chevauchement (force-directed graph ou layout hiérarchique)
2. **Rendre les nœuds interactifs** — clic pour modifier les champs, ajouter des propriétés, changer le niveau de sensibilité
3. **Dialogue d'ajout d'objets personnalisés** — le médecin dit "j'ai aussi des certificats médicaux" et l'objet se crée avec ses champs guidés
4. **Génération et export du vault** — depuis le schéma validé, produire la structure SQL et les règles de tokenisation
5. **Registre RGPD automatique** — généré depuis le schéma, exportable en PDF

---

## Notes de conception importantes

### Sur l'expérience utilisateur
- Le médecin ne doit **jamais voir de terminologie technique** (vault, token, AES, RGPD…)
- L'IA du dialogue doit être **rassurante et pédagogique**, pas intimidante
- Chaque action doit avoir un **retour visuel immédiat** sur la canvas
- Le médecin doit pouvoir **sortir et revenir** sans perdre son travail

### Sur la classification automatique
- La classification est une **suggestion**, toujours modifiable par le médecin
- Les champs ambigus doivent déclencher une **question de clarification**
- La classification doit s'améliorer avec le temps et les retours utilisateurs

### Sur la sécurité du vault
- La clé de chiffrement ne doit **jamais** être dans la même base que les tokens
- Le vault doit fonctionner sans connexion internet
- Une compromission du vault = perte de toutes les correspondances → sécurité maximale requise
- Plan de continuité obligatoire si le vault est indisponible

---

*Document généré dans le cadre d'une session de conception — Mai 2026*
*À destination d'une nouvelle fenêtre de contexte pour continuation du développement*
