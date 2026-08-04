<#
The module contains logic to increment version in .NET Web API project
#>

$script:webApiVersionFileName = "Directory.Build.props"
$script:versionXPath = "/Project/PropertyGroup/VersionPrefix"
$script:suffixXPath = "/Project/PropertyGroup/VersionSuffix"

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

    $suffixNode = $versionFile.SelectSingleNode($script:suffixXPath)

    if ($null -ne $suffixNode -and -not [string]::IsNullOrWhiteSpace($suffixNode.InnerText)) {
      Write-Output ("{0}-{1}" -f $versionNode.InnerText, $suffixNode.InnerText)
    } else {
      Write-Output $versionNode.InnerText
    }
  }
}

function Set-Version {
  [CmdletBinding()]
  param (
    [string]
    $OldVersion,

    [string]
    $OldSuffix,

    [string]
    $NewVersion,

    [string]
    $NewSuffix
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

    $versionNode.InnerText = $NewVersion -replace "$([Regex]::Escape($NewSuffix))`$", ''

    $suffixNode = $versionFile.SelectSingleNode($script:suffixXPath)

    if (-not [string]::IsNullOrWhiteSpace($NewSuffix)) {
      if ($null -eq $suffixNode) {
        $suffixNode = $versionFile.CreateElement("VersionSuffix")
        $versionNode.ParentNode.AppendChild($suffixNode) | Out-Null
      }

      $suffixNode.InnerText = $NewSuffix.Trim() -replace '^-+', ''
    } else {
      if ($null -ne $suffixNode) {
        $versionNode.ParentNode.RemoveChild($suffixNode) | Out-Null
      }
    }

    $versionFile.Save($versionFilePath)
  }
}

Export-ModuleMember -Function @('Get-Version', 'Set-Version')