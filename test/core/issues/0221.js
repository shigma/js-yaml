'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it.skip('Block scalar chomping does not work on zero indent', function () {
  assert.throws(function () { yaml.load('|-\nfoo\nbar') }, yaml.YAMLException)
  assert.deepStrictEqual(yaml.dump('foo\nbar'), '|-\n  foo\nbar')
})
