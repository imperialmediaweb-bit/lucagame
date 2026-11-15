// Clasa a III-a: ordinea operațiilor, paranteze, numărul necunoscut, mersul invers, probleme (veverițe, piață), fracții, părți de vorbire.
// Tipurile din testul lui Luca sunt făcute după testul primit.
import { rnd, pick, shuffle, cap, opts, textOpts, why } from './util.js';

export const G3 = {
  ordine1() { // (a+b) × (c − d : e) − f
    const a=rnd(1,6),b=rnd(1,6),e=rnd(2,9),q=rnd(2,6),d=e*q,c=rnd(q+1,q+10),s1=a+b,s2=c-q,p=s1*s2,f=rnd(1,Math.min(20,p-1)),r=p-f;
    return {text:'Calculează:',expr:`(${a} + ${b}) × (${c} − ${d} : ${e}) − ${f} =`,ans:r,opts:opts(r,[p,r+e,Math.abs(r-q),r+10]),why:why(r,[p,`Te-ai oprit la ${p}: ai uitat scăderea de la final (− ${f}).`],[r+10,'Ai greșit cu 10 la scăderea de la final: fă-o unul sub altul.']),
      steps:[`Întâi parantezele. Prima: ${a} + ${b} = ${s1}`,`În a doua, împărțirea vine înaintea scăderii: ${d} : ${e} = ${q}, apoi ${c} − ${q} = ${s2}`,`Înmulțirea: ${s1} × ${s2} = ${p}`,`La final scăderea: ${p} − ${f} = ${r}`]};
  },
  ordine2() { // a×b − c×d + e
    let a,b,c,d; do{a=rnd(3,9);b=rnd(3,9);c=rnd(2,9);d=rnd(2,6);}while(a*b<=c*d);
    const e=rnd(2,20),r=a*b-c*d+e,naiv=(a*b-c)*d+e;
    return {text:'Calculează:',expr:`${a} × ${b} − ${c} × ${d} + ${e} =`,ans:r,opts:opts(r,[naiv,a*b-c*d-e,r+d]),why:why(r,[naiv,`Ai scăzut ${c} înainte să faci înmulțirea ${c} × ${d}. Înmulțirile se fac PRIMELE, apoi adunarea și scăderea.`],[a*b-c*d-e,`La final trebuia să ADUNI ${e} (semnul din fața lui e +), nu să scazi.`]),
      steps:['Înmulțirile se fac înaintea adunării și scăderii.',`${a} × ${b} = ${a*b}`,`${c} × ${d} = ${c*d}`,`Acum de la stânga la dreapta: ${a*b} − ${c*d} = ${a*b-c*d}, apoi ${a*b-c*d} + ${e} = ${r}`]};
  },
  ordine3() { // a + b × c sau a − b : c
    if(Math.random()<.5){const a=rnd(5,40),b=rnd(2,9),c=rnd(2,9),r=a+b*c;
      return {text:'Calculează:',expr:`${a} + ${b} × ${c} =`,ans:r,opts:opts(r,[(a+b)*c,r+1,a*b+c]),why:why(r,[(a+b)*c,`Ai adunat întâi ${a} + ${b}. Dar înmulțirea se face prima: ${b} × ${c}, apoi aduni ${a}.`],[a*b+c,`Ai înmulțit ${a} × ${b}, dar semnul × leagă doar ${b} și ${c}.`]),
        steps:['Capcană: înmulțirea se face prima, chiar dacă e la sfârșit!',`${b} × ${c} = ${b*c}`,`${a} + ${b*c} = ${r}`]};}
    const c=rnd(2,9),q=rnd(2,9),b=c*q,a=rnd(q+5,q+60),r=a-q;
    return {text:'Calculează:',expr:`${a} − ${b} : ${c} =`,ans:r,opts:opts(r,[Number.isInteger((a-b)/c)&&a>b?(a-b)/c:r+c,r-1,r+q]),why:why(r,[(a-b)/c,`Ai scăzut întâi ${a} − ${b}. Dar împărțirea se face prima: ${b} : ${c} = ${q}.`],[r+q,`Ai ADUNAT câtul ${q}; trebuia scăzut: ${a} − ${q}.`]),
      steps:['Împărțirea se face înaintea scăderii.',`${b} : ${c} = ${q}`,`${a} − ${q} = ${r}`]};
  },
  necunoscut1() { // [a × (b×b − c×c) − x] : k = r
    let a,b,c,M,k,r,x; do{b=rnd(4,7);c=rnd(2,b-1);a=rnd(2,6);M=a*(b*b-c*c);k=pick([2,5,10]);}while(Math.floor(M/k)<3);
    r=rnd(1,Math.floor(M/k)-1);x=M-r*k;
    return {text:'Află valoarea lui a din egalitatea:',expr:`[${a} × (${b} × ${b} − ${c} × ${c}) − a] : ${k} = ${r}`,ans:x,opts:opts(x,[M-r,r*k,x+k]),why:why(x,[M-r,`Ai scăzut direct ${r}. Dar paranteza mare, împărțită la ${k}, dă ${r}, deci ea e ${r} × ${k} = ${r*k}. Abia apoi afli a = ${M} − ${r*k}.`],[r*k,`Ai aflat doar paranteza mare (${r*k}). Mai e un pas: a = ${M} − ${r*k}.`]),
      steps:[`Ce e în paranteza mare, împărțit la ${k}, dă ${r}. Deci paranteza mare = ${r} × ${k} = ${r*k}`,`Calculăm ce știm: ${b} × ${b} − ${c} × ${c} = ${b*b} − ${c*c} = ${b*b-c*c}`,`${a} × ${b*b-c*c} = ${M}`,`${M} − a = ${r*k}, deci a = ${M} − ${r*k} = ${x}`,`Verificare: (${M} − ${x}) : ${k} = ${r} ✔`]};
  },
  necunoscut2() {
    const t=rnd(0,3);
    if(t===0){const x=rnd(10,90),p=rnd(5,60),q=x+p;return {text:'Află numărul necunoscut:',expr:`a + ${p} = ${q}`,ans:x,opts:opts(x,[q+p,x+1,x-10]),why:why(x,[q+p,'Ai adunat. Termenul necunoscut se află prin SCĂDERE: suma − termenul cunoscut.']),steps:['Termenul necunoscut = suma − termenul cunoscut',`a = ${q} − ${p} = ${x}`]};}
    if(t===1){const x=rnd(30,99),p=rnd(5,29),q=x-p;return {text:'Află numărul necunoscut:',expr:`a − ${p} = ${q}`,ans:x,opts:opts(x,[q-p>=0?q-p:x+2,x+10,x-1]),why:why(x,[q-p,'Ai scăzut. Descăzutul se află prin ADUNARE: diferența + scăzătorul.']),steps:['Descăzutul = diferența + scăzătorul',`a = ${q} + ${p} = ${x}`]};}
    if(t===2){const x=rnd(2,10),p=rnd(2,9),q=x*p;return {text:'Află numărul necunoscut:',expr:`a × ${p} = ${q}`,ans:x,opts:opts(x,[q-p,q+p,x+1]),why:why(x,[q-p,'Ai scăzut. Factorul necunoscut se află prin ÎMPĂRȚIRE: produsul : factorul cunoscut.'],[q+p,'Ai adunat. Factorul necunoscut se află prin ÎMPĂRȚIRE: produsul : factorul cunoscut.']),steps:['Factorul necunoscut = produsul : factorul cunoscut',`a = ${q} : ${p} = ${x}`]};}
    const p=rnd(2,9),q=rnd(2,10),x=p*q;return {text:'Află numărul necunoscut:',expr:`a : ${p} = ${q}`,ans:x,opts:opts(x,[q+p,q-p>0?q-p:x+p,x+1]),why:why(x,[q+p,'Ai adunat. Deîmpărțitul se află prin ÎNMULȚIRE: câtul × împărțitorul.'],[q-p,'Ai scăzut. Deîmpărțitul se află prin ÎNMULȚIRE: câtul × împărțitorul.']),steps:['Deîmpărțitul = câtul × împărțitorul',`a = ${q} × ${p} = ${x}`]};
  },
  gandesc() { // mersul invers
    const T=[{v:8,t:'cel mai mare număr par de o cifră'},{v:9,t:'cel mai mare număr de o cifră'},{v:10,t:'cel mai mic număr de două cifre'},{v:5,t:'jumătate din 10'}];
    let n,m,d,s,v,tt,r; do{n=rnd(2,12);m=rnd(2,9);d=rnd(2,6);s=(n*m)%d+d*rnd(1,3);v=(n*m-s)/d;tt=pick(T);r=v-tt.v;}while(n*m-s<=0||r<1||!Number.isInteger(v));
    return {text:`Mă gândesc la un număr. Îl măresc de ${m} ori, noul rezultat îl micșorez cu ${s}, apoi împart ce am obținut la ${d}. Din noul rezultat scad ${tt.t} și obțin ${r}.\nLa ce număr m-am gândit?`,ans:n,
      opts:opts(n,[(r+tt.v)*d,n+1,Math.floor(((r+tt.v)*d)/m),n+2]),why:why(n,[(r+tt.v)*d,`Te-ai oprit la jumătatea drumului invers. Mai ai de făcut: + ${s} (opusul lui „micșorez cu ${s}”) și : ${m} (opusul lui „măresc de ${m} ori”).`],[Math.floor(((r+tt.v)*d)/m),`Ai sărit un pas: înainte să împarți la ${m}, trebuia să aduni înapoi ${s}.`],[n+1,'Verifică pe drumul invers fiecare calcul: ești foarte aproape.'],[n+2,'Verifică pe drumul invers fiecare calcul: ești aproape.']),
      steps:[`${cap(tt.t)} este ${tt.v}.`,'Mergem invers, de la sfârșit, cu operația opusă:',`Înainte să scad ${tt.v} aveam: ${r} + ${tt.v} = ${v}`,`Înainte să împart la ${d}: ${v} × ${d} = ${v*d}`,`Înainte să micșorez cu ${s}: ${v*d} + ${s} = ${n*m}`,`Înainte să măresc de ${m} ori: ${n*m} : ${m} = ${n}`]};
  },
  veverite() {
    const x=rnd(100,300),y=rnd(100,300),z=rnd(100,300),T=x+y+z,P=x+y,Q=y+z,w=rnd(0,2),nume=['prima','a doua','a treia'],ans=[x,y,z][w];
    return {text:`Trei veverițe mănâncă ${T} de alune. Primele două mănâncă ${P} de alune, iar ultimele două ${Q}.\nCâte alune mănâncă ${nume[w]} veveriță?`,ans,
      opts:opts(ans,[x,y,z,P-Q>0?P-Q:Q-P].filter(v=>v!==ans)),why:why(ans,[x,'Acestea sunt alunele PRIMEI veverițe. Citește încă o dată ce veveriță se cere.'],[y,'Acestea sunt alunele celei de-a DOUA veverițe. Citește încă o dată ce veveriță se cere.'],[z,'Acestea sunt alunele celei de-a TREIA veverițe. Citește încă o dată ce veveriță se cere.'],[Math.abs(P-Q),'Ai făcut diferența dintre cele două sume, dar asta nu e alunele unei veverițe. Pornește de la TOATE alunele.']),
      steps:[`A treia = toate − primele două = ${T} − ${P} = ${z}`,`Prima = toate − ultimele două = ${T} − ${Q} = ${x}`,`A doua = ${P} − ${x} = ${y}`,`Verificare: ${x} + ${y} + ${z} = ${T} ✔`]};
  },
  abc() {
    const a=rnd(2,9),bc=rnd(6,20);
    if(Math.random()<.4){const r=a+bc;return {text:`Dacă a = ${a} și b + c = ${bc}, calculează:`,expr:'a + b + c =',ans:r,opts:opts(r,[a*bc,bc,r+a]),why:why(r,[a*bc,'Ai înmulțit. Trebuia ADUNAT: a + (b + c).'],[bc,`Ai uitat să-l aduni pe a (${a}).`],[r+a,`L-ai adunat pe a de două ori.`]),steps:['Nu știm b și c separat, dar știm suma lor.',`a + b + c = a + (b + c) = ${a} + ${bc} = ${r}`]};}
    const k=rnd(2,6),m=rnd(2,5),r=k*a+m*bc;
    return {text:`Dacă a = ${a} și b + c = ${bc}, calculează:`,expr:`${k} × a + ${m} × b + ${m} × c =`,ans:r,opts:opts(r,[k*a+bc,k*a+m*bc+m,(k+m)*a+bc,a+m*bc]),why:why(r,[k*a+bc,`Ai uitat să înmulțești (b + c) cu ${m}: ${m} × b + ${m} × c = ${m} × (b + c).`],[k*a+m*bc+m,`Ai adăugat un ${m} în plus. ${m} × b + ${m} × c = ${m} × ${bc}, atât.`],[(k+m)*a+bc,`Ai înmulțit pe a și cu ${m}. Doar b și c se înmulțesc cu ${m}.`],[a+m*bc,`Ai uitat să-l înmulțești pe a cu ${k}.`]),
      steps:[`${m} × b + ${m} × c = ${m} × (b + c)`,`${m} × ${bc} = ${m*bc}`,`${k} × a = ${k} × ${a} = ${k*a}`,`${k*a} + ${m*bc} = ${r}`]};
  },
  piata1() {
    const A=rnd(2,6),p=rnd(2,6),B=rnd(2,5),q=rnd(2,9),T=A*p+B*q;
    return {text:`${A} kilograme de mere și ${B} kilograme de pere costă ${T} de lei. Cât costă un kilogram de pere, știind că un kilogram de mere costă ${p} lei?`,ans:q,
      opts:opts(q,[T-A*p,Math.floor(T/B),q+1,p]),why:why(q,[T-A*p,`Ai aflat cât costă TOATE perele (${T-A*p} lei). Mai împarți la ${B} kilograme ca să afli un kilogram.`],[Math.floor(T/B),`Ai împărțit tot prețul la ${B}, dar în el sunt și merele. Scoate întâi banii pe mere: ${A} × ${p}.`],[p,'Acesta e prețul unui kilogram de MERE. Se cere la pere.']),
      steps:[`Merele costă: ${A} × ${p} = ${A*p} lei`,`Perele costă: ${T} − ${A*p} = ${B*q} lei`,`Un kilogram de pere: ${B*q} : ${B} = ${q} lei`]};
  },
  bunica() {
    const fr=pick(['caise','cireșe','roșii','mere']),A=rnd(2,5),p=rnd(3,9),B=rnd(2,5),q=rnd(2,6),N=rnd(2,4),r=pick([5,10,15,20]),S0=A*p+B*q+N*r;
    return {text:`Bunica a plecat la piață. Cumpără ${A} kilograme de ${fr} a câte ${p} lei kilogramul și ${B} pâini a câte ${q} lei. Restul îl împarte în mod egal la cei ${N} nepoți.\nCe sumă avea bunica la început, știind că fiecare nepot a primit ${r} lei?`,ans:S0,
      opts:opts(S0,[A*p+B*q,A*p+B*q+r,S0-N*r+r*(N+1),S0+10]),why:why(S0,[A*p+B*q,`Ai uitat banii dați nepoților: ${N} × ${r} = ${N*r} lei.`],[A*p+B*q+r,`Ai pus banii unui singur nepot. Sunt ${N} nepoți: ${N} × ${r}.`],[S0-N*r+r*(N+1),`Ai numărat un nepot în plus: sunt ${N}, nu ${N+1}.`],[S0+10,'Ai greșit cu 10 la adunarea de la final: fă-o unul sub altul.']),
      steps:[`${cap(fr)}: ${A} × ${p} = ${A*p} lei`,`Pâinile: ${B} × ${q} = ${B*q} lei`,`Nepoții: ${N} × ${r} = ${N*r} lei`,`La început: ${A*p} + ${B*q} + ${N*r} = ${S0} lei`]};
  },
  rest() {
    const A=rnd(2,6),p=rnd(3,9),R=rnd(1,30),S0=A*p+R;
    return {text:`Ai ${S0} de lei. Cumperi ${A} caiete a câte ${p} lei. Câți lei îți rămân?`,ans:R,opts:opts(R,[S0-p,S0-A-p,A*p,R+p]),
      steps:[`Caietele costă: ${A} × ${p} = ${A*p} lei`,`Rămân: ${S0} − ${A*p} = ${R} lei`]};
  },
  primul() { // apasă operația care se face prima
    const a=rnd(2,20),b=rnd(2,9),c=rnd(2,9),d=rnd(2,9);
    const T=[
      [[a,'+',b,'×',c],3,'Înmulțirea se face înaintea adunării.'],
      [[a,'−',b,':',c],3,'Împărțirea se face înaintea scăderii.'],
      [['(',a,'+',b,')','×',c],2,'Parantezele sunt cutii: le deschizi primele.'],
      [[a,'×','(',b,'−',c,':',d,')'],6,'Întâi paranteza, iar în ea împărțirea vine înaintea scăderii.'],
      [[a,'+',b,'−',c],1,'Adunarea și scăderea sunt la fel de tari: mergi de la stânga la dreapta.'],
      [[a,':',b,'×',c],1,'Împărțirea și înmulțirea sunt la fel de tari: de la stânga la dreapta.'],
      [['(',a,'−',b,')',':',c,'+',d],2,'Întâi ce e în paranteză.'],
      [[a,'+',b,'×',c,'−',d],3,'× e operație tare: se face înaintea lui + și −.'],
      [['[',a,'×','(',b,'+',c,')','−',d,']',':',2],5,'Întâi paranteza rotundă, apoi cea pătrată.']
    ];
    const [toks,idx,why]=pick(T);
    return {kind:'tap',text:'Apasă operația care se face PRIMA:',toks,ans:idx,steps:[why],hints:['Caută întâi parantezele. Apoi × și :. Abia apoi + și −.']};
  },
  fractii() {
    const t = rnd(0, 2);
    if (t === 0) { const d = pick([3, 5, 6, 7, 8, 9, 10]), q = rnd(3, 12), n = d * q, nm = { 3: 'o treime', 5: 'o cincime', 6: 'o șesime', 7: 'o șeptime', 8: 'o optime', 9: 'o noime', 10: 'o zecime' }[d];
      return { text: `Cât este ${nm} (1/${d}) din ${n}?`, ans: q, opts: opts(q, [n - d, q * 2, n / (d === 10 ? 5 : 2) | 0]), steps: [`1/${d} = împarți întregul în ${d} părți egale și iei una.`, `${n} : ${d} = ${q}`] }; }
    if (t === 1) { const q = rnd(6, 25), n = 4 * q; return { text: `Cât este un sfert din ${n}?`, ans: q, opts: opts(q, [n / 2, q * 2, q + 4]), steps: ['Un sfert = împarți la 4 (4 părți egale, iei una).', `${n} : 4 = ${q}`] }; }
    const d = pick([2, 3, 4, 5, 8, 10]), k = rnd(1, d - 1);
    return { text: `Un tort e tăiat în ${d} felii egale. Mănânci ${k}. Ce fracție ai mâncat?`, ans: `${k}/${d}`, opts: textOpts(`${k}/${d}`, [`${d}/${k}`, `${k}/${d + 1}`, `1/${k + 1}`]),
      steps: ['Jos (numitorul) scrii în câte părți e împărțit întregul.', 'Sus (numărătorul) scrii câte părți ai luat.', `Deci ${k}/${d}`] };
  },
  partivorbire() {
    const L = [['câinele', 'substantiv'], ['aleargă', 'verb'], ['frumos', 'adjectiv'], ['școala', 'substantiv'], ['citește', 'verb'], ['roșu', 'adjectiv'],
      ['munte', 'substantiv'], ['cântă', 'verb'], ['mic', 'adjectiv'], ['Luca', 'substantiv'], ['scrie', 'verb'], ['harnic', 'adjectiv'], ['zboară', 'verb'], ['înalt', 'adjectiv']];
    const [w, a] = pick(L);
    const why = { substantiv: 'Substantivul denumește o ființă, un lucru sau un loc (cine? ce?).', verb: 'Verbul arată ce face cineva (ce face?).', adjectiv: 'Adjectivul arată cum este ceva (cum este?).' };
    return { text: 'Ce parte de vorbire este cuvântul?', expr: w, ans: a, opts: ['substantiv', 'verb', 'adjectiv'], steps: [why[a]],
      hints: ['Întreabă: e cineva/ceva? face ceva? cum este?'] };
  }
};

/** Testul primit: aceleași tipuri, în aceeași ordine, cu punctajul de pe foaie (1p oficiu). */
export const TEST_ITEMS = [
  { type: 'ordine1', label: '1 a)', pts: 0.5 },
  { type: 'necunoscut1', label: '1 b)', pts: 0.5 },
  { type: 'abc', label: '1 c)', pts: 1 },
  { type: 'gandesc', label: '2.', pts: 2 },
  { type: 'veverite', label: '3.', pts: 1.5 },
  { type: 'piata1', label: '4.', pts: 2 },
  { type: 'bunica', label: '5.', pts: 1.5 }
];
