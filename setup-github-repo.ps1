# Create GitHub Repository for Aplica v1.0.0
# This script will create the repository and push everything

Write-Host "=== Creating GitHub Repository ===" -ForegroundColor Cyan
Write-Host "Username: ozlphrt" -ForegroundColor Yellow
Write-Host "Email: ozalph@gmail.com" -ForegroundColor Yellow
Write-Host ""

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if ($ghInstalled) {
    Write-Host "GitHub CLI found!" -ForegroundColor Green
    Write-Host ""
    
    # Check authentication
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Not authenticated. Please authenticate..." -ForegroundColor Yellow
        Write-Host "This will open a browser for you to log in." -ForegroundColor Yellow
        Write-Host ""
        gh auth login
    } else {
        Write-Host "Already authenticated!" -ForegroundColor Green
        gh auth status
    }
    
    Write-Host ""
    Write-Host "Creating repository 'aplica'..." -ForegroundColor Cyan
    Write-Host ""
    
    # Create repository
    gh repo create aplica --public --description "Apply with clarity - Data-driven college matching application" --source=. --remote=origin --push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Repository Created! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "Creating and pushing v1.0.0 tag..." -ForegroundColor Cyan
        git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version"
        git push origin v1.0.0
        
        Write-Host ""
        Write-Host "=== COMPLETE ===" -ForegroundColor Green
        Write-Host "Repository: https://github.com/ozlphrt/aplica" -ForegroundColor Cyan
        Write-Host "Release: https://github.com/ozlphrt/aplica/releases/tag/v1.0.0" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Failed to create repository." -ForegroundColor Red
        Write-Host "It may already exist at: https://github.com/ozlphrt/aplica" -ForegroundColor Yellow
    }
} else {
    Write-Host "GitHub CLI not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install GitHub CLI" -ForegroundColor Cyan
    Write-Host "  winget install GitHub.cli"
    Write-Host "  Then run this script again"
    Write-Host ""
    Write-Host "Option 2: Manual creation" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://github.com/new"
    Write-Host "  2. Create repository named: aplica"
    Write-Host "  3. Then run:" -ForegroundColor Yellow
    Write-Host "     git remote add origin https://github.com/ozlphrt/aplica.git"
    Write-Host "     git push -u origin master"
    Write-Host "     git tag -a v1.0.0 -m 'Release v1.0.0'"
    Write-Host "     git push origin v1.0.0"
}

