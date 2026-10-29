import { json, chranene, telo, sysZprava } from './_sanon.js';

const KROKY = { zaloha: 'Záloha zaplacená', objednano: 'Objednáno', more: 'Na cestě', praha: 'Ve skladu Praha', pozemek: 'Příprava pozemku', predano: 'Předáno' };

export const onRequestPatch = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const zk = await env.DB.prepare('SELECT * FROM s_zakazky WHERE id = ?').bind(d.id).first();
  if (!zk) return json(404, { error: 'Zakázka neexistuje.' });
  if (d.krok && KROKY[d.krok] && d.krok !== zk.krok) {
    await env.DB.prepare('UPDATE s_zakazky SET krok = ? WHERE id = ?').bind(d.krok, zk.id).run();
    await sysZprava(env, zk.zak_id, kdo, 'posunul zakázku na <b>' + KROKY[d.krok] + '</b>' + (d.kontejner ? ', kontejner ' + d.kontejner : ''));
    if (d.krok === 'predano') await env.DB.prepare("UPDATE s_zakaznici SET stav = 'predano' WHERE id = ?").bind(zk.zak_id).run();
  }
  for (const pole of ['kontejner', 'predani', 'model']) {
    if (typeof d[pole] === 'string') await env.DB.prepare(`UPDATE s_zakazky SET ${pole} = ? WHERE id = ?`).bind(d[pole].trim(), zk.id).run();
  }
  return json(200, { ok: true });
});
