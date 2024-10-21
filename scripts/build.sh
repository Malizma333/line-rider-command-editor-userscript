#!/bin/bash

USER_SCRIPT_FILE="line-rider-command-editor.user.js"
BUILD_FILE="command-editor.min.js"
DEVELOP=false
REPOSITORY="github.com/Malizma333/line-rider-command-editor-userscript/raw/master"
DIRECTORY=$(dirname "$(realpath $0)")

case $1 in
  -d)
    DEVELOP=true
  ;;
esac

touch "$USER_SCRIPT_FILE"
> "$USER_SCRIPT_FILE"

if $DEVELOP; then
  echo "window.CMD_EDITOR_DEBUG=$DEVELOP;
// ==UserScript==
// @name         Command Editor Develop
// @author       Malizma
// @description  Command editor development userscript
// @namespace    https://www.linerider.com/
// @match        https://www.linerider.com/*
// @version      0.0.0
// @grant        none" >> "$USER_SCRIPT_FILE"

  for i in project_files/*.js; do
    echo "// @require      file://C:${DIRECTORY:2}/$i" >> "$USER_SCRIPT_FILE"
  done

  echo "// @require      file://C:${DIRECTORY:2}/command-editor.js" >> "$USER_SCRIPT_FILE"
  echo "// ==/UserScript==" >> "$USER_SCRIPT_FILE"
else

  touch "$BUILD_FILE"
  > "$BUILD_FILE"

  echo "window.CMD_EDITOR_DEBUG=$DEVELOP;" >> "$BUILD_FILE"

  for i in project_files/*.js; do
    cat $i >> "$BUILD_FILE"
  done

  cat ./command-editor.js >> "$BUILD_FILE"

  if ! command -v uglifyjs &> /dev/null
  then
    echo "uglifyjs not found, installing..."
    npm install uglify-js -g
  fi

  MINI=$(uglifyjs -c -m -- "$BUILD_FILE")

  echo "$MINI" > "$BUILD_FILE"

  echo "// ==UserScript==
// @name         Command Editor
// @author       Malizma
// @description  Adds UI to API commands in linerider.com
// @namespace    https://www.linerider.com/
// @version      2.0.0
// @icon         https://www.linerider.com/favicon.ico
// @match        https://www.linerider.com/*
// @match        https://*.official-linerider.com/*
// @match        http://localhost:*/*
// @match        https://*.surge.sh/*
// @grant        none
// @require      https://$REPOSITORY/command-editor.min.js
// ==/UserScript==" >> "$USER_SCRIPT_FILE"
fi