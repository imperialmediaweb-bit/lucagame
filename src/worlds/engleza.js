// English Island (Engleză): Portul Corăbiilor, Turnul cu Baloane, Podul Gramaticii.
import { makeKit } from './kit.js';
import { worldBase, makeBanner } from './games.js';

const O = { x: -600, z: 600 };

export function buildEngleza(ctx) {
  const K = makeKit(ctx, O.x, O.z), W = worldBase(ctx, K, 'engleza', O), { X, Z } = W;
  const st = () => W.st({});
  K.plat(0, 0, -15, 210, 180, '#f3dc9a', 3);
  K.box(0, -1.1, 90, 210, 0.2, 30, '#2f8fd8', { collide: false, glow: 0.15 });
  [[0, -103, 210, 1], [-103, 0, 1, 210], [103, 0, 1, 210], [0, 104, 210, 1]].forEach(([x, z, w, d]) => K.box(x, 1.5, z, w, 3, d, '#c98e5f'));
  K.plat(0, 0.1, 0, 24, 24, '#c9b48e', 0.2);
  // căsuța roșie de telefon și autobuzul cu etaj, ca semne ale insulei
  K.box(-8, 1.6, -6, 1.6, 3.2, 1.6, '#d62828', { cast: true }); K.box(9, 2.2, -8, 9, 4.4, 3, '#d62828', { cast: true }); K.box(9, 4.6, -8, 9.2, 0.3, 3.2, '#ffffff');
  for (let i = 0; i < 4; i++) K.box(5.6 + i * 2.2, 3.3, -6.45, 1.6, 1, 0.1, '#bfe3ff', { collide: false });
  K.label('English Island', 'Learn English · 3 adventures', '#3b7ddd', 9, 0, 9, -2);
  const ring = W.exit(0, 8);
  W.sign(-4, 13, '↓ The Ship Harbour', '#3b7ddd'); W.sign(13, -4, '→ Balloon Tower', '#d62828'); W.sign(-13, -4, '← Grammar Bridge', '#2f8f46');
  for (let i = 0; i < 24; i++) { const x = -95 + (i * 37) % 190, z = -95 + (i * 23) % 60; if (Math.abs(x) < 20) continue; K.cyl(x, 2.5, z, 0.5, 5, '#8a5a2b', { collide: true }); K.cyl(x, 5.3, z, 4, 1.2, '#2f8f46', { tess: 7 }); }

  /* A. Portul Corăbiilor: fiecare cuvânt corect trimite o corabie pe mare */
  K.box(0, 0.1, 74, 120, 0.4, 6, '#9c6b3e');
  const SH = [-48, -24, 0, 24, 48];
  const ships = SH.map((x, i) => {
    K.box(x, 0.1, 68, 3, 0.4, 6, '#9c6b3e');
    const hull = K.box(x, -0.2, 84, 5, 2, 10, ['#8a5a2b', '#a0522d', '#6b3f1f', '#8a5a2b', '#a0522d'][i], { collide: false, cast: true });
    const mast = K.cyl(x, 4, 84, 0.3, 8, '#5d4a3a'); const sail = K.box(x, 4.6, 84, 0.2, 4.4, 5, ['#ffffff', '#ffe08a', '#bfe3ff', '#ffc6d9', '#d9ffb0'][i], { collide: false });
    K.label(`Ship ${i + 1}`, 'touch the dock', '#3b7ddd', 2.8, x, 3.2, 72);
    return { x, z: 72, parts: [hull, mast, sail], go: 0 };
  });
  K.label('The Ship Harbour', 'trimite toate corăbiile pe mare', '#3b7ddd', 9, 0, 8, 62);
  const nShips = W.collect({ key: 'ships', state: st, items: ships.map((s) => ({ x: s.x, z: s.z, r: 1.8 })), types: () => W.typesOf(['enVocab', 'enNumere'], 'engleza'),
    title: 'Corabia', msgOk: 'Corabia a plecat pe mare!', msgBad: 'Corabia nu pleacă. Încearcă din nou!', msgAll: 'Toate corăbiile au plecat! Great job!', coins: 40,
    onSolve: (it, i) => (ships[i].go = 0.001), done: () => refresh() });

  /* B. Turnul cu Baloane: fiecare balon prins zboară în cer */
  const TX = 62;
  K.plat(TX, 0.1, -10, 30, 30, '#d9d2c4', 0.2);
  K.box(TX, 9, -10, 6, 18, 6, '#c9a06a', { cast: true }); K.box(TX, 18.6, -10, 7, 1.2, 7, '#8a5a2b');
  K.cyl(TX, 15, -6.9, 4, 0.3, '#ffffff', { collide: false }).rotation.x = Math.PI / 2;
  const hand = K.box(TX, 15.6, -6.6, 0.25, 1.6, 0.1, '#1F2B3A', { collide: false });
  K.label('Balloon Tower', 'prinde cele 6 baloane cu numere', '#d62828', 8, TX, 22, -10);
  const BL = [[TX - 11, -20], [TX - 12, 0], [TX + 11, -22], [TX + 12, 2], [TX, -24], [TX - 4, 4]];
  const balloons = BL.map(([x, z], i) => {
    const b = K.sphere(x, 3, z, 1.8, ['#e04848', '#3b7ddd', '#FFC93C', '#2EC4A6', '#7B5CF6', '#FF7A2F'][i], { glow: 0.15 });
    const str = K.cyl(x, 1.4, z, 0.05, 2.6, '#ffffff', { collide: false });
    return { x, z, b, str, fly: 0 };
  });
  const nBalloons = W.collect({ key: 'balloons', state: st, items: balloons.map((b) => ({ x: b.x, z: b.z, r: 1.8 })), types: () => W.typesOf(['enNumere', 'enVocab'], 'engleza'),
    title: 'Balonul', msgOk: 'Balonul zboară!', msgBad: 'Balonul ți-a scăpat. Încearcă din nou!', msgAll: 'Toate baloanele sunt în cer! Well done!', coins: 40,
    onSolve: (it, i) => (balloons[i].fly = 0.001), done: () => refresh() });

  /* C. Podul Gramaticii: treci pe poarta cu propoziția corectă */
  const banner = makeBanner('wqEn');
  const STG = [-38, -56, -74], AR = [-4.5, 0, 4.5];
  K.label('Grammar Bridge', 'alege poarta corectă', '#2f8f46', 8, -32, 7, -10);
  STG.forEach((wx) => {
    K.plat(wx + 9, 0.1, 0, 18, 16, '#a6d995', 0.2);
    K.box(wx + 9, 1, -8, 18, 2, 1, '#ffffff'); K.box(wx + 9, 1, 8, 18, 2, 1, '#ffffff');
    [[-6.9, 2.2], [-2.25, 1.9], [2.25, 1.9], [6.9, 2.2]].forEach(([z, w]) => K.box(wx, 2, z, 1, 4, w, '#3b7ddd'));
    AR.forEach((z) => K.box(wx, 3.6, z, 1, 0.8, 2.6, '#d62828'));
  });
  K.plat(-88, 0.1, 0, 12, 16, '#FFC93C', 0.2); K.label('You did it!', '', '#2f8f46', 4, -88, 4, 0);
  const path = W.paths({ key: 'path', state: st, banner, title: 'Grammar Bridge', types: () => W.typesOf(['enGramatica', 'enVocab'], 'engleza'),
    stages: STG.map((wx) => ({ back: { x: wx + 14, z: 0 }, gates: AR.map((z) => ({ x: wx - 0.6, z, tz: z })) })),
    coins: 40, msgAll: 'Ai trecut Podul Gramaticii! Excellent!', onDone: () => refresh() });
  W.trig(-86, 0, 2, () => { if (st().path >= STG.length) ctx.confirm('Treci din nou Podul Gramaticii?', () => { path.reset(); ctx.teleport(X(STG[0] + 14), Z(0)); }); });

  let prog = [];
  function refresh() {
    prog.forEach((l) => l.dispose()); prog = [];
    prog.push(K.label(`${nShips()}/5 corăbii`, '', '#3b7ddd', 3, 0, 5.4, 62));
    prog.push(K.label(`${nBalloons()}/6 baloane`, '', '#d62828', 3, TX, 20, -10));
    prog.push(K.label(`${Math.min(st().path, 3)}/3 porți`, '', '#2f8f46', 3, -32, 4.8, -10));
  }
  (st().ships || []).forEach((i) => { ships[i].go = 1; ships[i].parts.forEach((p) => (p.position.z += 60)); });
  (st().balloons || []).forEach((i) => { balloons[i].b.isVisible = false; balloons[i].str.isVisible = false; });
  refresh();
  if (location.hostname === 'localhost') window.__en = { path: () => path.current() };

  return {
    id: 'engleza', name: 'English Island', sky: '#bfe3ff', fog: [70, 220], music: 'playful',
    spawn: { x: X(0), z: Z(-8), y: 0.6, yaw: 0 }, bounds: { x1: X(-110), x2: X(110), z1: Z(-110), z2: Z(110) },
    triggers: W.triggers, fight: null,
    place: (P) => { const lx = P.x - O.x, lz = P.z - O.z; return lz > 50 ? 'The Ship Harbour' : lx > 40 ? 'Balloon Tower' : lx < -30 ? 'Grammar Bridge' : 'English Island'; },
    update(dt, t, P, here) {
      const lx = P.x - O.x, lz = P.z - O.z;
      const inPath = here && lx < -30 && lx > -84 && Math.abs(lz) < 8; path.tick(inPath);
      banner.hidden = !(inPath && path.active()) || !document.getElementById('quiz').hidden || !document.getElementById('panel').hidden;
      if (!here) return;
      ring.rotation.z += dt; hand.rotation.z = -t * 0.5;
      ships.forEach((s, i) => {
        if (s.go > 0 && s.go < 1) { s.go = Math.min(1, s.go + dt * 0.25); s.parts.forEach((p) => (p.position.z += dt * 15)); }
        s.parts[0].rotation.z = Math.sin(t * 1.5 + i) * 0.05;
      });
      balloons.forEach((b, i) => {
        if (b.fly > 0) { b.fly += dt; b.b.position.y += dt * 6; b.str.position.y += dt * 6; if (b.fly > 6) { b.b.isVisible = false; b.str.isVisible = false; } }
        else b.b.position.y = 3 + Math.sin(t * 2 + i) * 0.3;
      });
    }
  };
}
