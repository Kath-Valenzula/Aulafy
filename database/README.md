# Base de datos

La base de datos objetivo del proyecto es MySQL para el backend NestJS.

Scripts activos de migracion:

- `database/mysql/schema.sql`
- `database/mysql/seed.sql`

Los archivos `database/schema.sql` y `database/seed.sql` se mantienen como respaldo del backend legado en Spring/PostgreSQL.

Comandos utiles:

```bash
docker compose up -d
mysql -h 127.0.0.1 -P 3306 -u root -p aulafy_db < database/mysql/schema.sql
mysql -h 127.0.0.1 -P 3306 -u root -p aulafy_db < database/mysql/seed.sql
```

Las contrasenas demo estan cifradas con BCrypt. Las credenciales reales de Telegram y base de datos deben configurarse por variables de entorno.
