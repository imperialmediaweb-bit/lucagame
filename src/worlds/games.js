// Bucăți de joc refolosibile în lumile mici: plaza cu ieșire, „adună / ajută”, „alege drumul”.
import { S, save, G } from '../state.js';
import { GEN, typesFor } from '../content/missions.js';
import { shuffle, pick } from '../content/util.js';
import { diagnose } from '../mistakes.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function worldBase(ctx, K, id, O) {
  const X = (x) => O.x + x, Z = (z) => O.z + z;
  const st = (def) => { S.worlds = S.worlds || {}; return (S.worlds[id] = S.worlds[id] || { paid: {}, ...def }); };
  const triggers = [];
  const trig = (x, z, r, on, y = 0.5, dy) => { const t = { x: X(x), z: Z(z), r, on, y, dy }; triggers.push(t); return t; };
  const typesOf = (list, subject) => { const g = G() === 3 ? list : typesFor(G(), subject); return g && g.length ? g : typesFor(G(), 'mix'); };
  const reward = (M, key, coins, msg, after) => {
    ctx.SFX.fanfare(); ctx.confetti(); ctx.cheer();
    if (!M.paid[key]) { M.paid[key] = 1; S.coins += coins; ctx.toast(`${msg} +${coins} monede!`); } else ctx.toast(msg);
    save(); ctx.refreshHud(); after && after();
  };
  const fence = (color) => [[0, -103, 210, 1], [0, 103, 210, 1], [-103, 0, 1, 210], [103, 0, 1, 210]].forEach(([x, z, w, d]) => K.box(x, 1.5, z, w, 3, d, color));
  // ieșirea spre Mintoria
  const exit = (x, z) => {
    K.cyl(x, 0.12, z, 3.2, 0.25, '#2EC4A6', { glow: 0.2 });
    const ring = K.cyl(x, 1.7, z, 3.2, 0.2, '#2EC4A6', { glow: 0.4 }); ring.rotation.x = Math.PI / 2;
    K.label('Înapoi în Mintoria', '', '#2EC4A6', 3.2, x, 3.8, z);
    trig(x, z, 1.4, () => ctx.backHub());
    return ring;
  };
  const sign = (x, z, txt, color) => { K.cyl(x, 1.5, z, 0.3, 3, '#5d4a3a', { collide: true }); K.label(txt, '', color, 4.4, x, 3.8, z); };

  /* „adună / ajută”: fiecare obiect se rezolvă cu o întrebare; la final, recompensă */
  function collect({ key, items, types, title, done, msgOk, msgBad, msgAll, coins, onSolve, state }) {
    const M = state();
    M[key] = M[key] || [];
    items.forEach((it, i) => trig(it.x, it.z, it.r || 1.9, () => {
      if (M[key].includes(i)) { if (it.again) ctx.toast(it.again); return; }
      ctx.askOne(types(), `${title} ${M[key].length + 1} din ${items.length}`, (ok) => {
        if (!ok) { if (ok === false) ctx.toast(msgBad); return; }
        M[key].push(i); save(); ctx.SFX.coin(); onSolve && onSolve(it, i);
        if (M[key].length === items.length) reward(M, key, coins, msgAll, done); else { ctx.toast(`${msgOk} ${M[key].length} din ${items.length}`); done && done(); }
      });
    }, it.y || 0.5));
    return () => M[key].length;
  }

  /* „alege drumul”: întrebarea sus, variantele pe 3 porți; treci prin poarta bună */
  function paths({ key, stages, types, title, banner, state, onDone, coins, msgAll, gateColor = '#2f8f46' }) {
    const M = state(); M[key] = M[key] || 0;
    let Q = null, lbls = [];
    function next() {
      lbls.forEach((l) => l.dispose()); lbls = [];
      const r = M[key]; if (r >= stages.length) { Q = null; return; }
      const q = GEN[pick(types())](), wrong = shuffle(q.opts.filter((o) => o !== q.ans)).slice(0, 2), opts = shuffle([q.ans, ...wrong]);
      Q = { q, opts, r };
      stages[r].gates.forEach((g, i) => { if (opts[i] !== undefined) lbls.push(K.label(String(opts[i]), '', gateColor, 3.6, g.x, g.y || 2.7, g.z)); });
      banner.innerHTML = `<small>${esc(title)} · ${r + 1} din ${stages.length}</small><b>${esc(q.text)}${q.expr ? ' <span>' + esc(q.expr) + '</span>' : ''}</b><em>Treci prin poarta cu răspunsul corect.</em>`;
    }
    stages.forEach((s, ri) => s.gates.forEach((g, gi) => trig(g.x, g.tz ?? g.z, 1.2, () => {
      if (!Q || Q.r !== ri || Q.opts[gi] === undefined) return;
      const chosen = Q.opts[gi], q = Q.q;
      if (chosen === q.ans) {
        M[key] = ri + 1; save(); ctx.SFX.star();
        if (ri + 1 === stages.length) { Q = null; lbls.forEach((l) => l.dispose()); reward(M, key, coins, msgAll, onDone); }
        else { ctx.toast('Drumul bun! Mergi mai departe.'); next(); }
      } else {
        ctx.SFX.no();
        const why = (q.why && q.why[chosen]) || diagnose(q, chosen);
        ctx.info(`<div class="eyebrow">Poarta greșită</div><h2>Ai ales: ${esc(chosen)}</h2>${why ? `<div class="fb no"><b>Unde ai greșit:</b> ${esc(why)}</div>` : ''}<p><b>Răspunsul corect: ${esc(q.ans)}</b></p><ol>${(q.steps || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol><p>Te întorci puțin, cu o întrebare nouă.</p>`);
        ctx.teleport(X(s.back.x), Z(s.back.z)); next();
      }
    }, g.y ? g.y - 2.2 : 0.5)));
    next();
    return { reset: () => { M[key] = 0; save(); next(); }, current: () => Q && { opts: Q.opts, ans: Q.q.ans, r: Q.r }, active: () => !!Q };
  }

  return { X, Z, st, triggers, trig, typesOf, reward, fence, exit, sign, collect, paths };
}

// bannerul cu întrebarea, sus pe ecran (folosit de „alege drumul”)
export function makeBanner(id) { const b = document.createElement('div'); b.id = id; b.className = 'wq'; b.hidden = true; document.body.appendChild(b); return b; }
