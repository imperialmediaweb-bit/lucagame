// Lecții fulger: principiul arătat pas cu pas, cu exemple din temele și testul lui Luca.
export const L = (lines, delay = 0.9) => '<div class="stack">' + lines.map((l, i) => `<div class="ln${l.res ? ' res' : ''}" style="animation-delay:${i * delay}s">${l.t || l}</div>`).join('') + '</div>';
export const LESSONS = {
  ordine:[
    {h:'Regula 1: parantezele sunt cutii',p:'Ce e în paranteză se face primul. Deschizi cutia, afli ce e în ea, apoi mergi mai departe.',x:L(['(1 + 3) × 5','<mark>(1 + 3)</mark> × 5','<mark>4</mark> × 5',{t:'= 20',res:1}])},
    {h:'Regula 2: × și : sunt operațiile tari',p:'Înmulțirea și împărțirea se fac înaintea adunării și scăderii, chiar dacă sunt la sfârșit.',x:L(['14 − 32 : 8','14 − <mark>32 : 8</mark>','14 − <mark>4</mark>',{t:'= 10',res:1}])},
    {h:'Regula 3: același fel, de la stânga la dreapta',p:'Când ai doar + și −, sau doar × și :, mergi ca la citit.',x:L(['20 − 5 + 3','<mark>20 − 5</mark> + 3','<mark>15</mark> + 3',{t:'= 18',res:1}])},
    {h:'Toate odată: exercițiul din test',p:'Rotunde ( ) înainte de pătrate [ ]. În fiecare cutie: întâi × și :, apoi + și −.',x:L(['(1 + 3) × (14 − 32 : 8) − 8','<mark>4</mark> × (14 − <mark>4</mark>) − 8','4 × <mark>10</mark> − 8','<mark>40</mark> − 8',{t:'= 32',res:1}],1.1)}
  ],
  ascuns:[
    {h:'Fiecare operație are o pereche',p:'Ce face una, desface cealaltă. Ăsta e tot secretul.',x:L(['+ se desface cu −','− se desface cu +','× se desface cu :',': se desface cu ×'],.6)},
    {h:'Mersul invers: te întorci pe pod',p:'La „Mă gândesc la un număr” pornești de la FINAL și faci operațiile pe dos, de la coadă la cap.',
      x:'<div class="chain"><b>?</b><i>× 8 →</i><b>72</b><i>− 12 →</i><b>60</b><i>: 6 →</i><b>10</b><i>− 8 →</i><b>2</b></div>'+L([{t:'Înapoi: 2 + 8 = 10',res:0},'10 × 6 = 60','60 + 12 = 72',{t:'72 : 8 = 9. Numărul era 9!',res:1}],1)},
    {h:'Necunoscuta ascunsă',p:'Acoperă cu degetul tot ce e în paranteza mare. Întreabă-te: ce număr împărțit la 10 dă 4?',
      x:L(['[ 5 × (5×5 − 4×4) − a ] : 10 = 4','[ <mark>?</mark> ] : 10 = 4  →  ? = 4 × 10 = <mark>40</mark>','5 × 9 − a = 40  →  45 − a = 40',{t:'a = 45 − 40 = 5',res:1}],1.1)}
  ],
  veverite:[
    {h:'Desenează benzi!',p:'Fiecare veveriță e o bandă. Benzile îți arată ce se suprapune.',
      x:'<div class="bars"><div class="b"><span style="flex:125;background:#e07a2f">V1</span><span style="flex:273;background:#2f9e5b">V2</span><span style="flex:215;background:#3b7ddd">V3</span></div><div class="b" style="animation-delay:.8s"><span style="flex:398;background:#8a5cf6">primele două = 398</span><span style="flex:215;background:#d9d2c3"></span></div><div class="b" style="animation-delay:1.6s"><span style="flex:125;background:#d9d2c3"></span><span style="flex:488;background:#e0b020">ultimele două = 488</span></div></div>'},
    {h:'Toate minus o pereche = cea rămasă',p:'Dacă din toate scot primele două, rămâne a treia.',x:L(['A treia: 613 − 398 = 215','Prima: 613 − 488 = 125','A doua: 398 − 125 = 273',{t:'Verificare: 125 + 273 + 215 = 613 ✔',res:1}],1)},
    {h:'b + c la grămadă',p:'Nu știi b și c separat? Nu-ți trebuie! Folosește-le împreună.',x:L(['a = 5, b + c = 12','a + b + c = 5 + <mark>12</mark> = 17','2 × b + 2 × c = 2 × (b + c) = 2 × 12 = 24',{t:'5 × a + 2 × b + 2 × c = 25 + 24 = 49',res:1}],1)}
  ],
  piata:[
    {h:'Cantitate × preț = cât costă',p:'4 kilograme a câte 3 lei înseamnă de 4 ori câte 3 lei.',x:L(['4 kg mere × 3 lei = <mark>12 lei</mark>'])},
    {h:'Din total scazi ce știi',p:'Rămâne exact ce cauți. Apoi împarți la câte bucăți sunt.',x:L(['Total: 36 lei','Merele: 4 × 3 = 12 lei','Perele: 36 − 12 = 24 lei',{t:'1 kg pere: 24 : 3 = 8 lei',res:1}],1)},
    {h:'Bunica: adună tot ce a dat',p:'Banii de la început = tot ce a cheltuit + tot ce a dăruit.',x:L(['Caise: 3 × 6 = 18 lei','Pâini: 4 × 5 = 20 lei','Nepoți: 3 × 10 = 30 lei',{t:'La început: 18 + 20 + 30 = 68 lei',res:1}],1)}
  ],
  orto:[
    {h:'Trucul cu „se”',p:'Dacă poți spune „se”, scrii cu cratimă.',x:L(['Mama <mark>s-a</mark> dus → mama <mark>se</mark> duce ✔','Copiii <mark>s-au</mark> jucat → copiii <mark>se</mark> joacă ✔'])},
    {h:'„sau” = „ori”',p:'Dacă poți pune „ori”, e „sau”, fără cratimă.',x:L(['Mere <mark>sau</mark> pere? → mere <mark>ori</mark> pere ✔'])},
    {h:'„sa” = a lui / a ei',p:'Cartea sa = cartea lui. Nu e o acțiune.',x:L(['Și-a luat cartea <mark>sa</mark> → cartea <mark>lui</mark> ✔'])},
    {h:'„i-a” sau „ia”?',p:'„i-a dat” = lui i-a dat. „Ia!” vine de la „a lua”.',x:L(['Tata <mark>i-a</mark> dat un măr → lui i-a dat','<mark>Ia</mark> cartea! → a lua'])}
  ]
  ,
  adun20: [
    { h: 'Trucul „până la 10”', p: 'Când treci de 10, completează întâi până la 10, apoi adaugă ce a rămas.', x: L(['8 + 5', '8 + <mark>2</mark> = 10', 'Din 5 am folosit 2, mai rămân <mark>3</mark>', { t: '10 + 3 = 13', res: 1 }]) },
    { h: 'Ordinea nu contează', p: 'La adunare poți schimba locul numerelor. Pornește mereu de la cel mai mare.', x: L(['2 + 9 = 9 + 2', 'Pornesc de la 9: 10, 11', { t: '= 11', res: 1 }]) }
  ],
  zeci: [
    { h: 'Zecile sunt pachete de 10', p: 'Un număr de două cifre = câteva pachete de 10 și câteva bucăți singure.', x: L(['47 = <mark>4</mark> zeci și <mark>7</mark> unități', '4 pachete de 10 = 40', { t: '40 + 7 = 47', res: 1 }]) }
  ],
  cegi: [
    { h: 'Moale sau tare?', p: 'ce, ci, ge, gi sună moale. Ca să sune tare, pui un h: che, chi, ghe, ghi.', x: L(['<mark>ce</mark>as, <mark>ci</mark>reașă, <mark>ge</mark>antă, <mark>gi</mark>rafă', '<mark>che</mark>ie, <mark>chi</mark>brit, <mark>ghe</mark>te, un<mark>ghi</mark>e', { t: 'h-ul face sunetul tare!', res: 1 }], 1) }
  ],
  tabla: [
    { h: 'Înmulțirea = adunare repetată', p: '4 × 3 înseamnă 3 grupe a câte 4.', x: L(['4 × 3', '4 + 4 + 4', { t: '= 12', res: 1 }]) },
    { h: 'Trucuri de ninja', p: 'Ordinea nu contează: 3 × 8 = 8 × 3. Cu 10 adaugi un 0. Cu 5 e jumătate din cu 10.', x: L(['7 × 10 = 70', '7 × 5 = jumătate din 70 = <mark>35</mark>', { t: '9 × 6 = 6 × 9 = 54', res: 1 }], 1) }
  ],
  maimult: [
    { h: 'Ascultă cuvintele-cheie', p: '„cu … mai mult” → aduni. „cu … mai puțin” → scazi. „de … ori mai mult” → înmulțești.', x: L(['Ana are 20. Ion are <mark>cu 5 mai mult</mark>.', '20 + 5 = 25', 'Ion are <mark>cu 5 mai puțin</mark>: 20 − 5 = 15', { t: 'De 2 ori mai mult: 20 × 2 = 40', res: 1 }], 1) }
  ],
  fractii: [
    { h: 'Felii de tort', p: 'Numitorul (jos) spune în câte felii egale tai tortul. Numărătorul (sus) spune câte iei.', x: L(['Tort tăiat în 4 felii, iei 1 → <mark>1/4</mark> (un sfert)', 'Tort tăiat în 2, iei 1 → <mark>1/2</mark> (o jumătate)', { t: 'Jumătate din 20 = 20 : 2 = 10', res: 1 }], 1) }
  ],
  vorbire: [
    { h: 'Trei întrebări magice', p: 'Cine? Ce? → substantiv. Ce face? → verb. Cum este? → adjectiv.', x: L(['<mark>Câinele</mark> → cine? → substantiv', '<mark>aleargă</mark> → ce face? → verb', { t: '<mark>repede, frumos</mark> → cum este? → adjectiv', res: 1 }], 1) }
  ]
,
  numere10k: [
    { h: 'Casa cifrelor', p: 'Fiecare cifră stă în camera ei: mii, sute, zeci, unități. Locul ei îi dă valoarea.', x: L(['3.452', '<mark>3</mark> mii = 3.000', '<mark>4</mark> sute = 400, <mark>5</mark> zeci = 50, <mark>2</mark> unități', { t: '3.000 + 400 + 50 + 2 = 3.452', res: 1 }], 0.9) },
    { h: 'Rotunjirea', p: 'Te uiți la cifra din dreapta locului la care rotunjești. 5 sau mai mare → urci. Mai mică → cobori.', x: L(['347 la zeci: cifra unităților e <mark>7</mark> → urc', { t: '347 ≈ 350', res: 1 }, '347 la sute: cifra zecilor e <mark>4</mark> → cobor', { t: '347 ≈ 300', res: 1 }], 0.9) }
  ],
  inm: [
    { h: 'Desface și înmulțește', p: 'Un număr mare îl desfaci în zeci și unități, înmulțești fiecare bucată, apoi aduni.', x: L(['23 × 4', '23 = <mark>20</mark> + <mark>3</mark>', '20 × 4 = 80 și 3 × 4 = 12', { t: '80 + 12 = 92', res: 1 }]) },
    { h: 'Cu 10 și cu 100', p: '× 10 adaugă un zero, × 100 adaugă două zerouri.', x: L(['37 × 10 = 37<mark>0</mark>', { t: '37 × 100 = 37<mark>00</mark>', res: 1 }]) }
  ],
  rest: [
    { h: 'Câte încap și ce rămâne', p: 'Împarți 23 bomboane la 5 copii: fiecare ia 4 (5 × 4 = 20) și mai rămân 3. Restul e mereu mai mic decât împărțitorul.', x: L(['23 : 5', '5 × 4 = <mark>20</mark> (cel mai aproape, fără să treci de 23)', '23 − 20 = <mark>3</mark>', { t: '23 : 5 = 4 rest 3', res: 1 }]) }
  ],
  figurativ: [
    { h: 'Desenează benzi', p: 'Când știi suma și cu cât e unul mai mare, desenezi două benzi, tai bucata în plus și împarți la 2.', x: L(['Împreună 50, unul are cu 10 mai mult', 'Tai bucata în plus: 50 − 10 = <mark>40</mark>', 'Banda mică: 40 : 2 = <mark>20</mark>', { t: 'Banda mare: 20 + 10 = 30', res: 1 }], 1) },
    { h: '„De atâtea ori mai mult”', p: '„de 3 ori mai multe” înseamnă 3 bucăți egale față de 1 bucată. Numeri câte bucăți sunt în total.', x: L(['Împreună 24, roșii de 3 ori mai multe decât albastre', 'albastre = 1 parte, roșii = 3 părți → 4 părți', 'o parte: 24 : 4 = <mark>6</mark>', { t: 'albastre 6, roșii 18', res: 1 }], 1) }
  ],
  perimetru: [
    { h: 'Mergi pe margine', p: 'Perimetrul = drumul în jurul figurii = suma tuturor laturilor.', x: L(['Pătrat cu latura 5: 5 + 5 + 5 + 5 = <mark>20</mark>', 'Dreptunghi 8 și 3: 8 + 3 + 8 + 3 = <mark>22</mark>', { t: 'Triunghi 3, 4, 5: 3 + 4 + 5 = 12', res: 1 }], 1) }
  ],
  romane: [
    { h: 'Cifrele romanilor', p: 'I = 1, V = 5, X = 10, L = 50. Mic înaintea unui mare se scade, mic după unul mare se adună.', x: L(['VI = 5 + 1 = 6', 'IV = 5 − 1 = 4', 'XI = 11, IX = 9', { t: 'XXVII = 10 + 10 + 5 + 1 + 1 = 27', res: 1 }], 0.9) }
  ],
  sinonime: [
    { h: 'Prieteni și opuși', p: 'Sinonimele sunt cuvinte-prieteni (același înțeles). Antonimele sunt cuvinte opuse.', x: L(['vesel = bucuros (<mark>sinonime</mark>)', { t: 'vesel ≠ trist (antonime)', res: 1 }]) }
  ]
};
