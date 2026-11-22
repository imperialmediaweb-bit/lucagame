// Lumea: insula din mijloc, 4 insule (Clasa I, a II-a, a III-a, Arena Testului), poduri, NPC-uri, monede, trambuline, comori.
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { mat, createAvatar, makeLabel } from './avatar.js';
import { AREAS, MISSIONS } from './content/missions.js';

export function buildWorld(scene, shadow) {
  const colliders = [];
  const statics = [];
  let n = 0;
  function box(x, y, z, w, h, d, color, opt = {}) {
    const m = MeshBuilder.CreateBox('b' + n++, { width: w, height: h, depth: d }, scene);
    m.position.set(x, y, z); m.material = mat(scene, color, opt.glow || 0); m.receiveShadows = true;
    if (opt.cast) shadow.addShadowCaster(m);
    if (opt.collide !== false) colliders.push({ x1: x - w / 2, x2: x + w / 2, y1: y - h / 2, y2: y + h / 2, z1: z - d / 2, z2: z + d / 2, bounce: opt.bounce || 0, mesh: m });
    if (!opt.dynamic) statics.push(m);
    return m;
  }
  // platformă: dată prin vârful de sus
  const plat = (x, top, z, w, d, color, h = 0.6, opt) => box(x, top - h / 2, z, w, h, d, color, opt);

  // apă
  const water = MeshBuilder.CreateGround('water', { width: 600, height: 600 }, scene);
  water.position.y = -1.2; const wm = new StandardMaterial('wm', scene); wm.diffuseColor = Color3.FromHexString('#3aa6d8'); wm.specularColor = new Color3(0.3, 0.3, 0.3); wm.alpha = 0.92; water.material = wm;

  // insula din mijloc
  plat(0, 0, 0, 40, 40, '#7ccf6a', 3);
  plat(0, -0.3, 0, 43, 43, '#f1dca0', 3);
  // piața centrală
  plat(0, 0.12, 0, 12, 12, '#e8e0cf', 0.24);
  const statue = createAvatar(scene, { skin: '#d8d2c4', shirt: '#d8d2c4', pants: '#d8d2c4', hat: 'coroana', face: 'fericit' }, shadow, 'statue');
  statue.root.position.set(0, 1.4, 0); statue.root.scaling.setAll(1.3);
  plat(0, 1.4, 0, 2.4, 2.4, '#cfc6b2', 1.3, { cast: true });
  const hubLbl = makeLabel(scene, 'Mintoria', 'Orașul Minții · alege un portal', '#7B5CF6', 4.6); hubLbl.position.set(0, 6.4, 0);

  // poduri + portaluri spre insule
  const pads = [], gates = {};
  AREAS.forEach((a) => {
    const [ax, az] = a.pos, dx = Math.sign(ax), dz = Math.sign(az);
    // pod
    const len = 16, mid = 20 + len / 2 - 0.5;
    if (a.portalOnly) { /* insulă la care se ajunge doar prin portal */ }
    else if (dx) { plat(dx * mid, 0, 0, len + 1, 4.4, '#b07a45', 0.5); [-2.4, 2.4].forEach((o) => box(dx * mid, 0.45, o, len + 1, 0.9, 0.25, '#8a5a2b')); }
    else { plat(0, 0, dz * mid, 4.4, len + 1, '#b07a45', 0.5); [-2.4, 2.4].forEach((o) => box(o, 0.45, dz * mid, 0.25, 0.9, len + 1, '#8a5a2b')); }
    // insula zonei
    plat(ax, 0, az, 36, 36, a.ground, 3);
    plat(ax, -0.3, az, 39, 39, '#f1dca0', 3);
    // portal în piață
    const px = a.portalOnly ? dx * 4.6 : dx * 9, pz = a.portalOnly ? dz * 4.6 : dz * 9;
    const pad = MeshBuilder.CreateCylinder('pad' + a.id, { height: 0.25, diameter: 3.2, tessellation: 32 }, scene);
    pad.position.set(px, 0.13, pz); pad.material = mat(scene, a.color, 0.2);
    const ring = MeshBuilder.CreateTorus('ring' + a.id, { diameter: 3.2, thickness: 0.2, tessellation: 40 }, scene);
    ring.position.set(px, 1.6, pz); ring.material = mat(scene, a.color, 0.35);
    const lb = makeLabel(scene, a.short, a.name, a.color, 3.4); lb.position.set(px, 3.6, pz);
    pads.push({ area: a, x: px, z: pz, ring });
    if (a.portalOnly) return;
    // indicator la capătul podului
    const sign = makeLabel(scene, a.short, 'pe aici →', a.color, 2.6); sign.position.set(dx * 19, 2.6, dz * 19);
    // barieră pe pod, pentru clasele închise
    const gx = dx * 20.8, gz = dz * 20.8, gw = dx ? 0.5 : 4.6, gd = dx ? 4.6 : 0.5;
    const bar = box(gx, 1.5, gz, gw, 3, gd, '#d23a3a', { dynamic: true, cast: true });
    const lockLbl = makeLabel(scene, 'Închis', 'nu e clasa ta', '#d23a3a', 2.2); lockLbl.position.set(gx, 3.6, gz);
    const gcol = colliders[colliders.length - 1]; gcol.y2 = 9; gcol.z1 -= dx ? 0.3 : 0; gcol.z2 += dx ? 0.3 : 0; gcol.x1 -= dz ? 0.3 : 0; gcol.x2 += dz ? 0.3 : 0;
    gates[a.id] = { bar, col: gcol, lbl: lockLbl, y1: 0, y2: 9 };
  });

  // ---------- pereți pe margini, ca să nu cazi în apă ----------
  // zid de piatră vizibil + barieră invizibilă mai înaltă (să nu poți sări peste)
  function wallSeg(x, z, w, d) {
    box(x, 0.6, z, w, 1.2, d, '#cfc6b2', { cast: true, collide: false });
    box(x, 1.28, z, w + 0.1, 0.16, d + 0.1, '#a89c88', { collide: false });
    colliders.push({ x1: x - w / 2, x2: x + w / 2, y1: -1, y2: 9, z1: z - d / 2, z2: z + d / 2 });
  }
  function ringWalls(cx, cz, half, open) {
    const gap = 5.2, t = 0.6;
    for (const side of ['n', 's', 'w', 'e']) {
      const horiz = side === 'n' || side === 's', fixed = side === 'n' ? cz - half : side === 's' ? cz + half : side === 'w' ? cx - half : cx + half, c0 = horiz ? cx : cz;
      const parts = open.includes(side) ? [[c0 - half, c0 - gap / 2], [c0 + gap / 2, c0 + half]] : [[c0 - half, c0 + half]];
      for (const [a, b] of parts) { const mid = (a + b) / 2, len = b - a; horiz ? wallSeg(mid, fixed, len, t) : wallSeg(fixed, mid, t, len); }
    }
  }
  ringWalls(0, 0, 20, ['n', 's', 'w', 'e']);
  AREAS.forEach((a) => {
    const [ax, az] = a.pos, open = a.portalOnly ? [] : [az < 0 ? 's' : az > 0 ? 'n' : ax > 0 ? 'w' : 'e'];
    ringWalls(ax, az, 18, open);
    if (!a.portalOnly) { // bariere invizibile pe marginile podurilor
      const dx = Math.sign(ax), dz = Math.sign(az), len = 17, mid = 20 + len / 2 - 0.5;
      for (const o of [-2.4, 2.4]) colliders.push(dx ? { x1: dx * mid - len / 2, x2: dx * mid + len / 2, y1: 0.5, y2: 9, z1: o - 0.15, z2: o + 0.15 } : { x1: o - 0.15, x2: o + 0.15, y1: 0.5, y2: 9, z1: dz * mid - len / 2, z2: dz * mid + len / 2 });
    }
  });

  // nori
  const clouds = [];
  for (let i = 0; i < 14; i++) {
    const c = new TransformNode('cloud' + i, scene);
    const x = (Math.random() - 0.5) * 220, z = (Math.random() - 0.5) * 220, y = 26 + Math.random() * 12;
    c.position.set(x, y, z);
    for (let k = 0; k < 3; k++) { const m = MeshBuilder.CreateBox('cl' + i + k, { width: 6 + Math.random() * 6, height: 2 + Math.random() * 1.5, depth: 4 + Math.random() * 4 }, scene); m.parent = c; m.position.set(k * 3 - 3, Math.random(), Math.random() * 2); m.material = mat(scene, '#ffffff', 0.5); }
    clouds.push(c);
  }

  // copaci, flori
  function tree(x, z, top = 0, kind = 0) {
    const h = 2 + Math.random() * 2;
    box(x, top + h / 2, z, 0.8, h, 0.8, '#8a5a2b', { cast: true });
    const leaf = kind === 1 ? '#2f8a45' : kind === 2 ? '#e88fb0' : ['#3f9e4d', '#4cb05a', '#5cc06a'][Math.floor(Math.random() * 3)];
    box(x, top + h + 1, z, 2.8, 2.4, 2.8, leaf, { collide: false, cast: true });
    if (kind === 1) box(x, top + h + 2.6, z, 1.6, 1.2, 1.6, leaf, { collide: false, cast: true });
  }
  const hubTrees = [[-15, -15], [15, -15], [-15, 15], [15, 15], [-16, -5], [16, 6], [-6, 16], [6, -16]];
  hubTrees.forEach(([x, z]) => tree(x, z, 0, 0));

  const coins = [];
  const coinMat = mat(scene, '#f2b632', 0.6);
  function coin(x, y, z) {
    const m = MeshBuilder.CreateCylinder('coin' + n++, { height: 0.12, diameter: 0.8, tessellation: 20 }, scene);
    m.rotation.x = Math.PI / 2; m.position.set(x, y, z); m.material = coinMat;
    coins.push({ m, back: 0 });
  }
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; coin(Math.cos(a) * 14, 1, Math.sin(a) * 14); }

  // trambulină
  function tramp(x, z, top = 0) {
    const t = box(x, top + 0.2, z, 2.4, 0.4, 2.4, '#e04848', { bounce: 19, cast: true });
    const s = MeshBuilder.CreateBox('ts' + n++, { width: 1.6, height: 0.05, depth: 1.6 }, scene); s.position.set(x, top + 0.42, z); s.material = mat(scene, '#ffffff');
    return t;
  }
  tramp(-6, -12); tramp(6, 12);

  // cufere
  const chests = [];
  function chest(id, x, top, z) {
    const g = new TransformNode('chest' + id, scene); g.position.set(x, top, z);
    const b = MeshBuilder.CreateBox('cb' + id, { width: 1.6, height: 0.9, depth: 1 }, scene); b.parent = g; b.position.y = 0.45; b.material = mat(scene, '#8a5a2b'); shadow.addShadowCaster(b);
    const band = MeshBuilder.CreateBox('cbb' + id, { width: 1.64, height: 0.16, depth: 1.04 }, scene); band.parent = g; band.position.y = 0.62; band.material = mat(scene, '#f2b632', 0.3);
    const piv = new TransformNode('cp' + id, scene); piv.parent = g; piv.position.set(0, 0.9, -0.5);
    const lid = MeshBuilder.CreateBox('cl' + id, { width: 1.6, height: 0.34, depth: 1 }, scene); lid.parent = piv; lid.position.set(0, 0.17, 0.5); lid.material = mat(scene, '#9c6a35');
    colliders.push({ x1: x - 0.8, x2: x + 0.8, y1: top, y2: top + 1.2, z1: z - 0.5, z2: z + 0.5 });
    chests.push({ id, x, z, top, piv, open: 0 });
  }

  // traseu de parkour care urcă spre o comoară
  function obby(id, sx, sz, color, steps = 9, dir = 1) {
    let x = sx, z = sz, top = 0.9; const ang0 = Math.random() * Math.PI * 2;
    for (let i = 0; i < steps; i++) {
      const a = ang0 + dir * i * 0.8;
      x = sx + Math.cos(a) * 4.5; z = sz + Math.sin(a) * 4.5; top = 0.9 + i * 0.95;
      const moving = i === Math.floor(steps / 2);
      const p = plat(x, top, z, 2.6, 2.6, i % 2 ? color : '#ffd27a', 0.5, { cast: true, dynamic: moving });
      if (moving) movers.push({ m: p, c: colliders[colliders.length - 1], base: x, axis: 'x', amp: 1.6, sp: 1.2 });
      if (i % 2 === 0) coin(x, top + 1, z);
    }
    const a = ang0 + dir * steps * 0.8, fx = sx + Math.cos(a) * 4.5, fz = sz + Math.sin(a) * 4.5, ftop = 0.9 + steps * 0.95;
    plat(fx, ftop, fz, 4.4, 4.4, '#f5efe2', 0.5, { cast: true });
    chest(id, fx, ftop, fz);
    const l = makeLabel(scene, 'Comoara', 'urcă dacă poți!', '#f2b632', 2.6); l.position.set(fx, ftop + 3, fz);
  }
  const movers = [];

  // decor pe zone
  AREAS.forEach((a) => {
    const [ax, az] = a.pos;
    if (a.id === '1') {
      // blocuri uriașe cu cifre și litere, pe care se poate sări
      ['1', '2', '3', 'A', 'B', 'C'].forEach((ch, i) => {
        const x = ax - 13 + (i % 3) * 3.2, z = az + 12 + Math.floor(i / 3) * 3.2, h = 1.2 + i * 0.5;
        const m = box(x, h / 2, z, 2.4, h, 2.4, ['#ff6b6b', '#ffd04f', '#5bc0eb', '#9bc53d', '#ff9f43', '#b07ae0'][i], { cast: true });
        const tx = new DynamicTexture('dt' + ch, { width: 128, height: 128 }, scene, true); const g = tx.getContext();
        g.fillStyle = '#ffffff'; g.font = '900 100px "Baloo 2", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 64, 70); tx.update(); tx.hasAlpha = true;
        const face = MeshBuilder.CreatePlane('dp' + ch, { size: 2 }, scene); face.position.set(x, h / 2, z - 1.21);
        const fm = new StandardMaterial('dfm' + ch, scene); fm.emissiveTexture = tx; fm.opacityTexture = tx; fm.disableLighting = true; face.material = fm;
      });
      for (let i = 0; i < 40; i++) { const x = ax + (Math.random() - 0.5) * 32, z = az + (Math.random() - 0.5) * 32; if (Math.hypot(x - ax, z - az) < 10) continue; box(x, 0.2, z, 0.3, 0.4, 0.3, ['#ff6b8a', '#ffd04f', '#ffffff', '#b07ae0'][i % 4], { collide: false }); }
      [[ax - 15, az - 15], [ax + 15, az + 15], [ax - 15, az + 3]].forEach(([x, z]) => tree(x, z, 0, 2));
      tramp(ax + 6, az + 14);
      obby('1', ax + 11, az - 11, '#4cb05a', 7);
    }
    if (a.id === '2') {
      for (let i = 0; i < 22; i++) { const x = ax + (Math.random() - 0.5) * 32, z = az + (Math.random() - 0.5) * 32; if (Math.hypot(x - ax, z - az) < 11 || (Math.abs(z - az) < 3 && x < ax) || Math.hypot(x - ax - 11, z - az - 11) < 7.5) continue; tree(x, z, 0, Math.random() < 0.5 ? 1 : 0); }
      for (let i = 0; i < 6; i++) { const x = ax - 14 + i * 5, z = az - 15; box(x, 0.4, z, 0.4, 0.8, 0.4, '#f1e6d0', { collide: false }); box(x, 1, z, 1.4, 0.5, 1.4, '#e04848', { collide: false }); }
      tramp(ax - 8, az + 14);
      obby('2', ax + 11, az + 11, '#2f7fd8', 8, -1);
    }
    if (a.id === '3') {
      // ziduri și turnuri de castel
      const wallC = '#b8ac98';
      [[ax, az - 16, 30, 1], [ax, az + 16, 30, 1]].forEach(([x, z, w]) => box(x, 1.5, z, w, 3, 1.2, wallC, { cast: true }));
      [[ax - 16, az], [ax + 16, az]].forEach(([x, z]) => { box(x, 1.5, z - 9, 1.2, 3, 12, wallC, { cast: true }); box(x, 1.5, z + 9, 1.2, 3, 12, wallC, { cast: true }); });
      [[-16, -16], [16, -16], [-16, 16], [16, 16]].forEach(([ox, oz]) => { box(ax + ox, 3, az + oz, 3.4, 6, 3.4, '#a89c88', { cast: true }); box(ax + ox, 6.5, az + oz, 3.8, 1, 3.8, '#8a5cf6', { cast: true }); });
      for (let i = -12; i <= 12; i += 3) { box(ax + i, 3.3, az - 16, 1, 0.6, 1.2, wallC, { collide: false }); box(ax + i, 3.3, az + 16, 1, 0.6, 1.2, wallC, { collide: false }); }
      obby('3', ax - 10, az - 10, '#8a5cf6', 10);
      tramp(ax + 8, az + 10);
    }
    if (a.id === '0') {
      // grădina: flori, cuburi colorate de joacă, copaci cu flori
      for (let i = 0; i < 50; i++) { const x = ax + (Math.random() - 0.5) * 32, z = az + (Math.random() - 0.5) * 32; if (Math.hypot(x - ax, z - az) < 9) continue; box(x, 0.2, z, 0.3, 0.4, 0.3, ['#ff6b8a', '#ffd04f', '#ffffff', '#b07ae0', '#42c0d8'][i % 5], { collide: false }); }
      [[-14, -14], [14, -14], [-14, 14], [14, 14], [0, -15], [-15, 0]].forEach(([ox, oz]) => tree(ax + ox, az + oz, 0, 2));
      [[8, 13], [11, 10], [13, 7]].forEach(([ox, oz], i) => box(ax + ox, 0.5 + i * 0.4, az + oz, 2, 1 + i * 0.8, 2, ['#ff6b6b', '#ffd04f', '#5bc0eb'][i], { cast: true }));
      tramp(ax - 9, az + 13);
    }
    if (a.id === '4') {
      // munți cu zăpadă pe margini, brazi
      [[-15, -15, 6], [15, -15, 8], [-15, 15, 5], [0, -16, 7], [-16, 0, 6], [16, 2, 5]].forEach(([ox, oz, h]) => {
        box(ax + ox, h / 2, az + oz, 6, h, 6, '#8d97a3', { cast: true }); box(ax + ox, h + 0.6, az + oz, 3.6, 1.2, 3.6, '#ffffff', { cast: true });
      });
      for (let i = 0; i < 14; i++) { const x = ax + (Math.random() - 0.5) * 30, z = az + (Math.random() - 0.5) * 30; if (Math.hypot(x - ax, z - az) < 11) continue; tree(x, z, 0, 1); }
      obby('4', ax + 11, az + 11, '#42c0d8', 10);
    }
    if (a.id === 'T') {
      // tribune în jurul arenei
      for (let r = 0; r < 3; r++) for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2, R = 12.5 + r * 1.6;
        if (Math.abs(Math.sin(ang)) > 0.92 && Math.cos(ang) * 0 === 0 && Math.sin(ang) < 0) continue; // intrarea dinspre pod
        box(ax + Math.cos(ang) * R, 0.35 + r * 0.7, az + Math.sin(ang) * R, 2.2, 0.7 + r * 1.4, 2.2, ['#e8c27a', '#d9b066', '#c99f55'][r]);
      }
      plat(ax, 0.6, az, 7, 7, '#e0582f', 0.6, { cast: true });
      const fl = makeLabel(scene, 'ARENA TESTULUI', 'Profesorul Calcul te așteaptă', '#e0582f', 5); fl.position.set(ax, 8.5, az);
    }
    for (let i = 0; i < 8; i++) { const ang = (i / 8) * Math.PI * 2 + 0.3; coin(ax + Math.cos(ang) * 15, 1, az + Math.sin(ang) * 15); }
  });

  // NPC-uri cu misiuni
  const npcs = [];
  AREAS.forEach((a) => {
    const list = MISSIONS.filter((m) => m.area === a.id && !m.hidden);
    const [ax, az] = a.pos;
    // locuri pentru personaje: un cerc interior (8) și unul exterior, ocolind traseul, trambulina și intrarea
    const avoid = { '0': [], '4': [], '1': [[11, -11], [6, 14]], '2': [[11, 11], [-8, 14]], '3': [[-10, -10], [8, 10]], T: [] }[a.id] || [];
    const gate = Math.atan2(-Math.sign(az), -Math.sign(ax));
    const spots = [], ring = list.filter((m) => !m.boss), inner = Math.min(8, ring.length), outer = ring.length - inner;
    for (let k = 0; k < inner; k++) { const ang = gate + Math.PI / inner + (k / inner) * Math.PI * 2; spots.push([Math.cos(ang) * 7, Math.sin(ang) * 7]); }
    for (let k = 0, tries = 0; spots.length < ring.length && tries < 400; tries++) {
      const ang = gate + 0.35 + (tries / 400) * (Math.PI * 2 - 0.7), px = Math.cos(ang) * 12.5, pz = Math.sin(ang) * 12.5;
      if (avoid.some(([ox, oz]) => Math.hypot(px - ox, pz - oz) < 6.8)) continue;
      if (spots.some(([sx, sz]) => Math.hypot(px - sx, pz - sz) < 4.2)) continue;
      spots.push([px, pz]); k++;
    }
    void outer;
    let ri = 0;
    list.forEach((m) => {
      let x, z, top = 0;
      if (m.boss) { x = ax; z = az; top = 0.6; }
      else { const sp = spots[ri++] || [0, 7]; x = ax + sp[0]; z = az + sp[1]; }
      const [skin, shirt, pants, hat, face] = m.look;
      const av = createAvatar(scene, { skin, shirt, pants, hat, face }, shadow, 'npc' + m.id);
      av.root.position.set(x, top, z);
      if (m.boss) av.root.scaling.setAll(1.6);
      const ang = Math.atan2(ax - x, az - z); av.root.rotation.y = m.boss ? Math.PI : ang;
      const lbl = makeLabel(scene, m.npc, m.title, a.color, 3); lbl.position.set(x, top + (m.boss ? 5.2 : 3.7), z);
      const bang = makeLabel(scene, '!', null, '#f2b632', 1.1); bang.position.set(x, top + (m.boss ? 6.6 : 4.8), z);
      const done = makeLabel(scene, '★', null, '#23935a', 1.1); done.position.set(x, top + (m.boss ? 6.6 : 4.8), z); done.isVisible = false;
      colliders.push({ x1: x - 0.6, x2: x + 0.6, y1: top, y2: top + 2.6, z1: z - 0.6, z2: z + 0.6 });
      npcs.push({ m, av, x, z, top, bang, done, baseY: bang.position.y, area: a });
    });
  });

  // ---------- sala de clasă (departe, pe o insulă separată; se ajunge prin teleport) ----------
  const CX = 170, CZ = 0, classroom = { x: CX, z: CZ, seats: [], podium: [] };
  plat(CX, 0, CZ, 28, 24, '#c8a27a', 1);
  plat(CX, -0.4, CZ, 36, 32, '#7ccf6a', 1);
  [[CX, CZ - 12, 28, 1], [CX, CZ + 12, 28, 1]].forEach(([x, z, w]) => box(x, 3, z, w, 6, 0.6, '#f3ead8', { cast: true }));
  [[CX - 14, CZ], [CX + 14, CZ]].forEach(([x, z]) => box(x, 3, z, 0.6, 6, 24, '#f3ead8', { cast: true }));
  for (let i = -1; i <= 1; i++) box(CX + 14.31, 3.3, CZ + i * 7, 0.05, 2.4, 3.6, '#9fd6f2', { collide: false });
  // tabla
  const boardTex = new DynamicTexture('board', { width: 1024, height: 512 }, scene, true);
  const boardM = MeshBuilder.CreatePlane('boardP', { width: 12, height: 6 }, scene); boardM.position.set(CX, 3.4, CZ - 11.55);
  boardM.rotation.y = Math.PI; const bm = new StandardMaterial('boardm', scene); bm.emissiveTexture = boardTex; bm.disableLighting = true; boardM.material = bm;
  box(CX, 3.4, CZ - 11.75, 12.6, 6.6, 0.2, '#7a5a3b', { collide: false });
  classroom.drawBoard = (title, lines) => {
    const g = boardTex.getContext(); g.fillStyle = '#1f4d3a'; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = '#ffffff'; g.font = '800 54px "Baloo 2", sans-serif'; g.textAlign = 'center'; g.fillText(title, 512, 80);
    g.font = '700 34px Nunito, sans-serif'; g.textAlign = 'left';
    lines.slice(0, 10).forEach((l, i) => { g.fillStyle = l.done ? '#ffd04f' : '#e8f0ea'; g.fillText(l.text, 60 + (i >= 5 ? 470 : 0), 150 + (i % 5) * 68); });
    boardTex.update();
  };
  classroom.drawBoard('Clasa a III-a', [{ text: 'Așteptăm testul…' }]);
  // catedra și profesorul
  box(CX, 0.55, CZ - 8.5, 4, 1.1, 1.6, '#8a5a2b', { cast: true });
  const prof = createAvatar(scene, { skin: '#f0c8a8', shirt: '#2b2f38', pants: '#2b2f38', hat: 'ochelari', face: 'zambet' }, shadow, 'prof');
  prof.root.position.set(CX + 3.2, 0, CZ - 9.2); prof.root.rotation.y = 0;
  classroom.prof = prof;
  // bănci: 5 rânduri × 6 locuri; elevii privesc spre tablă (-z)
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const x = CX - 10 + c * 4, z = CZ - 4 + r * 3.4;
    box(x, 1.1, z - 0.95, 2.2, 0.15, 1.0, '#c98e5f', { cast: true });
    box(x, 0.55, z - 0.95, 0.12, 1.0, 0.9, '#7a5a3b', { collide: false });
    box(x, 0.25, z, 1.1, 0.5, 1.1, '#3b7ddd', { cast: true });
    box(x, 0.95, z + 0.5, 1.1, 1.0, 0.12, '#3b7ddd', { collide: false });
    classroom.seats.push({ x, z, y: 0.5 });
  }
  // podiumul: 2, 1, 3
  [[CX - 3, 1.0, 2], [CX, 1.6, 1], [CX + 3, 0.7, 3]].forEach(([x, h, place]) => {
    box(x, h / 2, CZ - 6.2, 2.6, h, 2.2, ['', '#f2b632', '#c0c6d0', '#d08a4a'][place], { cast: true });
    const l = makeLabel(scene, String(place), null, '#1f2b3a', 1.7); l.position.set(x, h / 2, CZ - 5.08); l.billboardMode = 0; l.rotation.y = Math.PI;
    classroom.podium[place] = { x, z: CZ - 6.2, y: h };
  });

  // tot ce nu se mișcă se unește într-un singur obiect pentru fiecare culoare: placa video desenează de zeci de ori mai puține bucăți
  const groups = new Map();
  statics.forEach((m) => { const k = m.material; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(m); });
  for (const list of groups.values()) {
    if (list.length < 2) { list[0].freezeWorldMatrix(); continue; }
    const cast = list.some((m) => shadow.getShadowMap().renderList.includes(m));
    const merged = Mesh.MergeMeshes(list, true, true);
    if (!merged) continue;
    merged.receiveShadows = true; merged.freezeWorldMatrix();
    if (cast) shadow.addShadowCaster(merged);
  }
  return { colliders, npcs, pads, coins, chests, clouds, movers, statue, classroom, gates, spawn: { x: 5, y: 0.5, z: -5 } };
}

export { Mesh };
