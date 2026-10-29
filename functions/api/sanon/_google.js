import { nastaveni, ulozNastaveni } from './_sanon.js';

let cache = { token: null, exp: 0 };

export async function googleToken(env) {
  if (cache.token && Date.now() < cache.exp - 60000) return cache.token;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN) throw new Error('Google není napojený (chybí GOOGLE_* secrets).');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET, refresh_token: env.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' })
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('Google token: ' + JSON.stringify(d));
  cache = { token: d.access_token, exp: Date.now() + d.expires_in * 1000 };
  return d.access_token;
}

export async function g(env, url, init) {
  const token = await googleToken(env);
  const r = await fetch(url, { ...(init || {}), headers: { Authorization: 'Bearer ' + token, ...((init && init.headers) || {}) } });
  if (!r.ok) throw new Error(`Google ${r.status} ${url.split('?')[0].slice(-60)}: ${(await r.text()).slice(0, 300)}`);
  return r;
}

export const gj = async (env, url, init) => (await g(env, url, init)).json();

const DRIVE = 'https://www.googleapis.com/drive/v3';
const SLOZKA = 'application/vnd.google-apps.folder';

async function najdiNeboZaloz(env, nazev, parent) {
  const q = `name = '${nazev.replace(/'/g, "\\'")}' and mimeType = '${SLOZKA}' and trashed = false` + (parent ? ` and '${parent}' in parents` : ` and 'root' in parents`);
  const d = await gj(env, `${DRIVE}/files?q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`);
  if (d.files && d.files[0]) return d.files[0].id;
  const n = await gj(env, `${DRIVE}/files?fields=id`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: nazev, mimeType: SLOZKA, parents: parent ? [parent] : undefined })
  });
  return n.id;
}

export async function korenSlozka(env) {
  let id = await nastaveni(env, 'drive_koren');
  if (!id) { id = await najdiNeboZaloz(env, 'Šanon'); await ulozNastaveni(env, 'drive_koren', id); }
  return id;
}

export async function slozkaPro(env, { zak, dod }, podslozka) {
  const koren = await korenSlozka(env);
  const tabulka = zak ? 's_zakaznici' : 's_dodavatele';
  const radek = zak || dod;
  let id = radek.drive_slozka;
  if (!id) {
    const skupina = await najdiNeboZaloz(env, zak ? 'Zákazníci' : 'Dodavatelé', koren);
    id = await najdiNeboZaloz(env, (zak ? zak.jmeno : dod.nazev).replace(/[\\/:*?"<>|]/g, ' ').trim() || 'Bez jména', skupina);
    await env.DB.prepare(`UPDATE ${tabulka} SET drive_slozka = ? WHERE id = ?`).bind(id, radek.id).run();
  }
  return podslozka ? najdiNeboZaloz(env, podslozka, id) : id;
}

export async function nahrajNaDisk(env, slozkaId, nazev, mime, data) {
  const meta = JSON.stringify({ name: nazev, parents: [slozkaId] });
  const hranice = 'sanon' + Date.now();
  const hlava = `--${hranice}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${meta}\r\n--${hranice}\r\nContent-Type: ${mime || 'application/octet-stream'}\r\n\r\n`;
  const pata = `\r\n--${hranice}--`;
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(await new Response(data).arrayBuffer());
  const telo = new Blob([hlava, bytes, pata]);
  return gj(env, 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink', {
    method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${hranice}` }, body: telo
  });
}

export const GMAIL = 'https://gmail.googleapis.com/gmail/v1/users/me';

export function b64urlEncode(str) {
  const bytes = typeof str === 'string' ? new TextEncoder().encode(str) : str;
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecodeBytes(str) {
  const s = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s + '='.repeat((4 - (s.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

export const b64urlDecodeText = str => new TextDecoder().decode(b64urlDecodeBytes(str));

export function hlavicka(zprava, nazev) {
  const h = (zprava.payload && zprava.payload.headers || []).find(x => x.name.toLowerCase() === nazev.toLowerCase());
  return h ? h.value : '';
}

export function rozeberAdresu(od) {
  const m = od.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { jmeno: m[1].trim(), adresa: m[2].trim().toLowerCase() };
  return { jmeno: '', adresa: od.trim().replace(/^<|>$/g, '').toLowerCase() };
}

export function teloZpravy(zprava) {
  let text = '', html = '';
  const prilohy = [];
  const projdi = cast => {
    if (!cast) return;
    const mime = cast.mimeType || '';
    if (cast.filename && cast.body && cast.body.attachmentId) {
      const hl = (cast.headers || []).reduce((o, h) => (o[h.name.toLowerCase()] = h.value, o), {});
      const inline = /inline/i.test(hl['content-disposition'] || '') || !!hl['content-id'];
      const podpisovyObrazek = inline && /^image\//.test(mime) && (cast.body.size || 0) < 60000;
      if (!podpisovyObrazek) prilohy.push({ n: cast.filename, mime, velikost: cast.body.size, gmail_att: cast.body.attachmentId });
    } else if (mime === 'text/plain' && cast.body && cast.body.data && !text) {
      text = b64urlDecodeText(cast.body.data);
    } else if (mime === 'text/html' && cast.body && cast.body.data && !html) {
      html = b64urlDecodeText(cast.body.data);
    }
    (cast.parts || []).forEach(projdi);
  };
  projdi(zprava.payload);
  if (!text && html) text = html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|tr|li|h\d)>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\n{3,}/g, '\n\n').trim();
  text = text.replace(/\r\n/g, '\n');
  text = oriznoutCitaci(text);
  return { text: text.trim(), prilohy };
}

export function oriznoutCitaci(text) {
  const vzory = [/\n\s*On .{3,120}wrote:\s*\n/, /\n[^\n]{0,160}napsal\(?a?\)?:\s*(\n|$)/, /\n-----\s*(Original Message|Původní zpráva)\s*-----/i, /\n(Od|From): .{2,120}\n(Odesláno|Sent|Datum|Date): /, /\n>\s/];
  let kde = -1;
  for (const v of vzory) { const i = text.search(v); if (i > 40 && (kde < 0 || i < kde)) kde = i; }
  return kde > 0 ? text.slice(0, kde).trim() : text;
}

function kodujHlavicku(s) {
  return /^[\x20-\x7e]*$/.test(s) ? s : '=?UTF-8?B?' + btoa(unescape(encodeURIComponent(s))) + '?=';
}

export function sestavMail({ komu, predmet, text, html, inReplyTo, prilohy }) {
  const hranice = 'sanon' + Math.random().toString(36).slice(2);
  const radky = [
    `From: ${kodujHlavicku('Flexi House')} <info@flexihouse.cz>`,
    `To: ${komu}`,
    `Subject: ${kodujHlavicku(predmet)}`,
    'MIME-Version: 1.0'
  ];
  if (inReplyTo) radky.push(`In-Reply-To: ${inReplyTo}`, `References: ${inReplyTo}`);
  const alt = 'alt' + Math.random().toString(36).slice(2);
  const textCast = [
    `--${alt}`, 'Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    btoa(unescape(encodeURIComponent(text))).replace(/.{76}/g, '$&\r\n'),
    `--${alt}`, 'Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: base64', '',
    btoa(unescape(encodeURIComponent(html))).replace(/.{76}/g, '$&\r\n'),
    `--${alt}--`
  ].join('\r\n');
  if (!prilohy || !prilohy.length) {
    radky.push(`Content-Type: multipart/alternative; boundary="${alt}"`, '', textCast);
    return radky.join('\r\n');
  }
  radky.push(`Content-Type: multipart/mixed; boundary="${hranice}"`, '', `--${hranice}`, `Content-Type: multipart/alternative; boundary="${alt}"`, '', textCast);
  for (const p of prilohy) {
    radky.push(`--${hranice}`, `Content-Type: ${p.mime || 'application/octet-stream'}; name="${kodujHlavicku(p.n)}"`, `Content-Disposition: attachment; filename="${kodujHlavicku(p.n)}"`, 'Content-Transfer-Encoding: base64', '', p.b64.replace(/.{76}/g, '$&\r\n'));
  }
  radky.push(`--${hranice}--`);
  return radky.join('\r\n');
}

export const PODPIS_TEXT = '\n\nFlexi House\ninfo@flexihouse.cz · 607 321 543\nflexihouse.cz';
export const PODPIS_HTML = '<p style="margin-top:18px;color:#444"><strong>Flexi House</strong><br>info@flexihouse.cz · 607 321 543<br><a href="https://flexihouse.cz">flexihouse.cz</a></p>';
