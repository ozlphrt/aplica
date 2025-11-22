# Create GitHub Repository - Two Options

## Option 1: Using GitHub CLI (Automated)

If you have GitHub CLI installed:

1. **Install GitHub CLI** (if not installed):
   - Download from: https://cli.github.com/
   - Or: `winget install GitHub.cli`

2. **Authenticate** (if not already):
   ```powershell
   gh auth login
   ```

3. **Run the script**:
   ```powershell
   .\create-github-repo.bat
   ```

This will automatically:
- Create the repository on GitHub
- Add it as remote 'origin'
- Push all your code
- Create and push the v1.0.0 tag

## Option 2: Manual (Web Interface)

1. **Go to**: https://github.com/new

2. **Fill in**:
   - Repository name: `aplica`
   - Description: "Apply with clarity - Data-driven college matching application"
   - Public or Private (your choice)
   - **DO NOT** check "Initialize with README"

3. **Click "Create repository"**

4. **After creation, run these commands**:
   ```powershell
   git remote add origin https://github.com/ozlphrt/aplica.git
   git push -u origin master
   git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version"
   git push origin v1.0.0
   ```

## Quick Check: Do you have GitHub CLI?

Run this to check:
```powershell
gh --version
```

If it shows a version number, use **Option 1**.  
If it says "command not found", use **Option 2**.

