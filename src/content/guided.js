// Atelierul problemelor: tipurile din test, desfăcute în pași mici pe care copilul îi face singur.
import { rnd, pick, opts, textOpts } from './util.js';

const num = (ask, ans, cands = [], ok = '') => ({ ask, ans, opts: opts(ans, cands), ok });
const txt = (ask, ans, wrong, ok = '') => ({ ask, ans, opts: textOpts(ans, wrong), ok });

export const ATELIER = [
  {
    type: 'ordine1', title: 'Paranteze și ordinea operațiilor', test: '1 a)',
    principle: 'Parantezele întâi. Apoi × și :. La final + și −.',
    make() {
      const a = rnd(1, 6), b = rnd(1, 6), e = rnd(2, 9), q = rnd(2, 6), d = e * q, c = rnd(q + 1, q + 10), s1 = a + b, s2 = c - q, p = s1 * s2, f = rnd(1, Math.min(20, p - 1)), r = p - f;
      return { text: 'Calculează:', expr: `(${a} + ${b}) × (${c} − ${d} : ${e}) − ${f}`, steps: [
        txt('Cu ce începi?', 'cu parantezele', ['cu înmulțirea', 'cu scăderea de la final', 'de la stânga la dreapta, orice'], 'Parantezele sunt ca niște cutii: le deschizi primele.'),
        num(`Prima paranteză: ${a} + ${b} = ?`, s1, [s1 + 1, s1 - 1]),
        txt(`În a doua paranteză (${c} − ${d} : ${e}) ce faci întâi?`, 'împărțirea', ['scăderea'], 'Împărțirea e operație „tare”: vine înaintea scăderii.'),
        num(`${d} : ${e} = ?`, q, [q + 1, e, d - e]),
        num(`${c} − ${q} = ?`, s2, [c - d > 0 ? c - d : s2 + 2, s2 + 1]),
        num(`Acum înmulțirea: ${s1} × ${s2} = ?`, p, [s1 + s2, p + s1, p - s2]),
        num(`La final scăderea: ${p} − ${f} = ?`, r, [r + 1, r - 1, p + f])
      ], answer: r };
    }
  },
  {
    type: 'necunoscut1', title: 'Numărul ascuns în paranteze', test: '1 b)',
    principle: 'Acoperă cu degetul ce nu știi și întreabă: ce număr trebuie să fie aici?',
    make() {
      let a, b, c, M, k; do { b = rnd(4, 7); c = rnd(2, b - 1); a = rnd(2, 6); M = a * (b * b - c * c); k = pick([2, 5, 10]); } while (Math.floor(M / k) < 3);
      const r = rnd(1, Math.floor(M / k) - 1), x = M - r * k, D = b * b - c * c;
      return { text: 'Află valoarea lui a:', expr: `[${a} × (${b} × ${b} − ${c} × ${c}) − a] : ${k} = ${r}`, steps: [
        num(`Acoperă cu degetul paranteza mare: [ ? ] : ${k} = ${r}. Ce număr împărțit la ${k} dă ${r}?`, r * k, [r + k, k, r * k + k], `Împărțirea pe dos e înmulțirea: ${r} × ${k} = ${r * k}. Deci tot ce e în paranteza mare face ${r * k}.`),
        num(`Acum calculăm ce știm. ${b} × ${b} = ?`, b * b, [b + b, b * b + b]),
        num(`${c} × ${c} = ?`, c * c, [c + c, c * c + 1]),
        num(`${b * b} − ${c * c} = ?`, D, [D + 1, D - 1, b * b + c * c]),
        num(`${a} × ${D} = ?`, M, [a + D, M + a, M - D]),
        txt(`Avem ${M} − a = ${r * k}. Cum îl afli pe a?`, `a = ${M} − ${r * k}`, [`a = ${M} + ${r * k}`, `a = ${r * k} − ${M}`], 'Scăzătorul = descăzutul − diferența.'),
        num(`a = ${M} − ${r * k} = ?`, x, [x + 1, M + r * k, x - 1])
      ], answer: x };
    }
  },
  {
    type: 'abc', title: 'a + b + c când știi b + c', test: '1 c)',
    principle: 'Ce nu știi separat, folosește împreună: 2 × b + 2 × c = 2 × (b + c).',
    make() {
      const a = rnd(2, 9), bc = rnd(6, 20), k = rnd(2, 6), m = rnd(2, 5), r = k * a + m * bc;
      return { text: `Dacă a = ${a} și b + c = ${bc}, calculează:`, expr: `${k} × a + ${m} × b + ${m} × c`, steps: [
        txt('Știm cât fac b și c separat?', 'nu, știm doar b + c', ['da, b = c', `da, b = ${bc}`], 'Nu le știm separat, dar nici nu avem nevoie!'),
        txt(`${m} × b + ${m} × c este la fel cu…`, `${m} × (b + c)`, [`${m} × b × c`, `b + c + ${m}`], `Scoți ${m} „în fața parantezei”: ${m} grămezi de b și ${m} grămezi de c = ${m} grămezi de (b + c).`),
        num(`${m} × ${bc} = ?`, m * bc, [m + bc, m * bc + m]),
        num(`${k} × a = ${k} × ${a} = ?`, k * a, [k + a, k * a + k]),
        num(`${k * a} + ${m * bc} = ?`, r, [r + 1, r - 10])
      ], answer: r };
    }
  },
  {
    type: 'gandesc', title: '„Mă gândesc la un număr”', test: '2.',
    principle: 'Mergi înapoi pe drum, de la sfârșit, și fă totul pe dos: + devine −, × devine :.',
    make() {
      let n, m, d, s, v, r; const t = 8;
      do { n = rnd(2, 12); m = rnd(2, 9); d = rnd(2, 6); s = (n * m) % d + d * rnd(1, 3); v = (n * m - s) / d; r = v - t; } while (n * m - s <= 0 || r < 1);
      return { text: `Mă gândesc la un număr. Îl măresc de ${m} ori, noul rezultat îl micșorez cu ${s}, apoi împart la ${d}. Din noul rezultat scad cel mai mare număr par de o cifră și obțin ${r}. La ce număr m-am gândit?`, expr: '', steps: [
        num('Cel mai mare număr PAR de o cifră este…', 8, [9, 10, 6], 'Cifrele pare: 0, 2, 4, 6, 8. Cel mai mare: 8.'),
        txt('De unde pornești?', `de la final, de la ${r}`, ['de la început', `de la ${m}`], 'La „Mă gândesc la un număr” pornești mereu de la sfârșit.'),
        txt('Ultimul pas a fost „scad 8”. Pe dos este…', 'adun 8', ['scad 8', 'înmulțesc cu 8']),
        num(`${r} + 8 = ?`, v, [r - 8 >= 0 ? r - 8 : v + 2, v + 1]),
        txt(`Înainte am împărțit la ${d}. Pe dos este…`, `înmulțesc cu ${d}`, [`împart la ${d}`, `adun ${d}`]),
        num(`${v} × ${d} = ?`, v * d, [v + d, v * d + d]),
        txt(`Înainte am micșorat cu ${s}. Pe dos este…`, `adun ${s}`, [`scad ${s}`, `împart la ${s}`]),
        num(`${v * d} + ${s} = ?`, n * m, [v * d - s >= 0 ? v * d - s : n * m + 1, n * m + 10]),
        txt(`La început am mărit de ${m} ori. Pe dos este…`, `împart la ${m}`, [`înmulțesc cu ${m}`, `scad ${m}`]),
        num(`${n * m} : ${m} = ?`, n, [n + 1, n * m - m, n + 2], `Numărul era ${n}! Verificare: ${n} × ${m} = ${n * m}, − ${s} = ${v * d}, : ${d} = ${v}, − 8 = ${r} ✔`)
      ], answer: n };
    }
  },
  {
    type: 'veverite', title: 'Problema veverițelor', test: '3.',
    principle: 'Toate minus o pereche = cea care rămâne. Desenează benzi!',
    make() {
      const x = rnd(100, 300), y = rnd(100, 300), z = rnd(100, 300), T = x + y + z, P = x + y, Q = y + z;
      return { text: `Trei veverițe mănâncă ${T} de alune. Primele două mănâncă ${P}, iar ultimele două ${Q}. Câte alune mănâncă fiecare?`, expr: '', steps: [
        txt(`Din toate (${T}) scoți primele două (${P}). Cine rămâne?`, 'a treia veveriță', ['prima veveriță', 'a doua veveriță'], `Desenează 3 benzi: primele două sunt acoperite de ${P}, rămâne a treia.`),
        num(`A treia: ${T} − ${P} = ?`, z, [T - Q, z + 10, P - z]),
        txt(`Din toate (${T}) scoți ultimele două (${Q}). Cine rămâne?`, 'prima veveriță', ['a treia veveriță', 'a doua veveriță']),
        num(`Prima: ${T} − ${Q} = ?`, x, [z, x + 10, Q - x > 0 ? Q - x : x + 1]),
        num(`A doua: din primele două (${P}) scoți prima (${x}): ${P} − ${x} = ?`, y, [y + 10, z, x]),
        num(`Verificare: ${x} + ${y} + ${z} = ?`, T, [T + 10, T - 1], 'Dă exact totalul, deci e corect!')
      ], answer: `${x}, ${y}, ${z}` };
    }
  },
  {
    type: 'piata1', title: 'Mere și pere', test: '4.',
    principle: 'Cât costă = cantitate × preț. Din total scazi ce știi, rămâne ce cauți.',
    make() {
      const A = rnd(2, 6), p = rnd(2, 6), B = rnd(2, 5), q = rnd(2, 9), T = A * p + B * q;
      return { text: `${A} kilograme de mere și ${B} kilograme de pere costă ${T} de lei. Cât costă un kilogram de pere, știind că un kilogram de mere costă ${p} lei?`, expr: '', steps: [
        txt('Ce știi sigur cât costă?', 'merele', ['perele', 'nimic']),
        num(`Merele: ${A} kg × ${p} lei = ?`, A * p, [A + p, A * p + p]),
        txt(`Din ${T} lei scazi banii pe mere. Ce rămâne?`, 'banii pe pere', ['banii pe mere', 'restul bunicii']),
        num(`Perele (toate): ${T} − ${A * p} = ?`, B * q, [T + A * p, B * q + 1]),
        num(`1 kg de pere: ${B * q} : ${B} = ?`, q, [B * q, q + 1, B])
      ], answer: q };
    }
  },
  {
    type: 'bunica', title: 'Bunica la piață', test: '5.',
    principle: 'Banii de la început = tot ce a cheltuit + tot ce a dat.',
    make() {
      const A = rnd(2, 5), p = rnd(3, 9), B = rnd(2, 5), q = rnd(2, 6), N = 3, r = pick([5, 10, 15]), S0 = A * p + B * q + N * r;
      return { text: `Bunica cumpără ${A} kg de caise a câte ${p} lei și ${B} pâini a câte ${q} lei. Restul îl împarte în mod egal la cei ${N} nepoți. Ce sumă avea la început, dacă fiecare nepot a primit ${r} lei?`, expr: '', steps: [
        num(`Caisele: ${A} × ${p} = ?`, A * p, [A + p, A * p + p]),
        num(`Pâinile: ${B} × ${q} = ?`, B * q, [B + q, B * q + q]),
        num(`Nepoții au primit în total: ${N} × ${r} = ?`, N * r, [N + r, r]),
        txt('Banii de la început sunt…', 'cheltuiți + dați nepoților', ['doar banii pe caise', 'banii nepoților − cheltuielile']),
        num(`${A * p} + ${B * q} + ${N * r} = ?`, S0, [S0 - N * r, S0 + 10, A * p + B * q + r])
      ], answer: S0 };
    }
  },
  {
    type: 'sumadif', title: 'Suma și diferența (benzi)', test: 'clasa a III-a',
    principle: 'Taie bucata în plus, ca benzile să fie egale, apoi împarte.',
    make() {
      const small = rnd(10, 60), dif = rnd(4, 30), big = small + dif, S = big + small;
      return { text: `Ana și Radu au împreună ${S} de nuci. Ana are cu ${dif} mai multe decât Radu. Câte nuci are fiecare?`, expr: '', steps: [
        txt('Cine are banda mai lungă?', 'Ana', ['Radu', 'sunt egale']),
        num(`Taie bucata în plus a Anei: ${S} − ${dif} = ?`, S - dif, [S + dif, S - dif + 1], 'Acum cele două benzi sunt egale.'),
        num(`O bandă (Radu): ${S - dif} : 2 = ?`, small, [big, small + 1]),
        num(`Ana: ${small} + ${dif} = ?`, big, [big + 1, small - dif > 0 ? small - dif : big + 2])
      ], answer: `${big} și ${small}` };
    }
  }
];
export const atelierByType = (t) => ATELIER.find((a) => a.type === t);
