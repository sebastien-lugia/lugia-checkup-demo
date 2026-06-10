"""Tests du placement & de la dérivation du substrat WSF (src/placement.py)."""
from src import placement

GRAPHE = {
 "objets": [
  {"id":"doctolib","composante":"TECHNOLOGIE","type":"ENTITE","label":"Doctolib","etat":"FONCTIONNEL","criticite":"IMPORTANT","axe":"outils_data_infra"},
  {"id":"crossway","composante":"TECHNOLOGIE","type":"ENTITE","label":"Crossway (logiciel médical)","etat":"A_RISQUE","criticite":"CRITIQUE","axe":"outils_data_infra"},
  {"id":"secretaire","composante":"PARTICIPANT","type":"ACTEUR","label":"Secrétaire","etat":"FONCTIONNEL","criticite":"IMPORTANT","axe":"equipe_rh"},
  {"id":"medecin","composante":"PARTICIPANT","type":"ACTEUR","label":"Dr Martin","etat":"FONCTIONNEL","criticite":"CRITIQUE","axe":"equipe_rh"},
  {"id":"prise_rdv","composante":"PROCESSUS","type":"ACTION","label":"Prise de RDV","etat":"FONCTIONNEL","criticite":"IMPORTANT","axe":"processus_admin"},
  {"id":"rappel","composante":"PROCESSUS","type":"FLUX","label":"Rappel automatique","etat":"FONCTIONNEL","criticite":"STANDARD","axe":"processus_admin"},
  {"id":"accueil","composante":"PROCESSUS","type":"ACTION","label":"Accueil","etat":"DEGRADE","criticite":"STANDARD","axe":"processus_admin"},
 ],
 "liaisons": [
  {"id":"l1","source":"secretaire","cible":"doctolib","type":"UTILISE","force":0.9,"delai":"IMMEDIAT"},
  {"id":"l2","source":"doctolib","cible":"crossway","type":"INTERFACE","force":0.8,"delai":"IMMEDIAT"},
  {"id":"l3","source":"medecin","cible":"crossway","type":"UTILISE","force":0.9,"delai":"IMMEDIAT"},
  {"id":"l4","source":"prise_rdv","cible":"rappel","type":"PRODUIT","force":0.7,"delai":"COURT_TERME"},
  {"id":"l5","source":"rappel","cible":"accueil","type":"ALIMENTE","force":0.7,"delai":"COURT_TERME"},
 ],
}

def test_placement_respecte_axe_emis():
    assert placement.placer(GRAPHE["objets"][0]) == "outils_data_infra"
    assert placement.placer(GRAPHE["objets"][4]) == "processus_admin"

def test_placement_fallback_et_socle():
    # axe absent → socle par mot-clé ("continuité" → equipe_rh)
    assert placement.placer({"composante":"PROCESSUS","label":"Continuité d'activité"}) == "equipe_rh"
    # axe absent, pas de mot-clé → fallback composante
    assert placement.placer({"composante":"CLIENT","label":"Un patient"}) == "parcours_client"
    # axe invalide → ignoré
    assert placement.placer({"composante":"PARTICIPANT","label":"X","axe":"bidon"}) == "equipe_rh"

def test_footprint():
    f = placement.footprint(GRAPHE)
    assert {o["label"] for o in f["outils_data_infra"]["objets"]} == {"Doctolib","Crossway (logiciel médical)"}
    assert {o["label"] for o in f["equipe_rh"]["objets"]} == {"Secrétaire","Dr Martin"}
    assert f["outils_data_infra"]["etat"] == "A_RISQUE"        # pire état (Crossway)
    # référence dérivée : Doctolib (outils) relié à Secrétaire (equipe) → référencé equipe_rh
    doctolib = next(o for o in f["outils_data_infra"]["objets"] if o["label"]=="Doctolib")
    assert "equipe_rh" in doctolib["référencé_dans"]

def test_chaine_de_valeur_ordre():
    ordre = [e["label"] for e in placement.chaine_de_valeur(GRAPHE)]
    assert ordre == ["Prise de RDV","Rappel automatique","Accueil"]

def test_signaux():
    sg = placement.signaux(GRAPHE)
    r02 = [s for s in sg if s["regle"]=="R02"]
    r03 = [s for s in sg if s["regle"]=="R03"]
    assert any("Crossway" in s["label"] for s in r02)          # point unique (CRITIQUE, indeg 2)
    assert any(set(s["objets"])>={"doctolib","crossway"} for s in r03)  # désalignement synchro

if __name__ == "__main__":
    import sys
    fns = [v for k,v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn(); print(f"  ✓ {fn.__name__}")
    print(f"\n{len(fns)} tests OK")
