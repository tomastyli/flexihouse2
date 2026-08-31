# 3D konfigurátor Flexi House — stav k 31. 8. 2026, ŽIVÉ (`flexi-3d.js?v=12`, `TEX_VERZE` 6)

## Kde to běží

Jen lokálně. Server se pouští z Claude Code (preview `flexihouse`, port 4599),
adresa `http://localhost:4599/konfigurator.html`.
Ručně: `node .claude/serve.js` ve složce projektu.

Náhled je od 24. 8. 2026 živý na flexihouse.cz/konfigurator.

## Soubory

| co | kde |
|---|---|
| renderer | `assets/flexi-3d.js` (1130 řádků, bez závislostí) |
| textury | `assets/tex/` (20 souborů WebP) |
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

## Změny 31. 8. večer — zařizovací předměty do realistické podoby

Dan Prokeš se ptal, jestli nejde interiér udělat věrohodněji. Nešlo o textury
ani o světlo, ale o to, že veškerý nábytek byl z ostrých kvádrů.

### Fazeta je ta jediná věc, která rozhoduje

Ostrá hrana dává tvrdý přechod mezi dvěma odstíny a mozek to čte jako hračku.
Skutečná dvířka mají fazetu kolem 2 mm, která po obvodu udělá tenkou světlou
linku. Nová funkce `kvadrF()` kreslí kvádr se zkosením: šest zmenšených stěn,
dvanáct pásků na hranách, osm rohových trojúhelníků.

Winding se neodvozuje, ale **kontroluje**: každý quad se porovná s vektorem
od středu kvádru a když normála míří dovnitř, pořadí vrcholů se otočí. Stejně
to dělá `loft()` a `vicko()`. Bez toho by se pořadí u dvanácti hran a osmi
rohů nedalo uhlídat a část ploch by byla černá.

### Co ještě dělalo „umělost"

**Spáry mezi čely byly bílé linky.** Za čely nebylo nic tmavého, takže linka
vypadala jako jeden odlitek. Nový materiál `spara` je tmavá deska schovaná za
čely; ve čtyřmilimetrových mezerách se objeví jako stín. Totéž v koupelně.

**Madla byla schovaná uvnitř korpusu.** Kromě špatného směru (viz ráno) měla
tyčka i nožky stejný poloměr, takže v pravém úhlu zůstala díra do trubky.
Nožky mají teď menší průměr a `trubka()` umí víčka.

**Oblouk baterie byl řetízek samostatných trubek.** Každá si volila vlastní
referenční vektor, prstence se mezi články nepotkaly a na výtoku byly schody.
`oblouk()` je teď jeden souvislý sweep se společným rámem.

**WC byly dva kvádry.** Teď je to loft: mísa z osmi prstenců (superelipsa,
mocnina 3,0 až 3,8), samostatné prkénko, zavřené víko, nádržka s víkem
a chromové dvojtlačítko. Rozměry ze specifikace: 0,37 × 0,68 × 0,78,
obruba 0,41.

**Skříňka umyvadla neměla dvířka vůbec.** Teď má dvoje s vloženou rámečkovou
výplní a dvě krátká madla u sebe uprostřed, plus chromový sifon pod mísou.

**Zrcadlová skříňka byla kvádr s plátkem skla.** Teď má tři otevřené
přihrádky na severní polovině, zrcadlová dvířka na jižní a římsu nahoře.

**Vanička byla hladká deska.** Přibyly protiskluzové drážky s roztečí 0,085
(16 pruhů), leštěný rám po celém obvodu, lineární žlab u paty zadní stěny
a práh na přední hraně.

### Sklo konečně propouští

Renderer uměl jen `sklo`, což je tmavá odrazivá tabule správná pro pohled na
dům zvenku. Uvnitř z toho byla černá díra: zástěna sprchy i prosklené dveře
vypadaly jako zeď. Nový příznak `cire` s parametrem `cireAlfa` se kreslí
v průhledném průchodu:

- `skloCire` (alfa asi 0,13) — čiré křídlo zástěny a výplň dveří D3
- `skloMat` (alfa 0,72) — matné křídlo, prosvítá skrz jako opravdové satináto

### Deska linky flekatá nebyla od stínu

Vypadalo to jako stínová akné, ale test s vypnutým stínem to vyvrátil a test
s vypnutou texturou potvrdil: nízkofrekvenční složka `deska.webp` měla
směrodatnou odchylku 2,4 úrovně a při dlaždici 0,30 m se opakovala každých
30 cm. Textura se propustila horní propustí (rozmazání přes zabalenou
dlaždici, aby neujely okraje), odchylka je teď 1,14 a jemné zrno zůstalo.
`TEX_VERZE` na 6.

**Postup, který to rozhodl, je v `uhly.html`:** `?test=nostin` vypne stínovou
mapu, `?test=notex` nahradí albedo šedou. Bez toho by se hádalo dál.

### Stínování ve výklencích

`ambSpecC` násobilo AO jen z 65 %, takže kovové a lesklé plochy v hlubokých
místech (vana dřezu, vnitřek skříňky) zůstávaly světlé. Sníženo na 82 %.
Přeměřeno na exteriéru: max rozdíl 5 úrovní jasu, žádný pixel nad 6,
tedy beze změny venku.

### Dřez byl celou dobu zakrytý, ne jenom světlý

Vana se tvářila jako plechová destička i po přestavbě na čtyři pásy kolem
otvoru. Ztmavení materiálu nedělalo **vůbec nic** a měření to potvrdilo:
průměrný jas výřezu vany zůstal na 163,2 i po změně materiálu z leštěného
kovu na matný tmavý. Do vany totiž vůbec nebylo vidět — **korpus skříňky je
plný kvádr a jeho horní plocha ve výřezu desky vanu zakrývala**. Vidělo se
na vršek korpusu 33 mm pod deskou, ne na dno vany 200 mm pod ní.

Opraveno `bez: 'y+'` na obou korpusech; horní plocha je pod deskou stejně
vždycky schovaná. Po opravě jas spadl na 40 (moc), doladěno materiálem
`nerezVana` (tint 0,62, rough 0,28, metal 0,55) a AO 0,55 až 0,93 na **102**,
tedy zřetelně tmavší než bílá deska. Přibyl odtok na střed vany.

**Poučení: než začneš ladit materiál, ověř, že se na tu plochu vůbec díváš.**
Stačilo změřit průměrný jas výřezu před a po — dvě čísla ukázala, že změna
nemá žádný efekt, a to je jiná diagnóza než „je to moc světlé".

### Linka dobíhá ke stěně

`IN.linkaA.x1` bylo 3,039, tedy 49 mm od stěny, a mezerou byla vidět podlaha.
Teď je 3,078. Do zadního rohu zajíždí rohový sloupek (líc 3,085), takže se
linka o něj opře a sloupek vystupuje nad deskou — přesně jak by byla deska
kolem sloupku vyříznutá. Sloupek zbytek k lící stěny vyplní, žádná škvíra.

### Čísla

Quadů 3 252 → **4 162** (+28 %). Koplanárních dvojic 7, součet ploch
0,0063 m2, tedy čistší než ráno při menší geometrii. Zkosení a AO
předpokládají, že se nábytek kreslí přes `kvadrF`, ne přes `sit.kvadr`.

## Změny 31. 8. — koplanarita, kuchyně a otevřený parapet

Tomáš hlásil dvě věci: „nesedí okno v kuchyni" a „z různých úhlů ty textury
bugují". Obojí jsou dvě různé příčiny a ani jedna není v texturách.

### Prokazatelně to nebyly textury, ale z-fighting

Renderer **nemá zapnuté ořezávání odvrácených stěn** (`CULL_FACE` se nikde
nezapíná, jen vypíná ve stínovém průchodu). Každá plocha, která ležela přesně
v rovině jiné plochy, se proto o pixely prala a výsledek se měnil s úhlem
pohledu. Na rendrech to vypadalo jako roztrhaná černá šmouha přes stěnu —
odtud „textury bugují".

Nejhorší dvojice byly rohové sloupky a stropní pás v rovině stěn, spára
u podlahy v rovině podlahy, spodek desky linky v rovině horní plochy korpusu
(1,0 m²) a záda skříněk v rovině stěny.

**Zapnout `CULL_FACE` globálně nejde** — vyzkoušeno a změřeno: interiér se
spraví, ale na exteriéru zmizí černý pás nad vchodem a kus rámu u štítu.
Winding a normály sice sedí (ověřeno na všech 3 322 quadech), ale exteriér
má plochy, které se schválně koukají z obou stran.

Opraveno **rozestoupením geometrie** o 1,5 až 10 mm, tedy bez zásahu do
rendereru. Konstanta `ODST = 0.003`. Kde se dvě opravy potkaly ve stejné
rovině (záda linky vs. spára u podlahy), jsou odsazení rozvrstvená.

### Nástroj, který to našel

`.docs/3d/nastroje/koplanarita.html` — načte `assets/flexi-3d.js` fetchem,
vloží do něj jeden řádek, spustí evalem a projde všechny quady: seskupí je
podle roviny a nahlásí dvojice různých materiálů, které se v té rovině
překrývají. **Nemá vlastní kopii rendereru**, měří to, co je v `assets/`.

Stav: **před 60+ dvojic, největší 1,0 m², dohromady ~2,5 m² →
po 8 dvojic, největší 0,0018 m², dohromady 0,0066 m².** Zbytek jsou
třísky schované uvnitř zařizovacích předmětů.

Úhly se dají projet přes `.docs/3d/nastroje/uhly.html?m=1&yaw=0.35&pitch=-0.1`
(`m` je index místa, `yaw`/`pitch` v radiánech, `pohled=ven` na exteriér).

### Kuchyně měla tři vlastní chyby

**Rameno B mělo čela i madla na opačném líci.** Rameno B stojí zády
k příčce koupelny na `x0`, odkrytý líc je `x1`. Dvířka i úchytky se kreslily
na `x0 - 0.018`, tedy dovnitř příčky. Celé rameno se dřezem bylo hladká bílá
bedna. Opraveno na `x1`, odkrytá délka 0,600 jižně od ramene A sedí se
specifikací.

**Obloučková madla byla schovaná v korpusu.** `madloIn` odsazovalo tyčku
o `z - 0.030`, tedy proti směru, kam čelo kouká. Z madel byly vidět jen
špičky nákližků jako dva tmavé body. Funkce má teď parametr směru a umí
i osu `z` pro rameno B.

**Dřez byl plechová destička.** Deska linky byla plný kvádr, vana se kreslila
uvnitř něj a lem přes ni jako celistvá deska. Deska ramene B i lem dřezu se
teď kreslí jako čtyři pásy kolem otvoru, stejně jako umyvadlo v koupelně.

### Parapet oken versus výška linky — zvolena varianta B

Tohle je ta „nesedící" věc a **jedním číslem se to vyřešit nedá**, jde
o bod N3 a N5 ze specifikace.

Model dnes kombinuje parapet **0,80 z výkresu** (0,649 nad podlahou)
s deskou linky **0,750**, což je hodnota odvozená z fotek pro parapet 0,88.
Deska proto leží 0,101 **nad** spodní hranou okna a zadní lišta zajíždí
0,159 do okna. Fotky přitom měří opak: horní plocha desky je 0,150 až 0,170
**pod** spodní hranou rámu a nad lištou je vždy pruh holé stěny.

Změřené varianty (podlaha 0,221, horní hrana panelu 2,165, spodek černého
pásu 2,307):

| varianta | parapet nad podlahou | deska | lišta → parapet | nadpraží → černý pás | nadpraží → panel venku |
|---|---|---|---|---|---|
| dnes | 0,649 | 0,750 | **−0,159** | +0,337 | +0,195 |
| A: nechat okna, snížit desku | 0,649 | 0,489 | +0,102 | +0,337 | +0,195 |
| B: zvednout okna | 0,794 | 0,680 | +0,056 | +0,192 | +0,050 |
| C: fotky doslova | 0,910 | 0,750 | +0,102 | +0,076 | **−0,066** |

A dává pracovní desku ve výšce 49 cm, C se nevejde pod horní pás.
**B je jediná, kde nic není absurdní.** Tomáš ji 31. 8. vybral, takže
v repu je `OKNO_PARAPET = 0.940` a deska linky 0,680 (parapet 0,789 nad
podlahou). Okna se tím zvedla o 140 mm i na exteriéru.

Rozložení linky drzí poměry ze specifikace: sokl 0,113 + čelo 0,530 +
deska 0,037. Tři čela zásuvkové skříňky se počítají z výšky korpusu,
dřív byly natvrdo 0,240 a společně dávaly 0,720 do korpusu vysokého 0,585,
takže spodní zajel pod sokl.

**Pozor, `pridej()` v `oknaNaStene` má pojistku `v + h > vyskaPole - 0.05`
a při vyšším parapetu okno tiše zahodí.** V prvním pokusu (parapet 0,975)
zmizely otvory v čelních a zadních panelech a z kuchyňského okna byla cedrová
stěna — na rendru to nevypadá jako zahozené okno, ale jako rozbitá textura.
Strop je 0,945 a tam vychází pojistka na 4e-16, tedy na hřebíku. Proto 0,940,
kde zůstává rezerva 5 mm. Kdo bude parapet měnit, musí tu rezervu přepočítat.

Metr to pořád rozhodne líp: pokud Tomáš změří parapet a výšku linky,
přepočítat obojí naráz, ne jedno bez druhého (body N3 a N5).

## Změny 26. 8. — patky, sítě do oken a rozbor textur

### Betonové patky (doplněk `footings`)

Nový stav `patky`. Patky se kreslí v `postav()` pod každý modul zvlášť:
dvě až tři v ose x, tři v ose z (čelo, střed, záda). Pod sloupky terasy
přibudou další dvě.

Tvar je dvoustupňový kvádr, spodní stupeň širší — jak vypadá patka po
odbednění. Materiál `beton`, textura z IMG_2294, kde dům na betonovém bloku
skutečně stojí.

Patka musí o pár centimetrů **přesahovat líc rámu**. Rám je nad terénem jen
o `LIFT` (70 mm), takže když patka končí pod soklem, není z padesátitisícového
doplňku v náhledu vidět vůbec nic. Kamera náhledu má sklon jen 14°, svislé
plochy u země jsou skoro neviditelné — čte se hlavně půdorys.

### Sítě do oken (doplněk `nets`)

Nový stav `site`. Renderer dostal **průhlednou vrstvu**: materiál s příznakem
`sit` se přeskočí v neprůhledném průchodu a dokreslí se až po něm s `BLEND`
a vypnutým zápisem do hloubky. Ve stínové mapě se síť vynechává úplně — je
z většiny díra a plný stín pod ní by byl horší než žádný.

Tkanina **není textura, počítá se ve fragment shaderu**. Pokrytí se odvozuje
analyticky z `fwidth`, takže se s odstupem plynule slije do rovnoměrného
závoje (`mira`) a nikdy nemoaruje. Textura sítě s rozteči 1,45 mm by přes
mipmapy dávala buď šum, nebo kaši.

Rámeček sítě musí vystupovat **před fasádu**, ne dovnitř ostění. V ostění je
ve stínu a doplněk pak na modelu nepozná nikdo. Vchodové dveře síť nedostávají
(`o.dvere`), doplněk je popsaný jako sítě do oken.

Zvenku se rozdíl pozná tak, že sklo ztratí odraz oblohy a zešedne. Zevnitř
je to zřetelnější — výhled ven ztmavne, přesně jako za skutečnou síťkou.

### Textury

**Podlaha byla špatně a nešlo to poznat z výřezu.** Zdrojový výřez zabíral
kromě podlahy i stěnu, sokl a práh dveří; z těch tvarů vznikly v textuře šikmé
šmouhy přes prkna. Nový výřez je čistá podlaha ze spodku IMG_2332.

Druhá, horší chyba: na fotce běží prkna **strmě, kolem 66° od vodorovné**.
Vzorek se bral jako obdélník z obrázku, takže žilky ležely napříč prknem
a podlaha vypadala jako pomačkaný papír. Vzorek se teď odebírá podél
naměřeného směru kresby (`smer_kresby`, `vzorek_podel`).

**Úhel kresby se nesmí hledat otáčením obrázku.** Bilineární převzorkování
v PIL samo zvýhodňuje některé směry: měření přes poměr gradientů dá po otočení
symetrickou křivku s propadem přesně na nule, tedy artefakt, ne kresbu.
Podle něj vyšel úhel 9° místo skutečných 66°. Spolehlivý je strukturní tenzor
nebo spektrum, obojí na neotočeném výřezu.

Normálová mapa podlahy se nesmí odvozovat z kresby. Vinyl je plochý, reliéf
nese hlavně zkosení spár — proto se ke skládání dlaždice vede vlastní pole
reliéfu.

**Terasová prkna.** Výřez je z fotky za západu slunce, nesl zlaté světlo a byl
o dost světlejší a žlutější než prkna ve dne. Odstín se stahuje na hodnotu
změřenou z denních fotek (IMG_2278, IMG_2358). Tón jednotlivých prken se navíc
srovnává na třetinu odchylky — tři tmavší kusy uprostřed výřezu se v dlaždici
opakovaly a terasa vypadala flekatá. Velkoplošné kolísání kleslo z 0,035 na 0,014.

**Mramor v koupelně.** Samotné tenké čáry vypadaly jako čmáranice propiskou.
Žilka má teď jádro, kolem něj široký měkký lem a po délce se ztrácí a zase
objevuje.

Ostatní textury (fasáda, střecha, podhled, rám, stěna, lamely, deska) jsou
podle měření velkoplošně rovné (kolísání pod 0,015) a zůstaly beze změny.

### Nástroje

`.docs/3d/nastroje/pohled.html` — snímkovací postroj, stav se předává
v adrese: `roof`, `facade`, `terrace`, `heat`, `pohled`, `m`, `patky`, `site`.


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

## 3D interiér (postaveno 25. 8. 2026, ŽIVÉ od 31. 8. 2026)

Interiér se staví jen v režimu `pohled: 'dovnitr'`, aby exteriérový náhled
nenesl jeho trojúhelníky ani textury. Kód je v `assets/flexi-3d.js`
(`postavInterier`, `kuchynIn`, `koupelnaIn` a pomocné funkce nad nimi),
textury generuje `.docs/3d/nastroje/textury_interier.py`, zkušební stránka
je `.docs/3d/nastroje/test-interier.html` (parametry `?m=0..4`, `&bez=1`
vypne vybavení, `&cist=1` schová ovládání kvůli snímkům).

### Půdorys je odečtený z vektorů výkresu, ne z obrázku

PDF výkresu je vektorové. Úsečky se vytáhnou přes `page.get_drawings()` a
měřítko drží kótovací řetězec pod půdorysem: **178,02 bodu = 6276 mm**, tedy
35,255 mm na bod. Kontrola: úseky řetězce 57,12 / 63,78 / 57,12 bodu dávají
2013 / 2249 / 2013 mm. Odtud jsou všechny polohy příček přesně, bez odhadování
z rastru.

### ZRCADLENÍ, nejdražší chyba tohoto kola

**Půdorys výkresu má opačnou orientaci x než renderer.** Průčelí je na
výkresu dole, tedy +z míří dolů po stránce, a proto x na výkresu roste
doprava, kdežto v rendereru je při pohledu shora obráceně. Kuchyň je na
výkresu vlevo, ale v rendereru patří na **-x**.

Poznat se to dá jen z fotky: na IMG_2351 stojí fotograf u vstupu a dívá se na
zadní stěnu, tedy podél -z. Při pohledu podél -z je vpravo +x (`right =
forward x up`), a na fotce je kuchyň VLEVO. První verze modelu to měla
obráceně a odhalil to až render vedle fotky, ne úvaha.

Řešení je obal `zrcadli(sit)`: layout se píše v souřadnicích výkresu a při
stavbě se překlápí (negace x a obrácené pořadí vrcholů kvůli normálám).
Kdo bude sahat na `IN`, píše čísla podle VÝKRESU, ne podle rendereru.

### Rozměry interiéru

| co | hodnota | odkud |
|---|---|---|
| podlaha (horní líc) | `LIFT + SOKL + 0,001` = 0,221 | sedí na základovém rámu |
| strop | `LIFT + H - 0,010` = 2,397 | pod horním rámem |
| světlá výška | **2,176** | dopočet; ověřovatel z fotek dal 2,15 až 2,23 |
| černý pás pod stropem | 0,090 | specifikace, dvě měření 85 a 89 mm |
| rohový sloupek, viditelná plocha | 0,150 | změřeno, rozptyl 0,13 až 0,17 |
| příčka | 0,060 | z výkresu, rozptyl 0,05 až 0,075 |
| vnitřní dveře | 0,800 x 2,050 | výkres |

Příčky v souřadnicích VÝKRESU (v modelu se zrcadlí):
koupelna x od -0,721 do +0,710, přední stěna koupelny z = -0,573,
stěna ložnic x = -0,746, příčka mezi ložnicemi z = +0,529 až +0,579
(zadní ložnice 3,179 m hluboká, přední 2,076 m, sedí na kóty 3180 a 2070).
Otvory: D3 x od -0,652 do +0,087, D2 zadní z od -0,420 do +0,380,
D2 přední z od +0,653 do +1,413.

**Kóta 2318 na výkresu není příčka, je to kótovací čára.** První odečet ji
vzal jako stěnu a vyšly z toho prohozené hloubky ložnic.

### Past: plné kvádry rámu z exteriéru

Exteriér kreslí sokl i horní pás jako **plné kvádry přes celý půdorys modulu**.
Podlaha ve výšce 0,203 i strop ve 2,407 se do nich schovaly a nebylo je vidět,
přestože v síti byly (`podlaha:16`, `stropIn:14` trojúhelníků). Poznalo se to
až tak, že se podlaha zvedla o 0,90 m a najednou byla vidět. V režimu interiéru
se proto oba pásy kreslí jako **prstenec o tloušťce 0,050 m**, ne jako kvádr.

### Další pasti z tohoto kola

- **Zevnitř se nesmí kreslit sklo ani zadní panel rámu okna.** Renderer nemá
  průhlednost, takže `sklo` i `ramecek` udělaly z okna černý obdélník. Obojí
  se v režimu interiéru přeskakuje a otvor je skutečně otevřený, takže jím
  prochází i slunce ze stínové mapy a na podlaze je vidět světelná stopa.
- **Vlastní rám okna zevnitř je zvlášť** (`ramOknaIn`), plochý černý lem
  0,042 m se svislou příčkou. Ostění samo je při čelním pohledu neviditelné.
- **Dvě stěny ve stejné rovině se prokreslují.** Přední stěna koupelny se
  proto kreslí dvakrát s odsazením o půl tloušťky příčky.
- **Prosklené křídlo nesmí být plný kvádr se sklem uvnitř**, sklo se schová.
  Kreslí se jako rám ze čtyř prutů a tabule mezi nimi.
- **Dveře do koupelny se kreslí OTEVŘENÉ**, jinak z chodby ani ze dveří není
  do koupelny vidět a záběr je k ničemu. Výkres je taky kreslí otevřené.
- Kamera uvnitř je pohled z místa, ne oběžnice: `ramuj()` v režimu interiéru
  jen dopočítá `cam.cil` z `cam.yaw` a `cam.pitch`, kolečko myši nedělá nic.
  Zorný úhel je 1,16 rad, venku zůstává 0,44.

### Oprava podle závěrečné specifikace

Závěrečná syntéza rozboru doběhla až po tom, co byl model postavený, a několik
čísel opravila. Celá je v repu v `.docs/3d/SPECIFIKACE-INTERIER.md`, do modelu
se z ní promítlo:

- černý pás pod stropem **0,090** místo 0,110 a **jen v křídlových modulech**;
  v chodbě a koupelně panel dobíhá přímo k lamelovému podhledu
- **dveře D3 mají ČIRÉ sklo**, matné patří sprchové zástěně
- kuchyňská deska **0,750** místo 0,900 (sokl 0,125, čela 0,585, deska 0,040)
- členění čel ramene A **0,397 / 0,397 / 0,597 / 0,297**, zásuvky tři po 0,240;
  původní 0,393 / 0,386 / 0,555 / 0,333 měřilo přes špatnou hloubkovou rovinu
- sprchový kout hluboký **0,65**, vanička 0,06 vysoká s nerezovým lemem a žlabem
- WC a skříňka s umyvadlem přesazené podle výkresu (WC z -2,197 až -1,680 a
  vysunuté 0,72 od stěny, umyvadlo z -1,389 až -0,589, hloubka 0,50, deska 0,82)
- ventilátor přesunutý **východně od okna W2**, rámeček 0,19
- prkna podlahy v obou **ložnicích napříč**, jinde podél hloubky
- stínová spára 0,015 v patě stěn místo soklu
- otvory D2 se musí vyříznout **v obou lících** příčky, jinak nejsou dveře
  z chodby vidět

**Výška desky 0,750 vyřešila i spor s oknem.** Při 0,900 deska křížila spodní
třetinu okna nad linkou, což fotky vylučují. Ale parapet zůstává otevřený:
výkres dává 0,80 nad spodkem boxu (asi 0,65 nad podlahou), fotky 0,83 až 0,92
nad podlahou. Dokud se to nezměří, je vztah linky a okna jen pravděpodobný.

### Proč interiér nejdřív vypadal jako z Robloxu

Tomášova reakce na první verzi. Příčina nebyla v texturách, ale v tom, že
podlaha, strop i stěny byly **jeden velký polygon na místnost**. AO se počítá
na vrchol, takže na čtyřech rozích velké plochy nemá kde vzniknout stín v koutě
a všechno je nasvícené úplně stejně.

Co to spravilo:

- `stenaSOtvory` umí volitelné `deleni` (interiér 0,30 m), takže stěna má síť
  vrcholů a AO na ní může ztmavit kouty, patu, podhled i okolí otvorů
- `plocha()` kreslí podlahu a strop po dlaždicích 0,34 m s AO funkcí
- `aoRoviny()` počítá zastínění ze vzdálenosti ke stěnám místnosti a od
  půdorysů překážek, takže pod kuchyňskou linkou, pod WC a pod umyvadlem je
  kontaktní stín
- černá ocel a křídla dveří dostaly texturu `ram` s tmavým nádechem; plochá
  barva bez struktury byla druhá polovina toho dojmu
- okolní světlo v interiéru je víc směrové (větší rozdíl mezi zenitem a zemí)

**Podlaha vypadala jako flekaté parkety**, dokud se nezpřísnilo vyrovnání
osvitu ve zdrojovém výřezu (sigma 200 na 70) a nesnížilo kolísání jasu mezi
prkny na 0,008. Dlaždice je teď 6 prken na šířku a 2 na délku.

**Nad příčkou zůstával nezakrytý proužek** a byla jím vidět cedrová fasáda jako
oranžový průsvit u stropu. Strop středního modulu se proto kreslí až na vnější
líce obou příček, ne jen mezi jejich vnitřní líce.

### Zárubeň nesmí procházet skrz líc stěny

Na tmavých prvcích byly vidět jemné přerušované čáry. Vypadaly na stínovou
mapu i na prokreslování rohových sloupků, ale ani jedno to nebylo. Rozhodl až
render, kde měl každý materiál křiklavou barvu: na modré zárubni byly ZELENÉ
čárky, tedy stěna.

Příčina: kvádr zárubně byl širší než tloušťka stěny, takže jí procházel skrz.
V ostrém úhlu se pak jeho líc a líc stěny perou o hloubku. Zárubeň se proto
kreslí ve dvou částech: ostění sedí MEZI líci stěny (odsazené o 2 mm) a
obložka je samostatná lišta 8 mm PŘEDSAZENÁ před líc. Stejně je opravená
i zárubeň prosklených dveří do koupelny.

Obecně: dva viditelné líce nikdy nenechávat blíž než pár centimetrů, pokud
jeden druhý spolehlivě nezakrývá.

### Dveře do ložnic se kreslí otevřené

Stejně jako u koupelny. Zavřená křídla dělala z chodby slepou stěnu a z ložnic
nebylo nic vidět. Podle výkresu se D2 otevírají dovnitř ložnice a panty jsou
u příčky mezi nimi, takže křídla nestojí v cestě ani jednomu stanovišti.

### Chůze po domě (jako Street View)

Klikání na tlačítka místností Tomášovi nestačilo, chtěl se pohybovat sám.
Uvnitř se proto **tažením rozhlížíš a kliknutím na podlahu se přesuneš**.
Tlačítka místností zůstala jako rychlé skoky, po ručním pohybu se odznačí
(renderer posílá na plátně událost `flexipohyb`).

Jak to funguje: `smerZBodu` udělá z bodu na plátně směr paprsku přes inverzní
matici, kterou si stejně počítá obloha (`pickInv`), `podlahaZBodu` ho protne
s rovinou podlahy a `jdiNa` po ní dojde.

**Kolize je seznam pochozích obdélníků, ne fyzika.** `plochyChuze` vrací
místnosti zmenšené o 0,30 m (poloměr člověka) plus samostatné spojky ve
dveřních otvorech, `prekazkyChuze` vrací půdorysy linky a zařizovacích
předmětů. Cesta se navzorkuje po 3,5 cm a jde se, dokud jsou vzorky platné.
Když je cíl mimo, nejde se nikam; když cesta narazí, kamera se zastaví u zdi.

Dvě pasti, na kterých to nejdřív nefungovalo:

- **Přednastavená stanoviště ležela mimo pochozí plochy** (o pár centimetrů),
  takže první vzorek byl neplatný a chůze se nikdy nerozjela. `dojdi` proto
  neplatný začátek přeskočí a začne měřit, až vstoupí do platné plochy.
- **V headless Chromu neběží `requestAnimationFrame`**, když stránka nic
  nekreslí, takže se animace v testu netvářila, že běží. Není to chyba kódu.
  Testovací stránky `.docs/3d/nastroje/chuze_test.html` a `chuze_snim.html`
  si proto rAF nahrazují časovačem.

### Vstup dovnitř musí být vidět

Samotný přepínač ZVENKU/UVNITŘ pod plátnem si nikdo nevšiml. Nad exteriérovým
náhledem je proto tlačítko **PROJÍT SI DŮM ZEVNITŘ** a konfigurátor přepíná sám:

- při vstupu do kroku Interiér se náhled přepne dovnitř
- při návratu do kroku Exteriér zase ven
- kliknutí na volbu **Koupelna** skočí rovnou do koupelny, na **Kuchyňskou
  linku** do kuchyně

**Past:** přednastavené volby se při načtení stránky aplikují voláním
`selectOption`, takže se náhled přepínal dovnitř hned po otevření stránky.
`selectOption` proto bere druhý parametr `odUzivatele` a přepíná jen na
skutečné kliknutí.

### Drobnosti se nedají dělat z kvádrů

Tomášova připomínka, že kliky, dřez a umyvadlo vypadají pixelovaně. Byly to
tenké kvádry, takže měly ostré hrany a v malém se rozpadaly. Přibyly proto
`trubka()` (válec mezi dvěma body) a `oblouk()` (výseč prstence z trubek) a
z nich jsou udělané kliky s rozetou, kuchyňská i umyvadlová baterie s obloukovým
výtokem, sprchová tyč, madla skříněk a panty. Umyvadlo je skutečná prohlubeň:
deska se kreslí jako čtyři pásy kolem otvoru a mísa má šikmé stěny a výpust.

Vykreslovací měřítko má teď spodní hranici 1,6 (`DPR`), takže i na displeji
bez retiny se kreslí s přesahem a hrany nejsou zubaté.

**Sprcha nebyla vidět,** protože obě křídla zástěny byla zavřená a matné sklo
ji schovalo. Pravé křídlo je teď odsunuté za levé, takže je do sprchy vidět
hlavice, tyč i baterie. Odpovídá to i fotkám, kde je matné jen jedno křídlo.

### Materiály a textury interiéru

Textury se dotahují až při prvním přepnutí dovnitř (jsou v `ODLOZIT`), takže
exteriérový náhled se nezpomalil. `TEX_VERZE` je 4.

| textura | jak vznikla |
|---|---|
| `podlaha` | procedurální prkna 0,190 x 1,285 m, kresba vzorkovaná z IMG_2332, základ #91714F změřený jako medián podlahy na IMG_2336 |
| `stena-in` | procedurální, panel je ve skutečnosti skoro bez kresby; jen zvlnění plechu a šev |
| `lamely` | procedurální drážky po 0,118 m, barva z IMG_2349 |
| `mramor` | procedurální žilky, barva z IMG_2347; **výřez z fotky se nepoužil schválně**, zapekl by do textury odlesky, rohy a skříňku |
| `deska` | výřez z IMG_2353, což je plochý snímek desky shora |

### Co interiér záměrně NEMÁ

Dům se dodává holý. Modeluje se jen kuchyňská linka a koupelna, obojí navázané
na volby `equipment` v konfigurátoru (`kuchyn`, `koupelna`). Když se koupelna
odebere, zmizí i mramorový obklad, protože ho ceník uvádí jako její součást.
Žádný nábytek, postele, dekorace ani kávovar. **Varná deska se nekreslí**:
výkres ji sice má, ale na žádné fotce nainstalovaná není a deska linky je
celistvá, a volba se jmenuje „linka s dřezem a místem pro spotřebiče".

### Co v interiéru zbývá doměřit metrem

1. **Světlá výška** od podlahy ke stropu. Model má 2,176 m jako dopočet.
2. **Šířka podlahového prkna**, model má 0,190 m jako odhad.
3. **Výška kuchyňské desky.** Model má 0,900 m, ale poměry na fotkách vůči
   parapetu dávají 0,72 až 0,84, takže si to odporuje.
4. Rozteč drážek lamelového podhledu (0,118 m je odhad v rozsahu 0,09 až 0,15).
5. Hloubka sprchy 0,60 m je z výkresu, na fotce se dá číst i 0,70.

## Nálezy k EXTERIÉRU z nové sady fotek, ZATÍM NEPROVEDENO

Ve složce z 25. 8. přišly i snímky terasy a štítu. Rozbor z nich vytáhl tři
věci, které si odporují s modelem. **Nic z toho jsem nezměnil**, protože dvě
z nich jdou proti číslům, která zadal Tomáš, a tvar střechy se v tomto projektu
už jednou překreslil špatně. Rozhodnout musí on.

1. **Rozteč prken terasy 0,143 m, model má 0,148.** Tohle je nejlíp doložené:
   měřeno na dronovém snímku DJI_0170 rektifikací půdorysné roviny přes známou
   šířku domu 6,276 m, jedenáct po sobě jdoucích spár vyšlo 0,1405 až 0,1461 m.
   Prkno 0,135, spára 0,008. Změna je 3,5 procenta a je na ni potřeba
   přegenerovat `prkna.webp` a zvednout `TEX_VERZE`.
2. **Sklon střechy vychází asi 8 stupňů, model má 15.** Číslo 15 je od Tomáše.
   Vyfotografované jednotky navíc podle starších poznámek mají plochou nebo
   velmi mírnou střechu, takže se může měřit něco jiného, než se nabízí.
3. **Štít vypadá na černý plechový lem, ne na fasádní plech v dekoru cedru.**
   Cedr na štítu není na žádné fotce. Model kreslí cedr.

Dál: hloubka terasy vychází 2,04 m (model má 2,15), příčné černé profily jsou
dva v osách spár mezi moduly a sloupky pod střechou nad terasou jsou čtyři,
ne dva. Kulatý otvor v tmavé desce na IMG_2355 a IMG_2356 jsou technologické
díry ve sloupku u vstupu, do modelu nepatří.

Ověřovací kolo u zóny terasy a štítu doběhlo až po zbytku, takže tyhle body
prošly jen jedním párem očí. Před zásahem do modelu je přeměřit.

## Podklady pro 3D interiér

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
