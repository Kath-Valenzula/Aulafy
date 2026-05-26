# Base de datos

El backend puede crear el esquema automaticamente con JPA usando `spring.jpa.hibernate.ddl-auto=update`. Los archivos `schema.sql` y `seed.sql` quedan como respaldo tecnico para revisar el modelo o cargar una base manualmente.

Comandos utiles:

```bash
docker compose up -d
psql -h localhost -U aulafy_user -d aulafy_db -f database/schema.sql
psql -h localhost -U aulafy_user -d aulafy_db -f database/seed.sql
```

Las contrasenas demo estan cifradas con BCrypt. Las credenciales reales de Telegram y base de datos deben configurarse por variables de entorno.
