import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Duplicated objects within array', function () {
  const obj = { test: 'canary' }
  const arrayWithRefs = [obj, obj]

  const obtained = load(dump(arrayWithRefs))

  assert.strictEqual(obtained[0].test, 'canary')
  assert.strictEqual(obtained[0], obtained[1])
})

it('Duplicated arrays within array', function () {
  const array = [0, 1]
  const arrayWithRefs = [array, array]

  const obtained = load(dump(arrayWithRefs))

  assert.strictEqual(obtained[0][0], 0)
  assert.strictEqual(obtained[0][1], 1)
  assert.strictEqual(obtained[0], obtained[1])
})
