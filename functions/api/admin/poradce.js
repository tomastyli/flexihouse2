import { verifyToken, getCookie, maDb } from '../_uloz.js';

export async function onRequestGet({ request, env }) {
  if (!await verifyToken(env, getCookie(request, 'fh_admin'))) {
    return json(401, { error: 'Nepřihlášeno.' });
  }
  if (!maDb(env)) {
    return json(500, { error: 'Databáze není připojená.' });
  }

  const url = new URL(request.url);
  const relace = url.searchParams.get('relace');

  try {
    if (relace) {
      const { results } = await env.DB.prepare(
        'SELECT role, text, vzniklo FROM poradce_zpravy WHERE relace = ? ORDER BY id LIMIT 100'
      ).bind(relace.slice(0, 64)).all();
      return json(200, { ok: true, relace, zpravy: results || [] });
    }

    const { results } = await env.DB.prepare(
      "SELECT relace, MIN(vzniklo) AS zacatek, MAX(vzniklo) AS konec, COUNT(*) AS zprav, " +
      "MIN(CASE WHEN role = 'user' THEN text END) AS prvni " +
      'FROM poradce_zpravy GROUP BY relace ORDER BY konec DESC LIMIT 100'
    ).all();

    const konverzace = results || [];
    const ted = Date.now();
    const den = 86400000;
    const od = (dni) => konverzace.filter(k => ted - Date.parse(k.konec) <= dni * den).length;

    return json(200, {
      ok: true,
      konverzace,
      souhrn: {
        celkem: konverzace.length,
        za7dni: od(7),
        za30dni: od(30),
        zprav: konverzace.reduce((n, k) => n + k.zprav, 0)
      }
    });
  } catch (e) {
    console.error('nacteni konverzaci selhalo:', e);
    return json(500, { error: 'Konverzace se nepodařilo načíst.' });
  }
}

export async function onRequest() {
  return json(405, { error: 'Nepodporovaná metoda.' });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
