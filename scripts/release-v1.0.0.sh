#!/bin/bash
# Release v1.0.0 - Initial stable release
# Run this script to tag and push v1.0.0 to GitHub

set -e

echo "=== Aplica v1.0.0 Release ==="
echo ""

# Check if we're on the right branch
BRANCH=$(git branch --show-current)
echo "Current branch: $BRANCH"

# Unstage venv if it was accidentally added
echo ""
echo "Cleaning up venv from staging..."
git reset pipeline/venv/ 2>/dev/null || echo "No venv to unstage"

# Check git status
echo ""
echo "Checking git status..."
git status --short | head -20

# Confirm before proceeding
echo ""
read -p "Proceed with commit and tag v1.0.0? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborted."
    exit 1
fi

# Commit if there are changes
if ! git diff --cached --quiet || ! git diff --quiet; then
    echo ""
    echo "Committing changes..."
    git commit -m "chore(release): v1.0.0 — initial stable release"
else
    echo "No changes to commit."
fi

# Create tag
echo ""
echo "Creating tag v1.0.0..."
git tag -a v1.0.0 -m "Release v1.0.0 - Initial stable version

Features:
- Adaptive student profile questionnaire
- Comprehensive college matching algorithm
- Interactive results visualization
- Detailed college profiles with financial breakdown
- Saved colleges list
- Database with 6,000+ US colleges
- College Scorecard and IPEDS data integration"

# Check for remote
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE" ]; then
    echo ""
    echo "⚠️  No remote 'origin' configured."
    echo "To push to GitHub:"
    echo "  1. Create a repository on GitHub"
    echo "  2. Run: git remote add origin <your-repo-url>"
    echo "  3. Run: git push -u origin $BRANCH"
    echo "  4. Run: git push origin v1.0.0"
else
    echo ""
    echo "Remote found: $REMOTE"
    echo ""
    read -p "Push to GitHub? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Pushing branch..."
        git push origin $BRANCH || echo "⚠️  Failed to push branch (may need: git push -u origin $BRANCH)"
        echo "Pushing tag..."
        git push origin v1.0.0 || echo "⚠️  Failed to push tag"
        echo ""
        echo "✓ Release v1.0.0 pushed to GitHub!"
        echo ""
        echo "To create a GitHub release:"
        echo "  gh release create v1.0.0 --generate-notes --title 'v1.0.0' --latest"
    fi
fi

echo ""
echo "=== Release Complete ==="
echo "Version: v1.0.0"
echo "Tag: v1.0.0"
if [ ! -z "$REMOTE" ]; then
    REPO_URL=$(echo $REMOTE | sed 's/\.git$//')
    echo "Tree: ${REPO_URL}/tree/v1.0.0"
    echo "Release: ${REPO_URL}/releases/tag/v1.0.0"
fi

