import { json, chranene, telo } from './_sanon.js';
import { claude, JMENA, SLOZKY, dnesCz } from './_claude.js';

export const onRequestPost = chranene(async ({ request, env, kdo }) => {
  const d = await telo(request);
  const text = String(d.text || '').trim();
  const soubory = Array.isArray(d.soubory) ? d.soubory : [];
  const zakaznik = d.zakaznik || null;
  const system = `Jsi asistent interního systému Šanon firmy Flexi House (dodává modulové domy). Dnes je ${dnesCz()}. Píše ${JMENA[kdo]} (${kdo}), kolegové: Dan (dan), Honza (honza), Tomáš (tomas).
Dostaneš text poznámky, kterou někdo napsal nebo namluvil po hovoru se zákazníkem, a názvy přiložených souborů. Roztřiď to a vrať POUZE JSON:
{
 "poznamka": "stručné shrnutí ve 1 až 3 větách v češtině, bez vaty, zachovej fakta, čísla a jména; pokud je text už krátký, nech ho skoro beze změny",
 "pripominky": [{"komu": "dan|honza|tomas", "za_dni": číslo, "text": "co udělat, 3 až 8 slov"}],
 "soubory": [{"n": "název souboru", "slozka": "jedna z: ${SLOZKY.join(', ')}"}],
 "stav": null nebo "jednani|nabidka|zakazka|ztraceno" pokud z textu jasně plyne změna stavu
}
Připomínku vytvoř jen tehdy, když text obsahuje úkol nebo termín (zavolat, poslat, domluvit, ozvat se, připomenout). Když je úkol pro kolegu jmenovaného v textu, dej ho jemu, jinak tomu, kdo píše. Termín: "zítra" = 1, "v pátek" spočítej z dnešního dne, "za týden" = 7, bez termínu = 1. Nevymýšlej nic, co v textu není.`;
  const user = `Zákazník: ${zakaznik ? zakaznik.jmeno + (zakaznik.misto ? ', ' + zakaznik.misto : '') : 'neznámý'}\nText: ${text || '(bez textu)'}\nSoubory: ${soubory.length ? soubory.join(', ') : 'žádné'}`;
  const { data, usage } = await claude(env, { system, messages: [{ role: 'user', content: user }], max_tokens: 700, json: true });
  return json(200, { ...data, usage });
});
