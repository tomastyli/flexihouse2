import { json, chranene, telo, ted, sysZprava, LIDE, nastaveni, ulozNastaveni } from './_sanon.js';

const STAVY = ['novy', 'jednani', 'nabidka', 'zakazka', 'predano', 'ztraceno'];
const NAZVY = { novy: 'Nový', jednani: 'V jednání', nabidka: 'Nabídka poslaná', zakazka: 'Zakázka', predano: 'Předáno', ztraceno: 'Ztraceno' };
const JMENA = { dan: 'Dan', honza: 'Honza', tomas: 'Tomáš' };

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const jmeno = String(d.jmeno || '').trim();
  if (!jmeno) return json(400, { error: 'Chybí jméno.' });
  const r = await env.DB.prepare('INSERT INTO s_zakaznici (vzniklo, jmeno, telefon, email, misto, stav, majitel) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(ted(), jmeno, String(d.telefon || '').trim(), String(d.email || '').trim().toLowerCase(), String(d.misto || '').trim(), 'novy', d.majitel === null ? null : kdo).run();
  return json(200, { id: r.meta.last_row_id });
});

export const onRequestPatch = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const z = await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(d.id).first();
  if (!z) return json(404, { error: 'Zákazník neexistuje.' });
  const zmeny = [];
  if (d.stav && STAVY.includes(d.stav) && d.stav !== z.stav) {
    await env.DB.prepare('UPDATE s_zakaznici SET stav = ? WHERE id = ?').bind(d.stav, z.id).run();
    await sysZprava(env, z.id, kdo, 'změnil stav na <b>' + NAZVY[d.stav] + '</b>');
    if (d.stav === 'zakazka') {
      const ex = await env.DB.prepare('SELECT id FROM s_zakazky WHERE zak_id = ?').bind(z.id).first();
      if (!ex) {
        let model = 'Flexi';
        try { model = (JSON.parse(z.web || '{}').model) || model; } catch {}
        await env.DB.prepare('INSERT INTO s_zakazky (zak_id, model, krok, kontejner, predani) VALUES (?, ?, ?, ?, ?)').bind(z.id, model, 'zaloha', '', 'domluvit').run();
        zmeny.push('zakazka');
      }
    }
  }
  if ('majitel' in d && (d.majitel === null || LIDE.includes(d.majitel)) && d.majitel !== z.majitel) {
    await env.DB.prepare('UPDATE s_zakaznici SET majitel = ? WHERE id = ?').bind(d.majitel, z.id).run();
    await sysZprava(env, z.id, kdo, d.majitel === kdo && !z.majitel ? 'si vzal poptávku' : d.majitel ? 'předal zákazníka <b>' + JMENA[d.majitel] + '</b>' : 'zrušil majitele');
  }
  if (d.na_dodavatele) {
    const r = await env.DB.prepare('INSERT INTO s_dodavatele (nazev, co, kontakt, email, telefon) VALUES (?, ?, ?, ?, ?)').bind(z.jmeno, String(d.co || '').trim(), '', z.email || '', z.telefon || '').run();
    const did = r.meta.last_row_id;
    await env.DB.prepare('UPDATE s_zpravy SET dod_id = ?, zak_id = NULL WHERE zak_id = ?').bind(did, z.id).run();
    await env.DB.prepare('UPDATE s_pripominky SET dod_id = ?, zak_id = NULL WHERE zak_id = ?').bind(did, z.id).run();
    await env.DB.prepare('DELETE FROM s_zakazky WHERE zak_id = ?').bind(z.id).run();
    await env.DB.prepare('DELETE FROM s_zakaznici WHERE id = ?').bind(z.id).run();
    return json(200, { ok: true, dod_id: did });
  }
  for (const pole of ['telefon', 'email', 'misto', 'jmeno']) {
    if (typeof d[pole] === 'string' && d[pole].trim() !== (z[pole] || '')) {
      await env.DB.prepare(`UPDATE s_zakaznici SET ${pole} = ? WHERE id = ?`).bind(pole === 'email' ? d[pole].trim().toLowerCase() : d[pole].trim(), z.id).run();
    }
  }
  return json(200, { ok: true, zmeny });
});

export const onRequestDelete = chranene(async ({ request, env }) => {
  const d = await telo(request);
  const z = await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(d.id).first();
  if (!z) return json(404, { error: 'Zákazník neexistuje.' });
  if (z.email) {
    const ign = JSON.parse((await nastaveni(env, 'ignorovat')) || '[]');
    const klic = d.cela_domena ? '@' + z.email.split('@')[1] : z.email;
    if (!ign.includes(klic)) ign.push(klic);
    await ulozNastaveni(env, 'ignorovat', JSON.stringify(ign));
  }
  await env.DB.prepare('UPDATE s_zpravy SET zak_id = NULL, nove = 0 WHERE zak_id = ?').bind(z.id).run();
  await env.DB.prepare('DELETE FROM s_pripominky WHERE zak_id = ?').bind(z.id).run();
  await env.DB.prepare('DELETE FROM s_zakazky WHERE zak_id = ?').bind(z.id).run();
  await env.DB.prepare('DELETE FROM s_zakaznici WHERE id = ?').bind(z.id).run();
  return json(200, { ok: true });
});
