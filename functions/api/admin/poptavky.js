import { verifyToken, getCookie, maDb } from '../_uloz.js';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestGet({ request, env }) {
  if (!await verifyToken(env, getCookie(request, 'fh_admin'))) {
    return json(401, { error: 'Nepřihlášeno.' });
  }
  if (!maDb(env)) {
    return json(500, { error: 'Databáze není připojená. Zkontrolujte propojení DB v nastavení Cloudflare Pages.' });
  }

  try {
    const { results } = await env.DB.prepare(
      'SELECT id, vzniklo, typ, jmeno, email, telefon, model, zprava, konfigurace, cena, zdroj, mail_odeslan, mail_chyba ' +
      'FROM poptavky ORDER BY vzniklo DESC LIMIT 500'
    ).all();

    const ted = Date.now();
    const den = 86400000;
    const poptavky = results || [];
    const od = (dni) => poptavky.filter(p => ted - Date.parse(p.vzniklo) <= dni * den).length;

    return json(200, {
      ok: true,
      poptavky,
      souhrn: {
        celkem: poptavky.length,
        za7dni: od(7),
        za30dni: od(30),
        formular: poptavky.filter(p => p.typ === 'formular').length,
        konfigurator: poptavky.filter(p => p.typ === 'konfigurator').length,
        poradce: poptavky.filter(p => p.typ === 'poradce').length,
        nedorucene: poptavky.filter(p => !p.mail_odeslan).length
      }
    });
  } catch (e) {
    console.error('nacteni poptavek selhalo:', e);
    return json(500, { error: 'Poptávky se nepodařilo načíst.' });
  }
}

export async function onRequest() {
  return json(405, { error: 'Nepodporovaná metoda.' });
}
