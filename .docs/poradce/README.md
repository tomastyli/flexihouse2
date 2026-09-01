# Chatový poradce na web

Stav k 1. 9. 2026. Nic z toho není nasazené, `.docs/` se na Pages nenahrává.

## Proč vzniká

Dan má nepořádek v mailech a dotazech. Většina toho, co dostává, jsou opakované předprodejní
otázky: cena, povolení, doprava, zima, termín. Cílem není chatbot jako hračka, ale filtr:
odbavit opakované dotazy a nechat na Dana jen to, co má reálnou hodnotu.

Poradce proto nikdy neuzavírá konverzaci sám. Každá odpověď posouvá dál, buď do konfigurátoru,
nebo na Dana.

## Co je v `demo.html`

Jeden samostatný soubor, běží bez backendu. Obrázky i fonty jsou v něm zapečené, aby šel
poslat jako odkaz. Slouží k odsouhlasení chování a vzhledu, ne jako produkční kód.

Spuštění:

    node .docs/poradce/serve.js

Pak `http://localhost:4610`.

Co demo umí:

- Témata jako tlačítka, stejná logika jako u Alzy. Zkratka, ne klec.
- Volné psaní. Dotaz se páruje podle klíčových slov, funguje i bez diakritiky.
- Poradce se otevírá a zavírá plynule, na mobilu vyjede zdola. Zelené kolečko v hlavičce
  tepe, dokud je poradce k dispozici.
- Odpověď se streamuje po znacích s blikajícím kurzorem, ne po slovech. Rychlost se dopočítává
  z délky textu, takže krátká i dlouhá odpověď trvá zhruba stejně (kolem dvou vteřin).
  Za čárkou se přidá 75 ms, za tečkou 165 ms, mezi odstavci 210 ms, což dělá ten rytmus.
  Tečky „píše" blikají uvnitř té samé bubliny, do které se pak text vypíše, nemizí a nevzniká
  druhá. Během psaní je vstup zamčený. Při zapnutém omezení animací se text zobrazí rovnou
  a stejně tak při přepnutí na jinou záložku, aby text nezamrzl v půlce.
- Karty domů s fotkami přímo v bublině (větev „Jakou máte nabídku"). Karta je klikatelná.
- Větev na míru končí poptávkovým formulářem s polem „Co potřebujete".
- „Chci mluvit s člověkem" je pod každou odpovědí. Bere jméno a telefon.
- Na mobilu je poradce zavřený a čeká tlačítko, aby nepřekryl web.

Demo nikam nic neodesílá. Formulář jen potvrdí odeslání.

## Odkud jsou čísla

Všechny ceny v odpovědích jsou vytažené z `konfigurator.html`, ne vymyšlené:

| Položka | Cena |
|---|---|
| Základ rozkládacího domu | 480 000 Kč |
| Flexi Office | od 70 000 Kč, 10 ks skladem |
| Sedlová střecha | 40 000 Kč |
| Zateplení 100 mm | 30 000 Kč |
| Elektro + voda a odpad | 50 000 Kč |
| Klimatizace s tepelným čerpadlem | 25 000 Kč |
| Kamna | 30 000 Kč |
| Terasa | 20 000 Kč |
| Doprava a usazení | 15 000 Kč |
| Montáž na místě | 40 000 Kč |
| Vyřízení povolení | 15 000 Kč |

Rozměry rozloženého domu 6,3 × 5,9 m, zhruba 30 m², dvě ložnice.

Pozor: pokud se ceny v konfigurátoru změní, musí se změnit i tady. Až bude znalostní báze
v samostatném souboru, půjde ceny číst z jednoho místa.

## Co chybí a musí doplnit Dan

V demu jsou tahle místa vizuálně označená jako „doplní Dan", takže si je proklikne a uvidí je.
Bez nich bot buď mlčí, nebo by si musel vymýšlet, a vymýšlet si nesmí.

- Dodací lhůta od objednávky po usazení.
- Jaký základ musí být na pozemku a co si zajišťuje zákazník.
- Přípojky elektřiny a vody, co se čeká na hranici pozemku.
- Do jaké vzdálenosti platí cena dopravy a co potřebuje příjezdová cesta.
- Co přesně bude pozemek potřebovat za povolení podle typu užívání.
- Financování a splátky.
- Záruka, délka a rozsah.
- Naměřené náklady na vytápění za sezónu.

K tomu ideálně 20 až 30 reálných dotazů z jeho schránky i s tím, jak na ně odpovídá.
To je jediná práce na jeho straně a je to zároveň zdroj znalostní báze.

## Jak to postavit naostro

Demo páruje klíčová slova. Produkční verze má odpovídat modelem nad pevnou znalostní bází.

1. **Znalostní báze** jako jeden textový soubor. Bot smí odpovídat jen z něj. Co v něm není,
   na to odpoví předáním na Dana. Tohle je nejdůležitější pravidlo celé věci.
2. **Worker** na `/api/poradce`, stejná infrastruktura jako `send-lead` a `send-konfigurace`.
   Bázi držet v systémovém promptu s cachováním, aby se neplatila při každé zprávě znovu.
3. **Model**: `claude-opus-5`. Na tenhle typ odpovědí stačí `claude-haiku-4-5` a je pětkrát
   levnější ($1 / $5 za milion tokenů proti $5 / $25). Přepnutí je jeden řádek.
   Při dvou stech konverzacích měsíčně jde o jednotky stovek korun.
4. **Ukládání konverzací** do D1 vedle poptávek. Dan v `/admin` uvidí přepisy, takže po dvou
   týdnech přesně ví, na co se lidi ptají, a doplní to do báze.
5. **Předání člověku** zapisuje poptávku do stejné tabulky jako formulář a konfigurátor,
   včetně celého přepisu, aby zákazník nic neopakoval.

Zábrany, které musí zůstat:

- Žádné závazné ceny ani termíny, vždy orientačně a s odkazem na konfigurátor.
- Nikdy si nedomýšlet povolení, základy ani technické parametry.
- Když si bot není jistý, předá Dana. Radši méně odpovědí než jedna špatná.

## Právní část

- V hlavičce je „Automatický poradce". Slovo automatický tam musí zůstat, u chatbotů to
  vyžadují evropská pravidla o AI a je to i slušnost. Zelené kolečko vedle něj znamená
  „odpovídá hned", ne že u toho sedí člověk. Kdyby tam mělo být napsané Online, začne to
  slibovat živého člověka a to je jiný slib.
- Jakmile v chatu padne telefon nebo mail, jsou to osobní údaje. Řádek o zpracování s odkazem
  je nad polem pro psaní, ale chce to odstavec v `zasady-ochrany-soukromi.html` a rozhodnout,
  jak dlouho přepisy držet.

## Otevřené k rozhodnutí

- Fotky na kartách jsou dvě z výroby a jedna renderovaná, vedle sebe nedrží jednotný styl.
  V malém to v chatu tolik nevadí, ale čisté to není.
- Jestli poradce otevírat sám po několika vteřinách, nebo nechat čekat na kliknutí.
  Samootevírání zvyšuje použití a zároveň otravuje.
