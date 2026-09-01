import { onRequestPost } from '../../functions/api/poradce.js';

function mockDb(stav) {
  const rows = stav.zpravy || [];
  const limity = stav.limity || new Map();
  return {
    prepare(sql) {
      const q = { sql, args: [] };
      q.bind = (...a) => { q.args = a; return q; };
      q.first = async () => {
        if (sql.includes('FROM poradce_limit')) {
          return limity.get(q.args[0]) || null;
        }
        if (sql.includes("role = 'assistant'")) {
          return { n: stav.dnesOdpovedi || 0 };
        }
        if (sql.includes("role = 'user'")) {
          return { n: rows.filter(r => r.relace === q.args[0] && r.role === 'user').length };
        }
        return null;
      };
      q.all = async () => {
        if (sql.includes('FROM poradce_zpravy')) {
          return { results: rows.filter(r => r.relace === q.args[0]).slice(-8).reverse() };
        }
        return { results: [] };
      };
      q.run = async () => {
        if (sql.includes('INSERT INTO poradce_limit')) {
          limity.set(q.args[0], { pocet: 1, do_kdy: q.args[1] });
        } else if (sql.includes('UPDATE poradce_limit')) {
          const r = limity.get(q.args[0]);
          if (r) r.pocet++;
        } else if (sql.includes('INSERT INTO poradce_zpravy')) {
          rows.push({ relace: q.args[0], role: q.args[2], text: q.args[3] });
        }
        return { meta: { last_row_id: rows.length } };
      };
      return q;
    },
    async batch(list) { for (const q of list) await q.run(); return []; }
  };
}

function req(body, headers = {}) {
  return new Request('https://flexihouse.cz/api/poradce', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '1.2.3.4', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

function fakeAnthropic(odpoved, opts = {}) {
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('anthropic.com')) {
      posledniTelo = JSON.parse(init.body);
      if (opts.status && opts.status !== 200) {
        return new Response('chyba', { status: opts.status });
      }
      return new Response(JSON.stringify({
        stop_reason: opts.stop_reason || 'end_turn',
        content: [{ type: 'text', text: odpoved }]
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    if (String(url).includes('turnstile')) {
      return new Response(JSON.stringify({ success: !!opts.turnstileOk }), { status: 200 });
    }
    throw new Error('neocekavane volani ' + url);
  };
}

let posledniTelo = null;
const vysledky = [];
function zkouska(nazev, podminka, detail) {
  vysledky.push({ nazev, ok: !!podminka, detail });
}

const zaklad = () => ({ ANTHROPIC_API_KEY: 'test', DB: mockDb({}) });

fakeAnthropic('Základní cena je 480 000 Kč.');

{
  const r = await onRequestPost({ request: req({ website: 'bot', relace: 'a', zprava: 'x' }), env: zaklad() });
  const d = await r.json();
  zkouska('past na roboty projde tiše', d.ok === true && d.predat === true, JSON.stringify(d).slice(0, 60));
}
{
  const r = await onRequestPost({ request: req({ relace: 'a' }), env: zaklad() });
  zkouska('chybějící zpráva vrací 400', r.status === 400, 'status ' + r.status);
}
{
  const r = await onRequestPost({ request: req('x'.repeat(5000)), env: zaklad() });
  zkouska('přerostlé tělo vrací 413', r.status === 413, 'status ' + r.status);
}
{
  const env = zaklad();
  const r = await onRequestPost({ request: req({ relace: 'b', zprava: 'kolik stoji dum' }), env });
  const d = await r.json();
  zkouska('běžný dotaz projde a vrátí odpověď', d.ok && d.odpoved.includes('480 000'), d.odpoved);
  zkouska('dotaz jde do modelu obalený jako data',
    posledniTelo.messages.at(-1).content.includes('<dotaz-navstevnika>'),
    posledniTelo.messages.at(-1).content.slice(0, 40));
  zkouska('báze se posílá s cachováním',
    posledniTelo.system[1].cache_control && posledniTelo.system[1].cache_control.type === 'ephemeral',
    JSON.stringify(posledniTelo.system[1].cache_control));
  zkouska('model je claude-opus-5', posledniTelo.model === 'claude-opus-5', posledniTelo.model);
  zkouska('opus dostane effort i fallbacks',
    posledniTelo.output_config.effort === 'low' && posledniTelo.fallbacks === 'default',
    JSON.stringify(posledniTelo.output_config));
}
{
  const env = { ANTHROPIC_API_KEY: 'test', PORADCE_MODEL: 'claude-haiku-4-5', DB: mockDb({}) };
  await onRequestPost({ request: req({ relace: 'haiku', zprava: 'cena' }), env });
  zkouska('haiku nedostane effort ani fallbacks',
    posledniTelo.output_config === undefined && posledniTelo.fallbacks === undefined,
    JSON.stringify({ e: posledniTelo.output_config, f: posledniTelo.fallbacks }));
}
{
  const env = { ANTHROPIC_API_KEY: 'test', PORADCE_MODEL: 'claude-sonnet-5', DB: mockDb({}) };
  await onRequestPost({ request: req({ relace: 'sonnet', zprava: 'cena' }), env });
  zkouska('sonnet dostane effort, ale ne fallbacks',
    posledniTelo.output_config.effort === 'low' && posledniTelo.fallbacks === undefined,
    JSON.stringify({ e: posledniTelo.output_config, f: posledniTelo.fallbacks }));
}
{
  const stav = { limity: new Map() };
  const env = { ANTHROPIC_API_KEY: 'test', DB: mockDb(stav) };
  let blokovano = null;
  for (let i = 0; i < 22; i++) {
    const r = await onRequestPost({ request: req({ relace: 'c', zprava: 'dotaz ' + i }), env });
    const d = await r.json();
    if (d.odpoved.includes('víc, než stíhám') && blokovano === null) blokovano = i + 1;
  }
  zkouska('limit podle IP zabere na 21. zprávě', blokovano === 21, 'zablokováno na ' + blokovano);
}
{
  const zpravy = [];
  for (let i = 0; i < 20; i++) zpravy.push({ relace: 'd', role: 'user', text: 'x' }, { relace: 'd', role: 'assistant', text: 'y' });
  const env = { ANTHROPIC_API_KEY: 'test', DB: mockDb({ zpravy }) };
  const r = await onRequestPost({ request: req({ relace: 'd', zprava: 'jeste jeden' }), env });
  const d = await r.json();
  zkouska('strop konverzace předá Danovi', d.konec === true && d.predat === true, JSON.stringify(d).slice(0, 70));
}
{
  const env = { ANTHROPIC_API_KEY: 'test', DB: mockDb({ dnesOdpovedi: 500 }) };
  const r = await onRequestPost({ request: req({ relace: 'e', zprava: 'cena' }), env });
  const d = await r.json();
  zkouska('denní strop útraty přepne na předání', d.predat === true && d.odpoved.includes('Dan'), d.odpoved.slice(0, 50));
}
{
  fakeAnthropic('', { status: 500 });
  const r = await onRequestPost({ request: req({ relace: 'f', zprava: 'cena' }), env: zaklad() });
  const d = await r.json();
  zkouska('výpadek modelu nespadne, jen předá', r.status === 200 && d.predat === true, d.odpoved.slice(0, 40));
}
{
  fakeAnthropic('neco', { stop_reason: 'refusal' });
  const r = await onRequestPost({ request: req({ relace: 'g', zprava: 'cena' }), env: zaklad() });
  const d = await r.json();
  zkouska('odmítnutí modelu vede na předání', d.predat === true, d.odpoved.slice(0, 40));
}
{
  fakeAnthropic('ok', { turnstileOk: false });
  const env = { ...zaklad(), TURNSTILE_SECRET: 'tajne' };
  const r = await onRequestPost({ request: req({ relace: 'h', zprava: 'cena', turnstile: 'spatny' }), env });
  zkouska('Turnstile bez platného tokenu vrací 403', r.status === 403, 'status ' + r.status);
}
{
  fakeAnthropic('ok', { turnstileOk: true });
  const env = { ...zaklad(), TURNSTILE_SECRET: 'tajne' };
  const r = await onRequestPost({ request: req({ relace: 'i', zprava: 'cena', turnstile: 'dobry' }), env });
  zkouska('Turnstile s platným tokenem pustí dál', r.status === 200, 'status ' + r.status);
}
{
  fakeAnthropic('Odpoved.');
  const env = { ANTHROPIC_API_KEY: 'test' };
  const r = await onRequestPost({ request: req({ relace: 'j', zprava: 'cena' }), env });
  const d = await r.json();
  zkouska('bez databáze poradce pořád odpovídá', d.ok === true && d.odpoved === 'Odpoved.', d.odpoved);
}
{
  const env = { DB: mockDb({}) };
  const r = await onRequestPost({ request: req({ relace: 'k', zprava: 'cena' }), env });
  zkouska('bez klíče k modelu vrací 500', r.status === 500, 'status ' + r.status);
}

const padlo = vysledky.filter(v => !v.ok);
for (const v of vysledky) console.log((v.ok ? '  ok   ' : '  PADLO') + '  ' + v.nazev + (v.ok ? '' : '   [' + v.detail + ']'));
console.log(`\n${vysledky.length - padlo.length}/${vysledky.length} prošlo`);
process.exit(padlo.length ? 1 : 0);
