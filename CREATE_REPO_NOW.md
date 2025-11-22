# Create GitHub Repository - What You Need

## To create the repository automatically, you need ONE of these:

### Option 1: GitHub CLI (Recommended)
1. **Install GitHub CLI** (if not installed):
   ```powershell
   winget install GitHub.cli
   ```

2. **Run the script**:
   ```powershell
   .\setup-github-repo.ps1
   ```

   The script will:
   - Check if GitHub CLI is installed
   - Prompt you to authenticate (opens browser)
   - Create the repository automatically
   - Push all code
   - Create and push v1.0.0 tag

### Option 2: Personal Access Token (PAT)

If you have a GitHub Personal Access Token:

1. **Create a token** (if needed):
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it "repo" permissions
   - Copy the token

2. **Run with token**:
   ```powershell
   $env:GITHUB_TOKEN = "your_token_here"
   gh auth login --with-token
   gh repo create aplica --public --description "Apply with clarity" --source=. --remote=origin --push
   ```

### Option 3: Manual (No tools needed)

1. Go to: https://github.com/new
2. Repository name: `aplica`
3. Click "Create repository"
4. Then run:
   ```powershell
   git remote add origin https://github.com/ozlphrt/aplica.git
   git push -u origin master
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

---

**Recommended:** Try Option 1 first - just run `.\setup-github-repo.ps1` and it will guide you.

