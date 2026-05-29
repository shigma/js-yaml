'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Empty block scalars loaded wrong', function () {
  assert.deepStrictEqual(yaml.load('a: |\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: |+\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: |-\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(yaml.load('a: >\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: >+\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: >-\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(yaml.load('a: |\n\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: |+\n\nb: .'), { a: '\n', b: '.' })
  assert.deepStrictEqual(yaml.load('a: |-\n\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(yaml.load('a: >\n\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(yaml.load('a: >+\n\nb: .'), { a: '\n', b: '.' })
  assert.deepStrictEqual(yaml.load('a: >-\n\nb: .'), { a: '', b: '.' })
})
