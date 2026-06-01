import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Parse failed when no document start present', () => {
  assert.doesNotThrow(() => {
    load(`
foo: !!str bar
`)
  }, TypeError)
})
