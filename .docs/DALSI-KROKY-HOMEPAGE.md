# Homepage: odkud pokračovat

Stav k 8. 9. 2026 večer. Krátký přehled, detailní zápis všech kol je
v [NAVRH-HOMEPAGE-2026-09-08.md](NAVRH-HOMEPAGE-2026-09-08.md).

## Kde to stojí

- **Platí návrh Q: `/_navrh-home-Q.html`**, styly `_navrh-home-q.css`,
  obsah `_navrh-main-Q.html`. Sestavení: `node _navrh-build.mjs`.
- Rozcestník se všemi koly: `/_navrh-home.html`.
- **Nic není nasazené.** Živý `index.html` je nedotčený, původní podoba je uložená
  v `_ulozene-navrhy/homepage-2026-09-08/`.
- Skladba stránky: hero, výběr domů, úzký pás se showroomem, výzva na fotce kuchyně,
  poptávka, newsletter, patička. Vše bílé kromě hero a patičky.

## Co je otevřené

**1. AI vizualizace domů** (čeká na Tomášovy kredity)
Tři domy ve výběru jsou zatím výřezy z renderů posazené na bílou. Až budou hotové
jednotné vizualizace, **jen se přepíšou soubory** `img/bily-rozkladaci.webp`,
`bily-office.webp`, `bily-namiru.webp`, každý ve 480, 800 a 1200 px. Markup ani styly
se nemění. Potřeba průhledné pozadí, stejný úhel a stejné světlo, jinak jednotnost nevznikne.
Před generováním přečíst `podklady-3d/ai-hero/POSTUP.md`, jsou tam vychytávky z minula
a varování, že z výřezů jako referencí vyleze špatný produkt.

**2. Plusy jako animované body na domě** (čeká na bod 1)
Šest plusů se nevrátí jako mřížka, ale jako body ukotvené na velké vizualizaci domu.
Návrh, co kam ukazuje, je v hlavním zápisu. Souřadnice se navazují na jeden konkrétní
render, takže dřív to nemá smysl. **Body musí cyklovat**, ne viset staticky, jinak
porušíme vlastní pravidlo z `design-pravidla/05-sekce-a-konverze.md`.

**3. Stránka `/dum-na-miru`: HOTOVÁ 8. 9. 2026, nenasazená**
Postavená z produktové šablony (jako `/glamping`), 741 slov. Vlastní blok navíc:
mřížka čtrnácti vzorků fasády, tři základní obklady a jedenáct dekorů, čtená
z konfigurátoru. Signature číslo v pásu je 113 600 Kč, rozdíl mezi nejdražším
a základním vzhledem (sedlová střecha 90 000 plus dekor fasády 23 600).

Napojení: třetí karta v návrhu Q míří na `/dum-na-miru` a místo „cena podle zadání“
říká „cenu spočítá konfigurátor“, v `/katalog` vede tlačítko třetího modelu i řádek
Podrobně na novou stránku, odkaz je v patičce všech stránek a v `sitemap.xml`.
Živý `index.html` zůstal beze změny až na opravenou výšku obrázku (viz níže).

Ověřeno na localhostu: žádné vodorovné přetečení na 360, 390 a 768 px (měřeno
v iframu, ne ze snímku), všech 22 obrázků se načte, nejhorší kontrast textu
v hero je 7,99 (měřeno kompozicí fotky a obou gradientů `.pr-hero__stin`
na plátně, ne vzorkováním snímku s písmem). Audit češtiny hlásí jen čárky
před „nebo“ ve vylučovacím poměru, ty jsou správně.

**4. Google profil si protiřečí s webem** (3 rozpory)
Profil tvrdí „Vyrábíme domy v hale“ (nevyrábí, dodává), „od 405 000“ (web má 400 000)
a Flexi Office „od 70 000“ (web má 100 000). Profil se v hledání ukazuje víc než web.
Text žije v `.docs/google-profil.md`, mění se přes Správce firemních profilů.

**5. Cena „od“: 400 000 nebo 410 000?**
Web slibuje od 400 000, ale elektroinstalace za 10 000 je v konfigurátoru povinná
(`konfigurator.html:236`, `required:true`), takže nejlevnější sestava je 410 000
a konfigurátor se po otevření ukazuje na 465 000. `_audit/konzistence.py` to hlásí
a 8. 9. dostal správné číslo: elektroinstalace je 10 000, ne 5 000, takže hláška
mluví o 410 000. Pravidlo samo („web nesmí slibovat 400 000“) zůstalo nedotčené,
to je rozhodnutí, ne oprava. **Rozhodnutí je na Danovi.**

Při té příležitosti se našly dvě živé stránky, které měly starou cenu
elektroinstalace 5 000 Kč: `/celorocni-bydleni` a `/jak-to-probiha`. Opraveno
na 10 000. V `jak-to-probiha` z toho navíc vycházela věta „nejnižší cena domu
je proto 400 000 Kč“, což neplatilo ani se starým číslem, přepsaná je na to,
že se elektroinstalace přičte i k nejlevnější variantě.

**6. Barevný akcent**
Celý web běží ve dvou odstínech šedomodré, značka nemá akcent. Podle mě je to poslední
velká páka na to, aby web působil prémiověji; Modulos i Offio na tom stojí. Barva je
ale rozhodnutí Tomáše, ne moje.

## Drobnosti, na které se přijde jinde

- Fotka v pásu se showroomem má 1343 px po ořezu, na retina bude měkká. Kdyby byl
  po ruce originál z telefonu (ne přes WhatsApp), vyměnit a **přeměřit kontrast**,
  rezerva je jen 5,4 až 6,0.
- Reálný exteriér domu na webu doteď nebyl nikde. V `podklady-3d/fotky/` je 79 snímků
  z české lokality, použitelných i na produktovou stránku a do katalogu.
- Newsletter: endpoint `functions/api/newsletter.js` a migrace
  `.docs/migrace-02-newsletter.sql` jsou napsané, ale **nenasazené a neodzkoušené**.
  Před spuštěním chybí odhlašovací stránka, copy slibuje odhlášení jedním kliknutím.
- `baze.md` chatového poradce začínala větou „Flexi House vyrábí modulární
  a kontejnerové domy“, což je přesně to tvrzení, které z webu odešlo 8. 9. commitem
  „nevyrábí, dodává je“. Opraveno na „dodává“ a báze přesestavena
  (`node .docs/poradce/sestav-bazi.mjs`), test cen prošel.
- Karta „Dům na míru“ na živé homepage měla `height="1050"`, soubor je 1400 × 788.
  Opraveno, protože špatný poměr posouvá layout při načtení. Odkaz karty je pořád
  `/konfigurator`, přehodit ho na `/dum-na-miru` je rozhodnutí: konfigurátor je
  měřená konverzní cesta, obsahová stránka ji nemá.
- V `flexi.css` je obsazená třída `.pas` (starý pásek pod hero). Při stavbě nových
  sekcí nepoužívat, přebije mřížku.

## Závěrečný pás, přestavěno 9. 9. 2026

Sekce `.zaver` už neukazuje exteriér ze showroomu, ale **interiér** vygenerovaný jako
přestylování reálné fotky `~/Desktop/Projekty/flexihouse-foto/obyvak-cely.jpg`
(skutečný kus, roh se dvěma okny). Zdroj 4K v poměru 4:3, ořezy v `img/zaver/`
(640/960/1400/2000/2600 w). Staré `img/showroom/pas-*` zůstávají, drží je archivované
návrhy `_navrh-*.html`.

**Postup, který jako jediný dal použitelný výsledek** (pět předchozích pokusů Tomáš
zamítl jako „mimo prostor“ nebo „moc AI“):

1. Do zadání zamknout kompozici bod po bodu podle referenční fotky, ne popisovat scénu.
2. Do zadání dát **skutečné rozměry z `assets/flexi-3d.js`**: strop 2337, okno
   1120 × 1100, parapet 940, tedy nad oknem zbývá jen 297 mm. Bez toho model strop
   pokaždé zvedne.
3. Kontrola: poměr *stěna nad oknem / výška okna*. Originál 14 %. Zamítnuté pokusy
   měly 30 až 57 %, přijatý 17 %.
4. Vyjmenovat zakázané AI klišé (bouclé, travertin, olivovník, přehoz v pravidelných
   vlnách, všechno béžové) a **předepsat přepálená okna** a jeden tvrdý směr světla.
   Rovnoměrné teplé světlo a dokonale proexponovaná okna jsou největší AI tell.
5. Stěny neměnit na omítku, ale **přetřít panely**. Švy pak čtou jako obklad, ne jako
   levné plechy, a nic to neslibuje navíc.

**Parallax:** obrázek má `height:132%`, dojezd počítá skript v `index.html` v pixelech
jako `foto.offsetHeight - sekce.offsetHeight`. Procenta tam nepatří, při 132 % vychází
dojezd 24,24 % výšky obrázku a při naivních −32 % prosvítalo dole pozadí.

**Změřeno na localhostu:** kontrast bílého textu v nejhorším bodě **5,33:1** shodně na
360, 390 i 1126 px; nejhorší bod je vždy bílý pixel v přepáleném okně, proto stejné
číslo. Mezera nad ani pod obrázkem nikde v celém rozsahu scrollu. Bez vodorovného
přetečení na 360/390/768/1280/1600.

**Pozor při měření:** `html` má `scroll-behavior:smooth`, takže `scrollTo` v konzoli
nedoskočí a měření vyjde ze staré pozice. Před měřením nastavit `scrollBehavior='auto'`
a ověřit, že `scrollY` sedí na cíl. Audit češtiny **nekontroluje atributy `alt`**,
nastražená chyba v `alt` neprojde, ve viditelném textu ano.

**Otevřené:** obrázek je AI úprava reálné fotky. Do náladového pásu ano, na produktové
stránky jako důkaz realizace ne.

## Sekce „Proč to lidi berou“, přidáno 9. 9. 2026

Mezi `.pasfoto` a `.claim` přibyla sekce `.vyhody`: šest karet, vlastní ikony, jedna
věta ke každé. Důvod byl vizuální, ne obsahový — pás fotek a claim s fotkou na pozadí
stály přímo na sobě a claim navíc ukazuje tu samou kuchyň z jiného úhlu, takže to
četlo jako opakování. Světlý tónovaný pás s bílými kartami je od sebe oddělí.

**Ikony jsou vlastní, kreslené, ne ze setu.** První pokus byl v izometrii podle loga
a nefungoval: při 44 px se fasety slily a sedlová střecha se promítla skoro do
svislice. Druhá verze je plochá, zepředu, tah 1,5 a jedna výplň z palety značky.
Zdroj je `/tmp/ikony2.py`, ale výsledné SVG žijí přímo v `index.html`.

**Pozor, `.plusy` je obsazená třída.** V `domov.css:10` má vlastní mřížku a
`.plusy svg{grid-row:span 2;width:44px;padding:10px;background:var(--soft)}`. Nová
sekce se proto jmenuje `.vyhody` / `.vyh__*`. Je to třetí taková kolize po `.pas`
a `.faq__in`, před pojmenováním nové sekce vždycky `grep -n "^\.jmeno" assets/*.css`.

**Copy stojí na `/rozkladaci-dum`,** ne na paměti: zateplení 75 mm je v ceně, kuchyň
a koupelna jsou příplatek, kilometry se počítají z Prahy. Nadpis „Vyrobeno v hale“ ze
staré verze je změněný na **„Vzniká v hale“**, firma domy nevyrábí.

**Změřeno v iframu:** tři sloupce od 820 px, dva pod tím, vodorovné přetečení nikde
na 360/390/768/1280/1600, konzole čistá. Audit češtiny čistý a propadl na nastražené
chybě.

**Pozor na renderovací pomocníky.** Samostatný headless render sekce mě dvakrát
obelhal: jednou nenačetl CSS a hlásil rozsypané rozvržení, podruhé jsem mu zapomněl
dát `<meta viewport>`, takže Chrome sázel na 980 px a uřízl pravou stranu, což
vypadalo jako přetečení na mobilu. Platí měření v iframu nad skutečnou stránkou.
Headless Chrome navíc neumí okno užší než ~485 px, viz `.docs` jinde.

**Nezapojený zbytek:** v `_navrh-mezisekce.html` zůstávají varianty A datový list,
B tři karty, C půdorys ze souřadnic konfigurátoru a D nekartová verze téhož.
Půdorys je hotový a přesný, kdyby se pro něj někdy našlo místo.

### Tónovaný podklad místo šedého pruhu (9. 9. 2026)

Sekce `.vyhody` původně měla vlastní šedé pozadí a četlo se to jako bug. Důvod:
`.pasfoto` má pod fotkami až 52 px bílé výplně a `.claim` není sekce přes celou
šířku, ale **zaoblená karta s marginem až 80 px na bílém podkladu**. Šedá tak visela
jako pruh mezi dvěma bílými mezerami.

Řešení: `.vyhody`, `.claim`, `.klid` a `.dotazy` jsou obalené v `<div class="tonovany">`
s `background:var(--soft)`, vlastní pozadí těch sekcí je pryč, a `.pasfoto` přišla
o spodní padding. Tmavá karta claimu teď plave na stejné tónované ploše jako bílé
karty. Podklady stránky jdou po sobě: tmavý hero, bílá, **tónovaná plocha**, tmavý
závěrečný pás, bílá poptávka. Pět změn podkladu se zredukovalo na tři.

Při té práci opravené: dvě přebytečné `}` v `domov.css` na řádcích 356 a 402.
Prohlížeč je podle specifikace zahodí, ale byla to chyba parsování.

**Past prostředí, stálo mě to hodně času:** panel prohlížeče v Claude Code se občas
přestane vykreslovat a v tu chvíli stránka **zmrazí přepočet stylů**. Projeví se to
tak, že i přímý `element.style.transform='translateY(-40px)'` vrátí nulový posun
a `getComputedStyle` hlásí staré hodnoty. Než cokoli měřit, spustit test živosti:
vytvořit `div`, posunout ho inline stylem a ověřit, že se `getBoundingClientRect`
opravdu změnila. Ve zmrazeném stavu navíc `requestAnimationFrame` nikdy nevystřelí,
takže `await new Promise(r=>requestAnimationFrame(r))` zavěsí celé volání.

### Vodoznak značky i v kartách (9. 9. 2026)

`.vyhody` dostala `.vyh__znak`, tedy stejnou značku Flexi House jako `.dotazy__znak`,
ale **u levého okraje** místo pravého. Sekce k tomu potřebovala
`position:relative;isolation:isolate;overflow:hidden` — bez `isolation` by `z-index:-1`
propadl pod tónovaný obal `.tonovany` a značka by zmizela, bez `overflow:hidden` by
záporný `left` roztáhl stránku.

Artwork záměrně **není zrcadlený**. Logo je izometrický objekt a překlopení by obrátilo
světlo; „z druhé strany“ řeší jen umístění.

Změřeno: značka na 360/390/1280 px, `z-index -1`, průhlednost 0,05 na mobilu a 0,055
na desktopu, vodorovné přetečení dokumentu nikde.

**Hover karet konečně ověřený naživo** (dřív to blokovalo zmrazené prostředí):
karta se posune o −4 px, ikona z 38 na 40,3 px, což je přesně ×1,06, stín z 0,07 na
0,13. Po odebrání stavu se vše vrátí, žádný zbytek nezůstává.

## Cena sjednocena na 410 000 (10. 9. 2026)

Zdroj pravdy je konfigurátor: `base: 400000` a skupina `utilities` má `required:true`
s elektroinstalací za `10000`. Nejnižší objednatelná sestava je tedy **410 000 Kč bez DPH**
a od 10. 9. 2026 to tak web píše všude.

Nešlo o hledej a nahraď. Na několika stránkách text vysvětloval, **co v ceně je**, a
elektroinstalaci vyjmenovával jako věc, která v ceně NENÍ. Při 410 000 už v ceně je,
takže se s číslem musely přepsat i seznamy a součty:

- `rozkladaci-dum.html`: elektroinstalace přesunuta z příplatků do „V ceně“, pás
  `+94 000` → `+84 000` (25 + 30 + 29).
- `cena.html`: sestava „Hrubá stavba“ 400 000 → 410 000, druhá sestava ztratila
  elektroinstalaci z rozpisu. **Součty zůstaly stejné**: 410 + 84 = 494, 494 + 63 = 557.
- `dum-na-miru.html`, `glamping.html`: elektroinstalace v ceníku příplatků označená
  jako „v ceně“ místo 10 000.
- `celorocni-bydleni.html`, `caste-dotazy.html`, `flexi-office.html`, `katalog.html`,
  `index.html`: čísla, `lowPrice` ve schématu, titulky a meta popisky.
- `.docs/poradce/baze.md` přepsaná a přesestavená; `.docs/google-profil.md` z 405 000
  na 410 000 a „Vyrábíme“ → „vznikají v hale“, protože firma domy nevyrábí.

**Karta „Dům na míru“** už neuvádí cenu, má „cena na vyžádání“. Bistro má „cena podle
zadání“, což je jiná formulace schválně, aby dvě sousední karty nevypadaly jako chyba.

**Test cen poradce** (`.docs/poradce/test-ceny.mjs`) hlásil 410 000 jako neexistující
položku, protože uměl porovnávat jen jednotlivé ceny, ne součty. Doplněn o výpočet
nejnižší objednatelné ceny ze `základ + povinné skupiny`. Ověřeno nastraženou chybou:
415 000 test správně odmítne.

**Konzistenční skript: z 10 rozporů zbyly 2**, oba o Flexi Office 70 000. To je
zastaralá konstanta ve skriptu, ceník od Dana ze 7. 9. 2026 říká 100 000 a web taky.
Skript má i falešné poplachy: „400“ chytá i v datech SVG křivek.

**Past, na kterou jsem naletěl:** kontroloval jsem výskyty přes `400 000` s běžnou
mezerou, jenže HTML má na řadě míst `400&nbsp;000`. Tři stránky mi tak proklouzly a
našel je až konzistenční skript. Hledat vždy vzorem `400(?:&nbsp;|\s| )000`.

## Tečky karuselů: rozestup 14 → 24 px

`.vyuz__tecky` a `.pasfoto__tecky` měly mezeru 9 px (desktop) a 14 px (mobil).
Kolečko je 6 px, `::after{inset:-11px}` dělá plochu 28 px, ale rozestup středů 20 px
znamenal, že si sousedi plochu ukrajovali. Teď je mezera 24 px všude.

**Změřeno doťukáním přes `elementFromPoint`:** předtím 25 px u všech teček kromě
poslední, teď 33 px u všech.

**Pozor, moje první měření bylo špatné a nahlásil jsem 10 px.** V sondě jsem měl chybu,
kde druhý cyklus přepisoval výsledek prvního. Skutečnost byla 25 px, tedy těsně nad
limitem 24, ne pod ním. Sonda musí měřit každý směr do vlastní proměnné a sečíst je.

## Flexi Office 100 000 a recenze (10. 9. 2026)

Tomáš potvrdil dvě věci:

**Flexi Office stojí od 100 000 Kč.** Sedmdesát tisíc bylo staré číslo a přežívalo na
živých místech: `caste-dotazy.html` (text i JSON-LD), `.docs/poradce/baze.md`, tedy
i v odpovědích chatového poradce, `.docs/google-profil.md` a `.docs/flexi-office.md`.
Všude přepsáno, báze přesestavena.

**Recenze nemáme žádné.** Přestat je navrhovat jako řešení důvěry, viz paměť
`flexihouse-nemame-recenze`.

### Konzistenční skript měl dvě díry, obě zalepené

1. **Četl `offers.price`, ale stránky používají `AggregateOffer` s `lowPrice`.** Kontrola
   ceny ve strukturovaných datech tak vždycky viděla prázdný řetězec a tiše procházela.
   Proto taky roky nehlásila nic užitečného o ceně domu. Teď čte `price` i `lowPrice`
   a hlídá 410 000 pro dům a 100 000 pro kancelář.
2. **Cenu kanceláře hlídal jen ve schématu, ne v běžném textu.** Přesně proto v častých
   dotazech přežilo „Flexi Office pořídíte od 70 000 Kč". Přidána sekce 2b, která hledá
   `Office ... od X Kč` v textu všech stránek, báze poradce i popisu na Googlu.

Obojí ověřeno nastraženou chybou: podvržená cena 88 000 ve schématu i 70 000 v textu
se chytí, po vrácení hlásí skript nula rozporů.

Test cen poradce má v seznamu povolených částek nově 100 000 místo 70 000.
