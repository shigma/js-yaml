import { it } from 'node:test'

import assert from 'node:assert'
import { loadAll } from 'js-yaml'

it('should return parse docs from loadAll', function () {
  const data = loadAll(`
---
a: 1
---
b: 2
`)

  assert.deepStrictEqual(data, [{ a: 1 }, { b: 2 }])
})
