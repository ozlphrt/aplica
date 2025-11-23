# Release v1.0.0 - Initial stable release (PowerShell version for Windows)
# Run this script to tag and push v1.0.0 to GitHub

Write-Host "=== Aplica v1.0.0 Release ===" -ForegroundColor Cyan
Write-Host ""

# Check current branch
$branch = git branch --show-current
Write-Host "Current branch: $branch" -ForegroundColor Yellow

# Unstage venv if it was accidentally added
Write-Host ""
Write-Host "Cleaning up venv from staging..." -ForegroundColor Yellow
git reset pipeline/venv/ 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Cleaned venv from staging" -ForegroundColor Green
}

# Check git status
Write-Host ""
Write-Host "Checking git status..." -ForegroundColor Yellow
git status --short | Select-Object -First 20

# Confirm before proceeding
Write-Host ""
$confirm = Read-Host "Proceed with commit and tag v1.0.0? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Aborted." -ForegroundColor Red
    exit 1
}

# Check if there are changes to commit
$staged = git diff --cached --quiet 2>$null
$unstaged = git diff --quiet 2>$null

if (-not $staged -or -not $unstaged) {
    Write-Host ""
    Write-Host "Committing changes..." -ForegroundColor Yellow
    git commit -m "chore(release): v1.0.0 — initial stable release"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Committed changes" -ForegroundColor Green
    }
} else {
    Write-Host "No changes to commit." -ForegroundColor Gray
}

# Create tag
Write-Host ""
Write-Host "Creating tag v1.0.0..." -ForegroundColor Yellow
$tagMessage = @"
Release v1.0.0 - Initial stable version

Features:
- Adaptive student profile questionnaire
- Comprehensive college matching algorithm
- Interactive results visualization
- Detailed college profiles with financial breakdown
- Saved colleges list
- Database with 6,000+ US colleges
- College Scorecard and IPEDS data integration
"@

git tag -a v1.0.0 -m $tagMessage
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Created tag v1.0.0" -ForegroundColor Green
}

# Check for remote
Write-Host ""
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    Write-Host "⚠️  No remote 'origin' configured." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To push to GitHub:" -ForegroundColor Cyan
    Write-Host "  1. Create a repository on GitHub"
    Write-Host "  2. Run: git remote add origin <your-repo-url>"
    Write-Host "  3. Run: git push -u origin $branch"
    Write-Host "  4. Run: git push origin v1.0.0"
} else {
    Write-Host "Remote found: $remote" -ForegroundColor Green
    Write-Host ""
    $push = Read-Host "Push to GitHub? (y/n)"
    if ($push -eq "y" -or $push -eq "Y") {
        Write-Host "Pushing branch..." -ForegroundColor Yellow
        git push origin $branch
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Failed to push branch (may need: git push -u origin $branch)" -ForegroundColor Yellow
        }
        
        Write-Host "Pushing tag..." -ForegroundColor Yellow
        git push origin v1.0.0
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Release v1.0.0 pushed to GitHub!" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "To create a GitHub release:" -ForegroundColor Cyan
        Write-Host "  gh release create v1.0.0 --generate-notes --title 'v1.0.0' --latest"
    }
}

Write-Host ""
Write-Host "=== Release Complete ===" -ForegroundColor Cyan
Write-Host "Version: v1.0.0" -ForegroundColor Green
Write-Host "Tag: v1.0.0" -ForegroundColor Green
if ($remote) {
    $repoUrl = $remote -replace '\.git$', ''
    Write-Host "Tree: ${repoUrl}/tree/v1.0.0" -ForegroundColor Blue
    Write-Host "Release: ${repoUrl}/releases/tag/v1.0.0" -ForegroundColor Blue
}

