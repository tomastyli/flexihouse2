import { onRequestPost } from '../../functions/api/admin/poptavka-stav.js';

const vysledky = [];
const zk = (n, ok, d) => vysledky.push({ n, ok: !!ok, d });

function db(zmeneno) {
  const zapsano = [];
  return {
    zapsano,
    prepare(sql) {
      const q = { sql, args: [] };
      q.bind = (...a) => { q.args = a; return q; };
      q.run = async () => { zapsano.push(q.args); return { meta: { changes: zmeneno } }; };
      q.first = async () => null;
      return q;
    }
  };
}

const req = (telo, cookie) => new Request('https://flexihouse.cz/api/admin/poptavka-stav', {
  method: 'POST',
  headers: cookie ? { 'content-type': 'application/json', Cookie: cookie } : { 'content-type': 'application/json' },
  body: JSON.stringify(telo)
});

// Platný token vyrobíme stejnou cestou jako login.
const { makeToken } = await import('../../functions/api/_uloz.js');
const env0 = { ADMIN_SECRET: 'tajne' };
const token = await makeToken(env0, 60000);

{
  const r = await onRequestPost({ request: req({ id: 1, vyrizeno: true }), env: { ...env0, DB: db(1) } });
  zk('bez přihlášení vrací 401', r.status === 401, 'status ' + r.status);
}
{
  const d = db(1);
  const r = await onRequestPost({ request: req({ id: 5, vyrizeno: true }, 'fh_admin=' + token), env: { ...env0, DB: d } });
  const j = await r.json();
  zk('označení vyřízené projde', r.status === 200 && j.ok && j.vyrizeno === 1, JSON.stringify(j));
  zk('ukládá čas vyřízení', typeof d.zapsano[0][1] === 'string' && d.zapsano[0][1].includes('T'), String(d.zapsano[0][1]));
  zk('ukládá správné id', d.zapsano[0][2] === 5, String(d.zapsano[0][2]));
}
{
  const d = db(1);
  await onRequestPost({ request: req({ id: 5, vyrizeno: false }, 'fh_admin=' + token), env: { ...env0, DB: d } });
  zk('odznačení maže čas', d.zapsano[0][0] === 0 && d.zapsano[0][1] === null, JSON.stringify(d.zapsano[0].slice(0, 2)));
}
{
  const r = await onRequestPost({ request: req({ id: 999, vyrizeno: true }, 'fh_admin=' + token), env: { ...env0, DB: db(0) } });
  zk('neexistující poptávka vrací 404', r.status === 404, 'status ' + r.status);
}
{
  const r = await onRequestPost({ request: req({ vyrizeno: true }, 'fh_admin=' + token), env: { ...env0, DB: db(1) } });
  zk('chybějící id vrací 400', r.status === 400, 'status ' + r.status);
}
{
  const r = await onRequestPost({ request: req({ id: 'abc', vyrizeno: true }, 'fh_admin=' + token), env: { ...env0, DB: db(1) } });
  zk('nečíselné id vrací 400', r.status === 400, 'status ' + r.status);
}

const padlo = vysledky.filter(v => !v.ok);
for (const v of vysledky) console.log((v.ok ? '  ok   ' : '  PADLO') + '  ' + v.n + (v.ok ? '' : '   [' + v.d + ']'));
console.log(`\n${vysledky.length - padlo.length}/${vysledky.length} prošlo`);
process.exit(padlo.length ? 1 : 0);
