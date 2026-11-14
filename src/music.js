// Muzică de fundal compusă din cod (Web Audio): lo-fi chill pe insulă, mai alertă la fuga de monștri.
// Fără fișiere și fără drepturi de autor. Pornește după prima atingere (regula browserelor).
import { S, save } from './state.js';

let AC = null, master = null, bus = null, delay = null, timer = null, started = false;
let mode = 'chill', step = 0, nextT = 0, quiet = false;

const N = (m) => 440 * Math.pow(2, (m - 69) / 12); // notă MIDI → frecvență
// Temele muzicale. chords = acorduri (note MIDI), scale = notele melodiei, kick/snare = pașii (din 16) cu tobă,
// lead = timbrul melodiei, arp = arpegii (note rapide din acord), drums = false → fără tobe.
const SONGS = {
  chill:    { bpm: 76,  chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], scale: [72, 74, 76, 79, 81, 84], hat: 0.035, kick: [0, 10], snare: [8], mel: 0.28, lead: 'triangle' },
  playful:  { bpm: 104, chords: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]], scale: [72, 74, 76, 79, 81, 84], hat: 0.04, kick: [0, 8], snare: [4, 12], mel: 0.4, lead: 'square', arp: true },
  forest:   { bpm: 86,  chords: [[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], scale: [74, 76, 79, 81, 83, 86], hat: 0.03, kick: [0, 10], snare: [8], mel: 0.35, lead: 'sine' },
  castle:   { bpm: 92,  chords: [[50, 53, 57], [48, 52, 55], [46, 50, 53], [45, 49, 52]], scale: [69, 70, 72, 74, 76, 77], hat: 0.03, kick: [0, 6, 8], snare: [12], mel: 0.38, lead: 'sawtooth', arp: true },
  mountain: { bpm: 80,  chords: [[57, 60, 64], [52, 55, 59], [53, 57, 60], [48, 52, 55]], scale: [76, 79, 81, 84, 86, 88], hat: 0.025, kick: [0], snare: [8], mel: 0.25, lead: 'sine', pad: true },
  arena:    { bpm: 112, chords: [[48, 51, 55], [44, 48, 51], [51, 55, 58], [46, 50, 53]], scale: [67, 70, 72, 75, 77, 79], hat: 0.05, kick: [0, 4, 8, 12], snare: [4, 12], mel: 0.42, lead: 'sawtooth', arp: true },
  mission:  { bpm: 108, chords: [[53, 57, 60], [55, 59, 62], [52, 55, 59], [57, 60, 64]], scale: [72, 74, 76, 77, 79, 81], hat: 0.045, kick: [0, 7, 8], snare: [4, 12], mel: 0.3, lead: 'triangle', arp: true },
  think:    { bpm: 68,  chords: [[48, 52, 55, 59], [53, 57, 60, 64]], scale: [72, 76, 79, 83], hat: 0, kick: [], snare: [], mel: 0.18, lead: 'sine', drums: false, pad: true },
  test:     { bpm: 96,  chords: [[57, 60, 64], [50, 53, 57], [52, 56, 59], [57, 60, 64]], scale: [69, 72, 76, 81], hat: 0.04, kick: [0], snare: [], mel: 0.15, lead: 'sine', tick: true },
  boss:     { bpm: 130, chords: [[52, 55, 59], [48, 52, 55], [50, 54, 57], [47, 51, 54]], scale: [64, 67, 69, 71, 74, 76], hat: 0.06, kick: [0, 4, 8, 12], snare: [4, 12], mel: 0.5, lead: 'sawtooth', arp: true },
  chase:    { bpm: 132, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], scale: [69, 72, 74, 76, 79, 81], hat: 0.06, kick: [0, 4, 8, 12], snare: [4, 12], mel: 0.5, lead: 'square', arp: true }
};

function setup() {
  AC = new (window.AudioContext || window.webkitAudioContext)();
  master = AC.createGain(); master.gain.value = 0; master.connect(AC.destination);
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(master);
  bus = AC.createGain(); bus.gain.value = 1; bus.connect(lp);
  // ecou blând pentru melodie
  delay = AC.createDelay(1); delay.delayTime.value = 0.33; const fb = AC.createGain(); fb.gain.value = 0.28; const wet = AC.createGain(); wet.gain.value = 0.25;
  delay.connect(fb).connect(delay); delay.connect(wet).connect(lp);
  // zgomot pentru cinele (hi-hat) și pentru „pârâitul” de vinil
  const len = AC.sampleRate; const buf = AC.createBuffer(1, len, AC.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AC.noise = buf;
}
const env = (g, t, a, peak, dec, sus, rel) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sus), t + a + dec); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec + rel); };

function keys(notes, t, dur) { // pian electric moale
  for (const m of notes) for (const [type, det, vol] of [['sine', 0, 0.06], ['triangle', 4, 0.025]]) {
    const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = N(m); o.detune.value = det;
    env(g, t, 0.03, vol, 0.4, vol * 0.4, dur); o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.6);
  }
}
function bass(m, t, dur) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = N(m - 12); env(g, t, 0.02, 0.12, 0.2, 0.06, dur); o.connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.3); }
function kick(t) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.18); env(g, t, 0.005, 0.32, 0.12, 0.05, 0.12); o.connect(g).connect(bus); o.start(t); o.stop(t + 0.35); }
function noiseHit(t, vol, hp, dur) { const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = AC.noise; f.type = 'highpass'; f.frequency.value = hp; env(g, t, 0.003, vol, dur, vol * 0.1, 0.05); s.connect(f).connect(g).connect(bus); s.start(t, Math.random()); s.stop(t + dur + 0.1); }
function melody(m, t, dur, wave = 'triangle', vol = 0.05) { const o = AC.createOscillator(), g = AC.createGain(); o.type = wave; o.frequency.value = N(m); env(g, t, 0.02, vol, 0.25, vol * 0.4, dur); o.connect(g); g.connect(bus); g.connect(delay); o.start(t); o.stop(t + dur + 0.5); }

let lastMel = 76;
function schedule() { while (nextT < AC.currentTime + 0.25) scheduleStep(); }
function scheduleStep() {
  const song = SONGS[mode], s16 = 60 / song.bpm / 4;
  {
    const bar = Math.floor(step / 16) % song.chords.length, pos = step % 16, ch = song.chords[bar], t = nextT;
    const sharp = song.lead === 'sawtooth' || song.lead === 'square', lv = sharp ? 0.025 : 0.05;
    if (pos === 0) { keys(ch, t, s16 * (song.pad ? 16 : 15)); bass(ch[0], t, s16 * 6); }
    if (pos === 8) bass(ch[0] + (song.bpm > 100 ? 0 : 7), t, s16 * 5);
    if (song.drums !== false) {
      if (song.kick.includes(pos)) kick(t);
      if (song.snare.includes(pos)) noiseHit(t, 0.06, 1800, 0.12);
      if (song.hat && pos % 2 === 0) noiseHit(t + (pos % 4 === 2 ? s16 * 0.15 : 0), song.hat * (pos % 4 === 2 ? 1 : 0.6), 7000, 0.04); // swing ușor
    }
    if (song.tick && pos % 4 === 0) noiseHit(t, 0.05, 5000, 0.02); // ca un ceas, la test
    if (song.arp && pos % 2 === 1) melody(ch[(pos >> 1) % ch.length] + 12, t, s16 * 1.2, song.lead, lv * 0.6); // arpegii
    if (pos % 2 === 0 && Math.random() < song.mel) { // melodie din notele potrivite
      const opts = song.scale.filter((n) => Math.abs(n - lastMel) <= 5); lastMel = opts[Math.floor(Math.random() * opts.length)] || song.scale[2];
      melody(lastMel, t, s16 * (Math.random() < 0.5 ? 2 : 3), song.lead, lv);
    }
    nextT += s16; step++;
  }
}
function targetVol() { return S.music === false ? 0 : (quiet ? 0.26 : 0.45); }
function applyVol(sec = 1.2) { if (!master) return; const t = AC.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(targetVol(), t + sec); }

export const Music = {
  start() {
    if (started) return; started = true;
    try { setup(); } catch (e) { return; }
    nextT = AC.currentTime + 0.1; timer = setInterval(schedule, 90); applyVol(3);
    document.addEventListener('visibilitychange', () => { if (!AC) return; document.hidden ? AC.suspend() : AC.resume(); });
  },
  setMode(m) {
    if (m === mode || !SONGS[m] || this._pending === m) return;
    this._pending = m;
    if (!AC) { mode = m; this._pending = null; return; }
    const t = AC.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0.0001, t + 0.45);
    setTimeout(() => { mode = this._pending || m; this._pending = null; step = 0; nextT = AC.currentTime + 0.05; applyVol(0.9); }, 480);
  },
  setQuiet(q) { if (q === quiet) return; quiet = q; applyVol(0.8); },
  toggle() { S.music = S.music === false; save(); if (S.music && !started) this.start(); applyVol(0.5); return S.music; },
  on: () => S.music !== false
};
// pornește la prima atingere sau tastă (browserele nu permit sunet înainte)
const kick0 = () => { if (S.music !== false) Music.start(); removeEventListener('pointerdown', kick0); removeEventListener('keydown', kick0); };
addEventListener('pointerdown', kick0); addEventListener('keydown', kick0);

/** Doar pentru verificare: compune offline câteva secunde și întoarce un WAV (base64). */
export async function renderOffline(m = 'chill', sec = 20) {
  const saved = { AC, master, bus, delay, mode, step, nextT };
  const off = new OfflineAudioContext(2, Math.ceil(44100 * sec), 44100);
  AC = off; master = off.createGain(); master.gain.value = 0.32; master.connect(off.destination);
  const lp = off.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(master);
  bus = off.createGain(); bus.connect(lp);
  delay = off.createDelay(1); delay.delayTime.value = 0.33; const fb = off.createGain(); fb.gain.value = 0.28; const wet = off.createGain(); wet.gain.value = 0.25; delay.connect(fb).connect(delay); delay.connect(wet).connect(lp);
  const buf = off.createBuffer(1, 44100, 44100); const d = buf.getChannelData(0); for (let i = 0; i < 44100; i++) d[i] = Math.random() * 2 - 1; off.noise = buf;
  mode = m; step = 0; nextT = 0.05;
  const song = SONGS[m], s16 = 60 / song.bpm / 4;
  while (nextT < sec - 1) scheduleStep();
  const out = await off.startRendering();
  Object.assign({ AC, master, bus, delay, mode, step, nextT }, saved); ({ AC, master, bus, delay, mode, step, nextT } = saved);
  const ch = [out.getChannelData(0), out.getChannelData(1)], n = out.length, b = new DataView(new ArrayBuffer(44 + n * 4));
  const w = (o, s) => [...s].forEach((c, i) => b.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); b.setUint32(4, 36 + n * 4, true); w(8, 'WAVEfmt '); b.setUint32(16, 16, true); b.setUint16(20, 1, true); b.setUint16(22, 2, true); b.setUint32(24, 44100, true); b.setUint32(28, 44100 * 4, true); b.setUint16(32, 4, true); b.setUint16(34, 16, true); w(36, 'data'); b.setUint32(40, n * 4, true);
  for (let i = 0; i < n; i++) for (let c = 0; c < 2; c++) b.setInt16(44 + i * 4 + c * 2, Math.max(-1, Math.min(1, ch[c][i])) * 32767, true);
  let bin = ''; const u8 = new Uint8Array(b.buffer); for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  void s16; return btoa(bin);
}
if (location.hostname === 'localhost') window.__music = { renderOffline };
