import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should check kind type when resolving !<?> tag', () => {
  try {
    load('!<?> [0]')
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: unknown sequence tag !<?>'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
