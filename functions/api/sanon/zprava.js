import { json, chranene, telo, ted, pridejZpravu } from './_sanon.js';

const VYSLEDKY = ['zajem', 'nezvedl', 'zavolat', 'nezajem'];

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  if (!d.zak_id && !d.dod_id) return json(400, { error: 'Chybí zákazník.' });
  if (!['pozn', 'hovor'].includes(d.typ)) return json(400, { error: 'Neznámý typ.' });
  const id = await pridejZpravu(env, {
    kdy: ted(), zak_id: d.zak_id || null, dod_id: d.dod_id || null, typ: d.typ, kdo,
    text: String(d.text || '').trim(), vysledek: d.typ === 'hovor' && VYSLEDKY.includes(d.vysledek) ? d.vysledek : null,
    prilohy: Array.isArray(d.prilohy) ? d.prilohy : []
  });
  if (d.typ === 'hovor' && d.zak_id) {
    const z = await env.DB.prepare('SELECT stav, majitel FROM s_zakaznici WHERE id = ?').bind(d.zak_id).first();
    if (z && z.stav === 'novy') await env.DB.prepare("UPDATE s_zakaznici SET stav = 'jednani' WHERE id = ?").bind(d.zak_id).run();
    if (z && !z.majitel) await env.DB.prepare('UPDATE s_zakaznici SET majitel = ? WHERE id = ?').bind(kdo, d.zak_id).run();
  }
  return json(200, { id });
});

export const onRequestPatch = chranene(async ({ request, env }) => {
  const d = await telo(request);
  if (d.precteno) {
    if (d.zak_id) await env.DB.prepare('UPDATE s_zpravy SET nove = 0 WHERE zak_id = ?').bind(d.zak_id).run();
    if (d.dod_id) await env.DB.prepare('UPDATE s_zpravy SET nove = 0 WHERE dod_id = ?').bind(d.dod_id).run();
  }
  return json(200, { ok: true });
});
