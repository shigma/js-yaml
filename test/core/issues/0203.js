'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Don\'t throw on warning', function () {
  const src = `
test: |-


  Hello
  world
`

  assert.deepStrictEqual(yaml.load(src), { test: '\n\nHello\nworld' })
})
