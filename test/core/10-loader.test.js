'use strict'

const { describe, it } = require('node:test')

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const TEST_SCHEMA = require('./support/schema').TEST_SCHEMA

describe('Loader', function () {
  const samplesDir = path.resolve(__dirname, 'samples-common')

  fs.readdirSync(samplesDir).forEach(function (jsFile) {
    if (path.extname(jsFile) !== '.js') return // continue

    const yamlFile = path.resolve(samplesDir, path.basename(jsFile, '.js') + '.yml')

    it(path.basename(jsFile, '.js'), function () {
      const expected = require(path.resolve(samplesDir, jsFile))
      let actual = []

      yaml.loadAll(fs.readFileSync(yamlFile, { encoding: 'utf8' }), function (doc) { actual.push(doc) }, {
        filename: yamlFile,
        schema: TEST_SCHEMA
      })

      if (actual.length === 1) actual = actual[0]

      if (typeof expected === 'function') {
        expected.call(this, actual)
      } else {
        assert.deepStrictEqual(actual, expected)
      }
    })
  })
})
