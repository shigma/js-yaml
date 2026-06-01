import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('should indent arrays an extra level by default', () => {
  const output = dump({ array: ['a', 'b'] })
  const expected = 'array:\n  - a\n  - b\n'
  assert.strictEqual(output, expected)
})

it('should not indent arrays an extra level when disabled', () => {
  const output = dump({ array: ['a', 'b'] }, { noArrayIndent: true })
  const expected = 'array:\n- a\n- b\n'
  assert.strictEqual(output, expected)
})

it('should always indent nested arrays', () => {
  const output = dump({ array: ['a', ['b', 'c'], 'd'] }, { noArrayIndent: true })
  const expected = 'array:\n- a\n- - b\n  - c\n- d\n'
  assert.strictEqual(output, expected)
})
