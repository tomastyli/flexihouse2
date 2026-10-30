import { json, chranene, telo, ted, LIDE } from './_sanon.js';
import { zalozUdalost, smazUdalost, OSOBY } from './_google.js';

async function doKalendare(env, id, komu, kdy, text, zak_id) {
  if (!env.GOOGLE_REFRESH_TOKEN || !OSOBY[komu]) return;
  const z = zak_id ? await env.DB.prepare('SELECT id, jmeno, telefon FROM s_zakaznici WHERE id = ?').bind(zak_id).first() : null;
  try {
    const r = await zalozUdalost(env, {
      summary: text + (z ? ` (${z.jmeno})` : ''),
      description: [z && z.telefon ? `Telefon: ${z.telefon}` : '', z ? `V Šanonu: https://flexihouse.cz/sanon#z${z.id}` : 'Připomínka ze Šanonu'].filter(Boolean).join('\n'),
      start: { dateTime: kdy, timeZone: 'Europe/Prague' },
      end: { dateTime: new Date(Date.parse(kdy) + 15 * 60000).toISOString(), timeZone: 'Europe/Prague' },
      attendees: [{ email: OSOBY[komu].email }],
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 0 }] },
      extendedProperties: { private: { sanon_typ: 'pripominka', sanon_pri: String(id), ...(z ? { sanon_zak: String(z.id) } : {}) } }
    }, true);
    await env.DB.prepare('UPDATE s_pripominky SET gcal_id = ? WHERE id = ?').bind(r.id, id).run();
  } catch {}
}

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const text = String(d.text || '').trim();
  if (!text) return json(400, { error: 'Chybí text.' });
  const komu = LIDE.includes(d.komu) ? d.komu : kdo;
  const kdy = d.kdy && !isNaN(Date.parse(d.kdy)) ? new Date(d.kdy).toISOString() : new Date(Date.now() + 86400000).toISOString();
  const r = await env.DB.prepare('INSERT INTO s_pripominky (vzniklo, komu, kdy, text, zak_id, dod_id) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(ted(), komu, kdy, text, d.zak_id || null, d.dod_id || null).run();
  await doKalendare(env, r.meta.last_row_id, komu, kdy, text, d.zak_id || null);
  return json(200, { id: r.meta.last_row_id });
});

export const onRequestPatch = chranene(async ({ request, env }) => {
  const d = await telo(request);
  if (d.hotovo) {
    await env.DB.prepare('UPDATE s_pripominky SET hotovo_kdy = ? WHERE id = ?').bind(ted(), d.id).run();
    const p = await env.DB.prepare('SELECT gcal_id, kdy FROM s_pripominky WHERE id = ?').bind(d.id).first();
    if (p && p.gcal_id && Date.parse(p.kdy) > Date.now()) { try { await smazUdalost(env, p.gcal_id, true); } catch {} }
  }
  return json(200, { ok: true });
});
