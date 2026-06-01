import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should throw if there is a null-byte in input', () => {
  try {
    load('foo\0bar')
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: null byte is not allowed in input'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
