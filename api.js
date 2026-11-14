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
    return err(res, 404, 'Nu există');
  } catch (e) {
    console.error('api', urlPath, e.message);
    return err(res, 500, 'Ceva n-a mers. Mai încearcă.');
  }
}
