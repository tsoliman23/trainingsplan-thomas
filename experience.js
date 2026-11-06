/* Trainingsplan UX v2 - lokal, ohne CDN oder Tracking. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const TODAY=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const PREF='training-preferences-v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
let settings=read(PREF,{theme:'system',reminder:false});
function theme(){const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';}
function saveSettings(){localStorage.setItem(PREF,JSON.stringify(settings));theme();}
function pretty(d){return new Intl.DateTimeFormat(({de:'de-DE',en:'en-GB',fr:'fr-FR','ar-EG':'ar-EG'}[window.MyTrainingI18n?.current?.()||'de']||'de-DE'),{weekday:'long',day:'numeric',month:'long'}).format(new Date(d+'T12:00:00'));}
function title(){const p=read('training-profile-v1',{});const greeting=$('xp-greeting');if(greeting)greeting.textContent=p.firstName?`Hallo ${p.firstName}!`:'Dein Training';const start=$('xp-start');if(start)start.textContent=(localStorage.getItem('training-setup-date-v1')||TODAY()).split('-').reverse().join('.');const ex=read('training-full-profile-v1',{});const goal=$('xp-goal');if(goal){const goals=Array.isArray(ex.trainingGoals)&&ex.trainingGoals.length?ex.trainingGoals:(ex.trainingGoal?[ex.trainingGoal]:[]);goal.textContent=goals.length?goals.map(g=>window.MyTrainingI18n?.t(g)||g).join(' · '):(window.MyTrainingI18n?.t('Dein Trainingsziel')||'Dein Trainingsziel');}}
function nav(view){window.TrainingCalendar?.selectView(view);document.querySelectorAll('.xp-bottom-nav [data-xp-view]').forEach(b=>{const selected=b.dataset.xpView===view;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false');});window.scrollTo({top:0,behavior:'instant'});}
function build(){if($('xp-bottom-nav')||!$('view-dashboard'))return;
const shell=$('training-dashboard-shell');
const logo=document.createElement('div');logo.className='xp-brand';logo.innerHTML='<img src="./icons/icon-192.png" alt="Trainingsplan-Logo"><span><strong>MyTraining</strong><small>Planen · Trainieren · Fortschritt</small></span>';
shell.before(logo);
const dash=$('view-dashboard');const hero=document.createElement('div');hero.className='xp-hero';hero.innerHTML='<span class="xp-eyebrow">DEIN PERSÖNLICHES DASHBOARD</span><h2 id="xp-greeting">Dein Training</h2><p>Heute ist <strong id="xp-today"></strong></p><span class="xp-goal-pill" id="xp-goal"></span><div class="xp-hero-actions"><button type="button" id="xp-go-today">Heutigen Tag öffnen</button><button type="button" id="xp-go-calendar">Kalender ansehen</button></div>';
dash.insertBefore(hero,dash.firstChild);$('xp-today').textContent=pretty(TODAY());
const weightCard=document.createElement('div');weightCard.className='cal-panel xp-weight-card';weightCard.innerHTML=`<h3>Körperwerte</h3>
<div class="xp-weight-shell">
  <div class="xp-weight-meta"><strong>Gewicht</strong><small id="xp-weight-target">Ziel: –</small></div>
  <div class="xp-weight-adjust" aria-label="Gewicht anpassen">
    <button type="button" id="xp-weight-minus" aria-label="Gewicht verringern">−</button>
    <div class="xp-weight-value"><span id="xp-weight-display">–</span><small id="xp-weight-start">Startgewicht: –</small></div>
    <button type="button" id="xp-weight-plus" aria-label="Gewicht erhöhen">+</button>
  </div>
  <p class="muted" id="xp-weight-hint">Tagesgewicht für heute. Deine Einträge werden nach Datum gespeichert.</p>
  <div class="xp-weight-hidden"></div>
</div>`;
const existingWeight=$('bodyWeight')?.closest('.panel-card');if(existingWeight)weightCard.querySelector('.xp-weight-hidden')?.append(existingWeight);
hero.insertAdjacentElement('afterend',weightCard);

const stats=$('view-stats'); const info=document.createElement('div');info.className='cal-panel xp-info';info.innerHTML='<h3>Seit Beginn deiner Aufzeichnungen</h3><p>Die Auswertung berücksichtigt ausschließlich Termine seit dem Tag deiner Ersteinrichtung: <strong id="xp-start">–</strong>.</p><p>Gewichtsveränderungen beziehen sich auf gespeicherte Wiegeeinträge, nicht auf das Zielgewicht.</p>';stats.insertBefore(info,stats.firstChild);
const calendar=$('view-calendar');const jump=document.createElement('button');jump.type='button';jump.className='xp-today-link';jump.textContent='Heute';jump.onclick=()=>window.TrainingCalendar?.calendarToday?.();calendar.insertBefore(jump,calendar.firstChild);
const settingsView=document.createElement('section');settingsView.className='cal-view xp-settings';settingsView.id='xp-settings';settingsView.hidden=true;settingsView.innerHTML=`<h2>Einstellungen</h2>
<div class="cal-panel"><h3>Dein Profil</h3><p class="muted">Vorname, Nachname, Geburtstag, Körpergröße, Startgewicht, Ziel und Zielgewicht.</p><button type="button" id="xp-edit-profile">Profil bearbeiten</button></div>
<div class="cal-panel"><h3>Design</h3><div class="xp-theme-switch" role="group" aria-label="Farbschema"><button type="button" data-theme="light">Hell</button><button type="button" data-theme="dark">Dunkel</button><button type="button" data-theme="system">System</button></div><p class="muted">Blautöne passend zu deinem App-Logo. Dein Wunsch wird lokal gespeichert.</p></div>
<div class="cal-panel"><h3>Trainingserinnerung um 08:00 Uhr</h3><label class="xp-setting-row xp-switch-row" for="xp-remind"><span><strong>Erinnerungen aktivieren</strong><small>Montag, Mittwoch und Freitag um 08:00 Uhr</small></span><span class="xp-toggle"><input id="xp-remind" type="checkbox" aria-label="Erinnerungen einschalten"><span class="xp-toggle-slider" aria-hidden="true"></span></span></label><p id="xp-reminder-state" class="muted">Lokale Browser-Erinnerung, solange Benachrichtigungen erlaubt sind. Optional zusätzlich per Cloudflare Worker als Push bei geschlossener App.</p></div>
<div class="cal-panel"><h3>Sicherung und Dokumente</h3><div class="xp-settings-actions"><button type="button" id="xp-to-backup">Dateisicherung öffnen</button><button type="button" id="xp-to-pdfs">PDF-Archiv öffnen</button></div><p class="muted">Daten und PDFs liegen lokal im Speicher dieser App. Für einen Gerätewechsel die JSON-Sicherung und PDF-Dateien separat herunterladen.</p></div>
<div class="cal-panel xp-danger-zone"><h3>App zurücksetzen</h3><p class="muted">Alle lokalen Daten dieser App werden gelöscht: Profil, Trainingsstand, Historie, PDFs und Einstellungen.</p><button type="button" id="xp-reset-app" class="xp-danger-button">App zurücksetzen</button></div>
<div class="cal-panel"><h3>Über die App</h3><p>Lokale Trainingsverwaltung · Offline-PWA · Keine Cloud, keine Anmeldung, kein Tracking.</p></div>`;
shell.append(settingsView);const install=$('installApp');if(install)settingsView.querySelector('.xp-settings .cal-panel:last-child')?.append(install);
const navEl=document.createElement('nav');navEl.id='xp-bottom-nav';navEl.className='xp-bottom-nav';navEl.setAttribute('aria-label','Untere Hauptnavigation');
const items=[['dashboard','⌂','Heute'],['calendar','▦','Kalender'],['training','▥','Training'],['stats','▤','Statistik'],['settings','⚙','Mehr']];
navEl.innerHTML=items.map(([v,icon,label])=>`<button type="button" data-xp-view="${v}" aria-label="${label}"><span class="xp-nav-icon" aria-hidden="true">${icon}</span><small>${label}</small></button>`).join('');document.body.append(navEl);
navEl.querySelectorAll('[data-xp-view]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.xpView)));
function show(view){settingsView.hidden=view!=='settings';if(view==='settings'){for(const v of ['dashboard','calendar','training','stats','documents']){const e=$('view-'+v);if(e)e.hidden=true;}document.querySelectorAll('.cal-tabs button').forEach(x=>x.classList.remove('active'));}else{nav(view);}document.querySelectorAll('[data-xp-view]').forEach(b=>{const a=b.dataset.xpView===view;b.classList.toggle('selected',a);b.setAttribute('aria-current',a?'page':'false');});window.scrollTo(0,0);}
document.addEventListener('mytraining-navigate',e=>{if(e.detail?.view)show(e.detail.view);});
$('xp-go-today').onclick=()=>{window.TrainingCalendar?.openDate(TODAY());show('training');};$('xp-go-calendar').onclick=()=>show('calendar');$('xp-edit-profile').onclick=()=>$('editProfile').click();$('xp-to-backup').onclick=()=>{show('stats');$('download-backup')?.scrollIntoView({behavior:'smooth',block:'center'});};$('xp-to-pdfs').onclick=()=>show('documents');
settingsView.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{settings.theme=b.dataset.theme;saveSettings();paintTheme();});
function paintTheme(){settingsView.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===settings.theme));}
paintTheme();$('xp-remind').checked=!!settings.reminder;
if(window.MyTrainingPush?.configured){$('xp-reminder-state').textContent='Push ist eingerichtet. Die Erinnerung kann lokal und zusätzlich als Push genutzt werden.';}else{$('xp-reminder-state').textContent='Lokale Browser-Erinnerung verfügbar. Für Push bei geschlossener App kann später ein Cloudflare Worker ergänzt werden.';}
function syncWeightCard(){
 const input=$('bodyWeight');
 const full=read('training-full-profile-v1',{});
 const base=read('training-profile-v1',{});
 const current=Number(String(window.TrainingCalendar?.getWeightForDate?.(TODAY())||'').replace(',', '.'));
 const goal=Number(String(base.goalWeight||full.goalWeight||'').replace(',', '.'));
 const start=Number(String(full.currentWeight||'').replace(',', '.'));
 $('xp-weight-display').textContent=Number.isFinite(current)&&current>0?current.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' kg':'–';
 $('xp-weight-target').textContent='Ziel: '+(Number.isFinite(goal)&&goal>0?goal.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' kg':'–');
 $('xp-weight-start').textContent='Startgewicht: '+(Number.isFinite(start)&&start>0?start.toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' kg':'–');
}
function nudgeWeight(step){
 if(!window.TrainingCalendar?.setWeightForDate)return;
 const current=Number(String(window.TrainingCalendar?.getWeightForDate?.(TODAY())||'').replace(',', '.'));
 const base=Number(read('training-full-profile-v1',{}).currentWeight||0);
 const start=Number.isFinite(current)&&current>0?current:(Number.isFinite(base)&&base>0?base:80);
 const next=Math.max(20,Math.min(350,Math.round((start+step)*10)/10));
 window.TrainingCalendar?.setWeightForDate?.(TODAY(),String(next.toFixed(1)));
 syncWeightCard();
}
$('xp-weight-minus').onclick=()=>nudgeWeight(-0.1);
$('xp-weight-plus').onclick=()=>nudgeWeight(0.1);
$('bodyWeight')?.addEventListener('input',syncWeightCard);
$('bodyWeight')?.addEventListener('change',syncWeightCard);
syncWeightCard();
$('xp-remind').addEventListener('change',async e=>{
 const desired=e.target.checked;
 if(window.MyTrainingPush?.configured){
  const result=await window.MyTrainingPush.update(desired);
  if(result===null||result===undefined){e.target.checked=!!settings.reminder;return;}
  settings.reminder=result;saveSettings();e.target.checked=result;return;
 }
 // Save a local preference even when iOS does not expose Notification from this browser view.
 // Never describe this setting as a working background push subscription.
 settings.reminder=desired;saveSettings();
 $('xp-reminder-state').textContent=desired?'Erinnerung vorgemerkt. Für zuverlässige iPhone-Benachrichtigungen bei geschlossener App muss zuerst der Push-Dienst eingerichtet werden.':'Erinnerungen deaktiviert.';
});

async function deleteDatabase(name){
 return await new Promise(resolve=>{
  if(!('indexedDB' in window)){resolve(true);return;}
  let done=false;
  const finish=ok=>{if(!done){done=true;resolve(ok);}};
  try{const req=indexedDB.deleteDatabase(name);
   req.onsuccess=()=>finish(true);
   req.onerror=()=>finish(false);
   req.onblocked=()=>finish(false);
  }catch(_){finish(false);}
 });
}
function ensureResetDialog(){
 if($('xp-reset-overlay'))return;
 const overlay=document.createElement('div');
 overlay.id='xp-reset-overlay';overlay.className='xp-modal-overlay';overlay.hidden=true;
 overlay.innerHTML=`<div class="xp-modal-card" role="dialog" aria-modal="true" aria-labelledby="xp-reset-title"><h3 id="xp-reset-title">App wirklich zurücksetzen?</h3><p>Dein Profil, sämtliche Trainingsdaten und PDF-Dateien auf diesem Gerät werden unwiderruflich gelöscht.</p><p class="xp-reset-warning">Erstelle vorher eine Datensicherung. Dieser Vorgang kann nicht rückgängig gemacht werden.</p><p id="xp-reset-status" role="status" hidden></p><div class="xp-modal-actions"><button type="button" id="xp-reset-cancel">Abbrechen</button><button type="button" id="xp-reset-confirm" class="xp-danger-button">Alles löschen</button></div></div>`;
 document.body.append(overlay);
 $('xp-reset-cancel').onclick=()=>{overlay.hidden=true;};
 overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.hidden=true;});
 $('xp-reset-confirm').onclick=async()=>{
  const confirm=$('xp-reset-confirm'),cancel=$('xp-reset-cancel'),status=$('xp-reset-status');
  confirm.disabled=true;cancel.disabled=true;
  status.hidden=false;status.textContent='Daten werden gelöscht …';
  // A pending IndexedDB write must not restore data after deleting them.
  window.__mytrainingResetting=true;
  try{
   const closed=await window.TrainingApp?.closeStorage?.();
   window.TrainingCalendar?.closeArchive?.();
   if(window.MyTrainingPush?.configured){
    const subscribed=await window.MyTrainingPush.update(false);
    if(subscribed===null){throw Error('Push-Dienst konnte nicht abgemeldet werden. Prüfe deine Internetverbindung und versuche es erneut.');}
   }
   const trainingRemoved=await deleteDatabase('thomas-training-pwa');
   const pdfRemoved=await deleteDatabase('training-pdf-archive-v1');
   if(!trainingRemoved||!pdfRemoved)throw Error('Eine lokale Datenbank konnte noch nicht gelöscht werden. Bitte schließe andere MyTraining-Fenster und versuche es erneut.');
   const known=new Set(['cleverfit_training_v16','cleverfit_training_v5','training-manual-restore-v1','training-history-v2','training-calendar-days-v1','training-full-profile-v1','training-profile-v1','training-setup-date-v1','training-preferences-v1','mytraining-language-v1','mytraining-push-token-v1']);
   for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(known.has(key)||key?.startsWith('train-remind-')||key?.startsWith('mytraining-'))localStorage.removeItem(key);}
   overlay.hidden=true;
   location.reload();
  }catch(err){
   window.__mytrainingResetting=false;
   confirm.disabled=false;cancel.disabled=false;
   status.textContent=err.message||'Zurücksetzen fehlgeschlagen. Bitte erneut versuchen.';
  }
 };
}
ensureResetDialog();
$('xp-reset-app').onclick=()=>{$('xp-reset-overlay').hidden=false;};
 $('profileForm').addEventListener('submit',()=>setTimeout(()=>{title();syncWeightCard();window.TrainingCalendar?.refresh();show('dashboard');window.scrollTo({top:0,left:0,behavior:'instant'});},120));
 window.TrainingUX={refresh:title,syncWeightCard};
document.querySelectorAll('.cal-tabs [data-view]').forEach(b=>b.addEventListener('click',()=>{settingsView.hidden=true;nav(b.dataset.view); }));
$('view-dashboard').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.id==='dash-open-training')nav('training');}));
const obs=new MutationObserver(()=>{title();});obs.observe($('personalGreeting'),{childList:true});
title();show('dashboard');
  // Compact optional explanations; preserve all text for translation and accessibility.
  const helpSelectors=['.xp-settings .cal-panel>p.muted','#view-documents>p.muted','.xp-info>p','#xp-weight-hint','#view-stats>.muted','.history-panel>p.muted','#view-calendar .cal-legend-note','#trainingsform .muted'];
  const helpTexts=[...document.querySelectorAll(helpSelectors.join(','))];
  helpTexts.forEach((el,i)=>{if(el.closest('.xp-danger-zone')||el.id==='xp-reminder-state')return;
    const id='xp-help-'+i;el.id=el.id||id;el.hidden=true;el.classList.add('xp-help-text');
    const toggle=document.createElement('button');toggle.type='button';toggle.className='xp-info-toggle';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',el.id);
    toggle.setAttribute('aria-label','Information anzeigen oder ausblenden');toggle.textContent='i';
    toggle.onclick=()=>{el.hidden=!el.hidden;toggle.setAttribute('aria-expanded',String(!el.hidden));};
    el.before(toggle);
  });
}
async function remind(){if(window.MyTrainingPush?.configured)return;if(!settings.reminder||!('Notification'in window)||Notification.permission!=='granted')return;const now=new Date();if(now.getHours()!==8||![1,3,5].includes(now.getDay()))return;const id='train-remind-'+TODAY();if(localStorage.getItem(id))return;const d=read('training-calendar-days-v1',{});if(d[TODAY()]?.completed)return;localStorage.setItem(id,'1');const opts={body:'Dein Training steht heute an. Öffne die App und dokumentiere deine Einheit.',icon:'./icons/icon-192.png',tag:'training-morning'};try{const sw=await navigator.serviceWorker?.ready;if(sw?.showNotification){await sw.showNotification('Dein Training um 08:00 Uhr',opts);}else new Notification('Dein Training um 08:00 Uhr',opts);}catch(e){console.warn('Erinnerung nicht verfügbar',e);}}
theme();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);}catch{}
let attempts=0;const ready=setInterval(()=>{if($('view-dashboard')){clearInterval(ready);build();remind();setInterval(remind,60000);}else if(++attempts>150)clearInterval(ready);},100);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){remind();title();}});
document.addEventListener('mytraining-language-change',()=>{window.TrainingCalendar?.refreshCalendarLocale?.();title();const t=$('xp-today');if(t)t.textContent=pretty(TODAY());});

})();
