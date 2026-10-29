import { json, chranene, nastaveni, ulozNastaveni, pridejZpravu, ted } from './_sanon.js';
import { gj, GMAIL, hlavicka, rozeberAdresu, teloZpravy } from './_google.js';
import { claude } from './_claude.js';

const SUM = /no-?reply|noreply|mailer-daemon|postmaster|notification|newsletter|donotreply|recap|digest|@google\.com$|@accounts\.google|@cloudflare|@resend|calendar-notification|@facebookmail|@mail\.instagram|@instagram|@linkedin|abuse@|support@|billing@|@stripe|@paypal|@apple\.com|@webnode|@wedos|@forpsi/i;
const VLASTNI = ['info@flexihouse.cz', 'prokes@winstores.cz', 'dandaprokes@gmail.com', 'honzalit@gmail.com', 'tomas@statly.cz', 'hasci.tomasek@gmail.com', 'poptavka@mojeviditelnost.cz'];

async function ignorovane(env) {
  const r = await nastaveni(env, 'ignorovat');
  return r ? JSON.parse(r) : [];
}

async function jeZakaznik(env, od, predmet, text) {
  if (!env.ANTHROPIC_API_KEY) return 'zakaznik';
  try {
    const { data } = await claude(env, {
      max_tokens: 60, json: true,
      system: 'Flexi House dodává modulové domy (Flexi Stanza, Tenuta, Office) zájemcům o bydlení, chatu, kancelář nebo glamping. Dostaneš mail, který přišel na firemní schránku od neznámé adresy. "zakaznik" = člověk nebo firma, která se ptá na dům, cenu, dodání, chce koupit nebo řeší svou objednávku; "dodavatel" = výrobce, spedice, jeřáb, doprava, řemeslník, kdo pro Flexi House něco dodává; "ostatni" = nabídky marketingu, SEO, reklamy, webů, bazarové inzeráty a portály, newslettery, notifikace, úřady, banky, nábor, pozvánky, cokoli, co není zákazník ani dodavatel. Když si nejsi jistý mezi zakaznik a ostatni, vyber ostatni jen pokud mail zjevně nic o domech neřeší. Vrať POUZE JSON {"typ":"zakaznik|dodavatel|ostatni"}.',
      messages: [{ role: 'user', content: `Od: ${od}\nPředmět: ${predmet}\nZačátek: ${text.slice(0, 500)}` }]
    });
    return ['zakaznik', 'dodavatel', 'ostatni'].includes(data.typ) ? data.typ : 'zakaznik';
  } catch {
    return 'zakaznik';
  }
}

const preskoc = async (env, id, m, duvod) => { await pridejZpravu(env, { kdy: new Date(Number(m.internalDate) || Date.now()).toISOString(), typ: 'skip', text: duvod, gmail_id: id, thread_id: m.threadId, nove: 0 }); return duvod; };

async function zpracuj(env, id, ign) {
  const m = await gj(env, `${GMAIL}/messages/${id}?format=full`);
  const labels = m.labelIds || [];
  if (labels.includes('SPAM') || labels.includes('TRASH') || labels.includes('DRAFT')) return preskoc(env, id, m, 'spam');
  const odeslany = labels.includes('SENT');
  const od = rozeberAdresu(hlavicka(m, 'From'));
  const komu = rozeberAdresu((hlavicka(m, 'To') || '').split(',')[0] || '');
  const protistrana = odeslany ? komu : od;
  if (!protistrana.adresa || VLASTNI.includes(protistrana.adresa)) return preskoc(env, id, m, 'vlastni');
  if (SUM.test(protistrana.adresa)) return preskoc(env, id, m, 'sum');
  const domena = protistrana.adresa.split('@')[1];
  if (ign.includes(protistrana.adresa) || ign.includes('@' + domena)) return preskoc(env, id, m, 'ignorovany');
  const kdy = new Date(Number(m.internalDate)).toISOString();
  const predmet = hlavicka(m, 'Subject') || '(bez předmětu)';
  const { text, prilohy } = teloZpravy(m);
  let zak = await env.DB.prepare('SELECT id FROM s_zakaznici WHERE lower(email) = ?').bind(protistrana.adresa).first();
  let dod = zak ? null : await env.DB.prepare('SELECT id FROM s_dodavatele WHERE lower(email) = ?').bind(protistrana.adresa).first();
  if (!zak && !dod) {
    if (odeslany) return preskoc(env, id, m, 'odeslany-neznamy');
    const typ = await jeZakaznik(env, hlavicka(m, 'From'), predmet, text);
    if (typ === 'ostatni') {
      await pridejZpravu(env, { kdy, typ: 'mail', text, predmet, gmail_id: id, thread_id: m.threadId, od_adresa: protistrana.adresa, nove: 0 });
      return 'ostatni';
    }
    if (typ === 'dodavatel') {
      const r = await env.DB.prepare('INSERT INTO s_dodavatele (nazev, co, kontakt, email) VALUES (?, ?, ?, ?)').bind(protistrana.jmeno || protistrana.adresa.split('@')[1], '', protistrana.jmeno || '', protistrana.adresa).run();
      dod = { id: r.meta.last_row_id };
    }
    const jmeno = protistrana.jmeno || protistrana.adresa.split('@')[0];
    if (!dod) {
      const r = await env.DB.prepare('INSERT INTO s_zakaznici (vzniklo, jmeno, telefon, email, misto, stav, majitel) VALUES (?, ?, ?, ?, ?, ?, NULL)')
        .bind(kdy, jmeno, '', protistrana.adresa, '', 'novy').run();
      zak = { id: r.meta.last_row_id };
    }
  }
  await pridejZpravu(env, {
    kdy, zak_id: zak ? zak.id : null, dod_id: dod ? dod.id : null, typ: 'mail', kdo: odeslany ? 'gmail' : null,
    text, predmet, prilohy: prilohy.map(p => ({ ...p, gmail_msg: id })), gmail_id: id, thread_id: m.threadId,
    od_adresa: protistrana.adresa, nove: !odeslany
  });
  return 'ok';
}

const DAVKA = 8;

export async function synchronizuj(env) {
  const posledni = await nastaveni(env, 'gmail_sync');
  const q = posledni ? `after:${Math.floor((Date.parse(posledni) - 3600000) / 1000)}` : 'newer_than:30d';
  const ids = [];
  let pageToken = '';
  do {
    const d = await gj(env, `${GMAIL}/messages?q=${encodeURIComponent(q + ' -in:spam -in:trash')}&maxResults=100${pageToken ? '&pageToken=' + pageToken : ''}`);
    (d.messages || []).forEach(x => ids.push(x.id));
    pageToken = d.nextPageToken || '';
  } while (pageToken && ids.length < 300);
  const zname = new Set();
  for (let i = 0; i < ids.length; i += 90) {
    const kus = ids.slice(i, i + 90);
    const { results } = await env.DB.prepare(`SELECT gmail_id FROM s_zpravy WHERE gmail_id IN (${kus.map(() => '?').join(',')})`).bind(...kus).all();
    results.forEach(r => zname.add(r.gmail_id));
  }
  const nove = ids.filter(id => !zname.has(id)).reverse();
  const ign = await ignorovane(env);
  const vysledky = {};
  for (const id of nove.slice(0, DAVKA)) {
    const v = await zpracuj(env, id, ign).catch(e => 'chyba: ' + e.message.slice(0, 80));
    vysledky[v] = (vysledky[v] || 0) + 1;
    if (v.startsWith('chyba: Google 403')) break;
  }
  const zbyva = Math.max(0, nove.length - DAVKA);
  if (!zbyva) await ulozNastaveni(env, 'gmail_sync', ted());
  return { zprav: ids.length, zpracovano: Math.min(nove.length, DAVKA), zbyva, vysledky };
}

export const onRequestPost = chranene(async ({ env }) => {
  if (!env.GOOGLE_REFRESH_TOKEN) return json(200, { google: false });
  const zamek = await nastaveni(env, 'gmail_sync_bezi');
  if (zamek && Date.now() - Number(zamek) < 40000) return json(200, { bezi: true });
  await ulozNastaveni(env, 'gmail_sync_bezi', String(Date.now()));
  try {
    return json(200, await synchronizuj(env));
  } finally {
    await ulozNastaveni(env, 'gmail_sync_bezi', '0');
  }
});
