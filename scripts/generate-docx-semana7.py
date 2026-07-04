#!/usr/bin/env python3
"""Genera el DOCX oficial Semana 7 desde la plantilla Duoc UC."""

from __future__ import annotations

import shutil
from pathlib import Path

from docx import Document
from docx.shared import Inches

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = Path(
    "/Users/sbriceno/Documents/DUOC/SOFTWARE/TSY2201_EXP2_S7_Formato_respuesta_Finalizando el desarrollo de la solución.docx"
)
OUT = ROOT / "docs/semana-7/TSY2201_EXP2_S7_Formato_respuesta_Aulafy_Semana7.docx"
EVID = ROOT / "docs/semana-7/evidencias"


def set_cell_text(cell, text: str) -> None:
    cell.text = text


def add_paragraphs(cell, *blocks: str) -> None:
    cell.text = ""
    for i, block in enumerate(blocks):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.text = block


def main() -> None:
    if not TEMPLATE.exists():
        raise FileNotFoundError(f"Plantilla no encontrada: {TEMPLATE}")

    shutil.copy(TEMPLATE, OUT)
    doc = Document(str(OUT))

    info = doc.tables[0]
    set_cell_text(info.rows[0].cells[1], "Katherine Gisselle Valenzuela Moreno\nSebastián Alberto Briceño Inostroza")
    set_cell_text(info.rows[1].cells[0], "Asignatura:\nTaller Aplicado de Software")
    set_cell_text(info.rows[1].cells[1], "Carrera:\nIngeniería en Desarrollo de Software")
    set_cell_text(info.rows[2].cells[0], "Profesor:\nAlonso Esteban Castillo Pizarro")
    set_cell_text(info.rows[2].cells[1], "Fecha:\n4 de julio de 2026")

    link_proyecto = doc.tables[1].rows[1].cells[0]
    add_paragraphs(
        link_proyecto,
        "Repositorio GitHub: https://github.com/Kath-Valenzula/Aulafy",
        "Rama de entrega: develop (trabajo Semana 7 en feature/semana-7-documentacion-cierre).",
        "El repositorio contiene frontend Angular 21, backend NestJS, scripts MySQL, documentación por semana, workflows CI/CD y scripts AWS.",
        "Documentación Semana 7: docs/semana-7/ (plan de trabajo, resultados de pruebas y evidencias).",
    )

    link_sistema = doc.tables[2].rows[1].cells[0]
    add_paragraphs(
        link_sistema,
        "Frontend (Vercel — versión actual con fix UI): https://aulafy-web.vercel.app",
        "Frontend AWS S3 (build anterior): http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com",
        "Backend AWS Elastic Beanstalk: http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api",
        "Health check: http://aulafy-api-staging.eba-uuqbidym.us-east-2.elasticbeanstalk.com/api/health",
        "El entorno Vercel consume el mismo backend AWS mediante proxy /api. Base de datos: Amazon RDS MySQL 8.x (staging académico).",
    )

    avance_blocks = [
        "1. ESTADO GENERAL DEL AVANCE",
        "Aulafy alcanza en Semana 7 el cierre del MVP. Se completaron las funcionalidades planificadas, se ejecutaron pruebas finales (caja blanca, negra y gris) y el sistema permanece accesible en nube para revisión del docente.",
        "Arquitectura cliente-servidor con backend monolito modular NestJS (no microservicios). Integración continua con GitHub Actions.",
        "",
        "2. FUNCIONALIDADES IMPLEMENTADAS Y DISPONIBLES",
        "Autenticación JWT; dashboards por rol; muro académico; calendario; notas y evaluaciones; asistencia; anotaciones; chat interno por curso (REST); riesgo académico (promedio < 4.0 o asistencia < 85%); notificaciones Telegram opcionales; health check.",
        "Chat incluido en MVP para PROFESOR, APODERADO y ESTUDIANTE. Riesgo académico para ADMIN y COLEGIO.",
        "",
        "3. DEFINICIONES DE ALCANCE ACORDADAS CON EL DOCENTE",
        "Chat: DENTRO del MVP (Opción B). Limitación: sin WebSocket; recarga manual.",
        "Profesor jefe: campo role_in_course en course_teachers (HEAD_TEACHER, SUBJECT_TEACHER, ASSISTANT). Permisos diferenciados = mejora futura.",
        "Riesgo académico: alerta por bajo rendimiento o asistencia; no es módulo conductual.",
        "ADMIN = administración global; COLEGIO = operación institucional.",
        "",
        "4. VALIDACIONES Y PRUEBAS FINALES",
        "Caja blanca (Jest backend): 8 suites, 31 tests OK. Cobertura: Statements 62.87%, Branches 39.49%, Functions 50.51%, Lines 61.35%.",
        "Caja negra: 13 casos manuales OK en local; 12+ casos OK en AWS/Vercel (login multirol, muro, notas, asistencia, usuarios, health). Chat y riesgo OK en local y Vercel; en S3 AWS parcial por frontend sin redeploy.",
        "Caja gris: 4 flujos integrados OK (login→JWT→módulo académico; chat profesor; riesgo calculado; frontend Vercel→API Beanstalk).",
        "Build backend npm run build: OK. Build frontend npm run build:vercel: OK.",
        "Bug corregido: módulos chat, riesgo, usuarios y login quedaban en 'Cargando...' por Angular 21 sin zone.js; fix con ChangeDetectorRef.markForCheck().",
        "",
        "5. GESTIÓN DEL PROYECTO",
        "Integración: Pull Requests hacia develop desde ramas feature. Alcance alineado al MVP; mejoras futuras documentadas. Seguimiento con GitHub Issues y entregables semanales en docs/. Calidad: revisiones en equipo, pruebas automatizadas y manuales.",
        "",
        "6. DOCUMENTOS ACTUALIZADOS",
        "docs/semana-7/TSY2201_EXP2_S7_Documento_Presentacion.md; PLAN_TRABAJO_SEMANA7.md; RESULTADOS_PRUEBAS_LOCAL.md; evidencias/ (local, aws, vercel).",
        "backend/aulafy-api-nest/README.md; database/mysql/README.md; scripts de pruebas y deploy; configuración Vercel (vercel.json, middleware.ts).",
        "",
        "7. CUENTAS DEMO",
        "admin@aulafy.cl / Admin1234 | colegio@aulafy.cl / Colegio1234 | profesor@aulafy.cl / Profesor1234 | apoderado@aulafy.cl / Apoderado1234 | estudiante@aulafy.cl / Estudiante1234",
        "",
        "8. LIMITACIONES Y MEJORAS FUTURAS",
        "Chat sin tiempo real; permisos role_in_course no diferenciados en UI; umbrales de riesgo fijos; logout solo cliente; HTTP en S3; redeploy frontend S3 pendiente de credenciales AWS en GitHub Actions.",
        "",
        "9. EVIDENCIAS (docs/semana-7/evidencias/)",
        "1_GitHub_rama_semana7_documentacion_cierre.png; 6_Cobertura_tests_backend.png; 7_Matriz_pruebas_negras.png; 8_Build_frontend_OK.png;",
        "3_Chat_apoderado_funcionando.png; 4_Riesgo_academico_colegio.png; carpeta vercel/ (chat y riesgo en nube actualizada); carpeta aws/.",
    ]

    avance_cell = doc.tables[3].rows[1].cells[0]
    add_paragraphs(avance_cell, *avance_blocks)

    # Imágenes clave al final del documento
    doc.add_page_break()
    doc.add_paragraph("EVIDENCIAS — CAPTURAS SEMANA 7")
    images = [
        ("1_GitHub_rama_semana7_documentacion_cierre.png", "GitHub — rama feature/semana-7-documentacion-cierre"),
        ("6_Cobertura_tests_backend.png", "Cobertura tests backend Jest"),
        ("7_Matriz_pruebas_negras.png", "Matriz pruebas caja negra y gris"),
        ("8_Build_frontend_OK.png", "Build frontend exitoso"),
        ("vercel/2_Frontend_Vercel_login.png", "Login frontend Vercel"),
        ("vercel/4_Vercel_admin_chat_funcionando.png", "Chat funcionando — Vercel + Beanstalk"),
        ("vercel/5_Vercel_admin_riesgo_academico.png", "Riesgo académico — Vercel + Beanstalk"),
        ("vercel/1_Vercel_proxy_health_Beanstalk.png", "Health backend vía proxy Vercel"),
    ]
    for filename, caption in images:
        img_path = EVID / filename
        if img_path.exists():
            doc.add_paragraph(caption)
            doc.add_picture(str(img_path), width=Inches(6.2))
            doc.add_paragraph("")

    doc.save(str(OUT))
    print(f"DOCX generado: {OUT}")


if __name__ == "__main__":
    main()
