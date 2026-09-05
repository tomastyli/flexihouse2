import sys,re,json,html
d=sys.stdin.read()
m=re.search(r'<pre id="out">(.*?)</pre>', d, re.S)
if not m: print('NOMATCH'); raise SystemExit
j=json.loads(html.unescape(m.group(1)))
print("=== %s @ %s ===" % (j['page'], j['W']))
mode=sys.argv[1]
if mode=='img':
    for i in j['imgs']:
        need=i['cssW']*2
        maxss=0
        if i['srcset']:
            for part in i['srcset'].split(','):
                mm=re.search(r'(\d+)w', part)
                if mm: maxss=max(maxss,int(mm.group(1)))
        flags=[]
        if not i['srcset']: flags.append('NO-SRCSET')
        if not i['sizes'] and i['srcset']: flags.append('NO-SIZES')
        if i['sizes'] and not i['srcset']: flags.append('SIZES-WITHOUT-SRCSET')
        if not i['aw'] or not i['ah']: flags.append('NO-WH')
        if not i['hasAlt']: flags.append('NO-ALT')
        if not i['complete'] or i['natW']==0: flags.append('BROKEN')
        if maxss and need>maxss: flags.append('DPR2-SHORT need=%d max=%dw'%(need,maxss))
        if i['aw'] and i['ah'] and i['natW']:
            ar_attr=int(i['aw'])/int(i['ah']); ar_nat=i['natW']/i['natH']
            if abs(ar_attr-ar_nat)/ar_nat > 0.02: flags.append('AR-MISMATCH attr=%s/%s nat=%dx%d'%(i['aw'],i['ah'],i['natW'],i['natH']))
        print(" %-38s css=%-7s cur=%-34s %s" % (i['base'], '%gx%g'%(i['cssW'],i['cssH']), i['src'], ' | '.join(flags)))
elif mode=='tt':
    seen=set()
    for t in j['tt']:
        if t['h']<48 or t['wd']<48:
            k=(t['t'],t['c'],t['txt'],t['h'],t['wd'])
            if k in seen: continue
            seen.add(k)
            print("  %-7s %-24s %6.1fx%-6.1f  %s" % (t['t'], t['c'][:24], t['wd'], t['h'], t['txt']))
elif mode=='h':
    for h in j['heads']: print("  %s  %-46s disp=%s" % (h['l'], h['txt'], h['disp']))
elif mode=='l':
    import collections
    for a in sorted(set(x for x in j['links'] if x is not None)): print("  ", a)
    print("  NULL-HREF:", sum(1 for x in j['links'] if x is None))
