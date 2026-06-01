import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Float type dumper should not miss dot', () => {
  assert.strictEqual(5e-100.toString(10), '5e-100')
  assert.strictEqual(0.5e-100.toString(10), '5e-101')

  assert.strictEqual(dump(0.5e-100), '5.e-101\n')
  assert.strictEqual(load(dump(5e-100)), 5e-100)
})
