/* Erweiterungen: Satzprotokoll, Trainingshistorie, Trends und sichere Dateisicherung. Offline. */
(function () {
  'use strict';
  const HISTORY_KEY='training-history-v2';
  const days=[['montag','Montag'],['mittwoch','Mittwoch'],['freitag','Freitag']];
  const $=id=>document.getElementById(id);
  const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function notify(message){const el=$('history-feedback');if(el)el.textContent=message;}
  function listHistory(){try{const x=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');return Array.isArray(x)?x:[];}catch(_){return [];}}
  function storeHistory(rows){localStorage.setItem(HISTORY_KEY,JSON.stringify(rows));}
  function isoDay(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  function dayRoot(id){return $(id);}
  function exerciseRows(id){return [...dayRoot(id).querySelectorAll('.item')].filter(el=>el.querySelector('input[data-check]'));}
  function titleOf(el){return el.querySelector('label strong')?.textContent?.trim()||'Übung';}
  function result(el,name){const input=el.querySelector('input[name="'+name+'"]');return input?input.value:'';}
  function captureDay(day){
    const root=dayRoot(day);
    const exercises=exerciseRows(day).map(el=>{
      const checkbox=el.querySelector('input[data-check]'), key=checkbox.name;
      const weights=[1,2,3].map(n=>result(el,'weight_set'+n+'_'+key));
      const reps=[1,2,3].map(n=>result(el,'reps_set'+n+'_'+key));
      const shared=result(el,'done_reps_'+key);
      return {key,title:titleOf(el),done:checkbox.checked,sets:result(el,'done_sets_'+key),reps:reps.map(x=>x||shared),weights};
    });
    return {day,dayName:days.find(d=>d[0]===day)[1],exercises,notes:root.querySelector('textarea[name]')?.value||'',finished:exercises.filter(x=>x.done).length,total:exercises.length};
  }
  function installReps(){
    document.querySelectorAll('.item.exercise').forEach(el=>{
      if(el.dataset.setRepsInstalled)return;
      const ck=el.querySelector('input[data-check]');if(!ck)return;
      const shared=el.querySelector('input[name="done_reps_'+ck.name+'"]');
      const row=el.querySelector('.exercise-values');if(!row)return;
      el.dataset.setRepsInstalled='1';
      if(shared){const label=shared.closest('.value-field')?.querySelector('span');if(label){label.textContent='Wdh. alt';label.title='Bisheriger gemeinsamer Wiederholungswert';}}
      const group=document.createElement('div');group.className='set-reps-row';
      group.innerHTML='<span class="set-reps-label">Wiederholungen je Satz</span>';
      for(let i=1;i<=3;i++){
        const lab=document.createElement('label');lab.className='set-rep-field';
        const span=document.createElement('span');span.textContent='Satz '+i;
        const input=document.createElement('input');input.type='number';input.min='0';input.max='100';input.step='1';input.inputMode='numeric';input.placeholder='–';input.name='reps_set'+i+'_'+ck.name;input.setAttribute('data-result','1');input.setAttribute('aria-label','Wiederholungen Satz '+i);
        lab.append(span,input);group.appendChild(lab);
      }
      row.appendChild(group);
    });
  }
  installReps();
  const observer=new MutationObserver(()=>installReps());
  observer.observe($('trainingsform'),{childList:true,subtree:true});
  function buildInterface(){
    const host=document.createElement('section');host.id='training-history';host.className='history-panel';
    host.innerHTML=`<h2>Trainingshistorie und Fortschritt</h2>
      <p class="muted">Schließe einen Trainingstag ab, um die Ergebnisse dauerhaft in der Historie zu erfassen. Vergangene Einheiten bleiben beim Zurücksetzen der Woche erhalten.</p>
      <div class="history-actions"><button id="finish-day" type="button">Aktuellen Trainingstag abschließen</button><button id="archive-week" type="button">Woche archivieren und neu starten</button></div>
      <div class="history-stats" id="history-stats"></div>
      <h3>Verlauf</h3><div class="history-chart" id="history-chart" role="img" aria-label="Gewichtsverlauf"></div>
      <div class="history-toolbar"><label for="trend-exercise">Übung für Gewichtsverlauf</label><select id="trend-exercise"></select></div>
      <div id="exercise-chart" class="history-chart" role="img" aria-label="Trainingsgewichte im Verlauf"></div>
      <h3>Gespeicherte Einheiten</h3><div id="history-list" class="history-list"></div>
      <h3>Datensicherung</h3><p class="muted">Mit „Sicherung herunterladen“ erhältst du eine Datei mit aktuellem Trainingsstand, Profil und Historie. Bewahre sie außerhalb dieses Geräts auf. Beim Import werden die aktuellen lokalen Daten erst nach deiner Bestätigung ersetzt.</p>
      <div class="history-actions"><button type="button" id="download-backup">Sicherung herunterladen</button><button type="button" id="import-backup">Sicherung wiederherstellen</button><input hidden type="file" id="import-backup-file" accept=".json,application/json"></div>
      <p id="history-feedback" class="muted" role="status" aria-live="polite"></p>`;
    const foot=document.querySelector('.foot');foot.parentNode.insertBefore(host,foot);
    document.querySelectorAll('.training-day').forEach(root=>{
      const note=root.querySelector('textarea[name]');if(!note)return;
      const b=document.createElement('button');b.type='button';b.className='finish-inline';b.textContent='Trainingstag abschließen';b.addEventListener('click',()=>finishDay(root.id));
      note.insertAdjacentElement('afterend',b);
    });
    $('finish-day').addEventListener('click',()=>finishDay(document.querySelector('.training-day.day-active')?.id||'montag'));
    $('archive-week').addEventListener('click',archiveWeek);
    $('trend-exercise').addEventListener('change',renderExerciseChart);
    $('download-backup').addEventListener('click',downloadBackup);
    $('import-backup').addEventListener('click',()=>$('import-backup-file').click());
    $('import-backup-file').addEventListener('change',importBackup);
    renderHistory();
  }
  function finishDay(day){
    if(window.TrainingCalendar?.selectedDate?.() > isoDay()){notify('Zukünftige Trainingstage können nicht abgeschlossen werden.');return;}
    if(!window.TrainingApp){notify('App initialisiert noch. Bitte erneut versuchen.');return;}
    const info=captureDay(day);
    if(!info.finished&&!confirm('Für diesen Trainingstag ist noch keine Übung als erledigt markiert. Trotzdem archivieren?'))return;
    const record={id:'d-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),date:(window.TrainingCalendar?.selectedDate?.() || isoDay()),createdAt:Date.now(),kind:'day',weight:$('bodyWeight').value, ...info};
    const history=listHistory();history.unshift(record);
    try{storeHistory(history);renderHistory();notify(info.dayName+' als Trainingseinheit archiviert.');}catch(e){notify('Historie konnte nicht gespeichert werden. Bitte zuerst eine Sicherung herunterladen.');}
  }
  function archiveWeek(){
    if(!window.TrainingApp)return;
    if(!confirm('Aktuelle Woche archivieren und die Häkchen, Satzwerte sowie Notizen für eine neue Woche leeren? Die Historie bleibt erhalten.'))return;
    const history=listHistory(),date=isoDay(),weight=$('bodyWeight').value;
    const records=days.map(([day])=>({id:'w-'+Date.now()+'-'+day,date,createdAt:Date.now(),kind:'week',weight,...captureDay(day)}));
    try{storeHistory([...records,...history]);}catch(e){notify('Speichern der Historie fehlgeschlagen; die Woche wurde nicht zurückgesetzt.');return;}
    // Preserve a manual local recovery point before clearing the current week.
    try{localStorage.setItem('training-manual-restore-v1',JSON.stringify(window.TrainingApp.getSnapshot()));}catch(_){}
    document.querySelectorAll('input[data-check]').forEach(x=>{x.checked=false;x.defaultChecked=false;});
    document.querySelectorAll('input[data-result]').forEach(x=>x.value='');
    document.querySelectorAll('textarea[name]').forEach(x=>x.value='');
    window.TrainingApp.save();window.TrainingApp.refresh();renderHistory();
    notify('Woche archiviert. Ein Wiederherstellungspunkt der alten Woche ist vorhanden.');
  }
  function metric(values,label){return '<div class="metric"><strong>'+safe(values)+'</strong><span>'+safe(label)+'</span></div>';}
  function spark(values,label,color='#2f5be8'){
    if(!values.length)return '<div class="chart-empty">Noch keine historischen Werte vorhanden.</div>';
    const W=640,H=152,pad=24, min=Math.min(...values),max=Math.max(...values),range=Math.max(1,max-min),den=Math.max(1,values.length-1);
    const pts=values.map((v,i)=>[pad+i*(W-2*pad)/den,H-pad-(v-min)/range*(H-2*pad)]);
    const points=pts.map(p=>p.join(',')).join(' ');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${safe(label)}" preserveAspectRatio="xMidYMid meet"><path d="M${pad} ${H-pad}H${W-pad}" stroke="#c7d6f2" stroke-width="1.5"/><polyline points="${points}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${color}"/>`).join('')}</svg><div class="chart-caption">${safe(label)} · ${values.length} Messpunkte · zuletzt ${safe(String(values[values.length-1]).replace('.',','))} kg</div>`;
  }
  function uniqueEntries(){return listHistory().slice().sort((a,b)=>a.createdAt-b.createdAt);}
  function renderExerciseChart(){
    const key=$('trend-exercise').value;const rows=uniqueEntries(),values=[];
    for(const rec of rows)for(const e of rec.exercises||[])if(e.key===key){const weights=(e.weights||[]).map(Number).filter(x=>Number.isFinite(x)&&x>0);if(weights.length)values.push(Math.max(...weights));}
    $('exercise-chart').innerHTML=spark(values,'Höchstes dokumentiertes Satzgewicht');
  }
  function renderHistory(){
    const rows=listHistory();const daysCount=rows.length,done=rows.reduce((n,x)=>n+(x.finished||0),0);
    $('history-stats').innerHTML=metric(daysCount,'archivierte Trainingstage')+metric(done,'erledigte Übungen dokumentiert');
    const chronological=uniqueEntries();const weights=[];
    for(const x of chronological){const value=Number(x.weight);if(Number.isFinite(value)&&value>0&&(weights.length===0||weights[weights.length-1]!==value))weights.push(value);}
    $('history-chart').innerHTML=spark(weights,'Körpergewicht im Verlauf');
    const select=$('trend-exercise'),old=select.value, exercises=new Map();
    for(const item of document.querySelectorAll('.item')){const ck=item.querySelector('input[data-check]');if(ck)exercises.set(ck.name,titleOf(item));}
    for(const rec of rows)for(const ex of rec.exercises||[])if(!exercises.has(ex.key))exercises.set(ex.key,ex.title);
    select.innerHTML=[...exercises].map(([key,title])=>`<option value="${safe(key)}">${safe(title)}</option>`).join('');
    if(exercises.has(old))select.value=old;
    renderExerciseChart();
    if(!rows.length){$('history-list').innerHTML='<p class="muted">Noch keine abgeschlossenen Trainingseinheiten vorhanden.</p>';return;}
    $('history-list').innerHTML=rows.slice(0,80).map(rec=>{
      const id=safe(rec.id),detail=(rec.exercises||[]).map(e=>`<tr><td>${safe(e.title)}</td><td>${e.done?'Erledigt':'Offen'}</td><td>${safe((e.reps||[]).join(' / '))}</td><td>${safe((e.weights||[]).join(' / '))}</td></tr>`).join('');
      return `<details class="history-entry"><summary><strong>${safe(rec.dayName)}</strong> · ${safe(rec.date)} · ${rec.finished||0}/${rec.total||0} Übungen ${rec.kind==='week'?'(Woche)':''}</summary><div class="history-scroll"><table><thead><tr><th>Übung</th><th>Status</th><th>Wdh. Sätze</th><th>Gewicht kg</th></tr></thead><tbody>${detail}</tbody></table></div><div class="history-actions"><button type="button" class="delete-entry" data-id="${id}">Eintrag löschen</button></div></details>`;
    }).join('');
    $('history-list').querySelectorAll('.delete-entry').forEach(b=>b.addEventListener('click',()=>{
      if(!confirm('Diesen archivierten Eintrag dauerhaft löschen?'))return;
      storeHistory(listHistory().filter(x=>x.id!==b.dataset.id));renderHistory();notify('Eintrag gelöscht.');
    }));
  }
  function downloadFile(payload,name){const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
  function downloadBackup(){
    if(!window.TrainingApp){notify('App noch nicht bereit.');return;}
    const payload={format:'training-full-backup',version:2,createdAt:new Date().toISOString(),snapshot:window.TrainingApp.getSnapshot(),history:listHistory(),calendarDays:JSON.parse(localStorage.getItem('training-calendar-days-v1')||'{}')};
    downloadFile(payload,'Trainingsplan_Sicherung_'+isoDay()+'.json');notify('Vollständige Sicherung heruntergeladen. Datei separat aufbewahren.');
  }
  async function importBackup(e){
    const file=e.target.files?.[0];e.target.value='';if(!file)return;
    if(file.size>15*1024*1024){notify('Sicherungsdatei ist zu groß (max. 15 MB).');return;}
    let payload;try{payload=JSON.parse(await file.text());}catch(_){notify('Datei ist kein gültiges JSON.');return;}
    if(payload?.format!=='training-full-backup'||payload.version!==2||!Array.isArray(payload.history)||!payload.snapshot?.checks||!payload.snapshot?.notes||!payload.snapshot?.results){notify('Keine gültige vollständige Trainingsplan-Sicherung.');return;}
    if(!confirm('Alle aktuellen Trainingsdaten und die Historie durch diese Sicherung ersetzen? Dieser Vorgang kann nicht rückgängig gemacht werden.'))return;
    try{
      // Validate before writing. Existing UI state remains until the user confirms.
      const history=payload.history.filter(r=>r&&typeof r==='object'&&typeof r.day==='string'&&Array.isArray(r.exercises));
      localStorage.setItem(HISTORY_KEY,JSON.stringify(history));
      if(payload.calendarDays&&typeof payload.calendarDays==='object'&&!Array.isArray(payload.calendarDays))localStorage.setItem('training-calendar-days-v1',JSON.stringify(payload.calendarDays));
      window.TrainingApp.applySnapshot(payload.snapshot);
      // Profile is also stored separately in the legacy app.
      if(payload.snapshot.profile)localStorage.setItem('training-profile-v1',JSON.stringify(payload.snapshot.profile));
      renderHistory();notify('Sicherung wiederhergestellt. Lade die App neu, damit der Kalender aktualisiert wird.');
    }catch(err){notify('Wiederherstellen fehlgeschlagen: '+err.message);}
  }
  // Main application's IndexedDB bootstrap is asynchronous; functions use its public hooks when ready.
  buildInterface();
  window.TrainingProgress={renderHistory,captureDay,listHistory};
})();
