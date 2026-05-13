"""Seed un parcours type Dr Chateau dans la base SQLite locale.

Crée une nouvelle interview, insère les 14 réponses du persona de référence
(voir `resources/sample_answers_pchateau.md`), positionne le pointeur de
session à la fin du questionnaire, et laisse la session en `in_progress`
pour qu'elle soit accessible via "Reprendre votre check-up" sur l'accueil.

Utilitaire de développement pour itérer sur V0-4 (scoring et restitution)
sans rejouer le questionnaire à chaque fois.

Lancement :
    python scripts/seed_persona.py
    python scripts/seed_persona.py --reset   # supprime les sessions existantes
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
        "selected_option_label": "Oui, externalisé (télésecrétariat médical)",
        "free_text": None,
        "complement_text": "Depuis 18 mois, après le départ de Catherine qui était en interne pendant 8 ans.",
    },
    {
        "question_id": "q03",
        "mode": "A",
        "selected_option": "q03_c",
        "selected_option_label": "Je ne sais pas précisément, je leur fais confiance",
        "free_text": None,
        "complement_text": "Je leur ai brièvement expliqué mon fonctionnement au démarrage, on en est resté là. Quelques RDV mal orientés de temps en temps, rien d'alarmant.",
    },
    {
        "question_id": "q04",
        "mode": "B",
        "selected_option": "q04_d",
        "selected_option_label": "Plusieurs canaux dont certains me parviennent en direct (mobile, SMS, mail)",
        "free_text": (
            "Principalement Doctolib pour la majorité des nouveaux RDV, et le télésecrétariat "
            "pour les appels téléphoniques. J'ai aussi quelques patients qui me sollicitent en "
            "direct par mail ou SMS, plutôt des suivis longs avec qui j'ai une relation établie."
        ),
        "complement_text": (
            "Je sais que ce n'est pas idéal mais je ne veux pas couper le lien avec ceux qui "
            "m'écrivent depuis des années."
        ),
    },
    {
        "question_id": "q05",
        "mode": "B",
        "selected_option": "q05_d",
        "selected_option_label": "Beaucoup, je termine fréquemment chez moi le soir ou le week-end",
        "free_text": (
            "Je traite ce que je peux entre les consultations — les courriers via Lifen pour les "
            "spécialistes, les ordonnances en consultation. Le reste, les renouvellements, "
            "certains résultats, je m'en occupe le soir."
        ),
        "complement_text": (
            "Pas tous les soirs, mais souvent. Je le fais parce que ça ne se voit pas le "
            "lendemain et que ça reste tenable pour moi."
        ),
    },
    {
        "question_id": "q06",
        "mode": "C",
        "selected_option": None,
        "selected_option_label": None,
        "free_text": (
            "Un confrère m'a parlé de Lugia il y a quelques semaines. J'avais besoin de prendre "
            "un peu de recul sur mon organisation, dans un contexte familial qui me pousse à me "
            "poser des questions sans rentrer dans les détails. Et je m'intéresse depuis "
            "longtemps à l'IA pour le cabinet — je voulais comprendre où j'en suis avant "
            "d'ajouter un outil de plus."
        ),
        "complement_text": None,
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
        "selected_option_label": "Personne ne saurait précisément quoi faire, le cabinet serait à l'arrêt",
        "free_text": None,
        "complement_text": (
            "C'est probablement le point le plus inconfortable de ma situation actuelle. Une "
            "semaine d'arrêt et tout s'arrête. Je n'ai jamais vraiment fait l'expérience d'un "
            "arrêt long."
        ),
    },
    {
        "question_id": "q09",
        "mode": "A",
        "selected_option": "q09_d",
        "selected_option_label": "Beaucoup d'outils en parallèle, avec de la double saisie résiduelle",
        "free_text": None,
        "complement_text": (
            "Maiia comme logiciel métier, Doctolib pour les RDV, Lifen pour les courriers "
            "spécialistes, MSSanté/Mailiz pour la messagerie sécurisée, Mon Sisra, Mediadict "
            "pour la dictée. Tout fonctionne mais entre Doctolib et Maiia il y a encore de la "
            "double saisie pour les nouveaux patients."
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
        "mode": "B",
        "selected_option": "q11_d",
        "selected_option_label": "Il y a déjà eu un retard, je sais que cela peut arriver",
        "free_text": (
            "Les résultats arrivent dans Maiia et dans Mailiz, je les traite en général le soir "
            "ou pendant les pauses. Mon télésecrétariat ne fait pas de pré-tri sur ce flux. J'ai "
            "eu un retard il y a six mois sur un résultat biologique modérément urgent que j'ai "
            "vu quatre jours après — sans conséquence pour la patiente, mais cet épisode m'a "
            "marqué."
        ),
        "complement_text": (
            "Depuis, je vérifie deux fois par jour. Mais ce n'est pas un système, c'est une "
            "vigilance personnelle qui repose sur moi seul."
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
        "selected_option_label": "Oui, j'utilise ChatGPT ou similaire et je sais que ce n'est pas tout à fait conforme",
        "free_text": (
            "Oui, j'utilise ChatGPT depuis six mois pour mes courriers complexes — typiquement "
            "les courriers de synthèse pour les spécialistes ou les comptes-rendus de visite à "
            "domicile. Je fais attention : je remplace les données identifiantes par des codes "
            "avant de coller le contexte. Mais je sais que ce n'est pas une garantie suffisante."
        ),
        "complement_text": (
            "C'est l'usage qui me met le plus mal à l'aise dans mon organisation actuelle. La "
            "dictée vocale classique existe, je l'utilise pour mes comptes-rendus standards, "
            "mais ce que je cherche avec ChatGPT c'est l'aide à la rédaction structurée — et ça "
            "la dictée ne le fait pas."
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


def reset_database() -> None:
    """Supprime toutes les sessions, réponses, scores et chantiers existants."""
    with db.get_connection() as conn:
        conn.execute("DELETE FROM workstream")
        conn.execute("DELETE FROM facet_score")
        conn.execute("DELETE FROM answer")
        conn.execute("DELETE FROM interview")
    print("Sessions existantes supprimées.")


def seed() -> int:
    """Crée une interview, insère les 14 réponses du persona, retourne l'id."""
    db.init_db()
    interview_id = db.create_interview()
    print(f"Interview créée — id={interview_id}")

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
    print("  1. Lancer `streamlit run app.py`")
    print("  2. Sur l'accueil, cliquer 'Reprendre votre check-up'")
    print("  3. Sur l'écran 'Merci', cliquer 'Voir les résultats'")
    return interview_id


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Supprime toutes les sessions existantes avant de seed",
    )
    args = parser.parse_args()

    if args.reset:
        reset_database()

    seed()


if __name__ == "__main__":
    main()
