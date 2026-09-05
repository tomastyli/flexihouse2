(function(){
  var burger=document.querySelector('.burger'), menu=document.getElementById('menu');
  if(!burger||!menu) return;
  function set(open){
    menu.hidden=!open;
    burger.setAttribute('aria-expanded',String(open));
    burger.setAttribute('aria-label',open?'Zavřít menu':'Otevřít menu');
    document.body.classList.toggle('is-locked',open);
  }
  set(false);
  burger.setAttribute('aria-controls','menu');
  burger.addEventListener('click',function(){ set(menu.hidden); });
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) set(false); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!menu.hidden) set(false); });
  window.addEventListener('resize',function(){ if(window.innerWidth>640&&!menu.hidden) set(false); });
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
