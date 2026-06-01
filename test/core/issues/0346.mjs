import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('should not emit spaces in arrays in flow mode between entries using condenseFlow: true', function () {
  const array = ['a', 'b']
  const dumpedArray = dump(array, { flowLevel: 0, indent: 0, condenseFlow: true })
  assert.strictEqual(
    dumpedArray,
    '[a,b]\n'
  )
  assert.deepStrictEqual(load(dumpedArray), array)
})

it('should not emit spaces between key: value and quote keys using condenseFlow: true', function () {
  const object = { a: { b: 'c', d: 'e' } }
  const objectDump = dump(object, { flowLevel: 0, indent: 0, condenseFlow: true })
  assert.strictEqual(
    objectDump,
    '{"a":{"b":c, "d":e}}\n'
  )
  assert.deepStrictEqual(load(objectDump), object)
})
