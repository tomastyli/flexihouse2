import { maDb, hashIp } from './_uloz.js';
import { sendResend, esc, shell } from './_mail.js';

const KOD_ZNAKY = 'abcdefghijkmnpqrstuvwxyz23456789';

function odhlasovaciKod() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += KOD_ZNAKY[b % KOD_ZNAKY.length];
  return s;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (data.website && String(data.website).trim() !== '') {
      return json({ ok: true });
    }

    const email = (data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ ok: false, error: 'Zkontrolujte prosím e-mail, nevypadá jako platná adresa.' }, 400);
    }

    if (!maDb(env)) {
      return json({ ok: false, error: 'Přihlášení k novinkám zatím nefunguje, napište nám prosím přes formulář níž.' }, 503);
    }

    const ip = request.headers.get('CF-Connecting-IP') || '';
    await env.DB.prepare(
      'INSERT INTO newsletter (email, vzniklo, zdroj, odhlasovaci_kod) VALUES (?, ?, ?, ?) ' +
      'ON CONFLICT(email) DO NOTHING'
    ).bind(
      email,
      new Date().toISOString(),
      (request.headers.get('Referer') || '').slice(0, 300) || null,
      odhlasovaciKod()
    ).run();

    await env.DB.prepare('UPDATE newsletter SET ip_hash = ? WHERE email = ? AND ip_hash IS NULL')
      .bind(await hashIp(env, ip), email).run();

    // Kód se čte zpátky, ne z proměnné: při opakovaném přihlášení projde
    // ON CONFLICT DO NOTHING a v databázi zůstane ten původní.
    const radek = await env.DB.prepare(
      'SELECT odhlasovaci_kod FROM newsletter WHERE email = ?'
    ).bind(email).first();

    // Mail je jediné místo, kde se adresát dozví, jak se odhlásit. Když
    // odeslání selže, přihlášení tím nepadá, jen se to zapíše do logu.
    if (env.RESEND_API_KEY && radek && radek.odhlasovaci_kod) {
      const odkaz = 'https://flexihouse.cz/odhlasit?kod=' + encodeURIComponent(radek.odhlasovaci_kod);
      // Hlavička míří na API, protože jednoklik posílá POST a stránka ho neumí.
      const jednoklik = 'https://flexihouse.cz/api/odhlasit?kod=' + encodeURIComponent(radek.odhlasovaci_kod);
      const r = await sendResend(env.RESEND_API_KEY, {
        from: env.RESEND_FROM || 'Flexi House <onboarding@resend.dev>',
        to: email,
        subject: 'Jste přihlášeni k novinkám Flexi House',
        html: uvitaciMail(odkaz),
        headers: {
          'List-Unsubscribe': '<' + jednoklik + '>',
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
        }
      });
      if (!r.ok) console.error('newsletter, uvítací mail neodešel:', r.detail);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('newsletter selhal:', e);
    return json({ ok: false, error: 'Přihlášení se nepovedlo, zkuste to prosím za chvíli znovu.' }, 500);
  }
}

function uvitaciMail(odkaz) {
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <h1 style="margin:0 0 8px;font-size:22px;color:#16202a">Jste přihlášeni</h1>
      <p style="margin:0;font-size:15px;color:#5b6b80;line-height:1.6">
        Budeme vám psát, jen když bude co říct. Nové modely, změny v ceníku
        a hotové domy z výroby. Žádné hromadné reklamy.
      </p>
    </td></tr>
    <tr><td style="padding:18px 32px 32px" align="center">
      <a href="https://flexihouse.cz/konfigurator" style="display:inline-block;background:#5a7885;color:#16202a;font-weight:700;font-size:15px;text-decoration:none;padding:14px 30px">Sestavit si dům</a>
    </td></tr>
    <tr><td style="padding:0 32px 26px">
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
        Odhlásit se můžete kdykoli, stačí jedno kliknutí:
        <a href="${esc(odkaz)}" style="color:#5b6b80">odhlásit z novinek</a>.
      </p>
    </td></tr>`;
  return shell(inner, 'Jste přihlášeni k novinkám Flexi House.');
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
