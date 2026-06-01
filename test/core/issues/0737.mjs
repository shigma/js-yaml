import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Should not resolve out-of-range floats as Infinity implicitly', function () {
  assert.deepStrictEqual(load('gitsha: 61e9540'), { gitsha: '61e9540' })

  assert.deepStrictEqual(load('too_big_positive: 1e309'), { too_big_positive: '1e309' })
  assert.deepStrictEqual(load('too_big_negative: -1e309'), { too_big_negative: '-1e309' })

  assert.deepStrictEqual(load('finite: 1e308'), { finite: 1e308 })
})

it('Should continue to resolve explicit infinity and nan literals', function () {
  const actual = load('positive: .inf\nnegative: -.inf\nnan: .nan')

  assert.strictEqual(actual.positive, Number.POSITIVE_INFINITY)
  assert.strictEqual(actual.negative, Number.NEGATIVE_INFINITY)
  assert(Number.isNaN(actual.nan))
})

it('Should reject out-of-range floats with explicit float tag', function () {
  assert.throws(function () {
    load('value: !!float 1e309')
  }, /cannot resolve a node with !<tag:yaml\.org,2002:float> explicit tag/)

  assert.deepStrictEqual(load('value: !!float .inf'), { value: Number.POSITIVE_INFINITY })
})

it('Should not resolve out-of-range integers as Infinity implicitly', function () {
  assert.deepStrictEqual(load('too_big_decimal: 1' + '0'.repeat(400)), {
    too_big_decimal: '1' + '0'.repeat(400)
  })

  assert.deepStrictEqual(load('too_big_binary: 0b' + '1'.repeat(2000)), {
    too_big_binary: '0b' + '1'.repeat(2000)
  })

  assert.deepStrictEqual(load('too_big_hex: 0x' + 'f'.repeat(400)), {
    too_big_hex: '0x' + 'f'.repeat(400)
  })

  assert.deepStrictEqual(load('finite: 0xFF'), { finite: 255 })
})

it('Should reject out-of-range integers with explicit int tag', function () {
  assert.throws(function () {
    load('value: !!int 1' + '0'.repeat(400))
  }, /cannot resolve a node with !<tag:yaml\.org,2002:int> explicit tag/)
})
