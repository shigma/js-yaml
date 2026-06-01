import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should allow cast integers as !!float', () => {
  const data = load(`
negative: !!float -1
zero: !!float 0
positive: !!float 2.3e4
`)

  assert.deepStrictEqual(data, {
    negative: -1,
    zero: 0,
    positive: 23000
  })
})
