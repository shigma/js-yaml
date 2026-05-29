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
      'no-var': 'off',
      '@stylistic/key-spacing': 'off',
      'prefer-const': 'off',
      'no-useless-escape': 'off',
      'object-shorthand': 'off',
    }
  }
]
