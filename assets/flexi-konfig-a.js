/**
 * Konfigurátor Flexi House, průvodce po krocích.
 *
 * Vzhled i kostra jsou ze schváleného návrhu A: pět kroků, scéna se řídí
 * krokem a do místnosti se chodí z půdorysu, ne z plovoucích cedulek.
 * Ceny, ukládání sestavy, PDF, poptávka i měření jsou produkční.
 *
 * Otočku domu kreslí assets/flexi-otocka.js (vlastní sady podle displeje,
 * prolínání snímků, setrvačnost), panorama assets/flexi-pano.js.
 */
(function () {
'use strict';

var D = window.FlexiKonfigData;
var J = window.FlexiKonfigJadro;
var MODEL = D.MODELS.flexihouse;
var FASADA_3D = D.FASADA_3D;
var REALNE = D.REALNE;

var SOUHRN = {
  title: 'Souhrn',
  micro: 'Projděte sestavu a pošlete nám ji. Připravíme nezávaznou nabídku na míru a ozveme se vám.',
  souhrn: true,
  groups: []
};
var KROKY = MODEL.steps.concat([SOUHRN]);
var POSLEDNI = KROKY.length - 1;

var MISTA = [
  { klic:'obyvak',   nazev:'Obývací prostor',  mx:33.7, my:66.0, yaw:-16,  sklon:8,  volby:['kuchyn','podlaha','zavesy','klima'] },
  { klic:'kuchyn',   nazev:'Kuchyňský kout',   mx:23.3, my:29.9, yaw:19,   sklon:18, volby:['kuchyn','podlaha','zavesy','klima'] },
  { klic:'koupelna', nazev:'Koupelna',         mx:50.2, my:23.4, yaw:140,  sklon:8,  volby:['koupelna','podlaha'] },
  { klic:'loznice1', nazev:'Ložnice u vstupu', mx:76.9, my:74.9, yaw:67,   sklon:5,  volby:['podlaha','zavesy'] },
  { klic:'loznice2', nazev:'Zadní ložnice',    mx:76.9, my:33.7, yaw:74,   sklon:8,  volby:['podlaha','zavesy'] }
];

/* Kam se v místnosti podívat, aby byla volba doopravdy v záběru. Dvojice je
   yaw a sklon ve stupních, kladný sklon míří dolů, yaw null nechá vodorovný
   směr být. Změřeno na panoramatech rozdílem snímku bez volby a s volbou:
   hledal se směr, který zabere nejvíc pixelů, které ta volba mění, a každý
   se pak ještě prohlédl v _pano-zamer.html při zorném úhlu scény. */
var ZABERY = {
  obyvak:   { floor:[null, 42], drapes:[-110, -7] },
  kuchyn:   { floor:[null, 42], drapes:[-94, -2], kitchen:[19, 25], ac:[-99, -3] },
  koupelna: { floor:[null, 42], bath:[-112, 18] },
  loznice1: { floor:[null, 42], drapes:[67, 5] },
  loznice2: { floor:[null, 42], drapes:[74, 13] }
};

/* Volbu, která bydlí v jedné místnosti, není kde jinde ukázat, takže tam
   diváka přenese. Podlaha a závěsy jsou v celém domě: u těch stačí otočit
   pohled na nejbližší kus a člověk nemusí opustit místnost, ve které je. */
var DOMA = { kitchen:'kuchyn', bath:'koupelna', ac:'kuchyn' };
var HLAVNI = { obyvak:['drapes'], kuchyn:['kitchen','drapes'],
  koupelna:['bath'], loznice1:['drapes'], loznice2:['drapes'] };

function indexMista(klic) {
  for (var i = 0; i < MISTA.length; i++) if (MISTA[i].klic === klic) return i;
  return -1;
}
function zvoleno(id) {
  if (id === 'ac') return vyber.heating === 'ac';
  return maVybaveni(id);
}
/* Výchozí pohled po vstupu do místnosti. Míří na to, co si divák objednal:
   v koupelně na umyvadlo, jakmile koupelnu vybral, jinak do prostoru. Bez
   toho by v holé místnosti kamera trvala na detailu, který v ní není. */
function vychoziZaber(i) {
  var m = MISTA[i];
  var por = HLAVNI[m.klic] || [];
  for (var j = 0; j < por.length; j++) {
    var z = ZABERY[m.klic] && ZABERY[m.klic][por[j]];
    if (z && zvoleno(por[j])) return z;
  }
  return [m.yaw, m.sklon];
}
var PORADI_VOLEB = ['kuchyn','koupelna','podlaha','zavesy','klima'];

var vyber = {};
J.skupiny(MODEL).forEach(function (g) {
  if (g.type === 'multi') vyber[g.key] = [];
  else vyber[g.key] = g.required ? g.options[0].id : null;
});
vyber.facade = 'grey';

var stav = { krok:0, nejdal:0, km:0, misto:0 };
var vidano = { spin:false, pano:false };

var telo = document.getElementById('telo');
var scena = document.getElementById('scena');
var vrPlan = document.getElementById('vrPlan');
var vrSpin = document.getElementById('vrSpin');
var vrPano = document.getElementById('vrPano');
var panoHost = document.getElementById('panoHost');
var PANO = window.FlexiPano ? window.FlexiPano.vytvor(panoHost) : null;
var panoAktivni = 0;
var karta = document.getElementById('karta');
var mapa = document.getElementById('mapa');
var kartaNadpis = document.getElementById('kartaNadpis');
var kartaRadek = document.getElementById('kartaRadek');
var coach = document.getElementById('coach');
var hlaseni = document.getElementById('hlaseni');

var FAJFKA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function mene() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function jeZvoleno(g, id) {
  return g.type === 'multi' ? vyber[g.key].indexOf(id) !== -1 : vyber[g.key] === id;
}
function maAddon(id) { return vyber.addons.indexOf(id) !== -1; }
function maVybaveni(id) { return vyber.equipment.indexOf(id) !== -1; }

function otockaKlic() {
  return FASADA_3D[vyber.facade] + '-' + vyber.roof + (maAddon('terrace') ? '-terasa' : '');
}
function panoKlic(i) {
  var m = MISTA[i];
  var zap = {
    kuchyn: maVybaveni('kitchen'), koupelna: maVybaveni('bath'), podlaha: maVybaveni('floor'),
    zavesy: maVybaveni('drapes'), klima: vyber.heating === 'ac'
  };
  var jmeno = PORADI_VOLEB.filter(function (v) {
    return m.volby.indexOf(v) !== -1 && zap[v];
  }).join('-') || 'zaklad';
  return m.klic + '/' + jmeno;
}

var SCENY = ['plan', 'spin', 'pano', 'spin', 'spin'];
var vrstvyMap = { plan: vrPlan, spin: vrSpin, pano: vrPano };
var scenaTed = null;

function nastavScenu(typ) {
  if (scenaTed !== typ) {
    Object.keys(vrstvyMap).forEach(function (k) {
      vrstvyMap[k].classList.toggle('je-videt', k === typ);
    });
    scenaTed = typ;
  }
  mapa.hidden = typ !== 'pano';
  scena.classList.toggle('je-uvnitr', typ === 'pano');
  if (typ === 'spin') { nastavOtocku(); ukazCoach('spin'); }
  if (typ === 'pano') { nastavPano(false); ukazCoach('pano'); }
  popisScenu();
}

function popisScenu() {
  if (scenaTed === 'plan') {
    kartaNadpis.textContent = 'Půdorys rozloženého domu';
    kartaRadek.textContent = 'Vnější rozměr 6,32 × 5,90 m, uvnitř zhruba 30 m².';
  } else if (scenaTed === 'spin') {
    var f = najdiVolbu('facade', vyber.facade);
    var s = najdiVolbu('roof', vyber.roof);
    kartaNadpis.textContent = f ? J.optLabel(f) : '';
    kartaRadek.textContent = (s ? s.label : '') + (maAddon('terrace') ? ', s terasou' : '');
  } else {
    kartaNadpis.textContent = MISTA[stav.misto].nazev;
    // Trvalý popisek pod mapou, ne jen coach, který po chvíli zmizí. Kdo
    // přijde k prohlídce později, jinak nemá jak zjistit, že se dá přejít jinam.
    kartaRadek.textContent = dotykove()
      ? 'Klepnutím na bod přejdete do jiné místnosti.'
      : 'Kliknutím na bod přejdete do jiné místnosti.';
  }
  kartaRadek.hidden = !kartaRadek.textContent;
}
function dotykove() {
  return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
}
function najdiVolbu(key, id) {
  var g = J.skupiny(MODEL).filter(function (x) { return x.key === key; })[0];
  if (!g) return null;
  return g.options.filter(function (o) { return o.id === id; })[0] || null;
}

var spinKlic = null;
// Otočku kreslí sdílený modul: vybírá sadu podle displeje, prolíná mezi
// snímky a po puštění dobíhá. Návrh měl vlastní jednodušší kopii.
function nastavOtocku() {
  var klic = otockaKlic();
  if (spinKlic === klic) return;
  spinKlic = klic;
  if (window.FlexiOtocka) window.FlexiOtocka.kombinace(klic);
}

function nastavPano(letem, zaber) {
  if (!PANO) return;
  var url = 'img/pano-m/' + panoKlic(stav.misto) + '.webp';
  var cil = zaber || vychoziZaber(stav.misto);
  // Podlaha je pod nohama všude. Záběr na ni proto vodorovný směr nemění
  // (yaw je null) a jen sklopí pohled tam, kde divák právě stojí.
  var uhel = cil[0] === null ? PANO.smer().yaw : cil[0] * Math.PI / 180;
  var sklon = cil[1] * Math.PI / 180;
  if (!letem) {
    // Se zadaným záběrem se pohled přetáčí, ne přeskakuje. Divák musí vidět,
    // kterým směrem se otočil, jinak nepozná, že je pořád v téže místnosti.
    if (vrPano.dataset.url === url) {
      if (zaber) PANO.prejed({ yaw: uhel, pitch: sklon }, 520);
      else PANO.prekresli();
      return;
    }
    vrPano.dataset.url = url;
    vrPano.classList.add('je-nacita');
    PANO.nahraj(url).then(function () {
      vrPano.classList.remove('je-nacita');
      if (zaber) PANO.prejed({ yaw: uhel, pitch: sklon }, 520);
      else PANO.nastavSmer(uhel, sklon);
      kresliKlin();
    }).catch(function () { vrPano.classList.remove('je-nacita'); });
    return;
  }
  // Průchod dveřmi: otočit se ke dveřím, přisunout se, ztmavit, vyměnit
  // místnost a v nové se pohled zase rozevře. Nový snímek se načítá
  // souběžně s otáčením, takže uprostřed přechodu nenaskočí prázdná plocha.
  var siroky = PANO.smer().fov;
  var kam = smerKeDverim(stav.misto);
  var nacteno = new Promise(function (h) {
    var im = new Image();
    im.onload = im.onerror = function () { h(); };
    im.src = url;
  });
  PANO.prejed({ yaw: kam, pitch: -0.12, fov: Math.max(siroky * 0.72, 0.45) }, 460)
    .then(function () { vrPano.classList.add('je-prechod'); return nacteno; })
    .then(function () { return new Promise(function (h) { window.setTimeout(h, 180); }); })
    .then(function () {
      vrPano.dataset.url = url;
      return PANO.nahraj(url);
    })
    .then(function () {
      PANO.nastavSmer(uhel, sklon);
      kresliKlin();
      return new Promise(function (h) { window.setTimeout(h, 120); });
    })
    .then(function () {
      vrPano.classList.remove('je-prechod');
      return PANO.prejed({ fov: siroky }, 420);
    })
    .catch(function () { vrPano.classList.remove('je-prechod'); });
}

// Vodorovný směr k cílové místnosti v osách prohlížeče. Souřadnice na mapě
// jsou v procentech obrázku, metry se dopočítají opačným směrem než mx a my.
function smerKeDverim(cilIndex) {
  var a = MISTA[stav.mistoPredtim === undefined ? cilIndex : stav.mistoPredtim];
  var b = MISTA[cilIndex];
  if (!a || a === b) return PANO.smer().yaw;
  var dx = (b.mx - a.mx) / 13.886;
  var dz = (b.my - a.my) / 15.373;
  return Math.atan2(dx, -dz);
}
window.addEventListener('resize', function () { if (PANO) PANO.prekresli(); });



var coachCas = null;
function ukazCoach(typ) {
  if (vidano[typ]) return;
  vidano[typ] = true;
  var dotyk = window.matchMedia('(pointer: coarse)').matches;
  document.getElementById('coachNadpis').textContent = typ === 'spin'
    ? (dotyk ? 'Prstem dům otočíte' : 'Tažením dům otočíte')
    : (dotyk ? 'Prstem se rozhlédnete' : 'Tažením se rozhlédnete');
  document.getElementById('coachText').textContent = typ === 'spin'
    ? (dotyk ? 'Posuňte po domě doleva nebo doprava.' : 'Nebo použijte posuvník pod domem.')
    : (dotyk ? 'Do jiné místnosti přejdete ťuknutím v půdorysu.' : 'Do jiné místnosti přejdete kliknutím v půdorysu.');
  coach.classList.add('je-videt');
  scena.classList.add('je-coach');
  window.clearTimeout(coachCas);
  coachCas = window.setTimeout(schovejCoach, 4000);
}
function schovejCoach() {
  window.clearTimeout(coachCas);
  coach.classList.remove('je-videt');
  scena.classList.remove('je-coach');
}

var klin = document.getElementById('klin');
function kresliKlin() {
  if (!PANO || !klin) return;
  var m = MISTA[stav.misto];
  var s = PANO.smer();
  var r = panoHost.getBoundingClientRect();
  var pomer = r.width && r.height ? r.width / r.height : 1.5;
  var fovH = 2 * Math.atan(Math.tan(s.fov / 2) * pomer) * 180 / Math.PI;
  klin.style.left = m.mx + '%';
  klin.style.top = m.my + '%';
  klin.style.setProperty('--yaw', (s.yaw * 180 / Math.PI).toFixed(1) + 'deg');
  klin.style.setProperty('--pul', Math.min(70, fovH / 2).toFixed(1));
  klin.classList.add('je-videt');
}
if (PANO) PANO.naZmenu(kresliKlin);

MISTA.forEach(function (m, i) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'bod';
  b.style.left = m.mx + '%';
  b.style.top = m.my + '%';
  b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  b.innerHTML = '<span class="vh">Přejít do místnosti ' + esc(m.nazev) + '</span>';
  b.addEventListener('click', function () { doMistnosti(i); });
  mapa.querySelector('.mapa__plan').appendChild(b);
});
function doMistnosti(i, zaber) {
  if (i === stav.misto) return;
  udalost('view_interior', { misto: MISTA[i].klic });
  stav.mistoPredtim = stav.misto;
  stav.misto = i;
  mapa.querySelectorAll('.bod').forEach(function (b, j) {
    b.setAttribute('aria-current', j === i ? 'true' : 'false');
  });
  schovejCoach();
  nastavPano(true, zaber);
  popisScenu();
  hlaseni.textContent = 'Jste v místnosti ' + MISTA[i].nazev + '.';
}

function postavPostup() {
  var ol = document.getElementById('postup');
  ol.textContent = '';
  KROKY.forEach(function (k, i) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'postup__k';
    b.innerHTML = '<span class="vh">Krok ' + (i + 1) + ', ' + esc(k.title) + '</span>';
    b.addEventListener('click', function () { naKrok(i); });
    li.appendChild(b);
    ol.appendChild(li);
  });
}
function obnovPostup() {
  var t = document.querySelectorAll('.postup__k');
  for (var i = 0; i < t.length; i++) {
    t[i].setAttribute('data-stav', i < stav.krok ? 'hotovo' : 'pred');
    if (i === stav.krok) t[i].setAttribute('aria-current', 'step');
    else t[i].removeAttribute('aria-current');
    t[i].disabled = i > stav.nejdal;
  }
  document.getElementById('postupText').textContent =
    'Krok ' + (stav.krok + 1) + ' z ' + KROKY.length + ', ' + KROKY[stav.krok].title;
}

function skupinaHtml(g) {
  if (g.options.length === 1) return faktHtml(g);
  if (g.key === 'facade') return vzornikHtml(g);
  return seznamHtml(g);
}

// Nadpis skupiny se vynechá, když jen opakuje nadpis kroku. Dvakrát pod
// sebou "Doplňky a služby" vypadá jako chyba, protože to chyba je.
function nadpisSkupiny(g) {
  var k = KROKY[stav.krok];
  if (k && k.title === g.title) return '';
  return '<h3 class="sk__nazev">' + esc(g.title) + '</h3>';
}

function faktHtml(g) {
  var o = g.options[0];
  // Když se název jediné volby shoduje s názvem skupiny, píše se jen jednou.
  var stejne = o.label === g.title;
  return '<section class="sk">' + nadpisSkupiny(g) +
    '<div class="sk__telo"><div class="fakt">' +
    (stejne && nadpisSkupiny(g) ? '' : '<p class="fakt__nazev">' + esc(o.label) + '</p>') +
    '<p class="fakt__popis">' + esc(o.desc) + '</p>' +
    (o.meta ? '<p class="fakt__meta cislo">' + esc(o.meta) + '</p>' : '') +
    '</div></div></section>';
}

function seznamHtml(g) {
  var multi = g.type === 'multi';
  var h = '<section class="sk" data-sk="' + esc(g.key) + '">' + nadpisSkupiny(g);
  if (g.hint) h += '<p class="sk__hint">' + esc(g.hint) + '</p>';
  h += '<div class="sk__telo"' + (multi ? '' : ' role="radiogroup" aria-label="' + esc(g.title) + '"') + '>';
  g.options.forEach(function (o) {
    var zv = jeZvoleno(g, o.id);
    h += '<label class="vo' + (multi ? ' vo--multi' : '') + '">' +
      '<input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + esc(g.key) + '" value="' + esc(o.id) + '"' + (zv ? ' checked' : '') + '>' +
      '<span class="vo__zn" aria-hidden="true">' + FAJFKA + '</span>' +
      '<span class="vo__txt">' +
        '<span class="vo__radek">' +
          '<span class="vo__nazev">' + esc(o.label) + '</span>' +
          '<span class="vo__cena cislo">' + esc(J.optPriceLabel(o, stav.km)) + '</span>' +
        '</span>' +
        '<span class="vo__popis">' + esc(o.desc) + '</span>' +
      '</span>' +
      fotoHtml(o) +
    '</label>';
  });
  h += '</div>';
  if (g.kmFor && maAddon(g.kmFor)) h += kmHtml();
  h += '</section>';
  return h;
}

/* Miniatura místo ička. Písmeno i slibuje informaci, tenhle knoflík slibuje
   fotku, a tak ať rovnou ukáže, jakou. Je uvnitř štítku volby, takže si klik
   musí vzít pro sebe, jinak by zaškrtl volbu, na kterou se chtěl jen podívat. */
function fotoHtml(o) {
  var f = o.foto && REALNE[o.foto];
  if (!f) return '';
  return '<button type="button" class="vo__foto" data-foto="' + esc(o.foto) + '"' +
    ' aria-label="Ukázat fotku, ' + esc(f.titul.toLowerCase()) + ' ve vyrobeném domě">' +
    '<img src="img/nahled/' + esc(o.foto) + '.webp" width="128" height="128" alt="" loading="lazy" decoding="async">' +
    '</button>';
}

function kmHtml() {
  return '<div class="km">' +
    '<label for="poleKm">Vzdálenost na váš pozemek</label>' +
    '<div class="km__pole">' +
      '<input id="poleKm" type="number" inputmode="numeric" min="0" max="2000" step="1" value="' + (stav.km || '') + '" placeholder="0">' +
      '<span class="km__jednotka">km jedním směrem</span>' +
    '</div>' +
    '<p class="km__pozn">Souprava jede tam i zpět, počítáme tedy ' + (J.ujeteKm(stav.km) || 0) + ' km.</p>' +
  '</div>';
}

function vzornikHtml(g) {
  var vybrana = najdiVolbu('facade', vyber.facade);
  var zaklad = g.options.filter(function (o) { return !o.dekor; });
  var dekory = g.options.filter(function (o) { return !!o.dekor; });
  function mrizka(pole, mala) {
    return '<div class="vzor' + (mala ? ' je-mala' : '') + '">' + pole.map(function (o) {
      return '<label class="vz" title="' + esc(J.optLabel(o)) + '">' +
        '<input type="radio" name="facade" value="' + esc(o.id) + '"' + (vyber.facade === o.id ? ' checked' : '') + '>' +
        '<span class="vh">' + esc(J.optLabel(o)) + ', ' + esc(J.optPriceLabel(o, stav.km)) + '</span>' +
        '<img src="' + esc(o.img) + '" width="414" height="278" alt="" loading="lazy" decoding="async">' +
        '<span class="vz__fajf" aria-hidden="true">' + FAJFKA + '</span>' +
      '</label>';
    }).join('') + '</div>';
  }
  // Popis vybraného vzorku patří hned pod tu mřížku, ve které uživatel klikl.
  // Jedna společná pod oběma mřížkami znamenala, že u tří základních obkladů,
  // které si vybere většina lidí, byla zpětná vazba pod přehybem panelu.
  var info = '<div class="vzor__info">' +
    '<p class="vzor__nazev">' + esc(vybrana ? J.optLabel(vybrana) : '') + '</p>' +
    '<p class="vzor__popis">' + esc(vybrana ? vybrana.desc : '') + '</p>' +
    '<p class="vzor__cena cislo">' + esc(vybrana ? J.optPriceLabel(vybrana, stav.km) : '') + '</p>' +
  '</div>';
  var jeDekor = !!(vybrana && vybrana.dekor);
  return '<section class="sk" data-sk="facade">' + nadpisSkupiny(g) +
    '<p class="sk__hint">' + esc(g.hint) + '</p>' +
    '<div class="blok"><p class="blok__stitek">V základní ceně</p>' + mrizka(zaklad, true) +
      (jeDekor ? '' : info) + '</div>' +
    '<div class="blok"><p class="blok__stitek">Dekor fasády, příplatek ' + esc(J.fmtPrice(23600)) + '</p>' + mrizka(dekory) +
      (jeDekor ? info : '') + '</div>' +
  '</section>';
}

function zakladHtml() {
  return '<div class="zaklad">' +
    '<p class="zaklad__cena">' + esc(J.fmtPrice(MODEL.base)) + '</p>' +
    '<p class="zaklad__pozn">Základní cena bez DPH, elektroinstalace je v ní.</p>' +
    '<ul class="zaklad__sez">' + MODEL.baseIncludes.map(function (s) {
      return '<li>' + esc(s) + '</li>';
    }).join('') + '</ul>' +
  '</div>';
}

function souhrnHtml() {
  var t = J.totals(MODEL, vyber, stav.km);
  var h = '<div class="sh"><div class="sh__list">';
  MODEL.steps.forEach(function (step, i) {
    var radky = [];
    (step.groups || []).forEach(function (g) {
      var v = vyber[g.key];
      var idy = g.type === 'multi' ? (v || []) : (v ? [v] : []);
      idy.forEach(function (id) {
        var o = g.options.filter(function (x) { return x.id === id; })[0];
        if (o) radky.push({ g:g.title, o:o });
      });
    });
    h += '<div class="sh__blok"><div class="sh__hlava">' +
      '<h3 class="sh__nazev">' + esc(step.title) + '</h3>' +
      '<button type="button" class="sh__upravit" data-krok="' + i + '">Upravit</button></div>';
    if (!radky.length) {
      h += '<p class="sh__nic">Nevybrali jste nic, dům bude bez těchto položek.</p>';
    } else {
      radky.forEach(function (r) {
        var c = J.optPrice(r.o, stav.km);
        // Odmítnutá položka není nic v ceně. "Bez vytápění, v ceně" je nesmysl,
        // takže volba, která znamená nepřítomnost, cenovku nedostane vůbec.
        var nic = r.o.id === 'none';
        var cena = nic ? '' : (c <= 0 ? 'v ceně' : (r.o.from ? 'od ' : '') + esc(J.fmtPrice(c)));
        h += '<p class="sh__radek' + (nic ? ' je-bez' : '') + '"><span>' + esc(J.optLabel(r.o)) + '</span>' +
          (cena ? '<b class="cislo">' + cena + '</b>' : '') + '</p>';
      });
    }
    h += '</div>';
  });
  h += '</div>';
  h += '<div class="sh__soucet">' +
    '<p class="sh__radek"><span>Dům a vybavení bez DPH</span><b class="cislo">' + esc(J.fmtPrice(t.net)) + '</b></p>';
  if (t.gross > 0) {
    h += '<p class="sh__radek"><span>Práce na pozemku včetně DPH</span><b class="cislo">' + esc(J.fmtPrice(t.gross)) + '</b></p>';
  }
  h += '<div class="sh__celkem"><span>Celkem</span><b>' + esc(J.fmtPrice(t.total)) + '</b></div></div>';
  h += '<div class="sh__nastroje">' +
    '<button type="button" class="odkaz" id="btnUloz">Uložit konfiguraci</button>' +
    '<button type="button" class="odkaz" id="btnPdf">Stáhnout PDF</button>' +
    '</div><p class="sh__kod" id="kodBox" hidden>Kód sestavy: <b id="kodText"></b></p>';
  h += '</div>';
  h += formularHtml();
  return h;
}

function formularHtml() {
  return '<form class="fm" id="poptavka" novalidate>' +
    '<h3 class="fm__nadpis">Chcete nabídku na tuto sestavu?</h3>' +
    '<p class="fm__pod">Ceny jsou orientační. Finální nabídku připravíme podle vašeho pozemku a potvrdíme ji.</p>' +
    '<div class="pole" data-pole="name"><label for="flName">Jméno a příjmení</label>' +
      '<input id="flName" name="name" type="text" autocomplete="name" required aria-describedby="chyba-name">' +
      '<span class="pole__chyba" id="chyba-name">Vyplňte prosím jméno a příjmení.</span></div>' +
    '<div class="pole" data-pole="phone"><label for="flPhone">Telefon</label>' +
      '<input id="flPhone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required aria-describedby="chyba-phone">' +
      '<span class="pole__chyba" id="chyba-phone">Vyplňte prosím telefon, ať se máme kam ozvat.</span></div>' +
    '<div class="pole" data-pole="email"><label for="flEmail">E-mail</label>' +
      '<input id="flEmail" name="email" type="email" inputmode="email" autocomplete="email" required aria-describedby="chyba-email">' +
      '<span class="pole__chyba" id="chyba-email">E-mail nemá správný tvar, zkontrolujte ho prosím.</span></div>' +
    '<div class="pole" data-pole="location"><label for="flMisto">Obec, kam dům povezeme</label>' +
      '<input id="flMisto" name="location" type="text" autocomplete="address-level2"></div>' +
    '<div class="pole" data-pole="message"><label for="flZprava">Poznámka</label>' +
      '<textarea id="flZprava" name="message" rows="3"></textarea></div>' +
    '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
    '<p class="fm__stav" id="flStav" role="status" aria-live="polite"></p>' +
  '</form>';
}

function vykresli() {
  var k = KROKY[stav.krok];
  var h = '<div class="krok">' +
    '<h2 class="krok__nadpis" id="krokNadpis" tabindex="-1">' + esc(k.title) + '</h2>' +
    '<p class="krok__micro">' + esc(k.micro) + '</p>';
  if (k.souhrn) {
    h += souhrnHtml();
  } else {
    (k.groups || []).forEach(function (g) { h += skupinaHtml(g); });
    if (stav.krok === 0) h += zakladHtml();
  }
  h += '</div>';
  telo.innerHTML = h;
  telo.scrollTop = 0;
  navazPanel();
  navazNastroje();
  ukazChybuKodu();
  obnovPostup();
  obnovPatku();
  nastavScenu(SCENY[stav.krok]);
}

function navazPanel() {
  telo.querySelectorAll('.vo__foto').forEach(function (b) {
    b.addEventListener('click', function (e) {
      // Knoflík sedí uvnitř štítku volby, takže by klik jinak propadl do
      // zaškrtnutí. Podívat se na fotku není totéž jako položku si objednat.
      e.preventDefault();
      e.stopPropagation();
      otevriFoto(b.dataset.foto);
    });
  });
  telo.querySelectorAll('.vo input, .vz input').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var klic = inp.name;
      if (inp.type === 'checkbox') {
        var pole = vyber[klic];
        var i = pole.indexOf(inp.value);
        if (inp.checked && i === -1) pole.push(inp.value);
        if (!inp.checked && i !== -1) pole.splice(i, 1);
      } else {
        vyber[klic] = inp.value;
      }
      poVolbe(klic, inp.value, inp.checked !== false);
    });
  });
  var km = telo.querySelector('#poleKm');
  if (km) {
    km.addEventListener('input', function () {
      var n = Number(km.value);
      stav.km = isFinite(n) && n > 0 ? Math.min(2000, Math.round(n)) : 0;
      obnovCeny();
      var pozn = telo.querySelector('.km__pozn');
      if (pozn) pozn.textContent = 'Souprava jede tam i zpět, počítáme tedy ' + J.ujeteKm(stav.km) + ' km.';
    });
  }
  telo.querySelectorAll('.sh__upravit').forEach(function (b) {
    b.addEventListener('click', function () { naKrok(Number(b.dataset.krok)); });
  });
  var f = telo.querySelector('#poptavka');
  if (f) f.addEventListener('submit', function (e) { e.preventDefault(); });
}

/* Scéna se drží kroku: uvnitř kroku Interiér vás volba přenese tam,
   kde je na ní vidět, jinde se pohled po místnostech vůbec nenabízí. */
function poVolbe(klic, id, zapnuto) {
  poslatZapojeni();
  // Uložený kód patří té sestavě, pod kterou se ukládalo. Po změně už neplatí
  // a posílat ho s poptávkou by v adminu ukázalo jinou sestavu a jinou cenu.
  ulozenyKod = null;
  var box = document.getElementById('kodBox');
  if (box) box.hidden = true;
  if (klic === 'facade') {
    var v = najdiVolbu('facade', id);
    var info = telo.querySelector('.vzor__info');
    if (info && v) {
      info.querySelector('.vzor__nazev').textContent = J.optLabel(v);
      info.querySelector('.vzor__popis').textContent = v.desc;
      info.querySelector('.vzor__cena').textContent = J.optPriceLabel(v, stav.km);
    }
  }
  if (klic === 'addons' && id === 'transport') {
    // Překreslení celého kroku shodí ohnisko na body a nově vzniklé pole
    // s kilometry se nikde neohlásí. Ohnisko se proto vrátí zpátky na volbu
    // a čtečce se řekne, co přibylo.
    vykresli();
    var zpet = telo.querySelector('.vo[data-id="transport"] input, .vo[data-id="transport"]');
    if (zpet && zpet.focus) zpet.focus();
    hlaseni.textContent = zapnuto
      ? 'Přibylo pole pro vzdálenost na váš pozemek.'
      : 'Pole pro vzdálenost zmizelo.';
  } else obnovCeny();

  if (scenaTed === 'spin') { nastavOtocku(); popisScenu(); }
  if (scenaTed === 'pano') zamerVolbu(id);
}

/* Otočí prohlídku na to, co divák právě zaškrtl nebo odškrtl. Bez toho se
   mění snímek, na který se nikdo nedívá: kuchyňská linka je za zády a v
   záběru zůstane prázdná stěna, na které se nestalo nic.
   Platí i pro odebrání, protože zmizení je stejná zpráva jako přibytí. */
function zamerVolbu(id) {
  var tady = MISTA[stav.misto].klic;
  var zdeVidet = ZABERY[tady] && ZABERY[tady][id];
  if (zdeVidet) { nastavPano(false, zdeVidet); return; }
  var jinde = DOMA[id] ? indexMista(DOMA[id]) : nejblizSVolbou(id);
  if (jinde !== -1 && jinde !== stav.misto) {
    doMistnosti(jinde, ZABERY[MISTA[jinde].klic][id]);
    return;
  }
  nastavPano(false, null);
}

/* Závěsy v koupelně nikdo neuvidí, okno tam není. Pohled proto vyrazí do
   nejbližší místnosti, která tu volbu ukázat umí; nejbližší proto, aby se
   prohlídka nepřehodila přes celý dům kvůli jednomu zaškrtnutí. */
function nejblizSVolbou(id) {
  var a = MISTA[stav.misto], nej = -1, nejd = Infinity;
  MISTA.forEach(function (m, i) {
    if (i === stav.misto || !ZABERY[m.klic] || !ZABERY[m.klic][id]) return;
    var dx = m.mx - a.mx, dy = m.my - a.my;
    var d = dx * dx + dy * dy;
    if (d < nejd) { nejd = d; nej = i; }
  });
  return nej;
}


var fot = document.getElementById('fot');
var fotRam = document.getElementById('fotRam');
var fotPrep = document.getElementById('fotPrep');
var fotTed = null;

/* Fotky vyrobeného domu vedle vyrenderované scény. Celý konfigurátor ukazuje
   model, a tohle je jediné místo, kde si člověk ověří, že věc existuje i mimo
   něj. Proto ta patička pod snímkem říká, že je to fotka, ne vizualizace. */
function otevriFoto(klic) {
  var f = REALNE[klic];
  if (!f || !fot) return;
  fotTed = klic;
  document.getElementById('fotTitul').textContent = f.titul;
  document.getElementById('fotPopis').textContent = f.snimky.length > 1
    ? 'Fotky vyrobeného domu, ne vizualizace.'
    : 'Fotka vyrobeného domu, ne vizualizace.';
  ukazSnimek(0);
  fotPrep.hidden = f.snimky.length < 2;
  if (f.snimky.length > 1) {
    fotPrep.innerHTML = f.snimky.map(function (o, i) {
      return '<button type="button" class="fot__bod" data-i="' + i + '"' +
        (i === 0 ? ' aria-current="true"' : '') +
        '><span class="vh">Snímek ' + (i + 1) + ' z ' + f.snimky.length + '</span></button>';
    }).join('');
    fotPrep.querySelectorAll('.fot__bod').forEach(function (b) {
      b.addEventListener('click', function () { ukazSnimek(Number(b.dataset.i)); });
    });
  }
  udalost('view_photo', { polozka: klic });
  if (fot.showModal) fot.showModal(); else fot.setAttribute('open', '');
}

function ukazSnimek(i) {
  var f = REALNE[fotTed];
  var o = f.snimky[i];
  fotRam.innerHTML = '<img src="' + esc(o.s) + '" width="' + o.w + '" height="' + o.h +
    '" alt="' + esc(o.alt) + '" decoding="async">';
  fotPrep.querySelectorAll('.fot__bod').forEach(function (b, j) {
    if (j === i) b.setAttribute('aria-current', 'true');
    else b.removeAttribute('aria-current');
  });
}

if (fot) {
  document.getElementById('fotZavri').addEventListener('click', function () { fot.close(); });
  // Klepnutí mimo snímek zavírá. Cíl události je samotný dialog jen tehdy,
  // když se trefilo do podložky; uvnitř ho odchytí některé z dětí.
  fot.addEventListener('click', function (e) { if (e.target === fot) fot.close(); });
}

function obnovCeny() {
  telo.querySelectorAll('.sk[data-sk]').forEach(function (sek) {
    var g = J.skupiny(MODEL).filter(function (x) { return x.key === sek.dataset.sk; })[0];
    if (!g) return;
    sek.querySelectorAll('.vo').forEach(function (l) {
      var inp = l.querySelector('input');
      var o = g.options.filter(function (x) { return x.id === inp.value; })[0];
      var c = l.querySelector('.vo__cena');
      if (o && c) c.textContent = J.optPriceLabel(o, stav.km);
    });
  });
  obnovPatku();
}

function obnovPatku() {
  var t = J.totals(MODEL, vyber, stav.km);
  document.getElementById('soucetCena').textContent = J.fmtPrice(t.total);
  // Na souhrnu nese celkovou cenu rozpad v kartě, takže ji patka neopakuje
  // a uvolní místo tlačítku. Jinde je patka jediné místo, kde cena je.
  var jeSouhrn = stav.krok === POSLEDNI;
  document.getElementById('soucetPopis').textContent = jeSouhrn ? 'Celkem' : 'Zatím vychází';
  var soucetBox = document.querySelector('.soucet');
  if (soucetBox) soucetBox.hidden = jeSouhrn;
  var maOd = t.items.some(function (i) { return i.from; });
  document.getElementById('pozn').textContent = maOd
    ? 'Dům a vybavení bez DPH. U položek s „od“ počítáme spodní hranici, přesnou cenu potvrdíme v nabídce.'
    : 'Dům a vybavení bez DPH. Finální cenu potvrdíme v nabídce.';

  var zpet = document.getElementById('btnZpet');
  var dal = document.getElementById('btnDal');
  zpet.disabled = stav.krok === 0;
  if (stav.krok === POSLEDNI) {
    dal.innerHTML = 'Chci nezávaznou nabídku';
  } else {
    dal.innerHTML = 'Pokračovat <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';
  }
}

function naKrok(i) {
  i = Math.max(0, Math.min(POSLEDNI, i));
  if (i === stav.krok) return;
  stav.krok = i;
  stav.nejdal = Math.max(stav.nejdal, i);
  poslatKrok(i);
  vykresli();
  var n = document.getElementById('krokNadpis');
  if (n) n.focus({ preventScroll: true });
  if (window.innerWidth < 1280) window.scrollTo({ top: 0, behavior: mene() ? 'auto' : 'smooth' });
  hlaseni.textContent = 'Krok ' + (i + 1) + ' z ' + KROKY.length + ', ' + KROKY[i].title;
}

document.getElementById('btnZpet').addEventListener('click', function () { naKrok(stav.krok - 1); });
// Pojistka proti dvojkliku: dokud běží odeslání, tlačítko nic dalšího nedělá.
var odesilam = false;
document.getElementById('btnDal').addEventListener('click', function () {
  if (odesilam) return;
  if (stav.krok < POSLEDNI) { naKrok(stav.krok + 1); return; }
  odesli();
});

var MAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
function odesli() {
  var f = telo.querySelector('#poptavka');
  if (!f) return;
  var chyby = 0;
  [['name', function (v) { return v.trim().length > 1; }],
   ['phone', function (v) { return v.trim().length > 5; }],
   ['email', function (v) { return MAIL.test(v.trim()); }]].forEach(function (p) {
    var pole = f.querySelector('[data-pole="' + p[0] + '"]');
    var inp = pole.querySelector('input');
    var ok = p[1](inp.value);
    pole.classList.toggle('je-chyba', !ok);
    inp.setAttribute('aria-invalid', ok ? 'false' : 'true');
    if (!ok && !chyby) inp.focus();
    if (!ok) chyby++;
  });
  var stavEl = f.querySelector('#flStav');
  if (chyby) {
    stavEl.className = 'fm__stav je-chyba';
    stavEl.textContent = 'Zkontrolujte prosím označená pole.';
    return;
  }
  // Tlačítko není ve formuláři, odesílá se jím patka panelu. Hledat ho uvnitř
  // vracelo null, takže se nikdy nezablokovalo a trojklik poslal tři poptávky.
  var tl = document.getElementById('btnDal');
  var popisek = tl ? tl.textContent : '';
  var data = J.payload(MODEL, vyber, stav.km, {
    name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(),
    location: f.location.value.trim(), message: f.message.value.trim()
  }, { website: f.website.value, kod: ulozenyKod, source: 'konfigurator-kroky' });
  data.vstup = window.fhVstup ? window.fhVstup() : '';
  odesilam = true;
  if (tl) { tl.disabled = true; tl.textContent = 'Odesílám…'; }
  stavEl.className = 'fm__stav';
  stavEl.textContent = '';
  fetch('/api/send-konfigurace', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  }).then(function (res) {
    if (!res.ok) throw new Error('bad response');
    udalost('generate_lead', { value: 1, cena: data.total });
    stavEl.className = 'fm__stav';
    stavEl.textContent = 'Děkujeme, poptávku i konfiguraci jsme přijali. Ozveme se do 24 hodin.';
    f.querySelectorAll('input,textarea,button').forEach(function (x) { x.disabled = true; });
    if (tl) { tl.disabled = true; tl.textContent = 'Odesláno'; }
  }).catch(function () {
    stavEl.className = 'fm__stav je-chyba';
    stavEl.textContent = 'Odeslání se nezdařilo. Zkuste to znovu, nebo zavolejte na 607 321 543. Sestavu si zatím můžete stáhnout v PDF.';
    odesilam = false;
    if (tl) { tl.disabled = false; tl.textContent = popisek; }
  });
}

// Uložení sestavy pod kódem a PDF. Obojí je produkční, jen zavěšené na
// tlačítka, která staví souhrn, takže se napojují po každém vykreslení.
function navazNastroje() {
  var uloz = document.getElementById('btnUloz');
  if (uloz && !uloz.dataset.navazano) {
    uloz.dataset.navazano = '1';
    uloz.addEventListener('click', ulozKonfiguraci);
  }
  var pdf = document.getElementById('btnPdf');
  if (pdf && !pdf.dataset.navazano) {
    pdf.dataset.navazano = '1';
    pdf.addEventListener('click', function () {
      if (!window.FlexiKonfigPdf) return;
      window.FlexiKonfigPdf.stahni({
        MODEL: MODEL, vyber: vyber,
        totals: function () { return J.totals(MODEL, vyber, stav.km); },
        transportKm: function () { return J.transportKm(stav.km); },
        ujeteKm: function () { return J.ujeteKm(stav.km); },
        optPrice: function (o) { return J.optPrice(o, stav.km); },
        fmtPrice: J.fmtPrice, optLabel: J.optLabel,
        tlacitko: function () { return document.getElementById('btnPdf'); },
        udalost: udalost
      });
    });
  }
}

function ulozKonfiguraci() {
  var btn = document.getElementById('btnUloz');
  var box = document.getElementById('kodBox');
  var puvodni = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Ukládám…';
  var t = J.totals(MODEL, vyber, stav.km);
  fetch('/api/konfigurace', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'flexihouse', vyber: vyber, km: J.transportKm(stav.km), cena: t.total,
      souhrn: t.items.map(function (i) { return { group: i.group, value: i.label, price: i.price }; })
    })
  }).then(function (res) {
    return res.json().catch(function () { return {}; }).then(function (j) {
      if (!res.ok || !j.ok) throw new Error(j.error || 'Uložení se nezdařilo.');
      return j;
    });
  }).then(function (j) {
    ulozenyKod = j.kod;
    box.firstChild.textContent = 'Kód sestavy: ';
    document.getElementById('kodText').textContent = j.kod;
    box.hidden = false;
    udalost('save_configuration', { cena: t.total });
  }).catch(function (err) {
    box.hidden = false;
    box.firstChild.textContent = String(err.message || err) + ' ';
    document.getElementById('kodText').textContent = '';
  }).then(function () {
    btn.disabled = false;
    btn.textContent = puvodni;
  });
}

// Měření trychtýře. Události musí umět počkat: GA4 se zapíná až po souhlasu
// s cookies, takže dokud není, ukládají se do fronty a odešlou se najednou.
// Pixel na GA nečeká, jinak by ho minul každý, kdo povolí reklamu a ne analytiku.
var ulozenyKod = null;
var gaFronta = [];
var gaZive = false;
function gaPripravena() {
  return !!(window.gtag && window.dataLayer
    && Array.prototype.some.call(window.dataLayer, function (a) { return a && a[0] === 'config'; }));
}
function propustFrontu() {
  if (!gaPripravena()) return false;
  gaZive = true;
  while (gaFronta.length) {
    var u = gaFronta.shift();
    window.gtag('event', u[0], u[1]);
  }
  return true;
}
function udalost(nazev, params) {
  var p = Object.assign({ model: 'flexihouse' }, params || {});
  if (window.fhPixel) window.fhPixel(nazev, p);
  if (gaZive || propustFrontu()) { window.gtag('event', nazev, p); return; }
  if (gaFronta.length < 40) gaFronta.push([nazev, p]);
}
document.addEventListener('fh:ga', propustFrontu);
window.addEventListener('load', propustFrontu);

// Trychtýř po krocích. Každý krok se hlásí jen jednou, jinak by skákání zpět
// nafouklo čísla.
var krokPoslan = {};
function poslatKrok(idx) {
  if (krokPoslan[idx]) return;
  krokPoslan[idx] = true;
  udalost('configurator_step', {
    krok: idx + 1,
    nazev: KROKY[idx] ? KROKY[idx].title : ''
  });
}
var zapojen = false;
function poslatZapojeni() {
  if (zapojen) return;
  zapojen = true;
  udalost('configurator_engage', {});
}

// Obnova uložené sestavy z adresy. Admin u každé poptávky odkazuje na
// /konfigurator?kod=FH-XXXXXX a backend to umí přes GET /api/konfigurace.
// Bez tohohle odkaz otevřel výchozí sestavu a nikdo se to nedozvěděl.
var PARAMY = new URLSearchParams(location.search);
var kodZAdresy = (PARAMY.get('kod') || '').trim().toUpperCase();
if (/^FH-[A-Z0-9]{6}$/.test(kodZAdresy)) {
  fetch('/api/konfigurace?kod=' + encodeURIComponent(kodZAdresy))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      if (!j || !j.ok || !j.vyber) { kodSelhal(); return; }
      Object.keys(j.vyber).forEach(function (k) {
        if (k in vyber) vyber[k] = j.vyber[k];
      });
      if (j.km != null) stav.km = j.km;
      ulozenyKod = kodZAdresy;
      stav.krok = POSLEDNI;
      stav.nejdal = POSLEDNI;
      vykresli();
      var box = document.getElementById('kodBox');
      var text = document.getElementById('kodText');
      if (box && text) { text.textContent = kodZAdresy; box.hidden = false; }
    })
    .catch(kodSelhal);
}
// Když se sestava nenačte, musí to být vidět. Mlčky ukázat výchozí dům za
// 399 000 Kč znamená, že obchodník i zákazník koukají na něco jiného, než
// si zákazník složil, a nikdo se to nedozví.
// Box s kódem žije až na souhrnu, takže se hláška jen zapamatuje a vypíše se
// při vykreslení toho kroku.
var kodNenacten = '';
function kodSelhal() {
  kodNenacten = kodZAdresy;
  ukazChybuKodu();
}
function ukazChybuKodu() {
  if (!kodNenacten) return;
  var box = document.getElementById('kodBox');
  if (!box) return;
  box.firstChild.textContent = 'Sestavu pod kódem ' + kodNenacten
    + ' se nepodařilo načíst, ukazujeme výchozí dům. ';
  var text = document.getElementById('kodText');
  if (text) text.textContent = '';
  box.hidden = false;
}

var zAdresy = Number(PARAMY.get('krok'));
if (isFinite(zAdresy) && zAdresy >= 1 && zAdresy <= KROKY.length) {
  stav.krok = zAdresy - 1;
  stav.nejdal = stav.krok;
}
postavPostup();
vykresli();
udalost('open_configurator', {});
poslatKrok(stav.krok);
}());
