import { json, chranene, telo, sysZprava, LIDE } from './_sanon.js';
import { udalosti, zalozUdalost, smazUdalost, OSOBY } from './_google.js';
import { JMENA } from './_claude.js';

const TZ = 'Europe/Prague';
const kdoZEmailu = e => Object.keys(OSOBY).find(k => OSOBY[k].email === String(e || '').toLowerCase());

function posun(den, cas, minut) {
  const [r, m, d] = den.split('-').map(Number);
  const [h, mi] = cas.split(':').map(Number);
  const x = new Date(Date.UTC(r, m - 1, d, h, mi + minut));
  return x.toISOString().slice(0, 19);
}

const bezOpravneni = e => / 403 /.test(e.message) && /insufficient|scope|PERMISSION|disabled|has not been used/i.test(e.message);

export const onRequestGet = chranene(async ({ request, env }) => {
  if (!env.GOOGLE_REFRESH_TOKEN) return json(200, { udalosti: [], napojeno: false });
  const u = new URL(request.url);
  const od = u.searchParams.get('od') || new Date(Date.now() - 86400000).toISOString();
  const doKdy = u.searchParams.get('do') || new Date(Date.now() + 42 * 86400000).toISOString();
  try {
    const items = await udalosti(env, od, doKdy);
    return json(200, {
      napojeno: true,
      udalosti: items.filter(x => x.status !== 'cancelled' && !(x.extendedProperties && x.extendedProperties.private && x.extendedProperties.private.sanon_typ === 'pripominka')).map(x => {
        const p = (x.extendedProperties && x.extendedProperties.private) || {};
        return {
          id: x.id, nazev: x.summary || '(bez názvu)', misto: x.location || '',
          zacatek: x.start.dateTime || x.start.date, konec: x.end.dateTime || x.end.date, celyDen: !!x.start.date,
          zak_id: p.sanon_zak ? Number(p.sanon_zak) : null, zalozil: p.sanon_kdo || null,
          kdo: (x.attendees || []).map(a => kdoZEmailu(a.email)).filter(Boolean),
          odkaz: x.htmlLink
        };
      })
    });
  } catch (e) {
    if (bezOpravneni(e)) return json(200, { udalosti: [], napojeno: false });
    throw e;
  }
});

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const nazev = String(d.nazev || '').trim();
  const den = String(d.den || '');
  const cas = String(d.cas || '');
  const minut = Math.max(15, Math.min(600, Number(d.minut) || 60));
  if (!nazev) return json(400, { error: 'Chybí, co se děje.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(den)) return json(400, { error: 'Chybí den.' });
  if (cas && !/^\d{2}:\d{2}$/.test(cas)) return json(400, { error: 'Špatný čas.' });
  const lide = (Array.isArray(d.kdo) ? d.kdo : []).filter(k => LIDE.includes(k));
  const z = d.zak_id ? await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(d.zak_id).first() : null;
  const popis = [
    z ? `Zákazník: ${z.jmeno}${z.telefon ? ', ' + z.telefon : ''}${z.email ? ', ' + z.email : ''}` : '',
    String(d.popis || '').trim(),
    z ? `V Šanonu: https://flexihouse.cz/sanon#z${z.id}` : '',
    `Naplánoval ${OSOBY[kdo] && kdo !== 'tomas' ? OSOBY[kdo].jmeno : 'Šanon'}`
  ].filter(Boolean).join('\n\n');
  const konecDen = posun(den, '00:00', 1440).slice(0, 10);
  const u = {
    summary: nazev + (z && !nazev.includes(z.jmeno) ? ` (${z.jmeno})` : ''),
    location: String(d.misto || (z && z.misto) || '').trim() || undefined,
    description: popis,
    start: cas ? { dateTime: `${den}T${cas}:00`, timeZone: TZ } : { date: den },
    end: cas ? { dateTime: posun(den, cas, minut), timeZone: TZ } : { date: konecDen },
    attendees: lide.map(k => ({ email: OSOBY[k].email })),
    reminders: { useDefault: false, overrides: cas ? [{ method: 'popup', minutes: 30 }] : [{ method: 'popup', minutes: 540 }] },
    extendedProperties: { private: { sanon_typ: 'schuzka', sanon_kdo: kdo, ...(z ? { sanon_zak: String(z.id) } : {}) } }
  };
  let r;
  try { r = await zalozUdalost(env, u, true); }
  catch (e) { if (bezOpravneni(e)) return json(409, { error: 'Kalendář ještě není napojený.' }); throw e; }
  if (z) {
    const [, mm, dd] = den.split('-').map(Number);
    await sysZprava(env, z.id, kdo, `naplánoval <b>${nazev.replace(/[<>&]/g, '')}</b> na ${dd}. ${mm}.${cas ? ' v ' + Number(cas.slice(0, 2)) + ':' + cas.slice(3) : ''}${lide.length ? ', jde ' + lide.map(k => JMENA[k]).join(' a ') : ''}`);
  }
  return json(200, { id: r.id });
});

export const onRequestDelete = chranene(async ({ request, env }) => {
  const d = await telo(request);
  if (!d.id) return json(400, { error: 'Chybí událost.' });
  await smazUdalost(env, String(d.id), true);
  return json(200, { ok: true });
});
