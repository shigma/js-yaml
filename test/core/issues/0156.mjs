import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, NODE_KIND_SCALAR, createType } from 'js-yaml'

function SuccessSignal () {}

const TestClassYaml = createType('!test', {
  nodeKind: NODE_KIND_SCALAR,
  resolve: () => { throw new SuccessSignal() }
})

const TEST_SCHEMA = DEFAULT_SCHEMA.extend([TestClassYaml])

it('Resolving of empty nodes are skipped in some cases', () => {
  assert.throws(() => { load('- foo: !test\n- bar: baz', { schema: TEST_SCHEMA }) }, SuccessSignal)
})
