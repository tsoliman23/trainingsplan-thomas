/* MyTraining 1.2 - local-only, read-only progress analytics.
   Dates use local ISO strings; missing measurements are never interpolated. */
(function(root,factory){
 const core=factory();
 if(typeof module==='object'&&module.exports)module.exports=core;
 if(root&&root.document)core.mount(root);
})(typeof window!=='undefined'?window:null,function(){'use strict';
 const LANG={de:'de-DE',en:'en-GB',fr:'fr-FR','ar-EG':'ar-EG'};
 const pad=n=>String(n).padStart(2,'0');
 const toIso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const dateOf=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d,12);};
 const add=(s,n)=>{const d=dateOf(s);d.setDate(d.getDate()+n);return toIso(d);};
 const monday=s=>{const d=dateOf(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return toIso(d);};
 const isIso=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&toIso(dateOf(s))===s;
 const positive=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>0?n:null;};
 const avg=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
 const observed=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>=0?n:null;};
 const dayType=s=>{const day=dateOf(s).getDay();return day===1||day===3||day===5?'training':'rest';};
 function records(raw,setup,today){return Object.entries(raw||{}).filter(([date])=>isIso(date)&&date>=setup&&date<=today).sort((a,b)=>a[0].localeCompare(b[0]));}
 function weightSeries(raw,setup,today){return records(raw,setup,today).map(([date,v])=>({date,value:positive(v?.weight)})).filter(v=>v.value!==null&&v.value>=20&&v.value<=350);}
 // Exactly the last 7 calendar days inclusive, using only recorded measurements.
 function rollingSeven(series){return series.map((p,i)=>{
   const since=add(p.date,-6),window=series.slice(0,i+1).filter(v=>v.date>=since);
   return {...p,average:avg(window.map(x=>x.value)),samples:window.length};
 });}
 function weekly(raw,setup,today,anchor){
  const start=monday(anchor),end=add(start,6),until=end<today?end:today,active=until>=setup;
  const dates=[];for(let i=0;i<7;i++){const date=add(start,i);if(date>=setup&&date<=today)dates.push(date);}
  const trainings=dates.filter(d=>dayType(d)==='training');
  const done=trainings.filter(d=>raw?.[d]?.completed).length;
  const rests=dates.filter(d=>dayType(d)==='rest');
  const hasDaily=v=>v&&typeof v==='object'&&Object.values(v).some(x=>x!==''&&x!==false&&x!==null&&x!==undefined);
  const logged=rests.filter(d=>hasDaily(raw?.[d]?.daily));
  const metrics={};for(const key of ['steps','sleep','water','minutes','calories','protein']){
    const values=logged.map(d=>observed(raw?.[d]?.daily?.[key])).filter(v=>v!==null);
    metrics[key]={mean:avg(values),count:values.length,total:values.reduce((a,b)=>a+b,0)};
  }
  const weighIns=weightSeries(raw,setup,today).filter(p=>p.date>=start&&p.date<=end);
  const previous=weightSeries(raw,setup,today).filter(p=>p.date<start).at(-1);
  const first=weighIns[0],last=weighIns.at(-1);
  const delta=last?(first&&first!==last?last.value-first.value:previous?last.value-previous.value:null):null;
  return {start,end,until,active,eligibleDays:dates.length,plannedTrainings:trainings.length,completedTrainings:done,
    availableRestDays:rests.length,loggedRestDays:logged.length,metrics,weighIns:weighIns.length,latestWeight:last?.value??null,
    weightDelta:delta,weightDeltaIsSinceBefore:!!(last&&!first||last&&first===last&&previous)};
 }
 function mount(win){const doc=win.document,$=id=>doc.getElementById(id);
  let ready=false,range='30',weekAnchor=monday(toIso(new Date()));
  const today=()=>toIso(new Date());
  const setup=()=>{const s=win.localStorage.getItem('training-setup-date-v1');return isIso(s)?s:today();};
  const data=()=>{try{const d=JSON.parse(win.localStorage.getItem('training-calendar-days-v1')||'{}');return d&&typeof d==='object'&&!Array.isArray(d)?d:{};}catch{return {};}};
  const locale=()=>LANG[win.MyTrainingI18n?.current?.()||'de']||'de-DE';
  const txt=s=>win.MyTrainingI18n?.t(s)||s;
  const num=(v,dec=1)=>v===null||v===undefined?'–':Number(v).toLocaleString(locale(),{minimumFractionDigits:dec,maximumFractionDigits:dec});
  const shortDate=s=>new Intl.DateTimeFormat(locale(),{day:'2-digit',month:'short'}).format(dateOf(s));
  const fullDate=s=>new Intl.DateTimeFormat(locale(),{day:'numeric',month:'long',year:'numeric'}).format(dateOf(s));
  const set=(id,value)=>{const el=$(id);if(el)el.textContent=value;};
  const weightHint=series=>!series.length?txt('Noch keine Gewichtseinträge vorhanden.'):series.length===1?txt('Ein Messwert vorhanden. Für einen Verlauf weitere Tage erfassen.'):txt('Der 7-Tage-Durchschnitt berücksichtigt nur vorhandene Messungen innerhalb der letzten sieben Kalendertage.');
  function linePath(points,xFn,yFn){return points.map((p,i)=>`${i?'L':'M'}${xFn(p).toFixed(2)} ${yFn(p).toFixed(2)}`).join(' ');}
  function plot(series){
    const svg=$('mt12-chart');if(!svg)return;
    svg.replaceChildren();
    const empty=$('mt12-empty');const all=series;
    if(all.length===0){empty.hidden=false;empty.textContent=txt('Noch keine Gewichtseinträge vorhanden.');svg.hidden=true;set('mt12-chart-desc',txt('Noch keine Gewichtseinträge vorhanden.'));return;}
    empty.hidden=true;svg.hidden=false;
    const W=640,H=238,l=48,r=15,t=19,b=35;
    const vals=all.flatMap(x=>[x.value,x.average]);
    let lo=Math.min(...vals),hi=Math.max(...vals);const padding=Math.max(.6,(hi-lo)*.18);lo-=padding;hi+=padding;
    const dates=all.map(x=>dateOf(x.date).getTime());const d0=Math.min(...dates),d1=Math.max(...dates);
    const x=p=>l+(dateOf(p.date).getTime()-d0)/Math.max(1,d1-d0)*(W-l-r);
    const y=p=>H-b-(p-lo)/(hi-lo)*(H-t-b);
    const ns='http://www.w3.org/2000/svg';
    function create(tag,attrs,parent=svg){const node=doc.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,String(v));parent.append(node);return node;}
    const label=win.document.createElementNS(ns,'title');label.textContent=txt('Gewichtsverlauf und 7-Tage-Durchschnitt');svg.append(label);
    for(let i=0;i<=4;i++){
      const v=lo+(hi-lo)*i/4, yy=y(v);
      create('line',{x1:l,y1:yy,x2:W-r,y2:yy,class:'mt12-gridline'});
      const label=create('text',{x:l-7,y:yy+4,'text-anchor':'end',class:'mt12-tick'});label.textContent=num(v,1);
    }
    const first=all[0].date,last=all.at(-1).date;
    const firstTick=create('text',{x:l,y:H-9,class:'mt12-tick'});firstTick.textContent=shortDate(first);
    const lastTick=create('text',{x:W-r,y:H-9,'text-anchor':'end',class:'mt12-tick'});lastTick.textContent=shortDate(last);
    if(all.length>2){const mid=all[Math.floor(all.length/2)];const midTick=create('text',{x:x(mid),y:H-9,'text-anchor':'middle',class:'mt12-tick'});midTick.textContent=shortDate(mid.date);}
    if(all.length>=2){create('path',{d:linePath(all,x,p=>y(p.value)),class:'mt12-line-measured'});
      create('path',{d:linePath(all,x,p=>y(p.average)),class:'mt12-line-average'});}
    for(const p of all){const c=create('circle',{cx:x(p),cy:y(p.value),r:4.5,class:'mt12-dot'});const title=create('title',{},c);title.textContent=`${fullDate(p.date)}: ${num(p.value)} kg`;}
    set('mt12-chart-desc',`${all.length} ${txt('Messungen')} · ${txt('Letzter Wert')}: ${num(all.at(-1).value)} kg · ${txt('7-Tage-Durchschnitt')}: ${num(all.at(-1).average)} kg (${all.at(-1).samples} ${txt('Messungen')})`);
  }
  function renderWeight(){const all=weightSeries(data(),setup(),today());let current=all;
    if(range!=='all'){const after=add(today(),1-Number(range));current=all.filter(x=>x.date>=after);}
    const series=rollingSeven(all);const filtered=series.filter(x=>current.some(c=>c.date===x.date));
    plot(filtered);
    const latest=series.at(-1),goal=positive((()=>{try{return JSON.parse(win.localStorage.getItem('training-profile-v1')||'{}').goalWeight;}catch{return null;}})());
    set('mt12-current',latest?`${num(latest.value)} kg`:'–');
    set('mt12-average',latest?`${num(latest.average)} kg`:'–');
    set('mt12-goal',goal?`${num(goal)} kg`:'–');
    set('mt12-distance',latest&&goal?`${num(Math.abs(latest.value-goal))} kg`:'–');
    set('mt12-samples',latest?`${latest.samples} ${txt('Messungen in sieben Tagen')}`:txt('Noch keine Messung'));
    set('mt12-explain',weightHint(series));
  }
  function renderWeek(){const w=weekly(data(),setup(),today(),weekAnchor);let earliest=monday(setup()),current=monday(today());
    if(weekAnchor<earliest)weekAnchor=earliest;if(weekAnchor>current)weekAnchor=current;
    const w2=weekAnchor===w.start?w:weekly(data(),setup(),today(),weekAnchor);
    set('mt12-week-range',`${shortDate(w2.start)} – ${fullDate(w2.end)}`);
    set('mt12-week-train',`${w2.completedTrainings} / ${w2.plannedTrainings}`);
    set('mt12-week-rest',`${w2.loggedRestDays} / ${w2.availableRestDays}`);
    set('mt12-week-steps',w2.metrics.steps.mean===null?'–':num(Math.round(w2.metrics.steps.mean),0));
    set('mt12-week-sleep',w2.metrics.sleep.mean===null?'–':num(w2.metrics.sleep.mean)+' h');
    set('mt12-week-water',w2.metrics.water.mean===null?'–':num(w2.metrics.water.mean)+' l');
    set('mt12-week-weight',w2.latestWeight===null?'–':num(w2.latestWeight)+' kg');
    set('mt12-week-delta',w2.weightDelta===null?'–':(w2.weightDelta>0?'+':w2.weightDelta<0?'−':'±')+num(Math.abs(w2.weightDelta))+' kg');
    $('mt12-week-prev').disabled=weekAnchor<=earliest;$('mt12-week-next').disabled=weekAnchor>=current;
    const points=[];
    if(w2.completedTrainings===w2.plannedTrainings&&w2.plannedTrainings>0)points.push(txt('Alle bisherigen Trainingstage dieser Woche abgeschlossen.'));
    else if(w2.plannedTrainings>0)points.push(`${w2.completedTrainings} ${txt('von')} ${w2.plannedTrainings} ${txt('Trainingstagen abgeschlossen')}.`);
    if(w2.loggedRestDays>0)points.push(`${w2.loggedRestDays} ${txt('Regenerationstage dokumentiert')}.`);
    if(w2.metrics.steps.count>0)points.push(`${txt('Durchschnittlich')} ${num(Math.round(w2.metrics.steps.mean),0)} ${txt('Schritte pro erfasstem Tag')}.`);
    set('mt12-week-text',points.length?points.join(' '):txt('Für diese Woche sind noch keine Aktivitäten erfasst.'));
    const dash=$('mt12-dash-summary');if(dash){const now=weekly(data(),setup(),today(),monday(today()));dash.textContent=`${now.completedTrainings}/${now.plannedTrainings} ${txt('Trainingstage abgeschlossen')} · ${now.loggedRestDays} ${txt('Regenerationstage dokumentiert')}`;}
  }
  function render(){if(!ready)return;renderWeight();renderWeek();}
  function init(){if(ready||!$('view-stats')||!$('view-dashboard'))return;ready=true;
    const section=doc.createElement('section');section.id='mt12-analytics';section.className='cal-panel mt12-panel';
    section.innerHTML=`<div class="mt12-header"><div><span class="mt12-kicker">MYTRAINING 1.3.3</span><h3>${txt('Dein Gewichtsverlauf')}</h3></div><label class="mt12-filter-label">${txt('Zeitraum')}<select id="mt12-range" aria-label="${txt('Zeitraum auswählen')}"><option value="30">${txt('30 Tage')}</option><option value="90">${txt('90 Tage')}</option><option value="all">${txt('Gesamter Zeitraum')}</option></select></label></div>
    <div class="mt12-metrics"><div><small>${txt('Aktuelles Gewicht')}</small><strong id="mt12-current">–</strong></div><div><small>${txt('7-Tage-Durchschnitt')}</small><strong id="mt12-average">–</strong></div><div><small>${txt('Zielgewicht')}</small><strong id="mt12-goal">–</strong></div><div><small>${txt('Abstand zum Ziel')}</small><strong id="mt12-distance">–</strong></div></div>
    <div class="mt12-chartbox"><svg id="mt12-chart" viewBox="0 0 640 238" role="img" aria-label="${txt('Gewichtsverlauf und 7-Tage-Durchschnitt')}" preserveAspectRatio="xMidYMid meet"></svg><p id="mt12-empty" class="muted" hidden></p></div>
    <div class="mt12-legend"><span><i class="mt12-key-weight"></i>${txt('Gemessenes Gewicht')}</span><span><i class="mt12-key-average"></i>${txt('7-Tage-Durchschnitt')}</span></div>
    <p id="mt12-chart-desc" class="mt12-caption" aria-live="polite"></p><p id="mt12-explain" class="mt12-caption"></p><small id="mt12-samples" class="mt12-footnote"></small>`;
    const stats=$('view-stats');stats.insertBefore(section,stats.firstElementChild);
    const review=doc.createElement('section');review.id='mt12-weekly-review';review.className='cal-panel mt12-panel';
    review.innerHTML=`<div class="mt12-header"><div><span class="mt12-kicker">${txt('DEINE WOCHE')}</span><h3>${txt('Wochenrückblick')}</h3></div><div class="mt12-weeks"><button id="mt12-week-prev" type="button" aria-label="${txt('Vorherige Woche')}">‹</button><button id="mt12-week-next" type="button" aria-label="${txt('Nächste Woche')}">›</button></div></div><p id="mt12-week-range" class="mt12-dates"></p>
    <div class="mt12-metrics mt12-week-grid"><div><small>${txt('Training abgeschlossen')}</small><strong id="mt12-week-train">–</strong></div><div><small>${txt('Regeneration dokumentiert')}</small><strong id="mt12-week-rest">–</strong></div><div><small>${txt('Ø Schritte')}</small><strong id="mt12-week-steps">–</strong></div><div><small>${txt('Ø Schlaf')}</small><strong id="mt12-week-sleep">–</strong></div><div><small>${txt('Ø Wasser')}</small><strong id="mt12-week-water">–</strong></div><div><small>${txt('Letztes Wochengewicht')}</small><strong id="mt12-week-weight">–</strong></div><div><small>${txt('Gewichtsveränderung')}</small><strong id="mt12-week-delta">–</strong></div></div><p id="mt12-week-text" class="mt12-summary" aria-live="polite"></p><p class="mt12-caption">${txt('Durchschnittswerte beziehen sich ausschließlich auf Tage mit entsprechenden Einträgen. Fehlende Werte werden nicht als Null gezählt. Die aktuelle Woche umfasst nur vergangene Tage.')}</p>`;
    section.after(review);
    const dash=doc.createElement('div');dash.className='cal-panel mt12-dashboard';dash.innerHTML=`<div class="mt12-dash-head"><h3>${txt('Deine Woche im Überblick')}</h3><button id="mt12-dash-open" type="button">${txt('Wochenrückblick ansehen')}</button></div><p id="mt12-dash-summary"></p>`;
    const weight=$('view-dashboard').querySelector('.xp-weight-card');if(weight)weight.after(dash);else $('view-dashboard').append(dash);
    $('mt12-dash-open').onclick=()=>doc.dispatchEvent(new CustomEvent('mytraining-navigate',{detail:{view:'stats'}}));
    $('mt12-range').value=range;$('mt12-range').onchange=e=>{range=e.target.value;renderWeight();};
    $('mt12-week-prev').onclick=()=>{weekAnchor=add(weekAnchor,-7);renderWeek();};
    $('mt12-week-next').onclick=()=>{weekAnchor=add(weekAnchor,7);renderWeek();};
    doc.addEventListener('mytraining-date-changed',render);
    doc.addEventListener('mytraining-language-change',render);
    doc.addEventListener('mytraining-data-updated',render);
    doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)render();});
    render();
  }
  const timer=win.setInterval(()=>{if($('view-stats')&&$('view-dashboard')){win.clearInterval(timer);init();}},120);
  win.MyTrainingAnalytics={refresh:render,computeWeekly:weekly};
 }
 return {add,monday,records,positive,observed,weightSeries,rollingSeven,weekly,dayType,mount};
});
