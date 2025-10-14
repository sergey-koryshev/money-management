param(
  [string]
  $ProjectRootPath,

  [string]
  $ProductVersionFile
)

Import-Module (Join-Path $script:PSScriptRoot "BuildHelper.psm1") -Force

$productVersion = Get-ProductVersion -ProductVersionFile $ProductVersionFile
$dotNetVersionFilePath = Join-Path $ProjectRootPath "Directory.Build.props"

if ((Test-Path $dotNetVersionFilePath) -eq $false) {
  Write-Error "File 'Directory.Build.props' not found at path: $dotNetVersionFilePath"
  exit 1
}

Write-Host "Updating 'InformationalVersion' in file '$dotNetVersionFilePath' to '$productVersion'"
[xml]$xmlContent = Get-Content $dotNetVersionFilePath
$productVersionNode = $xmlContent.SelectSingleNode("/Project/PropertyGroup/InformationalVersion")

if ($null -eq $productVersionNode) {
  Write-Host "'InformationalVersion' node not found. Creating a new one."
  $propertyGroupNode = $xmlContent.SelectSingleNode("/Project/PropertyGroup")

  if ($null -eq $propertyGroupNode) {
    Write-Error "No 'PropertyGroup' found in the XML structure."
    exit 1
  }

  $newNode = $xmlContent.CreateElement("InformationalVersion")
  $newNode.InnerText = $productVersion
  $propertyGroupNode.AppendChild($newNode) | Out-Null

  Write-Host "Added 'InformationalVersion' with value '$productVersion'."
} else {
  if ($productVersionNode.InnerText -eq $productVersion) {
    Write-Host "'InformationalVersion' is already set to '$productVersion'. No changes needed."
    exit 0
  } else {
    Write-Host "Current 'InformationalVersion' is '$($productVersionNode.InnerText)'. Updating to '$productVersion'."
    $productVersionNode.InnerText = $productVersion
  }
}

$xmlContent.Save($dotNetVersionFilePath)

Commit-Changes -Annotation "Propagated product version '$productVersion' to backend"
