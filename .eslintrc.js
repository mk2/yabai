module.exports = {
  root: true,
  plugins: ['simple-import-sort'],
  ignorePatterns: ['node_modules/', 'packages/publish/', 'packages/@types'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    'simple-import-sort/sort': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['plugin:@typescript-eslint/recommended', 'prettier/@typescript-eslint'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            ignoreRestSiblings: true,
          },
        ],
        '@typescript-eslint/no-var-requires': 'warn',
        '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
        '@typescript-eslint/ban-ts-ignore': 'warn',
      },
    },
  ],
};
