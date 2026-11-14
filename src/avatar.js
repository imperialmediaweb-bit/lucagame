// Personaje din blocuri, animate din cod: mers, alergare, săritură, dans, salut.
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { DynamicTexture } from '@babylonjs/core/Materials/Textures/dynamicTexture';
import { Color3 } from '@babylonjs/core/Maths/math.color';
export const LABELS = [];

const matCache = new Map();
export function mat(scene, hex, emissive = 0) {
  const key = hex + '|' + emissive;
  if (matCache.has(key)) return matCache.get(key);
  const m = new StandardMaterial('m' + key, scene);
  m.diffuseColor = Color3.FromHexString(hex);
  m.specularColor = new Color3(0.06, 0.06, 0.06);
  if (emissive) m.emissiveColor = Color3.FromHexString(hex).scale(emissive);
  matCache.set(key, m);
  return m;
}

export const SKINS = ['#f3c9a0', '#e0b48a', '#c98e5f', '#8a5a3b', '#5c3a24'];
export const COLORS = { '#e04848': 'Roșu', '#3b7ddd': 'Albastru', '#2fae5f': 'Verde', '#8a5cf6': 'Mov', '#f2b632': 'Auriu', '#ff8ac0': 'Roz', '#2b2f38': 'Negru', '#ffffff': 'Alb', '#42c0d8': 'Turcoaz', '#ff7a2f': 'Portocaliu', '#2b3a55': 'Bleumarin', '#7a5a3b': 'Maro' };
export const HATS = { nimic: 'Fără', sapca: 'Șapcă', casca: 'Căști', fundita: 'Fundiță', coif: 'Coif de cavaler', palarie: 'Pălărie', vrajitor: 'Pălărie de vrăjitor', urechi: 'Urechi de veveriță', bucatar: 'Bonetă de bucătar', ochelari: 'Ochelari', coroana: 'Coroană', basma: 'Basma' };
export const FACES = { zambet: 'Zâmbet', cool: 'Cool', surprins: 'Surprins', fericit: 'Fericit', ninja: 'Ninja', robot: 'Robot' };

function faceTexture(scene, face) {
  const t = new DynamicTexture('face' + face + Math.random(), { width: 128, height: 128 }, scene, false);
  const g = t.getContext(); g.clearRect(0, 0, 128, 128);
  g.fillStyle = '#1f2b3a'; g.strokeStyle = '#1f2b3a'; g.lineWidth = 7; g.lineCap = 'round';
  const eyes = () => { g.beginPath(); g.ellipse(42, 54, 8, 11, 0, 0, Math.PI * 2); g.ellipse(86, 54, 8, 11, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(45, 50, 3, 0, 7); g.arc(89, 50, 3, 0, 7); g.fill(); g.fillStyle = '#1f2b3a'; };
  if (face === 'zambet') { eyes(); g.beginPath(); g.arc(64, 74, 22, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); }
  if (face === 'fericit') { g.beginPath(); g.arc(42, 58, 10, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(86, 58, 10, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(40, 78); g.quadraticCurveTo(64, 108, 88, 78); g.closePath(); g.fill(); }
  if (face === 'surprins') { eyes(); g.beginPath(); g.ellipse(64, 90, 9, 12, 0, 0, 7); g.stroke(); }
  if (face === 'cool') { g.fillRect(22, 42, 38, 20); g.fillRect(68, 42, 38, 20); g.fillRect(56, 46, 16, 6); g.beginPath(); g.moveTo(46, 86); g.quadraticCurveTo(70, 100, 88, 80); g.stroke(); }
  if (face === 'ninja') { g.fillStyle = '#2b2f38'; g.fillRect(0, 0, 128, 40); g.fillRect(0, 70, 128, 58); g.fillStyle = '#1f2b3a'; g.beginPath(); g.moveTo(30, 58); g.lineTo(54, 52); g.stroke(); g.beginPath(); g.moveTo(98, 58); g.lineTo(74, 52); g.stroke(); }
  if (face === 'robot') { g.fillStyle = '#42c0d8'; g.fillRect(28, 44, 26, 18); g.fillRect(74, 44, 26, 18); g.fillStyle = '#1f2b3a'; for (let i = 0; i < 5; i++) g.fillRect(36 + i * 12, 84, 8, 12); }
  t.update(); t.hasAlpha = true;
  return t;
}

/** Creează un personaj. look = {skin, shirt, pants, hat, face}. */
export function createAvatar(scene, look, shadow, name = 'av') {
  const root = new TransformNode(name, scene);
  const body = new TransformNode(name + 'b', scene); body.parent = root;
  const parts = [];
  const box = (n, w, h, d, parent, color) => { const m = MeshBuilder.CreateBox(name + n, { width: w, height: h, depth: d }, scene); m.parent = parent; m.material = mat(scene, color); parts.push(m); return m; };
  const pivot = (n, x, y, parent) => { const t = new TransformNode(name + n, scene); t.parent = parent; t.position.set(x, y, 0); return t; };

  const hipL = pivot('hl', -0.24, 0.95, body), hipR = pivot('hr', 0.24, 0.95, body);
  const legL = box('ll', 0.46, 0.95, 0.5, hipL, look.pants); legL.position.y = -0.475;
  const legR = box('lr', 0.46, 0.95, 0.5, hipR, look.pants); legR.position.y = -0.475;
  const torso = box('t', 0.96, 0.95, 0.52, body, look.shirt); torso.position.y = 1.425;
  const shL = pivot('sl', -0.71, 1.84, body), shR = pivot('sr', 0.71, 1.84, body);
  const armL = box('al', 0.42, 0.92, 0.46, shL, look.shirt); armL.position.y = -0.4;
  const armR = box('ar', 0.42, 0.92, 0.46, shR, look.shirt); armR.position.y = -0.4;
  const handL = box('hdl', 0.4, 0.2, 0.44, shL, look.skin); handL.position.y = -0.92;
  const handR = box('hdr', 0.4, 0.2, 0.44, shR, look.skin); handR.position.y = -0.92;
  const neck = pivot('n', 0, 1.9, body);
  const head = box('h', 0.66, 0.62, 0.62, neck, look.skin); head.position.y = 0.31;
  const facePlane = MeshBuilder.CreatePlane(name + 'f', { width: 0.6, height: 0.6 }, scene);
  facePlane.parent = head; facePlane.position.z = 0.315; facePlane.rotation.y = Math.PI;
  const fm = new StandardMaterial(name + 'fm', scene); fm.specularColor = Color3.Black(); fm.useAlphaFromDiffuseTexture = true; fm.backFaceCulling = true;
  facePlane.material = fm;
  const hat = new TransformNode(name + 'hat', scene); hat.parent = head; hat.position.y = 0.31;
  if (shadow) parts.forEach((p) => shadow.addShadowCaster(p));

  let cur = {};
  function setLook(l) {
    cur = { ...cur, ...l };
    legL.material = legR.material = mat(scene, cur.pants);
    torso.material = armL.material = armR.material = mat(scene, cur.shirt);
    head.material = handL.material = handR.material = mat(scene, cur.skin);
    if (fm.diffuseTexture) fm.diffuseTexture.dispose();
    fm.diffuseTexture = faceTexture(scene, cur.face || 'zambet');
    hat.getChildMeshes().forEach((m) => m.dispose());
    buildHat(scene, hat, cur.hat, name, shadow);
  }
  setLook(look);

  let phase = 0, t = 0;
  /** st: {speed 0..1, air, dance, wave, lookYaw} */
  function update(dt, st = {}) {
    t += dt;
    const sp = st.speed || 0;
    phase += dt * (6 + 8 * sp) * (sp > 0.05 ? 1 : 0);
    let la = 0, ra = 0, ll = 0, lr = 0, bob = 0, rz = 0, lz = 0;
    if (st.dance) {
      la = -2.6 + Math.sin(t * 10) * 0.5; ra = -2.6 - Math.sin(t * 10) * 0.5; bob = Math.abs(Math.sin(t * 10)) * 0.15;
      body.rotation.y = Math.sin(t * 5) * 0.6;
    } else {
      body.rotation.y *= 0.8;
      if (st.air) { la = -2.7; ra = -2.7; ll = 0.5; lr = -0.3; }
      else if (sp > 0.05) { const s = Math.sin(phase) * (0.5 + 0.5 * sp); la = s; ra = -s; ll = -s; lr = s; bob = Math.abs(Math.cos(phase)) * 0.08 * sp; }
      else { la = Math.sin(t * 2) * 0.05; ra = -la; bob = Math.sin(t * 2) * 0.02; }
      if (st.wave) { ra = -2.8; rz = Math.sin(t * 9) * 0.4; }
    }
    const k = Math.min(1, dt * 14);
    shL.rotation.x += (la - shL.rotation.x) * k; shR.rotation.x += (ra - shR.rotation.x) * k;
    shR.rotation.z += (rz - shR.rotation.z) * k; shL.rotation.z += (lz - shL.rotation.z) * k;
    hipL.rotation.x += (ll - hipL.rotation.x) * k; hipR.rotation.x += (lr - hipR.rotation.x) * k;
    body.position.y = bob;
    if (st.lookYaw !== undefined) neck.rotation.y += (Math.max(-1, Math.min(1, st.lookYaw)) - neck.rotation.y) * Math.min(1, dt * 5);
    else neck.rotation.y *= 0.9;
  }
  return { root, body, setLook, update, parts };
}

function buildHat(scene, hat, type, name, shadow) {
  const add = (m, color) => { m.parent = hat; m.material = mat(scene, color); if (shadow) shadow.addShadowCaster(m); return m; };
  const B = (w, h, d, c) => add(MeshBuilder.CreateBox(name + 'hb' + Math.random(), { width: w, height: h, depth: d }, scene), c);
  const C = (h, top, bot, c, tess = 16) => add(MeshBuilder.CreateCylinder(name + 'hc' + Math.random(), { height: h, diameterTop: top, diameterBottom: bot, tessellation: tess }, scene), c);
  switch (type) {
    case 'sapca': { B(0.7, 0.18, 0.66, '#e04848').position.y = 0.04; const v = B(0.6, 0.06, 0.32, '#e04848'); v.position.set(0, -0.02, 0.45); break; }
    case 'casca': { const a = B(0.08, 0.12, 0.7, '#2b2f38'); a.position.y = 0.06; a.rotation.z = Math.PI / 2; a.scaling.set(1, 1, 1); const top = B(0.8, 0.08, 0.12, '#2b2f38'); top.position.y = 0.06;
      const l = B(0.12, 0.3, 0.3, '#ff7a2f'); l.position.set(-0.38, -0.28, 0); const r = B(0.12, 0.3, 0.3, '#ff7a2f'); r.position.set(0.38, -0.28, 0); break; }
    case 'fundita': { const a = B(0.26, 0.22, 0.1, '#ff4f8a'); a.position.set(-0.16, 0.05, 0); a.rotation.z = 0.4; const b = B(0.26, 0.22, 0.1, '#ff4f8a'); b.position.set(0.16, 0.05, 0); b.rotation.z = -0.4; B(0.1, 0.12, 0.12, '#d8306a').position.y = 0.05; break; }
    case 'coif': { const h = B(0.74, 0.32, 0.7, '#9aa4b2'); h.position.y = 0; const p = B(0.1, 0.3, 0.5, '#e04848'); p.position.y = 0.3; break; }
    case 'palarie': { C(0.05, 1.1, 1.1, '#3b2a1f').position.y = 0; C(0.36, 0.62, 0.66, '#3b2a1f').position.y = 0.2; break; }
    case 'vrajitor': { C(0.05, 1.0, 1.0, '#4b3cc4').position.y = 0; const c = C(0.9, 0, 0.6, '#4b3cc4'); c.position.y = 0.47; c.rotation.z = 0.15; break; }
    case 'urechi': { const l = B(0.16, 0.32, 0.1, '#a8501f'); l.position.set(-0.24, 0.12, 0); l.rotation.z = 0.2; const r = B(0.16, 0.32, 0.1, '#a8501f'); r.position.set(0.24, 0.12, 0); r.rotation.z = -0.2; break; }
    case 'bucatar': { C(0.16, 0.66, 0.66, '#ffffff').position.y = 0.05; C(0.36, 0.86, 0.66, '#ffffff').position.y = 0.3; break; }
    case 'ochelari': { const l = B(0.24, 0.16, 0.04, '#1f2b3a'); l.position.set(-0.16, -0.27, 0.34); const r = B(0.24, 0.16, 0.04, '#1f2b3a'); r.position.set(0.16, -0.27, 0.34); break; }
    case 'coroana': { C(0.22, 0.66, 0.66, '#f2b632', 8).position.y = 0.08; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const s = C(0.22, 0, 0.14, '#f2b632', 4); s.position.set(0.3 * Math.cos(a), 0.3, 0.3 * Math.sin(a)); } break; }
    case 'basma': { const h = B(0.72, 0.2, 0.68, '#d23a3a'); h.position.y = -0.02; const k = B(0.3, 0.3, 0.06, '#d23a3a'); k.position.set(0, -0.3, -0.34); k.rotation.z = Math.PI / 4; break; }
    default: break;
  }
}

/** Etichetă cu nume care se întoarce mereu spre cameră. */
export function makeLabel(scene, text, sub, color = '#1f2b3a', w = 3.6) {
  const tex = new DynamicTexture('lbl' + text, { width: 512, height: sub ? 150 : 96 }, scene, true);
  const g = tex.getContext(), H = sub ? 150 : 96;
  g.clearRect(0, 0, 512, H);
  g.font = '800 46px "Baloo 2", system-ui, sans-serif';
  const tw = Math.min(490, Math.max(g.measureText(text).width, sub ? (g.font = '700 30px Nunito, system-ui', g.measureText(sub).width) : 0) + 50);
  const x0 = (512 - tw) / 2;
  g.fillStyle = 'rgba(255,250,240,0.95)'; g.strokeStyle = color; g.lineWidth = 6;
  const r = 26; g.beginPath(); g.moveTo(x0 + r, 4); g.arcTo(x0 + tw, 4, x0 + tw, H - 4, r); g.arcTo(x0 + tw, H - 4, x0, H - 4, r); g.arcTo(x0, H - 4, x0, 4, r); g.arcTo(x0, 4, x0 + tw, 4, r); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#1f2b3a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '800 46px "Baloo 2", system-ui, sans-serif';
  g.fillText(text, 256, sub ? 56 : 50, 470);
  if (sub) { g.font = '700 30px Nunito, system-ui, sans-serif'; g.fillStyle = '#5f6c7b'; g.fillText(sub, 256, 110, 470); }
  tex.update(); tex.hasAlpha = true;
  const p = MeshBuilder.CreatePlane('lp' + text, { width: w, height: w * H / 512 }, scene);
  const m = new StandardMaterial('lm' + text, scene); m.emissiveTexture = tex; m.opacityTexture = tex; m.disableLighting = true; m.backFaceCulling = false;
  p.material = m; p.billboardMode = Mesh.BILLBOARDMODE_ALL; p.isPickable = false; LABELS.push(p);
  return p;
}
