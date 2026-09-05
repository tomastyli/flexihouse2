# Flexi House — předělání zbytku webu

Stav k 4. 8. 2026. Homepage a značka jsou hotové, zbytek webu je pořád ve starém designu. Tenhle soubor je zadání pro tu práci.

## Cíl

Převést všech osm zbývajících stránek do jazyka `_navrh-D.html`, aby web působil jako jeden celek, ne jako nová homepage nalepená na starý web. Nic se nepřepisuje obsahově, mění se stavba a styl. Ceny, parametry a kontakty se přenášejí beze změny, pokud to zadání výslovně neříká jinak.

## Co je zamčené

Odsouhlaseno, nediskutuje se znovu.

**Barvy.** Čtyři, víc ne.

| token | hodnota | role |
|---|---|---|
| `--ink` | `#16202a` | text, tlačítka, tmavé plochy |
| `--blue` | `#5a7885` | CTA pruh s bílým textem, inverzní tlačítka, přízvučná řádka |
| `--soft` | `#eef2f4` | světlé pruhy, patička |
| `--paper` | `#ffffff` | základ |

Odvozené: `--muted rgba(22,32,42,.6)`, `--hair rgba(22,32,42,.12)`. Zelená `#8dc63f` ze starého webu je mrtvá. Světle pastelová modrá (`#b3ebf2`, `#c9e4eb`, `#a8d3dd`, `#9ecfe4`) je zamítnutá, nevracet ji.

**Písmo.** Bricolage Grotesque 800 na nadpisy (`wdth` 84–88, verzálky), Instrument Sans na text, Archivo Expanded 800 na značku. Vše self-hostované z `fonts/`, latin i latin-ext zvlášť. Barlow Condensed a DM Mono se nepoužívají, to je podpis modulehome.

**Značka.** Rozkládací dům v axonometrii, tři díly na jedné podlaze, vystupující tmavý střed s prosklením. Inline SVG, tři tónové sady: světlý podklad, tmavý podklad, profilovky.
- zdroj a všechny varianty: `_logo5.html`
- samostatný soubor: `assets/flexi-mark.svg`
- profilovky 1080×1080: `assets/social/pfp-a.png` až `pfp-d.png`
- v navigaci ořezaný viewBox `9 16 46 33`, šířka 47 px
- bez sedlové střechy, zamítnuto 4. 8. 2026

**Komponenty z `_navrh-D.html`**, které se přebírají beze změny: `.top` (nav 60 px), `.brand`, `.btn` a `.btn--out`, `.link`, `.wrap`, `.grid` (dlaždice výbavy), `.cta` (modrý pruh), `.foot` (čtyři sloupce), `.burger`.

## Co se nesmí

Zamítnuté směry, každý z nich už jednou padl.

1. Kreslené SVG ilustrace, schémata a technické kresby v obsahu stránek. Značka je výjimka, ta je hotová.
2. Zaoblené karty s odznaky ve stylu SaaS. Produkty jsou široké řádky nebo prosté bloky.
3. Doslovné kopírování modulehome.cz. Přebírá se kompoziční logika, ne provedení.
4. Ikonové dlaždice s ikonami. Dlaždice výbavy jsou nadpis, řádek textu a linka.
5. Eyebrow popisky nad nadpisy a číslované sekce.

## Krok 0: sdílený stylopis — HOTOVO

`assets/flexi.css` existuje, `_navrh-D.html` na něm jede a vypadá pixelově stejně jako předtím (ověřeno porovnáním screenshotů, nulový rozdíl). Přibyl styl formulářů a dvousloupce pro poptávku.

Past, na kterou jsem narazil: v CSS souboru se relativní cesty počítají od `assets/`, takže `url(fonts/…)` musí být `url(../fonts/…)`. Bez toho se tiše nenačte žádný font.

Druhá past: vlastní třída se `padding` přepíše boční padding z `.wrap`, když je na stejném elementu (`class="wrap lede"`). Používat `padding-block`.

Zbývá: `assets/site.css` a `assets/home.css` smazat, až na nich nebude viset žádná stránka.

## Stránky

| soubor | stav | co s ní |
|---|---|---|
| `_navrh-D.html` | zdroj | zůstává jako zdroj, `index.html` z něj vychází |
| `index.html` | **HOTOVO** | přepnuto na návrh D, doplněn canonical, OG a JSON-LD Organization, WebSite i LocalBusiness |
| `rozkladaci-dum.html` | **PŘESTAVĚNO 4. 9. 2026** | produktová šablona, výřezy s obtahem, výkres s kótami, 557 slov |
| `flexi-office.html` | **HOTOVO** | kratší varianta téhož, skladovost 10 ks a cena 70 000 Kč zachovány, Product JSON-LD s inventoryLevel |
| `katalog.html` | **HOTOVO** | tři produkty jako široké řádky, parametry v tabulce, ceny z konfigurátoru, JSON-LD ItemList a BreadcrumbList |
| `konfigurator.html` | **HOTOVO** | nový vzhled ve `assets/flexi-konfigurator.css`, logika a ceny nedotčené, ověřeno proklikáním všech pěti kroků (480 000 → 500 000 Kč, rekapitulace se generuje). PDF se kreslí přímo přes jsPDF v brandové sazbě (Bricolage 800 + Instrument, paleta ink/blue), knihovna se načítá až na kliknutí. |
| `poptavka.html` | **HOTOVO** | formulář napojený na `/api/send-lead`, honeypot, klientská validace, stavové hlášky, kontaktní blok. Úspěšná cesta se dá ověřit až na Pages, lokálně přes `file://` API neběží. |
| `podminky.html` | **HOTOVO** | převlečeno, právní text doslova zachován |
| `zasady-ochrany-soukromi.html` | **HOTOVO** | totéž |
| `404.html` | **HOTOVO** | rozcestník na produkty a kontakty, noindex |
| `mini-house.html`, `flexi-family.html` | smazáno 5. 9. 2026 | staré adresy vede 301 v `_redirects` na `/rozkladaci-dum` |

## Pořadí

1. ~~Krok 0, sdílený stylopis.~~ hotovo
2. ~~`poptavka.html`~~ hotovo
3. ~~`katalog.html` a `rozkladaci-dum.html`~~ hotovo
4. ~~`flexi-office.html`~~ hotovo
5. ~~Právní stránky a 404~~ hotovo
6. ~~`konfigurator.html`~~ hotovo
7. ~~Přepnout `index.html` na návrh D~~ hotovo. Smazání `assets/site.css` a `home.css` zbývá, visí na nich už jen archivní `_navrh-*.html`.

## Stav k 26. 8. 2026 — co z „otevřených věcí" zbylo

Seznam níž je z 4. 8. a je zastaralý. Přeměřeno a přepsáno 26. 8.:

| položka z 4. 8. | stav |
|---|---|
| Dev banner | **hotovo**, na žádné stránce už není |
| Izolace 80 vs 75/100 mm | **hotovo**, homepage i konfigurátor uvádějí 75 a 100 mm |
| Produkční deploy | **hotovo**, Pages projekt `flexihouse2` v účtu Dana Prokeše, domény `flexihouse.cz` i `www` |
| Ceny | **hotovo**, 400 000 v katalogu, na detailu i jako `base` v konfigurátoru |
| Fotky Office a dům na míru | **otevřené**, pořád jen rendery |
| Písmo ve značce | Archivo nasazený a funguje, papírová položka |

### Naměřeno na produkci (26. 8. 2026, Lighthouse desktop)

Do té doby se měřil jen náhledový projekt, takže tyhle věci nebyly vidět.

| stránka | výkon | přístupnost | postupy | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| / | 100 | 100 | 100 | 92 | 0,6 s | 0 |
| /katalog | 100 | 100 | 100 | 92 | 0,6 s | 0 |
| /konfigurator | 100 | 100 | 100 | 92 | 0,5 s | 0 |
| /poptavka | 100 | 100 | 100 | 92 | 0,4 s | 0 |
| /flexi-house | 99 | 100 | 100 | 92 | 0,9 s | 0 |
| /flexi-office | 100 | 100 | 100 | 92 | 0,7 s | 0 |
| /podminky | 100 | 100 | 100 | 92 | 0,4 s | 0 |

Homepage měla před opravou výkon 86 a CLS 0,073. Tři nálezy, všechny opravené:

- **Hero se stahoval dvakrát.** Preload nabízel kandidáty jen do 1200w, ale
  `<img srcset>` má i 1400w. Prohlížeč stáhl obojí, 133 + 139 kB. Pravidlo:
  `imagesrcset` v preloadu musí být znak po znaku stejná sada jako `srcset`
  v elementu, jinak se obrázek stáhne dvakrát a v Lighthousu to vypadá jako
  „velký obrázek", ne jako duplicita.
- **`sizes` lhalo o šířce.** Karty `flexi-office` a `dum-na-miru` v mřížce
  `.picks` měly `100vw, 1280px`, přestože jsou široké 485 px, takže se tahal
  originál 1051×788. Kartu `flexi-house` to minulo, ta `sizes` měla správně —
  chyba vznikla kopírováním jen na dvou ze tří karet.
- **Posun rozvržení dělalo písmo.** Systémový sans-serif je na nadpisu
  homepage o 28 % širší než Bricolage (2758 vs 2153 px, změřeno). Nadpis se
  v náhradním písmu zalomil na víc řádků a při doběhnutí Bricolage shodil
  zbytek stránky. Přidaná rodina `BricolageNahrada` se `size-adjust: 80 %`
  sedí na 0,1 %. Výška řádku jde z `line-height`, takže `size-adjust`
  blokovým rozvržením nehne.

Celkem homepage z 633 na 392 kB.

**SEO 92 na všech stránkách je planý poplach.** Cloudflare vkládá do
`robots.txt` řádek `Content-Signal:`, který Lighthouse nezná a hlásí jako
neznámou direktivu. Podle specifikace robots.txt se neznámé direktivy ignorují,
Googlu to nevadí. Zmizí to zároveň s vypnutím Managed robots.txt, viz níž.

**Konfigurátor těsně po deployi jednou ukázal CLS 0,382.** Tři běhy po sobě
pak daly 0. Je to studená edge cache po nasazení nových textur, ne chyba
stránky — neopravovat, jen se tím nenechat zmást.

### Vyřešeno 26. 8. odpoledne

**AI crawlery odblokované.** Byly to opravdu dvě vrstvy a jedna zamykala
druhou. V **AI Crawl Control → Security** byla polovina crawlerů zablokovaná,
ale jednotlivé přepínače nešly přepnout: tooltip prozradil, že je drží nadřazené
**Block AI bots Scope**. To se přepnulo z „Block on all pages" na
„Do not block (allow crawlers)", čímž se odemklo všech 32 přepínačů a všechny
spadly na nezablokované. Druhá vrstva je **AI Crawl Control → Signals →
Managed robots.txt**, ta se vypnula zvlášť. Teprve pak robots.txt přestal být
„Cloudflare Managed" a začal se servírovat náš vlastní z repa.

Vedlejší efekt: SEO v Lighthouse vyskočilo z 92 na **100** na všech stránkách,
protože zmizel řádek `Content-Signal:`, který Lighthouse neumí přečíst.
**Celý web je teď 100/100/100/100.**

Zóna je v účtu Dana Prokeše a přes API to nejde, token má na zónu jen čtení
(zápis vrací 10405). Klikalo se v dashboardu.

**Ceny a texty srovnané.** Základní cena 400 000 Kč je za hrubou stavbu:
konstrukce, okna, dveře, fasáda, zateplení 75 mm. Všechno ostatní je příplatek,
včetně elektroinstalace za 5 000 Kč a terasy za 40 000 Kč, přestože se dům
jmenuje „rozkládací dům s terasou". Stránky to dřív vydávaly za samozřejmost.
Detail domu má teď oddíl **Co je v ceně od 400 000 Kč** s rozpisem podle
konfigurátoru a s oběma sazbami DPH.

**Detail domu si odporoval v zateplení.** Konstrukce, Technické parametry i
JSON-LD uváděly EPS 50 mm, zatímco cena o dva odstavce výš, FAQ na homepage
i konfigurátor mluví o 75 mm. Sjednoceno na 75 mm se 100 mm jako příplatkem
podle Danova ceníku z 25. 8. **Těch 50 mm byl zbytek původního datasheetu,
ať to Dan potvrdí.**

**Audit češtiny** (`design-pravidla/nastroje/cestina-audit.py`) hlásí dva
nálezy, oba jsou plané: „Buď jsme ji přesunuli, nebo…" je párová spojka a
„je majetkem provozovatele, nebo je užíván…" je vylučovací poměr, čárka tam
patří. Ručně opravené věci, které nástroj nechytí, jsou v commitu 304a47d.

### Otevřené — potřebuje Tomáše nebo Dana

1. **Fotky.** Flexi Office a Dům na míru mají jen rendery.
2. **Potvrdit zateplení** základního provedení, viz výš.
3. **„Bambusová podlaha 18 mm"** v konstrukci detailu domu zní jako doslovný
   překlad z čínského datasheetu a fotky ani 3D model bambus neukazují.
   Neměnil jsem to, protože nemám čím to vyvrátit.
4. **Kolik poptávek z webu reálně chodí** nikdo nesleduje. GA4 eventy běží
   od 25. 8., data už být musí.

## Hotovo znamená

- [ ] stránka jede na `assets/flexi.css`, žádný inline blok tokenů
- [ ] nav a patička identické se zbytkem webu, značka v obou
- [ ] žádný `<img width height>` bez `height:auto` v CSS, jinak se obrázek natáhne (stalo se v tomhle repu dvakrát)
- [ ] `?v=` na CSS, značce a faviconu, Cloudflare drží starou cache
- [ ] kontrast textu na modré a na soft ověřený, ne odhadnutý
- [ ] diakritika sedí, tedy latin i latin-ext u každého fontu
- [ ] žádný požadavek na cizí doménu, fonty i skripty lokálně
- [ ] mobil 360 px projitý, ne jen desktop
- [ ] `dev-banner` odstraněn, viz níže

## Nálezy z práce, které je potřeba dořešit

- **Past při přepisu souborů.** `open(f,'w').write(build(f))` vyprázdní soubor dřív, než ho `build` stihne přečíst. Stalo se u `podminky.html`, zachránil git. Vždy nejdřív sestavit do proměnné, pak zapsat.
- **Odkazy uvnitř textu nebyly poznat.** Základní `a` nemá podtržení, takže odkazy v právním textu vypadaly jako běžný text. Doplněno `.prose a` s linkou.

- ~~**Burger nefunguje.**~~ Vyřešeno: `assets/flexi.js` plus panel `#menu`. Otevírá a zavírá, zamyká scroll, reaguje na Esc a na zvětšení okna, `aria-expanded` a `aria-controls` sedí. Je na všech nových stránkách.
- ~~**E-mailové šablony jedou na starém brandu.**~~ Přebarveno v obou funkcích na `#16202a` a `#5a7885`, zaoblení zrušeno, syntaxe ověřena. Zbývá vizuálně zkontrolovat odeslaný e-mail. Původní text: `functions/api/send-lead.js` a `send-konfigurace.js` mají zelenou `#8dc63f` a navy `#0b2545`, tedy barvy, které na webu už neexistují. Zákazník dostane po odeslání poptávky e-mail v jiném brandu než web, ze kterého odesílal. Přebarvit na `--ink` a `--blue`, značku vložit jako odkaz na PNG (SVG v e-mailech nefunguje spolehlivě).

## Naměřeno na náhledu (4. 8. 2026, Lighthouse mobil)

| stránka | výkon | přístupnost | postupy | LCP | CLS |
|---|---|---|---|---|---|
| / | 98 | 100 | 100 | 2,4 s | 0 |
| /katalog | 97 | 100 | 100 | 2,6 s | 0 |
| /flexi-house | 98 | 100 | 100 | 2,4 s | 0 |
| /flexi-office | 100 | 100 | 100 | 1,9 s | 0 |
| /konfigurator | 99 | 100 | 100 | 1,9 s | 0 |
| /poptavka | 99 | 100 | 100 | 1,8 s | 0 |
| /podminky | 99 | 100 | 100 | 1,8 s | 0 |

SEO kategorie hlásí jedinou chybu, `is-crawlable`, což je záměrný `noindex` náhledu. Na produkci odpadá.

**Co k těm číslům vedlo:**
- Responzivní obrázky: ke každé fotce varianty 480, 800 a 1200 px a `srcset` se `sizes`. Mobil stahoval 140 kB hero fotku, teď 78 kB. Výkon mobilu skočil z 84 na 97 a výš.
- Písma instancovaná a subsetovaná: Bricolage ze 181 kB na 38 kB, Archivo z 66 na 19 kB, Instrument ze 40 na 35 kB. Zafixovaly se osy, které web reálně používá (Bricolage wght 800, wdth 84 až 90). Celkem z 287 kB na 92 kB.
- Preload LCP obrázku i obou řezů písma včetně latin-ext, protože české nadpisy potřebují ext soubor hned.
- `jspdf` (412 kB) + fonty pro PDF, tj. Bricolage 800 a Instrument 400/600 (117 kB), se načítají až po kliknutí na Stáhnout PDF.

**Kontrast:** tlumený text ztmaven z 60 na 70 procent krytí (4,40 na 6,09), text v modrém pruhu na plnou bílou, popisky na světlém podkladu z `--blue` na `#3f5c69`, cookie lišta přebarvena. Všechny stránky mají přístupnost 100.

**URL bez přípony.** Cloudflare u `.html` dělá 308 na verzi bez přípony, a to i na produkčním flexihouse.cz. Odkazy, canonical, OG i sitemap proto míří na `/katalog`, `/flexi-house` a podobně. Soubory zůstávají `.html`, jen se na ně neodkazuje. Pozor: kvůli tomu nefunguje proklikání přes `file://`, testovat je potřeba přes nasazený náhled nebo `wrangler pages dev`.

## Co je ověřené (4. 8. 2026)

- Všechny odkazy a obrázky napříč dvanácti stránkami existují, žádná mrtvá cesta ani kotva.
- Mobil 390 px: osm stránek, `scrollWidth` přesně 390, nikde vodorovné přetečení, burger a menu všude.
- Konfigurátor: pět kroků proklikáno, validace drží, cena se počítá, rekapitulace i formulář se generují, PDF knihovna se načte až na kliknutí.
- SEO: každá živá stránka má jeden H1, vlastní title, description do 160 znaků, canonical a validní JSON-LD. Náhled e-mailu a redirecty mají `noindex`.
- Žádný požadavek na cizí doménu, cdnjs je pryč.
- Nula em dashů, nula pilulek a zaoblených odznaků na celém webu.

## Otevřené věci

- **Dev banner.** Červený pruh „Web je ve vývoji" je na sedmi stránkách a v konfigurátoru na čtyřech místech. Před ostrým spuštěním smazat `<div class="dev-banner">` a vrátit `--dev-h` na 0, jinak zůstane prázdný pruh nad navigací.
- **Izolace.** Homepage tvrdí 80 mm, konfigurátor nabízí 75 a 100 mm. Ověřit u Dana Prokeše, které platí, a sjednotit.
- **Produkční deploy.** Pages projekt pro flexihouse.cz nebyl v účtu nalezen, deploy živého webu jde jinudy nebo pod jiným účtem. Zjistit dřív, než bude co nasazovat.
- **Fotky.** Office a dům na míru mají jen rendery. Tomáš je chtěl nafotit.
- **Font ve značce.** Archivo Expanded 800 je nasazený, Space Grotesk 700 byl druhá varianta. Nerozhodnuto definitivně.

## Poznámky k údržbě

- **Cache-busting.** `_headers` dává assetům roční immutable cache. Po každé změně CSS, JS nebo značky je nutné zvednout `?v=` ve všech HTML, jinak se změna neprojeví ani po deployi. Přišel jsem na to tak, že Lighthouse tvrdošíjně hlásil opravený kontrast.
- **Zdrojová písma.** Původní `*-var-*.woff2` zůstávají v repu jako zdroj pro budoucí subsetování, ale do deploye se nekopírují.

## Náhled

Návrhový Pages projekt `flexihouse-navrh` (`https://flexihouse-navrh.pages.dev`, noindex). Deploy:

```bash
npx wrangler@4 pages deploy <dir> --project-name=flexihouse-navrh --branch=navrh --commit-dirty=true
```

Je to samostatný projekt, živého webu se nedotýká. Čerstvě nasazený Pages projekt pár minut vrací 522, než se rozjede edge, není to chyba deploye.
