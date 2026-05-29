'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should properly dump leading newlines and spaces', function () {
  let src = { str: '\n  a\nb' }
  let dump = yaml.dump(src)
  assert.deepStrictEqual(yaml.load(dump), src)

  src = { str: '\n\n  a\nb' }
  dump = yaml.dump(src)
  assert.deepStrictEqual(yaml.load(dump), src)

  src = { str: '\n  a\nb' }
  dump = yaml.dump(src, { indent: 10 })
  assert.deepStrictEqual(yaml.load(dump), src)
})
