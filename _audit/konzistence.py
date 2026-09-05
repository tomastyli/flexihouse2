#!/usr/bin/env python3
"""Kontrola, že si web neprotiřečí. Spouštět před každým nasazením:

    python3 _audit/konzistence.py

Zdroj pravdy je .docs/poradce/baze.md a to, co počítá konfigurátor. Skript
nehádá, jen porovnává řetězce napříč stránkami. Nenulový návratový kód = rozpor.
"""
import glob
import html
import json
import re
import sys

STRANKY = [f for f in sorted(glob.glob("*.html")) if not f.startswith("_") and f != "admin.html"]
BAZE = ".docs/poradce/baze.md"
chyby = []
poznamky = []


def text(f):
    s = open(f, encoding="utf-8").read()
    s = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", s, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", s)
    t = html.unescape(t).replace("\xa0", " ")
    return re.sub(r"\s+", " ", t)


def raw(f):
    return open(f, encoding="utf-8").read().replace("&nbsp;", " ").replace("\xa0", " ")


def ldjson(f):
    s = open(f, encoding="utf-8").read()
    out = []
    for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S):
        d = json.loads(m)
        out.extend(d.get("@graph", [d]))
    return out


# 1) Cena „od": web nesmí slibovat 400 000, konfigurátor umí nejméně 405 000
for f in STRANKY + [BAZE]:
    for m in re.finditer(r"[Oo]d 400 000", raw(f)):
        chyby.append(f"{f}: „od 400 000“, konfigurátor dává nejméně 405 000 (základ 400 000 + elektroinstalace 5 000)")

# 2) Schéma: cena domu ve strukturovaných datech = 405000, kancelář 70000
for f in STRANKY:
    for x in ldjson(f):
        items = [x] if x.get("@type") == "Product" else []
        if x.get("@type") == "ItemList":
            items = [li.get("item", {}) for li in x.get("itemListElement", [])]
        for p in items:
            cena = str(p.get("offers", {}).get("price", ""))
            jm = p.get("name", "")
            if "Office" in jm and cena != "70000":
                chyby.append(f"{f}: schéma {jm!r} má cenu {cena}, má být 70000")
            if "Office" not in jm and cena and cena != "405000":
                chyby.append(f"{f}: schéma {jm!r} má cenu {cena}, má být 405000")

# 3) Topení: dodává se „klimatizace, která topí i chladí“, ne tepelné čerpadlo
for f in STRANKY:
    if re.search(r"tepeln\w+ čerpadl", raw(f)):
        chyby.append(f"{f}: „tepelné čerpadlo“, konfigurátor i báze říkají „klimatizace, topí i chladí“")

# 4) DPH: žádné konkrétní sazby, sazbu potvrzuje nabídka
for f in STRANKY:
    if re.search(r"\b(12|21) ?% ", raw(f)) and "DPH" in raw(f):
        for m in re.finditer(r".{40}\b(12|21) ?%.{40}", raw(f)):
            if "DPH" in m.group(0) or "sazb" in m.group(0):
                chyby.append(f"{f}: konkrétní sazba DPH: …{m.group(0).strip()}…")

# 5) Zateplení 75 mm se nesmí prodávat jako celoroční
for f in STRANKY:
    if re.search(r"75 mm[^.]{0,60}(celoroční komfort|mírné klima)", raw(f), re.I):
        chyby.append(f"{f}: 75 mm popsáno jako celoroční, stránky doporučují na trvalé bydlení 100 mm")

# 6) Každá částka na webu musí být cena z konfigurátoru, hranice jeho rozpětí, nebo součet
#    jeho položek. Konfigurátor je jediný zdroj pravdy pro ceny (Tomáš 5. 9. 2026).
KONF = open("konfigurator.html", encoding="utf-8").read()
ceny = {}
for m in re.finditer(r"\{[^{}]*?id\s*:\s*'([^']+)'[^{}]*?price\s*:\s*(\d+)[^{}]*\}", KONF):
    ceny[m.group(1)] = int(m.group(2))
ZAKLAD = int(re.search(r"base\s*:\s*(\d+)", KONF).group(1))
ROZPETI = {int(x.replace(" ", "")) for x in re.findall(r"(\d{2,3} \d{3}) Kč", re.search(r"FROM_NOTE = '([^']*)'", KONF).group(1))}
KM = int(re.search(r"perKm\s*:\s*(\d+)", KONF).group(1))
POVOLENE = set(ceny.values()) | ROZPETI | {ZAKLAD, KM, 70000, 2000000, 4000000}  # 70 000 = Flexi Office (mimo konfigurátor), 2 000 000 a 4 000 000 = stropy pokut v zákoně
# součty: základ + libovolná podmnožina položek (dekory jsou jedna položka, mají stejnou cenu);
# stejná cena může být v součtu vícekrát (koupelna 30 000 i zimní zateplení 30 000)
import itertools
polozky = []
videno_dekor = False
for k, v in ceny.items():
    if not v or k in ("footings", "transport", "assembly"):
        continue
    if v == 23600:
        if videno_dekor:
            continue
        videno_dekor = True
    polozky.append(v)
soucty = set()
for r in range(1, len(polozky) + 1):
    for kombinace in itertools.combinations(polozky, r):
        soucty.add(sum(kombinace)); soucty.add(ZAKLAD + sum(kombinace))
# práce na pozemku: patky + doprava + montáž, spodní a horní hranice
soucty.add(min(ROZPETI) + ceny.get("transport", 0) + 30000)
soucty.add(max(ROZPETI) + ceny.get("transport", 0) + 80000)
for f in STRANKY + [BAZE]:
    t = text(f) if f.endswith(".html") else open(f, encoding="utf-8").read().replace("\xa0", " ")
    for m in re.finditer(r"(\d{1,3}(?: \d{3})+) Kč", t):
        c = int(m.group(1).replace(" ", ""))
        if c in POVOLENE or c in soucty:
            continue
        poznamky.append(f"{f}: {m.group(1)} Kč není cena z konfigurátoru ani součet jeho položek: …{t[max(0, m.start()-60):m.end()+20]}…")
if not ceny:
    chyby.append("konfigurator.html: nepodařilo se přečíst ceník (změnil se tvar dat?)")

# 7) Pomíjivá fakta: hlásit, kde jsou, ať se dají jednou za čas ověřit
POMIJIVA = ["10 kusů", "Deset kusů", "do 24 hodin", "několik dní"]
mista = {p: [f for f in STRANKY if p in text(f)] for p in POMIJIVA}

print("Kontrola konzistence webu Flexi House")
print("=" * 60)
if chyby:
    print(f"ROZPORY ({len(chyby)}):")
    for c in chyby:
        print("  -", c)
else:
    print("Rozpory: žádné.")
if poznamky:
    print(f"\nČástky mimo konfigurátor ({len(poznamky)}), rozhodnout, jestli je to chyba:")
    for p in poznamky:
        print("  -", p)
print("\nPomíjivá tvrzení (ověřit u Dana, když se změní sklad nebo lhůty):")
for p, fs in mista.items():
    print(f"  „{p}“: {', '.join(fs) if fs else 'nikde'}")
sys.exit(1 if (chyby or poznamky) else 0)
