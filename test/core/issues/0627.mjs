import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should not resolve numbers with underscores', function () {
  assert.deepStrictEqual(load(`
string: '1_2_3'
also_string: 1_2_3
key_map:
  18_24: test
float: 1_2.3
fraction: 1.2_3
exponent: 1_2e3
binary: 0b10_10
octal: 0o12_34
hexadecimal: 0x12_34
`), {
    string: '1_2_3',
    also_string: '1_2_3',
    key_map: {
      '18_24': 'test'
    },
    float: '1_2.3',
    fraction: '1.2_3',
    exponent: '1_2e3',
    binary: '0b10_10',
    octal: '0o12_34',
    hexadecimal: '0x12_34'
  })
})
