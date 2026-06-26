#!/usr/bin/env bash
set -euo pipefail

# Aulafy - ejemplo seguro para guardar parametros en SSM Parameter Store.
# Uso seguro:
#   bash scripts/aws/put-parameters-example.sh
#
# Guardar placeholders reales configurados por variables de entorno:
#   CONFIRM_PUT_PARAMETERS=yes \
#   DB_HOST="endpoint-rds" \
#   DB_PASSWORD="password-seguro" \
#   JWT_SECRET="secreto-64-caracteres" \
#   bash scripts/aws/put-parameters-example.sh
#
# No guardar secretos reales en repositorio, README, Word ni capturas.

AWS_REGION="${AWS_REGION:-us-east-2}"
PARAM_PREFIX="${PARAM_PREFIX:-/aulafy/staging}"
CONFIRM_PUT_PARAMETERS="${CONFIRM_PUT_PARAMETERS:-no}"

DB_HOST="${DB_HOST:-CAMBIAR_DB_HOST}"
DB_PORT="${DB_PORT:-3306}"
DB_DATABASE="${DB_DATABASE:-aulafy_db}"
DB_USERNAME="${DB_USERNAME:-CAMBIAR_DB_USERNAME}"
DB_PASSWORD="${DB_PASSWORD:-CAMBIAR_DB_PASSWORD}"
JWT_SECRET="${JWT_SECRET:-CAMBIAR_JWT_SECRET_64_CARACTERES}"
FRONTEND_URL="${FRONTEND_URL:-http://aulafy-frontend-803615173905.s3-website.us-east-2.amazonaws.com}"

print_plan() {
  echo "Parametros SSM preparados en prefijo ${PARAM_PREFIX}:"
  echo "  ${PARAM_PREFIX}/DB_HOST"
  echo "  ${PARAM_PREFIX}/DB_PORT"
  echo "  ${PARAM_PREFIX}/DB_DATABASE"
  echo "  ${PARAM_PREFIX}/DB_USERNAME"
  echo "  ${PARAM_PREFIX}/DB_PASSWORD (SecureString)"
  echo "  ${PARAM_PREFIX}/JWT_SECRET (SecureString)"
  echo "  ${PARAM_PREFIX}/FRONTEND_URL"
}

print_plan

if [ "$CONFIRM_PUT_PARAMETERS" != "yes" ]; then
  echo ""
  echo "Modo seguro: no se guarda ningun parametro."
  echo "Para guardar, configurar valores reales por variables de entorno y ejecutar con CONFIRM_PUT_PARAMETERS=yes."
  exit 0
fi

for required in DB_HOST DB_USERNAME DB_PASSWORD JWT_SECRET FRONTEND_URL; do
  value="${!required}"
  if [[ "$value" == CAMBIAR_* ]]; then
    echo "ERROR: ${required} conserva placeholder. Configura un valor real fuera del repositorio."
    exit 1
  fi
done

aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/DB_HOST" --type String --value "$DB_HOST" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/DB_PORT" --type String --value "$DB_PORT" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/DB_DATABASE" --type String --value "$DB_DATABASE" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/DB_USERNAME" --type String --value "$DB_USERNAME" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/DB_PASSWORD" --type SecureString --value "$DB_PASSWORD" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/JWT_SECRET" --type SecureString --value "$JWT_SECRET" --overwrite
aws ssm put-parameter --region "$AWS_REGION" --name "${PARAM_PREFIX}/FRONTEND_URL" --type String --value "$FRONTEND_URL" --overwrite

echo "Parametros guardados en SSM. Revisar permisos IAM de Elastic Beanstalk antes de consumirlos automaticamente."
