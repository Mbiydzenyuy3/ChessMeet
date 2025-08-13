// eslint.config.mjs
import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactNativePlugin from 'eslint-plugin-react-native';
import tseslint from 'typescript-eslint';

export default [
  // Base JavaScript + TypeScript support
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        __DEV__: true, // React Native global
      },
    },
    plugins: {
      react: reactPlugin,
      'react-native': reactNativePlugin,
    },
    rules: {
      // JavaScript recommended rules
      ...js.configs.recommended.rules,

      // React recommended rules (guard against undefined)
      ...(reactPlugin.configs?.recommended?.rules ?? {}),

      // React Native recommended rules (manually add)
      'react-native/no-unused-styles': 'warn',
      'react-native/split-platform-components': 'warn',
      'react-native/no-inline-styles': 'warn',
      'react-native/no-color-literals': 'warn',
      'react-native/no-raw-text': 'warn',

      // Project-specific overrides
      'react/react-in-jsx-scope': 'off', // Not needed in RN
    },
    settings: {
      react: {
        version: 'detect', // Auto-detect installed React version
      },
    },
  },
];
