/* MyTraining birthday wheels: visible centered option is the stored ISO value. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const hidden=$('profileBirth'),overlay=$('profileOverlay');if(!hidden||!overlay)return;
const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const today=new Date();const maxYear=today.getFullYear();const values={day:1,month:1,year:maxYear-25};
const pad=n=>String(n).padStart(2,'0');const daysInMonth=()=>new Date(values.year,values.month,0).getDate();
const cfg=[{key:'day',el:$('birthDayWheel'),get:()=>Array.from({length:daysInMonth()},(_,i)=>i+1),label:n=>pad(n)},
{key:'month',el:$('birthMonthWheel'),get:()=>Array.from({length:12},(_,i)=>i+1),label:n=>(window.MyTrainingI18n?.monthNames?.()||months)[n-1]},
{key:'year',el:$('birthYearWheel'),get:()=>Array.from({length:maxYear-1899},(_,i)=>maxYear-i),label:n=>String(n)}];
let initialized=false,changed=false;const pending=new Map();
function valueISO(){return `${values.year}-${pad(values.month)}-${pad(values.day)}`;}
function sync(){const iso=valueISO();const d=new Date(iso+'T12:00:00');hidden.value=(changed&&d<today&&values.year>=1900)?iso:'';hidden.dispatchEvent(new Event('change',{bubbles:true}));}
function setHighlight(c){for(const e of c.el.children){const active=Number(e.dataset.value)===values[c.key];e.classList.toggle('is-current',active);e.setAttribute('aria-selected',String(active));}}
function unit(c){return c.el.firstElementChild?.getBoundingClientRect().height||48;}
function centerIndex(c){const h=unit(c);return Math.min(c.items.length-1,Math.max(0,Math.round(c.el.scrollTop/h)));}
function jump(c,smooth=false){const idx=c.items.indexOf(values[c.key]);if(idx<0)return;c.programmatic=true;c.el.scrollTo({top:idx*unit(c),behavior:smooth?'smooth':'instant'});clearTimeout(c.guard);c.guard=setTimeout(()=>{c.programmatic=false;},smooth?430:70);}
function redraw(c){const arr=c.get();c.items=arr;c.el.replaceChildren(...arr.map(n=>{const e=document.createElement('button');e.type='button';e.className='birth-option';e.dataset.value=n;e.textContent=c.label(n);e.setAttribute('role','option');e.addEventListener('click',()=>select(c,n,true));return e;}));setHighlight(c);jump(c);}
function select(c,n,scroll=false){if(!c.items.includes(n))return;changed=true;values[c.key]=n;if(values.day>daysInMonth()){values.day=daysInMonth();redraw(cfg[0]);}cfg.forEach(setHighlight);sync();if(scroll)jump(c,true);}
function settled(c){if(c.programmatic)return;const n=c.items[centerIndex(c)];if(n===undefined)return;select(c,n,false);const snap=c.items.indexOf(n)*unit(c);if(Math.abs(c.el.scrollTop-snap)>0.4){c.programmatic=true;c.el.scrollTo({top:snap,behavior:'smooth'});setTimeout(()=>{c.programmatic=false},340);}}
for(const c of cfg){if(!c.el)continue;c.el.addEventListener('scroll',()=>{if(c.programmatic)return;const n=c.items?.[centerIndex(c)];if(n!==undefined){changed=true;values[c.key]=n;if(c.key!=='day'&&values.day>daysInMonth()){values.day=daysInMonth();redraw(cfg[0]);}cfg.forEach(setHighlight);sync();}clearTimeout(pending.get(c));pending.set(c,setTimeout(()=>settled(c),130));},{passive:true});c.el.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const idx=c.items.indexOf(values[c.key]);select(c,c.items[Math.max(0,Math.min(c.items.length-1,idx+(e.key==='ArrowDown'?1:-1)))],true);});}
function initialize(iso){let d=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');changed=!!d;if(d){values.year=+d[1];values.month=+d[2];values.day=+d[3];}else{values.year=maxYear-25;values.month=1;values.day=1;}
if(values.year<1900||values.year>maxYear||values.month<1||values.month>12||values.day<1||values.day>daysInMonth()){values.year=maxYear-25;values.month=1;values.day=1;changed=false;}
cfg.forEach(redraw);sync();initialized=true;}
function refreshLabels(){const c=cfg[1];if(!c.items)return;const names=window.MyTrainingI18n?.monthNames?.()||months;c.el.querySelectorAll('.birth-option').forEach((e,i)=>{if(e.textContent!==names[i])e.textContent=names[i];});}
new MutationObserver(()=>{if(!overlay.hidden)requestAnimationFrame(()=>initialize(hidden.value));}).observe(overlay,{attributes:true,attributeFilter:['hidden']});
window.MyTrainingBirthday={initialize,refreshLabels,getValue:valueISO};
initialize(hidden.value);
})();
