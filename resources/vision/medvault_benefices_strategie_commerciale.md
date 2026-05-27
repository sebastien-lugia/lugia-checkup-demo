# MedVault — Bénéfices & Stratégie commerciale
> Document de synthèse — Mai 2026

---

## La proposition de valeur en une phrase

> **MedVault transforme la conformité IA d'une contrainte anxiogène en avantage opérationnel — sans que le médecin ait à faire quoi que ce soit de technique.**

---

## Les bénéfices clés

### Pour le médecin au quotidien

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

---

### Par domaine

**① Temps**
- Courriers et comptes-rendus : 8 min → 2 min
- Renouvellements d'ordonnances : 5 min → 2 min
- Synthèse dossier complexe : 15 min → 4 min
- Documents réglementaires : plusieurs jours → quelques minutes

**② Conformité**
- Registre des traitements RGPD généré automatiquement
- Notice patient sur l'usage de l'IA personnalisée au cabinet
- Tableau de bord conformité en temps réel
- Audit trail complet pour répondre à tout contrôle

**③ Sécurité**
- Vault local — tokenisation des données avant tout envoi à l'IA
- Zéro donnée identifiable ne quitte le cabinet
- Classification automatique des champs sensibles
- Logs de chaque accès, consultation et modification

**④ Organisation**
- Droits d'accès granulaires par personne et par rôle
- Onboarding structuré des remplaçants et stagiaires
- Transmission de cabinet guidée et conforme

**⑤ Qualité des soins**
- Synthèse de dossier avant consultation
- Détection des interactions médicamenteuses
- Aide à la recherche bibliographique (recommandations HAS)
- Préparation automatique des dossiers RCP

**⑥ Administration**
- Aide au codage des actes CCAM
- Relances patients et impayés automatisées
- Reporting d'activité mensuel sur données anonymisées

---

## Ce que le médecin ne doit jamais voir

La conformité doit être **invisible**. Le médecin perçoit :
- Un outil qui l'aide à rédiger plus vite
- Un outil qui le protège juridiquement
- Un outil qui simplifie son administratif

Il ne perçoit **pas** :
- La tokenisation des données
- Les appels API vers les LLM
- Les tables de correspondance du vault
- La classification des champs

---

## Stratégie commerciale

---

### Le modèle de facturation recommandé

Un modèle hybride en 3 niveaux, pensé pour maximiser l'adoption puis la rétention.

#### Socle — 49 €/mois
*Entrée sans risque — valeur immédiate*

- Onboarding dialogue guidé
- Schéma vivant du cabinet (jusqu'à 5 objets)
- Registre RGPD automatique exportable
- Notice patient IA personnalisée
- Logs et audit trail de base

> **Pourquoi 49€ ?** Un médecin généraliste facture 26,50€ la consultation. Ce socle est rentabilisé par 2 consultations par mois.

---

#### Pro — 149 €/mois
*Là où se crée la dépendance réelle*

- Vault local opérationnel
- Proxy IA — rédaction sécurisée **illimitée**
- Gestion fine des accès tiers
- Objets illimités dans le schéma
- Tableau de bord conformité
- Support prioritaire

> **Règle absolue :** la rédaction de courriers ne doit jamais être à l'usage. Le médecin qui commence à compter ses courriers freine son usage. Illimité et invisible = dépendance réelle.

---

#### Institution — Sur devis
*Maisons de santé, cabinets de groupe, cliniques*

- Multi-sites et multi-praticiens
- Connecteurs DPI sur mesure
- Certification HDS
- Accompagnement dédié
- SLA garanti

---

#### Modules optionnels — 30 à 50 €/mois chacun

| Module | Prix | Valeur principale |
|---|---|---|
| Ordonnances | 30€/mois | Renouvellement assisté |
| Synthèse dossier | 40€/mois | Résumé avant consultation |
| Reporting | 30€/mois | Tableau de bord d'activité |
| Transmission | 50€/mois | Cession/transmission cabinet |

---

### La règle des modèles selon la phase

```
ACQUISITION          RÉTENTION             EXPANSION
────────────         ─────────             ─────────
Freemium             Abonnement            Modules
ou Socle 49€         mensuel Pro           à la carte

Le médecin           Il n'y pense          Il active
découvre             plus — ça             ce dont
sans risque          tourne seul           il a besoin
```

---

### À qui facture-t-on vraiment ?

C'est la question stratégique la plus importante — et la réponse change tout à l'échelle.

#### Canal A — Le médecin directement (B2C)
- Prix : 49 à 149€/mois
- Avantage : marge maximale, relation directe
- Limite : coût d'acquisition élevé, sensibilité au prix
- Horizon : pilote et phase 1

#### Canal B — Le cabinet de groupe ou la MSP (B2B)
- Prix : 300 à 800€/mois pour 3 à 8 praticiens
- Avantage : décision unique, déploiement multiple
- Limite : cycle de vente plus long
- Horizon : phase 2

#### Canal C — L'assureur RCP (B2B2C) ⭐
- Modèle : l'assureur co-finance ou offre MedVault dans son contrat
- Prix : 5 à 15€/médecin/mois reversé en volume
- Avantage : accès à des dizaines de milliers de médecins d'un coup, coût d'acquisition quasi nul, alignement d'intérêts parfait
- Limite : cycle de négociation long (6 à 18 mois)
- Horizon : phase 2-3, à initier dès maintenant

> Les assureurs RCP (MACSF, Médicis, MIC…) ont un intérêt direct à ce que leurs clients soient conformes. Un médecin non conforme qui subit un contrôle CNIL expose l'assureur. MedVault est leur outil de prévention.

#### Canal D — Les URPS et ordres professionnels
- Modèle : accord-cadre régional ou national
- Avantage : légitimité institutionnelle, budget disponible
- Limite : processus de décision lent
- Horizon : phase 2-3

#### Canal E — Les éditeurs de logiciels médicaux (OEM)
- Modèle : MedVault intégré dans Doctolib, HelloDoc, Mediboard
- Avantage : distribution massive sans effort commercial
- Limite : dépendance partenaire, perte de visibilité
- Horizon : phase 3

---

### Stratégie d'entrée en 3 phases

#### Phase 1 — Valider par les pilotes (0 à 6 mois)
- 3 à 5 cabinets partenaires, accès gratuit ou réduit
- Mesurer : temps économisé, taux d'adoption, NPS
- Construire : témoignages, cas d'usage documentés, données de valeur

#### Phase 2 — Acquisition directe (6 à 18 mois)
- Présence dans les congrès médicaux (WONCA, CMGF…)
- Partenariats avec les Facultés de médecine
- Programme de parrainage médecin → médecin
- Contenu éducatif : guides RGPD, webinaires AI Act
- Initiation des négociations assureurs RCP et URPS

#### Phase 3 — Distribution institutionnelle (18 mois+)
- Accords assureurs RCP signés
- Accords URPS régionaux
- Intégration OEM logiciels métiers
- Expansion géographique (Belgique, Suisse, Luxembourg)

---

### Le chemin vers la dépendance

```
Semaine 1
→ Registre RGPD pour la première fois — soulagement immédiat
→ Il recommande à un confrère

Mois 1
→ Il rédige ses courriers avec l'IA chaque jour
→ Il ne peut plus imaginer faire autrement
→ L'abonnement Pro est évident

Mois 3
→ Il active le module Synthèse
→ Ses consultations sont mieux préparées
→ Il en parle en réunion de MSP

Mois 6
→ MedVault est dans son flux quotidien
→ Le churne devient psychologiquement coûteux
→ Il recommande à ses associés
```

---

### Les métriques à suivre absolument

| Métrique | Cible phase 1 | Cible phase 2 |
|---|---|---|
| Taux conversion freemium → payant | > 20% | > 30% |
| Churn mensuel | < 3% | < 1.5% |
| NPS | > 40 | > 60 |
| LTV médecin moyen | > 3 000€ | > 6 000€ |
| CAC (coût acquisition client) | < 300€ | < 150€ |
| Délai activation Pro | < 30 jours | < 15 jours |

---

## Recommandation finale

**Court terme (0-12 mois)**
Socle 49€ + Pro 149€, vente directe, pilotes gratuits. Construire la preuve de valeur.

**Moyen terme (12-24 mois)**
Initier assureurs RCP et URPS en parallèle du B2C. Un accord assureur = 10 000 clients directs.

**Long terme (24 mois+)**
Le B2C finance le produit. Le B2B2C finance la croissance. L'OEM finance l'échelle.

> **La règle d'or :** ne jamais dépendre d'un seul canal.
> Le médecin qui paye directement donne de la **marge**.
> L'assureur qui distribue donne de l'**échelle**.
> L'éditeur qui intègre donne de la **visibilité**.
> Il faut les trois — dans cet ordre.

---

*Document de synthèse MedVault — Mai 2026*
*Usage interne — équipe fondateurs et investisseurs*
