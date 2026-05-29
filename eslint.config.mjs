import neostandard from 'neostandard'

export default [
  ...neostandard({
    env: ['browser', 'node'],
    ignores: [
      'coverage/**',
      'demo/**',
      'dist/**'
    ]
  }),

  {
    rules: {
      camelcase: 'off',
      '@stylistic/semi': 'off',
      'no-var': 'off',
      '@stylistic/no-multi-spaces': 'off',
      '@stylistic/no-multiple-empty-lines': 'off',
      '@stylistic/array-bracket-spacing': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@stylistic/padded-blocks': 'off',
      'one-var': 'off',
      '@stylistic/key-spacing': 'off',
      'prefer-const': 'off',
      '@stylistic/spaced-comment': 'off',
      '@stylistic/multiline-ternary': 'off',
      'no-useless-escape': 'off',
      '@stylistic/no-mixed-operators': 'off',
      yoda: 'off',
      'object-shorthand': 'off',
      'no-control-regex': 'off',
      'no-unmodified-loop-condition': 'off',
      'no-useless-return': 'off'
    }
  }
]
