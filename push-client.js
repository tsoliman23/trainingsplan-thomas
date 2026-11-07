/* MyTraining Web Push: subscriptions only; no training information leaves the device. */
(()=>{'use strict';
const BASE=String(window.MYTRAINING_PUSH_URL||'').trim().replace(/\/$/,'');
const KEY='mytraining-push-token-v1';
const $=id=>document.getElementById(id);
const status=t=>{const e=$('xp-reminder-state');if(e)e.textContent=t;};
const supported=()=>('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&window.isSecureContext);
function token(){let t=localStorage.getItem(KEY);if(!t){t=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem(KEY,t);}return t;}
function decode(s){const pad='='.repeat((4-s.length%4)%4);return Uint8Array.from(atob((s+pad).replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
async function request(path,method='GET',data){
 const r=await fetch(BASE+path,{method,headers:data?{'content-type':'application/json'}:{},body:data?JSON.stringify(data):undefined,cache:'no-store'});
 let json={};try{json=await r.json();}catch(_){ }
 if(!r.ok)throw new Error(json.error||`Push-Dienst antwortet mit HTTP ${r.status}`);
 return json;
}
async function subscribe(){
 if(!BASE)throw new Error('Cloudflare Worker noch nicht eingerichtet. Siehe README Abschnitt Push.');
 if(!supported())throw new Error('Auf dem iPhone MyTraining über Safari zum Home-Bildschirm hinzufügen und über das App-Symbol öffnen.');
 // IMPORTANT: requestPermission is invoked before the first await: iOS requires a direct user gesture.
 const permission=Notification.permission==='granted'?'granted':await Notification.requestPermission();
 if(permission!=='granted')throw new Error('Benachrichtigungen wurden nicht erlaubt. Bitte in den iPhone-Einstellungen freigeben.');
 const [reg,config]=await Promise.all([navigator.serviceWorker.ready,request('/public-key')]);
 let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(config.publicKey)});
 try{await request('/subscription','POST',{token:token(),subscription:sub.toJSON()});}
 catch(e){await sub.unsubscribe().catch(()=>{});throw e;}
 status('Push aktiv. Erinnerungen: Montag, Mittwoch, Freitag um 08:00 Uhr (Berlin).');
 return true;
}
async function unsubscribe(){
 // If registered, removal at server must succeed before changing the local state.
 if(BASE)await request('/subscription','DELETE',{token:token()});
 if(supported()){
  const reg=await navigator.serviceWorker.ready;
  const sub=await reg.pushManager.getSubscription();
  await sub?.unsubscribe();
 }
 status('Push-Benachrichtigungen sind ausgeschaltet.');return false;
}
async function test(){
 if(!BASE)throw new Error('Bitte zunächst den Cloudflare Worker einrichten.');
 if(!supported())throw new Error('Web Push wird in dieser Ansicht nicht unterstützt.');
 const reg=await navigator.serviceWorker.ready;
 if(Notification.permission!=='granted'||!await reg.pushManager.getSubscription())throw new Error('Bitte zuerst Trainingserinnerungen aktivieren.');
 await request('/test','POST',{token:token()});
 status('Testbenachrichtigung versendet. Bitte den Sperrbildschirm und Benachrichtigungseinstellungen prüfen.');
 return true;
}
async function update(enabled){try{return enabled?await subscribe():await unsubscribe();}catch(e){status(e.message||'Push konnte nicht eingerichtet werden.');return null;}}
async function sendTest(){try{return await test();}catch(e){status(e.message||'Testbenachrichtigung fehlgeschlagen.');return false;}}
async function isSubscribed(){if(!BASE||!supported()||Notification.permission!=='granted')return false;try{const reg=await navigator.serviceWorker.ready;return Boolean(await reg.pushManager.getSubscription());}catch{return false;}}
window.MyTrainingPush={update,sendTest,isSubscribed,configured:Boolean(BASE),support:supported};
})();
