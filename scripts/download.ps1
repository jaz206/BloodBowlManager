$urls = Get-Content C:\tmp\urls.txt
if (!(Test-Path C:\tmp\bloodbowl_cats)) { New-Item -ItemType Directory -Path C:\tmp\bloodbowl_cats }
foreach ($url in $urls) {
    if ($url.Trim() -ne "") {
        $filename = $url.Split("/")[-1]
        $dest = "C:\tmp\bloodbowl_cats\$filename"
        Write-Host "Downloading $url to $dest"
        curl.exe -L $url -o $dest
    }
}
