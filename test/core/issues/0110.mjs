import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Circular and cross references', function () {
  const source = {
    a: { a: 1 },
    b: [1, 2],
    c: {},
    d: []
  }
  source.crossObject = source.a
  source.crossArray = source.b
  source.c.circularObject = source
  source.d.push(source.d)
  source.d.push(source)

  const obtained = load(dump(source))

  assert.strictEqual(obtained.crossObject, obtained.a)
  assert.strictEqual(obtained.crossArray, obtained.b)
  assert.strictEqual(obtained.c.circularObject, obtained)
  assert.strictEqual(obtained.d[0], obtained.d)
  assert.strictEqual(obtained.d[1], obtained)
})
