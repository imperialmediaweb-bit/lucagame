// API pentru profiluri și clasamente. Fără email și fără nume reale: username + PIN de 4 cifre + cod de recuperare pentru părinte.
import crypto from 'node:crypto';
import { db } from './db.js';

const BAD = ['prost', 'idiot', 'muie', 'pula', 'pizda', 'futu', 'fut', 'curva', 'dracu', 'naiba', 'sex', 'nazi', 'hitler', 'fuck', 'shit', 'bitch', 'dick', 'ass', 'cacat', 'rahat', 'bou', 'tampit', 'handicap', 'gay', 'kill', 'admin', 'moderator'];
const USER_RE = /^[A-Za-z0-9_]{3,16}$/;
const BOARDS = /^(portal-[a-z0-9]{2,16}|test-mate|test-romana|clasa-[a-z]{4,8}|cursa-[a-z]{4,8}|general)$/;
const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const hashSecret = (s) => { const salt = crypto.randomBytes(12).toString('hex'); return salt + ':' + crypto.scryptSync(s, salt, 32).toString('hex'); };
const checkSecret = (s, h) => { const [salt, k] = String(h).split(':'); const t = crypto.scryptSync(s, salt, 32); return crypto.timingSafeEqual(t, Buffer.from(k, 'hex')); };
const recCode = () => Array.from({ length: 8 }, () => ALPH[crypto.randomInt(ALPH.length)]).join('').replace(/^(.{4})/, '$1-');
const normRec = (r) => String(r || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^(.{4})/, '$1-');

const tries = new Map(); // limită de încercări pentru PIN
function limited(key) {
  const now = Date.now(), t = (tries.get(key) || []).filter((x) => now - x < 10 * 60 * 1000);
  tries.set(key, t); return t.length >= 8;
}
const fail = (key) => { const t = tries.get(key) || []; t.push(Date.now()); tries.set(key, t); };

function readBody(req) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', (c) => { n += c.length; if (n > 96 * 1024) { reject(new Error('prea mare')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new Error('json')); } });
    req.on('error', reject);
  });
}
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const err = (res, code, msg) => json(res, code, { error: msg });

async function newSession(D, username) { const tok = crypto.randomBytes(24).toString('base64url'); await D.addSession(sha(tok), username); return tok; }
async function auth(D, req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || ''); if (!m) return null;
  const s = await D.getSession(sha(m[1])); return s ? s.username : null;
}
const pub = (p) => ({ username: p.display, grade: p.grade });
const pointsOf = (st) => Math.max(0, Math.min(10_000_000, Math.round(+((st && st.xp) || 0))));

export async function handleApi(req, res, urlPath) {
  const D = await db();
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  try {
    if (urlPath === '/api/register' && req.method === 'POST') {
      const b = await readBody(req), display = String(b.username || '').trim(), u = display.toLowerCase();
      if (!USER_RE.test(display)) return err(res, 400, 'Username-ul are 3–16 litere, cifre sau _ (fără spații și diacritice).');
      if (BAD.some((w) => u.includes(w))) return err(res, 400, 'Alege alt username, te rog.');
      if (!/^\d{4}$/.test(String(b.pin || ''))) return err(res, 400, 'PIN-ul are exact 4 cifre.');
      if (limited('reg|' + ip)) return err(res, 429, 'Prea multe încercări. Mai încearcă peste câteva minute.');
      fail('reg|' + ip);
      if (await D.getProfile(u)) return err(res, 409, 'Username-ul e deja luat. Alege altul.');
      const rec = recCode(), grade = [0, 1, 2, 3, 4].includes(+b.grade) ? +b.grade : 3;
      const state = b.state && typeof b.state === 'object' ? b.state : {};
      try { await D.createProfile({ username: u, display, pin_hash: hashSecret(String(b.pin)), rec_hash: hashSecret(rec.replace('-', '')), grade, state, points: pointsOf(state) }); }
      catch (e) { if (e.code === '23505') return err(res, 409, 'Username-ul e deja luat. Alege altul.'); throw e; }
      return json(res, 200, { token: await newSession(D, u), recovery: rec, profile: { username: display, grade }, state });
    }
    if (urlPath === '/api/login' && req.method === 'POST') {
      const b = await readBody(req), u = String(b.username || '').trim().toLowerCase(), key = 'login|' + u;
      if (limited(key) || limited('ip|' + ip)) return err(res, 429, 'Prea multe încercări greșite. Mai încearcă peste 10 minute.');
      const p = await D.getProfile(u);
      if (!p || !checkSecret(String(b.pin || ''), p.pin_hash)) { fail(key); fail('ip|' + ip); return err(res, 401, 'Username sau PIN greșit.'); }
      return json(res, 200, { token: await newSession(D, u), profile: pub(p), state: p.state });
    }
    if (urlPath === '/api/me' && req.method === 'GET') {
      const u = await auth(D, req); if (!u) return err(res, 401, 'Nu ești conectat.');
      const p = await D.getProfile(u); return json(res, 200, { profile: pub(p), state: p.state });
    }
    if (urlPath === '/api/state' && req.method === 'PUT') {
      const u = await auth(D, req); if (!u) return err(res, 401, 'Nu ești conectat.');
      const b = await readBody(req); if (!b.state || typeof b.state !== 'object') return err(res, 400, 'Date lipsă.');
      const grade = [0, 1, 2, 3, 4].includes(+b.state.grade) ? +b.state.grade : undefined;
      await D.updateProfile(u, { state: b.state, points: pointsOf(b.state), ...(grade ? { grade } : {}) });
      return json(res, 200, { ok: true });
    }
    if (urlPath === '/api/recover' && req.method === 'POST') {
      const b = await readBody(req), u = String(b.username || '').trim().toLowerCase(), key = 'rec|' + u;
      if (limited(key) || limited('ip|' + ip)) return err(res, 429, 'Prea multe încercări. Mai încearcă peste 10 minute.');
      const p = await D.getProfile(u);
      if (!p || !checkSecret(normRec(b.recovery).replace('-', ''), p.rec_hash)) { fail(key); fail('ip|' + ip); return err(res, 401, 'Username sau cod de recuperare greșit.'); }
      if (!/^\d{4}$/.test(String(b.pin || ''))) return err(res, 400, 'PIN-ul nou are exact 4 cifre.');
      await D.updateProfile(u, { pin_hash: hashSecret(String(b.pin)) }); await D.dropSessions(u);
      return json(res, 200, { token: await newSession(D, u), profile: pub(p), state: p.state });
    }
    if (urlPath === '/api/parent' && req.method === 'POST') {
      const b = await readBody(req), u = String(b.username || '').trim().toLowerCase(), key = 'par|' + u;
      if (limited(key) || limited('ip|' + ip)) return err(res, 429, 'Prea multe încercări. Mai încearcă peste 10 minute.');
      const p = await D.getProfile(u);
      if (!p || !checkSecret(normRec(b.recovery).replace('-', ''), p.rec_hash)) { fail(key); fail('ip|' + ip); return err(res, 401, 'Username sau cod de recuperare greșit.'); }
      return json(res, 200, { profile: pub(p), state: p.state });
    }
    if (urlPath === '/api/score' && req.method === 'POST') {
      const u = await auth(D, req); if (!u) return err(res, 401, 'Nu ești conectat.');
      const b = await readBody(req), board = String(b.board || '');
      if (!BOARDS.test(board)) return err(res, 400, 'Clasament necunoscut.');
      const score = Math.max(0, Math.min(1_000_000, Math.round(+b.score || 0))), ms = Math.max(0, Math.min(36e5, Math.round(+b.ms || 0)));
      const p = await D.getProfile(u);
      await D.putScore(u, board, p.grade, score, ms);
      return json(res, 200, { ok: true, rank: await D.rankOf(board, p.grade, u) });
    }
    if (urlPath === '/api/top' && req.method === 'GET') {
      const q = new URL(req.url, 'http://x').searchParams, board = q.get('board') || 'general', grade = [0, 1, 2, 3, 4].includes(+q.get('grade')) ? +q.get('grade') : 3;
      if (!BOARDS.test(board)) return err(res, 400, 'Clasament necunoscut.');
      const u = await auth(D, req);
      const top = (await D.top(board, grade, 20)).map((r, i) => ({ rank: i + 1, username: r.display, score: r.score, ms: r.ms }));
      return json(res, 200, { board, grade, top, me: u ? await D.rankOf(board, grade, u) : null });
    }
    if (/^\/api\/(class|friend|social)/.test(urlPath)) {
      const u = await auth(D, req); if (!u) return err(res, 401, 'Ai nevoie de profil ca să ai clasă și prieteni.');
      return await social(D, req, res, urlPath, u, ip);
    }
    return err(res, 404, 'Nu există');
  } catch (e) {
    console.error('api', urlPath, e.message);
    return err(res, 500, 'Ceva n-a mers. Mai încearcă.');
  }
}

/* ---------- clasa permanentă și prietenii ---------- */
// camerele de joc deschise acum pentru fiecare clasă (cod clasă → cod cameră), completat de serverul de joc
export const classRooms = new Map();
const CLS_RE = /^[A-Z0-9]{6}$/;
const classCode = () => Array.from({ length: 6 }, () => ALPH[crypto.randomInt(ALPH.length)]).join('');
const userDoc = async (D, u) => (await D.getKV('user:' + u)) || { classes: [], friends: [], reqIn: [], reqOut: [] };
const weekId = () => Math.floor((Date.now() / 86400000 + 3) / 7); // săptămâna începe luni
// ce vede un coleg sau un prieten: nivel (din xp), stele, xp-ul săptămânii, când a fost activ; fără greșeli și fără date private
async function card(D, u) {
  const p = await D.getProfile(u); if (!p) return null;
  const st = p.state || {}, stars = Object.values(st.missions || {}).reduce((a, m) => a + ((m && m.stars) || 0), 0);
  const wk = st.week && st.week.id === weekId() ? st.week.xp || 0 : 0;
  return { username: p.display, grade: p.grade, xp: +st.xp || 0, stars, weekXp: wk, look: st.look || null, seen: p.updated_at ? new Date(p.updated_at).getTime() : 0 };
}
async function social(D, req, res, urlPath, u, ip) {
  const body = req.method === 'POST' ? await readBody(req) : {};
  const me = await userDoc(D, u), saveMe = () => D.setKV('user:' + u, me);
  if (urlPath === '/api/social' && req.method === 'GET') {
    const classes = [];
    for (const c of me.classes) { const k = await D.getKV('class:' + c); if (k) classes.push({ code: k.code, name: k.name, owner: k.owner === u, pending: k.owner === u ? k.pending.length : 0, members: k.members.length }); }
    const cards = async (list) => (await Promise.all(list.map((x) => card(D, x)))).filter(Boolean);
    const waiting = [];
    for (const c of me.waiting || []) { const k = await D.getKV('class:' + c); if (k && k.pending.some((x) => x.u === u)) waiting.push({ code: c, name: k.name }); }
    me.waiting = waiting.map((w) => w.code); await saveMe();
    return json(res, 200, { classes, waiting, friends: await cards(me.friends), reqIn: await cards(me.reqIn), reqOut: await cards(me.reqOut) });
  }
  if (urlPath === '/api/class/create' && req.method === 'POST') {
    const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 32);
    if (name.length < 2) return err(res, 400, 'Scrie numele clasei, de exemplu „a III-a B”.');
    if (BAD.some((w) => name.toLowerCase().includes(w))) return err(res, 400, 'Alege alt nume, te rog.');
    if (me.classes.length >= 5) return err(res, 400, 'Poți fi în cel mult 5 clase.');
    if (limited('cls|' + ip)) return err(res, 429, 'Prea multe clase făcute. Mai încearcă mai târziu.'); fail('cls|' + ip);
    let code; do code = classCode(); while (await D.getKV('class:' + code));
    await D.setKV('class:' + code, { code, name, owner: u, members: [u], pending: [], created: Date.now() });
    me.classes.push(code); await saveMe();
    return json(res, 200, { code, name });
  }
  const code = String(body.code || new URL(req.url, 'http://x').searchParams.get('code') || '').toUpperCase().trim();
  if (urlPath.startsWith('/api/class')) {
    if (!CLS_RE.test(code)) return err(res, 400, 'Codul clasei are 6 litere și cifre.');
    const K = await D.getKV('class:' + code); if (!K) return err(res, 404, 'Nu există o clasă cu acest cod.');
    const saveK = () => D.setKV('class:' + code, K), isOwner = K.owner === u, isMember = K.members.includes(u);
    if (urlPath === '/api/class/join' && req.method === 'POST') {
      if (isMember) return json(res, 200, { member: true, name: K.name });
      if (limited('join|' + u)) return err(res, 429, 'Prea multe cereri. Mai încearcă mai târziu.'); fail('join|' + u);
      if (me.classes.length >= 5) return err(res, 400, 'Poți fi în cel mult 5 clase.');
      if (K.members.length >= 40) return err(res, 400, 'Clasa e plină (40 de copii).');
      if (!K.pending.some((x) => x.u === u)) { K.pending.push({ u, at: Date.now() }); K.pending = K.pending.slice(-30); await saveK(); }
      me.waiting = [...new Set([...(me.waiting || []), code])]; await saveMe();
      return json(res, 200, { pending: true, name: K.name });
    }
    if (urlPath === '/api/class/approve' && req.method === 'POST') {
      if (!isOwner) return err(res, 403, 'Doar cel care a făcut clasa poate primi colegi.');
      const who = String(body.username || '').toLowerCase(); if (!K.pending.some((x) => x.u === who)) return err(res, 404, 'Cererea nu mai există.');
      K.pending = K.pending.filter((x) => x.u !== who);
      if (body.ok && K.members.length < 40) {
        K.members.push(who); const d = await userDoc(D, who);
        d.classes = [...new Set([...d.classes, code])].slice(0, 5); d.waiting = (d.waiting || []).filter((c) => c !== code); await D.setKV('user:' + who, d);
      }
      await saveK(); return json(res, 200, { ok: true });
    }
    if (urlPath === '/api/class/leave' && req.method === 'POST') {
      const who = body.username ? String(body.username).toLowerCase() : u;
      if (who !== u && !isOwner) return err(res, 403, 'Doar cel care a făcut clasa poate scoate un coleg.');
      if (who === K.owner && K.members.length > 1) return err(res, 400, 'Ești șeful clasei: dă-o întâi altcuiva sau scoate-i pe toți.');
      K.members = K.members.filter((x) => x !== who); await saveK();
      const d = await userDoc(D, who); d.classes = d.classes.filter((c) => c !== code); await D.setKV('user:' + who, d);
      return json(res, 200, { ok: true });
    }
    if (urlPath === '/api/class' && req.method === 'GET') {
      if (!isMember) return err(res, 403, 'Nu ești (încă) în această clasă.');
      const members = (await Promise.all(K.members.map((x) => card(D, x).then((c) => c && { ...c, owner: x === K.owner })))).filter(Boolean);
      const pending = isOwner ? (await Promise.all(K.pending.map((x) => card(D, x.u)))).filter(Boolean) : [];
      return json(res, 200, { code, name: K.name, owner: isOwner, members, pending, room: classRooms.get(code) || null, week: weekId() });
    }
  }
  if (urlPath.startsWith('/api/friend') && req.method === 'POST') {
    const who = String(body.username || '').trim().toLowerCase();
    if (!USER_RE.test(who) || who === u) return err(res, 400, 'Scrie username-ul prietenului.');
    const other = await D.getProfile(who); if (!other) return err(res, 404, 'Nu există un copil cu acest username.');
    const od = await userDoc(D, who), saveO = () => D.setKV('user:' + who, od);
    if (urlPath === '/api/friend/request') {
      if (me.friends.includes(who)) return json(res, 200, { friends: true });
      if (me.friends.length >= 50) return err(res, 400, 'Ai deja 50 de prieteni.');
      if (limited('fr|' + u)) return err(res, 429, 'Prea multe cereri. Mai încearcă mai târziu.'); fail('fr|' + u);
      if (me.reqIn.includes(who)) { me.reqIn = me.reqIn.filter((x) => x !== who); od.reqOut = od.reqOut.filter((x) => x !== u); me.friends.push(who); od.friends.push(u); await saveMe(); await saveO(); return json(res, 200, { friends: true }); }
      me.reqOut = [...new Set([...me.reqOut, who])]; od.reqIn = [...new Set([...od.reqIn, u])].slice(-30); await saveMe(); await saveO();
      return json(res, 200, { sent: true });
    }
    if (urlPath === '/api/friend/answer') {
      if (!me.reqIn.includes(who)) return err(res, 404, 'Cererea nu mai există.');
      me.reqIn = me.reqIn.filter((x) => x !== who); od.reqOut = od.reqOut.filter((x) => x !== u);
      if (body.ok) { me.friends = [...new Set([...me.friends, who])]; od.friends = [...new Set([...od.friends, u])]; }
      await saveMe(); await saveO(); return json(res, 200, { ok: true });
    }
    if (urlPath === '/api/friend/remove') {
      me.friends = me.friends.filter((x) => x !== who); me.reqOut = me.reqOut.filter((x) => x !== who); od.friends = od.friends.filter((x) => x !== u); od.reqIn = od.reqIn.filter((x) => x !== u);
      await saveMe(); await saveO(); return json(res, 200, { ok: true });
    }
  }
  return err(res, 404, 'Nu există');
}
export { auth as authUser, db as dbHandle, sha as shaHash };
