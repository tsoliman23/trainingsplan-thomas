(function(){
  'use strict';
  const overlay=document.getElementById('profileOverlay');
  const form=document.getElementById('profileForm');
  if(!overlay||!form)return;
  const steps=[...form.querySelectorAll('.wizard-step')];
  const next=document.getElementById('wizardNext');
  const back=document.getElementById('wizardBack');
  const submit=document.getElementById('wizardSubmit');
  const counter=document.getElementById('wizardCount');
  const segments=[...document.querySelectorAll('#wizardSegments i')];
  const error=document.getElementById('wizardError');
  let index=0;
  function setStep(n){
    index=Math.max(0,Math.min(steps.length-1,n));
    steps.forEach((el,i)=>{el.hidden=i!==index;el.setAttribute('aria-hidden',String(i!==index));});
    counter.textContent=`Schritt ${index+2} von ${steps.length+1}`;
    segments.forEach((el,i)=>el.classList.toggle('onboarding-active',i<=index+1));
    back.hidden=index===0;
    next.hidden=index===steps.length-1;
    submit.hidden=index!==steps.length-1;
    error.hidden=true;
    form.querySelector('.wizard-body').scrollTop=0;
  }
  function fail(text,el){error.textContent=window.MyTrainingI18n?.t(text)||text;error.hidden=false;if(el){el.focus();}return false;}
  function validateStep(){
    const active=steps[index];
    for(const input of active.querySelectorAll('input:not([type=radio])')){
      if(!input.checkValidity()){
        input.reportValidity();
        return fail('Bitte fülle die Pflichtfelder korrekt aus.',input);
      }
    }
    if(index===1){
      const birth=document.getElementById('profileBirth');
      const date=new Date(birth.value+'T12:00:00');
      if(!Number.isFinite(+date)||date>=new Date()||date.getFullYear()<1900)return fail('Bitte gib ein gültiges Geburtsdatum in der Vergangenheit ein.',birth);
    }
    if(index===3&&!form.querySelector('input[name=trainingGoal]:checked'))return fail('Bitte wähle dein Trainingsziel aus.');
    error.hidden=true;return true;
  }
  // Checkboxes allow combined goals, but opposing weight directions are exclusive.
  const goalInputs=[...form.querySelectorAll('input[name="trainingGoal"]')];
  goalInputs.forEach(input=>input.addEventListener('change',()=>{
    if(!input.checked)return;
    const opposite=input.value==='Abnehmen'?'Zunehmen':input.value==='Zunehmen'?'Abnehmen':null;
    if(opposite){const other=goalInputs.find(x=>x.value===opposite);if(other)other.checked=false;}
    error.hidden=true;
  }));
  next.addEventListener('click',()=>{if(validateStep())setStep(index+1);});
  back.addEventListener('click',()=>setStep(index-1));
  form.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target.matches('input:not([type=radio])')&&index<steps.length-1){e.preventDefault();if(validateStep())setStep(index+1);}
  });
  form.addEventListener('submit',e=>{if(index!==steps.length-1){e.preventDefault();if(validateStep())setStep(index+1);return;}if(!validateStep())e.preventDefault();},true);
  const observer=new MutationObserver(()=>{if(!overlay.hidden)setStep(0);});
  observer.observe(overlay,{attributes:true,attributeFilter:['hidden']});
  setStep(0);
})();
