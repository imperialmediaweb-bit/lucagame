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
const POS = { viata: [24, 22], animale: [74, 18], apa: [50, 44], om: [80, 58], corpuri: [56, 82], mediu: [20, 68] };
const DECO = { viata: ['🌲', '🍄', '🐞', '🌼'], animale: ['🐾', '🦋', '🐦', '🌿'], apa: ['☁️', '🌧️', '🐟', '🌊'], om: ['🍎', '🏃', '🦷', '💤'], corpuri: ['⚙️', '🧭', '🔩', '🍏'], mediu: ['🌳', '🗑️', '🌻', '♻️'] };
const ORDER = ['viata', 'animale', 'apa', 'om', 'corpuri', 'mediu'];
export function openNatura() {
  SFX.tap(); H.stop && H.stop();
  const badges = Object.keys(sub('badges')).length, learned = Object.keys(sub('words')).length;
  const next = ORDER.map((id) => REGIONS.find((r) => r.id === id)).find((r) => !sub('badges')[r.id] && !steps(r).fog);
  const pts = ORDER.map((id) => POS[id].join(',')).join(' ');
  root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBack">← Acasă</button><b class="nm-title">🗺️ Harta Naturii</b>
      <span class="pill">🏅 ${badges}/6</span><button class="iconbtn" type="button" id="nmAlbum">📒 ${learned}/${WORDS.length}</button></div>
    <div class="nm-map">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="nmSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfeaff"/><stop offset=".35" stop-color="#d9f5c9"/><stop offset="1" stop-color="#9fdc86"/></linearGradient></defs>
        <rect width="100" height="100" fill="url(#nmSky)"/>
        <path d="M0 34 C 18 26, 30 36, 48 30 S 80 22, 100 30 L100 100 L0 100Z" fill="#b5e7a0"/>
        <path d="M0 62 C 20 54, 38 70, 54 58 S 82 50, 100 56 L100 100 L0 100Z" fill="#8fd47a"/>
        <path d="M60 0 C 52 18, 62 30, 52 46 S 40 74, 46 100" stroke="#4fb3e8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
        <path d="M60 0 C 52 18, 62 30, 52 46 S 40 74, 46 100" stroke="#bfe9ff" stroke-width="1.2" fill="none" stroke-dasharray="3 4"/>
        <path d="M78 0 L88 14 L98 0Z" fill="#a39a8f"/><path d="M85 4 L88 8 L91 4Z" fill="#fff"/>
        <polyline points="${pts}" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="2.2 2.2" stroke-linecap="round" opacity=".9"/>
      </svg>
      <span class="nm-cloud c1">☁️</span><span class="nm-cloud c2">☁️</span><span class="nm-sun">☀️</span>
      ${REGIONS.map((r) => { const [x, y] = POS[r.id]; return DECO[r.id].map((e, k) => `<span class="nm-deco" style="left:${x + [-13, 12, -10, 13][k]}%;top:${y + [-7, -5, 8, 7][k]}%;animation-delay:${-k * 0.7}s">${e}</span>`).join(''); }).join('')}
      ${REGIONS.map((r) => { const s = steps(r), n = doneCount(r), [x, y] = POS[r.id], b = sub('badges')[r.id];
        return `<button class="nm-node ${s.fog ? 'fog' : ''} ${b ? 'done' : ''} ${next === r ? 'next' : ''}" type="button" data-r="${r.id}" style="left:${x}%;top:${y}%;--c:${r.color}">
          ${next === r ? '<span class="nm-here">Aici!</span>' : ''}<span class="nm-em">${r.emoji}${b ? '<i class="nm-medal">🏅</i>' : ''}</span><b>${esc(r.name)}</b>
          <span class="nm-prog"><i style="width:${n * 25}%"></i></span><small>${s.fog ? '☁️ încă nu la școală' : b ? 'insignă câștigată' : `${n}/4 pași`}</small></button>`; }).join('')}
    </div>
    <p class="nm-hint">Științe ale naturii · clasa a III-a. În fiecare ținut: <b>citești</b>, <b>înveți cuvintele</b>, <b>joci</b> și <b>exersezi</b> → primești <b>insigna</b>. Cuvintele învățate se lipesc în <b>Album</b>.</p>`;
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
  const tfBest = sub('tf')[r.id] || 0;
  root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmMap">← Harta</button><span class="pill">${sub('badges')[r.id] ? '🏅 Insignă' : `${doneCount(r)}/4 pași`}</span></div>
    <div class="nm-hero" style="--c:${r.color}"><span class="nm-hero-em">${r.emoji}</span><div><b>${esc(r.name)}</b><small>${esc(r.sub)}</small>
      <span class="nm-prog big"><i style="width:${doneCount(r) * 25}%"></i></span></div>${DECO[r.id].map((e, k) => `<em style="right:${6 + k * 9}%;animation-delay:${-k * 0.6}s">${e}</em>`).join('')}</div>
    ${s.fog ? '<p class="nm-hint"><b>La școală încă n-ați ajuns aici</b>, dar poți să te uiți dinainte.</p>' : ''}
    <div class="nm-steps">
      ${card('nsFacts', s.facts, '📖', '1. Ce trebuie să știi', `${r.facts.length} cartonașe, 2 minute`)}
      ${card('nsWords', s.words, '🃏', '2. Cuvinte de știință', `${learned}/${r.words.length} învățate · fiecare intră în album`)}
      ${card('nsGame', s.game, '🎮', '3. Joacă: ' + esc(r.sort.title), best ? `cel mai bun: ${'★'.repeat(best)}${'☆'.repeat(3 - best)}` : 'sortează repede și corect')}
      ${r.id === 'apa' ? card('nsCycle', (N().cycle || 0) >= 2, '🔄', '3b. Circuitul apei', N().cycle ? `${'★'.repeat(N().cycle)}${'☆'.repeat(3 - N().cycle)}` : 'atinge pe desen') : ''}
      ${card('nsEx', s.ex, '✏️', '4. Exerciții', st ? `${'★'.repeat(st)}${'☆'.repeat(3 - st)} · ai nevoie de ★★` : '5 întrebări, cu explicații')}
      ${card('nsTf', tfBest >= 3, '⚡', 'Bonus: Adevărat sau fals?', tfBest ? `cel mai bun: ${'★'.repeat(tfBest)}${'☆'.repeat(3 - tfBest)}` : 'răspunde repede, înainte să se termine timpul')}
    </div>`;
  $('nmMap').onclick = openNatura;
  $('nsFacts').onclick = () => facts(r, 0);
  $('nsTf').onclick = () => tfGame(r);
  $('nsWords').onclick = () => words(r);
  $('nsGame').onclick = () => sortGame(r);
  if ($('nsCycle')) $('nsCycle').onclick = () => cycleGame(r);
  $('nsEx').onclick = () => { close(); onQuizDone(() => { openNatura(); openRegion(r); checkBadge(r); }); startMission(MISSIONS.find((m) => m.id === r.mission)); };
}

/* 1. cartonașele „Ce trebuie să știi” */
function facts(r, i) {
  const [ic, t] = r.facts[i], last = i === r.facts.length - 1;
  root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Ce trebuie să știi</b><span class="pill">${i + 1}/${r.facts.length}</span></div>
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
    root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Cuvinte de știință</b><span class="pill">${i + 1}/${deck.length}</span></div>
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
    root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">${esc(r.sort.title)}</b><span class="pill">${i + 1}/${items.length}</span></div>
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
    root.scrollTop = 0; root.innerHTML = `<div class="nm-fact" style="--c:${r.color}"><span>${'⭐'.repeat(stars)}</span><p><b>${stars === 3 ? 'Perfect!' : stars === 2 ? 'Foarte bine!' : 'Bun început!'}</b> Ai greșit de ${miss} ori din ${items.length}.${stars < 2 ? ' Ai nevoie de ★★ pentru insignă.' : ''}</p></div>
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
    root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">Circuitul apei</b><span class="pill">${i + 1}/${order.length}</span></div>
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
    root.scrollTop = 0; root.innerHTML = `<div class="nm-fact" style="--c:${r.color}"><span>${'⭐'.repeat(stars)}</span><p><b>Circuitul apei:</b> Soarele încălzește marea → apa se evaporă → vaporii se condensează în nori → plouă → râurile duc apa înapoi în mare.</p></div>
      <div class="row" style="justify-content:center"><button class="btn light" type="button" id="ncAgain">Încă o dată</button><button class="btn" type="button" id="ncOk">Gata</button></div>`;
    $('ncAgain').onclick = () => cycleGame(r); $('ncOk').onclick = () => openRegion(r);
  };
  draw();
}

/* Bonus: Adevărat sau fals, contra cronometru */
function tfGame(r) {
  const list = shuffle([...r.tf]); let i = 0, good = 0, timer = null;
  const draw = () => {
    const [t, v] = list[i]; if (location.hostname === 'localhost') window.__natAns = v;
    root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmBackR">← ${esc(r.name)}</button><b class="nm-title">⚡ Adevărat sau fals?</b><span class="pill">${i + 1}/${list.length} · ✓ ${good}</span></div>
      <div class="nm-timer"><i id="tfBar"></i></div>
      <div class="nm-fact" style="--c:${r.color}"><p>${esc(t)}</p></div>
      <div class="nm-tf"><button class="nm-bucket" type="button" data-v="1" style="--c:#23935a">✔ Adevărat</button><button class="nm-bucket" type="button" data-v="0" style="--c:#e04848">✘ Fals</button></div>`;
    $('nmBackR').onclick = () => { clearTimeout(timer); openRegion(r); };
    const bar = $('tfBar'); bar.style.transition = 'none'; bar.style.width = '100%'; requestAnimationFrame(() => { bar.style.transition = 'width 7s linear'; bar.style.width = '0%'; });
    const answer = (pick) => {
      clearTimeout(timer); root.querySelectorAll('[data-v]').forEach((b) => (b.disabled = true));
      const ok = pick === v; if (ok) { good++; SFX.ok(); } else { SFX.no(); toast(pick === null ? `Timpul a expirat! Era ${v ? 'ADEVĂRAT' : 'FALS'}.` : `Nu: e ${v ? 'ADEVĂRAT' : 'FALS'}.`); }
      const btn = root.querySelector(`[data-v="${v}"]`); if (btn) btn.classList.add('right');
      setTimeout(() => { i++; if (i < list.length) draw(); else end(); }, ok ? 450 : 1200);
    };
    timer = setTimeout(() => answer(null), 7000);
    root.querySelectorAll('[data-v]').forEach((b) => b.onclick = () => answer(+b.dataset.v));
  };
  const end = () => {
    const stars = good === list.length ? 3 : good >= list.length - 2 ? 2 : good >= list.length / 2 ? 1 : 0, prev = sub('tf')[r.id] || 0;
    if (stars > prev) { sub('tf')[r.id] = stars; coins(8 * (stars - prev), `${'★'.repeat(stars)} la Adevărat sau fals!`); }
    if (stars === 3) confetti();
    root.scrollTop = 0; root.innerHTML = `<div class="nm-fact" style="--c:${r.color}"><span>${stars ? '⭐'.repeat(stars) : '💪'}</span><p><b>${good} din ${list.length}</b> corecte!${stars < 3 ? ' Mai încearcă pentru ★★★.' : ' Perfect!'}</p></div>
      <div class="row" style="justify-content:center"><button class="btn light" type="button" id="tfAgain">Încă o dată</button><button class="btn" type="button" id="tfOk">Gata</button></div>`;
    $('tfAgain').onclick = () => tfGame(r); $('tfOk').onclick = () => openRegion(r);
  };
  draw();
}

/* Albumul Naturii */
function openAlbum() {
  SFX.tap();
  const learned = sub('words');
  root.scrollTop = 0; root.innerHTML = `<div class="nm-top"><button class="iconbtn" type="button" id="nmMap">← Harta</button><b class="nm-title">📒 Albumul Naturii</b><span class="pill">${Object.keys(learned).length}/${WORDS.length}</span></div>
    <p class="nm-hint">Fiecare cuvânt de știință învățat lipește un cartonaș. Albumul complet îți aduce <b>Pălăria de explorator</b> și 100 de monede.${N().album ? ' <b>Ai completat albumul!</b>' : ''}</p>
    <div class="nm-album">${REGIONS.map((r) => `<h4 style="color:${r.color}">${r.emoji} ${esc(r.name)}</h4><div class="nm-grid">${r.words.map(([t, d, em]) => learned[t]
      ? `<span class="nm-sticker" style="--c:${r.color}" title="${esc(d)}"><em>${em}</em><b>${esc(t)}</b><small>${esc(d)}</small></span>`
      : '<span class="nm-sticker off"><em>?</em><b>încă nu</b></span>').join('')}</div>`).join('')}</div>`;
  $('nmMap').onclick = openNatura;
}
