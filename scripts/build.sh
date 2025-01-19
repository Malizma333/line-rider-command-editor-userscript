#!/bin/bash

repo="https://github.com/Malizma333/line-rider-command-editor-userscript/raw/master"
dirpath=$(dirname $(dirname $(realpath $0)))
directory="file://C:${dirpath:2}"

userscript_file="line-rider-command-editor.user.js"
touch "${userscript_file}"
> "${userscript_file}"

build_file="command-editor.min.js"
touch "${build_file}"
> "$build_file"

dev=false

case $1 in
  -d)
    dev=true
  ;;
esac

tsc -p tsconfig.json

for filename in ./project_files/*.js; do
  cat "${filename}" >> "${build_file}"
done

mini=$(uglifyjs -c -m -- "${build_file}")
echo "${mini}" > "${build_file}"

if $dev; then
  path=$directory
  name="Command Editor Debug"
  version="0.0.0"
else
  path=$repo
  name="Command Editor"
  version="$(git rev-list --count --all).0"
fi

echo "window.CMD_EDITOR_DEBUG=${dev}
// ==UserScript==
// @name         ${name}
// @author       Malizma
// @description  Adds UI to API commands in linerider.com
// @namespace    https://www.linerider.com/
// @version      ${version}
// @icon         https://www.linerider.com/favicon.ico
// @match        https://www.linerider.com/*
// @match        https://*.official-linerider.com/*
// @match        http://localhost:*/*
// @match        https://*.surge.sh/*
// @grant        none
// @require      ${path}/command-editor.min.js
// @downloadURL  https://github.com/Malizma333/linerider-userscript-mods/raw/master/mods/line-rider-bookmark-mod.user.js
// @updateURL    https://github.com/Malizma333/linerider-userscript-mods/raw/master/mods/line-rider-bookmark-mod.user.js
// @homepageURL  https://github.com/Malizma333/linerider-userscript-mods
// @supportURL   https://github.com/Malizma333/linerider-userscript-mods/issues
// ==/UserScript==" >> "${userscript_file}"