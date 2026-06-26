#!/usr/bin/env bash
set -euo pipefail

# Aulafy - CloudFront para frontend Angular en S3.
# Uso seguro:
#   bash scripts/aws/create-cloudfront-frontend.sh
#
# Crear distribucion:
#   CONFIRM_CREATE_CLOUDFRONT=yes bash scripts/aws/create-cloudfront-frontend.sh
#
# Dominio personalizado opcional:
#   CUSTOM_DOMAIN=app.ejemplo.cl \
#   ACM_CERT_ARN=arn:aws:acm:us-east-1:123456789012:certificate/xxxx \
#   CONFIRM_CREATE_CLOUDFRONT=yes bash scripts/aws/create-cloudfront-frontend.sh
#
# Notas:
# - No incluye credenciales.
# - Para CloudFront con dominio propio, el certificado ACM debe existir en us-east-1.
# - Sin dominio propio, CloudFront entrega un dominio HTTPS propio *.cloudfront.net.
# - Este script usa el endpoint S3 Static Website actual como origen HTTP y entrega HTTPS al usuario final.

BUCKET_NAME="${BUCKET_NAME:-aulafy-frontend-803615173905}"
BUCKET_REGION="${BUCKET_REGION:-us-east-2}"
PRICE_CLASS="${PRICE_CLASS:-PriceClass_100}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-}"
ACM_CERT_ARN="${ACM_CERT_ARN:-}"
CONFIRM_CREATE_CLOUDFRONT="${CONFIRM_CREATE_CLOUDFRONT:-no}"

ORIGIN_ID="aulafy-s3-website-origin"
ORIGIN_DOMAIN="${BUCKET_NAME}.s3-website.${BUCKET_REGION}.amazonaws.com"
CALLER_REFERENCE="aulafy-frontend-$(date +%Y%m%d%H%M%S)"
CONFIG_FILE="$(mktemp)"

cleanup() {
  rm -f "$CONFIG_FILE"
}
trap cleanup EXIT

if [ -n "$CUSTOM_DOMAIN" ] && [ -z "$ACM_CERT_ARN" ]; then
  echo "ERROR: CUSTOM_DOMAIN requiere ACM_CERT_ARN de us-east-1."
  exit 1
fi

if [ -n "$ACM_CERT_ARN" ]; then
  ALIASES_JSON=$(cat <<JSON
"Aliases": {
  "Quantity": 1,
  "Items": ["${CUSTOM_DOMAIN}"]
},
"ViewerCertificate": {
  "ACMCertificateArn": "${ACM_CERT_ARN}",
  "SSLSupportMethod": "sni-only",
  "MinimumProtocolVersion": "TLSv1.2_2021"
},
JSON
)
else
  ALIASES_JSON=$(cat <<JSON
"Aliases": {
  "Quantity": 0
},
"ViewerCertificate": {
  "CloudFrontDefaultCertificate": true
},
JSON
)
fi

cat > "$CONFIG_FILE" <<JSON
{
  "CallerReference": "${CALLER_REFERENCE}",
  "Comment": "Aulafy frontend staging - S3 Static Website via CloudFront",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  ${ALIASES_JSON}
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "${ORIGIN_ID}",
        "DomainName": "${ORIGIN_DOMAIN}",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "${ORIGIN_ID}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 3,
      "Items": ["GET", "HEAD", "OPTIONS"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 3600,
    "MaxTTL": 86400
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      },
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 0
      }
    ]
  },
  "PriceClass": "${PRICE_CLASS}",
  "HttpVersion": "http2",
  "IsIPV6Enabled": true
}
JSON

echo "CloudFront frontend config preparada para:"
echo "  Bucket: ${BUCKET_NAME}"
echo "  Origin: ${ORIGIN_DOMAIN}"
echo "  PriceClass: ${PRICE_CLASS}"
if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "  Dominio personalizado: ${CUSTOM_DOMAIN}"
else
  echo "  Dominio: se usara dominio default *.cloudfront.net"
fi

if [ "$CONFIRM_CREATE_CLOUDFRONT" != "yes" ]; then
  echo ""
  echo "Modo seguro: no se crea ningun recurso."
  echo "Para crear la distribucion, ejecutar con CONFIRM_CREATE_CLOUDFRONT=yes."
  echo "Config generada:"
  cat "$CONFIG_FILE"
  exit 0
fi

aws cloudfront create-distribution --distribution-config "file://${CONFIG_FILE}"
