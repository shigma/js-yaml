'use strict'

const { describe, it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

describe('loader parameters', function () {
  const testStr = 'test: 1 \ntest: 2'
  const expected = [{ test: 2 }]
  let result

  it('loadAll(input, options)', function () {
    result = yaml.loadAll(testStr, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    yaml.loadAll(testStr, function (doc) {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, null, options)', function () {
    result = yaml.loadAll(testStr, null, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    yaml.loadAll(testStr, function (doc) {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, options)', function () {
    result = yaml.loadAll(testStr, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    yaml.loadAll(testStr, function (doc) {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })

  it('loadAll(input, null, options)', function () {
    result = yaml.loadAll(testStr, null, { json: true })
    assert.deepStrictEqual(result, expected)

    result = []
    yaml.loadAll(testStr, function (doc) {
      result.push(doc)
    }, { json: true })
    assert.deepStrictEqual(result, expected)
  })
})
