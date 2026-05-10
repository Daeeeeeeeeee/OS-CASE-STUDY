#!/bin/bash
# CPU Scheduling Simulator — Launcher (macOS / Linux)

echo "============================================="
echo "  CPU Scheduling Simulator"
echo "  OS Case Study | Process Management"
echo "============================================="
echo ""
echo " Opening cpu_scheduling.html in your browser..."
echo ""

# Get the directory where this script lives
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$DIR/cpu_scheduling.html"

if [ ! -f "$FILE" ]; then
    echo " [ERROR] cpu_scheduling.html not found in: $DIR"
    exit 1
fi

# Detect OS and open accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$FILE"                          # macOS
elif command -v xdg-open &> /dev/null; then
    xdg-open "$FILE"                      # Linux (most distros)
elif command -v gnome-open &> /dev/null; then
    gnome-open "$FILE"                    # older GNOME
else
    echo " [ERROR] Cannot detect a browser opener."
    echo " Please open this file manually: $FILE"
    exit 1
fi

echo " Done! The simulator should now be running in your browser."
