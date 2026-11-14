// Portalurile de viteză: fugi pe o pistă, monstrul vine din spate, răspunsul corect te scapă.
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { mat, createAvatar, makeLabel } from './avatar.js';
import { SPEED, SPEED_IDS, timeFor } from './content/speed.js';
import { S, save } from './state.js';
import { SFX } from './audio.js';
import { toast, confetti, refreshHud, showPanel } from './ui.js';
import { apiCall, loggedIn } from './account.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const RZ0 = -420, RLEN = 700, SPEEDV = 7.5;
let C = null, H = {}, monster, portals = [];
export const chasing = () => !!(C && C.active);

export function initChase(scene, shadow, hooks, labelHook) {
  H = hooks;
  // pista: un drum lung spre -z, cu decor care se repetă la 20 de unități (ca să putem „sări” înapoi fără să se vadă)
  const road = MeshBuilder.CreateBox('road', { width: 8, height: 1, depth: RLEN }, scene); road.position.set(0, -0.5, RZ0 - RLEN / 2); road.material = mat(scene, '#5a5f6b'); road.receiveShadows = true;
  const grass = MeshBuilder.CreateBox('rgrass', { width: 60, height: 1, depth: RLEN }, scene); grass.position.set(0, -0.6, RZ0 - RLEN / 2); grass.material = mat(scene, '#5cb85c'); grass.receiveShadows = true;
  for (let z = RZ0; z > RZ0 - RLEN; z -= 4) { const m = MeshBuilder.CreateBox('rl' + z, { width: 0.3, height: 0.02, depth: 2 }, scene); m.position.set(0, 0.01, z); m.material = mat(scene, '#ffffff'); }
  for (let z = RZ0; z > RZ0 - RLEN; z -= 20) {
    [-6, 6].forEach((x, i) => {
      const t = MeshBuilder.CreateBox('rt' + z + i, { width: 0.8, height: 3, depth: 0.8 }, scene); t.position.set(x, 1.5, z); t.material = mat(scene, '#8a5a2b');
      const l = MeshBuilder.CreateBox('rtl' + z + i, { width: 2.6, height: 2.4, depth: 2.6 }, scene); l.position.set(x, 4, z); l.material = mat(scene, i ? '#3f9e4d' : '#4cb05a'); shadow.addShadowCaster(l);
    });
    const arch = MeshBuilder.CreateBox('ra' + z, { width: 9, height: 0.5, depth: 0.5 }, scene); arch.position.set(0, 6, z - 10); arch.material = mat(scene, '#f2b632', 0.3);
  }
  monster = createAvatar(scene, { skin: '#6fd04a', shirt: '#4b3cc4', pants: '#2b2f38', hat: 'urechi', face: 'robot' }, shadow, 'monster');
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
  el.innerHTML = `<div class="chtop"><span id="chLives"></span><span id="chLvl"></span><span id="chScore"></span><button class="iconbtn" type="button" id="chQuit">Ieși</button></div>
    <div class="chcard"><div class="chbar"><i id="chT"></i></div><div class="chq" id="chQ"></div><div class="opts" id="chO"></div></div>`;
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
    <p>Fugi pe pistă! <b>Monstrul vine din spate</b> și te ajunge când se termină timpul. Răspunde corect și repede ca să scapi. Ai <b>3 vieți</b>.</p>
    <p>Timp pe exercițiu: <b>${timeFor(id, 1)} secunde</b> la început, tot mai puțin la fiecare nivel (minim ${SPEED[id].min} s).</p>
    ${best ? `<p>Recordul tău: <b>${best.score} puncte</b> · nivelul ${best.level}</p>` : ''}
    <div class="row"><button class="btn light" type="button" id="ppTop">Clasament</button><button class="btn light" type="button" data-close>Nu acum</button><button class="btn" type="button" id="ppGo">Fugi!</button></div>`);
  $('ppGo').onclick = () => { $('panel').hidden = true; start(id); };
  $('ppTop').onclick = () => showBoard('portal-' + id, p.name, () => portalPanel(id));
}

export async function showBoard(board, title, back) {
  showPanel(`<div class="eyebrow">Clasament · ${['', 'clasa I', 'clasa a II-a', 'clasa a III-a'][S.grade || 3]}</div><h2>${esc(title)}</h2><p>Se încarcă…</p>`);
  try {
    const j = await apiCall(`top?board=${encodeURIComponent(board)}&grade=${S.grade || 3}`);
    const medal = ['🥇', '🥈', '🥉'];
    showPanel(`<div class="eyebrow">Clasament · ${['', 'clasa I', 'clasa a II-a', 'clasa a III-a'][S.grade || 3]}</div><h2>${esc(title)}</h2>
      ${j.top.length ? `<div class="jgrade">${j.top.map((r) => `<div class="jrow" style="grid-template-columns:34px minmax(0,1fr) auto${r.username === S.name ? ';border-color:var(--accent)' : ''}"><b>${medal[r.rank - 1] || r.rank + '.'}</b><span>${esc(r.username)}</span><b>${r.score}</b></div>`).join('')}</div>` : '<p>Încă nu e nimeni în clasament. Fii primul!</p>'}
      <p>${loggedIn() ? (j.me ? `Locul tău: <b>${j.me.rank}</b> cu ${j.me.score} puncte.` : 'Încă nu ai scor aici.') : 'Fă-ți profil (din Meniu) ca să apari în clasament.'}</p>
      <div class="row"><button class="btn" type="button" id="bBack">Înapoi</button></div>`);
  } catch (e) { showPanel(`<h2>${esc(title)}</h2><p>Clasamentul nu se poate încărca acum.</p><div class="row"><button class="btn" type="button" id="bBack">Înapoi</button></div>`); }
  $('bBack').onclick = back || (() => { $('panel').hidden = true; });
}

/* ---------- fuga ---------- */
function start(id) {
  C = { active: true, id, level: 1, lives: 3, score: 0, correct: 0, streak: 0, t0: performance.now(), gap: 10, gapStart: 10, qT: 8, qE: 0, q: null, lock: 0 };
  H.teleport(0, RZ0 - 10, 0); H.setView(Math.PI);
  monster.root.position.set(0, 0, RZ0 + 2);
  $('chase').hidden = false; SFX.fanfare(); toast('Fugi! Răspunde repede!');
  nextQ(); drawTop();
}
function drawTop() {
  $('chLives').textContent = '❤'.repeat(C.lives) + '♡'.repeat(3 - C.lives);
  $('chLvl').textContent = 'Nivel ' + C.level; $('chScore').textContent = C.score + ' p';
}
function nextQ() {
  const p = SPEED[C.id], q = p.gen(); C.q = q; C.qT = timeFor(C.id, C.level, q.kind); C.qE = 0; C.gapStart = Math.max(3, C.gap); C.lock = 0;
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
    if (C.correct % 5 === 0) { C.level++; toast(`Nivelul ${C.level}! Monstrul e tot mai rapid.`); SFX.star(); }
  } else {
    C.streak = 0; C.gap *= 0.45; btn.classList.add('wrong'); SFX.no();
    $('chO').querySelectorAll('[data-k]').forEach((b, i) => { if (C.q.opts[i] === C.q.ans) b.classList.add('right'); });
  }
  drawTop();
  setTimeout(() => { if (!C || !C.active) return; if (C.gap < 1.2) caught(); else nextQ(); }, ok ? 250 : 900);
}
function caught() {
  C.lives--; SFX.boing(); drawTop();
  if (C.lives <= 0) return end(false);
  toast(`Te-a prins! Mai ai ${C.lives} ${C.lives === 1 ? 'viață' : 'vieți'}.`);
  C.gap = 9; nextQ();
}
function end(quit) {
  if (!C) return;
  const c = C; c.active = false; $('chase').hidden = true;
  const ms = Math.round(performance.now() - c.t0), coins = Math.floor(c.score / 15);
  S.coins += coins; S.xp = (S.xp || 0) + c.correct * 6;
  S.records = S.records || {}; const prev = S.records['portal-' + c.id], rec = !prev || c.score > prev.score;
  if (rec && c.score > 0) S.records['portal-' + c.id] = { score: c.score, level: c.level };
  save(); refreshHud();
  if (loggedIn() && c.score > 0) apiCall('score', 'POST', { board: 'portal-' + c.id, score: c.score, ms }).catch(() => {});
  if (rec && c.score > 0) { SFX.fanfare(); confetti(); }
  H.teleport(portals.find((p) => p.id === c.id).x * 0.8, portals.find((p) => p.id === c.id).z * 0.8, 0.5);
  showPanel(`<div class="eyebrow">${esc(SPEED[c.id].name)}</div><h2>${quit ? 'Ai ieșit din cursă' : 'Monstrul te-a prins!'}</h2>
    <div class="big">${c.score} p</div>
    <p>${rec && c.score > 0 ? '<b>Record nou!</b> ' : ''}Nivelul ${c.level} · ${c.correct} răspunsuri corecte · ${Math.round(ms / 1000)} secunde. Ai câștigat <b>${coins} monede</b>.</p>
    <div class="row"><button class="btn light" type="button" id="ceTop">Clasament</button><button class="btn light" type="button" data-close>Pe insulă</button><button class="btn" type="button" id="ceAgain">Încă o dată</button></div>`);
  $('ceAgain').onclick = () => { $('panel').hidden = true; start(c.id); };
  $('ceTop').onclick = () => showBoard('portal-' + c.id, SPEED[c.id].name);
  C = null;
}

/** Pasul de joc pentru fugă: mută jucătorul și monstrul. Întoarce true când fuga e activă. */
export function updateChase(dt, P) {
  if (!chasing()) { monster.update(dt, {}); return false; }
  if (!document.getElementById('panel').hidden) return true; // pauză cât e deschis un panou
  C.qE += dt;
  const frac = Math.min(1, C.qE / C.qT);
  C.gap = C.lock ? C.gap : C.gapStart * (1 - frac);
  $('chT').style.width = (100 * (1 - frac)) + '%';
  $('chT').style.background = frac > 0.7 ? 'var(--bad)' : 'var(--accent)';
  P.z -= SPEEDV * dt; P.x += (0 - P.x) * Math.min(1, dt * 5); P.y = 0; P.vy = 0;
  if (P.z < RZ0 - RLEN + 120) P.z += 400; // banda se repetă
  monster.root.position.set(0, 0, P.z + 1.3 + C.gap);
  monster.root.rotation.y = Math.PI;
  monster.update(dt, { speed: 1 });
  if (!C.lock && frac >= 1) { C.lock = 1; caught(); }
  return true;
}
export { RZ0 };
