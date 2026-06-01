import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Invalid parse error on whitespace between quoted scalar keys and ":" symbol in mappings', () => {
  assert.doesNotThrow(() => {
    load('{ "field1" : "v1", "field2": "v2" }')
  })
})
