# Homepage: co chybí do nasazení

**Aktualizováno 11. 9. 2026: většina bodů níž je už vyřešená, přeškrtnuté položky
nečíst jako otevřené.** Zbývá jediné: odeslat jednu poptávku naostro po nasazení
(bod 4), protože D1 a Resend potřebují produkční klíče.

Stav k 8. 9. 2026 večer. Vzniklo z otázky „chybí tam moc věcí, ale nevím jaké“.
Seřazeno podle toho, co brání nasazení. Živý web je pořád starý `index.html` z commitu
`2276961`, tohle všechno žije jen lokálně.

## A. Bez tohohle to nasadit nejde

1. ~~**3D sekce ukazuje pohyb, který dům nedělá.**~~ **VYŘEŠENO 8. 9. 2026 vyřazením.**
   Sekce ze stránky pryč, markup, styly i obsluha odložené pohromadě
   v `_odlozeno-rozklad.html`. Vrátit, až bude fold správně, viz `podklady-3d/STAV-3D.md`.
   Zabírala 2 236 px, tedy 30 % celé stránky.

2. ~~**Newsletter slibuje něco, co web neumí.**~~ **HOTOVO 8. 9. 2026, commit `9e5252d`.**
   Migrace proběhla na ostré D1 (tabulka `newsletter` tam je), `/api/newsletter`
   i `/api/odhlasit` a stránka `/odhlasit` jsou nasazené a ověřené naostro celým kolečkem:
   přihlášení, kontrola řádku v D1, odhlášení přes živou stránku, kontrola příznaku,
   úklid testovacího řádku. Tabulka je zase prázdná.

   **Zbývá k tomu dvojí:** rozmyslet double opt-in (dnes se adresa uloží rovnou)
   a napsat samotný odesílač, aby do každého e-mailu dával odkaz
   `https://flexihouse.cz/odhlasit?kod=<odhlasovaci_kod>`. Bez toho je kód v databázi
   k ničemu.

3. ~~**Vizualizace v pásu se showroomem není označená.**~~ **ODPADLO 11. 9. 2026:**
   pás jede na sedmi reálných fotkách z `img/realne/`, žádný AI render tam není.
   Původní znění: Katalog má štítek „Vizualizace“
   dvakrát, homepage nově nulakrát, protože se odstranil při zjednodušení pásu.
   Je to AI render domu na louce a stojí vedle věty, že ten dům stojí na Sokolovské,
   kde ve skutečnosti stojí na šotolině u silnice. Buď štítek vrátit, nebo změnit text.

4. **Poptávkový formulář na homepage nebyl vyzkoušený naostro.** Obsluhu jsem doplnil dnes
   (dřív žádná nebyla a odeslání by jen přeneslo stránku), ověřená je ale jen validace.
   Skutečné odeslání na `/api/send-lead` z homepage nikdo neposlal. Před nasazením jedna
   testovací poptávka a kontrola, že dorazí mail i záznam v adminu.

5. ~~**Váha stránky se změnila.**~~ **ODPADLO** spolu s 3D sekcí, `flexi-3d.js`
   ani textury se z homepage už netáhnou. Před nasazením i tak jedno měření Lighthousem,
   protože obrázků na stránce zůstává přes 2 MB ve všech variantách dohromady.

## Délka stránky

Změřeno 8. 9. 2026 na šířce 1440 px, výška okna 860 px.

| | před krouhnutím | po |
|---|---|---|
| celkem | 7 479 px, 8,7 obrazovky | **5 091 px, 5,9 obrazovky** |

Škrtnuto: celá 3D sekce (2 236 px) a kroky z pěti na tři (740 → 589 px).
Zbývající sekce: hero 474, výběr domů 735, showroom 333, cesta 533, claim 480,
záměry 391, poptávka 994, newsletter 190.

**Kroky přestavěné na pás „cesta“** podle Modulosu: pět tmavých čtverců s čísly v řadě,
mezi nimi čárkované oblouky střídavě nahoru a dolů, spodní vedou pod popisky. Na mobilu
se to překlápí na svislý seznam, číslo drží dva řádky vedle sebe a oblouky se schovají.

Další kandidáti na škrt, kdyby to bylo pořád dlouhé: **záměry** (391 px, slabá sekce)
a **výběr domů** (735 px na tři karty, obrázky mají kolem sebe hodně místa).
Poptávka je 994 px, ale to je konverzní cíl, tu nekrouhat.

## B. Obsah, který na stránce chybí

6. ~~**Kroky a záměry jsou pořád slabé sekce.**~~ **VYŘEŠENO:** záměry nahradila sekce
   `vyuz` („Pro každé využití“), kroky jsou pás `cesta` s pěti čtverci. Původní znění:
   Tomášovo hodnocení „mid ass sekce“ na ně sedí dál.

7. ~~**Zmizelo „Co dům umí“.**~~ **VYŘEŠENO:** sekce `vyhody` („Proč to lidi berou“),
   šest plusů s ikonami. Původní znění:
   nová nemá ani jedno a nic je nenahradilo.

8. ~~**Cena je na homepage jen jako „od 400 000 Kč“ na kartě.**~~ **PŘEKONÁNO:**
   platná cena je 399 000 a na stránce je na třech místech. Původní znění: Je to první otázka
   každého návštěvníka a stránka na ni odpovídá jedním číslem bez kontextu.

9. ~~**Na homepage nejsou časté dotazy.**~~ **VYŘEŠENO:** sekce `dotazy` se sedmi
   otázkami. Strukturovaná data FAQPage tam vědomě nejsou: čtyři ze sedmi otázek jsou
   doslova stejné jako na `/caste-dotazy` a Google by si vybral jednu stránku.

## C. Rozhodnutí, která nejsou moje

10. ~~**Cena „od“: 400 000, nebo 410 000?**~~ **ROZHODNUTO 11. 9. 2026: 399 000 Kč
    bez DPH včetně elektroinstalace.** Původní znění: Elektroinstalace za 10 000 je v konfigurátoru
    povinná, takže nejlevnější sestava vyjde na 410 000. Rozhodne Dan, pak se opraví
    i `_audit/konzistence.py`.

11. ~~**Flexi Office: 70 000, nebo 100 000?**~~ **ROZHODNUTO 11. 9. 2026: 100 000 Kč.**
    Původní znění: `/caste-dotazy`, báze poradce i Google profil
    říkají 70 000, `/flexi-office` a `/katalog` říkají 100 000, obojí i ve strukturovaných
    datech. Viz `.docs/OTEVRENE-OTAZKY.md` bod 16.

12. **Barevný akcent.** Celý web běží ve dvou odstínech šedomodré, značka nemá akcent.

## Jak to vrátit, kdyby bylo potřeba

    git checkout index.html && rm assets/domov.css

Původní podoba je i v `_ulozene-navrhy/homepage-2026-09-08/`.

## Patička, přestavěná 9. 9. 2026

Celý web, ne jen homepage. Tmavá `#16202a`, bez jediné vlasové linky, odsazení 80 px,
pět sloupců: copyright a povinné údaje, Domy, Společnost, Ke stažení, Sociální sítě.
Odkazy čistě bílé, rozestup 32 px od řádku k řádku (změřeno na modulos.cz, měli jsme 39).
Hodnocení Google a Firmy.cz zůstala, jen zhubla na logo plus hvězdy, popisky jsou v `.vh`.
Telefony a e-mail z patičky **vypadly**, kontakt je jen v poptávkové sekci.

Změněno v `assets/flexi.css` (bloky `.foot*`, `.duvera2`, `.hodn2*`, `.statly`)
a markup ve 49 souborech. Záloha původního stavu je mimo repo,
ve scratchpadu session `e97c588e`.

**Blokuje nasazení:** sloupec „Ke stažení" má tři položky, ke kterým **neexistují PDF**.
Jsou to schválně `<span>`, ne odkazy, takže nic nespadne na 404, a je u nich štítek
„Připravujeme". Před nasazením buď dodat soubory a udělat z nich odkazy, nebo sloupec
dočasně vyhodit. Názvy jsou zatím návrh:
technický list rozkládacího domu, katalog fasád a vybavení, příprava pozemku a přípojek.

**K rozmyšlení:** patička má na mobilu 1 327 px, tedy přes tři obrazovky. Jde zkrátit
tím, že se Domy a Společnost na mobilu nechají vedle sebe místo pod sebou.

## Písmo nadpisů, 9. 9. 2026

Bricolage nahrazeno **Archivem**, tedy fontem, kterým je vysázená značka v logu.
Nadpisy 700 bez verzálek, řádkování 1,12, proklad −0,02 em. Web má teď dvě rodiny
místo tří. Nový řez `fonts/archivo2-{lat,ext}-sub.woff2` s osou váhy 600–800
(nasazený `archivo-lat-sub.woff2` měl osu zapečenou, `font-weight` na něm nedělal nic).
`size-adjust` náhradního písma přeměřen na 97,3 %.

**Nejde nasadit jen homepage.** Písmo i patička sedí v `flexi.css`, propíše se to
na všech 18 ostrých stránek. Je to jeden deploy, ne dva.

Podstránky prověřené a srovnané: `.pr-h`, `.pr-faq h3`, `.pr-polozka h3` v `produkt.css`,
`.lede h1`, `.prose h2`, `.row h2`, `.aside h2` ve `flexi.css`, `.kf__head h1`
a `.kf-panel__head h2` v konfigurátoru, inline `.pz-*` na `/stavebni-povoleni`
a `.kat-*` na `/katalog`. Inline Bricolage zbylo ve čtyřech souborech, přepsáno.

**Změřeno po opravě:** 18 stránek × 2 šířky (1440 a 390 px) = 36 kontrol,
36 čistých. Nikde verzálky na nadpisu, nikde Bricolage, nikde vodorovné přetečení.

## Test poptávky z homepage, 9. 9. 2026 v noci

Odesláno přes `wrangler pages dev` na portu 4610, lokální D1, **bez RESEND_API_KEY**,
takže se nikam neodeslal žádný mail. Vyplněn skutečný formulář na homepage, ne přímé
volání endpointu.

**Prošlo:** formulář zavolal `/api/send-lead` se správnou nálož, endpoint provalidoval,
`ulozPoptavku` vložilo řádek do `poptavky` se všemi poli včetně `zdroj`
(`http://localhost:4610/ | vstup: / <- přímo`), obsluha zobrazila chybovou hlášku.
Testovací řádek smazán.

**Neprošlo, protože otestovat nešlo:** volání Resendu. Produkční secret je jen k zápisu,
lokálně klíč není. Ta část je ale ověřená z provozu, poptávky reálně chodí.
**Zbývá jedna ostrá poptávka přes den, až bude komu cinknout.**

**Dva nálezy z toho testu:**

1. `ulozPoptavku` v `functions/api/_uloz.js` chybu databáze **spolkne** (`catch {}` →
   `return null`) a endpoint pokračuje dál. Kdyby na produkci tabulka nebo binding
   nesedly, poptávka se ztratí a nikdo se to nedozví, mail přitom odejde. Stálo by za to
   aspoň zalogovat do odpovědi nebo poslat varování do interního mailu.
2. Návštěvníkovi se zobrazí **technická hláška serveru**, v testu doslova
   „Server není nakonfigurován (RESEND_API_KEY)." To do zákaznického rozhraní nepatří,
   patří tam lidská věta a technický detail jen do konzole.

## Mobil, 9. 9. 2026 v noci

Změřeno na 375 px, ne odhadnuto ze snímku.

| | před | po |
|---|---|---|
| délka homepage | 7 987 px (9,8 obrazovky) | **7 349 px (9,1)** |
| sekce s výběrem domů | 1 593 px | **894 px** |
| chatový poradce | pilulka 158×56 + bublina **343 px** široká | **kolečko 56×56 + bublina 232 px** |
| terče pod 32 px na homepage | 35 | **0** |

Co se udělalo:

- **poradce na mobilu je kolečko.** Text „Zeptat se" zabalen do `.fhp-launch__t`
  a schován, tlačítko dostalo `aria-label`, takže přístupné jméno zůstalo.
  Bublina přestala být přes celou šířku (`left:16px` → `left:auto`, max 232 px).
- **karty domů jsou na mobilu na šířku** (obrázek vlevo 38 %, text vpravo), šipka
  schovaná, protože celá karta je odkaz. Pozor, `.dum` je mřížka, obrázek musí mít
  `grid-row:1 / span 3`, jinak texty spadnou do špatných buněk.
- **hmatové plochy:** `.link` 28 → 49 px, odkazy v patičce 17 → 33 px,
  kontakty v poptávkovém bloku 19 → 33 px, hodnocení 16 → 44 px,
  křížek bubliny 22 → 32 px. Tečky karuselu zůstávají 8 px vizuálně, ale mají
  `::after{inset:-11px}`, tedy 30 px hmatově. **Ověřeno `elementFromPoint`,
  ne z rozměru prvku, ten pseudoprvek nevidí.**

**Co zůstalo pod 24 px a je to v pořádku:** odkazy uvnitř vět na podstránkách
(„stavební úřad", „rozkládací dům") a povinná atribuce Leafletu na `/poptavka`.
Roztahovat odkazy v textu by rozbilo řádkování.

**Co zůstalo pod 24 px a v pořádku to není:** drobečky „Domů" na právních stránkách
a seznam odkazů na `/404`. Sedm terčů na 404, jeden až tři na ostatních.

### Patička na mobilu do dvou sloupců, 9. 9. 2026

Podle modulos.cz, kde je patička na 375 px dvousloupcová a měří 776 px, kdežto naše
jednosloupcová měřila přes 1 400. Copyright a povinné údaje jdou přes obě šířky,
pod nimi Domy | Společnost a Ke stažení | Sociální sítě.

| | před | po |
|---|---|---|
| patička na 375 px | ~1 400 px | **1 166 px** |
| celá homepage | 7 349 px (9,1 obrazovky) | **7 029 px (8,7)** |

**Karty domů zůstávají řádkové**, ne dvě vedle sebe jako u Modulose. Oni mají na kartě
jen název a jednu řádku, my ještě popis a cenu, ve dvou sloupcích po 156 px by se to lámalo.

**Nepřevzato záměrně:** Modulos má plovoucí pilulku s telefonním číslem místo chatu.
Tomáš 9. 9. rozhodl, že chatový poradce zůstává.

**Srovnání mobilů, změřeno na 375 px:** my 8,7 obrazovky, Modulos 7,1, offio 16,4.
offio jako vzor pro mobil nebrat, má karty jednu na obrazovku a nejvíc malých terčů
ze všech tří. Hmatové plochy máme naopak nejlepší, jejich odkazy v patičce mají 17 px.

