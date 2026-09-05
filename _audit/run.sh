#!/bin/zsh
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars=false --virtual-time-budget=12000 --window-size=1700,1300 --dump-dom "http://localhost:4620/_audit/h.html?p=$1&w=$2&h=$3" 2>/dev/null
