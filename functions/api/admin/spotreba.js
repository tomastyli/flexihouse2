import { maDb, safeEqual } from '../_uloz.js';

// Ceny za milion tokenů v dolarech podle ceníku Anthropicu.
// Cache: zápis stojí 1,25 násobku vstupu, čtení 0,1 násobku.
const CENIK = {
  'claude-sonnet-5': { vstup: 3, vystup: 15 },
  'claude-opus-5': { vstup: 5, vystup: 25 },
  'claude-haiku-4-5': { vstup: 1, vystup: 5 }
};
const VYCHOZI = { vstup: 3, vystup: 15 };
const KURZ = 23;

export async function onRequestGet({ request, env }) {
  // Vlastní tajemství, ne admin heslo. Přehled spotřeby je podklad pro fakturaci,
  // nemá ho vidět ten, komu se fakturuje.
  const tajemstvi = env.PORADCE_STATS_SECRET;
  if (!tajemstvi) return json(404, { error: 'Nenalezeno.' });

  const url = new URL(request.url);
  const dane = url.searchParams.get('s') || request.headers.get('X-Poradce-Stats') || '';
  if (!safeEqual(dane, tajemstvi)) return json(404, { error: 'Nenalezeno.' });

  if (!maDb(env)) return json(500, { error: 'Databáze není připojená.' });

  const kurz = Number(env.KURZ_USD) > 0 ? Number(env.KURZ_USD) : KURZ;

  try {
    const { results } = await env.DB.prepare(
      "SELECT substr(vzniklo, 1, 10) AS den, model, COUNT(*) AS odpovedi, " +
      'SUM(COALESCE(tok_vstup,0)) AS vstup, SUM(COALESCE(tok_vystup,0)) AS vystup, ' +
      'SUM(COALESCE(tok_cache_zapis,0)) AS czapis, SUM(COALESCE(tok_cache_cteni,0)) AS ccteni ' +
      "FROM poradce_zpravy WHERE role = 'assistant' " +
      'GROUP BY den, model ORDER BY den DESC LIMIT 120'
    ).all();

    const dny = results || [];
    const dnes = new Date().toISOString().slice(0, 10);
    const predDny = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

    const soucet = (od) => {
      const vybrane = dny.filter(d => d.den >= od);
      let kc = 0, odpovedi = 0, vstup = 0, vystup = 0, czapis = 0, ccteni = 0;
      for (const d of vybrane) {
        kc += cena(d, kurz);
        odpovedi += d.odpovedi;
        vstup += d.vstup; vystup += d.vystup;
        czapis += d.czapis; ccteni += d.ccteni;
      }
      return {
        odpovedi,
        tokeny: { vstup, vystup, cacheZapis: czapis, cacheCteni: ccteni },
        kc: Math.round(kc * 100) / 100
      };
    };

    const bezUdaju = dny.filter(d => !d.vstup && !d.vystup && d.odpovedi > 0)
      .reduce((n, d) => n + d.odpovedi, 0);

    return json(200, {
      ok: true,
      kurz,
      dnes: soucet(dnes),
      za7dni: soucet(predDny(7)),
      za30dni: soucet(predDny(30)),
      podleDnu: dny.slice(0, 30).map(d => ({
        den: d.den,
        model: d.model,
        odpovedi: d.odpovedi,
        kc: Math.round(cena(d, kurz) * 100) / 100,
        cacheCteni: d.ccteni
      })),
      bezUdaju
    });
  } catch (e) {
    console.error('spotreba selhala:', e);
    return json(500, { error: 'Spotřebu se nepodařilo načíst.' });
  }
}

function cena(radek, kurz) {
  const c = CENIK[radek.model] || VYCHOZI;
  const usd =
    (radek.vstup / 1e6) * c.vstup +
    (radek.czapis / 1e6) * c.vstup * 1.25 +
    (radek.ccteni / 1e6) * c.vstup * 0.1 +
    (radek.vystup / 1e6) * c.vystup;
  return usd * kurz;
}

export async function onRequest() {
  return json(404, { error: 'Nenalezeno.' });
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
