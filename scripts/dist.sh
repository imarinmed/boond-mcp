#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DIST_DIR="${PROJECT_DIR}/dist"
TIMESTAMP=$(date +%Y-%m-%d-%H%M%S)
ARCHIVE_NAME="boond-mcp-${TIMESTAMP}.tar.gz"
ARCHIVE_PATH="${DIST_DIR}/${ARCHIVE_NAME}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "BoondManager MCP Server - Distribution Package Creator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f "${PROJECT_DIR}/build/index.js" ]; then
    echo "⚠️  Build directory not found. Building project..."
    cd "$PROJECT_DIR"
    bun run build
    echo "✅ Build complete"
fi

echo "📦 Creating distribution package..."
echo "   Project dir: $PROJECT_DIR"
echo "   Output dir:  $DIST_DIR"
echo ""

mkdir -p "$DIST_DIR"

echo "📋 Collecting files..."
tar --exclude='.git' \
    --exclude='node_modules' \
    --exclude='.env' \
    --exclude='.env.local' \
    --exclude='dist' \
    --exclude='.sisyphus' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='.vscode' \
    --exclude='.idea' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    -czf "$ARCHIVE_PATH" \
    -C "$(dirname "$PROJECT_DIR")" \
    "$(basename "$PROJECT_DIR")" \
    2>/dev/null

SIZE=$(du -h "$ARCHIVE_PATH" | cut -f1)
echo "✅ Distribution package created"
echo ""
echo "📊 Package Details:"
echo "   File: $ARCHIVE_NAME"
echo "   Size: $SIZE"
echo "   Path: $ARCHIVE_PATH"
echo ""

CHECKSUM=$(shasum -a 256 "$ARCHIVE_PATH" | awk '{print $1}')
echo "🔐 Checksum (SHA-256):"
echo "   $CHECKSUM"
echo ""

echo "📝 Package Contents:"
tar -tzf "$ARCHIVE_PATH" | head -20
echo "   ... (and more files)"
echo ""

echo "📥 Distribution Instructions:"
echo ""
echo "1. Transfer the archive to your team:"
echo "   scp $ARCHIVE_PATH user@server:/path/to/destination/"
echo "   OR upload to cloud storage (Dropbox, OneDrive, etc.)"
echo ""
echo "2. Recipient should extract:"
echo "   tar xzf $ARCHIVE_NAME"
echo "   cd boond-mcp"
echo ""
echo "3. Recipient should follow SETUP.md:"
echo "   cat SETUP.md"
echo ""
echo "4. For team-wide updates, use Git instead:"
echo "   See DISTRIBUTION.md for recommended Git workflow"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Distribution package ready!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
