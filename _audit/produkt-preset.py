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

PRVNI = ('dh-hero', 'pd-hero')

POVINNE = ['dh-kde', 'rd-tl', 'dh-spec', 'cesta__rada', 'dh-dalsi', 'pruv', 'poptat__hlava']

STARE = ['pr-hero', 'pr-blok', 'pr-cta', 'holy', 'vyhody', 'claim', 'klid', 'zaver', 'kcta', 'pl']

ZAKAZANE = ['stat', 'statistiky', 'pr-tma']


def sekce(html):
    telo = html[html.index('<main>'):html.index('</main>')]
    return [t.split() for t in re.findall(r'<section class="([^"]*)"[^>]*>', telo)]


PRODUKT = ['pd-hero', 'pd-dvoj', 'pd-nahled', 'pd-cenik', 'pd-vybava', 'pd-namiru', 'dotazy', 'poptat']
PRODUKT_POVINNE = ['pd-hero__nazev', 'pd-dvoj__plan', 'pd-galerie__kus', 'pd-lb', 'pd-cenik__hlavni', 'pd-vybava__sl', 'pd-namiru', 'pruv', 'rd-tl']


def produktova(jmeno, html, tridy, pouzite, nalezy):
    poradi = []
    for t in tridy:
        k = t[0]
        if k in PRODUKT and (not poradi or poradi[-1] != k):
            poradi.append(k)
    ocekavane = [k for k in PRODUKT if k in poradi or k != 'dotazy']
    if poradi != ocekavane:
        nalezy.append(f'{jmeno}: pořadí sekcí je {poradi}, produktová kostra čeká {ocekavane}')
    for k in PRODUKT_POVINNE:
        if k not in pouzite:
            nalezy.append(f'{jmeno}: chybí povinná komponenta {k}')
    if not ({'pd-scena', 'pd-otocka', 'pd-otocka__prvni', 'pd-360'} & pouzite):
        nalezy.append(f'{jmeno}: hero nemá model ani studiovou fotku')


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
        if tridy and tridy[0][0] == 'pd-hero':
            produktova(jmeno, html, tridy, pouzite, nalezy)
            continue

        if not tridy or tridy[0][0] not in PRVNI:
            nalezy.append(f'{jmeno}: první sekce má být jedna z {PRVNI}')
        if not ({'dh-cena', 'pd-box__cena'} & pouzite):
            nalezy.append(f'{jmeno}: stránka nemá cenu nahoře (dh-cena nebo pd-box__cena)')
        if not ({'dh-obraz', 'pd-scena'} & pouzite):
            nalezy.append(f'{jmeno}: hero nemá obrázek domu')
        konec = [t[-1] if t[0] == 'wrap' else t[0] for t in tridy]
        konec = [k for k in konec if k in ('cesta', 'dotazy', 'dh-dalsi', 'poptat')]
        ocekavany = [k for k in ('cesta', 'dotazy', 'dh-dalsi', 'poptat') if k in konec or k != 'dotazy']
        if konec != ocekavany:
            nalezy.append(f'{jmeno}: konec stránky je {konec}, šablona čeká {ocekavany}')
        for k in POVINNE:
            if k not in pouzite:
                nalezy.append(f'{jmeno}: chybí povinná komponenta {k}')

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
