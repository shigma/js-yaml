import { describe, it } from 'node:test'

import assert from 'node:assert'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { loadAll } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Loader', () => {
  const samplesDir = path.resolve(__dirname, 'samples-common')

  fs.readdirSync(samplesDir).forEach((sampleFile) => {
    if (path.extname(sampleFile) !== '.mjs') return // continue

    const sampleName = path.basename(sampleFile, '.mjs')
    const yamlFile = path.resolve(samplesDir, `${sampleName}.yml`)

    it(sampleName, async function () {
      const expected = (await import(pathToFileURL(path.resolve(samplesDir, sampleFile)).href)).default
      let actual = []

      loadAll(fs.readFileSync(yamlFile, { encoding: 'utf8' }), (doc) => { actual.push(doc) }, {
        filename: yamlFile
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
