import { it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, defineScalarTag, NOT_RESOLVED } from 'js-yaml'

it('Should allow custom formatting through implicit custom tags', () => {
  function CustomDump (data, opts) {
    if (!(this instanceof CustomDump)) return new CustomDump(data, opts)
    this.data = data
    this.opts = opts
  }

  CustomDump.prototype.represent = function () {
    let result = dump(this.data, Object.assign({ replacer, schema }, this.opts))
    result = result.trim()
    if (result.includes('\n')) result = `\n${result}`
    return result
  }

  const CustomDumpType = defineScalarTag('!format', {
    implicit: true,
    resolve: () => NOT_RESOLVED,
    identify: d => d instanceof CustomDump,
    represent: d => d.represent()
  })

  const schema = CORE_SCHEMA.withTags(CustomDumpType)

  function replacer (key, value) {
    if (key === '') return value // top-level, don't change this
    if (key === 'flow_choices') return CustomDump(value, { flowLevel: 0 })
    if (key === 'block_choices') return CustomDump(value, { flowLevel: Infinity })
    return value // default
  }

  const result = CustomDump({ flow_choices: [1, 2], block_choices: [4, 5] }).represent().trim()

  assert.strictEqual(result, `
flow_choices: [1, 2]
block_choices:
- 4
- 5`.replace(/^\n/, ''))
})
