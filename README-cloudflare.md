# Nastavení Cloudflare Pages — aby formuláře fungovaly

Formuláře (homepage i konfigurátor) posílají e-maily přes **Resend** pomocí
serverových funkcí ve složce `functions/`. Na Cloudflare Pages stačí nastavit
pár proměnných prostředí — kód už je hotový.

## 1. Jak fungují funkce (nic nenastavuješ)
Cloudflare Pages složku `functions/` nasadí automaticky jako API:
- `functions/api/send-lead.js`        → `POST /api/send-lead`        (formulář na homepage)
- `functions/api/send-konfigurace.js` → `POST /api/send-konfigurace` (konfigurátor)

Žádné routy ani konfiguraci nepřidáváš — Pages to napojí samo podle názvu souborů.

## 2. Proměnné prostředí (tady se to nastavuje) ⚙️
V Cloudflare dashboardu:

**Workers & Pages → (tvůj projekt) → Settings → Variables and Secrets → Environment variables**

Přidej tyto tři proměnné (doporučeně jako **Secret**) pro **Production** i **Preview**:

| Název (Variable name) | Hodnota (Value) | Pozn. |
|---|---|---|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxxxxxx` | Tvůj API klíč z Resend (máš ho) |
| `LEAD_TO_EMAIL`  | `dandaprokes@gmail.com` | Kam mají chodit poptávky |
| `RESEND_FROM`    | `Flexi House <poptavky@flexihouse.cz>` | Odesílatel — doména musí být v Resend ověřená (viz bod 3) |

> ⚠️ **Po uložení proměnných musíš spustit nový deploy** (Deployments → … →
> Retry deployment, nebo nový push). Proměnné se načtou až do nové verze.

## 3. Ověření domény v Resend (jednorázově)
Aby Resend e-maily odeslal z `@flexihouse.cz`, musí být doména ověřená:

1. V Resend → **Domains → Add Domain** → zadej `flexihouse.cz`.
2. Resend vypíše **DNS záznamy** (SPF, DKIM, příp. DMARC).
3. Tyto záznamy přidej v Cloudflare: **(doména) → DNS → Records → Add record**
   (přesně podle hodnot z Resend, typy TXT/CNAME).
4. V Resend klikni **Verify**. Po ověření můžeš v `RESEND_FROM` použít
   libovolnou adresu na téhle doméně (např. `poptavky@flexihouse.cz`).

**Rychlý test bez ověřené domény:** dočasně nastav
`RESEND_FROM = onboarding@resend.dev`. V testovacím režimu ale Resend doručí
jen na e-mail, kterým ses do Resend registroval — pro ostrý provoz proto
doménu ověř.

## 4. Build nastavení projektu (pro statický web)
**Settings → Builds & deployments:**
- **Framework preset:** None
- **Build command:** *(nech prázdné)*
- **Build output directory:** `/`

## 5. 404 stránka (nic nenastavuješ)
Cloudflare Pages automaticky servíruje `404.html` z rootu pro neexistující
adresy. Soubor už existuje.

## 6. Google Analytics (nic v Cloudflare)
GA běží na straně prohlížeče přes cookie lištu (`assets/cookies.js`, ID
`G-B9WNLFF5FR`). Načte se až po souhlasu návštěvníka — v Cloudflare nic
nenastavuješ, jen nasaď web.

---

### Rychlý checklist
- [ ] `RESEND_API_KEY`, `LEAD_TO_EMAIL`, `RESEND_FROM` přidané (Production + Preview)
- [ ] Doména `flexihouse.cz` ověřená v Resend (DNS záznamy v Cloudflare)
- [ ] Spuštěný nový deploy po přidání proměnných
- [ ] Test: odeslat poptávku z webu → přijde e-mail na `LEAD_TO_EMAIL`
