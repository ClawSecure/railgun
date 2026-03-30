#!/usr/bin/env bash
set -euo pipefail

# Railgun installer
# Usage: curl -fsSL https://raw.githubusercontent.com/ClawSecure/railgun/main/scripts/install.sh | bash

REPO="https://github.com/ClawSecure/railgun.git"
DEST="${HOME}/.openclaw/workspace/railgun"

echo "Installing Railgun..."

# Clone or pull
if [ -d "$DEST/.git" ]; then
  echo "Updating existing install..."
  git -C "$DEST" pull --ff-only origin main
else
  echo "Cloning repository..."
  git clone "$REPO" "$DEST"
fi

cd "$DEST"

# Build
echo "Installing dependencies..."
npm install --no-fund --no-audit

echo "Building..."
npm run build

# Link CLI globally
echo "Linking CLI..."
npm link

# Install workflows — use linked CLI or fall back to direct node
RAILGUN="$(command -v clawsecure-railgun 2>/dev/null || echo "")"
if [ -z "$RAILGUN" ]; then
  RAILGUN="node $DEST/dist/cli/cli.js"
fi

echo "Installing workflows..."
$RAILGUN install

echo ""
echo "Railgun installed! Run 'clawsecure-railgun workflow list' to see available workflows."
