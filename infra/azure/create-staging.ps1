Write-Host "Este script puede crear recursos con costo. Ejecutar solo con autorizacion explicita."

$confirm = Read-Host "Escribe CREAR para continuar"
if ($confirm -ne "CREAR") {
    Write-Host "Operacion cancelada."
    exit 0
}

$variablesPath = Join-Path $PSScriptRoot "variables.local.ps1"
if (-not (Test-Path $variablesPath)) {
    $variablesPath = Join-Path $PSScriptRoot "variables.example.ps1"
}
. $variablesPath

Write-Host "Validando sesion Azure CLI."
az account show --query "{name:name, state:state, isDefault:isDefault}" --output table

Write-Host "Creando Resource Group si no existe."
az group create --name $ResourceGroup --location $Location --output table

Write-Host "Los siguientes recursos pueden generar costo mensual."
Write-Host "Revise precio/SKU en Azure Portal antes de descomentar y ejecutar cada bloque."

# PostgreSQL Flexible Server: revisar costo antes de usar.
# if (-not $PostgresAdminPassword) { throw "Defina AULAFY_PG_PASSWORD en la sesion." }
# az postgres flexible-server create `
#   --resource-group $ResourceGroup `
#   --name $PostgresServer `
#   --location $Location `
#   --admin-user $PostgresAdminUser `
#   --admin-password $PostgresAdminPassword `
#   --tier Burstable `
#   --sku-name Standard_B1ms `
#   --storage-size 32 `
#   --version 16 `
#   --public-access 0.0.0.0
# az postgres flexible-server db create `
#   --resource-group $ResourceGroup `
#   --server-name $PostgresServer `
#   --database-name $PostgresDatabase

# App Service Plan y Web App: B1 puede generar costo aunque la app este detenida.
# az appservice plan create `
#   --name $AppServicePlan `
#   --resource-group $ResourceGroup `
#   --location $Location `
#   --is-linux `
#   --sku B1
# az webapp create `
#   --resource-group $ResourceGroup `
#   --plan $AppServicePlan `
#   --name $ApiAppName `
#   --runtime $BackendRuntime

# App Settings backend: no imprime secretos, pero requiere variables de entorno.
# if (-not $PostgresAdminPassword) { throw "Defina AULAFY_PG_PASSWORD en la sesion." }
# if (-not $JwtSecret) { throw "Defina AULAFY_JWT_SECRET en la sesion." }
# $postgresHost = az postgres flexible-server show --resource-group $ResourceGroup --name $PostgresServer --query "fullyQualifiedDomainName" --output tsv
# $databaseUrl = "jdbc:postgresql://$postgresHost`:5432/$PostgresDatabase`?sslmode=require"
# az webapp config appsettings set `
#   --resource-group $ResourceGroup `
#   --name $ApiAppName `
#   --settings `
#     SPRING_PROFILES_ACTIVE=staging `
#     DATABASE_URL=$databaseUrl `
#     DATABASE_USERNAME=$PostgresAdminUser `
#     DATABASE_PASSWORD=$PostgresAdminPassword `
#     JWT_SECRET=$JwtSecret `
#     FRONTEND_URL=$FrontendUrlPlaceholder `
#     TELEGRAM_BOT_TOKEN=$TelegramBotToken `
#     TELEGRAM_CHAT_ID=$TelegramChatId

# Static Web Apps: usar Free si esta disponible y evitar workflow duplicado.
# az staticwebapp create `
#   --name $StaticWebAppName `
#   --resource-group $ResourceGroup `
#   --location $Location `
#   --source "https://github.com/$GitHubRepository" `
#   --branch $GitHubBranch `
#   --app-location $FrontendAppLocation `
#   --output-location $FrontendOutputLocation `
#   --sku Free

Write-Host "Preparacion terminada. Los recursos pagados quedan comentados hasta autorizacion manual."
