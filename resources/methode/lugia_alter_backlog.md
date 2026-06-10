# Lugia — Socle théorique Alter mis de côté (backlog)
**Date** Juin 2026  
**Source** `lugia_complement_alter.md` (Partie 2)  
**Statut** Délibérément **non intégré au moteur de règles** en V1 — conservé comme socle d'interview/prompt et réserve de réintégration future.

> Principe d'arbitrage : *justesse sans complexité*, test « un médecin verrait-il la différence ? ». Seuls **3 éléments** d'Alter ont été intégrés au moteur (R14 workaround, complétude fonctionnelle = 3 facettes, workaround → −0,20 stabilité). Tout le reste, ci-dessous, **nourrit le prompt système de l'IA (extracteur + coaching) et le protocole d'interview**, jamais le scoring — sauf réintégration future sous condition de données.

---

## 1. Principes WST (24) — surtout des questions d'interview

Déjà couverts par des règles : P01→R05, P12→R01, P14→R10, P22→R02 (entre autres).

Gardés comme **questions d'interview (Phase 3)**, pas comme règles (trop générateurs de faux positifs en automatique) :
- **P05 — Encourage judgment** → « Qui décide quand il y a une exception ? »
- **P06 — Control at source** → « Quand un problème arrive, on le corrige à la source ou après coup ? »
- **P11 — Align incentives** → « Les intérêts de chacun sont-ils alignés avec ceux du cabinet ? »

*Condition de réintégration comme règles* : données Phase γ du cold start (30+ organisations) montrant des réponses assez structurées pour une détection auto à FP < 30 %.

---

## 2. Les 8 espaces de design (DS1–DS8)

| Espace | Statut | Raison |
|---|---|---|
| DS1 (24 principes) | Partiel | 3 en questions d'interview (cf §1) |
| DS2 (possibilités de changement) | Écarté | alourdirait le catalogue d'actions N7 |
| DS3 (caractéristiques de conception) | Nuance | informe l'interprétation de `SEUIL_ADOPTION` (cf §3), pas un mécanisme |
| DS4 (sous-systèmes) | Écarté | taxonomie académique |
| DS5 (risques) | Diffus | enrichit le **contenu** de R01–R13, pas de nouvelle règle |
| DS6 (interactions) | Diffus | enrichit R12–R13, pas de nouvelle règle |
| DS7 (encapsulation) | Écarté | hors périmètre diagnostic |
| DS8 (produit/service) | Écarté | trop abstrait pour le terrain |

*Condition de réintégration* : une version **« experte » Lugia** destinée à des consultants en organisation (pas des médecins) pourrait exposer DS2/DS3/DS8 comme grille d'actions avancée. Hors périmètre V1.

---

## 3. DS3 — caractéristiques de conception (réserve Famille C)

Variables de tendance utiles, gardées comme **principe d'interprétation** pour calibrer les seuils en Phase γ, non comme mécanisme :
- « degré d'automatisation » → un système qui s'automatise fait passer les objets manuels en `en_transition`
- « résilience / agilité » → un système peu résilient justifie un `SEUIL_ADOPTION` plus bas pour ce contexte

*Condition* : données Phase γ corrélant ces caractéristiques à la vitesse réelle d'adoption.

---

## 4. Les 15 facettes de travail restantes (sur 18)

Intégrées (V0.5) : **décider · communiquer · coordonner**.
Écartées : representing reality · applying knowledge · thinking · learning · planning · controlling execution · improvising · processing information · performing physical work · performing support · interacting socially · providing service · creating value · maintaining security.

Note : **maintaining security** déjà couverte structurellement par R10 (conformité RGPD/HDS) — l'ajouter ferait doublon.

*Condition* : aucune prévue. Restent dans le prompt de l'IA comme grille d'analyse fine, jamais comme règles.

---

## 5. Axiomes WST non couverts (8 sur 24)

Couverts : 8 par des règles. Partiels : 8. **Absents (délibérément hors moteur)** :
- **A10 Maintenance** — qui maintient le système ? → capté en interview
- **A11 System of systems** — décomposition récursive → hors périmètre
- **A15 Trade-offs** — arbitrages implicites → trop abstrait à détecter
- **A17 Adaptability** — capacité de réponse → partiellement via workarounds (R14)
- **A20 Performance uncertainty** — philosophique
- **A24 Absorptive capacity** — capacité d'absorption du changement → capté en interview (rythme de changement déclaré)

A18 (agency) et A19 (compliance/noncompliance) sont **partiellement intégrés** via R14 (leur manifestation concrète et détectable).

*Condition* : aucune prévue pour A10/A11/A15/A20/A24 — ils valident l'architecture, ne deviennent pas des règles.

---

## 6. Où vit ce socle aujourd'hui

```
Moteur de règles (N8)        → NON (resterait du bruit / de la complexité)
Prompt système de l'IA       → OUI (extracteur + coaching : grille d'analyse fine)
Protocole d'interview        → OUI (questions Phase 3 : P05, P06, P11…)
Caution théorique (pitch)    → OUI (cf validation ci-dessous)
```

**Validation (à conserver, pas un backlog)** : le corpus Alter confirme l'architecture — extracteur ≡ ISKG inversé · grille ≡ SSKG · confiance/pruning ≡ DKG→SSKG · 10 axes ≡ RAVC niveaux 3–5 · inter-systèmes ≡ niveau 2 · flux sortants ≡ niveau 6.

---

*Backlog vivant — réévaluer à chaque palier de données (cold start γ, puis 30 / 100 / 200+ organisations) et à l'ouverture d'une offre « experte ».*
