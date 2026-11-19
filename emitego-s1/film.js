// EmiteGo Stories S1 "¿Cuánto tardas en facturar?" (9:16, 10 s). window.seek(t) paints frame t.
// Three frames for the Stories placement: question + poll, "menos de un minuto", CTA with swipe-up.
// VO emitego/vo/S1.mp3 placed +0.45 s so "EmiteGo" lands on the drop (beat 8).
import * as M from './lib/motion.js';

const { W, H, E, prog, lerp, clamp, springU, SPRING, wobble, font, layout, glyph, text, fill, crop, rrect, bump } = M;
const C = { navy: '#193357', ink: '#0F172A', slate: '#64748B', paper: '#F8FAFC', line: '#DCE3EC', white: '#FFFFFF', green: '#059669', mint: '#34D399' };
const D = 'Display', UI = 'UI';
const CAPS = await fetch('captions.json').then((r) => r.json());
const ROW = [1600, 657, 884, 78];

const HITS = [
  [0, 'pregunta', 'impact'],
  [2.6, 'UNA', 'pop', { pitch: 'E6' }],
  [3.4, 'encuesta', 'thud'],
  [5.6, 'tap', 'click'],
  [7.4, 'riser', 'riser', { len: 0.3 }],
  [8, 'drop', 'impact'],
  [9.7, 'menos de', 'pop', { pitch: 'A5' }],
  [10.4, 'fila', 'thud'],
  [11.0, 'minuto', 'bell', { pitch: 'E6' }],
  [12.8, 'cta', 'whoosh', { len: 0.4 }],
  [13.2, 'logo', 'bell', { pitch: 'A6' }],
  [14.8, 'flecha', 'boing', { pitch: 'C5', to: 'C6' }],
  [16.7, 'gratis', 'coins'],
];

function springWord(ctx, str, x, base, size, color, u0, u, align = 'left') {
  const f = font(size, 800, D), L = layout(ctx, str, f, -0.035 * size);
  const x0 = align === 'center' ? x - L.width / 2 : x;
  L.glyphs.forEach((g, j) => {
    const k = springU(u, u0 + j * 0.035, SPRING.bouncy);
    if (k <= 0.001) return;
    ctx.globalAlpha = clamp(k * 1.6); glyph(ctx, g.ch, x0 + g.cx, base + (1 - k) * size * 0.9, f, color); ctx.globalAlpha = 1;
  });
}
function captions(ctx, t, dark) {
  const c = CAPS.find((c) => t >= c.s - 0.05 && t <= c.e + 0.25);
  if (!c) return;
  ctx.font = font(44, 700, UI);
  const str = c.words.map((w) => w.w).join(' '), wFull = ctx.measureText(str).width, sp = ctx.measureText(' ').width;
  const h = 74, y = 1300, bw = wFull + 52, k = E.outBack(prog(t, c.s - 0.05, c.s + 0.12), 1.6);
  ctx.save(); ctx.globalAlpha = clamp(k * 2);
  rrect(ctx, (W - bw) / 2, y, bw, h, 18); ctx.fillStyle = dark ? 'rgba(255,255,255,.96)' : 'rgba(15,23,42,.88)'; ctx.fill();
  let x = (W - wFull) / 2;
  c.words.forEach((w) => {
    const on = t >= w.s - 0.02;
    ctx.fillStyle = on ? (dark ? C.navy : C.white) : (dark ? 'rgba(25,51,87,.45)' : 'rgba(255,255,255,.45)');
    if (on && t < w.s + 0.35 && /EmiteGo|minuto|gratis/.test(w.w)) ctx.fillStyle = C.green;
    ctx.textAlign = 'left'; ctx.fillText(w.w, x, y + 51); x += ctx.measureText(w.w).width + sp;
  });
  ctx.restore();
}

// ---- frame 1: question + poll  (u 0..8)
function f1(ctx, u) {
  fill(ctx, C.navy);
  const x = 80;
  springWord(ctx, '¿Cuánto tardas', x, 560, 118, C.white, -0.3, u);
  springWord(ctx, 'en hacer', x, 690, 118, C.white, 1.2, u);
  const kU = springU(u, 2.6, SPRING.wobbly);
  if (kU > 0) {
    const f = font(118, 800, D), w = 1 + 0.1 * wobble((u - 2.6) * 0.4687, 2.4, 5);
    const L = layout(ctx, 'UNA', f, -4);
    ctx.save(); ctx.translate(x + L.width / 2, 820); ctx.scale(kU * w, kU / w); text(ctx, 'UNA', 0, 0, f, C.mint, 'center', -4); ctx.restore();
    springWord(ctx, 'factura?', x + L.width + 30, 820, 118, C.white, 3.0, u);
  }
  // poll sticker
  const kp = springU(u, 3.4, SPRING.bouncy);
  if (kp > 0) {
    const pw = 760, ph = 330, px = (W - pw) / 2, py = 900;
    ctx.save(); ctx.translate(W / 2, py + ph / 2); ctx.rotate(-0.03 * (1 - kp)); ctx.scale(kp, kp); ctx.translate(-W / 2, -(py + ph / 2));
    ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    rrect(ctx, px, py, pw, ph, 34); ctx.fillStyle = C.white; ctx.fill(); ctx.shadowColor = 'transparent';
    text(ctx, 'ENCUESTA', W / 2, py + 62, font(28, 700, UI), C.slate, 'center', 3);
    const tap = springU(u, 5.6, SPRING.snappy);
    [['Más de 10 min', 0], ['Menos de 1 min', 1]].forEach(([lab, i]) => {
      const oy = py + 100 + i * 106;
      rrect(ctx, px + 36, oy, pw - 72, 88, 44);
      ctx.fillStyle = i === 0 && tap > 0 ? C.navy : '#EEF2F7'; ctx.fill();
      text(ctx, lab, W / 2, oy + 58, font(40, 700, UI), i === 0 && tap > 0 ? C.white : C.ink, 'center');
    });
    // finger tap ripple on "Más de 10 min"
    const rp = prog(u, 5.6, 6.6);
    if (rp > 0 && rp < 1) { ctx.beginPath(); ctx.arc(W / 2 + 200, py + 144, 20 + rp * 80, 0, 7); ctx.strokeStyle = `rgba(52,211,153,${1 - rp})`; ctx.lineWidth = 8; ctx.stroke(); }
    ctx.restore();
  }
}

// ---- frame 2: menos de un minuto  (u 7.4..13.2)
function f2(ctx, u, IMG) {
  const rise = E.outExpo(prog(u, 7.5, 8.0));
  const exit = E.inCubic(prog(u, 12.6, 13.2));
  ctx.save(); ctx.translate(-exit * W, 0);
  ctx.fillStyle = C.paper; ctx.fillRect(0, H * (1 - rise), W, H * rise + 2);
  if (u >= 8) {
    springWord(ctx, 'Con EmiteGo:', 80, 580, 72, C.slate, 7.9, u);
    springWord(ctx, 'menos de', 80, 730, 140, C.ink, 9.6, u);
    springWord(ctx, '1 minuto.', 80, 880, 140, C.green, 10.9, u);
    // stopwatch ring sweeping to under a minute
    const rk = springU(u, 8.3, SPRING.gentle), sweep = E.outCubic(prog(u, 8.6, 11.2)) * 0.85;
    const cx = W - 200, cy = 440;
    ctx.save(); ctx.globalAlpha = rk;
    ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, 92, 0, 7); ctx.strokeStyle = '#E2E8F0'; ctx.stroke();
    if (sweep > 0) { ctx.beginPath(); ctx.arc(cx, cy, 92, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2); ctx.strokeStyle = C.green; ctx.stroke(); }
    text(ctx, `${Math.max(1, Math.round(sweep / 0.85 * 52))} s`, cx, cy + 16, font(48, 800, D), C.ink, 'center');
    ctx.restore();
    // real stamped row from the site
    const kr = springU(u, 10.4, SPRING.bouncy);
    if (kr > 0 && IMG.hero) {
      const w = 920, h = w * ROW[3] / ROW[2], x = (W - w) / 2, y = 1010 + (1 - kr) * 200;
      ctx.save(); ctx.globalAlpha = clamp(kr * 1.5);
      ctx.shadowColor = 'rgba(15,23,42,.16)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
      rrect(ctx, x - 6, y - 6, w + 12, h + 12, 22); ctx.fillStyle = C.white; ctx.fill(); ctx.shadowColor = 'transparent';
      rrect(ctx, x, y, w, h, 16); ctx.clip(); crop(ctx, IMG.hero, ROW, x, y, w, h);
      ctx.restore();
      const g = bump(u, 11.4, 1.2);
      if (g > 0) { ctx.save(); ctx.globalAlpha = g; rrect(ctx, x - 10, y - 10, w + 20, h + 20, 24); ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
    }
  }
  ctx.restore();
}

// ---- frame 3: CTA + swipe up  (u 12.6..)
function f3(ctx, u, IMG) {
  const enter = 1 - E.outCubic(prog(u, 12.6, 13.2));
  ctx.save(); ctx.translate(enter * W, 0);
  fill(ctx, C.navy);
  const kl = springU(u, 13.2, SPRING.bouncy);
  const lh = 150, lw = lh * 1175 / 324;
  if (IMG.logoW) { ctx.save(); ctx.translate(W / 2, 410); ctx.scale(kl, kl); ctx.drawImage(IMG.logoW, -lw / 2, -lh / 2, lw, lh); ctx.restore(); }
  springWord(ctx, '15 días', W / 2, 680, 150, C.white, 13.5, u, 'center');
  springWord(ctx, 'gratis', W / 2, 830, 150, C.mint, 14.0, u, 'center');
  const kt = E.outCubic(prog(u, 14.6, 15.2));
  if (kt > 0) { ctx.globalAlpha = kt; text(ctx, 'sin tarjeta · factura en automático', W / 2, 920, font(44, 500, UI), '#B9C6DA', 'center'); ctx.globalAlpha = 1; }
  const kb = springU(u, 15.4, SPRING.snappy);
  if (kb > 0) {
    const press = 1 - 0.06 * bump(u, 16.9, 0.35);
    ctx.save(); ctx.translate(W / 2, 1090 + (1 - kb) * 100); ctx.scale(press, press); ctx.globalAlpha = clamp(kb * 1.5);
    rrect(ctx, -280, -58, 560, 116, 22); ctx.fillStyle = C.white; ctx.fill();
    text(ctx, 'Registrarte', 0, 17, font(48, 700, UI), C.navy, 'center');
    ctx.restore();
  }
  ctx.restore();
  // swipe-up arrow above the Stories CTA zone, bouncing
  const ka = springU(u, 14.8, SPRING.bouncy);
  if (ka > 0) {
    const bob = Math.sin((u - 14.8) * Math.PI) * 14;
    ctx.save(); ctx.globalAlpha = clamp(ka); ctx.translate(W / 2, 1440 - bob);
    ctx.strokeStyle = C.white; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(0, -34); ctx.lineTo(34, 0); ctx.stroke();
    text(ctx, 'Desliza', 0, 48, font(34, 700, UI), C.white, 'center', 2);
    ctx.restore();
  }
}

M.film({
  fonts: [font(100, 800, D), font(40, 500, UI), font(40, 700, UI)],
  images: { hero: 'assets/shots/section_00_tu-erp-vende.png', logoW: 'assets/logo/logo_blanco.png' },
  hits: HITS,
  draw(ctx, u, t, IMG) {
    let dark = true;
    if (u < 8) { f1(ctx, u); f2(ctx, u, IMG); dark = u < 7.9; }
    else if (u < 12.6) { f2(ctx, u, IMG); dark = false; }
    else { f2(ctx, u, IMG); f3(ctx, u, IMG); dark = u > 12.9; }
    captions(ctx, t, dark);
  },
});
