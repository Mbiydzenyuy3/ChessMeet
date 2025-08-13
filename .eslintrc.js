module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    '@react-native-community',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': ['error'],
    '@typescript-eslint/no-unused-vars': ['warn'],
  },
}
