// Clasa mea (permanentă, cu aprobarea șefului clasei) și Prietenii. Datele stau pe server, legate de profil.
import { S } from './state.js';
import { SFX } from './audio.js';
import { showPanel, toast } from './ui.js';
import { apiCall, loggedIn } from './account.js';
import { NET, createRoom, joinRoom } from './net.js';
import { openLobby } from './mpui.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lvl = (xp) => Math.floor(Math.sqrt((xp || 0) / 40)) + 1;
const GR = { 0: 'Pregătitoare', 1: 'cl. I', 2: 'cl. a II-a', 3: 'cl. a III-a', 4: 'cl. a IV-a' };
const ago = (t) => { if (!t) return 'încă n-a jucat'; const m = (Date.now() - t) / 60000; return m < 10 ? 'activ acum' : m < 60 ? `acum ${Math.round(m)} min` : m < 1440 ? `acum ${Math.round(m / 60)} ore` : `acum ${Math.round(m / 1440)} zile`; };
const avatar = (c) => `<span class="sc-av" style="background:${esc((c.look && c.look.shirt) || '#7B5CF6')}"><i style="background:${esc((c.look && c.look.skin) || '#f1c9a5')}"></i></span>`;
const TROPHIES = [[50, 'Clasa Curioasă'], [150, 'Clasa Harnică'], [300, 'Clasa Isteață'], [600, 'Clasa Campioană'], [1000, 'Clasa Legendară']];
const linkFor = (code) => `${location.origin}${location.pathname}?clasa=${code}`;
let curClass = null, tab = 'colegi';

function needProfile(what) {
  showPanel(`<div class="eyebrow">${esc(what)}</div><h2>Ai nevoie de profil</h2>
    <p>Clasa și prietenii se păstrează pe server, legate de profilul tău (username + PIN). Așa te găsesc colegii oricând.</p>
    <div class="row"><button class="btn light" type="button" data-close>Mai târziu</button><button class="btn" type="button" id="scProf">Fac profil</button></div>`);
  $('scProf').onclick = () => window.__profile && window.__profile();
}

/* ---------- Clasa mea ---------- */
export async function openClass(code) {
  if (!loggedIn()) return needProfile('Clasa mea');
  showPanel('<div class="eyebrow">Clasa mea</div><h2>Se încarcă…</h2>');
  let soc; try { soc = await apiCall('social'); } catch (e) { return showPanel(`<h2>Nu merge acum</h2><p>${esc(e.message)}</p><div class="row"><button class="btn" type="button" data-close>Închide</button></div>`); }
  const pick = code || curClass || (soc.classes[0] && soc.classes[0].code);
  if (!pick) return classStart(soc);
  curClass = pick; return classView(pick, soc);
}
function classStart(soc) {
  showPanel(`<div class="eyebrow">Clasa mea</div><h2>Fă-ți clasa în Mintoria</h2>
    <p>Clasa rămâne mereu: vezi colegii, clasamentul săptămânii și trofeele clasei, și jucați împreună oricând.</p>
    ${soc.waiting.length ? `<div class="fb"><b>Aștepți să fii primit în:</b> ${soc.waiting.map((w) => esc(w.name)).join(', ')}</div>` : ''}
    <div class="sc-box"><b>Fac o clasă nouă</b><span>Tu vei fi șeful clasei și îi primești pe colegi.</span>
      <div class="row" style="margin:0"><input id="scName" maxlength="32" placeholder="ex: a III-a B, Școala 5"><button class="btn" type="button" id="scNew">Fac clasa</button></div></div>
    <div class="sc-box"><b>Intru în clasa colegilor</b><span>Scrie codul primit de la colegi (6 caractere).</span>
      <div class="row" style="margin:0"><input id="scCode" maxlength="6" placeholder="ABC123" style="text-transform:uppercase"><button class="btn" type="button" id="scJoin">Cer să intru</button></div></div>
    <div class="row"><button class="btn light" type="button" data-close>Închide</button></div>`);
  $('scNew').onclick = async () => { try { const r = await apiCall('class/create', 'POST', { name: $('scName').value }); SFX.star(); toast(`Ai făcut clasa „${r.name}”!`); curClass = r.code; openClass(r.code); } catch (e) { toast(e.message); } };
  $('scJoin').onclick = () => requestJoin($('scCode').value);
}
export async function requestJoin(code) {
  code = String(code || '').toUpperCase().trim();
  try {
    const r = await apiCall('class/join', 'POST', { code });
    if (r.member) { toast(`Ești deja în clasa „${r.name}”.`); curClass = code; return openClass(code); }
    SFX.talk(); showPanel(`<div class="eyebrow">Clasa mea</div><h2>Ai cerut să intri în „${esc(r.name)}”</h2><p>Șeful clasei trebuie să te primească. Când te primește, clasa apare aici, la „Clasa mea”.</p><div class="row"><button class="btn" type="button" data-close>Bine</button></div>`);
  } catch (e) { toast(e.message); }
}
async function classView(code, soc) {
  let K; try { K = await apiCall('class?code=' + code); } catch (e) { curClass = null; toast(e.message); return classStart(soc); }
  const me = (S.name || '').toLowerCase(), byWeek = [...K.members].sort((a, b) => b.weekXp - a.weekXp || b.xp - a.xp);
  const stars = K.members.reduce((a, m) => a + m.stars, 0), next = TROPHIES.find(([n]) => stars < n);
  const tabs = [['colegi', `Colegii (${K.members.length})`], ['top', 'Clasamentul săptămânii'], ['trofee', 'Trofeele clasei'], ...(K.owner ? [['cereri', `Cereri (${K.pending.length})`]] : [])];
  if (!tabs.some(([k]) => k === tab)) tab = 'colegi';
  const body = {
    colegi: `<div class="sc-list">${K.members.map((m) => `<div class="sc-row">${avatar(m)}<span><b>${esc(m.username)}${m.owner ? ' · șeful clasei' : ''}</b><small>${GR[m.grade] || ''} · nivelul ${lvl(m.xp)} · ★ ${m.stars} · ${ago(m.seen)}</small></span>${K.owner && !m.owner ? `<button class="tool" type="button" data-kick="${esc(m.username)}" aria-label="Scoate">✕</button>` : ''}</div>`).join('')}</div>`,
    top: `<p>Cine a lucrat cel mai mult săptămâna asta (puncte de experiență, din luni).</p><div class="sc-list">${byWeek.map((m, i) => `<div class="sc-row ${i < 3 && m.weekXp ? 'medal m' + i : ''}"><em class="sc-rank">${i + 1}</em>${avatar(m)}<span><b>${esc(m.username)}</b><small>nivelul ${lvl(m.xp)}</small></span><b class="sc-pts">${m.weekXp} p</b></div>`).join('')}</div>`,
    trofee: `<p>Toate stelele adunate de toți colegii: <b>${stars} ★</b></p>${next ? `<div class="pl-bar"><i style="width:${Math.round(100 * stars / next[0])}%"></i></div><p>Următorul trofeu: <b>${next[1]}</b> la ${next[0]} ★</p>` : '<p><b>Ați câștigat toate trofeele!</b></p>'}
      <div class="sc-troph">${TROPHIES.map(([n, t]) => `<span class="${stars >= n ? 'on' : ''}"><i>🏆</i><b>${t}</b><small>${n} ★</small></span>`).join('')}</div>`,
    cereri: K.pending.length ? `<p>Primește doar copiii pe care îi cunoști din clasă.</p><div class="sc-list">${K.pending.map((m) => `<div class="sc-row">${avatar(m)}<span><b>${esc(m.username)}</b><small>${GR[m.grade] || ''} · nivelul ${lvl(m.xp)}</small></span><button class="tool" type="button" data-no="${esc(m.username)}">Nu</button><button class="btn" type="button" data-yes="${esc(m.username)}">Primește</button></div>`).join('')}</div>` : '<p>Nu sunt cereri noi.</p>'
  }[tab];
  showPanel(`<div class="eyebrow">Clasa mea · cod ${esc(K.code)}</div><h2>${esc(K.name)}</h2>
    ${soc.classes.length > 1 ? `<div class="tabs">${soc.classes.map((c) => `<button class="tab ${c.code === code ? 'on' : ''}" type="button" data-cls="${c.code}">${esc(c.name)}</button>`).join('')}</div>` : ''}
    <div class="row" style="justify-content:flex-start;margin:0"><button class="btn" type="button" id="scPlay">${K.room ? `Intră în camera clasei (${esc(K.room)})` : 'Joacă acum cu clasa'}</button><button class="btn light" type="button" id="scLink">Trimite linkul clasei</button></div>
    <div class="tabs">${tabs.map(([k, n]) => `<button class="tab ${k === tab ? 'on' : ''}" type="button" data-tab="${k}">${n}</button>`).join('')}</div>
    ${body}
    <div class="row"><button class="btn light" type="button" id="scOther">Altă clasă</button><button class="btn light" type="button" id="scLeave">Ies din clasă</button><button class="btn" type="button" data-close>Închide</button></div>`);
  const card = $('panelCard');
  card.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { tab = b.dataset.tab; classView(code, soc); });
  card.querySelectorAll('[data-cls]').forEach((b) => b.onclick = () => { curClass = b.dataset.cls; classView(curClass, soc); });
  card.querySelectorAll('[data-yes],[data-no]').forEach((b) => b.onclick = async () => { const who = b.dataset.yes || b.dataset.no; try { await apiCall('class/approve', 'POST', { code, username: who, ok: !!b.dataset.yes }); if (b.dataset.yes) { SFX.star(); toast(`${who} e acum în clasă!`); } openClass(code); } catch (e) { toast(e.message); } });
  card.querySelectorAll('[data-kick]').forEach((b) => b.onclick = async () => { if (!confirm(`Îl scoți pe ${b.dataset.kick} din clasă?`)) return; try { await apiCall('class/leave', 'POST', { code, username: b.dataset.kick }); openClass(code); } catch (e) { toast(e.message); } });
  $('scLink').onclick = () => {
    const url = linkFor(K.code), msg = `Intră în clasa „${K.name}” din Mintoria! Codul clasei: ${K.code}.`;
    if (navigator.share) navigator.share({ title: 'Mintoria', text: msg, url }).catch(() => {});
    else (navigator.clipboard ? navigator.clipboard.writeText(msg + ' ' + url) : Promise.reject()).then(() => toast('Linkul e copiat. Pune-l pe grupul clasei.'), () => toast(url));
  };
  $('scPlay').onclick = async () => {
    $('panel').hidden = true;
    if (NET.room) return openLobby();
    try { if (K.room) await joinRoom(K.room); else await createRoom(S.grade ?? 3, 'mix', K.code); } catch (e) { toast(e.message); }
  };
  $('scOther').onclick = () => { curClass = null; classStart(soc); };
  $('scLeave').onclick = async () => { if (!confirm(`Sigur ieși din clasa „${K.name}”?`)) return; try { await apiCall('class/leave', 'POST', { code }); curClass = null; toast('Ai ieșit din clasă.'); openClass(); } catch (e) { toast(e.message); } };
}

/* ---------- Prietenii ---------- */
export async function openFriends() {
  if (!loggedIn()) return needProfile('Prietenii');
  showPanel('<div class="eyebrow">Prietenii</div><h2>Se încarcă…</h2>');
  let soc; try { soc = await apiCall('social'); } catch (e) { return showPanel(`<h2>Nu merge acum</h2><p>${esc(e.message)}</p><div class="row"><button class="btn" type="button" data-close>Închide</button></div>`); }
  const row = (c, btns) => `<div class="sc-row">${avatar(c)}<span><b>${esc(c.username)}</b><small>${GR[c.grade] || ''} · nivelul ${lvl(c.xp)} · ★ ${c.stars} · ${ago(c.seen)}</small></span>${btns}</div>`;
  showPanel(`<div class="eyebrow">Prietenii</div><h2>Prietenii mei</h2>
    <div class="sc-box"><b>Adaugă un prieten</b><span>Scrie username-ul lui. El trebuie să accepte.</span>
      <div class="row" style="margin:0"><input id="frU" maxlength="16" placeholder="username" autocapitalize="off"><button class="btn" type="button" id="frAdd">Trimite cererea</button></div></div>
    ${soc.reqIn.length ? `<b>Vor să fie prietenii tăi</b><div class="sc-list">${soc.reqIn.map((c) => row(c, `<button class="tool" type="button" data-no="${esc(c.username)}">Nu</button><button class="btn" type="button" data-yes="${esc(c.username)}">Accept</button>`)).join('')}</div>` : ''}
    <b>Prieteni (${soc.friends.length})</b>
    ${soc.friends.length ? `<div class="sc-list">${soc.friends.map((c) => row(c, `<button class="tool" type="button" data-rm="${esc(c.username)}" aria-label="Șterge">✕</button>`)).join('')}</div>` : '<p>Încă nu ai prieteni aici. Adaugă-i pe colegi după username.</p>'}
    ${soc.reqOut.length ? `<p class="muted">Aștepți răspuns de la: ${soc.reqOut.map((c) => esc(c.username)).join(', ')}</p>` : ''}
    <div class="row"><button class="btn" type="button" data-close>Închide</button></div>`);
  const card = $('panelCard');
  $('frAdd').onclick = async () => { try { const r = await apiCall('friend/request', 'POST', { username: $('frU').value }); toast(r.friends ? 'Acum sunteți prieteni!' : 'Cererea a fost trimisă!'); SFX.talk(); openFriends(); } catch (e) { toast(e.message); } };
  card.querySelectorAll('[data-yes],[data-no]').forEach((b) => b.onclick = async () => { try { await apiCall('friend/answer', 'POST', { username: b.dataset.yes || b.dataset.no, ok: !!b.dataset.yes }); if (b.dataset.yes) { SFX.star(); toast('Acum sunteți prieteni!'); } openFriends(); } catch (e) { toast(e.message); } });
  card.querySelectorAll('[data-rm]').forEach((b) => b.onclick = async () => { if (!confirm(`Îl ștergi pe ${b.dataset.rm} din prieteni?`)) return; try { await apiCall('friend/remove', 'POST', { username: b.dataset.rm }); openFriends(); } catch (e) { toast(e.message); } });
}

// pentru ecranul Acasă: câte cereri așteaptă (clasă + prieteni)
export async function socialBadges() {
  if (!loggedIn()) return null;
  try { const s = await apiCall('social'); return { classReq: s.classes.reduce((a, c) => a + c.pending, 0), friendReq: s.reqIn.length, className: s.classes[0] && s.classes[0].name, friends: s.friends.length }; } catch { return null; }
}
