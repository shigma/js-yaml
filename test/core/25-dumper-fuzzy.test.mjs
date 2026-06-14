import { describe, it } from 'node:test'

import assert from 'node:assert'
import fc from 'fast-check'
import { dump, load } from 'js-yaml'

// Generate valid YAML instances for yaml.safeDump
const key = fc.string({ unit: fc.nat({ max: 0xffff }).map(n => String.fromCharCode(n)) })
const number = fc.oneof(
  fc.integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }),
  fc.double().filter(n => !Number.isInteger(n) || Number.isSafeInteger(n))
)
const values = [
  key, fc.boolean(), number,
  fc.constantFrom(null, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
]
const yamlArbitrary = fc.object({ key: key, values: values })

// Generate valid options for yaml.safeDump configuration
const dumpOptionsArbitrary = fc.record({
  skipInvalid: fc.boolean(),
  sortKeys: fc.boolean(),
  noRefs: fc.boolean(),
  indent: fc.integer({ min: 1, max: 80 }),
  seqNoIndent: fc.boolean(),
  seqInlineFirst: fc.boolean(),
  quoteStyle: fc.constantFrom('auto', 'single', 'double'),
  flowBracketPadding: fc.boolean(),
  flowSkipCommaSpace: fc.boolean(),
  flowSkipColonSpace: fc.boolean(),
  quoteFlowKeys: fc.boolean()
}, { requiredKeys: [] })

describe('Properties', () => {
  it('Load from dumped should be the original object', () => {
    fc.assert(fc.property(
      yamlArbitrary,
      dumpOptionsArbitrary,
      (obj, dumpOptions) => {
        const yamlContent = dump(obj, dumpOptions)
        assert.ok(typeof yamlContent === 'string')
        assert.deepStrictEqual(load(yamlContent), obj)
      }))
  })
})
