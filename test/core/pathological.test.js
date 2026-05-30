'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const { pathToFileURL } = require('node:url')
const yaml = require('js-yaml')
const workerpool = require('workerpool')

// Resolved in the main thread; passed into the worker since the worker's
// eval scope has no `require`. `import()` is syntax, so it survives eval.
const yamlUrl = pathToFileURL(require.resolve('js-yaml')).href

async function loadYamlInWorker (doc, url, options) {
  const mod = await import(url)
  ;(mod.default || mod).load(doc, options)
}

function assertYamlException (fn, pattern) {
  try {
    fn()
  } catch (error) {
    assert(
      error instanceof yaml.YAMLException,
      `expected YAMLException, got ${error.name}`
    )
    if (pattern) assert.match(error.message, pattern)
    return
  }

  assert.fail('expected YAMLException')
}

function createRepeatedMergeAliasPattern (repetitions, keys) {
  const src = Array.from({ length: keys }, (_, i) => `k${i}: 0`).join(', ')

  return `
a: &a {${src}}
b: { <<: [ ${'*a, '.repeat(repetitions - 1)}*a ] }
`
}

describe('Pathological tests', function () {
  describe('Deep nesting', function () {
    it('throws YAMLException on deep array nesting (not stack overflow error)', function () {
      assertYamlException(function () { yaml.load('['.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })

    it('throws YAMLException on deep object nesting (not stack overflow error)', function () {
      assertYamlException(function () { yaml.load('{a: '.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })
  })

  describe('Merge aliases', function () {
    it('loads repeated merge aliases with many keys', async function () {
      const doc = createRepeatedMergeAliasPattern(100000, 100000)
      const pool = workerpool.pool()
      try {
        await pool.exec(loadYamlInWorker, [doc, yamlUrl, { maxMergeSeqLength: 1000000 }]).timeout(2000)
      } finally {
        await pool.terminate()
      }
    })

    it('throws YAMLException on long merge sequence (over maxMergeSeqLength)', function () {
      assertYamlException(function () {
        yaml.load(`
a: &a { k: 0 }
b: { <<: [ ${'*a, '.repeat(20)}*a ] }
`)
      }, /merge sequence length exceeded maxMergeSeqLength/)
    })
  })
})
