// Verifică automat toate exercițiile: refac calculul independent și caut răspunsuri greșite,
// numere negative, variante lipsă sau duplicate, fracții nepotrivite. Rulare: node tools/verifica-exercitii.mjs
import { GEN, MISSIONS } from '../src/content/missions.js';
import { SPEED, SPEED_IDS } from '../src/content/speed.js';
import { ATELIER } from '../src/content/guided.js';

const N = 3000, problems = [];
const clean = (s) => String(s).replace(/\./g, '').replace(/×/g, '*').replace(/:/g, '/').replace(/−/g, '-').replace(/\[/g, '(').replace(/\]/g, ')').replace(/=\s*\??\s*$/, '').trim();
const evaluable = (e) => /^[\d\s+\-*/()]+$/.test(e);
const evalExpr = (e) => Function(`"use strict";return (${e});`)();
const add = (src, msg, q) => { if (problems.filter((p) => p.src === src).length < 3) problems.push({ src, msg, q: JSON.stringify(q).slice(0, 220) }); };

function checkQ(src, q) {
  if (q.kind === 'tap') return;
  if (!q.opts || q.opts.length < 2) add(src, 'prea puține variante', q);
  if (!q.opts.includes(q.ans)) add(src, 'răspunsul corect lipsește din variante', q);
  if (new Set(q.opts.map(String)).size !== q.opts.length) add(src, 'variante duplicate', q);
  for (const o of q.opts) if (typeof o === 'number' && (o < 0 || !Number.isFinite(o) || !Number.isInteger(o))) add(src, 'variantă negativă sau cu virgulă', q);
  if (typeof q.ans === 'number' && (q.ans < 0 || !Number.isInteger(q.ans))) add(src, 'răspuns negativ sau cu virgulă', q);
  const e = q.expr ? clean(q.expr) : '';
  if (e && evaluable(e) && typeof q.ans === 'number') {
    const v = evalExpr(e);
    if (v !== q.ans) add(src, `calcul greșit: ${q.expr} dă ${v}, jocul zice ${q.ans}`, q);
    // pași intermediari negativi sau împărțiri care nu se fac exact
    const divs = e.match(/\d+\s*\/\s*\d+/g) || [];
    for (const d of divs) { const [a, b] = d.split('/').map(Number); if (a % b) add(src, `împărțire care nu se face exact: ${d}`, q); }
  }
  // numerele din text trebuie să fie întregi și pozitive
  for (const m of String(q.text + ' ' + (q.expr || '')).matchAll(/-\d/g)) add(src, 'număr negativ în enunț', q);
}

for (const t in GEN) for (let i = 0; i < N; i++) checkQ('GEN.' + t, GEN[t]());
for (const id of SPEED_IDS) for (let i = 0; i < N; i++) { const q = SPEED[id].gen(); checkQ('SPEED.' + id, { ...q, text: '' }); }
for (const a of ATELIER) for (let i = 0; i < 800; i++) { const p = a.make(); for (const s of p.steps) { checkQ('ATELIER.' + a.type, { text: s.ask, opts: s.opts, ans: s.ans }); const m = s.ask.match(/^(.*?)=\s*\?\s*$/); if (m && typeof s.ans === 'number') { const e = clean(m[1].replace(/^[^\d(]*/, '')); if (evaluable(e) && evalExpr(e) !== s.ans) add('ATELIER.' + a.type, `pas greșit: ${s.ask} → ${s.ans}`, s); } } }
for (const m of MISSIONS) for (const t of m.types || []) if (!GEN[t]) add('MISIUNE ' + m.id, 'tip lipsă ' + t, {});

console.log(problems.length ? problems.map((p) => `✗ ${p.src}: ${p.msg}\n   ${p.q}`).join('\n') : '✓ Toate exercițiile sunt corecte.');
console.log(`\nVerificate: ${Object.keys(GEN).length} tipuri × ${N}, ${SPEED_IDS.length} portaluri × ${N}, ${ATELIER.length} probleme de atelier × 800.`);
process.exit(problems.length ? 1 : 0);
