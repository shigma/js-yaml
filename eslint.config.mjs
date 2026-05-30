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
      'object-shorthand': 'off',
    }
  }
]
