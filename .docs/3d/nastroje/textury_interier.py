"""Textury interiéru Flexi House.

Zdrojové fotky interiéru nejsou nikde kolmé, takže se tu nerektifikuje přes
homografii jako u fasády. Postup je jiný a je poctivé to říct nahlas:

  podlaha  procedurální prkna v naměřené šířce, kresba dřeva vzorkovaná
           z reálného výřezu IMG_2332; barvy odečtené z fotek
  stena    procedurální, panel je ve skutečnosti skoro bez kresby; má jen
           jemné zvlnění plechu a svislý šev
  mramor   výřez z IMG_2348, měřítko drží změřená šířka sprchy 1,405 m
  deska    výřez z IMG_2353, což je plochý snímek desky shora

Měřítka, která nejsou změřená, jsou dole vypsaná jako ODHAD.
"""

import os
import sys
import numpy as np
from PIL import Image, ImageFilter

ZDE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ZDE)
import textury as T

PRKNO_S = 0.190          # ODHAD, doměřit metrem
PRKNO_D = 1.285          # ODHAD
SPRCHA_W = 1.405         # změřeno z výkresu
DESKA_ZRNO = 0.0005      # ODHAD z rozboru fotek


def vzorek(jmeno, x, y, w, h):
    a = T.nacti(jmeno)
    return a[y:y + h, x:x + w]


def stred_barva(jmeno, x, y, w, h):
    c = vzorek(jmeno, x, y, w, h).reshape(-1, 3)
    return np.median(c, axis=0)


def prumer_y(a, r):
    """Klouzavý průměr po sloupcích. Pracuje i se zápornými hodnotami, což
    T.vyhlad neumí, protože jde přes 8bitový obraz."""
    if r < 1:
        return a
    c = np.cumsum(np.pad(a, ((r + 1, r), (0, 0)), mode='edge'), axis=0)
    n = np.arange(a.shape[0])
    return (c[n + 2 * r + 1] - c[n]) / (2 * r + 1)


def prumer(a, r):
    return prumer_y(prumer_y(a, r).T, r).T


def smer_kresby(a, cy, cx, okno):
    """Úhel, ve kterém v okolí bodu běží kresba. Strukturní tenzor: vlastní
    směr s nejmenší změnou je směr žilek."""
    y0 = max(0, cy - okno), min(a.shape[0], cy + okno)
    x0 = max(0, cx - okno), min(a.shape[1], cx + okno)
    v = a[y0[0]:y0[1], x0[0]:x0[1]]
    gy, gx = np.gradient(v)
    Jxx, Jyy, Jxy = (gx * gx).mean(), (gy * gy).mean(), (gx * gy).mean()
    th = 0.5 * np.arctan2(2 * Jxy, Jxx - Jyy)
    return th + np.pi / 2


def vzorek_podel(a, cy, cx, uhel, w, h, krok_u, krok_v):
    """Výřez orientovaný podle kresby: sloupce jdou podél žilek, řádky napříč.

    Otáčet celý výřez přes PIL nejde použít — bilineární převzorkování samo
    zvýhodňuje některé směry a měření úhlu se po něm rozpadne."""
    du = np.array([np.cos(uhel), np.sin(uhel)]) * krok_u
    dv = np.array([-np.sin(uhel), np.cos(uhel)]) * krok_v
    j = np.arange(w) - w / 2.0
    i = np.arange(h) - h / 2.0
    x = cx + du[0] * j[None, :] + dv[0] * i[:, None]
    y = cy + du[1] * j[None, :] + dv[1] * i[:, None]
    x = np.clip(x, 0, a.shape[1] - 2)
    y = np.clip(y, 0, a.shape[0] - 2)
    x0, y0 = x.astype(np.int64), y.astype(np.int64)
    fx, fy = x - x0, y - y0
    return ((a[y0, x0] * (1 - fx) + a[y0, x0 + 1] * fx) * (1 - fy)
            + (a[y0 + 1, x0] * (1 - fx) + a[y0 + 1, x0 + 1] * fx) * fy)


def podlaha():
    """Prkna v naměřené šířce, kresba z reálného výřezu, barva změřená z fotek.

    Výřez musí být čistá podlaha. Ve verzi z 8/2026 zabíral i stěnu, sokl a
    práh dveří a z těch tvarů vznikly v textuře šikmé šmouhy přes prkna.

    Podlaha je na fotce v perspektivě a prkna na ní běží strmě, kolem 66° od
    vodorovné. Vzorek se proto nebere jako obdélník z obrázku, ale odebírá se
    podél naměřeného směru kresby (smer_kresby, vzorek_podel). Když se bral
    naležato, ležely žilky napříč prknem a podlaha vypadala jako pomačkaný
    papír.

    Podél prkna se vzorkuje s krokem 0,55 px, kresba je tím podél prkna delší.
    Skutečné měřítko fotky se neví, výřez se nerektifikuje."""
    print('podlaha')
    PX = 620.0
    SIRKA_KS, DELKA_KS = 6, 2
    w = int(round(PRKNO_D * PX))
    h = int(round(PRKNO_S * PX))
    KROK_U, KROK_V = 0.55, 1.0
    rng = np.random.default_rng(11)

    zaklad = np.array([0.569, 0.443, 0.324], np.float32)

    zdroj = T.nacti('IMG_2332.jpg')[6350:7950, 300:4250]
    zdroj = T.srovnej_svetlo(zdroj, 60, 0.99)
    kres = T.jas(zdroj)
    kres = (kres - kres.mean()) / max(1e-4, kres.std())
    kres = np.clip(kres, -2.4, 2.4)

    okraj = int(w * KROK_U / 2 + h * KROK_V / 2) + 10
    ymin, ymax = okraj, kres.shape[0] - okraj
    xmin, xmax = okraj, kres.shape[1] - okraj

    dlazd = np.zeros((h * SIRKA_KS, w * DELKA_KS, 3), np.float32)
    relief = np.zeros((h * SIRKA_KS, w * DELKA_KS), np.float32)
    uhly = []
    for r in range(SIRKA_KS):
        posun = int(w * ((0.5 * r) % 1.0))
        for c in range(-1, DELKA_KS + 1):
            x = c * w - posun
            if x >= w * DELKA_KS or x + w <= 0:
                continue
            cy = int(rng.integers(ymin, ymax))
            cx = int(rng.integers(xmin, xmax))
            uhel = smer_kresby(kres, cy, cx, 190)
            uhly.append(np.degrees(uhel))
            k = vzorek_podel(kres, cy, cx, uhel, w, h, KROK_U, KROK_V)
            k = k - prumer(k, h // 3)
            tep = 1.0 + rng.normal(0, 0.008)
            svit = 1.0 + rng.normal(0, 0.012)
            prkno = np.clip(zaklad[None, None, :] * tep * svit
                            * (1.0 + k[..., None] * 0.080), 0, 1)
            prkno[:2] *= 0.74
            prkno[:, :2] *= 0.84
            # reliéf nese hlavně zkosení spár, kresba je ve vinylu jen naznačená
            rel = np.clip(0.80 + k * 0.07, 0, 1)
            rel[:3] = 0.10
            rel[3:6] = 0.52
            rel[:, :3] = 0.26
            rel[:, 3:6] = 0.62
            xa, xb = max(0, x), min(w * DELKA_KS, x + w)
            dlazd[r * h:(r + 1) * h, xa:xb] = prkno[:, xa - x:xb - x]
            relief[r * h:(r + 1) * h, xa:xb] = rel[:, xa - x:xb - x]

    dlazd = T.dlazditelne_x(dlazd, 6)
    dlazd = T.dlazditelne_y(dlazd, 5)
    relief = T.dlazditelne_x(relief[..., None], 6)[..., 0]
    relief = T.dlazditelne_y(relief[..., None], 5)[..., 0]
    # prkna beží podél hloubky domu, v textuře tedy musí být svisle
    dlazd = np.transpose(dlazd, (1, 0, 2))[::-1]
    relief = np.transpose(relief)[::-1]
    a = T.zmensi(dlazd, 1024, 1024)
    T.uloz(a, 'podlaha.jpg', 91)
    v = T.vyhlad(T.zmensi(np.repeat(relief[..., None], 3, axis=2), 1024, 1024)[..., 0], 1.1)
    T.uloz(T.normalova(v, sila=1.35), 'podlaha_n.jpg', 78)
    print('  prkno %.3f x %.3f m, dlaždice u=%.2f v=%.2f m'
          % (PRKNO_S, PRKNO_D, PRKNO_S * SIRKA_KS, PRKNO_D * DELKA_KS))
    print('  směr kresby ve výřezu %.0f až %.0f°' % (min(uhly), max(uhly)))


def stena():
    """Sendvičový panel. Kresbu skoro nemá, ale úplně plochá barva vypadá
    jako plast. Textura proto nese jen zvlnění tenkého plechu (oil canning)
    a svislé tupé švy."""
    print('stena')
    N = 512
    SEV = 1.00
    barva = stred_barva('IMG_2336.jpg', 2400, 4900, 700, 700)
    barva = barva / max(1e-4, T.jas(barva[None, None, :])[0, 0]) * 0.745

    zvln = (T.sum(N, N, 128, 3) - 0.5) * 1.00
    zvln += (T.sum(N, N, 44, 11) - 0.5) * 0.55
    zvln += (T.sum(N, N, 15, 23) - 0.5) * 0.22
    zvln = T.vyhlad(zvln, 1.2)

    x = np.linspace(0, 1, N, endpoint=False).reshape(1, -1)
    sev = np.clip(1.0 - np.abs(((x + 0.5) % 1.0) - 0.5) / (0.0016), 0, 1)
    sev = sev * np.ones((N, 1), np.float32)
    lem = np.clip(1.0 - np.abs(((x + 0.5) % 1.0) - 0.5) / (0.010), 0, 1) * 0.35

    a = barva[None, None, :] * (1.0 + zvln[..., None] * 0.085)
    a = a * (1.0 - sev[..., None] * 0.30) * (1.0 + lem[..., None] * 0.035)
    a = np.clip(a, 0, 1)
    a = T.dlazditelne_y(a, 30)
    T.uloz(a, 'stena-in.jpg', 92)

    v = zvln - zvln.min()
    v = v / max(1e-4, v.max())
    v = np.clip(v - sev * 0.45, 0, 1)
    T.uloz(T.normalova(v, sila=1.15), 'stena-in_n.jpg', 78)
    print('  barva %s, šev po %.2f m' % (np.round(barva, 3), SEV))


def mramor():
    """Obklad koupelny. Reálný panel je skoro bílý s řídkými tenkými šedými
    žilkami, takže výřez z fotky by do textury zapekl hlavně odlesky a rohy.
    Kresba je proto procedurální, barvy jsou změřené z IMG_2347 a IMG_2344."""
    print('mramor')
    N = 1024
    a = T.nacti('IMG_2347.jpg')[1800:5200, 3300:4200]
    a = np.clip(a - T.lesk(a)[..., None] * 0.6, 0, 1)
    zaklad = np.percentile(a.reshape(-1, 3), 55, axis=0)
    zaklad = np.array([0.906, 0.913, 0.919], np.float32)
    zilka = np.array([0.735, 0.752, 0.768], np.float32)

    rng = np.random.default_rng(21)
    pole = np.zeros((N, N), np.float32)
    for meritko, vaha in ((240.0, 1.0), (110.0, 0.55), (52.0, 0.28), (24.0, 0.14)):
        pole += (T.sum(N, N, meritko, int(meritko)) - 0.5) * vaha
    yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
    smer = (xx * 0.72 + yy * 0.69) / N
    pole = pole * 1.7 + smer * 4.0

    # Samotné tenké čáry vypadaly jako čmáranice propiskou. Žilka proto má
    # jádro, kolem něj široký měkký lem a po délce se ztrácí a zase objevuje.
    hreben = np.abs(pole - np.round(pole))
    jadro = np.clip(1.0 - hreben / 0.011, 0, 1) ** 2.0
    lem = np.clip(1.0 - hreben / 0.070, 0, 1) ** 1.7
    jemne = np.clip(1.0 - np.abs((pole * 3.4) - np.round(pole * 3.4)) / 0.009, 0, 1) ** 2.8
    sila = np.clip(0.25 + (T.sum(N, N, 95, 7) - 0.5) * 2.4, 0, 1)
    v = np.clip((jadro * 0.80 + jemne * 0.30) * sila + lem * 0.30 * sila, 0, 1)
    v = T.vyhlad(v, 1.1)
    mrak = (T.sum(N, N, 150, 5) - 0.5) * 0.030

    c = zaklad[None, None, :] * (1.0 + mrak[..., None])
    c = c * (1.0 - v[..., None]) + zilka[None, None, :] * v[..., None]
    c = np.clip(c, 0, 1)
    c = T.dlazditelne_x(c, 40)
    c = T.dlazditelne_y(c, 40)
    T.uloz(c, 'mramor.jpg', 92)
    print('  dlaždice %.3f m, základ %s, podíl žilek %.1f %%'
          % (SPRCHA_W, np.round(zaklad, 3), 100 * (v > 0.25).mean()))


def deska():
    print('deska')
    a = T.nacti('IMG_2353.jpg')
    c = a[300:2000, 700:3400]
    c = np.clip(c - T.lesk(c)[..., None] * 0.6, 0, 1)
    c = T.srovnej_svetlo(c, 240, 0.96)
    N = 512
    c = T.zmensi(c, N, N)
    c = T.dlazditelne_x(c, 44)
    c = T.dlazditelne_y(c, 44)
    T.uloz(c, 'deska.jpg', 90)
    print('  zrno %.4f m (ODHAD)' % DESKA_ZRNO)


def lamely():
    print('lamely')
    N = 512
    barva = stred_barva('IMG_2349.jpg', 1800, 3000, 800, 800)
    barva = barva / max(1e-4, T.jas(barva[None, None, :])[0, 0]) * 0.855
    y = np.linspace(0, 4 * np.pi * 4, N).reshape(-1, 1)
    drazka = np.clip(np.cos(y) * 0.5 + 0.5, 0, 1) ** 6
    a = np.clip(barva[None, None, :] * (1.0 - drazka[..., None] * 0.16), 0, 1)
    a = np.repeat(a, 1, axis=1) * np.ones((1, N, 1), np.float32)
    T.uloz(a, 'lamely.jpg', 92)
    v = 1.0 - drazka * np.ones((1, N), np.float32)
    T.uloz(T.normalova(v, sila=1.6), 'lamely_n.jpg', 74)
    print('  rozteč drážek %.3f m při dlaždici 0,472 m' % (0.472 / 4))


if __name__ == '__main__':
    podlaha()
    stena()
    lamely()
    mramor()
    deska()
    print('hotovo')
