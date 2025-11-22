# Release v1.0.0 Checklist

## Pre-Release

- [x] Version updated in `package.json` to `1.0.0`
- [x] `VERSION` file created with `1.0.0`
- [x] Logo and assets finalized
- [x] `.gitignore` updated to exclude `pipeline/venv/`

## Release Steps

### 1. Clean up repository
```bash
# Remove venv from staging if accidentally added
git reset pipeline/venv/

# Verify .gitignore excludes venv
cat .gitignore | grep venv
```

### 2. Stage changes
```bash
# Add all changes (excluding venv via .gitignore)
git add .
```

### 3. Commit
```bash
git commit -m "chore(release): v1.0.0 — initial stable release"
```

### 4. Create tag
```bash
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

### 5. Push to GitHub

**If remote doesn't exist:**
```bash
# Create repo on GitHub first, then:
git remote add origin <your-repo-url>
git push -u origin master
git push origin v1.0.0
```

**If remote exists:**
```bash
git push origin master
git push origin v1.0.0
```

### 6. Create GitHub Release (Optional)

Using GitHub CLI:
```bash
gh release create v1.0.0 --generate-notes --title "v1.0.0" --latest
```

Or via GitHub web interface:
1. Go to repository → Releases → "Create a new release"
2. Tag: `v1.0.0`
3. Title: `v1.0.0`
4. Description: Use auto-generated notes or copy from tag message

## Automated Release Scripts

**For Windows (PowerShell):**
```powershell
.\scripts\release-v1.0.0.ps1
```

**For Linux/Mac (Bash):**
```bash
chmod +x scripts/release-v1.0.0.sh
./scripts/release-v1.0.0.sh
```

## Post-Release

- [ ] Update `PROJECT_OVERVIEW.md` with release links
- [ ] Create `CHANGELOG.md` entry
- [ ] Document release in `DECISIONS.md`
- [ ] Build production version: `npm run build`
- [ ] Test production build: `npm run preview`

## Release Links (to update after push)

- Tree: `https://github.com/<owner>/<repo>/tree/v1.0.0`
- Release: `https://github.com/<owner>/<repo>/releases/tag/v1.0.0`
- Raw permalink: `https://github.com/<owner>/<repo>/raw/v1.0.0/...`

