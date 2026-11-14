import { G1 } from './grade1.js';
import { G2 } from './grade2.js';
import { G3, TEST_ITEMS } from './grade3.js';

export const GEN = { ...G1, ...G2, ...G3 };
export { TEST_ITEMS };

export const AREAS = [
  { id: '1', name: 'Pajiștea Clasei I', short: 'Clasa I', color: '#4cb05a', ground: '#8fdc6f', pos: [0, -52] },
  { id: '2', name: 'Pădurea Clasei a II-a', short: 'Clasa a II-a', color: '#2f7fd8', ground: '#6fc0a0', pos: [52, 0] },
  { id: '3', name: 'Castelul Clasei a III-a', short: 'Clasa a III-a', color: '#8a5cf6', ground: '#c9b38a', pos: [-52, 0] },
  { id: 'T', name: 'Arena Testului', short: 'Testul', color: '#e0582f', ground: '#e8c27a', pos: [0, 52] }
];

// look: [piele, tricou, pantaloni, pălărie, față]
export const MISSIONS = [
  { id: 'g1-compara', area: '1', npc: 'Ana', look: ['#f3c9a0', '#ff6b8a', '#3b4a7a', 'fundita', 'zambet'], title: 'Mai mare sau mai mic?', desc: 'Compari numere și găsești vecinii.', types: ['compara', 'vecini'] },
  { id: 'g1-adun', area: '1', npc: 'Bobo', look: ['#c98e5f', '#ffb020', '#2b3a55', 'sapca', 'zambet'], title: 'Adunări până la 20', desc: 'Aduni rapid, cu trucul „până la 10”.', types: ['adun20'], lesson: 'adun20' },
  { id: 'g1-scad', area: '1', npc: 'Mira', look: ['#f3c9a0', '#42c0d8', '#5a3b7a', 'nimic', 'zambet'], title: 'Scăderi până la 20', desc: 'Scazi și verifici cu adunarea.', types: ['scad20'] },
  { id: 'g1-zeci', area: '1', npc: 'Tudor', look: ['#8a5a3b', '#2fae5f', '#3b3b3b', 'casca', 'cool'], title: 'Zeci și unități', desc: 'Cum se construiește un număr.', types: ['zeci'], lesson: 'zeci' },
  { id: 'g1-prob', area: '1', npc: 'Lili', look: ['#f3c9a0', '#b07ae0', '#2b3a55', 'fundita', 'zambet'], title: 'Probleme mici', desc: 'Primește? Adunăm. Dă? Scădem.', types: ['prob1'] },
  { id: 'g1-silabe', area: '1', npc: 'Dan', look: ['#e0b48a', '#e04848', '#2b3a55', 'nimic', 'surprins'], title: 'Silabe', desc: 'Bați din palme și numeri silabele.', types: ['silabe'] },
  { id: 'g1-cegi', area: '1', npc: 'Gigi', look: ['#f3c9a0', '#f2b632', '#3b5a2b', 'coif', 'zambet'], title: 'ce, ci, ge, gi, che, chi', desc: 'Grupurile de litere cu care se încurcă toată lumea.', types: ['cegi'], lesson: 'cegi' },

  { id: 'g2-adun', area: '2', npc: 'Sara', look: ['#f3c9a0', '#3b7ddd', '#2b2f38', 'nimic', 'zambet'], title: 'Calcule până la 1000', desc: 'Adunări și scăderi cu trecere peste ordin.', types: ['adun1000'] },
  { id: 'g2-tabla', area: '2', npc: 'Vlad', look: ['#c98e5f', '#e04848', '#2b2f38', 'sapca', 'cool'], title: 'Tabla înmulțirii', desc: 'Ninja-ul tablei înmulțirii.', types: ['tabla'], lesson: 'tabla' },
  { id: 'g2-imp', area: '2', npc: 'Irina', look: ['#f3c9a0', '#8a5cf6', '#2b3a55', 'fundita', 'zambet'], title: 'Împărțirea', desc: 'Împărțirea e înmulțirea pe dos.', types: ['imp'] },
  { id: 'g2-maimult', area: '2', npc: 'Andrei', look: ['#e0b48a', '#2fae5f', '#3b3b3b', 'nimic', 'zambet'], title: 'Cu atât mai mult, mai puțin', desc: 'Probleme cu „mai mult” și „mai puțin”.', types: ['maimult'], lesson: 'maimult' },
  { id: 'g2-masuri', area: '2', npc: 'Bunicul Ion', look: ['#f0c8a8', '#7a5a3b', '#3b3b3b', 'palarie', 'zambet'], title: 'Măsurători', desc: 'Metri, ore, zile, litri.', types: ['masuri'] },
  { id: 'g2-orto', area: '2', npc: 'Elena', look: ['#f3c9a0', '#ff8ac0', '#5a3b7a', 'coroana', 'zambet'], title: 'Ortograme', desc: 's-a / sa, s-au / sau, i-a / ia, într-o.', types: ['orto'], lesson: 'orto' },
  { id: 'g2-punct', area: '2', npc: 'Matei', look: ['#8a5a3b', '#f2b632', '#2b3a55', 'casca', 'surprins'], title: 'Semne de punctuație', desc: 'Punct, întrebare sau exclamare?', types: ['punct'] },

  { id: 'g3-primul', area: '3', npc: 'Cavalerul Paranteză', look: ['#f3c9a0', '#9aa4b2', '#4a4f5a', 'coif', 'cool'], title: 'Ce se face primul?', desc: 'Regulile ordinii operațiilor.', types: ['primul', 'ordine3', 'ordine2'], lesson: 'ordine' },
  { id: 'g3-paranteze', area: '3', npc: 'Regina Cifrelor', look: ['#f3c9a0', '#8a5cf6', '#2b2f38', 'coroana', 'zambet'], title: 'Paranteze și calcule lungi', desc: 'Exact ca la exercițiul 1 a) din test.', types: ['ordine1', 'ordine2'], lesson: 'ordine' },
  { id: 'g3-ascuns', area: '3', npc: 'Vrăjitorul Ix', look: ['#e0b48a', '#4b3cc4', '#2b2f38', 'vrajitor', 'cool'], title: 'Numărul ascuns', desc: 'Află necunoscuta, ca la 1 b).', types: ['necunoscut2', 'necunoscut1'], lesson: 'ascuns' },
  { id: 'g3-gandesc', area: '3', npc: 'Detectivul Dodo', look: ['#c98e5f', '#7a5a3b', '#3b3b3b', 'palarie', 'cool'], title: 'Mă gândesc la un număr', desc: 'Mersul invers, ca la exercițiul 2.', types: ['gandesc'], lesson: 'ascuns' },
  { id: 'g3-veverite', area: '3', npc: 'Ronțăilă', look: ['#c46a2f', '#e07a2f', '#7a3b1f', 'urechi', 'zambet'], title: 'Problema veverițelor', desc: 'Benzi colorate și sume, ca la 3 și 1 c).', types: ['veverite', 'abc'], lesson: 'veverite' },
  { id: 'g3-piata', area: '3', npc: 'Bunica Ileana', look: ['#f0c8a8', '#d23a3a', '#3b3b3b', 'basma', 'zambet'], title: 'Piața bunicii', desc: 'Prețuri, rest și bani, ca la 4 și 5.', types: ['piata1', 'bunica', 'rest'], lesson: 'piata' },
  { id: 'g3-fractii', area: '3', npc: 'Bucătarul Tort', look: ['#f3c9a0', '#ffffff', '#2b2f38', 'bucatar', 'zambet'], title: 'Fracții', desc: 'Jumătăți, sferturi și felii de tort.', types: ['fractii'], lesson: 'fractii' },
  { id: 'g3-vorbire', area: '3', npc: 'Bibliotecara Ema', look: ['#f3c9a0', '#2fae5f', '#2b3a55', 'ochelari', 'zambet'], title: 'Părțile de vorbire', desc: 'Substantiv, verb sau adjectiv?', types: ['partivorbire'], lesson: 'vorbire' },

  { id: 'test-mate', area: 'T', npc: 'Profesorul Calcul', look: ['#f0c8a8', '#2b2f38', '#2b2f38', 'coroana', 'cool'], title: 'TESTUL: matematică', desc: 'Testul tău, cu numere noi de fiecare dată. Primești notă, ca la școală!', test: true, boss: true }
];

export const missionById = (id) => MISSIONS.find((m) => m.id === id);
export const areaById = (id) => AREAS.find((a) => a.id === id);
export const typeArea = (t) => (MISSIONS.find((m) => m.types && m.types.includes(t)) || {}).area;

export const TYPE_NAMES = {
  compara: 'Comparare și vecini', vecini: 'Numărul dinainte / de după', adun20: 'Adunări până la 20', scad20: 'Scăderi până la 20', zeci: 'Zeci și unități',
  prob1: 'Probleme cu o operație', silabe: 'Silabe', cegi: 'ce / ci / ge / gi / che / chi',
  adun1000: 'Calcule până la 1000', tabla: 'Tabla înmulțirii', imp: 'Împărțirea', maimult: '„cu … mai mult / mai puțin”', masuri: 'Măsurători',
  orto: 'Ortograme', punct: 'Semne de punctuație',
  primul: 'Ce operație e prima', ordine1: 'Paranteze (test 1 a)', ordine2: 'Înmulțiri înaintea scăderilor', ordine3: 'Capcana „+ ×”',
  necunoscut1: 'Necunoscuta în paranteze (test 1 b)', necunoscut2: 'Află numărul necunoscut', gandesc: '„Mă gândesc la un număr” (test 2)',
  veverite: 'Veverițele (test 3)', abc: 'a + b + c (test 1 c)', piata1: 'Mere și pere (test 4)', bunica: 'Bunica la piață (test 5)', rest: 'Rest de bani',
  fractii: 'Fracții', partivorbire: 'Părți de vorbire'
};
