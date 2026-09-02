import { maDb, ulozPoptavku, oznacMail } from './_uloz.js';

const MAX_TELA = 4096;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get('CF-Connecting-IP') || 'neznama';

  try {
    const raw = await request.text();
    if (raw.length > MAX_TELA) return json({ ok: false, chyba: 'Požadavek je moc velký.' }, 413);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ ok: false, chyba: 'Neplatný požadavek.' }, 400);
    }

    if (data.website && String(data.website).trim() !== '') return json({ ok: true });

    const relace = typeof data.relace === 'string' ? data.relace.slice(0, 64) : '';
    const jmeno = String(data.jmeno || '').trim().slice(0, 120);
    const telefon = String(data.telefon || '').trim().slice(0, 40);
    let email = String(data.email || '').trim().slice(0, 160);
    // E-mail je nepovinný. Když je vadný, zahodíme ho, ale poptávku o něj nepřipravíme:
    // překlep v nepovinném poli nesmí stát kvalifikovaného zájemce.
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) email = '';
    const prani = String(data.prani || '').trim().slice(0, 300);

    if (jmeno.length < 2) return json({ ok: false, chyba: 'Doplňte prosím jméno.' }, 400);
    if (telefon.replace(/\D/g, '').length < 9) {
      return json({ ok: false, chyba: 'Doplňte prosím telefon, na kterém vás zastihneme.' }, 400);
    }

    if (!await overTurnstile(env, data.turnstile, ip)) {
      return json({ ok: false, chyba: 'Ověření se nepodařilo. Zkuste to prosím znovu.' }, 403);
    }

    const prepis = await nactiPrepis(env, relace);
    const prepisText = prepis
      .map(z => `${z.role === 'user' ? 'Zákazník' : 'Poradce'}: ${z.text}`)
      .join('\n');
    const zprava = [
      prani ? `Přání: ${prani}` : '',
      prepisText ? `Z konverzace s poradcem:\n${prepisText}` : 'Konverzace s poradcem není k dispozici.'
    ].filter(Boolean).join('\n\n');

    const zaznamId = await ulozPoptavku(env, {
      typ: 'poradce',
      jmeno,
      email,
      telefon,
      model: prani ? 'Dům na míru' : null,
      zprava,
      zdroj: request.headers.get('Referer') || null
    });

    if (zaznamId == null) {
      console.error('predani: poptavku se nepodarilo ulozit');
      return json({
        ok: false,
        chyba: 'Kontakt se nepodařilo uložit. Zavolejte prosím Danovi na 607 321 543.'
      }, 500);
    }

    if (!env.RESEND_API_KEY) {
      await oznacMail(env, zaznamId, false, 'Chybí RESEND_API_KEY.');
      return json({ ok: true, ulozeno: true, mail: false });
    }

    const komu = (env.LEAD_TO_EMAIL || 'dandaprokes@gmail.com').split(',').map(e => e.trim()).filter(Boolean);
    const odeslano = await posli(env, {
      from: env.RESEND_FROM || 'Flexi House <onboarding@resend.dev>',
      to: komu,
      reply_to: email || undefined,
      subject: `Poradce předává kontakt: ${jmeno}, ${telefon}`,
      html: sablona({ jmeno, telefon, email, prani, prepis })
    });

    await oznacMail(env, zaznamId, odeslano.ok, odeslano.chyba);
    return json({ ok: true, ulozeno: true, mail: odeslano.ok });
  } catch (e) {
    console.error('predani selhalo:', e);
    return json({ ok: false, chyba: 'Nepodařilo se předat kontakt. Zavolejte prosím na 607 321 543.' }, 500);
  }
}

async function nactiPrepis(env, relace) {
  if (!maDb(env) || !relace) return [];
  try {
    const { results } = await env.DB.prepare(
      'SELECT role, text FROM poradce_zpravy WHERE relace = ? ORDER BY id LIMIT 40'
    ).bind(relace).all();
    return results || [];
  } catch (e) {
    console.error('nacteni prepisu selhalo:', e);
    return [];
  }
}

async function overTurnstile(env, token, ip) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: ip })
    });
    const d = await r.json();
    return !!d.success;
  } catch {
    return false;
  }
}

async function posli(env, mail) {
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${env.RESEND_API_KEY}`
      },
      body: JSON.stringify(mail)
    });
    if (!r.ok) return { ok: false, chyba: `Resend ${r.status}: ${(await r.text()).slice(0, 200)}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, chyba: String(e).slice(0, 200) };
  }
}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sablona({ jmeno, telefon, email, prani, prepis }) {
  // Role se bere z databáze, ne z prefixu textu, jinak si ji návštěvník napíše sám.
  const radky = prepis.length
    ? prepis.map(z => {
        const zakaznik = z.role === 'user';
        const kdo = zakaznik ? 'Zákazník' : 'Poradce';
        return `<p style="margin:0 0 8px;padding:9px 12px;background:${zakaznik ? '#16202a' : '#eef2f4'};color:${zakaznik ? '#ffffff' : '#16202a'};font-size:14px;line-height:1.5">${esc(kdo)}: ${esc(z.text)}</p>`;
      }).join('')
    : '<p style="margin:0;color:#5a7885;font-size:14px">Konverzace není k dispozici.</p>';

  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#16202a">
  <p style="margin:0 0 4px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5a7885">Poradce předává kontakt</p>
  <h1 style="margin:0 0 18px;font-size:22px">${esc(jmeno)}</h1>
  <p style="margin:0 0 6px;font-size:16px"><a href="tel:${esc(telefon)}" style="color:#16202a">${esc(telefon)}</a></p>
  ${email ? `<p style="margin:0 0 6px;font-size:16px"><a href="mailto:${esc(email)}" style="color:#16202a">${esc(email)}</a></p>` : ''}
  ${prani ? `<p style="margin:14px 0 0;padding:12px;background:#eef2f4;font-size:15px"><strong>Přání:</strong> ${esc(prani)}</p>` : ''}
  <h2 style="margin:26px 0 10px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:#5a7885">Průběh konverzace</h2>
  ${radky}
  <p style="margin:22px 0 0;font-size:13px;color:#5a7885">Odesláno z poradce na flexihouse.cz.</p>
</div>`;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}
