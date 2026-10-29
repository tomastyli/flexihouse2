import { json, telo, LIDE, overHeslo, vydejToken, COOKIE, kdoJe } from './_sanon.js';

export async function onRequestGet({ request, env }) {
  const kdo = await kdoJe(env, request);
  return json(200, { kdo, lide: LIDE.filter(l => !!env['SANON_HESLO_' + l.toUpperCase()]) });
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_SECRET) return json(500, { error: 'Chybí ADMIN_SECRET.' });
  const d = await telo(request);
  const kdo = String(d.kdo || '');
  if (!LIDE.includes(kdo)) return json(400, { error: 'Neznámý uživatel.' });
  const v = await overHeslo(env, request, kdo, d.heslo);
  if (!v.ok) return json(v.status, { error: v.chyba });
  const token = await vydejToken(env, kdo);
  return json(200, { ok: true, kdo }, { 'Set-Cookie': `${COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${90 * 86400}` });
}

export async function onRequestDelete() {
  return json(200, { ok: true }, { 'Set-Cookie': `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0` });
}
