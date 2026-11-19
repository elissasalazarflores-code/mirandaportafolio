// EmiteGo R01 "Tu ERP vende. EmiteGo factura." (9:16, 30 s). window.seek(t) paints frame t.
// 128 bpm house bed, drop on beat 16 = "Con EmiteGo". VO: emitego/vo/R01.mp3 placed +0.15 s
// (audio/vo.wav); captions.json holds the word timings. Beats (u) below come from those timings.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, springU, SPRING, wobble, shake, font, layout, glyph, text, fill, crop, rrect, bump, TS } = M;

const C = {
  navy: '#193357', navyDeep: '#10233F', ink: '#0F172A', slate: '#64748B', slate2: '#475569',
  paper: '#F8FAFC', mist: '#EEF2F7', line: '#DCE3EC', white: '#FFFFFF', green: '#059669', greenSoft: '#D1FAE5',
};
const D = 'Display', UI = 'UI';
const S = FORMAT.safe;                // x 72..1008, y 250..1490
const CAPS = await fetch('captions.json').then((r) => r.json());

// Real UI crops from assets/shots/section_00_tu-erp-vende.png (2880x1444).
const R = {
  card: [1557, 364, 966, 711], row: [1600, 657, 884, 78], foot: [1600, 964, 884, 72],
  stats: [1598, 490, 887, 140], btn: [353, 904, 390, 81],
};

const HITS = [
  [0, 'hook', 'impact'],
  [1.3, 'capturada', 'pop', { pitch: 'E5' }],
  [2.2, 'row lands', 'thud'],
  [3.9, '2 veces', 'boing', { pitch: 'C5', to: 'C6' }],
  [4.3, 'row clones', 'click'],
  [6.6, 'whip a ventanas', 'whoosh', { len: 0.4 }],
  [6.9, 'ventana ERP', 'thud'],
  [7.2, 'typing 1', 'type', { len: 1.2 }],
  [10.4, 'ventana portal', 'thud'],
  [10.7, 'typing 2', 'type', { len: 1.2 }],
  [12.4, 'contador 2', 'blip', { pitch: 'A5' }],
  [13.8, 'YA NO', 'impact'],
  [15.4, 'riser', 'riser', { len: 0.5 }],
  [16, 'drop', 'impact'],
  [18.2, 'ERP', 'pop', { pitch: 'A5' }],
  [19.2, 'vende', 'pop', { pitch: 'C#6' }],
  [21.6, 'EmiteGo', 'pop', { pitch: 'E6' }],
  [22.9, 'factura', 'bell', { pitch: 'A6' }],
  [24.4, 'whip a bandeja', 'whoosh', { len: 0.4, from: 2400, to: 600 }],
  [25.4, 'valida', 'blip', { pitch: 'A5' }],
  [28.1, 'timbra', 'blip', { pitch: 'C#6' }],
  [28.3, 'timbrada ring', 'bell', { pitch: 'E6' }],
  [32.1, 'envia', 'blip', { pitch: 'E6' }],
  [34.2, 'regresa', 'blip', { pitch: 'A6' }],
  [35.3, 'XML', 'pop', { pitch: 'E6' }],
  [37.5, 'PDF', 'pop', { pitch: 'A6' }],
  [41.4, 'todo solito', 'coins'],
  [43.6, 'wipe verde', 'whoosh', { len: 0.4 }],
  [44, 'dedicate', 'thud'],
  [45.7, 'vender stats', 'pop', { pitch: 'A5' }],
  [48, 'end card', 'impact'],
  [48.4, 'logo', 'bell', { pitch: 'E6' }],
  [55.4, 'pill', 'pop', { pitch: 'A5' }],
  [57.9, 'boton', 'thud'],
  [59.2, 'click', 'click'],
];

// ------------------------------------------------------------------ helpers
const LOGO_DOC = new Path2D('M15.5 10.5h12.8l5.2 5.2v19.3a2.5 2.5 0 0 1-2.5 2.5H15.5a2.5 2.5 0 0 1-2.5-2.5V13a2.5 2.5 0 0 1 2.5-2.5z');
const LOGO_FOLD = new Path2D('M28.3 10.5l5.2 5.2h-5.2z');
const LOGO_PLANE = new Path2D('M18.6 22.2l12.6 3.4-9.4 2.5-1.1 4.6-1.9-4-3.3.9 3.1-7.4z');
function logo(ctx, x, y, size, onDark) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 48, size / 48);
  rrect(ctx, 0, 0, 48, 48, 12); ctx.fillStyle = onDark ? 'rgba(255,255,255,.12)' : C.navy; ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fill(LOGO_DOC);
  ctx.fillStyle = '#AEBBCE'; ctx.fill(LOGO_FOLD);
  ctx.fillStyle = C.navy; ctx.fill(LOGO_PLANE);
  ctx.restore();
}
function check(ctx, cx, cy, r, k, color = '#fff', lw = 0) {
  // stroke-drawn check mark, k = 0..1 draw-on
  if (k <= 0) return;
  const pts = [[-0.45, 0.02], [-0.12, 0.34], [0.48, -0.32]];
  const L1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), L2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
  const d = k * (L1 + L2);
  ctx.save(); ctx.translate(cx, cy); ctx.scale(r, r);
  ctx.beginPath(); ctx.moveTo(...pts[0]);
  if (d <= L1) ctx.lineTo(lerp(pts[0][0], pts[1][0], d / L1), lerp(pts[0][1], pts[1][1], d / L1));
  else { ctx.lineTo(...pts[1]); const q = (d - L1) / L2; ctx.lineTo(lerp(pts[1][0], pts[2][0], q), lerp(pts[1][1], pts[2][1], q)); }
  ctx.lineWidth = lw || 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.stroke();
  ctx.restore();
}
function shadowCard(ctx, x, y, w, h, r, color = C.white, blur = 50, alpha = 0.16) {
  ctx.save(); ctx.shadowColor = `rgba(15,23,42,${alpha})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = blur * 0.35;
  rrect(ctx, x, y, w, h, r); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function imgCrop(ctx, img, rect, x, y, w, r = 0) {
  const h = w * rect[3] / rect[2];
  ctx.save(); if (r) { rrect(ctx, x, y, w, h, r); ctx.clip(); }
  crop(ctx, img, rect, x, y, w, h); ctx.restore();
  return h;
}
// a word of big type whose glyphs spring up from a baseline mask
function springWord(ctx, str, x, base, size, color, u0, u, { cfg = SPRING.bouncy, stagger = 0.035, track = -0.035, exitU = null, exitDir = -1 } = {}) {
  const f = font(size, 800, D), L = layout(ctx, str, f, track * size);
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * stagger, cfg);
    if (k <= 0.001) return;
    let dy = (1 - k) * size * 0.9, a = clamp(k * 1.6);
    if (exitU != null) { const e = E.inBack(prog(u, exitU + j * 0.02, exitU + 0.45 + j * 0.02), 1.3); dy += exitDir * e * (H * 0.6); }
    ctx.globalAlpha = a; glyph(ctx, g.ch, x + g.cx, base + dy, f, color, 1, 1); ctx.globalAlpha = 1;
  });
  return L.width;
}

// ------------------------------------------------------------------ captions (always on, ads play muted)
function captions(ctx, t, dark) {
  const c = CAPS.find((c) => t >= c.s - 0.05 && t <= c.e + 0.25);
  if (!c) return;
  const f = font(46, 700, UI);
  ctx.font = f;
  const words = c.words.map((w) => w.w);
  const str = words.join(' ');
  const wFull = ctx.measureText(str).width;
  const padX = 26, h = 76, y = 1392;
  const k = E.outBack(prog(t, c.s - 0.05, c.s + 0.12), 1.6);
  const bw = wFull + padX * 2;
  ctx.save(); ctx.translate(W / 2, y + h / 2); ctx.scale(lerp(0.92, 1, k), lerp(0.92, 1, k)); ctx.translate(-W / 2, -(y + h / 2));
  ctx.globalAlpha = clamp(k * 2);
  rrect(ctx, (W - bw) / 2, y, bw, h, 18); ctx.fillStyle = dark ? 'rgba(255,255,255,.96)' : 'rgba(15,23,42,.88)'; ctx.fill();
  let x = (W - wFull) / 2;
  const sp = ctx.measureText(' ').width;
  c.words.forEach((w) => {
    const on = t >= w.s - 0.02;
    ctx.fillStyle = on ? (dark ? C.navy : C.white) : (dark ? 'rgba(25,51,87,.45)' : 'rgba(255,255,255,.45)');
    if (on && t < w.s + 0.35 && /EmiteGo|gratis|solito|vender|SAT|XML|PDF|ERP/.test(w.w)) ctx.fillStyle = C.green;
    ctx.textAlign = 'left'; ctx.fillText(w.w, x, y + 52);
    x += ctx.measureText(w.w).width + sp;
  });
  ctx.restore();
}

// ------------------------------------------------------------------ A. hook   (u 0..6.6)
function sceneHook(ctx, u, IMG) {
  const exit = E.inCubic(prog(u, 6.2, 6.8));     // whip left into scene B
  ctx.save(); ctx.translate(-exit * W * 1.05, 0);
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H);
  const x = S.x + 8, size = 150, B = 560;
  springWord(ctx, '¿La misma', x, B, size, C.ink, -0.3, u);
  springWord(ctx, 'venta', x, B + 150, size, C.ink, 0.5, u);
  springWord(ctx, 'capturada', x, B + 300, size, C.ink, 1.3, u);
  // "2 veces?": the 2 is the accent, it bounces in and wobbles
  const k2 = springU(u, 3.9, SPRING.wobbly);
  if (k2 > 0.001) {
    const f = font(220, 800, D);
    const w = 1 + 0.12 * wobble((u - 3.9) * 0.4688, 2.4, 5);
    glyph(ctx, '2', x + 62, B + 470, f, C.green, k2 * w, k2 / w);
    springWord(ctx, 'veces?', x + 150, B + 470, size, C.ink, 4.0, u);
  }
  // the same invoice row, captured once... then again
  if (IMG.hero) {
    const w = 936, rx = (W - w) / 2, y0 = 1095;
    const k = springU(u, 2.0, SPRING.snappy);
    if (k > 0) {
      const kc = springU(u, 4.3, SPRING.bouncy);
      [1, 0].forEach((i) => {
        if (i === 1 && kc <= 0) return;
        const y = y0 + (1 - k) * 300 + (i ? kc * 120 : 0);
        ctx.save(); ctx.globalAlpha = clamp(k * 1.5) * (i ? 0.92 : 1);
        if (i) { ctx.translate(W / 2, y + 40); ctx.rotate(0.035 * kc); ctx.translate(-W / 2, -(y + 40)); }
        shadowCard(ctx, rx - 4, y - 4, w + 8, 86, 20, C.white, 36, 0.14);
        imgCrop(ctx, IMG.hero, R.row, rx, y, w, 16);
        ctx.restore();
      });
      // tag "copia" on the clone
      if (kc > 0) {
        const tk = E.outBack(prog(u, 4.5, 4.9), 2);
        ctx.save(); ctx.translate(rx + w - 60, y0 + 120 + 6); ctx.rotate(0.06); ctx.scale(tk, tk);
        rrect(ctx, -92, -26, 184, 52, 26); ctx.fillStyle = C.ink; ctx.fill();
        text(ctx, 'otra vez', 0, 10, font(30, 700, UI), C.white, 'center');
        ctx.restore();
      }
    }
  }
  ctx.restore();
  return exit;
}

// ------------------------------------------------------------------ B. the old way   (u 6.2..16)
function pane(ctx, x, y, w, h, label, value, amount, u0, u, crossed) {
  shadowCard(ctx, x, y, w, h, 26, C.white, 40, 0.12);
  // title bar
  ctx.save(); rrect(ctx, x, y, w, 64, [26, 26, 0, 0]); ctx.fillStyle = '#E7ECF3'; ctx.fill(); ctx.restore();
  [0, 1, 2].forEach((i) => { ctx.beginPath(); ctx.arc(x + 34 + i * 26, y + 32, 8, 0, 7); ctx.fillStyle = '#C3CCD9'; ctx.fill(); });
  text(ctx, label, x + 120, y + 42, font(28, 700, UI), C.slate2, 'left', 2);
  // two fields typed on
  const fields = [['Cliente', value, 0], ['Total', amount, 1.1]];
  fields.forEach(([k, v, d], i) => {
    const fy = y + 110 + i * 120;
    text(ctx, k, x + 40, fy, font(26, 600, UI), C.slate, 'left', 1);
    rrect(ctx, x + 36, fy + 16, w - 72, 70, 14); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.stroke();
    const p = prog(u, u0 + 0.3 + d, u0 + 1.4 + d);
    const n = Math.floor(p * v.length);
    const shown = v.slice(0, n);
    text(ctx, shown, x + 60, fy + 64, font(36, 600, UI), C.ink);
    if (p > 0 && p < 1.2 && Math.floor(u * 3) % 2 === 0) {
      ctx.font = font(36, 600, UI); const cw = ctx.measureText(shown).width;
      ctx.fillStyle = C.navy; ctx.fillRect(x + 62 + cw, fy + 30, 4, 44);
    }
  });
  if (crossed > 0) {
    ctx.save(); ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 20, y + 20); ctx.lineTo(lerp(x + 20, x + w - 20, crossed), lerp(y + 20, y + h - 20, crossed)); ctx.stroke();
    ctx.restore();
  }
}
function sceneOld(ctx, u) {
  fill(ctx, C.mist);
  const enter = 1 - E.outCubic(prog(u, 6.2, 6.8));
  const fall = E.inBack(prog(u, 14.6, 15.6), 1.6);
  ctx.save(); ctx.translate(enter * W * 1.05, 0);
  shake(ctx, u, 13.8, 26);
  const w = 880, x = (W - w) / 2, h = 360;
  // count chip
  const c1 = u >= 7.6, c2 = u >= 12.4;
  if (c1) {
    const kb = springU(u, c2 ? 12.4 : 7.6, SPRING.bouncy);
    ctx.save(); ctx.translate(W / 2, 330); ctx.scale(lerp(0.6, 1, kb), lerp(0.6, 1, kb));
    rrect(ctx, -210, -46, 420, 92, 46); ctx.fillStyle = C.ink; ctx.fill();
    text(ctx, `Capturas: ${c2 ? 2 : 1}`, 0, 16, font(44, 700, UI), C.white, 'center');
    ctx.restore();
  }
  const k1 = springU(u, 6.9, SPRING.snappy), k2 = springU(u, 10.4, SPRING.snappy);
  const cross = E.outCubic(prog(u, 13.9, 14.3));
  const panes = [[k1, 440, 'TU ERP', 6.9, -1], [k2, 870, 'PORTAL DE FACTURACIÓN', 10.4, 1]];
  panes.forEach(([k, py, label, u0, dir], i) => {
    if (k <= 0) return;
    ctx.save();
    const fy = fall * (900 + i * 200), rot = fall * 0.25 * dir;
    ctx.translate(W / 2, py + h / 2 + fy); ctx.rotate(rot); ctx.translate(-W / 2, -(py + h / 2));
    ctx.globalAlpha = clamp(k * 1.5);
    ctx.translate(0, (1 - k) * 220);
    pane(ctx, x, py, w, h, label, 'Distribuidora Peninsular', '$58,000.00', u0, u, cross);
    ctx.restore();
  });
  // "same data again" arrow between panes
  const ka = E.outCubic(prog(u, 11.2, 11.9)) * (1 - fall);
  if (ka > 0) {
    ctx.save(); ctx.strokeStyle = C.slate; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.setLineDash([2, 18]);
    ctx.beginPath(); ctx.moveTo(x + w - 40, 790); ctx.quadraticCurveTo(x + w + 60, 830, x + w - 40, lerp(790, 880, ka)); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // ¡YA NO! stamp
  const ks = springU(u, 13.8, SPRING.bouncy);
  if (ks > 0) {
    const out = E.inBack(prog(u, 15.2, 15.8), 1.4);
    ctx.save(); ctx.translate(W / 2, 860 - out * 1300); ctx.rotate(-0.09); const sc = lerp(2.4, 1, ks); ctx.scale(sc, sc);
    ctx.globalAlpha = clamp(ks * 2);
    rrect(ctx, -330, -120, 660, 200, 30); ctx.fillStyle = C.navy; ctx.fill();
    text(ctx, '¡YA NO!', 0, 40, font(150, 800, D), C.white, 'center', -3);
    ctx.restore();
  }
}

// ------------------------------------------------------------------ C. drop: brand line   (u 15.6..24.6)
function sceneDrop(ctx, u) {
  // navy rises from the bottom on the riser, lands exactly on the drop
  const rise = E.outExpo(prog(u, 15.55, 16));
  const exit = E.inCubic(prog(u, 24.0, 24.6));
  ctx.fillStyle = C.navy; ctx.fillRect(0, H * (1 - rise) - exit * H, W, H * rise + 2);
  if (u < 16) return;
  ctx.save(); ctx.translate(0, -exit * H);
  // ghost logo, slowly growing behind the words
  const kl = springU(u, 16, SPRING.bouncy);
  ctx.save(); ctx.translate(S.x + 8 + 55, 330 + 55); ctx.scale(kl, kl); ctx.translate(-55, -55); logo(ctx, 0, 0, 110, true); ctx.restore();
  const x = S.x + 8, size = 196, top = 680;
  springWord(ctx, 'Tu ERP', x, top, size, C.white, 17.6, u);
  springWord(ctx, 'vende.', x, top + 200, size, C.white, 19.0, u);
  springWord(ctx, 'EmiteGo', x, top + 430, size, C.white, 21.4, u);
  springWord(ctx, 'factura.', x, top + 630, size, '#34D399', 22.7, u);
  // underline swipe under "factura."
  const ku = E.outCubic(prog(u, 23.1, 23.6));
  if (ku > 0) { ctx.fillStyle = '#34D399'; rrect(ctx, x, top + 665, 690 * ku, 14, 7); ctx.fill(); }
  ctx.restore();
}

// ------------------------------------------------------------------ D. the automatic flow   (u 24.0..44)
const STEPS = [
  [25.4, 'Valida tus datos fiscales'],
  [28.1, 'Timbra ante el SAT'],
  [32.1, 'Envía la factura a tu cliente'],
  [34.2, 'Regresa XML y PDF a tu ERP'],
];
function sceneFlow(ctx, u, IMG) {
  fill(ctx, C.paper);
  const enter = E.outCubic(prog(u, 24.0, 24.7));
  const exit = E.inCubic(prog(u, 43.3, 44.0));
  ctx.save(); ctx.translate(0, (1 - enter) * H * 0.9 - exit * 0);
  // card (real hero inbox)
  const cw = 920, cx = (W - cw) / 2, cy = 280;
  const kc = springU(u, 24.2, SPRING.gentle);
  const pulse = 0.025 * bump(u, 41.6, 0.8);
  // camera push onto the real "Timbrada" row while the VO says "timbra ante el SAT"
  const sc0 = cw / R.card[2];
  const [z] = M.springKeys(u, [[24, [1]], [27.6, [1.15]], [31.2, [1]]], SPRING.gentle);
  const fxp = W / 2, fyp = cy + (R.row[1] - R.card[1] + R.row[3] / 2) * sc0;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, 975); ctx.clip();
  ctx.translate(fxp, fyp); ctx.scale(z, z); ctx.translate(-fxp, -fyp - (z - 1) * 60);
  ctx.save(); ctx.translate(W / 2, cy + 330); ctx.scale(lerp(0.9, 1, kc) + pulse, lerp(0.9, 1, kc) + pulse); ctx.translate(-W / 2, -(cy + 330));
  shadowCard(ctx, cx, cy, cw, cw * R.card[3] / R.card[2], 34, C.white, 70, 0.18);
  const sc = cw / R.card[2];
  if (IMG.hero) imgCrop(ctx, IMG.hero, R.card, cx, cy, cw, 34);
  // highlight the real "Timbrada" row on "timbra"
  const hr = bump(u, 29.0, 1.6);
  if (hr > 0) {
    ctx.save(); ctx.globalAlpha = hr; ctx.strokeStyle = C.green; ctx.lineWidth = 6;
    rrect(ctx, cx + (R.row[0] - R.card[0] - 6) * sc, cy + (R.row[1] - R.card[1] - 6) * sc, (R.row[2] + 12) * sc, (R.row[3] + 12) * sc, 18); ctx.stroke(); ctx.restore();
  }
  // highlight the footer "UUID, XML y PDF devueltos a tu ERP" from regresa to solito
  const hf = clamp(prog(u, 34.2, 34.7)) * (1 - prog(u, 42.6, 43.2));
  if (hf > 0) {
    ctx.save(); ctx.globalAlpha = hf; ctx.strokeStyle = C.green; ctx.lineWidth = 6;
    rrect(ctx, cx + (R.foot[0] - R.card[0] - 6) * sc, cy + (R.foot[1] - R.card[1] - 6) * sc, (R.foot[2] + 12) * sc, (R.foot[3] + 12) * sc, 30); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  ctx.restore();
  // step list
  const lx = S.x + 20, ly0 = 1000, rowH = 86;
  STEPS.forEach(([u0, label], i) => {
    const y = ly0 + i * rowH;
    const kin = springU(u, 24.6 + i * 0.25, SPRING.snappy);
    if (kin <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(kin * 1.4); ctx.translate((1 - kin) * 120, 0);
    const on = springU(u, u0, SPRING.bouncy);
    const r = 30;
    ctx.beginPath(); ctx.arc(lx + r, y, r * (1 + 0.15 * bump(u, u0 + 0.3, 0.6)), 0, 7);
    ctx.fillStyle = on > 0.01 ? C.green : C.white; ctx.fill();
    if (on <= 0.01) { ctx.lineWidth = 4; ctx.strokeStyle = C.line; ctx.stroke(); }
    check(ctx, lx + r, y + 2, r * 1.1, clamp(prog(u, u0, u0 + 0.5)));
    text(ctx, label, lx + r * 2 + 26, y + 15, font(42, on > 0.01 ? 700 : 500, UI), on > 0.01 ? C.ink : C.slate);
    ctx.restore();
  });
  // XML / PDF file tokens land next to the last step
  [[35.3, 'XML', 0], [37.5, 'PDF', 1]].forEach(([u0, lab, i]) => {
    const k = springU(u, u0, SPRING.bouncy);
    if (k <= 0) return;
    const tx = lerp(W / 2, 1008 - 200 + i * 104 - 10, k), ty = lerp(cy + 600, ly0 + 3 * rowH - 74, k);
    ctx.save(); ctx.translate(tx, ty); ctx.rotate((1 - k) * (i ? 0.5 : -0.5));
    rrect(ctx, 0, 0, 92, 108, 14); ctx.fillStyle = i ? C.navy : C.green; ctx.fill();
    ctx.beginPath(); ctx.moveTo(64, 0); ctx.lineTo(92, 28); ctx.lineTo(64, 28); ctx.closePath(); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill();
    text(ctx, lab, 46, 78, font(28, 700, UI), C.white, 'center', 1);
    ctx.restore();
  });
  // "Todo solito" stamp
  const kt = springU(u, 41.4, SPRING.bouncy);
  if (kt > 0) {
    ctx.save(); ctx.translate(W - 230, 270); ctx.rotate(0.1); ctx.scale(kt, kt);
    rrect(ctx, -170, -54, 340, 108, 54); ctx.fillStyle = C.green; ctx.fill();
    text(ctx, 'Todo solito', 0, 15, font(44, 800, D), C.white, 'center');
    ctx.restore();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ E. tú dedícate a vender   (u 43.3..48.6)
function sceneSell(ctx, u, IMG) {
  const wipe = E.outExpo(prog(u, 43.3, 44.0));
  ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(W / 2, H * 0.45, Math.hypot(W, H) * wipe, 0, 7); ctx.fill();
  if (u < 43.6) return;
  const x = S.x + 8;
  springWord(ctx, 'Tú dedícate', x, 640, 150, C.white, 43.9, u);
  springWord(ctx, 'a vender.', x, 800, 150, C.white, 44.9, u);
  if (IMG.hero) {
    const k = springU(u, 45.6, SPRING.bouncy);
    if (k > 0) {
      const w = 920, y = 930 + (1 - k) * 220;
      ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(W / 2, y); ctx.rotate(-0.03 * (1 - k)); ctx.translate(-W / 2, -y);
      shadowCard(ctx, (W - w) / 2 - 8, y - 8, w + 16, w * R.stats[3] / R.stats[2] + 16, 30, C.white, 50, 0.22);
      imgCrop(ctx, IMG.hero, R.stats, (W - w) / 2, y, w, 24);
      ctx.restore();
    }
  }
}

// ------------------------------------------------------------------ F. end card   (u 48..64)
function sceneEnd(ctx, u, IMG) {
  const rise = E.outExpo(prog(u, 47.7, 48.05));
  ctx.fillStyle = C.navy; ctx.fillRect(0, H * (1 - rise), W, H * rise + 2);
  if (u < 48) return;
  const kl = springU(u, 48.2, SPRING.bouncy);
  const ls = 200;
  ctx.save(); ctx.translate(W / 2, 470); ctx.scale(kl, kl); ctx.rotate((1 - kl) * -0.4); logo(ctx, -ls / 2, -ls / 2, ls, true); ctx.restore();
  // wordmark, centred, each glyph springs
  const f = font(150, 800, D), L = layout(ctx, 'EmiteGo', f, -4);
  const x0 = (W - L.width) / 2;
  L.glyphs.forEach((g, j) => {
    const k = springU(u, 48.6 + j * 0.05, SPRING.bouncy);
    if (k <= 0.001) return;
    glyph(ctx, g.ch, x0 + g.cx, 760 + (1 - k) * 120, f, C.white, 1, 1);
  });
  const kt = E.outCubic(prog(u, 50.8, 51.6));
  if (kt > 0) { ctx.globalAlpha = kt; text(ctx, 'Factura en automático.', W / 2, 850 + (1 - kt) * 30, font(50, 500, UI), '#B9C6DA', 'center'); ctx.globalAlpha = 1; }
  // green pill
  const kp = springU(u, 55.4, SPRING.bouncy);
  if (kp > 0) {
    ctx.save(); ctx.translate(W / 2, 990); ctx.scale(kp, kp);
    rrect(ctx, -330, -50, 660, 100, 50); ctx.fillStyle = C.green; ctx.fill();
    text(ctx, '15 días gratis · sin tarjeta', 0, 16, font(44, 700, UI), C.white, 'center');
    ctx.restore();
  }
  // CTA button (the site's "Empezar gratis"), inverted for the navy card, pressed on "sin tarjeta"
  const kb = springU(u, 57.9, SPRING.snappy);
  if (kb > 0) {
    const press = 1 - 0.06 * bump(u, 59.35, 0.35);
    const w = 560, h = 116;
    ctx.save(); ctx.translate(W / 2, 1150 + h / 2 + (1 - kb) * 120); ctx.scale(press, press); ctx.globalAlpha = clamp(kb * 1.5);
    rrect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = C.white; ctx.fill();
    text(ctx, 'Empezar gratis', -24, 17, font(46, 700, UI), C.navy, 'center');
    ctx.save(); ctx.strokeStyle = C.navy; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(170, 0); ctx.lineTo(214, 0); ctx.moveTo(196, -18); ctx.lineTo(214, 0); ctx.lineTo(196, 18); ctx.stroke(); ctx.restore();
    ctx.restore();
  }
  const ku = E.outCubic(prog(u, 60, 60.8));
  if (ku > 0) { ctx.globalAlpha = ku; text(ctx, 'emitego.com.mx', W / 2, 1340, font(40, 600, UI), '#B9C6DA', 'center', 1); ctx.globalAlpha = 1; }
}

M.film({
  fonts: [font(100, 800, D), font(40, 500, UI), font(40, 700, UI)],
  images: { hero: 'assets/shots/section_00_tu-erp-vende.png' },
  hits: HITS,
  draw(ctx, u, t, IMG) {
    let dark = false;
    if (u < 6.8) { if (u >= 6.2) sceneOld(ctx, u); sceneHook(ctx, u, IMG); }
    else if (u < 16) { sceneOld(ctx, u); sceneDrop(ctx, u); }
    else if (u < 24.6) { if (u >= 24.0) sceneFlow(ctx, u, IMG); sceneDrop(ctx, u); dark = u < 24.3; }
    else if (u < 44.0) { sceneFlow(ctx, u, IMG); sceneSell(ctx, u, IMG); dark = u >= 43.8; }
    else if (u < 48.05) { sceneSell(ctx, u, IMG); sceneEnd(ctx, u, IMG); dark = true; }
    else { sceneEnd(ctx, u, IMG); dark = true; }
    if (u < 63.2) captions(ctx, t, dark);
  },
});
