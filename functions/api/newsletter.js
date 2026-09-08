import { maDb, hashIp } from './_uloz.js';

const KOD_ZNAKY = 'abcdefghijkmnpqrstuvwxyz23456789';

function odhlasovaciKod() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += KOD_ZNAKY[b % KOD_ZNAKY.length];
  return s;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (data.website && String(data.website).trim() !== '') {
      return json({ ok: true });
    }

    const email = (data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ ok: false, error: 'Zkontrolujte prosím e-mail, nevypadá jako platná adresa.' }, 400);
    }

    if (!maDb(env)) {
      return json({ ok: false, error: 'Přihlášení k novinkám zatím nefunguje, napište nám prosím přes formulář níž.' }, 503);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    await env.DB.prepare(
      'INSERT INTO newsletter (email, vzniklo, zdroj, odhlasovaci_kod) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(email) DO NOTHING'
    ).bind(
      email,
      new Date().toISOString(),
      (request.headers.get('Referer') || '').slice(0, 300) || null,
      odhlasovaciKod()
    ).run();

    await env.DB.prepare('UPDATE newsletter SET ip_hash = ? WHERE email = ? AND ip_hash IS NULL')
      .bind(await hashIp(env, ip), email).run();

    return json({ ok: true });
  } catch (e) {
    console.error('newsletter selhal:', e);
    return json({ ok: false, error: 'Přihlášení se nepovedlo, zkuste to prosím za chvíli znovu.' }, 500);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
