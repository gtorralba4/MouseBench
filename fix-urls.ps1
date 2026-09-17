$files = Get-ChildItem -Path "." -Recurse -Filter "*.html" -File

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $original = $content

    # Fix canonical: remove trailing slash from tool pages (keep / for homepage)
    $content = $content -replace '(?<=href="https://mousebench\.fyi/)([^"/]+)(?=/")', '$1'
    # More precise: canonical href="https://mousebench.fyi/tool-name/"
    $content = $content -replace '(href="https://mousebench\.fyi/)([^"/]+)/(")', '$1$2$3'

    # Fix og:url
    $content = $content -replace '(property="og:url" content="https://mousebench\.fyi/)([^"/]+)/(")', '$1$2$3'

    # Fix hreflang alternates
    $content = $content -replace '(hreflang="(?:de|en|es|x-default)" href="https://mousebench\.fyi/)([^"/]+)/(")', '$1$2$3'
    $content = $content -replace '(hreflang="(?:de|en|es|x-default)" href="https://mousebench\.fyi/(?:de|es)/)([^"/]+)/(")', '$1$2$3'

    # Fix JSON-LD URLs in @graph
    $content = $content -replace '("url"\s*:\s*"https://mousebench\.fyi/)([^"/]+)/(")', '$1$2$3'
    $content = $content -replace '("url"\s*:\s*"https://mousebench\.fyi/(?:de|es)/)([^"/]+)/(")', '$1$2$3'
    $content = $content -replace '("item"\s*:\s*"https://mousebench\.fyi/)([^"/]+)/(")', '$1$2$3'

    # Fix sitemap URLs in JSON-LD breadcrumb home (keep /)
    # Don't touch homepage URLs

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Fixed: $($file.FullName)"
    }
}

# Fix sitemap.xml
$sitemap = Get-Content -Path "sitemap.xml" -Raw
$sitemap = $sitemap -replace '(<loc>https://mousebench\.fyi/)([^<]+)/</loc>', '<loc>https://mousebench.fyi/$2</loc>'
Set-Content -Path "sitemap.xml" -Value $sitemap -Encoding UTF8
Write-Host "Fixed: sitemap.xml"