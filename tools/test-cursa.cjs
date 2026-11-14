// Test: cursa monștrilor cu colegii (Luca cheamă, Ana intră, Mihai refuză; Luca câștigă) și „Cheamă colegii la mine”.
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:4174/';
const results = []; const ok = (n, c, i = '') => results.push({ n, pass: !!c, i });

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const errs = [];
  const kid = async (name, link) => {
    const c = await b.newContext({ viewport: { width: 420, height: 820 } }); const p = await c.newPage();
    p.on('pageerror', (e) => errs.push(name + ': ' + e.message));
    await p.goto(link || URL); await p.waitForTimeout(5500);
    await p.click('#wGuest'); await p.fill('#gN', name); if (!link) await p.click('#gG [data-g="3"]');
    await p.click('#gGo'); await p.waitForTimeout(1500); await p.click('[data-close]').catch(() => {});
    return p;
  };
  // răspunde corect la exercițiul curent din fugă (portalul tablei: a × b sau a : b)
  const solve = async (p, right) => {
    const raw = await p.textContent('#chQ'); if (!/=\s*\?/.test(raw)) return;
    const q = raw.replace('= ?', '').replace('×', '*').replace(':', '/');
    const ans = String(Function('return ' + q)());
    const btns = p.locator('#chO [data-k]'); const n = await btns.count();
    for (let k = 0; k < n; k++) { const t = (await btns.nth(k).textContent()).trim(); if ((t === ans) === right) { await btns.nth(k).dispatchEvent('pointerdown'); return; } }
  };
  const L = await kid('Luca');
  await L.click('#openMenu'); await L.click('#mC'); await L.click('#cGo'); await L.waitForTimeout(1200);
  const link = await L.inputValue('#lnk'); await L.click('[data-close]');
  const A = await kid('Ana', link), M = await kid('Mihai', link);
  await L.waitForTimeout(1000);

  // „Cheamă colegii la mine”
  await L.click('#roomBtn'); await L.click('#lSummon'); await L.waitForTimeout(1200);
  ok('Mihai primește chemarea lui Luca', (await M.textContent('#panelCard h2')).includes('Luca te cheamă'));
  await M.click('#smGo'); await M.waitForTimeout(800);
  const d = await Promise.all([L, M].map((p) => p.evaluate(() => ({ x: window.__dbg.P.x, z: window.__dbg.P.z }))));
  ok('Mihai ajunge lângă Luca', Math.hypot(d[0].x - d[1].x, d[0].z - d[1].z) < 4, JSON.stringify(d));
  await L.click('[data-close]').catch(() => {}); await A.click('[data-close]').catch(() => {});

  // Cursa: Luca cheamă din Portalul Tablei
  await L.evaluate(() => window.__portal('tabla')); await L.click('#ppRace'); await L.waitForTimeout(1000);
  ok('Ana primește invitația la cursă', (await A.textContent('#panelCard h2')).includes('te cheamă la cursă'));
  await A.click('#rYes'); await M.click('#rNo'); await L.waitForTimeout(2000);
  ok('Cursa pornește pentru Luca', await L.locator('#chase').isVisible());
  ok('Cursa pornește pentru Ana', await A.locator('#chase').isVisible());
  ok('Mihai (a refuzat) nu e în cursă', await M.locator('#chase').isHidden());
  const standings = await L.textContent('#chRace');
  ok('Clasamentul cursei îi arată pe Luca și Ana', standings.includes('Luca') && standings.includes('Ana'), standings);
  // Luca răspunde corect la tot, Ana greșește tot
  // fiecare copil e pe dispozitivul lui; în test aduc fereastra în față când îi vine rândul
  await A.bringToFront(); for (let i = 0; i < 4; i++) { await solve(A, false); await A.waitForTimeout(1100); }
  await L.bringToFront();
  for (let i = 0; i < 40; i++) { if (!(await L.locator('#chase').isVisible())) break; await solve(L, true); await L.waitForTimeout(700); }
  await A.bringToFront(); await A.waitForSelector('#panelCard h2:has-text("Monstrul te-a prins")', { timeout: 90000 }).catch(() => {});
  await L.bringToFront(); await L.waitForSelector('#panelCard h2:has-text("Ai câștigat cursa")', { timeout: 60000 }).catch(() => {});
  await A.waitForTimeout(1500);
  ok('Luca câștigă cursa', (await L.textContent('#panelCard h2')).includes('Ai câștigat cursa'));
  const aTitle = await A.textContent('#panelCard h2');
  ok('Ana vede rezultatul (locul 2)', aTitle.includes('Locul 2'), aTitle);

  await b.close();
  console.log(results.map((r) => `${r.pass ? '✓' : '✗'} ${r.n}${r.pass ? '' : '  → ' + r.i}`).join('\n'));
  if (errs.length) console.log('Erori:', errs.slice(0, 5));
  console.log(`\n${results.filter((r) => r.pass).length} din ${results.length} teste trecute.`);
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0);
})();
