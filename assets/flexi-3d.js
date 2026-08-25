  function dojdi(x0, z0, x1, z1) {
    var plochy = plochyChuze(), prekazky = prekazkyChuze();
    if (!lzeStat(x1, z1, plochy, prekazky)) return null;
    var dx = x1 - x0, dz = z1 - z0;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 1e-4) return null;
    var n = Math.max(2, Math.ceil(d / 0.035));
    var dobra = null, vstoupil = false;
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      var nx = x0 + dx * t, nz = z0 + dz * t;
      var ok = lzeStat(nx, nz, plochy, prekazky);
      if (ok) { vstoupil = true; dobra = [nx, nz]; }
      else if (vstoupil) break;
    }
    return dobra;
  }

(function (global) {
'use strict';

var TEX_VERZE = '4';

var TEX = {
  wood:      { soubor: 'fasada.webp',       normala: 'fasada_n.webp' },
  grey:      { soubor: 'fasada-seda.webp',  normala: 'fasada_n.webp' },
  black:     { soubor: 'fasada-cerna.webp', normala: 'fasada_n.webp' },
  deck:      { soubor: 'prkna.webp',        normala: 'prkna_n.webp' },
  roof:      { soubor: 'strecha.webp',      normala: 'strecha_n.webp' },
  soffit:    { soubor: 'podhled.webp',      normala: 'podhled_n.webp' },
  frame:     { soubor: 'ram.webp',          normala: 'ram_n.webp' },
  podlahaIn: { soubor: 'podlaha.webp',      normala: 'podlaha_n.webp' },
  stenaIn:   { soubor: 'stena-in.webp',     normala: 'stena-in_n.webp' },
  lamelyIn:  { soubor: 'lamely.webp',       normala: 'lamely_n.webp' },
  mramorIn:  { soubor: 'mramor.webp' },
  deskaIn:   { soubor: 'deska.webp' }
};

var MAT = {
  wood:    { tex: 'wood',    nahradaTint: [0.625, 0.348, 0.174], rough: 0.31, metal: 0.10 },
  grey:    { tex: 'grey',    nahradaTint: [0.452, 0.445, 0.431], rough: 0.33, metal: 0.10 },
  black:   { tex: 'black',   nahradaTint: [0.140, 0.140, 0.140], rough: 0.35, metal: 0.10 },
  ocel:    { tex: 'frame',   rough: 0.44, metal: 0.55 },
  ramecek: { tex: 'frame',   tint: [0.72, 0.72, 0.74], rough: 0.44, metal: 0.24 },
  strecha: { tex: 'roof',    rough: 0.60, metal: 0.12 },
  podhled: { tex: 'soffit',  rough: 0.72, metal: 0.02 },
  prkna:   { tex: 'deck',    rough: 0.72, metal: 0.02 },
  bily:    { tex: null, tint: [0.86, 0.86, 0.84], rough: 0.55, metal: 0.05 },
  jednotka:{ tex: null, tint: [0.70, 0.705, 0.705], rough: 0.42, metal: 0.15 },
  klika:   { tex: null, tint: [0.30, 0.24, 0.15], rough: 0.30, metal: 0.85 },
  komin:   { tex: null, tint: [0.62, 0.64, 0.66], rough: 0.35, metal: 0.80 },
  lista:   { tex: null, tint: [0.44, 0.446, 0.452], rough: 0.44, metal: 0.66 },
  sklo:    { tex: null, tint: [0.04, 0.045, 0.052], rough: 0.05, metal: 0.00, sklo: 1 },
  teren:   { tex: null, tint: [0.30, 0.30, 0.29], rough: 0.95, metal: 0.00, teren: 1 },

  stenaIn: { tex: 'stenaIn', rough: 0.40, metal: 0.06 },
  stropIn: { tex: null, tint: [0.845, 0.850, 0.842], rough: 0.46, metal: 0.03 },
  lamely:  { tex: 'lamelyIn', rough: 0.30, metal: 0.03 },
  podlaha: { tex: 'podlahaIn', rough: 0.34, metal: 0.02 },
  mramor:  { tex: 'mramorIn', rough: 0.10, metal: 0.03 },
  ocelIn:  { tex: 'frame', tint: [0.115, 0.115, 0.112], rough: 0.52, metal: 0.30 },
  kridlo:  { tex: 'frame', tint: [0.235, 0.238, 0.243], rough: 0.46, metal: 0.10 },
  linka:   { tex: null, tint: [0.812, 0.800, 0.766], rough: 0.44, metal: 0.03 },
  deska:   { tex: 'deskaIn', rough: 0.26, metal: 0.04 },
  chrom:   { tex: null, tint: [0.560, 0.568, 0.578], rough: 0.09, metal: 0.94 },
  nerez:   { tex: null, tint: [0.470, 0.474, 0.480], rough: 0.22, metal: 0.90 },
  porcelan:{ tex: null, tint: [0.880, 0.880, 0.870], rough: 0.10, metal: 0.02 },
  vanicka: { tex: null, tint: [0.660, 0.630, 0.580], rough: 0.30, metal: 0.02 },
  svitidlo:{ tex: null, tint: [0.930, 0.930, 0.912], rough: 0.52, metal: 0.00 },
  vypinac: { tex: null, tint: [0.870, 0.868, 0.850], rough: 0.40, metal: 0.02 },
  skloMat: { tex: null, tint: [0.62, 0.645, 0.655], rough: 0.42, metal: 0.00 }
};

var PAS_H = 0.090;
var SLOUP_W = 0.150;
var PRICKA_TL = 0.060;
var DVERE_IN_W = 0.800, DVERE_IN_H = 2.050;

var IN = {
  xL: -3.088, xP: 3.088,
  zZ: -2.650, zF: 2.655,
  zZs: -2.895, zFs: 2.894,
  xSm0: -1.095, xSm1: 1.095,
  xKoupA: 0.710, xKoupB: 0.771,
  xLozA: -0.721, xLozB: -0.771,
  zKoupF: -0.573,
  zLozP0: 0.529, zLozP1: 0.579,
  d3: [-0.652, 0.087],
  d2z: [-0.420, 0.380],
  d2f: [0.653, 1.413],
  linkaA: { x0: 1.372, x1: 3.039, z0: -2.650, z1: -2.050 },
  linkaB: { x0: 0.771, x1: 1.372, z0: -2.650, z1: -1.450 },
  drez: { x0: 0.889, x1: 1.291, z0: -1.967, z1: -1.527 }
};

var W_OPEN = 6.276, W_FOLD = 2.250, D = 5.85, H = 2.337, LIFT = 0.070;
var STRANA = (W_OPEN - W_FOLD) / 2;
var PANEL = 1.15;                 
var PODHLED_DLAZ = 0.66;          
var RAM_S = 0.062;                
var SOKL = 0.150, PREKLAD = 0.242;  
var OKNO_W = 1.120, OKNO_H = 1.100, OKNO_PARAPET = 0.80;
var OKNO_MALE_W = 0.700, OKNO_MALE_H = 0.400, OKNO_MALE_PARAPET = 1.55;
var DVERE_W = 1.500, DVERE_H = 2.190;
var OKNO_OD_ROHU = 1.43;
var PRESAH = 0.26;                
var FASADA_Z = 0.022;
var PODLAHA_Y = LIFT + SOKL + 0.001;
var STROP_Y = LIFT + H - 0.010;             

function v3(x, y, z) { return [x, y, z]; }
function odecti(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function krat(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function delka(a) { return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); }
function jednotka(a) { var l = delka(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

function pohled(oko, cil, up) {
  var z = jednotka(odecti(oko, cil));
  var x = jednotka(krat(up, z));
  var y = krat(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0,
    -(x[0] * oko[0] + x[1] * oko[1] + x[2] * oko[2]),
    -(y[0] * oko[0] + y[1] * oko[1] + y[2] * oko[2]),
    -(z[0] * oko[0] + z[1] * oko[1] + z[2] * oko[2]), 1];
}
function perspektiva(fov, aspekt, blizko, daleko) {
  var f = 1 / Math.tan(fov / 2), nf = 1 / (blizko - daleko);
  return [f / aspekt, 0, 0, 0, 0, f, 0, 0, 0, 0, (daleko + blizko) * nf, -1, 0, 0, 2 * daleko * blizko * nf, 0];
}
function orto(l, r, b, t, n, f) {
  return [2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, -2 / (f - n), 0,
    -(r + l) / (r - l), -(t + b) / (t - b), -(f + n) / (f - n), 1];
}
function nasob(a, b) {
  var o = new Array(16);
  for (var i = 0; i < 4; i++) {
    for (var j = 0; j < 4; j++) {
      o[i * 4 + j] = a[j] * b[i * 4] + a[4 + j] * b[i * 4 + 1] + a[8 + j] * b[i * 4 + 2] + a[12 + j] * b[i * 4 + 3];
    }
  }
  return o;
}

var VS = [
  '#version 300 es',
  'in vec3 aPos; in vec3 aNor; in vec3 aTan; in vec2 aUv; in float aAo;',
  'uniform mat4 uVP, uSvVP;',
  'out vec3 vPos; out vec3 vNor; out vec3 vTan; out vec2 vUv; out float vAo; out vec4 vSv;',
  'void main(){',
  '  vPos = aPos; vNor = aNor; vTan = aTan; vUv = aUv; vAo = aAo;',
  '  vSv = uSvVP * vec4(aPos + aNor * 0.022, 1.0);',
  '  gl_Position = uVP * vec4(aPos,1.0);',
  '}'
].join('\n');

var FS = [
  '#version 300 es',
  'precision highp float; precision highp sampler2DShadow;',
  'in vec3 vPos; in vec3 vNor; in vec3 vTan; in vec2 vUv; in float vAo; in vec4 vSv;',
  'out vec4 barva;',
  'uniform sampler2D uAlb, uNor;',
  'uniform sampler2DShadow uStin;',
  'uniform float uMaTex, uMaNor, uRough, uMetal, uSklo, uTeren, uNorSila;',
  'uniform vec3 uTint, uSlunce, uSlSvit, uZenit, uObzor, uZeme, uOko, uDumStred;',
  'uniform vec2 uDumPul;',
  'uniform float uStinTexel, uExpo;',

  'vec3 obloha(vec3 d){',
  '  float t = clamp(d.y, -1.0, 1.0);',
  '  vec3 c = t > 0.0 ? mix(uObzor, uZenit, pow(t, 0.62)) : mix(uObzor, uZeme, pow(-t, 0.45));',
  '  c += uSlSvit * pow(max(dot(d, uSlunce), 0.0), 400.0) * 2.2;',
  '  return c;',
  '}',
  'vec3 oblohaOdraz(vec3 d){',
  '  vec3 c = obloha(d);',
  '  float pas = exp(-pow((d.y - 0.035) / 0.105, 2.0));',
  '  c = mix(c, uZeme * vec3(0.40, 0.46, 0.36), pas * 0.72);',
  '  return c;',
  '}',

  'float stinovost(vec3 N){',
  '  vec3 p = vSv.xyz / vSv.w;',
  '  if(p.z > 1.0) return 1.0;',
  '  p = p * 0.5 + 0.5;',
  '  if(p.x < 0.0 || p.x > 1.0 || p.y < 0.0 || p.y > 1.0) return 1.0;',
  '  float sklon = 1.0 - abs(dot(N, uSlunce));',
  '  float bias = 0.0009 + 0.0026 * sklon;',
  '  float s = 0.0;',
  '  for(int y=-2;y<=2;y++){ for(int x=-2;x<=2;x++){',
  '    s += texture(uStin, vec3(p.xy + vec2(float(x),float(y))*uStinTexel*1.45, p.z - bias));',
  '  }}',
  '  return s / 25.0;',
  '}',

  'vec3 fresnelR(vec3 F0, float c, float r){',
  '  return F0 + (max(vec3(1.0-r), F0) - F0) * pow(1.0 - c, 5.0);',
  '}',

  'void main(){',
  '  vec3 alb = uTint;',
  '  if(uMaTex > 0.5) alb *= texture(uAlb, vUv).rgb;',
  '  alb = pow(alb, vec3(2.2));',

  '  vec3 N = normalize(vNor);',
  '  if(uMaNor > 0.5){',
  '    vec3 T = normalize(vTan - N * dot(N, vTan));',
  '    vec3 B = cross(N, T);',
  '    vec3 m = texture(uNor, vUv).rgb * 2.0 - 1.0;',
  '    m.xy *= uNorSila;',
  '    N = normalize(T * m.x + B * m.y + N * m.z);',
  '  }',

  '  vec3 V = normalize(uOko - vPos);',
  '  if(dot(N, V) < 0.0 && uSklo < 0.5 && uTeren < 0.5) N = -N;',
  '  vec3 L = uSlunce;',
  '  vec3 Rv = reflect(-V, N);',
  '  float NdV = max(dot(N, V), 1e-4);',
  '  float NdL = max(dot(N, L), 0.0);',
  '  float st = stinovost(N);',
  '  float ao = vAo;',

  '  if(uSklo > 0.5){',
  '    vec3 odraz = oblohaOdraz(Rv);',
  '    if(Rv.y < 0.0){',
  '      float k = clamp(-Rv.y * 2.6, 0.0, 1.0);',
  '      odraz = mix(odraz, uZeme * 0.9, k * 0.85);',
  '    }',
  '    float F = 0.050 + 0.950 * pow(1.0 - NdV, 3.8);',
  '    vec3 vnitrek = vec3(0.012, 0.016, 0.020) + vec3(0.010,0.012,0.014) * (1.0 - clamp(vUv.y,0.0,1.0));',
  '    odraz *= 0.46;',
  '    vec3 c = mix(vnitrek, odraz, clamp(F * 1.45 + 0.26, 0.0, 1.0));',
  '    vec3 h = normalize(L + V);',
  '    float sp = pow(max(dot(N, h), 0.0), 2200.0) * st;',
  '    c += uSlSvit * sp * 2.4;',
  '    c *= uExpo;',
  '    c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);',
  '    barva = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0);',
  '    return;',
  '  }',

  '  float r = clamp(uRough, 0.045, 1.0);',
  '  float a = r * r;',
  '  vec3 F0 = mix(vec3(0.04), alb, uMetal);',
  '  vec3 difBarva = alb * (1.0 - uMetal);',

  '  vec3 h = normalize(L + V);',
  '  float NdH = max(dot(N, h), 0.0), VdH = max(dot(V, h), 0.0);',
  '  float d = NdH * NdH * (a * a - 1.0) + 1.0;',
  '  float Dg = (a * a) / max(3.14159 * d * d, 1e-6);',
  '  float k = (r + 1.0) * (r + 1.0) / 8.0;',
  '  float Gv = (NdV / (NdV * (1.0 - k) + k)) * (NdL / (NdL * (1.0 - k) + k));',
  '  vec3 F = F0 + (1.0 - F0) * pow(1.0 - VdH, 5.0);',
  '  vec3 spec = Dg * Gv * F / max(4.0 * NdV * NdL, 1e-4);',
  '  vec3 kd = (1.0 - F) * (1.0 - uMetal);',
  '  vec3 primo = (kd * difBarva / 3.14159 + spec) * uSlSvit * NdL * st;',

  '  vec3 oblohaN = obloha(N);',
  '  vec3 spodek = uZeme * 0.85;',
  '  float t = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);',
  '  vec3 ambDif = mix(spodek, oblohaN, t) * 0.85;',
  '  vec3 ambDifC = difBarva * ambDif * ao;',

  '  vec3 Rr = normalize(mix(Rv, N, r * r * 0.85));',
  '  vec3 ambSpec = oblohaOdraz(Rr);',
  '  if(Rr.y < 0.0) ambSpec = mix(ambSpec, uZeme * 0.85, clamp(-Rr.y*2.0,0.0,1.0)*0.8);',
  '  vec3 Fr = fresnelR(F0, NdV, r);',
  '  vec3 ambSpecC = ambSpec * Fr * (1.0 - r * 0.72) * mix(ao, 1.0, 0.35);',

  '  vec3 c = primo + ambDifC + ambSpecC;',

  '  if(uTeren > 0.5){',
  '    float dist = length(vPos.xz - uDumStred.xz);',
  '    float mlha = clamp((dist - 11.0) / 42.0, 0.0, 1.0);',
  '    vec2 q = abs(vPos.xz - uDumStred.xz) - uDumPul;',
  '    float dv = length(max(q, vec2(0.0))) + min(max(q.x, q.y), 0.0);',
  '    float kontakt = 1.0 - 0.46 * exp(-max(dv, 0.0) * 1.55);',
  '    c *= kontakt;',
  '    c = mix(c, obloha(vec3(0.0, 0.045, 1.0)) * 0.99, smoothstep(0.0, 1.0, mlha));',
  '  }',

  '  c *= uExpo;',
  '  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);',
  '  barva = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0);',
  '}'
].join('\n');

var VS_STIN = [
  '#version 300 es',
  'in vec3 aPos; uniform mat4 uSvVP;',
  'void main(){ gl_Position = uSvVP * vec4(aPos,1.0); }'
].join('\n');
var FS_STIN = ['#version 300 es', 'precision highp float;', 'void main(){}'].join('\n');

var VS_NEBE = [
  '#version 300 es',
  'in vec2 aPos; uniform mat4 uInv; uniform vec3 uOko;',
  'out vec3 vDir;',
  'void main(){',
  '  vec4 d = uInv * vec4(aPos, 1.0, 1.0); vDir = d.xyz / d.w - uOko;',
  '  gl_Position = vec4(aPos, 1.0, 1.0);',
  '}'
].join('\n');
var FS_NEBE = [
  '#version 300 es',
  'precision highp float;',
  'in vec3 vDir; out vec4 barva;',
  'uniform vec3 uZenit, uObzor, uZeme, uSlunce, uSlSvit; uniform float uExpo;',
  'void main(){',
  '  vec3 d = normalize(vDir);',
  '  float t = clamp(d.y, -1.0, 1.0);',
  '  vec3 c = t > 0.0 ? mix(uObzor, uZenit, pow(t, 0.62)) : mix(uObzor, uZeme, pow(-t, 0.45));',
  '  c += uSlSvit * pow(max(dot(d, uSlunce), 0.0), 400.0) * 1.4;',
  '  c *= uExpo;',
  '  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);',
  '  barva = vec4(pow(clamp(c, 0.0, 1.0), vec3(1.0/2.2)), 1.0);',
  '}'
].join('\n');

function Sit() {
  var davky = {};
  function davka(m) {
    if (!davky[m]) davky[m] = { pos: [], nor: [], tan: [], uv: [], ao: [], idx: [], n: 0 };
    return davky[m];
  }
  function quad(mat, a, b, c, d, o) {
    o = o || {};
    var db = davka(mat);
    var eU = odecti(b, a), eV = odecti(d, a);
    var n = jednotka(krat(eU, eV));
    if (o.obratit) n = [-n[0], -n[1], -n[2]];
    var t = jednotka(eU);
    var lu = delka(eU) / (o.tileU || 1), lv = delka(eV) / (o.tileV || 1);
    var ou = o.offU || 0, ov = o.offV || 0;
    var ao = o.ao || [1, 1, 1, 1];
    var uv = o.uv || [[ou, ov], [ou + lu, ov], [ou + lu, ov + lv], [ou, ov + lv]];
    var b0 = db.n;
    [a, b, c, d].forEach(function (p, i) {
      db.pos.push(p[0], p[1], p[2]);
      db.nor.push(n[0], n[1], n[2]);
      db.tan.push(t[0], t[1], t[2]);
      db.uv.push(uv[i][0], uv[i][1]);
      db.ao.push(ao[i]);
    });
    db.idx.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3);
    db.n += 4;
  }
  function kvadr(mat, x0, x1, y0, y1, z0, z1, o) {
    o = o || {};
    var t = { tileU: o.tileU || 0.6, tileV: o.tileV || 0.6, ao: o.ao };
    var bez = o.bez || '';
    if (bez.indexOf('z+') < 0) quad(mat, v3(x0, y0, z1), v3(x1, y0, z1), v3(x1, y1, z1), v3(x0, y1, z1), t);
    if (bez.indexOf('z-') < 0) quad(mat, v3(x1, y0, z0), v3(x0, y0, z0), v3(x0, y1, z0), v3(x1, y1, z0), t);
    if (bez.indexOf('x+') < 0) quad(mat, v3(x1, y0, z1), v3(x1, y0, z0), v3(x1, y1, z0), v3(x1, y1, z1), t);
    if (bez.indexOf('x-') < 0) quad(mat, v3(x0, y0, z0), v3(x0, y0, z1), v3(x0, y1, z1), v3(x0, y1, z0), t);
    if (bez.indexOf('y+') < 0) quad(mat, v3(x0, y1, z1), v3(x1, y1, z1), v3(x1, y1, z0), v3(x0, y1, z0), t);
    if (bez.indexOf('y-') < 0) quad(mat, v3(x0, y0, z0), v3(x1, y0, z0), v3(x1, y0, z1), v3(x0, y0, z1), t);
  }
  function kotouc(mat, stred, dirU, dirV, r, o) {
    o = o || {};
    var N = 16;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2;
      function bod(a) {
        return [stred[0] + (dirU[0] * Math.cos(a) + dirV[0] * Math.sin(a)) * r,
          stred[1] + (dirU[1] * Math.cos(a) + dirV[1] * Math.sin(a)) * r,
          stred[2] + (dirU[2] * Math.cos(a) + dirV[2] * Math.sin(a)) * r];
      }
      quad(mat, stred, bod(a0), bod(a1), bod(a1), { tileU: 0.3, tileV: 0.3, ao: o.ao });
    }
  }
  return { quad: quad, kvadr: kvadr, kotouc: kotouc, davky: davky };
}

function program(gl, vs, fs) {
  function sh(t, z) {
    var s = gl.createShader(t);
    gl.shaderSource(s, z); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  var p = gl.createProgram();
  gl.attachShader(p, sh(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  var u = {};
  var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i < n; i++) {
    var jm = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');
    u[jm] = gl.getUniformLocation(p, jm);
  }
  return { p: p, u: u };
}

function Scena(canvas, opt) {
  opt = opt || {};
  var cv = canvas;
  var zaklad = opt.zaklad || '';
  var pomer = opt.pomer || 0.62;
  var gl = cv.getContext('webgl2', {
    antialias: true, alpha: false, depth: true,
    powerPreference: 'high-performance', preserveDrawingBuffer: false
  });
  if (!gl) return null;

  var S = { roof: 'flat', facade: 'wood', terrace: false, heat: 'none', fold: 1,
    pohled: 'ven', misto: 0, kuchyn: true, koupelna: true };
  var cam = { yaw: 0.66, pitch: 0.245, dist: 15, cil: [0, 1.25, 0] };
  var rucniZoom = false, drag = null, pickInv = null, chuze = null;
  var potrebaSit = true, potrebaStin = true, snimekCeka = false;

  var prog = program(gl, VS, FS);
  var progStin = program(gl, VS_STIN, FS_STIN);
  var progNebe = program(gl, VS_NEBE, FS_NEBE);

  var bilyPixel = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, bilyPixel);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
  var plochaNormala = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, plochaNormala);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([128, 128, 255, 255]));

  var aniso = gl.getExtension('EXT_texture_filter_anisotropic');
  var maxAniso = aniso ? Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)) : 1;
  var OBR = {}, ceka = 0;

  function nactiTexturu(klic, soubor) {
    ceka++;
    var t = gl.createTexture();
    OBR[klic] = t;
    var im = new Image();
    im.onload = function () {
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
      ceka--; naplanuj();
    };
    im.onerror = function () { OBR[klic] = null; ceka--; naplanuj(); };
    im.src = zaklad + 'assets/tex/' + soubor + '?v=' + TEX_VERZE;
  }
  var ODLOZIT = { grey: 1, black: 1, podlahaIn: 1, stenaIn: 1, lamelyIn: 1, mramorIn: 1, deskaIn: 1 };
  function zajisti(k) {
    if (!TEX[k] || (k in OBR)) return;
    nactiTexturu(k, TEX[k].soubor);
    if (TEX[k].normala && !(k + '_n' in OBR)) nactiTexturu(k + '_n', TEX[k].normala);
  }
  Object.keys(TEX).forEach(function (k) {
    if (ODLOZIT[k]) return;
    nactiTexturu(k, TEX[k].soubor);
    if (TEX[k].normala && !(k + '_n' in OBR)) nactiTexturu(k + '_n', TEX[k].normala);
  });

  var STIN_R = 2048;
  var stinTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, stinTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, STIN_R, STIN_R, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.LEQUAL);
  var stinFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, stinFbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, stinTex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  var nebeVao = gl.createVertexArray();
  gl.bindVertexArray(nebeVao);
  var nebeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nebeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var locNebe = gl.getAttribLocation(progNebe.p, 'aPos');
  gl.enableVertexAttribArray(locNebe);
  gl.vertexAttribPointer(locNebe, 2, gl.FLOAT, false, 0, 0);
  gl.bindVertexArray(null);

  var davky = [];
  var zasoba = {};
  function nahrajSit(sit) {
    davky = [];
    Object.keys(sit.davky).forEach(function (m) {
      var d = sit.davky[m];
      if (!d.idx.length) return;
      var z = zasoba[m];
      if (!z) {
        z = zasoba[m] = { vao: gl.createVertexArray(), atr: {}, ib: gl.createBuffer() };
        gl.bindVertexArray(z.vao);
        ['aPos', 'aNor', 'aTan', 'aUv', 'aAo'].forEach(function (jm) {
          var slozek = jm === 'aUv' ? 2 : (jm === 'aAo' ? 1 : 3);
          var b = gl.createBuffer();
          z.atr[jm] = b;
          gl.bindBuffer(gl.ARRAY_BUFFER, b);
          [prog, progStin].forEach(function (pr) {
            var l = gl.getAttribLocation(pr.p, jm);
            if (l >= 0) { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, slozek, gl.FLOAT, false, 0, 0); }
          });
        });
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, z.ib);
        gl.bindVertexArray(null);
      }
      function nahraj(jm, pole) {
        gl.bindBuffer(gl.ARRAY_BUFFER, z.atr[jm]);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pole), gl.DYNAMIC_DRAW);
      }
      nahraj('aPos', d.pos); nahraj('aNor', d.nor); nahraj('aTan', d.tan);
      nahraj('aUv', d.uv); nahraj('aAo', d.ao);
      gl.bindVertexArray(z.vao);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, z.ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(d.idx), gl.DYNAMIC_DRAW);
      gl.bindVertexArray(null);
      davky.push({ mat: m, vao: z.vao, pocet: d.idx.length });
    });
  }

  function stenaSOtvory(sit, mat, rohBL, dirU, dirV, sirka, vyska, otvory, o) {
    o = o || {};
    var cu = [0, sirka], cvv = [0, vyska];
    otvory.forEach(function (t) { cu.push(t.u, t.u + t.w); cvv.push(t.v, t.v + t.h); });
    function uklid(a, max) {
      a = a.filter(function (x) { return x > -1e-6 && x < max + 1e-6; })
        .map(function (x) { return Math.min(max, Math.max(0, x)); })
        .sort(function (p, q) { return p - q; });
      var out = [];
      a.forEach(function (x) { if (!out.length || x - out[out.length - 1] > 1e-4) out.push(x); });
      return out;
    }
    cu = uklid(cu, sirka); cvv = uklid(cvv, vyska);
    if (o.deleni) {
      function zhusti(a, krok) {
        var out = [];
        for (var i = 0; i < a.length - 1; i++) {
          out.push(a[i]);
          var d = a[i + 1] - a[i], n = Math.ceil(d / krok);
          for (var j = 1; j < n; j++) out.push(a[i] + d * j / n);
        }
        out.push(a[a.length - 1]);
        return out;
      }
      cu = zhusti(cu, o.deleni); cvv = zhusti(cvv, o.deleni);
    }
    function bod(u, v) {
      return [rohBL[0] + dirU[0] * u + dirV[0] * v,
        rohBL[1] + dirU[1] * u + dirV[1] * v,
        rohBL[2] + dirU[2] * u + dirV[2] * v];
    }
    for (var i = 0; i < cu.length - 1; i++) {
      for (var j = 0; j < cvv.length - 1; j++) {
        var u0 = cu[i], u1 = cu[i + 1], v0 = cvv[j], v1 = cvv[j + 1];
        var su = (u0 + u1) / 2, sv = (v0 + v1) / 2;
        var uvnitr = otvory.some(function (t) {
          return su > t.u && su < t.u + t.w && sv > t.v && sv < t.v + t.h;
        });
        if (uvnitr) continue;
        sit.quad(mat, bod(u0, v0), bod(u1, v0), bod(u1, v1), bod(u0, v1), {
          tileU: o.tileU || 1, tileV: o.tileV || 1,
          offU: (o.offU || 0) + u0 / (o.tileU || 1), offV: (o.offV || 0) + v0 / (o.tileV || 1),
          ao: o.aoFn ? [o.aoFn(u0, v0), o.aoFn(u1, v0), o.aoFn(u1, v1), o.aoFn(u0, v1)] : null
        });
      }
    }
  }

  function okno(sit, rohBL, dirU, dirV, dirN, u, v, w, h, o) {
    o = o || {};
    var hl = o.hloubka === undefined ? 0.058 : o.hloubka;
    var ramS = o.ram === undefined ? 0.072 : o.ram;
    function bod(uu, vv, dd) {
      return [rohBL[0] + dirU[0] * uu + dirV[0] * vv + dirN[0] * dd,
        rohBL[1] + dirU[1] * uu + dirV[1] * vv + dirN[1] * dd,
        rohBL[2] + dirU[2] * uu + dirV[2] * vv + dirN[2] * dd];
    }
    var A = 0.52;
    sit.quad('ocel', bod(u, v, 0), bod(u + w, v, 0), bod(u + w, v, -hl), bod(u, v, -hl),
      { tileU: 0.5, tileV: 0.5, ao: [A + 0.3, A + 0.3, A, A] });
    sit.quad('ocel', bod(u, v + h, -hl), bod(u + w, v + h, -hl), bod(u + w, v + h, 0), bod(u, v + h, 0),
      { tileU: 0.5, tileV: 0.5, ao: [A - 0.12, A - 0.12, A + 0.2, A + 0.2] });
    sit.quad('ocel', bod(u, v, -hl), bod(u, v, 0), bod(u, v + h, 0), bod(u, v + h, -hl),
      { tileU: 0.5, tileV: 0.5, ao: [A, A + 0.3, A + 0.3, A] });
    sit.quad('ocel', bod(u + w, v, 0), bod(u + w, v, -hl), bod(u + w, v + h, -hl), bod(u + w, v + h, 0),
      { tileU: 0.5, tileV: 0.5, ao: [A + 0.3, A, A, A + 0.3] });
    if (S.pohled !== 'dovnitr') {
      sit.quad('ramecek', bod(u, v, -hl), bod(u + w, v, -hl), bod(u + w, v + h, -hl), bod(u, v + h, -hl),
        { tileU: 0.45, tileV: 0.45, ao: [A + 0.1, A + 0.1, A + 0.1, A + 0.1] });
    }
    var podil = o.podil || null;
    if (!podil) {
      podil = [];
      for (var t0 = 0; t0 < (o.tabuli || 2); t0++) podil.push(1);
    }
    var soucet = podil.reduce(function (a2, b2) { return a2 + b2; }, 0);
    var vnitrW = w - 2 * ramS, vnitrH = h - 2 * ramS;
    var mezera = o.dvere ? 0.05 : 0.042;
    var volne = vnitrW - mezera * (podil.length - 1);
    var poz = u + ramS;
    for (var i = 0; i < podil.length; i++) {
      var tw = volne * podil[i] / soucet;
      if (S.pohled !== 'dovnitr') {
        sit.quad('sklo', bod(poz, v + ramS, -hl + 0.014), bod(poz + tw, v + ramS, -hl + 0.014),
          bod(poz + tw, v + ramS + vnitrH, -hl + 0.014), bod(poz, v + ramS + vnitrH, -hl + 0.014),
          { tileU: 1, tileV: 1, ao: [0.7, 0.7, 0.85, 0.85] });
      }
      poz += tw + mezera;
    }
    if (o.dvere) {
      var stredD = u + w / 2;
      sit.quad('klika', bod(stredD - 0.10, v + 1.02, -hl + 0.032), bod(stredD - 0.055, v + 1.02, -hl + 0.032),
        bod(stredD - 0.055, v + 1.20, -hl + 0.032), bod(stredD - 0.10, v + 1.20, -hl + 0.032),
        { tileU: 0.2, tileV: 0.2, ao: [0.9, 0.9, 0.9, 0.9] });
    }
    var lem = 0.028;
    [[u - lem, v - lem, w + 2 * lem, lem], [u - lem, v + h, w + 2 * lem, lem],
      [u - lem, v, lem, h], [u + w, v, lem, h]].forEach(function (r) {
      sit.quad('ocel', bod(r[0], r[1], 0.004), bod(r[0] + r[2], r[1], 0.004),
        bod(r[0] + r[2], r[1] + r[3], 0.004), bod(r[0], r[1] + r[3], 0.004),
        { tileU: 0.4, tileV: 0.4, ao: [0.85, 0.85, 0.85, 0.85] });
    });
  }

  function zrcadli(sit) {
    function m(p) { return [-p[0], p[1], p[2]]; }
    return {
      quad: function (mat, a, b, c, d, o) {
        if (o && o.uv) {
          var o2 = {}, k;
          for (k in o) if (Object.prototype.hasOwnProperty.call(o, k)) o2[k] = o[k];
          o2.uv = [o.uv[3], o.uv[2], o.uv[1], o.uv[0]];
          if (o.ao) o2.ao = [o.ao[3], o.ao[2], o.ao[1], o.ao[0]];
          sit.quad(mat, m(d), m(c), m(b), m(a), o2);
          return;
        }
        var o3 = null;
        if (o) {
          o3 = {};
          for (var j in o) if (Object.prototype.hasOwnProperty.call(o, j)) o3[j] = o[j];
          if (o.ao) o3.ao = [o.ao[3], o.ao[2], o.ao[1], o.ao[0]];
        }
        sit.quad(mat, m(d), m(c), m(b), m(a), o3);
      },
      kvadr: function (mat, x0, x1, y0, y1, z0, z1, o) {
        var o2 = o;
        if (o && o.bez) {
          o2 = {};
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) o2[k] = o[k];
          o2.bez = o.bez.replace(/x\+/g, 'X-').replace(/x-/g, 'x+').replace(/X-/g, 'x-');
        }
        sit.kvadr(mat, -x1, -x0, y0, y1, z0, z1, o2);
      },
      kotouc: function (mat, stred, dirU, dirV, r, o) {
        sit.kotouc(mat, m(stred), [-dirU[0], dirU[1], dirU[2]], m(dirV), r, o);
      }
    };
  }

  function stenaVnitrni(sit, mat, rovina, hodnota, a, b, otvory, o) {
    o = o || {};
    var yP = PODLAHA_Y, vys = STROP_Y - PODLAHA_Y;
    var rohBL, dirU;
    if (rovina === 'z+') { rohBL = v3(a, yP, hodnota); dirU = v3(1, 0, 0); }
    else if (rovina === 'z-') { rohBL = v3(b, yP, hodnota); dirU = v3(-1, 0, 0); }
    else if (rovina === 'x+') { rohBL = v3(hodnota, yP, b); dirU = v3(0, 0, -1); }
    else { rohBL = v3(hodnota, yP, a); dirU = v3(0, 0, 1); }
    var w = Math.abs(b - a);
    var ao = function (u, vv) {
      var kraj = Math.min(u, w - u);
      var a = Math.min(1, 0.40 + Math.min(kraj, 0.55) / 0.55 * 0.60);
      a *= Math.min(1, 0.46 + Math.min(vv, 0.32) / 0.32 * 0.54);
      a *= Math.min(1, 0.52 + Math.min(vys - vv, 0.40) / 0.40 * 0.48);
      (otvory || []).forEach(function (t) {
        var du = Math.max(t.u - u, u - (t.u + t.w), 0);
        var dv = Math.max(t.v - vv, vv - (t.v + t.h), 0);
        var d = Math.sqrt(du * du + dv * dv);
        if (d < 0.26) a *= 0.70 + 0.30 * (d / 0.26);
      });
      return a;
    };
    stenaSOtvory(sit, mat, rohBL, dirU, v3(0, 1, 0), w, vys, otvory || [],
      { tileU: o.tileU || 1.00, tileV: o.tileV || 1.00, aoFn: ao, deleni: 0.30 });
    return { rohBL: rohBL, dirU: dirU, w: w, vys: vys };
  }

  function ostentiIn(sit, mat, st, t, hloubka) {
    var bod = function (u, vv, dd) {
      var n = krat(st.dirU, v3(0, 1, 0));
      return v3(st.rohBL[0] + st.dirU[0] * u + n[0] * dd,
        st.rohBL[1] + vv, st.rohBL[2] + st.dirU[2] * u + n[2] * dd);
    };
    var A = 0.62;
    sit.quad(mat, bod(t.u, t.v, 0), bod(t.u + t.w, t.v, 0), bod(t.u + t.w, t.v, -hloubka), bod(t.u, t.v, -hloubka),
      { tileU: 0.4, tileV: 0.4, ao: [A + 0.28, A + 0.28, A, A] });
    sit.quad(mat, bod(t.u, t.v + t.h, -hloubka), bod(t.u + t.w, t.v + t.h, -hloubka),
      bod(t.u + t.w, t.v + t.h, 0), bod(t.u, t.v + t.h, 0),
      { tileU: 0.4, tileV: 0.4, ao: [A - 0.10, A - 0.10, A + 0.2, A + 0.2] });
    sit.quad(mat, bod(t.u, t.v, -hloubka), bod(t.u, t.v, 0), bod(t.u, t.v + t.h, 0), bod(t.u, t.v + t.h, -hloubka),
      { tileU: 0.4, tileV: 0.4, ao: [A, A + 0.28, A + 0.28, A] });
    sit.quad(mat, bod(t.u + t.w, t.v, 0), bod(t.u + t.w, t.v, -hloubka), bod(t.u + t.w, t.v + t.h, -hloubka),
      bod(t.u + t.w, t.v + t.h, 0), { tileU: 0.4, tileV: 0.4, ao: [A + 0.28, A, A, A + 0.28] });
  }

  function ramOknaIn(sit, st, t, prickaKs) {
    var n = krat(st.dirU, v3(0, 1, 0));
    function bod(u, vv, dd) {
      return v3(st.rohBL[0] + st.dirU[0] * u + n[0] * dd,
        st.rohBL[1] + vv, st.rohBL[2] + st.dirU[2] * u + n[2] * dd);
    }
    var w = 0.042, d0 = -0.010, d1 = -0.052;
    function pas(u0, u1, v0, v1) {
      sit.quad('ocelIn', bod(u0, v0, d0), bod(u1, v0, d0), bod(u1, v1, d0), bod(u0, v1, d0),
        { tileU: 0.4, tileV: 0.4, ao: [0.86, 0.86, 0.92, 0.92] });
      sit.quad('ocelIn', bod(u0, v0, d1), bod(u1, v0, d1), bod(u1, v0, d0), bod(u0, v0, d0),
        { tileU: 0.3, tileV: 0.3, ao: [0.7, 0.7, 0.85, 0.85] });
      sit.quad('ocelIn', bod(u0, v1, d0), bod(u1, v1, d0), bod(u1, v1, d1), bod(u0, v1, d1),
        { tileU: 0.3, tileV: 0.3, ao: [0.85, 0.85, 0.7, 0.7] });
    }
    pas(t.u, t.u + t.w, t.v, t.v + w);
    pas(t.u, t.u + t.w, t.v + t.h - w, t.v + t.h);
    pas(t.u, t.u + w, t.v + w, t.v + t.h - w);
    pas(t.u + t.w - w, t.u + t.w, t.v + w, t.v + t.h - w);
    var ks = prickaKs === undefined ? 1 : prickaKs;
    for (var i = 1; i <= ks; i++) {
      var uc = t.u + t.w * i / (ks + 1);
      pas(uc - 0.016, uc + 0.016, t.v + w, t.v + t.h - w);
    }
  }

  function plocha(sit, mat, x0, x1, z0, z1, y, dolu, tileU, tileV, aoFn, krok) {
    krok = krok || 0.34;
    var nx = Math.max(1, Math.round((x1 - x0) / krok));
    var nz = Math.max(1, Math.round((z1 - z0) / krok));
    var f = aoFn || function () { return 1; };
    for (var i = 0; i < nx; i++) {
      var a0 = x0 + (x1 - x0) * i / nx, a1 = x0 + (x1 - x0) * (i + 1) / nx;
      for (var j = 0; j < nz; j++) {
        var b0 = z0 + (z1 - z0) * j / nz, b1 = z0 + (z1 - z0) * (j + 1) / nz;
        var ou = (a0 - x0) / tileU;
        if (dolu) {
          sit.quad(mat, v3(a0, y, b1), v3(a1, y, b1), v3(a1, y, b0), v3(a0, y, b0),
            { tileU: tileU, tileV: tileV, offU: ou, offV: (z1 - b1) / tileV,
              ao: [f(a0, b1), f(a1, b1), f(a1, b0), f(a0, b0)] });
        } else {
          sit.quad(mat, v3(a0, y, b0), v3(a1, y, b0), v3(a1, y, b1), v3(a0, y, b1),
            { tileU: tileU, tileV: tileV, offU: ou, offV: (b0 - z0) / tileV,
              ao: [f(a0, b0), f(a1, b0), f(a1, b1), f(a0, b1)] });
        }
      }
    }
  }

  function aoRoviny(rect, prekazky, kraj, silaKraje, dosah, silaPrekazky) {
    return function (x, z) {
      var d = Math.min(x - rect[0], rect[1] - x, z - rect[2], rect[3] - z);
      var a = Math.min(1, silaKraje + Math.min(Math.max(d, 0), kraj) / kraj * (1 - silaKraje));
      if (prekazky) {
        for (var i = 0; i < prekazky.length; i++) {
          var p = prekazky[i];
          var dx = Math.max(p[0] - x, x - p[1], 0), dz = Math.max(p[2] - z, z - p[3], 0);
          var dd = Math.sqrt(dx * dx + dz * dz);
          if (dd < dosah) a *= silaPrekazky + (1 - silaPrekazky) * (dd / dosah);
        }
      }
      return a;
    };
  }

  function podlahaIn(sit, x0, x1, z0, z1, napric, aoFn) {
    plocha(sit, 'podlaha', x0, x1, z0, z1, PODLAHA_Y, true,
      napric ? 2.570 : 1.140, napric ? 1.140 : 2.570, aoFn);
  }

  function sparaUPodlahy(sit, x0, x1, z0, z1) {
    var y0 = PODLAHA_Y, y1 = PODLAHA_Y + 0.015, t = 0.010;
    sit.kvadr('ocelIn', x0, x1, y0, y1, z0, z0 + t, { tileU: 1.0, tileV: 0.1 });
    sit.kvadr('ocelIn', x0, x1, y0, y1, z1 - t, z1, { tileU: 1.0, tileV: 0.1 });
    sit.kvadr('ocelIn', x0, x0 + t, y0, y1, z0, z1, { tileU: 1.0, tileV: 0.1 });
    sit.kvadr('ocelIn', x1 - t, x1, y0, y1, z0, z1, { tileU: 1.0, tileV: 0.1 });
  }

  function stropIn(sit, mat, x0, x1, z0, z1, tile) {
    var t = tile || 1.0;
    plocha(sit, mat, x0, x1, z0, z1, STROP_Y, false, t, t,
      aoRoviny([x0, x1, z0, z1], null, 0.60, 0.58), 0.40);
  }

  function pasStropni(sit, x0, x1, z0, z1) {
    var y1 = STROP_Y, y0 = STROP_Y - PAS_H;
    sit.kvadr('ocelIn', x0, x1, y0, y1, z0, z1, { tileU: 1.2, tileV: 0.3 });
  }

  function kridloOtevrene(sit, hodnota, uPant, sirka, sklo, smer) {
    var yP = PODLAHA_Y, h = DVERE_IN_H, t = 0.022, r = 0.055;
    function box(mat, x0, x1, y0, y1, z0, z1) {
      sit.kvadr(mat, x0, x1, y0, y1, z0, z1, { tileU: 0.5, tileV: 0.6 });
    }
    var xa = smer > 0 ? uPant : uPant - t, xb = smer > 0 ? uPant + t : uPant;
    var z1 = hodnota, z0 = hodnota - sirka;
    if (sklo) {
      box('ocelIn', xa, xb, yP, yP + h, z0, z0 + r);
      box('ocelIn', xa, xb, yP, yP + h, z1 - r, z1);
      box('ocelIn', xa, xb, yP, yP + 0.075, z0, z1);
      box('ocelIn', xa, xb, yP + h - r, yP + h, z0, z1);
      box('sklo', xa + 0.008, xb - 0.008, yP + 0.075, yP + h - r, z0 + r, z1 - r);
      box('ocelIn', xa + 0.005, xb - 0.005, yP + 0.075, yP + h - r, (z0 + z1) / 2 - 0.013, (z0 + z1) / 2 + 0.013);
      box('ocelIn', xa + 0.005, xb - 0.005, yP + 0.700, yP + 0.726, z0 + r, z1 - r);
    } else {
      box('kridlo', xa, xb, yP, yP + h, z0, z1);
    }
    var ky = yP + 0.985;
    var kz = z0 + 0.085;
    [[xa, -1], [xb, 1]].forEach(function (o) {
      var xf = o[0], sg = o[1];
      trubka(sit, 'ocelIn', v3(xf, ky, kz), v3(xf + sg * 0.013, ky, kz), 0.025, 12);
      trubka(sit, 'ocelIn', v3(xf + sg * 0.011, ky, kz), v3(xf + sg * 0.034, ky, kz), 0.010, 10);
      trubka(sit, 'ocelIn', v3(xf + sg * 0.032, ky, kz), v3(xf + sg * 0.032, ky - 0.008, kz + 0.100), 0.010, 10);
    });
  }

  // Zarubeň nesmí procházet skrz líce stěny. Když je kvádr rámu širší než
  // tloušťka stěny, obě plochy se v ostrém úhlu perou a na rámu jsou vidět
  // přerušované čáry. Ostění proto sedí MEZI líci a obložka je předsazená.
  function zarubenIn(sit, rovina, licA, licB, u0, u1) {
    var yP = PODLAHA_Y, h = DVERE_IN_H, zar = 0.030, e = 0.002, lip = 0.008;
    var da = Math.min(licA, licB) + e, db = Math.max(licA, licB) - e;
    function box(a0, a1, y0, y1, d0, d1) {
      if (rovina === 'x') sit.kvadr('kridlo', d0, d1, y0, y1, a0, a1, { tileU: 0.5, tileV: 0.6 });
      else sit.kvadr('kridlo', a0, a1, y0, y1, d0, d1, { tileU: 0.5, tileV: 0.6 });
    }
    box(u0 - zar, u0, yP, yP + h + zar, da, db);
    box(u1, u1 + zar, yP, yP + h + zar, da, db);
    box(u0 - zar, u1 + zar, yP + h, yP + h + zar, da, db);
    [[licA, licA < licB ? -1 : 1], [licB, licB < licA ? -1 : 1]].forEach(function (o) {
      var p0 = o[0], p1 = o[0] + o[1] * lip;
      var q0 = Math.min(p0, p1), q1 = Math.max(p0, p1);
      box(u0 - zar, u0, yP, yP + h + zar, q0, q1);
      box(u1, u1 + zar, yP, yP + h + zar, q0, q1);
      box(u0 - zar, u1 + zar, yP + h, yP + h + zar, q0, q1);
    });
  }

  function kridloOtevreneX(sit, hodnota, zPant, sirka, smerZ, smerX) {
    var yP = PODLAHA_Y, h = DVERE_IN_H, t = 0.021;
    var d = 0.004;
    var za = smerZ > 0 ? zPant + d : zPant - t - d;
    var zb = smerZ > 0 ? zPant + t + d : zPant - d;
    var xa = smerX > 0 ? hodnota + d : hodnota - sirka;
    var xb = smerX > 0 ? hodnota + sirka : hodnota - d;
    sit.kvadr('kridlo', xa, xb, yP, yP + h, za, zb, { tileU: 0.55, tileV: 0.75 });
    var kx = smerX > 0 ? xb - 0.062 : xa + 0.062;
    var ky = yP + 0.985;
    [[za, -1], [zb, 1]].forEach(function (o) {
      var zf = o[0], sg = o[1];
      trubka(sit, 'ocelIn', v3(kx, ky, zf), v3(kx, ky, zf + sg * 0.013), 0.025, 12);
      trubka(sit, 'ocelIn', v3(kx, ky, zf + sg * 0.011), v3(kx, ky, zf + sg * 0.034), 0.010, 10);
      trubka(sit, 'ocelIn', v3(kx, ky, zf + sg * 0.032), v3(kx + smerX * 0.100, ky - 0.008, zf + sg * 0.032), 0.010, 10);
    });
    var px = smerX > 0 ? xa : xb;
    [yP + 0.32, yP + 1.72].forEach(function (y0) {
      trubka(sit, 'ocelIn', v3(px, y0, za - 0.004), v3(px, y0, zb + 0.004), 0.013, 8);
    });
  }

  function svitidloIn(sit, x, z, r) {
    var y = STROP_Y - 0.044, N = 20;
    for (var i = 0; i < N; i++) {
      var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2;
      var p0 = v3(x + Math.cos(a0) * r, y, z + Math.sin(a0) * r);
      var p1 = v3(x + Math.cos(a1) * r, y, z + Math.sin(a1) * r);
      sit.quad('svitidlo', v3(p0[0], STROP_Y, p0[2]), v3(p1[0], STROP_Y, p1[2]), p1, p0,
        { tileU: 0.3, tileV: 0.3, ao: [0.95, 0.95, 1, 1] });
    }
    sit.kotouc('svitidlo', v3(x, y, z), v3(1, 0, 0), v3(0, 0, -1), r, { ao: [1, 1, 1, 1] });
  }

  function downlightIn(sit, x, z, r) {
    sit.kotouc('svitidlo', v3(x, STROP_Y - 0.006, z), v3(1, 0, 0), v3(0, 0, 1), r, { ao: [1, 1, 1, 1] });
  }

  function zasuvkaIn(sit, rovina, hodnota, u, y, sm) {
    var s = 0.043, d = 0.011;
    if (rovina === 'x') sit.kvadr('vypinac', hodnota, hodnota + sm * d, y - s, y + s, u - s, u + s, { tileU: 0.2, tileV: 0.2 });
    else sit.kvadr('vypinac', u - s, u + s, y - s, y + s, hodnota, hodnota + sm * d, { tileU: 0.2, tileV: 0.2 });
  }

  function oknoIn(zaklZ, vys) {
    return { v: (LIFT + OKNO_PARAPET) - PODLAHA_Y, w: OKNO_W, h: OKNO_H };
  }

  function postavInterier(sit) {
    var yP = PODLAHA_Y, yS = STROP_Y, vys = yS - yP;
    var oknoV = (LIFT + OKNO_PARAPET) - PODLAHA_Y;
    var maleV = (LIFT + OKNO_MALE_PARAPET) - PODLAHA_Y;
    var hlOst = 0.075;

    function ot(u, w, v, h) { return { u: u, v: v, w: w, h: h }; }
    function uStred(rovina, a, b, stred) {
      if (rovina === 'z+' || rovina === 'x-') return stred - a;
      return b - stred;
    }
    function otStred(rovina, a, b, stred, w, v, h) {
      return { u: uStred(rovina, a, b, stred) - w / 2, v: v, w: w, h: h };
    }

    var obyvakZ0 = IN.zZ, obyvakZ1 = IN.zF;
    var lozZ0 = IN.zZ, lozZ1 = IN.zF;

    var prekazky = [];
    if (S.kuchyn) {
      prekazky.push([IN.linkaA.x0, IN.linkaA.x1, IN.linkaA.z0, IN.linkaA.z1]);
      prekazky.push([IN.linkaB.x0, IN.linkaB.x1, IN.linkaB.z0, IN.linkaB.z1]);
    }
    var prekazkyK = [];
    if (S.koupelna) {
      prekazkyK.push([IN.xLozA, IN.xKoupA, IN.zZs, IN.zZs + 0.650]);
      prekazkyK.push([IN.xKoupA - 0.720, IN.xKoupA, -2.197, -1.680]);
      prekazkyK.push([IN.xKoupA - 0.500, IN.xKoupA, -1.389, -0.589]);
    }
    var aoObyvak = aoRoviny([IN.xKoupB, IN.xP, obyvakZ0, obyvakZ1], prekazky, 0.55, 0.44, 0.40, 0.44);
    var aoLozZ = aoRoviny([IN.xL, IN.xLozB, lozZ0, IN.zLozP0], null, 0.55, 0.44);
    var aoLozF = aoRoviny([IN.xL, IN.xLozB, IN.zLozP1, lozZ1], null, 0.55, 0.44);
    var aoKoup = aoRoviny([IN.xLozA, IN.xKoupA, IN.zZs, IN.zKoupF], prekazkyK, 0.42, 0.44, 0.34, 0.46);
    var aoChodba = aoRoviny([IN.xLozA, IN.xKoupA, IN.zKoupF, IN.zFs], null, 0.45, 0.46);

    podlahaIn(sit, IN.xKoupB, IN.xP, obyvakZ0, obyvakZ1, false, aoObyvak);
    podlahaIn(sit, IN.xKoupB, IN.xSm1, IN.zZs, IN.zZ, false, aoObyvak);
    podlahaIn(sit, IN.xKoupB, IN.xSm1, IN.zF, IN.zFs, false, aoObyvak);
    podlahaIn(sit, IN.xL, IN.xLozB, lozZ0, IN.zLozP0, true, aoLozZ);
    podlahaIn(sit, IN.xL, IN.xLozB, IN.zLozP1, lozZ1, true, aoLozF);
    podlahaIn(sit, IN.xSm0, IN.xLozB, IN.zZs, IN.zZ, true, aoLozZ);
    podlahaIn(sit, IN.xSm0, IN.xLozB, IN.zF, IN.zFs, true, aoLozF);
    podlahaIn(sit, IN.xLozA, IN.xKoupA, IN.zKoupF, IN.zFs, false, aoChodba);
    podlahaIn(sit, IN.xLozA, IN.xKoupA, IN.zZs, IN.zKoupF, false, aoKoup);

    stropIn(sit, 'stropIn', IN.xKoupB, IN.xP, obyvakZ0, obyvakZ1, 1.4);
    stropIn(sit, 'stropIn', IN.xKoupB, IN.xSm1, IN.zZs, IN.zZ, 1.4);
    stropIn(sit, 'stropIn', IN.xKoupB, IN.xSm1, IN.zF, IN.zFs, 1.4);
    stropIn(sit, 'stropIn', IN.xL, IN.xLozB, lozZ0, IN.zLozP0, 1.4);
    stropIn(sit, 'stropIn', IN.xL, IN.xLozB, IN.zLozP1, lozZ1, 1.4);
    stropIn(sit, 'stropIn', IN.xSm0, IN.xLozB, IN.zZs, IN.zZ, 1.4);
    stropIn(sit, 'stropIn', IN.xSm0, IN.xLozB, IN.zF, IN.zFs, 1.4);
    // strop stredniho modulu jde az na vnejsi lice pricek, jinak zustane
    // nad pricou nezakryty prouzek a je jim videt fasada
    stropIn(sit, 'lamely', IN.xLozB, IN.xKoupB, IN.zZs, IN.zFs, 0.472);

    var stO1 = stenaVnitrni(sit, 'stenaIn', 'x-', IN.xP, IN.zZ, IN.zF,
      [otStred('x-', IN.zZ, IN.zF, 1.208, OKNO_W, oknoV, OKNO_H),
        otStred('x-', IN.zZ, IN.zF, -1.208, OKNO_W, oknoV, OKNO_H)]);
    var stO2 = stenaVnitrni(sit, 'stenaIn', 'z+', IN.zZ, IN.xSm1, IN.xP,
      [otStred('z+', IN.xSm1, IN.xP, 2.1315, OKNO_W, oknoV, OKNO_H)]);
    var stO3 = stenaVnitrni(sit, 'stenaIn', 'z-', IN.zF, IN.xSm1, IN.xP,
      [otStred('z-', IN.xSm1, IN.xP, 2.1315, OKNO_W, oknoV, OKNO_H)]);
    stenaVnitrni(sit, 'stenaIn', 'z+', IN.zZs, IN.xKoupB, IN.xSm1, []);
    stenaVnitrni(sit, 'stenaIn', 'z-', IN.zFs, IN.xKoupB, IN.xSm1, []);
    stenaVnitrni(sit, 'stenaIn', 'x-', IN.xSm1, IN.zZs, IN.zZ, []);
    stenaVnitrni(sit, 'stenaIn', 'x-', IN.xSm1, IN.zF, IN.zFs, []);

    var stL1 = stenaVnitrni(sit, 'stenaIn', 'x+', IN.xL, IN.zZ, IN.zF,
      [otStred('x+', IN.zZ, IN.zF, 1.208, OKNO_W, oknoV, OKNO_H),
        otStred('x+', IN.zZ, IN.zF, -1.208, OKNO_W, oknoV, OKNO_H)]);
    var stL2 = stenaVnitrni(sit, 'stenaIn', 'z+', IN.zZ, IN.xL, IN.xSm0,
      [otStred('z+', IN.xL, IN.xSm0, -2.1315, OKNO_W, oknoV, OKNO_H)]);
    var stL3 = stenaVnitrni(sit, 'stenaIn', 'z-', IN.zF, IN.xL, IN.xSm0,
      [otStred('z-', IN.xL, IN.xSm0, -2.1315, OKNO_W, oknoV, OKNO_H)]);
    stenaVnitrni(sit, 'stenaIn', 'z+', IN.zZs, IN.xSm0, IN.xLozB, []);
    stenaVnitrni(sit, 'stenaIn', 'z-', IN.zFs, IN.xSm0, IN.xLozB, []);
    stenaVnitrni(sit, 'stenaIn', 'x+', IN.xSm0, IN.zZs, IN.zZ, []);
    stenaVnitrni(sit, 'stenaIn', 'x+', IN.xSm0, IN.zF, IN.zFs, []);

    [[stO1, 'x-'], [stL1, 'x+']].forEach(function (par) {
      [1.208, -1.208].forEach(function (zc) {
        var t1 = otStred(par[1], IN.zZ, IN.zF, zc, OKNO_W, oknoV, OKNO_H);
        ostentiIn(sit, 'ocelIn', par[0], t1, hlOst);
        ramOknaIn(sit, par[0], t1, 1);
      });
    });
    var t_stO2 = otStred('z+', IN.xSm1, IN.xP, 2.1315, OKNO_W, oknoV, OKNO_H);
    ostentiIn(sit, 'ocelIn', stO2, t_stO2, hlOst);
    ramOknaIn(sit, stO2, t_stO2, 1);
    var t_stO3 = otStred('z-', IN.xSm1, IN.xP, 2.1315, OKNO_W, oknoV, OKNO_H);
    ostentiIn(sit, 'ocelIn', stO3, t_stO3, hlOst);
    ramOknaIn(sit, stO3, t_stO3, 1);
    var t_stL2 = otStred('z+', IN.xL, IN.xSm0, -2.1315, OKNO_W, oknoV, OKNO_H);
    ostentiIn(sit, 'ocelIn', stL2, t_stL2, hlOst);
    ramOknaIn(sit, stL2, t_stL2, 1);
    var t_stL3 = otStred('z-', IN.xL, IN.xSm0, -2.1315, OKNO_W, oknoV, OKNO_H);
    ostentiIn(sit, 'ocelIn', stL3, t_stL3, hlOst);
    ramOknaIn(sit, stL3, t_stL3, 1);

    var stCh = stenaVnitrni(sit, 'stenaIn', 'z-', IN.zFs, IN.xLozA, IN.xKoupA,
      [otStred('z-', IN.xLozA, IN.xKoupA, 0, DVERE_W, 0.02, Math.min(DVERE_H, vys - 0.03))]);

    var obk = S.koupelna ? 'mramor' : 'stenaIn';
    var obkT = S.koupelna ? { tileU: 1.405, tileV: 1.405 } : undefined;
    var kW = IN.xKoupA - IN.xLozA;
    var stKz = stenaVnitrni(sit, obk, 'z+', IN.zZs, IN.xLozA, IN.xKoupA,
      [otStred('z+', IN.xLozA, IN.xKoupA, 0, OKNO_MALE_W, maleV, OKNO_MALE_H)]);
    var tK = otStred('z+', IN.xLozA, IN.xKoupA, 0, OKNO_MALE_W, maleV, OKNO_MALE_H);
    ostentiIn(sit, 'ocelIn', stKz, tK, hlOst);
    ramOknaIn(sit, stKz, tK, 0);

    stenaVnitrni(sit, obk, 'x-', IN.xKoupA, IN.zZs, IN.zKoupF, [], obkT);
    stenaVnitrni(sit, obk, 'x+', IN.xLozA, IN.zZs, IN.zKoupF, [], obkT);
    var d3c = (IN.d3[0] + IN.d3[1]) / 2, d3w = IN.d3[1] - IN.d3[0];
    var pt = PRICKA_TL / 2;
    stenaVnitrni(sit, obk, 'z-', IN.zKoupF - pt, IN.xLozA, IN.xKoupA,
      [otStred('z-', IN.xLozA, IN.xKoupA, d3c, d3w, 0.0, DVERE_IN_H)]);
    stenaVnitrni(sit, 'stenaIn', 'z+', IN.zKoupF + pt, IN.xLozA, IN.xKoupA,
      [otStred('z+', IN.xLozA, IN.xKoupA, d3c, d3w, 0.0, DVERE_IN_H)]);

    stenaVnitrni(sit, 'stenaIn', 'x+', IN.xKoupB, IN.zZs, IN.zKoupF, []);
    stenaVnitrni(sit, 'stenaIn', 'x-', IN.xLozB, IN.zZs, IN.zFs,
      [otStred('x-', IN.zZs, IN.zFs, (IN.d2f[0] + IN.d2f[1]) / 2, IN.d2f[1] - IN.d2f[0], 0.0, DVERE_IN_H),
        otStred('x-', IN.zZs, IN.zFs, (IN.d2z[0] + IN.d2z[1]) / 2, IN.d2z[1] - IN.d2z[0], 0.0, DVERE_IN_H)]);
    stenaVnitrni(sit, 'stenaIn', 'x+', IN.xLozA, IN.zKoupF, IN.zFs,
      [otStred('x+', IN.zKoupF, IN.zFs, (IN.d2f[0] + IN.d2f[1]) / 2, IN.d2f[1] - IN.d2f[0], 0.0, DVERE_IN_H),
        otStred('x+', IN.zKoupF, IN.zFs, (IN.d2z[0] + IN.d2z[1]) / 2, IN.d2z[1] - IN.d2z[0], 0.0, DVERE_IN_H)]);

    stenaVnitrni(sit, 'stenaIn', 'z+', IN.zLozP1, IN.xL, IN.xLozB, []);
    stenaVnitrni(sit, 'stenaIn', 'z-', IN.zLozP0, IN.xL, IN.xLozB, []);

    var zar = 0.030, pt3 = PRICKA_TL / 2, e3 = 0.002, lip3 = 0.008;
    var yD0 = PODLAHA_Y, yD1 = PODLAHA_Y + DVERE_IN_H + zar;
    [[IN.zKoupF - pt3 + e3, IN.zKoupF + pt3 - e3],
      [IN.zKoupF - pt3 - lip3, IN.zKoupF - pt3],
      [IN.zKoupF + pt3, IN.zKoupF + pt3 + lip3]].forEach(function (r) {
      sit.kvadr('ocelIn', IN.d3[0] - zar, IN.d3[0], yD0, yD1, r[0], r[1], { tileU: 0.5, tileV: 0.6 });
      sit.kvadr('ocelIn', IN.d3[1], IN.d3[1] + zar, yD0, yD1, r[0], r[1], { tileU: 0.5, tileV: 0.6 });
      sit.kvadr('ocelIn', IN.d3[0] - zar, IN.d3[1] + zar, PODLAHA_Y + DVERE_IN_H, yD1, r[0], r[1], { tileU: 0.5, tileV: 0.6 });
    });
    kridloOtevrene(sit, IN.zKoupF - 0.048, IN.d3[0], IN.d3[1] - IN.d3[0], true, 1);
    // D2 se podle vykresu otviraji dovnitr loznice, panty u pricky mezi nimi
    zarubenIn(sit, 'x', IN.xLozB, IN.xLozA, IN.d2z[0], IN.d2z[1]);
    zarubenIn(sit, 'x', IN.xLozB, IN.xLozA, IN.d2f[0], IN.d2f[1]);
    kridloOtevreneX(sit, IN.xLozB - 0.048, IN.d2z[1], IN.d2z[1] - IN.d2z[0], -1, -1);
    kridloOtevreneX(sit, IN.xLozB - 0.048, IN.d2f[0], IN.d2f[1] - IN.d2f[0], 1, -1);

    // cerny pas je jen v kridlovych modulech; v chodbe a koupelne panel dobiha
    // primo k lamelovemu podhledu (specifikace, oddil 3)
    var pasy = [
      [IN.xKoupB, IN.xP, IN.zZ, IN.zF], [IN.xL, IN.xLozB, IN.zZ, IN.zF]
    ];
    [[IN.xKoupB, IN.xP, IN.zZ, IN.zF], [IN.xL, IN.xLozB, IN.zZ, IN.zF],
      [IN.xLozA, IN.xKoupA, IN.zZs, IN.zFs]].forEach(function (r) {
      sparaUPodlahy(sit, r[0], r[1], r[2], r[3]);
    });

    pasy.forEach(function (r) {
      pasStropni(sit, r[0], r[1], r[2], r[2] + 0.030);
      pasStropni(sit, r[0], r[1], r[3] - 0.030, r[3]);
      pasStropni(sit, r[0], r[0] + 0.030, r[2], r[3]);
      pasStropni(sit, r[1] - 0.030, r[1], r[2], r[3]);
    });

    [[IN.xP, IN.zZ], [IN.xP, IN.zF], [IN.xKoupB, IN.zZ], [IN.xKoupB, IN.zF],
      [IN.xL, IN.zZ], [IN.xL, IN.zF], [IN.xLozB, IN.zZ], [IN.xLozB, IN.zF]].forEach(function (c) {
      // dve ramena L se nesmi prekryvat, jinak se v rohu prokresluji
      var sx = c[0] > 0 ? -1 : 1, sz = c[1] > 0 ? -1 : 1;
      var t = 0.055;
      var x0 = c[0], x1 = c[0] + sx * SLOUP_W;
      var z0 = c[1], z1 = c[1] + sz * t;
      sit.kvadr('ocelIn', Math.min(x0, x1), Math.max(x0, x1), yP, yS - PAS_H,
        Math.min(z0, z1), Math.max(z0, z1), { tileU: 0.3, tileV: 1.0 });
      var bx0 = c[0], bx1 = c[0] + sx * t;
      var bz0 = c[1] + sz * t, bz1 = c[1] + sz * SLOUP_W;
      if (Math.abs(bz1 - bz0) > 0.004) {
        sit.kvadr('ocelIn', Math.min(bx0, bx1), Math.max(bx0, bx1), yP, yS - PAS_H,
          Math.min(bz0, bz1), Math.max(bz0, bz1),
          { tileU: 0.3, tileV: 1.0, bez: sz > 0 ? 'z-' : 'z+' });
      }
    });

    svitidloIn(sit, 2.10, -1.35, 0.175);
    svitidloIn(sit, 2.10, 1.45, 0.175);
    svitidloIn(sit, 0.00, 1.55, 0.150);
    svitidloIn(sit, -1.95, -1.05, 0.175);
    svitidloIn(sit, -1.95, 1.62, 0.175);
    downlightIn(sit, -0.10, -1.05, 0.085);
    downlightIn(sit, 0.20, -2.35, 0.075);

    zasuvkaIn(sit, 'z', IN.zZ + 0.004, 2.55, yP + 1.24, 1);
    zasuvkaIn(sit, 'x', IN.xP - 0.004, 0.35, yP + 1.24, -1);
    zasuvkaIn(sit, 'x', IN.xL + 0.004, -1.45, yP + 1.24, 1);
    zasuvkaIn(sit, 'x', IN.xL + 0.004, 1.75, yP + 1.24, 1);
    zasuvkaIn(sit, 'z', IN.zKoupF + 0.004, 0.42, yP + 1.24, 1);

    sit.kvadr('vypinac', 0.30, 0.46, yP + 2.06, yP + 2.20, IN.zKoupF + 0.004, IN.zKoupF + 0.062,
      { tileU: 0.3, tileV: 0.3 });

    if (S.kuchyn) kuchynIn(sit);
    if (S.koupelna) koupelnaIn(sit);
  }

  function trubka(sit, mat, a, b, r, N) {
    N = N || 10;
    var d = jednotka(odecti(b, a));
    var pom = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
    var u = jednotka(krat(pom, d));
    var v = krat(d, u);
    function bod(p, ang) {
      var c = Math.cos(ang), si = Math.sin(ang);
      return v3(p[0] + (u[0] * c + v[0] * si) * r,
        p[1] + (u[1] * c + v[1] * si) * r,
        p[2] + (u[2] * c + v[2] * si) * r);
    }
    for (var i = 0; i < N; i++) {
      var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2;
      sit.quad(mat, bod(a, a0), bod(a, a1), bod(b, a1), bod(b, a0),
        { tileU: 0.25, tileV: 0.25, ao: [0.86, 0.86, 0.98, 0.98] });
    }
  }

  function oblouk(sit, mat, stred, osaU, osaV, R, r, u0, u1, kroku, N) {
    kroku = kroku || 8;
    function bod(t) {
      var a = u0 + (u1 - u0) * t, c = Math.cos(a), si = Math.sin(a);
      return v3(stred[0] + osaU[0] * c * R + osaV[0] * si * R,
        stred[1] + osaU[1] * c * R + osaV[1] * si * R,
        stred[2] + osaU[2] * c * R + osaV[2] * si * R);
    }
    for (var i = 0; i < kroku; i++) trubka(sit, mat, bod(i / kroku), bod((i + 1) / kroku), r, N || 8);
  }

  function madloIn(sit, osa, x, y, z, delka) {
    var r = 0.007, v = 0.030, N = 8;
    if (osa === 'y') {
      trubka(sit, 'ocelIn', v3(x, y - delka / 2, z - v), v3(x, y + delka / 2, z - v), r, N);
      trubka(sit, 'ocelIn', v3(x, y - delka / 2, z - v), v3(x, y - delka / 2 + 0.012, z), r, N);
      trubka(sit, 'ocelIn', v3(x, y + delka / 2, z - v), v3(x, y + delka / 2 - 0.012, z), r, N);
    } else {
      trubka(sit, 'ocelIn', v3(x - delka / 2, y, z - v), v3(x + delka / 2, y, z - v), r, N);
      trubka(sit, 'ocelIn', v3(x - delka / 2, y, z - v), v3(x - delka / 2 + 0.012, y, z), r, N);
      trubka(sit, 'ocelIn', v3(x + delka / 2, y, z - v), v3(x + delka / 2 - 0.012, y, z), r, N);
    }
  }

  function kuchynIn(sit) {
    var yP = PODLAHA_Y;
    var ySokl = yP + 0.125, yKorpus = yP + 0.710, yDeska = yP + 0.750;
    var A = IN.linkaA, B = IN.linkaB;

    sit.kvadr('linka', A.x0, A.x1, yP, ySokl, A.z0, A.z1 - 0.050, { tileU: 0.6, tileV: 0.2 });
    sit.kvadr('linka', B.x0, B.x1 + 0.001, yP, ySokl, B.z0, B.z1 - 0.050, { tileU: 0.6, tileV: 0.2 });
    sit.kvadr('linka', A.x0, A.x1, ySokl, yKorpus, A.z0, A.z1, { tileU: 0.7, tileV: 0.7 });
    sit.kvadr('linka', B.x0, B.x1 + 0.001, ySokl, yKorpus, B.z0, B.z1, { tileU: 0.7, tileV: 0.7 });

    sit.kvadr('deska', A.x0 - 0.020, A.x1, yKorpus, yDeska, A.z0, A.z1 + 0.020, { tileU: 0.30, tileV: 0.30 });
    sit.kvadr('deska', B.x0, B.x1 + 0.001, yKorpus, yDeska, B.z0, B.z1 + 0.020, { tileU: 0.30, tileV: 0.30 });
    sit.kvadr('deska', A.x0, A.x1, yDeska, yDeska + 0.058, A.z0, A.z0 + 0.020, { tileU: 0.4, tileV: 0.2 });
    sit.kvadr('deska', B.x0, B.x0 + 0.020, yDeska, yDeska + 0.058, B.z0, B.z1, { tileU: 0.4, tileV: 0.2 });

    var celaA = [0.397, 0.397, 0.597, 0.297];
    var px = A.x1;
    celaA.forEach(function (w, i) {
      var x1 = px, x0 = px - w;
      if (i === 2) {
        var vy = [0.240, 0.240, 0.240], yy = yKorpus - 0.004;
        vy.forEach(function (hv) {
          sit.kvadr('linka', x0 + 0.004, x1 - 0.004, yy - hv + 0.004, yy, A.z1, A.z1 + 0.018, { tileU: 0.5, tileV: 0.5 });
          madloIn(sit, 'x', (x0 + x1) / 2, yy - hv / 2, A.z1 + 0.018, 0.190);
          yy -= hv;
        });
      } else {
        sit.kvadr('linka', x0 + 0.004, x1 - 0.004, ySokl + 0.006, yKorpus - 0.004, A.z1, A.z1 + 0.018, { tileU: 0.5, tileV: 0.5 });
        madloIn(sit, 'y', i === 1 ? x0 + 0.052 : x1 - 0.052, yP + 0.560, A.z1 + 0.018, 0.190);
      }
      px -= w;
    });

    [[B.z0 + 0.600, B.z0 + 0.900], [B.z0 + 0.900, B.z0 + 1.200]].forEach(function (r, i) {
      sit.kvadr('linka', B.x0 - 0.018, B.x0, ySokl + 0.006, yKorpus - 0.004, r[0] + 0.004, r[1] - 0.004, { tileU: 0.5, tileV: 0.5 });
      var zc = i === 0 ? r[1] - 0.052 : r[0] + 0.052;
      sit.kvadr('ocelIn', B.x0 - 0.048, B.x0 - 0.032, yP + 0.560 - 0.095, yP + 0.560 + 0.095, zc - 0.008, zc + 0.008, { tileU: 0.2, tileV: 0.2 });
    });
    sit.kvadr('linka', B.x0 - 0.018, B.x1, ySokl, yKorpus, B.z1 - 0.018, B.z1, { tileU: 0.5, tileV: 0.5 });

    var d = IN.drez;
    sit.kvadr('nerez', d.x0, d.x1, yDeska - 0.200, yDeska - 0.006, d.z0, d.z1, { tileU: 0.4, tileV: 0.4, bez: 'y+' });
    sit.kvadr('nerez', d.x0 - 0.016, d.x1 + 0.016, yDeska - 0.008, yDeska + 0.004, d.z0 - 0.016, d.z1 + 0.016, { tileU: 0.4, tileV: 0.4 });
    var bx = (d.x0 + d.x1) / 2, bz = d.z0 - 0.072;
    trubka(sit, 'chrom', v3(bx, yDeska - 0.004, bz), v3(bx, yDeska + 0.022, bz), 0.026, 14);
    trubka(sit, 'chrom', v3(bx, yDeska + 0.020, bz), v3(bx, yDeska + 0.245, bz), 0.017, 12);
    oblouk(sit, 'chrom', v3(bx, yDeska + 0.245, bz + 0.085), v3(0, 0, -1), v3(0, 1, 0),
      0.085, 0.016, 0, Math.PI * 0.92, 8, 8);
    trubka(sit, 'chrom', v3(bx, yDeska + 0.240, bz + 0.168), v3(bx, yDeska + 0.196, bz + 0.170), 0.014, 10);
    trubka(sit, 'chrom', v3(bx - 0.016, yDeska + 0.150, bz - 0.006), v3(bx - 0.092, yDeska + 0.176, bz - 0.010), 0.010, 8);
  }

  function koupelnaIn(sit) {
    var yP = PODLAHA_Y, yS = STROP_Y;
    var x0 = IN.xLozA, x1 = IN.xKoupA, zZ = IN.zZs, zF = IN.zKoupF;
    var spZ = zZ + 0.650;

    sit.kvadr('vanicka', x0, x1, yP, yP + 0.060, zZ, spZ, { tileU: 0.5, tileV: 0.3 });
    sit.kvadr('nerez', x0 + 0.055, x1 - 0.055, yP + 0.056, yP + 0.062, zZ + 0.040, zZ + 0.100, { tileU: 0.3, tileV: 0.1 });
    sit.kvadr('nerez', x0, x1, yP + 0.052, yP + 0.066, spZ - 0.040, spZ, { tileU: 0.4, tileV: 0.1 });

    sit.kvadr('ocelIn', x0, x1, yS - 0.052, yS, spZ - 0.026, spZ + 0.026, { tileU: 0.6, tileV: 0.2 });
    sit.kvadr('ocelIn', x0, x0 + 0.030, yP + 0.060, yS - 0.052, spZ - 0.024, spZ + 0.024, { tileU: 0.2, tileV: 0.8 });
    sit.kvadr('ocelIn', x1 - 0.030, x1, yP + 0.060, yS - 0.052, spZ - 0.024, spZ + 0.024, { tileU: 0.2, tileV: 0.8 });
    // pravé křídlo je odsunuté za levé, jinak je sprcha schovaná za matným sklem
    var stred = (x0 + x1) / 2;
    sit.kvadr('skloMat', x0 + 0.030, stred + 0.015, yP + 0.060, yS - 0.052, spZ - 0.011, spZ - 0.003, { tileU: 0.5, tileV: 0.5 });
    sit.kvadr('sklo', x0 + 0.046, stred, yP + 0.060, yS - 0.052, spZ + 0.003, spZ + 0.011, { tileU: 0.5, tileV: 0.5 });
    [stred - 0.012, stred + 0.003].forEach(function (xx, i) {
      trubka(sit, 'ocelIn', v3(xx, yP + 1.16, spZ + (i ? -0.024 : 0.024)),
        v3(xx, yP + 1.44, spZ + (i ? -0.024 : 0.024)), 0.009, 8);
    });

    var sx = x1 - 0.175, sz = zZ + 0.148;
    trubka(sit, 'chrom', v3(sx, yP + 0.95, sz), v3(sx, yP + 2.03, sz), 0.015, 12);
    trubka(sit, 'chrom', v3(sx, yP + 0.86, sz - 0.020), v3(sx, yP + 0.86, sz + 0.055), 0.032, 12);
    trubka(sit, 'chrom', v3(sx - 0.085, yP + 0.86, sz + 0.010), v3(sx + 0.085, yP + 0.86, sz + 0.010), 0.021, 10);
    trubka(sit, 'chrom', v3(sx, yP + 2.02, sz), v3(sx, yP + 2.02, sz + 0.215), 0.013, 10);
    trubka(sit, 'chrom', v3(sx, yP + 2.020, sz + 0.215), v3(sx, yP + 1.996, sz + 0.215), 0.106, 18);
    sit.kotouc('chrom', v3(sx, yP + 2.020, sz + 0.215), v3(1, 0, 0), v3(0, 0, 1), 0.106, { ao: [1, 1, 1, 1] });
    sit.kotouc('bily', v3(sx, yP + 1.994, sz + 0.215), v3(1, 0, 0), v3(0, 0, -1), 0.100, { ao: [1, 1, 1, 1] });
    trubka(sit, 'chrom', v3(sx, yP + 1.50, sz + 0.030), v3(sx, yP + 1.50, sz + 0.062), 0.017, 10);
    sit.kvadr('porcelan', sx - 0.115, sx + 0.115, yP + 1.24, yP + 1.268, sz - 0.018, sz + 0.070, { tileU: 0.2, tileV: 0.2 });

    var wcZ0 = -2.197, wcZ1 = -1.680;
    sit.kvadr('porcelan', x1 - 0.720, x1 - 0.180, yP, yP + 0.400, wcZ0 + 0.070, wcZ1 - 0.070, { tileU: 0.4, tileV: 0.4 });
    sit.kvadr('porcelan', x1 - 0.660, x1 - 0.230, yP + 0.360, yP + 0.418, wcZ0 + 0.030, wcZ1 - 0.030, { tileU: 0.3, tileV: 0.3 });
    sit.kvadr('porcelan', x1 - 0.230, x1 - 0.020, yP, yP + 0.760, wcZ0, wcZ1, { tileU: 0.4, tileV: 0.4 });
    sit.kvadr('chrom', x1 - 0.150, x1 - 0.090, yP + 0.762, yP + 0.772, (wcZ0 + wcZ1) / 2 - 0.045, (wcZ0 + wcZ1) / 2 + 0.045, { tileU: 0.2, tileV: 0.2 });

    var umZ0 = -1.389, umZ1 = -0.589;
    sit.kvadr('linka', x1 - 0.500, x1, yP, yP + 0.100, umZ0 + 0.045, umZ1 - 0.045, { tileU: 0.4, tileV: 0.2 });
    sit.kvadr('linka', x1 - 0.500, x1, yP + 0.100, yP + 0.790, umZ0, umZ1, { tileU: 0.6, tileV: 0.6 });
    var dx0 = x1 - 0.520, dx1 = x1, dy0 = yP + 0.790, dy1 = yP + 0.820;
    var mx0 = x1 - 0.455, mx1 = x1 - 0.105, mz0 = umZ0 + 0.075, mz1 = umZ0 + 0.435;
    // deska se čtyřmi pásy kolem otvoru, aby mísa byla skutečná prohlubeň
    sit.kvadr('porcelan', dx0, mx0, dy0, dy1, umZ0 - 0.012, umZ1 + 0.012, { tileU: 0.4, tileV: 0.4 });
    sit.kvadr('porcelan', mx1, dx1, dy0, dy1, umZ0 - 0.012, umZ1 + 0.012, { tileU: 0.4, tileV: 0.4 });
    sit.kvadr('porcelan', mx0, mx1, dy0, dy1, umZ0 - 0.012, mz0, { tileU: 0.4, tileV: 0.4 });
    sit.kvadr('porcelan', mx0, mx1, dy0, dy1, mz1, umZ1 + 0.012, { tileU: 0.4, tileV: 0.4 });
    var dnoY = dy0 - 0.105, v = 0.042;
    [[mx0, mz0, mx1, mz0, 0, v], [mx1, mz1, mx0, mz1, 0, -v],
      [mx0, mz1, mx0, mz0, v, 0], [mx1, mz0, mx1, mz1, -v, 0]].forEach(function (r) {
      sit.quad('porcelan', v3(r[0], dy0, r[1]), v3(r[2], dy0, r[3]),
        v3(r[2] + r[4], dnoY, r[3] + r[5]), v3(r[0] + r[4], dnoY, r[1] + r[5]),
        { tileU: 0.3, tileV: 0.3, ao: [1, 1, 0.80, 0.80] });
    });
    sit.quad('porcelan', v3(mx0 + v, dnoY, mz1 - v), v3(mx1 - v, dnoY, mz1 - v),
      v3(mx1 - v, dnoY, mz0 + v), v3(mx0 + v, dnoY, mz0 + v),
      { tileU: 0.3, tileV: 0.3, ao: [0.80, 0.80, 0.80, 0.80] });
    trubka(sit, 'chrom', v3((mx0 + mx1) / 2, dnoY - 0.002, (mz0 + mz1) / 2),
      v3((mx0 + mx1) / 2, dnoY + 0.006, (mz0 + mz1) / 2), 0.021, 12);
    var ux = x1 - 0.095, uz = umZ1 - 0.130;
    trubka(sit, 'chrom', v3(ux, yP + 0.816, uz), v3(ux, yP + 0.838, uz), 0.024, 12);
    trubka(sit, 'chrom', v3(ux, yP + 0.832, uz), v3(ux, yP + 0.952, uz), 0.015, 10);
    oblouk(sit, 'chrom', v3(ux - 0.062, yP + 0.952, uz), v3(1, 0, 0), v3(0, 1, 0),
      0.062, 0.014, 0, Math.PI * 0.55, 6, 8);
    trubka(sit, 'chrom', v3(ux + 0.010, yP + 0.966, uz + 0.010), v3(ux + 0.062, yP + 0.988, uz + 0.010), 0.009, 8);

    sit.kvadr('linka', x1 - 0.170, x1, yP + 1.400, yP + 2.100, umZ0 + 0.125, umZ1 - 0.125, { tileU: 0.5, tileV: 0.5 });
    sit.kvadr('sklo', x1 - 0.178, x1 - 0.168, yP + 1.430, yP + 2.070, (umZ0 + umZ1) / 2 - 0.005, umZ1 - 0.150, { tileU: 0.4, tileV: 0.4 });

    sit.kvadr('vypinac', -0.595, -0.405, yP + 1.855, yP + 2.045, zZ, zZ + 0.022, { tileU: 0.3, tileV: 0.3 });
    sit.kotouc('vypinac', v3(-0.500, yP + 1.950, zZ + 0.023), v3(1, 0, 0), v3(0, 1, 0), 0.085, { ao: [1, 1, 1, 1] });
  }

  function postav() {
    var sit = Sit();
    var half = (W_FOLD / 2) + STRANA * S.fold;
    var y0 = LIFT, y1 = LIFT + H;
    var zF = D / 2, zB = -D / 2;
    var panelY0 = y0 + SOKL, panelY1 = y1 - PREKLAD;
    var panelH = panelY1 - panelY0;
    var pal = S.facade === 'grey' ? 'grey' : (S.facade === 'black' ? 'black' : 'wood');

    var KROK = 0.225;
    var moduly = [];
    if (half - W_FOLD / 2 > 0.06) {
      moduly.push({ x0: -half, x1: -W_FOLD / 2, zF: zF - KROK, zB: zB + KROK, stred: false });
    }
    moduly.push({ x0: -W_FOLD / 2, x1: W_FOLD / 2, zF: zF, zB: zB, stred: true });
    if (half - W_FOLD / 2 > 0.06) {
      moduly.push({ x0: W_FOLD / 2, x1: half, zF: zF - KROK, zB: zB + KROK, stred: false });
    }

    function oknaNaStene(strana, m, a, b, zaklY, vyskaPole) {
      var out = [];
      var stred = (m.x0 + m.x1) / 2;
      function pridej(cx, w, h, parapet, o) {
        if (cx - w / 2 < a + 0.10 || cx + w / 2 > b - 0.10) return;
        var v = (LIFT + parapet) - zaklY;
        if (v < 0.05 || v + h > vyskaPole - 0.05) return;
        out.push(Object.assign({ u: cx - w / 2 - a, v: v, w: w, h: h }, o || {}));
      }
      if (strana === 'front') {
        if (m.stred) {
          out.push({ u: stred - DVERE_W / 2 - a, v: 0.02, w: DVERE_W, h: DVERE_H,
            podil: [0.5, 0.5], hloubka: 0.080, ram: 0.062, dvere: true });
        } else {
          pridej(stred, OKNO_W, OKNO_H, OKNO_PARAPET, { tabuli: 2 });
        }
      } else if (m.stred) {
        pridej(stred, OKNO_MALE_W, OKNO_MALE_H, OKNO_MALE_PARAPET, { tabuli: 1 });
      } else {
        pridej(stred, OKNO_W, OKNO_H, OKNO_PARAPET, { tabuli: 2 });
      }
      return out;
    }

    function aoStena(vv) {
      return Math.min(Math.min(1, 0.60 + vv / 0.50 * 0.40),
        Math.min(1, 0.68 + (panelH - vv) / 0.70 * 0.32));
    }

    moduly.forEach(function (m) {
      var a = m.x0 + RAM_S, b = m.x1 - RAM_S, w = b - a;
      if (w < 0.05) return;
      var panelu = Math.max(1, Math.round(w / PANEL));
      var tileU = w / panelu;
      [1, -1].forEach(function (ven) {
        var z = ven > 0 ? m.zF : m.zB;
        var otvory = oknaNaStene(ven > 0 ? 'front' : 'back', m, a, b, panelY0, panelH);
        var rohBL, dirU, dirV, dirN;
        if (ven > 0) {
          rohBL = v3(a, panelY0, z - FASADA_Z); dirU = v3(1, 0, 0); dirN = v3(0, 0, 1);
        } else {
          rohBL = v3(b, panelY0, z + FASADA_Z); dirU = v3(-1, 0, 0); dirN = v3(0, 0, -1);
          otvory = otvory.map(function (t) { return Object.assign({}, t, { u: w - t.u - t.w }); });
        }
        dirV = v3(0, 1, 0);
        stenaSOtvory(sit, pal, rohBL, dirU, dirV, w, panelH, otvory,
          { tileU: tileU, tileV: panelH, aoFn: function (u, vv) { return aoStena(vv); } });
        otvory.forEach(function (t) { okno(sit, rohBL, dirU, dirV, dirN, t.u, t.v, t.w, t.h, t); });
      });
    });

    var kraj = moduly[moduly.length - 1], kraj0 = moduly[0];
    [{ x: half, ven: 1, m: kraj }, { x: -half, ven: -1, m: kraj0 }].forEach(function (o) {
      var m = o.m;
      var a = m.zB + RAM_S, b = m.zF - RAM_S, w = b - a;
      if (w < 0.05) return;
      var panelu = Math.max(1, Math.round(w / PANEL));
      var tileU = w / panelu;
      var otvory = [];
      if (S.fold > 0.45) {
        [a + OKNO_OD_ROHU, b - OKNO_OD_ROHU].forEach(function (c) {
          var u = (o.ven > 0 ? (b - c) : (c - a)) - OKNO_W / 2;
          if (u > 0.10 && u + OKNO_W < w - 0.10) {
            otvory.push({ u: u, v: (LIFT + OKNO_PARAPET) - panelY0, w: OKNO_W, h: OKNO_H, tabuli: 2 });
          }
        });
      }
      var rohBL, dirU, dirN;
      if (o.ven > 0) {
        rohBL = v3(o.x - FASADA_Z, panelY0, b); dirU = v3(0, 0, -1); dirN = v3(1, 0, 0);
      } else {
        rohBL = v3(o.x + FASADA_Z, panelY0, a); dirU = v3(0, 0, 1); dirN = v3(-1, 0, 0);
      }
      stenaSOtvory(sit, pal, rohBL, dirU, v3(0, 1, 0), w, panelH, otvory,
        { tileU: tileU, tileV: panelH, aoFn: function (u, vv) { return aoStena(vv); } });
      otvory.forEach(function (t) { okno(sit, rohBL, dirU, v3(0, 1, 0), dirN, t.u, t.v, t.w, t.h, t); });
    });

    var vnR = RAM_S;
    moduly.forEach(function (m) {
      var x0 = m.x0 - vnR, x1 = m.x1 + vnR;
      var zb = m.zB - vnR, zf = m.zF + vnR;
      if (S.pohled === 'dovnitr') {
        var t = 0.050;
        [[y0, y0 + SOKL], [y1 - PREKLAD, y1]].forEach(function (yy) {
          sit.kvadr('ocel', x0, x1, yy[0], yy[1], zb, zb + t, { tileU: 1.4, tileV: 0.55 });
          sit.kvadr('ocel', x0, x1, yy[0], yy[1], zf - t, zf, { tileU: 1.4, tileV: 0.55 });
          sit.kvadr('ocel', x0, x0 + t, yy[0], yy[1], zb, zf, { tileU: 1.4, tileV: 0.55 });
          sit.kvadr('ocel', x1 - t, x1, yy[0], yy[1], zb, zf, { tileU: 1.4, tileV: 0.55 });
        });
      } else {
        sit.kvadr('ocel', x0, x1, y0, y0 + SOKL, zb, zf, { tileU: 1.4, tileV: 0.55 });
        sit.kvadr('ocel', x0, x1, y1 - PREKLAD, y1, zb, zf, { tileU: 1.4, tileV: 0.55 });
      }
      [m.x0, m.x1].forEach(function (px) {
        [m.zF, m.zB].forEach(function (pz) {
          var sm = pz > 0 ? 1 : -1;
          sit.kvadr('ocel', px - vnR, px + vnR, y0 + SOKL, y1 - PREKLAD,
            sm > 0 ? pz - 0.16 : pz - vnR, sm > 0 ? pz + vnR : pz + 0.16,
            { tileU: 0.35, tileV: 1.0 });
        });
      });
    });

    moduly.forEach(function (m) {
      if (!m.stred) return;
      [m.zF, m.zB].forEach(function (pz) {
        var sm = pz > 0 ? 1 : -1;
        sit.kvadr('lista', m.x0 + 0.03, m.x1 - 0.03, y1 - 0.125, y1 - 0.075,
          sm > 0 ? pz + vnR - 0.006 : pz - vnR - 0.010, sm > 0 ? pz + vnR + 0.010 : pz - vnR + 0.006,
          { tileU: 1.0, tileV: 0.2 });
      });
      var zv = m.zB - FASADA_Z - 0.006;
      var stredM = (m.x0 + m.x1) / 2;
      sit.kotouc('bily', v3(stredM - 0.46, LIFT + 1.80, zv), v3(1, 0, 0), v3(0, 1, 0), 0.075,
        { ao: [0.9, 0.9, 0.9, 0.9] });
      [[-0.06, 0.055], [0.03, 0.036], [0.09, 0.026]].forEach(function (t) {
        var px = stredM + t[0];
        sit.kvadr('bily', px - t[1] / 2, px + t[1] / 2, y0 + 0.015, y0 + 0.015 + t[1],
          zv - 0.09, zv, { tileU: 0.2, tileV: 0.2, bez: 'z-' });
      });
    });

    var terasaHl = 2.15;
    var terasaZ1 = zF + terasaHl;
    var xa = -half - PRESAH, xb = half + PRESAH;
    var za = zB - PRESAH, zb = S.terrace ? terasaZ1 + 0.14 : zF + PRESAH;
    var okapD = y1 + 0.02, okapH = y1 + 0.21;
    var hreben = okapH + (half + PRESAH) * 0.2679;

    function sedlo(mat, yOkap, yHreben, dolu, ao, dlaz) {
      var o = { tileU: dlaz || 1.0, tileV: dlaz || 1.0, ao: ao };
      var R0 = v3(0, yHreben, za), R1 = v3(0, yHreben, zb);
      if (!dolu) {
        sit.quad(mat, v3(xa, yOkap, zb), R1, R0, v3(xa, yOkap, za), o);
        sit.quad(mat, v3(xb, yOkap, za), R0, R1, v3(xb, yOkap, zb), o);
      } else {
        sit.quad(mat, v3(xa, yOkap, za), R0, R1, v3(xa, yOkap, zb), o);
        sit.quad(mat, v3(xb, yOkap, zb), R1, R0, v3(xb, yOkap, za), o);
      }
    }

    function stit(z, ven, otevreny, lemNa) {
      if (!otevreny) {
        var su = function (x) { return (ven > 0 ? x + half : half - x) / PANEL; };
        var sv = function (y) { return (y - panelY0) / panelH; };
        moduly.forEach(function (m) {
          var zk = (ven > 0 ? m.zF : m.zB) - ven * 0.02;
          var x0 = m.x0 - RAM_S, x1 = m.x1 + RAM_S;
          var casti = (x0 < -0.01 && x1 > 0.01) ? [[x0, 0], [0, x1]] : [[x0, x1]];
          casti.forEach(function (c) {
            var xl = c[0], xp = c[1];
            var yl = podhledY(xl, zk), yp = podhledY(xp, zk);
            if (yl - y1 < 0.005 && yp - y1 < 0.005) return;
            var L0 = v3(xl, y1, zk), P0 = v3(xp, y1, zk);
            var P1 = v3(xp, yp, zk), L1 = v3(xl, yl, zk);
            var uL0 = [su(xl), sv(y1)], uP0 = [su(xp), sv(y1)];
            var uP1 = [su(xp), sv(yp)], uL1 = [su(xl), sv(yl)];
            if (ven > 0) sit.quad(pal, L0, P0, P1, L1, { uv: [uL0, uP0, uP1, uL1] });
            else sit.quad(pal, P0, L0, L1, P1, { uv: [uP0, uL0, uL1, uP1] });
          });
        });
      }
      var lemZ = (lemNa === undefined ? z : lemNa) - ven * 0.012;
      var kraje = [
        [v3(-half - PRESAH, okapH, lemZ), v3(0, hreben + 0.012, lemZ)],
        [v3(0, hreben + 0.012, lemZ), v3(half + PRESAH, okapH, lemZ)]
      ];
      kraje.forEach(function (k) {
        var a = k[0], b = k[1];
        var hloubka = okapH - okapD + 0.10;
        if (ven > 0) {
          sit.quad('ocel', v3(a[0], a[1] - hloubka, a[2]), v3(b[0], b[1] - hloubka, b[2]), b, a, { tileU: 1.2, tileV: 0.35 });
        } else {
          sit.quad('ocel', v3(b[0], b[1] - hloubka, b[2]), v3(a[0], a[1] - hloubka, a[2]), a, b, { tileU: 1.2, tileV: 0.35 });
        }
      });
    }

    function lemovani(yZa, yZb, hornZ0, hornZ1) {
      sit.quad('ocel', v3(xa, yZb, zb), v3(xb, yZb, zb), v3(xb, hornZ1, zb), v3(xa, hornZ1, zb), { tileU: 1.2, tileV: 0.35 });
      sit.quad('ocel', v3(xb, yZa, za), v3(xa, yZa, za), v3(xa, hornZ0, za), v3(xb, hornZ0, za), { tileU: 1.2, tileV: 0.35 });
      sit.quad('ocel', v3(xb, yZb, zb), v3(xb, yZa, za), v3(xb, hornZ0, za), v3(xb, hornZ1, zb), { tileU: 1.2, tileV: 0.35 });
      sit.quad('ocel', v3(xa, yZa, za), v3(xa, yZb, zb), v3(xa, hornZ1, zb), v3(xa, hornZ0, za), { tileU: 1.2, tileV: 0.35 });
    }

    function okapniceHrana(yZa, yZb, x, smer) {
      var t = 0.055, v = 0.05, lem = 0.07;
      var xx = x + smer * t;
      var pZa = smer > 0 ? yZb : yZa, pZb = smer > 0 ? yZa : yZb;
      var cZa = smer > 0 ? zb + t : za - t, cZb = smer > 0 ? za - t : zb + t;
      sit.quad('lista', v3(xx, pZa - v, cZa), v3(xx, pZb - v, cZb), v3(xx, pZb, cZb), v3(xx, pZa, cZa),
        { tileU: 1.0, tileV: 0.12 });
      var a = smer > 0 ? xx - lem : xx, b = smer > 0 ? xx : xx + lem;
      sit.quad('lista', v3(a, yZa - v, za - t), v3(b, yZa - v, za - t), v3(b, yZb - v, zb + t), v3(a, yZb - v, zb + t),
        { tileU: 0.6, tileV: 0.6, ao: [0.72, 0.72, 0.72, 0.72] });
    }

    function okapniceBok(yZa, yZb) {
      okapniceHrana(yZa, yZb, xb, 1);
      okapniceHrana(yZa, yZb, xa, -1);
    }

    function okapnice(yZa, yZb) {
      var t = 0.055, v = 0.05, lem = 0.07;
      okapniceBok(yZa, yZb);
      sit.quad('lista', v3(xa, yZb - v, zb + t), v3(xb, yZb - v, zb + t), v3(xb, yZb, zb + t), v3(xa, yZb, zb + t), { tileU: 1.0, tileV: 0.12 });
      sit.quad('lista', v3(xb, yZa - v, za - t), v3(xa, yZa - v, za - t), v3(xa, yZa, za - t), v3(xb, yZa, za - t), { tileU: 1.0, tileV: 0.12 });
      [[xa - t, xb + t, zb + t - lem, zb + t, yZb], [xa - t, xb + t, za - t, za - t + lem, yZa]].forEach(function (r) {
        sit.quad('lista', v3(r[0], r[4] - v, r[2]), v3(r[1], r[4] - v, r[2]), v3(r[1], r[4] - v, r[3]), v3(r[0], r[4] - v, r[3]),
          { tileU: 0.6, tileV: 0.6, ao: [0.72, 0.72, 0.72, 0.72] });
      });
    }

    var podhledVrchol = hreben - (okapH - okapD) - 0.03;
    var podhledAO = [0.66, 0.66, 0.74, 0.74];
    var podhledY;
    if (S.roof === 'flat') {
      var spad = S.terrace ? 0.19 : 0.11;
      var yTop = function (z) { return okapH + spad * (zb - z) / (zb - za); };
      var yDno = function (z) { return yTop(z) - (okapH - okapD); };
      podhledY = function (x, z) { return yDno(z); };
      sit.quad('strecha', v3(xa, yTop(zb), zb), v3(xb, yTop(zb), zb), v3(xb, yTop(za), za), v3(xa, yTop(za), za),
        { tileU: 1.0, tileV: 1.0 });
      lemovani(yDno(za), yDno(zb), yTop(za), yTop(zb));
      okapnice(yDno(za), yDno(zb));
    } else {
      podhledY = function (x) {
        return okapD + (podhledVrchol - okapD) * (1 - Math.min(1, Math.abs(x) / (half + PRESAH)));
      };
      sedlo('strecha', okapH, hreben, false, null);
      sit.quad('ocel', v3(xb, okapD, zb), v3(xb, okapD, za), v3(xb, okapH, za), v3(xb, okapH, zb), { tileU: 1.2, tileV: 0.35 });
      sit.quad('ocel', v3(xa, okapD, za), v3(xa, okapD, zb), v3(xa, okapH, zb), v3(xa, okapH, za), { tileU: 1.2, tileV: 0.35 });
      stit(zB, -1, false, za);
      stit(zF, 1, false, zb);
      okapniceBok(okapD, okapD);
    }

    function podhledPas(x0, x1, z0, z1) {
      if (x1 - x0 < 0.02 || z1 - z0 < 0.02) return;
      var casti = (S.roof === 'gable' && x0 < -0.01 && x1 > 0.01) ? [[x0, 0], [0, x1]] : [[x0, x1]];
      casti.forEach(function (c) {
        sit.quad('podhled',
          v3(c[0], podhledY(c[0], z0), z0), v3(c[1], podhledY(c[1], z0), z0),
          v3(c[1], podhledY(c[1], z1), z1), v3(c[0], podhledY(c[0], z1), z1),
          { tileU: PODHLED_DLAZ, tileV: PODHLED_DLAZ, ao: podhledAO });
      });
    }

    podhledPas(xa, xb, za, zB);
    podhledPas(xa, -half, zB, zb);
    podhledPas(half, xb, zB, zb);
    podhledPas(-half, half, zF, zb);

    if (S.terrace) {
      var tz0 = zF, tz1 = terasaZ1;
      var tx0 = -half, tx1 = half;
      var deckY = LIFT - 0.02;
      sit.quad('prkna', v3(tx0, deckY, tz0), v3(tx0, deckY, tz1), v3(tx1, deckY, tz1), v3(tx1, deckY, tz0),
        { tileU: 1.184, tileV: 1.184, ao: [0.58, 0.92, 0.92, 0.58] });
      var deckDno = Math.max(0.005, deckY - 0.13);
      sit.kvadr('ocel', tx0 - 0.05, tx1 + 0.05, deckDno, deckY, tz1 - 0.05, tz1 + 0.05, { tileU: 1.2, tileV: 0.3 });
      [[tx0 - 0.05, tx0], [tx1, tx1 + 0.05]].forEach(function (b) {
        sit.kvadr('ocel', b[0], b[1], deckDno, deckY, tz0, tz1 + 0.05, { tileU: 1.2, tileV: 0.3 });
      });

      var podhledSpodek = function (x) { return podhledY(x, tz1) - 0.012; };

      if (S.roof === 'gable') {
        var krokviT = Math.max(2, Math.round((terasaHl + 0.14) / 0.78));
        for (var i = 1; i <= krokviT; i++) {
          var kz = tz0 + (tz1 + 0.14 - tz0) * ((i - 0.5) / krokviT);
          var d = 0.034, hk = 0.075;
          var o = { tileU: 1.0, tileV: 0.25, ao: [0.70, 0.70, 0.70, 0.70] };
          [[xa + 0.05, 0], [0, xb - 0.05]].forEach(function (u) {
            var ya = podhledSpodek(u[0]) - 0.004, yb2 = podhledSpodek(u[1]) - 0.004;
            sit.quad('ocel', v3(u[0], ya, kz - d), v3(u[1], yb2, kz - d), v3(u[1], yb2, kz + d), v3(u[0], ya, kz + d), o);
            sit.quad('ocel', v3(u[0], ya - hk, kz - d), v3(u[0], ya, kz - d), v3(u[1], yb2, kz - d), v3(u[1], yb2 - hk, kz - d), o);
            sit.quad('ocel', v3(u[1], yb2, kz + d), v3(u[1], yb2 - hk, kz + d), v3(u[0], ya - hk, kz + d), v3(u[0], ya, kz + d), o);
          });
        }
        sit.kvadr('ocel', -0.055, 0.055, podhledSpodek(0) - 0.135, podhledSpodek(0) - 0.004,
          tz0, tz1 + 0.10, { tileU: 0.30, tileV: 1.2, bez: 'y+' });
      }

      [tx0 + 0.07, tx1 - 0.07].forEach(function (px) {
        sit.kvadr('ocel', px - 0.048, px + 0.048, 0, podhledSpodek(px) - 0.02,
          tz1 - 0.096, tz1, { tileU: 0.35, tileV: 1.2 });
      });
    }

    if (S.heat === 'stove') {
      var kx0 = -half * 0.42;
      var ky = S.roof === 'gable'
        ? okapH + (hreben - okapH) * (1 - Math.abs(kx0) / Math.max(0.001, xb)) - 0.05
        : y1 + 0.30;
      sit.kvadr('komin', kx0 - 0.075, kx0 + 0.075, ky, ky + 1.05, -0.42, -0.27, { tileU: 0.4, tileV: 0.4 });
      sit.kvadr('komin', kx0 - 0.12, kx0 + 0.12, ky + 1.05, ky + 1.13, -0.47, -0.22, { tileU: 0.4, tileV: 0.4 });
    }
    if (S.heat === 'ac') {
      var jx = -half - 0.02;
      sit.kvadr('jednotka', jx - 0.30, jx, y0 + 1.20, y0 + 1.82, -1.98, -1.14, { tileU: 0.6, tileV: 0.6, bez: 'x+' });
      sit.kvadr('ocel', jx - 0.325, jx - 0.295, y0 + 1.28, y0 + 1.74, -1.90, -1.22, { tileU: 0.3, tileV: 0.3 });
      [-1.88, -1.24].forEach(function (pz) {
        sit.kvadr('ocel', jx - 0.24, jx, y0 + 1.14, y0 + 1.20, pz - 0.025, pz + 0.025, { tileU: 0.3, tileV: 0.3 });
      });
    }

    var R = 220;
    sit.quad('teren', v3(-R, 0, R), v3(R, 0, R), v3(R, 0, -R), v3(-R, 0, -R), { tileU: 4, tileV: 4 });

    if (S.pohled === 'dovnitr') postavInterier(zrcadli(sit));

    return sit;
  }

  function tmave() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }
  function prostredi() {
    var d = tmave();
    var slunce = jednotka([0.78, 0.60, -0.10]);
    if (S.pohled === 'dovnitr') {
      return {
        slunce: slunce,
        slSvit: [3.30, 3.12, 2.82],
        zenit: [0.560, 0.582, 0.615],
        obzor: [0.545, 0.554, 0.566],
        zeme: [0.310, 0.303, 0.291],
        teren: [0.408, 0.404, 0.392],
        expo: 1.14
      };
    }
    if (d) {
      return {
        slunce: slunce,
        slSvit: [1.95, 1.85, 1.68],
        zenit: [0.070, 0.094, 0.134],
        obzor: [0.150, 0.170, 0.198],
        zeme: [0.068, 0.071, 0.076],
        teren: [0.078, 0.081, 0.086],
        expo: 1.55
      };
    }
    return {
      slunce: slunce,
      slSvit: [3.62, 3.40, 3.03],
      zenit: [0.330, 0.470, 0.760],
      obzor: [0.700, 0.740, 0.795],
      zeme: [0.450, 0.438, 0.418],
      teren: [0.408, 0.404, 0.392],
      expo: 0.95
    };
  }

  function meze() {
    var half = (W_FOLD / 2) + STRANA * S.fold;
    var zKonec = S.terrace ? D / 2 + 2.6 : D / 2 + PRESAH;
    var vys = (S.roof === 'gable' ? LIFT + H + 0.9 : LIFT + H + 0.3) + (S.heat === 'stove' ? 1.2 : 0);
    return {
      x0: -half - PRESAH - 0.2, x1: half + PRESAH + 0.2,
      z0: -D / 2 - PRESAH - 0.2, z1: zKonec + 0.2,
      y0: 0, y1: vys
    };
  }

  var FOV = 0.44;
  var FOV_IN = 1.16;
  var MISTA = [
    { klic: 'obyvak',   nazev: 'Obývací prostor', oko: [-2.05, 1.60, 1.72], yaw: Math.PI - 0.10, pitch: -0.03 },
    { klic: 'kuchyn',   nazev: 'Kuchyň',          oko: [-1.95, 1.58, -0.35], yaw: Math.PI - 0.34, pitch: -0.11 },
    { klic: 'chodba',   nazev: 'Chodba a vstup',  oko: [-0.30, 1.60, 2.55], yaw: Math.PI + 0.16, pitch: -0.04 },
    { klic: 'koupelna', nazev: 'Koupelna',        oko: [0.36, 1.54, -0.74], yaw: Math.PI + 0.60, pitch: -0.16 },
    { klic: 'loznice1', nazev: 'Ložnice u vstupu', oko: [1.06, 1.58, 0.92], yaw: 0.86, pitch: -0.05 },
    { klic: 'loznice2', nazev: 'Zadní ložnice',    oko: [1.72, 1.58, 0.24], yaw: Math.PI - 0.22, pitch: -0.04 }
  ];
  function misto() { return MISTA[Math.max(0, Math.min(MISTA.length - 1, S.misto | 0))]; }

  // Chodit se dá jen tam, kde je podlaha. Plochy jsou v souřadnicích rendereru
  // (tedy už zrcadlené) a jsou zmenšené o poloměr člověka, aby kamera
  // nedosedla na stěnu. Dveřní otvory jsou samostatné spojky.
  var CHUZE_R = 0.30;
  function plochyChuze() {
    return [
      [-2.788, 0.421, -0.273, 2.355],
      [-0.410, 0.421, 2.355, 2.594],
      [-2.788, -1.071, -2.350, -0.273],
      [-0.410, 0.421, -2.595, -0.873],
      [1.071, 2.788, -2.350, 0.229],
      [1.071, 2.788, 0.879, 2.355],
      [0.030, 0.550, -0.950, -0.200],
      [0.350, 1.150, -0.320, 0.280],
      [0.350, 1.150, 0.753, 1.313]
    ];
  }
  function prekazkyChuze() {
    var r = CHUZE_R, out = [];
    if (S.kuchyn) {
      out.push([-3.039 - r, -1.372 + r, -2.650 - r, -2.050 + r]);
      out.push([-1.372 - r, -0.771 + r, -2.650 - r, -1.450 + r]);
    }
    if (S.koupelna) {
      out.push([-0.710 - r, 0.721 + r, -2.895 - r, -2.245 + r]);
      out.push([0.721 - 0.720 - r, 0.721 + r, -2.197 - r, -1.680 + r]);
      out.push([0.721 - 0.500 - r, 0.721 + r, -1.389 - r, -0.589 + r]);
    }
    return out;
  }
  function lzeStat(x, z, plochy, prekazky) {
    var i, p, uvnitr = false;
    for (i = 0; i < plochy.length; i++) {
      p = plochy[i];
      if (x >= p[0] && x <= p[1] && z >= p[2] && z <= p[3]) { uvnitr = true; break; }
    }
    if (!uvnitr) return false;
    for (i = 0; i < prekazky.length; i++) {
      p = prekazky[i];
      if (x > p[0] && x < p[1] && z > p[2] && z < p[3]) return false;
    }
    return true;
  }
  function dojdi(x0, z0, x1, z1) {
    var plochy = plochyChuze(), prekazky = prekazkyChuze();
    var dx = x1 - x0, dz = z1 - z0;
    var d = Math.sqrt(dx * dx + dz * dz);
    if (d < 1e-4) return null;
    var n = Math.max(2, Math.ceil(d / 0.035));
    var nx = x0, nz = z0, dobra = null;
    for (var i = 1; i <= n; i++) {
      var t = i / n;
      nx = x0 + dx * t; nz = z0 + dz * t;
      if (!lzeStat(nx, nz, plochy, prekazky)) break;
      dobra = [nx, nz];
    }
    return dobra;
  }
  function fov() { return S.pohled === 'dovnitr' ? FOV_IN : FOV; }
  function blizko() { return S.pohled === 'dovnitr' ? 0.045 : 0.25; }

  function ramuj(W, Hh) {
    if (S.pohled === 'dovnitr') {
      var m = misto();
      var y = PODLAHA_Y + (m.oko[1] - 0.203);
      if (!cam.pozice) cam.pozice = [m.oko[0], m.oko[2]];
      cam.oko = [cam.pozice[0], y, cam.pozice[1]];
      var cp = Math.cos(cam.pitch);
      cam.cil = [cam.oko[0] + Math.sin(cam.yaw) * cp,
        cam.oko[1] + Math.sin(cam.pitch),
        cam.oko[2] + Math.cos(cam.yaw) * cp];
      return;
    }
    if (rucniZoom) return;
    var m = meze();
    cam.cil = [(m.x0 + m.x1) / 2, (m.y0 + m.y1) * 0.46, (m.z0 + m.z1) / 2];
    var polomer = 0.5 * Math.sqrt(
      Math.pow(m.x1 - m.x0, 2) + Math.pow(m.y1 - m.y0, 2) + Math.pow(m.z1 - m.z0, 2));
    var fovX = 2 * Math.atan(Math.tan(FOV / 2) * (W / Hh));
    cam.dist = polomer / Math.sin(Math.min(FOV, fovX) / 2);

    var rohy = [];
    [m.x0, m.x1].forEach(function (x) {
      [m.y0, m.y1].forEach(function (y) {
        [m.z0, m.z1].forEach(function (z) { rohy.push([x, y, z]); });
      });
    });
    var P = perspektiva(fov(), W / Hh, blizko(), 320);
    for (var k = 0; k < 5; k++) {
      var VP = nasob(P, pohled(oko(), cam.cil, [0, 1, 0]));
      var mx = 0, my = 0;
      for (var i = 0; i < rohy.length; i++) {
        var r = rohy[i];
        var cw = VP[3] * r[0] + VP[7] * r[1] + VP[11] * r[2] + VP[15];
        if (cw <= 0.01) { mx = my = 0; break; }
        var cx = (VP[0] * r[0] + VP[4] * r[1] + VP[8] * r[2] + VP[12]) / cw;
        var cy = (VP[1] * r[0] + VP[5] * r[1] + VP[9] * r[2] + VP[13]) / cw;
        if (Math.abs(cx) > mx) mx = Math.abs(cx);
        if (Math.abs(cy) > my) my = Math.abs(cy);
      }
      var e = Math.max(mx, my);
      if (!e) break;
      var pomerK = e / 0.93;
      if (Math.abs(pomerK - 1) < 0.006) break;
      cam.dist = Math.max(3.5, Math.min(60, cam.dist * pomerK));
    }
  }

  function oko() {
    if (S.pohled === 'dovnitr') return cam.oko || misto().oko;
    var cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    return [cam.cil[0] + cam.dist * cp * Math.sin(cam.yaw),
      cam.cil[1] + cam.dist * sp,
      cam.cil[2] + cam.dist * cp * Math.cos(cam.yaw)];
  }

  function svetloVP(env) {
    var m = meze();
    var stred = [(m.x0 + m.x1) / 2, (m.y0 + m.y1) / 2, (m.z0 + m.z1) / 2];
    var r = 0.5 * Math.sqrt(Math.pow(m.x1 - m.x0, 2) + Math.pow(m.y1 - m.y0, 2) + Math.pow(m.z1 - m.z0, 2)) + 0.8;
    var oko2 = [stred[0] + env.slunce[0] * r * 2.2, stred[1] + env.slunce[1] * r * 2.2, stred[2] + env.slunce[2] * r * 2.2];
    var V = pohled(oko2, stred, [0, 1, 0]);
    var P = orto(-r * 1.35, r * 1.35, -r * 1.35, r * 1.35, 0.1, r * 5.0);
    return nasob(P, V);
  }

  function kresliDavky(pr, env, svVP, jenHloubka) {
    davky.forEach(function (d) {
      var m = MAT[d.mat];
      if (!m) return;
      if (jenHloubka) {
        if (m.sklo || m.teren) return;
        gl.bindVertexArray(d.vao);
        gl.drawElements(gl.TRIANGLES, d.pocet, gl.UNSIGNED_INT, 0);
        return;
      }
      var tex = m.tex ? OBR[m.tex] : null;
      var nor = m.tex && TEX[m.tex] && TEX[m.tex].normala ? OBR[m.tex + '_n'] : null;
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex || bilyPixel);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, nor || plochaNormala);
      gl.uniform1f(pr.u.uMaTex, tex ? 1 : 0);
      gl.uniform1f(pr.u.uMaNor, nor ? 1 : 0);
      gl.uniform1f(pr.u.uNorSila, m.tex === 'deck' ? 1.0 : (m.tex === 'wood' || m.tex === 'grey' || m.tex === 'black' ? 0.55 : 0.75));
      gl.uniform1f(pr.u.uRough, m.rough);
      gl.uniform1f(pr.u.uMetal, m.metal);
      gl.uniform1f(pr.u.uSklo, m.sklo ? 1 : 0);
      gl.uniform1f(pr.u.uTeren, m.teren ? 1 : 0);
      var tint = m.teren ? env.teren : (tex ? (m.tint || [1, 1, 1]) : (m.nahradaTint || m.tint || [1, 1, 1]));
      gl.uniform3fv(pr.u.uTint, tint);
      gl.bindVertexArray(d.vao);
      gl.drawElements(gl.TRIANGLES, d.pocet, gl.UNSIGNED_INT, 0);
    });
  }

  function kresli() {
    var W = cv.width, Hh = cv.height;
    if (!W || !Hh) return;
    if (potrebaSit) { nahrajSit(postav()); potrebaSit = false; potrebaStin = true; }
    var env = prostredi();
    ramuj(W, Hh);
    var e = oko();
    var svVP = svetloVP(env);

    if (potrebaStin) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, stinFbo);
      gl.viewport(0, 0, STIN_R, STIN_R);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.colorMask(false, false, false, false);
      gl.clear(gl.DEPTH_BUFFER_BIT);
      gl.useProgram(progStin.p);
      gl.uniformMatrix4fv(progStin.u.uSvVP, false, svVP);
      gl.disable(gl.CULL_FACE);
      kresliDavky(progStin, env, svVP, true);
      gl.colorMask(true, true, true, true);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      potrebaStin = false;
    }

    gl.viewport(0, 0, W, Hh);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var P = perspektiva(fov(), W / Hh, blizko(), 320);
    var V = pohled(e, cam.cil, [0, 1, 0]);
    var VP = nasob(P, V);

    gl.useProgram(progNebe.p);
    var Vr = V.slice(); Vr[12] = 0; Vr[13] = 0; Vr[14] = 0;
    var inv = invert(nasob(P, Vr));
    pickInv = inv;
    gl.uniformMatrix4fv(progNebe.u.uInv, false, inv);
    gl.uniform3fv(progNebe.u.uOko, [0, 0, 0]);
    gl.uniform3fv(progNebe.u.uZenit, env.zenit);
    gl.uniform3fv(progNebe.u.uObzor, env.obzor);
    gl.uniform3fv(progNebe.u.uZeme, env.zeme);
    gl.uniform3fv(progNebe.u.uSlunce, env.slunce);
    gl.uniform3fv(progNebe.u.uSlSvit, env.slSvit);
    gl.uniform1f(progNebe.u.uExpo, env.expo);
    gl.depthMask(false);
    gl.bindVertexArray(nebeVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);

    gl.useProgram(prog.p);
    gl.uniformMatrix4fv(prog.u.uVP, false, VP);
    gl.uniformMatrix4fv(prog.u.uSvVP, false, svVP);
    gl.uniform3fv(prog.u.uOko, e);
    gl.uniform3fv(prog.u.uSlunce, env.slunce);
    gl.uniform3fv(prog.u.uSlSvit, env.slSvit);
    gl.uniform3fv(prog.u.uZenit, env.zenit);
    gl.uniform3fv(prog.u.uObzor, env.obzor);
    gl.uniform3fv(prog.u.uZeme, env.zeme);
    gl.uniform1f(prog.u.uExpo, env.expo);
    gl.uniform1f(prog.u.uStinTexel, 1 / STIN_R);
    var mz = meze();
    gl.uniform3fv(prog.u.uDumStred, [(mz.x0 + mz.x1) / 2, 0, (mz.z0 + mz.z1) / 2]);
    gl.uniform2fv(prog.u.uDumPul, [(mz.x1 - mz.x0) / 2 - 0.35, (mz.z1 - mz.z0) / 2 - 0.35]);
    gl.uniform1i(prog.u.uAlb, 0);
    gl.uniform1i(prog.u.uNor, 1);
    gl.uniform1i(prog.u.uStin, 2);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, stinTex);
    kresliDavky(prog, env, svVP, false);
    gl.bindVertexArray(null);
  }

  function invert(m) {
    var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3],
      a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7],
      a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11],
      a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
    var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
    var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) return m;
    det = 1 / det;
    return [
      (a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det,
      (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
      (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det,
      (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
      (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det,
      (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
      (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det,
      (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det];
  }

  function naplanuj() {
    if (snimekCeka) return;
    snimekCeka = true;
    global.requestAnimationFrame(function () { snimekCeka = false; kresli(); });
  }

  var DPR = Math.min(Math.max(global.devicePixelRatio || 1, 1.6), 2);
  function prizpusob() {
    var rodic = cv.parentNode && cv.parentNode.getBoundingClientRect
      ? cv.parentNode.getBoundingClientRect() : null;
    var r = cv.getBoundingClientRect();
    var sirka = rodic && rodic.width > 8 ? rodic.width : r.width;
    if (!sirka) return;
    sirka = Math.min(sirka, 2000);
    var vyska = sirka * pomer;
    if (cv.dataset && cv.dataset.vyska === 'ramec' && rodic && rodic.height > 8) {
      vyska = Math.min(rodic.height, sirka * 1.6);
    }
    vyska = Math.max(120, Math.min(vyska, 1200));
    var w = Math.min(4096, Math.round(sirka * DPR));
    var h = Math.min(4096, Math.round(vyska * DPR));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    naplanuj();
  }

  function smerZBodu(px, py) {
    if (!pickInv) return null;
    var r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var nx = (px - r.left) / r.width * 2 - 1;
    var ny = 1 - (py - r.top) / r.height * 2;
    var M = pickInv;
    var w = M[3] * nx + M[7] * ny + M[11] + M[15];
    if (Math.abs(w) < 1e-6) return null;
    return jednotka([
      (M[0] * nx + M[4] * ny + M[8] + M[12]) / w,
      (M[1] * nx + M[5] * ny + M[9] + M[13]) / w,
      (M[2] * nx + M[6] * ny + M[10] + M[14]) / w
    ]);
  }

  function podlahaZBodu(px, py) {
    var d = smerZBodu(px, py);
    if (!d || d[1] > -0.02) return null;
    var e = oko();
    var t = (PODLAHA_Y - e[1]) / d[1];
    if (t <= 0.15 || t > 40) return null;
    return [e[0] + d[0] * t, e[2] + d[2] * t];
  }

  function jdiNa(x, z) {
    if (!cam.pozice) return;
    var cil = dojdi(cam.pozice[0], cam.pozice[1], x, z);
    if (!cil) return;
    var zx = cam.pozice[0], zz = cam.pozice[1];
    var dl = Math.sqrt((cil[0] - zx) * (cil[0] - zx) + (cil[1] - zz) * (cil[1] - zz));
    if (dl < 0.05) return;
    var doba = Math.min(700, 210 + dl * 190);
    chuze = { zx: zx, zz: zz, cx: cil[0], cz: cil[1], doba: doba, start: null };
    try { cv.dispatchEvent(new CustomEvent('flexipohyb', { bubbles: true })); } catch (e) {}
    var krok = function (t) {
      if (!chuze) return;
      if (chuze.start === null) chuze.start = t;
      var u = Math.min(1, (t - chuze.start) / chuze.doba);
      var f = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      cam.pozice = [chuze.zx + (chuze.cx - chuze.zx) * f, chuze.zz + (chuze.cz - chuze.zz) * f];
      naplanuj();
      if (u < 1) global.requestAnimationFrame(krok); else chuze = null;
    };
    global.requestAnimationFrame(krok);
  }

  cv.style.touchAction = 'pan-y';
  cv.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch, tah: 0 };
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  });
  cv.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.tah = Math.max(drag.tah, Math.abs(dx) + Math.abs(dy));
    if (S.pohled === 'dovnitr') {
      cam.yaw = drag.yaw - dx * 0.0060;
      cam.pitch = Math.max(-0.62, Math.min(0.52, drag.pitch + dy * 0.0038));
    } else {
      cam.yaw = drag.yaw + dx * 0.0072;
      cam.pitch = Math.max(0.045, Math.min(0.62, drag.pitch - dy * 0.0040));
    }
    naplanuj();
  });
  cv.addEventListener('pointerup', function (e) {
    var klik = drag && drag.tah < 6;
    drag = null;
    if (!klik || S.pohled !== 'dovnitr') return;
    var b = podlahaZBodu(e.clientX, e.clientY);
    if (b) jdiNa(b[0], b[1]);
  });
  cv.addEventListener('pointercancel', function () { drag = null; });
  cv.addEventListener('wheel', function (e) {
    if (S.pohled === 'dovnitr') return;
    e.preventDefault();
    if (!rucniZoom) rucniZoom = true;
    cam.dist = Math.max(4.2, Math.min(38, cam.dist * (1 + e.deltaY * 0.0012)));
    naplanuj();
  }, { passive: false });
  cv.addEventListener('dblclick', function () { rucniZoom = false; naplanuj(); });
  global.addEventListener('resize', prizpusob);
  if (global.matchMedia) {
    try {
      global.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', naplanuj);
    } catch (e) {}
  }
  var pozorovatel = global.ResizeObserver ? new global.ResizeObserver(prizpusob) : null;
  if (pozorovatel) pozorovatel.observe(cv);

  prizpusob();

  return {
    nastav: function (novy) {
      var zmena = false, kamera = false;
      Object.keys(novy).forEach(function (k) {
        if (k in S && S[k] !== novy[k]) {
          if (k === 'pohled' || k === 'misto') kamera = true;
          S[k] = novy[k]; zmena = true;
        }
      });
      if (novy.facade) zajisti(novy.facade);
      if (S.pohled === 'dovnitr') {
        ['podlahaIn', 'stenaIn', 'lamelyIn', 'mramorIn', 'deskaIn'].forEach(zajisti);
      }
      if (kamera) {
        if (S.pohled === 'dovnitr') {
          var m = misto();
          cam.yaw = m.yaw; cam.pitch = m.pitch;
          cam.pozice = [m.oko[0], m.oko[2]];
          chuze = null;
        } else {
          cam.yaw = 0.66; cam.pitch = 0.245; rucniZoom = false;
        }
      }
      if (zmena) { potrebaSit = true; naplanuj(); }
    },
    mista: function () {
      return MISTA.map(function (m) { return { klic: m.klic, nazev: m.nazev }; });
    },
    prekresli: naplanuj,
    prizpusob: prizpusob,
    stav: function () {
      var v = Object.assign({}, S);
      if (cam.pozice) v.pozice = [Math.round(cam.pozice[0] * 1000) / 1000, Math.round(cam.pozice[1] * 1000) / 1000];
      return v;
    }
  };
}

global.Flexi3D = {
  vytvor: function (canvas, opt) {
    try {
      var s = Scena(canvas, opt);
      if (s) return s;
    } catch (e) {
      if (global.console && console.warn) console.warn('Flexi3D:', e && e.message);
    }
    return nahrada(canvas, opt);
  }
};

function nahrada(canvas, opt) {
  var zaklad = (opt && opt.zaklad) || '';
  var im = document.createElement('img');
  im.src = zaklad + 'img/flexi-house-1200w.webp';
  im.alt = 'Flexi House';
  im.loading = 'lazy';
  im.style.cssText = 'width:100%;height:auto;display:block;border-radius:inherit';
  var rodic = canvas.parentNode;
  if (rodic) {
    rodic.replaceChild(im, canvas);
    ['.kf-viz__bar', '.kf-viz__hint'].forEach(function (sel) {
      var el = rodic.querySelector(sel);
      if (el) el.style.display = 'none';
    });
  }
  return {
    nastav: function () {}, prekresli: function () {},
    prizpusob: function () {}, stav: function () { return {}; }
  };
}

})(window);
