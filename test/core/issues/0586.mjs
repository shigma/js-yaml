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
    let result = dump(this.data, Object.assign({ schema }, this.opts))
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

  const result = dump({
    flow_choices: CustomDump([1, 2], { flowLevel: 0 }),
    block_choices: CustomDump([4, 5], { flowLevel: Infinity })
  }, { schema }).trim()

  assert.strictEqual(result, `
flow_choices: [1, 2]
block_choices:
- 4
- 5`.replace(/^\n/, ''))
})
