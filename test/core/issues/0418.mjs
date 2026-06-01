import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should error on invalid indentation in mappings', () => {
  assert.throws(() => load('foo: "1" bar: "2"'), /bad indentation of a mapping entry/)
  assert.throws(() => load('- "foo" - "bar"'), /bad indentation of a sequence entry/)
})
