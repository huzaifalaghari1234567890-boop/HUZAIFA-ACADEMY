# =============================================================================
# Huzaifa Academy Web App - Local Lightweight HTTP Server (PowerShell)
# Zero external dependencies required. Uses .NET System.Net.HttpListener
# =============================================================================

$Port = 8080
$RootDirectory = $PSScriptRoot
if (-not $RootDirectory) { $RootDirectory = (Get-Location).Path }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     HUZAIFA ACADEMY - OFFICIAL PROMOTIONAL WEB APP       " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Serving files from: $RootDirectory" -ForegroundColor Gray
Write-Host "URL: http://localhost:$Port/" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")

try {
    $Listener.Start()
} catch {
    Write-Host "Port $Port may be in use, trying port 8081..." -ForegroundColor Yellow
    $Port = 8081
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add("http://localhost:$Port/")
    $Listener.Start()
}

# Open the website in the user's default browser
Start-Process "http://localhost:$Port/"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($Listener.IsListening) {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($UrlPath)) {
            $UrlPath = "index.html"
        }

        $FilePath = Join-Path $RootDirectory $UrlPath

        if (Test-Path $FilePath -PathType Leaf) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $mimeTypes[$Ext]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Response.ContentType = $ContentType
            $Response.StatusCode = 200

            $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentLength64 = $Bytes.Length
            $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
        } else {
            $Response.StatusCode = 404
            $NotFoundMsg = [System.Text.Encoding]::UTF8.GetBytes("404 - Not Found")
            $Response.OutputStream.Write($NotFoundMsg, 0, $NotFoundMsg.Length)
        }

        $Response.OutputStream.Close()
    }
} finally {
    $Listener.Stop()
    $Listener.Close()
    Write-Host "Server stopped." -ForegroundColor Red
}
