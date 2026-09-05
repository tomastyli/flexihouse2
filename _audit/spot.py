import re,json,html,subprocess,os,sys
import numpy as np
from PIL import Image
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP="/Users/tomastylich/Desktop/Projekty/fh-vzor/_audit/tmp"; os.makedirs(TMP,exist_ok=True)
def chrome(url,shot=None,winw=1700,winh=1000,tmo=40):
    a=[CH,"--headless=new","--disable-gpu","--no-sandbox","--hide-scrollbars","--force-device-scale-factor=1",
       "--virtual-time-budget=6000","--window-size=%d,%d"%(winw,winh)]
    a.append("--screenshot="+shot if shot else "--dump-dom"); a.append(url)
    return subprocess.run(a,capture_output=True,text=True,timeout=tmo).stdout
def lin(c):
    c=np.asarray(c,dtype=float)/255.0
    return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def lum(rgb):
    r,g,b=lin(rgb); return 0.2126*r+0.7152*g+0.0722*b
def pc(s):
    v=[float(x) for x in re.match(r'rgba?\(([^)]+)\)',s).group(1).replace('/',',').split(',')]
    if len(v)==3: v.append(1.0)
    return v
page,VW,VH,Y=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])
base="http://localhost:4620/_audit/c.html?p=%s&w=%d&h=%d&y=%d"%(page,VW,VH,Y)
d=chrome(base+"&hide=0",winw=max(VW+40,900),winh=VH+40)
j=json.loads(html.unescape(re.search(r'<pre id="out"[^>]*>(.*?)</pre>',d,re.S).group(1)))
p=os.path.join(TMP,"spot.png"); chrome(base+"&hide=1",shot=p,winw=max(VW+40,900),winh=VH)
img=Image.open(p).convert("RGB"); img.crop((0,0,VW,VH)).save(os.path.join(TMP,"crop_%s_%d_%d.png"%(page.split('.')[0],VW,Y)))
A=np.asarray(img)[:VH,:VW,:]
print("### %s w=%d y=%d scrollY=%d maxY=%d"%(page,VW,Y,j['scrollY'],j['maxY']))
rows=[]
for it in j['items']:
    x0=max(0,it['x']+2); y0=max(0,it['y']+1); x1=min(VW,it['x']+it['w2']-2); y1=min(VH,it['y']+it['h2']-1)
    if x1-x0<4 or y1-y0<4: continue
    reg=A[y0:y1,x0:x1].reshape(-1,3).astype(float)
    fr,fg,fb,fa=pc(it['color'])
    tc=reg*(1-fa)+np.array([fr,fg,fb])*fa if fa<1 else np.tile([fr,fg,fb],(len(reg),1))
    l1=lum(tc.T); l2=lum(reg.T)
    cr=(np.maximum(l1,l2)+0.05)/(np.minimum(l1,l2)+0.05)
    below=float((cr<4.5).mean())*100
    rows.append((round(float(np.percentile(cr,5)),2), round(below,1), round(float(np.median(cr)),2), it['tag'], it['cls'][:24], round(it['fs'],1), it['fw'], it['color'], it['txt']))
for r in sorted(rows)[:20]:
    print("  p5=%5.2f  pod4.5=%5.1f%%  med=%6.2f %-5s %-24s %4.1fpx/%-3s %-24s %s"%r)
