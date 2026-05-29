'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Parse failed when no document start present', function () {
  assert.doesNotThrow(function () {
    yaml.load(`
foo: !!str bar
`)
  }, TypeError)
})
