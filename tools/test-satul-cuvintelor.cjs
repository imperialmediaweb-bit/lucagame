// Test Satul Cuvintelor: podul, biblioteca, labirintul, vrăjitorul. Rulare: PORT=4174 node server.js & apoi node tools/test-satul-cuvintelor.cjs
const { chromium } = require('playwright');
(async () => {
  const dir = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4174/'); await p.waitForTimeout(5500);
  await p.click('#wGuest'); await p.fill('#gN', 'Luca'); await p.click('#gG [data-g="3"]'); await p.click('#gGo'); await p.waitForTimeout(600);
  await p.click('[data-close]'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ui.S.seen = new Proxy({}, { get: () => true }); });
  await p.click('[data-t="subj:romana"]'); await p.waitForTimeout(300); await p.click('#pvWorld'); await p.waitForTimeout(1500);
  await p.screenshot({ path: dir + '/r-piata.png' });
  const O = -600, tp = (x, z, y = 0.6) => p.evaluate(([x, z, y]) => window.__dbg.teleport(x, z, y), [O + x, z, y]);
  const P = () => p.evaluate(() => ({ ...window.__dbg.P }));
  const away = async () => { await tp(0, -7); await p.waitForTimeout(250); };
  const answer = async (good) => {
    await p.waitForSelector('#quiz:not([hidden])', { timeout: 4000 });
    const k = await p.evaluate((good) => { const Q = window.__ui.Q(), q = Q.qs[Q.i]; if (q.kind === 'tap') return good ? q.ans : q.toks.findIndex((t, i) => /^[+−×:]$/.test(t) && i !== q.ans); const i = q.opts.findIndex((o) => o === q.ans); return good ? i : (i + 1) % q.opts.length; }, good);
    await p.click(`#quizCard [data-k="${k}"]`); await p.click('#next'); await p.waitForTimeout(300);
  };
  const M = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__ui.S.worlds.romana)));
  // podul: o scândură greșită, apoi 7 bune, mergând pe pod
  await tp(0, -40); await p.waitForTimeout(200);
  await tp(0, -42.2); await p.waitForTimeout(300); await answer(false);
  await tp(0, -38); await p.waitForTimeout(250);
  for (let i = 0; i < 7; i++) { await tp(0, -42.2 - i * 2); await p.waitForTimeout(350); await answer(true); }
  await tp(0, -50); await p.waitForTimeout(800);
  const onBridge = await P();
  console.log('scânduri', (await M()).planks, '| stai pe pod la mijlocul râului:', onBridge.y > -0.5);
  await tp(0, -59); await p.waitForTimeout(700); await p.screenshot({ path: dir + '/r-pod.png' });
  // biblioteca
  for (const [x, z] of [[52, -8], [58, 8], [64, -10], [68, 4], [72, -4], [56, 0]]) { await away(); await tp(x, z); await p.waitForTimeout(250); await answer(true); }
  await p.waitForTimeout(1500);
  console.log('cărți la raft', (await M()).books.length);
  await tp(66, 0, 0.6); await p.evaluate(() => window.__dbg.setYaw(-Math.PI / 2)); await p.waitForTimeout(800); await p.screenshot({ path: dir + '/r-biblioteca.png' });
  // labirintul: o ușă greșită, apoi ușile bune
  await away(); await tp(-41, 0); await p.waitForTimeout(500);
  console.log('întrebarea apare sus:', await p.locator('#wq').isVisible());
  await p.screenshot({ path: dir + '/r-labirint.png' });
  const ARCH = [-4.5, 0, 4.5], ROOMS = [-45, -59, -73, -87];
  let first = true;
  for (let guard = 0; guard < 8; guard++) {
    const q = await p.evaluate(() => window.__rom.mq()); if (!q) break;
    let i = q.opts.indexOf(q.ans); if (first) { i = (i + 1) % q.opts.length; first = false; }
    await tp(ROOMS[q.room] - 4, ARCH[i]); await p.waitForTimeout(200); await tp(ROOMS[q.room] - 7.6, ARCH[i]); await p.waitForTimeout(400);
    if (await p.locator('#panel').isVisible()) { console.log('ușă greșită → explicație:', (await p.textContent('#panelCard h2'))); await p.click('[data-close]'); }
  }
  console.log('camere trecute', (await M()).room);
  // turnul vrăjitorului
  await away(); await tp(0, 69); await p.waitForTimeout(400);
  await p.click('#cfYes');
  for (let i = 0; i < 8; i++) { await answer(i !== 2); if (!(await p.waitForSelector('#quiz:not([hidden])', { timeout: 3000 }).then(() => true, () => false))) break; }
  console.log('vrăjitor învins', (await M()).boss, 'monede', await p.evaluate(() => window.__ui.S.coins));
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
