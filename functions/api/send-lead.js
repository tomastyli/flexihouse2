export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

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
    const TO_US = (env.LEAD_TO_EMAIL || 'dandaprokes@gmail.com').split(',').map(e => e.trim()).filter(Boolean);

    if (!env.RESEND_API_KEY) {
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

    if (!r1.ok) {
      return json({ ok: false, error: 'E-mail se nepodařilo odeslat.', detail: r1.detail }, 502);
    }

    return json({ ok: true, customerEmailSent: r2.ok });
  } catch (err) {
    return json({ ok: false, error: 'Neočekávaná chyba.', detail: String(err) }, 500);
  }
}

async function sendResend(apiKey, body) {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    const detail = await res.text();
    return { ok: res.ok, detail };
  } catch (e) {
    return { ok: false, detail: String(e) };
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function shell(inner, preheader) {
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef2f7;font-family:Helvetica,Arial,sans-serif;color:#0b2545">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:28px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(11,37,69,.08)">
      <tr><td style="background:#0b2545;padding:26px 32px">
        <table role="presentation" width="100%"><tr>
          <td style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.5px">Flexi House</td>
          <td style="text-align:right;font-size:12px;color:#9fb3cc">Modulární domy</td>
        </tr></table>
      </td></tr>
      ${inner}
      <tr><td style="background:#f4f7fb;padding:22px 32px;border-top:1px solid #e6ebf2">
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
          WINstores, s.r.o. · IČO 07836929 · Korunní 2569/108, Praha 10<br>
          +420 607 321 543 · dandaprokes@gmail.com · flexihouse.cz
        </p>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#94a3b8;margin:16px 0 0">© 2026 Flexi House. Nezávazná poptávka.</p>
  </td></tr>
</table>
</body></html>`;
}

function emailInternal(lead) {
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#8dc63f;font-weight:700">Nová poptávka z webu</p>
      <h1 style="margin:0;font-size:22px;color:#0b2545">${esc(lead.name)}</h1>
    </td></tr>
    <tr><td style="padding:14px 32px 6px">
      <table role="presentation" width="100%" style="background:#f4f7fb;border-radius:12px;padding:16px 18px">
        <tr><td style="font-size:14px;color:#0b2545;line-height:1.9">
          <strong>Telefon:</strong> <a href="tel:${esc(lead.phone)}" style="color:#2a73c7;text-decoration:none">${esc(lead.phone)}</a><br>
          <strong>E-mail:</strong> <a href="mailto:${esc(lead.email)}" style="color:#2a73c7;text-decoration:none">${esc(lead.email)}</a><br>
          <strong>Zájem o:</strong> ${esc(lead.model)}
          ${lead.message ? `<br><strong>Zpráva:</strong> ${esc(lead.message)}` : ''}
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:8px 32px 32px">
      <a href="mailto:${esc(lead.email)}" style="display:inline-block;background:#8dc63f;color:#0b2545;font-weight:700;font-size:14px;text-decoration:none;padding:12px 24px;border-radius:999px">Odpovědět zákazníkovi</a>
    </td></tr>`;
  return shell(inner, `Nová poptávka od ${lead.name}, zájem o ${lead.model}`);
}

function emailCustomer(lead) {
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <h1 style="margin:0 0 8px;font-size:22px;color:#0b2545">Děkujeme, ${esc(lead.name.split(' ')[0])}!</h1>
      <p style="margin:0;font-size:15px;color:#5b6b80;line-height:1.6">
        Přijali jsme vaši poptávku${lead.model && lead.model !== 'Nevím / poradíte' ? ` na <strong>${esc(lead.model)}</strong>` : ''}.
        Náš tým se vám ozve <strong>do 24 hodin</strong> s nezávaznou nabídkou a vším, co budete potřebovat vědět.
      </p>
    </td></tr>
    <tr><td style="padding:14px 32px 6px">
      <table role="presentation" width="100%" style="background:#eef7da;border:1px solid #cfe6a3;border-radius:12px"><tr>
        <td style="padding:18px 22px;font-size:14px;color:#4d7c1a;line-height:1.7">
          Mezitím si můžete projít naše modely a sestavit si dům na míru v konfigurátoru na
          <a href="https://flexihouse.cz/katalog.html" style="color:#4d7c1a;font-weight:700">flexihouse.cz</a>.
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:18px 32px 32px" align="center">
      <a href="tel:+420607321543" style="display:inline-block;background:#8dc63f;color:#0b2545;font-weight:700;font-size:15px;text-decoration:none;padding:14px 30px;border-radius:999px">Máte dotaz? Zavolejte 607 321 543</a>
    </td></tr>`;
  return shell(inner, 'Přijali jsme vaši poptávku, ozveme se do 24 hodin.');
}
