// Test Harta Naturii: cartonașe, cuvinte (album), sortare, circuitul apei, exerciții, insignă, album complet + pălărie.
// Rulare: PORT=4174 node server.js & apoi node tools/test-harta-naturii.cjs
const { chromium } = require('playwright');
const results = []; const ok = (n, c, i = '') => results.push({ n, pass: !!c, i });
(async () => {
  const dir = process.argv[2] || '.';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 420, height: 860 }, deviceScaleFactor: 2 });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4174/'); await p.waitForTimeout(5500);
  await p.click('#wGuest'); await p.fill('#gN', 'Luca'); await p.click('#gG [data-g="3"]'); await p.click('#gGo'); await p.waitForTimeout(600);
  await p.click('[data-close]'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ui.S.seen = new Proxy({}, { get: () => true }); });
  await p.click('[data-t="subj:stiinte"]'); await p.waitForTimeout(300); await p.click('#pvNat'); await p.waitForTimeout(500);
  ok('Harta Naturii se deschide cu 6 ținuturi', (await p.locator('.nm-node').count()) === 6);
  await p.screenshot({ path: dir + '/n-harta.png' });
  const coins = () => p.evaluate(() => window.__ui.S.coins);
  const regions = ['viata', 'animale', 'om', 'apa', 'mediu', 'corpuri'];
  for (const [ri, id] of regions.entries()) {
    await p.click(`.nm-node[data-r="${id}"]`); await p.waitForTimeout(300);
    // 1. cartonașe
    await p.click('#nsFacts'); for (let k = 0; k < 10; k++) { if (!(await p.locator('#nfNext').count())) break; await p.click('#nfNext'); await p.waitForTimeout(120); }
    // 2. cuvinte
    await p.click('#nsWords'); for (let k = 0; k < 20; k++) { if (!(await p.locator('#nwCard').count())) break; await p.click('#nwCard'); await p.waitForTimeout(80); if (ri === 0 && k === 0) await p.screenshot({ path: dir + '/n-cartonas.png' }); await p.click('#nwKnow'); await p.waitForTimeout(80); }
    // 3. sortare: perfect (la primul ținut cu o greșeală)
    await p.click('#nsGame');
    for (let k = 0; k < 20; k++) {
      if (!(await p.locator('.nm-bucket').count())) break;
      let a = await p.evaluate(() => window.__natAns);
      if (ri === 0 && k === 0) a = a ? 0 : 1;
      if (ri === 1 && k === 2) await p.screenshot({ path: dir + '/n-sortare.png' });
      await p.click(`.nm-bucket[data-k="${a}"]`); await p.waitForTimeout(ri === 0 && k === 0 ? 1500 : 650);
    }
    await p.click('#nsOk');
    // 3b. circuitul apei
    if (id === 'apa') {
      await p.click('#nsCycle');
      for (let k = 0; k < 8; k++) { if (!(await p.locator('.nm-cycle').count())) break; const part = await p.evaluate(() => window.__natAns); if (k === 1) await p.screenshot({ path: dir + '/n-circuit.png' }); await p.$eval(`.nm-cycle [data-p="${part}"]`, (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))); await p.waitForTimeout(600); }
      await p.click('#ncOk');
    }
    // 4. exerciții: 5/5
    await p.click('#nsEx'); await p.waitForTimeout(300);
    for (let k = 0; k < 5; k++) {
      const kk = await p.evaluate(() => { const Q = window.__ui.Q(), q = Q.qs[Q.i]; return q.opts.findIndex((o) => o === q.ans); });
      await p.click(`#quizCard [data-k="${kk}"]`); await p.click('#next'); await p.waitForTimeout(150);
    }
    await p.click('#back'); await p.waitForTimeout(500);
    ok(`Ținutul ${id}: insigna câștigată`, await p.evaluate((id) => !!(window.__ui.S.nat.badges || {})[id], id));
    await p.click('#nmMap');
  }
  ok('Albumul e complet și dă Pălăria de explorator', await p.evaluate(() => !!window.__ui.S.nat.album && window.__ui.S.owned.includes('hat:explorator')));
  ok('Monede adunate pe hartă', (await coins()) > 400, await coins());
  await p.screenshot({ path: dir + '/n-harta-final.png' });
  await p.click('#nmAlbum'); await p.waitForTimeout(300); await p.screenshot({ path: dir + '/n-album.png' });
  ok('Fără erori', errs.length === 0, errs.join(' | '));
  await b.close();
  console.log(results.map((r) => `${r.pass ? '✓' : '✗'} ${r.n}${r.pass ? '' : '  → ' + r.i}`).join('\n'));
  console.log(`\n${results.filter((r) => r.pass).length} din ${results.length} teste trecute.`);
})();
