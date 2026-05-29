'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Should throw exception on extra comma in flow mappings', function () {
  assert.throws(function () {
    yaml.load('[foo, bar,, baz]')
  }, /expected the node content, but found ','/)

  assert.throws(function () {
    yaml.load('{foo, bar,, baz}')
  }, /expected the node content, but found ','/)

  // empty key is allowed here
  assert.deepStrictEqual(yaml.load('{foo,: bar}'), { foo: null, null: 'bar' })
})
