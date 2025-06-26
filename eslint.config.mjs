import eslint from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";
import tseslint from "typescript-eslint";

const rules = {
  "no-cond-assign": 0,
  "no-unexpected-multiline": 2,
  "guard-for-in": 2,
  "no-caller": 2,
  "no-extend-native": 2,
  "no-extra-bind": 2,
  "no-invalid-this": 2,
  "no-multi-str": 2,
  "no-new-wrappers": 2,
  "no-throw-literal": 2,
  "no-with": 2,
  "prefer-promise-reject-errors": 2,
  "no-new-object": 2,
  "constructor-super": 2,
  "no-new-symbol": 2,
  "no-this-before-super": 2,
  "no-var": 2,
  "prefer-const": [2, { destructuring: "all" }],
  "prefer-rest-params": 2,
  "prefer-spread": 2,
  "@typescript-eslint/no-empty-object-type": [2, { allowInterfaces: "with-single-extends" }],
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
