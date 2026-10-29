import { json, chranene, nastaveni, ulozNastaveni, pridejZpravu } from './_sanon.js';

async function importPoptavek(env) {
  const od = Number(await nastaveni(env, 'posledni_poptavka')) || 0;
  const { results } = await env.DB.prepare('SELECT * FROM poptavky WHERE id > ? ORDER BY id LIMIT 50').bind(od).all();
  for (const p of results) {
    const email = (p.email || '').trim().toLowerCase();
    let zak = null;
    if (email) zak = await env.DB.prepare('SELECT id FROM s_zakaznici WHERE lower(email) = ?').bind(email).first();
    if (!zak && p.telefon) zak = await env.DB.prepare("SELECT id FROM s_zakaznici WHERE replace(telefon, ' ', '') = ?").bind(p.telefon.replace(/\s/g, '')).first();
    let konf = null;
    try { konf = p.konfigurace ? JSON.parse(p.konfigurace) : null; } catch {}
    const web = { model: p.model || (konf && konf.model) || '', cena: p.cena || null, km: konf && (konf.km || konf.vzdalenost) || null };
    if (!zak) {
      const r = await env.DB.prepare('INSERT INTO s_zakaznici (vzniklo, jmeno, telefon, email, misto, stav, majitel, web, poptavka_id) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)')
        .bind(p.vzniklo, p.jmeno, p.telefon || '', email, (konf && (konf.misto || konf.obec)) || '', 'novy', JSON.stringify(web), p.id).run();
      zak = { id: r.meta.last_row_id };
    }
    const popis = p.typ === 'konfigurace' ? 'Poptávka z konfigurátoru' : p.typ === 'poradce' ? 'Kontakt z poradce na webu' : 'Poptávka z formuláře';
    const cast = [];
    if (web.model) cast.push(web.model);
    if (web.cena) cast.push(Number(web.cena).toLocaleString('cs-CZ') + ' Kč bez DPH');
    if (web.km) cast.push(web.km + ' km z Prahy');
    await pridejZpravu(env, { kdy: p.vzniklo, zak_id: zak.id, typ: 'web', text: popis + (cast.length ? ': ' + cast.join(', ') : '') + (p.zprava ? '. Napsal: „' + p.zprava.trim() + '“' : ''), nove: 1 });
    await ulozNastaveni(env, 'posledni_poptavka', String(p.id));
  }
  return results.length;
}

export const onRequestGet = chranene(async ({ env, kdo }) => {
  await importPoptavek(env);
  const [zak, dod, zpr, pri, zkz] = await Promise.all([
    env.DB.prepare('SELECT * FROM s_zakaznici ORDER BY id').all(),
    env.DB.prepare('SELECT * FROM s_dodavatele ORDER BY id').all(),
    env.DB.prepare("SELECT id, kdy, zak_id, dod_id, typ, kdo, text, predmet, vysledek, prilohy, gmail_id, thread_id, nove FROM s_zpravy WHERE typ != 'skip' AND (zak_id IS NOT NULL OR dod_id IS NOT NULL) ORDER BY kdy DESC LIMIT 3000").all(),
    env.DB.prepare('SELECT * FROM s_pripominky WHERE hotovo_kdy IS NULL ORDER BY kdy').all(),
    env.DB.prepare('SELECT * FROM s_zakazky ORDER BY id').all()
  ]);
  const parse = s => { try { return s ? JSON.parse(s) : null; } catch { return null; } };
  return json(200, {
    kdo,
    zakaznici: zak.results.map(z => ({ ...z, web: parse(z.web) })),
    dodavatele: dod.results,
    zpravy: zpr.results.map(m => ({ ...m, prilohy: parse(m.prilohy) || [], nove: !!m.nove })),
    pripominky: pri.results,
    zakazky: zkz.results,
    google: !!(env.GOOGLE_REFRESH_TOKEN),
    claude: !!env.ANTHROPIC_API_KEY,
    whisper: !!env.OPENAI_API_KEY
  });
});
