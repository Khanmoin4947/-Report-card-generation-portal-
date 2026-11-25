const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formatNumber = n => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(4)));

function addSubject(name = '', marks = '', max = 100){
  const d = document.createElement('div');
  d.className = 'sub';
  d.innerHTML = `
    <input class="s-name" placeholder="Subject" value="${esc(name)}">
    <input class="s-marks" type="number" min="0" step="any" placeholder="0" value="${marks}">
    <input class="s-max" type="number" min="1" step="any" value="${max}">
    <button type="button" title="Remove subject" aria-label="Remove subject">×</button>`;
  d.querySelector('button').onclick = () => d.remove();
  $('subjects').appendChild(d);
}
['Mathematics','Physics','Chemistry','English','Computer Science'].forEach(n => addSubject(n));
$('add').onclick = () => addSubject();

function grade(p){
  if(p >= 90) return ['A+','Outstanding'];
  if(p >= 80) return ['A','Excellent'];
  if(p >= 70) return ['B+','Very good'];
  if(p >= 60) return ['B','Good'];
  if(p >= 50) return ['C','Average'];
  if(p >= 40) return ['D','Pass'];
  return ['F','Fail'];
}

function generate(){
  const err = $('err'); err.textContent = '';
  const v = id => $(id).value.trim();
  if(!v('college') || !v('branch') || !v('section') || !v('name') || !v('roll')){
    err.textContent = 'Enter college name, branch, section, student name and roll number.'; return;
  }
  const passPct = parseFloat($('pass').value);
  if(!Number.isFinite(passPct) || passPct < 0 || passPct > 100){
    err.textContent = 'Pass percentage must be between 0 and 100.'; return;
  }
  const subs = [];
  for(const row of document.querySelectorAll('#subjects .sub')){
    const name = row.querySelector('.s-name').value.trim();
    const m = row.querySelector('.s-marks').value;
    const max = parseFloat(row.querySelector('.s-max').value);
    if(!name && m === '') continue;
    if(!name || m === '' || !(max > 0)){ err.textContent = 'Every subject needs a name, marks and total marks.'; return; }
    const marks = parseFloat(m);
    if(!Number.isFinite(marks) || !Number.isFinite(max)){ err.textContent = 'Marks and out-of values must be valid numbers.'; return; }
    if(marks < 0 || marks > max){ err.textContent = `Marks for ${name} must be between 0 and ${max}.`; return; }
    subs.push({name, marks, max});
  }
  if(!subs.length){ err.textContent = 'Add at least one subject with marks.'; return; }

  let tot = 0, maxTot = 0, failed = 0;
  const rows = subs.map((s,i) => {
    const p = s.marks / s.max * 100;
    const [g] = grade(p);
    const ok = p >= passPct;
    if(!ok) failed++;
    tot += s.marks; maxTot += s.max;
    return `<tr><td>${i+1}</td><td>${esc(s.name)}</td><td>${formatNumber(s.marks)}</td><td>${formatNumber(s.max)}</td><td>${p.toFixed(1)}%</td><td>${g}</td><td class="${ok?'pass':'fail'}">${ok?'Pass':'Fail'}</td></tr>`;
  }).join('');

  const pct = tot / maxTot * 100;
  const [g, remark] = grade(pct);
  const result = failed ? 'FAIL' : 'PASS';

  $('preview').innerHTML = `
  <div class="card" id="card">
    <div class="head">
      <h1>${esc(v('college'))}</h1>
      <p>Department of ${esc(v('branch'))}</p>
      <div class="title">REPORT CARD${v('exam') ? ' — ' + esc(v('exam')) : ''}${v('year') ? ' (' + esc(v('year')) + ')' : ''}</div>
    </div>
    <div class="info">
      <div><b>Student name:</b> ${esc(v('name'))}</div>
      <div><b>Roll no.:</b> ${esc(v('roll'))}</div>
      <div><b>Branch:</b> ${esc(v('branch'))}</div>
      <div><b>Section:</b> ${esc(v('section'))}</div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Subject</th><th>Marks</th><th>Out of</th><th>Percent</th><th>Grade</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td colspan="2">Total</td><td>${formatNumber(tot)}</td><td>${formatNumber(maxTot)}</td><td colspan="3">${pct.toFixed(2)}%</td></tr></tfoot>
    </table>
    <div class="summary">
      <div><small>Percentage</small><strong>${pct.toFixed(2)}%</strong></div>
      <div><small>Overall grade</small><strong>${g}</strong></div>
      <div><small>Remark</small><strong style="font-size:15px">${remark}</strong></div>
      <div><small>Result</small><strong class="${failed?'fail':'pass'}">${result}</strong></div>
    </div>
    ${failed ? `<p class="fail" style="font-size:13px;margin:0">Failed in ${failed} subject(s) (pass mark ${passPct}%).</p>` : ''}
    <div class="sign"><span>Class teacher</span><span>Principal</span></div>
  </div>`;
  $('preview').scrollIntoView({behavior:'smooth', block:'start'});
}

$('gen').onclick = generate;
$('print').onclick = () => { generate(); if($('card')) window.print(); };
$('f').addEventListener('submit', event => {
  event.preventDefault();
  generate();
});