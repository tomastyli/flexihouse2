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

---

## 7. Databáze poptávek a přehled na `/admin`

Poptávky se ukládají do Cloudflare D1 **ještě předtím**, než se je pokusíme
poslat mailem. Když Resend selže, poptávka se neztratí a v přehledu je
označená jako neodeslaná.

**Databáze** (už existuje, region EEUR):
- název `flexihouse`, id `345c6cf5-c0f4-4c5a-980f-4926a66e8890`
- schéma je v `.docs/schema.sql`

**Co nastavit v Cloudflare Pages** (Settings → Bindings a Variables):
- D1 binding: název proměnné `DB` → databáze `flexihouse` (Production i Preview)
- Secret `ADMIN_PASSWORD` — heslo do přehledu
- Secret `ADMIN_SECRET` — náhodný řetězec, kterým se podepisuje přihlašovací cookie

Bez těchto tří věcí web běží dál normálně, jen se poptávky neukládají
a `/admin` hlásí, že databáze není připojená.

**Místní vývoj:**
- `.dev.vars` obsahuje `ADMIN_PASSWORD` a `ADMIN_SECRET` (mimo git)
- `.docs/wrangler-dev.toml` je konfigurace jen pro místní běh (mimo git),
  aby Pages na produkci nezačal číst konfiguraci ze souboru místo z dashboardu
- spuštění: `npx wrangler pages dev . --d1 DB=flexihouse --port 8788`
- schéma do místní databáze: soubor `.sqlite` najdeš ve
  `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/` a naliješ do něj
  `.docs/schema.sql` přes `sqlite3`

### Checklist pro přehled poptávek
- [ ] D1 binding `DB` přidaný (Production + Preview)
- [ ] `ADMIN_PASSWORD` a `ADMIN_SECRET` přidané jako secrets
- [ ] Schéma nalité do ostré databáze (`wrangler d1 execute flexihouse --remote --file=.docs/schema.sql`)
- [ ] Test: odeslat poptávku → objeví se na `/admin`
