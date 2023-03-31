module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
        'plugin:react/recommended',
        'standard'
    ],
    overrides: [
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    plugins: [
        'react'
    ],
    rules: {
        indent: ['error', 4],
        'no-undef': 0,
        'react/no-deprecated': 0,
        'no-unused-vars': 0
    }
}
