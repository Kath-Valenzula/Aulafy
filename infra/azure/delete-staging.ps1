$variablesPath = Join-Path $PSScriptRoot "variables.local.ps1"
if (-not (Test-Path $variablesPath)) {
    $variablesPath = Join-Path $PSScriptRoot "variables.example.ps1"
}
. $variablesPath

Write-Host "Esta operacion elimina el Resource Group completo y todos sus recursos."
Write-Host "Resource Group objetivo: $ResourceGroup"

$confirm = Read-Host "Escribe ELIMINAR-RG para borrar Resource Group"
if ($confirm -ne "ELIMINAR-RG") {
    Write-Host "Operacion cancelada."
    exit 0
}

az group delete --name $ResourceGroup --yes --no-wait
Write-Host "Eliminacion solicitada. Azure puede tardar algunos minutos en completarla."
