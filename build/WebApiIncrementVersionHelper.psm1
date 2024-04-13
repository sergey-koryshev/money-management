<#
The module contains logic to increment version in .NET Web API project
#>

$script:webApiVersionFileName = "Directory.Build.props"
$script:versionXPath = "/Project/PropertyGroup/Version"

function Get-Version {
  [CmdletBinding()]
  [OutputType([string])]
  param ()

  process {
    $versionFilePath = Join-Path (Get-Location) $script:webApiVersionFileName

    if (-not(Test-Path $versionFilePath)) {
      throw "Version file '$versionFilePath' doesn't exist"
    }

    [xml]$versionFile = Get-Content -Path $versionFilePath
    $versionNode = $versionFile.SelectSingleNode($script:versionXPath)

    if ($null -eq $versionNode) {
      throw "Version node cannot be found in file '$versionFilePath'"
    }

    Write-Output $versionNode.InnerText
  }
}

function Set-Version {
  [CmdletBinding()]
  param (
    [string]
    $OldVersion,

    [string]
    $NewVersion
  )
  
  process {
    $versionFilePath = Join-Path (Get-Location) $script:webApiVersionFileName

    if (-not(Test-Path $versionFilePath)) {
      throw "Version file '$versionFilePath' doesn't exist"
    }

    [xml]$versionFile = Get-Content -Path $versionFilePath
    $versionNode = $versionFile.SelectSingleNode($script:versionXPath)

    if ($null -eq $versionNode) {
      throw "Version node cannot be found in file '$versionFilePath'"
    }

    $versionNode.InnerText = $NewVersion
    $versionFile.Save($versionFilePath)
  }
}

Export-ModuleMember -Function @('Get-Version', 'Set-Version')