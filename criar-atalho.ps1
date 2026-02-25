# Execute este script uma vez para criar um atalho na área de trabalho
# Clique direito > "Run with PowerShell"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Sistema Conveniência.lnk"
$scriptPath = Join-Path $projectRoot "start.ps1"

# Criar objeto COM do Windows Shell
$WshShell = New-Object -ComObject WScript.Shell
$shortcut = $WshShell.CreateShortcut($shortcutPath)

# Configurar atalho
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$scriptPath`""
$shortcut.WorkingDirectory = $projectRoot
$shortcut.Description = "Inicia Backend e Frontend do Sistema Conveniência"
$shortcut.WindowStyle = 1  # Normal window

# Salvar
$shortcut.Save()

Write-Host "✅ Atalho criado!" -ForegroundColor Green
Write-Host "   Localização: $shortcutPath" -ForegroundColor Cyan
Write-Host "   Clique duplo para iniciar o sistema" -ForegroundColor Yellow
