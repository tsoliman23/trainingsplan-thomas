/* Local, accessible, temporary feedback for successfully completed actions. */
(()=>{'use strict';
let hideTimer=null,lastAuto=0;
function get(){let el=document.getElementById('mytraining-toast');if(!el){el=document.createElement('div');el.id='mytraining-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.hidden=true;el.innerHTML='<span class="toast-check" aria-hidden="true">✓</span><span class="toast-message"></span>';document.body.appendChild(el);}return el;}
function show(message,duration=2400){if(window.__mytrainingResetting)return;const el=get();el.querySelector('.toast-message').textContent=String(message);el.hidden=false;clearTimeout(hideTimer);hideTimer=setTimeout(()=>{el.hidden=true;},duration);}
function autoSaved(){const t=Date.now();if(t-lastAuto<9000)return;lastAuto=t;show('Gespeichert');}
window.MyTrainingToast={success:message=>show(message||'Speichern erfolgreich'),autoSaved};
})();
