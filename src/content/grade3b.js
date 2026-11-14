// Restul materiei de clasa a III-a (programa de matematică și comunicare în limba română).
import { rnd, pick, shuffle, opts, textOpts } from './util.js';

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const G3B = {
  numere10k() {
    const t = rnd(0, 3);
    if (t === 0) {
      const m = rnd(1, 9), s = rnd(0, 9), z = rnd(0, 9), u = rnd(0, 9), n = m * 1000 + s * 100 + z * 10 + u;
      return { text: `Ce număr are ${m} mii, ${s} sute, ${z} zeci și ${u} unități?`, ans: n, opts: opts(n, [m * 1000 + z * 100 + s * 10 + u, m * 100 + s * 10 + z, n + 1000]),
        steps: ['Scrii cifrele în ordine: mii, sute, zeci, unități.', `${m} ${s} ${z} ${u} → ${fmt(n)}`] };
    }
    if (t === 1) {
      const n = rnd(1000, 9999), c = String(n), poz = rnd(0, 3), names = ['miilor', 'sutelor', 'zecilor', 'unităților'], d = +c[poz];
      return { text: `Care este cifra ${names[poz]} în numărul ${fmt(n)}?`, ans: d, opts: opts(d, [+c[(poz + 1) % 4], +c[(poz + 3) % 4], d + 1].filter((x) => x <= 9)),
        steps: [`Numără de la dreapta: unități, zeci, sute, mii.`, `În ${fmt(n)}, cifra ${names[poz]} este ${d}.`] };
    }
    if (t === 2) {
      const a = rnd(1000, 9999), b = Math.random() < 0.5 ? a + rnd(1, 900) : a - rnd(1, 900), ans = a < b ? '<' : '>';
      return { text: 'Ce semn pui?', expr: `${fmt(a)} ___ ${fmt(b)}`, ans, opts: ['<', '>', '='], steps: ['Compari pe rând: miile, apoi sutele, apoi zecile, apoi unitățile.', `${fmt(a)} ${ans} ${fmt(b)}`] };
    }
    const n = rnd(1001, 9998), prev = Math.random() < 0.5;
    return { text: `Care este numărul ${prev ? 'dinainte' : 'de după'} lui ${fmt(n)}?`, ans: prev ? n - 1 : n + 1, opts: opts(prev ? n - 1 : n + 1, [prev ? n + 1 : n - 1, n + (prev ? -10 : 10)]),
      steps: [prev ? 'Dinainte = cu 1 mai mic.' : 'De după = cu 1 mai mare.'] };
  },
  rotunjire() {
    const toHundreds = Math.random() < 0.5, n = toHundreds ? rnd(101, 9899) : rnd(11, 989), base = toHundreds ? 100 : 10;
    const r = Math.round(n / base) * base, low = Math.floor(n / base) * base, high = low + base, digit = toHundreds ? Math.floor(n / 10) % 10 : n % 10;
    return { text: `Rotunjește numărul ${n} la ${toHundreds ? 'sute' : 'zeci'}.`, ans: r, opts: opts(r, [r === low ? high : low, n, r + base]),
      steps: [`Se află între ${low} și ${high}.`, `Te uiți la cifra ${toHundreds ? 'zecilor' : 'unităților'}: ${digit}. Dacă e 5 sau mai mare, urci; altfel cobori.`, `${n} → ${r}`] };
  },
  adun10k() {
    if (Math.random() < 0.5) { const a = rnd(1200, 5800), b = rnd(600, 3900), r = a + b; return { text: 'Calculează:', expr: `${fmt(a)} + ${fmt(b)} =`, ans: r, opts: opts(r, [r - 10, r + 100, r - 1000]), steps: ['Aduni în coloană: unități, zeci, sute, mii. Ce trece de 10 ții minte.', `${fmt(a)} + ${fmt(b)} = ${fmt(r)}`] }; }
    const a = rnd(3000, 9900), b = rnd(700, a - 500), r = a - b;
    return { text: 'Calculează:', expr: `${fmt(a)} − ${fmt(b)} =`, ans: r, opts: opts(r, [r + 10, r - 100, r + 1000]), steps: ['Scazi în coloană; când nu ajunge, împrumuți 1 de la vecinul din stânga.', `${fmt(a)} − ${fmt(b)} = ${fmt(r)}`, `Verificare: ${fmt(r)} + ${fmt(b)} = ${fmt(a)} ✔`] };
  },
  inm() {
    const t = rnd(0, 2);
    if (t === 0) { const a = rnd(12, 49), b = rnd(2, 9), r = a * b, z = Math.floor(a / 10) * 10, u = a % 10; return { text: 'Calculează:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [z * b + u, r + b, a + b]), steps: [`Desfaci ${a} = ${z} + ${u}`, `${z} × ${b} = ${z * b} și ${u} × ${b} = ${u * b}`, `${z * b} + ${u * b} = ${r}`] }; }
    if (t === 1) { const a = rnd(2, 99), b = pick([10, 100]), r = a * b; return { text: 'Calculează:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [a * (b === 10 ? 100 : 10), a + b, r + 1]), steps: [`La înmulțirea cu ${b} adaugi ${b === 10 ? 'un zero' : 'două zerouri'} la sfârșit.`, `${a} × ${b} = ${r}`] }; }
    const a = rnd(2, 99), b = pick([0, 1]); return { text: 'Calculează:', expr: `${a} × ${b} =`, ans: a * b, opts: opts(a * b, [b ? 1 : a, a + b, 0 === a * b ? a : 0]), steps: [b ? 'Orice număr înmulțit cu 1 rămâne la fel.' : 'Orice număr înmulțit cu 0 dă 0.'] };
  },
  impRest() {
    const d = rnd(2, 9), q = rnd(2, 9), r = rnd(1, d - 1), a = d * q + r;
    return { text: `${a} : ${d} = ? rest ?`, ans: `${q} rest ${r}`, opts: textOpts(`${q} rest ${r}`, [`${q + 1} rest ${r}`, `${q} rest ${r + d}`, `${q - 1} rest ${r + d}`]),
      steps: [`Cel mai mare număr din tabla lui ${d} care încape în ${a}: ${d} × ${q} = ${d * q}`, `Restul: ${a} − ${d * q} = ${r}`, `Restul (${r}) trebuie să fie mai mic decât ${d} ✔`],
      hints: ['Restul e mereu mai mic decât împărțitorul.'] };
  },
  sumadif() { // suma și diferența (metoda figurativă)
    const small = rnd(10, 60), dif = rnd(4, 30), big = small + dif, S = big + small, n1 = pick(['Ana', 'Matei', 'Ioana']), n2 = pick(['Radu', 'Elena', 'Vlad']), obj = pick(['nuci', 'timbre', 'mere']);
    const askBig = Math.random() < 0.5, ans = askBig ? big : small;
    return { text: `${n1} și ${n2} au împreună ${S} ${obj}. ${n1} are cu ${dif} mai multe decât ${n2}. Câte ${obj} are ${askBig ? n1 : n2}?`, ans, opts: opts(ans, [S - dif, Math.round(S / 2), askBig ? small : big, S + dif]),
      steps: [`Desenezi: banda lui ${n2} și banda lui ${n1}, mai lungă cu ${dif}.`, `Scoți bucata în plus: ${S} − ${dif} = ${S - dif} (acum benzile sunt egale)`, `O bandă: ${S - dif} : 2 = ${small} (${n2})`, `${n1}: ${small} + ${dif} = ${big}`],
      hints: ['Taie bucata în plus, ca benzile să fie egale.'] };
  },
  sumacat() { // suma și câtul („de atâtea ori mai mult”)
    const small = rnd(4, 20), k = rnd(2, 5), big = small * k, S = small + big;
    return { text: `Într-o cutie sunt de ${k} ori mai multe bile roșii decât albastre. În total sunt ${S} de bile. Câte bile albastre sunt?`, ans: small, opts: opts(small, [big, Math.round(S / k), S - k]),
      steps: [`Albastre = 1 parte, roșii = ${k} părți. Împreună: ${k + 1} părți.`, `O parte: ${S} : ${k + 1} = ${small}`, `Albastre: ${small}, roșii: ${small} × ${k} = ${big}`], hints: ['Numără câte părți egale sunt în total.'] };
  },
  masuri3() {
    const Q = [
      () => { const m = rnd(2, 9); return [`${m} m = ? cm`, m * 100, [m * 10, m * 1000], `1 m = 100 cm → ${m} × 100 = ${m * 100}`]; },
      () => { const k = rnd(2, 9); return [`${k} km = ? m`, k * 1000, [k * 100, k * 10], `1 km = 1.000 m → ${k} × 1.000 = ${k * 1000}`]; },
      () => { const k = rnd(2, 9); return [`${k} kg = ? g`, k * 1000, [k * 100, k * 10], `1 kg = 1.000 g → ${k} × 1.000 = ${k * 1000}`]; },
      () => { const l = rnd(2, 9); return [`${l} l = ? ml`, l * 1000, [l * 100, l * 10], `1 l = 1.000 ml → ${l} × 1.000 = ${l * 1000}`]; },
      () => { const d = rnd(2, 9); return [`${d} dm = ? cm`, d * 10, [d * 100, d], `1 dm = 10 cm → ${d} × 10 = ${d * 10}`]; },
      () => { const l = rnd(2, 9); return [`${l} lei = ? bani`, l * 100, [l * 10, l * 1000], `1 leu = 100 de bani → ${l} × 100 = ${l * 100}`]; },
      () => { const h = rnd(2, 5); return [`${h} ore = ? minute`, h * 60, [h * 100, h * 30], `1 oră = 60 de minute → ${h} × 60 = ${h * 60}`]; },
      () => ['Câți ani are un deceniu?', 10, [100, 12], 'Un deceniu = 10 ani.'],
      () => ['Câți ani are un secol?', 100, [10, 1000], 'Un secol = 100 de ani.'],
      () => { const z = rnd(2, 4); return [`Câte zile au ${z} săptămâni?`, z * 7, [z * 5, z * 10], `${z} × 7 = ${z * 7}`]; }
    ];
    const [t, a, w, s] = pick(Q)();
    return { text: 'Transformă:', expr: t, ans: a, opts: opts(a, w), steps: [s] };
  },
  perimetru() {
    const t = rnd(0, 2);
    if (t === 0) { const l = rnd(2, 15), r = 4 * l; return { text: `Un pătrat are latura de ${l} cm. Care este perimetrul lui (în cm)?`, ans: r, opts: opts(r, [l * l, 2 * l, r + 4]), steps: ['Perimetrul = suma tuturor laturilor.', 'Pătratul are 4 laturi egale.', `${l} + ${l} + ${l} + ${l} = 4 × ${l} = ${r} cm`] }; }
    if (t === 1) { const L = rnd(5, 20), l = rnd(2, L - 1), r = 2 * (L + l); return { text: `Un dreptunghi are lungimea de ${L} cm și lățimea de ${l} cm. Care este perimetrul (în cm)?`, ans: r, opts: opts(r, [L + l, L * l, r + 2]), steps: ['Perimetrul = suma tuturor laturilor.', `Dreptunghiul are 2 lungimi și 2 lățimi: ${L} + ${l} + ${L} + ${l}`, `= ${r} cm`] }; }
    const a = rnd(3, 12), b = rnd(3, 12), c = rnd(Math.abs(a - b) + 1, a + b - 1), r = a + b + c;
    return { text: `Un triunghi are laturile de ${a} cm, ${b} cm și ${c} cm. Care este perimetrul (în cm)?`, ans: r, opts: opts(r, [a + b, r - c, r + 1]), steps: ['Perimetrul = suma laturilor.', `${a} + ${b} + ${c} = ${r} cm`] };
  },
  romane() {
    const toR = (n) => [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']].reduce((s, [v, ch]) => { while (n >= v) { s += ch; n -= v; } return s; }, '');
    const n = rnd(1, 50), r = toR(n);
    if (Math.random() < 0.5) return { text: 'Ce număr este scris cu cifre romane?', expr: r, ans: n, opts: opts(n, [n + 2, n - 2 > 0 ? n - 2 : n + 4, n + 10]), steps: ['I = 1, V = 5, X = 10, L = 50.', 'Un semn mai mic pus ÎNAINTE de unul mai mare se scade (IV = 4, IX = 9); pus DUPĂ se adună (VI = 6).', `${r} = ${n}`] };
    return { text: `Cum scrii ${n} cu cifre romane?`, ans: r, opts: textOpts(r, [toR(n + 1), toR(Math.max(1, n - 1)), r.split('').reverse().join('')]), steps: ['I = 1, V = 5, X = 10, L = 50.', `${n} = ${r}`] };
  },
  sinonime() {
    const S = [['frumos', 'drăguț', 'urât'], ['bucuros', 'vesel', 'trist'], ['repede', 'iute', 'încet'], ['mare', 'uriaș', 'mic'], ['harnic', 'muncitor', 'leneș'], ['curajos', 'viteaz', 'fricos'], ['a începe', 'a porni', 'a termina'], ['a vorbi', 'a spune', 'a tăcea'], ['cald', 'fierbinte', 'rece'], ['curat', 'îngrijit', 'murdar']];
    const [w, sin, ant] = pick(S), askSin = Math.random() < 0.5, ans = askSin ? sin : ant, other = S.filter((x) => x[0] !== w).map((x) => x[1]);
    return { text: `Care este ${askSin ? 'sinonimul (are același înțeles)' : 'antonimul (are înțeles opus)'} cuvântului?`, expr: w, ans, opts: textOpts(ans, [askSin ? ant : sin, pick(other), w]),
      steps: [askSin ? `Sinonime = cuvinte cu același înțeles: ${w} = ${sin}.` : `Antonime = cuvinte cu înțeles opus: ${w} ≠ ${ant}.`] };
  },
  substantiv() {
    const t = rnd(0, 1);
    if (t === 0) { const L = [['Brașov', 'propriu'], ['oraș', 'comun'], ['Luca', 'propriu'], ['băiat', 'comun'], ['Dunărea', 'propriu'], ['râu', 'comun'], ['Grivei', 'propriu'], ['câine', 'comun'], ['România', 'propriu'], ['țară', 'comun']]; const [w, a] = pick(L);
      return { text: 'Ce fel de substantiv este?', expr: w, ans: a, opts: ['comun', 'propriu'], steps: [a === 'propriu' ? 'Substantivul propriu e numele unei anumite ființe sau al unui loc și se scrie cu literă mare.' : 'Substantivul comun denumește orice ființă sau lucru de același fel și se scrie cu literă mică.'] }; }
    const L = [['copii', 'plural'], ['carte', 'singular'], ['flori', 'plural'], ['munte', 'singular'], ['mere', 'plural'], ['elev', 'singular'], ['păsări', 'plural'], ['casă', 'singular']]; const [w, a] = pick(L);
    return { text: 'La ce număr este substantivul?', expr: w, ans: a, opts: ['singular', 'plural'], steps: [a === 'plural' ? 'Plural = mai multe ființe sau lucruri.' : 'Singular = o singură ființă sau un singur lucru.'] };
  },
  propozitie() {
    const L = [['Ce ai mâncat azi?', 'interogativă'], ['Afară plouă.', 'enunțiativă'], ['Ce frumos cântă!', 'exclamativă'], ['Unde mergi?', 'interogativă'], ['Am o pisică.', 'enunțiativă'], ['Ura, e vacanță!', 'exclamativă']];
    if (Math.random() < 0.65) { const [p, a] = pick(L); return { text: 'Ce fel de propoziție este, după scopul comunicării?', expr: p, ans: a, opts: ['enunțiativă', 'interogativă', 'exclamativă'], steps: [{ enunțiativă: 'Enunțiativă: comunică ceva, se termină cu punct.', interogativă: 'Interogativă: întreabă ceva, se termină cu semnul întrebării.', exclamativă: 'Exclamativă: arată emoție, se termină cu semnul exclamării.' }[a]] }; }
    return { text: 'Cu ce semn începi replica unui personaj în dialog?', ans: 'linia de dialog (—)', opts: textOpts('linia de dialog (—)', ['virgula (,)', 'punctul (.)', 'ghilimelele („”)']), steps: ['În dialog, fiecare replică începe pe rând nou, cu linia de dialog: — Bună!'] };
  }
};
