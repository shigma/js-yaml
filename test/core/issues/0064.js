'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')
const readFileSync = require('fs').readFileSync

it('Wrong error message when yaml file contains tabs', function () {
  assert.doesNotThrow(
    function () { yaml.load(readFileSync(require('path').join(__dirname, '/0064.yml'), 'utf8')) },
    yaml.YAMLException)
})
