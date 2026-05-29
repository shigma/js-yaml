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
      '@stylistic/key-spacing': 'off',
      'no-useless-escape': 'off',
      'object-shorthand': 'off',
    }
  }
]
