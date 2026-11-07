/* MyTraining 1.3.1: compact daily navigation. Existing forms and storage remain unchanged. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const L={
  de:{training:'Trainingsplan',rest:'Regeneration',nutrition:'Ernährung',hintTraining:'Übungen und Satzwerte',hintRest:'Bewegung, Schlaf und Erholung',hintNutrition:'Mahlzeiten und Nährwerte'},
  en:{training:'Workout plan',rest:'Recovery',nutrition:'Nutrition',hintTraining:'Exercises and sets',hintRest:'Movement, sleep and recovery',hintNutrition:'Meals and nutrients'},
  fr:{training:'Programme d’entraînement',rest:'Récupération',nutrition:'Alimentation',hintTraining:'Exercices et séries',hintRest:'Activité, sommeil et repos',hintNutrition:'Repas et nutriments'},
  'ar-EG':{training:'خطة التمرين',rest:'التعافي',nutrition:'التغذية',hintTraining:'التمارين والمجموعات',hintRest:'الحركة والنوم والتعافي',hintNutrition:'الوجبات والعناصر الغذائية'}
 };
 const lang=()=>L[window.MyTrainingI18n?.current?.()||'de']||L.de;
 let initialized=false;
 const groups={};
 function section(id,description,items){
  const details=document.createElement('details');details.id='mt14-'+id;details.className='mt14-section';
  const summary=document.createElement('summary');summary.className='mt14-summary';summary.innerHTML='<span class="mt14-head"><span class="mt14-title"></span><small class="mt14-hint"></small></span><span class="mt14-chevron" aria-hidden="true"></span>';
  details.append(summary);
  const body=document.createElement('div');body.className='mt14-content';details.append(body);
  for(const element of items)if(element)body.append(element);
  groups[id]=details;return details;
 }
 function translate(){if(!initialized)return;const t=lang();for(const type of ['training','rest','nutrition']){
  groups[type].querySelector('.mt14-title').textContent=t[type];
  groups[type].querySelector('.mt14-hint').textContent=t['hint'+type[0].toUpperCase()+type.slice(1)];
  groups[type].setAttribute('aria-label',t[type]);
 }}
 function update(detail){if(!initialized)return;
  const iso=detail?.date||window.TrainingCalendar?.selectedDate?.();if(!iso)return;
  const d=new Date(iso+'T12:00:00');const rest=![1,3,5].includes(d.getDay());
  const setup=localStorage.getItem('training-setup-date-v1')||'9999-12-31';const available=iso>=setup;
  groups.training.hidden=!available||rest;
  groups.rest.hidden=!available||!rest;
  groups.nutrition.hidden=!available;
  // Reset visible panels to a compact, predictable state when changing dates.
  // Open only the day's primary section; nutrition is always one tap away.
  const changed=groups.training.dataset.date!==iso;
  if(changed){groups.training.open=available&&!rest;groups.rest.open=available&&rest;groups.nutrition.open=false;}
  for(const group of Object.values(groups))group.dataset.date=iso;
 }
 function build(){
  if(initialized||!$('view-training')||!$('trainingsform')||!$('daily-panel')||!$('mt13-nutrition'))return;
  const view=$('view-training'),training=$('trainingsform'),finish=$('finish-day'),rest=$('daily-panel'),nutrition=$('mt13-nutrition');
  const trainingGroup=section('training','training',[finish,training]);
  const restGroup=section('rest','rest',[rest]);
  const nutritionGroup=section('nutrition','nutrition',[nutrition]);
  // Place panels immediately beneath the day navigation, in fixed order.
  const marker=$('cal-status');
  marker.before(trainingGroup,restGroup,nutritionGroup);
  initialized=true;translate();update({date:window.TrainingCalendar?.selectedDate?.()});
 }
 const handleDate=event=>{if(!initialized)build();if(initialized)update(event.detail);};
 document.addEventListener('mytraining-date-changed',handleDate);
 document.addEventListener('mytraining-language-change',()=>{if(!initialized)build();translate();});
 const timer=setInterval(()=>{if(!initialized)build();else clearInterval(timer);},90);
 window.MyTrainingDaySections={refresh:()=>{if(!initialized)build();translate();update();}};
})();
