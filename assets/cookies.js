(function () {
  'use strict';

  var CONFIG = {
    gaId: 'G-B9WNLFF5FR'
  };

  var STORAGE_KEY = 'fh_cookie_consent';
  var isPlaceholder = function (v) { return !v || /X{4,}/.test(v); };
  var isOstra = function () {
    var h = location.hostname;
    return h === 'flexihouse.cz' || h === 'www.flexihouse.cz';
  };

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });

  var loaded = { ga: false };

  function loadGA() {
    if (loaded.ga || isPlaceholder(CONFIG.gaId) || !isOstra()) return;
    loaded.ga = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + CONFIG.gaId;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', CONFIG.gaId, { anonymize_ip: true });
    try { document.dispatchEvent(new CustomEvent('fh:ga')); } catch (e) {}
  }

  function applyConsent(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (c.analytics) loadGA();
  }

  function save(c) {
    c.necessary = true;
    c.ts = Date.now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch (e) {}
    applyConsent(c);
  }

  function read() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch (e) { return null; }
  }

  function injectStyle() {
    if (document.getElementById('fh-cookie-style')) return;
    var css = '' +
    '.fh-cc{position:fixed;left:0;right:0;bottom:0;z-index:1000;padding:16px;padding-bottom:calc(16px + env(safe-area-inset-bottom));display:flex;justify-content:center;pointer-events:none}' +
    '.fh-cc__panel{pointer-events:auto;width:100%;max-width:760px;background:#16202a;border:1px solid rgba(255,255,255,.16);;box-shadow:0 30px 60px -20px rgba(0,0,0,.6);padding:22px 24px;transform:translateY(140%);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .45s ease}' +
    '.fh-cc.show .fh-cc__panel{transform:translateY(0);opacity:1}' +
    '.fh-cc__t{font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-weight:700;font-size:1.05rem;color:#fff;margin:0 0 6px}' +
    '.fh-cc__p{font-family:Inter,system-ui,sans-serif;font-size:.88rem;line-height:1.55;color:rgba(255,255,255,.72);margin:0}' +
    '.fh-cc__p a{color:#cfdde2;text-decoration:underline}' +
    '.fh-cc__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}' +
    '.fh-cc__btn{font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:.9rem;;padding:12px 22px;cursor:pointer;border:1px solid transparent;transition:transform .2s ease,background .2s ease,border-color .2s ease}' +
    '.fh-cc__btn:hover{transform:translateY(-1px)}' +
    '.fh-cc__text a{color:#cfdde2;text-decoration:underline}' +
    '.fh-cc__btn--accept{background:#fff;color:#16202a}' +
    '.fh-cc__btn--accept:hover{background:#cfdde2}' +
    '.fh-cc__btn--reject{background:rgba(255,255,255,.06);color:#fff;border-color:rgba(255,255,255,.22)}' +
    '.fh-cc__btn--ghost{background:transparent;color:rgba(255,255,255,.8);margin-right:auto}' +
    '.fh-cc__btn--ghost:hover{color:#fff}' +
    '.fh-cc__settings{margin-top:18px;display:none;flex-direction:column;gap:2px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px}' +
    '.fh-cc.open .fh-cc__settings{display:flex}' +
    '.fh-cc__row{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}' +
    '.fh-cc__row:last-child{border-bottom:0}' +
    '.fh-cc__row-txt{flex:1}' +
    '.fh-cc__row-t{font-family:"Plus Jakarta Sans",system-ui,sans-serif;font-weight:600;font-size:.92rem;color:#fff}' +
    '.fh-cc__row-d{font-size:.8rem;color:rgba(255,255,255,.55);margin-top:2px}' +
    '.fh-cc__sw{position:relative;width:44px;height:26px;flex-shrink:0;margin-top:2px}' +
    '.fh-cc__sw input{opacity:0;width:0;height:0;position:absolute}' +
    '.fh-cc__sw span{position:absolute;inset:0;background:rgba(255,255,255,.18);;transition:background .25s ease;cursor:pointer}' +
    '.fh-cc__sw span::before{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .25s ease}' +
    '.fh-cc__sw input:checked + span{background:#5a7885;color:#fff}' +
    '.fh-cc__sw input:checked + span::before{transform:translateX(18px)}' +
    '.fh-cc__sw input:disabled + span{background:#16202a;cursor:not-allowed}' +
    '@media(max-width:560px){.fh-cc__btn--ghost{margin-right:0;width:100%;order:3}.fh-cc__btn--accept,.fh-cc__btn--reject{flex:1}}';
    var st = document.createElement('style');
    st.id = 'fh-cookie-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  var root;
  function build() {
    injectStyle();
    root = document.createElement('div');
    root.className = 'fh-cc';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Nastavení cookies');
    root.setAttribute('aria-live', 'polite');
    root.innerHTML =
      '<div class="fh-cc__panel">' +
        '<p class="fh-cc__t">Respektujeme vaše soukromí</p>' +
        '<p class="fh-cc__p">Používáme cookies pro fungování webu a s vaším souhlasem také pro anonymní měření návštěvnosti (Google Analytics). Reklamní cookies nenasazujeme. Více v <a href="zasady-ochrany-soukromi.html">zásadách ochrany soukromí</a>.</p>' +
        '<div class="fh-cc__settings" id="fhccSettings">' +
          '<div class="fh-cc__row">' +
            '<div class="fh-cc__row-txt"><div class="fh-cc__row-t">Nezbytné</div><div class="fh-cc__row-d">Potřebné pro základní fungování webu. Vždy aktivní.</div></div>' +
            '<label class="fh-cc__sw"><input type="checkbox" checked disabled><span></span></label>' +
          '</div>' +
          '<div class="fh-cc__row">' +
            '<div class="fh-cc__row-txt"><div class="fh-cc__row-t">Analytické</div><div class="fh-cc__row-d">Google Analytics 4: anonymní měření návštěvnosti.</div></div>' +
            '<label class="fh-cc__sw"><input type="checkbox" id="fhccAnalytics"><span></span></label>' +
          '</div>' +
        '</div>' +
        '<div class="fh-cc__actions">' +
          '<button class="fh-cc__btn fh-cc__btn--ghost" id="fhccToggle">Nastavení</button>' +
          '<button class="fh-cc__btn fh-cc__btn--reject" id="fhccReject">Odmítnout vše</button>' +
          '<button class="fh-cc__btn fh-cc__btn--accept" id="fhccAccept">Přijmout vše</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    var elA = root.querySelector('#fhccAnalytics');
    var existing = read();
    if (existing) { elA.checked = !!existing.analytics; }

    root.querySelector('#fhccToggle').addEventListener('click', function () {
      root.classList.toggle('open');
      this.textContent = root.classList.contains('open') ? 'Skrýt nastavení' : 'Nastavení';
    });
    root.querySelector('#fhccAccept').addEventListener('click', function () {
      save({ analytics: true }); hide();
    });
    root.querySelector('#fhccReject').addEventListener('click', function () {
      save({ analytics: false }); hide();
    });
    root.addEventListener('change', function (e) {
      if (e.target === elA) {
        save({ analytics: elA.checked });
      }
    });

    requestAnimationFrame(function () { root.classList.add('show'); });
  }

  function show() {
    if (!root) build(); else { root.classList.add('show'); }
    var existing = read();
    if (existing) {
      var a = root.querySelector('#fhccAnalytics'); if (a) a.checked = !!existing.analytics;
    }
  }
  function hide() { if (root) { root.classList.remove('show'); root.classList.remove('open'); var t = root.querySelector('#fhccToggle'); if (t) t.textContent = 'Nastavení'; } }

  window.openCookieSettings = function () { show(); if (root) root.classList.add('open'); var t = root.querySelector('#fhccToggle'); if (t) t.textContent = 'Skrýt nastavení'; };

  function init() {
    var existing = read();
    if (existing) { applyConsent(existing); }
    else { build(); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
