(function () {
  'use strict';

  var API = '/api/poradce';
  var API_PREDAT = '/api/poradce-predat';
  var MAX_ZNAKU = 300;
  var KLIC_RELACE = 'fh_poradce_relace';
  var KLIC_BUBLINA = 'fh_poradce_bublina';
  var BUBLINA_PO_MS = 14000;
  var BUBLINA_PO_SCROLLU = 0.35;

  var ZNACKA = '<svg viewBox="9 16 46 33" aria-hidden="true">' +
    '<path d="M 41 25.5 L 53 19.5 L 44 15 L 32 21 Z" fill="#cfdde2"/>' +
    '<path d="M 41 35.5 L 53 29.5 L 53 19.5 L 41 25.5 Z" fill="#a9c0c9"/>' +
    '<path d="M 32 27 L 41 22.5 L 32 18 L 23 22.5 Z" fill="#3f5c69"/>' +
    '<path d="M 32 40 L 41 35.5 L 41 22.5 L 32 27 Z" fill="#16202a"/>' +
    '<path d="M 33.62 37.59 L 39.38 34.71 L 39.38 24.11 L 33.62 26.99 Z" fill="#eef2f4"/>' +
    '<path d="M 20 36 L 32 30 L 23 25.5 L 11 31.5 Z" fill="#cfdde2"/>' +
    '<path d="M 20 46 L 11 41.5 L 11 31.5 L 20 36 Z" fill="#7e99a4"/>' +
    '<path d="M 20 46 L 32 40 L 32 30 L 20 36 Z" fill="#a9c0c9"/></svg>';

  var TEMATA = [
    'Jakou nabídku máte?',
    'Kolik stojí základní dům?',
    'Potřebuju stavební povolení?',
    'Co stojí doprava na pozemek?',
    'Dá se v něm bydlet celoročně?',
    'Za jak dlouho dům dodáte?'
  ];

  var OTAZKY = [
    { t: 'Kolik stojí základní dům?', alias: 'cena cenu ceny cenik penize korun rozpocet levne draho' },
    { t: 'Co všechno je v základní ceně?', alias: 'cena zaklad zahrnuje obsahuje soucasti' },
    { t: 'Kolik stojí dům se vším vybavením?', alias: 'celkem dohromady vsechno vybaveni kompletni' },
    { t: 'Co si můžu připlatit?', alias: 'priplatek priplatky volitelne moznosti navic extra vybaveni doplnky' },
    { t: 'Co stojí koupelna a kuchyň?', alias: 'koupelna kuchyn kuchyne linka wc sprcha zachod kolik' },
    { t: 'Je elektroinstalace v ceně?', alias: 'elektrina elektro zasuvky rozvody voda odpad site pripojeni' },
    { t: 'Potřebuju stavební povolení?', alias: 'povoleni ohlaseni urad stavebni uzemni papiry' },
    { t: 'Vyřídíte povolení za mě?', alias: 'povoleni vyrizeni urad zaridite' },
    { t: 'Co musím mít připravené na pozemku?', alias: 'pozemek pozemku priprava zaklad zaklady patky deska beton' },
    { t: 'Co stojí doprava na pozemek?', alias: 'doprava dovoz privoz kilometr km usazeni vzdalenost kolik' },
    { t: 'Jak probíhá montáž na místě?', alias: 'montaz sestaveni instalace jerab usazeni' },
    { t: 'Dá se v něm bydlet celoročně?', alias: 'celorocne zima bydleni trvale mraz teplo' },
    { t: 'Jak se dům vytápí?', alias: 'topeni vytapeni klimatizace kamna tepelne cerpadlo' },
    { t: 'Jaké je zateplení?', alias: 'zatepleni izolace mm zima' },
    { t: 'Za jak dlouho dům dodáte?', alias: 'termin dodani dodaci lhuta kdy dlouho ceka rychle' },
    { t: 'Jaké má dům rozměry?', alias: 'rozmer rozmery metry m2 plocha velikost dispozice loznice pokoje' },
    { t: 'Kolik lidí se do domu vejde?', alias: 'osob lidi rodina vejde kapacita spani' },
    { t: 'Jaká je podlahová plocha?', alias: 'metry ctverecni m2 plocha vymera kolik' },
    { t: 'Jaké jsou možnosti střechy?', alias: 'strecha sedlova plocha krytina' },
    { t: 'Jakou nabídku máte?', alias: 'nabidka nabizite katalog sortiment vyber typy domy moznosti' },
    { t: 'Co je Flexi Office?', alias: 'office kancelar kancelare provozovna bunka' },
    { t: 'Chci dům na míru', alias: 'na miru atyp vlastni navrh upravit vetsi patro' },
    { t: 'Jde dům koupit na splátky?', alias: 'splatky hypoteka uver financovani zaloha platba' },
    { t: 'Jakou dáváte záruku?', alias: 'zaruka reklamace servis zivotnost vydrzi' }
  ];

  var PORUCHA = 'Teď se mi nedaří odpovědět. Zkuste to prosím za chvíli, nebo rovnou volejte Danovi na 607 321 543.';

  var klid = window.matchMedia('(prefers-reduced-motion: reduce)');
  var mqMobil = window.matchMedia('(max-width:560px)');

  var wid, launch, log, form, q, sendBtn, nap, napList;
  var busy = false;
  var pauzaDo = 0;
  var casy = [];
  var posledni = '';
  var opakovani = 0;
  var napAktualni = [];
  var napVyber = -1;
  var sahnuto = false;
  var poradiFormulare = 0;

  function relace() {
    var id = null;
    try {
      id = sessionStorage.getItem(KLIC_RELACE);
    } catch (e) {}
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(36).slice(2, 12);
      try {
        sessionStorage.setItem(KLIC_RELACE, id);
      } catch (e) {}
    }
    return id;
  }

  function esc(t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function norm(s) {
    return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function scroll() { log.scrollTop = log.scrollHeight; }

  function bublina(kdo, html) {
    var d = document.createElement('div');
    d.className = 'fhp-msg fhp-msg--' + kdo;
    d.innerHTML = html;
    log.appendChild(d);
    scroll();
    return d;
  }

  function setBusy(v, bezFokusu) {
    var pauza = Date.now() < pauzaDo;
    var zamek = v || pauza;
    busy = zamek;
    q.disabled = zamek;
    sendBtn.disabled = zamek;
    q.placeholder = v ? 'Poradce píše...' : (pauza ? 'Chviličku...' : 'Napište dotaz...');
    // Fokus se bere jen po akci člověka. Úvodní zpráva naskočí sama, a kdyby si
    // po ní poradce vzal fokus, vytrhne ho tomu, kdo zrovna tabuje stránkou.
    if (!zamek && !bezFokusu && !mqMobil.matches) q.focus();
  }

  function pis(el, text, hotovo) {
    el.textContent = '';
    if (klid.matches) { el.textContent = text; scroll(); hotovo(); return; }

    var caret = document.createElement('span');
    caret.className = 'fhp-caret';
    el.appendChild(caret);

    var poz = 0;
    var perTick = Math.max(1, Math.ceil(text.length / 108));
    var timer = null;

    function konec() {
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', schovano);
      el.textContent = text;
      scroll();
      hotovo();
    }
    function schovano() { if (document.hidden) konec(); }
    document.addEventListener('visibilitychange', schovano);

    (function krok() {
      if (poz >= text.length) { konec(); return; }
      poz = Math.min(text.length, poz + perTick);
      el.textContent = text.slice(0, poz);
      el.appendChild(caret);
      scroll();
      var ch = text.charAt(poz - 1);
      var d = 13 + Math.random() * 9;
      if (ch === ',' || ch === ';' || ch === ':') d += 75;
      else if (ch === '.' || ch === '!' || ch === '?') d += 165;
      timer = setTimeout(krok, d);
    })();
  }

  function rekni(text, potom, bezFokusu) {
    setBusy(true);
    var b = bublina('bot', '<span class="fhp-dots"><i></i><i></i><i></i></span>');
    setTimeout(function () {
      b.innerHTML = '';
      pis(b, text, function () {
        setBusy(false, bezFokusu);
        if (potom) potom();
      });
    }, 420 + Math.random() * 220);
  }

  function temata(seznam) {
    var row = document.createElement('div');
    row.className = 'fhp-chips';
    seznam.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fhp-chip';
      b.textContent = t;
      b.addEventListener('click', function () {
        if (busy) return;
        row.remove();
        posli(t);
      });
      row.appendChild(b);
    });
    var clovek = document.createElement('button');
    clovek.type = 'button';
    clovek.className = 'fhp-chip fhp-chip--human';
    clovek.textContent = 'Chci mluvit s člověkem';
    clovek.addEventListener('click', function () {
      if (busy) return;
      row.remove();
      bublina('me', 'Chci mluvit s člověkem');
      rekni('Jasně. Nechte mi jméno a telefon, Dan Prokeš se vám ozve. Celou naši konverzaci uvidí, takže nebudete nic opakovat.', formularKontakt);
    });
    row.appendChild(clovek);
    log.appendChild(row);
    scroll();
  }

  async function token() {
    var sitekey = document.documentElement.getAttribute('data-poradce-turnstile');
    if (!sitekey || !window.turnstile) return '';
    try {
      // Token je jednorázový a platí 300 vteřin, takže se musí brát čerstvý
      // před každou zprávou, ne jednou při načtení stránky.
      return await window.turnstile.execute(sitekey, { action: 'poradce' });
    } catch (e) {
      return '';
    }
  }

  function strazce(text) {
    var t = norm(text);
    var ted = Date.now();
    while (casy.length && ted - casy[0] > 30000) casy.shift();
    casy.push(ted);
    if (casy.length > 5) return { pauza: 12000, text: 'Zpráv chodí rychleji, než stíhám. Za chvilku pokračujeme. Pokud to spěchá, volejte Danovi na 607 321 543.' };
    if (t === norm(posledni)) {
      opakovani++;
      if (opakovani >= 2) return { text: 'Na tohle jsem odpovídal o kus výš. Když vám ta odpověď nesedí, předám vás Danovi, ten to doupřesní.' };
    } else {
      opakovani = 0;
    }
    posledni = text;
    return null;
  }

  async function posli(text) {
    sahnuto = true;
    napZavri();
    var ocesany = text.replace(/[\r\n]+/g, ' ').trim().slice(0, MAX_ZNAKU);
    if (!ocesany || busy) return;

    var chips = log.querySelectorAll('.fhp-chips');
    for (var i = 0; i < chips.length; i++) chips[i].remove();
    bublina('me', esc(ocesany));

    var stop = strazce(ocesany);
    if (stop) {
      if (stop.pauza) {
        pauzaDo = Date.now() + stop.pauza;
        setTimeout(function () { setBusy(false); }, stop.pauza + 60);
      }
      rekni(stop.text, function () { temata(TEMATA.slice(0, 3)); });
      return;
    }

    setBusy(true);
    var t = await token();
    var odpoved;
    try {
      var r = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ relace: relace(), zprava: ocesany, turnstile: t, website: '' })
      });
      var data = await r.json();
      odpoved = data && data.odpoved ? data : { odpoved: PORUCHA, predat: true };
    } catch (e) {
      odpoved = { odpoved: PORUCHA, predat: true };
    }
    setBusy(false);

    rekni(odpoved.odpoved, function () {
      if (odpoved.predat) formularKontakt();
      else temata(TEMATA.slice(0, 3));
    });
  }

  function formularKontakt() {
    // Předání může přijít vícekrát za konverzaci. Bez tohohle by se formuláře
    // vrstvily na sebe a člověk by nevěděl, který z nich je ten platný.
    var stary = log.querySelectorAll('.fhp-lead');
    for (var i = 0; i < stary.length; i++) stary[i].remove();

    // Skutečný <form>, aby Enter v poli odesílal. Dřív to byl div s type="button",
    // takže Enter nedělal nic a působilo to jako rozbité tlačítko.
    var box = document.createElement('form');
    box.className = 'fhp-lead';
    box.noValidate = true;
    var por = ++poradiFormulare;
    var idJmeno = 'fhpJmeno' + por;
    var idTel = 'fhpTel' + por;
    var idPast = 'fhpPast' + por;
    box.innerHTML =
      '<div><label for="' + idJmeno + '">Jméno</label>' +
      '<input id="' + idJmeno + '" type="text" autocomplete="name" placeholder="Jan Novák">' +
      '<p class="fhp-err" id="' + idJmeno + 'e" hidden></p></div>' +
      '<div><label for="' + idTel + '">Telefon</label>' +
      '<input id="' + idTel + '" type="tel" autocomplete="tel" inputmode="tel" placeholder="777 123 456">' +
      '<p class="fhp-err" id="' + idTel + 'e" hidden></p></div>' +
      '<input class="fhp-past" id="' + idPast + '" type="text" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<button type="submit">Předat Danovi</button>';

    var btn = box.querySelector('button');

    function chyba(pole, text) {
      var hl = box.querySelector('#' + pole.id + 'e');
      hl.textContent = text;
      hl.hidden = !text;
      pole.setAttribute('aria-invalid', text ? 'true' : 'false');
      pole.setAttribute('aria-describedby', text ? pole.id + 'e' : '');
      return !text;
    }

    box.addEventListener('submit', async function (ev) {
      ev.preventDefault();
      if (box.querySelector('#' + idPast).value) { box.remove(); return; }
      var poleJmeno = box.querySelector('#' + idJmeno);
      var poleTel = box.querySelector('#' + idTel);
      var jmeno = poleJmeno.value.trim();
      var tel = poleTel.value.trim();
      var okJmeno = chyba(poleJmeno, jmeno.length < 2 ? 'Doplňte prosím jméno.' : '');
      var okTel = chyba(poleTel, tel.replace(/\D/g, '').length < 9 ? 'Doplňte telefon, na kterém vás Dan zastihne.' : '');
      if (!okJmeno) { poleJmeno.focus(); return; }
      if (!okTel) { poleTel.focus(); return; }
      btn.disabled = true;
      btn.textContent = 'Předávám...';
      var t = await token();
      var ok = false;
      var duvod = '';
      try {
        var r = await fetch(API_PREDAT, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ relace: relace(), jmeno: jmeno, telefon: tel, turnstile: t, website: '' })
        });
        var d = await r.json();
        ok = !!(d && d.ok);
        duvod = (d && d.chyba) || '';
      } catch (e) {
        duvod = '';
      }
      if (!ok) {
        btn.disabled = false;
        btn.textContent = 'Předat Danovi';
        var e2 = box.querySelector('.fhp-err--odeslani') || document.createElement('p');
        e2.className = 'fhp-err fhp-err--odeslani';
        e2.setAttribute('role', 'alert');
        e2.hidden = false;
        e2.textContent = duvod || 'Nepodařilo se odeslat. Zavolejte prosím na 607 321 543.';
        box.appendChild(e2);
        btn.focus();
        return;
      }
      // Stejná událost jako u formuláře a konfigurátoru, ať jsou všechny tři cesty
      // k poptávce vidět na jednom místě.
      if (window.gtag) window.gtag('event', 'generate_lead', { form: 'poradce', value: 1 });
      box.remove();
      bublina('me', esc(jmeno + ', ' + tel));
      rekni('Předáno. Dan Prokeš se vám ozve na ' + tel + ', nejpozději do 24 hodin. Pokud to spěchá, můžete mu rovnou zavolat na 607 321 543.');
    });

    log.appendChild(box);
    scroll();
    box.querySelector('#' + idJmeno).focus();
  }

  function napZavri() {
    if (!nap) return;
    nap.hidden = true;
    napList.innerHTML = '';
    napVyber = -1;
    napAktualni = [];
    q.setAttribute('aria-expanded', 'false');
    q.removeAttribute('aria-activedescendant');
  }

  function napOdznac() {
    napVyber = -1;
    var li = napList.querySelectorAll('li');
    for (var i = 0; i < li.length; i++) li[i].setAttribute('aria-selected', 'false');
    q.removeAttribute('aria-activedescendant');
  }

  function napHledej(text) {
    var t = norm(text);
    if (t.length < 2) return [];
    var slova = t.split(/\s+/).filter(Boolean);
    return OTAZKY.map(function (o) {
      var veta = norm(o.t);
      var seno = veta + ' ' + (o.alias || '');
      if (veta.indexOf(t) === 0) return { o: o, skore: 0 };
      if (veta.indexOf(t) > -1) return { o: o, skore: 1 };
      if (seno.indexOf(t) > -1) return { o: o, skore: 2 };
      if (slova.every(function (w) { return seno.indexOf(w) > -1; })) return { o: o, skore: 3 };
      return null;
    }).filter(Boolean).sort(function (a, b) { return a.skore - b.skore; }).slice(0, 5)
      .map(function (x) { return x.o; });
  }

  function napZvyrazni(veta, hledane) {
    var h = norm(hledane);
    var i = norm(veta).indexOf(h);
    if (i < 0 || !h) return esc(veta);
    return esc(veta.slice(0, i)) + '<b>' + esc(veta.slice(i, i + h.length)) + '</b>' + esc(veta.slice(i + h.length));
  }

  function napVykresli(text) {
    napAktualni = napHledej(text);
    if (!napAktualni.length) { napZavri(); return; }
    napList.innerHTML = napAktualni.map(function (o, i) {
      return '<li id="fhp-nap-' + i + '" role="option" aria-selected="false">' + napZvyrazni(o.t, text) + '</li>';
    }).join('');
    nap.hidden = false;
    q.setAttribute('aria-expanded', 'true');
    napOdznac();
    var li = napList.querySelectorAll('li');
    for (var i = 0; i < li.length; i++) {
      (function (index, prvek) {
        prvek.addEventListener('mousedown', function (e) { if (e.button === 0) e.preventDefault(); });
        prvek.addEventListener('click', function (e) { if (e.button === 0) napPouzij(index); });
      })(i, li[i]);
    }
  }

  function napOznac(i) {
    var li = napList.querySelectorAll('li');
    if (!li.length) return;
    napVyber = (i + li.length) % li.length;
    for (var j = 0; j < li.length; j++) li[j].setAttribute('aria-selected', j === napVyber ? 'true' : 'false');
    q.setAttribute('aria-activedescendant', li[napVyber].id);
    li[napVyber].scrollIntoView({ block: 'nearest' });
  }

  function napPouzij(i) {
    var volba = napAktualni[i];
    if (!volba) return;
    napZavri();
    q.value = '';
    posli(volba.t);
  }

  function pozdrav() {
    var zavrena = false;
    try {
      zavrena = localStorage.getItem(KLIC_BUBLINA) === 'zavreno' ||
                sessionStorage.getItem(KLIC_BUBLINA) === 'videno';
    } catch (e) {}
    if (zavrena) return;

    var b = document.createElement('div');
    b.className = 'fhp-bublina';
    b.hidden = true;
    b.innerHTML =
      '<span class="fhp-bublina__text">Dobrý den, zeptejte se na cokoli k domům.</span>' +
      '<button class="fhp-bublina__x" type="button" aria-label="Skrýt pozdrav">&times;</button>';
    document.body.appendChild(b);

    var casovac = null;
    function schovej(natrvalo) {
      b.classList.remove('je-videt');
      setTimeout(function () { b.remove(); }, 300);
      window.removeEventListener('scroll', priScrollu);
      if (casovac) clearTimeout(casovac);
      try {
        sessionStorage.setItem(KLIC_BUBLINA, 'videno');
        if (natrvalo) localStorage.setItem(KLIC_BUBLINA, 'zavreno');
      } catch (e) {}
    }

    function ukaz() {
      if (sahnuto || !b.isConnected) return;
      // Cookie lišta sedí taky dole a překryla by pozdrav. Než ji člověk odbaví,
      // nemá smysl se hlásit; po jejím zavření se pozdrav ukáže sám.
      if (document.querySelector('.fh-cc')) {
        if (casovac) clearTimeout(casovac);
        casovac = setTimeout(ukaz, 2000);
        return;
      }
      window.removeEventListener('scroll', priScrollu);
      if (casovac) clearTimeout(casovac);
      b.hidden = false;
      void b.offsetWidth;
      b.classList.add('je-videt');
    }

    // Prohlížeč umí obnovit pozici scrollu z minulé návštěvy, takže samotná poloha
    // na stránce nestačí. Musí se člověk skutečně pohnout, a ne hned po načtení.
    var zacatek = Date.now();
    var odkud = window.scrollY;
    function priScrollu() {
      if (Date.now() - zacatek < 3000) { odkud = window.scrollY; return; }
      if (Math.abs(window.scrollY - odkud) < 400) return;
      var vyska = document.documentElement.scrollHeight - window.innerHeight;
      if (vyska > 0 && window.scrollY / vyska >= BUBLINA_PO_SCROLLU) ukaz();
    }

    // Ukáže se, až člověk na stránce chvíli je nebo se v ní posune. Ne hned po načtení.
    casovac = setTimeout(ukaz, BUBLINA_PO_MS);
    window.addEventListener('scroll', priScrollu, { passive: true });

    b.querySelector('.fhp-bublina__x').addEventListener('click', function (e) {
      e.stopPropagation();
      schovej(true);
    });
    b.querySelector('.fhp-bublina__text').addEventListener('click', function () {
      schovej(false);
      otevri(true);
    });

    skryjPozdrav = schovej;
  }

  var skryjPozdrav = null;

  function otevri(on) {
    sahnuto = true;
    if (skryjPozdrav) { skryjPozdrav(false); skryjPozdrav = null; }
    if (on) {
      launch.classList.add('is-shut');
      wid.hidden = false;
      wid.classList.add('is-shut');
      void wid.offsetWidth;
      wid.classList.remove('is-shut');
      setTimeout(function () { launch.hidden = true; }, 180);
      if (!mqMobil.matches) q.focus();
    } else {
      wid.classList.add('is-shut');
      launch.hidden = false;
      launch.classList.add('is-shut');
      void launch.offsetWidth;
      launch.classList.remove('is-shut');
      setTimeout(function () { wid.hidden = true; }, 300);
      launch.focus();
    }
  }

  function postav() {
    launch = document.createElement('button');
    launch.className = 'fhp-launch';
    launch.type = 'button';
    launch.innerHTML = ZNACKA + 'Zeptat se';

    wid = document.createElement('section');
    wid.className = 'fhp-wid';
    wid.setAttribute('aria-label', 'Poradce Flexi House');
    wid.innerHTML =
      '<div class="fhp-wid__head">' + ZNACKA +
        '<div class="fhp-wid__id"><b>Poradce Flexi House</b>' +
        '<small><i class="fhp-dot" aria-hidden="true"></i>Automatický poradce, odpovídá hned. Kdykoliv vás předám Danovi.</small></div>' +
        '<button class="fhp-wid__x" type="button" aria-label="Zavřít poradce">' +
        '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>' +
        '</button></div>' +
      '<div class="fhp-wid__log" role="log" aria-live="polite"></div>' +
      '<div class="fhp-wid__foot">' +
        '<div class="fhp-nap" hidden><p class="fhp-nap__hl" id="fhpNapHl">Ptáte se na tohle?</p>' +
        '<ul class="fhp-nap__list" role="listbox" aria-labelledby="fhpNapHl"></ul></div>' +
        '<p class="fhp-wid__note">K zodpovězení dotazu zpracováváme vaše osobní údaje a konverzaci ukládáme. ' +
        '<a href="/zasady-ochrany-soukromi">Více informací</a></p>' +
        '<form class="fhp-wid__form">' +
        '<label class="fhp-vh" for="fhpQ">Váš dotaz</label>' +
        '<input id="fhpQ" type="text" placeholder="Napište dotaz..." autocomplete="off" maxlength="300" ' +
        'role="combobox" aria-expanded="false" aria-autocomplete="list">' +
        '<button type="submit" aria-label="Odeslat dotaz">' +
        '<svg viewBox="0 0 17 17" aria-hidden="true"><path d="M1 8.5 H15 M9 2.5 L15 8.5 L9 14.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>' +
        '</button></form></div>';

    document.body.appendChild(launch);
    document.body.appendChild(wid);

    log = wid.querySelector('.fhp-wid__log');
    form = wid.querySelector('.fhp-wid__form');
    q = wid.querySelector('#fhpQ');
    sendBtn = form.querySelector('button[type="submit"]');
    nap = wid.querySelector('.fhp-nap');
    napList = wid.querySelector('.fhp-nap__list');
    napList.id = 'fhpNapList';
    q.setAttribute('aria-controls', 'fhpNapList');

    wid.querySelector('.fhp-wid__x').addEventListener('click', function () { otevri(false); });
    launch.addEventListener('click', function () { otevri(true); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = q.value;
      q.value = '';
      posli(text);
    });

    q.addEventListener('input', function () {
      if (busy) { napZavri(); return; }
      napVykresli(q.value.trim());
    });
    q.addEventListener('blur', function () { setTimeout(napZavri, 120); });
    q.addEventListener('keydown', function (e) {
      if (nap.hidden) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); napOznac(napVyber + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); napOznac(napVyber - 1); }
      else if (e.key === 'Escape') { e.preventDefault(); napZavri(); }
      else if (e.key === 'Enter' && napVyber >= 0) { e.preventDefault(); napPouzij(napVyber); }
      else if (['Home', 'End', 'ArrowLeft', 'ArrowRight'].indexOf(e.key) > -1) napOdznac();
    });

    // Poradce se otevírá jen na kliknutí. Sám naskakující chat je otravný a odhání lidi.
    wid.hidden = true;
    launch.hidden = false;

    pozdrav();

    rekni('Dobrý den, jsem poradce Flexi House. Poradím s cenou, povolením i tím, co dům obsahuje. Napište mi dotaz vlastními slovy, nebo si vyberte téma.',
      function () { temata(TEMATA); }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', postav);
  } else {
    postav();
  }
})();
