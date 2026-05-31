'use strict'

const { it } = require('node:test')

/* global BigInt */

const assert = require('assert')
const yaml = require('js-yaml')

it('Should allow int override', function () {
  const options = Object.assign({}, yaml.types.int.options)

  options.construct = data => {
    let value = data
    let sign = 1n
    let ch

    ch = value[0]

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1n
      value = value.slice(1)
      ch = value[0]
    }

    return sign * BigInt(value)
  }

  const BigIntType = new yaml.Type('tag:yaml.org,2002:int', options)

  const SCHEMA = yaml.DEFAULT_SCHEMA.extend({ implicit: [BigIntType] })

  const data = `
int: -123456789
bigint: -12345678901234567890
float: -12345678901234567890.1234
`

  assert.deepStrictEqual(yaml.load(data, { schema: SCHEMA }), {
    int: -123456789n,
    bigint: -12345678901234567890n,
    float: -12345678901234567000 // precision loss expected
  })
})
