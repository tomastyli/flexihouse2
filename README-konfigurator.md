# Konfigurátor Mini House — dokumentace

## Soubory
| Soubor | Co dělá |
|---|---|
| `index.html` | Upravená úvodní stránka — přepsaný Hero, foto-ready sloty, CTA míří do konfigurátoru. |
| `konfigurator.html` | Krokový konfigurátor (stepper). Funguje pro `?model=mini` (výchozí), `?model=family`, `?model=office`. |
| `functions/api/send-konfigurace.js` | Backend (Cloudflare Pages Function) — odešle poptávku přes Resend nám i zákazníkovi. |
| `email-template-preview.html` | Náhled obou e-mailů v prohlížeči (ukázková data). |

## ⚠️ Ceny jsou ORIENTAČNÍ
Všechna data a ceny jsou v JS objektu **`MODELS`** v `konfigurator.html` (hledej `const MODELS = {`).
Uprav čísla u `price:`. `price: 0` = „v základní ceně". Doplň reálné hodnoty z vlastního ceníku.

## Nasazení Resendu (Cloudflare Pages)
1. Web nasaď na **Cloudflare Pages** (soubor ve `functions/api/` se automaticky stane endpointem `/api/send-konfigurace`).
2. V Resend.com **ověř doménu** (flexihouse.cz) a vytvoř API klíč.
3. V Cloudflare Pages → **Settings → Environment variables** přidej:
   ```
   RESEND_API_KEY = re_xxxxxxxxxxxx
   LEAD_TO_EMAIL  = dandaprokes@gmail.com
   RESEND_FROM    = Flexi House <poptavky@flexihouse.cz>
   ```
   > Doména v `RESEND_FROM` musí být v Resend ověřená. Pro rychlý test lze dočasně použít `onboarding@resend.dev`.
4. API klíč **nikdy není na frontendu** — žije jen v env proměnné na serveru.

> Pozn.: Stejný vzor používá i původní formulář `/api/send-lead` z homepage — pokud ho ještě nemáš nasazený, vytvoř obdobnou funkci `functions/api/send-lead.js`.

## Lokální náhled
```bash
node .claude/serve.js   # http://localhost:4599/konfigurator.html?model=mini
```
(Odesílání e-mailu lokálně vrátí chybu — endpoint běží až na Cloudflare. PDF a celý průchod fungují i lokálně.)

## Co konfigurátor umí
- 5 kroků s progress barem, validace (nelze dál bez výběru u povinných skupin).
- Živý souhrn + orientační cena vpravo (přepočet při každé volbě).
- Rekapitulace + kontaktní formulář.
- **Stáhnout PDF** (html2pdf.js přes CDN) — čistý světlý layout konfigurace.
- **Odeslat poptávku** → JSON na `/api/send-konfigurace` → Resend pošle e-mail nám i zákazníkovi.
