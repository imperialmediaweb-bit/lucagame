export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** 4 variante unice: răspunsul corect + greșeli tipice, completate cu numere apropiate. */
export function opts(ans, cands = []) {
  const out = [ans];
  for (const c of cands) { if (out.length >= 4) break; if (Number.isInteger(c) && c >= 0 && !out.includes(c)) out.push(c); }
  let k = 1;
  while (out.length < 4) {
    const c = ans + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * pick([1, 2, 10]);
    if (c >= 0 && !out.includes(c)) out.push(c);
    k++;
  }
  return shuffle(out);
}

/** Variante text: corectul + greșelile date. */
export const textOpts = (ans, wrong) => shuffle([ans, ...wrong.filter((w) => w !== ans)].slice(0, 4));
