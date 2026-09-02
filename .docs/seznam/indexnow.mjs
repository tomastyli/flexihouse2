import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const KOREN = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const klic = readdirSync(KOREN).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!klic) {
  console.error('Nenašel jsem klíč. V kořeni repa musí být soubor <32 hex znaků>.txt');
  process.exit(1);
}

const sitemap = readFileSync(join(KOREN, 'sitemap.xml'), 'utf8');
const vsechny = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const chtene = process.argv.slice(2);
const urlList = chtene.length
  ? chtene.map((c) => (c.startsWith('http') ? c : `https://flexihouse.cz${c.startsWith('/') ? c : '/' + c}`))
  : vsechny;

const nezname = urlList.filter((u) => !vsechny.includes(u));
if (nezname.length) {
  console.error('Tyhle adresy nejsou v sitemapě, nechci je posílat:\n  ' + nezname.join('\n  '));
  process.exit(1);
}

const telo = { host: 'flexihouse.cz', key: klic, keyLocation: `https://flexihouse.cz/${klic}.txt`, urlList };

const kontrola = await fetch(telo.keyLocation);
const obsah = kontrola.ok ? (await kontrola.text()).trim() : null;
if (obsah !== klic) {
  console.error(`Klíč není na webu dostupný nebo nesedí (${kontrola.status}). Nasaď nejdřív ${klic}.txt.`);
  process.exit(1);
}

for (const [jmeno, endpoint] of [
  ['Seznam', 'https://search.seznam.cz/indexnow'],
  ['Bing', 'https://www.bing.com/indexnow'],
]) {
  const r = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(telo),
  });
  console.log(`${jmeno.padEnd(7)} ${r.status} ${r.statusText}`);
}
console.log(`\nodesláno ${urlList.length} adres`);
