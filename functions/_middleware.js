export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    if (url.hostname.toLowerCase() === 'www.flexihouse.cz') {
      url.hostname = 'flexihouse.cz';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith('/.docs/')) {
      return new Response('Not found', { status: 404 });
    }
  } catch (e) {}
  return context.next();
}
