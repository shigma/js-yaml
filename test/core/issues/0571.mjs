import { describe, it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, dump, FAILSAFE_SCHEMA, load, Type } from 'js-yaml'

describe('Undefined', () => {
  const undef = new Type('!undefined', {
    kind: 'scalar',
    resolve: () => true,
    construct: () => {},
    predicate: object => typeof object === 'undefined',
    represent: () => ''
  })

  const undefSchema = DEFAULT_SCHEMA.extend(undef)

  it('Should replace undefined with null in collections', () => {
    let str

    str = dump([undefined, 1, undefined, null, 2], { flowLevel: 0 })
    assert(str.match(/^\[/))
    assert.deepStrictEqual(
      load(str),
      [null, 1, null, null, 2]
    )

    str = dump([undefined, 1, undefined, null, 2], { flowLevel: -1 })
    assert(str.match(/^- /))
    assert.deepStrictEqual(
      load(str),
      [null, 1, null, null, 2]
    )
  })

  it('Should remove keys with undefined in mappings', () => {
    let str

    str = dump({ t: undefined, foo: 1, bar: undefined, baz: null }, { flowLevel: 0 })
    assert(str.match(/^\{/))
    assert.deepStrictEqual(
      load(str),
      { foo: 1, baz: null }
    )

    str = dump({ t: undefined, foo: 1, bar: undefined, baz: null }, { flowLevel: -1 })
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

  it('Should respect null formatting', () => {
    assert.strictEqual(
      dump([undefined], { styles: { '!!null': 'uppercase' } }),
      '- NULL\n'
    )
  })

  it('Should return an error if neither null nor undefined schemas are available', () => {
    assert.throws(() => {
      dump(['foo', undefined, 'bar'], { schema: FAILSAFE_SCHEMA })
    }, /unacceptable kind of an object to dump/)
  })

  it('Should skip leading values correctly', () => {
    assert.strictEqual(
      dump([() => {}, 'a'], { flowLevel: 0, skipInvalid: true }),
      '[a]\n')

    assert.strictEqual(
      dump([() => {}, 'a'], { flowLevel: -1, skipInvalid: true }),
      '- a\n')

    assert.strictEqual(
      dump({ a: () => {}, b: 'a' }, { flowLevel: 0, skipInvalid: true }),
      '{b: a}\n')

    assert.strictEqual(
      dump({ a: () => {}, b: 'a' }, { flowLevel: -1, skipInvalid: true }),
      'b: a\n')
  })
})
