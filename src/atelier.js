// Atelierul problemelor: 4 trepte pentru fiecare tip de problemă din test.
// 1 Privește (exemplu rezolvat) → 2 Completează → 3 Singur, pas cu pas → 4 Ca la test → Stăpânit.
import { S, save, reviewMark } from './state.js';
import { SFX } from './audio.js';
import { ATELIER, atelierByType } from './content/guided.js';
import { GEN } from './content/missions.js';
import { toast, confetti, refreshHud } from './ui.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LV = ['', 'Privește', 'Completează', 'Singur, pas cu pas', 'Ca la test', 'Stăpânit'];
const lvlOf = (t) => (S.atelier && S.atelier[t] ? S.atelier[t] : 1);
const setLvl = (t, l) => { S.atelier = S.atelier || {}; S.atelier[t] = Math.max(lvlOf(t), l); save(); };
const card = () => $('quizCard');
const show = (html) => { document.body.dataset.act = 'atelier'; $('panel').hidden = true; $('quiz').hidden = false; card().innerHTML = html; card().scrollTop = 0; };
const close = () => { document.dispatchEvent(new CustomEvent('close-draft')); $('quiz').hidden = true; };

export function openAtelier(focus) {
  const list = focus ? [atelierByType(focus), ...ATELIER.filter((a) => a.type !== focus)] : ATELIER;
  show(`<div class="eyebrow">Atelierul problemelor · antrenorul Pas-cu-Pas</div><h2>Învățăm metoda, nu doar rezultatul</h2>
    <p>Fiecare problemă din test are un <b>principiu</b>. Treci prin 4 trepte: <b>privești</b> cum se face, <b>completezi</b> pașii, o faci <b>singur</b> pas cu pas, apoi <b>ca la test</b>.</p>
    <div class="jgrade">${list.map((a) => { const l = lvlOf(a.type); return `<div class="jrow"><div><b>${esc(a.title)}</b><small>Test ${esc(a.test)} · ${esc(a.principle)}</small>
      <div class="dots" style="margin-top:6px">${[1, 2, 3, 4].map((k) => `<i class="${k < l ? 'ok' : k === l ? 'now' : ''}"></i>`).join('')}</div></div>
      <small>${l >= 5 ? '★ Stăpânit' : 'Treapta ' + l}</small><button class="btn" type="button" data-t="${a.type}">${l >= 5 ? 'Repetă' : LV[l]}</button></div>`; }).join('')}</div>
    <div class="row"><button class="btn light" type="button" id="aClose">Înapoi pe insulă</button></div>`);
  card().querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { SFX.tap(); play(b.dataset.t, Math.min(4, lvlOf(b.dataset.t))); });
  $('aClose').onclick = close;
}

function head(a, lvl, extra = '') {
  return `<div class="eyebrow">${esc(a.title)} · treapta ${lvl}: ${LV[lvl]}</div>
    <div class="dots">${[1, 2, 3, 4].map((k) => `<i class="${k < lvl ? 'ok' : k === lvl ? 'now' : ''}"></i>`).join('')}</div>
    <div class="hint"><b>Principiul</b><span>${esc(a.principle)}</span></div>${extra}`;
}
const problem = (p) => `<div class="q">${esc(p.text)}${p.expr ? `<span class="expr">${esc(p.expr)}</span>` : ''}</div>`;
const tools = () => `<div class="tools"><button class="tool" type="button" id="aDraft">Ciornă</button><button class="tool" type="button" id="aList">Atelier</button><button class="tool" type="button" id="aQuit">Ieși</button></div>`;
function bindTools() {
  $('aDraft').onclick = () => document.dispatchEvent(new CustomEvent('open-draft'));
  $('aList').onclick = () => { document.dispatchEvent(new CustomEvent('close-draft')); openAtelier(); };
  $('aQuit').onclick = close;
}
const doneStep = (s, i) => `<li><span>${esc(s.ask)}</span> <b style="color:var(--good)">→ ${esc(s.ans)}</b>${s.ok ? `<br><small>${esc(s.ok)}</small>` : ''}</li>`;

export function play(type, lvl) {
  const a = atelierByType(type);
  if (lvl === 4) return testLevel(a);
  const p = a.make();
  let i = lvl === 1 ? 0 : lvl === 2 ? Math.floor(p.steps.length / 2) : 0, mistakes = 0;
  const render = () => {
    const shown = p.steps.slice(0, i);
    if (lvl === 1) {
      const s = p.steps[i];
      show(head(a, lvl) + problem(p) + tools() + `<ol class="fb ok" style="padding-left:30px">${shown.map(doneStep).join('')}${s ? `<li><span>${esc(s.ask)}</span><br><b style="color:var(--good);font-size:20px">→ ${esc(s.ans)}</b>${s.ok ? `<br><small>${esc(s.ok)}</small>` : ''}</li>` : ''}</ol>
        <div class="row"><button class="btn" type="button" id="aNext">${i < p.steps.length - 1 ? 'Următorul pas' : 'Am înțeles! Acum încerc eu'}</button></div>`);
      bindTools();
      $('aNext').onclick = () => { SFX.tap(); if (i < p.steps.length - 1) { i++; render(); } else { setLvl(type, 2); S.coins += 5; save(); refreshHud(); play(type, 2); } };
      return;
    }
    if (i >= p.steps.length) return finishGuided();
    const s = p.steps[i];
    show(head(a, lvl) + problem(p) + tools() + `${shown.length ? `<ol class="fb ok" style="padding-left:30px">${shown.map(doneStep).join('')}</ol>` : ''}
      <div class="q" style="font-size:18px">Pasul ${i + 1} din ${p.steps.length}: ${esc(s.ask)}</div>
      <div class="opts">${s.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="aFb"></div>`);
    bindTools();
    card().querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
      const o = s.opts[+b.dataset.k];
      if (o === s.ans) { SFX.ok(); b.classList.add('right'); card().querySelectorAll('[data-k]').forEach((x) => (x.disabled = true)); setTimeout(() => { i++; render(); }, s.ok ? 900 : 500); if (s.ok) $('aFb').innerHTML = `<div class="fb ok"><span>${esc(s.ok)}</span></div>`; }
      else { SFX.no(); mistakes++; b.classList.add('wrong'); b.disabled = true; $('aFb').innerHTML = `<div class="fb no"><b>Mai gândește-te.</b><span>${esc(s.ok || a.principle)}</span></div>`; }
    });
    card().scrollTop = card().scrollHeight;
  };
  const finishGuided = () => {
    const pass = mistakes <= (lvl === 2 ? 2 : 1);
    if (pass) { setLvl(type, lvl + 1); S.coins += 5; save(); refreshHud(); SFX.star(); confetti(); }
    show(head(a, lvl) + `<h2>${pass ? 'Bravo! Ai rezolvat-o!' : 'Ai ajuns la capăt!'}</h2><p>${mistakes === 0 ? 'Fără nicio greșeală!' : `Ai greșit de ${mistakes} ${mistakes === 1 ? 'dată' : 'ori'} pe drum.`} ${pass ? 'Treci la treapta următoare.' : 'Mai facem una, cu alte numere, ca să se prindă metoda.'}</p>
      <div class="hint"><b>Ține minte</b><span>${esc(a.principle)}</span></div>
      <div class="row"><button class="btn light" type="button" id="aBack">Atelier</button><button class="btn" type="button" id="aGo">${pass ? 'Treapta următoare' : 'Încă una'}</button></div>`);
    $('aBack').onclick = () => openAtelier(); $('aGo').onclick = () => play(type, pass ? Math.min(4, lvl + 1) : lvl);
  };
  render();
}

function testLevel(a) {
  let n = 0, ok = 0;
  const next = () => {
    if (n >= 3) {
      const pass = ok >= 2;
      if (pass) { setLvl(a.type, 5); S.coins += 20; save(); refreshHud(); SFX.fanfare(); confetti(); }
      show(head(a, 4) + `<h2>${pass ? 'Stăpânit! ★' : 'Aproape!'}</h2><div class="big">${ok} / 3</div>
        <p>${pass ? 'Acum știi metoda. Așa o vei rezolva și la școală!' : 'Ai nevoie de 2 din 3. Repetăm o dată pas cu pas, apoi mai încerci.'}</p>
        <div class="row"><button class="btn light" type="button" id="aBack">Atelier</button><button class="btn" type="button" id="aGo">${pass ? 'Altă problemă' : 'Pas cu pas'}</button></div>`);
      $('aBack').onclick = () => openAtelier(); $('aGo').onclick = () => (pass ? openAtelier() : play(a.type, 3));
      return;
    }
    const q = GEN[a.type]();
    show(head(a, 4) + `<p>Problema ${n + 1} din 3. Acum fără ajutor, ca la test.</p>` + problem(q) + tools() + `<div class="opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="aFb"></div>`);
    bindTools();
    card().querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
      const right = q.opts[+b.dataset.k] === q.ans; reviewMark(a.type, right);
      const st = S.stats[a.type] || (S.stats[a.type] = { ok: 0, bad: 0 }); right ? st.ok++ : st.bad++; save();
      card().querySelectorAll('[data-k]').forEach((x, k) => { x.disabled = true; if (q.opts[k] === q.ans) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
      if (right) { ok++; SFX.ok(); } else SFX.no();
      $('aFb').innerHTML = `<div class="fb ${right ? 'ok' : 'no'}"><b>${right ? 'Corect!' : 'Răspuns: ' + esc(q.ans)}</b><ol>${q.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div><div class="row"><button class="btn" type="button" id="aN">Mai departe</button></div>`;
      $('aN').onclick = () => { n++; document.dispatchEvent(new CustomEvent('close-draft')); next(); };
    });
  };
  next();
}
export { toast };
