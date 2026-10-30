import { json, chranene } from './_sanon.js';
import { b64urlEncode } from './_google.js';

const SLOVNIK = 'Flexi House, modulový dům, Flexi Stanza, Flexi Tenuta, Flexi Office, Litomyšl, kontejner, pozemek, stavební povolení.';

async function presOpenAI(env, f) {
  const out = new FormData();
  out.append('file', f, f.name || 'nahravka.webm');
  out.append('model', 'gpt-4o-transcribe');
  out.append('language', 'cs');
  out.append('prompt', SLOVNIK);
  const r = await fetch('https://api.openai.com/v1/audio/transcriptions', { method: 'POST', headers: { Authorization: 'Bearer ' + env.OPENAI_API_KEY }, body: out });
  const d = await r.json();
  if (!r.ok) throw new Error('OpenAI: ' + JSON.stringify(d).slice(0, 200));
  return d.text || '';
}

async function presCloudflare(env, f) {
  const audio = b64urlEncode(new Uint8Array(await f.arrayBuffer())).replace(/-/g, '+').replace(/_/g, '/');
  const d = await env.AI.run('@cf/openai/whisper-large-v3-turbo', { audio, language: 'cs', initial_prompt: SLOVNIK });
  return (d && d.text || '').trim();
}

export const onRequestPost = chranene(async ({ request, env }) => {
  if (!env.OPENAI_API_KEY && !env.AI) return json(501, { error: 'Přepis hlasu zatím není zapnutý.' });
  const fd = await request.formData();
  const f = fd.get('audio');
  if (!f || typeof f !== 'object') return json(400, { error: 'Chybí nahrávka.' });
  try {
    const text = env.OPENAI_API_KEY ? await presOpenAI(env, f) : await presCloudflare(env, f);
    return json(200, { text });
  } catch (e) {
    return json(502, { error: 'Přepis selhal: ' + e.message.slice(0, 200) });
  }
});
