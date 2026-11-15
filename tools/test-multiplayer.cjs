// Test cu 3 copii: Luca face camera, Ana și Mihai intră cu linkul; se văd între ei; Duel; Test în clasă cu podium.
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
    await p.click('#wGuest'); await p.fill('#gN', name);
    if (!link) await p.click('#gG [data-g="3"]');
    await p.click('#gGo'); await p.waitForTimeout(1500);
    return p;
  };
  const L = await kid('Luca');
  await L.click('[data-close]').catch(() => {});
  await L.click('[data-t="colegi"]'); await L.click('#cGo'); await L.waitForTimeout(1200);
  const link = await L.inputValue('#lnk');
  ok('Camera are link de invitație', /\?camera=[A-Z0-9]{4}$/.test(link), link);
  const admit = async (yes) => { await L.waitForSelector('.knock', { timeout: 8000 }); await L.click(`.knock [data-ok="${yes ? 1 : 0}"] >> nth=0`); await L.waitForTimeout(1200); };
  const A = await kid('Ana', link);
  ok('Ana așteaptă la ușă până o primește Luca', await A.locator('#waitBox').isVisible());
  await admit(true);
  ok('După aprobare, Ana e în cameră', await A.locator('#waitBox').count() === 0);
  const X = await kid('Strain', link);
  await admit(false);
  ok('Străinul refuzat nu intră', (await L.textContent('#roomBtn')).includes('· 2') && await X.locator('#waitBox').count() === 0);
  const M = await kid('Mihai', link); await admit(true);
  await L.waitForTimeout(1500);
  const n = await L.textContent('#roomBtn');
  ok('Luca vede 3 jucători în cameră', n.includes('· 3'), n);
  await L.click('#roomBtn').catch(() => {}); await L.waitForTimeout(500);
  await L.click('#panelCard [data-pl] >> nth=1').catch(() => {}); await L.waitForTimeout(300);
  const card = await L.textContent('#plInfo').catch(() => '');
  ok('Luca vede nivelul colegului (fișa)', /nivel/.test(card) && /capitole/.test(card), card);
  const others = await A.evaluate(() => document.querySelectorAll('#panelCard .tab').length);
  ok('Ana vede lista de jucători', others >= 3);
  for (const p of [A, M]) await p.click('[data-close]').catch(() => {});
  await L.click('[data-close]').catch(() => {}); await L.click('#roomBtn');

  // Test în clasă: toți răspund; Luca termină primul, Ana a doua, Mihai al treilea
  await L.click('[data-cls="mate|test"]'); await L.waitForTimeout(1200);
  for (const p of [L, A, M]) await p.click('#cGo');
  for (const [p, d] of [[L, 100], [A, 250], [M, 400]]) { for (let i = 0; i < 7; i++) { await p.click('#quizCard [data-k] >> nth=0'); await p.waitForTimeout(d); } }
  await L.waitForTimeout(2000);
  const rows = await L.locator('#quizCard .jrow').count();
  ok('La final apar toți 3 în clasament', rows === 3, `rânduri: ${rows}`);
  const title = await L.textContent('#quizCard h2');
  ok('Rezultatul are loc și podium', /Locul|Campion/.test(title), title);

  await b.close();
  console.log(results.map((r) => `${r.pass ? '✓' : '✗'} ${r.n}${r.pass ? '' : '  → ' + r.i}`).join('\n'));
  if (errs.length) console.log('Erori:', errs.slice(0, 5));
  console.log(`\n${results.filter((r) => r.pass).length} din ${results.length} teste trecute.`);
  process.exit(results.some((r) => !r.pass) || errs.length ? 1 : 0);
})();
