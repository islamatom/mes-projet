/* ===== 🤖 Robot Atom v2 : le client range ses changements étape par étape, Atom les fait, le client valide ===== */
(function(){
const R=window.ROBOT_ATOM||{};               // {api, anon, cle, nom, visible(), tel, telAff}
const LSK='robot_atom_'+(R.cle||'demo');
const ls={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const st={L:[],open:false,liste:ls.get(LSK+'_liste')||[],cat:null,vue:'accueil',nonId:null};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const live=()=>!!(R.api&&R.anon&&R.cle);
async function rpc(fn,body){const r=await fetch(R.api+'/rest/v1/rpc/'+fn,{method:'POST',headers:{apikey:R.anon,Authorization:'Bearer '+R.anon,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const j=await r.json().catch(()=>null);if(!r.ok)throw new Error((j&&j.message)||'erreur');return j}

/* ---------- ce qu'on peut demander ---------- */
const CAT={logo:['🖼️','Logo','Ex : mettre mon nouveau logo (envoie-le par SMS à Atom)'],police:['🔤','Écriture','Ex : une écriture plus grosse, plus moderne…'],
 couleurs:['🎨','Couleurs','Ex : plus de bleu, enlever le rose…'],photos:['📷','Photos','Ex : changer la photo de l\'accueil'],
 horaires:['🕒','Horaires','Ex : samedi 9h – 13h, fermé le lundi'],prix:['💶','Prix','Ex : vidange 89 € au lieu de 79 €'],
 texte:['📝','Texte','Ex : corriger une faute, changer ma présentation'],autre:['➕','Autre chose','Explique ce que tu veux en quelques mots']};
const IT={'reçu':['📨','Reçu','ra-p1'],'en cours':['🙋','Pris en charge','ra-p2'],'à vérifier':['✅','Traité · à vérifier','ra-p4'],'validé':['✅','Validé','ra-p3'],'pas bon':['👎','Pas bon, à refaire','ra-p5']};

/* ---------- données ---------- */
function demo(){const d=new Date(Date.now()-864e5).toISOString().slice(0,10);
 return [{id:'demo1',date:d,heure:'17:12',statut:'en cours',items:[{cat:'logo',txt:'Mettre le nouveau logo rouge',statut:'à vérifier',reponse:'Nouveau logo mis en ligne 👍'},{cat:'police',txt:'Une écriture plus moderne pour les titres',statut:'en cours'}]}]}
async function charger(){const av=JSON.stringify(st.L.map(d=>(d.items||[]).map(y=>y.statut)));try{st.L=live()?(await rpc('robot_liste',{p_cle:R.cle})||[]):(ls.get(LSK)||demo())}catch(e){}
  const ap=JSON.stringify(st.L.map(d=>(d.items||[]).map(y=>y.statut)));if(st.L.length&&av!=='[]'&&av!==ap&&/à vérifier|validé/.test(ap))faireLaFete();maj()}
function sauverDemo(){ls.set(LSK,st.L)}
const statutDem=x=>{const L=x.items||[];if(L.every(y=>y.statut==='validé'))return'terminée';if(L.every(y=>y.statut==='reçu'))return'reçue';return'en cours'};
async function envoyer(){if(bloque())throw new Error('attente');const items=st.liste.map(x=>({cat:x.cat,txt:x.txt}));
  if(live())st.L=await rpc('robot_envoyer',{p_cle:R.cle,p_items:items})||st.L;
  else{const d=new Date();st.L=st.L.concat([{id:String(Date.now()),date:d.toISOString().slice(0,10),heure:d.toTimeString().slice(0,5),statut:'reçue',items:items.map(x=>Object.assign(x,{statut:'reçu'}))}]);sauverDemo()}
  st.liste=[];ls.set(LSK+'_liste',st.liste)}
async function valider(dem,i,ok,note){
  if(live())st.L=await rpc('robot_valider',{p_cle:R.cle,p_dem:dem,p_idx:i,p_ok:ok,p_note:note||''})||st.L;
  else{const x=st.L.find(d=>d.id===dem);const y=x.items[i];y.statut=ok?'validé':'pas bon';y.note=note||'';x.statut=statutDem(x);sauverDemo()}}
const items=()=>st.L.flatMap(d=>(d.items||[]).map((y,i)=>({d,y,i})));
const aVerifier=()=>items().filter(o=>o.y.statut==='à vérifier');
const ouverts=()=>items().filter(o=>o.y.statut!=='validé');
const bloque=()=>items().some(o=>o.y.statut==='reçu');

/* ---------- dessin du robot ---------- */
const IMGB='https://islamatom.github.io/mes-projet/img/';
const IMG=Object.assign({},...['dort','bonjour','fete','inquiet','noel'].map(k=>({[k]:IMGB+'tomi-'+k+'.png'})),R.img||{});
const NOM_ROBOT=R.nomRobot||'Tomi';
let fete=0;
function humeur(eveille){if(fete>Date.now())return'fete';try{if(R.inquiet&&R.inquiet())return'inquiet'}catch(e){}
  if(!eveille)return'dort';const d=new Date();if(d.getMonth()===11&&d.getDate()<=26&&IMG.noel)return'noel';return'bonjour'}
function svg(eveille,grand){const h=grand&&eveille===true&&humeur(true)==='dort'?'bonjour':humeur(eveille);return `<img src="${IMG[h]||IMG.bonjour}" class="ra-svg ra-img${grand?' g':''}${eveille?' on':''}" alt="" draggable="false">`}
function faireLaFete(){fete=Date.now()+5000;maj();setTimeout(maj,5200)}
const fdate=s=>{if(!s)return'';const d=new Date(s+'T12:00:00');return d.toLocaleDateString('fr-BE',{day:'numeric',month:'long'})};

/* ---------- bouton flottant ---------- */
const btn=document.createElement('button');btn.id='robotAtom';btn.type='button';btn.setAttribute('aria-label',NOM_ROBOT+', le petit Atom : demander un changement');
btn.onclick=ouvrir;
function maj(){const ev=ouverts().length>0||st.liste.length>0||btn.classList.contains('salut'),n=aVerifier().length;
  btn.innerHTML=svg(ev)+''+(n?`<b class="ra-n">${n}</b>`:'');
  btn.classList.toggle('dort',!ev);if(st.open)corps()}
function vis(){let v=true;try{v=R.visible?!!R.visible():true}catch(e){}btn.hidden=!v}
function bulleBonjour(){const k=LSK+'_bjr',auj=new Date().toDateString();if(ls.get(k)===auj||btn.hidden)return;ls.set(k,auj);
  const b=document.createElement('div');b.className='ra-hello';b.textContent=`${humeur(true)==='noel'?'Joyeux Noël':'Bonjour'}${R.nom?' '+R.nom:''} ! 👋`;document.body.appendChild(b);
  const pos=()=>{const r=btn.getBoundingClientRect();b.style.bottom=(innerHeight-r.top+8)+'px';if(R.cote==='gauche')b.style.left='14px';else b.style.right='14px'};pos();
  fete=0;btn.classList.add('salut');setTimeout(()=>{b.classList.add('out');btn.classList.remove('salut')},4200);setTimeout(()=>b.remove(),4700)}
function go(){if(!btn.isConnected)document.body.appendChild(btn);vis();charger();let n=0;const t=setInterval(()=>{if(!btn.hidden){clearInterval(t);setTimeout(bulleBonjour,600)}else if(++n>60)clearInterval(t)},1000)}
window.ROBOT_ATOM_FETE=faireLaFete;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
setInterval(vis,700);setInterval(()=>{if(!document.hidden&&!btn.hidden&&!st.open)charger()},60000);

/* ---------- fenêtre ---------- */
let ov=null;
function ouvrir(){st.open=true;st.vue=aVerifier().length||bloque()?'accueil':(st.liste.length?'nouvelle':'accueil');ov=document.createElement('div');ov.className='ra-ov';ov.innerHTML='<div class="ra-sh" role="dialog" aria-modal="true" aria-label="Robot Atom"></div>';
  ov.onclick=e=>{if(e.target===ov)fermer()};document.body.appendChild(ov);requestAnimationFrame(()=>ov.classList.add('on'));corps();charger()}
function fermer(){st.open=false;if(!ov)return;const o=ov;ov=null;o.classList.remove('on');setTimeout(()=>o.remove(),250);maj()}
function bulle(t,x){return `<div class="ra-hd">${svg(true,true)}<div class="ra-bul"><b>${t}</b>${x}</div></div>`}
const ETAPES=[['📨','Envoyée'],['🙋','Prise en charge'],['🛠️','Traitée'],['✅','Ajoutée']];
function suivi(y){const v=y.statut,k={'reçu':0,'en cours':1,'pas bon':1,'à vérifier':2,'validé':3}[v]??0;
 return `<div class="ra-suivi${v==='pas bon'?' bad':''}" style="--k:${k}"><div class="ra-rail"><i></i></div>${ETAPES.map(([e,l],j)=>`<div class="ra-pt ${j<k?'ok':j===k?'now':''}"><span>${j<=k?e:''}</span><small>${l}</small></div>`).join('')}</div>
  ${v==='pas bon'?`<p class="ra-sv-n">👎 Tu as dit « pas bon »${y.note?' : '+esc(y.note):''} · Atom le refait</p>`:v==='à vérifier'?`<p class="ra-sv-n v">👀 À toi de vérifier, puis dis-moi si c'est bon (en haut)</p>`:''}`}
function pill(v){const p=IT[v]||IT['reçu'];return `<span class="ra-p ${p[2]}">${p[0]} ${p[1]}</span>`}

function corps(){if(!ov)return;const sh=ov.querySelector('.ra-sh');let h='<button class="ra-x" aria-label="Fermer">✕</button>';
 if(st.vue==='nouvelle'){
  const c=st.cat&&CAT[st.cat];
  h+=bulle(st.liste.length?`C'est noté ! ${st.liste.length} changement${st.liste.length>1?'s':''} dans ta liste 👍`:'On fait ça étape par étape 👇',
     st.liste.length?'Tu veux changer autre chose ? Sinon, appuie sur « Envoyer à Atom ».':'Une seule chose à la fois. Choisis ce que tu veux changer.<span class="ra-free">🎁 C\'est gratuit, compris dans ton abonnement.</span>');
  if(st.liste.length)h+=`<div class="ra-h">Ma liste</div><ol class="ra-li">${st.liste.map((x,i)=>`<li><span class="ra-n2">${i+1}</span><span><b>${CAT[x.cat][0]} ${CAT[x.cat][1]}</b>${x.txt?`<small>${esc(x.txt)}</small>`:''}</span><button data-del="${i}" aria-label="Retirer">✕</button></li>`).join('')}</ol>`;
  h+=`<div class="ra-h">${st.liste.length?'Ajouter une autre chose':'1. Qu\'est-ce que tu veux changer ?'}</div>
   <div class="ra-cats">${Object.entries(CAT).map(([k,[e,n]])=>`<button type="button" data-cat="${k}" class="${k===st.cat?'on':''}"><span>${e}</span>${n}</button>`).join('')}</div>`;
  if(c)h+=`<div class="ra-h">2. Explique en quelques mots</div><textarea id="raTxt" rows="3" maxlength="500" placeholder="${esc(c[2])}"></textarea>
   <button class="ra-add" id="raAdd">➕ Ajouter « ${c[1]} » à ma liste</button>`;
  h+=`<button class="ra-go" id="raGo" ${st.liste.length?'':'disabled'}>📨 Envoyer à Atom${st.liste.length?` (${st.liste.length})`:''}</button>
   <button class="ra-lien" id="raRet">← Retour</button>`;
 }else{
  const av=aVerifier(),n=ouverts().length;
  h+=av.length?bulle('Atom a traité ta demande ! 🎉','Va voir sur ton site ou ton panel, puis dis-moi si c\'est bon.')
   :n?bulle(`Salut${R.nom?' '+esc(R.nom):''} ! C'est ${NOM_ROBOT} 💙`,'Atom a pris tes demandes en charge. Je te préviens dès qu\'il y a quelque chose à vérifier.')
   :bulle(`Salut${R.nom?' '+esc(R.nom):''} ! Moi c'est ${NOM_ROBOT}, le petit Atom 💙`,'Tu veux changer quelque chose sur ton site ou ton panel ? On le fait ensemble, étape par étape.<span class="ra-free">🎁 Les changements sont gratuits, c\'est compris dans ton abonnement.</span>');
  if(av.length)h+=`<div class="ra-h">👀 À vérifier <span>${av.length}</span></div>`+av.map(o=>`<div class="ra-d ra-vf"><b>${CAT[o.y.cat]?CAT[o.y.cat][0]+' '+CAT[o.y.cat][1]:'Changement'}</b>${o.y.txt?`<p>${esc(o.y.txt)}</p>`:''}
    ${o.y.reponse?`<div class="ra-rep"><b>Atom :</b> ${esc(o.y.reponse)}</div>`:''}
    ${st.nonId===o.d.id+'#'+o.i?`<textarea id="raNon" rows="2" maxlength="300" placeholder="Qu'est-ce qui ne va pas ?"></textarea><div class="ra-ok"><button class="ra-b2" data-non2="${o.d.id}#${o.i}">📨 Renvoyer à Atom</button><button class="ra-b3" data-ann="1">Annuler</button></div>`
    :`<div class="ra-ok"><button class="ra-b1" data-oui="${o.d.id}#${o.i}">👍 C'est bon</button><button class="ra-b2" data-non="${o.d.id}#${o.i}">👎 Pas bon</button></div>`}</div>`).join('');
  h+=bloque()?`<div class="ra-att">⏳ <span><b>Ta demande est chez l'équipe Atom.</b>Tu pourras en envoyer une nouvelle dès qu'Atom l'aura prise en charge.</span></div>`
   :`<button class="ra-go" id="raNew">➕ Demander un changement</button><p class="ra-free2">🎁 Gratuit · compris dans ton abonnement</p>`;
  h+=`<div class="ra-h">Mes demandes ${n?`<span>${n} en cours</span>`:''}</div>`;
  h+=st.L.length?st.L.slice().reverse().map(d=>`<div class="ra-d"><small class="ra-dd">Envoyée le ${fdate(d.date)}${d.heure?' à '+esc(d.heure):''}</small>${(d.items||[]).map((y,i)=>`<div class="ra-it"><span><b>${i+1}. ${CAT[y.cat]?CAT[y.cat][0]+' '+CAT[y.cat][1]:'Changement'}</b>${y.txt?`<small>${esc(y.txt)}</small>`:''}</span></div>${suivi(y)}`).join('')||`<p>${esc(d.txt||'')}</p>`}</div>`).join('')
   :`<div class="ra-vide">${svg(false)}<span>Pas encore de demande. ${NOM_ROBOT} fait la sieste… 😴</span></div>`;
  h+=`<p class="ra-tel">Urgent ? Appelle Atom : <a href="tel:${esc(R.tel||'0499374830')}">${esc(R.telAff||'0499 37 48 30')}</a></p>`;
 }
 sh.innerHTML=h;const $=q=>sh.querySelector(q);
 $('.ra-x').onclick=fermer;
 const b=(q,f)=>sh.querySelectorAll(q).forEach(x=>x.onclick=()=>f(x));
 b('#raNew',()=>{st.vue='nouvelle';st.cat=null;corps();sh.scrollTop=0});
 b('#raRet',()=>{st.vue='accueil';corps()});
 b('[data-cat]',x=>{st.cat=x.dataset.cat;corps();const t=$('#raTxt');if(t){t.focus();t.scrollIntoView({block:'center'})}});
 b('[data-del]',x=>{st.liste.splice(+x.dataset.del,1);ls.set(LSK+'_liste',st.liste);corps();maj()});
 b('#raAdd',()=>{const t=$('#raTxt'),v=t.value.trim();if(st.cat==='autre'&&v.length<3){t.classList.add('bad');t.focus();return}
   if(st.liste.length>=10)return;st.liste.push({cat:st.cat,txt:v});ls.set(LSK+'_liste',st.liste);st.cat=null;corps();maj();sh.scrollTop=0});
 b('#raGo',async g=>{if(!st.liste.length)return;g.disabled=true;g.textContent='Envoi…';
   const n=st.liste.length;try{await envoyer();await livraison(sh,n);faireLaFete();st.vue='accueil';corps();maj();const u=ov&&ov.querySelector('.ra-bul');if(u)u.innerHTML='<b>Bien arrivé chez l\'équipe Atom ! ✅</b>Je te préviens dès que c\'est traité. Tu pourras vérifier et me dire si c\'est bon.'}
   catch(e){g.disabled=false;g.textContent='📨 Envoyer à Atom';alert('Pas envoyé : vérifie ta connexion internet et réessaie.')}});
 const cle=v=>{const k=v.lastIndexOf('#');return[v.slice(0,k),+v.slice(k+1)]};
 b('[data-oui]',async x=>{const [d,i]=cle(x.dataset.oui);x.disabled=true;try{await valider(d,i,true);faireLaFete();corps();maj()}catch(e){x.disabled=false;alert('Pas envoyé : vérifie ta connexion.')}});
 b('[data-non]',x=>{st.nonId=x.dataset.non;corps();const t=$('#raNon');if(t)t.focus()});
 b('[data-ann]',()=>{st.nonId=null;corps()});
 b('[data-non2]',async x=>{const [d,i]=cle(x.dataset.non2),t=$('#raNon');x.disabled=true;try{await valider(d,i,false,t?t.value.trim():'');st.nonId=null;corps();maj();const u=ov&&ov.querySelector('.ra-bul');if(u)u.innerHTML='<b>OK, c\'est renvoyé à Atom 🔧</b>Il va le refaire. Je te préviens quand c\'est prêt.'}catch(e){x.disabled=false;alert('Pas envoyé : vérifie ta connexion.')}});
}

/* ---------- le robot fonce chez l'équipe Atom ---------- */
function livraison(sh,n){return new Promise(ok=>{const L=document.createElement('div');L.className='ra-liv';
  L.innerHTML=`<div class="ra-route"><span class="ra-vit"><i></i><i></i><i></i></span><div class="ra-run">${svg(true,true)}<span class="ra-env">✉️</span></div>
   <div class="ra-hq"><span>🏢</span><b>Équipe Atom</b></div></div>
   <p class="ra-lt">🚀 Le robot fonce chez l'équipe Atom avec ta demande${n>1?' ('+n+' changements)':''}…</p>`;
  sh.appendChild(L);sh.scrollTop=0;
  setTimeout(()=>{L.classList.add('ok');L.querySelector('.ra-lt').innerHTML='✅ <b>Bien arrivé !</b> L\'équipe Atom a ta demande.'},1900);
  setTimeout(()=>{L.classList.add('out');setTimeout(()=>{L.remove();ok()},300)},3300)})}

/* ---------- style ---------- */
const css=document.createElement('style');css.textContent=`
#robotAtom{--ra:var(--acc,var(--rose,#2F6BFF));position:fixed;right:14px;bottom:calc(92px + env(safe-area-inset-bottom,0px));z-index:120;width:66px;height:66px;border-radius:50%;border:0;padding:0;display:grid;place-items:center;
 background:radial-gradient(circle at 50% 35%,#fff,#eef2f7);box-shadow:0 12px 28px -10px color-mix(in srgb,var(--ra) 70%,#000),0 0 0 3px #fff,0 0 0 6px var(--ra);cursor:pointer;-webkit-tap-highlight-color:transparent}
#robotAtom[hidden]{display:none}
#robotAtom.dort .ra-svg{animation:ra-resp 3.2s ease-in-out infinite}
#robotAtom:not(.dort) .ra-svg{animation:ra-saut 2.4s ease-in-out infinite}
#robotAtom .ra-n{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;padding:0 5px;border-radius:11px;background:#E11D48;color:#fff;font:700 12px/22px system-ui,sans-serif;border:2px solid #fff;animation:ra-pop 1.6s infinite}
@keyframes ra-pop{50%{transform:scale(1.18)}}
.ra-img{display:block;height:58px;width:auto;pointer-events:none;user-select:none}.ra-img.g{height:92px}
.ra-vide .ra-img{height:48px}
#robotAtom .ra-img{margin-top:4px}
.ra-hello{position:fixed;z-index:121;background:#fff;color:#14171c;border-radius:16px 16px 4px 16px;padding:10px 14px;font:700 15px/1.2 system-ui,sans-serif;box-shadow:0 10px 26px -10px rgba(0,0,0,.4);border:2px solid var(--acc,var(--rose,#2F6BFF));animation:ra-in2 .35s;transition:opacity .4s,transform .4s}
.ra-hello.out{opacity:0;transform:translateY(6px)}@keyframes ra-in2{from{opacity:0;transform:translateY(8px) scale(.9)}}
#robotAtom.salut .ra-img{animation:ra-saut .6s ease-in-out 3}
[data-theme="dark"] .ra-hello{background:#15181e;color:#f2f4f7}
.ra-z{position:absolute;right:2px;top:-6px;pointer-events:none}
.ra-z i{position:absolute;right:0;top:0;font:800 11px/1 system-ui,sans-serif;color:var(--ra);opacity:0;animation:ra-z 3s infinite}
.ra-z i:nth-child(2){animation-delay:1s;font-size:13px}.ra-z i:nth-child(3){animation-delay:2s;font-size:15px}
@keyframes ra-z{0%{opacity:0;transform:translate(0,6px)}25%{opacity:1}100%{opacity:0;transform:translate(10px,-18px)}}
@keyframes ra-resp{50%{transform:scale(.94) translateY(2px)}}
@keyframes ra-saut{0%,70%,100%{transform:none}80%{transform:translateY(-4px) rotate(-6deg)}90%{transform:translateY(0) rotate(4deg)}}
.ra-svg .ra-or{fill:var(--ra,#2F6BFF)}.ra-svg .ra-col{fill:var(--ra,#2F6BFF);opacity:.85}
.ra-svg .ra-ant{fill:#c7cdd6}.ra-svg .ra-coeur{fill:#c7cdd6}
.ra-svg.on .ra-ant{fill:var(--ra,#2F6BFF);filter:drop-shadow(0 0 4px var(--ra,#2F6BFF));animation:ra-led 1.4s infinite}
.ra-svg.on .ra-coeur{fill:var(--ra,#2F6BFF);animation:ra-led 1.1s infinite}
@keyframes ra-led{50%{opacity:.45}}
.ra-svg .ra-yeux rect{animation:ra-cligne 4.5s infinite;transform-origin:center;transform-box:fill-box;filter:drop-shadow(0 0 3px #22d3ee)}
@keyframes ra-cligne{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
.ra-ov{position:fixed;inset:0;z-index:400;background:rgba(10,12,16,.5);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s}
.ra-ov.on{opacity:1}
.ra-sh{--ra:var(--acc,var(--rose,#2F6BFF));position:relative;width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#fff;color:#14171c;border-radius:24px 24px 0 0;padding:20px 18px calc(22px + env(safe-area-inset-bottom,0px));
 transform:translateY(40px);transition:transform .25s;font-family:inherit}
.ra-ov.on .ra-sh{transform:none}
.ra-x{position:absolute;right:12px;top:12px;width:38px;height:38px;border-radius:50%;border:0;background:#f1f3f6;font-size:16px;color:inherit;cursor:pointer}
.ra-hd{display:flex;gap:12px;align-items:flex-start;margin:4px 40px 12px 0}
.ra-hd .ra-svg{flex:none;animation:ra-saut 2.4s ease-in-out infinite}
.ra-bul{background:#f3f5f8;border-radius:4px 18px 18px 18px;padding:12px 14px;font-size:15px;line-height:1.4}
.ra-bul b{display:block;margin-bottom:3px;font-size:16px}
.ra-h{display:flex;justify-content:space-between;align-items:center;margin:18px 2px 8px;font-weight:800;font-size:13px;letter-spacing:.05em;text-transform:uppercase;color:#5b6472}
.ra-h span{text-transform:none;letter-spacing:0;font-weight:700}
.ra-cats{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.ra-cats button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 2px;border-radius:14px;border:2px solid #e2e5ea;background:#fff;color:inherit;font:700 12.5px/1.1 inherit;font-family:inherit;cursor:pointer}
.ra-cats button span{font-size:24px;line-height:1}
.ra-cats button.on{border-color:var(--ra);background:color-mix(in srgb,var(--ra) 12%,#fff)}
.ra-li{list-style:none;margin:0;padding:0}
.ra-li li{display:flex;align-items:center;gap:10px;border:2px solid #eceef2;border-radius:14px;padding:10px 10px 10px 12px;margin-bottom:6px}
.ra-li li>span:nth-child(2){flex:1;min-width:0}.ra-li b{display:block;font-size:15px}.ra-li small{display:block;color:#5b6472;font-size:13.5px;margin-top:2px}
.ra-n2{flex:none;width:28px;height:28px;border-radius:50%;background:var(--ra);color:#fff;display:grid;place-items:center;font-weight:800;font-size:14px}
.ra-li button{flex:none;width:34px;height:34px;border-radius:50%;border:0;background:#f1f3f6;color:inherit;cursor:pointer}
.ra-sh textarea{width:100%;border:2px solid #e2e5ea;border-radius:16px;padding:12px 14px;font:16px/1.4 inherit;font-family:inherit;resize:vertical;background:#fff;color:inherit;box-sizing:border-box}
.ra-sh textarea:focus{outline:none;border-color:var(--ra)}.ra-sh textarea.bad{border-color:#E11D48}
.ra-add{width:100%;margin-top:8px;padding:14px;border:2px dashed var(--ra);border-radius:16px;background:color-mix(in srgb,var(--ra) 8%,#fff);color:var(--ra);font:800 15.5px/1.2 inherit;font-family:inherit;cursor:pointer}
.ra-go{width:100%;margin-top:14px;padding:16px;border:0;border-radius:16px;background:var(--ra);color:#fff;font:800 17px/1 inherit;font-family:inherit;cursor:pointer}
.ra-go:disabled{opacity:.45}
.ra-lien{display:block;margin:10px auto 0;border:0;background:none;color:#5b6472;font:600 14px inherit;font-family:inherit;cursor:pointer;padding:8px}
.ra-d{border:2px solid #eceef2;border-radius:16px;padding:12px 14px;margin-bottom:8px}
.ra-d>b{font-size:15.5px}.ra-d p{margin:6px 0 0;font-size:15px;line-height:1.4;white-space:pre-line}
.ra-vf{border-color:#C4B5FD;background:#FAF7FF}
.ra-dd{color:#5b6472;font-size:13px}
.ra-it{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0 0}
.ra-it>span:first-child{min-width:0}.ra-it b{display:block;font-size:14.5px}.ra-it small{display:block;color:#5b6472;font-size:13px;margin-top:2px}
.ra-p{flex:none;font-size:12px;font-weight:800;padding:4px 9px;border-radius:999px;white-space:nowrap}
.ra-p1{background:#E7EEFF;color:#2F4FB8}.ra-p2{background:#FEF3C7;color:#92400E}.ra-p3{background:#DCFCE7;color:#166534}.ra-p4{background:#EDE9FE;color:#5B21B6}.ra-p5{background:#FDE2E1;color:#B42318}
.ra-rep{margin-top:8px;background:color-mix(in srgb,var(--ra) 10%,#fff);border-radius:12px;padding:9px 11px;font-size:14px;line-height:1.4}
.ra-ok{display:flex;gap:8px;margin-top:10px}.ra-ok button{flex:1;padding:13px 6px;border-radius:14px;border:0;font:800 15px/1 inherit;font-family:inherit;cursor:pointer}
.ra-b1{background:#16A34A;color:#fff}.ra-b2{background:#FDE2E1;color:#B42318}.ra-b3{background:#f1f3f6;color:inherit}
.ra-vf textarea{margin-top:10px}
.ra-free{display:block;margin-top:8px;font-weight:800;color:#15803D}
.ra-free2{text-align:center;margin:8px 0 0;font-size:13.5px;font-weight:800;color:#15803D}
[data-theme="dark"] .ra-free,[data-theme="dark"] .ra-free2{color:#4ade80}
.ra-liv{position:absolute;inset:0;z-index:5;background:#fff;border-radius:24px 24px 0 0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;animation:ra-in .25s;transition:opacity .3s}
.ra-liv.out{opacity:0}@keyframes ra-in{from{opacity:0}}
.ra-route{position:relative;width:100%;max-width:340px;height:120px;border-bottom:3px dashed #d6dae1}
.ra-run{position:absolute;left:0;bottom:6px;animation:ra-file 1.9s cubic-bezier(.5,0,.6,1) forwards}
.ra-run .ra-svg{animation:ra-cours .28s ease-in-out infinite}
.ra-env{position:absolute;right:-14px;top:22px;font-size:26px;animation:ra-cours .28s ease-in-out infinite reverse}
@keyframes ra-file{0%{transform:translateX(0)}15%{transform:translateX(-10px)}100%{transform:translateX(205px) scale(.6);opacity:.2}}
@keyframes ra-cours{50%{transform:translateY(-6px) rotate(6deg)}}
.ra-vit{position:absolute;left:0;bottom:30px;width:60%;animation:ra-file 1.9s cubic-bezier(.5,0,.6,1) forwards}
.ra-vit i{display:block;height:3px;border-radius:2px;background:var(--ra);opacity:.35;margin:8px 0;width:40px;animation:ra-trait .3s linear infinite}
.ra-vit i:nth-child(2){width:26px;margin-left:10px}.ra-vit i:nth-child(3){width:34px}
@keyframes ra-trait{to{transform:translateX(-20px);opacity:0}}
.ra-hq{position:absolute;right:0;bottom:6px;display:flex;flex-direction:column;align-items:center;gap:2px}
.ra-hq span{font-size:44px;line-height:1}.ra-hq b{font-size:12.5px;color:#5b6472}
.ra-liv.ok .ra-hq span{animation:ra-boum .5s}
@keyframes ra-boum{40%{transform:scale(1.35)}}
.ra-lt{margin:22px 0 0;text-align:center;font-size:16.5px;line-height:1.4;font-weight:600}
.ra-liv.ok .ra-lt{color:#15803D}
[data-theme="dark"] .ra-liv{background:#15181e}[data-theme="dark"] .ra-route{border-color:#2a2e36}[data-theme="dark"] .ra-hq b{color:#98a1b0}[data-theme="dark"] .ra-liv.ok .ra-lt{color:#4ade80}
@media (prefers-reduced-motion:reduce){.ra-run,.ra-vit,.ra-run .ra-svg,.ra-env{animation:none}}
.ra-att{display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:14px;border-radius:16px;background:#FEF3C7;color:#78350F;font-size:14.5px;line-height:1.4}
.ra-att b{display:block;font-size:15.5px;margin-bottom:2px}
.ra-suivi{position:relative;display:grid;grid-template-columns:repeat(4,1fr);margin:10px 0 4px}
.ra-rail{position:absolute;left:12.5%;right:12.5%;top:13px;height:4px;border-radius:2px;background:#e2e5ea}
.ra-rail i{display:block;height:100%;border-radius:2px;background:#16A34A;width:calc(var(--k) * 33.34%);transition:width .6s}
.ra-pt{position:relative;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.ra-pt span{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;font-size:14px;background:#fff;border:3px solid #e2e5ea}
.ra-pt.ok span{border-color:#16A34A;background:#DCFCE7}
.ra-pt.now span{border-color:var(--ra);background:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--ra) 22%,transparent);animation:ra-pop 1.6s infinite}
.ra-pt small{font-size:11.5px;font-weight:700;color:#8a93a3;line-height:1.15}
.ra-pt.ok small,.ra-pt.now small{color:inherit}
.ra-suivi.bad .ra-pt.now span{border-color:#E11D48}
.ra-sv-n{margin:6px 0 2px!important;font-size:13px!important;font-weight:700;color:#B42318}.ra-sv-n.v{color:#5B21B6}
[data-theme="dark"] .ra-att{background:#3d300a;color:#fde68a}
[data-theme="dark"] .ra-rail{background:#2a2e36}[data-theme="dark"] .ra-pt span{background:#15181e;border-color:#2a2e36}
[data-theme="dark"] .ra-pt.ok span{background:#062b12;border-color:#22c55e}[data-theme="dark"] .ra-pt.now span{background:#15181e;border-color:var(--ra)}
[data-theme="dark"] .ra-sv-n{color:#f87171}[data-theme="dark"] .ra-sv-n.v{color:#c4b5fd}
.ra-vide{display:flex;align-items:center;gap:10px;color:#5b6472;font-size:14px;padding:6px 2px}
.ra-tel{text-align:center;color:#5b6472;font-size:13.5px;margin:14px 0 0}.ra-tel a{color:var(--ra);font-weight:800}
[data-theme="dark"] #robotAtom{background:radial-gradient(circle at 50% 35%,#2a3040,#161a22);box-shadow:0 12px 28px -10px #000,0 0 0 3px #15181e,0 0 0 6px var(--ra)}
[data-theme="dark"] .ra-sh{background:#15181e;color:#f2f4f7}
[data-theme="dark"] .ra-x,[data-theme="dark"] .ra-bul,[data-theme="dark"] .ra-li button,[data-theme="dark"] .ra-b3{background:#1f232b}
[data-theme="dark"] .ra-cats button,[data-theme="dark"] .ra-sh textarea{background:#0d0f13;border-color:#2a2e36}
[data-theme="dark"] .ra-cats button.on{background:color-mix(in srgb,var(--ra) 22%,#0d0f13)}
[data-theme="dark"] .ra-add{background:color-mix(in srgb,var(--ra) 14%,#15181e)}
[data-theme="dark"] .ra-d,[data-theme="dark"] .ra-li li{border-color:#2a2e36}
[data-theme="dark"] .ra-vf{border-color:#5B21B6;background:#1c1530}
[data-theme="dark"] .ra-h,[data-theme="dark"] .ra-dd,[data-theme="dark"] .ra-it small,[data-theme="dark"] .ra-li small,[data-theme="dark"] .ra-vide,[data-theme="dark"] .ra-tel,[data-theme="dark"] .ra-lien{color:#98a1b0}
[data-theme="dark"] .ra-rep{background:color-mix(in srgb,var(--ra) 18%,#15181e)}
@media (prefers-reduced-motion:reduce){#robotAtom .ra-svg,.ra-z i,.ra-hd .ra-svg,#robotAtom .ra-n{animation:none}}`;
if(R.gratuit===false)css.textContent+='.ra-free,.ra-free2{display:none!important}';
if(R.cote==='gauche')css.textContent+='#robotAtom{right:auto;left:14px}';
if(R.bas)css.textContent+='#robotAtom{bottom:calc('+R.bas+'px + env(safe-area-inset-bottom,0px))}';
document.head.appendChild(css);
window.ROBOT_ATOM_RECHARGER=charger;
})();
