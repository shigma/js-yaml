import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, dump } from 'js-yaml'

describe('tags', () => {
  it('str', () => {
    assert.deepStrictEqual(load('string: abcd'), { string: 'abcd' })
    assert.deepStrictEqual(load(dump({ string: 'abcd' })), { string: 'abcd' })
  })

  it('Resolving explicit !!str on empty node', () => {
    assert.strictEqual(load('!!str'), '')
  })
})
