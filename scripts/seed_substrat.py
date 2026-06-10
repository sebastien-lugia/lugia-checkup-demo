#!/usr/bin/env python3
"""
Seed d'un substrat WSF de démo dans la table `substrat`, pour afficher la
restitution (capability map + carte vivante) en prod SANS conversation LLM.

Usage :
    source .venv/bin/activate
    PYTHONPATH=. python scripts/seed_substrat.py --interview 42 [--module admin] [--email medecin@ex.fr]

L'email par défaut est celui du propriétaire de l'interview. Ouvre ensuite la
page de résultats de cette interview : le bloc « carte de capacité » apparaît.
"""
from __future__ import annotations
import argparse, json
from src import db, placement

# Graphe WSF de démo (chantier « Prise de RDV & synchronisation agenda »),
# au format émis par l'agent (nodes/edges) + axe par nœud (socle).
GRAPHE = {
    "titre": "Prise de RDV & synchronisation agenda",
    "nodes": [
        {"id": "n1", "composante": "TECHNOLOGIE", "type": "ENTITE", "label": "Doctolib", "etat": "FONCTIONNEL", "criticite": "IMPORTANT", "axe": "outils_data_infra"},
        {"id": "n2", "composante": "TECHNOLOGIE", "type": "ENTITE", "label": "Logiciel médical (Crossway)", "etat": "A_RISQUE", "criticite": "CRITIQUE", "axe": "outils_data_infra"},
        {"id": "n3", "composante": "PARTICIPANT", "type": "ACTEUR", "label": "Secrétaire", "etat": "FONCTIONNEL", "criticite": "IMPORTANT", "axe": "equipe_rh"},
        {"id": "n4", "composante": "PARTICIPANT", "type": "ACTEUR", "label": "Médecin", "etat": "FONCTIONNEL", "criticite": "CRITIQUE", "axe": "equipe_rh"},
        {"id": "n5", "composante": "PROCESSUS", "type": "ACTION", "label": "Prise de RDV", "etat": "FONCTIONNEL", "criticite": "IMPORTANT", "axe": "processus_admin"},
        {"id": "n6", "composante": "PROCESSUS", "type": "FLUX", "label": "Rappel automatique", "etat": "FONCTIONNEL", "criticite": "STANDARD", "axe": "processus_admin"},
        {"id": "n7", "composante": "PROCESSUS", "type": "ACTION", "label": "Accueil", "etat": "DEGRADE", "criticite": "STANDARD", "axe": "processus_admin"},
    ],
    "edges": [
        {"id": "e1", "source": "n3", "cible": "n1", "type": "UTILISE", "force": 0.9, "delai": "IMMEDIAT"},
        {"id": "e2", "source": "n1", "cible": "n2", "type": "INTERFACE", "force": 0.8, "delai": "IMMEDIAT"},
        {"id": "e3", "source": "n4", "cible": "n2", "type": "UTILISE", "force": 0.9, "delai": "IMMEDIAT"},
        {"id": "e4", "source": "n5", "cible": "n6", "type": "PRODUIT", "force": 0.7, "delai": "COURT_TERME"},
        {"id": "e5", "source": "n6", "cible": "n7", "type": "ALIMENTE", "force": 0.7, "delai": "COURT_TERME"},
    ],
}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--interview", type=int, required=True)
    ap.add_argument("--module", default="admin")
    ap.add_argument("--email", default=None)
    args = ap.parse_args()

    db.init_db()
    email = args.email
    if not email:
        itw = db.get_interview(args.interview)
        if not itw:
            raise SystemExit(f"Interview {args.interview} introuvable.")
        email = itw.get("email")
        if not email:
            raise SystemExit("Interview sans email — passe --email explicitement.")

    derive = placement.derive(GRAPHE)
    db.upsert_substrat(
        args.interview, args.module, email,
        graphe_json=json.dumps(GRAPHE, ensure_ascii=False),
        derive_json=json.dumps(derive, ensure_ascii=False),
        source="seed-demo",
    )
    foot = sorted(derive["footprint"].keys())
    print(f"✓ Substrat seedé : interview={args.interview} module={args.module} email={email}")
    print(f"  axes allumés : {foot}")
    print(f"  ruban : {[e['label'] for e in derive['chaine_de_valeur']]}")
    print(f"  signaux : {[s['regle'] for s in derive['signaux']]}")
    print("  → ouvre la page de résultats de cette interview pour voir la restitution.")


if __name__ == "__main__":
    main()
