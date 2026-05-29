'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it('Indentation warning on empty lines within quoted scalars and flow collections', function () {
  assert.doesNotThrow(function () { yaml.load("- 'hello\n\n  world'") })
  assert.doesNotThrow(function () { yaml.load('- "hello\n\n  world"') })
  assert.doesNotThrow(function () { yaml.load('- [hello,\n\n  world]') })
  assert.doesNotThrow(function () { yaml.load('- {hello: world,\n\n  foo: bar}') })
})
