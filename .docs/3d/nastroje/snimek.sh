#!/bin/bash
# Vyfotí 3D náhled headless Chromem. Použití:
#   podklady-3d/nastroje/snimek.sh <url> <soubor.png> [sirka] [vyska]
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="$1"; OUT="$2"; W="${3:-1400}"; H="${4:-950}"
"$CHROME" --headless=new --disable-gpu=false --use-gl=angle --use-angle=metal \
  --enable-unsafe-swiftshader --hide-scrollbars --force-device-scale-factor=1 \
  --virtual-time-budget=6000 --window-size="$W,$H" \
  --screenshot="$OUT" "$URL" >/dev/null 2>&1
ls -la "$OUT"
