import { json, chranene } from './_sanon.js';
import { claude, SLOZKY } from './_claude.js';

export const onRequestPost = chranene(async ({ request, env }) => {
  const fd = await request.formData();
  const f = fd.get('foto');
  if (!f || typeof f !== 'object') return json(400, { error: 'Chybí fotka.' });
  if (f.size > 6 * 1024 * 1024) return json(400, { error: 'Fotka je moc velká, zmenšete ji pod 6 MB.' });
  const bytes = new Uint8Array(await f.arrayBuffer());
  let b64 = '';
  for (let i = 0; i < bytes.length; i += 0x8000) b64 += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  b64 = btoa(b64);
  const { results } = await env.DB.prepare("SELECT id, jmeno, misto, telefon, email FROM s_zakaznici WHERE stav NOT IN ('ztraceno') ORDER BY id DESC LIMIT 200").all();
  const seznam = results.map(z => `${z.id}: ${z.jmeno}${z.misto ? ', ' + z.misto : ''}${z.telefon ? ', ' + z.telefon : ''}`).join('\n');
  const system = `Jsi asistent interního systému Šanon firmy Flexi House (modulové domy). Dostaneš fotku papíru, dokumentu nebo místa. Vrať POUZE JSON:
{"popis": "co to je, 2 až 6 slov česky (např. katastrální mapa, podepsaná smlouva, ručně psaná poznámka z hovoru, fotka pozemku)",
 "slozka": "jedna z: ${SLOZKY.join(', ')}",
 "zakaznik_id": číslo ze seznamu nebo null,
 "proc": "jedna věta, podle čeho jsi zákazníka poznal (jméno, parcela, obec, telefon), nebo proč ne",
 "text": "pokud je na fotce ručně psaný nebo tištěný text s poznámkami, úkoly nebo údaji, přepiš ho stručně (max 400 znaků), jinak prázdný řetězec"}
Seznam zákazníků (id: jméno, místo, telefon):\n${seznam || '(zatím žádní)'}`;
  const { data, usage } = await claude(env, {
    system, max_tokens: 500, json: true,
    messages: [{ role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: f.type || 'image/jpeg', data: b64 } }, { type: 'text', text: 'Roztřiď tuhle fotku.' }] }]
  });
  return json(200, { ...data, usage });
});
