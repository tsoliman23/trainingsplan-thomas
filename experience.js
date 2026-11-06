/* Trainingsplan UX v2 - lokal, ohne CDN oder Tracking. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const TODAY=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const PREF='training-preferences-v1';
const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}};
let settings=read(PREF,{theme:'system',reminder:false});
function theme(){const dark=settings.theme==='dark'||(settings.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.colorScheme=dark?'dark':'light';}
function saveSettings(){localStorage.setItem(PREF,JSON.stringify(settings));theme();}
function pretty(d){return new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date(d+'T12:00:00'));}
function title(){const p=read('training-profile-v1',{});const greeting=$('xp-greeting');if(greeting)greeting.textContent=p.firstName?`Hallo ${p.firstName}!`:'Dein Training';const start=$('xp-start');if(start)start.textContent=(localStorage.getItem('training-setup-date-v1')||TODAY()).split('-').reverse().join('.');const ex=read('training-full-profile-v1',{});const goal=$('xp-goal');if(goal)goal.textContent=ex.trainingGoal||'Dein Trainingsziel';}
function nav(view){window.TrainingCalendar?.selectView(view);document.querySelectorAll('.xp-bottom-nav [data-xp-view]').forEach(b=>{const selected=b.dataset.xpView===view;b.classList.toggle('selected',selected);b.setAttribute('aria-current',selected?'page':'false');});window.scrollTo({top:0,behavior:'instant'});}
function build(){if($('xp-bottom-nav')||!$('view-dashboard'))return;
const shell=$('training-dashboard-shell');
const logo=document.createElement('div');logo.className='xp-brand';logo.innerHTML='<img src="./icons/icon-192.png" alt="Trainingsplan-Logo"><span><strong>MyTraining</strong><small>Planen · Trainieren · Fortschritt</small></span>';
shell.before(logo);
const dash=$('view-dashboard');const hero=document.createElement('div');hero.className='xp-hero';hero.innerHTML='<span class="xp-eyebrow">DEIN PERSÖNLICHES DASHBOARD</span><h2 id="xp-greeting">Dein Training</h2><p>Heute ist <strong id="xp-today"></strong></p><span class="xp-goal-pill" id="xp-goal"></span><div class="xp-hero-actions"><button type="button" id="xp-go-today">Heutigen Tag öffnen</button><button type="button" id="xp-go-calendar">Kalender ansehen</button></div>';
dash.insertBefore(hero,dash.firstChild);$('xp-today').textContent=pretty(TODAY());
const weightCard=document.createElement('div');weightCard.className='cal-panel xp-weight-card';weightCard.innerHTML='<h3>Gewicht eintragen</h3>';
const existingWeight=$('bodyWeight')?.closest('.panel-card');if(existingWeight)weightCard.append(existingWeight);
hero.insertAdjacentElement('afterend',weightCard);

const stats=$('view-stats'); const info=document.createElement('div');info.className='cal-panel xp-info';info.innerHTML='<h3>Seit Beginn deiner Aufzeichnungen</h3><p>Die Auswertung berücksichtigt ausschließlich Termine seit dem Tag deiner Ersteinrichtung: <strong id="xp-start">–</strong>.</p><p>Gewichtsveränderungen beziehen sich auf gespeicherte Wiegeeinträge, nicht auf das Zielgewicht.</p>';stats.insertBefore(info,stats.firstChild);
const calendar=$('view-calendar');const jump=document.createElement('button');jump.type='button';jump.className='xp-today-link';jump.textContent='Heute';jump.onclick=()=>window.TrainingCalendar?.openDate(TODAY());calendar.insertBefore(jump,calendar.firstChild);
const settingsView=document.createElement('section');settingsView.className='cal-view xp-settings';settingsView.id='xp-settings';settingsView.hidden=true;settingsView.innerHTML=`<h2>Einstellungen</h2>
<div class="cal-panel"><h3>Dein Profil</h3><p class="muted">Vorname, Nachname, Geburtstag, Körpergröße, Startgewicht, Ziel und Zielgewicht.</p><button type="button" id="xp-edit-profile">Profil bearbeiten</button></div>
<div class="cal-panel"><h3>Design</h3><div class="xp-theme-switch" role="group" aria-label="Farbschema"><button type="button" data-theme="light">Hell</button><button type="button" data-theme="dark">Dunkel</button><button type="button" data-theme="system">System</button></div><p class="muted">Blautöne passend zu deinem App-Logo. Dein Wunsch wird lokal gespeichert.</p></div>
<div class="cal-panel"><h3>Trainingserinnerung um 08:00 Uhr</h3><label class="xp-setting-row"><span><strong>Erinnerungen aktivieren</strong><small>Montag, Mittwoch und Freitag um 08:00 Uhr</small></span><input id="xp-remind" type="checkbox" aria-label="Erinnerungen einschalten"></label><p id="xp-reminder-state" class="muted">Mit Cloudflare Worker: Push um 08:00 Uhr auch bei geschlossener App. Vorher einmalig Einrichtung erforderlich (README).</p></div>
<div class="cal-panel"><h3>Sicherung und Dokumente</h3><div class="xp-settings-actions"><button type="button" id="xp-to-backup">Dateisicherung öffnen</button><button type="button" id="xp-to-pdfs">PDF-Archiv öffnen</button></div><p class="muted">Daten und PDFs liegen lokal im Speicher dieser App. Für einen Gerätewechsel die JSON-Sicherung und PDF-Dateien separat herunterladen.</p></div>
<div class="cal-panel"><h3>Über die App</h3><p>Lokale Trainingsverwaltung · Offline-PWA · Keine Cloud, keine Anmeldung, kein Tracking.</p></div>`;
shell.append(settingsView);const install=$('installApp');if(install)settingsView.querySelector('.xp-settings .cal-panel:last-child')?.append(install);
const navEl=document.createElement('nav');navEl.id='xp-bottom-nav';navEl.className='xp-bottom-nav';navEl.setAttribute('aria-label','Untere Hauptnavigation');
const items=[['dashboard','⌂','Heute'],['calendar','▦','Kalender'],['training','▥','Training'],['stats','▤','Statistik'],['settings','⚙','Mehr']];
navEl.innerHTML=items.map(([v,icon,label])=>`<button type="button" data-xp-view="${v}" aria-label="${label}"><span class="xp-nav-icon" aria-hidden="true">${icon}</span><small>${label}</small></button>`).join('');document.body.append(navEl);
navEl.querySelectorAll('[data-xp-view]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.xpView)));
function show(view){settingsView.hidden=view!=='settings';if(view==='settings'){for(const v of ['dashboard','calendar','training','stats','documents']){const e=$('view-'+v);if(e)e.hidden=true;}document.querySelectorAll('.cal-tabs button').forEach(x=>x.classList.remove('active'));}else{nav(view);}document.querySelectorAll('[data-xp-view]').forEach(b=>{const a=b.dataset.xpView===view;b.classList.toggle('selected',a);b.setAttribute('aria-current',a?'page':'false');});window.scrollTo(0,0);}
$('xp-go-today').onclick=()=>{window.TrainingCalendar?.openDate(TODAY());show('training');};$('xp-go-calendar').onclick=()=>show('calendar');$('xp-edit-profile').onclick=()=>$('editProfile').click();$('xp-to-backup').onclick=()=>{show('stats');$('download-backup')?.scrollIntoView({behavior:'smooth',block:'center'});};$('xp-to-pdfs').onclick=()=>show('documents');
settingsView.querySelectorAll('[data-theme]').forEach(b=>b.onclick=()=>{settings.theme=b.dataset.theme;saveSettings();paintTheme();});
function paintTheme(){settingsView.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===settings.theme));}
paintTheme();$('xp-remind').checked=!!settings.reminder; if(!window.MyTrainingPush?.configured){$('xp-remind').checked=false;settings.reminder=false;saveSettings();$('xp-reminder-state').textContent='Noch nicht eingerichtet: Cloudflare Worker bereitstellen und Push-URL in push-config.js eintragen. Siehe README.';}
$('xp-remind').addEventListener('change',async e=>{
 const desired=e.target.checked;
 const result=await window.MyTrainingPush?.update(desired);
 if(result===null||result===undefined){e.target.checked=!desired;settings.reminder=!desired;saveSettings();return;}
 settings.reminder=result;saveSettings();e.target.checked=result;
});
$('profileForm').addEventListener('submit',()=>setTimeout(()=>{title();window.TrainingCalendar?.refresh();},120));
document.querySelectorAll('.cal-tabs [data-view]').forEach(b=>b.addEventListener('click',()=>{settingsView.hidden=true;nav(b.dataset.view); }));
$('view-dashboard').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.id==='dash-open-training')nav('training');}));
const obs=new MutationObserver(()=>{title();});obs.observe($('personalGreeting'),{childList:true});
title();show('dashboard');
}
async function remind(){if(window.MyTrainingPush?.configured)return;if(!settings.reminder||!('Notification'in window)||Notification.permission!=='granted')return;const now=new Date();if(now.getHours()!==8||![1,3,5].includes(now.getDay()))return;const id='train-remind-'+TODAY();if(localStorage.getItem(id))return;const d=read('training-calendar-days-v1',{});if(d[TODAY()]?.completed)return;localStorage.setItem(id,'1');const opts={body:'Dein Training steht heute an. Öffne die App und dokumentiere deine Einheit.',icon:'./icons/icon-192.png',tag:'training-morning'};try{const sw=await navigator.serviceWorker?.ready;if(sw?.showNotification){await sw.showNotification('Dein Training um 08:00 Uhr',opts);}else new Notification('Dein Training um 08:00 Uhr',opts);}catch(e){console.warn('Erinnerung nicht verfügbar',e);}}
theme();try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',theme);}catch{}
let attempts=0;const ready=setInterval(()=>{if($('view-dashboard')){clearInterval(ready);build();remind();setInterval(remind,60000);}else if(++attempts>150)clearInterval(ready);},100);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){remind();title();}});
window.TrainingUX={refresh:title};
})();
