import { ulozRelaci, nactiRelaci, platnyKod, hashIp, limitVycerpan, maDb } from './_uloz.js';

const MAX_OBSAH = 8000;

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPost({ request, env }) {
  if (!maDb(env)) {
    return json(503, { error: 'Ukládání konfigurací není zapnuté.' });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Neplatný požadavek.' });
  }

  const vyber = data && data.vyber;
  if (!vyber || typeof vyber !== 'object' || Array.isArray(vyber) || !Object.keys(vyber).length) {
    return json(400, { error: 'Konfigurace je prázdná.' });
  }

  const obsah = JSON.stringify({
    model: String(data.model || 'flexihouse').slice(0, 40),
    vyber,
    km: Number(data.km) > 0 ? Math.round(Number(data.km)) : 0
  });
  if (obsah.length > MAX_OBSAH) {
    return json(413, { error: 'Konfigurace je příliš velká.' });
  }

  const ipHash = await hashIp(env, request.headers.get('CF-Connecting-IP'));
  if (await limitVycerpan(env, ipHash)) {
    return json(429, { error: 'Během hodiny jde uložit nejvýš dvacet konfigurací. Zkuste to prosím později.' });
  }

  const kod = await ulozRelaci(env, {
    typ: 'konfigurace',
    model: String(data.model || 'flexihouse').slice(0, 40),
    obsah,
    cena: typeof data.cena === 'number' && isFinite(data.cena) ? Math.round(data.cena) : null,
    souhrn: data.souhrn ? JSON.stringify(data.souhrn).slice(0, 4000) : null,
    ipHash
  });

  if (!kod) {
    return json(500, { error: 'Konfiguraci se nepodařilo uložit.' });
  }

  const url = new URL(request.url);
  return json(200, {
    ok: true,
    kod,
    odkaz: url.origin + '/konfigurator?kod=' + kod
  });
}

export async function onRequestGet({ request, env }) {
  const kod = String(new URL(request.url).searchParams.get('kod') || '').trim().toUpperCase();
  if (!platnyKod(kod)) {
    return json(400, { error: 'Neplatný kód konfigurace.' });
  }
  if (!maDb(env)) {
    return json(503, { error: 'Ukládání konfigurací není zapnuté.' });
  }

  const row = await nactiRelaci(env, kod);
  if (!row || row.typ !== 'konfigurace') {
    return json(404, { error: 'Konfigurace s tímhle kódem neexistuje. Zkontrolujte prosím kód.' });
  }

  let obsah;
  try {
    obsah = JSON.parse(row.obsah);
  } catch {
    return json(500, { error: 'Uloženou konfiguraci se nepodařilo přečíst.' });
  }

  return json(200, {
    ok: true,
    kod: row.kod,
    vzniklo: row.vzniklo,
    model: obsah.model,
    vyber: obsah.vyber,
    km: obsah.km || 0,
    cena: row.cena
  });
}

export async function onRequest() {
  return json(405, { error: 'Nepodporovaná metoda.' });
}
