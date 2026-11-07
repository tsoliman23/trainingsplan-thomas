import { buildPushPayload } from '@block65/webcrypto-web-push';
const ALLOWED_DAYS=['Mon','Wed','Fri'];
const allowedToken=t=>typeof t==='string'&&/^[a-zA-Z0-9-]{60,110}$/.test(t);
const validSub=s=>s&&typeof s.endpoint==='string'&&s.endpoint.startsWith('https://')&&s.endpoint.length<2048&&s.keys&&typeof s.keys.p256dh==='string'&&typeof s.keys.auth==='string'&&s.keys.p256dh.length<200&&s.keys.auth.length<100;
function json(value,status=200,origin=''){return new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json;charset=UTF-8','cache-control':'no-store',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});}
function berlinTime(date=new Date()){
 return Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short',hour:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
}
function vapid(env){return {subject:env.VAPID_SUBJECT,publicKey:env.VAPID_SERVER_PUBLIC_KEY,privateKey:env.VAPID_SERVER_PRIVATE_KEY};}
async function deliver(env,subscription,data){
 const payload=await buildPushPayload({data:JSON.stringify(data),options:{ttl:3600}},subscription,vapid(env));
 return fetch(subscription.endpoint,payload);
}
async function scheduledPush(env){
 const local=berlinTime();
 if(local.hour!=='08'||!ALLOWED_DAYS.includes(local.weekday))return;
 const stamp=`${local.year}-${local.month}-${local.day}`;
 let cursor;
 do{
  const page=await env.SUBSCRIPTIONS.list({prefix:'sub:',limit:100,...(cursor?{cursor}:{})});
  cursor=page.list_complete?null:page.cursor;
  // Sequential to keep external connection count and free-tier CPU usage bounded.
  for(const item of page.keys){
   const sentKey=`sent:${stamp}:${item.name.slice(4)}`;
   if(await env.SUBSCRIPTIONS.get(sentKey))continue;
   const sub=await env.SUBSCRIPTIONS.get(item.name,'json');
   if(!validSub(sub))continue;
   try{
    const res=await deliver(env,sub,{title:'MyTraining – Trainingstag',body:'Guten Morgen! Dein Trainingsplan ist für heute bereit.'});
    if(res.ok)await env.SUBSCRIPTIONS.put(sentKey,'1',{expirationTtl:172800});
    else if([404,410].includes(res.status))await env.SUBSCRIPTIONS.delete(item.name);
    else console.warn('Push response',res.status);
   }catch(e){console.error('Push error',String(e).slice(0,160));}
  }
 }while(cursor);
}
export default {
 async fetch(req,env){
  const url=new URL(req.url),origin=req.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN;
  if(req.method==='OPTIONS'&&origin===allowed)return new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET,POST,DELETE,OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'3600','vary':'Origin'}});
  if(origin!==allowed)return json({error:'Nicht autorisierter Ursprung'},403);
  if(req.method==='GET'&&url.pathname==='/public-key')return json({publicKey:env.VAPID_SERVER_PUBLIC_KEY},200,allowed);
  if(!['/subscription','/test'].includes(url.pathname))return json({error:'Nicht gefunden'},404,allowed);
  if(Number(req.headers.get('content-length')||0)>5000)return json({error:'Anfrage zu groß'},413,allowed);
  let body;try{body=await req.json();}catch{return json({error:'JSON erwartet'},400,allowed);}
  if(!allowedToken(body?.token))return json({error:'Ungültiges Registrierungstoken'},400,allowed);
  const id='sub:'+body.token;
  if(url.pathname==='/subscription'&&req.method==='POST'){
   if(!validSub(body.subscription))return json({error:'Ungültige Push-Registrierung'},400,allowed);
   await env.SUBSCRIPTIONS.put(id,JSON.stringify(body.subscription));return json({ok:true},200,allowed);
  }
  if(url.pathname==='/subscription'&&req.method==='DELETE'){
   await env.SUBSCRIPTIONS.delete(id);return json({ok:true},200,allowed);
  }
  if(url.pathname==='/test'&&req.method==='POST'){
   const sub=await env.SUBSCRIPTIONS.get(id,'json');
   if(!validSub(sub))return json({error:'Gerät ist nicht für Push registriert'},404,allowed);
   const limitKey='test-limit:'+body.token;
   if(await env.SUBSCRIPTIONS.get(limitKey))return json({error:'Bitte 60 Sekunden bis zum nächsten Test warten'},429,allowed);
   // Avoid unlimited test requests on the free tier. KV consistency is eventual,
   // so this is a best-effort limit rather than a strict global guarantee.
   await env.SUBSCRIPTIONS.put(limitKey,'1',{expirationTtl:60});
   try{
    const res=await deliver(env,sub,{title:'MyTraining – Test erfolgreich',body:'Deine Trainingserinnerungen sind eingerichtet.'});
    if([404,410].includes(res.status)){await env.SUBSCRIPTIONS.delete(id);return json({error:'Push-Registrierung ist abgelaufen. Bitte erneut aktivieren.'},410,allowed);}
    if(!res.ok)return json({error:'Push-Dienst meldet HTTP '+res.status},502,allowed);
    return json({ok:true},200,allowed);
   }catch(e){console.error('Test push error',String(e).slice(0,150));return json({error:'Testversand fehlgeschlagen'},502,allowed);}
  }
  return json({error:'Methode nicht erlaubt'},405,allowed);
 },
 async scheduled(_event,env,ctx){ctx.waitUntil(scheduledPush(env));}
};
