// Sunete generate (fără fișiere), pornesc după prima atingere.
import { S } from './state.js';
let AC = null;
function tone(f, d, when = 0, type = 'triangle', vol = 0.18) {
  if (S.mute) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + when;
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
    o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d);
  } catch (e) { /* fără sunet */ }
}
export const SFX = {
  ok() { tone(523, 0.15); tone(659, 0.15, 0.1); tone(784, 0.25, 0.2); },
  no() { tone(220, 0.2, 0, 'sawtooth', 0.07); tone(170, 0.3, 0.15, 'sawtooth', 0.07); },
  coin() { tone(988, 0.08, 0, 'square', 0.05); tone(1319, 0.15, 0.07, 'square', 0.05); },
  star() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.25, i * 0.12)); },
  jump() { tone(330, 0.12, 0, 'sine', 0.08); tone(500, 0.1, 0.05, 'sine', 0.06); },
  boing() { tone(200, 0.1, 0, 'sine', 0.12); tone(600, 0.25, 0.06, 'sine', 0.1); },
  tap() { tone(660, 0.05, 0, 'sine', 0.07); },
  talk() { tone(440, 0.06, 0, 'square', 0.04); tone(550, 0.06, 0.07, 'square', 0.04); },
  fanfare() { [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, i * 0.13)); }
};
