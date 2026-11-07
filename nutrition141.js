/* MyTraining 1.4.1: compact nutrition navigation – original data elements stay intact. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const L={de:{foods:'Lebensmittel hinzufügen',search:'Lebensmittel suchen',scan:'Barcode scannen',online:'Online suchen',save:'Eigenes Lebensmittel speichern',breakfast:'Frühstück',lunch:'Mittag',dinner:'Abend',snacks:'Snacks',myFoods:'Meine Lebensmittel',saved:'Hinzugefügt',info:'Erfasste Mahlzeiten',nothing:'Noch keine Lebensmittel in dieser Mahlzeit.'},en:{foods:'Add food',search:'Search foods',scan:'Scan barcode',online:'Search online',save:'Save custom food',breakfast:'Breakfast',lunch:'Lunch',dinner:'Dinner',snacks:'Snacks',myFoods:'My foods',saved:'Added',info:'Logged meals',nothing:'No foods in this meal yet.'},fr:{foods:'Ajouter un aliment',search:'Rechercher un aliment',scan:'Scanner un code-barres',online:'Rechercher en ligne',save:'Enregistrer un aliment',breakfast:'Petit-déjeuner',lunch:'Déjeuner',dinner:'Dîner',snacks:'Collations',myFoods:'Mes aliments',saved:'Ajoutés',info:'Repas enregistrés',nothing:'Aucun aliment dans ce repas.'},'ar-EG':{foods:'إضافة طعام',search:'ابحث عن طعام',scan:'امسح الباركود',online:'ابحث عبر الإنترنت',save:'احفظ طعامك',breakfast:'الفطار',lunch:'الغداء',dinner:'العشاء',snacks:'سناكس',myFoods:'أطعمتي',saved:'تمت الإضافة',info:'الوجبات المسجلة',nothing:'لا توجد أطعمة لهذه الوجبة.'}};
const tr=k=>(L[window.MyTrainingI18n?.current?.()||'de']||L.de)[k]||k;
const meals=['breakfast','lunch','dinner','snacks'];let active='breakfast',ready=false;
window.MyTrainingNutritionUI={selectedMeal:()=>active};
function translate(){if(!ready)return;for(const b of document.querySelectorAll('[data-mt141-meal]')){b.querySelector('span').textContent=tr(b.dataset.mt141Meal);}for(const el of document.querySelectorAll('[data-mt141-t]'))el.textContent=tr(el.dataset.mt141T);}
function updateMeal(){
 for(const b of document.querySelectorAll('[data-mt141-meal]')){const on=b.dataset.mt141Meal===active;b.classList.toggle('active',on);b.setAttribute('aria-selected',on?'true':'false');b.setAttribute('tabindex',on?'0':'-1');}
 if($('mt132-meal'))$('mt132-meal').value=active;
 if($('mt14-meal'))$('mt14-meal').value=active;
 // Keep manual inputs intact but show the chosen meal's section only.
 document.querySelectorAll('#mt13-form .mt13-meal').forEach((section,index)=>{section.hidden=meals[index]!==active;});
 window.MyTrainingNutrition132?.refresh?.();
}
function revealSearch(action){
 const d=$('mt141-explore');d.open=true;
 if(action==='scan'){
  $('mt14-scan-open')?.click();
 }else{
  const box=$('mt14-query');box?.focus({preventScroll:true});
 }
 d.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function build(){if(ready||!$('mt14-products')||!$('mt132-library')||!$('mt132-rings')||!$('mt13-form')||!$('mt132-new-form'))return;
 const host=$('mt13-nutrition'),rings=$('mt132-rings'),catalog=$('mt14-products'),library=$('mt132-library'),header=host.querySelector('h4[data-mt13-t="Deine Mahlzeiten"]');
 if(!host||!header)return;
 ready=true;const tabs=document.createElement('div');tabs.className='mt141-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Mahlzeit');
 tabs.innerHTML=meals.map((key,i)=>`<button type="button" role="tab" aria-selected="false" data-mt141-meal="${key}"><span>${tr(key)}</span></button>`).join('');
 rings.after(tabs);
 const card=document.createElement('section');card.className='mt141-food-card';card.id='mt141-card';card.innerHTML=`<h4 data-mt141-t="foods">${tr('foods')}</h4><div class="mt141-quick-actions"><button type="button" id="mt141-quick-search" class="mt141-primary" data-mt141-t="search">${tr('search')}</button><div class="mt141-side-actions"><button type="button" id="mt141-quick-scan" data-mt141-t="scan">${tr('scan')}</button><button type="button" id="mt141-quick-online" data-mt141-t="online">${tr('online')}</button></div></div><div id="mt141-saved-items"></div><button type="button" class="mt141-save-button" id="mt141-save-toggle" data-mt141-t="save">${tr('save')}</button></div>`;
 tabs.after(card);
 const explore=document.createElement('details');explore.id='mt141-explore';explore.className='mt141-explore';explore.innerHTML='<summary data-mt141-t="online">Online suchen</summary>';card.insertAdjacentElement('afterend',explore);explore.append(catalog);
 const foods=document.createElement('details');foods.id='mt141-library-details';foods.className='mt141-library-details';foods.innerHTML='<summary data-mt141-t="myFoods">Meine Lebensmittel</summary>';explore.after(foods);foods.append(library);
 const saved=$('mt132-item-list');card.querySelector('#mt141-saved-items').append(saved);
 const newFood=library.querySelector('.mt132-new-food');newFood.open=false;
 // Remove duplicated headings and long texts from the default view; advanced options stay accessible.
 header.hidden=true;
 const tools=host.querySelector('.mt132-goals');if(tools)tools.open=false;
 card.querySelector('#mt141-quick-search').addEventListener('click',()=>revealSearch('search'));
 card.querySelector('#mt141-quick-online').addEventListener('click',()=>revealSearch('online'));
 card.querySelector('#mt141-quick-scan').addEventListener('click',()=>revealSearch('scan'));
 card.querySelector('#mt141-save-toggle').addEventListener('click',()=>{foods.open=true;newFood.open=true;foods.scrollIntoView({behavior:'smooth',block:'nearest'});const field=$('mt132-new-form')?.querySelector('[name="name"]');field?.focus({preventScroll:true});});
 tabs.addEventListener('click',e=>{const b=e.target.closest('[data-mt141-meal]');if(b){active=b.dataset.mt141Meal;updateMeal();}});
 document.addEventListener('mytraining-language-change',translate);
 document.addEventListener('mytraining-date-changed',()=>{if(ready)updateMeal();});
 translate();updateMeal();
}
const timer=setInterval(()=>{if(ready){clearInterval(timer);return;}build();},100);
})();
