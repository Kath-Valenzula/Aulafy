#!/usr/bin/env bash
# Redeploy backend + frontend en cuenta sbriceno.
# Uso: bash scripts/aws/deploy-all-sbriceno.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

bash "${ROOT}/scripts/aws/deploy-backend-eb.sh"
bash "${ROOT}/scripts/aws/deploy-frontend-s3.sh"

echo ""
echo "Deploy completo (backend + frontend)."
