'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Invalid errors/warnings of invalid indentation on flow scalars', function () {
  const sources = [
    'text:\n    hello\n  world',   // plain style
    "text:\n    'hello\n  world'", // single-quoted style
    'text:\n    "hello\n  world"'  // double-quoted style
  ]
  const expected = { text: 'hello world' }

  assert.doesNotThrow(function () { yaml.load(sources[0]) }, 'Throws on plain style')
  assert.doesNotThrow(function () { yaml.load(sources[1]) }, 'Throws on single-quoted style')
  assert.doesNotThrow(function () { yaml.load(sources[2]) }, 'Throws on double-quoted style')

  assert.deepStrictEqual(yaml.load(sources[0]), expected)
  assert.deepStrictEqual(yaml.load(sources[1]), expected)
  assert.deepStrictEqual(yaml.load(sources[2]), expected)
})
