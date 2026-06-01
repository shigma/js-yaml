import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Indentation warning on empty lines within quoted scalars and flow collections', function () {
  assert.doesNotThrow(function () { load("- 'hello\n\n  world'") })
  assert.doesNotThrow(function () { load('- "hello\n\n  world"') })
  assert.doesNotThrow(function () { load('- [hello,\n\n  world]') })
  assert.doesNotThrow(function () { load('- {hello: world,\n\n  foo: bar}') })
})
