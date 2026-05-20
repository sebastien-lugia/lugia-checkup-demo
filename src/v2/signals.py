"""Signaux croisés inter-axes V2.0.

6 patterns évalués en cascade priorisée (cf spec V2 §9 + `diagnostics_v2.json`).
Premier match gagne — un seul signal est affiché à la fois.

Particularité importante : `S-burnout` est **inhibé** quand `S-tech-vs-organisation`
matche (ordre de priorité 2 avant 1 ? Non — l'ordre dans le JSON est correct,
S-burnout en 1, mais la condition de S-burnout inclut `C ≤ 54`, donc un C ≥ 55
écarte automatiquement S-burnout au profit de S-tech-vs-organisation).

Cas limite traité : A=33, B=34, C=90 → ne déclenche pas S-burnout (C exclut),
match S-tech-vs-organisation — recadrage plus juste que l'alerte générique.

V2.0-T2 — Sébastien.
"""

from __future__ import annotations

from typing import Any, Optional

from .scoring import load_diagnostics


def _condition_matches(scores: dict[str, Any], condition: str) -> bool:
    """Évalue une condition simple de la forme `A <= 34 AND B <= 34 AND C <= 54`.

    Grammaire supportée :
    - opérandes : A, B, C → score_pct de l'axe
    - opérateurs : `<=`, `>=`, `<`, `>`, `==`
    - liaison : `AND` uniquement (pas de OR ni de parenthèses pour l'instant)
    - opérandes numériques : entiers 0..100

    Retourne False si un axe n'est pas encore scoré (None) — un signal
    ne peut s'évaluer que sur les 3 axes complets.
    """
    axes = {
        "A": scores.get("A", {}).get("pct") if isinstance(scores.get("A"), dict) else None,
        "B": scores.get("B", {}).get("pct") if isinstance(scores.get("B"), dict) else None,
        "C": scores.get("C", {}).get("pct") if isinstance(scores.get("C"), dict) else None,
    }
    if any(v is None for v in axes.values()):
        return False

    # Découpe en clauses
    clauses = [c.strip() for c in condition.split("AND")]
    for clause in clauses:
        if not _eval_clause(clause, axes):
            return False
    return True


def _eval_clause(clause: str, axes: dict[str, int]) -> bool:
    """Évalue une clause atomique `A <= 34`."""
    for op in ("<=", ">=", "==", "<", ">"):
        if op in clause:
            left, right = clause.split(op, 1)
            left = left.strip()
            right = right.strip()
            if left not in axes:
                raise ValueError(f"Axe inconnu dans la clause : {left}")
            try:
                rhs = int(right)
            except ValueError:
                raise ValueError(f"Membre droit non entier : {right!r}")
            lhs = axes[left]
            return _compare(lhs, op, rhs)
    raise ValueError(f"Opérateur introuvable dans la clause : {clause!r}")


def _compare(lhs: int, op: str, rhs: int) -> bool:
    if op == "<=":
        return lhs <= rhs
    if op == ">=":
        return lhs >= rhs
    if op == "<":
        return lhs < rhs
    if op == ">":
        return lhs > rhs
    if op == "==":
        return lhs == rhs
    raise ValueError(f"Opérateur non géré : {op!r}")


def evaluate_signals(scores: dict[str, Any]) -> Optional[dict[str, Any]]:
    """Évalue les 6 signaux croisés en cascade et retourne le premier match.

    Retourne `None` si aucun signal ne matche (cas typique : un cabinet
    homogène moyen sans extrême). Retourne un dict :
    ```
    {
        "id": "S-tech-vs-organisation",
        "titre": "Vous avez investi sur les outils — ...",
        "tonalite": "recadrage",
        "message": "Vos outils sont à un bon niveau ..."
    }
    ```

    L'ordre d'évaluation est celui de `signaux_croises[].ordre_priorite`
    dans `diagnostics_v2.json` — S-burnout d'abord, S-structured en
    dernier (ferme le tableau, ne masque jamais une alerte).
    """
    diag = load_diagnostics()
    signaux = sorted(diag["signaux_croises"], key=lambda s: s["ordre_priorite"])
    for signal in signaux:
        if _condition_matches(scores, signal["condition"]):
            return {
                "id": signal["id"],
                "ordre_priorite": signal["ordre_priorite"],
                "titre": signal["titre"],
                "tonalite": signal["tonalite"],
                "message": signal["message"],
            }
    return None
