// Harta Naturii: Științe ale naturii, clasa a III-a (programa OMEN 5003/2014, conținuturile clasei a III-a).
// Fiecare ținut: „Ce trebuie să știi”, cuvinte de știință (cu cartonaș în Albumul Naturii), un joc de sortare și o bancă de întrebări.
import { pick, shuffle, textOpts } from './util.js';

// [întrebare, răspuns, [greșite], explicație]
const fromBank = (bank) => { const [q, a, w, why] = pick(bank); return { text: q, ans: a, opts: textOpts(a, shuffle([...w]).slice(0, 3)), steps: [why] }; };

export const REGIONS = [
  {
    id: 'viata', name: 'Pădurea Vieții', emoji: '🌳', color: '#2f8f46', mission: 's3-viata',
    sub: 'Ce au toate viețuitoarele: nevoi, creștere, înmulțire, reacții',
    facts: [
      ['🌱', 'Viețuitoarele (plantele, animalele, omul) au nevoie de **apă, aer și hrană**.'],
      ['📏', 'Toate viețuitoarele **cresc** și se **înmulțesc**: plantele din semințe, animalele fac pui sau ouă.'],
      ['🌞', 'Plantele se întorc **spre lumină**. Fără apă, planta se **ofilește**.'],
      ['❄️', 'Când se face frig, unele animale **hibernează** (ariciul, ursul), altele **migrează** (barza, rândunica).'],
      ['🦊', 'În pericol, animalele **fug, se ascund** sau se **camuflează** (au culoarea locului în care trăiesc).'],
      ['🪨', 'Lucrurile **lipsite de viață** (piatra, apa, o masă) nu cresc, nu se hrănesc și nu se înmulțesc.']
    ],
    words: [['viețuitoare', 'ființă vie: plantă, animal sau om', '🐞'], ['hibernare', 'somnul lung de iarnă al unor animale', '🦔'], ['migrație', 'călătoria păsărilor spre țările calde', '🕊️'],
      ['camuflaj', 'culoarea care ascunde animalul în mediul lui', '🦎'], ['înmulțire', 'viețuitoarele fac urmași (pui, semințe)', '🐣'], ['ofilire', 'planta se lasă moale când nu are apă', '🥀'],
      ['germinare', 'sămânța încolțește și apare o plantă nouă', '🌱'], ['nevoi de bază', 'apă, aer și hrană', '💧']],
    sort: { title: 'Viu sau lipsit de viață?', buckets: ['viu', 'lipsit de viață'], items: [['🌻 floarea-soarelui', 0], ['🐌 melcul', 0], ['🍄 ciuperca', 0], ['🐟 peștele', 0], ['🌳 stejarul', 0], ['👧 fetița', 0], ['🪨 piatra', 1], ['💧 picătura de apă', 1], ['🪑 scaunul', 1], ['⚽ mingea', 1], ['☁️ norul', 1], ['🧸 ursulețul de pluș', 1]] },
    tf: [['Toate viețuitoarele cresc.', 1], ['Piatra se înmulțește.', 0], ['Ursul hibernează iarna.', 1], ['Plantele se întorc spre lumină.', 1], ['Barza hibernează în pământ.', 0], ['Fără apă, planta se ofilește.', 1], ['Semințele încolțesc mai bine la frig și întuneric.', 0], ['Camuflajul ajută animalul să se ascundă.', 1]],
    bank: [
      ['De ce au nevoie toate viețuitoarele ca să trăiască?', 'apă, aer și hrană', ['doar lumină', 'doar joacă', 'doar somn'], 'Toate viețuitoarele au nevoi de bază: apă, aer și hrană.'],
      ['Spre ce se întorc frunzele unei plante puse lângă fereastră?', 'spre lumină', ['spre perete', 'spre podea', 'nu se întorc deloc'], 'Plantele reacționează la lumină: se întorc spre ea.'],
      ['Ce se întâmplă cu o plantă care nu primește apă?', 'se ofilește', ['crește mai repede', 'înflorește', 'se face mai verde'], 'Fără apă, planta se ofilește și se poate usca.'],
      ['Ce face ariciul iarna?', 'hibernează', ['migrează', 'zboară spre sud', 'își face cuib în copac'], 'Ariciul și ursul dorm iarna: hibernează.'],
      ['Ce fac berzele toamna?', 'migrează în țările calde', ['hibernează', 'își fac blană', 'stau în zăpadă'], 'Păsările călătoare migrează toamna spre locuri calde.'],
      ['Ce face câinele când îi e foarte cald?', 'gâfâie cu limba scoasă', ['tremură', 'își face blana mai groasă', 'doarme în zăpadă'], 'Câinele se răcorește gâfâind.'],
      ['Ce face un iepure când vede o vulpe?', 'fuge și se ascunde', ['se duce spre ea', 'adoarme', 'începe să cânte'], 'În pericol, animalele fug sau se ascund.'],
      ['De ce e greu de văzut o lăcustă verde în iarbă?', 'are culoarea ierbii (camuflaj)', ['e prea mică să existe', 'e invizibilă', 'stă mereu în aer'], 'Camuflajul: animalul are culoarea locului în care trăiește.'],
      ['Ce NU este o viețuitoare?', 'piatra', ['melcul', 'ciuperca', 'bradul'], 'Piatra nu crește, nu se hrănește și nu se înmulțește.'],
      ['Din ce crește o plantă nouă de fasole?', 'dintr-o sămânță', ['dintr-o piatră', 'dintr-o frunză uscată căzută', 'din nisip'], 'Plantele se înmulțesc prin semințe: sămânța germinează.'],
      ['Ce au nevoie semințele ca să încolțească?', 'apă, aer și căldură', ['întuneric și frig', 'doar zăpadă', 'sare'], 'Semințele germinează când au apă, aer și căldură.'],
      ['Cum se înmulțesc găinile?', 'fac ouă din care ies pui', ['fac semințe', 'cresc din pământ', 'nu se înmulțesc'], 'Păsările depun ouă; din ouă ies puii.'],
      ['Ce se întâmplă cu o pisică pe măsură ce trece timpul?', 'crește', ['se micșorează', 'devine piatră', 'rămâne la fel'], 'Toate viețuitoarele cresc.'],
      ['De ce își face ursul un strat gros de grăsime toamna?', 'ca să treacă iarna dormind', ['ca să alerge mai repede', 'ca să înoate', 'ca să zboare'], 'Grăsimea îl hrănește în timpul hibernării.'],
      ['Ce face floarea-soarelui în timpul zilei?', 'își întoarce floarea spre Soare', ['se ascunde în pământ', 'își pierde frunzele', 'se închide toată ziua'], 'Floarea-soarelui urmărește lumina Soarelui.'],
      ['Ce fac multe animale cu blană când vine iarna?', 'li se face blana mai deasă', ['li se cade toată blana', 'li se fac solzi', 'li se fac aripi'], 'Blana mai deasă le ține de cald: o reacție la frig.'],
      ['Ce fac rândunelele toamna?', 'pleacă în țările calde', ['hibernează sub pământ', 'își fac blană', 'rămân și construiesc cuiburi noi'], 'Rândunelele sunt păsări călătoare.'],
      ['Ce reacție are o plantă pusă la întuneric multe zile?', 'se îngălbenește și slăbește', ['se face mai verde', 'înflorește mai mult', 'nu se schimbă nimic'], 'Plantele au nevoie de lumină ca să-și facă hrana.'],
      ['Ce face un arici când e în pericol?', 'se face ghem cu țepii afară', ['începe să zboare', 'se îngroapă în apă', 'atacă mereu'], 'Fiecare animal are felul lui de apărare.'],
      ['Care dintre acestea crește?', 'un pui de pisică', ['o piatră', 'o minge', 'un scaun'], 'Doar viețuitoarele cresc.'],
      ['De ce respiră toate viețuitoarele?', 'au nevoie de aer', ['le e frig', 'vor să cânte', 'nu respiră toate'], 'Aerul este o nevoie de bază.'],
      ['Ce face cameleonul ca să nu fie văzut?', 'își schimbă culoarea', ['strigă tare', 'zboară', 'se face mai mare'], 'Cameleonul se camuflează.']
    ]
  },
  {
    id: 'animale', name: 'Valea Animalelor', emoji: '🦊', color: '#d35400', mission: 's3-animale',
    sub: 'Insecte, pești, amfibieni, reptile, păsări, mamifere',
    facts: [
      ['🐝', '**Insectele** au **6 picioare**, corpul din 3 părți și, multe, aripi (albina, fluturele, furnica).'],
      ['🐟', '**Peștii** trăiesc în apă, au **solzi și înotătoare** și respiră prin **branhii**.'],
      ['🐸', '**Amfibienii** trăiesc **și în apă, și pe uscat**; au pielea umedă (broasca, salamandra).'],
      ['🦎', '**Reptilele** au corpul acoperit cu **solzi** și se târăsc (șopârla, șarpele, țestoasa).'],
      ['🐦', '**Păsările** au **pene, cioc și două aripi**; fac ouă (vrabia, barza, găina).'],
      ['🐻', '**Mamiferele** au **păr (blană)** și își hrănesc puii **cu lapte** (vaca, câinele, delfinul, liliacul).']
    ],
    words: [['insecte', '6 picioare, corpul din 3 părți', '🐝'], ['pești', 'solzi, înotătoare, respiră prin branhii', '🐟'], ['amfibieni', 'trăiesc și în apă, și pe uscat', '🐸'],
      ['reptile', 'corp cu solzi, se târăsc', '🐍'], ['păsări', 'pene, cioc, aripi, ouă', '🐦'], ['mamifere', 'păr și puii hrăniți cu lapte', '🐄'], ['branhii', 'organele cu care respiră peștii', '🐠'], ['solzi', 'plăcuțe care acoperă corpul peștilor și reptilelor', '🦎']],
    sort: { title: 'În ce grupă e?', buckets: ['insecte', 'pești', 'amfibieni', 'reptile', 'păsări', 'mamifere'], items: [['🐝 albina', 0], ['🦋 fluturele', 0], ['🐜 furnica', 0], ['🐟 crapul', 1], ['🐠 știuca', 1], ['🐸 broasca', 2], ['🦎 salamandra', 2], ['🐍 șarpele', 3], ['🐢 țestoasa', 3], ['🦆 rața', 4], ['🦉 bufnița', 4], ['🐬 delfinul', 5], ['🦇 liliacul', 5], ['🐻 ursul', 5]] },
    tf: [['Insectele au 6 picioare.', 1], ['Delfinul este pește.', 0], ['Broasca este amfibian.', 1], ['Păsările au pene.', 1], ['Liliacul este pasăre.', 0], ['Peștii respiră prin branhii.', 1], ['Șarpele este mamifer.', 0], ['Mamiferele își hrănesc puii cu lapte.', 1]],
    bank: [
      ['Câte picioare are o insectă?', '6', ['4', '8', '2'], 'Toate insectele au 6 picioare.'],
      ['Cu ce respiră peștii?', 'cu branhiile', ['cu plămânii', 'cu aripile', 'cu solzii'], 'Peștii iau oxigenul din apă prin branhii.'],
      ['De ce delfinul este mamifer, deși trăiește în apă?', 'își hrănește puii cu lapte', ['are solzi', 'are branhii', 'face ouă cu coajă'], 'Mamiferele își hrănesc puii cu lapte, chiar dacă trăiesc în apă.'],
      ['Ce animal este amfibian?', 'broasca', ['șopârla', 'crapul', 'vrabia'], 'Broasca trăiește și în apă, și pe uscat.'],
      ['Cu ce este acoperit corpul păsărilor?', 'cu pene', ['cu solzi', 'cu păr', 'cu piele umedă'], 'Păsările au pene, cioc și aripi.'],
      ['Ce animal este reptilă?', 'țestoasa', ['broasca', 'liliacul', 'albina'], 'Reptilele (țestoasa, șarpele, șopârla) au solzi.'],
      ['Liliacul zboară, dar este...', 'mamifer', ['pasăre', 'insectă', 'reptilă'], 'Liliacul are blană și își hrănește puii cu lapte: e mamifer.'],
      ['Ce au toate mamiferele?', 'păr și pui hrăniți cu lapte', ['pene și cioc', 'solzi și branhii', '6 picioare'], 'Așa recunoști mamiferele.'],
      ['Din ce ies puii de pasăre?', 'din ouă', ['din semințe', 'din pământ', 'din flori'], 'Păsările clocesc ouăle; din ele ies puii.'],
      ['Ce grupă are pielea umedă?', 'amfibienii', ['reptilele', 'păsările', 'insectele'], 'Amfibienii au pielea umedă și subțire.'],
      ['Ce animal din grădină este insectă?', 'buburuza', ['melcul', 'râma', 'păianjenul'], 'Buburuza are 6 picioare; păianjenul are 8, deci nu e insectă!'],
      ['Ce grupă are înotătoare?', 'peștii', ['păsările', 'mamiferele de la fermă', 'insectele'], 'Peștii se mișcă în apă cu înotătoarele.'],
      ['Care mamifer trăiește la fermă?', 'vaca', ['barza', 'crapul', 'șopârla'], 'Vaca are păr și își hrănește vițelul cu lapte.'],
      ['Ce grupă se târăște pe pământ?', 'reptilele', ['păsările', 'peștii', 'insectele cu aripi'], 'Reptilele, ca șarpele, se târăsc.'],
      ['Ce animal are 8 picioare și NU este insectă?', 'păianjenul', ['albina', 'furnica', 'fluturele'], 'Insectele au 6 picioare; păianjenul are 8.'],
      ['Ce pasăre nu zboară, dar înoată foarte bine?', 'pinguinul', ['vrabia', 'barza', 'rândunica'], 'Pinguinul e pasăre: are pene, cioc și face ouă.'],
      ['Din ce grupă face parte balena?', 'mamifere', ['pești', 'reptile', 'amfibieni'], 'Balena respiră aer și își hrănește puiul cu lapte.'],
      ['Cum se numesc puii broaștei, care trăiesc în apă?', 'mormoloci', ['pui de găină', 'larve de albină', 'iezi'], 'Puii de broască (mormolocii) trăiesc în apă, apoi broasca trăiește și pe uscat.'],
      ['Ce grupă face ouă cu coajă și are pene?', 'păsările', ['mamiferele', 'peștii', 'insectele'], 'Păsările au pene și fac ouă cu coajă.'],
      ['Ce au în comun șarpele și șopârla?', 'corpul acoperit cu solzi', ['pene', 'blană', '6 picioare'], 'Amândouă sunt reptile.']
    ]
  },
  {
    id: 'om', name: 'Orașul Sănătății', emoji: '🧒', color: '#e04848', mission: 's3-omul',
    sub: 'Igienă, hrană sănătoasă, activitate și odihnă',
    facts: [
      ['😴', 'Un copil are nevoie de **9–11 ore de somn** pe noapte ca să crească și să învețe bine.'],
      ['🏃', '**Mișcarea** (joaca afară, sportul) întărește corpul; după activitate urmează **odihna**.'],
      ['🍎', 'Mâncarea sănătoasă: **fructe, legume, lactate, cereale, apă**. Dulciurile — puțin și rar.'],
      ['🧼', 'Ne spălăm **pe mâini** înainte de masă și după toaletă; ne spălăm **pe dinți** dimineața și seara.'],
      ['🫀', '**Inima** pompează sângele, **plămânii** ne ajută să respirăm, **creierul** conduce corpul.'],
      ['📱', 'Prea mult timp la ecran obosește ochii: facem **pauze**.']
    ],
    words: [['igienă', 'curățenia corpului și a lucrurilor', '🧼'], ['odihnă', 'somn și relaxare după efort', '😴'], ['alimentație sănătoasă', 'mâncare variată: fructe, legume, lactate', '🥗'],
      ['activitate fizică', 'mișcare, sport, joacă', '⚽'], ['inima', 'organul care pompează sângele', '❤️'], ['plămânii', 'organele cu care respirăm', '🫁'], ['vitamine', 'substanțe din fructe și legume care ne țin sănătoși', '🍊']],
    sort: { title: 'Sănătos sau nesănătos?', buckets: ['sănătos', 'nesănătos'], items: [['🍎 un măr la gustare', 0], ['🚲 plimbare cu bicicleta', 0], ['🪥 spălat pe dinți seara', 0], ['😴 culcat la ora 9', 0], ['🥛 un pahar cu lapte', 0], ['🧼 spălat pe mâini înainte de masă', 0], ['🍭 dulciuri toată ziua', 1], ['📱 telefon până noaptea târziu', 1], ['🥤 suc acidulat în loc de apă', 1], ['🛋️ toată ziua pe canapea', 1], ['🍟 cartofi prăjiți în fiecare zi', 1]] },
    tf: [['Un copil are nevoie de cam 10 ore de somn.', 1], ['Sucul acidulat e mai sănătos decât apa.', 0], ['Ne spălăm pe mâini înainte de masă.', 1], ['Inima pompează sângele.', 1], ['Respirăm cu stomacul.', 0], ['Mișcarea întărește corpul.', 1], ['E bine să stăm la telefon toată noaptea.', 0], ['Fructele au vitamine.', 1]],
    bank: [
      ['Câte ore ar trebui să doarmă un copil de clasa a III-a?', 'cam 10 ore', ['2 ore', '4 ore', '20 de ore'], 'Copiii au nevoie de 9–11 ore de somn.'],
      ['Ce e sănătos după ce ai învățat mult?', 'o pauză cu mișcare', ['încă 3 ore de telefon', 'să nu mănânci', 'să stai nemișcat'], 'Activitatea alternează cu odihna și mișcarea.'],
      ['Care organ pompează sângele în corp?', 'inima', ['plămânii', 'stomacul', 'creierul'], 'Inima pompează sângele.'],
      ['Cu ce respirăm?', 'cu plămânii', ['cu inima', 'cu stomacul', 'cu rinichii'], 'Aerul intră în plămâni.'],
      ['Când ne spălăm pe mâini?', 'înainte de masă și după toaletă', ['doar duminica', 'niciodată', 'doar vara'], 'Mâinile curate ne feresc de microbi.'],
      ['Ce gustare e cea mai sănătoasă?', 'un măr', ['o ciocolată mare', 'chipsuri', 'un suc acidulat'], 'Fructele au vitamine.'],
      ['Ce băutură e cea mai bună pentru sete?', 'apa', ['sucul acidulat', 'cafeaua', 'siropul dulce'], 'Apa e cea mai sănătoasă băutură.'],
      ['De câte ori pe zi ne spălăm pe dinți?', 'de cel puțin 2 ori (dimineața și seara)', ['o dată pe săptămână', 'niciodată', 'doar la dentist'], 'Dinții curați nu se strică.'],
      ['Ce întărește mușchii și inima?', 'mișcarea și sportul', ['statul la televizor', 'dulciurile', 'somnul toată ziua'], 'Activitatea fizică ne face puternici.'],
      ['Ce faci dacă stai mult la calculator?', 'faci pauze și te uiți în depărtare', ['te apropii mai mult de ecran', 'nu clipești', 'stai și noaptea'], 'Pauzele odihnesc ochii.'],
      ['Ce organ conduce tot corpul (gândim cu el)?', 'creierul', ['inima', 'stomacul', 'plămânii'], 'Creierul conduce corpul.'],
      ['Ce au fructele și legumele, care ne ajută?', 'vitamine', ['plastic', 'nisip', 'gaze'], 'Vitaminele ne țin sănătoși.'],
      ['Ce mâncăm ca să avem oase puternice?', 'lapte, iaurt, brânză', ['doar bomboane', 'doar chipsuri', 'suc acidulat'], 'Lactatele ajută oasele.'],
      ['Ce faci când strănuți?', 'acoperi gura cu cotul sau cu un șervețel', ['strănuți spre colegi', 'nu faci nimic', 'strănuți în farfurie'], 'Așa nu răspândești microbii.'],
      ['De ce ne schimbăm hainele după sport?', 'pentru igienă (transpirăm)', ['ca să ne fie frig', 'ca să ne murdărim', 'nu e nevoie'], 'Igiena corpului ne ferește de boli.'],
      ['Cât timp ar trebui să facem mișcare pe zi?', 'cel puțin o oră', ['5 secunde', 'niciodată', 'doar o dată pe an'], 'Mișcarea zilnică ține corpul sănătos.'],
      ['Ce organ ne ajută să mestecăm?', 'dinții', ['urechile', 'plămânii', 'genunchii'], 'Dinții mărunțesc mâncarea.'],
      ['Cum ne ferim de răceală iarna?', 'ne îmbrăcăm gros și ne spălăm pe mâini', ['ieșim fără haine', 'mâncăm zăpadă', 'nu dormim'], 'Grija pentru corp ne ține sănătoși.']
    ]
  },
  {
    id: 'apa', name: 'Râul Apelor', emoji: '💧', color: '#3b7ddd', mission: 's3-pamant',
    sub: 'Apa, aerul, solul, circuitul apei, ploaia, vântul, fulgerul',
    facts: [
      ['🌍', 'Pământul este **mediul nostru de viață**: are **apă, aer și sol**.'],
      ['🏞️', 'Surse de apă: **izvoare, pâraie, râuri, lacuri, mări** și apa din pământ (**fântâni**). Apa curge din munte spre mare.'],
      ['🧊', 'Apa are 3 stări: **solidă** (gheață), **lichidă** (apă), **gazoasă** (vapori).'],
      ['☀️', '**Circuitul apei**: Soarele încălzește apa → se **evaporă** → vaporii urcă și se **condensează** în nori → cade **ploaie sau ninsoare** → apa ajunge iar în râuri și mări.'],
      ['⚡', 'Întâi **vedem fulgerul**, apoi **auzim tunetul**: lumina vine mai repede decât sunetul.'],
      ['🌬️', '**Vântul** este aerul care se mișcă. Iarna, din nori cade **ninsoare** (apă înghețată).']
    ],
    words: [['evaporare', 'apa se transformă în vapori, încălzită de Soare', '♨️'], ['condensare', 'vaporii se răcesc și se fac picături (nori, aburi pe geam)', '☁️'],
      ['circuitul apei', 'drumul apei: mare → nori → ploaie → râu → mare', '🔄'], ['izvor', 'locul unde apa iese din pământ', '⛲'], ['solul', 'stratul de pământ în care cresc plantele', '🟫'],
      ['precipitații', 'apa care cade din nori: ploaie, ninsoare, grindină', '🌧️'], ['fulger', 'lumina puternică din timpul furtunii', '⚡'], ['tunet', 'zgomotul care se aude după fulger', '🔊']],
    sort: { title: 'Solid, lichid sau gaz?', buckets: ['solid', 'lichid', 'gaz'], items: [['🧊 cubul de gheață', 0], ['❄️ fulgul de nea', 0], ['🪨 piatra', 0], ['🥛 laptele', 1], ['🌧️ picătura de ploaie', 1], ['🧃 sucul', 1], ['♨️ aburul de la ceai', 2], ['🎈 aerul din balon', 2], ['💨 vaporii din oala care fierbe', 2], ['🍯 mierea', 1], ['🔩 șurubul', 0]] },
    tf: [['Gheața este apă în stare solidă.', 1], ['Norii se formează prin condensarea vaporilor.', 1], ['Întâi auzim tunetul, apoi vedem fulgerul.', 0], ['Marea are apă dulce.', 0], ['Vântul este aer care se mișcă.', 1], ['Apa curge de la munte spre mare.', 1], ['Soarele încălzește apa și o face să se evapore.', 1], ['Ninsoarea cade vara, când e foarte cald.', 0]],
    bank: [
      ['Cum se numește trecerea apei din lichid în vapori?', 'evaporare (vaporizare)', ['topire', 'solidificare', 'condensare'], 'Apa lichidă devine vapori când se încălzește.'],
      ['Cum se numește apariția picăturilor pe un pahar rece?', 'condensare', ['topire', 'evaporare', 'solidificare'], 'Vaporii din aer se fac picături pe suprafața rece.'],
      ['Ce formează norii?', 'vaporii de apă care se condensează', ['fumul din coșuri', 'nisipul ridicat de vânt', 'zăpada topită'], 'Vaporii urcă, se răcesc și se condensează în nori.'],
      ['Ce auzim după fulger?', 'tunetul', ['curcubeul', 'grindina', 'vântul'], 'Zgomotul fulgerului este tunetul.'],
      ['De ce vedem fulgerul înainte să auzim tunetul?', 'lumina călătorește mai repede decât sunetul', ['tunetul e mai leneș', 'fulgerul e mai aproape mereu', 'nu e adevărat'], 'Lumina e mult mai rapidă decât sunetul.'],
      ['Care e o sursă de apă dulce?', 'izvorul', ['marea', 'oceanul', 'nisipul'], 'Apă dulce: izvoare, râuri, lacuri, ape subterane.'],
      ['Încotro curge apa unui râu?', 'de la munte spre câmpie și mare', ['de la mare spre munte', 'în cerc pe loc', 'în sus, spre nori'], 'Apa curge la vale, spre mare.'],
      ['Ce este vântul?', 'aer care se mișcă', ['apă înghețată', 'pământ uscat', 'lumină'], 'Vântul este aerul în mișcare.'],
      ['Ce cade din nori iarna, când e foarte frig?', 'ninsoarea', ['ploaia caldă', 'nisipul', 'frunzele'], 'Iarna apa din nori îngheață și cade ca zăpadă.'],
      ['În ce cresc plantele?', 'în sol', ['în nisipul mării', 'în aer', 'în piatră'], 'Solul are apă și hrană pentru plante.'],
      ['La ce folosim apa în casă?', 'la băut, spălat și gătit', ['doar la vopsit', 'doar la joacă', 'la nimic'], 'Apa e o resursă importantă: o folosim cu grijă.'],
      ['Ce încălzește apa mărilor, ca să se evapore?', 'Soarele', ['Luna', 'vântul rece', 'zăpada'], 'Căldura Soarelui pune în mișcare circuitul apei.'],
      ['Ce se întâmplă cu un om de zăpadă la soare?', 'se topește', ['se condensează', 'crește', 'se face piatră'], 'Topirea: solidul devine lichid.'],
      ['Ce se întâmplă cu apa pusă la congelator?', 'se solidifică (îngheață)', ['se evaporă', 'fierbe', 'dispare'], 'Solidificarea: lichidul devine solid.'],
      ['Ce este grindina?', 'bucăți de gheață care cad din nori', ['nisip din deșert', 'frunze uscate', 'vapori calzi'], 'Grindina e o precipitație: apă înghețată.'],
      ['Unde găsim cea mai multă apă pe Pământ?', 'în mări și oceane', ['în fântâni', 'în pahare', 'în nori'], 'Cea mai multă apă e în mări și oceane (apă sărată).'],
      ['Ce se întâmplă cu băltoaca după o zi cu soare?', 'apa se evaporă și băltoaca dispare', ['crește', 'îngheață', 'se face nisip'], 'Căldura Soarelui evaporă apa.'],
      ['De ce aburesc ochelarii când intri iarna în casă?', 'vaporii calzi se condensează pe sticla rece', ['ochelarii plâng', 'e ceață în casă', 'se topesc ochelarii'], 'Condensarea.'],
      ['Ce aduce ploaia pentru plante?', 'apa de care au nevoie', ['nisip', 'zgomot', 'fum'], 'Plantele iau apa din sol, adusă de ploaie.'],
      ['Ce fenomen se vede ca o lumină puternică pe cer în furtună?', 'fulgerul', ['curcubeul', 'tunetul', 'ceața'], 'Fulgerul se vede, tunetul se aude.']
    ]
  },
  {
    id: 'mediu', name: 'Muntele Curat', emoji: '♻️', color: '#23935a', mission: 's3-mediu',
    sub: 'Resurse naturale, poluarea și cum protejăm natura',
    facts: [
      ['🪵', '**Resursele naturale** vin din natură: **apă, lemn, sol, cărbune, petrol, minereuri**.'],
      ['🚱', 'Le folosim **cu grijă**: închidem robinetul, stingem lumina, nu tăiem pădurile fără să plantăm altele.'],
      ['🏭', '**Poluarea aerului**: fum de la fabrici și mașini. **Poluarea apei**: gunoaie și ulei aruncate în râuri.'],
      ['🗑️', '**Poluarea solului**: gunoaie aruncate pe jos, plastic care nu putrezește.'],
      ['♻️', '**Reciclăm**: hârtia, plasticul, sticla și metalul în coșuri separate.'],
      ['🌳', 'Copacii curăță aerul. **Plantăm copaci** și ocrotim animalele.']
    ],
    words: [['resurse naturale', 'bogății din natură: apă, lemn, cărbune, petrol', '🪵'], ['poluare', 'murdărirea aerului, apei sau solului', '🏭'], ['reciclare', 'refolosirea hârtiei, plasticului, sticlei', '♻️'],
      ['protecția mediului', 'grija pentru natură', '🌍'], ['deșeuri', 'gunoaie, resturi', '🗑️'], ['risipă', 'folosirea fără rost (apă, curent)', '🚰']],
    sort: { title: 'Ajută natura sau o poluează?', buckets: ['ajută natura', 'poluează'], items: [['🌳 plantez un copac', 0], ['♻️ arunc plasticul la reciclare', 0], ['🚲 merg cu bicicleta', 0], ['🚰 închid robinetul când mă spăl pe dinți', 0], ['💡 sting lumina când ies', 0], ['🗑️ arunc gunoaie în râu', 1], ['🛢️ vărs ulei în chiuvetă', 1], ['🔥 dau foc la frunze și plastic', 1], ['🚗 las mașina pornită degeaba', 1], ['🍬 arunc ambalajul pe stradă', 1]] },
    tf: [['Copacii curăță aerul.', 1], ['Uleiul aruncat în chiuvetă nu poluează.', 0], ['Hârtia se face din lemn.', 1], ['Plasticul putrezește într-o zi.', 0], ['Reciclăm hârtia, plasticul și sticla.', 1], ['Fumul mașinilor poluează aerul.', 1], ['Lăsăm robinetul deschis cât ne spălăm pe dinți.', 0], ['Lemnul este o resursă naturală.', 1]],
    bank: [
      ['Care este o resursă naturală?', 'lemnul din pădure', ['jucăria de plastic', 'caietul', 'televizorul'], 'Resursele naturale vin din natură.'],
      ['Ce poluează aerul?', 'fumul de la mașini și fabrici', ['copacii', 'ploaia', 'florile'], 'Fumul și gazele poluează aerul; copacii îl curăță.'],
      ['Ce facem ca să nu poluăm apa?', 'nu aruncăm gunoaie în râuri', ['spălăm mașina în râu', 'aruncăm uleiul în chiuvetă', 'lăsăm robinetul deschis'], 'Protejăm apa.'],
      ['Unde aruncăm sticla goală de plastic?', 'în coșul de reciclare pentru plastic', ['în râu', 'în pădure', 'pe stradă'], 'Plasticul se reciclează.'],
      ['Cum economisim apa?', 'închidem robinetul cât ne spălăm pe dinți', ['lăsăm apa să curgă', 'spălăm curtea zilnic cu furtunul', 'facem baie de 3 ori pe zi'], 'Apa nu trebuie risipită.'],
      ['Ce putem face pentru aer curat?', 'să plantăm copaci', ['să tăiem pădurile', 'să ardem plastic', 'să lăsăm mașinile pornite'], 'Copacii fac aerul curat.'],
      ['Din ce se face hârtia?', 'din lemn', ['din sticlă', 'din petrol', 'din fier'], 'Hârtia se face din lemnul copacilor: de aceea o reciclăm.'],
      ['Ce înseamnă să reciclezi?', 'să refolosești materialele (hârtie, plastic, sticlă)', ['să arunci totul la un loc', 'să cumperi mereu lucruri noi', 'să arzi gunoiul'], 'Reciclarea păstrează resursele.'],
      ['Ce poluează solul?', 'gunoaiele aruncate pe jos', ['frunzele căzute', 'ploaia', 'râmele'], 'Gunoaiele (mai ales plasticul) poluează solul.'],
      ['De unde vine petrolul?', 'din adâncul pământului', ['din copaci', 'din nori', 'din mare, ca sare'], 'Petrolul e o resursă scoasă din pământ.'],
      ['Ce putem face cu hârtia folosită?', 'o ducem la reciclare', ['o ardem în pădure', 'o aruncăm în râu', 'o lăsăm pe stradă'], 'Din hârtia reciclată se face hârtie nouă.'],
      ['De ce stingem lumina când ieșim din cameră?', 'ca să nu risipim curentul', ['ca să se odihnească becul', 'ca să fie frig', 'nu contează'], 'Economisim energia.'],
      ['Ce se întâmplă cu plasticul aruncat în natură?', 'rămâne acolo foarte mulți ani', ['dispare într-o zi', 'se face floare', 'devine apă'], 'Plasticul poluează mult timp.'],
      ['Ce ajută aerul să fie curat în oraș?', 'parcurile cu copaci', ['mai multe mașini', 'fumul', 'gunoaiele'], 'Plantele curăță aerul.'],
      ['Ce este o resursă care nu se termină ușor?', 'lumina Soarelui', ['petrolul', 'cărbunele', 'gazele din pământ'], 'Soarele și vântul nu se termină; petrolul și cărbunele, da.'],
      ['Cum putem merge la școală fără să poluăm?', 'pe jos sau cu bicicleta', ['cu mașina pornită toată ziua', 'cu avionul', 'cu un camion'], 'Mersul pe jos nu poluează.']
    ]
  },
  {
    id: 'corpuri', name: 'Atelierul Forțelor', emoji: '🧲', color: '#7B5CF6', mission: 's3-corpuri',
    sub: 'Corpuri, stări, metale, magneți, busola, forțe, mișcare',
    facts: [
      ['📦', 'Corpurile au **formă, culoare, lungime, masă, volum**; unele se pot **întinde** (elasticul).'],
      ['🥤', '**Solidele** au formă proprie; **lichidele** iau forma vasului; **gazele** ocupă tot spațiul.'],
      ['🔩', '**Metalele** (fier, cupru, aluminiu) sunt tari, strălucesc și **conduc căldura și curentul**.'],
      ['🧲', '**Magnetul** atrage fierul (cuie, agrafe). Acul **busolei** e un magnet care arată **nordul**.'],
      ['🍎', '**Gravitația**: Pământul atrage corpurile, de aceea cad în jos. **Frecarea** încetinește mișcarea.'],
      ['🚗', 'Forțele **pun în mișcare** sau **deformează** corpurile. Mișcarea are **distanță, durată și rapiditate**.']
    ],
    words: [['magnet', 'corp care atrage fierul', '🧲'], ['busolă', 'instrumentul care arată nordul', '🧭'], ['gravitație', 'Pământul atrage corpurile spre el', '🍎'],
      ['frecare', 'forța care încetinește un corp care alunecă', '🛷'], ['forță', 'ce împinge, trage sau deformează un corp', '💪'], ['metal', 'material tare, lucios, conduce căldura', '🔩'],
      ['masă', 'cât de greu este un corp (se măsoară cu cântarul)', '⚖️'], ['volum', 'cât spațiu ocupă un corp', '🧊'], ['topire', 'solidul devine lichid (gheața → apă)', '🫠'], ['solidificare', 'lichidul devine solid (apa → gheață)', '🧊']],
    sort: { title: 'Îl atrage magnetul?', buckets: ['da, îl atrage', 'nu'], items: [['📎 agrafa de metal', 0], ['🔩 cuiul de fier', 0], ['🔑 cheia de fier', 0], ['🥫 conserva de tablă', 0], ['✂️ foarfeca de oțel', 0], ['🪵 bucata de lemn', 1], ['🧸 jucăria de pluș', 1], ['🥤 paharul de plastic', 1], ['📄 foaia de hârtie', 1], ['🍎 mărul', 1], ['🧽 buretele', 1]] },
    tf: [['Magnetul atrage cuiele de fier.', 1], ['Magnetul atrage lemnul.', 0], ['Lichidele iau forma vasului.', 1], ['Busola arată nordul.', 1], ['Pe gheață frecarea e mare.', 0], ['Gravitația face ca mărul să cadă.', 1], ['Piatra este un corp gazos.', 0], ['Forța poate deforma plastilina.', 1]],
    bank: [
      ['În ce stare de agregare este apa din pahar?', 'lichidă', ['solidă', 'gazoasă'], 'Lichidele iau forma vasului.'],
      ['În ce stare de agregare este aerul din balon?', 'gazoasă', ['solidă', 'lichidă'], 'Gazele ocupă tot spațiul.'],
      ['Ce obiect este atras de magnet?', 'un cui de fier', ['o radieră', 'o lingură de lemn', 'o foaie de hârtie'], 'Magnetul atrage fierul.'],
      ['La ce folosește busola?', 'arată direcția nord', ['măsoară temperatura', 'arată ora', 'cântărește obiecte'], 'Acul busolei e un magnet.'],
      ['De ce cade mărul din copac în jos?', 'Pământul îl atrage (gravitația)', ['vântul îl împinge mereu', 'mărul vrea jos', 'magnetul din sol'], 'Gravitația atrage corpurile spre Pământ.'],
      ['De ce se oprește o minge care se rostogolește pe iarbă?', 'din cauza frecării', ['din cauza magnetului', 'din cauza luminii', 'pentru că obosește'], 'Frecarea o încetinește.'],
      ['Ce se întâmplă cu plastilina când o strângi?', 'se deformează', ['se topește', 'se evaporă', 'devine magnet'], 'Forțele pot deforma corpurile.'],
      ['Care metal este folosit la firele electrice?', 'cuprul', ['lemnul', 'sticla', 'cauciucul'], 'Metalele conduc curentul.'],
      ['Cu ce măsurăm masa unui pepene?', 'cu cântarul', ['cu rigla', 'cu termometrul', 'cu ceasul'], 'Masa se măsoară cu cântarul.'],
      ['Mașina A merge 100 m în 10 secunde, mașina B 100 m în 20 de secunde. Care e mai rapidă?', 'mașina A', ['mașina B', 'sunt la fel de rapide'], 'Mai rapid: aceeași distanță în timp mai scurt.'],
      ['Ce corp se poate întinde și revine la loc?', 'elasticul', ['piatra', 'paharul de sticlă', 'cuiul'], 'Elasticul se întinde și revine.'],
      ['Ce se întâmplă cu ciocolata ținută la soare?', 'se topește', ['îngheață', 'se condensează', 'devine magnet'], 'Căldura topește ciocolata.'],
      ['Când frecăm un balon de păr, el atrage bucățele de hârtie. Ce fel de interacțiune e?', 'electrică', ['magnetică', 'gravitațională', 'nicio interacțiune'], 'Frecarea îl încarcă electric.'],
      ['De ce alunecăm ușor pe gheață?', 'frecarea e mică', ['gheața e magnet', 'gravitația dispare', 'gheața e caldă'], 'Pe gheață frecarea e mică.'],
      ['Ce formă are apa turnată într-o sticlă?', 'forma sticlei', ['formă de cub mereu', 'forma unei mingi', 'nicio formă, dispare'], 'Lichidele iau forma vasului.'],
      ['Care e un corp în repaus?', 'cartea care stă pe masă', ['mașina care merge', 'mingea care zboară', 'apa care curge'], 'Repaus: corpul nu se mișcă.'],
      ['Ce instrument arată nordul în excursie?', 'busola', ['cântarul', 'rigla', 'termometrul'], 'Busola are un ac magnetic.'],
      ['Ce materiale atrage magnetul?', 'fierul și oțelul', ['lemnul și hârtia', 'sticla și plasticul', 'apa și aerul'], 'Magnetul atrage fierul (și oțelul, nichelul).'],
      ['De ce punem nisip pe gheață iarna?', 'ca să crească frecarea și să nu alunecăm', ['ca să se topească repede', 'ca să fie frumos', 'ca să facă zgomot'], 'Nisipul mărește frecarea.'],
      ['Ce se întâmplă cu o minge pe care o lovești?', 'se pune în mișcare', ['se topește', 'dispare', 'îngheață'], 'Forța pune corpurile în mișcare.'],
      ['Ce măsurăm în litri?', 'volumul unui lichid', ['lungimea băncii', 'masa unui măr', 'timpul'], 'Volumul lichidelor se măsoară în litri.'],
      ['Ce metal folosim la oale, fiindcă se încălzește repede?', 'aluminiul sau oțelul', ['lemnul', 'plasticul', 'cauciucul'], 'Metalele conduc bine căldura.']
    ]
  }
];

// circuitul apei: desenul la care atingi locul potrivit
export const CYCLE = [
  ['soare', 'Atinge ce încălzește apa ca să se evapore.', 'Soarele'],
  ['evap', 'Atinge săgețile unde apa se EVAPORĂ (urcă ca vapori).', 'evaporarea'],
  ['nor', 'Atinge locul unde vaporii se CONDENSEAZĂ.', 'norul'],
  ['ploaie', 'Atinge PRECIPITAȚIILE (apa care cade).', 'ploaia'],
  ['rau', 'Atinge râul care duce apa înapoi spre mare.', 'râul'],
  ['mare', 'Atinge marea, de unde pleacă din nou apa.', 'marea']
];

// generatoare pentru exerciții (fiecare ținut + cuvintele)
const allWords = REGIONS.flatMap((r) => r.words.map((w) => [...w, r.id]));
export const NATURA3 = Object.fromEntries([
  ...REGIONS.map((r) => ['n3' + r.id, () => fromBank(r.bank)]),
  ['n3cuvinte', () => {
    const [t, d] = pick(allWords), wrong = shuffle(allWords.filter((w) => w[0] !== t)).slice(0, 3).map((w) => w[1]);
    if (Math.random() < 0.5) return { text: `Ce înseamnă „${t}”?`, ans: d, opts: textOpts(d, wrong), steps: [`${t} = ${d}.`] };
    const wt = shuffle(allWords.filter((w) => w[0] !== t)).slice(0, 3).map((w) => w[0]);
    return { text: `Care cuvânt înseamnă: „${d}”?`, ans: t, opts: textOpts(t, wt), steps: [`${t} = ${d}.`] };
  }]
]);
export const WORDS = allWords;
