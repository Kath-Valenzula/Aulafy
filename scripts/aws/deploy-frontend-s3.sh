#!/usr/bin/env bash
# Despliega el frontend Angular (build staging) al bucket S3 de revision academica.
#
# Requisitos:
#   - AWS CLI configurado (aws sts get-caller-identity debe funcionar)
#   - Node 22+ (nvm use 22)
#
# Uso:
#   bash scripts/aws/deploy-frontend-s3.sh
#
# Variables opcionales:
#   AWS_REGION=us-east-2
#   AWS_S3_BUCKET_STAGING=aulafy-frontend-803615173905

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGION="${AWS_REGION:-us-east-2}"
BUCKET="${AWS_S3_BUCKET_STAGING:-aulafy-frontend-803615173905}"
DIST="${ROOT}/frontend/aulafy-web/dist/aulafy-web/browser"

echo "=== Aulafy Frontend S3 Deploy ==="
echo "Region: ${REGION}"
echo "Bucket: ${BUCKET}"

aws sts get-caller-identity --region "${REGION}" >/dev/null

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
