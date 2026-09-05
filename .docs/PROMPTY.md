# Prompty pro paralelní sessions (obsahové stránky)

Sepsáno 3. 9. 2026. Osm oken, osm stránek, každá ve vlastním worktree.
Do každého okna vlož **jen ten jeden blok** z oddílu „Prompty". Společná pravidla si
session načte sama odsud.

---

## Společná pravidla (platí pro každou session)

### 1. Vlastní worktree, nikdy sdílený strom

Osm sessions v jednom pracovním stromě se navzájem přepíše. První krok každé session:

```
cd "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2"
git fetch origin
git worktree add "/Users/tomastylich/Desktop/Projekty/fh-<slug>" -b stranka/<slug> origin/main
```

Od té chvíle se pracuje **výhradně** v `/Users/tomastylich/Desktop/Projekty/fh-<slug>/`.
Do původní složky `flexi hoouse 2` se nic nezapisuje.

### 2. Hranice souborů, tohle drží merge bez konfliktů

Session smí měnit **jediný HTML soubor, ten svůj.** Nic jiného.

Zakázáno sahat na: `assets/flexi.css`, `sitemap.xml`, patičky a navigaci ostatních
stránek, `index.html`, `.docs/STRANKY.md`, `.docs/poradce/baze.md`, `robots.txt`,
`functions/`. Když stránka potřebuje nový komponent, dá se `<style>` do hlavy té stránky
a napíše se to do závěrečné zprávy. Propojení do navigace, patičky a sitemapy se dělá
až po merge v jednom průchodu, ne v osmi.

Commit klidně průběžně, ale **nepushovat a nedeployovat.** Náhled schvaluje Tomáš.

### 3. Co se čte předtím, než se něco napíše

- `/Users/tomastylich/Desktop/Projekty/design-pravidla/` celá složka, závazná
- `.docs/GOAL.md` v repu, zamčené barvy, písma a zamítnuté směry
- `.docs/STRANKY.md` v repu, fronta stránek a čím je která blokovaná
- `.docs/poradce/baze.md` v repu, **jediný zdroj pravdy o produktu**
- `cena.html` jako vzor stavby a jazyka, je to poslední hotová stránka

### 4. Tvrdá hranice na obsah

Co je v `baze.md` pod NEVÍME, na web nepatří. K 9/2026 to je délka výroby, financování,
záruka, náklady na vytápění a zateplení dekorového panelu. Web a chatový poradce musí
říkat totéž. Když stránka na takové místo narazí, **nechá se tam díra a napíše se
otázka na Dana do závěrečné zprávy.** Nic se nedomýšlí ani neopisuje od konkurence.

Ceny domu a vybavení bez DPH, práce na pozemku včetně DPH, nesčítat dohromady.

### 5. Cíl na rozsah

Zhruba 900 slov a víc než 7 podnadpisů H2. Rankující konkurence má 934 až 943 slov,
homepage Flexi House má 433 a proto je mimo první stovku. Pro srovnání: `cena.html`
má dnes 616 slov a 7 H2, takže i ta je pod cílem.

Měřit, ne odhadovat:

```
python3 -c "import re;h=open('SOUBOR.html').read();t=re.sub(r'<(script|style)[^>]*>.*?</\1>','',h,flags=re.S);t=re.sub(r'<[^>]+>',' ',t);print('slov',len(t.split()),'H2',len(re.findall(r'<h2',h)))"
```

### 6. Zakázané vzorce v UI

Z `design-pravidla` a z dřívějších rozhodnutí: žádné eyebrow popisky nad nadpisy,
žádné číslované sekce, žádné karty X versus ✓, žádné plovoucí chips, žádné statistické
dlaždice, žádné odrážky s checkmarky, žádná tlačítka se září, žádný monospace font,
žádné kreslené SVG ilustrace a schémata v obsahu, žádné ikonové dlaždice, žádné zaoblené
SaaS karty. Text se na mobilu zarovnává vlevo, ne na střed.

### 7. Než se session prohlásí za hotovou

1. `python3 /Users/tomastylich/Desktop/Projekty/design-pravidla/nastroje/cestina-audit.py <soubor>`
2. rubrika z `design-pravidla/08-checklist.md`, cíl je 16 z 20 a víc
3. lokální náhled, screenshot na 1280 px a na 390 px
4. **přetečení měřit v iframu, ne ze screenshotu.** Snímek ořezává pravou stranu a lže
   o šířce. Stejně tak headless Chrome má minimum 485 px.
5. odkaz na sebe sama zatím nikde není, to je v pořádku, plumbing přijde po merge

Závěrečná zpráva má obsahovat: počet slov a H2, co se tvrdí a odkud to je, seznam děr
a otázek na Dana, a co si stránka žádá dopsat do sdíleného CSS.

### 8. Text je návrh, ne finál

Tomáš si stránky přepisuje do svého jazyka. Piš to jako hotový, ale předkládej to jako
návrh k přepsání, ne jako věc k nasazení. Nasazuje se až po jeho schválení.

---

## Prompty

### Okno 1, `/stavebni-povoleni`

```
Stavíš stránku /stavebni-povoleni pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je stavebni-povoleni.

Dotaz: modulární dům bez stavebního povolení. 850 hledání měsíčně a jako u jediné stránky
v celé frontě NÍZKÁ konkurence. Dnes na to má web jednu větu v častých dotazech.
Ten dotaz musí být v titulku i v H1.

Tohle je stránka, kterou si člověk čte PŘED nákupem, ne po něm. Musí být právně přesná.
Nepřesná právní stránka je horší než žádná a přitáhne poptávky, které nejdou obsloužit.
Když si u něčeho nejsi jistý, radši to neřekni, nebo to napiš jako "závazně řekne jen
stavební úřad".

Z báze smíš: záleží na velikosti a účelu stavby, u menších staveb pro zázemí bývá režim
jednodušší, závazné vyjádření dá jedině místní stavební úřad, vyřízení povolení neděláme,
dům stojí na betonových patkách a klasické základy nepotřebuje.

Právní část si ověř z primárního zdroje, tedy ze stavebního zákona v platném znění
k roku 2026, ne z blogů konkurence. Kde si nejsi jistý aktuálním zněním, napiš to do
závěrečné zprávy jako věc k ověření, ne na stránku.

Osnova k rozmyšlení, ne dogma: kdy povolení opravdu potřebuješ a kdy ne, co je ohlášení
a čím se liší, role velikosti a účelu, proč patky a ne základy, co si musí zákazník
zařídit sám, co uděláme my, na co se zeptat úřadu a jak, časté omyly.
```

### Okno 2, `/flexi-office` přepsat

```
Přepisuješ existující stránku flexi-office.html na flexihouse.cz. Nezakládáš novou.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je flexi-office.

Dotaz: kancelářský kontejner 480 hledání, zahradní kancelář 110, dohromady 590.
Titulek už na to míří, obsah má ale jen 446 slov. Poměr přínos ku práci je tu nejlepší
z celé fronty, protože se nic nezakládá a stránka už v sitemapě i v navigaci je.

Úkol: dopsat na zhruba 900 slov a víc než 7 H2 a přidat sekci na použití, které dnes
chybí, tedy zahradní kancelář, studio, showroom, ordinace, recepce na stavbě.
Zachovat cenu od 70 000 Kč a fakt, že deset kusů je skladem.

BLOKÁTOR: ve schématu na té stránce je dnes "EPS panely 50 mm", v bázi je u domu 75 mm.
Nevíme, která hodnota platí pro Office. Do technické tabulky to nepiš, dokud to Dan
nepotvrdí, nech tam díru a napiš otázku do závěrečné zprávy.

Pozor, ať se stránka nezačne překrývat s /cena a s /doprava-a-montaz, které vznikají
paralelně. Doprava a montáž se tady jen zmíní jednou větou.
```

### Okno 3, `/rozkladaci-dum`

```
Stavíš stránku /rozkladaci-dum pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je rozkladaci-dum.

Dotaz: rozkládací dům. 90 hledání měsíčně, konkurence vysoká. Objem je malý, ale tohle
je JEDINÉ místo, kde je web v Googlu vůbec vidět, na 28. pozici, změřeno 2. 9. 2026.
Rankuje na to dnes homepage. Vlastní stránka je nejkratší cesta na první stranu.

Jednička je rozkladacidum.cz, tedy doména přesně na ten výraz. Má ale jediný zpětný
odkaz, takže se dá dohnat obsahem. Podívej se, co má, a napiš víc a konkrétněji.

Z báze smíš: rozloženo 6,32 × 5,90 m, složeno 2,20 × 5,90 m, výška 2,48 m, zhruba 30 m²,
hmotnost kolem 2 000 kg, rozložení zvládnou čtyři lidé za půl dne, ložnic 1 až 4,
základní cena 400 000 Kč bez DPH, v ceně nosná konstrukce, hliníková okna s izolačními
dvojskly, dveře, fasádní obklad a zateplení 75 mm.

POZOR na past, kterou máme změřenou: cena 400 000 Kč je hrubá stavba, nekryje ani
elektroinstalaci a terasu. Nesmí to vyznít jako dům na klíč.

Fotky reálného rozkládacího domu jsou v repu, používej ty, ne rendery, ale nikoli
v sekci, která by tvrdila konkrétní české zakázky.
```

### Okno 4, `/celorocni-bydleni`

```
Stavíš stránku /celorocni-bydleni pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je celorocni-bydleni.

Dotaz: mobilní dům na celoroční bydlení. 590 hledání měsíčně, konkurence vysoká.

Z báze smíš: zateplení 75 mm v základu stačí na mírné klima, pro trvalé bydlení 100 mm
za 30 000 Kč, topí se klimatizací s tepelným čerpadlem za 29 000 Kč, ta umí topit
i chladit, vytápění NENÍ v základní ceně, kamna už v nabídce nejsou.

BLOKÁTOR, se kterým počítej od začátku: náklady na vytápění za sezónu jsou pod NEVÍME.
Stránka o celoročním bydlení, která neřekne, kolik stojí topení, je nekompletní.
Nedomýšlej to a nepočítej modelový příklad z obecných tabulek. Nech na tom místě
označenou díru a napiš otázku na Dana do závěrečné zprávy. Zbytek stránky postav celý,
ať je hotová ve chvíli, kdy Dan odpoví.

Zároveň platí, že zateplení dekorového fasádního panelu je taky pod NEVÍME.

Osnova k rozmyšlení: co znamená celoroční u téhle stavby, zateplení a rozdíl 75 versus
100 mm, čím se topí a co to stojí pořídit, chlazení v létě, vlhkost a větrání, přípojky
a co si zajišťuje zákazník, trvalý pobyt a adresa, kde je hranice a co nedoporučujeme.
```

### Okno 5, `/glamping`

```
Stavíš stránku /glamping pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je glamping.

Dotaz: glamping domky. 390 hledání měsíčně, konkurence vysoká.

Tohle není nový produkt, je to nový typ zákazníka na stejný produkt. Nekopíruj proto
stránku o domě, argumentace je jiná: kupuje to provozovatel kempu, penzionu nebo
majitel pozemku, který chce ubytovávat. Zajímá ho návratnost, rychlost postavení,
kolik jednotek se vejde, provoz mimo sezónu, údržba a to, že se dá dům odvézt.

Fotku glampingu už máme v repu, najdi ji.

Nedomýšlej návratnost ani obsazenost. Když chceš pracovat s ekonomikou, počítej jen
s čísly, která máme, tedy s pořizovací cenou a s dopravou a montáží, a zbytek nech
jako otázku, kterou si má zákazník spočítat podle svých cen za noc.

Pozor na to, že cena 400 000 Kč je hrubá stavba. Provozovatel ubytování bude potřebovat
vybavení navíc, tak to řekni na rovinu.
```

### Okno 6, `/doprava-a-montaz`

```
Stavíš stránku /doprava-a-montaz pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je doprava-a-montaz.

Dotaz: dlouhý ocas, samostatný objem tu není. Hodnota je v tom, že tohle je nejčastější
skrytý náklad a lidi na něj narazí až v jednání.

DĚLBA S JINOU SESSION: paralelně běží okno, které dopisuje /cena. Tahle stránka je
vlastník tématu doprava, patky a montáž. /cena na ni bude odkazovat a nechá si jen
souhrnný řádek. Nepiš sem celý ceník domu.

Z báze smíš: doprava 20 000 Kč plus 100 Kč za kilometr z výroby, patky 50 000 až
90 000 Kč podle podloží, montáž 30 000 až 80 000 Kč podle náročnosti, potřeba rovná
plocha a příjezd pro nákladní auto s jeřábem, přípojky vody, elektřiny a odpadu
si zajišťuje zákazník. Složený dům měří 2,20 × 5,90 m, výška 2,48 m, váží kolem
2 000 kg, proto jeřáb.

Ceny za práci na pozemku jsou včetně DPH, cena domu je bez DPH. Nesčítat dohromady
a napsat u každého čísla, co platí.

Nejužitečnější věc, kterou tahle stránka může udělat, je dát člověku seznam toho, co
má na pozemku připravené mít, a varovat ho na případy, kdy to nejde, tedy úzký příjezd,
svah, měkké podloží, dráty nad pozemkem.
```

### Okno 7, `/jak-to-probiha`

```
Stavíš stránku /jak-to-probiha pro flexihouse.cz.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je jak-to-probiha.

Tohle není SEO stránka, objem je značkový a dlouhý ocas. Je to stránka pro člověka,
který už zvažuje a chce vědět, do čeho jde. Modulstav má /postup-realizace, my nemáme nic.
Nepotřebuje fotky, stačí pravdivý popis procesu od poptávky po usazení.

BLOKÁTOR: kolik týdnů trvá výroba, je pod NEVÍME. Na Google profilu kdysi stálo
"do 3 týdnů", Tomáš 2. 9. potvrdil, že to neplatí, a z profilu je to pryč. NEPIŠ
žádné lhůty, ani orientační, ani "obvykle". Nech u kroku výroby označenou díru
a napiš otázku na Dana do závěrečné zprávy.

Pod NEVÍME je i financování, splátky a záruka. Kroky, které se jich týkají, popiš
jen procesně, bez podmínek.

Osnova k rozmyšlení: poptávka a co od zákazníka potřebujeme, konfigurace a upřesnění,
cenová nabídka, co si zákazník řeší na pozemku souběžně, výroba, doprava, usazení
na patky, rozevření na místě, předání, co následuje potom.

Protože je stránka bez lhůt, o to konkrétnější musí být v tom, KDO co dělá. Každý krok
by měl říct, co dělá zákazník a co my.
```

### Okno 8, `/cena` dopsat

```
Dopisuješ existující stránku cena.html na flexihouse.cz. Nezakládáš novou.

Nejdřív si přečti "/Users/tomastylich/Desktop/Projekty/flexi hoouse 2/.docs/PROMPTY.md",
oddíl Společná pravidla. Platí celý, včetně vlastního worktree. Slug je cena.

Stav: stránka je hotová, 13 commitů, poslední f801314, nepushnutá. Čeká na Danovo
rozhodnutí, jestli ceník zveřejnit, ne na práci. Změřeno dnes: 616 slov a 7 H2,
tedy pod cílem 900 slov a víc než 7 podnadpisů.

Úkol: dopsat na cíl, aniž bys naředil to, co tam je. Konkurence ceny buď schovává
úplně, levnykontejner nemá na celé stránce jediné "Kč", nebo dá jen slovo "od".
Naše výhoda je, že odpovídáme na rovinu. Nezhoršit ji vatou.

DĚLBA S JINOU SESSION: paralelně vzniká /doprava-a-montaz, ta je vlastník tématu
doprava, patky a montáž. Tady zůstane souhrnný řádek s čísly a odkaz na ni. Odkaz
zatím povede na /doprava-a-montaz, i když stránka ještě není nasazená.

Kam se dá poctivě růst: co cena 400 000 Kč nekryje, tedy elektroinstalace a terasa,
tohle je změřená past a musí to být jasné; rozdíl bez DPH a s DPH; příplatky
z konfigurátoru a proč stojí, kolik stojí; modelové sestavy od nejlevnější po
vybavenou; co ovlivní cenu na pozemku; čím se lišíme od nabídek, kde je cena schovaná.

Nic pod NEVÍME, tedy žádné financování, splátky ani záruka. Čísla musí souhlasit
s konfigurátorem, hlídá to node .docs/poradce/test-ceny.mjs, ale ten pusť jen ke čtení,
bázi neupravuj.
```

---

## Až všech osm doběhne

Merge po jedné do main a pak **jeden** průchod na propojení, který dělá jedna session,
ne osm:

1. odkazy do patičky všech stránek a do navigace, kde to dává smysl
2. `sitemap.xml`, dnes obsahuje deset adres a `/cena` v ní už je
3. vnitřní prolinkování mezi novými stránkami, hlavně /cena ↔ /doprava-a-montaz
   a /rozkladaci-dum ↔ /celorocni-bydleni
4. povýšení opakujících se `<style>` bloků z hlav stránek do `assets/flexi.css`
5. `.docs/STRANKY.md` na aktuální stav
6. otázky na Dana z osmi zpráv sesypat do jednoho seznamu
