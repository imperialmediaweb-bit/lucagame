// Progresul lui Luca, salvat în browser.
const KEY = 'insula-luca-v2';
const DEFAULTS = {
  coins: 0, missions: {}, // id -> {stars, best}
  look: { skin: '#f3c9a0', shirt: '#e04848', pants: '#2b3a55', hat: 'sapca', face: 'zambet' },
  owned: ['shirt:#e04848', 'pants:#2b3a55', 'hat:nimic', 'hat:sapca', 'face:zambet'],
  stats: {}, review: {}, today: { day: 0, sec: 0 }, streak: 0, lastGoalDay: -9, seen: {}, mute: false, tutorial: false,
  testBest: 0, chests: {}, camSpeed: 'incet', grade: 0, chapters: null, name: '', atelier: {}
};
DEFAULTS.xp = 0; DEFAULTS.badges = {}; DEFAULTS.records = {}; DEFAULTS.grade = null; DEFAULTS.gv = 2; DEFAULTS.unlocked = {}; DEFAULTS.placed = null; DEFAULTS.powers = {}; DEFAULTS.doubleUntil = 0;
const migrate = (o) => { if (o.gv !== 2) { if (o.grade === 0) o.grade = null; o.gv = 2; } return o; };
export const S = JSON.parse(JSON.stringify(DEFAULTS));
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) Object.assign(S, migrate(s)); } catch (e) { /* fără salvare */ }
let onSave = null;
export const setOnSave = (f) => { onSave = f; };
// punctele de experiență ale săptămânii (pentru clasamentul clasei); săptămâna începe luni
export const weekId = () => Math.floor((Date.now() / 86400000 + 3) / 7);
function weekTick() { const w = weekId(); if (!S.week || S.week.id !== w) S.week = { id: w, base: S.xp || 0, xp: 0 }; S.week.xp = Math.max(0, (S.xp || 0) - S.week.base); }
export function save() { weekTick(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* fără salvare */ } if (onSave) onSave(); }
/** Înlocuiește progresul cu cel din profil (păstrând valorile implicite pentru câmpuri noi). */
export function loadState(st) {
  for (const k of Object.keys(S)) delete S[k];
  Object.assign(S, JSON.parse(JSON.stringify(DEFAULTS)), migrate({ ...(st || {}) }));
  if (S.today.day !== DAY()) S.today = { day: DAY(), sec: 0 };
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* fără salvare */ }
}
/** Clasele mai mici decât clasa copilului sunt închise (nu se mai strâng monede ușoare). Arena e pentru clasa a III-a. */
/** Clasa copilului: 0 = pregătitoare … 4 = clasa a IV-a (implicit a III-a). */
export const G = () => (S.grade === null || S.grade === undefined ? 3 : S.grade);
export const GRADE_NAMES = ['clasa pregătitoare', 'clasa I', 'clasa a II-a', 'clasa a III-a', 'clasa a IV-a'];
/** Clasele mai mici sunt închise. Clasa următoare se deschide după ce termini lumea clasei tale. Arena e pentru clasa a III-a. */
export const areaLocked = (areaId) => {
  const g = G();
  if (areaId === 'T') return g !== 3;
  const n = +areaId;
  if (n < g) return true;
  if (n > g) return !(S.unlocked || {})[n];
  return false;
};
export const level = () => Math.floor(Math.sqrt((S.xp || 0) / 40)) + 1;
export const xpFor = (l) => 40 * (l - 1) * (l - 1);
export const DAY = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
export const GOAL = 20 * 60;
if (S.today.day !== DAY()) S.today = { day: DAY(), sec: 0 };
if (S.lastGoalDay < DAY() - 1) S.streak = 0;

export const starsTotal = () => Object.values(S.missions).reduce((a, m) => a + (m.stars || 0), 0);

// Recapitulare la 1, 3 și 7 zile pentru tipurile greșite
const GAPS = [1, 3, 7];
export function reviewMark(type, ok) {
  const r = S.review[type], d = DAY();
  if (!ok) { S.review[type] = { due: d + 1, stage: 0 }; return; }
  if (r && r.due <= d) { r.stage++; if (r.stage >= GAPS.length) delete S.review[type]; else r.due = d + GAPS[r.stage]; }
}
export const dueTypes = () => Object.keys(S.review).filter((t) => S.review[t].due <= DAY());
export function weightOf(t) { const s = S.stats[t] || { ok: 0, bad: 0 }; return 1 + 3 * (s.bad + 1) / (s.ok + s.bad + 2); }
export function pickWeighted(types) {
  const w = types.map(weightOf); let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return types[i]; }
  return types[0];
}
