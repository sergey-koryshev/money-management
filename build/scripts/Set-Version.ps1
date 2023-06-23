[CmdletBinding(DefaultParameterSetName = 'Incrementation')]
param(
    [Parameter(ParameterSetName = 'SetValue')]
    [string]
    $Version,

    [Parameter(ParameterSetName = 'SetValues')]
    [int]
    $Major,

    [Parameter(ParameterSetName = 'SetValues')]
    [int]
    $Minor,

    [Parameter(ParameterSetName = 'SetValues')]
    [int]
    $Build,

    [Parameter(ParameterSetName = 'SetValues')]
    [int]
    $Revision,

    [Parameter(ParameterSetName = 'Incrementation')]
    [switch]
    $IncrementMajor,

    [Parameter(ParameterSetName = 'Incrementation')]
    [switch]
    $IncrementMinor,

    [Parameter(ParameterSetName = 'Incrementation')]
    [switch]
    $IncrementBuildNumber,

    [Parameter(ParameterSetName = 'Incrementation')]
    [switch]
    $IncrementRevision,

    [Parameter(ParameterSetName = 'SetValues')]
    [Parameter(ParameterSetName = 'Incrementation')]
    [string]
    $Suffix
)

Process {
    $currentVersion = & (Join-Path $PSScriptRoot 'Get-Version.ps1')

    $parsedVersionRegex = "(?<major>\d+)\.(?<minor>\d+)(\.(?<build>\d+))?(\.(?<revision>\d+))?(?<suffix>.*)"

    $newVersion = [string]::Empty

    if ($PsCmdlet.ParameterSetName -eq "SetValue") {
        if ($Version -notmatch $parsedVersionRegex) {
            throw "Version '$Version' has incorrect format"
        }
        if ($Version -eq $currentVersion) {
            Write-Host "Version already equals to '$Version'"
            return $Version
        }
        $newVersion = $Version
    } else {
        Write-Host "Version currently contains value '$currentVersion'"

        $parsedVersionMatch = $currentVersion -match $parsedVersionRegex

        if (!$parsedVersionMatch) {
            throw "Value '$currentVersion' cannot be parsed"
        }

        $newMajor = [int]$Matches["major"]
        $newMinor = [int]$Matches["minor"]
        $newBuild = $(if($Matches["build"]) { [int]$Matches["build"] })
        $newRevision = $(if($Matches["revision"]) { [int]$Matches["revision"] })
        $newSuffix = $Matches["suffix"]

        if ($PsCmdlet.ParameterSetName -eq "SetValues") {
            if ($null -ne $Major -and $null -ne $newMajor) {
                $newMajor = $Major
            }

            if ($null -ne $Minor -and $null -ne $newMinor) {
                $newMinor = $Minor
            }

            if ($null -ne $Build -and $null -ne $newBuild) {
                $newBuild = $Build
            }

            if ($null -ne $Revision -and $null -ne $newRevision) {
                $newRevision = $Revision
            }
        }

        if ($PsCmdlet.ParameterSetName -eq "Incrementation") {
            if ($IncrementMajor.IsPresent -and $null -ne $newMajor) {
                $newMajor++
                $newMinor = 0
                $newBuild = 0
            }

            if ($IncrementMinor.IsPresent -and $null -ne $newMinor) {
                $newMinor++
                $newBuild = 0
            }

            if ($IncrementBuildNumber.IsPresent -and $null -ne $newBuild) {
                $newBuild++
            }

            if ($IncrementRevision.IsPresent -and $null -ne $newRevision) {
                $newRevision++
            }
        }

        if ($null -ne $Suffix) {
            $newSuffix = $Suffix
        }

        $newVersion = "{0}{1}{2}{3}{4}" -f $newMajor,
            ".$newMinor",
            $(if ($null -ne $newBuild) { ".$newBuild" } else { [string]::Empty }),
            $(if ($null -ne $newRevision) { ".$newRevision" } else { [string]::Empty }),
            $(if ($null -ne $newSuffix) { $newSuffix } else { [string]::Empty })
    }

    Write-Host "New version is '$newVersion'"
    Write-Host "Saving new version in 'package.json'"

    (& npm version --no-commit-hooks --no-git-tag-version $newVersion) | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Error has occurred while saving new version in 'package.json'"
    }

    Write-Output $newVersion
}
