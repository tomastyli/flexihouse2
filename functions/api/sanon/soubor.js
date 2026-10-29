import { json, chranene, pridejZpravu, ted } from './_sanon.js';
import { g, gj, GMAIL, slozkaPro, nahrajNaDisk, b64urlDecodeBytes } from './_google.js';

export const onRequestGet = chranene(async ({ request, env }) => {
  const u = new URL(request.url);
  const driveId = u.searchParams.get('drive');
  const gmailMsg = u.searchParams.get('gmail');
  const att = u.searchParams.get('att');
  const nazev = u.searchParams.get('n') || 'soubor';
  const stahnout = u.searchParams.get('stahnout') === '1';
  const hlavicky = { 'Cache-Control': 'private, max-age=86400' };
  if (stahnout) hlavicky['Content-Disposition'] = `attachment; filename*=UTF-8''${encodeURIComponent(nazev)}`;
  if (driveId) {
    if (u.searchParams.get('nahled') === '1') {
      const r = await g(env, `https://www.googleapis.com/drive/v3/files/${driveId}?fields=thumbnailLink,mimeType`);
      const d = await r.json();
      if (d.thumbnailLink) {
        const t = await fetch(d.thumbnailLink.replace(/=s\d+$/, '=s600'));
        return new Response(t.body, { headers: { 'Content-Type': t.headers.get('Content-Type') || 'image/jpeg', ...hlavicky } });
      }
    }
    const r = await g(env, `https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`);
    return new Response(r.body, { headers: { 'Content-Type': r.headers.get('Content-Type') || 'application/octet-stream', ...hlavicky } });
  }
  if (gmailMsg && att) {
    const d = await gj(env, `${GMAIL}/messages/${gmailMsg}/attachments/${att}`);
    const bytes = b64urlDecodeBytes(d.data);
    return new Response(bytes, { headers: { 'Content-Type': u.searchParams.get('mime') || 'application/octet-stream', ...hlavicky } });
  }
  return json(400, { error: 'Chybí identifikace souboru.' });
});

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const fd = await request.formData();
  const zak_id = Number(fd.get('zak_id')) || null;
  const dod_id = Number(fd.get('dod_id')) || null;
  const text = String(fd.get('text') || '').trim();
  let slozky = [];
  try { slozky = JSON.parse(fd.get('slozky') || '[]'); } catch {}
  const cil = zak_id ? await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(zak_id).first() : await env.DB.prepare('SELECT * FROM s_dodavatele WHERE id = ?').bind(dod_id).first();
  if (!cil) return json(404, { error: 'Cíl neexistuje.' });
  const soubory = fd.getAll('soubory').filter(f => f && typeof f === 'object' && f.size > 0);
  if (!soubory.length && !text) return json(400, { error: 'Nic k uložení.' });
  const prilohy = [];
  for (let i = 0; i < soubory.length; i++) {
    const f = soubory[i];
    const s = slozky[i] || 'Dokumenty';
    const slozka = await slozkaPro(env, zak_id ? { zak: cil } : { dod: cil }, s);
    const d = await nahrajNaDisk(env, slozka, f.name, f.type, new Uint8Array(await f.arrayBuffer()));
    prilohy.push({ n: f.name, s, mime: f.type, velikost: f.size, drive_id: d.id });
  }
  const id = await pridejZpravu(env, { kdy: ted(), zak_id, dod_id, typ: 'pozn', kdo, text, prilohy });
  return json(200, { id, prilohy });
});

export const onRequestPut = chranene(async ({ request, env }) => {
  const d = await request.json().catch(() => ({}));
  const z = await env.DB.prepare('SELECT id, zak_id, dod_id, prilohy FROM s_zpravy WHERE id = ?').bind(d.zprava_id).first();
  if (!z) return json(404, { error: 'Zpráva neexistuje.' });
  const prilohy = JSON.parse(z.prilohy || '[]');
  const p = prilohy[d.index];
  if (!p || !p.gmail_att) return json(400, { error: 'Tahle příloha na Disk nejde.' });
  const cil = z.zak_id ? await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(z.zak_id).first() : await env.DB.prepare('SELECT * FROM s_dodavatele WHERE id = ?').bind(z.dod_id).first();
  const data = await gj(env, `${GMAIL}/messages/${p.gmail_msg}/attachments/${p.gmail_att}`);
  const slozka = await slozkaPro(env, z.zak_id ? { zak: cil } : { dod: cil }, d.slozka || 'Z mailu');
  const nahr = await nahrajNaDisk(env, slozka, p.n, p.mime, b64urlDecodeBytes(data.data));
  prilohy[d.index] = { ...p, s: d.slozka || 'Z mailu', drive_id: nahr.id };
  await env.DB.prepare('UPDATE s_zpravy SET prilohy = ? WHERE id = ?').bind(JSON.stringify(prilohy), z.id).run();
  return json(200, { prilohy });
});
