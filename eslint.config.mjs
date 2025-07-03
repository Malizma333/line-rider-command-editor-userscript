import eslint from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";

const rules = {
  "no-cond-assign": "off",
  "no-unexpected-multiline": "error",
  "guard-for-in": "error",
  "no-caller": "error",
  "no-extend-native": "error",
  "no-extra-bind": "error",
  "no-invalid-this": "error",
  "no-multi-str": "warn",
  "no-new-wrappers": "error",
  "no-throw-literal": "error",
  "no-with": "error",
  "prefer-promise-reject-errors": "error",
  "no-new-object": "warn",
  "constructor-super": "error",
  "no-new-symbol": "error",
  "no-this-before-super": "error",
  "no-var": "warn",
  "prefer-const": ["warn", { "destructuring": "all" }],
  "prefer-rest-params": "warn",
  "prefer-spread": "warn",
  "@typescript-eslint/no-empty-object-type": [
    "error",
    { "allowInterfaces": "with-single-extends" },
  ],
};

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.recommended,
  jsdoc.configs["flat/recommended-typescript"],
  { ignores: ["command-editor.min.js", "**/*.config.*"] },
  {
    ignores: ["**/*.tsx"],
    languageOptions: { globals: globals.browser },
    rules: {
      ...rules,
      "jsdoc/require-description": [1, { contexts: ["any"] }],
      "jsdoc/require-jsdoc": [1, { require: { ClassDeclaration: true, MethodDefinition: true } }],
    },
  },
  {
    languageOptions: { globals: globals.browser },
    rules: rules,
  },
);
