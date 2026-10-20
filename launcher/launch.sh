#!/usr/bin/env bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."
echo "========================================================"
echo "   Launching ANY3D Slicer (Anycubic Kobra 2 Calibrated) "
echo "========================================================"
node launcher/launcher.js
