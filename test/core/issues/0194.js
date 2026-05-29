'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Don\'t throw on warning', function () {
  const src = `
foo: {
    bar: true
}
`
  const warnings = []

  const data = yaml.load(src)

  assert.deepStrictEqual(data, { foo: { bar: true } })

  yaml.load(src, { onWarning: function (e) { warnings.push(e) } })

  assert.strictEqual(warnings.length, 1)
})
