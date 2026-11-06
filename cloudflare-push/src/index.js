import { buildPushPayload } from '@block65/webcrypto-web-push';
const reply=(obj,status=200,origin='')=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8',...(origin?{'access-control-allow-origin':origin,'vary':'Origin'}:{})}});
const validSub=s=>s&&typeof s.endpoint==='string'&&s.endpoint.startsWith('https://')&&s.endpoint.length<2048&&s.keys&&typeof s.keys.p256dh==='string'&&typeof s.keys.auth==='string'&&s.keys.p256dh.length<200&&s.keys.auth.length<100;
const validToken=t=>typeof t==='string'&&/^[a-zA-Z0-9-]{60,110}$/.test(t);
function bTime(){const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23',weekday:'short'}).formatToParts(new Date()).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return parts;}
async function fire(env){
 const d=bTime();if(d.hour!=='08'||!['Mon','Wed','Fri'].includes(d.weekday))return;
 const date=`${d.year}-${d.month}-${d.day}`;let cursor;
 do{const batch=await env.SUBSCRIPTIONS.list({prefix:'sub:',limit:1000,...(cursor?{cursor}:{})});cursor=batch.list_complete?null:batch.cursor;
 for(const row of batch.keys){
  const sentKey='sent:'+date+':'+row.name.slice(4);
  if(await env.SUBSCRIPTIONS.get(sentKey))continue;
  const sub=await env.SUBSCRIPTIONS.get(row.name,'json');if(!validSub(sub))continue;
  try{
   const req=await buildPushPayload({data:JSON.stringify({title:'MyTraining – heute ist Training',body:'Guten Morgen! Dein Trainingsplan für heute ist bereit.',url:'/trainingsplan-thomas/'}),options:{ttl:3600}},sub,{subject:env.VAPID_SUBJECT,publicKey:env.VAPID_SERVER_PUBLIC_KEY,privateKey:env.VAPID_SERVER_PRIVATE_KEY});
   const result=await fetch(sub.endpoint,req);
   if(result.ok)await env.SUBSCRIPTIONS.put(sentKey,'1',{expirationTtl:172800});
   else if([404,410].includes(result.status))await env.SUBSCRIPTIONS.delete(row.name);
   else console.warn('push status',result.status);
  }catch(e){console.error('Push failed:',String(e).slice(0,150));}
 }
 }while(cursor);
}
export default {
 async fetch(req,env){
  const url=new URL(req.url),origin=req.headers.get('Origin')||'',allowed=env.ALLOWED_ORIGIN;
  if(req.method==='OPTIONS'&&origin===allowed)return new Response(null,{status:204,headers:{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET, POST, DELETE, OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'3600'}});
  if(origin!==allowed)return reply({error:'Unerlaubter Ursprung'},403);
  if(req.method==='GET'&&url.pathname==='/public-key')return reply({publicKey:env.VAPID_SERVER_PUBLIC_KEY},200,allowed);
  if(url.pathname!=='/subscription'||!['POST','DELETE'].includes(req.method))return reply({error:'Nicht gefunden'},404,allowed);
  if(Number(req.headers.get('content-length')||0)>5000)return reply({error:'Zu groß'},413,allowed);
  let body;try{body=await req.json();}catch{return reply({error:'JSON erwartet'},400,allowed);}
  if(!validToken(body?.token))return reply({error:'Ungültiges Token'},400,allowed);
  const id='sub:'+body.token;
  if(req.method==='DELETE'){await env.SUBSCRIPTIONS.delete(id);return reply({ok:true},200,allowed);}
  if(!validSub(body.subscription))return reply({error:'Ungültiges Abo'},400,allowed);
  await env.SUBSCRIPTIONS.put(id,JSON.stringify(body.subscription));return reply({ok:true},200,allowed);
 },
 async scheduled(event,env,ctx){ctx.waitUntil(fire(env));}
};
