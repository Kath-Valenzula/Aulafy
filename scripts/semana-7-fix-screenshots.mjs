import { chromium } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');
const BASE = 'http://localhost:4200';

async function login(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: 'Correo' }).fill(email);
  await page.getByRole('textbox', { name: 'Contrasena' }).fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL(/\/app\//, { timeout: 15000 });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// COLEGIO RISK
await login(page, 'colegio@aulafy.cl', 'Colegio1234');
await page.goto(`${BASE}/app/risk`);
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 20000 });
await page.waitForSelector('text=Carlos Perez', { timeout: 20000 });
await page.screenshot({ path: join(OUT, 'BN-10_colegio_riesgo_academico.png'), fullPage: true });
await page.screenshot({ path: join(OUT, '4_Riesgo_academico_colegio.png'), fullPage: true });
console.log('OK risk colegio');

// ADMIN RISK
await page.getByRole('button', { name: 'Salir' }).click();
await login(page, 'admin@aulafy.cl', 'Admin1234');
await page.goto(`${BASE}/app/risk`);
await page.waitForSelector('text=Alumnos en riesgo', { timeout: 20000 });
await page.screenshot({ path: join(OUT, 'BN-10_admin_riesgo_academico.png'), fullPage: true });
console.log('OK risk admin');

// APODERADO CHAT
await page.getByRole('button', { name: 'Salir' }).click();
await login(page, 'apoderado@aulafy.cl', 'Apoderado1234');
await page.goto(`${BASE}/app/chat`);
await page.waitForSelector('text=Chat 6 Basico B', { timeout: 20000 });
await page.screenshot({ path: join(OUT, 'BN-05_apoderado_chat.png'), fullPage: true });
await page.screenshot({ path: join(OUT, '3_Chat_apoderado_funcionando.png'), fullPage: true });

const textarea = page.locator('textarea[placeholder="Escribe un mensaje..."]');
await textarea.fill('Mensaje de prueba Semana 7 desde apoderado');
await page.locator('button:has(span.material-symbols-outlined)').last().click();
await page.waitForSelector('text=Mensaje de prueba Semana 7 desde apoderado', { timeout: 10000 });
await page.screenshot({ path: join(OUT, 'BN-06_apoderado_enviar_mensaje.png'), fullPage: true });
console.log('OK chat apoderado + mensaje');

// ADMIN USERS
await page.getByRole('button', { name: 'Salir' }).click();
await login(page, 'admin@aulafy.cl', 'Admin1234');
await page.goto(`${BASE}/app/users`);
await page.waitForSelector('text=admin@aulafy.cl', { timeout: 20000 });
await page.screenshot({ path: join(OUT, 'BN-11_admin_usuarios.png'), fullPage: true });
console.log('OK admin users');

await browser.close();
