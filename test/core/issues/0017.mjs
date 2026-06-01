import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Non-specific "!" tags should resolve to !!str', () => {
  const data = load(`
! 12
`)

  assert.strictEqual(typeof data, 'string')
})
