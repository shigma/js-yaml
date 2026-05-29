'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should properly dump negative ints in different styles', function () {
  let dump
  const src = { integer: -100 }

  dump = yaml.dump(src, { styles: { '!!int': 'binary' } })
  assert.deepStrictEqual(yaml.load(dump), src)

  dump = yaml.dump(src, { styles: { '!!int': 'octal' } })
  assert.deepStrictEqual(yaml.load(dump), src)

  dump = yaml.dump(src, { styles: { '!!int': 'hex' } })
  assert.deepStrictEqual(yaml.load(dump), src)
})
