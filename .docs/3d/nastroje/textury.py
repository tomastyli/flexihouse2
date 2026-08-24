"""Vyrobí textury pro 3D konfigurátor z fotek v podklady-3d/fotky.

    python3 podklady-3d/nastroje/textury.py

Zapisuje do assets/tex/. Každá textura má vedle sebe _n.jpg s normálovou mapou
tam, kde má povrch reliéf.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

ZDE = os.path.dirname(os.path.abspath(__file__))
KOREN = os.path.abspath(os.path.join(ZDE, '..', '..'))
FOTKY = os.path.join(KOREN, 'podklady-3d', 'fotky')
CIL = os.path.join(KOREN, 'assets', 'tex')
os.makedirs(CIL, exist_ok=True)


def nacti(jmeno, vyrez=None):
    im = Image.open(os.path.join(FOTKY, jmeno)).convert('RGB')
    if vyrez:
        im = im.crop(vyrez)
    return im


def pole(im):
    return np.asarray(im, dtype=np.float32) / 255.0


def obraz(a):
    return Image.fromarray(np.clip(a * 255.0, 0, 255).astype(np.uint8))


def rozostri(a, sigma):
    im = obraz(np.clip(a, 0, 1))
    return pole(im.filter(ImageFilter.GaussianBlur(sigma)))


def vyvazeni(a, sila=0.55, cil=None):
    """Fotky jsou ze zapadajícího slunce. Korekce jen částečná, jinak z oranže
    fasády bude šeď."""
    prum = a.reshape(-1, 3).mean(axis=0)
    stred = cil if cil is not None else prum.mean()
    k = stred / np.maximum(prum, 1e-4)
    k = 1.0 + (k - 1.0) * sila
    return np.clip(a * k, 0, 1)


def srovnej_svetlo(a, sigma=None, sila=0.9):
    """Vydělí obraz vlastním silným rozostřením — zmizí velké přechody osvitu,
    kresba zůstane."""
    h, w = a.shape[:2]
    if sigma is None:
        sigma = max(h, w) / 7.0
    nizke = rozostri(a, sigma)
    prum = a.reshape(-1, 3).mean(axis=0)
    srovnane = a / np.maximum(nizke, 1e-3) * prum
    return np.clip(a * (1 - sila) + srovnane * sila, 0, 1)


def dlazditelne_x(a, pas=None):
    """Slepí levý a pravý okraj: pravý pás se prolne s okrajem levým."""
    h, w = a.shape[:2]
    pas = pas or max(8, w // 10)
    out = a.copy()
    levy = a[:, :pas]
    t = np.linspace(0, 1, pas).reshape(1, pas, 1)
    out[:, w - pas:] = a[:, w - pas:] * (1 - t) + levy[:, ::-1] * t
    return out


def dlazditelne_y(a, pas=None):
    return np.transpose(dlazditelne_x(np.transpose(a, (1, 0, 2)), pas), (1, 0, 2))


def jas(a):
    return a[:, :, 0] * 0.299 + a[:, :, 1] * 0.587 + a[:, :, 2] * 0.114


def normalova(vyska, sila=2.0, wrap=(True, True)):
    """Z výškové mapy (0..1) udělá normálovou mapu v tangenciálním prostoru."""
    m = 'wrap' if wrap[0] else 'edge'
    n = 'wrap' if wrap[1] else 'edge'
    p = np.pad(vyska, ((1, 1), (0, 0)), mode=n)
    p = np.pad(p, ((0, 0), (1, 1)), mode=m)
    dx = (p[1:-1, 2:] - p[1:-1, :-2]) * 0.5 * sila
    dy = (p[2:, 1:-1] - p[:-2, 1:-1]) * 0.5 * sila
    nx, ny, nz = -dx, -dy, np.ones_like(dx)
    d = np.sqrt(nx * nx + ny * ny + nz * nz)
    out = np.stack([nx / d, ny / d, nz / d], axis=-1)
    return np.clip(out * 0.5 + 0.5, 0, 1)


def uloz(a, jmeno, kvalita=90):
    """Ukládá do WebP — proti JPEG ušetří zhruba polovinu a web už webp používá."""
    jmeno = jmeno.rsplit('.', 1)[0] + '.webp'
    cesta = os.path.join(CIL, jmeno)
    obraz(a).save(cesta, format='WEBP', quality=kvalita, method=6)
    print('  %-22s %s  %d kB' % (jmeno, '%dx%d' % (a.shape[1], a.shape[0]),
                                 os.path.getsize(cesta) // 1024))


def sum(h, w, meritko, seed):
    """Hodnotový šum s bilineární interpolací, dlaždicovatelný."""
    rng = np.random.default_rng(seed)
    gh, gw = max(2, int(h / meritko)), max(2, int(w / meritko))
    g = rng.random((gh, gw))
    g = np.vstack([g, g[:1]])
    g = np.hstack([g, g[:, :1]])
    yi = np.linspace(0, gh, h, endpoint=False)
    xi = np.linspace(0, gw, w, endpoint=False)
    y0 = yi.astype(int); x0 = xi.astype(int)
    fy = (yi - y0).reshape(h, 1); fx = (xi - x0).reshape(1, w)
    a = g[np.ix_(y0, x0)]; b = g[np.ix_(y0, x0 + 1)]
    c = g[np.ix_(y0 + 1, x0)]; d = g[np.ix_(y0 + 1, x0 + 1)]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def fbm(h, w, meritko, oktavy, seed):
    out = np.zeros((h, w)); amp = 1.0; suma = 0.0
    for i in range(oktavy):
        out += sum(h, w, max(2, meritko / (2 ** i)), seed + i * 97) * amp
        suma += amp; amp *= 0.5
    return out / suma


# --------------------------------------------------------------------------
# fasáda — dřevodekor, jeden panel 1,15 m široký na celou výšku stěny 2,35 m
# --------------------------------------------------------------------------
def fasada():
    print('fasáda')
    # výřez = přesně jeden panel 1,15 x 2,35 m; měřítko odečtené z IMG_2285
    src = nacti('IMG_2289.JPG', (1110, 5200, 2106, 7235))
    W, H = 512, 1024
    a = pole(src.resize((W, H), Image.LANCZOS))
    a = srovnej_svetlo(a, sigma=110, sila=0.92)
    a = vyvazeni(a, sila=0.42)

    # sytost a tón dotáhnout na to, co je vidět na denních snímcích:
    # medová oranž, ne cihla a ne hnědá
    l = jas(a)[:, :, None]
    a = np.clip(l + (a - l) * 1.30, 0, 1)
    a = np.clip(a * np.array([1.045, 0.985, 0.90]), 0, 1)
    a = np.clip((a - 0.5) * 1.13 + 0.5 + 0.052, 0, 1)

    a = dlazditelne_x(a, pas=64)

    # spára mezi panely: na obou svislých okrajích půlka drážky
    x = np.arange(W)
    d = np.minimum(x, W - x) / 5.0
    drazka = np.exp(-d * d)[None, :, None]
    a = np.clip(a * (1 - 0.42 * drazka), 0, 1)

    uloz(a, 'fasada.jpg', 86)

    # reliéf: jemná kresba plechu + drážka
    v = jas(a)
    v = (v - v.min()) / max(1e-4, v.max() - v.min())
    v = v * 0.22 + (1.0 - drazka[:, :, 0]) * 0.78
    uloz(normalova(v, sila=2.6, wrap=(True, False)), 'fasada_n.jpg', 84)

    # šedá a černá varianta: fotky nejsou, tak se přebarví stejná kresba.
    # Kresba se zachová, jen se přemapuje jas na jiný tón.
    g = jas(a)
    g = (g - g.mean()) * 1.05 + g.mean()
    for jm, zaklad, rozpeti in (('fasada-seda.jpg', np.array([0.455, 0.448, 0.437]), 0.30),
                                ('fasada-cerna.jpg', np.array([0.142, 0.143, 0.146]), 0.19)):
        t = np.clip((g - g.mean()) / 0.22, -1.2, 1.2)[:, :, None]
        b = np.clip(zaklad[None, None, :] * (1.0 + t * rozpeti), 0, 1)
        b = np.clip(b * (1 - 0.40 * drazka), 0, 1)
        uloz(b, jm, 86)


# --------------------------------------------------------------------------
# terasová prkna — WPC, rozteč 148 mm, spára 5 mm.
# Kresba se skládá, ne vyřezává: fotky terasy jsou v perspektivě a jakýkoli
# výřez z nich nechá po dlaždicování šrafuru. Barva a rozteč jsou z fotek,
# struktura je natažený šum ve směru prkna.
# --------------------------------------------------------------------------
def prkna():
    print('prkna')
    W, H = 512, 512                 # 1,184 m × 1,184 m
    PRKEN = 8                        # 8 × 148 mm
    zaklad = np.array([0.585, 0.430, 0.305])

    def smer(mapa, delka):
        """Rozmaže mapu podél osy x — vznikne vlas ve směru prkna."""
        out = np.zeros_like(mapa)
        for k in range(-delka, delka + 1):
            out += np.roll(mapa, k, axis=1)
        return out / (2 * delka + 1)

    vlakna = smer(fbm(H, W, 3, 2, 21), 46)
    vlakna = (vlakna - vlakna.mean()) / max(1e-4, vlakna.std())
    stopy = smer(fbm(H, W, 10, 3, 33), 24)
    stopy = (stopy - stopy.mean()) / max(1e-4, stopy.std())
    zrno = fbm(H, W, 2, 1, 44)
    zrno = (zrno - zrno.mean()) / max(1e-4, zrno.std())
    kresba = np.clip(vlakna * 0.115 + stopy * 0.075 + zrno * 0.022, -0.30, 0.30)

    out = np.clip(zaklad[None, None, :] * (1.0 + kresba[:, :, None] * 0.72), 0, 1)
    # tmavší místa jdou do šeda, ne do černa — tak vypadá zvětralé WPC
    l = jas(out)[:, :, None]
    out = np.clip(out + (l - out) * np.clip(-kresba[:, :, None], 0, 1) * 0.30, 0, 1)

    y = np.arange(H)
    fy = (y / H) * PRKEN
    v_prkne = fy - np.floor(fy)
    px = v_prkne * 148.0
    okraj = np.minimum(px, 148.0 - px)
    spara = np.clip(1.0 - okraj / 2.6, 0, 1) ** 1.3
    hrana = np.clip(1.0 - okraj / 11.0, 0, 1)

    rng = np.random.default_rng(7)
    odstin = rng.normal(0, 0.038, PRKEN)
    idx = np.clip(np.floor(fy).astype(int), 0, PRKEN - 1)
    out = np.clip(out * (1.0 + odstin[idx])[:, None, None], 0, 1)
    out = out * (1 - 0.84 * spara[:, None, None])
    out = out * (1 - 0.13 * hrana[:, None, None] ** 2)
    uloz(np.clip(out, 0, 1), 'prkna.jpg', 92)

    v = np.clip(0.5 + kresba * 0.55, 0, 1)
    v = v * (1 - spara[:, None]) * (1 - 0.35 * hrana[:, None] ** 2)
    uloz(normalova(v, sila=3.0), 'prkna_n.jpg', 92)


# --------------------------------------------------------------------------
# střešní fólie — tmavá antracitová, pásy po 1 m se svarem
# --------------------------------------------------------------------------
def strecha():
    print('střecha')
    W, H = 384, 384
    src = nacti('DJI_20260823190241_0178_D.JPG', (4600, 1500, 6200, 2900))
    a = pole(src.resize((W, H), Image.LANCZOS))
    a = srovnej_svetlo(a, sigma=55, sila=0.98)

    l = jas(a)
    l = (l - l.mean()) * 0.75
    zaklad = np.array([0.268, 0.278, 0.292])
    out = np.clip(zaklad[None, None, :] * (1.0 + l[:, :, None] * 1.5), 0, 1)
    out = np.clip(out + (fbm(H, W, 70, 4, 3)[:, :, None] - 0.5) * 0.035, 0, 1)
    out = dlazditelne_x(out, 48)
    out = dlazditelne_y(out, 48)

    # svar pásu na jednom okraji dlaždice
    y = np.arange(H)
    d = np.minimum(y, H - y) / 2.6
    svar = np.exp(-d * d)[:, None, None]
    out = np.clip(out * (1 - 0.34 * svar) + 0.028 * svar, 0, 1)
    uloz(np.clip(out, 0, 1), 'strecha.jpg', 90)

    v = np.clip(0.55 + (jas(out) - jas(out).mean()) * 1.4, 0, 1)
    uloz(normalova(v, sila=1.2), 'strecha_n.jpg', 90)


# --------------------------------------------------------------------------
# podhled terasy — krémový plech s jemnou strukturou
# --------------------------------------------------------------------------
def podhled():
    print('podhled')
    W, H = 256, 256
    zaklad = np.array([0.855, 0.838, 0.800])
    n = fbm(H, W, 55, 4, 11)
    out = np.clip(zaklad[None, None, :] * (1.0 + (n[:, :, None] - 0.5) * 0.085), 0, 1)
    y = np.arange(H).reshape(H, 1)
    vlna = np.sin(y / H * np.pi * 4) * 0.010
    uloz(np.clip(out + vlna[:, :, None], 0, 1), 'podhled.jpg', 90)


# --------------------------------------------------------------------------
# ocelový rám — matná antracitová prášková barva (blízko RAL 7016)
# --------------------------------------------------------------------------
def ram():
    print('rám')
    W, H = 256, 256
    zaklad = np.array([0.150, 0.161, 0.172])
    n = fbm(H, W, 30, 5, 5)
    hruby = fbm(H, W, 5, 2, 9)
    out = zaklad[None, None, :] * (1.0 + (n[:, :, None] - 0.5) * 0.16
                                   + (hruby[:, :, None] - 0.5) * 0.09)
    uloz(np.clip(out, 0, 1), 'ram.jpg', 92)
    v = np.clip(0.5 + (n - 0.5) * 0.5 + (hruby - 0.5) * 0.5, 0, 1)
    uloz(normalova(v, sila=0.9), 'ram_n.jpg', 92)


# --------------------------------------------------------------------------
# betonová patka
# --------------------------------------------------------------------------
def beton():
    print('beton')
    W, H = 256, 256
    zaklad = np.array([0.655, 0.652, 0.638])
    jemne = fbm(H, W, 3, 2, 61)
    kamenivo = fbm(H, W, 14, 3, 71)
    velke = fbm(H, W, 46, 3, 81)
    k = ((jemne - 0.5) * 0.55 + (kamenivo - 0.5) * 0.75 + (velke - 0.5) * 0.35)
    # tmavá zrna kameniva
    tmava = np.clip((kamenivo - 0.66) * 5.0, 0, 1) * 0.22
    out = np.clip(zaklad[None, None, :] * (1.0 + k[:, :, None] * 0.62) - tmava[:, :, None] * 0.35, 0, 1)
    uloz(out, 'beton.jpg', 90)
    v = np.clip(0.5 + k * 0.9 - tmava * 0.8, 0, 1)
    uloz(normalova(v, sila=1.6), 'beton_n.jpg', 90)


if __name__ == '__main__':
    fasada(); prkna(); strecha(); podhled(); ram()
    print('hotovo →', CIL)
