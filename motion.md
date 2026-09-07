# Motion pravidla — Flexi House

Jazyk pohybu pro celý web. Vlož na začátek každé práce s animacemi a odkazuj se na tokeny níže
místo vymýšlení nových hodnot.

## Charakter pohybu

Flexi House staví usazené modulární domy. Pohyb na webu má být stejný: klidný, těžký, dotažený
do konce. Nic neposkakuje, nic nepruží, nic nerotuje. Prvek dosedne a zůstane.

Praktický důsledek: krátká dráha, doběh bez zákmitu, žádný bounce ani elastic easing.

Reveal sekcí jede na **40 px a 520 ms** (mobil 28 px a 420 ms). Původní hodnoty 24 px a 420 ms
Tomáš 7. 9. 2026 zamítl slovy „vubec je nevidim“ — při běžné rychlosti scrollu se pohyb rozmaže
a oko ho nezachytí. Strop 24 px z původního znění tím padá. Nahoru se dál nejde bez důvodu:
nad zhruba 48 px začne sekce viditelně plachtit a čte se to jako efekt, ne jako dosednutí.

## Čtyři role

Každá animace musí jít obhájit jednou z těchto rolí. Když ji neobhájíš, nepřidávej ji.

| Role | Otázka uživatele | Příklad na webu |
|---|---|---|
| Pozornost | Kde mám začít? | Nic. Hero se nikdy neskrývá, viz zákazy. |
| Interakce | Co tady můžu udělat? | Hover a focus na tlačítkách, kartách, dekorech v konfigurátoru |
| Příběh | Kam mám pokračovat? | Reveal sekcí na dlouhých obsahových stránkách |
| Atmosféra | Jaká je tahle firma? | `pin-drop` u mapy, tečky u videa, doběh přepnutí dekoru |

Role atmosféra je legitimní a nemusí být měřitelná. Je to ta část, která odlišuje web od šablony.
Podléhá ale stejným pravidlům jako zbytek: krátká, na `transform` a `opacity`, s vypínačem
pro `prefers-reduced-motion`. Atmosféra není licence na parallax.

## Tokeny

Patří do `:root` v `assets/flexi.css`. Web je dnes má rozeseté jako magické hodnoty
(`.18s`, `.2s`, `.25s`, `.34s`), sjednotit na tohle:

```css
:root{
  --dur-micro:180ms;
  --dur-base:260ms;
  --dur-slow:420ms;
  --dur-reveal:520ms;
  --ease-out:cubic-bezier(.2,.7,.3,1);
  --ease-in:cubic-bezier(.4,0,1,1);
  --ease-both:cubic-bezier(.4,0,.2,1);
  --lift:40px;
  --stagger:70ms;
}
```

- `--dur-micro` pro hover, focus, změnu barvy, přepnutí stavu ovládacího prvku.
- `--dur-base` pro otevření modálu a přepnutí dekoru v konfigurátoru.
- `--dur-slow` pro přechod Zvenku/Uvnitř ve 3D a pro reveal na mobilu. Nikde jinde.
- `--dur-reveal` jen pro reveal sekcí na desktopu. Je to jediná hodnota nad 420 ms na webu
  a je tam schválně, aby byl pohyb vidět.
- `--ease-out` na vstupy a doběhy, `--ease-in` na mizení, `--ease-both` na obousměrné přepínače.
- `--lift` je dráha reveal posunu, na mobilu 28 px. Přenastavuje se v media query,
  ne natvrdo v pravidle.
- Stagger max 4 prvky, zbytek skupiny naskočí s posledním.

Obě existující křivky v CSS (`.2,.7,.3,1` a `.4,0,.2,1`) zůstávají, jen dostanou jméno.
Třetí vlastní křivku nezavádět.

## Co se animuje

- Hover a focus na všem klikacím: tlačítka, karty produktů, odkazy v navigaci, dlaždice dekorů,
  kroky konfigurátoru.
- Sekce na dlouhých obsahových stránkách (`celorocni-bydleni`, `glamping`, `jak-to-probiha`,
  `caste-dotazy`, `doprava-a-montaz`, `cena`) při vstupu do viewportu, jednou.
- Stavové změny v konfigurátoru: přepnutí dekoru, přepnutí Zvenku/Uvnitř, posun mezi kroky,
  přepočet ceny. Tady pohyb nese informaci „tohle se právě změnilo" a je nejvíc potřeba.
- Otevření a zavření chatového poradce, mobilního menu, modálů.
- Drobnosti s rolí atmosféra, které už na webu jsou a fungují: `pin-drop` u mapy, `film-tecka`
  u videa. Nové přidávat střídmě, maximálně jednu na stránku.

## Co se neanimuje

- **Hero na homepage a na produktových stránkách.** Nadpis, podtitulek, hlavní fotka i primární
  CTA jsou viditelné okamžitě. Hero fotka je LCP prvek a skrývat ho přes `opacity:0` znamená
  posunout si LCP na stránce, kam vede placený provoz. Když má mít hero pohyb, animuj doprovodné
  prvky okolo už viditelného nadpisu, ne nadpis sám.
- Body text, odstavce, seznamy, tabulky parametrů, ceník.
- Navigace a patička.
- Cokoliv, co mění layout. Jen `transform` a `opacity`, žádná `height`, `width`, `top`, `margin`.
- Obrázky v kartách samostatně. Karta je jeden celek.
- Nadpis sekce zvlášť od obsahu sekce. Sekce je jeden celek.

## Zákazy

Tohle na webu nebude, ani když o to zadání nepřímo říká:

- Parallax, pinování, horizontální scroll, scroll-jacking.
- Reveal na každé sekci homepage. Homepage je krátká a rychlá, obsah je vidět hned.
- Animované pozadí, plovoucí tvary, rotující ikony, pulzující CTA, glow efekty.
- Číselníky, které se „napočítávají" po scrollu.
- `will-change` plošně pro jistotu.
- Knihovna kvůli animacím. Web je statický, CSS transitions plus jeden `IntersectionObserver`
  pokryjí všechno výše. Motion, GSAP ani AOS se sem netahají.

## Technická pravidla

1. Animovat pouze `opacity` a `transform`.
2. Hover efekty jen uvnitř `@media (hover:hover) and (pointer:fine)`. Na dotyku místo nich
   `:active` s `scale(.98)`.
3. `:focus-visible` má vlastní viditelný stav a nikdy nemizí. `outline` se nemaže bez náhrady.
4. `prefers-reduced-motion: reduce` vypíná reveal i atmosférické animace a nechává jen změny
   barev. Pravidlo patří ke každé nové animaci hned, ne dodatečně.
5. Scroll reveal se spouští jednou. Nastavení observeru: `threshold: 0`,
   `rootMargin: 0px 0px -12% 0px`, po odkrytí `unobserve`. Threshold nula místo podílu proto,
   že vysoká sekce by zadaného podílu nikdy nedosáhla a zůstala by skrytá.
6. **Obsah nesmí být závislý na JS.** Výchozí stav je viditelný, skrytí zapíná až třída
   `js-reveal`, kterou přidává inline skript v `<head>`. Bez JS, při chybě skriptu i pro
   crawler je stránka celá čitelná.
7. Nic nad ohybem se neskrývá. Sekce, která na běžném desktopu zasahuje nad ohyb, třídu
   `fh-rv` nedostává vůbec. Jako pojistka pro jiné výšky okna, pro vstup s kotvou a pro
   obnovení pozice po reloadu dostane `bez-prechodu` a odkryje se skokem všechno, co se
   odkrývá dřív, než uživatel poprvé sáhne na kolečko, dotyk, klávesnici nebo ukazatel.
   Vázat to na první průchod observeru ani na `load` nestačí: Chrome obnovuje pozici
   scrollu až po nich, takže sekce, na které uživatel přistál, by se prolnula pod ním.
8. Fokus nikdy nesmí skončit ve skryté sekci. Klávesnice se dostane do obsahu dřív než
   scroll, takže `focusin` uvnitř `fh-rv` sekci odkryje okamžitě a bez přechodu.
9. Na mobilu (< 768 px): stagger vypnout, reveal na `--dur-slow` a 28 px, atmosférické
   animace nechat jen tam, kde nestojí výkon.
10. Nikdy víc než jedna běžící animace v jednom viewportu.

## Šablona pro zadání jedné animace

```
Přidej animaci podle motion.md.

CO se hýbe: [konkrétní selektor nebo komponenta]
KDY: [načtení / hover / focus / vstup do viewportu / změna stavu]
PROČ: role [pozornost / interakce / příběh / atmosféra], uživateli to říká "[věta]"

Z: [opacity 0, translateY(var(--lift))]
Do: [opacity 1, translateY(0)]
Duration: [token]
Easing: [token]
Stagger: [token nebo žádný]

Omezení:
- Nic jiného v této sekci se nehýbe.
- Výchozí stav v CSS je viditelný, skrývá až `js-reveal`.
- Mobil: [zjednodušit / vypnout / stejné]
- prefers-reduced-motion: koncový stav okamžitě.
```

## Vyplněný příklad

```
Přidej animaci podle motion.md.

CO se hýbe: sekce na stránce glamping.html od druhé sekce dolů
KDY: když je sekce z 20 % ve viewportu, jednou
PROČ: role příběh, uživateli to říká "Pokračuj dál, tohle patří k sobě."

Z: opacity 0, translateY(var(--lift))
Do: opacity 1, translateY(0)
Duration: var(--dur-reveal)
Easing: var(--ease-out)
Stagger: žádný, sekce je jeden celek

Omezení:
- První sekce a cokoliv nad ohybem se neanimuje.
- Nadpis se animuje spolu se sekcí, ne zvlášť.
- Výchozí stav v CSS je viditelný, skrývá až js-reveal.
- Mobil: duration var(--dur-slow), posun 28px.
- prefers-reduced-motion: sekce viditelné okamžitě.
```

## Když je toho moc

Prompt na revizi, když se rozhýbe víc, než mělo:

```
Projdi všechny animace na webu a u každé odpověz: jakou má roli podle motion.md
(pozornost / interakce / příběh / atmosféra) a co uživateli říká. Když jasnou odpověď
nemáš, animaci odstraň.

Nech: hover a focus na klikacím, jeden reveal na sekci obsahových stránek, stavové změny
v konfigurátoru, existující pin-drop a film-tecka.

Zruš: cokoliv nad ohybem, animace na body textu, parallax, animované pozadí, stagger
přes 4 prvky, cokoliv s duration nad 420 ms kromě reveal sekcí, magické hodnoty mimo tokeny.

Vrať seznam: co jsi odstranil a proč, co jsi nechal a jakou to má roli.
```

## Jak je to zapojené

- `assets/flexi.css`: tokeny v `:root`, na konci souboru třídy `.fh-rv`, `.je-videt`,
  `.bez-prechodu` a větev pro `prefers-reduced-motion`.
- `assets/flexi.js`: poslední blok. Bez `IntersectionObserver` nebo při zapnutém
  `prefers-reduced-motion` odkryje všechno naráz. Hlídá `wheel`, `touchstart`, `keydown`
  a `pointerdown` (příznak `hnul`) a `focusin`.
- `<head>` stránky: `<script>document.documentElement.className+=" js-reveal"</script>`
  hned za `viewport` meta tagem.
- Sekce dostávají `class="... fh-rv"`. Hero a první sekce pod ním ji nedostávají.
- Nasazeno na: `celorocni-bydleni`, `glamping`, `jak-to-probiha`, `doprava-a-montaz`, `cena`.
  Homepage, produktové stránky a `caste-dotazy` reveal nemají.
- Po zásahu do `flexi.css` nebo `flexi.js` bumpni `?v=` ve všech HTML, `/assets/*` má
  `immutable` cache na rok.

## Kontrola před nasazením

- [ ] Žádná nová hodnota mimo tokeny v `:root`
- [ ] Hero a nic nad ohybem se neskrývá
- [ ] Stránka je celá čitelná s vypnutým JS
- [ ] `prefers-reduced-motion` otestované, ne jen napsané
- [ ] Na mobilu doběhne dřív, než tam uživatel doscrolluje
- [ ] `:focus-visible` viditelné klávesnicí na všem klikacím
- [ ] PageSpeed na dotčené stránce neklesl
