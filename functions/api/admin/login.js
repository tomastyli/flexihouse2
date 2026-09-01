import { makeToken, safeEqual, guardStav, guardSelhani, guardReset } from '../_uloz.js';

function json(status, body, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(extra || {}) }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.ADMIN_SECRET) {
    return json(500, { error: 'Přehled zatím není nakonfigurovaný (chybí ADMIN_PASSWORD nebo ADMIN_SECRET).' });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'neznama';

  const guard = await guardStav(env, ip);
  if (guard.locked) {
    return json(429, { error: 'Příliš mnoho pokusů. Zkuste to za 15 minut.' });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return json(400, { error: 'Neplatný požadavek.' });
  }

  if (!safeEqual(String(data.heslo || ''), env.ADMIN_PASSWORD)) {
    const r = await guardSelhani(env, ip);
    if (r && r.blokovanoDo) {
      return json(429, { error: 'Příliš mnoho pokusů. Zkuste to za 15 minut.' });
    }
    return json(401, { error: 'Špatné heslo.' });
  }

  await guardReset(env, ip);
  const token = await makeToken(env);
  const cookie = `fh_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${30 * 86400}`;
  return json(200, { ok: true }, { 'Set-Cookie': cookie });
}

export async function onRequest() {
  return json(405, { error: 'Nepodporovaná metoda.' });
}
