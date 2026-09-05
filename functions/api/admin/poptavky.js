import { verifyToken, getCookie, maDb } from '../_uloz.js';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}


function tridaZdroje(z) {
  const t = String(z || '').toLowerCase();
  const m = t.match(/vstup: [^ ]+ <- ([^ \]]+)/);
  const ref = m ? m[1] : '';
  const utm = (t.match(/utm_source=([a-z0-9._-]+)/) || [])[1];
  if (utm) return 'utm:' + utm;
  if (t.includes('gclid=')) return 'google ads';
  if (ref === 'přímo' || ref === '') return t.includes('vstup:') ? 'přímo' : 'neznámý';
  if (ref.includes('google.')) return 'google';
  if (ref.includes('seznam.cz') || ref.includes('firmy.cz') || ref.includes('mapy.c')) return 'seznam';
  if (ref.includes('facebook.') || ref.includes('instagram.') || ref.includes('fb.')) return 'facebook / instagram';
  if (ref.includes('chatgpt') || ref.includes('openai') || ref.includes('claude') || ref.includes('perplexity')) return 'ai asistent';
  if (ref.includes('flexihouse.cz')) return 'přímo';
  try { return new URL(ref.startsWith('http') ? ref : 'https://' + ref).hostname; } catch (e) { return 'jiný'; }
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
      'SELECT id, vzniklo, typ, jmeno, email, telefon, model, zprava, konfigurace, cena, zdroj, relace_kod, mail_odeslan, mail_chyba, ' +
      'COALESCE(vyrizeno, 0) AS vyrizeno, vyrizeno_kdy ' +
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
        nedorucene: poptavky.filter(p => !p.mail_odeslan).length,
        nevyrizene: poptavky.filter(p => !p.vyrizeno).length,
        zdroje30: poptavky.filter(p => ted - Date.parse(p.vzniklo) <= 30 * den)
          .reduce((acc, p) => { const k = tridaZdroje(p.zdroj); acc[k] = (acc[k] || 0) + 1; return acc; }, {})
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
