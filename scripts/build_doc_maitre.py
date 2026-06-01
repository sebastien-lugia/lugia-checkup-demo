"""
Génère deux versions PDF du Document maître Lugia depuis le HTML source unique :
  - version INTERNE complète (tout visible, y compris .strict-interne)
  - version CLIENT épurée (les éléments .strict-interne sont masqués)

Usage :
    python3 scripts/build_doc_maitre.py
"""
import sys
from pathlib import Path
from weasyprint import HTML, CSS

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "etudes" / "Lugia_Document_Maitre.html"
OUT_INTERNE = ROOT / "etudes" / "Lugia_Document_Maitre_INTERNE.pdf"
OUT_CLIENT  = ROOT / "etudes" / "Lugia_Document_Maitre_CLIENT.pdf"

if not SRC.exists():
    print(f"ERROR: source HTML not found at {SRC}", file=sys.stderr)
    sys.exit(1)

# Version interne : aucun override CSS
print(f"→ Génération version INTERNE  : {OUT_INTERNE.name}")
HTML(filename=str(SRC)).write_pdf(str(OUT_INTERNE))

# Version client : masque les éléments .strict-interne via stylesheet additionnelle
client_override = CSS(string="""
    .strict-interne { display: none !important; }
""")
print(f"→ Génération version CLIENT   : {OUT_CLIENT.name}")
HTML(filename=str(SRC)).write_pdf(str(OUT_CLIENT), stylesheets=[client_override])

# Vérif rapide
from pypdf import PdfReader
import warnings
warnings.filterwarnings("ignore")
n_int = len(PdfReader(str(OUT_INTERNE)).pages)
n_cli = len(PdfReader(str(OUT_CLIENT)).pages)
print(f"\n✓ INTERNE : {n_int} pages · {OUT_INTERNE.stat().st_size // 1024} KB")
print(f"✓ CLIENT  : {n_cli} pages · {OUT_CLIENT.stat().st_size // 1024} KB")
print(f"\nÉcart pages (interne − client) : {n_int - n_cli}")
