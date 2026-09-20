$dirs = @('de', 'es')
$all = @()
foreach ($d in $dirs) {
    $all += Get-ChildItem -Path $d -Filter "*.html" -File
}
foreach ($file in $all) {
    $c = Get-Content $file.FullName -Raw
    $orig = $c
    $c = $c -replace '(https://mousebench\.fyi/(?:de|es)/[a-z0-9-]+)/(")', '$1$2'
    if ($c -ne $orig) {
        Set-Content $file.FullName -Value $c -Encoding UTF8
        Write-Host "Fixed: $($file.FullName)"
    }
}