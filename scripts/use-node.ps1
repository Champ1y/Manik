# Run once in this PowerShell terminal: . .\scripts\use-node.ps1
$portableNode = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot '..\.tools') -Directory -Filter 'node-*-win-x64' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($portableNode) {
  $env:PATH = "$($portableNode.FullName);$env:PATH"
  $env:NEXT_TELEMETRY_DISABLED = '1'
  Write-Host 'Node.js доступен в текущем терминале. Запуск: npm.cmd run dev'
} else {
  Write-Host 'Установите Node.js LTS с https://nodejs.org/ и откройте терминал заново.'
}
