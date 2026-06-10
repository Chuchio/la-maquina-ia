import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';
const width = parseInt(process.argv[4], 10) || 1440;
const height = parseInt(process.argv[5], 10) || 900;
const dsf = parseFloat(process.argv[6]) || 2;

const dir = path.join(__dirname, 'temporary screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`))) n++;
const outPath = path.join(dir, `screenshot-${n}${label ? '-' + label : ''}.png`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: dsf });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
await new Promise(r => setTimeout(r, 800));
// Force all fade-up animations to complete
await page.evaluate(() => {
  document.querySelectorAll('.fu').forEach(el => el.classList.add('vis'));
  document.getElementById('hcon')?.classList.add('hld');
});
await new Promise(r => setTimeout(r, 600));
// Horizontal-overflow probe: report elements extending past the right viewport edge
// (skips position:fixed and elements legitimately clipped by an overflow ancestor)
const ovf = await page.evaluate(() => {
  const d = document.documentElement;
  const clipped = el => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return true;
    }
    return false;
  };
  const offenders = [...document.querySelectorAll('body *')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.right > d.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' && !clipped(el);
    })
    .slice(0, 8)
    .map(el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ')[0]);
  return { scrollWidth: d.scrollWidth, clientWidth: d.clientWidth, offenders };
});
console.log('overflow-check:', JSON.stringify(ovf));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Saved: ${outPath}`);
