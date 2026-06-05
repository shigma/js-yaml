import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'js-yaml'

describe('tags', () => {
  it('int', () => {
    const src = `
- 685230     # canonical
- +685230    # decimal
- 0o2472256  # octal
- 0x0A74AE   # hexadecimal
- 0b10100111010010101110  # binary
`
    const expected = [
      685230,
      685230,
      685230,
      685230,
      685230
    ]

    assert.deepStrictEqual(load(src), expected)
  })
})
