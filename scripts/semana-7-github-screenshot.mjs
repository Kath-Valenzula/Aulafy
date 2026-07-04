import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto('https://github.com/Kath-Valenzula/Aulafy/tree/develop', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
await page.screenshot({ path: join(OUT, '1_GitHub_rama_develop_semana7.png'), fullPage: false });
console.log('OK 1_GitHub_rama_develop_semana7.png');

await browser.close();
