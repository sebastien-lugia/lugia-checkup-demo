# Lugia — Mesure des faux négatifs (FN)
**Version** 0.1  
**Projet** Lugia Checkup — Calibration  
**Date** Juin 2026  
**Complément de** `lugia_calibration_spec.md` (§3 règles, §7 ajustement automatique)

---

## Présentation

La calibration sait déjà mesurer le **faux positif** (l'utilisateur marque `faux_positif`). Le **faux négatif** — un risque réel que le moteur n'a jamais signalé — est invisible par construction. Or les règles de révision en dépendent (ex. R02 : *« si taux_FN > 0.20 → baisser le seuil »*). Ce document spécifie **comment observer le FN sur le terrain** pour rendre ces règles exécutables.

---

## 1. Principe cardinal — le FN est un minorant

On ne mesure **jamais** le FN réel, seulement le **FN observé** : les seuls risques manqués qu'on découvre *a posteriori*. C'est un **minorant** (lower bound) du FN réel.

Conséquence — **asymétrie de révision**, non négociable :

```
FN observé au-dessus du seuil   → preuve FORTE → on peut ASSOUPLIR la règle (baisser le seuil)
Absence de FN observé           → ne prouve RIEN → on ne RESSERRE JAMAIS une règle là-dessus
```

Le resserrement d'une règle se fait uniquement sur le **FP** (bruit observé). Le FN ne sert qu'à **détendre**. Toute proposition d'ajustement respecte les **bornes absolues** (calibration §7.5) et l'amplitude max par itération (roadmap §4).

---

## 2. Les cinq sources d'évidence de FN

| # | Source | Capté comment | Force | Disponible |
|---|---|---|---|---|
| S1 | **Incident déclaré** | événement adverse réel rapporté (panne bloquante, perte financière, contrôle, départ, rupture de continuité) sans signal Lugia ouvert correspondant | forte | V1 (question rétrospective d'interview) |
| S2 | **Détection retardée** | un signal se déclenche en session N+1 alors que sa condition était déjà vraie dans un snapshot antérieur → FN rétroactif + lag | forte, automatique | dès ≥ 2 snapshots |
| S3 | **Signal manuel** | un signal créé par l'utilisateur/expert que le moteur n'a pas généré → candidat FN | moyenne | V1 |
| S4 | **Audit expert** | diagnostic manuel complet sur un échantillon, comparé à la sortie moteur ; tout signal trouvé par l'expert et absent = FN | étalon-or | cold-start + QA continue (échantillon) |
| S5 | **Anomalie inter-cabinets** | une règle qui se déclenche chez X % des cabinets comparables (même profil/secteur) mais absente ici, données par ailleurs complètes | faible (à confirmer) | à l'échelle (≥ palier cabinets) |

En cold-start (peu de volume, peu de temps), seules **S3 et S4** sont exploitables ; S1/S2/S5 montent en puissance avec le volume.

---

## 3. L'attribution — quel FN pour quelle règle

Un FN n'est utile que **rattaché à la règle qui aurait dû le capter** ; sinon on ne sait pas quel seuil réviser.

```
Table incident → règle attendue (extraits)
  Panne d'un outil/acteur central et bloquant     → R02 (dépendance unique)
  Perte de recettes / télétransmission            → R-MED-02
  Départ d'un acteur surchargé = désorganisation   → R09 / surcharge
  Donnée sensible exposée / non-conformité         → R10 (conformité)
  Problème connu resté sans suite trop longtemps    → R11 (chronique)
  Acteur externe critique défaillant sans secours   → R13 (isolement écosystème)
```

Distinction essentielle :

```
Incident → mappe à une règle existante  → c'est un FN de SEUIL    → réviser le seuil de la règle
Incident → ne mappe à aucune règle      → ce n'est PAS un FN      → MANQUE DE COUVERTURE
                                                                   → backlog "nouvelle règle", pas un ajustement
```

Ne jamais bouger un seuil pour un risque qu'aucune règle ne couvrait : on créerait du bruit sans corriger la vraie lacune.

---

## 4. Modèle de données — l'Incident

```typescript
Incident {
  id:                 uuid
  organisation_id:    uuid
  date_survenue:      datetime?
  date_déclaration:   datetime
  type:               "panne" | "perte_financière" | "contrôle_conformité"
                    | "rupture_continuité" | "départ" | "litige" | "autre"
  gravité:            "mineur" | "significatif" | "critique"
  objets_impliqués:   uuid[]              // objets de la grille concernés
  description:        string              // nettoyée — jamais de donnée patient (cf §7)
  signal_préexistant: uuid | null         // un signal Lugia ouvert couvrait-il ce risque ?
  règle_attendue:     string | null       // code règle censée le capter (cf §3)
  classification:     "TP_tardif"         // un signal existait et avait prévenu
                    | "FN"                // aucun signal alors qu'une règle aurait dû
                    | "manque_couverture" // aucune règle ne couvrait → backlog règle
                    | "hors_périmètre"
  source:             "interview" | "déclaration" | "audit" | "anomalie"
}
```

**Captation V1** — une question rétrospective standard à chaque session d'interview :
> *« Depuis la dernière fois, est-ce qu'il y a eu un imprévu coûteux — une panne, une perte, un contrôle, un départ, un blocage ? »*

Règle de classification automatique :
```
signal_préexistant ≠ null (et ouvert avant l'incident)  → TP_tardif  (le système avait prévenu)
signal_préexistant = null  ET  règle_attendue ≠ null     → FN         (attribué à règle_attendue)
règle_attendue = null                                    → manque_couverture (backlog règle)
```

---

## 5. Calcul du taux de FN par règle

```
TP(R)  = signaux générés par R ayant mené à une action validée/résolue (vrai positif confirmé)
FN(R)  = FN observés attribués à R (sources S1–S5)
Recall(R)  = TP(R) / ( TP(R) + FN(R) )
taux_FN(R) = FN(R) / ( TP(R) + FN(R) ) = 1 − Recall(R)
```

Calculé sur **≥ N cabinets** (réutilise les minimums de la table de synthèse calibration §8). Comme les incidents sont rares, le FN exige **plus de volume ou une fenêtre temporelle plus longue** que le FP : minimum provisoire **2× le min. cabinets de la règle**, à geler comme le reste du roadmap. Toujours afficher **« FN observés (≥) »**, jamais un taux absolu.

---

## 6. Branchement sur les règles de révision

Les règles FN de la calibration deviennent exécutables. Exemple R02 :

```
taux_FN_R02 = FN_R02 / (TP_R02 + FN_R02)        // FN_R02 = incidents type "panne outil central"
                                                 //          classés FN + attribués R02
Si taux_FN_R02 > SEUIL_FN_R02 (0.20) sur ≥ 60 cabinets :
   Proposer RATIO_CENTRALITE −= 0.05   (assouplir : le seuil laissait passer des dépendances réelles)
   sous réserve : borne basse 0.40 (§7.5) + amplitude max/itération + validation admin (§7.4)
```

Le format de proposition d'ajustement (calibration §7.3) gagne un champ `preuve_fn` : liste des incidents/audits ayant fondé la révision (traçabilité).

---

## 7. Confidentialité

Un incident peut mentionner une donnée sensible (un nom de patient dans une panne décrite). Traitement identique aux transcriptions (schema_spec Q10/Q12) : **hébergement HDS**, description **nettoyée/anonymisée**, on conserve le **type** et les **objets de travail** impliqués, **jamais** le contenu patient ; purge sous 30 jours pour l'extrait brut.

---

## 8. Limite assumée

On mesure un **minorant** du FN, pas le FN réel. Aucune garantie d'exhaustivité n'est possible. L'objectif n'est pas un FN nul mais une **amélioration continue du recall observé**, règle par règle, à mesure que les incidents, snapshots et audits s'accumulent. Tout tableau de bord interne affiche le FN comme une borne inférieure, jamais comme une mesure exacte.

---

*Fin du document — Version 0.1 — à intégrer dans `lugia_calibration_spec.md` (§3, §7) à la prochaine révision.*
