// Profilul copilului: username + PIN, progres salvat pe server, cod de recuperare pentru părinte.
import { worldName } from './home.js';
import { S, save, loadState, setOnSave, level, G, GRADE_NAMES } from './state.js';
import { SFX } from './audio.js';
import { showPanel, toast, refreshHud } from './ui.js';
import { TYPE_NAMES, MISSIONS } from './content/missions.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TK = 'luca-token';
let token = null; try { token = localStorage.getItem(TK); } catch { /* fără salvare */ }
export const ACC = { user: null };
export const loggedIn = () => !!ACC.user;
const GRADES = { 0: 'Pregătitoare', 1: 'Clasa I', 2: 'Clasa a II-a', 3: 'Clasa a III-a', 4: 'Clasa a IV-a' };

async function api(path, method = 'GET', body) {
  const r = await fetch('/api/' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined, keepalive: method === 'PUT' });
  const j = await r.json().catch(() => ({ error: 'Serverul nu răspunde.' }));
  if (!r.ok) throw Object.assign(new Error(j.error || 'Eroare'), { status: r.status });
  return j;
}
export const apiCall = api;
function setToken(t) { token = t; try { t ? localStorage.setItem(TK, t) : localStorage.removeItem(TK); } catch { /* fără salvare */ } }

// trimite progresul pe server la câteva secunde după fiecare schimbare
let pushT = null, dirty = false;
function push() { if (!token || !ACC.user) return; dirty = false; api('state', 'PUT', { state: S }).catch(() => { dirty = true; }); }
setOnSave(() => { if (!ACC.user) return; dirty = true; clearTimeout(pushT); pushT = setTimeout(push, 4000); });
addEventListener('visibilitychange', () => { if (document.hidden && dirty) push(); });
addEventListener('pagehide', () => { if (dirty) push(); });

function enter(j, hooks) {
  ACC.user = j.profile.username;
  loadState({ ...j.state, name: j.profile.username, grade: j.state.grade ?? j.profile.grade });
  S.name = j.profile.username; save();
  refreshHud(); hooks.reload();
}

/* ---------- ecranul de start ---------- */
export async function startFlow(hooks) {
  const invite = new URLSearchParams(location.search).get('camera');
  if (token) {
    try { const j = await api('me'); enter(j, hooks); toast(`Bine ai revenit, ${j.profile.username}!`); SFX.star(); return hooks.ready(invite); }
    catch (e) { if (e.status === 401) setToken(null); }
  }
  welcome(hooks, invite);
}
function lock() { $('panel').dataset.lock = '1'; }
function unlock() { delete $('panel').dataset.lock; $('panel').hidden = true; }
const PIN_ATTR = 'maxlength="4" inputmode="numeric" pattern="[0-9]*" autocomplete="off"';
// lasă doar cifre în câmpul de PIN (oricum ar tasta copilul)
const pinOnly = (id) => { const el = $(id); if (el) el.addEventListener('input', () => { const v = el.value.replace(/\D/g, '').slice(0, 4); if (v !== el.value) el.value = v; }); };
const input = (id, ph, extra = '') => `<input id="${id}" ${extra} placeholder="${ph}" style="font:700 20px var(--font-b);padding:10px 12px;border:2px solid var(--ink);border-radius:12px;width:100%;box-sizing:border-box">`;

const lume = () => worldName(new URLSearchParams(location.search).get('lume') || '');
function welcome(hooks, invite) {
  showPanel(`<div class="eyebrow">${invite ? 'Ai primit o invitație de la un coleg' : 'Bun venit!'}</div><img src="./logo.svg" alt="Mintoria" style="width:min(300px,100%);align-self:center">
    <p>${invite ? `Te așteaptă în camera <b>${esc(invite.toUpperCase())}</b>${lume() ? `, în <b>${esc(lume())}</b>` : ''}. ` : ''}Fă-ți un profil ca să-ți păstrezi monedele, stelele și hainele, pe telefon și pe calculator.</p>
    <div class="shopgrid">
      <button class="item" type="button" id="wNew"><b>Fac profil nou</b><span>username + PIN</span></button>
      <button class="item" type="button" id="wLogin"><b>Am deja profil</b><span>intru cu PIN-ul</span></button>
    </div>
    <div class="row"><button class="btn light" type="button" id="wParent">Pentru părinți</button><button class="btn light" type="button" id="wGuest">Joc fără profil</button></div>`);
  lock();
  $('wNew').onclick = () => register(hooks, invite);
  $('wLogin').onclick = () => login(hooks, invite);
  $('wGuest').onclick = () => guest(hooks, invite);
  $('wParent').onclick = () => parent(() => welcome(hooks, invite));
}

function register(hooks, invite) {
  let grade = G();
  const draw = () => {
    showPanel(`<div class="eyebrow">Profil nou</div><h2>Cum vrei să te cheme în joc?</h2>
      <p>Alege o poreclă (username), de exemplu <b>LucaNinja</b>. Fără numele de familie! 3–16 litere sau cifre, fără spații.</p>
      ${input('rU', 'Username', 'maxlength="16" autocomplete="off" autocapitalize="off"')}
      <b>Clasa</b><div class="tabs" id="rG">${Object.entries(GRADES).map(([k, v]) => `<button class="tab ${+k === grade ? 'on' : ''}" type="button" data-g="${k}">${v}</button>`).join('')}</div>
      <p><b>PIN</b>: 4 cifre pe care le ții minte (ca la telefon). Scrie-l de două ori.</p>
      <div style="display:flex;gap:8px">${input('rP', 'PIN', PIN_ATTR)}${input('rP2', 'Încă o dată', PIN_ATTR)}</div>
      <div id="rErr"></div>
      <div class="row"><button class="btn light" type="button" id="rBack">Înapoi</button><button class="btn" type="button" id="rGo">Fac profilul</button></div>`);
    lock();
    $('rG').querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { grade = +b.dataset.g; $('rG').querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x === b)); });
    pinOnly('rP'); pinOnly('rP2');
    $('rBack').onclick = () => welcome(hooks, invite);
    $('rGo').onclick = async () => {
      const u = $('rU').value.trim(), p = $('rP').value, p2 = $('rP2').value, e = (m) => { $('rErr').innerHTML = `<div class="fb no"><b>${esc(m)}</b></div>`; };
      if (!/^[A-Za-z0-9_]{3,16}$/.test(u)) return e('Username-ul are 3–16 litere fără diacritice, cifre sau _.');
      if (!/^\d{4}$/.test(p)) return e(`PIN-ul are exact 4 cifre. Acum are ${p.length}.`);
      if (p !== p2) return e('Cele două PIN-uri nu sunt la fel.');
      $('rGo').disabled = true;
      try {
        S.grade = grade;
        const j = await api('register', 'POST', { username: u, pin: p, grade, state: { ...S, name: u, grade } });
        setToken(j.token); enter(j, hooks); SFX.fanfare();
        showPanel(`<div class="eyebrow">Profil creat</div><h2>Salut, ${esc(j.profile.username)}!</h2>
          <p>Acesta e <b>codul de recuperare</b>. Arată-l unui părinte să-l noteze: cu el se schimbă PIN-ul dacă îl uiți și se vede progresul tău.</p>
          <div class="grade" style="font-size:44px;letter-spacing:4px">${esc(j.recovery)}</div>
          <div class="row"><button class="btn" type="button" id="rOk">L-am notat, hai la joc!</button></div>`);
        lock();
        $('rOk').onclick = () => { unlock(); hooks.ready(invite); };
      } catch (err) { $('rGo').disabled = false; e(err.message); }
    };
  };
  draw();
}

function login(hooks, invite) {
  showPanel(`<div class="eyebrow">Am deja profil</div><h2>Intră în joc</h2>
    ${input('lU', 'Username', 'maxlength="16" autocomplete="username" autocapitalize="off"')}
    ${input('lP', 'PIN (4 cifre)', PIN_ATTR)}
    <div id="lErr"></div>
    <div class="row"><button class="btn light" type="button" id="lForgot">Am uitat PIN-ul</button><button class="btn light" type="button" id="lBack">Înapoi</button><button class="btn" type="button" id="lGo">Intră</button></div>`);
  lock();
  pinOnly('lP');
  $('lBack').onclick = () => welcome(hooks, invite);
  $('lForgot').onclick = () => recover(hooks, invite);
  $('lGo').onclick = async () => {
    $('lGo').disabled = true;
    try { const j = await api('login', 'POST', { username: $('lU').value.trim(), pin: $('lP').value }); setToken(j.token); enter(j, hooks); unlock(); SFX.star(); toast(`Salut, ${j.profile.username}!`); hooks.ready(invite); }
    catch (err) { $('lGo').disabled = false; $('lErr').innerHTML = `<div class="fb no"><b>${esc(err.message)}</b></div>`; }
  };
}

function recover(hooks, invite) {
  showPanel(`<div class="eyebrow">Am uitat PIN-ul</div><h2>Schimbă PIN-ul</h2>
    <p>Ai nevoie de codul de recuperare primit când ai făcut profilul (îl are un părinte).</p>
    ${input('vU', 'Username', 'maxlength="16" autocapitalize="off"')}${input('vR', 'Cod de recuperare (ex. ABCD-1234)', 'maxlength="9" autocapitalize="characters"')}${input('vP', 'PIN nou (4 cifre)', PIN_ATTR)}
    <div id="vErr"></div>
    <div class="row"><button class="btn light" type="button" id="vBack">Înapoi</button><button class="btn" type="button" id="vGo">Schimbă PIN-ul</button></div>`);
  lock();
  $('vBack').onclick = () => login(hooks, invite);
  $('vGo').onclick = async () => {
    try { const j = await api('recover', 'POST', { username: $('vU').value.trim(), recovery: $('vR').value, pin: $('vP').value }); setToken(j.token); enter(j, hooks); unlock(); toast('PIN schimbat. Bine ai revenit!'); hooks.ready(invite); }
    catch (err) { $('vErr').innerHTML = `<div class="fb no"><b>${esc(err.message)}</b></div>`; }
  };
}

function guest(hooks, invite) {
  showPanel(`<div class="eyebrow">Joc fără profil</div><h2>Cum te cheamă?</h2>
    <p>Fără profil, progresul rămâne doar pe acest dispozitiv. Îți poți face profil oricând din meniu.</p>
    ${input('gN', 'Prenume sau poreclă', `maxlength="14" value="${esc(S.name)}"`)}
    <b>Clasa</b><div class="tabs" id="gG">${Object.entries(GRADES).map(([k, v]) => `<button class="tab ${+k === G() ? 'on' : ''}" type="button" data-g="${k}">${v}</button>`).join('')}</div>
    <div class="row"><button class="btn light" type="button" id="gBack">Înapoi</button><button class="btn" type="button" id="gGo">Joacă</button></div>`);
  lock();
  let gg = G();
  $('gG').querySelectorAll('[data-g]').forEach((b) => b.onclick = () => { gg = +b.dataset.g; $('gG').querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x === b)); });
  $('gBack').onclick = () => welcome(hooks, invite);
  $('gGo').onclick = () => {
    const n = $('gN').value.replace(/[^\p{L}\p{N} -]/gu, '').trim().slice(0, 14);
    if (!n) { toast('Scrie-ți prenumele.'); return; }
    S.name = n; S.grade = gg; save(); hooks.reload(); unlock(); hooks.ready(invite);
  };
}

/* ---------- din meniu ---------- */
export function profileMenu(hooks) {
  if (!ACC.user) { welcome(hooks, null); return; }
  showPanel(`<div class="eyebrow">Profilul meu</div><h2>${esc(ACC.user)}</h2>
    <p>Nivel <b>${level()}</b> · ${S.coins} monede · ${GRADES[G()]}. Progresul se salvează automat pe server.</p>
    <div class="row"><button class="btn light" type="button" id="pOut">Ieși din profil</button><button class="btn" type="button" data-close>Închide</button></div>`);
  $('pOut').onclick = () => { if (dirty) push(); setToken(null); ACC.user = null; location.href = location.pathname; };
}

/* ---------- pagina părintelui ---------- */
export function parent(back) {
  showPanel(`<div class="eyebrow">Pentru părinți</div><h2>Progresul copilului</h2>
    <p>Introdu username-ul copilului și codul de recuperare primit la crearea profilului.</p>
    ${input('pU', 'Username', 'maxlength="16" autocapitalize="off"')}${input('pR', 'Cod de recuperare', 'maxlength="9" autocapitalize="characters"')}
    <div id="pErr"></div>
    <div class="row"><button class="btn light" type="button" id="pBack">Înapoi</button><button class="btn" type="button" id="pGo">Vezi progresul</button></div>`);
  $('pBack').onclick = back || (() => { $('panel').hidden = true; });
  $('pGo').onclick = async () => {
    try {
      const j = await api('parent', 'POST', { username: $('pU').value.trim(), recovery: $('pR').value }), st = j.state || {};
      const stats = st.stats || {}, rows = Object.keys(TYPE_NAMES).filter((t) => stats[t]).map((t) => { const s = stats[t], n = s.ok + s.bad, p = Math.round(100 * s.ok / n); return [p, `<div class="bar"><span>${TYPE_NAMES[t]}</span><span class="tr"><i style="width:${p}%"></i></span><span class="n">${p}% · ${n}</span></div>`]; }).sort((a, b) => a[0] - b[0]).map((r) => r[1]).join('');
      const stars = Object.values(st.missions || {}).reduce((a, m) => a + (m.stars || 0), 0);
      const at = st.atelier || {}, mastered = Object.values(at).filter((l) => l >= 5).length;
      showPanel(`<div class="eyebrow">Pentru părinți · ${GRADES[j.profile.grade]}</div><h2>${esc(j.profile.username)}</h2>
        <p><b>Azi:</b> ${Math.floor(((st.today || {}).sec || 0) / 60)} min · <b>Serie:</b> ${st.streak || 0} zile · <b>Stele:</b> ${stars} din ${MISSIONS.filter((m) => m.types || m.test).length * 3} · <b>Cea mai bună notă la test:</b> ${st.testBest ? String(Math.round(st.testBest * 100) / 100).replace('.', ',') : '–'} · <b>Atelier stăpânit:</b> ${mastered} din 8 tipuri</p>
        <p>Răspunsuri corecte pe tipuri, de la cel mai slab:</p>
        <div style="display:flex;flex-direction:column;gap:8px">${rows || '<p>Încă nu a jucat.</p>'}</div>
        <div class="row"><button class="btn" type="button" id="pClose">Închide</button></div>`);
      $('pClose').onclick = back || (() => { $('panel').hidden = true; });
    } catch (err) { $('pErr').innerHTML = `<div class="fb no"><b>${esc(err.message)}</b></div>`; }
  };
}
