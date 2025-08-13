const globals = require("globals");
const tseslint = require("typescript-eslint");
const eslintReact = require("eslint-plugin-react");
const eslintReactNative = require("eslint-plugin-react-native");

module.exports = [
  {
    ignores: ["node_modules/"],
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "react": eslintReact,
      "react-native": eslintReactNative,
    },
    rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-native/no-unused-styles': 'warn',
      'react-native/no-inline-styles': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'no-console': 'off',
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        "__DEV__": "readonly",
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
];
