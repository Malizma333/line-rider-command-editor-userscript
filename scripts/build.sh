#!/bin/bash

REPOSITORY="https://github.com/Malizma333/line-rider-command-editor-userscript/raw/master"
DIRPATH=$(dirname $(dirname $(realpath $0)))
DIRECTORY="file://C:${DIRPATH:2}"

USER_SCRIPT_FILE="line-rider-command-editor.user.js"
touch "$USER_SCRIPT_FILE"
> "$USER_SCRIPT_FILE"

BUILD_FILE="command-editor.min.js"
touch "$BUILD_FILE"
> "$BUILD_FILE"

DEVELOP=false

case $1 in
  -d)
    DEVELOP=true
  ;;
esac

tsc -p tsconfig.json
MINI=$(uglifyjs -c -m -- "$BUILD_FILE")
echo "$MINI" > "$BUILD_FILE"

if $DEVELOP; then
  LOCATION="$DIRECTORY"
  NAME="Command Editor Debug"
  VERSION="0.0.0"
else
  LOCATION="$REPOSITORY"
  NAME="Command Editor"
  VERSION="$(git rev-list --count --all).0"
fi

echo "window.CMD_EDITOR_DEBUG=$DEVELOP
// ==UserScript==
// @name         $NAME
// @author       Malizma
// @description  Adds UI to API commands in linerider.com
// @namespace    https://www.linerider.com/
// @version      $VERSION
// @icon         https://www.linerider.com/favicon.ico
// @match        https://www.linerider.com/*
// @match        https://*.official-linerider.com/*
// @match        http://localhost:*/*
// @match        https://*.surge.sh/*
// @grant        none
// @require      $LOCATION/command-editor.min.js
// @downloadURL  https://github.com/Malizma333/linerider-userscript-mods/raw/master/mods/line-rider-bookmark-mod.user.js
// @updateURL    https://github.com/Malizma333/linerider-userscript-mods/raw/master/mods/line-rider-bookmark-mod.user.js
// @homepageURL  https://github.com/Malizma333/linerider-userscript-mods
// @supportURL   https://github.com/Malizma333/linerider-userscript-mods/issues
// ==/UserScript==" >> "$USER_SCRIPT_FILE"