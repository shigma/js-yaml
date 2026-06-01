import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should include the error message in the error stack', function () {
  try {
    load(`
# intentionally invalid yaml

  foo: bar
baz: qux
`)
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: end of the stream or a document separator is expected'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
