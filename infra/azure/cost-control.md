# Control de costos Azure

El ambiente staging de Aulafy debe mantenerse bajo control porque usa una suscripcion academica.

## Criterios

- El Resource Group no deberia generar costo por si solo.
- PostgreSQL Flexible Server puede generar costo mensual por computo y almacenamiento.
- PostgreSQL detenido reduce computo, pero el almacenamiento puede seguir cobrando.
- App Service Plan puede seguir cobrando aunque la Web App este detenida.
- Static Web Apps Free es la opcion mas conveniente para el frontend.
- No crear recursos premium, Kubernetes, maquinas virtuales ni contenedores complejos.

## Recomendacion operativa

Crear recursos pagados solo el dia de demo o cuando sea necesario validar staging. Al terminar pruebas, detener recursos y evaluar eliminar el Resource Group completo si no se necesita mantener evidencia activa.

## Validacion antes de crear

1. Revisar SKU en Azure Portal.
2. Confirmar costo mensual estimado.
3. Confirmar que hay presupuesto academico disponible.
4. Registrar en el checklist que la creacion fue autorizada.
5. Configurar secretos solo en Azure App Settings o GitHub Secrets.
