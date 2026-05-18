"""Génère le rapport Markdown d'une interview et l'écrit dans
`resources/sample_report.md`.

Cohérent avec `DECISIONS.md` D-010 : le rapport est produit par le
démonstrateur lui-même (à travers les modules `src/scoring`,
`src/templates`, `src/workstreams`), pas rédigé en amont. Permet de
vérifier la non-régression du rapport à chaque évolution des templates
ou du scoring.

Lancement :
    python scripts/dump_report.py                # utilise la dernière interview
    python scripts/dump_report.py --id 42         # utilise une interview précise
    python scripts/dump_report.py --stdout        # écrit sur stdout au lieu du fichier
    python scripts/dump_report.py --list          # liste les interviews disponibles
"""

from __future__ import annotations

import argparse
import sys
from datetime import datetime
from pathlib import Path

# Permet l'exécution directe : ajoute la racine au sys.path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src import db, questions, scoring, swot, templates, workstreams  # noqa: E402


REPORT_PATH = ROOT / "resources" / "sample_report.md"


def _html_to_md(text: str) -> str:
    """Convertit les balises HTML inline (em) en équivalents Markdown."""
    return text.replace("<em>", "*").replace("</em>", "*")


def _format_date(iso_str: str) -> str:
    """Convertit une date ISO en date lisible."""
    try:
        return datetime.fromisoformat(iso_str).strftime("%d/%m/%Y")
    except (ValueError, TypeError):
        return iso_str[:10] if iso_str else ""


def _latest_interview_id() -> int | None:
    """Retourne l'id de l'interview la plus récente, ou None."""
    from sqlalchemy import text

    db.init_db()
    with db.get_engine().connect() as conn:
        result = conn.execute(
            text("SELECT id FROM interview ORDER BY updated_at DESC LIMIT 1")
        )
        row = result.mappings().fetchone()
    return int(row["id"]) if row else None


def _list_interviews() -> None:
    """Affiche la liste des interviews avec leur id, date et statut."""
    from sqlalchemy import text

    db.init_db()
    with db.get_engine().connect() as conn:
        result = conn.execute(
            text(
                "SELECT i.id, i.created_at, i.updated_at, i.status, i.current_question_index, "
                "       COUNT(a.id) AS nb_answers "
                "FROM interview i LEFT JOIN answer a ON a.interview_id = i.id "
                "GROUP BY i.id "
                "ORDER BY i.updated_at DESC"
            )
        )
        rows = result.mappings().all()
    if not rows:
        print("Aucune interview en base.")
        return
    print(f"{'id':>4}  {'créée':<10}  {'maj':<10}  {'statut':<12}  {'idx':>3}  {'réponses':>8}")
    print("-" * 60)
    for r in rows:
        created = _format_date(r["created_at"])
        updated = _format_date(r["updated_at"])
        print(
            f"{r['id']:>4}  {created:<10}  {updated:<10}  "
            f"{r['status']:<12}  {r['current_question_index']:>3}  {r['nb_answers']:>8}"
        )


def generate_markdown(interview_id: int) -> str:
    """Compose le rapport Markdown à partir d'une interview."""
    interview = db.get_interview(interview_id)
    if interview is None:
        raise ValueError(f"Interview {interview_id} introuvable.")

    answers = db.get_answers(interview_id)
    facet_scores = scoring.compute_all_facet_scores(interview_id)
    facet_labels = questions.get_facet_labels()
    synthesis = _html_to_md(templates.build_synthesis(answers, interview_id))
    recommendation = _html_to_md(templates.build_recommandation(answers, interview_id))
    recommended = templates.build_next_step_recommendation(facet_scores, answers)
    chantiers = workstreams.build_workstreams(interview_id)

    lines: list[str] = []

    # ---- En-tête ----
    lines.append("# Sample Report — Dr Philippe Chateau")
    lines.append("")
    lines.append(
        "> Rapport produit par le démonstrateur Lugia Check-up à partir d'une session "
        "du persona de référence (`resources/sample_answers_pchateau.md`)."
    )
    lines.append(
        "> Généré par `scripts/dump_report.py` qui applique les modules V0-4 "
        "(`src/scoring`, `src/templates`, `src/workstreams`) à la session pré-remplie "
        "par `scripts/seed_persona.py`."
    )
    lines.append(
        f"> Date de génération : {datetime.now().strftime('%d/%m/%Y')}."
    )
    lines.append("")
    lines.append("## Session")
    lines.append("")
    lines.append(f"- **Interview id** : {interview['id']}")
    lines.append(f"- **Date de session** : {_format_date(interview['created_at'])}")
    lines.append(f"- **Statut** : {interview['status']}")
    lines.append(f"- **Nombre de réponses** : {len(answers)}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ---- Synthèse ----
    lines.append("## Votre situation aujourd'hui")
    lines.append("")
    lines.append(synthesis)
    lines.append("")
    lines.append("---")
    lines.append("")

    # ---- Facettes ----
    lines.append("## Trois angles de votre cabinet")
    lines.append("")
    facet_order = ["processes", "participants", "information"]
    for facet_key in facet_order:
        label = facet_labels.get(facet_key, facet_key).capitalize()
        score_data = facet_scores.get(facet_key)
        if not score_data:
            lines.append(f"### {label}")
            lines.append("")
            lines.append("Pas assez de données pour évaluer cette facette.")
            lines.append("")
            continue
        score = score_data["score"]
        level_data = scoring.score_to_level(score)
        level = level_data["level"]
        level_label = level_data["label"]
        # Barre 5 segments inversée en markdown (▰ rempli, ░ vide)
        filled = 6 - level
        bar = "".join("▰" if i <= filled else "░" for i in range(1, 6))
        lines.append(f"### {label} — {level_label}")
        lines.append("")
        lines.append(f"`{bar}` *(niveau {level} sur 5)*")
        lines.append("")
        # Forces
        forces = swot.build_facet_forces(facet_key, answers, level)
        if forces:
            lines.append("**Points forts**")
            lines.append("")
            for f in forces:
                lines.append(f"- {f}")
            lines.append("")
        # Risques
        risques = swot.build_facet_risques(facet_key, answers, level)
        if risques:
            lines.append("**Points de vigilance**")
            lines.append("")
            for r in risques:
                lines.append(f"- {r}")
            lines.append("")
        # Note méthodologique compacte
        contribs = score_data["contributions"]
        n = len(contribs)
        details = ", ".join(
            f"{c['question_id'].upper()} ({c['health_score']})" for c in contribs
        )
        lines.append(
            f"*Calculé à partir de {n} réponses — {details} ; score brut {score} sur 10.*"
        )
        lines.append("")
    lines.append("---")
    lines.append("")

    # ---- Callout recommandation Lugia (V1.1.7-d : voix "vous") ----
    if recommendation:
        # Plus d'italique global — le markdown garde tel quel le HTML reçu
        # (les <strong> deviendront du **gras** via _html_to_md).
        lines.append(f"> {recommendation}")
        lines.append("")
        lines.append("---")
        lines.append("")

    # ---- Opportunités d'action (anciennement "chantiers") ----
    lines.append("## Trois opportunités d'action")
    lines.append("")
    lines.append("Les opportunités ci-dessous sont des leviers d'action concrets : chacune répond aux risques relevés plus haut, en s'appuyant sur les forces déjà en place quand c'est possible. À vous d'arbitrer ce qui vaut la peine d'être engagé en premier.")
    lines.append("")
    # V1.1.7-l : sortie alignée sur le frontend — 2 blocs uniquement
    # (LA SITUATION + CE QU'ON METTRAIT EN PLACE). Les champs analyse et
    # pas_confirmer restent générés en backend pour réversibilité mais ne
    # sont plus exposés dans le dump.
    for ch in chantiers:
        lines.append(f"### Opportunité {ch['priority']} — {ch['title']}")
        lines.append("")
        lines.append("**La situation**")
        lines.append("")
        lines.append(ch["vu"])
        lines.append("")
        lines.append("**Ce qu'on mettrait rapidement en place**")
        lines.append("")
        lines.append(ch["propose"])
        lines.append("")
    lines.append("---")
    lines.append("")

    # ---- Prochaine étape ----
    lines.append("## Prochaine étape ?")
    lines.append("")
    lines.append("Vous avez vu les opportunités. Voici comment les transformer en chantiers avec Lugia.")
    lines.append("")
    # V1.1 Vague 3.1c : les 3 options sont toutes des accompagnements Lugia.
    # Aligné sur web/app/resultats/page.tsx (clés et wordings identiques).
    # V1.1.7-m : 2 chemins (autonomie + Lugia en réel), suppression terrain.
    next_steps = {
        "autonomie": (
            "Approfondir un chantier, en autonomie",
            "Un questionnaire ciblé sur l'opportunité de votre choix. Environ 15 minutes, "
            "gratuit, sans rendez-vous — à votre rythme.",
        ),
        "lugia": (
            "Avancer avec Lugia, en réel",
            "Vous choisissez une opportunité, on la traite ensemble dans votre cabinet. "
            "Pas un appel d'identification — le chantier lui-même, structuré à partir de "
            "dispositifs éprouvés chez d'autres confrères.",
        ),
    }
    rec_title, rec_desc = next_steps[recommended]
    lines.append(f"**{rec_title}** *(recommandé)*")
    lines.append("")
    lines.append(rec_desc)
    lines.append("")
    lines.append("Autres options :")
    lines.append("")
    for key, (title, desc) in next_steps.items():
        if key == recommended:
            continue
        lines.append(f"- *{title}* : {desc}")
    lines.append("")
    lines.append("---")
    lines.append("")

    # ---- Notes méthodologiques ----
    lines.append("## Notes méthodologiques")
    lines.append("")
    lines.append(
        "- **Scoring V0** : moyenne brute pure des scores santé des options "
        "sélectionnées dans les questions scorées. Voir `DECISIONS.md` D-013 et "
        "`resources/modeling_scoring.md`."
    )
    lines.append(
        "- **Limites assumées** : effet de compensation, absence de hiérarchie, "
        "dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle. "
        "Voir `DECISIONS.md` D-016 et `ROADMAP.md` section Scoring V1+."
    )
    lines.append(
        "- **Personnalisation** : les outils nommés, dates, incidents cités proviennent "
        "directement des réponses du questionnaire (compléments, réponses libres). "
        "Aucune génération LLM en V0."
    )
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(
        "*Sample report généré automatiquement. Régénérable à tout moment avec "
        "`python scripts/dump_report.py` après `python scripts/seed_persona.py --reset`. "
        "Sert d'oracle de non-régression pour les évolutions futures.*"
    )
    lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--id",
        type=int,
        default=None,
        help="Id de l'interview à dumper. Par défaut : la plus récente.",
    )
    parser.add_argument(
        "--stdout",
        action="store_true",
        help="Écrit sur stdout au lieu d'écrire dans resources/sample_report.md",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="Liste les interviews disponibles puis quitte.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=None,
        help="Chemin alternatif d'écriture du rapport (par défaut : resources/sample_report.md).",
    )
    args = parser.parse_args()

    if args.list:
        _list_interviews()
        return

    interview_id = args.id if args.id is not None else _latest_interview_id()
    if interview_id is None:
        print("Aucune interview en base. Lancer d'abord `python scripts/seed_persona.py`.")
        raise SystemExit(1)

    md = generate_markdown(interview_id)

    if args.stdout:
        print(md)
    else:
        out_path = args.out if args.out is not None else REPORT_PATH
        out_path.write_text(md, encoding="utf-8")
        print(f"Rapport écrit dans {out_path}")
        print(f"Interview id : {interview_id}")


if __name__ == "__main__":
    main()
