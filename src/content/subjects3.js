// Clasa a III-a, celelalte materii (programele OMEN 5003/2014):
// Științe ale naturii, Educație civică, Limba engleză și compuneri (Limba română – redactare).
import { pick, shuffle, textOpts } from './util.js';

// întrebare cu variante text dintr-o bancă: [întrebare, răspuns, [greșite], explicație]
const fromBank = (bank, text = '') => { const [q, a, w, why] = pick(bank); return { text: text || q, expr: text ? q : '', ans: a, opts: textOpts(a, shuffle([...w]).slice(0, 3)), steps: [why] }; };

/* ---------------- ȘTIINȚE ALE NATURII ---------------- */
const VIATA = [
  ['De ce au nevoie toate viețuitoarele ca să trăiască?', 'apă, aer și hrană', ['doar lumină', 'doar joacă', 'doar somn'], 'Toate viețuitoarele au nevoi de bază: apă, aer și hrană. Ele cresc și se înmulțesc.'],
  ['Spre ce se întorc frunzele unei plante puse lângă fereastră?', 'spre lumină', ['spre perete', 'spre podea', 'nu se întorc deloc'], 'Plantele reacționează la lumină: se întorc spre ea, ca să-și facă hrana.'],
  ['Ce se întâmplă cu o plantă care nu primește apă?', 'se ofilește', ['crește mai repede', 'înflorește', 'se face mai verde'], 'Fără apă, planta se ofilește și se poate usca.'],
  ['Ce face câinele când îi e foarte cald?', 'gâfâie cu limba scoasă', ['tremură', 'își face blana mai groasă', 'doarme în zăpadă'], 'Animalele reacționează la temperatură; câinele se răcorește gâfâind.'],
  ['Ce fac multe păsări toamna, când se răcește?', 'pleacă în țările calde', ['își fac blană', 'hibernează în apă', 'își schimbă penele în solzi'], 'Păsările călătoare migrează toamna spre locuri mai calde.'],
  ['Ce face ariciul iarna?', 'hibernează', ['migrează', 'zboară spre sud', 'își face cuib în copac'], 'Ariciul, ursul și alte animale dorm iarna (hibernează).']
];
const GRUPE = [
  ['albina', 'insecte', '6 picioare, corpul din 3 părți, multe au aripi'], ['fluturele', 'insecte', '6 picioare și aripi'], ['furnica', 'insecte', '6 picioare'],
  ['crapul', 'pești', 'trăiesc în apă, respiră prin branhii, au solzi și înotătoare'], ['știuca', 'pești', 'solzi, înotătoare, branhii'],
  ['broasca', 'amfibieni', 'trăiesc și în apă, și pe uscat; pielea umedă'], ['salamandra', 'amfibieni', 'și în apă, și pe uscat'],
  ['șopârla', 'reptile', 'corpul acoperit cu solzi, se târăsc'], ['șarpele', 'reptile', 'solzi, se târăște'], ['țestoasa', 'reptile', 'carapace și solzi'],
  ['vrabia', 'păsări', 'pene, cioc, două aripi, ouă'], ['barza', 'păsări', 'pene, aripi, cioc lung'], ['găina', 'păsări', 'pene și cioc'],
  ['vaca', 'mamifere', 'au păr, puii se hrănesc cu lapte'], ['câinele', 'mamifere', 'păr, pui hrăniți cu lapte'], ['delfinul', 'mamifere', 'trăiește în apă, dar puii beau lapte: e mamifer!'], ['liliacul', 'mamifere', 'zboară, dar are păr și puii beau lapte: e mamifer!']
];
const PAMANT = [
  ['Cum se numește trecerea apei din lichid în vapori?', 'vaporizare', ['topire', 'solidificare', 'condensare'], 'Vaporizarea: apa lichidă devine vapori (de ex. apa care fierbe).'],
  ['Cum se numește trecerea gheții în apă?', 'topire', ['vaporizare', 'condensare', 'solidificare'], 'Topirea: din solid în lichid (gheața se topește).'],
  ['Cum se numește trecerea apei în gheață?', 'solidificare', ['topire', 'vaporizare', 'condensare'], 'Solidificarea (înghețarea): din lichid în solid.'],
  ['Cum se numește apariția picăturilor pe un pahar rece?', 'condensare', ['topire', 'vaporizare', 'solidificare'], 'Condensarea: vaporii din aer se transformă în picături pe suprafața rece.'],
  ['Ce formează norii, în circuitul apei?', 'vaporii de apă care se condensează', ['fumul din coșuri', 'nisipul ridicat de vânt', 'zăpada topită'], 'Apa se evaporă, urcă, se condensează în nori, apoi cade ca ploaie sau ninsoare.'],
  ['Ce auzim după fulger?', 'tunetul', ['curcubeul', 'grindina', 'ecoul'], 'Fulgerul e o descărcare electrică; zgomotul lui este tunetul.'],
  ['Care e o sursă de apă dulce?', 'izvorul', ['marea', 'oceanul', 'nisipul'], 'Apă dulce găsim în izvoare, râuri, lacuri, ape subterane.'],
  ['Care este o resursă naturală?', 'lemnul din pădure', ['jucăria de plastic', 'caietul', 'televizorul'], 'Resursele naturale vin din natură: apă, lemn, cărbune, petrol, sol.'],
  ['Ce poluează aerul?', 'fumul de la mașini și fabrici', ['copacii', 'ploaia', 'vântul'], 'Poluarea aerului vine din fum și gaze; copacii curăță aerul.'],
  ['Ce facem ca să nu poluăm apa?', 'nu aruncăm gunoaie în râuri', ['spălăm mașina în râu', 'aruncăm uleiul în chiuvetă', 'lăsăm apa să curgă'], 'Protejăm apa: nu aruncăm gunoaie și nu irosim apa.']
];
const CORPURI = [
  ['În ce stare de agregare este apa din pahar?', 'lichidă', ['solidă', 'gazoasă'], 'Lichidele iau forma vasului, dar au volum propriu.'],
  ['În ce stare de agregare este o piatră?', 'solidă', ['lichidă', 'gazoasă'], 'Solidele au formă și volum proprii.'],
  ['În ce stare de agregare este aerul din balon?', 'gazoasă', ['solidă', 'lichidă'], 'Gazele ocupă tot spațiul în care se află.'],
  ['Ce obiect este atras de magnet?', 'un cui de fier', ['o radieră', 'o lingură de lemn', 'o foaie de hârtie'], 'Magnetul atrage obiectele din fier (și din oțel, nichel).'],
  ['La ce folosește busola?', 'arată direcția nord', ['măsoară temperatura', 'arată ora', 'cântărește obiecte'], 'Acul busolei e un magnet care arată mereu nordul.'],
  ['De ce cade mărul din copac în jos?', 'Pământul îl atrage (gravitația)', ['vântul îl împinge mereu', 'mărul vrea jos', 'magnetul din sol'], 'Gravitația: Pământul atrage toate corpurile spre el.'],
  ['De ce se oprește o minge care se rostogolește pe iarbă?', 'din cauza frecării', ['din cauza magnetului', 'din cauza luminii', 'pentru că obosește'], 'Frecarea dintre minge și iarbă o încetinește până se oprește.'],
  ['Ce se întâmplă cu o minge de plastilină când o strângi?', 'se deformează', ['se topește', 'se evaporă', 'devine magnet'], 'Forțele pot deforma corpurile sau le pot pune în mișcare.'],
  ['Care metal este folosit la firele electrice?', 'cuprul', ['lemnul', 'sticla', 'cauciucul'], 'Metalele conduc curentul electric; cuprul e folosit la fire.'],
  ['Ce instrument măsoară lungimea unei bănci?', 'metrul (rigla)', ['cântarul', 'termometrul', 'ceasul'], 'Lungimea se măsoară cu metrul sau rigla; masa cu cântarul.'],
  ['Mașina A merge 100 m în 10 secunde, mașina B 100 m în 20 de secunde. Care e mai rapidă?', 'mașina A', ['mașina B', 'sunt la fel de rapide'], 'Mai rapid e cel care parcurge aceeași distanță în timp mai scurt.']
];
const OMUL = [
  ['Câte ore ar trebui să doarmă un copil de clasa a III-a?', 'cam 10 ore', ['2 ore', '4 ore', '20 de ore'], 'Copiii au nevoie de 9–11 ore de somn ca să crească și să învețe bine.'],
  ['Ce e sănătos după ce înveți mult?', 'o pauză cu mișcare', ['încă 3 ore de telefon', 'să nu mănânci', 'să stai nemișcat'], 'Activitatea alternează cu odihna și mișcarea.'],
  ['Care organ pompează sângele în corp?', 'inima', ['plămânii', 'stomacul', 'creierul'], 'Inima pompează sângele; plămânii ne ajută să respirăm.'],
  ['Cu ce respirăm?', 'plămânii', ['inima', 'stomacul', 'rinichii'], 'Aerul intră în plămâni, unde corpul ia oxigenul.']
];
export const G3S = {
  sViata: () => fromBank(VIATA),
  sAnimale() { const [a, g, why] = pick(GRUPE); return { text: 'Din ce grupă de animale face parte?', expr: a, ans: g, opts: textOpts(g, shuffle(['insecte', 'pești', 'amfibieni', 'reptile', 'păsări', 'mamifere'].filter((x) => x !== g)).slice(0, 3)), steps: [`${a}: ${why} → ${g}.`] }; },
  sPamant: () => fromBank(PAMANT),
  sCorpuri: () => fromBank(CORPURI),
  sOmul: () => fromBank(OMUL)
};

/* ---------------- EDUCAȚIE CIVICĂ ---------------- */
const CIVICA = [
  ['Un coleg a căzut și s-a lovit. Ce e bine să faci?', 'îl ajut și chem un adult', ['râd de el', 'plec', 'îl filmez'], 'Bunătatea înseamnă să ajuți; opusul ei e răutatea.'],
  ['Ai spart din greșeală vaza. Ce faci?', 'spun adevărul', ['dau vina pe frate', 'ascund cioburile', 'zic că a fost pisica'], 'Sinceritatea înseamnă să spui adevărul, chiar și când e greu.'],
  ['Un copil mai mic e certat de alții pe nedrept. Ce faci?', 'îl apăr cu calm și chem un adult', ['mă alătur lor', 'mă prefac că nu văd', 'fug'], 'Curajul (opus lașității) înseamnă să faci ce e corect, chiar dacă e greu.'],
  ['Ai luat cea mai bună notă din clasă. Cum te porți?', 'mă bucur, dar nu mă laud', ['râd de cei cu note mici', 'spun că ceilalți sunt proști', 'nu mai vorbesc cu nimeni'], 'Modestia înseamnă să nu te lauzi și să nu-i faci pe alții să se simtă prost.'],
  ['Cum vorbești cu un bunic pe care nu-l cunoști?', 'politicos: „Bună ziua!”', ['strig la el', 'îi întorc spatele', 'îi spun porecle'], 'Respectul se vede în felul în care vorbim cu ceilalți.'],
  ['Ai împrumutat o carte de la bibliotecă. Ce faci?', 'o păstrez curată și o returnez la timp', ['scriu pe ea', 'o pierd', 'o păstrez pentru mine'], 'Avem grijă de lucruri, mai ales de ale altora (proprietatea).'],
  ['Vezi un cățel flămând pe stradă. Ce e bine?', 'chem un adult să-l ajutăm', ['arunc cu pietre', 'îl sperii', 'îl lovesc'], 'Față de animale arătăm grijă, delicatețe și compasiune.'],
  ['Care este o regulă bună pentru grupul clasei?', 'ascultăm când vorbește altcineva', ['vorbim toți deodată', 'luăm lucrurile altora', 'ne batem la pauză'], 'Grupurile au reguli: drepturi, dar și îndatoriri.'],
  ['Care este un drept al copilului?', 'să meargă la școală', ['să nu asculte de nimeni', 'să bată pe cineva', 'să ia lucrurile altora'], 'Copiii au dreptul la educație, la joacă, la îngrijire și la protecție.'],
  ['Care este o îndatorire a elevului?', 'să-și facă temele', ['să lipsească de la ore', 'să strice băncile', 'să copieze'], 'Pe lângă drepturi, avem și îndatoriri.'],
  ['Ce înseamnă să ai încredere în tine?', 'să crezi că poți reuși dacă încerci', ['să crezi că nu greșești niciodată', 'să nu asculți pe nimeni', 'să nu încerci nimic'], 'Încrederea în sine te ajută să încerci, să greșești și să înveți.'],
  ['Ce grup mic este cel mai apropiat de tine?', 'familia', ['un oraș străin', 'o țară îndepărtată', 'o echipă de pe alt continent'], 'Grupurile mici: familia, prietenii, colegii de clasă.']
];
export const G3CIV = { civica: () => fromBank(CIVICA, 'Ce e bine?') };

/* ---------------- LIMBA ENGLEZĂ ---------------- */
const EN = {
  colours: [['red', 'roșu'], ['blue', 'albastru'], ['green', 'verde'], ['yellow', 'galben'], ['black', 'negru'], ['white', 'alb'], ['pink', 'roz'], ['orange', 'portocaliu'], ['purple', 'mov'], ['brown', 'maro']],
  family: [['mother', 'mama'], ['father', 'tata'], ['sister', 'sora'], ['brother', 'fratele'], ['grandmother', 'bunica'], ['grandfather', 'bunicul'], ['baby', 'bebelușul']],
  animals: [['dog', 'câine'], ['cat', 'pisică'], ['horse', 'cal'], ['cow', 'vacă'], ['bird', 'pasăre'], ['fish', 'pește'], ['rabbit', 'iepure'], ['elephant', 'elefant'], ['monkey', 'maimuță'], ['lion', 'leu']],
  food: [['apple', 'măr'], ['bread', 'pâine'], ['milk', 'lapte'], ['cheese', 'brânză'], ['banana', 'banană'], ['water', 'apă'], ['egg', 'ou'], ['cake', 'prăjitură']],
  school: [['book', 'carte'], ['pencil', 'creion'], ['pen', 'pix'], ['ruler', 'riglă'], ['rubber', 'radieră'], ['desk', 'bancă'], ['schoolbag', 'ghiozdan'], ['teacher', 'învățătoare']],
  body: [['head', 'cap'], ['hand', 'mână'], ['eye', 'ochi'], ['ear', 'ureche'], ['nose', 'nas'], ['mouth', 'gură'], ['leg', 'picior'], ['hair', 'păr']],
  clothes: [['T-shirt', 'tricou'], ['shoes', 'pantofi'], ['hat', 'pălărie'], ['dress', 'rochie'], ['trousers', 'pantaloni'], ['coat', 'haină'], ['socks', 'șosete']],
  house: [['kitchen', 'bucătărie'], ['bedroom', 'dormitor'], ['bathroom', 'baie'], ['door', 'ușă'], ['window', 'fereastră'], ['table', 'masă'], ['chair', 'scaun'], ['bed', 'pat']],
  days: [['Monday', 'luni'], ['Tuesday', 'marți'], ['Wednesday', 'miercuri'], ['Thursday', 'joi'], ['Friday', 'vineri'], ['Saturday', 'sâmbătă'], ['Sunday', 'duminică']],
  weather: [['sunny', 'însorit'], ['rainy', 'ploios'], ['snowy', 'cu zăpadă'], ['windy', 'cu vânt'], ['cloudy', 'înnorat'], ['hot', 'cald'], ['cold', 'frig']]
};
const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const TENS = { 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety', 100: 'one hundred' };
const enNum = (n) => (n <= 20 ? NUM[n] : TENS[n] ? TENS[n] : TENS[n - (n % 10)] + '-' + NUM[n % 10]);
const GRAM = [
  ['I ___ got a dog.', 'have', ['has', 'is', 'am'], 'I / you / we / they → have got; he / she / it → has got.'],
  ['She ___ got a red bike.', 'has', ['have', 'are', 'am'], 'He / she / it → has got.'],
  ['They ___ my friends.', 'are', ['is', 'am', 'has'], 'I am, he/she/it is, we/you/they are.'],
  ['I ___ nine years old.', 'am', ['is', 'are', 'has'], 'I am (eu sunt).'],
  ['He ___ a teacher.', 'is', ['are', 'am', 'have'], 'He / she / it is.'],
  ['The cat is ___ the box. (în cutie)', 'in', ['on', 'under', 'next to'], 'in = în, on = pe, under = sub.'],
  ['The book is ___ the table. (pe masă)', 'on', ['in', 'under', 'behind'], 'on = pe.'],
  ['The ball is ___ the chair. (sub scaun)', 'under', ['on', 'in', 'above'], 'under = sub.'],
  ['A fish ___ swim.', 'can', ['can\'t', 'is', 'has'], 'can = poate; peștele poate înota.'],
  ['A dog ___ fly.', 'can\'t', ['can', 'is', 'are'], 'can\'t = nu poate; câinele nu poate zbura.'],
  ['There ___ two cats in the garden.', 'are', ['is', 'am', 'has'], 'There is (unul), there are (mai mulți).'],
  ['___ is your name? — My name is Luca.', 'What', ['Who', 'Where', 'How'], 'What is your name? = Cum te cheamă?'],
  ['How ___ are you? — I am nine.', 'old', ['many', 'much', 'big'], 'How old are you? = Câți ani ai?']
];
export const G3EN = {
  enVocab() {
    const topic = pick(Object.keys(EN)), list = EN[topic], [en, ro] = pick(list), toRo = Math.random() < 0.5;
    const others = shuffle(list.filter((x) => x[0] !== en)).slice(0, 3);
    return toRo
      ? { text: 'Ce înseamnă în română?', expr: en, ans: ro, opts: textOpts(ro, others.map((x) => x[1])), steps: [`${en} = ${ro}`] }
      : { text: 'Cum se spune în engleză?', expr: ro, ans: en, opts: textOpts(en, others.map((x) => x[0])), steps: [`${ro} = ${en}`] };
  },
  enNumere() {
    const n = pick([...Array(21).keys(), 30, 40, 50, 60, 70, 80, 90, 100, 23, 35, 47, 58, 64, 72, 86, 99]), w = enNum(n);
    const near = [...new Set([n + 1, n - 1, n + 10, n - 10, n + 2])].filter((x) => x !== n && x >= 0 && x <= 100).slice(0, 3);
    return Math.random() < 0.5
      ? { text: 'Ce număr este?', expr: w, ans: n, opts: shuffle([n, ...near]), steps: [`${w} = ${n}`] }
      : { text: 'Cum scrii numărul în engleză?', expr: String(n), ans: w, opts: textOpts(w, near.map(enNum)), steps: [`${n} = ${w}`] };
  },
  enGramatica: () => fromBank(GRAM, 'Alege cuvântul potrivit:')
};

/* ---------------- COMPUNERI ---------------- */
const POVESTI = [
  ['O zi la munte', ['Sâmbătă dimineață am plecat cu familia la munte.', 'Am urcat pe o potecă printre brazi și am văzut o veveriță.', 'Sus, pe vârf, am mâncat și am admirat priveliștea.', 'Seara ne-am întors obosiți, dar fericiți.']],
  ['Cățelul pierdut', ['Ieri, în parc, am găsit un cățel care plângea.', 'Avea la gât o zgardă cu un număr de telefon.', 'Mama a sunat, iar stăpâna a venit repede.', 'Fetița ne-a mulțumit și eram foarte bucuros.']],
  ['Prima zăpadă', ['Când m-am trezit, totul era alb.', 'Am ieșit cu sora mea și am făcut un om de zăpadă.', 'Apoi ne-am bătut cu bulgări până ne-au înghețat mâinile.', 'Am intrat în casă și am băut ceai cald.']]
];
const COMP = [
  ['Unde scrii titlul unei compuneri?', 'la mijlocul rândului, sus', ['în colțul din dreapta jos', 'la sfârșit', 'nu se scrie titlu'], 'Titlul se scrie sus, la mijlocul rândului.'],
  ['Din ce părți e făcută o compunere?', 'introducere, cuprins, încheiere', ['titlu, dată, semnătură', 'început și sfârșit', 'un singur paragraf'], 'Introducerea spune unde, când și cine; cuprinsul, ce s-a întâmplat; încheierea, cum s-a terminat.'],
  ['Ce faci când începi o idee nouă?', 'treci pe rând nou, cu alineat', ['scrii mai mic', 'pui o linie', 'continui pe același rând'], 'Fiecare idee nouă începe pe rând nou, cu alineat (cam 2 degete).'],
  ['Ce scrii în introducere?', 'unde, când și cine participă', ['cum se termină', 'doar titlul', 'concluzia'], 'Introducerea prezintă locul, timpul și personajele.'],
  ['Ce scrii în încheiere?', 'cum s-a terminat și ce ai simțit', ['locul și timpul', 'personajele noi', 'nimic'], 'Încheierea arată finalul și impresiile.'],
  ['Ce trebuie să aibă un bilet?', 'data, adresarea, mesajul, semnătura', ['doar mesajul', 'un titlu mare', 'o poezie'], 'Biletul: data (sus, dreapta), adresarea cu virgulă, mesajul, semnătura (jos, dreapta).'],
  ['Ce trebuie să conțină o invitație?', 'ce eveniment, unde, când, cine invită', ['doar numele tău', 'o rețetă', 'nimic în plus'], 'Invitația spune clar evenimentul, locul, data și ora, și cine invită.'],
  ['Care cuvânt face o descriere mai frumoasă: „Am văzut un câine ___.”', 'pufos și jucăuș', ['mare mare mare', 'care era', 'și'], 'Adjectivele (pufos, jucăuș) fac descrierea vie.'],
  ['Ce semn pui după formula de adresare „Dragă bunico”?', 'virgula', ['punctul', 'semnul întrebării', 'nimic'], 'După adresare pui virgulă, apoi scrii mesajul pe rândul următor.']
];
export const G3COMP = {
  compParti: () => fromBank(COMP, 'Compunerea:'),
  compOrdine() {
    const [title, ideas] = pick(POVESTI), order = shuffle([0, 1, 2, 3]), labels = ['A', 'B', 'C', 'D'];
    const shown = order.map((k, i) => `${labels[i]}. ${ideas[k]}`).join('\n'), ans = [0, 1, 2, 3].map((k) => labels[order.indexOf(k)]).join(' – ');
    const wrong = new Set(); while (wrong.size < 3) { const p = shuffle([0, 1, 2, 3]).map((k) => labels[order.indexOf(k)]).join(' – '); if (p !== ans) wrong.add(p); }
    return { text: `Pune ideile în ordine, ca să faci compunerea „${title}”:\n${shown}`, ans, opts: textOpts(ans, [...wrong]), steps: ['Întâi introducerea (când, unde, cine), apoi ce s-a întâmplat, apoi încheierea.', ans], hints: ['Caută ideea care spune „când” și „unde” – ea e prima.'] };
  }
};
export const SUBJECTS3 = { ...G3S, ...G3CIV, ...G3EN, ...G3COMP };
