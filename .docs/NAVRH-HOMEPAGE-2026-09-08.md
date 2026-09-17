# Homepage, návrh z 8. 9. 2026

Nikde nenasazeno. Živá homepage je pořád `index.html` beze změny.

## Kde to je

- rozcestník: `/_navrh-home.html`
- **návrh M, poslední, platí tenhle: `/_navrh-home-M.html`** (styly `_navrh-home-m.css`)
- návrh L, starší: `/_navrh-home-L.html` (styly `_navrh-home-l.css`)
- návrh K, starší: `/_navrh-home-K.html` (styly `_navrh-home-k.css`)
- návrh J, starší: `/_navrh-home-J.html` (styly `_navrh-home-j.css`)
- návrh I, starší: `/_navrh-home-I.html` (styly `_navrh-home-i.css`)
- návrh H, starší: `/_navrh-home-H.html` (styly `_navrh-home-h.css`)
- návrh G, starší: `/_navrh-home-G.html` (styly `_navrh-home-g.css`)
- návrh F, starší: `/_navrh-home-F.html` (styly `_navrh-home-f.css`)
- návrh E, starší: `/_navrh-home-E.html` (styly `_navrh-home-e.css`)
- návrh D, starší: `/_navrh-home-D.html` (styly `_navrh-home-d.css`)
- návrh C, starší: `/_navrh-home-C.html` (styly `_navrh-home-c.css`)
- návrh A, starší, tvrdé škrtání: `/_navrh-home-A.html`
- návrh B, střední škrtání: `/_navrh-home-B.html`
- mobilní náhled vedle sebe: `/_navrh-mobil.html`
- styly navíc: `_navrh-home.css`
- obsah sekcí: `_navrh-main-A.html`, `_navrh-main-B.html`
- sestavení: `node _navrh-build.mjs` (bere hlavičku a patičku z `index.html`, takže
  se návrhy nerozejdou s navigací)

Původní podoba uložená v `_ulozene-navrhy/homepage-2026-09-08/` (index.html +
flexi.css + COMMIT.txt s hashem `2276961`).

## Sekce s 3D modelem: POZASTAVENO, 8. 9. večer

Tomáš k těm čtyřem sekcím: „to jsou mid ass sekce kamo", a pak že **flexihouse.cz je jeho
výkladní projekt, kterým se bude chlubit, takže laťka je peak grafiky.** To je nejdůležitější
věta celého dne a mění zadání zpětně: sekce musí ukazovat artefakt, ne tvrzení v rámečku.

Obě `duo` sekce jsem proto zahodil a nahradil je sekcí `.rozklad`: vlastní WebGL2 renderer
`assets/flexi-3d.js` na homepage, dům se rozevírá podle scrollu a vedle běží kóta šířky
z 2,20 na 6,32 m. Sticky sekce vysoká 260vh, model se zakládá až přes IntersectionObserver
s `rootMargin` 400px, aby se megabajt renderu netáhl hned, a při `prefers-reduced-motion`
je sekce statická v rozloženém stavu.

**Zastaveno Tomášem: „takhle se ten dům neotvírá."** Mechanika foldu v modelu neodpovídá
skutečnosti, k tomu chce dodělat textury, obojí bere na příští session. Podrobnosti
v `podklady-3d/STAV-3D.md` nahoře.

**Kód zůstává v `index.html` a `assets/domov.css`, nikde nenasazený.** Než se fold opraví,
sekci buď vyhodit, nebo ji nechat stát na jednom stavu bez animace.

Zbylé dvě sekce z předchozího kola, `.kroky` a `.zamer`, na stránce zůstaly a stejná výhrada
na ně sedí: jsou to seznam a taby s odstavcem, ne artefakt.

## Nové sekce podle Modulosu, 8. 9. večer

Tomáš: „modulos má 2 showreely, pak jak to probíhá, a pro každý záměr máme řešení."
Přeměřeno na modulos.cz, ne odhadnuto ze snímku. Jejich pořadí po pozvánce do showroomu:
dva `dual-block` (text na jedné straně, GIF s tlačítkem přehrát na druhé, druhý zrcadlený),
pak `list-block` s číslovaným postupem 1 až 6, pak `tabs` „Pro každý záměr máme řešení".

Postaveno rovnou do `index.html` a `assets/domov.css`, ne jako další návrh. Pořadí je teď
hero, výběr domů, showroom, duo 1, duo 2, kroky, claim, záměry, poptávka, newsletter.
Střídá se bílá, tónovaná, bílá, tmavá karta, tónovaná.

- **duo 1 „Dostane se k vám auto s jeřábem?"** Ekvivalent jejich největší námitky. Modulos
  na ni odpovídá stavbou na pozemku klienta, což převzít nejde, Flexi House dům dováží hotový.
  Naše obava je příjezd. Fotka je reálný složený dům na pozemku.
- **duo 2 „Uvnitř je byt, ne buňka."** Reálná fotka interiéru.
- **kroky**, pět číslovaných. **Bez termínu.** Modulos slibuje „Realizace do 4 měsíců",
  u nás je délka výroby pod NEVÍME, takže v posledním odstavci stojí, že termín potvrzujeme
  až na konkrétní sestavu.
- **záměry** jako záložky: celoroční bydlení, chata a rekreace, ubytování hostů, kancelář
  a provoz. Každá vede na svou obsahovou stránku, takže to zároveň řeší prolinkování z homepage.
  Záložky mají role/aria-selected a jezdí i šipkami, ověřeno klikáním i klávesnicí.

**Videa jsem nepoužil.** `_video/hero-a` i `hero-b` mají v prvních sekundách AI exteriér domu,
který se tomu skutečnému nepodobá (jedno je šedý vlnitý kontejner, druhé generický modul),
interiéry jsou reálné. Jako showreel by to ukazovalo dům, který se neprodává.

Kontrast všech nových prvků měřen skládáním barvy na skutečné pozadí: nejnižší je 4,71
u čísla kroku (modrá na bílé, práh 4,5), zbytek 5,76 a výš. Bez přetečení na 360 a 390 px.

## Kolo R až U: showroom, 8. 9. večer

Tomáš k Q: pás se showroomem se mu nelíbí. Postavil jsem tři směry, které opouštějí
zařízení „text přes ztmavenou fotku“, protože kola M, N, O, P i Q byla pětkrát totéž
zařízení s jinými parametry a hned pod ním stojí claim, který je zase text přes fotku.
R fotka vedle textu na bílé, S tři reálné snímky na tónovaném pásu, T proužek bez fotky.

**Tomáš na to: „všechno je ass, jen nemáme kvalitní fotku pro takový formát, asi AI
jediné řešení“, a pak: chce to ve full-bleedu.** Formát tedy nebyl špatně, chyběl podklad.

**Platí návrh U** (`_navrh-home-U.html`, styly `_navrh-home-u.css`, obsah `_navrh-main-U.html`).
Full-bleed pás jako v Q, ale s AI vizualizací.

### Jak vznikla vizualizace

Postup a klíč z `podklady-3d/ai-hero/`, model gemini-3.1-flash-image, reference jsou
Tomášovy reálné snímky. Nové poznatky nad rámec POSTUP.md:

- **Reference z boku vyrobí dům z boku.** dum1 až dum3 jsou tři pohledy z boku, takže
  z nich vyšel dlouhý úzký kvádr s terasou na konci. Po přidání čelní fotky
  (`showroom-litomysl.jpeg`) a věty „the building is WIDE, not long, about 6.3 m wide
  and 5.9 m deep, almost square in plan, three bays with a glazed double door in the
  middle“ tvar sedl.
- **Kompozici pro pás si musí model rozvrhnout sám.** Ořezávat čtverec do pásu nemá smysl.
  Druhé kolo generovalo rovnou 21:9 s instrukcí, že dům patří do pravé poloviny, nesmí
  se dotknout pravého okraje a levá polovina zůstane prázdná louka pod text. Poměr 21:9
  API bere.
- Cena celkem asi 10 Kč: třikrát 1K náhled a dvakrát 4K finál.
- Soubory: `img/showroom/pas-{900,1400,2000,2600}w.webp` a mobilní ořez 4:3
  `img/showroom/pas-mobil-{480,800,1200}w.webp`.

### Co pás dělá

- Výška `clamp(300px,26vw,400px)`, na Tomášovo „udělej ho trošku užší“ zúžená
  z `clamp(360px,34vw,540px)`. Dům se do ní vejde celý včetně střechy.
- Překryv jen vlevo pod textem, dům zůstává v barvě. Pod 1200 px je překryv silnější,
  protože se text poměrově roztahuje do světlejší části. Lead je omezený na `min(38ch,36vw)`.
- **Kontrast měřen kompozicí fotky a gradientů na plátně, stopy čtené z computed stylu,
  ne z paměti.** Nejhorší hodnota přes šířky 901, 1024, 1200, 1440 a 1920 je 5,9 u leadu
  na 1920. Nadpis nejhůř 8,35. Před opravou padal lead na 901 px na 3,6.
- Na mobilu se pás rozpadne: fotka nahoře ve vlastním ořezu 4:3 vycentrovaném na dům,
  text pod ní tmavý na tónovaném podkladu. V úzkém výřezu pásu by z domu zůstal roh.

### Zjednodušení 8. 9. večer

Tomáš: dát pryč vizualizaci, ztmavit jednotně ale ne moc, míň textu, easy peasy.
Bral jsem to jako štítek Vizualizace, ne jako fotku, a pro jistotu stojí vedle **návrh V**,
kde je fotka pryč úplně a zbude plochý tmavý pás.

- Štítek pryč, přechod zleva nahrazený **jednotným krytem `rgba(9,17,29,.55)`** přes celou plochu.
- **Odstavec pod nadpisem zrušený.** Nebyl to jen požadavek na kratší text, ale i podmínka
  kontrastu: jednotný kryt, který nechá fotku světlou, bílý drobný text přes světlou oblohu
  neunese. S plochým `.46` padal lead na 3,14. Bez odstavce zůstává jako drobný bílý text
  jen odkaz, a ten prochází.
- Ořez posunutý na `72% 60%`, aby pod nadpisem byla louka a stromy, ne obloha.
- Adresa se přesunula do odkazu: „Litomyšl na mapě". Nadpis zůstal dvouřádkový.
- Kontrast po změně: nadpis 4,20 až 4,24 (velký text, práh 3,0), odkaz 6,65 až 6,82
  (drobný text, práh 4,5), měřeno na 901, 1024, 1440 a 1920 px.

### Otevřené u U

Vizualizace stojí vedle věty, že ten dům je na Sokolovské. Má štítek Vizualizace jako
hero a karty, takže je to konzistentní, ale skutečný dům stojí na šotolině u silnice,
ne na louce. Buď to tak zůstane, nebo se změní text, nebo se adresa odsune k poptávce.

## Třetí kolo 8. 9., návrh D

Tomáš k C: chybí plusy (Vyrobeno v hale a spol.), měly být u hero. Fotku zpod dvou karet pryč,
karty pod sebe a menší, formulář v Revolut stylu, chybí CTA se značkou, a do pozadí kuchyň
s parallaxem.

- **plusy zpátky**, šest bodů s ikonami hned pod hero na tónovaném pásu
- **claim `Vy řešíte pozemek a přípojky. Zbytek přijede hotový.`** se značkou Flexi House
  nad ním, na fotce `kuchyn-linka.webp`. Fotka se posouvá se scrollem, ±7 %, vypnuto při
  `prefers-reduced-motion`. Ověřeno reálným scrollem, transform jde z -7 % přes 0 na +7 %.
- **formulář v Revolut stylu** podle `firmanagooglu/navrhy/revolut/STUDIE.md`: řádky sloučené
  do bloku s rádiusem 12, vlasová linka mezi řádky a nikdy na okraji, popisek vlevo ve sloupci
  124 px, input bez rámečku, fokus podbarví celý řádek. Stíny jen level3 a level4 z jejich
  škály, tlačítko 52 px, mezery z řady 4/8/12/16/20/24/32/40.
- **dvě karty pod sebou** v jednom sloupci 760 px: velká s formulářem, pod ní menší s kontakty
- fotka zpod formuláře pryč, poptávka je na čisté bílé

### Kolo Q: ostřejší fotka a jen mírný překryv

Tomáš: „proč je to tak rozmazané a tmavé, dej tam jen mírný blur, ať to trochu rozbije
stránku barvou, ale ať je tam vidět text."

- **Rozmazání jsem způsobil sám.** V kole P jsem fotku ořezal na 1064 px a CSS ji pak
  muselo v pásu zvětšit o 35 %. Teď ořezávám jen kůl vpravo, zbývá 1343 px a zvětšení
  je 7 %. Kvalita JPEG exportu zvednuta na 92.
- **Překryv hodně zesvětlený**: vodorovně z .88 na .72 vlevo a z .2 na 0 vpravo,
  svisle skoro nic. Fotka teď dělá to, co má, přináší na bílou stránku barvu.
- **Výřez posunut z 34 % na 26 %.** Při lehčím překryvu vylezl v levém dolním rohu
  červený náklaďák. Porovnány polohy 22, 26 a 30 %: na 22 % je skoro jen obloha,
  na 30 % je vidět červená bouda vpravo, na 26 % je přístřešek, dřevěný obklad
  i prosklení a náklaďák je mimo záběr.
- Kontrast po zesvětlení znovu změřen s textem na `visibility:hidden`:
  nadpis 5,78, lead 5,98, odkaz 5,39. Rezerva je menší než dřív, takže **při další
  výměně fotky se to musí přeměřit znovu.**

### Kolo P: v pásu Tomášova fotka

Fotka ležela na ploše jako `WhatsApp Image 2026-09-07 at 11.40.19.jpeg`, kopie je
v `podklady-3d/fotky/showroom-litomysl.jpeg`. Originál 1448 x 1086.

- **Oříznuto** o červený náklaďák vlevo, kůl s pneumatikou vpravo a kus oblohy nahoře,
  zbylo 1064 x 978. Export `img/showroom-{800,1200,1600}w.webp`.
- **Výřez posazený na `50% 34%`.** Vyzkoušeny čtyři polohy (24, 34, 44, 58 %) a porovnány
  vedle sebe: na 24 % je vidět hlavně konstrukce přístřešku, na 44 % zábradlí, na 58 %
  podlaha terasy. Na 34 % je poznat dřevěný obklad, prosklení i přístřešek, tedy dům.
- Kontrast bílého textu měřen s textem na `visibility:hidden`: nadpis 12,8, lead 12,9,
  odkaz 17,3.
- **Pozor na rozlišení:** fotka je po ořezu 1064 px široká, na retina displeji bude v pásu
  přes celou šířku měkká. Když bude po ruce originál z telefonu ve full rozlišení,
  vyměnit.

### Kolo O: úzký pás

Tomáš: „udělej to užší, nemusí tam být celý, oni to mají fakt mega úzké."
Změřeno na Modulosu i u nás: jejich pás má zhruba 5:1, náš teď 5,5:1 na 1440 px
(261 px vysoký), 4,6:1 na 1024 a 3,6:1 na 768. Nadpis i text drží na jednom řádku,
druhá věta z leadu vypuštěná.

**Čeká na fotku od Tomáše.** Poslal ji dvakrát do chatu, ale jako obrázek, ne soubor,
takže na disk nedosáhnu. Má ji hodit do `podklady-3d/fotky/`, ta složka je na to zavedená
(`SEM-VLOZ.txt`) a nenasazuje se. Do té doby je v pásu `IMG_2277` z repa.

### Kolo N: v pásu reálný exteriér

Tomáš poslal fotku domu na zeleném trávníku a ptal se, jestli by se tam nehodila,
nebo jestli generovat AI vizualizaci.

**Reálný exteriér z české lokality v repu je**, `podklady-3d/fotky/IMG_2275` až `IMG_2302`,
79 souborů. Do té doby byly na webu jen interiéry a hala, což byla podle paměti mezera
(„čistý exteriér celého domu zvenku, ani jednou"). Na `IMG_2277` je terasa, otevřené dveře
a nad tím vlastní banner s telefonem 607 321 543, takže se prokazuje, že je to jejich místo.
Ořezáno na 16:9 a vyexportováno jako `img/showroom-{800,1200,1600,2000}w.webp`.

**AI vizualizaci sem naopak nedávat.** Celý smysl toho pásu je „tohle je skutečné, přijeďte
si na to sáhnout". Render by to podťal.

Kontrast bílého textu měřen s textem na `visibility:hidden`: nadpis 11,3, lead 8,7, odkaz 15,6.

### Kolo M: pás se showroomem

Tomáš potvrdil: **na Sokolovské v Litomyšli stojí reálný dům a dá se jím projít.**
Do té chvíle to web netvrdil nikde, slovo showroom padlo jen jako příklad využití
Flexi Office.

- **Full bleed pás** hned pod výběrem domů, před výzvou. Tomáš ho chtěl full bleed,
  i když jsem doporučoval kartu; je to jeho volba a na stránce to funguje, protože
  výzva pod ním je naopak zaoblená karta, takže se to nebije.
- **Fotka `interier-cely.webp`** je z reálného kusu (focení 31. 8. 2026), ne z haly
  s umělým trávníkem a čínskými nápisy. To je u téhle sekce zásadní, ukazuje se přesně
  ten prostor, do kterého člověk přijede.
- **Tlačítko volá**, `tel:+420607321543`, druhý odkaz vede na Google Maps profil.
  Záměrně tam není otevírací doba ani model domu, Tomáš potvrdil jen to, že dům existuje
  a dá se projít. **Až bude vědět víc** (který model, jestli zařízený, jestli volat předem),
  doplnit, bez toho je to obecné.
- Kontrast bílého textu měřen s textem na `visibility:hidden`: nadpis 15,8, lead 11,5,
  odkaz 16,2. Pás je full bleed na všech šířkách, bez přetečení.

### Nález: Google profil si protiřečí s webem

Zjištěno 8. 9. 2026 při ověřování, jestli se dá tvrdit showroom. `.docs/google-profil.md`
je zrcadlo živého popisu na Google profilu a proti webu tvrdí tři jiné věci:

| Google profil | Web |
|---|---|
| „Vyrábíme modulární a kontejnerové domy v hale" | Firma domy nevyrábí, dodává je (opraveno na webu 8. 9.) |
| od 405 000 Kč | od 400 000 Kč |
| Flexi Office od 70 000 Kč | od 100 000 Kč |

Profil se v hledání ukazuje víc než web, takže je to viditelnější rozpor než cokoli
na stránce. Popis se mění přes Správce firemních profilů, postup je v paměti
(karta O službě, klik na Popis, textarea, Uložit). **Neopraveno, čeká na rozhodnutí o ceně.**

### Zaparkovaný nápad: plusy jako body na domě

Tomáš 8. 9. 2026: „ty plusy si ulož, že uděláme to animated, každý point na ten barák
jakoby." Šest plusů se tedy nevrátí jako mřížka, ale jako **body ukotvené na vizualizaci
domu**, každý u té části, které se týká.

Návrh napojení bodů (co kam ukazuje):
- Vyrobeno v hale → celý objem domu
- Rozevře se na místě → boční křídlo, tam kde se rozklápí
- Kuchyň a koupelna → prosklení do obytné části
- Celoroční bydlení → stěna, kvůli zateplení Rockwool 75 mm
- Přemístitelný → patky pod domem
- Doprava po celé ČR → podvozek nebo hrana, kde dům dosedá

**Co musí být hotové dřív:** jednotné AI vizualizace. Souřadnice bodů se navážou na jeden
konkrétní obrázek, takže dokud se render mění, nemá smysl je usazovat. Potřeba bude větší
render jednoho domu, nejspíš rozkládacího, ne ta malá vizualizace z výběru.

**Pozor na vlastní pravidlo.** `design-pravidla/05-sekce-a-konverze.md` zakazuje jako
default plovoucí chips a bublinky kolem produktu, protože se to čte jako AI vzor. Výjimka
platí jen na výslovné přání klienta, což tohle je, ale s podmínkou: **body musí opravdu
cyklovat** (objeví se, chvíli drží, zmizí, přijde další), ne viset všechny naráz staticky.
A při `prefers-reduced-motion` se musí zobrazit rovnou všechny bez animace.

### Kolo L: menší vizualizace, plusy vyhozené

- **Vizualizace zmenšené** na 84 % šířky sloupce, pod 900 px na max 380 px.
- **Sekce se šesti plusy vyhozená.** Tomáš napsal jen „tu sekci vyhoď" bez upřesnění,
  vzal jsem to jako plusy, protože to byl jediný blok, se kterým nikdy nebyl spokojený
  („se to tam moc nehodí", „nevím jak to pojmout"). **Kdyby myslel jinou, obsah je pořád
  v `_navrh-main-K.html`, vrácení je copy paste jednoho bloku.**
- Skladba je teď: hero, výběr domů, výzva na fotce, poptávka, newsletter, patička.
- **Animace výběru domů je vědomě odložená**, Tomáš: „pak můžeme zkusit nějak naanimovat
  ale ne teď."

### Kolo K: minimalistický výběr domů pod hero

Tomáš: „líbilo se mi, že mají hned pod hero úplně minimalistický výběr z těch baráků
a mají logicky 3D vizualizace, které můžeme udělat taky."

- **Výběr domů přesunut hned pod hero**, před plusy. Tím se definitivně zodpovědělo,
  co pod hero patří.
- **Zrušeny karty.** Domy leží volně na bílé, bez rámečku a bez podkladu, pod nimi
  název, věta, cena a kulaté tlačítko se šipkou 44 px. Na hover se dům nadzvedne o 8 px
  a tlačítko povyroste.
- **Nové obrázky `img/bily-*.webp`**: stejné výřezy jako `karta-*`, ale průhledné,
  s měkkým kontaktním stínem zapečeným do alfy, aby dům na bílé „stál". WebP s alfa kanálem,
  480/800/1200 px, největší má 70 kB.
- **Až budou hotové 3D vizualizace, prostě se přepíšou soubory `img/bily-*.webp`**,
  markup ani styly se nemění. Do té doby jsou tam výřezy z renderů, na rozkládacím domě
  je u paty pořád kus zeleně z původní scény.
- Bez přetečení na 360 až 1440.

### Kolo J: copy podle Modulosu

Tomáš poslal modulos.cz jako příklad dobrého copywritingu. Rozbor jejich homepage
je v `.docs/MODULOS-COPY.md`, šest mechanik, co jsem převzal a co ne a proč.

Do návrhu šly dvě:
- **podnadpis, který odzbrojí námitku** hned pod nadpisem sekce
- **jedna konkrétní linka u každého produktu** nad cenou

Nepřevzato vědomě: stavba na pozemku klienta (Flexi House dům dováží hotový, nesmí to
tvrdit), číslovaný postup a segmenty použití (Tomáš chtěl míň textu), barevný akcent
uvnitř textu (značka žádný akcent nemá).

### Kolo I: nadpis na střed, opravené cíle karet

- **Nadpis sekce a odkaz na katalog vycentrované.** `.intro` má v `flexi.css`
  `display:grid`, který jsem v předchozím kole nepřebil, takže nadpis zůstal viset
  v levém sloupci. Opraveno na `display:block`. Ověřeno na 390, 768 a 1440 px:
  střed nadpisu, karet i odkazu na katalog sedí na stejném pixelu.
- **Šedý odstavec z úvodu sekce pryč.**
- **Nadpis na jeden řádek.** Zrušen `max-width`, písmo sjeto na `clamp(1.5rem,2.8vw,2.3rem)`
  a přidán `text-wrap:balance`. Změřeno počtem řádků přes `Range.getClientRects()`:
  od 600 px výš jeden řádek, pod tím se zalomí na dva, což na telefonu jinak nejde.
- **Flexi Office přejmenovaný na Kancelářský kontejner.** Tomáš: „Flexi Office je proste
  mid", chce v názvu slovo kontejner kvůli hledanosti. Sedí to i s titulkem podstránky,
  která už se jmenuje „Kancelářský kontejner skladem od 100 000 Kč".
- **Opravené cíle karet.** Konfigurátor konfiguruje rozkládací dům, takže nesmí viset
  u karty Dům na míru. Rozkládací dům → `/rozkladaci-dum`, Kancelářský kontejner →
  `/flexi-office`, Dům na míru → zatím `/katalog`.

**Otevřené:** **stránka `/dum-na-miru` neexistuje.** Tomáš ji chce jako cíl třetí karty.
Do té doby karta míří na katalog. Až stránka vznikne, přesměrovat kartu na ni
a upravit i cenový popisek (teď „cena podle zadání").

### Kolo H: původní písmo, bílé karty na střed

- **Písmo nadpisů vráceno na původní.** V kole E jsem u `h1,h2,h3` přebil `text-transform`
  na `none` a osu šířky z `wdth 84` na `100`. Tomáš: „ten první byl lepší ten původní."
  Override je pryč, nadpisy i tlačítka jedou zase z `flexi.css`, ověřeno v computed style:
  `uppercase`, `wdth 84`. Popisky formuláře zůstaly v Instrumentu, na ty si nestěžoval.
- **Karty bílé** s obtahem `1px rgba(22,32,42,.1)` a stínem `0 2px 10px`, na hover se
  zvednou a stín zesílí. Text na střed, žádný odstavec, jen název, cena a proklik
  (Prozkoumat / Sestavit) uvnitř karty.
- **Odkaz na katalog přesunut pod sekci**, vycentrovaný. Ověřeno na pěti šířkách, že leží
  pod kartami, ne v pravém sloupci úvodu.

### Kolo G: pryč s prolinkováním, karty zpátky do trojky

Tomáš: „hodně mě sere to prolinkování všude, hodně to kazí celkový dojem" a „ty karty
bych vrátil do té trojky, aby to bylo clean přehledné."

- **žádné podtržené odkazy uvnitř vět.** Vyhozeny odkazy na celoroční bydlení, glamping,
  stavební povolení a dopravu z těla textu. Ověřeno na pěti šířkách: v obsahu stránky
  nezůstal jediný podtržený odkaz, jen povinný odkaz na zásady u formuláře, cookie lišta
  a skrytá mobilní nabídka.
- `.link` už nemá trvalé podtržení, jen barvu `--btn-fill` (kontrast 9,3 na bílé)
  a podtržení na hover. Zbyly tři samostatné akce: Sestavit v konfigurátoru,
  Prohlédnout katalog, Jak to probíhá.
- **karty zpátky do trojky**, vlajkový řádek z F zrušen. Fotka, název, jedna věta, cena.
  Na hover se karta zvedne o 3 px. Tři sloupce od 1024 px, jeden pod 900 px.
- **SEO poznámka:** ty odkazy z těla textu byly interní prolinkování na podstránky.
  Homepage teď dovnitř webu odkazuje jen katalogem, konfigurátorem, kartami a patičkou.
  Podstránky tím o něco ztratí, ale patička je pořád prolinkovaná.

### Kolo F: bílá stránka, bez videa, přestavěná nabídka

Tomáš: „líbí se mi hero, to CTA, ale nevím jak zbytek, stránka vypadá taková blank
a hrozně jednotná." Plus: video z prostředka pryč, celá stránka bílá kromě hero a patičky.

- **video odstraněno** (zatím, ne navždy)
- **všechna pozadí bílá**, ověřeno na pěti šířkách: plusy, poptávka i newsletter jsou
  `rgb(255,255,255)`, jediné tónované zůstává patička
- **proti prázdnotě nesou hustotu obsah a fotky, ne pozadí** (pravidlo z `02-layout-rytmus.md`).
  Nabídka je proto přestavěná na nestejné bloky: rozkládací dům je široký řádek s fotkou
  vlevo, textem vpravo a třemi číselnými dlaždicemi (30 m², 6,32 × 5,90 m, od 400 000 Kč),
  pod ním Office a dům na míru jako dva menší řádky s cenou. Konec tří identických sloupců.
- **plusy zhuštěné** do dvou sloupců s ikonou v dlaždici vlevo, mnohem míň vzduchu
- vertikální rytmus stažený zhruba o třetinu

### Kolo E: pryč s čárami a verzálkami

Tomáš: „ty tvoje designy jsou proste mid, ty vsude cpes cary, ja to chci jako normalni web
bez zadneho editorial." Měl pravdu, vlasová linka byla ve všech kolech moje univerzální
berlička a k tomu verzálkové display písmo na každém nadpisu.

E má stejnou stavbu i obsah jako D, mění se jen vizuální jazyk. Je to čistě CSS, obsah
`_navrh-main-E.html` je kopie D:
- `h1,h2,h3{text-transform:none}` přebíjí globální verzálky z `flexi.css`
- plusy, produkty i kontakty jsou měkké karty s rádiusem 20 až 22 a jemným stínem,
  žádné dělící linky
- formulář má normální zaoblená políčka s rámečkem a popiskem nad nimi, ne řádky
  sloučené do bloku
- tlačítka a odkazy sentence case, rádius 14
- **Pozor:** moje pravidlo pro `.btn` přebilo `.btn--sm` z `flexi.css` a tlačítko
  v hlavičce přeteklo na 768 px. Nutno `.btn--sm` deklarovat znovu. Po opravě je
  bez přetečení na 360, 390, 768, 1024 i 1440.
- Kontrast na tmavé kontaktní kartě `#233b47`: nadpis 12,2, text 10,2, popisky 10,9.

**Otevřené:** brand nemá výrazný akcent, celé to zůstává v šedomodré. Jestli má web
působit prémiověji, je to nejspíš další páka, ale barva je Tomášovo rozhodnutí.

### Otevřené: karty přes hero

Tomáš to myslel tak, že karty s domy překryjí hero a budou první věc pod nadpisem,
„jako uprostřed". Tři varianty v `/_karty-pres-hero.html`:
A mělký překryv s bílým tělem karty, B bez bílého těla (modrá fotka splývá s modrým hero,
karty vypadají jako díry), C hluboký překryv, hrana hero prochází středem karet.

Měřeno na C: překryv 260 px na 1440, tlačítko v hero zůstává 133 px nad kartami,
na 390 a 768 px se překryv zmenšuje na 60 a 77 px a hero se zkracuje na 420 px.
Nikde nepřetéká. **Čeká na výběr.**

Pozor při stavbě: `.pas` je v `flexi.css` obsazená třída (starý pásek pod hero) a přebila
mi mřížku, dokud jsem kontejner nepřejmenoval na `.podhero`.

### Otevřené: rozvržení karet s domy

Tomáš se ptal, jestli dát karty s domy do překryvu. Tři rozvržení jsou v `/_karty-domu.html`:
mřížka (to, co je v D), schodovitý posun bez překryvu, a vlajková loď se dvěma menšími
kartami, které ji překrývají.

**Překryv u tří rovnocenných produktů nedává smysl** a zhoršuje čitelnost: karty se
navzájem ořezávají, klikací plochy se překrývají a na mobilu efekt stejně zmizí.
Dává smysl teprve tehdy, když se z nich udělá hierarchie, což je varianta 3: Rozkládací
dům jako vysoká tmavá karta s textem přes spodní přechod, Office a dům na míru jako bílé
kartičky se stínem, které na ni nalehnou zprava (překryv 26 px). Kontrast bílého textu
na vlajkové lodi změřen s textem na `visibility:hidden`: nadpis 18,6, odstavec 15,8,
odkaz 18,8. Pod 860 px se překryv ruší a vše se skládá pod sebe. **Čeká na výběr.**

### Otevřené: sekce pod hero

Tomáš: „ta section pod hero je takova idk man proste se to tam moc nehodi",
pak „nevim proste jak to pojmout". Tři směry vedle sebe jsou v `/_sekce-pod-hero.html`:
tichá mřížka se šesti fakty (to, co je v D), jeden řádek se čtyřmi čísly,
nebo pod hero nedávat nic a fakta posunout pod produkty. **Čeká na výběr.**

### Fotky karet: zatím výřezy, cílově AI

Tomáš: „to udelame s ai na to ser ted". Do té doby jsou v `img/karta-*.webp` výřezy
původních fotek posazené na brandovou modrou se září a kontaktním stínem, aby ta trojice
konečně vypadala jako sada. Postup je lokální, přes macOS Vision, popsaný
v paměti (skript `cutout.swift`, `VNGenerateForegroundInstanceMaskRequest`).

Co se cestou zjistilo:
- `dum-na-miru.webp` **výřez nesnese**: maska pobere kmen stromu, který stojí před fasádou,
  a trávu u země. Kmen je v popředí, takže ho nejde odečíst bez díry ve stěně.
  Proto je na kartě Dům na míru tmavá varianta z `flexi-house.webp` a na kartě
  Rozkládací dům `flexi-house-rozkladaci.webp`.
- Ostatní dva výřezy jsou čisté, žádný se nedotýká okraje souboru.
- `podklady-3d/ai-hero/POSTUP.md`: Gemini kredit je od 6. 9. vyčerpaný a generování
  z referencí vyrábělo špatný produkt (bílý zahradní domek). Až se bude generovat znovu,
  přečíst si ten postup, jsou v něm vychytávky.

### Poslední kolo: míň textu a video srovnané s CTA

- **Video mělo pořád jinou šířku než zbytek.** Moje `.film2{padding:X 0}` vynulovalo boční
  odsazení, které dává `.wrap`, takže přehrávač byl 1280 px proti obsahu 1168 px. Opraveno
  na `padding-block`, video teď sedí přesně na CTA i na produktové karty. Ověřeno na 390,
  768, 1024, 1200, 1440 a 1800 px: stejný levý okraj, stejná šířka, stejný rádius
  (32 px, pod 900 px 24 px u obojího).
- **Souvislý text zkrácen na polovinu**, změřeno: 296 slov prózy na živé homepage,
  150 v návrhu. Šlo pryč hlavně druhé věty u šesti plusů a u tří domů. Odkazy dovnitř webu
  zůstaly všechny a přibyl odkaz na dopravu a montáž.

### Doladění D podle Tomáše (offio kolo)

- **claim je karta, ne pás přes celou šířku**, jako to má offio.cz: v `.wrap`, zaoblená
  dokola, výška 460 px místo dřívějších 620
- **efekt CTA je okopírovaný z offio.eu**, změřeno přímo v jejich DOM (element
  `.elementor-element-ad92e9a`): karta 1140 x 500 px, `border-radius:32px`, `padding:64px`,
  `background-size:cover`, `background-position:50% 50%` a hlavně
  **`background-attachment:fixed`**, plus překryv v `::before` s černou na `opacity:.6`.
  Žádný JavaScript. Fotka je ukotvená k oknu prohlížeče, ne ke kartě, takže karta funguje
  jako okénko a při scrollu se v ní obraz posouvá. Tomáš 8. 9.: „ta fotka je jakoby na výšku
  a hýbe se v tom ta fotka."
- Můj předchozí pokus (zasouvání karty přes JS a měnící se měřítko) je pryč celý,
  včetně scroll listeneru.
- Rozdíl proti nim: jejich fotka je tmavá kancelář, naše kuchyně je světlá. Ověřeno
  výpočtem z originálu: i v nejsvětlejším místě, přes které text jede
  (99,5. percentil `rgb(251,241,204)`), dá černá na 60 % kontrast 6,29, takže jejich krytí
  stačí i nám a nemusel jsem ho zvedat.
- **Mobilní pojistka:** `background-attachment:fixed` iOS Safari ignoruje, pod 900 px se
  proto přepíná na `scroll` (a to samé při `prefers-reduced-motion`). Ověřeno: na 390 a 900 px
  je `scroll`, na 1440 px `fixed`.
- **kontakty jsou v barevném bloku `#3f5c69` vedle formuláře**, ne pod ním. Formulář ho
  překrývá zleva o 72 px, blok má proti tomu `padding-left` až 132 px, aby text neležel pod
  kartou.
- **blok oživen** (Tomáš: „vypadá moc lame"): značka Flexi House jako světlý vodoznak
  v rohu, kontakty ve sdruženém řádkovém bloku s kruhovými ikonami (mechanika 6 z Revolutu),
  dole hvězdy z Googlu. Kontrast: nadpis 5,73, text 4,87, popisky v řádcích 4,96, odkazy 5,83.
- na 900 px a míň se překryv ruší a blok padá pod formulář

## Druhé kolo 8. 9., návrh C

Tomáš k A a B: pásek s čísly pod hero „tragicky udělaný", chybí CTA, formulář „midský",
domy byly nejlepší v původních třech kartách, celé to má být prémiovější a sedět hero vibem.

- **pásek s čísly a výkresy je pryč**, hero jde rovnou na domy
- **domy zpátky v původních `.picks` kartách** (fotka, název, věta, Prozkoumat), úvodní
  odstavec zkrácený na jeden
- **video má jako plakát obrázek z hero** (Tomášovo zadání), pořád v šířce obsahu
- **CTA je tmavá sekce na fotce** `flexi-house-rozkladaci.webp` se zaobleným horním rohem
  jako má hero zespodu, uvnitř dvě karty: tmavá prosklená s nadpisem, telefonem, mailem
  a hodnocením, a bílá se stínem s poptávkou. Předloha je pás `.pas` dole na statly.cz.
- **newsletter až za CTA**, tiše, na bílé
- sekce nese `id="kontakt"`, protože na něj míří odkaz v hlavičce; v A a B na to nemířilo nic

Pozor, čísla kontrastu, která jsem u C nejdřív uvedl (5,93 / 5,2 / 5,03), byla **měřená
špatně**: filtr chytal antialiasing hran písma, ne pozadí. Správně se měří na renderu
s textem na `visibility:hidden`. Skutečné pozadí tmavé karty v C je `rgb(16,24,36)` a
kontrast 17,8 / 14,5 / 13,9. Nic nepropadalo a karta se kvůli tomu ztmavovala zbytečně.

## Co se změnilo proti živé homepage

1. **Tři plovoucí karty přes hero jsou pryč.** Nahradil je pásek `Přijede složený,
   postaví se na 30 m²`: tři sloupce oddělené vlasovými linkami, u každého malý
   technický výkres půdorysu (složeno, rozklápí se, stojí na patkách) a číslo.
   2,20 m, 30 m², 1 až 7 dní. Žádné boxy, žádné stíny, nic nepřesahuje přes hero.
2. **Video má stejnou šířku jako zbytek stránky.** Dřív bylo `1313 px` proti
   obsahu `1168 px`, teď sedí v `.wrap` jako všechno ostatní. Plakát se načte
   jako obrázek, video se stáhne až po kliknutí.
3. **Modrý CTA pás nahradil klidný blok s newsletterem** na tónovaném pozadí.
4. **Dole je poptávkový formulář**, stejný jako na `/poptavka`, míří na
   `/api/send-lead`, takže funguje hned.
5. **Sekce Co dům umí** (šest ikon) v A odpadla, v B zůstala její obsahová část
   rozpuštěná do pásku s čísly.

## Co je opravené mimo design

- **Rozpor v textu:** živá homepage tvrdí, že rozevření je „otázka jednoho dne",
  ale `/rozkladaci-dum` říká „sestavení trvá 1 až 7 dní podle sestavy". V obou
  návrzích je verze z produktové stránky. **Do `index.html` to zatím nešlo.**
- **Mrtvý preload:** `index.html` řádek 29 přednačítá `flexi-house-rozkladaci.webp`
  s `fetchpriority="high"`, ale ten obrázek na stránce nikde není. Stahuje se
  zbytečně v nejhorší možnou chvíli. V návrzích odstraněné, v `index.html` zatím ne.

## Nález mimo návrh: cena „od 400 000" je nedosažitelná

Web na 18 místech slibuje „od 400 000 Kč bez DPH", ale v konfigurátoru je
**Elektroinstalace za 10 000 Kč povinná** (`required:true`, jediná volba,
`konfigurator.html:236`). Nejlevnější možná sestava je tedy **410 000 Kč**
a konfigurátor se po otevření rovnou ukazuje na **465 000 Kč** (změřeno
v běžícím konfigurátoru, prvek `#sumTotal`).

Vzniklo commitem `ada3d2c` ze 7. 9., kde se ceník přepsal podle Dana:
405 000 se všude změnilo na 400 000, ale elektroinstalace zdražila z 5 000
na 10 000 a zůstala povinná.

`_audit/konzistence.py` to hlásí jako 21 rozporů, ale s **chybným číslem**:
hlídá starých 405 000 a u Flexi Office čeká 70 000, zatímco web i paměť mají
100 000. Než se skript spraví, jeho výstup se nedá brát doslova.

**Nechal jsem to být, cena je na Danovi.** Buď se web přepíše na „od 410 000",
nebo elektroinstalace přestane být povinná. Až padne rozhodnutí, opravit
i `_audit/konzistence.py`. V návrzích je zatím „od 400 000 Kč" jako na zbytku webu.

## Newsletter, co ještě chybí

Formulář posílá na `/api/newsletter`. Endpoint (`functions/api/newsletter.js`) a
migrace (`.docs/migrace-02-newsletter.sql`) jsou napsané, ale **nenasazené a
neodzkoušené naostro**. Před spuštěním je potřeba:

1. `npx wrangler d1 execute flexihouse --remote --file=.docs/migrace-02-newsletter.sql`
2. Rozmyslet double opt-in. Teď je to jednoduché přihlášení, adresa se uloží rovnou.
3. **Stránku pro odhlášení.** Copy slibuje „odhlásíte se jedním kliknutím" a
   sloupec `odhlasovaci_kod` je připravený, ale odhlašovací stránka neexistuje.
   Než odejde první newsletter, musí být.

## Ověřeno

- Bez vodorovného přetečení na 360 a 390 px, měřeno v iframu, ne ze snímku.
- Jeden H1, žádný em dash, audit češtiny 0 nálezů (nástroj ověřen nastraženou chybou).
- Diakritika v DM Mono sedí v obou subsetech (ŠÍŘKA, JEŘÁB, ZÁKLADOVOU).

## Otevřené

- Tomáš chtěl „ten dům dát pryč" a pak si nevzpomněl který. Zatím jsou na stránce
  všechny tři: render v hero, tři produktové fotky, dům ve videu. Až si vzpomene,
  odstranit.
