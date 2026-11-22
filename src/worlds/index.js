// Lumile separate (o hartă pentru fiecare materie). Se construiesc la prima intrare, departe de insulă.
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { buildMate } from './mate.js';
import { buildRomana } from './romana.js';
import { buildStiinte } from './stiinte.js';
import { buildEngleza } from './engleza.js';
import { buildCivica } from './civica.js';
import { makeKit } from './kit.js';
import { worldBase } from './games.js';
import { addFun } from './fun.js';

// Zona Aventurii din fiecare hartă (centrul e ales într-un colț liber)
const ORIG = { mate: { x: 600, z: 0 }, romana: { x: -600, z: 0 }, stiinte: { x: 600, z: 600 }, engleza: { x: -600, z: 600 }, civica: { x: 0, z: 600 } };
const FUN = {
  mate: { C: { x: -58, z: 72 }, subject: 'mate', color: '#FF7A2F', ground: '#f0b060', flower: ['#ff7a2f', '#ffc93c', '#e04848'], items: 5,
    npc: { kind: 'vulpea', name: 'Vulpița Cifrica', item: 'o cifră de aur', itemColor: '#FFC93C', ask: 'Vai! Mi-au căzut cele 5 cifre de aur din coș și s-au rostogolit prin tot Orașul Cifrelor. Mă ajuți să le găsești?' } },
  romana: { C: { x: 72, z: 70 }, subject: 'romana', color: '#7B5CF6', ground: '#b49cf0', flower: ['#c77dff', '#ff8fc7', '#ffffff'], items: 5,
    npc: { kind: 'bufnița', name: 'Bufnița Literata', item: 'o literă pierdută', itemColor: '#c77dff', ask: 'Vântul mi-a luat 5 litere din cartea de povești! Fără ele, povestea nu are sens. Le cauți prin tot Satul Cuvintelor?' } },
  stiinte: { C: { x: 70, z: 72 }, subject: 'stiinte', color: '#23935a', ground: '#9ed67a', flower: ['#ff6b6b', '#ffd84d', '#ffffff'], items: 5,
    npc: { kind: 'iepurele', name: 'Iepurașul Țup', item: 'un morcov', itemColor: '#ff8c2f', ask: 'Am pus deoparte 5 morcovi pentru iarnă, dar i-am uitat prin tot Laboratorul Naturii. Mă ajuți să-i găsesc?' } },
  engleza: { C: { x: -75, z: 45 }, subject: 'engleza', color: '#3b7ddd', ground: '#86b8ea', flower: ['#3b7ddd', '#e04848', '#ffffff'], items: 5,
    npc: { kind: 'ursul', name: 'Teddy the Bear', item: 'a star (o stea)', itemColor: '#FFD84D', ask: 'Hello! Am pierdut 5 stars (stele) prin tot English Island. Can you help me? Mă ajuți să le găsesc?' } },
  civica: { C: { x: 0, z: 62 }, subject: 'civica', color: '#e04878', ground: '#ee9cc0', flower: ['#ff8fc7', '#ffd84d', '#c77dff'], items: 5,
    npc: { kind: 'căprioara', name: 'Căprioara Blânda', item: 'o scrisoare', itemColor: '#ffffff', ask: 'Sunt poștărița orașului, dar mi-au zburat 5 scrisori din geantă! Oamenii le așteaptă. Mă ajuți să le aduni?' } }
};

const BUILDERS = { mate: buildMate, romana: buildRomana, stiinte: buildStiinte, engleza: buildEngleza, civica: buildCivica };
const WORLDS = {};
let ctx = null, cur = null, sky0 = null;

export function initWorlds(c) { ctx = c; }
export const hasWorld = (id) => !!BUILDERS[id];
function ensure(id) {
  if (WORLDS[id]) return WORLDS[id];
  const w = BUILDERS[id](ctx), O = ORIG[id];
  if (FUN[id]) {
    const K = makeKit(ctx, O.x, O.z), Wb = worldBase(ctx, K, id, O), f = addFun(ctx, K, Wb, id, FUN[id]);
    w.triggers.push(...Wb.triggers);
    const up = w.update; w.update = function (dt, t, P, here) { up && up.call(w, dt, t, P, here); f.update(dt, t, P, here); };
  }
  return (WORLDS[id] = w);
}

export function enterWorld(id) {
  const w = ensure(id);
  ctx.teleport(w.spawn.x, w.spawn.z, w.spawn.y || 0.5); ctx.setYaw(w.spawn.yaw || 0);
  ctx.toast(`Bun venit în ${w.name}!`); w.onEnter && w.onEnter();
}
export function worldAt(P) {
  for (const w of Object.values(WORLDS)) { const b = w.bounds; if (P.x > b.x1 && P.x < b.x2 && P.z > b.z1 && P.z < b.z2) return w; }
  return null;
}
function setSky(w) {
  const s = ctx.scene;
  if (!sky0) sky0 = { clear: s.clearColor.clone(), fog: s.fogColor.clone(), start: s.fogStart, end: s.fogEnd };
  if (w) { s.clearColor = Color4.FromHexString(w.sky + 'ff'); s.fogColor = Color3.FromHexString(w.sky); s.fogStart = w.fog ? w.fog[0] : 70; s.fogEnd = w.fog ? w.fog[1] : 190; }
  else { s.clearColor = sky0.clear; s.fogColor = sky0.fog; s.fogStart = sky0.start; s.fogEnd = sky0.end; }
}
export function updateWorlds(dt, t, P, paused) {
  const w = worldAt(P);
  if (w !== cur) { setSky(w); cur = w; }
  for (const x of Object.values(WORLDS)) x.update && x.update(dt, t, P, x === w);
  if (!w || paused) return;
  for (const tr of w.triggers) {
    const d = Math.hypot(tr.x - P.x, tr.z - P.z);
    if (d > tr.r + 1.2) tr.armed = true;
    if (d < tr.r && tr.armed !== false && Math.abs(P.y - (tr.y || 0.5)) < (tr.dy || 2.5)) { tr.armed = false; tr.on(); }
  }
}
export const currentWorld = () => cur;
if (typeof location !== 'undefined' && location.hostname === 'localhost') window.__wenter = (id) => enterWorld(id);
