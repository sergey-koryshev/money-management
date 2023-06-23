[CmdletBinding()]
param()

Process {
    Write-Host "Getting version from 'package.json'"

    $version = (. npm pkg get version) -replace """", ""
    if ($LASTEXITCODE -ne 0) {
      throw "Error has occurred while getting version from 'package.json'"
    }

    if ([string]::IsNullOrWhiteSpace($version) -or $version -eq "{}") {
        throw "Version doesn't exist in 'package.json'"
    }

    Write-Output $version
}
