/* PDF-Vorschau ohne Online-Dienste. Auf iOS bei Bedarf separat in Dateien öffnen. */
(()=>{'use strict';
 let objectUrl=null,blob=null,name='Trainingsplan.pdf',zoom=100;
 const overlay=document.createElement('div');overlay.id='mytraining-pdf-viewer';overlay.hidden=true;
 overlay.innerHTML=`<section class="mt-viewer-panel" role="dialog" aria-modal="true" aria-labelledby="mt-viewer-title">
 <header class="mt-viewer-toolbar"><div class="mt-viewer-heading"><strong id="mt-viewer-title">PDF-Vorschau</strong><small id="mt-viewer-name"></small></div>
 <div class="mt-viewer-toolbar-actions"><div class="mt-viewer-zoom-controls" aria-label="Zoomsteuerung"><button type="button" id="mt-viewer-zoom-out" aria-label="Verkleinern">−</button><span id="mt-viewer-zoom-label">100%</span><button type="button" id="mt-viewer-zoom-in" aria-label="Vergrößern">+</button></div><button type="button" id="mt-viewer-close" aria-label="Vorschau schließen">Schließen</button></div></header>
 <div class="mt-viewer-canvas"><div class="mt-viewer-scroll" id="mt-viewer-scroll"><div class="mt-viewer-document" id="mt-viewer-document"><iframe id="mt-viewer-frame" title="PDF-Dokument"></iframe></div></div></div>
 <footer class="mt-viewer-actions"><button type="button" id="mt-viewer-open">In neuem Tab öffnen</button><button type="button" id="mt-viewer-download">Herunterladen</button></footer>
 <p class="mt-viewer-help">Zoome direkt in der Vorschau nur das Dokument. Falls die PDF hier auf deinem iPhone nicht angezeigt wird, öffne sie über „In neuem Tab öffnen“ und wähle dort „In Dateien sichern“.</p>
 </section>`;
 document.body.appendChild(overlay);
 const frame=overlay.querySelector('#mt-viewer-frame');
 const docBox=overlay.querySelector('#mt-viewer-document');
 const zoomLabel=overlay.querySelector('#mt-viewer-zoom-label');
 function displayName(filename){
   const raw=String(filename||'Trainingsplan.pdf');
   const match=raw.match(/(\d{4}-\d{2}-\d{2})/);
   return match?`Trainingsbericht · ${match[1]}`:raw;
 }
 function applyZoom(nextZoom){
   // Fixed 10% increments; 100% represents the original embedded PDF size.
   zoom=Math.max(50,Math.min(150,Math.round(nextZoom/10)*10));
   const scale=zoom/100;
   const scroll=overlay.querySelector('#mt-viewer-scroll');
   const oldLeft=scroll.scrollLeft,oldTop=scroll.scrollTop;
   // Keep the PDF renderer's base viewport constant and scale only its visual output.
   // Do not use min-width:100%, as it prevents zooming out below 100%.
   docBox.style.width=`${zoom}%`;
   docBox.style.height=`${zoom}%`;
   frame.style.width=`${100/scale}%`;
   frame.style.height=`${100/scale}%`;
   frame.style.transform=`scale(${scale})`;
   zoomLabel.textContent=`${zoom}%`;
   overlay.querySelector('#mt-viewer-zoom-out').disabled=zoom===50;
   overlay.querySelector('#mt-viewer-zoom-in').disabled=zoom===150;
   scroll.scrollLeft=oldLeft;
   scroll.scrollTop=oldTop;
 }
 function close(){overlay.hidden=true;frame.removeAttribute('src');if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}blob=null;zoom=100;applyZoom(100);document.body.classList.remove('mt-modal-open');}
 function show(pdf,filename){if(!pdf)return;close();blob=pdf instanceof Blob?pdf:new Blob([pdf],{type:'application/pdf'});name=filename||'Trainingsplan.pdf';objectUrl=URL.createObjectURL(blob);overlay.querySelector('#mt-viewer-name').textContent=displayName(name);frame.src=objectUrl+'#view=FitH';applyZoom(100);overlay.hidden=false;document.body.classList.add('mt-modal-open');}
 function download(){if(!objectUrl)return;const a=document.createElement('a');a.href=objectUrl;a.download=name;document.body.appendChild(a);a.click();a.remove();}
 overlay.querySelector('#mt-viewer-close').onclick=close;
 overlay.querySelector('#mt-viewer-download').onclick=download;
 overlay.querySelector('#mt-viewer-open').onclick=()=>{if(objectUrl)window.open(objectUrl,'_blank','noopener');};
 overlay.querySelector('#mt-viewer-zoom-in').onclick=()=>applyZoom(zoom+10);
 overlay.querySelector('#mt-viewer-zoom-out').onclick=()=>applyZoom(zoom-10);
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
