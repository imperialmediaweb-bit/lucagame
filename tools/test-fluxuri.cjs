// Teste de logică pentru tot jocul: misiuni și stele, testul cu notă, antrenamentul pe clasă, blocarea claselor,
// deschiderea clasei următoare, fuga de monștri (pierdere), profil (creare, PIN greșit, intrare).
// Rulare: PORT=4174 node server.js & apoi node tools/test-fluxuri.cjs
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://localhost:4174/';
const results = []; const ok = (name, cond, info = '') => results.push({ name, pass: !!cond, info });

async function newGame(b, grade = 3) {
  const p = await b.newPage({ viewport: { width: 420, height: 820 } });
  p.errs = []; p.on('pageerror', (e) => p.errs.push(e.message));
  await p.goto(URL); await p.waitForTimeout(5500);
  await p.click('#wGuest'); await p.fill('#gN', 'Test'); await p.click(`#gG [data-g="${grade}"]`); await p.click('#gGo'); await p.waitForTimeout(300);
  await p.click('[data-close]').catch(() => {});
  return p;
}
// răspunde la întrebarea curentă: corect sau greșit, citind răspunsul din joc
async function answerCurrent(p, correct) {
  const k = await p.evaluate((correct) => {
    const Q = window.__ui.Q(); const q = Q.qs[Q.i];
    if (q.kind === 'tap') return correct ? q.ans : q.toks.findIndex((t, i) => /^[+−×:]$/.test(t) && i !== q.ans);
    const i = q.opts.findIndex((o) => o === q.ans); return correct ? i : (i + 1) % q.opts.length;
  }, correct);
  await p.click(`#quizCard [data-k="${k}"]`); await p.click('#next');
}

(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });

  // 1. Misiune de clasa a III-a: 5/5 → 3 stele, 4/5 → 2, 3/5 → 1, 2/5 → 0
  {
    const p = await newGame(b, 3);
    for (const [good, stars] of [[2, 0], [3, 1], [4, 2], [5, 3]]) {
      await p.evaluate(() => { window.__ui.S.missions = {}; window.__ui.S.seen.ordine = true; });
      await p.evaluate(() => window.__ui.startMission('g3-paranteze'));
      for (let i = 0; i < 5; i++) await answerCurrent(p, i < good);
      const st = await p.evaluate(() => (window.__ui.S.missions['g3-paranteze'] || {}).stars || 0);
      ok(`Misiune ${good}/5 corecte → ${stars} stele`, st === stars, `are ${st}`);
      await p.click('#back');
    }
    // 2. Testul cu notă: toate corecte → 10, toate greșite → 1
    for (const [correct, nota] of [[true, 10], [false, 1]]) {
      await p.evaluate(() => window.__ui.startMission('test-mate'));
      for (let i = 0; i < 7; i++) await answerCurrent(p, correct);
      const txt = await p.textContent('#quizCard .grade');
      ok(`Testul ${correct ? 'perfect' : 'greșit tot'} → nota ${nota}`, txt.trim() === String(nota), `afișează ${txt}`);
      await p.click('#back');
    }
    // 3. Antrenamentul are doar exerciții de clasa a III-a (sau recapitulări de clasa a III-a)
    const mis = await p.evaluate(async () => { const { MISSIONS } = await import('/src/content/missions.js').catch(() => ({})); return null; });
    await p.evaluate(() => window.__ui.openDaily());
    const areas = await p.evaluate(() => [...new Set(window.__ui.Q().qs.map((q) => q.area))]);
    ok('Antrenamentul are doar clasa a III-a', areas.every((a) => a === '3'), `zone: ${areas.join(',')}`);
    await p.click('#tQuit');
    // 4. Misiunile claselor mai mici sunt blocate
    await p.evaluate(() => window.__ui.startMission('g1-adun'));
    ok('Misiune de clasa I refuzată pentru clasa a III-a', await p.locator('#quiz').isHidden());
    await p.evaluate(() => window.__ui.startMission('g4-numere'));
    ok('Misiune de clasa a IV-a refuzată înainte de deblocare', await p.locator('#quiz').isHidden());
    // 5. Deschiderea clasei a IV-a după toate misiunile clasei a III-a + testul
    await p.evaluate(() => { const S = window.__ui.S; window.__ui.MISSIONS.filter((m) => m.area === '3' && m.types && !m.subject).forEach((m) => (S.missions[m.id] = { stars: 1 })); S.missions['test-mate'] = { stars: 0 }; });
    await p.evaluate(() => window.__ui.startMission('test-mate'));
    for (let i = 0; i < 7; i++) await answerCurrent(p, true);
    const unl = await p.evaluate(() => !!(window.__ui.S.unlocked || {})[4]);
    ok('Clasa a IV-a se deschide după ce termini clasa a III-a', unl);
    await p.click('#back');
    await p.evaluate(() => window.__ui.startMission('g4-numere'));
    ok('După deblocare, misiunea de clasa a IV-a pornește', await p.locator('#quiz').isVisible());
    if (await p.locator('#quiz').isVisible()) await p.click('#tQuit');
    // 6. Fuga de monștri: fără răspunsuri, monstrul te prinde de 3 ori → misiune pierdută
    await p.evaluate(() => window.__portal('tabla')); await p.click('#ppGo');
    await p.waitForSelector('#panelCard h2:has-text("Misiune pierdută")', { timeout: 120000 }).catch(() => {});
    ok('Monstrul: fără răspunsuri → „Misiune pierdută”', (await p.textContent('#panelCard h2')).includes('Misiune pierdută'));
    // Profesorii pe materii: lista de lecții și o lecție de științe
    await p.evaluate(() => window.__ui.openHub('stiinte'));
    ok('Profesorul de științe arată 7 lecții', (await p.locator('#panelCard [data-play]').count()) === 7);
    await p.click('#panelCard [data-play] >> nth=1');
    ok('Lecția de științe pornește', await p.locator('#quiz').isVisible());
    for (let i = 0; i < 5; i++) await answerCurrent(p, true);
    ok('Lecția de științe dă 3 stele la 5/5', await p.evaluate(() => (window.__ui.S.missions['s3-animale'] || {}).stars === 3));
    await p.click('#back');
    // Compunerea: textul bun primește 3 stele, cel cu greșeli mai puține
    await p.evaluate(() => window.__ui.openWrite());
    await p.fill('#wTxt', 'O zi la munte\nSâmbătă am plecat cu părinții la munte. Era o zi senină și caldă.\nAm urcat pe o potecă printre brazi. Am văzut o veveriță care s-a ascuns repede. Tata mi-a arătat urmele unui urs.\nSeara ne-am întors acasă obosiți, dar fericiți. A fost o zi minunată pe care nu o voi uita niciodată.');
    await p.click('#wCheck');
    ok('Compunere bună → 3 stele', (await p.textContent('#wRes')).includes('★★★'), await p.textContent('#wRes'));
    await p.fill('#wTxt', 'excursia\nam mers la munte si sa dus si tata\nne-am jucat');
    await p.click('#wCheck');
    const r = await p.textContent('#wRes');
    ok('Compunere slabă → indică greșelile (literă mică, s-a, alineate)', r.includes('s-a dus') && r.includes('literă mică') && !r.includes('★★★'), r);
    await p.click('[data-close]');
    // Fișa de lucru: 10 exerciții + pagina cu răspunsuri
    await p.evaluate(() => window.__ui.openFise()); await p.selectOption('#fN', '10'); await p.click('#fGo');
    ok('Fișa are 10 exerciții și 10 răspunsuri', (await p.locator('#fisa .fp:not(.fk) ol > li').count()) === 10 && (await p.locator('#fisa .fk ol > li').count()) === 10);
    await p.click('#fClose');
    // Unde am ajuns: doar 2 capitole → antrenamentul are doar tipurile lor
    await p.evaluate(() => window.__ui.openChapters()); await p.click('#cNone');
    await p.check('[data-c="g3-veverite"]'); await p.check('[data-c="g3-romane"]'); await p.click('#cSave');
    await p.evaluate(() => window.__ui.openDaily());
    const types = await p.evaluate(() => [...new Set(window.__ui.Q().qs.map((q) => q.type))]);
    ok('Antrenamentul respectă „unde am ajuns”', types.every((t) => ['veverite', 'abc', 'romane'].includes(t) || window.__nope), types.join(','));
    await p.click('#tQuit');
    ok('Fără erori în pagină (clasa a III-a)', p.errs.length === 0, p.errs.join(' | '));
    await p.close();
  }

  // 7. Copil de pregătitoare: doar lumea lui, exerciții potrivite
  {
    const p = await newGame(b, 0);
    await p.evaluate(() => window.__ui.startMission('g3-paranteze'));
    ok('Pregătitoare: misiune de clasa a III-a refuzată', await p.locator('#quiz').isHidden());
    await p.evaluate(() => window.__ui.startMission('g0-adun'));
    ok('Pregătitoare: misiunea ei pornește', await p.locator('#quiz').isVisible());
    const nums = await p.evaluate(() => window.__ui.Q().qs.map((q) => q.ans));
    ok('Pregătitoare: adunările dau cel mult 10', nums.every((n) => n <= 10), nums.join(','));
    ok('Fără erori în pagină (pregătitoare)', p.errs.length === 0, p.errs.join(' | '));
    await p.close();
  }

  // 8. Profil: creare, PIN greșit respins, intrare corectă
  {
    const p = await b.newPage({ viewport: { width: 420, height: 820 } });
    await p.goto(URL); await p.waitForTimeout(5500);
    const u = 'Tst' + Math.floor(Math.random() * 99999);
    await p.click('#wNew'); await p.fill('#rU', u); await p.fill('#rP', '1234'); await p.fill('#rP2', '1234'); await p.click('#rG [data-g="3"]'); await p.click('#rGo'); await p.waitForTimeout(1200);
    ok('Profil nou creat', await p.locator('#rOk').count() === 1);
    await p.evaluate(() => localStorage.removeItem('luca-token')); await p.reload(); await p.waitForTimeout(5500);
    await p.click('#wLogin'); await p.fill('#lU', u); await p.fill('#lP', '9999'); await p.click('#lGo'); await p.waitForTimeout(800);
    ok('PIN greșit respins', (await p.textContent('#lErr')).includes('greșit'));
    await p.fill('#lP', '1234'); await p.click('#lGo'); await p.waitForTimeout(1200);
    ok('PIN corect: intră în joc', (await p.textContent('#panelCard')).includes('Bun venit în Mintoria'));
    await p.close();
  }

  await b.close();
  const bad = results.filter((r) => !r.pass);
  console.log(results.map((r) => `${r.pass ? '✓' : '✗'} ${r.name}${r.pass ? '' : '  → ' + r.info}`).join('\n'));
  console.log(`\n${results.length - bad.length} din ${results.length} teste trecute.`);
  process.exit(bad.length ? 1 : 0);
})();
