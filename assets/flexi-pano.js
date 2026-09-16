/**
 * Prohlídka interiéru v panoramatech.
 *
 * Každý bod domu je jeden snímek 360 x 180 stupňů z Blenderu. Tažením se
 * v něm rozhlížíš, na podlaze svítí body ostatních místností a kliknutím se
 * do nich přeneseš. Souřadnice bodů jsou tytéž, ze kterých se renderovalo,
 * takže značka sedí tam, kde to místo doopravdy je.
 *
 * Vlastní WebGL, žádná knihovna. Three.js by tuhle jednu úlohu zaplatil
 * 787 kB, a ty jsme se z konfigurátoru právě zbavili.
 */
(function (global) {
  'use strict';

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  // Pro každý pixel se spočítá směr paprsku, otočí podle pohledu a převede
  // na zeměpisnou délku a šířku, kterými se vzorkuje panorama. Tím se
  // zakřivení projekce narovná zpátky.
  var FS = [
    'precision highp float;',
    'uniform sampler2D t;uniform vec2 res;uniform float yaw,pitch,fov;',
    'const float PI=3.14159265;',
    'const float LONP=3.14159265;',  // plnych 360 stupnu
    'const float LATP=1.5707963;',   // a 180 svisle
    'void main(){',
    // Vynasobeni dvema je dulezite: bez nej sahaji kraje platna jen do
    // poloviny zorneho uhlu, takze fov znamenal neco jineho nez svisly zorny
    // uhel a zabery byly dvakrat uzsi. Zbytek souboru i znacky na podlaze
    // pocitaji s tim, ze fov je svisly zorny uhel.
    '  vec2 q=(gl_FragCoord.xy-0.5*res)*2.0/res.y;',
    '  float f=1.0/tan(fov*0.5);',
    '  vec3 d=normalize(vec3(q.x,q.y,f));',
    '  float cp=cos(pitch),sp=sin(pitch);',
    '  d=vec3(d.x,d.y*cp-d.z*sp,d.y*sp+d.z*cp);',
    '  float cy=cos(yaw),sy=sin(yaw);',
    '  d=vec3(d.x*cy+d.z*sy,d.y,-d.x*sy+d.z*cy);',
    '  float lon=atan(d.x,d.z),lat=asin(clamp(d.y,-1.0,1.0));',
    // Panorama pokrývá 180 stupňů vodorovně a 70 svisle, ne celou kouli.
    // Za okrajem se vzorkuje mimo obrázek, proto se tam kreslí pozadí scény.
    '  if (abs(lon)>LONP||abs(lat)>LATP){gl_FragColor=vec4(0.17,0.18,0.19,1.0);return;}',
    // fract kolem délky obtočí panorama dokola i bez REPEAT. WebGL 1 totiž
    // opakování na textuře, která není mocninou dvou, odmítne a vykreslí ji
    // černou; 11520 x 5760 taková je.
    // Zeměpisná délka se dělí celým rozsahem panoramatu, ne jeho dvojnásobkem.
    // S přebytečnou půlkou se do celého záběru vešla jen polovina snímku,
    // obraz byl vodorovně dvakrát roztažený a rovné hrany se prohýbaly.
    '  gl_FragColor=texture2D(t,vec2(fract(lon/(2.0*LONP)+0.5),0.5-lat/(2.0*LATP)));',
    '}'
  ].join('\n');

  function Pano(host) {
    var cv = document.createElement('canvas');
    cv.className = 'fp__platno';
    host.appendChild(cv);
    var gl = cv.getContext('webgl', { antialias: false, alpha: false });
    if (!gl) return null;

    function shader(typ, zdroj) {
      var s = gl.createShader(typ);
      gl.shaderSource(s, zdroj); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    var pr = gl.createProgram();
    gl.attachShader(pr, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    // Obě osy se ořezávají. Vodorovné obtočení dělá fract v shaderu, protože
    // REPEAT by u textury mimo mocninu dvou vykreslil černou plochu.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var U = {
      res: gl.getUniformLocation(pr, 'res'), yaw: gl.getUniformLocation(pr, 'yaw'),
      pitch: gl.getUniformLocation(pr, 'pitch'), fov: gl.getUniformLocation(pr, 'fov')
    };
    var MAX = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var yaw = 0, pitch = 0, fov = 1.15, maPanorama = false, ceka = false;
    var sirkaTex = 0;

    // Nejmenší zorný úhel, při kterém se panorama ještě nemusí roztahovat.
    // Zdroj má sirkaTex/360 pixelů na stupeň, plátno potřebuje cv.width
    // děleno vodorovným zorným úhlem. Přiblížení se zastaví přesně tam, kde
    // by jedna z těch dvou čísel přerostlo druhé, takže obraz nikdy nezměkne.
    // Na velkém monitoru vyjde mez nad výchozí úhel a přiblížit nejde vůbec.
    function mezPribliz() {
      if (!sirkaTex || !cv.width || !cv.height) return 0.55;
      var fovHmin = cv.width * 360 / sirkaTex;
      if (fovHmin >= 170) return 1.6;
      var fovVmin = 2 * Math.atan(Math.tan(fovHmin * Math.PI / 360) * cv.height / cv.width);
      return Math.min(1.6, fovVmin);
    }

    function rozmer() {
      var d = Math.min(global.devicePixelRatio || 1, 2);
      var w = Math.round(host.clientWidth * d), h = Math.round(host.clientHeight * d);
      if (!w || !h) return false;
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      return true;
    }
    function kresli() {
      ceka = false;
      if (!maPanorama || !rozmer()) return;
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(U.res, cv.width, cv.height);
      gl.uniform1f(U.yaw, yaw); gl.uniform1f(U.pitch, pitch); gl.uniform1f(U.fov, fov);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (naZmenu) naZmenu(yaw, pitch, fov);
    }
    function naplanuj() {
      if (ceka) return;
      ceka = true;
      global.requestAnimationFrame(kresli);
    }

    var naZmenu = null;
    var LONP = Math.PI, LATP = Math.PI / 2;
    function omez() {
      // Svisle se dá koukat jen do takové výšky, aby výřez nepřetekl přes pól.
      var my = Math.max(0, LATP - fov / 2);
      pitch = Math.max(-my, Math.min(my, pitch));
      // Vodorovně se u plné koule NIC neomezuje, jen se úhel drží v rozsahu
      // plus minus pí. Předtím se ořezával stejně jako svislý a divák se
      // nemohl otočit dokola: ze 360 stupňů jich bylo 82 nedostupných.
      if (LONP >= Math.PI - 1e-6) {
        yaw = ((yaw + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
        return;
      }
      var pomer = cv.clientWidth && cv.clientHeight ? cv.clientWidth / cv.clientHeight : 1.6;
      var fovH = 2 * Math.atan(Math.tan(fov / 2) * pomer);
      var mx = Math.max(0, LONP - fovH / 2);
      yaw = Math.max(-mx, Math.min(mx, yaw));
    }

    // Bez tohohle si tažení po scéně vezme prohlížeč na posun stránky
    // a na telefonu se pohled neotočí vůbec.
    host.style.touchAction = 'none';

    // Sledují se všechny prsty. Jedním se otáčí, dvěma přibližuje. Kolečko
    // myši na telefonu není, takže bez druhého prstu tam přiblížit nešlo.
    var prsty = new Map();
    function stred() {
      var x = 0, y = 0;
      prsty.forEach(function (p) { x += p.x; y += p.y; });
      return { x: x / prsty.size, y: y / prsty.size };
    }
    function rozestup() {
      var b = [];
      prsty.forEach(function (p) { b.push(p); });
      if (b.length < 2) return 0;
      return Math.sqrt((b[0].x - b[1].x) * (b[0].x - b[1].x) + (b[0].y - b[1].y) * (b[0].y - b[1].y));
    }

    // Setrvačnost. Bez ní se musí každé otočení dotáhnout rukou až do konce
    // a na myši dojde stůl dřív než pohled. Rychlost se průběžně vyhlazuje,
    // po puštění dobíhá a tlumí se, dokud nespadne pod práh.
    var rychlostX = 0, rychlostY = 0, dobih = 0, animace = 0;
    var klidnePohyby = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function zastavPohyb() {
      if (dobih) { global.cancelAnimationFrame(dobih); dobih = 0; }
      if (animace) { global.cancelAnimationFrame(animace); animace = 0; }
      rychlostX = 0; rychlostY = 0;
    }
    function dobihej() {
      dobih = 0;
      if (Math.abs(rychlostX) < 0.00012 && Math.abs(rychlostY) < 0.00012) return;
      yaw -= rychlostX;
      pitch += rychlostY;
      rychlostX *= 0.93;
      rychlostY *= 0.93;
      omez(); naplanuj();
      dobih = global.requestAnimationFrame(dobihej);
    }

    // Klepnutí bez tažení se bere jako "podívej se sem". Rozpozná se podle
    // toho, o kolik se ukazatel mezitím pohnul; pod pár pixely to klepnutí je.
    var zacatekX = 0, zacatekY = 0, ujeto = 0, naPlatne = false;
    host.addEventListener('pointerdown', function (e) {
      if (!maPanorama) return;
      zastavPohyb();
      prsty.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (prsty.size === 1) {
        zacatekX = e.clientX; zacatekY = e.clientY; ujeto = 0;
        naPlatne = e.target === cv;
      }
      host.classList.add('je-tazena');
      if (host.setPointerCapture) host.setPointerCapture(e.pointerId);
    });
    host.addEventListener('pointermove', function (e) {
      if (!prsty.has(e.pointerId)) return;
      e.preventDefault();
      var predS = stred(), predR = rozestup();
      prsty.set(e.pointerId, { x: e.clientX, y: e.clientY });
      var poS = stred(), poR = rozestup();
      // Obraz jde přesně za prstem: svislý zorný úhel pokrývá výšku plátna,
      // takže radián na pixel je fov děleno výškou. Žádný odhadnutý násobek.
      var k = fov / (cv.clientHeight || 1);
      var dx = (poS.x - predS.x) * k, dy = (poS.y - predS.y) * k;
      yaw -= dx;
      pitch += dy;
      // Vyhlazená rychlost, ať doběh nekopíruje poslední trhnutí myší.
      rychlostX = rychlostX * 0.6 + dx * 0.4;
      rychlostY = rychlostY * 0.6 + dy * 0.4;
      ujeto = Math.max(ujeto,
        Math.abs(poS.x - zacatekX) + Math.abs(poS.y - zacatekY));
      if (predR > 0 && poR > 0) fov = Math.max(mezPribliz(), Math.min(1.6, fov * predR / poR));
      omez(); naplanuj();
    });
    ['pointerup', 'pointercancel'].forEach(function (u) {
      host.addEventListener(u, function (e) {
        var bylJeden = prsty.size === 1;
        prsty.delete(e.pointerId);
        if (prsty.size) return;
        host.classList.remove('je-tazena');
        if (bylJeden && naPlatne && ujeto < 6 && u === 'pointerup' && !klidnePohyby) {
          var r = host.getBoundingClientRect();
          var cil = API.zamer(e.clientX - r.left, e.clientY - r.top);
          if (cil) { API.prejed(cil, 460); return; }
        }
        if (!klidnePohyby && !dobih) dobih = global.requestAnimationFrame(dobihej);
      });
    });
    // Klávesnice. Prohlídky Matterportu si na úvodní obrazovku samy píšou
    // "use arrow keys", protože bez ní se v tom nedá pohybovat od klávesnice.
    cv.tabIndex = 0;
    cv.setAttribute('role', 'application');
    // Bez jména je to pro čtečku jen "application" a nikdo se nedozví,
    // co to je ani jak to ovládat.
    cv.setAttribute('aria-label',
      'Panorama místnosti. Šipkami se rozhlédnete, klávesami plus a minus přiblížíte.');
    cv.addEventListener('keydown', function (e) {
      if (!maPanorama) return;
      var k = e.key, krok = fov * 0.16;
      var zmena = true;
      if (k === 'ArrowLeft') yaw -= krok;
      else if (k === 'ArrowRight') yaw += krok;
      else if (k === 'ArrowUp') pitch += krok;
      else if (k === 'ArrowDown') pitch -= krok;
      else if (k === '+' || k === '=') fov = Math.max(mezPribliz(), fov - 0.08);
      else if (k === '-' || k === '_') fov = Math.min(1.6, fov + 0.08);
      else zmena = false;
      if (!zmena) return;
      e.preventDefault();
      zastavPohyb();
      omez(); naplanuj();
    });

    host.addEventListener('wheel', function (e) {
      if (!maPanorama) return;
      e.preventDefault();
      zastavPohyb();
      fov = Math.max(mezPribliz(), Math.min(1.6, fov + (e.deltaY > 0 ? 0.06 : -0.06)));
      omez(); naplanuj();
    }, { passive: false });
    global.addEventListener('resize', naplanuj);

    var API = {
      nahraj: function (url) {
        return new Promise(function (hotovo, chyba) {
          var im = new Image();
          im.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
            sirkaTex = im.naturalWidth;
            rozmer();
            // Menší panorama může zvednout mez přiblížení nad aktuální úhel.
            fov = Math.max(mezPribliz(), fov);
            maPanorama = true;
            // Snímek 11520 x 5760 zabere po dekódování 265 MB. Jakmile je
            // v textuře, drží ho už jen prohlížeč a tomu se pustit dá.
            im.onload = im.onerror = null;
            im.src = '';
            naplanuj();
            hotovo();
          };
          im.onerror = function () { chyba(new Error('panorama se nenačetlo: ' + url)); };
          im.src = url;
        });
      },
      max: MAX,
      // Plynulý přejezd pohledu. Vrací slib, aby na něj šlo navázat výměnu
      // panoramatu: otoč se ke dveřím, projdi jimi, rozhlédni se v nové
      // místnosti. Vodorovně se jede kratší stranou, takže se pohled nikdy
      // netočí přes půl domu jen proto, že úhel přeteče přes ±180.
      prejed: function (cil, ms) {
        zastavPohyb();
        var zY = yaw, zP = pitch, zF = fov;
        var dY = ((cil.yaw === undefined ? zY : cil.yaw) - zY + Math.PI) % (2 * Math.PI);
        if (dY < 0) dY += 2 * Math.PI;
        dY -= Math.PI;
        var dP = (cil.pitch === undefined ? zP : cil.pitch) - zP;
        var dF = (cil.fov === undefined ? zF : cil.fov) - zF;
        var trvani = klidnePohyby ? 0 : (ms || 420);
        return new Promise(function (hotovo) {
          if (!trvani) {
            yaw = zY + dY; pitch = zP + dP; fov = zF + dF;
            omez(); naplanuj(); hotovo(); return;
          }
          var zacatek = 0, dobehlo = false;
          function doraz() {
            if (dobehlo) return;
            dobehlo = true;
            if (animace) { global.cancelAnimationFrame(animace); animace = 0; }
            global.clearTimeout(pojistka);
            yaw = zY + dY; pitch = zP + dP; fov = zF + dF;
            omez(); naplanuj();
            hotovo();
          }
          // Na skryté kartě prohlížeč překreslování zastaví a slib by nikdy
          // nedoběhl. Volající by na něj čekal napořád a přechody mezi
          // místnostmi by se po návratu na kartu už nikdy nespustily.
          var pojistka = global.setTimeout(doraz, trvani + 400);
          function krok(t) {
            if (dobehlo) return;
            if (!zacatek) zacatek = t;
            var d = Math.min(1, (t - zacatek) / trvani);
            // Zrychlení a zpomalení, ne rovnoměrný posuv. Rovnoměrný vypadá
            // jako porucha, protože se pohled rozjede i zastaví naráz.
            var e = d < 0.5 ? 4 * d * d * d : 1 - Math.pow(-2 * d + 2, 3) / 2;
            yaw = zY + dY * e; pitch = zP + dP * e; fov = zF + dF * e;
            omez(); naplanuj();
            if (d < 1) { animace = global.requestAnimationFrame(krok); return; }
            doraz();
          }
          animace = global.requestAnimationFrame(krok);
        });
      },
      klid: function () { return klidnePohyby; },
      // Kam se otočit, aby se daný bod plátna dostal doprostřed. Používá to
      // kliknutí do scény: kam ukážeš, tam se pohled plynule přetočí. Je to
      // obrácený postup k tomu, co dělá shader, jen v CSS pixelech.
      zamer: function (cx, cy) {
        var w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return null;
        var qx = (cx - w / 2) * 2 / h, qy = -(cy - h / 2) * 2 / h;
        var f = 1 / Math.tan(fov / 2);
        var dl = Math.sqrt(qx * qx + qy * qy + f * f);
        var dx = qx / dl, dy = qy / dl, dz = f / dl;
        var cp = Math.cos(pitch), sp = Math.sin(pitch);
        var y1 = dy * cp - dz * sp, z1 = dy * sp + dz * cp;
        var cy2 = Math.cos(yaw), sy2 = Math.sin(yaw);
        var X = dx * cy2 + z1 * sy2, Z = -dx * sy2 + z1 * cy2;
        return { yaw: Math.atan2(X, Z), pitch: -Math.asin(Math.max(-1, Math.min(1, y1))) };
      },
      // Kolik pixelů na stupeň scéna právě potřebuje, aby se nic neroztahovalo.
      potreba: function () {
        if (!rozmer()) return 0;
        var fovH = 2 * Math.atan(Math.tan(fov / 2) * cv.width / cv.height);
        return cv.width / (fovH * 180 / Math.PI);
      },
      smer: function () { return { yaw: yaw, pitch: pitch, fov: fov }; },
      nastavSmer: function (y, p) { yaw = y; if (p !== undefined) pitch = p; omez(); naplanuj(); },
      rozsah: function () { return { lon: LONP, lat: LATP }; },
      naZmenu: function (fn) { naZmenu = fn; },
      prekresli: naplanuj,
      // Kam na obrazovce padne daný směr. Když je cíl za zády, souřadnice
      // nejsou, ale úhel ano: podle něj se dá značka přilepit ke správnému
      // okraji obrazovky se šipkou, kam se má divák otočit.
      naObrazovce: function (dx, dy, dz) {
        var cy = Math.cos(-yaw), sy = Math.sin(-yaw);
        var x1 = dx * cy + dz * sy, z1 = -dx * sy + dz * cy, y1 = dy;
        var cp = Math.cos(-pitch), sp = Math.sin(-pitch);
        var y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp;
        var uhel = Math.atan2(x1, z1);
        if (z2 <= 0.001) return { vzadu: true, uhel: uhel, x: null, y: null };
        var f = 1 / Math.tan(fov / 2);
        var h = host.clientHeight, w = host.clientWidth;
        return { vzadu: false, uhel: uhel,
          x: w / 2 + (x1 / z2) * f * h / 2, y: h / 2 - (y2 / z2) * f * h / 2 };
      }
    };
    return API;
  }

  global.FlexiPano = { vytvor: Pano };
}(window));
