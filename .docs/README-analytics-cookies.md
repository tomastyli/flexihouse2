# Cookies, Google Analytics, Search Console & Meta Pixel

Cookie lišta a napojení na měřicí nástroje jsou připravené — stačí doplnit reálná ID.
Vše běží přes sdílený soubor [`assets/cookies.js`](assets/cookies.js) a používá
**Google Consent Mode v2** (výchozí stav = odmítnuto, dokud návštěvník nepotvrdí souhlas).

## 1. Google Analytics 4 + Meta Pixel
Otevři [`assets/cookies.js`](assets/cookies.js) a nahraď placeholdery v `CONFIG`:

```js
var CONFIG = {
  gaId: 'G-XXXXXXXXXX',           // ← Measurement ID z GA4
  metaPixelId: 'XXXXXXXXXXXXXXX'  // ← Pixel ID z Meta Events Manageru
};
```

- Dokud je v ID `XXXX`, žádný externí skript se nenačte (lišta i tak funguje).
- Po doplnění se **GA4** načte jen po souhlasu s *Analytické* cookies,
  **Meta Pixel** jen po souhlasu s *Marketingové* cookies.
- GA4 běží s `anonymize_ip` a v režimu Consent Mode (denied → granted dle souhlasu).

## 2. Google Search Console
GSC se neověřuje skriptem, ale **meta tagem v `<head>`**. Do hlavičky každé
stránky (nebo aspoň `index.html`) vlož ověřovací tag z GSC:

```html
<meta name="google-site-verification" content="TVŮJ_OVĚŘOVACÍ_KÓD" />
```

Alternativně lze ověřit přes DNS záznam domény (v GSC zvolíš „Doména").
Po ověření nahraj do GSC i [`sitemap.xml`](sitemap.xml).

## 3. Kde se lišta zobrazuje
Skript `assets/cookies.js` je vložen na: `index.html`, `katalog.html`,
`flexi-office.html`, `konfigurator.html`.

Odkaz **„Nastavení cookies"** v patičce kdykoli znovu otevře lištu
(volá `window.openCookieSettings()`).

## 4. Souhlas se ukládá
Volba se ukládá do `localStorage` pod klíčem `fh_cookie_consent`.
Pro otestování lišty znovu ji smažeš v konzoli:

```js
localStorage.removeItem('fh_cookie_consent')
```

## 5. GA4 se načítá jen na ostré doméně (od 6. 9. 2026)
`loadGA()` v `assets/cookies.js` končí bez efektu, pokud `location.hostname`
není `flexihouse.cz` ani `www.flexihouse.cz`. Lišta, Consent Mode i `window.gtag`
fungují všude, ale z localhostu ani z `*.pages.dev` už se do GA4 nic neodešle.

Důvod: v datech za srpen 2026 seděly stránky `/konfigurator.html` a `/poptavka.html`
(27 zobrazení, 3 uživatelé) a událost `test_mereni_debug`. Při 168 uživatelích
za 28 dní to výsledky posouvalo. Filtr interního provozu v GA4 tohle neřeší,
protože se váže na IP adresy, ne na prostředí.

Po úspěšném načtení GA vystřelí `cookies.js` na `document` událost `fh:ga`.

## 6. Události, které web posílá
Sdílené (`assets/flexi.js`, na všech stránkách, spouští se kliknutím na odkaz):
`contact_phone`, `contact_email`, `configurator_start`, `lead_form_open`.

**Pozor na výklad `configurator_start`:** posílá se při kliknutí na odkaz vedoucí
do konfigurátoru, ne při práci v něm. Kdo přijde na `/konfigurator` rovnou
z Googlu, tuhle událost nevystřelí. Skutečný vstup do konfigurátoru měří
`configurator_step` s `krok: 1`.

Konfigurátor (`konfigurator.html`):

| událost | kdy | parametry |
|---|---|---|
| `configurator_step` | první dosažení každého kroku, včetně kroku 1 při načtení | `krok` 1–5, `nazev`, `model` |
| `configurator_engage` | první vlastní volba návštěvníka (ne přednastavené) | `model` |
| `configurator_skip_to_form` | klik na „Přeskočit rovnou na nezávaznou poptávku“ | `z_kroku`, `vysledek` (`formular` / `chybi_volba`) |
| `download_pdf` | po úspěšném vygenerování PDF | `form`, `cena` |
| `save_configuration` | po uložení sestavy pod kódem FH-XXXXXX | `form`, `cena` |
| `generate_lead` | po přijetí poptávky z formuláře v konfigurátoru | `form`, `value` |

Formulář na `/poptavka` posílá `generate_lead` s `form: 'poptavka'`,
chatový poradce s `form: 'poradce'`.

### Fronta událostí
`cookies.js` je v `konfigurator.html` nalinkovaný **až za** inline skriptem
konfigurátoru, takže při načtení stránky `window.gtag` ještě neexistuje.
Konfigurátor proto události řadí do fronty (`gaFronta`) a vypustí je do
`dataLayer` teprve, až se v něm objeví `config`. Bez toho by se událost
`configurator_step` s krokem 1 vždycky ztratila.

## 7. Klíčová událost v GA4
V property „Prodej Modulárních domů" (`a396425494p539798859`) je od 6. 9. 2026
jako klíčová událost označená **`generate_lead`**. Do té doby byly označené
`close_convert_lead` a `qualify_lead`, které web nikdy neposílal, a proto
GA4 hlásilo nula konverzí ve všech kanálech. Obě byly odznačeny.

GA4 nikdy neuvidí všechny poptávky, protože měří jen návštěvníky se souhlasem.
Pravdivý počet je v D1 v tabulce `poptavky` a v `/admin`.

## 8. Vlastní dimenze (bez nich je trychtýř nečitelný)
Parametry událostí jsou v přehledech GA4 skryté, dokud se nezaregistrují jako
vlastní dimenze. Bez toho přehled ukáže jen „`configurator_step`: 10 událostí"
a rozpad na kroky 1 až 5 se nikde nezobrazí. Registrováno 6. 9. 2026
v Administrátor → Zobrazení dat → Vlastní definice:

| dimenze | parametr | k čemu |
|---|---|---|
| Krok konfigurátoru | `krok` | rozpad trychtýře na kroky 1 až 5 |
| Zdroj formuláře | `form` | která cesta přinesla poptávku (poptávka / konfigurátor / poradce) |
| Výsledek přeskočení | `vysledek` | jestli přeskočení dovedlo na formulář, nebo na chybějící volbu |
| Stránka kontaktu | `location` | z jaké stránky vzešel klik na telefon nebo mail |

**Nejsou zpětné.** Události poslané před registrací dimenzi v přehledech
nemají. Když přibude nový parametr, který se má dát číst, musí se
zaregistrovat hned, ne až se nasbírají data.

Rozpad se čte v **Prozkoumat → Volný formulář**: dimenze „Krok konfigurátoru",
metrika „Počet událostí", filtr Název události = `configurator_step`.
