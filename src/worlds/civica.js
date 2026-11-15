// Orașul Bunătății (Civică): Vecinii care au nevoie de ajutor, Grădina Prieteniei, Strada cu Reguli.
import { makeKit } from './kit.js';
import { worldBase, makeBanner } from './games.js';

const O = { x: 0, z: 600 };

export function buildCivica(ctx) {
  const K = makeKit(ctx, O.x, O.z), W = worldBase(ctx, K, 'civica', O), { X, Z } = W;
  const st = () => W.st({});
  K.plat(0, 0, 0, 210, 210, '#8fd18a', 3); W.fence('#ff8ac0');
  K.plat(0, 0.1, 0, 24, 24, '#f0a8c6', 0.2);
  K.cyl(0, 1, 0, 3, 2, '#ff8ac0', { collide: true }); K.sphere(0, 3.4, 0, 2.6, '#e04878', { glow: 0.3 });
  K.label('Orașul Bunătății', 'Lumea Civicei · fii de ajutor', '#e04878', 9, 0, 8, 0);
  const ring = W.exit(0, 9);
  W.sign(-4, -13, '↑ Vecinii', '#e04878'); W.sign(13, 4, '→ Grădina Prieteniei', '#23935a'); W.sign(-13, 4, '← Strada cu Reguli', '#3b7ddd');
  const HC = ['#ffd1a6', '#c6f2ff', '#ffe08a', '#e5c8ff', '#b8f0c9', '#ffc6d9'];

  /* A. Vecinii: 6 oameni au nevoie de ajutor; răspunzi bine și se bucură */
  const NB = [[-30, -40, 'Bunicul Ion'], [-10, -55, 'Doamna Maria'], [12, -42, 'Micul Tudor'], [30, -60, 'Vecina Elena'], [-22, -75, 'Domnul Paul'], [18, -82, 'Sora Ioana']];
  const neighbours = NB.map(([x, z, name], i) => {
    K.box(x, 3, z - 7, 9, 6, 7, HC[i], { cast: true }); K.cyl(x, 7.2, z - 7, 11, 2.6, '#c0392b', { top: 0, tess: 4 }).rotation.y = Math.PI / 4;
    const look = { skin: ['#f1c9a5', '#d8a27a', '#8d5a3b', '#f6d7c0', '#c98e5f', '#f1c9a5'][i], shirt: ['#7B5CF6', '#e04848', '#2EC4A6', '#FF7A2F', '#3b7ddd', '#d4a017'][i], pants: '#3a4a6a', hat: ['palarie', 'fundita', 'sapca', 'nimic', 'palarie', 'urechi'][i], face: 'surprins' };
    const av = K.avatar(look, x, 0.5, z, 0);
    const lb = K.label(name, 'are nevoie de ajutor!', '#e04878', 3, x, 3.6, z);
    return { x, z, av, lb, look, happy: false };
  });
  const nHelp = W.collect({ key: 'help', state: st, items: neighbours.map((n) => ({ x: n.x, z: n.z + 2.2, r: 2, again: 'Mulțumesc că m-ai ajutat!' })), types: () => W.typesOf(['civica'], 'civica'),
    title: 'Vecinul', msgOk: 'Vecinul e fericit!', msgBad: 'Mai gândește-te: ce e cel mai corect?', msgAll: 'Ai ajutat tot cartierul!', coins: 40,
    onSolve: (it, i) => makeHappy(i), done: () => refresh() });
  function makeHappy(i) { const n = neighbours[i]; n.happy = true; n.av.setLook({ ...n.look, face: 'fericit' }); n.lb.dispose(); n.lb = K.label('Mulțumesc!', '', '#23935a', 2.6, n.x, 3.6, n.z); }

  /* B. Grădina Prieteniei: fiecare faptă bună face să crească o floare uriașă */
  const GX = 60;
  K.plat(GX, 0.1, 0, 32, 28, '#6b4a2b', 0.2);
  K.label('Grădina Prieteniei', 'plantează 5 flori ale prieteniei', '#23935a', 8, GX, 8, -12);
  const FL = [[GX - 9, -6], [GX, -8], [GX + 9, -6], [GX - 5, 5], [GX + 5, 5]];
  const flowers = FL.map(([x, z], i) => {
    const stem = K.cyl(x, 2, z, 0.35, 4, '#2f8f46', { collide: false }); const head = K.sphere(x, 4.4, z, 2.2, ['#ff8ac0', '#FFC93C', '#c77dff', '#ff7a2f', '#7be0ff'][i], { glow: 0.2 });
    K.cyl(x, 0.3, z, 1.6, 0.4, '#8a5a2b');
    stem.scaling.setAll(0.05); head.scaling.setAll(0.05);
    return { x, z, stem, head, grow: 0 };
  });
  const nFlowers = W.collect({ key: 'flowers', state: st, items: flowers.map((f) => ({ x: f.x, z: f.z + 1.6, r: 1.6 })), types: () => W.typesOf(['civica'], 'civica'),
    title: 'Floarea', msgOk: 'A crescut o floare!', msgBad: 'Floarea mai așteaptă. Încearcă din nou!', msgAll: 'Grădina Prieteniei e înflorită!', coins: 40,
    onSolve: (it, i) => (flowers[i].grow = 0.001), done: () => refresh() });

  /* C. Strada cu Reguli: alegi poarta cu fapta corectă, ca la trecerea de pietoni */
  const banner = makeBanner('wqCv');
  const STG = [-38, -56, -74], AR = [-4.5, 0, 4.5];
  K.label('Strada cu Reguli', 'treci pe poarta cu fapta corectă', '#3b7ddd', 8, -32, 7, -10);
  STG.forEach((wx) => {
    K.plat(wx + 9, 0.08, 0, 18, 16, '#555c6b', 0.16);
    for (let k = 0; k < 6; k++) K.box(wx + 3 + k * 2.4, 0.18, 0, 1.2, 0.04, 12, '#ffffff', { collide: false });
    K.box(wx + 9, 2, -8, 18, 4, 1, '#c0c6d4'); K.box(wx + 9, 2, 8, 18, 4, 1, '#c0c6d4');
    [[-6.9, 2.2], [-2.25, 1.9], [2.25, 1.9], [6.9, 2.2]].forEach(([z, w]) => K.box(wx, 2, z, 1, 4, w, '#c0c6d4'));
    AR.forEach((z) => K.box(wx, 3.6, z, 1, 0.8, 2.6, '#3b7ddd'));
    K.cyl(wx + 16, 2, 7, 0.3, 4, '#3d3d4f'); K.box(wx + 16, 4.4, 7, 0.8, 2, 0.6, '#1F2B3A'); K.sphere(wx + 16, 4.9, 6.6, 0.45, '#e04848', { glow: 0.8 }); K.sphere(wx + 16, 3.9, 6.6, 0.45, '#23c45a', { glow: 0.8 });
  });
  K.plat(-88, 0.1, 0, 12, 16, '#FFC93C', 0.2); K.label('Ai respectat regulile!', '', '#3b7ddd', 4, -88, 4, 0);
  const path = W.paths({ key: 'path', state: st, banner, title: 'Strada cu Reguli', types: () => W.typesOf(['civica'], 'civica'),
    stages: STG.map((wx) => ({ back: { x: wx + 14, z: 0 }, gates: AR.map((z) => ({ x: wx - 0.6, z, tz: z })) })),
    coins: 40, msgAll: 'Ai trecut Strada cu Reguli!', onDone: () => refresh(), gateColor: '#3b7ddd' });
  W.trig(-86, 0, 2, () => { if (st().path >= STG.length) ctx.confirm('Treci din nou Strada cu Reguli?', () => { path.reset(); ctx.teleport(X(STG[0] + 14), Z(0)); }); });

  let prog = [];
  function refresh() {
    prog.forEach((l) => l.dispose()); prog = [];
    prog.push(K.label(`${nHelp()}/6 vecini ajutați`, '', '#e04878', 3.4, 0, 5.4, -28));
    prog.push(K.label(`${nFlowers()}/5 flori`, '', '#23935a', 3, GX, 5.8, -12));
    prog.push(K.label(`${Math.min(st().path, 3)}/3 porți`, '', '#3b7ddd', 3, -32, 4.8, -10));
  }
  K.label('Vecinii', 'ajută-i pe toți', '#e04878', 7, 0, 8, -28);
  (st().help || []).forEach(makeHappy);
  (st().flowers || []).forEach((i) => { flowers[i].grow = 1; flowers[i].stem.scaling.setAll(1); flowers[i].head.scaling.setAll(1); });
  refresh();
  if (location.hostname === 'localhost') window.__cv = { path: () => path.current() };

  return {
    id: 'civica', name: 'Orașul Bunătății', sky: '#ffe0ef', fog: [70, 210], music: 'chill',
    spawn: { x: X(0), z: Z(-14), y: 0.6, yaw: 0 }, bounds: { x1: X(-110), x2: X(110), z1: Z(-110), z2: Z(110) },
    triggers: W.triggers, fight: null,
    place: (P) => { const lx = P.x - O.x, lz = P.z - O.z; return lz < -25 ? 'cartierul Vecinilor' : lx > 40 ? 'Grădina Prieteniei' : lx < -30 ? 'Strada cu Reguli' : 'Orașul Bunătății'; },
    update(dt, t, P, here) {
      const lx = P.x - O.x, lz = P.z - O.z;
      banner.hidden = !(here && path.active() && lx < -30 && lx > -84 && Math.abs(lz) < 8) || !document.getElementById('quiz').hidden || !document.getElementById('panel').hidden;
      if (!here) return;
      ring.rotation.z += dt;
      neighbours.forEach((n) => n.av.update(dt, { dance: n.happy, wave: !n.happy }));
      flowers.forEach((f, i) => {
        if (f.grow > 0 && f.grow < 1) { f.grow = Math.min(1, f.grow + dt * 0.7); f.stem.scaling.setAll(f.grow); f.head.scaling.setAll(f.grow); }
        if (f.grow >= 1) f.head.rotation.y += dt * (0.5 + i * 0.1);
      });
    }
  };
}
