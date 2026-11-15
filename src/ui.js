// Ecranele jocului: dialog cu personajele, misiuni, test, ciornă, lecții, garderobă, progres.
import { initColumn, showColumn, exprFrom, resetColumn } from './column.js';
import { S, save, DAY, GOAL, starsTotal, reviewMark, dueTypes, pickWeighted, areaLocked, GRADE_NAMES, G } from './state.js';
import { SFX } from './audio.js';
import { Music } from './music.js';
import { GEN, MISSIONS, AREAS, TEST_ITEMS, TYPE_NAMES, SUBJECT_NAMES, missionById, areaById, typeArea } from './content/missions.js';
import { LESSONS } from './content/lessons.js';
import { COLORS, SKINS, HATS, FACES } from './avatar.js';
import { pick, shuffle } from './content/util.js';
import { openAtelier } from './atelier.js';
import { openWrite, openFise, openChapters, chapterOk } from './extra.js';
import { atelierByType } from './content/guided.js';

const $ = (id) => document.getElementById(id);
const NM = () => S.name || 'campionule';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let H = {}; // legături către lumea 3D
export function initUI(hooks) { H = hooks; bind(); refreshHud(); }

/* ---------- mici utilitare ---------- */
let toastT;
export function toast(t) { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2800); }
export function confetti() {
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const box = $('confetti'), cols = ['#ff7a2f', '#f2b632', '#23935a', '#3b7ddd', '#8a5cf6', '#e04848'];
  for (let i = 0; i < 30; i++) {
    const e = document.createElement('i'); e.style.left = (40 + Math.random() * 20) + '%'; e.style.top = '45%'; e.style.background = cols[i % cols.length];
    e.style.setProperty('--dx', (Math.random() * 500 - 250) + 'px'); e.style.setProperty('--dy', (Math.random() * -350 - 50) + 'px'); e.style.setProperty('--r', (Math.random() * 720) + 'deg');
    box.appendChild(e); setTimeout(() => e.remove(), 1400);
  }
}
export const paused = () => !$('quiz').hidden || !$('panel').hidden || ($('home') && !$('home').hidden);
const starsHtml = (n, max = 3) => `<span class="stars">${'★'.repeat(n)}<span class="off">${'★'.repeat(max - n)}</span></span>`;
export function refreshHud() {
  $('coins').textContent = S.coins; $('stars').textContent = starsTotal();
  $('streak').textContent = 'Serie ' + S.streak;
  const m = Math.min(20, Math.floor(S.today.sec / 60)); $('dayMin').textContent = m + '/20'; $('dayFill').style.width = (m / 20 * 100) + '%';
  $('mute').textContent = 'Sunet: ' + (S.mute ? 'nu' : 'da');
  $('musicBtn').textContent = 'Muzică: ' + (Music.on() ? 'da' : 'nu');
}
export function showPanel(html, onClose) {
  $('panelCard').innerHTML = html; $('panel').hidden = false; H.stop && H.stop();
  $('panelCard').querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => { $('panel').hidden = true; onClose && onClose(); }));
  $('panelCard').scrollTop = 0;
}
const hidePanel = () => { $('panel').hidden = true; };

function bind() {
  $('panel').addEventListener('click', (e) => { if (e.target.id === 'panel' && !$('panel').dataset.lock) hidePanel(); });
  addEventListener('keydown', (e) => { if (e.code === 'Escape' && !$('panel').hidden && !$('panel').dataset.lock) hidePanel(); });
  document.addEventListener('open-draft', () => openDraft()); document.addEventListener('close-draft', () => closeDraft());
  $('openDaily').onclick = () => { SFX.tap(); openDaily(); };
  $('openJournal').onclick = () => { SFX.tap(); openJournal(); };
  $('openAtelier').onclick = () => { SFX.tap(); openAtelier(); };
  $('openShop').onclick = () => { SFX.tap(); openShop(); };
  $('openProg').onclick = () => { SFX.tap(); openProgress(); };
  $('mute').onclick = () => { S.mute = !S.mute; save(); refreshHud(); SFX.tap(); };
  $('musicBtn').onclick = () => { Music.toggle(); refreshHud(); };
  $('openMenu').onclick = () => { SFX.tap(); openMenu(); };
  bindDraft();
}

/* ---------- meniul de pe telefon ---------- */
export function openMenu() {
  const m = Math.min(20, Math.floor(S.today.sec / 60));
  showPanel(`<div class="eyebrow">Azi: ${m} din 20 de minute · Serie: ${S.streak} ${S.streak === 1 ? 'zi' : 'zile'}</div><h2>Meniu</h2>
    <div class="shopgrid">
      <button class="item" type="button" id="mJ"><b>Misiuni</b><span>toate clasele</span></button>
      <button class="item" type="button" id="mS"><b>Garderoba</b><span>haine și pălării</span></button>
      <button class="item" type="button" id="mP"><b>Progres</b><span>pentru părinți</span></button>
      <button class="item" type="button" id="mM"><b>Sunete</b><span>${S.mute ? 'oprite' : 'pornite'}</span></button>
      <button class="item" type="button" id="mMu"><b>Muzică</b><span>${Music.on() ? 'pornită' : 'oprită'}</span></button>
      <button class="item" type="button" id="mH"><b>Acasă</b><span>alege jocul</span></button>
      <button class="item" type="button" id="mPr"><b>Profilul meu</b><span>${esc(S.name || 'fără profil')}</span></button>
      <button class="item" type="button" id="mA"><b>Atelierul problemelor</b><span>problemele din test, pas cu pas</span></button>
      <button class="item" type="button" id="mC"><b>Joacă cu colegii</b><span>cameră cu link</span></button>
      <button class="item" type="button" id="mG"><b>Clasa mea</b><span>${GRADE_NAMES[G()]}</span></button>
      <button class="item" type="button" id="mV"><b>Viteza camerei</b><span>${{ incet: 'încet', mediu: 'mediu', rapid: 'rapid' }[S.camSpeed || 'incet']}</span></button>
      <button class="item" type="button" id="mCh"><b>Unde am ajuns la școală</b><span>capitolele făcute</span></button>
      <button class="item" type="button" id="mF"><b>Fișe de lucru</b><span>de printat, cu răspunsuri</span></button>
      <button class="item" type="button" id="mH"><b>Cum se joacă</b><span>ajutor</span></button>
    </div><div class="row"><button class="btn" type="button" data-close>Închide</button></div>`);
  $('mJ').onclick = () => openJournal(); $('mS').onclick = () => openShop(); $('mP').onclick = () => openProgress();
  $('mM').onclick = () => { S.mute = !S.mute; save(); refreshHud(); openMenu(); };
  $('mMu').onclick = () => { Music.toggle(); refreshHud(); openMenu(); };
  $('mC').onclick = () => H.multiplayer();
  $('mA').onclick = () => openAtelier();
  $('mCh').onclick = () => openChapters(); $('mF').onclick = () => openFise();
  $('mPr').onclick = () => window.__profile && window.__profile();
  $('mH').onclick = () => { hidePanel(); document.getElementById('openHome').click(); };
  $('mG').onclick = () => { toast(`Ești în ${GRADE_NAMES[G()]}. Când termini toată lumea clasei tale, se deschide clasa următoare.`); };
  $('mV').onclick = () => { const o = ['incet', 'mediu', 'rapid']; S.camSpeed = o[(o.indexOf(S.camSpeed || 'incet') + 1) % 3]; save(); openMenu(); }; $('mH').onclick = () => showTutorial(matchMedia('(pointer:coarse)').matches);
}

/* ---------- tutorial ---------- */
export function showTutorial(touch) {
  showPanel(`<div class="eyebrow">Bun venit!</div><h2>Bun venit în Mintoria!</h2>
    <div class="tut">
      <div class="st"><span>1</span><p>${touch ? 'Trage cu degetul în <b>stânga jos</b> ca să mergi. Butonul <b>Sari</b> te aruncă în sus.' : 'Mergi cu <b>W A S D</b> sau săgețile, sari cu <b>Spațiu</b>, rotești camera cu mouse-ul.'}</p></div>
      <div class="st"><span>2</span><p>Caută personajele cu <b>„!”</b> deasupra capului. Ele îți dau <b>misiuni</b>. Bara de sus îți arată unde e următoarea.</p></div>
      <div class="st"><span>3</span><p>La fiecare misiune câștigi până la <b>3 stele</b> și monede. Cu monedele îți cumperi haine în <b>Garderoba</b>.</p></div>
      <div class="st"><span>4</span><p>Portalurile colorate din piață te duc la <b>Clasa I, a II-a, a III-a</b> și în <b>Arena Testului</b>.</p></div>
      <div class="st"><span>5</span><p><b>Antrenamentul</b> de 20 de minute pe zi te face cel mai bun. Ce greșești revine mâine, ca să nu mai uiți.</p></div>
    </div>
    <div class="row"><button class="btn" type="button" data-close>Hai să jucăm!</button></div>`, () => { S.tutorial = true; save(); });
}

/* ---------- dialog cu un personaj ---------- */
export function talkTo(m) {
  SFX.talk();
  if (m.atelier) { openAtelier(); return; }
  if (m.hub) { openHub(m.hub); return; }
  const a = areaById(m.area), st = (S.missions[m.id] || {}).stars || 0;
  const greet = m.test
    ? `Bună, ${esc(NM())}! Eu sunt <b>${esc(m.npc)}</b>. Am pregătit testul tău de matematică: aceleași exerciții, dar cu alte numere. Primești notă de la 1 la 10. ${S.testBest ? `Cea mai bună notă a ta: <b>${fmtNota(S.testBest)}</b>.` : 'Ești gata?'}`
    : st === 3 ? `Bravo, ${esc(NM())}! Ai 3 stele la mine. Mai joci o rundă pentru monede?` : `Salut, ${esc(NM())}! Eu sunt <b>${esc(m.npc)}</b>. ${esc(m.desc)} ${st ? 'Hai să luăm toate cele 3 stele!' : 'Ai 5 provocări. Răspunde bine și primești stele!'}`;
  showPanel(`<div class="eyebrow">${esc(a.name)}</div>
    <div class="npc"><div class="av" style="background:${a.color}">${esc(m.npc[0])}</div><div class="bubble">${greet}</div></div>
    <h2>${esc(m.title)}</h2>${m.test ? '' : starsHtml(st)}
    <div class="row">${m.lesson ? '<button class="btn light" type="button" id="dLesson">Lecția fulger</button>' : ''}<button class="btn light" type="button" data-close>Mai târziu</button><button class="btn" type="button" id="dGo">${m.test ? 'Încep testul' : 'Începe misiunea'}</button></div>`);
  $('dGo').onclick = () => { hidePanel(); startMission(m); };
  if ($('dLesson')) $('dLesson').onclick = () => showLesson(m.lesson, m.title, () => startMission(m));
}
const fmtNota = (n) => (Math.round(n * 100) / 100).toString().replace('.', ',');

/* ---------- profesorii pe materii ---------- */
export function openHub(subject) {
  const list = MISSIONS.filter((m) => m.subject === subject && !areaLocked(m.area)), hub = MISSIONS.find((m) => m.hub === subject);
  const got = list.reduce((a, m) => a + ((S.missions[m.id] || {}).stars || 0), 0);
  showPanel(`<div class="eyebrow">${esc(hub ? hub.npc : '')} · ${got} din ${list.length * 3} stele</div><h2>${esc(SUBJECT_NAMES[subject] || subject)}</h2>
    <div class="jgrade">${list.map((m) => `<div class="jrow"><div><b>${esc(m.title)}</b><small>${esc(m.desc)}</small></div>${starsHtml((S.missions[m.id] || {}).stars || 0)}<button class="btn" type="button" data-play="${m.id}">Joacă</button></div>`).join('')}</div>
    ${subject === 'compuneri' ? '<div class="row" style="justify-content:flex-start"><button class="btn light" type="button" id="hWrite">Scriu o compunere</button></div>' : ''}
    <div class="row"><button class="btn light" type="button" data-close>Închide</button></div>`);
  $('panelCard').querySelectorAll('[data-play]').forEach((b) => b.onclick = () => { hidePanel(); startMission(missionById(b.dataset.play)); });
  if ($('hWrite')) $('hWrite').onclick = () => openWrite();
}

/* ---------- lecții ---------- */
export function showLesson(key, title, after) {
  const sl = LESSONS[key]; if (!sl) { after && after(); return; }
  let i = 0; S.seen[key] = true; save();
  const draw = () => {
    const s = sl[i];
    showPanel(`<div class="eyebrow">Lecția fulger · ${esc(title)}</div><h2>${s.h}</h2><p>${s.p}</p><div class="lesson">${s.x}</div>
      <div class="sdots">${sl.map((_, k) => `<i class="${k === i ? 'now' : ''}"></i>`).join('')}</div>
      <div class="row">${i > 0 ? '<button class="btn light" type="button" id="lb">Înapoi</button>' : ''}<button class="btn" type="button" id="ln">${i < sl.length - 1 ? 'Mai departe' : (after ? 'La provocări!' : 'Am înțeles')}</button></div>`);
    if ($('lb')) $('lb').onclick = () => { i--; draw(); };
    $('ln').onclick = () => { SFX.tap(); if (i < sl.length - 1) { i++; draw(); } else { hidePanel(); after && after(); } };
  };
  draw();
}

/* ---------- quiz: misiune, antrenament, test ---------- */
let Q = null, combo = 0, goalShown = false;
if (location.hostname === 'localhost') window.__ui = { Q: () => Q, S, MISSIONS, startMission: (id) => startMission(missionById(id)), openDaily: () => openDaily(), openHub: (x) => openHub(x), openWrite: () => openWrite(), openFise: () => openFise(), openChapters: () => openChapters() };
const mk = (t, extra = {}) => Object.assign({ type: t, area: typeArea(t, G()) }, GEN[t](), extra);
export function startMission(m) {
  if (areaLocked(m.area)) { toast(`Misiunea e pentru ${areaById(m.area).short}. Tu ești în ${GRADE_NAMES[G()]}.`); return; }
  if (m.atelier) { openAtelier(); return; }
  if (m.test) {
    const qs = TEST_ITEMS.map((it) => mk(it.type, { pts: it.pts, label: it.label }));
    Q = { mode: 'test', m, qs, i: 0, ok: 0, res: [], score: 1 };
  } else {
    if (m.lesson && !S.seen[m.lesson]) { showLesson(m.lesson, m.title, () => startMission(m)); return; }
    const qs = []; for (let i = 0; i < 5; i++) qs.push(mk(pickWeighted(m.types)));
    Q = { mode: 'mission', m, qs, i: 0, ok: 0, res: [] };
  }
  openQuiz();
}
export function openDaily() {
  const due = shuffle(dueTypes()).slice(0, 4), qs = due.map((t) => mk(t));
  const byArea = new Proxy({}, { get: (_, k) => (String(k) === String(G()) ? 1 : 0) });
  while (qs.length < 10) {
    let ms = MISSIONS.filter((m) => m.types && chapterOk(m) && byArea[m.area] > 0); if (!ms.length) ms = MISSIONS.filter((m) => m.types); const w = ms.map((m) => byArea[m.area]);
    let r = Math.random() * w.reduce((a, b) => a + b, 0), mm = ms[0];
    for (let i = 0; i < ms.length; i++) { r -= w[i]; if (r <= 0) { mm = ms[i]; break; } }
    qs.push(mk(pickWeighted(mm.types)));
  }
  Q = { mode: 'daily', m: { title: 'Antrenamentul zilei' }, qs, i: 0, ok: 0, res: [], nrev: due.length };
  openQuiz();
  if (due.length) toast(`Întâi ${due.length} ${due.length === 1 ? 'recapitulare' : 'recapitulări'} din zilele trecute.`);
}
function openQuiz() { $('quiz').hidden = false; H.stop && H.stop(); renderQ(); }
const hintsOf = (q) => q.hints || (q.steps.length > 1 ? q.steps.slice(0, -1) : []);

function renderQ() {
  const q = Q.qs[Q.i]; q.used = 0; draftClear(); document.body.dataset.act = Q.mode;
  const n = Q.qs.length, dots = Q.qs.map((_, k) => `<i class="${k < Q.i ? (Q.res[k] ? 'ok' : 'no') : k === Q.i ? 'now' : ''}"></i>`).join('');
  const head = Q.mode === 'test' ? `Testul · exercițiul ${q.label} · ${fmtNota(q.pts)}p` : `${esc(Q.m.title)} · ${Q.i + 1} din ${n}${Q.mode === 'daily' && Q.i < Q.nrev ? ' · recapitulare' : ''}`;
  const body = q.kind === 'tap'
    ? `<div class="toks">${q.toks.map((t, k) => /^[+−×:]$/.test(t) ? `<button class="tok op" type="button" data-k="${k}">${t}</button>` : `<span class="tok">${t}</span>`).join('')}</div>`
    : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
  const hs = hintsOf(q), lessonKey = (MISSIONS.find((m) => m.types && m.types.includes(q.type)) || {}).lesson;
  $('quizCard').innerHTML = `<div class="eyebrow">${head}</div><div class="dots">${dots}</div>
    ${combo >= 2 && Q.mode !== 'test' ? `<div class="combo">Combo ${combo}! ${combo >= 3 ? 'Monede duble' : 'Încă unul și primești monede duble'}</div>` : ''}
    <div class="q">${esc(q.text)}${q.expr ? `<span class="expr">${esc(q.expr)}</span>` : ''}</div>
    <div class="tools"><button class="tool" type="button" id="tDraft">Ciornă</button>${Q.mode !== 'test' ? `<button class="tool" type="button" id="tHint" ${hs.length ? '' : 'disabled'}>Indiciu</button>${lessonKey ? '<button class="tool" type="button" id="tLesson">Lecția</button>' : ''}` : ''}<button class="tool" type="button" id="tQuit">Ieși</button></div>
    <div id="hintBox"></div>${body}<div id="fbBox"></div>`;
  $('quizCard').querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.k)));
  $('tDraft').onclick = openDraft;
  $('tQuit').onclick = () => { closeDraft(); $('quiz').hidden = true; Q = null; };
  if ($('tHint')) $('tHint').onclick = () => {
    if (q.done) return; q.used = Math.min(q.used + 1, hs.length); SFX.tap();
    $('hintBox').innerHTML = `<div class="hint"><b>Indiciu ${q.used} din ${hs.length}</b>${hs.slice(0, q.used).map((h) => `<span>${esc(h)}</span>`).join('')}</div>`;
    if (q.used >= hs.length) $('tHint').disabled = true;
  };
  if ($('tLesson')) $('tLesson').onclick = () => { const back = Q; $('quiz').hidden = true; showLesson(lessonKey, TYPE_NAMES[q.type] || 'Lecție', () => { Q = back; $('quiz').hidden = false; }); };
  $('quizCard').scrollTop = 0;
}

function answer(k) {
  const q = Q.qs[Q.i]; if (q.done) return; q.done = true;
  const ok = q.kind === 'tap' ? k === q.ans : q.opts[k] === q.ans;
  const sel = q.kind === 'tap' ? '.tok.op' : '.opt';
  $('quizCard').querySelectorAll(sel).forEach((b) => { const i = +b.dataset.k; b.disabled = true; const isAns = q.kind === 'tap' ? i === q.ans : q.opts[i] === q.ans; if (isAns) b.classList.add('right'); else if (i === k) b.classList.add('wrong'); });
  const st = S.stats[q.type] || (S.stats[q.type] = { ok: 0, bad: 0 }); ok ? st.ok++ : st.bad++;
  reviewMark(q.type, ok);
  let gain = 0;
  S.xp = (S.xp || 0) + (ok ? 10 : 2);
  if (ok) { combo++; gain = Math.max(1, 5 - q.used * 2) * (combo >= 3 ? 2 : 1); Q.ok++; S.coins += gain; if (Q.mode === 'test') Q.score += q.pts; SFX.ok(); confetti(); H.cheer && H.cheer(); }
  else { combo = 0; SFX.no(); }
  Q.res[Q.i] = ok; save(); refreshHud();
  const last = Q.i === Q.qs.length - 1, ansTxt = q.kind === 'tap' ? q.toks[q.ans] : q.ans;
  $('fbBox').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}"><b>${ok ? `Corect! +${gain} ${gain === 1 ? 'monedă' : 'monede'}${combo >= 3 ? ' (combo!)' : ''}` : 'Nu chiar. Răspunsul corect: ' + esc(ansTxt)}</b>
    <span>${ok ? 'Iată cum se face:' : 'Hai să vedem pas cu pas. Acest tip de exercițiu revine mâine, ca să-l prinzi.'}</span><ol>${q.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <div class="row" style="margin-top:10px"><button class="btn" type="button" id="next">${last ? 'Vezi rezultatul' : 'Mai departe'}</button></div>`;
  $('next').onclick = () => { closeDraft(); if (last) finish(); else { Q.i++; renderQ(); } };
  $('fbBox').scrollIntoView({ block: 'nearest' });
}

function checkUnlock() {
  const g = G(); if (g >= 4) return;
  const mine = MISSIONS.filter((m) => (m.area === String(g) && m.types && !m.subject) || (g === 3 && m.test));
  S.unlocked = S.unlocked || {};
  if (S.unlocked[g + 1] || !mine.every((m) => ((S.missions[m.id] || {}).stars || 0) > 0)) return;
  S.unlocked[g + 1] = true; save(); H.missionsChanged && H.missionsChanged(); SFX.fanfare(); confetti();
  setTimeout(() => toast(`Ai terminat lumea clasei tale! S-a deschis portalul spre ${GRADE_NAMES[g + 1]}.`), 600);
}
function finish() {
  const n = Q.qs.length;
  let html;
  if (Q.mode === 'test') {
    const nota = Q.score, stars = nota >= 9 ? 3 : nota >= 7 ? 2 : nota >= 5 ? 1 : 0, prev = S.missions[Q.m.id] || { stars: 0 };
    S.testBest = Math.max(S.testBest || 0, nota); S.missions[Q.m.id] = { stars: Math.max(prev.stars, stars) };
    if (nota >= 9) { SFX.fanfare(); confetti(); } save(); refreshHud(); H.missionsChanged && H.missionsChanged();
    const wrong = Q.qs.filter((_, i) => !Q.res[i]).map((q) => q.label + ' ' + (TYPE_NAMES[q.type] || '')).join(', ');
    html = `<div class="eyebrow">Arena Testului</div><h2>${nota >= 9 ? `Excepțional, ${esc(NM())}!` : nota >= 7 ? 'Foarte bine!' : nota >= 5 ? 'Ai trecut! Mai antrenează-te.' : 'Mai exersăm puțin.'}</h2>
      <div class="grade">${fmtNota(nota)}</div><p style="text-align:center">nota ta (1 punct din oficiu) · ${starsHtml(stars)}</p>
      ${wrong ? `<p>De lucrat: <b>${esc(wrong)}</b>. Aceste tipuri vor apărea mai des la antrenament și la misiunile din Castelul Clasei a III-a.</p>` : '<p>Toate exercițiile corecte! Ești pregătit pentru test.</p>'}`;
  } else if (Q.mode === 'mission') {
    const stars = Q.ok >= 5 ? 3 : Q.ok >= 4 ? 2 : Q.ok >= 3 ? 1 : 0, prev = (S.missions[Q.m.id] || {}).stars || 0;
    if (stars > prev) { S.missions[Q.m.id] = { stars }; SFX.star(); confetti(); H.missionsChanged && H.missionsChanged(); }
    save(); refreshHud();
    html = `<div class="eyebrow">${esc(Q.m.title)}</div><h2>${stars === 3 ? `Perfect, ${esc(NM())}!` : stars ? 'Bravo!' : 'Aproape!'}</h2>
      <div class="big">${Q.ok} / ${n}</div><p style="text-align:center">${starsHtml(stars)}</p>
      <p>${stars > prev ? `Ai câștigat ${stars - prev} ${stars - prev === 1 ? 'stea nouă' : 'stele noi'}!` : stars < 3 ? '5 din 5 înseamnă 3 stele. Mai încerci?' : 'Ai deja toate stelele aici. Monedele sunt ale tale!'}</p>`;
  } else {
    html = `<div class="eyebrow">Antrenamentul zilei</div><h2>${Q.ok >= 8 ? 'Ești în formă maximă!' : Q.ok >= 5 ? 'Bine lucrat!' : 'Fiecare greșeală e o lecție.'}</h2>
      <div class="big">${Q.ok} / ${n}</div><p>${Q.nrev ? `Ai făcut ${Q.nrev} ${Q.nrev === 1 ? 'recapitulare' : 'recapitulări'}. ` : ''}Ce ai greșit revine mâine, apoi peste 3 zile și peste o săptămână. Așa se lipește de creier.</p>`;
  }
  const again = Q.mode === 'daily' ? openDaily : () => startMission(Q.m);
  const weak = Q.mode === 'test' ? (Q.qs.find((q, i) => !Q.res[i] && atelierByType(q.type)) || {}).type : null;
  $('quizCard').innerHTML = html + `<div class="row">${weak ? '<button class="btn" type="button" id="toAt">Învață metoda în Atelier</button>' : ''}<button class="btn light" type="button" id="again">Încă o dată</button><button class="btn${weak ? ' light' : ''}" type="button" id="back">Înapoi pe insulă</button></div>`;
  if (weak) $('toAt').onclick = () => openAtelier(weak);
  const m = Q.m;
  $('again').onclick = () => (Q.mode === 'daily' ? openDaily() : startMission(m));
  checkUnlock();
  $('back').onclick = () => { $('quiz').hidden = true; Q = null; checkGoal(); };
  void again;
}

export function tickTime(dt) {
  if ($('quiz').hidden && !($('panel').hidden === false && $('panelCard').querySelector('.lesson'))) return;
  if (S.today.day !== DAY()) S.today = { day: DAY(), sec: 0 };
  S.today.sec += dt;
}
function checkGoal() {
  if (S.today.sec < GOAL || goalShown || S.lastGoalDay === DAY()) return;
  goalShown = true; const d = DAY(); S.streak = (S.lastGoalDay === d - 1 ? S.streak : 0) + 1; S.lastGoalDay = d; S.coins += 20; save(); refreshHud(); SFX.fanfare(); confetti();
  showPanel(`<div class="eyebrow">Obiectivul de azi: 20 de minute</div><h2>Gata pe azi, campionule!</h2><div class="big">+20</div>
    <p>Ai antrenat creierul 20 de minute. Serie: <b>${S.streak} ${S.streak === 1 ? 'zi' : 'zile'} la rând</b>.</p>
    <p>Creierul învață cel mai bine puțin și des. Ce ai lucrat azi se așază peste noapte. Ne vedem mâine!</p>
    <div class="row"><button class="btn" type="button" data-close>Super!</button></div>`);
}

/* ---------- jurnalul de misiuni ---------- */
let journalTab = null;
export function openJournal(tab) {
  if (tab) journalTab = tab; if (!journalTab) journalTab = String(G());
  const a = areaById(journalTab), list = MISSIONS.filter((m) => m.area === journalTab && !m.hub);
  const got = list.reduce((s, m) => s + ((S.missions[m.id] || {}).stars || 0), 0);
  showPanel(`<div class="eyebrow">Jurnalul de misiuni · ${starsTotal()} stele în total</div><h2>Misiuni</h2>
    <div class="tabs">${AREAS.map((x) => `<button class="tab ${x.id === journalTab ? 'on' : ''}" type="button" data-tab="${x.id}">${esc(x.short)}</button>`).join('')}</div>
    <div class="jgrade"><h3><span>${esc(a.name)}</span>${starsHtml(Math.round(got / (list.length * 3) * 3))}</h3>
    ${list.map((m) => { const st = (S.missions[m.id] || {}).stars || 0; return `<div class="jrow"><div><b>${esc(m.title)}</b><small>${esc(m.npc)} · ${esc(m.desc)}</small></div>${m.test ? `<small>${S.testBest ? 'nota ' + fmtNota(S.testBest) : ''}</small>` : starsHtml(st)}${areaLocked(m.area) ? '<small>Închis</small>' : `<div class="row" style="gap:6px"><button class="iconbtn" type="button" data-go="${m.id}">Du-mă</button><button class="btn" type="button" data-play="${m.id}">Joacă</button></div>`}</div>`; }).join('')}
    </div><div class="row"><button class="btn light" type="button" data-close>Închide</button></div>`);
  $('panelCard').querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => openJournal(b.dataset.tab));
  $('panelCard').querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { hidePanel(); H.goTo(missionById(b.dataset.go)); });
  $('panelCard').querySelectorAll('[data-play]').forEach((b) => b.onclick = () => { hidePanel(); startMission(missionById(b.dataset.play)); });
}
export function nextMission() {
  const g = String(G()), mine = MISSIONS.filter((m) => (m.area === g || (g === '3' && m.area === 'T')) && chapterOk(m));
  return mine.find((m) => m.types && !m.hidden && !((S.missions[m.id] || {}).stars)) || mine.find((m) => ((m.types && !m.hidden) || m.test) && ((S.missions[m.id] || {}).stars || 0) < 3) || null;
}

/* ---------- garderoba ---------- */
const PRICES = { shirt: 10, pants: 10, hat: { nimic: 0, sapca: 0, fundita: 20, basma: 20, casca: 25, ochelari: 25, palarie: 30, urechi: 30, bucatar: 35, coif: 40, vrajitor: 50, coroana: 80 }, face: { zambet: 0, fericit: 15, surprins: 15, cool: 20, ninja: 40, robot: 40 } };
let shopTab = 'shirt';
export function openShop(tab) {
  if (tab) shopTab = tab;
  const slots = { skin: 'Piele', shirt: 'Tricou', pants: 'Pantaloni', hat: 'Pălărie', face: 'Față' };
  const items = shopTab === 'skin' ? SKINS.map((v) => [v, '', 0]) : shopTab === 'shirt' || shopTab === 'pants' ? Object.entries(COLORS).map(([v, n]) => [v, n, PRICES[shopTab]]) : Object.entries(shopTab === 'hat' ? HATS : FACES).map(([v, n]) => [v, n, PRICES[shopTab][v]]);
  const owned = (v, p) => p === 0 || shopTab === 'skin' || S.owned.includes(shopTab + ':' + v);
  showPanel(`<div class="eyebrow">Ai ${S.coins} monede</div><h2>Garderoba</h2>
    <div class="tabs">${Object.entries(slots).map(([k, n]) => `<button class="tab ${k === shopTab ? 'on' : ''}" type="button" data-tab="${k}">${n}</button>`).join('')}</div>
    <div class="shopgrid">${items.map(([v, n, p]) => { const on = S.look[shopTab] === v, own = owned(v, p); return `<button class="item ${on ? 'on' : ''}" type="button" data-v="${v}" data-p="${p}">${v.startsWith('#') ? `<span class="sw" style="background:${v}"></span>` : ''}<span>${esc(n)}</span><span>${on ? 'Purtat' : own ? 'Îmbracă' : p + ' monede'}</span></button>`; }).join('')}</div>
    <div class="row"><button class="btn" type="button" data-close>Gata</button></div>`);
  $('panelCard').querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => openShop(b.dataset.tab));
  $('panelCard').querySelectorAll('[data-v]').forEach((b) => b.onclick = () => {
    const v = b.dataset.v, p = +b.dataset.p;
    if (!owned(v, p)) { if (S.coins < p) { toast(`Îți mai trebuie ${p - S.coins} monede. Rezolvă misiuni!`); return; } S.coins -= p; S.owned.push(shopTab + ':' + v); SFX.coin(); }
    S.look[shopTab] = v; save(); refreshHud(); H.setLook(S.look); openShop();
  });
}

/* ---------- progres (pentru părinți) ---------- */
export function openProgress() {
  const rows = Object.keys(TYPE_NAMES).filter((t) => S.stats[t]).map((t) => { const s = S.stats[t], n = s.ok + s.bad, p = Math.round(100 * s.ok / n); return [p, `<div class="bar"><span>${TYPE_NAMES[t]}</span><span class="tr"><i style="width:${p}%"></i></span><span class="n">${p}% · ${n}</span></div>`]; }).sort((a, b) => a[0] - b[0]).map((r) => r[1]).join('');
  showPanel(`<div class="eyebrow">Pentru părinți</div><h2>Unde mai are de lucrat</h2>
    <p><b>Azi:</b> ${Math.floor(S.today.sec / 60)} din 20 de minute · <b>Serie:</b> ${S.streak} ${S.streak === 1 ? 'zi' : 'zile'} · <b>Stele:</b> ${starsTotal()} din ${MISSIONS.filter((m) => m.types || m.test).length * 3} · <b>Cea mai bună notă la test:</b> ${S.testBest ? fmtNota(S.testBest) : '–'} · <b>Recapitulări programate:</b> ${Object.keys(S.review).length} (${dueTypes().length} azi)</p>
    <div class="row" style="justify-content:flex-start"><button class="btn light" type="button" id="pCh">Unde am ajuns la școală</button><button class="btn light" type="button" id="pF">Fișe de lucru</button></div>
    ${(S.compuneri || []).length ? `<p><b>Compuneri scrise:</b> ${S.compuneri.slice(0, 5).map((c) => `${esc(c.t)} (${'★'.repeat(c.stars)}${'☆'.repeat(3 - c.stars)}, ${c.d})`).join(' · ')}</p>` : ''}
    <p>Procentul de răspunsuri corecte pe fiecare tip, de la cel mai slab la cel mai bun. Tipurile slabe apar mai des.</p>
    <div style="display:flex;flex-direction:column;gap:8px">${rows || '<p>Încă nu s-a jucat nicio misiune.</p>'}</div>
    <div class="row"><button class="btn" type="button" data-close>Închide</button></div>`);
  $('pCh').onclick = () => openChapters(); $('pF').onclick = () => openFise();
}

/* ---------- ciornă ---------- */
let pc, px, pt, strokes = [], cur = null, pen = '#2456b8', dMode = matchMedia('(pointer:fine)').matches ? 'type' : 'draw';
function bindDraft() {
  pc = $('paperC'); px = pc.getContext('2d'); pt = $('paperT');
  pc.addEventListener('pointerdown', (e) => { const r = pc.getBoundingClientRect(); cur = { c: pen, p: [[e.clientX - r.left, e.clientY - r.top]] }; strokes.push(cur); pc.setPointerCapture(e.pointerId); drawStroke(cur); });
  pc.addEventListener('pointermove', (e) => { if (!cur) return; const r = pc.getBoundingClientRect(); cur.p.push([e.clientX - r.left, e.clientY - r.top]); drawStroke({ c: cur.c, p: cur.p.slice(-2) }); });
  const end = () => { cur = null; }; pc.addEventListener('pointerup', end); pc.addEventListener('pointercancel', end);
  document.querySelectorAll('#draft [data-pen]').forEach((b) => b.addEventListener('click', () => { pen = b.dataset.pen; document.querySelectorAll('#draft [data-pen]').forEach((x) => x.classList.toggle('on', x === b)); }));
  $('mType').onclick = () => setMode('type'); $('mDraw').onclick = () => setMode('draw'); $('mCol').onclick = () => setMode('col');
  initColumn($('colPad'), () => { const q = Q && Q.qs[Q.i]; if (q) q.used = Math.max(q.used || 0, 2); });
  pt.addEventListener('input', () => { const p = pt.selectionStart, v = pt.value.replace(/\*/g, '×').replace(/\//g, ':').replace(/-/g, '−'); if (v !== pt.value) { pt.value = v; pt.setSelectionRange(p, p); } });
  document.querySelectorAll('#draft [data-ins]').forEach((b) => b.addEventListener('pointerdown', (e) => {
    e.preventDefault(); const k = b.dataset.ins === '↵' ? '\n' : ' ' + b.dataset.ins + ' ', a = pt.selectionStart ?? pt.value.length, z = pt.selectionEnd ?? a;
    pt.value = pt.value.slice(0, a) + k + pt.value.slice(z); const c = a + k.length; pt.focus({ preventScroll: true }); pt.setSelectionRange(c, c);
  }));
  $('draftClear').onclick = draftClear; $('draftClose').onclick = closeDraft;
  addEventListener('resize', () => { if (!$('draft').hidden) fitPaper(); });
}
function setMode(m) {
  dMode = m; ['type', 'draw', 'col'].forEach((k) => $('draft').classList.toggle(k, m === k));
  $('mType').classList.toggle('on', m === 'type'); $('mDraw').classList.toggle('on', m === 'draw'); $('mCol').classList.toggle('on', m === 'col');
  if (m === 'type') pt.focus({ preventScroll: true });
  if (m === 'col') { const q = Q && Q.qs[Q.i]; $('draft').classList.toggle('notest', !(Q && Q.mode === 'test')); showColumn(q ? exprFrom((q.expr || '') + ' ' + q.text) : null); }
}
function fitPaper() { const r = pc.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); if (!r.width) return; pc.width = r.width * d; pc.height = r.height * d; px.setTransform(d, 0, 0, d, 0, 0); redraw(); }
function redraw() { px.clearRect(0, 0, pc.width, pc.height); strokes.forEach(drawStroke); }
function drawStroke(s) {
  px.globalCompositeOperation = s.c === 'erase' ? 'destination-out' : 'source-over'; px.strokeStyle = s.c === 'erase' ? '#000' : s.c; px.lineWidth = s.c === 'erase' ? 24 : 3; px.lineCap = px.lineJoin = 'round';
  px.beginPath(); s.p.forEach((p, i) => (i ? px.lineTo(p[0], p[1]) : px.moveTo(p[0], p[1]))); if (s.p.length === 1) px.lineTo(s.p[0][0] + 0.1, s.p[0][1]); px.stroke(); px.globalCompositeOperation = 'source-over';
}
function draftClear() { strokes = []; if (px) redraw(); if (pt) pt.value = ''; if (dMode === 'col' && !$('draft').hidden) setMode('col'); else resetColumn(); }
function openDraft() { $('draft').hidden = false; $('quiz').classList.add('withdraft'); setMode(dMode); requestAnimationFrame(fitPaper); }
function closeDraft() { $('draft').hidden = true; $('quiz').classList.remove('withdraft'); }

export { pick };
