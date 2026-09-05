import sys,re,json,html,subprocess,os,math
import numpy as np
from PIL import Image

CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:4620/_audit/c.html"
TMP="/Users/tomastylich/Desktop/Projekty/fh-vzor/_audit/tmp"
os.makedirs(TMP,exist_ok=True)

def chrome(url, shot=None, winw=1700, winh=1000):
    args=[CH,"--headless=new","--disable-gpu","--no-sandbox","--hide-scrollbars",
          "--force-device-scale-factor=1",
          "--virtual-time-budget=9000","--window-size=%d,%d"%(winw,winh)]
    if shot: args.append("--screenshot="+shot)
    else: args.append("--dump-dom")
    args.append(url)
    r=subprocess.run(args,capture_output=True,text=True)
    return r.stdout

def getjson(page,w,h,y):
    url="%s?p=%s&w=%d&h=%d&y=%d&hide=0"%(BASE,page,w,h,y)
    d=chrome(url,winw=max(w+40,900),winh=h+40)
    m=re.search(r'<pre id="out"[^>]*>(.*?)</pre>',d,re.S)
    return json.loads(html.unescape(m.group(1)))

def shot(page,w,h,y,path):
    url="%s?p=%s&w=%d&h=%d&y=%d&hide=1"%(BASE,page,w,h,y)
    chrome(url,shot=path,winw=max(w+40,900),winh=h)
    return Image.open(path).convert("RGB")

def lin(c):
    c=c/255.0
    return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)

def lum(rgb):
    r,g,b=lin(np.array(rgb,dtype=float))
    return 0.2126*r+0.7152*g+0.0722*b

def parsecol(s):
    m=re.match(r'rgba?\(([^)]+)\)',s)
    v=[float(x) for x in m.group(1).replace('/',',').split(',')]
    if len(v)==3: v.append(1.0)
    return v

def contrast(l1,l2):
    a,b=max(l1,l2),min(l1,l2)
    return (a+0.05)/(b+0.05)

pages=sys.argv[1:] or ["rozkladaci-dum.html"]
VW=390; VH=900
for page in pages:
    print("########", page, "@", VW)
    y=0
    maxY=None
    worst=[]
    while True:
        j=getjson(page,VW,VH,y)
        if maxY is None: maxY=j['maxY']
        img=shot(page,VW,VH,y,os.path.join(TMP,"s.png"))
        a=np.asarray(img)[:VH,:VW,:]
        for it in j['items']:
            x0=max(0,it['x']); y0=max(0,it['y'])
            x1=min(VW,it['x']+it['w2']); y1=min(VH,it['y']+it['h2'])
            if x1-x0<3 or y1-y0<3: continue
            reg=a[y0:y1,x0:x1].reshape(-1,3)
            if reg.size==0: continue
            fr,fg,fb,fa=parsecol(it['color'])
            L=lum(reg.T)
            # worst-case background pixel = the one closest in luminance to text
            fl_full=lum([fr,fg,fb])
            # composite text color over each bg pixel if alpha<1
            if fa<1:
                comp=reg*(1-fa)+np.array([fr,fg,fb])*fa
                tl=lum(comp.T)
            else:
                tl=np.full(L.shape,fl_full)
            cr=(np.maximum(tl,L)+0.05)/(np.minimum(tl,L)+0.05)
            i=int(np.argmin(cr))
            # 5th percentile too (ignore antialias outliers)
            p5=float(np.percentile(cr,2))
            worst.append((round(float(cr[i]),2),round(p5,2),it['tag'],it['cls'][:26],round(it['fs'],1),it['fw'],it['txt'],y+it['y'],tuple(int(v) for v in reg[i])))
        if y+VH>=maxY: break
        y+=VH-60
    worst.sort()
    for wv in worst[:22]:
        print("  min=%5.2f p2=%5.2f %-6s %-26s %4.1fpx/%3s bg=%s  %s (y=%d)"%(wv[0],wv[1],wv[2],wv[3],wv[4],wv[5],wv[8],wv[6],wv[7]))
