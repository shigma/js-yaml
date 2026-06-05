import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { loadAll } from 'js-yaml'

describe('tags', () => {
  it('null', () => {
    const src = `
---
---
empty:
canonical: ~
english: null
~: null key
---
sparse:
  - ~
  - 2nd entry
  -
  - 4th entry
  - Null
`

    const expected = [
      null,
      {
        empty: null,
        canonical: null,
        english: null,
        null: 'null key'
      },
      {
        sparse: [
          null,
          '2nd entry',
          null,
          '4th entry',
          null
        ]
      }
    ]

    assert.deepStrictEqual(loadAll(src), expected)
  })
})
