import assert from 'node:assert/strict'
import { CORE_SCHEMA, defineSequenceTag, dump, load } from 'js-yaml'

// Immutable values cannot be populated item by item. Build a mutable carrier
// first, then turn the completed carrier into the final value.
class ImmutablePoint {
  constructor (coordinates) {
    this.coordinates = Object.freeze([...coordinates])
    Object.freeze(this)
  }
}

const schema = CORE_SCHEMA.withTags(defineSequenceTag('!point', {
  create: () => [],
  addItem: (carrier, item) => { carrier.push(item) },
  finalize: carrier => {
    if (carrier.length !== 2) throw new Error('!point expects exactly 2 coordinates')
    return new ImmutablePoint(carrier)
  },
  identify: value => value instanceof ImmutablePoint,
  represent: point => point.coordinates
}))

const source = `
point: &point !point [10, 20]
samePoint: *point
`

const value = load(source, { schema })

assert.deepStrictEqual(value.point, new ImmutablePoint([10, 20]))
assert.strictEqual(value.samePoint, value.point)
assert.equal(dump(value.point, { schema }), '!point\n- 10\n- 20\n')
assert.throws(
  () => load('!point [10]', { schema }),
  /!point expects exactly 2 coordinates/
)

// A recursive alias needs the final object before finalize() can create it, so
// recursive aliases are intentionally rejected for tags that use finalize().
assert.throws(
  () => load('&point !point [*point]', { schema }),
  /recursive alias "point" is not supported for tag !point because it uses finalize\(\)/
)
