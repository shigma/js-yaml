import { describe, it } from 'node:test'

import assert from 'node:assert'
import fc from 'fast-check'
import { dump, load } from 'js-yaml'

// Generate valid YAML instances for yaml.safeDump
const key = fc.string({ unit: fc.nat({ max: 0xffff }).map(n => String.fromCharCode(n)) })
const values = [
  key, fc.boolean(), fc.integer(), fc.double(),
  fc.constantFrom(null, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY)
]
const yamlArbitrary = fc.object({ key: key, values: values })

// Generate valid options for yaml.safeDump configuration
const dumpOptionsArbitrary = fc.record({
  skipInvalid: fc.boolean(),
  sortKeys: fc.boolean(),
  noRefs: fc.boolean(),
  noCompatMode: fc.boolean(),
  condenseFlow: fc.boolean(),
  indent: fc.integer({ min: 1, max: 80 }),
  flowLevel: fc.integer({ min: -1, max: 10 }),
  styles: fc.record({
    '!!null': fc.constantFrom('lowercase', 'canonical', 'uppercase', 'camelcase'),
    '!!int': fc.constantFrom('decimal', 'binary', 'octal', 'hexadecimal'),
    '!!bool': fc.constantFrom('lowercase', 'uppercase', 'camelcase'),
    '!!float': fc.constantFrom('lowercase', 'uppercase', 'camelcase')
  }, { requiredKeys: [] })
}, { requiredKeys: [] })
  .map(function (instance) {
    if (instance.condenseFlow === true && instance.flowLevel !== undefined) { instance.flowLevel = -1 }
    return instance
  })

describe('Properties', function () {
  it('Load from dumped should be the original object', function () {
    fc.assert(fc.property(
      yamlArbitrary,
      dumpOptionsArbitrary,
      function (obj, dumpOptions) {
        const yamlContent = dump(obj, dumpOptions)
        assert.ok(typeof yamlContent === 'string')
        assert.deepStrictEqual(load(yamlContent), obj)
      }))
  })
})
