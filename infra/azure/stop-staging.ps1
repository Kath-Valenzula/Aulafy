$variablesPath = Join-Path $PSScriptRoot "variables.local.ps1"
if (-not (Test-Path $variablesPath)) {
    $variablesPath = Join-Path $PSScriptRoot "variables.example.ps1"
}
. $variablesPath

Write-Host "Deteniendo recursos existentes de staging. Este script no elimina recursos."

$pgExists = az postgres flexible-server show --resource-group $ResourceGroup --name $PostgresServer --query "name" --output tsv 2>$null
if ($pgExists) {
    az postgres flexible-server stop --resource-group $ResourceGroup --name $PostgresServer
} else {
    Write-Host "PostgreSQL Flexible Server no existe."
}

$webAppExists = az webapp show --resource-group $ResourceGroup --name $ApiAppName --query "name" --output tsv 2>$null
if ($webAppExists) {
    az webapp stop --resource-group $ResourceGroup --name $ApiAppName
} else {
    Write-Host "Web App backend no existe."
}

Write-Host "Advertencia: detener la Web App no necesariamente detiene el cobro del App Service Plan."
Write-Host "PostgreSQL detenido puede seguir generando cobro por almacenamiento."
Write-Host "Si no se usara staging, evaluar eliminar el Resource Group completo."
