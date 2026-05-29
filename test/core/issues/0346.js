'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should not emit spaces in arrays in flow mode between entries using condenseFlow: true', function () {
  const array = ['a', 'b']
  const dumpedArray = yaml.dump(array, { flowLevel: 0, indent: 0, condenseFlow: true })
  assert.strictEqual(
    dumpedArray,
    '[a,b]\n'
  )
  assert.deepStrictEqual(yaml.load(dumpedArray), array)
})

it('should not emit spaces between key: value and quote keys using condenseFlow: true', function () {
  const object = { a: { b: 'c', d: 'e' } }
  const objectDump = yaml.dump(object, { flowLevel: 0, indent: 0, condenseFlow: true })
  assert.strictEqual(
    objectDump,
    '{"a":{"b":c, "d":e}}\n'
  )
  assert.deepStrictEqual(yaml.load(objectDump), object)
})
