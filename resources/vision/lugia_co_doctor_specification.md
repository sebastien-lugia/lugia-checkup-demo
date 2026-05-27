# Lugia & Co Doctor — Spécification de projet
> Document de référence — Mai 2026

---

## Vision

> **Lugia & Co Doctor est le premier outil de gouvernance des données médicales pensé pour le médecin, pas pour son informaticien.**

Un diagnostic organisationnel gratuit — là où le conseil facture — qui modélise le cabinet du médecin en langage naturel, identifie ses risques, et l'accompagne chantier par chantier vers une pratique de l'IA conforme, souveraine et sereine.

---

## 1. Enjeux

### Réglementaires

- **AI Act (août 2026)** : les outils d'IA médicale sont classés à haut risque. Obligations de transparence, traçabilité, supervision humaine et information du patient deviennent opposables.
- **RGPD** : le registre des traitements est obligatoire depuis 2018. Moins de 15% des cabinets libéraux en ont un à jour. Les données de santé sont une catégorie spéciale — exposition maximale en cas de contrôle.
- **MDR** : certains logiciels d'IA diagnostique sont des dispositifs médicaux — marquage CE requis.
- **HDS** : tout hébergement de données de santé doit être certifié Hébergeur de Données de Santé.

### Terrain

- Un médecin sur deux utilise déjà l'IA de façon informelle (ChatGPT, dictée, Doctolib IA) — souvent sans protection des données.
- Les outils existants (Privacera, Protegrity, Skyflow) ciblent les DSI hospitalières — hors de portée du cabinet libéral en coût et en complexité.
- Doctolib intègre de l'IA pour la génération de documents mais reste un silo : il protège ses propres données, pas les flux extérieurs. Son modèle économique repose sur la valorisation des données — conflit d'intérêts structurel.
- Aucune solution ne part du médecin pour construire la conformité. Toutes font l'inverse : imposer une structure technique et demander au médecin de s'y adapter.

### Marché

- **100 000 médecins libéraux** en France, dont 55 000 généralistes
- **700 000 autres professionnels de santé libéraux** adressables avec la même approche
- Marché mondial des logiciels de conformité santé : **2,94 Mds$ en 2025 → 9,18 Mds$ en 2033** (TCAC 13,5%)
- Fenêtre d'opportunité : **18 à 24 mois** avant que les acteurs existants ne bougent sur ce créneau

---

## 2. Objectifs

### Objectif central

Permettre à tout médecin libéral de comprendre, modéliser et gouverner les données de son cabinet — sans aucune compétence technique — et d'utiliser l'IA en toute conformité dès le premier jour.

### Objectifs opérationnels

**Court terme (0–6 mois)**
- Valider la proposition de valeur avec 5 cabinets pilotes
- Prouver que le diagnostic gratuit crée une adoption spontanée
- Générer les premiers documents conformes (registre RGPD, notice patient)
- Mesurer le taux de conversion diagnostic → chantier

**Moyen terme (6–18 mois)**
- Atteindre 2 500 médecins actifs
- Activer le premier canal institutionnel (URPS ou assureur RCP)
- Lancer le vault cloud HDS opérationnel
- ARR cible : 4,5 M€

**Long terme (18–48 mois)**
- 15 000 à 35 000 médecins actifs
- Accords assureurs RCP signés
- Extension aux autres professionnels de santé libéraux
- ARR cible : 20 à 60 M€

---

## 3. Bénéfices et chantiers

### Ce que le médecin gagne

| Bénéfice | Mesure concrète | Délai |
|---|---|---|
| Rédaction 3× plus rapide | ½ journée récupérée / semaine | Mois 1 |
| Registre RGPD automatique | 2 à 5 jours économisés | Jour 1 |
| Réponse à un contrôle CNIL | Moins de 5 minutes | Immédiat |
| Usage de l'IA sans risque | Zéro donnée qui sort | Immédiat |
| Vision claire de ses données | Schéma complet du cabinet | Semaine 1 |
| Gestion des accès tiers | Révocation en 1 clic | Mois 1 |
| Information patient conforme | Notice personnalisée auto | Semaine 1 |
| Transmission cabinet sécurisée | Procédure guidée et tracée | Long terme |

### Les chantiers — portes d'entrée et livrables

Chaque chantier est un livrable concret, actionnable, généré par le LLM à partir des réponses du diagnostic.

#### Chantier P0 — Registre des traitements RGPD
- **Pourquoi urgent** : obligation légale depuis 2018, premier document demandé en contrôle CNIL
- **Ce que produit le LLM** : registre complet, exportable PDF, adapté au cabinet spécifique
- **Temps avec l'assistant** : 20 minutes
- **Valeur équivalente cabinet conseil** : 1 500 à 3 000 €

#### Chantier P0 — Sécuriser l'usage de l'IA
- **Pourquoi urgent** : chaque usage de ChatGPT avec des données patients est une violation RGPD potentielle
- **Ce que produit le LLM** : protocole de protection adapté, vault cloud activé, proxy IA configuré
- **Temps avec l'assistant** : 30 minutes
- **Valeur équivalente** : risque d'amende jusqu'à 20 000 €

#### Chantier P1 — Cartographie et sécurisation des accès
- **Ce que produit le LLM** : matrice des droits par rôle, procédure d'onboarding remplaçant, politique d'accès
- **Temps avec l'assistant** : 15 minutes

#### Chantier P1 — Notice d'information patient IA
- **Pourquoi prioritaire** : obligation AI Act dès août 2026
- **Ce que produit le LLM** : notice personnalisée aux outils réels du cabinet, formats affichage + remise + web
- **Temps avec l'assistant** : 10 minutes

#### Chantier P2 — Rédaction assistée sécurisée
- **Ce que produit le LLM** : courriers, comptes-rendus, synthèses de dossier générés via proxy IA sécurisé
- **Impact quotidien** : ½ journée récupérée par semaine

#### Chantier P2 — Tableau de bord conformité
- **Ce que produit le LLM** : état de conformité en temps réel, alertes proactives, rapport mensuel

#### Chantier P3 — Reporting d'activité anonymisé
- **Ce que produit le LLM** : statistiques cabinet sur données anonymisées, utilisables pour la certification périodique (DPC)

#### Chantier P3 — Transmission sécurisée du cabinet
- **Ce que produit le LLM** : inventaire des données, procédure de transfert conforme, journalisation

---

## 4. Approche produit

### Le principe fondateur

**Le diagnostic d'abord. L'outil ensuite.**

Le médecin ne s'inscrit pas à un SaaS. Il commence par un **diagnostic organisationnel gratuit** — 20 questions, 15 minutes — là où un cabinet de conseil facturerait 3 000 à 10 000 €.

À la fin du questionnaire, il reçoit :
1. La carte de son organisation — son schéma vivant, jamais vu sous cette forme
2. Son score de maturité — lecture narrative, pas un pourcentage anxiogène
3. Ses risques identifiés — avec leur niveau de gravité réel
4. Ses chantiers recommandés — par ordre de priorité, actionnables immédiatement

### Le questionnaire — rassurant et familier

Le questionnaire n'est pas une conversation avec une IA. C'est un formulaire structuré — comme un bilan de santé du cabinet. Aucune IA visible, aucun chat, aucun inconnu. Des questions claires, des réponses à cocher.

Les alertes de risque apparaissent en temps réel sur certaines réponses — sans jugement, juste de l'information.

### Le LLM — activé au bon moment

Le LLM n'entre en scène que quand le médecin appuie sur **"Je me lance"** sur un chantier. Il arrive alors avec tout le contexte du questionnaire déjà digéré :

- Il ne repose jamais une question déjà répondue
- Il produit un premier livrable concret en quelques échanges
- Il guide vers le résultat, pas vers une conversation ouverte
- Il s'appuie sur le schéma vivant construit par le diagnostic

### Le schéma vivant — sous-produit du diagnostic

Le questionnaire produit, en coulisses, la modélisation complète du cabinet :
- Les **objets de données** (Patient, Consultation, Ordonnance, Personnel…)
- Les **relations** entre ces objets
- La **classification** de chaque champ par niveau de sensibilité
- Les **flux** de données entre les outils

Ce schéma est le cœur de Lugia & Co Doctor — il rend le vault dynamique, les chantiers contextuels, et la conformité personnalisée.

### Ce que le médecin ne doit jamais voir

| Invisible | Pourquoi |
|---|---|
| Le mot "vault" | Trop technique |
| La tokenisation | Idem |
| Les appels API | Idem |
| Les logs d'accès en page principale | Anxiogène |
| Des pourcentages de conformité | "82% conforme" inquiète plus qu'il ne rassure |
| Des options de configuration avancée | Paralyse la décision |

---

## 5. Architecture technique

### Vue d'ensemble

```
QUESTIONNAIRE (statique, sans IA visible)
          ↓
MOTEUR DE SCHÉMA (modélisation automatique)
          ↓
RESTITUTION (diagnostic + chantiers recommandés)
          ↓
CHANTIER LLM (contexte pré-chargé, livrable concret)
          ↓
VAULT CLOUD HDS (protection active des données)
          ↓
PROXY IA (tokenisation/détokenisation transparente)
```

### Le vault — deux temps

**Temps 1 — Vault cloud souverain (jour 1, zéro friction)**
Hébergé par Lugia & Co sur infrastructure HDS certifiée. Chiffré avec la clé du médecin — Lugia & Co ne peut pas lire ses données. Zéro installation, valeur immédiate.

**Temps 2 — Migration vault local (optionnelle, phase Pro)**
Pour les structures qui veulent la souveraineté physique totale. Option avancée, pas le point d'entrée.

### Stack cible
- Frontend : React, déployé sur CDN
- LLM : API Anthropic (Claude) avec contexte structuré depuis le questionnaire
- Vault : PostgreSQL chiffré AES-256, hébergement HDS certifié
- Export documents : génération PDF serveur
- Auth : passwordless (lien magique) — aucun mot de passe à gérer

---

## 6. Stratégie commerciale

### Modèle de facturation

#### Diagnostic — Gratuit et permanent
Le diagnostic organisationnel complet, toujours gratuit. C'est l'acte de générosité qui crée la confiance. La valeur rendue visible : "Ce diagnostic aurait coûté 4 200 € chez un cabinet conseil spécialisé."

#### Starter — 49 €/mois
*Entrée sans risque — valeur immédiate*
- Accès à 2 chantiers par mois
- Registre RGPD automatique
- Notice patient IA
- Logs et audit trail de base

> Un médecin généraliste facture 26,50 € la consultation. Ce socle est rentabilisé par 2 consultations par mois.

#### Pro — 149 €/mois
*Là où se crée la dépendance réelle*
- Chantiers illimités
- Vault cloud HDS opérationnel
- Proxy IA — rédaction sécurisée illimitée
- Gestion fine des accès tiers
- Tableau de bord conformité
- Support prioritaire (humain, < 2 min)

> La rédaction de courriers ne doit jamais être à l'usage. Illimité et invisible = dépendance réelle.

#### Institution — Sur devis
*Maisons de santé, cabinets de groupe, cliniques*
- Multi-praticiens et multi-sites
- Connecteurs DPI sur mesure
- Certification HDS native
- Accompagnement dédié

### Les canaux de distribution

| Canal | Modèle | Horizon | Potentiel |
|---|---|---|---|
| B2C direct | 49–149 €/mois/médecin | Phase 1 | Marge maximale |
| MSP / Cabinets de groupe | 300–800 €/mois | Phase 2 | Ticket élevé |
| Assureurs RCP (MACSF, Médicis…) | 5–15 €/médecin/mois en volume | Phase 2-3 | ×10 000 clients d'un coup |
| URPS / Ordres professionnels | Accord-cadre régional | Phase 2-3 | Légitimité institutionnelle |
| Éditeurs logiciels médicaux (OEM) | Royalties | Phase 3 | Distribution massive |

> **La règle d'or :** le B2C finance le produit. Le B2B2C finance la croissance. L'OEM finance l'échelle.

### Différenciation vs Doctolib

Doctolib fait de la **productivité à l'intérieur de Doctolib**.
Lugia & Co Doctor fait de la **gouvernance de toutes les données du cabinet** — y compris Doctolib.

| Critère | Lugia & Co Doctor | Doctolib Pro | Solutions SaaS |
|---|---|---|---|
| Diagnostic organisationnel gratuit | ✓ | ✗ | ✗ |
| Vault local / souveraineté des données | ✓ | ✗ | ~ |
| Schéma vivant modifiable sans code | ✓ | ✗ | ✗ |
| Registre RGPD automatique | ✓ | ✗ | ~ |
| LLM contextualisé au cabinet | ✓ | ~ | ✗ |
| Conflit d'intérêts sur les données | Aucun | Structurel | Variable |
| Prix adapté au libéral | ✓ | ~ | ✗ |

---

## 7. Feuille de route

### Phase 0 — Fondation (Mois 1–3)

**Produit**
- Questionnaire diagnostic finalisé (20 questions, 5 sections)
- Moteur de restitution (score, axes, risques, chantiers)
- Premier chantier LLM opérationnel : Registre RGPD
- Export PDF du registre

**Commercial**
- Recrutement de 5 cabinets pilotes (accès gratuit)
- Interviews utilisateurs hebdomadaires
- Mesure : temps d'onboarding, taux de complétion, NPS

**Infrastructure**
- Vault cloud HDS v1 (PostgreSQL chiffré, hébergeur HDS partenaire)
- API LLM intégrée (Claude Sonnet)
- Auth passwordless

**Livrable clé :** Un médecin peut compléter le diagnostic et télécharger son registre RGPD en moins de 20 minutes.

---

### Phase 1 — Validation (Mois 3–9)

**Produit**
- 4 chantiers LLM opérationnels (RGPD, IA sécurisée, accès, notice patient)
- Proxy IA sécurisé (rédaction de courriers)
- Tableau de bord conformité
- Application mobile (consultation du diagnostic, alertes)

**Commercial**
- Lancement Starter 49 €/mois
- Présence CMGF 2027 (congrès médecins généralistes)
- Programme parrainage médecin → médecin
- Newsletter conformité médicale (contenu éducatif)
- Cible : 500 médecins actifs, ARR 300 K€

**Mesures cibles**
- Taux de conversion diagnostic → Starter : > 20%
- Taux de conversion Starter → Pro : > 35%
- Churn mensuel : < 3%
- NPS : > 45

---

### Phase 2 — Croissance (Mois 9–18)

**Produit**
- Chantiers P2 et P3 (reporting, transmission, synthèse dossier)
- Connecteurs logiciels métiers (Doctolib, Weda, Medistory)
- Schéma vivant interactif — modifiable par le médecin
- Module multi-praticiens (MSP, cabinets de groupe)

**Commercial**
- Lancement Pro 149 €/mois
- Premier accord URPS régionale
- Initiation négociations assureurs RCP
- Cible : 2 500 médecins actifs, ARR 4,5 M€

**Levée de fonds**
- Série A cible : 3–5 M€
- Usage : recrutement (tech + commercial + support médical), certification HDS propre, expansion géographique préparatoire

---

### Phase 3 — Échelle (Mois 18–36)

**Produit**
- Vault local pour structures institutionnelles
- Export interopérable FHIR R4 / HL7
- IA d'analyse de pratique sur données anonymisées
- Expansion : dentistes, kinésithérapeutes, infirmiers, psychologues

**Commercial**
- Accord(s) assureur(s) RCP signé(s) → accès à 10 000+ médecins
- Accords URPS multi-régionaux
- Partenariat éditeur logiciel médical (intégration OEM)
- Expansion Europe francophone (Belgique, Suisse, Luxembourg)
- Cible : 15 000 médecins actifs, ARR 20–25 M€

---

### Métriques de succès à suivre

| Métrique | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Médecins actifs | 500 | 2 500 | 15 000 |
| ARR | 300 K€ | 4,5 M€ | 20 M€ |
| Taux conversion diag → payant | > 20% | > 30% | > 35% |
| Churn mensuel | < 3% | < 2% | < 1,5% |
| NPS | > 45 | > 55 | > 65 |
| CAC | < 300 € | < 200 € | < 100 € |
| LTV médecin | > 2 500 € | > 5 000 € | > 7 000 € |

---

## 8. Ce que ce projet n'est pas

- Ce n'est **pas un DPI** — il ne remplace pas Doctolib ou les logiciels métiers existants
- Ce n'est **pas un outil de cybersécurité** — il ne protège pas contre les intrusions réseau
- Ce n'est **pas un outil de diagnostic médical** — il est l'infrastructure qui permet d'utiliser des IA de diagnostic en conformité
- Ce n'est **pas un formulaire de conformité RGPD** — c'est une couche opérationnelle qui produit la conformité comme sous-produit
- Ce n'est **pas un outil technique** — le médecin ne doit jamais voir de code, de configuration, ni de terminologie technique

---

## 9. Risques et parades

| Risque | Probabilité | Impact | Parade |
|---|---|---|---|
| Doctolib lance un module conformité | Moyenne | Élevé | Profondeur technique et schéma vivant non réplicables rapidement ; se différencier sur la souveraineté des données |
| Certification HDS coûteuse et longue | Haute | Moyen | Partenaire hébergeur HDS dès le départ ; vault cloud avant vault local |
| Adoption médicale lente | Haute | Moyen | Diagnostic gratuit comme levier d'entrée zéro friction ; bouche à oreille par valeur immédiate |
| Réglementation centralisée par l'État | Faible | Élevé | Positionnement complémentaire aux outils publics (ANS, Mon Espace Santé) |
| Conflit avec éditeurs logiciels | Moyenne | Faible | Positionnement complémentaire, pas concurrent ; offrir des intégrations |

---

## 10. L'équipe cible

Pour exécuter cette feuille de route, Lugia & Co Doctor a besoin de :

- **1 CEO / co-fondateur** — profil santé numérique ou entrepreneuriat médical
- **1 CTO / co-fondateur** — fullstack, expérience données de santé
- **1 médecin advisor** — généraliste libéral, réseau confrères
- **1 DPO / expert conformité santé** — RGPD, HDS, AI Act
- **1 designer produit** — UX pour utilisateurs non-tech

---

*Spécification Lugia & Co Doctor — Mai 2026*
*Document de référence interne — usage fondateurs et investisseurs*
