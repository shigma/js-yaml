'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should define __proto__ as a value (not invoke setter)', function () {
  const object = yaml.load('{ __proto__: {polluted: bar} }')

  assert.strictEqual(({}).hasOwnProperty.call(yaml.load('{}'), '__proto__'), false)
  assert.strictEqual(({}).hasOwnProperty.call(object, '__proto__'), true)
  assert(!object.polluted)
})

it('should merge __proto__ as a value with << operator', function () {
  const object = yaml.load(`
payload: &ref
  polluted: bar

foo:
  <<:
    __proto__: *ref
  `)

  assert.strictEqual(({}).hasOwnProperty.call(yaml.load('{}'), '__proto__'), false)
  assert.strictEqual(({}).hasOwnProperty.call(object.foo, '__proto__'), true)
  assert(!object.foo.polluted)
})
