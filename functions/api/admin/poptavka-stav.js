import { verifyToken, getCookie, maDb } from '../_uloz.js';

export async function onRequestPost({ request, env }) {
  if (!await verifyToken(env, getCookie(request, 'fh_admin'))) {
    return json(401, { error: 'Nepřihlášeno.' });
  }
  if (!maDb(env)) return json(500, { error: 'Databáze není připojená.' });

  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Neplatný požadavek.' });
  }

  const id = Number(data.id);
  if (!Number.isInteger(id) || id <= 0) return json(400, { error: 'Chybí id poptávky.' });
  const vyrizeno = data.vyrizeno ? 1 : 0;

  try {
    const r = await env.DB.prepare(
      'UPDATE poptavky SET vyrizeno = ?, vyrizeno_kdy = ? WHERE id = ?'
    ).bind(vyrizeno, vyrizeno ? new Date().toISOString() : null, id).run();

    // D1 vrací počet změněných řádků. Bez téhle kontroly by se tvářilo jako úspěch
    // i přepnutí poptávky, která neexistuje.
    const zmeneno = r.meta ? r.meta.changes : null;
    if (zmeneno === 0) return json(404, { error: 'Taková poptávka tu není.' });

    return json(200, { ok: true, id, vyrizeno });
  } catch (e) {
    console.error('zmena stavu selhala:', e);
    return json(500, { error: 'Stav se nepodařilo uložit.' });
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
