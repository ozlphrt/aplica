@echo off
echo ========================================
echo    Aplica v1.0.0 - Complete Release
echo ========================================
echo.

echo Step 1: Removing venv from staging...
git reset pipeline/venv/ 2>nul
echo.

echo Step 2: Staging all changes...
git add .
git reset pipeline/venv/ 2>nul
echo.

echo Step 3: Committing release...
git commit -m "chore(release): v1.0.0 — initial stable release" 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Committed
) else (
    echo   ℹ No changes to commit
)
echo.

echo Step 4: Adding remote (if not exists)...
git remote remove origin 2>nul
git remote add origin https://github.com/ozlphrt/aplica.git 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Remote added
) else (
    echo   ℹ Remote already exists or error
)
echo.

echo Step 5: Pushing to GitHub...
git push -u origin master
if %errorlevel% neq 0 (
    echo.
    echo   ⚠ Push failed. This might require authentication.
    echo   You may need to:
    echo   1. Enter your GitHub username/password
    echo   2. Or use a Personal Access Token
    echo.
    pause
    exit /b 1
) else (
    echo   ✓ Code pushed successfully
)
echo.

echo Step 6: Creating v1.0.0 tag...
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version" 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Tag created
) else (
    echo   ℹ Tag may already exist
)
echo.

echo Step 7: Pushing tag...
git push origin v1.0.0
if %errorlevel% equ 0 (
    echo   ✓ Tag pushed successfully
) else (
    echo   ⚠ Tag push may have failed
)
echo.

echo ========================================
echo    ✓ Release Complete!
echo ========================================
echo.
echo Repository: https://github.com/ozlphrt/aplica
echo Release:    https://github.com/ozlphrt/aplica/releases/tag/v1.0.0
echo.
pause

