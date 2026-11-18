// FisApp "Así de fácil" (9:16): pure function of time. window.seek(t) paints frame t.
// 120 bpm (0.5 s/beat), 68 beats. VO: Chris (ElevenLabs), placed by audio/place_vo.py -> vo.json.
// Identity: the FisApp dot is a character ("Punto") who guides the three steps; a 1-2-3 tracker.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, ring, shake, font, layout, glyph, text, fill, rrect, mix, bump, hash01, noise1 } = M;

const C = {
  night: '#17142B', ink: '#262337', paper: '#F8F9FC', lav: '#EFEAFF',
  purple: '#6C5CE7', lilac: '#A78BFA', pale: '#E2DBFF', white: '#FFFFFF', muted: '#8A8999', green: '#2D9D6F',
};
const D = 'Display', UI = 'UI';
const S = FORMAT.safe;            // 72..1008 x, 250..1490 y
const CX = W / 2;

const CROPS = {
  step1: ['s05', [62, 275, 750, 413]],
  polizas: ['s04', [1280, 464, 336, 172]],
  chart: ['s04', [1280, 673, 1057, 370]],
  ai: ['s06', [1662, 1048, 756, 328]],
  nube: ['s06', [862, 1048, 756, 328]],
  rfc: ['s06', [62, 1048, 756, 328]],
  dash: ['s02', [1339, 227, 1036, 734]],
  balanza: ['s01', [1608, 240, 700, 531]],
  cta: ['s08', [697, 122, 422, 106]],
  tagline: ['s08', [812, 288, 576, 55]],
};

const HITS = [
  [0, 'hook', 'impact'],
  [0.4, 'chip', 'tok', { pitch: 'C5' }], [0.8, 'chip', 'tok', { pitch: 'E5' }], [1.2, 'chip', 'tok', { pitch: 'G5' }],
  [1.6, 'chip', 'tok', { pitch: 'C6' }], [2.0, 'chip', 'tok', { pitch: 'D5' }], [2.4, 'chip', 'tok', { pitch: 'A5' }],
  [3.0, 'complicada', 'thud'],
  [4.9, 'mira esto', 'boing', { pitch: 'C5', to: 'C6' }],
  [5.2, 'pila vuela', 'whoosh', { len: 0.5 }],
  [8, 'drop', 'impact'],
  [8.2, 'tracker', 'blip', { pitch: 'A5' }],
  [9.0, 'paso 1 card', 'thud'],
  [12.6, 'e.firma', 'bell', { pitch: 'E6' }],
  [14.1, 'swap a dash', 'whoosh', { len: 0.4, from: 2400, to: 600 }],
  [14.4, 'dash', 'thud'],
  [15.0, 'xml', 'type', { len: 3.2 }],
  [19.8, 'solito', 'bell', { pitch: 'A6' }],
  [21.75, 'whip paso 2', 'whoosh', { len: 0.4, from: 600, to: 2400 }],
  [22.1, 'tracker 2', 'blip', { pitch: 'C6' }],
  [24.65, 'clic', 'click'], [24.65, 'clic bell', 'bell', { pitch: 'E6' }],
  [26.4, 'polizas', 'coins'],
  [29.1, 'balanza', 'thud'],
  [30.75, 'whip paso 3', 'whoosh', { len: 0.4 }],
  [31.1, 'tracker 3', 'blip', { pitch: 'E6' }],
  [32.2, 'barras', 'riser', { len: 0.6 }],
  [35.3, 'estados', 'pop', { pitch: 'A5' }], [37.7, 'diot', 'pop', { pitch: 'C6' }], [38.6, 'reportes', 'pop', { pitch: 'E6' }],
  [41.6, 'LISTO', 'impact'],
  [43.0, 'whip ai', 'whoosh', { len: 0.4, from: 2400, to: 600 }],
  [43.6, 'burbuja', 'type', { len: 1.4 }],
  [46.4, 'ai card', 'thud'],
  [49.75, 'whip nube', 'whoosh', { len: 0.4 }],
  [50.4, 'nube', 'swell', { len: 0.6 }],
  [51.0, 'nube card', 'thud'], [52.6, 'rfc card', 'thud'],
  [56.25, 'punto cae', 'boing', { pitch: 'G5', to: 'C5' }],
  [56.7, 'checks', 'blip', { pitch: 'A5' }], [56.9, 'checks', 'blip', { pitch: 'C6' }], [57.1, 'checks', 'blip', { pitch: 'E6' }],
  [57.4, 'wordmark', 'bell', { pitch: 'A6' }],
  [60.3, 'CTA', 'pop', { pitch: 'A5' }],
  [64, 'cierre', 'impact'],
];

// ------------------------------------------------------------------ helpers
let IMG = {};
function popWord(ctx, str, x, y, size, color, u, u0, o = {}) {
  const f = font(size, o.weight || 800, o.fam || D), tr = (o.track ?? -0.035) * size;
  const L = layout(ctx, str, f, tr);
  const x0 = o.align === 'center' ? x - L.width / 2 : o.align === 'right' ? x - L.width : x;
  const n = L.glyphs.length;
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * (o.stagger ?? 0.022), o.spring || SPRING.bouncy);
    if (k <= 0.002) return;
    const col = typeof color === 'function' ? color(j, n) : color;
    glyph(ctx, g.ch, x0 + g.cx, y + (1 - k) * size * 0.55, f, col, k, k);
  });
  return L;
}
function card(ctx, key, cx, cy, w, o = {}) {
  const [ik, [sx, sy, sw, sh]] = CROPS[key];
  const img = IMG[ik]; const h = w * sh / sw; const r = o.r ?? 30;
  if (!img) return h;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(o.s ?? 1, o.s ?? 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) {
    ctx.shadowColor = o.shadowColor || 'rgba(38,35,55,0.28)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
    rrect(ctx, -w / 2, -h / 2, w, h, r); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.shadowColor = 'transparent';
  }
  rrect(ctx, -w / 2, -h / 2, w, h, r); ctx.clip();
  ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
  ctx.restore();
  return h;
}
function dot(ctx, x, y, r, color = C.purple) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); }
function softGlow(ctx, x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(0.5, color + '66'); g.addColorStop(1, color + '00');
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
}
const appGrad = (j, n) => mix(C.purple, C.lilac, n > 1 ? j / (n - 1) : 0);
const logR = (a, b, p) => a * (b / a) ** p;
function checkMark(ctx, x, y, s, k, bg = C.purple, fg = C.white) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  dot(ctx, 0, 0, s, bg);
  ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = fg;
  ctx.beginPath(); ctx.moveTo(-s * 0.42, 0); ctx.lineTo(-s * 0.1, s * 0.32); ctx.lineTo(s * 0.45, -s * 0.33); ctx.stroke();
  ctx.restore();
}
// A pill chip with a label. style: 'solid' | 'outline' | 'ghost'
function chip(ctx, label, x, y, size, k, o = {}) {
  if (k <= 0.002) return;
  const f = font(size, o.weight || 800, o.fam || D); const L = layout(ctx, label, f, -0.02 * size);
  const pw = L.width + size * 1.0 + (o.check ? size * 1.1 : 0), ph = size * 1.55;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(k, k);
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(38,35,55,0.22)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12; }
  rrect(ctx, -pw / 2, -ph / 2, pw, ph, o.r ?? ph / 2);
  ctx.fillStyle = o.bg || C.white; ctx.fill(); ctx.shadowColor = 'transparent';
  if (o.stroke) { ctx.lineWidth = 4; ctx.strokeStyle = o.stroke; ctx.stroke(); }
  const tx = o.check ? size * 0.55 : 0;
  text(ctx, label, tx, size * 0.36, f, o.fg || C.purple, 'center', -0.02 * size);
  if (o.check) checkMark(ctx, -pw / 2 + size * 0.95, 0, size * 0.48, 1, o.fg === C.white ? C.white : C.purple, o.fg === C.white ? C.purple : C.white);
  ctx.restore();
}

// ------------------------------------------------------------------ Punto, the mascot
// look: [-1..1, -1..1]; blink 0..1 closed; mood: 'happy' | 'worried' | 'neutral'
const BLINKS = [2.2, 6.6, 11.3, 17.4, 23.2, 27.6, 34.5, 39.2, 44.6, 48.2, 53.4, 58.9, 62.7, 66.1];
function blinkAt(u) { let b = 0; for (const c of BLINKS) b = Math.max(b, bump(u, c, 0.18)); return b; }
function punto(ctx, x, y, R, u, o = {}) {
  const sq = o.squash || 0;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(1 + sq, 1 - sq);
  // body: purple with a soft lilac highlight
  const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
  g.addColorStop(0, '#8E7CF5'); g.addColorStop(1, C.purple);
  ctx.shadowColor = 'rgba(80,60,200,0.35)'; ctx.shadowBlur = R * 0.6; ctx.shadowOffsetY = R * 0.25;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  if (R > 22 && (o.eyes ?? 1) > 0) {
    const [lx, ly] = o.look || [0, 0];
    const bl = Math.max(o.blink ?? blinkAt(u), 0);
    const ex = R * 0.34, ey = -R * 0.12, er = R * 0.2;
    ctx.globalAlpha = o.eyes ?? 1;
    for (const s of [-1, 1]) {
      ctx.save(); ctx.translate(s * ex + lx * R * 0.1, ey + ly * R * 0.08);
      if (o.mood === 'happy' && bl < 0.5) {   // ^ ^ eyes
        ctx.lineWidth = R * 0.09; ctx.lineCap = 'round'; ctx.strokeStyle = C.white;
        ctx.beginPath(); ctx.arc(0, er * 0.4, er * 0.8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
      } else {
        ctx.scale(1, Math.max(0.08, 1 - bl) * (o.mood === 'worried' ? 0.85 : 1));
        ctx.beginPath(); ctx.ellipse(0, 0, er * 0.85, er * 1.1, 0, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
        ctx.beginPath(); ctx.arc(lx * er * 0.35, ly * er * 0.4, er * 0.48, 0, Math.PI * 2); ctx.fillStyle = C.night; ctx.fill();
        ctx.beginPath(); ctx.arc(lx * er * 0.35 - er * 0.15, ly * er * 0.4 - er * 0.18, er * 0.15, 0, Math.PI * 2); ctx.fillStyle = C.white; ctx.fill();
      }
      ctx.restore();
      if (o.mood === 'worried') {   // tilted brows
        ctx.save(); ctx.lineWidth = R * 0.07; ctx.lineCap = 'round'; ctx.strokeStyle = C.white;
        ctx.beginPath(); ctx.moveTo(s * ex - er * 0.9, ey - er * 1.55 + (s > 0 ? -er * 0.3 : 0)); ctx.lineTo(s * ex + er * 0.9, ey - er * 1.55 + (s > 0 ? 0 : -er * 0.3)); ctx.stroke(); ctx.restore();
      }
    }
    // mouth
    ctx.lineWidth = R * 0.07; ctx.lineCap = 'round'; ctx.strokeStyle = C.white; ctx.beginPath();
    if (o.mood === 'worried') { ctx.moveTo(-R * 0.16, R * 0.38); ctx.quadraticCurveTo(0, R * 0.28, R * 0.16, R * 0.38); }
    else { const w = o.mood === 'happy' ? 0.24 : 0.16; ctx.moveTo(-R * w, R * 0.3); ctx.quadraticCurveTo(0, R * (o.mood === 'happy' ? 0.52 : 0.42), R * w, R * 0.3); }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

// ------------------------------------------------------------------ the 1-2-3 tracker
const TX = [CX - 260, CX, CX + 260], TY = 320;
function tracker(ctx, u, active, uOn, dark) {
  const k0 = springU(u, uOn, SPRING.snappy);
  if (k0 <= 0) return;
  const line = dark ? 'rgba(255,255,255,0.28)' : '#DCD5FB';
  const fillC = dark ? C.white : C.purple;
  ctx.save(); ctx.globalAlpha = clamp(k0);
  ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.strokeStyle = line; ctx.beginPath(); ctx.moveTo(TX[0], TY); ctx.lineTo(TX[2], TY); ctx.stroke();
  // progress fill
  const pf = active.progress;
  if (pf > 0) { ctx.strokeStyle = fillC; ctx.beginPath(); ctx.moveTo(TX[0], TY); ctx.lineTo(lerp(TX[0], TX[2], clamp(pf / 2)), TY); ctx.stroke(); }
  for (let i = 0; i < 3; i++) {
    const kn = springU(u, uOn + i * 0.12, SPRING.bouncy);
    const on = active.nodes[i];        // 0..1 activation
    const done = active.done ? active.done[i] : 0;
    ctx.save(); ctx.translate(TX[i], TY); ctx.scale(kn * (1 + 0.25 * on * (1 - (active.settle?.[i] ?? 1))), kn * (1 + 0.25 * on * (1 - (active.settle?.[i] ?? 1))));
    dot(ctx, 0, 0, 40, on > 0.5 ? fillC : (dark ? C.night : C.white));
    ctx.lineWidth = 6; ctx.strokeStyle = on > 0.5 ? fillC : line; ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.stroke();
    if (done > 0) checkMark(ctx, 0, 0, 40, done, fillC, dark ? C.purple : C.white);
    else text(ctx, String(i + 1), 0, 15, font(44, 800, D), on > 0.5 ? (dark ? C.purple : C.white) : (dark ? 'rgba(255,255,255,0.6)' : C.lilac), 'center');
    ctx.restore();
  }
  ctx.restore();
}
function trackerState(u, step) {
  const nodes = [0, 1, 2].map((i) => (i < step ? 1 : 0));
  const settle = [0, 1, 2].map((i) => clamp(springU(u, STEP_ON[i], SPRING.wobbly)));
  const p = step >= 1 ? lerp(step - 2, step - 1, springU(u, STEP_ON[step - 1], SPRING.gentle)) : 0;
  return { nodes, settle, progress: Math.max(0, p) };
}
const STEP_ON = [8.1, 22.1, 31.1];
// Big outlined step numeral in the background
function bigNumeral(ctx, n, u, u0, color) {
  const k = springU(u, u0, SPRING.gentle);
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = 0.16 * clamp(k);
  ctx.font = font(1150, 800, D); ctx.lineWidth = 10; ctx.strokeStyle = color; ctx.textAlign = 'right';
  ctx.strokeText(String(n), W + 120 - (1 - k) * -200 - (u - u0) * 6, 1500);
  ctx.restore();
}
function label(ctx, str, x, y, u, u0, color) {
  const k = E.outQuint(prog(u, u0, u0 + 0.5)); if (k <= 0) return;
  ctx.globalAlpha = k; text(ctx, str, x, y + (1 - k) * 20, font(46, 700, UI), color, 'left', 6); ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ S1 hook (0..8): the paperwork pile
const PILE = [
  ['XML', -250, 1240, -0.18], ['PÓLIZAS', 120, 1260, 0.1], ['DIOT', 330, 1150, 0.3], ['IVA', -330, 1120, -0.35],
  ['CFDI', -60, 1130, 0.05], ['BALANZA', 200, 1030, -0.12], ['ISR', -230, 1010, 0.22], ['XML', 40, 930, -0.3],
];
function sceneHook(ctx, u) {
  fill(ctx, C.lav);
  softGlow(ctx, W * 0.85, H * 0.15, 700, '#D6CCFF', 1);
  softGlow(ctx, W * 0.1, H * 0.9, 700, '#E0D8FF', 1);
  const fly = prog(u, 5.15, 6.4);
  // the pile drops in, one chip at a time, then explodes away on "Mira esto"
  PILE.forEach(([l, dx, y, rot], i) => {
    const u0 = -0.55 + i * 0.3;
    const k = springU(u, u0, SPRING.bouncy);
    if (k <= 0) return;
    const ang = Math.atan2(y - 1150, dx || 1), sp = E.inCubic(fly) * 1800;
    const x = CX + dx + Math.cos(ang) * sp, yy = lerp(-200, y, k) + Math.sin(ang) * sp - (fly > 0 ? 400 * Math.sin(Math.PI * fly) : 0);
    chip(ctx, l, x, yy, 54, 1, { rot: rot + fly * (i % 2 ? 3 : -3), bg: C.white, fg: C.ink, stroke: '#D9D1FA' });
  });
  // Punto, worried beside the pile, then cheerful
  const enter = springU(u, -0.4, SPRING.gentle);
  const hop = Math.max(0, Math.sin(Math.PI * prog(u, 4.75, 5.35))) * 160;
  const worried = u > 2.8 && u < 4.8;
  const px = lerp(-150, 830, enter), py = 1400 - hop;
  const look = u < 4.8 ? [-0.9, -0.5] : [0, -0.2];
  const grow = E.inCubic(prog(u, 6.7, 8));
  const R = grow > 0 ? logR(95, 2300, grow) : 95;
  punto(ctx, lerp(px, CX, grow), lerp(py, H / 2, grow), R, u, {
    look, mood: worried ? 'worried' : u > 4.8 ? 'happy' : 'neutral',
    squash: 0.12 * wobble(u - 5.35, 2.5, 5) - 0.1 * wobble(u - 4.75, 3, 8) + (u < 1 ? 0.05 * ring(u + 0.4, 3, 3) : 0),
    rot: (1 - enter) * -6, eyes: 1 - prog(u, 7.0, 7.5),
  });
  // headline
  ctx.save();
  shake(ctx, u, 3.0, 16, 7, 0.16);
  const out = E.inBack(prog(u, 6.6, 7.2), 1.5);
  ctx.translate(0, -out * 700);
  popWord(ctx, '¿Contabilidad', S.x, 520, 132, C.ink, u, -0.35, { stagger: 0.018 });
  popWord(ctx, 'complicada?', S.x, 670, 150, appGrad, u, 2.9, { stagger: 0.03, spring: SPRING.wobbly });
  const mk = springU(u, 4.85, SPRING.bouncy);
  if (mk > 0) {
    ctx.save(); ctx.translate(S.x + 6, 800); ctx.rotate(-0.04);
    chip(ctx, '¡Mira esto!', 250, 20, 76, mk, { bg: C.ink, fg: C.white, shadow: false });
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ S2 paso 1 (8..22)
const XML_N = 14;
function scenePaso1(ctx, u) {
  fill(ctx, C.purple);
  softGlow(ctx, W * 0.1, H * 0.85, 900, C.lilac, 0.7);
  softGlow(ctx, W * 0.9, H * 0.1, 700, '#8F7CF0', 0.8);
  bigNumeral(ctx, 1, u, 8.0, C.white);
  tracker(ctx, u, trackerState(u, 1), 8.0, true);
  label(ctx, 'PASO 1', S.x + 6, 450, u, 8.1, C.pale);
  // part A: conecta tu SAT
  const outA = E.inOutCubic(prog(u, 13.9, 14.4));
  ctx.save(); ctx.translate(0, -outA * 1800);
  popWord(ctx, 'Conecta', S.x, 580, 140, C.white, u, 9.9, { stagger: 0.02 });
  popWord(ctx, 'tu SAT.', S.x, 720, 140, C.pale, u, 10.9, { stagger: 0.03, spring: SPRING.wobbly });
  const k1 = springU(u, 8.9, SPRING.snappy);
  if (k1 > 0) card(ctx, 'step1', CX, lerp(H + 400, 1060, k1), 920, { rot: lerp(0.1, -0.015, k1), shadowColor: 'rgba(20,10,60,0.35)' });
  chip(ctx, 'con tu e.firma', CX + 150, 1360, 50, springU(u, 12.5, SPRING.bouncy), { check: true, bg: C.white, fg: C.purple, rot: -0.04 });
  ctx.restore();
  // part B: facturas al día, solito
  const kb = springU(u, 14.2, SPRING.snappy);
  if (kb > 0) {
    popWord(ctx, 'Tus facturas,', S.x, 590, 112, C.white, u, 14.7, { stagger: 0.018 });
    popWord(ctx, 'al día.', S.x, 710, 112, C.pale, u, 19.0, { stagger: 0.03 });
    const cy = lerp(H + 600, 1080, kb);
    const hit = (i) => 15.0 + i * 0.24 + 0.55;  // when xml chip i lands
    let bounce = 0; for (let i = 0; i < XML_N; i++) bounce += 0.012 * bump(u, hit(i) + 0.05, 0.12);
    card(ctx, 'dash', CX, cy, 940, { s: 1 + bounce, shadowColor: 'rgba(20,10,60,0.35)' });
    // XML chips arc in from the top-right and drop into the dashboard
    for (let i = 0; i < XML_N; i++) {
      const p = prog(u, hit(i) - 0.55, hit(i));
      if (p <= 0 || p >= 1) continue;
      const sx = W + 60 - hash01(i, 4) * 200, sy = 820 + hash01(i, 9) * 80;
      const tx = CX - 300 + hash01(i, 2) * 600, ty = cy - 40;
      const e = E.inOutCubic(p);
      const x = lerp(sx, tx, e), y = lerp(sy, ty, e) - Math.sin(Math.PI * e) * 260;
      chip(ctx, 'XML', x, y, 36, 1 - 0.6 * p * p, { bg: C.night, fg: C.white, rot: (1 - e) * (hash01(i, 5) - 0.5) * 2, shadow: false });
    }
    // counter pill
    const ck = springU(u, 15.0, SPRING.bouncy);
    if (ck > 0) {
      const n = Math.round(312 * E.outCubic(prog(u, 15.0, 18.9)));
      chip(ctx, `${n} CFDI`, CX + 250, cy - 400, 46, ck, { bg: C.night, fg: C.white, rot: 0.04 });
    }
    // "solito" stamp with Punto
    const sk = springU(u, 19.75, SPRING.bouncy);
    if (sk > 0) chip(ctx, '¡Solito!', CX - 220, 1460, 60, sk, { bg: C.white, fg: C.purple, check: true, rot: -0.06 });
    const pk = springU(u, 15.2, SPRING.gentle);
    if (pk > 0) punto(ctx, lerp(W + 120, 900, pk), 1440 - Math.abs(Math.sin((u - 15) * Math.PI)) * 40 * (u < 19 ? 1 : 0), 62, u,
      { look: u < 19.5 ? [-0.6, -0.8] : [-0.8, 0.2], mood: u > 19.7 ? 'happy' : 'neutral' });
  }
}

// ------------------------------------------------------------------ S3 paso 2 (22..31)
const CLICK = [CX, 790];
const POL_N = 8;
function scenePaso2(ctx, u) {
  fill(ctx, C.paper);
  softGlow(ctx, W * 0.9, H * 0.12, 800, '#DCD3FF', 1);
  softGlow(ctx, W * 0.05, H * 0.8, 700, '#EAE4FF', 1);
  bigNumeral(ctx, 2, u, 22.0, C.purple);
  tracker(ctx, u, trackerState(u, 2), 21.5, false);
  label(ctx, 'PASO 2', S.x + 6, 450, u, 22.1, C.purple);
  popWord(ctx, 'Un clic.', S.x, 600, 150, C.ink, u, 24.45, { stagger: 0.03, spring: SPRING.wobbly });
  // the real "Pólizas" stat, pressed on the click
  const kp = springU(u, 22.4, SPRING.bouncy);
  const press = 1 - 0.06 * bump(u, 24.7, 0.2);
  if (kp > 0) card(ctx, 'polizas', CLICK[0], CLICK[1], 560, { s: kp * press, r: 26 });
  // Punto as the cursor
  const ck = springU(u, 23.0, SPRING.gentle);
  if (ck > 0) {
    const tx = CLICK[0] + 180, ty = CLICK[1] + 60;
    const x = lerp(W + 150, tx, ck), y = lerp(1500, ty, ck) - 70 * Math.max(0, Math.sin(Math.PI * prog(u, 24.15, 24.65)));
    const rp = prog(u, 24.65, 25.6);
    if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha = 1 - rp; ctx.lineWidth = 10; ctx.strokeStyle = C.purple; ctx.beginPath(); ctx.arc(tx, ty, lerp(30, 260, E.outCubic(rp)), 0, 7); ctx.stroke(); ctx.restore(); }
    punto(ctx, x, y, 58, u, { look: [-0.8, -0.6], mood: u > 24.7 ? 'happy' : 'neutral', squash: 0.25 * wobble(u - 24.65, 3, 6) });
  }
  // balanza rises and catches the pólizas
  const kb = springU(u, 25.7, SPRING.snappy);
  const land = (i) => 26.4 + i * 0.3 + 0.5;
  let bounce = 0; for (let i = 0; i < POL_N; i++) bounce += 0.015 * bump(u, land(i) + 0.05, 0.12);
  if (kb > 0) card(ctx, 'balanza', CX, lerp(H + 500, 1210, kb), 720, { s: 1 + bounce });
  for (let i = 0; i < POL_N; i++) {
    const p = prog(u, land(i) - 0.5, land(i));
    if (p <= 0 || p >= 1) continue;
    const e = E.inOutCubic(p);
    const x = lerp(CLICK[0] + (hash01(i, 3) - 0.5) * 300, CX + (hash01(i, 8) - 0.5) * 400, e);
    const y = lerp(CLICK[1], 1180, e) - Math.sin(Math.PI * e) * 200;
    chip(ctx, 'PÓLIZA', x, y, 32, 1 - 0.5 * p * p, { bg: C.purple, fg: C.white, rot: (hash01(i, 6) - 0.5) * (1 - e) * 2, shadow: false });
  }
  chip(ctx, 'directo a la balanza', CX + 120, 945, 42, springU(u, 27.9, SPRING.bouncy), { check: true, bg: C.purple, fg: C.white, rot: 0.03 });
}

// ------------------------------------------------------------------ S4 paso 3 (31..43)
function chartReveal(ctx, cx, cy, w, u, u0) {
  const [ik, [sx, sy, sw, sh]] = CROPS.chart; const img = IMG[ik]; if (!img) return;
  const ck = springU(u, u0 - 0.35, SPRING.snappy); if (ck <= 0) return;
  ctx.save(); ctx.translate(cx, lerp(H + 300, cy, ck)); ctx.translate(-cx, -cy);
  const h = w * sh / sw, s = w / sw, x0 = cx - w / 2, y0 = cy - h / 2;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  rrect(ctx, x0, y0, w, h, 28); ctx.fillStyle = '#F8F8FA'; ctx.fill(); ctx.shadowColor = 'transparent';
  rrect(ctx, x0, y0, w, h, 28); ctx.clip();
  // header strip ("Actividad del periodo") as is
  ctx.drawImage(img, sx, sy, sw, 70, x0, y0, w, 70 * s);
  // 7 bar columns grow from the floor, staggered
  const colW = 136.5, left = 30;
  for (let i = 0; i < 7; i++) {
    const k = clamp(springU(u, u0 + i * 0.13, SPRING.bouncy), 0, 1.15);
    if (k <= 0) continue;
    const csx = sx + left + i * colW, top = 70, full = sh - top;
    const vis = full * Math.min(k, 1);
    ctx.drawImage(img, csx, sy + sh - vis, colW, vis, x0 + (left + i * colW) * s, y0 + (sh - vis * (k > 1 ? k : 1)) * s, colW * s, vis * s * (k > 1 ? k : 1));
  }
  ctx.restore(); ctx.restore();
}
function scenePaso3(ctx, u) {
  fill(ctx, C.night);
  softGlow(ctx, W * 0.15, H * 0.25, 800, C.purple, 0.5);
  softGlow(ctx, W * 0.95, H * 0.85, 700, C.purple, 0.4);
  bigNumeral(ctx, 3, u, 31.0, C.lilac);
  tracker(ctx, u, trackerState(u, 3), 30.5, true);
  label(ctx, 'PASO 3', S.x + 6, 450, u, 31.1, C.lilac);
  popWord(ctx, 'Decide', S.x, 590, 140, C.white, u, 32.85, { stagger: 0.02 });
  popWord(ctx, 'con datos.', S.x, 730, 140, appGrad, u, 33.55, { stagger: 0.025 });
  chartReveal(ctx, CX, 1010, 940, u, 32.2);
  const cw = [['Estados financieros', 35.2, S.x + 300, 1310], ['DIOT', 37.65, S.x + 135, 1430], ['Reportes', 38.5, S.x + 430, 1430]];
  cw.forEach(([l, u0, x, y], i) => chip(ctx, l, x + (i === 0 ? 0 : 0), y, 46, springU(u, u0, SPRING.bouncy), { bg: i === 0 ? C.purple : C.white, fg: i === 0 ? C.white : C.purple, rot: (i - 1) * 0.03 }));
  // LISTO stamp
  const sk = springU(u, 41.55, { stiffness: 420, damping: 18 });
  if (sk > 0) {
    ctx.save(); ctx.translate(CX + 210, 900); ctx.rotate(-0.16); const s = lerp(2.4, 1, clamp(sk)) * (sk > 1 ? sk : 1); ctx.scale(s, s);
    ctx.globalAlpha = clamp(sk * 2);
    rrect(ctx, -230, -78, 460, 156, 24); ctx.lineWidth = 12; ctx.strokeStyle = C.green; ctx.stroke();
    text(ctx, 'LISTO', 30, 32, font(96, 800, D), C.green, 'center', 4);
    checkMark(ctx, -150, 0, 40, 1, C.green, C.white);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ S5 AI (43..50)
const Q = '¿Cuánto IVA pagué este mes?';
function sceneAI(ctx, u) {
  fill(ctx, C.lav);
  softGlow(ctx, W * 0.8, H * 0.3, 800, '#D6CCFF', 1);
  popWord(ctx, '¿Tienes', S.x, 540, 140, C.ink, u, 43.15, { stagger: 0.02 });
  popWord(ctx, 'dudas?', S.x, 680, 140, appGrad, u, 43.7, { stagger: 0.03, spring: SPRING.wobbly });
  // Punto asks; the bubble types itself
  const pk = springU(u, 43.3, SPRING.bouncy);
  const px = 230, py = 1000;
  if (pk > 0) punto(ctx, px, py + (1 - pk) * 600, 110, u, { look: [0.9, -0.7], mood: u > 46.4 ? 'happy' : 'neutral', squash: 0.06 * Math.sin((u - 43) * Math.PI * 2) * (u < 45.5 ? 1 : 0) });
  const bk = springU(u, 43.55, SPRING.bouncy);
  if (bk > 0) {
    const bx = 380, by = 820, bw = 640, bh = 150;
    ctx.save(); ctx.translate(bx, by + bh / 2); ctx.scale(bk, bk); ctx.translate(-bx, -(by + bh / 2));
    ctx.shadowColor = 'rgba(38,35,55,0.2)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    rrect(ctx, bx, by, bw, bh, 40); ctx.fillStyle = C.white; ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + 30, by + bh - 20); ctx.lineTo(bx - 50, by + bh + 50); ctx.lineTo(bx + 100, by + bh - 4); ctx.fill();
    ctx.shadowColor = 'transparent';
    const n = Math.floor(Q.length * prog(u, 43.6, 45.0));
    const s = [...Q].slice(0, n).join('');
    text(ctx, s, bx + 40, by + 92, font(46, 600, UI), C.ink);
    if (n < Q.length || Math.floor(u * 2) % 2 === 0) {
      const tw = (ctx.font = font(46, 600, UI), ctx.measureText(s).width);
      ctx.fillStyle = C.purple; ctx.fillRect(bx + 44 + tw, by + 50, 5, 56);
    }
    ctx.restore();
  }
  const ak = springU(u, 46.3, SPRING.snappy);
  if (ak > 0) card(ctx, 'ai', CX + 40, lerp(H + 400, 1330, ak), 900, { rot: lerp(0.08, -0.02, ak) });
}

// ------------------------------------------------------------------ S6 nube + RFC (50..56.5)
function cloudPath(ctx, x, y, s) {
  ctx.beginPath();
  ctx.moveTo(x - 260 * s, y + 90 * s);
  ctx.bezierCurveTo(x - 380 * s, y + 90 * s, x - 380 * s, y - 60 * s, x - 250 * s, y - 50 * s);
  ctx.bezierCurveTo(x - 240 * s, y - 190 * s, x - 40 * s, y - 220 * s, x + 10 * s, y - 100 * s);
  ctx.bezierCurveTo(x + 80 * s, y - 200 * s, x + 280 * s, y - 160 * s, x + 260 * s, y - 20 * s);
  ctx.bezierCurveTo(x + 380 * s, y - 10 * s, x + 380 * s, y + 90 * s, x + 260 * s, y + 90 * s);
  ctx.closePath();
}
function sceneNube(ctx, u) {
  fill(ctx, C.purple);
  softGlow(ctx, W * 0.2, H * 0.2, 800, '#8F7CF0', 0.9);
  softGlow(ctx, W * 0.9, H * 0.9, 800, C.lilac, 0.6);
  popWord(ctx, 'Todo en', S.x, 500, 130, C.white, u, 49.9, { stagger: 0.02 });
  popWord(ctx, 'la nube.', S.x, 630, 130, C.pale, u, 50.6, { stagger: 0.025 });
  // cloud draws on, fills, Punto bounces on it
  const dp = E.outCubic(prog(u, 50.2, 51.2));
  if (dp > 0) {
    ctx.save(); cloudPath(ctx, 700, 800, 0.62);
    ctx.globalAlpha = E.outCubic(prog(u, 50.8, 51.4)) * 0.22; ctx.fillStyle = C.white; ctx.fill(); ctx.globalAlpha = 1;
    ctx.setLineDash([2600 * dp, 3000]); ctx.lineWidth = 12; ctx.lineJoin = 'round'; ctx.strokeStyle = C.white; ctx.stroke();
    ctx.restore();
    const hop = Math.abs(Math.sin((u - 50.6) * Math.PI)) * 50;
    const pk = springU(u, 50.6, SPRING.bouncy);
    if (pk > 0) punto(ctx, 720, 700 - hop * (u < 55.5 ? 1 : 0) - (1 - pk) * 400, 54, u, { look: [-0.5, 0.6], mood: 'happy', squash: 0.12 * Math.max(0, Math.cos((u - 50.6) * Math.PI * 2)) });
  }
  const k1 = springU(u, 50.9, SPRING.snappy), k2 = springU(u, 52.5, SPRING.snappy);
  if (k1 > 0) card(ctx, 'nube', lerp(-500, CX - 20, k1), 1060, 820, { rot: lerp(-0.25, -0.03, k1), shadowColor: 'rgba(20,10,60,0.35)' });
  if (k2 > 0) card(ctx, 'rfc', lerp(W + 500, CX + 20, k2), 1340, 820, { rot: lerp(0.25, 0.03, k2), shadowColor: 'rgba(20,10,60,0.35)' });
  // RFC chips stacking beside the card
  for (let i = 0; i < 3; i++) chip(ctx, `RFC ${i + 1}`, 900 - i * 14, 1230 - i * 62, 34, springU(u, 52.9 + i * 0.25, SPRING.bouncy), { bg: C.night, fg: C.white, rot: (i - 1) * 0.06 });
}

// ------------------------------------------------------------------ S7 end (56.5..68)
function sceneEnd(ctx, u) {
  fill(ctx, C.paper);
  softGlow(ctx, W * 0.5, H * 0.42, 900, '#DDD3FF', 1);
  // tracker complete: three checks
  const st = { nodes: [1, 1, 1], settle: [1, 1, 1], progress: 2, done: [0, 1, 2].map((i) => springU(u, 56.7 + i * 0.2, SPRING.bouncy)) };
  tracker(ctx, u, st, 56.4, false);
  // wordmark builds, Punto lands and shrinks into its dot
  const wy = 760, size = 220, f = font(size, 800, D), tr = -0.04 * size;
  const a = layout(ctx, 'Fis', f, tr).width, b = layout(ctx, 'App', f, tr).width, tot = a + b + size * 0.28;
  const x0 = CX - tot / 2, dX = x0 + a + b + size * 0.15, dY = wy - size * 0.05;
  ctx.save();
  const q = 0.04 * wobble(u - 57.3, 2.2, 5);
  ctx.translate(CX, wy); ctx.scale(1 + q, 1 - q); ctx.translate(-CX, -wy);
  popWord(ctx, 'Fis', x0, wy, size, C.ink, u, 56.75, { stagger: 0.05 });
  popWord(ctx, 'App', x0 + a + size * 0.01, wy, size, appGrad, u, 56.9, { stagger: 0.05 });
  ctx.restore();
  const fall = E.outBounce(prog(u, 56.0, 56.6));
  const shrink = E.inOutCubic(prog(u, 57.0, 57.5));
  const R = lerp(70, size * 0.075, shrink);
  punto(ctx, lerp(CX + 300, dX, shrink), lerp(lerp(-100, 470, fall), dY, shrink), R, u,
    { look: [-0.7, 0.4], mood: 'happy', eyes: 1 - shrink, squash: 0.2 * wobble(u - 56.6, 3, 6) });
  // Así de fácil.
  popWord(ctx, 'Así de fácil.', CX, 960, 112, appGrad, u, 58.2, { align: 'center', stagger: 0.025, spring: SPRING.wobbly });
  const kc = springU(u, 60.2, SPRING.bouncy);
  if (kc > 0) {
    const pulse = 1 + 0.06 * bump(u, 64, 0.35) + 0.03 * (u > 62 ? bump(((u - 62) % 2), 0, 0.3) : 0);
    card(ctx, 'cta', CX, 1150, 720, { s: kc * pulse, r: 90, shadowColor: 'rgba(108,92,231,0.45)' });
  }
  const tk = E.outQuint(prog(u, 61.0, 61.6));
  if (tk > 0) { ctx.globalAlpha = tk; text(ctx, 'Prueba 15 días gratis', CX, 1320 + (1 - tk) * 30, font(52, 600, UI), C.ink, 'center'); ctx.globalAlpha = 1; }
  if (u > 62.2) popWord(ctx, 'fisapp.com.mx', CX, 1430, 64, C.purple, u, 62.4, { align: 'center', stagger: 0.015, track: -0.01 });
}

// ------------------------------------------------------------------ timeline + transitions
function whipH(ctx, u, a, b, A, B) { const p = E.inOutCubic(prog(u, a, b)); ctx.save(); ctx.translate(-p * W, 0); A(ctx, u); ctx.restore(); ctx.save(); ctx.translate((1 - p) * W, 0); B(ctx, u); ctx.restore(); }
function whipV(ctx, u, a, b, A, B) { const p = E.inOutCubic(prog(u, a, b)); ctx.save(); ctx.translate(0, -p * H); A(ctx, u); ctx.restore(); ctx.save(); ctx.translate(0, (1 - p) * H); B(ctx, u); ctx.restore(); }
function frame(ctx, u) {
  if (u < 8) return sceneHook(ctx, u);
  if (u < 21.5) return scenePaso1(ctx, u);
  if (u < 22.0) return whipH(ctx, u, 21.5, 22.0, scenePaso1, scenePaso2);
  if (u < 30.5) return scenePaso2(ctx, u);
  if (u < 31.0) return whipV(ctx, u, 30.5, 31.0, scenePaso2, scenePaso3);
  if (u < 42.8) return scenePaso3(ctx, u);
  if (u < 43.25) return whipH(ctx, u, 42.8, 43.25, scenePaso3, sceneAI);
  if (u < 49.6) return sceneAI(ctx, u);
  if (u < 50.0) return whipV(ctx, u, 49.6, 50.0, sceneAI, sceneNube);
  if (u < 55.9) return sceneNube(ctx, u);
  if (u < 56.3) return whipV(ctx, u, 55.9, 56.3, sceneNube, sceneEnd);
  sceneEnd(ctx, u);
}

M.film({
  fonts: [font(100, 800, D), font(40, 500, UI), font(40, 600, UI), font(40, 700, UI)],
  images: {
    s01: 'assets/shots/section_01_tu-contabilidad-completa-de-tus-cfdi-al-.png',
    s02: 'assets/shots/section_02_todo-lo-que-necesitas-de-tu-informaci-n-.png',
    s04: 'assets/shots/section_04_una-plataforma-todos-los-m-dulos.png',
    s05: 'assets/shots/section_05_c-mo-funciona-fisapp.png',
    s06: 'assets/shots/section_06_nuestros-servicios-actuales.png',
    s08: 'assets/shots/section_08_section.png',
  },
  init(ctx, images) { IMG = images; },
  hits: HITS,
  draw(ctx, u) { frame(ctx, u); },
});
