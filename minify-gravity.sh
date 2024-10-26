MIN_FILE="g.min.js"
touch "$MIN_FILE"
> "$MIN_FILE"

if ! command -v uglifyjs &> /dev/null
then
  echo "uglifyjs not found, installing..."
  npm install uglify-js -g
fi

MINI=$(uglifyjs -c -m -- "gravity-conversion-script.js")

# HACK: Replace double quotes with single quotes caused by uglification
echo "${MINI/"\"{0}\""/"'{0}'"}" > "$MIN_FILE"