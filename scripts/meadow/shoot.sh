#!/bin/zsh
# usage: shoot.sh URL OUT WIDTH HEIGHT [transparent]
# Headless Chrome capture. Chrome on macOS won't exit after --screenshot,
# so wait for the file, then kill this run's profile.
SP=/private/tmp/claude-501/-Users-mengxiwang-elara-reset-journey-244d198d/308a96d0-2990-439d-bc20-d07d472a3853/scratchpad
rm -f "$2"; PROF="$SP/chrome-prof-$RANDOM$RANDOM"
BG=(); [ "$5" = "transparent" ] && BG=(--default-background-color=00000000)
("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --user-data-dir="$PROF" --window-size="$3,$4" --virtual-time-budget=15000 \
  $BG --screenshot="$2" "$1" >/dev/null 2>&1 &)
for i in $(seq 1 90); do [ -s "$2" ] && break; sleep 1; done
sleep 1; pkill -f "$PROF"; rm -rf "$PROF"
[ -s "$2" ] && echo "ok $2" || echo "FAILED $2"
