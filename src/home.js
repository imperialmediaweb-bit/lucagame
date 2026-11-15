// Ecranul „Acasă”: copilul alege direct jocul (Matematică, Română, Științe, Engleză, Fuga de monștri, Test, Cursă…).
// Fiecare materie are o „hartă a capitolelor” cu noduri și stele.
import { S, save, G, GRADE_NAMES, level, xpFor, starsTotal, areaLocked } from './state.js';
import { SFX } from './audio.js';
import { MISSIONS, ROMANA, SUBJECT_NAMES } from './content/missions.js';
import { SPEED, SPEED_IDS } from './content/speed.js';
import { startMission, openDaily, openShop, openProgress, toast, showTutorial, openMenu } from './ui.js';
import { openAtelier } from './atelier.js';
import { openWrite, openFise, chapterOk } from './extra.js';
import { portalPanel } from './chase.js';
import { openCreate, openLobby } from './mpui.js';
import { NET, joinRoom, createRoom, inviteLink } from './net.js';
import { startPlacement } from './placement.js';
import { creditsHtml } from './credits.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let H = {}, TILES = [];

// pictograme desenate (SVG), în stilul Mintoria
const IC = {
  mate: '<text x="12" y="30" font-size="26" font-weight="800" fill="#fff">+</text><text x="34" y="30" font-size="26" font-weight="800" fill="#fff">×</text><text x="12" y="56" font-size="26" font-weight="800" fill="#fff">−</text><text x="34" y="56" font-size="26" font-weight="800" fill="#fff">÷</text>',
  romana: '<rect x="12" y="14" width="40" height="38" rx="6" fill="#fff"/><path d="M32 16v34" stroke="#d23a3a" stroke-width="3"/><text x="16" y="42" font-size="18" font-weight="800" fill="#1F2B3A">Ă</text><text x="36" y="42" font-size="18" font-weight="800" fill="#1F2B3A">ș</text>',
  stiinte: '<path d="M26 10h12M28 10v16L16 50a4 4 0 0 0 4 6h24a4 4 0 0 0 4-6L36 26V10" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M20 44h24l4 8H16z" fill="#2EC4A6"/><circle cx="28" cy="40" r="3" fill="#2EC4A6"/>',
  engleza: '<rect x="8" y="16" width="48" height="32" rx="5" fill="#fff"/><text x="13" y="40" font-size="17" font-weight="800" fill="#3b7ddd">ABC</text>',
  civica: '<path d="M32 54C14 42 8 32 14 22c5-8 14-6 18 2 4-8 13-10 18-2 6 10 0 20-18 32z" fill="#fff"/>',
  compuneri: '<path d="M46 10c-14 4-24 16-28 34l-4 10 10-6c14-6 22-18 22-38z" fill="#fff"/><path d="M18 44l10-12" stroke="#7B5CF6" stroke-width="3"/>',
  monstri: '<rect x="12" y="14" width="40" height="38" rx="8" fill="#14101c"/><circle cx="24" cy="30" r="5" fill="#FFC93C"/><circle cx="40" cy="30" r="5" fill="#FFC93C"/><path d="M20 42h24" stroke="#fff" stroke-width="4" stroke-dasharray="4 3"/><path d="M16 14l-4-8 10 6M48 14l4-8-10 6" fill="#7B5CF6"/>',
  atelier: '<circle cx="32" cy="32" r="18" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="6 5"/><circle cx="32" cy="32" r="7" fill="#fff"/>',
  antrenament: '<circle cx="32" cy="32" r="20" fill="#fff"/><circle cx="32" cy="32" r="13" fill="#ff7a2f"/><circle cx="32" cy="32" r="6" fill="#fff"/>',
  test: '<rect x="14" y="10" width="36" height="44" rx="5" fill="#fff"/><text x="19" y="42" font-size="22" font-weight="800" fill="#e0582f">10</text>',
  colegi: '<circle cx="22" cy="24" r="8" fill="#fff"/><circle cx="42" cy="24" r="8" fill="#fff"/><path d="M8 52c2-10 9-14 14-14s12 4 14 14zM28 52c2-10 9-14 14-14s12 4 14 14z" fill="#fff"/>',
  insula: '<ellipse cx="32" cy="46" rx="24" ry="8" fill="#fff"/><path d="M30 44V22" stroke="#fff" stroke-width="4"/><path d="M30 22c-10-6-16 0-16 0M30 22c10-6 16 0 16 0M30 22c-4-8 2-12 2-12" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>',
  garderoba: '<path d="M22 10l-12 8 6 10 6-4v30h20V24l6 4 6-10-12-8c-2 4-6 6-10 6s-8-2-10-6z" fill="#fff"/>'
};
const icon = (k) => `<svg viewBox="0 0 64 64" aria-hidden="true" style="font-family:'Baloo 2',sans-serif">${IC[k]}</svg>`;

// lecțiile unei materii pentru clasa copilului
function lessons(subject) {
  const g = String(G());
  return MISSIONS.filter((m) => m.area === g && m.types && (
    subject === 'mate' ? !m.subject && !m.types.every((t) => ROMANA.has(t)) :
    subject === 'romana' ? !m.subject && m.types.some((t) => ROMANA.has(t)) || m.subject === 'compuneri' :
    m.subject === subject));
}
const starsOf = (list) => list.reduce((a, m) => a + ((S.missions[m.id] || {}).stars || 0), 0);

export function initHome(hooks) {
  H = hooks;
  const el = document.createElement('div'); el.id = 'home'; el.hidden = true; document.body.appendChild(el);
}
export const homeOpen = () => !$('home').hidden;
export function closeHome() { $('home').hidden = true; }

export function openHome() {
  SFX.tap();
  const lv = level(), next = xpFor(lv + 1), cur = xpFor(lv), pct = Math.round(100 * ((S.xp || 0) - cur) / Math.max(1, next - cur));
  const subj = [
    { k: 'mate', name: 'Lumea Matematicii', sub: 'Calcule, probleme, fracții, măsuri', color: '#7B5CF6' },
    { k: 'romana', name: 'Lumea Cuvintelor', sub: 'Ortograme, părți de vorbire, compuneri', color: '#e04848' },
    ...(G() === 3 ? [
      { k: 'stiinte', name: 'Laboratorul Naturii', sub: 'Viețuitoare, apă, magneți, forțe', color: '#2EC4A6' },
      { k: 'engleza', name: 'English Island', sub: 'Words, numbers, grammar', color: '#3b7ddd' },
      { k: 'civica', name: 'Orașul Bunătății', sub: 'Ce e bine, drepturi, reguli', color: '#ff8ac0' }] : [])
  ].map((x) => ({ ...x, list: lessons(x.k) })).filter((x) => x.list.length);
  const tiles = [
    ...subj.map((x) => ({ id: 'subj:' + x.k, icon: x.k, name: x.name, sub: x.sub, color: x.color, tags: ['Singur'], prog: `${starsOf(x.list)} / ${x.list.length * 3} ★` })),
    { id: 'monstri', icon: 'monstri', name: 'Fuga de monștri', sub: 'Calcul rapid, monstrul vine din spate!', color: '#4a2470', tags: ['Singur', 'Cu colegii'], prog: `${SPEED_IDS.filter((p) => (S.records || {})['portal-' + p]).length} / ${SPEED_IDS.length} portaluri` },
    { id: 'antrenament', icon: 'antrenament', name: 'Antrenamentul zilei', sub: '20 de minute care te fac campion', color: '#ff7a2f', tags: ['Singur'], prog: `${Math.min(20, Math.floor(S.today.sec / 60))} / 20 min azi` },
    ...(G() === 3 ? [
      { id: 'test', icon: 'test', name: 'Arena Testului', sub: 'Testul cu notă de la 1 la 10', color: '#e0582f', tags: ['Singur'], prog: S.testBest ? 'cea mai bună: ' + String(S.testBest).replace('.', ',') : 'nejucat' },
      { id: 'atelier', icon: 'atelier', name: 'Atelierul problemelor', sub: 'Metoda pas cu pas', color: '#23935a', tags: ['Singur'], prog: `${Object.values(S.atelier || {}).filter((l) => l >= 5).length} / 8 stăpânite` }] : []),
    { id: 'colegi', icon: 'colegi', name: 'Joacă cu colegii', sub: 'Test în clasă, cursă, duel, echipă', color: '#1F2B3A', tags: ['Cu colegii'], prog: NET.room ? `Camera ${NET.room.code} · ${NET.room.players.length}` : 'fă o cameră' },
    { id: 'insula', icon: 'insula', name: 'Explorează insula', sub: 'Personaje, comori, trambuline', color: '#42c0d8', tags: ['Singur', 'Cu colegii'], prog: `${starsTotal()} ★ adunate` },
    { id: 'garderoba', icon: 'garderoba', name: 'Magazin', sub: 'Puteri, haine, pălării, fețe', color: '#f2b632', tags: [], prog: `${S.coins} monede` }
  ];
  TILES = tiles; const rec = recommend(subj);
  $('home').innerHTML = `<div class="hm-top">
      <div class="hm-me"><div class="hm-av" style="background:${S.look.shirt}"><span style="background:${S.look.skin}"></span></div>
        <div><b>${esc(S.name || 'Jucător')}</b><small>${esc(GRADE_NAMES[G()])} · nivelul ${lv}</small><div class="hm-xp"><i style="width:${pct}%"></i></div></div></div>
      <div class="hm-stats"><span class="pill"><span class="ic"></span>${S.coins}</span><span class="pill"><span class="st">★</span>${starsTotal()}</span><span class="pill">Serie ${S.streak}</span></div>
      <button class="iconbtn" type="button" id="hmMenu">☰ Meniu</button>
    </div>
    <div class="hm-body">
      <img src="./logo.svg" alt="Mintoria" class="hm-logo">
      ${rec ? `<button class="hm-rec" type="button" id="hmRec" style="--c:${rec.color}"><span class="hm-ic">${icon(rec.icon)}</span><span><small>Continuă de unde ai rămas</small><b>${esc(rec.title)}</b><em>${esc(rec.where)}</em></span><span class="btn">Joacă</span></button>` : ''}
      <h3>Alege jocul</h3>
      <div class="hm-grid">${tiles.map((t) => `<button class="hm-tile" type="button" data-t="${t.id}" style="--c:${t.color}">
        <span class="hm-art">${icon(t.icon)}</span><b>${esc(t.name)}</b><small>${esc(t.sub)}</small>
        <span class="hm-meta">${t.tags.map((x) => `<i>${x}</i>`).join('')}<em>${esc(t.prog)}</em></span></button>`).join('')}</div>
      <div class="hm-join"><b>Ai un cod de la un coleg?</b><input id="hmCode" maxlength="4" placeholder="ABCD" autocapitalize="characters"><button class="btn" type="button" id="hmJoin">Intră</button></div>
      <div class="row" style="justify-content:center"><button class="btn light" type="button" id="hmPlace">Unde am ajuns? (test 5 min)</button><button class="btn light" type="button" id="hmHelp">Cum se joacă</button></div>
      ${creditsHtml()}
    </div>`;
  $('home').hidden = false; H.stop && H.stop();
  $('home').querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { SFX.tap(); tile(b.dataset.t); });
  if ($('hmRec')) $('hmRec').onclick = () => { closeHome(); startMission(rec.m); };
  $('hmMenu').onclick = () => { openMenu(); };
  $('hmPlace').onclick = () => startPlacement(() => openHome());
  $('hmHelp').onclick = () => showTutorial(matchMedia('(pointer:coarse)').matches);
  $('hmJoin').onclick = async () => { const c = $('hmCode').value.trim().toUpperCase(); if (!/^[A-Z0-9]{4}$/.test(c)) { toast('Codul are 4 litere/cifre.'); return; } closeHome(); try { await joinRoom(c); } catch (e) { toast(e.message); } };
}
function recommend(subj) {
  for (const x of subj) {
    const m = x.list.find((q) => chapterOk(q) && !((S.missions[q.id] || {}).stars));
    if (m) return { m, title: m.title, where: x.name, icon: x.k, color: x.color };
  }
  return null;
}
function tile(id) {
  if (id === 'colegi') { closeHome(); return NET.room ? openLobby() : openCreate(); }
  if (id === 'garderoba') { closeHome(); return openShop('puteri'); }
  preview(id);
}
function play(id) {
  if (id.startsWith('subj:')) return subjectMap(id.slice(5));
  closeHome();
  if (id === 'monstri') return portalPick();
  if (id === 'antrenament') return openDaily();
  if (id === 'test') return startMission(MISSIONS.find((m) => m.test));
  if (id === 'atelier') return openAtelier();
  if (id === 'insula') return toast('Explorează! Caută personajele cu „!”.');
}

/* previzualizarea unui joc: scenă animată, ce înveți, unde ai ajuns, și cum joci */
const LEARN = {
  'subj:mate': 'Calcule, ordinea operațiilor, probleme, fracții, măsuri, geometrie.',
  'subj:romana': 'Ortograme, părți de vorbire, punctuație, compuneri.',
  'subj:stiinte': 'Viețuitoare, corpul omului, apa, Pământul, forțe și magneți.',
  'subj:engleza': 'Cuvinte, numere, propoziții simple în engleză.',
  'subj:civica': 'Ce e bine și ce nu, drepturi, reguli, prietenie.',
  monstri: 'Calcul rapid: fiecare răspuns bun te duce mai aproape de ieșire. Monstrul vine din spate!',
  antrenament: 'Amestec din capitolele tale + repetarea a ce ai greșit acum 1, 3 și 7 zile.',
  test: 'Un test ca la școală, cu notă de la 1 la 10.',
  atelier: 'Problemele grele, pas cu pas: privești, completezi, faci singur.',
  insula: 'Lumea 3D: personaje cu misiuni, comori, trambuline, obstacole.'
};
const ROOM_SUBJ = { 'subj:mate': 'mate', 'subj:romana': 'romana', 'subj:stiinte': 'stiinte', 'subj:engleza': 'engleza', 'subj:civica': 'civica', test: 'test' };
function preview(id) {
  const t = TILES.find((x) => x.id === id); if (!t) return play(id);
  const subj = id.startsWith('subj:') ? id.slice(5) : null, list = subj ? lessons(subj) : [];
  const fog = list.filter((m) => !chapterOk(m)).length;
  const where = subj ? `<div class="pv-stats"><span><b>${list.length}</b> capitole</span><span><b>${list.length - fog}</b> făcute la școală</span><span><b>${fog}</b> în ceață</span><span><b>${starsOf(list)}</b> / ${list.length * 3} ★</span></div>` : `<div class="pv-stats"><span><b>${esc(t.prog)}</b></span></div>`;
  const mates = NET.room ? NET.room.players.length - 1 : 0;
  const box = document.createElement('div'); box.className = 'pv-back';
  box.innerHTML = `<div class="pv" style="--c:${t.color}">
    <div class="pv-scene"><i class="pv-cloud a"></i><i class="pv-cloud b"></i><i class="pv-isl"></i><span class="pv-art">${icon(t.icon)}</span><i class="pv-spark s1">★</i><i class="pv-spark s2">★</i></div>
    <div class="pv-body"><h2>${esc(t.name)}</h2><p>${esc(LEARN[id] || t.sub)}</p>${where}
      ${mates ? `<p class="pv-mates">În camera ta: ${mates} ${mates === 1 ? 'coleg' : 'colegi'}</p>` : ''}
      <div class="pv-btns"><button class="btn" type="button" id="pvSolo">Joacă singur</button>
        <button class="btn light" type="button" id="pvMates">Joacă cu colegii</button>
        <button class="btn light" type="button" id="pvLink">Trimite link</button></div>
      <button class="iconbtn pv-x" type="button" id="pvX" aria-label="Închide">✕</button></div></div>`;
  $('home').appendChild(box);
  const close = () => box.remove();
  box.onclick = (e) => { if (e.target === box) close(); };
  $('pvX').onclick = close;
  $('pvSolo').onclick = () => { close(); play(id); };
  $('pvMates').onclick = async () => {
    close();
    if (id === 'monstri') { closeHome(); return portalPick(); } // acolo e „Cheamă colegii la cursă”
    if (NET.room) { closeHome(); return openLobby(); }
    closeHome(); await room(id);
  };
  $('pvLink').onclick = async () => { const ok = await room(id); if (ok) share(t); };
}
// face o cameră (dacă nu e deja) pentru jocul ales
async function room(id) {
  if (NET.room) return true;
  try { await createRoom(G(), ROOM_SUBJ[id] || 'mix'); } catch (e) { toast(e.message); return false; }
  for (let i = 0; i < 50 && !NET.room; i++) await new Promise((r) => setTimeout(r, 100));
  if (!NET.room) { toast('Nu am putut face camera. Mai încearcă.'); return false; }
  return true;
}
function share(t) {
  const url = inviteLink() + '&lume=' + encodeURIComponent(t.id);
  const msg = `${S.name || 'Un coleg'} te cheamă în ${t.name} din Mintoria! Apasă aici:`;
  if (navigator.share) { navigator.share({ title: 'Mintoria', text: msg, url }).catch(() => {}); return; }
  if (matchMedia('(pointer:coarse)').matches) { location.href = 'https://wa.me/?text=' + encodeURIComponent(msg + ' ' + url); return; }
  (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Linkul e copiat. Lipește-l pe WhatsApp.'), () => toast(url));
}
export const worldName = (id) => ({ 'subj:mate': 'Lumea Matematicii', 'subj:romana': 'Lumea Cuvintelor', 'subj:stiinte': 'Laboratorul Naturii', 'subj:engleza': 'English Island', 'subj:civica': 'Orașul Bunătății', monstri: 'Fuga de monștri', test: 'Arena Testului', antrenament: 'Antrenamentul zilei', atelier: 'Atelierul problemelor', insula: 'insula Mintoria' }[id]);

/* harta capitolelor unei materii: un drum cu noduri și stele */
export function subjectMap(k) {
  const names = { mate: 'Lumea Matematicii', romana: 'Lumea Cuvintelor', stiinte: 'Laboratorul Naturii', engleza: 'English Island', civica: 'Orașul Bunătății' };
  const colors = { mate: '#7B5CF6', romana: '#e04848', stiinte: '#2EC4A6', engleza: '#3b7ddd', civica: '#ff8ac0' };
  const list = lessons(k), c = colors[k];
  const firstTodo = list.findIndex((m) => chapterOk(m) && !((S.missions[m.id] || {}).stars));
  $('home').innerHTML = `<div class="hm-top"><button class="iconbtn" type="button" id="hmBack">← Înapoi</button><b class="hm-title">${esc(names[k])}</b>
      <span class="pill"><span class="st">★</span>${starsOf(list)} / ${list.length * 3}</span></div>
    <div class="hm-body"><div class="hm-path" style="--c:${c}">
      ${list.map((m, i) => { const st = (S.missions[m.id] || {}).stars || 0, school = chapterOk(m); return `<button class="hm-node ${i % 2 ? 'r' : 'l'} ${i === firstTodo ? 'now' : ''} ${st === 3 ? 'gold' : ''} ${school ? '' : 'fog'}" type="button" data-m="${m.id}">
        <span class="hm-dot">${st === 3 ? '★' : i + 1}</span><span class="hm-lbl"><b>${esc(m.title)}</b><small>${esc(m.desc)}</small>
        <span class="stars">${'★'.repeat(st)}<span class="off">${'★'.repeat(3 - st)}</span></span>${school ? '' : '<i>în ceață · încă nu ați ajuns la școală</i>'}</span></button>`; }).join('')}
      ${k === 'romana' ? `<button class="hm-node ${list.length % 2 ? 'r' : 'l'}" type="button" id="hmWrite"><span class="hm-dot">✎</span><span class="hm-lbl"><b>Scriu o compunere</b><small>Jocul verifică titlul, alineatele, ortogramele</small></span></button>` : ''}
    </div>
    <div class="row" style="justify-content:center"><button class="btn light" type="button" id="hmFise">Fișă de lucru pentru această materie</button></div></div>`;
  $('home').hidden = false;
  $('hmBack').onclick = () => openHome();
  $('home').querySelectorAll('[data-m]').forEach((b) => b.onclick = () => { closeHome(); startMission(MISSIONS.find((m) => m.id === b.dataset.m)); });
  if ($('hmWrite')) $('hmWrite').onclick = () => { closeHome(); openWrite(); };
  $('hmFise').onclick = () => { closeHome(); openFise(); };
  const now = $('home').querySelector('.hm-node.now'); if (now) now.scrollIntoView({ block: 'center' });
}

/* alegerea portalului pentru fuga de monștri */
function portalPick() {
  const { showPanel } = H;
  showPanel(`<div class="eyebrow">Fuga de monștri</div><h2>Alege portalul</h2>
    <div class="shopgrid">${SPEED_IDS.map((id) => { const r = (S.records || {})['portal-' + id]; return `<button class="item" type="button" data-p="${id}" style="border-color:${SPEED[id].color}"><b>${esc(SPEED[id].name)}</b><span>${esc(SPEED[id].sub)}</span><span>${r ? '★'.repeat(r.stars || 0) + ' · ' + r.score + ' p' : 'nejucat'}</span></button>`; }).join('')}</div>
    <div class="row"><button class="btn light" type="button" data-close>Închide</button></div>`);
  document.querySelectorAll('#panelCard [data-p]').forEach((b) => b.onclick = () => portalPanel(b.dataset.p));
}
export { save };
