import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IN_DIR = ROOT / "class_to_species"   # folder containing {class_name}.txt
OUT = ROOT / "data" / "class_to_species.json"

def norm_species(s: str) -> str:
    s = s.strip()
    if not s:
        return ""
    # normalize to match your descriptor/image folder convention
    s = s.lower().replace(" ", "_")
    s = re.sub(r"_+", "_", s)
    return s

def norm_class_name(stem: str) -> str:
    # keep class key stable/consistent
    stem = stem.strip().lower().replace(" ", "_")
    stem = re.sub(r"_+", "_", stem)
    return stem

mapping = {}

for p in sorted(IN_DIR.glob("*.txt")):
    cls = norm_class_name(p.stem)   # "Rosaceae" -> "rosaceae"
    lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()

    species = [norm_species(x) for x in lines]
    species = [x for x in species if x]

    # de-dup while preserving order
    seen = set()
    uniq = []
    for x in species:
        if x not in seen:
            seen.add(x)
            uniq.append(x)

    mapping[cls] = uniq

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(mapping, indent=2), encoding="utf-8")
print(f"Wrote {len(mapping)} classes -> {OUT}")