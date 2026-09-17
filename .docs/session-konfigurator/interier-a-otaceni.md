# Konfigurátor, vnitřek domu: kde to stojí

Zapsáno 13. 9. 2026 ve 22:05 z transkriptu session „Flexihouse konfigurator kvalita“,
doplněno ve 22:12 o měření, které ta session mezitím dokončila.
Nic z toho není nasazené, všechno žije jen na localhostu.

## Co je hotové

Přepínač **Zvenku / Uvnitř** jede na předrenderovaných snímcích v obou polohách.
Venku otočka, uvnitř jeden pevný pohled na vybrané místo.

- Živé 3D je z konfigurátoru **pryč**. Stránka nestáhne 787 kB rendereru ani nic z WebGL.
- Interiér má 6 míst (obývák, kuchyň, chodba, ložnice 1, ložnice 2, koupelna).
- Všech **44 dosažitelných kombinací má svůj soubor**, na žádné zaškrtnutí nevyskočí prázdno.
  `img/interier` 3,2 MB (velká verze), `img/interier-s` 1,3 MB (malá).
- Generuje to `_3d-zdroj/sada-interier.mjs`, kamery jsou přepsané z `src/blok-E-kamera.js`.

Náhled: `http://localhost:4599/konfigurator` (server na 4599 ještě běží, PID 57246).

## Co je špatně a proč se to řešilo

Tomášova připomínka: **uvnitř se nedá otáčet.** Jeden pevný pohled na místo udělal
z prohlídky galerii obrázků. Změřené cesty ven:

| cesta | čas renderu | nový kód |
|---|---|---|
| víc úhlů na místo (5 natočení) | 220 renderů, ~7 hodin | žádný, widget to umí |
| víc úhlů na místo (8 natočení) | ~9 hodin | žádný |
| **panorama na místo** | **44 renderů, 1 h 6 min** (89 s/render) | malý WebGL prohlížeč, ~1 h práce |

Doporučení z té session: **panorama**. Sedmkrát levnější na render a plynulé,
chová se jako Street View. Three.js zpátky netahat, napsat ručně, bude to pár kilobajtů.

Ověřeno na zkušebním renderu: výřezy spočítané stejnou matematikou jako prohlížeč
mají **rovné čáry rovné**, projekce se narovná i u okraje. Dvě známé slabiny:

- Vlevo je prázdná stěna, na kraji záběru je bílý roh. Dá se zúžit výsek ze 180 na ~140 °.
- Nahoru a dolů se dívat nedá, výseč je svisle úzká. Vyšší render = dražší čas.

## Poslední Tomášova věta, na kterou už nikdo neodpověděl

> „nebo ty 360 nějak nejdou vyrenderovat prostě že by tam byly pointy na podlaze
> a na ty by se klikalo když by se někdo chtěl podívat ja fakt nevím“

Tedy: plné 360° panorama + klikací body na podlaze pro přechod mezi místy.
**Změřeno 13. 9. ve 22:10**, tedy až po sepsání zbytku tohoto souboru:

- **plné 360 ve 4800 × 2400: 244 s na snímek**, celá sada 44 kombinací = **3 hodiny**
- pro srovnání 180° výsek: 89 s na snímek, celá sada = **1 h 5 min**

Plné 360 tedy stojí necelý trojnásobek času proti výseku. Pořád je to zlomek těch
sedmi hodin, které by sežralo pět natočení na místo. Klikací body na podlaze pro
přechod mezi místy jsou proti tomu jen kód, render se kvůli nim nemění.

## Otevřené, netýká se interiéru

Do `rozkladaci-dum.html` sáhla mezitím jiná session a přestavěla sekce
(`pl`, `holy`, `vyhody`, `kcta`, `claim`, `klid`, `dotazy`, `zaver`, `poptat`
místo `pr-blok`). Hero s otočkou přežilo, ale `_audit/produkt-preset.py` hlásí
**dvě odchylky**: chybí výřez v CTA a referenční slot nemá půdorys ani tabulku.
Musí se rozhodnout, jestli se opraví stránka, nebo preset.

## Pozor při navazování

V repu je **378 nezacommitovaných změn**. Poslední commit je `a3948a7`.
Před jakoukoli prací projít `git status`, ne commitovat naslepo.
