import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { CORE_SCHEMA, JSON_SCHEMA, YAML11_SCHEMA, load, dump } from 'js-yaml'

const variants = [
  ['JSON', JSON_SCHEMA],
  ['Core', CORE_SCHEMA],
  ['YAML 1.1', YAML11_SCHEMA]
]

describe('tags', () => {
  describe('boolean/common', () => {
    const src = `
valid_true: true
valid_false: false
`
    const expected = {
      valid_true: true,
      valid_false: false
    }

    for (const [name, schema] of variants) {
      it(`${name} common part`, () => {
        assert.deepStrictEqual(load(src, { schema }), expected)
      })

      it(`${name} round-trip`, () => {
        assert.deepStrictEqual(load(dump(expected, { schema }), { schema }), expected)
      })

      it(`${name} fail explicit tag`, () => {
        assert.throws(() => load('!!bool garbage', { schema }), /cannot resolve/)
      })
    }
  })

  it('boolean/JSON schema', () => {
    const src = `
core_true: [ True, TRUE ]
core_false: [ False, FALSE ]

yaml11_true: [ y, Y, yes, Yes, YES, on, On, ON ]
yaml11_false: [ n, N, no, No, NO, off, Off, OFF ]
`
    const expected = {
      core_true: ['True', 'TRUE'],
      core_false: ['False', 'FALSE'],

      yaml11_true: ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON'],
      yaml11_false: ['n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF']
    }

    assert.deepStrictEqual(load(src, { schema: JSON_SCHEMA }), expected)
  })

  it('boolean/Core schema', () => {
    const src = `
valid_true: [ true, True, TRUE ]
valid_false: [ false, False, FALSE ]

yaml11_true: [ y, Y, yes, Yes, YES, on, On, ON ]
yaml11_false: [ n, N, no, No, NO, off, Off, OFF ]
`
    const expected = {
      valid_true: [true, true, true],
      valid_false: [false, false, false],

      yaml11_true: ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON'],
      yaml11_false: ['n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF']
    }

    assert.deepStrictEqual(load(src, { schema: CORE_SCHEMA }), expected)
  })

  it('boolean/YAML 1.1 schema', () => {
    const src = `
valid_true: [ true, True, TRUE ]
valid_false: [ false, False, FALSE ]

yaml11_true: [ y, Y, yes, Yes, YES, on, On, ON ]
yaml11_false: [ n, N, no, No, NO, off, Off, OFF ]
`
    const expected = {
      valid_true: [true, true, true],
      valid_false: [false, false, false],

      yaml11_true: [true, true, true, true, true, true, true, true],
      yaml11_false: [false, false, false, false, false, false, false, false]
    }

    assert.deepStrictEqual(load(src, { schema: YAML11_SCHEMA }), expected)
  })
})
