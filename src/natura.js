// Harta Naturii (Științe ale naturii, clasa a III-a): ținuturi cu „Ce trebuie să știi”, cuvinte de știință,
// jocuri de sortare, circuitul apei, exerciții, insigne și Albumul Naturii cu pălăria de explorator.
import { S, save } from './state.js';
import { SFX } from './audio.js';
import { REGIONS, CYCLE, WORDS } from './content/natura3.js';
import { MISSIONS } from './content/missions.js';
import { startMission, toast, confetti, refreshHud, onQuizDone } from './ui.js';
import { chapterOk } from './extra.js';
import { shuffle } from './content/util.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const N = () => (S.nat = S.nat || {});
const sub = (k) => (N()[k] = N()[k] || {});
const coins = (n, why) => { S.coins += n; save(); refreshHud(); toast(`${why} +${n} ${n === 1 ? 'monedă' : 'monede'}`); SFX.coin(); };
let root = null, H = {};

export function initNatura(hooks) { H = hooks || {}; root = document.createElement('div'); root.id = 'nmap'; root.hidden = true; document.body.appendChild(root); }
export const naturaOpen = () => root && !root.hidden;
const close = () => { root.hidden = true; };

/* ---------- starea unui ținut ---------- */
function steps(r) {
  const m = MISSIONS.find((x) => x.id === r.mission), st = (S.missions[r.mission] || {}).stars || 0;
  return {
    facts: !!sub('facts')[r.id],
    words: r.words.every(([t]) => sub('words')[t]),
    game: (sub('sort')[r.id] || 0) >= 2 && (r.id !== 'apa' || (N().cycle || 0) >= 2),
    ex: st >= 2,
    fog: m ? !chapterOk(m) : false
  };
}
const doneCount = (r) => { const s = steps(r); return [s.facts, s.words, s.game, s.ex].filter(Boolean).length; };
function checkBadge(r) {
  if (sub('badges')[r.id] || doneCount(r) < 4) return;
  sub('badges')[r.id] = Date.now(); S.coins += 30; save(); refreshHud(); SFX.fanfare(); confetti();
  toast(`Insignă nouă: Explorator al ținutului „${r.name}”! +30 monede`);
}
function checkAlbum() {
  if (N().album || !WORDS.every(([t]) => sub('words')[t])) return;
  N().album = Date.now(); S.owned = S.owned || []; if (!S.owned.includes('hat:explorator')) S.owned.push('hat:explorator');
  S.coins += 100; save(); refreshHud(); SFX.fanfare(); confetti();
  toast('Ai completat Albumul Naturii! Primești Pălăria de explorator și +100 monede!');
}

/* ---------- harta ---------- */
const POS = { viata: [22, 26], animale: [72, 20], om: [80, 56], apa: [50, 48], mediu: [24, 70], corpuri: [60, 82] };
export function openNatura() {
  SFX.tap(); H.stop && H.stop();
  const badges = Object.keys(sub('badges')).length, learned = Object.keys(sub('words')).length;
  root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBack">← Acasă</button><b class="nm-title">Harta Naturii</b>
      <span class="pill">🏅 ${badges}/6</span><button class="iconbtn" type="button" id="nmAlbum">📒 Album ${learned}/${WORDS.length}</button></div>
    <p class="nm-hint">Științe ale naturii, clasa a III-a. Alege un ținut. În fiecare: <b>citești</b>, <b>înveți cuvintele</b>, <b>joci</b> și <b>exersezi</b>. Le faci pe toate 4 și primești <b>insigna</b> ținutului.</p>
    <div class="nm-map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 62 C 20 55, 35 70, 50 52 S 80 40, 100 46 L100 100 L0 100Z" fill="#8fd18a"/>
        <path d="M0 0 H100 V46 C 80 40, 65 52, 50 52 S 20 55, 0 62Z" fill="#b6e6a1"/>
        <path d="M52 0 C 46 20, 58 30, 50 50 S 40 80, 46 100" stroke="#5ab8e8" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M74 0 L86 18 L98 0Z M8 84 L18 70 L28 84Z" fill="#a39a8f"/>
      </svg>
      ${REGIONS.map((r) => { const s = steps(r), n = doneCount(r), [x, y] = POS[r.id], b = sub('badges')[r.id];
        return `<button class="nm-node ${s.fog ? 'fog' : ''} ${b ? 'done' : ''}" type="button" data-r="${r.id}" style="left:${x}%;top:${y}%;--c:${r.color}">
          <span class="nm-em">${r.emoji}</span><b>${esc(r.name)}</b><small>${s.fog ? 'în ceață · nu la școală încă' : b ? '🏅 insignă câștigată' : `${n}/4 pași`}</small>
          <span class="nm-dots">${[s.facts, s.words, s.game, s.ex].map((v) => `<i class="${v ? 'on' : ''}"></i>`).join('')}</span></button>`; }).join('')}
    </div>`;
  root.hidden = false;
  $('nmBack').onclick = () => { close(); H.home && H.home(); };
  $('nmAlbum').onclick = openAlbum;
  root.querySelectorAll('[data-r]').forEach((b) => b.onclick = () => openRegion(REGIONS.find((r) => r.id === b.dataset.r)));
}

/* ---------- un ținut: 4 pași ---------- */
function openRegion(r) {
  SFX.tap();
  const s = steps(r), learned = r.words.filter(([t]) => sub('words')[t]).length, best = sub('sort')[r.id] || 0, st = (S.missions[r.mission] || {}).stars || 0;
  const card = (id, ok, ic, t, d) => `<button class="nm-step ${ok ? 'ok' : ''}" type="button" id="${id}"><span>${ic}</span><b>${t}</b><small>${d}</small>${ok ? '<i>✓</i>' : ''}</button>`;
  root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmMap">← Harta</button><b class="nm-title" style="color:${r.color}">${r.emoji} ${esc(r.name)}</b>
      ${sub('badges')[r.id] ? '<span class="pill">🏅 Insignă</span>' : `<span class="pill">${doneCount(r)}/4</span>`}</div>
    <p class="nm-hint">${esc(r.sub)}${s.fog ? ' · <b>La școală încă n-ați ajuns aici</b>, dar poți să te uiți dinainte.' : ''}</p>
    <div class="nm-steps">
      ${card('nsFacts', s.facts, '📖', '1. Ce trebuie să știi', `${r.facts.length} cartonașe, 2 minute`)}
      ${card('nsWords', s.words, '🃏', '2. Cuvinte de știință', `${learned}/${r.words.length} învățate · fiecare intră în album`)}
      ${card('nsGame', s.game, '🎮', '3. Joacă: ' + esc(r.sort.title), best ? `cel mai bun: ${'★'.repeat(best)}${'☆'.repeat(3 - best)}` : 'sortează repede și corect')}
      ${r.id === 'apa' ? card('nsCycle', (N().cycle || 0) >= 2, '🔄', '3b. Circuitul apei', N().cycle ? `${'★'.repeat(N().cycle)}${'☆'.repeat(3 - N().cycle)}` : 'atinge pe desen') : ''}
      ${card('nsEx', s.ex, '✏️', '4. Exerciții', st ? `${'★'.repeat(st)}${'☆'.repeat(3 - st)} · ai nevoie de ★★` : '5 întrebări, cu explicații')}
    </div>`;
  $('nmMap').onclick = openNatura;
  $('nsFacts').onclick = () => facts(r, 0);
  $('nsWords').onclick = () => words(r);
  $('nsGame').onclick = () => sortGame(r);
  if ($('nsCycle')) $('nsCycle').onclick = () => cycleGame(r);
  $('nsEx').onclick = () => { close(); onQuizDone(() => { openNatura(); openRegion(r); checkBadge(r); }); startMission(MISSIONS.find((m) => m.id === r.mission)); };
}

/* 1. cartonașele „Ce trebuie să știi” */
function facts(r, i) {
  const [ic, t] = r.facts[i], last = i === r.facts.length - 1;
  root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Ce trebuie să știi</b><span class="pill">${i + 1}/${r.facts.length}</span></div>
    <div class="nm-fact" style="--c:${r.color}"><span>${ic}</span><p>${md(t)}</p></div>
    <div class="row" style="justify-content:center">${i ? '<button class="btn light" type="button" id="nfPrev">Înapoi</button>' : ''}<button class="btn" type="button" id="nfNext">${last ? 'Am înțeles!' : 'Mai departe'}</button></div>`;
  $('nmBackR').onclick = () => openRegion(r);
  if ($('nfPrev')) $('nfPrev').onclick = () => facts(r, i - 1);
  $('nfNext').onclick = () => {
    SFX.tap();
    if (!last) return facts(r, i + 1);
    if (!sub('facts')[r.id]) { sub('facts')[r.id] = Date.now(); coins(5, 'Ai citit tot!'); }
    checkBadge(r); openRegion(r);
  };
}

/* 2. cuvintele de știință: cartonașe care se întorc */
function words(r) {
  const todo = r.words.filter(([t]) => !sub('words')[t]), deck = shuffle([...(todo.length ? todo : r.words)]);
  let i = 0, flipped = false;
  const draw = () => {
    const [t, d, em] = deck[i];
    root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Cuvinte de știință</b><span class="pill">${i + 1}/${deck.length}</span></div>
      <p class="nm-hint">Citește cuvântul, spune în gând ce înseamnă, apoi întoarce cartonașul.</p>
      <button class="nm-card ${flipped ? 'flip' : ''}" type="button" id="nwCard" style="--c:${r.color}"><span class="f"><em>${em}</em><b>${esc(t)}</b><small>atinge ca să întorci</small></span><span class="b"><b>${esc(t)}</b><p>${esc(d)}</p></span></button>
      <div class="row" style="justify-content:center">${flipped ? '<button class="btn light" type="button" id="nwAgain">Mai repet</button><button class="btn" type="button" id="nwKnow">Știu!</button>' : ''}</div>`;
    $('nmBackR').onclick = () => openRegion(r);
    $('nwCard').onclick = () => { flipped = !flipped; SFX.tap(); draw(); };
    const next = () => { flipped = false; i++; if (i >= deck.length) { checkBadge(r); checkAlbum(); return openRegion(r); } draw(); };
    if ($('nwKnow')) $('nwKnow').onclick = () => { if (!sub('words')[t]) { sub('words')[t] = Date.now(); coins(2, `Cartonaș nou în album: ${t}!`); } next(); };
    if ($('nwAgain')) $('nwAgain').onclick = () => { deck.push(deck[i]); next(); };
  };
  draw();
}

/* 3. jocul de sortare */
function sortGame(r) {
  const items = shuffle([...r.sort.items]); let i = 0, miss = 0, lock = false;
  const draw = (fb) => {
    const it = items[i]; if (location.hostname === 'localhost') window.__natAns = it[1];
    root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">${esc(r.sort.title)}</b><span class="pill">${i + 1}/${items.length}</span></div>
      <div class="nm-item ${fb || ''}">${esc(it[0])}</div>
      <div class="nm-buckets">${r.sort.buckets.map((b, k) => `<button class="nm-bucket" type="button" data-k="${k}" style="--c:${r.color}">${esc(b)}</button>`).join('')}</div>
      <p class="nm-hint">Greșeli: ${miss}</p>`;
    $('nmBackR').onclick = () => openRegion(r);
    root.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
      if (lock) return; lock = true;
      const ok = +b.dataset.k === it[1];
      b.classList.add(ok ? 'right' : 'wrong'); root.querySelector(`[data-k="${it[1]}"]`).classList.add('right');
      if (ok) SFX.ok(); else { SFX.no(); miss++; toast(`${it[0]} → ${r.sort.buckets[it[1]]}`); }
      setTimeout(() => { lock = false; i++; if (i < items.length) draw(); else end(); }, ok ? 500 : 1300);
    });
  };
  const end = () => {
    const stars = miss === 0 ? 3 : miss <= 2 ? 2 : 1, prev = sub('sort')[r.id] || 0;
    if (stars > prev) { sub('sort')[r.id] = stars; coins(10 * (stars - prev), `${'★'.repeat(stars)} la „${r.sort.title}”!`); }
    if (stars === 3) confetti();
    checkBadge(r);
    root.innerHTML = `<div class="nm-fact" style="--c:${r.color}"><span>${'⭐'.repeat(stars)}</span><p><b>${stars === 3 ? 'Perfect!' : stars === 2 ? 'Foarte bine!' : 'Bun început!'}</b> Ai greșit de ${miss} ori din ${items.length}.${stars < 2 ? ' Ai nevoie de ★★ pentru insignă.' : ''}</p></div>
      <div class="row" style="justify-content:center"><button class="btn light" type="button" id="nsAgain">Încă o dată</button><button class="btn" type="button" id="nsOk">Gata</button></div>`;
    $('nsAgain').onclick = () => sortGame(r); $('nsOk').onclick = () => openRegion(r);
  };
  draw();
}

/* 3b. circuitul apei: atingi locul de pe desen */
function cycleGame(r) {
  const order = shuffle([...CYCLE]); let i = 0, miss = 0;
  const draw = () => {
    const [part, ask] = order[i]; if (location.hostname === 'localhost') window.__natAns = part;
    root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Circuitul apei</b><span class="pill">${i + 1}/${order.length}</span></div>
      <p class="nm-ask">${esc(ask)}</p>
      <svg class="nm-cycle" viewBox="0 0 320 220" role="img" aria-label="Circuitul apei">
        <rect width="320" height="220" fill="#d7f0ff"/>
        <path d="M0 160 L70 80 L120 130 L160 100 L200 160Z" fill="#9c8f80"/><path d="M60 92 L70 80 L82 92Z" fill="#fff"/>
        <g data-p="mare" class="hit"><path d="M170 175 Q245 160 320 172 V220 H150Z" fill="#2f8fd8"/><text x="250" y="205" class="lb">marea</text></g>
        <path d="M0 175 L170 182 L150 220 H0Z" fill="#8fd18a"/>
        <g data-p="rau" class="hit"><path d="M95 120 C 110 150, 130 160, 175 182" stroke="#5ab8e8" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M95 120 C 110 150, 130 160, 175 182" stroke="transparent" stroke-width="26" fill="none"/></g>
        <g data-p="soare" class="hit"><circle cx="285" cy="35" r="22" fill="#FFC93C"/></g>
        <g data-p="evap" class="hit"><path d="M235 150 V95 M250 150 V95 M265 150 V95" stroke="#ff7a2f" stroke-width="4" stroke-dasharray="6 5"/><path d="M229 100 l6 -10 6 10 M244 100 l6 -10 6 10 M259 100 l6 -10 6 10" fill="#ff7a2f"/><rect x="222" y="88" width="56" height="66" fill="transparent"/></g>
        <g data-p="nor" class="hit"><ellipse cx="150" cy="45" rx="55" ry="22" fill="#fff"/><ellipse cx="120" cy="40" rx="25" ry="18" fill="#fff"/><ellipse cx="180" cy="38" rx="28" ry="20" fill="#fff"/></g>
        <g data-p="ploaie" class="hit"><path d="M115 72 l-6 16 M135 72 l-6 16 M155 72 l-6 16 M175 72 l-6 16 M125 92 l-6 16 M145 92 l-6 16 M165 92 l-6 16" stroke="#2f6fd8" stroke-width="3" stroke-linecap="round"/><rect x="100" y="70" width="80" height="42" fill="transparent"/></g>
      </svg>
      <p class="nm-hint">Greșeli: ${miss}</p>`;
    $('nmBackR').onclick = () => openRegion(r);
    root.querySelectorAll('[data-p]').forEach((g) => g.onclick = () => {
      if (g.dataset.p === part) { SFX.ok(); g.classList.add('right'); i++; setTimeout(() => (i < order.length ? draw() : end()), 450); }
      else { SFX.no(); miss++; g.classList.add('wrong'); const ok = root.querySelector(`[data-p="${part}"]`); ok.classList.add('right'); toast(`Nu. Acolo e ${(CYCLE.find((c) => c[0] === g.dataset.p) || [])[2]}.`); setTimeout(draw, 1100); }
    });
  };
  const end = () => {
    const stars = miss === 0 ? 3 : miss <= 2 ? 2 : 1, prev = N().cycle || 0;
    if (stars > prev) { N().cycle = stars; coins(10 * (stars - prev), `${'★'.repeat(stars)} la circuitul apei!`); }
    checkBadge(r);
    root.innerHTML = `<div class="nm-fact" style="--c:${r.color}"><span>${'⭐'.repeat(stars)}</span><p><b>Circuitul apei:</b> Soarele încălzește marea → apa se evaporă → vaporii se condensează în nori → plouă → râurile duc apa înapoi în mare.</p></div>
      <div class="row" style="justify-content:center"><button class="btn light" type="button" id="ncAgain">Încă o dată</button><button class="btn" type="button" id="ncOk">Gata</button></div>`;
    $('ncAgain').onclick = () => cycleGame(r); $('ncOk').onclick = () => openRegion(r);
  };
  draw();
}

/* Albumul Naturii */
function openAlbum() {
  SFX.tap();
  const learned = sub('words');
  root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmMap">← Harta</button><b class="nm-title">📒 Albumul Naturii</b><span class="pill">${Object.keys(learned).length}/${WORDS.length}</span></div>
    <p class="nm-hint">Fiecare cuvânt de știință învățat lipește un cartonaș. Albumul complet îți aduce <b>Pălăria de explorator</b> și 100 de monede.${N().album ? ' <b>Ai completat albumul!</b>' : ''}</p>
    <div class="nm-album">${REGIONS.map((r) => `<h4 style="color:${r.color}">${r.emoji} ${esc(r.name)}</h4><div class="nm-grid">${r.words.map(([t, d, em]) => learned[t]
      ? `<span class="nm-sticker" style="--c:${r.color}" title="${esc(d)}"><em>${em}</em><b>${esc(t)}</b><small>${esc(d)}</small></span>`
      : '<span class="nm-sticker off"><em>?</em><b>încă nu</b></span>').join('')}</div>`).join('')}</div>`;
  $('nmMap').onclick = openNatura;
}
