"""Génère wireframes/checkup_v2_demo_interactif.html — prototype navigable
complet de la V2.0 actuelle, avec données embarquées (no backend, no auth).

Usage : python3 scripts/build_demo_html.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
proto = json.loads((ROOT / "resources/interview_protocol_v2.json").read_text())
diag = json.loads((ROOT / "resources/diagnostics_v2.json").read_text())
mods = json.loads((ROOT / "resources/modules_v2.json").read_text())

DATA_JSON = json.dumps({"protocol": proto, "diagnostics": diag, "modules": mods}, ensure_ascii=False)

# Le HTML/CSS/JS du prototype est dans un fichier séparé pour rester lisible.
template_path = ROOT / "scripts" / "demo_template.html"
template = template_path.read_text()

out = template.replace("/*__DATA__*/", DATA_JSON)
out_path = ROOT / "wireframes/checkup_v2_demo_interactif.html"
out_path.write_text(out, encoding="utf-8")
print(f"✓ généré : {out_path}")
print(f"  taille : {len(out):,} chars ({len(out.splitlines())} lignes)")
