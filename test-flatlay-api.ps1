# Test Flatlay Generation API
# This script tests if the flatlay generation endpoint is implemented

Write-Host "Testing Flatlay Generation API..." -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Get your auth token from browser localStorage
# In browser console: localStorage.getItem('auth_token')
$TOKEN = "YOUR_AUTH_TOKEN_HERE"

Write-Host "1. Testing with minimal payload..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $TOKEN"
}

$body = @{
    products = @(
        @{
            type = "top"
            frontImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
    )
    modelId = "1"
    backgroundId = 1
    options = @{
        quality = "high"
        format = "png"
    }
} | ConvertTo-Json -Depth 10

Write-Host "Request Body:" -ForegroundColor Gray
Write-Host $body -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/flatlay/generate" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -ResponseHeadersVariable responseHeaders

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DiscardBufferedData()
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Test complete!" -ForegroundColor Cyan

