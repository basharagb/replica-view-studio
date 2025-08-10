# Comprehensive Git Commit Guide

This guide provides a detailed process for committing changes to the main branch in Git, including best practices for code review, branch protection rules, and collaborative workflows.

## 1. Pre-Commit Preparation

### 1.1. Review Your Changes
Before committing, review all changes to ensure they are complete and correct:

```bash
# View modified files
git status

# View detailed changes
git diff

# View changes for specific files
git diff path/to/file
```

### 1.2. Run Tests and Linting
Ensure all tests pass and code follows style guidelines:

```bash
# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues automatically (if available)
npm run lint:fix
```

## 2. Staging Files

### 2.1. Stage Individual Files
Stage files selectively to create focused commits:

```bash
# Stage specific files
git add src/components/MyComponent.tsx
git add src/styles/my-component.css

# Stage all changes in a directory
git add src/components/

# Stage all changes (use with caution)
git add .
```

### 2.2. Partial Staging
For files with multiple changes, stage only relevant parts:

```bash
# Interactively stage parts of a file
git add -p path/to/file

# This will show each hunk and ask:
# y = stage this hunk
# n = do not stage this hunk
# s = split this hunk into smaller hunks
# e = edit this hunk manually
# ? = show help
```

### 2.3. Review Staged Changes
Always review what you've staged before committing:

```bash
# View staged changes
git diff --staged

# View staged changes for specific files
git diff --staged path/to/file
```

## 3. Writing Meaningful Commit Messages

### 3.1. Commit Message Structure
Follow the conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 3.2. Commit Types
Use standard types to categorize commits:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

### 3.3. Examples of Good Commit Messages

```
feat(auth): add login with OAuth providers

Implement OAuth login functionality for Google, Facebook, and GitHub.
This includes:
- New OAuth service module
- Updated login UI with provider buttons
- Token management and storage

Closes #123
```

```
fix(api): resolve timeout issues in user data fetching

Fix timeout errors when fetching user data by:
- Increasing timeout duration from 5s to 30s
- Adding retry mechanism for failed requests
- Implementing proper error handling

Resolves #456
```

### 3.4. Commit Message Best Practices

1. Separate subject from body with a blank line
2. Limit the subject line to 50 characters
3. Capitalize the subject line
4. Do not end the subject line with a period
5. Use the imperative mood in the subject line
6. Wrap the body at 72 characters
7. Use the body to explain what and why vs. how

## 4. Making the Commit

### 4.1. Basic Commit
For simple commits with inline messages:

```bash
git commit -m "feat(auth): add OAuth login functionality"
```

### 4.2. Commit with Editor
For detailed commit messages, use your default editor:

```bash
git commit
```

### 4.3. Amend Last Commit
To modify the last commit (before pushing):

```bash
# Amend with new changes
git add .
git commit --amend

# Amend with same message
git add .
git commit --amend --no-edit
```

## 5. Handling Merge Conflicts

### 5.1. Identifying Conflicts
Git will notify you of conflicts during merge or rebase:

```
Auto-merging src/components/App.tsx
CONFLICT (content): Merge conflict in src/components/App.tsx
Automatic merge failed; fix conflicts and then commit the result.
```

### 5.2. Resolving Conflicts
Conflicts are marked in files with conflict markers:

```typescript
<<<<<<< HEAD
const apiUrl = 'https://api.dev.example.com';
=======
const apiUrl = 'https://api.prod.example.com';
>>>>>>> feature/new-api-endpoint
```

To resolve:
1. Edit the file to keep the desired changes
2. Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Stage the resolved file

```bash
# After resolving conflicts in editor
git add src/components/App.tsx

# Continue with merge
git commit
```

### 5.3. Aborting a Merge
If conflicts are too complex, you can abort:

```bash
git merge --abort
```

## 6. Branch Management

### 6.1. Creating Feature Branches
Work on features in separate branches:

```bash
# Create and switch to new branch
git checkout -b feature/user-profile

# Or using newer syntax
git switch -c feature/user-profile
```

### 6.2. Keeping Branches Updated
Regularly sync with the main branch:

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Switch back to feature branch
git checkout feature/user-profile

# Rebase feature branch on main
git rebase main

# Or merge main into feature branch
git merge main
```

### 6.3. Squashing Commits
Clean up commit history before merging:

```bash
# Interactive rebase to squash last 3 commits
git rebase -i HEAD~3

# In the editor, change 'pick' to 'squash' or 's' for commits to combine
# Keep 'pick' for the commit you want to keep as is
```

## 7. Pushing Changes to Remote Repository

### 7.1. First Push of a New Branch
```bash
# Push new branch and set upstream tracking
git push -u origin feature/user-profile
```

### 7.2. Subsequent Pushes
```bash
# Push to tracked branch
git push

# Push to specific branch
git push origin feature/user-profile
```

### 7.3. Force Push (Use with Caution)
```bash
# Force push (overwrites remote history)
git push --force

# Safer force push (won't overwrite if remote has newer commits)
git push --force-with-lease
```

## 8. Pull Request Process

### 8.1. Creating a Pull Request
1. Push your feature branch to remote repository
2. Navigate to the repository on GitHub/GitLab
3. Create a new Pull Request from your branch to main
4. Add a descriptive title and detailed description
5. Request reviewers

### 8.2. Pull Request Best Practices
- Keep PRs small and focused on a single feature/fix
- Write a clear description explaining the changes
- Include screenshots or GIFs for UI changes
- Reference related issues using keywords like "Closes #123"
- Ensure all CI checks pass before requesting review

### 8.3. Addressing Review Feedback
1. Make requested changes in your local branch
2. Commit and push the changes
3. Respond to each comment to indicate resolution
4. Request re-review if significant changes were made

## 9. Merging to Main Branch

### 9.1. Merge Strategies
Choose the appropriate merge strategy:

1. **Merge Commit**: Preserves complete history and chronological order
   ```bash
   git merge feature/user-profile
   ```

2. **Squash and Merge**: Combines all feature branch commits into a single commit
   (Done through GitHub UI)

3. **Rebase and Merge**: Reapplies feature branch commits on top of main
   ```bash
   git checkout feature/user-profile
   git rebase main
   git checkout main
   git merge feature/user-profile
   ```

### 9.2. Pre-Merge Checklist
Before merging to main:
- [ ] All CI checks pass
- [ ] Code review is approved
- [ ] Tests are passing
- [ ] Documentation is updated
- [ ] No merge conflicts with main

## 10. Branch Protection Rules

### 10.1. Common Protection Rules
Set up branch protection rules on GitHub/GitLab:

1. **Require pull request reviews**
   - Require at least 1-2 approved reviews
   - Dismiss stale pull request approvals when new commits are pushed

2. **Require status checks to pass**
   - Require branches to be up to date before merging
   - Specify which status checks must pass

3. **Include administrators**
   - Enforce all configured restrictions for administrators

4. **Allow force pushes**
   - Generally disable, but allow for specific actors if needed

### 10.2. Required Status Checks
Common status checks to require:
- Continuous integration (CI) builds
- Code quality checks (linting, formatting)
- Security scans
- Test coverage thresholds

## 11. Collaborative Workflows

### 11.1. Git Flow Workflow
A popular branching model:

1. **main** - Production-ready code
2. **develop** - Integration branch for features
3. **feature/** - Feature branches
4. **release/** - Release preparation branches
5. **hotfix/** - Emergency fixes to production

### 11.2. GitHub Flow
A simpler workflow:

1. Create a branch from main
2. Add commits to your branch
3. Open a pull request
4. Review and discuss code
5. Merge to main
6. Deploy immediately

### 11.3. Trunk-Based Development
For continuous integration:

1. Create short-lived feature branches (1-2 days max)
2. Integrate frequently to main branch
3. Use feature flags for incomplete features
4. Maintain main branch in deployable state

## 12. Code Review Best Practices

### 12.1. As a Reviewer
- Review code within 24 hours of request
- Focus on functionality, maintainability, and readability
- Provide constructive feedback with explanations
- Approve only when satisfied with changes
- Use "Comment" for suggestions, "Request Changes" for required fixes

### 12.2. As a Contributor
- Keep pull requests small and focused
- Write clear, descriptive commit messages
- Address all review comments
- Thank reviewers for their feedback
- Be responsive to follow-up questions

## 13. Handling Common Git Issues

### 13.1. Accidental Commits
Undo the last commit but keep changes:
```bash
git reset --soft HEAD~1
```

Completely remove the last commit:
```bash
git reset --hard HEAD~1
```

### 13.2. Recovering Deleted Files
Restore a file from the previous commit:
```bash
git checkout HEAD -- path/to/deleted/file
```

### 13.3. Finding When a Bug Was Introduced
Use git bisect to find the problematic commit:
```bash
git bisect start
git bisect bad                 # Current commit is bad
git bisect good v1.0           # Last known good commit
# Git checks out a commit, test it and mark as good/bad
git bisect good                # If current commit is good
git bisect bad                 # If current commit is bad
# Repeat until git identifies the first bad commit
```

## 14. Best Practices Summary

### 14.1. Commit Practices
- Make small, focused commits
- Write clear, descriptive commit messages
- Follow consistent naming conventions
- Commit early and often
- Don't commit generated files or sensitive data

### 14.2. Branch Practices
- Use descriptive branch names
- Keep branches short-lived
- Regularly sync with main branch
- Delete merged branches
- Use branch protection rules

### 14.3. Collaboration Practices
- Review code thoroughly
- Communicate changes clearly
- Respect team conventions
- Test changes before merging
- Document complex changes

## 15. Tools and Extensions

### 15.1. Git GUI Tools
- GitHub Desktop
- GitKraken
- SourceTree
- VS Code Git integration

### 15.2. Git Extensions
- git-extras
- git-delta (better diff output)
- git-filter-repo (advanced history filtering)

### 15.3. Pre-commit Hooks
Use tools like Husky to automate:
- Code formatting
- Linting
- Test running
- Commit message validation

This comprehensive guide should help you effectively manage Git workflows, maintain code quality, and collaborate efficiently with your team while ensuring repository integrity.