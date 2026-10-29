import { json, chranene, nastaveni, ulozNastaveni } from './_sanon.js';
import { claude } from './_claude.js';

const TESTOVACI = /\btest\b|zkou[sš]ka|nevolat|example\.com/i;

async function skryj(env, z) {
  if (z.email) {
    const ign = JSON.parse((await nastaveni(env, 'ignorovat')) || '[]');
    if (!ign.includes(z.email)) ign.push(z.email);
    await ulozNastaveni(env, 'ignorovat', JSON.stringify(ign));
  }
  await env.DB.prepare('UPDATE s_zpravy SET zak_id = NULL, nove = 0 WHERE zak_id = ?').bind(z.id).run();
  await env.DB.prepare('DELETE FROM s_pripominky WHERE zak_id = ?').bind(z.id).run();
  await env.DB.prepare('DELETE FROM s_zakaznici WHERE id = ?').bind(z.id).run();
}

async function naDodavatele(env, z, co) {
  const r = await env.DB.prepare('INSERT INTO s_dodavatele (nazev, co, kontakt, email, telefon) VALUES (?, ?, ?, ?, ?)').bind(z.jmeno, co || '', '', z.email || '', z.telefon || '').run();
  await env.DB.prepare('UPDATE s_zpravy SET dod_id = ?, zak_id = NULL WHERE zak_id = ?').bind(r.meta.last_row_id, z.id).run();
  await env.DB.prepare('DELETE FROM s_zakaznici WHERE id = ?').bind(z.id).run();
}

export const onRequestPost = chranene(async ({ env }) => {
  const { results } = await env.DB.prepare("SELECT * FROM s_zakaznici WHERE majitel IS NULL AND stav = 'novy' ORDER BY id").all();
  const vysledky = [];
  let zpracovano = 0, hotove = 0;
  for (const z of results) {
    if (zpracovano >= 6) break;
    if (TESTOVACI.test(z.jmeno + ' ' + z.email)) { await skryj(env, z); vysledky.push([z.jmeno, 'test']); zpracovano++; continue; }
    if (!env.ANTHROPIC_API_KEY) continue;
    const uz = await nastaveni(env, 'uklid_' + z.id);
    if (uz) { hotove++; continue; }
    const zp = await env.DB.prepare('SELECT typ, predmet, text FROM s_zpravy WHERE zak_id = ? ORDER BY kdy LIMIT 3').bind(z.id).all();
    const ukazka = zp.results.map(m => `${m.typ === 'web' ? 'POPTÁVKA Z WEBU' : 'MAIL'}: ${m.predmet || ''}\n${(m.text || '').slice(0, 500)}`).join('\n---\n');
    let typ = 'zakaznik', co = '';
    try {
      const { data } = await claude(env, {
        max_tokens: 80, json: true,
        system: 'Flexi House dodává modulové domy (Flexi Stanza, Tenuta, Office) zájemcům o bydlení, chatu, kancelář nebo glamping. Posuď záznam v jejich CRM a rozhodni: "zakaznik" = člověk nebo firma, která se ptá na dům, cenu, dodání, chce koupit; "dodavatel" = výrobce, spedice, jeřáb, doprava, řemeslník, kdo pro Flexi House něco dodává nebo nabízí spolupráci na dodávce; "ostatni" = nabídky marketingu, SEO, reklamy, bazarové inzeráty, newslettery, notifikace, úřady, banky, náborové maily, testy, cokoli, co není zákazník ani dodavatel. Poptávka z webového formuláře je skoro vždy zakaznik. Vrať POUZE JSON {"typ":"zakaznik|dodavatel|ostatni","co":"u dodavatele 2 až 4 slova co dodává, jinak prázdné"}.',
        messages: [{ role: 'user', content: `Jméno: ${z.jmeno}\nE-mail: ${z.email || ''}\nTelefon: ${z.telefon || ''}\n\n${ukazka || '(žádné zprávy)'}` }]
      });
      if (['zakaznik', 'dodavatel', 'ostatni'].includes(data.typ)) typ = data.typ;
      co = String(data.co || '').slice(0, 60);
    } catch (e) {
      vysledky.push([z.jmeno, 'chyba: ' + e.message.slice(0, 60)]);
      continue;
    }
    if (typ === 'ostatni') await skryj(env, z);
    else if (typ === 'dodavatel') await naDodavatele(env, z, co);
    else await ulozNastaveni(env, 'uklid_' + z.id, '1');
    vysledky.push([z.jmeno, typ + (co ? ' (' + co + ')' : '')]);
    zpracovano++;
  }
  return json(200, { zpracovano, zbyva: Math.max(0, results.length - zpracovano - hotove), vysledky, celkem: results.length });
});
