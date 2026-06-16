import { describe, it } from 'node:test'

import assert from 'node:assert/strict'
import { CORE_SCHEMA, defineScalarTag, dump, load, NOT_RESOLVED } from 'js-yaml'

describe('dump options', () => {
  describe('seqNoIndent', () => {
    it('keeps nested array/object layout stable', () => {
      assert.equal(
        dump([
          {
            a: 'a_val',
            b: 'b_val'
          },
          {
            a: 'a2_val',
            items: [
              {
                a: 'a_a_val',
                b: 'a_b_val'
              }
            ]
          }
        ], { seqNoIndent: true }),
        '- a: a_val\n  b: b_val\n- a: a2_val\n  items:\n  - a: a_a_val\n    b: a_b_val\n'
      )
    })
  })
})

describe('dump semantic tags', () => {
  it('quotes strings that would resolve as another tag', () => {
    assert.equal(dump('true'), "'true'\n")
    assert.equal(dump('42'), "'42'\n")
    assert.equal(dump('0x1234'), "'0x1234'\n")
  })

  it('dumps typed scalars plain and round-trips them', () => {
    const value = {
      bool: true,
      int: 42,
      nil: null
    }
    const dumped = dump(value)

    assert.equal(dumped, 'bool: true\nint: 42\nnil: null\n')
    assert.deepEqual(load(dumped), value)
  })

  it('prints an explicit tag when custom represented text does not resolve implicitly', () => {
    class CustomScalar {
      constructor (value) {
        this.value = value
      }
    }

    const customTag = defineScalarTag('!custom', {
      implicit: true,
      resolve: () => NOT_RESOLVED,
      identify: value => value instanceof CustomScalar,
      represent: value => value.value
    })

    const schema = CORE_SCHEMA.withTags(customTag)

    assert.equal(
      dump({ value: new CustomScalar('plain text') }, { schema }),
      "value: !custom 'plain text'\n"
    )
  })
})
