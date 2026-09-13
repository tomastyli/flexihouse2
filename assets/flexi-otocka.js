/**
 * Otočka domu z předrenderovaných snímků z Blenderu.
 *
 * Staví se do prvku s atributem `data-otocka`, takže ji může mít hero
 * produktové stránky i scéna konfigurátoru. Liší se jen sada snímků: hero má
 * jednu sestavu po deseti stupních, konfigurátor osmdesát kombinací fasády,
 * střechy a terasy po patnácti. `data-sada="hero"` znamená, že se sada natáhne
 * sama; jinak se čeká, až si o kombinaci řekne konfigurátor.
 *
 * Úhel se drží ve stupních, ne v pořadí snímku, aby se dům při přepnutí sady
 * neotočil. Styly jsou v assets/flexi-otocka.css.
 */
(function (global) {
  'use strict';

  var host = document.querySelector('[data-otocka]');
  if (!host) return;

  // Dvě rozlišení na každou sadu. Vybere se nejmenší, které se nemusí
  // zvětšovat: u object-fit: cover rozhoduje šířka i výška zároveň a počítá se
  // ve skutečných bodech, ne v CSS. Na Retině je scéna dvakrát větší.
  // Strop je 2400 px schválně. Rozhoduje paměť: 36 snímků 3840x1600 je 844 MB
  // dekódovaných bitmap a dekódovaly se 36 sekund (změřeno 12. 9. 2026),
  // prohlížeč je pak zahazuje a dekóduje znovu, což je přesně to poskakování
  // textur při otáčení.
  var SADY = {
    hero: {
      pocet: 36, verze: '?v=4',
      tiery: [{ cesta: 'img/hero-otocka/', w: 1920, h: 800 },
              { cesta: 'img/hero-otocka-l/', w: 2400, h: 1000 }]
    },
    konfig: {
      pocet: 24, verze: '',
      tiery: [{ cesta: 'img/otocka-s/', w: 1200, h: 750 },
              { cesta: 'img/otocka/', w: 2400, h: 1500 }]
    }
  };

  // Víc než dvě sady v paměti nemá smysl: jedna kombinace ve 2400 px je
  // 345 MB dekódovaných bitmap. Dvě stačí na rychlé přepnutí tam a zpět,
  // znovunačtení stojí desítky milisekund, protože snímky drží HTTP cache.
  var STROP = 2;

  var uzke = global.matchMedia('(max-width:700px)');
  var setrny = !!(navigator.connection && navigator.connection.saveData);
  var pomale = !!(navigator.connection
    && /^(slow-)?2g$|^3g$/.test(navigator.connection.effectiveType || ''));

  var box = host;
  box.classList.add('fo');

  var snimky = document.createElement('div');
  snimky.className = 'fo__snimky';
  snimky.setAttribute('aria-hidden', 'true');
  box.appendChild(snimky);

  // Nová kombinace je 24 snímků, na mobilních datech i vteřina. Do té doby
  // zůstane vidět ta předchozí, takže bez hlášky to vypadá, že se kliknutí
  // ztratilo.
  var hlaska = document.createElement('p');
  hlaska.className = 'fo__nacita';
  hlaska.setAttribute('role', 'status');
  hlaska.textContent = 'Načítám…';
  hlaska.hidden = true;
  box.appendChild(hlaska);

  var lista = document.createElement('div');
  lista.className = 'fo__lista';
  lista.tabIndex = 0;
  lista.setAttribute('role', 'slider');
  lista.setAttribute('aria-label', 'Otočení domu');
  lista.setAttribute('aria-valuemin', '0');
  lista.setAttribute('aria-valuemax', '360');
  lista.innerHTML = '<span class="fo__lista-i"></span>';
  box.appendChild(lista);
  var lisI = lista.firstChild;

  var nactene = {};   // klíč sady -> pole obrázků
  var poradi = [];    // klíče od nejstarší, kvůli stropu
  var aktivni = null; // klíč zobrazené sady
  var pocet = SADY.konfig.pocet;
  var uhel = 0;       // ve stupních, drží se napříč sadami
  var tahnu = false;

  function vyberTier(s) {
    var d = global.devicePixelRatio || 1;
    var strop = (setrny || pomale) ? 0 : s.tiery.length - 1;
    var w = box.clientWidth * d, h = box.clientHeight * d;
    var i = 0;
    while (i < strop && (s.tiery[i].w < w || s.tiery[i].h < h)) i++;
    return s.tiery[i];
  }

  function index() {
    var n = pocet;
    return ((Math.round(uhel / (360 / n)) % n) + n) % n;
  }

  function ukaz() {
    if (!nactene[aktivni]) return;
    var i = index();
    for (var k in nactene) {
      if (!Object.prototype.hasOwnProperty.call(nactene, k)) continue;
      var s = nactene[k];
      for (var j = 0; j < s.length; j++) {
        s[j].classList.toggle('je-videt', k === aktivni && j === i);
      }
    }
    var st = Math.round(i * (360 / pocet));
    lisI.style.width = ((i + 1) / pocet * 100) + '%';
    lista.setAttribute('aria-valuenow', String(st));
    lista.setAttribute('aria-valuetext', st + ' stupňů');
  }

  function posun(o) {
    uhel = (uhel + o * (360 / pocet) + 360) % 360;
    ukaz();
  }

  // Snímky se musí nejen stáhnout, ale i dekódovat. Bez decode() se každý
  // dekóduje až v okamžiku, kdy se poprvé ukáže, a první otáčka proto trhá.
  // decode() se ale v záložce na pozadí nedokončí, Chrome dekódování odkládá,
  // dokud stránku někdo neuvidí. Bez pojistky by otočka v takové záložce
  // zůstala navždy nepřipravená, proto se čeká jen do limitu.
  function dekoduj(im) {
    if (!im.decode) return Promise.resolve();
    return Promise.race([
      im.decode().catch(function () {}),
      new Promise(function (h) { global.setTimeout(h, 2500); })
    ]);
  }

  function uvolni() {
    while (poradi.length > STROP) {
      var i = 0;
      while (i < poradi.length && poradi[i] === aktivni) i++;
      if (i >= poradi.length) break;
      var stary = poradi.splice(i, 1)[0];
      nactene[stary].forEach(function (im) { im.remove(); });
      delete nactene[stary];
    }
  }

  function nacti(druh, kombinace) {
    var s = SADY[druh];
    var tier = vyberTier(s);
    var klic = tier.cesta + (kombinace || '');
    if (nactene[klic]) {
      poradi.splice(poradi.indexOf(klic), 1);
      poradi.push(klic);
      return Promise.resolve(klic);
    }
    var zaklad = tier.cesta + (kombinace ? kombinace + '/' : '');
    var pole = [], cekani = [];
    for (var i = 0; i < s.pocet; i++) {
      var im = new Image();
      im.alt = '';
      // Obrázky jdou v prohlížeči chytit a přetáhnout jako soubor. Tažení se
      // tím přeruší v půlce a otočka se zasekne, proto je to vypnuté.
      im.draggable = false;
      im.src = zaklad + String(i).padStart(2, '0') + '.webp' + s.verze;
      snimky.appendChild(im);
      pole.push(im);
      cekani.push(dekoduj(im));
    }
    nactene[klic] = pole;
    poradi.push(klic);
    uvolni();
    // Čekat na všechny by znamenalo mrtvou vteřinu navíc. Prvních osm pokryje
    // první pohyb rukou, zbytek se dodekóduje na pozadí.
    return Promise.all(cekani.slice(0, 8)).then(function () { return klic; });
  }

  // Poslední požadavek vyhrává. Bez toho by sada, o kterou se požádalo dřív,
  // přebila novější kombinaci, když se dokládá později.
  var tah = 0;
  function prepni(druh, kombinace) {
    var moje = ++tah;
    return nacti(druh, kombinace).then(function (klic) {
      if (moje !== tah) return klic;
      aktivni = klic;
      pocet = SADY[druh].pocet;
      ukaz();
      box.classList.add('je-pripravena');
      return klic;
    });
  }

  box.addEventListener('dragstart', function (e) { e.preventDefault(); });

  // Tažení kdekoli po obrázku. Šířka scény odpovídá jedné celé otáčce, aby
  // dům šel obejít jedním pohybem.
  var start = 0, startUhel = 0;
  box.addEventListener('pointerdown', function (e) {
    if (!aktivni) return;
    tahnu = true; start = e.clientX; startUhel = uhel;
    box.classList.add('je-tazena');
    if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', function (e) {
    if (!tahnu) return;
    e.preventDefault();
    var d = (e.clientX - start) / box.clientWidth;
    uhel = ((startUhel - d * 360) % 360 + 360) % 360;
    ukaz();
  });
  // Bez pointerleave: se zachyceným ukazatelem smí tažení klidně vyjet ven
  // ze scény a má pokračovat, dokud se tlačítko nepustí.
  ['pointerup', 'pointercancel'].forEach(function (u) {
    box.addEventListener(u, function () { tahnu = false; box.classList.remove('je-tazena'); });
  });

  // Lišta je zároveň ukazatel i posuvník: kliknutí na ni skočí rovnou na úhel.
  function zListy(e) {
    var r = lista.getBoundingClientRect();
    var p = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 0.9999);
    uhel = p * 360;
    ukaz();
  }
  lista.addEventListener('pointerdown', function (e) {
    e.stopPropagation();
    if (lista.setPointerCapture) lista.setPointerCapture(e.pointerId);
    lista.classList.add('je-tazena');
    zListy(e);
  });
  lista.addEventListener('pointermove', function (e) {
    if (!lista.classList.contains('je-tazena')) return;
    zListy(e);
  });
  ['pointerup', 'pointercancel'].forEach(function (u) {
    lista.addEventListener(u, function () { lista.classList.remove('je-tazena'); });
  });
  lista.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { posun(-1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { posun(1); e.preventDefault(); }
    else if (e.key === 'Home') { uhel = 0; ukaz(); e.preventDefault(); }
  });

  var kurzorPryc = function () {};

  // Vlastní kurzor místo šipky. Jen na myši, na dotyku a na jemném ukazateli
  // by to nedávalo smysl a systémovou šipku schovávat nechceme zbytečně.
  (function vlastniKurzor() {
    if (!global.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    var k = document.createElement('div');
    k.className = 'fo__kurzor';
    k.setAttribute('aria-hidden', 'true');
    k.innerHTML = '<svg viewBox="0 0 48 48">'
      + '<path d="M38 24a14 14 0 1 1-4.1-9.9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'
      + '<path d="M38.4 8.6v6.9h-6.9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>'
      + '</svg><span>360°</span>';
    document.body.appendChild(k);
    box.classList.add('ma-kurzor');

    var vidim = false;
    function kam(e) {
      k.style.transform = 'translate3d(' + e.clientX + 'px,' + e.clientY + 'px,0) translate(-50%,-50%)';
    }
    box.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !aktivni) return;
      vidim = true; kam(e); k.classList.add('je-videt');
    });
    box.addEventListener('pointermove', function (e) { if (vidim) kam(e); });
    box.addEventListener('pointerleave', function () {
      if (tahnu) return;
      vidim = false; k.classList.remove('je-videt');
    });
    box.addEventListener('pointerdown', function () { k.classList.add('je-stisk'); });
    ['pointerup', 'pointercancel'].forEach(function (u) {
      box.addEventListener(u, function () { k.classList.remove('je-stisk'); });
    });
    kurzorPryc = function () { vidim = false; k.classList.remove('je-videt'); };
  }());

  global.FlexiOtocka = {
    // Konfigurátor si řekne o kombinaci fasády, střechy a terasy. Vrací slib,
    // aby volající poznal, kdy je sada opravdu vidět.
    kombinace: function (klic) {
      box.hidden = false;
      var cekani = global.setTimeout(function () { hlaska.hidden = false; }, 260);
      return prepni('konfig', klic).then(function (k) {
        global.clearTimeout(cekani);
        hlaska.hidden = true;
        return k;
      });
    },
    // Pohled dovnitř si scénu přebírá živé 3D, snímky musí pryč.
    schovej: function () {
      box.hidden = true;
      kurzorPryc();
    },
    jeVidet: function () { return !box.hidden && !!aktivni; }
  };

  // Hero sada až po načtení stránky, aby snímky nesoutěžily s hero obrázkem
  // o LCP. Na mobilu a v úsporném režimu dat se nenačítá vůbec: je to 36
  // snímků navíc a tažení by na dotyku bralo svislé posouvání stránky.
  // Konfigurátor si sadu vyžádá sám, ten tuhle bránu nemá.
  function startHero() {
    if (uzke.matches || setrny) return;
    prepni('hero', null);
  }
  if (host.dataset.sada === 'hero') {
    if (document.readyState === 'complete') startHero();
    else global.addEventListener('load', startHero);
  }
}(window));
