/* Optionaler Web Push; keine Trainings- oder Profildaten verlassen das Geraet. */
(()=>{'use strict';
const BASE=String(window.MYTRAINING_PUSH_URL||'').replace(/\/$/,'');
const KEY='mytraining-push-token-v1';
const $=id=>document.getElementById(id);
const status=t=>{const e=$('xp-reminder-state');if(e)e.textContent=t;};
const support=()=>('serviceWorker'in navigator&&'PushManager'in window&&'Notification'in window&&window.isSecureContext);
function key(){let t=localStorage.getItem(KEY);if(!t){t=crypto.randomUUID()+crypto.randomUUID();localStorage.setItem(KEY,t);}return t;}
function decode(s){const padding='='.repeat((4-s.length%4)%4);const raw=atob((s+padding).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function getConfig(){const r=await fetch(BASE+'/public-key',{cache:'no-store'});if(!r.ok)throw new Error('Push-Konfiguration nicht erreichbar');return (await r.json()).publicKey;}
async function subscribe(){
 if(!BASE)throw new Error('Cloudflare Worker noch nicht eingerichtet. Siehe README Abschnitt Push.');
 if(!support())throw new Error('Web Push wird hier nicht unterstützt. Auf iOS die App zum Home-Bildschirm hinzufügen und von dort öffnen.');
 const reg=await navigator.serviceWorker.ready;
 // iOS requires the request originate from a user gesture, called directly from toggle callback.
 const perm=await Notification.requestPermission();
 if(perm!=='granted')throw new Error('Bitte Benachrichtigungen in den Geräteeinstellungen erlauben.');
 const pub=await getConfig();
 let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:decode(pub)});
 const r=await fetch(BASE+'/subscription',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:key(),subscription:sub.toJSON()})});
 if(!r.ok)throw new Error('Registrierung fehlgeschlagen (HTTP '+r.status+').');
 status('Aktiv: Push an Trainingstagen um 08:00 Uhr (Europe/Berlin), auch bei geschlossener Home-Bildschirm-App.');
 return true;
}
async function unsubscribe(){
 if(BASE){try{await fetch(BASE+'/subscription',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({token:key()})});}catch(e){throw new Error('Server nicht erreichbar. Zum sicheren Abschalten Verbindung herstellen.');}}
 if(support()){const reg=await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();await sub?.unsubscribe();}
 status('Push-Benachrichtigungen ausgeschaltet.');return false;
}
async function update(enabled){try{const ok=enabled?await subscribe():await unsubscribe();return ok;}catch(e){status(e.message||'Push konnte nicht eingerichtet werden.');return null;}}
window.MyTrainingPush={update,configured:!!BASE,support};
})();
