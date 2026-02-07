# Git Secrets Detection - Setup & Usage Guide

## Overview

This project includes automated secrets detection to prevent accidental leakage of sensitive credentials (API keys, tokens, passwords, etc.) in Git commits.

**Key Features:**

- ✅ Automatic detection on every commit
- ✅ Detects API keys, tokens, passwords, private keys
- ✅ Zero system-wide installation required (Node.js based)
- ✅ Integrated with existing Husky pre-commit hooks
- ✅ Clear guidance when secrets are detected
- ✅ Simple to whitelist false positives

## Quick Start

### 1. Setup (One-time)

```bash
# From project root
bash scripts/setup-secrets.sh
```

This will:

- ✅ Verify Node.js is available
- ✅ Enable the secrets detector in pre-commit hooks
- ✅ Test the detector is working

### 2. Use (Automatic)

Secrets detection runs automatically on every `git commit`:

```bash
git add .
git commit -m "feat: add new feature"

# Output:
# 🔐 Scanning for secrets...
# ✅ No secrets detected
# ✅ All pre-commit checks passed
```

### 3. If Secrets Are Detected

The commit will be blocked with details:

```
❌ SECURITY ERROR: Potential secrets detected in staged changes!

📄 src/config.ts
  ├─ API Keys - Generic: 1 occurrence(s)
  │  └─ Line 42: api_key = 'sk_live_abc123def456...'

⚠️  ACTIONS TO TAKE:

1. Remove the secrets from your staged changes
2. If this is a false positive, edit scripts/detect-secrets.js to whitelist the file
3. Use: git reset HEAD <file> to unstage, then fix the file
```

**To fix:**

```bash
# 1. Unstage the file
git reset HEAD src/config.ts

# 2. Edit the file and remove the secret
vim src/config.ts

# 3. Stage and commit again
git add src/config.ts
git commit -m "fix: use env var for API key"
```

## What Gets Detected?

The detector looks for patterns matching:

| Type             | Examples                         | Patterns                            |
| ---------------- | -------------------------------- | ----------------------------------- |
| **API Keys**     | `api_key`, `apiKey`, custom keys | 20+ character strings               |
| **BOOND Token**  | `BOOND_API_TOKEN`                | Key-value format                    |
| **AWS Keys**     | Access keys, secret keys         | `AKIA...` format, 40-char secrets   |
| **GitHub PATs**  | Personal access tokens           | `ghp_`, `ghs_`, `ghu_` prefixes     |
| **Private Keys** | RSA, DSA, EC keys                | `-----BEGIN PRIVATE KEY`            |
| **Passwords**    | Database passwords               | `password`, `passwd`, `db_password` |
| **OAuth Tokens** | Access/refresh tokens            | Token string patterns               |
| **Slack Tokens** | Bot/app tokens                   | `xox[baprs]-...` format             |

## Best Practices

### ✅ DO: Use Environment Variables

```javascript
// ✅ Good - reads from environment
const apiKey = process.env.BOOND_API_TOKEN;
```

### ❌ DON'T: Hardcode Secrets

```javascript
// ❌ Bad - hardcoded secret
const apiKey = 'sk_live_abc123def456ghijklmnop';
```

### ✅ DO: Use .env Files

```bash
# .env (never committed, use .gitignore)
BOOND_API_TOKEN=your_token_here
```

```bash
# .env.example (committed, shows structure)
BOOND_API_TOKEN=your_token_here
```

### ❌ DON'T: Commit .env Files

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

## Handling False Positives

Sometimes legitimate code triggers false alerts.

### Option 1: Whitelist the File

Edit `scripts/detect-secrets.js` and add to `IGNORE_PATTERNS`:

```javascript
IGNORE_PATTERNS = [
  // ... existing patterns
  /my-test-fixture\.json$/, // Whitelist specific file
  /test-data\//, // Whitelist directory
];
```

### Option 2: Use Generic Patterns

Instead of hardcoding:

```javascript
// ❌ This triggers detection
const testToken = 'sk_test_abc123def456';

// ✅ This doesn't
const testToken = process.env.TEST_TOKEN || 'sk_test_';
```

### Option 3: Commit with `--no-verify`

**Only if absolutely certain:**

```bash
git commit --no-verify
```

⚠️ **WARNING**: Use only when you're 100% sure the commit contains no secrets.

## Bypassing Temporarily (Emergency Only)

If you need to bypass the detector temporarily:

```bash
# Temporarily disable
npx husky uninstall

# Make your commit
git commit -m "emergency: fix"

# Re-enable
npx husky install
```

⚠️ **Then immediately:**

1. Remove the secret
2. Rotate the compromised key
3. Force-push to rewrite history (if on private branch)

## Testing the Detector

### Test 1: Verify It's Working

```bash
# Should find no issues
node scripts/detect-secrets.js

# Should exit with 0
echo $?
# Output: 0
```

### Test 2: Test with a Fake Secret

```bash
# Create a test file
echo 'const token = "sk_test_abcdefghijklmnopqrstuv";' > test.js
git add test.js

# Run detector
node scripts/detect-secrets.js
# Should find the secret and exit 1
echo $?
# Output: 1

# Clean up
git reset HEAD test.js
rm test.js
```

### Test 3: Test Full Pre-commit Hook

```bash
# Create a test file with a fake secret
echo 'api_key = "test_key_abcdefghijklmnopqrstuvwxyz"' > config.js
git add config.js

# Try to commit (should be blocked)
git commit -m "test" --no-verify || true

# Clean up
git reset HEAD config.js
rm config.js
```

## Configuration

### Modify Detection Patterns

Edit `scripts/detect-secrets.js`:

```javascript
const SECRET_PATTERNS = [
  {
    name: 'Your Custom Pattern',
    patterns: [/your_regex_pattern/gi],
  },
  // ... more patterns
];
```

### Whitelist Files or Directories

Edit `scripts/detect-secrets.js`:

```javascript
const IGNORE_PATTERNS = [
  // ... existing patterns
  /fixtures\/.*\.json$/, // Ignore JSON in fixtures
  /docs\/examples\//, // Ignore examples directory
];
```

### Ignore File Extensions

```javascript
const WHITELISTED_EXTENSIONS = [
  // ... existing extensions
  '.fixture', // Add custom extension
];
```

## Troubleshooting

### Detector not running on commit

**Problem:** Pre-commit hook doesn't execute

```bash
# Ensure Husky is installed
npx husky install

# Check hook is executable
ls -la .husky/pre-commit
# Should show: -rwxr-xr-x (executable)

# Fix if needed
chmod +x .husky/pre-commit
```

### Detector exits but doesn't show output

**Problem:** Secrets found but no helpful message

```bash
# Run detector manually to debug
node scripts/detect-secrets.js

# Check specific file
node -e "
const content = require('fs').readFileSync('path/to/file', 'utf-8');
const patterns = [/API_KEY|password/gi];
console.log(patterns[0].test(content) ? 'FOUND' : 'NOT FOUND');
"
```

### Whitelisting not working

**Problem:** File is still being scanned

```bash
# Verify the pattern in IGNORE_PATTERNS
# Patterns are regex, not glob patterns

# ❌ Wrong (glob pattern)
/test-fixtures/*.json

# ✅ Correct (regex pattern)
/test-fixtures\/.*\.json$/
```

## Related Files

- **SECURITY.md** - Security policies and best practices
- **scripts/detect-secrets.js** - Main detector implementation
- **scripts/setup-secrets.sh** - Setup script
- **.husky/pre-commit** - Pre-commit hook (runs detector + linters)
- **.env.example** - Environment variable template
- **.gitignore** - Includes .env files

## More Information

See [SECURITY.md](./SECURITY.md) for:

- Detailed security policies
- Handling accidental commits
- Rotating compromised secrets
- Organization-wide secrets management

## Questions or Issues?

1. Read [SECURITY.md](./SECURITY.md)
2. Run `bash scripts/setup-secrets.sh` to reconfigure
3. Check `.husky/_/husky.sh` to verify Husky installation
4. Open an issue on GitHub

## Summary

| Action          | Command                          | Purpose                            |
| --------------- | -------------------------------- | ---------------------------------- |
| **Setup**       | `bash scripts/setup-secrets.sh`  | Initialize secrets detection       |
| **Test**        | `node scripts/detect-secrets.js` | Manual test of detector            |
| **Skip**        | `git commit --no-verify`         | Emergency bypass (not recommended) |
| **View Policy** | `cat SECURITY.md`                | Read security guidelines           |

🔒 Your commits are now protected from accidental secret leaks!
