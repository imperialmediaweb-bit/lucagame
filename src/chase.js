// Portalurile de viteză: fugi pe o pistă, monstrul vine din spate, răspunsul corect te scapă.
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { mat, createAvatar, makeLabel } from './avatar.js';
import { SPEED, SPEED_IDS, timeFor } from './content/speed.js';
import { S, save, G, GRADE_NAMES } from './state.js';
import { SFX } from './audio.js';
import { toast, confetti, refreshHud, showPanel } from './ui.js';
import { apiCall, loggedIn } from './account.js';
import { NET, online, raceInvite as sendRaceInvite, raceReply, raceProgress } from './net.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const RZ0 = -420, RLEN = 700, SPEEDV = 7.5, GOAL = 12;
let gate = null;
let C = null, H = {}, monster, portals = [], R = null; // R = cursa cu colegii
export const chasing = () => !!(C && C.active);

export function initChase(scene, shadow, hooks, labelHook) {
  H = hooks;
  // pista: un drum lung spre -z, cu decor care se repetă la 20 de unități (ca să putem „sări” înapoi fără să se vadă)
  const road = MeshBuilder.CreateBox('road', { width: 8, height: 1, depth: RLEN }, scene); road.position.set(0, -0.5, RZ0 - RLEN / 2); road.material = mat(scene, '#5a5f6b'); road.receiveShadows = true;
  const grass = MeshBuilder.CreateBox('rgrass', { width: 60, height: 1, depth: RLEN }, scene); grass.position.set(0, -0.6, RZ0 - RLEN / 2); grass.material = mat(scene, '#5cb85c'); grass.receiveShadows = true;
  // pereți pe marginile pistei
  for (const x of [-4.4, 4.4]) { const w = MeshBuilder.CreateBox('rw' + x, { width: 0.8, height: 1.4, depth: RLEN }, scene); w.position.set(x, 0.7, RZ0 - RLEN / 2); w.material = mat(scene, '#4a2470'); const c = MeshBuilder.CreateBox('rwc' + x, { width: 1, height: 0.25, depth: RLEN }, scene); c.position.set(x, 1.5, RZ0 - RLEN / 2); c.material = mat(scene, '#7B5CF6', 0.4); }
  for (let z = RZ0; z > RZ0 - RLEN; z -= 4) { const m = MeshBuilder.CreateBox('rl' + z, { width: 0.3, height: 0.02, depth: 2 }, scene); m.position.set(0, 0.01, z); m.material = mat(scene, '#ffffff'); }
  for (let z = RZ0; z > RZ0 - RLEN; z -= 20) {
    [-6, 6].forEach((x, i) => {
      const t = MeshBuilder.CreateBox('rt' + z + i, { width: 0.8, height: 3, depth: 0.8 }, scene); t.position.set(x, 1.5, z); t.material = mat(scene, '#8a5a2b');
      const l = MeshBuilder.CreateBox('rtl' + z + i, { width: 2.6, height: 2.4, depth: 2.6 }, scene); l.position.set(x, 4, z); l.material = mat(scene, i ? '#3f9e4d' : '#4cb05a'); shadow.addShadowCaster(l);
    });
    const arch = MeshBuilder.CreateBox('ra' + z, { width: 9, height: 0.5, depth: 0.5 }, scene); arch.position.set(0, 6, z - 10); arch.material = mat(scene, '#f2b632', 0.3);
  }
  monster = createAvatar(scene, { skin: '#4a2470', shirt: '#14101c', pants: '#2b1645', hat: 'coarne', face: 'monstru' }, shadow, 'monster');
  // portalul de ieșire: apare când ai rezolvat toate exercițiile misiunii
  gate = new TransformNode('exitGate', scene);
  const gr = MeshBuilder.CreateTorus('exitRing', { diameter: 7, thickness: 0.6, tessellation: 48 }, scene); gr.parent = gate; gr.position.y = 3.6; gr.rotation.x = Math.PI / 2; gr.material = mat(scene, '#2EC4A6', 0.8);
  const gd = MeshBuilder.CreateDisc('exitDisc', { radius: 3.2, tessellation: 48 }, scene); gd.parent = gate; gd.position.y = 3.6; const gdm = mat(scene, '#7B5CF6', 0.9).clone('exitM'); gdm.alpha = 0.55; gdm.backFaceCulling = false; gd.material = gdm;
  const gl = makeLabel(scene, 'IEȘIRE', 'ai scăpat!', '#2EC4A6', 3); gl.parent = gate; gl.position.y = 8; labelHook && labelHook(gl);
  gate.setEnabled(false);
  monster.root.scaling.setAll(1.9); monster.root.position.set(0, 0, RZ0 + 50);

  // portalurile din piață
  const angs = [50, 80, 140, 170, 230, 260];
  SPEED_IDS.forEach((id, i) => {
    const p = SPEED[id], a = angs[i] * Math.PI / 180, x = Math.cos(a) * 14.5, z = Math.sin(a) * 14.5;
    const g = new TransformNode('portal' + id, scene); g.position.set(x, 0, z); g.rotation.y = Math.atan2(x, z);
    const ring = MeshBuilder.CreateTorus('pr' + id, { diameter: 3, thickness: 0.35, tessellation: 40 }, scene); ring.parent = g; ring.position.y = 1.7; ring.rotation.x = Math.PI / 2; ring.material = mat(scene, p.color, 0.6);
    const disc = MeshBuilder.CreateDisc('pd' + id, { radius: 1.35, tessellation: 40 }, scene); disc.parent = g; disc.position.y = 1.7; const dm = mat(scene, p.color, 0.9).clone('pdm' + id); dm.alpha = 0.45; dm.backFaceCulling = false; disc.material = dm;
    const lb = makeLabel(scene, p.name, p.sub, p.color, 3.2); lb.position.set(x, 4.2, z); labelHook && labelHook(lb);
    portals.push({ id, x, z, ring, disc, armed: true });
  });
  buildUI();
}

function buildUI() {
  const el = document.createElement('div'); el.id = 'chase'; el.hidden = true;
  el.innerHTML = `<div class="chrace" id="chRace" hidden></div><div class="chtop"><span id="chLives"></span><span id="chLvl"></span><span id="chScore"></span><button class="iconbtn" type="button" id="chQuit">Ieși</button></div>
    <div class="chcard"><div class="chgoal"><span id="chGoalT"></span><div class="chprog"><i id="chG"></i></div></div><div class="chbar"><i id="chT"></i></div><div class="chq" id="chQ"></div><div class="opts" id="chO"></div></div>`;
  document.body.appendChild(el);
  $('chQuit').onclick = () => end(true);
}

/* ---------- portalurile din piață ---------- */
export function updatePortals(dt, P, t) {
  for (const p of portals) {
    p.ring.rotation.z += dt * 1.5; p.disc.rotation.z -= dt;
    const d = Math.hypot(p.x - P.x, p.z - P.z);
    if (d > 3) p.armed = true;
    if (p.armed && d < 1.6 && P.y < 1.5 && !chasing()) { p.armed = false; portalPanel(p.id); }
  }
}
export function portalPanel(id) {
  const p = SPEED[id], best = (S.records || {})['portal-' + id];
  showPanel(`<div class="eyebrow">Portal de viteză · ${esc(p.sub)}</div><h2>${esc(p.name)}</h2>
    <p><b>Misiunea:</b> rezolvă corect <b>${GOAL} exerciții</b> ca să ajungi la portalul de ieșire. <b>Monstrul vine din spate</b> și te ajunge când se termină timpul la un exercițiu. Ai <b>3 vieți</b>: câte vieți îți rămân la final, atâtea stele primești.</p>
    <p>Timp pe exercițiu: <b>${timeFor(id, 1)} secunde</b> la început, tot mai puțin la fiecare nivel (minim ${SPEED[id].min} s).</p>
    ${best ? `<p>Recordul tău: <b>${best.score} puncte</b> · ${'★'.repeat(best.stars || 0)}${'☆'.repeat(3 - (best.stars || 0))}</p>` : ''}
    <div class="row"><button class="btn light" type="button" id="ppTop">Clasament</button><button class="btn light" type="button" data-close>Nu acum</button>${online() ? '<button class="btn" type="button" id="ppRace">Cheamă colegii la cursă</button>' : ''}<button class="btn" type="button" id="ppGo">Fugi singur</button></div>`);
  $('ppGo').onclick = () => { $('panel').hidden = true; start(id); };
  if ($('ppRace')) $('ppRace').onclick = () => { sendRaceInvite(id); };
  $('ppTop').onclick = () => showBoard('portal-' + id, p.name, () => portalPanel(id));
}

export async function showBoard(board, title, back) {
  showPanel(`<div class="eyebrow">Clasament · ${GRADE_NAMES[G()]}</div><h2>${esc(title)}</h2><p>Se încarcă…</p>`);
  try {
    const j = await apiCall(`top?board=${encodeURIComponent(board)}&grade=${G()}`);
    const medal = ['🥇', '🥈', '🥉'];
    showPanel(`<div class="eyebrow">Clasament · ${GRADE_NAMES[G()]}</div><h2>${esc(title)}</h2>
      ${j.top.length ? `<div class="jgrade">${j.top.map((r) => `<div class="jrow" style="grid-template-columns:34px minmax(0,1fr) auto${r.username === S.name ? ';border-color:var(--accent)' : ''}"><b>${medal[r.rank - 1] || r.rank + '.'}</b><span>${esc(r.username)}</span><b>${r.score}</b></div>`).join('')}</div>` : '<p>Încă nu e nimeni în clasament. Fii primul!</p>'}
      <p>${loggedIn() ? (j.me ? `Locul tău: <b>${j.me.rank}</b> cu ${j.me.score} puncte.` : 'Încă nu ai scor aici.') : 'Fă-ți profil (din Meniu) ca să apari în clasament.'}</p>
      <div class="row"><button class="btn" type="button" id="bBack">Înapoi</button></div>`);
  } catch (e) { showPanel(`<h2>${esc(title)}</h2><p>Clasamentul nu se poate încărca acum.</p><div class="row"><button class="btn" type="button" id="bBack">Înapoi</button></div>`); }
  $('bBack').onclick = back || (() => { $('panel').hidden = true; });
}

/* ---------- fuga ---------- */
function start(id, race) {
  C = { active: true, id, level: 1, lives: 3, score: 0, correct: 0, streak: 0, t0: performance.now(), gap: 10, gapStart: 10, qT: 8, qE: 0, q: null, lock: 0, finishing: false };
  gate.setEnabled(false);
  if (race) { C.race = race; C.qi = 0; C.laneX = laneX(race.myLane, race.lanes.length); }
  H.teleport(C.laneX || 0, RZ0 - 10, 0); H.setView(Math.PI);
  $('chRace').hidden = !race; if (race) drawRace();
  monster.root.position.set(0, 0, RZ0 + 2);
  $('chase').hidden = false; SFX.fanfare(); toast('Fugi! Răspunde repede!');
  nextQ(); drawTop();
}
function drawTop() {
  $('chLives').textContent = '❤'.repeat(C.lives) + '♡'.repeat(3 - C.lives);
  $('chLvl').textContent = 'Nivel ' + C.level; $('chScore').textContent = C.score + ' p';
  $('chGoalT').textContent = `Spre ieșire: ${Math.min(C.correct, GOAL)} / ${GOAL}`; $('chG').style.width = (100 * Math.min(1, C.correct / GOAL)) + '%';
}
function nextQ() {
  const p = SPEED[C.id], q = C.race ? (C.race.qs[C.qi++] || p.gen()) : p.gen(); C.q = q; C.qT = timeFor(C.id, C.level, q.kind); C.qE = 0; C.gapStart = Math.max(3, C.gap); C.lock = 0;
  $('chQ').textContent = q.expr + (SPEED[q.kind || C.id].text ? '' : ' = ?');
  $('chO').innerHTML = q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('');
  $('chO').querySelectorAll('[data-k]').forEach((b) => b.onpointerdown = (e) => { e.preventDefault(); answer(+b.dataset.k, b); });
}
function answer(k, btn) {
  if (!C || C.lock) return; C.lock = 1;
  const ok = C.q.opts[k] === C.q.ans;
  const st = S.stats['v-' + C.id] || (S.stats['v-' + C.id] = { ok: 0, bad: 0 }); ok ? st.ok++ : st.bad++;
  if (ok) {
    const left = 1 - C.qE / C.qT; C.correct++; C.streak++;
    C.score += 10 * C.level + Math.round(left * 10) + (C.streak >= 5 ? 5 : 0);
    C.gap = Math.min(14, C.gap + 4 + left * 3); btn.classList.add('right'); SFX.ok();
    if (C.correct >= GOAL) { finish(); drawTop(); return; }
    if (C.correct % 4 === 0) { C.level++; toast(`Nivelul ${C.level}! Monstrul e tot mai rapid.`); SFX.star(); }
  } else {
    C.streak = 0; C.gap *= 0.45; btn.classList.add('wrong'); SFX.no();
    $('chO').querySelectorAll('[data-k]').forEach((b, i) => { if (C.q.opts[i] === C.q.ans) b.classList.add('right'); });
  }
  drawTop(); if (C.race && !C.finishing) raceProgress(C.correct, C.lives, false);
  setTimeout(() => { if (!C || !C.active) return; if (C.gap < 1.2) caught(); else nextQ(); }, ok ? 250 : 900);
}
function finish() {
  // ai rezolvat tot: apare portalul de ieșire în față și fugi spre el
  C.finishing = true; C.lock = 1; $('chQ').textContent = 'Fugi spre portalul de ieșire!'; $('chO').innerHTML = '';
  gate.position.set(0, 0, H.getZ() - 24); gate.setEnabled(true); SFX.fanfare();
}
function caught() {
  C.lives--; SFX.boing(); drawTop();
  if (C.race) raceProgress(C.correct, C.lives, false);
  if (C.lives <= 0) return C.race ? endRaceLocal(false) : end(false);
  toast(`Te-a prins! Mai ai ${C.lives} ${C.lives === 1 ? 'viață' : 'vieți'}.`);
  C.gap = 9; nextQ();
}
function end(quit, win) {
  if (!C) return;
  const c = C; c.active = false; $('chase').hidden = true; gate.setEnabled(false);
  const stars = win ? c.lives : 0; if (win) c.score += 20 * stars;
  const ms = Math.round(performance.now() - c.t0), coins = Math.floor(c.score / 15);
  S.coins += coins; S.xp = (S.xp || 0) + c.correct * 6;
  S.records = S.records || {}; const prev = S.records['portal-' + c.id], rec = !prev || c.score > prev.score;
  if (rec && c.score > 0) S.records['portal-' + c.id] = { score: c.score, level: c.level, stars: Math.max(stars, (prev || {}).stars || 0) };
  else if (prev && stars > (prev.stars || 0)) prev.stars = stars;
  save(); refreshHud();
  if (loggedIn() && c.score > 0) apiCall('score', 'POST', { board: 'portal-' + c.id, score: c.score, ms }).catch(() => {});
  if (rec && c.score > 0) { SFX.fanfare(); confetti(); }
  H.teleport(portals.find((p) => p.id === c.id).x * 0.8, portals.find((p) => p.id === c.id).z * 0.8, 0.5);
  showPanel(`<div class="eyebrow">${esc(SPEED[c.id].name)}</div><h2>${win ? 'Misiune reușită! Ai scăpat!' : quit ? 'Ai ieșit din cursă' : 'Monstrul te-a prins. Misiune pierdută.'}</h2>
    <div class="big">${win ? `<span class="stars" style="font-size:56px">${'★'.repeat(stars)}<span class="off">${'★'.repeat(3 - stars)}</span></span>` : Math.min(c.correct, GOAL) + ' / ' + GOAL}</div>
    <p>${win ? `Ai ajuns la ieșire cu ${stars} ${stars === 1 ? 'viață' : 'vieți'}. ` : `Ai rezolvat ${Math.min(c.correct, GOAL)} din ${GOAL}. Mai încearcă! `}${rec && c.score > 0 ? '<b>Record nou!</b> ' : ''}${c.score} puncte · ${Math.round(ms / 1000)} secunde. Ai câștigat <b>${coins} monede</b>.</p>
    <div class="row"><button class="btn light" type="button" id="ceTop">Clasament</button><button class="btn light" type="button" data-close>Pe insulă</button><button class="btn" type="button" id="ceAgain">Încă o dată</button></div>`);
  $('ceAgain').onclick = () => { $('panel').hidden = true; start(c.id); };
  $('ceTop').onclick = () => showBoard('portal-' + c.id, SPEED[c.id].name);
  C = null;
}

/** Pasul de joc pentru fugă: mută jucătorul și monstrul. Întoarce true când fuga e activă. */
export function updateChase(dt, P) {
  if (!chasing()) { monster.update(dt, {}); return false; }
  if (!document.getElementById('panel').hidden) return true; // pauză cât e deschis un panou
  if (!C.finishing) C.qE += dt;
  const frac = Math.min(1, C.qE / C.qT);
  C.gap = C.lock ? C.gap : C.gapStart * (1 - frac);
  $('chT').style.width = (100 * (1 - frac)) + '%';
  $('chT').style.background = frac > 0.7 ? 'var(--bad)' : 'var(--accent)';
  P.z -= SPEEDV * dt; P.x += ((C.laneX || 0) - P.x) * Math.min(1, dt * 5); P.y = 0; P.vy = 0;
  if (C.race) placeRivals(dt, P);
  if (P.z < RZ0 - RLEN + 120) { P.z += 400; if (C.finishing) gate.position.z += 400; } // banda se repetă
  if (C.finishing) { C.gap = Math.min(16, C.gap + dt * 3); gate.getChildMeshes()[0].rotation.z += dt * 2; if (P.z <= gate.position.z) { if (C.race) { raceProgress(C.correct, C.lives, true); endRaceLocal(true); } else end(false, true); return true; } }
  monster.root.position.set(0, 0, P.z + 1.3 + C.gap);
  monster.root.rotation.y = Math.PI;
  monster.update(dt, { speed: 1 });
  if (!C.lock && !C.finishing && frac >= 1) { C.lock = 1; caught(); }
  return true;
}
/* ---------- cursa cu colegii ---------- */
const laneX = (i, n) => (n <= 1 ? 0 : [-2.6, 0, 2.6][i % 3]);
const rName = (id) => ((R && R.lanes.find((l) => l.id === id)) || {}).name || 'coleg';
function drawRace() {
  if (!R) return;
  const list = R.lanes.map((l) => ({ ...l, ...(R.prog[l.id] || { correct: 0, lives: 3 }) })).sort((a, b) => (b.done - a.done) || b.correct - a.correct);
  const html = list.map((x, i) => `<span class="${x.id === NET.you ? 'me' : ''}">${i + 1}. ${esc(x.name)} ${x.done ? '🏁' : x.out ? '✖' : x.correct + '/' + R.goal}</span>`).join('');
  const el = $('chRace'); if (el) el.innerHTML = html;
  const w = $('raceWait'); if (w) w.innerHTML = html;
}
function placeRivals(dt, P) {
  for (const l of R.lanes) {
    if (l.id === NET.you) continue;
    const o = NET.others.get(l.id); if (!o) continue;
    const pr = R.prog[l.id] || { correct: 0 };
    o.race = true;
    const r = o.av.root, tz = P.z - (pr.correct - C.correct) * 4.5;
    r.position.x += (laneX(l.lane, R.lanes.length) - r.position.x) * Math.min(1, dt * 5);
    r.position.z += (tz - r.position.z) * Math.min(1, dt * 4); r.position.y = 0; r.rotation.y = Math.PI;
    o.av.update(dt, { speed: pr.out || pr.done ? 0 : 1, dance: !!pr.done });
  }
}
function endRaceLocal(done) {
  if (!C) return;
  const c = C; c.active = false; $('chase').hidden = true; gate.setEnabled(false);
  if (done) { SFX.fanfare(); confetti(); }
  showPanel(`<div class="eyebrow">Cursa monștrilor · ${esc(SPEED[c.id].name)}</div><h2>${done ? 'Ai ajuns la ieșire!' : 'Monstrul te-a prins!'}</h2>
    <p>${done ? 'Așteptăm să termine și colegii…' : `Ai rezolvat ${c.correct} din ${R ? R.goal : GOAL}. Urmărește cum termină colegii…`}</p>
    <div class="chrace" id="raceWait"></div>`);
  $('panel').dataset.lock = '1'; drawRace(); C = null;
}
export function raceInviteUI(m) {
  if (m.from === NET.you) {
    showPanel(`<div class="eyebrow">Cursa monștrilor</div><h2>Ai chemat colegii!</h2><p>Așteptăm să răspundă (cel mult 12 secunde)…</p><div class="chrace" id="raceWait"><span>${esc(m.name)} ✔</span></div>`);
    return;
  }
  SFX.talk();
  showPanel(`<div class="eyebrow">Invitație</div><h2>${esc(m.name)} te cheamă la cursă!</h2>
    <p>Fugiți împreună în <b>${esc(SPEED[m.portal].name)}</b> (${esc(SPEED[m.portal].sub)}). Aceleași exerciții pentru toți, fiecare cu monstrul lui. Câștigă cine ajunge primul la ieșire!</p>
    <div class="row"><button class="btn light" type="button" id="rNo">Nu acum</button><button class="btn" type="button" id="rYes">Intru în cursă!</button></div>`);
  $('rYes').onclick = () => { raceReply(true); showPanel(`<div class="eyebrow">Cursa monștrilor</div><h2>Ești în cursă!</h2><p>Pornim imediat ce răspund toți…</p><div class="chrace" id="raceWait"></div>`); };
  $('rNo').onclick = () => { raceReply(false); $('panel').hidden = true; };
}
export function raceLobbyUI(m) {
  const w = $('raceWait'); if (!w) return;
  const names = (id) => ((NET.room && NET.room.players.find((p) => p.id === id)) || {}).name || 'coleg';
  w.innerHTML = m.joined.map((id) => `<span>${esc(names(id))} ✔</span>`).join('') + m.declined.map((id) => `<span>${esc(names(id))} ✖</span>`).join('');
}
export function raceStartUI(m) {
  const me = m.lanes.find((l) => l.id === NET.you);
  R = { portal: m.portal, goal: m.goal, lanes: m.lanes, prog: {}, joined: !!me };
  if (!me) { toast(`Colegii au pornit cursa în ${SPEED[m.portal].name}.`); return; }
  delete $('panel').dataset.lock; $('panel').hidden = true;
  start(m.portal, { qs: m.qs, lanes: m.lanes, myLane: me.lane });
  toast(m.lanes.length > 1 ? `Cursă cu ${m.lanes.length} jucători! Fugi!` : 'Nu a venit nimeni, fugi singur!');
}
export function raceProgUI(m) { if (!R) return; R.prog[m.id] = m; drawRace(); }
export function raceEndUI(m) {
  if (!R || !R.joined) { R = null; return; }
  for (const o of NET.others.values()) o.race = false;
  if (C) { C.active = false; $('chase').hidden = true; gate.setEnabled(false); C = null; }
  const idx = m.ranking.findIndex((r) => r.id === NET.you), me = m.ranking[idx];
  const prize = me && me.done ? [60, 40, 25][idx] || 10 : 5;
  S.coins += prize; S.xp = (S.xp || 0) + (me ? me.correct * 6 : 0); save(); refreshHud();
  if (idx === 0 && me.done) { SFX.fanfare(); confetti(); }
  const p0 = portals.find((p) => p.id === m.portal); H.teleport(p0.x * 0.8, p0.z * 0.8, 0.5);
  const medal = ['🥇', '🥈', '🥉'], fmt = (ms) => `${Math.floor(ms / 60000)}:${String(Math.round(ms / 1000) % 60).padStart(2, '0')}`;
  delete $('panel').dataset.lock;
  showPanel(`<div class="eyebrow">Cursa monștrilor · ${esc(SPEED[m.portal].name)}</div><h2>${idx === 0 && me.done ? 'Ai câștigat cursa!' : idx >= 0 ? `Locul ${idx + 1}` : 'Rezultate'}</h2>
    <div class="jgrade">${m.ranking.map((r, i) => `<div class="jrow" style="grid-template-columns:34px minmax(0,1fr) auto${r.id === NET.you ? ';border-color:var(--accent)' : ''}"><b>${r.done ? medal[i] || i + 1 + '.' : '–'}</b><span>${esc(r.name)}</span><small>${r.done ? '🏁 ' + fmt(r.ms) : `prins la ${r.correct}/${R.goal}`}</small></div>`).join('')}</div>
    <p>Ai primit <b>${prize} monede</b>.</p>
    <div class="row"><button class="btn light" type="button" data-close>Pe insulă</button><button class="btn" type="button" id="reAgain">Altă cursă</button></div>`);
  $('reAgain').onclick = () => { $('panel').hidden = true; sendRaceInvite(m.portal); };
  R = null;
}
export { RZ0 };
