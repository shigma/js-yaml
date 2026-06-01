import { describe, it } from 'node:test'

import assert from 'node:assert'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { loadAll, YAMLException } from 'js-yaml'

import { TEST_SCHEMA } from './support/schema.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Load errors', function () {
  const samplesDir = path.resolve(__dirname, 'samples-load-errors')

  fs.readdirSync(samplesDir).forEach(function (sampleName) {
    const yamlFile = path.resolve(samplesDir, sampleName)

    it(path.basename(sampleName, '.yml'), function () {
      const yamlSource = fs.readFileSync(yamlFile, { encoding: 'utf8' })

      assert.throws(function () {
        loadAll(
          yamlSource,
          function () {},
          {
            filename: yamlFile,
            schema: TEST_SCHEMA,
            onWarning: function (e) { throw e }
          }
        )
      }, YAMLException, yamlFile)
    })
  })
})
