import { sendResend, esc, shell } from './_mail.js';
import { ulozPoptavku, oznacMail } from './_uloz.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (data.website && String(data.website).trim() !== '') {
      return json({ ok: true });
    }

    const name = (data.name || '').trim();
    const email = (data.email || '').trim();
    const phone = (data.phone || '').trim();
    if (!name || !email || !phone) {
      return json({ ok: false, error: 'Chybí povinné kontaktní údaje.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Neplatný e-mail.' }, 400);
    }

    const lead = {
      name,
      email,
      phone,
      model: (data.model || 'Nevím / poradíte').trim(),
      message: (data.message || '').trim()
    };

    const FROM = env.RESEND_FROM || 'Flexi House <onboarding@resend.dev>';
    const TO_US = (env.LEAD_TO_EMAIL || 'info@flexihouse.cz').split(',').map(e => e.trim()).filter(Boolean);

    const zaznamId = await ulozPoptavku(env, {
      typ: 'formular',
      jmeno: lead.name,
      email: lead.email,
      telefon: lead.phone,
      model: lead.model,
      zprava: lead.message,
      zdroj: [request.headers.get('Referer'), typeof data.vstup === 'string' ? data.vstup.slice(0, 400) : ''].filter(Boolean).join(' | ') || null
    });

    if (!env.RESEND_API_KEY) {
      await oznacMail(env, zaznamId, false, 'Chybí RESEND_API_KEY.');
      return json({ ok: false, error: 'Server není nakonfigurován (RESEND_API_KEY).' }, 500);
    }

    const r1 = await sendResend(env.RESEND_API_KEY, {
      from: FROM,
      to: TO_US,
      reply_to: lead.email,
      subject: `Nová poptávka z webu: ${lead.name}, ${lead.model}`,
      html: emailInternal(lead)
    });

    const r2 = await sendResend(env.RESEND_API_KEY, {
      from: FROM,
      to: [lead.email],
      subject: 'Děkujeme za poptávku, Flexi House',
      html: emailCustomer(lead)
    });

    await oznacMail(env, zaznamId, r1.ok, r1.detail);

    if (!r1.ok) {
      return json({ ok: false, error: 'E-mail se nepodařilo odeslat.', detail: r1.detail }, 502);
    }

    return json({ ok: true, customerEmailSent: r2.ok });
  } catch (err) {
    return json({ ok: false, error: 'Neočekávaná chyba.', detail: String(err) }, 500);
  }
}


function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}



function emailInternal(lead) {
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#5a7885;font-weight:700">Nová poptávka z webu</p>
      <h1 style="margin:0;font-size:22px;color:#16202a">${esc(lead.name)}</h1>
    </td></tr>
    <tr><td style="padding:14px 32px 6px">
      <table role="presentation" width="100%" style="background:#f4f7f8;border-radius:0;padding:16px 18px">
        <tr><td style="font-size:14px;color:#16202a;line-height:1.9">
          <strong>Telefon:</strong> <a href="tel:${esc(lead.phone)}" style="color:#3f5c69;text-decoration:none">${esc(lead.phone)}</a><br>
          <strong>E-mail:</strong> <a href="mailto:${esc(lead.email)}" style="color:#3f5c69;text-decoration:none">${esc(lead.email)}</a><br>
          <strong>Zájem o:</strong> ${esc(lead.model)}
          ${lead.message ? `<br><strong>Zpráva:</strong> ${esc(lead.message)}` : ''}
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 32px">
      <a href="mailto:${esc(lead.email)}" style="display:inline-block;background:#5a7885;color:#16202a;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:0">Odpovědět zákazníkovi</a>
    </td></tr>`;
  return shell(inner, `Nová poptávka od ${lead.name}, zájem o ${lead.model}`);
}

function emailCustomer(lead) {
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <h1 style="margin:0 0 8px;font-size:22px;color:#16202a">Děkujeme, ${esc(lead.name.split(' ')[0])}!</h1>
      <p style="margin:0;font-size:15px;color:#5b6b80;line-height:1.6">
        Přijali jsme vaši poptávku${lead.model && lead.model !== 'Nevím / poradíte' ? ` na <strong>${esc(lead.model)}</strong>` : ''}.
        Náš tým se vám ozve <strong>do 24 hodin</strong> s nezávaznou nabídkou a vším, co budete potřebovat vědět.
      </p>
    </td></tr>
    <tr><td style="padding:14px 32px 6px">
      <table role="presentation" width="100%" style="background:#eef2f4;border:1px solid #d8e2e6;border-radius:0"><tr>
        <td style="padding:18px 22px;font-size:14px;color:#16202a;line-height:1.7">
          Mezitím si můžete projít naše modely a sestavit si dům na míru v konfigurátoru na
          <a href="https://flexihouse.cz/katalog.html" style="color:#16202a;font-weight:700">flexihouse.cz</a>.
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:18px 32px 32px" align="center">
      <a href="tel:+420607321543" style="display:inline-block;background:#5a7885;color:#16202a;font-weight:700;font-size:15px;text-decoration:none;padding:14px 30px;border-radius:0">Máte dotaz? Zavolejte 607 321 543</a>
    </td></tr>`;
  return shell(inner, 'Přijali jsme vaši poptávku, ozveme se do 24 hodin.');
}
