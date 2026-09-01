import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const zde = dirname(fileURLToPath(import.meta.url));
const zdroj = join(zde, 'baze.md');
const cil = join(zde, '..', '..', 'functions', 'api', '_poradce-baze.js');

const text = readFileSync(zdroj, 'utf8').trim();

writeFileSync(cil,
  'export const BAZE = ' + JSON.stringify(text) + ';\n',
  'utf8');

console.log(`Báze sestavena: ${text.length} znaků -> ${cil}`);
