#!/bin/bash
set -e

REGION="us-east-2"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
APP_NAME="aulafy"
EB_ENV="aulafy-api-staging"
DEPLOY_BUCKET="aulafy-deploys-${ACCOUNT_ID}"
DB_ID="aulafy-mysql"
DB_NAME="aulafy_db"
DB_USER="aulafyadmin"
DB_PASS="AulafyAWS$(date +%Y)X"
JWT=$(openssl rand -hex 32)

echo ""
echo "=== AULAFY AWS DEPLOY | Account: $ACCOUNT_ID | Region: $REGION ==="
echo "DB_PASS que debes guardar: $DB_PASS"
echo ""

# ── 1. mysql client ─────────────────────────────────────────
echo "[1/6] Verificando mysql client..."
which mysql 2>/dev/null || sudo dnf install -y mariadb105 || true

# ── 2. Clonar y construir backend ───────────────────────────
echo ""
echo "[2/6] Clonando repo y construyendo backend..."
cd /tmp
rm -rf aulafy
git clone https://github.com/Kath-Valenzula/Aulafy.git aulafy
cd /tmp/aulafy/backend/aulafy-api-nest

npm ci
npm run build
echo "web: node dist/main.js" > Procfile
echo "Build completado"

# ZIP sin node_modules (EB los instala en deploy)
cd /tmp/aulafy/backend/aulafy-api-nest
zip -r /tmp/aulafy-backend.zip dist/ package.json package-lock.json Procfile
echo "ZIP: $(du -sh /tmp/aulafy-backend.zip | cut -f1)"

# ── 3. S3 para deployment ───────────────────────────────────
echo ""
echo "[3/6] Creando S3 bucket y subiendo backend..."
aws s3 mb s3://${DEPLOY_BUCKET} --region $REGION 2>/dev/null || true
aws s3 cp /tmp/aulafy-backend.zip s3://${DEPLOY_BUCKET}/backend-v1.zip
echo "Subido a S3"

# ── 4. RDS MySQL FREE TIER ──────────────────────────────────
echo ""
echo "[4/6] Creando RDS MySQL db.t3.micro (FREE tier, tarda ~8 min)..."

VPC_ID=$(aws ec2 describe-vpcs \
  --filters "Name=is-default,Values=true" \
  --query "Vpcs[0].VpcId" --output text --region $REGION)
echo "VPC: $VPC_ID"

RDS_SG=$(aws ec2 create-security-group \
  --group-name aulafy-rds-sg \
  --description "Aulafy RDS MySQL" \
  --vpc-id $VPC_ID --region $REGION \
  --query GroupId --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=aulafy-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
  --query "SecurityGroups[0].GroupId" --output text --region $REGION)
echo "SG RDS: $RDS_SG"

aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG --protocol tcp --port 3306 \
  --cidr 0.0.0.0/0 --region $REGION 2>/dev/null || true

SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=default-for-az,Values=true" \
  --query "Subnets[*].SubnetId" --output text --region $REGION)

aws rds create-db-subnet-group \
  --db-subnet-group-name aulafy-subnets \
  --db-subnet-group-description "Aulafy Subnet Group" \
  --subnet-ids $SUBNETS --region $REGION 2>/dev/null || true

aws rds create-db-instance \
  --db-instance-identifier $DB_ID \
  --db-instance-class db.t3.micro \
  --engine mysql --engine-version "8.0" \
  --master-username $DB_USER \
  --master-user-password "$DB_PASS" \
  --allocated-storage 20 \
  --db-name $DB_NAME \
  --vpc-security-group-ids $RDS_SG \
  --db-subnet-group-name aulafy-subnets \
  --publicly-accessible --no-multi-az \
  --storage-type gp2 --backup-retention-period 0 \
  --no-deletion-protection \
  --region $REGION 2>/dev/null || echo "RDS ya existia, continuando..."

# ── 5. Roles IAM para EB ────────────────────────────────────
echo ""
echo "[5/6] Configurando IAM roles para Elastic Beanstalk..."

aws iam get-role --role-name aws-elasticbeanstalk-service-role 2>/dev/null || {
  aws iam create-role --role-name aws-elasticbeanstalk-service-role \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"elasticbeanstalk.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-service-role \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy
  echo "Service role creado"
}

aws iam get-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role 2>/dev/null || {
  aws iam create-role --role-name aws-elasticbeanstalk-ec2-role \
    --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
  aws iam attach-role-policy --role-name aws-elasticbeanstalk-ec2-role \
    --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier
  aws iam create-instance-profile --instance-profile-name aws-elasticbeanstalk-ec2-role
  aws iam add-role-to-instance-profile \
    --instance-profile-name aws-elasticbeanstalk-ec2-role \
    --role-name aws-elasticbeanstalk-ec2-role
  sleep 15
  echo "Instance profile creado"
}

# Stack Node.js
NODE_STACK=$(aws elasticbeanstalk list-available-solution-stacks \
  --query "SolutionStacks[?contains(@,'Node.js 22')&&contains(@,'Amazon Linux 2023')]" \
  --output text --region $REGION | tr '\t' '\n' | grep -v '^$' | head -1)
if [ -z "$NODE_STACK" ]; then
  NODE_STACK=$(aws elasticbeanstalk list-available-solution-stacks \
    --query "SolutionStacks[?contains(@,'Node.js 20')&&contains(@,'Amazon Linux 2023')]" \
    --output text --region $REGION | tr '\t' '\n' | grep -v '^$' | head -1)
fi
echo "Stack: $NODE_STACK"

aws elasticbeanstalk create-application \
  --application-name $APP_NAME --region $REGION 2>/dev/null || true

aws elasticbeanstalk create-application-version \
  --application-name $APP_NAME \
  --version-label "v1" \
  --source-bundle S3Bucket=${DEPLOY_BUCKET},S3Key=backend-v1.zip \
  --region $REGION 2>/dev/null || true

# Esperar RDS
echo ""
echo "Esperando que RDS quede disponible (puede tardar hasta 8 min)..."
aws rds wait db-instance-available \
  --db-instance-identifier $DB_ID --region $REGION
DB_HOST=$(aws rds describe-db-instances \
  --db-instance-identifier $DB_ID \
  --query "DBInstances[0].Endpoint.Address" --output text --region $REGION)
echo "RDS listo: $DB_HOST"

# Cargar schema y seed
echo "Cargando schema..."
mysql -h "$DB_HOST" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" \
  < /tmp/aulafy/database/mysql/schema.sql
mysql -h "$DB_HOST" -u "$DB_USER" --password="$DB_PASS" "$DB_NAME" \
  < /tmp/aulafy/database/mysql/seed.sql
echo "Schema y seed cargados OK"

# Crear EB environment
echo "Creando EB environment (SingleInstance t2.micro)..."
aws elasticbeanstalk create-environment \
  --application-name $APP_NAME \
  --environment-name $EB_ENV \
  --solution-stack-name "$NODE_STACK" \
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
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=JWT_SECRET,Value=${JWT}" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=FRONTEND_URL,Value=https://lemon-wave-02f2acd0f.7.azurestaticapps.net" \
  --version-label "v1" --region $REGION

echo "Esperando EB environment (~5 min)..."
aws elasticbeanstalk wait environment-updated \
  --application-name $APP_NAME \
  --environment-name $EB_ENV \
  --region $REGION

EB_CNAME=$(aws elasticbeanstalk describe-environments \
  --application-name $APP_NAME \
  --environment-name $EB_ENV \
  --query "Environments[0].CNAME" --output text --region $REGION)

# ── 6. RESUMEN ──────────────────────────────────────────────
echo ""
echo "=================================================="
echo "  AULAFY ONLINE en AWS"
echo "=================================================="
echo "  Backend : http://${EB_CNAME}"
echo "  Health  : http://${EB_CNAME}/api/health"
echo "  DB Host : ${DB_HOST}"
echo "  DB Pass : ${DB_PASS}"
echo ""
echo "  >>> COPIA ESTA LINEA Y ENVIASELA A CLAUDE:"
echo "  EB_URL=http://${EB_CNAME}"
echo "=================================================="
