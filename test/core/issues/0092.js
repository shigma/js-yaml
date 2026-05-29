'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it('Invalid parse error on whitespace between quoted scalar keys and ":" symbol in mappings', function () {
  assert.doesNotThrow(function () {
    yaml.load('{ "field1" : "v1", "field2": "v2" }')
  })
})
