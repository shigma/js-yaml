'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('refactor compact variant of MarkedYAMLError.toString', function () {
  const source = `
foo: {bar} baz
`

  assert.throws(function () {
    yaml.load(source)
  }, "require('issue-33.yml') should throw, but it does not")
})
