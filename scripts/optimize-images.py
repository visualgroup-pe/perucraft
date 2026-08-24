#!/usr/bin/env python3
"""Reproducible image optimisation for Perú Crafted Experiences.

Generates responsive WebP variants (400 / 800 / 1600 px, never upscaled) for
every JPEG in assets/img/, keeping the original JPEGs as <picture> fallbacks,
and writes assets/img/.webp-manifest.json (dimensions + variants) used by the
build/markup. Requires Pillow (`pip install pillow`).

Usage:  python scripts/optimize-images.py
"""
import os, glob, json
from PIL import Image

IMG_DIR = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
WIDTHS = (400, 800, 1600)
EXCLUDE = {"patty2.jpeg"}  # raw source not used on the site


def main():
    srcs = [f for f in glob.glob(os.path.join(IMG_DIR, "*.jpg")) + glob.glob(os.path.join(IMG_DIR, "*.jpeg"))
            if os.path.basename(f) not in EXCLUDE]
    manifest = {}
    for f in srcs:
        im = Image.open(f).convert("RGB")
        W, H = im.size
        base = os.path.splitext(f)[0]
        widths = [w for w in WIDTHS if w < W]
        if W not in widths:
            widths.append(W)
        variants = []
        for w in sorted(set(widths)):
            h = round(H * w / W)
            out = f"{base}-{w}.webp"
            im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
            variants.append([w, os.path.basename(out)])
        manifest[os.path.basename(f)] = {"w": W, "h": H, "variants": variants}
    with open(os.path.join(IMG_DIR, ".webp-manifest.json"), "w") as fh:
        json.dump(manifest, fh, indent=0)
    print(f"Optimised {len(srcs)} images -> {sum(len(v['variants']) for v in manifest.values())} WebP files.")


if __name__ == "__main__":
    main()
