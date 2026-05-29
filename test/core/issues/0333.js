'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should allow cast integers as !!float', function () {
  const data = yaml.load(`
negative: !!float -1
zero: !!float 0
positive: !!float 2.3e4
`)

  assert.deepStrictEqual(data, {
    negative: -1,
    zero: 0,
    positive: 23000
  })
})
