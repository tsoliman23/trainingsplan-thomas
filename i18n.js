/* MyTraining translations. UI language is separate from exercise data and never changes stored keys. */
(()=>{'use strict';
const KEY='mytraining-language-v1';
const LOCALES={de:{flag:'🇩🇪',name:'Deutsch'},en:{flag:'🇬🇧',name:'English'},fr:{flag:'🇫🇷',name:'Français'},'ar-EG':{flag:'🇪🇬',name:'عربي'}};
const MONTHS={de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],en:['January','February','March','April','May','June','July','August','September','October','November','December'],fr:['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],'ar-EG':['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر']};
let lang=localStorage.getItem(KEY)||'de',dict={},ready=false;
const source=new WeakMap();const translated=new WeakMap();
function current(){return lang;}
function t(s){const value=String(s??'');if(lang==='de')return value;if(dict[value]?.[lang])return dict[value][lang];
// Compound exercise headings preserve numeric sets, reps and pause values.
let output=value;for(const key of Object.keys(dict).sort((a,b)=>b.length-a.length)){
 if(key.length<7||!dict[key][lang]||!output.includes(key))continue;
 if(output===key)return dict[key][lang];
 if(output.startsWith(key+' ·')||output.startsWith(key+' –')||output.startsWith(key+' +')){output=dict[key][lang]+output.slice(key.length);break;}
}
if(output!==value){for(const pair of [[' · Pause ',' · '+(dict['Pause']?.[lang]||'Rest')+' ']])output=output.replaceAll(pair[0],pair[1]);return output;}
return value;}
function translateString(s){if(!s.trim())return s;const lead=s.match(/^\s*/)[0],tail=s.match(/\s*$/)[0];const core=s.trim();let replacement=t(core);
// Dynamic wizard progress, timestamps and status counts.
if(replacement===core){const m=/^Schritt (\d+) von (\d+)$/.exec(core);if(m)replacement=lang==='en'?`Step ${m[1]} of ${m[2]}`:lang==='fr'?`Étape ${m[1]} sur ${m[2]}`:lang==='ar-EG'?`الخطوة ${m[1]} من ${m[2]}`:core;}
if(replacement===core){let m=/^Hallo (.+)!$/.exec(core);if(m)replacement=lang==='en'?`Hello ${m[1]}!`:lang==='fr'?`Bonjour ${m[1]} !`:lang==='ar-EG'?`أهلاً يا ${m[1]}!`:core;}
if(replacement===core){let m=/^(\d+) von (\d+) Übungen erledigt$/.exec(core);if(m)replacement=lang==='en'?`${m[1]} of ${m[2]} exercises done`:lang==='fr'?`${m[1]} exercices sur ${m[2]} terminés`:lang==='ar-EG'?`${m[1]} من ${m[2]} تمرين خلصوا`:core;}
return lead+replacement+tail;}
function textNode(n){if(n.parentElement?.closest('script,style,noscript,[data-no-translate],.birth-wheel'))return;
const old=n.nodeValue||'';if(!old.trim())return;
let original=source.get(n);const prev=translated.get(n);
if(original===undefined||old!==prev && old!==original){original=old;source.set(n,old);}
const next=lang==='de'?original:translateString(original);
if(old!==next){translated.set(n,next);n.nodeValue=next;}else translated.set(n,next);
}
function translateAttr(el,attr){if(!el.hasAttribute(attr))return;const prop='i18n'+attr[0].toUpperCase()+attr.slice(1);const current=el.getAttribute(attr);let orig=el.dataset[prop];if(!orig){orig=current;el.dataset[prop]=orig;}const val=lang==='de'?orig:translateString(orig);if(val!==current)el.setAttribute(attr,val);}
function apply(root=document.body){if(!root)return;
const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;while((node=walker.nextNode()))textNode(node);
const attrs=root.querySelectorAll?.('[placeholder],[title],[aria-label]')||[];for(const e of attrs){for(const a of ['placeholder','title','aria-label'])translateAttr(e,a);}
document.documentElement.lang=lang==='ar-EG'?'ar-EG':lang;document.documentElement.dir=lang==='ar-EG'?'rtl':'ltr';
window.MyTrainingBirthday?.refreshLabels?.();
}
let queued=false;function requestApply(){if(queued||!ready)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}
function setLanguage(code){if(!LOCALES[code])return;lang=code;localStorage.setItem(KEY,code);apply();document.dispatchEvent(new CustomEvent('mytraining-language-change',{detail:{language:lang}}));}
function setting(){const view=document.getElementById('xp-settings');if(!view||view.querySelector('#mytraining-language-settings'))return;
const p=document.createElement('div');p.id='mytraining-language-settings';p.className='cal-panel language-settings';p.innerHTML='<h3>Sprache</h3><div class="language-choices"></div>';
const design=view.querySelector('.xp-theme-switch')?.closest('.cal-panel');(design||view.firstElementChild).after(p);
fillChoices(p.querySelector('.language-choices'),false);requestApply();}
function fillChoices(container,intro){container.replaceChildren(...Object.entries(LOCALES).map(([code,x])=>{const b=document.createElement('button');b.type='button';b.className='lang-option';b.dataset.lang=code;b.setAttribute('aria-pressed',String(code===lang));b.innerHTML=`<span class="lang-flag" aria-hidden="true">${x.flag}</span><span>${x.name}</span><span class="lang-tick" aria-hidden="true">${lang===code?'✓':''}</span>`;b.addEventListener('click',()=>{if(!intro){setLanguage(code);fillChoices(container,false);}});return b;}));}
const initialGate=document.getElementById('languageOnboarding');
let selectedIntroLanguage=null;
const INTRO_TEXT={
 de:{welcome:'WILLKOMMEN',title:'Wähle deine Sprache',next:'Weiter →'},
 en:{welcome:'WELCOME',title:'Choose your language',next:'Continue →'},
 fr:{welcome:'BIENVENUE',title:'Choisis ta langue',next:'Continuer →'},
 'ar-EG':{welcome:'أهلاً بيك',title:'اختار لغتك',next:'التالي ←'}
};
function renderIntroSelection(){
 if(!initialGate)return;
 const intro=INTRO_TEXT[selectedIntroLanguage]||INTRO_TEXT.de;
 initialGate.querySelector('#languageWelcome').textContent=intro.welcome;
 initialGate.querySelector('#languageTitle').textContent=intro.title;
 initialGate.querySelector('#languageContinue').textContent=intro.next;
 initialGate.querySelector('#languageContinue').disabled=!selectedIntroLanguage;
 initialGate.querySelector('.language-dialog').dir=selectedIntroLanguage==='ar-EG'?'rtl':'ltr';
 initialGate.querySelectorAll('.lang-option').forEach(button=>{
  const chosen=button.dataset.lang===selectedIntroLanguage;
  button.setAttribute('aria-pressed',String(chosen));
  const tick=button.querySelector('.lang-tick');if(tick)tick.textContent=chosen?'✓':'';
 });
}
function finishIntro(){
 if(!selectedIntroLanguage)return;
 const chosen=selectedIntroLanguage;
 const nextButton=initialGate.querySelector('#languageContinue');
 nextButton.disabled=true;
 try {
  lang=chosen;
  localStorage.setItem(KEY,chosen);
  initialGate.hidden=true;
  document.documentElement.classList.remove('language-boot-first','language-boot-loading');
  document.documentElement.lang=chosen;
  document.documentElement.dir=chosen==='ar-EG'?'rtl':'ltr';
  if(ready)apply();
  // This explicit transition works whether local data loaded before or after the click.
  document.dispatchEvent(new CustomEvent('mytraining-initial-language-confirmed',{detail:{language:chosen}}));
  window.MyTrainingContinueOnboarding?.();
  document.dispatchEvent(new CustomEvent('mytraining-language-change',{detail:{language:chosen}}));
 }catch(e){
  console.error('Language onboarding failed:',e);
  nextButton.disabled=false;
  initialGate.hidden=false;
 }
}
function languageGate(){
 if(!initialGate)return;
 const pending=!localStorage.getItem(KEY);
 initialGate.hidden=!pending;
 if(pending)renderIntroSelection();
}
// First-frame markup remains available immediately without waiting for translations.json.
if(initialGate){
 initialGate.querySelector('.language-choices').addEventListener('click',event=>{
  const button=event.target.closest('button[data-lang]');
  if(!button||!LOCALES[button.dataset.lang])return;
  selectedIntroLanguage=button.dataset.lang;
  renderIntroSelection();
 });
 initialGate.querySelector('#languageContinue').addEventListener('click',finishIntro);
 renderIntroSelection();
}
window.MyTrainingI18n={t,current,setLanguage,monthNames:()=>MONTHS[lang],apply};
fetch('./translations.json').then(r=>{if(!r.ok)throw Error('Translation data unavailable');return r.json();}).then(v=>{
 dict=v;ready=true;
 const first=!localStorage.getItem(KEY);
 languageGate();apply();setting();
 if(!first){document.getElementById('languageOnboarding').hidden=true;document.documentElement.classList.remove('language-boot-first','language-boot-loading');document.dispatchEvent(new CustomEvent('mytraining-language-change',{detail:{language:lang}}));}
 new MutationObserver(requestApply).observe(document.body,{subtree:true,childList:true,characterData:true});
 const si=setInterval(()=>{setting();if(document.getElementById('mytraining-language-settings'))clearInterval(si);},350);
}).catch(e=>{
 console.error('Could not load translations',e);ready=true;languageGate();apply();
 if(localStorage.getItem(KEY)){document.getElementById('languageOnboarding').hidden=true;document.documentElement.classList.remove('language-boot-first','language-boot-loading');}
});
})();
