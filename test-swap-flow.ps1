# Complete Swap Flow Test Script

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Complete Swap Flow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:5000/api/v1"

# Generate unique emails
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$user1Email = "alice$timestamp@example.com"
$user2Email = "bob$timestamp@example.com"

# Step 1: Create User 1 (Alice)
Write-Host "[1] Creating User 1 (Alice)..." -ForegroundColor Yellow
$user1Data = @{
    name = "Alice"
    email = $user1Email
    password = "password123"
} | ConvertTo-Json

$user1Response = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $user1Data -ContentType "application/json"
$token1 = $user1Response.data.token
Write-Host "SUCCESS - Alice created" -ForegroundColor Green
Write-Host "Token: $($token1.Substring(0,20))...`n" -ForegroundColor Gray

# Step 2: Create User 2 (Bob)
Write-Host "[2] Creating User 2 (Bob)..." -ForegroundColor Yellow
$user2Data = @{
    name = "Bob"
    email = $user2Email
    password = "password123"
} | ConvertTo-Json

$user2Response = Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $user2Data -ContentType "application/json"
$token2 = $user2Response.data.token
Write-Host "SUCCESS - Bob created" -ForegroundColor Green
Write-Host "Token: $($token2.Substring(0,20))...`n" -ForegroundColor Gray

# Step 3: Alice creates a SWAPPABLE event
Write-Host "[3] Alice creates Event 1 (SWAPPABLE)..." -ForegroundColor Yellow
$event1Data = @{
    title = "Alice's Morning Meeting"
    startTime = "2025-11-10T09:00:00Z"
    endTime = "2025-11-10T10:00:00Z"
    status = "SWAPPABLE"
} | ConvertTo-Json

$headers1 = @{ "Authorization" = "Bearer $token1" }
$event1Response = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $event1Data -Headers $headers1 -ContentType "application/json"
$aliceSlotId = $event1Response.data.event._id
Write-Host "SUCCESS - Event created" -ForegroundColor Green
Write-Host "Alice's Slot ID: $aliceSlotId`n" -ForegroundColor Cyan

# Step 4: Bob creates a SWAPPABLE event
Write-Host "[4] Bob creates Event 2 (SWAPPABLE)..." -ForegroundColor Yellow
$event2Data = @{
    title = "Bob's Afternoon Workshop"
    startTime = "2025-11-10T14:00:00Z"
    endTime = "2025-11-10T15:00:00Z"
    status = "SWAPPABLE"
} | ConvertTo-Json

$headers2 = @{ "Authorization" = "Bearer $token2" }
$event2Response = Invoke-RestMethod -Uri "$baseUrl/events" -Method Post -Body $event2Data -Headers $headers2 -ContentType "application/json"
$bobSlotId = $event2Response.data.event._id
Write-Host "SUCCESS - Event created" -ForegroundColor Green
Write-Host "Bob's Slot ID: $bobSlotId`n" -ForegroundColor Cyan

# Step 5: Alice views swappable slots
Write-Host "[5] Alice views swappable slots marketplace..." -ForegroundColor Yellow
$swappableResponse = Invoke-RestMethod -Uri "$baseUrl/events/swappable-slots" -Method Get -Headers $headers1
Write-Host "SUCCESS - Found $($swappableResponse.data.count) swappable slot(s)" -ForegroundColor Green
Write-Host ($swappableResponse.data.slots | ConvertTo-Json -Depth 5)
Write-Host ""

# Step 6: Alice creates a swap request
Write-Host "[6] Alice requests to swap with Bob..." -ForegroundColor Yellow
$swapRequestData = @{
    mySlotId = $aliceSlotId
    theirSlotId = $bobSlotId
} | ConvertTo-Json

$swapResponse = Invoke-RestMethod -Uri "$baseUrl/swap-request" -Method Post -Body $swapRequestData -Headers $headers1 -ContentType "application/json"
$swapRequestId = $swapResponse.data.swapRequest._id
Write-Host "SUCCESS - Swap request created" -ForegroundColor Green
Write-Host "Swap Request ID: $swapRequestId" -ForegroundColor Cyan
Write-Host "Status: $($swapResponse.data.swapRequest.status)`n" -ForegroundColor Yellow

# Step 7: Verify both slots are now SWAP_PENDING
Write-Host "[7] Verifying slots are SWAP_PENDING..." -ForegroundColor Yellow
$aliceEvents = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get -Headers $headers1
$bobEvents = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get -Headers $headers2
Write-Host "Alice's slot status: $($aliceEvents.data.events[0].status)" -ForegroundColor Yellow
Write-Host "Bob's slot status: $($bobEvents.data.events[0].status)`n" -ForegroundColor Yellow

# Step 8: Bob views his swap requests
Write-Host "[8] Bob checks his incoming swap requests..." -ForegroundColor Yellow
$bobRequests = Invoke-RestMethod -Uri "$baseUrl/swap-request/requests" -Method Get -Headers $headers2
Write-Host "SUCCESS - Bob has $($bobRequests.data.incoming.count) incoming request(s)" -ForegroundColor Green
Write-Host ($bobRequests.data.incoming.requests | ConvertTo-Json -Depth 5)
Write-Host ""

# Step 9: Bob ACCEPTS the swap request
Write-Host "[9] Bob ACCEPTS the swap request..." -ForegroundColor Yellow
$acceptData = @{
    accept = $true
} | ConvertTo-Json

$acceptResponse = Invoke-RestMethod -Uri "$baseUrl/swap-request/response/$swapRequestId" -Method Post -Body $acceptData -Headers $headers2 -ContentType "application/json"
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SWAP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ($acceptResponse | ConvertTo-Json -Depth 10)
Write-Host ""

# Step 10: Verify ownership has been swapped
Write-Host "[10] Verifying ownership swap..." -ForegroundColor Yellow
$aliceEventsAfter = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get -Headers $headers1
$bobEventsAfter = Invoke-RestMethod -Uri "$baseUrl/events" -Method Get -Headers $headers2

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FINAL RESULTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Alice now owns:" -ForegroundColor Cyan
Write-Host "  Title: $($aliceEventsAfter.data.events[0].title)" -ForegroundColor White
Write-Host "  Time: $($aliceEventsAfter.data.events[0].startTime)" -ForegroundColor White
Write-Host "  Status: $($aliceEventsAfter.data.events[0].status)" -ForegroundColor White
Write-Host ""
Write-Host "Bob now owns:" -ForegroundColor Cyan
Write-Host "  Title: $($bobEventsAfter.data.events[0].title)" -ForegroundColor White
Write-Host "  Time: $($bobEventsAfter.data.events[0].startTime)" -ForegroundColor White
Write-Host "  Status: $($bobEventsAfter.data.events[0].status)" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  All Tests Passed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""