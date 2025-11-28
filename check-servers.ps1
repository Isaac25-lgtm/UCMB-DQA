# Check if servers are running
Write-Host "Checking server status..." -ForegroundColor Cyan
Write-Host ""

# Check Backend
Write-Host "Backend (FastAPI):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/facilities" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✓ Running on http://localhost:8000" -ForegroundColor Green
    Write-Host "  ✓ API Docs: http://localhost:8000/docs" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Not running" -ForegroundColor Red
    Write-Host "  Start with: cd backend; C:\Users\USER\AppData\Local\Programs\Python\Python312\python.exe -m uvicorn main:app --reload" -ForegroundColor Yellow
}

Write-Host ""

# Check Frontend
Write-Host "Frontend (React):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2
    Write-Host "  ✓ Running on http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Not running" -ForegroundColor Red
    Write-Host "  Start with: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Access the application at: http://localhost:5173" -ForegroundColor Cyan

