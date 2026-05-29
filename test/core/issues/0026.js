'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should convert new line into white space', function () {
  const data = yaml.load(`
test: >
  a
  b
  c
`)

  assert.strictEqual(data.test, 'a b c\n')
})
