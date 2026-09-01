import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const zde = dirname(fileURLToPath(import.meta.url));
const baze = readFileSync(join(zde, 'baze.md'), 'utf8');
const konfig = readFileSync(join(zde, '..', '..', 'konfigurator.html'), 'utf8');

const chyby = [];

const zaklad = konfig.match(/base:\s*(\d+)/);
if (!zaklad) chyby.push('V konfigurátoru se nepodařilo najít base.');
else if (!baze.includes(cislo(zaklad[1]))) {
  chyby.push(`Základní cena: konfigurátor má ${cislo(zaklad[1])} Kč, v bázi to není.`);
}

const volby = [...konfig.matchAll(/\{\s*id:'[\w-]+',\s*label:'([^']+)',(.*?)\}(?=\s*[,\]])/gs)]
  .map(m => {
    const cena = m[2].match(/price:\s*(\d+)/);
    const km = m[2].match(/perKm:\s*(\d+)/);
    return cena ? { label: m[1], cena: Number(cena[1]), km: km ? Number(km[1]) : null } : null;
  })
  .filter(v => v && v.cena > 0);

for (const v of volby) {
  if (!baze.includes(cislo(v.cena))) {
    chyby.push(`${v.label}: konfigurátor má ${cislo(v.cena)} Kč, v bázi ta částka není.`);
  }
  if (v.km && !baze.includes(`${v.km} Kč za kilometr`)) {
    chyby.push(`${v.label}: konfigurátor účtuje ${v.km} Kč za kilometr, v bázi to není.`);
  }
}

const zakazane = ['480 000', '45 000'];
for (const z of zakazane) {
  if (baze.includes(z)) chyby.push(`V bázi zůstala stará částka ${z} Kč.`);
}

function cislo(n) {
  return Number(n).toLocaleString('cs-CZ').replace(/ /g, ' ');
}

if (chyby.length) {
  console.log('Báze se rozešla s konfigurátorem:\n');
  for (const c of chyby) console.log('  ' + c);
  console.log(`\n${chyby.length} rozporů. Srovnat baze.md a pustit sestav-bazi.mjs.`);
  process.exit(1);
}

console.log(`Ceny sedí: základ i ${volby.length} placených voleb z konfigurátoru je v bázi.`);
