import { describe, it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, FAILSAFE_SCHEMA, load, defineScalarTag } from 'js-yaml'

describe('Undefined', () => {
  const undef = defineScalarTag('!undefined', {
    resolve: () => {},
    identify: object => typeof object === 'undefined',
    represent: () => ''
  })

  const undefSchema = CORE_SCHEMA.withTags(undef)

  it('Should replace undefined with null in collections', () => {
    const str = dump([undefined, 1, undefined, null, 2])
    assert(str.match(/^- /))
    assert.deepStrictEqual(
      load(str),
      [null, 1, null, null, 2]
    )
  })

  it('Should remove keys with undefined in mappings', () => {
    const str = dump({ t: undefined, foo: 1, bar: undefined, baz: null })
    assert(str.match(/^foo:/))
    assert.deepStrictEqual(
      load(str),
      { foo: 1, baz: null }
    )
  })

  it("Should serialize top-level undefined to ''", () => {
    assert.strictEqual(dump(undefined), '')
  })

  it('Should serialize undefined if schema is available', () => {
    assert.deepStrictEqual(
      load(
        dump([1, undefined, null, 2], { schema: undefSchema }),
        { schema: undefSchema }
      ),
      [1, undefined, null, 2]
    )

    assert.deepStrictEqual(
      load(
        dump({ foo: 1, bar: undefined, baz: null }, { schema: undefSchema }),
        { schema: undefSchema }
      ),
      { foo: 1, bar: undefined, baz: null }
    )
  })

  it('Should return an error if neither null nor undefined schemas are available', () => {
    assert.throws(() => {
      dump(['foo', undefined, 'bar'], { schema: FAILSAFE_SCHEMA })
    }, /unacceptable kind of an object to dump/)
  })

  it('Should skip leading values correctly', () => {
    assert.strictEqual(
      dump([() => {}, 'a'], { skipInvalid: true }),
      '- a\n')

    assert.strictEqual(
      dump({ a: () => {}, b: 'a' }, { skipInvalid: true }),
      'b: a\n')
  })
})
