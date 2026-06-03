import { it } from 'node:test'

/* global BigInt */

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, defineTag, intTag } from 'js-yaml'

it('Should allow int override', () => {
  const BigIntType = defineTag('tag:yaml.org,2002:int', {
    nodeKind: intTag.nodeKind,
    resolve: intTag.resolve,
    construct: data => {
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
  })

  const SCHEMA = DEFAULT_SCHEMA.extend({ implicit: [BigIntType] })

  const data = `
int: -123456789
bigint: -12345678901234567890
float: -12345678901234567890.1234
`

  assert.deepStrictEqual(load(data, { schema: SCHEMA }), {
    int: -123456789n,
    bigint: -12345678901234567890n,
    float: -12345678901234567000 // precision loss expected
  })
})
