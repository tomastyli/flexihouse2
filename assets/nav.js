/* ============================================================
   Flexi House — sdílené chování navigace (subpages)
   sticky nav · mega menu · mobilní menu · reveal · smooth scroll
============================================================ */
(function () {
  'use strict';

  // sticky nav
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // mega menu (hover + click)
  var megaItem = document.querySelector('.nav__item[data-mega]');
  if (megaItem) {
    var btn = megaItem.querySelector('.nav__link');
    var timer;
    var open = function () { clearTimeout(timer); megaItem.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); };
    var close = function () { timer = setTimeout(function () { megaItem.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }, 120); };
    megaItem.addEventListener('mouseenter', open);
    megaItem.addEventListener('mouseleave', close);
    btn.addEventListener('click', function (e) { e.preventDefault(); megaItem.classList.toggle('open'); btn.setAttribute('aria-expanded', megaItem.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!megaItem.contains(e.target)) { megaItem.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  }

  // mobile menu
  var burger = document.getElementById('burger');
  var mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    var setBurger = function (isOpen) {
      burger.classList.toggle('is-open', isOpen);
      mm.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', isOpen);
      burger.setAttribute('aria-label', isOpen ? 'Zavřít menu' : 'Otevřít menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setBurger(!burger.classList.contains('is-open')); });
    var closeMobile = function () { setBurger(false); };
    mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMobile); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && burger.classList.contains('is-open')) closeMobile(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 860 && burger.classList.contains('is-open')) closeMobile(); });
    var mGroupHead = document.getElementById('mGroupHead');
    var mGroupDomy = document.getElementById('mGroupDomy');
    if (mGroupHead) mGroupHead.addEventListener('click', function () { mGroupDomy.classList.toggle('open'); });
  }

  // reveal on scroll
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var t = document.querySelector(href);
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  // footer "Nastavení cookies"
  document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); if (window.openCookieSettings) window.openCookieSettings(); });
  });
})();
