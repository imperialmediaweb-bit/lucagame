// Anotimpul după dată: iarna (dec–feb) ninge și totul e acoperit de zăpadă; de Crăciun (1 dec – 6 ian)
// apar bradul cu globuri și cadouri, omul de zăpadă și Calendarul de Advent (o ferestruică pe zi, 1–24 decembrie).
// Pentru teste: ?sezon=craciun / ?sezon=iarna / ?sezon=normal.
import { ParticleSystem } from '@babylonjs/core/Particles/particleSystem';
import '@babylonjs/core/Particles/particleSystemComponent';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { mat, makeLabel } from './avatar.js';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
const snowSkip = new Set(); // materiale pe care nu le acoperă zăpada (bradul)

const force = new URLSearchParams(location.search).get('sezon');
export function today() {
  const d = new Date();
  if (force === 'craciun') return { m: 11, d: 10 };
  if (force === 'iarna') return { m: 0, d: 20 };
  if (force === 'normal') return { m: 4, d: 10 };
  return { m: d.getMonth(), d: d.getDate() };
}
export const isWinter = () => [11, 0, 1].includes(today().m);
export const isXmas = () => { const t = today(); return t.m === 11 || (t.m === 0 && t.d <= 6); };
export const adventDay = () => { const t = today(); return t.m === 11 && t.d <= 24 ? t.d : t.m === 11 ? 24 : 0; };

export function initSeason({ scene, getP, glowExclude, coarse, colliders }) {
  if (!isWinter()) return { update() {} };
  // zăpada pe iarbă și pe frunze (doar pe lume, nu pe hainele personajelor)
  const snowy = Color3.FromHexString('#eef5ff'), done = snowSkip;
  const paint = () => {
    for (const m of scene.meshes) {
      const M = m.material; if (!M || !M.diffuseColor || done.has(M) || m.parent) continue;
      const c = M.diffuseColor; if (c.g > c.r + 0.08 && c.g > c.b + 0.04) { done.add(M); M.diffuseColor = Color3.Lerp(c, snowy, 0.72); }
    }
  };
  paint(); setTimeout(paint, 3000);
  scene.clearColor = Color4.FromHexString('#cfe6f7ff'); scene.fogColor = Color3.FromHexString('#cfe6f7');
  // fulgii de zăpadă cad în jurul copilului
  const tex = new DynamicTexture('flake', { width: 64, height: 64 }, scene, false), g = tex.getContext();
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); tex.update(); tex.hasAlpha = true;
  const ps = new ParticleSystem('snow', coarse ? 700 : 1600, scene);
  ps.particleTexture = tex; ps.emitter = new Vector3(0, 18, 0);
  ps.minEmitBox = new Vector3(-30, 0, -30); ps.maxEmitBox = new Vector3(30, 4, 30);
  ps.color1 = new Color4(1, 1, 1, 0.95); ps.color2 = new Color4(0.9, 0.95, 1, 0.8); ps.colorDead = new Color4(1, 1, 1, 0);
  ps.minSize = 0.12; ps.maxSize = 0.3; ps.minLifeTime = 5; ps.maxLifeTime = 8; ps.emitRate = coarse ? 120 : 280;
  ps.direction1 = new Vector3(-0.6, -1, -0.3); ps.direction2 = new Vector3(0.6, -1, 0.3); ps.minEmitPower = 1.2; ps.maxEmitPower = 2.2; ps.gravity = new Vector3(0, -0.6, 0);
  ps.blendMode = ParticleSystem.BLENDMODE_STANDARD; ps.start();
  let xmas = null;
  if (isXmas()) xmas = buildXmas(scene, glowExclude, colliders);
  return {
    update(dt, t) {
      const P = getP(); ps.emitter.x = P.x; ps.emitter.y = P.y + 16; ps.emitter.z = P.z;
      if (xmas) xmas.update(dt, t);
    }
  };
}

/* bradul de Crăciun din piață, cu globuri, stea, cadouri și un om de zăpadă */
function buildXmas(scene, glowExclude, colliders = []) {
  const X = 9.2, Z = -7.7, parts = []; // între portaluri, aproape de locul unde apari
  const solid = (x, z, w, h, d) => colliders.push({ x1: x - w / 2, x2: x + w / 2, y1: 0, y2: h, z1: z - d / 2, z2: z + d / 2, bounce: 0 });
  solid(X, Z, 3.6, 8, 3.6); solid(11.8, -2.1, 1.6, 3.6, 1.6);
  const add = (m) => { parts.push(m); return m; };
  const cyl = (x, y, z, d, h, c, glow, top) => { const m = MeshBuilder.CreateCylinder('xm', { diameter: d, height: h, diameterTop: top ?? d, tessellation: 14 }, scene); m.position.set(x, y, z); m.material = mat(scene, c, glow || 0); return add(m); };
  const sph = (x, y, z, d, c, glow) => { const m = MeshBuilder.CreateSphere('xs', { diameter: d, segments: 10 }, scene); m.position.set(x, y, z); m.material = mat(scene, c, glow || 0); return add(m); };
  const box = (x, y, z, w, h, d, c, glow) => { const m = MeshBuilder.CreateBox('xb', { width: w, height: h, depth: d }, scene); m.position.set(x, y, z); m.material = mat(scene, c, glow || 0); return add(m); };
  cyl(X, 0.8, Z, 0.9, 1.6, '#6b3f1f');
  // bradul are materialul lui, ca să nu-l acopere zăpada
  const fir = new StandardMaterial('fir', scene); fir.diffuseColor = Color3.FromHexString('#1f7a3b'); fir.specularColor = new Color3(0.05, 0.05, 0.05); snowSkip.add(fir);
  [[4.6, 3.2, 2.6], [3.6, 2.8, 4.6], [2.6, 2.4, 6.4], [1.6, 2, 7.9]].forEach(([d, h, y]) => { const c = cyl(X, y, Z, d, h, '#1f7a3b', 0, 0); c.material = fir; });
  const balls = [];
  for (let i = 0; i < 28; i++) { const lv = i % 4, a = i * 2.39, r = [2.0, 1.55, 1.1, 0.65][lv], y = [1.9, 3.9, 5.7, 7.3][lv]; balls.push(sph(X + Math.cos(a) * r, y, Z + Math.sin(a) * r, 0.42, ['#e04848', '#FFC93C', '#3b7ddd', '#c77dff', '#ffffff'][i % 5], 0.6)); }
  const star = sph(X, 9.3, Z, 0.9, '#FFD84D', 1); star.scaling.set(1, 1, 0.4);
  [[-2.4, 1.6, '#e04848'], [2.2, 2.2, '#3b7ddd'], [-1, -2.6, '#2EC4A6'], [2.6, -1.2, '#c77dff']].forEach(([dx, dz, c]) => { box(X + dx, 0.45, Z + dz, 1, 0.9, 1, c); box(X + dx, 0.46, Z + dz, 1.04, 0.92, 0.2, '#FFC93C'); box(X + dx, 0.46, Z + dz, 0.2, 0.92, 1.04, '#FFC93C'); });
  // om de zăpadă
  const SX = 11.8, SZ = -2.1;
  sph(SX, 0.8, SZ, 1.7, '#ffffff'); sph(SX, 2.1, SZ, 1.25, '#ffffff'); sph(SX, 3.1, SZ, 0.9, '#ffffff');
  const nose = cyl(SX, 3.1, SZ - 0.55, 0.16, 0.5, '#ff7a2f', 0, 0); nose.rotation.x = -Math.PI / 2;
  [-0.18, 0.18].forEach((dx) => sph(SX + dx, 3.25, SZ - 0.4, 0.12, '#1F2B3A'));
  cyl(SX, 3.6, SZ, 0.8, 0.12, '#1F2B3A'); cyl(SX, 3.85, SZ, 0.55, 0.5, '#1F2B3A');
  const lb = makeLabel(scene, 'Crăciun fericit!', 'Calendarul de Advent: pe ecranul Acasă', '#e04848', 5); lb.position.set(X, 11, Z); glowExclude && glowExclude(lb);
  return {
    update(dt, t) {
      star.rotation.y += dt * 1.2;
      balls.forEach((b, i) => { b.material = b.material; b.scaling.setAll(1 + Math.sin(t * 3 + i) * 0.12); });
    }
  };
}
