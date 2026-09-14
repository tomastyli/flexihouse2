# Preset produktové stránky

Platí od 14. 9. 2026 a nahrazuje preset z 11. 9. Produktové stránky se
přestavěly do podoby, která sdílí jazyk s homepage: většina komponent bydlí
v `assets/domov.css`, vlastní kousky stránky mají v sobě. Dodržení hlídá
`_audit/produkt-preset.py`, pouští se stejně jako `konzistence.py`.

Stránky pod presetem: `rozkladaci-dum.html`, `flexi-office.html`,
`dum-na-miru.html`. Nová produktová stránka se přidá do seznamu v auditu.

**`dum-na-miru.html` zatím převedená není** a jede na staré kostře
(`pr-blok`, `pr-cta`). Audit ji proto hlásí jako nepřevedenou, ne jako chybu.
Až se přepíše, ten řádek zmizí sám.

## Pořadí slotů

| # | Slot | Třída | Co v něm je | Povinný |
|---|---|---|---|---|
| 0 | hero | `pr-hero` | otočka domu, H1, cena od, jedna akce | ano |
| 1 | vlastní blok modelu | `pl` | u rozkládacího půdorys a rozměry, u office způsob dodání | ano |
| 2 | co je a co není v ceně | `holy` | věta o rozsahu a karty příplatků s cenami | ano |
| 3 | proč to lidé berou | `vyhody` | čtyři dlaždice s ikonou, krátký titulek, jeden řádek | ano |
| 4 | konfigurátor | `kcta` | pás s odkazem na `/konfigurator` | jen kde konfigurátor je |
| 5 | claim | `claim` | tmavý pás přes fotku, dvě akce | ano |
| 6 | newsletter | `klid` | jeden řádek, pole na e-mail | ano |
| 7 | časté dotazy | `dotazy` | rozbalovací seznam | ano |
| 8 | závěr | `zaver` | tmavý pás přes fotku | ano |
| 9 | poptávka | `poptat` | formulář | ano |

Pořadí je závazné. Slot 4 se smí vynechat, ostatní ne a nesmí se přehazovat:
světlé a tmavé pásy se střídají a přehozením vzniknou dva tmavé za sebou.

## Hero

Obrázek v heru má být render z Blenderu, ne fotka, aby byly produkty mezi
sebou srovnatelné. Rozkládací dům ho má jako otočku: `data-otocka` na prvku
uvnitř hera a `assets/flexi-otocka.js` ve stránce. Než vzniknou modely
ostatních produktů, zůstávají jim statické rendery.

**Konfigurátor v heru nebydlí.** Má vlastní celoobrazovkovou stránku
`/konfigurator` a hero na ni jen odkazuje tlačítkem. Produktová stránka má
prodávat dům, ne se pod rukama měnit v nástroj.

## Zakázané

- Statistické dlaždice, tedy velké číslo nad popiskem. Dlaždice ve `vyhody`
  nesou ikonu a větu, ne číslo.
- Stará kostra `pr-blok` a `pr-cta` na už převedené stránce. Buď stará
  stránka celá, nebo nová celá, ne půl na půl.
- Vlastní tmavá sekce navíc. Tmavé jsou jen `claim` a `zaver`.

## Kde co je

Komponenty `claim`, `klid`, `dotazy`, `zaver`, `poptat`, `vyhody` a `kontblok`
jsou v `assets/domov.css` a sdílí je homepage. Co je jen produktové (`pl`,
`holy`, `kcta`, doladění hera), má stránka ve vlastním `<style>` bloku, aby
se kvůli jedné stránce nenafukoval společný soubor.

Viz [[flexihouse-konfigurator-v-heru]] a `_3d-zdroj/README.md`.
