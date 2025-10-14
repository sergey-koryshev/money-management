param(
  [string]
  $ProjectRootPath,

  [string]
  $ProductVersionFile
)

Import-Module (Join-Path $script:PSScriptRoot "BuildHelper.psm1") -Force

$productVersion = Get-ProductVersion -ProductVersionFile $ProductVersionFile
$environmentFiles = Get-ChildItem -Path (Join-Path $ProjectRootPath "src/environments") -Recurse -Filter "environment*.ts"

if ($null -eq $environmentFiles -or $environmentFiles.Count -eq 0) {
  Write-Error "No environment files found in src/environments"
  exit 1
}

Write-Host "Updating 'productVersion' in found environment files to '$productVersion'"
$filesUpdated = $false

foreach ($file in $environmentFiles) {  
  if(!((Get-Content $file.FullName) -match "productVersion: '$productVersion'")) {
    (Get-Content $file.FullName) -replace "productVersion: '.*?'", "productVersion: '$productVersion'" | Set-Content $file.FullName

    if(!((Get-Content $file.FullName) -match "productVersion: '$productVersion'")) {
      Write-Error "Failed to update 'productVersion' in $($file.FullName)"
      exit 1
    } else {
      Write-Host "Updated 'productVersion' in $($file.FullName) to '$productVersion'"
      $filesUpdated = $true
    }
  } else {
    Write-Host "No changes needed in $($file.FullName)"
  }
}

if (-not $filesUpdated) {
  Write-Host "No changes made to environment files."
  exit 0
}

Commit-Changes -Annotation "Propagated product version '$productVersion' to frontend"