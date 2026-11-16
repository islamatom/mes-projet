// Atom · notifications sur le téléphone (même quand Atom est fermé)
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{let d={};try{d=e.data.json()}catch(x){d={title:'Atom',body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'Atom',{body:d.body||'',tag:d.tag||undefined,renotify:true,requireInteraction:true,vibrate:[300,120,300,120,500],icon:'img/atom-icon-192.png',badge:'img/atom-icon-192.png',data:{url:d.url||'./'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return self.clients.openWindow(u)}))});
