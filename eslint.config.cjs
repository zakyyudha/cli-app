module.exports = [
  {
    ignores: ['dist/'],
  },
  {
    ...require('eslint-config-love'),
    rules: {
      ...require('eslint-config-love').rules,
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/member-delimiter-style': 1,
      '@typescript-eslint/semi': 1,
    },
    files: ['src/**/*.ts'],
  },
  require('eslint-config-prettier'),
];
