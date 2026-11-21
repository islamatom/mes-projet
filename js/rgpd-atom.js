/* ===== 🍪 RGPD Atom v1 : bandeau cookies + mentions légales + confidentialité + cookies, commun à tous les sites =====
   Chaque site met SES infos dans son propre dépôt, avant ce script :
   <script>window.RGPD_ATOM={societe:'…',forme:'SRL',adresse:'…',bce:'BE 0…',email:'…',tel:'…',
     hebergeur:'hostinger',donnees:['nom','téléphone'],finalites:['gérer vos rendez-vous'],destinataires:[],conservation:'3 ans',couleur:'#e30613'}<\/script>
   <script src="https://islamatom.github.io/mes-projet/js/rgpd-atom.js" defer><\/script>
   Cartes / vidéos : remplacer src="…" par data-rgpd-src="…" sur l'iframe → bloquée tant que le visiteur n'a pas dit oui.
   Ouvrir une page depuis un lien du site : <a href="#confidentialite"> / #mentions-legales / #cookies, ou rgpdAtom.ouvrir('cookies'). */
(function(){
if(window.rgpdAtom)return;
const C=Object.assign({hebergeur:'hostinger',donnees:[],finalites:[],destinataires:[],conservation:'',bandeau:'auto',liens:true},window.RGPD_ATOM||{});
const VERSION=1, CLE='rgpd_atom_choix', DUREE=182*864e5; // on redemande après 6 mois
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const A=v=>v?esc(v):'<span class="rga-manque">à compléter</span>';
const ls={get(){try{const v=JSON.parse(localStorage.getItem(CLE));return v&&v.v===VERSION&&Date.now()-v.t<DUREE?v:null}catch(e){return null}},
  set(o){try{localStorage.setItem(CLE,JSON.stringify(Object.assign({v:VERSION,t:Date.now()},o)))}catch(e){}}};
const HEB={hostinger:'Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre — www.hostinger.com',
  github:'GitHub, Inc. (GitHub Pages), 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis — pages.github.com',
  netlify:'Netlify, Inc., 512 2nd Street, San Francisco, CA 94107, États-Unis — www.netlify.com'};
const KIND={maps:['🗺️','la carte Google Maps','Google'],youtube:['▶️','la vidéo YouTube','Google (YouTube)'],autre:['🧩','ce contenu externe','un service externe']};
const kind=u=>/google\.[a-z.]+\/maps|maps\.google/.test(u)?'maps':/youtube|youtu\.be/.test(u)?'youtube':'autre';

/* ---------- style (suit le jour/nuit du site) ---------- */
const css=`
.rga,.rga *{box-sizing:border-box;font-family:inherit}
.rga{--rga-bg:#16181d;--rga-fg:#f2f3f5;--rga-mut:#a3a8b3;--rga-li:#2a2e36;--rga-acc:${C.couleur||'#4f8cff'};color:var(--rga-fg)}
html.rga-clair .rga{--rga-bg:#fff;--rga-fg:#15171b;--rga-mut:#5d636e;--rga-li:#e3e5e9}
.rga{text-align:left;letter-spacing:normal;text-transform:none}
.rga-ban{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:520px;margin:0 auto;background:var(--rga-bg);border:1px solid var(--rga-li);
 border-radius:18px;padding:16px;box-shadow:0 12px 40px rgba(0,0,0,.35);font-size:14px;line-height:1.45;animation:rgaUp .35s ease}
@keyframes rgaUp{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.rga-ban h3{margin:0 0 6px;font-size:16px}.rga-ban p{margin:0 0 12px;color:var(--rga-mut)}
.rga a.rga-l,.rga button.rga-l{color:var(--rga-acc);text-decoration:underline;background:none;border:0;padding:0;font:inherit;cursor:pointer}
.rga-bts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rga-b{min-height:46px;border-radius:12px;border:1px solid var(--rga-li);background:transparent;color:var(--rga-fg);font-weight:700;font-size:15px;cursor:pointer}
.rga-b.p{background:var(--rga-acc);border-color:var(--rga-acc);color:#fff}
.rga-b.w{grid-column:1/-1;min-height:40px;font-weight:600;font-size:14px;color:var(--rga-mut)}
.rga-opt{display:flex;gap:10px;align-items:flex-start;padding:10px 0;border-top:1px solid var(--rga-li)}
.rga-opt b{display:block}.rga-opt small{color:var(--rga-mut)}
.rga-sw{margin-left:auto;flex:none;width:46px;height:28px;border-radius:20px;background:var(--rga-li);position:relative;border:0;cursor:pointer}
.rga-sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:.2s}
.rga-sw[aria-checked="true"]{background:var(--rga-acc)}.rga-sw[aria-checked="true"]::after{left:21px}.rga-sw:disabled{opacity:.6}
.rga-fond{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}
.rga-page{background:var(--rga-bg);width:100%;max-width:720px;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:18px 18px 28px;font-size:14.5px;line-height:1.55;-webkit-overflow-scrolling:touch}
@media (min-width:760px){.rga-fond{align-items:center}.rga-page{border-radius:20px}}
.rga-tete{position:sticky;top:-18px;margin:-18px -18px 8px;padding:14px 18px;background:var(--rga-bg);border-bottom:1px solid var(--rga-li);display:flex;gap:6px;align-items:center}
.rga-tab{border:1px solid var(--rga-li);background:transparent;color:var(--rga-mut);border-radius:20px;padding:7px 11px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}
.rga-tab.on{background:var(--rga-acc);border-color:var(--rga-acc);color:#fff}
.rga-x{margin-left:auto;width:36px;height:36px;border-radius:50%;border:1px solid var(--rga-li);background:transparent;color:var(--rga-fg);font-size:16px;cursor:pointer;flex:none}
.rga-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}.rga-tabs::-webkit-scrollbar{display:none}
.rga-page h2{text-align:left;font-size:20px;margin:10px 0 6px}.rga-page h4{font-size:15px;margin:16px 0 4px}.rga-page p,.rga-page li{color:var(--rga-mut)}.rga-page b{color:var(--rga-fg)}
.rga-page ul{padding-left:18px;margin:4px 0}
.rga-manque{background:#ffd54a;color:#3a2c00;border-radius:5px;padding:0 5px;font-weight:700;font-size:.9em}
.rga-tb{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0}.rga-tb td,.rga-tb th{border:1px solid var(--rga-li);padding:7px;text-align:left;vertical-align:top}
.rga-bloc{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;padding:18px;min-height:200px;width:100%;height:100%;
 background:var(--rga-bg);border:1px dashed var(--rga-li);border-radius:14px;font-size:14px;line-height:1.4}
.rga-bloc .rga-b{padding:0 18px}.rga-bloc small{color:var(--rga-mut)}
.rga-pied{text-align:center;font-size:12.5px;padding:10px 12px 14px;color:var(--rga-mut)}
.rga-pied button{color:inherit;text-decoration:underline;background:none;border:0;font:inherit;cursor:pointer;padding:4px 2px}
`;

/* ---------- les 3 pages ---------- */
function pMentions(){return `<h2>Mentions légales</h2>
<p><b>Éditeur du site</b><br>${A(C.societe)}${C.forme?' ('+esc(C.forme)+')':''}<br>${A(C.adresse)}<br>
N° d'entreprise (BCE) : ${A(C.bce)}${C.tva&&C.tva!==C.bce?'<br>TVA : '+esc(C.tva):''}<br>E-mail : ${A(C.email)}${C.tel?'<br>Téléphone : '+esc(C.tel):''}</p>
${C.profession?`<p><b>Profession réglementée</b><br>${esc(C.profession)}</p>`:''}
<p><b>Hébergement</b><br>${esc(HEB[C.hebergeur]||C.hebergeur)}</p>
<p><b>Conception du site</b><br>Atom — atomweb.be</p>
<p>Les textes, photos et logos de ce site appartiennent à leur propriétaire et ne peuvent pas être réutilisés sans accord.</p>`}
function pConf(){const li=a=>a.length?'<ul>'+a.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+A('')+'</p>';
return `<h2>Politique de confidentialité</h2>
<p>Nous respectons votre vie privée et le Règlement général sur la protection des données (RGPD).</p>
<h4>Qui est responsable ?</h4><p>${A(C.societe)}, ${A(C.adresse)} — ${A(C.email)}.</p>
<h4>Quelles données ?</h4>${li(C.donnees)}
<h4>Pourquoi ?</h4>${li(C.finalites)}
<p>Base légale : l'exécution de votre demande ou de votre rendez-vous, nos obligations légales (facturation) et, pour les cookies non essentiels, votre consentement.</p>
<h4>Combien de temps ?</h4><p>${C.conservation?esc(C.conservation):A('')}. Les factures sont gardées 7 ans (obligation comptable belge).</p>
<h4>Qui les reçoit ?</h4><p>Uniquement nous et nos prestataires techniques, qui n'ont pas le droit de les utiliser pour eux : hébergeur du site${C.destinataires.length?', '+C.destinataires.map(esc).join(', '):''}. Vos données ne sont jamais vendues.</p>
<h4>Vos droits</h4><p>Vous pouvez à tout moment demander à voir, corriger, effacer ou récupérer vos données, ou vous opposer à leur utilisation : écrivez à ${A(C.email)}. Réponse sous 1 mois.</p>
<p>Si vous n'êtes pas satisfait, vous pouvez porter plainte auprès de l'<b>Autorité de protection des données</b>, rue de la Presse 35, 1000 Bruxelles — www.autoriteprotectiondonnees.be.</p>`}
function pCookies(){const ext=embeds().length||C.cookiesTiers;return `<h2>Politique cookies</h2>
<p>Un cookie (ou « stockage local ») est un petit fichier gardé par votre navigateur.</p>
<table class="rga-tb"><tr><th>Quoi</th><th>Pourquoi</th><th>Durée</th></tr>
<tr><td><b>Essentiels</b> (stockage local de ce site)</td><td>Retenir vos réglages (jour/nuit, votre choix cookies, votre demande en cours). Sans eux, le site ne marche pas bien. Pas besoin d'accord.</td><td>Jusqu'à 6 mois</td></tr>
${ext?`<tr><td><b>Contenus externes</b>${hasKind('maps')?' — Google Maps':''}${hasKind('youtube')?' — YouTube':''}</td><td>Afficher la carte ou la vidéo. Google peut alors déposer ses propres cookies. Chargé <b>seulement si vous dites oui</b>.</td><td>Selon Google</td></tr>`:''}
</table>
<p>Nous n'utilisons <b>aucun cookie de pub ni de statistiques</b>.</p>
${ext?`<p><button class="rga-l" data-rga="choix">Changer mon choix cookies</button></p>`:''}`}

/* ---------- contenus externes (cartes, vidéos) ---------- */
function embeds(){return [...document.querySelectorAll('iframe[data-rgpd-src]')]}
function hasKind(k){return embeds().some(f=>kind(f.dataset.rgpdSrc)===k)}
function appliquer(){const ok=!!(ls.get()||{}).externe;
 embeds().forEach(f=>{let b=f.previousElementSibling;b=b&&b.classList&&b.classList.contains('rga-bloc')?b:null;
  if(ok){if(f.getAttribute('src')!==f.dataset.rgpdSrc)f.setAttribute('src',f.dataset.rgpdSrc);f.style.display='';if(b)b.remove();return}
  f.removeAttribute('src');f.style.display='none';
  if(!b){const k=KIND[kind(f.dataset.rgpdSrc)];b=document.createElement('div');b.className='rga rga-bloc';
   b.style.minHeight=(f.getAttribute('height')||f.offsetHeight||220)+'px';
   b.innerHTML=`<div style="font-size:28px">${k[0]}</div><div>Pour voir ${k[1]}, il faut accepter les cookies de ${k[2]}.</div>
   <button class="rga-b p" data-rga="oui1">Afficher ${k[1].replace(/^la /,'la ')}</button><small><button class="rga-l" data-rga="page" data-p="cookies">En savoir plus</button></small>`;
   f.parentNode.insertBefore(b,f)}})}
function choisir(externe){ls.set({externe:!!externe});fermerBandeau();appliquer()}

/* ---------- bandeau ---------- */
let ban=null;
function besoinBandeau(){return C.bandeau==='toujours'||(C.bandeau!=='jamais'&&(embeds().length||C.cookiesTiers))}
function bandeau(detail){fermerBandeau();ban=document.createElement('div');ban.className='rga rga-ban';ban.setAttribute('role','dialog');ban.setAttribute('aria-label','Cookies');
 const ext=embeds().length||C.cookiesTiers,cur=!!(ls.get()||{}).externe;
 ban.innerHTML=detail?`<h3>🍪 Mes choix</h3>
  <div class="rga-opt"><div><b>Essentiels</b><small>Font marcher le site. Toujours actifs.</small></div><button class="rga-sw" aria-checked="true" disabled aria-label="Essentiels"></button></div>
  ${ext?`<div class="rga-opt"><div><b>Contenus externes</b><small>Cartes Google Maps, vidéos YouTube.</small></div><button class="rga-sw" id="rga-sw" role="switch" aria-checked="${cur}" aria-label="Contenus externes"></button></div>`:''}
  <div class="rga-bts" style="margin-top:6px"><button class="rga-b" data-rga="non">Tout refuser</button><button class="rga-b p" data-rga="garder">Enregistrer</button></div>`
 :`<h3>🍪 Cookies</h3><p>${ext?'Ce site utilise des cookies essentiels. Avec votre accord, il affiche aussi des contenus de Google (carte, vidéo) qui déposent leurs cookies.':'Ce site n\'utilise que des cookies essentiels, sans pub ni statistiques.'}
  <button class="rga-l" data-rga="page" data-p="cookies">En savoir plus</button></p>
  <div class="rga-bts">${ext?'<button class="rga-b" data-rga="non">Refuser</button><button class="rga-b p" data-rga="oui">Accepter</button><button class="rga-b w" data-rga="detail">Choisir</button>':'<button class="rga-b p" data-rga="non" style="grid-column:1/-1">OK</button>'}</div>`;
 document.body.appendChild(ban)}
function fermerBandeau(){if(ban){ban.remove();ban=null}}

/* ---------- fenêtre des pages ---------- */
let fen=null;
const PAGES={'mentions-legales':['Mentions',pMentions],confidentialite:['Confidentialité',pConf],cookies:['Cookies',pCookies]};
function ouvrir(p){p=PAGES[p]?p:'mentions-legales';fermer();fen=document.createElement('div');fen.className='rga rga-fond';
 fen.innerHTML=`<div class="rga-page" role="dialog" aria-modal="true"><div class="rga-tete"><div class="rga-tabs">${Object.keys(PAGES).map(k=>`<button class="rga-tab${k===p?' on':''}" data-rga="page" data-p="${k}">${PAGES[k][0]}</button>`).join('')}</div><button class="rga-x" data-rga="fermer" aria-label="Fermer">✕</button></div>${PAGES[p][1]()}
 <p style="font-size:12px;margin-top:18px">Mise à jour : ${esc(C.maj||new Date().toLocaleDateString('fr-BE',{month:'long',year:'numeric'}))}</p></div>`;
 fen.addEventListener('click',e=>{if(e.target===fen)fermer()});document.body.appendChild(fen);document.documentElement.style.overflow='hidden'}
function fermer(){if(fen){fen.remove();fen=null;document.documentElement.style.overflow=''}}

/* ---------- liens en bas de page ---------- */
function pied(){if(!C.liens||document.querySelector('.rga-pied'))return;const d=document.createElement('div');d.className='rga rga-pied';
 d.innerHTML=`<button data-rga="page" data-p="mentions-legales">Mentions légales</button> · <button data-rga="page" data-p="confidentialite">Confidentialité</button> · <button data-rga="page" data-p="cookies">Cookies</button>${(embeds().length||C.cookiesTiers)?' · <button data-rga="choix">Gérer mes cookies</button>':''}`;
 const f=document.querySelector(C.pied||'footer');if(f)f.appendChild(d);else document.body.appendChild(d)}

/* ---------- clics ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('[data-rga]');
 if(!t){const a=e.target.closest('a[href^="#"]');if(a){const h=a.getAttribute('href').slice(1);if(PAGES[h]){e.preventDefault();ouvrir(h)}}return}
 e.preventDefault();const k=t.dataset.rga;
 if(k==='oui'||k==='oui1')choisir(true);else if(k==='non')choisir(false);else if(k==='detail'||k==='choix'){fermer();bandeau(true)}
 else if(k==='garder'){const s=document.getElementById('rga-sw');choisir(s&&s.getAttribute('aria-checked')==='true')}
 else if(k==='page')ouvrir(t.dataset.p);else if(k==='fermer')fermer()});
document.addEventListener('click',e=>{const s=e.target.closest('#rga-sw');if(s)s.setAttribute('aria-checked',s.getAttribute('aria-checked')!=='true')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')fermer()});

/* jour / nuit : on regarde la vraie couleur de fond du site (marche avec tous les thèmes) */
function fond(){for(const el of [document.body,document.documentElement]){const m=getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if(m&&(m[3]===undefined||+m[3]>.5))return .2126*m[0]+.7152*m[1]+.0722*m[2]}return 255}
function theme(){document.documentElement.classList.toggle('rga-clair',fond()>140)}
function go(){theme();new MutationObserver(theme).observe(document.body,{attributes:true,attributeFilter:['class','data-theme','style']});
 new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','style']});
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 appliquer();pied();if(besoinBandeau()&&!ls.get())bandeau(false);
 const h=location.hash.slice(1);if(PAGES[h])ouvrir(h)}
window.rgpdAtom={ouvrir,fermer,choix:()=>bandeau(true),version:VERSION};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go();
})();
