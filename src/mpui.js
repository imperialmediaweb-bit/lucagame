// Ecranele pentru start și pentru jocul cu colegii: alegerea clasei, camera cu link, Duel, Echipă contra Boss-ului.
import { S, save, G } from './state.js';
import { SFX } from './audio.js';
import { showPanel, toast, confetti, refreshHud } from './ui.js';
import { sendInfo } from './net.js';
import { NET, createRoom, joinRoom, leave, amHost, inviteLink, sendSettings, startGame, stopGame, sendEmote, sendAnswer, setName, EMOTES, esc } from './net.js';
import { TYPE_NAMES } from './content/missions.js';
import { classAnswer, startClass, summon } from './net.js';
import { apiCall, loggedIn } from './account.js';


const $ = (id) => document.getElementById(id);
const GRADES = { 0: 'Pregătitoare', 1: 'Clasa I', 2: 'Clasa a II-a', 3: 'Clasa a III-a', 4: 'Clasa a IV-a' };
const SUBJECTS = { mix: 'Amestecat', mate: 'Matematică', romana: 'Română', test: 'Ca la test', stiinte: 'Științe', civica: 'Civică', engleza: 'Engleză' };
const pills = (obj, cur, attr) => Object.entries(obj).map(([k, v]) => `<button class="tab ${String(k) === String(cur) ? 'on' : ''}" type="button" ${attr}="${k}">${v}</button>`).join('');

/* ---------- ecranul de start ---------- */
export function showStart(onSolo) {
  const invite = new URLSearchParams(location.search).get('camera');
  let grade = G();
  const draw = () => {
    showPanel(`<div class="eyebrow">${invite ? 'Ai primit o invitație' : 'Bun venit!'}</div><h2>Mintoria</h2>
      ${invite ? `<p>Un coleg te-a chemat să jucați împreună în camera <b>${esc(invite.toUpperCase())}</b>.</p>` : ''}
      <label for="stName"><b>Cum te cheamă?</b></label>
      <input id="stName" maxlength="14" autocomplete="off" value="${esc(S.name)}" placeholder="Prenumele tău" style="font:700 20px var(--font-b);padding:10px 12px;border:2px solid var(--ink);border-radius:12px">
      ${invite ? '' : `<b>În ce clasă ești?</b><div class="tabs" id="stGrade">${pills(GRADES, grade, 'data-g')}</div>`}
      <div class="row">${invite ? '<button class="btn light" type="button" id="stSolo">Joc singur</button><button class="btn" type="button" id="stJoin">Intră în joc</button>'
        : '<button class="btn light" type="button" id="stMulti">Joacă cu colegii</button><button class="btn" type="button" id="stSolo">Joacă singur</button>'}</div>`);
    $('panel').dataset.lock = '1';
    if (!invite) $('stGrade').querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { grade = +b.dataset.g; S.name = $('stName').value; draw(); });
    const go = () => { const n = $('stName').value.trim(); if (!n) { toast('Scrie-ți prenumele, ca să te recunoască colegii.'); $('stName').focus(); return false; } setName(n); if (!invite) { S.grade = grade; save(); } return true; };
    $('stSolo').onclick = () => { if (!go()) return; unlock(); onSolo(); };
    if ($('stMulti')) $('stMulti').onclick = () => { if (!go()) return; unlock(); openCreate(); };
    if ($('stJoin')) $('stJoin').onclick = async () => { if (!go()) return; unlock(); try { await joinRoom(invite); } catch (e) { toast(e.message); } };
  };
  draw();
}
const unlock = () => { delete $('panel').dataset.lock; $('panel').hidden = true; };

/* ---------- creare cameră ---------- */
export function openCreate() {
  let grade = G(), subject = 'mix';
  const draw = () => {
    showPanel(`<div class="eyebrow">Joacă cu colegii</div><h2>Fă o cameră de joc</h2>
      <p>Alegi clasa și materia, apoi trimiți linkul colegilor. Ei intră doar cu prenumele, fără cont.</p>
      <b>Clasa</b><div class="tabs" id="cGrade">${pills({ [G()]: GRADES[G()] }, grade, 'data-g')}</div>
      <b>Ce exersăm?</b><div class="tabs" id="cSub">${pills(grade === 3 ? SUBJECTS : { mix: 'Amestecat', mate: 'Matematică', romana: 'Română' }, subject, 'data-s')}</div>
      <div class="row"><button class="btn light" type="button" data-close>Înapoi</button><button class="btn" type="button" id="cGo">Fă camera</button></div>`);
    $('cGrade').querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { grade = +b.dataset.g; if (grade !== 3 && subject === 'test') subject = 'mix'; draw(); });
    $('cSub').querySelectorAll('[data-s]').forEach((b) => b.onclick = () => { subject = b.dataset.s; draw(); });
    $('cGo').onclick = async () => { $('cGo').disabled = true; try { await createRoom(grade, subject); } catch (e) { toast(e.message); $('cGo').disabled = false; } };
  };
  draw();
}

/* ---------- camera de joc ---------- */
export function roomChanged() {
  const b = $('roomBtn');
  if (!NET.room) { b.hidden = true; return; }
  b.hidden = false; b.textContent = `Camera ${NET.room.code} · ${NET.room.players.length}`;
  if (!$('panel').hidden && $('panelCard').querySelector('#lobby')) openLobby();
}
export function openLobby() {
  if (!NET.room) { openCreate(); return; }
  const r = NET.room, host = amHost(), link = inviteLink();
  const hostName = (r.players.find((p) => p.host) || {}).name || 'gazda';
  if (!openLobby.sent) { openLobby.sent = 1; sendInfo(); setTimeout(() => (openLobby.sent = 0), 3000); }
  const msg = `Hai să ne jucăm împreună în Mintoria! Intră aici: ${link}`;
  showPanel(`<div id="lobby"></div><div class="eyebrow">Camera de joc · ${GRADES[r.grade]} · ${SUBJECTS[r.subject]}</div><h2>Camera ${esc(r.code)}</h2>
    <p>Trimite linkul colegilor:</p>
    <input readonly value="${esc(link)}" id="lnk" style="font:700 15px var(--font-b);padding:8px 10px;border:2px solid var(--ink);border-radius:10px;width:100%;box-sizing:border-box">
    <div class="row" style="justify-content:flex-start">
      <a class="btn" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" style="text-decoration:none">Trimite pe WhatsApp</a>
      <button class="btn light" type="button" id="lCopy">Copiază linkul</button>
      ${navigator.share ? '<button class="btn light" type="button" id="lShare">Trimite…</button>' : ''}
    </div>
    <b>Jucători (${r.players.length})</b>
    <div class="tabs">${r.players.map((p) => `<button class="tab ${p.id === NET.you ? 'on' : ''}" type="button" data-pl="${p.id}">${esc(p.name)}${p.info ? ` · nv. ${p.info.lv}` : ''}${p.host ? ' · gazdă' : ''}</button>`).join('')}</div>
    <div id="plInfo"></div>
    <div class="row" style="justify-content:flex-start"><button class="btn light" type="button" id="lSummon">Cheamă colegii la mine</button></div>
    <b>Mesaje rapide</b><div class="tabs">${EMOTES.map((e, i) => `<button class="tab" type="button" data-e="${i}">${e}</button>`).join('')}</div>
    ${host ? `<b>Clasa</b><div class="tabs" id="lGrade">${pills({ [r.grade]: GRADES[r.grade] }, r.grade, 'data-g')}</div>
      <b>Ce exersăm?</b><div class="tabs" id="lSub">${pills(r.grade === 3 ? SUBJECTS : { mix: 'Amestecat', mate: 'Matematică', romana: 'Română' }, r.subject, 'data-s')}</div>
      <b>Alege jocul</b>
      <div class="shopgrid">
        <button class="item" type="button" id="gDuel"><b>Duel</b><span>Aceeași problemă pentru toți. Cine răspunde corect mai repede ia mai multe puncte.</span></button>
        <button class="item" type="button" id="gTeam"><b>Echipa contra Boss-ului</b><span>Toți împreună. Fiecare răspuns bun îi scade viața Boss-ului.</span></button>
      </div>${classButtons(r)}` : `<p>Așteaptă ca <b>${esc(hostName)}</b> să pornească jocul. Până atunci, plimbă-te pe insulă cu colegii!</p>`}
    <div class="row"><button class="btn light" type="button" id="lLeave">Ieși din cameră</button><button class="btn" type="button" data-close>Pe insulă</button></div>`);
  $('lCopy').onclick = async () => { try { await navigator.clipboard.writeText(link); toast('Linkul e copiat. Lipește-l în mesaj.'); } catch { $('lnk').select(); toast('Selectat. Apasă Copiază din meniu.'); } };
  $('panelCard').querySelectorAll('[data-pl]').forEach((b) => b.onclick = () => playerCard(+b.dataset.pl));
  if ($('lShare')) $('lShare').onclick = () => navigator.share({ title: 'Mintoria', text: msg, url: link }).catch(() => {});
  $('panelCard').querySelectorAll('[data-e]').forEach((b) => b.onclick = () => { sendEmote(+b.dataset.e); SFX.tap(); });
  $('lSummon').onclick = () => { const h = CH.here(); summon(h.x, h.z, h.area ? h.area + '|' + h.place : '|' + h.place); toast('I-ai chemat pe colegi la tine!'); };
  $('lLeave').onclick = () => { leave(); $('panel').hidden = true; toast('Ai ieșit din cameră.'); };
  if (host) {
    $('lGrade').querySelectorAll('[data-g]').forEach((b) => b.onclick = () => sendSettings(+b.dataset.g, +b.dataset.g !== 3 && r.subject === 'test' ? 'mix' : r.subject));
    $('lSub').querySelectorAll('[data-s]').forEach((b) => b.onclick = () => sendSettings(r.grade, b.dataset.s));
    $('gDuel').onclick = () => startGame('duel'); $('gTeam').onclick = () => startGame('team'); bindClassButtons();
  }
}

/* ---------- jocul în rețea ---------- */
let timerI = null, lastReveal = null;
const card = () => $('quizCard');
function bossBar() {
  const g = NET.game; if (!g || g.mode !== 'team') return '';
  const p = Math.max(0, Math.round(100 * g.bossHp / g.bossMax));
  return `<div id="bossWrap" class="bar" style="grid-template-columns:auto minmax(0,1fr) 48px"><b>Boss</b><span class="tr" style="height:14px"><i style="width:${p}%;background:var(--bad)"></i></span><span class="n">${p}%</span></div>`;
}
export function mpGameStart(m) {
  document.body.dataset.act = m.mode;
  $('panel').hidden = true; $('quiz').hidden = false;
  card().innerHTML = `<div class="eyebrow">${m.mode === 'team' ? 'Echipa contra Boss-ului' : 'Duel'} · ${m.n} probleme</div>
    <h2>${m.mode === 'team' ? 'Toți împreună! Fiecare răspuns bun lovește Boss-ul.' : 'Cine răspunde corect primul ia puncte în plus!'}</h2>
    <div class="big">Pregătiți-vă…</div><p>Ai ciornă la fiecare problemă. Gândește, apoi răspunde: răspunsul greșit nu primește puncte.</p>`;
  SFX.fanfare();
}
export function mpQuestion() {
  const q = NET.q; clearInterval(timerI); lastReveal = null;
  $('quiz').hidden = false; $('panel').hidden = true;
  const body = q.kind === 'tap'
    ? `<div class="toks">${q.toks.map((t, k) => /^[+−×:]$/.test(t) ? `<button class="tok op" type="button" data-k="${k}">${t}</button>` : `<span class="tok">${t}</span>`).join('')}</div>`
    : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
  card().innerHTML = `<div class="eyebrow">${NET.game && NET.game.mode === 'team' ? 'Echipa' : 'Duel'} · problema ${q.i + 1} din ${q.n} · ${esc(TYPE_NAMES[q.type] || '')}</div>
    ${bossBar()}
    <div class="bar" style="grid-template-columns:minmax(0,1fr) 44px"><span class="tr"><i id="mpT" style="width:100%;background:var(--accent)"></i></span><span class="n" id="mpS">${q.secs}s</span></div>
    <div class="q">${esc(q.text)}${q.expr ? `<span class="expr">${esc(q.expr)}</span>` : ''}</div>
    <div class="tools"><button class="tool" type="button" id="tDraft">Ciornă</button></div>
    ${body}<div id="mpInfo" class="hint" hidden></div>`;
  card().querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => {
    if (NET.myChoice !== null) return; sendAnswer(+b.dataset.k); SFX.tap();
    card().querySelectorAll('[data-k]').forEach((x) => { x.disabled = true; if (x === b) x.style.outline = '4px solid var(--accent)'; });
    $('mpInfo').hidden = false; $('mpInfo').textContent = 'Ai răspuns! Așteptăm colegii…';
  }));
  $('tDraft').onclick = () => document.dispatchEvent(new CustomEvent('open-draft'));
  timerI = setInterval(() => {
    const left = Math.max(0, q.secs - (performance.now() - q.t0) / 1000);
    const t = $('mpT'); if (!t) { clearInterval(timerI); return; }
    t.style.width = (100 * left / q.secs) + '%'; $('mpS').textContent = Math.ceil(left) + 's';
    if (left <= 0) clearInterval(timerI);
  }, 250);
}
export function mpAnswered(m) { const i = $('mpInfo'); if (i && NET.myChoice !== null) i.textContent = `Ai răspuns! Au răspuns ${m.count} din ${m.total}.`; }
export function mpReveal(m) {
  clearInterval(timerI); lastReveal = m;
  document.dispatchEvent(new CustomEvent('close-draft'));
  const q = NET.q, mine = m.res.find((r) => r.id === NET.you) || { ok: false, pts: 0 };
  card().querySelectorAll('[data-k]').forEach((b) => {
    const k = +b.dataset.k; b.disabled = true;
    const right = q.kind === 'tap' ? k === m.ans : q.opts[k] === m.ans;
    if (right) b.classList.add('right'); else if (k === NET.myChoice) b.classList.add('wrong');
  });
  if (mine.ok) { SFX.ok(); confetti(); } else SFX.no();
  const top = [...m.res].sort((a, b) => b.score - a.score).slice(0, 5);
  const info = $('mpInfo'); if (info) info.hidden = true;
  const bw = $('bossWrap'); if (bw) bw.outerHTML = bossBar();
  card().insertAdjacentHTML('beforeend', `<div class="fb ${mine.ok ? 'ok' : 'no'}"><b>${mine.ok ? `Corect! +${mine.pts} puncte` : NET.myChoice === null ? 'Timpul a expirat. Răspuns: ' + esc(m.ansText) : 'Nu chiar. Răspuns: ' + esc(m.ansText)}</b>
    <span>Așa se rezolvă:</span><ol>${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
    <div class="jgrade">${top.map((r, i) => `<div class="jrow" style="grid-template-columns:28px minmax(0,1fr) auto"><b>${i + 1}.</b><span>${esc(r.name)} ${r.ok ? '✔' : ''}</span><b>${r.score}</b></div>`).join('')}</div>
    <p style="color:var(--muted)">Următoarea problemă vine imediat…</p>`);
  if (NET.game && NET.game.mode === 'team' && NET.game.bossHp <= 0) toast('Boss-ul a căzut! Bravo, echipă!');
}
export function mpEnd(m) {
  clearInterval(timerI); document.dispatchEvent(new CustomEvent('close-draft'));
  const meIdx = m.ranking.findIndex((r) => r.id === NET.you), me = m.ranking[meIdx];
  const coins = Math.round((me ? me.score : 0) / 50); S.coins += coins; save(); refreshHud();
  const title = m.mode === 'team' ? (m.won ? 'Ați învins Boss-ul!' : 'Boss-ul a scăpat de data asta.') : meIdx === 0 ? 'Ai câștigat duelul!' : `Locul ${meIdx + 1}!`;
  if (m.won || meIdx === 0) { SFX.fanfare(); confetti(); }
  card().innerHTML = `<div class="eyebrow">${m.mode === 'team' ? 'Echipa contra Boss-ului' : 'Duel'} · final</div><h2>${title}</h2>
    <div class="jgrade">${m.ranking.map((r, i) => `<div class="jrow" style="grid-template-columns:28px minmax(0,1fr) auto${r.id === NET.you ? ';border-color:var(--accent)' : ''}"><b>${i + 1}.</b><span>${esc(r.name)}</span><b>${r.score}</b></div>`).join('')}</div>
    <p>Ai primit <b>${coins} monede</b> pentru punctele tale.</p>
    <div class="row">${amHost() ? '<button class="btn light" type="button" id="eAgain">Încă un joc</button>' : ''}<button class="btn" type="button" id="eBack">Înapoi pe insulă</button></div>`;
  if ($('eAgain')) $('eAgain').onclick = () => { $('quiz').hidden = true; openLobby(); };
  $('eBack').onclick = () => { $('quiz').hidden = true; };
}
export { stopGame };

/* ---------- testul în clasă ---------- */
let CH = {}; // legături către lumea 3D: toSeat, toPodium, backHub, drawBoard
export const setClassHooks = (h) => { CH = h; };
let CT = null;
const fmtT = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const nameOf = (id) => ((NET.room && NET.room.players.find((p) => p.id === id)) || {}).name || 'coleg';
function boardUpdate() {
  if (!CT) return;
  const lines = [...CT.prog.entries()].map(([id, p]) => ({ text: `${nameOf(id)}: ${p.done}/${CT.qs.length}${p.ms ? ' ✔ ' + fmtT(p.ms) : ''}`, done: !!p.ms }));
  CH.drawBoard && CH.drawBoard(`Test de ${CT.sub === 'romana' ? 'română' : 'matematică'}`, lines);
}
export function classStart(m) {
  document.body.dataset.act = 'class';
  $('panel').hidden = true;
  CT = { qs: m.qs, i: 0, sub: m.sub, t0: performance.now(), limit: m.limitMs, prog: new Map(), mySeat: (m.seats.find((s) => s.id === NET.you) || { seat: 0 }).seat };
  m.seats.forEach((s) => CT.prog.set(s.id, { done: 0, ms: 0 }));
  CH.toSeat && CH.toSeat(CT.mySeat);
  boardUpdate(); SFX.fanfare();
  $('quiz').hidden = false;
  card().innerHTML = `<div class="eyebrow">Testul în clasă</div><h2>Toată lumea în bănci!</h2>
    <p>Primești <b>${m.qs.length} exerciții</b>, aceleași pentru toți colegii. Lucrezi în ritmul tău. Nu vezi răspunsurile până la final, ca la un test adevărat.</p>
    <p>Câștigă cine are <b>nota cea mai mare</b>. La egalitate, cine a terminat <b>mai repede</b>. Primii trei urcă pe podium!</p>
    <div class="row"><button class="btn" type="button" id="cGo">Încep testul</button></div>`;
  $('cGo').onclick = () => { CT.t0 = performance.now(); classQ(); };
}
function classQ() {
  if (!CT) return;
  const q = CT.qs[CT.i];
  if (!q) return classWait();
  const body = q.kind === 'tap'
    ? `<div class="toks">${q.toks.map((t, k) => /^[+−×:]$/.test(t) ? `<button class="tok op" type="button" data-k="${k}">${t}</button>` : `<span class="tok">${t}</span>`).join('')}</div>`
    : `<div class="opts">${q.opts.map((o, k) => `<button class="opt" type="button" data-k="${k}">${esc(o)}</button>`).join('')}</div>`;
  card().innerHTML = `<div class="eyebrow">Testul în clasă · exercițiul ${CT.i + 1} din ${CT.qs.length} · <span id="cTime">0:00</span></div>
    <div class="dots">${CT.qs.map((_, k) => `<i class="${k < CT.i ? 'ok' : k === CT.i ? 'now' : ''}"></i>`).join('')}</div>
    <div class="q">${esc(q.text)}${q.expr ? `<span class="expr">${esc(q.expr)}</span>` : ''}</div>
    <div class="tools"><button class="tool" type="button" id="tDraft">Ciornă</button></div>${body}`;
  $('tDraft').onclick = () => document.dispatchEvent(new CustomEvent('open-draft'));
  card().querySelectorAll('[data-k]').forEach((b) => b.onclick = () => {
    card().querySelectorAll('[data-k]').forEach((x) => (x.disabled = true)); b.style.outline = '4px solid var(--accent)'; SFX.tap();
    classAnswer(CT.i, +b.dataset.k); CT.i++; document.dispatchEvent(new CustomEvent('close-draft')); setTimeout(classQ, 250);
  });
  tickClock();
}
let clockI = null;
function tickClock() { clearInterval(clockI); clockI = setInterval(() => { const el = $('cTime'); if (!el || !CT) { clearInterval(clockI); return; } el.textContent = fmtT(performance.now() - CT.t0); }, 500); }
function classWait() {
  if (!CT) return;
  const me = CT.prog.get(NET.you) || {};
  card().innerHTML = `<div class="eyebrow">Testul în clasă</div><h2>Ai terminat${me.ms ? ' în ' + fmtT(me.ms) : ''}!</h2>
    <p>Așteptăm și colegii. Rezultatele apar când termină toți (sau când gazda strânge lucrările).</p>
    <div class="jgrade">${[...CT.prog.entries()].map(([id, p]) => `<div class="jrow" style="grid-template-columns:minmax(0,1fr) auto"><span>${esc(nameOf(id))}</span><b>${p.ms ? '✔ ' + fmtT(p.ms) : p.done + '/' + CT.qs.length}</b></div>`).join('')}</div>
    ${amHost() ? '<div class="row"><button class="btn light" type="button" id="cStop">Strânge lucrările</button></div>' : ''}`;
  if ($('cStop')) $('cStop').onclick = () => stopGame();
}
export function classProgress(m) {
  if (!CT) return; CT.prog.set(m.id, { done: m.done, ms: m.ms }); boardUpdate();
  if (CT.i >= CT.qs.length) classWait();
}
export function classEnd(m) {
  clearInterval(clockI); document.dispatchEvent(new CustomEvent('close-draft'));
  const qs = CT ? CT.qs : [], idx = m.res.findIndex((r) => r.id === NET.you), me = m.res[idx];
  const prize = idx === 0 ? 100 : idx === 1 ? 70 : idx === 2 ? 50 : 20, coins = prize + (me ? me.correct * 5 : 0);
  if (me) { S.coins += coins; S.xp = (S.xp || 0) + 20 + me.correct * 10; save(); refreshHud(); }
  if (loggedIn() && me) apiCall('score', 'POST', { board: 'clasa-' + (m.sub === 'romana' ? 'romana' : 'mate'), score: Math.round(me.nota * 100), ms: me.ms }).catch(() => {});
  m.res.slice(0, 3).forEach((r, i) => { if (r.id === NET.you) CH.toPodium && CH.toPodium(i + 1); });
  if (idx > 2) CH.toFront && CH.toFront(idx);
  CH.drawBoard && CH.drawBoard('Podium', m.res.slice(0, 6).map((r, i) => ({ text: `${i + 1}. ${r.name} · nota ${String(r.nota).replace('.', ',')} · ${fmtT(r.ms)}`, done: i < 3 })));
  if (idx >= 0 && idx < 3) { SFX.fanfare(); confetti(); } else SFX.star();
  const medal = ['🥇', '🥈', '🥉'];
  const review = me ? qs.map((q, i) => me.right[i] ? '' : `<li><b>${esc(q.text)} ${esc(q.expr || '')}</b><br>Răspuns corect: <b>${esc(m.key[i].ansText)}</b><br><small>${m.key[i].steps.map(esc).join(' · ')}</small></li>`).join('') : '';
  card().innerHTML = `<div class="eyebrow">Testul în clasă · rezultate</div><h2>${idx === 0 ? 'Locul 1! Campion!' : idx >= 0 ? `Locul ${idx + 1}` : 'Rezultate'}</h2>
    <div class="jgrade">${m.res.map((r, i) => `<div class="jrow" style="grid-template-columns:34px minmax(0,1fr) auto auto${r.id === NET.you ? ';border-color:var(--accent)' : ''}"><b>${medal[i] || i + 1 + '.'}</b><span>${esc(r.name)}</span><b>nota ${String(r.nota).replace('.', ',')}</b><small>${fmtT(r.ms)}${r.finished ? '' : ' (n-a terminat)'}</small></div>`).join('')}</div>
    ${me ? `<p>Ai primit <b>${coins} monede</b> (${prize} pentru loc + ${me.correct * 5} pentru răspunsurile corecte).</p>` : ''}
    ${review ? `<div class="fb no"><b>De învățat din greșeli</b><ol>${review}</ol></div>` : me ? '<div class="fb ok"><b>Toate corecte! Felicitări!</b></div>' : ''}
    <div class="row">${amHost() ? '<button class="btn light" type="button" id="cAgain">Alt test</button>' : ''}<button class="btn" type="button" id="cBack">Rămân la podium</button><button class="btn light" type="button" id="cHub">Înapoi pe insulă</button></div>`;
  $('cBack').onclick = () => { $('quiz').hidden = true; };
  $('cHub').onclick = () => { $('quiz').hidden = true; CH.backHub && CH.backHub(); };
  if ($('cAgain')) $('cAgain').onclick = () => { $('quiz').hidden = true; openLobby(); };
  CT = null;
}
export function classButtons(r) {
  const g3 = r.grade === 3;
  return `<b>Test în clasă</b><div class="shopgrid">
    <button class="item" type="button" data-cls="mate|${g3 ? 'test' : 'normal'}"><b>Test de matematică</b><span>${g3 ? 'ca testul primit, cu notă' : 'cu notă, toți în bănci'}</span></button>
    <button class="item" type="button" data-cls="mate|usor"><b>Matematică ușor</b><span>calcule rapide, 8 exerciții</span></button>
    <button class="item" type="button" data-cls="romana|normal"><b>Test de română</b><span>ortograme, părți de vorbire</span></button>
  </div>`;
}
export function bindClassButtons() { document.querySelectorAll('[data-cls]').forEach((b) => b.onclick = () => { const [sub, level] = b.dataset.cls.split('|'); startClass(sub, level); }); }

/* ---------- un coleg te cheamă la el ---------- */
export function summonUI(m) {
  const [area, place] = String(m.place || '|').split('|');
  SFX.talk();
  showPanel(`<div class="eyebrow">Invitație</div><h2>${esc(m.name)} te cheamă!</h2><p>E la <b>${esc(place || 'insulă')}</b>. Mergi lângă el?</p>
    <div class="row"><button class="btn light" type="button" data-close>Nu acum</button><button class="btn" type="button" id="smGo">Mergi</button></div>`);
  $('smGo').onclick = () => { $('panel').hidden = true; CH.goNear(m.x, m.z, area || null); };
}

// fișa unui coleg: nivel, stele, notă, cât a făcut din materie (fără greșelile lui)
function playerCard(id) {
  const p = (NET.room.players || []).find((x) => x.id === id), el = $('plInfo'); if (!p || !el) return;
  const i = p.info || {}, pct = i.pt ? Math.round(100 * i.pr / i.pt) : 0;
  el.innerHTML = `<div class="plcard"><b>${esc(p.name)}</b><div class="plstats">
    <span><em>${i.lv || 1}</em>nivel</span><span><em>${i.st || 0}</em>stele</span><span><em>${i.tb ? String(i.tb).replace('.', ',') : '–'}</em>nota la test</span></div>
    <small>Materia clasei: ${i.pr || 0} din ${i.pt || 0} capitole</small><div class="pl-bar"><i style="width:${pct}%"></i></div></div>`;
}
