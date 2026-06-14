import { it } from 'node:test'
import assert from 'node:assert/strict'

import { load } from '../../../src/load.ts'
import { jsToAst } from '../../../src/ast/from_js.ts'
import { present } from '../../../src/ast/presenter.ts'
import { CORE_SCHEMA } from '../../../src/schema.ts'

it('keeps quoteFlowKeys outside an explicit long flow key', () => {
  const key = `${'a'.repeat(1024)}\nb`
  const node = jsToAst({ [key]: 'value' }, CORE_SCHEMA)

  assert.equal(node?.kind, 'mapping')
  node.style.flow = true

  const output = present([{ contents: node }], { schema: CORE_SCHEMA, quoteFlowKeys: true })

  assert.equal(output, `{? "${'a'.repeat(1024)}\\nb": value}\n`)
  assert.deepEqual(load(output, { schema: CORE_SCHEMA }), { [key]: 'value' })
})
