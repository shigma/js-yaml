import { describe, it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, Type } from 'js-yaml'

function TestClass (data) {
  const self = this
  Object.keys(data).forEach(function (key) { self[key] = data[key] })
}

const TestClassYaml = new Type('!test', {
  kind: 'mapping',
  construct: function (data) { return new TestClass(data) }
})

const TEST_SCHEMA = DEFAULT_SCHEMA.extend([TestClassYaml])

describe('Alias nodes', function () {
  describe('Resolving of an alias node should result the resolved and contructed value of the anchored node', function () {
    it('Simple built-in primitives', function () {
      assert.strictEqual(load('[&1 "foobar", *1]')[1], 'foobar')
      assert.strictEqual(load('[&1 ~, *1]')[1], null)
      assert.strictEqual(load('[&1 true, *1]')[1], true)
      assert.strictEqual(load('[&1 42, *1]')[1], 42)
    })

    it('Simple built-in objects', function () {
      assert.deepStrictEqual(load('[&1 [a, b, c, d], *1]')[1], ['a', 'b', 'c', 'd'])
      assert.deepStrictEqual(load('[&1 {a: b, c: d}, *1]')[1], { a: 'b', c: 'd' })
    })

    it('Recursive built-in objects', function () {
      const actual = load('[&1 {self: *1}, *1]')[1]

      assert(actual === actual.self)
    })

    it('Simple custom objects', function () {
      const expected = new TestClass({ a: 'b', c: 'd' })
      const actual = load('[&1 !test {a: b, c: d}, *1]', { schema: TEST_SCHEMA })[1]

      assert(actual instanceof TestClass)
      assert.deepStrictEqual(actual, expected)
    })

    // TODO: Not implemented yet (see issue #141)
    it.skip('Recursive custom objects', function () {
      const actual = load('[&1 !test {self: *1}, *1]', { schema: TEST_SCHEMA })[1]

      assert(actual instanceof TestClass)
      assert(actual.self instanceof TestClass)
      assert(actual === actual.self)
    })
  })
})
