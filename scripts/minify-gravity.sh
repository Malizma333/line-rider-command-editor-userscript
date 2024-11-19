MIN_FILE="gravity-convert.min.js"
touch "$MIN_FILE"
> "$MIN_FILE"

MINI=$(uglifyjs -c -m -- "gravity-conversion-script.js")

# HACK: Replace double quotes with single quotes caused by uglification
echo "${MINI/"\"{0}\""/"\\'{0}\\'"}" > "$MIN_FILE"