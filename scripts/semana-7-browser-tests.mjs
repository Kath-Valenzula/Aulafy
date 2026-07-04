import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:4200';
const USERS = {
  admin: { email: 'admin@aulafy.cl', password: 'Admin1234' },
  colegio: { email: 'colegio@aulafy.cl', password: 'Colegio1234' },
  profesor: { email: 'profesor@aulafy.cl', password: 'Profesor1234' },
  apoderado: { email: 'apoderado@aulafy.cl', password: 'Apoderado1234' },
  estudiante: { email: 'estudiante@aulafy.cl', password: 'Estudiante1234' },
};

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name), fullPage: true });
  console.log('OK', name);
}

async function waitForTextGone(page, text, timeout = 15000) {
  await page.locator(`text=${text}`).waitFor({ state: 'hidden', timeout }).catch(() => {});
  await page.waitForTimeout(500);
}

async function login(page, role) {
  const u = USERS[role];
  await page.goto(`${BASE}/login`);
  await page.getByRole('textbox', { name: 'Correo' }).fill(u.email);
  await page.getByRole('textbox', { name: 'Contrasena' }).fill(u.password);
  await page.getByRole('button', { name: /Entrar|Ingresando/ }).click();
  await page.waitForURL(/\/app\//, { timeout: 15000 });
}

async function logout(page) {
  const salir = page.getByRole('button', { name: 'Salir' });
  if (await salir.count()) {
    await salir.first().click();
    await page.waitForURL(/login/, { timeout: 10000 });
  } else {
    await page.goto(`${BASE}/login`);
  }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

// BN-01 login pantalla (already may exist)
await page.goto(`${BASE}/login`);
await shot(page, 'BN-01_login_pantalla.png');

// ADMIN
await login(page, 'admin');
await shot(page, 'BN-01_admin_dashboard.png');
await page.goto(`${BASE}/app/users`);
await waitForTextGone(page, 'Cargando usuarios');
await shot(page, 'BN-11_admin_usuarios.png');
await page.goto(`${BASE}/app/risk`);
await waitForTextGone(page, 'Cargando reporte de riesgo');
await shot(page, 'BN-10_admin_riesgo_academico.png');
await logout(page);

// COLEGIO
await login(page, 'colegio');
await shot(page, 'BN-01_colegio_dashboard.png');
await page.goto(`${BASE}/app/risk`);
await waitForTextGone(page, 'Cargando reporte de riesgo');
await shot(page, 'BN-10_colegio_riesgo_academico.png');
await logout(page);

// PROFESOR
await login(page, 'profesor');
await shot(page, 'BN-01_profesor_dashboard.png');
await page.goto(`${BASE}/app/attendance`);
await page.waitForTimeout(1500);
await shot(page, 'BN-08_profesor_asistencia.png');
await page.goto(`${BASE}/app/annotations`);
await page.waitForTimeout(1500);
await shot(page, 'BN-09_profesor_anotaciones.png');
await page.goto(`${BASE}/app/chat`);
await waitForTextGone(page, 'Cargando conversaciones');
await shot(page, 'BN-07_profesor_chat.png');
await logout(page);

// APODERADO
await login(page, 'apoderado');
await shot(page, 'BN-01_apoderado_dashboard.png');
await page.goto(`${BASE}/app/feed`);
await page.waitForTimeout(1500);
await shot(page, 'BN-03_apoderado_muro.png');
await page.goto(`${BASE}/app/academic`);
await page.waitForTimeout(1500);
await shot(page, 'BN-04_apoderado_notas.png');
await page.goto(`${BASE}/app/chat`);
await waitForTextGone(page, 'Cargando conversaciones');
await shot(page, 'BN-05_apoderado_chat.png');

// BN-06 send message
const textarea = page.locator('textarea[placeholder="Escribe un mensaje..."]');
if (await textarea.count()) {
  await textarea.fill('Mensaje de prueba Semana 7 desde apoderado');
  await page.locator('button:has(span.material-symbols-outlined)').last().click();
  await page.waitForTimeout(1500);
}
await shot(page, 'BN-06_apoderado_enviar_mensaje.png');

// BN-02 access denied risk
await page.goto(`${BASE}/app/risk`);
await page.waitForTimeout(1500);
await shot(page, 'BN-02_apoderado_acceso_denegado_risk.png');
await logout(page);

// ESTUDIANTE
await login(page, 'estudiante');
await shot(page, 'BN-01_estudiante_dashboard.png');
await page.goto(`${BASE}/app/academic`);
await page.waitForTimeout(1500);
await shot(page, 'BN-04_estudiante_notas.png');
await page.goto(`${BASE}/app/chat`);
await waitForTextGone(page, 'Cargando conversaciones');
await shot(page, 'BN-05_estudiante_chat.png');
await logout(page);

// BN-02 invalid login
await page.goto(`${BASE}/login`);
await page.getByRole('textbox', { name: 'Correo' }).fill('invalido@aulafy.cl');
await page.getByRole('textbox', { name: 'Contrasena' }).fill('WrongPass123');
await page.getByRole('button', { name: 'Entrar' }).click();
await page.waitForTimeout(2000);
await shot(page, 'BN-02_login_credenciales_invalidas.png');

// BG flows
await login(page, 'apoderado');
await page.goto(`${BASE}/app/academic`);
await page.waitForTimeout(1000);
await shot(page, 'BG-01_apoderado_login_modulo_academico.png');
await logout(page);

await login(page, 'profesor');
await page.goto(`${BASE}/app/chat`);
await waitForTextGone(page, 'Cargando conversaciones');
await shot(page, 'BG-02_profesor_chat_sala.png');
await logout(page);

await login(page, 'colegio');
await page.goto(`${BASE}/app/risk`);
await waitForTextGone(page, 'Cargando reporte de riesgo');
await shot(page, 'BG-03_colegio_riesgo_calculado.png');

// Health in browser
await page.goto('http://localhost:8080/api/health');
await shot(page, 'BN-12_health_backend.png');

await browser.close();
console.log('Screenshots saved to', OUT);
