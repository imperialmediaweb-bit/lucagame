// Test „Clasa mea” și „Prieteni”: profiluri, cerere cu link, aprobare, clasament, prieteni, camera clasei fără aprobare.
// Rulare: PORT=4174 node server.js & apoi node tools/test-clasa.cjs
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:4174/';
const results = []; const ok = (n, c, i = '') => results.push({ n, pass: !!c, i });
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const errs = [], R = Math.floor(Math.random() * 9999);
  const kid = async (name, link) => {
    const c = await b.newContext({ viewport: { width: 420, height: 820 } }); const p = await c.newPage();
    p.on('pageerror', (e) => errs.push(name + ': ' + e.message));
    await p.goto(link || URL); await p.waitForTimeout(5500);
    await p.click('#wNew'); await p.fill('#rU', name + R); await p.fill('#rP', '1234'); await p.fill('#rP2', '1234'); await p.click('#rG [data-g="3"]'); await p.click('#rGo'); await p.waitForTimeout(1200);
    await p.click('#rOk'); await p.waitForTimeout(800);
    return p;
  };
  const closeAll = async (p) => { for (let i = 0; i < 3; i++) { if (await p.locator('#panel').isVisible()) await p.click('#panelCard [data-close] >> nth=-1').catch(() => {}); await p.waitForTimeout(150); } };
  const L = await kid('Luca'); await closeAll(L);
  const push = async (p) => { await p.evaluate(() => { document.getElementById('mute').click(); document.getElementById('mute').click(); }); await p.waitForTimeout(5000); };
  await L.evaluate(() => { window.__ui.S.xp = 500; window.__ui.S.missions = { 'g3-paranteze': { stars: 3 } }; }); await push(L);
  await L.click('[data-t="clasa"]'); await L.waitForTimeout(800);
  await L.fill('#scName', 'a III-a B'); await L.click('#scNew'); await L.waitForTimeout(1200);
  const code = (await L.textContent('#panelCard .eyebrow')).match(/[A-Z0-9]{6}/)[0];
  ok('Luca face clasa „a III-a B”', /a III-a B/.test(await L.textContent('#panelCard h2')), code);
  // Ana intră cu linkul clasei
  const A = await kid('Ana', URL + '?clasa=' + code);
  ok('Ana: cererea de intrare a plecat', /Ai cerut să intri/.test(await A.textContent('#panelCard')));
  await closeAll(A);
  // un străin cere și el
  const X = await kid('Strain', URL + '?clasa=' + code); await closeAll(X);
  await closeAll(L); await L.evaluate(() => document.getElementById('openHome').click()); await L.waitForTimeout(1200);
  ok('Luca vede pe Acasă că are cereri noi', /2 cereri noi/.test(await L.textContent('[data-t="clasa"]')), await L.textContent('[data-t="clasa"]'));
  await L.click('[data-t="clasa"]'); await L.waitForTimeout(900);
  await L.click('#panelCard [data-tab="cereri"]'); await L.waitForTimeout(900);
  await L.click(`#panelCard [data-yes="Ana${R}"]`); await L.waitForTimeout(1200);
  await L.click('#panelCard [data-tab="cereri"]').catch(() => {}); await L.waitForTimeout(800);
  await L.click(`#panelCard [data-no="Strain${R}"]`); await L.waitForTimeout(1200);
  await L.click('#panelCard [data-tab="colegi"]'); await L.waitForTimeout(900);
  const list = await L.textContent('#panelCard .sc-list');
  ok('Clasa are pe Luca și Ana, fără străin', list.includes('Ana' + R) && list.includes('Luca' + R) && !list.includes('Strain'), list);
  // clasamentul săptămânii: Ana lucrează mai mult
  await A.evaluate(async () => { window.__ui.S.xp = (window.__ui.S.xp || 0) + 800; window.__ui.S.missions = { 'g3-paranteze': { stars: 2 } }; });
  await closeAll(A); await push(A);
  await L.click('#panelCard [data-tab="top"]'); await L.waitForTimeout(1000);
  const top = await L.locator('#panelCard .sc-row b:not(.sc-pts)').first().textContent();
  ok('Clasamentul săptămânii o pune pe Ana prima', top.includes('Ana' + R), top);
  await L.click('#panelCard [data-tab="trofee"]'); await L.waitForTimeout(800);
  ok('Trofeele clasei adună stelele tuturor (3 + 2)', /5 ★/.test(await L.textContent('#panelCard')));
  // camera clasei: Luca o deschide, Ana intră fără aprobare, străinul are nevoie de aprobare
  await L.click('#scPlay'); await L.waitForTimeout(1800);
  await closeAll(A); await A.evaluate(() => document.getElementById('openHome').click()).catch(() => {}); await A.waitForTimeout(400);
  await A.click('[data-t="clasa"]'); await A.waitForTimeout(1200);
  ok('Ana vede camera clasei deschisă', /Intră în camera clasei/.test(await A.textContent('#scPlay')));
  await A.click('#scPlay'); await A.waitForTimeout(2000);
  ok('Ana a intrat direct, fără să bată la ușă', (await A.locator('#waitBox').count()) === 0 && /· 2/.test(await L.textContent('#roomBtn')), await L.textContent('#roomBtn'));
  const room = (await L.textContent('#roomBtn')).match(/[A-Z0-9]{4}/)[0];
  await X.evaluate((c) => import('/src/net.js').catch(() => null), room);
  // prieteni
  await closeAll(A); await A.evaluate(() => document.getElementById('openHome').click()).catch(() => {}); await A.waitForTimeout(300);
  await A.click('[data-t="prieteni"]'); await A.waitForTimeout(900);
  await A.fill('#frU', 'Luca' + R); await A.click('#frAdd'); await A.waitForTimeout(1200);
  await closeAll(L); await L.evaluate(() => document.getElementById('openHome').click()); await L.waitForTimeout(400);
  await L.click('[data-t="prieteni"]'); await L.waitForTimeout(1000);
  await L.click(`#panelCard [data-yes="Ana${R}"]`); await L.waitForTimeout(1200);
  ok('Luca și Ana sunt prieteni', (await L.textContent('#panelCard')).includes('Prieteni (1)'));
  await b.close();
  ok('Fără erori în pagini', errs.length === 0, errs.join(' | '));
  console.log(results.map((r) => `${r.pass ? '✓' : '✗'} ${r.n}${r.pass ? '' : '  → ' + r.i}`).join('\n'));
  console.log(`\n${results.filter((r) => r.pass).length} din ${results.length} teste trecute.`);
})();
