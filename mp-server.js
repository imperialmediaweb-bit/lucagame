// Multiplayer: camere de joc cu cod, poziții în timp real, Duel și Echipă contra Boss-ului.
// Fără conturi, fără date personale: doar un prenume, ținut în memorie cât timp camera e deschisă.
import { WebSocketServer } from 'ws';
import { GEN, typesFor, TEST_ITEMS, ROMANA } from './src/content/missions.js';
import { SPEED } from './src/content/speed.js';

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
/* ---------- testul în clasă: același test pentru toți, fiecare în ritmul lui ---------- */
function startClass(r, subject, level) {
  const sub = subject === 'romana' ? 'romana' : 'mate';
  let qs;
  if (sub === 'mate' && level === 'test' && r.grade === 3) qs = TEST_ITEMS.map((it) => ({ type: it.type, pts: it.pts, ...GEN[it.type]() }));
  else {
    const types = typesFor(r.grade, sub === 'romana' ? 'romana' : 'mate').filter((t) => (level === 'usor' ? !['necunoscut1', 'gandesc', 'veverite', 'bunica', 'piata1', 'sumadif', 'sumacat'].includes(t) : true));
    qs = Array.from({ length: 8 }, (_, i) => { const t = types[i % types.length] && types[Math.floor(Math.random() * types.length)]; return { type: t, pts: 9 / 8, ...GEN[t]() }; });
  }
  const seats = [...r.players.values()].map((p, i) => ({ id: p.id, seat: i }));
  r.game = { mode: 'class', sub, level, qs, t0: Date.now(), limit: 20 * 60 * 1000, sheets: new Map(), timer: null };
  for (const p of r.players.values()) { p.score = 0; r.game.sheets.set(p.id, { ans: [], done: 0, ms: 0, finished: false }); }
  bcast(r, { t: 'class', sub, level, qs: qs.map(publicQ), seats, limitMs: r.game.limit });
  r.game.timer = setTimeout(() => classEnd(r), r.game.limit + 2000);
}
function classAnswer(r, p, i, c) {
  const g = r.game; if (!g || g.mode !== 'class') return;
  const sh = g.sheets.get(p.id); if (!sh || sh.finished || i !== sh.done || i >= g.qs.length) return;
  sh.ans[i] = c | 0; sh.done++;
  if (sh.done >= g.qs.length) { sh.finished = true; sh.ms = Date.now() - g.t0; }
  bcast(r, { t: 'cprog', id: p.id, done: sh.done, n: g.qs.length, ms: sh.ms });
  if ([...g.sheets.values()].every((x) => x.finished)) classEnd(r);
}
function classEnd(r) {
  const g = r.game; if (!g || g.mode !== 'class') return;
  clearTimeout(g.timer);
  const res = [...r.players.values()].map((p) => {
    const sh = g.sheets.get(p.id) || { ans: [], ms: 0 };
    const right = g.qs.map((q, i) => isRight(q, sh.ans[i]));
    const nota = Math.round((1 + g.qs.reduce((a, q, i) => a + (right[i] ? q.pts : 0), 0)) * 100) / 100;
    return { id: p.id, name: p.name, nota, correct: right.filter(Boolean).length, ms: sh.ms || (Date.now() - g.t0), finished: !!sh.finished, right, ans: sh.ans };
  }).sort((a, b) => b.nota - a.nota || a.ms - b.ms);
  const key = g.qs.map((q) => ({ ans: q.ans, ansText: q.kind === 'tap' ? q.toks[q.ans] : q.ans, steps: q.steps }));
  bcast(r, { t: 'classEnd', sub: g.sub, n: g.qs.length, res, key });
  r.game = null;
}

/* ---------- cursa monștrilor: aceleași exerciții pentru toți, câștigă cine ajunge primul la ieșire ---------- */
const RACE_GOAL = 12;
function raceInvite(r, p, portal) {
  if (r.game || r.race || !SPEED[portal]) return;
  r.race = { portal, from: p.id, phase: 'invite', joined: new Set([p.id]), declined: new Set(), runners: new Map(), timer: null };
  bcast(r, { t: 'raceInvite', from: p.id, name: p.name, portal });
  r.race.timer = setTimeout(() => raceStart(r), 12000);
}
function raceReply(r, p, yes) {
  const R = r.race; if (!R || R.phase !== 'invite') return;
  (yes ? R.joined : R.declined).add(p.id);
  bcast(r, { t: 'raceLobby', joined: [...R.joined], declined: [...R.declined] });
  if (R.joined.size + R.declined.size >= r.players.size) raceStart(r);
}
function raceStart(r) {
  const R = r.race; if (!R || R.phase !== 'invite') return;
  clearTimeout(R.timer);
  const ids = [...R.joined].filter((id) => r.players.has(id));
  if (ids.length < 1) { r.race = null; return; }
  R.phase = 'run'; R.t0 = Date.now();
  const qs = Array.from({ length: 40 }, () => SPEED[R.portal].gen());
  ids.forEach((id, i) => R.runners.set(id, { lane: i, correct: 0, lives: 3, done: false, out: false, ms: 0 }));
  bcast(r, { t: 'raceStart', portal: R.portal, goal: RACE_GOAL, qs, lanes: ids.map((id, i) => ({ id, lane: i, name: r.players.get(id).name })) });
  R.timer = setTimeout(() => raceEnd(r), 5 * 60 * 1000);
}
function raceProgress(r, p, m) {
  const R = r.race; if (!R || R.phase !== 'run') return;
  const x = R.runners.get(p.id); if (!x || x.done || x.out) return;
  x.correct = Math.max(0, Math.min(RACE_GOAL, m.correct | 0)); x.lives = Math.max(0, Math.min(3, m.lives | 0));
  if (m.finished && x.correct >= RACE_GOAL) { x.done = true; x.ms = Date.now() - R.t0; }
  if (x.lives <= 0) { x.out = true; x.ms = Date.now() - R.t0; }
  bcast(r, { t: 'raceProg', id: p.id, correct: x.correct, lives: x.lives, done: x.done, out: x.out, ms: x.ms });
  if ([...R.runners.values()].every((y) => y.done || y.out)) raceEnd(r);
}
function raceEnd(r) {
  const R = r.race; if (!R) return;
  clearTimeout(R.timer);
  const ranking = [...R.runners.entries()].map(([id, x]) => ({ id, name: (r.players.get(id) || {}).name || 'coleg', ...x }))
    .sort((a, b) => (b.done - a.done) || (a.done ? a.ms - b.ms : b.correct - a.correct || b.ms - a.ms));
  bcast(r, { t: 'raceEnd', portal: R.portal, ranking });
  r.race = null;
}

function endGame(r) {
  if (r.game && r.game.mode === 'class') return classEnd(r);
  const g = r.game; if (!g) return;
  const ranking = [...r.players.values()].map((p) => ({ id: p.id, name: p.name, score: p.score })).sort((a, b) => b.score - a.score);
  bcast(r, { t: 'end', mode: g.mode, ranking, won: g.mode === 'team' ? g.bossHp <= 0 : null, bossHp: g.bossHp, bossMax: g.bossMax });
  clearTimeout(g.timer); r.game = null;
}

export function attachMultiplayer(server) {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });
  wss.on('connection', (ws) => {
    let room = null, me = null, last = 0, pendingId = 0, pendingRoom = null;
    const enter = (m, id) => {
      me = { id, ws, name: clean(m.name), look: cleanLook(m.look), x: 0, y: 0.5, z: 5, f: 0, score: 0, host: room.players.size === 0 };
      room.players.set(me.id, me);
      send(ws, { t: 'joined', you: me.id, room: roomState(room) });
      bcast(room, { t: 'player', p: pub(me) }, ws);
    };
    ws.on('message', (buf) => {
      let m; try { m = JSON.parse(buf); } catch { return; }
      const now = Date.now();
      if (m.t !== 'pos' && now - last < 120) return; // anti-spam
      if (m.t !== 'pos') last = now;
      if (m.t === 'create' || m.t === 'join') {
        if (room || pendingId) return;
        if (m.t === 'create') {
          const c = code(); room = { code: c, grade: [0, 1, 2, 3, 4].includes(+m.grade) ? +m.grade : 3, subject: ['mate', 'romana', 'mix', 'test', 'stiinte', 'civica', 'engleza', 'compuneri'].includes(m.subject) ? m.subject : 'mix', players: new Map(), game: null };
          rooms.set(c, room);
        } else {
          room = rooms.get(String(m.code || '').toUpperCase());
          if (!room) { send(ws, { t: 'error', msg: 'Camera nu există sau s-a închis. Cere un link nou.' }); room = null; return; }
          if (room.players.size >= 30) { send(ws, { t: 'error', msg: 'Camera e plină (30 de jucători).' }); room = null; return; }
          // siguranță: gazda aprobă pe oricine intră
          const r = room, pid = nextId++; room = null; pendingId = pid;
          r.pending = r.pending || new Map();
          if (r.pending.size >= 10) { send(ws, { t: 'error', msg: 'Prea mulți așteaptă la ușă. Încearcă peste un minut.' }); return; }
          const done = () => { clearTimeout(p.timer); r.pending.delete(pid); pendingId = 0; };
          const p = { name: clean(m.name), look: m.look,
            admit: () => { done(); if (ws.readyState !== 1 || !rooms.has(r.code)) return; room = r; enter(m, pid); },
            deny: (msg) => { done(); send(ws, { t: 'error', msg }); } };
          p.timer = setTimeout(() => p.deny('Gazda nu a răspuns. Roagă-l pe colegul tău să te primească și încearcă din nou.'), 120000);
          r.pending.set(pid, p); pendingRoom = r;
          send(ws, { t: 'wait', code: r.code });
          const host = [...r.players.values()].find((x) => x.host); if (host) send(host.ws, { t: 'knock', id: pid, name: p.name });
          return;
        }
        enter(m, nextId++);
        return;
      }
      if (m.t === 'admit' && me && me.host && room && room.pending) {
        const p = room.pending.get(m.id | 0); if (!p) return;
        if (m.ok) p.admit(); else p.deny('Gazda nu te-a primit în cameră.');
        return;
      }
      if (!room || !me) return;
      if (m.t === 'pos') {
        me.x = +m.x || 0; me.y = +m.y || 0; me.z = +m.z || 0; me.f = +m.f || 0;
        bcast(room, { t: 'pos', id: me.id, x: me.x, y: me.y, z: me.z, f: me.f, a: m.a | 0 }, ws);
      } else if (m.t === 'look') { me.look = cleanLook(m.look); bcast(room, { t: 'look', id: me.id, look: me.look }); }
      else if (m.t === 'emote') { const k = EMOTES[m.k | 0]; if (k) bcast(room, { t: 'emote', id: me.id, text: k }); }
      else if (m.t === 'settings' && me.host && !room.game) {
        if ([0, 1, 2, 3, 4].includes(+m.grade)) room.grade = +m.grade;
        if (['mate', 'romana', 'mix', 'test', 'stiinte', 'civica', 'engleza', 'compuneri'].includes(m.subject)) room.subject = m.subject;
        bcast(room, { t: 'room', room: roomState(room) });
      } else if (m.t === 'start' && me.host && !room.game && !room.race && ['duel', 'team'].includes(m.mode)) startGame(room, m.mode);
      else if (m.t === 'class' && me.host && !room.game && !room.race) startClass(room, m.sub, m.level);
      else if (m.t === 'canswer') classAnswer(room, me, m.i | 0, m.c);
      else if (m.t === 'race') raceInvite(room, me, String(m.portal || ''));
      else if (m.t === 'raceReply') raceReply(room, me, !!m.yes);
      else if (m.t === 'rprog') raceProgress(room, me, m);
      else if (m.t === 'summon') { const x = +m.x, z = +m.z; if (Number.isFinite(x) && Number.isFinite(z)) bcast(room, { t: 'summon', from: me.id, name: me.name, x, z, place: String(m.place || '').slice(0, 40) }, ws); }
      else if (m.t === 'answer') answer(room, me, m.i | 0, m.c | 0);
      else if (m.t === 'stop' && me.host && room.game) endGame(room);
    });
    ws.on('close', () => {
      if (pendingId && pendingRoom && pendingRoom.pending) { const p = pendingRoom.pending.get(pendingId); if (p) { clearTimeout(p.timer); pendingRoom.pending.delete(pendingId); } }
      if (!room || !me) return;
      if (room.race) { room.race.joined.delete(me.id); const x = room.race.runners.get(me.id); if (x) { x.out = true; } if (room.race.phase === 'run' && [...room.race.runners.values()].every((y) => y.done || y.out)) raceEnd(room); }
      room.players.delete(me.id);
      if (room.players.size === 0) { if (room.game) clearTimeout(room.game.timer); rooms.delete(room.code); return; }
      if (me.host) { const h = room.players.values().next().value; h.host = true; }
      bcast(room, { t: 'left', id: me.id, room: roomState(room) });
      if (room.game && room.game.mode === 'class') { room.game.sheets.delete(me.id); if ([...room.game.sheets.values()].every((x) => x.finished)) classEnd(room); }
      else if (room.game && room.game.answers.size >= room.players.size) reveal(room);
    });
  });
}
