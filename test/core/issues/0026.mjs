import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should convert new line into white space', () => {
  const data = load(`
test: >
  a
  b
  c
`)

  assert.strictEqual(data.test, 'a b c\n')
})
