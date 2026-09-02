import { onRequestGet } from '../../functions/api/admin/spotreba.js';

const vysledky = [];
const zk = (n, ok, d) => vysledky.push({ n, ok: !!ok, d });

function db(radky) {
  return {
    prepare() {
      const q = { bind: () => q, first: async () => null, all: async () => ({ results: radky }), run: async () => ({}) };
      return q;
    }
  };
}

const dnes = new Date().toISOString().slice(0, 10);
const radky = [
  { den: dnes, model: 'claude-sonnet-5', odpovedi: 10, vstup: 6000, vystup: 3000, czapis: 1500, ccteni: 13500 }
];

const req = (s) => new Request('https://flexihouse.cz/api/admin/spotreba' + (s ? '?s=' + s : ''));

{
  const r = await onRequestGet({ request: req('tajne'), env: { DB: db(radky) } });
  zk('bez nastaveného tajemství vrací 404', r.status === 404, 'status ' + r.status);
}
{
  const r = await onRequestGet({ request: req('spatne'), env: { DB: db(radky), PORADCE_STATS_SECRET: 'tajne' } });
  zk('špatný klíč vrací 404, ne 403', r.status === 404, 'status ' + r.status);
}
{
  const r = await onRequestGet({ request: req(), env: { DB: db(radky), PORADCE_STATS_SECRET: 'tajne' } });
  zk('bez klíče vrací 404', r.status === 404, 'status ' + r.status);
}
{
  const r = await onRequestGet({ request: req('tajne'), env: { DB: db(radky), PORADCE_STATS_SECRET: 'tajne' } });
  const d = await r.json();
  // 6000 vstup ×3 + 1500 zápis ×3×1,25 + 13500 čtení ×3×0,1 + 3000 výstup ×15, vše /1e6, ×23
  const cekano = ((6000 * 3 + 1500 * 3 * 1.25 + 13500 * 3 * 0.1 + 3000 * 15) / 1e6) * 23;
  zk('se správným klíčem vrací data', r.status === 200 && d.ok, 'status ' + r.status);
  zk('cena sedí na haléře', Math.abs(d.dnes.kc - Math.round(cekano * 100) / 100) < 0.01, `${d.dnes.kc} vs ${cekano.toFixed(4)}`);
  zk('počítá odpovědi', d.dnes.odpovedi === 10, String(d.dnes.odpovedi));
  zk('ukazuje čtení z cache', d.za30dni.tokeny.cacheCteni === 13500, String(d.za30dni.tokeny.cacheCteni));
}
{
  const bez = [{ den: dnes, model: 'claude-sonnet-5', odpovedi: 4, vstup: 0, vystup: 0, czapis: 0, ccteni: 0 }];
  const r = await onRequestGet({ request: req('tajne'), env: { DB: db(bez), PORADCE_STATS_SECRET: 'tajne' } });
  const d = await r.json();
  zk('odpovědi bez údajů se hlásí zvlášť', d.bezUdaju === 4, String(d.bezUdaju));
}
{
  const opus = [{ den: dnes, model: 'claude-opus-5', odpovedi: 1, vstup: 1e6, vystup: 0, czapis: 0, ccteni: 0 }];
  const r = await onRequestGet({ request: req('tajne'), env: { DB: db(opus), PORADCE_STATS_SECRET: 'tajne' } });
  const d = await r.json();
  zk('opus se počítá dráž než sonnet', Math.abs(d.dnes.kc - 5 * 23) < 0.01, String(d.dnes.kc));
}

const padlo = vysledky.filter(v => !v.ok);
for (const v of vysledky) console.log((v.ok ? '  ok   ' : '  PADLO') + '  ' + v.n + (v.ok ? '' : '   [' + v.d + ']'));
console.log(`\n${vysledky.length - padlo.length}/${vysledky.length} prošlo`);
process.exit(padlo.length ? 1 : 0);
