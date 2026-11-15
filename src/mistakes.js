// Detectorul de greșeli: ghicește UNDE a greșit copilul, după răspunsul ales.
const num = (v) => { const n = +String(v).replace(/\./g, '').replace(',', '.'); return Number.isFinite(n) && String(v).trim() !== '' ? n : null; };

// calcul fără ordinea operațiilor (greșeala tipică: de la stânga la dreapta), cu paranteze respectate
function leftToRight(src) {
  let s = src.replace(/(\d)\.(\d{3})/g, '$1$2').replace(/−/g, '-').replace(/×/g, '*').replace(/:/g, '/').replace(/[=_?\s]/g, '');
  if (!/^[\d+\-*/()]+$/.test(s) || !/[+\-]/.test(s) || !/[*/]/.test(s)) return null;
  const ev = (t) => { const toks = t.match(/\d+|[+\-*/]/g); if (!toks) return null; let r = +toks[0]; for (let i = 1; i < toks.length; i += 2) { const b = +toks[i + 1]; r = toks[i] === '+' ? r + b : toks[i] === '-' ? r - b : toks[i] === '*' ? r * b : r / b; } return r; };
  for (let k = 0; k < 10 && s.includes('('); k++) s = s.replace(/\(([^()]+)\)/g, (_, x) => ev(x));
  return ev(s);
}

export function diagnose(q, chosen) {
  const a = num(q.ans), c = num(chosen), expr = (q.expr || '') + ' ' + (q.text || '');
  if (a === null || c === null) {
    // răspunsuri cu text (ortograme, părți de vorbire…)
    if (/^[a-zăâîșț]+-[a-zăâîșț]+$|^[a-zăâîșț]+$/i.test(String(q.ans)) && /-/.test(String(q.ans) + String(chosen))) return 'Atenție la cratimă: ea arată că se pronunță legat două cuvinte (s-a, n-am, mi-a). Verifică dacă poți înlocui cu alt cuvânt.';
    return null;
  }
  const d = c - a, ad = Math.abs(d);
  const ltr = leftToRight(q.expr || '');
  if (ltr !== null && Math.abs(ltr - c) < 1e-9 && ltr !== a) return 'Ai calculat de la stânga la dreapta. Dar înmulțirea și împărțirea se fac ÎNAINTEA adunării și scăderii (dacă nu sunt paranteze).';
  const one = ((q.expr || '').match(/[+−×:]/g) || []).length <= 1; // sfaturile pe operație doar la calcule cu o singură operație
  const m = one ? expr.replace(/(\d)\.(\d{3})/g, '$1$2').match(/(\d+)\s*([+−×:])\s*(\d+)/) : null;
  if (m) {
    const x = +m[1], y = +m[3], op = m[2];
    if (op === '×' && c === x + y) return `Ai adunat ${x} + ${y} în loc să înmulțești. „×” înseamnă de ${y} ori ${x}.`;
    if (op === '+' && c === x * y) return 'Ai înmulțit în loc să aduni.';
    if (op === '−' && c === x + y) return 'Ai adunat în loc să scazi.';
    if (op === ':' && c === x * y) return 'Ai înmulțit în loc să împarți.';
    if (op === '×' && y < 10 && x >= 10) { const z = Math.floor(x / 10) * 10, u = x % 10; if (c === z * y + u) return `Ai înmulțit doar zecile (${z} × ${y}) și ai uitat să înmulțești și unitățile (${u} × ${y}).`; }
  }
  const op = m ? m[2] : '', col = (p) => (p === 10 ? 'zecilor' : p === 100 ? 'sutelor' : 'miilor');
  for (const p of [10, 100, 1000]) if (ad === p) {
    if (op === '−') return d > 0 ? `Rezultatul tău e cu ${p} prea mare. La coloana ${col(p)}: după ce ai împrumutat de la ea, trebuia să scrii cifra cu 1 mai mică (taie cifra și scrie deasupra).` : `Rezultatul tău e cu ${p} prea mic. La coloana ${col(p)} ai împrumutat de două ori sau ai scăzut un 1 în plus.`;
    return d > 0 ? `Rezultatul tău e cu ${p} prea mare. La coloana ${col(p)} ai adăugat un 1 „ținut minte” care nu trebuia.` : `Rezultatul tău e cu ${p} prea mic. La coloana ${col(p)} ai uitat să adaugi 1-ul „ținut minte” de la coloana din dreapta.`;
  }
  if (ad === 1 && m && (op === ':' || op === '×')) { const x = +m[1], y = +m[3]; return op === ':' ? `Verifică cu tabla înmulțirii: ${y} × ${c} = ${y * c}, nu ${x}. Caută numărul care, înmulțit cu ${y}, dă ${x}.` : `Ai greșit tabla înmulțirii: ${x} × ${y} nu e ${c}. Spune tabla lui ${y} până ajungi la ${x}.`; }
  if (a !== 0 && (c === a * 10 || c * 10 === a)) return 'Ai pus un zero în plus sau în minus. Numără zerourile cu atenție.';
  if (/rest/.test(String(q.ans))) return null;
  if (a && c && ad < Math.max(5, a * 0.1)) return 'Ai fost aproape. Ai greșit undeva un calcul mic: refă-l în ciornă, unul sub altul.';
  return null;
}
