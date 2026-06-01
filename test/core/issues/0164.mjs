import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('should define __proto__ as a value (not invoke setter)', function () {
  const object = load('{ __proto__: {polluted: bar} }')

  assert.strictEqual(({}).hasOwnProperty.call(load('{}'), '__proto__'), false)
  assert.strictEqual(({}).hasOwnProperty.call(object, '__proto__'), true)
  assert(!object.polluted)
})

it('should merge __proto__ as a value with << operator', function () {
  const object = load(`
payload: &ref
  polluted: bar

foo:
  <<:
    __proto__: *ref
  `)

  assert.strictEqual(({}).hasOwnProperty.call(load('{}'), '__proto__'), false)
  assert.strictEqual(({}).hasOwnProperty.call(object.foo, '__proto__'), true)
  assert(!object.foo.polluted)
})
