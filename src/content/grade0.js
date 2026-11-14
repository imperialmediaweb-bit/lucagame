// Clasa pregătitoare: numere 0–31, numărare, adunări și scăderi până la 10, forme, sunete și silabe, rime.
import { rnd, pick, opts, textOpts } from './util.js';

export const G0 = {
  numarare() {
    const n = rnd(2, 15), sym = pick(['●', '★', '■', '▲', '♥']);
    return { text: 'Câte sunt?', expr: Array(n).fill(sym).join(' '), ans: n, opts: opts(n, [n + 1, n - 1, n + 2]), steps: ['Numără-le cu degetul, pe rând, de la stânga la dreapta.', `Sunt ${n}.`] };
  },
  vecini31() {
    const n = rnd(1, 30), after = Math.random() < 0.5, ans = after ? n + 1 : n - 1;
    return { text: `Ce număr vine ${after ? 'după' : 'înainte de'} ${n}?`, ans, opts: opts(ans, [after ? n - 1 : n + 1, n, ans + 2]), steps: [after ? `Numeri mai departe: ${n}, ${n + 1}` : `Numeri înapoi: ${n}, ${n - 1}`] };
  },
  compara10() {
    const a = rnd(0, 20), b = rnd(0, 20), ans = a > b ? a : b;
    if (a === b) return G0.compara10();
    return { text: 'Care număr este mai mare?', expr: `${a}   sau   ${b}`, ans, opts: textOpts(ans, [a === ans ? b : a]).map(Number), steps: [`${ans} vine mai târziu când numeri, deci e mai mare.`] };
  },
  adun10() {
    const a = rnd(0, 9), b = rnd(0, 10 - a), r = a + b;
    return { text: 'Câte sunt împreună?', expr: `${'●'.repeat(a)} + ${'●'.repeat(b)}   (${a} + ${b})`, ans: r, opts: opts(r, [r + 1, r - 1, Math.abs(a - b)]), steps: [`Pornești de la ${a} și mai numeri ${b}: ${a} + ${b} = ${r}`] };
  },
  scad10() {
    const a = rnd(2, 10), b = rnd(1, a), r = a - b;
    return { text: `Aveai ${a} baloane. ${b} au zburat. Câte au rămas?`, expr: `${a} − ${b}`, ans: r, opts: opts(r, [r + 1, a + b, b]), steps: ['„Au zburat” înseamnă că sunt mai puține: scădem.', `${a} − ${b} = ${r}`] };
  },
  forme() {
    const F = [['Are 3 laturi și 3 colțuri.', 'triunghi'], ['Are 4 laturi egale.', 'pătrat'], ['E rotund, nu are colțuri.', 'cerc'], ['Are 4 laturi: două lungi și două scurte.', 'dreptunghi']];
    const [d, a] = pick(F);
    return { text: 'Ce formă este?', expr: d, ans: a, opts: ['triunghi', 'pătrat', 'cerc', 'dreptunghi'], steps: [`${d} → ${a}`] };
  },
  sunetInitial() {
    const W = ['măr', 'pisică', 'soare', 'casă', 'lună', 'ac', 'urs', 'elefant', 'iepure', 'oaie', 'nas', 'roată', 'tren', 'barcă', 'fluture', 'gâscă', 'vulpe', 'dinozaur'];
    const w = pick(W), a = w[0].toUpperCase(), pool = ['A', 'M', 'S', 'P', 'R', 'T', 'O', 'E', 'L', 'B', 'C', 'D'].filter((x) => x !== a);
    const wrong = []; while (wrong.length < 3) { const x = pick(pool); if (!wrong.includes(x)) wrong.push(x); }
    return { text: 'Cu ce sunet începe cuvântul?', expr: w, ans: a, opts: textOpts(a, wrong), steps: [`Spune rar: ${w[0]}… ${w}. Primul sunet este ${a}.`] };
  },
  rima() {
    const R = [['pisică', 'furnică', ['câine', 'casă']], ['soare', 'floare', ['lună', 'nor']], ['carte', 'parte', ['caiet', 'pix']], ['minge', 'ninge', ['joacă', 'casă']], ['școală', 'cerneală', ['bancă', 'tablă']], ['ploaie', 'baie', ['nor', 'vânt']], ['urs', 'curs', ['lup', 'vulpe']], ['mare', 'zare', ['val', 'nisip']]];
    const [w, a, wr] = pick(R);
    return { text: 'Care cuvânt rimează cu…', expr: w, ans: a, opts: textOpts(a, wr), steps: [`${w} – ${a}: se termină la fel.`] };
  }
};
