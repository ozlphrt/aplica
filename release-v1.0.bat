@echo off
echo === Aplica v1.0.0 Release ===
echo.

echo Step 1: Removing venv from staging...
git reset pipeline/venv/ 2>nul
echo.

echo Step 2: Staging changes...
git add .
git reset pipeline/venv/ 2>nul
echo.

echo Step 3: Committing...
git commit -m "chore(release): v1.0.0 — initial stable release"
echo.

echo Step 4: Creating tag...
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version"
echo.

echo Step 5: Checking remote...
git remote -v
echo.

echo Step 6: Pushing to GitHub...
git push -u origin master
echo.

echo Step 7: Pushing tag...
git push origin v1.0.0
echo.

echo === Release Complete! ===
echo.
echo Repository: https://github.com/ozlphrt/aplica.git
echo Tag: v1.0.0
echo.
pause

