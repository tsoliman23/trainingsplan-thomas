/* Moderner Offline-PDF-Export fuer trainingsplan-thomas.
   Als eigene Datei im Projektverzeichnis speichern. */
async function makeModernPdf() {
  const W = 595, H = 842, SCALE = 2;
  const COLORS = {
    dark: '#12275a', blue: '#2f5be8', blue2: '#1f43b8',
    light: '#edf3ff', page: '#eaf1ff', white: '#ffffff',
    text: '#1a2740', muted: '#5b6d8c', green: '#2f8c67', border: '#d7e2f5'
  };
  const days = [['montag', 'Montag'], ['mittwoch', 'Mittwoch'], ['freitag', 'Freitag']];
  const allChecks = [...document.querySelectorAll('input[data-check]')];
  const completed = allChecks.filter(e => e.checked).length;
  const percent = allChecks.length ? Math.round(completed / allChecks.length * 100) : 0;
  const date = new Date().toLocaleDateString('de-DE');
  const weight = document.getElementById('bodyWeight')?.value || '-';
  let logo = null;
  try {
    logo = new Image();
    logo.src = './icons/icon-192.png';
    await logo.decode();
  } catch (_) { logo = null; }

  let canvas, ctx, y;
  const pages = [];
  function rounded(x, top, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.roundRect(x, top, w, h, r); ctx.fill();
  }
  function write(s, x, top, size = 11, color = COLORS.text, bold = false) {
    ctx.fillStyle = color;
    ctx.font = `${bold ? '700' : '400'} ${size}px Arial, sans-serif`;
    ctx.fillText(String(s), x, top);
  }
  function wrap(s, maxWidth, size = 11, bold = false) {
    ctx.font = `${bold ? '700' : '400'} ${size}px Arial, sans-serif`;
    const lines = [];
    for (const paragraph of String(s ?? '').split(/\r?\n/)) {
      let line = '';
      for (const word of paragraph.split(/\s+/)) {
        if (!word) continue;
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width <= maxWidth) line = test;
        else {
          if (line) lines.push(line);
          line = word;
          while (ctx.measureText(line).width > maxWidth && line.length > 1) {
            let n = line.length - 1;
            while (n > 1 && ctx.measureText(line.slice(0, n)).width > maxWidth) n--;
            lines.push(line.slice(0, n)); line = line.slice(n);
          }
        }
      }
      lines.push(line);
    }
    return lines;
  }
  function newPage(section = 'TRAININGSREPORT') {
    if (canvas) pages.push(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);
    canvas = document.createElement('canvas'); canvas.width = W * SCALE; canvas.height = H * SCALE;
    ctx = canvas.getContext('2d'); ctx.scale(SCALE, SCALE);
    ctx.fillStyle = COLORS.page; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = COLORS.dark; ctx.fillRect(0, 0, W, 154);
    ctx.fillStyle = COLORS.blue; ctx.fillRect(0, 148, W, 6);
    rounded(35, 24, 54, 54, 15, '#ffffff');
    if (logo) ctx.drawImage(logo, 40, 29, 44, 44);
    else write('T', 51, 61, 28, COLORS.blue, true);
    write('THOMAS', 105, 43, 13, '#c3d4ff', true);
    write('TRAININGSPLAN', 104, 70, 23, COLORS.white, true);
    write(section, 36, 113, 11, '#d8e4ff', true);
    write(date, 535, 113, 10, '#d8e4ff', false);
    ctx.textAlign = 'left'; y = 177;
  }
  function ensure(h, title) { if (y + h > 782) newPage(title || 'FORTSETZUNG'); }
  function summary() {
    ensure(118, 'WOCHENUEBERSICHT');
    rounded(30, y, 535, 101, 16, COLORS.white);
    write('DEINE WOCHE IM UEBERBLICK', 47, y + 25, 11, COLORS.muted, true);
    write(`${percent}%`, 48, y + 67, 32, COLORS.blue, true);
    write(`${completed} von ${allChecks.length} Aufgaben abgeschlossen`, 154, y + 52, 12, COLORS.text, true);
    write(`Koerpergewicht: ${weight} kg  |  Ziel: 80 kg`, 154, y + 72, 10, COLORS.muted);
    rounded(154, y + 82, 386, 6, 3, COLORS.light);
    if (percent) rounded(154, y + 82, 386 * percent / 100, 6, 3, COLORS.blue);
    y += 118;
  }
  function heading(name, subtitle, done, count) {
    ensure(94, name.toUpperCase());
    rounded(30, y, 535, 78, 15, COLORS.blue);
    write(name.toUpperCase(), 48, y + 32, 21, COLORS.white, true);
    write(`${done} / ${count} erledigt`, 450, y + 29, 11, COLORS.white, true);
    for (const [i, line] of wrap(subtitle, 470, 10).slice(0, 2).entries())
      write(line, 48, y + 51 + i * 13, 10, '#e8efff');
    y += 94;
  }
  function exercise(item, number) {
    const name = item.querySelector('label strong')?.textContent?.trim();
    if (!name) return;
    const checked = !!item.querySelector('input[data-check]')?.checked;
    const description = item.querySelector('label small')?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const fields = [...item.querySelectorAll('input[data-result]')].map(input => {
      const label = input.closest('.value-field')?.querySelector('span')?.textContent?.trim() || 'Wert';
      return { label, value: input.value || '-' };
    });
    const titleLines = wrap(name, 443, 13, true);
    const detailLines = wrap(description, 472, 10);
    const valRows = Math.ceil(fields.length / 5);
    const height = 27 + titleLines.length * 18 + detailLines.length * 14 + (valRows ? valRows * 38 + 8 : 0) + 14;
    ensure(height + 11, 'TRAININGSPLAN - FORTSETZUNG');
    rounded(30, y, 535, height, 14, COLORS.white);
    rounded(43, y + 16, 31, 27, 9, checked ? '#e6f6ee' : COLORS.light);
    write(checked ? 'OK' : String(number), checked ? 49 : 53, y + 34, 10, checked ? COLORS.green : COLORS.blue, true);
    let t = y + 29;
    for (const line of titleLines) { write(line, 85, t, 13, COLORS.text, true); t += 18; }
    t += 1;
    for (const line of detailLines) { write(line, 47, t, 10, COLORS.muted); t += 14; }
    if (fields.length) {
      t += 12;
      fields.forEach((f, i) => {
        const col = i % 5, row = Math.floor(i / 5), x = 47 + col * 100, yy = t + row * 38;
        rounded(x, yy - 10, 91, 33, 7, COLORS.light);
        write(f.label, x + 7, yy + 2, 8, COLORS.muted, true);
        write(f.value, x + 7, yy + 16, 11, COLORS.blue2, true);
      });
    }
    y += height + 11;
  }
  function notes(text) {
    const lines = wrap(text || 'Keine Notizen', 480, 11);
    const h = 46 + lines.length * 16;
    ensure(h + 13, 'TRAININGSNOTIZEN');
    rounded(30, y, 535, h, 14, COLORS.white);
    write('TRAININGSNOTIZEN', 47, y + 25, 12, COLORS.blue2, true);
    lines.forEach((line, i) => write(line, 47, y + 48 + i * 16, 11, COLORS.text));
    y += h + 13;
  }
  newPage('PERSOENLICHER WOCHENREPORT');
  summary();
  for (const [id, name] of days) {
    const root = document.getElementById(id);
    if (!root) continue;
    const items = [...root.querySelectorAll('.item')].filter(i => i.querySelector('label strong'));
    const done = items.filter(i => i.querySelector('input[data-check]')?.checked).length;
    heading(name, root.querySelector('.subtitle')?.textContent?.trim() || '', done, items.length);
    items.forEach((item, i) => exercise(item, i + 1));
    notes(root.querySelector('textarea[name]')?.value || '');
  }
  pages.push(canvas.toDataURL('image/jpeg', 0.88).split(',')[1]);

  // JPEG-Seiten zu einer vollstaendig lokalen, gueltigen PDF zusammenbauen.
  function fromBase64(b64) {
    const s = atob(b64), out = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
    return out;
  }
  const enc = new TextEncoder(), chunks = [], offsets = [0];
  let offset = 0;
  function append(data) { const b = typeof data === 'string' ? enc.encode(data) : data; chunks.push(b); offset += b.length; }
  function object(id, content) { offsets[id] = offset; append(`${id} 0 obj\n${content}\nendobj\n`); }
  const n = pages.length, rootId = 1, pagesId = 2;
  append('%PDF-1.4\n');
  object(rootId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  const kids = Array.from({length:n}, (_,i) => `${3+i*3} 0 R`).join(' ');
  object(pagesId, `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  for (let i = 0; i < n; i++) {
    const pageId = 3+i*3, imgId = pageId+1, streamId=pageId+2;
    object(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${imgId} 0 R >> >> /Contents ${streamId} 0 R >>`);
    const jpeg = fromBase64(pages[i]);
    offsets[imgId] = offset;
    append(`${imgId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${W*SCALE} /Height ${H*SCALE} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
    append(jpeg); append('\nendstream\nendobj\n');
    const content = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q\n`;
    object(streamId, `<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
  }
  const xref = offset, size = 3 + n*3;
  append(`xref\n0 ${size}\n0000000000 65535 f \n`);
  for(let i=1;i<size;i++) append(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
  append(`trailer\n<< /Size ${size} /Root ${rootId} 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, {type:'application/pdf'});
}
