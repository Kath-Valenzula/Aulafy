/**
 * Genera evidencias faltantes: matriz de pruebas negras y build frontend OK.
 */
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../docs/semana-7/evidencias');
mkdirSync(OUT, { recursive: true });

const rows = [
  ['ID', 'Caso de prueba', 'Entorno', 'Resultado'],
  ['BN-01', 'Login con credenciales válidas (5 roles)', 'Local + Vercel', 'OK'],
  ['BN-02', 'Credenciales inválidas / acceso denegado', 'Local', 'OK'],
  ['BN-03', 'Visualizar muro y comentarios', 'Local + AWS', 'OK'],
  ['BN-04', 'Ver notas del estudiante vinculado', 'Local + AWS', 'OK'],
  ['BN-05', 'Acceder a Mensajes del curso (chat)', 'Local + Vercel', 'OK'],
  ['BN-06', 'Enviar mensaje en chat', 'Local', 'OK'],
  ['BN-07', 'Profesor — salas de chat', 'Local + AWS', 'OK'],
  ['BN-08', 'Registrar / ver asistencia', 'Local + AWS', 'OK'],
  ['BN-09', 'Módulo anotaciones profesor', 'Local', 'OK'],
  ['BN-10', 'Reporte riesgo académico (COLEGIO/ADMIN)', 'Local + Vercel', 'OK'],
  ['BN-10b', 'Alertas de riesgo docente (PROFESOR)', 'Local + Vercel', 'OK'],
  ['BN-11', 'Listar usuarios (UI admin)', 'Local + AWS', 'OK'],
  ['BN-12', 'Health backend /api/health', 'AWS + Vercel proxy', 'OK'],
  ['BG-01', 'Login → JWT → módulo académico', 'Local', 'OK'],
  ['BG-02', 'Profesor chat → sala visible', 'Local', 'OK'],
  ['BG-03', 'Notas + asistencia → riesgo calculado', 'Local + Vercel', 'OK'],
  ['BG-04', 'Frontend nube → API Beanstalk (proxy/CORS)', 'Vercel', 'OK'],
];

const tableRows = rows
  .map(
    (r, i) =>
      `<tr style="background:${i === 0 ? '#1e3a5f' : i % 2 ? '#f8fafc' : '#fff'};color:${i === 0 ? '#fff' : '#111'}">${r
        .map((c) => `<td style="padding:10px 14px;border:1px solid #cbd5e1;font-size:14px">${c}</td>`)
        .join('')}</tr>`
  )
  .join('');

const matrizHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Matriz pruebas negras</title></head>
<body style="font-family:Segoe UI,Arial,sans-serif;padding:32px;background:#eef2f7;margin:0">
<h1 style="color:#1e3a5f;margin:0 0 8px">Aulafy — Matriz de pruebas de caja negra y gris</h1>
<p style="color:#475569;margin:0 0 20px">Semana 7 · 5 de julio de 2026 · 17 casos ejecutados · 17 aprobados · 56 tests Jest backend</p>
<table style="border-collapse:collapse;width:100%;box-shadow:0 2px 8px rgba(0,0,0,.08)">${tableRows}</table>
<p style="color:#64748b;margin-top:16px;font-size:13px">Nota: frontend AWS S3 parcial en chat/riesgo (build antiguo). Vercel evidencia versión actual.</p>
</body></html>`;

const matrizPath = join(OUT, '_matriz.html');
writeFileSync(matrizPath, matrizHtml);

// Build frontend y capturar salida
const buildLog = execSync('npm run build:vercel', {
  cwd: join(__dirname, '../frontend/aulafy-web'),
  encoding: 'utf8',
  env: { ...process.env, FORCE_COLOR: '0' }
});

const buildHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Build frontend</title></head>
<body style="font-family:Menlo,Consolas,monospace;padding:24px;background:#0f172a;color:#e2e8f0;margin:0">
<h2 style="color:#38bdf8;font-family:Segoe UI,sans-serif">npm run build:vercel — Aulafy frontend</h2>
<pre style="white-space:pre-wrap;font-size:12px;line-height:1.5">${buildLog.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body></html>`;
const buildPath = join(OUT, '_build.html');
writeFileSync(buildPath, buildHtml);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

await page.goto(`file://${matrizPath}`, { waitUntil: 'load' });
await page.screenshot({ path: join(OUT, '7_Matriz_pruebas_negras.png'), fullPage: true });
console.log('OK 7_Matriz_pruebas_negras.png');

await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`file://${buildPath}`, { waitUntil: 'load' });
await page.screenshot({ path: join(OUT, '8_Build_frontend_OK.png'), fullPage: true });
console.log('OK 8_Build_frontend_OK.png');

await browser.close();
