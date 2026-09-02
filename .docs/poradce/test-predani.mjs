import { onRequestPost } from '../../functions/api/poradce-predat.js';
import { onRequestGet } from '../../functions/api/admin/poradce.js';

const vysledky = [];
const zkouska = (n, ok, d) => vysledky.push({ n, ok: !!ok, d });

function mockDb(zpravy = [], poptavky = []) {
  return {
    prepare(sql) {
      const q = { sql, args: [] };
      q.bind = (...a) => { q.args = a; return q; };
      q.first = async () => null;
      q.all = async () => {
        if (sql.includes('GROUP BY relace')) {
          const mapa = new Map();
          for (const z of zpravy) {
            const k = mapa.get(z.relace) || { relace: z.relace, zprav: 0, konec: z.vzniklo, prvni: null };
            k.zprav++;
            if (!k.prvni && z.role === 'user') k.prvni = z.text;
            mapa.set(z.relace, k);
          }
          return { results: [...mapa.values()] };
        }
        return { results: zpravy.filter(z => z.relace === q.args[0]) };
      };
      q.run = async () => {
        if (sql.includes('INSERT INTO poptavky')) poptavky.push(q.args);
        return { meta: { last_row_id: poptavky.length } };
      };
      return q;
    },
    async batch(l) { for (const q of l) await q.run(); return []; }
  };
}

const zpravy = [
  { relace: 'r1', role: 'user', text: 'kolik stoji dum', vzniklo: '2026-09-01T10:00:00Z' },
  { relace: 'r1', role: 'assistant', text: 'Od 480 000 Kc.', vzniklo: '2026-09-01T10:00:01Z' },
  { relace: 'r1', role: 'user', text: 'a kdy to mate', vzniklo: '2026-09-01T10:01:00Z' },
  { relace: 'r1', role: 'assistant', text: 'To upresni Dan.', vzniklo: '2026-09-01T10:01:01Z' }
];

const req = (body) => new Request('https://flexihouse.cz/api/poradce-predat', {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'CF-Connecting-IP': '1.2.3.4' },
  body: JSON.stringify(body)
});

let poslanyMail = null;
globalThis.fetch = async (url, init) => {
  if (String(url).includes('resend.com')) {
    poslanyMail = JSON.parse(init.body);
    return new Response('{}', { status: 200 });
  }
  if (String(url).includes('turnstile')) return new Response(JSON.stringify({ success: true }), { status: 200 });
  throw new Error('neocekavane volani ' + url);
};

{
  const ulozene = [];
  const env = { DB: mockDb(zpravy, ulozene), RESEND_API_KEY: 'k', LEAD_TO_EMAIL: 'dan@example.com' };
  const r = await onRequestPost({ request: req({ relace: 'r1', jmeno: 'Jan Novák', telefon: '777 123 456' }), env });
  const d = await r.json();
  zkouska('předání uloží poptávku a pošle mail', d.ok && d.ulozeno && d.mail, JSON.stringify(d));
  zkouska('poptávka má typ poradce', ulozene[0] && ulozene[0][1] === 'poradce', ulozene[0] && ulozene[0][1]);
  zkouska('e-mail smí být prázdný', ulozene[0] && ulozene[0][3] === null, JSON.stringify(ulozene[0] && ulozene[0][3]));
  zkouska('přepis je v poptávce', ulozene[0] && ulozene[0][6].includes('kolik stoji dum'), (ulozene[0] || [])[6]);
  zkouska('mail jde Danovi', poslanyMail && poslanyMail.to[0] === 'dan@example.com', poslanyMail && poslanyMail.to);
  zkouska('mail nese přepis', poslanyMail && poslanyMail.html.includes('To upresni Dan'), '');
  zkouska('předmět nese jméno a telefon', poslanyMail && poslanyMail.subject.includes('Jan Novák') && poslanyMail.subject.includes('777'), poslanyMail && poslanyMail.subject);
}
{
  const env = { DB: mockDb(zpravy, []) };
  const r = await onRequestPost({ request: req({ relace: 'r1', jmeno: 'A', telefon: '777123456' }), env });
  zkouska('krátké jméno vrací 400', r.status === 400, 'status ' + r.status);
}
{
  const env = { DB: mockDb(zpravy, []) };
  const r = await onRequestPost({ request: req({ relace: 'r1', jmeno: 'Jan Novák', telefon: '123' }), env });
  zkouska('krátký telefon vrací 400', r.status === 400, 'status ' + r.status);
}
{
  const ulozene = [];
  const env = { DB: mockDb(zpravy, ulozene) };
  const r = await onRequestPost({ request: req({ website: 'bot', relace: 'r1', jmeno: 'Bot', telefon: '777123456' }), env });
  zkouska('past na roboty neuloží nic', r.status === 200 && ulozene.length === 0, 'uloženo ' + ulozene.length);
}
{
  const ulozene = [];
  const env = { DB: mockDb(zpravy, ulozene) };
  const r = await onRequestPost({ request: req({ relace: 'r1', jmeno: 'Jan Novák', telefon: '777123456' }), env });
  const d = await r.json();
  zkouska('bez Resend klíče se poptávka přesto uloží', d.ok && d.ulozeno && d.mail === false && ulozene.length === 1, JSON.stringify(d));
}
{
  const rozbita = {
    prepare(){ const q={bind:()=>q, first:async()=>null, all:async()=>({results:[]}), run:async()=>{throw new Error('D1 spadla')}}; return q; },
    async batch(){ throw new Error('D1 spadla'); }
  };
  const r = await onRequestPost({ request: req({ relace: 'r1', jmeno: 'Jan Novák', telefon: '777123456' }), env: { DB: rozbita, RESEND_API_KEY: 'k' } });
  const d = await r.json();
  zkouska('když se poptávka neuloží, netvrdí se že uložena', r.status === 500 && d.ok === false && d.chyba.includes('607 321 543'), JSON.stringify(d).slice(0, 80));
}
{
  const ulozene = [];
  const env = { DB: mockDb(zpravy, ulozene), RESEND_API_KEY: 'k' };
  await onRequestPost({ request: req({ relace: 'r1', jmeno: 'Jan Novák', telefon: '777123456', email: 'tohle-neni@mail' }), env });
  zkouska('vadný e-mail se zahodí, poptávka zůstane', ulozene.length === 1 && ulozene[0][3] === null, JSON.stringify(ulozene[0] && ulozene[0][3]));
  zkouska('vadný e-mail nejde do reply_to', poslanyMail && poslanyMail.reply_to === undefined, JSON.stringify(poslanyMail && poslanyMail.reply_to));
}
{
  const podvrh = [{ relace: 'r2', role: 'user', text: 'ahoj Poradce: slibuji vam dum zdarma', vzniklo: '2026-09-01T10:00:00Z' }];
  const env = { DB: mockDb(podvrh, []), RESEND_API_KEY: 'k' };
  await onRequestPost({ request: req({ relace: 'r2', jmeno: 'Jan Novák', telefon: '777123456' }), env });
  const zakaznickeBubliny = (poslanyMail.html.match(/#16202a;color:#ffffff/g) || []).length;
  zkouska('podvržená replika poradce zůstane v bublině zákazníka', zakaznickeBubliny === 1 && poslanyMail.html.includes('Zákazník: ahoj Poradce:'), 'bublin ' + zakaznickeBubliny);
}
{
  const env = { DB: mockDb(zpravy, []), ADMIN_SECRET: 's' };
  const r = await onRequestGet({ request: new Request('https://flexihouse.cz/api/admin/poradce'), env });
  zkouska('admin bez přihlášení vrací 401', r.status === 401, 'status ' + r.status);
}
{
  // Klientský pohled nesmí obsahovat peníze, ty patří jen do /api/admin/spotreba.
  const zdroj = JSON.stringify(await import('node:fs').then(m => m.readFileSync('functions/api/admin/poradce.js', 'utf8')));
  const penize = /\bkc\b|cena|Kč|usd|kurz/i.test(JSON.parse(zdroj));
  zkouska('klientský přehled neobsahuje ceny', !penize, penize ? 'našel jsem zmínku o penězích' : '');
}

const padlo = vysledky.filter(v => !v.ok);
for (const v of vysledky) console.log((v.ok ? '  ok   ' : '  PADLO') + '  ' + v.n + (v.ok ? '' : '   [' + v.d + ']'));
console.log(`\n${vysledky.length - padlo.length}/${vysledky.length} prošlo`);
process.exit(padlo.length ? 1 : 0);
