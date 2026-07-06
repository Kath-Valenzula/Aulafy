#!/usr/bin/env bash
# Despliega el frontend Angular (build staging) al bucket S3.
#
# Requisitos:
#   - AWS CLI configurado (aws sts get-caller-identity debe funcionar)
#   - Node 22+ (nvm use 22)
#   - scripts/aws/staging.local.env (generado por deploy-infra-sbriceno.sh)
#
# Uso:
#   bash scripts/aws/deploy-frontend-s3.sh
#
# Variables opcionales (sobreescriben staging.local.env):
#   AWS_REGION=us-east-2
#   AWS_S3_BUCKET_STAGING=aulafy-frontend-ACCOUNT_ID

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/scripts/aws/staging.local.env"
if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
fi
REGION="${AWS_REGION:-us-east-2}"
BUCKET="${AWS_S3_BUCKET_STAGING:-aulafy-frontend-803615173905}"
DIST="${ROOT}/frontend/aulafy-web/dist/aulafy-web/browser"

echo "=== Aulafy Frontend S3 Deploy ==="
echo "Region: ${REGION}"
echo "Bucket: ${BUCKET}"

aws sts get-caller-identity --region "${REGION}" >/dev/null

STAGING_ENV="${ROOT}/frontend/aulafy-web/src/environments/environment.staging.ts"
if [[ -n "${EB_URL:-}" ]]; then
  cat > "${STAGING_ENV}" <<EOF
export const environment = {
  apiUrl: '${EB_URL}/api'
};
EOF
  echo "environment.staging.ts → ${EB_URL}/api"
fi

cd "${ROOT}/frontend/aulafy-web"
if [[ -f "${ROOT}/.nvmrc" ]] && command -v nvm >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  source "${HOME}/.nvm/nvm.sh" && nvm use >/dev/null
fi

npm install
npm run build:staging

if [[ ! -d "${DIST}" ]]; then
  echo "Error: no existe ${DIST}"
  exit 1
fi

aws s3 sync "${DIST}" "s3://${BUCKET}" --delete --region "${REGION}"

echo ""
echo "Frontend publicado en:"
echo "  http://${BUCKET}.s3-website.${REGION}.amazonaws.com"
echo "Verificar login y modulos chat/riesgo."
