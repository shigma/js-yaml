import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { isPlainObject } from '../../../src/common/object.ts'

describe('common/object', () => {
  describe('isPlainObject', () => {
    it('accepts plain objects', () => {
      assert.equal(isPlainObject({}), true)
      assert.equal(isPlainObject({ a: 1 }), true)
    })

    it('accepts null-prototype objects', () => {
      assert.equal(isPlainObject(Object.create(null)), true)
    })

    it('rejects non-plain objects', () => {
      class Custom {}

      assert.equal(isPlainObject([]), false)
      assert.equal(isPlainObject(new Date()), false)
      assert.equal(isPlainObject(new Map()), false)
      assert.equal(isPlainObject(new Custom()), false)
    })

    it('rejects primitives and null', () => {
      assert.equal(isPlainObject(null), false)
      assert.equal(isPlainObject(undefined), false)
      assert.equal(isPlainObject('x'), false)
      assert.equal(isPlainObject(1), false)
      assert.equal(isPlainObject(true), false)
    })
  })
})
