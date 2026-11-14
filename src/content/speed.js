// Exerciții scurte pentru portalurile de viteză (fuga de monștri). Fiecare portal are timpul lui pe exercițiu.
import { rnd, pick, opts, textOpts } from './util.js';

const ORTO = [
  ['Mama ___ dus la piață.', 's-a', 'sa'], ['Și-a luat cartea ___.', 'sa', 's-a'], ['Copiii ___ jucat.', 's-au', 'sau'], ['Mere ___ pere?', 'sau', 's-au'],
  ['Tata ___ dat un măr.', 'i-a', 'ia'], ['___ cartea!', 'Ia', 'I-a'], ['Ana ___ chemat pe Ion.', 'l-a', 'la'], ['Merg ___ școală.', 'la', 'l-a'],
  ['El ___ venit azi.', 'n-a', 'na'], ['Bunica ___ adus mere.', 'ne-a', 'nea'], ['Mama ___ dat o carte.', 'mi-a', 'mia'], ['Maria ___ scris.', 'v-a', 'va'],
  ['Mâine ___ veni.', 'va', 'v-a'], ['Am intrat ___ casă.', 'într-o', 'intr-o'], ['A ieșit ___ pădure.', 'dintr-o', 'dintro'], ['Nu ___ spus nimic.', 'mi-a', 'mia'],
  ['Cine ___ dat asta?', 'ți-a', 'ția'], ['Ea ___ uitat pe geam.', 's-a', 'sa'], ['Sora ___ e mică.', 'sa', 's-a'], ['Elevii ___ așezat.', 's-au', 'sau']
];

export const SPEED = {
  tabla: { name: 'Portalul Tablei', sub: '× și : rapide', color: '#e04848', base: 8, min: 4, gen() {
    const a = rnd(2, 10), b = rnd(2, 10);
    if (Math.random() < 0.5) return { expr: `${a} × ${b}`, ans: a * b, opts: opts(a * b, [a + b, a * b + a, a * (b - 1)]) };
    return { expr: `${a * b} : ${a}`, ans: b, opts: opts(b, [b + 1, a, b - 1]) };
  } },
  calcule: { name: 'Portalul Calculelor', sub: '+ și − cu numere mari', color: '#3b7ddd', base: 12, min: 7, gen() {
    const t = rnd(0, 2);
    if (t === 0) { const a = rnd(25, 89), b = rnd(12, 79); return { expr: `${a} + ${b}`, ans: a + b, opts: opts(a + b, [a + b - 10, a + b + 1, a + b + 10]) }; }
    if (t === 1) { const a = rnd(60, 199), b = rnd(15, a - 10); return { expr: `${a} − ${b}`, ans: a - b, opts: opts(a - b, [a - b + 10, a - b - 1, a + b]) }; }
    const a = rnd(3, 99), k = pick([10, 100]); return { expr: `${a} × ${k}`, ans: a * k, opts: opts(a * k, [a * (k === 10 ? 100 : 10), a + k, a * k + a]) };
  } },
  fractii: { name: 'Portalul Fracțiilor', sub: 'jumătăți, sferturi, treimi', color: '#8a5cf6', base: 10, min: 6, gen() {
    const d = pick([2, 2, 3, 4, 5, 10]), q = rnd(2, 12), n = d * q, names = { 2: 'Jumătate din', 3: 'O treime din', 4: 'Un sfert din', 5: 'O cincime din', 10: 'O zecime din' };
    return { expr: `${names[d]} ${n}`, ans: q, opts: opts(q, [n / 2 === q ? q * 2 : n / 2, q + d, q - 1].filter(Number.isInteger)) };
  } },
  ordine: { name: 'Portalul Parantezelor', sub: 'ordinea operațiilor', color: '#ff7a2f', base: 15, min: 9, gen() {
    const a = rnd(2, 9), b = rnd(2, 9), c = rnd(2, 9), t = rnd(0, 3);
    if (t === 0) return { expr: `${a} + ${b} × ${c}`, ans: a + b * c, opts: opts(a + b * c, [(a + b) * c, a * b + c, a + b + c]) };
    if (t === 1) { const x = a * b; return { expr: `${x + c} − ${a} × ${b}`, ans: c, opts: opts(c, [(x + c - a) * b, c + 1, x - c]) }; }
    if (t === 2) return { expr: `(${a} + ${b}) × ${c}`, ans: (a + b) * c, opts: opts((a + b) * c, [a + b * c, (a + b) * c + c, a * c + b]) };
    const q = rnd(2, 9), d = c * q; return { expr: `${a} × ${b} − ${d} : ${c}`, ans: a * b - q, opts: opts(a * b - q, [(a * b - d) / c > 0 && Number.isInteger((a * b - d) / c) ? (a * b - d) / c : a * b - q + 2, a * b + q, a * b - q - 1]) };
  } },
  orto: { name: 'Portalul Ortogramelor', sub: 's-a / sa, l-a / la…', color: '#2fae5f', base: 6, min: 3, text: true, gen() {
    const [t, a, w] = pick(ORTO); return { expr: t, ans: a, opts: textOpts(a, [w]) };
  } },
  amestec: { name: 'Portalul Campionilor', sub: 'de toate, tot mai repede', color: '#f2b632', base: 10, min: 5, gen() {
    const k = pick(['tabla', 'calcule', 'fractii', 'ordine', 'orto']); return { ...SPEED[k].gen(), kind: k };
  } }
};
export const SPEED_IDS = Object.keys(SPEED);
/** Timpul pe exercițiu la un nivel: scade cu jumătate de secundă pe nivel, până la minim. */
export function timeFor(id, level, kind) {
  const p = SPEED[kind || id] || SPEED[id];
  const base = id === 'amestec' ? p.base + 1 : p.base;
  return Math.max(p.min, base - (level - 1) * 0.5);
}
