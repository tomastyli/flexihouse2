import { json, chranene } from './_sanon.js';

export const onRequestPost = chranene(async ({ request, env }) => {
  if (!env.OPENAI_API_KEY) return json(501, { error: 'Přepis hlasu zatím není zapnutý (chybí OPENAI_API_KEY).' });
  const fd = await request.formData();
  const f = fd.get('audio');
  if (!f || typeof f !== 'object') return json(400, { error: 'Chybí nahrávka.' });
  const out = new FormData();
  out.append('file', f, f.name || 'nahravka.webm');
  out.append('model', 'whisper-1');
  out.append('language', 'cs');
  out.append('prompt', 'Flexi House, modulový dům, Flexi Stanza, Flexi Tenuta, Flexi Office, Litomyšl, kontejner, pozemek, stavební povolení.');
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY }, body: out });
  const d = await r.json();
  if (!r.ok) return json(502, { error: 'Whisper: ' + JSON.stringify(d).slice(0, 200) });
  return json(200, { text: d.text || '' });
});
