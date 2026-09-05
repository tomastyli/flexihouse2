# Obsahové stránky — co postavit a v jakém pořadí

Stav k 3. 9. 2026. Tenhle soubor je fronta. Stránky se stavějí **po jedné**, píše je Tomáš,
Claude k nim dělá podklad.

## Proč vůbec

Změřeno 2. 9. 2026, ne odhadnuto:

| | flexihouse.cz | beholder.cz | ab-cont (rankující strana) |
|---|---|---|---|
| slov na stránce | **433** | 943 | 934 |
| podnadpisů H2 | **4** | 7 | 27 |
| výskytů „kontejner" | 9 | 25 | 57 |

Web má **jednu** homepage se 433 slovy, která má rankovat na modulární domy, kontejnerové
domy, mobilní domy i obytný kontejner současně. Konkurence má na každý výraz vlastní stránku
o zhruba 940 slovech. Tohle je hlavní důvod, proč je web mimo první stovku na 12 ze 13
oborových výrazů.

**Autorita problém není.** flexihouse.cz má rank 100 a 27 odkazujících domén. beholder.cz má
rank 0 a rankuje. rozkladacidum.cz má **jediný** zpětný odkaz a je v Googlu první na
„rozkládací dům", protože má ten výraz v doméně i v titulku a vlastní stránku.

**Co obejít nejde:** doména je registrovaná 12. 4. 2026, tedy pět měsíců stará. Konkurence
má 2,7 roku (rozkladacidum), 5,5 roku (beholder) a 20 let (ab-cont). Rychlá výhra na
oborových výrazech neexistuje bez ohledu na to, co postavíme.

## Pravidla, která platí pro každou stránku

1. **Jeden dotaz, jedna stránka.** Ten dotaz musí být v titulku a v H1.
2. **Cíl je zhruba 900 slov a víc než 7 podnadpisů**, ne 400 slov. Osm tenkých stránek je
   horší než jedna pořádná.
3. **Nic, co je v `.docs/poradce/baze.md` pod NEVÍME.** K 9/2026 to je délka výroby,
   financování, záruka, náklady na vytápění a zateplení dekorového panelu. Web a chatový
   poradce musí říkat totéž, jinak si web protiřečí sám se sebou.
4. **Ceny bez DPH u domu a vybavení, práce na pozemku včetně DPH.** Nesčítat dohromady.
5. Vzhled a jazyk podle `_navrh-D.html` a GOAL.md, viz zamčené barvy a písma.

---

## Fronta

### 1. `/cena` — Kolik stojí modulární dům, celý ceník
**Objem:** 140/měs (modulární dům cena 70, kontejnerový dům cena 70), konkurence vysoká.
**Stav:** HOTOVO, NEPUSHNUTO. Žije na větvi `stranka/cena`, přerovnané nad `origin/main`.
Čeká výhradně na Danovo rozhodnutí o zveřejnění ceníku, ne na práci. Pozor: větev sahá
i na dalších jedenáct HTML souborů, `flexi.css`, `sitemap.xml` a `baze.md`, takže sloučení
není jednosouborové jako u ostatních stránek.
**Proč:** Konkurence ceny buď schovává úplně (levnykontejner: nula výskytů „Kč"), nebo dá
jen slovo „od". Ceník od Dana z 2. 9. dovoluje odpovědět na rovinu. Objem je malý, hodnota
je v konverzi už příchozích lidí, ne v návštěvnosti.
**Pozor:** Pravděpodobně sníží počet poptávek, protože kdo čeká 400 000, po přečtení nenapíše.
Zbylé poptávky budou lepší. Když se měří počtem poptávek, bude to vypadat jako zhoršení.

### 2. `/stavebni-povoleni` — Modulární dům bez stavebního povolení
**Stav:** ŽIVÉ od 3. 9. 2026.
**Objem:** 850/měs (stavba bez stavebního povolení 590, ohlášení stavby 260), konkurence
**NÍZKÁ** jako u jediné položky v celé frontě.
**Proč je první v hodnotě:** Největší objem, nejmenší konkurence, a je to dotaz, který si
člověk pokládá **před** nákupem. Dnes na to má web jednu větu ve FAQ.
**Z báze smíme:** záleží na velikosti a účelu, u menších staveb pro zázemí bývá režim
jednodušší, závazné vyjádření dá jedině místní stavební úřad, vyřízení povolení neděláme,
dům stojí na betonových patkách a klasické základy nepotřebuje.
**Blokuje:** nic z Danovy strany, ale **musí být právně přesná**. Nepřesná právní stránka
je horší než žádná a přitáhne poptávky, které nejdou obsloužit.

### 3. `/celorocni-bydleni` — Mobilní dům na celoroční bydlení
**Stav:** ŽIVÉ od 3. 9. 2026.
**Objem:** 590/měs, konkurence vysoká.
**Z báze smíme:** zateplení 75 mm v základu stačí na mírné klima, pro trvalé bydlení
100 mm za 30 000 Kč, topí se klimatizací s tepelným čerpadlem za 29 000 Kč, ta umí topit
i chladit, vytápění není v základní ceně, kamna už v nabídce nejsou.
**Blokuje:** náklady na vytápění za sezónu jsou pod NEVÍME. Stránka o celoročním bydlení,
která neřekne, kolik stojí topení, je nekompletní. **Zeptat se Dana dřív, než se začne psát.**

### 4. `/flexi-office` — přepsat, ne stavět nově
**Stav:** ŽIVÉ od 3. 9. 2026, přepsáno z 449 na 1186 slov.
**Objem:** 590/měs (kancelářský kontejner 480, zahradní kancelář 110).
**Co udělat:** Stránka existuje, jen se jmenuje slovem, které nikdo nehledá. Titulek už je
„Flexi Office, kancelářský kontejner", ale obsah má 446 slov. Dopsat na 900 a přidat sekci
zahradní kancelář, studio, showroom.
**Poměr přínos ku práci je tu nejlepší z celé fronty**, protože se nic nezakládá.
**Blokuje:** ve schématu je dnes „EPS panely 50 mm", v bázi je u domu 75 mm. Ověřit u Dana,
která hodnota platí pro Office, než se to napíše do technické tabulky.

### 5. `/rozkladaci-dum` — Rozkládací dům, co se složí za půl dne
**Objem:** 90/měs, konkurence vysoká.
**Proč i při malém objemu:** Jediné místo, kde už web v Googlu vidět je (**28. pozice**,
změřeno 2. 9.). Dnes na to rankuje homepage. Vlastní stránka je nejkratší cesta na první
stranu. Jednička je `rozkladacidum.cz`, tedy doména přesně na ten výraz, ale má jediný
zpětný odkaz, takže se dá dohnat obsahem.
**Z báze smíme:** rozměry rozloženo 6,32 × 5,90 m, složeno 2,20 × 5,90 m, výška 2,48 m,
zhruba 30 m², hmotnost kolem 2 000 kg, rozložení čtyři lidé za půl dne.

### 6. `/glamping` — Glamping domky pro kempy a penziony
**Objem:** 390/měs, konkurence vysoká.
**Proč:** Není to nový produkt, je to nový typ zákazníka na stejný produkt. Fotku glampingu
už máme. Nižší priorita, protože je to jiná cílovka a chce vlastní argumentaci.

### 7. `/jak-to-probiha` — Od poptávky po usazení
**Objem:** značkový a dlouhý ocas, ne samostatný dotaz.
**Proč:** Není to SEO stránka, je to stránka pro člověka, který už zvažuje. Modulstav má
`/postup-realizace`, vy nemáte nic. Nepotřebuje fotky, stačí pravdivý popis procesu.
**Blokuje:** kolik týdnů trvá výroba, je pod NEVÍME. Bez toho je to popis procesu bez časů.

### 8. `/doprava-a-montaz` — Doprava, patky a montáž
**Stav:** DOPORUČENO ŠKRTNOUT. Hotový ceník téma pokrývá v sekci „Co k tomu
přibude na pozemku“: doprava 8×, montáž 10×, patky 5×, včetně jeřábu a sazby
za kilometr. Samostatná stránka by byla tenká kopie.
**Objem:** dlouhý ocas.
**Z báze smíme:** doprava 20 000 Kč plus 100 Kč/km z výroby, patky 50 000 až 90 000 Kč
podle podloží, montáž 30 000 až 80 000 Kč podle náročnosti, potřeba rovná plocha a příjezd
pro nákladní auto s jeřábem, přípojky vody, elektřiny a odpadu si zajišťuje zákazník.
**Poznámka:** Dá se odštěpit z `/cena`. Když bude ceník dost obsáhlý, tuhle přeskočit.

---

## Rozhodnutí 5. 9. 2026

- **Kratší verze ze šablony vyhrávají.** Tomáš rozhodl nechat stránky v délce, jakou má
  produktová šablona (`/flexi-office` 502 slov, `/rozkladaci-dum` 608), místo vracení
  1179slovné verze. Cíl „zhruba 900 slov" výš v tomhle souboru pro produktové stránky
  neplatí. Nevracet obsah zpátky.
- `/katalog` přestavěn: tři modely ve stejném rámu (fotka 16:10, řádky Cena / Velikost /
  Dodání u všech tří) a pod tím srovnávací tabulka. Cik-cak řádky a výřez v tmavém boxu pryč.
- Nové stránky glamping, jak-to-probiha a doprava-a-montaz propojené do patičky a sitemapy,
  patička sjednocená na všech stránkách, ceník dostal JSON-LD.
- Všechno žije na větvi `integrace/stranky`. Větve `stranka/cena` a `stranka/flexi-house`
  jsou tím překonané.

- Větev `stranka/cena` (1 024 slov, `cn-*`) a worktree `fh-cena` **smazány 5. 9. 2026** na Tomášův
  pokyn. Žije jen krátká `/cena` ze šablony. Zálohová větev `zaloha-main-cenik` zůstává.
- `flexi-family.html` a `mini-house.html` smazány, staré adresy vede 301 v `_redirects`.

## Co do fronty nepatří a proč

- **Tiny house** (320/měs). Ten produkt neděláte.
- **Dotace a Nová zelená úsporám.** Dům za 400 000 v hrubé stavbě podmínky nesplní.
  Přitáhlo by to poptávky, které nejdou obsloužit.
- **Samostatné stránky na technické dotazy** typu „modulární dům zateplení" nebo
  „kontejnerový dům rozměry". Změřená nula hledání. Patří jako sekce do existujících stránek.
- **Cizojazyčné mutace.** Dodáváte po ČR.
- **Blog.** Ani modulstav, ani q-construct ho nemají a rankují. Až po bodech 1 až 6.
- **Rozsekat produkt na desítky podstránek** jako levnykontejner (44 českých stránek).
  Máte dva produkty a konfigurátor. Umělé dělení vyrobí tenké skoro shodné stránky.

## Otevřené otázky na Dana

Zodpovězeno 5. 9. 2026 večer: cena 405 000 platí, ceník zůstává, technické údaje z PDF
výrobce platí, Office 70 000 a 10 kusů (web říká „skladem“, Tomášovo rozhodnutí 6. 9.), adresa Sokolovská 612, glamping = domky na
míru. Dál otevřené jsou jen body níže (výroba v týdnech, topení, zateplení Office, financování, záruka).

Blokují body 3, 4 a 7.

1. Kolik týdnů trvá výroba rozkládacího domu od objednávky po usazení. (Na Google profilu
   stálo „do 3 týdnů", Tomáš 2. 9. potvrdil, že to neplatí, a z profilu je to pryč.)
2. Náklady na vytápění za sezónu.
3. Zateplení Flexi Office: 50 nebo 75 mm.
4. Financování a splátky.
5. Záruka, délka a rozsah.
