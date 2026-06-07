import { describe, it } from 'node:test'

import assert from 'node:assert'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dump, load } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Dumper', () => {
  const samplesDir = path.resolve(__dirname, 'samples-common')

  fs.readdirSync(samplesDir).forEach((sampleFile) => {
    if (path.extname(sampleFile) !== '.mjs') return // continue

    const sampleName = path.basename(sampleFile, '.mjs')

    it(sampleName, async function () {
      const sample = (await import(pathToFileURL(path.resolve(samplesDir, sampleFile)).href)).default
      const data = typeof sample === 'function' ? sample.expected : sample
      const serialized = dump(data)
      const deserialized = load(serialized)

      if (typeof sample === 'function') {
        sample.call(this, deserialized)
      } else {
        assert.deepStrictEqual(deserialized, sample)
      }
    })
  })
})
