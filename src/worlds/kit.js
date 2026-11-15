// Unelte de construit lumi: cutii cu coliziune, platforme, cilindri, copaci, etichete, personaje.
// Totul e mutat la originea lumii (ox, oz), departe de insula principală.
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { mat, makeLabel, createAvatar } from '../avatar.js';

export function makeKit(ctx, ox, oz) {
  const { scene, shadow, colliders } = ctx;
  let n = 0;
  const col = (m, x, y, z, w, h, d) => { const c = { x1: ox + x - w / 2, x2: ox + x + w / 2, y1: y - h / 2, y2: y + h / 2, z1: oz + z - d / 2, z2: oz + z + d / 2, bounce: 0, mesh: m }; colliders.push(c); return c; };
  const K = {
    ox, oz,
    box(x, y, z, w, h, d, color, opt = {}) {
      const m = MeshBuilder.CreateBox('wb' + n++, { width: w, height: h, depth: d }, scene);
      m.position.set(ox + x, y, oz + z); m.material = mat(scene, color, opt.glow || 0); m.receiveShadows = true;
      if (opt.cast) shadow.addShadowCaster(m);
      if (opt.collide !== false) m.col = col(m, x, y, z, w, h, d);
      if (opt.rot) m.rotation.y = opt.rot;
      return m;
    },
    plat(x, top, z, w, d, color, h = 0.6, opt) { return K.box(x, top - h / 2, z, w, h, d, color, opt); },
    cyl(x, y, z, dia, h, color, opt = {}) {
      const m = MeshBuilder.CreateCylinder('wc' + n++, { diameter: dia, height: h, tessellation: opt.tess || 24, diameterTop: opt.top ?? dia }, scene);
      m.position.set(ox + x, y, oz + z); m.material = mat(scene, color, opt.glow || 0); m.receiveShadows = true;
      if (opt.cast) shadow.addShadowCaster(m);
      if (opt.collide) m.col = col(m, x, y, z, dia * 0.8, h, dia * 0.8);
      return m;
    },
    sphere(x, y, z, dia, color, opt = {}) {
      const m = MeshBuilder.CreateSphere('ws' + n++, { diameter: dia, segments: 12 }, scene);
      m.position.set(ox + x, y, oz + z); m.material = mat(scene, color, opt.glow || 0); if (opt.cast) shadow.addShadowCaster(m); return m;
    },
    tree(x, z, s = 1, leaf = '#3f9c4a') {
      K.cyl(x, 1.2 * s, z, 0.6 * s, 2.4 * s, '#8a5a2b', { collide: true, cast: true });
      K.cyl(x, 3.4 * s, z, 3.2 * s, 2.6 * s, leaf, { top: 0, cast: true, tess: 8 });
      K.cyl(x, 4.6 * s, z, 2.2 * s, 2 * s, leaf, { top: 0, cast: true, tess: 8 });
    },
    label(text, sub, color, w, x, y, z) { const l = makeLabel(scene, text, sub, color, w); l.position.set(ox + x, y, oz + z); ctx.labelHook && ctx.labelHook(l); return l; },
    avatar(look, x, y, z, rot = 0) { const a = createAvatar(scene, look, shadow, 'w' + n++); a.root.position.set(ox + x, y, oz + z); a.root.rotation.y = rot; return a; },
    // deschide/închide o coliziune (porți, uși)
    setSolid(m, on) { if (!m.col) return; if (m.col.y1Orig === undefined) { m.col.y1Orig = m.col.y1; m.col.y2Orig = m.col.y2; } m.col.y1 = on ? m.col.y1Orig : -100; m.col.y2 = on ? m.col.y2Orig : -99; }
  };
  return K;
}
