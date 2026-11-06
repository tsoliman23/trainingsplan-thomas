/* Offline PDF: exactly one A4 page per training day, with optional exercise details. */
async function makeModernPdf(options={}) {
  const includeInfo=!!options.includeInfo;
  const tr=s=>window.MyTrainingI18n?.t(s)||s;
  const locale=window.MyTrainingI18n?.current?.()||'de';
  const appProfile=JSON.parse(localStorage.getItem('training-profile-v1')||'{}');
  const W=595,H=842,S=2;
  const C={navy:'#132a5a',blue:'#2f5be8',deep:'#1f43b8',page:'#edf3ff',white:'#ffffff',ink:'#1a2740',muted:'#526786',pale:'#eaf1ff'};
  const greeting=document.getElementById('personalGreeting')?.textContent||'';
  const firstName=appProfile.firstName||greeting.replace(/^(Hallo|Hello|Bonjour|أهلاً يا)\s+/,'').replace(/!$/,'').trim()||'Training';
  const goal=document.getElementById('goalNumber')?.textContent||'–';
  const weight=document.getElementById('bodyWeight')?.value||'–';
  const all=[...document.querySelectorAll('input[data-check]')],done=all.filter(x=>x.checked).length;
  const date=new Date().toLocaleDateString(locale==='ar-EG'?'ar-EG':locale==='en'?'en-GB':locale==='fr'?'fr-FR':'de-DE');
  let logo=null;
  try{logo=new Image();logo.src='./icons/icon-192.png';await logo.decode();}catch(_){logo=null;}
  const pages=[];let canvas,ctx;
  function box(x,y,w,h,r,color){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=color;ctx.fill();}
  function text(v,x,y,size=10,color=C.ink,bold=false){ctx.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;ctx.fillStyle=color;ctx.fillText(String(v),x,y);}
  function lines(value,width,size=10,bold=false){
    ctx.font=`${bold?'700':'400'} ${size}px Arial, sans-serif`;
    const res=[];
    for(const para of String(value??'').split(/\r?\n/)){
      let curr='';
      for(const word of para.trim().split(/\s+/).filter(Boolean)){
        const next=curr?curr+' '+word:word;
        if(ctx.measureText(next).width<=width){curr=next;continue;}
        if(curr){res.push(curr);curr='';}
        // Long tokens must not overflow the card width.
        let left=word;
        while(left && ctx.measureText(left).width>width){
          let i=left.length-1;
          while(i>1&&ctx.measureText(left.slice(0,i)).width>width)i--;
          res.push(left.slice(0,i));left=left.slice(i);
        }
        curr=left;
      }
      if(curr)res.push(curr);
    }
    return res;
  }
  function pageSetup(day,idx){
    canvas=document.createElement('canvas');canvas.width=W*S;canvas.height=H*S;
    ctx=canvas.getContext('2d');ctx.scale(S,S);ctx.fillStyle=C.page;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=C.navy;ctx.fillRect(0,0,W,84);ctx.fillStyle=C.blue;ctx.fillRect(0,81,W,3);
    if(logo){box(28,16,49,49,10,C.white);ctx.drawImage(logo,32,20,41,41);}
    text(firstName.toLocaleUpperCase('de-DE'),90,30,11,'#cbd8fa',true);
    text('MYTRAINING',90,53,21,C.white,true);
    text(date,511,33,9,'#cbd8fa');
    text(`${tr(day)}  ·  ${idx}/3`,29,H-14,9,C.muted);
  }
  function savePage(){pages.push(canvas.toDataURL('image/jpeg',0.92).split(',')[1]);}
  function measured(item){
    const title=item.querySelector('label strong')?.textContent?.trim()||'';
    const description=item.querySelector('label small')?.textContent?.trim()||'';
    const checked=!!item.querySelector('input[data-check]')?.checked;
    const allFields=[...item.querySelectorAll('.exercise-values > .value-field')];
    const fields=allFields.map(field=>({label:field.querySelector('span')?.textContent?.trim()||'',value:field.querySelector('input')?.value||'–'}));
    const checkbox=item.querySelector('input[data-check]');
    if(checkbox && fields.length>=5){
      const key=checkbox.name,shared=item.querySelector('input[name="done_reps_'+key+'"]')?.value||'–';
      fields[1]={label:tr('Wdh.'),value:shared};
      for(let i=1;i<=3;i++){
        const reps=item.querySelector('input[name="reps_set'+i+'_'+key+'"]')?.value||shared;
        const kg=item.querySelector('input[name="weight_set'+i+'_'+key+'"]')?.value||'–';
        fields[i+1]={label:'S'+i+' '+tr('Wdh.')+'/kg',value:reps+'/'+kg};
      }
    }
    const titleLines=lines(title,390,10.4,true);
    const detailLines=includeInfo?lines(description,492,8.6):[];
    const valueLines=Math.ceil(fields.length/5);
    const h=Math.max(36,9+titleLines.length*13+detailLines.length*10.6+(valueLines?valueLines*22+2:0)+6);
    return{titleLines,detailLines,fields,checked,h};
  }
  function drawItem(d,n,y){
    // State is shown redundantly through words, color and a small symbol.
    // The exercise number is always visible and is never replaced by a check mark.
    box(27,y,541,d.h,8,d.checked?'#dce8ff':C.white);
    box(27,y,4,d.h,2,d.checked?C.blue:'#c8d5ee');
    box(38,y+8,26,22,6,d.checked?'#b9d0ff':C.pale);
    ctx.font='700 10px Arial, sans-serif';
    const num=String(n),numW=ctx.measureText(num).width;
    text(num,51-numW/2,y+23,10,C.deep,true);
    const badgeX=486,badgeW=69,badgeY=y+8;
    box(badgeX,badgeY,badgeW,21,6,d.checked?C.blue:'#eef2f9');
    if(d.checked){
      // Small tick kept fully within its own dedicated status badge.
      ctx.strokeStyle=C.white;ctx.lineWidth=1.6;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();ctx.moveTo(493,badgeY+11);ctx.lineTo(496,badgeY+14);ctx.lineTo(501,badgeY+8);ctx.stroke();
      text(tr('ERLEDIGT'),505,badgeY+14,7.1,C.white,true);
    }else{
      text(tr('OFFEN'),505,badgeY+14,8,C.muted,true);
    }
    let yy=y+19;
    for(const l of d.titleLines){text(l,74,yy,10.4,C.ink,true);yy+=13;}
    for(const l of d.detailLines){text(l,39,yy,8.6,C.muted);yy+=10.6;}
    if(d.fields.length){
      yy+=1;
      d.fields.forEach((f,i)=>{
        const col=i%5,row=Math.floor(i/5),x=39+col*104,by=yy+row*22;
        box(x,by-8,98,19,5,d.checked?'#c8daff':C.pale);
        text(f.label,x+4,by+4,7.2,C.muted,true);
        text(f.value,x+61,by+4,8,C.deep,true);
      });
    }
  }
  const days=[['montag','Montag'],['mittwoch','Mittwoch'],['freitag','Freitag']];
  for(let di=0;di<3;di++){
    const [id,day]=days[di],root=document.getElementById(id);if(!root)throw Error('Trainingstag fehlt: '+day);
    pageSetup(day,di+1);
    let y=94;
    if(di===0){
      const pct=all.length?Math.round(100*done/all.length):0;
      box(27,y,541,48,9,C.white);
      text(pct+'%',40,y+30,24,C.blue,true);
      text(locale==='en'?`${done} of ${all.length} exercises done`:locale==='fr'?`${done} exercices sur ${all.length} terminés`:locale==='ar-EG'?`${done} من ${all.length} تمرين خلصوا`:`${done} von ${all.length} Übungen erledigt`,104,y+21,10.6,C.ink,true);
      text(`${locale==='en'?'Weight':locale==='fr'?'Poids':locale==='ar-EG'?'الوزن':'Gewicht'}: ${weight} kg  ·  ${locale==='en'?'Target':locale==='fr'?'Objectif':locale==='ar-EG'?'الهدف':'Ziel'}: ${goal} kg`,104,y+35,9.3,C.muted);
      y+=56;
    }
    const items=[...root.querySelectorAll('.item')].filter(x=>x.querySelector('label strong'));
    const data=items.map(measured), completed=items.filter(x=>x.querySelector('input[data-check]')?.checked).length;
    const subtitle=root.querySelector('.subtitle')?.textContent?.trim()||'';
    const notes=root.querySelector('textarea[name]')?.value?.trim()||'';
    const noteLines=notes?lines(notes,502,8.9):[];
    const dayHeaderH=45, gap=5, noteH=noteLines.length?26+noteLines.length*11:0;
    const total=dayHeaderH+8+data.reduce((sum,d)=>sum+d.h+gap,0)+noteH+(noteH?7:0);
    const available=H-28-y;
    const scale=Math.min(1,available/total);
    // Entire training day is kept together. Scale content if own exercises or extensive notes require it.
    ctx.save();ctx.translate(0,y);ctx.scale(1,scale);
    let yy=0;
    box(27,yy,541,dayHeaderH,9,C.blue);
    text(tr(day).toLocaleUpperCase(locale),42,yy+22,18,C.white,true);
    text(`${completed}/${items.length} ${tr('ERLEDIGT')}`,471,yy+19,9.8,C.white,true);
    for(const [i,l] of lines(subtitle,490,8.9).slice(0,1).entries())text(l,42,yy+36+i*10,8.9,'#ebf2ff');
    yy+=dayHeaderH+8;
    data.forEach((d,i)=>{drawItem(d,i+1,yy);yy+=d.h+gap;});
    if(noteLines.length){box(27,yy,541,noteH,8,C.white);text(tr('TRAININGSNOTIZEN'),40,yy+15,10,C.deep,true);noteLines.forEach((l,i)=>text(l,40,yy+28+i*11,8.9,C.ink));}
    ctx.restore();
    savePage();
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
