"""Les 31 scènes du hub, décrites en blocs simples (coordonnées en pixels).

Vues « coupe » : 2520 x 1080 (21:9). Vues « macro » et « dessus » : 1920 x 1080 (16:9).
Nella mesure environ 90 px de haut dans les coupes. Ces mêmes blocs serviront au jeu
(surfaces où marcher, échelles, portes, sorties).
"""

# ---------- briques ----------

def floor(x1, x2, y, label=None):
    return {'kind': 'floor', 'x1': x1, 'x2': x2, 'y': y, 'label': label}

def ladder(x, top, bottom, label='ladder'):
    return {'kind': 'ladder', 'x': x, 'top': top, 'bottom': bottom, 'label': label}

def stairs(x1, y1, x2, y2, label='steps', steps=6):
    return {'kind': 'stairs', 'from': [x1, y1], 'to': [x2, y2], 'label': label, 'steps': steps}

def door(x, ybottom, label='game box (door)', w=120, h=170):
    return {'kind': 'door', 'rect': [x, ybottom - h, x + w, ybottom], 'label': label, 'size': 20}

def box(kind, x1, y1, x2, y2, label, size=24, round=False):
    return {'kind': kind, 'rect': [x1, y1, x2, y2], 'label': label, 'size': size, 'round': round}

def prop(*a, **k):
    return box('prop', *a, **k)

def hide(*a, **k):
    return box('hide', *a, **k)

def special(*a, **k):
    return box('special', *a, **k)

def shadow(x1, y1, x2, y2, label='shadow'):
    return {'kind': 'shadow', 'rect': [x1, y1, x2, y2], 'label': label, 'size': 22}

def light(x, y, label='lamp', cone=None, r=26):
    e = {'kind': 'light', 'at': [x, y], 'label': label, 'r': r}
    if cone:
        e['cone'] = cone
    return e

def frame(x1, y1, x2, y2, label=None):
    return {'kind': 'frame', 'rect': [x1, y1, x2, y2], 'label': label, 'size': 22}

def fg(shapes, label='foreground silhouettes', y=1010):
    return {'kind': 'fg', 'y': y, 'shapes': shapes, 'w': 170, 'label': label}

def exit_(x, y, d, label):
    return {'kind': 'exit', 'at': [x, y], 'dir': d, 'label': label}

def walk(poly, label='walkable area (keep empty)'):
    return {'kind': 'walk', 'poly': poly, 'label': label}

def text(x1, y1, x2, y2, label, size=30):
    return {'kind': 'text', 'rect': [x1, y1, x2, y2], 'label': label, 'size': size}

FG = fg([(80, 50), (420, 90), (980, 40), (1500, 110), (2080, 60)])

def bookcase(uprights=(30, 850, 1670, 2490), levels=(250, 490, 730, 960)):
    """Structure de bibliothèque : montants verticaux et un plancher par niveau et par travée."""
    els = [frame(x - 20, 60, x + 20, 1010) for x in uprights]
    els.append(frame(uprights[0] - 20, 40, uprights[-1] + 20, 70))
    for y in levels:
        for a, b in zip(uprights, uprights[1:]):
            els.append(floor(a + 20, b - 20, y))
    return els

def scene(id_, room, name, view, elements):
    return {'id': id_, 'room': room, 'name': name, 'view': view, 'elements': elements}

L1, L2, L3, L4 = 250, 490, 730, 960

# ---------- scènes ----------

SCENES = [
    scene('01_grenier_malles', 'Grenier', 'Les malles oubliées', 'coupe', [
        text(200, 60, 2300, 130, 'sloping wooden roof, dusty, moonlit'),
        floor(80, 700, 820, 'trunk lid'), prop(80, 838, 700, 1010, 'old trunk'),
        floor(760, 1380, 600, 'trunk lid'), prop(760, 618, 1380, 1010, 'big trunk with board games'),
        floor(1440, 2050, 420, 'suitcase'), prop(1440, 438, 2050, 1010, 'stacked suitcases'),
        floor(2100, 2460, 700, 'crate'), prop(2100, 718, 2460, 1010, 'crate'),
        stairs(700, 820, 760, 600, 'leaning ruler', 4), ladder(1410, 420, 600, 'ribbon'),
        prop(300, 700, 460, 820, 'dust ball', round=True), hide(900, 470, 1100, 600, 'open lid cave'),
        door(1700, 420, 'forgotten game box'),
        light(1900, 180, 'moonlight from round window', cone=(420, 180), r=40),
        shadow(80, 140, 700, 800), exit_(160, 760, 'down', 'trapdoor to mezzanine'),
        FG,
    ]),
    scene('02_mezzanine_livres_rares', 'Mezzanine', 'Les vitrines des livres rares', 'coupe', [
        *bookcase(),
        door(120, L1, 'rare book (door)', 110, 160), door(560, L2, 'chained book', 110, 170),
        door(980, L1, 'rare book (door)', 110, 160), door(1300, L3, 'glowing open book', 120, 180),
        door(1800, L2, 'rare book (door)', 110, 170), door(2200, L1, 'rare book (door)', 110, 160),
        prop(300, L3 - 110, 520, L3, 'velvet cushion'), prop(1900, L3 - 90, 2100, L3, 'brass lock'),
        ladder(800, L1, L2), ladder(1620, L2, L3), ladder(250, L3, L4),
        light(1260, 300, 'green banker lamp', cone=(L2, 320)),
        shadow(40, 500, 840, 1000), shadow(1680, 60, 2480, 480),
        hide(2250, L4 - 120, 2440, L4, 'behind velvet cushion'),
        exit_(2440, L4 - 60, 'right', 'to grand staircase'),
        fg([(100, 70), (600, 70), (1100, 70), (1600, 70), (2100, 70)], 'carved balustrade (foreground)'),
    ]),
    scene('03_mezzanine_lutrin_registro', 'Mezzanine', 'Le lutrin du Registro', 'macro', [
        special(560, 120, 1360, 640, 'open giant ledger: two curved pages with glowing purple handwriting', 30),
        prop(1250, 10, 1330, 110, 'floating quill'), prop(1460, 220, 1600, 640, 'candle holder'),
        prop(700, 640, 780, 900, 'red ribbon bookmark'),
        light(1530, 200, 'candle flame'),
        walk([(80, 1060), (1840, 1060), (1600, 760), (320, 760)], 'lectern ledge (walkable)'),
        exit_(140, 900, 'left', 'back to mezzanine shelves'),
    ]),
    scene('04_securite_ecrans', 'Salle de sécurité', 'Le mur d’écrans', 'coupe', [
        *bookcase(levels=(250, 490, 730, 960)),
        *[prop(x, y - 190, x + 260, y - 10, 'crt monitor', 22) for y in (L1, L2, L3) for x in (120, 520, 940, 1340, 1760, 2160)],
        *[prop(x, L4 - 110, x + 90, L4, 'charging dock') for x in (200, 600, 1000, 1400, 1800)],
        ladder(860, L1, L2, 'maintenance ladder'), ladder(1660, L2, L3, 'maintenance ladder'), ladder(460, L3, L4, 'maintenance ladder'),
        light(1260, 90, 'red warning lamp'), shadow(40, 740, 2480, 1000, 'dark floor, guards recharge here'),
        exit_(80, L4 - 60, 'left', 'to staircase'),
        FG,
    ]),
    scene('05_securite_console', 'Salle de sécurité', 'La console', 'macro', [
        *[prop(240 + i * 250, 300, 330 + i * 250, 700, 'toggle switch', 20) for i in range(4)],
        prop(1320, 420, 1520, 620, 'round dial', round=True), special(1560, 520, 1760, 700, 'big red button', round=True),
        prop(180, 80, 260, 700, 'microphone stand'), prop(1600, 150, 1860, 420, 'cold coffee cup'),
        text(300, 40, 1700, 110, 'monitors glow above (blue-green light)'),
        walk([(60, 1060), (1860, 1060), (1700, 760), (220, 760)], 'metal panel (walkable)'),
        exit_(1800, 900, 'right', 'back to screens'),
    ]),
    scene('06_cabinet_mago_bureau', 'Cabinet du Mago', 'Le bureau vide', 'macro', [
        special(650, 120, 1270, 700, 'antique typewriter, one glowing line on the paper', 30),
        prop(1350, 140, 1800, 520, 'old computer screen with blinking cursor'),
        prop(200, 380, 420, 680, 'steaming cup of tea'), prop(300, 720, 620, 760, 'fountain pen'),
        prop(1380, 560, 1700, 700, 'glasses on notes'),
        text(80, 40, 600, 110, 'empty chair behind, still turned'),
        light(1570, 330, 'cold screen light'),
        walk([(80, 1060), (1840, 1060), (1640, 760), (280, 760)], 'desk surface (walkable)'),
    ]),
    scene('07_escalier_marches', 'Grand escalier', 'Les marches', 'coupe', [
        *[floor(80 + i * 340, 420 + i * 340, 960 - i * 130, 'step') for i in range(7)],
        *[prop(80 + i * 340, 978 - i * 130, 420 + i * 340, 1010, None) for i in range(7)],
        prop(420, 860, 520, 960, 'dropped book'), prop(1100, 740, 1170, 830, 'thread spool'),
        stairs(1460, 570, 1760, 440, 'ruler as ramp', 5), prop(2100, 220, 2200, 310, 'toppled pawn'),
        ladder(780, 700, 830, 'brass stair rod'), ladder(1460, 440, 570, 'brass stair rod'),
        light(2300, 80, 'chandelier above'), shadow(80, 80, 900, 700, 'shadow'),
        exit_(140, 900, 'left', 'ground floor'), exit_(2400, 120, 'up', 'upper floor'),
        fg([(150, 120), (700, 120), (1250, 120), (1800, 120), (2350, 120)], 'balusters (foreground)'),
    ]),
    scene('08_escalier_rampe', 'Grand escalier', 'La rampe', 'coupe', [
        stairs(2300, 160, 200, 860, 'polished handrail: long slide', 1),
        prop(2300, 100, 2460, 200, 'top of rail'), prop(60, 820, 240, 1010, 'spiral newel post'),
        prop(1500, 360, 1600, 450, 'forgotten glove'), prop(950, 520, 1040, 640, 'hanging scarf'),
        prop(600, 640, 700, 720, 'brass ornament'),
        light(1250, 80, 'chandelier light'), shadow(200, 700, 2480, 1000, 'steps in shadow below'),
        exit_(2380, 140, 'up', 'upper floor'), exit_(120, 780, 'left', 'ground floor'),
        FG,
    ]),
    scene('09_escalier_horloge', 'Grand escalier', 'Le palier à l’horloge', 'coupe', [
        frame(20, 40, 60, 1010), frame(2460, 40, 2500, 1010),
        prop(900, 60, 1620, 260, 'back of the clock face (glowing)'),
        prop(200, 300, 520, 620, 'giant gear', round=True), floor(220, 500, 300, 'gear top'),
        prop(800, 430, 1080, 710, 'giant gear', round=True), floor(820, 1060, 430, 'gear top'),
        special(1400, 360, 1680, 640, 'frozen gear (red pin)', round=True), floor(1420, 1660, 360),
        prop(1900, 520, 2200, 820, 'giant gear', round=True), floor(1920, 2180, 520, 'gear top'),
        prop(1150, 300, 1190, 900, 'pendulum rod'), prop(1050, 820, 1290, 980, 'pendulum disc', round=True),
        ladder(640, 300, 800, 'chain'), ladder(2300, 500, 960, 'chain with weight'),
        floor(60, 2460, 960, 'clock floor'),
        exit_(120, 900, 'left', 'back to stairs'),
        FG,
    ]),
    scene('10_arriere_cartons', 'Arrière-boutique', 'Les cartons de livraison', 'coupe', [
        floor(60, 700, 700, 'box top'), prop(60, 718, 700, 1010, 'cardboard box'),
        floor(760, 1300, 420, 'box top'), prop(760, 438, 1300, 1010, 'tall box'),
        door(900, 420, 'new game in plastic (door)', 140, 180),
        floor(1360, 1900, 600, 'box top'), prop(1360, 618, 1900, 1010, 'opened box'),
        door(1500, 600, 'new game in plastic (door)', 140, 180),
        floor(1960, 2460, 300, 'box top'), prop(1960, 318, 2460, 1010, 'stack of boxes'),
        prop(500, 560, 660, 700, 'tape roll', round=True), hide(1700, 470, 1880, 600, 'bubble wrap'),
        stairs(700, 700, 760, 420, 'crumpled paper', 3), ladder(1930, 300, 600, 'string'),
        special(1100, 380, 1400, 420, 'open box cutter (danger)'),
        light(1250, 80, 'bare bulb', cone=(420, 420)), shadow(60, 100, 700, 700),
        exit_(100, 640, 'left', 'to the counter'),
        FG,
    ]),
    scene('11_arriere_etabli', 'Arrière-boutique', 'L’établi d’emballage', 'macro', [
        prop(150, 160, 650, 700, 'vintage label maker'), prop(650, 600, 1100, 700, 'blank label strip'),
        special(1150, 420, 1600, 700, 'tape dispenser (teeth)'),
        prop(1650, 260, 1760, 700, 'rubber stamp'), prop(1780, 320, 1880, 700, 'rubber stamp'),
        prop(800, 330, 1050, 560, 'spool of string', round=True),
        light(960, 60, 'desk lamp', cone=(700, 500)),
        walk([(80, 1060), (1840, 1060), (1640, 760), (280, 760)], 'workbench (walkable)'),
        exit_(140, 900, 'left', 'back to boxes'),
    ]),
    scene('12_hall_comptoir', 'Hall', 'Le comptoir de Madame Hulotte', 'macro', [
        prop(120, 60, 300, 720, 'brass reading lamp (lighthouse)'), light(210, 120, 'green lamp shade', cone=(720, 260)),
        special(760, 560, 1020, 700, 'small closed red book (Nella’s book)'),
        prop(1080, 300, 1440, 720, 'card catalogue box (enter)'), prop(1480, 420, 1640, 720, 'stack of returned books'),
        prop(1680, 600, 1800, 720, 'brass bell', round=True), prop(520, 640, 700, 720, 'gold coins', round=True),
        text(1500, 60, 1880, 260, 'blurred hall: staircase, windows, moon'),
        walk([(60, 1060), (1860, 1060), (1660, 760), (260, 760)], 'counter top (walkable)'),
        exit_(1780, 860, 'right', 'ruler bridge to library'),
        exit_(1260, 300, 'up', 'climb the card catalogue'),
    ]),
    scene('13_hall_fiches', 'Hall', 'Le meuble à fiches', 'macro', [
        *[prop(200 + i * 200, 180 + (i % 3) * 40, 330 + i * 200, 760, 'index card', 20) for i in range(8)],
        special(1000, 120, 1130, 760, 'pulled-out card (clue)'),
        prop(120, 640, 1800, 680, 'brass rod'),
        prop(600, 140, 680, 260, 'tab divider'),
        light(960, 40, 'light from above'),
        walk([(80, 1060), (1840, 1060), (1700, 820), (220, 820)], 'drawer edge (walkable)'),
        exit_(140, 940, 'left', 'back to the counter'),
    ]),
    scene('14_hall_chute_retours', 'Hall', 'La chute des retours', 'coupe', [
        frame(20, 40, 60, 1010), frame(2460, 40, 2500, 1010),
        prop(2100, 60, 2400, 110, 'brass return slot'), light(2250, 120, 'light through the slot', cone=(500, 160)),
        stairs(2300, 180, 400, 820, 'slanted metal chute (slide)', 1),
        prop(1500, 340, 1640, 470, 'stuck book'), prop(900, 520, 1040, 640, 'stuck game box'),
        floor(80, 900, 900, 'pile of returned books (soft landing)'), prop(80, 918, 900, 1010, None),
        hide(980, 820, 1200, 1010, 'gap between books'),
        exit_(140, 840, 'left', 'hidden opening behind the counter'),
        shadow(60, 400, 1300, 1000),
        FG,
    ]),
    scene('15_bibliotheque_contes', 'Grande bibliothèque', 'Travée des Contes', 'coupe', [
        *bookcase(),
        door(140, L1, 'storybook (door)'), door(420, L2, 'storybook (door)'), door(1000, L1, 'storybook (door)'),
        door(1250, L3, 'glowing storybook (door)'), door(1900, L2, 'storybook (door)'), door(2240, L4, 'storybook (door)'),
        prop(560, L1 - 80, 760, L1, 'ball of yarn', round=True), prop(1450, L2 - 120, 1600, L2, 'chest of drawers'),
        prop(300, L4 - 70, 400, L4, 'die'), prop(1850, L3 - 140, 1930, L3, 'wooden pawn'),
        hide(600, L3 - 130, 800, L3, 'open box (hide)'), hide(2000, L1 - 120, 2200, L1, 'gap between books'),
        ladder(780, L1, L2), ladder(300, L2, L3), ladder(1560, L3, L4), stairs(1450, L2, 1600, L2 - 120, 'drawers as steps', 3),
        floor(830, 1690, 370, 'ruler bridge'),
        light(1260, 110, 'reading lamp', cone=(L2, 380)),
        shadow(1690, 500, 2480, 1000),
        exit_(80, L4 - 60, 'left', 'ruler bridge to the counter'), exit_(2440, L1 - 60, 'right', 'to the Arcade'),
        FG,
    ]),
    scene('16_bibliotheque_arcade', 'Grande bibliothèque', 'Travée de l’Arcade', 'coupe', [
        *bookcase(),
        door(160, L1, 'retro game box (door)'), special(500, L2 - 180, 640, L2, 'BARREL GAME box (door)'),
        door(1050, L1, 'retro game box (door)'), door(1300, L3, 'retro game box, lid ajar'),
        door(1900, L2, 'retro game box (door)'), door(2030, L4, 'retro game box (door)'),
        prop(700, L1 - 150, 780, L1, 'game cartridge'), prop(900, L2 - 80, 1150, L2, 'fallen joystick'),
        prop(320, L4 - 160, 400, L4, 'cartridge'), prop(1100, L4 - 60, 1500, L4, 'coiled cable'),
        hide(1700, L3 - 140, 1880, L3, 'cartridge sleeve'),
        ladder(720, L2, L3), ladder(1560, L1, L2), ladder(2300, L3, L4), stairs(150, L3, 350, L3 - 150, 'cable loop', 4),
        light(1260, 110, 'desk lamp', cone=(L2, 380)), light(560, 560, 'pixel glow', r=20),
        shadow(40, 740, 840, 1000), shadow(1690, 60, 2480, 480),
        exit_(80, L1 - 60, 'left', 'to the Contes'), exit_(2440, L3 - 60, 'right', 'to board games'),
        exit_(1260, 90, 'up', 'glass display case'),
        FG,
    ]),
    scene('17_bibliotheque_jeux_societe', 'Grande bibliothèque', 'Travée des Jeux de société', 'coupe', [
        *bookcase(),
        door(140, L1, 'board game box (door)', 160, 180), door(1000, L2, 'board game box (door)', 160, 180),
        door(1300, L4, 'board game box (door)', 160, 180), door(1950, L1, 'board game box (door)', 160, 180),
        prop(450, L2 - 70, 560, L2, 'die'), prop(600, L2 - 70, 710, L2, 'die'),
        stairs(1700, L3, 1950, L3 - 140, 'fanned cards (ramp)', 4), prop(2200, L3 - 150, 2280, L3, 'pawn'),
        floor(830, 1690, 610, 'rolled game board bridge'),
        hide(300, L3 - 140, 520, L3, 'open box with pieces'), hide(2100, L2 - 130, 2350, L2, 'open box'),
        ladder(780, L1, L2), ladder(1600, L2, L3), ladder(400, L3, L4),
        light(400, 110, 'brass lantern', cone=(L1, 200)), light(2100, 560, 'brass lantern', cone=(L3, 200)),
        shadow(860, 60, 1660, 480), shadow(860, 740, 1660, 1000),
        exit_(80, L3 - 60, 'left', 'to the Arcade'), exit_(2440, L4 + 10, 'down', 'hanging rug to games table'),
        FG,
    ]),
    scene('18_bibliotheque_vitrine', 'Grande bibliothèque', 'La vitrine des jeux', 'coupe', [
        frame(20, 40, 60, 1010), frame(2460, 40, 2500, 1010), frame(20, 40, 2500, 80),
        floor(60, 2460, 420, 'glass shelf'), floor(60, 2460, 760, 'glass shelf'),
        special(380, 760 - 220, 560, 760, 'special game box on velvet'), special(1170, 760 - 220, 1350, 760, 'special game box on velvet'),
        special(1960, 760 - 220, 2140, 760, 'special game box on velvet'),
        light(470, 460, 'spotlight', cone=(540, 100)), light(1260, 460, 'spotlight', cone=(540, 100)), light(2050, 460, 'spotlight', cone=(540, 100)),
        prop(2300, 480, 2440, 620, 'brass lock'), ladder(820, 420, 760, 'hinge'),
        text(200, 120, 2300, 300, 'glass doors: reflections and fingerprints'),
        exit_(1260, 960, 'down', 'back to the Arcade'),
        FG,
    ]),
    scene('19_bibliotheque_sol', 'Grande bibliothèque', 'Le sol de la bibliothèque', 'macro', [
        prop(120, 40, 300, 760, 'furniture leg (column)'), prop(1500, 40, 1640, 640, 'furniture leg (column)'),
        prop(700, 480, 900, 680, 'lost marble', round=True), prop(1100, 560, 1260, 660, 'dust ball', round=True),
        text(300, 260, 1400, 380, 'far distance: bottom of the grand staircase, small door'),
        prop(0, 860, 1920, 1080, 'carpet fringe (tall red and cream grass)'),
        walk([(300, 860), (1700, 860), (1500, 640), (500, 640)], 'open parquet (no hiding)'),
        light(1700, 120, 'cold moonlight'),
        exit_(220, 820, 'up', 'rope ladder up to the Contes'), exit_(1600, 700, 'right', 'to the cupboard under the stairs'),
    ]),
    scene('20_lecture_longue_table', 'Salle de lecture', 'La longue table', 'macro', [
        *[prop(240 + i * 520, 80, 320 + i * 520, 620, 'banker lamp') for i in range(3)],
        *[light(280 + i * 520, 140, 'green shade', cone=(700, 220)) for i in range(3)],
        prop(1450, 360, 1820, 700, 'giant steaming teacup'), prop(500, 520, 900, 700, 'open book (tent)'),
        prop(1000, 640, 1140, 700, 'biscuit crumbs'),
        walk([(60, 1060), (1860, 1060), (1600, 740), (320, 740)], 'table top (walkable)'),
        exit_(1800, 880, 'right', 'down to the armchair'),
    ]),
    scene('21_lecture_fauteuil', 'Salle de lecture', 'Le fauteuil club', 'coupe', [
        prop(200, 300, 520, 1010, 'armrest'), floor(200, 520, 300, 'armrest top'),
        prop(520, 560, 1900, 1010, 'seat cushion'), floor(520, 1900, 560, 'cushion plateau'),
        prop(1900, 100, 2220, 1010, 'chair back'), floor(1900, 2220, 100, 'top of the back'),
        ladder(2060, 100, 560, 'knitted blanket (rope)'), stairs(520, 560, 200, 300, 'leather folds', 4),
        hide(1100, 580, 1300, 700, 'gap between cushions'), special(1150, 620, 1250, 690, 'lost coin'),
        prop(2300, 400, 2480, 1010, 'side table'), light(2390, 300, 'table lamp'),
        shadow(60, 60, 900, 1000),
        exit_(2420, 260, 'right', 'up to the long table'),
        FG,
    ]),
    scene('22_lecture_cheminee', 'Salle de lecture', 'La cheminée', 'coupe', [
        floor(60, 2460, 300, 'mantelpiece (high shelf)'), prop(300, 140, 420, 300, 'candlestick'), prop(1150, 120, 1370, 300, 'mantel clock'),
        prop(1900, 180, 2050, 300, 'small frame'),
        prop(60, 300, 260, 1010, 'stone pillar'), prop(2260, 300, 2460, 1010, 'stone pillar'),
        special(700, 620, 1820, 960, 'wall of fire (firewall) blocks the way'),
        floor(260, 700, 960, 'hearth (left side)'), floor(1820, 2260, 960, 'hearth (right side)'),
        prop(500, 500, 560, 960, 'fire poker'), ladder(400, 300, 960, 'fire tongs'),
        prop(650, 760, 1870, 800, 'fire screen'),
        light(1260, 700, 'roaring fire', r=60),
        exit_(150, 900, 'left', 'back to the armchair'),
        FG,
    ]),
    scene('23_jeux_table_plateau', 'Salle de jeux', 'La table du jeu de plateau', 'dessus', [
        prop(160, 100, 1760, 980, 'antique game board: painted landscape (forests, mountains, rivers, castles)', 30),
        *[box('tile', 260 + i * 140, 840 - (i % 5) * 120, 360 + i * 140, 920 - (i % 5) * 120, str(i + 1), 26) for i in range(10)],
        special(1500, 200, 1660, 360, 'castle (goal)'), prop(60, 60, 200, 200, 'die'), prop(1760, 860, 1900, 1000, 'card deck'),
        light(1840, 80, 'brass lamp'),
    ]),
    scene('24_jeux_coffre', 'Salle de jeux', 'Le coffre à jouets', 'coupe', [
        frame(20, 40, 80, 1010), frame(2440, 40, 2500, 1010), text(200, 40, 2300, 120, 'lid open above: moonlight falls in'),
        prop(80, 700, 900, 1010, 'rag doll (sleeping giant)'), floor(80, 900, 700, 'rag doll'),
        prop(950, 520, 1500, 1010, 'wooden blocks'), stairs(900, 700, 1200, 520, 'blocks as stairs', 4), floor(1200, 1500, 520),
        prop(1550, 360, 1900, 1010, 'jack-in-the-box'), floor(1550, 1900, 360, 'box lid'),
        prop(1950, 640, 2440, 1010, 'deflated ball'), floor(1950, 2440, 640),
        hide(400, 560, 640, 700, 'under the doll arm'), prop(2100, 560, 2200, 640, 'marble', round=True),
        ladder(1935, 360, 640, 'spinning top string'), light(1260, 90, 'moonlight', cone=(520, 400)),
        shadow(80, 760, 2440, 1000, 'deep darkness at the bottom'),
        exit_(1260, 300, 'up', 'climb out'),
        FG,
    ]),
    scene('25_jeux_borne_arcade', 'Salle de jeux', 'La borne d’arcade de l’intérieur', 'coupe', [
        frame(20, 40, 60, 1010), frame(2460, 40, 2500, 1010),
        prop(700, 60, 1820, 300, 'back of the round CRT tube (glowing pixels)'),
        *bookcase(uprights=(60, 1260, 2460), levels=(380, 640, 900)),
        *[prop(x, y - 90, x + 140, y, 'chip') for y in (380, 640, 900) for x in (200, 800, 1500, 2000)],
        ladder(1100, 380, 640, 'wire bundle'), ladder(1400, 640, 900, 'wire bundle'), ladder(420, 640, 900, 'wire bundle'),
        prop(2100, 700, 2400, 900, 'cooling fan (windmill)', round=True), special(500, 820, 640, 900, 'coin mechanism'),
        light(1260, 200, 'electric blue glow', r=40),
        exit_(100, 840, 'left', 'out through the coin slot'),
        FG,
    ]),
    scene('26_video_cabine', 'Vidéoprojection', 'La cabine du projecteur', 'coupe', [
        prop(500, 120, 900, 520, 'film reel (wheel)', round=True), prop(1300, 120, 1700, 520, 'film reel (wheel)', round=True),
        floor(700, 1500, 300, 'film strip bridge'),
        prop(700, 520, 1700, 820, 'projector body'), floor(700, 1700, 520, 'projector top'),
        light(1750, 660, 'beam of light to the screen', cone=(1010, 200)),
        prop(100, 640, 500, 1010, 'film cans'), floor(100, 500, 640, 'film cans'),
        prop(1900, 760, 2400, 1010, 'rewinding table'), floor(1900, 2400, 760),
        ladder(600, 520, 640, 'cable'), stairs(500, 640, 700, 520, 'cans as steps', 3),
        exit_(2420, 700, 'right', 'through the window: the screen'),
        shadow(60, 60, 500, 600),
        FG,
    ]),
    scene('27_video_ecran', 'Vidéoprojection', 'L’écran', 'coupe', [
        special(120, 80, 1100, 760, 'white cinema screen: giant shadows appear here'),
        prop(60, 80, 120, 900, 'red curtain'), prop(1100, 80, 1180, 900, 'red curtain'),
        floor(60, 1400, 900, 'small wooden stage'), prop(60, 918, 1400, 1010, None),
        light(2450, 200, 'projector beam from the back', cone=(800, 500)),
        *[prop(1500 + i * 240, 700, 1700 + i * 240, 1010, 'seat') for i in range(4)],
        *[floor(1500 + i * 240, 1700 + i * 240, 700) for i in range(4)],
        stairs(1400, 900, 1500, 700, 'seat edge', 3),
        exit_(2420, 640, 'right', 'up to the projection booth'),
        fg([(1500, 40), (1740, 40), (1980, 40), (2220, 40)], 'front row seats'),
    ]),
    scene('28_video_vhs', 'Vidéoprojection', 'Le rayon des cassettes VHS', 'coupe', [
        *bookcase(),
        *[door(x, y, 'vhs box (door)', 100, 170) for (x, y) in ((140, L1), (560, L1), (1000, L2), (1400, L2), (1800, L1), (2200, L3), (400, L3), (1100, L4))],
        stairs(700, L2, 800, L2 - 120, 'cassette pulled out', 3), stairs(1700, L3, 1600, L3 - 120, 'cassette pulled out', 3),
        ladder(780, L2, L3, 'unspooled tape'), ladder(1580, L1, L2, 'unspooled tape'), ladder(2300, L3, L4, 'unspooled tape'),
        prop(1880, L2 - 170, 2150, L2, 'small old tv (flickering)'), light(2015, 420, 'tv glow', r=20),
        hide(600, L4 - 130, 800, L4, 'empty vhs sleeve'),
        light(1260, 110, 'pink neon glow', cone=(L2, 360)), shadow(40, 740, 840, 1000),
        exit_(80, L4 - 60, 'left', 'to the screen'),
        FG,
    ]),
    scene('29_cagibi_balais', 'Cagibi', 'Le placard à balais', 'coupe', [
        text(300, 60, 2200, 160, 'ceiling: slanted underside of the staircase'),
        floor(60, 900, 520, 'shelf with bottles'), *[prop(100 + i * 160, 380, 200 + i * 160, 520, 'bottle') for i in range(5)],
        prop(1000, 200, 1060, 1010, 'broom'), prop(1200, 300, 1260, 1010, 'mop'),
        prop(1300, 760, 1600, 1010, 'bucket'), floor(1300, 1600, 760, 'bucket rim'),
        hide(1650, 560, 2200, 1010, 'old copper vacuum (Disinfettore lair)'),
        prop(60, 600, 400, 900, 'hanging rags'), ladder(1030, 520, 960, 'broom handle'),
        special(2260, 760, 2440, 1010, 'small locked door (to the basement)'),
        floor(60, 2460, 1000, 'closet floor'),
        light(600, 1040, 'line of light under the door', r=14),
        shadow(1600, 300, 2460, 1000),
        exit_(100, 960, 'left', 'out under the stairs'),
    ]),
    scene('30_reserves_boite_sans_nom', 'Réserves', 'La boîte sans nom', 'coupe', [
        *bookcase(),
        *[prop(x, y - 200, x + 300, y, 'boxes under white sheet') for (x, y) in ((120, L1), (450, L2), (1000, L1), (1250, L3), (1800, L2), (100, L4))],
        special(2200, L4 - 200, 2360, L4, 'the blank game box (purple glow)'),
        light(2280, 120, 'one beam of cold moonlight', cone=(L4 - 200, 120)),
        prop(400, L3 - 100, 520, L3, 'dust ball', round=True), ladder(780, L1, L2), ladder(1620, L2, L3), ladder(860, L3, L4, 'cobweb'),
        prop(60, 80, 2460, 120, 'dripping pipe'),
        shadow(40, 120, 2100, 1000, 'deep shadow everywhere'),
        exit_(80, L1 - 60, 'left', 'door from the cupboard'), exit_(2440, L2 - 60, 'right', 'secret passage'),
        FG,
    ]),
    scene('31_collezione_cabinet', 'Collezione', 'Le cabinet des bugs capturés', 'macro', [
        *[prop(120 + i * 360, 60, 420 + i * 360, 560, 'display case with pinned creatures', 22) for i in range(5)],
        special(1560, 220, 1720, 420, 'empty spot: pin and blank label waiting'),
        prop(760, 380, 1160, 760, 'glass bell jar', round=True), prop(1200, 600, 1440, 760, 'giant magnifying lamp'),
        prop(1500, 600, 1720, 760, 'jar of pins'), prop(200, 660, 520, 740, 'tweezers'),
        light(1400, 320, 'cold teal light', cone=(760, 300)),
        walk([(60, 1060), (1860, 1060), (1660, 780), (260, 780)], 'workbench (walkable)'),
        exit_(140, 900, 'left', 'back to the storage room'),
    ]),
]
