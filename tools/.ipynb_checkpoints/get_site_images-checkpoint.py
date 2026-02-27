from pathlib import Path
from PIL import Image

src_dir = Path("/home/rd635/classification_by_schema/cbd-human-eval.github.io/images")
dst_dir = Path("/home/rd635/classification_by_schema/cbd-human-eval.github.io/site_images")

MAX_SIDE = 1024
QUALITY = 85

for p in src_dir.rglob("*"):
    if not p.is_file():
        continue
    if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
        continue

    print("Processing:", p)

    # Preserve folder structure
    relative_path = p.relative_to(src_dir)
    out_path = dst_dir / relative_path

    # Ensure output subdirectory exists
    out_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        im = Image.open(p).convert("RGB")
        w, h = im.size
        scale = min(MAX_SIDE / max(w, h), 1.0)

        if scale < 1.0:
            im = im.resize(
                (int(w * scale), int(h * scale)),
                Image.Resampling.LANCZOS
            )

        # Always save as JPEG (smaller + consistent)
        out_path = out_path.with_suffix(".jpg")

        im.save(
            out_path,
            "JPEG",
            quality=QUALITY,
            optimize=True,
            progressive=True
        )

    except Exception as e:
        print("❌ Failed:", p, e)