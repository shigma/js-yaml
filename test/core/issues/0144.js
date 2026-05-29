'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Infinite loop when attempting to parse multi-line scalar document that is not indented', function () {
  assert.strictEqual(yaml.load('--- |\nfoo\n'), 'foo\n')
})
