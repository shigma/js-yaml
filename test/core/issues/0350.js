'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it('should return parse docs from loadAll', function () {
  var data = yaml.loadAll(`
---
a: 1
---
b: 2
`)

  assert.deepStrictEqual(data, [{ a: 1 }, { b: 2 }])
})
