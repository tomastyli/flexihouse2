# 3D konfigurátor Flexi House — stav k 24. 8. 2026 (textury přeměřené večer)

## Kde to běží

Jen lokálně. Server se pouští z Claude Code (preview `flexihouse`, port 4599),
adresa `http://localhost:4599/konfigurator.html`.
Ručně: `node .claude/serve.js` ve složce projektu.

Náhled je od 24. 8. 2026 živý na flexihouse.cz/konfigurator.

## Soubory

| co | kde |
|---|---|
| renderer | `assets/flexi-3d.js` (1130 řádků, bez závislostí) |
| textury | `assets/tex/` (~226 kB, 12 souborů WebP) |
| generátor textur | `.docs/3d/nastroje/textury.py` |
| snímkovač | `.docs/3d/nastroje/snimek.sh` |
| zdrojové fotky | `podklady-3d/fotky/` (43 ks, 447 MB) |

Renderer je samostatný modul bez závislostí. API se od minula nezměnilo:
`Flexi3D.vytvor(canvas, {pomer})` → `.nastav({roof, facade, terrace, heat, fold})`,
`.prekresli()`, `.prizpusob()`, `.stav()`.
Napojení v `konfigurator.html` (`vizStav`, `vizObnov`, `vizStart`) zůstalo beze změny.

## Co se změnilo 24. 8.

Renderer byl **přepsán z canvasu 2D na WebGL2**. Původní verze kreslila
malířovým algoritmem s afinním mapováním textur — bez stínů, bez odlesků,
s viditelnými zlomy uvnitř stěn. Nová verze počítá:

- fyzikální stínování (GGX, kov/drsnost zvlášť pro každý materiál)
- mapu stínů 2048² s měkkým okrajem (střecha na stěnu, sloupky na terasu, dům na terén)
- analytické okolní světlo — obloha nad obzorem, odraz od země pod ním
- odrazy ve skle a v lesklém plechu fasády, včetně pásu krajiny u obzoru
- ACES tónování a MSAA

Bez WebGL2 se plátno nahradí fotkou `img/flexi-house-1200w.webp` a posuvník
rozložení se skryje.

Náhled se **vždy vykresluje ve světlém režimu**. Web tmavý režim nemá;
původní verze se řídila `prefers-color-scheme`, takže na Macu v tmavém režimu
byl náhled tmavý uprostřed bílé stránky.

Textury jsou znovu vyříznuté z fotek, ve WebP a s normálovými mapami.
Šedá a černá fasáda se stahují až při první volbě (úspora 145 kB).
Při načtení stránky se táhne 266 kB textur.

## Změny 24. 8. večer (podle Tomáše)

- **Náhled je hlavní prvek stránky.** Layout konfigurátoru je dvousloupcový:
  vlevo přilepené plátno v poměru 5:4 (`.kf-stage` + `.kf-viz__stage`),
  vpravo kroky a shrnutí (`.kf-choices`). Pod 1080 px se skládá pod sebe,
  náhled zůstává první.
- **Posuvník rozložení je pryč** — nabízí se jen jedna velikost, takže
  neměl co ovládat. Model má `fold` napevno 1; API zůstalo, kdyby se
  někdy dělalo video rozkládání.
- **Sedlová střecha místo valby.** Hřeben běží kolmo k šestimetrovému
  průčelí, sklon ~20°, na obou koncích svislý štít z fasádního plechu.
  Nad terasou je štít otevřený, takže veranda má klenutý krémový podhled
  s krokvemi kolmo na hřeben a hřebenovou vaznicí — jako na IMG_2302.
- **Betonové patky pryč**, dům sedí na terénu (`LIFT` 0,30 → 0,11 m).
  Textura betonu se už negeneruje ani nenačítá.
- Sjednoceno: `.kf-group__hint` je blok, jinak se lepil k názvu skupiny
  („FASÁDAvšechny varianty bez příplatku").

**Pozor na rozpor:** vyfotografované jednotky v Litomyšli mají VALBOVOU
střechu (DJI_0175, DJI_0179, IMG_2285). Model kreslí sedlovou, protože
tak se ta volba v konfigurátoru jmenuje a Tomáš ji tak popsal. Kdyby se
dodávaly domy jako na fotkách, vrátit valbu — kód je v gitu v předchozí
verzi souboru.

## Textury — jak vznikají a co je na nich změřené

Textury nejsou kreslené. Každá je **rektifikovaný výřez z fotky**: fotka se přes
homografii převede na kolmý pohled se známým měřítkem (px na metr) a teprve pak
se z ní bere dlaždice. Proto kresba na modelu vychází ve skutečné velikosti.

**Fasáda** — zdroj IMG_2285 (28mm objektiv, nejmenší zkreslení ze všech fotek).
Rovina se rektifikuje přes **čtyři rohy malého okna** na zadní stěně; ty se
najdou fitem přímek na hrany černého rámu, ne od oka. Měřítko drží šířka
středního (přepravního) modulu 2,20 m z katalogu: v rektifikovaném obraze měří
modul včetně rámu 2,224 jednotky, takže okno vychází **0,539 × 0,560 m** a
**rozteč kresby prken ve fasádním plechu 0,220 m**.

Rozteč je ověřená ze tří nezávislých fotek: IMG_2285 střední modul 0,224 m,
IMG_2285 levý modul 0,221 m, DJI_0173 dlouhá stěna ~0,23 m. Bílá se bere z
**větrací růžice na téže stěně** (0,950 / 1,001 / 1,049) — zadní stěna je ve
stínu, takže fotka je studená, ne teplá, a šedý svět by z cedru udělal hnědou.

Okno, růžice a přepálené odlesky se z pásu vyříznou a doplní **posunem o celý
násobek rozteče prken**, aby kresba navazovala; teprve co zbude, se doplní
svisle. Dlaždice je **1,15 × 1,88 m** = přesně viditelná část panelu
(`panelH = 2,35 − sokl 0,245 − překlad 0,225`), takže se svisle vůbec neopakuje
a nikde není vodorovný šev.

**Prkna terasy** — zdroj IMG_2277 (14mm). Vodorovná rovina se rektifikuje přes
**úběžnici**: z rozestupů spár mezi prkny podél svislého řezu se projektivním
fitem najde horizont (Y ≈ 2330 px), z EXIF se vezme ohnisko (14 mm na 8064 px =
3136 px) a z toho vyjde normála roviny. Výška fotoaparátu nad podlahou se
dopočítá tak, aby rozteč prken vyšla **0,148 m** — vyjde 1,184 m, což na drženém
telefonu sedí. Po rektifikaci jsou spáry rovnoběžné a stejně daleko od sebe;
to je kontrola, že rektifikace sedí.

**Pozor: 14mm objektiv má u kraje snímku zbytkové soudkové zkreslení.** V levé
třetině IMG_2277 vychází rozteč 0,164 m, uprostřed 0,148 m. Výřez se proto bere
**jen ze středu snímku** a měřítko se ještě dorovná na naměřenou rozteč.

Dlaždice je 1,184 m = **8 prken**, takže spáry navazují přesně. Prkna běží
rovnoběžně s domem (na fotkách IMG_2277 i IMG_2298), takže v textuře jsou spáry
**svislé** — v UV mapě odpovídá u hloubce terasy a v šířce domu.

**Podhled** — IMG_2300, strukturní krémový plech. Měřítko odečtené ze stěny na
téže fotce (rozteč kresby prken 0,220 m dává ~1250 px/m), dlaždice **0,66 m**;
v `flexi-3d.js` tomu odpovídá `PODHLED_DLAZ`.

**Rám** — IMG_2299, matný kus ocelového nosníku bez odlesku. **Střecha** —
DJI_0178, čistý kus plechu mezi svary; šedá je neutrální, takže šedý svět je
namístě. Svar se dokresluje na okraj dlaždice.

Odlesky se odečítají dichromatickým modelem: lesk je bílý přídavek, takže se
z dolní obálky min-kanálu odhadne, kolik modré a zelené povrch „má mít", a co je
nad, se odečte ze všech kanálů. Přepálená místa (max > 0,985) už nejde
zachránit — ta se maskují a zaplatují.

### Co na texturách zůstává odhadnuté

- **Rozteč prken 0,148 m** — číslo z prvního kola, ne změřené. Rektifikace ho
  jen přijme a spočítá k němu výšku fotoaparátu. Kdyby prkna byla 0,145 nebo
  0,150 m, textura bude o 2 % jinak. Bez metru to líp nejde.
- **Šedá a černá fasáda** jsou přebarvená stejná kresba. Fotky těch variant
  neexistují, všech 43 snímků je cedrových.
- **Měřítko podhledu, rámu a střechy** je odvozené z odhadnuté vzdálenosti
  fotoaparátu. U náhodné jemné struktury to nevadí, u fasády nebo prken by to
  vadilo — proto se tam měřítko počítá, ne hádá.

### Cache textur

Textury nemají hash v názvu a `_headers` na ně dává `immutable` na rok. Renderer
si proto lepí `?v=` z konstanty `TEX_VERZE` v `assets/flexi-3d.js`.
**Při každé změně obsahu textur je nutné TEX_VERZE zvednout**, jinak vrácený
návštěvník uvidí staré textury s novým modelem.

## Rozměry, které model používá

Od 25. 8. 2026 jsou z **výrobního výkresu** (UPS Housing, 01/01, měřítko 1:100,
`~/Desktop/Expandable container house drawing.pdf`). Do té doby byly odečtené
z fotek a většina byla vedle.

| co | model | výkres |
|---|---|---|
| šířka rozloženo | 6,276 | 2013 + 2250 + 2013 = 6276 |
| střední (přepravní) modul | 2,250 | 2250 |
| boční moduly | 2,013 | 2013 |
| hloubka přes střední modul | 5,850 | 225 + 5400 + 225 = 5850 |
| hloubka bočnice | 5,400 | 5400 |
| výška boxu | 2,337 | 2337 |
| pod boxem (patky) | 0,070 | 70 |
| nad boxem (střecha) | — kreslí se zvlášť | 95 |
| předsazení středního modulu | 0,225 | 225 na každé straně |

**Kóta 2337 je výška boxu VČETNĚ ocelových rámů, ne výška fasádního panelu.**
Výšku rámů výkres nekótuje, takže se bere z poměru změřeného na rektifikované
fotce (IMG_2285): horní pás **0,242**, panel **1,945**, sokl **0,150**. Součet
sedí na 2,337. Čísla 70 a 95 jsou patky pod boxem a střešní nástavba nad ním —
kdo si je splete s rámy, dostane dům bez černé příčky nad okny.

**Otvorů je devět a jsou jen tří druhů:**

| označení | ks | rozměr | kde |
|---|---|---|---|
| W1 | 8 | 1120 × 1100 | po dvou na každé ze čtyř stěn |
| W2 | 1 | 700 × 400 | zadní stěna, uprostřed, parapet 1,55 |
| D1 | 1 | 1500 × 2190 | průčelí, uprostřed |

Okna na bočnicích jsou 1,43 m od každého rohu, parapet všech W1 je 0,80 m nad
spodkem boxu. D2 a D3 (800 × 2050) jsou dveře vnitřní, model je nekreslí.

**Předsazení středního modulu je 225 mm, ne 45.** První kolo ho odečetlo z fotky
a bylo pětkrát vedle.

## Co výkres neřeší

Na zadní stěně kreslí model kulatou větrací růžici a tři odpadní vývody u paty
podle fotek — na výkresu nejsou. Rozteč spár ve fasádním plechu (`PANEL`, 1,15 m)
výkres taky neuvádí, drží se odečtená hodnota.

Na fotkách má malé okno na zadní stěně poměr stran zhruba 1:1, kdežto W2 je podle
výkresu 700 × 400, tedy výrazně na šířku. Model kreslí výkres. Buď se dodávaná
verze liší, nebo je na fotkách jiná zakázka.

## Tvar střechy

**Hřeben běží kolmo k šestimetrovému průčelí**, tedy podél hloubky domu.
Ověřeno z dronu (DJI_0175, DJI_0179, IMG_2285).

**Střecha přechází nad terasu jako jedna plocha** — u ploché i u sedlové.
Není to samostatný přístřešek: stejný plech, stejný spád, stejná barva,
žádná spára. Nejlíp je to vidět na DJI_0169, DJI_0171, DJI_0173 a IMG_2279.
Přesah nad terasou nesou **dva tenké rohové sloupky** u přední hrany.
Podhled kopíruje tvar střechy, takže na verandě je krémový strop se sklonem
a černé krokve kolmo na hřeben (IMG_2277).

**Pozor, tohle už bylo jednou přehozeno špatně.** 24. 8. odpoledne se model
překreslil na „terasa má vlastní světlejší přístřešek se spárou" a tak to
šlo i do poznámek. Na fotkách nic takového není. Kdyby to někdo chtěl vracet,
napřed se podívat na DJI_0171 — tam je jedna rovina plechu vidět úplně jasně.

Pozor: poznámka o „hřebenu podél delší strany a asymetrických sklonech
23°/13°" z prvního kola byla chybná.

## Konstrukce podle fotek

Dům jsou tři moduly. Střední (přepravní rám) je **předsazený o ~4,5 cm**,
boční se do něj zasouvají — na IMG_2285 je ten schod jasně vidět.
Každý modul má vlastní ocelový rám: sokl, horní pás, sloupky na obou
průčelích. Fasádní plech je zapuštěný 2 cm za rámem.

Drobnosti, které dům dělají věrohodným: pozinkovaná zvedací lišta nad
středním modulem, kulatá bílá větrací růžice na zadní stěně, tři odpadní
vývody u paty, pozinkovaná okapnice pod tmavým lemem střechy. Betonové patky
model nekreslí, Tomáš je zamítl — dům sedí na terénu.

## Co zbývá

1. **Fotky šedé a černé fasády** — v sadě nejsou, všechny jednotky jsou cedrové.
   Ty dvě varianty jsou přebarvená stejná kresba dřeva.
   Doměřit rozteč prken terasy metrem — 0,148 m je pořád odhad z prvního kola.
3. **Ověřit tvar střechy s výrobcem** — fotografované jednotky mají plochou
   nebo velmi mírně spádovou střechu, konfigurátor nabízí plochou i sedlovou.
   Model kreslí obojí, sedlovku se sklonem 15 °.
4. **Video rozkládání** — kdyby se někdy dělala animace skládání,
   parametr `fold` v modelu pořád funguje.
5. Zvednout `TEX_VERZE` a `?v=` u JS a CSS při každém dalším zásahu do textur.
6. **3D interiér** — další krok, viz níže.

## Podklady pro 3D interiér

Výkres dispozici řeší, takže se nemusí odhadovat z fotek:

- **levý modul** (2013 × 5400) obývací prostor s kuchyňskou linkou u zadní stěny,
  varná deska a dřez; kóty linky 1667, 600, 600, 900
- **střední modul** (2250 × 5850) koupelna se sprchou, WC a umyvadlem u zadní
  stěny (kóty 1442, 500, 800, 2260), pod ní chodba se vstupem D1
- **pravý modul** (2013 × 5400) dvě ložnice oddělené příčkou, každá s postelí
  u vnější stěny; kóty 3180, 2318, 2318, 2070

Vnitřní dveře: **D2 dvakrát a D3 jednou, všechny 800 × 2050**. D3 vede do
koupelny, D2 do obou ložnic.

Druhá strana výkresu je **elektro a rozvod vody** — 9 zásuvek, 6 stropních
světel, 1 downlight, rozvaděč, chránič bojleru. Zásuvky ve výšce 1,3 m,
klimatizace 2,1 m. Pro model interiéru to je zdroj poloh svítidel.

Fotky interiéru jsou v sadě: kuchyň, obývák, obě ložnice a koupelna
(IMG_2286 až IMG_2301). Materiály na nich jsou jiné než venku — bílé stěny,
světlá podlaha — takže textury z fasády se použít nedají.

## Cache na produkci

`_headers` dává `/assets/*` `max-age=31536000, immutable`, ale soubory
nemají hash v názvu. **Při každé změně CSS nebo JS je nutné zvednout
`?v=` v odkazech ve všech HTML**, jinak vrácený návštěvník dostane nové
HTML se starou CSS. Přesně to se stalo při prvním nasazení 3D: stará CSS
neznala `.kf-viz__stage`, plátno se roztáhlo do 2^24 px a WebGL spadl.
Renderer teď velikost počítá z rodičovského prvku a zastropuje ji,
takže i s rozbitou CSS jen vykreslí menší náhled.

## Na co si dát pozor (draze zaplacené)

- **Lem štítu patří přesně na hranu střechy, ne před ni.** Když je posunutý
  dopředu, zůstane mezi ním a hranou střechy štěrbina a tou je při pohledu
  shora vidět podhled — na štítu z toho vznikne světlý klín, který vypadá jako
  rozbitá textura. Lem se proto sází o 12 mm dovnitř a je hlubší než tloušťka
  střechy, aby hranu s jistotou přebral.
- **Štít se musí kreslit po modulech, každý v rovině svého modulu.** Střední
  modul je předsazený o 225 mm, takže jeden štít přes celou šířku leží před
  bočními moduly a zakryje jejich horní ocelový pás — na průčelí pak chybí
  černá příčka mezi stěnou a střechou. Štít taky začíná až na `y1`, ne na
  `y1 - PREKLAD`, jinak si s tím pásem leze do cesty.
- **Podhled nesmí být jedna plocha přes celý půdorys.** Když se natáhne i nad
  interiér, protne štítovou stěnu a na štítu z něj zůstane šedý klín, který
  vypadá jako rozbitá textura. Kreslí se proto po pásech: zadní přesah, oba
  boční přesahy a plocha nad terasou (`podhledPas`). Nad interiérem je strop,
  ne podhled — pod střechu tam stejně není vidět.
- **Štít musí kopírovat spodek střechy, ne mířit přímkou k hřebeni.** Přímka
  od paty stěny k vrcholu je strmější než střešní rovina, takže po stranách
  zůstanou klíny a je jimi vidět pod střechu. Štít se proto skládá ze dvou
  lichoběžníků (levá a pravá polovina od hřebene), jejichž horní hrana je
  `podhledY(x)`.
- **Trojúhelník kreslený jako `quad(mat, A, B, C, C)` dostane rozbité UV.**
  `quad` počítá `eV = d - a`, což je u štítu šikmá hrana ke hřebeni, a oběma
  vrcholům `C` přiřadí jiné UV. Kresba fasády pak na štítu běží šikmo podle
  sklonu střechy místo svisle. Štít proto předává UV napřímo přes `o.uv`,
  spočítané ze světových souřadnic (`u` ze `x`, `v` ze `y`) — mapování je
  afinní, takže vyjde přesně stejné jako na stěně pod ním. Stejnou pastí
  prochází i `kotouc()`, tam ale nevadí: kreslí se jen materiálem bez textury.
  Po přechodu štítu na lichoběžníky je `o.uv` potřeba i tak — počítá se z x a y,
  aby kresba na štítu navazovala na stěnu pod ním.
- **Vada v tak členitém místě se očima z náhledu neurčí.** Šedý klín na štítu
  vypadal postupně jako chybějící podhled, jako lem a jako sklo. Rozhodl až
  render, kde má každý materiál křiklavou barvu (`MAT[x].tex = null` a výrazný
  `tint`), plus výpis počtu trojúhelníků a rozsahů souřadnic po dávkách.
- Kvádr vedený přes celou hloubku domu na `x = ±half` zakryje bočnici
  svojí vnější stěnou. Rohové sloupky musí být krátké úseky u rohů.
- Krokve verandy musí být kolmo na hřeben, ne podél něj. Podél hřebene
  vypadají jako poházené tyče.
- Sloupek terasy uprostřed končí přesně před vchodem. Jen dva rohové.
- Spodní plocha okapnice přes celý půdorys přebije podhled — okapnice
  je jen úzký lem po obvodu.
- Krokve terasy musí kopírovat spodek střechy, jinak u valby prorazí
  skrz střešní rovinu.
- Odraz od země (`zeme` v `prostredi`) drží podhledy a spodky prvků;
  když je nízký, veranda zčerná.
- Měřítko kresby fasády se pozná jen porovnáním se snímkem celé stěny.
  V prvním kole byla kresba 2,5× moc velká — výřez z IMG_2289 široký jednu
  planku (0,22 m) se natahoval na celý panel 1,15 m. Ve výřezu to vidět nebylo,
  až vedle rektifikovaného snímku celé stěny.
- Dlaždice fasády musí být vysoká přesně `panelH` (1,88 m), ne výška stěny
  2,35 m. Když je vyšší, chybějící kus se musí něčím doplnit a zrcadlený šev
  je na stěně vidět jako vodorovný pruh nad soklem.
- Textury se skládají posunem a prolnutím, ne zrcadlením. Zrcadlení
  udělá z terasových prken šrafuru.
- Fotky jsou ze zapadajícího slunce. Korekce bílé jen na polovinu,
  jinak z cedrové oranže bude myší šeď.
