import { describe, it } from 'node:test'
import assert from 'node:assert'
import { load, YAMLException } from 'js-yaml'
import workerpool from 'workerpool'

// Resolved in the main thread; passed into the worker since the worker's
// eval scope has no `require`. `import()` is syntax, so it survives eval.
const yamlUrl = import.meta.resolve('js-yaml')

async function loadYamlInWorker (doc, url, options) {
  const mod = await import(url)
  mod.load(doc, options)
}

function assertYamlException (fn, pattern) {
  try {
    fn()
  } catch (error) {
    assert(
      error instanceof YAMLException,
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

describe('Pathological tests', () => {
  describe('Deep nesting', () => {
    it('throws YAMLException on deep array nesting (not stack overflow error)', () => {
      assertYamlException(() => { load('['.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })

    it('throws YAMLException on deep object nesting (not stack overflow error)', () => {
      assertYamlException(() => { load('{a: '.repeat(100000)) },
        /nesting exceeded maxDepth/)
    })
  })

  describe('Merge aliases', () => {
    it('loads repeated merge aliases with many keys', async () => {
      const doc = createRepeatedMergeAliasPattern(100000, 100000)
      const pool = workerpool.pool()
      try {
        await pool.exec(loadYamlInWorker, [doc, yamlUrl, { maxMergeSeqLength: 1000000 }]).timeout(2000)
      } finally {
        await pool.terminate()
      }
    })

    it('throws YAMLException on long merge sequence (over maxMergeSeqLength)', () => {
      assertYamlException(() => {
        load(`
a: &a { k: 0 }
b: { <<: [ ${'*a, '.repeat(20)}*a ] }
`)
      }, /merge sequence length exceeded maxMergeSeqLength/)
    })
  })
})
