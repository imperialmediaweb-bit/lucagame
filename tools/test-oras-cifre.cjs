// Test Orașul Cifrelor: porți, cristale, turn, tarabe, dragon. Rulare: PORT=4174 node server.js & apoi node tools/test-oras-cifre.cjs .
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
  await p.click('[data-t="subj:mate"]'); await p.waitForTimeout(300); await p.click('#pvWorld'); await p.waitForTimeout(1500);
  const tp = (x, z, y = 0.6) => p.evaluate(([x, z, y]) => window.__dbg.teleport(x, z, y), [x, z, y]);
  const away = async () => { await tp(600, -8); await p.waitForTimeout(250); };
  const answer = async (good) => {
    await p.waitForSelector('#quiz:not([hidden])', { timeout: 4000 });
    const k = await p.evaluate((good) => { const Q = window.__ui.Q(), q = Q.qs[Q.i]; if (q.kind === 'tap') return good ? q.ans : q.toks.findIndex((t, i) => /^[+−×:]$/.test(t) && i !== q.ans); const i = q.opts.findIndex((o) => o === q.ans); return good ? i : (i + 1) % q.opts.length; }, good);
    await p.click(`#quizCard [data-k="${k}"]`); await p.click('#next'); await p.waitForTimeout(300);
  };
  const M = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__ui.S.worlds.mate)));
  // porți: o greșeală, apoi toate corecte
  for (const [i, gz] of [-42, -54, -66, -78, -90].entries()) {
    await away(); await tp(600, gz + 2.4); await p.waitForTimeout(250);
    if (i === 0) { await answer(false); await away(); await tp(600, gz + 2.4); await p.waitForTimeout(250); }
    await answer(true);
  }
  console.log('porți deschise', (await M()).gates);
  await tp(600, -70); await p.waitForTimeout(800);
  console.log('poți trece prin poarta 3:', await p.evaluate(() => window.__dbg.P.z) < -60);
  // cristale
  for (const [x, z] of [[48, -14], [55, 12], [63, -22], [70, 4], [76, 20], [82, -10], [88, 8], [72, -26]]) { await away(); await tp(600 + x, z); await p.waitForTimeout(250); await answer(true); }
  console.log('cristale', (await M()).crystals.length);
  // turn: urcă etaj cu etaj, cu o greșeală la etajul 2
  await away();
  const pos = (k) => [538 + Math.cos(k * 1.05) * 10, Math.sin(k * 1.05) * 10];
  let [x0, z0] = pos(0); await tp(x0, z0); await p.waitForTimeout(250);
  for (let step = 0; step < 9; step++) {
    if (!(await p.waitForSelector('#quiz:not([hidden])', { timeout: 3000 }).then(() => true, () => false))) break;
    await answer(step !== 2);
    await p.waitForTimeout(300);
    const P = await p.evaluate(() => ({ ...window.__dbg.P }));
    // pășește pe cercul etajului unde ai ajuns
    const k = Math.round(P.y / 5); const [bx, bz] = pos(k); await tp(bx, bz, P.y); await p.waitForTimeout(300);
    if (step === 2) console.log('după greșeală ești la etajul', k);
  }
  await p.waitForTimeout(300);
  console.log('vârful turnului', (await M()).top, 'y', await p.evaluate(() => window.__dbg.P.y));
  await p.screenshot({ path: dir + '/t-turn-sus.png' });
  // tarabe
  for (const [dx, dz] of [[-12, -6], [0, -6], [12, -6], [0, 8]]) { await away(); await tp(658 + dx, 58 + dz + 2.2); await p.waitForTimeout(250); await answer(true); }
  console.log('tarabe', (await M()).stalls.length, 'monede', await p.evaluate(() => window.__ui.S.coins));
  // castel: ușa deschisă, lupta cu dragonul
  await away(); await tp(600, 62); await p.waitForTimeout(600);
  console.log('intrat în castel', await p.evaluate(() => window.__dbg.P.z) > 61);
  await tp(600, 76); await p.waitForTimeout(400); await p.click('#cfYes');
  for (let i = 0; i < 7; i++) { await answer(i !== 1); if (!(await p.waitForSelector('#quiz:not([hidden])', { timeout: 3000 }).then(() => true, () => false))) break; }
  await p.waitForTimeout(500);
  console.log('dragon învins', (await M()).boss, 'monede', await p.evaluate(() => window.__ui.S.coins));
  await p.screenshot({ path: dir + '/t-dragon.png' });
  console.log('errors', errs.slice(0, 5));
  await b.close();
})();
