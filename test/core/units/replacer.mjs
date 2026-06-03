import { describe, it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, dump, load, NODE_KIND_SCALAR, createType } from 'js-yaml'

describe('replacer', () => {
  const undef = createType('!undefined', {
    nodeKind: NODE_KIND_SCALAR,
    resolve: () => true,
    construct: () => {},
    predicate: object => typeof object === 'undefined',
    represent: () => ''
  })

  const undefSchema = DEFAULT_SCHEMA.extend(undef)

  it('should be called on the root of the document', () => {
    let called = 0

    const result = dump(42, {
      replacer (key, value) {
        called++
        assert.deepStrictEqual(this, { '': 42 })
        assert.strictEqual(key, '')
        assert.strictEqual(value, 42)
        return 123
      }
    })
    assert.strictEqual(result, '123\n')
    assert.strictEqual(called, 1)

    assert.strictEqual(dump(42, {
      replacer (/* key, value */) {}
    }), '')

    assert.strictEqual(dump(42, {
      replacer (/* key, value */) { return 'foo' }
    }), 'foo\n')
  })

  it('should be called in collections (block)', () => {
    let called = 0

    const result = dump([42], {
      replacer (key, value) {
        called++
        if (key === '' && called === 1) return value
        assert.deepStrictEqual(this, [42])
        assert.strictEqual(key, '0')
        assert.strictEqual(value, 42)
        return 123
      },
      flowLevel: -1
    })
    assert.strictEqual(result, '- 123\n')
    assert.strictEqual(called, 2)
  })

  it('should be called in collections (flow)', () => {
    let called = 0

    const result = dump([42], {
      replacer (key, value) {
        called++
        if (key === '' && called === 1) return value
        assert.deepStrictEqual(this, [42])
        assert.strictEqual(key, '0')
        assert.strictEqual(value, 42)
        return 123
      },
      flowLevel: 0
    })
    assert.strictEqual(result, '[123]\n')
    assert.strictEqual(called, 2)
  })

  it('should be called in mappings (block)', () => {
    let called = 0

    const result = dump({ a: 42 }, {
      replacer (key, value) {
        called++
        if (key === '' && called === 1) return value
        assert.deepStrictEqual(this, { a: 42 })
        assert.strictEqual(key, 'a')
        assert.strictEqual(value, 42)
        return 123
      },
      flowLevel: -1
    })
    assert.strictEqual(result, 'a: 123\n')
    assert.strictEqual(called, 2)
  })

  it('should be called in mappings (flow)', () => {
    let called = 0

    const result = dump({ a: 42 }, {
      replacer (key, value) {
        called++
        if (key === '' && called === 1) return value
        assert.deepStrictEqual(this, { a: 42 })
        assert.strictEqual(key, 'a')
        assert.strictEqual(value, 42)
        return 123
      },
      flowLevel: 0
    })
    assert.strictEqual(result, '{a: 123}\n')
    assert.strictEqual(called, 2)
  })

  it('undefined removes element from a mapping', () => {
    let str = dump({ a: 1, b: 2, c: 3 }, {
      replacer (key, value) {
        if (key === 'b') return undefined
        return value
      }
    })
    let result = load(str)
    assert.deepStrictEqual(result, { a: 1, c: 3 })

    str = dump({ a: 1, b: 2, c: 3 }, {
      replacer (key, value) {
        if (key === 'b') return undefined
        return value
      },
      schema: undefSchema
    })
    result = load(str, { schema: undefSchema })
    assert.deepStrictEqual(result, { a: 1, b: undefined, c: 3 })
  })

  it('undefined replaces element in an array with null', () => {
    let str = dump([1, 2, 3], {
      replacer (key, value) {
        if (key === '1') return undefined
        return value
      }
    })
    let result = load(str)
    assert.deepStrictEqual(result, [1, null, 3])

    str = dump([1, 2, 3], {
      replacer (key, value) {
        if (key === '1') return undefined
        return value
      },
      schema: undefSchema
    })
    result = load(str, { schema: undefSchema })
    assert.deepStrictEqual(result, [1, undefined, 3])
  })

  it('should recursively call replacer', () => {
    let count = 0

    const result = dump(42, {
      replacer (key, value) {
        return count++ > 3 ? value : { [`lvl${count}`]: value }
      }
    })
    assert.strictEqual(result, `
lvl1:
  lvl2:
    lvl3:
      lvl4: 42
`.replace(/^\n/, ''))
  })
})
