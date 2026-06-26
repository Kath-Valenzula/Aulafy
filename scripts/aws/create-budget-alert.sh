#!/usr/bin/env bash
set -euo pipefail

# Aulafy - Budget AWS mensual.
# Uso seguro:
#   ALERT_EMAIL="correo@ejemplo.cl" bash scripts/aws/create-budget-alert.sh
#
# Crear budget:
#   ALERT_EMAIL="correo@ejemplo.cl" CONFIRM_CREATE_BUDGET=yes bash scripts/aws/create-budget-alert.sh
#
# Si la cuenta no tiene permisos para AWS Budgets, crear manualmente desde:
# AWS Console > Billing and Cost Management > Budgets > Create budget.

AWS_REGION="${AWS_REGION:-us-east-1}"
BUDGET_NAME="${BUDGET_NAME:-Aulafy-Staging-Monthly-Budget}"
BUDGET_LIMIT_USD="${BUDGET_LIMIT_USD:-5}"
ALERT_EMAIL="${ALERT_EMAIL:-CAMBIAR_CORREO}"
CONFIRM_CREATE_BUDGET="${CONFIRM_CREATE_BUDGET:-no}"

if [ "$ALERT_EMAIL" = "CAMBIAR_CORREO" ] || [ -z "$ALERT_EMAIL" ]; then
  echo "ERROR: configura ALERT_EMAIL antes de crear el budget."
  echo "Ejemplo: ALERT_EMAIL=\"correo@ejemplo.cl\" bash scripts/aws/create-budget-alert.sh"
  exit 1
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
BUDGET_FILE="$(mktemp)"
NOTIFICATION_FILE="$(mktemp)"

cleanup() {
  rm -f "$BUDGET_FILE" "$NOTIFICATION_FILE"
}
trap cleanup EXIT

cat > "$BUDGET_FILE" <<JSON
{
  "BudgetName": "${BUDGET_NAME}",
  "BudgetLimit": {
    "Amount": "${BUDGET_LIMIT_USD}",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {},
  "CostTypes": {
    "IncludeTax": true,
    "IncludeSubscription": true,
    "UseBlended": false,
    "IncludeRefund": false,
    "IncludeCredit": false,
    "IncludeUpfront": true,
    "IncludeRecurring": true,
    "IncludeOtherSubscription": true,
    "IncludeSupport": true,
    "IncludeDiscount": true,
    "UseAmortized": false
  }
}
JSON

cat > "$NOTIFICATION_FILE" <<JSON
[
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 80,
      "ThresholdType": "PERCENTAGE",
      "NotificationState": "ALARM"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "${ALERT_EMAIL}"
      }
    ]
  },
  {
    "Notification": {
      "NotificationType": "ACTUAL",
      "ComparisonOperator": "GREATER_THAN",
      "Threshold": 100,
      "ThresholdType": "PERCENTAGE",
      "NotificationState": "ALARM"
    },
    "Subscribers": [
      {
        "SubscriptionType": "EMAIL",
        "Address": "${ALERT_EMAIL}"
      }
    ]
  }
]
JSON

echo "Budget preparado:"
echo "  Account: ${ACCOUNT_ID}"
echo "  Nombre: ${BUDGET_NAME}"
echo "  Limite mensual: USD ${BUDGET_LIMIT_USD}"
echo "  Alertas: ${ALERT_EMAIL}"

if [ "$CONFIRM_CREATE_BUDGET" != "yes" ]; then
  echo ""
  echo "Modo seguro: no se crea ningun budget."
  echo "Para crear, ejecutar con CONFIRM_CREATE_BUDGET=yes."
  exit 0
fi

aws budgets create-budget \
  --account-id "$ACCOUNT_ID" \
  --budget "file://${BUDGET_FILE}" \
  --notifications-with-subscribers "file://${NOTIFICATION_FILE}" \
  --region "$AWS_REGION"
