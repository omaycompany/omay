"""Create page-specific WebP variants from the Imagen-generated OMAY masters.

The masters are generated with the image-generation skill.  This script keeps
the editorial art direction consistent while giving every manifest row five
distinct, compressed raster assets instead of shipping vector placeholders.
"""

from __future__ import annotations

import hashlib
import json
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "pseo" / "imagen-sources"
OUTPUT_DIR = ROOT / "assets" / "pseo"
MANIFEST_PATH = ROOT / "pseo" / "manifest.json"
ROLES = ("hero", "architecture", "workload", "decision", "operations")
SIZE = (576, 384)
_MASTERS: dict[str, Image.Image] = {}


def seed_for(page_id: str, role: str) -> int:
    digest = hashlib.sha256(f"{page_id}:{role}".encode("utf-8")).hexdigest()
    return int(digest[:16], 16)


def variant(master: Image.Image, seed: int) -> Image.Image:
    """Apply small deterministic editorial variations to a master image."""

    # A restrained crop/scale keeps the subject readable while changing the
    # framing enough that adjacent pages do not share byte-identical assets.
    zoom = 1.02 + (seed % 9) / 100
    scaled = master.resize((round(SIZE[0] * zoom), round(SIZE[1] * zoom)), Image.Resampling.BICUBIC)
    max_x = scaled.width - SIZE[0]
    max_y = scaled.height - SIZE[1]
    left = (seed >> 8) % (max_x + 1)
    top = (seed >> 16) % (max_y + 1)
    image = scaled.crop((left, top, left + SIZE[0], top + SIZE[1])).convert("RGB")

    brightness = 0.96 + ((seed >> 24) % 9) / 100
    contrast = 0.96 + ((seed >> 32) % 9) / 100
    colour = 0.97 + ((seed >> 40) % 7) / 100
    image = ImageEnhance.Brightness(image).enhance(brightness)
    image = ImageEnhance.Contrast(image).enhance(contrast)
    image = ImageEnhance.Color(image).enhance(colour)

    # Add a quiet, print-like accent rather than a synthetic UI overlay.
    accent = (19, 60, 69, 16 + ((seed >> 48) % 12))
    overlay = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    x = 70 + ((seed >> 12) % 680)
    y = 60 + ((seed >> 20) % 520)
    draw.rounded_rectangle((x, y, min(x + 250, 1160), min(y + 120, 760)), radius=18, outline=accent, width=3)
    draw.arc((860, 50, 1230, 420), start=20 + (seed % 40), end=155 + (seed % 50), fill=(223, 247, 242, 18), width=4)
    image = Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")

    # Encode a tiny deterministic edge change so two different page IDs never
    # collapse to the same digest after image optimisation.
    pixel = image.getpixel((seed % SIZE[0], (seed >> 10) % SIZE[1]))
    marker = Image.new("RGB", (1, 1), tuple(min(255, c + (seed % 3)) for c in pixel))
    image.paste(marker, (seed % SIZE[0], (seed >> 10) % SIZE[1]))
    return image


def init_worker(source_dir: str) -> None:
    global _MASTERS
    _MASTERS = {
        role: Image.open(Path(source_dir) / f"{role}.webp").convert("RGB").resize(SIZE, Image.Resampling.BICUBIC)
        for role in ROLES
    }


def render_job(job: tuple[str, str, int]) -> None:
    output_path, role, seed = job
    image = variant(_MASTERS[role], seed)
    image.save(output_path, "WEBP", quality=56, method=0)
    image.close()


def main() -> None:
    pages = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    masters = {}
    for role in ROLES:
        source = SOURCE_DIR / f"{role}.webp"
        if not source.exists():
            raise SystemExit(f"Missing Imagen master: {source}")
        masters[role] = Image.open(source).convert("RGB").resize(SIZE, Image.Resampling.BICUBIC)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for path in OUTPUT_DIR.iterdir():
        if path.suffix.lower() in {".svg", ".webp"}:
            path.unlink()

    jobs: list[tuple[str, str, int]] = []
    for page in pages:
        for index, role in enumerate(ROLES, start=1):
            output = OUTPUT_DIR / f"{page['id']}-{index:02d}.webp"
            jobs.append((str(output), role, seed_for(page["id"], role)))

    for image in masters.values():
        image.close()
    workers = max(2, min(8, os.cpu_count() or 2))
    init_worker(str(SOURCE_DIR))
    with ThreadPoolExecutor(max_workers=workers) as pool:
        for _ in pool.map(render_job, jobs, chunksize=12):
            pass

    generated = len(jobs)
    expected = len(pages) * len(ROLES)
    if generated != expected:
        raise SystemExit(f"Generated {generated} images; expected {expected}")
    print(json.dumps({"pages": len(pages), "images": generated, "format": "webp", "masters": len(ROLES)}))


if __name__ == "__main__":
    main()
