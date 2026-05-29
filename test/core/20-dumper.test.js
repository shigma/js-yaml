'use strict'

const { describe, it } = require('node:test')

const assert = require('assert')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const TEST_SCHEMA = require('./support/schema').TEST_SCHEMA

describe('Dumper', function () {
  const samplesDir = path.resolve(__dirname, 'samples-common')

  fs.readdirSync(samplesDir).forEach(function (jsFile) {
    if (path.extname(jsFile) !== '.js') return // continue

    it(path.basename(jsFile, '.js'), function () {
      const sample = require(path.resolve(samplesDir, jsFile))
      const data = typeof sample === 'function' ? sample.expected : sample
      const serialized = yaml.dump(data, { schema: TEST_SCHEMA })
      const deserialized = yaml.load(serialized, { schema: TEST_SCHEMA })

      if (typeof sample === 'function') {
        sample.call(this, deserialized)
      } else {
        assert.deepStrictEqual(deserialized, sample)
      }
    })
  })
})
