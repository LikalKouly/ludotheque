"""Signale les chevauchements gênants dans les croquis (échelles sur des objets, objets superposés)."""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from scenes import SCENES  # noqa: E402

SOLID = ('door', 'prop', 'hide', 'special')


def rect(e):
    if e['kind'] == 'ladder':
        return [e['x'] - 30, e['top'] + 4, e['x'] + 30, e['bottom'] - 4]
    if e['kind'] == 'exit':
        x, y = e['at']
        return [x - 30, y - 30, x + 30, y + 30]
    return e.get('rect')


def inter(a, b):
    return a[0] < b[2] and b[0] < a[2] and a[1] < b[3] and b[1] < a[3]


problems = 0
for s in SCENES:
    els = [e for e in s['elements'] if e['kind'] in SOLID + ('ladder',) and rect(e)]
    for i, a in enumerate(els):
        for b in els[i + 1:]:
            if a['kind'] == 'prop' and b['kind'] == 'prop':
                continue  # décor empilé volontairement (bobines, chaînes...)
            if inter(rect(a), rect(b)):
                problems += 1
                print(f"{s['id']}: {a['kind']} '{a.get('label')}' / {b['kind']} '{b.get('label')}'")
print(problems, 'chevauchement(s)')
