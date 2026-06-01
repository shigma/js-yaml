import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Indentation warning on empty lines within quoted scalars and flow collections', () => {
  assert.doesNotThrow(() => { load("- 'hello\n\n  world'") })
  assert.doesNotThrow(() => { load('- "hello\n\n  world"') })
  assert.doesNotThrow(() => { load('- [hello,\n\n  world]') })
  assert.doesNotThrow(() => { load('- {hello: world,\n\n  foo: bar}') })
})
