import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');

const BRANCH = 'semana-7-new';
const REPO = 'https://github.com/Kath-Valenzula/Aulafy';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto(`${REPO}/tree/${BRANCH}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForSelector('[data-testid="branch-picker-repos-header-ref-selector"]', { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(3000);
await page.screenshot({
  path: join(OUT, '1_GitHub_rama_semana7_new.png'),
  fullPage: false
});
console.log('OK 1_GitHub_rama_semana7_new.png');

await browser.close();
