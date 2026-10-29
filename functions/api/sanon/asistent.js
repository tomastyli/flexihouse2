import { json, chranene, telo } from './_sanon.js';
import { claude, JMENA, STAVY, KROKY, dnesCz } from './_claude.js';

const den = iso => new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', timeZone: 'Europe/Prague' });

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const otazka = String(d.otazka || '').trim();
  if (!otazka) return json(400, { error: 'Prázdná otázka.' });
  const [zak, zpr, pri, zkz, dod] = await Promise.all([
    env.DB.prepare('SELECT id, jmeno, telefon, email, misto, stav, majitel, web, vzniklo FROM s_zakaznici ORDER BY id').all(),
    env.DB.prepare('SELECT zak_id, dod_id, kdy, typ, kdo, text, predmet, vysledek FROM s_zpravy ORDER BY kdy DESC LIMIT 600').all(),
    env.DB.prepare('SELECT komu, kdy, text, zak_id, dod_id FROM s_pripominky WHERE hotovo_kdy IS NULL ORDER BY kdy').all(),
    env.DB.prepare('SELECT * FROM s_zakazky').all(),
    env.DB.prepare('SELECT id, nazev, co FROM s_dodavatele').all()
  ]);
  const jm = {}; zak.results.forEach(z => jm['z' + z.id] = z.jmeno); dod.results.forEach(x => jm['d' + x.id] = x.nazev);
  const radkyZak = zak.results.map(z => { let w = null; try { w = JSON.parse(z.web || 'null'); } catch {} return `[z${z.id}] ${z.jmeno} | ${STAVY[z.stav] || z.stav} | má: ${z.majitel ? JMENA[z.majitel] : 'nikdo'} | ${z.misto || ''} | ${z.telefon || ''} ${z.email || ''}${w && w.model ? ' | web: ' + w.model + (w.cena ? ' ' + w.cena + ' Kč' : '') : ''} | od ${den(z.vzniklo)}`; });
  const radkyZkz = zkz.results.map(x => `[z${x.zak_id}] ${jm['z' + x.zak_id]}: ${x.model}, ${KROKY[x.krok] || x.krok}${x.kontejner ? ', kontejner ' + x.kontejner : ''}, předání ${x.predani}`);
  const radkyPri = pri.results.map(p => `${den(p.kdy)} ${JMENA[p.komu]}: ${p.text} (${p.zak_id ? '[z' + p.zak_id + '] ' + jm['z' + p.zak_id] : p.dod_id ? jm['d' + p.dod_id] : ''})`);
  const radkyZpr = zpr.results.map(m => `${den(m.kdy)} ${m.zak_id ? '[z' + m.zak_id + ']' : m.dod_id ? '[d' + m.dod_id + ']' : ''} ${m.typ}${m.kdo ? ' ' + (JMENA[m.kdo] || m.kdo) : ''}${m.vysledek ? ' ' + m.vysledek : ''}: ${(m.predmet ? m.predmet + ' / ' : '') + (m.text || '').replace(/\s+/g, ' ').slice(0, 220)}`);
  const system = `Jsi Asistent interního systému Šanon firmy Flexi House (dodává modulové domy z výroby, nevyrábí je). Dnes je ${dnesCz()}. Ptá se ${JMENA[kdo]}.
Odpovídej česky, stručně a věcně, jako kolega. Tykej. Bez úvodních frází. Když jmenuješ zákazníka, piš jeho jméno a hned za něj značku ve tvaru [z12], aby šla udělat odkaz. Když něco v datech není, řekni to; nic si nevymýšlej. Odpověď formátuj jako prostý text, odrážky pomlčkou "- " jsou v pořádku, žádný markdown navíc. Maximálně asi 150 slov, u výčtů klidně víc řádků.
Data:
ZÁKAZNÍCI
${radkyZak.join('\n')}
ZAKÁZKY
${radkyZkz.join('\n') || 'žádné'}
OTEVŘENÉ ÚKOLY
${radkyPri.join('\n') || 'žádné'}
POSLEDNÍ UDÁLOSTI (nejnovější první; typ: web = poptávka z webu, hovor, mail, pozn = poznámka, sys = změna)
${radkyZpr.join('\n')}`;
  const historie = Array.isArray(d.historie) ? d.historie.slice(-6).map(h => ({ role: h.role === 'ja' ? 'user' : 'assistant', content: String(h.text || '').slice(0, 2000) })) : [];
  const { text, usage } = await claude(env, { system, messages: [...historie, { role: 'user', content: otazka }], max_tokens: 700 });
  return json(200, { text, usage });
});
