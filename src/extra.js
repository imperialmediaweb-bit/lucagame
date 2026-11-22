// Compunerea scrisă de copil (cu verificare automată), fișele de lucru de printat și „Unde am ajuns la școală”.
import { S, save, G, GRADE_NAMES, levelNow, LEVELS } from './state.js';
import { SFX } from './audio.js';
import { showPanel, toast, confetti, refreshHud } from './ui.js';
import { GEN, MISSIONS, TYPE_NAMES, SUBJECT_NAMES } from './content/missions.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------------- compunerea ---------------- */
const TEME = [
  { t: 'O zi de neuitat', kind: 'narativ', hint: 'Povestește o întâmplare: când și unde a fost, cine a participat, ce s-a întâmplat, cum s-a terminat.' },
  { t: 'Animalul meu preferat', kind: 'descriptiv', hint: 'Descrie cum arată (culoare, mărime, blană), ce face și de ce îți place.' },
  { t: 'Prima zi de toamnă', kind: 'descriptiv', hint: 'Descrie culorile, vremea, copacii, ce simți.' },
  { t: 'Bilet pentru bunica', kind: 'bilet', hint: 'Data sus în dreapta, „Dragă bunico,” pe rândul următor, mesajul, apoi semnătura jos în dreapta.' },
  { t: 'Invitație la ziua mea', kind: 'invitatie', hint: 'Scrie ce sărbătorești, unde, în ce zi și la ce oră, și cine invită.' }
];
const GRESELI = [
  [/\bsa (dus|jucat|uitat|întors|intors|apucat|făcut|facut|terminat|bucurat|speriat|plimbat)\b/gi, 's-a $1'], [/\bsau (dus|jucat|uitat|întors|intors|apucat|bucurat|speriat|plimbat)\b/gi, 's-au $1'],
  [/\bia (dat|spus|adus|luat|cumpărat|cumparat)\b/gi, 'i-a $1'], [/\bla (chemat|văzut|vazut|ajutat|luat)\b/gi, 'l-a $1'], [/\bnea (dat|spus|adus|ajutat|chemat)\b/gi, 'ne-a $1'],
  [/\bmia (dat|spus|adus|plăcut|placut)\b/gi, 'mi-a $1'], [/\bintr-o\b/gi, 'într-o'], [/\bdintro\b/gi, 'dintr-o']
];
function analizeaza(text, tema) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean), words = (text.match(/[\p{L}-]+/gu) || []).length;
  const title = lines[0] || '', body = lines.slice(1), sentences = text.replace(/\n/g, ' ').split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 2);
  const checks = [];
  const add = (ok, good, bad) => checks.push({ ok, msg: ok ? good : bad });
  if (tema.kind === 'bilet') {
    add(/\d{1,2}[./ -]\d{1,2}|\d{1,2}\s+\p{L}+\s+\d{4}|\d{1,2}\s+(ianuarie|februarie|martie|aprilie|mai|iunie|iulie|august|septembrie|octombrie|noiembrie|decembrie)/iu.test(text), 'Ai scris data.', 'Lipsește data (sus, în dreapta).');
    add(/^(dragă|draga|dragi|stimat)/im.test(text) && /,\s*$/m.test(lines.find((l) => /^(dragă|draga|dragi)/i.test(l)) || ''), 'Adresarea are virgulă la sfârșit.', 'Scrie adresarea („Dragă bunico,”) cu virgulă la sfârșit.');
    add(lines.length >= 4 && lines[lines.length - 1].split(' ').length <= 3, 'Ai semnat la sfârșit.', 'Semnează-te pe ultimul rând (doar numele).');
  } else if (tema.kind === 'invitatie') {
    add(/\b(ora|ore)\b|\d{1,2}[:.]\d{2}/i.test(text), 'Ai scris ora.', 'Scrie ora evenimentului.');
    add(/\b(luni|marți|marti|miercuri|joi|vineri|sâmbătă|sambata|duminică|duminica|\d{1,2}\s+\p{L}+)/iu.test(text), 'Ai scris ziua.', 'Scrie în ce zi are loc.');
    add(/\b(la|în|in)\s+\p{Lu}|\bacasă|acasa|\bparc|\bsala|\bstrada|\bstr\./u.test(text), 'Ai scris locul.', 'Scrie unde are loc (adresa sau locul).');
  } else {
    add(title.length > 0 && title.split(' ').length <= 7 && !/[.!?]$/.test(title), 'Ai un titlu.', 'Pe primul rând scrie titlul (scurt, fără punct).');
    add(body.length >= 3, `Ai ${body.length} alineate (idei pe rânduri noi).`, `Ai doar ${body.length} ${body.length === 1 ? 'alineat' : 'alineate'}. Fă cel puțin 3: introducere, cuprins, încheiere.`);
    add(words >= 50, `Ai ${words} de cuvinte.`, `Ai ${words} de cuvinte. Încearcă cel puțin 50.`);
  }
  const lower = sentences.filter((s) => /^[a-zăâîșț]/.test(s));
  add(lower.length === 0, 'Propozițiile încep cu literă mare.', `${lower.length} ${lower.length === 1 ? 'propoziție începe' : 'propoziții încep'} cu literă mică: „${esc(lower[0] || '').slice(0, 30)}…”`);
  add(/[.!?]\s*$/.test(text.trim()), 'Textul se termină cu semn de punctuație.', 'Pune punct (sau ! / ?) la sfârșitul textului.');
  const greseli = [];
  for (const [re, fix] of GRESELI) for (const m of text.matchAll(re)) greseli.push(`„${m[0]}” → „${m[0].replace(re, fix)}”`);
  add(greseli.length === 0, 'Nicio greșeală de ortogramă găsită.', `Verifică: ${greseli.slice(0, 3).join(', ')}`);
  return checks;
}
export function openWrite() {
  let tema = TEME[0];
  const draw = () => {
    showPanel(`<div class="eyebrow">Scriitorul Pană · compunere</div><h2>Scriu o compunere</h2>
      <div class="tabs">${TEME.map((x, i) => `<button class="tab ${x === tema ? 'on' : ''}" type="button" data-t="${i}">${esc(x.t)}</button>`).join('')}</div>
      <div class="hint"><b>${esc(tema.t)}</b><span>${esc(tema.hint)}</span></div>
      <textarea id="wTxt" rows="10" style="font:600 17px/1.5 var(--font-b);padding:10px;border:2px solid var(--ink);border-radius:12px;width:100%;box-sizing:border-box;resize:vertical" placeholder="${tema.kind === 'bilet' ? '15 noiembrie 2026\nDragă bunico,\n...\nLuca' : 'Titlul\nPrima idee (introducerea)...\nA doua idee...\nÎncheierea...'}">${esc((S.draft || {})[tema.t] || '')}</textarea>
      <div id="wRes"></div>
      <div class="row"><button class="btn light" type="button" data-close>Închide</button><button class="btn" type="button" id="wCheck">Verifică</button></div>`);
    $('panelCard').querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { saveDraft(); tema = TEME[+b.dataset.t]; draw(); });
    $('wTxt').addEventListener('input', saveDraft);
    $('wCheck').onclick = () => {
      const text = $('wTxt').value, checks = analizeaza(text, tema), ok = checks.filter((c) => c.ok).length, stars = ok === checks.length ? 3 : ok >= checks.length - 1 ? 2 : ok >= checks.length - 3 ? 1 : 0;
      $('wRes').innerHTML = `<div class="fb ${stars >= 2 ? 'ok' : 'no'}"><b>${'★'.repeat(stars)}${'☆'.repeat(3 - stars)} · ${ok} din ${checks.length} reguli</b><ol>${checks.map((c) => `<li style="color:${c.ok ? 'var(--good)' : 'var(--bad)'}">${c.ok ? '✔' : '✗'} ${c.msg}</li>`).join('')}</ol></div>`;
      S.compuneri = S.compuneri || []; S.compuneri.unshift({ t: tema.t, text: text.slice(0, 3000), stars, d: new Date().toISOString().slice(0, 10) }); S.compuneri = S.compuneri.slice(0, 20);
      if (stars === 3) { S.coins += 15; SFX.fanfare(); confetti(); toast('Compunere de 3 stele! +15 monede'); } else SFX.tap();
      save(); refreshHud();
    };
  };
  const saveDraft = () => { const el = $('wTxt'); if (!el) return; S.draft = S.draft || {}; S.draft[tema.t] = el.value; save(); };
  draw();
}

/* ---------------- fișe de lucru (de printat) ---------------- */
export function openFise() {
  const g = String(G()), ms = MISSIONS.filter((m) => m.area === g && m.types);
  showPanel(`<div class="eyebrow">Pentru părinți și profesori · ${GRADE_NAMES[G()]}</div><h2>Fișe de lucru</h2>
    <p>Alege capitolul. Fișa are exerciții noi de fiecare dată și pagina cu răspunsuri la sfârșit. Se printează sau se salvează ca PDF.</p>
    <label for="fM"><b>Capitol</b></label><select id="fM" style="font:700 16px var(--font-b);padding:8px;border:2px solid var(--ink);border-radius:10px">
      <option value="__all">Recapitulare: din toată materia</option>${ms.map((m) => `<option value="${m.id}">${esc(m.subject ? SUBJECT_NAMES[m.subject] + ': ' : '')}${esc(m.title)}</option>`).join('')}</select>
    <label for="fN"><b>Câte exerciții</b></label><select id="fN" style="font:700 16px var(--font-b);padding:8px;border:2px solid var(--ink);border-radius:10px"><option>10</option><option selected>15</option><option>20</option></select>
    <div class="row"><button class="btn light" type="button" data-close>Închide</button><button class="btn" type="button" id="fGo">Fă fișa</button></div>`);
  $('fGo').onclick = () => printFisa($('fM').value, +$('fN').value);
}
function printFisa(mid, n) {
  const g = String(G()), ms = MISSIONS.filter((m) => m.area === g && m.types), m = ms.find((x) => x.id === mid);
  const types = m ? m.types : ms.flatMap((x) => x.types);
  const qs = Array.from({ length: n }, (_, i) => { const t = types[i % types.length]; const q = GEN[t](); return { ...q, type: t }; });
  const title = m ? m.title : 'Recapitulare';
  let el = $('fisa'); if (!el) { el = document.createElement('div'); el.id = 'fisa'; document.body.appendChild(el); }
  const opt = (q) => (q.kind === 'tap' ? '' : `<div class="fo">${q.opts.map((o, k) => `<span>${'abcd'[k]}) ${esc(o)}</span>`).join('')}</div>`);
  el.innerHTML = `<div class="fp"><div class="fh"><img src="./logo.svg" alt="Mintoria"><div>Nume: ________________________<br>Data: ____________</div></div>
    <h1>Fișă de lucru: ${esc(title)}</h1><p class="fsub">${esc(GRADE_NAMES[G()])} · rezolvă pe fișă; folosește spațiul pentru calcule</p>
    <ol>${qs.map((q) => `<li><b>${esc(q.text)}</b>${q.expr ? `<div class="fe">${esc(q.expr)}</div>` : ''}${q.kind === 'tap' ? `<div class="fe">${esc(q.toks.join(' '))}</div><small>Încercuiește operația care se face prima.</small>` : opt(q)}<div class="fl"></div></li>`).join('')}</ol></div>
    <div class="fp fk"><h1>Răspunsuri: ${esc(title)}</h1><ol>${qs.map((q) => `<li><b>${esc(q.kind === 'tap' ? q.toks[q.ans] : q.ans)}</b> · <small>${esc(q.steps.join(' · '))}</small></li>`).join('')}</ol></div>
    <div class="fnoprint"><button class="btn" type="button" id="fPrint">Printează / salvează PDF</button><button class="btn light" type="button" id="fClose">Închide fișa</button></div>`;
  el.hidden = false; $('panel').hidden = true;
  $('fPrint').onclick = () => window.print();
  $('fClose').onclick = () => { el.hidden = true; };
}

/* ---------------- unde am ajuns la școală ---------------- */
import { startPlacement } from './placement.js';
export function openChapters() {
  const g = String(G()), ms = MISSIONS.filter((m) => m.area === g && m.types);
  const done = new Set(S.chapters || ms.map((m) => m.id));
  showPanel(`<div class="eyebrow">${GRADE_NAMES[G()]}</div><h2>Unde am ajuns la școală?</h2>
    <p>Bifează capitolele făcute deja la clasă. Antrenamentul zilnic și misiunile recomandate vor fi doar din ele, ca să nu primești ce n-ai învățat încă.</p>
    <div class="jgrade">${ms.map((m) => `<label class="jrow" style="grid-template-columns:auto minmax(0,1fr)"><input type="checkbox" data-c="${m.id}" ${done.has(m.id) ? 'checked' : ''} style="width:22px;height:22px"><span><b>${esc(m.subject ? SUBJECT_NAMES[m.subject] + ': ' : '')}${esc(m.title)}</b><small> · ${esc(m.desc)}</small></span></label>`).join('')}</div>
    <div class="row"><button class="btn light" type="button" id="cTest">Află singur (test 5 min)</button><button class="btn light" type="button" id="cAll">Toate</button><button class="btn light" type="button" id="cNone">Niciunul</button><button class="btn" type="button" id="cSave">Salvează</button></div>`);
  const boxes = () => [...$('panelCard').querySelectorAll('[data-c]')];
  $('cTest').onclick = () => startPlacement();
  $('cAll').onclick = () => boxes().forEach((b) => (b.checked = true));
  $('cNone').onclick = () => boxes().forEach((b) => (b.checked = false));
  $('cSave').onclick = () => { const ids = boxes().filter((b) => b.checked).map((b) => b.dataset.c); S.chapters = ids.length === ms.length ? null : ids; save(); $('panel').hidden = true; toast(ids.length ? `Gata: ${ids.length} capitole făcute la școală.` : 'Nu ai bifat niciun capitol.'); };
}
/** Capitolele permise pentru antrenament (null = toate). */
// un capitol e „deschis” dacă e la nivelul ales (sau mai jos) și, dacă s-a bifat „unde am ajuns”, e bifat
export const chapterOk = (m) => !m.types || ((!m.per || m.per <= levelNow()) && (!S.chapters || S.chapters.includes(m.id)));
export const fogWhy = (m) => (m.per && m.per > levelNow() ? `nivel ${LEVELS[m.per]} · vine mai târziu în an` : 'încă nu ați ajuns la școală');
