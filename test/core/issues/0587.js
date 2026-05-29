'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('Should not encode astral characters', function () {
  assert.strictEqual(yaml.dump('😃😊'), '😃😊\n')
})
