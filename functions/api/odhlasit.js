import { maDb } from './_uloz.js';

const KOD = /^[abcdefghijkmnpqrstuvwxyz23456789]{18}$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const kod = String(data.kod || '').trim().toLowerCase();

    if (!KOD.test(kod)) {
      return json({ ok: false, error: 'Odkaz na odhlášení je neúplný. Zkuste ho zkopírovat z e-mailu celý.' }, 400);
    }

    if (!maDb(env)) {
      return json({ ok: false, error: 'Odhlášení teď nejde provést. Napište nám na info@flexihouse.cz a odhlásíme vás ručně.' }, 503);
    }

    const radek = await env.DB.prepare(
      'SELECT email, odhlaseno FROM newsletter WHERE odhlasovaci_kod = ?'
    ).bind(kod).first();

    if (!radek) {
      return json({ ok: false, error: 'Tenhle odkaz neznáme. Možná už je adresa smazaná, pak vám nic nechodí.' }, 404);
    }

    if (!radek.odhlaseno) {
      await env.DB.prepare('UPDATE newsletter SET odhlaseno = ? WHERE odhlasovaci_kod = ?')
        .bind(new Date().toISOString(), kod).run();
    }

    return json({ ok: true, email: zamaskuj(radek.email), uzDrive: !!radek.odhlaseno });
  } catch (e) {
    console.error('odhlaseni selhalo:', e);
    return json({ ok: false, error: 'Odhlášení se nepovedlo. Napište nám na info@flexihouse.cz a uděláme to ručně.' }, 500);
  }
}

function zamaskuj(email) {
  const i = String(email).indexOf('@');
  if (i < 1) return '';
  const jmeno = email.slice(0, i);
  const viditelne = jmeno.slice(0, Math.min(2, jmeno.length));
  return viditelne + '…' + email.slice(i);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
