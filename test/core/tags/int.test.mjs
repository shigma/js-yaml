import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, JSON_SCHEMA, YAML11_SCHEMA, load, dump } from 'js-yaml'

const variants = [
  ['JSON', JSON_SCHEMA],
  ['Core', CORE_SCHEMA],
  ['YAML 1.1', YAML11_SCHEMA]
]

describe('tags/int', () => {
  describe('tags/int/common', () => {
    const huge = '1'.padEnd(400, '0')
    const src = `
- 685230  # canonical
- -685230 # negative decimal
- 0       # zero
- ${huge} # will overflow and fail round-trip
`
    const expected = [
      685230,
      -685230,
      0,
      huge
    ]

    for (const [name, schema] of variants) {
      it(`${name} common part`, () => {
        assert.deepStrictEqual(load(src, { schema }), expected)
      })

      it(`${name} round-trip`, () => {
        assert.deepStrictEqual(load(dump(expected, { schema }), { schema }), expected)
      })

      it(`${name} fail explicit tag`, () => {
        assert.throws(() => load('!!int 1.5', { schema }), /cannot resolve/)
      })
    }
  })

  it('tags/int/JSON schema', () => {
    const src = `
- +685230  # plus sign is not JSON schema int
- 0123     # leading zero is not JSON schema int
- 0b1010   # binary is not JSON schema int
- 0o123    # octal is not JSON schema int
- 0x1A     # hexadecimal is not JSON schema int

- !!int +685230 # explicit plus sign
- !!int 0123    # explicit leading zero
- !!int 0b1010  # explicit binary
- !!int 0o123   # explicit octal
- !!int 0x1A    # explicit hexadecimal
`
    const expected = [
      '+685230', '0123', '0b1010', '0o123', '0x1A',

      685230, 123, 10, 83, 26
    ]

    assert.deepStrictEqual(load(src, { schema: JSON_SCHEMA }), expected)
  })

  it('tags/int/Core schema', () => {
    const src = `
- +685230 # plus sign is allowed
- 0123    # leading zero is decimal
- 0b1010  # binary
- 0o123   # octal
- 0x1A    # hexadecimal

- 1_000 # underscores are not Core schema int
- 1:23  # sexagesimal is not Core schema int
`
    const expected = [
      685230, 123, 10, 83, 26,

      '1_000', '1:23'
    ]

    assert.deepStrictEqual(load(src, { schema: CORE_SCHEMA }), expected)
  })

  it('tags/int/YAML 1.1 schema', () => {
    const src = `
- +685230 # plus sign is allowed
- 0123    # leading zero is octal
- 0b1010  # binary
- 0x1A    # hexadecimal
- 1_000   # underscores
- 1:23    # sexagesimal

- 0o123 # 0o octal prefix is not YAML 1.1 int
- 09    # invalid octal digit
- 1:99  # sexagesimal minutes/seconds are base 60
`
    const expected = [
      685230, 83, 10, 26, 1000, 83,

      '0o123', '09', '1:99'
    ]

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })
})
