# Šablona stránky domu

Platí od 31. 10. 2026 a nahrazuje preset ze 14. 9. Stránky domů mají stejný
jazyk jako nová homepage: písmo Satoshi, bílá hlavička, karty domů, průvodce
poptávkou. Ručně se needitují, skládá je `_gen/domy.py` (spuštění
`python3 _gen/domy.py`). Dodržení hlídá `_audit/produkt-preset.py`.

Stránky: `vista.html`, `tenuta.html`, `rozkladaci-dum.html`, `flexi-office.html`,
`dum-na-miru.html`. Ze stejného generátoru je i `katalog.html`.

## Jak generátor funguje

- Hlavičku, megamenu, mobilní menu, „Pět kroků“, poptávku, patičku a skripty
  bere z `index.html`. Co se změní na homepage, propíše se do stránek domů po
  dalším spuštění generátoru.
- Styly: všechny `<style>` bloky z hlavy `index.html` plus
  `_gen/dum-vlastni.css` → `assets/dum.css`. Při změně stylu zvednout
  `VERZE_CSS` v generátoru.
- Časté dotazy rozkládacího domu a kanceláře se berou doslova ze starých stránek
  v `_gen/zdroj/` (původní verze z 31. 10. před převodem), JSON-LD taky.
- Data domů (název, karta, cena, krátký popis, hodnota pro poptávku) jsou ve
  slovníku `DOMY`, pořadí v `PORADI`. Nový dům = záznam v `DOMY`, funkce
  `stranka_*` a karta `img/katalog/karta-*.webp` (srovnání `karta-norm.py`
  ve `flexihouse-rodinny-dum/web-podklady/`).

## Pořadí sekcí

| # | Sekce | Co v ní je |
|---|---|---|
| 1 | `dh-hero` | drobečky, H1, jedna věta, cena, tlačítko „Nezávazná poptávka“, nejvýš jeden textový odkaz (konfigurátor), render domu na světlé ploše |
| 2 | `dh-blok` půdorys | půdorys s odkazem na zvětšení, krátký text, tabulka parametrů `dh-spec` |
| 3 | `dh-blok` podle domu | pohled z terasy, mozaika fotek nebo vizualizací, co je v ceně, ceník, fasády |
| 4 | `rd-vyzva` | tmavý pás s konfigurátorem, jen kde konfigurátor dům počítá |
| 5 | `cesta` | pět kroků z homepage |
| 6 | `dotazy` | jen kde stránka dotazy měla (SEO), jinak vynechat |
| 7 | `dh-dalsi` | karty ostatních domů |
| 8 | `poptat` | průvodce poptávkou, dům předvybraný přes `data-dum`, začíná krokem 2 |

## Zakázané

- Statistické dlaždice, tedy velké číslo nad popiskem. Parametry jsou řádky
  `dh-spec` (popisek vlevo, hodnota vpravo).
- Stará kostra `pr-hero`, `pr-blok`, `pr-cta`, `holy`, `vyhody`, `claim`,
  `klid`, `zaver`, `kcta`, `pl`.
- „Co umíme / Co neděláme“ vedle sebe (srovnávací šablona). Co neděláme se
  píše jednou větou pod ceník.
