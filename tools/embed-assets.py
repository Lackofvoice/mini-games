"""Generate the file-safe art bundle without modifying the source PNGs.

FFmpeg decodes the large optional strips. Frame alignment, nearest-neighbor
resampling, and PNG encoding use Python's standard library.
"""
import base64
import json
import hashlib
from pathlib import Path
import struct
import subprocess
import zlib


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "game_assets"
TAG_BODY_HEIGHT = 36
# Source size, frame count, normalized frame size, target opaque width.
STRIPS = {
    "taggy-fly": (2172, 724, 4, 144, 128, 96),
    "taggy-shoot": (2172, 724, 3, 144, 128, 96),
    "taggy-hit": (1774, 887, 2, 144, 128, 96),
    "drone": (2172, 724, 4, 96, 96, 72),
    "bird": (2172, 724, 4, 96, 96, 72),
    "cart": (2172, 724, 4, 120, 100, 96),
    "bill-projectile": (2172, 724, 4, 52, 52, 40),
    "coin": (2172, 724, 6, 48, 48, 36),
    "pop-fx": (2172, 724, 5, 96, 96, 80),
}


def encode_png(width, height, rgba):
    def chunk(kind, data):
        return struct.pack("!I", len(data)) + kind + data + struct.pack("!I", zlib.crc32(kind + data))

    rows = b"".join(b"\0" + rgba[start:start + 4 * width] for start in range(0, len(rgba), 4 * width))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack("!IIBBBBB", width, height, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(rows, 9)) + chunk(b"IEND", b""))


def strip_png(path, geometry):
    width, height, count, frame_w, frame_h, target_w = geometry
    source = subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(path), "-frames:v", "1",
        "-pix_fmt", "rgba", "-f", "rawvideo", "-"
    ])
    if struct.unpack("!II", path.read_bytes()[16:24]) != (width, height) or len(source) != width * height * 4:
        raise ValueError(f"{path.name}: unexpected source geometry")

    frames = []
    taggy = path.stem.startswith("taggy-")
    for i in range(count):
        # Compute both edges from the exact strip fraction, including 434.4 px cells.
        left, right = round(i * width / count), round((i + 1) * width / count)
        xs, ys, body_x, body_y = [], [], [], []
        for y in range(height):
            for x in range(left, right):
                j = (y * width + x) * 4
                if source[j + 3] < 96:
                    continue
                xs.append(x)
                ys.append(y)
                if taggy and source[j] > 120 and source[j] > 1.65 * max(source[j + 1], source[j + 2]):
                    body_x.append(x)
                    body_y.append(y)
        if not xs:
            raise ValueError(f"{path.name}: frame {i + 1} has no visible pixels")
        bounds = (min(xs), min(ys), max(xs), max(ys))
        if body_x:
            anchor = ((min(body_x) + max(body_x)) / 2, (min(body_y) + max(body_y)) / 2)
        else:
            anchor = ((bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2)
        body_height = max(body_y) - min(body_y) + 1 if body_y else bounds[3] - bounds[1] + 1
        frames.append((left, right, bounds, anchor, body_height))

    if taggy:
        scales = [TAG_BODY_HEIGHT / frame[4] for frame in frames]
        print(f"{path.stem}: " + ", ".join(f"{scale:.6f}" for scale in scales))
    else:
        scale = target_w / max(b[2] - b[0] + 1 for _, _, b, _, _ in frames)
        for _, _, (x0, y0, x1, y1), (ax, ay), _ in frames:
            scale = min(scale, (frame_w / 2 - 2) / max(ax - x0, x1 - ax, 1),
                        (frame_h / 2 - 2) / max(ay - y0, y1 - ay, 1))
        scales = [scale] * count

    sheet_w = count * frame_w
    sheet = bytearray(sheet_w * frame_h * 4)
    for i, ((left, right, (x0, y0, x1, y1), (ax, ay), _), scale) in enumerate(zip(frames, scales)):
        if max(ax - x0, x1 - ax) * scale >= frame_w / 2 or max(ay - y0, y1 - ay) * scale >= frame_h / 2:
            raise ValueError(f"{path.name}: frame {i + 1} exceeds its normalized cell")
        for y in range(frame_h):
            sy = round(ay + (y + 0.5 - frame_h / 2) / scale)
            if not 0 <= sy < height:
                continue
            for x in range(frame_w):
                sx = round(ax + (x + 0.5 - frame_w / 2) / scale)
                if left <= sx < right:
                    start = (sy * width + sx) * 4
                    dest = (y * sheet_w + i * frame_w + x) * 4
                    sheet[dest:dest + 4] = source[start:start + 4]
    return encode_png(sheet_w, frame_h, sheet)


def data_uri(png):
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


files = {
    "taggy-idle-right": "taggy/taggy_idle.png",
    "taggy-walk-right": "taggy/taggy_walk.png",
    "taggy-idle-left": "taggy/taggy_idle_l.png",
    "taggy-walk-left": "taggy/taggy_walk_l.png",
    "taggy-keys": "taggy/taggy_keys.png",
}
files.update({p.stem: p.relative_to(ASSETS) for p in sorted((ASSETS / "simlab").glob("*.png"))})
uris = {key: data_uri((ASSETS / path).read_bytes()) for key, path in files.items()}
for key, geometry in STRIPS.items():
    path = ROOT / "assets" / "sprites" / (key + ".png")
    if path.is_file():
        uris[key] = data_uri(strip_png(path, geometry))
# Keep original background sheets intact for file:// and validate the cell grid at runtime.
for key, dimensions in {
    "rv-lot-set": (512, 256),
    "foliage-set": (512, 256),
    "overhead-hazard": (512, 128),
    "lot-life": (512, 256),
    **{f"boss-{name}": (1024, 256)
       for name in ("lowballer", "tirekicker", "greeter", "warranty", "invoice", "merger")},
}.items():
    path = ROOT / "assets" / "sprites" / (key + ".png")
    if key == "rv-lot-set" and not path.is_file():
        path = ROOT / "assets" / "sprites" / "assets" / "sprites" / path.name
    if not path.is_file():
        continue
    png = path.read_bytes()
    if png.startswith(b"\x89PNG\r\n\x1a\n") and len(png) >= 33 and struct.unpack("!II", png[16:24]) == dimensions:
        uris[key] = data_uri(png)
    else:
        print(f"Skipping {path.name}: expected a {dimensions[0]}x{dimensions[1]} PNG")
(ASSETS / "embedded-assets.js").write_text(
    "// Generated by tools/embed-assets.py.\nwindow.RV_DASH_EMBEDDED = "
    + json.dumps(uris, indent=4) + ";\n",
    encoding="ascii",
    newline="\n",
)

# Keep the source archives local. Commit only the file-safe, feathered upper-world derivatives.
themes = {
    "nostalgiawave": .67, "dreamwave": .76, "outrun": .66, "rad": .61,
    "vapor": .69, "tokyo": .60, "futuresynth": .61, "bitwave": .57, "darksynth": .66,
}
theme_assets = {}
manifest = []
for name, fraction in themes.items():
    originals = []
    for index in range(1, 4):
        matches = sorted(ROOT.glob(f"assets/rvdash-tow-part*/tow/{name}-tow-{index}.png"))
        if len(matches) != 1:
            continue
        path = matches[0]
        png = path.read_bytes()
        width, height, depth, color = struct.unpack("!IIBB", png[16:26])
        originals.append(dict(frame=index, path=path.relative_to(ROOT).as_posix(),
                              width=width, height=height, bit_depth=depth, png_color_type=color,
                              bytes=len(png), sha256=hashlib.sha256(png).hexdigest()))
    row = {"theme": name, "originals": originals}
    manifest.append(row)
    original = next((frame for frame in originals if frame["frame"] == 1), None)
    if original is None:
        continue
    width, height = original["width"], original["height"]
    crop = round(height * fraction)
    target_w, target_h = 540, round(crop * 540 / width)
    rgba = bytearray(subprocess.check_output([
        "ffmpeg", "-v", "error", "-i", str(ROOT / original["path"]), "-frames:v", "1",
        "-vf", f"crop={width}:{crop}:0:0:exact=1,scale={target_w}:{target_h}:flags=neighbor",
        "-pix_fmt", "rgba", "-f", "rawvideo", "-"
    ]))
    canvas_h = 387
    padding = canvas_h - target_h
    # Extend only the sky color. The landscape pixels keep their original aspect.
    sample = [rgba[(min(12, target_h - 1) * target_w + x) * 4:
                   (min(12, target_h - 1) * target_w + x) * 4 + 3]
              for x in range(target_w // 4, target_w * 3 // 4)]
    sky = [round(sum(pixel[channel] for pixel in sample) / len(sample)) for channel in range(3)]
    pixels = bytearray()
    for y in range(padding):
        shade = .53 + .47 * y / max(1, padding - 1)
        pixels.extend(bytes([*(round(c * shade) for c in sky), 255]) * target_w)
    for y in range(target_h):
        for x in range(target_w):
            index = (y * target_w + x) * 4
            mix = min(1, y / 30)
            rgb = [round(sky[channel] * (1 - mix) + rgba[index + channel] * mix) for channel in range(3)]
            alpha = round(rgba[index + 3] * min(1, (target_h - 1 - y) / 30))
            pixels.extend((*rgb, alpha))
    image = encode_png(target_w, canvas_h, pixels)
    theme_assets[name] = data_uri(image)
    row["derivative"] = dict(source_frame=1, crop=[0, 0, width, crop], width=target_w,
                             height=canvas_h, content_height=target_h, bytes=len(image), sha256=hashlib.sha256(image).hexdigest())
if theme_assets:
    (ASSETS / "tow-themes.js").write_text(
        "// Generated by tools/embed-assets.py.\nwindow.RV_DASH_TOW_THEMES = "
        + json.dumps(theme_assets, indent=4) + ";\n", encoding="ascii", newline="\n")
    (ASSETS / "tow-themes-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="ascii", newline="\n")
