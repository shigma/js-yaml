'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Loader should not strip quotes before newlines', function () {
  const withSpace = yaml.load("'''foo'' '")
  const withNewline = yaml.load("'''foo''\n'")
  assert.strictEqual(withSpace, "'foo' ")
  assert.strictEqual(withNewline, "'foo' ")
})
