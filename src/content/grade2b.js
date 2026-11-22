// Clasa a II-a după programa OMEN 3418/2013 (Matematică și explorarea mediului + Comunicare în limba română),
// în ordinea din școală: recapitulare 0-100, numere 0-1000, adunări fără/cu trecere, înmulțirea ca adunare repetată,
// tabla, împărțirea, jumătate/sfert, măsuri, figuri și corpuri, explorarea mediului; ortograme, punctuație, silabe.
// Tot aici: adunările până la 100 (clasa I, nivelul Expert).
import { rnd, pick, shuffle, opts, textOpts } from './util.js';

const U = ['zero', 'unu', 'doi', 'trei', 'patru', 'cinci', 'șase', 'șapte', 'opt', 'nouă'];
const TEEN = ['zece', 'unsprezece', 'doisprezece', 'treisprezece', 'paisprezece', 'cincisprezece', 'șaisprezece', 'șaptesprezece', 'optsprezece', 'nouăsprezece'];
const TENS = ['', '', 'douăzeci', 'treizeci', 'patruzeci', 'cincizeci', 'șaizeci', 'șaptezeci', 'optzeci', 'nouăzeci'];
const HUND = ['', 'o sută', 'două sute', 'trei sute', 'patru sute', 'cinci sute', 'șase sute', 'șapte sute', 'opt sute', 'nouă sute'];
export function inCuvinte(n) {
  if (n === 0) return 'zero';
  const s = Math.floor(n / 100), r = n % 100, z = Math.floor(r / 10), u = r % 10, parts = [];
  if (s) parts.push(HUND[s]);
  if (r) parts.push(r < 10 ? U[r] : r < 20 ? TEEN[r - 10] : TENS[z] + (u ? ' și ' + U[u] : ''));
  return parts.join(' ');
}
const fromBank = (bank) => { const [q, a, w, why] = pick(bank); return { text: q, ans: a, opts: textOpts(a, shuffle([...w]).slice(0, 3)), steps: [why] }; };
const noCarry = (a, b) => String(a).split('').reverse().every((d, i) => +d + +(String(b).split('').reverse()[i] || 0) < 10);
const noBorrow = (a, b) => String(a).split('').reverse().every((d, i) => +d >= +(String(b).split('').reverse()[i] || 0));

/* ---------------- MATEMATICĂ ---------------- */
export const G2B = {
  // recapitulare 0-100: comparare, vecini, pare/impare
  rec100() {
    const t = rnd(0, 2);
    if (t === 0) { const a = rnd(10, 99); let b = rnd(10, 99); while (b === a) b = rnd(10, 99); const ans = a < b ? '<' : '>'; return { text: 'Ce semn pui?', expr: `${a} ___ ${b}`, ans, opts: ['<', '>', '='], steps: ['Compari întâi zecile, apoi unitățile.', `${a} ${ans} ${b}`] }; }
    if (t === 1) { const n = rnd(11, 98), prev = Math.random() < 0.5, ans = prev ? n - 1 : n + 1; return { text: `Care este vecinul ${prev ? 'dinainte' : 'de după'} al numărului ${n}?`, ans, opts: opts(ans, [prev ? n + 1 : n - 1, n + (prev ? -10 : 10)]), steps: [prev ? 'Vecinul dinainte e cu 1 mai mic.' : 'Vecinul de după e cu 1 mai mare.'] }; }
    const n = rnd(10, 99), ans = n % 2 ? 'impar' : 'par'; return { text: `Numărul ${n} este par sau impar?`, ans, opts: ['par', 'impar'], steps: ['Te uiți la ultima cifră: 0, 2, 4, 6, 8 → par; 1, 3, 5, 7, 9 → impar.', `${n} se termină în ${n % 10}, deci e ${ans}.`] };
  },
  // adunări și scăderi 0-100 fără trecere peste ordin
  adun100f() {
    let a, b; if (Math.random() < 0.5) { do { a = rnd(10, 88); b = rnd(1, 99 - a); } while (!noCarry(a, b)); const r = a + b; return { text: 'Calculează:', expr: `${a} + ${b} =`, ans: r, opts: opts(r, [r + 10, r - 1, r + 1]), steps: ['Aduni unitățile cu unitățile, zecile cu zecile.', `${a} + ${b} = ${r}`] }; }
    do { a = rnd(20, 99); b = rnd(1, a - 1); } while (!noBorrow(a, b)); const r = a - b; return { text: 'Calculează:', expr: `${a} − ${b} =`, ans: r, opts: opts(r, [r + 10, r - 1, r + 1]), steps: ['Scazi unitățile din unități, zecile din zeci.', `${a} − ${b} = ${r}`] };
  },
  // adunări și scăderi 0-100 cu trecere peste ordin
  adun100t() {
    let a, b; if (Math.random() < 0.5) { do { a = rnd(15, 85); b = rnd(5, 99 - a); } while (noCarry(a, b)); const r = a + b; return { text: 'Calculează:', expr: `${a} + ${b} =`, ans: r, opts: opts(r, [r - 10, r + 10, r - 1]), steps: [`Unitățile: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}: scrii ${((a % 10) + (b % 10)) % 10} și ții minte 1.`, `${a} + ${b} = ${r}`] }; }
    do { a = rnd(30, 99); b = rnd(5, a - 5); } while (noBorrow(a, b)); const r = a - b; return { text: 'Calculează:', expr: `${a} − ${b} =`, ans: r, opts: opts(r, [r + 10, r - 10, r + 1]), steps: [`${a % 10} − ${b % 10} nu se poate: împrumuți o zece și faci ${10 + (a % 10)} − ${b % 10}.`, `${a} − ${b} = ${r}`] };
  },
  // numerele 0-1000: formare, cifra sutelor, comparare, scrise în cuvinte, ordonare
  numere1000() {
    const t = rnd(0, 4), n = rnd(101, 999), [s, z, u] = String(n).split('').map(Number);
    if (t === 0) return { text: `Ce număr are ${s} sute, ${z} zeci și ${u} unități?`, ans: n, opts: opts(n, [s * 100 + u * 10 + z, u * 100 + z * 10 + s, n + 100]), steps: [`${s} sute = ${s * 100}, ${z} zeci = ${z * 10}, ${u} unități = ${u}`, `${s * 100} + ${z * 10} + ${u} = ${n}`] };
    if (t === 1) { const names = ['sutelor', 'zecilor', 'unităților'], k = rnd(0, 2), d = [s, z, u][k]; return { text: `Care este cifra ${names[k]} în numărul ${n}?`, ans: d, opts: opts(d, [s, z, u].filter((x) => x !== d).concat([d + 1 <= 9 ? d + 1 : d - 1])), steps: ['De la stânga: sute, zeci, unități.', `În ${n}, cifra ${names[k]} este ${d}.`] }; }
    if (t === 2) { let b = rnd(101, 999); while (b === n) b = rnd(101, 999); const ans = n < b ? '<' : '>'; return { text: 'Ce semn pui?', expr: `${n} ___ ${b}`, ans, opts: ['<', '>', '='], steps: ['Compari întâi sutele, apoi zecile, apoi unitățile.', `${n} ${ans} ${b}`] }; }
    if (t === 3) return { text: 'Cum se scrie cu cifre?', expr: inCuvinte(n), ans: n, opts: opts(n, [s * 100 + u * 10 + z, n + 10, n - 100 > 0 ? n - 100 : n + 200]), steps: [`„${inCuvinte(n)}” = ${s} sute, ${z} zeci, ${u} unități = ${n}`] };
    const xs = [n, rnd(101, 999), rnd(101, 999)].filter((v, i, a) => a.indexOf(v) === i); while (xs.length < 3) xs.push(rnd(101, 999));
    const asc = [...xs].sort((a, b) => a - b).join(', '), [p, q, r] = xs;
    const perms = [[p, q, r], [p, r, q], [q, p, r], [q, r, p], [r, p, q], [r, q, p]].map((x) => x.join(', ')).filter((x, k, all) => x !== asc && all.indexOf(x) === k);
    return { text: 'Care e ordinea crescătoare (de la mic la mare)?', ans: asc, opts: textOpts(asc, shuffle(perms).slice(0, 3)), steps: ['Compari sutele, apoi zecile, apoi unitățile.', asc] };
  },
  rotunjire2() {
    const sute = Math.random() < 0.4, n = sute ? rnd(101, 949) : rnd(11, 989), base = sute ? 100 : 10, r = Math.round(n / base) * base, low = Math.floor(n / base) * base;
    return { text: `Rotunjește numărul ${n} la ${sute ? 'sute' : 'zeci'}.`, ans: r, opts: opts(r, [r === low ? low + base : low, n, r + base]), steps: [`Se află între ${low} și ${low + base}.`, `Cifra ${sute ? 'zecilor' : 'unităților'} e ${sute ? Math.floor(n / 10) % 10 : n % 10}: dacă e 5 sau mai mare urci, altfel cobori.`, `${n} → ${r}`] };
  },
  // adunări și scăderi 0-1000 fără trecere peste ordin
  adun1000f() {
    let a, b; if (Math.random() < 0.5) { do { a = rnd(100, 800); b = rnd(10, 999 - a); } while (!noCarry(a, b)); const r = a + b; return { text: 'Calculează:', expr: `${a} + ${b} =`, ans: r, opts: opts(r, [r + 100, r + 10, r - 1]), steps: ['Aduni unități cu unități, zeci cu zeci, sute cu sute.', `${a} + ${b} = ${r}`] }; }
    do { a = rnd(200, 999); b = rnd(10, a - 50); } while (!noBorrow(a, b)); const r = a - b; return { text: 'Calculează:', expr: `${a} − ${b} =`, ans: r, opts: opts(r, [r + 100, r - 10, r + 1]), steps: ['Scazi unități din unități, zeci din zeci, sute din sute.', `${a} − ${b} = ${r}`] };
  },
  // termenul necunoscut (balanța): doar adunare și scădere
  necun2b() {
    const t = rnd(0, 2);
    if (t === 0) { const x = rnd(5, 60), p = rnd(5, 39), q = x + p; return { text: 'Află numărul care lipsește:', expr: `___ + ${p} = ${q}`, ans: x, opts: opts(x, [q + p, x + 1, x + 10]), steps: ['Termenul necunoscut = suma − termenul cunoscut.', `${q} − ${p} = ${x}`], why: { [q + p]: 'Ai adunat. Termenul care lipsește se află prin scădere: suma − termenul cunoscut.' } }; }
    if (t === 1) { const x = rnd(20, 99), p = rnd(5, x - 3), q = x - p; return { text: 'Află numărul care lipsește:', expr: `___ − ${p} = ${q}`, ans: x, opts: opts(x, [q - p > 0 ? q - p : x + 5, x + 10, x - 1]), steps: ['Descăzutul = diferența + scăzătorul.', `${q} + ${p} = ${x}`] }; }
    const a = rnd(30, 99), x = rnd(5, a - 5), q = a - x; return { text: 'Află numărul care lipsește:', expr: `${a} − ___ = ${q}`, ans: x, opts: opts(x, [a + q, x + 10, x + 1]), steps: ['Scăzătorul = descăzutul − diferența.', `${a} − ${q} = ${x}`] };
  },
  // înmulțirea ca adunare repetată
  inmRep() {
    const b = rnd(2, 5); let a = rnd(2, 10); while (a === b) a = rnd(2, 10); const sum = Array(b).fill(a).join(' + '), r = a * b;
    if (Math.random() < 0.5) return { text: 'Scrie ca înmulțire:', expr: `${sum} =`, ans: `${b} × ${a}`, opts: textOpts(`${b} × ${a}`, [`${a} + ${b}`, `${a} × ${a}`, `${b} + ${b}`]), steps: [`Numărul ${a} se adună de ${b} ori: ${b} × ${a}.`] };
    return { text: 'Cât fac?', expr: `${sum} =`, ans: r, opts: opts(r, [a + b, r + a, r - a]), steps: [`${a} adunat de ${b} ori = ${b} × ${a} = ${r}`] };
  },
  // tabla ușoară: 2, 3, 4, 5, 10
  tablaUsor() {
    const a = pick([2, 3, 4, 5, 10]), b = rnd(1, 10), r = a * b;
    return { text: 'Tabla înmulțirii:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [r + a, r - a > 0 ? r - a : r + 2 * a, a + b]), steps: [`Numeri din ${a} în ${a} de ${b} ori: ${Array.from({ length: b }, (_, i) => a * (i + 1)).join(', ')}.`] };
  },
  // împărțirea prin împărțire în grupe egale / scădere repetată
  impRep() {
    const k = rnd(2, 5), q = rnd(2, 10), n = k * q, obj = pick(['bomboane', 'mere', 'creioane', 'baloane', 'cărți']);
    return { text: `${n} ${obj} se împart în mod egal la ${k} copii. Câte primește fiecare?`, ans: q, opts: opts(q, [n - k, k, q + 1]), steps: [`Împărțim ${n} în ${k} grupe egale: ${n} : ${k} = ${q}.`, `Verificăm: ${k} × ${q} = ${n} ✔`] };
  },
  // jumătate, sfert, dublu, triplu
  jumSfert() {
    const t = rnd(0, 3);
    if (t === 0) { const q = rnd(2, 50), n = 2 * q; return { text: `Cât este jumătate din ${n}?`, ans: q, opts: opts(q, [n * 2, q + 1, n - 2]), steps: ['Jumătatea = împarți la 2.', `${n} : 2 = ${q}`] }; }
    if (t === 1) { const q = rnd(2, 25), n = 4 * q; return { text: `Cât este un sfert din ${n}?`, ans: q, opts: opts(q, [n / 2, q * 2, q + 4]), steps: ['Sfertul = împarți la 4 (4 părți egale, iei una).', `${n} : 4 = ${q}`] }; }
    if (t === 2) { const n = rnd(3, 50), r = 2 * n; return { text: `Cât este dublul lui ${n}?`, ans: r, opts: opts(r, [n + 2, n, r + 2]), steps: ['Dublul = de 2 ori mai mult.', `${n} × 2 = ${r}`] }; }
    const parts = pick([2, 4]), name = parts === 2 ? 'jumătate (o doime)' : 'un sfert (o pătrime)';
    return { text: `O pizza e tăiată în ${parts} bucăți egale. Cât reprezintă o bucată?`, ans: name, opts: textOpts(name, [parts === 2 ? 'un sfert (o pătrime)' : 'jumătate (o doime)', 'toată pizza', 'o treime']), steps: [parts === 2 ? '2 bucăți egale → fiecare e o jumătate: 1/2.' : '4 bucăți egale → fiecare e un sfert: 1/4.', 'Știai că 2 sferturi fac o jumătate? 2/4 = 1/2.'] };
  },
  // ordinea operațiilor, simplu
  ordine2b() {
    if (Math.random() < 0.5) { const a = rnd(2, 9), b = rnd(2, 5), c = rnd(1, 30), r = a * b + c; return { text: 'Calculează (întâi înmulțirea!):', expr: `${a} × ${b} + ${c} =`, ans: r, opts: opts(r, [a * (b + c), r + 1, r - 1]), steps: [`Înmulțirea se face prima: ${a} × ${b} = ${a * b}.`, `${a * b} + ${c} = ${r}`], why: { [a * (b + c)]: `Ai adunat întâi ${b} + ${c}. Înmulțirea se face înaintea adunării.` } }; }
    const b = rnd(2, 5), q = rnd(2, 9), m = b * q, a = rnd(m + 1, m + 40), r = a - m; return { text: 'Calculează (întâi înmulțirea!):', expr: `${a} − ${b} × ${q} =`, ans: r, opts: opts(r, [(a - b) * q, r + 1, r + q]), steps: [`Întâi: ${b} × ${q} = ${m}.`, `${a} − ${m} = ${r}`], why: { [(a - b) * q]: `Ai scăzut întâi. Înmulțirea se face înaintea scăderii.` } };
  },
  // probleme cu două operații
  prob2() {
    const n1 = pick(['Ana', 'Matei', 'Ioana', 'Radu', 'Elena']), t = rnd(0, 2);
    if (t === 0) { const a = rnd(20, 60), b = rnd(5, 30), c = rnd(5, a + b - 5), r = a + b - c; return { text: `${n1} avea ${a} de timbre. A mai primit ${b}, apoi i-a dat fratelui ${c}. Câte timbre are acum?`, ans: r, opts: opts(r, [a + b + c, a + b, a - b - c > 0 ? a - b - c : r + 10]), steps: [`Întâi a primit: ${a} + ${b} = ${a + b}`, `Apoi a dat: ${a + b} − ${c} = ${r}`] }; }
    if (t === 1) { const a = rnd(10, 40), d = rnd(3, 15), b = a + d, r = a + b; return { text: `Într-un coș sunt ${a} mere, iar în altul cu ${d} mai multe. Câte mere sunt în ambele coșuri?`, ans: r, opts: opts(r, [b, a + a, r + 10]), steps: [`Al doilea coș: ${a} + ${d} = ${b}`, `Împreună: ${a} + ${b} = ${r}`], why: { [b]: `${b} sunt doar merele din al doilea coș. Mai adună și primul coș: ${a} + ${b}.`, [a + a]: `Ai adunat primul coș de două ori. Al doilea are cu ${d} mai multe.` } }; }
    const k = rnd(2, 5), p = rnd(2, 9), c = rnd(1, 10), r = k * p + c; return { text: `${n1} cumpără ${k} caiete a câte ${p} lei și un creion de ${c} lei. Cât plătește în total?`, ans: r, opts: opts(r, [k * p, k + p + c, (k + 1) * p]), steps: [`Caietele: ${k} × ${p} = ${k * p} lei`, `Plus creionul: ${k * p} + ${c} = ${r} lei`] };
  },
  // figuri plane și corpuri
  figuri2() {
    return fromBank([
      ['Ce formă are o minge?', 'sferă', ['cub', 'cilindru', 'con'], 'Mingea e rotundă din toate părțile: sferă.'],
      ['Ce formă are un zar?', 'cub', ['sferă', 'con', 'cilindru'], 'Zarul are 6 fețe pătrate egale: cub.'],
      ['Ce formă are o cutie de conserve?', 'cilindru', ['cub', 'sferă', 'con'], 'Conserva are două baze rotunde: cilindru.'],
      ['Ce formă are un cornet de înghețată?', 'con', ['cilindru', 'cub', 'sferă'], 'Cornetul are vârf și bază rotundă: con.'],
      ['Ce formă are o cutie de pantofi?', 'cuboid', ['cub', 'sferă', 'con'], 'Cutia are fețe dreptunghiulare: cuboid (paralelipiped).'],
      ['Câte laturi are un triunghi?', '3', ['4', '5', '0'], 'Tri = trei: 3 laturi.'],
      ['Câte laturi are un pătrat?', '4', ['3', '5', '6'], 'Pătratul are 4 laturi egale.'],
      ['Ce figură are 4 laturi, două câte două egale?', 'dreptunghiul', ['triunghiul', 'cercul', 'semicercul'], 'Dreptunghiul are laturile opuse egale.'],
      ['Ce figură nu are nicio latură dreaptă?', 'cercul', ['pătratul', 'triunghiul', 'dreptunghiul'], 'Cercul e o linie curbă închisă.'],
      ['Câte fețe are un cub?', '6', ['4', '8', '12'], 'Cubul are 6 fețe pătrate.'],
      ['Ce împarte o figură în două părți la fel, ca în oglindă?', 'axa de simetrie', ['latura', 'colțul', 'cercul'], 'Axa de simetrie: dacă pliezi figura pe ea, părțile se suprapun.'],
      ['Jumătate de cerc se numește...', 'semicerc', ['triunghi', 'pătrat', 'cub'], 'Semi = jumătate: semicerc.']
    ]);
  },
  // măsurători clasa a II-a
  masuri2b() {
    return fromBank([
      ['1 metru = ? centimetri', '100', ['10', '1000', '50'], '1 m = 100 cm.'], ['1 metru = ? milimetri', '1000', ['100', '10', '500'], '1 m = 1000 mm.'],
      ['1 litru = ? mililitri', '1000', ['100', '10', '500'], '1 l = 1000 ml.'], ['1 kilogram = ? grame', '1000', ['100', '10', '500'], '1 kg = 1000 g.'],
      ['O oră are câte minute?', '60', ['100', '30', '24'], '1 oră = 60 de minute.'], ['Jumătate de oră înseamnă câte minute?', '30', ['15', '50', '60'], 'Jumătate din 60 = 30 de minute.'],
      ['Un sfert de oră înseamnă câte minute?', '15', ['25', '30', '4'], 'Un sfert din 60 = 15 minute.'], ['Câte zile are o săptămână?', '7', ['5', '10', '30'], 'Săptămâna are 7 zile.'],
      ['Dacă azi e marți, ce zi a fost ieri?', 'luni', ['miercuri', 'duminică', 'joi'], 'Ieri = ziua dinainte.'], ['Dacă azi e joi, ce zi va fi poimâine?', 'sâmbătă', ['vineri', 'duminică', 'miercuri'], 'Poimâine = peste 2 zile: vineri, sâmbătă.'],
      ['Câte luni are un an?', '12', ['10', '7', '52'], 'Anul are 12 luni.'], ['În ce anotimp este luna ianuarie?', 'iarna', ['vara', 'toamna', 'primăvara'], 'Iarna: decembrie, ianuarie, februarie.'],
      ['În ce anotimp este luna iulie?', 'vara', ['iarna', 'toamna', 'primăvara'], 'Vara: iunie, iulie, august.'], ['În ce anotimp este luna octombrie?', 'toamna', ['vara', 'iarna', 'primăvara'], 'Toamna: septembrie, octombrie, noiembrie.'],
      ['1 leu = ? bani', '100', ['10', '1000', '50'], '1 leu = 100 de bani.'], ['Cu ce măsurăm masa unui pepene?', 'cu cântarul', ['cu rigla', 'cu ceasul', 'cu termometrul'], 'Masa se măsoară cu cântarul sau balanța.'],
      ['Cu ce măsoară croitoreasa talia?', 'cu panglica de croitorie', ['cu cântarul', 'cu ceasul', 'cu litrul'], 'Panglica de croitorie se îndoaie pe corp.'], ['Ce măsurăm în litri?', 'apa dintr-o sticlă', ['lungimea băncii', 'masa unui măr', 'ora'], 'Lichidele se măsoară în litri.']
    ]);
  }
};

/* ---------------- EXPLORAREA MEDIULUI (clasa a II-a) ---------------- */
export const G2M = {
  m2corp: () => fromBank([
    ['Ce organ pompează sângele?', 'inima', ['plămânii', 'stomacul', 'creierul'], 'Inima pompează sângele în tot corpul.'],
    ['Cu ce respirăm?', 'cu plămânii', ['cu stomacul', 'cu inima', 'cu oasele'], 'Plămânii iau aerul.'],
    ['Unde se digeră mâncarea?', 'în stomac', ['în plămâni', 'în inimă', 'în creier'], 'Stomacul digeră mâncarea.'],
    ['Ce organ ne ajută să gândim?', 'creierul', ['stomacul', 'inima', 'genunchiul'], 'Creierul conduce tot corpul.'],
    ['Ce ne ține corpul drept, ca un schelet?', 'oasele', ['mușchii feței', 'părul', 'unghiile'], 'Oasele formează scheletul.'],
    ['Cum ne ferim de gripă?', 'ne spălăm des pe mâini și ne acoperim gura când strănutăm', ['împărțim paharul cu cel bolnav', 'nu ne spălăm', 'ieșim fără haine iarna'], 'Gripa e produsă de un virus; igiena ne apără.'],
    ['Ce produce gripa?', 'un virus', ['o bomboană', 'soarele', 'un măr'], 'Virușii sunt foarte mici și ne pot îmbolnăvi.'],
    ['Ce e sănătos să mâncăm zilnic?', 'fructe și legume', ['doar dulciuri', 'doar chipsuri', 'nimic'], 'O dietă sănătoasă are fructe și legume.'],
    ['Ce ne ajută să fim sănătoși?', 'mișcarea și somnul', ['statul toată ziua la televizor', 'dulciurile', 'nespălatul'], 'Mișcare, odihnă, igienă.']
  ]),
  m2viata: () => fromBank([
    ['De ce au nevoie toate viețuitoarele?', 'aer, apă și hrană', ['doar jucării', 'doar lumină de lampă', 'doar zăpadă'], 'Nevoile de bază: aer, apă, hrană.'],
    ['Unde trăiește ursul polar?', 'la Polul Nord', ['în deșert', 'în baltă', 'în Delta Dunării'], 'Ursul polar trăiește în ținuturile înghețate de la Polul Nord.'],
    ['Unde trăiește pinguinul?', 'la Polul Sud', ['la Polul Nord', 'în pădure', 'în deșert'], 'Pinguinii trăiesc la Polul Sud.'],
    ['Ce animal trăiește în deșert?', 'cămila', ['broasca', 'delfinul', 'ursul polar'], 'Cămila rezistă mult fără apă.'],
    ['Ce animal trăiește în baltă?', 'broasca', ['cămila', 'pinguinul', 'leul'], 'Balta e casa broaștelor, a rațelor, a peștilor.'],
    ['Ce pasăre întâlnim în Delta Dunării?', 'pelicanul', ['pinguinul', 'struțul', 'papagalul de junglă'], 'Delta Dunării e casa pelicanilor.'],
    ['Ce animal trăiește în pădure?', 'căprioara', ['delfinul', 'cămila', 'pinguinul'], 'În pădure trăiesc căprioare, urși, vulpi.'],
    ['Ce animal trăiește în Marea Neagră?', 'delfinul', ['ursul', 'cămila', 'vulpea'], 'În Marea Neagră trăiesc delfini și pești.'],
    ['Care sunt părțile unei plante?', 'rădăcina, tulpina, frunzele, floarea', ['solzii și penele', 'aripile și ciocul', 'blana și ghearele'], 'Planta are rădăcină, tulpină, frunze, flori, fructe cu semințe.'],
    ['Ce parte a plantei ia apa din pământ?', 'rădăcina', ['floarea', 'frunza', 'fructul'], 'Rădăcina absoarbe apa din sol.'],
    ['Ce cresc toate viețuitoarele?', 'cresc și se înmulțesc', ['nu se schimbă', 'se fac pietre', 'dispar'], 'Viețuitoarele cresc și se înmulțesc.']
  ]),
  m2relief: () => fromBank([
    ['Din ce e alcătuit Pământul?', 'uscat, apă și aer (atmosferă)', ['doar apă', 'doar nisip', 'doar nori'], 'Pământul are uscat, apă și atmosferă.'],
    ['Ce formă de relief este cea mai înaltă?', 'munții', ['câmpiile', 'dealurile', 'lacurile'], 'Munții sunt cei mai înalți; dealurile sunt mai joase; câmpiile sunt plate.'],
    ['Ce formă de relief este netedă, plată?', 'câmpia', ['muntele', 'dealul', 'vulcanul'], 'Câmpia e întinsă și netedă.'],
    ['Ce formă de relief e mai joasă decât muntele, dar mai înaltă decât câmpia?', 'dealul', ['marea', 'lacul', 'pădurea'], 'Dealurile au înălțimi potrivite și pante line.'],
    ['Pe hartă, cu ce culoare sunt desenați munții?', 'maro', ['verde', 'albastru', 'roz'], 'Munții: maro; dealurile: galben-portocaliu; câmpiile: verde; apele: albastru.'],
    ['Pe hartă, cu ce culoare sunt desenate câmpiile?', 'verde', ['maro', 'roșu', 'negru'], 'Câmpiile se colorează cu verde.'],
    ['Pe hartă, cu ce culoare sunt desenate apele?', 'albastru', ['maro', 'verde', 'galben'], 'Apele (râuri, lacuri, mări) sunt albastre.']
  ]),
  m2pamant: () => fromBank([
    ['Din ce e alcătuit Pământul?', 'uscat, apă și aer (atmosferă)', ['doar apă', 'doar nisip', 'doar nori'], 'Pământul are uscat, apă și atmosferă.'],
    ['Ce formă de relief este cea mai înaltă?', 'munții', ['câmpiile', 'dealurile', 'lacurile'], 'Munții sunt cei mai înalți; dealurile sunt mai joase; câmpiile sunt plate.'],
    ['Ce formă de relief este netedă, plată?', 'câmpia', ['muntele', 'dealul', 'vulcanul'], 'Câmpia e întinsă și netedă.'],
    ['De ce avem zi și noapte?', 'Pământul se rotește', ['Soarele se stinge noaptea', 'Luna acoperă Pământul', 'norii ascund Soarele'], 'Pământul se învârte: partea spre Soare are zi.'],
    ['Ce este Soarele?', 'o stea', ['o planetă', 'un satelit', 'un nor'], 'Soarele e steaua care ne dă lumină și căldură.'],
    ['A câta planetă de la Soare este Pământul?', 'a treia', ['prima', 'a cincea', 'a opta'], 'Mercur, Venus, Pământul: a treia.'],
    ['Care este cea mai mare planetă?', 'Jupiter', ['Pământul', 'Marte', 'Mercur'], 'Jupiter e uriaș.'],
    ['Ce se învârte în jurul Pământului?', 'Luna', ['Soarele', 'Marte', 'Jupiter'], 'Luna este satelitul Pământului.'],
    ['Care planetă e numită „planeta roșie”?', 'Marte', ['Venus', 'Saturn', 'Pământul'], 'Marte are culoare roșiatică.']
  ]),
  m2fizica: () => fromBank([
    ['Ce atrage magnetul?', 'obiectele de fier', ['lemnul', 'hârtia', 'plasticul'], 'Magnetul atrage fierul.'],
    ['Câți poli are un magnet?', '2: Nord și Sud', ['unul singur', '5', 'niciunul'], 'Magnetul are polul Nord (N) și polul Sud (S).'],
    ['Ce se întâmplă când apropii doi poli la fel (N și N)?', 'se resping', ['se atrag', 'se topesc', 'nu se întâmplă nimic'], 'Polii la fel se resping, polii diferiți se atrag.'],
    ['Ce se întâmplă când apropii polul N de polul S?', 'se atrag', ['se resping', 'se rup', 'se încălzesc'], 'Polii diferiți se atrag.'],
    ['Ce material conduce curentul electric?', 'cuprul (metalul)', ['lemnul', 'plasticul', 'cauciucul'], 'Metalele conduc electricitatea.'],
    ['De ce firele electrice sunt îmbrăcate în plastic?', 'plasticul nu conduce curentul și ne apără', ['ca să fie colorate', 'ca să fie grele', 'nu au plastic'], 'Plasticul e izolator.'],
    ['Ce aparat funcționează cu electricitate?', 'frigiderul', ['bicicleta', 'creionul', 'mingea'], 'Frigiderul are nevoie de curent.'],
    ['Ce trebuie să NU facem cu priza?', 'să băgăm degetele sau obiecte în ea', ['să o lăsăm în pace', 'să o folosească un adult', 'să o ocolim'], 'Curentul electric e periculos!']
  ])
};

/* ---------------- LIMBA ROMÂNĂ (clasa a II-a) ---------------- */
const ORTO2A = [ // într-o / într-un
  ['Am găsit ___ floare rară în grădină.', 'într-o', 'într o'], ['Locuim ___ casă cu etaj.', 'într-o', 'intr-o'], ['Pisica doarme ___ coș.', 'într-un', 'într un'],
  ['Am pus creioanele ___ cutie.', 'într-o', 'întro'], ['Ne jucăm ___ parc frumos.', 'într-un', 'întrun'], ['Peștii înoată ___ lac.', 'într-un', 'într un'], ['A scris ___ zi o poezie.', 'într-o', 'în tr-o']
];
const ORTO2B = [ // sa / s-a
  ['Câinele ___ dezlegat din lanț.', 's-a', 'sa'], ['Mama și-a luat geanta ___.', 'sa', 's-a'], ['Ana ___ jucat în parc.', 's-a', 'sa'], ['Pisica își caută mâncarea ___.', 'sa', 's-a'],
  ['Băiatul ___ trezit devreme.', 's-a', 'sa'], ['Fiecare elev are banca ___.', 'sa', 's-a'], ['Afară ___ întunecat.', 's-a', 'sa'], ['Ursul își apără vizuina ___.', 'sa', 's-a'],
  ['Mingea ___ rostogolit sub masă.', 's-a', 'sa'], ['Bunica și-a pus rochia ___ nouă.', 'sa', 's-a']
];
const ORTO2C = [ // sau / s-au, dintr-o / dintr-un
  ['Copiii ___ dus la școală.', 's-au', 'sau'], ['Vrei mere ___ pere?', 'sau', 's-au'], ['Frunzele ___ îngălbenit.', 's-au', 'sau'], ['Desenezi cu creionul ___ cu carioca?', 'sau', 's-au'],
  ['Păsările ___ întors primăvara.', 's-au', 'sau'], ['Mergem la mare ___ la munte?', 'sau', 's-au'],
  ['A scos o carte ___ cutie.', 'dintr-o', 'din tr-o'], ['A ieșit ___ pădure deasă.', 'dintr-o', 'dintro'], ['A băut apă ___ pahar.', 'dintr-un', 'dintrun'], ['A sărit ___ copac.', 'dintr-un', 'din trun']
];
const ORTO_RULE = { 's-a': '„s-a” = el s-a/ea s-a (face ceva): „s-a dezlegat”.', sa: '„sa” = a lui/a ei: „geanta sa”.', 's-au': '„s-au” = ei s-au (fac ceva): „s-au dus”.', sau: '„sau” = ori: „mere sau pere”.', 'într-o': '„într-o” și „într-un” se scriu cu cratimă.', 'într-un': '„într-o” și „într-un” se scriu cu cratimă.', 'dintr-o': '„dintr-o” și „dintr-un” se scriu cu cratimă.', 'dintr-un': '„dintr-o” și „dintr-un” se scriu cu cratimă.' };
function ortoFrom(bank) {
  const [sent, a, w] = pick(bank);
  return { text: 'Alege forma corectă:', expr: sent, ans: a, opts: [a, w].sort(() => Math.random() - 0.5), steps: [ORTO_RULE[a] || 'Gândește-te la înțeles.', `Corect: ${sent.replace('___', a)}`], why: { [w]: ORTO_RULE[a] || 'Citește încă o dată propoziția.' } };
}
// cuvinte cu â și î: î la început și la sfârșit de cuvânt, â în interior

export const G2R = {
  orto2a: () => ortoFrom(ORTO2A),
  orto2b: () => ortoFrom(ORTO2B),
  orto2c: () => ortoFrom(ORTO2C),
  aiI() {
    const W = [['c_ine', 'câine'], ['_nger', 'înger'], ['p_ine', 'pâine'], ['m_na', 'mâna'], ['r_u', 'râu'], ['_nalt', 'înalt'], ['g_nd', 'gând'], ['_ncet', 'încet'], ['st_nga', 'stânga'], ['ur_t', 'urât'], ['cobor_', 'coborî'], ['_nvăț', 'învăț']];
    const [w, ans] = pick(W), letter = ans[w.indexOf('_')];
    return { text: `Ce literă lipsește: „${w}”?`, ans: letter, opts: ['â', 'î'], steps: ['„î” se scrie la începutul și la sfârșitul cuvântului; „â” se scrie în interiorul cuvântului.', `Corect: ${ans}`] };
  },
  punct2b() {
    return fromBank([
      ['Ce semn pui în enumerare? „Am cumpărat mere___ pere și prune.”', 'virgula (,)', ['punctul (.)', 'semnul întrebării (?)', 'linia de dialog (—)'], 'Când enumerăm, despărțim cuvintele prin virgulă.'],
      ['Ce semn pui înainte de vorbirea cuiva? „Mama a zis___”', 'două puncte (:)', ['virgula (,)', 'semnul exclamării (!)', 'punctul (.)'], 'Înainte de vorbirea personajului punem două puncte.'],
      ['Cu ce începe replica unui personaj în dialog?', 'cu linia de dialog (—)', ['cu virgula', 'cu punctul', 'cu cratima'], 'Replica începe pe rând nou, cu linie de dialog.'],
      ['Ce semn pui la sfârșit? „Ce frumos e afară___”', 'semnul exclamării (!)', ['virgula (,)', 'două puncte (:)', 'cratima (-)'], 'Când exprimăm bucurie, mirare: semnul exclamării.'],
      ['Ce semn pui la sfârșit? „Unde ai pus ghiozdanul___”', 'semnul întrebării (?)', ['punctul (.)', 'virgula (,)', 'două puncte (:)'], 'La întrebare punem semnul întrebării.'],
      ['Ce semn pui la sfârșit? „Azi plouă___”', 'punctul (.)', ['semnul întrebării (?)', 'virgula (,)', 'linia de dialog (—)'], 'Propoziția care spune ceva se încheie cu punct.']
    ]);
  },
  vocCons() {
    const words = ['casa', 'masa', 'pom', 'carte', 'floare', 'copil', 'școala', 'mere', 'lună', 'soare', 'pisică', 'banca'];
    const V = 'aeiouăâî';
    if (Math.random() < 0.5) { const w = pick(words), n = [...w].filter((c) => V.includes(c)).length; return { text: `Câte vocale are cuvântul „${w}”?`, ans: n, opts: opts(n, [n + 1, n > 1 ? n - 1 : n + 2, w.length - n]), steps: ['Vocalele sunt: a, ă, â, e, i, î, o, u.', `În „${w}”: ${[...w].filter((c) => V.includes(c)).join(', ')} → ${n}`] }; }
    const v = pick([...'aeiouăî']), cs = shuffle([...'bcdfgmnprstv']).slice(0, 3);
    return { text: 'Care literă este vocală?', ans: v, opts: textOpts(v, cs), steps: ['Vocalele: a, ă, â, e, i, î, o, u. Celelalte sunt consoane.'] };
  },
  silabe2() {
    const W = [['ca-se-ta', ['cas-e-ta', 'c-ase-ta', 'case-ta']], ['mă-ră', ['măr-ă', 'm-ără', 'mă-r-ă']], ['pă-du-re', ['păd-u-re', 'pă-dur-e', 'pădu-re']], ['co-pa-cul', ['cop-a-cul', 'co-pac-ul', 'copa-cul']],
      ['fe-reas-tră', ['fer-eas-tră', 'fe-rea-stră', 'fereas-tră']], ['bu-ni-ca', ['bun-i-ca', 'bu-nic-a', 'buni-ca']], ['flu-tu-re', ['flut-u-re', 'flu-tur-e', 'flutu-re']], ['ma-și-nă', ['maș-i-nă', 'mași-nă', 'm-a-și-nă']], ['gră-di-nă', ['grăd-i-nă', 'gră-din-ă', 'grădi-nă']], ['al-bi-nă', ['alb-i-nă', 'a-lbi-nă', 'albi-nă']]];
    const [ans, wrong] = pick(W);
    const n = ans.split('-').length;
    if (Math.random() < 0.5) return { text: 'Care este despărțirea corectă în silabe?', ans, opts: textOpts(ans, wrong), steps: ['Bate din palme la fiecare silabă.', ans] };
    return { text: `Câte silabe are cuvântul „${ans.replace(/-/g, '')}”?`, ans: n, opts: opts(n, [n + 1, n - 1 > 0 ? n - 1 : n + 2]), steps: ['Bate din palme la fiecare silabă.', `${ans} → ${n} silabe`] };
  },
  sinAnt2() {
    const P = [['mare', 'uriaș', 'mic'], ['vesel', 'bucuros', 'trist'], ['repede', 'iute', 'încet'], ['cald', 'fierbinte', 'rece'], ['frumos', 'drăguț', 'urât'], ['sus', 'deasupra', 'jos'], ['a începe', 'a porni', 'a termina'], ['bun', 'cumsecade', 'rău'], ['lung', 'întins', 'scurt'], ['plin', 'încărcat', 'gol']];
    const [w, sin, ant] = pick(P), askSin = Math.random() < 0.5, ans = askSin ? sin : ant, other = P.filter((x) => x[0] !== w).map((x) => x[askSin ? 1 : 2]);
    return { text: askSin ? `Care cuvânt are ÎNȚELES ASEMĂNĂTOR cu „${w}”?` : `Care cuvânt are ÎNȚELES OPUS lui „${w}”?`, ans, opts: textOpts(ans, [askSin ? ant : sin, ...shuffle(other).slice(0, 2)]), steps: [askSin ? `${w} = ${sin} (sens asemănător)` : `${w} ≠ ${ant} (sens opus)`] };
  },
  majuscula() {
    return fromBank([
      ['Care cuvânt se scrie cu literă mare?', 'Dunărea', ['râul', 'apa', 'barca'], 'Numele de râuri se scriu cu literă mare.'],
      ['Care cuvânt se scrie cu literă mare?', 'București', ['orașul', 'strada', 'casa'], 'Numele de orașe se scriu cu literă mare.'],
      ['Care cuvânt se scrie cu literă mare?', 'Ana', ['fata', 'colega', 'sora'], 'Numele de persoane se scriu cu literă mare.'],
      ['Care cuvânt se scrie cu literă mare?', 'Grivei', ['câinele', 'cățelul', 'lătratul'], 'Numele animalelor (Grivei, Miau) se scriu cu literă mare.'],
      ['Cu ce literă începe orice propoziție?', 'cu literă mare', ['cu literă mică', 'cu cifră', 'cu punct'], 'Prima literă din propoziție este mare.'],
      ['Care cuvânt se scrie cu literă mare?', 'România', ['țara', 'harta', 'drapelul'], 'Numele de țări se scriu cu literă mare.']
    ]);
  }
};

/* ---------------- din fișele de lucru: tipuri noi (clasa a II-a) ---------------- */
const TEXTE = [
  { t: 'Ariciul cel grijuliu', x: 'Toamna, ariciul Țepușel aduna mere și frunze uscate. Își făcea un culcuș cald sub o tufă de măceș. Prietena lui, veverița Roșcata, îl întrebă:\n— De ce aduni atâtea frunze?\n— Iarna dorm mult și am nevoie de un pat moale, răspunse ariciul.\nCând căzu prima zăpadă, Țepușel dormea liniștit.',
    q: [['Cum se numea ariciul?', 'Țepușel', ['Roșcata', 'Grivei', 'Pufulete']], ['Ce aduna ariciul?', 'mere și frunze uscate', ['nuci și pietre', 'flori de câmp', 'bețe de chibrit']], ['Unde își făcea culcușul?', 'sub o tufă de măceș', ['într-o scorbură', 'în casa bunicii', 'lângă râu']],
      ['Cine l-a întrebat ce face?', 'veverița Roșcata', ['ursul', 'vulpea', 'bufnița']], ['De ce aduna frunze?', 'ca să aibă un pat moale pentru iarnă', ['ca să le mănânce', 'ca să se joace cu ele', 'ca să le dea veveriței']], ['În ce anotimp începe povestea?', 'toamna', ['vara', 'primăvara', 'iarna']], ['Care este titlul textului?', 'Ariciul cel grijuliu', ['Veverița Roșcata', 'Prima zăpadă', 'Tufa de măceș']]] },
  { t: 'La piață cu bunica', x: 'Sâmbătă dimineață, Matei a mers cu bunica la piață. Au cumpărat roșii, castraveți și un pepene mare. Matei a cărat sacoșa cu legume, deși era grea. Bunica i-a cumpărat o înghețată de ciocolată, ca răsplată.',
    q: [['Când au mers la piață?', 'sâmbătă dimineață', ['duminică seara', 'luni la prânz', 'vineri noaptea']], ['Cu cine a mers Matei?', 'cu bunica', ['cu tata', 'cu sora lui', 'singur']], ['Ce NU au cumpărat?', 'mere', ['roșii', 'castraveți', 'un pepene']],
      ['Ce a cărat Matei?', 'sacoșa cu legume', ['pepenele singur', 'un coș cu ouă', 'nimic']], ['Ce a primit ca răsplată?', 'o înghețată de ciocolată', ['o minge', 'o carte', 'un măr']], ['Cum era sacoșa?', 'grea', ['goală', 'ușoară', 'ruptă']]] },
  { t: 'Prima zăpadă', x: 'Ana s-a trezit și a privit pe geam. Totul era alb! Fulgii mari cădeau încet. A îmbrăcat geaca groasă, căciula și mănușile roșii. Împreună cu fratele ei, Radu, a făcut un om de zăpadă cu nas de morcov.',
    q: [['Ce a văzut Ana pe geam?', 'totul era alb, ninsese', ['ploua tare', 'era soare de vară', 'era noapte']], ['Ce culoare aveau mănușile?', 'roșii', ['albastre', 'verzi', 'galbene']], ['Cu cine a făcut omul de zăpadă?', 'cu fratele ei, Radu', ['cu mama', 'cu bunicul', 'singură']],
      ['Din ce era nasul omului de zăpadă?', 'dintr-un morcov', ['dintr-un castravete', 'dintr-o nucă', 'dintr-un creion']], ['Cum cădeau fulgii?', 'încet', ['foarte repede', 'în sus', 'deloc']], ['În ce anotimp se petrece întâmplarea?', 'iarna', ['vara', 'toamna', 'primăvara']]] },
  { t: 'Cățelul Bobiță', x: 'Bobiță este un cățel jucăuș. Are blana maro și o pată albă pe ureche. În fiecare dimineață îl conduce pe Luca până la poartă. Când Luca vine de la școală, Bobiță sare de bucurie și dă din coadă.',
    q: [['Ce culoare are blana lui Bobiță?', 'maro', ['neagră', 'albă', 'gri']], ['Unde are pata albă?', 'pe ureche', ['pe coadă', 'pe nas', 'pe lăbuță']], ['Pe cine conduce până la poartă?', 'pe Luca', ['pe poștaș', 'pe pisică', 'pe bunica']],
      ['Ce face când vine Luca de la școală?', 'sare de bucurie și dă din coadă', ['doarme', 'latră supărat', 'fuge de el']], ['Cum este Bobiță?', 'jucăuș', ['leneș', 'rău', 'trist']]] },
  { t: 'Grădina școlii', x: 'Primăvara, elevii clasei a II-a au plantat flori în grădina școlii. Doamna învățătoare le-a dat semințe de lalele și de panseluțe. Fiecare copil a udat o floare. După două săptămâni au apărut primele frunzulițe verzi.',
    q: [['Cine a plantat flori?', 'elevii clasei a II-a', ['părinții', 'grădinarul', 'directorul']], ['Ce semințe au primit?', 'de lalele și de panseluțe', ['de roșii', 'de dovleac', 'de floarea-soarelui']], ['Ce a făcut fiecare copil?', 'a udat o floare', ['a cules o floare', 'a cumpărat o floare', 'a desenat o floare']],
      ['După cât timp au apărut frunzulițele?', 'după două săptămâni', ['după o zi', 'după un an', 'după o oră']], ['În ce anotimp au plantat?', 'primăvara', ['iarna', 'toamna', 'vara']]] }
];
const PROP = ['Ana citește o carte frumoasă.', 'Copiii se joacă în parc.', 'Bunica face plăcinte cu mere.', 'Pisica bea lapte din castron.', 'Mâine mergem la munte cu tata.', 'Fluturele zboară peste flori.', 'Matei aleargă repede în curte.', 'Iarna ninge mult la noi.'];
export const G2X = {
  lectura2() {
    const T = pick(TEXTE), [q, a, w] = pick(T.q);
    return { text: `„${T.t}”\n\n${T.x}\n\n${q}`, ans: a, opts: textOpts(a, w), steps: ['Răspunsul se găsește în text: citește încă o dată propoziția care vorbește despre asta.', `Răspuns: ${a}`] };
  },
  ordoneaza() {
    const ok = pick(PROP), words = ok.replace('.', '').split(' '), low = words.map((w, i) => (i === 0 && !/^[A-ZĂÂÎȘȚ][a-zăâîșț]+$/.test(w) ? w : i === 0 && ['Ana', 'Matei'].includes(w) ? w : i === 0 ? w.toLowerCase() : w));
    const sent = (arr) => { const t = arr.join(' '); return t.charAt(0).toUpperCase() + t.slice(1) + '.'; };
    const wrong = new Set(); for (let k = 0; wrong.size < 3 && k < 40; k++) { const c = sent(shuffle([...low])); if (c !== ok) wrong.add(c); }
    return { text: 'Ordonează cuvintele ca să formezi o propoziție:', expr: shuffle([...low]).join(' / '), ans: ok, opts: textOpts(ok, [...wrong]), steps: ['Întâi: cine face? Apoi: ce face? La sfârșit: unde, cum, ce?', `Propoziția: ${ok}`] };
  },
  sirNumere() {
    const step = pick([1, 2, 5, 10, 100]), start = step === 100 ? rnd(1, 4) * 100 + rnd(0, 9) * 10 : rnd(100, 900), up = Math.random() < 0.7 || start - 4 * step < 0;
    const seq = Array.from({ length: 5 }, (_, i) => start + (up ? 1 : -1) * i * step), miss = rnd(2, 4), ans = seq[miss];
    return { text: `Completează șirul (${up ? 'crescător' : 'descrescător'}, din ${step} în ${step}):`, expr: seq.map((v, i) => (i === miss ? '___' : v)).join(', '), ans, opts: opts(ans, [ans + step, ans - step, ans + 1 === ans + step ? ans + 10 : ans + 1]), steps: [`Fiecare număr e cu ${step} mai ${up ? 'mare' : 'mic'} decât cel dinainte.`, `${seq[miss - 1]} ${up ? '+' : '−'} ${step} = ${ans}`] };
  },
  celMaiMare() {
    let d; do { d = [rnd(1, 9), rnd(0, 9), rnd(0, 9)]; } while (new Set(d).size < 3);
    const P = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].map((p) => p.map((k) => d[k])).filter((p) => p[0] !== 0).map((p) => +p.join(''));
    const xs = shuffle([...new Set(P)]).slice(0, 4), big = Math.random() < 0.5, ans = big ? Math.max(...xs) : Math.min(...xs);
    return { text: `Care este cel mai ${big ? 'MARE' : 'MIC'} număr?`, expr: xs.join(', '), ans, opts: xs, steps: ['Compari întâi sutele; dacă sunt egale, zecile; apoi unitățile.', `Cel mai ${big ? 'mare' : 'mic'}: ${ans}`] };
  },
  descompune() {
    const n = rnd(101, 999), s = Math.floor(n / 100) * 100, z = Math.floor((n % 100) / 10) * 10, u = n % 10, ans = `${s} + ${z} + ${u}`;
    return { text: `Scrie numărul ${n} ca sumă de sute, zeci și unități:`, ans, opts: textOpts(ans, [`${s / 100} + ${z / 10} + ${u}`, `${s} + ${u * 10} + ${z / 10}`, `${s + 100} + ${z} + ${u}`]), steps: [`${n} = ${s / 100} sute + ${z / 10} zeci + ${u} unități`, `= ${ans}`] };
  },
  compSume() {
    const a = rnd(10, 60), b = rnd(5, 39), L = a + b; let c = rnd(30, 99), d; if (Math.random() < 0.3 && L < c) d = c - L; else d = rnd(1, c - 1);
    const R = c - d, ans = L < R ? '<' : L > R ? '>' : '=';
    return { text: 'Ce semn pui între cele două calcule?', expr: `${a} + ${b} ___ ${c} − ${d}`, ans, opts: ['<', '>', '='], steps: [`Calculezi stânga: ${a} + ${b} = ${L}`, `Calculezi dreapta: ${c} − ${d} = ${R}`, `${L} ${ans} ${R}`] };
  },
  proba() {
    if (Math.random() < 0.5) { const a = rnd(100, 700), b = rnd(10, 999 - a), s = a + b, ans = `${s} − ${b} = ${a}`; return { text: `Ai calculat ${a} + ${b} = ${s}. Cum faci proba (verificarea)?`, ans, opts: textOpts(ans, [`${s} + ${b} = ${s + b}`, `${a} − ${b} = ${a - b}`, `${b} + ${b} = ${2 * b}`]), steps: ['Proba adunării se face prin scădere: din sumă scazi un termen și obții celălalt.', ans] }; }
    const a = rnd(200, 999), b = rnd(10, a - 50), d = a - b, ans = `${d} + ${b} = ${a}`; return { text: `Ai calculat ${a} − ${b} = ${d}. Cum faci proba (verificarea)?`, ans, opts: textOpts(ans, [`${d} − ${b} = ${d - b}`, `${a} + ${b} = ${a + b}`, `${d} + ${a} = ${d + a}`]), steps: ['Proba scăderii se face prin adunare: diferența + scăzătorul = descăzutul.', ans] };
  }
};
export const GRADE2B = { ...G2B, ...G2M, ...G2R, ...G2X };
