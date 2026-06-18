import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, YAMLException } from 'js-yaml'

describe('core/units/load-other', () => {
  it('BOM strip', () => {
    assert.deepStrictEqual(load('\uFEFFfoo: bar\n'), { foo: 'bar' })
    assert.deepStrictEqual(load('foo: bar\n'), { foo: 'bar' })
  })

  it('Loading multidocument source using `load` should cause an error', () => {
    assert.throws(() => {
      load('--- # first document\n--- # second document\n')
    }, YAMLException)
  })

  it('reads a flow sequence explicit pair with an empty value', () => {
    assert.deepEqual(load('[? foo]'), [{ foo: null }])
  })
})
