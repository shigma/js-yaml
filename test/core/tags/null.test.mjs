import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, JSON_SCHEMA, load, loadAll, dump } from 'js-yaml'

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

    assert.deepStrictEqual(loadAll(src, { schema: CORE_SCHEMA }), expected)
    assert.deepStrictEqual(load(dump(expected[1], { schema: CORE_SCHEMA }), { schema: CORE_SCHEMA }), expected[1])
  })

  it('null/JSON schema', () => {
    const src = `
empty:
canonical: ~
english: null
variants: [ Null, NULL ]
`

    const expected = {
      empty: '',
      canonical: '~',
      english: null,
      variants: ['Null', 'NULL']
    }

    assert.deepStrictEqual(load(src, { schema: JSON_SCHEMA }), expected)
    assert.deepStrictEqual(load(dump(expected, { schema: JSON_SCHEMA }), { schema: JSON_SCHEMA }), expected)

    // explicit empty !!null resolves to null
    assert.strictEqual(load('!!null', { schema: JSON_SCHEMA }), null)
  })
})
