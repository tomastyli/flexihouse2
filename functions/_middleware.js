/* Pages nasazuje celý repozitář, takže na webu skončí i to, co se tam jen
   vyvíjí. Měřeno curlem na produkci: /_audit/konzistence.py, /.claude/serve.js
   i /.claude/settings.local.json vracely 200. Klíče v nich nebyly, ale interní
   nástroje a záznam příkazů na web nepatří.
   Sitemapa, robots.txt, site.webmanifest a ověřovací .txt musí projít. */
const NEVEREJNE = /^\/(\.docs|\.claude|_audit)(\/|$)|\.(md|py|sh|sql|mjs|yml|yaml|toml)$|^\/\.(gitignore|DS_Store|env)/i;

export async function onRequest(context) {
  try {
    const url = new URL(context.request.url);
    if (url.hostname.toLowerCase() === 'www.flexihouse.cz') {
      url.hostname = 'flexihouse.cz';
      return Response.redirect(url.toString(), 301);
    }
    if (NEVEREJNE.test(url.pathname)) {
      return new Response('Not found', { status: 404 });
    }
  } catch (e) {}
  return context.next();
}
