// Partea de rețea din browser: camera de joc, colegii pe insulă, Duel și Echipă.
import { createAvatar, makeLabel } from './avatar.js';
import { S, save } from './state.js';
import { SFX } from './audio.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const EMOTES = ['Bravo!', 'Hai!', 'Super!', 'Mulțumesc!', 'Ups!', 'Încă o rundă?', '👍', '🎉'];

let ws = null, scene, shadow, glow, ui = {};
export const NET = { room: null, you: 0, others: new Map(), game: null, q: null, myChoice: null };

export function initNet(opts) { ({ scene, shadow, glow } = opts); ui = opts.ui; }
export const online = () => !!NET.room;
export const amHost = () => { const me = NET.room && NET.room.players.find((p) => p.id === NET.you); return !!(me && me.host); };
export const inviteLink = () => `${location.origin}${location.pathname}?camera=${NET.room.code}`;

function connect(first) {
  return new Promise((resolve, reject) => {
    const url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    ws = new WebSocket(url);
    ws.onopen = () => { ws.send(JSON.stringify(first)); resolve(); };
    ws.onerror = () => reject(new Error('Nu mă pot conecta la server.'));
    ws.onclose = () => { if (NET.room) { ui.toast('Conexiunea s-a întrerupt. Jocul merge mai departe singur.'); leave(true); } };
    ws.onmessage = (e) => onMsg(JSON.parse(e.data));
  });
}
const sendMsg = (m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); };

export async function createRoom(grade, subject) { await connect({ t: 'create', name: S.name, look: S.look, grade, subject }); }
export async function joinRoom(code) { await connect({ t: 'join', code, name: S.name, look: S.look }); }
export function leave(silent) {
  if (ws && !silent) { const w = ws; ws = null; w.onclose = null; w.close(); }
  ws = null; NET.room = null; NET.game = null;
  for (const o of NET.others.values()) disposeOther(o);
  NET.others.clear(); ui.roomChanged && ui.roomChanged();
  if (history.replaceState) history.replaceState(null, '', location.pathname);
}
export const sendSettings = (grade, subject) => sendMsg({ t: 'settings', grade, subject });
export const startGame = (mode) => sendMsg({ t: 'start', mode });
export const startClass = (sub, level) => sendMsg({ t: 'class', sub, level });
export const classAnswer = (i, c) => sendMsg({ t: 'canswer', i, c });
export const stopGame = () => sendMsg({ t: 'stop' });
export const sendEmote = (k) => sendMsg({ t: 'emote', k });
export const sendLook = () => sendMsg({ t: 'look', look: S.look });
export function sendAnswer(c) { if (!NET.q || NET.myChoice !== null) return; NET.myChoice = c; sendMsg({ t: 'answer', i: NET.q.i, c }); }

let posT = 0, lastSent = '';
export function tick(dt, P, face, anim) {
  if (!NET.room) return;
  posT += dt;
  if (posT > 0.1) {
    posT = 0;
    const s = `${P.x.toFixed(2)},${P.y.toFixed(2)},${P.z.toFixed(2)},${face.toFixed(2)},${anim}`;
    if (s !== lastSent) { lastSent = s; sendMsg({ t: 'pos', x: +P.x.toFixed(2), y: +P.y.toFixed(2), z: +P.z.toFixed(2), f: +face.toFixed(2), a: anim }); }
  }
  for (const o of NET.others.values()) {
    const k = Math.min(1, dt * 10), r = o.av.root;
    const dx = o.tx - r.position.x, dz = o.tz - r.position.z, moving = Math.hypot(dx, dz) > 0.05;
    r.position.x += dx * k; r.position.y += (o.ty - r.position.y) * k; r.position.z += dz * k;
    let d = o.tf - r.rotation.y; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; r.rotation.y += d * k;
    o.av.update(dt, { speed: moving && o.a !== 4 ? 1 : 0, air: o.a === 2, dance: o.a === 3, sit: o.a === 4 });
    o.label.position.set(r.position.x, r.position.y + 3.4, r.position.z);
    if (o.bubble) { o.bubble.position.set(r.position.x, r.position.y + 4.3, r.position.z); o.bubbleT -= dt; if (o.bubbleT <= 0) { o.bubble.dispose(); o.bubble = null; } }
  }
}

function addOther(p) {
  if (p.id === NET.you || NET.others.has(p.id)) return;
  const av = createAvatar(scene, p.look, shadow, 'p' + p.id);
  av.root.position.set(p.x, p.y, p.z);
  const label = makeLabel(scene, p.name, null, '#3b7ddd', 2.2); glow.addExcludedMesh(label);
  NET.others.set(p.id, { av, label, tx: p.x, ty: p.y, tz: p.z, tf: p.f || 0, a: 0, bubble: null });
}
function disposeOther(o) { o.av.root.getChildMeshes().forEach((m) => m.dispose()); o.av.root.dispose(); o.label.dispose(); if (o.bubble) o.bubble.dispose(); }

function onMsg(m) {
  switch (m.t) {
    case 'error': ui.toast(m.msg); leave(true); break;
    case 'joined':
      NET.you = m.you; NET.room = m.room; m.room.players.forEach(addOther);
      if (history.replaceState) history.replaceState(null, '', '?camera=' + m.room.code);
      ui.roomChanged(); ui.openLobby(); SFX.star(); break;
    case 'player': NET.room.players.push(m.p); addOther(m.p); ui.toast(`${m.p.name} a intrat în joc!`); SFX.talk(); ui.roomChanged(); break;
    case 'left': { const o = NET.others.get(m.id); if (o) { disposeOther(o); NET.others.delete(m.id); } NET.room = m.room; ui.roomChanged(); break; }
    case 'room': NET.room = m.room; ui.roomChanged(); break;
    case 'pos': { const o = NET.others.get(m.id); if (o) { o.tx = m.x; o.ty = m.y; o.tz = m.z; o.tf = m.f; o.a = m.a; } break; }
    case 'look': { const o = NET.others.get(m.id); if (o) o.av.setLook(m.look); break; }
    case 'emote': {
      const o = NET.others.get(m.id);
      if (o) { if (o.bubble) o.bubble.dispose(); o.bubble = makeLabel(scene, m.text, null, '#ff7a2f', 1.8); glow.addExcludedMesh(o.bubble); o.bubbleT = 3; }
      else if (m.id === NET.you) ui.toast('Ai trimis: ' + m.text);
      break;
    }
    case 'game': NET.game = { mode: m.mode, n: m.n, bossHp: m.bossMax, bossMax: m.bossMax }; NET.q = null; ui.mpGameStart(m); break;
    case 'q': NET.q = { ...m.q, i: m.i, n: m.n, secs: m.secs, t0: performance.now() }; NET.myChoice = null; ui.mpQuestion(); break;
    case 'answered': ui.mpAnswered(m); break;
    case 'reveal': if (NET.game) { NET.game.bossHp = m.bossHp; } ui.mpReveal(m); break;
    case 'end': NET.game = null; NET.q = null; ui.mpEnd(m); break;
    case 'class': NET.game = { mode: 'class' }; ui.classStart(m); break;
    case 'cprog': ui.classProgress(m); break;
    case 'classEnd': NET.game = null; ui.classEnd(m); break;
    default: break;
  }
}

export function myName() { return S.name || 'Jucător'; }
export function setName(n) { S.name = String(n || '').replace(/[^\p{L}\p{N} -]/gu, '').trim().slice(0, 14); save(); }
export { esc };
