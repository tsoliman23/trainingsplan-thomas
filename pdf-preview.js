/* PDF-Vorschau ohne Online-Dienste. Auf iOS bei Bedarf separat in Dateien öffnen. */
(()=>{'use strict';
 let objectUrl=null,blob=null,name='Trainingsplan.pdf';
 const overlay=document.createElement('div');overlay.id='mytraining-pdf-viewer';overlay.hidden=true;
 overlay.innerHTML=`<section class="mt-viewer-panel" role="dialog" aria-modal="true" aria-labelledby="mt-viewer-title">
 <header class="mt-viewer-toolbar"><div class="mt-viewer-heading"><strong id="mt-viewer-title">PDF-Vorschau</strong><small id="mt-viewer-name"></small></div>
 <button type="button" id="mt-viewer-close" aria-label="Vorschau schließen">Schließen</button></header>
 <div class="mt-viewer-canvas"><iframe id="mt-viewer-frame" title="PDF-Dokument"></iframe></div>
 <footer class="mt-viewer-actions"><button type="button" id="mt-viewer-open">In neuem Tab öffnen</button><button type="button" id="mt-viewer-download">Herunterladen</button></footer>
 <p class="mt-viewer-help">Falls die PDF hier auf deinem iPhone nicht angezeigt wird, öffne sie über „In neuem Tab öffnen“ und wähle dort „In Dateien sichern“.</p>
 </section>`;
 document.body.appendChild(overlay);
 const frame=overlay.querySelector('#mt-viewer-frame');
 function close(){overlay.hidden=true;frame.removeAttribute('src');if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}blob=null;document.body.classList.remove('mt-modal-open');}
 function show(pdf,filename){if(!pdf)return;close();blob=pdf instanceof Blob?pdf:new Blob([pdf],{type:'application/pdf'});name=filename||'Trainingsplan.pdf';objectUrl=URL.createObjectURL(blob);overlay.querySelector('#mt-viewer-name').textContent=name;frame.src=objectUrl;overlay.hidden=false;document.body.classList.add('mt-modal-open');}
 function download(){if(!objectUrl)return;const a=document.createElement('a');a.href=objectUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();}
 overlay.querySelector('#mt-viewer-close').onclick=close;
 overlay.querySelector('#mt-viewer-download').onclick=download;
 overlay.querySelector('#mt-viewer-open').onclick=()=>{if(objectUrl)window.open(objectUrl,'_blank','noopener');};
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)close();});
 async function preview(){
   const button=document.getElementById('pdfPreview');button.disabled=true;button.textContent='Wird erstellt…';
   try{
    const pdf=window.TrainingCalendar?await window.TrainingCalendar.makeWeeklyPdf(()=>makeModernPdf({includeInfo:document.getElementById('pdfIncludeInfo').checked})):await makeModernPdf({includeInfo:document.getElementById('pdfIncludeInfo').checked});
    document.getElementById('pdfOptionsOverlay').hidden=true;
    const date=window.TrainingCalendar?.selectedDate?.()||new Date().toISOString().slice(0,10);
    show(pdf,`MyTraining_Trainingsbericht_${date}.pdf`);
   }catch(e){alert('Vorschau konnte nicht erstellt werden: '+e.message);}
   finally{button.disabled=false;button.textContent='Vorschau';}
 }
 document.getElementById('pdfPreview')?.addEventListener('click',preview);
 window.MyTrainingPDFPreview={show,close};
})();
