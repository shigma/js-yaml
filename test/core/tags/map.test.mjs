import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { load, dump, CORE_SCHEMA, realMapTag, mergeTag } from 'js-yaml'

// Two mappings sharing the `!!map` tag name: the default `{}`-style map
// (keys stringified) and the real-`Map` variant (keys keep their type).
const variants = [
  ['PLAIN_OBJ_MAP', CORE_SCHEMA.withTags(mergeTag), (entries) => Object.fromEntries(entries)],
  ['REAL_MAP', CORE_SCHEMA.withTags(realMapTag, mergeTag), (entries) => new Map(entries)]
]

describe('tags/map', () => {
  describe('tags/map/common', () => {
    const src = `
Clark: Evans
Brian: Ingerson
Oren: Ben-Kiki
`
    const entries = [['Clark', 'Evans'], ['Brian', 'Ingerson'], ['Oren', 'Ben-Kiki']]

    // a top-level merge: its source mapping is read back via the tag's keys/get
    const mergeSrc = `
<<: { x: 1, y: 2 }
z: 3
`
    const mergeEntries = [['x', 1], ['y', 2], ['z', 3]]

    for (const [name, schema, wrap] of variants) {
      it(`${name} common part`, () => {
        assert.deepStrictEqual(load(src, { schema }), wrap(entries))
      })

      it(`${name} round-trip`, () => {
        const value = wrap(entries)
        assert.deepStrictEqual(load(dump(value, { schema }), { schema }), value)
      })

      it(`${name} merge`, () => {
        assert.deepStrictEqual(load(mergeSrc, { schema }), wrap(mergeEntries))
      })

      it(`${name} Resolving explicit !!map on empty node`, () => {
        assert.deepStrictEqual(load('!!map', { schema }), wrap([]))
      })
    }
  })

  describe('tags/map/string keys', () => {
    it('stringifies a sequence key', () => {
      assert.deepStrictEqual(load('? - foo\n  - bar\n: baz\n'), { 'foo,bar': 'baz' })
    })

    it('stringifies an object element inside a sequence key', () => {
      assert.deepStrictEqual(load('? - foo\n  - bar: baz\n: value\n'), { 'foo,[object Object]': 'value' })
    })

    it('stringifies an object used directly as a key', () => {
      assert.deepStrictEqual(load('? { a: 1 }\n: value\n'), { '[object Object]': 'value' })
    })
  })

  describe('tags/map/real Map', () => {
    const schema = CORE_SCHEMA.withTags(realMapTag)

    it('keeps numeric keys distinct from their string form', () => {
      const result = load('1: num\n"1": str\n', { schema })

      assert.strictEqual(result.size, 2)
      assert.strictEqual(result.get(1), 'num')
      assert.strictEqual(result.get('1'), 'str')
    })

    it('round-trips object and array keys', () => {
      const source = new Map()
      source.set(1, 'one')
      source.set('a', 'str')
      source.set([1, 2], 'arr')
      source.set(new Map([['x', 1]]), 'obj')

      const result = load(dump(source, { schema }), { schema })

      assert.ok(result instanceof Map)
      assert.deepStrictEqual([...result], [...source])
    })

    it('dumps a plain object through the same path', () => {
      const result = load(dump({ a: 1, b: 2 }, { schema }), { schema })

      assert.ok(result instanceof Map)
      assert.deepStrictEqual([...result], [['a', 1], ['b', 2]])
    })
  })
})
