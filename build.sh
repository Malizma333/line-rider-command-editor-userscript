#!/bin/bash

BUILD_FILE="line-rider-command-editor.user.js"
DEVELOP=false
REPOSITORY="github.com/Malizma333/line-rider-command-editor-userscript/raw/master"
DIRECTORY=$(dirname "$(realpath $0)")

case $1 in
  -d)
    DEVELOP=true
  ;;
esac

touch "$BUILD_FILE"
echo "window.CMD_EDITOR_DEBUG=$DEVELOP;" > "$BUILD_FILE"

if $DEVELOP; then
  echo "// ==UserScript==" >> "$BUILD_FILE"
  echo "// @name         Command Editor Develop" >> "$BUILD_FILE"
  echo "// @author       Malizma" >> "$BUILD_FILE"
  echo "// @description  Command editor development userscript" >> "$BUILD_FILE"
  echo "// @namespace    https://www.linerider.com/" >> "$BUILD_FILE"
  echo "// @match        https://www.linerider.com/*" >> "$BUILD_FILE"
  echo "// @version      0.0.0" >> "$BUILD_FILE"
  echo "// @grant        none" >> "$BUILD_FILE"

  for i in project_files/*.js; do
    echo "// @require      file://C:${DIRECTORY:2}/$i" >> "$BUILD_FILE"
  done

  echo "// ==/UserScript==" >> "$BUILD_FILE"
else
  echo "// ==UserScript==" >> "$BUILD_FILE"
  echo "// @name         Command Editor" >> "$BUILD_FILE"
  echo "// @author       Malizma" >> "$BUILD_FILE"
  echo "// @description  Adds UI to API commands in linerider.com" >> "$BUILD_FILE"
  echo "// @namespace    https://www.linerider.com/" >> "$BUILD_FILE"
  echo "// @version      1.0.0" >> "$BUILD_FILE"
  echo "// @icon         https://www.linerider.com/favicon.ico" >> "$BUILD_FILE"
  echo "// @match        https://www.linerider.com/*" >> "$BUILD_FILE"
  echo "// @match        https://*.official-linerider.com/*" >> "$BUILD_FILE"
  echo "// @match        http://localhost:*/*" >> "$BUILD_FILE"
  echo "// @match        https://*.surge.sh/*" >> "$BUILD_FILE"
  echo "// @grant        none" >> "$BUILD_FILE"
  echo "// ==/UserScript==" >> "$BUILD_FILE"

  for i in project_files/*.js; do
    cat $i >> "$BUILD_FILE"
  done
fi