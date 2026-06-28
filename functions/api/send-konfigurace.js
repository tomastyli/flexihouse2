export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    const c = data.contact || {};
    if (!c.name || !c.email || !c.phone) {
      return json({ ok: false, error: 'Chybí povinné kontaktní údaje.' }, 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
      return json({ ok: false, error: 'Neplatný e-mail.' }, 400);
    }

    const FROM = env.RESEND_FROM || 'Flexi House <onboarding@resend.dev>';
    const TO_US = (env.LEAD_TO_EMAIL || 'dandaprokes@gmail.com').split(',').map(e => e.trim()).filter(Boolean);

    if (!env.RESEND_API_KEY) {
      return json({ ok: false, error: 'Server není nakonfigurován (RESEND_API_KEY).' }, 500);
    }

    const internalHtml = emailInternal(data);
    const customerHtml = emailCustomer(data);

    const r1 = await sendResend(env.RESEND_API_KEY, {
      from: FROM,
      to: TO_US,
      reply_to: c.email,
      subject: `Nová poptávka: ${data.modelName}, ${c.name} (${data.totalFormatted || ''})`,
      html: internalHtml
    });

    const r2 = await sendResend(env.RESEND_API_KEY, {
      from: FROM,
      to: [c.email],
      subject: `Vaše konfigurace ${data.modelName}, Flexi House`,
      html: customerHtml
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
const czk = (n) => new Intl.NumberFormat('cs-CZ').format(Number(n) || 0) + ' Kč';

function configRows(data) {
  const steps = data.configuration || [];
  let html = '';
  steps.forEach(step => {
    if (!step.items || !step.items.length) return;
    html += `<tr><td colspan="2" style="padding:16px 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;font-weight:700">${esc(step.step)}</td></tr>`;
    step.items.forEach(it => {
      html += `<tr>
        <td style="padding:7px 0;border-bottom:1px solid #eef2f7;color:#0b2545;font-size:14px">
          <span style="color:#5b6b80">${esc(it.group)}:</span> <strong>${esc(it.value)}</strong>
        </td>
        <td style="padding:7px 0;border-bottom:1px solid #eef2f7;text-align:right;color:#4d7c1a;font-weight:600;font-size:14px;white-space:nowrap">
          ${Number(it.price) > 0 ? '+ ' + czk(it.price) : '<span style="color:#94a3b8;font-weight:500">v ceně</span>'}
        </td></tr>`;
    });
  });
  return html;
}

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
    <p style="font-size:11px;color:#94a3b8;margin:16px 0 0">© 2026 Flexi House. Orientační kalkulace, nezávazná poptávka.</p>
  </td></tr>
</table>
</body></html>`;
}

function emailInternal(data) {
  const c = data.contact || {};
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:#8dc63f;font-weight:700">Nová poptávka z konfigurátoru</p>
      <h1 style="margin:0;font-size:22px;color:#0b2545">${esc(data.modelName)}</h1>
    </td></tr>

    <tr><td style="padding:14px 32px">
      <table role="presentation" width="100%" style="background:#f4f7fb;border-radius:12px;padding:16px 18px">
        <tr><td style="font-size:14px;color:#0b2545;line-height:1.9">
          <strong>Jméno:</strong> ${esc(c.name)}<br>
          <strong>Telefon:</strong> <a href="tel:${esc(c.phone)}" style="color:#2a73c7;text-decoration:none">${esc(c.phone)}</a><br>
          <strong>E-mail:</strong> <a href="mailto:${esc(c.email)}" style="color:#2a73c7;text-decoration:none">${esc(c.email)}</a>
          ${c.location ? `<br><strong>Lokalita:</strong> ${esc(c.location)}` : ''}
          ${c.message ? `<br><strong>Poznámka:</strong> ${esc(c.message)}` : ''}
        </td></tr>
      </table>
    </td></tr>

    <tr><td style="padding:8px 32px 0">
      <h2 style="font-size:15px;color:#0b2545;margin:12px 0 4px">Konfigurace</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${configRows(data)}</table>
    </td></tr>

    <tr><td style="padding:18px 32px 30px">
      <table role="presentation" width="100%" style="background:#0b2545;border-radius:12px"><tr>
        <td style="padding:18px 22px;font-size:13px;color:#9fb3cc">Orientační cena celkem (bez DPH)</td>
        <td style="padding:18px 22px;text-align:right;font-size:22px;font-weight:800;color:#b4dd6a">${esc(data.totalFormatted || czk(data.total))}</td>
      </tr></table>
    </td></tr>`;
  return shell(inner, `Nová poptávka ${data.modelName} od ${c.name}, ${data.totalFormatted || ''}`);
}

function emailCustomer(data) {
  const c = data.contact || {};
  const inner = `
    <tr><td style="padding:30px 32px 8px">
      <h1 style="margin:0 0 8px;font-size:22px;color:#0b2545">Děkujeme, ${esc(c.name.split(' ')[0])}!</h1>
      <p style="margin:0;font-size:15px;color:#5b6b80;line-height:1.6">
        Přijali jsme vaši konfiguraci modelu <strong>${esc(data.modelName)}</strong>.
        Náš tým se vám ozve <strong>do 24 hodin</strong> s nezávaznou nabídkou. Níže máte přehled toho, co jste si sestavili.
      </p>
    </td></tr>

    <tr><td style="padding:14px 32px 0">
      <h2 style="font-size:15px;color:#0b2545;margin:8px 0 4px">Vaše konfigurace</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${configRows(data)}</table>
    </td></tr>

    <tr><td style="padding:18px 32px 6px">
      <table role="presentation" width="100%" style="background:#eef7da;border:1px solid #cfe6a3;border-radius:12px"><tr>
        <td style="padding:18px 22px;font-size:13px;color:#4d7c1a;font-weight:600">Orientační cena</td>
        <td style="padding:18px 22px;text-align:right;font-size:22px;font-weight:800;color:#4d7c1a">${esc(data.totalFormatted || czk(data.total))}</td>
      </tr></table>
      <p style="margin:10px 2px 0;font-size:12px;color:#94a3b8;line-height:1.6">
        Cena je orientační (bez DPH) a slouží jako vodítko. Finální nabídku připravíme na míru vašemu pozemku a požadavkům.
      </p>
    </td></tr>

    <tr><td style="padding:18px 32px 32px" align="center">
      <a href="tel:+420607321543" style="display:inline-block;background:#8dc63f;color:#0b2545;font-weight:700;font-size:15px;text-decoration:none;padding:14px 30px;border-radius:999px">Máte dotaz? Zavolejte 607 321 543</a>
    </td></tr>`;
  return shell(inner, `Vaše konfigurace ${data.modelName}. Ozveme se do 24 hodin.`);
}
