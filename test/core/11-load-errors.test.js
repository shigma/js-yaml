'use strict'

const { describe, it } = require('node:test')

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const TEST_SCHEMA = require('./support/schema').TEST_SCHEMA

describe('Load errors', function () {
  const samplesDir = path.resolve(__dirname, 'samples-load-errors')

  fs.readdirSync(samplesDir).forEach(function (sampleName) {
    const yamlFile = path.resolve(samplesDir, sampleName)

    it(path.basename(sampleName, '.yml'), function () {
      const yamlSource = fs.readFileSync(yamlFile, { encoding: 'utf8' })

      assert.throws(function () {
        yaml.loadAll(
          yamlSource,
          function () {},
          {
            filename: yamlFile,
            schema: TEST_SCHEMA,
            onWarning: function (e) { throw e }
          }
        )
      }, yaml.YAMLException, yamlFile)
    })
  })
})
