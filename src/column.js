// Ciorna „unul sub altul”: calcul în coloană ca în caiet, cu rândul pentru „ține minte” / împrumut
// și ghid pas cu pas (adunare, scădere, înmulțire cu una sau două cifre).
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let root = null, C = null, onHelp = () => {};

export function initColumn(el, help) { root = el; if (help) onHelp = help; }
export function resetColumn() { C = null; }

// caută „a op b” în textul exercițiului
export function exprFrom(text) {
  const m = String(text || '').replace(/(\d)\.(\d{3})/g, '$1$2').match(/(\d{1,5})\s*([+−\-×x*])\s*(\d{1,4})(?!\s*[×:])/);
  if (!m) return null;
  const op = { '-': '−', x: '×', '*': '×' }[m[2]] || m[2];
  return { a: m[1], op, b: m[3] };
}

export function showColumn(pref) {
  const e = pref || { a: '', op: '+', b: '' }; C = null;
  root.innerHTML = `<div class="col-set">
      <input id="cA" inputmode="numeric" maxlength="5" value="${esc(e.a)}" aria-label="Primul număr">
      <span class="col-ops">${['+', '−', '×'].map((o) => `<button type="button" class="tool ${o === e.op ? 'on' : ''}" data-op="${o}">${o}</button>`).join('')}</span>
      <input id="cB" inputmode="numeric" maxlength="4" value="${esc(e.b)}" aria-label="Al doilea număr">
      <button class="tool" type="button" id="cPut">Așază</button></div>
    <div id="cGrid" class="col-grid"></div>
    <div class="col-bar"><button class="tool" type="button" id="cStep">Arată-mi pas cu pas</button><button class="tool" type="button" id="cReset">Șterge cifrele</button></div>
    <div id="cMsg" class="col-msg">Scrie rezultatul de la <b>dreapta</b> la stânga. Rândul mic de sus e pentru „ține minte” și pentru împrumut. Apasă pe o cifră ca s-o tai.</div>`;
  let op = e.op;
  root.querySelectorAll('[data-op]').forEach((b) => b.onclick = () => { op = b.dataset.op; root.querySelectorAll('[data-op]').forEach((x) => x.classList.toggle('on', x === b)); });
  const put = () => {
    const a = root.querySelector('#cA').value.replace(/\D/g, ''), b = root.querySelector('#cB').value.replace(/\D/g, '');
    if (!a || !b) { msg('Scrie amândouă numerele.'); return; }
    if (op === '−' && +b > +a) { msg('La scădere, numărul mare stă sus. Schimbă-le între ele.'); return; }
    build(a, op, b);
  };
  root.querySelector('#cPut').onclick = put;
  root.querySelector('#cStep').onclick = step;
  root.querySelector('#cReset').onclick = () => C && build(C.a, C.op, C.b);
  if (e.a && e.b) put();
}

function msg(h) { const el = root.querySelector('#cMsg'); if (el) el.innerHTML = h; }

/* grila: coloane de cifre; rânduri: ține minte, A, B (cu semn), [rânduri parțiale], rezultat */
function build(a, op, b) {
  const partial = op === '×' && b.length > 1;
  const res = op === '+' ? String(+a + +b) : op === '−' ? String(+a - +b) : String(+a * +b);
  const W = Math.max(a.length, b.length, res.length) + 0; // coloane de cifre
  C = { a, op, b, W, res, partial, k: 0, steps: plan(a, op, b, W) };
  const rows = [];
  const cells = (cls, n, val = () => '', ro = false, attrs = () => '') => Array.from({ length: W }, (_, i) => {
    const v = val(i); return ro ? `<span class="cc ${cls} ${v === '' ? 'empty' : ''}" ${attrs(i)}>${v}</span>` : `<input class="cc ${cls}" maxlength="1" inputmode="numeric" data-r="${n}" data-c="${i}" value="${v}">`;
  }).join('');
  const digitAt = (s, i) => { const k = i - (W - s.length); return k >= 0 ? s[k] : ''; };
  rows.push(`<span class="cs"></span>${cells('carry', 'carry')}`);
  rows.push(`<span class="cs"></span>${cells('dig', 'a', (i) => digitAt(a, i), true, (i) => digitAt(a, i) !== '' ? `data-x="${i}"` : '')}`);
  rows.push(`<span class="cs">${op}</span>${cells('dig', 'b', (i) => digitAt(b, i), true, (i) => digitAt(b, i) !== '' ? `data-x="b${i}"` : '')}`);
  rows.push(`<span class="cs"></span><span class="cline" style="grid-column:span ${W}"></span>`);
  if (partial) {
    [...b].reverse().forEach((_, j) => rows.push(`<span class="cs">${j === b.length - 1 ? '+' : ''}</span>${cells('res', 'p' + j)}`));
    rows.push(`<span class="cs"></span><span class="cline" style="grid-column:span ${W}"></span>`);
  }
  rows.push(`<span class="cs">=</span>${cells('res', 'r')}`);
  const g = root.querySelector('#cGrid');
  g.style.gridTemplateColumns = `28px repeat(${W}, var(--cw))`;
  g.innerHTML = rows.join('');
  // tai o cifră (împrumut) cu un tap
  g.querySelectorAll('[data-x]').forEach((s) => s.onclick = () => s.classList.toggle('crossed'));
  // scrii o cifră → treci la coloana din stânga (la ține minte: rămâi)
  g.querySelectorAll('input.cc').forEach((inp) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(-1);
      if (inp.value && !inp.classList.contains('carry')) { const prev = g.querySelector(`input[data-r="${inp.dataset.r}"][data-c="${+inp.dataset.c - 1}"]`); if (prev) prev.focus(); }
    });
  });
  msg(op === '−' ? 'Începi cu unitățile (dreapta). Dacă cifra de sus e mai mică, împrumuți 1 de la vecin: taie-l și scrie deasupra cu 1 mai puțin.'
    : op === '×' ? 'Înmulțești fiecare cifră de sus cu cifra de jos, de la dreapta. Ce trece de 9 „ții minte” deasupra coloanei următoare.'
      : 'Aduni pe coloane, de la dreapta. Dacă iese 10 sau mai mult, scrii unitățile și „ții minte” 1 deasupra coloanei următoare.');
  const last = g.querySelector(`input[data-r="${partial ? 'p0' : 'r'}"][data-c="${W - 1}"]`); if (last) last.focus({ preventScroll: true });
}

/* pașii explicați: fiecare pas scrie în anumite celule */
export function plan(a, op, b, W) {
  const A = [...a].reverse().map(Number), B = [...b].reverse().map(Number), S = [];
  const col = (j) => W - 1 - j; // j = 0 unități
  const NAMES = ['unităților', 'zecilor', 'sutelor', 'miilor', 'zecilor de mii'];
  if (op === '+') {
    let c = 0;
    for (let j = 0; j < Math.max(A.length, B.length); j++) {
      const x = A[j] || 0, y = B[j] || 0, s = x + y + c, w = [];
      w.push(['r', col(j), s % 10]);
      if (s >= 10) w.push(['carry', col(j + 1), 1]);
      S.push({ t: `Coloana ${NAMES[j] || ''}: ${x} + ${y}${c ? ' + 1 (ținut minte)' : ''} = <b>${s}</b>. ${s >= 10 ? `Scrii <b>${s % 10}</b> și ții minte <b>1</b> deasupra coloanei din stânga.` : `Scrii <b>${s}</b>.`}`, w });
      c = s >= 10 ? 1 : 0;
    }
    if (c) S.push({ t: 'Ți-a rămas 1 ținut minte: îl scrii în față.', w: [['r', col(Math.max(A.length, B.length)), 1]] });
  } else if (op === '−') {
    let br = 0;
    for (let j = 0; j < A.length; j++) {
      const x0 = A[j], y = B[j] || 0; let x = x0 - br, w = [], t = `Coloana ${NAMES[j] || ''}: `;
      if (br) { w.push(['carry', col(j), x < 0 ? 9 : x], ['cross', col(j)]); t += `cifra ${x0} a dat 1 vecinului din dreapta, deci acum e ${x < 0 ? '9 (a împrumutat și ea)' : x}. `; }
      let nb = 0, xx = x < 0 ? x + 10 : x; if (x < 0) nb = 1;
      if (xx < y) { t += `${xx} − ${y} nu se poate, împrumuți 1 de la vecinul din stânga: ${xx + 10} − ${y} = <b>${xx + 10 - y}</b>.`; w.push(['r', col(j), xx + 10 - y]); nb = 1; }
      else { t += `${xx} − ${y} = <b>${xx - y}</b>.`; w.push(['r', col(j), xx - y]); }
      if (j === A.length - 1 && xx - y === 0 && A.length > 1 && xx >= y) w = w.filter((q) => q[0] !== 'r'), t += ' Un 0 în față nu se scrie.';
      S.push({ t, w }); br = nb;
    }
    // zerourile din față nu se scriu (1.000 − 995 = 5, nu 005)
    const first = W - String(+a - +b).length;
    S.forEach((st) => { const n = st.w.length; st.w = st.w.filter((q) => !(q[0] === 'r' && q[1] < first)); if (st.w.length < n && !/în față/.test(st.t)) st.t += ' Un 0 în față nu se scrie.'; });
  } else if (B.length === 1) {
    let c = 0; const y = B[0];
    for (let j = 0; j < A.length; j++) {
      const x = A[j], p = x * y + c, w = [['r', col(j), p % 10]];
      if (p >= 10 && j < A.length - 1) w.push(['carry', col(j + 1), Math.floor(p / 10)]);
      S.push({ t: `${x} × ${y}${c ? ` + ${c} (ținut minte)` : ''} = <b>${p}</b>. ${p >= 10 && j < A.length - 1 ? `Scrii <b>${p % 10}</b> și ții minte <b>${Math.floor(p / 10)}</b> deasupra coloanei din stânga.` : j === A.length - 1 && p >= 10 ? `E ultima cifră: scrii tot <b>${p}</b>.` : `Scrii <b>${p}</b>.`}`, w });
      if (j === A.length - 1 && p >= 10) w.push(['r', col(j + 1), Math.floor(p / 10)]);
      c = Math.floor(p / 10);
    }
  } else {
    let total = 0;
    B.forEach((y, k) => {
      const p = (+a) * y, s = String(p), w = [];
      [...s].reverse().forEach((d, i) => w.push(['p' + k, col(i + k), +d]));
      S.push({ t: `Înmulțești ${a} cu cifra ${NAMES[k]}, <b>${y}</b>: ${a} × ${y} = <b>${p}</b>. ${k ? `Îl scrii mutat cu ${k} ${k === 1 ? 'loc' : 'locuri'} spre stânga (e ${y} ${k === 1 ? 'zeci' : 'sute'}).` : 'Îl scrii sub linie, de la dreapta.'}`, w });
      total += p * 10 ** k;
    });
    const s = String(total);
    S.push({ t: `Acum aduni rândurile pe coloane, ca la adunare: <b>${s}</b>.`, w: [...s].reverse().map((d, i) => ['r', col(i), +d]) });
  }
  return S;
}

function step() {
  if (!C) { msg('Întâi scrie numerele și apasă „Așază”.'); return; }
  if (C.k === 0) onHelp();
  const s = C.steps[C.k];
  if (!s) { msg('Gata! Citește rezultatul de jos și caută-l printre variante.'); return; }
  const g = root.querySelector('#cGrid');
  g.querySelectorAll('.hl').forEach((x) => x.classList.remove('hl'));
  s.w.forEach(([r, c, v]) => {
    if (r === 'cross') { const d = g.querySelector(`[data-x="${c}"]`); if (d) d.classList.add('crossed'); return; }
    const inp = g.querySelector(`input[data-r="${r}"][data-c="${c}"]`); if (inp) { inp.value = v; inp.classList.add('hl'); }
  });
  C.k++;
  msg(`<b>Pasul ${C.k} din ${C.steps.length}.</b> ${s.t}`);
}
