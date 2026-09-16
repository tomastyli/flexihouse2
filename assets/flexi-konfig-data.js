// Data konfigurátoru: ikony a katalog modelů s cenami.
// Vytaženo z konfigurator.html 10. 9. 2026, aby stejná čísla mohla číst
// i celoobrazovková verze. Ceny mají jediný zdroj pravdy, duplikát by
// dřív nebo později začal webu protiřečit.
(function (global) {
'use strict';
const I = {
  home:    '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  ruler:   '<path d="M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z"/><path d="m7.5 10.5 2 2M11 7l2 2M14.5 3.5l2 2"/>',
  roof:    '<path d="M2 12l10-8 10 8"/><path d="M5 10v10h14V10"/>',
  layers:  '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  window:  '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 12h18M12 3v18"/>',
  thermo:  '<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>',
  plug:    '<path d="M12 2v6M8 8V4M16 8V4"/><path d="M6 8h12v4a6 6 0 0 1-12 0z"/><path d="M12 18v4"/>',
  flame:   '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  bath:    '<path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2"/><path d="M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M6 19v2M18 19v2"/>',
  deck:    '<path d="M2 20h20M4 20V9M20 20V9M2 9h20l-3-4H5L2 9z"/>',
  stairs:  '<path d="M3 20h5v-4h4v-4h4V8h5"/><path d="M3 20v-2"/>',
  truck:   '<rect x="1" y="6" width="13" height="11" rx="1"/><path d="M14 9h4l3 3v5h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  tool:    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  doc:     '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/>',
  kitchen: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M8 3v6M8 14v3"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  sparkle: '<path d="M12 2l1.9 5.8L20 9l-5.8 1.9L12 17l-1.9-6.1L4 9l6.1-1.2z"/>',
  info:    '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/>',
  check:   '<polyline points="20 6 9 17 4 12"/>'
};
function svg(name, w) {
  w = w || 22;
  return '<svg width="'+w+'" height="'+w+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(I[name]||I.home)+'</svg>';
}

function exteriorGroups() {
  return [
    { key:'roof', title:'Střecha', type:'single', required:true, options:[
      { id:'flat',  label:'Plochá střecha', desc:'Moderní minimalistický vzhled. Součást základní ceny.', icon:'roof', price:0 },
      { id:'gable', label:'Sedlová střecha', desc:'Klasický tvar, lepší odvod vody i sněhu.', icon:'roof', price:90000 }
    ]},
    { key:'facade', title:'Fasáda', type:'single', required:true, swatch:true,
      hint:'základní obklad je v ceně, dekor fasády se připlácí a navíc zatepluje', options:[
      { id:'wood',  label:'Dřevěný obklad', desc:'Základní obklad, přírodní odstín dřeva.', img:'img/fasada/zaklad-drevo.webp', price:0, badge:'Oblíbené' },
      { id:'grey',  label:'Šedý obklad', desc:'Základní obklad, tlumená šedá.', img:'img/fasada/zaklad-seda.webp', price:0 },
      { id:'black', label:'Černý obklad', desc:'Základní obklad, výrazná tmavá.', img:'img/fasada/zaklad-cerna.webp', price:0 },
      { id:'pz-101', label:'Andělská bílá', desc:'Dekor fasády, hladký panel, PZ-101.', img:'img/fasada/pz-101.webp', dekor:true, kod:'PZ-101', price:23600 },
      { id:'pz-102', label:'Slonová kost', desc:'Dekor fasády, hladký panel, PZ-102.', img:'img/fasada/pz-102.webp', dekor:true, kod:'PZ-102', price:23600 },
      { id:'pz-201', label:'Tmavě šedá', desc:'Dekor fasády, hladký panel, PZ-201.', img:'img/fasada/pz-201.webp', dekor:true, kod:'PZ-201', price:23600 },
      { id:'tz-202', label:'Světle šedá', desc:'Dekor fasády, omítkový povrch, TZ-202.', img:'img/fasada/tz-202.webp', dekor:true, kod:'TZ-202', price:23600 },
      { id:'tz-201', label:'Betonově šedá', desc:'Dekor fasády, omítkový povrch, TZ-201.', img:'img/fasada/tz-201.webp', dekor:true, kod:'TZ-201', price:23600 },
      { id:'tz-501', label:'Pudrová', desc:'Dekor fasády, omítkový povrch, TZ-501.', img:'img/fasada/tz-501.webp', dekor:true, kod:'TZ-501', price:23600 },
      { id:'tz-504', label:'Krémová', desc:'Dekor fasády, omítkový povrch, TZ-504.', img:'img/fasada/tz-504.webp', dekor:true, kod:'TZ-504', price:23600 },
      { id:'tz-502', label:'Pouštní žlutá', desc:'Dekor fasády, omítkový povrch, TZ-502.', img:'img/fasada/tz-502.webp', dekor:true, kod:'TZ-502', price:23600 },
      { id:'mz-0302', label:'Tmavý ořech', desc:'Dekor fasády, dřevěná kresba, MZ-0302.', img:'img/fasada/mz-0302.webp', dekor:true, kod:'MZ-0302', price:23600 },
      { id:'mz-8043', label:'Medové dřevo', desc:'Dekor fasády, dřevěná kresba, MZ-8043.', img:'img/fasada/mz-8043.webp', dekor:true, kod:'MZ-8043', price:23600 },
      { id:'mz-0301', label:'Zlaté dřevo', desc:'Dekor fasády, dřevěná kresba, MZ-0301.', img:'img/fasada/mz-0301.webp', dekor:true, kod:'MZ-0301', price:23600 },
      { id:'lam-teak', label:'Lamely světlý teak', desc:'Svislé lamely z dřevoplastu, medový odstín.', img:'img/fasada/lam-teak.webp', dekor:true, lamely:true, price:23600 },
      { id:'lam-teakmix', label:'Lamely teak mix', desc:'Svislé lamely z dřevoplastu, hnědooranžový odstín.', img:'img/fasada/lam-teakmix.webp', dekor:true, lamely:true, price:23600 },
      { id:'lam-palisandr', label:'Lamely palisandr', desc:'Svislé lamely z dřevoplastu, tmavě fialovohnědý odstín.', img:'img/fasada/lam-palisandr.webp', dekor:true, lamely:true, price:23600 },
      { id:'lam-antracit', label:'Lamely tmavě šedé', desc:'Svislé lamely z dřevoplastu, tmavě šedý odstín.', img:'img/fasada/lam-antracit.webp', dekor:true, lamely:true, price:23600 },
      { id:'lam-seda', label:'Lamely světle šedé', desc:'Svislé lamely z dřevoplastu, světle šedý odstín.', img:'img/fasada/lam-seda.webp', dekor:true, lamely:true, price:23600 },
      { id:'lam-bila', label:'Lamely starobílé', desc:'Svislé lamely z dřevoplastu, šedobílý odstín.', img:'img/fasada/lam-bila.webp', dekor:true, lamely:true, price:23600 }
    ]},
    { key:'glazing', title:'Zasklení oken', type:'single', required:true, options:[
      { id:'clear',  label:'Čirá dvojskla', desc:'Hliníkové rámy, izolační dvojsklo. V základní ceně.', icon:'window', price:0 },
      { id:'mirror', label:'Reflexní skla', desc:'Galvanizované zasklení. Za denního světla působí zvenku jako zrcadlo, zevnitř vidíte ven.', icon:'sun', price:0, cenaText:'Teď bez příplatku', badge:'Akce' }
    ]}
  ];
}
function interiorGroups() {
  return [
    { key:'equipment', title:'Vybavení', type:'multi', required:false, hint:'Doporučujeme obojí, kliknutím lze odebrat', options:[
      { id:'bath',    label:'Koupelna', desc:'Sprchový kout, umyvadlo, WC a obklady.', icon:'bath', price:30000, preset:true, foto:'koupelna' },
      { id:'kitchen', label:'Kuchyňská linka', desc:'Linka s dřezem a místem pro spotřebiče.', icon:'kitchen', price:25000, preset:true, foto:'kuchyne' },
      { id:'floor',   label:'Podlaha', desc:'Podlahová krytina v celém domě.', icon:'layers', price:25000, foto:'podlaha' },
      { id:'drapes',  label:'Závěsy a záclony', desc:'Závěsy a záclony do všech oken.', icon:'window', price:20000, foto:'zavesy' }
    ]},
    { key:'utilities', title:'Elektroinstalace', type:'single', required:true, options:[
      { id:'elec', label:'Elektroinstalace', desc:'Zásuvky, světla, jištění. Připraveno k zapojení. V základní ceně.', icon:'plug', price:0 }
    ]},
    { key:'heating', title:'Vytápění', type:'single', required:true, options:[
      { id:'none',  label:'Bez vytápění', desc:'Dům dodáme bez topného zdroje, doplníte ho sami.', icon:'flame', price:0 },
      { id:'ac',    label:'Klimatizace s montáží', desc:'Nástěnná jednotka mezi okna v kuchyni. Topí i chladí, nízké provozní náklady.', icon:'flame', price:29000, badge:'Doporučeno' }
    ]}
  ];
}
function addonGroup() {
  return [
    { key:'addons', title:'Doplňky a služby', type:'multi', required:false, hint:'Vyberte libovolný počet', kmFor:'transport', options:[
      { id:'terrace',    label:'Terasa', desc:'Krytý prostor pro posezení venku.', icon:'deck', price:40000, foto:'terasa' },
      { id:'stairs',     label:'Schody', desc:'Vstupní schodiště k domu, který stojí na patkách.', icon:'stairs', price:23000, foto:'schody' },
      { id:'nets',       label:'Sítě do oken', desc:'Sítě proti hmyzu do všech oken.', icon:'window', price:10000, vat:'incl' },
      { id:'footings',   label:'Betonové patky', desc:'Základové patky pod dům včetně provedení. Podle podloží a počtu patek vyjdou na 50 000 až 90 000 Kč.', icon:'layers', price:50000, vat:'incl', from:true },
      { id:'transport',  label:'Doprava na místo a usazení', desc:'Dovezeme dům na váš pozemek a usadíme ho jeřábem. Kilometry se počítají tam i zpět, souprava se musí vrátit.', icon:'truck', price:20000, perKm:100, vat:'incl', badge:'Doporučeno' },
      { id:'assembly',   label:'Montáž domku', desc:'Rozložení a kompletace domu na pozemku. Podle náročnosti sestavení vyjde na 30 000 až 80 000 Kč.', icon:'tool', price:30000, vat:'incl', from:true }
    ]}
  ];
}

const MODELS = {
  flexihouse: {
    name: 'Flexi House',
    title: 'Konfigurátor modulárního domu | Flexi House',
    accent: 'dům na míru',
    base: 399000,
    baseIncludes: ['Hliníková okna s dvojskly', 'Vstupní dveře', 'Fasádní obklad', 'Zateplení Rockwool 75 mm'],
    tagline: 'Rozkládací dům s terasou. Projděte 5 kroků, vyberte vybavení a my vám připravíme nezávaznou nabídku na míru. Ceny jsou orientační, finální nabídku připravíme na míru.',
    steps: [
      { title:'Dispozice a velikost', micro:'Rozložený dům má vnější rozměr 6,32 × 5,90 m, uvnitř zhruba 30 m². Krytá terasa je příplatek, najdete ji v doplňcích.', groups:[
        { key:'size', title:'Dispozice', type:'single', required:true, options:[
          { id:'b2', label:'2 ložnice', desc:'Obývací prostor s kuchyňským koutem, koupelna a 2 ložnice.', icon:'home', meta:'~30 m² · 6,3 × 5,9 m', price:0 }
        ]}
      ]},
      { title:'Exteriér', micro:'Vzhled a opláštění domu: střecha, fasáda a zasklení. Základní obklad, okna i dveře jsou v ceně, dekor fasády je příplatek.', groups: exteriorGroups() },
      { title:'Interiér a technologie', micro:'Vybavení, izolace, elektroinstalace a vytápění. Ceny jsou bez DPH, u klimatizace je v ceně i montáž.', groups: interiorGroups() },
      { title:'Doplňky a služby', micro:'Volitelné. Doprava, usazení, patky a montáž jsou práce na pozemku, u nich uvádíme ceny včetně DPH. Připojení na sítě ani vyřízení povolení neděláme.', groups: addonGroup() }
    ]
  }
};
// Překlad voleb fasády na materiály 3D scény.
var FASADA_3D = {
  wood: 'wood', grey: 'grey', black: 'black',
  'pz-101': 'fas-pz-101',   'pz-102': 'fas-pz-102',   'pz-201': 'fas-pz-201',
  'tz-202': 'fas-tz-202',   'tz-201': 'fas-tz-201',   'tz-501': 'fas-tz-501',
  'tz-504': 'fas-tz-504',   'tz-502': 'fas-tz-502',   'mz-0302': 'fas-mz-0302',
  'mz-8043': 'fas-mz-8043',   'mz-0301': 'fas-mz-0301',
  'lam-teak': 'lam-teak', 'lam-teakmix': 'lam-teakmix', 'lam-palisandr': 'lam-palisandr',
  'lam-antracit': 'lam-antracit', 'lam-seda': 'lam-seda', 'lam-bila': 'lam-bila'
};


/* Snímky vyrobeného domu, ne vizualizace. Klíč je hodnota `foto:` u volby;
   volba bez něj náhled nemá a žádný se jí nepodstrčí. Sada je z natáčení
   31. 8. 2026 plus detaily terasy a schodu, `img/nahled/` jsou čtvercové
   miniatury do karet. Schválně chybí položky, které se sice dají koupit,
   ale nevybírají se podle vzhledu: patky, doprava, montáž, sítě. */
var REALNE = {
  koupelna: { titul:'Koupelna', snimky:[
    { s:'img/realne/koupelna-840h.webp', w:1260, h:840, alt:'Koupelna s umyvadlem, WC a sprchovým koutem ve vyrobeném domě' },
    { s:'img/koupelna-baterie-1200w.webp', w:1200, h:675, alt:'Detail sprchové baterie a mramorového obkladu' }
  ]},
  kuchyne: { titul:'Kuchyňská linka', snimky:[
    { s:'img/kuchyn-linka-1200w.webp', w:1200, h:675, alt:'Kuchyňská linka s dřezem pod oknem' },
    { s:'img/kuchyn-drez-1200w.webp', w:1200, h:675, alt:'Detail nerezového dřezu a baterie' },
    { s:'img/kuchyn-kavovar-1200w.webp', w:1200, h:675, alt:'Pracovní deska linky s kávovarem' }
  ]},
  podlaha: { titul:'Podlaha', snimky:[
    { s:'img/interier-koupelna-1200w.webp', w:1200, h:676, alt:'Podlahová krytina v obývacím prostoru' }
  ]},
  zavesy: { titul:'Závěsy a záclony', snimky:[
    { s:'img/realne/obyvak-840h.webp', w:1260, h:840, alt:'Obývací prostor se závěsy a záclonami u oken' }
  ]},
  terasa: { titul:'Terasa', snimky:[
    { s:'img/realne/terasa-840h.webp', w:1260, h:840, alt:'Krytá terasa před vstupem do domu' },
    { s:'img/terasa-detail-1200w.webp', w:1200, h:676, alt:'Detail prken terasové podlahy' }
  ]},
  schody: { titul:'Schody', snimky:[
    { s:'img/schod-rost-1200w.webp', w:1200, h:675, alt:'Pozinkovaný rošt vstupního schodu u terasy' }
  ]}
};

global.FlexiKonfigData = { I: I, MODELS: MODELS, svg: svg, FASADA_3D: FASADA_3D, REALNE: REALNE };
}(window));
