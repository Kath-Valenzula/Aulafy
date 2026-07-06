#!/usr/bin/env bash
# Despliegue inicial Aulafy en cuenta AWS de Sebastián Briceño.
# Crea RDS (db.t4g.micro), Elastic Beanstalk (t2.micro), S3 frontend y carga BD.
#
# Uso (desde la raíz del repo):
#   bash scripts/aws/deploy-infra-sbriceno.sh
#
# Requisitos: AWS CLI autenticado, Node 22+, mysql client, zip

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/scripts/aws/staging.local.env"
REGION="${AWS_REGION:-us-east-2}"
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
APP_NAME="aulafy"
EB_ENV="aulafy-api-staging-sbriceno"
DEPLOY_BUCKET="aulafy-deploys-${ACCOUNT_ID}"
FRONTEND_BUCKET="aulafy-frontend-${ACCOUNT_ID}"
DB_ID="aulafy-mysql-sbriceno"
DB_NAME="aulafy_db"
DB_USER="aulafyadmin"
DB_PASS="${DB_PASS:-Aulafy$(openssl rand -hex 12)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
MY_IP="$(curl -4 -s --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]')"
MYSQL_VERSION="${MYSQL_VERSION:-8.0.46}"
RDS_CLASS="${RDS_CLASS:-db.t4g.micro}"

echo ""
echo "=== AULAFY AWS | cuenta ${ACCOUNT_ID} | región ${REGION} ==="
echo "RDS: ${RDS_CLASS} | EB: t2.micro SingleInstance"
echo ""

command -v zip >/dev/null || { echo "zip no encontrado"; exit 1; }

# Cliente MySQL: Homebrew 9.x no trae mysql_native_password; usamos Docker si existe.
mysql_load() {
  local sql_file="$1"
  if docker info >/dev/null 2>&1; then
    docker run --rm -i mysql:8.0 mysql \
      -h "${DB_HOST}" -u "${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" \
      < "${sql_file}"
  else
    mysql -h "${DB_HOST}" -u "${DB_USER}" --password="${DB_PASS}" "${DB_NAME}" \
      --default-auth=caching_sha2_password < "${sql_file}"
  fi
}

# ── 1. Build backend local ──────────────────────────────────
echo "[1/9] Build backend..."
cd "${ROOT}/backend/aulafy-api-nest"
npm install
npm run build
echo "web: node dist/main.js" > Procfile
zip -r /tmp/aulafy-backend-sbriceno.zip dist/ package.json package-lock.json Procfile
echo "ZIP listo"

# ── 2. S3 deploy bucket ─────────────────────────────────────
echo ""
echo "[2/9] Bucket S3 de artefactos..."
aws s3 mb "s3://${DEPLOY_BUCKET}" --region "${REGION}" 2>/dev/null || true
aws s3 cp /tmp/aulafy-backend-sbriceno.zip "s3://${DEPLOY_BUCKET}/backend-v1.zip" --region "${REGION}"

# ── 3. VPC + SG RDS ─────────────────────────────────────────
echo ""
echo "[3/9] RDS MySQL (${RDS_CLASS})..."
VPC_ID="$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" \
  --query "Vpcs[0].VpcId" --output text --region "${REGION}")"

RDS_SG="$(aws ec2 create-security-group \
  --group-name aulafy-rds-sg-sbriceno \
  --description "Aulafy RDS MySQL sbriceno" \
  --vpc-id "${VPC_ID}" --region "${REGION}" \
  --query GroupId --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=aulafy-rds-sg-sbriceno" "Name=vpc-id,Values=${VPC_ID}" \
  --query "SecurityGroups[0].GroupId" --output text --region "${REGION}")"

if [[ -n "${MY_IP}" ]]; then
  aws ec2 authorize-security-group-ingress \
    --group-id "${RDS_SG}" \
    --protocol tcp --port 3306 --cidr "${MY_IP}/32" \
    --region "${REGION}" 2>/dev/null || true
  echo "Acceso temporal MySQL desde ${MY_IP}/32"
fi

SUBNETS="$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=${VPC_ID}" "Name=default-for-az,Values=true" \
  --query "Subnets[*].SubnetId" --output text --region "${REGION}")"

aws rds create-db-subnet-group \
  --db-subnet-group-name aulafy-subnets-sbriceno \
  --db-subnet-group-description "Aulafy subnet group sbriceno" \
  --subnet-ids ${SUBNETS} --region "${REGION}" 2>/dev/null || true

if ! aws rds describe-db-instances --db-instance-identifier "${DB_ID}" --region "${REGION}" >/dev/null 2>&1; then
  if ! aws rds create-db-instance \
    --db-instance-identifier "${DB_ID}" \
    --db-instance-class "${RDS_CLASS}" \
    --engine mysql --engine-version "${MYSQL_VERSION}" \
    --master-username "${DB_USER}" \
    --master-user-password "${DB_PASS}" \
    --allocated-storage 20 \
    --db-name "${DB_NAME}" \
    --vpc-security-group-ids "${RDS_SG}" \
    --db-subnet-group-name aulafy-subnets-sbriceno \
    --publicly-accessible \
    --no-multi-az \
    --storage-type gp2 \
    --backup-retention-period 0 \
    --no-deletion-protection \
    --region "${REGION}" 2>&1; then
    echo "db.t4g.micro no disponible, probando db.t3.micro..."
    RDS_CLASS="db.t3.micro"
    aws rds create-db-instance \
      --db-instance-identifier "${DB_ID}" \
      --db-instance-class "${RDS_CLASS}" \
      --engine mysql --engine-version "${MYSQL_VERSION}" \
      --master-username "${DB_USER}" \
      --master-user-password "${DB_PASS}" \
      --allocated-storage 20 \
      --db-name "${DB_NAME}" \
      --vpc-security-group-ids "${RDS_SG}" \
      --db-subnet-group-name aulafy-subnets-sbriceno \
      --publicly-accessible \
      --no-multi-az \
      --storage-type gp2 \
      --backup-retention-period 0 \
      --no-deletion-protection \
      --region "${REGION}"
  fi
else
  echo "RDS ${DB_ID} ya existe"
fi

# ── 4. IAM roles EB ─────────────────────────────────────────
echo ""
echo "[4/9] Roles IAM Elastic Beanstalk..."
aws iam get-role --role-name aws-elasticbeanstalk-service-role >/dev/null 2>&1 || {
  aws iam create-role --role-name aws-elasticbeanstalk-service-role \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"elasticbeanstalk.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy
}

aws iam get-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role >/dev/null 2>&1 || {
  aws iam create-role --role-name aws-elasticbeanstalk-ec2-role \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier
  aws iam create-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role
  aws iam add-role-to-instance-profile \
    --instance-profile-name aws-elasticbeanstalk-ec2-role \
    --role-name aws-elasticbeanstalk-ec2-role
  sleep 15
}

NODE_STACK="$(aws elasticbeanstalk list-available-solution-stacks \
  --query "SolutionStacks[?contains(@,'Node.js 22')&&contains(@,'Amazon Linux 2023')]" \
  --output text --region "${REGION}" | tr '\t' '\n' | grep -v '^$' | head -1)"
if [[ -z "${NODE_STACK}" ]]; then
  NODE_STACK="$(aws elasticbeanstalk list-available-solution-stacks \
    --query "SolutionStacks[?contains(@,'Node.js 20')&&contains(@,'Amazon Linux 2023')]" \
    --output text --region "${REGION}" | tr '\t' '\n' | grep -v '^$' | head -1)"
fi
echo "Stack EB: ${NODE_STACK}"

aws elasticbeanstalk create-application --application-name "${APP_NAME}" --region "${REGION}" 2>/dev/null || true
aws elasticbeanstalk create-application-version \
  --application-name "${APP_NAME}" \
  --version-label "v1-sbriceno" \
  --source-bundle "S3Bucket=${DEPLOY_BUCKET},S3Key=backend-v1.zip" \
  --region "${REGION}" 2>/dev/null || true

# ── 5. Esperar RDS y cargar schema ──────────────────────────
echo ""
echo "[5/9] Esperando RDS (~8 min)..."
aws rds wait db-instance-available --db-instance-identifier "${DB_ID}" --region "${REGION}"
DB_HOST="$(aws rds describe-db-instances \
  --db-instance-identifier "${DB_ID}" \
  --query "DBInstances[0].Endpoint.Address" --output text --region "${REGION}")"
echo "RDS: ${DB_HOST}"

echo "Cargando schema, seed y migraciones..."
mysql_load "${ROOT}/database/mysql/schema.sql"
mysql_load "${ROOT}/database/mysql/seed.sql"
if [[ -f "${ROOT}/database/mysql/migrations/20260705_seed_profesor_jefe_asignatura_demo.sql" ]]; then
  mysql_load "${ROOT}/database/mysql/migrations/20260705_seed_profesor_jefe_asignatura_demo.sql"
fi
echo "BD cargada"

# ── 6. Frontend S3 (URL previa para FRONTEND_URL en EB) ─────
echo ""
echo "[6/9] Bucket S3 frontend..."
FRONTEND_URL="http://${FRONTEND_BUCKET}.s3-website.${REGION}.amazonaws.com"
aws s3 mb "s3://${FRONTEND_BUCKET}" --region "${REGION}" 2>/dev/null || true
aws s3 website "s3://${FRONTEND_BUCKET}" \
  --index-document index.html --error-document index.html --region "${REGION}" 2>/dev/null || true

PUBLIC_POLICY="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadGetObject",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${FRONTEND_BUCKET}/*"
  }]
}
EOF
)"
aws s3api put-bucket-policy --bucket "${FRONTEND_BUCKET}" --policy "${PUBLIC_POLICY}" --region "${REGION}" 2>/dev/null || true

# Desbloquear acceso público (cuentas nuevas suelen tener Block Public Access)
aws s3api put-public-access-block \
  --bucket "${FRONTEND_BUCKET}" \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false" \
  --region "${REGION}" 2>/dev/null || true
aws s3api put-bucket-policy --bucket "${FRONTEND_BUCKET}" --policy "${PUBLIC_POLICY}" --region "${REGION}" 2>/dev/null || true

# ── 7. Elastic Beanstalk environment ────────────────────────
echo ""
echo "[7/9] Creando EB environment..."
if ! aws elasticbeanstalk describe-environments \
  --application-name "${APP_NAME}" --environment-names "${EB_ENV}" \
  --region "${REGION}" --query "Environments[?Status!='Terminated'] | [0].EnvironmentName" \
  --output text 2>/dev/null | grep -q "${EB_ENV}"; then
  aws elasticbeanstalk create-environment \
    --application-name "${APP_NAME}" \
    --environment-name "${EB_ENV}" \
    --solution-stack-name "${NODE_STACK}" \
    --option-settings \
      "Namespace=aws:autoscaling:launchconfiguration,OptionName=InstanceType,Value=t2.micro" \
      "Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=aws-elasticbeanstalk-ec2-role" \
      "Namespace=aws:elasticbeanstalk:environment,OptionName=ServiceRole,Value=aws-elasticbeanstalk-service-role" \
      "Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=SingleInstance" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=PORT,Value=8080" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_HOST,Value=${DB_HOST}" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_PORT,Value=3306" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_DATABASE,Value=${DB_NAME}" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_USERNAME,Value=${DB_USER}" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=DB_PASSWORD,Value=${DB_PASS}" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=JWT_SECRET,Value=${JWT_SECRET}" \
      "Namespace=aws:elasticbeanstalk:application:environment,OptionName=FRONTEND_URL,Value=${FRONTEND_URL}" \
    --version-label "v1-sbriceno" --region "${REGION}"
fi

echo "Esperando EB (~5 min)..."
aws elasticbeanstalk wait environment-updated \
  --application-name "${APP_NAME}" --environment-names "${EB_ENV}" --region "${REGION}"

EB_CNAME="$(aws elasticbeanstalk describe-environments \
  --application-name "${APP_NAME}" --environment-names "${EB_ENV}" \
  --query "Environments[0].CNAME" --output text --region "${REGION}")"
EB_URL="http://${EB_CNAME}"
echo "Backend: ${EB_URL}"

# Permitir EB → RDS
EB_INSTANCE_ID="$(aws ec2 describe-instances \
  --filters "Name=tag:elasticbeanstalk:environment-name,Values=${EB_ENV}" "Name=instance-state-name,Values=running" \
  --query "Reservations[0].Instances[0].InstanceId" --output text --region "${REGION}")"
if [[ -n "${EB_INSTANCE_ID}" && "${EB_INSTANCE_ID}" != "None" ]]; then
  EB_SG="$(aws ec2 describe-instances --instance-ids "${EB_INSTANCE_ID}" \
    --query "Reservations[0].Instances[0].SecurityGroups[0].GroupId" --output text --region "${REGION}")"
  aws ec2 authorize-security-group-ingress \
    --group-id "${RDS_SG}" \
    --protocol tcp --port 3306 --source-group "${EB_SG}" \
    --region "${REGION}" 2>/dev/null || true
  echo "RDS permite tráfico desde EB SG ${EB_SG}"
fi

# ── 8. Actualizar environment.staging.ts y publicar frontend ─
echo ""
echo "[8/9] Deploy frontend..."
STAGING_ENV="${ROOT}/frontend/aulafy-web/src/environments/environment.staging.ts"
cat > "${STAGING_ENV}" <<EOF
export const environment = {
  apiUrl: '${EB_URL}/api'
};
EOF

cd "${ROOT}/frontend/aulafy-web"
npm install
npm run build:staging
DIST="${ROOT}/frontend/aulafy-web/dist/aulafy-web/browser"
aws s3 sync "${DIST}" "s3://${FRONTEND_BUCKET}" --delete --region "${REGION}"

# ── 9. Guardar credenciales locales ─────────────────────────
echo ""
echo "[9/9] Guardando staging.local.env..."
cat > "${ENV_FILE}" <<EOF
# Generado $(date -u +"%Y-%m-%dT%H:%M:%SZ") — NO commitear
AWS_REGION=${REGION}
AWS_ACCOUNT_ID=${ACCOUNT_ID}
AWS_EB_APPLICATION=${APP_NAME}
AWS_EB_ENVIRONMENT=${EB_ENV}
AWS_EB_DEPLOY_BUCKET=${DEPLOY_BUCKET}
AWS_S3_BUCKET_STAGING=${FRONTEND_BUCKET}
AWS_RDS_INSTANCE_ID=${DB_ID}
RDS_INSTANCE_CLASS=${RDS_CLASS}
DB_HOST=${DB_HOST}
DB_PORT=3306
DB_DATABASE=${DB_NAME}
DB_USERNAME=${DB_USER}
DB_PASSWORD=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
EB_URL=${EB_URL}
FRONTEND_URL=${FRONTEND_URL}
HEALTH_URL=${EB_URL}/api/health
EOF
chmod 600 "${ENV_FILE}"

echo ""
echo "=================================================="
echo "  AULAFY ONLINE — cuenta ${ACCOUNT_ID}"
echo "=================================================="
echo "  Backend  : ${EB_URL}"
echo "  Health   : ${EB_URL}/api/health"
echo "  Frontend : ${FRONTEND_URL}"
echo "  BD       : ${DB_HOST} (${RDS_CLASS})"
echo "  Secrets  : ${ENV_FILE}"
echo ""
echo "  Redeploy backend : bash scripts/aws/deploy-backend-eb.sh"
echo "  Redeploy frontend: bash scripts/aws/deploy-frontend-s3.sh"
echo "  Redeploy ambos   : bash scripts/aws/deploy-all-sbriceno.sh"
echo "=================================================="
