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
`mini-house.html`, `flexi-family.html`, `flexi-office.html`, `konfigurator.html`.

Odkaz **„Nastavení cookies"** v patičce kdykoli znovu otevře lištu
(volá `window.openCookieSettings()`).

## 4. Souhlas se ukládá
Volba se ukládá do `localStorage` pod klíčem `fh_cookie_consent`.
Pro otestování lišty znovu ji smažeš v konzoli:

```js
localStorage.removeItem('fh_cookie_consent')
```
