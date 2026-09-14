#!/usr/bin/env python3
"""Hlídá, že produktové stránky drží jeden preset.

Vzniklo 11. 9. 2026. Stránky se rozcházely potichu: dum-na-miru si nasadil
vlastní tmavou sekci uprostřed a nikdo si toho nevšiml, protože každá stránka
se prohlíží zvlášť. Pravidla popisuje .docs/PRESET-PRODUKT.md.

Pouští se stejně jako konzistence.py:  python3 _audit/produkt-preset.py
"""

import re
import sys
from pathlib import Path

KOREN = Path(__file__).resolve().parent.parent

STRANKY = ['rozkladaci-dum.html', 'flexi-office.html', 'dum-na-miru.html']

# Pořadí slotů podle .docs/PRESET-PRODUKT.md. Slot kcta je volitelný, ostatní
# musí být a nesmí se přehazovat: světlé a tmavé pásy se střídají a přehozením
# vzniknou dva tmavé za sebou.
SLOTY = ['pr-hero', 'pl', 'holy', 'vyhody', 'kcta', 'claim', 'klid', 'dotazy',
         'zaver', 'poptat']
VOLITELNE = {'kcta'}

# Vnitřek slotů. Kdyby se sekce jmenovala správně a byla prázdná, audit by to
# jinak nepoznal.
POVINNE = [
    'pr-hero', 'pr-hero__kde', 'pr-hero__cena', 'pr-hero__go',
    'holy__hlava', 'vyh__mriz', 'vyh__k', 'claim__akce',
    'dotazy__seznam', 'dotazy__kus', 'zaver__foto', 'poptat__hlava',
]

# Stará kostra. Na převedené stránce nesmí zůstat ani kus, půl na půl je horší
# než obojí zvlášť. dum-na-miru na ní jede celá a hlásí se jako nepřevedená.
STARE = ['pr-blok', 'pr-cta', 'pr-penize', 'pr-galerie', 'pr-faq']

# Statistické dlaždice jsou zakázaný vzor: velké číslo nad popiskem.
ZAKAZANE = ['pr-tma', 'pr-primo--tma', 'stat', 'statistiky']


def sekce(html):
    telo = html[html.index('<main>'):html.index('</main>')]
    return re.findall(r'<section class="([^"]*)"[^>]*>', telo)


def pozadi(trida):
    if 'pr-hero' in trida or 'pr-cta' in trida:
        return None
    return 'ton' if 'pr-ton' in trida else 'bila'


def nadpisy(html):
    telo = html[html.index('<main>'):html.index('</main>')]
    return [re.sub(r'<[^>]+>', '', h).strip()
            for h in re.findall(r'<h2[^>]*>(.*?)</h2>', telo, re.S)]


def main():
    nalezy = []
    neprevedene = []
    for jmeno in STRANKY:
        cesta = KOREN / jmeno
        if not cesta.exists():
            nalezy.append(f'{jmeno}: stránka chybí')
            continue
        html = cesta.read_text(encoding='utf-8')
        tridy = [t.split()[0] for t in sekce(html)]

        vse = set(re.findall(r'class="([^"]+)"', html))
        pouzite = set()
        for v in vse:
            pouzite.update(v.split())

        # Nepřevedená stránka se neměří novým presetem, jen se o ní ví.
        if 'pr-blok' in pouzite and 'holy' not in pouzite:
            neprevedene.append(jmeno)
            continue

        ocekavane = [s for s in SLOTY if s in tridy or s not in VOLITELNE]
        if tridy != ocekavane:
            nalezy.append(f'{jmeno}: pořadí sekcí je {tridy}, preset čeká {ocekavane}')

        for k in POVINNE:
            if k not in pouzite:
                nalezy.append(f'{jmeno}: chybí povinná komponenta {k}')
        for k in STARE:
            if k in pouzite:
                nalezy.append(f'{jmeno}: zůstal kus staré kostry {k}')
        for k in ZAKAZANE:
            if k in pouzite:
                nalezy.append(f'{jmeno}: zakázaná komponenta {k}')

        # Hero má ukazovat render, ne fotku, a u modelu s konfigurátorem na něj
        # odkazovat. Konfigurátor sám v heru nebydlí, má vlastní stránku.
        if 'kv__panel' in pouzite:
            nalezy.append(f'{jmeno}: konfigurátor patří na /konfigurator, ne do hera')
        if 'kcta' in tridy and '/konfigurator' not in html:
            nalezy.append(f'{jmeno}: má pás kcta, ale neodkazuje na /konfigurator')

    print('Produktové stránky proti presetu (.docs/PRESET-PRODUKT.md)')
    print('Kontrolováno:', ', '.join(STRANKY))
    print()
    if neprevedene:
        print('Zatím nepřevedené na nový preset:', ', '.join(neprevedene))
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
