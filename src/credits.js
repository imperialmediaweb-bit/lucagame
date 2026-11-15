// Cine a făcut jocul (apare la intrare, pe ecranul Acasă și în Meniu → Despre).
export const CREDITS = [['Creator', 'Aionițoaie Ionuț'], ['Dezvoltator', 'Blaze Luca']];
export const creditsHtml = () => `<small class="credits">${CREDITS.map(([r, n]) => `${r}: <b>${n}</b>`).join(' · ')}</small>`;
