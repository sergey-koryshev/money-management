function Invoke-CommandSafely {
  [CmdletBinding()]
  param (
    [string]
    $Command
  )
  
  process {
    Invoke-Expression "& $Command" -ErrorAction Stop
  
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Command [$Command] failed to execute."
      exit 1
    }
  }
}

function Commit-Changes {
  [CmdletBinding()]
  param (
    [string]
    $Annotation
  )
  
  process {
    Write-Host "Updating Git configuration"
    Invoke-CommandSafely "git config --global user.name ""$env:GITHUB_ACTOR"""
    Invoke-CommandSafely "git config --global user.email ""$env:GITHUB_ACTOR@users.noreply.github.com"""

    Write-Host "Committing changes"
    Invoke-CommandSafely "git commit -am ""[automated] $Annotation [skip ci]"""

    Write-Host "Pulling last changes"
    Invoke-CommandSafely "git pull --rebase"

    Write-Host "Pushing changes to remote"
    Invoke-CommandSafely "git push"
  }
}

function Get-ProductVersion {
  [CmdletBinding()]
  param (
    [string]
    $ProductVersionFile
  )
  
  process {
    if ((Test-Path $ProductVersionFile) -eq $false) {
      Write-Error "File with product version not found at path: $ProductVersionFile"
      exit 1
    }

    $version = (Get-Content $ProductVersionFile | ConvertFrom-Json)

    if ($null -eq $version) {
      Write-Error "Failed to read file version.json"
      exit 1
    }

    $productVersion = $version.ProductVersion

    if ($null -eq $productVersion) {
      Write-Error "ProductVersion doesn't exist in version.json"
      exit 1
    }

    Write-Output $productVersion
  }
}

Export-ModuleMember -Function @('Commit-Changes', 'Get-ProductVersion')
