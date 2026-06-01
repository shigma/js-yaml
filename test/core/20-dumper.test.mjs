import { describe, it } from 'node:test'

import assert from 'node:assert'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dump, load } from 'js-yaml'

import { TEST_SCHEMA } from './support/schema.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Dumper', function () {
  const samplesDir = path.resolve(__dirname, 'samples-common')

  fs.readdirSync(samplesDir).forEach(function (sampleFile) {
    if (path.extname(sampleFile) !== '.mjs') return // continue

    const sampleName = path.basename(sampleFile, '.mjs')

    it(sampleName, async function () {
      const sample = (await import(pathToFileURL(path.resolve(samplesDir, sampleFile)).href)).default
      const data = typeof sample === 'function' ? sample.expected : sample
      const serialized = dump(data, { schema: TEST_SCHEMA })
      const deserialized = load(serialized, { schema: TEST_SCHEMA })

      if (typeof sample === 'function') {
        sample.call(this, deserialized)
      } else {
        assert.deepStrictEqual(deserialized, sample)
      }
    })
  })
})
