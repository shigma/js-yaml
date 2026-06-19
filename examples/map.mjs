import assert from 'node:assert/strict'
import { CORE_SCHEMA, dump, load, mapTag, realMapTag } from 'js-yaml'

const realMapSchema = CORE_SCHEMA.withTags(realMapTag)

// Use a realMapTag when need complex keys, not just strings.
const result = load('{ foo: 1, bar: 2 }: value', { schema: realMapSchema })

assert.deepStrictEqual(result, new Map([
  [
    new Map([
      ['foo', 1],
      ['bar', 2]
    ]),
    'value'
  ]
]))

// Object without prototype is more safe in theory. But it can break a low of
// assert.deepStrictEqual checks at user side. So, by default, use `{}` Object.
// But you can enforce more strict objects, if you wish.
const noprotoMapSchema = CORE_SCHEMA.withTags({
  ...mapTag,
  create: () => Object.create(null),
  addPair: (container, key, value) => {
    if (key !== null && typeof key === 'object') {
      return 'object-based map does not support complex keys'
    }
    container[key] = value // safe to write anything for such objects
    return ''
  }
})

const result2 = load('{ enabled: true, level: 2 }', { schema: noprotoMapSchema })

assert.strictEqual(Object.getPrototypeOf(result2), null)
assert.deepStrictEqual(result2, Object.assign(Object.create(null), {
  enabled: true,
  level: 2
}))

assert.strictEqual(dump(result2, { schema: noprotoMapSchema }),
`enabled: true
level: 2
`)
