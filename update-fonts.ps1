# Update font-black patterns
$files = Get-ChildItem -Path src\components,src\pages -Recurse -Filter *.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Replace font-black uppercase with font-semibold
    $content = $content -replace 'font-black uppercase', 'font-semibold'
    # Replace standalone font-black (with word boundary)
    $content = $content -replace ' font-black ', ' font-semibold '
    $content = $content -replace ' font-black"', ' font-semibold"'
    $content = $content -replace 'font-black\s+', 'font-semibold '
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done updating fonts"
