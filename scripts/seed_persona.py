"""Seed un parcours type Dr Chateau dans la base (SQLite locale ou Postgres prod).

Crée une nouvelle interview, insère les 14 réponses du persona de référence
(voir `resources/sample_answers_pchateau.md`), positionne le pointeur de
session à la fin du questionnaire, et laisse la session en `in_progress`
pour qu'elle soit accessible via "Reprendre votre check-up" sur l'accueil.

Depuis V1-5a, l'API exige une auth par email. L'argument `--email` rattache
l'interview seedée à un email donné : une fois connecté avec cet email,
l'utilisateur retrouve la session sur l'accueil.

Aligné sur le protocole V1.1 (refonte Vague 3, voir D-021).

Lancement local (SQLite local) :
    python scripts/seed_persona.py --email sebastien+test@gmail.com
    python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

Lancement contre Postgres prod (Render) :
    export DATABASE_URL='postgresql://<external_url_render>'
    python scripts/seed_persona.py --email sebastien+test@gmail.com

Mode legacy V0 (sans email, anonyme) :
    python scripts/seed_persona.py
    python scripts/seed_persona.py --reset
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Permet l'exécution directe sans installation : ajoute la racine au sys.path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src import db  # noqa: E402  (import après sys.path manipulation)


ANSWERS = [
    {
        "question_id": "q01",
        "mode": "A",
        "selected_option": "q01_a",
        "selected_option_label": "Cabinet libéral solo (un seul médecin)",
        "free_text": None,
        "complement_text": None,
    },
    {
        "question_id": "q02",
        "mode": "A",
        "selected_option": "q02_b",
        "selected_option_label": "Un télésecrétariat externalisé",
        "free_text": None,
        "complement_text": "Depuis 18 mois, après le départ de Catherine qui était en interne pendant 8 ans.",
    },
    {
        "question_id": "q03",
        "mode": "A",
        "selected_option": "q03_c",
        "selected_option_label": "Pas de cadre formel, le secrétariat décide au cas par cas",
        "free_text": None,
        "complement_text": (
            "Je leur ai brièvement expliqué mon fonctionnement au démarrage, on en est resté "
            "là. Quelques RDV mal orientés de temps en temps, rien d'alarmant."
        ),
    },
    {
        "question_id": "q04",
        "mode": "A",
        "selected_option": "q04_d",
        "selected_option_label": "Plusieurs canaux dont des canaux directs vers moi (mobile, SMS, mail)",
        "free_text": None,
        "complement_text": (
            "Principalement Doctolib pour les nouveaux RDV et le télésecrétariat pour les "
            "appels. Quelques patients de longue date me sollicitent encore en direct par mail "
            "ou SMS — je ne veux pas couper le lien avec eux."
        ),
    },
    {
        "question_id": "q05",
        "mode": "B",
        "selected_option": "q05_d",
        "selected_option_label": "…se prolongent chez moi le soir ou le week-end",
        "free_text": (
            "Hier soir, j'ai traité une vingtaine de courriers spécialistes via mon outil "
            "d'envoi, quelques renouvellements d'ordonnances longues et trois résultats "
            "biologiques que je n'avais pas eu le temps de regarder dans la journée. Le "
            "week-end, j'avance souvent sur les comptes-rendus de visites à domicile."
        ),
        "complement_text": (
            "Pas tous les soirs, mais souvent. Je le fais parce que ça ne se voit pas le "
            "lendemain et que ça reste tenable pour moi."
        ),
    },
    {
        "question_id": "q06",
        "mode": "A",
        "selected_option": "q06_c",
        "selected_option_label": "Un événement récent qui m'a poussé à me poser des questions",
        "free_text": None,
        "complement_text": (
            "Un confrère m'a parlé de Lugia il y a quelques semaines, dans un contexte familial "
            "qui me pousse à prendre du recul sur mon organisation. Et je m'intéresse depuis "
            "longtemps à l'IA pour le cabinet."
        ),
    },
    {
        "question_id": "q07",
        "mode": "A",
        "selected_option": "q07_a",
        "selected_option_label": "Personne, je porte seul l'organisation du cabinet",
        "free_text": None,
        "complement_text": (
            "Externalisations comptable et télésecrétariat à côté, mais rien dans le quotidien "
            "du cabinet lui-même."
        ),
    },
    {
        "question_id": "q08",
        "mode": "A",
        "selected_option": "q08_d",
        "selected_option_label": "Le cabinet ferme — c'est ce que je fais en pratique",
        "free_text": None,
        "complement_text": (
            "Je n'ai jamais vraiment fait l'expérience d'un arrêt long. Pour mes congés je "
            "préviens en amont et je ferme. Une semaine d'arrêt non planifié, je ne sais pas "
            "comment je gérerais."
        ),
    },
    {
        "question_id": "q09",
        "mode": "A",
        "selected_option": "q09_d",
        "selected_option_label": "Plus de cinq outils, avec des informations à saisir à plusieurs endroits",
        "free_text": None,
        "complement_text": (
            "Un logiciel métier, une plateforme de rendez-vous, un outil d'envoi de courriers "
            "aux spécialistes, une messagerie sécurisée, une dictée vocale, un dossier "
            "régional. Tout fonctionne mais il reste de la double saisie pour les nouveaux "
            "patients."
        ),
    },
    {
        "question_id": "q10",
        "mode": "A",
        "selected_option": "q10_d",
        "selected_option_label": "Je ne le sais pas, sauf si le patient revient de lui-même",
        "free_text": None,
        "complement_text": (
            "C'est un point que j'avais identifié mais que je n'ai jamais vraiment adressé. "
            "Ils reviennent quand ils reviennent — ou ne reviennent pas."
        ),
    },
    {
        "question_id": "q11",
        "mode": "A",
        "selected_option": "q11_c",
        "selected_option_label": "Je consulte la boîte de résultats moi-même, plusieurs fois par jour",
        "free_text": None,
        "complement_text": (
            "Je vérifie deux fois par jour depuis qu'un résultat biologique modérément urgent "
            "m'avait échappé quatre jours il y a six mois. Sans conséquence pour la patiente, "
            "mais l'épisode m'a marqué. C'est une vigilance personnelle qui repose sur moi "
            "seul."
        ),
    },
    {
        "question_id": "q12",
        "mode": "A",
        "selected_option": "q12_b",
        "selected_option_label": "Régulièrement, à la demande des patients, sans règle particulière",
        "free_text": None,
        "complement_text": (
            "3 à 5 par semaine. Je l'accepte quand un patient demande si le motif me paraît "
            "compatible. Pas de règle écrite ni d'horaire réservé."
        ),
    },
    {
        "question_id": "q13",
        "mode": "B",
        "selected_option": "q13_d",
        "selected_option_label": "Oui, j'utilise une IA grand public et je sais que ce n'est pas tout à fait conforme",
        "free_text": (
            "Oui, je l'utilise depuis six mois pour mes courriers complexes — typiquement les "
            "courriers de synthèse pour les spécialistes ou les comptes-rendus de visite à "
            "domicile. Je remplace les données identifiantes par des codes avant de coller le "
            "contexte. Mais je sais que ce n'est pas une garantie suffisante."
        ),
        "complement_text": (
            "C'est l'usage qui me met le plus mal à l'aise dans mon organisation actuelle. La "
            "dictée vocale classique existe, je l'utilise pour mes comptes-rendus standards, "
            "mais ce que je cherche en plus, c'est l'aide à la rédaction structurée."
        ),
    },
    {
        "question_id": "q14",
        "mode": "C",
        "selected_option": None,
        "selected_option_label": None,
        "free_text": (
            "Gagner du temps utile. Pas du temps de productivité — du temps libre pour mes "
            "proches, surtout en ce moment. Et idéalement sans avoir à apprendre un nouvel "
            "outil. Ce qui m'aiderait vraiment, c'est un environnement qui prendrait en charge "
            "ce que je fais déjà — y compris l'IA — mais de manière propre et conforme."
        ),
        "complement_text": None,
    },
]


def reset_database(email: str | None = None) -> None:
    """Supprime les sessions seeded.

    Si `email` est fourni, ne supprime que les données rattachées à cet
    email (sécurisé en prod). Sinon supprime tout (mode legacy V0).
    """
    db.init_db()  # garantit que les tables existent avant suppression

    if email:
        counts = db.delete_user_data(email)
        print(f"Données supprimées pour {email} : {counts}")
        return

    from sqlalchemy import text
    with db.get_engine().begin() as conn:
        conn.execute(text("DELETE FROM workstream"))
        conn.execute(text("DELETE FROM facet_score"))
        conn.execute(text("DELETE FROM answer"))
        conn.execute(text("DELETE FROM interview"))
    print("Toutes les sessions supprimées (mode legacy).")


def seed(email: str | None = None) -> int:
    """Crée une interview, insère les 14 réponses du persona, retourne l'id.

    Si `email` est fourni, l'interview est rattachée à cet email et sera
    accessible via l'auth lien magique sur l'accueil.
    """
    db.init_db()
    interview_id = db.create_interview(email=email)
    label = f" pour {email}" if email else " (anonyme legacy)"
    print(f"Interview créée — id={interview_id}{label}")

    for i, ans in enumerate(ANSWERS, start=1):
        db.save_answer(
            interview_id=interview_id,
            question_id=ans["question_id"],
            mode=ans["mode"],
            selected_option=ans["selected_option"],
            selected_option_label=ans["selected_option_label"],
            free_text=ans["free_text"],
            complement_text=ans["complement_text"],
        )
        print(f"  [{i:>2}/14] {ans['question_id']} (mode {ans['mode']}) inséré")

    total = len(ANSWERS)
    db.set_current_question_index(interview_id, total)
    # La session reste en `in_progress` avec index = total. Elle sera alors
    # proposée à la reprise depuis l'accueil et atterrira sur l'écran "Merci"
    # qui mène vers la page de résultats.

    print(f"Pointeur de session positionné à la fin (current_question_index={total})")
    print()
    print("Pour consulter cette session :")
    print("  1. Lancer le frontend (streamlit ou Next.js selon la version)")
    print("  2. Se connecter avec l'email utilisé pour le seed (lien magique)")
    print("  3. Sur l'accueil, cliquer 'Reprendre votre check-up'")
    print("  4. Sur l'écran 'Merci', cliquer 'Voir les résultats'")
    print()
    print(f"Raccourci direct (Next.js) : /resultats?interview={interview_id}")
    return interview_id


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--email",
        type=str,
        default=None,
        help=(
            "Email auquel rattacher l'interview seedée. Permet d'y accéder "
            "via l'auth lien magique. Si non fourni, l'interview est créée "
            "en mode anonyme legacy (compatible V0 Streamlit)."
        ),
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help=(
            "Supprime les données seeded avant de re-seed. Avec --email, "
            "ne supprime que les données de cet email (sûr en prod). "
            "Sans --email, supprime TOUTES les sessions (mode legacy)."
        ),
    )
    args = parser.parse_args()

    if args.reset:
        reset_database(email=args.email)

    seed(email=args.email)


if __name__ == "__main__":
    main()
