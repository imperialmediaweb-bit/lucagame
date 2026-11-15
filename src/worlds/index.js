// Lumile separate (o hartă pentru fiecare materie). Se construiesc la prima intrare, departe de insulă.
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { buildMate } from './mate.js';

const BUILDERS = { mate: buildMate };
const WORLDS = {};
let ctx = null, cur = null, sky0 = null;

export function initWorlds(c) { ctx = c; }
export const hasWorld = (id) => !!BUILDERS[id];
function ensure(id) { if (!WORLDS[id]) WORLDS[id] = BUILDERS[id](ctx); return WORLDS[id]; }

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
