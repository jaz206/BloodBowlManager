$files = Get-ChildItem C:\tmp\bloodbowl_cats\*.catz
foreach ($file in $files) {
    $zipPath = $file.FullName -replace "\.catz$", ".zip"
    Rename-Item $file.FullName $zipPath
    try {
        Expand-Archive -Path $zipPath -DestinationPath C:\tmp\bloodbowl_cats -Force
        Remove-Item $zipPath
    }
    catch {
        Write-Host "Error extracting $($file.Name): $($_.Exception.Message)"
    }
}
