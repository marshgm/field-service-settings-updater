# Installs the compiled Field Service Settings Updater plugin into XrmToolBox.
# XrmToolBox already ships WebView2 + the Dataverse SDK, so we copy ONLY our plugin dll
# and its bundled app/ (the shared HTML) to avoid assembly version conflicts.
$ErrorActionPreference = 'Stop'
$src = Join-Path $PSScriptRoot 'FieldServiceSettingsUpdater\bin\Release\net48'
$dst = Join-Path $env:APPDATA 'MscrmTools\XrmToolBox\Plugins'
if (-not (Test-Path $src)) { throw "Build first: dotnet build -c Release  ($src not found)" }
if (-not (Test-Path $dst)) { throw "XrmToolBox Plugins folder not found: $dst" }

Copy-Item (Join-Path $src 'FieldServiceSettingsUpdater.dll') $dst -Force
New-Item -ItemType Directory -Force (Join-Path $dst 'app') | Out-Null
Copy-Item (Join-Path $src 'app\field-service-settings-updater.html') (Join-Path $dst 'app\field-service-settings-updater.html') -Force

Write-Host "Installed FieldServiceSettingsUpdater.dll + app\field-service-settings-updater.html to:`n  $dst" -ForegroundColor Green
Write-Host "Restart XrmToolBox -> tool 'Field Service Resource Updater'." -ForegroundColor Yellow
