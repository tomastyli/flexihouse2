#!/usr/bin/env python3
"""Hlídá, že stránky domů drží jednu šablonu.

Vzniklo 11. 9. 2026, přepsáno 31. 10. 2026 na šablonu nové homepage. Stránky
domů skládá _gen/domy.py, pravidla popisuje .docs/PRESET-PRODUKT.md. Audit
chytí ruční úpravu, která šablonu obejde.

Pouští se stejně jako konzistence.py:  python3 _audit/produkt-preset.py
"""

import re
import sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent

STRANKY = ['vista.html', 'tenuta.html', 'rozkladaci-dum.html', 'flexi-office.html', 'dum-na-miru.html']

PRVNI = 'dh-hero'

POVINNE = ['dh-hero', 'dh-kde', 'dh-cena', 'dh-obraz', 'rd-tl', 'dh-spec', 'cesta__rada', 'dh-dalsi', 'pruv', 'poptat__hlava']

STARE = ['pr-hero', 'pr-blok', 'pr-cta', 'holy', 'vyhody', 'claim', 'klid', 'zaver', 'kcta', 'pl']

ZAKAZANE = ['stat', 'statistiky', 'pr-tma']


def sekce(html):
    telo = html[html.index('<main>'):html.index('</main>')]
    return [t.split() for t in re.findall(r'<section class="([^"]*)"[^>]*>', telo)]


def main():
    nalezy = []
    for jmeno in STRANKY:
        cesta = KOREN / jmeno
        if not cesta.exists():
            nalezy.append(f'{jmeno}: stránka chybí')
            continue
        html = cesta.read_text(encoding='utf-8')
        tridy = sekce(html)
        pouzite = set()
        for v in re.findall(r'class="([^"]+)"', html):
            pouzite.update(v.split())

        if not tridy or tridy[0][0] != PRVNI:
            nalezy.append(f'{jmeno}: první sekce má být {PRVNI}')
        konec = [t[-1] if t[0] == 'wrap' else t[0] for t in tridy]
        konec = [k for k in konec if k in ('cesta', 'dotazy', 'dh-dalsi', 'poptat')]
        ocekavany = [k for k in ('cesta', 'dotazy', 'dh-dalsi', 'poptat') if k in konec or k != 'dotazy']
        if konec != ocekavany:
            nalezy.append(f'{jmeno}: konec stránky je {konec}, šablona čeká {ocekavany}')

        for k in POVINNE:
            if k not in pouzite:
                nalezy.append(f'{jmeno}: chybí povinná komponenta {k}')
        for k in STARE:
            if k in pouzite:
                nalezy.append(f'{jmeno}: zůstal kus staré kostry {k}')
        for k in ZAKAZANE:
            if k in pouzite:
                nalezy.append(f'{jmeno}: zakázaná komponenta {k}')
        if 'data-dum=' not in html:
            nalezy.append(f'{jmeno}: poptávka nemá předvybraný dům (data-dum)')
        if 'assets/dum.css' not in html:
            nalezy.append(f'{jmeno}: nenačítá assets/dum.css')

    print('Stránky domů proti šabloně (.docs/PRESET-PRODUKT.md)')
    print('Kontrolováno:', ', '.join(STRANKY))
    print()
    if nalezy:
        print(f'Odchylky: {len(nalezy)}')
        for n in nalezy:
            print('  ' + n)
        return 1
    print('Odchylky: žádné.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
