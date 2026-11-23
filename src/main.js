// Mintoria: motorul jocului (Babylon.js), personajul, controalele și legătura cu ecranele.
import { Engine } from '@babylonjs/core/Engines/engine';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Scene } from '@babylonjs/core/scene';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
import { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import { GlowLayer } from '@babylonjs/core/Layers/glowLayer';
import '@babylonjs/core/Layers/effectLayerSceneComponent';
import { LABELS, mat } from './avatar.js';
import { S, save, areaLocked, GRADE_NAMES } from './state.js';
import { SFX } from './audio.js';
import { createAvatar } from './avatar.js';
import { buildWorld } from './world.js';
import { initUI, refreshHud, toast, paused, talkTo, showTutorial, tickTime, nextMission, confetti, showPanel, askOne } from './ui.js';
import { initNet, tick as netTick, sendLook, NET, joinRoom } from './net.js';
import { startFlow, profileMenu, loggedIn } from './account.js';
import { requestJoin } from './social.js';
import { Music } from './music.js';
import { chasing } from './chase.js';
import { initChase, updateChase, updatePortals, portalPanel, raceInviteUI, raceLobbyUI, raceStartUI, raceProgUI, raceEndUI } from './chase.js';
import { AREAS } from './content/missions.js';
import { initHome, openHome } from './home.js';
import { accOn } from './accessories.js';
import { MOVERS as FUN_MOVERS } from './worlds/fun.js';
import { initSeason } from './season.js';
import { initNatura } from './natura.js';
import { initWorlds, updateWorlds, worldAt, currentWorld } from './worlds/index.js';
import { offerPlacement } from './placement.js';
window.__portal = (id) => portalPanel(id);
import { openLobby, openCreate, roomChanged, mpGameStart, mpQuestion, mpAnswered, mpReveal, mpEnd, classStart, classProgress, classEnd, setClassHooks, summonUI } from './mpui.js';

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const engine = new Engine(canvas, true, { preserveDrawingBuffer: false, stencil: true, adaptToDeviceRatio: false });
const COARSE = matchMedia('(pointer:coarse)').matches; // telefon/tabletă: grafică mai ușoară, ca să meargă fluid
engine.setHardwareScalingLevel(1 / Math.min(window.devicePixelRatio || 1, COARSE ? 1.5 : 1.75));
const scene = new Scene(engine);
scene.clearColor = Color4.FromHexString('#8fd3f0ff');
scene.ambientColor = new Color3(0.3, 0.3, 0.3);
scene.fogMode = Scene.FOGMODE_LINEAR; scene.fogColor = Color3.FromHexString('#8fd3f0'); scene.fogStart = 60; scene.fogEnd = 160;

const camera = new FreeCamera('cam', new Vector3(0, 6, 14), scene);
camera.inputs.clear(); camera.minZ = 0.1; camera.fov = 1.0; camera.maxZ = 260; scene.skipPointerMovePicking = true;

const hemi = new HemisphericLight('h', new Vector3(0.2, 1, 0.1), scene);
hemi.intensity = 0.75; hemi.groundColor = Color3.FromHexString('#6aa060');
const sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.35), scene);
sun.position = new Vector3(30, 60, 25); sun.intensity = 0.9;
const shadow = new ShadowGenerator(COARSE ? 512 : 1024, sun);
shadow.usePercentageCloserFiltering = true; shadow.bias = 0.002; shadow.darkness = 0.35;
sun.autoUpdateExtends = false; sun.shadowMinZ = 1; sun.shadowMaxZ = 150; sun.orthoLeft = -30; sun.orthoRight = 30; sun.orthoTop = 30; sun.orthoBottom = -30;
if (COARSE) shadow.filteringQuality = ShadowGenerator.QUALITY_LOW;
const glow = new GlowLayer('glow', scene, { blurKernelSize: COARSE ? 16 : 32, mainTextureRatio: COARSE ? 0.35 : 0.5 }); glow.intensity = 0.4;
if (COARSE) glow.isEnabled = false; // pe telefon fără strălucire: mult mai fluid

const W = buildWorld(scene, shadow);
const me = createAvatar(scene, S.look, shadow, 'luca');
// accesoriile vizibile: skateboard sub picioare, aripi pe spate
const gear = (() => {
  const board = MeshBuilder.CreateBox('skate', { width: 0.75, height: 0.08, depth: 1.5 }, scene); board.material = mat(scene, '#ff7a2f'); board.parent = me.root; board.position.y = 0.04;
  [-0.55, 0.55].forEach((z) => [-0.28, 0.28].forEach((x) => { const w = MeshBuilder.CreateCylinder('wh', { diameter: 0.16, height: 0.1 }, scene); w.rotation.z = Math.PI / 2; w.material = mat(scene, '#1F2B3A'); w.parent = board; w.position.set(x, -0.08, z); }));
  const wings = [-1, 1].map((sd) => { const w = MeshBuilder.CreateBox('wing', { width: 1.3, height: 0.85, depth: 0.06 }, scene); w.material = mat(scene, '#ffffff', 0.35); w.parent = me.root; w.position.set(sd * 0.75, 1.85, -0.3); w.rotation.z = sd * 0.35; return w; });
  return { board, wings };
})();
LABELS.forEach((l) => glow.addExcludedMesh(l));
let yaw0 = Math.atan2(W.spawn.x, W.spawn.z);

/* ---------- fizică simplă cu cutii ---------- */
const P = { x: W.spawn.x, y: W.spawn.y, z: W.spawn.z, vy: 0, ground: false, coyote: 0 }, R = 0.42, HGT = 2.5;
const hitAt = (px, py, pz) => { for (const b of W.colliders) if (px + R > b.x1 && px - R < b.x2 && pz + R > b.z1 && pz - R < b.z2 && py < b.y2 - 0.01 && py + HGT > b.y1) return b; return null; };
function moveAxis(ax, d) {
  if (!d) return; const nx = ax === 'x' ? P.x + d : P.x, nz = ax === 'z' ? P.z + d : P.z, b = hitAt(nx, P.y, nz);
  if (!b) { P.x = nx; P.z = nz; return; }
  if (P.ground && b.y2 - P.y <= 0.55 && !hitAt(nx, b.y2, nz)) { P.x = nx; P.z = nz; P.y = b.y2; }
}
let jumpReq = false, jumpHeld = false, standing = null;
function physics(dt, mx, mz) {
  moveAxis('x', mx * dt); moveAxis('z', mz * dt);
  if (accOn('zbor')) { // rucsacul zburător: urci cât ții apăsat, apoi plutești ușor în jos
    if (jumpHeld || keys.Space) P.vy = P.y > 38 ? Math.min(P.vy, 0) : Math.min(P.vy + 45 * dt, 7);
    else if (P.vy < -4) P.vy = -4;
  }
  P.vy -= 30 * dt; let ny = P.y + P.vy * dt; P.ground = false; standing = null;
  if (P.vy <= 0) {
    let land = -1e9, lb = null;
    for (const b of W.colliders) if (P.x + R > b.x1 && P.x - R < b.x2 && P.z + R > b.z1 && P.z - R < b.z2 && P.y >= b.y2 - 0.08 && ny <= b.y2 && b.y2 > land) { land = b.y2; lb = b; }
    if (lb) { ny = land; P.vy = 0; P.ground = true; standing = lb; if (lb.bounce) { P.vy = lb.bounce; P.ground = false; SFX.boing(); } }
  } else {
    for (const b of W.colliders) if (P.x + R > b.x1 && P.x - R < b.x2 && P.z + R > b.z1 && P.z - R < b.z2 && P.y + HGT <= b.y1 + 0.08 && ny + HGT > b.y1) { ny = b.y1 - HGT; P.vy = 0; }
  }
  P.y = ny; P.coyote = P.ground ? 0.12 : Math.max(0, P.coyote - dt);
  if (P.ground) P.dj = false;
  if (jumpReq && P.coyote > 0) { P.vy = accOn('arc') ? 14.5 : 11; P.coyote = 0; P.ground = false; SFX.jump(); }
  else if (jumpReq && !P.dj && accOn('aripi') && !P.ground) { P.vy = 10.5; P.dj = true; SFX.boing(); } // aripile: săritură dublă
  jumpReq = false;
  if (P.y < -6) { const w = worldAt(P); if (w) { teleport(w.spawn.x, w.spawn.z, w.spawn.y); toast('Hopa! Înapoi la intrare.'); } else { teleport(W.spawn.x, W.spawn.z); toast('Hopa! Înapoi în piață.'); } }
}
let cullT = 0;
function teleport(x, z, y = 0.5) { P.x = x; P.z = z; P.y = y; P.vy = 0; cullT = 0; }
if (location.hostname === 'localhost') window.__dbg = { scene, engine, glow: () => glow, P, teleport: (x, z, y) => teleport(x, z, y), setYaw: (y) => { yaw = y; yawS = y; }, W, areaLocked };

/* ---------- control ---------- */
const CAM_SPEED = { incet: 0.0025, mediu: 0.0045, rapid: 0.007 };
let dragAcc = 0, yawS = yaw0, face = 0;
const keys = {}; let yaw = yaw0, pitch = 0.38, camDist = 10, jx = 0, jy = 0, stickId = null, camId = null, sx = 0, sy = 0, lx = 0, ly = 0;
// ecran tactil: unele telefoane nu raportează „pointer:coarse”, deci verificăm și atingerile
const touch = matchMedia('(pointer:coarse)').matches || navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
if (touch) { $('jump').hidden = false; $('stickHome').hidden = false; } else $('keys').hidden = false;
const stop = () => { for (const k in keys) keys[k] = false; jx = jy = 0; jumpHeld = false; stickId = null; $('stick').hidden = true; };
addEventListener('keydown', (e) => {
  if (paused() || e.target.tagName === 'TEXTAREA') return;
  keys[e.code] = true;
  if (e.code === 'Space') { jumpReq = true; e.preventDefault(); }
  if ((e.code === 'KeyE' || e.code === 'Enter') && !$('act').hidden) $('act').click();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
canvas.addEventListener('pointerdown', (e) => {
  if (paused()) return;
  if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.45 && e.clientY > innerHeight * 0.3 && stickId === null) {
    stickId = e.pointerId; sx = e.clientX; sy = e.clientY; const st = $('stick'); st.style.left = sx + 'px'; st.style.top = sy + 'px'; st.hidden = false; $('stickHome').style.opacity = 0;
  } else if (camId === null) { camId = e.pointerId; lx = e.clientX; ly = e.clientY; dragAcc = 0; }
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerId === stickId) { let dx = e.clientX - sx, dy = e.clientY - sy; const l = Math.hypot(dx, dy), m = 50; if (l > m) { dx *= m / l; dy *= m / l; } jx = dx / m; jy = dy / m; $('knob').style.transform = `translate(${dx}px,${dy}px)`; }
  else if (e.pointerId === camId) {
    // camera se rotește încet; primii pixeli sunt ignorați ca să nu se miște la o atingere scurtă
    const dx = e.clientX - lx, dy = e.clientY - ly; dragAcc += Math.abs(dx) + Math.abs(dy); lx = e.clientX; ly = e.clientY;
    if (dragAcc < 10) return;
    const k = CAM_SPEED[S.camSpeed || 'incet'];
    yaw -= dx * k; pitch = Math.max(0.15, Math.min(1.0, pitch + dy * k * 0.6));
  }
});
const endPtr = (e) => { if (e.pointerId === stickId) { stickId = null; jx = jy = 0; $('stick').hidden = true; $('knob').style.transform = ''; $('stickHome').style.opacity = ''; } if (e.pointerId === camId) camId = null; };
canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
canvas.addEventListener('wheel', (e) => { camDist = Math.max(5, Math.min(18, camDist + e.deltaY * 0.01)); e.preventDefault(); }, { passive: false });
$('jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jumpReq = true; jumpHeld = true; });
['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => $('jump').addEventListener(ev, () => { jumpHeld = false; }));

/* ---------- interacțiune ---------- */
let near = null, cheerT = 0;
$('act').addEventListener('click', () => {
  if (!near) return;
  if (near.type === 'npc') talkTo(near.n.m);
  if (near.type === 'chest') openChest(near.c);
});
function openChest(c) {
  const today = Math.floor(Date.now() / 86400000);
  if (S.chests[c.id] === today) { toast('Ai deschis-o azi. Revino mâine pentru altă comoară!'); return; }
  S.chests[c.id] = today; S.coins += 25; save(); refreshHud(); c.open = 0.001; SFX.fanfare(); confetti(); cheerT = 2;
  toast('Comoară! +25 de monede');
}
function goTo(m) {
  const n = W.npcs.find((x) => x.m.id === m.id) || (m.hidden && W.npcs.find((x) => x.m.hub === m.subject)); if (!n) return;
  if (m.boss) teleport(n.x, n.z - 6, 0.5);
  else { const dx = n.area.pos[0] - n.x, dz = n.area.pos[1] - n.z, l = Math.hypot(dx, dz) || 1; teleport(n.x + dx / l * 2.6, n.z + dz / l * 2.6, n.top + 0.5); }
  yaw = Math.atan2(P.x - n.x, P.z - n.z);
  toast(`Ai ajuns la ${m.npc}!`);
}
function applyLocks() {
  for (const [id, g] of Object.entries(W.gates)) {
    const locked = areaLocked(id);
    g.bar.isVisible = locked; g.lbl.isVisible = locked; g.col.y1 = locked ? g.y1 : -100; g.col.y2 = locked ? g.y2 : -99;
  }
  W.pads.forEach((p) => { p.ring.isVisible = !areaLocked(p.area.id); });
}
// ce muzică se potrivește acum: fugă, exerciții, test, duel, atelier sau lumea în care ești
const AREA_MUSIC = { '0': 'playful', '1': 'playful', '2': 'forest', '3': 'castle', '4': 'mountain', T: 'arena' };
function musicFor() {
  if (chasing()) return 'chase';
  { const w = currentWorld(); if (w && $('quiz').hidden) return w.fight && w.fight.on ? 'boss' : w.music; if (w && w.fight && w.fight.on) return 'boss'; }
  if (!$('quiz').hidden) return { test: 'test', class: 'test', duel: 'boss', team: 'boss', atelier: 'think', mission: 'mission', daily: 'mission' }[document.body.dataset.act] || 'mission';
  const a = AREAS.find((q) => Math.abs(P.x - q.pos[0]) < 19 && Math.abs(P.z - q.pos[1]) < 19);
  return a ? AREA_MUSIC[a.id] || 'chill' : 'chill';
}
function missionsChanged() {
  applyLocks();
  W.npcs.forEach((n) => { const st = (S.missions[n.m.id] || {}).stars || 0; n.bang.isVisible = st === 0; n.done.isVisible = st > 0; });
}
missionsChanged();

const multiplayer = () => (NET.room ? openLobby() : openCreate());
initUI({ setLook: (l) => { me.setLook(l); sendLook(); }, goTo, stop, missionsChanged, multiplayer, cheer: () => { cheerT = 1.4; } });
initNet({ scene, shadow, glow, ui: { toast, roomChanged, openLobby, mpGameStart, mpQuestion, mpAnswered, mpReveal, mpEnd, classStart, classProgress, classEnd, raceInvite: raceInviteUI, raceLobby: raceLobbyUI, raceStart: raceStartUI, raceProg: raceProgUI, raceEnd: raceEndUI, summon: (m) => summonUI(m) } });
let seated = false;
initChase(scene, shadow, { getZ: () => P.z, teleport: (x, z, y = 0) => teleport(x, z, y), setView: (y) => { yaw = y; yawS = y; face = Math.PI; seated = false; } }, (l) => glow.addExcludedMesh(l));
const CR = W.classroom;
setClassHooks({
  toSeat: (i) => { const st = CR.seats[i % CR.seats.length]; teleport(st.x, st.z, st.y); face = Math.PI; yaw = 0; seated = true; },
  toPodium: (place) => { const p = CR.podium[place]; teleport(p.x, p.z, p.y + 0.05); face = 0; yaw = 0; seated = false; cheerT = 8; },
  toFront: (idx) => { teleport(CR.x - 8 + (idx % 10) * 1.7, CR.z - 2.5); face = 0; yaw = 0; seated = false; cheerT = 3; },
  backHub: () => { seated = false; teleport(W.spawn.x, W.spawn.z); yaw = yaw0; toast('Înapoi în piață!'); },
  drawBoard: (t, lines) => CR.drawBoard(t, lines),
  // „Cheamă colegii la mine”: unde sunt și ce loc e acolo
  here: () => { const w = worldAt(P); if (w) return { x: P.x, z: P.z, area: null, place: w.place(P) }; const a = AREAS.find((q) => Math.abs(P.x - q.pos[0]) < 19 && Math.abs(P.z - q.pos[1]) < 19); return { x: P.x, z: P.z, area: a ? a.id : null, place: a ? a.name : P.x > 140 ? 'sala de clasă' : 'piața Mintoriei' }; },
  goNear: (x, z, area) => { if (area && areaLocked(area)) { toast('Colegul e în lumea altei clase: acolo nu poți intra.'); return; } seated = false; teleport(x + 1.6, z + 1.6, 0.8); toast('Ai ajuns lângă coleg!'); }
});
initWorlds({
  scene, shadow, colliders: W.colliders, labelHook: (l) => glow.addExcludedMesh(l), SFX, toast, askOne, confetti, refreshHud,
  teleport: (x, z, y = 0.5) => { seated = false; teleport(x, z, y); }, setYaw: (y) => { yaw = y; yawS = y; },
  cheer: () => { cheerT = 3; }, setFight: () => {},
  backHub: () => { seated = false; teleport(W.spawn.x, W.spawn.z); yaw = yaw0; yawS = yaw0; toast('Înapoi în piața Mintoriei!'); },
  info: (html) => showPanel(html + '<div class="row"><button class="btn" type="button" data-close>Am înțeles</button></div>'),
  confirm: (text, yes) => { showPanel(`<h2 style="font-size:22px">${text}</h2><div class="row"><button class="btn light" type="button" data-close>Nu</button><button class="btn" type="button" id="cfYes">Da</button></div>`); $('cfYes').onclick = () => { $('panel').hidden = true; yes(); }; }
});
const season = initSeason({ scene, getP: () => P, glowExclude: (l) => glow.addExcludedMesh(l), coarse: COARSE, colliders: W.colliders });
$('roomBtn').onclick = openLobby; $('openMulti').onclick = multiplayer;
const hooks = {
  reload: () => { me.setLook(S.look); missionsChanged(); refreshHud(); },
  ready: async (invite) => { if (invite) { try { await joinRoom(invite); } catch (e) { toast(e.message); } } else { openHome(); if (!S.tutorial) showTutorial(touch); else if (!S.placed) offerPlacement(() => openHome()); }
    // link de clasă: ?clasa=COD (se ține minte până își face profil)
    let cl = new URLSearchParams(location.search).get('clasa'); try { if (cl) localStorage.setItem('mintoria-clasa', cl); else cl = localStorage.getItem('mintoria-clasa'); } catch { /* fără salvare */ }
    if (cl) { if (loggedIn()) { try { localStorage.removeItem('mintoria-clasa'); } catch { /* */ } requestJoin(cl); } else toast('Ai primit linkul unei clase: fă-ți profil ca să intri în ea.'); } }
};
window.__profile = () => profileMenu(hooks);
initHome({ stop, showPanel });
initNatura({ stop, home: () => openHome() });
document.getElementById('openHome').onclick = () => openHome();
startFlow(hooks);

/* ---------- bucla ---------- */
let t = 0, hudT = 0;
const camPos = new Vector3(0, 8, 16);
// ce e departe (alte lumi, alte insule) nu se mai desenează și nu mai face umbre: jocul merge fluid
function cullFar() {
  for (const m of scene.meshes) {
    const b = m.getBoundingInfo && m.getBoundingInfo(); if (!b) continue; if (!m._ci) { m.computeWorldMatrix(true); m._ci = 1; } // o dată: altfel o plasă nouă pare că e în centrul lumii
    const c = b.boundingSphere.centerWorld, far = Math.hypot(c.x - P.x, c.z - P.z) - b.boundingSphere.radiusWorld > 230;
    if (far && m.isEnabled(false)) { m.setEnabled(false); m._farOff = true; } else if (!far && m._farOff) { m._farOff = false; m.setEnabled(true); }
  }
}
scene.registerBeforeRender(() => {
  const dt = Math.min(0.05, engine.getDeltaTime() / 1000); t += dt;
  cullT -= dt; if (cullT <= 0) { cullT = 0.4; cullFar(); }
  season.update(dt, t);
  tickTime(dt); hudT += dt; if (hudT > 5) { hudT = 0; save(); refreshHud(); }
  let fwd = 0, side = 0;
  if (!paused()) {
    fwd = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - jy;
    side = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + jx;
  }
  const l = Math.hypot(fwd, side); if (l > 1) { fwd /= l; side /= l; }
  // camera stă în spatele jucătorului; yawS urmează yaw lin, fără smucituri
  { let d = yaw - yawS; while (d > Math.PI) { d -= 2 * Math.PI; yaw -= 2 * Math.PI; } while (d < -Math.PI) { d += 2 * Math.PI; yaw += 2 * Math.PI; } yawS += d * Math.min(1, dt * 7); }
  // Babylon e „mâna stângă”: dreapta ecranului este (-cos, sin)
  const fx = -Math.sin(yawS), fz = -Math.cos(yawS), rx = -Math.cos(yawS), rz = Math.sin(yawS);
  const speed = 8.5 * (accOn('skate') ? 1.4 : 1) * (accOn('rapid') ? 1.25 : 1), mx = (fx * fwd + rx * side) * speed, mz = (fz * fwd + rz * side) * speed;
  // platforme care se mișcă
  for (const mv of W.movers.concat(FUN_MOVERS)) {
    const ax = mv.axis || 'x', np = mv.base + Math.sin(t * mv.sp + (mv.ph || 0)) * mv.amp, d = np - mv.m.position[ax]; mv.m.position[ax] = np;
    mv.c[ax + '1'] += d; mv.c[ax + '2'] += d;
    if (standing === mv.c) P[ax] += d;
  }
  const chase = updateChase(dt, P);
  if (!chase) physics(dt, mx, mz); else face = Math.PI;
  const moving = chase || Math.hypot(mx, mz) > 0.3;
  if (moving && !chase) { const target = Math.atan2(mx, mz); let d = target - face; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; face += d * Math.min(1, dt * 12); }
  cheerT = Math.max(0, cheerT - dt);
  gear.board.setEnabled(accOn('skate')); gear.wings.forEach((w, i) => { w.setEnabled(accOn('aripi') || accOn('zbor')); w.rotation.y = (i ? -1 : 1) * (0.3 + Math.sin(t * (P.ground ? 2 : 12)) * 0.25); });
  me.root.position.set(P.x, P.y + (accOn('skate') ? 0.12 : 0), P.z); me.root.rotation.y = face;
  if (moving) seated = false;
  me.update(dt, { speed: chase ? 1 : moving ? Math.min(1, l) : 0, air: !chase && !P.ground && P.coyote <= 0 && !seated, dance: cheerT > 0 && P.ground && !moving && !seated, sit: seated });

  const cd = camDist, tgt = new Vector3(P.x, P.y + 1.8, P.z);
  camPos.set(P.x + Math.sin(yawS) * cd * Math.cos(pitch), P.y + 1.8 + cd * Math.sin(pitch), P.z + Math.cos(yawS) * cd * Math.cos(pitch));
  // după o teleportare departe (lumi, sală), camera sare direct, nu zboară peste hartă
  if (Vector3.Distance(camera.position, camPos) > 40) camera.position.copyFrom(camPos); else camera.position = Vector3.Lerp(camera.position, camPos, Math.min(1, dt * 8));
  camera.setTarget(tgt);
  // umbra urmărește jucătorul
  sun.position.set(P.x + 30, 60, P.z + 25);

  // NPC-uri: respiră, se uită la tine, salută când ești aproape
  near = null; let best = 1e9;
  for (const n of W.npcs) {
    const d = Math.hypot(n.x - P.x, n.z - P.z);
    const look = d < 9 ? Math.atan2(P.x - n.x, P.z - n.z) - n.av.root.rotation.y : undefined;
    let lk = look; if (lk !== undefined) { while (lk > Math.PI) lk -= 2 * Math.PI; while (lk < -Math.PI) lk += 2 * Math.PI; }
    n.av.update(dt, { lookYaw: lk, wave: d < 5 && d > 2.2 });
    n.bang.position.y = n.baseY + Math.sin(t * 3 + n.x) * 0.15; n.done.position.y = n.bang.position.y;
    const reach = n.m.boss ? 5.5 : 3.2;
    if (d < reach && Math.abs(P.y - n.top) < 2 && d < best) { best = d; near = { type: 'npc', n }; }
  }
  for (const c of W.chests) {
    if (c.open > 0 && c.open < 1) { c.open = Math.min(1, c.open + dt * 1.5); c.piv.rotation.x = -1.9 * c.open; }
    if (Math.hypot(c.x - P.x, c.z - P.z) < 2.8 && Math.abs(P.y - c.top) < 1.2) near = { type: 'chest', c };
  }
  updatePortals(dt, P, t);
  updateWorlds(dt, t, P, paused());
  for (const p of W.pads) {
    p.ring.rotation.y += dt; p.ring.position.y = 1.6 + Math.sin(t * 2) * 0.2;
    const dp = Math.hypot(p.x - P.x, p.z - P.z);
    if (dp > 2.5) p.armed = true;
    if (dp < 1.4 && P.y < 0.6 && areaLocked(p.area.id)) { if (p.armed) { p.armed = false; SFX.no(); toast(`Poarta spre ${p.area.short} e închisă: tu ești în ${GRADE_NAMES[S.grade || 3]}.`); } }
    else if (dp < 1.4 && P.y < 0.6) {
      const [ax, az] = p.area.pos; teleport(ax - Math.sign(ax) * 13, az - Math.sign(az) * 13); yaw = Math.atan2(-Math.sign(ax), -Math.sign(az));
      SFX.star(); toast(`Bun venit în ${p.area.name}!`);
    }
  }
  for (const c of W.coins) {
    if (c.back > 0) { c.back -= dt; if (c.back <= 0) c.m.isVisible = true; continue; }
    c.m.rotation.y += dt * 3;
    if (Math.hypot(c.m.position.x - P.x, c.m.position.z - P.z) < (accOn('magnet') ? 6 : 1.1) && Math.abs(c.m.position.y - (P.y + 1)) < (accOn('magnet') ? 4 : 1.5)) { c.m.isVisible = false; c.back = 60; S.coins += 1; SFX.coin(); refreshHud(); }
  }
  for (const c of W.clouds) { c.position.x += dt * 0.8; if (c.position.x > 130) c.position.x = -130; }
  W.statue.update(dt, { dance: true });

  const act = $('act');
  if (!near || paused()) act.hidden = true;
  else { act.textContent = near.type === 'npc' ? `Vorbește cu ${near.n.m.npc}` : 'Deschide comoara'; act.hidden = false; }
  netTick(dt, P, face, seated ? 4 : !P.ground && P.coyote <= 0 ? 2 : cheerT > 0 ? 3 : 0);
  Music.setMode(musicFor()); Music.setQuiet(!$('quiz').hidden && !['duel', 'team'].includes(document.body.dataset.act));
  updateQuest();
});

/* ---------- bara cu misiunea următoare ---------- */
let qm = null;
$('qGo').onclick = () => { if (qm) goTo(qm); };
function updateQuest() {
  const m = nextMission(), el = $('quest');
  if (!m || paused() || P.x > 140 || P.z < -300 || worldAt(P)) { el.hidden = true; return; }
  el.hidden = false;
  if (m !== qm) { qm = m; $('qTitle').textContent = m.title; }
  const n = W.npcs.find((x) => x.m.id === m.id), d = Math.round(Math.hypot(n.x - P.x, n.z - P.z));
  $('qSub').textContent = `${m.npc} · ${d} m`;
  const ang = Math.atan2(n.x - P.x, n.z - P.z) - Math.atan2(-Math.sin(yawS), -Math.cos(yawS));
  $('qArrow').style.transform = `rotate(${ang}rad)`;
}

engine.runRenderLoop(() => scene.render());
addEventListener('resize', () => engine.resize());
scene.executeWhenReady(() => { $('loading').hidden = true; });
document.fonts && document.fonts.ready.then(() => { /* etichetele folosesc fonturile deja încărcate la prima randare */ });
