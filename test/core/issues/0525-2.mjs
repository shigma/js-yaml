import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should check kind type when resolving !<?> tag', function () {
  try {
    load('!<?> [0]')
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: unacceptable node kind for !<?> tag'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
