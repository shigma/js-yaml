import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Negative zero loses the sign after dump', () => {
  assert.strictEqual(dump(-0), '-0.0\n')
})
