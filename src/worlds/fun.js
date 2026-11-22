// „Zona Aventurii” din fiecare hartă: turn cu platforme care se mișcă, lac cu pod fermecat,
// casă cu ușă cu cifru, o misiune de la un personaj și decor (flori, felinare, potecă, apă care sclipește).
// Comorile se deschid o singură dată; misiunea se termină o singură dată.
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { S, save, G } from '../state.js';
import { typesFor } from '../content/missions.js';
import { animal } from './animals.js';

export const MOVERS = []; // platformele care se mișcă (le mută bucla principală)

const merge = (list) => (list.length > 1 ? Mesh.MergeMeshes(list, true, true) : list[0]);

/* cfg: { C: centrul zonei (local), subject, color, flower: [culori], npc: {kind, name, ask, item, itemColor}, items: număr } */
export function addFun(ctx, K, W, id, cfg) {
  const { X, Z } = W, cx = cfg.C.x, cz = cfg.C.z;
  const M = () => { const s = W.st({}); return (s.fun = s.fun || { got: [] }); };
  const types = () => { const t = typesFor(G(), cfg.subject); return t && t.length ? t : typesFor(G(), 'mix'); };
  const solidAt = (x, z, r = 2.5) => ctx.colliders.some((c) => c.y2 > 0.3 && c.y2 < 60 && X(x) + r > c.x1 && X(x) - r < c.x2 && Z(z) + r > c.z1 && Z(z) - r < c.z2);
  const chest = (x, y, z, key, coins, title) => {
    const base = K.box(x, y + 0.45, z, 1.6, 0.9, 1.1, '#8a5a2b', { cast: true, collide: false });
    const lid = K.box(x, y + 1.0, z, 1.7, 0.25, 1.2, '#FFC93C', { glow: 0.25, collide: false });
    const lb = K.label(title, `comoară · ${coins} monede`, '#d4a017', 3, x, y + 2.6, z);
    const c = { lid, lb, open: !!M()[key], y };
    if (c.open) { lid.rotation.x = -1.1; lid.position.y += 0.4; lb.dispose(); }
    W.trig(x, z, 1.8, () => {
      if (M()[key]) { ctx.toast('Comoara asta e deja deschisă.'); return; }
      M()[key] = 1; c.open = true; lid.rotation.x = -1.1; lid.position.y += 0.4; lb.dispose();
      W.reward(W.st({}), 'fun_' + key, coins, 'Ai găsit comoara!');
    }, y + 0.5);
    return c;
  };

  /* decorul: covor de iarbă colorată, potecă de pietre din piață, flori, felinare */
  K.cyl(cx, 0.03, cz, 50, 0.06, cfg.ground, { tess: 40 });
  K.label('Zona Aventurii', 'comori · pod fermecat · ușa cu cifru', cfg.color, 8, cx, 15, cz);
  const stones = [], len = Math.hypot(cx, cz), steps = Math.floor((len - 30) / 3.2);
  for (let i = 0; i < steps; i++) { const k = (16 + i * 3.2) / len, x = cx * k + Math.sin(i * 0.9) * 1.2, z = cz * k + Math.cos(i * 0.7) * 1.2; stones.push(K.cyl(x, 0.08, z, 1.6, 0.12, '#d9d2c5', { tess: 8 })); }
  merge(stones);
  const heads = {}, stems = [];
  for (let i = 0; i < 70; i++) {
    const a = i * 2.39996, r = 6 + (i * 7.3) % 21, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
    if (solidAt(x, z, 1) || Math.hypot(x - cx - 12, z - cz + 10) < 9 || Math.hypot(x - cx + 12, z - cz - 10) < 6 || Math.hypot(x - cx + 12, z - cz + 12) < 6) continue;
    const c = cfg.flower[i % cfg.flower.length];
    stems.push(K.cyl(x, 0.35, z, 0.08, 0.7, '#3f9c4a', { tess: 4 }));
    (heads[c] = heads[c] || []).push(K.sphere(x, 0.75, z, 0.38, c));
  }
  merge(stems); Object.values(heads).forEach(merge);
  const lamps = [];
  [[-20, -20], [20, -20], [-20, 20], [20, 20], [0, -21], [-21, 0]].forEach(([dx, dz]) => {
    const x = cx + dx, z = cz + dz; if (solidAt(x, z, 0.8)) return;
    K.cyl(x, 1.6, z, 0.22, 3.2, '#2b2f3a', { collide: true }); lamps.push(K.sphere(x, 3.4, z, 0.7, '#fff2a8', { glow: 0.9 }));
  });

  /* 1. turnul cu platforme care se mișcă; sus e o comoară */
  const TX = cx + 12, TZ = cz - 10;
  K.cyl(TX, 4.5, TZ, 3.4, 9, cfg.color, { collide: true, cast: true, tess: 10 });
  K.cyl(TX, 9.1, TZ, 4.4, 0.25, '#ffffff', { tess: 16 });
  K.label('Turnul Săritor', 'sari pe platforme până sus', cfg.color, 4, TX, 13.8, TZ);
  const PL = [[-4.5, 0, 1.4], [-4.5, -4.5, 2.8], [0, -5.2, 4.2], [4.6, -4.2, 5.6], [5, 0.5, 7.0], [2.8, 3.6, 8.4]];
  PL.forEach(([dx, dz, top], i) => {
    const m = K.plat(TX + dx, top, TZ + dz, 2.4, 2.4, i % 2 ? '#ffd27a' : '#ffffff', 0.4, { cast: true });
    const horiz = i === 2 || i === 4;
    MOVERS.push({ m, c: m.col, axis: horiz ? (i === 2 ? 'x' : 'z') : 'y', base: horiz ? (i === 2 ? m.position.x : m.position.z) : m.position.y, amp: horiz ? 1.3 : 0.35, sp: 1 + i * 0.15, ph: horiz ? i : 0, world: id });
  });
  chest(TX, 9, TZ, 'tower', 40, 'Comoara din turn');

  /* 2. lacul cu insula; podul apare când răspunzi bine */
  const LX = cx - 12, LZ = cz + 10, R1 = 4, R2 = 9.5;
  const water = new StandardMaterial('apa_' + id, ctx.scene); water.diffuseColor = Color3.FromHexString('#4fb6e8'); water.specularColor = new Color3(0.6, 0.6, 0.6); water.alpha = 0.92;
  const lake = K.cyl(LX, 0.09, LZ, R2 * 2, 0.08, '#4fb6e8', { tess: 32 }); lake.material = water;
  K.cyl(LX, 0.25, LZ, R1 * 2, 0.4, '#c9a06a', { tess: 24 });
  K.cyl(LX, 0.6, LZ, R1 * 2 - 1, 0.3, '#5fb85a', { tess: 24 });
  const planks = [];
  for (let i = 0; i < 6; i++) planks.push(K.box(LX, 0.35, LZ - R1 - 0.4 - i * 1, 2.6, 0.18, 0.85, '#a0703f', { collide: false }));
  const posts = [-1.4, 1.4].map((dx) => K.box(LX + dx, 0.7, LZ - (R1 + R2) / 2, 0.2, 1, 5.6, '#7b4a2a', { collide: false }));
  const showBridge = (on) => { planks.forEach((p) => p.setEnabled(on)); posts.forEach((p) => p.setEnabled(on)); };
  showBridge(!!M().bridge);
  W.sign(LX + 2.6, LZ - R2 - 1.6, 'Podul fermecat', '#3b7ddd');
  W.trig(LX, LZ - R2 - 1.2, 1.8, () => {
    if (M().bridge) return;
    ctx.askOne(types(), 'Podul fermecat: răspunde corect și apare podul', (ok) => {
      if (!ok) { if (ok === false) ctx.toast('Mai încearcă: vino iar la pod.'); return; }
      M().bridge = 1; save(); showBridge(true); planks.forEach((p, i) => { p.scaling.x = 0.01; p.grow = -i * 0.15; }); ctx.SFX.star(); ctx.toast('A apărut podul! Treci pe insulă.');
    });
  });
  chest(LX, 0.75, LZ, 'island', 30, 'Comoara insulei');
  let warned = 0;
  const lakeGuard = (P) => {
    const lx = P.x - X(LX), lz = P.z - Z(LZ), d = Math.hypot(lx, lz);
    if (d < R1 - 0.2 || d > R2 || P.y > 1.6) return;
    if (M().bridge && Math.abs(lx) < 1.3 && lz < 0) return; // pe pod
    const k = d < (R1 + R2) / 2 && M().bridge ? (R1 - 0.6) / d : (R2 + 0.8) / d; P.x = X(LX) + lx * k; P.z = Z(LZ) + lz * k;
    if (performance.now() - warned > 3000) { warned = performance.now(); ctx.toast(M().bridge ? 'Apa e adâncă! Treci pe pod.' : 'Apa e adâncă! Răspunde la semnul „Podul fermecat” ca să apară podul.'); }
  };

  /* 3. căsuța cu ușă cu cifru */
  const HX = cx - 12, HZ = cz - 12;
  K.box(HX - 3.5, 2, HZ, 0.5, 4, 7.5, '#f4e3c3', { cast: true }); K.box(HX + 3.5, 2, HZ, 0.5, 4, 7.5, '#f4e3c3', { cast: true });
  K.box(HX, 2, HZ - 3.5, 7.5, 4, 0.5, '#f4e3c3', { cast: true });
  K.box(HX - 2.4, 2, HZ + 3.5, 2.8, 4, 0.5, '#f4e3c3', { cast: true }); K.box(HX + 2.4, 2, HZ + 3.5, 2.8, 4, 0.5, '#f4e3c3', { cast: true });
  K.box(HX, 3.6, HZ + 3.5, 2, 0.8, 0.5, '#f4e3c3');
  K.cyl(HX, 5.2, HZ, 11, 2.6, cfg.color, { top: 0, tess: 4 }).rotation.y = Math.PI / 4;
  const door = K.box(HX, 1.6, HZ + 3.5, 2, 3.2, 0.3, '#8a5a2b');
  const pad = K.box(HX + 1.6, 1.6, HZ + 3.9, 0.6, 0.8, 0.15, '#1F2B3A', { collide: false });
  K.label('Ușa cu cifru', 'cifrul e răspunsul corect', '#7B5CF6', 3.4, HX, 6.4, HZ + 4);
  let doorUp = M().door ? 1 : 0;
  const placeDoor = () => { door.position.y = 1.6 + doorUp * 3.1; K.setSolid(door, doorUp < 0.9); };
  placeDoor();
  W.trig(HX, HZ + 5.2, 1.6, () => {
    if (M().door) return;
    ctx.askOne(types(), 'Ușa cu cifru: răspunsul corect deschide ușa', (ok) => {
      if (!ok) { if (ok === false) ctx.toast('Cifru greșit! Mai încearcă.'); return; }
      M().door = 1; save(); ctx.SFX.star(); ctx.toast('Click! Ușa s-a deschis.');
    });
  });
  chest(HX, 0, HZ - 1.2, 'house', 50, 'Comoara casei');

  /* 4. personajul cu misiune: găsește obiectele pierdute prin toată harta */
  const NX = cx + 2, NZ = cz + 14;
  const npc = animal(K, cfg.npc.kind, NX, NZ, 1.4);
  const nlb = K.label(cfg.npc.name, M().questDone ? 'mulțumesc!' : 'are nevoie de ajutor · atinge-l', '#e04878', 3.2, NX, 4.2, NZ);
  const items = [];
  for (let i = 0, k = 0; items.length < cfg.items && k < 400; k++) {
    const a = k * 1.7 + i, r = 28 + (k * 11.3) % 62, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.abs(x) > 96 || Math.abs(z) > 96 || solidAt(x, z, 2.5) || Math.hypot(x - cx, z - cz) < 26 || items.some((o) => Math.hypot(o.x - x, o.z - z) < 25)) continue;
    const m = K.sphere(x, 1.2, z, 0.9, cfg.npc.itemColor, { glow: 0.6 });
    const it = { x, z, m, got: M().got.includes(items.length) }; m.setEnabled(!it.got);
    const idx = items.length;
    W.trig(x, z, 1.6, () => {
      if (M().got.includes(idx)) return;
      M().got.push(idx); save(); m.setEnabled(false); ctx.SFX.coin();
      const n = M().got.length;
      ctx.toast(n >= cfg.items ? `Le-ai găsit pe toate! Du-te înapoi la ${cfg.npc.name}.` : `Ai găsit ${cfg.npc.item}: ${n} din ${cfg.items}`);
    });
    items.push(it); i++;
  }
  W.trig(NX, NZ - 2, 2.2, () => {
    const m = M(), n = m.got.length;
    if (m.questDone) { ctx.toast(`${cfg.npc.name}: Mulțumesc din nou, prietene!`); return; }
    if (n >= cfg.items) { m.questDone = 1; nlb.dispose(); W.reward(W.st({}), 'fun_quest', 40, `${cfg.npc.name} e foarte fericit!`); return; }
    ctx.info(`<div class="eyebrow">Misiune</div><h2>${cfg.npc.name}</h2><p>${cfg.npc.ask}</p><p><b>Ai găsit ${n} din ${cfg.items}.</b> Caută prin toată harta: sclipesc și plutesc. Primești <b>40 de monede</b>.</p>`);
  });

  if (location.hostname === 'localhost') (window.__fun = window.__fun || {})[id] = { items: items.map((o) => [o.x, o.z]), L: [LX, LZ], H: [HX, HZ], T: [TX, TZ], N: [NX, NZ] };
  return {
    update(dt, t, P, here) {
      if (!here) return;
      lakeGuard(P);
      water.emissiveColor.set(0.05 + Math.sin(t * 2) * 0.04, 0.12 + Math.sin(t * 2.3) * 0.05, 0.2 + Math.sin(t * 1.7) * 0.06);
      lake.rotation.y += dt * 0.1;
      planks.forEach((p) => { if (p.grow !== undefined && p.scaling.x < 1) { p.grow += dt * 2; p.scaling.x = Math.min(1, Math.max(0.01, p.grow)); } });
      if (M().door && doorUp < 1) { doorUp = Math.min(1, doorUp + dt * 0.8); placeDoor(); }
      items.forEach((o, i) => { if (!o.m.isEnabled()) return; o.m.position.y = 1.2 + Math.sin(t * 2 + i) * 0.3; });
      lamps.forEach((l, i) => l.scaling.setAll(1 + Math.sin(t * 3 + i) * 0.06));
      const k = Math.sin(t * 3) * 0.05; npc.forEach((m) => (m.rotation.y = k));
    }
  };
}
