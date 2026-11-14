// Clasa a IV-a: numere până la 1.000.000, operații mari, înmulțire cu 2 cifre, împărțire, fracții, măsuri, corpuri,
// metoda falsei ipoteze; română: verbul (timpul), pronumele, numeralul, acordul adjectivului, omonime, tipuri de text.
import { rnd, pick, opts, textOpts } from './util.js';

const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export const G4 = {
  numere1m() {
    const t = rnd(0, 2);
    if (t === 0) { const n = rnd(10000, 999999), s = String(n), pos = rnd(0, s.length - 1), names = ['unităților', 'zecilor', 'sutelor', 'unităților de mii', 'zecilor de mii', 'sutelor de mii'], idx = s.length - 1 - pos, d = +s[pos];
      return { text: `Care este cifra ${names[idx]} în ${fmt(n)}?`, ans: d, opts: opts(d, [+s[(pos + 1) % s.length], +s[(pos + s.length - 1) % s.length], (d + 1) % 10]), steps: ['Numără de la dreapta: unități, zeci, sute, unități de mii, zeci de mii, sute de mii.', `Cifra ${names[idx]} este ${d}.`] }; }
    if (t === 1) { const n = rnd(1000, 999499), b = pick([1000, 10000, 100000]), r = Math.round(n / b) * b;
      return { text: `Rotunjește ${fmt(n)} la ${{ 1000: 'mii', 10000: 'zeci de mii', 100000: 'sute de mii' }[b]}.`, ans: r, opts: opts(r, [Math.floor(n / b) * b === r ? r + b : r - b, n, r + b / 10]), steps: ['Te uiți la cifra din dreapta poziției: 5 sau mai mare → urci, altfel cobori.', `${fmt(n)} ≈ ${fmt(r)}`] }; }
    const a = rnd(100000, 999999), b = Math.random() < 0.5 ? a + rnd(1, 50000) : a - rnd(1, 50000), ans = a < b ? '<' : '>';
    return { text: 'Ce semn pui?', expr: `${fmt(a)} ___ ${fmt(b)}`, ans, opts: ['<', '>', '='], steps: ['Compari cifră cu cifră, de la stânga.', `${fmt(a)} ${ans} ${fmt(b)}`] };
  },
  calc1m() {
    if (Math.random() < 0.5) { const a = rnd(12000, 480000), b = rnd(5000, 390000), r = a + b; return { text: 'Calculează:', expr: `${fmt(a)} + ${fmt(b)} =`, ans: r, opts: opts(r, [r - 1000, r + 10, r + 100000]), steps: ['Aduni în coloană, de la unități spre stânga, ținând minte trecerea.', `${fmt(a)} + ${fmt(b)} = ${fmt(r)}`] }; }
    const a = rnd(100000, 990000), b = rnd(10000, a - 1000), r = a - b; return { text: 'Calculează:', expr: `${fmt(a)} − ${fmt(b)} =`, ans: r, opts: opts(r, [r + 1000, r - 10, r + 100000]), steps: ['Scazi în coloană; împrumuți de la vecin când nu ajunge.', `${fmt(a)} − ${fmt(b)} = ${fmt(r)}`, `Verificare: ${fmt(r)} + ${fmt(b)} = ${fmt(a)} ✔`] };
  },
  inm2c() {
    const a = rnd(12, 98), b = rnd(11, 39), r = a * b, z = Math.floor(b / 10) * 10, u = b % 10;
    return { text: 'Calculează:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [a * z + u, a * u + z, r + a]), steps: [`Desfaci ${b} = ${z} + ${u}`, `${a} × ${z} = ${a * z}`, `${a} × ${u} = ${a * u}`, `${a * z} + ${a * u} = ${r}`] };
  },
  imp1c() {
    const d = rnd(2, 9), q = rnd(21, 199), withRest = Math.random() < 0.4, r = withRest ? rnd(1, d - 1) : 0, a = d * q + r;
    const ans = withRest ? `${q} rest ${r}` : q;
    return { text: 'Împarte:', expr: `${a} : ${d} =`, ans, opts: withRest ? textOpts(ans, [`${q + 1} rest ${r}`, `${q} rest ${r + d}`, `${q - 1} rest ${r}`]) : opts(q, [q + 1, q - 10, q + 10]),
      steps: ['Împarți pe rând, de la stânga: sutele, zecile, unitățile.', `${d} × ${q} = ${d * q}${withRest ? `, rest ${a} − ${d * q} = ${r}` : ''}`, `Verificare: ${d} × ${q}${withRest ? ' + ' + r : ''} = ${a} ✔`] };
  },
  fractiiIV() {
    const t = rnd(0, 2);
    if (t === 0) { const d = pick([4, 5, 6, 8, 10]), k = rnd(2, d - 1), q = rnd(2, 9), n = d * q, r = k * q; return { text: `Cât înseamnă ${k}/${d} din ${n}?`, ans: r, opts: opts(r, [q, n / k > 0 && Number.isInteger(n / k) ? n / k : r + q, r + k]), steps: [`Întâi o parte: ${n} : ${d} = ${q}`, `Apoi ${k} părți: ${q} × ${k} = ${r}`] }; }
    if (t === 1) { const d = pick([5, 6, 7, 8, 9]), a = rnd(1, d - 1); let b = rnd(1, d - 1); while (b === a) b = rnd(1, d - 1); const ans = a > b ? `${a}/${d}` : `${b}/${d}`;
      return { text: 'Care fracție este mai mare?', expr: `${a}/${d}   sau   ${b}/${d}`, ans, opts: textOpts(ans, [a > b ? `${b}/${d}` : `${a}/${d}`]), steps: ['Când numitorul e același, felii la fel de mari: câștigă cine are mai multe felii (numărătorul mai mare).'] }; }
    const k = pick([2, 3, 4]), d = pick([2, 3, 4, 5]), a = rnd(1, d - 1), ans = `${a * k}/${d * k}`;
    return { text: `Care fracție este egală cu ${a}/${d}?`, ans, opts: textOpts(ans, [`${a + k}/${d + k}`, `${a * k}/${d}`, `${a}/${d * k}`]), steps: [`Înmulțești și sus, și jos cu același număr (${k}): ${a}/${d} = ${ans}`] };
  },
  masuriIV() {
    const Q = [
      () => { const k = rnd(2, 9); return [`${k} km = ? m`, k * 1000, [k * 100, k * 10000], '1 km = 1.000 m']; },
      () => { const m = rnd(2, 9); return [`${m} m = ? mm`, m * 1000, [m * 100, m * 10], '1 m = 1.000 mm']; },
      () => { const t = rnd(2, 9); return [`${t} t = ? kg`, t * 1000, [t * 100, t * 10], '1 tonă = 1.000 kg']; },
      () => { const h = rnd(2, 9); return [`${h} hl = ? l`, h * 100, [h * 10, h * 1000], '1 hectolitru = 100 l']; },
      () => { const s = rnd(2, 9); return [`${s} secole = ? ani`, s * 100, [s * 10, s * 1000], '1 secol = 100 de ani']; },
      () => { const m = rnd(2, 9); return [`${m} minute = ? secunde`, m * 60, [m * 100, m * 30], '1 minut = 60 de secunde']; },
      () => ['Câte zile are un an obișnuit?', 365, [366, 360, 300], 'Un an are 365 de zile (366 în anul bisect).']
    ];
    const [t, a, w, s] = pick(Q)();
    return { text: 'Transformă:', expr: t, ans: a, opts: opts(a, w), steps: [s, `Deci ${t.replace('?', a)}`] };
  },
  corpuri() {
    const C = [['cub', 6, 'Cubul are 6 fețe, toate pătrate.'], ['cuboid', 6, 'Cuboidul (ca o cutie de pantofi) are 6 fețe dreptunghiulare.'], ['piramidă cu baza pătrat', 5, 'Baza pătrată + 4 fețe triunghiulare = 5 fețe.']];
    if (Math.random() < 0.5) { const [n, f, s] = pick(C); return { text: `Câte fețe are un ${n}?`, ans: f, opts: opts(f, [f + 2, 4, 8]), steps: [s] }; }
    const O = [['minge', 'sferă'], ['cutie de pantofi', 'cuboid'], ['zar', 'cub'], ['conserva', 'cilindru'], ['cornet de înghețată', 'con']];
    const [o, a] = pick(O);
    return { text: 'Ce formă are obiectul?', expr: o, ans: a, opts: textOpts(a, ['sferă', 'cub', 'cuboid', 'cilindru', 'con'].filter((x) => x !== a).slice(0, 3)), steps: [`${o} → ${a}`] };
  },
  ipoteza() { // metoda falsei ipoteze
    const iep = rnd(2, 12), gai = rnd(2, 12), cap = iep + gai, pic = iep * 4 + gai * 2;
    return { text: `În curte sunt găini și iepuri: ${cap} capete și ${pic} de picioare. Câți iepuri sunt?`, ans: iep, opts: opts(iep, [gai, cap / 2 === Math.floor(cap / 2) ? cap / 2 : iep + 1, iep + 2]),
      steps: [`Presupunem că toți ar fi găini: ${cap} × 2 = ${cap * 2} picioare.`, `Lipsesc ${pic} − ${cap * 2} = ${pic - cap * 2} picioare.`, `Fiecare iepure are cu 2 picioare mai mult: ${pic - cap * 2} : 2 = ${iep} iepuri.`, `Găini: ${cap} − ${iep} = ${gai}`], hints: ['Presupune că toate animalele sunt găini și vezi câte picioare lipsesc.'] };
  },
  verbTimp() {
    const V = [['citesc', 'prezent'], ['am citit', 'trecut'], ['voi citi', 'viitor'], ['aleargă', 'prezent'], ['a alergat', 'trecut'], ['vom merge', 'viitor'], ['scriem', 'prezent'], ['ați scris', 'trecut'], ['o să cânte', 'viitor'], ['am mâncat', 'trecut']];
    const [v, a] = pick(V);
    return { text: 'La ce timp este verbul?', expr: v, ans: a, opts: ['prezent', 'trecut', 'viitor'], steps: [{ prezent: 'Prezent: acțiunea se petrece acum.', trecut: 'Trecut: acțiunea s-a petrecut deja.', viitor: 'Viitor: acțiunea se va petrece.' }[a]] };
  },
  pronume() {
    const P = [['eu', 'I'], ['tu', 'a II-a'], ['el', 'a III-a'], ['noi', 'I'], ['voi', 'a II-a'], ['ei', 'a III-a'], ['ea', 'a III-a'], ['ele', 'a III-a']];
    const [p, a] = pick(P);
    return { text: 'La ce persoană este pronumele personal?', expr: p, ans: `persoana ${a}`, opts: ['persoana I', 'persoana a II-a', 'persoana a III-a'], steps: ['Persoana I: cine vorbește (eu, noi). A II-a: cu cine vorbim (tu, voi). A III-a: despre cine vorbim (el, ea, ei, ele).'] };
  },
  numeral() {
    const N = [['Am trei mere.', 'trei'], ['Este al doilea în clasament.', 'al doilea'], ['Am citit cinci cărți.', 'cinci'], ['A sosit primul.', 'primul'], ['Avem două pisici.', 'două']];
    const [p, a] = pick(N), words = p.replace(/[.,]/g, '').split(' ').filter((w) => w !== a && w.length > 2);
    return { text: 'Care este numeralul din propoziție?', expr: p, ans: a, opts: textOpts(a, words.slice(0, 3)), steps: ['Numeralul arată un număr sau ordinea (câți? al câtelea?).', `Numeralul: ${a}`] };
  },
  acordAdj() {
    const A = [['Florile sunt ___.', 'frumoase', ['frumoasă', 'frumos']], ['Băiatul este ___.', 'harnic', ['harnici', 'harnică']], ['Fetele sunt ___.', 'vesele', ['vesel', 'veselă']], ['Mărul este ___.', 'roșu', ['roșii', 'roșie']], ['Cărțile sunt ___.', 'noi', ['nouă', 'nou']]];
    const [t, a, w] = pick(A);
    return { text: 'Alege forma corectă a adjectivului:', expr: t, ans: a, opts: textOpts(a, w), steps: ['Adjectivul se acordă cu substantivul: la fel ca număr (singular/plural) și gen.', t.replace('___', a)] };
  },
  omonime() {
    const O = [['broască', 'animal / încuietoare'], ['lac', 'apă / vopsea'], ['ochi', 'organ al vederii / ochi de geam'], ['toc', 'de pantof / de stilou'], ['mină', 'de creion / de cărbune'], ['bancă', 'de școală / unde ții banii']];
    const [w, s] = pick(O), other = O.filter((x) => x[0] !== w);
    return { text: 'Ce înțelesuri poate avea cuvântul?', expr: w, ans: s, opts: textOpts(s, other.slice(0, 2).map((x) => x[1]).concat(['are un singur înțeles'])), steps: ['Omonimele se scriu și se pronunță la fel, dar au înțelesuri diferite.', `${w}: ${s}`] };
  },
  textTip() {
    const T = [['Povestește o întâmplare, cu personaje și acțiune.', 'narativ'], ['Arată cum arată un loc, o persoană sau un obiect.', 'descriptiv'], ['Dă informații, ca un afiș sau o rețetă.', 'informativ'], ['Este scris în versuri, cu rimă.', 'poezie']];
    const [d, a] = pick(T);
    return { text: 'Ce fel de text este?', expr: d, ans: a, opts: ['narativ', 'descriptiv', 'informativ', 'poezie'], steps: [`${d} → text ${a}`] };
  }
};
