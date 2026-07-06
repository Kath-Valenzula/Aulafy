/**
 * Capturas de evidencia — frontend Vercel + backend Elastic Beanstalk (proxy /api).
 * URL: https://aulafy-web.vercel.app
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias/vercel');
mkdirSync(OUT, { recursive: true });

const BASE = 'https://aulafy-web.vercel.app';

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log('OK', name);
}

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.getByRole('textbox', { name: 'Correo' }).fill(email);
  await page.getByRole('textbox', { name: 'Contrasena' }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/app\//, { timeout: 25000 });
}

async function gotoApp(page, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
}

async function waitGone(page, text, timeout = 25000) {
  await page.locator(`text=${text}`).waitFor({ state: 'hidden', timeout }).catch(() => {});
  await page.waitForTimeout(800);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// Health vía proxy Vercel → Beanstalk
await page.goto(`${BASE}/api/health`, { waitUntil: 'networkidle' });
await shot(page, '1_Vercel_proxy_health_Beanstalk.png');

// Login
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
await shot(page, '2_Frontend_Vercel_login.png');

// Admin — dashboard, chat y riesgo (fixes Angular 21)
await login(page, 'admin@aulafy.cl', 'Admin1234');
await shot(page, '3_Vercel_admin_dashboard.png');
await gotoApp(page, '/app/chat');
await waitGone(page, 'Cargando conversaciones');
await page.waitForSelector('text=Conversación', { timeout: 20000 }).catch(() => {});
await shot(page, '4_Vercel_admin_chat_funcionando.png');
await gotoApp(page, '/app/risk');
await waitGone(page, 'Cargando reporte de riesgo');
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 20000 }).catch(() => {});
await shot(page, '5_Vercel_admin_riesgo_academico.png');

// Profesor — alertas de riesgo
await page.getByRole('button', { name: 'Salir' }).click();
await page.waitForURL(/login/, { timeout: 10000 });
await login(page, 'profesor@aulafy.cl', 'Profesor1234');
await gotoApp(page, '/app/risk');
await waitGone(page, 'Cargando reporte de riesgo');
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 20000 }).catch(() => {});
await shot(page, '9_Vercel_profesor_riesgo_academico.png');

// Colegio — riesgo
await page.getByRole('button', { name: 'Salir' }).click();
await page.waitForURL(/login/, { timeout: 10000 });
await login(page, 'colegio@aulafy.cl', 'Colegio1234');
await gotoApp(page, '/app/risk');
await waitGone(page, 'Cargando reporte de riesgo');
await shot(page, '6_Vercel_colegio_riesgo_academico.png');

// Apoderado — chat
await page.getByRole('button', { name: 'Salir' }).click();
await page.waitForURL(/login/, { timeout: 10000 });
await login(page, 'apoderado@aulafy.cl', 'Apoderado1234');
await gotoApp(page, '/app/chat');
await waitGone(page, 'Cargando conversaciones');
await shot(page, '7_Vercel_apoderado_chat_funcionando.png');
await gotoApp(page, '/app/guardian');
await page.waitForSelector('text=Mensajes del curso', { timeout: 15000 }).catch(() => {});
await shot(page, '10_Vercel_apoderado_dashboard_mensajes.png');

await browser.close();
console.log('Vercel screenshots saved to', OUT);
