/* MyTraining 1.1 - daily recovery log. No external service, per-day local storage. */
(()=>{'use strict';
const KEY='training-calendar-days-v1', $=id=>document.getElementById(id);
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const dateObj=iso=>new Date(iso+'T12:00:00');
const dayName=iso=>new Intl.DateTimeFormat({de:'de-DE',en:'en-GB',fr:'fr-FR','ar-EG':'ar-EG'}[window.MyTrainingI18n?.current?.()||'de']||'de-DE',{weekday:'long',day:'numeric',month:'long'}).format(dateObj(iso));
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{return {};}};
const first=()=>localStorage.getItem('training-setup-date-v1')||today();
let shown=today(),editable=true,ready=false;
const numeric={steps:[0,100000],minutes:[0,1440],water:[0,20],sleep:[0,24],calories:[0,15000],protein:[0,800]};
const labels={steps:'Schritte',minutes:'Bewegung (Minuten)',water:'Wasser (Liter)',sleep:'Schlaf (Stunden)',calories:'Kalorien (kcal)',protein:'Protein (g)'};
function valid(k,v){if(v==='')return true;if(numeric[k])return Number.isFinite(Number(v))&&Number(v)>=numeric[k][0]&&Number(v)<=numeric[k][1];return String(v).length<1200;}
function save(){
 if(!editable||window.__mytrainingResetting)return;
 const values={};for(const el of $('daily-form').querySelectorAll('[name]')){
   const value=el.type==='checkbox'?el.checked:el.value.trim();
   if(!valid(el.name,value)){el.setCustomValidity('Bitte einen gültigen Wert eingeben.');el.reportValidity();return;}el.setCustomValidity('');values[el.name]=value;
 }
 try{if(!window.TrainingCalendar?.setDailyForDate?.(shown,values))throw new Error('Tagesdatum nicht freigegeben');window.MyTrainingToast?.autoSaved?.();renderWeekly();}catch(e){$('daily-feedback').textContent='Speichern fehlgeschlagen. Bitte Datensicherung prüfen.';}
}
function renderDay(date,rest,canEdit){
 if(!ready)return;
 shown=date;editable=!!canEdit;
 const panel=$('daily-panel');panel.hidden=!rest || date<first();
 if(panel.hidden)return;
 const dateLabel=$('daily-date');dateLabel.textContent=dayName(date);
 const data=read()[date]?.daily||{};
 for(const el of $('daily-form').querySelectorAll('[name]')){
  el.value=el.type==='checkbox'?el.value:String(data[el.name]??'');
  if(el.type==='checkbox')el.checked=!!data[el.name];
  el.disabled=!editable;el.setCustomValidity('');
 }
 $('daily-feedback').textContent=!editable?'Zukünftige Tage sind nur zur Ansicht verfügbar.':'Alle Angaben sind freiwillig und werden lokal für diesen Tag gespeichert.';
 panel.classList.toggle('daily-readonly',!editable);
}
function renderWeekly(){
 const card=$('daily-weekly');if(!card)return;
 const entries=Object.entries(read()).filter(([d,x])=>d>=first()&&d<=today()&&x?.daily&&Object.values(x.daily).some(v=>v!==''&&v!==false)).sort(([a],[b])=>b.localeCompare(a)).slice(0,7);
 if(!entries.length){card.textContent='Noch keine Tageswerte erfasst.';return;}
 const step=entries.map(([,x])=>Number(x.daily.steps)).filter(n=>n>0),sleeps=entries.map(([,x])=>Number(x.daily.sleep)).filter(n=>n>0);
 const avg=xs=>Math.round(xs.reduce((a,b)=>a+b,0)/xs.length).toLocaleString('de-DE');
 const lang=window.MyTrainingI18n?.current?.()||'de';const txt={de:['Tage dokumentiert','Schritte','Std. Schlaf'],en:['days logged','steps','hours sleep'],fr:['jours enregistrés','pas','heures de sommeil'],'ar-EG':['أيام متسجلة','خطوة','ساعة نوم']}[lang]||['Tage dokumentiert','Schritte','Std. Schlaf'];card.textContent=entries.length+' '+txt[0]+(step.length?' · Ø '+avg(step)+' '+txt[1]:'')+(sleeps.length?' · Ø '+(sleeps.reduce((a,b)=>a+b,0)/sleeps.length).toLocaleString(lang==='de'?'de-DE':lang==='fr'?'fr-FR':lang==='ar-EG'?'ar-EG':'en-GB',{maximumFractionDigits:1})+' '+txt[2]:'');
}
function build(){if(ready||!$('cal-rest')||!$('view-stats'))return;ready=true;
 const card=document.createElement('section');card.id='daily-panel';card.className='cal-panel daily-panel';card.hidden=true;
 card.innerHTML=`<div class="daily-top"><span class="daily-kicker">DEIN TAG</span><h3>Aktiv bleiben und erholen</h3><p id="daily-date" class="daily-date"></p></div>
 <p class="daily-intro">Trainingsfreier Tag: Bewegung und Erholung sind freiwillig. Hier kannst du deine Tageswerte festhalten.</p>
 <form id="daily-form" autocomplete="off">
 <div class="daily-fields">
 <label>Schritte<input name="steps" type="number" inputmode="numeric" min="0" max="100000" step="1" placeholder="z. B. 6500"></label>
 <label>Bewegung (Minuten)<input name="minutes" type="number" inputmode="numeric" min="0" max="1440" step="1" placeholder="z. B. 30"></label>
 <label>Wasser (Liter)<input name="water" type="number" inputmode="decimal" min="0" max="20" step="0.1" placeholder="z. B. 2,0"></label>
 <label>Schlaf (Stunden)<input name="sleep" type="number" inputmode="decimal" min="0" max="24" step="0.1" placeholder="z. B. 7,5"></label>

 <label>Energiegefühl<select name="energy"><option value="">Nicht angegeben</option><option value="Sehr gut">Sehr gut</option><option value="Gut">Gut</option><option value="Mittel">Mittel</option><option value="Erschöpft">Erschöpft</option></select></label>
 <label>Muskelkater<select name="soreness"><option value="">Nicht angegeben</option><option value="Keiner">Keiner</option><option value="Leicht">Leicht</option><option value="Mittel">Mittel</option><option value="Stark">Stark</option></select></label>
 </div>
 <label class="daily-note-label">Tagesnotiz<textarea name="note" maxlength="1000" rows="2" placeholder="Spaziergang, Erholung, Besonderheiten ..."></textarea></label>
 <label class="daily-check"><input name="recovered" type="checkbox">Heute bewusst auf Regeneration geachtet</label>
 <p id="daily-feedback" class="muted" role="status"></p></form>`;
 $('cal-rest').after(card);
 const summary=document.createElement('div');summary.className='cal-panel daily-summary';summary.innerHTML='<h3>Deine Alltagseinträge</h3><p id="daily-weekly" class="muted"></p>';
 $('view-stats').append(summary);
 const dash=document.createElement('div');dash.className='cal-panel daily-dashboard';dash.innerHTML='<h3>Auch an Ruhetagen aktiv</h3><p>Schritte, Schlaf, Wasser, Ernährung und Regeneration für deinen Tag festhalten.</p><button id="daily-open-today" type="button">Heutigen Tag öffnen</button>';
 $('view-dashboard').append(dash);
 $('daily-open-today').onclick=()=>{window.TrainingCalendar?.openDate(today());document.dispatchEvent(new CustomEvent('mytraining-navigate',{detail:{view:'training'}}));};
 let timer=null;
 $('daily-form').addEventListener('input',()=>{if(!editable)return;clearTimeout(timer);timer=setTimeout(save,450);});
 $('daily-form').addEventListener('change',()=>{if(!editable)return;clearTimeout(timer);save();});
 renderWeekly();
 const iso=window.TrainingCalendar?.selectedDate?.()||today();renderDay(iso,!['montag','mittwoch','freitag'].includes(['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'][dateObj(iso).getDay()]),iso>=first()&&iso<=today());
}
document.addEventListener('mytraining-date-changed',e=>{if(!ready)build();if(e.detail)renderDay(e.detail.date,e.detail.rest,e.detail.editable);});
document.addEventListener('mytraining-language-change',()=>{if(ready){if(!$('daily-panel').hidden)$('daily-date').textContent=dayName(shown);renderWeekly();}});
const interval=setInterval(()=>{if($('cal-rest')){clearInterval(interval);build();}},80);
window.MyTrainingDaily={refresh:()=>{renderWeekly();if(ready)renderDay(shown,!['montag','mittwoch','freitag'].includes(['sonntag','montag','dienstag','mittwoch','donnerstag','freitag','samstag'][dateObj(shown).getDay()]),shown>=first()&&shown<=today());}};
})();
