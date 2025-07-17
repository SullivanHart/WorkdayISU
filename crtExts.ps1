# Set error response
$ErrorActionPreference = "Stop"

# Output zip names
$MZ_zip = "ext-mozilla.zip"
$CHRM_zip = "ext-chrome.zip"

# Source items
$cmmnFiles = @("src", "icons", "LICENSE.md")
$MZ_manifest = "mozilla/manifest.json"
$CHRM_manifest = "chrome/manifest.json"

# Create temp directories
$MZ_tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath()) -Name ("mozilla_" + [System.Guid]::NewGuid())
$CHRM_tempDir = New-Item -ItemType Directory -Path ([System.IO.Path]::GetTempPath()) -Name ("chrome_" + [System.Guid]::NewGuid())

function Copy-FilesToTempDir($targetDir, $manifestPath) {
    foreach ($item in $cmmnFiles) {
        Copy-Item -Path $item -Destination $targetDir -Recurse
    }

    # Copy manifest.json to the root of temp directory
    Copy-Item -Path $manifestPath -Destination (Join-Path $targetDir "manifest.json")
}

function Create-Zip-With7z($sourceDir, $zipFileName) {
    if (Test-Path $zipFileName) {
        Remove-Item $zipFileName -Force
    }

    $sevenZip = "C:\Program Files\7-Zip\7z.exe"
    $arguments = @("a", "-tzip", $zipFileName, "$sourceDir\*")

    Write-Host "Creating $zipFileName with 7-Zip..."
    & $sevenZip @arguments | Out-Null
}

# Copy files to temp dirs
Copy-FilesToTempDir -targetDir $MZ_tempDir -manifestPath $MZ_manifest
Copy-FilesToTempDir -targetDir $CHRM_tempDir -manifestPath $CHRM_manifest

# Zip them using 7z
Create-Zip-With7z -sourceDir $MZ_tempDir.FullName -zipFileName $MZ_zip
Create-Zip-With7z -sourceDir $CHRM_tempDir.FullName -zipFileName $CHRM_zip

# Clean up temp dirs
Remove-Item -Path $MZ_tempDir -Recurse -Force
Remove-Item -Path $CHRM_tempDir -Recurse -Force

Write-Host "Mozilla extension packaged: $MZ_zip"
Write-Host "Chrome extension packaged: $CHRM_zip"
