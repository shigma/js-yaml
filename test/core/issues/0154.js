'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Indentation warning on empty lines within quoted scalars and flow collections', function () {
  assert.doesNotThrow(function () { yaml.load("- 'hello\n\n  world'") })
  assert.doesNotThrow(function () { yaml.load('- "hello\n\n  world"') })
  assert.doesNotThrow(function () { yaml.load('- [hello,\n\n  world]') })
  assert.doesNotThrow(function () { yaml.load('- {hello: world,\n\n  foo: bar}') })
})
