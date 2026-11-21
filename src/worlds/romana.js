// Satul Cuvintelor: lumea Limbii române. 4 zone, fiecare cu alt joc:
// Râul Ortogramelor (construiești podul), Biblioteca Fermecată (cărțile zboară la raft),
// Labirintul Cuvintelor (treci prin ușa cu răspunsul corect), Turnul Vrăjitorului Greșelilor (boss).
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { makeKit } from './kit.js';
import { S, save, G } from '../state.js';
import { GEN, typesFor } from '../content/missions.js';
import { shuffle, pick } from '../content/util.js';
import { diagnose } from '../mistakes.js';
import { optsBanner } from './games.js';

const O = { x: -600, z: 0 };
const T3 = {
  bridge: ['orto3', 'punct3', 'propozitie'],
  library: ['partivorbire', 'substantiv', 'pronume'],
  maze: ['sinonime', 'silabe3', 'alfabet'],
  boss: ['orto3', 'punct3', 'compOrdine', 'compParti', 'propozitie', 'partivorbire', 'sinonime']
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function buildRomana(ctx) {
  const K = makeKit(ctx, O.x, O.z), X = (x) => O.x + x, Z = (z) => O.z + z;
  const types = (k) => (G() === 3 ? T3[k] : typesFor(G(), 'romana'));
  const st = () => { S.worlds = S.worlds || {}; return (S.worlds.romana = S.worlds.romana || { planks: 0, books: [], room: 0, boss: false, paid: {} }); };
  const reward = (key, coins, msg) => {
    const M = st(); ctx.SFX.fanfare(); ctx.confetti(); ctx.cheer();
    if (!M.paid[key]) { M.paid[key] = 1; S.coins += coins; ctx.toast(`${msg} +${coins} monede!`); } else ctx.toast(msg);
    save(); ctx.refreshHud(); refreshLabels();
  };
  const triggers = [];
  const trig = (x, z, r, on, y = 0.5, dy) => { const t = { x: X(x), z: Z(z), r, on, y, dy }; triggers.push(t); return t; };
  const ask = (k, title, cb) => ctx.askOne(types(k), title, cb);

  /* ---------- teren: malul de sud și malul de nord, despărțite de râu ---------- */
  const RZ1 = -43, RZ2 = -57; // râul curge între z = -57 și -43
  K.plat(0, 0, 31, 210, 148, '#79c46a', 3);
  K.plat(0, 0, -81, 210, 48, '#79c46a', 3);
  K.box(0, -1.1, -50, 210, 0.2, 14, '#3a8fd8', { collide: false, glow: 0.15 });
  [[0, -103, 210, 1], [0, 103, 210, 1], [-103, 0, 1, 210], [103, 0, 1, 210]].forEach(([x, z, w, d]) => K.box(x, 1.5, z, w, 3, d, '#b07a45'));
  // piața satului: fântână, căsuțe, litere care plutesc
  K.plat(0, 0.1, 0, 24, 24, '#c7b089', 0.2);
  K.cyl(0, 0.8, 0, 4, 1.6, '#9a8f86', { collide: true }); K.cyl(0, 1.62, 0, 3.4, 0.05, '#3a8fd8', { glow: 0.3 });
  [-1.6, 1.6].forEach((o) => K.cyl(o, 2.6, 0, 0.25, 2.4, '#8a5a2b')); K.box(0, 4, 0, 4.4, 0.3, 1.6, '#a0522d', { collide: false });
  const letters = 'AĂÂBCDEFGHIÎ'.split('').map((ch, i) => K.label(ch, '', ['#e04848', '#7B5CF6', '#2EC4A6', '#FF7A2F'][i % 4], 1.2, 0, 3, 0));
  K.label('Satul Cuvintelor', 'Lumea Limbii române · 4 locuri de cucerit', '#e04848', 9, 0, 8, 0);
  const house = (x, z, c, roof) => { K.box(x, 2, z, 7, 4, 6, c, { cast: true }); K.cyl(x, 5.2, z, 9, 2.4, roof, { top: 0, tess: 4, cast: true }).rotation.y = Math.PI / 4; K.box(x, 1.2, z + 3.05, 1.4, 2.4, 0.1, '#6b3f1f', { collide: false }); };
  house(-22, 18, '#fff1d6', '#c0392b'); house(22, 18, '#e8f4ff', '#2c5aa0'); house(-28, -22, '#fde2e4', '#8e44ad'); house(30, -24, '#e9ffe6', '#27ae60'); house(-40, 40, '#fff6cc', '#d35400'); house(40, 42, '#f1e6ff', '#c0392b');
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; K.sphere(Math.cos(a) * 14, 0.5, Math.sin(a) * 14, 0.8, ['#ff8ac0', '#ffd93c', '#ffffff', '#c77dff'][i % 4]); }
  // ieșirea spre Mintoria
  K.cyl(0, 0.12, 9, 3.2, 0.25, '#2EC4A6', { glow: 0.2 });
  const exitRing = K.cyl(0, 1.7, 9, 3.2, 0.2, '#2EC4A6', { glow: 0.4 }); exitRing.rotation.x = Math.PI / 2;
  K.label('Înapoi în Mintoria', '', '#2EC4A6', 3.2, 0, 3.8, 9);
  trig(0, 9, 1.4, () => ctx.backHub());
  const sign = (x, z, txt, color) => { K.cyl(x, 1.5, z, 0.3, 3, '#5d4a3a', { collide: true }); K.label(txt, '', color, 4.4, x, 3.8, z); };
  sign(-4, -13, '↑ Râul Ortogramelor', '#3a8fd8'); sign(13, -4, '→ Biblioteca Fermecată', '#7B5CF6'); sign(-13, 4, '← Labirintul Cuvintelor', '#2f8f46'); sign(4, 13, '↓ Turnul Vrăjitorului', '#8e44ad');

  /* ---------- A. Râul Ortogramelor: podul se construiește scândură cu scândură ---------- */
  const NP = 7, PL = 2; // 7 scânduri de câte 2 m peste râul lat de 14 m
  K.label('Râul Ortogramelor', 'construiește podul: o ortogramă = o scândură', '#3a8fd8', 9, 0, 7, RZ1 + 6);
  [-2.6, 2.6].forEach((o) => { K.cyl(o, 0.8, RZ1 + 0.6, 0.5, 2.6, '#6b3f1f', { collide: true }); K.cyl(o, 0.8, RZ2 - 0.6, 0.5, 2.6, '#6b3f1f', { collide: true }); });
  const planks = [];
  for (let i = 0; i < NP; i++) { const m = K.box(0, -0.2, RZ1 - PL / 2 - i * PL, 4, 0.4, PL - 0.1, ['#c8955a', '#b07a45'][i % 2], { cast: true }); m.isVisible = false; K.setSolid(m, false); planks.push(m); }
  const showPlank = (i, on) => { planks[i].isVisible = on; K.setSolid(planks[i], on); };
  const tip = trig(0, RZ1 + 0.8, 1.6, () => buildPlank());
  const moveTip = () => { const n = st().planks; tip.z = Z(RZ1 + 0.8 - n * PL); tip.armed = true; };
  function buildPlank() {
    const n = st().planks; if (n >= NP) return;
    ask('bridge', `Podul · scândura ${n + 1} din ${NP}`, (ok) => {
      if (!ok) { if (ok === false) ctx.toast('Scândura nu s-a prins. Încă o ortogramă și o pui!'); tip.armed = false; return; }
      showPlank(n, true); st().planks = n + 1; save(); moveTip(); ctx.SFX.boing();
      if (n + 1 === NP) reward('bridge', 40, 'Podul e gata! Treci pe malul celălalt.'); else ctx.toast(`Scândura ${n + 1} pusă! Pășește pe ea și continuă.`);
    });
  }
  // comoara de pe malul de nord
  K.box(0, 0.7, -66, 2.4, 1.4, 1.6, '#b07a45', { cast: true }); K.box(0, 1.5, -66, 2.5, 0.3, 1.7, '#FFC93C', { glow: 0.3 });
  K.label('Comoara Ortogramelor', '', '#d4a017', 4, 0, 3.4, -66);
  trig(0, -63.5, 1.8, () => { if (st().planks >= NP) ctx.confirm('Strici podul și îl construiești din nou?', () => { st().planks = 0; save(); planks.forEach((_, i) => showPlank(i, false)); moveTip(); ctx.teleport(X(0), Z(-30)); }); });
  for (let i = 0; i < 20; i++) K.tree(-90 + i * 9.5, -78 - (i % 3) * 7, 0.9 + (i % 2) * 0.3, ['#3f9c4a', '#2f8f46'][i % 2]);

  /* ---------- B. Biblioteca Fermecată: 6 cărți zboară la raft ---------- */
  const LX = 62;
  K.plat(LX, 0.1, 0, 36, 30, '#a0785a', 0.2);
  [[LX, -15, 36, 1], [LX, 15, 36, 1], [LX + 18, 0, 1, 30]].forEach(([x, z, w, d]) => K.box(x, 3, z, w, 6, d, '#e8d9c0', { cast: true }));
  [[LX - 18, -9, 1, 12], [LX - 18, 9, 1, 12]].forEach(([x, z, w, d]) => K.box(x, 3, z, w, 6, d, '#e8d9c0'));
  K.label('Biblioteca Fermecată', 'prinde cărțile și pune-le la raft', '#7B5CF6', 9, LX - 18, 8.5, 0);
  // rafturile de pe peretele din spate
  for (let r = 0; r < 3; r++) K.box(LX + 16.8, 1 + r * 1.6, 0, 1.4, 0.2, 22, '#6b3f1f');
  const BOOKS = [[LX - 10, -8], [LX - 4, 8], [LX + 2, -10], [LX + 6, 4], [LX + 10, -4], [LX - 6, 0]];
  const books = BOOKS.map(([x, z], i) => {
    const m = K.box(x, 2.2, z, 0.5, 1.6, 1.2, ['#e04848', '#2EC4A6', '#7B5CF6', '#FF7A2F', '#3b7ddd', '#d4a017'][i], { collide: false, glow: 0.25 });
    const shelf = { x: X(LX + 16.2), y: 1.9 + (i % 3) * 1.6, z: Z(-8 + i * 3) };
    trig(x, z, 1.8, () => {
      if (st().books.includes(i)) return;
      ask('library', `Cartea ${st().books.length + 1} din 6`, (ok) => {
        if (!ok) { if (ok === false) ctx.toast('Cartea a zburat de lângă tine. Prinde-o din nou!'); return; }
        st().books.push(i); save(); fly.push({ m, to: shelf, t: 0 }); ctx.SFX.coin();
        if (st().books.length === 6) reward('library', 40, 'Toate cărțile sunt la raft!'); else { ctx.toast(`Carte la raft! ${st().books.length} din 6`); refreshLabels(); }
      });
    });
    return { m, shelf };
  });
  const fly = [];
  trig(LX + 13, 9, 1.6, () => { if (st().books.length >= 6) ctx.confirm('Le scoți din nou de pe raft?', () => { st().books = []; save(); books.forEach((b, i) => b.m.position.set(X(BOOKS[i][0]), 2.2, Z(BOOKS[i][1]))); refreshLabels(); }); });

  /* ---------- C. Labirintul Cuvintelor: treci prin ușa cu răspunsul corect ---------- */
  const ROOMS = [-45, -59, -73, -87], ARCH = [-4.5, 0, 4.5], RW = 14;
  K.label('Labirintul Cuvintelor', 'treci prin ușa cu răspunsul corect', '#2f8f46', 9, -38, 8, -9);
  ROOMS.forEach((cx, ri) => {
    K.plat(cx, 0.1, 0, RW, 16, ri % 2 ? '#b7e4a8' : '#a6d995', 0.2);
    K.box(cx, 2, -8, RW, 4, 1, '#2f7d3b'); K.box(cx, 2, 8, RW, 4, 1, '#2f7d3b');
    // peretele cu 3 uși (spre vest)
    const wx = cx - RW / 2; const segs = [[-6.9, 2.2], [-2.25, 1.9], [2.25, 1.9], [6.9, 2.2]];
    segs.forEach(([z, w]) => K.box(wx, 2, z, 1, 4, w, '#2f7d3b'));
    ARCH.forEach((z) => K.box(wx, 3.6, z, 1, 0.8, 2.6, '#2f7d3b'));
  });
  K.box(-38, 2, -6, 1, 4, 4, '#2f7d3b'); K.box(-38, 2, 6, 1, 4, 4, '#2f7d3b'); // intrarea în labirint
  K.plat(-98, 0.1, 0, 8, 16, '#FFC93C', 0.2); K.box(-98, 2, -8, 8, 4, 1, '#2f7d3b'); K.box(-98, 2, 8, 8, 4, 1, '#2f7d3b');
  K.label('Ai ieșit din labirint!', '', '#d4a017', 4, -99, 4, 0);
  const banner = document.createElement('div'); banner.id = 'wq'; banner.hidden = true; document.body.appendChild(banner);
  let MQ = null, archLbls = [], mazeStale = false;
  function newMazeQ() {
    archLbls.forEach((l) => l.dispose()); archLbls = [];
    const r = st().room; if (r >= ROOMS.length) { MQ = null; return; }
    const q = GEN[pick(types('maze'))](), wrong = shuffle(q.opts.filter((o) => o !== q.ans)).slice(0, 2), opts = shuffle([q.ans, ...wrong]);
    MQ = { q, opts, room: r };
    const wx = ROOMS[r] - RW / 2;
    opts.forEach((o, i) => { archLbls.push(K.label('ABC'[i], '', '#2f8f46', 4.6, wx + 1.6, 2.3, ARCH[i])); });
    banner.innerHTML = optsBanner('Labirintul Cuvintelor', r, ROOMS.length, q, opts);
  }
  ROOMS.forEach((cx, ri) => ARCH.forEach((z, ai) => trig(cx - RW / 2 - 0.6, z, 1.1, () => {
    if (!MQ || MQ.room !== ri) return;
    const chosen = MQ.opts[ai], q = MQ.q;
    if (chosen === q.ans) {
      st().room = ri + 1; save(); ctx.SFX.star();
      if (ri + 1 === ROOMS.length) { MQ = null; archLbls.forEach((l) => l.dispose()); reward('maze', 40, 'Ai ieșit din Labirintul Cuvintelor!'); }
      else { ctx.toast('Ușa bună! Camera următoare.'); newMazeQ(); }
    } else {
      ctx.SFX.no();
      const why = (q.why && q.why[chosen]) || diagnose(q, chosen);
      ctx.info(`<div class="eyebrow">Ușa greșită</div><h2>Ai ales: ${esc(chosen)}</h2>${why ? `<div class="fb no"><b>Unde ai greșit:</b> ${esc(why)}</div>` : ''}<p><b>Răspunsul corect: ${esc(q.ans)}</b></p><ol>${(q.steps || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol><p>Te întorci la începutul camerei, cu o întrebare nouă.</p>`);
      ctx.teleport(X(ROOMS[ri] + 5), Z(0)); newMazeQ();
    }
  })));
  trig(-99, 0, 2, () => { if (st().room >= ROOMS.length) ctx.confirm('Intri din nou în labirint?', () => { st().room = 0; save(); newMazeQ(); ctx.teleport(X(ROOMS[0] + 5), Z(0)); }); });

  /* ---------- D. Turnul Vrăjitorului Greșelilor (boss) ---------- */
  const WZ = 75;
  K.plat(0, 0.1, WZ, 34, 34, '#4b3a66', 0.2);
  K.box(0, 3, WZ + 17, 34, 6, 1, '#5b4a7a', { cast: true }); K.box(-17, 3, WZ, 1, 6, 34, '#5b4a7a', { cast: true }); K.box(17, 3, WZ, 1, 6, 34, '#5b4a7a', { cast: true });
  K.box(-10.25, 3, WZ - 17, 13.5, 6, 1, '#5b4a7a', { cast: true }); K.box(10.25, 3, WZ - 17, 13.5, 6, 1, '#5b4a7a', { cast: true });
  [[-17, WZ - 17], [17, WZ - 17], [-17, WZ + 17], [17, WZ + 17]].forEach(([x, z]) => { K.cyl(x, 4, z, 3, 8, '#6c5a8a', { collide: true, cast: true }); K.cyl(x, 9, z, 3.4, 2.4, '#8e44ad', { top: 0 }); });
  K.cyl(0, 6, WZ + 14, 8, 12, '#3b2b55', { collide: true, cast: true }); K.cyl(0, 14, WZ + 14, 9, 5, '#8e44ad', { top: 0 });
  K.label('Turnul Vrăjitorului', 'Vrăjitorul Greșelilor', '#8e44ad', 9, 0, 11, WZ - 15);
  const barrier = K.box(0, 3, WZ - 17, 7, 6, 0.6, '#c77dff', { glow: 0.6, collide: false }); barrier.visibility = 0.5;
  const bar = K.box(0, 3, WZ - 17, 7, 6, 1, '#c77dff', { collide: true }); bar.isVisible = false;
  const barLbl = K.label('Închis', 'termină 2 locuri ca să intri', '#8e44ad', 3.6, 0, 7.4, WZ - 18);
  trig(0, WZ - 19, 2.5, () => { if (!towerOpen()) ctx.toast(`Turnul se deschide după 2 locuri terminate. Ai ${zonesDone()} din 2.`); });
  const wiz = K.avatar({ skin: '#cfd6e6', shirt: '#4b2a7a', pants: '#2b1a4a', hat: 'vrajitor', face: 'surprins' }, 0, 2, WZ + 6, Math.PI);
  wiz.root.scaling.setAll(2.2);
  const orb = K.sphere(0, 4, WZ + 4, 1.2, '#c77dff', { glow: 1 }); orb.isVisible = false;
  K.cyl(0, 0.25, WZ - 6, 4, 0.2, '#c77dff', { glow: 0.4 });
  const HP = 6, fight = { on: false, hp: HP, hearts: 3, hit: 0, burn: 0 };
  let hpLbl = null;
  const drawHp = () => { if (hpLbl) hpLbl.dispose(); hpLbl = K.label(st().boss && !fight.on ? 'Vrăjitorul a fugit!' : `Vrăjitor: ${'▮'.repeat(fight.hp)}${'▯'.repeat(HP - fight.hp)}`, fight.on ? `Inimile tale: ${'❤'.repeat(fight.hearts)}` : 'stai pe cercul mov', '#8e44ad', 4.6, 0, 9.5, WZ + 6); };
  const nextQ = () => ask('boss', `Vrăjitorul Greșelilor · viață ${fight.hp}/${HP}`, (ok) => {
    if (ok === null) { fight.on = false; ctx.toast('Ai fugit din luptă. Revino când ești gata!'); drawHp(); return; }
    if (ok) { fight.hp--; fight.hit = 0.6; ctx.SFX.boing(); } else { fight.hearts--; fight.burn = 1; ctx.SFX.no(); }
    drawHp();
    if (fight.hp <= 0) { fight.on = false; st().boss = true; save(); reward('boss', 100, 'AI ÎNVINS VRĂJITORUL GREȘELILOR!'); drawHp(); return; }
    if (fight.hearts <= 0) { fight.on = false; ctx.toast('Vrăjitorul a câștigat de data asta. Mai exersează și revino!'); drawHp(); return; }
    setTimeout(nextQ, 900);
  });
  trig(0, WZ - 6, 2, () => {
    if (!towerOpen()) return;
    ctx.confirm(st().boss ? 'Te lupți din nou cu Vrăjitorul?' : 'Începi lupta cu Vrăjitorul Greșelilor? Fiecare răspuns bun îi ia o viață. Dacă greșești, te lovește cu o vrajă și pierzi o inimă (ai 3).', () => {
      Object.assign(fight, { on: true, hp: HP, hearts: 3 }); drawHp(); nextQ();
    });
  });

  /* ---------- progres ---------- */
  let progLbls = [];
  const zonesDone = () => { const M = st(); return [M.planks >= NP, M.books.length >= 6, M.room >= ROOMS.length].filter(Boolean).length; };
  const towerOpen = () => zonesDone() >= 2;
  function refreshLabels() {
    progLbls.forEach((l) => l.dispose()); progLbls = [];
    const M = st();
    progLbls.push(K.label(`${M.planks}/${NP} scânduri`, '', '#3a8fd8', 3.2, 0, 4.6, RZ1 + 6));
    progLbls.push(K.label(`${M.books.length}/6 cărți`, '', '#7B5CF6', 3.2, LX - 18, 5.8, 0));
    progLbls.push(K.label(`${Math.min(M.room, ROOMS.length)}/${ROOMS.length} camere`, '', '#2f8f46', 3.2, -38, 5.6, -9));
    progLbls.push(K.label(`${zonesDone()}/3 locuri terminate`, 'Turnul se deschide la 2', '#8e44ad', 4, 0, 5.4, -4));
    const open = towerOpen(); K.setSolid(bar, !open); barrier.isVisible = !open; barLbl.isVisible = !open;
  }
  // starea salvată
  const M0 = st();
  for (let i = 0; i < Math.min(M0.planks, NP); i++) showPlank(i, true);
  moveTip(); tip.armed = true;
  books.forEach((b, i) => { if (M0.books.includes(i)) b.m.position.set(b.shelf.x, b.shelf.y, b.shelf.z); });
  newMazeQ(); refreshLabels(); drawHp();
  if (location.hostname === 'localhost') window.__rom = { mq: () => MQ && { opts: MQ.opts, ans: MQ.q.ans, room: MQ.room } };

  return {
    id: 'romana', name: 'Satul Cuvintelor', sky: '#c9d7ff', fog: [70, 210], music: 'forest',
    spawn: { x: X(0), z: Z(-7), y: 0.6, yaw: 0 },
    bounds: { x1: X(-110), x2: X(110), z1: Z(-110), z2: Z(110) },
    triggers, fight,
    place: (P) => { const lx = P.x - O.x, lz = P.z - O.z; return lz < -38 ? 'Râul Ortogramelor' : lx > 42 && Math.abs(lz) < 16 ? 'Biblioteca Fermecată' : lx < -37 && Math.abs(lz) < 9 ? 'Labirintul Cuvintelor' : lz > 56 ? 'Turnul Vrăjitorului' : 'piața Satului Cuvintelor'; },
    update(dt, t, P, here) {
      const lx = P.x - O.x, lz = P.z - O.z, inMaze = here && MQ && lx < -37 && lx > -103 && Math.abs(lz) < 8;
      banner.hidden = !inMaze || !document.getElementById('quiz').hidden || !document.getElementById('panel').hidden;
      if (!inMaze && MQ) mazeStale = true; else if (inMaze && mazeStale) { mazeStale = false; newMazeQ(); }
      if (!here) return;
      letters.forEach((l, i) => { const a = t * 0.5 + i * 0.52; l.position.set(X(Math.cos(a) * 3.2), 4.6 + Math.sin(t * 2 + i) * 0.3, Z(Math.sin(a) * 3.2)); });
      exitRing.rotation.z += dt;
      books.forEach((b, i) => { if (!st().books.includes(i)) { b.m.rotation.y += dt * 1.5; b.m.position.y = 2.2 + Math.sin(t * 2 + i) * 0.3; } });
      for (let i = fly.length - 1; i >= 0; i--) { const f = fly[i]; f.t = Math.min(1, f.t + dt * 0.8); const p = f.m.position; p.x += (f.to.x - p.x) * Math.min(1, dt * 3); p.y += (f.to.y - p.y) * Math.min(1, dt * 3) + Math.sin(f.t * Math.PI) * 0.05; p.z += (f.to.z - p.z) * Math.min(1, dt * 3); f.m.rotation.y = 0; if (f.t >= 1) { p.set(f.to.x, f.to.y, f.to.z); fly.splice(i, 1); } }
      wiz.root.position.y = (st().boss && !fight.on ? -10 : 2 + Math.sin(t * 1.6) * 0.5);
      wiz.root.rotation.y = Math.atan2(P.x - wiz.root.position.x, P.z - wiz.root.position.z);
      wiz.update(dt, { wave: fight.on });
      if (fight.hit > 0) { fight.hit -= dt; wiz.root.position.x = X(0) + Math.sin(fight.hit * 60) * 0.4; } else wiz.root.position.x = X(0);
      if (fight.burn > 0) { fight.burn -= dt; orb.isVisible = true; const k = 1 - fight.burn; orb.position.set(X(0) + (P.x - X(0)) * k, 4 - k * 2.5, Z(WZ + 4) + (P.z - Z(WZ + 4)) * k); } else orb.isVisible = false;
    }
  };
}
