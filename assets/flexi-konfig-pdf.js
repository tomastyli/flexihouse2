// PDF konfigurace. Vytaženo z konfigurator.html 11. 9. 2026, aby ho uměla
// i celoobrazovková verze. Modul nesahá na stav stránky, dostane ho v `K`:
// { MODEL, totals, transportKm, ujeteKm, fmtPrice, optLabel, tlacitko, udalost }.
(function (global) {
'use strict';

const PDF_ASSETS = ['assets/vendor/jspdf.umd.min.js?v=1', 'assets/vendor/jspdf-fonty.js?v=1'];
let pdfLibPromise = null;
function loadPdfLib() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve();
  if (!pdfLibPromise) {
    pdfLibPromise = PDF_ASSETS.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => {
      const sc = document.createElement('script');
      sc.src = src;
      sc.onload = resolve;
      sc.onerror = () => reject(new Error('nelze nacist ' + src));
      document.head.appendChild(sc);
    })), Promise.resolve()).catch((err) => { pdfLibPromise = null; throw err; });
  }
  return pdfLibPromise;
}

const PDF = {
  ink: [22, 32, 42],
  blue: [90, 120, 133],
  soft: [238, 242, 244],
  hair: [222, 227, 230],
  paper: [255, 255, 255]
};

const pdfSafe = (s) => String(s == null ? '' : s)
  .replace(/[\u00a0\u202f\u2007\u2009\u200a]/g, ' ')
  .replace(/[\u2011\u2012\u2013\u2014]/g, '\u2013')
  .replace(/²/g, '2').replace(/³/g, '3');

// Položka dopravy je jediná se sazbou za kilometr, hledá se podle toho.
function najdiDopravu(MODEL) {
  var out = null;
  MODEL.steps.forEach(function (krok) {
    (krok.groups || [krok]).forEach(function (g) {
      (g.options || []).forEach(function (o) { if (o.perKm) out = o; });
    });
  });
  return out;
}

function buildPdfDoc(K) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 46;
  const CW = W - M * 2;
  const right = W - M;
  let y = 0;

  const display = () => doc.setFont('Bricolage', 'bold');
  const body = (strong) => doc.setFont('Instrument', strong ? 'bold' : 'normal');
  const fill = (c) => doc.setFillColor(c[0], c[1], c[2]);
  const ink = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const stroke = (c) => doc.setDrawColor(c[0], c[1], c[2]);
  const put = (s, x, opts) => doc.text(pdfSafe(s), x, y, opts);

  const footer = () => {
    stroke(PDF.hair); doc.setLineWidth(0.6);
    doc.line(M, H - 42, right, H - 42);
    body(false); doc.setFontSize(7.5); ink(PDF.blue);
    doc.text('Flexi House · WINstores, s.r.o. · IČO 07836929 · +420 607 321 543 · flexihouse.cz', M, H - 30);
    doc.text('Strana ' + doc.internal.getNumberOfPages(), right, H - 30, { align: 'right' });
  };

  const header = () => {
    y = M + 12;
    display(); doc.setFontSize(17); ink(PDF.ink);
    put('FLEXI HOUSE', M);
    body(false); doc.setFontSize(8); ink(PDF.blue);
    const meta = ['WINstores, s.r.o. · IČO 07836929', '+420 607 321 543', new Date().toLocaleDateString('cs-CZ')];
    meta.forEach((line, i) => doc.text(pdfSafe(line), right, y - 6 + i * 10.5, { align: 'right' }));
    y += 16;
    fill(PDF.ink); doc.rect(M, y, CW, 2, 'F');
    y += 26;
  };

  let openSection = null;
  const drawSectionTitle = (title) => {
    body(true); doc.setFontSize(8); ink(PDF.ink);
    doc.setCharSpace(0.9);
    put(title.toUpperCase(), M);
    doc.setCharSpace(0);
    y += 8;
    stroke(PDF.ink); doc.setLineWidth(1);
    doc.line(M, y, right, y);
    y += 14;
  };
  const newPage = () => {
    footer(); doc.addPage(); header();
    if (openSection) drawSectionTitle(openSection + ' – pokračování');
  };
  const room = (need) => { if (y + need > H - 62) { newPage(); return true; } return false; };

  header();

  body(false); doc.setFontSize(7.5); ink(PDF.blue);
  doc.setCharSpace(1.2);
  put('VAŠE KONFIGURACE', M);
  doc.setCharSpace(0);
  y += 22;
  display(); doc.setFontSize(24); ink(PDF.ink);
  put(K.MODEL.name.toUpperCase(), M);
  y += 18;
  body(false); doc.setFontSize(9.5); ink(PDF.blue);
  put('Orientační kalkulace. Finální cenu potvrdíme v závazné nabídce.', M);
  y += 26;

  const sectionTitle = (title) => {
    openSection = null;
    room(40);
    drawSectionTitle(title);
    openSection = title;
  };

  const line = (label, value, strongValue) => {
    body(false); doc.setFontSize(9.5);
    const labelLines = doc.splitTextToSize(pdfSafe(label), CW * 0.58);
    room(labelLines.length * 12 + 10);
    body(false); doc.setFontSize(9.5); ink(PDF.blue);
    doc.text(labelLines, M, y);
    body(!!strongValue); doc.setFontSize(9.5); ink(strongValue ? PDF.ink : PDF.blue);
    doc.text(pdfSafe(value), right, y, { align: 'right' });
    y += labelLines.length * 12 + 3;
    stroke(PDF.hair); doc.setLineWidth(0.6);
    doc.line(M, y, right, y);
    y += 8;
  };

  sectionTitle('Základní cena');
  line(K.MODEL.name, K.fmtPrice(K.MODEL.base), true);
  (K.MODEL.baseIncludes || []).forEach((x) => line(x, 'v ceně', false));
  y += 7;

  K.MODEL.steps.forEach((step) => {
    const rows = [];
    step.groups.forEach((g) => {
      const v = K.vyber[g.key];
      if (g.type === 'multi') {
        (v || []).forEach((id) => { const o = g.options.find((x) => x.id === id); if (o) rows.push(o); });
      } else if (v) {
        const o = g.options.find((x) => x.id === v);
        if (o) rows.push(o);
      }
    });
    if (!rows.length) return;
    sectionTitle(step.title);
    rows.forEach((o) => {
      const p = K.optPrice(o);
      line(K.optLabel(o), p > 0 ? '+ ' + (o.from ? 'od ' : '') + K.fmtPrice(p) + (o.vat === 'incl' ? ' vč. DPH' : '') : (o.cenaText || 'v ceně'), p > 0);
    });
    y += 7;
  });

  const T = K.totals();
  openSection = null;
  room(130);
  sectionTitle('Rekapitulace ceny');
  line('Dům a vybavení (bez DPH)', K.fmtPrice(T.net), true);
  if (T.gross > 0) line('Práce na pozemku (vč. DPH)', K.fmtPrice(T.gross), true);
  const TO = najdiDopravu(K.MODEL);
  if (K.transportKm() > 0 && TO) line('Z toho doprava, ' + K.transportKm() + ' km tam i zpět po ' + TO.perKm + ' Kč', K.fmtPrice(K.ujeteKm() * TO.perKm), false);
  openSection = null;
  y += 9;
  room(70);
  stroke(PDF.ink); doc.setLineWidth(1);
  doc.rect(M, y, CW, 54, 'S');
  body(false); doc.setFontSize(8); ink(PDF.blue);
  doc.setCharSpace(0.9);
  doc.text('ORIENTAČNÍ CENA CELKEM', M + 18, y + 22);
  doc.setCharSpace(0);
  doc.setFontSize(7.5);
  doc.text('Sazbu DPH podle využití stavby potvrdíme v nabídce', M + 18, y + 37);
  display(); doc.setFontSize(21); ink(PDF.ink);
  doc.text(pdfSafe(K.fmtPrice(T.total)), right - 18, y + 34, { align: 'right' });
  y += 64;

  const f = document.getElementById('leadForm');
  const contact = f ? [f.name.value.trim(), f.phone.value.trim(), f.email.value.trim(), f.location.value.trim()].filter(Boolean) : [];
  if (contact.length) {
    body(false); doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(pdfSafe(contact.join(' · ')), CW - 36);
    const boxH = lines.length * 12 + 30;
    room(boxH + 12);
    fill(PDF.soft); doc.rect(M, y, CW, boxH, 'F');
    body(true); doc.setFontSize(7.5); ink(PDF.blue);
    doc.setCharSpace(0.9);
    doc.text('KONTAKT', M + 18, y + 20);
    doc.setCharSpace(0);
    body(false); doc.setFontSize(9.5); ink(PDF.ink);
    doc.text(lines, M + 18, y + 34);
    y += boxH + 16;
  }

  const note = 'Tento dokument je orientační a nezávazný. Dům a jeho vybavení uvádíme bez DPH, sazba DPH se řídí využitím stavby a potvrdíme ji v nabídce. Práce na pozemku, tedy doprava, usazení, betonové patky, montáž a sítě do oken, jsou uvedené včetně DPH. U položek s cenou od počítáme spodní hranici: betonové patky vyjdou podle podloží a počtu patek na 50 000 až 90 000 Kč, montáž podle náročnosti sestavení na 30 000 až 80 000 Kč. Cena nezahrnuje přípravu pozemku ani přípojky, připojení na sítě ani vyřízení povolení neděláme. Vygenerováno konfigurátorem na flexihouse.cz.';
  body(false); doc.setFontSize(7.5);
  const noteLines = doc.splitTextToSize(note, CW);
  room(noteLines.length * 10 + 12);
  ink(PDF.blue);
  doc.text(noteLines, M, y);

  footer();
  return doc;
}

async function downloadPdf(K) {
  const btn = K.tlacitko();
  const label = btn ? btn.textContent : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Připravuji PDF...'; }
  try {
    await loadPdfLib();
    const doc = buildPdfDoc(K);
    doc.save('Flexi-House-' + K.MODEL.name.replace(/\s+/g, '-') + '-konfigurace.pdf');
    if (K.udalost) K.udalost('download_pdf', { cena: K.totals().total });
  } catch (e) {
    alert('PDF se nepodařilo připravit. Zkuste to prosím znovu, nebo nám konfiguraci rovnou odešlete.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = label; }
  }
}

global.FlexiKonfigPdf = { stahni: downloadPdf, sestav: buildPdfDoc };
}(window));
