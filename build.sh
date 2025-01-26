#!/bin/bash

build_file="command-editor.min.js"
touch "${build_file}"
> "$build_file"

tsc -p tsconfig.json

for filename in ./src/*.js; do
  cat "${filename}" >> "${build_file}"
done

cat ./init.js >> "${build_file}"

mini=$(uglifyjs -c -m -- "${build_file}")
echo "${mini}" > "${build_file}"
