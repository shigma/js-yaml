import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'js-yaml'

describe('tags', () => {
  it('float', () => {
    const src = `
- 6.8523015e+5  # canonical
- 685.23015e+03 # exponentical
- 685230.15     # fixed
- -.inf
- .NaN
`
    const expected = [
      685230.15,
      685230.15,
      685230.15,
      Number.NEGATIVE_INFINITY,
      NaN
    ]

    assert.deepStrictEqual(load(src), expected)
  })
})
