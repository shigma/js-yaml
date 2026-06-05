import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load } from 'js-yaml'

describe('tags', () => {
  it('boolean', () => {
    const src = `
valid_true: [ true, True, TRUE ]
valid_false: [ false, False, FALSE ]

deprecated_true: [ y, Y, yes, Yes, YES, on, On, ON ]
deprecated_false: [ n, N, no, No, NO, off, Off, OFF ]
`

    const expected = {
      valid_true: [true, true, true],
      valid_false: [false, false, false],
      deprecated_true: ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON'],
      deprecated_false: ['n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF']
    }

    assert.deepStrictEqual(load(src), expected)
  })
})
