import sys,re,json,html,subprocess,os
import numpy as np
from PIL import Image
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
BASE="http://localhost:4620/_audit/c.html"
TMP="/Users/tomastylich/Desktop/Projekty/fh-vzor/_audit/tmp"
os.makedirs(TMP,exist_ok=True)
def chrome(url,shot=None,winw=1700,winh=1000):
    a=[CH,"--headless=new","--disable-gpu","--no-sandbox","--hide-scrollbars","--force-device-scale-factor=1",
       "--virtual-time-budget=9000","--window-size=%d,%d"%(winw,winh)]
    a.append("--screenshot="+shot if shot else "--dump-dom"); a.append(url)
    return subprocess.run(a,capture_output=True,text=True).stdout
def lin(c):
    c=np.asarray(c,dtype=float)/255.0
    return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def lum(rgb):
    r,g,b=lin(rgb); return 0.2126*r+0.7152*g+0.0722*b
def parsecol(s):
    v=[float(x) for x in re.match(r'rgba?\(([^)]+)\)',s).group(1).replace('/',',').split(',')]
    if len(v)==3: v.append(1.0)
    return v
VW=int(sys.argv[1]); VH=900
for page in sys.argv[2:]:
    print("########",page,"@",VW)
    y=0; maxY=None; res=[]
    while True:
        u="%s?p=%s&w=%d&h=%d&y=%d"%(BASE,page,VW,VH,y)
        d=chrome(u+"&hide=0",winw=max(VW+40,900),winh=VH+40)
        m=re.search(r'<pre id="out"[^>]*>(.*?)</pre>',d,re.S)
        j=json.loads(html.unescape(m.group(1)))
        if maxY is None: maxY=j['maxY']
        p=os.path.join(TMP,"s.png"); chrome(u+"&hide=1",shot=p,winw=max(VW+40,900),winh=VH)
        A=np.asarray(Image.open(p).convert("RGB"))[:VH,:VW,:]
        for it in j['items']:
            x0=max(0,it['x']+2); yy0=max(0,it['y']+1)
            x1=min(VW,it['x']+it['w2']-2); y1=min(VH,it['y']+it['h2']-1)
            if x1-x0<4 or y1-yy0<4: continue
            reg=A[yy0:y1,x0:x1].reshape(-1,3)
            cols,cnt=np.unique(reg,axis=0,return_counts=True)
            order=np.argsort(-cnt); tot=cnt.sum()
            fr,fg,fb,fa=parsecol(it['color'])
            out=[]
            for k in order[:6]:
                frac=cnt[k]/tot
                if frac<0.08: break
                bg=cols[k].astype(float)
                tc=bg*(1-fa)+np.array([fr,fg,fb])*fa if fa<1 else np.array([fr,fg,fb])
                l1,l2=lum(tc),lum(bg)
                cr=(max(l1,l2)+0.05)/(min(l1,l2)+0.05)
                out.append((round(cr,2),round(frac,2),tuple(int(v) for v in cols[k])))
            if not out: continue
            best=min(out)
            res.append((best[0],best[1],best[2],it['tag'],it['cls'][:24],round(it['fs'],1),it['fw'],it['txt'],j['scrollY']+it['y'],it['color']))
        if j['scrollY']+VH>=maxY-2: break
        ny=y+VH-80
        if ny<=y: break
        y=ny
    seen=set(); n=0
    for r in sorted(res):
        k=(r[3],r[4],r[7])
        if k in seen: continue
        seen.add(k)
        if r[0]>=4.6: continue
        print("  %5.2f:1  frac=%.2f bg=%-16s %-5s %-24s %4.1fpx/%-3s col=%-22s  %s (y=%d)"%(r[0],r[1],str(r[2]),r[3],r[4],r[5],r[6],r[9],r[7],r[8]))
        n+=1
    print("  -- pod 4.6:1:",n,"prvku, celkem merenych:",len(res))
