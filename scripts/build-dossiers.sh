#!/usr/bin/env bash
# Build the four journey dossiers (PDF) from the live journey-*.html pages.
# Reproducible, no npm deps — uses system Chrome/Chromium in headless print mode.
# Override the browser with:  CHROME_BIN=/path/to/chrome scripts/build-dossiers.sh
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$DIR/build-dossiers.js"
