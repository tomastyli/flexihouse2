// Výpočet ceny konfigurace. Vzniklo 11. 9. 2026, když celoobrazovková verze
// konfigurátoru dostala vlastní zjednodušený součet a hrozilo, že obě stránky
// začnou u téže sestavy ukazovat jinou cenu. Jádro nezná DOM ani stav stránky,
// všechno dostane v parametrech.
(function (global) {
'use strict';

var czk = new Intl.NumberFormat('cs-CZ');

function fmtPrice(n) {
  return czk.format(n) + ' Kč';
}

function transportKm(km) {
  var n = Number(km);
  return isFinite(n) && n > 0 ? Math.round(n) : 0;
}

// Doprava se počítá tam i zpět, proto dvojnásobek.
function ujeteKm(km) {
  return transportKm(km) * 2;
}

function optPrice(o, km) {
  return o.price + (o.perKm ? o.perKm * ujeteKm(km) : 0);
}

function optVat(o) {
  return o.vat === 'incl' ? 'incl' : 'excl';
}

function optLabel(o) {
  return o.kod ? o.label + ' (' + o.kod + ')' : o.label;
}

function optPriceLabel(o, km) {
  if (o.cenaText) return o.cenaText;
  if (o.perKm && transportKm(km) === 0) {
    return '+ ' + fmtPrice(o.price) + ' + ' + o.perKm + ' Kč/km tam i zpět';
  }
  var p = optPrice(o, km);
  if (p <= 0) return 'V základní ceně';
  return '+ ' + (o.from ? 'od ' : '') + fmtPrice(p) + (o.vat === 'incl' ? ' vč. DPH' : '');
}

// Kroky průvodce mají skupiny, celoobrazovková verze bere skupinu i jako krok.
function skupiny(MODEL) {
  var out = [];
  MODEL.steps.forEach(function (krok) {
    (krok.groups || [krok]).forEach(function (g) { if (g.options) out.push(g); });
  });
  return out;
}

function selectedItems(MODEL, sel, km) {
  var items = [];
  skupiny(MODEL).forEach(function (g) {
    var v = sel[g.key];
    var idy = g.type === 'multi' ? (v || []) : (v ? [v] : []);
    idy.forEach(function (id) {
      var o = g.options.find(function (x) { return x.id === id; });
      if (!o) return;
      items.push({
        group: g.title, label: optLabel(o), price: optPrice(o, km),
        vat: optVat(o), from: !!o.from, key: g.key
      });
    });
  });
  return items;
}

// Položky s DPH v ceně se nesčítají se základem, který je bez DPH. Součet je
// jejich prostý úhrn, rozdělení slouží k popiskům.
function totals(MODEL, sel, km) {
  var items = selectedItems(MODEL, sel, km);
  var net = (MODEL.base || 0) + items.filter(function (i) { return i.vat !== 'incl'; })
    .reduce(function (s, i) { return s + i.price; }, 0);
  var gross = items.filter(function (i) { return i.vat === 'incl'; })
    .reduce(function (s, i) { return s + i.price; }, 0);
  return { net: net, gross: gross, total: net + gross, items: items };
}

// Tělo poptávky z konfigurátoru. Obě verze stránky ho musí skládat stejně,
// jinak by adminu chodily dva různé tvary téhož.
function payload(MODEL, sel, km, kontakt, extra) {
  var t = totals(MODEL, sel, km);
  var e = extra || {};
  return {
    website: e.website || '',
    model: e.model || 'flexihouse',
    modelName: MODEL.name,
    base: MODEL.base || 0,
    baseFormatted: fmtPrice(MODEL.base || 0),
    baseIncludes: MODEL.baseIncludes || [],
    total: t.total,
    totalFormatted: fmtPrice(t.total),
    totals: {
      net: t.net, netFormatted: fmtPrice(t.net),
      vatIncluded: t.gross, vatIncludedFormatted: fmtPrice(t.gross)
    },
    transportKm: transportKm(km),
    configuration: MODEL.steps.map(function (step) {
      return {
        step: step.title,
        items: (step.groups || [step]).reduce(function (out, g) {
          var v = sel[g.key];
          var idy = g.type === 'multi' ? (v || []) : (v ? [v] : []);
          idy.forEach(function (id) {
            var o = (g.options || []).find(function (x) { return x.id === id; });
            if (o) out.push({ group: g.title, value: optLabel(o), price: optPrice(o, km),
              vat: optVat(o), from: !!o.from });
          });
          return out;
        }, [])
      };
    }),
    summary: t.items.map(function (i) {
      return { group: i.group, value: i.label, price: i.price, vat: i.vat, from: i.from };
    }),
    contact: kontakt,
    kod: e.kod || null,
    meta: { source: e.source || 'konfigurator', url: location.href, ts: new Date().toISOString() }
  };
}

global.FlexiKonfigJadro = {
  payload: payload,
  fmtPrice: fmtPrice,
  transportKm: transportKm,
  ujeteKm: ujeteKm,
  optPrice: optPrice,
  optVat: optVat,
  optLabel: optLabel,
  optPriceLabel: optPriceLabel,
  skupiny: skupiny,
  selectedItems: selectedItems,
  totals: totals
};
}(window));
