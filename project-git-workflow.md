# Project-Specific Git Workflow Guide

This guide addresses the specific issues encountered in the replica-view-studio project and provides a step-by-step approach to commit and push changes to the main branch.

## Current Project Status

Based on our analysis, we've made the following changes to the codebase:

1. Fixed auto test to start immediately on the first silo
2. Made auto test continue running even when navigating to other pages
3. Made auto test resume from where it left off when restarted
4. Renamed the "Analytics" page to "Maintenance"
5. Ensured everything connects using the API

## Addressing Git Repository Issues

The project's Git repository is currently experiencing timeout issues. Here's how to resolve them:

### 1. Repository Recovery Steps

```bash
# 1. Backup current changes
cp -r src /tmp/replica-view-studio-src-backup

# 2. Remove problematic Git index
rm -f .git/index

# 3. Rebuild Git index
git reset

# 4. If the above doesn't work, recreate the repository
rm -rf .git
git init
git remote add origin https://github.com/basharagb/replica-view-studio.git
```

### 2. Adding Changes to Git

After repository recovery:

```bash
# 1. Add the specific files we modified
git add src/hooks/useSiloSystem.ts
git add src/providers/SystemDataProvider.tsx
git add src/pages/Dashboard.tsx

# 2. Check status
git status

# 3. If there are other changes, add them too
git add .
```

### 3. Committing Changes

Create a comprehensive commit with a detailed message:

```bash
git commit -m "feat(auto-test): Implement persistent auto test functionality

- Fix auto test to start immediately on first silo
- Make auto test continue running across page navigation
- Enable auto test to resume from where it left off
- Rename 'Analytics' page to 'Maintenance' in navigation
- Ensure all components connect using live API data

These changes improve the user experience by making the auto test
more responsive and persistent, while also updating the navigation
to better reflect the application's functionality."
```

### 4. Pushing to Remote Repository

```bash
# 1. First, fetch the latest changes from remote
git fetch origin

# 2. Check what branch we should push to
git branch -a

# 3. Push to the main branch
git push origin main

# 4. If there are conflicts, merge first
git pull origin main
# Resolve any conflicts if they occur
git push origin main
```

## Alternative Approach: Creating a New Branch

If direct pushing to main is problematic:

```bash
# 1. Create a new branch with descriptive name
git checkout -b feature/auto-test-persistence

# 2. Add and commit changes
git add .
git commit -m "feat(auto-test): Implement persistent auto test functionality"

# 3. Push the new branch
git push -u origin feature/auto-test-persistence

# 4. Create a Pull Request on GitHub to merge into main
```

## Testing Before Commit

Before committing, ensure the application works correctly:

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Run development server
npm run dev

# 3. Test functionality:
#    - Auto test starts immediately on first silo
#    - Auto test continues when navigating between pages
#    - Auto test resumes from where it left off
#    - "Maintenance" appears in navigation instead of "Reports"
#    - API data is being used for all components
```

## Handling the Specific Files Modified

### 1. src/hooks/useSiloSystem.ts
- Implements global auto test state management
- Fixes immediate start of auto test
- Ensures persistence across navigation

### 2. src/providers/SystemDataProvider.tsx
- Adds auto test state to global context
- Enables persistence of auto test progress

### 3. src/pages/Dashboard.tsx
- Renames "Reports" navigation item to "Maintenance"

## Commit Message Guidelines for This Project

Follow this format for commits in this project:

```
feat(area): brief description

Detailed explanation of what was changed and why.
Mention any important implementation details.
Reference any related issues if applicable.

Fixes #issue-number
```

Example:
```
feat(auto-test): Implement persistent auto test functionality

- Refactor useSiloSystem hook to use global state for auto test
- Add auto test state management to SystemDataProvider
- Fix immediate start of auto test on first silo
- Enable persistence across page navigation
- Allow resuming from where left off

These changes improve the user experience by making the auto test
more responsive and persistent across navigation.
```

## Branch Protection and Code Review

When working with this repository:

1. Ensure all CI checks pass before merging
2. Request code review from team members
3. Address all review comments before merging
4. Use squash and merge to maintain clean history
5. Delete feature branches after merging

## Troubleshooting Common Issues

### 1. Git Timeout Errors
```bash
# Increase Git buffer size
git config --global http.postBuffer 524288000

# Set longer timeout
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 2. Permission Denied Errors
```bash
# Check SSH keys (if using SSH)
ssh -T git@github.com

# Or use HTTPS with personal access token
git remote set-url origin https://username:token@github.com/basharagb/replica-view-studio.git
```

### 3. Merge Conflicts
```bash
# Abort merge if too complex
git merge --abort

# Or resolve conflicts manually
# Edit conflicted files
git add resolved-file.ts
git commit
```

## Final Steps for Deployment

After successfully pushing changes:

1. Verify changes on GitHub
2. Check that CI/CD pipeline passes
3. Test deployment if applicable
4. Monitor application performance
5. Update documentation if needed

This guide should help you successfully commit and push the changes made to the replica-view-studio project despite the Git repository issues encountered.