# 3D konfigurátor Flexi House — stav k 24. 8. 2026

## Kde to běží

Jen lokálně. Server se pouští z Claude Code (preview `flexihouse`, port 4599),
adresa `http://localhost:4599/konfigurator.html`.
Ručně: `node .claude/serve.js` ve složce projektu.

**Nic z toho není commitnuté.** Na flexihouse.cz 3D není a nebude,
dokud se to vědomě nepushne. `git status` ukáže:

    M  assets/flexi-konfigurator.css   – styly pro .kf-viz
    M  konfigurator.html               – blok náhledu + napojení na state.sel
    ?? assets/flexi-3d.js              – celý renderer
    ?? assets/tex/                      – textury z fotek

## Soubory

| co | kde |
|---|---|
| renderer | `assets/flexi-3d.js` (1130 řádků, bez závislostí) |
| textury | `assets/tex/` (~340 kB, 11 souborů WebP) |
| generátor textur | `podklady-3d/nastroje/textury.py` |
| snímkovač | `podklady-3d/nastroje/snimek.sh` |
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

## Rozměry, které model používá

Z webu (ověřené): 6,32 × 5,90 m rozloženo, 2,20 m složeno, výška 2,48 m.

Odečtené z fotek (poměry sedí, absolutní čísla čekají na doměření):
- výška stěny 2,35 m, podlaha 0,11 m nad terénem
- ocelový sokl 0,245 m, horní pás 0,225 m, sloupky 0,124 m
- rozteč spár ve fasádním plechu 1,15 m
- přesah střechy 0,26 m, lem 0,19 m, hřeben 1,24 m nad okapem (~20°)
- terasa hluboká 2,15 m, prkna po 148 mm se spárou 5 mm
- okna — průčelí: velké 1,32 × 1,04 (parapet 0,96), prosklené dveře
  se dvěma světlíky přes skoro celý střední modul, menší vpravo 0,94 × 0,80
  (parapet 1,16); zadní: 2× 1,30 × 1,02 (parapet 1,00), mezi nimi
  0,50 × 0,50 (parapet 1,42); boky: vpravo 1,10 × 0,88, vlevo 0,92 × 0,78

## Tvar střechy

**Hřeben běží kolmo k šestimetrovému průčelí**, tedy podél hloubky domu.
Ověřeno z dronu (DJI_0175, DJI_0179, IMG_2285).

**Střecha přechází nad terasu jako jedna plocha** — u ploché i u sedlové
(DJI_0169, DJI_0173). Terasa nemá vlastní přístřešek, jen dva černé
sloupky v rozích pod přesahem. Podhled kopíruje tvar střechy, takže na
verandě je krémový strop se sklonem a černé krokve (IMG_2302).

Pozor: poznámka o „hřebenu podél delší strany a asymetrických sklonech
23°/13°" z prvního kola byla chybná.

## Konstrukce podle fotek

Dům jsou tři moduly. Střední (přepravní rám) je **předsazený o ~4,5 cm**,
boční se do něj zasouvají — na IMG_2285 je ten schod jasně vidět.
Každý modul má vlastní ocelový rám: sokl, horní pás, sloupky na obou
průčelích. Fasádní plech je zapuštěný 2 cm za rámem.

Drobnosti, které dům dělají věrohodným: pozinkovaná zvedací lišta nad
středním modulem, kulatá bílá větrací růžice na zadní stěně, tři odpadní
vývody u paty, pozinkovaná okapnice pod tmavým lemem střechy,
betonové patky pod rohy.

## Co zbývá

1. **Kóty** — výška stěny, přesah střechy, skutečné rozměry oken.
   Výkres od výrobce nebo deset minut s metrem.
2. **Fotky šedé a černé fasády** — v sadě nejsou, všechny jednotky jsou cedrové.
   Ty dvě varianty jsou přebarvená stejná kresba dřeva.
3. **Ověřit tvar střechy s výrobcem** — fotky ukazují valbu, konfigurátor
   nabízí sedlovku. Model kreslí sedlovku.
4. **Video rozkládání** — kdyby se někdy dělala animace skládání,
   parametr `fold` v modelu pořád funguje.
5. Rozhodnout, jestli 3D půjde na produkci, a pak commitnout.

## Cache na produkci

`_headers` dává `/assets/*` `max-age=31536000, immutable`, ale soubory
nemají hash v názvu. **Při každé změně CSS nebo JS je nutné zvednout
`?v=` v odkazech ve všech HTML**, jinak vrácený návštěvník dostane nové
HTML se starou CSS. Přesně to se stalo při prvním nasazení 3D: stará CSS
neznala `.kf-viz__stage`, plátno se roztáhlo do 2^24 px a WebGL spadl.
Renderer teď velikost počítá z rodičovského prvku a zastropuje ji,
takže i s rozbitou CSS jen vykreslí menší náhled.

## Na co si dát pozor (draze zaplacené)

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
  Napoprvé byla dvakrát moc velká, ve výřezu to vidět nebylo.
- Textury se skládají posunem a prolnutím, ne zrcadlením. Zrcadlení
  udělá z terasových prken šrafuru.
- Fotky jsou ze zapadajícího slunce. Korekce bílé jen na polovinu,
  jinak z cedrové oranže bude myší šeď.
