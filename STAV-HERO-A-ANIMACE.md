# Stav k 7. 9. 2026 (hero, animace, mobilní hlavička)

## Živé na flexihouse.cz

Commity z tohoto sezení, všechny nasazené a ověřené naostro:

| commit | co |
|---|---|
| `9ca03e0` | typografie: nadpis 96 → 58 px, text 17 → 18 px, srovnaná hierarchie |
| `c17576c` | zaoblení jako tři tokeny (`--r-btn` 999px, `--r-box` 20px, `--r-ctl` 12px), hover `--btn-fill` #334a54 |
| `cb13941` | tmavý full-bleed hero, průhledná navigace, pás tří karet |
| `6af4ba8` | svislý obrázek pro mobil, hero 88 vh, bílý hamburger |
| `6123b9e` | odkrývání sekcí: hodnoty podle motion.md, spolehlivé spouštění, fokus |
| `51e3137` | lokální server umí rozsahové požadavky (přehrávání videa v náhledu) |
| `90fee53` | mobilní hlavička, zaoblený poradce, výraznější odkrývání |

### Hero — jak je postavený

- **desktop**: `img/flexi-hero-tmavy-*.webp`, poměr 2,68, výška `max(460px, min(86vh, 37vw))`
  aby poměr zůstal konstantní napříč šířkami. Text vlevo, produkty vpravo.
- **mobil** (`max-width:700px`): `img/flexi-hero-mobil-*.webp` přes `<picture>`, poměr 3:4,
  hero `min(88vh,860px)`, obsah na střed, oblouk `0 0 50% 50% / 0 0 7% 7%`,
  obrázek `object-position: center 78%`.
- navigace: nad herem průhledná s bílým textem, po odscrollování bílá s rozostřením.
  Přepíná `IntersectionObserver` na `.hero__hlidac`. **Na stránkách bez hera se nastaví
  pevná rovnou** — jinak by byl bílý text na bílém pozadí.

### Jak vznikly obrázky

Zdroj `podklady-3d/ai-hero/` (reference + skript). Modelu se nepodařilo nechat prázdnou
levou třetinu ani na třetí pokus, takže se **plátno rozšířilo dopočtem pozadí z okrajových
pixelů** — vodorovně pro desktop, svisle pro mobil. Šev je měřitelně hladší než vlastní
šum obrázku (max skok 6 vs 7).

## Odkrývání sekcí (`.fh-rv`) — hotovo a živé

Hodnoty srovnané s `motion.md`: desktop 420 ms a 24 px, mobil 260 ms a 16 px
(přes token `--lift` v media query, ne natvrdo). Nasazeno na `celorocni-bydleni`,
`glamping`, `jak-to-probiha`, `doprava-a-montaz` a `cena`.

Dvě chyby, které se při dokončování našly a opravily:

- **Skokové odkrytí se vázalo na první průchod observeru.** To je závod s obnovením
  pozice scrollu, které Chrome dělá až po `load`. Po reloadu uprostřed stránky se
  sekce pod uživatelem prolnula, místo aby tam prostě byla. Nově rozhoduje příznak
  `hnul`: sáhl už uživatel na kolečko, dotyk, klávesnici nebo ukazatel? Dokud ne,
  odkrývá se skokem. Na `load` to navázat nejde, restore přichází až po něm.
- **Fokus se klávesnicí dostal do sekce s `opacity:0`.** Na pěti stránkách je uvnitř
  skrytých sekcí 143 odkazů a tlačítek. `focusin` teď sekci odkryje okamžitě.

Změřeno headless Chrome proti živému webu: obnovení pozice, vstup s kotvou,
redukovaný pohyb, vypnutý JS, tab přes 60 prvků, mobil 390 px. Scroll přes 11 sekcí
drží medián 16,7 ms a p95 17,1 ms, žádný snímek nad 50 ms.

**Hodnoty zesíleny 7. 9. odpoledne:** 24 px a 420 ms Tomáš nevnímal vůbec, teď 40 px
a 520 ms přes token `--dur-reveal`, mobil 28 px a 420 ms. Strop 24 px v `motion.md` padl,
spec je přepsaný včetně důvodu a nové hranice okolo 48 px.

**Známá odchylka od `motion.md`:** pravidlo 10 chce nejvýš jednu běžící animaci ve
viewportu, na `celorocni-bydleni` se ale dvě sousední krátké sekce (Zateplení
a Čím se v domě topí) překrývají. Čte se to jako jedna vlna, neřešeno.

## Mobilní hlavička — opraveno a živé

Tomáš hlásil blikání a bílý proužek nahoře. Byly to dvě nezávislé věci:

- Proužek měl přesně 1 px. `.top` měla `border-bottom:1px solid transparent`, takže měřila
  85 px, ale hero se pod ni vytahoval jen o 84. Vlas se přesunul do `box-shadow`.
- Blikání dělal skok barvy: pozadí se prolínalo 340 ms, ale barva textu se překlápěla
  okamžitě, takže tmavé logo chvíli leželo na tmavém heru. Barvy teď jedou stejným
  přechodem jako pozadí. `backdrop-filter` z přechodu ven, rozměry hlavičky se na mobilu
  neanimují.

**Oscilaci se nepodařilo reprodukovat** (změna výšky okna u hranice = nula přepnutí).
Kdyby blikalo dál, další krok je hystereze, ne další ladění barev.

## Poradce

Vznikl před tokeny zaoblení, byl hranatý celý kromě spouštěče. Teď panel a bubliny
`--r-box`, karty a našeptávač `--r-ctl`, rychlé odpovědi a vstupy `--r-btn`. Na mobilu,
kde je přes celou obrazovku, zaoblení nula.

## Video v heru — ODLOŽENO, nenasazovat

7. 9. Tomáš poslal referenci s videem jako uzavřenou zaoblenou kartou s tlačítkem přehrát
a chtěl to takto, protože full-bleed varianta byla „moc velká". Postaveny dvě varianty
v `_nahled-hero-video.html` (A text nad videem, B video vedle textu), placeholder je plakát
z videa, video se stahuje až po kliknutí — při načtení jde po síti nula bajtů.

**Tomáš to pak zamítl slovy „nech ji byt asi? vsak hero je nove ted".** Hero zůstává tmavý
s obrázkem. Náhled i sady `img/flexi-video-plakat-*.webp` jsou netrackované, do produkce
se nedostanou.

**Kam to patří, až se video bude řešit znovu:** na homepage už JE prázdný slot
`.film__ramec` s nápisem „Něco se chystá". Je to přesně ta zaoblená 16:9 karta, jen prázdná.
Video tam jde vsadit i s klikacím plakátem, aniž by se sáhlo na hero.

## Otevřené drobnosti

- V `img/` leží nepoužívané sady `flexi-rada-*` a `flexi-rada2-*` z hledání kompozice.
  Používá se jen `flexi-hero-tmavy-*` a `flexi-hero-mobil-*`. Ke smazání.
- Původní `flexi-house-rozkladaci*.webp` už hero nepoužívá.
- Mobilní menu má bílé pozadí — nad průhlednou hlavičkou **nebylo vyzkoušeno otevřít**.
- Oblouk na skutečném telefonu (notch, měnící se `vh` podle adresního řádku)
  **neověřen**, jen v emulátoru.
- Testovací soubory `_test-*.html`, `_hero-*.html`, `_vize-hero.html`, `_motion-ladeni.html`
  a složka `_video/` jsou netrackované, ke smazání až nebudou potřeba.

## Kredit Gemini

Vyčerpáno ~185 Kč z 200. Klíč v `~/.flexi-ai-klic`, dobíjení na aistudio.google.com/billing
(účet vyžaduje **prepay**, postpaid samo nestačí).
