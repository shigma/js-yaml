'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it.skip('Block scalar chomping does not work on zero indent', function () {
  assert.throws(function () { yaml.load('|-\nfoo\nbar') }, yaml.YAMLException)
  assert.deepStrictEqual(yaml.dump('foo\nbar'), '|-\n  foo\nbar')
})
