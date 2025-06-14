# Rise Hand - Release Guide

This document contains step-by-step instructions for creating releases of the Rise Hand module, including solutions to common problems.

## 📋 Pre-Release Checklist

### 1. Code Preparation

- [ ] All changes committed and tested locally
- [ ] Code builds without errors: `npm run build`
- [ ] Module tested in Foundry VTT
- [ ] Localization updated (lang/en.json and lang/uk.json)

### 2. Version Updates

- [ ] Update version in `module.json`
- [ ] Update version in `package.json` (if needed)
- [ ] Check Foundry compatibility in `module.json`:
  ```json
  "compatibility": {
    "minimum": "13.330",
    "verified": "13.345"
  }
  ```

### 3. Documentation

- [ ] Update README.md with new features
- [ ] Update CHANGELOG.md (if exists)

## 🚀 Release Process

### Step 1: Final Changes

```bash
# Build project
npm run build

# Check everything works
npm run check-deprecated

# Add all changes
git add .
git commit -m "release: prepare v1.x.x"
git push
```

### Step 2: Create Tag

```bash
# Create tag (replace x.x.x with actual version)
git tag v1.x.x

# Push tag
git push --tags
```

### Step 3: Wait for GitHub Actions

- GitHub Actions will automatically start when tag is created
- Check status at GitHub → Actions
- On success, release will appear in Releases

## 🔧 Technical Configuration

### GitHub Actions Workflow (.github/workflows/release.yml)

**Important settings:**

```yaml
permissions:
  contents: write
  pull-requests: write

- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "18"
    cache: 'npm'

- name: Clear npm cache
  run: npm cache clean --force

- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

### GitHub Repository Settings

**Settings → Actions → General → Workflow permissions:**

- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

## 🚨 Common Problems & Solutions

### Problem: npm error ETARGET (version not found)

**Cause:** Non-existent version in package.json

**Solution for Foundry v13:**

```json
// package.json
{
  "devDependencies": {
    "fvtt-types": "github:League-of-Foundry-Developers/foundry-vtt-types#main",
    "typescript": "^5.0.0"
  }
}
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "types": ["fvtt-types"]
  }
}
```

**After changing package.json:**

```bash
# Remove old lock file
rm package-lock.json

# Reinstall dependencies
npm install

# Commit changes
git add package.json package-lock.json
git commit -m "fix: update dependencies for Foundry v13"
git push
```

### Problem: GitHub Actions 403 Forbidden Error

**Solution:**

1. Add permissions to workflow (see above)
2. GitHub Settings → Actions → General → Workflow permissions → Read and write

### Problem: Build fails due to peer dependencies

**Solution:** Use `--legacy-peer-deps`:

```yaml
- name: Install dependencies
  run: npm ci --legacy-peer-deps
```

### Problem: Cache issues in GitHub Actions

**Solution:**

```yaml
- name: Clear npm cache
  run: npm cache clean --force
```

## 📦 Release Structure

After successful release, the following will be created:

- `rise-hand.zip` - module archive for download
- `module.json` - manifest file

**Manifest URL for users:**

```
https://github.com/NazarHromadskyi/rise-hand/releases/latest/download/module.json
```

## 🔄 Versioning

Using Semantic Versioning:

- `v1.0.0` - Major version (breaking changes)
- `v1.1.0` - Minor version (new features)
- `v1.0.1` - Patch version (bug fixes)

## 📝 Complete Process Example

```bash
# 1. Make code changes
# ... edit files ...

# 2. Increment version in module.json
# "version": "1.1.0"

# 3. Build and test
npm run build

# 4. Commit
git add .
git commit -m "feat: add new hand raising animation"
git push

# 5. Create release
git tag v1.1.0
git push --tags

# 6. Check GitHub Actions
# 7. Test installation in Foundry
```

## 🆘 If Something Goes Wrong

1. **Check GitHub Actions logs** - detailed error information
2. **Local build** - `npm run build` should work without errors
3. **Dependency versions** - check package.json and package-lock.json
4. **Access permissions** - GitHub Settings → Actions → Permissions
