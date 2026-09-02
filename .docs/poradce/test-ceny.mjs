import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const zde = dirname(fileURLToPath(import.meta.url));
const baze = readFileSync(join(zde, 'baze.md'), 'utf8');
const konfig = readFileSync(join(zde, '..', '..', 'konfigurator.html'), 'utf8');

const chyby = [];
const cislo = (n) => Number(n).toLocaleString('cs-CZ').replace(/ /g, ' ');

const zaklad = konfig.match(/base:\s*(\d+)/);
if (!zaklad) chyby.push('V konfigurátoru se nepodařilo najít base.');
else if (!baze.includes(cislo(zaklad[1]))) {
  chyby.push(`Základní cena ${cislo(zaklad[1])} Kč v bázi není.`);
}

const volby = [];
for (const m of konfig.matchAll(/\{[^{}]*?label:'([^']+)'[^{}]*?\}/g)) {
  const blok = m[0];
  const cena = blok.match(/price:\s*(\d+)/);
  if (!cena || Number(cena[1]) === 0) continue;
  const km = blok.match(/perKm:\s*(\d+)/);
  volby.push({ label: m[1], cena: Number(cena[1]), km: km ? Number(km[1]) : null });
}

if (volby.length < 20) {
  chyby.push(`Načteno jen ${volby.length} placených voleb. Dřív jich test viděl míň, než jich bylo, a tiše to procházelo. Zkontroluj regulární výraz.`);
}

for (const v of volby) {
  if (!baze.includes(cislo(v.cena))) {
    chyby.push(`${v.label}: konfigurátor má ${cislo(v.cena)} Kč, v bázi ta částka není.`);
  }
  if (v.km && !baze.includes(`${v.km} Kč za kilometr`)) {
    chyby.push(`${v.label}: konfigurátor účtuje ${v.km} Kč za kilometr, v bázi to tak není.`);
  }
}

// Druhý směr: co tvrdí báze, musí existovat. Bez toho projdou i ceny zrušených položek.
const znameCastky = new Set([
  ...volby.map(v => cislo(v.cena)),
  cislo(zaklad ? zaklad[1] : 0),
  '70 000',
  '90 000',
  '80 000'
]);
for (const m of baze.matchAll(/(\d{1,3}(?: \d{3})+) Kč/g)) {
  if (!znameCastky.has(m[1])) {
    chyby.push(`Báze uvádí ${m[1]} Kč, ale taková položka v konfigurátoru není.`);
  }
}

// Služby, které firma podle konfigurátoru nedělá. Slíbit je by byla lež zákazníkovi.
const neposkytujeme = [
  { co: 'vyřízení povolení', zakazano: ['povolení vyřídíme', 'povolení za vás', 'vyřídit povolení', 'Vyřízení ohlášení'] },
  { co: 'připojení na sítě', zakazano: ['Připojení na sítě |', 'připojení na sítě za'] }
];
const micro = konfig.includes('Připojení na sítě ani vyřízení povolení neděláme');
if (micro) {
  for (const s of neposkytujeme) {
    for (const z of s.zakazano) {
      if (baze.toLowerCase().includes(z.toLowerCase())) {
        chyby.push(`Báze slibuje ${s.co}, ale konfigurátor říká, že to neděláme.`);
      }
    }
  }
}

if (chyby.length) {
  console.log('Báze se rozešla s konfigurátorem:\n');
  for (const c of [...new Set(chyby)]) console.log('  ' + c);
  console.log(`\n${new Set(chyby).size} rozporů. Srovnat baze.md a pustit sestav-bazi.mjs.`);
  process.exit(1);
}

console.log(`Ceny sedí: základ i ${volby.length} placených voleb, obousměrně.`);
