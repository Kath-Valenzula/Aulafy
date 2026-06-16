# Base de datos

La base de datos objetivo del proyecto es MySQL para el backend NestJS.

Scripts oficiales:

- `database/mysql/schema.sql`
- `database/mysql/seed.sql`

Comandos utiles:

```bash
docker compose down -v
docker compose up -d
```

Docker Compose monta los scripts oficiales en `/docker-entrypoint-initdb.d/` para que MySQL cree el esquema y cargue datos demo automaticamente al inicializar un volumen vacio. Si el volumen ya existe, MySQL no vuelve a ejecutar los scripts; para reconstruir la base desde cero se debe usar `docker compose down -v` antes de levantar el servicio nuevamente.

Las contrasenas demo estan cifradas con BCrypt. Las credenciales reales de Telegram y base de datos deben configurarse por variables de entorno.
