// FisApp reel (9:16): pure function of time. window.seek(t) paints frame t.
// Timed in beats on beats.json (120 bpm, 0.5 s/beat). Plan: docs/shotlist.md. VO: vo.json.
import * as M from './lib/motion.js';

const { W, H, FORMAT, E, prog, lerp, clamp, springU, springKeys, SPRING, wobble, shake, font, layout, glyph, text, fill, rrect, mix, bump, fitSize } = M;

// Brand tokens (assets/brand.json): one accent, the FisApp purple.
const C = {
  night: '#17142B', ink: '#262337', paper: '#F8F9FC', lav: '#EFEAFF',
  purple: '#6C5CE7', lilac: '#A78BFA', white: '#FFFFFF', muted: '#8A8999',
};
const D = 'Display', UI = 'UI';
const S = FORMAT.safe;            // 72..1008 x, 250..1490 y
const CX = W / 2;

// Real crops of the gathered screenshots: [image key, [sx, sy, sw, sh]] (see crops.json)
const CROPS = {
  step1: ['s05', [62, 275, 750, 413]],
  dash: ['s02', [1339, 227, 1036, 734]],
  balanza: ['s01', [1608, 240, 700, 531]],
  recibo: ['hero', [1747, 691, 701, 530]],
  badge: ['hero', [238, 526, 374, 64]],
  privado: ['s07', [50, 492, 1085, 393]],
  cifrada: ['s07', [1169, 492, 1085, 393]],
  segbadge: ['s07', [1036, 130, 231, 54]],
  cta: ['s08', [697, 122, 422, 106]],
  tagline: ['s08', [812, 288, 576, 55]],
};

const HITS = [
  [0, 'hook', 'impact'],
  [0.0, 'Todavía', 'pop', { pitch: 'E5' }],
  [0.9, 'haces tu', 'pop', { pitch: 'A5' }],
  [1.65, 'contabilidad', 'pop', { pitch: 'C6' }],
  [2.95, 'A MANO', 'thud'],
  [4.2, 'tachón', 'type', { len: 0.35 }],
  [5.25, 'punto', 'blip', { pitch: 'A6' }],
  [8, 'drop: FisApp', 'swell', { len: 1.2 }],
  [8, 'drop', 'impact'],
  [9.25, 'a cabecera', 'whoosh', { len: 0.4 }],
  [9.6, 'Conecta tu SAT', 'thud'],
  [11.75, 'swap a dashboard', 'whoosh', { len: 0.4, from: 2400, to: 600 }],
  [12, 'dash', 'thud'],
  [14.5, 'en automático', 'tick'],
  [16.5, 'barrido', 'whoosh', { len: 0.45 }],
  [16.75, 'IVA', 'pop', { pitch: 'A5' }],
  [18.3, 'DIOT', 'pop', { pitch: 'C6' }],
  [19.3, 'Balanza', 'pop', { pitch: 'E6' }],
  [20.25, 'tarjeta balanza', 'thud'],
  [22, 'clic', 'click'],
  [22, 'clic bell', 'bell', { pitch: 'E6' }],
  [23.5, 'onda', 'riser', { len: 0.25 }],
  [24, 'nómina', 'impact'],
  [27.3, 'calculada', 'blip', { pitch: 'A5' }],
  [29.1, 'timbrada', 'blip', { pitch: 'C6' }],
  [30.3, 'contabilizada', 'blip', { pitch: 'E6' }],
  [31.0, 'recibo', 'thud'],
  [31.75, 'neto', 'coins'],
  [33, 'whip', 'whoosh', { len: 0.4, from: 600, to: 2400 }],
  [34.75, 'tarjeta privado', 'thud'],
  [36.5, 'tarjeta cifrada', 'thud'],
  [37.6, 'control', 'tick'],
  [39.5, 'punto cae', 'thud'],
  [39.75, 'wordmark', 'bell', { pitch: 'A6' }],
  [41.6, 'tagline', 'tick'],
  [45.75, 'CTA', 'pop', { pitch: 'A5' }],
  [48, 'cierre', 'impact'],
];

// ------------------------------------------------------------------ helpers
let IMG = {};
// Pop a word glyph by glyph. color may be a function (j, n) => colour.
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
// A real crop as a floating card centred at (cx, cy), width w.
function card(ctx, key, cx, cy, w, o = {}) {
  const [ik, [sx, sy, sw, sh]] = CROPS[key];
  const img = IMG[ik]; const h = w * sh / sw; const r = o.r ?? 30;
  if (!img) return h;
  ctx.save();
  ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(o.s ?? 1, o.s ?? 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if (o.shadow !== false) {
    ctx.shadowColor = o.shadowColor || 'rgba(38,35,55,0.30)'; ctx.shadowBlur = 70; ctx.shadowOffsetY = 28;
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

// The FisApp wordmark set in the brand face: "Fis" ink, "App" purple->lilac, then the dot.
function wordmark(ctx, x, y, size, u, u0, o = {}) {
  const f = font(size, 800, D), tr = -0.04 * size;
  const Lf = layout(ctx, 'Fis', f, tr), La = layout(ctx, 'App', f, tr);
  const total = Lf.width + La.width + size * 0.28;
  const x0 = x - total * (o.anchor ?? 0.5);
  popWord(ctx, 'Fis', x0, y, size, o.fis || C.ink, u, u0, { stagger: 0.05 });
  popWord(ctx, 'App', x0 + Lf.width + size * 0.01, y, size, o.app || appGrad, u, u0 + 0.15, { stagger: 0.05 });
  const dk = springU(u, u0 + 0.5, SPRING.wobbly);
  const dx = x0 + Lf.width + La.width + size * 0.15, dy = y - size * 0.05;
  if (!o.noDot && dk > 0) dot(ctx, dx, dy, size * 0.075 * dk, o.dot || C.purple);
  return { dx, dy, w: total };
}

// ------------------------------------------------------------------ S1 hook (0..8)
function sceneHook(ctx, u) {
  fill(ctx, C.night);
  // paperwork ghosts: rows of XML / CFDI drifting, the manual mess
  ctx.save(); ctx.globalAlpha = 0.07;
  for (let r = 0; r < 16; r++) {
    const y = 180 + r * 112, dir = r % 2 ? 1 : -1;
    const off = ((u * 26 * dir + r * 137) % 420 + 420) % 420;
    text(ctx, 'XML · CFDI · PÓLIZA · XML · CFDI · IVA · XML · CFDI · PÓLIZA · ', -420 + off, y, font(64, 800, D), C.white);
  }
  ctx.restore();
  softGlow(ctx, W * 0.85, H * 0.2, 700, C.purple, 0.35);

  ctx.save();
  shake(ctx, u, 2.95, 22, 5, 0.18);
  const x = S.x + 6;
  const ex = E.inBack(prog(u, 7.0, 7.7), 1.6); // words drop away as the dot takes over
  ctx.translate(0, ex * 300);
  ctx.globalAlpha = 1 - prog(u, 7.3, 7.7);
  popWord(ctx, '¿Todavía', x, 760, 168, C.white, u, -0.3);
  popWord(ctx, 'haces tu', x, 940, 168, C.white, u, 0.8);
  const cs = fitSize(ctx, 'contabilidad', 800, D, S.w, 170, -0.035);
  popWord(ctx, 'contabilidad', x, 940 + cs * 1.05, cs, C.white, u, 1.55, { stagger: 0.018 });
  // A MANO? huge, lilac, with weight
  const ms = fitSize(ctx, 'A MANO?', 800, D, S.w, 260, -0.04);
  const my = 940 + cs * 1.05 + ms * 1.08;
  popWord(ctx, 'A MANO?', x, my, ms, appGrad, u, 2.8, { stagger: 0.035, spring: SPRING.wobbly, track: -0.04 });
  // the strike: a hand-drawn white zigzag across "A MANO?"
  const sp = E.outCubic(prog(u, 4.2, 4.9));
  if (sp > 0) {
    const L = layout(ctx, 'A MANO?', font(ms, 800, D), -0.04 * ms);
    ctx.save(); ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.white;
    ctx.beginPath();
    const pts = 7, y0 = my - ms * 0.36;
    for (let i = 0; i <= pts * sp; i++) {
      const px = x - 10 + (L.width + 20) * (i / pts), py = y0 + (i % 2 ? -26 : 26) + i * 2;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // brand dot arrives and grows to cover the frame (log-space dolly)
  const dk = springU(u, 5.25, SPRING.bouncy);
  if (dk > 0) {
    const gp = E.inCubic(prog(u, 6.8, 8));
    const r = gp > 0 ? logR(64, 2300, gp) : 64 * dk * (1 + 0.2 * wobble(u - 5.55, 3, 5));
    dot(ctx, W - S.x - 70, lerp(1500, H / 2, E.inOutCubic(gp)), r);
  }
}

// ------------------------------------------------------------------ S2 drop: wordmark, SAT, dashboard (8..16.5)
function sceneDrop(ctx, u) {
  fill(ctx, C.purple);
  softGlow(ctx, W * 0.1, H * 0.85, 900, C.lilac, 0.55);
  softGlow(ctx, W * 0.9, H * 0.1, 700, '#8F7CF0', 0.6);
  // wordmark: big centre on the drop, then rises to a header (log scale)
  const hp = springU(u, 9.25, SPRING.gentle);
  const size = logR(250, 120, clamp(hp));
  const y = lerp(H * 0.5, S.y + 90, hp);
  ctx.save();
  const q = 0.05 * wobble(u - 8, 2.2, 5);
  ctx.translate(CX, y); ctx.scale(1 + q, 1 - q); ctx.translate(-CX, -y);
  wordmark(ctx, CX, y, size, u, 7.55, { fis: C.white, app: (j, n) => mix('#E9E4FF', '#FFFFFF', j / (n - 1)), dot: C.white });
  ctx.restore();
  const sub = E.outQuint(prog(u, 8.5, 9)) * (1 - prog(u, 9.1, 9.4));
  if (sub > 0) { ctx.globalAlpha = sub; text(ctx, 'Tu información fiscal en un solo lugar.', CX, H * 0.5 + 110 + (1 - sub) * 30, font(52, 500, UI), '#EDE9FF', 'center'); ctx.globalAlpha = 1; }

  // card 1: Conecta tu SAT (real step card)
  const k1 = springU(u, 9.5, SPRING.snappy);
  const out1 = E.inOutCubic(prog(u, 11.6, 12.1));
  if (k1 > 0 && out1 < 1) {
    ctx.save(); ctx.translate(-out1 * W, 0);
    popWord(ctx, 'Conecta', S.x + 6, 1310, 120, C.white, u, 9.6, { stagger: 0.02 });
    popWord(ctx, 'tu SAT.', S.x + 6, 1440, 120, '#E2DBFF', u, 10.0, { stagger: 0.03, spring: SPRING.wobbly });
    ctx.restore();
    card(ctx, 'step1', CX - out1 * W, lerp(H + 400, 800, k1), 940, { rot: lerp(0.08, -0.02, k1), shadowColor: 'rgba(20,10,60,0.35)' });
  }
  // card 2: the real dashboard, pushes in toward "CFDI emitidos 312"
  const k2 = springU(u, 11.8, SPRING.snappy);
  if (k2 > 0) {
    const z = springKeys(u, [[12, 1], [13.2, 1.16]], SPRING.gentle);
    const cx = W * (1 - k2) + CX * k2 - (z - 1) * 260;
    const cy = 760 + (z - 1) * 180;
    card(ctx, 'dash', cx, cy, 940 * z, { r: 30 * z, shadowColor: 'rgba(20,10,60,0.35)' });
  }
  // super: CFDI en automático
  if (u > 13.0) {
    popWord(ctx, 'Tus CFDI,', S.x + 6, 1330, 110, C.white, u, 13.1, { stagger: 0.02 });
    popWord(ctx, 'en automático.', S.x + 6, 1450, 110, '#E2DBFF', u, 14.4, { stagger: 0.02 });
  }
}

// ------------------------------------------------------------------ S3 IVA · DIOT · Balanza · clic (16.5..24)
const CLICK = [CX + 180, 1110];
function chip(ctx, label, x, y, size, u, u0, filled) {
  const k = springU(u, u0, SPRING.bouncy); if (k <= 0) return;
  const f = font(size, 800, D); const L = layout(ctx, label, f, -0.03 * size);
  const pw = L.width + size * 0.9, ph = size * 1.45;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.shadowColor = 'rgba(108,92,231,0.35)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
  rrect(ctx, -pw / 2, -ph / 2, pw, ph, ph / 2);
  ctx.fillStyle = filled ? C.purple : C.white; ctx.fill(); ctx.shadowColor = 'transparent';
  if (!filled) { ctx.lineWidth = 4; ctx.strokeStyle = '#DCD5FB'; ctx.stroke(); }
  text(ctx, label, 0, size * 0.36, f, filled ? C.white : C.purple, 'center', -0.03 * size);
  ctx.restore();
}
function sceneModules(ctx, u) {
  fill(ctx, C.paper);
  softGlow(ctx, W * 0.9, H * 0.15, 800, '#DCD3FF', 0.9);
  softGlow(ctx, W * 0.05, H * 0.75, 700, '#EAE4FF', 0.9);
  // chips stamp on each word, then tuck up into a row
  const tuck = springU(u, 20, SPRING.gentle);
  const big = lerp(150, 54, tuck);
  const rows = [['IVA', 16.55, -190, 560], ['DIOT', 18.3, 150, 860], ['Balanza', 19.3, -40, 1160]];
  const rowX = [CX - 300, CX - 60, CX + 250];
  rows.forEach(([l, u0, dx, y], i) => {
    chip(ctx, l, lerp(CX + dx, rowX[i], tuck), lerp(y, S.y + 70, tuck), big, u, u0, i === rows.length - 1 || tuck > 0.5);
  });
  // real balanza card lands
  const kb = springU(u, 20.1, SPRING.snappy);
  if (kb > 0) {
    const press = 1 - 0.035 * bump(u, 22.05, 0.25);
    card(ctx, 'balanza', CX, lerp(H + 450, 790, kb), 900, { s: press, rot: lerp(-0.1, 0, kb) });
  }
  // "con un solo clic."
  if (u > 20.9) {
    popWord(ctx, 'Con un solo', S.x + 6, 1330, 104, C.ink, u, 21.0, { stagger: 0.02 });
    popWord(ctx, 'clic.', S.x + 6, 1450, 120, appGrad, u, 22.0, { stagger: 0.04, spring: SPRING.wobbly });
  }
  // the brand dot as cursor: glides in, taps at 22, ripple
  const ck = springU(u, 21.0, SPRING.gentle);
  if (ck > 0) {
    const [px, py] = CLICK;
    const x = lerp(W + 80, px, ck), y = lerp(1500, py, ck);
    const tap = 1 - 0.35 * bump(u, 22.0, 0.2);
    const rp = prog(u, 22.0, 23.0);
    if (rp > 0 && rp < 1) { ctx.save(); ctx.globalAlpha = 1 - rp; ctx.lineWidth = 8; ctx.strokeStyle = C.purple; ctx.beginPath(); ctx.arc(px, py, lerp(20, 170, E.outCubic(rp)), 0, 7); ctx.stroke(); ctx.restore(); }
    dot(ctx, x, y, 30 * tap);
    ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = C.white; ctx.beginPath(); ctx.arc(x, y, 30 * tap, 0, 7); ctx.stroke(); ctx.restore();
  }
}

// ------------------------------------------------------------------ S4 Nómina (24..33)
function check(ctx, x, y, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  dot(ctx, 0, 0, s, C.purple);
  ctx.lineWidth = s * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.white;
  ctx.beginPath(); ctx.moveTo(-s * 0.42, 0); ctx.lineTo(-s * 0.1, s * 0.32); ctx.lineTo(s * 0.45, -s * 0.33); ctx.stroke();
  ctx.restore();
}
function sceneNomina(ctx, u) {
  fill(ctx, C.night);
  softGlow(ctx, W * 0.15, H * 0.2, 800, C.purple, 0.45);
  softGlow(ctx, W * 0.95, H * 0.85, 700, C.purple, 0.35);
  // the list rises as the receipt comes in
  const lift = springU(u, 30.85, SPRING.gentle) * 120;
  ctx.save(); ctx.translate(0, -lift);
  // real "MÓDULO LIBERADO" pill from the hero
  const kb = springU(u, 23.85, SPRING.bouncy);
  if (kb > 0) card(ctx, 'badge', S.x + 6 + 290, 320, 580, { r: 50, s: kb, shadow: false });
  popWord(ctx, 'Y ahora:', S.x, 470, 96, C.lilac, u, 24.0, { stagger: 0.02 });
  popWord(ctx, 'Nómina', S.x, 690, 210, C.white, u, 25.3, { stagger: 0.03, spring: SPRING.wobbly });
  const items = [['calculada', 27.3], ['timbrada', 29.1], ['contabilizada', 30.3]];
  items.forEach(([w, u0], i) => {
    const y = 830 + i * 108;
    check(ctx, S.x + 40, y - 30, 34, springU(u, u0 - 0.1, SPRING.bouncy));
    popWord(ctx, w, S.x + 100, y, 92, i === 2 ? appGrad : '#E6E1FF', u, u0, { stagger: 0.02 });
  });
  ctx.restore();
  // real payroll receipt, then push toward "Neto a pagar"
  const kr = springU(u, 30.85, SPRING.snappy);
  if (kr > 0) {
    const z = springKeys(u, [[31.5, 1], [32.1, 1.18]], SPRING.gentle);
    card(ctx, 'recibo', CX + (z - 1) * -220, lerp(H + 500, 1230, kr) - (z - 1) * 330, 860 * z, { r: 34 * z, shadowColor: 'rgba(0,0,0,0.5)' });
  }
}

// ------------------------------------------------------------------ S5 Seguridad (33..39.5)
function sceneSecure(ctx, u, bg = true) {
  if (bg) { fill(ctx, C.paper); softGlow(ctx, W * 0.85, H * 0.8, 800, '#E3DBFF', 0.9); }
  const ex = E.inBack(prog(u, 38.85, 39.3), 1.5);
  ctx.save(); ctx.translate(0, -ex * 900);
  const kb = springU(u, 33.2, SPRING.bouncy);
  if (kb > 0) card(ctx, 'segbadge', S.x + 6 + 185, 320, 370, { r: 43, s: kb, shadow: false });
  popWord(ctx, 'Tus sellos', S.x, 480, 116, C.ink, u, 33.2, { stagger: 0.02 });
  popWord(ctx, 'y tu e.firma,', S.x, 600, 116, C.ink, u, 34.3, { stagger: 0.02 });
  popWord(ctx, 'bajo tu', S.x, 720, 116, appGrad, u, 36.4, { stagger: 0.02 });
  popWord(ctx, 'control.', S.x, 840, 116, appGrad, u, 37.4, { stagger: 0.03, spring: SPRING.wobbly });
  ctx.restore();
  ctx.save(); ctx.translate(0, ex * 1100);
  const k1 = springU(u, 34.75, SPRING.snappy), k2 = springU(u, 36.4, SPRING.snappy);
  if (k1 > 0) card(ctx, 'privado', lerp(-500, CX - 10, k1), 1150, 960, { rot: lerp(-0.25, -0.035, k1) });
  if (k2 > 0) card(ctx, 'cifrada', lerp(W + 500, CX + 20, k2), 1360, 960, { rot: lerp(0.25, 0.03, k2) });
  ctx.restore();
}

// ------------------------------------------------------------------ S6 End card (39.5..52)
function sceneEnd(ctx, u) {
  fill(ctx, C.paper);
  softGlow(ctx, W * 0.5, H * 0.42, 900, '#DDD3FF', lerp(0.4, 1, prog(u, 39.5, 41)));
  // the dot falls to centre, then the wordmark builds around it
  const wy = 760, size = 230;
  const geo = (() => { const f = font(size, 800, D), tr = -0.04 * size; const a = layout(ctx, 'Fis', f, tr).width, b = layout(ctx, 'App', f, tr).width; const tot = a + b + size * 0.28; return { dx: CX - tot / 2 + a + b + size * 0.15, dy: wy - size * 0.05 }; })();
  const fall = E.outBounce(prog(u, 38.9, 39.5));
  const dr = lerp(70, size * 0.075, E.outCubic(prog(u, 39.5, 40.0))) * (1 + 0.2 * wobble(u - 39.5, 3, 6));
  if (u < 41) dot(ctx, lerp(CX, geo.dx, E.outCubic(prog(u, 39.5, 40.0))), lerp(-80, geo.dy, fall), dr);
  ctx.save();
  const q = 0.04 * wobble(u - 40, 2.2, 5);
  ctx.translate(CX, wy); ctx.scale(1 + q, 1 - q); ctx.translate(-CX, -wy);
  wordmark(ctx, CX, wy, size, u, 39.45, { noDot: true });
  if (u >= 41) dot(ctx, geo.dx, geo.dy, size * 0.075);
  ctx.restore();
  // the brand's own line, real asset
  const kt = springU(u, 41.55, SPRING.snappy);
  if (kt > 0) card(ctx, 'tagline', CX, 910 + (1 - kt) * 40, 940, { shadow: false, alpha: clamp(kt), r: 0 });
  // CTA: the real button, pulsing on the downbeats after it lands
  const kc = springU(u, 45.6, SPRING.bouncy);
  if (kc > 0) {
    const pulse = 1 + 0.06 * bump(u, 48, 0.35) + 0.03 * (u > 48.5 ? bump(((u - 48) % 2), 0, 0.3) : 0);
    card(ctx, 'cta', CX, 1130, 720, { s: kc * pulse, r: 90, shadowColor: 'rgba(108,92,231,0.45)' });
  }
  if (u > 46.3) {
    const f = font(50, 500, UI);
    const k = E.outQuint(prog(u, 46.4, 47));
    ctx.globalAlpha = k; text(ctx, 'Prueba 15 días gratis', CX, 1300 + (1 - k) * 30, f, C.ink, 'center'); ctx.globalAlpha = 1;
  }
  if (u > 47.5) popWord(ctx, 'fisapp.com.mx', CX, 1420, 64, C.purple, u, 47.8, { align: 'center', stagger: 0.015, track: -0.01 });
}

// ------------------------------------------------------------------ timeline + transitions
function frame(ctx, u) {
  if (u < 8) return sceneHook(ctx, u);
  if (u < 16.5) {
    if (u < 16.25) return sceneDrop(ctx, u);
  }
  if (u < 16.75 && u >= 16.25) {   // vertical whip: drop slides up, modules rise in
    const p = E.inOutCubic(prog(u, 16.25, 16.75));
    ctx.save(); ctx.translate(0, -p * H); sceneDrop(ctx, u); ctx.restore();
    ctx.save(); ctx.translate(0, (1 - p) * H); sceneModules(ctx, u); ctx.restore();
    return;
  }
  if (u < 24) {
    sceneModules(ctx, u);
    const gp = prog(u, 23.2, 24);       // the click ripple becomes a circle of night
    if (gp > 0) {
      const r = logR(30, 2400, E.inCubic(gp));
      ctx.save(); ctx.beginPath(); ctx.arc(CLICK[0], CLICK[1], r, 0, 7); ctx.clip(); sceneNomina(ctx, u); ctx.restore();
    }
    return;
  }
  if (u < 32.75) return sceneNomina(ctx, u);
  if (u < 33.25) {                    // horizontal whip
    const p = E.inOutCubic(prog(u, 32.75, 33.25));
    ctx.save(); ctx.translate(-p * W, 0); sceneNomina(ctx, u); ctx.restore();
    ctx.save(); ctx.translate((1 - p) * W, 0); sceneSecure(ctx, u); ctx.restore();
    return;
  }
  if (u < 39.0) return sceneSecure(ctx, u);
  if (u < 39.35) { sceneEnd(ctx, u); sceneSecure(ctx, u, false); return; }
  sceneEnd(ctx, u);
}

M.film({
  fonts: [font(100, 800, D), font(40, 500, UI)],
  images: {
    hero: 'assets/shots/desktop_viewport.png',
    s01: 'assets/shots/section_01_tu-contabilidad-completa-de-tus-cfdi-al-.png',
    s02: 'assets/shots/section_02_todo-lo-que-necesitas-de-tu-informaci-n-.png',
    s05: 'assets/shots/section_05_c-mo-funciona-fisapp.png',
    s07: 'assets/shots/section_07_tus-sellos-y-tu-e-firma-bajo-tu-control.png',
    s08: 'assets/shots/section_08_section.png',
  },
  init(ctx, images) { IMG = images; },
  hits: HITS,
  draw(ctx, u) { frame(ctx, u); },
});
