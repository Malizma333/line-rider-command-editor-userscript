if ! command -v ts-standard &> /dev/null
then
  echo "standardts not found, installing..."
  npm install ts-standard -g
fi

ts-standard --fix ./project_files/*