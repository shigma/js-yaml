'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it('Don\'t throw on warning', function () {
  var src = `
test: |-


  Hello
  world
`

  assert.deepStrictEqual(yaml.load(src), { test: '\n\nHello\nworld' })
})
