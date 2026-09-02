# -*- coding: utf-8 -*-
"""Vodorovné fasádní panely s drážkou podle vzorníku. Textura kryje 1,15 x 1,945 m."""
import numpy as np
from PIL import Image

W, Hp = 512, 866
DRAZEK = 10                      # 10 drážek na výšku stěny = rozteč 0,195 m

def nacti(kod):
    return np.asarray(Image.open('img/fasada/%s.webp' % kod).convert('RGB'), dtype=np.float64)/255.0

def jasy(a):
    return a[:,:,0]*0.2126 + a[:,:,1]*0.7152 + a[:,:,2]*0.0722

def profil_drazky(a):
    """Z vzorku vytáhne svislý profil drážky: násobitel jasu po řádcích."""
    r = jasy(a).mean(axis=1)
    stred = int(np.argmin(r))
    plocha = np.median(np.concatenate([r[:max(stred-40,1)], r[min(stred+40,len(r)-1):]]))
    okno = 46
    a0, a1 = max(stred-okno, 0), min(stred+okno, len(r))
    p = r[a0:a1] / max(plocha, 1e-4)
    return np.clip(p, 0.3, 1.25), stred, plocha

def plocha_vzorku(a, stred):
    """Kus panelu bez drážky, roztažený na šířku textury."""
    h = a.shape[0]
    pas = a[:max(stred-46,8)] if stred > h/2 else a[min(stred+46,h-8):]
    if pas.shape[0] < 20: pas = a[:20]
    im = Image.fromarray((np.clip(pas,0,1)*255+0.5).astype(np.uint8)).resize((W, max(int(pas.shape[0]*W/a.shape[1]),16)), Image.LANCZOS)
    return np.asarray(im, dtype=np.float64)/255.0

def vodorovne_dlazditelne(a, pas=60):
    """Levý a right okraj se přelije, aby textura navazovala po šířce."""
    out = a.copy()
    k = np.linspace(0, 1, pas)[None, :, None]
    out[:, :pas] = a[:, :pas]*k + a[:, -pas:][:, ::-1]*(1-k)
    return out

def sum_pole(h, w, seed, meritko=3.0):
    rng = np.random.default_rng(seed)
    maly = rng.normal(0, 1, (max(int(h/meritko),2), max(int(w/meritko),2)))
    im = Image.fromarray(((maly-maly.min())/(maly.max()-maly.min())*255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    n = np.asarray(im, dtype=np.float64)/255.0
    return (n - n.mean())

def textura(kod, seed=7):
    a = nacti(kod)
    p, stred, plocha = profil_drazky(a)
    pas = plocha_vzorku(a, stred)
    perioda = Hp / DRAZEK

    # plocha panelu: pás vzorku dlážděný svisle s překryvem
    kusu = int(np.ceil(Hp / pas.shape[0])) + 1
    telo = np.concatenate([pas]*kusu, axis=0)[:Hp]
    telo = telo + sum_pole(Hp, W, seed, 2.5)[:,:,None]*0.012

    # drážka: profil ze vzorku vložený na konec každé periody
    nasob = np.ones(Hp)
    pd = len(p)
    x = np.linspace(0, pd-1, max(int(perioda*0.55), 8))
    pmini = np.interp(x, np.arange(pd), p)
    for i in range(DRAZEK):
        y0 = int(round((i+1)*perioda - len(pmini)))
        y1 = y0 + len(pmini)
        if y0 < 0: continue
        nasob[y0:min(y1,Hp)] = pmini[:min(y1,Hp)-y0]

    out = telo * nasob[:,None,None]

    # svislá spára mezi panely na okrajích dlaždice
    okraj = np.ones(W)
    okraj[:3] *= 0.82; okraj[-3:] *= 0.82
    okraj[3:7] *= 0.94; okraj[-7:-3] *= 0.94
    out = out * okraj[None,:,None]
    out = vodorovne_dlazditelne(out, 48)
    return np.clip(out, 0, 1), nasob

def normalova(vyska, sila=2.0):
    p = np.pad(vyska, ((1,1),(0,0)), mode='edge')
    p = np.pad(p, ((0,0),(1,1)), mode='wrap')
    dx = (p[1:-1, 2:] - p[1:-1, :-2])*0.5*sila
    dy = (p[2:, 1:-1] - p[:-2, 1:-1])*0.5*sila
    nx, ny, nz = -dx, -dy, np.ones_like(dx)
    d = np.sqrt(nx*nx + ny*ny + nz*nz)
    return np.clip(np.stack([nx/d, ny/d, nz/d], axis=-1)*0.5+0.5, 0, 1)

KODY = ['pz-101','pz-102','pz-201','tz-202','tz-201','tz-501','tz-504','tz-502','mz-0302','mz-8043','mz-0301']
if __name__ == '__main__':
    import sys
    jen = sys.argv[1:] or KODY
    nas_ref = None
    for i, kod in enumerate(jen):
        obr, nasob = textura(kod, seed=7+i)
        Image.fromarray((obr*255+0.5).astype(np.uint8)).save('assets/tex/fasada-%s.webp' % kod, 'WEBP', quality=84, method=6)
        nas_ref = nasob
        print('fasada-%s.webp' % kod, 'prumer', round(float(obr.mean()),3))
    if nas_ref is not None:
        v = np.repeat(nas_ref[:,None], W, axis=1)
        v = (v - v.min())/max(v.max()-v.min(),1e-4)
        Image.fromarray((normalova(v, sila=2.6)*255+0.5).astype(np.uint8)).save('assets/tex/fasada-h_n.webp','WEBP',quality=86,method=6)
        print('fasada-h_n.webp hotova')
