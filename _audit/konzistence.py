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

# 6) Čísla, která se musí shodovat s bází (kde se objeví, musí být stejná)
FAKTA = {
    "kancelář od": (r"[Oo]d (\d{2,3} \d{3}) Kč[^.]{0,30}(?:kancel|Office)|(?:kancel|Office)[^.]{0,60}?[Oo]d (\d{2,3} \d{3}) Kč", "70 000"),
    "elektroinstalace": (r"[Ee]lektroinstalac\w*(?: za| je| v každé sestavě)? (\d \d{3}) Kč", "5 000"),
    "zateplení 100 mm": (r"[Zz]ateplení 100 mm(?: místo 75 mm)?(?: stojí| za)? (\d{2} \d{3})(?! ?\+)", "30 000"),
    "klimatizace": (r"[Kk]limatizac\w*[^.+]{0,40}? (\d{2} \d{3})(?: ?Kč)?(?! ?\+)", "29 000"),
    "terasa": (r"\b[Tt]erasa(?: je příplatek| za| stojí)? (\d{2} \d{3})(?: ?Kč)?(?! ?\+)", "40 000"),
}
for nazev, (vzor, ok) in FAKTA.items():
    for f in STRANKY:
        for m in re.finditer(vzor, text(f)):
            hodnota = next((g for g in m.groups() if g), m.group(0))
            if hodnota.replace(" ", "") != ok.replace(" ", ""):
                poznamky.append(f"{f}: {nazev} = {hodnota} (báze {ok}): …{text(f)[max(0, m.start()-50):m.end()+30]}…")

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
    print(f"\nČísla k ověření ({len(poznamky)}):")
    for p in poznamky:
        print("  -", p)
print("\nPomíjivá tvrzení (ověřit u Dana, když se změní sklad nebo lhůty):")
for p, fs in mista.items():
    print(f"  „{p}“: {', '.join(fs) if fs else 'nikde'}")
sys.exit(1 if chyby else 0)
