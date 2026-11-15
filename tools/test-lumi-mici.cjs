// Test lumile mici: Laboratorul Naturii, English Island, Orașul Bunătății. Rulare: PORT=4174 node server.js & apoi node tools/test-lumi-mici.cjs
const { chromium } = require('playwright');
const W = {
  stiinte: { O: [600, 600], dbg: '__st', collect: { animals: [[-40, -60], [35, -70], [-20, -85], [50, -40], [-55, -30], [20, -95]], organs: [[66, -10], [66, -5], [66, 0], [66, 5], [66, 10]] } },
  engleza: { O: [-600, 600], dbg: '__en', collect: { ships: [[-48, 72], [-24, 72], [0, 72], [24, 72], [48, 72]], balloons: [[51, -20], [50, 0], [73, -22], [74, 2], [62, -24], [58, 4]] } },
  civica: { O: [0, 600], dbg: '__cv', collect: { help: [[-30, -37.8], [-10, -52.8], [12, -39.8], [30, -57.8], [-22, -72.8], [18, -79.8]], flowers: [[51, -4.4], [60, -6.4], [69, -4.4], [55, 6.6], [65, 6.6]] } }
};
(async () => {
  const dir = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4174/'); await p.waitForTimeout(5500);
  await p.click('#wGuest'); await p.fill('#gN', 'Luca'); await p.click('#gG [data-g="3"]'); await p.click('#gGo'); await p.waitForTimeout(600);
  await p.click('[data-close]'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ui.S.seen = new Proxy({}, { get: () => true }); });
  const quizUp = () => p.waitForSelector('#quiz:not([hidden])', { timeout: 4000 }).then(() => true, () => false);
  const answer = async (good) => {
    if (!(await quizUp())) return false;
    const k = await p.evaluate((good) => { const Q = window.__ui.Q(), q = Q.qs[Q.i]; if (q.kind === 'tap') return good ? q.ans : q.toks.findIndex((t, i) => /^[+−×:]$/.test(t) && i !== q.ans); const i = q.opts.findIndex((o) => o === q.ans); return good ? i : (i + 1) % q.opts.length; }, good);
    await p.click(`#quizCard [data-k="${k}"]`); await p.click('#next'); await p.waitForTimeout(300); return true;
  };
  for (const [id, w] of Object.entries(W)) {
    if (await p.locator('#home').isHidden()) { await p.click('#openHome'); await p.waitForTimeout(300); }
    await p.click(`[data-t="subj:${id}"]`); await p.waitForTimeout(300); await p.click('#pvWorld'); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${dir}/m-${id}.png` });
    const [ox, oz] = w.O, tp = (x, z, y = 0.6) => p.evaluate(([x, z, y]) => window.__dbg.teleport(x, z, y), [ox + x, oz + z, y]);
    const away = async () => { await tp(0, -8); await p.waitForTimeout(250); };
    for (const [key, pts] of Object.entries(w.collect)) {
      let n = 0;
      for (const [i, [x, z]] of pts.entries()) { await away(); await tp(x, z); await p.waitForTimeout(300); if (await answer(true)) n++; }
      const got = await p.evaluate(([id, key]) => (window.__ui.S.worlds[id][key] || []).length, [id, key]);
      console.log(id, key, got, '/', pts.length);
    }
    // poteca cu porți: prima greșită, apoi corecte
    const STG = [-38, -56, -74], AR = [-4.5, 0, 4.5];
    await away(); await tp(-28, 0); await p.waitForTimeout(400);
    let first = true;
    for (let g = 0; g < 6; g++) {
      const q = await p.evaluate((d) => window[d].path(), w.dbg); if (!q) break;
      let i = q.opts.indexOf(q.ans); if (first) { i = (i + 1) % q.opts.length; first = false; }
      await tp(STG[q.r] + 4, AR[i]); await p.waitForTimeout(250); await tp(STG[q.r] - 0.6, AR[i]); await p.waitForTimeout(450);
      if (await p.locator('#panel').isVisible()) await p.click('[data-close]');
    }
    console.log(id, 'porți', await p.evaluate((id) => window.__ui.S.worlds[id].path, id), '/ 3');
    await tp(STG[0] + 9, 0); await p.waitForTimeout(800); await p.screenshot({ path: `${dir}/m-${id}-poteca.png` });
  }
  console.log('monede', await p.evaluate(() => window.__ui.S.coins), 'errors', errs.slice(0, 5));
  await b.close();
})();
