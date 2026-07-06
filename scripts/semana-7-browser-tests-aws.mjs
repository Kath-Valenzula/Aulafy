import { chromium } from 'playwright';
import { mkdirSync, readFileSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'docs/semana-7/evidencias/aws');
const ENV_FILE = join(ROOT, 'scripts/aws/staging.local.env');
mkdirSync(OUT, { recursive: true });

function loadStagingEnv() {
  try {
    for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (m) process.env[m[1]] = m[2].trim();
    }
  } catch {
    console.warn('No se encontró staging.local.env; usando URLs por defecto.');
  }
}

loadStagingEnv();

const BASE = (process.env.FRONTEND_URL || 'http://aulafy-frontend-605134438568.s3-website.us-east-2.amazonaws.com').replace(/\/$/, '');
const HEALTH = process.env.HEALTH_URL || `${(process.env.EB_URL || 'http://aulafy-api-staging-sbriceno.eba-57zmbb7c.us-east-2.elasticbeanstalk.com').replace(/\/$/, '')}/api/health`;

console.log('Frontend AWS:', BASE);
console.log('Health:', HEALTH);

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log('OK', name);
}

async function openApp(page, path = '/') {
  await page.goto(`${BASE}${path === '/' ? '/' : path}`, { waitUntil: 'networkidle' });
  if (page.url().includes('404') || (await page.locator('text=404').count()) > 0) {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    if (path !== '/') {
      await page.evaluate((p) => history.pushState({}, '', p), path);
      await page.reload({ waitUntil: 'networkidle' });
    }
  }
}

async function login(page, email, password) {
  await openApp(page, '/');
  await page.waitForURL(/login/, { timeout: 15000 }).catch(async () => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  });
  await page.getByRole('textbox', { name: 'Correo' }).fill(email);
  await page.getByRole('textbox', { name: 'Contrasena' }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/app\//, { timeout: 20000 });
}

async function gotoApp(page, path) {
  await page.evaluate((p) => {
    window.history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);
  await page.waitForTimeout(1500);
  const current = new URL(page.url()).pathname;
  if (current !== path) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  }
  await page.waitForTimeout(1000);
}

async function waitGone(page, text, timeout = 20000) {
  await page.locator(`text=${text}`).waitFor({ state: 'hidden', timeout }).catch(() => {});
  await page.waitForTimeout(800);
}

async function logout(page) {
  const salir = page.getByRole('button', { name: 'Salir' });
  if (await salir.count()) {
    await salir.first().click();
    await page.waitForURL(/login/, { timeout: 10000 }).catch(() => {});
  } else {
    await openApp(page, '/');
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

await openApp(page, '/');
await page.waitForURL(/login/, { timeout: 15000 }).catch(() => {});
await shot(page, 'AWS_BN-01_login_pantalla.png');

// ADMIN
await login(page, 'admin@aulafy.cl', 'Admin1234');
await shot(page, 'AWS_BN-01_admin_dashboard.png');
await gotoApp(page, '/app/users');
await waitGone(page, 'Cargando usuarios');
await shot(page, 'AWS_BN-11_admin_usuarios.png');
await gotoApp(page, '/app/risk');
await waitGone(page, 'Cargando reporte de riesgo');
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 25000 }).catch(() => {});
await shot(page, 'AWS_BN-10_admin_riesgo.png');
await logout(page);

// COLEGIO
await login(page, 'colegio@aulafy.cl', 'Colegio1234');
await shot(page, 'AWS_BN-01_colegio_dashboard.png');
await gotoApp(page, '/app/risk');
await waitGone(page, 'Cargando reporte de riesgo');
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 25000 }).catch(() => {});
await shot(page, 'AWS_BN-10_colegio_riesgo.png');
await shot(page, '4_Riesgo_academico_colegio_AWS.png');
await logout(page);

// PROFESOR
await login(page, 'profesor@aulafy.cl', 'Profesor1234');
await shot(page, 'AWS_BN-01_profesor_dashboard.png');
await gotoApp(page, '/app/chat');
await waitGone(page, 'Cargando conversaciones');
await shot(page, 'AWS_BN-07_profesor_chat.png');
await gotoApp(page, '/app/attendance');
await page.waitForTimeout(1500);
await shot(page, 'AWS_BN-08_profesor_asistencia.png');
await logout(page);

// APODERADO
await login(page, 'apoderado@aulafy.cl', 'Apoderado1234');
await shot(page, 'AWS_BN-01_apoderado_dashboard.png');
await gotoApp(page, '/app/chat');
await waitGone(page, 'Cargando conversaciones');
await shot(page, 'AWS_BN-05_apoderado_chat.png');
await shot(page, '3_Chat_apoderado_funcionando_AWS.png');
await gotoApp(page, '/app/feed');
await page.waitForTimeout(1500);
await shot(page, 'AWS_BN-03_apoderado_muro.png');
await gotoApp(page, '/app/academic');
await page.waitForTimeout(1500);
await shot(page, 'AWS_BN-04_apoderado_notas.png');
await logout(page);

// ESTUDIANTE
await login(page, 'estudiante@aulafy.cl', 'Estudiante1234');
await shot(page, 'AWS_BN-01_estudiante_dashboard.png');
await gotoApp(page, '/app/chat');
await waitGone(page, 'Cargando conversaciones');
await shot(page, 'AWS_BN-05_estudiante_chat.png');
await logout(page);

// Health
await page.goto(HEALTH);
await shot(page, 'AWS_BN-12_health_backend.png');
await shot(page, '5_Backend_AWS_health.png');

// Frontend login alias
await openApp(page, '/');
await page.waitForURL(/login/, { timeout: 15000 }).catch(() => {});
await shot(page, '2_Frontend_AWS_login.png');

await browser.close();

// Alias numerados en carpeta raíz evidencias/
const aliases = [
  '2_Frontend_AWS_login.png',
  '3_Chat_apoderado_funcionando_AWS.png',
  '4_Riesgo_academico_colegio_AWS.png',
  '5_Backend_AWS_health.png',
];
for (const name of aliases) {
  copyFileSync(join(OUT, name), join(ROOT, 'docs/semana-7/evidencias', name));
}

console.log('AWS screenshots saved to', OUT);
