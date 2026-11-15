// Testul de plasare: ~5 minute, o întrebare pe capitol, în ordinea de la școală.
// Află singur unde a ajuns copilul; capitolele neajunse rămân „în ceață” pe hartă.
import { S, save, G, GRADE_NAMES, level, starsTotal } from './state.js';
import { SFX } from './audio.js';
import { MISSIONS, GEN, ROMANA } from './content/missions.js';
import { showPanel, toast } from './ui.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const SUBJ = { mate: 'Matematică', romana: 'Română' };

export function chaptersOf(subject) {
  const g = String(G());
  return MISSIONS.filter((m) => m.area === g && m.types && !m.subject && !m.test && !m.hidden &&
    (subject === 'mate' ? !m.types.every((t) => ROMANA.has(t)) : m.types.some((t) => ROMANA.has(t))));
}
// o întrebare cu variante (fără tipurile „apasă semnul”)
function question(m) {
  for (const t of m.types) {
    for (let k = 0; k < 4; k++) { const q = GEN[t](); if (q.kind !== 'tap' && q.opts && q.opts.length) return q; }
  }
  return null;
}

let P = null;
export function offerPlacement(onDone) {
  showPanel(`<div class="eyebrow">Înainte să începi</div><h2>Hai să vedem unde ai ajuns!</h2>
    <p>Îți dau câteva întrebări din ${esc(GRADE_NAMES[G()])}, cam 5 minute. <b>Nu e notă.</b> Dacă nu știi ceva, apasă „Încă n-am făcut asta”.</p>
    <p>Așa jocul știe ce ați făcut la școală și ce e încă „în ceață”.</p>
    <div class="row"><button class="btn light" type="button" id="plLater">Mai târziu</button><button class="btn" type="button" id="plGo">Încep</button></div>`);
  $('plLater').onclick = () => { $('panel').hidden = true; S.placed = { later: Date.now() }; save(); onDone && onDone(); };
  $('plGo').onclick = () => startPlacement(onDone);
}

export function startPlacement(onDone) {
  const subjects = ['mate', 'romana'].map((k) => ({ k, list: chaptersOf(k) })).filter((x) => x.list.length);
  P = { subjects, si: 0, ci: 0, res: {}, onDone, n: 0, total: subjects.reduce((a, x) => a + x.list.length, 0) };
  next();
}
function next() {
  let s = P.subjects[P.si];
  // câte o întrebare din fiecare capitol (ordinea din joc nu e aceeași cu cea de la școală)
  while (s && P.ci >= s.list.length) { P.si++; P.ci = 0; s = P.subjects[P.si]; }
  if (!s) return finish();
  const m = s.list[P.ci], q = question(m);
  if (!q) { P.res[m.id] = 'ok'; P.ci++; return next(); }
  P.n++;
  const pct = Math.round(100 * P.n / Math.max(1, P.total));
  showPanel(`<div class="eyebrow">Unde am ajuns · ${SUBJ[s.k]} · ${esc(m.title)}</div>
    <div class="pl-bar"><i style="width:${pct}%"></i></div>
    <div class="q">${esc(q.text)}${q.expr ? `<span class="expr">${esc(q.expr)}</span>` : ''}</div>
    <div class="opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div>
    <div class="row"><button class="btn light" type="button" id="plSkip">Încă n-am făcut asta</button></div>`);
  $('panel').dataset.lock = '1';
  document.querySelectorAll('#panelCard [data-k]').forEach((b) => b.onclick = () => {
    const good = q.opts[+b.dataset.k] === q.ans;
    document.querySelectorAll('#panelCard [data-k]').forEach((x) => (x.disabled = true));
    b.classList.add(good ? 'right' : 'wrong'); SFX[good ? 'ok' : 'tap']();
    // un capitol greșit dar știut parțial: „de lucrat”, nu „în ceață”
    P.res[m.id] = good ? 'ok' : 'weak'; P.ci++;
    setTimeout(next, 450);
  });
  $('plSkip').onclick = () => { P.res[m.id] = 'fog'; P.ci++; next(); };
}
function finish() {
  delete $('panel').dataset.lock;
  const all = P.subjects.flatMap((s) => s.list);
  // „ajuns” = orice capitol la care a încercat; „în ceață” = cele la care a spus că nu le-a făcut
  const reached = new Set(all.filter((m) => P.res[m.id] !== 'fog').map((m) => m.id));
  const weak = all.filter((m) => P.res[m.id] === 'weak').map((m) => m.id);
  // celelalte lecții (științe, engleză, civică…) rămân deschise
  const others = MISSIONS.filter((m) => m.types && !all.includes(m)).map((m) => m.id);
  S.chapters = reached.size === all.length ? null : [...reached, ...others];
  S.placed = { at: Date.now(), weak };
  save(); SFX.star();
  const title = (id) => esc((MISSIONS.find((m) => m.id === id) || {}).title || id);
  const fog = all.filter((m) => !reached.has(m.id));
  showPanel(`<div class="eyebrow">Gata!</div><h2>Știm unde ai ajuns</h2>
    <p><b>Ai făcut la școală:</b> ${reached.size} din ${all.length} capitole.</p>
    ${weak.length ? `<p><b>De lucrat (aici te ajut cel mai mult):</b> ${weak.map(title).join(', ')}</p>` : '<p>Ai răspuns bine la tot ce ați făcut. Bravo!</p>'}
    ${fog.length ? `<p><b>În ceață (încă nu ați ajuns):</b> ${fog.map((m) => esc(m.title)).join(', ')}</p>` : ''}
    <p class="muted">Poți schimba oricând din Meniu → „Unde am ajuns”, sau poate schimba un părinte.</p>
    <div class="row"><button class="btn" type="button" id="plOk">Mergem!</button></div>`);
  $('plOk').onclick = () => { $('panel').hidden = true; const cb = P.onDone; P = null; cb && cb(); };
}
export const placed = () => !!(S.placed && S.placed.at);
export { toast };

// ce văd colegii despre mine: nivel, stele, cea mai bună notă, câte capitole am făcut (fără greșeli)
export function myInfo() {
  const all = [...chaptersOf('mate'), ...chaptersOf('romana')];
  const done = all.filter((m) => !S.chapters || S.chapters.includes(m.id)).length;
  return { lv: level(), st: starsTotal(), tb: S.testBest || 0, g: G(), pr: done, pt: all.length };
}
