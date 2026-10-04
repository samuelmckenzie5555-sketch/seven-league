import json,re,time
from datetime import datetime,timezone
from urllib.parse import urljoin,urlparse
import requests
from bs4 import BeautifulSoup

HUB="https://sevenleague.ch/seven-league-basel-competition-hub/"
OUT="data/players.json"
S=requests.Session()
S.headers.update({"User-Agent":"SevenLeagueSync/1.0","Accept-Language":"en-US,en;q=0.9"})

def clean(x): return re.sub(r"\\s+"," ",x or "").strip()
def num(t,*labels):
    for label in labels:
        esc=re.escape(label)
        patterns=(rf"(\\d+)\\s*{esc}",rf"{esc}\\s*(\\d+)")
        for p in patterns:
            m=re.search(p,t,re.I)
            if m:
                return int(m.group(1))
    return 0
def get(url):
    r=S.get(url,timeout=30);r.raise_for_status();return r.text

def extract_stats(text):
    return {
      "appearances":num(text,"Appearances","Appearance"),
      "starts":num(text,"Starts","Start"),
      "goals":num(text,"Goals","Goal"),
      "assists":num(text,"Assists","Assist"),
      "yellow":num(text,"Yellow cards","Yellow card","Yellow"),
      "red":num(text,"Red cards","Red card","Red"),
      "ownGoals":num(text,"Own goals","Own goal"),
      "minutes":num(text,"Match minutes","Minutes"),
      "mvp":num(text,"MVP awards","MVP award","MVP"),
      "cleanSheets":num(text,"Clean sheets","Clean sheet")}

def image(soup,base):
    for sel in ['meta[property="og:image"]','meta[name="twitter:image"]']:
        x=soup.select_one(sel)
        if x and x.get("content"):return urljoin(base,x["content"])
    return ""

def parse(u,card):
    html=get(u); soup=BeautifulSoup(html,"html.parser"); text=clean(soup.get_text(" ",strip=True))
    h=soup.find("h1"); name=clean(h.get_text(" ",strip=True) if h else "")
    m=re.search(r"Player\s*[·•]\s*(.*?)\s*[·•]\s*Season\s*2026/27",text,re.I)
    team=clean(m.group(1)) if m else ""
    pos=re.search(r"\b(Goalkeeper|Defender|Midfielder|Forward)\b",card,re.I)
    ws=extract_stats(text)
    ws["goalContributions"]=ws["goals"]+ws["assists"]
    overall=num(text,"% overall","%overall","Overall")
    ach={}
    am=re.search(r"(\d+)\\s+of\\s+(\\d+)\\s+sporting achievements unlocked",text,re.I)
    if am:ach={"unlocked":int(am.group(1)),"total":int(am.group(2))}
    log=[]
    for table in soup.find_all("table"):
        rows=table.find_all("tr")
        if not rows:continue
        heads=[clean(x.get_text(" ",strip=True)).lower() for x in rows[0].find_all(["th","td"])]
        needed={"date","opponent","result","started","goals","assists"}
        if not needed.issubset(set(heads)):continue
        idx={h:i for i,h in enumerate(heads)}
        for tr in rows[1:]:
            c=[clean(x.get_text(" ",strip=True)) for x in tr.find_all(["td","th"])]
            if len(c)<len(heads):continue
            def cell(k):
                i=idx.get(k);return c[i] if i is not None and i<len(c) else ""
            def integer(x):
                q=re.search(r"\d+",x);return int(q.group()) if q else 0
            log.append({"date":cell("date"),"opponent":cell("opponent"),"result":cell("result"),"started":cell("started"),"goals":integer(cell("goals")),"assists":integer(cell("assists")),"yellow":integer(cell("yc") or cell("yellow cards")),"red":integer(cell("rc") or cell("red cards"))})
        break
    return {"id":urlparse(u).path.rstrip("/").split("/")[-1],"name":name,"teamName":team,"position":pos.group(1).title() if pos else "","webUrl":u,"photo":image(soup,u),"webStats":ws,"overall":overall,"achievements":ach,"matchLog":log,"season":"2026-27","competition":"Seven League Basel"}

hub=get(HUB); found=links(hub); print("Found",len(found),"profiles")
if len(found)<150: raise SystemExit("ABORT: incomplete player catalog")
players=[];errors=[]
for i,(u,card) in enumerate(found.items(),1):
    try:
        p=parse(u,card)
        if not p["name"]:raise ValueError("missing name")
        players.append(p)
        print(f"[{i}/{len(found)}] {p['name']} photo={'yes' if p['photo'] else 'no'}")
    except Exception as e:
        errors.append({"url":u,"error":str(e)});print("ERROR",u,e)
    time.sleep(.1)
photos=sum(bool(p["photo"]) for p in players)
if len(players)<150 or photos<100:raise SystemExit(f"ABORT: players={len(players)} photos={photos}")
payload={"source":HUB,"competition":"Seven League Basel","season":"2026-27","count":len(players),"photos":photos,"updatedAt":datetime.now(timezone.utc).isoformat(),"players":players,"errors":errors}
with open(OUT,"w",encoding="utf-8") as f:json.dump(payload,f,ensure_ascii=False,indent=2)
print("Wrote",len(players),"players and",photos,"photos")
