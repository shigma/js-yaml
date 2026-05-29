'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

function SuccessSignal () {}

const TestClassYaml = new yaml.Type('!test', {
  kind: 'scalar',
  resolve: function () { throw new SuccessSignal() }
})

const TEST_SCHEMA = yaml.DEFAULT_SCHEMA.extend([TestClassYaml])

it('Resolving of empty nodes are skipped in some cases', function () {
  assert.throws(function () { yaml.load('- foo: !test\n- bar: baz', { schema: TEST_SCHEMA }) }, SuccessSignal)
})
