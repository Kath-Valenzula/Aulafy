# Base de datos MySQL — Aulafy

Scripts oficiales para entorno local (Docker Compose) y migraciones incrementales para Amazon RDS.

## Archivos principales

| Archivo | Uso |
|---------|-----|
| `schema.sql` | Esquema completo para instalacion nueva |
| `seed.sql` | Datos demo para revision academica |
| `migrations/*.sql` | Cambios incrementales para bases ya desplegadas |

## Entorno local (Docker Compose)

Al ejecutar `docker compose up -d` desde la raiz del repositorio, MySQL carga automaticamente `schema.sql` y `seed.sql` desde `/docker-entrypoint-initdb.d/`.

Para reiniciar desde cero:

```bash
docker compose down -v
docker compose up -d
```

## Migraciones en RDS (entorno AWS existente)

Si la base de datos en RDS **no** fue recreada con el esquema mas reciente, ejecutar las migraciones en este orden:

```bash
# 1. Estructura academica y puentes iniciales
mysql ... < migrations/20260530_academic_structure_bridge.sql
mysql ... < migrations/20260530_calendar_annotations_bridge.sql

# 2. Chat interno por curso
mysql ... < migrations/20260531_chat_bridge.sql

# 3. Notificaciones
mysql ... < migrations/20260531_notifications_bridge.sql

# 4. Profesor jefe (role_in_course)
mysql ... < migrations/20260626_add_role_in_course_to_course_teachers.sql

# 5. Datos demo de riesgo academico
mysql ... < migrations/20260627_seed_risk_demo_students.sql
```

> Cada script es idempotente o incluye comentarios sobre ejecucion unica. Revisar el contenido antes de aplicar en staging.

## Verificacion post-migracion

- Tablas `chat_rooms` y `chat_messages` existen.
- Columna `role_in_course` presente en `course_teachers`.
- Profesor demo con valor `HEAD_TEACHER`.
- Estudiantes Ana Gomez y Carlos Perez con perfiles de riesgo academico.

## Credenciales demo

Ver `seed.sql` y README raiz del proyecto.
