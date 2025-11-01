# SlotSwapper API Test Script - Detailed Version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SlotSwapper API Testing (Detailed)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000"
$apiUrl = "$baseUrl/api/v1"

# Test 1: Health Check
Write-Host "[1/6] Testing Health Endpoint..." -ForegroundColor Yellow
Write-Host "URL: GET $baseUrl/health" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    if ($response.success -eq $true) {
        Write-Host "PASS" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Response success is false" -ForegroundColor Red
    }
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
}
catch {
    Write-Host "FAIL - Cannot connect to server" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 2: Signup
Write-Host "[2/6] Testing User Signup..." -ForegroundColor Yellow
Write-Host "URL: POST $apiUrl/auth/signup" -ForegroundColor Gray
$signupData = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
}
Write-Host "Body:" -ForegroundColor Gray
Write-Host ($signupData | ConvertTo-Json) -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/auth/signup" -Method Post -Body ($signupData | ConvertTo-Json) -ContentType "application/json"
    if ($response.success -eq $true) {
        Write-Host "PASS - User created" -ForegroundColor Green
        $token = $response.data.token
    } else {
        Write-Host "FAIL - Response success is false" -ForegroundColor Red
    }
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Host "INFO - User already exists (Status 409)" -ForegroundColor Yellow
        Write-Host "This is expected if you've run the test before" -ForegroundColor Gray
    }
    else {
        Write-Host "FAIL - Signup error (Status: $statusCode)" -ForegroundColor Red
    }
    
    # Try to get error response body
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Gray
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 3: Login
Write-Host "[3/6] Testing User Login..." -ForegroundColor Yellow
Write-Host "URL: POST $apiUrl/auth/login" -ForegroundColor Gray
$loginData = @{
    email = "test@example.com"
    password = "password123"
}
Write-Host "Body:" -ForegroundColor Gray
Write-Host ($loginData | ConvertTo-Json) -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body ($loginData | ConvertTo-Json) -ContentType "application/json"
    if ($response.success -eq $true) {
        Write-Host "PASS - Login successful" -ForegroundColor Green
        $token = $response.data.token
        Write-Host "Token received: $($token.Substring(0,30))..." -ForegroundColor Cyan
    } else {
        Write-Host "FAIL - Response success is false" -ForegroundColor Red
    }
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
}
catch {
    Write-Host "FAIL - Login failed" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Gray
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 4: Create Event
Write-Host "[4/6] Testing Create Event..." -ForegroundColor Yellow
Write-Host "URL: POST $apiUrl/events" -ForegroundColor Gray
Write-Host "Authorization: Bearer $($token.Substring(0,20))..." -ForegroundColor Gray
$eventData = @{
    title = "Test Meeting"
    startTime = "2025-11-01T10:00:00Z"
    endTime = "2025-11-01T11:00:00Z"
    status = "BUSY"
}
Write-Host "Body:" -ForegroundColor Gray
Write-Host ($eventData | ConvertTo-Json) -ForegroundColor White

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/events" -Method Post -Body ($eventData | ConvertTo-Json) -Headers $headers -ContentType "application/json"
    if ($response.success -eq $true) {
        Write-Host "PASS - Event created" -ForegroundColor Green
        $eventId = $response.data.event._id
        Write-Host "Event ID: $eventId" -ForegroundColor Cyan
    } else {
        Write-Host "FAIL - Response success is false" -ForegroundColor Red
    }
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
}
catch {
    Write-Host "FAIL - Event creation failed" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Gray
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 5: Get Events
Write-Host "[5/6] Testing Get Events..." -ForegroundColor Yellow
Write-Host "URL: GET $apiUrl/events" -ForegroundColor Gray
Write-Host "Authorization: Bearer $($token.Substring(0,20))..." -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "$apiUrl/events" -Method Get -Headers $headers
    if ($response.success -eq $true) {
        Write-Host "PASS - Retrieved $($response.data.count) event(s)" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Response success is false" -ForegroundColor Red
    }
    Write-Host "Response:" -ForegroundColor Gray
    Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
}
catch {
    Write-Host "FAIL - Cannot get events" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Response:" -ForegroundColor Gray
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 6: Update Event
if ($eventId) {
    Write-Host "[6/6] Testing Update Event..." -ForegroundColor Yellow
    Write-Host "URL: PUT $apiUrl/events/$eventId" -ForegroundColor Gray
    Write-Host "Authorization: Bearer $($token.Substring(0,20))..." -ForegroundColor Gray
    $updateData = @{
        title = "Updated Meeting"
        status = "SWAPPABLE"
    }
    Write-Host "Body:" -ForegroundColor Gray
    Write-Host ($updateData | ConvertTo-Json) -ForegroundColor White
    
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/events/$eventId" -Method Put -Body ($updateData | ConvertTo-Json) -Headers $headers -ContentType "application/json"
        if ($response.success -eq $true) {
            Write-Host "PASS - Event updated" -ForegroundColor Green
        } else {
            Write-Host "FAIL - Response success is false" -ForegroundColor Red
        }
        Write-Host "Response:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
    }
    catch {
        Write-Host "FAIL - Update failed" -ForegroundColor Red
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error Response:" -ForegroundColor Gray
            Write-Host $errorBody -ForegroundColor Red
        } catch {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "[6/6] Skipped - No event ID available" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""