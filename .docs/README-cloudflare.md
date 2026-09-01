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

**Nastaveno 1. 9. 2026 (Production):** D1 binding `DB` → `flexihouse`,
secrets `ADMIN_PASSWORD` a `ADMIN_SECRET`. Preview záměrně bez bindingu,
aby testovací nasazení nepsala do ostrých poptávek.

Bez těchto tří věcí by web běžel dál normálně, jen by se poptávky
neukládaly a `/admin` by hlásil, že databáze není připojená.

**Binding jde nastavit i bez dashboardu**, přes Cloudflare API (wrangler
sám na to příkaz nemá). Token se dá vytáhnout z `~/.wrangler/config/default.toml`:

```
curl -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  --data '{"deployment_configs":{"production":{"d1_databases":{"DB":{"id":"345c6cf5-c0f4-4c5a-980f-4926a66e8890"}}}}}' \
  https://api.cloudflare.com/client/v4/accounts/3d2387ff6d1be6ec4a82d28b306b42bb/pages/projects/flexihouse2
```

PATCH na `env_vars` posílat vždy s **celou** sadou proměnných, ne jen s
novými. Před zásahem si stáhnout GET stejné adresy jako zálohu.

**Místní vývoj:**
- `.dev.vars` obsahuje `ADMIN_PASSWORD` a `ADMIN_SECRET` (mimo git)
- `.docs/wrangler-dev.toml` je konfigurace jen pro místní běh (mimo git),
  aby Pages na produkci nezačal číst konfiguraci ze souboru místo z dashboardu
- spuštění: `npx wrangler pages dev . --d1 DB=flexihouse --port 8788`
- schéma do místní databáze: soubor `.sqlite` najdeš ve
  `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/` a naliješ do něj
  `.docs/schema.sql` přes `sqlite3`

### Checklist pro přehled poptávek
- [x] D1 binding `DB` přidaný (Production; Preview vědomě ne)
- [x] `ADMIN_PASSWORD` a `ADMIN_SECRET` přidané jako secrets
- [x] Schéma nalité do ostré databáze (`wrangler d1 execute flexihouse --remote --file=.docs/schema.sql`)
- [x] Nasazeno 1. 9. 2026, commit `71ae006`. Ověřeno naostro: `/admin` odpovídá,
      špatné heslo 401, správné 200, přehled čte z ostré D1.
- [ ] Test s reálným odesláním poptávky přes web (pošle mail na `LEAD_TO_EMAIL`,
      takže až po domluvě s Danem)

**Poznámka k RESEND_API_KEY:** je v Pages uložený jako `plain_text`, ne jako
secret, takže je v dashboardu čitelný. Přepnout na secret při nejbližší
příležitosti.
