import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'js-yaml'

describe('tags/float', () => {
  it('common', () => {
    const src = `
- 6.8523015e+5  # canonical
- 685.23015e+03 # exponentical
- 685230.15     # fixed
- -.inf
- .NaN

- . # single dot is not a float
- -1.0
- +1.0
- +.inf
- .nan
`
    const expected = [
      685230.15, 685230.15, 685230.15, Number.NEGATIVE_INFINITY, NaN,

      '.', -1.0, 1.0, Number.POSITIVE_INFINITY, NaN
    ]
    assert.deepStrictEqual(load(src), expected)

    const specials = `
normalZero: 0.0
negativeZero: -0.0
`
    const actual = load(specials)
    assert.strictEqual(Object.is(actual.normalZero, 0.0), true)
    assert.strictEqual(Object.is(actual.negativeZero, -0.0), true)
  })
})
