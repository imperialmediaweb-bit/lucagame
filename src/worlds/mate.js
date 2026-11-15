// Orașul Cifrelor: lumea Matematicii. 5 zone, fiecare cu alt joc:
// Pădurea Adunării (porți), Peșterile Înmulțirii (cristale), Turnul Împărțirii (urci etaje),
// Piața Bunicii (tarabe cu probleme), Castelul Problemelor (Dragonul Calculelor).
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { makeKit } from './kit.js';
import { S, save, G } from '../state.js';
import { typesFor } from '../content/missions.js';

const O = { x: 600, z: 0 };
const T3 = {
  forest: ['adun10k', 'proprietati', 'ordonare'],
  cave: ['inm', 'inm3', 'tabla'],
  tower: ['impRest', 'imp'],
  market: ['piata1', 'bunica', 'rest', 'masuri3'],
  boss: ['ordine1', 'ordine2', 'ordine3', 'necunoscut1', 'gandesc', 'veverite', 'abc']
};

export function buildMate(ctx) {
  const K = makeKit(ctx, O.x, O.z), X = (x) => O.x + x, Z = (z) => O.z + z;
  const types = (k) => (G() === 3 ? T3[k] : typesFor(G(), 'mate'));
  const st = () => { S.worlds = S.worlds || {}; return (S.worlds.mate = S.worlds.mate || { gates: 0, crystals: [], floor: 0, top: false, stalls: [], boss: false, paid: {} }); };
  const reward = (key, coins, msg) => {
    const M = st(); ctx.SFX.fanfare(); ctx.confetti(); ctx.cheer();
    if (!M.paid[key]) { M.paid[key] = 1; S.coins += coins; ctx.toast(`${msg} +${coins} monede!`); } else ctx.toast(msg);
    save(); ctx.refreshHud(); refreshLabels();
  };
  const triggers = [];
  const trig = (x, z, r, on, y = 0.5, dy) => { const t = { x: X(x), z: Z(z), r, on, y, dy }; triggers.push(t); return t; };
  const ask = (k, title, cb) => ctx.askOne(types(k), title, cb);

  /* ---------- teren ---------- */
  K.plat(0, 0, 0, 210, 210, '#6fbf5e', 3);
  K.plat(0, -0.3, 0, 216, 216, '#f1dca0', 3);
  [[0, 0, 12, 200], [0, 0, 200, 12]].forEach(([x, z, w, d]) => K.box(x, 0.03, z, w, 0.06, d, '#9aa3b5', { collide: false }));
  // gard de jur împrejur
  [[0, -103, 210, 1], [0, 103, 210, 1], [-103, 0, 1, 210], [103, 0, 1, 210]].forEach(([x, z, w, d]) => K.box(x, 1.5, z, w, 3, d, '#c98e5f'));
  // piața centrală, fântâna cu cifre
  K.plat(0, 0.1, 0, 26, 26, '#d6b98c', 0.2);
  K.cyl(0, 0.6, 0, 7, 1.2, '#7B5CF6', { collide: true });
  K.cyl(0, 1.25, 0, 6, 0.1, '#7fd3ff', { glow: 0.3 });
  const digits = [];
  for (let i = 0; i < 10; i++) { const l = K.label(String(i), '', ['#FF7A2F', '#2EC4A6', '#7B5CF6', '#FFC93C'][i % 4], 1.2, 0, 3, 0); digits.push(l); }
  K.label('Orașul Cifrelor', 'Lumea Matematicii · 5 zone de cucerit', '#7B5CF6', 6, 0, 7.5, 0);
  // ieșirea spre Mintoria
  K.cyl(0, 0.12, 10, 3.2, 0.25, '#2EC4A6', { glow: 0.2 });
  const exitRing = K.cyl(0, 1.7, 10, 3.2, 0.2, '#2EC4A6', { glow: 0.4 }); exitRing.rotation.x = Math.PI / 2;
  K.label('Înapoi în Mintoria', '', '#2EC4A6', 3.2, 0, 3.8, 10);
  trig(0, 10, 1.4, () => ctx.backHub());
  // stâlpi indicatori
  const sign = (x, z, txt, color) => { K.cyl(x, 1.5, z, 0.3, 3, '#5d4a3a', { collide: true }); K.label(txt, '', color, 4.4, x, 3.8, z); };
  sign(-5, -14, '↑ Pădurea Adunării', '#2f8f46'); sign(14, -5, '→ Peșterile Înmulțirii', '#3b7ddd');
  sign(-14, 5, '← Turnul Împărțirii', '#e0582f'); sign(14, 14, '↘ Piața Bunicii', '#d4a017'); sign(5, 14, '↓ Castelul Problemelor', '#7B5CF6');
  // clădiri-cifre printre străzi
  const B = [[-30, -30, '3', '#ff9fb8'], [30, -30, '7', '#9fd0ff'], [-30, 30, '5', '#ffe08a'], [-45, -55, '8', '#b8f0c9'], [45, -55, '2', '#e5c8ff'], [-80, 40, '9', '#ffd1a6'], [80, -80, '4', '#c6f2ff'], [-85, -80, '6', '#ffc6d9'], [25, 85, '1', '#d9ffb0'], [-25, 88, '0', '#ffe6a8']];
  B.forEach(([x, z, d, c], i) => { const h = 8 + (i % 4) * 3; K.box(x, h / 2, z, 9, h, 9, c, { cast: true }); K.box(x, h + 0.4, z, 10, 0.8, 10, '#ffffff'); K.label(d, '', '#1F2B3A', 3, x, h + 3, z); });
  // felinare
  for (const [x, z] of [[-8, -25], [8, -25], [25, -8], [25, 8], [-25, -8], [-25, 8], [8, 25], [-8, 25]]) { K.cyl(x, 2, z, 0.25, 4, '#3d3d4f', { collide: true }); K.sphere(x, 4.2, z, 0.8, '#fff3b0', { glow: 0.6 }); }

  /* ---------- A. Pădurea Adunării: 5 porți ---------- */
  const FZ = -30;
  K.plat(0, 0.08, -64, 12, 70, '#a8794a', 0.16);
  K.box(-6.5, 1.5, -64, 1, 3, 70, '#2f7d3b'); K.box(6.5, 1.5, -64, 1, 3, 70, '#2f7d3b'); K.box(0, 1.5, -99.5, 14, 3, 1, '#2f7d3b');
  for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1; K.tree(side * (11 + (i * 7) % 18), FZ - 4 - (i * 2.6) % 66, 0.9 + (i % 3) * 0.25, ['#3f9c4a', '#2f8f46', '#5bbf5a'][i % 3]); }
  K.label('Pădurea Adunării', 'deschide cele 5 porți', '#2f8f46', 9, 0, 7.5, FZ - 1);
  const gates = [];
  [-42, -54, -66, -78, -90].forEach((gz, i) => {
    const g = K.box(0, 1.6, gz, 12, 3.2, 0.6, '#ff7a2f', { cast: true });
    const lb = K.label(`Poarta ${i + 1}`, 'adunări și scăderi', '#ff7a2f', 3, 0, 4.4, gz);
    // un obstacol mic de sărit între porți
    if (i < 4) K.box(i % 2 ? 2 : -2, 0.45, gz - 6, 5, 0.9, 1, '#8a5a2b');
    const t = trig(0, gz + 2.4, 2.4, () => {
      if (st().gates > i) return;
      if (st().gates < i) { ctx.toast('Deschide întâi poarta dinainte!'); return; }
      ask('forest', `Poarta ${i + 1} din 5`, (ok) => {
        if (ok) { st().gates = i + 1; save(); openGate(i); ctx.SFX.star(); if (i === 4) reward('forest', 30, 'Ai trecut prin toată Pădurea Adunării!'); else ctx.toast(`Poarta ${i + 1} s-a deschis!`); }
        else if (ok === false) ctx.toast('Poarta rămâne închisă. Mai încearcă: fă un pas înapoi și revino.');
      });
    });
    gates.push({ g, lb, t, y: 1.6, open: 0 });
  });
  const openGate = (i) => { gates[i].open = 0.001; K.setSolid(gates[i].g, false); gates[i].lb.isVisible = false; };
  // trofeul de la capăt + rejoacă
  K.cyl(0, 0.6, -95, 2, 1.2, '#FFC93C', { collide: true }); K.sphere(0, 1.8, -95, 1.2, '#FFC93C', { glow: 0.5 });
  trig(0, -93, 2, () => { if (st().gates >= 5) ctx.confirm('Joci din nou Pădurea Adunării? Porțile se închid iar.', () => { st().gates = 0; save(); gates.forEach((x) => { x.open = 0; x.g.position.y = x.y; K.setSolid(x.g, true); x.lb.isVisible = true; }); ctx.teleport(X(0), Z(FZ - 2)); }); });

  /* ---------- B. Peșterile Înmulțirii: 8 cristale ---------- */
  const CX = 65;
  K.plat(CX, 0.08, 0, 60, 60, '#5b5470', 0.16);
  [[CX, -30.5, 60, 1], [CX, 30.5, 60, 1], [CX + 30.5, 0, 1, 62]].forEach(([x, z, w, d]) => K.box(x, 3, z, w, 6, d, '#4a4360'));
  [[35, -17, 1, 26], [35, 17, 1, 26]].forEach(([x, z, w, d]) => K.box(x, 3, z, w, 6, d, '#4a4360'));
  const CRY = [[48, -14], [55, 12], [63, -22], [70, 4], [76, 20], [82, -10], [88, 8], [72, -26]];
  for (let i = 0; i < 14; i++) { const x = CX - 24 + (i * 13) % 50, z = -24 + (i * 17) % 48; if ((Math.abs(z) < 4 && x < CX - 15) || CRY.some(([a, b]) => Math.hypot(a - x, b - z) < 5)) continue; K.box(x, 1 + (i % 3) * 0.5, z, 2 + (i % 3), 2 + (i % 3), 2 + (i % 2), '#6e6488', { cast: true }); }
  K.label('Peșterile Înmulțirii', 'adună cele 8 cristale', '#3b7ddd', 9, 37, 9, 0);
    const crystals = CRY.map(([x, z], i) => {
    const m = K.cyl(x, 1.6, z, 1.4, 2.6, ['#7be0ff', '#c77dff', '#7dffb2', '#ffd36e'][i % 4], { top: 0, tess: 6, glow: 0.7 });
    const t = trig(x, z, 2, () => {
      if (st().crystals.includes(i)) return;
      ask('cave', `Cristalul ${st().crystals.length + 1} din 8`, (ok) => {
        if (!ok) { if (ok === false) ctx.toast('Cristalul nu s-a lăsat prins. Mai încearcă!'); return; }
        st().crystals.push(i); save(); m.isVisible = false; ctx.SFX.coin();
        if (st().crystals.length === 8) reward('cave', 40, 'Ai adunat toate cristalele!'); else { ctx.toast(`Cristal prins! ${st().crystals.length} din 8`); refreshLabels(); }
      });
    });
    return { m, t };
  });
  trig(40, 0, 2, () => { if (st().crystals.length >= 8) ctx.confirm('Aduni din nou cristalele?', () => { st().crystals = []; save(); crystals.forEach((c) => (c.m.isVisible = true)); refreshLabels(); }); });

  /* ---------- C. Turnul Împărțirii: urci etaj cu etaj ---------- */
  const TX = -62, FLOORS = 6, ang = (k) => k * 1.05, pos = (k) => [TX + Math.cos(ang(k)) * 10, Math.sin(ang(k)) * 10];
  K.cyl(TX, 17, 0, 9, 34, '#e0582f', { collide: true, cast: true });
  K.cyl(TX, 35, 0, 11, 2, '#ffc93c'); K.cyl(TX, 38, 0, 10, 4, '#7B5CF6', { top: 0 });
  K.label('Turnul Împărțirii', 'urcă până sus', '#e0582f', 9, TX + 14, 8, 0);
  const balconies = [];
  for (let k = 0; k <= FLOORS; k++) {
    const [bx, bz] = pos(k), top = k * 5;
    if (k > 0) { K.plat(bx, top, bz, 7, 7, '#f3c79b', 0.6); [[3.6, 0, 0.3, 7], [-3.6, 0, 0.3, 7], [0, 3.6, 7, 0.3], [0, -3.6, 7, 0.3]].forEach(([dx, dz, w, d]) => K.box(bx + dx, top + 0.5, bz + dz, w, 1, d, '#b0643a')); }
    else K.plat(bx, 0.15, bz, 7, 7, '#f3c79b', 0.3);
    const pad = K.cyl(bx, top + 0.1, bz, 2.2, 0.15, k === FLOORS ? '#FFC93C' : '#7be0ff', { glow: 0.5 });
    K.label(k === FLOORS ? 'Vârful turnului!' : k === 0 ? 'Liftul magic' : `Etajul ${k}`, k < FLOORS ? 'stai pe cerc' : '', '#e0582f', 2.6, bx, top + 3.2, bz);
    balconies.push({ bx, bz, top, pad });
    if (k === FLOORS) { trig(bx, bz, 1.4, () => { if (!st().top) { st().top = true; save(); reward('tower', 50, 'Ai cucerit Turnul Împărțirii!'); } else ctx.confirm('Cobori și urci din nou turnul?', () => go(0)); }, top + 0.5); continue; }
    trig(bx, bz, 1.4, () => ask('tower', `Turnul Împărțirii · etajul ${k}`, (ok) => {
      if (ok) { ctx.SFX.boing(); go(k + 1); st().floor = Math.max(st().floor, k + 1); save(); ctx.toast(k + 1 === FLOORS ? 'Ai ajuns sus!' : `Urci la etajul ${k + 1}!`); }
      else if (ok === false) { if (k > 0) { go(k - 1); ctx.toast(`Ai alunecat la ${k - 1 ? 'etajul ' + (k - 1) : 'parter'}. Încă o dată!`); } else ctx.toast('Mai încearcă!'); }
    }), top + 0.5);
  }
  const go = (k) => { const b = balconies[k]; ctx.teleport(X(b.bx) + 1.8, Z(b.bz), b.top + 0.6); };

  /* ---------- D. Piața Bunicii: 4 tarabe ---------- */
  const MX = 58, MZ = 58;
  K.plat(MX, 0.08, MZ, 40, 36, '#c9a06a', 0.16);
  K.label('Piața Bunicii', 'ajută fiecare negustor', '#d4a017', 9, MX, 10, MZ - 14);
  const STALLS = [[-12, -6, '#e04848', 'Mere și pere'], [0, -6, '#2EC4A6', 'Pâine'], [12, -6, '#7B5CF6', 'Caiete'], [0, 8, '#ff7a2f', 'Cântarul']];
  const stalls = STALLS.map(([dx, dz, c, name], i) => {
    const x = MX + dx, z = MZ + dz;
    K.box(x, 0.6, z, 7, 1.2, 2, '#b07a45'); K.box(x, 3.6, z - 0.6, 8, 0.25, 3.6, c);
    [-3.4, 3.4].forEach((o) => K.cyl(x + o, 1.8, z + 0.8, 0.25, 3.6, '#8a5a2b'));
    for (let f = 0; f < 5; f++) K.sphere(x - 2.4 + f * 1.2, 1.5, z, 0.8, ['#e04848', '#ffc93c', '#7dbb3a', '#ff9f43', '#c77dff'][(f + i) % 5]);
    K.avatar({ skin: '#f1c9a5', shirt: c, pants: '#3a4a6a', hat: i === 1 ? 'bucatar' : 'sapca', face: 'fericit' }, x, 0.5, z - 2, 0);
    const lb = K.label(name, 'problemă', c, 2.8, x, 5.2, z);
    trig(x, z + 2.2, 1.8, () => {
      if (st().stalls.includes(i)) { ctx.toast('Aici ai ajutat deja. Mulțumesc!'); return; }
      ask('market', `Taraba „${name}”`, (ok) => {
        if (!ok) { if (ok === false) ctx.toast('Negustorul zice: mai socotește o dată!'); return; }
        st().stalls.push(i); save(); ctx.SFX.coin();
        if (st().stalls.length === 4) reward('market', 40, 'Ai ajutat toată piața!'); else { ctx.toast(`Mulțumesc! ${st().stalls.length} din 4 tarabe`); refreshLabels(); }
      });
    });
    return { lb, name, c, x, z };
  });

  /* ---------- E. Castelul Problemelor: Dragonul Calculelor ---------- */
  const CZ = 80;
  [[0, CZ - 20, 15, 'L'], [0, CZ + 20, 40, 'B'], [-20, CZ, 40, 'S'], [20, CZ, 40, 'S']].forEach(([x, z, len, k]) => {
    if (k === 'L') { K.box(-12.5, 4, z, 15, 8, 2, '#8d8aa6', { cast: true }); K.box(12.5, 4, z, 15, 8, 2, '#8d8aa6', { cast: true }); }
    else if (k === 'B') K.box(x, 4, z, len, 8, 2, '#8d8aa6', { cast: true });
    else K.box(x, 4, z, 2, 8, len, '#8d8aa6', { cast: true });
  });
  [[-20, CZ - 20], [20, CZ - 20], [-20, CZ + 20], [20, CZ + 20]].forEach(([x, z]) => { K.cyl(x, 6, z, 5, 12, '#a19dbd', { collide: true, cast: true }); K.cyl(x, 13.5, z, 5.6, 3, '#7B5CF6', { top: 0 }); });
  K.plat(0, 0.08, CZ, 38, 38, '#8f86a8', 0.16);
  K.label('Castelul Problemelor', 'Dragonul Calculelor', '#7B5CF6', 10, 0, 12, CZ - 21);
  const door = K.box(0, 3, CZ - 20, 10, 6, 1.2, '#5a3b8a');
  const doorLbl = K.label('Închis', 'termină 3 zone ca să intri', '#e0582f', 3.6, 0, 7.5, CZ - 22);
  trig(0, CZ - 23, 2.5, () => { if (!castleOpen()) ctx.toast(`Castelul se deschide după 3 zone terminate. Ai ${zonesDone()} din 3.`); });
  // dragonul
  const D = new TransformNode('dragon', ctx.scene); D.position.set(X(0), 0, Z(CZ + 10));
  const part = (m) => { m.parent = D; m.position.x -= X(0); m.position.z -= Z(CZ + 10); return m; };
  const body = part(K.box(0, 3, CZ + 10, 5, 4, 8, '#2f9a5a', { collide: false, cast: true }));
  const neck = part(K.box(0, 5.5, CZ + 6, 2, 4, 2, '#2f9a5a', { collide: false }));
  const head = part(K.box(0, 7.5, CZ + 4.5, 3, 2.4, 3.4, '#38b06a', { collide: false, cast: true }));
  [-0.8, 0.8].forEach((o) => part(K.sphere(o, 8.2, CZ + 2.8, 0.6, '#FFC93C', { glow: 1 })));
  [-1, 1].forEach((o) => part(K.cyl(o * 0.9, 9.2, CZ + 5, 0.5, 1.4, '#f1dca0', { top: 0 })));
  const wingL = part(K.box(-5, 5, CZ + 10, 6, 0.3, 5, '#1f7a46', { collide: false })), wingR = part(K.box(5, 5, CZ + 10, 6, 0.3, 5, '#1f7a46', { collide: false }));
  part(K.box(0, 2, CZ + 16, 1.4, 1.4, 6, '#2f9a5a', { collide: false }));
  const fire = part(K.sphere(0, 7, CZ + 1.5, 1, '#ff7a2f', { glow: 1 })); fire.isVisible = false; const fireZ0 = fire.position.z;
  K.box(0, 3, CZ + 10, 8, 6, 10, '#000', { collide: true }).isVisible = false;
  let hpLbl = null;
  const BOSS_HP = 6;
  const fight = { on: false, hp: BOSS_HP, hearts: 3, hit: 0, burn: 0 };
  const drawHp = () => { if (hpLbl) hpLbl.dispose(); hpLbl = K.label(st().boss && !fight.on ? 'Dragonul învins!' : `Dragon: ${'▮'.repeat(fight.hp)}${'▯'.repeat(BOSS_HP - fight.hp)}`, fight.on ? `Inimile tale: ${'❤'.repeat(fight.hearts)}` : 'stai pe cercul de luptă', '#e0582f', 4.6, 0, 12.5, CZ + 6); };
  K.cyl(0, 0.2, CZ - 4, 4, 0.2, '#e0582f', { glow: 0.4 });
  const nextQ = () => ask('boss', `Dragonul Calculelor · viață ${fight.hp}/${BOSS_HP}`, (ok) => {
    if (ok === null) { fight.on = false; ctx.setFight(false); ctx.toast('Ai fugit din luptă. Revino când ești gata!'); drawHp(); return; }
    if (ok) { fight.hp--; fight.hit = 0.6; ctx.SFX.boing(); } else { fight.hearts--; fight.burn = 1; ctx.SFX.no(); }
    drawHp();
    if (fight.hp <= 0) { fight.on = false; ctx.setFight(false); st().boss = true; save(); reward('boss', 100, 'AI ÎNVINS DRAGONUL CALCULELOR!'); drawHp(); return; }
    if (fight.hearts <= 0) { fight.on = false; ctx.setFight(false); ctx.toast('Dragonul a câștigat de data asta. Antrenează-te și revino!'); drawHp(); return; }
    setTimeout(nextQ, 900);
  });
  trig(0, CZ - 4, 2, () => {
    if (!castleOpen()) return;
    ctx.confirm(st().boss ? 'Te lupți din nou cu Dragonul?' : 'Începi lupta cu Dragonul Calculelor? Fiecare răspuns bun îi ia o viață. Dacă greșești, te arde și pierzi o inimă (ai 3).', () => {
      Object.assign(fight, { on: true, hp: BOSS_HP, hearts: 3 }); ctx.setFight(true); drawHp(); nextQ();
    });
  });

  /* ---------- etichete cu progres ---------- */
  let progLbls = [];
  const zonesDone = () => { const M = st(); return [M.gates >= 5, M.crystals.length >= 8, M.top, M.stalls.length >= 4].filter(Boolean).length; };
  const castleOpen = () => zonesDone() >= 3;
  function refreshLabels() {
    progLbls.forEach((l) => l.dispose()); progLbls = [];
    const M = st();
    progLbls.push(K.label(`${M.crystals.length}/8 cristale`, '', '#3b7ddd', 2.6, 37, 4.6, -6));
    progLbls.push(K.label(`${M.stalls.length}/4 tarabe`, '', '#d4a017', 2.6, MX, 6.6, MZ - 12));
    progLbls.push(K.label(`${M.gates}/5 porți`, '', '#2f8f46', 3.4, 0, 5.4, FZ - 1));
    progLbls.push(K.label(`${zonesDone()}/4 zone terminate`, 'Castelul se deschide la 3', '#7B5CF6', 4, 0, 5, -3));
    stalls.forEach((s, i) => { if (M.stalls.includes(i)) progLbls.push(K.label('✓', '', '#23935a', 1.4, s.x + 3, 4.6, s.z)); });
    const open = castleOpen(); K.setSolid(door, !open); door.isVisible = !open; doorLbl.isVisible = !open;
  }
  // starea salvată
  const M0 = st();
  for (let i = 0; i < M0.gates; i++) { openGate(i); gates[i].g.position.y = -3; gates[i].open = 1; }
  crystals.forEach((c, i) => { if (M0.crystals.includes(i)) c.m.isVisible = false; });
  refreshLabels(); drawHp();

  return {
    id: 'mate', name: 'Orașul Cifrelor', sky: '#ffd6a5', fog: [70, 210], music: 'playful',
    spawn: { x: X(0), z: Z(-8), y: 0.6, yaw: 0 },
    bounds: { x1: X(-110), x2: X(110), z1: Z(-110), z2: Z(110) },
    triggers, fight,
    place: (P) => { const lx = P.x - O.x, lz = P.z - O.z; return lz < -28 && Math.abs(lx) < 20 ? 'Pădurea Adunării' : lx > 34 && Math.abs(lz) < 32 ? 'Peșterile Înmulțirii' : lx < -40 && Math.abs(lz) < 25 ? 'Turnul Împărțirii' : lx > 36 && lz > 38 ? 'Piața Bunicii' : lz > 58 ? 'Castelul Problemelor' : 'piața Orașului Cifrelor'; },
    update(dt, t, P, here) {
      if (!here) return;
      digits.forEach((l, i) => { const a = t * 0.6 + i * 0.628; l.position.set(X(Math.cos(a) * 2.4), 2.6 + Math.sin(t * 2 + i) * 0.3, Z(Math.sin(a) * 2.4)); });
      exitRing.rotation.z += dt;
      gates.forEach((g) => { if (g.open > 0 && g.open < 1) { g.open = Math.min(1, g.open + dt * 0.8); g.g.position.y = g.y - g.open * 4.6; } });
      crystals.forEach((c, i) => { c.m.rotation.y += dt * (1 + i * 0.1); c.m.position.y = 1.6 + Math.sin(t * 2 + i) * 0.2; });
      balconies.forEach((b, k) => { b.pad.rotation.y += dt; });
      wingL.rotation.z = Math.sin(t * 3) * 0.35; wingR.rotation.z = -Math.sin(t * 3) * 0.35;
      head.position.y = 7.5 + Math.sin(t * 1.5) * 0.25;
      if (fight.hit > 0) { fight.hit -= dt; D.position.x = X(0) + Math.sin(fight.hit * 60) * 0.4; } else D.position.x = X(0);
      if (fight.burn > 0) { fight.burn -= dt; fire.isVisible = true; fire.scaling.setAll(1 + (1 - fight.burn) * 5); fire.position.z = fireZ0 - (1 - fight.burn) * 9; } else { fire.isVisible = false; fire.scaling.setAll(1); }
      D.rotation.y = Math.atan2(P.x - D.position.x, P.z - D.position.z) + Math.PI;
      if (st().boss && !fight.on) D.position.y = Math.max(-4, D.position.y - dt * 0.5); else D.position.y = 0;
    }
  };
}
