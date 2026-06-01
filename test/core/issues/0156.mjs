import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, Type } from 'js-yaml'

function SuccessSignal () {}

const TestClassYaml = new Type('!test', {
  kind: 'scalar',
  resolve: () => { throw new SuccessSignal() }
})

const TEST_SCHEMA = DEFAULT_SCHEMA.extend([TestClassYaml])

it('Resolving of empty nodes are skipped in some cases', () => {
  assert.throws(() => { load('- foo: !test\n- bar: baz', { schema: TEST_SCHEMA }) }, SuccessSignal)
})
