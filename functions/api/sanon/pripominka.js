import { json, chranene, telo, ted, LIDE } from './_sanon.js';

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const text = String(d.text || '').trim();
  if (!text) return json(400, { error: 'Chybí text.' });
  const komu = LIDE.includes(d.komu) ? d.komu : kdo;
  const kdy = d.kdy && !isNaN(Date.parse(d.kdy)) ? new Date(d.kdy).toISOString() : new Date(Date.now() + 86400000).toISOString();
  const r = await env.DB.prepare('INSERT INTO s_pripominky (vzniklo, komu, kdy, text, zak_id, dod_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(ted(), komu, kdy, text, d.zak_id || null, d.dod_id || null).run();
  return json(200, { id: r.meta.last_row_id });
});

export const onRequestPatch = chranene(async ({ request, env }) => {
  const d = await telo(request);
  if (d.hotovo) await env.DB.prepare('UPDATE s_pripominky SET hotovo_kdy = ? WHERE id = ?').bind(ted(), d.id).run();
  return json(200, { ok: true });
});
