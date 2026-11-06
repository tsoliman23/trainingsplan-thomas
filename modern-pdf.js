/* Kompakter, vollständig offlinefähiger PDF-Export mit dynamischer Höhenberechnung.
   Drei Trainingstage = regulär maximal drei Seiten. Sehr viele eigene Übungen
   können zusätzliche Seiten erfordern, damit nichts abgeschnitten wird. */
async function makeModernPdf() {
  'use strict';
  const W=595,H=842,S=2;
  const C={navy:'#132a5a',blue:'#2f5be8',deep:'#1f43b8',page:'#edf3ff',white:'#ffffff',ink:'#1a2740',muted:'#526786',pale:'#eaf1ff',line:'#dce7fa'};
  const firstName=(document.getElementById('personalGreeting')?.textContent||'').replace(/^Hallo\s+/,'').replace(/!$/,'').trim() || 'Training';
  const goal=document.getElementById('profileGoal')?.value || document.getElementById('goalNumber')?.textContent || '–';
  const weight=document.getElementById('bodyWeight')?.value || '–';
  const all=[...document.querySelectorAll('input[data-check]')];
  const done=all.filter(c=>c.checked).length;
  const date=new Date().toLocaleDateString('de-DE');
  let logo=null;
  try {logo=new Image();logo.src='./icons/icon-192.png';await logo.decode();}catch(_){logo=null;}
  const pages=[];
  let canvas,ctx;
  function box(x,y,w,h,r,color){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();}
  function font(size,bold=false){ctx.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;}
  function text(v,x,y,size=10,color=C.ink,bold=false){font(size,bold);ctx.fillStyle=color;ctx.fillText(String(v),x,y);}
  function lines(value,width,size=10,bold=false){
    font(size,bold);const out=[];
    for(const paragraph of String(value??'').split(/\r?\n/)){
      let current='';
      for(const word of paragraph.trim().split(/\s+/).filter(Boolean)){
        const next=current?current+' '+word:word;
        if(ctx.measureText(next).width<=width)current=next;
        else {if(current)out.push(current);current=word;
          while(ctx.measureText(current).width>width && current.length>1){
            let n=current.length-1;
            while(n>1&&ctx.measureText(current.slice(0,n)).width>width)n--;
            out.push(current.slice(0,n));current=current.slice(n);
          }
        }
      }
      if(current)out.push(current);
    }
    return out;
  }
  function startPage(day,pageNo,first){
    canvas=document.createElement('canvas');canvas.width=W*S;canvas.height=H*S;
    ctx=canvas.getContext('2d');ctx.scale(S,S);
    ctx.fillStyle=C.page;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=C.navy;ctx.fillRect(0,0,W,first?115:83);
    ctx.fillStyle=C.blue;ctx.fillRect(0,first?111:79,W,4);
    if(logo){box(29,19,50,50,12,C.white);ctx.drawImage(logo,33,23,42,42);}
    else {box(29,19,50,50,12,C.white);text('T',45,52,25,C.blue,true);}
    text(firstName.toUpperCase(),93,35,12,'#cbd8fa',true);
    text('TRAININGSPLAN',93,58,21,C.white,true);
    text(first?'DEIN WOCHENREPORT':'TRAININGSÜBERSICHT',W-174,first?34:43,10,'#cbd8fa',true);
    text(date,W-89,first?54:59,9,'#dce7ff');
    if(first){text('Kompakt · Montag, Mittwoch und Freitag',29,96,10,'#dce7ff');}
    text(`${day}  ·  Seite ${pageNo}`,32,H-18,9,C.muted);
  }
  function savePage(){pages.push(canvas.toDataURL('image/jpeg',0.91).split(',')[1]);}
  function summary(y){
    box(28,y,539,65,12,C.white);
    const pct=all.length?Math.round(done/all.length*100):0;
    text(`${pct}%`,43,y+36,25,C.blue,true);
    text(`${done} von ${all.length} Übungen erledigt`,110,y+24,11,C.ink,true);
    text(`Aktuell: ${weight} kg    ·    Ziel: ${String(goal).replace('.',',')} kg`,110,y+41,10,C.muted);
    box(110,y+48,423,6,3,C.pale);
    if(pct)box(110,y+48,423*pct/100,6,3,C.blue);
    return y+77;
  }
  function dayBar(y,name,sub,done,count){
    box(28,y,539,57,11,C.blue);
    text(name.toUpperCase(),43,y+24,18,C.white,true);
    text(`${done}/${count} erledigt`,461,y+22,10,C.white,true);
    lines(sub,488,9).slice(0,2).forEach((l,i)=>text(l,43,y+41+i*11,9,'#e9f1ff'));
    return y+68;
  }
  function measureItem(item){
    const name=item.querySelector('label strong')?.textContent?.trim()||'';
    const checked=!!item.querySelector('input[data-check]')?.checked;
    const detail=item.querySelector('label small')?.textContent?.replace(/\s+/g,' ').trim()||'';
    const fields=[...item.querySelectorAll('input[data-result]')].map(el=>({label:el.closest('.value-field')?.querySelector('span')?.textContent?.trim()||'Wert',value:el.value||'–'}));
    const titleLines=lines(name,470,11.4,true);
    const detailLines=lines(detail,489,9.2);
    const dataHeight=fields.length ? Math.ceil(fields.length/5)*21+2:0;
    const height=Math.max(36,10+titleLines.length*14+detailLines.length*11+dataHeight+5);
    return {name,checked,fields,titleLines,detailLines,height};
  }
  function drawItem(d,num,y){
    box(28,y,539,d.height,11,C.white);
    box(39,y+11,25,23,7,C.pale);
    if(d.checked){
      // Blaues Häkchen mit klaren, runden Linien; unabhängig von Schriftglyphen.
      ctx.strokeStyle=C.blue;ctx.lineWidth=2.8;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(45,y+22);ctx.lineTo(50,y+27);ctx.lineTo(59,y+17);ctx.stroke();
    }else{text(String(num),47,y+27,10,C.deep,true);}
    let yy=y+19;
    d.titleLines.forEach(l=>{text(l,71,yy,11.4,C.ink,true);yy+=14;});
    d.detailLines.forEach(l=>{text(l,42,yy,9.2,C.muted);yy+=11;});
    if(d.fields.length){
      yy+=3;
      d.fields.forEach((f,i)=>{
        let col=i%5,row=Math.floor(i/5),x=42+col*101,by=yy+row*21;
        box(x,by-8,94,19,5,C.pale);
        text(f.label,x+4,by+4,7.8,C.muted,true);
        text(f.value,x+53,by+4,9,C.deep,true);
      });
    }
  }
  function notesBlock(y,content){
    if(!content||!content.trim())return y;
    const noteLines=lines(content.trim(),501,9.4);
    const h=26+noteLines.length*13;
    box(28,y,539,h,11,C.white);
    text('TRAININGSNOTIZEN',42,y+17,10,C.deep,true);
    noteLines.forEach((l,i)=>text(l,42,y+32+i*13,9.4,C.ink));
    return y+h+8;
  }
  const days=[['montag','Montag'],['mittwoch','Mittwoch'],['freitag','Freitag']];
  for(const [di,[id,name]] of days.entries()){
    const root=document.getElementById(id);if(!root)continue;
    let items=[...root.querySelectorAll('.item')].filter(el=>el.querySelector('label strong'));
    let measured=items.map(measureItem);
    let dayDone=items.filter(el=>el.querySelector('input[data-check]')?.checked).length;
    const note=root.querySelector('textarea[name]')?.value||'';
    // Jeder reguläre Trainingstag erhält eine eigene Seite. Bei einer ungewöhnlich
    // großen Zahl eigener Übungen entstehen zur Wahrung der Lesbarkeit Folgeseiten.
    let index=0,continuation=0;
    do {
      const first=di===0 && continuation===0;
      startPage(name+(continuation?' (Fortsetzung)':''),pages.length+1,first);
      let y=first?128:99;
      if(first)y=summary(y);
      y=dayBar(y,name,root.querySelector('.subtitle')?.textContent?.trim()||'',dayDone,items.length);
      const available=H-43-y;
      let end=index, used=0;
      // Für reguläre 8-9 Übungen passend auf genau eine Seite skalieren.
      // Bei zu vielen Übungen wird nicht unlesbar klein skaliert, sondern umgebrochen.
      while(end<measured.length){
        const next=measured[end].height+7;
        if(used+next>available/0.78 && end>index)break;
        used+=next;end++;
      }
      const lastPart=end>=measured.length;
      const noteLines=lastPart && note.trim()?lines(note.trim(),501,9.4):[];
      const noteHeight=noteLines.length?34+noteLines.length*13:0;
      let sc=Math.min(1,(available-noteHeight)/Math.max(used,1));
      // Sehr lange Notizen werden auf eigener Seite gedruckt statt abgeschnitten.
      if(sc<0.78 && lastPart && noteLines.length){sc=Math.min(1,available/Math.max(used,1));}
      if(sc<0.78){ // reduziert Übungsanzahl bei vielen benutzerdefinierten Einträgen
        while(end>index+1 && used>available/0.78){end--;used-=measured[end].height+7;}
        sc=Math.min(1,available/Math.max(used,1));
      }
      const isLast=end>=measured.length;
      ctx.save();ctx.translate(0,y);ctx.scale(1,sc);
      let local=0;
      for(let i=index;i<end;i++){drawItem(measured[i],i+1,local);local+=measured[i].height+7;}
      ctx.restore();
      y+=local*sc;
      if(isLast && note.trim()){
        const noteH=26+lines(note.trim(),501,9.4).length*13+8;
        if(y+noteH<=H-37)notesBlock(y,note);
        else {savePage();startPage(name+' · Notizen',pages.length+1,false);notesBlock(104,note);savePage();index=end;continuation++;continue;}
      }
      savePage();index=end;continuation++;
    }while(index<measured.length);
  }
  function decode(b64){const binary=atob(b64);const arr=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)arr[i]=binary.charCodeAt(i);return arr;}
  const enc=new TextEncoder(),chunks=[],offsets=[0];let pos=0;
  function append(x){const bytes=typeof x==='string'?enc.encode(x):x;chunks.push(bytes);pos+=bytes.length;}
  function obj(id,str){offsets[id]=pos;append(`${id} 0 obj\n${str}\nendobj\n`);}
  append('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
  const count=pages.length,kids=Array.from({length:count},(_,i)=>`${3+i*3} 0 R`).join(' ');
  obj(2,`<< /Type /Pages /Kids [${kids}] /Count ${count} >>`);
  for(let i=0;i<count;i++){
    const page=3+i*3,img=page+1,stream=page+2;
    obj(page,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${img} 0 R >> >> /Contents ${stream} 0 R >>`);
    const b=decode(pages[i]);offsets[img]=pos;
    append(`${img} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W*S} /Height ${H*S} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${b.length} >>\nstream\n`);
    append(b);append('\nendstream\nendobj\n');
    const body=`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q\n`;
    obj(stream,`<< /Length ${enc.encode(body).length} >>\nstream\n${body}endstream`);
  }
  const xref=pos,total=3+count*3;append(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for(let i=1;i<total;i++)append(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  append(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks,{type:'application/pdf'});
}
