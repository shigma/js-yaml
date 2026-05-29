'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should return parse docs from loadAll', function () {
  const data = yaml.loadAll(`
---
a: 1
---
b: 2
`)

  assert.deepStrictEqual(data, [{ a: 1 }, { b: 2 }])
})
