export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'fh_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    }
  });
}

export async function onRequest() {
  return new Response(JSON.stringify({ error: 'Nepodporovaná metoda.' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
