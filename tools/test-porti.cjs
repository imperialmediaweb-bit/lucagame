// Robot care încearcă să treacă de porțile închise și de zidurile insulelor, din zeci de poziții și în mai multe feluri
// (mers drept, mers pe lângă, sărituri, zig-zag). Rulare: PORT=4174 node server.js & apoi node tools/test-porti.cjs
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:4174/';

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 640, height: 480 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(6000);
  await p.click('#wGuest'); await p.fill('#gN', 'Robot'); await p.click('#gG [data-g="3"]'); await p.click('#gGo'); await p.waitForTimeout(400);
  await p.click('[data-close]').catch(() => {});
  await p.evaluate(() => { const h = document.getElementById('home'); if (h) h.hidden = true; document.getElementById('panel').hidden = true; });
  await p.addStyleTag({ content: '#quest{visibility:hidden}' });

  const fails = []; let runs = 0;
  // o încercare: pornesc din (x,z), privesc spre (dx,dz), apăs tastele un timp; verific unde am ajuns
  async function attempt(name, x, z, dirx, dirz, pattern, ms, bad) {
    runs++;
    await p.evaluate(([x, z, dx, dz]) => { window.__dbg.teleport(x, z, 0.5); window.__dbg.setYaw(Math.atan2(-dx, -dz)); }, [x, z, dirx, dirz]);
    await p.waitForTimeout(150);
    const t0 = Date.now(); let i = 0;
    await p.keyboard.down('KeyW');
    while (Date.now() - t0 < ms) {
      if (pattern.includes('jump')) await p.keyboard.press('Space');
      if (pattern.includes('zig')) { const k = i++ % 2 ? 'KeyA' : 'KeyD'; await p.keyboard.down(k); await p.waitForTimeout(220); await p.keyboard.up(k); }
      else if (pattern.includes('left')) { await p.keyboard.down('KeyA'); await p.waitForTimeout(200); }
      else if (pattern.includes('right')) { await p.keyboard.down('KeyD'); await p.waitForTimeout(200); }
      else await p.waitForTimeout(200);
      const P = await p.evaluate(() => ({ x: window.__dbg.P.x, y: window.__dbg.P.y, z: window.__dbg.P.z }));
      if (bad(P)) { fails.push(`${name} [${pattern}] a scăpat la x=${P.x.toFixed(1)} y=${P.y.toFixed(1)} z=${P.z.toFixed(1)}`); break; }
    }
    for (const k of ['KeyW', 'KeyA', 'KeyD']) await p.keyboard.up(k);
  }
  const patterns = ['straight', 'jump', 'zig', 'zig jump', 'left jump', 'right jump'];

  // 1) porțile spre Clasa I (pod spre -z) și Clasa a II-a (pod spre +x) sunt închise pentru clasa a III-a
  for (const off of [-2.0, -1.0, 0, 1.0, 2.0]) for (const pat of patterns) {
    await attempt(`poarta Clasa I, decalaj ${off}`, off, -17, 0, -1, pat, 2600, (P) => P.z < -21.6);
    await attempt(`poarta Clasa a II-a, decalaj ${off}`, 17, off, 1, 0, pat, 2600, (P) => P.x > 21.6);
  }
  // pe lângă poartă, pe diagonală, din colțul golului din zid
  for (const [x, z, dx, dz] of [[2.5, -18.5, 0.3, -1], [-2.5, -18.5, -0.3, -1], [18.5, 2.5, 1, 0.3], [18.5, -2.5, 1, -0.3]]) for (const pat of patterns)
    await attempt(`pe lângă poartă (${x},${z})`, x, z, dx, dz, pat, 2600, (P) => Math.abs(P.z) > 21.6 || Math.abs(P.x) > 21.6);

  // 2) zidurile insulei din mijloc: din 16 puncte de pe margine, spre exterior
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + 0.2, x = Math.cos(a) * 17, z = Math.sin(a) * 17;
    if (Math.abs(x) < 3.2 || Math.abs(z) < 3.2) continue; // dreptul podurilor e testat separat
    for (const pat of ['straight', 'jump', 'zig jump']) await attempt(`zid piață ${k}`, x, z, Math.cos(a), Math.sin(a), pat, 2000, (P) => Math.max(Math.abs(P.x), Math.abs(P.z)) > 20.8 || P.y < -1);
  }
  // 3) zidurile insulei Clasei a III-a (permisă) și ale Arenei
  for (const [cx, cz] of [[-52, 0], [0, 52]]) for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + 0.3, x = cx + Math.cos(a) * 15.5, z = cz + Math.sin(a) * 15.5;
    for (const pat of ['straight', 'jump']) await attempt(`zid insulă (${cx},${cz}) ${k}`, x, z, Math.cos(a), Math.sin(a), pat, 1800, (P) => Math.max(Math.abs(P.x - cx), Math.abs(P.z - cz)) > 18.8 || P.y < -1);
  }
  // 4) portalurile din piață spre clasele închise nu teleportează
  for (const id of ['1', '2', '0', '4']) {
    runs++;
    const pad = await p.evaluate((id) => { const q = window.__dbg.W.pads.find((x) => x.area.id === id); return { x: q.x, z: q.z, ax: q.area.pos[0], az: q.area.pos[1] }; }, id);
    await p.evaluate(([x, z]) => window.__dbg.teleport(x, z, 0.5), [pad.x, pad.z]); await p.waitForTimeout(800);
    const P = await p.evaluate(() => ({ x: window.__dbg.P.x, z: window.__dbg.P.z }));
    if (Math.hypot(P.x - pad.ax, P.z - pad.az) < 25) fails.push(`portalul spre clasa ${id} m-a teleportat deși e închis`);
  }
  console.log(`Încercări: ${runs}. ${fails.length ? 'PROBLEME:\n' + fails.join('\n') : 'Nicio scăpare: porțile și zidurile țin.'}`);
  if (errs.length) console.log('Erori în pagină:', errs.slice(0, 5));
  await b.close();
  process.exit(fails.length || errs.length ? 1 : 0);
})();
