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
