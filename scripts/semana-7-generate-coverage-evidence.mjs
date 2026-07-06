/**
 * Captura evidencia de cobertura Jest (npm run test:coverage).
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');
mkdirSync(OUT, { recursive: true });

const log = execSync('npm run test:coverage', {
  cwd: join(__dirname, '../backend/aulafy-api-nest'),
  encoding: 'utf8',
  env: { ...process.env, FORCE_COLOR: '0' }
});

const htmlPath = join(OUT, '_coverage.html');
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Cobertura Jest</title></head>
<body style="font-family:Menlo,Consolas,monospace;padding:24px;background:#0f172a;color:#e2e8f0;margin:0">
<h2 style="color:#38bdf8;font-family:Segoe UI,sans-serif">npm run test:coverage — Aulafy backend NestJS</h2>
<pre style="white-space:pre-wrap;font-size:11px;line-height:1.45">${log.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body></html>`;
writeFileSync(htmlPath, html);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto(`file://${htmlPath}`, { waitUntil: 'load' });
await page.screenshot({ path: join(OUT, '6_Cobertura_tests_backend.png'), fullPage: true });
await browser.close();
unlinkSync(htmlPath);
console.log('OK 6_Cobertura_tests_backend.png');
