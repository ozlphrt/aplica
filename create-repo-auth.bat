@echo off
echo === Create GitHub Repository with Authentication ===
echo.
echo Username: ozlphrt
echo Email: ozalph@gmail.com
echo.
echo Checking for GitHub CLI...
gh --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo GitHub CLI is not installed.
    echo Installing via winget...
    winget install GitHub.cli
    echo.
    echo Please restart this script after installation.
    pause
    exit /b 1
)

echo GitHub CLI found!
echo.

echo Checking authentication status...
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo Not authenticated. Starting login process...
    echo.
    echo Choose authentication method:
    echo 1. GitHub.com web browser
    echo 2. Paste a token
    echo.
    gh auth login
    echo.
) else (
    echo Already authenticated!
    gh auth status
    echo.
)

echo.
echo Creating repository 'aplica' on GitHub...
echo Repository name: aplica
echo Description: Apply with clarity - Data-driven college matching application
echo Visibility: Public
echo.
gh repo create aplica --public --description "Apply with clarity - Data-driven college matching application" --source=. --remote=origin --push

if %errorlevel% equ 0 (
    echo.
    echo === SUCCESS! Repository Created ===
    echo.
    echo Repository: https://github.com/ozlphrt/aplica
    echo.
    echo Creating and pushing v1.0.0 tag...
    git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version" 2>nul
    git push origin v1.0.0 2>nul
    if %errorlevel% equ 0 (
        echo Tag pushed successfully!
    )
    echo.
    echo === COMPLETE ===
    echo.
    echo Your v1.0.0 release is live at:
    echo https://github.com/ozlphrt/aplica/releases/tag/v1.0.0
    echo.
) else (
    echo.
    echo Could not create repository. Possible reasons:
    echo 1. Repository 'aplica' already exists
    echo 2. Authentication failed
    echo 3. Network issue
    echo.
    echo Check if repository exists:
    echo https://github.com/ozlphrt/aplica
    echo.
)

pause

