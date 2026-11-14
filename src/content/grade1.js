// Clasa I: numere până la 100, adunări și scăderi până la 20, zeci și unități, probleme simple, silabe, ce/ci/ge/gi.
import { rnd, pick, opts, textOpts } from './util.js';

export const G1 = {
  compara() {
    const a = rnd(0, 99), b = Math.random() < 0.15 ? a : rnd(0, 99);
    const ans = a < b ? '<' : a > b ? '>' : '=';
    return {
      text: 'Ce semn pui între numere?', expr: `${a}  ___  ${b}`, ans, opts: ['<', '>', '='],
      steps: [a === b ? 'Numerele sunt egale, deci =' : `Compară întâi zecile, apoi unitățile. ${Math.max(a, b)} este mai mare.`, `${a} ${ans} ${b}`],
      hints: ['Ciocul semnului < sau > se deschide spre numărul MAI MARE.']
    };
  },
  vecini() {
    const n = rnd(1, 98), inainte = Math.random() < 0.5;
    const ans = inainte ? n - 1 : n + 1;
    return {
      text: `Care este numărul ${inainte ? 'dinainte' : 'de după'} lui ${n}?`, ans, opts: opts(ans, [inainte ? n + 1 : n - 1, n, ans + 10]),
      steps: [inainte ? `Numărul dinainte e cu 1 mai mic: ${n} − 1 = ${ans}` : `Numărul de după e cu 1 mai mare: ${n} + 1 = ${ans}`]
    };
  },
  adun20() {
    const a = rnd(1, 15), b = rnd(1, 20 - a), r = a + b;
    const steps = a + b > 10 && a < 10 && b < 10
      ? [`Completează până la 10: ${a} + ${10 - a} = 10`, `Mai rămân ${b - (10 - a)}: 10 + ${b - (10 - a)} = ${r}`]
      : [`Pornește de la ${Math.max(a, b)} și numără înainte ${Math.min(a, b)}: ${a} + ${b} = ${r}`];
    return { text: 'Calculează:', expr: `${a} + ${b} =`, ans: r, opts: opts(r, [r - 1, r + 1, r + 10]), steps };
  },
  scad20() {
    const a = rnd(5, 20), b = rnd(1, a), r = a - b;
    return {
      text: 'Calculează:', expr: `${a} − ${b} =`, ans: r, opts: opts(r, [r + 1, r - 1, a + b]),
      steps: [`Pornește de la ${a} și numără înapoi ${b}: ${a} − ${b} = ${r}`, `Verificare: ${r} + ${b} = ${a} ✔`]
    };
  },
  zeci() {
    const z = rnd(1, 9), u = rnd(0, 9), n = z * 10 + u;
    if (Math.random() < 0.5) {
      return { text: `Ce număr are ${z} zeci și ${u} unități?`, ans: n, opts: opts(n, [u * 10 + z, z + u, n + 10]),
        steps: [`Zecile stau în față, unitățile la sfârșit: ${z} zeci și ${u} unități = ${n}`] };
    }
    return { text: `Câte zeci are numărul ${n}?`, ans: z, opts: opts(z, [u, n, z + 1]),
      steps: [`În ${n}, prima cifră arată zecile (${z}), a doua unitățile (${u}).`] };
  },
  prob1() {
    const name = pick(['Ana', 'Matei', 'Ioana', 'Radu', 'Maria']), obj = pick(['mere', 'baloane', 'creioane', 'bomboane', 'mașinuțe']);
    const a = rnd(3, 15), b = rnd(1, 9);
    if (Math.random() < 0.5) {
      const r = a + b;
      return { text: `${name} are ${a} ${obj}. Mai primește ${b}. Câte ${obj} are acum?`, ans: r, opts: opts(r, [a - b >= 0 ? a - b : r + 2, r + 1, a]),
        steps: ['„Primește” înseamnă că are mai multe, deci adunăm.', `${a} + ${b} = ${r}`] };
    }
    const bb = Math.min(b, a - 1), r = a - bb;
    return { text: `${name} are ${a} ${obj}. Dă ${bb} unui prieten. Câte ${obj} îi rămân?`, ans: r, opts: opts(r, [a + bb, r + 1, bb]),
      steps: ['„Dă” înseamnă că îi rămân mai puține, deci scădem.', `${a} − ${bb} = ${r}`] };
  },
  silabe() {
    const W = [['pisică', 3, 'pi-si-că'], ['casă', 2, 'ca-să'], ['mare', 2, 'ma-re'], ['soare', 2, 'soa-re'], ['elefant', 3, 'e-le-fant'],
      ['pom', 1, 'pom'], ['ciocolată', 4, 'cio-co-la-tă'], ['copil', 2, 'co-pil'], ['minge', 2, 'min-ge'], ['floare', 2, 'floa-re'],
      ['bicicletă', 4, 'bi-ci-cle-tă'], ['câine', 2, 'câi-ne'], ['lup', 1, 'lup'], ['carte', 2, 'car-te'], ['banană', 3, 'ba-na-nă']];
    const [w, n, sp] = pick(W);
    return { text: 'Câte silabe are cuvântul?', expr: w, ans: n, opts: opts(n, [n + 1, n - 1, n + 2]).filter((x) => x > 0).slice(0, 4),
      steps: [`Bate din palme la fiecare silabă: ${sp}`, `${n} ${n === 1 ? 'silabă' : 'silabe'}`],
      hints: ['Spune cuvântul rar și bate din palme.'] };
  },
  cegi() {
    const W = [['__as (arată ora)', 'cea', ['cia', 'cha']], ['__reașă', 'ci', ['ce', 'chi']], ['__te (pentru picioare)', 'ghe', ['ge', 'ga']],
      ['__brit', 'chi', ['ci', 'ce']], ['__rafă', 'gi', ['ghi', 'ge']], ['un__', 'ghi', ['gi', 'ge']], ['__peag', 'che', ['ce', 'cie']],
      ['__ntar', 'ce', ['che', 'ci']], ['__nunche', 'ge', ['ghe', 'gi']], ['o__ (pentru ochi)', 'chi', ['ci', 'ce']]];
    const [w, a, wr] = pick(W);
    return { text: 'Completează cuvântul:', expr: w, ans: a, opts: textOpts(a, wr),
      steps: [`Se scrie: ${w.replace('__', a)}`, 'ce, ci, ge, gi se citesc „moale”; che, chi, ghe, ghi se citesc „tare”.'] };
  }
};
