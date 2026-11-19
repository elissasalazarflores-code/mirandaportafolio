// Exporta cada <section class="s"> de estaticos.html a PNG 1080x1350.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  await p.goto('file://' + path.resolve(__dirname, 'estaticos.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const out = path.resolve(__dirname, '..');
  for (const id of await p.$$eval('section.s', els => els.map(e => e.id))) {
    const name = id.startsWith('c02') ? `C02_carrusel_${id.slice(4)}.png` : 'P03_post_60s.png';
    await (await p.$('#' + id)).screenshot({ path: path.join(out, name) }); console.log(name);
  }
  await b.close();
})();
