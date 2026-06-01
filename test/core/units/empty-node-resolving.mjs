import { describe, it } from 'node:test'

import assert from 'node:assert'
import { load, YAMLException } from 'js-yaml'

describe('Resolving explicit tags on empty nodes', function () {
  it('!!binary', function () {
    assert.throws(function () { load('!!binary') }, YAMLException)
  })

  it('!!bool', function () {
    assert.throws(function () { load('!!bool') }, YAMLException)
  })

  it('!!float', function () {
    assert.throws(function () { load('!!float') }, YAMLException)
  })

  it('!!int', function () {
    assert.throws(function () { load('!!int') }, YAMLException)
  })

  it('!!map', function () {
    assert.deepStrictEqual(load('!!map'), {})
  })

  it('!!merge', function () {
    assert.doesNotThrow(function () { load('? !!merge\n: []') })
  })

  it('!!null', function () {
    // Fetch null from an array to reduce chance that null is returned because of another bug
    assert.strictEqual(load('- !!null')[0], null)
  })

  it('!!omap', function () {
    assert.deepStrictEqual(load('!!omap'), [])
  })

  it('!!pairs', function () {
    assert.deepStrictEqual(load('!!pairs'), [])
  })

  it('!!seq', function () {
    assert.deepStrictEqual(load('!!seq'), [])
  })

  it('!!set', function () {
    assert.deepStrictEqual(load('!!set'), {})
  })

  it('!!str', function () {
    assert.strictEqual(load('!!str'), '')
  })

  it('!!timestamp', function () {
    assert.throws(function () { load('!!timestamp') }, YAMLException)
  })
})
