if ! command -v ts-standard &> /dev/null
then
  echo "standardts not found, installing..."
  npm i ts-standard eslint@latest @typescript-eslint/parser@latest @typescript-eslint/eslint-plugin@latest --save -g
fi

ts-standard --fix ./project_files/*