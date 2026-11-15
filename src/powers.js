// Puteri cumpărate cu monede: ajută la misiuni, dar nu rezolvă în locul copilului.
import { S, save } from './state.js';

export const POWERS = {
  half: { name: 'Elimină 2 variante', price: 20, desc: 'La o întrebare grea, scoate 2 răspunsuri greșite.', icon: '½' },
  shield: { name: 'Scut contra monstrului', price: 40, desc: 'Monstrul te prinde o dată fără să pierzi o viață.', icon: '🛡' },
  slow: { name: 'Încetinitor de timp', price: 50, desc: 'O fugă întreagă cu timp mai mult la fiecare exercițiu.', icon: '⏳' },
  double: { name: 'Monede duble 10 minute', price: 60, desc: 'Fiecare răspuns bun îți dă de 2 ori mai multe monede.', icon: '×2' }
};
export const has = (k) => ((S.powers || {})[k] || 0) > 0;
export const count = (k) => (S.powers || {})[k] || 0;
export function use(k) { if (!has(k)) return false; S.powers[k]--; save(); return true; }
export function buy(k) {
  const p = POWERS[k]; if (!p || S.coins < p.price) return false;
  S.coins -= p.price; S.powers = S.powers || {};
  if (k === 'double') S.doubleUntil = Math.max(Date.now(), S.doubleUntil || 0) + 10 * 60 * 1000;
  else S.powers[k] = (S.powers[k] || 0) + 1;
  save(); return true;
}
export const doubleOn = () => (S.doubleUntil || 0) > Date.now();
export const doubleLeft = () => Math.max(0, Math.ceil(((S.doubleUntil || 0) - Date.now()) / 60000));
