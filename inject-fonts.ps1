# Post-build hook to inject font interceptor into Expo-generated index.html
param(
    [string]$DistPath = ".\dist\index.html"
)

Write-Host "Injecting font interceptor into dist/index.html..."

# Read the HTML file
$html = Get-Content $DistPath -Raw

# Create the font interceptor script
$fontInterceptor = @'
<script>if(!window.__fontInterceptorActive){window.__fontInterceptorActive=true;const o=window.fetch;window.fetch=function(t,e){let n="string"==typeof t?t:t instanceof URL?t.toString():t instanceof Request?t.url:String(t);if(n.includes("/assets/node_modules/")&&n.includes("vector-icons")&&n.includes(".ttf")){console.log("[Font] CDN:",n);const r=n.match(/Fonts\/([A-Za-z0-9_]+)(?:\.[a-f0-9]+)?\.ttf/);const a=r?r[1]:"MaterialCommunityIcons";const i="https://unpkg.com/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/"+a+".ttf";return o(i,{...e,mode:"cors",credentials:"omit",cache:"force-cache"}).catch(()=>o("https://cdn.jsdelivr.net/npm/@expo/vector-icons@14.0.0/build/vendor/react-native-vector-icons/Fonts/"+a+".ttf",{...e,mode:"cors",credentials:"omit",cache:"force-cache"}))}if(n.includes("@expo-google-fonts/poppins")&&n.includes(".ttf")){console.log("[Poppins Font] CDN:",n);const p={"400Regular":"https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.ttf","500Medium":"https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLGT9V1s.ttf","600SemiBold":"https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLEj6V1s.ttf","700Bold":"https://fonts.gstatic.com/s/poppins/v21/pxiByp8kv8JHgFVrLCz7V1s.ttf"};for(const[k,v]of Object.entries(p)){if(n.includes(k)){return o(v,{...e,mode:"cors",credentials:"omit",cache:"force-cache"})}}return o("https://fonts.gstatic.com/s/poppins/v21/pxiEyp8kv8JHgFVrFJA.ttf",{...e,mode:"cors",credentials:"omit",cache:"force-cache"})}return o(t,e)}}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
'@

# Check if interceptor already exists
if ($html -notcontains $fontInterceptor) {
    # Find the <head> tag and inject after it
    $html = $html -replace '(<head[^>]*>)', "`$1`n    $fontInterceptor"
    
    # Write back
    [IO.File]::WriteAllText($DistPath, $html, [Text.Encoding]::UTF8)
    Write-Host "Font interceptor successfully injected"
} else {
    Write-Host "Font interceptor already present"
}

Write-Host "Done!"

# Copy vercel.json into dist so Vercel applies rewrites/redirects when deploying from dist
$repoVercelJson = Join-Path (Get-Location) "vercel.json"
if (Test-Path $repoVercelJson) {
    $distDir = Split-Path -Path $DistPath -Parent
    $targetVercelJson = Join-Path $distDir "vercel.json"
    Copy-Item -Path $repoVercelJson -Destination $targetVercelJson -Force
    Write-Host "Copied vercel.json to dist/"
} else {
    Write-Host "vercel.json not found in repo root; skipping copy."
}
