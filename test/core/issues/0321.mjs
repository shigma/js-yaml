import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should throw exception on extra comma in flow mappings', function () {
  assert.throws(function () {
    load('[foo, bar,, baz]')
  }, /expected the node content, but found ','/)

  assert.throws(function () {
    load('{foo, bar,, baz}')
  }, /expected the node content, but found ','/)

  // empty key is allowed here
  assert.deepStrictEqual(load('{foo,: bar}'), { foo: null, null: 'bar' })
})
