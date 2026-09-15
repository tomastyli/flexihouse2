# Produktové stránky, stav k 13. 9. 2026 večer

Nic z toho není nasazené. Všechno žije na localhostu (`preview_start`, port 4599).

## Hotové a ověřené

**`/rozkladaci-dum` překlopená na krátkou verzi.** Deset sekcí místo osmi, stavba
`pl` / `holy` / `vyhody` / `kcta` / `claim` / `klid` / `dotazy` / `zaver` / `poptat`.
Mobil 8 212 px, tedy 9,7 obrazovky, začínalo se na 12,4.

- Ceník jako sekce **zrušený**, zůstala jedna velká věta a tři fotky doplňků.
  Rozpis dělá konfigurátor a `/cena`.
- Seznam s linkami u půdorysu **pryč**, opakoval čísla z kót výkresu.
- Poznámka u půdorysu dostala modrý pruh, zvýrazněný odkaz a tlačítko.
- Hero: nadpis na váhu 600, cena v Instrumentu 400 s prostrkáním −0,045em.
  Drobečky dole vlevo se šipkami místo lomítek.
- FAQ schéma přegenerované ze sedmi viditelných otázek. Předtím tam byly tři,
  z toho dvě, které na stránce nejsou. To je porušení pravidel Googlu.

**Otočka v heru přerenderovaná.** 36 snímků, 3000 × 1688, 320 vzorků, modré studio.

| | předtím | teď |
|---|---|---|
| snímek | 2080 × 1170 | 3000 × 1688 |
| pokrytí Retiny na 1440 | 77 % | 105 % |
| ostrost (měřená) | 3,83 | 5,07 |
| paměť bitmap | 350 MB | 729 MB |
| dekódování 36 snímků | neměřeno | 512 ms, nejhorší 46 ms |

**`/flexi-office` přestavěná do stejné stavby.** Devět sekcí, hero zatím na fotce.

## Flexi Office, dotaženo 15. 9. 2026

Stránka byla proti rozkládacímu domu tenká a bylo to vidět na první obrazovce.
Srovnáno do stejné podoby:

- **Drobečky nahoru, odkaz na první sekci dolů** („Rozměry a dodání"). Office je
  měl jako jediná stránka dole a odkaz dolů neměla vůbec, takže hero končil naprázdno.
- **Otočka v heru se zapnula.** 36 snímků ve 3000 × 1688 leželo hotových
  v `img/office-otocka-l/` a bylo zaregistrované v `flexi-otocka.js`, jen se na to
  nikdo neodkázal. Nic se nerenderovalo znovu.
- **Kontrast ceny v heru.** Bílé písmo na sdíleném překryvu vyšlo **3,8**, tedy pod AA,
  protože kontejner je bílý přesně tam, kde cena leží. Rozkládací dům má na stejném
  místě **4,8**. Překryv na Office prohlouben, po opravě **4,84**. Měřeno kompozicí
  snímku s gradientem, ne z písma.
- **Dotazy z pěti na deset.** Přibylo to, na co se lidi před koupí ptají a stránka
  mlčela: co je a není v ceně, doprava a usazení, co musí být na pozemku, stavební
  povolení, životnost a záruka. Schéma FAQ se generuje ze stejného zdroje jako
  viditelné otázky, takže se nemůžou rozejít.
- **Ceny za práci na pozemku** místo věty „počítají se zvlášť": doprava 20 000 Kč
  plus 100 Kč/km, patky od 50 000, montáž od 30 000.
- **Rozměry** 5,83 × 2,48 m, výška 2,53 m, plocha 12,8 m² v textu, v dotazech
  i v bázi poradce.

### Půdorys, hotový 15. 9. 2026

`img/pudorys/office-{480,800,1200,1600}w.webp`, 5,5 až 40 kB, v sekci `pl`
s kótami 5,83 a 2,48 m a popiskem plochy. Zadání Tomáše: „nějakou malou
kancelář, něco calm, zasedačka." Uvnitř je kulatý jednací stůl se čtyřmi
židlemi, nízká skříňka a květina; nástup u dveří zůstává volný.

Renderuje se ze stejné cesty jako hero:

```bash
Blender -b --python kontejner.py -- --model office --zebrovani --blend office.blend
HERO_PUDORYS=1 HERO_NABYTEK=rozmisteni-office.json \
  Blender -b --python blender-hero.py -- office.blend pud.png 320 2400
```

Čtyři věci, bez kterých to nevyšlo, a všechny jsou zapsané i v kódu:

- **Střecha a podhled musely dostat vlastní materiál.** `blender-hero.py` skrývá
  v půdorysu podle jmen `strecha` a `stropIn`. Kontejner je měl na `panel`
  a `interier`, tedy na stejném materiálu jako stěny, takže se skrýt nedaly,
  světlo dovnitř nepadlo a půdorys vyšel jako **černý obdélník**. Barvu i drsnost
  mají nové materiály shodnou s původními, zvenku se nic nezměnilo.
- **Plán nábytku musel jít vybrat.** Cesta byla natvrdo na dům, jehož plán by
  kontejneru naskládal dvě postele skrz stěnu ven. Přidán `HERO_NABYTEK`.
- **Skříň byla přesně 1,50 m, tedy ve výšce roviny řezu.** Řez se díval do její
  vnitřní strany a v půdorysu z ní byla černá skvrna. Zmenšena na 0,72.
  Výšku nábytku je potřeba hlídat: všechny ostatní kusy jsou pod 1,1 m.
- **Široký `HERO_POMER` kreslí malý model.** Nad 16:9 se měřítko váže na výšku
  snímku, takže kontejner zabral 42 % šířky. Renderuje se na 16:9 a ořezává
  se podle alfy se stejným odstupem ze všech stran; z toho odstupu vycházejí
  i procenta `--kota-*`, takže kóty nesedí od oka.

### Poptávkový formulář, 15. 9. 2026

**Živý `/rozkladaci-dum` má formulář, který nikdy neměl obsluhu.** Ověřeno curlem
na produkci: stránka obsahuje `<form id="lead">`, ale `getElementById('lead')`
na ní není ani jednou. Obsluha existuje jen v `index.html` a `poptavka.html`,
každá jako vlastní inline skript. Odeslání z produktové stránky tedy neudělalo nic
a poptávka se ztratila. Doplněno na obě produktové stránky.

**Model je předvybraný podle stránky**: `/flexi-office` má v poli Zájem rovnou
Flexi Office, `/rozkladaci-dum` rozkládací dům. Událost `generate_lead` nese
`form: 'flexi-office'` / `'rozkladaci-dum'`, takže jde v GA4 rozlišit, odkud
poptávka přišla.

**Pozor na duplicitní obsluhu.** Kdyby se někdy psala společná obsluha do
`flexi.js`, musí se zároveň vyhodit ty inline v `index.html` a `poptavka.html`,
jinak se poptávka odešle dvakrát.

### Chyba, která to způsobila

Při přepisu dotazů 15. 9. jsem sekci hledal přes `t.index('</div>\n  </div>\n</section>')`.
Konec sekce `dotazy` se na ten řetězec netrefil, index našel až konec `poptat`
a **smazal tím sekce `zaver` a `poptat`**. Kontroly to nechytily: JSON-LD bylo
platné, nic nepřetékalo, žádný odkazovaný soubor nechyběl. Všiml si toho až Tomáš.

Poučení: **po každém zásahu do struktury stránky vypsat seznam sekcí a porovnat
ho s předchozím stavem.** Jednořádkově:

```bash
python3 -c "import re;t=open('flexi-office.html',encoding='utf-8').read();print([m.group(1).split()[0] for m in re.finditer(r'<section[^>]*class=\"([^\"]+)\"', t)])"
```

### Mobil, 15. 9. 2026

Dvě věci, které na desktopu nebyly vidět a na telefonu stránku srážely:

- **Půdorys byl při 375 px proužek 295 × 129 px.** Kontejner má poměr 2,28:1,
  takže se na šířku telefonu smrskne. Na mobilu se proto podává otočený
  na výšku (`office-na-vysku-*.webp`, prostý `transpose` renderu, nic se
  nerenderovalo znovu) a vyjde na **295 × 674 px**. Prohazují se s ním
  i procenta `--kota-*`, protože odstup 26 px se dělí druhou stranou snímku,
  a popisky kót: vodorovná kóta nahoře nese na výšku hloubku, svislá délku.
  Řeší to dvojice tříd `.jen-sirka` / `.jen-vyska`.
- **Hero měl na mobilu oříznutý roh kontejneru.** `<source>` mířil na
  `flexi-office-*.webp`, což je snímek na šířku (1,79), a `object-fit: cover`
  z něj na vysokém heru udělal detail rohu, ze kterého produkt nepoznáš.
  Rozkládací dům má vlastní `kf-hero-teak-mobil-*` v poměru 0,50, Office žádný
  neměl. Dorenderován `office-hero-mobil-*.webp` ve stejném poměru:
  `HERO_POMER=0.5 HERO_ODSTUP=0.80`, úhel 218 stejně jako první snímek otočky.
  **`HERO_ODSTUP` je tu nutný**, výchozí 1,0 nechá kontejner malý uprostřed
  prázdné oblohy; 0,62 už ho ořízne po stranách.

Změřeno po opravě na 375 px: kontrast v heru h1 **6,42**, cena **5,62**,
mikrotext **6,16**; claim se 60% překryvem **6,81**. Žádné přetečení na žádné
z jedenácti stránek dávky.

### Co na Office schválně ještě není

1. **Vizualizace zevnitř.** Dnes je na stránce `img/office-interier.webp` a stránka
   sama přiznává, že je to ilustrace, ne dodávaný kus. Nahradit renderem z vlastního
   modelu nebo fotkou jednoho z deseti kusů skladem v Litomyšli. Model teď interiér
   i zařízení má, takže render je nejbližší cesta.
2. `kcta` sekce (konfigurátor) na Office **nepatří**, Office se nekonfiguruje.
   Osiřelé `.kcta` styly v hlavičce stránky jsou po tom zbytek.

## Poučení, ať se neopakuje

- **Měřit na dpr 2, ne na dpr 1.** Celý první render (2200 px) byl podle měření
  v pořádku a na Retině viditelně rozmazaný. Hero 1425 × 840 CSS potřebuje
  2850 × 1680 skutečných pixelů.
- **`object-fit: cover` ořezává šířku**, když je snímek širší než rám. Rozšíření
  snímku do stran úzkým oknům nepomůže, uškodí. Řeší se odstupem kamery.
- **Bezztratový webp nemá smysl.** Mezi kvalitou 94 a 99 se PSNR domu hne
  z 40,6 na 41,2 dB, protože zbytek je šum z renderu, ne komprese. Bezztratově
  by sada vážila 77 MB místo 5,5.
- **Archivo v oříznutém řezu má váhy jen 600 až 800.** `font-weight: 400` tiše
  nedělá nic, ověřeno měřením šířky textu. Osa šířky (`wdth`) chybí úplně.
- **Otočka se musí vypnout i na tabletu na výšku**, ne jen pod 700 px. Při poměru
  hera pod 1,17 cover ořízne dům po stranách.

## Otevřené, čeká na rozhodnutí

**`produkt-preset.py` hlásí 11 odchylek.** Popisuje starou stavbu produktové
stránky. Buď se přepíše na novou a převedou se i `flexi-office` a `dum-na-miru`,
nebo zůstane a stránky se rozejdou. Záměrně jsem ho nechal červený: přepsat ho
tak, aby prošel, by z něj udělalo kus kódu, který nic nehlídá.

**Hero rozkládacího domu ukazuje sedlovou střechu a terasu**, což je 130 000 Kč
nad cenou „od 399 000“, která stojí hned pod tím.

**Na stránce nejsou žádné recenze.** Jen hvězdičky v patičce.

## Flexi Office: co blokuje hero

Model `_3d-zdroj/kontejner/blend/office.blend` existuje, ale má **360 trojúhelníků**
proti 17 014 u rozkládacího domu. Chybí rám, spáry panelů, dveře i okno, takže
ortho výkresy vyjdou jako prázdný bílý obdélník a render je hladká krabice.

Postup, jak ho protáhnout herovým studiem, je zapsaný v `kontejner/README.md`
i se dvěma pastmi (deska `zeme` 242 × 242 m a přepal bílých panelů).

**Podklady, které existují:**

- `podklady-3d/ai-hero/reference/office.jpg`, jediná reference Office, ukazuje
  rám, spáry, mřížované okno i dveře. Na dodělání modelu stačí.
- `img/flexi-office.webp` a `img/bily-office.webp`, dvě použitelné fotky zvenku.
- `img/office-interier.webp`, ilustrace prosklené zasedačky, **není to produkt**,
  stránka to sama přiznává.

**Podklady, které pro Office neexistují:** žádná z 80 fotek v `podklady-3d/fotky/`
(všechny jsou rozkládací dům) ani nic ve `Projekty/Expandable/`, což je katalog
dodavatele Shandong UPS Housing, 12 stran a 30 fotek, taky jen rozkládací dům.

Nejlevnější cesta ven: **vyfotit jeden z deseti kusů skladem v Litomyšli.**
