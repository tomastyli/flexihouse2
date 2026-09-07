(function(){
  var burger=document.querySelector('.burger'), menu=document.getElementById('menu');
  if(!burger||!menu) return;
  var casovac;
  function set(open,hned){
    clearTimeout(casovac);
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'Zavřít menu':'Otevřít menu');
    document.body.classList.toggle('is-locked',open);
    if(open){
      menu.hidden=false;
      if(hned) menu.classList.add('je-otevrene');
      else requestAnimationFrame(function(){ menu.classList.add('je-otevrene'); });
    } else {
      menu.classList.remove('je-otevrene');
      if(hned) menu.hidden=true;
      else casovac=setTimeout(function(){ menu.hidden=true; },260);
    }
  }
  set(false,true);
  burger.setAttribute('aria-controls','menu');
  burger.addEventListener('click',function(){ set(menu.hidden); });
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) set(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!menu.hidden) set(false); });
  window.addEventListener('resize',function(){ if(window.innerWidth>640&&!menu.hidden) set(false,true); });
})();

(function(){
  function send(name,params){ if(window.gtag) window.gtag('event',name,params||{}); }
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href]');
    if(!a) return;
    var href=a.getAttribute('href')||'';
    if(href.indexOf('tel:')===0){ send('contact_phone',{method:'telefon',location:location.pathname}); return; }
    if(href.indexOf('mailto:')===0){ send('contact_email',{method:'e-mail',location:location.pathname}); return; }
    if(href.indexOf('/konfigurator')===0){ send('configurator_start',{location:location.pathname}); return; }
    if(href.indexOf('/poptavka')===0){ send('lead_form_open',{location:location.pathname}); }
  });
})();

(function(){
  var K='fh_vstup';
  try{
    if(!sessionStorage.getItem(K)){
      var q=new URLSearchParams(location.search), utm={};
      ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(function(k){ if(q.get(k)) utm[k]=q.get(k).slice(0,80); });
      sessionStorage.setItem(K, JSON.stringify({ stranka: location.pathname, referrer: document.referrer.slice(0,200), utm: utm, kdy: new Date().toISOString() }));
    }
  }catch(e){}
  window.fhVstup=function(){
    try{
      var v=JSON.parse(sessionStorage.getItem(K)||'null'); if(!v) return '';
      var u=Object.keys(v.utm||{}).map(function(k){ return k+'='+v.utm[k]; }).join('&');
      return 'vstup: '+v.stranka+(v.referrer?' <- '+v.referrer:' <- přímo')+(u?' ['+u+']':'')+' @'+v.kdy;
    }catch(e){ return ''; }
  };
})();

(function(){
  var el=document.querySelectorAll('.fh-rv');
  if(!el.length) return;
  var vse=function(){ for(var i=0;i<el.length;i++) el[i].classList.add('je-videt'); };
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches){ vse(); return; }
  var hnul=false;
  var oznac=function(){ hnul=true; };
  ['wheel','touchstart','keydown','pointerdown'].forEach(function(t){ addEventListener(t,oznac,{once:true,passive:true}); });
  var io=new IntersectionObserver(function(zaznamy){
    for(var i=0;i<zaznamy.length;i++){
      var z=zaznamy[i];
      if(!z.isIntersecting) continue;
      if(!hnul) z.target.classList.add('bez-prechodu');
      z.target.classList.add('je-videt');
      io.unobserve(z.target);
    }
  },{threshold:0,rootMargin:'0px 0px -12% 0px'});
  for(var j=0;j<el.length;j++) io.observe(el[j]);
  addEventListener('focusin',function(u){
    var s=u.target.closest?u.target.closest('.fh-rv'):null;
    if(!s||s.classList.contains('je-videt')) return;
    s.classList.add('bez-prechodu','je-videt');
    io.unobserve(s);
  });
})();

(function(){
  var hlavicka = document.querySelector('.top');
  if (!hlavicka) return;
  var hlidac = document.querySelector('.hero__hlidac');
  if (!hlidac || !('IntersectionObserver' in window)) { hlavicka.classList.add('top--pevna'); return; }
  var odsazeni = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 84;
  var mrtvaZona = 64;
  var nadHranou = function (z) {
    return z.rootBounds ? z.boundingClientRect.top <= z.rootBounds.top : z.boundingClientRect.top <= 0;
  };
  new IntersectionObserver(function (zaznamy) {
    if (!zaznamy[0].isIntersecting && nadHranou(zaznamy[0])) hlavicka.classList.add('top--pevna');
  }, { rootMargin: '-' + (odsazeni - 2) + 'px 0px 0px 0px' }).observe(hlidac);
  new IntersectionObserver(function (zaznamy) {
    if (zaznamy[0].isIntersecting || !nadHranou(zaznamy[0])) hlavicka.classList.remove('top--pevna');
  }, { rootMargin: '-' + (odsazeni - 2 + mrtvaZona) + 'px 0px 0px 0px' }).observe(hlidac);
})();
