import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import nodePlugin from 'eslint-plugin-n';
import { defineConfig } from 'eslint/config';

export default defineConfig(
    eslint.configs.recommended,
    nodePlugin.configs['flat/recommended-script'],
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    {
        ignores: ['**/node_modules/*', '**/*.mjs', '**/*.js'],
    },
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                warnOnUnsupportedTypeScriptVersion: false,
            },
        },
    },
    {
        plugins: {
            '@stylistic': stylistic,
        },
    },
    {
        files: ['**/*.ts', '**/*.js'],
    },
    {
        rules: {
            '@typescript-eslint/explicit-member-accessibility': 'warn',
            '@typescript-eslint/no-misused-promises': 0,
            '@typescript-eslint/no-floating-promises': 0,
            '@typescript-eslint/no-confusing-void-expression': 0,
            '@typescript-eslint/no-unnecessary-condition': 0,
            '@typescript-eslint/unified-signatures': 'off',
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                { allowNumber: true },
            ],
            '@typescript-eslint/no-empty-function': [
                'error', { allow: ['private-constructors']                },
            ],
            '@typescript-eslint/restrict-plus-operands': [
                'warn',
                { allowNumberAndString: true },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-unsafe-enum-comparison': 0,
            '@typescript-eslint/no-unnecessary-type-parameters': 0,
            '@stylistic/no-extra-semi': 'warn',
            // Keep ESLint max-len as a warning
            'max-len': [
                'warn',
                {
                    code: 80,
                },
            ],
            '@stylistic/semi': ['warn', 'always'],
            '@stylistic/member-delimiter-style': [
                'warn',
                {
                    multiline: {
                        delimiter: 'comma',
                        requireLast: true,
                    },
                    singleline: {
                        delimiter: 'comma',
                        requireLast: true,
                    },
                    overrides: {
                        interface: {
                            singleline: {
                                delimiter: 'semi',
                                requireLast: true,
                            },
                            multiline: {
                                delimiter: 'semi',
                                requireLast: true,
                            },
                        },
                    },
                },
            ],
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-non-null-assertion': 0,
            '@typescript-eslint/no-unused-expressions': 'warn',
            '@typescript-eslint/unbound-method': 'off',
            'comma-dangle': ['warn', 'always-multiline'],
            'no-trailing-spaces': ['error', { 'ignoreComments': true }],
            'no-console': 1,
            'no-extra-boolean-cast': 0,
            indent: ['warn', 4],
            quotes: ['warn', 'single'],
            'n/no-process-env': 0,
            'n/no-missing-import': 0,
            'n/no-unpublished-import': 0,
            'prefer-const': 'warn',
        },
    },
);