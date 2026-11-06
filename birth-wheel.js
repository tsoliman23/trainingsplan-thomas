/* MyTraining: iOS-style scroll-snap birthday picker, persisted as ISO YYYY-MM-DD. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const input=$('profileBirth');if(!input)return;
const wheels=[$('birthDayWheel'),$('birthMonthWheel'),$('birthYearWheel')];
const months=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const vals={day:15,month:5,year:2000};
const specs=[{key:'day',wheel:wheels[0],label:n=>String(n).padStart(2,'0')},{key:'month',wheel:wheels[1],label:n=>months[n-1]},{key:'year',wheel:wheels[2],label:n=>String(n)}];
const now=new Date(),lastYear=now.getFullYear();
const itemHeight=44;
const days=()=>new Date(vals.year,vals.month,0).getDate();
const ranges=()=>[Array.from({length:days()},(_,i)=>i+1),Array.from({length:12},(_,i)=>i+1),Array.from({length:lastYear-1899},(_,i)=>lastYear-i)];
let mute=false;
let hasChosen=false;
const pad=n=>String(n).padStart(2,'0');
function sync(){
  vals.day=Math.min(vals.day,days());
  const iso=`${vals.year}-${pad(vals.month)}-${pad(vals.day)}`;
  const date=new Date(`${iso}T12:00:00`);
  input.value=(hasChosen && date<now && vals.year>=1900)?iso:'';
  $('birthValue').textContent=input.value?`${pad(vals.day)}.${pad(vals.month)}.${vals.year}`:'Bitte ein Datum in der Vergangenheit wählen';
}
function paint(spec,list){
  spec.items=list;
  spec.wheel.innerHTML='';
  for(const n of list){const b=document.createElement('button');b.type='button';b.className='birth-option';b.dataset.value=n;b.setAttribute('role','option');b.textContent=spec.label(n);b.addEventListener('click',()=>setValue(spec,n,true));spec.wheel.append(b);}
  updateSelected(spec);
}
function updateSelected(spec){
  for(const node of spec.wheel.children){const yes=+node.dataset.value===vals[spec.key];node.classList.toggle('is-current',yes);node.setAttribute('aria-selected',String(yes));}
}
function scrollTo(spec,smooth){const i=spec.items.indexOf(vals[spec.key]);if(i<0)return;mute=true;spec.wheel.scrollTo({top:i*itemHeight,behavior:smooth?'smooth':'instant'});setTimeout(()=>{mute=false;},smooth?350:45);}
function setValue(spec,n,smooth=false){
  hasChosen=true;
  vals[spec.key]=n;
  if(vals.day>days()){vals.day=days();paint(specs[0],ranges()[0]);scrollTo(specs[0],false);}
  specs.forEach(updateSelected);sync();scrollTo(spec,smooth);
}
function initialize(value){
  let date=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value||'');
  hasChosen=!!date;
  if(date){vals.year=+date[1];vals.month=+date[2];vals.day=+date[3];}
  else {vals.year=Math.max(1900,lastYear-25);vals.month=1;vals.day=1;}
  if(vals.year<1900||vals.year>lastYear||vals.month<1||vals.month>12||vals.day<1||vals.day>days()){
    vals.year=lastYear-25;vals.month=1;vals.day=1;
  }
  const rr=ranges();specs.forEach((s,i)=>{paint(s,rr[i]);scrollTo(s,false);});sync();
}
specs.forEach(spec=>{
 let timeout;
 spec.wheel.addEventListener('scroll',()=>{
  if(mute)return;
  clearTimeout(timeout);timeout=setTimeout(()=>{
   const i=Math.max(0,Math.min(spec.items.length-1,Math.round(spec.wheel.scrollTop/itemHeight)));
   if(spec.items[i]!==vals[spec.key])setValue(spec,spec.items[i]);
   else scrollTo(spec,false);
  },90);
 },{passive:true});
 spec.wheel.addEventListener('keydown',e=>{
  if(!['ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();const i=spec.items.indexOf(vals[spec.key]);const next=Math.max(0,Math.min(spec.items.length-1,i+(e.key==='ArrowDown'?1:-1)));setValue(spec,spec.items[next],true);
 });
});
const monitor=new MutationObserver(()=>{if(input.value!==window.MyTrainingBirthday?.lastValue){initialize(input.value);window.MyTrainingBirthday.lastValue=input.value;}});
// showProfile() fills the hidden input before making the overlay visible.
const overlay=$('profileOverlay');
new MutationObserver(()=>{if(!overlay.hidden)initialize(input.value);}).observe(overlay,{attributes:true,attributeFilter:['hidden']});
window.MyTrainingBirthday={initialize,lastValue:''};
initialize(input.value);
})();
