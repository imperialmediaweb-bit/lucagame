// Restul programei de clasa a III-a (OMEN 5003/2014), ca să fie acoperită toată materia:
// ordonare, pare/impare, proprietăți, înmulțiri mari, „de atâtea ori”, fracții, figuri, ceas, calendar, tabele;
// română: ortograme complete, punctuație, alfabet, silabe grele.
import { rnd, pick, shuffle, opts, textOpts } from './util.js';

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const G3C = {
  // înmulțirea scrisă unul sub altul, cu o cifră: pas cu pas, cu „ține minte”
  inmCol1() {
    let a, b;
    do { a = rnd(23, 489); b = rnd(3, 9); } while (a * b > 9999 || (a % 10) * b < 10);
    const r = a * b, ds = String(a).split('').reverse().map(Number), steps = [];
    let c = 0, noCarry = '';
    ds.forEach((d, i) => {
      const p = d * b + c, last = i === ds.length - 1;
      steps.push(`${d} × ${b} = ${d * b}${c ? ` și cu ${c} ținut minte = ${p}` : ''}: ${last ? `scrii ${p}` : `scrii ${p % 10}, ții minte ${Math.floor(p / 10)}`}.`);
      noCarry = (last ? String(d * b) : String((d * b) % 10)) + noCarry; c = Math.floor(p / 10);
    });
    const nc = +noCarry;
    return { text: 'Calculează unul sub altul (în coloană):', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [nc !== r ? nc : r + 10, r + b, r - 10 * b]),
      steps: ['Scrii numerele unul sub altul: unitățile sub unități. Înmulțești de la dreapta.', ...steps, `Rezultat: ${r}.`],
      why: { [nc]: 'Ai uitat să adaugi ce ai ținut minte la coloana următoare.', [r + b]: 'Ai adunat o dată în plus numărul de jos. Refă înmulțirea pe fiecare coloană.', [r - 10 * b]: 'Ai greșit la zeci: verifică ce ai ținut minte de la unități.' } };
  },
  // înmulțirea cu un număr de două cifre: două rânduri și le aduni
  inmCol2() {
    let a, b;
    do { a = rnd(12, 98); b = rnd(12, 49); } while (b % 10 === 0 || b % 11 === 0);
    const r = a * b, u = b % 10, z = Math.floor(b / 10), p1 = a * u, p2 = a * z, bad = p1 + p2;
    return { text: 'Calculează unul sub altul (în coloană):', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [bad, r + a, r - 10 * a]),
      steps: [`Rândul 1: ${a} × ${u} (unitățile) = ${p1}.`, `Rândul 2: ${a} × ${z} (zecile) = ${p2}. Îl scrii mutat cu un loc spre stânga, adică ${p2 * 10}.`, `Aduni rândurile: ${p1} + ${p2 * 10} = ${r}.`],
      why: { [bad]: `Al doilea rând (${p2}) trebuia mutat cu un loc spre stânga, pentru că ${z} înseamnă ${z} zeci: ${p2 * 10}, nu ${p2}.`, [r + a]: `Ai înmulțit cu ${b + 1} în loc de ${b}. Verifică rândul cu unitățile.`, [r - 10 * a]: `Ai înmulțit cu ${b - 10} în loc de ${b}. Verifică rândul cu zecile.` } };
  },
  ordonare() {
    if (Math.random() < 0.5) {
      const ns = []; while (ns.length < 4) { const n = rnd(1000, 9999); if (!ns.includes(n)) ns.push(n); }
      const asc = Math.random() < 0.5, sorted = [...ns].sort((a, b) => (asc ? a - b : b - a)), ans = sorted.map(fmt).join(', ');
      const wrong = [[...ns].sort((a, b) => (asc ? b - a : a - b)).map(fmt).join(', '), shuffle([...ns]).map(fmt).join(', '), [sorted[1], sorted[0], sorted[2], sorted[3]].map(fmt).join(', ')];
      const uw = [...new Set(wrong)].filter((w) => w !== ans); while (uw.length < 3) { const x = shuffle([...ns]).map(fmt).join(', '); if (x !== ans && !uw.includes(x)) uw.push(x); }
      return { text: `Ordonează ${asc ? 'crescător (de la cel mai mic)' : 'descrescător (de la cel mai mare)'}:`, expr: ns.map(fmt).join(', '), ans, opts: textOpts(ans, uw), steps: ['Compari întâi miile, apoi sutele, zecile și unitățile.', ans] };
    }
    const n = rnd(100, 9999), par = n % 2 === 0;
    return { text: 'Numărul este par sau impar?', expr: fmt(n), ans: par ? 'par' : 'impar', opts: ['par', 'impar'], steps: [`Te uiți doar la ultima cifră: ${n % 10}.`, 'Dacă e 0, 2, 4, 6 sau 8, numărul e par; altfel e impar.'] };
  },
  proprietati() {
    const a = rnd(12, 99), b = rnd(12, 99), c = rnd(12, 99), t = rnd(0, 2);
    if (t === 0) return { text: 'Completează (ordinea termenilor nu contează la adunare):', expr: `${a} + ${b} = ${b} + ___`, ans: a, opts: opts(a, [b, a + b, a + 1]), steps: ['La adunare, dacă schimbi locul termenilor, suma rămâne aceeași.', `${a} + ${b} = ${b} + ${a}`] };
    if (t === 1) { const r = a + b + c; return { text: 'Grupează convenabil și calculează:', expr: `${a} + ${b} + ${100 - b}`, ans: a + 100, opts: opts(a + 100, [a + b, 100, a + 100 + b]), steps: [`Grupează întâi ${b} + ${100 - b} = 100 (merge ușor!)`, `${a} + 100 = ${a + 100}`], hints: ['Caută două numere care fac împreună 100.'] }; }
    const x = rnd(3, 9), y = rnd(2, 9); return { text: 'Completează (ordinea factorilor nu contează la înmulțire):', expr: `${x} × ${y} = ${y} × ___`, ans: x, opts: opts(x, [y, x * y, x + 1]), steps: ['La înmulțire, dacă schimbi locul factorilor, produsul rămâne același.'] };
  },
  inm3() {
    const b = rnd(2, 9), a = rnd(102, Math.min(999, Math.floor(9999 / b))), r = a * b, s = Math.floor(a / 100) * 100, z = Math.floor((a % 100) / 10) * 10, u = a % 10;
    return { text: 'Calculează:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [s * b + z + u, r + b, r - 10 * b]), steps: [`Desfaci ${a} = ${s} + ${z} + ${u}`, `${s} × ${b} = ${s * b}, ${z} × ${b} = ${z * b}, ${u} × ${b} = ${u * b}`, `${s * b} + ${z * b} + ${u * b} = ${r}`] };
  },
  deOri() {
    const n1 = pick(['Ana', 'Matei', 'Ioana', 'Radu']), n2 = pick(['Mihai', 'Elena', 'Vlad', 'Sara']), obj = pick(['mere', 'cărți', 'bile', 'timbre']), k = rnd(2, 6);
    if (Math.random() < 0.5) { const a = rnd(3, 12), r = a * k; return { text: `${n1} are ${a} ${obj}. ${n2} are de ${k} ori mai multe. Câte ${obj} are ${n2}?`, ans: r, opts: opts(r, [a + k, r + a, a]), steps: ['„de … ori mai multe” înseamnă înmulțire.', `${a} × ${k} = ${r}`], hints: ['Nu confunda cu „cu … mai multe” (care e adunare).'] }; }
    const q = rnd(2, 10), a = q * k; return { text: `${n1} are ${a} ${obj}. ${n2} are de ${k} ori mai puține. Câte ${obj} are ${n2}?`, ans: q, opts: opts(q, [a - k, a * k, q + 1]), steps: ['„de … ori mai puține” înseamnă împărțire.', `${a} : ${k} = ${q}`], hints: ['Nu confunda cu „cu … mai puține” (care e scădere).'] };
  },
  fractii3() {
    const d = pick([3, 4, 5, 6, 8, 10]), a = rnd(1, d - 1); let b = rnd(1, d - 1); while (b === a) b = rnd(1, d - 1);
    if (Math.random() < 0.5) { const ans = a > b ? `${a}/${d}` : `${b}/${d}`; return { text: 'Care fracție este mai mare?', expr: `${a}/${d}   sau   ${b}/${d}`, ans, opts: textOpts(ans, [a > b ? `${b}/${d}` : `${a}/${d}`]), steps: ['Feliile sunt la fel de mari (același numitor). Mai mare e fracția cu mai multe felii.'] }; }
    const k = rnd(1, d - 1), ans = `${k}/${d}`;
    return { text: `Un întreg e împărțit în ${d} părți egale. Colorăm ${k}. Ce fracție e colorată?`, expr: '▮'.repeat(k) + '▯'.repeat(d - k), ans, opts: textOpts(ans, [`${d}/${k}`, `${d - k}/${d}`, `${k}/${d + 1}`]), steps: ['Jos: în câte părți e împărțit (numitorul). Sus: câte sunt colorate (numărătorul).', ans] };
  },
  figuri3() {
    const F = [['Câte laturi are un triunghi?', 3], ['Câte colțuri (vârfuri) are un pătrat?', 4], ['Câte laturi are un dreptunghi?', 4], ['Câte unghiuri drepte are un dreptunghi?', 4], ['Câte laturi are cercul?', 0], ['Câte fețe are un cub?', 6]];
    const [q, a] = pick(F);
    return { text: q, ans: a, opts: opts(a, [a + 1, a + 2, a > 0 ? a - 1 : 4]), steps: [{ 3: 'Triunghiul: 3 laturi și 3 vârfuri.', 4: 'Pătratul și dreptunghiul au 4 laturi, 4 vârfuri și 4 unghiuri drepte.', 0: 'Cercul e o linie curbă închisă, fără laturi și fără colțuri.', 6: 'Cubul are 6 fețe pătrate.' }[a]] };
  },
  ceas() {
    const h = rnd(1, 12), m = pick([0, 15, 30, 45]);
    const words = m === 0 ? `ora ${h} fix` : m === 15 ? `ora ${h} și un sfert` : m === 30 ? `ora ${h} și jumătate` : `ora ${h % 12 + 1} fără un sfert`;
    const ans = `${h}:${String(m).padStart(2, '0')}`;
    const wrong = [...new Set([`${h}:${String((m + 15) % 60).padStart(2, '0')}`, `${h % 12 + 1}:${String(m).padStart(2, '0')}`, `${h}:${m === 30 ? '03' : '30'}`, `${h}:${String((m + 45) % 60).padStart(2, '0')}`])].filter((w) => w !== ans).slice(0, 3);
    return { text: 'Cum scrii ora cu cifre?', expr: words, ans, opts: textOpts(ans, wrong), steps: ['Un sfert de oră = 15 minute, jumătate de oră = 30 de minute.', '„fără un sfert” = mai sunt 15 minute până la ora următoare (minutul 45).', ans] };
  },
  calendar() {
    const Q = [['Câte zile are o săptămână?', 7, [5, 10, 12]], ['Câte luni are un an?', 12, [10, 7, 52]], ['Câte zile are luna februarie într-un an obișnuit?', 28, [30, 31, 29]], ['Câte zile are luna ianuarie?', 31, [30, 28, 29]], ['Câte zile are luna aprilie?', 30, [31, 28, 29]], ['Câte anotimpuri are un an?', 4, [3, 12, 6]]];
    if (Math.random() < 0.4) { const Z = ['luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă', 'duminică'], i = rnd(0, 6), k = rnd(1, 3), ans = Z[(i + k) % 7];
      const wr = [...new Set([Z[(i + k + 1) % 7], Z[(i + k + 6) % 7], Z[i], Z[(i + k + 2) % 7]])].filter((z) => z !== ans).slice(0, 3);
      return { text: `Azi e ${Z[i]}. Ce zi va fi peste ${k} ${k === 1 ? 'zi' : 'zile'}?`, ans, opts: textOpts(ans, wr), steps: [`Numeri înainte: ${Array.from({ length: k + 1 }, (_, j) => Z[(i + j) % 7]).join(' → ')}`] }; }
    const [q, a, w] = pick(Q); return { text: q, ans: a, opts: opts(a, w), steps: [`Răspuns: ${a}`] };
  },
  tabel() {
    const kids = shuffle(['Ana', 'Matei', 'Ioana', 'Radu', 'Elena']).slice(0, 4), vals = kids.map(() => rnd(2, 15));
    const table = kids.map((k, i) => `${k}: ${vals[i]}`).join('  ·  ');
    const t = rnd(0, 2);
    if (t === 0) { const mx = Math.max(...vals), who = kids[vals.indexOf(mx)]; if (vals.filter((v) => v === mx).length > 1) return G3C.tabel();
      return { text: 'Tabelul arată câte cărți a citit fiecare copil. Cine a citit cele mai multe?', expr: table, ans: who, opts: textOpts(who, kids.filter((k) => k !== who)), steps: [`Cel mai mare număr din tabel: ${mx} → ${who}`] }; }
    if (t === 1) { const s = vals.reduce((a, b) => a + b, 0); return { text: 'Tabelul arată câte cărți a citit fiecare copil. Câte cărți au citit împreună?', expr: table, ans: s, opts: opts(s, [s - vals[0], s + 1, s + 10]), steps: [`Aduni toate numerele: ${vals.join(' + ')} = ${s}`] }; }
    const d = Math.abs(vals[0] - vals[1]); return { text: `Tabelul arată câte cărți a citit fiecare copil. Cu câte cărți a citit mai mult ${vals[0] >= vals[1] ? kids[0] : kids[1]} decât ${vals[0] >= vals[1] ? kids[1] : kids[0]}?`, expr: table, ans: d, opts: opts(d, [vals[0] + vals[1], d + 1, Math.max(vals[0], vals[1])]), steps: ['„cu câte mai mult” = diferența = scădere.', `${Math.max(vals[0], vals[1])} − ${Math.min(vals[0], vals[1])} = ${d}`] };
  },
  alfabet() {
    const W = [['ac', 'bec', 'cal'], ['mare', 'masă', 'mere'], ['pisică', 'pom', 'pui'], ['carte', 'casă', 'cer'], ['lună', 'lup', 'lac'], ['soare', 'sat', 'stea'], ['floare', 'fluture', 'frate']];
    const g = pick(W), sorted = [...g].sort((a, b) => a.localeCompare(b, 'ro')), ans = sorted.join(', ');
    const wrong = [[...sorted].reverse().join(', '), [sorted[1], sorted[0], sorted[2]].join(', '), [sorted[0], sorted[2], sorted[1]].join(', ')];
    return { text: 'Care e ordinea alfabetică?', expr: shuffle([...g]).join(', '), ans, opts: textOpts(ans, wrong.filter((w) => w !== ans)), steps: ['Compari prima literă; dacă e la fel, te uiți la a doua literă, apoi la a treia.', ans] };
  },
  orto3() {
    const L = [
      ['___ chemat pe colegul lui.', 'L-a', ['La']], ['Mergem ___ școală.', 'la', ['l-a']], ['Bunica ___ adus prăjituri.', 'ne-a', ['nea']], ['Afară e ___ albă.', 'nea', ['ne-a']],
      ['Mama ___ dat o carte.', 'mi-a', ['mia']], ['El ___ ajuns acasă.', 'n-a', ['na']], ['Ea ___ cânta mâine.', 'va', ['v-a']], ['Cine ___ chemat?', 'v-a', ['va']],
      ['Ana ___ uitat pe geam.', 's-a', ['sa']], ['Elevii ___ jucat.', 's-au', ['sau']], ['Tata ___ cumpărat o minge.', 'i-a', ['ia']], ['___ mărul de pe masă!', 'Ia', ['I-a']],
      ['Am plecat ___ dimineață.', 'într-o', ['intr-o']], ['A ieșit ___ curte.', 'dintr-o', ['dintro']], ['___ un pix?', 'Ai', ['A-i']], ['Mama ___ ajutat.', 'ne-a', ['nea']]
    ];
    const [t, a, w] = pick(L);
    return { text: 'Alege forma corectă:', expr: t, ans: a, opts: textOpts(a, w), steps: ['Truc: dacă poți pune „îl”, „ne”, „mi”, „se”, „îi” sau „v” în fața verbului, scrii cu cratimă (l-a, ne-a, mi-a, s-a, i-a, v-a).', t.replace('___', a)] };
  },
  punct3() {
    const L = [['Am cumpărat mere ___ pere și prune.', ',', 'În enumerare, între cuvinte pui virgulă.'], ['Mama a spus ___ — Vino la masă!', ':', 'Înainte de vorbirea cuiva pui două puncte.'],
      ['Pe masă erau caiete ___ pixuri și cărți.', ',', 'În enumerare pui virgulă.'], ['Profesoara ne-a întrebat ___', ':', 'Înaintea întrebării cuiva pui două puncte.']];
    const [t, a, s] = pick(L);
    return { text: 'Ce semn de punctuație lipsește?', expr: t, ans: a, opts: [',', ':', '.', '?'], steps: [s] };
  },
  silabe3() {
    const W = [['frumusețe', 4, 'fru-mu-se-țe'], ['bicicletă', 4, 'bi-ci-cle-tă'], ['ciocănitoare', 6, 'cio-că-ni-toa-re'], ['primăvară', 4, 'pri-mă-va-ră'], ['calculator', 4, 'cal-cu-la-tor'], ['ghiozdan', 2, 'ghioz-dan'], ['învățătoare', 5, 'în-vă-ță-toa-re'], ['elefant', 3, 'e-le-fant']];
    const [w, n, sp] = pick(W);
    return { text: 'Câte silabe are cuvântul?', expr: w, ans: n, opts: opts(n, [n + 1, n - 1, n + 2]).filter((x) => x > 0), steps: [`Bate din palme: ${sp}`, `${n} silabe`] };
  }
};
