import { G1 } from './grade1.js';
import { G2 } from './grade2.js';
import { G3, TEST_ITEMS } from './grade3.js';
import { G3B } from './grade3b.js';
import { G0 } from './grade0.js';
import { G4 } from './grade4.js';
import { G3C } from './grade3c.js';
import { SUBJECTS3 } from './subjects3.js';
import { NATURA3 } from './natura3.js';
import { GRADE2B } from './grade2b.js';

export const GEN = { ...G0, ...G1, ...G2, ...G3, ...G3B, ...G3C, ...G4, ...SUBJECTS3, ...NATURA3, ...GRADE2B };
export { TEST_ITEMS };

export const AREAS = [
  { id: '0', name: 'Grădina Pregătitoare', short: 'Pregătitoare', color: '#ff8ac0', ground: '#a8e88a', pos: [-52, -52], portalOnly: true },
  { id: '4', name: 'Munții Clasei a IV-a', short: 'Clasa a IV-a', color: '#42c0d8', ground: '#b9c7cf', pos: [52, -52], portalOnly: true },
  { id: '1', name: 'Pajiștea Clasei I', short: 'Clasa I', color: '#4cb05a', ground: '#8fdc6f', pos: [0, -52] },
  { id: '2', name: 'Pădurea Clasei a II-a', short: 'Clasa a II-a', color: '#2f7fd8', ground: '#6fc0a0', pos: [52, 0] },
  { id: '3', name: 'Castelul Clasei a III-a', short: 'Clasa a III-a', color: '#8a5cf6', ground: '#c9b38a', pos: [-52, 0] },
  { id: 'T', name: 'Arena Testului', short: 'Testul', color: '#e0582f', ground: '#e8c27a', pos: [0, 52] }
];

// look: [piele, tricou, pantaloni, pălărie, față]
export const MISSIONS = [
  { id: 'g0-numar', area: '0', per: 1, npc: 'Zâna Ina', look: ['#f3c9a0', '#ff8ac0', '#5a3b7a', 'coroana', 'fericit'], title: 'Numărăm', desc: 'Numeri obiecte și afli vecinii numerelor.', types: ['numarare', 'vecini31'] },
  { id: 'g0-compar', area: '0', per: 2, npc: 'Ursulețul Bubu', look: ['#a8501f', '#f2b632', '#7a3b1f', 'urechi', 'fericit'], title: 'Mai mare, mai mic', desc: 'Care număr e mai mare?', types: ['compara10'] },
  { id: 'g0-adun', area: '0', per: 2, npc: 'Pisica Mimi', look: ['#f0e0d0', '#ff7a2f', '#2b3a55', 'urechi', 'zambet'], title: 'Adunări până la 10', desc: 'Pui împreună buline.', types: ['adun10'] },
  { id: 'g0-scad', area: '0', per: 3, npc: 'Clovnul Pufi', look: ['#f3c9a0', '#42c0d8', '#e04848', 'palarie', 'fericit'], title: 'Scăderi până la 10', desc: 'Baloane care zboară.', types: ['scad10'] },
  { id: 'g0-forme', area: '0', per: 1, npc: 'Robo Formă', look: ['#9aa4b2', '#3b7ddd', '#2b2f38', 'casca', 'robot'], title: 'Forme', desc: 'Triunghi, pătrat, cerc, dreptunghi.', types: ['forme'] },
  { id: 'g0-sunete', area: '0', per: 1, npc: 'Bufnița Hu', look: ['#c98e5f', '#7a5a3b', '#3b3b3b', 'ochelari', 'surprins'], title: 'Primul sunet', desc: 'Cu ce sunet începe cuvântul?', types: ['sunetInitial'] },
  { id: 'g0-rime', area: '0', per: 2, npc: 'Greierele Cântăreț', look: ['#6fd04a', '#2fae5f', '#2b2f38', 'palarie', 'fericit'], title: 'Rime', desc: 'Cuvinte care sună la fel la sfârșit.', types: ['rima'] },

  { id: 'g4-numere', area: '4', per: 1, npc: 'Alpinistul Milion', look: ['#c98e5f', '#e04848', '#2b2f38', 'casca', 'cool'], title: 'Numere până la 1.000.000', desc: 'Cifre, clase, comparare, rotunjire.', types: ['numere1m'] },
  { id: 'g4-calc', area: '4', per: 1, npc: 'Ciobanul Socoteală', look: ['#e0b48a', '#f1e6d0', '#7a5a3b', 'palarie', 'zambet'], title: 'Adunări și scăderi uriașe', desc: 'Până la 1.000.000.', types: ['calc1m'] },
  { id: 'g4-inm', area: '4', per: 2, npc: 'Vulturul Produs', look: ['#7a5a3b', '#2b2f38', '#f2b632', 'nimic', 'cool'], title: 'Înmulțirea cu 2 cifre', desc: 'Desfaci și înmulțești pe bucăți.', types: ['inm2c'], lesson: 'inm' },
  { id: 'g4-imp', area: '4', per: 2, npc: 'Pădurarul Cât', look: ['#c98e5f', '#2fae5f', '#3b3b3b', 'palarie', 'zambet'], title: 'Împărțirea mare', desc: 'Împărțire la o cifră, cu și fără rest.', types: ['imp1c'], lesson: 'rest' },
  { id: 'g4-fractii', area: '4', per: 3, npc: 'Bucătăreasa Felia', look: ['#f3c9a0', '#ffffff', '#ff8ac0', 'bucatar', 'fericit'], title: 'Fracții', desc: 'Fracție dintr-un număr, comparare, fracții egale.', types: ['fractiiIV'], lesson: 'fractii' },
  { id: 'g4-masuri', area: '4', per: 3, npc: 'Negustorul de Munte', look: ['#c98e5f', '#e07a2f', '#3b3b3b', 'palarie', 'zambet'], title: 'Măsuri mari', desc: 'km, mm, tone, hectolitri, secole.', types: ['masuriIV'] },
  { id: 'g4-corpuri', area: '4', per: 3, npc: 'Arhitecta Cub', look: ['#f3c9a0', '#42c0d8', '#2b2f38', 'casca', 'cool'], title: 'Corpuri geometrice', desc: 'Cub, cuboid, sferă, cilindru, con.', types: ['corpuri'] },
  { id: 'g4-ipoteza', area: '4', per: 3, npc: 'Fermierul Iepurilă', look: ['#e0b48a', '#7a5a3b', '#2b3a55', 'palarie', 'surprins'], title: 'Găini și iepuri', desc: 'Metoda falsei ipoteze.', types: ['ipoteza', 'sumadif'] },
  { id: 'g4-verb', area: '4', per: 1, npc: 'Cronicarul Timp', look: ['#f3c9a0', '#8a5cf6', '#2b2f38', 'vrajitor', 'cool'], title: 'Verbul și timpul', desc: 'Prezent, trecut, viitor.', types: ['verbTimp'] },
  { id: 'g4-pronume', area: '4', per: 2, npc: 'Ecoul Munților', look: ['#e0b48a', '#9aa4b2', '#2b2f38', 'nimic', 'surprins'], title: 'Pronumele și numeralul', desc: 'Persoana I, a II-a, a III-a; câți? al câtelea?', types: ['pronume', 'numeral'] },
  { id: 'g4-adjectiv', area: '4', per: 2, npc: 'Pictorul Acord', look: ['#f3c9a0', '#ffb020', '#2b3a55', 'palarie', 'fericit'], title: 'Acordul adjectivului', desc: 'Florile sunt frumoase, nu frumoasă.', types: ['acordAdj'] },
  { id: 'g4-cuvinte', area: '4', per: 3, npc: 'Bibliotecarul Sens', look: ['#c98e5f', '#2fae5f', '#2b2f38', 'ochelari', 'zambet'], title: 'Omonime și tipuri de text', desc: 'Cuvinte cu două înțelesuri; narativ, descriptiv.', types: ['omonime', 'textTip', 'sinonime'] },

  { id: 'g1-compara', area: '1', per: 1, npc: 'Ana', look: ['#f3c9a0', '#ff6b8a', '#3b4a7a', 'fundita', 'zambet'], title: 'Mai mare sau mai mic?', desc: 'Compari numere și găsești vecinii.', types: ['compara', 'vecini'] },
  { id: 'g1-adun', area: '1', per: 1, npc: 'Bobo', look: ['#c98e5f', '#ffb020', '#2b3a55', 'sapca', 'zambet'], title: 'Adunări până la 20', desc: 'Aduni rapid, cu trucul „până la 10”.', types: ['adun20'], lesson: 'adun20' },
  { id: 'g1-scad', area: '1', per: 2, npc: 'Mira', look: ['#f3c9a0', '#42c0d8', '#5a3b7a', 'nimic', 'zambet'], title: 'Scăderi până la 20', desc: 'Scazi și verifici cu adunarea.', types: ['scad20'] },
  { id: 'g1-zeci', area: '1', per: 2, npc: 'Tudor', look: ['#8a5a3b', '#2fae5f', '#3b3b3b', 'casca', 'cool'], title: 'Zeci și unități', desc: 'Cum se construiește un număr.', types: ['zeci'], lesson: 'zeci' },
  { id: 'g1-adun100', area: '1', per: 2, npc: 'Profesorul Bob', look: ['#f0c8a8', '#2EC4A6', '#2b3a55', 'ochelari', 'zambet'], title: 'Calcule până la 100', desc: 'Adunări și scăderi până la 100, fără și cu trecere.', types: ['adun100f', 'adun100t', 'rec100'] },
  { id: 'g1-prob', area: '1', per: 3, npc: 'Lili', look: ['#f3c9a0', '#b07ae0', '#2b3a55', 'fundita', 'zambet'], title: 'Probleme mici', desc: 'Primește? Adunăm. Dă? Scădem.', types: ['prob1'] },
  { id: 'g1-silabe', area: '1', per: 1, npc: 'Dan', look: ['#e0b48a', '#e04848', '#2b3a55', 'nimic', 'surprins'], title: 'Silabe', desc: 'Bați din palme și numeri silabele.', types: ['silabe'] },
  { id: 'g1-cegi', area: '1', per: 2, npc: 'Gigi', look: ['#f3c9a0', '#f2b632', '#3b5a2b', 'coif', 'zambet'], title: 'ce, ci, ge, gi, che, chi', desc: 'Grupurile de litere cu care se încurcă toată lumea.', types: ['cegi'], lesson: 'cegi' },

  { id: 'g2-rec100', area: '2', per: 1, npc: 'Tudor', look: ['#f3c9a0', '#2EC4A6', '#2b3a55', 'sapca', 'zambet'], title: 'Recapitulare până la 100', desc: 'Comparare, vecini, par/impar, calcule fără și cu trecere.', types: ['rec100', 'adun100f', 'adun100t'] },
  { id: 'g2-numere', area: '2', per: 1, npc: 'Maria', look: ['#e0b48a', '#7B5CF6', '#3b3b3b', 'fundita', 'zambet'], title: 'Numerele până la 1000', desc: 'Sute, zeci, unități, comparare, scrise în cuvinte, rotunjire.', types: ['numere1000', 'rotunjire2', 'sirNumere', 'celMaiMare', 'descompune'] },
  { id: 'g2-adunf', area: '2', per: 1, npc: 'Sara', look: ['#f3c9a0', '#3b7ddd', '#2b2f38', 'nimic', 'zambet'], title: 'Adunări fără trecere', desc: 'Adunări și scăderi până la 1000, fără trecere peste ordin.', types: ['adun1000f', 'compSume', 'proba'] },
  { id: 'g2-orto', area: '2', per: 2, npc: 'Elena', look: ['#f3c9a0', '#ff8ac0', '#5a3b7a', 'coroana', 'zambet'], title: 'Ortograme: într-o, sa/s-a', desc: 'într-o / într-un, sa / s-a.', types: ['orto2a', 'orto2b'], lesson: 'orto' },
  { id: 'g2-silabe', area: '2', per: 1, npc: 'Ilinca', look: ['#f0c8a8', '#ffc93c', '#5a3b7a', 'fundita', 'fericit'], title: 'Alfabetul, sunetele, silabele', desc: 'Vocale și consoane, silabe, ce/ci/ge/gi, â și î.', types: ['vocCons', 'silabe2', 'cegi', 'aiI'] },
  { id: 'g2-lectura', area: '2', per: 1, npc: 'Bibliotecara Dora', look: ['#f3c9a0', '#7a5a3b', '#2b3a55', 'ochelari', 'zambet'], title: 'Citim și înțelegem', desc: 'Texte scurte cu întrebări, ca la fișe și la evaluare.', types: ['lectura2'] },
  { id: 'g2-propozitie', area: '2', per: 2, npc: 'Poetul Mihai', look: ['#e0b48a', '#3b7ddd', '#3b3b3b', 'palarie', 'zambet'], title: 'Propoziția', desc: 'Ordonează cuvintele ca să faci o propoziție.', types: ['ordoneaza'] },
  { id: 'g2-corp', area: '2', per: 1, npc: 'Doctorița Ana', look: ['#f3c9a0', '#ffffff', '#3b7ddd', 'nimic', 'zambet'], title: 'Corpul și sănătatea', desc: 'Organe, igienă, gripa, mâncare sănătoasă.', types: ['m2corp'] },
  { id: 'g2-adun', area: '2', per: 1, npc: 'Mihai', look: ['#c98e5f', '#e04848', '#2b2f38', 'nimic', 'cool'], title: 'Adunări cu trecere', desc: 'Adunări și scăderi până la 1000, cu trecere peste ordin.', types: ['adun1000'] },
  { id: 'g2-ascuns', area: '2', per: 2, npc: 'Bianca', look: ['#f3c9a0', '#2fae5f', '#3b3b3b', 'urechi', 'zambet'], title: 'Numărul care lipsește', desc: 'Termenul necunoscut, cu metoda balanței.', types: ['necun2b'] },
  { id: 'g2-maimult', area: '2', per: 2, npc: 'Andrei', look: ['#e0b48a', '#2fae5f', '#3b3b3b', 'nimic', 'zambet'], title: 'Probleme', desc: '„Cu atât mai mult/mai puțin” și probleme cu două operații.', types: ['maimult', 'prob2'], lesson: 'maimult' },
  { id: 'g2-inmrep', area: '2', per: 2, npc: 'Vlad', look: ['#c98e5f', '#ff7a2f', '#2b2f38', 'sapca', 'cool'], title: 'Înmulțirea ca adunare', desc: '3 + 3 + 3 = 3 × 3 și tabla lui 2, 3, 4, 5, 10.', types: ['inmRep', 'tablaUsor'] },
  { id: 'g2-punct', area: '2', per: 2, npc: 'Matei', look: ['#8a5a3b', '#f2b632', '#2b3a55', 'casca', 'surprins'], title: 'Semne de punctuație', desc: 'Punct, ?, !, virgula, două puncte, linia de dialog.', types: ['punct', 'punct2b'] },
  { id: 'g2-cuvinte', area: '2', per: 2, npc: 'Sofia', look: ['#f3c9a0', '#c77dff', '#2b3a55', 'fundita', 'zambet'], title: 'Cuvinte și litere mari', desc: 'Cuvinte cu sens asemănător sau opus, litera mare.', types: ['sinAnt2', 'majuscula'] },
  { id: 'g2-vietuitoare', area: '2', per: 2, npc: 'Pădurarul Ion', look: ['#c98e5f', '#2f7d3b', '#3b3b3b', 'palarie', 'zambet'], title: 'Viețuitoare, medii, relief', desc: 'Plante, animale, medii de viață; munți, dealuri, câmpii.', types: ['m2viata', 'm2relief'] },
  { id: 'g2-figuri', area: '2', per: 3, npc: 'Arhitectul Dan', look: ['#f0c8a8', '#7a5a3b', '#2b3a55', 'casca', 'cool'], title: 'Figuri și corpuri', desc: 'Pătrat, triunghi, cerc; cub, sferă, cilindru, con.', types: ['figuri2'] },
  { id: 'g2-tabla', area: '2', per: 2, npc: 'Ninja Radu', look: ['#c98e5f', '#1F2B3A', '#2b2f38', 'sapca', 'cool'], title: 'Tabla înmulțirii', desc: 'Toată tabla înmulțirii până la 100.', types: ['tabla'], lesson: 'tabla' },
  { id: 'g2-imp', area: '2', per: 2, npc: 'Irina', look: ['#f3c9a0', '#8a5cf6', '#2b3a55', 'fundita', 'zambet'], title: 'Împărțirea', desc: 'Împărțirea în grupe egale și cu tabla.', types: ['impRep', 'imp'] },
  { id: 'g2-fractii', area: '2', per: 3, npc: 'Bucătarul Leo', look: ['#f0c8a8', '#ffffff', '#3b3b3b', 'bucatar', 'zambet'], title: 'Jumătate și sfert', desc: 'Jumătate, sfert, dublu; pizza în bucăți egale.', types: ['jumSfert'] },
  { id: 'g2-ordine', area: '2', per: 3, npc: 'Profesorul Calcul', look: ['#e0b48a', '#3b7ddd', '#2b3a55', 'ochelari', 'zambet'], title: 'Ordinea operațiilor', desc: 'Întâi înmulțirea, apoi adunarea și scăderea.', types: ['ordine2b'] },
  { id: 'g2-orto3', area: '2', per: 3, npc: 'Scriitoarea Ioana', look: ['#f3c9a0', '#e04878', '#3b3b3b', 'ochelari', 'zambet'], title: 'Ortograme: sau/s-au, dintr-o', desc: 'sau / s-au, dintr-o / dintr-un.', types: ['orto2c'] },
  { id: 'g2-masuri', area: '2', per: 3, npc: 'Bunicul Ion', look: ['#f0c8a8', '#7a5a3b', '#3b3b3b', 'palarie', 'zambet'], title: 'Măsurători', desc: 'Metrul, litrul, kilogramul, ora, zilele, lunile, banii.', types: ['masuri2b', 'masuri'] },
  { id: 'g2-pamant', area: '2', per: 3, npc: 'Astronauta Ema', look: ['#f3c9a0', '#e9e9f0', '#3b3b3b', 'casca', 'fericit'], title: 'Planetele și Universul', desc: 'Zi și noapte, Soarele, Luna, planetele.', types: ['m2pamant'] },
  { id: 'g2-magneti', area: '2', per: 3, npc: 'Inventatorul Tibi', look: ['#c98e5f', '#FFC93C', '#2b2f38', 'ochelari', 'surprins'], title: 'Magneți și electricitate', desc: 'Polii magnetului, ce conduce curentul.', types: ['m2fizica'] },

  { id: 'g3-primul', area: '3', per: 1, npc: 'Cavalerul Paranteză', look: ['#f3c9a0', '#9aa4b2', '#4a4f5a', 'coif', 'cool'], title: 'Ce se face primul?', desc: 'Regulile ordinii operațiilor.', types: ['primul', 'ordine3', 'ordine2'], lesson: 'ordine' },
  { id: 'g3-paranteze', area: '3', per: 1, npc: 'Regina Cifrelor', look: ['#f3c9a0', '#8a5cf6', '#2b2f38', 'coroana', 'zambet'], title: 'Paranteze și calcule lungi', desc: 'Exact ca la exercițiul 1 a) din test.', types: ['ordine1', 'ordine2'], lesson: 'ordine' },
  { id: 'g3-ascuns', area: '3', per: 1, npc: 'Vrăjitorul Ix', look: ['#e0b48a', '#4b3cc4', '#2b2f38', 'vrajitor', 'cool'], title: 'Numărul ascuns', desc: 'Află necunoscuta, ca la 1 b).', types: ['necunoscut2', 'necunoscut1'], lesson: 'ascuns' },
  { id: 'g3-gandesc', area: '3', per: 1, npc: 'Detectivul Dodo', look: ['#c98e5f', '#7a5a3b', '#3b3b3b', 'palarie', 'cool'], title: 'Mă gândesc la un număr', desc: 'Mersul invers, ca la exercițiul 2.', types: ['gandesc'], lesson: 'ascuns' },
  { id: 'g3-veverite', area: '3', per: 1, npc: 'Ronțăilă', look: ['#c46a2f', '#e07a2f', '#7a3b1f', 'urechi', 'zambet'], title: 'Problema veverițelor', desc: 'Benzi colorate și sume, ca la 3 și 1 c).', types: ['veverite', 'abc'], lesson: 'veverite' },
  { id: 'g3-piata', area: '3', per: 1, npc: 'Bunica Ileana', look: ['#f0c8a8', '#d23a3a', '#3b3b3b', 'basma', 'zambet'], title: 'Piața bunicii', desc: 'Prețuri, rest și bani, ca la 4 și 5.', types: ['piata1', 'bunica', 'rest'], lesson: 'piata' },
  { id: 'g3-fractii', area: '3', per: 3, npc: 'Bucătarul Tort', look: ['#f3c9a0', '#ffffff', '#2b2f38', 'bucatar', 'zambet'], title: 'Fracții', desc: 'Jumătăți, sferturi și felii de tort.', types: ['fractii', 'fractii3'], lesson: 'fractii' },
  { id: 'g3-vorbire', area: '3', per: 1, npc: 'Bibliotecara Ema', look: ['#f3c9a0', '#2fae5f', '#2b3a55', 'ochelari', 'zambet'], title: 'Părțile de vorbire', desc: 'Substantiv, verb sau adjectiv?', types: ['partivorbire'], lesson: 'vorbire' },

  { id: 'g3-numere', area: '3', per: 1, npc: 'Contesa Miilor', look: ['#f3c9a0', '#f2b632', '#2b2f38', 'coroana', 'zambet'], title: 'Numere până la 10.000', desc: 'Mii, sute, zeci, unități, comparare, rotunjire.', types: ['numere10k', 'rotunjire', 'ordonare'], lesson: 'numere10k' },
  { id: 'g3-calcule', area: '3', per: 1, npc: 'Strajerul Coloană', look: ['#c98e5f', '#9aa4b2', '#4a4f5a', 'coif', 'zambet'], title: 'Adunări și scăderi mari', desc: 'Calcule până la 10.000, în coloană.', types: ['adun10k', 'proprietati'] },
  { id: 'g3-inmultire', area: '3', per: 2, npc: 'Fierarul Fix', look: ['#8a5a3b', '#7a5a3b', '#2b2f38', 'casca', 'cool'], title: 'Înmulțirea mare', desc: 'Număr de 2 cifre × 1 cifră, × 10, × 100.', types: ['inm', 'inm3'], lesson: 'inm' },
  { id: 'g3-rest', area: '3', per: 2, npc: 'Grădinarul Rest', look: ['#e0b48a', '#2fae5f', '#7a5a3b', 'palarie', 'zambet'], title: 'Împărțirea cu rest', desc: 'Câte încap și ce rămâne.', types: ['impRest'], lesson: 'rest' },
  { id: 'g3-figurativ', area: '3', per: 2, npc: 'Pictorița Bandă', look: ['#f3c9a0', '#ff8ac0', '#2b3a55', 'fundita', 'fericit'], title: 'Metoda figurativă', desc: 'Suma și diferența, „de atâtea ori mai mult”.', types: ['sumadif', 'sumacat', 'deOri'], lesson: 'figurativ' },
  { id: 'g3-masuri', area: '3', per: 3, npc: 'Negustorul Cântar', look: ['#c98e5f', '#e07a2f', '#3b3b3b', 'palarie', 'zambet'], title: 'Unități de măsură', desc: 'm, km, kg, l, lei, ore, secol.', types: ['masuri3', 'ceas', 'calendar'] },
  { id: 'g3-perimetru', area: '3', per: 3, npc: 'Arhitectul Latură', look: ['#f3c9a0', '#42c0d8', '#2b2f38', 'casca', 'cool'], title: 'Perimetrul', desc: 'Pătrat, dreptunghi, triunghi.', types: ['perimetru', 'figuri3', 'corpuri'], lesson: 'perimetru' },
  { id: 'g3-romane', area: '3', per: 3, npc: 'Centurionul Marcus', look: ['#e0b48a', '#d23a3a', '#7a5a3b', 'coif', 'cool'], title: 'Cifre romane', desc: 'I, V, X, L.', types: ['romane'], lesson: 'romane' },
  { id: 'g3-sinonime', area: '3', per: 1, npc: 'Poetul Rima', look: ['#f3c9a0', '#4b3cc4', '#2b2f38', 'palarie', 'fericit'], title: 'Sinonime și antonime', desc: 'Cuvinte la fel și cuvinte opuse.', types: ['sinonime', 'omonime'], lesson: 'sinonime' },
  { id: 'g3-substantiv', area: '3', per: 1, npc: 'Scribul Nume', look: ['#e0b48a', '#7a5a3b', '#2b3a55', 'ochelari', 'zambet'], title: 'Substantivul', desc: 'Felul, numărul și genul. Găsește-l în propoziție.', types: ['substantiv'], lesson: 'vorbire' },
  { id: 'g3-propozitie', area: '3', per: 1, npc: 'Crainicul Glas', look: ['#f3c9a0', '#ffb020', '#2b3a55', 'sapca', 'surprins'], title: 'Propoziția și dialogul', desc: 'Enunțiativă, interogativă, exclamativă.', types: ['propozitie'] },

  { id: 'g3-date', area: '3', per: 3, npc: 'Cercetașa Tabel', look: ['#f3c9a0', '#42c0d8', '#2b3a55', 'sapca', 'fericit'], title: 'Tabele și date', desc: 'Citești un tabel și răspunzi.', types: ['tabel'] },
  { id: 'g3-ortograme', area: '3', per: 1, npc: 'Ortografa Cratimă', look: ['#f3c9a0', '#e04848', '#2b2f38', 'ochelari', 'cool'], title: 'Toate ortogramele', desc: 'l-a/la, ne-a/nea, mi-a/mia, v-a/va, n-a/na.', types: ['orto3', 'punct3'], lesson: 'orto' },
  { id: 'g3-alfabet', area: '3', per: 1, npc: 'Bufnița Abecedar', look: ['#c98e5f', '#7a5a3b', '#3b3b3b', 'ochelari', 'surprins'], title: 'Alfabet și silabe', desc: 'Ordinea alfabetică și despărțirea în silabe.', types: ['alfabet', 'silabe3'] },
  { id: 'g3-pronume', area: '3', per: 3, npc: 'Ecoul Castelului', look: ['#e0b48a', '#9aa4b2', '#2b2f38', 'coif', 'surprins'], title: 'Pronumele personal', desc: 'Eu, tu, el, ea, noi, voi, ei, ele.', types: ['pronume'] },

  // profesorii pe materii (fiecare deschide lista lui de lecții)
  { id: 'hub-stiinte', area: '3', npc: 'Profesorul Natură', look: ['#e0b48a', '#2fae5f', '#7a5a3b', 'palarie', 'zambet'], title: 'Științe ale naturii', desc: 'Viețuitoare, Pământul, apa, corpurile, magneții.', hub: 'stiinte' },
  { id: 'hub-civica', area: '3', npc: 'Doamna Bunătate', look: ['#f3c9a0', '#ff8ac0', '#2b3a55', 'fundita', 'fericit'], title: 'Educație civică', desc: 'Ce e bine, drepturi, reguli, respect.', hub: 'civica' },
  { id: 'hub-engleza', area: '3', npc: 'Teacher Emma', look: ['#f3c9a0', '#3b7ddd', '#2b2f38', 'nimic', 'zambet'], title: 'Limba engleză', desc: 'Words, numbers, grammar.', hub: 'engleza' },
  { id: 'hub-compuneri', area: '3', npc: 'Scriitorul Pană', look: ['#c98e5f', '#7a5a3b', '#2b2f38', 'ochelari', 'zambet'], title: 'Compuneri', desc: 'Părțile compunerii, ordinea ideilor, bilet, invitație.', hub: 'compuneri' },
  // lecțiile din fiecare materie (nu stau pe hartă: le deschide profesorul)
  { id: 's3-viata', area: '3', per: 1, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Lumea vie', desc: 'Nevoi, creștere, înmulțire, reacții la mediu.', types: ['n3viata', 'sViata'] },
  { id: 's3-animale', area: '3', per: 2, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Grupe de animale', desc: 'Insecte, pești, amfibieni, reptile, păsări, mamifere.', types: ['n3animale', 'sAnimale'] },
  { id: 's3-pamant', area: '3', per: 1, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Apa și Pământul', desc: 'Surse de apă, stările apei, circuitul apei, ploaie, vânt, fulger.', types: ['n3apa', 'sPamant'] },
  { id: 's3-corpuri', area: '3', per: 3, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Corpuri și forțe', desc: 'Proprietăți, stări de agregare, metale, magneți, busola, frecare, mișcare.', types: ['n3corpuri', 'sCorpuri'] },
  { id: 's3-omul', area: '3', per: 2, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Omul sănătos', desc: 'Igienă, hrană sănătoasă, activitate și odihnă.', types: ['n3om', 'sOmul'] },
  { id: 's3-mediu', area: '3', per: 1, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Natura curată', desc: 'Resurse naturale, poluare, reciclare.', types: ['n3mediu'] },
  { id: 's3-cuvinte', area: '3', per: 1, subject: 'stiinte', hidden: true, npc: 'Profesorul Natură', look: [], title: 'Cuvinte de știință', desc: 'Termenii de la științe: ce înseamnă fiecare.', types: ['n3cuvinte'] },
  { id: 'c3-morala', area: '3', per: 1, subject: 'civica', hidden: true, npc: 'Doamna Bunătate', look: [], title: 'Ce e bine?', desc: 'Bunătate, sinceritate, curaj, modestie, respect, drepturi și îndatoriri.', types: ['civica'] },
  { id: 'e3-vocab', area: '3', per: 1, subject: 'engleza', hidden: true, npc: 'Teacher Emma', look: [], title: 'Words', desc: 'Culori, familie, animale, mâncare, școală, corp, haine, casă, zile, vreme.', types: ['enVocab'] },
  { id: 'e3-numere', area: '3', per: 2, subject: 'engleza', hidden: true, npc: 'Teacher Emma', look: [], title: 'Numbers 1–100', desc: 'Numerele în engleză.', types: ['enNumere'] },
  { id: 'e3-gram', area: '3', per: 3, subject: 'engleza', hidden: true, npc: 'Teacher Emma', look: [], title: 'Grammar', desc: 'have got / has got, am / is / are, in / on / under, can.', types: ['enGramatica'] },
  { id: 'r3-parti', area: '3', per: 1, subject: 'compuneri', hidden: true, npc: 'Scriitorul Pană', look: [], title: 'Cum arată o compunere', desc: 'Titlu, introducere, cuprins, încheiere, alineat, bilet, invitație.', types: ['compParti'] },
  { id: 'r3-ordine', area: '3', per: 2, subject: 'compuneri', hidden: true, npc: 'Scriitorul Pană', look: [], title: 'Ordinea ideilor', desc: 'Pui ideile în ordine ca să iasă povestea.', types: ['compOrdine'] },

  { id: 'atelier', area: 'T', npc: 'Antrenorul Pas-cu-Pas', look: ['#c98e5f', '#23935a', '#2b2f38', 'sapca', 'fericit'], title: 'Atelierul problemelor', desc: 'Problemele din test, învățate pas cu pas.', atelier: true },
  { id: 'test-mate', area: 'T', npc: 'Profesorul Calcul', look: ['#f0c8a8', '#2b2f38', '#2b2f38', 'coroana', 'cool'], title: 'TESTUL: matematică', desc: 'Testul tău, cu numere noi de fiecare dată. Primești notă, ca la școală!', test: true, boss: true }
];

export const missionById = (id) => MISSIONS.find((m) => m.id === id);
export const areaById = (id) => AREAS.find((a) => a.id === id);
/** Clasa unui tip de exercițiu; dacă tipul e în mai multe clase, o preferă pe cea dată. */
export const typeArea = (t, pref) => { const ms = MISSIONS.filter((m) => m.types && m.types.includes(t)); return ((pref !== undefined && ms.find((m) => m.area === String(pref))) || ms[0] || {}).area; };

export const TYPE_NAMES = {
  compara: 'Comparare și vecini', vecini: 'Numărul dinainte / de după', adun20: 'Adunări până la 20', scad20: 'Scăderi până la 20', zeci: 'Zeci și unități',
  prob1: 'Probleme cu o operație', silabe: 'Silabe', cegi: 'ce / ci / ge / gi / che / chi',
  adun1000: 'Calcule până la 1000', tabla: 'Tabla înmulțirii', imp: 'Împărțirea', maimult: '„cu … mai mult / mai puțin”', masuri: 'Măsurători',
  orto: 'Ortograme', punct: 'Semne de punctuație',
  primul: 'Ce operație e prima', ordine1: 'Paranteze (test 1 a)', ordine2: 'Înmulțiri înaintea scăderilor', ordine3: 'Capcana „+ ×”',
  necunoscut1: 'Necunoscuta în paranteze (test 1 b)', necunoscut2: 'Află numărul necunoscut', gandesc: '„Mă gândesc la un număr” (test 2)',
  veverite: 'Veverițele (test 3)', abc: 'a + b + c (test 1 c)', piata1: 'Mere și pere (test 4)', bunica: 'Bunica la piață (test 5)', rest: 'Rest de bani',
  fractii: 'Fracții', partivorbire: 'Părți de vorbire',
  numere10k: 'Numere până la 10.000', rotunjire: 'Rotunjiri', adun10k: 'Calcule până la 10.000', inm: 'Înmulțirea mare', impRest: 'Împărțirea cu rest',
  sumadif: 'Suma și diferența', sumacat: '„de atâtea ori mai mult”', masuri3: 'Unități de măsură', perimetru: 'Perimetrul', romane: 'Cifre romane',
  sinonime: 'Sinonime și antonime',
  numarare: 'Numărare', vecini31: 'Vecinii numerelor (0–31)', compara10: 'Mai mare / mai mic', adun10: 'Adunări până la 10', scad10: 'Scăderi până la 10', forme: 'Forme geometrice', sunetInitial: 'Primul sunet', rima: 'Rime',
  numere1m: 'Numere până la 1.000.000', calc1m: 'Calcule până la 1.000.000', inm2c: 'Înmulțirea cu 2 cifre', imp1c: 'Împărțirea la o cifră', fractiiIV: 'Fracții (clasa a IV-a)', masuriIV: 'Măsuri mari', corpuri: 'Corpuri geometrice', ipoteza: 'Metoda falsei ipoteze',
  verbTimp: 'Timpul verbului',
  sViata: 'Științe: lumea vie', sAnimale: 'Științe: grupe de animale', sPamant: 'Științe: Pământul și apa', sCorpuri: 'Științe: corpuri și forțe', sOmul: 'Științe: omul sănătos', n3viata: 'Științe: lumea vie', n3animale: 'Științe: grupe de animale', n3om: 'Științe: omul sănătos', n3apa: 'Științe: apa și Pământul', n3mediu: 'Științe: natura curată', n3corpuri: 'Științe: corpuri și forțe', n3cuvinte: 'Științe: cuvinte de știință', rec100: 'Recapitulare 0–100', lectura2: 'Citim și înțelegem textul', ordoneaza: 'Ordinea cuvintelor în propoziție', sirNumere: 'Șiruri de numere', celMaiMare: 'Cel mai mare / mic număr', descompune: 'Descompunerea numerelor', compSume: 'Compararea a două calcule', proba: 'Proba adunării și scăderii', orto2a: 'Ortograme: într-o/într-un', orto2b: 'Ortograme: sa/s-a', orto2c: 'Ortograme: sau/s-au, dintr-o', aiI: 'Scrierea cu â și î', m2relief: 'Formele de relief', adun100f: 'Calcule până la 100 fără trecere', adun100t: 'Calcule până la 100 cu trecere', numere1000: 'Numerele până la 1000', rotunjire2: 'Rotunjirea la zeci și sute', adun1000f: 'Adunări până la 1000 fără trecere', orto2: 'Ortograme în propoziții', vocCons: 'Vocale și consoane', silabe2: 'Despărțirea în silabe', m2corp: 'Corpul și sănătatea', necun2b: 'Numărul care lipsește', prob2: 'Probleme cu două operații', inmRep: 'Înmulțirea ca adunare repetată', tablaUsor: 'Tabla lui 2, 3, 4, 5, 10', punct2b: 'Virgula, două puncte, linia de dialog', sinAnt2: 'Cuvinte cu sens asemănător/opus', majuscula: 'Litera mare', m2viata: 'Viețuitoare și medii de viață', figuri2: 'Figuri și corpuri', impRep: 'Împărțirea în grupe egale', jumSfert: 'Jumătate, sfert, dublu', ordine2b: 'Ordinea operațiilor (clasa a II-a)', masuri2b: 'Măsurători (clasa a II-a)', m2pamant: 'Pământul și planetele', m2fizica: 'Magneți și electricitate', civica: 'Civică: ce e bine', enVocab: 'Engleză: cuvinte', enNumere: 'Engleză: numere', enGramatica: 'Engleză: gramatică', compParti: 'Compunere: structura', compOrdine: 'Compunere: ordinea ideilor',
  ordonare: 'Ordonare, par / impar', proprietati: 'Proprietățile adunării și înmulțirii', inm3: 'Înmulțirea cu numere de 3 cifre', deOri: '„de … ori mai mult / mai puțin”', fractii3: 'Fracții: citire și comparare',
  figuri3: 'Figuri geometrice', ceas: 'Ceasul', calendar: 'Calendarul', tabel: 'Tabele și date', alfabet: 'Ordinea alfabetică', orto3: 'Ortograme (toate)', punct3: 'Virgula și două puncte', silabe3: 'Silabe (cuvinte lungi)', pronume: 'Pronumele personal', numeral: 'Numeralul', acordAdj: 'Acordul adjectivului', omonime: 'Omonime', textTip: 'Tipuri de text', substantiv: 'Substantivul', propozitie: 'Propoziția și dialogul'
};

export const SUBJECT_NAMES = { stiinte: 'Științe ale naturii', civica: 'Educație civică', engleza: 'Limba engleză', compuneri: 'Compuneri' };
export const ROMANA = new Set(['lectura2', 'ordoneaza', 'orto2a', 'orto2b', 'orto2c', 'aiI', 'orto2', 'vocCons', 'silabe2', 'punct2b', 'sinAnt2', 'majuscula', 'compParti', 'compOrdine', 'alfabet', 'orto3', 'punct3', 'silabe3', 'silabe', 'cegi', 'orto', 'punct', 'partivorbire', 'sinonime', 'substantiv', 'propozitie', 'sunetInitial', 'rima', 'verbTimp', 'pronume', 'numeral', 'acordAdj', 'omonime', 'textTip']);
/** Tipurile de exerciții pentru o clasă și o materie: 'mate', 'romana', 'mix' sau 'test'. */
export function typesFor(grade, subject = 'mix') {
  if (subject === 'test') return TEST_ITEMS.map((i) => i.type);
  const ms = MISSIONS.filter((m) => m.area === String(grade) && m.types);
  const all = [...new Set(ms.flatMap((m) => m.types))];
  if (SUBJECT_NAMES[subject]) return [...new Set(ms.filter((m) => m.subject === subject).flatMap((m) => m.types))];
  const core = [...new Set(ms.filter((m) => !m.subject).flatMap((m) => m.types))];
  if (subject === 'mate') return core.filter((t) => !ROMANA.has(t));
  if (subject === 'romana') return all.filter((t) => ROMANA.has(t));
  return all;
}
