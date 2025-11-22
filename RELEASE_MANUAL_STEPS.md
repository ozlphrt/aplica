# Manual Release Steps for v1.0.0

The automated script can't run due to terminal issues. Follow these steps manually:

## Step 1: Reset venv from staging

```powershell
git reset pipeline/venv/
```

This removes the large venv directory from staging.

## Step 2: Verify .gitignore is working

```powershell
git status --short | Select-Object -First 10
```

You should NOT see `pipeline/venv/` in the output. If you do, the `.gitignore` update didn't work yet.

## Step 3: Stage only the necessary files

```powershell
git add .
git reset pipeline/venv/
```

This ensures venv stays out of the commit.

## Step 4: Check what will be committed

```powershell
git status
```

Review the list - should not include venv directory.

## Step 5: Commit the release

```powershell
git commit -m "chore(release): v1.0.0 — initial stable release"
```

## Step 6: Create the tag

```powershell
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version

Features:
- Adaptive student profile questionnaire
- Comprehensive college matching algorithm
- Interactive results visualization
- Detailed college profiles with financial breakdown
- Saved colleges list
- Database with 6,000+ US colleges
- College Scorecard and IPEDS data integration"
```

## Step 7: Push to GitHub

**If you already have a remote configured:**
```powershell
git push origin master
git push origin v1.0.0
```

**If you need to set up the remote first:**
```powershell
# First create the repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin master
git push origin v1.0.0
```

## Step 8: Create GitHub Release (Optional)

Using GitHub CLI:
```powershell
gh release create v1.0.0 --generate-notes --title "v1.0.0" --latest
```

Or create it manually on GitHub.com:
1. Go to your repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0`
5. Click "Generate release notes" or paste the tag message

## Troubleshooting

If git is still slow/unresponsive:
1. Close any terminal windows
2. Open a fresh PowerShell window
3. Navigate to the project: `cd C:\Users\ozalp\OneDrive\Desktop\code\Cursor\Aplica`
4. Try the commands above

If venv keeps getting added:
1. Check `.gitignore` has `pipeline/venv/` in it
2. Run: `git rm -r --cached pipeline/venv/` (removes from index, keeps files)
3. Then continue with steps above

