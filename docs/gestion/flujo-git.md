# Flujo Git

## Ramas

- `main`: rama estable. No se trabaja directo sobre esta rama.
- `develop`: integra avances validados del MVP.
- `feature/project-setup`: rama actual de preparacion tecnica, staging y mejoras del MVP.

## Flujo recomendado

1. Trabajar cambios en `feature/project-setup`.
2. Ejecutar pruebas y builds locales.
3. Revisar que no existan secretos en el repositorio.
4. Crear Pull Request hacia `develop`.
5. Revisar archivos modificados y checklist de PR.
6. Mergear a `develop` cuando los workflows esten manuales o los secretos ya esten configurados.
7. Mantener `main` para entregas estables o demo final.

## Reglas

- No subir tokens, publish profiles, passwords ni datos personales.
- No ejecutar despliegues cloud pagados sin autorizacion.
- Los commits deben ser simples y descriptivos.
- Cada PR debe dejar claro que se valido backend, frontend y documentacion.
