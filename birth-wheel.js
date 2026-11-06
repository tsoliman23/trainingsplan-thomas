/* Native date selectors: iOS uses its reliable scroll-picker UI. */
(()=>{'use strict';
const get=id=>document.getElementById(id);
const hidden=get('profileBirth'), overlay=get('profileOverlay');
const selects={day:get('birthDayWheel'),month:get('birthMonthWheel'),year:get('birthYearWheel')};
if(!hidden||Object.values(selects).some(x=>!x))return;
const now=new Date(), maxYear=now.getFullYear();
const fallbackMonths=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const pad=v=>String(v).padStart(2,'0');
const isoValid=(y,m,d)=>Number.isInteger(y)&&y>=1900&&y<=maxYear&&Number.isInteger(m)&&m>=1&&m<=12&&Number.isInteger(d)&&d>=1&&d<=new Date(y,m,0).getDate()&&new Date(y,m-1,d,12)<now;
let holding=false;
function options(el,data,placeholder){const old=el.value;el.replaceChildren(new Option(placeholder,''),...data.map(([v,t])=>new Option(String(t),String(v))));if([...el.options].some(o=>o.value===old))el.value=old;else el.value='';}
function refreshDays(){const y=Number(selects.year.value)||maxYear,m=Number(selects.month.value)||1;const count=new Date(y,m,0).getDate();const old=Number(selects.day.value);options(selects.day,Array.from({length:count},(_,i)=>[i+1,pad(i+1)]),'Tag');if(old>count)selects.day.value=String(count);}
function sync(){const y=Number(selects.year.value),m=Number(selects.month.value),d=Number(selects.day.value);hidden.value=isoValid(y,m,d)?`${y}-${pad(m)}-${pad(d)}`:'';hidden.dispatchEvent(new Event('change',{bubbles:true}));}
function initialize(iso){holding=true;const months=window.MyTrainingI18n?.monthNames?.()||fallbackMonths;
options(selects.month,months.map((v,i)=>[i+1,v]),'Monat');
options(selects.year,Array.from({length:maxYear-1899},(_,i)=>[maxYear-i,maxYear-i]),'Jahr');
const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
selects.year.value=match?String(Number(match[1])):'';selects.month.value=match?String(Number(match[2])):'';
refreshDays();selects.day.value=match?String(Number(match[3])):'';
if(!match||!isoValid(Number(match[1]),Number(match[2]),Number(match[3]))){selects.day.value='';selects.month.value='';selects.year.value='';}
holding=false;sync();}
function refreshLabels(){const current=selects.month.value;const months=window.MyTrainingI18n?.monthNames?.()||fallbackMonths;options(selects.month,months.map((v,i)=>[i+1,v]),'Monat');selects.month.value=current;sync();}
Object.values(selects).forEach(el=>{el.addEventListener('change',()=>{if(holding)return;if(el!==selects.day)refreshDays();sync();});});
if(overlay)new MutationObserver(()=>{if(!overlay.hidden)initialize(hidden.value);}).observe(overlay,{attributes:true,attributeFilter:['hidden']});
window.MyTrainingBirthday={initialize,refreshLabels,getValue:()=>hidden.value};
initialize(hidden.value);
})();
