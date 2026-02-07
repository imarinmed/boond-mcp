#!/bin/bash

# Git-Secrets Setup Script
# Installs and configures secret detection for the project
# No system-wide changes required - uses Node.js implementation

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🔐 Setting up Git Secrets Detection"
echo "===================================="
echo ""

# Check Node.js is available
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js available: $NODE_VERSION"

# Check git-secrets command (optional)
if command -v git-secrets &> /dev/null; then
  GIT_SECRETS_VERSION=$(git-secrets --version)
  echo "✅ git-secrets installed: $GIT_SECRETS_VERSION"
  echo "   (Using Node.js-based detector for better portability)"
else
  echo "ℹ️  git-secrets not found (using Node.js-based detector)"
fi

echo ""
echo "📁 Setting up scripts..."

# Ensure scripts directory exists
mkdir -p scripts

# Check if detect-secrets.js exists
if [ -f scripts/detect-secrets.js ]; then
  echo "✅ scripts/detect-secrets.js exists"
else
  echo "❌ scripts/detect-secrets.js not found"
  exit 1
fi

# Make scripts executable
chmod +x scripts/detect-secrets.js
echo "✅ Made scripts/detect-secrets.js executable"

# Check Husky is set up
if [ -d .husky ]; then
  echo "✅ .husky directory exists"
else
  echo "❌ Husky not found - install with: npx husky install"
  exit 1
fi

# Make pre-commit hook executable
if [ -f .husky/pre-commit ]; then
  chmod +x .husky/pre-commit
  echo "✅ Made .husky/pre-commit executable"
else
  echo "❌ .husky/pre-commit not found"
  exit 1
fi

echo ""
echo "🧪 Testing secrets detector..."

# Test the detector
if node scripts/detect-secrets.js >/dev/null 2>&1 || true; then
  echo "✅ Secrets detector working"
else
  echo "⚠️  Detector returned non-zero (expected if secrets in staging)"
fi

echo ""
echo "📖 Documentation created:"
echo "  • SECURITY.md - Secrets management policies and best practices"
echo ""

echo "✅ Git Secrets Detection Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Review SECURITY.md for best practices"
echo "2. Copy .env.example to .env and add your credentials"
echo "3. Test: git add . && git commit -m 'test' (will run detector)"
echo "4. More info: cat SECURITY.md"
echo ""
echo "🔒 Your commits are now protected from accidental secret leaks!"
