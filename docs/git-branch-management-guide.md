# Git Branch Management Guide

## Overview
This guide establishes standardized procedures for branch management in the EVLink project to maintain a clean repository and avoid conflicts in future development.

## Branch Structure

### Main Branches
- **`main`**: Production-ready code, deployed to live environment
- **`staging`**: Pre-production testing, mirrors main after successful deployments
- **`feature/*`**: Feature development branches, created from `main`

### Branch Naming Conventions
- Features: `feature/short-description`
- Bug fixes: `fix/short-description` 
- Hotfixes: `hotfix/short-description`
- Include issue numbers when relevant: `fix/ui-improvements-issues-247-251`

## Development Workflow

### 1. Starting New Development
```bash
# Always start from latest main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Pull Request Process
1. **Feature → Staging**: Test changes in pre-production environment
2. **Staging → Main**: Deploy to production after validation

### 3. Post-Deployment Cleanup

#### Immediate Cleanup (after successful deployment)
```bash
# Switch to main and pull latest changes
git checkout main
git pull origin main

# Delete local merged branches
git branch -d feature/your-feature-name

# Ensure staging is synced
git checkout staging
git pull origin staging
git merge main --ff-only  # Should fast-forward
```

#### Weekly Cleanup (optional maintenance)
```bash
# View all local branches
git branch -a

# Delete multiple merged branches
git branch --merged main | grep -v "\* main\|staging" | xargs -n 1 git branch -d

# Cleanup remote tracking branches that no longer exist
git remote prune origin
```

## Branch States and Actions

### Active Development
- ✅ Keep: `main`, `staging`, current feature branches
- ❌ Delete: Nothing during active development

### After PR Merged to Staging
- ✅ Keep: `main`, `staging`, feature branch (until production deployment)
- ❌ Delete: Nothing yet

### After Production Deployment
- ✅ Keep: `main`, `staging`
- ❌ Delete: Merged feature branches immediately

### Abandoned/Cancelled Features
```bash
# Delete local branch
git branch -D feature/abandoned-feature

# Delete remote branch (if pushed)
git push origin --delete feature/abandoned-feature
```

## Commands Reference

### Branch Management
```bash
# List all branches
git branch -a

# List merged branches
git branch --merged main

# Delete local branch (safe - only if merged)
git branch -d branch-name

# Force delete local branch (use with caution)
git branch -D branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Synchronization
```bash
# Sync with remote
git fetch origin
git pull origin main

# Fast-forward merge (safe)
git merge main --ff-only

# Check if branch is up to date
git status
```

### Branch Information
```bash
# Show recent commits per branch
git for-each-ref --sort=-committerdate refs/heads/

# Show branches with last commit date
git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/

# Check which branches are merged
git branch --merged main
git branch --no-merged main
```

## Troubleshooting

### Problem: "Branch not fully merged" warning
```bash
# Check what commits are different
git log feature/branch-name ^main --oneline

# If safe to delete, force delete
git branch -D feature/branch-name
```

### Problem: Staging out of sync with main
```bash
# Reset staging to match main exactly
git checkout staging
git reset --hard main
git push origin staging --force-with-lease  # Use with caution
```

### Problem: Too many old branches
```bash
# Interactive cleanup
git branch | grep -v "main\|staging" | xargs -p git branch -d

# Or manual review
git branch --merged main
```

## Best Practices

### ✅ Do
- Create feature branches from latest `main`
- Delete branches immediately after successful deployment
- Use descriptive branch names with issue numbers
- Keep `staging` synchronized with `main` after deployments
- Test in staging before production deployment

### ❌ Don't
- Create branches from outdated `main`
- Keep merged branches after deployment
- Push directly to `main` or `staging`
- Force-push to shared branches without coordination
- Leave abandoned branches lingering

## Automation Opportunities

### GitHub Actions (Future Enhancement)
Consider implementing automated branch cleanup:
- Auto-delete feature branches after PR merge
- Automated staging synchronization
- Branch protection rules
- Automated testing before merge

### Local Git Hooks (Optional)
```bash
# Pre-commit hook to ensure branch is up to date
# Post-merge hook for automatic cleanup reminders
```

## Session History
This guide was created following the 2025-07-22 development session where:
- 4 GitHub issues (#247-#251) were successfully resolved
- Proper git workflow was established
- Branch cleanup procedures were implemented
- Clean repository state was achieved

For detailed technical implementation, see: `docs/session-2025-07-22-ui-fixes-and-branch-cleanup.md`