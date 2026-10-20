"""Rendu des croquis de composition (images à joindre à Gemini) à partir de scenes.py.

Usage : python3 tools/croquis/render.py
Produit design/croquis/*.png, design/croquis/legende.png et design/scenes.json.
Les étiquettes sont en anglais : Gemini les comprend mieux.
"""

import json
import os
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(__file__))
from scenes import SCENES  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'design', 'croquis')
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

SIZES = {'coupe': (2520, 1080), 'macro': (1920, 1080), 'dessus': (1920, 1080)}

C = {
    'bg': (150, 150, 155),
    'frame': (122, 84, 58),
    'floor': (242, 140, 40),
    'tile': (242, 140, 40),
    'ladder': (242, 212, 61),
    'door': (142, 92, 245),
    'prop': (74, 144, 217),
    'hide': (61, 190, 122),
    'special': (224, 72, 72),
    'light': (255, 236, 150),
    'shadow': (55, 55, 62),
    'fg': (20, 20, 22),
    'exit': (35, 196, 217),
    'walk': (242, 140, 40),
    'text': (255, 255, 255),
    'ink': (25, 25, 30),
}


def font(size):
    return ImageFont.truetype(FONT, size)


def label(d, box, text, size=28, color=None, W=None):
    x1, y1, x2, y2 = box
    # Garde l'étiquette dans l'image.
    if W:
        if x1 < 6:
            x2, x1 = x2 + 6 - x1, 6
        if x2 > W - 6:
            x1, x2 = x1 - (x2 - W + 6), W - 6
    w = max(1, x2 - x1)
    # Réduit la police jusqu'à ce que chaque mot tienne sur sa ligne, sans couper les mots.
    while True:
        f = font(size)
        chars = max(4, int(w / (size * 0.62)))
        lines = textwrap.wrap(text.upper(), chars, break_long_words=False) or ['']
        if size <= 14 or max(d.textlength(l, font=f) for l in lines) <= w:
            break
        size -= 2
    total = len(lines) * (size + 4)
    y = (y1 + y2) / 2 - total / 2
    for line in lines:
        tw = d.textlength(line, font=f)
        d.text(((x1 + x2) / 2 - tw / 2, y), line, font=f, fill=color or C['text'], stroke_width=3, stroke_fill=C['ink'])
        y += size + 4


def render(scene):
    W, H = SIZES[scene['view']]
    img = Image.new('RGB', (W, H), C['bg'])
    over = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(over)
    els = scene['elements']
    # Zones d'ombre et cônes de lumière, en transparence.
    for e in els:
        k = e['kind']
        if k == 'shadow':
            od.rectangle(e['rect'], fill=C['shadow'] + (170,))
        elif k == 'light':
            x, y = e['at']
            r = e.get('r', 26)
            if 'cone' in e:
                bottom, half = e['cone']
                od.polygon([(x - r * 0.6, y), (x + r * 0.6, y), (x + half, bottom), (x - half, bottom)], fill=C['light'] + (80,))
            od.ellipse([x - r, y - r, x + r, y + r], fill=C['light'] + (255,))
        elif k == 'walk':
            od.polygon(e['poly'], fill=C['walk'] + (110,), outline=C['walk'] + (255,), width=6)
    img = Image.alpha_composite(img.convert('RGBA'), over)
    d = ImageDraw.Draw(img)
    for e in els:
        k = e['kind']
        if k == 'frame':
            d.rectangle(e['rect'], fill=C['frame'])
        elif k == 'floor':
            x1, x2, y = e['x1'], e['x2'], e['y']
            d.rectangle([x1, y, x2, y + 18], fill=C['floor'], outline=C['ink'], width=2)
        elif k == 'ladder':
            x, y1, y2 = e['x'], e['top'], e['bottom']
            d.line([x - 22, y1, x - 22, y2], fill=C['ladder'], width=8)
            d.line([x + 22, y1, x + 22, y2], fill=C['ladder'], width=8)
            for yy in range(int(y1) + 20, int(y2), 30):
                d.line([x - 22, yy, x + 22, yy], fill=C['ladder'], width=6)
        elif k == 'stairs':
            x1, y1, x2, y2 = e['from'] + e['to']
            n = e.get('steps', 6)
            if n == 1:
                # Pente continue (rampe, toboggan) : une bande épaisse.
                d.line([x1, y1, x2, y2], fill=C['ladder'], width=34)
                continue
            for i in range(n):
                sx = x1 + (x2 - x1) * i / n
                sy = y1 + (y2 - y1) * (i + 1) / n
                d.rectangle([min(sx, sx + (x2 - x1) / n), min(sy, y1), max(sx, sx + (x2 - x1) / n), max(sy, y1)], fill=C['ladder'], outline=C['ink'], width=2)
        elif k in ('door', 'prop', 'hide', 'special', 'tile'):
            x1, y1, x2, y2 = e['rect']
            if e.get('round'):
                d.ellipse(e['rect'], fill=C[k], outline=C['ink'], width=3)
            else:
                d.rectangle(e['rect'], fill=C[k], outline=C['ink'], width=3)
    for e in els:
        k = e['kind']
        if k == 'fg':
            y = e['y']
            pts = [(0, H)]
            for i, (x, h) in enumerate(e.get('shapes', [(0, 0)])):
                pts += [(x, y - h), (x + e.get('w', 160), y - h)]
            pts += [(W, H)]
            d.rectangle([0, y, W, H], fill=C['fg'])
            for x, h in e.get('shapes', []):
                d.rectangle([x, y - h, x + e.get('w', 160), y], fill=C['fg'])
        elif k == 'exit':
            x, y = e['at']
            dx, dy = {'left': (-1, 0), 'right': (1, 0), 'up': (0, -1), 'down': (0, 1)}[e['dir']]
            L = 110
            d.line([x, y, x + dx * L, y + dy * L], fill=C['exit'], width=14)
            hx, hy = x + dx * L, y + dy * L
            px, py = -dy, dx
            d.polygon([(hx + dx * 34, hy + dy * 34), (hx + px * 30, hy + py * 30), (hx - px * 30, hy - py * 30)], fill=C['exit'])
    # Étiquettes en dernier, pour rester lisibles.
    for e in els:
        k = e['kind']
        t = e.get('label')
        if not t:
            continue
        if k == 'shadow':
            x1, y1, x2, y2 = e['rect']
            label(d, [x1 + 10, y1 + 8, x1 + 260, y1 + 40], t, 20, (200, 200, 210), W=W)
        elif k in ('door', 'prop', 'hide', 'special', 'tile', 'frame'):
            label(d, e['rect'], t, e.get('size', 26), W=W)
        elif k == 'floor':
            label(d, [e['x1'], e['y'] - 40, e['x2'], e['y'] - 4], t, 22, C['floor'], W=W)
        elif k == 'ladder':
            label(d, [e['x'] + 30, (e['top'] + e['bottom']) / 2 - 20, e['x'] + 230, (e['top'] + e['bottom']) / 2 + 20], t, 20, C['ladder'], W=W)
        elif k == 'stairs':
            x1, y1, x2, y2 = e['from'] + e['to']
            label(d, [min(x1, x2), y2 - 50, max(x1, x2), y2 - 10], t, 22, C['ladder'], W=W)
        elif k == 'light':
            x, y = e['at']
            label(d, [x - 160, y - 70, x + 160, y - 30], t, 20, C['light'], W=W)
        elif k == 'walk':
            xs = [p[0] for p in e['poly']]
            ys = [p[1] for p in e['poly']]
            label(d, [min(xs), sum(ys) / len(ys) - 20, max(xs), sum(ys) / len(ys) + 20], t, 34, W=W)
        elif k == 'exit':
            x, y = e['at']
            label(d, [x - 170, y + 30, x + 170, y + 80], t, 22, C['exit'], W=W)
        elif k == 'fg':
            label(d, [0, e['y'], W, H], t, 24, W=W)
        elif k == 'text':
            label(d, e['rect'], t, e.get('size', 30), (235, 235, 240), W=W)
    return img.convert('RGB')


def legend():
    rows = [
        ('floor', 'Surface où Nella marche', 'WALKABLE SURFACE'),
        ('ladder', 'Échelle, escalier', 'LADDER / STAIRS'),
        ('door', 'Boîte ou livre de face, qu’on peut ouvrir', 'ENTERABLE BOX OR BOOK'),
        ('prop', 'Objet du décor, obstacle', 'PROP / OBSTACLE'),
        ('hide', 'Cachette', 'HIDING SPOT'),
        ('special', 'Objet important de l’histoire', 'KEY STORY OBJECT'),
        ('light', 'Source de lumière', 'LIGHT SOURCE'),
        ('shadow', 'Zone d’ombre', 'SHADOW ZONE'),
        ('fg', 'Silhouettes de premier plan', 'FOREGROUND SILHOUETTES'),
        ('exit', 'Sortie vers une autre scène', 'EXIT'),
        ('frame', 'Structure du meuble', 'FURNITURE FRAME'),
    ]
    img = Image.new('RGB', (1400, 120 + len(rows) * 80), (245, 245, 247))
    d = ImageDraw.Draw(img)
    d.text((40, 30), 'Légende des croquis de composition', font=font(40), fill=C['ink'])
    for i, (k, fr, en) in enumerate(rows):
        y = 110 + i * 80
        d.rectangle([40, y, 140, y + 56], fill=C[k], outline=C['ink'], width=2)
        d.text((170, y + 2), fr, font=font(28), fill=C['ink'])
        d.text((170, y + 34), en, font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 20), fill=(90, 90, 100))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for s in SCENES:
        render(s).save(os.path.join(OUT, f"{s['id']}.png"), optimize=True)
    legend().save(os.path.join(OUT, 'legende.png'))
    with open(os.path.join(ROOT, 'design', 'scenes.json'), 'w') as f:
        json.dump(SCENES, f, ensure_ascii=False, indent=1)
    print(f'{len(SCENES)} croquis écrits dans {OUT}')


if __name__ == '__main__':
    main()
