# Infraestructura Azure

Esta carpeta deja preparados scripts seguros para administrar el ambiente staging de Aulafy.

No se ejecutan automaticamente y no contienen secretos reales. Antes de crear recursos pagados se debe revisar el costo en Azure Portal y contar con autorizacion explicita.

## Archivos

- `variables.example.ps1`: nombres de recursos y lectura de secretos desde variables de entorno.
- `create-staging.ps1`: creacion guiada del ambiente staging.
- `start-staging.ps1`: inicio de recursos existentes.
- `stop-staging.ps1`: detencion de recursos existentes.
- `delete-staging.ps1`: eliminacion completa del Resource Group.
- `cost-control.md`: criterios de costos y uso responsable.

## Uso sugerido

1. Copiar `variables.example.ps1` a `variables.local.ps1`.
2. Ajustar solo valores locales necesarios.
3. Definir secretos en variables de entorno de la sesion, no en archivos.
4. Ejecutar el script requerido desde PowerShell.

`variables.local.ps1` esta ignorado por Git.
