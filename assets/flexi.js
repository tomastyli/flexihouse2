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
