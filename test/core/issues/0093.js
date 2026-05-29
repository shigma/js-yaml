'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Unwanted line breaks in folded scalars', function () {
  const data = yaml.load(`
first: >
  a
  b
    c
    d
  e
  f

second: >
  a
  b
    c

    d
  e
  f

third: >
  a
  b

    c
    d
  e
  f
`)

  assert.strictEqual(data.first, 'a b\n  c\n  d\ne f\n')
  assert.strictEqual(data.second, 'a b\n  c\n\n  d\ne f\n')
  assert.strictEqual(data.third, 'a b\n\n  c\n  d\ne f\n')
})
