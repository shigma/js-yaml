import { describe, it } from 'node:test'

import assert from 'node:assert'
import { load, YAMLException, YAML11_SCHEMA } from 'js-yaml'

describe('Resolving explicit tags on empty nodes', () => {
  it('!!binary', () => {
    assert.throws(() => { load('!!binary') }, YAMLException)
  })

  it('!!bool', () => {
    assert.throws(() => { load('!!bool') }, YAMLException)
  })

  it('!!float', () => {
    assert.throws(() => { load('!!float') }, YAMLException)
  })

  it('!!int', () => {
    assert.throws(() => { load('!!int') }, YAMLException)
  })

  it('!!map', () => {
    assert.deepStrictEqual(load('!!map'), {})
  })

  it('!!merge', () => {
    assert.doesNotThrow(() => { load('? !!merge\n: []', { schema: YAML11_SCHEMA }) })
  })

  it('!!null', () => {
    // Fetch null from an array to reduce chance that null is returned because of another bug
    assert.strictEqual(load('- !!null')[0], null)
  })

  it('!!omap', () => {
    assert.deepStrictEqual(load('!!omap', { schema: YAML11_SCHEMA }), [])
  })

  it('!!pairs', () => {
    assert.deepStrictEqual(load('!!pairs', { schema: YAML11_SCHEMA }), [])
  })

  it('!!seq', () => {
    assert.deepStrictEqual(load('!!seq'), [])
  })

  it('!!set', () => {
    assert.deepStrictEqual(load('!!set', { schema: YAML11_SCHEMA }), {})
  })

  it('!!str', () => {
    assert.strictEqual(load('!!str'), '')
  })

  it('!!timestamp', () => {
    assert.throws(() => { load('!!timestamp', { schema: YAML11_SCHEMA }) }, YAMLException)
  })
})
