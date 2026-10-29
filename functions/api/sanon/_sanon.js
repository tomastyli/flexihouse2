import { getCookie, safeEqual, guardStav, guardSelhani, guardReset } from '../_uloz.js';

export const LIDE = ['dan', 'honza', 'tomas'];
export const COOKIE = 'fh_sanon';

export function json(status, body, extra) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(extra || {}) }
  });
}

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))));
}

export async function vydejToken(env, kdo) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ kdo, exp: Date.now() + 90 * 86400000 })));
  return `${payload}.${await hmac(env.ADMIN_SECRET, payload)}`;
}

export async function kdoJe(env, request) {
  const token = getCookie(request, COOKIE);
  if (!token || !env.ADMIN_SECRET) return null;
  const dot = token.indexOf('.');
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const expected = await hmac(env.ADMIN_SECRET, payload);
  if (!safeEqual(token.slice(dot + 1), expected)) return null;
  try {
    const { kdo, exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return exp && Date.now() < exp && LIDE.includes(kdo) ? kdo : null;
  } catch {
    return null;
  }
}

export function hesloPro(env, kdo) {
  return env['SANON_HESLO_' + kdo.toUpperCase()] || '';
}

export async function overHeslo(env, request, kdo, heslo) {
  const ip = request.headers.get('CF-Connecting-IP') || 'neznama';
  if ((await guardStav(env, ip)).locked) return { chyba: 'Příliš mnoho pokusů. Zkuste to za 15 minut.', status: 429 };
  const spravne = hesloPro(env, kdo);
  if (!spravne || !safeEqual(String(heslo || ''), spravne)) {
    await guardSelhani(env, ip);
    return { chyba: 'Špatné heslo.', status: 401 };
  }
  await guardReset(env, ip);
  return { ok: true };
}

export function chranene(handler) {
  return async ctx => {
    if (!ctx.env.DB) return json(500, { error: 'Chybí databáze.' });
    const kdo = await kdoJe(ctx.env, ctx.request);
    if (!kdo) return json(401, { error: 'Nepřihlášen.' });
    ctx.kdo = kdo;
    try {
      return await handler(ctx);
    } catch (e) {
      console.error('sanon:', e && e.stack || e);
      return json(500, { error: String(e && e.message || e) });
    }
  };
}

export async function telo(request) {
  try { return await request.json(); } catch { return {}; }
}

export const ted = () => new Date().toISOString();

export async function nastaveni(env, klic) {
  const r = await env.DB.prepare('SELECT hodnota FROM s_nastaveni WHERE klic = ?').bind(klic).first();
  return r ? r.hodnota : null;
}

export async function ulozNastaveni(env, klic, hodnota) {
  await env.DB.prepare('INSERT INTO s_nastaveni (klic, hodnota) VALUES (?, ?) ON CONFLICT(klic) DO UPDATE SET hodnota = excluded.hodnota').bind(klic, hodnota).run();
}

export async function pridejZpravu(env, z) {
  const r = await env.DB.prepare(
    'INSERT INTO s_zpravy (kdy, zak_id, dod_id, typ, kdo, text, predmet, vysledek, prilohy, gmail_id, thread_id, od_adresa, nove) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(z.kdy || ted(), z.zak_id || null, z.dod_id || null, z.typ, z.kdo || null, z.text || '', z.predmet || null, z.vysledek || null,
    z.prilohy && z.prilohy.length ? JSON.stringify(z.prilohy) : null, z.gmail_id || null, z.thread_id || null, z.od_adresa || null, z.nove ? 1 : 0).run();
  return r.meta.last_row_id;
}

export const sysZprava = (env, zak_id, kdo, text) => pridejZpravu(env, { zak_id, typ: 'sys', kdo, text });
