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

export const OSOBY = {
  dan: { jmeno: 'Dan Prokeš', funkce: '', tel: '+420 607 321 543', email: 'dandaprokes@gmail.com' },
  honza: { jmeno: 'Jan Prokeš', funkce: 'CEO', tel: '+420 730 171 909', email: 'honzalit@gmail.com' },
  tomas: { jmeno: 'Flexi House', funkce: '', tel: '+420 607 321 543', email: 'hasci.tomasek@gmail.com' }
};

const KAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

export async function udalosti(env, od, doKdy) {
  const d = await gj(env, `${KAL}?timeMin=${encodeURIComponent(od)}&timeMax=${encodeURIComponent(doKdy)}&singleEvents=true&orderBy=startTime&maxResults=250`);
  return d.items || [];
}

export const zalozUdalost = (env, u, posilat) => gj(env, `${KAL}?sendUpdates=${posilat ? 'all' : 'none'}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u)
});

export async function smazUdalost(env, id, posilat) {
  try { await g(env, `${KAL}/${encodeURIComponent(id)}?sendUpdates=${posilat ? 'all' : 'none'}`, { method: 'DELETE' }); }
  catch (e) { if (!/ 410 | 404 /.test(e.message)) throw e; }
}

export function podpis(kdo) {
  const o = OSOBY[kdo] || OSOBY.tomas;
  const tel = o.tel.replace(/\s/g, '');
  const text = `\n\n${o.jmeno}${o.funkce ? ', ' + o.funkce : ''}\nFlexi House\n${o.tel} · info@flexihouse.cz\nflexihouse.cz`;
  const html = '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;margin-top:22px"><tr>'
    + '<td style="padding:0 22px 0 0;vertical-align:top"><a href="https://flexihouse.cz" style="text-decoration:none"><img src="https://flexihouse.cz/assets/podpis.png" alt="Flexi House, modulární domy" width="203" height="70" style="display:block;border:0"></a></td>'
    + '<td style="padding:0 0 0 22px;border-left:1px solid #d5dee1;vertical-align:top">'
    + `<div style="font:bold 16px/1.3 Arial,Helvetica,sans-serif;color:#16202a">${o.jmeno}</div>`
    + (o.funkce ? `<div style="font:bold 11px/1.3 Arial,Helvetica,sans-serif;color:#5a7885;letter-spacing:1.5px;padding-top:4px">${o.funkce}</div>` : '')
    + '<div style="font:13px/21px Arial,Helvetica,sans-serif;color:#16202a;padding-top:13px">'
    + '<a href="mailto:info@flexihouse.cz" style="color:#16202a;text-decoration:none">info@flexihouse.cz</a><br>'
    + `<a href="tel:${tel}" style="color:#16202a;text-decoration:none">${o.tel}</a><br>`
    + '<a href="https://flexihouse.cz" style="color:#5a7885;text-decoration:none;font-weight:bold">flexihouse.cz</a></div>'
    + '<div style="font:12px/18px Arial,Helvetica,sans-serif;color:#6d7b85;padding-top:12px">Sokolovská 612, 570 01 Litomyšl</div>'
    + '</td></tr></table>'
    + '<div style="font:10px/15px Arial,Helvetica,sans-serif;color:#9aa5ab;padding-top:16px">WINstores, s.r.o., Korunní 2569/108, 101 00 Praha 10 &middot; IČO 07836929 &middot; Městský soud v Praze, oddíl C, vložka 308049</div>';
  return { text, html };
}
