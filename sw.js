const CACHE="seven-league-pwa-v3";
const SHELL=["/seven-league/","/seven-league/index.html","/seven-league/manifest.webmanifest","/seven-league/seven-league-icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin)return;
 // HTML/navigation is always network-first so a new deployment cannot remain trapped in an old shell.
 if(e.request.mode==="navigate" || u.pathname==="/seven-league/" || u.pathname==="/seven-league/index.html"){
   e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{
     if(r.ok)caches.open(CACHE).then(c=>c.put("/seven-league/index.html",r.clone()));
     return r;
   }).catch(()=>caches.match("/seven-league/index.html")));
   return;
 }
 e.respondWith(fetch(e.request).then(r=>{
   if(r.ok)caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
   return r;
 }).catch(()=>caches.match(e.request).then(r=>r||caches.match("/seven-league/index.html"))));
});