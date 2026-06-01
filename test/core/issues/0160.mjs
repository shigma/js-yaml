import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Correct encoding of UTF-16 surrogate pairs', () => {
  assert.strictEqual(load('"\\U0001F431"'), '🐱')
})
