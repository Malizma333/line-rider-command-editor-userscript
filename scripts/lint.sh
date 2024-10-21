if ! command -v standard &> /dev/null
then
  echo "standardjs not found, installing..."
  npm install standard -g
fi

standard --fix ./project_files/ command-editor.js