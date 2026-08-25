"""Vyrobí textury pro 3D konfigurátor z fotek v podklady-3d/fotky.

    python3 .docs/3d/nastroje/textury.py

Zapisuje do assets/tex/. Každá textura má vedle sebe _n.webp s normálovou mapou
tam, kde má povrch reliéf.

Textury nejsou kreslené, jsou to rektifikované výřezy z fotek. Fotka se přes
homografii převede na kolmý pohled se známým měřítkem (px na metr), takže
kresba na modelu vychází ve skutečné velikosti. Měřítko se opírá o:

  fasáda   malé okno na zadní stěně (IMG_2285); jeho šířka plyne ze šířky
           středního modulu 2,20 m, kterou dává katalog. Odtud rozteč kresby
           prken ve fasádním plechu 0,215 m (ověřeno i na IMG_2289 a DJI_0173).
  prkna    rovina terasy se rektifikuje přes horizont a ohnisko z EXIF
           (IMG_2277, 14 mm). Výška fotoaparátu nad podlahou se dopočítá tak,
           aby rozteč prken vyšla 0,148 m.

Kontrolní čísla vypisuje skript při běhu — když se rozteč po rektifikaci
rozjede, měřítko sedí špatně.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

ZDE = os.path.dirname(os.path.abspath(__file__))
KOREN = os.path.abspath(os.path.join(ZDE, '..', '..', '..'))
FOTKY = os.path.join(KOREN, 'podklady-3d', 'fotky')
CIL = os.path.join(KOREN, 'assets', 'tex')
os.makedirs(CIL, exist_ok=True)

PANEL_W, PANEL_H = 1.15, 1.88
PRKNO = 0.148
DLAZDICE_PRKEN = 8


def nacti(jmeno):
    im = Image.open(os.path.join(FOTKY, jmeno)).convert('RGB')
    return np.asarray(im, dtype=np.float32) / 255.0


def obraz(a):
    return Image.fromarray(np.clip(a * 255.0, 0, 255).astype(np.uint8))


def rozostri(a, sigma):
    return np.asarray(obraz(np.clip(a, 0, 1)).filter(ImageFilter.GaussianBlur(sigma)),
                      dtype=np.float32) / 255.0


def dilatuj(m, k):
    return np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(k)),
                      dtype=np.float32) > 127


def jas(a):
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def homografie(src, dst):
    A = []
    for (x, y), (u, v) in zip(src, dst):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y, -u])
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y, -v])
    _, _, V = np.linalg.svd(np.array(A, dtype=np.float64))
    H = V[-1].reshape(3, 3)
    return H / H[2, 2]


def vzorkuj(a, H, W, Hgt, ox=0.0, oy=0.0):
    """H převádí obraz na rektifikovanou rovinu; vzorkuje se zpětně."""
    with np.errstate(all='ignore'):
        Hi = np.linalg.inv(H)
        u, v = np.meshgrid(np.arange(W) + ox + 0.5, np.arange(Hgt) + oy + 0.5)
        d = np.stack([u, v, np.ones_like(u)], axis=-1) @ Hi.T
        x = d[..., 0] / d[..., 2]
        y = d[..., 1] / d[..., 2]
    h, w = a.shape[:2]
    x = np.nan_to_num(x, nan=-1e9, posinf=-1e9, neginf=-1e9)
    y = np.nan_to_num(y, nan=-1e9, posinf=-1e9, neginf=-1e9)
    mimo = (x < 0) | (x > w - 1) | (y < 0) | (y > h - 1)
    x0 = np.clip(np.floor(x), 0, w - 2).astype(np.int64)
    y0 = np.clip(np.floor(y), 0, h - 2).astype(np.int64)
    fx = np.clip(x - x0, 0, 1)[..., None]
    fy = np.clip(y - y0, 0, 1)[..., None]
    out = ((a[y0, x0] * (1 - fx) + a[y0, x0 + 1] * fx) * (1 - fy)
           + (a[y0 + 1, x0] * (1 - fx) + a[y0 + 1, x0 + 1] * fx) * fy)
    return out, mimo


def rovina_z_horizontu(jmeno, f, horizont, sklon, kotva):
    """Vodorovná rovina: normálu dá úběžnice, směry úběžník prken a ohnisko."""
    a = nacti(jmeno)
    H, W = a.shape[:2]
    K = np.array([[f, 0, W / 2.0], [0, f, H / 2.0], [0, 0, 1]])
    Ki = np.linalg.inv(K)
    vpu = np.array([1.0, sklon, 0.0])
    n = K.T @ np.cross(vpu, np.array([W / 2.0, horizont, 1.0]))
    n /= np.linalg.norm(n)
    r0 = Ki @ np.array([kotva[0], kotva[1], 1.0])
    if np.dot(n, r0) < 0:
        n = -n
    du = Ki @ vpu
    du -= n * np.dot(du, n)
    du /= np.linalg.norm(du)
    dv = np.cross(n, du)
    dv /= np.linalg.norm(dv)
    if dv[2] < 0:
        dv = -dv
    return a, K, n, du, dv, r0


def rekt_rovina(a, K, n, du, dv, r0, vyska, pxm, W, Hgt, ox, oy):
    t = (vyska / np.dot(n, r0)) * r0
    Hm = K @ np.stack([du / pxm, dv / pxm, t], axis=1)
    return vzorkuj(a, np.linalg.inv(Hm), W, Hgt, ox=ox, oy=oy)


def srovnej_svetlo(a, sigma, sila=0.96):
    """Vydělí obraz vlastním rozostřením: zmizí přechody osvitu, kresba zůstane."""
    n = rozostri(a, sigma)
    p = a.reshape(-1, 3).mean(axis=0)
    return np.clip(a * (1 - sila) + np.clip(a / np.maximum(n, 1e-3) * p, 0, 1) * sila, 0, 1)


def lesk(a):
    """Dichromatický model: odlesk je bílý přídavek nad vlastní barvou povrchu."""
    R = a[..., 0]
    rv, Gv, Bv = R.ravel(), a[..., 1].ravel(), a[..., 2].ravel()
    hr = np.linspace(0.10, 1.05, 20)
    xs, ys, zs = [], [], []
    for i in range(len(hr) - 1):
        m = (rv >= hr[i]) & (rv < hr[i + 1])
        if m.sum() > 300:
            xs.append((hr[i] + hr[i + 1]) / 2)
            ys.append(np.percentile(Bv[m], 12))
            zs.append(np.percentile(Gv[m], 12))
    s = np.minimum(np.maximum(0, a[..., 2] - np.interp(R, xs, ys)),
                   np.maximum(0, a[..., 1] - np.interp(R, xs, zs)) * 1.5)
    return np.clip(s, 0, 0.45)


def zaplatuj(c, m, pxm, posuny):
    """Zakrytá místa doplní z čisté plochy stejné stěny; vodorovné posuny jsou
    celé násobky rozteče prken, aby kresba navazovala."""
    for dx, dy in posuny:
        if not m.any():
            break
        px, py = int(dx * pxm), int(dy * pxm)
        z = np.roll(np.roll(c, px, axis=1), py, axis=0)
        mz = np.roll(np.roll(m, px, axis=1), py, axis=0)
        ber = m & (~mz)
        if not ber.any():
            continue
        w = np.asarray(Image.fromarray((ber * 255).astype(np.uint8))
                       .filter(ImageFilter.GaussianBlur(13)), dtype=np.float32)[..., None] / 255.
        w = np.clip(w * 1.6, 0, 1) * ber[..., None]
        c = c * (1 - w) + z * w
        m = m & ~ber
    if m.any():
        c[m] = np.median(c.reshape(-1, 3), axis=0)
    return c


def odstran_smetky(a, k, prah):
    """Ojedinělé pixely mimo místní medián (zbytky odrazů ve skle) nahradí okolím."""
    med = np.stack([np.asarray(Image.fromarray((a[..., i] * 255).astype(np.uint8))
                               .filter(ImageFilter.MedianFilter(k)), dtype=np.float32) / 255.
                    for i in range(3)], axis=-1)
    d = np.abs(a - med).sum(axis=2)
    m = dilatuj(d > prah, 3)[..., None]
    return a * (1 - m) + med * m


def dlazditelne_x(a, pas):
    """Prolne pravý pás s levým okrajem. Nezrcadlí — zrcadlení udělá z kresby šrafuru."""
    h, w = a.shape[:2]
    out = a.copy()
    t = (np.linspace(0, 1, pas) ** 1.4).reshape(1, pas, 1)
    out[:, w - pas:] = a[:, w - pas:] * (1 - t) + a[:, :pas] * t
    return out


def dlazditelne_y(a, pas):
    return np.transpose(dlazditelne_x(np.transpose(a, (1, 0, 2)), pas), (1, 0, 2))


def sum(h, w, meritko, seed):
    rng = np.random.default_rng(seed)
    gh, gw = max(2, int(h / meritko)), max(2, int(w / meritko))
    g = rng.random((gh, gw))
    g = np.vstack([g, g[:1]])
    g = np.hstack([g, g[:, :1]])
    yi = np.linspace(0, gh, h, endpoint=False)
    xi = np.linspace(0, gw, w, endpoint=False)
    y0, x0 = yi.astype(int), xi.astype(int)
    fy = (yi - y0).reshape(h, 1)
    fx = (xi - x0).reshape(1, w)
    a = g[np.ix_(y0, x0)]; b = g[np.ix_(y0, x0 + 1)]
    c = g[np.ix_(y0 + 1, x0)]; d = g[np.ix_(y0 + 1, x0 + 1)]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def vyhlad(v, sigma):
    if sigma <= 0:
        return v
    return np.asarray(Image.fromarray((np.clip(v, 0, 1) * 255).astype(np.uint8))
                      .filter(ImageFilter.GaussianBlur(sigma)), dtype=np.float32) / 255.


def normalova(vyska, sila=2.0, wrap=(True, True)):
    m = 'wrap' if wrap[0] else 'edge'
    n = 'wrap' if wrap[1] else 'edge'
    p = np.pad(vyska, ((1, 1), (0, 0)), mode=n)
    p = np.pad(p, ((0, 0), (1, 1)), mode=m)
    dx = (p[1:-1, 2:] - p[1:-1, :-2]) * 0.5 * sila
    dy = (p[2:, 1:-1] - p[:-2, 1:-1]) * 0.5 * sila
    nx, ny, nz = -dx, -dy, np.ones_like(dx)
    d = np.sqrt(nx * nx + ny * ny + nz * nz)
    return np.clip(np.stack([nx / d, ny / d, nz / d], axis=-1) * 0.5 + 0.5, 0, 1)


def uloz(a, jmeno, kvalita=88):
    cesta = os.path.join(CIL, jmeno.rsplit('.', 1)[0] + '.webp')
    obraz(a).save(cesta, format='WEBP', quality=kvalita, method=6)
    print('  %-22s %dx%d  %d kB' % (os.path.basename(cesta), a.shape[1], a.shape[0],
                                    os.path.getsize(cesta) // 1024))


def zmensi(a, W, H):
    return np.asarray(obraz(a).resize((W, H), Image.LANCZOS), dtype=np.float32) / 255.


OKNO_W, OKNO_H = 0.539, 0.560
PLANKA = 0.220
FAS_PXM = 900.0
FAS_OKNO = [(3352.2, 1464.3), (3829.9, 1477.5), (3829.0, 1980.2), (3330.9, 1975.6)]
FAS_BILA = np.array([0.94994, 1.00057, 1.04949])


def rekt_zadni_stena():
    """Zadní stěna z IMG_2285 v kolmém pohledu; počátek levý horní roh malého okna,
    jednotka metr. Bílá se bere z větrací růžice na téže stěně."""
    a = nacti('IMG_2285.JPG')
    w, h = OKNO_W * FAS_PXM, OKNO_H * FAS_PXM
    H = homografie(FAS_OKNO, [(0, 0), (w, 0), (w, h), (0, h)])
    o, mimo = vzorkuj(a, H, 6600, 3400, ox=-3100, oy=-1300)
    o[mimo] = 0
    return np.clip(o / FAS_BILA, 0, 1.2)


def fasada():
    print('fasáda')
    P = FAS_PXM
    stena = rekt_zadni_stena()
    s = lesk(stena)
    stena = np.clip(stena - s[..., None], 0, 1)

    mx, mn = stena.max(axis=2), stena.min(axis=2)
    je_drevo = ((mx > 0.16) & ((mx - mn) / np.maximum(mx, 1e-3) > 0.22)
                & (stena[..., 0] > stena[..., 1] * 1.25) & (stena[..., 1] > stena[..., 2]))
    spatne = dilatuj(~je_drevo | (s > 0.050) | (mx > 0.985), 17)

    def vyrez(A, x0, x1, y0, y1):
        return A[int(y0 * P + 1300):int(y1 * P + 1300),
                 int(x0 * P + 3100):int(x1 * P + 3100)].copy()

    X0, X1, Y0, Y1 = -0.578, 1.198, -0.03, 1.90
    c = vyrez(stena, X0, X1, Y0, Y1)
    m = vyrez(spatne, X0, X1, Y0, Y1)
    print('  zakryto oknem, růžicí a odlesky: %.1f %%' % (100 * m.mean()))

    krok = int(round(PLANKA * P))
    podil = m.mean(axis=0)
    W = c.shape[1]
    nahrada = np.arange(W)
    for x in np.where(podil > 0.035)[0]:
        nej = None
        for k in (3, -3, 4, -4, 5, -5, 6, -6, 2, -2):
            z = x + k * krok
            if 0 <= z < W and podil[z] < 0.5 * podil[x] and (nej is None or podil[z] < nej[0]):
                nej = (podil[z], z)
        if nej:
            nahrada[x] = nej[1]
    zmen = nahrada != np.arange(W)
    print('  celé sloupce nahrazeny: %.1f %% šířky' % (100 * zmen.mean()))
    c = c[:, nahrada]
    m = m[:, nahrada]
    c = zaplatuj(c, m, P, [(0, 0.72), (0, -0.72), (0, 1.22), (0, -1.22), (0, 0.40), (0, -0.40)])
    c = srovnej_svetlo(c, 180, 0.96)
    c = odstran_smetky(c, 9, 0.15)

    sirka = int(round(PANEL_W * P))
    kraj = int(0.03 * P)
    volno = max(1, c.shape[1] - sirka - 2 * kraj)
    nej = None
    for off in range(0, volno, 3):
        w = c[:, kraj + off:kraj + off + sirka]
        r = float(np.abs(w[:, :10].mean(axis=1) - w[:, -10:].mean(axis=1)).mean())
        r += float(zmen[kraj + off:kraj + off + sirka].mean()) * 0.20
        if nej is None or r < nej[0]:
            nej = (r, off)
    o = kraj + nej[1]
    print('  panel vzat od x = %+.3f m' % (X0 + o / P))
    c = c[:, o:o + sirka]

    vysoka = int(round(PANEL_H * P))
    okraj = (c.shape[0] - vysoka) // 2
    c = c[okraj:okraj + vysoka]
    print('  panel %.2f x %.2f m, celý z fotky' % (PANEL_W, PANEL_H))

    TW, TH = 512, int(round(512 * PANEL_H / PANEL_W))
    a = zmensi(c, TW, TH)

    x = np.arange(TW)
    d = np.minimum(x, TW - x) / 4.2
    drazka = np.exp(-d * d)[None, :, None]
    a = np.clip(a * (1 - 0.30 * drazka) - 0.010 * drazka, 0, 1)
    uloz(a, 'fasada.jpg', 88)

    v = vyhlad(jas(a), 0.8)
    v = np.clip((v - v.mean()) / max(1e-4, v.std()) * 0.13 + 0.5, 0, 1)
    v = v * 0.55 + (1.0 - drazka[:, :, 0]) * 0.45
    uloz(normalova(v, sila=3.0, wrap=(True, True)), 'fasada_n.jpg', 76)

    g = jas(a)
    g = (g - g.mean()) * 1.05 + g.mean()
    for jm, zaklad, rozpeti in (('fasada-seda.jpg', np.array([0.455, 0.448, 0.437]), 0.30),
                                ('fasada-cerna.jpg', np.array([0.142, 0.143, 0.146]), 0.19)):
        t = np.clip((g - g.mean()) / 0.16, -1.2, 1.2)[:, :, None]
        b = np.clip(zaklad[None, None, :] * (1.0 + t * rozpeti), 0, 1)
        b = np.clip(b * (1 - 0.34 * drazka), 0, 1)
        uloz(b, jm, 88)


DECK_F, DECK_HORIZONT, DECK_SKLON = 3136.0, 2330.0, -0.07621
DECK_KOTVA = (4032.0, 4400.0)
DECK_PXM = 520.0


def rekt_terasa():
    """Podlaha terasy z IMG_2277 v pohledu shora. Výška fotoaparátu nad podlahou
    se dopočítá tak, aby rozteč prken vyšla na 0,148 m."""
    a, K, n, du, dv, r0 = rovina_z_horizontu('IMG_2277.JPG', DECK_F, DECK_HORIZONT,
                                             DECK_SKLON, DECK_KOTVA)

    def rozteč(vyska, pxm=400.0):
        o, mimo = rekt_rovina(a, K, n, du, dv, r0, vyska, pxm, 1600, 900, -800, -50)
        o[mimo] = 0
        col = jas(o)[:, 700:900].mean(axis=1)
        d = col - np.convolve(col, np.ones(31) / 31, mode='same')
        s = d.std()
        sp = [i for i in range(15, len(d) - 15) if d[i] < -0.85 * s and d[i] == d[i - 8:i + 8].min()]
        r = np.diff(sp)
        return np.median(r[(r > 30) & (r < 200)]) / pxm

    vyska = 1.45 * PRKNO / rozteč(1.45)
    o, mimo = rekt_rovina(a, K, n, du, dv, r0, vyska, DECK_PXM, 2600, 1500, -1300, -120)
    o[mimo] = 0
    print('  fotoaparát %.3f m nad podlahou, rozteč po rektifikaci %.4f m'
          % (vyska, rozteč(vyska)))
    return o


def rozteče(c, pxm):
    col = jas(c)[:, 40:-40].mean(axis=1)
    d = col - np.convolve(col, np.ones(31) / 31, mode='same')
    sp = [i for i in range(12, len(d) - 12) if d[i] < -0.45 * d.std() and d[i] == d[i - 8:i + 8].min()]
    r = np.diff(sp)
    r = r[(r > 0.6 * PRKNO * pxm) & (r < 1.6 * PRKNO * pxm)]
    return sp, float(np.median(r))


def prkna():
    print('prkna')
    P = DECK_PXM
    c = rekt_terasa()[95:910, 1055:1720]
    s = lesk(c)
    c = np.clip(c - s[..., None] * 0.75, 0, 1)
    c = srovnej_svetlo(c, 260, 0.94)

    _, mer = rozteče(c, P)
    oprava = PRKNO * P / mer
    print('  rozteč ve výřezu %.1f px -> doměřítko %.4f' % (mer, oprava))
    c = zmensi(c, int(round(c.shape[1] * oprava)), int(round(c.shape[0] * oprava)))
    spary, mer = rozteče(c, P)
    print('  po opravě %.1f px = %.4f m' % (mer, mer / P))

    krok = PRKNO * P
    strana = int(round(DLAZDICE_PRKEN * krok))
    zacatek = next(sp for sp in spary if sp + strana < c.shape[0] - 2)
    x0 = max(0, (c.shape[1] - strana) // 2)
    c = c[zacatek:zacatek + strana, x0:x0 + strana]
    print('  dlaždice %dx%d px = %.3f m (%d prken)' % (c.shape[1], c.shape[0], strana / P, DLAZDICE_PRKEN))

    c = dlazditelne_x(c, int(0.30 * P))
    c = np.transpose(c, (1, 0, 2))[::-1]

    W = 512
    a = zmensi(c, W, W)
    uloz(a, 'prkna.jpg', 92)

    v = vyhlad(jas(a), 0.7)
    v = (v - np.percentile(v, 2)) / max(1e-4, np.percentile(v, 98) - np.percentile(v, 2))
    v = np.clip(v, 0, 1) ** 1.2
    uloz(normalova(v, sila=3.0), 'prkna_n.jpg', 78)


def sedy_svet(a, sila=1.0):
    """Šedý svět: pro opravdu šedý povrch je to správné vyvážení bílé."""
    p = a.reshape(-1, 3).mean(axis=0)
    return np.clip(a * (1.0 + (p.mean() / np.maximum(p, 1e-4) - 1.0) * sila), 0, 1)


def na_odstin(a, cil, sila=1.0):
    p = a.reshape(-1, 3).mean(axis=0)
    return np.clip(a * (1.0 + (np.array(cil) / np.maximum(p, 1e-4) - 1.0) * sila), 0, 1)


def podhled():
    """Krémový podhledový plech s jemným strukturním reliéfem (IMG_2300).
    Měřítko odečtené ze stěny v téže fotce (rozteč kresby prken 0,220 m dává
    ~1250 px/m), dlaždice tedy 0,66 m — v flexi-3d.js sedí PODHLED_DLAZ."""
    print('podhled')
    c = nacti('IMG_2300.JPG')[330:1160, 950:1780]
    c = np.clip(c - lesk(c)[..., None] * 0.5, 0, 1)
    c = srovnej_svetlo(c, 200, 0.98)
    c = na_odstin(c, [0.845, 0.826, 0.784], 1.0)
    c = dlazditelne_x(c, 110)
    c = dlazditelne_y(c, 110)
    a = zmensi(c, 256, 256)
    uloz(a, 'podhled.jpg', 90)
    v = vyhlad(jas(a), 0.6)
    v = (v - v.min()) / max(1e-4, v.max() - v.min())
    uloz(normalova(v, sila=1.6), 'podhled_n.jpg', 80)


def ram():
    """Ocelový rám, prášková antracitová barva; matný kus nosníku z IMG_2299."""
    print('rám')
    c = nacti('IMG_2299.JPG')[900:1650, 150:900]
    c = srovnej_svetlo(c, 90, 0.98)
    c = na_odstin(c, [0.152, 0.161, 0.170], 1.0)
    c = dlazditelne_x(c, 100)
    c = dlazditelne_y(c, 100)
    a = zmensi(c, 256, 256)
    uloz(a, 'ram.jpg', 92)
    v = vyhlad(jas(a), 2.2)
    v = (v - v.min()) / max(1e-4, v.max() - v.min())
    uloz(normalova(v, sila=0.7), 'ram_n.jpg', 80)


def strecha():
    """Střešní plech (DJI_0178). Šedá je neutrální, takže šedý svět je namístě.
    Svar pásu se dokresluje na okraj dlaždice, ve výřezu žádný není."""
    print('střecha')
    c = nacti('DJI_20260823190241_0178_D.JPG')[1500:2660, 3200:4360]
    c = np.clip(c - lesk(c)[..., None] * 0.6, 0, 1)
    c = srovnej_svetlo(c, 130, 0.98)
    c = sedy_svet(c, 1.0)
    c = na_odstin(c, [0.272, 0.278, 0.288], 0.85)
    c = dlazditelne_x(c, 130)
    c = dlazditelne_y(c, 130)
    a = zmensi(c, 384, 384)

    y = np.arange(384)
    d = np.minimum(y, 384 - y) / 2.6
    svar = np.exp(-d * d)[:, None, None]
    a = np.clip(a * (1 - 0.30 * svar) + 0.024 * svar, 0, 1)
    uloz(a, 'strecha.jpg', 90)

    v = jas(a)
    v = np.clip(0.55 + (v - v.mean()) * 1.4, 0, 1)
    uloz(normalova(v, sila=1.2), 'strecha_n.jpg', 90)


if __name__ == '__main__':
    fasada()
    prkna()
    strecha()
    podhled()
    ram()
    print('hotovo →', CIL)
