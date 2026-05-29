'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

const sample = { b: 1, a: 2, c: 3 }
const unsortedExpected = 'b: 1\na: 2\nc: 3\n'
const simpleExpected = 'a: 2\nb: 1\nc: 3\n'
const reverseExpected = 'c: 3\nb: 1\na: 2\n'

it('Dumper should sort preserve key insertion order', function () {
  assert.deepStrictEqual(yaml.dump(sample, { sortKeys: false }), unsortedExpected)
})

it('Dumper should sort keys when sortKeys is true', function () {
  assert.deepStrictEqual(yaml.dump(sample, { sortKeys: true }), simpleExpected)
})

it('Dumper should sort keys by sortKeys function when specified', function () {
  assert.deepStrictEqual(yaml.dump(sample, {
    sortKeys: function (a, b) {
      return a < b ? 1 : a > b ? -1 : 0
    }
  }), reverseExpected)
})
