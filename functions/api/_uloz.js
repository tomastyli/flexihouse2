export function maDb(env) {
  return !!(env && env.DB);
}

function b64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(secret, payload) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

export async function makeToken(env, ttlMs) {
  const exp = Date.now() + (ttlMs || 30 * 86400000);
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ exp })));
  const sig = await hmac(env.ADMIN_SECRET, payload);
  return `${payload}.${sig}`;
}

export async function verifyToken(env, token) {
  if (!token || !env.ADMIN_SECRET) return false;
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(env.ADMIN_SECRET, payload);
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  try {
    const { exp } = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
    return !!exp && Date.now() < exp;
  } catch {
    return false;
  }
}

export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  const m = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : null;
}

const BLOKACE_MS = 15 * 60 * 1000;
const MAX_POKUSU = 8;

export async function guardStav(env, ip) {
  if (!maDb(env)) return { locked: false };
  try {
    const row = await env.DB.prepare('SELECT pokusy, blokovano_do FROM prihlaseni WHERE ip = ?').bind(ip).first();
    if (!row) return { locked: false };
    if (row.blokovano_do && Date.now() < row.blokovano_do) return { locked: true };
    return { locked: false };
  } catch {
    return { locked: false };
  }
}

export async function guardSelhani(env, ip) {
  if (!maDb(env)) return {};
  try {
    const row = await env.DB.prepare('SELECT pokusy FROM prihlaseni WHERE ip = ?').bind(ip).first();
    const pokusy = (row ? row.pokusy : 0) + 1;
    const blokovanoDo = pokusy >= MAX_POKUSU ? Date.now() + BLOKACE_MS : null;
    await env.DB.prepare(
      'INSERT INTO prihlaseni (ip, pokusy, blokovano_do) VALUES (?, ?, ?) ' +
      'ON CONFLICT(ip) DO UPDATE SET pokusy = excluded.pokusy, blokovano_do = excluded.blokovano_do'
    ).bind(ip, pokusy, blokovanoDo).run();
    return { blokovanoDo };
  } catch {
    return {};
  }
}

export async function guardReset(env, ip) {
  if (!maDb(env)) return;
  try {
    await env.DB.prepare('DELETE FROM prihlaseni WHERE ip = ?').bind(ip).run();
  } catch {}
}

export async function ulozPoptavku(env, p) {
  if (!maDb(env)) return null;
  try {
    const r = await env.DB.prepare(
      'INSERT INTO poptavky (vzniklo, typ, jmeno, email, telefon, model, zprava, konfigurace, cena, zdroj, mail_odeslan) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)'
    ).bind(
      new Date().toISOString(),
      p.typ,
      p.jmeno,
      p.email,
      p.telefon,
      p.model || null,
      p.zprava || null,
      p.konfigurace || null,
      p.cena == null ? null : p.cena,
      p.zdroj || null
    ).run();
    return r.meta ? r.meta.last_row_id : null;
  } catch (e) {
    console.error('ulozPoptavku selhalo:', e);
    return null;
  }
}

export async function oznacMail(env, id, ok, chyba) {
  if (!maDb(env) || !id) return;
  try {
    await env.DB.prepare('UPDATE poptavky SET mail_odeslan = ?, mail_chyba = ? WHERE id = ?')
      .bind(ok ? 1 : 0, ok ? null : String(chyba || '').slice(0, 500), id)
      .run();
  } catch (e) {
    console.error('oznacMail selhalo:', e);
  }
}
