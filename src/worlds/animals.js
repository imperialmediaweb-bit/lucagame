// Animale 3D adevărate (rotunjite, cu urechi, ochi, cozi), nu cutii. Fiecare privește spre -z.
// Întoarce lista de bucăți, ca să poată fi mutate împreună.
export function animal(K, kind, x, z, S = 1.7) {
  const P = [];
  const ell = (dx, y, dz, sx, sy, sz, c, glow) => { const m = K.sphere(x + dx, y, z + dz, 1, c, glow ? { glow } : { cast: true }); m.scaling.set(sx, sy, sz); P.push(m); return m; };
  const leg = (dx, dz, h, d, c) => { const m = K.cyl(x + dx, h / 2, z + dz, d, h, c); P.push(m); return m; };
  const cone = (dx, y, dz, d, h, c, rx = 0, rz = 0) => { const m = K.cyl(x + dx, y, z + dz, d, h, c, { top: 0, tess: 10 }); m.rotation.x = rx; m.rotation.z = rz; P.push(m); return m; };
  const eyes = (y, dz, gap = 0.18, s = 0.13) => { [-gap, gap].forEach((g) => { ell(g, y, dz, s, s, s * 0.6, '#ffffff'); ell(g, y, dz - 0.05, s * 0.55, s * 0.55, s * 0.4, '#1F2B3A'); }); };
  switch (kind) {
    case 'vulpea': {
      const c = '#e8742a';
      ell(0, 0.95, 0.1, 0.8, 0.7, 1.4, c); ell(0, 0.8, -0.25, 0.5, 0.45, 0.6, '#fff4e6');
      ell(0, 1.45, -0.75, 0.75, 0.68, 0.72, c); cone(0, 1.33, -1.18, 0.38, 0.45, '#fff4e6', -Math.PI / 2); ell(0, 1.33, -1.42, 0.1, 0.1, 0.1, '#1F2B3A');
      cone(-0.22, 1.92, -0.7, 0.28, 0.42, c); cone(0.22, 1.92, -0.7, 0.28, 0.42, c);
      eyes(1.55, -1.08, 0.16, 0.12);
      ell(0, 1.05, 0.95, 0.38, 0.38, 0.95, c).rotation.x = -0.5; ell(0, 1.3, 1.45, 0.26, 0.26, 0.3, '#ffffff');
      [[-0.25, -0.35], [0.25, -0.35], [-0.25, 0.5], [0.25, 0.5]].forEach(([a, b]) => leg(a, b, 0.65, 0.16, '#3b2a1f'));
      break;
    }
    case 'ursul': {
      const c = '#7b4a2a';
      ell(0, 1.25, 0.1, 1.4, 1.2, 1.8, c);
      ell(0, 2.1, -0.95, 1.0, 0.95, 0.95, c); ell(0, 1.92, -1.42, 0.45, 0.35, 0.35, '#c9a27e'); ell(0, 2.0, -1.6, 0.16, 0.12, 0.1, '#1F2B3A');
      ell(-0.38, 2.6, -0.9, 0.3, 0.3, 0.18, c); ell(0.38, 2.6, -0.9, 0.3, 0.3, 0.18, c);
      eyes(2.22, -1.38, 0.2, 0.12);
      [[-0.45, -0.5], [0.45, -0.5], [-0.45, 0.6], [0.45, 0.6]].forEach(([a, b]) => leg(a, b, 0.75, 0.42, '#5d3a20'));
      break;
    }
    case 'iepurele': {
      const c = '#f4f4f4';
      ell(0, 0.6, 0.1, 0.75, 0.7, 0.95, c); ell(0, 1.12, -0.42, 0.6, 0.58, 0.6, c);
      [-0.13, 0.13].forEach((g) => { const e = ell(g, 1.75, -0.38, 0.16, 0.75, 0.1, c); e.rotation.z = g * 0.8; const i = ell(g, 1.75, -0.43, 0.08, 0.6, 0.05, '#ffb3c7'); i.rotation.z = g * 0.8; });
      eyes(1.2, -0.7, 0.14, 0.1); ell(0, 1.04, -0.74, 0.08, 0.06, 0.06, '#ff8fab');
      ell(0, 0.72, 0.6, 0.25, 0.25, 0.25, '#ffffff');
      [[-0.2, -0.2], [0.2, -0.2]].forEach(([a, b]) => leg(a, b, 0.35, 0.14, c)); ell(-0.25, 0.22, 0.35, 0.22, 0.2, 0.45, c); ell(0.25, 0.22, 0.35, 0.22, 0.2, 0.45, c);
      break;
    }
    case 'broasca': {
      const c = '#4cc23a';
      ell(0, 0.45, 0, 1.0, 0.6, 1.05, c); ell(0, 0.35, -0.15, 0.8, 0.35, 0.8, '#b8f0a0');
      [-0.27, 0.27].forEach((g) => { ell(g, 0.82, -0.3, 0.32, 0.32, 0.32, c); ell(g, 0.88, -0.42, 0.22, 0.22, 0.12, '#ffffff'); ell(g, 0.88, -0.48, 0.12, 0.14, 0.06, '#1F2B3A'); });
      const m = ell(0, 0.5, -0.5, 0.45, 0.04, 0.05, '#2b6b20'); m.rotation.y = 0;
      [[-0.55, 0.3], [0.55, 0.3]].forEach(([a, b]) => ell(a, 0.18, b, 0.35, 0.18, 0.6, c)); [[-0.4, -0.35], [0.4, -0.35]].forEach(([a, b]) => ell(a, 0.15, b, 0.2, 0.12, 0.25, c));
      break;
    }
    case 'căprioara': {
      const c = '#c48a55';
      ell(0, 1.45, 0.1, 0.75, 0.75, 1.5, c); ell(0, 1.4, 0.5, 0.5, 0.5, 0.6, '#d9a877');
      const n = K.cyl(x, 2.05, z - 0.6, 0.34, 1.0, c); n.rotation.x = -0.5; P.push(n);
      ell(0, 2.55, -0.85, 0.48, 0.48, 0.65, c); ell(0, 2.45, -1.18, 0.22, 0.2, 0.25, '#3b2a1f');
      eyes(2.65, -1.05, 0.18, 0.1);
      [-1, 1].forEach((s) => { const a = K.cyl(x + s * 0.2, 3.15, z - 0.8, 0.07, 0.8, '#6b4a2b'); a.rotation.z = s * 0.35; P.push(a); const b = K.cyl(x + s * 0.38, 3.35, z - 0.8, 0.06, 0.45, '#6b4a2b'); b.rotation.z = s * 1.0; P.push(b); cone(s * 0.33, 2.85, -0.75, 0.2, 0.3, c, 0, s * 0.8); });
      ell(0, 1.75, 0.95, 0.2, 0.25, 0.15, '#ffffff');
      [[-0.25, -0.45], [0.25, -0.45], [-0.25, 0.55], [0.25, 0.55]].forEach(([a, b]) => leg(a, b, 1.15, 0.13, '#8a5a2b'));
      break;
    }
    case 'bufnița': {
      const c = '#8a6a4a';
      const st = K.cyl(x, 0.5, z, 1.0, 1.0, '#6b4a2b', { tess: 14 }); P.push(st);
      ell(0, 1.55, 0, 0.8, 1.05, 0.75, c); ell(0, 1.4, -0.25, 0.55, 0.7, 0.4, '#e9d6b8');
      [-0.2, 0.2].forEach((g) => { ell(g, 1.82, -0.32, 0.3, 0.3, 0.12, '#ffffff'); ell(g, 1.82, -0.38, 0.17, 0.17, 0.08, '#ff9f1c'); ell(g, 1.82, -0.42, 0.09, 0.09, 0.05, '#1F2B3A'); });
      cone(0, 1.62, -0.42, 0.12, 0.2, '#ffb000', Math.PI / 2);
      cone(-0.25, 2.18, -0.05, 0.2, 0.32, c, 0, 0.3); cone(0.25, 2.18, -0.05, 0.2, 0.32, c, 0, -0.3);
      ell(-0.4, 1.45, 0.05, 0.18, 0.6, 0.45, '#6b4a2b'); ell(0.4, 1.45, 0.05, 0.18, 0.6, 0.45, '#6b4a2b');
      break;
    }
    default: ell(0, 0.8, 0, 1, 0.8, 1.4, '#999999');
  }
  // mai mari, ca să se vadă bine lângă copil
  const bx = K.ox + x, bz = K.oz + z;
  P.forEach((m) => { m.position.x = bx + (m.position.x - bx) * S; m.position.y *= S; m.position.z = bz + (m.position.z - bz) * S; m.scaling.scaleInPlace(S); });
  return P;
}
