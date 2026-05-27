$variablesPath = Join-Path $PSScriptRoot "variables.local.ps1"
if (-not (Test-Path $variablesPath)) {
    $variablesPath = Join-Path $PSScriptRoot "variables.example.ps1"
}
. $variablesPath

Write-Host "Iniciando recursos existentes de staging. Este script no crea recursos nuevos."

$pgExists = az postgres flexible-server show --resource-group $ResourceGroup --name $PostgresServer --query "name" --output tsv 2>$null
if ($pgExists) {
    az postgres flexible-server start --resource-group $ResourceGroup --name $PostgresServer
} else {
    Write-Host "PostgreSQL Flexible Server no existe."
}

$webAppExists = az webapp show --resource-group $ResourceGroup --name $ApiAppName --query "name" --output tsv 2>$null
if ($webAppExists) {
    az webapp start --resource-group $ResourceGroup --name $ApiAppName
    $apiUrl = az webapp show --resource-group $ResourceGroup --name $ApiAppName --query "defaultHostName" --output tsv
    Write-Host "Backend: https://$apiUrl"
} else {
    Write-Host "Web App backend no existe."
}

$staticUrl = az staticwebapp show --resource-group $ResourceGroup --name $StaticWebAppName --query "defaultHostname" --output tsv 2>$null
if ($staticUrl) {
    Write-Host "Frontend: https://$staticUrl"
} else {
    Write-Host "Static Web App no existe."
}
