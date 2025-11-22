@echo off
echo === Creating GitHub Repository for Aplica ===
echo.

echo Checking for GitHub CLI...
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo GitHub CLI (gh) is not installed.
    echo.
    echo Please install it from: https://cli.github.com/
    echo Or create the repository manually at: https://github.com/new
    echo.
    pause
    exit /b 1
)

echo GitHub CLI found!
echo.

echo Checking authentication...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo Not authenticated. Please login:
    gh auth login
)

echo.
echo Creating repository 'aplica' on GitHub...
gh repo create aplica --public --description "Apply with clarity - Data-driven college matching application" --source=. --remote=origin --push

if %errorlevel% equ 0 (
    echo.
    echo === Repository Created Successfully! ===
    echo.
    echo Repository URL: https://github.com/ozlphrt/aplica
    echo.
    echo Now creating and pushing v1.0.0 tag...
    git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version"
    git push origin v1.0.0
    echo.
    echo === Complete! ===
) else (
    echo.
    echo Failed to create repository. It may already exist.
    echo.
    echo You can:
    echo 1. Delete the existing repo at: https://github.com/ozlphrt/aplica/settings
    echo 2. Or use a different name
    echo.
)

pause

