#!/usr/bin/env bash
# Redeploy del backend NestJS a Elastic Beanstalk (cuenta sbriceno).
# Uso: bash scripts/aws/deploy-backend-eb.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/scripts/aws/staging.local.env"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Falta ${ENV_FILE}. Ejecuta primero: bash scripts/aws/deploy-infra-sbriceno.sh"
  exit 1
fi
# shellcheck disable=SC1090
source "${ENV_FILE}"

REGION="${AWS_REGION:-us-east-2}"
VERSION_LABEL="v-$(date +%Y%m%d-%H%M%S)"
ZIP_PATH="/tmp/aulafy-backend-${VERSION_LABEL}.zip"

echo "=== Deploy backend EB ==="
echo "App: ${AWS_EB_APPLICATION} | Env: ${AWS_EB_ENVIRONMENT} | Label: ${VERSION_LABEL}"

cd "${ROOT}/backend/aulafy-api-nest"
npm install
npm run build
echo "web: node dist/main.js" > Procfile
zip -r "${ZIP_PATH}" dist/ package.json package-lock.json Procfile

S3_KEY="aulafy-api/${VERSION_LABEL}.zip"
aws s3 cp "${ZIP_PATH}" "s3://${AWS_EB_DEPLOY_BUCKET}/${S3_KEY}" --region "${REGION}"

aws elasticbeanstalk create-application-version \
  --application-name "${AWS_EB_APPLICATION}" \
  --version-label "${VERSION_LABEL}" \
  --source-bundle "S3Bucket=${AWS_EB_DEPLOY_BUCKET},S3Key=${S3_KEY}" \
  --region "${REGION}"

aws elasticbeanstalk update-environment \
  --application-name "${AWS_EB_APPLICATION}" \
  --environment-name "${AWS_EB_ENVIRONMENT}" \
  --version-label "${VERSION_LABEL}" \
  --region "${REGION}"

aws elasticbeanstalk wait environment-updated \
  --application-name "${AWS_EB_APPLICATION}" \
  --environment-names "${AWS_EB_ENVIRONMENT}" \
  --region "${REGION}"

echo ""
echo "Backend actualizado: ${EB_URL:-}"
echo "Health: ${HEALTH_URL:-${EB_URL}/api/health}"
