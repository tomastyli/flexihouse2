import { json, chranene, pridejZpravu, ted } from './_sanon.js';
import { gj, GMAIL, sestavMail, b64urlEncode, podpis, slozkaPro, nahrajNaDisk } from './_google.js';

const escHtml = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const fd = await request.formData();
  const zak_id = Number(fd.get('zak_id')) || null;
  const dod_id = Number(fd.get('dod_id')) || null;
  const komu = String(fd.get('komu') || '').trim().toLowerCase();
  const predmet = String(fd.get('predmet') || '').trim() || '(bez předmětu)';
  const text = String(fd.get('text') || '').trim();
  const odpovedNa = String(fd.get('thread_id') || '');
  if (!komu || !/.+@.+\..+/.test(komu)) return json(400, { error: 'Chybí platná adresa.' });
  if (!text) return json(400, { error: 'Prázdná zpráva.' });
  const cil = zak_id ? await env.DB.prepare('SELECT * FROM s_zakaznici WHERE id = ?').bind(zak_id).first() : await env.DB.prepare('SELECT * FROM s_dodavatele WHERE id = ?').bind(dod_id).first();
  if (!cil) return json(404, { error: 'Příjemce neexistuje.' });
  if (zak_id && !cil.email) await env.DB.prepare('UPDATE s_zakaznici SET email = ? WHERE id = ?').bind(komu, zak_id).run();

  const soubory = fd.getAll('soubory').filter(f => f && typeof f === 'object' && f.size > 0);
  const prilohy = [];
  const mimePrilohy = [];
  for (const f of soubory) {
    const bytes = new Uint8Array(await f.arrayBuffer());
    mimePrilohy.push({ n: f.name, mime: f.type, b64: b64urlEncode(bytes).replace(/-/g, '+').replace(/_/g, '/') });
    const slozka = await slozkaPro(env, zak_id ? { zak: cil } : { dod: cil }, 'Odeslané');
    const d = await nahrajNaDisk(env, slozka, f.name, f.type, bytes);
    prilohy.push({ n: f.name, s: 'Odeslané', mime: f.type, velikost: f.size, drive_id: d.id });
  }

  let inReplyTo = '';
  if (odpovedNa) {
    try {
      const t = await gj(env, `${GMAIL}/threads/${odpovedNa}?format=metadata&metadataHeaders=Message-ID`);
      const posl = (t.messages || []).slice(-1)[0];
      const h = posl && (posl.payload.headers || []).find(x => x.name.toLowerCase() === 'message-id');
      inReplyTo = h ? h.value : '';
    } catch {}
  }
  const pod = podpis(kdo);
  const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1d1c1d">' + escHtml(text).replace(/\n/g, '<br>') + pod.html + '</div>';
  const raw = sestavMail({ komu, predmet, text: text + pod.text, html, inReplyTo, prilohy: mimePrilohy });
  const odeslano = await gj(env, `${GMAIL}/messages/send`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: b64urlEncode(raw), threadId: odpovedNa || undefined })
  });
  const id = await pridejZpravu(env, { kdy: ted(), zak_id, dod_id, typ: 'mail', kdo, text, predmet, prilohy, gmail_id: odeslano.id, thread_id: odeslano.threadId, od_adresa: komu });
  return json(200, { id, gmail_id: odeslano.id });
});
