'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Loading multidocument source using `load` should cause an error', function () {
  assert.throws(function () {
    yaml.load('--- # first document\n--- # second document\n')
  }, yaml.YAMLException)

  assert.throws(function () {
    yaml.load('---\nfoo: bar\n---\nfoo: bar\n')
  }, yaml.YAMLException)

  assert.throws(function () {
    yaml.load('foo: bar\n---\nfoo: bar\n')
  }, yaml.YAMLException)
})
