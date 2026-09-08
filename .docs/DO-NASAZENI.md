# Homepage: co chybí do nasazení

Stav k 8. 9. 2026 večer. Vzniklo z otázky „chybí tam moc věcí, ale nevím jaké“.
Seřazeno podle toho, co brání nasazení. Živý web je pořád starý `index.html` z commitu
`2276961`, tohle všechno žije jen lokálně.

## A. Bez tohohle to nasadit nejde

1. **3D sekce ukazuje pohyb, který dům nedělá.** „Takhle se ten dům neotvírá.“
   Buď opravit fold v `assets/flexi-3d.js`, nebo sekci vyhodit, nebo ji zmrazit
   na jednom stavu bez animace. Podrobnosti v `podklady-3d/STAV-3D.md`.

2. ~~**Newsletter slibuje něco, co web neumí.**~~ **HOTOVO 8. 9. 2026, commit `9e5252d`.**
   Migrace proběhla na ostré D1 (tabulka `newsletter` tam je), `/api/newsletter`
   i `/api/odhlasit` a stránka `/odhlasit` jsou nasazené a ověřené naostro celým kolečkem:
   přihlášení, kontrola řádku v D1, odhlášení přes živou stránku, kontrola příznaku,
   úklid testovacího řádku. Tabulka je zase prázdná.

   **Zbývá k tomu dvojí:** rozmyslet double opt-in (dnes se adresa uloží rovnou)
   a napsat samotný odesílač, aby do každého e-mailu dával odkaz
   `https://flexihouse.cz/odhlasit?kod=<odhlasovaci_kod>`. Bez toho je kód v databázi
   k ničemu.

3. **Vizualizace v pásu se showroomem není označená.** Katalog má štítek „Vizualizace“
   dvakrát, homepage nově nulakrát, protože se odstranil při zjednodušení pásu.
   Je to AI render domu na louce a stojí vedle věty, že ten dům stojí na Sokolovské,
   kde ve skutečnosti stojí na šotolině u silnice. Buď štítek vrátit, nebo změnit text.

4. **Poptávkový formulář na homepage nebyl vyzkoušený naostro.** Obsluhu jsem doplnil dnes
   (dřív žádná nebyla a odeslání by jen přeneslo stránku), ověřená je ale jen validace.
   Skutečné odeslání na `/api/send-lead` z homepage nikdo neposlal. Před nasazením jedna
   testovací poptávka a kontrola, že dorazí mail i záznam v adminu.

5. **Váha stránky se změnila.** `assets/flexi-3d.js` je 118 kB a textury k němu 883 kB.
   Zakládá se až přes IntersectionObserver, ale jakmile člověk doscrolluje, stáhne se to.
   Na nejnavštěvovanější stránce to chce změřit Lighthousem, ne odhadnout. Součet všech
   variant obrázků na stránce je dnes 2 084 kB.

## B. Obsah, který na stránce chybí

6. **Kroky a záměry jsou pořád slabé sekce.** Seznam a taby s odstavcem, ne artefakt.
   Tomášovo hodnocení „mid ass sekce“ na ně sedí dál.

7. **Zmizelo „Co dům umí“.** Živá homepage má sekci se šesti plusy a filmový pás,
   nová nemá ani jedno a nic je nenahradilo.

8. **Cena je na homepage jen jako „od 400 000 Kč“ na kartě.** Je to první otázka
   každého návštěvníka a stránka na ni odpovídá jedním číslem bez kontextu.

9. **Na homepage nejsou časté dotazy** ani strukturovaná data FAQPage.

## C. Rozhodnutí, která nejsou moje

10. **Cena „od“: 400 000, nebo 410 000?** Elektroinstalace za 10 000 je v konfigurátoru
    povinná, takže nejlevnější sestava vyjde na 410 000. Rozhodne Dan, pak se opraví
    i `_audit/konzistence.py`.

11. **Flexi Office: 70 000, nebo 100 000?** `/caste-dotazy`, báze poradce i Google profil
    říkají 70 000, `/flexi-office` a `/katalog` říkají 100 000, obojí i ve strukturovaných
    datech. Viz `.docs/OTEVRENE-OTAZKY.md` bod 16.

12. **Barevný akcent.** Celý web běží ve dvou odstínech šedomodré, značka nemá akcent.

## Jak to vrátit, kdyby bylo potřeba

    git checkout index.html && rm assets/domov.css

Původní podoba je i v `_ulozene-navrhy/homepage-2026-09-08/`.
