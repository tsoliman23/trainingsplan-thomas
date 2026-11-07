/* Separate profile editor. The onboarding wizard is reserved for first-time setup. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const STORE='training-full-profile-v1',BASE='training-profile-v1';
const goals=['Abnehmen','Zunehmen','Muskelaufbau','Gewicht halten','Ernährung / Diät'];
function load(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{return {};}}
function text(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tr(s){return window.MyTrainingI18n?.t(s)||s;}
function validBirth(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00');return !isNaN(+d)&&d.getFullYear()>=1900&&d.getFullYear()==Number(s.slice(0,4))&&d.getMonth()+1==Number(s.slice(5,7))&&d.getDate()==Number(s.slice(8,10))&&d<new Date();}
let overlay=null,screen='overview',lastFocus=null;
function create(){if(overlay)return;overlay=document.createElement('div');overlay.id='xp-profile-editor';overlay.className='xp-profile-overlay';overlay.hidden=true;
overlay.innerHTML=`<div class="xp-profile-dialog" role="dialog" aria-modal="true" aria-labelledby="xp-profile-title">
<div class="xp-profile-head"><h2 id="xp-profile-title">Profilübersicht</h2><button type="button" id="xp-profile-close" aria-label="Schließen">×</button></div>
<div id="xp-profile-content" class="xp-profile-content"></div><p class="xp-profile-error" id="xp-profile-error" role="alert" hidden></p></div>`;
document.body.append(overlay);$('xp-profile-close').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
}
function close(){if(!overlay)return;overlay.hidden=true;lastFocus?.focus?.();}
function current(){return {base:load(BASE),full:load(STORE)};}
function overview(){screen='overview';const {base,full}=current();const selected=Array.isArray(full.trainingGoals)?full.trainingGoals:(full.trainingGoal?[full.trainingGoal]:[]);
$('xp-profile-title').textContent=tr('Profilübersicht');$('xp-profile-error').hidden=true;
$('xp-profile-content').innerHTML=`<div class="xp-edit-cards">
<button type="button" data-edit="personal"><span><strong>${tr('Persönliche Angaben')}</strong><small>${text([base.firstName,full.lastName].filter(Boolean).join(' '))} · ${text(full.birthday||'–')}</small></span><b aria-hidden="true">›</b></button>
<button type="button" data-edit="weight"><span><strong>${tr('Gewicht und Ziel')}</strong><small>${text(full.currentWeight||'–')} kg · ${text(base.goalWeight||'–')} kg</small></span><b aria-hidden="true">›</b></button>
<button type="button" data-edit="goals"><span><strong>${tr('Trainingsziele bearbeiten')}</strong><small>${selected.map(text).join(' · ')||'–'}</small></span><b aria-hidden="true">›</b></button></div>`;
$('xp-profile-content').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>detail(b.dataset.edit));
}
function detail(which){screen=which;const {base,full}=current();const label={personal:'Persönliche Angaben',weight:'Gewicht und Ziel',goals:'Trainingsziele bearbeiten'}[which];$('xp-profile-title').textContent=tr(label);$('xp-profile-error').hidden=true;
let fields='';
if(which==='personal')fields=`<label>${tr('Vorname')}<input id="ep-first" autocomplete="given-name" maxlength="40" required></label><label>${tr('Nachname')}<input id="ep-last" autocomplete="family-name" maxlength="60" required></label><label>${tr('Geburtsdatum')}<input id="ep-birth" type="date" min="1900-01-01" required></label><label>${tr('Körpergröße (cm)')}<input id="ep-height" type="number" inputmode="numeric" min="100" max="250" required></label>`;
if(which==='weight')fields=`<label>${tr('Startgewicht (kg)')}<input id="ep-start" type="number" inputmode="decimal" min="20" max="350" step="0.1" required></label><label>${tr('Zielgewicht (kg)')}<input id="ep-goal" type="number" inputmode="decimal" min="20" max="350" step="0.1" required></label>`;
if(which==='goals')fields=`<fieldset class="xp-edit-goals"><legend>${tr('Trainingsziele bearbeiten')}</legend>${goals.map((g,i)=>`<label><input type="checkbox" value="${text(g)}" id="ep-goal-${i}"><span>${tr(g)}</span></label>`).join('')}</fieldset>`;
$('xp-profile-content').innerHTML=`<form id="xp-profile-form" class="xp-edit-form">${fields}<div class="xp-edit-actions"><button type="button" id="ep-back">${tr('Zur Übersicht')}</button><button type="submit" id="ep-save">${tr('Änderungen speichern')}</button></div></form>`;
if(which==='personal'){$('ep-first').value=base.firstName||'';$('ep-last').value=full.lastName||'';$('ep-birth').value=full.birthday||'';$('ep-height').value=full.heightCm||'';}
if(which==='weight'){$('ep-start').value=full.currentWeight||'';$('ep-goal').value=base.goalWeight||'';}
if(which==='goals'){const list=Array.isArray(full.trainingGoals)?full.trainingGoals:(full.trainingGoal?[full.trainingGoal]:[]);document.querySelectorAll('.xp-edit-goals input').forEach(x=>{x.checked=list.includes(x.value);x.addEventListener('change',()=>{if(x.checked&&['Abnehmen','Zunehmen'].includes(x.value)){const other=[...document.querySelectorAll('.xp-edit-goals input')].find(q=>q.value===(x.value==='Abnehmen'?'Zunehmen':'Abnehmen'));if(other)other.checked=false;}});});}
$('ep-back').onclick=overview;$('xp-profile-form').onsubmit=e=>{e.preventDefault();save(which);};
}
function error(message){const e=$('xp-profile-error');e.textContent=tr(message);e.hidden=false;}
function save(which){const {base,full}=current();let nextBase={...base},nextFull={...full};
if(which==='personal'){
 const first=$('ep-first').value.trim(),last=$('ep-last').value.trim(),birthday=$('ep-birth').value,height=Number($('ep-height').value);
 if(!first||!last||!validBirth(birthday)||height<100||height>250){error('Bitte gültige Angaben eingeben.');return;}
 nextBase.firstName=first;Object.assign(nextFull,{lastName:last,birthday,heightCm:height});
}else if(which==='weight'){
 const start=Number($('ep-start').value),goal=Number($('ep-goal').value);
 if(!Number.isFinite(start)||start<20||start>350||!Number.isFinite(goal)||goal<20||goal>350){error('Bitte gültige Angaben eingeben.');return;}
 nextBase.goalWeight=String(goal);nextFull.currentWeight=start;
}else{
 const chosen=[...document.querySelectorAll('.xp-edit-goals input:checked')].map(x=>x.value);
 if(!chosen.length){error('Mindestens ein Trainingsziel auswählen.');return;}
 if(chosen.includes('Abnehmen')&&chosen.includes('Zunehmen')){error('Abnehmen und Zunehmen können nicht gleichzeitig gewählt werden.');return;}
 nextFull.trainingGoals=chosen;nextFull.trainingGoal=chosen[0];
}
try{localStorage.setItem(STORE,JSON.stringify(nextFull));localStorage.setItem(BASE,JSON.stringify(nextBase));window.TrainingApp?.updateProfile?.(nextBase);window.TrainingUX?.refresh?.();window.TrainingCalendar?.refresh?.();overview();}catch(e){error('Speichern fehlgeschlagen.');}
}
function open(){create();lastFocus=document.activeElement;overlay.hidden=false;overview();$('xp-profile-close').focus();}
window.MyTrainingProfileEditor={open,close};
})();
