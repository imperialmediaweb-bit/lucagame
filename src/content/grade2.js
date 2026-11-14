// Clasa a II-a: până la 1000 cu trecere, tabla înmulțirii, împărțirea, „cu atât mai mult/puțin”, măsurători, ortograme, punctuație.
import { rnd, pick, opts, textOpts } from './util.js';

export const G2 = {
  adun1000() {
    if (Math.random() < 0.5) {
      const a = rnd(120, 650), b = rnd(80, 340), r = a + b;
      return { text: 'Calculează:', expr: `${a} + ${b} =`, ans: r, opts: opts(r, [r - 10, r + 10, r - 100]),
        steps: ['Aduni pe rând: unitățile, zecile, sutele. Dacă trec de 10, ții 1 minte.', `${a} + ${b} = ${r}`] };
    }
    const a = rnd(300, 990), b = rnd(80, a - 50), r = a - b;
    return { text: 'Calculează:', expr: `${a} − ${b} =`, ans: r, opts: opts(r, [r + 10, r - 10, r + 100]),
      steps: ['Scazi pe rând: unitățile, zecile, sutele. Dacă nu ajunge, împrumuți 1 de la vecin.', `${a} − ${b} = ${r}`, `Verificare: ${r} + ${b} = ${a} ✔`] };
  },
  tabla() {
    const a = rnd(2, 10), b = rnd(2, 10), r = a * b;
    return { text: 'Tabla înmulțirii:', expr: `${a} × ${b} =`, ans: r, opts: opts(r, [a + b, r + a, r - b, (a + 1) * b]),
      steps: [`${a} × ${b} înseamnă ${b} grupe a câte ${a}`, `${Array(Math.min(b, 6)).fill(a).join(' + ')}${b > 6 ? ' + …' : ''} = ${r}`],
      hints: [b > a ? `Inversează: ${b} × ${a} e la fel și poate e mai ușor.` : `Pornește de la ${a} × ${b - 1} = ${a * (b - 1)} și mai adaugă ${a}.`] };
  },
  imp() {
    const b = rnd(2, 10), q = rnd(2, 10), a = b * q;
    return { text: 'Împarte:', expr: `${a} : ${b} =`, ans: q, opts: opts(q, [a - b, q + 1, b]),
      steps: [`Întreabă-te: ce număr înmulțit cu ${b} dă ${a}?`, `${b} × ${q} = ${a}, deci ${a} : ${b} = ${q}`] };
  },
  maimult() {
    const n1 = pick(['Andrei', 'Sara', 'Vlad', 'Elena']), n2 = pick(['Mihai', 'Irina', 'Luca', 'Bianca']);
    const obj = pick(['timbre', 'nuci', 'cărți', 'abțibilduri']), a = rnd(20, 80), b = rnd(5, 19);
    if (Math.random() < 0.5) {
      const r = a + b;
      return { text: `${n1} are ${a} ${obj}. ${n2} are cu ${b} mai multe. Câte ${obj} are ${n2}?`, ans: r, opts: opts(r, [a - b, r + 1, a]),
        steps: ['„cu … mai multe” înseamnă că adunăm.', `${a} + ${b} = ${r}`] };
    }
    const r = a - b;
    return { text: `${n1} are ${a} ${obj}. ${n2} are cu ${b} mai puține. Câte ${obj} are ${n2}?`, ans: r, opts: opts(r, [a + b, r - 1, b]),
      steps: ['„cu … mai puține” înseamnă că scădem.', `${a} − ${b} = ${r}`] };
  },
  masuri() {
    const Q = [
      () => { const m = rnd(1, 5); return [`Câți centimetri are ${m} ${m === 1 ? 'metru' : 'metri'}?`, m * 100, [m * 10, m * 1000, m], `1 m = 100 cm, deci ${m} m = ${m * 100} cm`]; },
      () => { const h = rnd(1, 3); return [`Câte minute are ${h} ${h === 1 ? 'oră' : 'ore'}?`, h * 60, [h * 100, h * 30, h * 24], `1 oră = 60 de minute, deci ${h} × 60 = ${h * 60}`]; },
      () => { const w = rnd(1, 4); return [`Câte zile au ${w} ${w === 1 ? 'săptămână' : 'săptămâni'}?`, w * 7, [w * 5, w * 10, w * 30], `O săptămână are 7 zile: ${w} × 7 = ${w * 7}`]; },
      () => ['Câte luni are un an?', 12, [10, 7, 52], 'Un an are 12 luni.'],
      () => { const k = rnd(2, 9); return [`Ai ${k} sticle de câte 1 litru. Câți litri ai?`, k, [k + 1, k * 10, k - 1], `${k} × 1 l = ${k} l`]; }
    ];
    const [t, a, w, s] = pick(Q)();
    return { text: t, ans: a, opts: opts(a, w), steps: [s] };
  },
  orto() {
    const L = [
      ['Mama ___ dus la piață.', 's-a', ['sa'], '„s-a” arată o acțiune: s-a dus (se duce). „sa” înseamnă „a ei / a lui”.'],
      ['Și-a luat cartea ___.', 'sa', ['s-a'], '„cartea sa” = cartea lui. Nu e o acțiune, deci „sa”.'],
      ['Copiii ___ jucat în parc.', 's-au', ['sau'], '„s-au jucat” e o acțiune (se joacă). „sau” înseamnă „ori”.'],
      ['Vrei mere ___ pere?', 'sau', ['s-au'], '„sau” = „ori”: mere ori pere.'],
      ['Elevii ___ așezat în bănci.', 's-au', ['sau'], 'Acțiune făcută de mai mulți: s-au așezat.'],
      ['Am intrat ___ cameră mare.', 'într-o', ['intr-o', 'într o'], '„într-o” = în + o, cu cratimă.'],
      ['A ieșit ___ pădure.', 'dintr-o', ['din tr-o', 'dintr o'], '„dintr-o” = din + o, cu cratimă.'],
      ['Tata ___ dat un măr.', 'i-a', ['ia'], '„i-a dat” = lui i-a dat. „ia” e de la „a lua”.'],
      ['___ cartea de pe masă!', 'Ia', ['I-a'], 'Aici e „a lua”: Ia cartea!'],
      ['Ea ___ uitat pe geam.', 's-a', ['sa'], '„s-a uitat” e o acțiune (se uită).'],
      ['Sora ___ e mică.', 'sa', ['s-a'], '„sora sa” = sora lui.'],
      ['Cine ___ spus asta?', 'ți-a', ['ția'], '„ți-a spus” = ție ți-a spus, cu cratimă.'],
      ['Mergem la mare ___ la munte?', 'sau', ['s-au'], '„sau” = „ori”.']
    ];
    const [t, a, w, why] = pick(L);
    return { text: 'Alege forma corectă:', expr: t, ans: a, opts: textOpts(a, w), steps: [why],
      hints: ['Truc: dacă poți spune „se” (se duce, se joacă), scrii cu cratimă.'] };
  },
  punct() {
    const L = [['Ce faci mâine', '?', 'Este o întrebare, deci pui semnul întrebării.'], ['Ce frumos e afară', '!', 'Arată mirare, bucurie, deci semnul exclamării.'],
      ['Eu merg la școală', '.', 'Spune ceva simplu, deci punct.'], ['Unde este mingea mea', '?', 'Este o întrebare.'],
      ['Vino repede aici', '!', 'E o poruncă, se pune semnul exclamării.'], ['Pisica doarme pe canapea', '.', 'Comunică un lucru, deci punct.'],
      ['Câți ani ai', '?', 'Este o întrebare.'], ['Ura, am câștigat', '!', 'Arată bucurie.']];
    const [t, a, s] = pick(L);
    return { text: 'Ce semn pui la sfârșit?', expr: t + ' ___', ans: a, opts: ['.', '?', '!'], steps: [s] };
  }
};
