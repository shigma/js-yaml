import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, CORE_SCHEMA, mergeTag } from 'js-yaml'

describe('tags', () => {
  it('merge', () => {
    const src = `
- &CENTER { x: 1, 'y': 2 }
- &LEFT { x: 0, 'y': 2 }
- &BIG { r: 10 }
- &SMALL { r: 1 }

- x: 1
  'y': 2
  r: 10
  label: center/big

- << : *CENTER
  r: 10
  label: center/big

- << : [ *CENTER, *BIG ]
  label: center/big

- << : [ *BIG, *LEFT, *SMALL ]
  x: 1
  label: center/big
`
    const expected = [
      { x: 1, y: 2 },
      { x: 0, y: 2 },
      { r: 10 },
      { r: 1 },
      { x: 1, y: 2, r: 10, label: 'center/big' },
      { x: 1, y: 2, r: 10, label: 'center/big' },
      { x: 1, y: 2, r: 10, label: 'center/big' },
      { x: 1, y: 2, r: 10, label: 'center/big' }
    ]

    assert.deepStrictEqual(load(src, { schema: CORE_SCHEMA.withTags(mergeTag) }), expected)
  })
})
