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
      '@stylistic/key-spacing': 'off',
      'object-shorthand': 'off',
    }
  }
]
