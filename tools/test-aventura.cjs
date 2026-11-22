// Zona Aventurii (Laboratorul Naturii): lacul nu se trece fără pod, podul apare la răspuns bun,
// comorile (insulă, casă, turn) dau monede o singură dată, misiunea iepurașului, platformele se mișcă.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage(); const errs = []; let ok = 0, bad = 0;
  p.on('pageerror', (e) => errs.push(e.message));
  const check = (c, m) => { if (c) { ok++; console.log('✓ ' + m); } else { bad++; console.log('✗ ' + m); } };
  await p.goto('http://localhost:4174/'); await p.waitForTimeout(1200);
  await p.click('#wGuest'); await p.fill('#gN', 'Luca'); await p.click('#gG [data-g="3"]'); await p.click('#gGo'); await p.waitForTimeout(600);
  await p.click('[data-close]'); await p.waitForTimeout(300);
  await p.evaluate(() => { window.__ui.S.seen = new Proxy({}, { get: () => true }); ['home', 'nmap'].forEach((i) => { const e = document.getElementById(i); if (e) e.hidden = true; }); window.__wenter('stiinte'); });
  await p.waitForTimeout(800);
  const O = [600, 600], F = await p.evaluate(() => window.__fun.stiinte);
  const tp = (x, z, y = 0.6) => p.evaluate(([x, z, y]) => window.__dbg.teleport(x, z, y), [O[0] + x, O[1] + z, y]);
  const away = async () => { await tp(F.N[0], F.N[1] + 8); await p.waitForTimeout(400); };
  const coins = () => p.evaluate(() => window.__ui.S.coins);
  const fun = () => p.evaluate(() => window.__ui.S.worlds.stiinte.fun);
  const quizUp = () => p.waitForSelector('#quiz:not([hidden])', { timeout: 5000 }).then(() => true, () => false);
  const answer = async () => {
    if (!(await quizUp())) return false;
    const k = await p.evaluate(() => { const Q = window.__ui.Q(), q = Q.qs[Q.i]; return q.kind === 'tap' ? q.ans : q.opts.findIndex((o) => o === q.ans); });
    await p.click(`#quizCard [data-k="${k}"]`); await p.click('#next'); await p.waitForTimeout(400); return true;
  };
  const closePanel = async () => { if (await p.locator('#panel').isVisible()) { await p.click('#panel [data-close]').catch(() => {}); await p.waitForTimeout(200); } };
  const [LX, LZ] = F.L;
  // 1. în apă fără pod: te scoate afară
  await tp(LX, LZ - 6.5); await p.waitForTimeout(700);
  let d = await p.evaluate(([x, z]) => Math.hypot(window.__dbg.P.x - x, window.__dbg.P.z - z), [O[0] + LX, O[1] + LZ]);
  check(d > 9.5, `apa adâncă te scoate pe mal (distanța ${d.toFixed(1)})`);
  // 2. podul apare la răspuns bun
  await away(); await tp(LX, LZ - 10.7); check(await answer(), 'la semnul podului apare o întrebare');
  check((await fun()).bridge === 1, 'podul s-a construit');
  await away(); await tp(LX, LZ - 6.5); await p.waitForTimeout(700);
  d = await p.evaluate(([x, z]) => Math.hypot(window.__dbg.P.x - x, window.__dbg.P.z - z), [O[0] + LX, O[1] + LZ]);
  check(d < 8, 'pe pod poți sta deasupra apei');
  // 3. comoara insulei
  let c0 = await coins(); await tp(LX, LZ); await p.waitForTimeout(800); await closePanel();
  check((await coins()) - c0 === 30, 'comoara insulei: +30 monede');
  // 4. ușa cu cifru și comoara casei
  const [HX, HZ] = F.H;
  await away(); await tp(HX, HZ + 5.2); check(await answer(), 'la ușa cu cifru apare o întrebare');
  check((await fun()).door === 1, 'ușa s-a deschis'); await p.waitForTimeout(1800);
  c0 = await coins(); await away(); await tp(HX, HZ - 1.2); await p.waitForTimeout(800); await closePanel();
  check((await coins()) - c0 === 50, 'comoara casei: +50 monede');
  // 5. comoara din turn
  const [TX, TZ] = F.T;
  c0 = await coins(); await away(); await tp(TX, TZ, 9.6); await p.waitForTimeout(1200); await closePanel();
  check((await coins()) - c0 === 40, 'comoara din turn: +40 monede');
  c0 = await coins(); await away(); await tp(TX, TZ, 9.6); await p.waitForTimeout(1000); await closePanel();
  check((await coins()) === c0, 'a doua oară comoara nu mai dă monede');
  // 6. platformele se mișcă
  const m1 = await p.evaluate(() => window.__dbg.scene.meshes.filter((m) => m.col && m.col.y2 > 1 && m.col.y2 < 9 && Math.abs(m.position.x - 600) < 120).map((m) => m.position.y + m.position.x + m.position.z).join());
  await p.waitForTimeout(1200);
  const m2 = await p.evaluate(() => window.__dbg.scene.meshes.filter((m) => m.col && m.col.y2 > 1 && m.col.y2 < 9 && Math.abs(m.position.x - 600) < 120).map((m) => m.position.y + m.position.x + m.position.z).join());
  check(m1 !== m2, 'platformele turnului se mișcă');
  // 7. misiunea iepurașului
  await away(); await tp(F.N[0], F.N[1] - 2); await p.waitForTimeout(700);
  check(await p.locator('#panel').isVisible(), 'iepurașul îți spune misiunea'); await closePanel();
  for (const [x, z] of F.items) { await tp(x, z); await p.waitForTimeout(500); await tp(x, z + 6); await p.waitForTimeout(150); }
  check((await fun()).got.length === F.items.length, `ai găsit toți morcovii (${(await fun()).got.length} din ${F.items.length})`);
  c0 = await coins(); await away(); await tp(F.N[0], F.N[1] - 2); await p.waitForTimeout(800); await closePanel();
  check((await coins()) - c0 === 40 && (await fun()).questDone === 1, 'misiunea terminată: +40 monede');
  check(errs.length === 0, 'fără erori în pagină ' + errs.join(' | '));
  console.log(`\n${ok} din ${ok + bad} teste trecute.`); await b.close(); process.exit(bad ? 1 : 0);
})();
