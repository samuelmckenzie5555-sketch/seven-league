/* Seven League Supreme Experience Layer — additive, data-safe, no official-data mutation */
(() => {
  'use strict';

  const $ = (s, r=document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  const css = document.createElement('style');
  css.textContent = `
    /* ===== 7L SUPREME EXPERIENCE ===== */
    .sl-supreme{display:grid;gap:12px;margin-top:12px;animation:slSupremeIn .65s cubic-bezier(.2,.8,.2,1) both}
    @keyframes slSupremeIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
    .sl-command{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.11);border-radius:20px;background:
      radial-gradient(circle at 90% 0%,rgba(211,47,47,.24),transparent 38%),
      linear-gradient(145deg,rgba(25,25,35,.97),rgba(7,7,12,.98));padding:16px;box-shadow:0 18px 48px rgba(0,0,0,.3)}
    .sl-command:after{content:"7L";position:absolute;right:-8px;bottom:-35px;font:900 9rem/.8 var(--font-display);color:rgba(255,255,255,.025);pointer-events:none}
    .sl-command-kicker{font:800 .56rem var(--font-cyber);letter-spacing:2px;color:#9999aa}
    .sl-command-title{font:900 1.45rem var(--font-cyber);margin-top:5px;letter-spacing:.5px}
    .sl-command-title span{color:var(--accent-red)}
    .sl-command-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:10px;margin-top:12px}
    .sl-feature-match{position:relative;overflow:hidden;border-radius:16px;padding:13px;background:linear-gradient(135deg,rgba(211,47,47,.13),rgba(0,0,0,.3));border:1px solid rgba(211,47,47,.18)}
    .sl-feature-label{font:800 .54rem var(--font-cyber);color:#ff7777;letter-spacing:1.5px}
    .sl-feature-date{font-size:.62rem;color:#888896;margin-top:4px}
    .sl-feature-teams{margin-top:14px;font:900 .85rem var(--font-cyber);line-height:1.55}
    .sl-feature-vs{color:#777;font-size:.56rem;letter-spacing:2px}
    .sl-feature-time{margin-top:10px;font:900 .72rem var(--font-cyber);color:var(--accent-gold)}
    .sl-form-card{border-radius:16px;padding:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
    .sl-form-head{display:flex;justify-content:space-between;align-items:center;font:800 .58rem var(--font-cyber);letter-spacing:1px}
    .sl-form-row{display:flex;justify-content:space-between;align-items:center;margin-top:11px;padding-top:9px;border-top:1px solid rgba(255,255,255,.055);font-size:.66rem;font-weight:800}
    .sl-form-dots{display:flex;gap:4px}.sl-form-dot{width:17px;height:17px;border-radius:5px;display:grid;place-items:center;font:900 .5rem var(--font-cyber);color:#fff}
    .sl-W{background:#087f5b}.sl-D{background:#75651a}.sl-L{background:#8f2525}
    .sl-leader-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .sl-leader{position:relative;min-height:92px;padding:11px;border-radius:14px;border:1px solid rgba(255,255,255,.075);background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(0,0,0,.22));overflow:hidden}
    .sl-leader-rank{font:900 .55rem var(--font-cyber);color:var(--accent-gold)}
    .sl-leader-name{font-weight:900;font-size:.68rem;margin-top:7px;max-width:82%;line-height:1.1}
    .sl-leader-stat{font:900 1.15rem var(--font-display);margin-top:7px}
    .sl-leader-sub{font-size:.52rem;color:#858593;text-transform:uppercase}
    .sl-leader img{position:absolute;right:-4px;bottom:-3px;width:58px;height:72px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 4px 8px #000)}
    .sl-quick{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
    .sl-quick button{border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.035);color:#ddd;padding:10px 4px;font:800 .52rem var(--font-cyber);cursor:pointer;transition:.18s}
    .sl-quick button:hover{border-color:rgba(211,47,47,.45);transform:translateY(-2px)}
    .sl-supreme .ov-match:first-child{border-color:rgba(255,215,0,.2);background:linear-gradient(90deg,rgba(255,215,0,.05),rgba(255,255,255,.02))}
    .sl-entry-gate{display:none!important}
    #slEntryStatus{display:none!important}
    .sl-autoplay-hint{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10000;padding:7px 11px;border-radius:999px;background:rgba(10,10,15,.88);border:1px solid rgba(255,255,255,.1);color:#8e8e9d;font:700 .5rem var(--font-cyber);letter-spacing:.7px;opacity:0;pointer-events:none;transition:opacity .25s}
    .sl-autoplay-hint.show{opacity:1}
    @media(max-width:600px){.sl-command-grid{grid-template-columns:1fr}.sl-leader-strip{grid-template-columns:1fr 1fr}.sl-leader-strip .sl-leader:nth-child(3){grid-column:1/-1}.sl-quick{grid-template-columns:repeat(2,1fr)}}
    @media(prefers-reduced-motion:reduce){.sl-supreme{animation:none!important}.sl-quick button{transition:none}}
  `;
  css.textContent += `
    /* ===== 7L ELITE PLAYER + MATCH CENTER ===== */
    .sl-elite-card{position:relative;overflow:hidden;border-radius:22px;padding:15px;background:radial-gradient(circle at 80% 10%,rgba(211,47,47,.24),transparent 32%),linear-gradient(145deg,#191922,#07070b);border:1px solid rgba(255,255,255,.13);box-shadow:0 28px 80px #000}
    .sl-elite-card:before{content:"7L";position:absolute;right:-20px;top:15px;font:900 10rem/.8 var(--font-display);color:rgba(255,255,255,.025);pointer-events:none}
    .sl-elite-card-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.08);padding-bottom:10px;position:relative;z-index:1}
    .sl-elite-card-head div{display:grid;gap:3px}.sl-elite-card-head span{font:800 .5rem var(--font-cyber);letter-spacing:2px;color:#777}.sl-elite-card-head b{font:900 .85rem var(--font-cyber)}
    .sl-elite-close{border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;border-radius:10px;width:34px;height:34px;font-size:1.35rem;cursor:pointer}
    .sl-elite-card-main{display:grid;grid-template-columns:1fr 1.15fr;gap:12px;align-items:end;padding:18px 0 8px;position:relative;z-index:1}
    .sl-elite-player-photo{width:100%;height:245px;object-fit:contain;object-position:bottom center;filter:drop-shadow(0 15px 18px #000)}
    .sl-no-photo{display:grid;place-items:center;background:rgba(255,255,255,.04);border-radius:15px;font:900 2rem var(--font-cyber);color:var(--accent-gold)}
    .sl-elite-info{padding-bottom:8px}.sl-elite-ovr{font:900 3.7rem/.85 var(--font-display);color:#fff;text-shadow:0 0 25px rgba(255,255,255,.25)}.sl-elite-ovr small{display:block;font:800 .48rem var(--font-cyber);letter-spacing:2px;color:#ff7777;margin-top:7px}
    .sl-elite-pos{font:900 .62rem var(--font-cyber);color:var(--accent-gold);margin-top:12px}.sl-elite-info h2{font:900 1.1rem var(--font-cyber);line-height:1.1;margin-top:7px}.sl-elite-team{font-size:.68rem;color:#888;margin-top:5px}.sl-elite-pills{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}.sl-elite-pills i{font:800 .46rem var(--font-cyber);font-style:normal;padding:5px 7px;border-radius:999px;background:rgba(255,255,255,.06);color:#aaa}
    .sl-elite-attributes{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;border-top:1px solid rgba(255,255,255,.08);padding-top:13px;position:relative;z-index:1}.sl-elite-attributes>div{display:grid;grid-template-columns:auto 1fr;align-items:end;column-gap:5px}.sl-elite-attributes b{font:900 1.05rem var(--font-display)}.sl-elite-attributes span{font:800 .48rem var(--font-cyber);color:#999}.sl-elite-attributes em{grid-column:1/-1;height:3px;background:#222;border-radius:3px;overflow:hidden;margin-top:5px}.sl-elite-attributes em i{display:block;height:100%;background:linear-gradient(90deg,var(--accent-red),var(--accent-gold));border-radius:inherit}
    .sl-elite-season{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:13px;position:relative;z-index:1}.sl-elite-season div{text-align:center;padding:8px 2px;background:rgba(255,255,255,.035);border-radius:9px}.sl-elite-season b{display:block;font:900 1rem var(--font-display)}.sl-elite-season span{font:800 .4rem var(--font-cyber);color:#777}
    .sl-elite-footer{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-top:11px;color:#777;font-size:.55rem;position:relative;z-index:1}.sl-elite-footer a{color:#ff7777;text-decoration:none;font:800 .48rem var(--font-cyber)}
    .sl-live-match-badge{display:flex;justify-content:space-between;align-items:center;margin:-4px 0 12px;padding:7px 10px;border-radius:9px;background:rgba(255,255,255,.035);font:800 .5rem var(--font-cyber);letter-spacing:1px;color:#aaa}.sl-live-match-badge i{width:7px;height:7px;border-radius:50%;background:#ff3030;box-shadow:0 0 10px #ff3030;animation:slPulse 1s infinite}.sl-live-match-badge span{color:#ff7777}@keyframes slPulse{50%{opacity:.35;transform:scale(.75)}}
    .sl-matchline{display:flex;justify-content:space-between;color:#777;font:800 .5rem var(--font-cyber);letter-spacing:1px;margin-bottom:7px}.sl-matchline b{color:var(--accent-gold)}
    @media(max-width:600px){.sl-elite-card-main{grid-template-columns:.9fr 1fr}.sl-elite-player-photo{height:210px}.sl-elite-ovr{font-size:3rem}.sl-elite-info h2{font-size:.92rem}.sl-elite-season span{font-size:.36rem}}
`;\n  document.head.appendChild(css);

  function playFanfare(){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) throw new Error('Web Audio unavailable');
    const ctx=new AC(), master=ctx.createGain(), comp=ctx.createDynamicsCompressor();
    master.gain.setValueAtTime(.0001,ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.20,ctx.currentTime+.06);
    master.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+4.85);
    comp.threshold.value=-18; comp.knee.value=12; comp.ratio.value=6; comp.attack.value=.01; comp.release.value=.25;
    master.connect(comp); comp.connect(ctx.destination);
    const now=ctx.currentTime+.03;
    const note=(f,s,d,t='triangle',g=.06)=>{const o=ctx.createOscillator(),a=ctx.createGain();o.type=t;o.frequency.setValueAtTime(f,now+s);a.gain.setValueAtTime(.0001,now+s);a.gain.exponentialRampToValueAtTime(g,now+s+.025);a.gain.exponentialRampToValueAtTime(.0001,now+s+d);o.connect(a);a.connect(master);o.start(now+s);o.stop(now+s+d+.04)};
    const chord=(fs,s,d,g)=>fs.forEach(f=>note(f,s,d,'triangle',g));
    chord([146.83,220,293.66],0,1.05,.035); chord([174.61,261.63,349.23],.72,1.05,.04); chord([196,293.66,392],1.48,1.25,.045); chord([220,329.63,440],2.35,2.35,.038);
    [[293.66,0,.28],[349.23,.28,.28],[392,.56,.42],[440,1.04,.34],[392,1.38,.25],[349.23,1.63,.28],[392,1.98,.28],[440,2.26,.42],[523.25,2.72,.82],[493.88,3.58,.28],[440,3.86,.28],[523.25,4.14,.68]].forEach(x=>note(x[0],x[1],x[2],'square',.075));
    note(73.42,.02,.75,'sine',.12);note(73.42,1.48,.75,'sine',.11);note(98,2.72,1.2,'sine',.1);
    setTimeout(()=>{try{ctx.close()}catch(e){}},5500);
  }

  function autoEntry(){
    const splash=$('#splashScreen'); if(!splash) return;
    $('#slEnterAppBtn')?.remove();
    $('.sl-entry-gate')?.remove();
    const status=$('#slEntryStatus'); if(status)status.remove();
    const start=()=>{try{playFanfare()}catch(e){/* autoplay may be blocked */} splash.classList.add('sl-entry-running'); document.body.classList.add('sl-entered'); setTimeout(()=>{splash.classList.add('hidden');setTimeout(()=>splash.remove(),700)},4450)};
    // Attempt immediately. Browsers may reject audible autoplay; the hub still opens.
    setTimeout(start,180);
    // If autoplay was blocked, a normal first touch/click anywhere silently retries once.
    let retried=false;
    const retry=()=>{if(retried)return;retried=true;try{playFanfare()}catch(e){};window.removeEventListener('pointerdown',retry,true)};
    window.addEventListener('pointerdown',retry,true);
    setTimeout(()=>window.removeEventListener('pointerdown',retry,true),7000);
  }

  function formForTeam(team, results){
    const out=[];
    (results||[]).forEach(m=>{
      const home=String(m.home||''), away=String(m.away||'');
      if(home!==team && away!==team)return;
      if(!m.score)return;
      const hs=Number(m.score.home), as=Number(m.score.away), gf=home===team?hs:as, ga=home===team?as:hs;
      out.push(gf>ga?'W':gf===ga?'D':'L');
    });
    return out.slice(-5);
  }
  function renderSupreme(){
    const data=window.officialOverview; if(!data)return;
    const shell=$('#tab-overview .overview-shell'); if(!shell)return;
    let root=$('#slSupremeExperience');
    if(!root){root=document.createElement('div');root.id='slSupremeExperience';root.className='sl-supreme';shell.appendChild(root)}
    const standings=data.standings||[], results=data.results||[], fixtures=data.fixtures||[], ranks=data.rankings||{};
    const top=(ranks.goals||[]).slice(0,3);
    const leader=standings[0];
    const ranked=standings.slice().sort((a,b)=>(Number(b.points)||0)-(Number(a.points)||0));
    const feature=fixtures.slice().sort((a,b)=>((Number(standings.find(x=>x.team===b.home)?.points)||0)+(Number(standings.find(x=>x.team===b.away)?.points)||0))-((Number(standings.find(x=>x.team===a.home)?.points)||0)+(Number(standings.find(x=>x.team===a.away)?.points)||0)))[0]||fixtures[0];
    const formTeams=[feature?.home,feature?.away].filter(Boolean);
    const featureHtml=feature?'<div class="sl-feature-label">⭐ MATCH OF THE DAY</div><div class="sl-feature-date">'+esc(feature.date||'PRÓXIMO PARTIDO')+'</div><div class="sl-feature-teams">'+esc(feature.home)+'<div class="sl-feature-vs">VS</div>'+esc(feature.away)+'</div><div class="sl-feature-time">'+esc(feature.time||'PROGRAMADO')+' · SPORTPLATZ LANDAUER</div>':'<div class="sl-feature-label">MATCH OF THE DAY</div><div class="sl-feature-teams">Próximo partido por confirmar</div>';
    const formHtml=formTeams.map(t=>{const f=formForTeam(t,results);return '<div class="sl-form-row"><span>'+esc(t)+'</span><span class="sl-form-dots">'+(f.length?f.map(x=>'<i class="sl-form-dot sl-'+x+'">'+x+'</i>').join(''):'<small style="color:#777">—</small>')+'</span></div>'}).join('');
    const leaders=top.map((p,i)=>'<div class="sl-leader"><div class="sl-leader-rank">#'+(i+1)+' TOP SCORER</div>'+(p.photo?'<img src="'+esc(p.photo)+'" alt="" loading="lazy" onerror="this.style.display=\'none\'">':'')+'<div class="sl-leader-name">'+esc(p.name)+'</div><div class="sl-leader-stat">'+esc(p.value)+'</div><div class="sl-leader-sub">GOALS · '+esc(p.apps||'—')+' APPS</div></div>').join('');
    root.innerHTML='<section class="sl-command"><div class="sl-command-kicker">SEVEN LEAGUE · COMPETITION INTELLIGENCE</div><div class="sl-command-title">MATCHDAY <span>COMMAND CENTER</span></div><div class="sl-command-grid"><div class="sl-feature-match">'+featureHtml+'</div><div class="sl-form-card"><div class="sl-form-head"><span>RECENT FORM</span><span>LAST 5</span></div>'+formHtml+'</div></div></section><div class="sl-leader-strip">'+(leaders||'')+'</div><div class="sl-quick"><button data-go="tab-partido">⚽ LIVE MATCH</button><button data-go="tab-jugadores">🎴 PLAYERS</button><button data-go="tab-historial">📁 ARCHIVE</button><button data-go="tab-asistencia">📋 ATTENDANCE</button></div>';
    root.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>window.switchTab?.(b.dataset.go));
  }

  
  function enhancePlayerCard(){
    const original = window.openPlayerCard;
    window.openPlayerCard = function(id){
      const p = window.findPlayerById?.(id);
      if(!p || !window.getPlayerCardStats || !window.getPlayerStats){ if(original) return original(id); return; }
      const s=window.getPlayerStats(p), st=window.getPlayerCardStats(p), modal=document.getElementById('playerModal');
      if(!modal)return;
      const photo=p.photo?'<img class="sl-elite-player-photo" src="'+esc(p.photo)+'" alt="" onerror="this.style.opacity=.15">':'<div class="sl-elite-player-photo sl-no-photo">'+esc((p.name||'?').split(' ').map(x=>x[0]).slice(0,2).join(''))+'</div>';
      const official=!!(p.linked&&p.webStats);
      modal.innerHTML='<div class="sl-elite-card"><div class="sl-elite-card-head"><div><span>SEVEN LEAGUE</span><b>PLAYER PROFILE</b></div><button class="sl-elite-close" onclick="closePlayerModal()">×</button></div><div class="sl-elite-card-main">'+photo+'<div class="sl-elite-info"><div class="sl-elite-ovr">'+st.ovr+'<small>OVR</small></div><div class="sl-elite-pos">'+esc(p.position||'PLAYER')+'</div><h2>'+esc(p.name)+'</h2><div class="sl-elite-team">'+esc(p.teamName||'SEVEN LEAGUE')+'</div><div class="sl-elite-pills"><i>'+ (official?'OFFICIAL DATA':'APP DATA') +'</i><i>2026/27</i></div></div></div><div class="sl-elite-attributes">'+[['PAC',st.pace],['SHO',st.shooting],['PAS',st.passing],['DRI',st.dribbling],['DEF',st.defending],['PHY',st.physical]].map(x=>'<div><b>'+x[1]+'</b><span>'+x[0]+'</span><em><i style="width:'+x[1]+'%"></i></em></div>').join('')+'</div><div class="sl-elite-season"><div><b>'+s.appearances+'</b><span>APPEARANCES</span></div><div><b>'+s.goals+'</b><span>GOALS</span></div><div><b>'+s.assists+'</b><span>ASSISTS</span></div><div><b>'+s.mvp+'</b><span>MVP</span></div><div><b>'+s.minutes+'</b><span>MINUTES</span></div></div><div class="sl-elite-footer">'+(official?'✓ Statistics sourced from official Seven League data':'✓ Statistics recorded by the Seven League app')+(p.webUrl?'<a href="'+esc(p.webUrl)+'" target="_blank" rel="noopener">OPEN OFFICIAL PROFILE ↗</a>':'')+'</div></div>';
      document.getElementById('playerModalBackdrop').classList.add('open');
    };
  }

  function enhanceMatchCenter(){
    const tab=document.getElementById('tab-partido'); if(!tab||tab.dataset.supreme) return;
    tab.dataset.supreme='1';
    const card=tab.querySelector('.scoreboard-box');
    if(card){
      const badge=document.createElement('div'); badge.className='sl-live-match-badge'; badge.innerHTML='<i></i> LIVE MATCH CENTER <span>7L</span>'; card.prepend(badge);
    }
    const timer=document.getElementById('timerCard');
    if(timer && !timer.querySelector('.sl-matchline')){
      const line=document.createElement('div'); line.className='sl-matchline'; line.innerHTML='<span>SEVEN LEAGUE · MATCHDAY</span><b>50 MIN</b>'; timer.prepend(line);
    }
  }

  function boot(){
    try{window.officialOverview=JSON.parse(localStorage.getItem('sl_official_overview_v1')||'null')}catch(e){}
    autoEntry();
    // Prime the browser audio engine after the first interaction without showing a button.
    document.addEventListener('pointerdown',()=>{try{if(window.AudioContext||window.webkitAudioContext){const A=window.AudioContext||window.webkitAudioContext; const x=new A(); if(x.state==='suspended')x.resume(); setTimeout(()=>x.close(),250)}}catch(e){}},{once:true,passive:true});
    const hook=()=>{renderSupreme(); enhancePlayerCard(); enhanceMatchCenter();};
    let n=0; const timer=setInterval(()=>{hook(); if(window.officialOverview||++n>20)clearInterval(timer)},500);
    window.addEventListener('sl:overview-updated',hook);
    const observer=new MutationObserver(()=>{if(window.officialOverview)hook()});
    const target=$('#tab-overview .overview-shell'); if(target)observer.observe(target,{childList:true,subtree:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
