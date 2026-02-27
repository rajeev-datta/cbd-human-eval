# tools/build_manifest.py
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
OUT = ROOT / "data" / "images_index.json"

class_map = json.loads((ROOT/"data"/"class_to_species.json").read_text(encoding="utf-8"))
species_to_class = {}
for cls, sp_list in class_map.items():
    for sp in sp_list:
        species_to_class[sp] = cls

ALLOWED = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

items = []
for species_dir in sorted([p for p in IMAGES_DIR.iterdir() if p.is_dir()]):
    species = species_dir.name
    cls = species_to_class.get(species)  # string like "rosaceae"
    for img in sorted([p for p in species_dir.rglob("*") if p.suffix.lower() in ALLOWED]):
        rel = img.relative_to(ROOT).as_posix()
        items.append({
            "image_path": rel,
            "species": species,
            "class_name": cls
        })

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(items, indent=2), encoding="utf-8")
print(f"Wrote {len(items)} items -> {OUT}")