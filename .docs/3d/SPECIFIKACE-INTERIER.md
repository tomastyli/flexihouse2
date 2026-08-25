# Specifikace 3D interiéru Flexi House

Podklad pro `assets/flexi-3d.js`. Vzniklo syntézou šesti zónových rozborů a jejich skeptických verdiktů. Čísla, která ověřovatel vyvrátil, jsou zde nahrazená jeho opravou. Nejistá čísla jsou označená a v závěru je seznam toho, co má Tomáš doměřit metrem.

---

## 1. Souřadnicový systém a hrubá skořepina

**Počátek** uprostřed půdorysu, **x** doprava (šířka), **y** nahoru, **z** dopředu k průčelí. **y = 0 je hotová podlaha interiéru**, ne spodek boxu a ne terén.

Vztah k exteriérovému modelu: `podlaha = spodek boxu + 0,110` (odvozeno; spodní ocelový rám má podle IMG_2282 při kotvě 2337 výšku 0,108). Tedy `y_svět = LIFT + 0,110 + y_interiér`.

### Obálka

| prvek | x | z |
|---|---|---|
| levý modul | -3,138 … -1,125 | -2,700 … +2,700 |
| střední modul | -1,125 … +1,125 | -2,925 … +2,925 |
| pravý modul | +1,125 … +3,138 | -2,700 … +2,700 |

Předsazení středního modulu je **225 mm** na každou stranu (kóta výkresu). Pixelový odečet dává 190 mm, to je chyba kresby, nepoužívat.

Tloušťka všech stěn a příček je **0,076 m** (změřeno na půdorysu čtyřikrát nezávisle: 12 px při 6,35 mm/px). Vnitřní líce tedy:

- západ x = -3,062, východ x = +3,062
- zadní stěna křídel z = -2,630, přední z = +2,630
- zadní stěna středního modulu z = -2,849, přední z = +2,849

### Světlá výška

| místo | hodnota | jistota |
|---|---|---|
| křídla (obývák, obě ložnice) | **2,20** (rozsah 2,17 až 2,24) | zmereno, ale viz nejistota N1 |
| střední modul (chodba, koupelna) | **2,30** (rozsah 2,20 až 2,35) | odvozeno, nejisté |

Číslo 2,267 z prvního kola je vyvrácené: druhá „nezávislá" cesta ztotožnila viditelnou plochu mezi zkosenými rohovými sloupky s čistou šířkou místnosti, čímž nadsadila měřítko o 3 až 4 %. Praktické pravidlo: **světlá výška křídla = výška boxu 2,337 minus spodní rám 0,11**, strop je prakticky v úrovni horní hrany boxu.

Rozdíl mezi křídly a středním modulem stojí na třech nezávislých indiciích: výkres kótuje střední modul 2337 a boční 2134; poměr panelů 2207 ku 2083 (1,060) se potvrdil i na fotkách (IMG_2285 vs IMG_2282, poměr 1,063); a vstupní dveře D1 jsou 2190 vysoké, což se do 2,20 m nevejde. **Proti tomu stojí** změřená výška koupelny 2,19, která rozdíl nepotvrzuje. Modeluj tedy krok 0,10 m v modulové spáře, ale připrav se, že ho metr smázne.

Krok stropu je pohledově zakrytý černým průvlakem v modulové spáře, takže i kdyby byl nakonec nulový, geometrie se nerozbije.

---

## 2. Materiály

Všechna albeda jsou **odhad**, ne měření. Fotky mají chladné denní světlo a přepálená okna, interiér je proti nim podexponovaný. Bílá se korigovala přes bílé kryty vypínačů, porcelán WC a chromový lem vaničky, což jsou improvizované reference. Poměry mezi materiály jsou spolehlivější než absolutní hodnoty.

| materiál | barva sRGB | rough | metal | poznámka k textuře |
|---|---|---|---|---|
| `stena_panel` | #D6D6D3 neutrální světle šedá | 0,40 | 0,0 | svislé tupé švy po **1,00 m**, tmavá linka 2 mm, hloubka pod 1 mm (kreslit v textuře, ne geometrií); jemná nízkofrekvenční normálová mapa (zvlnění plechu, oil canning), jinak jsou stěny mrtvé |
| `strop_hladky` | #E4E4E1 | 0,35 | 0,0 | křídla; tupé švy napříč modulem po ~1,1 m (odhad, nezměřeno) |
| `strop_lamela` | #E6E4DE | 0,28 | 0,0 | střední modul; žebra **0,10 m** (nejisté, 0,09 až 0,13), V drážka ~3 mm, uvnitř lamely jemné podélné rýhování |
| `podlaha_dub` | #C8A87E až #DAB692 | 0,45 | 0,0 | rustikální dub, velké suky a dlouhé letokruhy; prkno 0,19 široké (nejisté, 0,16 až 0,19), délka 1,2 až 1,3 |
| `ocel_cerna` | #262625 | 0,55 | 0,15 | prášková barva, žádné ostré odlesky, jen slabý široký lesk na hranách |
| `mramor_panel` | podklad #F0F0EE, žíly #B4B9BE až #8E959C | 0,18 | 0,0 | Calacatta, **řídká** kresba, velké části panelu čistě bílé; žíly 5 až 30 mm, shluky po 0,5 až 0,8 m, diagonálně 30 až 45° |
| `linka_bila` | #EBE8E0 mírně teplá bílá | 0,60 | 0,0 | matné lamino |
| `deska_kuchyn` | základ #B8BAB1, zrna #999A92 (o 17 % tmavší) | 0,35 | 0,0 | zrno 0,5 až 0,7 mm, hustota 13 až 21 na cm², pokrytí 7,5 % plochy; kanál G je nejvyšší, odstín táhne do zelenošedé, ne do béžové |
| `nerez` | kartáčovaný | 0,30 | 1,0 | dřez, žlab, prahové lišty |
| `chrom` | lesklý | 0,08 | 1,0 | baterie, sprchová tyč |
| `porcelan` | #FAFAF8 | 0,05 | 0,0 | WC, umyvadlo |
| `sklo_matne` | #C4C6C2 | 0,25 | 0,0 | satinované, difuzní, vysoce propustné |
| `dvere_antracit` | #474746 | 0,55 | 0,0 | neutrální, **bez modrého nádechu** (katalogová RAL 7016 je modrošedá, tohle ne); jemná svislá kresba, rozteč 2 až 5 mm, stačí normálová mapa |
| `plast_bily` | #F2F1EC | 0,60 | 0,0 | vypínače, zásuvky, ventilátor, svítidla |
| `vanicka` | #C9BEAC teplá béžová | 0,35 | 0,0 | asi o 10 % tmavší než mramor stěny, ne o 23 % |

Textury interiéru se nedají brát z fasády. Cedrová kresba, rozteč 0,220 m ani měřítko fasádního plechu sem nepatří.

---

## 3. Stěny a příčky

Všechny tloušťky 0,076. Všechny jdou od podlahy ke stropu.

| příčka | rovina | rozsah | povrch |
|---|---|---|---|
| západní stěna koupelny | x = -0,782 … -0,706 | z -2,849 … -0,589 | z obýváku šedý panel, z koupelny mramor |
| hlavní příčka (chodba a obývák vs. ložnice) | x = +0,706 … +0,782 | z -2,849 … +2,849, přes celou hloubku bez přerušení | šedý panel z obou stran |
| jižní stěna koupelny | z = -0,589 … -0,513 | x -0,706 … +0,706 | z koupelny mramor, z chodby šedý panel |
| příčka mezi ložnicemi | z = +0,518 … +0,591 | x +0,782 … +3,062 | šedý panel |

Dispozice je v ose x symetrická: obě hlavní příčky mají osu 0,744 od středu domu, tedy 2,394 od vnějšího líce.

**Východní stěna koupelny JE hlavní příčka.** Koupelna není samostatná krabice uprostřed modulu.

**Modulová spára mezi středním modulem a křídlem NENÍ stěna.** Na půdorysu v x = ±1,125 není nakreslená žádná svislá čára, prostor je v rozloženém stavu spojitý. Spára se projeví jen černým průvlakem ve stropě.

### Čisté rozměry místností

| místnost | x | z | plocha |
|---|---|---|---|
| obývák s kuchyní, zadní část | -3,062 … -0,782 | -2,630 … -0,589 | 2,280 × 2,041 |
| tentýž prostor, přední část (včetně chodby) | -3,062 … +0,706 | -0,513 … +2,630 | 3,768 × 3,143 |
| chodba před vstupem | -1,125 … +1,125 | +2,630 … +2,849 | výběžek středního modulu |
| koupelna | -0,706 … +0,706 | -2,849 … -0,589 | 1,412 × 2,260 |
| ložnice zadní | +0,782 … +3,062 | -2,630 … +0,518 | 2,280 × 3,148 |
| ložnice přední | +0,782 … +3,062 | +0,591 … +2,630 | 2,280 × 2,039 |

### Černá ocelová konstrukce uvnitř

Je jen v křídlových modulech. **V chodbě a v koupelně černý pás pod stropem není**, panel tam dobíhá přímo k lamelovému podhledu a spára je zatmelená bílým tmelem. Lehké příčky černý pás nemají nikde.

| prvek | umístění | rozměr |
|---|---|---|
| obvodový pás pod stropem | po obvodu obývacího prostoru a obou ložnic, na styku každé **vnější** stěny se stropem | viditelná výška **0,090** (změřeno dvakrát nezávisle: 85 a 89 mm), v líci stěny, ne vystouplý trám |
| rohové sloupky | ve všech rozích křídel, od podlahy k pásu | viditelná plocha **0,10** (nejisté, hodnota z fotky neurčitelná, roh je zkosený pod 45° a sloupek se jeví jako šikmá deska mezi dvěma panely); v napojení na vodorovný pás trojúhelníkový nákližek |
| průvlak v modulové spáře | dvě podélné linie ve stropě, x = **-1,125** a **+1,125**, po celé hloubce domu | viditelná šířka 0,10 až 0,15, pokles pod strop křídla 0,10 až 0,15 (odhad) |

Průvlak je 0,375 m od hlavní příčky (dovnitř ložnic) a 0,381 m od západní stěny koupelny (dovnitř obýváku). Původní čísla 0,353 a 0,341 jsou o 6 až 11 % malá.

---

## 4. Podlaha a strop

### Podlaha

Jednotný dubový laminát (na fotce krabice EGGER FLOORING) v **celém domě včetně koupelny**, jedna rovina bez prahů, jen kovová přechodová lišta v otvorech D2 a D3. V koupelně končí až u sprchové vaničky.

Směr kladení, ověřený na čtyřech fotkách a přeložený úběžníkem:

- obývák, kuchyň, chodba, koupelna: prkna **podél hloubky domu** (osa z)
- obě ložnice: prkna **napříč, rovnoběžně s čelní stěnou** (osa x)

U paty stěn **není sokl ani lišta**, jen tmavá stínová spára **0,015** vysoká.

### Strop

- křídla: hladký bílý panel, saténový, velké měkké odlesky
- střední modul (chodba i koupelna): bílý lamelový podhled, **žebra běží napříč šířkou domu**, tedy každá lamela přemostí 2,25 m středního modulu a spáry se opakují po ose z

Směr žeber je ověřený trojím způsobem: na IMG_2325 nemají žebra a černý průvlak společný úběžník (sklony +0,49 a -0,15), na IMG_2343 a IMG_2348 kříží spáry západní stěnu z opačných směrů pohledu.

Strop má dvě úrovně dělení: hlubší V drážka na spáře panelů a mělčí linka uprostřed každého panelu (nejlíp na IMG_2349). Jedno číslo to nepopíše.

---

## 5. Dveře

**Rozměry D1, D2 a D3 jsou z výkresové tabulky a NEJSOU ověřené z fotky.** Tatáž tabulka u W1 i W2 prokazatelně neplatí, takže i tady je to jen nejlepší dostupný vstup.

### D1, vstupní

Přední stěna středního modulu, na střed, otvor **1,500 × 2,190**, x od -0,750 do +0,750, rovina z = +2,849.

Dvě křídla po 0,75, každé s **jednou velkou tabulí**, žádné příčle a žádná mříž. Černý hliníkový rám, obvodový profil křídla 0,07. Obě křídla se otevírají **ven na terasu**, aktivní je levé při pohledu zevnitř, pant na levé zárubni. Klika černá páčková, osa asi 1,00 až 1,05 nad podlahou. Pod otvorem nízká černá hliníková prahová lišta, šířka asi 0,05, převýšení 0,01 až 0,02 (odhad, plocha je vodorovná a viděná pod velmi malým úhlem).

Co na IMG_2342 vypadá jako prosklené křídlo s černou mříží, je **odraz**: silueta fotografa, žebrovaný strop chodby a rám D1. Mříž nemodelovat.

### D2, do ložnic (2 ks)

V hlavní příčce, rovina x = ±0,744, otvor **0,800 × 2,050**.

- ložnice zadní: otvor z = -0,465 … +0,336, pant na straně z = +0,336
- ložnice přední: otvor z = +0,665 … +1,466, pant na straně z = +0,665

Obě se otevírají **dovnitř ložnice**, panty jsou u společné příčky mezi ložnicemi.

Křídlo antracitové, **v ploše hladké**. Vylisovaná drážka po obvodu z prvního kola je vyvrácená: co po obvodu obíhá, je polodrážka (doraz) v obložkové zárubni plus stínová spára, křídlo je za doraz zapuštěné.

Zárubeň plochá obložková, ve stejném antracitu jako křídlo, viditelná lícová část **0,10** na obou stranách stěny, žádná ocelová rohová zárubeň a žádná světlá obložka.

Kování: černá hranatá páčka na úzkém obdélníkovém **štítku** (ne rozetě) asi 0,043 × 0,21, pod pákou cylindrická vložka. Osa kliky **0,97 nad podlahou, nejisté** (dvě měření dala 969 a 986 mm, obě odvozená z výšky dveří, která sama ověřená není).

### D3, do koupelny

V jižní stěně koupelny, rovina z = -0,551. Otvor je **přisazený k východní stěně**, tedy k hlavní příčce: x od **-0,094 do +0,706**. Na západě zbývá pilíř 0,612 široký. Původní údaj 0,51 až 1,25 od západní stěny je vyvrácený, nechával by 0,19 m zdi na východě a ta tam není (ověřeno na půdorysu i na IMG_2342 a IMG_2348).

Celoprosklené křídlo v černém hliníkovém rámu, jedna tabule, **sklo čiré**. Matné sklo v koupelně patří posuvné zástěně sprchy, ne D3. Tři válcové panty na **východní** zárubni, otevírá se **ven do chodby**. Černá páčková klika bez vložky. Černý portál viditelný 0,09 na obou lících, opticky výrazně černější než antracitová obložka D2 vedle.

Výkres kreslí kování D3 zrcadlově. Fotky jsou ze dvou opačných stran a shodují se, věř jim.

---

## 6. Okna zevnitř

### W1, 8 ks

Rozměr: model kreslí **1,120 × 1,100 podle výkresu**. Fotografovaná jednotka má okna zhruba **1,05 × 1,04** (měřeno zvenku ze dvou fotek při kotvě 2337: 1046 × 1038 a 997 × 945). Rozdíl 6 % se v konfigurátoru nepozná, ale ať se ví. Hodnota 0,96 × 0,96 z jednoho kola vychází z jiného rozkladu výšky boxu a je nekonzistentní se zbytkem řetězu.

**Parapet 0,88 nad podlahou** (rozsah 0,83 až 0,92). Nadpraží pak 1,98, tedy 0,22 pod stropem křídla. Kontrola: nad okny je na fotkách jen úzký pruh, změřený dvakrát nezávisle na 0,25 až 0,27 od nadpraží ke stropu, z toho černý pás 0,09.

Pozor, tohle je **v rozporu s výkresem i s dnešním exteriérovým modelem**, které dávají parapet 0,80 nad spodkem boxu, tedy asi 0,69 nad podlahou. Rozdíl 0,19 m je vidět. Výkres si navíc protiřečí sám: zadní pohled kreslí parapet 760 mm nad spodkem křídlového modulu, boční pohled 550 mm.

Polohy (přeměřeno na 600 dpi rasteru, měřítko ověřené na kótách):

| stěna | rovina | okna |
|---|---|---|
| západní bočnice | x = -3,138 | z -1,855 … -0,735 a z +0,733 … +1,853 |
| východní bočnice | x = +3,138 | tytéž z |
| zadní stěna levého modulu | z = -2,700 | x -2,692 … -1,572 |
| přední stěna levého modulu | z = +2,700 | x -2,692 … -1,572 |
| zadní stěna pravého modulu | z = -2,700 | x +1,572 … +2,692 |
| přední stěna pravého modulu | z = +2,700 | x +1,572 … +2,692 |

Na bočnicích je okno **0,845 od každého vnějšího rohu a 1,468 mezi otvory**. Údaj 1,43 m od každého rohu ve STAV-3D je špatně, to je mezera mezi okny, ne odstup od rohu. Hodnota 1,39 vznikla měřením vnějších dekorativních obdélníků, ne otvorů.

Na čelních stěnách bočních modulů je okno **vystředěné na modul**, 0,44 od obou hran, ne 0,38 a 0,45.

Postavená jednotka tomu na bočnici neodpovídá (asi 0,96 od terasového rohu, 1,95 mezi okny, 0,51 k druhému rohu), což odpovídá nestejně hlubokým ložnicím. Model kreslí výkres.

**Rozdělení po místnostech:** obývák s kuchyní 4 ks (2 na západní bočnici, 1 na zadní stěně nad linkou, 1 na přední stěně), zadní ložnice 2 ks (zadní stěna + bočnice), přední ložnice 2 ks (bočnice + přední stěna), koupelna W2, chodba bez okna.

**Provedení zevnitř:** rám lícuje s vnitřním povrchem stěny, žádná parapetní deska, žádná obložka, panel jde přímo na rám a spoj je jen tenká bílá tmelová linka. Viditelný černý pás **0,10 po stranách a 0,08 nahoře i dole** (boční pásy jsou širší, protože se k rámu přidává stojka křídla). Členění profilu: plochý rám asi 0,04, stínová spára, stojka křídla asi 0,04.

Dvě **posuvná** křídla vedle sebe, střední setkávací stojka 0,05. Typ potvrzený třikrát: na výkresu mají všechna W1 vodorovnou šipku posuvu, na IMG_2339 je jedno křídlo odsunuté, na IMG_2285 je zvenku vidět otevřenou třetinou dovnitř.

Klička černá páčka na střední stojce, na pravém křídle, ve svislém středu okna, tedy asi **1,31 nad podlahou**.

Na vnější koleji **posuvná síť proti hmyzu** v černém rámu, kryje vždy jednu polovinu okna.

Sklo je zapuštěné asi 0,03 za lícem stěny (odhad, z fotek se to spočítat nedá).

**Žaluzie, rolety ani roletový box nikde nejsou.** Co na některých fotkách vypadá jako box nad oknem, je černý průvlak v modulové spáře a za ním lamelový podhled středního modulu.

### W2, koupelna

Zadní stěna středního modulu, rovina z = -2,925, **vodorovně vystředěné na dům i na koupelnu**, střed x = 0,00 (rozptyl ±0,05).

Rozměr: **0,56 × 0,56** (prakticky čtverec). Tabulka výkresu uvádí 700 × 400 a výkres je v tom vnitřně konzistentní (vnější obdélník měří přesně 700 × 400), ale postavené okno je jiné. Tři nezávislá měření: 0,571 × 0,571, 0,539 × 0,560 a 0,55 × 0,59. **Doporučuji exteriérový model přepsat na čtverec**, STAV-3D ten rozpor stejně už zaznamenal.

Parapet **1,31**, nadpraží **1,88** nad podlahou (nejisté, řetěz visí na rozměru okna). Rám černý hliníkový, viditelný pás 0,11. Křídlo **výklopné**, horní závěs, spodek se vyklápí ven, klička dole uprostřed. Sklo čiré.

---

## 7. Kuchyň

Tvar L v severozápadním rohu obývacího prostoru. Přeměřeno na vlastním renderu výkresu, kóta 1667 sedí na 788 px přesně.

### Půdorys

| část | x | z |
|---|---|---|
| rameno A (podél zadní stěny) | -3,062 … -1,370 | -2,630 … -2,030 |
| rameno B (podél západního líce koupelnové příčky) | -1,370 … -0,782 | -2,630 … -1,430 |

Celkový dosah od západní stěny **2,29 m**. Výkres kreslí levý konec linky 36 mm od stěny (proto součet kót 1667 + 600 = 2267), v modelu je rozumné táhnout ji natěsno, tedy rameno A dlouhé **1,69 až 1,70**.

Modulová spára x = -1,125 leží uvnitř ramene B, linka ji přesahuje o 0,34 m. Žádná stěna tam není.

### Výšky

Tohle je **největší nejistota kuchyně** a je provázaná s parapetem oken. Změřený vztah: horní plocha desky je **0,15 až 0,17 m pod spodní hranou okenního rámu** (dvakrát nezávisle v rovině stěny na IMG_2326). Při parapetu 0,88 z toho vychází deska **0,72**.

Proti tomu stojí poměry v rovině čel, změřené shodně dvěma lidmi: sokl : čelo : deska = 0,21 : 1 : 0,067. Kdo dosadí evropské čelo 720, dostane 0,15 + 0,72 + 0,048 = **0,92**. Jenže deska 0,92 by při parapetu 0,88 seděla nad spodní hranou okna a zadní lišta by okno překryla, což fotky vylučují, na všech je nad lištou pruh holé stěny.

**Doporučená hodnota pro model: horní plocha desky 0,75 m**, rozklad sokl 0,125 + čelo 0,585 + deska 0,040 (poměry zachované). Když metr ukáže 0,90, vynásob všechny tři složky 1,20. Fotografovaná jednotka je v tomhle nižší než evropský standard, což zapadá do stejného vzorce jako nižší okna a nižší světlá výška.

Číslo 0,038 pro tloušťku desky je vyvrácené, měřený poměr deska/čelo je 0,067; 0,028 je vyloučené na obou fotkách.

Zadní lišta (upstand) výška **0,060**, tloušťka asi 0,02, obíhá roh mezi rameny A a B. Že má stejný dekor jako deska, potvrzené není, na detailu je hladká.

Přesah desky přes čela 0,02 a zapuštění soklu 0,05 jsou běžné hodnoty, ne měření. Zapuštění čela pod desku je změřené na 0,010 až 0,013.

### Členění čel ramene A (od západní stěny)

Původní 0,393 / 0,386 / 0,555 / 0,333 je **vyvrácené**. Kotva ležela v jiné hloubkové rovině (jižní bok ramene B je o 600 mm blíž k fotoaparátu), což zkosilo celou projektivní transformaci.

Správně: **skříňka 800 (dvě dvířka po 0,397) + zásuvková skříňka 600 (čelo 0,597) + skříňka 300 (dvířka 0,297)**, součet 1,700. Poměr zásuvkový blok ku dvířkům vyšel na dvou fotkách 1,45 až 1,51, standard 597/397 = 1,511.

Zásuvková skříňka má **tři stejná čela po 0,24**, ne 0,23 / 0,23 / 0,26. Původní měření si spletlo černá madla se spárami (kontrast 42 / 33 / 30 u madel proti 4,7 a 2,3 u skutečných spár).

Rameno B: dvoje dvířka po 0,30 na exponované délce 0,600, madla svisle po obou stranách společné spáry. Na jižním konci hladký bílý bok 0,600 bez spár a bez kování.

### Madla

Černá matná obloučková, délka **0,19**, odsazení od čela 0,03, průměr tyčky 0,012, rozteč patrně 160 mm. Na dvířkách svisle po stranách společné spáry, horní konec asi 0,07 pod horní hranou čela. Na zásuvkách vodorovně, na střed bloku, tedy osa x asi -3,062 + 1,093 = **-1,969**.

### Dřez a baterie

Nerez **SUS 304** (označení je vyražené do zadního pultu, IMG_2354), jednodřez zapuštěný shora, plochý lem 0,015 až 0,020 leží na desce. V rameni B, střed asi z = -1,745, tedy na střed hloubky 0,600 a při jižním konci ramene B.

Rozměry jsou nejisté: výkresový symbol měří 444 × 461 vnějšek a 353 × 402 vana, tedy skoro čtverec, kdežto fotky ukazují vanu zřetelně podélnou. Pro model 0,48 × 0,42, vana 0,40 × 0,34, hloubka 0,20. Poměr stran je nevyřešený rozpor.

Zadní pult šířky asi 0,10 s otvorem pro baterii a **dvěma kruhovými nerezovými krytkami** po stranách. Odtok kreslit **na střed vany**, ne vzadu.

Baterie chromová stojánková páková, vysoký obloukový výtok zakončený válcovým perlátorovým nákružkem, boční plochá páka vpředu, **bez vytahovací sprchy** (žádná objímka hadice, žádná rukojeť). Základna průměr 0,05, výška nad deskou asi 0,38, vyložení 0,20.

### Co v kuchyni NENÍ

- **varná deska.** Na místě, kam ji výkres kreslí (0,21 až 0,97 od západní stěny, 0,117 od zadní), je deska linky celistvá, bez výřezu, bez lemu a bez hořáků. Ověřeno na třech fotkách. Rozhodnout s klientem, jestli ji model má kreslit.
- **horní skříňky a digestoř.** Nad linkou je holá stěna až po černý pás pod stropem, žádné kotvení, žádný odtah.
- **obklad.** Za linkou je tentýž světle šedý sendvičový panel jako všude jinde, včetně svislých švů po 1,00 m.

---

## 8. Koupelna

Světlost 1,412 × 2,260, výška 2,30 (viz kapitola 1). Všechny čtyři stěny od podlahy ke stropu **mramorový panel**, strop lamelový podhled jako v chodbě, podlaha dubový laminát. Sokl žádný, panel jde přímo na laminát, v patě je jen silikonová spára.

Svislé spáry obkladu **nekreslit**. Vodorovná spára není nikde (deska jde na plnou výšku, formát 1220 × 2440 nastojato tomu odpovídá), ale svislá rozteč 1,22 m stojí na jediné nejisté detekci a na velkém výřezu západní stěny není vidět ani jedna spára. Radši žádné než špatné.

### Sprchový kout

Zadní pás místnosti přes celou šířku, **hloubka 0,65** (rozsah 0,62 až 0,70), tedy z od -2,849 do -2,199.

Tvrzení, že sprcha na výkresu vůbec není, je vyvrácené. Výkres kreslí nástěnný držák hlavice na západní stěně (0,20 od stěny, 0,25 od zadní stěny) i šrafovanou podlahovou vpust (0,49 / 0,13). Chybí jen obrys vaničky a zástěny. Symbol WC začíná 0,652 od zadní stěny, takže zástěna se za 0,65 nedostane.

| prvek | umístění | rozměr | materiál |
|---|---|---|---|
| vanička | celá šířka, z -2,849 … -2,199 | výška 0,06 nad podlahou; po **celém obvodu** vyvýšený leštěný kovový rám (ne jen vzadu) | litý kámen béžový; protiskluzové drážky kolmo na zadní stěnu, **rozteč 0,085**, tedy 16 až 18 pruhů na šířku (ne 22 až 24) |
| lineární žlab | v plochém lemu u paty **zadní** stěny, začíná v rohu se západní stěnou, běží na východ | 0,25 × 0,06 (délka nejistá, 0,20 až 0,30) | nerez, příčné štěrbiny |
| práh vaničky | přední hrana z = -2,199, celá šířka | 0,06 × 0,04 | nerez, v něm spodní kolejnice zástěny |
| zástěna | rovina z = -2,199, od vaničky ke stropu, horní kolejnice těsně pod stropem bez mezery | dvě křídla po 0,72 (nejisté), profily 0,04 až 0,05 | černý hliník satén; **matné je prokazatelně jen jedno křídlo**, druhé je na fotce průhledné |
| madla | na svislých hranách křídel, střed 1,30 nad vaničkou | 0,25 dlouhé | černý hliník |
| sprchová tyč s hlavicí | západní stěna, u stěny, z asi **-2,45** (pásmo 0,25 až 0,45 od zadní stěny, fotka a výkres se neshodují) | tyč od 1,05 do 1,95 nad vaničkou; hlavice průměr 0,21 (typový odhad), střed 2,05, vyložení 0,20 | chrom, hlavice bílý plast s chromovým lemem |
| nástěnná baterie | tatáž svislice, 1,05 nad vaničkou | 0,18 × 0,07 × 0,09 | chrom |
| mýdlenka | na tyči, 1,12 nad vaničkou | 0,28 × 0,09, dvě přihrádky | bílý plast |
| ruční sprcha | v jezdci, 1,51 nad vaničkou | hlavička 0,075 | chrom |

Výšky prvků na tyči jsou dopočítané z předpokladu, že baterie je ve standardních 1,05. Je to kruh, ne měření.

### Zařizovací předměty

**WC kombi**, zády k západní stěně (x = -0,706), obrys z od **-2,197 do -1,680**, vysunutí 0,72 od stěny. Mísa směřuje na východ, nádržka u stěny, na víku obdélníkové chromové dvojtlačítko. Reálné rozměry běžného kusu asi 0,37 × 0,68 × 0,78, obruba 0,41. Symbol na výkresu je schematicky nadměrný (0,52 × 0,72), to jsou kreslené, ne skutečné rozměry.

**Skříňka s umyvadlem**, u západní stěny, hloubka 0,50 (x -0,706 … -0,206), délka podél stěny **0,80** (z -1,389 … -0,589). Obě kóty jsou na výkresu a přeměřené na milimetry (59 px = 500, 95 px = 806). Jižní čelo lícuje s vnitřním lícem jižní stěny. Horní hrana desky **0,82 (předpoklad, ne měření)**.

Bílá lakovaná skříňka, dvoje dvířka s vloženou rámečkovou výplní, dvě krátká černá tyčová úchytka u sebe uprostřed. Jednodílná keramická deska s **obdélníkovou** integrovanou mísou (výkres kreslí ovál, kreslit fotku), mísa na severní polovině, rovná odkládací plocha na jižní. Chromová páková baterie s vysokým obloukovým výtokem u zadní hrany desky na **jižním** konci. Pod umyvadlem chromový sifon.

**Nástěnná skříňka se zrcadlem**, západní stěna nad umyvadlem, spodní hrana asi 1,40, horní 2,10, hloubka 0,17, délka 0,55. Zrcadlová dvířka na **jižní** polovině, tři otevřené přihrádky (dvě police) na severní, nahoře profilovaná římsa. Rozvržení potvrzené ze dvou protilehlých pohledů, rozměry jsou poměrové odhady s chybou klidně 15 %.

**Samostatné zrcadlo nad umyvadlem není.** Jediná reflexní plocha v koupelně jsou dvířka téhle skříňky.

### Drobnosti na západní stěně

- dva chromové prostupy průměru asi 0,035, rozteč 0,11, výška asi 1,48, nad WC (existence potvrzená, rozměry dopočítané)
- bílá čtvercová záslepka asi 0,08 s kulatým otvorem, výška asi 1,93, u zástěny (existence potvrzená, rozměr odhad)

### Podlahové vpusti

Ve výkresu jsou v koupelně **dvě**. Ve sprše (0,49 / 0,13 od západní a zadní stěny) je ale ve skutečnosti lineární žlab, kulatou vpust tam nekreslit. Druhá je v laminátu, čtvercová nerezová deska asi 0,11 × 0,11 s kulatým paprsčitým roštem, **přilepená k severnímu čelu skříňky umyvadla u jejího vnějšího okraje**, tedy zhruba x = -0,35, z = -1,42. Výkres ji klade na 0,74 / 1,81, což fotka nepotvrzuje.

### Větrací ventilátor

Zadní stěna, **východně od okna W2**, bílý čtvercový rámeček **0,19 × 0,19** s kulatou žaluziovou mřížkou průměru 0,17. Střed asi x = **+0,50**, mezera od hrany okna 0,12. Výška středu 1,95 až 2,14, nejisté.

Na výkresu elektro **není vůbec** (ověřeno rozdílovým obrazem obou listů i prohlídkou celého půdorysu). Zvenku má protějšek: kulatou bílou růžici průměru 0,17 na zadní stěně středního modulu, kterou exteriérový model už kreslí. **Musí sedět na stejné souřadnici**, jinak bude mít dům dva různé otvory.

---

## 9. Elektro

Polohy jsou z výkresu elektro, přeměřené vlastní šablonovou korelací. Přesnost odečtu je zhruba ±30 mm, zaokrouhli na centimetry a nedolaďuj na milimetry.

Legenda sedí kus po kuse: 1 rozvaděč, 9 zásuvek, 1 chránič bojleru, 3 zásuvky klimatizace, 5 vypínačů, 6 stropních svítidel, 1 downlight.

### Svítidla

| co | x | z | strop |
|---|---|---|---|
| stropní, obývák u kuchyně | -2,123 | -1,317 | hladký |
| stropní, obývák vlevo vpředu | -1,775 | +1,198 | hladký |
| stropní, nad vstupní halou | -0,232 | +1,198 | **lamelový** |
| stropní, koupelna | -0,018 | -1,556 | lamelový |
| stropní, ložnice zadní | +1,924 | -1,056 | hladký |
| stropní, ložnice přední | +2,056 | +1,609 | hladký |
| downlight, ve sprše | -0,021 | -2,534 | lamelový |

Svítidlo označené v prvním kole jako „obývák, přední část vpravo" leží ve **středním modulu**, tedy na lamelovém stropě. Na IMG_2329 je to přesně tak vidět.

Přisazené svítidlo: plochý bílý kotouč s tenkým rámečkem a mírně vypouklým difuzorem, průměr **0,35 (nejisté, 0,30 až 0,45)**, vyložení 0,03 (odvozený poměr h/D = 0,08). Fotky neobsahují na rovině stropu nic o známém rozměru, přesněji to nejde.

Downlight v koupelně: zápustný bílý kroužek průměru 0,11 až 0,13, mléčná čočka 0,07 (poměr čočka ku kroužku 0,66 až 0,70 je změřený, absolutní rozměr ne). V koupelně jsou **oba** stropní prvky realizované jako zápustné downlighty, ne jako talíř.

### Zásuvky, výška 1,3 nad podlahou

| # | líc stěny | x | z |
|---|---|---|---|
| 1 | zadní stěna kuchyně, z = -2,630 | -2,888 | -2,630 |
| 2 | západní líc koupelnové příčky, x = -0,782 | -0,782 | -2,320 |
| 3 | tentýž líc, **výška 0,3** | -0,782 | -1,240 |
| 4 | západní obvodová, x = -3,062 | -3,062 | -0,040 |
| 5 | západní obvodová | -3,062 | +2,410 |
| 6 | zadní stěna ložnice, z = -2,630 | +2,852 | -2,630 |
| 7 | severní líc příčky ložnic, z = +0,518 | +2,862 | +0,518 |
| 8 | jižní líc téže příčky, z = +0,591 | +2,862 | +0,591 |
| 9 | přední stěna ložnice, z = +2,630 | +2,852 | +2,630 |

Zásuvky 7 a 8 jsou na výkresu jeden slitý blok dvou symbolů, kolíky nahoru a dolů, tedy zády k sobě přes příčku.

Zásuvka číslo 3 ve výšce 0,3 je jen na výkresu, na žádné fotce ji nikdo nenašel. Popiska „Socket height0.3m" k ní ale vodicí čárou opravdu míří.

Na fotce IMG_2326 je zásuvka na **kolmé** (západní) stěně asi 0,13 od rohu, ne na zadní. Fotografovaná jednotka má kuchyň jinak zalomenou, takže to není důkaz proti výkresu.

### Zásuvky klimatizace, výška 2,1

| líc | x | z |
|---|---|---|
| západní obvodová | -3,062 | +0,460 |
| východní obvodová | +3,062 | +0,460 |
| východní líc hlavní příčky, do ložnice přední | +0,782 | +2,450 |

Výška 2,1 je ověřená vizuálně dvakrát: bílý čtvereček je nalepený přímo pod černým pásem u stropu.

**Klimatizace samotná není**, ani vnitřní, ani venkovní jednotka. Prošlých 28 exteriérových a 15 dronových snímků, žádná konzola, žádný prostup, žádný chladivový svazek. Jsou jen ty tři připravené zásuvky.

### Vypínače, výška 1,3

| co | umístění |
|---|---|
| koupelna, u D3 | jižní stěna, x = -0,17; **na chodbové straně** (z = -0,513), soudě podle konvence hák symbolu trčí do místnosti, kde je přístroj |
| ložnice zadní | východní líc hlavní příčky, x = +0,782, z = -0,640 |
| ložnice přední | tentýž líc, z = +1,540 |
| dvojitý u vstupu | přední stěna středního modulu, z = +2,849, x = -0,868 (podle výkresu, viz nejistota N7) |

Legenda hlásí 5, na výkresu jsou 4 symboly, protože ten u vstupu je **dvojitý**, tedy dvě užší klapky v jednom rámečku. Na IMG_2342 je to jednoznačné.

### Provedení přístrojů

Rámeček 0,086 × 0,086 (normovaný čínský typ 86; naměřeno 0,090 až 0,095, ale měří se rozmazaná bílá hrana proti šedé stěně). Vyložení ze stěny 0,011.

Vypínač: bílý čtvercový rámeček se zkosenou hranou, zapuštěná klapka 0,052 (poměr 0,60 rámečku), **malý zelený kontrolní bod nahoře uprostřed**.

Zásuvka: **tři úrovně geometrie**, ne dvě. Rámeček, uvnitř mírně zapuštěná čtvercová deska 0,060 (0,69 rámečku) a v ní kulatá prohlubeň **0,043** (0,485 rámečku) se dvěma otvory a bočními zemnicími kontakty. Původních 0,055 je o centimetr moc.

### Rozvaděč

Přisazená plastová skříňka, světle šedá neutrální, **0,25 × 0,20 × 0,10** (výška 0,17 je o 3 cm málo, tři nezávislé odhady dávají 0,17 až 0,24). Horní hrana asi 0,03 pod stropem, spodní asi 2,05.

Na výkresu elektro **není nakreslený**, ačkoli ho legenda počítá. Plný obdélník u zadní stěny koupelny, který se za něj vydával, je **bojler s konzolou**: rozdílový obraz obou listů ukazuje, že je i na listu vody a vedou k němu trubky s popiskem odpadního potrubí.

Do modelu patří **zavřená** krabice. Na fotkách je otevřená bez krytu (montážní stav, uvnitř proudový chránič se žlutým testovacím tlačítkem, pět až šest jističů s červenými pákami, řada svorek, modré a červené vodiče). **Jak vypadá zavřená, žádná fotka neukazuje**, průhled na jističe by byl výmysl.

### Chránič bojleru

Jižní stěna koupelny, z koupelnové strany (z = -0,589), x = -0,648, výška 2,1. Nevyplněný půlkruh s kolíky, opticky bílý rámeček jako zásuvka.

### Co v interiéru není

Kouřové čidlo, větrací mřížky, revizní dvířka. Stropy jsou na všech snímcích holé, kromě svítidel. Jediný technický prvek na stěně mimo elektro je ventilátor v koupelně.

---

## 10. Oprava exteriéru

V pořadí podle velikosti chyby.

**1. Sklon střechy 15° → 12°.** Změřeno na IMG_2285 přes úběžníky: levá štítová hrana 10,4°, pravá 13,0°, průměr 11,7°, stabilní i při posunu ohniska (5200 až 5550 px) a sklonu svislic. Hodnota 8° z jednoho kola stojí na sklonu levé hrany -0,0576, který se nepodařilo zopakovat; vlastní detekce siluety proti obloze dává -0,1551 s reziduem 1 až 5 px na délce 2480 px. Praktický důsledek: **převýšení hřebene nad okapem 0,70 m** při rozponu 6,8 m. Při 8° by to bylo 0,48 a veranda i štít by se viditelně zplácly.

**2. Štít není cedr.** Vzorky plochy mezi štítovou hranou a horním pásem stěny (#3B4758 až #445060) jsou prakticky totožné se střešním plechem (#394556, #485363) a nemají nic společného s cedrem na stěně (#A76733). **Celý štítový trojúhelník je černý**, ve vrcholu vysoký asi 0,70 m, k okapu se zužuje k nule. Není to úzký lem 0,20 až 0,25, jak tvrdilo jedno kolo; kdo nakreslí jen lem, nechá pod střechou díru.

**3. Sloupky terasy: čtyři, ne dva.** Na přední hraně jsou pod podhledem čtyři betonové bloky a nad každým tenký černý svislý profil, v relativních polohách 0,02 / 0,29 / 0,67 / 0,98. Tedy dva rohové plus dva v osách modulových spár, x = **-1,125** a **+1,125**. Uprostřed před vchodem sloupek opravdu není. Věta ve STAV-3D „Jen dva rohové" je špatně, první půlka („uprostřed končí před vchodem") platí.

**4. Poloha oken na bočnicích.** 0,845 od každého rohu a 1,468 mezi otvory. Údaj 1,43 m od rohu ve STAV-3D je špatně.

**5. Okno W2 na čtverec 0,56 × 0,56** místo 700 × 400. Tři nezávislá měření se shodují.

**6. Zrušit varování o valbové střeše.** STAV-3D píše, že fotografované jednotky mají valbu a že by se měla vrátit. Není to pravda. DJI_0182 je téměř nadir a střecha je obdélník s jedinou rovnou hřebenovou čárou přes celou šířku, bez úhlopříčných nároží. DJI_0179 ukazuje vrchol, od kterého klesají dvě štítové hrany a pod nímž je rovnou svislá černá plocha. Sedlová je správně, tu poznámku vyškrtnout, ať se k ní nikdo nevrací.

**7. Rozteč prken terasy nechat na 0,148.** Přeměření dvěma metodami dalo 0,145 a 0,17, tedy poctivá nejistota ±0,02. Od stávajících 0,148 to nejde odlišit a **přetexturování se tím neospravedlní**. Prkno 0,138, spára 0,007.

**8. Kladení prken terasy začíná od přední hrany, ne od stěny.** U stěny bočního modulu je první prkno uříznuté asi na 0,05 m, kdežto střední pole začíná u stěny plným prknem. Střední pole je předsazené o 0,225, což není celý násobek rozteče, takže **spáry přes černý profil nenavazují**. To je jediné číslo v celé exteriérové zóně, které se z fotek dá dostat bez znalosti měřítka, a drží: pata stěny středního modulu leží v obraze o 47 až 55 px blíž než pata stěny křídel.

**9. Terasa.** Hloubka **2,00** (změřeno 1,93 až 2,02), před středním modulem o 0,225 méně. **Šířku kreslit rovnou šířce domu** (6,276), dokud ji někdo nezměří; přesah 0,3 m na každou stranu nemá oporu, rektifikace u něj vychází vnitřně rozporná. Dva černé příčné profily šířky asi 0,15 v osách modulových spár, kolmo na prkna, od stěny k přední hraně. Obvodový lem černý plochý profil asi 0,11, obíhá celý obvod včetně paty stěny domu. Prkna rovnoběžně s průčelím.

**10. Krokve verandy** kolmo na hřeben (rovnoběžně s průčelím), rozteč **0,5 až 0,65**, u hřebene zdvojené s hřebenovou vaznicí. Průřez 0,05 × 0,10 je odhad. Podhled krémový strukturní plech bez drážek, jen tupé spáry panelů běžící **po spádu**, tedy kolmo na krokve. Albedo asi #DCD4C4.

**11. Kulaté otvory u vstupu nemodelovat.** Nejsou to větrací mřížky, jsou to dvě technologické díry vedle sebe ve svislém ocelovém sloupku vedle D1, těsně pod průvlakem. V měřítku konfigurátoru neviditelné.

**12. Vertikální rozklad boxu (jen pokud se sáhne na textury).** Rozklad 242 / 1945 / 150 ve STAV-3D neodpovídá výkresu. Podle IMG_2282 při kotvě 2337: horní rám 0,163, panel 2,066, spodní rám 0,108. Výkres kreslí panel 2083 nebo 2134 podle toho, kterou ze tří spodních čar bereme jako patu, ta nejednoznačnost je reálná. **Změna panelH z 1,88 znamená přeříznout dlaždici fasády a zvednout TEX_VERZE.** Doporučuji na to nesahat, dokud nebude jasno v N1.

**13. Text „předsazení ~4,5 cm" v oddílu „Konstrukce podle fotek"** ve STAV-3D pořád zůstal, ačkoli tabulka rozměrů výš už má správných 225 mm. Opravit, ať to někdo znovu nepřečte.

**Rozlišování jednotek.** DJI_0171, DJI_0173 a IMG_2279 ukazují **jiný dům**: jeden dlouhý modul, plochá střecha bez hřebene, terasa u kratší strany, prkna kolmo ke stěně. Argumentovat jimi pro tenhle dům nelze. Pro souvislou střechu nad terasou platí DJI_0170, IMG_2302 a IMG_2357, a závěr drží: jedna plocha, žádná spára, žádný samostatný přístřešek.

---

## 11. Nejistoty k doměření

Seřazeno podle toho, kolik v modelu opraví. Většina je otázka pěti minut se svinovacím metrem a žádná fotogrammetrie ze 14mm ultraširoku to nedožene.

**N1. Světlá výška, tři měření: obývák, chodba, koupelna.** Od podlahy ke stropu a zvlášť od podlahy ke spodní hraně černého pásu. Na tom visí úplně všechno svislé: výšky zásuvek, parapet, výška linky, poloha rozvaděče. Rozptyl mezi zónami je dnes 2,06 až 2,30. Zároveň se tím rozhodne, jestli je střední modul opravdu vyšší než křídla.

**N2. Výška horní plochy kuchyňské desky.** Rozdíl 0,72 versus 0,92 je na modelu vidět a rozhoduje i o tom, jestli je fotografovaná jednotka nižší než evropský standard, nebo ne. Změřit zároveň výšku čela dvířek a výšku soklu, ať se ověří poměr 0,21 : 1 : 0,067.

**N3. Parapet W1 nad hotovou podlahou.** Fotky dávají 0,83 až 0,92, výkres 0,80 nad spodkem boxu (asi 0,69 nad podlahou), výkres si navíc protiřečí sám mezi zadním a bočním pohledem. Změna se promítne i do exteriéru, takže to musí být vědomé rozhodnutí, ne přepsané číslo.

**N4. Výška vnitřních dveří D2 a šířka otvoru.** Celá výplňová tabulka výkresu je u tohohle domu nedůvěryhodná (W1 i W2 prokazatelně neplatí), takže 800 × 2050 není ověřené. Změřit jedny dveře.

**N5. Rozteč svislých švů stěnových panelů.** Poměr šev ku šířce okna je změřený na dvou fotkách (0,942 a 0,961), absolutní hodnota vychází 0,985 až 1,017. Jedna spára změřená metrem srovná celou stěnovou geometrii.

**N6. Hloubka sprchového koutu.** Pásmo 0,62 až 0,70. Jedno měření uvnitř vaničky uzavře celou koupelnu. Přiměř zároveň délku lineárního žlabu (0,20 až 0,30) a rozteč protiskluzových drážek.

**N7. Na které straně vstupu je dvojitý vypínač a rozvaděč.** Výkres říká západní ostění D1, IMG_2329 a IMG_2330 ukazují příčku, IMG_2325 a IMG_2342 ukazují opačnou stranu. Fotky si protiřečí navzájem, rozdíl je 1,5 m. Model zatím kreslí výkres.

**N8. Šířka podlahového prkna.** 0,16 versus 0,19. Metr přes tři prkna. Rozbor si v tomhle sám odporoval: v hodnotě 0,19, v metodě „okolo 160 mm".

**N9. Rozteč žeber lamelového podhledu.** Tři cesty daly 0,09, 0,12 a 0,15, všechny přes kalibrace, které samy neobstály (hádaný průměr svítidla, hádaná rozteč). Změřit šířku jedné lamely.

**N10. Průměr přisazeného stropního svítidla.** 0,30 až 0,48. Na rovině stropu není na žádné fotce nic o známém rozměru.

**N11. Převýšení hřebene nad okapem.** Mělo by být 0,70 m při 12°. Změřitelné z terasy metrem a rozhodne spor 8 / 12 / 15 stupňů definitivně, líp než jakékoli další počítání úhlů z fotky.

**N12. Rozměry terasy.** Šířka (6,3 až 7,2), hloubka (1,93 až 2,04), šířka příčných profilů (0,09 až 0,16), průřez sloupků (odhad 0,08 z poměru k šířce D1), rozteč prken (0,145 ±0,02). Rozteč se měří tak, že se přeloží deset roztečí najednou a vydělí deseti.

**N13. Poměr stran dřezu.** Výkres kreslí skoro čtverec 444 × 461, fotky ukazují podélnou vanu. Jedno z toho je špatně.

**N14. Zda jsou obě křídla sprchové zástěny matná.** Na IMG_2343 je matné jen jedno, druhé je průhledné. Může to být čiré sklo i otevřený otvor.

---

## 12. Co chybí a nemáme pro to podklad

- **Zavřený rozvaděč.** Žádná fotka, jednotka byla ve stavu montáže. Průhled na jističe by byl výmysl. Buď vynechat, nebo si vyžádat fotku hotového stavu.
- **Šířka panelů podhledu verandy a jejich spár.** Spáry vidět jsou, v rovině podhledu není žádné měřítko.
- **Boční okapová hrana střechy** (okapnice, podhled, výška lemu nad bočnicemi). Nikdo to nepopsal, přitom je to plocha, kterou návštěvník při otáčení uvidí nejčastěji.
- **Přesahy střechy** přes zadní stěnu, bočnice a štíty. Model je kreslí a podhled se podle nich řeže po pásech, takže špatný přesah dělá přesně ty světlé klíny, na které STAV-3D varuje.
- **Konstrukce pod deskou terasy**: tloušťka prkna (odhad 0,025 z katalogu), výška ocelového rámu, výška desky nad terénem.
- **Rozteč švů hladkého stropu v křídlech.** Na IMG_2338 jsou vidět dva švy, ale nic o známé velikosti. Předpoklad 1,1 m je jen domněnka, že strop kopíruje modul stěn.
- **Skutečný průřez zkoseného rohového sloupku.** Ze zkoseného rohu snímaného pod úhlem se určit nedá, řádkové skeny dávají 0,10 až 0,50 podle výšky, protože se přidává stín.
- **Fotky šedé a černé fasády.** Všech 43 snímků je cedrových, ty dvě varianty jsou přebarvená stejná kresba. Beze změny.
- **Venkovní svítidlo na terase nebo u vstupu.** Nikdo to systematicky neprošel. Pokud tam nic není, veranda ve večerní scéně zůstane úplně tmavá a bude to vypadat jako chyba.
- **Bojler.** Výkres vody i elektra kreslí na zadní levé stěně koupelny kulaté těleso s konzolou. Na fotkách ho nikdo nezahlédl, nejspíš je mimo záběr uvnitř sprchového koutu.

---

## 13. Co se NEMODELUJE

Dům se dodává holý. Vybavená je jen kuchyň a koupelna. Následující je na fotkách, ale do modelu nepatří.

**Naaranžovaný nábytek:** tyrkysová (petrolejová) pohovka, bílý konferenční stolek, šedý koberec v obývacím prostoru, bílá lavice, umělá květina v bílém květináči.

**Stavební nepořádek:** fotografické stativy a stativ s LED světlem, benzinová elektrocentrála, červené i černé kufry Parkside s nářadím, aku svěrka, vrtačka, vytlačovací pistole na tmel, dřevěné koště a smeták, svazky řeziva a hranolů ve fólii, zbylá prkna laminátu a krabice od podlahy, zbytky bílých panelů a lišt opřené o stěnu, igelitové fólie, sáčky a obalový materiál, odřezky lišt, prodlužovací kabel visící přes zásuvkový blok, zbytky štěrku a písku ve spárách terasových prken.

**Předměty na lince a v dřezu:** kávovar De'Longhi Magnifica S na černém plechovém tácu, krabice s leopardím vzorem, plechovka montážní pěny PRO-DOMA, sprej s barvou, role lepicí a izolační pásky, kartuše Mamut Glue, odkapávač na nádobí, plastová odměrka a stěrka, termoska, papíry, drobné kování, bílá váha.

**Rozestavěnost, ne prvky:** otevřený rozvaděč bez krytu (modelovat zavřený), volně visící kabel od ventilátoru v koupelně, volně visící kabel se třemi vodiči vytažený ze stěny obýváku, modrá ochranná samolepka a fólie na černém rámu sprchové zástěny, ochranná bílá fólie na střešním plechu (nesmí ovlivnit barvu střechy), lepicí páska a záplata na ocelovém sloupku terasy, betonové zákrytové bloky a dřevěné klíny pod rámem (dům sedí na terénu, patky Tomáš zamítl).

**Polepy a poutače:** papírová cedule FlexiHouse nalepená zevnitř na skle vstupních dveří, reklamní banner FlexiHouse na rámu nad terasou, nálepka nad dveřmi koupelny, vzorník podlahových dekorů na kufru u vstupu, červený vozík se vzorky prken.

**Lidé a okolí:** sedící muž na pohovce, odraz fotografa ve skle vstupních dveří, nohy a boty v záběru, stín fotografa na fasádě, auta, náklaďáky Schroth Transport, plot, zeď a okolní zástavba viditelná okny.

**Drobnost k rozhodnutí:** bílé tělísko se zaobleným čelem a mřížkou na boku vedle vstupního vypínače (asi 0,06 × 0,10 × 0,04) je nejspíš zvonek nebo bzučák, dodatečná montáž, na výkresu není. Vynechat.

**Optické artefakty, ne materiál:** odlesky přepáleného okna na obkladu a na stropě je nutné při tvorbě textur odečíst, nejsou to žíly mramoru ani kresba plechu.