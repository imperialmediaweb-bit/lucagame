// Stocarea profilurilor: PostgreSQL pe Railway (DATABASE_URL); local, fără bază, un fișier JSON pentru teste.
import fs from 'node:fs';
import path from 'node:path';

let impl;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  username TEXT PRIMARY KEY,
  display TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  rec_hash TEXT NOT NULL,
  grade INT NOT NULL DEFAULT 3,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  points INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  username TEXT NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS scores (
  username TEXT NOT NULL REFERENCES profiles(username) ON DELETE CASCADE,
  board TEXT NOT NULL,
  grade INT NOT NULL,
  score INT NOT NULL,
  ms INT NOT NULL DEFAULT 0,
  at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (username, board)
);
CREATE INDEX IF NOT EXISTS scores_board ON scores(board, grade, score DESC);
CREATE TABLE IF NOT EXISTS kv (
  k TEXT PRIMARY KEY,
  v JSONB NOT NULL
);
`;

async function pgImpl(url) {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString: url, max: 5, ssl: /railway\.internal|localhost/.test(url) ? false : { rejectUnauthorized: false } });
  await pool.query(SCHEMA);
  const q = (sql, args) => pool.query(sql, args).then((r) => r.rows);
  return {
    getProfile: async (u) => (await q('SELECT * FROM profiles WHERE username=$1', [u]))[0] || null,
    createProfile: (p) => q('INSERT INTO profiles(username,display,pin_hash,rec_hash,grade,state,points) VALUES($1,$2,$3,$4,$5,$6,$7)', [p.username, p.display, p.pin_hash, p.rec_hash, p.grade, p.state, p.points || 0]),
    updateProfile: (u, f) => {
      const keys = Object.keys(f); if (!keys.length) return;
      const sets = keys.map((k, i) => `${k}=$${i + 2}`).join(',');
      return q(`UPDATE profiles SET ${sets}, updated_at=now() WHERE username=$1`, [u, ...keys.map((k) => f[k])]);
    },
    addSession: (h, u) => q('INSERT INTO sessions(token_hash,username) VALUES($1,$2)', [h, u]),
    getSession: async (h) => (await q('SELECT username FROM sessions WHERE token_hash=$1', [h]))[0] || null,
    dropSessions: (u) => q('DELETE FROM sessions WHERE username=$1', [u]),
    putScore: (u, board, grade, score, ms) => q(`INSERT INTO scores(username,board,grade,score,ms) VALUES($1,$2,$3,$4,$5)
      ON CONFLICT (username,board) DO UPDATE SET score=EXCLUDED.score, ms=EXCLUDED.ms, grade=EXCLUDED.grade, at=now()
      WHERE scores.score < EXCLUDED.score OR (scores.score = EXCLUDED.score AND scores.ms > EXCLUDED.ms)`, [u, board, grade, score, ms]),
    top: (board, grade, n) => q(`SELECT s.username, p.display, s.score, s.ms FROM scores s JOIN profiles p USING(username)
      WHERE s.board=$1 AND s.grade=$2 ORDER BY s.score DESC, s.ms ASC LIMIT $3`, [board, grade, n]),
    getKV: async (k) => ((await q('SELECT v FROM kv WHERE k=$1', [k]))[0] || {}).v || null,
    setKV: (k, v) => q('INSERT INTO kv(k,v) VALUES($1,$2) ON CONFLICT (k) DO UPDATE SET v=EXCLUDED.v', [k, v]),
    rankOf: async (board, grade, u) => {
      const r = await q(`SELECT 1 + (SELECT count(*) FROM scores t WHERE t.board=s.board AND t.grade=s.grade AND (t.score > s.score OR (t.score = s.score AND t.ms < s.ms)))::int AS rank, s.score, s.ms
        FROM scores s WHERE s.board=$1 AND s.grade=$2 AND s.username=$3`, [board, grade, u]);
      return r[0] || null;
    }
  };
}

function fileImpl() {
  const file = path.join(process.cwd(), 'data', 'db.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  let D = { profiles: {}, sessions: {}, scores: {}, kv: {} };
  try { D = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* bază nouă */ }
  let t; const persist = () => { clearTimeout(t); t = setTimeout(() => fs.writeFileSync(file, JSON.stringify(D)), 200); };
  const sorted = (board, grade) => Object.values(D.scores).filter((s) => s.board === board && s.grade === grade).sort((a, b) => b.score - a.score || a.ms - b.ms);
  return {
    getProfile: async (u) => D.profiles[u] || null,
    createProfile: async (p) => { if (D.profiles[p.username]) throw Object.assign(new Error('dup'), { code: '23505' }); D.profiles[p.username] = { ...p }; persist(); },
    updateProfile: async (u, f) => { Object.assign(D.profiles[u], f, { updated_at: new Date().toISOString() }); persist(); },
    getKV: async (k) => ((D.kv || {})[k] ? JSON.parse(JSON.stringify(D.kv[k])) : null),
    setKV: async (k, v) => { D.kv = D.kv || {}; D.kv[k] = JSON.parse(JSON.stringify(v)); persist(); },
    addSession: async (h, u) => { D.sessions[h] = u; persist(); },
    getSession: async (h) => (D.sessions[h] ? { username: D.sessions[h] } : null),
    dropSessions: async (u) => { for (const k in D.sessions) if (D.sessions[k] === u) delete D.sessions[k]; persist(); },
    putScore: async (u, board, grade, score, ms) => { const k = u + '|' + board, o = D.scores[k]; if (!o || o.score < score || (o.score === score && o.ms > ms)) { D.scores[k] = { username: u, board, grade, score, ms }; persist(); } },
    top: async (board, grade, n) => sorted(board, grade).slice(0, n).map((s) => ({ ...s, display: D.profiles[s.username].display })),
    rankOf: async (board, grade, u) => { const l = sorted(board, grade), i = l.findIndex((s) => s.username === u); return i < 0 ? null : { rank: i + 1, score: l[i].score, ms: l[i].ms }; }
  };
}

export async function db() {
  if (!impl) impl = process.env.DATABASE_URL ? await pgImpl(process.env.DATABASE_URL) : fileImpl();
  return impl;
}
