$files = Get-ChildItem -Recurse -Filter "*.html" -File | Where-Object { $_.FullName -notmatch '\\public\\' }

foreach ($file in $files) {
    $c = Get-Content $file.FullName -Raw
    $c = $c -replace '(?s)<aside class="ad-rail rail-left">.*?</aside>\s*', ''
    $c = $c -replace '(?s)<aside class="ad-rail rail-right">.*?</aside>\s*', ''
    Set-Content $file.FullName -Value $c -Encoding UTF8
    Write-Host "Cleaned: $($file.Name)"
}