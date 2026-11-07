/* MyTraining 1.4.2: separate Nutrition and Workout tabs with a compact daily recovery card. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const LANG={de:{training:'Trainingsplan',rest:'Regeneration',hintTraining:'Übungen und Satzwerte',hintRest:'Bewegung, Schlaf und Erholung',empty:'An diesem Tag ist kein Krafttraining geplant. Deine Regeneration kannst du unter Heute dokumentieren.'},en:{training:'Workout plan',rest:'Recovery',hintTraining:'Exercises and sets',hintRest:'Activity, sleep and recovery',empty:'No strength training is planned for this day. Log your recovery on Today.'},fr:{training:'Entraînement',rest:'Récupération',hintTraining:'Exercices et séries',hintRest:'Activité, sommeil et repos',empty:'Aucun entraînement prévu ce jour. Note ta récupération sous Aujourd’hui.'},'ar-EG':{training:'خطة التمرين',rest:'التعافي',hintTraining:'التمارين والمجموعات',hintRest:'الحركة والنوم والتعافي',empty:'مفيش تمرين قوة متخطط لليوم. سجل التعافي في صفحة النهارده.'}};
 const t=()=>LANG[window.MyTrainingI18n?.current?.()||'de']||LANG.de;
 let ready=false;
 function group(id,title,hint,items){const box=document.createElement('details');box.id=id;box.className='mt14-section';const head=document.createElement('summary');head.className='mt14-summary';head.innerHTML='<span class="mt14-head"><span class="mt14-title"></span><small class="mt14-hint"></small></span><span class="mt14-chevron" aria-hidden="true"></span>';head.querySelector('.mt14-title').textContent=title;head.querySelector('.mt14-hint').textContent=hint;box.append(head);const content=document.createElement('div');content.className='mt14-content';items.filter(Boolean).forEach(e=>content.append(e));box.append(content);return box;}
 function translate(){if(!ready)return;for(const [key,id] of [['training','mt14-training'],['rest','mt14-rest']]){const el=$(id);el.querySelector('.mt14-title').textContent=t()[key];el.querySelector('.mt14-hint').textContent=t()['hint'+key[0].toUpperCase()+key.slice(1)];} $('mt15-no-workout').textContent=t().empty;}
 function refresh(e){if(!ready)return;const iso=e?.date||window.TrainingCalendar?.selectedDate?.();if(!iso)return;const dow=new Date(iso+'T12:00:00').getDay(),rest=![1,3,5].includes(dow);const setup=localStorage.getItem('training-setup-date-v1')||'9999-12-31',available=iso>=setup;
 $('mt14-training').hidden=!available||rest;$('mt14-rest').hidden=!available||!rest;$('mt15-no-workout').hidden=!rest||!available;
 const changed=$('mt14-training').dataset.date!==iso;if(changed){$('mt14-training').open=available&&!rest;$('mt14-rest').open=available&&rest;}
 $('mt14-training').dataset.date=iso;$('mt14-rest').dataset.date=iso;
 }
 function build(){if(ready||!$('view-training')||!$('view-nutrition')||!$('view-dashboard')||!$('trainingsform')||!$('daily-panel')||!$('mt13-nutrition')||!$('finish-day'))return;
 const workout=group('mt14-training',t().training,t().hintTraining,[$('finish-day'),$('trainingsform')]);
 const recovery=group('mt14-rest',t().rest,t().hintRest,[$('daily-panel')]);
 $('cal-status').before(workout);
 const dash=$('view-dashboard'),weight=$('.xp-weight-card');if(weight)weight.after(recovery);else dash.append(recovery);
 const nutrition=$('mt13-nutrition');$('view-nutrition').append(nutrition);
 const empty=document.createElement('p');empty.id='mt15-no-workout';empty.className='mt15-no-workout';$('view-training').append(empty);
 ready=true;translate();refresh();
 }
 document.addEventListener('mytraining-date-changed',e=>{if(!ready)build();refresh(e.detail);});document.addEventListener('mytraining-language-change',()=>{if(!ready)build();translate();});
 const retry=setInterval(()=>{build();if(ready)clearInterval(retry);},90);
 window.MyTrainingDaySections={refresh:()=>{build();translate();refresh();}};
})();
