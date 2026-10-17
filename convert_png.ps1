Add-Type -AssemblyName System.Drawing

function Remove-BlackBackground($inputPath, $outputPath, $threshold, $fade) {
    $img = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = $img.Width
    $h = $img.Height
    $output = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $srcData = $img.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $dstData = $output.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    $len = $w * $h * 4
    $bytes = New-Object byte[] $len
    [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $bytes, 0, $len)

    for ($i = 0; $i -lt $len; $i += 4) {
        $b = [int]$bytes[$i]
        $g = [int]$bytes[$i + 1]
        $r = [int]$bytes[$i + 2]
        $brightness = [Math]::Max($r, [Math]::Max($g, $b))
        if ($brightness -le $threshold) {
            $bytes[$i + 3] = 0
        } elseif ($brightness -lt ($threshold + $fade)) {
            $alpha = [int](($brightness - $threshold) * 255 / $fade)
            if ($alpha -gt 255) { $alpha = 255 }
            if ($alpha -lt 0) { $alpha = 0 }
            $bytes[$i + 3] = [byte]$alpha
        } else {
            $bytes[$i + 3] = 255
        }
    }

    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $dstData.Scan0, $len)
    $img.UnlockBits($srcData)
    $output.UnlockBits($dstData)
    $img.Dispose()

    $output.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $output.Dispose()
    Write-Output "Procesado: $outputPath"
}

$baseBrain = "C:\Users\ASUS\.gemini\antigravity\brain\dac462fb-81b2-4cd1-b6e7-d67057af9b43"
$destDir = "C:\Users\ASUS\OneDrive\Desktop\aniversario-7meses-lol\assets"

Remove-BlackBackground "$baseBrain\hextech_chest_isolated_closed_1791869341004.jpg" "$destDir\hextech_chest_closed.png" 24 30
Remove-BlackBackground "$baseBrain\hextech_chest_isolated_open_1791869397608.jpg" "$destDir\hextech_chest_open.png" 24 30
Remove-BlackBackground "$baseBrain\duo_champions_walking_isolated_1791869458979.jpg" "$destDir\champions_walking_transparent.png" 20 28

Copy-Item "$baseBrain\summoners_rift_map_1791869184249.jpg" "$destDir\summoners_rift_real.jpg" -Force
Copy-Item "$baseBrain\lol_victory_screen_1791869278401.jpg" "$destDir\lol_victory_screen.jpg" -Force

Copy-Item -Recurse -Force "$destDir\*" "C:\Users\ASUS\.gemini\antigravity\scratch\aniversario-7meses-lol\assets\"
Write-Output "Todos los assets procesados y sincronizados correctamente"
