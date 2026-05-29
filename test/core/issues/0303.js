'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Loader should not strip quotes before newlines', function () {
  const with_space = yaml.load("'''foo'' '")
  const with_newline = yaml.load("'''foo''\n'")
  assert.strictEqual(with_space, "'foo' ")
  assert.strictEqual(with_newline, "'foo' ")
})
