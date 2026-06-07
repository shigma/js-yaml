import { describe, it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, load, realMapTag } from 'js-yaml'

// The real-`Map` tag keeps key identity/type on load; the dumper walks the
// canonical `Map` form, so non-string keys survive a dump → load round-trip
// instead of being stringified.
describe('real Map', () => {
  const schema = CORE_SCHEMA.withTags(realMapTag)

  it('round-trips numeric and object keys', () => {
    const source = new Map()
    source.set(1, 'one')
    source.set('a', 'str')
    source.set([1, 2], 'arr')

    const objectKey = new Map()
    objectKey.set('x', 1)
    source.set(objectKey, 'obj')

    const result = load(dump(source, { schema }), { schema })

    assert.ok(result instanceof Map)
    assert.deepStrictEqual([...result], [...source])
  })

  it('keeps numeric keys distinct from their string form', () => {
    const source = new Map()
    source.set(1, 'num')
    source.set('1', 'str')

    const result = load(dump(source, { schema }), { schema })

    assert.strictEqual(result.size, 2)
    assert.strictEqual(result.get(1), 'num')
    assert.strictEqual(result.get('1'), 'str')
  })

  it('dumps a plain object through the same path', () => {
    const result = load(dump({ a: 1, b: 2 }, { schema }), { schema })

    assert.ok(result instanceof Map)
    assert.deepStrictEqual([...result], [['a', 1], ['b', 2]])
  })
})
