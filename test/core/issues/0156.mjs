import { it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, load, defineScalarTag } from 'js-yaml'

function SuccessSignal () {}

const TestClassYaml = defineScalarTag('!test', {
  resolve: () => { throw new SuccessSignal() }
})

const TEST_SCHEMA = CORE_SCHEMA.withTags(TestClassYaml)

it('Resolving of empty nodes are skipped in some cases', () => {
  assert.throws(() => { load('- foo: !test\n- bar: baz', { schema: TEST_SCHEMA }) }, SuccessSignal)
})
