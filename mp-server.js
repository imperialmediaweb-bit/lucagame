// Multiplayer: camere de joc cu cod, poziții în timp real, Duel și Echipă contra Boss-ului.
// Fără conturi, fără date personale: doar un prenume, ținut în memorie cât timp camera e deschisă.
import { WebSocketServer } from 'ws';
import { GEN, typesFor } from './src/content/missions.js';

const rooms = new Map();
const EMOTES = ['Bravo!', 'Hai!', 'Super!', 'Mulțumesc!', 'Ups!', 'Încă o rundă?', '👍', '🎉'];
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const code = () => { let c; do { c = Array.from({ length: 4 }, () => ALPH[Math.floor(Math.random() * ALPH.length)]).join(''); } while (rooms.has(c)); return c; };
const clean = (s) => String(s || '').replace(/[^\p{L}\p{N} -]/gu, '').trim().slice(0, 14) || 'Jucător';
const cleanLook = (l = {}) => {
  const hex = (v, d) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d), word = (v, d) => (/^[a-z]{1,12}$/.test(v) ? v : d);
  return { skin: hex(l.skin, '#f3c9a0'), shirt: hex(l.shirt, '#3b7ddd'), pants: hex(l.pants, '#2b3a55'), hat: word(l.hat, 'nimic'), face: word(l.face, 'zambet') };
};
let nextId = 1;

function send(ws, m) { if (ws.readyState === 1) ws.send(JSON.stringify(m)); }
function bcast(room, m, except) { const s = JSON.stringify(m); for (const p of room.players.values()) if (p.ws !== except && p.ws.readyState === 1) p.ws.send(s); }
const pub = (p) => ({ id: p.id, name: p.name, look: p.look, x: p.x, y: p.y, z: p.z, f: p.f, score: p.score, host: p.host });
const roomState = (r) => ({ code: r.code, grade: r.grade, subject: r.subject, players: [...r.players.values()].map(pub), game: r.game ? { mode: r.game.mode, n: r.game.qs.length, i: r.game.i, bossHp: r.game.bossHp, bossMax: r.game.bossMax } : null });

function makeQuestions(r, n) {
  const types = typesFor(r.grade, r.subject); const qs = [];
  for (let i = 0; i < n; i++) { const t = r.subject === 'test' ? types[i % types.length] : types[Math.floor(Math.random() * types.length)]; qs.push({ type: t, ...GEN[t]() }); }
  return qs;
}
const publicQ = (q) => ({ type: q.type, kind: q.kind || 'choice', text: q.text, expr: q.expr || '', opts: q.opts || null, toks: q.toks || null });
const isRight = (q, c) => (q.kind === 'tap' ? c === q.ans : q.opts && q.opts[c] === q.ans);

function startGame(r, mode) {
  const n = 10, qs = makeQuestions(r, n);
  r.game = { mode, qs, i: -1, answers: new Map(), t0: 0, timer: null, bossMax: n * Math.max(1, r.players.size) * 60, bossHp: 0 };
  r.game.bossHp = r.game.bossMax;
  for (const p of r.players.values()) { p.score = 0; p.streak = 0; }
  bcast(r, { t: 'game', mode, n, bossMax: r.game.bossMax });
  setTimeout(() => nextQ(r), 2500);
}
function nextQ(r) {
  const g = r.game; if (!g) return;
  g.i++; g.answers = new Map();
  if (g.i >= g.qs.length) return endGame(r);
  g.t0 = Date.now();
  const q = g.qs[g.i];
  const secs = q.text.length > 120 ? 75 : 40;
  g.secs = secs;
  bcast(r, { t: 'q', i: g.i, n: g.qs.length, q: publicQ(q), secs });
  clearTimeout(g.timer); g.timer = setTimeout(() => reveal(r), secs * 1000);
}
function answer(r, p, i, choice) {
  const g = r.game; if (!g || g.i !== i || g.answers.has(p.id) || g.revealed === i) return;
  const q = g.qs[i], ok = isRight(q, choice), dt = (Date.now() - g.t0) / 1000;
  let pts = 0;
  if (ok) {
    const firstRight = ![...g.answers.values()].some((a) => a.ok);
    pts = 100 + Math.round(100 * Math.max(0, 1 - dt / g.secs)) + (firstRight ? 50 : 0);
    p.streak = (p.streak || 0) + 1; if (p.streak >= 3) pts += 30;
    if (g.mode === 'team') g.bossHp = Math.max(0, g.bossHp - pts / 2);
  } else p.streak = 0;
  p.score += pts;
  g.answers.set(p.id, { ok, pts, dt });
  send(p.ws, { t: 'ack', ok: null });
  bcast(r, { t: 'answered', id: p.id, count: g.answers.size, total: r.players.size });
  if (g.answers.size >= r.players.size) reveal(r);
}
function reveal(r) {
  const g = r.game; if (!g || g.revealed === g.i) return;
  g.revealed = g.i; clearTimeout(g.timer);
  const q = g.qs[g.i];
  const res = [...r.players.values()].map((p) => { const a = g.answers.get(p.id); return { id: p.id, name: p.name, ok: a ? a.ok : false, pts: a ? a.pts : 0, score: p.score }; });
  bcast(r, { t: 'reveal', i: g.i, ans: q.ans, ansText: q.kind === 'tap' ? q.toks[q.ans] : q.ans, steps: q.steps, res, bossHp: g.bossHp, bossMax: g.bossMax });
  g.timer = setTimeout(() => nextQ(r), 7000 + q.steps.length * 1200);
}
function endGame(r) {
  const g = r.game; if (!g) return;
  const ranking = [...r.players.values()].map((p) => ({ id: p.id, name: p.name, score: p.score })).sort((a, b) => b.score - a.score);
  bcast(r, { t: 'end', mode: g.mode, ranking, won: g.mode === 'team' ? g.bossHp <= 0 : null, bossHp: g.bossHp, bossMax: g.bossMax });
  clearTimeout(g.timer); r.game = null;
}

export function attachMultiplayer(server) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });
  wss.on('connection', (ws) => {
    let room = null, me = null, last = 0;
    ws.on('message', (buf) => {
      let m; try { m = JSON.parse(buf); } catch { return; }
      const now = Date.now();
      if (m.t !== 'pos' && now - last < 120) return; // anti-spam
      if (m.t !== 'pos') last = now;
      if (m.t === 'create' || m.t === 'join') {
        if (room) return;
        if (m.t === 'create') {
          const c = code(); room = { code: c, grade: [1, 2, 3].includes(+m.grade) ? +m.grade : 3, subject: ['mate', 'romana', 'mix', 'test'].includes(m.subject) ? m.subject : 'mix', players: new Map(), game: null };
          rooms.set(c, room);
        } else {
          room = rooms.get(String(m.code || '').toUpperCase());
          if (!room) { send(ws, { t: 'error', msg: 'Camera nu există sau s-a închis. Cere un link nou.' }); room = null; return; }
          if (room.players.size >= 30) { send(ws, { t: 'error', msg: 'Camera e plină (30 de jucători).' }); room = null; return; }
        }
        me = { id: nextId++, ws, name: clean(m.name), look: cleanLook(m.look), x: 0, y: 0.5, z: 5, f: 0, score: 0, host: room.players.size === 0 };
        room.players.set(me.id, me);
        send(ws, { t: 'joined', you: me.id, room: roomState(room) });
        bcast(room, { t: 'player', p: pub(me) }, ws);
        return;
      }
      if (!room || !me) return;
      if (m.t === 'pos') {
        me.x = +m.x || 0; me.y = +m.y || 0; me.z = +m.z || 0; me.f = +m.f || 0;
        bcast(room, { t: 'pos', id: me.id, x: me.x, y: me.y, z: me.z, f: me.f, a: m.a | 0 }, ws);
      } else if (m.t === 'look') { me.look = cleanLook(m.look); bcast(room, { t: 'look', id: me.id, look: me.look }); }
      else if (m.t === 'emote') { const k = EMOTES[m.k | 0]; if (k) bcast(room, { t: 'emote', id: me.id, text: k }); }
      else if (m.t === 'settings' && me.host && !room.game) {
        if ([1, 2, 3].includes(+m.grade)) room.grade = +m.grade;
        if (['mate', 'romana', 'mix', 'test'].includes(m.subject)) room.subject = m.subject;
        bcast(room, { t: 'room', room: roomState(room) });
      } else if (m.t === 'start' && me.host && !room.game && ['duel', 'team'].includes(m.mode)) startGame(room, m.mode);
      else if (m.t === 'answer') answer(room, me, m.i | 0, m.c | 0);
      else if (m.t === 'stop' && me.host && room.game) endGame(room);
    });
    ws.on('close', () => {
      if (!room || !me) return;
      room.players.delete(me.id);
      if (room.players.size === 0) { if (room.game) clearTimeout(room.game.timer); rooms.delete(room.code); return; }
      if (me.host) { const h = room.players.values().next().value; h.host = true; }
      bcast(room, { t: 'left', id: me.id, room: roomState(room) });
      if (room.game && room.game.answers.size >= room.players.size) reveal(room);
    });
  });
}
