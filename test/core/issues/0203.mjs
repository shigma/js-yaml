import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Don\'t throw on warning', () => {
  const src = `
test: |-


  Hello
  world
`

  assert.deepStrictEqual(load(src), { test: '\n\nHello\nworld' })
})
