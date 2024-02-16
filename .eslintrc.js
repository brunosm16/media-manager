const jsRules = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:perfectionist/recommended-natural',
    'plugin:prettier/recommended',
  ],
  plugins: ['unused-imports'],
  rules: {
    'class-methods-use-this': 'off',
    'import/extensions': 'off',
    'import/order': 'off',
    'import/prefer-default-export': 'off',
    'no-param-reassign': [
      'error',
      {
        ignorePropertyModificationsFor: ['_opts'],
        props: true,
      },
    ],
    'no-underscore-dangle': 'off',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
      },
    ],
  },
};

module.exports = {
  env: {
    jest: true,
    node: true,
  },
  overrides: [
    {
      ...jsRules,
      files: ['*.js'],
    },
    {
      extends: [
        ...jsRules.extends,
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
      },
      plugins: [...jsRules.plugins],
      rules: {
        ...jsRules.rules,
        '@typescript-eslint/consistent-type-imports': [
          'warn',
          {
            disallowTypeAnnotations: false,
          },
        ],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            filter: {
              match: false,
              regex: '^npm_',
            },
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
            selector: 'variableLike',
          },
          {
            format: ['PascalCase'],
            leadingUnderscore: 'allow',
            prefix: ['is', 'has'],
            selector: 'variable',
            types: ['boolean'],
          },
          { format: ['PascalCase'], selector: 'typeLike' },
          {
            custom: {
              match: false,
              regex: '^I[A-Z]',
            },
            format: ['PascalCase'],
            selector: 'interface',
          },
          { format: ['UPPER_CASE'], selector: 'enumMember' },
        ],
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      extends: ['plugin:jsonc/recommended-with-jsonc'],
      files: ['*.json', '*.json5', '*.jsonc'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/sort-array-values': [
          'warn',
          {
            order: { type: 'asc' },
            pathPattern: '.',
          },
        ],
        'jsonc/sort-keys': [
          'warn',
          {
            order: { type: 'asc' },
            pathPattern: '.',
          },
        ],
      },
    },
    {
      extends: ['plugin:yml/standard'],
      files: ['*.yaml', '*.yml'],
      parser: 'yaml-eslint-parser',
      parserOptions: {
        defaultYAMLVersion: '1.2',
      },
      rules: {
        'yml/quotes': [
          'error',
          {
            prefer: 'single',
          },
        ],
      },
    },
    {
      extends: ['plugin:markdown/recommended'],
      files: ['*.md'],
      processor: 'markdown/markdown',
    },
    {
      files: ['**/*.md/*.js'],
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
  root: true,
};
