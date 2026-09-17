# Předání ze session „Flexihouse konfigurator kvalita“

Session `806e27fe` běží od 9. 9. 2026 a **není mrtvá, jen pomalá**: 13. 9. ve 22:10
dokončila tah, který trval 19 minut a 26 sekund. Transkript má 371 MB a 6 584 zpráv,
z toho 57 % jsou base64 obrázky, a celý se veze v každém dalším requestu.
Leží v
`~/.claude/projects/-Users-tomastylich-Desktop-Projekty/806e27fe-7150-475a-9f07-49a678fc4c99.jsonl`.

V této složce:

- `PREDANI.md` (tento soubor): co se ví a co zbývá
- `interier-a-otaceni.md`: rozpracovaná otázka, na které se to zaseklo
- `souhrny.md`: 4 souhrny, které si session psala sama při compactu
- `prepis.md`: úplný přepis, 6 586 zápisů, bez obrázků

## Stav

**Nic z toho není nasazené.** V repu leží **378 nezacommitovaných změn**,
poslední commit `a3948a7`. Deploy = push do `main`, Cloudflare Pages `flexihouse2`,
a čeká se na Tomášovo slovo.

Hotové a k proklikání na `localhost:4599`:

- Předrenderovaná otočka domu venku: 20 fasád × 2 střechy × 24 úhlů, **1 920 snímků,
  62 MB** ve `img/otocka/`. Render doběhl 13. 9. v 8:58 bez chyby.
- Animované hero na `/rozkladaci-dum` s tažením, scrub lištou a vlastním kurzorem
  (`assets/hero-otocka.js` v12, dvě velikostní úrovně).
- Interiér konfigurátoru: 6 míst, 44 kombinací, 3,2 MB velká verze a 1,3 MB malá.
- Živé 3D je z konfigurátoru pryč, ušetřeno 787 kB rendereru.

Tomášova poslední pochvala: *„jo tohle uz vypada solidne“*.
Pak ale přišlo, že **uvnitř se nedá otáčet**, a na tom to stojí. Viz `interier-a-otaceni.md`.

## Změřená fakta, která se nemají zjišťovat znovu

**Paměť prohlížeče je strop, ne disk.** Dekódovaná bitmapa stojí š × v × 4 bajty.
24 snímků 2400×1500 = 345 MB na kombinaci a jede to. 36 snímků 3840×1600 = 844 MB
a prohlížeč začne vyhazovat a znovu dekódovat, což **je** to blikání textur.
Retina úroveň 3840 se kvůli tomu stavěla a zase rušila. **Strop je 2400.**

**Čas renderu roste s pixely, ne se vzorky** (v pásmu 96 až 128):
4,9 s @1200×750, 11,1 s @1800×1125, 13,1 s @2400×1000, 20,8 s @2400×1500.

**Lossless je špatná páka.** q76 proti lossless je 0,7 % RMSE, ale 21 kB proti 685 kB
na snímek. Viditelná vada byla ve skutečnosti zvětšování na 105 %, ne komprese.
Spravilo se to `aspect-ratio: 1.6` na scéně, zvětšení kleslo z +54 % na +29 %.

**Rozsvítit dům stojí věrnost barev, rozsvítit studio ne.** Lampy na dům:
+4 kolize odstínů fasád, −12 bodů sytosti. Jas pozadí: +1 kolize, −3 body.
Zamčené nastavení sady je v `_3d-zdroj/sada-otocek.mjs`:
`HERO_EXPOZICE 0.15`, `HERO_LOOK 'AgX - Punchy'`, `HERO_POZADI 'seda'`,
`HERO_PROTI 2.5`, `HERO_VYPLN 6`, `HERO_AMBIENT 0.45`, `HERO_CELNI 5`.

**Plná předrenderovaná sada všech kombinací je neproveditelná:**
2 560 kombinací × 16 až 36 úhlů = 41 000 až 92 000 snímků = 5 až 11 dní.
Proto ta omezená katalogová sada.

**Na tmavé fasádě je albedo textura fyzikálně k ničemu** (tint 0,14 × skoro bílá
textura = plocha). Struktura musí přijít z geometrie nebo drsnosti. Spáry jako
geometrie daly +16 % ve 3 000px heru, ale jen 819 změněných pixelů v živém viewportu,
protože 11mm spára je zhruba 1 px.

### Blender a Cycles, pasti

- `light.diffuse_factor` a `specular_factor` jsou **jen pro EEVEE**, Cycles je tiše
  ignoruje. V Cycles se to dělá viditelností paprsků na objektu
  (`visible_diffuse`, `visible_glossy`).
- Cycles v Blenderu 5.2 **ignoruje `use_backface_culling`**, detektor děr se musí
  emulovat v shaderu.
- `HERO_OTOCKA=N` vyrenderuje N snímků v jedné session Blenderu, ušetří to ~35 %.
- Světla se v otočce otáčejí s kamerou, jinak je dům zepředu černý.

### Konkurence, změřeno

**modulos.cz není 3D**: 2D canvas, `webgl: false`, 35 předrenderovaných WebP, ~1,2 MB,
nula voleb. **Žádná velká automobilka nejede real-time 3D**: Mercedes, BMW, Tesla,
Volvo, Audi CZ a VW posílají serverem vyrenderované obrázky, „360“ u BMW je krpano
s ne-WebGL canvasem a 36 obrázky. Audi DE a Porsche streamují pixely přes WebRTC.

## Čeká to na Tomáše

1. **Nasadit, nebo ne.** 378 změn, nic nenasazeno, nic se nenasadí bez slova.
2. **Šedé studio proti modrobílému webu.** Tomáš řekl *„ta seda je tuff pusobi to na
   me expensive“*, ale nikdy neodpověděl, jestli sedí ke zbytku webu. Souvisí s
   přebarvením scény konfigurátoru z `#3b5c68`.
3. **Cena zábradlí.** V ceníku vůbec není, a přitom je vidět v heru, takže web ukazuje
   něco neobjednatelného.
4. **Cena lamelového obkladu.** V konfigurátoru má `price: 0` a „Cena na vyžádání“.
5. **Bílá jako výchozí fasáda?** Otevřelo by to na 422 600 místo 399 000, protože bílá
   existuje jen jako placený dekor.
6. **Barvy interiéru.** Požadavky jsou sepsané v `.docs/OTEVRENE-OTAZKY.md`.
7. **11,7 GB PNG** v `~/Desktop/fh-otocka` a `~/Desktop/fh-otocka-2400`. Zdrojové
   rendery, webp z nich už je vyrobený. Smazat může jen Tomáš.
8. **Schody:** při `LIFT 0.15` vyjde jeden schod, na fotce postaveného domu jsou dva.
   Buď dům zvednout, nebo přidat sokl, který Tomáš nechce.

## Rozdělaná architektura

Tomáš řekl: *„on ten konfigurator bude mit vic domu casem takze /konfigurator bude
jakoby picker podobne jak katalog“*. Zjištěno, že **půlka už stojí**:

- `konfigurator.html:211` čte `?model=` s fallbackem na `flexihouse`
- `/konfigurator` už všechny čtyři domy jmenuje, ale odkazuje je na produktové stránky,
  ne na `?model=`
- `assets/flexi-konfig-data.js` má v `MODELS` jen `flexihouse`

Otevřené k rozhodnutí: překryv `/konfigurator` jako pickeru s existujícím `/katalog`,
a fakt, že každý další model potřebuje ručně postavený 3D model (žádný neexistuje)
a vlastní sadu renderů. Pro kontejnery, Flexi Office ani bistro model není.

Předrenderovaná sada zatím žije **jen v náhledu** `_nahled-konfigurator.html`.
Ostrý `/konfigurator` pořád jede na živém Three.js.

## Na čem se ta session spálila

Stojí za přečtení, protože to jsou opakované vzorce:

- **Tichá no-op úprava.** Několik změn ve `blender-hero.py` se nikdy nezapsalo, protože
  se nahrazoval text, který už po dřívější úpravě neexistoval, a nikdo to neověřil.
  Střecha zůstávala bílá na hodnotě 206 bez ohledu na ladění. Pravidlo je teď v
  `_3d-zdroj/README.md`: **každé nahrazení textu ověřit assertem nebo výpisem řádku.**
- **Falešné „ověřeno funguje“.** Tažení v heru nefungovalo, protože ho polykal neviditelný
  `.kv__platno`. Předchozí ověření bylo falešné, protože se syntetické události posílaly
  přímo na element a obcházely hit-testing.
- **Opakovaně špatně vzorkovaný výřez** při měření (měřilo se pozadí místo stěny).
  Spraví to nakreslit obdélník výřezu do obrázku a podívat se, než se číslu uvěří.
- **Podagent doporučil nesprávnou opravu** (prý špatná normálová mapa u fasád).
  Změřením směru gradientu se ukázalo, že tvrzení je nepravdivé, a neaplikovalo se.
- **Odmítnuté ztmavení `fasada-tz-201.webp`**, aby se odlišil Šedý obklad od Betonově
  šedé. Textura měřila rgb(103,106,112) proti vzorníku rgb(105,109,114), tedy věrně.
  Zfalšovat by znamenalo ukázat barvu, kterou produkt nemá.
