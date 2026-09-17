// Společné pro odchozí maily. Dřív to žilo jen v send-lead.js, takže by se
// šablona poptávky a newsletteru dřív nebo později rozešla. Podtržítko v názvu
// znamená, že to Pages Functions neberou jako cestu.

export async function sendResend(apiKey, body) {
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

export const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function shell(inner, preheader) {
  return `<!DOCTYPE html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#eef2f4;font-family:Helvetica,Arial,sans-serif;color:#16202a">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader || '')}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f4;padding:28px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:0;overflow:hidden;border:1px solid #dde5e8">
      <tr><td style="background:#16202a;padding:26px 32px">
        <table role="presentation" width="100%"><tr>
          <td style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.5px">Flexi House</td>
          <td style="text-align:right;font-size:12px;color:#a9c0c9">Modulární domy</td>
        </tr></table>
      </td></tr>
      ${inner}
      <tr><td style="background:#f4f7f8;padding:22px 32px;border-top:1px solid #dde5e8">
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6">
          WINstores, s.r.o. · IČO 07836929 · Korunní 2569/108, Praha 10<br>
          +420 607 321 543 · info@flexihouse.cz · flexihouse.cz
        </p>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#94a3b8;margin:16px 0 0">© 2026 Flexi House. Nezávazná poptávka.</p>
  </td></tr>
</table>
</body></html>`;
}
