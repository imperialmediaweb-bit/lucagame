// Laboratorul Naturii (Științe): Sanctuarul Animalelor, Corpul Uriaș, Poteca Pământului.
import { makeKit } from './kit.js';
import { worldBase, makeBanner } from './games.js';

const O = { x: 600, z: 600 };

export function buildStiinte(ctx) {
  const K = makeKit(ctx, O.x, O.z), W = worldBase(ctx, K, 'stiinte', O), { X, Z } = W;
  const st = () => W.st({});
  K.plat(0, 0, 0, 210, 210, '#5fb85a', 3); W.fence('#6b4a2b');
  // laboratorul din mijloc
  K.plat(0, 0.1, 0, 24, 24, '#a8cf94', 0.2);
  K.box(7, 2.5, 4, 8, 5, 6, '#f4f7f2', { cast: true }); K.sphere(7, 5.2, 4, 6, '#2EC4A6', { cast: true });
  K.label('Laboratorul Naturii', 'Lumea Științelor · 3 locuri de descoperit', '#23935a', 9, 0, 9, -3);
  const ring = W.exit(0, 8);
  W.sign(-4, -13, '↑ Sanctuarul Animalelor', '#d35400'); W.sign(13, -4, '→ Corpul Uriaș', '#e04848'); W.sign(-13, 4, '← Poteca Pământului', '#3b7ddd');
  for (let i = 0; i < 40; i++) { const a = i * 2.4, r = 30 + (i * 13) % 60; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.abs(x) < 16 && z < -15 && z > -95) continue; if (x > 40 && Math.abs(z) < 25) continue; if (x < -30 && Math.abs(z) < 12) continue; K.tree(x, z, 1 + (i % 3) * 0.3, ['#2f8f46', '#3f9c4a', '#1f7a3b'][i % 3]); }
  // cascada
  K.box(-60, 8, -70, 18, 16, 6, '#7d8a8f', { cast: true }); K.box(-60, 7, -66.8, 8, 14, 0.4, '#7fd3ff', { collide: false, glow: 0.3 }); K.cyl(-60, 0.1, -62, 14, 0.2, '#5ab8e8', { glow: 0.2 });

  /* A. Sanctuarul Animalelor: găsești animalele rătăcite și le duci acasă */
  K.plat(0, 0.1, -32, 22, 12, '#c9a06a', 0.2);
  [[0, -38, 22, 0.4], [-11, -32, 0.4, 12], [11, -32, 0.4, 12]].forEach(([x, z, w, d]) => K.box(x, 0.6, z, w, 1.2, d, '#8a5a2b'));
  K.label('Sanctuarul Animalelor', 'găsește cele 6 animale rătăcite', '#d35400', 8, 0, 6, -32);
  const AN = [['vulpea', '#e67e22', -40, -60], ['ursul', '#7b4a2a', 35, -70], ['iepurele', '#f4f4f4', -20, -85], ['broasca', '#5ccf3a', 50, -40], ['căprioara', '#c89b6a', -55, -30], ['bufnița', '#9a8f86', 20, -95]];
  const animals = AN.map(([name, c, x, z], i) => {
    const body = K.box(x, 0.9, z, 1.6, 1, 2.2, c, { collide: false, cast: true });
    const head = K.box(x, 1.7, z - 1.2, 1.1, 1, 1, c, { collide: false, cast: true });
    const legs = [[-0.5, -0.7], [0.5, -0.7], [-0.5, 0.7], [0.5, 0.7]].map(([dx, dz]) => K.box(x + dx, 0.3, z + dz, 0.3, 0.6, 0.3, c, { collide: false }));
    const eyes = [-0.3, 0.3].map((dx) => K.box(x + dx, 1.85, z - 1.72, 0.18, 0.18, 0.05, '#1F2B3A', { collide: false }));
    const lb = K.label(name, 'rătăcit · atinge-l', '#d35400', 2.6, x, 3.2, z);
    const parts = [body, head, ...legs, ...eyes];
    return { name, x, z, parts, lb, home: { x: -8 + i * 3.2, z: -32 } };
  });
  const moveAnimal = (a, hx, hz) => { const dx = X(hx) - a.parts[0].position.x, dz = Z(hz) - a.parts[0].position.z; a.parts.forEach((p) => { p.position.x += dx; p.position.z += dz; }); a.lb.dispose(); };
  const nAnimals = W.collect({ key: 'animals', state: st, items: animals.map((a) => ({ x: a.x, z: a.z, r: 2.2 })), types: () => W.typesOf(['sAnimale', 'sViata'], 'stiinte'),
    title: 'Animalul', msgOk: 'Animalul e în sanctuar!', msgBad: 'Animalul s-a speriat și a fugit. Încearcă din nou!', msgAll: 'Toate animalele sunt acasă!', coins: 40,
    onSolve: (it, i) => moveAnimal(animals[i], animals[i].home.x, animals[i].home.z), done: () => refresh() });

  /* B. Corpul Uriaș: un om uriaș cu organele care se aprind */
  const BX = 68;
  K.plat(BX, 0.1, 0, 34, 30, '#f0d9c4', 0.2);
  const giant = K.avatar({ skin: '#f1c9a5', shirt: '#7fb8ff', pants: '#3a4a6a', hat: 'nimic', face: 'zambet' }, BX + 8, 0.2, 0, -Math.PI / 2); giant.root.scaling.setAll(6);
  K.box(BX + 8, 9, 0, 6, 18, 6, '#000', { collide: true }).isVisible = false;
  K.label('Corpul Uriaș', 'aprinde cele 5 organe', '#e04848', 8, BX - 6, 8, -12);
  const ORG = [['creierul', '#ff8ac0', 17.5, 0], ['inima', '#e04848', 11.5, -1.2], ['plămânii', '#ff9f9f', 11, 1.4], ['stomacul', '#ffb347', 8.5, 0], ['oasele', '#f4f4f4', 3, 1]];
  const organs = ORG.map(([name, c, y, dz], i) => {
    const s = K.sphere(BX + 4.2, y, dz, 1.4, c, { glow: 0.2 }); s.visibility = 0.55;
    const z = -10 + i * 5;
    K.cyl(BX - 2, 0.15, z, 2.4, 0.15, c, { glow: 0.4 }); K.label(name, '', '#e04848', 2.6, BX - 2, 3, z);
    return { s, x: BX - 2, z };
  });
  const nOrgans = W.collect({ key: 'organs', state: st, items: organs.map((o) => ({ x: o.x, z: o.z, r: 1.4 })), types: () => W.typesOf(['sOmul', 'sCorpuri'], 'stiinte'),
    title: 'Organul', msgOk: 'S-a aprins!', msgBad: 'Nu s-a aprins. Mai încearcă!', msgAll: 'Corpul uriaș s-a trezit!', coins: 40,
    onSolve: (it, i) => { organs[i].s.visibility = 1; organs[i].s.material = organs[i].s.material; }, done: () => refresh() });

  /* C. Poteca Pământului: alegi poteca bună prin 3 porți de stâncă */
  const banner = makeBanner('wqSt');
  const STG = [-38, -56, -74], AR = [-4.5, 0, 4.5];
  K.label('Poteca Pământului', 'alege poteca bună', '#3b7ddd', 8, -32, 7, -10);
  STG.forEach((wx) => {
    K.plat(wx + 9, 0.1, 0, 18, 16, '#b9a37a', 0.2);
    K.box(wx + 9, 2, -8, 18, 4, 1, '#7d8a8f'); K.box(wx + 9, 2, 8, 18, 4, 1, '#7d8a8f');
    [[-6.9, 2.2], [-2.25, 1.9], [2.25, 1.9], [6.9, 2.2]].forEach(([z, w]) => K.box(wx, 2, z, 1, 4, w, '#7d8a8f'));
    AR.forEach((z) => K.box(wx, 3.6, z, 1, 0.8, 2.6, '#7d8a8f'));
  });
  K.plat(-88, 0.1, 0, 12, 16, '#FFC93C', 0.2); K.label('Ai ajuns la Observator!', '', '#3b7ddd', 4, -88, 4, 0);
  K.cyl(-92, 3, 0, 4, 6, '#ffffff', { collide: true }); K.sphere(-92, 6.5, 0, 4, '#3b7ddd');
  const path = W.paths({ key: 'path', state: st, banner, title: 'Poteca Pământului', types: () => W.typesOf(['sPamant', 'sViata', 'sCorpuri'], 'stiinte'),
    stages: STG.map((wx) => ({ back: { x: wx + 14, z: 0 }, gates: AR.map((z) => ({ x: wx - 0.6, z, tz: z })) })),
    coins: 40, msgAll: 'Ai ajuns la Observatorul Pământului!', onDone: () => refresh(), gateColor: '#3b7ddd' });
  W.trig(-86, 0, 2, () => { if (st().path >= STG.length) ctx.confirm('Mergi din nou pe Poteca Pământului?', () => { path.reset(); ctx.teleport(X(STG[0] + 14), Z(0)); }); });

  let prog = [];
  function refresh() {
    prog.forEach((l) => l.dispose()); prog = [];
    prog.push(K.label(`${nAnimals()}/6 animale`, '', '#d35400', 3, 0, 3.8, -32));
    prog.push(K.label(`${nOrgans()}/5 organe`, '', '#e04848', 3, BX - 6, 5.6, -12));
    prog.push(K.label(`${Math.min(st().path, 3)}/3 porți`, '', '#3b7ddd', 3, -32, 4.8, -10));
  }
  // starea salvată
  (st().animals || []).forEach((i) => moveAnimal(animals[i], animals[i].home.x, animals[i].home.z));
  (st().organs || []).forEach((i) => (organs[i].s.visibility = 1));
  refresh();
  if (location.hostname === 'localhost') window.__st = { path: () => path.current() };

  return {
    id: 'stiinte', name: 'Laboratorul Naturii', sky: '#c8f2dc', fog: [70, 210], music: 'forest',
    spawn: { x: X(0), z: Z(-10), y: 0.6, yaw: 0 }, bounds: { x1: X(-110), x2: X(110), z1: Z(-110), z2: Z(110) },
    triggers: W.triggers, fight: null,
    place: (P) => { const lx = P.x - O.x, lz = P.z - O.z; return lz < -20 ? 'Sanctuarul Animalelor' : lx > 45 ? 'Corpul Uriaș' : lx < -30 ? 'Poteca Pământului' : 'Laboratorul Naturii'; },
    update(dt, t, P, here) {
      const lx = P.x - O.x, lz = P.z - O.z;
      banner.hidden = !(here && path.active() && lx < -30 && lx > -84 && Math.abs(lz) < 8) || !document.getElementById('quiz').hidden || !document.getElementById('panel').hidden;
      if (!here) return;
      ring.rotation.z += dt;
      animals.forEach((a, i) => { a.parts[1].position.y = 1.7 + Math.sin(t * 3 + i) * 0.08; });
      organs.forEach((o, i) => { if (o.s.visibility === 1) o.s.scaling.setAll(1 + Math.sin(t * 4 + i) * 0.08); });
      giant.update(dt, { wave: nOrgans() >= 5 });
    }
  };
}
