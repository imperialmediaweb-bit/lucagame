// Accesorii cumpărate o dată, care se pot pune/scoate și chiar ajută în joc.
import { S, save } from './state.js';
export const ACC = {
  skate: { name: 'Skateboard', price: 150, icon: '🛹', desc: 'Mergi cu 40% mai repede.' },
  arc: { name: 'Bocanci cu arcuri', price: 120, icon: '👟', desc: 'Sari mult mai sus.' },
  aripi: { name: 'Aripi', price: 250, icon: '🪽', desc: 'Mai sari o dată în aer (săritură dublă).' },
  magnet: { name: 'Magnet de monede', price: 100, icon: '🧲', desc: 'Monedele vin la tine de la 6 metri.' }
};
const A = () => (S.acc = S.acc || { owned: {}, on: {} });
export const accOwned = (k) => !!A().owned[k];
export const accOn = (k) => !!(A().owned[k] && A().on[k]);
export function accBuy(k) { const a = ACC[k]; if (!a || accOwned(k) || S.coins < a.price) return false; S.coins -= a.price; A().owned[k] = 1; A().on[k] = 1; save(); return true; }
export function accToggle(k) { if (!accOwned(k)) return; A().on[k] = A().on[k] ? 0 : 1; save(); }
