import json,re,time
from datetime import datetime,timezone
from urllib.parse import urljoin,urlparse
import requests
from bs4 import BeautifulSoup

HUB="https://sevenleague.ch/seven-league-basel-competition-hub/"
OUT="data/players.json"
OVERVIEW_OUT="data/overview.json"
S=requests.Session()
S.headers.update({"User-Agent":"SevenLeagueSync/1.0","Accept-Language":"en-US,en;q=0.9"})

def clean(x):
    return re.sub(r"\s+"," ",x or "").strip()

def num(t,*labels):
    for label in labels:
        esc=re.escape(label)
        for p in (rf"(\d+)\s*{esc}",rf"{esc}\s*(\d+)"):
            m=re.search(p,t,re.I)
            if m:
                return int(m.group(1))
    return 0

def get(url):
    r=S.get(url,timeout=30)
    r.raise_for_status()
    return r.text

def links(html):
    soup=BeautifulSoup(html,"html.parser")
    out={}
    for a in soup.select('a[href*="/player/"]'):
        u=urljoin(HUB,a.get("href","")).split("#")[0]
        if urlparse(u).netloc!="sevenleague.ch" or "/player/" not in urlparse(u).path:
            continue
        if u not in out:
            p=a.parent
            out[u]=clean(p.get_text(" ",strip=True) if p else "")
    return out

def image(soup,base):
    for sel in ['meta[property="og:image"]','meta[name="twitter:image"]']:
        x=soup.select_one(sel)
        if x and x.get("content"):
            return urljoin(base,x["content"])
    return ""

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
      "cleanSheets":num(text,"Clean sheets","Clean sheet")
    }


def parse_standings(soup):
    rows=[]
    for table in soup.find_all("table"):
        trs=table.find_all("tr")
        if not trs: continue
        heads=[clean(x.get_text(" ",strip=True)).lower() for x in trs[0].find_all(["th","td"])]
        if "club" not in heads or "pts" not in heads: continue
        idx={h:i for i,h in enumerate(heads)}
        for tr in trs[1:]:
            cells=[clean(x.get_text(" ",strip=True)) for x in tr.find_all(["td","th"])]
            if len(cells)<len(heads): continue
            def cell(k):
                i=idx.get(k); return cells[i] if i is not None and i<len(cells) else ""
            def integer(v):
                m=re.search(r"-?\d+",v or "")
                return int(m.group()) if m else 0
            rows.append({
                "position":integer(cell("pos")),"team":cell("club"),"played":integer(cell("p")),
                "wins":integer(cell("w")),"draws":integer(cell("d")),"losses":integer(cell("l")),
                "gf":integer(cell("gf")),"ga":integer(cell("ga")),"gd":integer(cell("gd")),
                "form":cell("form"),"points":integer(cell("pts"))
            })
        if len(rows)>=4: return rows
    return rows

def match_links(soup):
    urls=[]
    for a in soup.select('a[href*="sl_match="], a[href*="/match/"]'):
        href=a.get("href","")
        u=urljoin(HUB,href).split("#")[0]
        if "sl_match=" not in u and "/match/" not in u: continue
        if u not in urls: urls.append(u)
    return urls

def parse_match(url,teams):
    html=get(url)
    soup=BeautifulSoup(html,"html.parser")
    text=clean(soup.get_text(" ",strip=True))
    ordered=sorted([(text.find(t),t) for t in teams if text.find(t)>=0])
    pair=[]
    for _,t in ordered:
        if t not in pair: pair.append(t)
        if len(pair)==2: break
    if len(pair)<2:
        raise ValueError("could not identify teams")
    home,away=pair[0],pair[1]
    result=re.search(re.escape(home)+r"\s+(\d+)\s*[–-]\s*(\d+)\s+"+re.escape(away),text)
    scheduled=bool(re.search(re.escape(home)+r"\s+VS\s+"+re.escape(away),text,re.I))
    status="scheduled" if scheduled and not result else "full_time"
    score={"home":int(result.group(1)),"away":int(result.group(2))} if result else None
    dm=re.search(r"(\d{1,2}\s+[A-Za-z]+\s+2026)\s*·\s*(\d{1,2}:\d{2}\s*[ap]m)",text)
    if not dm:
        dm=re.search(r"Kick-off\s+(\d{1,2}\s+[A-Za-z]+\s+2026)\s+(\d{1,2}:\d{2}\s*[ap]m)",text,re.I)
    date=dm.group(1) if dm else ""
    clock=dm.group(2) if dm else ""
    md=re.search(r"Matchday\s+(Matchday\s+\d+)",text,re.I)
    matchday=md.group(1) if md else ""
    rm=re.search(r"Referee\s+(.+?)\s+Format\s+7-a-side",text,re.I)
    referee=clean(rm.group(1)) if rm else ""
    if referee=="—": referee=""
    return {"url":url,"home":home,"away":away,"date":date,"time":clock,"matchday":matchday,
            "status":status,"score":score,"referee":referee,"venue":"Sportplatz Landauer"}

def parse_venue(text):
    def grab(pattern):
        m=re.search(pattern,text,re.I)
        return clean(m.group(1)) if m else ""
    return {
      "name":"Sportplatz Landauer",
      "days":grab(r"Playing days\s+(.*?)\s+Monday"),
      "hours":"Monday 18:00–21:00 · Tuesday/Thursday 17:00–19:00",
      "matchTimes":grab(r"Match times\s+(.*?)(?:\s+Game format)"),
      "format":grab(r"Game format\s+(.*?)(?:\s+Match duration)"),
      "duration":grab(r"Match duration\s+(.*?)(?:\s+Competition format)"),
      "competitionFormat":grab(r"Competition format\s+(.*?)(?:\s+Teams)")
    }

def build_overview(hub_html, players):
    soup=BeautifulSoup(hub_html,"html.parser")
    standings=parse_standings(soup)
    teams=[x["team"] for x in standings if x["team"]]
    urls=match_links(soup)
    matches=[]; errors=[]
    for i,u in enumerate(urls,1):
        try:
            matches.append(parse_match(u,teams))
            print(f"[match {i}/{len(urls)}] {matches[-1]['home']} - {matches[-1]['away']}")
        except Exception as e:
            errors.append({"url":u,"error":str(e)})
            print("MATCH ERROR",u,e)
        time.sleep(.05)
    def key(m):
        try:
            d=datetime.strptime(m["date"],"%d %B %Y")
            hm=datetime.strptime(m["time"].lower().replace(" ",""),"%I:%M%p").time()
            return datetime.combine(d.date(),hm)
        except:
            return datetime.max
    matches.sort(key=key)
    upcoming=[m for m in matches if m["status"]=="scheduled"]
    results=list(reversed([m for m in matches if m["status"]=="full_time"]))
    def rank(metric):
        return sorted([{
            "name":p.get("name",""),"team":p.get("teamName",""),"photo":p.get("photo",""),
            "value":p.get("webStats",{}).get(metric,0),"apps":p.get("webStats",{}).get("appearances",0),
            "id":p.get("id","")
        } for p in players], key=lambda x:(x["value"],x["apps"]), reverse=True)[:5]
    fulltext=clean(soup.get_text(" ",strip=True))
    refs={}
    for m in matches:
        if m["referee"]: refs[m["referee"]]=refs.get(m["referee"],0)+1
    referee_cards=[]
    for name,count in sorted(refs.items(),key=lambda x:x[0]):
        nxt=next((m for m in upcoming if m["referee"]==name),None)
        referee_cards.append({"name":name,"assignedMatches":count,"nextAssignment":nxt["date"] if nxt else ""})
    leader=standings[0] if standings else {}
    best_attack=max(standings,key=lambda x:x.get("gf",0),default={})
    best_defence=min(standings,key=lambda x:x.get("ga",999),default={})
    return {
      "source":HUB,"competition":"Seven League Basel","season":"2026-27",
      "updatedAt":datetime.now(timezone.utc).isoformat(),"standings":standings,
      "fixtures":upcoming,"results":results[:12],"allMatches":matches,
      "highlights":{"leader":leader,
        "bestAttack":{"team":best_attack.get("team",""),"goals":best_attack.get("gf",0)},
        "bestDefence":{"team":best_defence.get("team",""),"goalsConceded":best_defence.get("ga",0)}},
      "rankings":{"goals":rank("goals"),"assists":rank("assists"),"goalContributions":rank("goalContributions"),
        "mvp":rank("mvp"),"yellow":rank("yellow"),"red":rank("red")},
      "venue":parse_venue(fulltext),"referees":referee_cards,
      "matchCount":len(matches),"matchErrors":errors
    }


def parse(u,card):
    html=get(u)
    soup=BeautifulSoup(html,"html.parser")
    text=clean(soup.get_text(" ",strip=True))
    h=soup.find("h1")
    name=clean(h.get_text(" ",strip=True) if h else "")
    m=re.search(r"Player\s*[·•]\s*(.*?)\s*[·•]\s*Season\s*2026/27",text,re.I)
    team=clean(m.group(1)) if m else ""
    pos=re.search(r"\b(Goalkeeper|Defender|Midfielder|Forward)\b",card,re.I)
    ws=extract_stats(text)
    ws["goalContributions"]=ws["goals"]+ws["assists"]
    overall=num(text,"% overall","%overall","Overall")
    ach={}
    am=re.search(r"(\d+)\s+of\s+(\d+)\s+sporting achievements unlocked",text,re.I)
    if am:
        ach={"unlocked":int(am.group(1)),"total":int(am.group(2))}
    log=[]
    for table in soup.find_all("table"):
        rows=table.find_all("tr")
        if not rows:
            continue
        heads=[clean(x.get_text(" ",strip=True)).lower() for x in rows[0].find_all(["th","td"])]
        needed={"date","opponent","result","started","goals","assists"}
        if not needed.issubset(set(heads)):
            continue
        idx={h:i for i,h in enumerate(heads)}
        for tr in rows[1:]:
            c=[clean(x.get_text(" ",strip=True)) for x in tr.find_all(["td","th"])]
            if len(c)<len(heads):
                continue
            def cell(k):
                i=idx.get(k)
                return c[i] if i is not None and i<len(c) else ""
            def integer(x):
                q=re.search(r"\d+",x)
                return int(q.group()) if q else 0
            log.append({
                "date":cell("date"),"opponent":cell("opponent"),"result":cell("result"),
                "started":cell("started"),"goals":integer(cell("goals")),
                "assists":integer(cell("assists")),
                "yellow":integer(cell("yc") or cell("yellow cards")),
                "red":integer(cell("rc") or cell("red cards"))
            })
        break
    return {
      "id":urlparse(u).path.rstrip("/").split("/")[-1],
      "name":name,"teamName":team,
      "position":pos.group(1).title() if pos else "",
      "webUrl":u,"photo":image(soup,u),"webStats":ws,"overall":overall,
      "achievements":ach,"matchLog":log,"season":"2026-27","competition":"Seven League Basel"
    }

hub=get(HUB)
found=links(hub)
print("Found",len(found),"profiles")
if len(found)<150:
    raise SystemExit("ABORT: incomplete player catalog")

players=[];errors=[]
for i,(u,card) in enumerate(found.items(),1):
    try:
        p=parse(u,card)
        if not p["name"]:
            raise ValueError("missing name")
        players.append(p)
        print(f"[{i}/{len(found)}] {p['name']} photo={'yes' if p['photo'] else 'no'} stats={p['webStats']}")
    except Exception as e:
        errors.append({"url":u,"error":str(e)})
        print("ERROR",u,e)
    time.sleep(.1)

photos=sum(bool(p["photo"]) for p in players)
statful=sum(1 for p in players if sum(p["webStats"].values())>0)
if len(players)<150 or photos<100:
    raise SystemExit(f"ABORT: players={len(players)} photos={photos}")
if statful<100:
    raise SystemExit(f"ABORT: official stats parsing incomplete; statful={statful}/{len(players)}")

payload={"source":HUB,"competition":"Seven League Basel","season":"2026-27",
         "count":len(players),"photos":photos,"statful":statful,
         "updatedAt":datetime.now(timezone.utc).isoformat(),
         "players":players,"errors":errors}
with open(OUT,"w",encoding="utf-8") as f:
    json.dump(payload,f,ensure_ascii=False,indent=2)
print("Wrote",len(players),"players,",photos,"photos,",statful,"with official stats")

overview=build_overview(hub,players)
if len(overview["standings"])<8:
    raise SystemExit(f"ABORT: standings parsing incomplete; rows={len(overview['standings'])}")
if overview["matchCount"]<20:
    raise SystemExit(f"ABORT: match catalog parsing incomplete; matches={overview["matchCount"]}")
with open(OVERVIEW_OUT,"w",encoding="utf-8") as f:
    json.dump(overview,f,ensure_ascii=False,indent=2)
print("Wrote overview:",overview["matchCount"],"matches,",len(overview["standings"]),"table rows")
