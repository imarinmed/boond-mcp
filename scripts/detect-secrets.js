#!/usr/bin/env node

/**
 * Git Secrets Detector
 *
 * Detects potential secrets (API keys, tokens, passwords) in staged changes
 * Integrates with Husky pre-commit hooks
 *
 * Exit codes:
 * 0 = No secrets found
 * 1 = Secrets detected (commit prevented)
 * 2 = Error running detector
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Secret patterns to detect
const SECRET_PATTERNS = [
  {
    name: 'API Keys - Generic',
    patterns: [
      /(?:api[_-]?key|apikey)\s*[:=]\s*['"]([\w\-]{20,})['"]/gi,
      /(?:api[_-]?key|apikey)\s*[:=]\s*([\w\-]{20,})/gi,
    ],
  },
  {
    name: 'BOOND API Token',
    patterns: [
      /BOOND_API_TOKEN\s*[:=]\s*['"]([\w\-]{20,})['"]/gi,
      /BOOND_API_TOKEN\s*[:=]\s*([\w\-]{20,})/gi,
      /boond[_-]?token\s*[:=]\s*['"]([\w\-]{20,})['"]/gi,
    ],
  },
  {
    name: 'AWS Keys',
    patterns: [/AKIA[0-9A-Z]{16}/g, /aws_secret_access_key\s*[:=]\s*['"]([\w/+=]{40})['"]/gi],
  },
  {
    name: 'GitHub PAT / Bearer Tokens',
    patterns: [
      /ghp_[A-Za-z0-9_]{36,255}/g,
      /ghs_[A-Za-z0-9_]{36,255}/g,
      /ghu_[A-Za-z0-9_]{36,255}/g,
      /github[_-]?token\s*[:=]\s*['"](gh[a-z]{1,3}_[A-Za-z0-9_]{36,255})['"]/gi,
    ],
  },
  {
    name: 'Private Keys',
    patterns: [/-----BEGIN (?:RSA|DSA|EC|OPENSSH|PGP) PRIVATE KEY/g, /-----BEGIN PRIVATE KEY/g],
  },
  {
    name: 'Database Passwords',
    patterns: [
      /password\s*[:=]\s*['"]([\w!@#$%^&*\-+=]{8,})['"]/gi,
      /passwd\s*[:=]\s*['"]([\w!@#$%^&*\-+=]{8,})['"]/gi,
      /db[_-]?password\s*[:=]\s*['"]([\w!@#$%^&*\-+=]{8,})['"]/gi,
    ],
  },
  {
    name: 'OAuth Tokens',
    patterns: [
      /access[_-]?token\s*[:=]\s*['"]([\w\-\.]{40,})['"]/gi,
      /refresh[_-]?token\s*[:=]\s*['"]([\w\-\.]{40,})['"]/gi,
    ],
  },
  {
    name: 'Slack Tokens',
    patterns: [/xox[baprs]-[0-9a-zA-Z\-]{10,161}/g],
  },
];

// Whitelisted files (shouldn't contain secrets)
const WHITELISTED_EXTENSIONS = ['.lock', '.log', '.png', '.jpg', '.jpeg', '.gif', '.pdf'];

// Files to always ignore
const IGNORE_PATTERNS = [
  /^\.git\//,
  /^node_modules\//,
  /^build\//,
  /^dist\//,
  /\.env\.example$/,
  /SECURITY\.md$/,
  /test/i,
  /\.test\./,
  /\.spec\./,
  /mock/i,
  /fixture/i,
];

function shouldIgnoreFile(filePath) {
  // Check extensions
  const ext = path.extname(filePath);
  if (WHITELISTED_EXTENSIONS.includes(ext)) return true;

  // Check patterns
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function getStagedFiles() {
  try {
    // Get list of staged files (added, modified, renamed)
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    process.exit(2);
  }
}

function getStagedFileContent(filePath) {
  try {
    // Get staged content (using git index)
    return execSync(`git show :${filePath}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (error) {
    // File might have been deleted, skip it
    return '';
  }
}

function detectSecrets(filePath, content) {
  const secrets = [];

  SECRET_PATTERNS.forEach(({ name, patterns }) => {
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern);

      // Reset regex if it has global flag
      if (pattern.flags.includes('g')) {
        while ((match = pattern.exec(content)) !== null) {
          secrets.push({
            category: name,
            match: match[0],
            position: match.index,
            line: content.substring(0, match.index).split('\n').length,
          });
        }
      } else {
        match = regex.exec(content);
        if (match) {
          secrets.push({
            category: name,
            match: match[0],
            position: match.index,
            line: content.substring(0, match.index).split('\n').length,
          });
        }
      }
    });
  });

  return secrets;
}

function main() {
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    // No staged files to check
    process.exit(0);
  }

  let secretsFound = false;
  const results = [];

  stagedFiles.forEach(filePath => {
    if (shouldIgnoreFile(filePath)) {
      return;
    }

    const content = getStagedFileContent(filePath);
    if (!content) {
      return;
    }

    const secrets = detectSecrets(filePath, content);

    if (secrets.length > 0) {
      secretsFound = true;
      results.push({
        file: filePath,
        secrets,
      });
    }
  });

  if (secretsFound) {
    console.error('\n❌ SECURITY ERROR: Potential secrets detected in staged changes!\n');
    console.error('The following files contain patterns matching known secret types:\n');

    results.forEach(({ file, secrets }) => {
      console.error(`📄 ${file}`);
      const uniqueCategories = [...new Set(secrets.map(s => s.category))];
      uniqueCategories.forEach(category => {
        const categorySecrets = secrets.filter(s => s.category === category);
        console.error(`  ├─ ${category}: ${categorySecrets.length} occurrence(s)`);
        categorySecrets.slice(0, 3).forEach(({ line, match }) => {
          const preview = match.substring(0, 40).replace(/\n/g, '\\n');
          console.error(`  │  └─ Line ${line}: ${preview}...`);
        });
        if (categorySecrets.length > 3) {
          console.error(`  │  └─ ... and ${categorySecrets.length - 3} more`);
        }
      });
      console.error('');
    });

    console.error('⚠️  ACTIONS TO TAKE:\n');
    console.error('1. Remove the secrets from your staged changes');
    console.error(
      '2. If this is a false positive, edit scripts/detect-secrets.js to whitelist the file'
    );
    console.error('3. Use: git reset HEAD <file> to unstage, then fix the file');
    console.error(
      '4. For accidental commits, see: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository\n'
    );

    process.exit(1);
  }

  process.exit(0);
}

main();
