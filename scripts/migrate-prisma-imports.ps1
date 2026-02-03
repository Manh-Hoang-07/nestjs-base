$files = Get-ChildItem -Path "src" -Recurse -Include "*.ts"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "['""]@prisma/client['""]") {
        $newContent = $content -replace "(['""])@prisma/client\1", "'@/generated/prisma'"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated $($file.FullName)"
    }
}
