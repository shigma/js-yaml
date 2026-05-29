'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml   = require('js-yaml')

it('Plain scalar "constructor" parsed as `null`', function () {
  assert.strictEqual(yaml.load('constructor'),          'constructor')
  assert.deepStrictEqual(yaml.load('constructor: value'),     { constructor: 'value' })
  assert.deepStrictEqual(yaml.load('key: constructor'),       { key: 'constructor' })
  assert.deepStrictEqual(yaml.load('{ constructor: value }'), { constructor: 'value' })
  assert.deepStrictEqual(yaml.load('{ key: constructor }'),   { key: 'constructor' })
})
