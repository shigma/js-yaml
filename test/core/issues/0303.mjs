import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Loader should not strip quotes before newlines', () => {
  const withSpace = load("'''foo'' '")
  const withNewline = load("'''foo''\n'")
  assert.strictEqual(withSpace, "'foo' ")
  assert.strictEqual(withNewline, "'foo' ")
})
