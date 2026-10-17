$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot

$packager = Get-Command pyinstaller -ErrorAction SilentlyContinue
if (-not $packager) {
    throw "PyInstaller is required. Install it with: python -m pip install pyinstaller"
}

pyinstaller --noconfirm --clean --onefile --windowed --name Keydeck-RK-Studio `
    --add-data "index.html;." `
    --add-data "styles.css;." `
    --add-data "app.js;." `
    --add-data "models.json;." `
    launcher.py

if ($LASTEXITCODE -ne 0) {
    throw "PyInstaller exited with code $LASTEXITCODE"
}
Write-Host "Built dist\Keydeck-RK-Studio.exe"
