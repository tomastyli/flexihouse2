export const MODEL = 'claude-sonnet-5';

export async function claude(env, { system, messages, max_tokens, json }) {
  if (!env.ANTHROPIC_API_KEY) throw new Error('Chybí ANTHROPIC_API_KEY.');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: env.SANON_MODEL || MODEL, max_tokens: max_tokens || 1200, system, messages })
  });
  const d = await r.json();
  if (!r.ok) throw new Error('Claude: ' + JSON.stringify(d).slice(0, 300));
  const text = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
  if (!json) return { text, usage: d.usage };
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('Claude nevrátil JSON: ' + text.slice(0, 200));
  return { data: JSON.parse(m[0]), usage: d.usage };
}

export const JMENA = { dan: 'Dan', honza: 'Honza', tomas: 'Tomáš' };
export const STAVY = { novy: 'Nový', jednani: 'V jednání', nabidka: 'Nabídka poslaná', zakazka: 'Zakázka', predano: 'Předáno', ztraceno: 'Ztraceno' };
export const KROKY = { zaloha: 'Záloha zaplacená', objednano: 'Objednáno', more: 'Na cestě', praha: 'Ve skladu Praha', pozemek: 'Příprava pozemku', predano: 'Předáno' };
export const SLOZKY = ['Smlouva', 'Pozemek', 'Fotky', 'Nabídky', 'Doprava', 'Ceníky', 'Dokumenty'];

export const dnesCz = () => new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Prague' });
