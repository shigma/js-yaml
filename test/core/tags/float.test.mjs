import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, JSON_SCHEMA, YAML11_SCHEMA, load } from 'js-yaml'

const variants = [
  ['JSON', JSON_SCHEMA],
  ['Core', CORE_SCHEMA],
  ['YAML 1.1', YAML11_SCHEMA]
]

describe('tags/float', () => {
  describe('tags/float/common', () => {
    const src = `
- 6.8523015e+5  # canonical
- 685.23015e+03 # exponentical
- 685230.15     # fixed

- . # single dot is not a float
- -1.0
- 0.
- -0.0
`
    const expected = [
      685230.15, 685230.15, 685230.15,

      '.', -1.0, 0.0, -0.0
    ]

    for (const [name, schema] of variants) {
      it(name, () => {
        assert.deepStrictEqual(load(src, { schema }), expected)
      })
    }
  })

  it('tags/float/JSON schema', () => {
    const src = `
- -2E+05 # exponent with sign
- 12e03  # exponent without sign

- +12.3 # plus sign is not JSON schema float
- .5    # leading dot is not JSON schema float
- .inf  # infinity is not JSON schema float
- .nan  # NaN is not JSON schema float
- 01.0  # leading zero is not JSON schema float

- !!float .inf  # explicit infinity
- !!float -.Inf # explicit negative infinity
- !!float .NaN  # explicit NaN
- !!float +12.3 # explicit plus sign
- !!float .5    # explicit leading dot
`
    const expected = [
      -200000, 12000,

      '+12.3', '.5', '.inf', '.nan', '01.0',

      Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN, 12.3, 0.5
    ]
    assert.deepStrictEqual(load(src, { schema: JSON_SCHEMA }), expected)
  })

  it('tags/float/Core schema', () => {
    const src = `
- +12e03 # plus sign is allowed
- .5     # leading dot is allowed
- .inf   # lowercase infinity
- -.Inf  # camelcase negative infinity
- +.INF  # uppercase positive infinity
- .NAN   # uppercase NaN

- 1_000.0 # underscores are not Core schema float
`
    const expected = [
      12000, 0.5, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, NaN,

      '1_000.0'
    ]
    assert.deepStrictEqual(load(src, { schema: CORE_SCHEMA }), expected)
  })

  it('tags/float/YAML 1.1 schema', () => {
    const src = `
- 685.230_15e+03 # underscores in fraction
- 685_230.15     # underscores in integer part
- 190:20:30.15   # sexagesimal
- -.inf          # negative infinity
- .NaN           # NaN

- 685.23015e03 # exponent sign is required in YAML 1.1
- 190:99:30.15 # sexagesimal minutes/seconds are base 60
`
    const expected = [
      685230.15, 685230.15, 685230.15, Number.NEGATIVE_INFINITY, NaN,

      '685.23015e03', '190:99:30.15'
    ]
    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })
})
