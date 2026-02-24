# Security Policy

## Secrets Detection

This project uses automated secrets detection to prevent accidental leakage of sensitive credentials (API keys, tokens, passwords, etc.) in Git commits.

### How It Works

The pre-commit hook automatically scans staged changes for patterns matching:

- **API Keys**: Generic API keys, BOOND API tokens, custom API credentials
- **AWS Keys**: AWS Access Key IDs, AWS Secret Access Keys
- **GitHub PATs**: GitHub Personal Access Tokens and deployment tokens
- **Private Keys**: RSA, DSA, EC, OpenSSH, and PGP private keys
- **Database Passwords**: Database connection strings and passwords
- **OAuth Tokens**: Access tokens, refresh tokens, bearer tokens
- **Slack Tokens**: Slack bot and app tokens

### What Happens When Secrets Are Detected?

If a secret is detected in your staged changes:

1. **Commit is blocked** - The pre-commit hook prevents the commit
2. **Details are shown** - You'll see which file(s) contain suspicious patterns
3. **Clear guidance is provided** - Instructions on how to fix and proceed

Example output:

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

### If You Made a Mistake

**You accidentally committed a secret to a public branch?**

See GitHub's official guide: [Removing Sensitive Data from a Repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

**Quick steps:**

1. **Immediately rotate the secret** (change API key, reset token, etc.)
2. **Remove it from history** (using git filter-branch or BFG Repo-Cleaner)
3. **Force push** (only if on a private branch or with team coordination)
4. **Monitor for misuse** (check API logs for unauthorized access)

### False Positives

Sometimes the detector might flag legitimate code:

**To whitelist a file or pattern:**

1. Open `scripts/detect-secrets.js`
2. Add your file to `IGNORE_PATTERNS` or check pattern definitions
3. If it's a test fixture, add it to the test patterns
4. Re-run your commit

**Example:** To ignore a fixture file containing test credentials:

```javascript
// In IGNORE_PATTERNS array
/test-fixtures\/.*\.json$/,
```

### Best Practices

1. **Never commit secrets** - Use environment variables instead

   ```javascript
   // ❌ Bad
   const apiKey = 'sk_live_abc123';

   // ✅ Good
   const apiKey = process.env.BOOND_API_TOKEN;
   ```

2. **Use .env files** - For local development

   ```bash
   # .env (never committed)
   BOOND_API_TOKEN=sk_live_abc123def456
   ```

3. **Use .env.example** - For documentation

   ```bash
   # .env.example (committed)
   BOOND_API_TOKEN=your_token_here
   ```

4. **Rotate regularly** - Change tokens/keys periodically
5. **Limit scope** - Use tokens with minimal necessary permissions
6. **Monitor usage** - Check API logs for suspicious activity

### Environment Variables

Required for this project:

- `BOOND_API_TOKEN` - BoondManager API authentication token

Optional:

- `BOOND_API_URL` - Custom API base URL

**Setup:**

```bash
cp .env.example .env
# Edit .env and add your credentials
```

### Disabling the Hook (Not Recommended)

If you absolutely must bypass the secrets detector:

```bash
git commit --no-verify
```

⚠️ **WARNING**: Only use this if you're 100% certain the commit contains no secrets. The hook exists to protect you and the project.

### Configuration

The secrets detector is configured in `scripts/detect-secrets.js`:

- **SECRET_PATTERNS**: Regex patterns for different secret types
- **WHITELISTED_EXTENSIONS**: File types to skip (.lock, .log, images, etc.)
- **IGNORE_PATTERNS**: Files/directories to always ignore (node_modules, build, etc.)

To modify patterns or ignore files, edit `scripts/detect-secrets.js` and test locally:

```bash
# Test the detector on your current staged changes
node scripts/detect-secrets.js
```

### Scanning History

To scan your Git history for accidentally committed secrets:

```bash
# Using git-secrets (if installed)
git secrets --scan

# Using detect-secrets (Python)
pip install detect-secrets
detect-secrets scan
```

### Related Files

- `.husky/pre-commit` - Pre-commit hook (runs all checks)
- `scripts/detect-secrets.js` - Main secrets detection script
- `.env.example` - Template for environment variables
- `.gitignore` - Includes .env files

### More Information

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secrets Management](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-encrypted-secrets-for-your-repository-and-organization-for-github-codespaces)
- [NIST Guidelines on Secrets](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf)

### Questions?

See the main README.md or open an issue on GitHub.
