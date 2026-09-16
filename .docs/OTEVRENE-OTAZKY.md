# Co potřebuju vědět, abych mohl pokračovat

Stav k 7. 9. 2026. Seřazeno podle toho, co nejvíc blokuje práci.

Otázky a úkoly kolem **redesignu homepage** jsou zvlášť v
[DALSI-KROKY-HOMEPAGE.md](DALSI-KROKY-HOMEPAGE.md) (stav k 8. 9. 2026).

## A. Konstrukce, blokuje psaní o stavbě

Ze zápisu od Prokešů jsou tři poznámky, které si navzájem odporují, takže z nich zatím
na webu není nic. Psát nepřesné technické parametry o stavbě je horší než je neuvádět.

1. **Jak do sebe zapadá Rockwool, EPS a PUR?** Zápis říká „Rockwool 75 mm zateplení v ceně“,
   „stěny EPS“ a „fasáda + 15 mm PUR“. Je Rockwool ve stropě a EPS ve stěnách? Nebo je
   Rockwool nový typ panelu, který EPS nahradil? A těch 15 mm PUR je navíc k 75 mm,
   nebo je to součást skladby?
2. **Co je „design stěn na vyžádání“?** Vnitřní obklad? Barva? Výběr z několika provedení?
   Když je to volba, patří do konfigurátoru a chce to cenu.
3. **PIR za příplatek: uvádět cenu, nebo nechat „na vyžádání“?** Teď je na webu jen to,
   že je za příplatek. Zákazník tím nemá jak porovnat, jestli se mu to vyplatí.
4. ~~**Požární odolnost pořád nedoložíme?**~~ **Uzavřeno 16. 9. 2026:** požární odolnost
   doložit umíme. Na webu i v bázi poradce je teď „doložit umíme, stavební povolení ale
   řeší váš stavební úřad“. Životnost se zároveň změnila na minimálně 25 let.

## B. Ičkka u položek v konfigurátoru

Featura, ne úprava textu. Než ji začnu stavět, potřebuju vyřešit obsah.

5. ~~**Co u položek, ke kterým fotku nemáme?**~~ **Rozhodnuto 16. 9. 2026:** náhled má jen
   volba, ke které existuje snímek vyrobeného domu, ostatní ho prostě nemají. Postavené
   a k proklikání na localhostu: v kartě je čtvercová miniatura, po kliknutí popup
   s velkými snímky a větou „Fotka vyrobeného domu, ne vizualizace". Náhled dostalo šest
   voleb: koupelna, kuchyňská linka, podlaha, závěsy, terasa, schody. Sada je v `REALNE`
   v `assets/flexi-konfig-data.js`, miniatury v `img/nahled/`.

   **Pořád chybí fotky** pro klimatizaci, sítě do oken, patky, dopravu, montáž a všech
   dvacet dekorů fasády. U fasády je to nejcitelnější: zákazník vybírá barvu ze vzorníku
   dodavatele a nemá jak ověřit, jak vypadá na hotovém domě.
6. **Jen v konfigurátoru, nebo i v ceníku na `/cena`?** V ceníku je stejný seznam položek
   a stejná otázka „jak to vypadá“.
7. **Odkud vzít fotku podlahy a závěsů?** Můžu je vytáhnout z těch 39 videí z 31. 8.,
   ale jsou to záběry z chůze, ne produktové snímky. Jestli máš lepší, pošli je.

## C. 3D model v konfigurátoru

8. **Šedá podlaha:** jaký odstín? Ideálně vzorek nebo fotka, ne slovní popis.
9. **Záclony a závěsy:** barva, materiál, jak moc průhledné. Jsou v každém okně?
10. **Schody:** kolik stupňů, z čeho, a u kterých dveří stojí.
11. **Patky:** jak vysoko dům nad terénem stojí, v centimetrech. Kolik patek a kde.
12. **Terasa do tří čtvercových bloků:** jak velký je jeden blok? Je to vždycky trojice,
    nebo se počet mění s velikostí terasy?

## C2. Klimatizace v 3D modelu sedí v okně (16. 9. 2026)

Našlo se při ladění záběrů v prohlídce interiéru. Nástěnná jednotka klimatizace
není na stěně mezi okny, jak slibuje popis volby, ale **v okenním otvoru**.
V panoramatu kuchyně ji vidíš jako černý kvádr uprostřed skla.

Druhý důsledek: kdo si k tomu vybere **závěsy, klimatizaci už neuvidí vůbec**,
závěs ji celou zakryje. V konfigurátoru se tak dá zaplatit 29 000 Kč za položku,
po které v náhledu nezůstane stopa.

Ověřeno na `img/pano-s/kuchyn/klima.webp` proti `zaklad.webp` (jednotka je tam)
a proti `kuchyn-podlaha-zavesy-klima.webp` (není). Prohlídka na jednotku míří
správně, chyba je ve scéně, ne v kódu. Opravit znamená přesunout jednotku
v Blenderu na stěnu a přerenderovat kuchyňské kombinace s klimatizací.

## D. Otevřené z dnešní práce

13. **Zmenšování hlavičky na desktopu.** Na mobilu jsem ho zrušil, protože posouvalo
    scroll o 20 px a to se na telefonu projevovalo jako glitch. Na desktopu se hlavička
    dál zmenšuje z 84 na 64 px a ten skok tam zůstává. Zrušit i tam?
14. **Zmizelé disclaimery.** Se sloupcem „Co neumíme doložit“ odešlo z webu i to, že
    neumíte doložit požární odolnost a náklady na vytápění. Životnost a záruka se vrátily
    jako fakta, požární odolnost je od 16. 9. 2026 doložitelná. Zbývají tedy jen náklady
    na vytápění: má se to někam vrátit, třeba do častých dotazů?

## F. ~~Cena Flexi Office: web si protiřečí sám se sebou~~ UZAVŘENO 11. 9. 2026

**Flexi Office stojí 100 000 Kč**, rozhodl Tomáš. Rozpor je opravený všude na webu.
Zbytek téhle kapitoly je jen historie.

Našlo se 8. 9. 2026 při stavbě `/dum-na-miru`. Nic jsem neměnil, je to cenové rozhodnutí.

16. **Kolik stojí Flexi Office, 70 000 nebo 100 000?** `/flexi-office` a `/katalog`
    říkají od 100 000 Kč, a to i ve strukturovaných datech (`lowPrice: 100000`).
    `/caste-dotazy` říká od 70 000 Kč, taky ve viditelném textu i v JSON-LD, který
    Google zobrazuje. Chatový poradce má v `baze.md` 70 000 a Google profil taky.
    Zákazník tedy na jedné stránce vidí jinou cenu než na druhé. Ať platí cokoli,
    musí se to srovnat na všech čtyřech místech najednou.

## E. Design a style guide

15. **Co konkrétně ti na webu vadí?** Ze seznamu konkrétních výhrad vznikne použitelnější
    dokument než z obecných pravidel. Tmavě modrý směr, který sklidil úspěch, je dobrý
    výchozí bod, ale potřebuju vědět, co se má sjednotit a co je vyloženě špatně.

## Lamelový obklad, chybí cena (10. 9. 2026)

Tomáš potvrdil, že lamely **nově poskytujeme**. Šest odstínů (světlý teak,
teak mix, palisandr, tmavě šedá, světle šedá, starobílá) je připravených
v konfigurátoru i ve 3D jako skutečná geometrie, rozteč 50 mm.

**Blokuje je cena.** Mají `price: 0` a `cenaText: 'Cena na vyžádání'`, takže
se do součtu nepřičte nic a zákazník by viděl cenu bez obkladu. Proto nejsou
na živém webu.

Dvě cesty:
1. Dostat od Dana cenu nebo aspoň spodní hranici („od X Kč") a pustit je ven.
2. Pustit je s tím, že se u součtu zobrazí upozornění, že cena obkladu není
   zahrnutá. Poctivé, ale konfigurátor tím přijde o svůj hlavní slib.

Doporučení: varianta 1. Stačí i hrubé „od".

## Barvy interiéru, čeká na podklady od Tomáše (11. 9. 2026)

Tomáš 11. 9.: „interiér bude mít svoje barvy, ještě dodatečně dopošlu.“
Do té doby se nic nevymýšlí, interiér zůstává v jednom provedení.

Ve 3D nese barvu těchhle pět ploch, u ostatních (porcelán, chrom, nerez,
sklo, svítidla) barva smysl nedává:

| materiál | co to je | dnes |
|---|---|---|
| `stenaIn` | stěny a příčky | textura `stenaIn`, bílá |
| `stropIn` | strop | tint 0,84 |
| `linka` | dvířka kuchyňské linky | tint 0,81 |
| `deska` | pracovní deska | textura `deskaIn` |
| `mramor` | obklad koupelny | textura `mramorIn` |
| `podlaha` | podlaha, příplatek 25 000 | textura `podlahaIn` |

**Co k tomu budu potřebovat**, aby to šlo udělat bez hádání:
1. Které z těch ploch jdou vybírat a které jsou dané.
2. Kolik odstínů u každé a jak se jmenují.
3. Jestli je to příplatek, nebo v ceně. Dnes v ceníku žádná volba interiéru
   není, takže by šlo o novou položku konfigurátoru.
4. Jestli se vybírá po plochách, nebo jako hotové sady („světlý“, „tmavý“).

Technicky je to připravené: materiály jsou v tabulce `MAT` v `blok-A-zaklad.js`
a přepínají se stejně jako fasáda, takže přidání znamená doplnit tabulku
a jednu volbu do `flexi-konfig-data.js`.
